# Ingot

**Cast your stack.**

Ingot is a full-stack app scaffolder for solo developers. Compose a production-ready, wired-up project from interchangeable pieces — framework, database, ORM, auth, UI, and deployment target — through an interactive CLI or a visual web configurator at [ingot.ink](https://ingot.ink).

---

## How It Works

The central artifact is `ingot.json`: a declarative config describing your full-stack composition.

```json
{
  "name": "my-app",
  "framework": "nextjs",
  "database": {
    "provider": "postgres",
    "orm": "drizzle"
  },
  "auth": "clerk",
  "ui": {
    "library": "shadcn",
    "theme": "zinc"
  },
  "deployment": "vercel"
}
```

Ingot is an **orchestrator, not a template engine**. It runs each upstream tool's own CLI (e.g. `create-next-app`, `drizzle-kit`, Clerk setup) with the correct flags and wires their outputs together — no template files, no template rot.

---

## Usage

```bash
npx ingot init                           # fully interactive
npx ingot init my-app                    # interactive with name pre-filled
npx ingot init --config ingot.json       # driven by config file
npx ingot init my-app --from @user/build # from marketplace (v3)
```

Or with inline flags:

```bash
npx ingot init my-app --framework nextjs --db postgres/drizzle --auth clerk --ui shadcn/zinc
```

---

## Supported Pieces

| Category | Options |
|----------|---------|
| **Framework** | Next.js (App Router), TanStack Start, Remix |
| **Database** | PostgreSQL, MySQL, SQLite |
| **ORM** | Drizzle, Prisma |
| **Auth** | Clerk, Better Auth, NextAuth v5, None |
| **UI** | Shadcn/ui — all themes (zinc, slate, stone, gray, neutral, red, rose, orange, blue, yellow, violet) |
| **Deployment** | Vercel, Cloudflare Workers, Railway |

---

## Roadmap

### v1 — The Builder
Interactive CLI + web configurator at ingot.ink. Zero to running full-stack app in under two minutes.

### v2 — The MCP
An MCP server for LLMs. Describe your app in natural language → Ingot resolves the config → scaffolds the project → verifies the build. The full AI dev loop, closed.

### v3 — The Marketplace
Community registry for named, versioned, shareable builds.

```bash
npx ingot init my-app --from @courtney/saas-starter
```

---

## Monorepo Structure

```
ingot/
  packages/
    cli/       # ingot CLI (TypeScript, Clack)
    core/      # ingot.json schema, Zod validation, orchestration logic
    mcp/       # v2 MCP server
  apps/
    web/       # ingot.ink (Next.js)
    registry/  # v3 marketplace API
```

---

## Why Not Templates?

Template-based scaffolders (create-t3-app, Nx generators) maintain copies of files that drift from upstream. When Next.js ships a new major version, every template needs a manual update.

Ingot delegates setup to each tool's own CLI — which is always current. Ingot only maintains the knowledge of *which* commands to run and *how* to wire their outputs together.

---

## Domain

[ingot.ink](https://ingot.ink)
