import { execFileSync } from 'node:child_process';
import { existsSync, copyFileSync, cpSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = fileURLToPath(new URL('../', import.meta.url));
const extensionPath = resolve(rootDir, 'dist', 'safari');
const projectLocation = resolve(rootDir, process.env.SAFARI_PROJECT_LOCATION || 'apple');
const appName = process.env.SAFARI_APP_NAME || 'TongWenTangFixed';
const bundleIdentifier = process.env.SAFARI_BUNDLE_ID || 'com.makcheunghei.tongwentangfixed';
const project = resolve(projectLocation, appName, `${appName}.xcodeproj`);
if (!existsSync(resolve(extensionPath, 'manifest.json')))
  throw new Error(`Build the Safari extension first: ${extensionPath}`);
if (!existsSync(project)) {
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
      '--no-open',
      '--no-prompt',
    ],
    { stdio: 'inherit' },
  );
  // A runner with an older Xcode can generate its own compatible project,
  // while compiling the same versioned native sources and onboarding pages.
  const template = resolve(rootDir, 'apple', 'TongWenTangFixed', 'Shared (App)');
  const generated = resolve(projectLocation, appName, 'Shared (App)');
  if (template !== generated && existsSync(template)) {
    copyFileSync(resolve(template, 'ViewController.swift'), resolve(generated, 'ViewController.swift'));
    cpSync(resolve(template, 'Resources'), resolve(generated, 'Resources'), { recursive: true });
  }
}
// Preserve the native sources, signing configuration and all four targets.
console.log(`Safari iOS / iPadOS / macOS project: ${project}`);
