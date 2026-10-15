import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const files = directory =>
  readdirSync(directory, { withFileTypes: true }).flatMap(entry =>
    entry.isDirectory() ? files(join(directory, entry.name)).map(file => join(entry.name, file)) : [entry.name],
  );
const plist = path =>
  JSON.parse(execFileSync('/usr/bin/plutil', ['-convert', 'json', '-o', '-', path], { encoding: 'utf8' }));

export function verifySafariApp(appPath, platform) {
  const mac = platform === 'macos';
  const appRoot = resolve(appPath, mac ? 'Contents' : '.');
  const plugins = resolve(appRoot, 'PlugIns');
  const extensions = readdirSync(plugins).filter(file => file.endsWith('.appex'));
  assert.equal(extensions.length, 1, 'Expected one Safari extension');
  const extensionRoot = resolve(plugins, extensions[0], mac ? 'Contents' : '.');
  const resources = resolve(extensionRoot, mac ? 'Resources' : '.');
  const source = resolve(root, 'dist/safari');
  for (const file of files(source)) {
    assert.ok(
      existsSync(resolve(resources, file)),
      `Missing Safari resource: ${file}. Refresh the Xcode extension resources before archiving.`,
    );
    assert.ok(
      readFileSync(resolve(source, file)).equals(readFileSync(resolve(resources, file))),
      `Stale Safari resource: ${file}`,
    );
  }
  const app = plist(resolve(appRoot, 'Info.plist'));
  const extension = plist(resolve(extensionRoot, 'Info.plist'));
  const version = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')).version;
  assert.equal(app.CFBundleShortVersionString, version);
  assert.equal(extension.CFBundleShortVersionString, version);
  assert.equal(app.CFBundleVersion, extension.CFBundleVersion);
  assert.equal(extension.CFBundleIdentifier, `${app.CFBundleIdentifier}.Extension`);
  if (!mac) assert.deepEqual(app.UIDeviceFamily, [1, 2], 'The app must support both iPhone and iPad');
  console.log(`${platform}: native app ${version}, extension identity and every Safari resource verified`);
}
