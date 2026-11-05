import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const port = Number(process.env.PORT || 8080);
const ALLOWED_ORIGIN = 'https://hubstry-hexasign-lab.vercel.app';

const send = (res, status, body, contentType = 'application/json; charset=utf-8') => {
  res.writeHead(status, { 'Content-Type': contentType, 'Cache-Control': 'no-store' });
  if (Buffer.isBuffer(body)) return res.end(body);
  res.end(contentType.startsWith('application/json') ? JSON.stringify(body) : body);
};

const applyCors = (req, res) => {
  if (!req.url.startsWith('/api/')) return false;
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return true;
  }
  return false;
};

async function route(req, res) {
  if (applyCors(req, res)) return;

  if (req.method === 'GET' && req.url === '/api/health') {
    return send(res, 200, { ok: true, service: 'hexasign-lab', engine: 'deterministic-structural-analogies' });
  }

  return serveStatic(req, res);
}

function serveStatic(req, res) {
  const requestPath = new URL(req.url, 'http://localhost').pathname;
  const relative = requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, '');
  const candidate = path.resolve(dist, relative);
  const safe = candidate.startsWith(dist + path.sep) ? candidate : path.join(dist, 'index.html');
  const file = fs.existsSync(safe) && fs.statSync(safe).isFile() ? safe : path.join(dist, 'index.html');
  const ext = path.extname(file);
  const contentTypes = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css', '.svg':'image/svg+xml', '.json':'application/json' };
  try { send(res, 200, fs.readFileSync(file), contentTypes[ext] || 'application/octet-stream'); }
  catch { send(res, 404, { error: 'Not found' }); }
}

http.createServer(route).listen(port, '0.0.0.0', () => {
  const service = process.env.K_SERVICE || 'local';
  const revision = process.env.K_REVISION || 'local';
  console.log(`HexaSign Lab listening on :${port} service=${service} revision=${revision}`);
});
