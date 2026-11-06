// node camtest.mjs <shot#> '<json [{p,l,fov}]>' out_prefix -> renders the staged shot from free cameras (layout debugging)
import { createRequire } from 'node:module'; import { execSync } from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path'; import { pathToFileURL, fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = (() => { try { return require('playwright'); } catch { return require(path.join(execSync('npm root -g').toString().trim(), 'playwright')); } })();
const dir = path.dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
const page = await browser.newPage(); page.on('pageerror', (e) => console.log('[err]', e.message));
await page.goto(pathToFileURL(path.join(dir, 'board.html')).href); await page.waitForFunction(() => window.READY, null, { timeout: 600000 });
const cams = JSON.parse(process.argv[3]);
for (let k = 0; k < cams.length; k++) {
  const url = await page.evaluate(([i, c]) => { ENG.render(i, 0.5); if (c.face) Object.assign(c, ENG.face(...c.face)); const sh = ENG.shots[i], set = ENG.S[sh.set], cam = ENG.cam; cam.fov = c.fov || 60; cam.position.set(...c.p); cam.up.set(0, 1, 0); cam.lookAt(new THREE.Vector3(...c.l)); cam.updateProjectionMatrix();
    ENG.post.render(set.scene, cam, Object.assign({}, KIT.GRADE.day, { focus: 30, aperture: 0 })); return ENG.renderer.domElement.toDataURL('image/jpeg', 0.8); }, [Number(process.argv[2]) - 1, cams[k]]);
  fs.writeFileSync(`${process.argv[4]}${k}.jpg`, Buffer.from(url.split(',')[1], 'base64'));
}
await browser.close();
