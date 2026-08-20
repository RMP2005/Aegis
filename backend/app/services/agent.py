import os
import json
import logging

import httpx

logger = logging.getLogger(__name__)

MOCK_EXPLANATIONS = {
    "reentrancy": {
        "explanation": "The contract makes an external call before updating its state variables. This allows an attacker to re-enter the function through a malicious fallback, executing code before the balance is updated. This is one of the most critical vulnerabilities in Solidity and has led to significant losses in DeFi protocols.",
        "exploit_path": "Attacker deploys malicious contract with fallback → Calls withdraw() → Contract sends ETH to attacker → Fallback triggers withdraw() again → Repeat until contract drained",
        "recommendation": "Apply the Checks-Effects-Interactions pattern: validate conditions, update state variables, then make external calls. Use OpenZeppelin's ReentrancyGuard modifier on all functions with external calls."
    },
    "tx.origin": {
        "explanation": "Using tx.origin for authorization means any contract called by the legitimate user can impersonate them. If a user interacts with a malicious contract, that contract can forward the call to this contract and pass the authorization check.",
        "exploit_path": "Victim calls malicious contract → Malicious contract calls AegisVault.withdraw() → tx.origin is victim's address → Authorization passes → Funds stolen",
        "recommendation": "Replace tx.origin with msg.sender. Only use tx.origin when you specifically need to prevent contract-to-contract interaction."
    },
    "arbitrary": {
        "explanation": "The contract permits transfers to arbitrary addresses without sufficient validation. An attacker can craft transactions that redirect funds to their controlled addresses.",
        "exploit_path": "Attacker calls transfer function with recipient = attacker address → Contract validates insufficiently → Funds transferred to attacker",
        "recommendation": "Implement allowlist patterns for recipients. Validate all destination addresses against approved registries."
    },
    "integer": {
        "explanation": "Solidity does not automatically check for integer overflow/underflow. Arithmetic operations can wrap around, causing balances to become extremely large or zero unexpectedly.",
        "exploit_path": "Attacker triggers operation causing underflow → Balance wraps to MAX_UINT → Attacker withdraws more than deposited",
        "recommendation": "Use Solidity 0.8+ for built-in overflow checks, or use OpenZeppelin's SafeMath library for older versions."
    },
    "selfdestruct": {
        "explanation": "The selfdestruct instruction permanently destroys the contract and sends its remaining balance to a specified address. If accessible to unauthorized users, an attacker can destroy the contract or force-send ETH.",
        "exploit_path": "Attacker calls destroy() → Contract selfdestructs → All remaining ETH sent to attacker → Contract ceases to exist",
        "recommendation": "Remove selfdestruct unless strictly necessary. If required, implement multi-signature authorization and time-locked execution."
    },
    "delegatecall": {
        "explanation": "Delegatecall executes code from another contract in the context of the calling contract. If the target is untrusted, the attacker can overwrite critical storage variables including ownership and balances.",
        "exploit_path": "Attacker provides malicious contract as delegatecall target → Attacker's code executes in victim's storage context → Owner variable overwritten → Attacker gains ownership",
        "recommendation": "Never delegatecall to untrusted contracts. If delegatecall is required, ensure the target contract is immutable and verified."
    },
    "unchecked": {
        "explanation": "Low-level calls return a boolean indicating success, but the return value is not checked. Failed operations are silently ignored, which can lead to inconsistent state.",
        "exploit_path": "Operation fails silently → Contract assumes success → State variables not updated correctly → Subsequent operations based on incorrect state",
        "recommendation": "Always check return values from call(), send(), and transfer(). Use require() to revert on failure."
    },
    "locked": {
        "explanation": "The contract receives ether but has no function to withdraw it. Funds sent to this contract will be permanently locked.",
        "exploit_path": "User sends ETH to contract → No withdrawal function exists → ETH is permanently locked in contract",
        "recommendation": "Implement a withdrawal function with proper access controls, or accept that the contract is a one-way sink."
    },
    "default": {
        "explanation": "This is a security issue identified by static analysis. The flagged code pattern may lead to unexpected behavior, loss of funds, or contract compromise under certain conditions.",
        "exploit_path": "Attacker identifies the vulnerable pattern → Crafts a transaction to trigger the issue → Exploits the resulting unexpected behavior",
        "recommendation": "Review the flagged code against established security best practices. Consider a professional audit for contracts handling significant value."
    }
}


async def analyze_with_ai(
    vulnerabilities: list[dict],
    source_code: str,
    filename: str,
) -> list[dict]:
    api_key = os.environ.get("OPENAI_API_KEY", "")

    if not api_key:
        return _mock_analyze(vulnerabilities, source_code, filename)

    return await _api_analyze(vulnerabilities, source_code, filename, api_key)


async def _api_analyze(
    vulnerabilities: list[dict],
    source_code: str,
    filename: str,
    api_key: str,
) -> list[dict]:
    enhanced = []
    async with httpx.AsyncClient(timeout=30) as client:
        for vuln in vulnerabilities:
            prompt = f"""You are a senior smart contract security auditor. Analyze this vulnerability found in {filename}:

Vulnerability: {vuln['title']}
Severity: {vuln['severity']}
Location: {vuln['location']}

Source code context around the issue:
```
{source_code[:3000]}
```

Provide a detailed analysis with:
1. A clear explanation of why this is dangerous
2. A realistic attack scenario
3. A specific fix recommendation

Respond in JSON format:
{{
  "explanation": "...",
  "exploit_path": "...",
  "recommendation": "..."
}}"""

            try:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": "gpt-4o-mini",
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": 0.3,
                        "max_tokens": 500,
                    },
                )

                if response.status_code == 200:
                    data = response.json()
                    content = data["choices"][0]["message"]["content"]
                    parsed = json.loads(content)
                    vuln["explanation"] = parsed.get("explanation") or vuln["explanation"]
                    vuln["exploit_path"] = parsed.get("exploit_path") or vuln["exploit_path"]
                    vuln["recommendation"] = parsed.get("recommendation") or vuln["recommendation"]
            except Exception as e:
                logger.warning(f"AI analysis failed for vulnerability '{vuln['title']}': {e}")

            enhanced.append(vuln)

    return enhanced


def _mock_analyze(
    vulnerabilities: list[dict],
    source_code: str,
    filename: str,
) -> list[dict]:
    enhanced = []
    for vuln in vulnerabilities:
        check = vuln.get("title", "").lower()
        matched_key = "default"
        for key in MOCK_EXPLANATIONS:
            if key in check:
                matched_key = key
                break

        explanation_data = MOCK_EXPLANATIONS[matched_key]
        vuln["explanation"] = explanation_data["explanation"]
        vuln["exploit_path"] = explanation_data["exploit_path"]
        vuln["recommendation"] = explanation_data["recommendation"]
        enhanced.append(vuln)

    return enhanced


def calculate_score(vulnerabilities: list[dict]) -> int:
    if not vulnerabilities:
        return 100

    penalties = {
        "critical": 25,
        "high": 15,
        "medium": 8,
        "low": 3,
    }

    total_penalty = 0
    for v in vulnerabilities:
        sev = v["severity"]
        if sev not in penalties:
            logger.warning(f"Unknown severity '{sev}', treating as low")
        total_penalty += penalties.get(sev, 3)

    score = max(0, 100 - total_penalty)
    return score


def generate_summary(score: int, vulnerabilities: list[dict]) -> str:
    if not vulnerabilities:
        return "No security issues detected. The contract appears to follow safe patterns."

    counts = {}
    for v in vulnerabilities:
        sev = v["severity"]
        counts[sev] = counts.get(sev, 0) + 1

    parts = []
    for sev in ["critical", "high", "medium", "low"]:
        if sev in counts:
            parts.append(f"{counts[sev]} {sev}")

    severity_str = ", ".join(parts)

    if score >= 80:
        risk = "low overall risk"
    elif score >= 60:
        risk = "moderate risk"
    elif score >= 40:
        risk = "significant risk"
    else:
        risk = "critical risk — immediate action required"

    return f"Found {len(vulnerabilities)} issue(s) ({severity_str}). Score indicates {risk}."
