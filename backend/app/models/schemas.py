from pydantic import BaseModel, Field
from enum import Enum


class Severity(str, Enum):
    critical = "critical"
    high = "high"
    medium = "medium"
    low = "low"


class ScanRequest(BaseModel):
    source_code: str = Field(
        ..., max_length=100_000, description="Solidity source code to analyze"
    )
    filename: str = Field(default="Contract.sol", description="Contract filename")


class Vulnerability(BaseModel):
    severity: Severity
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
