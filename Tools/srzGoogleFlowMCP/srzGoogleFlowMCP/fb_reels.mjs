import { chromium } from 'playwright-core';
const b = await chromium.connectOverCDP('http://localhost:9333');
const p = await b.contexts()[0].newPage();
await p.goto('https://www.facebook.com/mikewaynedotcom/reels/'); await p.waitForTimeout(7000);
const seen = new Map();
for (let i = 0; i < 40; i++) {
  const it = await p.$$eval('a[href*="/reel/"]', as => as.map(a => [a.href.split('?')[0], (a.getAttribute('aria-label') || a.innerText || '').slice(0, 150)]));
  for (const [h, t] of it) if (!seen.has(h)) seen.set(h, t);
  await p.mouse.wheel(0, 2500); await p.waitForTimeout(2000);
}
console.log([...seen].map(([h, t]) => h + ' | ' + t.replace(/\s+/g, ' ')).join('\n'));
await p.close(); process.exit(0);
