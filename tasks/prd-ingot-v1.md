# PRD: Ingot v1 — The Builder

## Introduction

Ingot is a full-stack app scaffolder for solo developers. It lets developers compose a production-ready, wired-up project from interchangeable pieces — framework, database, ORM, auth provider, UI library, and deployment target — through either an interactive CLI or a visual web configurator.

The central artifact is `ingot.json`: a declarative config that describes the full stack composition. The CLI reads it and orchestrates each tool's own CLI in sequence. The web UI writes it visually.

**Key architectural decision**: Ingot is an **orchestrator**, not a template engine. It runs each upstream tool's own CLI (e.g., `create-next-app`, `drizzle-kit`, Clerk's setup) with the correct flags and wires their outputs together. It does not maintain template files.

**Success metric**: A developer (or AI agent) can go from zero to a running, fully-wired full-stack app with auth, database, and UI configured in under two minutes.

---

## Goals

- Define and validate the `ingot.json` schema with Zod
- Implement `ingot init` CLI that works interactively and non-interactively
- Implement orchestration logic for all supported piece combinations
- Build the web configurator at ingot.ink that generates an `ingot.json` and CLI command
- Ship a documentation site at ingot.ink/docs
- Support all MVP pieces: 3 frameworks × 3 DB providers × 2 ORMs × 4 auth options × 11 themes × 3 deployment targets

---

## User Stories

### US-001: Define the `ingot.json` schema

**Description:** As a developer, I need a validated schema for `ingot.json` so that all parts of the system share a single source of truth for what a valid build config looks like.

**Acceptance Criteria:**
- [ ] Zod schema defined in `packages/core/src/schema.ts` covering all v1 fields: `name`, `framework`, `database.provider`, `database.orm`, `auth`, `ui.library`, `ui.theme`, `deployment`
- [ ] All enum values match the MVP scope exactly (see Swappable Pieces in project spec)
- [ ] Schema exported as a TypeScript type (`IngotConfig`)
- [ ] `validateConfig(json: unknown): IngotConfig` utility exported from `packages/core`
- [ ] Invalid configs throw a descriptive Zod error
- [ ] Typecheck passes

---

### US-002: Set up monorepo

**Description:** As a developer (or agent), I need the monorepo scaffolded so work can begin on packages independently.

**Acceptance Criteria:**
- [ ] Root `package.json` with workspaces configured
- [ ] `packages/cli/` — empty TypeScript package, `bin` entry pointing to `src/index.ts`
- [ ] `packages/core/` — empty TypeScript package
- [ ] `apps/web/` — Next.js app (App Router, TypeScript, Tailwind)
- [ ] Shared `tsconfig.json` base at root; each package/app extends it
- [ ] `packages/core` is importable from `packages/cli` and `apps/web` via workspace reference
- [ ] `bun run build` (or equivalent) succeeds from the root
- [ ] Typecheck passes across all packages

---

### US-003: Implement orchestration logic for all piece combinations

**Description:** As the CLI, I need to know what commands to run for any valid `ingot.json` so I can scaffold any supported combination end-to-end.

**Acceptance Criteria:**
- [ ] `packages/core/src/orchestrator.ts` exports `getSteps(config: IngotConfig): OrchestratorStep[]`
- [ ] Each `OrchestratorStep` includes: `label` (human-readable), `command` (shell string or function), `envVars` (keys this step requires in `.env`), and optionally `postRun` (wiring logic to apply after this step)
- [ ] Steps are returned in correct execution order for all combinations
- [ ] Framework step always runs first (e.g., `create-next-app`, TanStack Start init, Remix init)
- [ ] Database/ORM step runs second (installs packages + runs ORM init command)
- [ ] Auth step runs third (installs packages, writes middleware stub, adds env var stubs)
- [ ] UI step runs fourth (runs `shadcn init` with the configured theme)
- [ ] `.env.example` is written last, aggregating all `envVars` from all steps
- [ ] All supported frameworks have their own step definitions
- [ ] All supported DB+ORM combinations have step definitions
- [ ] All supported auth providers have step definitions
- [ ] Typecheck passes

---

### US-004: Implement package manager detection

**Description:** As the CLI, I need to detect which package manager the user has available so all install commands use it consistently.

**Acceptance Criteria:**
- [ ] `packages/core/src/packageManager.ts` exports `detectPackageManager(): 'bun' | 'pnpm' | 'npm'`
- [ ] Detection checks for lockfiles in the current directory first (`bun.lockb`, `pnpm-lock.yaml`, `package-lock.json`)
- [ ] Falls back to checking which binaries are available in `PATH`
- [ ] Falls back to `npm` if nothing is detected
- [ ] All commands in orchestration steps use the detected package manager
- [ ] Typecheck passes

---

### US-005: Build the interactive CLI (`ingot init`)

**Description:** As a solo developer, I want to run `npx ingot init` and be guided through a series of prompts to configure and scaffold my project, so I don't have to remember any flags.

**Acceptance Criteria:**
- [ ] `npx ingot init` launches a Clack-powered interactive prompt sequence
- [ ] Prompts cover all config fields in order: project name → framework → database provider → ORM → auth → UI theme → deployment target
- [ ] Each prompt uses the appropriate Clack component (text input, select, etc.)
- [ ] Selected values are assembled into a valid `IngotConfig` and validated before execution
- [ ] On confirmation, the CLI executes all orchestration steps in order with visible progress output (Clack spinners per step)
- [ ] On success, prints a summary: project name, directory, and a "next steps" block
- [ ] On failure of any step, prints which step failed, the command that failed, and exits with code 1
- [ ] Typecheck passes

---

### US-006: Build the non-interactive CLI mode

**Description:** As an AI agent (or power user), I want to run `npx ingot init` with a config file or inline flags so I can scaffold a project without interactive prompts.

**Acceptance Criteria:**
- [ ] `npx ingot init --config ingot.json` reads and validates the config file, then executes without prompts
- [ ] `npx ingot init my-app --framework nextjs --db postgres/drizzle --auth clerk --ui shadcn/zinc --deployment vercel` works as a fully non-interactive one-liner
- [ ] Unknown or invalid flag values produce a clear error message before any scaffolding begins
- [ ] Behavior after config resolution is identical to the interactive path (same orchestration steps, same output)
- [ ] `npx ingot init my-app` pre-fills the project name and prompts for the rest interactively
- [ ] Typecheck passes

---

### US-007: Build the web configurator UI

**Description:** As a developer who prefers a visual interface, I want to configure my stack at ingot.ink and get a ready-to-run CLI command, so I can scaffold without memorising flags.

**Acceptance Criteria:**
- [ ] Multi-step form at ingot.ink covering all config fields in the same order as the CLI prompts
- [ ] Visual design matches TanStack's aesthetic: dark mode default, clean typography, developer-first
- [ ] Each step shows the available options for that field as selectable cards or buttons
- [ ] A live preview panel shows the `ingot.json` updating as the user makes selections
- [ ] A generated CLI command updates in real time (e.g., `npx ingot init my-app --framework nextjs ...`)
- [ ] "Copy command" button copies the CLI command to clipboard
- [ ] "Download ingot.json" button downloads the config file
- [ ] Form validates that all required fields are filled before showing the final output
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

### US-008: Build the documentation site

**Description:** As a developer evaluating Ingot, I want clear documentation at ingot.ink/docs so I can understand what Ingot does, how to use it, and what stacks are supported.

**Acceptance Criteria:**
- [ ] `/docs` route exists within the Next.js app at `apps/web`
- [ ] Documentation covers: what Ingot is, quick start (CLI), full CLI reference, `ingot.json` schema reference, supported pieces table, FAQ
- [ ] Quick start includes a copy-pasteable `npx ingot init` command
- [ ] Supported pieces table lists all v1 options with their enum values (for non-interactive use)
- [ ] Pages are statically rendered (no client-side fetch required)
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

---

## Functional Requirements

- **FR-1:** `ingot.json` schema is the single source of truth for all valid stack combinations; CLI and web UI both validate against it via `packages/core`
- **FR-2:** `ingot init` must work fully non-interactively when passed a valid `--config` file or full inline flags — no prompts, no confirmation
- **FR-3:** Orchestration logic must delegate all setup to each upstream tool's own CLI; Ingot must not write framework, ORM, or auth template files itself
- **FR-4:** All install commands must use the detected package manager; no command may hardcode `npm install` if another PM is detected
- **FR-5:** The `.env.example` file must be written at the end of every scaffold, listing every required environment variable with a one-line comment explaining each
- **FR-6:** A failed orchestration step must print the failed command, a brief explanation, and a link to the relevant tool's documentation URL (stored per piece in the orchestration logic)
- **FR-7:** The web UI must produce output (CLI command + `ingot.json`) that is 1:1 equivalent to what the CLI would produce for the same inputs
- **FR-8:** The CLI must detect and use `bun`, `pnpm`, or `npm` — in that preference order — based on lockfile presence and binary availability

---

## Non-Goals

- No `ingot add` command — Ingot does not manage packages post-scaffold
- No template files — Ingot does not maintain or copy static file templates
- No support for non-JavaScript stacks
- No authentication for the web UI (no user accounts, no saved configs in v1)
- No MCP server (v2)
- No build registry or marketplace (v3)
- No monorepo scaffolding (Ingot scaffolds a single app, not a workspace)
- No plugin system or custom piece definitions
- No support for `--dry-run` or preview mode in v1

---

## Design Considerations

- **CLI UX**: Follow Shadcn's CLI UX conventions using [Clack](https://github.com/bombshell-dev/clack) — intro banner, grouped prompts, spinners per step, styled success/error outro
- **Web UI**: Match [TanStack's site](https://tanstack.com) — dark mode default, GeistMono or similar monospace font, minimal, structural, no gradients or playful illustrations. The casting/metalwork metaphor can inform copy but should not dominate visuals.
- **`ingot.json` preview**: The live JSON preview in the web UI should syntax-highlight the output and animate the relevant key when a selection changes
- **Step-by-step layout**: Each config step in the web UI is a full-width section; users scroll or click "Next" to advance (not a traditional wizard modal)

---

## Technical Considerations

- **Monorepo tooling**: Use Bun workspaces (or pnpm if preferred) with a root `package.json`
- **CLI entry point**: `packages/cli/src/index.ts` — compiled and referenced from `bin` in `package.json`
- **Clack version**: Use `@clack/prompts` (not the legacy `@clack/core` directly)
- **Zod version**: v3
- **Web app**: Next.js App Router at `apps/web`; docs at `apps/web/app/docs/`
- **Orchestration steps execution**: Use Node's `child_process.execSync` or `execa` to run shell commands; stream output to the terminal
- **No state management library** needed for the web UI — React state is sufficient for the configurator form
- **Deployment**: `apps/web` deploys to Vercel; CLI is published to npm as `ingot`

---

## Success Metrics

- `npx ingot init --config ingot.json` produces a running full-stack project with zero manual steps in under 2 minutes
- All supported piece combinations scaffold without error
- The web UI generates a CLI command that, when run, produces an identical result to clicking through the web form
- Zero template files exist in the Ingot repository

---

## Open Questions

- Should `ingot init` run `git init` in the new project directory? (Likely yes — most scaffolders do)
- Should the CLI offer to open the project in VS Code after scaffolding? (Nice to have, not blocking)
- What happens when `create-next-app` or another upstream tool prompts interactively during orchestration? (Need to ensure all upstream commands are run with non-interactive flags)
- Should the web UI be a separate Next.js page or route group from the docs? (Recommendation: `/` = configurator, `/docs` = docs)
