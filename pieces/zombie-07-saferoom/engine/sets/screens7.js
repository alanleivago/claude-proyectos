// sets/screens7.js — ep7 "The Safe Room": pantallas RE sin decorado. 06 ITEM (el baul se llena en la palabra de cada cosa,
// lista de Ready.gov), 07 EXAMINE "FIRST AID SPRAY" (diseno propio, no el logo de RE) con la cura (HUD -> FINE), 10 tarjeta
// final (escalera girando, NEXT: / THE STAIRS. / FOLLOW FOR MORE!). Tiempos: cues.json. Prefijo propio: S*.
import { reText as bitText, reWidth as textWidth } from '../refont.js';
import { makeSpray } from './respray.js';

export async function shots({ L, examine }) {
  const CUE = await (await fetch('cues.json')).json(); const W = CUE.W, T = CUE.T;
  const { THREE, LW, LH } = L;
  const px = (c, x, y, col, w = 1, h = 1) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const ease = (a, b, x) => L.smooth((x - a) / (b - a));
  const prop = async (n) => L.ps1Clone((await L.loadModel(`models/${n}.glb`)).scene);
  const P2 = (x, y) => [x - LW / 2, LH / 2 - y];
  const bevel = (cx, x, y, w, h, f = '#262a38', hi = '#7a8094', lo = '#0c0e14') => { px(cx, x, y, f, w, h); px(cx, x, y, hi, w, 1); px(cx, x, y, hi, 1, h); px(cx, x, y + h - 1, lo, w, 1); px(cx, x + w - 1, y, lo, 1, h); };
  const slot = (cx, x, y, w, h) => { px(cx, x, y, '#0e2a1a', w, h); for (let yy = y + 3; yy < y + h - 2; yy += 3) px(cx, x + 2, yy, '#123a24', w - 4, 1); px(cx, x, y, '#58b07c', w, 1); px(cx, x, y, '#58b07c', 1, h); px(cx, x, y + h - 1, '#04100a', w, 1); px(cx, x + w - 1, y, '#04100a', 1, h); };
  const ortho = () => { const c = new THREE.OrthographicCamera(-LW / 2, LW / 2, LH / 2, -LH / 2, -1000, 1000); c.position.set(0, 0, 500); c.lookAt(0, 0, 0); return c; };
  const lit = (s) => { s.add(new THREE.AmbientLight(0xffffff, 1.1)); const dl = new THREE.DirectionalLight(0xffffff, 2.0); dl.position.set(-1, 1.6, 2); s.add(dl); };
  const out = {};

  // ---------- 06 ITEM: 6 casillas (agua, comida, linterna, pilas, radio, cargador) + el baul abierto que se llena ----------
  { const s = new THREE.Scene(); s.background = new THREE.Color(0x05070e); lit(s); const c = ortho();
    const SL = [[28, 70, 148, 82], [184, 70, 148, 82], [28, 160, 148, 82], [184, 160, 148, 82], [28, 250, 148, 82], [184, 250, 148, 82]];
    const bg = L.cvs(LW, LH, (cx) => { const g = cx.createLinearGradient(0, 0, 0, LH); g.addColorStop(0, '#0a1430'); g.addColorStop(1, '#03050c'); cx.fillStyle = g; cx.fillRect(0, 0, LW, LH);
      cx.fillStyle = 'rgba(40,70,140,0.10)'; for (let y = 0; y < LH; y += 3) cx.fillRect(0, y, LW, 1);
      bevel(cx, 14, 22, 332, 22); px(cx, 18, 26, '#04060e', 324, 14); bevel(cx, 20, 62, 320, 278); for (const [x, y, w, h] of SL) slot(cx, x, y, w, h); bevel(cx, 60, 452, 240, 150, '#141826'); });
    L.plane(LW, LH, L.basic(bg), 0, 0, -400, s);
    const icon = async (n, x, y, sc, rx = 0.3, ry = 0.4) => { const g = new THREE.Group(), o = await prop(n); g.add(o); o.rotation.set(0, ry, 0); g.scale.setScalar(sc); const [X, Y] = P2(x, y); g.position.set(X, Y, 0); g.rotation.x = rx; s.add(g); return g; };
    const ITEMS = [['water', 'WATER 1 GAL x4', W.water, 165], ['can', 'FOOD x12', W.food, 380], ['flashlight', 'FLASHLIGHT', W.flashlight, 360], ['battery', 'BATTERIES x8', W.batteries, 700], ['radio', 'RADIO', W.radio, 150], ['charger', 'CHARGER', W.charger, 400]];
    const icons = [];
    for (let i = 0; i < ITEMS.length; i++) { const [n, , , sc] = ITEMS[i], [x, y, w, h] = SL[i]; const g = await icon(n, x + 40, y + h - 12, sc); icons.push(g);
      if (n === 'battery') for (const dx of [-14, 14, 28]) { const o = await prop('battery'); o.position.set(dx / sc, 0, 0); g.add(o); } }
    // chest abierto abajo + copias que caen adentro
    const chG = new THREE.Group(), chest = await prop('chest'); chG.add(chest); chG.scale.setScalar(180); const [CX, CY] = P2(180, 556); chG.position.set(CX, CY, 0); chG.rotation.set(0.42, -0.35, 0); s.add(chG);
    const lid = chest.getObjectByName('chest_lid');
    const isp = new THREE.Group(); isp.add(makeSpray(L)); isp.scale.setScalar(260); { const [x, y] = P2(282, 590); isp.position.set(x, y, 30); } isp.rotation.x = 0.25; s.add(isp);   // el First Aid Spray del ep1 ya guardado junto al baul
    const flyers = []; for (const [n, , , sc] of ITEMS) { const o = await prop(n); const g = new THREE.Group(); g.add(o); g.scale.setScalar(sc * 0.55); s.add(g); flyers.push(g); }
    out['06_item'] = { scene: s, camera: c, update(lt) {
        const t = T['06_item'] + lt, q = L.q15(lt);
        ITEMS.forEach(([, , tw], i) => { const k = ease(tw - 0.05, tw + 0.15, t); icons[i].scale.setScalar(Math.max(0.001, k) * ITEMS[i][3]); icons[i].children[0].rotation.y = 0.4 + 0.5 * Math.sin(q * 1.2 + i);
          const f = flyers[i], u = ease(tw + 0.15, tw + 0.6, t), [x, y, w, h] = SL[i], [ax, ay] = P2(x + 40, y + h - 12), [bx, by] = P2(180 + (i - 2.5) * 14, 560);
          f.visible = u > 0 && u < 1; f.position.set(ax + (bx - ax) * u, ay + (by - ay) * u + 60 * Math.sin(u * Math.PI), 10); f.rotation.set(0.3, u * 4, 0); });
        isp.rotation.y = 0.5 * Math.sin(q * 1.1); lid.rotation.x = -1.75 * (1 - ease(W.chest - 0.05, W.chest + 0.25, t)); chG.rotation.y = -0.35 + 0.08 * Math.sin(q * 0.8);
      },
      overlay(lt, dt, a, o) { const cx = o.tctx, t = T['06_item'] + lt;
        bitText(cx, 'ITEMS', 46, 33, 1, '#9cf09c', { outline: null }); bitText(cx, 'DAY 3  //  SAFE ROOM', 248, 33, 1, '#c8ccd8', { outline: null });
        ITEMS.forEach(([, lab, tw], i) => { const [x, y, w] = SL[i]; if (t >= tw) bitText(cx, lab, x + 100, y + 16, 1, '#e8e8ec', { outline: '#000' });
          if (t >= tw && t < tw + 0.6 && Math.floor((t - tw) * 8) % 2 === 0) { cx.strokeStyle = '#ffe048'; cx.lineWidth = 2; cx.strokeRect(x - 1, y - 1, w + 2, 84); } });
        bitText(cx, 'ITEM BOX', LW / 2, 468, 2, t >= W.chest ? '#ffd23f' : '#9aa0b0', { outline: '#000' });
        if (t >= W.fema) { const k = ease(W.fema, W.fema + 0.12, t), sc = 1 + 0.6 * (1 - k); cx.save(); cx.translate(LW / 2, 360); cx.rotate(-0.08); cx.scale(sc, sc); cx.globalAlpha = k;
          cx.strokeStyle = '#62f05a'; cx.lineWidth = 3; cx.strokeRect(-128, -18, 256, 36); bitText(cx, 'READY.GOV KIT: OK', 0, 0, 2, '#62f05a', { outline: '#021006' }); cx.restore(); cx.globalAlpha = 1; }
      } };
  }
  // ---------- 07 EXAMINE: FIRST AID SPRAY girando (+ venda y botiquin chicos); en la cura, destello verde ----------
  { const s = new THREE.Scene(); s.background = new THREE.Color(0x04060c); lit(s); const c = ortho();
    const bg = L.cvs(LW, LH, (cx) => { cx.fillStyle = '#04060c'; cx.fillRect(0, 0, LW, LH); cx.strokeStyle = 'rgba(70,200,110,0.25)'; for (let x = 0; x <= LW; x += 20) { cx.beginPath(); cx.moveTo(x + 0.5, 120); cx.lineTo(x + 0.5, 420); cx.stroke(); } for (let y = 120; y <= 420; y += 20) { cx.beginPath(); cx.moveTo(0, y + 0.5); cx.lineTo(LW, y + 0.5); cx.stroke(); } });
    L.plane(LW, LH, L.basic(bg), 0, 0, -400, s);
    const sp = new THREE.Group(), o = makeSpray(L); sp.add(o); o.position.y = -0.1; sp.scale.setScalar(1050); const [X, Y] = P2(180, 268); sp.position.set(X, Y, 0); s.add(sp);
    const bd = new THREE.Group(), b2 = await prop('bandage'); bd.add(b2); bd.scale.setScalar(700); { const [x, y] = P2(70, 360); bd.position.set(x, y, 0); } s.add(bd);
    const kt = new THREE.Group(), k2 = await prop('kit'); kt.add(k2); kt.scale.setScalar(260); { const [x, y] = P2(292, 380); kt.position.set(x, y, 0); } s.add(kt); k2.getObjectByName('kit_lid').rotation.x = -1.6;
    out['07_examine'] = { scene: s, camera: c, update(lt) { const q = L.q15(lt); sp.rotation.set(0.12, 0.7 * Math.sin(q * 1.3), 0.08 * Math.sin(q)); bd.rotation.set(0.4, q * 0.8, 0); kt.rotation.set(0.35, -0.5 + 0.2 * Math.sin(q), 0); },
      overlay(lt, dt, a, o) { const cx = o.tctx, t = T['07_examine'] + lt;
        examine(o, lt, 'FIRST AID SPRAY', 'Spray, wrap, then press hard.\nA full 15 minutes. No peeking.');
        if (t > W.fifteen) { const k = ease(W.fifteen, W.fifteen + 0.15, t); cx.globalAlpha = k; { const left = Math.max(0, 900 - Math.floor((t - W.fifteen) * 900 / (W.heal - W.fifteen))); bitText(cx, `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}`, LW / 2, 104, 3, '#ffd23f', { outline: '#000' }); } cx.globalAlpha = 1; }
        const h = t - W.heal; if (h > 0 && h < 0.9) { cx.fillStyle = `rgba(80,255,120,${0.35 * (1 - h / 0.9)})`; cx.fillRect(0, 0, LW, LH);
          for (let i = 0; i < 14; i++) { const r = L.rng(100 + i), x = 60 + r() * 240, y = 380 - ((h * 260 + r() * 200) % 260); px(cx, x, y, '#b8ffc8', 2, 2); } }
        if (h > 0) { cx.globalAlpha = ease(0, 0.2, h); bitText(cx, 'CONDITION: FINE', LW / 2, 590, 2, '#62f05a', { outline: '#021006' }); cx.globalAlpha = 1; }
      } };
  }
  // ---------- 10 tarjeta final: escalera de madera girando + NEXT: / THE STAIRS. (maquina de escribir) + FOLLOW FOR MORE! ----------
  { const s = new THREE.Scene(); s.background = new THREE.Color(0x000000);
    const c = new THREE.PerspectiveCamera(30, LW / LH, 0.1, 50); c.position.set(0, 0, 7.4); c.lookAt(0, 0, 0);
    s.add(new THREE.AmbientLight(0xffffff, 0.8)); const dl = new THREE.DirectionalLight(0xfff2dc, 1.7); dl.position.set(2, 3, 4); s.add(dl);
    const st = new THREE.Group(); s.add(st); st.position.set(0, 0.55, 0);
    const tW = L.cvs(32, 16, (cx) => { const r = L.rng(5); for (let y = 0; y < 16; y++) for (let x = 0; x < 32; x++) { const n = 10 * Math.sin(x * 0.7 + y * 0.2) + r() * 8; px(cx, x, y, `rgb(${120 + n},${72 + n * 0.6},${36 + n * 0.4})`); } px(cx, 0, 0, '#5a3418', 32, 1); });
    const tR = L.cvs(16, 16, (cx) => { px(cx, 0, 0, '#e8e2d2', 16, 16); px(cx, 0, 15, '#a8a090', 16, 1); });
    const mT = L.lam(tW), mR = L.lam(tR), mS = L.lam(null, 0x6a4020);
    for (let i = 0; i < 6; i++) { L.box(1.2, 0.06, 0.32, mT, 0, -0.9 + i * 0.3 + 0.27, -0.75 + i * 0.28, st); L.box(1.2, 0.27, 0.03, mR, 0, -0.9 + i * 0.3 + 0.12, -0.6 + i * 0.28 - 0.01, st); }
    for (const x of [-0.63, 0.63]) { const sg = L.box(0.05, 0.24, 2.25, mS, x, 0.0, -0.04, st); sg.rotation.x = -Math.atan2(1.5, 1.4); }   // largueros bajo las huellas (pendiente 0.30/0.28)
    st.scale.setScalar(0.75); st.position.set(0, 0.85, 0);
    out['10_end'] = { scene: s, camera: c, update(lt) { const q = L.q15(lt); st.rotation.y = -0.7 + q * 0.5; st.rotation.x = 0.18; },
      overlay(lt, dt, a, o) { const cx = o.tctx; cx.textAlign = 'center'; cx.textBaseline = 'middle';
        const n = Math.floor(lt * 14); cx.font = '15px "Courier New", monospace'; cx.fillStyle = '#e8e4dc'; cx.fillText('NEXT:'.slice(0, n), LW / 2, 432);
        if (lt > 0.5) { cx.font = 'bold 32px "Courier New", monospace'; cx.fillStyle = '#e03a2a'; cx.fillText('THE STAIRS.'.slice(0, Math.floor((lt - 0.5) * 12)), LW / 2, 466); }
        if (lt > 1.6) { const q2 = 'Should I open the door?', n2 = Math.floor((lt - 1.6) * 16); cx.font = 'bold 19px "Courier New", monospace'; cx.fillStyle = '#000'; cx.fillText(q2.slice(0, n2), LW / 2 + 2, 506 + 2); cx.fillStyle = '#ffd23f'; cx.fillText(q2.slice(0, n2), LW / 2, 506); }
        if (lt > 3.2) bitText(cx, 'FOLLOW FOR MORE!', LW / 2, 556, 2, '#ececec', { outline: null });
      } };
  }
  void textWidth;
  return out;
}
