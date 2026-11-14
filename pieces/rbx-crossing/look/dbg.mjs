import { createRequire } from 'node:module'; import { execSync } from 'node:child_process'; import path from 'node:path'; import { pathToFileURL, fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url); const { chromium } = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'));
const dir = path.dirname(fileURLToPath(import.meta.url)); const b = await chromium.launch({ args: ['--use-angle=d3d11', '--enable-gpu', '--allow-file-access-from-files'] }); const p = await b.newPage();
p.on('console', (m) => console.log('[page]', m.text())); await p.goto(pathToFileURL(path.join(dir, 'look.html')).href); await p.waitForFunction(() => window.READY);
console.log(await p.evaluate(async () => { await window.renderPanel('g_end'); const a = CAST.get('rudyV'); let n = 0; a.body.traverse(() => n++); return JSON.stringify({ vis: a.root.visible, pos: a.root.position.toArray(), meshes: n, par: !!a.root.parent }); }));
await b.close();
