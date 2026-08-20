from pydantic import BaseModel, Field
from typing import Optional


class ScanRequest(BaseModel):
    source_code: str = Field(..., description="Solidity source code to analyze")
    filename: Optional[str] = Field(default="Contract.sol", description="Contract filename")


class Vulnerability(BaseModel):
    severity: str
    title: str
    location: str
    line: int
    explanation: str
    exploit_path: str
    recommendation: str


class ScanResponse(BaseModel):
    score: int
    summary: str
    vulnerabilities: list[Vulnerability]
    stages: list[str]
