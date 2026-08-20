export interface ScanHistoryEntry {
  id: string;
  filename: string;
  contract: string;
  date: string;
  score: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  duration: string;
  status: "completed";
}

const STORAGE_KEY = "aegis_scan_history";
const MAX_HISTORY = 50;

export function getScanHistory(): ScanHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addScanHistory(entry: Omit<ScanHistoryEntry, "id" | "date" | "status">): ScanHistoryEntry {
  const newEntry: ScanHistoryEntry = {
    ...entry,
    id: `scan-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    date: new Date().toISOString(),
    status: "completed",
  };

  const history = getScanHistory();
  history.unshift(newEntry);
  if (history.length > MAX_HISTORY) {
    history.length = MAX_HISTORY;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return newEntry;
}

export interface Project {
  id: string;
  name: string;
  contractName: string;
  description: string;
  createdAt: string;
  score: number | null;
  status: "active";
  chain: string;
}

const PROJECTS_KEY = "aegis_projects";

const DEFAULT_PROJECTS: Project[] = [
  {
    id: "proj-demo-1",
    name: "DeFi Vault Protocol",
    contractName: "VulnerableVault.sol",
    description: "Multi-signature vault with deposit/withdraw logic and reward distribution.",
    createdAt: "2026-08-19T14:32:00Z",
    score: 28,
    status: "active",
    chain: "Ethereum",
  },
  {
    id: "proj-demo-2",
    name: "Access Control Module",
    contractName: "VulnerableAccess.sol",
    description: "Role-based access control with owner management and authorization checks.",
    createdAt: "2026-08-18T10:15:00Z",
    score: 35,
    status: "active",
    chain: "Ethereum",
  },
  {
    id: "proj-demo-3",
    name: "Math Utilities",
    contractName: "VulnerableMath.sol",
    description: "SafeMath library and reward calculation contracts.",
    createdAt: "2026-08-17T16:45:00Z",
    score: 52,
    status: "active",
    chain: "Polygon",
  },
];

export function getProjects(): Project[] {
  if (typeof window === "undefined") return DEFAULT_PROJECTS;
  try {
    const data = localStorage.getItem(PROJECTS_KEY);
    if (!data) {
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(DEFAULT_PROJECTS));
      return DEFAULT_PROJECTS;
    }
    return JSON.parse(data);
  } catch {
    return DEFAULT_PROJECTS;
  }
}

export function addProject(project: Omit<Project, "id" | "createdAt" | "status" | "score">): Project {
  const newProject: Project = {
    ...project,
    id: `proj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
    score: null,
    status: "active",
  };

  const projects = getProjects();
  projects.unshift(newProject);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  return newProject;
}

export function updateProjectScore(projectId: string, score: number): void {
  const projects = getProjects();
  const project = projects.find((p) => p.id === projectId);
  if (project) {
    project.score = score;
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  }
}
