# Aegis

AI-powered smart contract security analysis platform. Combines Slither static analysis with AI reasoning to detect vulnerabilities, generate exploit paths, and provide actionable remediation guidance.

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 20+
- Slither (`pip install slither-analyzer`)
- solc 0.8.19 (`solc-select install 0.8.19 && solc-select use 0.8.19`)

### Local Development

**Backend:**
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:3000` with the API on `http://localhost:8000`.

### Docker

```bash
docker compose up --build
```

### AI Agent

Set `OPENAI_API_KEY` in your environment for GPT-4o-mini powered analysis. Without it, the system uses built-in mock analysis with pre-written vulnerability explanations.

## Architecture

```
frontend/          Next.js 15 / React 19 / TypeScript / Tailwind
backend/           FastAPI / Python / Slither / httpx
contracts/         Intentionally vulnerable demo Solidity contracts
reports/           Persisted scan results (JSON)
```

### Scan Pipeline

1. **Validate** -- Check Solidity code structure and sanitize inputs
2. **Compile** -- Write to temp file, run Slither static analysis
3. **Normalize** -- Map detector output to structured vulnerability data
4. **AI Enhance** -- GPT-4o-mini generates explanations, exploit paths, recommendations (or mock fallback)
5. **Score** -- Calculate security score (0-100) based on severity weights
6. **Report** -- Return structured response and persist to disk

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/scan` | Scan a Solidity contract |
| `GET` | `/health` | Health check |
| `GET` | `/api/v1/status` | Version and AI agent status |
| `GET` | `/docs` | Swagger documentation |

## Demo Contracts

Three intentionally vulnerable contracts are included in `contracts/`:

- **Reentrancy.sol** -- Classic reentrancy vulnerability
- **AccessControl.sol** -- tx.origin abuse, missing auth, selfdestruct
- **IntegerIssue.sol** -- Arithmetic overflow/underflow, unchecked calls

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS, Monaco Editor, Framer Motion |
| Backend | FastAPI, Pydantic, httpx, Slither, solc-select |
| AI | OpenAI GPT-4o-mini (optional) |
| Infrastructure | Docker, docker-compose, GitHub Actions CI |

## License

MIT
