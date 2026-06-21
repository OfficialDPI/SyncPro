# Sync Platform — Agent Rules (Full Core Lock Architecture)

## 🎯 Purpose

The Sync platform operates like a **modern operating system**. The Core Engine is stable infrastructure. All features plug into it. Nothing inside the Core Engine changes unless explicitly approved.

---

## 🔒 1. Protected Core Files — NEVER Modify Without Approval

These files define how the application builds, runs, and routes. Any modification requires:
1. Explicit user approval
2. A snapshot: `node scripts/snapshot.cjs <label>`
3. The change itself
4. Validation: `node scripts/validate-build.cjs` must pass all 12 steps
5. Dev server confirm: app must still start

### Locked Files

| Path | Reason |
|---|---|
| `src/main.tsx` | Application bootstrap |
| `src/App.tsx` | Top-level composition root |
| `src/index.css` | Global design tokens |
| `src/core/**` | Entire core engine (all subsystems) |
| `vite.config.ts` | Build configuration |
| `package.json` | Dependency manifest |
| `package-lock.json` / `pnpm-lock.yaml` | Lock files |
| `tsconfig.json` | TypeScript configuration |
| `tailwind.config.js` | Tailwind configuration |
| `postcss.config.js` | CSS pipeline |
| `eslint.config.js` | Linting rules |
| `index.html` | HTML entry point |
| `scripts/validate-build.cjs` | Validator itself |
| `scripts/safe-mode.cjs` | Safe mode checker |
| `scripts/snapshot.cjs` | Snapshot system |
| `scripts/restore-snapshot.cjs` | Restore system |
| `scripts/check-versions.cjs` | Version validator |
| `.agents/AGENTS.md` | These rules |
| `artifacts/api-server/src/lib/validation.ts` | **PERMANENTLY LOCKED — read-only on disk (local + remote). Fixed critical esbuild blocking bug. NEVER modify.** |
| `artifacts/api-server/src/routes/conversations.ts` | **PERMANENTLY LOCKED — read-only on disk (local + remote). Fixed safeEnd recursion crash. NEVER modify.** |

---

## ✅ 2. Safe to Modify (No Approval Required)

| Area | Notes |
|---|---|
| `src/features/**` | Feature modules — this is where new functionality lives |
| `src/pages/**` | Page UI components — safe to edit |
| `src/components/ui/**` | UI primitives — safe to extend (not break existing API) |
| `src/design-system/index.ts` | Can add new exports (never remove existing) |
| `src/lib/**` | Shared utilities |
| `src/hooks/**` | Shared hooks |
| `src/workspace/sandbox/**` | AI sandbox — always ephemeral |

---

## 🏗️ 3. Adding a New Feature

Every new feature follows this exact pattern:

```typescript
// src/features/<feature-name>/index.tsx
import { lazy } from "react";
import type { FeaturePlugin, FeatureRoute, FeatureNavigation } from "@/core/registry/types";

const FeaturePage = lazy(() => import("@/pages/<feature-name>"));

export const myFeaturePlugin: FeaturePlugin = {
  name: "<feature-name>",
  register() {},
  routes(): FeatureRoute[] {
    return [{ path: "/<feature-name>", component: FeaturePage, wrapInLayout: true }];
  },
  navigation(): FeatureNavigation[] {
    return [{ label: "My Feature", path: "/<feature-name>", icon: "Star", position: "sidebar" }];
  },
};
```

Then register in `src/core/registry/feature-registry.ts` **(requires approval)**.

---

## 🤖 4. AI Development Rules

The AI must:

- **EXTEND** the platform — never rewrite it
- **GENERATE** isolated feature modules — never modify core files
- **REUSE** existing components from `@/design-system` or `@/components/ui`
- **RESPECT** the design system — no ad-hoc inline styles for primitive elements
- **CALL** `safe-mode.cjs` before writing any file
- **RUN** `validate-build.cjs` after every change batch
- **TAKE A SNAPSHOT** before any risky change
- **EXPLAIN** any required infrastructure change before making it

The AI must NEVER:
- Hardcode routes in `App.tsx`
- Add providers directly to `App.tsx`
- Import one feature from another (use `@/core/sdk` or `@/lib/`)
- Upgrade dependencies without approval
- Modify `version-lock.ts` without approval
- Skip the validation pipeline before merging generated code

---

## 🔄 5. AI Workspace Pipeline

AI-generated code follows this mandatory flow:

```
1. AI generates source code
2. Written to src/workspace/sandbox/<session-id>/
3. core/compiler validates (TypeScript, security scan)
4. core/preview renders in sandboxed iframe
5. User reviews and approves
6. core/builder merges into src/features/<name>/
7. node scripts/validate-build.cjs runs (all 12 steps must pass)
8. Code is live
```

If any step fails → **discard and rollback** (do not merge).

---

## 📸 6. Snapshot System

Before any AI-generated code touches the filesystem:
```bash
node scripts/snapshot.cjs <descriptive-label>
```

To roll back:
```bash
node scripts/restore-snapshot.cjs           # lists snapshots
node scripts/restore-snapshot.cjs <id>      # restores
```

---

## 🛡️ 7. Safe Mode Check

Before writing any file, check if it's protected:
```bash
node scripts/safe-mode.cjs <filepath>
# Exit 0 = ALLOWED
# Exit 1 = BLOCKED (requires approval)
```

---

## 🔢 8. Dependency Rules

- Pin versions are defined in `src/core/runtime/version-lock.ts`
- The AI cannot upgrade, downgrade, or add packages without approval
- Verify pin compliance: `node scripts/check-versions.cjs`
- Adding a package requires: approval + update `package.json` + update `version-lock.ts` + re-run validator

---

## 🎨 9. Design System Rules

Features must import UI components through the design system:

```typescript
// ✅ Correct
import { Button, Card, THEME_TOKENS } from "@/design-system";

// ❌ Wrong — too deep, bypasses contract
import { Button } from "@/components/ui/button";
```

New primitive components belong in `src/components/ui/` and must be exported from `src/design-system/index.ts`.

---

## 📋 10. Build Validation Pipeline (12 Steps)

Every AI generation and developer commit runs:

| Step | Check |
|---|---|
| 1 | Core file integrity — all locked files exist |
| 2 | App.tsx isolation — no hardcoded routes or providers |
| 3 | Feature registry completeness — all plugins registered |
| 4 | Feature modules exist — all feature index files present |
| 5 | CoreProviders completeness — all providers included |
| 6 | Cross-feature isolation — no feature imports another feature |
| 7 | Design system barrel exists |
| 8 | All 12 core subsystems present |
| 9 | Security scan — no dangerous patterns in feature code |
| 10 | Workspace sandbox isolation — no sandbox imports in features |
| 11 | TypeScript compilation — `tsc --noEmit` must pass |
| 12 | Workspace structure valid — README and snapshot dir present |

```bash
node scripts/validate-build.cjs
# All 12 steps must show ✅
```

---

## 🌿 11. Branch Protection

Protect these branches — **no direct commits**:
- `main`
- `production`
- `stable`
- `release/*`

All changes go through Pull Requests.
No PR merges unless `validate-build.cjs` passes.

---

## 📊 12. Observability

The platform logs these events automatically via `core/observability/logger.ts`:
- AI-generated code received
- Compilation success/failure
- Security warnings detected
- Protected file modification attempts
- Dependency changes
- Build validation results
- Session approvals and merges
- Deploy initiations and rollbacks

Access logs in dev:
```javascript
import { logger } from "@/core/observability/logger";
logger.getEvents(100); // newest 100 events
```

---

## 🏆 Success Criteria

This architecture is complete when:
- ✅ Adding a feature does NOT require editing any core file
- ✅ AI-generated code is isolated, compiled, and validated before merging
- ✅ Core files are blocked by `safe-mode.cjs`
- ✅ Every build is reproducible and snapshot-rollback capable
- ✅ `validate-build.cjs` passes all 12 steps on every commit
- ✅ The platform scales to new features without destabilizing existing ones

---

## 🤖 13. AI Builder Behavior Standards

The AI builder must behave like a professional coding agent (on par with Replit AI, Cursor, Claude Code, and Google Antigravity). These rules govern every interaction inside the platform.

### Precision Rules
| # | Rule |
|---|---|
| 1 | Follow instructions exactly as written. Do not reinterpret, redesign, or add extra changes. |
| 2 | Make the **smallest possible code change** needed to satisfy the request. |
| 3 | Never modify unrelated files or features. |
| 4 | Never replace working code unless explicitly instructed. |
| 5 | Before editing, identify which files are responsible for the requested feature. |

### Response Rules
| # | Rule |
|---|---|
| 6 | If asked a question → **answer the question** instead of editing code. |
| 7 | If asked for an explanation → **explain the code** instead of making changes. |
| 8 | If asked for a feature → **add only that feature** without changing existing functionality. |
| 9 | If asked for a visual change → modify **only the affected UI components**. |
| 10 | If a request is ambiguous → **ask a clarifying question** instead of guessing. |
| 11 | If no code changes are needed → make **no edits** and simply answer. |

### Stability Rules
| # | Rule |
|---|---|
| 12 | Always preserve existing functionality unless explicitly told otherwise. |
| 13 | Maintain project-wide awareness so all edits remain compatible with the rest of the application. |
| 14 | Detect dependencies automatically before making changes. |
| 15 | Run validation after every change to ensure nothing else has broken. |

### Code Quality Rules
| # | Rule |
|---|---|
| 16 | Generate real production code — no placeholder code, mock implementations, or example templates. |
| 17 | Edit existing files whenever possible instead of generating duplicate files. |
| 18 | Use the existing project architecture, coding standards, and component structure. |
| 19 | Explain what files were modified and why after every completed task. |
| 20 | Function as a true software engineer: understand, edit, debug, and extend — never regenerate large sections of code. |

---

## 📋 14. AI Response Style & Developer Experience

### Response Style
- Keep responses **concise and focused**
- No long essays or unnecessary explanations
- Show the answer first — details after, only if needed
- No filler language, no repeated information
- Use headings, bullets, tables, code blocks — not prose walls

### Code Presentation
- Show **only changed files**
- Use **minimal diffs** instead of full files
- All code must meet Prettier + ESLint standards
- Keep code modular, readable, and production-ready
- Consistent naming conventions throughout the project

### Task Execution Workflow
```
Understanding Request → Analyze Project → Locate Relevant Files
→ Plan Changes → Apply Minimal Changes → Validate Build → Report Results
```

### Completed Task Response Format
```
✓ Task Completed

Files Modified
  • path/to/file.ts

Changes Made
  • What changed and why

Validation
  ✓ Build Passed
  ✓ Type Check Passed

Ready for your next instruction.
```

### Question Mode (user asks a question)
- Answer directly
- Do NOT edit code
- Do NOT generate files
- Do NOT rebuild the project
- Do NOT assume changes are wanted

### Edit Mode (user asks for a change)
- Modify only the requested functionality
- Preserve everything else
- No redesigns of unrelated components
- No breaking changes

### UI/Response Feel
Responses must feel like a **professional IDE assistant**, not a chatbot:
- Compact layouts with status badges and checkmarks
- File trees, diffs, terminal-style logs
- Minimal scrolling — expandable details for long output
- No blog-post formatting
