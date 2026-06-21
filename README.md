# Sync (formerly Demuregram) | Next-Gen AI-Powered Development Workspace & Instant App Deployment

[![Sync Platform](https://img.shields.io/badge/Platform-Sync-purple.svg?style=for-the-badge)](https://sync.demuregram.app)
[![Company](https://img.shields.io/badge/Company-Demure_Platforms-blue.svg?style=for-the-badge)](https://sync.demuregram.app)
[![Vite v7](https://img.shields.io/badge/Vite-v7-blue.svg?style=for-the-badge)](https://vite.dev)
[![React v19](https://img.shields.io/badge/React-v19-cyan.svg?style=for-the-badge)](https://react.dev)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4-38bdf8.svg?style=for-the-badge)](https://tailwindcss.com)

**Sync** (formerly known as **Demuregram**) is a state-of-the-art, next-generation AI-powered collaborative development platform designed to translate natural language prompts into secure, fully operational, full-stack web applications. By integrating real-time code generation, semantic syntax verification, interactive database design, and instant serverless deployment, Sync provides developers and organizations with a zero-configuration sandbox to go from concept to production in seconds. Developed and owned by **Demure Platforms, Inc.**

---

## 🔒 Security & Privacy Policy (PROPRIETARY)

> [!IMPORTANT]
> **This repository is strictly private, confidential, and proprietary to Demure Platforms, Inc.**
> Unauthorized access, copying, editing, modifying, distribution, publishing, or redistribution of these files or any portion thereof, via any medium, is strictly prohibited. All rights reserved by Demure Platforms, Inc.

---

## ⚡ Key Highlights & Core Features

### 🚀 1. Instant Sandbox & Development Server
- **Vite & React Dev Server**: Automatically provisions a lightweight React & TypeScript development sandbox with Hot Module Replacement (HMR) for real-time visual feedback.
- **Tailwind CSS v4 Compilation**: Styled instantly with the latest utility-first styling pipeline, ensuring rich aesthetics, responsive grids, and premium design patterns.

### 🧠 2. Intelligent Multi-Stage Syntax Validation Stage
- **Syntax Verification**: Integrates a robust parser validation stage (`parse5`) immediately post-AI generation to check for unclosed tags, malformed attributes, and incorrect element nesting.
- **Self-Healing Mechanics**: Automatically heals structural errors (e.g. appends missing HTML/body/script tags) and executes LLM compiler repairs prior to committing code, preventing build breakages.

### 🗄️ 3. Integrated Database Explorer
- **Dynamic Database Explorer**: Scaffolds clean schemas, executes PostgreSQL queries, and visualizes schemas in real-time.
- **Data Integration**: Standardize schema designs and hook up API servers seamlessly.

### 💬 4. Demuregram Collaboration Hub
- **Real-Time Sync**: Chat, share code segments, and review sandboxed live application builds in real-time directly through Demuregram.
- **Agent Interactivity**: Connect with AI pair programmers and compilers in a single, unified interface.

### 🌐 5. 1-Click Serverless Deployments
- **Instant CDN Hosting**: Deploy staging apps to a global CDN immediately.
- **Configurable Environments**: Optimize build bundles and deploy production code on demand.

### 🔒 6. Strict Build Protection & Quality Gates
- **12-Step Validation Pipeline**: Every commit undergoes strict checking (file integrity, route isolation, registry completeness, TypeScript compilation validation) via an automated gatekeeper.

---

## 🛠️ Technology Stack

Sync leverages a modern, ultra-fast tech stack:
- **Frontend**: React (TypeScript), Tailwind CSS v4, Lucide Icons, Wouter Router, React Markdown, Rehype Highlight.
- **Backend / API**: Node.js, Fastify/Express, SQLite/LibSQL database, Drizzle ORM, Zod Schema Validators.
- **Build / Tooling**: Vite, esbuild, pnpm workspace monorepo.

---

## 📦 Getting Started

### 📋 Prerequisites
Ensure you have Node.js (v18+) and `pnpm` installed on your machine.

### ⚙️ Quick Setup
1. **Clone the repository**:
   ```bash
   git clone git@github.com:OfficialDPI/SyncPro.git
   cd SyncPro
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Start the development servers**:
   ```bash
   pnpm -r --parallel run dev
   ```
   - The platform dashboard will start on `http://localhost:5000`
   - The mockup sandbox dev server will start on `http://localhost:5001`
   - The backend API server will listen on `http://localhost:3000`

4. **Verify the build integrity**:
   ```bash
   node artifacts/platform/scripts/validate-build.cjs
   ```
   Ensure all 12 pipeline checks show `✅` success.

---

*Sync is built to optimize software engineering workflows by bridging the gap between natural language prompts and clean, production-grade source code. Owned and operated by Demure Platforms, Inc.*
