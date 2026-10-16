import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = fileURLToPath(new URL('../', import.meta.url));
const requireModule = createRequire(import.meta.url);
const pkg = requireModule('../package.json');
const { createManifest } = requireModule('../manifest.js');

export function verifyBuild(vendor) {
  assert.ok(['chromium', 'firefox', 'safari'].includes(vendor), 'Unknown browser target');
  const dir = resolve(root, 'dist', vendor);
  const manifest = JSON.parse(readFileSync(resolve(dir, 'manifest.json'), 'utf8'));
  assert.deepEqual(manifest, JSON.parse(JSON.stringify(createManifest(vendor))), 'Built manifest differs from source');
  assert.equal(manifest.version, pkg.version);
  assert.equal(manifest.manifest_version, 3);
  if (vendor === 'safari') {
    assert.deepEqual(Object.keys(manifest.commands).sort(), ['w_s2t', 'w_t2s']);
    assert.ok(!manifest.optional_permissions?.some(permission => permission.startsWith('clipboard')));
    assert.equal(manifest.action.default_popup, 'popup.html');
  }
  const files = [
    ...Object.values(manifest.icons),
    ...(manifest.background.scripts ?? [manifest.background.service_worker]),
    ...manifest.content_scripts.flatMap(script => script.js),
    manifest.options_ui.page,
    `_locales/${manifest.default_locale}/messages.json`,
    ...(vendor === 'chromium' ? ['clipboard.html', 'clipboard.js'] : []),
    ...(vendor === 'safari' ? ['popup.html', 'popup.js', 'popup.css'] : []),
  ];
  for (const file of files) {
    const name = resolve(dir, file);
    const rel = relative(dir, name);
    assert.ok(
      !rel.startsWith('..') && !isAbsolute(rel) && existsSync(name),
      `Missing or unsafe extension file: ${file}`,
    );
  }
  for (const file of files.filter(file => file.endsWith('.html'))) {
    const html = readFileSync(resolve(dir, file), 'utf8');
    for (const [, stylesheet] of html.matchAll(/<link[^>]*\bhref=["']([^"']+\.css)["']/g)) {
      assert.ok(
        !stylesheet.includes('://') && existsSync(resolve(dir, stylesheet)),
        `Missing local stylesheet: ${stylesheet}`,
      );
    }
    for (const [, script] of html.matchAll(/<script[^>]*\bsrc=["']([^"']+)["']/g)) {
      assert.ok(
        !script.includes('://') && existsSync(resolve(dir, script)),
        `Missing/local script required: ${script}`,
      );
    }
  }
  console.log(`${vendor}: Manifest V3 ${manifest.version}, referenced files verified`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.env.RELEASE_TAG) {
    assert.match(process.env.RELEASE_TAG, /^\d+\.\d+\.\d+$/, 'Release tag must be a stable version');
    assert.equal(process.env.RELEASE_TAG, pkg.version, 'Tag and package version must match');
  }
  for (const vendor of process.argv.slice(2).length ? process.argv.slice(2) : ['chromium', 'firefox'])
    verifyBuild(vendor);
}
