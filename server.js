const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const POSITIONS_FILE = path.join(__dirname, 'characters.json');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};

function send(res, status, body, type) {
  res.writeHead(status, { 'Content-Type': type || 'text/plain; charset=utf-8' });
  res.end(body);
}

function serveStatic(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) return send(res, 404, 'Не найдено');
    send(res, 200, data, MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream');
  });
}

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  if (url === '/api/positions') {
    fs.readFile(POSITIONS_FILE, 'utf8', (err, data) => {
      if (err) return send(res, 500, JSON.stringify({ error: 'Не удалось прочитать characters.json' }), MIME['.json']);
      send(res, 200, data, MIME['.json']);
    });
    return;
  }

  if (url === '/' || url === '/index.html') {
    return serveStatic(res, path.join(PUBLIC_DIR, 'index.html'));
  }

  const safePath = path.normalize(url).replace(/^([/\\])+/, '');
  const filePath = path.join(PUBLIC_DIR, safePath);
  if (!filePath.startsWith(PUBLIC_DIR)) return send(res, 403, 'Доступ запрещён');
  serveStatic(res, filePath);
});

server.listen(PORT, () => {
  console.log(`Конструктор персонажей запущен: http://localhost:${PORT}`);
});
