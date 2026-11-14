// node render.mjs <versionDir> [--frames a,b,c --out sheet.png]
// Renders every frame of <versionDir>/index.html to <versionDir>/frames and muxes <versionDir>/out.mp4 with the reference audio.
// With --frames, renders only those times (seconds) into a contact sheet (fast preview).
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const groot = execFileSync('npm', ['root', '-g'], { shell: true }).toString().trim();
const { chromium } = createRequire(path.join(groot, 'noop.js'))('playwright');

const dir = path.resolve(process.argv[2]);
const args = process.argv.slice(3);
const fi = args.indexOf('--frames');
const times = fi >= 0 ? args[fi + 1].split(',').map(Number) : null;
const oi = args.indexOf('--out');
const sheet = oi >= 0 ? path.resolve(args[oi + 1]) : path.join(dir, 'preview.png');
const AUDIO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../references/positpixel/chi-audio-10s.wav');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
page.on('pageerror', (e) => console.error('pageerror', e.message));
await page.goto('file:///' + path.join(dir, 'index.html').replace(/\\/g, '/'));
await page.waitForFunction(() => typeof window.renderFrame === 'function' && window.TIMELINE, null, { timeout: 120000 });
const T = await page.evaluate(() => window.TIMELINE);
const grab = async (t) => Buffer.from(await page.evaluate((t) => { window.renderFrame(t); return document.getElementById('c').toDataURL('image/png').split(',')[1]; }, t), 'base64');

if (times) {
  const tmp = path.join(dir, '_prev'); fs.rmSync(tmp, { recursive: true, force: true }); fs.mkdirSync(tmp, { recursive: true });
  for (let i = 0; i < times.length; i++) fs.writeFileSync(path.join(tmp, `p${String(i).padStart(2, '0')}.png`), await grab(times[i]));
  const cols = Math.min(5, times.length), rows = Math.ceil(times.length / cols);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', path.join(tmp, 'p%02d.png'), '-vf', `scale=360:-1,tile=${cols}x${rows}`, '-frames:v', '1', sheet]);
  console.log('sheet', sheet);
} else {
  const fdir = path.join(dir, 'frames'); fs.rmSync(fdir, { recursive: true, force: true }); fs.mkdirSync(fdir, { recursive: true });
  const n = Math.round(T.duration * T.fps);
  for (let i = 0; i < n; i++) fs.writeFileSync(path.join(fdir, `f${String(i).padStart(4, '0')}.png`), await grab(i / T.fps));
  const out = path.join(dir, 'out.mp4');
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(T.fps), '-i', path.join(fdir, 'f%04d.png'), '-i', AUDIO, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-c:a', 'aac', '-b:a', '192k', '-shortest', out]);
  console.log('video', out, n, 'frames');
}
await browser.close();
