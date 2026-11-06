// dump the expanded plan with times (for the sound cue list): panels, cast, fx, cards, and the line/word times the effects use
import { createRequire } from 'node:module'; import { execSync } from 'node:child_process'; import path from 'node:path'; import fs from 'node:fs'; import { pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url); const { chromium } = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'));
const b = await chromium.launch(), p = await b.newPage(); await p.goto(pathToFileURL(path.resolve('index.html')).href + '?export=1'); await p.waitForFunction(() => window.TIMELINE);
const d = await p.evaluate(() => ({ dur: DURATION, sign: SIGN_T, panels: PLAN.map((r, i) => ({ id: r[0], base: BASE[r[0]], k: r[6] ? r[6].k : 0, t0: TB[i], t1: i + 1 < TB.length ? TB[i + 1] : DURATION, bt0: BT0(r[0]), bt1: BT1(r[0]),
  set: r[2], cast: r[3].map((c) => ({ n: c[0], x: c[1], o: c[2] })), fx: r[4], card: r[5] || null, line: r[1] })) }));
fs.writeFileSync('audio/plan.json', JSON.stringify(d)); console.log(d.panels.length); await b.close();
