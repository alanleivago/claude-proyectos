import { chromium } from 'playwright-core';
const b = await chromium.connectOverCDP('http://localhost:9333');
const ctx = b.contexts()[0]; const p = await ctx.newPage();
await p.goto('https://www.instagram.com/mikewaynedotcom/reels/'); await p.waitForTimeout(6000);
const seen = new Map();
for (let i = 0; i < 70; i++) {
  const items = await p.$$eval('a[href*="/reel/"]', as => as.map(a => [a.href, (a.querySelector('img')?.alt || a.innerText || '').slice(0, 120)]));
  for (const [h, t] of items) if (!seen.has(h)) seen.set(h, t);
  await p.mouse.wheel(0, 3000); await p.waitForTimeout(1500);
}
console.log([...seen].map(([h, t]) => h + ' | ' + t.replace(/\n/g, ' ')).join('\n'));
await p.close(); process.exit(0);
