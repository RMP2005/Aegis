export interface Vulnerability {
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  location: string;
  line: number;
  explanation: string;
  exploit_path: string;
  recommendation: string;
}

export interface ScanResult {
  score: number;
  summary: string;
  vulnerabilities: Vulnerability[];
  stages: string[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function scanContract(
  sourceCode: string,
  filename: string = "Contract.sol"
): Promise<ScanResult> {
  const response = await fetch(`${API_URL}/api/v1/scan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source_code: sourceCode, filename }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Scan failed" }));
    throw new Error(error.detail || "Scan failed");
  }

  return response.json();
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
