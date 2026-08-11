const { app, BrowserWindow, shell } = require('electron');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { spawn } = require('node:child_process');

function handleSquirrelEvent() {
  if (process.platform !== 'win32') return false;

  const command = process.argv[1];
  const target = path.basename(process.execPath);
  const updateExe = path.resolve(path.dirname(process.execPath), '..', 'Update.exe');
  const runUpdate = (args) => {
    const child = spawn(updateExe, args, { detached: true });
    child.on('close', () => app.quit());
    child.on('error', () => app.quit());
  };

  if (command === '--squirrel-install' || command === '--squirrel-updated') {
    runUpdate(['--createShortcut=' + target]);
    return true;
  }
  if (command === '--squirrel-uninstall') {
    runUpdate(['--removeShortcut=' + target]);
    return true;
  }
  if (command === '--squirrel-obsolete') {
    app.quit();
    return true;
  }
  return false;
}

const squirrelStartup = handleSquirrelEvent();
const smokeTest = process.argv.includes('--smoke-test');

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.wav': 'audio/wav',
};

let staticServer;
let staticOrigin;

function sendError(response, statusCode, message) {
  response.writeHead(statusCode, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  response.end(message);
}

function resolveAsset(root, requestUrl) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(requestUrl, 'http://127.0.0.1').pathname);
  } catch {
    return null;
  }

  const relativePath = pathname.replace(/^\/+/, '') || 'index.html';
  const resolvedRoot = path.resolve(root);
  const resolvedFile = path.resolve(resolvedRoot, relativePath);
  if (resolvedFile !== resolvedRoot && !resolvedFile.startsWith(resolvedRoot + path.sep)) {
    return null;
  }
  return resolvedFile;
}

function streamFile(request, response, filePath, stats) {
  const extension = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[extension] || 'application/octet-stream';
  const rangeHeader = request.headers.range;
  const baseHeaders = {
    'Accept-Ranges': 'bytes',
    'Content-Type': contentType,
    'Content-Security-Policy':
      "default-src 'self' data: blob:; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' blob:;",
    'X-Content-Type-Options': 'nosniff',
  };

  if (rangeHeader) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader);
    if (!match) {
      response.writeHead(416, {
        ...baseHeaders,
        'Content-Range': 'bytes */' + stats.size,
      });
      response.end();
      return;
    }

    const start = match[1] ? Number(match[1]) : 0;
    const end = match[2] ? Number(match[2]) : stats.size - 1;
    if (start < 0 || end < start || end >= stats.size) {
      response.writeHead(416, {
        ...baseHeaders,
        'Content-Range': 'bytes */' + stats.size,
      });
      response.end();
      return;
    }

    response.writeHead(206, {
      ...baseHeaders,
      'Content-Length': end - start + 1,
      'Content-Range': 'bytes ' + start + '-' + end + '/' + stats.size,
    });
    if (request.method === 'HEAD') {
      response.end();
      return;
    }
    fs.createReadStream(filePath, { start, end }).pipe(response);
    return;
  }

  response.writeHead(200, {
    ...baseHeaders,
    'Content-Length': stats.size,
    'Cache-Control':
      extension === '.html' ? 'no-store' : 'public, max-age=31536000, immutable',
  });
  if (request.method === 'HEAD') {
    response.end();
    return;
  }
  fs.createReadStream(filePath).pipe(response);
}

function startStaticServer() {
  const webRoot = path.join(__dirname, 'dist-windows-web');

  return new Promise((resolve, reject) => {
    staticServer = http.createServer((request, response) => {
      const filePath = resolveAsset(webRoot, request.url || '/');
      if (!filePath) {
        sendError(response, 403, 'Forbidden');
        return;
      }

      fs.stat(filePath, (error, stats) => {
        if (error || !stats.isFile()) {
          sendError(response, 404, 'Not found');
          return;
        }
        streamFile(request, response, filePath, stats);
      });
    });

    staticServer.once('error', reject);
    staticServer.listen(0, '127.0.0.1', () => {
      staticServer.removeListener('error', reject);
      const address = staticServer.address();
      if (!address || typeof address === 'string') {
        reject(new Error('Unable to determine local desktop server port.'));
        return;
      }
      resolve('http://127.0.0.1:' + address.port);
    });
  });
}

async function createWindow() {
  const window = new BrowserWindow({
    title: 'The Silent Choice',
    width: 520,
    height: 900,
    minWidth: 360,
    minHeight: 640,
    backgroundColor: '#0E1116',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (!smokeTest) window.once('ready-to-show', () => window.show());
  window.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
  window.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(staticOrigin)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  await window.loadURL(staticOrigin);
  if (smokeTest) {
    window.destroy();
    stopStaticServer();
    app.quit();
  }
}

function stopStaticServer() {
  if (staticServer) {
    staticServer.close();
    staticServer = undefined;
  }
}

if (squirrelStartup) {
  app.quit();
} else {
  app.setAppUserModelId('com.squirrel.TheSilentChoice.TheSilentChoice');

  app.whenReady()
    .then(async () => {
      staticOrigin = await startStaticServer();
      await createWindow();
      app.on('activate', async () => {
        if (BrowserWindow.getAllWindows().length === 0) await createWindow();
      });
    })
    .catch((error) => {
      console.error(error);
      stopStaticServer();
      app.quit();
    });

  app.on('window-all-closed', () => {
    stopStaticServer();
    app.quit();
  });

  app.on('before-quit', stopStaticServer);
}
