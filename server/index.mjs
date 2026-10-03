import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { callMaaS } from './maas.mjs';
import { validateAIObservation } from './validator.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const port = Number(process.env.PORT || 8080);
const PHI = (1 + Math.sqrt(5)) / 2;
const relationKeys = ['similitude','homology','equivalence','symmetry','equilibrium','compensation'];
const ALLOWED_ORIGIN = 'https://hubstry-hexasign-lab.vercel.app';

const calculateGoldenNorm = (vector) =>
  Math.sqrt(vector.reduce((acc, val, index) => acc + Math.pow(PHI, index) * val * val, 0));

const calculatePiSqrtScore = (goldenNorm) =>
  goldenNorm <= 0 ? 0 : Math.pow(goldenNorm, 1 / Math.PI);

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

const readJson = (req) => new Promise((resolve, reject) => {
  let raw = '';
  req.on('data', chunk => {
    raw += chunk;
    if (raw.length > 2_000_000) {
      reject(new Error('Request body too large'));
      req.destroy();
    }
  });
  req.on('end', () => {
    try { resolve(JSON.parse(raw || '{}')); } catch { reject(new Error('Invalid JSON')); }
  });
  req.on('error', reject);
});

function validateMetrics(metrics) {
  if (!metrics || relationKeys.some(k => typeof metrics[k] !== 'number' || metrics[k] < 0 || metrics[k] > 1)) {
    throw new Error('Invalid deterministic metrics');
  }
  const vector = relationKeys.map(k => metrics[k]);
  const goldenNorm = calculateGoldenNorm(vector);
  const piSqrtScore = calculatePiSqrtScore(goldenNorm);
  if (Math.abs(goldenNorm - metrics.goldenNorm) > 1e-9 ||
      Math.abs(piSqrtScore - metrics.piSqrtScore) > 1e-9) {
    throw new Error('Deterministic metrics failed invariant validation');
  }
}

async function route(req, res) {
  if (applyCors(req, res)) return;

  if (req.method === 'GET' && req.url === '/api/health') {
    return send(res, 200, { ok: true, service: 'hexasign-lab', aiAuthority: 'deterministic-engine' });
  }

  if (req.method === 'POST' && req.url === '/api/maas/observe') {
    try {
      const body = await readJson(req);
      const text = typeof body.text === 'string' ? body.text.trim() : '';
      if (!text) return send(res, 400, { error: 'text is required' });
      validateMetrics(body.metrics);
      const result = await callMaaS({ text, metrics: body.metrics });
      const validated = validateAIObservation(result, body.metrics);
      return send(res, validated.validation.status === 'VALID' ? 200 : 422, validated);
    } catch (error) {
      return send(res, 502, { error: error instanceof Error ? error.message : 'MaaS request failed' });
    }
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
  console.log(`HexaSign Lab listening on :${port}`);
});
