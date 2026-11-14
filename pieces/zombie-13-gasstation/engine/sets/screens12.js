// sets/screens12.js — ep12 "The Radio": pantallas RE en codigo.
// 02_item: ITEMS / EXAMINE "HAND-CRANK RADIO" girando (NO GRID / NO TOWER en sus palabras; la manivela gira y llena la carga).
// 04_iono: diagrama DIA / NOCHE: de dia la onda AM se apaga baja; de noche rebota en la ionosfera y llega a cientos de millas; dial que barre + SCAN AT NIGHT.
// 07b_door: transicion de "puerta de carga" (homenaje dibujado: una puerta se abre hacia la oscuridad, camara que avanza).
import { reText as bitText, reWidth } from '../refont.js';
import { makeRadio } from './radioprops.js';

export async function shots({ L, examine }) {
  const CUE = await (await fetch('cues.json')).json(); const W = CUE.W, T = CUE.T;
  const { THREE, LW, LH } = L;
  const px = (c, x, y, col, w = 1, h = 1) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };
  const ease = (a, b, x) => L.smooth((x - a) / (b - a));
  const bevel = (cx, x, y, w, h, f = '#262a38', hi = '#7a8094', lo = '#0c0e14') => { px(cx, x, y, f, w, h); px(cx, x, y, hi, w, 1); px(cx, x, y, hi, 1, h); px(cx, x, y + h - 1, lo, w, 1); px(cx, x + w - 1, y, lo, 1, h); };
  const out = {};

  // ================= 02 ITEM: HAND-CRANK RADIO =================
  { const s = new THREE.Scene(); s.background = new THREE.Color(0x05070e);
    s.add(new THREE.AmbientLight(0xffffff, 1.1)); const dl = new THREE.DirectionalLight(0xffffff, 2.0); dl.position.set(-1, 1.6, 2); s.add(dl);
    const c = new THREE.OrthographicCamera(-LW / 2, LW / 2, LH / 2, -LH / 2, -1000, 1000); c.position.set(0, 0, 500); c.lookAt(0, 0, 0);
    const bg = L.cvs(LW, LH, (cx) => { const g = cx.createLinearGradient(0, 0, 0, LH); g.addColorStop(0, '#0a1430'); g.addColorStop(1, '#03050c'); cx.fillStyle = g; cx.fillRect(0, 0, LW, LH);
      cx.fillStyle = 'rgba(40,70,140,0.10)'; for (let y = 0; y < LH; y += 3) cx.fillRect(0, y, LW, 1); bevel(cx, 14, 22, 332, 22); px(cx, 18, 26, '#04060e', 324, 14); bevel(cx, 40, 60, 280, 220, '#0e1424');
      cx.strokeStyle = 'rgba(70,200,110,0.22)'; for (let x = 40; x <= 320; x += 20) { cx.beginPath(); cx.moveTo(x + 0.5, 60); cx.lineTo(x + 0.5, 280); cx.stroke(); } for (let y = 60; y <= 280; y += 20) { cx.beginPath(); cx.moveTo(40, y + 0.5); cx.lineTo(320, y + 0.5); cx.stroke(); } });
    L.plane(LW, LH, L.basic(bg), 0, 0, -400, s);
    const R = makeRadio(L), g = new THREE.Group(); g.add(R.g); g.scale.setScalar(820); g.position.set(0, LH / 2 - 182, 0); s.add(g);
    const icon = (cx, k, x, y) => {
      if (k === 'grid') { px(cx, x - 8, y - 10, '#d8d8d8', 16, 12); px(cx, x - 5, y - 16, '#d8d8d8', 2, 6); px(cx, x + 3, y - 16, '#d8d8d8', 2, 6); px(cx, x - 1, y + 2, '#d8d8d8', 2, 10); }
      if (k === 'tower') { cx.strokeStyle = '#d8d8d8'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(x - 9, y + 14); cx.lineTo(x, y - 14); cx.lineTo(x + 9, y + 14); cx.moveTo(x - 5, y + 2); cx.lineTo(x + 5, y + 2); cx.stroke(); for (const r of [6, 11]) { cx.beginPath(); cx.arc(x, y - 14, r, -2.4, -0.7); cx.stroke(); } }
      cx.strokeStyle = '#ff4030'; cx.lineWidth = 3; cx.beginPath(); cx.arc(x, y, 18, 0, 7); cx.moveTo(x - 13, y - 13); cx.lineTo(x + 13, y + 13); cx.stroke();
    };
    out['02_item'] = { scene: s, camera: c, update(lt, t) { const q = L.q15(lt), cr = ease(W.crank2 - 0.1, W.crank2 + 0.1, t);
        R.g.rotation.set(0.15, -0.45 + 0.4 * Math.sin(q * 0.9), -0.04); void cr; R.set({ crankA: -Math.max(0, t - W.crank2 + 0.1) * 8, ledOn: t > W.talking - 0.1, freq: 0.3 }); },
      overlay(lt, dt, a, o) { const cx = o.tctx, t = T['02_item'] + lt;
        bitText(cx, 'ITEMS', 46, 33, 1, '#9cf09c', { outline: null }); bitText(cx, 'HAND-CRANK RADIO', 246, 33, 1, '#c8ccd8', { outline: null });
        for (const [k, w, x, lab] of [['grid', 'grid', 110, 'NO GRID'], ['tower', 'tower', 250, 'NO TOWER']]) { const kk = ease(W[w] - 0.05, W[w] + 0.12, t); if (kk <= 0) continue; const sc = 1 + 0.4 * (1 - kk);
          cx.save(); cx.translate(x, 322); cx.scale(sc, sc); cx.globalAlpha = kk; cx.fillStyle = 'rgba(4,8,16,0.92)'; cx.fillRect(-56, -32, 112, 64); cx.strokeStyle = '#ff7b2e'; cx.lineWidth = 1; cx.strokeRect(-55.5, -31.5, 111, 63); icon(cx, k, 0, -6); bitText(cx, lab, 0, 22, 1, '#f0f0e8', { outline: null }); cx.restore(); cx.globalAlpha = 1; }
        const kc = ease(W.crank2 - 0.1, W.crank2 + 0.1, t); if (kc > 0) { const fill = L.clamp01((t - W.crank2) / Math.max(0.5, W.talking - W.crank2)); cx.globalAlpha = kc; bevel(cx, 70, 374, 220, 22, '#06120a', '#2fb83c', '#0c3a14');
          for (let i = 0; i < Math.floor(fill * 10); i++) px(cx, 74 + i * 21.4, 378, i < 3 ? '#e2c62c' : '#62f05a', 19, 14); bitText(cx, t > W.talking - 0.1 ? 'CHARGED: IT TALKS' : 'CRANK 1 MIN', LW / 2, 362, 1, '#c8f0c0', { outline: '#000' }); cx.globalAlpha = 1; }
        examine(o, lt, 'HAND-CRANK RADIO', 'Runs on batteries or a crank.\nNo grid, no cell tower needed.');
      } };
  }

  // ================= 04 IONOSFERA: DIA / NOCHE =================
  { const s = new THREE.Scene(); s.background = new THREE.Color(0x03050a); const c = new THREE.PerspectiveCamera(45, LW / LH, 0.1, 10);
    const panel = (cx, y0, h, night, t, k) => {   // tierra curva abajo, banda de ionosfera arriba, torre a la izquierda
      const g = cx.createLinearGradient(0, y0, 0, y0 + h); if (night) { g.addColorStop(0, '#060a1e'); g.addColorStop(1, '#141c3a'); } else { g.addColorStop(0, '#3a78c8'); g.addColorStop(1, '#9ac8f0'); }
      cx.fillStyle = g; cx.fillRect(16, y0, 328, h); cx.save(); cx.beginPath(); cx.rect(16, y0, 328, h); cx.clip();
      const ER = 900, ecx = LW / 2, ecy = y0 + h - 26 + ER; cx.fillStyle = night ? '#1a2a1a' : '#3a7a2a'; cx.beginPath(); cx.arc(ecx, ecy, ER, 0, 7); cx.fill(); cx.fillStyle = night ? '#0e1a0e' : '#2a5a1a'; cx.fillRect(16, y0 + h - 8, 328, 8);
      const IR = ER + (night ? 120 : 70); cx.strokeStyle = night ? 'rgba(160,120,255,0.75)' : 'rgba(255,255,255,0.35)'; cx.lineWidth = night ? 6 : 10; cx.beginPath(); cx.arc(ecx, ecy, IR, -Math.PI / 2 - 0.25, -Math.PI / 2 + 0.25); cx.stroke();
      if (night) { cx.fillStyle = '#f4f0d8'; cx.beginPath(); cx.arc(300, y0 + 26, 11, 0, 7); cx.fill(); cx.fillStyle = '#060a1e'; cx.beginPath(); cx.arc(305, y0 + 22, 10, 0, 7); cx.fill(); const R = L.rng(4); for (let i = 0; i < 18; i++) px(cx, 20 + R() * 320, y0 + 4 + R() * 50, '#e8e8ff', 1, 1); }
      else { cx.fillStyle = '#ffe048'; cx.beginPath(); cx.arc(300, y0 + 26, 12, 0, 7); cx.fill(); for (let i = 0; i < 8; i++) { const a = i / 8 * 7; px(cx, 300 + Math.cos(a) * 18 - 1, y0 + 26 + Math.sin(a) * 18 - 1, '#ffe048', 3, 3); } }
      const tx = 58, ty = y0 + h - 30; cx.strokeStyle = '#d8d8d8'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(tx - 8, ty + 8); cx.lineTo(tx, ty - 26); cx.lineTo(tx + 8, ty + 8); cx.stroke(); px(cx, tx - 2, ty - 30, '#ff4030', 4, 4);
      const hx = 300, hy = y0 + h - 30; px(cx, hx - 10, hy - 6, '#c8b090', 20, 14); cx.fillStyle = '#7a3a2a'; cx.beginPath(); cx.moveTo(hx - 13, hy - 6); cx.lineTo(hx, hy - 16); cx.lineTo(hx + 13, hy - 6); cx.fill(); px(cx, hx - 3, hy + 1, '#ffd070', 5, 5);
      // onda: de dia sube y se apaga en la banda; de noche sube, rebota y baja lejos (en la casa)
      const iy = ecy - IR + 6; cx.lineWidth = 3;
      if (!night) { const u = L.clamp01(k); cx.strokeStyle = '#ff7b2e'; cx.setLineDash([5, 4]); cx.beginPath(); cx.moveTo(tx, ty - 26); cx.lineTo(tx + (150 - tx) * u, ty - 26 + (iy + 10 - ty + 26) * u); cx.stroke(); cx.setLineDash([]); if (u > 0.95) { cx.strokeStyle = '#ff4030'; cx.beginPath(); cx.moveTo(140, iy + 2); cx.lineTo(160, iy + 18); cx.moveTo(160, iy + 2); cx.lineTo(140, iy + 18); cx.stroke(); } }
      else { const u = L.clamp01(k), mx = (tx + hx) / 2, pts = [[tx, ty - 26], [mx, iy], [hx, hy - 8]]; cx.strokeStyle = '#62f05a'; cx.beginPath(); cx.moveTo(...pts[0]);
        if (u < 0.5) { const v = u / 0.5; cx.lineTo(pts[0][0] + (pts[1][0] - pts[0][0]) * v, pts[0][1] + (pts[1][1] - pts[0][1]) * v); } else { const v = (u - 0.5) / 0.5; cx.lineTo(...pts[1]); cx.lineTo(pts[1][0] + (pts[2][0] - pts[1][0]) * v, pts[1][1] + (pts[2][1] - pts[1][1]) * v); } cx.stroke();
        if (u >= 0.5) { const r = 6 + 6 * Math.sin(L.q15(t) * 8); cx.strokeStyle = 'rgba(200,255,200,0.7)'; cx.lineWidth = 1; cx.beginPath(); cx.arc(mx, iy, r, 0, 7); cx.stroke(); } }
      cx.restore(); cx.strokeStyle = '#8a90a8'; cx.lineWidth = 1; cx.strokeRect(16.5, y0 + 0.5, 327, h - 1);
    };
    out['04_iono'] = { scene: s, camera: c, update() {}, overlay(lt, dt, a, o) { const cx = o.tctx, t = T['04_iono'] + lt; cx.fillStyle = '#03050a'; cx.fillRect(0, 0, LW, LH);
        bevel(cx, 14, 22, 332, 22); px(cx, 18, 26, '#04060e', 324, 14); bitText(cx, 'AM RADIO', 52, 33, 1, '#9cf09c', { outline: null }); bitText(cx, 'DAY VS NIGHT', 274, 33, 1, '#c8ccd8', { outline: null });
        panel(cx, 54, 150, false, t, ease(W.daytime - 0.1, W.far, t)); bitText(cx, 'DAY', 46, 66, 2, '#ffffff', { outline: '#000' }); if (t > W.far - 0.1) bitText(cx, 'FADES OUT', 220, 180, 1, '#ff7b2e', { outline: '#000' });
        panel(cx, 212, 170, true, t, L.clamp01((t - W.bounce + 0.2) / Math.max(0.6, W.hundreds - W.bounce + 0.2)));
        bitText(cx, 'NIGHT', 54, 224, 2, '#c8d8ff', { outline: '#000' });
        { const k = ease(W.sky - 0.1, W.sky + 0.1, t); if (k > 0) { cx.globalAlpha = k; bitText(cx, 'IONOSPHERE', LW / 2, 236, 1, '#d0b8ff', { outline: '#000' }); cx.globalAlpha = 1; } }
        { const k = ease(W.hundreds - 0.1, W.hundreds + 0.12, t); if (k > 0) { const sc = 1 + 0.4 * (1 - k); cx.save(); cx.translate(LW / 2, 392); cx.scale(sc, sc); cx.globalAlpha = k; cx.fillStyle = 'rgba(4,10,6,0.92)'; cx.fillRect(-118, -11, 236, 22); cx.strokeStyle = '#62f05a'; cx.strokeRect(-117.5, -10.5, 235, 21); bitText(cx, 'HUNDREDS OF MILES', 0, 0, 1, '#62f05a', { outline: null }); cx.restore(); cx.globalAlpha = 1; } }
        { const k = Math.max(0.55, ease(W.scan - 0.1, W.scan + 0.1, t)); if (k > 0) { cx.globalAlpha = k; bevel(cx, 40, 452, 280, 46, '#e8dcb0', '#fff6d8', '#7a6a40'); for (let x = 50; x < 312; x += 8) px(cx, x, 460, '#3a2a1a', 1, x % 32 === 18 ? 9 : 5);
            const nx = 50 + 255 * (0.5 + 0.5 * Math.sin(Math.max(0, t - W.scan) * 2.2)); px(cx, nx, 456, '#d01010', 2, 38); bitText(cx, '530        1000        1600', LW / 2, 484, 1, '#3a2a1a', { outline: null });
            const k2 = ease(W.dark - 0.1, W.dark + 0.08, t); if (k2 > 0) { const sc = 1 + 0.6 * (1 - k2); cx.save(); cx.translate(LW / 2, 540); cx.rotate(-0.08); cx.scale(sc, sc); cx.globalAlpha = k2; cx.strokeStyle = '#62f05a'; cx.lineWidth = 3; cx.strokeRect(-104, -18, 208, 36); bitText(cx, 'SCAN AT NIGHT', 0, 0, 2, '#62f05a', { outline: '#021006' }); cx.restore(); } cx.globalAlpha = 1; } }
        { cx.fillStyle = 'rgba(4,8,16,0.9)'; cx.fillRect(28, 568, 304, 52); cx.strokeStyle = '#8a90a8'; cx.strokeRect(28.5, 568.5, 303, 51);   // v2: dato abajo (sin banda negra vacia)
          bitText(cx, 'AT NIGHT THE IONOSPHERE', LW / 2, 584, 1, '#d0b8ff', { outline: null }); bitText(cx, 'BOUNCES AM BACK DOWN', LW / 2, 602, 1, '#d0b8ff', { outline: null }); }
      } };
  }

  // ================= 07b PUERTA DE CARGA =================
  { const s = new THREE.Scene(); s.background = new THREE.Color(0x000000);
    const c = new THREE.PerspectiveCamera(50, LW / LH, 0.05, 30);
    const spot = new THREE.PointLight(0xffe8c8, 6, 6, 1.2); s.add(spot); s.add(new THREE.AmbientLight(0xffffff, 0.08));
    const R = L.rng(77);
    const tDoor = L.cvs(32, 64, (cx) => { for (let y = 0; y < 64; y++) for (let x = 0; x < 32; x++) { const n = 12 * Math.sin(x * 0.9 + Math.sin(y * 0.3) * 2) + R() * 10; px(cx, x, y, `rgb(${70 + n},${42 + n * 0.6},${24 + n * 0.4})`); }
      for (const [x, y, w, h] of [[4, 4, 24, 26], [4, 34, 24, 26]]) { px(cx, x, y, '#2a160a', w, 1); px(cx, x, y, '#2a160a', 1, h); px(cx, x, y + h - 1, '#8a5a34', w, 1); px(cx, x + w - 1, y, '#8a5a34', 1, h); } });
    const tFrame = L.cvs(16, 16, (cx) => { px(cx, 0, 0, '#4a3020', 16, 16); for (let k = 0; k < 20; k++) px(cx, R() * 16 | 0, R() * 16 | 0, '#2a1a10', 1, 2); });
    const tWallD = L.cvs(32, 32, (cx) => { for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const n = R() * 14; px(cx, x, y, `rgb(${40 + n},${38 + n},${34 + n})`); } });
    const mW = L.lam(L.rep(tWallD, 4, 4)); L.box(6, 4, 0.2, mW, -3.6, 1.5, 0, s); L.box(6, 4, 0.2, mW, 3.6, 1.5, 0, s); L.box(1.2, 1.4, 0.2, mW, 0, 2.9, 0, s);
    const mFr = L.lam(tFrame); L.box(0.1, 2.2, 0.26, mFr, -0.56, 1.1, 0, s); L.box(0.1, 2.2, 0.26, mFr, 0.56, 1.1, 0, s); L.box(1.22, 0.1, 0.26, mFr, 0, 2.2, 0, s);
    const fl = L.plane(6, 2.6, L.lam(L.rep(tWallD, 6, 3), 0x806040), 0, 0, 1.3, s, 0, -Math.PI / 2); void fl;   // v3: piso solo delante de la puerta (detras: nada)
    const hinge = new THREE.Group(); hinge.position.set(-0.5, 0, 0); s.add(hinge); const mD = L.lam(tDoor), mE = L.lam(null, 0x2a1a10);
    L.box(1.0, 2.1, 0.06, [mE, mE, mE, mE, mD, mD], 0.5, 1.05, 0, hinge); const kn = L.mesh(new THREE.SphereGeometry(0.035, 6, 5), L.lam(null, 0xc8a050), 0.9, 1.0, 0.06, hinge); void kn;
    // fix storyboard: puerta clasica de carga RE. Encuadre frontal y simetrico, marco oscuro, solo la hoja iluminada desde la camara;
    // la hoja se abre hacia adentro (lejos de la camara) sobre negro total y la camara avanza y cruza el umbral. Duracion = hasta 07c.
    const D = T['07c_ping'] - T['07b_door']; spot.distance = 5.0; s.children.forEach((o) => { if (o.isAmbientLight) o.intensity = 0.16; });   // v2 (usuario: muy oscura): luz suave en la puerta + resplandor tenue por la abertura
   // v3 (usuario): sin resplandor ni panel detras: la abertura es negro puro
    const fill = new THREE.PointLight(0xffd8a8, 2.2, 3.5, 1.2); fill.position.set(0.3, 2.0, 1.2); s.add(fill);
    out['07b_door'] = { scene: s, camera: c, update(lt) { const u = ease(0.18 * D, 0.62 * D, lt); hinge.rotation.y = -1.85 * u; const z = 2.3 - 2.9 * Math.pow(ease(0.05 * D, D, lt), 1.6);
        c.position.set(0, 1.15, z); c.lookAt(0, 1.12, z - 3); spot.position.set(0, 1.5, z + 0.5); spot.intensity = 9; },
      overlay(lt, dt, a, o) { const cx = o.tctx, k0 = 1 - ease(0, 0.12 * D, lt), k = ease(0.82 * D, D, lt); const g = cx.createRadialGradient(LW / 2, LH * 0.48, LW * 0.25, LW / 2, LH * 0.48, LH * 0.6); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.6)'); cx.fillStyle = g; cx.fillRect(0, 0, LW, LH);
        if (k0 + k > 0) { cx.fillStyle = `rgba(0,0,0,${Math.max(k0, k)})`; cx.fillRect(0, 0, LW, LH); } } };
  }
  return out;
}
