// janitor self-check: front, 3/4, side, back; face close-ups (tired / worried / terrified); a walk strip (8 frames)
import { createRequire } from 'node:module'; import { execSync } from 'node:child_process'; import path from 'node:path'; import fs from 'node:fs'; import { pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url); const { chromium } = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'));
const b = await chromium.launch(), p = await b.newPage(); p.on('pageerror', (e) => console.error(e.message)); await p.goto(pathToFileURL(path.resolve('index.html')).href + '?export=1'); await p.waitForFunction(() => window.TIMELINE && window.renderFrame);
const urls = await p.evaluate(() => { const c = document.createElement('canvas'); c.width = 1080; c.height = 1920; const out = [], O = V3(-3, 0, 0);
  const shot = (pose, cam, tg, fov, fear) => { window.DBG_SHOT = () => { const Wd = world(); Wd.door.visible = false; Wd.dayBoard.visible = true; pose(Wd); Wd.me.setFear(fear); const hp = Wd.me.H.position.clone(), C = typeof cam === 'function' ? cam(hp) : cam, Tg = typeof tg === 'function' ? tg(hp) : tg; render3D('dawn', C, Tg, { fov, sy: 0.5, fill: { I: 0.8, d: 4, c: '#d8dcd8', off: V3(0.3, 0.4, 0.4) }, moonDir: V3(0.3, 0.6, 1), shadowAt: O }); }; renderFrame(58.7, c); const s = document.createElement('canvas'); s.width = 270; s.height = 480; s.getContext('2d').drawImage(c, 0, 0, 270, 480); out.push(s.toDataURL('image/png')); };
  const stand = (Wd) => { janWalk(Wd, { O, D: V3(1, 0, 0), plant: [0.03, -0.03], pitch: 0.02 }, (a) => a.F.clone().add(V3(0, -0.2, 0))); torchFromHand(Wd, Wd.me, 1, { I: 3 }); };
  shot(stand, V3(-0.6, 1.0, 0.1), V3(-3, 0.92, 0), 46, 0); shot(stand, V3(-1.2, 1.05, 1.15), V3(-3, 0.92, 0), 50, 0); shot(stand, V3(-3, 1.0, 1.32), V3(-3, 0.92, 0), 70, 0); shot(stand, V3(-5.4, 1.05, 0.1), V3(-3, 0.92, 0), 46, 0);
  [0, 0.5, 1].forEach((f) => shot(stand, (h) => h.clone().add(V3(0.55, 0.0, 0.08)), (h) => h.clone().add(V3(0, -0.01, 0)), 24, f));
  for (let i = 0; i < 8; i++) { const tt = i * 0.12; shot((Wd) => { janWalk(Wd, { O: V3(-4, 0, 0), D: V3(1, 0, 0), s: 0.9 * tt + 0.6, pitch: 0.06 }, (a) => a.F.clone().add(V3(0, -0.3, 0))); torchFromHand(Wd, Wd.me, 1, { I: 3 }); }, V3(-3.0, 0.95, 1.3), V3(-3.0, 0.9, 0), 72, 0.2); }
  window.DBG_SHOT = null; return out; });
const files = urls.map((u, i) => { const f = `review/j${i}.png`; fs.writeFileSync(f, Buffer.from(u.split(',')[1], 'base64')); return f; }); await b.close();
execSync(`python3 -c "
from PIL import Image
ims=[Image.open('review/j%d.png'%i) for i in range(15)]
W=Image.new('RGB',(270*8,480*2),(20,20,20))
for i in range(7): W.paste(ims[i],(i*270,0))
for i in range(8): W.paste(ims[7+i],(i*270,480))
W.save('review/janitor.png')"`); files.forEach((f) => fs.unlinkSync(f)); console.log('review/janitor.png');
