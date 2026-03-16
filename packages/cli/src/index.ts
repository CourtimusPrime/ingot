#!/usr/bin/env node
import {
  intro,
  outro,
  text,
  select,
  confirm,
  spinner,
  cancel,
  isCancel,
  log,
} from '@clack/prompts';
import { execSync } from 'node:child_process';
import { getSteps, validateConfig } from '@ingot/core';
import type { IngotConfig } from '@ingot/core';

async function prompt<T>(fn: () => Promise<T | symbol>): Promise<T> {
  const result = await fn();
  if (isCancel(result)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }
  return result as T;
}

async function main() {
  intro('ingot — full-stack scaffolder');

  const name = await prompt(() =>
    text({
      message: 'Project name',
      placeholder: 'my-app',
      validate: (v) => ((v ?? '').trim().length === 0 ? 'Project name is required' : undefined),
    })
  );

  const framework = await prompt(() =>
    select<IngotConfig['framework']>({
      message: 'Framework',
      options: [
        { value: 'nextjs', label: 'Next.js' },
        { value: 'tanstack-start', label: 'TanStack Start' },
        { value: 'remix', label: 'Remix' },
      ],
    })
  );

  const dbProvider = await prompt(() =>
    select<IngotConfig['database']['provider']>({
      message: 'Database provider',
      options: [
        { value: 'postgres', label: 'PostgreSQL' },
        { value: 'mysql', label: 'MySQL' },
        { value: 'sqlite', label: 'SQLite' },
      ],
    })
  );

  const dbOrm = await prompt(() =>
    select<IngotConfig['database']['orm']>({
      message: 'ORM',
      options: [
        { value: 'drizzle', label: 'Drizzle' },
        { value: 'prisma', label: 'Prisma' },
      ],
    })
  );

  const auth = await prompt(() =>
    select<IngotConfig['auth']>({
      message: 'Auth',
      options: [
        { value: 'clerk', label: 'Clerk' },
        { value: 'better-auth', label: 'Better Auth' },
        { value: 'nextauth', label: 'NextAuth.js' },
        { value: 'none', label: 'None' },
      ],
    })
  );

  const uiTheme = await prompt(() =>
    select<IngotConfig['ui']['theme']>({
      message: 'Shadcn UI theme',
      options: [
        { value: 'zinc', label: 'Zinc' },
        { value: 'slate', label: 'Slate' },
        { value: 'stone', label: 'Stone' },
        { value: 'gray', label: 'Gray' },
        { value: 'neutral', label: 'Neutral' },
        { value: 'red', label: 'Red' },
        { value: 'rose', label: 'Rose' },
        { value: 'orange', label: 'Orange' },
        { value: 'blue', label: 'Blue' },
        { value: 'yellow', label: 'Yellow' },
        { value: 'violet', label: 'Violet' },
      ],
    })
  );

  const deployment = await prompt(() =>
    select<IngotConfig['deployment']>({
      message: 'Deployment target',
      options: [
        { value: 'vercel', label: 'Vercel' },
        { value: 'cloudflare', label: 'Cloudflare' },
        { value: 'railway', label: 'Railway' },
      ],
    })
  );

  const config = validateConfig({
    name: (name as string).trim(),
    framework,
    database: { provider: dbProvider, orm: dbOrm },
    auth,
    ui: { library: 'shadcn', theme: uiTheme },
    deployment,
  });

  const shouldProceed = await prompt(() =>
    confirm({
      message: `Scaffold "${config.name}" with the selected configuration?`,
    })
  );

  if (!shouldProceed) {
    cancel('Aborted.');
    process.exit(0);
  }

  const steps = getSteps(config);
  const s = spinner();

  for (const step of steps) {
    s.start(step.label);
    try {
      if (typeof step.command === 'function') {
        await step.command();
      } else {
        execSync(step.command, { stdio: 'pipe' });
      }
      if (step.postRun) {
        await step.postRun();
      }
      s.stop(step.label);
    } catch (err) {
      s.stop(`Failed: ${step.label}`);
      const cmd = typeof step.command === 'string' ? step.command : '[function]';
      log.error(`Step failed: ${step.label}`);
      log.error(`Command: ${cmd}`);
      if (err instanceof Error) {
        log.error(err.message);
      }
      process.exit(1);
    }
  }

  outro(
    [
      `Project "${config.name}" scaffolded successfully!`,
      ``,
      `  cd ${config.name}`,
      `  cp .env.example .env`,
      `  # Fill in your environment variables`,
      `  npm install`,
      `  npm run dev`,
    ].join('\n')
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
