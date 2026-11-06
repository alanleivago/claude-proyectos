// node render.mjs [t0] [t1] [out] -> renders/<out> (30 fps, 1080x1920, video only) by piping frames into ffmpeg
import { createRequire } from 'node:module'; import { execSync, spawn } from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path'; import { pathToFileURL, fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = (() => { try { return require('playwright'); } catch { return require(path.join(execSync('npm root -g').toString().trim(), 'playwright')); } })();
const dir = path.dirname(fileURLToPath(import.meta.url)); fs.mkdirSync(path.join(dir, 'renders'), { recursive: true });
const FPS = 30, out = path.join(dir, 'renders', process.argv[4] || 'video_only.mp4');
const browser = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
const page = await browser.newPage(); page.on('pageerror', (e) => console.log('[err]', e.message));
const MODE = process.env.MODE || 'v1'; await page.addInitScript((m) => { window.MODE = m; }, MODE); console.log('MODE', MODE);   // MODE=gb -> GreenBro acting variant
await page.goto(pathToFileURL(path.join(dir, 'render.html')).href); await page.waitForFunction(() => window.READY, null, { timeout: 600000 });
const total = await page.evaluate(() => ENG.shots[ENG.shots.length - 1].t1);
const t0 = Number(process.argv[2] ?? 0), t1 = Math.min(total, Number(process.argv[3] ?? total)), n = Math.round((t1 - t0) * FPS);
const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', String(FPS), out], { stdio: ['pipe', 'inherit', 'inherit'] });
const T = Date.now();
for (let f = 0; f < n; f++) {
  const url = await page.evaluate((t) => window.renderFrame(t), t0 + f / FPS);
  if (!ff.stdin.write(Buffer.from(url.split(',')[1], 'base64'))) await new Promise((r) => ff.stdin.once('drain', r));
  if (f % 150 === 0) console.log(`frame ${f}/${n}  ${((Date.now() - T) / 1000).toFixed(0)} s`);
}
ff.stdin.end(); await new Promise((r) => ff.on('close', r)); await browser.close(); console.log('done', out, ((Date.now() - T) / 1000).toFixed(0), 's');
