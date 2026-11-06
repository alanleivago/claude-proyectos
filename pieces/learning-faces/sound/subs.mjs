// dumps the caption chunks (rows, t0, t1, end) and the shot list from the built page -> subs.json
import pw from '/opt/homebrew/lib/node_modules/playwright/index.js'; const { chromium } = pw;
import fs from 'fs'; import path from 'path';
const b = await chromium.launch(); const p = await b.newPage();
await p.goto('file://' + path.resolve('../index.html')); await p.waitForFunction(() => window.renderFrame);
const d = await p.evaluate(() => ({ subs: SUBS.map((c) => ({ text: c.rows.join(' '), t0: c.t0, t1: c.t1, end: c.end, n: c.rows.join('').replace(/ /g, '').length })), shots: TIMELINE.shots.map((s) => [s.key, s.t0, s.t1]), dur: DURATION, cues: TIMELINE.cues }));
fs.writeFileSync('subs.json', JSON.stringify(d, null, 1)); await b.close(); console.log(d.subs.length, 'chunks', d.dur);
