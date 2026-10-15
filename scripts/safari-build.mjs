import { spawnSync } from 'node:child_process';
import { mkdirSync, openSync, closeSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { verifySafariApp } from './verify-safari-app.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const [platform = 'ios', action = 'build'] = process.argv.slice(2);
assert.ok(['ios', 'macos'].includes(platform), 'Use ios or macos');
assert.ok(['build', 'simulator', 'archive', 'export-development', 'export-distribution'].includes(action));
assert.ok(platform === 'ios' || action !== 'simulator');
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
const version = pkg.version.split('.').map(Number);
assert.ok(version.length === 3 && version.every(Number.isInteger));
const build = String(version[0] * 10000 + version[1] * 100 + version[2]);
const team = process.env.SAFARI_DEVELOPMENT_TEAM || 'C367M6C798';
assert.match(team, /^[A-Z0-9]{10}$/, 'Invalid Apple Developer Team ID');
const app = process.env.SAFARI_APP_NAME || 'TongWenTangFixed';
const project = resolve(root, process.env.SAFARI_PROJECT_LOCATION || 'apple', app, `${app}.xcodeproj`);
assert.ok(existsSync(project), 'Run npm run safari:convert first');
const output = resolve(root, 'build', 'apple');
mkdirSync(resolve(output, 'logs'), { recursive: true });
const archive = resolve(output, `${platform}.xcarchive`);
let args;
if (action.startsWith('export-')) {
  assert.ok(existsSync(archive), 'Archive the app before exporting it');
  verifySafariApp(resolve(archive, 'Products/Applications', `${app}.app`), platform);
  const distribution = action === 'export-distribution';
  const method = distribution ? (platform === 'ios' ? 'app-store-connect' : 'developer-id') : 'debugging';
  const certificate = distribution
    ? platform === 'ios'
      ? 'Apple Distribution'
      : 'Developer ID Application'
    : 'Apple Development';
  const options = resolve(output, `ExportOptions-${platform}-${method}.plist`);
  writeFileSync(
    options,
    `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd"><plist version="1.0"><dict><key>method</key><string>${method}</string><key>destination</key><string>export</string><key>teamID</key><string>${team}</string><key>signingStyle</key><string>automatic</string><key>signingCertificate</key><string>${certificate}</string><key>manageAppVersionAndBuildNumber</key><false/></dict></plist>`,
  );
  args = [
    '-exportArchive',
    '-archivePath',
    archive,
    '-exportPath',
    resolve(output, `${platform}-${method}`),
    '-exportOptionsPlist',
    options,
    '-allowProvisioningUpdates',
  ];
} else {
  const simulator = action === 'simulator';
  const destination =
    process.env.SAFARI_DESTINATION ||
    (platform === 'macos' ? 'platform=macOS' : simulator ? 'generic/platform=iOS Simulator' : 'generic/platform=iOS');
  args = [
    '-project',
    project,
    '-scheme',
    `${app} (${platform === 'ios' ? 'iOS' : 'macOS'})`,
    '-configuration',
    action === 'archive' ? 'Release' : 'Debug',
    '-destination',
    destination,
    '-derivedDataPath',
    resolve(output, simulator ? 'SimulatorData' : 'DeviceData'),
    `MARKETING_VERSION=${pkg.version}`,
    `CURRENT_PROJECT_VERSION=${build}`,
    `DEVELOPMENT_TEAM=${team}`,
    'CODE_SIGN_STYLE=Automatic',
  ];
  if (process.env.SAFARI_UNSIGNED === '1' || simulator) args.push('CODE_SIGNING_ALLOWED=NO');
  else args.push('-allowProvisioningUpdates');
  if (process.env.SAFARI_XCCONFIG) args.push('-xcconfig', resolve(process.env.SAFARI_XCCONFIG));
  if (action === 'archive') args.push('-archivePath', archive, 'archive');
  else args.push('build');
}
const log = resolve(output, 'logs', `${platform}-${action}.log`);
const descriptor = openSync(log, 'w');
const result = spawnSync('xcodebuild', args, { cwd: root, stdio: ['ignore', descriptor, descriptor] });
closeSync(descriptor);
if (result.error || result.status !== 0) {
  console.error(readFileSync(log, 'utf8').split('\n').slice(-40).join('\n'));
  console.error(result.error?.message ?? `Xcode failed; full log: ${log}`);
  process.exit(result.status || 1);
}
console.log(`${platform} ${action} succeeded. Log: ${log}`);
if (!action.startsWith('export-')) {
  const appPath =
    action === 'archive'
      ? resolve(archive, 'Products/Applications', `${app}.app`)
      : resolve(
          output,
          action === 'simulator' ? 'SimulatorData' : 'DeviceData',
          'Build/Products',
          platform === 'macos' ? 'Debug' : action === 'simulator' ? 'Debug-iphonesimulator' : 'Debug-iphoneos',
          `${app}.app`,
        );
  verifySafariApp(appPath, platform);
}
