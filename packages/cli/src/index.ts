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
import { readFileSync } from 'node:fs';
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

interface ParsedFlags {
  name?: string;
  config?: string;
  framework?: string;
  dbProvider?: string;
  dbOrm?: string;
  auth?: string;
  uiLibrary?: string;
  uiTheme?: string;
  deployment?: string;
}

function parseArgs(args: string[]): ParsedFlags {
  const flags: ParsedFlags = {};
  let i = 0;
  while (i < args.length) {
    const arg = args[i];
    if (arg === '--config' && args[i + 1]) {
      flags.config = args[++i];
    } else if (arg === '--framework' && args[i + 1]) {
      flags.framework = args[++i];
    } else if (arg === '--db' && args[i + 1]) {
      const [provider, orm] = args[++i].split('/');
      flags.dbProvider = provider;
      flags.dbOrm = orm;
    } else if (arg === '--auth' && args[i + 1]) {
      flags.auth = args[++i];
    } else if (arg === '--ui' && args[i + 1]) {
      const parts = args[++i].split('/');
      if (parts.length === 2) {
        flags.uiLibrary = parts[0];
        flags.uiTheme = parts[1];
      } else {
        flags.uiLibrary = 'shadcn';
        flags.uiTheme = parts[0];
      }
    } else if (arg === '--deployment' && args[i + 1]) {
      flags.deployment = args[++i];
    } else if (!arg.startsWith('--')) {
      flags.name = arg;
    }
    i++;
  }
  return flags;
}

function isFullySpecified(flags: ParsedFlags): boolean {
  return !!(
    flags.name &&
    flags.framework &&
    flags.dbProvider &&
    flags.dbOrm &&
    flags.auth &&
    flags.uiTheme &&
    flags.deployment
  );
}

async function runScaffold(config: IngotConfig) {
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

async function main() {
  const argv = process.argv.slice(2);
  // Skip 'init' subcommand if present
  const args = argv[0] === 'init' ? argv.slice(1) : argv;
  const flags = parseArgs(args);

  // --config mode: load config file and run without prompts
  if (flags.config) {
    let raw: unknown;
    try {
      raw = JSON.parse(readFileSync(flags.config, 'utf8'));
    } catch {
      console.error(`Error: could not read config file "${flags.config}"`);
      process.exit(1);
    }
    let config: IngotConfig;
    try {
      config = validateConfig(raw);
    } catch (err) {
      console.error('Error: invalid config file');
      if (err instanceof Error) console.error(err.message);
      process.exit(1);
    }
    intro('ingot — full-stack scaffolder');
    await runScaffold(config);
    return;
  }

  // Fully non-interactive inline flags mode
  if (isFullySpecified(flags)) {
    let config: IngotConfig;
    try {
      config = validateConfig({
        name: flags.name,
        framework: flags.framework,
        database: { provider: flags.dbProvider, orm: flags.dbOrm },
        auth: flags.auth,
        ui: { library: flags.uiLibrary ?? 'shadcn', theme: flags.uiTheme },
        deployment: flags.deployment,
      });
    } catch (err) {
      console.error('Error: invalid flag values');
      if (err instanceof Error) console.error(err.message);
      process.exit(1);
    }
    intro('ingot — full-stack scaffolder');
    await runScaffold(config);
    return;
  }

  // Interactive mode (with optional pre-filled values from flags)
  intro('ingot — full-stack scaffolder');

  const name = flags.name
    ? flags.name
    : await prompt(() =>
        text({
          message: 'Project name',
          placeholder: 'my-app',
          validate: (v) => ((v ?? '').trim().length === 0 ? 'Project name is required' : undefined),
        })
      );

  const framework = flags.framework
    ? flags.framework as IngotConfig['framework']
    : await prompt(() =>
        select<IngotConfig['framework']>({
          message: 'Framework',
          options: [
            { value: 'nextjs', label: 'Next.js' },
            { value: 'tanstack-start', label: 'TanStack Start' },
            { value: 'remix', label: 'Remix' },
          ],
        })
      );

  const dbProvider = flags.dbProvider
    ? flags.dbProvider as IngotConfig['database']['provider']
    : await prompt(() =>
        select<IngotConfig['database']['provider']>({
          message: 'Database provider',
          options: [
            { value: 'postgres', label: 'PostgreSQL' },
            { value: 'mysql', label: 'MySQL' },
            { value: 'sqlite', label: 'SQLite' },
          ],
        })
      );

  const dbOrm = flags.dbOrm
    ? flags.dbOrm as IngotConfig['database']['orm']
    : await prompt(() =>
        select<IngotConfig['database']['orm']>({
          message: 'ORM',
          options: [
            { value: 'drizzle', label: 'Drizzle' },
            { value: 'prisma', label: 'Prisma' },
          ],
        })
      );

  const auth = flags.auth
    ? flags.auth as IngotConfig['auth']
    : await prompt(() =>
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

  const uiTheme = flags.uiTheme
    ? flags.uiTheme as IngotConfig['ui']['theme']
    : await prompt(() =>
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

  const deployment = flags.deployment
    ? flags.deployment as IngotConfig['deployment']
    : await prompt(() =>
        select<IngotConfig['deployment']>({
          message: 'Deployment target',
          options: [
            { value: 'vercel', label: 'Vercel' },
            { value: 'cloudflare', label: 'Cloudflare' },
            { value: 'railway', label: 'Railway' },
          ],
        })
      );

  let config: IngotConfig;
  try {
    config = validateConfig({
      name: (name as string).trim(),
      framework,
      database: { provider: dbProvider, orm: dbOrm },
      auth,
      ui: { library: 'shadcn', theme: uiTheme },
      deployment,
    });
  } catch (err) {
    console.error('Error: invalid configuration');
    if (err instanceof Error) console.error(err.message);
    process.exit(1);
  }

  const shouldProceed = await prompt(() =>
    confirm({
      message: `Scaffold "${config.name}" with the selected configuration?`,
    })
  );

  if (!shouldProceed) {
    cancel('Aborted.');
    process.exit(0);
  }

  await runScaffold(config);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
