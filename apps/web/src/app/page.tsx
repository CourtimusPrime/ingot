import Link from "next/link";
import { ConfiguratorForm } from "@/components/ConfiguratorForm";

export default function ConfiguratorPage() {
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
          <span
            style={{ color: "var(--text)" }}
            className="text-sm font-medium tracking-tight"
          >
            ingot
          </span>
          <nav className="flex items-center gap-4">
            <span
              style={{
                color: "var(--text)",
                borderBottom: "1px solid var(--text)",
                paddingBottom: "1px",
              }}
              className="text-xs"
            >
              configurator
            </span>
            <Link
              href="/docs"
              style={{ color: "var(--text-muted)" }}
              className="text-xs hover:text-white transition-colors"
            >
              docs
            </Link>
          </nav>
        </div>
        <div style={{ color: "var(--text-dim)" }} className="text-xs">
          v1
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Form area */}
        <main
          style={{ borderRight: "1px solid var(--border)" }}
          className="flex-1 overflow-y-auto p-8"
        >
          <div className="max-w-xl">
            <h1
              style={{ color: "var(--text)" }}
              className="text-lg font-medium mb-1 tracking-tight"
            >
              Configure your stack
            </h1>
            <p style={{ color: "var(--text-muted)" }} className="text-xs mb-8">
              Select your options below to generate an ingot.json and CLI command.
            </p>

            <ConfiguratorForm />
          </div>
        </main>

        {/* Preview panel */}
        <aside className="w-96 overflow-y-auto p-6 shrink-0">
          <div className="mb-4">
            <span style={{ color: "var(--text-muted)" }} className="text-xs uppercase tracking-widest">
              Preview
            </span>
          </div>

          {/* JSON preview placeholder */}
          <div
            style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-subtle)" }}
            className="p-4 mb-4"
          >
            <p style={{ color: "var(--text-dim)" }} className="text-xs">
              {/* Live JSON preview — US-012 */}
              ingot.json preview
            </p>
          </div>

          {/* CLI command placeholder */}
          <div
            style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-subtle)" }}
            className="p-4"
          >
            <p style={{ color: "var(--text-dim)" }} className="text-xs">
              {/* CLI command — US-012 */}
              $ npx ingot init ...
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
