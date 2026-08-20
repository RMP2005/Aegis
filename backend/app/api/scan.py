import json
import logging
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, HTTPException

from ..models.schemas import ScanRequest, ScanResponse, Vulnerability
from ..security import validate_solidity_code, validate_filename, sanitize_output
from ..services.slither import run_slither
from ..services.agent import analyze_with_ai, calculate_score, generate_summary

logger = logging.getLogger(__name__)

router = APIRouter()

REPORTS_DIR = Path(os.environ.get("REPORTS_DIR", str(Path(__file__).resolve().parent.parent.parent.parent / "reports")))
REPORTS_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/scan", response_model=ScanResponse)
async def scan_contract(request: ScanRequest):
    source_code = request.source_code.strip()

    if not source_code:
        raise HTTPException(status_code=400, detail="Source code cannot be empty")

    if "pragma solidity" not in source_code and "contract " not in source_code:
        raise HTTPException(
            status_code=400,
            detail="Invalid Solidity code. Expected pragma solidity declaration or contract definition.",
        )

    try:
        filename = validate_filename(request.filename)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    validate_solidity_code(source_code)

    stages = [
        "Compiling contract...",
        "Running static analysis with Slither...",
        "AI analysis in progress...",
        "Generating report...",
    ]

    try:
        slither_result = run_slither(source_code, filename)
        vulnerabilities_raw = slither_result.vulnerabilities
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Static analysis failed: {str(e)}",
        )

    try:
        vulnerabilities = await analyze_with_ai(
            vulnerabilities_raw, source_code, filename
        )
    except Exception:
        vulnerabilities = vulnerabilities_raw

    score = calculate_score(vulnerabilities)
    summary = generate_summary(score, vulnerabilities)

    vuln_models = [
        Vulnerability(
            severity=v["severity"],
            title=v["title"],
            location=v["location"],
            line=v["line"],
            explanation=sanitize_output(v["explanation"]),
            exploit_path=sanitize_output(v["exploit_path"]),
            recommendation=sanitize_output(v["recommendation"]),
        )
        for v in vulnerabilities
    ]

    response = ScanResponse(
        score=score,
        summary=summary,
        vulnerabilities=vuln_models,
        stages=stages,
    )

    report_id = f"{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}"
    report_path = REPORTS_DIR / f"{report_id}.json"
    try:
        report_path.write_text(json.dumps(response.model_dump(), indent=2))
    except OSError as e:
        logger.warning(f"Failed to write report to disk: {e}")

    return response
