import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const rootDir = process.cwd();
const extensionPath = resolve(rootDir, 'dist', 'safari');
const projectLocation = resolve(rootDir, process.env.SAFARI_PROJECT_LOCATION || 'safari');
const appName = process.env.SAFARI_APP_NAME || 'TongWenTangFixed';
const bundleIdentifier = process.env.SAFARI_BUNDLE_ID || 'com.makcheunghei.tongwentangfixed';
const projectFile = resolve(projectLocation, appName, `${appName}.xcodeproj`, 'project.pbxproj');

if (!existsSync(extensionPath)) {
  console.error(`Safari extension bundle not found at ${extensionPath}`);
  process.exit(1);
}

try {
  execFileSync(
    'xcrun',
    [
      'safari-web-extension-converter',
      extensionPath,
      '--project-location',
      projectLocation,
      '--app-name',
      appName,
      '--bundle-identifier',
      bundleIdentifier,
      '--swift',
      '--macos-only',
      '--no-open',
      '--no-prompt',
      '--force',
    ],
    { stdio: 'inherit' },
  );
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Unable to generate the Safari Xcode project: ${message}`);
  process.exit(1);
}

if (existsSync(projectFile)) {
  const source = readFileSync(projectFile, 'utf8');
  const patched = source.replace(/PRODUCT_BUNDLE_IDENTIFIER = ?"?([^";]+)"?;/g, (_, value) =>
    value.endsWith('.Extension')
      ? `PRODUCT_BUNDLE_IDENTIFIER = ${bundleIdentifier}.Extension;`
      : `PRODUCT_BUNDLE_IDENTIFIER = "${bundleIdentifier}";`,
  );

  writeFileSync(projectFile, patched);
}
