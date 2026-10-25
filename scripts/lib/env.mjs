/**
 * Reading a value from the environment, falling back to .env.
 *
 * The scripts are run by hand as often as by a tool, and nobody wants to prefix every command
 * with the key they already wrote down once. .env is gitignored, which is what makes this safe.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

export function env(name) {
  if (process.env[name]) return process.env[name];
  try {
    const line = readFileSync(join(ROOT, '.env'), 'utf8')
      .split('\n')
      .find((l) => l.startsWith(`${name}=`));
    return line?.slice(name.length + 1).trim();
  } catch {
    return undefined;
  }
}
