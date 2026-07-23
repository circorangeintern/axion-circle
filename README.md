# CleanReport

**Community Waste & Sanitation Issue Reporting Platform**

[![Backend CI](https://github.com/circorangeintern/axion-circle/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/circorangeintern/axion-circle/actions)

> Report sanitation issues in 10 seconds. Track resolution. Get rewarded.

---

## 🏗️ Project Structure

```
axion-circle/
├── backend/                    # Spring Boot REST API (Java 17+)
│   ├── src/main/java/com/cleanreport/
│   │   ├── config/             # Security, CORS, Cloudinary config
│   │   ├── controller/         # REST controllers
│   │   ├── service/            # Business logic
│   │   ├── repository/         # JPA repositories
│   │   ├── model/              # Entities + Enums
│   │   ├── dto/                # Request/Response DTOs
│   │   ├── exception/          # Global exception handler
│   │   ├── security/           # JWT filter, auth provider
│   │   └── util/               # Helpers
│   └── src/main/resources/
│       ├── application.yml     # App configuration
│       └── db/migration/       # Flyway SQL migrations
├── frontend/                   # Next.js PWA (React, TypeScript)
│   ├── src/app/               # App router pages
│   ├── src/components/        # Reusable UI components
│   ├── src/services/          # API client
│   └── public/                # Static assets + PWA manifest
├── docs/                       # Documentation & diagrams
├── docker-compose.yml          # Local PostgreSQL + PostGIS
├── .github/workflows/          # CI/CD pipelines
└── .env.example                # Environment variables template
```

---

## 🚀 Quick Start

### Prerequisites
- Java 17+ (for backend)
- Node.js 18+ (for frontend)
- Docker & Docker Compose (for database)
- Git

### 1. Clone & Setup
```bash
git clone https://github.com/circorangeintern/axion-circle.git
cd axion-circle
cp .env.example .env
```

### 2. Start Database
```bash
docker-compose up -d
```

### 3. Run Backend
```bash
cd backend
./gradlew bootRun
```
Backend runs at: `http://localhost:8080/api/v1`
Health check: `http://localhost:8080/api/v1/health`
API docs: `http://localhost:8080/api/v1/swagger-ui.html`

### 4. Run Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: `http://localhost:3000`

---

## 📋 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Spring Boot 3.x, Java 17, Spring Security, Spring Data JPA |
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Database | PostgreSQL 15 + PostGIS |
| Auth | JWT (access + refresh tokens) |
| Photos |  |
| Email | SendGrid |
| Maps | Leaflet + OpenStreetMap |
| CI/CD | GitHub Actions |
| Deploy | Railway (backend) + Vercel (frontend) |

---

## 🔌 API Overview

Base URL: `/api/v1`

| Module | Endpoints |
|--------|-----------|
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh` |
| Reports | `POST /reports`, `GET /reports`, `GET /reports/{id}`, `GET /reports/nearby` |
| Admin | `GET /admin/reports`, `PATCH /admin/reports/{id}/status` |
| Credits | `GET /credits/balance`, `GET /credits/leaderboard` |
| Rewards | `GET /rewards`, `POST /rewards/{id}/claim` |
| Stats | `GET /reports/stats` |

Full API documentation available at `/swagger-ui.html` when running locally.

---

## 🌿 Git Workflow

1. Create feature branch: `git checkout -b feature/SCRUM-XX-description`
2. Make changes, commit: `git commit -m "feat: description"`
3. Push: `git push -u origin feature/SCRUM-XX-description`
4. Create Pull Request → Review → Merge to `main`

### Commit Convention
```
feat: add report submission endpoint
fix: resolve GPS coordinate parsing issue
docs: update API documentation
style: format code
refactor: extract credit calculation to service
test: add report service unit tests
chore: update dependencies
```

---

## 👥 Team

| Role | Focus |
|------|-------|
| Backend + Frontend Lead | API, database, frontend PWA, deployment |
| Frontend Developer | User-facing screens, map, components |
| Product Manager | Scope, sprint planning, demos |
| UI/UX Designer | Wireframes, visual design, usability |
| Data Analyst | Metrics, insights, demo data |

---

## 📅 Sprint Timeline

| Sprint | Dates | Goal |
|--------|-------|------|
| 1 | Jul 9–13 | Foundation (setup, schema, auth) |
| 2 | Jul 14–20 | Core MVP (reports, map, form) |
| 3 | Jul 21–27 | Admin + Credits |
| 4 | Jul 28–Aug 3 | Engagement (notifications, PWA, share) |
| 5 | Aug 4–10 | Polish + Demo |

---

## 📖 Documentation

- [Technical Design Document](docs/TDD.md)
- [API Specification](docs/api/)
- [Confluence](https://axion-circle.atlassian.net/wiki/spaces/AC/overview)
- [Jira Board](https://axion-circle.atlassian.net/jira/software/projects/SCRUM/board)
