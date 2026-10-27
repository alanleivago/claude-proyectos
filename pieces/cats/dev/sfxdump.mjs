import { createRequire } from 'node:module'; import { execSync } from 'node:child_process'; import path from 'node:path';
const require = createRequire(import.meta.url); const { chromium } = require(execSync('npm root -g').toString().trim() + '/playwright');
const b = await chromium.launch(); const p = await b.newPage();
await p.goto('file://' + path.resolve(process.argv[2], 'index.html') + '?export=1'); await p.waitForFunction(() => window.TIMELINE && window.renderFrame);
console.log(JSON.stringify(await p.evaluate(() => ({ reg: SFX_REG, dur: DURATION }))));
await b.close();
