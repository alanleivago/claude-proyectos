import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { chromium } from 'playwright';
const ROOT = 'F:/Claude Proyectos/pieces/zombie-08-farm/engine';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.ttf': 'font/ttf', '.glb': 'model/gltf-binary' };
const server = http.createServer((req, res) => { const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res); }).listen(0);
const b = await chromium.launch({ args: ['--use-angle=d3d11', '--ignore-gpu-blocklist'] }); const pg = await b.newPage({ viewport: { width: 700, height: 400 } });
await pg.goto(`http://localhost:${server.address().port}/index.html?sets=farm&cam=0.9,1.3,7.6,0,1.0,6.0,30`); await pg.waitForFunction(() => window.READY === true, null, { timeout: 180000 });
const offs = [[0, 0.62, 0.55], [0, 0.7, 0], [0, 0.6, -0.5], [0.5, 0.6, 0], [-0.5, 0.6, 0], [0, 0.3, 0.6]];
for (let i = 0; i < offs.length; i++) { const u = await pg.evaluate(([o]) => { window.MUGOFF = o; window.renderFrame(Math.round((window.CTX.T['04_porch'] + 1.5) * 30)); return document.querySelector('canvas').toDataURL('image/png'); }, [offs[i]]); fs.writeFileSync(`F:/Claude Proyectos/pieces/zombie-08-farm/review/mug_${i}.png`, Buffer.from(u.split(',')[1], 'base64')); }
await b.close(); server.close(); console.log('ok');
