import type { IngotConfig } from './schema.js';

export type OrchestratorStep = {
  label: string;
  command: string | (() => Promise<void>);
  envVars: string[];
  postRun?: () => Promise<void>;
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

export function getSteps(config: IngotConfig): OrchestratorStep[] {
  return [getFrameworkStep(config)];
}
