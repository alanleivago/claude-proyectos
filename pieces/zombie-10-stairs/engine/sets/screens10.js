// sets/screens10.js — ep10 "The Stairs": pantalla ITEM / EXAMINE "ESCAPE LADDER" (escalera de cuerda en codigo, girando)
// con el dato de seguridad contra incendios (USFA: dos salidas por cuarto; escalera plegable para ventanas de pisos altos).
import { reText as bitText } from '../refont.js';

export async function shots({ L, examine }) {
  const CUE = await (await fetch('cues.json')).json(); const W = CUE.W, T = CUE.T;
  const { THREE, LW, LH } = L;
  const px = (c, x, y, col, w = 1, h = 1) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const ease = (a, b, x) => L.smooth((x - a) / (b - a));
  const P2 = (x, y) => [x - LW / 2, LH / 2 - y];
  const bevel = (cx, x, y, w, h, f = '#262a38', hi = '#7a8094', lo = '#0c0e14') => { px(cx, x, y, f, w, h); px(cx, x, y, hi, w, 1); px(cx, x, y, hi, 1, h); px(cx, x, y + h - 1, lo, w, 1); px(cx, x + w - 1, y, lo, 1, h); };
  const out = {};
  { const s = new THREE.Scene(); s.background = new THREE.Color(0x05070e);
    s.add(new THREE.AmbientLight(0xffffff, 1.1)); const dl = new THREE.DirectionalLight(0xffffff, 2.0); dl.position.set(-1, 1.6, 2); s.add(dl);
    const c = new THREE.OrthographicCamera(-LW / 2, LW / 2, LH / 2, -LH / 2, -1000, 1000); c.position.set(0, 0, 500); c.lookAt(0, 0, 0);
    const bg = L.cvs(LW, LH, (cx) => { const g = cx.createLinearGradient(0, 0, 0, LH); g.addColorStop(0, '#0a1430'); g.addColorStop(1, '#03050c'); cx.fillStyle = g; cx.fillRect(0, 0, LW, LH);
      cx.fillStyle = 'rgba(40,70,140,0.10)'; for (let y = 0; y < LH; y += 3) cx.fillRect(0, y, LW, 1);
      bevel(cx, 14, 22, 332, 22); px(cx, 18, 26, '#04060e', 324, 14); bevel(cx, 40, 62, 280, 360, '#0e1424');
      cx.strokeStyle = 'rgba(70,200,110,0.22)'; for (let x = 40; x <= 320; x += 20) { cx.beginPath(); cx.moveTo(x + 0.5, 62); cx.lineTo(x + 0.5, 422); cx.stroke(); } for (let y = 62; y <= 422; y += 20) { cx.beginPath(); cx.moveTo(40, y + 0.5); cx.lineTo(320, y + 0.5); cx.stroke(); } });
    L.plane(LW, LH, L.basic(bg), 0, 0, -400, s);
    // escalera de cuerda plegable: dos cuerdas trenzadas, 9 peldanos de madera, ganchos de acero arriba
    const tRope = L.cvs(4, 16, (cx) => { for (let y = 0; y < 16; y++) px(cx, 0, y, y % 4 < 2 ? '#d8c08a' : '#a88c58', 4, 1); });
    const tW = L.cvs(16, 8, (cx) => { const r = L.rng(3); for (let y = 0; y < 8; y++) for (let x = 0; x < 16; x++) { const n = r() * 16; px(cx, x, y, `rgb(${170 + n},${120 + n * 0.7},${70 + n * 0.4})`); } });
    const mR = L.lam(L.rep(tRope, 1, 14)), mW = L.lam(tW), mH = L.lam(null, 0x34343a), mHs = L.lam(null, 0x8a8e96);
    const lad = new THREE.Group(), H = 3.0;
    for (const x of [-0.22, 0.22]) { L.box(0.035, H + 0.08, 0.035, mR, x, 0.04, 0, lad); L.box(0.05, 0.06, 0.36, mH, x, H / 2 + 0.05, -0.15, lad); L.box(0.05, 0.22, 0.05, mH, x, H / 2 - 0.07, -0.3, lad); L.box(0.06, 0.03, 0.06, mHs, x, H / 2 + 0.07, 0.02, lad); }
    for (let i = 0; i < 9; i++) { const r = L.mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 6), mW, 0, H / 2 - 0.3 - i * 0.32, 0, lad); r.rotation.z = Math.PI / 2; for (const x of [-0.22, 0.22]) L.box(0.05, 0.05, 0.05, mR, x, H / 2 - 0.3 - i * 0.32, 0, lad); }
    const g = new THREE.Group(); g.add(lad); g.scale.setScalar(105); { const [x, y] = P2(180, 238); g.position.set(x, y, 0); } s.add(g);
    out['07_item'] = { scene: s, camera: c, update(lt) { const q = L.q15(lt); lad.rotation.set(0.15, -0.6 + q * 0.7, 0.05 * Math.sin(q)); },
      overlay(lt, dt, a, o) { const cx = o.tctx, t = T['07_item'] + lt;
        bitText(cx, 'ITEMS', 46, 33, 1, '#9cf09c', { outline: null }); bitText(cx, 'DAY 4  //  SECOND FLOOR', 238, 33, 1, '#c8ccd8', { outline: null });
        examine(o, lt, 'ESCAPE LADDER', 'Every room needs two ways out.\nUS Fire Administration.');
        if (t >= W.ways) { const k = ease(W.ways, W.ways + 0.12, t), sc = 1 + 0.6 * (1 - k); cx.save(); cx.translate(LW / 2, 372); cx.rotate(-0.08); cx.scale(sc, sc); cx.globalAlpha = k;
          cx.strokeStyle = '#62f05a'; cx.lineWidth = 3; cx.strokeRect(-104, -18, 208, 36); bitText(cx, '2 WAYS OUT', 0, 0, 2, '#62f05a', { outline: '#021006' }); cx.restore(); cx.globalAlpha = 1; }
      } };
  }
  return out;
}
