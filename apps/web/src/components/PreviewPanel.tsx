"use client";

import { useState, useCallback } from "react";
import type { FormConfig } from "./ConfiguratorForm";

type IngotJson = {
  name?: string;
  framework?: string;
  database?: { provider?: string; orm?: string };
  auth?: string;
  ui?: { library?: string; theme?: string };
  deployment?: string;
};

function toIngotJson(config: FormConfig): IngotJson {
  const out: IngotJson = {};
  if (config.name) out.name = config.name;
  if (config.framework) out.framework = config.framework;
  if (config.dbProvider || config.dbOrm) {
    out.database = {};
    if (config.dbProvider) out.database.provider = config.dbProvider;
    if (config.dbOrm) out.database.orm = config.dbOrm;
  }
  if (config.auth) out.auth = config.auth;
  if (config.uiTheme) {
    out.ui = { library: "shadcn", theme: config.uiTheme };
  }
  if (config.deployment) out.deployment = config.deployment;
  return out;
}

function toCliCommand(config: FormConfig): string {
  const parts = ["npx ingot init"];
  if (config.name) parts.push(config.name);
  if (config.framework) parts.push(`--framework ${config.framework}`);
  if (config.dbProvider && config.dbOrm)
    parts.push(`--db ${config.dbProvider}/${config.dbOrm}`);
  if (config.auth && config.auth !== "none") parts.push(`--auth ${config.auth}`);
  if (config.uiTheme) parts.push(`--ui shadcn/${config.uiTheme}`);
  if (config.deployment) parts.push(`--deployment ${config.deployment}`);
  return parts.join(" ");
}

// Simple syntax-highlighted JSON renderer (no external deps)
function renderJson(obj: IngotJson): React.ReactNode {
  const lines: React.ReactNode[] = [];
  const indent = "  ";

  function renderValue(val: unknown, depth: number): React.ReactNode {
    const pad = indent.repeat(depth);
    if (val === null) return <span style={{ color: "#569cd6" }}>null</span>;
    if (typeof val === "boolean")
      return <span style={{ color: "#569cd6" }}>{String(val)}</span>;
    if (typeof val === "number")
      return <span style={{ color: "#b5cea8" }}>{val}</span>;
    if (typeof val === "string")
      return <span style={{ color: "#ce9178" }}>"{val}"</span>;
    if (typeof val === "object" && !Array.isArray(val)) {
      const entries = Object.entries(val as Record<string, unknown>).filter(
        ([, v]) => v !== undefined
      );
      if (entries.length === 0) return <span>{"{}"}</span>;
      return (
        <>
          {"{"}
          {entries.map(([k, v], i) => (
            <span key={k}>
              {"\n"}
              {pad}
              {indent}
              <span style={{ color: "#9cdcfe" }}>"{k}"</span>
              {": "}
              {renderValue(v, depth + 1)}
              {i < entries.length - 1 ? "," : ""}
            </span>
          ))}
          {"\n"}
          {pad}
          {"}"}
        </>
      );
    }
    return <span>{JSON.stringify(val)}</span>;
  }

  lines.push(renderValue(obj, 0));
  return lines;
}

type Props = {
  config: FormConfig;
};

export function PreviewPanel({ config }: Props) {
  const [copied, setCopied] = useState(false);

  const json = toIngotJson(config);
  const cliCommand = toCliCommand(config);
  const hasAny = Object.keys(json).length > 0;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(cliCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // fallback: do nothing
    }
  }, [cliCommand]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([JSON.stringify(json, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ingot.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [json]);

  return (
    <aside
      className="w-96 shrink-0 overflow-y-auto p-6 flex flex-col gap-4"
      style={{ borderLeft: "1px solid var(--border)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span
          style={{ color: "var(--text-muted)" }}
          className="text-xs uppercase tracking-widest"
        >
          Preview
        </span>
        {hasAny && (
          <button
            onClick={handleDownload}
            style={{
              backgroundColor: "transparent",
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
              fontFamily: "inherit",
              fontSize: "11px",
              cursor: "pointer",
            }}
            className="px-2 py-1"
          >
            download ingot.json
          </button>
        )}
      </div>

      {/* JSON preview */}
      <div
        style={{
          border: "1px solid var(--border)",
          backgroundColor: "var(--bg-subtle)",
          minHeight: "120px",
        }}
        className="p-4"
      >
        {hasAny ? (
          <pre
            style={{
              color: "var(--text)",
              fontSize: "11px",
              lineHeight: "1.6",
              margin: 0,
              fontFamily: "inherit",
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
            }}
          >
            {renderJson(json)}
          </pre>
        ) : (
          <p style={{ color: "var(--text-dim)" }} className="text-xs">
            ingot.json will appear here as you make selections.
          </p>
        )}
      </div>

      {/* CLI command */}
      <div
        style={{
          border: "1px solid var(--border)",
          backgroundColor: "var(--bg-subtle)",
        }}
        className="p-4"
      >
        <pre
          style={{
            color: hasAny ? "var(--text)" : "var(--text-dim)",
            fontSize: "11px",
            lineHeight: "1.5",
            margin: 0,
            fontFamily: "inherit",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
          }}
        >
          {hasAny ? `$ ${cliCommand}` : "$ npx ingot init ..."}
        </pre>
      </div>

      {/* Copy button */}
      <button
        onClick={handleCopy}
        disabled={!hasAny}
        style={{
          backgroundColor: copied
            ? "var(--bg-subtle)"
            : hasAny
            ? "var(--text)"
            : "var(--bg-subtle)",
          border: "1px solid transparent",
          color: copied
            ? "var(--text-muted)"
            : hasAny
            ? "var(--bg)"
            : "var(--text-dim)",
          fontFamily: "inherit",
          fontSize: "12px",
          cursor: hasAny ? "pointer" : "default",
          transition: "background-color 0.15s, color 0.15s",
        }}
        className="w-full py-2"
      >
        {copied ? "copied!" : "copy command"}
      </button>
    </aside>
  );
}
