import Link from "next/link";

const docsSections = [
  { label: "What is Ingot?", href: "#what-is-ingot" },
  { label: "Quick start", href: "#quick-start" },
  { label: "CLI reference", href: "#cli-reference" },
  { label: "ingot.json schema", href: "#schema" },
  { label: "Supported pieces", href: "#supported-pieces" },
  { label: "FAQ", href: "#faq" },
];

export default function DocsPage() {
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          backgroundColor: "var(--bg)",
        }}
        className="flex items-center justify-between px-6 py-3 shrink-0"
      >
        <div className="flex items-center gap-6">
          <Link href="/">
            <span style={{ color: "var(--text)" }} className="text-sm font-medium tracking-tight">
              ingot
            </span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/"
              style={{ color: "var(--text-muted)" }}
              className="text-xs hover:text-white transition-colors"
            >
              configurator
            </Link>
            <span
              style={{
                color: "var(--text)",
                borderBottom: "1px solid var(--text)",
                paddingBottom: "1px",
              }}
              className="text-xs"
            >
              docs
            </span>
          </nav>
        </div>
        <div style={{ color: "var(--text-dim)" }} className="text-xs">
          v1
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          style={{
            borderRight: "1px solid var(--border)",
            width: "220px",
          }}
          className="overflow-y-auto p-6 shrink-0"
        >
          <div className="mb-4">
            <span
              style={{ color: "var(--text-muted)" }}
              className="text-xs uppercase tracking-widest"
            >
              Docs
            </span>
          </div>
          <nav className="flex flex-col gap-1">
            {docsSections.map((section) => (
              <a
                key={section.href}
                href={section.href}
                style={{ color: "var(--text-muted)" }}
                className="text-xs py-1 hover:text-white transition-colors"
              >
                {section.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Docs content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-2xl">
            <h1
              style={{ color: "var(--text)" }}
              className="text-lg font-medium mb-1 tracking-tight"
              id="what-is-ingot"
            >
              What is Ingot?
            </h1>
            <p style={{ color: "var(--text-muted)" }} className="text-xs mb-8 leading-relaxed">
              Ingot is a full-stack app scaffolder. Give it a config and it runs all the setup
              commands for your chosen framework, database, ORM, auth provider, and UI library.
            </p>

            <h2
              style={{ color: "var(--text)", borderTop: "1px solid var(--border)" }}
              className="text-sm font-medium mb-3 pt-6 mt-6 tracking-tight"
              id="quick-start"
            >
              Quick start
            </h2>
            <div
              style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-subtle)" }}
              className="p-4 mb-6"
            >
              <code style={{ color: "var(--text)" }} className="text-xs">
                npx ingot init
              </code>
            </div>

            <h2
              style={{ color: "var(--text)", borderTop: "1px solid var(--border)" }}
              className="text-sm font-medium mb-3 pt-6 mt-6 tracking-tight"
              id="cli-reference"
            >
              CLI reference
            </h2>
            <div style={{ color: "var(--text-muted)" }} className="text-xs leading-relaxed mb-6">
              <p className="mb-2">
                <code style={{ color: "var(--text)" }}>npx ingot init</code> — interactive mode
              </p>
              <p className="mb-2">
                <code style={{ color: "var(--text)" }}>npx ingot init --config ingot.json</code> — non-interactive with config file
              </p>
              <p>
                <code style={{ color: "var(--text)" }}>npx ingot init my-app --framework nextjs --db postgres/drizzle --auth clerk --ui shadcn/zinc --deployment vercel</code> — fully inline flags
              </p>
            </div>

            <h2
              style={{ color: "var(--text)", borderTop: "1px solid var(--border)" }}
              className="text-sm font-medium mb-3 pt-6 mt-6 tracking-tight"
              id="schema"
            >
              ingot.json schema
            </h2>
            <div
              style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-subtle)" }}
              className="p-4 mb-4 text-xs leading-relaxed"
            >
              <pre style={{ color: "var(--text)", margin: 0 }}>{`{
  "name": "my-app",
  "framework": "nextjs" | "tanstack-start" | "remix",
  "database": {
    "provider": "postgres" | "mysql" | "sqlite",
    "orm": "drizzle" | "prisma"
  },
  "auth": "clerk" | "better-auth" | "nextauth" | "none",
  "ui": {
    "library": "shadcn",
    "theme": "zinc" | "slate" | "stone" | "gray" | "neutral"
           | "red" | "rose" | "orange" | "blue" | "yellow" | "violet"
  },
  "deployment": "vercel" | "cloudflare" | "railway"
}`}</pre>
            </div>
            <div style={{ color: "var(--text-muted)" }} className="text-xs leading-relaxed mb-6">
              <p>
                All fields are required. Pass the file via{" "}
                <code style={{ color: "var(--text)" }}>npx ingot init --config ingot.json</code>.
              </p>
            </div>

            <h2
              style={{ color: "var(--text)", borderTop: "1px solid var(--border)" }}
              className="text-sm font-medium mb-3 pt-6 mt-6 tracking-tight"
              id="supported-pieces"
            >
              Supported pieces
            </h2>
            <table
              style={{ borderCollapse: "collapse", width: "100%" }}
              className="text-xs mb-6"
            >
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Field", "Values"].map((h) => (
                    <th
                      key={h}
                      style={{ color: "var(--text-muted)", textAlign: "left", paddingBottom: "8px", paddingRight: "24px" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["framework", "nextjs, tanstack-start, remix"],
                  ["database.provider", "postgres, mysql, sqlite"],
                  ["database.orm", "drizzle, prisma"],
                  ["auth", "clerk, better-auth, nextauth, none"],
                  ["ui.library", "shadcn"],
                  ["ui.theme", "zinc, slate, stone, gray, neutral, red, rose, orange, blue, yellow, violet"],
                  ["deployment", "vercel, cloudflare, railway"],
                ].map(([field, values]) => (
                  <tr key={field} style={{ borderBottom: "1px solid var(--border-muted)" }}>
                    <td style={{ color: "var(--text)", paddingTop: "8px", paddingBottom: "8px", paddingRight: "24px" }}>
                      <code>{field}</code>
                    </td>
                    <td style={{ color: "var(--text-muted)", paddingTop: "8px", paddingBottom: "8px" }}>
                      {values}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h2
              style={{ color: "var(--text)", borderTop: "1px solid var(--border)" }}
              className="text-sm font-medium mb-3 pt-6 mt-6 tracking-tight"
              id="faq"
            >
              FAQ
            </h2>
            <div style={{ color: "var(--text-muted)" }} className="text-xs leading-relaxed">
              <p className="mb-2 font-medium" style={{ color: "var(--text)" }}>
                Does Ingot modify existing projects?
              </p>
              <p className="mb-4">
                No. Ingot only scaffolds new projects from scratch.
              </p>
              <p className="mb-2 font-medium" style={{ color: "var(--text)" }}>
                Which package managers are supported?
              </p>
              <p>
                Ingot detects bun, pnpm, or npm from your environment and uses it automatically.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
