import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyBuild } from './verify-build.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const vendor = process.argv[2];
verifyBuild(vendor);
const temporary = mkdtempSync(resolve(tmpdir(), 'tongwen-package-'));
try {
  const archive = resolve(temporary, `new-tongwentang-fixed-${vendor}.zip`);
  execFileSync('zip', ['-qr', archive, '.'], { cwd: resolve(root, 'dist', vendor), stdio: 'inherit' });
  execFileSync('unzip', ['-tq', archive], { stdio: 'inherit' });
  const destination = resolve(root, 'web-ext-artifacts');
  mkdirSync(destination, { recursive: true });
  copyFileSync(archive, resolve(destination, `new-tongwentang-fixed-${vendor}.zip`));
} finally {
  rmSync(temporary, { recursive: true });
}
