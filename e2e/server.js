import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.map': 'application/json',
};

const server = http.createServer((req, res) => {
  let filePath;

  // Route mapping
  if (req.url === '/' || req.url === '/vanilla') {
    filePath = path.join(__dirname, 'fixtures', 'vanilla.html');
  } else if (req.url === '/react') {
    filePath = path.join(__dirname, 'fixtures', 'react.html');
  } else if (req.url === '/vue') {
    filePath = path.join(__dirname, 'fixtures', 'vue.html');
  } else if (req.url.startsWith('/dist/')) {
    // Serve built packages: /dist/core/index.js -> packages/core/dist/index.js
    const parts = req.url.replace('/dist/', '').split('/');
    const pkg = parts[0]; // e.g., 'core', 'react', 'vue'
    const rest = parts.slice(1).join('/'); // e.g., 'index.js'
    filePath = path.join(rootDir, 'packages', pkg, 'dist', rest);
  } else {
    filePath = path.join(rootDir, req.url);
  }

  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end(`Not found: ${req.url}`);
      } else {
        res.writeHead(500);
        res.end(`Server error: ${err.code}`);
      }
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
      });
      res.end(content);
    }
  });
});

const PORT = process.env.PORT || 3456;
server.listen(PORT, () => {
  console.log(`E2E test server running at http://localhost:${PORT}`);
  console.log('Routes:');
  console.log('  /vanilla - Vanilla JS test');
  console.log('  /react   - React test');
  console.log('  /vue     - Vue test');
});
