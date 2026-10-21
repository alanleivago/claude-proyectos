// Export the sound cue sheet from the built piece's own timing (window.soundCues in src/scenes.js).
// usage (from pieces/hackeo-1834/sound): node dump.mjs
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = (() => { try { return require('playwright'); } catch { return require(path.join(execSync('npm root -g').toString().trim(), 'playwright')); } })();
const b = await chromium.launch(); const p = await b.newPage();
await p.goto(pathToFileURL(path.resolve('../index.html')).href + '?export=1');
await p.waitForFunction(() => typeof window.soundCues === 'function');
const { cues, fps, duration } = await p.evaluate(() => ({ cues: window.soundCues(), fps: TIMELINE.fps, duration: TIMELINE.duration }));
await b.close();
const sheet = {
  fps, duration_s: duration, energy: 'punchy',
  kit: path.resolve('../../../sound-layer/kit'),
  room: { decay_s: 0.6, wet_db: -18 },
  music: { file: 'audio/music.wav', start_s: 0, loop: false, fade_out_s: 0.8 },
  silence_ok: [[29.85, 31.0]],   // the planned held breath: the score stops at 29.9, the hero lands at 31.0
  cues,
};
fs.mkdirSync('audio', { recursive: true });
fs.writeFileSync('audio/cues.json', JSON.stringify(sheet, null, 1));
console.log(cues.length, 'cues;', cues.filter((c) => c.weight === 'hero').length, 'heroes ->', 'audio/cues.json');
