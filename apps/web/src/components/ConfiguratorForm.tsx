"use client";

import { useState } from "react";

export type FormConfig = {
  name: string;
  framework: string;
  dbProvider: string;
  dbOrm: string;
  auth: string;
  uiTheme: string;
  deployment: string;
};

type CardOption = {
  value: string;
  label: string;
  description?: string;
  color?: string;
};

type Step =
  | { field: keyof FormConfig; label: string; type: "text"; placeholder: string }
  | { field: keyof FormConfig; label: string; type: "cards"; options: CardOption[] };

const STEPS: Step[] = [
  {
    field: "name",
    label: "Project name",
    type: "text",
    placeholder: "my-app",
  },
  {
    field: "framework",
    label: "Framework",
    type: "cards",
    options: [
      { value: "nextjs", label: "Next.js", description: "React framework with App Router" },
      { value: "tanstack-start", label: "TanStack Start", description: "Full-stack React with TanStack Router" },
      { value: "remix", label: "Remix", description: "Full-stack React with nested routing" },
    ],
  },
  {
    field: "dbProvider",
    label: "Database provider",
    type: "cards",
    options: [
      { value: "postgres", label: "PostgreSQL", description: "Relational, production-grade" },
      { value: "mysql", label: "MySQL", description: "Widely supported relational DB" },
      { value: "sqlite", label: "SQLite", description: "Embedded, zero-config" },
    ],
  },
  {
    field: "dbOrm",
    label: "ORM",
    type: "cards",
    options: [
      { value: "drizzle", label: "Drizzle", description: "Lightweight, type-safe ORM" },
      { value: "prisma", label: "Prisma", description: "Full-featured ORM with migrations" },
    ],
  },
  {
    field: "auth",
    label: "Auth",
    type: "cards",
    options: [
      { value: "clerk", label: "Clerk", description: "Hosted auth with UI components" },
      { value: "better-auth", label: "Better Auth", description: "Flexible self-hosted auth" },
      { value: "nextauth", label: "NextAuth.js", description: "Auth.js for Next.js" },
      { value: "none", label: "None", description: "Skip auth setup" },
    ],
  },
  {
    field: "uiTheme",
    label: "UI theme",
    type: "cards",
    options: [
      { value: "zinc", label: "Zinc", color: "#71717a" },
      { value: "slate", label: "Slate", color: "#64748b" },
      { value: "stone", label: "Stone", color: "#78716c" },
      { value: "gray", label: "Gray", color: "#6b7280" },
      { value: "neutral", label: "Neutral", color: "#737373" },
      { value: "red", label: "Red", color: "#ef4444" },
      { value: "rose", label: "Rose", color: "#f43f5e" },
      { value: "orange", label: "Orange", color: "#f97316" },
      { value: "blue", label: "Blue", color: "#3b82f6" },
      { value: "yellow", label: "Yellow", color: "#eab308" },
      { value: "violet", label: "Violet", color: "#8b5cf6" },
    ],
  },
  {
    field: "deployment",
    label: "Deployment",
    type: "cards",
    options: [
      { value: "vercel", label: "Vercel", description: "Zero-config frontend cloud" },
      { value: "cloudflare", label: "Cloudflare", description: "Edge-native Workers platform" },
      { value: "railway", label: "Railway", description: "Deploy anything, simply" },
    ],
  },
];

const EMPTY: FormConfig = {
  name: "",
  framework: "",
  dbProvider: "",
  dbOrm: "",
  auth: "",
  uiTheme: "",
  deployment: "",
};

type Props = {
  onConfigChange?: (config: FormConfig) => void;
};

export function ConfiguratorForm({ onConfigChange }: Props) {
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState<FormConfig>(EMPTY);

  const current = STEPS[step];
  const value = config[current.field];
  const isLast = step === STEPS.length - 1;

  function update(field: keyof FormConfig, val: string) {
    const next = { ...config, [field]: val };
    setConfig(next);
    onConfigChange?.(next);
  }

  function canAdvance() {
    return value.trim() !== "";
  }

  function advance() {
    if (canAdvance() && step < STEPS.length - 1) {
      setStep((s) => s + 1);
    }
  }

  function back() {
    if (step > 0) setStep((s) => s - 1);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Step indicator */}
      <div className="flex items-center gap-3">
        {STEPS.map((s, i) => (
          <button
            key={s.field}
            onClick={() => {
              // Only allow navigating to completed steps or current step
              if (i <= step) setStep(i);
            }}
            style={{
              width: i === step ? "24px" : "6px",
              height: "6px",
              backgroundColor:
                i < step
                  ? "var(--text-muted)"
                  : i === step
                  ? "var(--text)"
                  : "var(--border)",
              border: "none",
              padding: 0,
              cursor: i <= step ? "pointer" : "default",
              transition: "width 0.2s, background-color 0.2s",
              flexShrink: 0,
            }}
            aria-label={s.label}
          />
        ))}
        <span style={{ color: "var(--text-dim)" }} className="text-xs ml-1">
          {step + 1} / {STEPS.length}
        </span>
      </div>

      {/* Step label */}
      <div>
        <h2 style={{ color: "var(--text)" }} className="text-sm font-medium mb-1">
          {current.label}
        </h2>
      </div>

      {/* Step content */}
      {current.type === "text" ? (
        <input
          type="text"
          value={value}
          onChange={(e) => update(current.field, e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && advance()}
          placeholder={current.placeholder}
          autoFocus
          style={{
            backgroundColor: "var(--bg-subtle)",
            border: "1px solid var(--border)",
            color: "var(--text)",
            outline: "none",
            fontFamily: "inherit",
            fontSize: "13px",
          }}
          className="w-full px-3 py-2 focus:ring-0"
        />
      ) : (
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns:
              current.field === "uiTheme"
                ? "repeat(auto-fill, minmax(100px, 1fr))"
                : "repeat(auto-fill, minmax(180px, 1fr))",
          }}
        >
          {current.options.map((opt) => {
            const selected = value === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => update(current.field, opt.value)}
                style={{
                  backgroundColor: selected ? "var(--bg-subtle)" : "transparent",
                  border: selected ? "1px solid var(--text-muted)" : "1px solid var(--border)",
                  color: selected ? "var(--text)" : "var(--text-muted)",
                  textAlign: "left",
                  fontFamily: "inherit",
                  fontSize: "12px",
                  cursor: "pointer",
                  transition: "border-color 0.15s, color 0.15s",
                }}
                className="p-3 flex flex-col gap-1"
              >
                {opt.color && (
                  <span
                    style={{
                      display: "block",
                      width: "12px",
                      height: "12px",
                      backgroundColor: opt.color,
                      marginBottom: "4px",
                      flexShrink: 0,
                    }}
                  />
                )}
                <span className="font-medium" style={{ color: selected ? "var(--text)" : "var(--text-muted)" }}>
                  {opt.label}
                </span>
                {opt.description && (
                  <span style={{ color: "var(--text-dim)", fontSize: "11px" }}>
                    {opt.description}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center gap-3 mt-2">
        {step > 0 && (
          <button
            onClick={back}
            style={{
              backgroundColor: "transparent",
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
              fontFamily: "inherit",
              fontSize: "12px",
              cursor: "pointer",
            }}
            className="px-4 py-2"
          >
            back
          </button>
        )}
        {!isLast && (
          <button
            onClick={advance}
            disabled={!canAdvance()}
            style={{
              backgroundColor: canAdvance() ? "var(--text)" : "var(--bg-subtle)",
              border: "1px solid transparent",
              color: canAdvance() ? "var(--bg)" : "var(--text-dim)",
              fontFamily: "inherit",
              fontSize: "12px",
              cursor: canAdvance() ? "pointer" : "default",
              transition: "background-color 0.15s, color 0.15s",
            }}
            className="px-4 py-2"
          >
            next
          </button>
        )}
        {isLast && (
          <button
            disabled={!canAdvance()}
            style={{
              backgroundColor: canAdvance() ? "var(--text)" : "var(--bg-subtle)",
              border: "1px solid transparent",
              color: canAdvance() ? "var(--bg)" : "var(--text-dim)",
              fontFamily: "inherit",
              fontSize: "12px",
              cursor: canAdvance() ? "pointer" : "default",
              transition: "background-color 0.15s, color 0.15s",
            }}
            className="px-4 py-2"
          >
            generate
          </button>
        )}
      </div>
    </div>
  );
}
