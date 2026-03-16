import type { IngotConfig } from './schema.js';

export type OrchestratorStep = {
  label: string;
  command: string | (() => Promise<void>);
  envVars: string[];
  postRun?: () => Promise<void>;
  docUrl?: string;
};

function getFrameworkStep(config: IngotConfig): OrchestratorStep {
  const { name, framework } = config;

  if (framework === 'nextjs') {
    return {
      label: 'Scaffold Next.js app',
      command: `npx create-next-app@latest ${name} --typescript --tailwind --eslint --app --no-git --yes`,
      envVars: [],
    };
  }

  if (framework === 'tanstack-start') {
    return {
      label: 'Scaffold TanStack Start app',
      command: `npx gitpkg add tanstack/router/examples/react/start-basic ${name}`,
      envVars: [],
    };
  }

  // remix
  return {
    label: 'Scaffold Remix app',
    command: `npx create-remix@latest ${name} --yes`,
    envVars: [],
  };
}

function getDbOrmStep(config: IngotConfig): OrchestratorStep {
  const { database } = config;
  const { provider, orm } = database;

  if (orm === 'drizzle') {
    const dialectFlag =
      provider === 'postgres' ? 'postgresql' :
      provider === 'mysql' ? 'mysql' :
      'sqlite';

    return {
      label: `Install Drizzle ORM (${provider})`,
      command: `npm install drizzle-orm drizzle-kit && npx drizzle-kit generate --dialect ${dialectFlag}`,
      envVars: ['DATABASE_URL'],
    };
  }

  // prisma
  return {
    label: `Install Prisma (${provider})`,
    command: `npm install prisma @prisma/client && npx prisma init --datasource-provider ${provider}`,
    envVars: ['DATABASE_URL'],
  };
}

function getAuthStep(config: IngotConfig): OrchestratorStep | null {
  const { auth, framework } = config;

  if (auth === 'none') {
    return null;
  }

  if (auth === 'clerk') {
    const pkg = framework === 'nextjs' ? '@clerk/nextjs' : '@clerk/remix';
    return {
      label: 'Install Clerk auth',
      command: `npm install ${pkg}`,
      envVars: ['NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'CLERK_SECRET_KEY'],
      docUrl: 'https://clerk.com/docs/quickstarts/nextjs',
    };
  }

  if (auth === 'better-auth') {
    return {
      label: 'Install Better Auth',
      command: 'npm install better-auth',
      envVars: ['BETTER_AUTH_SECRET', 'BETTER_AUTH_URL'],
      docUrl: 'https://www.better-auth.com/docs/installation',
    };
  }

  // nextauth
  return {
    label: 'Install NextAuth.js',
    command: 'npm install next-auth',
    envVars: ['NEXTAUTH_SECRET', 'NEXTAUTH_URL'],
    docUrl: 'https://authjs.dev/getting-started',
  };
}

function getShadcnStep(config: IngotConfig): OrchestratorStep {
  const { ui } = config;
  return {
    label: 'Initialize Shadcn UI',
    command: `npx shadcn@latest init --theme ${ui.theme} --yes`,
    envVars: [],
  };
}

function getEnvExampleStep(steps: OrchestratorStep[]): OrchestratorStep {
  const allEnvVars = steps.flatMap((s) => s.envVars);

  return {
    label: 'Write .env.example',
    command: async () => {
      const { writeFileSync } = await import('node:fs');
      const lines = allEnvVars.map((key) => `# ${key}\n${key}=`);
      writeFileSync('.env.example', lines.join('\n') + '\n', 'utf-8');
    },
    envVars: [],
  };
}

export function getSteps(config: IngotConfig): OrchestratorStep[] {
  const steps: OrchestratorStep[] = [
    getFrameworkStep(config),
    getDbOrmStep(config),
  ];

  const authStep = getAuthStep(config);
  if (authStep) {
    steps.push(authStep);
  }

  steps.push(getShadcnStep(config));
  steps.push(getEnvExampleStep(steps));

  return steps;
}
