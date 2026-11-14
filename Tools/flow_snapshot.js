// Captura real de un proyecto de Google Flow (la misma Chrome por CDP que usa srz-google-flow-mcp).
// Uso: node tools/flow_snapshot.js <projectId|current|home> <out.png> [busqueda] [--filter "Personajes"] [--debug]
// Abre su PROPIA pestaña, navega, (opcional) escribe la búsqueda / pulsa un filtro, espera las miniaturas,
// guarda una captura de la ventana completa y cierra solo esa pestaña. No genera nada.
const fs = require('fs');
const path = require('path');
const MCP = path.join(__dirname, 'srzGoogleFlowMCP', 'srzGoogleFlowMCP');
const { chromium } = require(path.join(MCP, 'node_modules', 'playwright-core'));

const PORT = Number(process.env.FLOW_CDP_PORT || 9333);
const ACCOUNT = process.env.FLOW_ACCOUNT || 'tiktokeeuu691@gmail.com';
const FLOW = 'https://flow.google.com/';

const args = process.argv.slice(2);
const flag = (n) => { const i = args.indexOf(n); if (i < 0) return null; const v = args[i + 1]; args.splice(i, 2); return v; };
const debug = args.includes('--debug'); if (debug) args.splice(args.indexOf('--debug'), 1);
const filter = flag('--filter');
const width = Number(flag('--width') || 1920), height = Number(flag('--height') || 1080);
const zoom = Number(flag('--zoom') || 1); // como el zoom del navegador (Ctrl -): 0.5 = el doble de miniaturas, misma imagen de 1920x1080
const scrollTo = flag('--scroll-to'); // texto/nombre de un elemento para desplazar la cuadrícula hasta él
const [proj, out, search] = args;
if (!proj || !out) { console.error('uso: node tools/flow_snapshot.js <projectId|current|home> <out.png> [busqueda] [--filter Personajes] [--debug]'); process.exit(1); }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitImages(page, ms = 20000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const pending = await page.evaluate(() => [...document.images].filter((i) => {
      const r = i.getBoundingClientRect();
      return r.width > 20 && r.bottom > 0 && r.top < innerHeight && !(i.complete && i.naturalWidth > 0);
    }).length);
    if (pending === 0) return;
    await sleep(500);
  }
}

(async () => {
  const browser = await chromium.connectOverCDP(`http://127.0.0.1:${PORT}`);
  const context = browser.contexts()[0];
  const page = await context.newPage(); // pestaña propia: la del MCP no se toca
  try {
    const cdp = await context.newCDPSession(page);
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: Math.round(width / zoom), height: Math.round(height / zoom), deviceScaleFactor: zoom, mobile: false });
    const id = proj === 'current'
      ? JSON.parse(fs.readFileSync(path.join(MCP, 'state.json'), 'utf8')).projectId
      : proj;
    const url = id === 'home' ? `${FLOW}?authuser=${ACCOUNT}` : `${FLOW}project/${id}?authuser=${ACCOUNT}`;
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
    await sleep(4000);
    if (search) {
      const box = page.locator('input[type="search"], input[placeholder*="Buscar" i], input[placeholder*="Search" i], input[aria-label*="Buscar" i], input[aria-label*="Search" i]').first();
      if (!(await box.isVisible().catch(() => false))) {
        // en algunas vistas la búsqueda es un botón con lupa que abre el campo
        const btn = page.locator('button[aria-label*="Buscar" i], button[aria-label*="Search" i], button:has(i:text-is("search"))').first();
        if (await btn.isVisible().catch(() => false)) { await btn.click(); await sleep(800); }
      }
      await box.click();
      await box.fill('');
      await page.keyboard.type(search, { delay: 60 });
      await page.keyboard.press('Enter');
      await sleep(3000);
    }
    if (filter) {
      const f = page.getByText(filter, { exact: true }).first();
      await f.click();
      await sleep(3000);
    }
    if (scrollTo) {
      const t0 = Date.now();
      while (Date.now() - t0 < 60000) {
        const el = page.locator(`img[alt*="${scrollTo}" i], [aria-label*="${scrollTo}" i]`).first();
        if (await el.count()) { await el.scrollIntoViewIfNeeded(); break; }
        await page.mouse.move(Math.round(width / zoom / 2), Math.round(height / zoom / 2));
        await page.mouse.wheel(0, 800); await sleep(700);
      }
    }
    await waitImages(page);
    await sleep(1500);
    if (debug) {
      const info = await page.evaluate(() => ({
        url: location.href,
        inputs: [...document.querySelectorAll('input,textarea')].map((e) => [e.type, e.placeholder, e.getAttribute('aria-label')]),
        buttons: [...document.querySelectorAll('button,[role=tab],[role=button],a')].map((e) => (e.getAttribute('aria-label') || e.innerText || '').trim().replace(/\s+/g, ' ')).filter(Boolean).slice(0, 150),
        imgs: [...document.images].map((i) => i.alt).filter(Boolean).slice(0, 120),
      }));
      console.log(JSON.stringify(info, null, 1));
    }
    fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
    // captura en píxeles del dispositivo (con --zoom sigue saliendo de width x height)
    const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(out, Buffer.from(shot.data, 'base64'));
    console.log('ok', out, page.url());
  } finally {
    await page.close().catch(() => {});
    browser.close = () => {}; // connectOverCDP: no cerrar el navegador del MCP
  }
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
