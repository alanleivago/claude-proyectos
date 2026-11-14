const path = require('path');
const { chromium } = require(path.join(__dirname, 'srzGoogleFlowMCP', 'srzGoogleFlowMCP', 'node_modules', 'playwright-core'));
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9333');
  const pages = b.contexts().flatMap(c => c.pages());
  for (const p of pages) console.log(p.url());
  if (process.argv[2] === '--close-extra') {
    const flow = pages.filter(p => /flow\.google/.test(p.url()));
    const keep = flow.find(p => process.argv[3] && p.url().includes(process.argv[3])) || flow[flow.length - 1];
    for (const p of flow) if (p !== keep) { await p.close(); console.log('cerrada', p.url()); }
  }
  process.exit(0);
})().catch(e => { console.log('err', e.message); process.exit(0); });
