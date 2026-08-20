# 🛡️ AEGIS

<p align="center">

<img src="https://your-image-link-here/banner.png" width="900"/>

</p>

<h3 align="center">
Before attackers break your contract, AEGIS already did.
</h3>

<p align="center">
An AI-powered security intelligence platform that analyzes code, detects vulnerabilities,
identifies security patterns, and provides actionable remediation insights.
</p>


<p align="center">

![Next.js](https://img.shields.io/badge/Frontend-Next.js-black?style=for-the-badge&logo=next.js)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.11-blue?style=for-the-badge&logo=python)
![Machine Learning](https://img.shields.io/badge/AI-ML-purple?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-Enabled-blue?style=for-the-badge&logo=docker)
![Vercel](https://img.shields.io/badge/Frontend-Deployed-black?style=for-the-badge&logo=vercel)
![Render](https://img.shields.io/badge/Backend-Deployed-purple?style=for-the-badge)

</p>


---

# 🚀 Live Demo

Frontend:

🔗 https://your-vercel-link.vercel.app


Backend API:

🔗 https://your-render-link.onrender.com


> ⚠️ Backend is deployed on Render Free Tier.
> Due to inactivity, the service may sleep and the first request can take around 30-60 seconds to wake up.


---

# 📌 Overview

AEGIS is an AI-powered security analysis platform designed to help developers identify vulnerabilities before deployment.

Instead of manually reviewing thousands of lines of code, AEGIS combines:

- Artificial Intelligence
- Machine Learning based pattern recognition
- Automated security analysis
- Explainable vulnerability reports
- Developer-focused remediation suggestions


The goal is simple:

> Make secure coding faster, smarter, and accessible.


---

# ✨ Features


## 🔍 AI Powered Code Analysis

- Automated vulnerability scanning
- Security pattern detection
- Risk classification
- Code-level insights


## 🧠 Explainable AI Insights

Instead of only detecting problems, AEGIS explains:

- Why the vulnerability exists
- Severity level
- Possible exploitation impact
- Recommended fixes


## 📊 Security Intelligence Dashboard

Provides:

- Scan history
- Vulnerability trends
- Project monitoring
- Risk summaries


## ⚡ Developer Friendly Workflow

Built for developers with:

- Fast scanning
- Clean reports
- Simple interface
- Deployment-ready architecture


---

# 🏗️ System Architecture

             USER

              |
              |

      Next.js Frontend
          (Vercel)

              |
              |

        REST API

              |
              |

      FastAPI Backend
         (Render)

              |
    -------------------

    AI Security Engine

    ML Models
    Rule Engine
    Pattern Detection

    -------------------

              |

         Reports Storage



---

# 🛠️ Tech Stack


## Frontend

| Technology | Purpose |
|-|-|
| Next.js | React framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| React Components | UI architecture |


## Backend

| Technology | Purpose |
|-|-|
| FastAPI | REST API |
| Python | Backend logic |
| Uvicorn | Server |
| Pydantic | Validation |


## AI / ML

| Technology | Purpose |
|-|-|
| Scikit-learn | ML models |
| NLP techniques | Pattern analysis |
| Rule based engine | Security detection |


## Deployment

| Platform | Usage |
|-|-|
| Vercel | Frontend hosting |
| Render | Backend hosting |
| Docker | Containerization |


---

# 📂 Project Structure

AEGIS
│
├── frontend
│   ├── src
│   ├── app
│   ├── components
│   └── package.json
│
│
├── backend
│   ├── app
│   ├── models
│   ├── routes
│   ├── requirements.txt
│   └── Dockerfile
│
│
└── README.md



---

# ⚙️ Local Installation


## Clone Repository


```bash
git clone https://github.com/yourusername/Aegis.git

cd Aegis

Frontend Setup-

cd frontend

npm install

npm run dev

Frontend runs on:
http://localhost:3000

Backend Setup-

cd backend


python -m venv venv


# Activate environment

source venv/bin/activate


pip install -r requirements.txt


uvicorn main:app --reload

Backend runs on:
http://localhost:8000

🔐 Environment Variables
Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000
Backend (.env)
OPENAI_API_KEY=your_key_here

CORS_ORIGINS=http://localhost:3000

ENABLE_DOCS=true

REPORTS_DIR=reports

ENV=production

🚀 Deployment
Frontend Deployment (Vercel)
Steps:
Import GitHub repository into Vercel
Select frontend directory as root
Framework:
Next.js
Add environment variables
Deploy
Backend Deployment (Render)
Steps:
Create a new Web Service
Connect GitHub repository
Select backend directory
Runtime:
Docker
Deploy
Render Free Tier Note
The backend uses Render Free Tier.
Because free instances sleep after inactivity:
First request may take longer
Subsequent requests are faster
Suitable for demos and portfolio deployment
🔄 Alternative Deployment Options
If Render/Vercel is unavailable, AEGIS can also be deployed using:
Backend
AWS EC2
AWS ECS
Google Cloud Run
Azure App Service
Railway
Fly.io
Frontend
Netlify
Cloudflare Pages
AWS Amplify
Full Docker Deployment
docker-compose up --build
📸 Screenshots
<img width="1459" height="823" alt="image" src="https://github.com/user-attachments/assets/14a52dc3-0a80-4156-b870-eccc2ad82984" />

<p align="center">

<img src="screenshots/dashboard.png" width="700"/>

</p>


<p align="center">

<img src="screenshots/report.png" width="700"/>

</p>
<img width="1466" height="832" alt="image" src="https://github.com/user-attachments/assets/589b4fc3-1765-4c2a-b85c-abe6aba79d68" />




🗺️ Roadmap
Completed ✅
AI security analysis
Vulnerability detection
Dashboard interface
Cloud deployment
Future Improvements 🚀
Advanced ML vulnerability classification
Real-time repository scanning
GitHub Actions integration
Automated security pull requests
Enterprise security reports
Multi-language support
🤝 Contributing
Contributions are welcome.
Steps:
git clone repo

git checkout -b feature-name

git commit -m "Added feature"

git push origin feature-name
Open a Pull Request 🚀
⭐ Support
If you found AEGIS useful:
⭐ Star this repository
Share feedback
Suggest improvements
📜 License
This project is licensed under the MIT License.
👨‍💻 Built With ❤️
Built by developers who believe security should be intelligent, automated, and accessible.

