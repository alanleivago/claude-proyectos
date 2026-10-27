import { createRequire } from 'node:module'; import { execSync } from 'node:child_process'; import path from 'node:path';
const require = createRequire(import.meta.url); const { chromium } = require(execSync('npm root -g').toString().trim() + '/playwright');
const b = await chromium.launch(); const p = await b.newPage(); await p.goto('file://' + path.resolve(process.argv[2], 'index.html') + '?export=1');
await p.waitForFunction(() => window.TIMELINE && window.renderFrame);
console.log((await p.evaluate(() => TIMELINE.shots.map((s) => `${s.key} ${s.t0.toFixed(2)}-${s.t1.toFixed(2)}`))).join('\n')); await b.close();
