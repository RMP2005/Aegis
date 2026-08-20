import os
import json
import logging
import subprocess
import tempfile
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)


class SlitherResult:
    def __init__(self, vulnerabilities: list[dict], raw_output: str):
        self.vulnerabilities = vulnerabilities
        self.raw_output = raw_output


def _map_detector_type_to_title(detector_type: str) -> str:
    mapping = {
        "reentrancy-eth": "Reentrancy Vulnerability",
        "reentrancy-no-eth": "Reentrancy Vulnerability",
        "reentrancy-benign": "Reentrancy Vulnerability",
        "reentrancy-events": "Reentrancy Vulnerability",
        "arbitrary-send": "Arbitrary Ether Transfer",
        "arbitrary-send-eth": "Arbitrary Ether Transfer",
        "arbitrary-send-erc20": "Arbitrary ERC20 Transfer",
        "arbitrary-send-erc20-extract": "Arbitrary ERC20 Transfer",
        "unchecked-transfer": "Unchecked Return Value",
        "unchecked-lowlevel": "Unchecked Low-Level Call",
        "unchecked-send": "Unchecked Send",
        "integer-overflow": "Integer Overflow",
        "integer-underflow": "Integer Underflow",
        "tx-origin": "tx.origin Usage",
        "tx-origin-button": "tx.origin for Auth",
        "pragma": "Pragma Version",
        "constable-states": "State Variable Could Be Constant",
        "external-function": "External Function",
        "locked-ether": "Locked Ether",
        "suicide": "Self-Destruct",
        "suicide-selfdestruct": "Self-Destruct",
        "dangerous-delegatecall": "Dangerous Delegatecall",
        "delegatecall": "Delegatecall to Untrusted Target",
        "tautology": "Tautological Comparison",
        "divisible-by": "Divisible By Zero",
        "incorrect-equality": "Incorrect Equality",
        "multiple-loads": "Multiple Storage Reads",
        "reentrancy": "Reentrancy Vulnerability",
        "shadowing-local": "Shadowing State Variable",
        "timestamp": "Block Timestamp Dependency",
        "assembly": "Assembly Usage",
        "calls": "Low-Level Calls",
        "solc-version": "Solc Version",
        "naming-conventions": "Naming Convention",
        "conformance-to-solidity-naming-conventions": "Naming Convention",
        "spelling": "Spelling",
        "immutable-states": "Immutable Variables",
        "cyclomatic-complexity": "Cyclomatic Complexity",
        "function-init": "Variable Initialization",
        "codegen": "Code Generation",
    }
    return mapping.get(detector_type, detector_type.replace("-", " ").title())


def _map_to_severity(impact: str, confidence: str) -> str:
    impact = impact.lower() if impact else "unknown"
    confidence = confidence.lower() if confidence else "unknown"
    if impact == "high":
        return "critical"
    if impact == "medium":
        return "high"
    if impact == "low":
        if confidence == "high":
            return "medium"
        return "low"
    return "low"


def _generate_explanation(vuln: dict) -> str:
    title = vuln.get("title", "")
    check = vuln.get("check", "")
    description = vuln.get("description", "")
    if description:
        return description
    if "reentrancy" in check.lower():
        return "This contract allows external calls before updating state variables. An attacker can re-enter the function before the first execution completes, potentially draining funds."
    if "tx.origin" in check.lower():
        return "Using tx.origin for authorization is dangerous. If a user calls a malicious contract, that contract can call this contract and pass the tx.origin check."
    if "arbitrary" in check.lower():
        return "This contract allows transfer of tokens or ether to arbitrary addresses, which could be exploited by an attacker."
    if "integer" in check.lower():
        return "Arithmetic operations can overflow or underflow, leading to unexpected behavior and potential loss of funds."
    if "unchecked" in check.lower():
        return "Return values from low-level calls are not checked, potentially masking failed operations."
    if "selfdestruct" in check.lower():
        return "The selfdestruct instruction can be used to forcibly send ether to any address and destroy the contract."
    if "delegatecall" in check.lower():
        return "Delegatecall to untrusted contracts can execute arbitrary code in the context of this contract's storage."
    return f"Security issue detected: {title}"


def _generate_exploit_path(vuln: dict) -> str:
    check = vuln.get("check", "").lower()
    if "reentrancy" in check:
        return "Attacker deploys malicious contract → Calls vulnerable function → Malicious fallback re-enters before state update → Drains contract balance"
    if "tx.origin" in check:
        return "Attacker creates malicious contract → Victim calls attacker contract → Attacker contract calls target → tx.origin matches victim, bypassing auth"
    if "arbitrary" in check:
        return "Attacker triggers function with crafted parameters → Contract transfers value to attacker-controlled address → Funds extracted"
    if "integer" in check:
        return "Attacker provides crafted input → Arithmetic overflow/underflow occurs → Balance or state corrupted → Unexpected behavior exploited"
    if "unchecked" in check:
        return "Attacker triggers operation that fails silently → Contract continues execution assuming success → State becomes inconsistent"
    if "selfdestruct" in check:
        return "Attacker deploys contract with selfdestruct → Calls selfdestruct sending ETH to target → Contract destroyed, balance force-sent"
    if "delegatecall" in check:
        return "Attacker provides malicious contract address → Delegatecall executes attacker code in contract context → Storage overwritten, funds stolen"
    return "Attacker identifies and exploits the vulnerability through crafted interactions with the contract."


def _generate_recommendation(vuln: dict) -> str:
    check = vuln.get("check", "").lower()
    if "reentrancy" in check:
        return "Apply the Checks-Effects-Interactions pattern: update state before making external calls. Consider using OpenZeppelin's ReentrancyGuard."
    if "tx.origin" in check:
        return "Replace tx.origin with msg.sender for authorization checks. tx.origin should only be used for preventing contract-to-contract calls when explicitly desired."
    if "arbitrary" in check:
        return "Restrict transfer recipients to approved addresses. Implement access controls and validate all destination addresses."
    if "integer" in check:
        return "Use SafeMath library or Solidity 0.8+ built-in overflow checks. Add explicit bounds checking for critical calculations."
    if "unchecked" in check:
        return "Always check return values from low-level calls (call, send, transfer). Use require statements to handle failures."
    if "selfdestruct" in check:
        return "Remove selfdestruct unless absolutely necessary. If required, implement strict access controls and consider upgradeable patterns."
    if "delegatecall" in check:
        return "Never use delegatecall with untrusted contracts. Ensure the target contract is verified and its interface matches expectations."
    return "Review the flagged code and apply appropriate security measures based on the specific vulnerability."


def _normalize_results(data: dict[str, Any]) -> list[dict]:
    vulnerabilities = []
    results = data.get("results", {})
    detectors = results.get("detectors", [])

    for detector in detectors:
        impact = detector.get("impact", "Medium")
        confidence = detector.get("confidence", "Medium")
        check = detector.get("check", "")
        description = detector.get("description", "")
        filename = ""
        line = 0
        elements = detector.get("elements", [])
        if elements:
            for elem in elements:
                source = elem.get("source_mapping", {})
                filename_relative = source.get("filename_relative", "")
                lines = source.get("lines", [])
                if filename_relative and filename_relative.endswith(".sol"):
                    filename = filename_relative
                    if lines:
                        line = lines[0]
                    break

        title = _map_detector_type_to_title(check)
        severity = _map_to_severity(impact, confidence)

        vuln = {
            "severity": severity,
            "title": title,
            "location": f"{filename}:{line}" if filename else "Unknown",
            "line": line,
            "explanation": _generate_explanation({"title": title, "check": check, "description": description}),
            "exploit_path": _generate_exploit_path({"check": check}),
            "recommendation": _generate_recommendation({"check": check}),
        }
        vulnerabilities.append(vuln)

    return vulnerabilities


def run_slither(source_code: str, filename: str = "Contract.sol") -> SlitherResult:
    with tempfile.TemporaryDirectory() as tmpdir:
        tmpdir_path = Path(tmpdir).resolve()
        contract_path = (tmpdir_path / filename).resolve()

        if not str(contract_path).startswith(str(tmpdir_path)):
            raise ValueError("Path traversal detected in filename")

        contract_path.write_text(source_code)

        result = subprocess.run(
            ["slither", str(contract_path), "--json", "-"],
            capture_output=True,
            text=True,
            timeout=120,
        )

        output = result.stdout + result.stderr

        if result.returncode != 0 and not output.strip():
            return SlitherResult(
                vulnerabilities=[],
                raw_output=f"Slither exited with code {result.returncode}: {result.stderr}",
            )

        try:
            json_data = json.loads(output) if output.strip() else {}
            vulnerabilities = _normalize_results(json_data)
        except json.JSONDecodeError:
            if result.returncode != 0:
                raise RuntimeError(f"Slither failed: {result.stderr[:500]}")
            logger.warning("Slither produced non-JSON output, returning empty results")
            vulnerabilities = []

        return SlitherResult(vulnerabilities=vulnerabilities, raw_output=output)


def check_slither_available() -> bool:
    try:
        result = subprocess.run(
            ["slither", "--version"],
            capture_output=True,
            text=True,
            timeout=10,
        )
        return result.returncode == 0
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False
