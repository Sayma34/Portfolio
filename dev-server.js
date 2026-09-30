const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const port = Number(process.env.PORT) || 5173;
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
};

const server = http.createServer((request, response) => {
  const requestPath = decodeURIComponent(request.url.split('?')[0]);
  const relativePath = requestPath === '/' ? '/portfolioooo.html' : requestPath;
  const filePath = path.resolve(root, `.${relativePath}`);

  if (!filePath.startsWith(root + path.sep)) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  fs.stat(filePath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      response.writeHead(404);
      response.end('Not found');
      return;
    }

    response.writeHead(200, {
      'Content-Type': mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream'
    });
    fs.createReadStream(filePath).pipe(response);
  });
});

let announced = false;

server.on('listening', () => {
  if (!announced) {
    const address = server.address();
    console.log(`Portfolio dev server running at http://localhost:${address.port}`);
    announced = true;
  }
});

function listen(currentPort) {
  server.once('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.log(`Port ${currentPort} is busy; trying ${currentPort + 1}...`);
      listen(currentPort + 1);
      return;
    }

    throw error;
  });

  server.listen(currentPort);
}

listen(port);
