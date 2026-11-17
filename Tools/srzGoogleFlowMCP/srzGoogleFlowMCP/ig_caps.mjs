import { chromium } from 'playwright-core'; import fs from 'fs';
const urls = fs.readFileSync(process.argv[2], 'utf8').split('\n').filter(Boolean);
const b = await chromium.connectOverCDP('http://localhost:9333');
const p = await b.contexts()[0].newPage(); const out = [];
for (const u of urls) {
  try { await p.goto(u, { timeout: 30000 }); await p.waitForTimeout(2500);
    const d = await p.$eval('meta[property="og:title"], meta[name="description"]', m => m.content).catch(() => '');
    out.push(u + ' | ' + d.replace(/\s+/g, ' ').slice(0, 200));
  } catch (e) { out.push(u + ' | ERR'); }
  fs.writeFileSync(process.argv[3], out.join('\n'));
}
await p.close(); process.exit(0);
