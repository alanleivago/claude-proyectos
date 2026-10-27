import { createRequire } from 'node:module'; import { execSync } from 'node:child_process'; import path from 'node:path';
const require = createRequire(import.meta.url); const { chromium } = require(execSync('npm root -g').toString().trim() + '/playwright');
const dir = path.resolve(process.argv[2]); const b = await chromium.launch(); const p = await b.newPage();
await p.goto('file://' + path.join(dir, 'index.html') + '?export=1'); await p.waitForFunction(() => window.TIMELINE);
const r = await p.evaluate(() => TIMELINE.shots.filter((s) => s.sec === 's08').map((s) => `${s.t0.toFixed(2)}-${s.t1.toFixed(2)} ${s.key}`));
console.log(r.join('\n')); await b.close();
