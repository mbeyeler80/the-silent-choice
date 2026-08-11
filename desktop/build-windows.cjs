const fs = require('node:fs/promises');
const path = require('node:path');
const { createWindowsInstaller } = require('electron-winstaller');

const desktopRoot = __dirname;
const outputRoot = path.join(desktopRoot, 'out');
const localPackagedRoot = path.join(outputRoot, 'package');
const installerRoot = path.join(outputRoot, 'installer');

async function build() {
  const { packager } = await import('@electron/packager');
  const packageOnly = process.argv.includes('--package-only');
  const packagedRoot = packageOnly
    ? localPackagedRoot
    : await fs.mkdtemp(path.join(path.parse(desktopRoot).root, 'tmp', 'tsc-win-'));

  if (packageOnly) {
    await fs.rm(packagedRoot, { recursive: true, force: true });
    await fs.mkdir(packagedRoot, { recursive: true });
  }

  const appPaths = await packager({
    dir: desktopRoot,
    out: packagedRoot,
    platform: 'win32',
    arch: 'x64',
    overwrite: true,
    prune: false,
    asar: false,
    name: 'TheSilentChoice',
    executableName: 'TheSilentChoice',
    appVersion: '0.3.0',
    appCopyright: 'Copyright © 2026 Marcel Beyeler',
    win32metadata: {
      CompanyName: 'Marcel Beyeler',
      FileDescription: 'The Silent Choice - First Playable Alpha',
      InternalName: 'TheSilentChoice',
      OriginalFilename: 'TheSilentChoice.exe',
      ProductName: 'The Silent Choice',
    },
    ignore: [
      /^\/node_modules($|\/)/,
      /^\/out($|\/)/,
      /^\/build-windows\.cjs$/,
      /^\/forge\.config\.js$/,
      /^\/pnpm-lock\.yaml$/,
    ],
  });

  const appDirectory = appPaths[0];
  console.log('Packaged application: ' + appDirectory);

  if (packageOnly) return;

  await fs.rm(installerRoot, { recursive: true, force: true });
  await fs.mkdir(installerRoot, { recursive: true });

  await createWindowsInstaller({
    appDirectory,
    outputDirectory: installerRoot,
    authors: 'Marcel Beyeler',
    copyright: 'Copyright © 2026 Marcel Beyeler',
    description: 'First complete playable alpha of The Silent Choice.',
    exe: 'TheSilentChoice.exe',
    setupExe: 'TheSilentChoiceSetup.exe',
    noMsi: true,
  });

  await fs.rm(packagedRoot, { recursive: true, force: true });
  console.log('Windows installer: ' + path.join(installerRoot, 'TheSilentChoiceSetup.exe'));
}

build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
