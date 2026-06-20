# DarkLanding

Welcome to **DarkLanding**, a production-ready application scaffolded by Sync.

## Features
- **Frontend**: HTML+CSS client application.
- **Backend API**: Node.js Express server running mock database integrations and user authentication handlers.
- **Database**: PostgreSQL schema definitions with automatic migrations and seed data setup.
- **DevOps**: Complete multi-container Orchestration via Docker Compose.
- **Testing**: Playwright End-to-End browser validation and Vitest Unit specs.
- **CI/CD**: GitHub Actions workflows for automated linting, building, and unit tests.

## Local Quickstart

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose (optional)

### Running Locally
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```

### Testing
- Run Unit Tests: `npm run test`
- Run Playwright E2E Tests: `npm run test:e2e`

### Docker Compose
To run the full stack (Frontend, API Server, Postgres DB):
```bash
docker compose up --build
```