import pytest
import json
from app.services.slither import (
    _normalize_results,
    _map_to_severity,
    _generate_explanation,
    _generate_exploit_path,
    _generate_recommendation,
)
from app.services.agent import calculate_score, generate_summary, _mock_analyze


def test_severity_mapping_high():
    assert _map_to_severity("high", "high") == "critical"
    assert _map_to_severity("high", "medium") == "critical"


def test_severity_mapping_medium():
    assert _map_to_severity("medium", "high") == "high"
    assert _map_to_severity("medium", "medium") == "high"


def test_severity_mapping_low():
    assert _map_to_severity("low", "high") == "medium"
    assert _map_to_severity("low", "low") == "low"


def test_severity_mapping_unknown():
    assert _map_to_severity("unknown", "unknown") == "low"
    assert _map_to_severity(None, None) == "low"


def test_normalize_results_empty():
    result = _normalize_results({})
    assert result == []


def test_normalize_results_with_detectors():
    data = {
        "results": {
            "detectors": [
                {
                    "check": "reentrancy-eth",
                    "impact": "High",
                    "confidence": "Medium",
                    "description": "Reentrancy found",
                    "elements": [
                        {
                            "source_mapping": {
                                "filename_relative": "Contract.sol",
                                "lines": [42],
                            }
                        }
                    ],
                }
            ]
        }
    }
    vulns = _normalize_results(data)
    assert len(vulns) == 1
    assert vulns[0]["severity"] == "critical"
    assert vulns[0]["title"] == "Reentrancy Vulnerability"
    assert vulns[0]["line"] == 42


def test_generate_explanation_reentrancy():
    explanation = _generate_explanation(
        {"title": "Reentrancy", "check": "reentrancy-eth", "description": ""}
    )
    assert "re-enter" in explanation.lower() or "external call" in explanation.lower()


def test_generate_explanation_generic():
    explanation = _generate_explanation(
        {"title": "Unknown Issue", "check": "unknown-check", "description": "Known description"}
    )
    assert explanation == "Known description"


def test_generate_exploit_path_reentrancy():
    path = _generate_exploit_path({"check": "reentrancy-eth"})
    assert "re-enter" in path.lower() or "drain" in path.lower()


def test_generate_recommendation_reentrancy():
    rec = _generate_recommendation({"check": "reentrancy-eth"})
    assert "checks-effects-interactions" in rec.lower() or "reentrancyguard" in rec.lower()


def test_calculate_score_no_vulns():
    assert calculate_score([]) == 100


def test_calculate_score_critical():
    vulns = [{"severity": "critical"}]
    score = calculate_score(vulns)
    assert score == 75


def test_calculate_score_multiple():
    vulns = [
        {"severity": "critical"},
        {"severity": "high"},
        {"severity": "medium"},
    ]
    score = calculate_score(vulns)
    assert score == 52


def test_calculate_score_minimum():
    vulns = [{"severity": "critical"}] * 10
    score = calculate_score(vulns)
    assert score == 0


def test_generate_summary_no_vulns():
    summary = generate_summary(100, [])
    assert "No security issues" in summary


def test_generate_summary_with_vulns():
    vulns = [{"severity": "critical"}, {"severity": "high"}]
    summary = generate_summary(47, vulns)
    assert "2 issue(s)" in summary
    assert "critical" in summary.lower() or "significant" in summary.lower()


def test_mock_analyze():
    vulns = [{"title": "Reentrancy Vulnerability", "severity": "critical", "explanation": ""}]
    result = _mock_analyze(vulns, "pragma solidity ^0.8.0; contract Test {}", "Test.sol")
    assert len(result) == 1
    assert len(result[0]["explanation"]) > 0
    assert len(result[0]["exploit_path"]) > 0
    assert len(result[0]["recommendation"]) > 0


def test_generate_summary_risk_levels():
    assert "low overall risk" in generate_summary(85, [{"severity": "low"}])
    assert "moderate risk" in generate_summary(65, [{"severity": "medium"}])
    assert "significant risk" in generate_summary(45, [{"severity": "high"}])
    assert "critical risk" in generate_summary(20, [{"severity": "critical"}])
