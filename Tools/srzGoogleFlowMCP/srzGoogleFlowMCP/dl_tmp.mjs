// node dl_tmp.mjs "label=cid" ... : baja el video terminado de la miniatura con ese nombre
import fs from 'node:fs';
import { chromium } from 'playwright-core';
import { CDP_PORT } from './src/chrome.js';
const b = await chromium.connectOverCDP(`http://127.0.0.1:${CDP_PORT}`);
const ctx = b.contexts()[0]; const page = ctx.pages().find(p=>p.url().includes('flow'));
for (const a of process.argv.slice(2)) {
  const [label, cid] = a.split('=');
  const t = page.locator(`flow-grid-tile-container[aria-label="${label}"]`).first();
  if (!(await t.count()) || !/play_circle/.test(await t.innerText())) { console.log('pendiente', cid); continue; }
  await t.hover(); await page.waitForTimeout(2500);
  const src = await t.evaluate(e => e.querySelector('video')?.src);
  const r = await ctx.request.get(src); fs.writeFileSync(`F:/Claude Proyectos/pieces/agua-hacienda/clips/${cid}.mp4`, await r.body()); console.log('ok', cid);
}
process.exit(0);
