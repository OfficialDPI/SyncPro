# AI Workspace — Sandbox Directory

This directory contains **ephemeral AI-generated code** that has not yet been validated, approved, or merged into the platform.

## ⚠️ Rules

- **This directory is gitignored.** Code here is temporary working space.
- **Do not import from this directory** in any `src/features/` or `src/core/` code.
- **Nothing in this directory is "live"** — it only appears in the preview sandbox.
- Code progresses through the pipeline before reaching `src/features/`:

```
AI generates code
    ↓
Written to src/workspace/sandbox/<session-id>/
    ↓
core/compiler validates & checks for security issues
    ↓
core/preview renders in sandboxed iframe
    ↓
User reviews and approves
    ↓
core/builder merges into src/features/<feature-name>/
    ↓
scripts/validate-build.cjs runs (must pass all 12 checks)
    ↓
Code is live in the application
```

## Directory Structure

```
src/workspace/
├── sandbox/
│   └── <session-id>/
│       ├── App.tsx          (AI-generated entry point)
│       ├── index.css        (AI-generated styles)
│       └── components/      (AI-generated components)
├── snapshots/               (pre-merge snapshots for rollback)
└── README.md                (this file)
```

## Session Lifecycle

Each generation session has a unique ID and goes through these stages:

| Stage | Description |
|---|---|
| `idle` | Session created, waiting for code |
| `generating` | AI is producing output |
| `compiling` | TypeScript/JSX being compiled |
| `validating` | Schema + lint checks running |
| `security-scan` | Security patterns checked |
| `preview` | Code visible in sandboxed iframe |
| `awaiting-approval` | Waiting for user review |
| `merging` | Writing to `src/features/` |
| `complete` | Successfully merged |
| `failed` | Pipeline error — code discarded |
| `rolled-back` | Reverted to pre-merge state |
