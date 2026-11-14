// Diagnóstico/limpieza de chips de referencia atascados en el prompt de Flow (CDP 9333).
const path = require('path');
const { chromium } = require(path.join(__dirname, 'srzGoogleFlowMCP', 'srzGoogleFlowMCP', 'node_modules', 'playwright-core'));
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9333');
  for (const ctx of b.contexts()) for (const p of ctx.pages()) {
    if (!/flow\.google/.test(p.url())) continue;
    const n = await p.locator('flow-ingredient-chip').count();
    console.log(p.url(), 'chips:', n);
    for (let i = 0; i < n; i++) console.log((await p.locator('flow-ingredient-chip').nth(i).evaluate(e => e.outerHTML)).slice(0, 400));
    console.log('clear visible:', await p.locator('div.top-right-actions button.clear-button').isVisible().catch(() => false));
  }
  process.exit(0);
})().catch(e => { console.log('err', e.message); process.exit(0); });
