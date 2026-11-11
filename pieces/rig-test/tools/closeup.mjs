// Close-ups of shoulder / elbow / knee deformation at extreme bends: rest vs bent, side by side, big.
//   usage: node tools/closeup.mjs <piece dir> <out.png>
import { createRequire } from 'node:module'; import { execSync } from 'node:child_process'; import path from 'node:path'; import { pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = (() => { try { return require('playwright'); } catch { return require(path.join(execSync('npm root -g').toString().trim(), 'playwright')); } })();
const [dir, out] = process.argv.slice(2);
const b = await chromium.launch(), p = await b.newPage();
p.on('pageerror', (e) => console.error('PAGE ERROR', e.message));
await p.goto(pathToFileURL(path.resolve(dir, 'index.html')).href + '?export=1');
await p.waitForFunction(() => window.renderFrame && window.renderCloseup);
const url = await p.evaluate(() => {
  // [label, pose over STAND, crop centre in source px]
  const shots = [
    ['shoulder rest', {}, [270, 470]], ['shoulder up 150deg', { uarmF: -70, farmF: -80, handF: -80 }, [270, 470]],
    ['elbow rest', {}, [415, 610]], ['elbow 115deg', { uarmF: 75, farmF: -40, handF: -50 }, [330, 600]],
    ['knee rest', {}, [440, 1060]], ['knee 95deg', { thighF: 30, shinF: 125, footF: 60 }, [420, 1000]],
    ['back arm swung fwd', { uarmB: 40, farmB: 20, handB: 20 }, [220, 560]], ['neck tilt + chest bend', { chest: -76, head: -60 }, [300, 360]],
  ];
  const S = 1.1, CW = 520, CH = 520, cols = 4;
  const big = document.createElement('canvas'); big.width = cols * CW; big.height = Math.ceil(shots.length / cols) * (CH + 30);
  const G = big.getContext('2d'); G.fillStyle = '#222'; G.fillRect(0, 0, big.width, big.height);
  const c = document.createElement('canvas'); c.width = CW; c.height = CH;
  shots.forEach(([lab, over, cen], i) => {
    // anchor so that `cen` (source px) lands in the middle of the tile, at rest; bends happen around it
    const x = CW / 2 - S * (cen[0] - 300), y = CH / 2 - S * (cen[1] - 1300);
    window.renderCloseup(c, over, S, x, y, false);
    const X = (i % cols) * CW, Y = Math.floor(i / cols) * (CH + 30);
    G.drawImage(c, X, Y + 30); G.fillStyle = '#fff'; G.font = '20px sans-serif'; G.fillText(lab, X + 10, Y + 22);
  });
  return big.toDataURL('image/png');
});
(await import('node:fs')).writeFileSync(out, Buffer.from(url.split(',')[1], 'base64'));
await b.close(); console.log('wrote', out);
