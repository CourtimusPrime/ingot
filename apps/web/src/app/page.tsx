"use client";

import { useState } from "react";
import Link from "next/link";
import { ConfiguratorForm, type FormConfig } from "@/components/ConfiguratorForm";
import { PreviewPanel } from "@/components/PreviewPanel";

const EMPTY_CONFIG: FormConfig = {
  name: "",
  framework: "",
  dbProvider: "",
  dbOrm: "",
  auth: "",
  uiTheme: "",
  deployment: "",
};

export default function ConfiguratorPage() {
  const [config, setConfig] = useState<FormConfig>(EMPTY_CONFIG);

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
        <main className="flex-1 overflow-y-auto p-8">
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

            <ConfiguratorForm onConfigChange={setConfig} />
          </div>
        </main>

        {/* Preview panel */}
        <PreviewPanel config={config} />
      </div>
    </div>
  );
}
