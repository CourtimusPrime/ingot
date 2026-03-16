import { existsSync } from 'fs';
import { execSync } from 'child_process';

export type PackageManager = 'bun' | 'pnpm' | 'npm';

function isAvailable(bin: string): boolean {
  try {
    execSync(`which ${bin}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

export function detectPackageManager(cwd: string = process.cwd()): PackageManager {
  if (existsSync(`${cwd}/bun.lockb`)) return 'bun';
  if (existsSync(`${cwd}/pnpm-lock.yaml`)) return 'pnpm';
  if (existsSync(`${cwd}/package-lock.json`)) return 'npm';

  if (isAvailable('bun')) return 'bun';
  if (isAvailable('pnpm')) return 'pnpm';

  return 'npm';
}
