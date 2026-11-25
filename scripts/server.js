import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const PORT = 8080;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  console.log(`[REQ] ${req.method} ${req.url}`);
  // CORS & No-Cache headers to ensure instant, reliable loading in IDE webview
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  let reqPath = decodeURIComponent(req.url.split('?')[0]);

  // Dedicated Brawl Stars profile endpoint (official Supercell API + battlelog merge or configured proxy, with local verified fallback)
  if (reqPath === '/api/brawl/player') {
    const reqUrl = new URL(req.url, `http://127.0.0.1:${PORT}`);
    const tag = (reqUrl.searchParams.get('tag') || '2RGUQJQ0R').replace(/^#/, '').toUpperCase();
    const token = process.env.BRAWL_API_TOKEN?.trim();
    const proxyUrl = process.env.BRAWL_PROXY_URL?.trim();
    const fallbackPath = path.join(ROOT_DIR, 'assets', 'brawl', 'initial_player_data.json');

    const serveFallback = () => {
      if (fs.existsSync(fallbackPath)) {
        const content = fs.readFileSync(fallbackPath, 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(content);
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Profile snapshot not found' }));
      }
    };

    if (proxyUrl) {
      fetch(`${proxyUrl.replace(/\/+$/, '')}/api/brawl/player?tag=${tag}&t=${Date.now()}`)
        .then(async (pRes) => {
          if (!pRes.ok) throw new Error(`Proxy responded with ${pRes.status}`);
          const data = await pRes.json();
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify(data));
        })
        .catch(serveFallback);
      return;
    }

    if (token) {
      const encodedTag = encodeURIComponent(`#${tag}`);
      const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };
      const bases = process.env.BRAWL_API_BASE?.trim()
        ? [process.env.BRAWL_API_BASE.trim().replace(/\/+$/, '')]
        : ['https://api.brawlstars.com/v1', 'https://bsproxy.royaleapi.dev/v1'];

      (async () => {
        for (const base of bases) {
          const pRes = await fetch(`${base}/players/${encodedTag}`, { headers });
          if (pRes.ok) {
            const bRes = await fetch(`${base}/players/${encodedTag}/battlelog`, { headers }).catch(() => null);
            const player = await pRes.json();
            const battlelog = bRes && bRes.ok ? await bRes.json() : null;
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ player, battlelog, _liveSource: 'supercell-official' }));
            return;
          }
          if (pRes.status !== 403) throw new Error(`Official API responded with ${pRes.status}`);
        }
        throw new Error('Official Brawl API returned 403');
      })().catch(serveFallback);
      return;
    }

    serveFallback();
    return;
  }

  // Dedicated PSN profile endpoint (serves live proxy or synced PSN dataset when psnLinked is active)
  if (reqPath === '/api/psn/profile') {
    const reqUrl = new URL(req.url, `http://127.0.0.1:${PORT}`);
    const onlineId = reqUrl.searchParams.get('onlineId') || '';
    const psnProxyUrl = process.env.PSN_PROXY_URL?.trim();
    const psnJsonPath = path.join(ROOT_DIR, 'data', 'psn-trophies.json');

    if (psnProxyUrl) {
      const qs = onlineId ? `?onlineId=${encodeURIComponent(onlineId)}` : '';
      fetch(`${psnProxyUrl.replace(/\/+$/, '')}/psn/profile${qs}`)
        .then(async (pRes) => {
          if (!pRes.ok) throw new Error(`PSN proxy responded with ${pRes.status}`);
          const data = await pRes.json();
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify(data));
        })
        .catch(() => {
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ unlinked: true }));
        });
      return;
    }

    if (fs.existsSync(psnJsonPath)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(psnJsonPath, 'utf8'));
        if (parsed?.profile?.psnLinked) {
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify(parsed));
          return;
        }
      } catch (_) {}
    }

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ unlinked: true, onlineId }));
    return;
  }

  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(ROOT_DIR, safePath);

  // Prevent path traversal
  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end(`404 Not Found: ${reqPath}`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

// Dual-stack: :: binds both IPv6 and IPv4 on macOS
server.listen({ port: PORT, host: '::', ipv6Only: false }, () => {
  console.log(`[PS5 Server] Running at http://localhost:${PORT}/ and http://127.0.0.1:${PORT}/ (IPv4 + IPv6 dual-stack)`);
});
