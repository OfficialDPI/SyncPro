---
name: Orval zod codegen duplicate-export fix
description: How to configure Orval zod client to avoid TS2308 duplicate export errors in api-zod lib
---

## The Rule
In `lib/api-spec/orval.config.ts`, the `zod` codegen output MUST use `mode: "single"` and must NOT include the `schemas` option.

**Why:** In `mode: "split"`, Orval generates separate TypeScript type files (in `generated/types/`) AND Zod validators (in `generated/api.ts`). Both export the same names (e.g. `CreateConversationBody`). Orval also rewrites `lib/api-zod/src/index.ts` to re-export both `./generated/api` and `./generated/types`, causing TS2308 duplicate-export errors.

**How to apply:** 
1. Keep `mode: "single"` and no `schemas` key in the zod output config.
2. After every codegen run, verify `lib/api-zod/src/index.ts` contains ONLY `export * from "./generated/api";` — codegen may rewrite it with the stale types re-export line. Delete that second line if it appears.
