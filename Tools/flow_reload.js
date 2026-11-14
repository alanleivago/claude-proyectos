// Recarga las pestañas de Google Flow en la Chrome por CDP que usa srz-google-flow-mcp.
// Uso: node tools/flow_reload.js   (lo llama clips.py cuando falla el gatito, en vez de esperar)
const path = require('path');
const MCP = path.join(__dirname, 'srzGoogleFlowMCP', 'srzGoogleFlowMCP');
const { chromium } = require(path.join(MCP, 'node_modules', 'playwright-core'));
const PORT = Number(process.env.FLOW_CDP_PORT || 9333);

(async () => {
  const browser = await chromium.connectOverCDP(`http://127.0.0.1:${PORT}`);
  let n = 0;
  for (const ctx of browser.contexts()) for (const p of ctx.pages()) {
    if (!/flow\.google|labs\.google/.test(p.url())) continue;
    try { await p.reload({ waitUntil: 'domcontentloaded', timeout: 60000 }); n++; } catch (e) { console.log('fallo recarga', p.url(), e.message); }
  }
  console.log(`recargadas ${n} pestañas de Flow`);
  await new Promise((r) => setTimeout(r, 8000));
  process.exit(0);
})().catch((e) => { console.log('error CDP', e.message); process.exit(0); });
