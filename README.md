# Aegis

AI-powered smart contract security analysis platform. Combines Slither static analysis with AI reasoning to detect vulnerabilities, generate exploit paths, and provide actionable remediation guidance.

## Problem

Smart contract vulnerabilities have caused billions in losses. Manual audits are slow and expensive. Existing automated tools produce raw detector output without context, explanations, or attack scenarios that developers need to understand and fix issues.

## Solution

Aegis bridges the gap between raw static analysis and developer-actionable security reports:

```
Solidity Source Code
        |
        v
  Input Validation & Sanitization
        |
        v
  Slither Static Analysis
        |
        v
  Detector Output Normalization
        |
        v
  AI Reasoning (GPT-4o-mini or Mock Fallback)
        |  - Vulnerability explanation
        |  - Attack scenario
        |  - Remediation guidance
        v
  Severity Scoring (0-100)
        |
        v
  Security Report (persisted to disk)
```

## Architecture

```
Aegis/
  backend/           FastAPI / Python 3.11+ / Slither / httpx
    app/
      main.py        FastAPI app, CORS, middleware
      api/scan.py    POST /api/v1/scan endpoint
      services/
        slither.py   Slither wrapper, detector normalization
        agent.py     AI analysis with mock fallback
      models/        Pydantic request/response schemas
      security/      Input validation, filename sanitization
    tests/           pytest unit tests (18 tests)
  frontend/          Next.js 15 / React 19 / TypeScript
    src/
      app/           6 pages: Landing, Scan, Projects, History, Patterns, Docs
      components/    CodeEditor (Monaco), Sidebar, AnalystPanel, FindingCard, AttackPath
      lib/           API client, localStorage persistence, demo data
    __tests__/       Vitest unit tests (10 tests)
  contracts/         Intentionally vulnerable demo Solidity contracts
  reports/           Persisted scan results (JSON)
```

## Security Pipeline

1. **Validate** -- Enforce Solidity structure, reject non-.sol files, block path traversal, limit input size (100KB)
2. **Compile & Analyze** -- Write to temp directory, run Slither with 120s timeout, path containment check
3. **Normalize** -- Map 50+ Slither detector types to structured findings with severity (critical/high/medium/low)
4. **AI Enhance** -- GPT-4o-mini generates explanations, attack scenarios, and remediation for each finding
5. **Score** -- Calculate security score (0-100) with severity-weighted penalties
6. **Report** -- Return structured JSON response, persist to disk

## AI Reasoning

When `OPENAI_API_KEY` is set, each Slither finding is sent to GPT-4o-mini with the relevant source code context. The AI generates:
- **Explanation** of why the vulnerability is dangerous
- **Attack scenario** describing how an exploit would work
- **Remediation** with specific fix recommendations

Without an API key, the system falls back to deterministic mock analysis with pre-written explanations for 12 vulnerability classes (reentrancy, tx.origin, selfdestruct, delegatecall, integer overflow, unchecked calls, etc.).

**Note:** Aegis is an automated analysis aid. It does not replace professional security audits for production contracts.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS, Monaco Editor, Framer Motion |
| Backend | FastAPI, Pydantic v2, httpx, Slither, solc-select |
| AI | OpenAI GPT-4o-mini (optional, with mock fallback) |
| Testing | pytest (backend), Vitest + Testing Library (frontend) |
| Infrastructure | Docker, docker-compose, GitHub Actions CI |

## Local Setup

### Prerequisites

- Python 3.11+
- Node.js 20+
- Slither: `pip install slither-analyzer`
- solc: `solc-select install 0.8.19 && solc-select use 0.8.19`

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:3000` with the API on `http://localhost:8000`.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | (empty) | OpenAI API key for AI analysis. Without it, mock analysis is used. |
| `CORS_ORIGINS` | `http://localhost:3000,http://localhost:3001` | Comma-separated allowed CORS origins |
| `ENABLE_DOCS` | `true` | Enable Swagger/ReDoc at `/docs`. Set to `false` in production. |
| `REPORTS_DIR` | `./reports` | Directory for persisted scan reports |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend API URL for the frontend |

See `.env.example` for all variables.

## Testing

```bash
# Backend (18 tests)
cd backend && source .venv/bin/activate
python -m pytest tests/ -v

# Frontend (10 tests)
cd frontend
npm test

# Frontend lint
npm run lint

# Frontend build
npm run build
```

## Docker

```bash
docker compose up --build
```

Services:
- **frontend** on port 3000
- **backend** on port 8000

Both run as non-root users with read-only filesystems.

## Deployment

### Recommended Platforms

| Service | Platform | Why |
|---------|----------|-----|
| Backend | **Render** | Native Docker support, handles `$PORT`, free tier available |
| Frontend | **Vercel** | Native Next.js support, automatic deployments from GitHub |

### Backend (Render)

1. Create a new **Web Service** on Render
2. Connect your GitHub repo (`RMP2005/Aegis`)
3. Settings:
   - **Root Directory:** `backend`
   - **Runtime:** Docker
   - **Health Check Path:** `/health`
4. Environment variables:
   ```
   OPENAI_API_KEY=sk-...          (optional)
   CORS_ORIGINS=https://your-frontend.vercel.app
   ENABLE_DOCS=false
   ```
5. Render auto-detects the Dockerfile and sets `$PORT`
6. Deploy

### Frontend (Vercel)

1. Import the GitHub repo (`RMP2005/Aegis`) in Vercel
2. Settings:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Next.js
3. Environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
   ```
4. Deploy

### Deployment Order

Deploy the backend first, get its URL, then set it as `NEXT_PUBLIC_API_URL` in the frontend.

### GitHub Actions CI

The `.github/workflows/ci.yml` runs on push/PR to `main`:
- Backend: Python tests
- Frontend: lint + build

## API Reference

### POST /api/v1/scan

Scan a Solidity contract for vulnerabilities.

**Request:**
```json
{
  "source_code": "pragma solidity ^0.8.19; contract Vault { ... }",
  "filename": "Vault.sol"
}
```

**Response:**
```json
{
  "score": 66,
  "summary": "Found 4 issue(s) (1 critical, 3 low). Score indicates moderate risk.",
  "vulnerabilities": [
    {
      "severity": "critical",
      "title": "Reentrancy Vulnerability",
      "location": "Vault.sol:28",
      "line": 28,
      "explanation": "...",
      "exploit_path": "...",
      "recommendation": "..."
    }
  ],
  "stages": ["Compiling contract...", "Running static analysis...", "..."]
}
```

### GET /health

Returns `{"status": "healthy", "service": "aegis-api"}`.

### GET /api/v1/status

Returns version and service status.

## Limitations

- **Solidity only** -- Does not support Vyper or other languages
- **Static analysis** -- No runtime analysis, fuzzing, or formal verification
- **No third-party protocol risk** -- Cannot assess composability risks or oracle dependencies
- **AI limitations** -- Explanations are generated, not guaranteed correct. Always verify findings
- **Not a professional audit** -- Aegis is a development aid, not a substitute for expert review

## License

MIT
