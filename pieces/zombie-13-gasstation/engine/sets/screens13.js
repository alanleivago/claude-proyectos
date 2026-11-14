// sets/screens13.js — ep13 "Gas Station, Part 1": pantallas RE en codigo.
// 02b_power: diagrama: el poste de luz alimenta la bomba; sin luz, la bomba no empuja la nafta (NO POWER = NO GAS).
// 03b_inv: ITEMS estilo RE: agua primero (SNACKS tachado), linterna, vendas; cada objeto 3D girando aparece en su palabra.
import { reText as bitText } from '../refont.js';

export async function shots({ L, examine }) {
  const CUE = await (await fetch('cues.json')).json(); const W = CUE.W, T = CUE.T;
  const { THREE, LW, LH } = L;
  const px = (c, x, y, col, w = 1, h = 1) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };
  const ease = (a, b, x) => L.smooth((x - a) / (b - a));
  const bevel = (cx, x, y, w, h, f = '#262a38', hi = '#7a8094', lo = '#0c0e14') => { px(cx, x, y, f, w, h); px(cx, x, y, hi, w, 1); px(cx, x, y, hi, 1, h); px(cx, x, y + h - 1, lo, w, 1); px(cx, x + w - 1, y, lo, 1, h); };
  const bgFill = (cx) => { const g = cx.createLinearGradient(0, 0, 0, LH); g.addColorStop(0, '#0a1430'); g.addColorStop(1, '#03050c'); cx.fillStyle = g; cx.fillRect(0, 0, LW, LH); cx.fillStyle = 'rgba(40,70,140,0.10)'; for (let y = 0; y < LH; y += 3) cx.fillRect(0, y, LW, 1); };
  const out = {};

  // ================= 02b POWER =================
  { const s = new THREE.Scene(); s.background = new THREE.Color(0x03050a); const c = new THREE.PerspectiveCamera(45, LW / LH, 0.1, 10);
    out['02b_power'] = { scene: s, camera: c, update() {}, overlay(lt, dt, a, o) { const cx = o.tctx, t = T['02b_power'] + lt; bgFill(cx);
        bevel(cx, 14, 22, 332, 22); px(cx, 18, 26, '#04060e', 324, 14); bitText(cx, 'HOW A PUMP WORKS', 92, 33, 1, '#9cf09c', { outline: null }); bitText(cx, 'GAS STATION', 290, 33, 1, '#c8ccd8', { outline: null });
        const cut = t >= W.power - 0.05, kE = ease(W.electricity - 0.1, W.electricity + 0.1, t);
        // poste + cable
        px(cx, 46, 90, '#8a6a4a', 8, 230); px(cx, 26, 100, '#8a6a4a', 48, 6); cx.strokeStyle = cut ? '#5a5a5a' : '#e8d040'; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(70, 104); cx.quadraticCurveTo(160, 160, 238, 150); cx.stroke();
        if (cut) { cx.strokeStyle = '#ff4030'; cx.lineWidth = 4; cx.beginPath(); cx.moveTo(140, 128); cx.lineTo(166, 154); cx.moveTo(166, 128); cx.lineTo(140, 154); cx.stroke(); }
        else if (kE > 0) { const u = (lt * 1.2) % 1, bx = 70 + 168 * u, by = 104 + 46 * u + 40 * Math.sin(u * Math.PI) * 0.6; cx.fillStyle = '#fff4a0'; cx.beginPath(); cx.moveTo(bx, by - 8); cx.lineTo(bx - 5, by + 1); cx.lineTo(bx, by + 1); cx.lineTo(bx - 3, by + 9); cx.lineTo(bx + 5, by - 2); cx.lineTo(bx, by - 2); cx.fill(); }
        // bomba + motor + tanque subterraneo
        bevel(cx, 230, 140, 70, 150, '#d8d4cc', '#f4f0e8', '#8a8680'); px(cx, 230, 140, '#c02a20', 70, 16); bitText(cx, 'FUEL', 265, 148, 1, '#f8f0e0', { outline: null });
        px(cx, 240, 166, cut ? '#101210' : '#0a0c0a', 50, 26); if (!cut) bitText(cx, '$12.40', 265, 179, 1, '#ffb030', { outline: null });
        px(cx, 30, 330, '#2a2a2e', 300, 3); cx.fillStyle = '#3a3020'; cx.fillRect(30, 333, 300, 120); bevel(cx, 150, 380, 150, 54, '#6a6a70', '#9a9aa0', '#3a3a40'); bitText(cx, 'TANK', 225, 407, 1, '#e8e8e8', { outline: null });
        cx.strokeStyle = '#9a9aa0'; cx.lineWidth = 4; cx.beginPath(); cx.moveTo(265, 290); cx.lineTo(265, 380); cx.stroke();
        const mx = 248, my = 300; cx.fillStyle = cut ? '#3a3a3e' : '#4fd6ff'; cx.beginPath(); cx.arc(mx + 17, my + 10, 12, 0, 7); cx.fill(); bitText(cx, 'MOTOR', 265, 324, 1, cut ? '#8a8a8a' : '#4fd6ff', { outline: '#000' });
        if (!cut) { const k = (lt * 3) % 1; for (let i = 0; i < 3; i++) { const yy = 375 - ((k + i / 3) % 1) * 80; px(cx, 262, yy, '#e8a040', 6, 6); } }
        { const k = ease(W.electricity - 0.1, W.electricity + 0.12, t); if (k > 0) { cx.globalAlpha = k; bitText(cx, 'PUMPS RUN ON', LW / 2, 470, 2, '#e8d040', { outline: '#000' }); bitText(cx, 'ELECTRICITY', LW / 2, 494, 2, '#e8d040', { outline: '#000' }); cx.globalAlpha = 1; } }
        { const k = ease(W.power - 0.1, W.power + 0.06, t); if (k > 0) { const sc = 1 + 0.6 * (1 - k); cx.save(); cx.translate(LW / 2, 548); cx.rotate(-0.07); cx.scale(sc, sc); cx.globalAlpha = k; cx.strokeStyle = '#ff4030'; cx.lineWidth = 3; cx.strokeRect(-118, -18, 236, 36); bitText(cx, 'NO POWER = NO GAS', 0, 0, 2, '#ff4030', { outline: '#000' }); cx.restore(); cx.globalAlpha = 1; } }
      } };
  }

  // ================= 03b ITEMS =================
  { const s = new THREE.Scene(); s.background = new THREE.Color(0x05070e);
    s.add(new THREE.AmbientLight(0xffffff, 1.1)); const dl = new THREE.DirectionalLight(0xffffff, 2.0); dl.position.set(-1, 1.6, 2); s.add(dl);
    const c = new THREE.OrthographicCamera(-LW / 2, LW / 2, LH / 2, -LH / 2, -1000, 1000); c.position.set(0, 0, 500); c.lookAt(0, 0, 0);
    const bg = L.cvs(LW, LH, (cx) => { bgFill(cx); bevel(cx, 14, 22, 332, 22); px(cx, 18, 26, '#04060e', 324, 14); for (const y of [152, 256, 360]) bevel(cx, 40, y - 44, 280, 88, '#0e1424'); });   // los recuadros van en el fondo (la capa 2D taparia los objetos 3D)
    L.plane(LW, LH, L.basic(bg), 0, 0, -400, s);
    const SLOT = [['WATER', 'water', 'water', 152], ['FLASHLIGHT', 'flashlight', 'flashlight', 256], ['BANDAGES', 'bandage', 'bandages', 360]];
    const items = [];
    const tRoll = L.cvs(32, 32, (c) => { const r = L.rng(1340); c.fillStyle = '#ece6d6'; c.fillRect(0, 0, 32, 32); for (let y = 0; y < 32; y += 3) { c.fillStyle = '#c8bea8'; c.fillRect(0, y, 32, 1); } for (let x = 0; x < 32; x += 4) { c.fillStyle = 'rgba(160,150,130,0.35)'; c.fillRect(x, 0, 1, 32); } for (let k = 0; k < 40; k++) { c.fillStyle = 'rgba(120,110,90,0.25)'; c.fillRect(r() * 32 | 0, r() * 32 | 0, 1, 1); } c.fillStyle = '#d02020'; c.fillRect(13, 12, 6, 2); c.fillRect(15, 10, 2, 6); });
    for (const [lab, model, word, y] of SLOT) { const o = L.ps1Clone((await L.loadModel(`models/${model}.glb`)).scene), g = new THREE.Group(); g.add(o); s.add(g); if (model === 'bandage') o.traverse((m) => { if (m.isMesh) m.material = L.lam(tRoll); });
      const bb = new THREE.Box3().setFromObject(o), size = Math.max(...bb.getSize(new THREE.Vector3()).toArray()); o.position.sub(bb.getCenter(new THREE.Vector3())); g.scale.setScalar(78 / size); g.userData.s0 = 78 / size; g.position.set(-90, LH / 2 - y, 60); items.push([g, word, lab, y]); }
    out['03b_inv'] = { scene: s, camera: c, update(lt, t) { const q = L.q15(lt); items.forEach(([g, w], i) => { const tw = i === 0 ? Math.min(W[w], T['03b_inv'] + 0.05) : W[w], k = ease(tw - 0.08, tw + 0.06, t); g.visible = k > 0; g.rotation.set(0.25, -0.6 + q * 0.9 + i, 0.05); g.scale.setScalar(g.userData.s0 * (0.6 + 0.4 * k)); }); },
      overlay(lt, dt, a, o) { const cx = o.tctx, t = T['03b_inv'] + lt;
        bitText(cx, 'ITEMS', 46, 33, 1, '#9cf09c', { outline: null }); bitText(cx, 'WHAT MATTERS', 280, 33, 1, '#c8ccd8', { outline: null });
        items.forEach(([g, w, lab, y], i) => { const tw = i === 0 ? Math.min(W[w], T['03b_inv'] + 0.05) : W[w], k = ease(tw - 0.08, tw + 0.06, t); if (k <= 0) return;
          cx.globalAlpha = k; bitText(cx, lab, 236, y - 6, 2, '#e8e8ec', { outline: '#000' }); bitText(cx, ['1ST', '2ND', '3RD'][i], 236, y + 18, 1, '#ffd23f', { outline: null }); cx.globalAlpha = 1;
          if (t < W[w] + 0.4) { cx.strokeStyle = '#ffe048'; cx.lineWidth = 2; cx.strokeRect(41, y - 43, 278, 86); } });
        { const k = ease(W.snacks - 0.08, W.snacks + 0.1, t); if (k > 0 && t < W.days - 0.1) { cx.globalAlpha = k; bevel(cx, 40, 60, 280, 34, '#1a0c0c'); bitText(cx, 'SNACKS', LW / 2, 77, 2, '#8a8a8a', { outline: null }); cx.strokeStyle = '#ff4030'; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(100, 77); cx.lineTo(260, 77); cx.stroke(); bitText(cx, 'LATER', 296, 77, 1, '#ff4030', { outline: null }); cx.globalAlpha = 1; } }
        { const k = ease(W.days - 0.1, W.days + 0.1, t); if (k > 0) { const sc = 1 + 0.5 * (1 - k); cx.save(); cx.translate(LW / 2, 77); cx.scale(sc, sc); cx.globalAlpha = k; cx.fillStyle = 'rgba(4,8,16,0.92)'; cx.fillRect(-150, -13, 300, 26); cx.strokeStyle = '#4fd6ff'; cx.strokeRect(-149.5, -12.5, 299, 25); bitText(cx, 'NO WATER: ~3 DAYS', 0, 0, 2, '#4fd6ff', { outline: null }); cx.restore(); cx.globalAlpha = 1; } }
        { const cur = t >= W.bandages - 0.08 ? 2 : t >= W.flashlight - 0.08 ? 1 : 0, EX = [['WATER', 'Weeks without food,\nabout 3 days without water.'], ['FLASHLIGHT', 'Light, but only when\nno one can see it.'], ['BANDAGES', 'Clean cuts and scrapes.\nInfection kills slowly.']];
          examine(o, Math.max(0, t - [T['03b_inv'], W.flashlight - 0.08, W.bandages - 0.08][cur]), EX[cur][0], EX[cur][1]); }
      } };
  }
  return out;
}
