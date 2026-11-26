import * as path from 'node:path';
import { runTests } from '@vscode/test-electron';

/**
 * Launches VS Code with this extension loaded and runs the integration tests.
 *
 * Set VSCODE_EXECUTABLE_PATH to test against an installed VS Code (e.g.
 * `VSCODE_EXECUTABLE_PATH=$(command -v code)`); otherwise the latest stable
 * build is downloaded into .vscode-test/.
 */
async function main() {
  const extensionDevelopmentPath = path.resolve(__dirname, '../..');
  const extensionTestsPath = path.resolve(__dirname, './suite');
  try {
    await runTests({
      vscodeExecutablePath: process.env.VSCODE_EXECUTABLE_PATH || undefined,
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs: ['--disable-extensions', '--skip-welcome', '--skip-release-notes'],
    });
  } catch {
    console.error('Integration tests failed');
    process.exit(1);
  }
}

main();
