// dump meteor timings from the built page: node dump.mjs ../index.html out.json
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = (() => { try { return require('playwright'); } catch { return require(path.join(execSync('npm root -g').toString().trim(), 'playwright')); } })();
const b = await chromium.launch(); const p = await b.newPage();
await p.goto(pathToFileURL(path.resolve(process.argv[2])).href + '?export=1');
const m = await p.evaluate(() => meteorList().map((x) => ({ t0: x.t0, dur: x.dur, ti: x.ti, ocean: !!x.ocean, s: x.s, Di: x.Di, panS: Math.max(-0.95, Math.min(0.95, (x.azS / DEG - 7) / 22)), panI: Math.max(-0.95, Math.min(0.95, (x.azI / DEG - 7) / 22)) })));
fs.writeFileSync(process.argv[3], JSON.stringify(m, null, 1)); await b.close(); console.log(m.length, 'meteors');
