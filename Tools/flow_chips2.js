const path = require('path');
const { chromium } = require(path.join(__dirname, 'srzGoogleFlowMCP', 'srzGoogleFlowMCP', 'node_modules', 'playwright-core'));
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9333');
  for (const ctx of b.contexts()) for (const p of ctx.pages()) {
    if (!/e2c75ddb/.test(p.url())) continue;
    const r = await p.evaluate(() => [...document.querySelectorAll('flow-ingredient-chip')].map(c => { const a = []; let e = c.parentElement; while (e && a.length < 8) { a.push(e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.split(' ').slice(0,2).join('.') : '')); e = e.parentElement; } return a.join(' < '); }));
    console.log(r.join('\n'));
    const tb = await p.evaluate(() => { const t = document.querySelector('[contenteditable], textarea'); const a=[]; let e=t; while(e&&a.length<8){a.push(e.tagName.toLowerCase()+(typeof e.className==='string'?'.'+e.className.split(' ').slice(0,2).join('.'):''));e=e.parentElement;} return a.join(' < '); });
    console.log('PROMPT:', tb);
  }
  process.exit(0);
})().catch(e => { console.log('err', e.message); process.exit(0); });
