// sets/screens11.js — ep11 "How Not to Turn": pantallas RE en codigo.
// 02_micro: MICROSCOPIO (UI estilo RE, etiqueta X-VIRUS): virus con cara (tierno pero inquietante), globulos rojos, y las vias de entrada
//           BITE / SCRATCH / SPLASH (EYES / MOUTH) con flechas, cada una en su palabra.
// 05c_spray: ITEM / USE "FIRST AID SPRAY" (el del ep1, girando) con la nube al desinfectar.
// 07_diary: FILE "SYMPTOM DIARY" a maquina, letra por letra (DAY 1 / DAY 2 / DAY 3 ???), regla de este mundo.
import { reText as bitText, reWidth } from '../refont.js';
import { makeSpray } from './respray.js';

export async function shots({ L, examine }) {
  const CUE = await (await fetch('cues.json')).json(); const W = CUE.W, T = CUE.T;
  const { THREE, LW, LH } = L;
  const px = (c, x, y, col, w = 1, h = 1) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };
  const ease = (a, b, x) => L.smooth((x - a) / (b - a));
  const bevel = (cx, x, y, w, h, f = '#262a38', hi = '#7a8094', lo = '#0c0e14') => { px(cx, x, y, f, w, h); px(cx, x, y, hi, w, 1); px(cx, x, y, hi, 1, h); px(cx, x, y + h - 1, lo, w, 1); px(cx, x + w - 1, y, lo, 1, h); };
  const blackScene = () => { const s = new THREE.Scene(); s.background = new THREE.Color(0x03050a); const c = new THREE.PerspectiveCamera(45, LW / LH, 0.1, 10); return [s, c]; };
  const out = {};

  // ================= 02 MICROSCOPIO =================
  { const [scene, camera] = blackScene(); const CX = 180, CY = 222, R = 124; const PXC = document.createElement('canvas'); PXC.width = 110; PXC.height = 110;
    const virus = (cx, x, y, r, t, blink) => {   // cuerpo morado con manchas, 14 espinas con bolita que se mueven a 15 fps, ojos grandes, sonrisa de dientes
      const q = L.q15(t);
      for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2 + 0.05 * Math.sin(q * 3 + i), l = r * (1.32 + 0.07 * Math.sin(q * 5 + i * 1.7));
        for (let k = 0; k <= 8; k++) { const rr = r * 0.9 + (l - r * 0.9) * k / 8; px(cx, x + Math.cos(a) * rr - 1, y + Math.sin(a) * rr - 1, '#5a1c8a', 3, 3); }
        cx.fillStyle = '#d04a9a'; cx.beginPath(); cx.arc(x + Math.cos(a) * l, y + Math.sin(a) * l, 4.5, 0, 7); cx.fill(); px(cx, x + Math.cos(a) * l - 2, y + Math.sin(a) * l - 3, '#f8a0d0', 2, 2); }
      const g = cx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r); g.addColorStop(0, '#b066f0'); g.addColorStop(0.7, '#7a2cc8'); g.addColorStop(1, '#3e1070');
      cx.fillStyle = g; cx.beginPath(); for (let i = 0; i <= 40; i++) { const a = i / 40 * Math.PI * 2, rr = r * (1 + 0.04 * Math.sin(a * 5 + q * 4)); cx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } cx.fill();
      const R2 = L.rng(31); cx.fillStyle = 'rgba(40,6,70,0.45)'; for (let k = 0; k < 9; k++) { const a = R2() * 7, d = R2() * r * 0.8; cx.beginPath(); cx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, 3 + R2() * 5, 0, 7); cx.fill(); }
      for (const s of [-1, 1]) { const ex = x + s * r * 0.36, ey = y - r * 0.18;   // ojos grandes y brillantes (tierno), cejas en V (inquietante)
        if (blink) { px(cx, ex - 12, ey, '#1a0428', 24, 3); continue; }
        cx.fillStyle = '#fbfaff'; cx.beginPath(); cx.ellipse(ex, ey, 13, 15, 0, 0, 7); cx.fill(); cx.fillStyle = '#1a0428'; cx.beginPath(); cx.ellipse(ex + s * 2 + 2 * Math.sin(q * 1.3), ey + 3, 7, 9, 0, 0, 7); cx.fill();
        px(cx, ex - 3 + s * 2, ey - 5, '#ffffff', 4, 4); px(cx, ex + 3, ey + 6, '#ffffff', 2, 2);
        cx.strokeStyle = '#2a0640'; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(ex - s * 14, ey - 20); cx.lineTo(ex + s * 10, ey - 15); cx.stroke(); }
      const my = y + r * 0.38, mw = r * 0.62; cx.fillStyle = '#2a0418'; cx.beginPath(); cx.moveTo(x - mw, my - 4); cx.quadraticCurveTo(x, my + 26, x + mw, my - 4); cx.quadraticCurveTo(x, my + 8, x - mw, my - 4); cx.fill();
      cx.fillStyle = '#f4f0e0'; for (let i = 0; i < 7; i++) { const tx = x - mw * 0.8 + i * mw * 0.27, ty = my + 1 + 6 * Math.sin((i + 0.5) / 7 * Math.PI); cx.beginPath(); cx.moveTo(tx - 4, ty - 4); cx.lineTo(tx + 4, ty - 4); cx.lineTo(tx, ty + 4); cx.fill(); }
      cx.fillStyle = '#e04a6a'; cx.beginPath(); cx.ellipse(x + 6, my + 13, 7, 3, 0, 0, 7); cx.fill();   // lengua
    };
    const cell = (cx, x, y, r) => { cx.fillStyle = '#b8201c'; cx.beginPath(); cx.ellipse(x, y, r, r * 0.8, 0, 0, 7); cx.fill(); cx.fillStyle = '#7a0e0c'; cx.beginPath(); cx.ellipse(x, y, r * 0.45, r * 0.32, 0, 0, 7); cx.fill(); px(cx, x - r * 0.5, y - r * 0.55, '#e85a50', 3, 2); };
    const ROUTES = [['BITE', 'bite2', 62], ['SCRATCH', 'scratch2', 180], ['SPLASH', 'splash2', 298]];
    const icon = (cx, k, x, y) => {
      if (k === 'BITE') { cx.strokeStyle = '#f0f0e0'; cx.lineWidth = 2; cx.beginPath(); cx.arc(x, y + 6, 14, Math.PI, 0); cx.stroke(); for (let i = 0; i < 5; i++) { cx.fillStyle = '#f0f0e0'; cx.beginPath(); cx.moveTo(x - 12 + i * 6, y + 6); cx.lineTo(x - 9 + i * 6, y - 2 - (i % 2) * 3); cx.lineTo(x - 6 + i * 6, y + 6); cx.fill(); } px(cx, x - 6, y + 8, '#c0101a', 3, 4); px(cx, x + 4, y + 9, '#c0101a', 2, 3); }
      if (k === 'SCRATCH') for (let i = 0; i < 3; i++) for (let s = 0; s < 14; s++) px(cx, x - 12 + i * 8 + s * 0.6, y - 10 + s * 1.4, s % 4 ? '#c0101a' : '#ff5050', 2, 2);
      if (k === 'SPLASH') { cx.fillStyle = '#f8f8f0'; cx.beginPath(); cx.ellipse(x - 9, y - 4, 9, 5, 0, 0, 7); cx.fill(); px(cx, x - 12, y - 7, '#3a2a1a', 6, 6); cx.fillStyle = '#d8606a'; cx.beginPath(); cx.ellipse(x + 10, y + 8, 7, 4, 0, 0, 7); cx.fill(); px(cx, x + 4, y + 7, '#4a0a14', 12, 2);
        cx.fillStyle = '#c0101a'; for (const [dx, dy] of [[-2, -16], [6, -12], [12, -4]]) { cx.beginPath(); cx.arc(x + dx, y + dy, 2.5, 0, 7); cx.fill(); } }
    };
    out['02_micro'] = { scene, camera, hard: false, update() {}, overlay(lt, dt, a, o) {
      const cx = o.tctx, t = T['02_micro'] + lt, q = L.q15(lt);
      const g0 = cx.createLinearGradient(0, 0, 0, LH); g0.addColorStop(0, '#0a1430'); g0.addColorStop(1, '#03050c'); cx.fillStyle = g0; cx.fillRect(0, 0, LW, LH);
      cx.fillStyle = 'rgba(40,70,140,0.10)'; for (let y = 0; y < LH; y += 3) cx.fillRect(0, y, LW, 1);
      bevel(cx, 14, 22, 332, 22); px(cx, 18, 26, '#04060e', 324, 14); bitText(cx, 'MICROSCOPE', 62, 33, 1, '#9cf09c', { outline: null }); bitText(cx, 'x40,000', 300, 33, 1, '#c8ccd8', { outline: null });
      // lente: liquido ambar-verde, globulos rojos a la deriva, el virus en el centro
      const iris = ease(0, 0.45, lt), r = R * (0.25 + 0.75 * iris);
      cx.save(); cx.beginPath(); cx.arc(CX, CY, r, 0, 7); cx.clip();
      const g = cx.createRadialGradient(CX, CY, 10, CX, CY, R); g.addColorStop(0, '#d8e0a0'); g.addColorStop(0.75, '#a8b870'); g.addColorStop(1, '#4a5a30'); cx.fillStyle = g; cx.fillRect(CX - R, CY - R, 2 * R, 2 * R);
      const R3 = L.rng(5); for (let k = 0; k < 9; k++) { const x0 = R3() * 300 + 30, y0 = R3() * 260 + 90, vx = (R3() - 0.5) * 18, vy = (R3() - 0.5) * 12; cell(cx, x0 + vx * q, y0 + vy * q, 13 + R3() * 6); }
      cx.fillStyle = 'rgba(255,255,230,0.25)'; for (let k = 0; k < 30; k++) px(cx, CX - R + R3() * 2 * R, CY - R + R3() * 2 * R + Math.sin(q + k) * 3, 'rgba(255,255,230,0.3)', 2, 2);
      const vk = ease(0.15, 0.55, lt), blink = (Math.floor(q * 15) % 52) < 3;
      if (vk > 0) virus(cx, CX + 4 * Math.sin(q * 1.1), CY + 5 * Math.sin(q * 1.7), 44 * (0.5 + 0.5 * vk), lt, blink);
      cx.restore();
      { const x0 = CX - R - 2, y0 = CY - R - 2, w = 2 * R + 4; PXC.getContext('2d').drawImage(cx.canvas, x0, y0, w, w, 0, 0, w / 2.5, w / 2.5); cx.save(); cx.imageSmoothingEnabled = false; cx.beginPath(); cx.arc(CX, CY, r, 0, 7); cx.clip(); cx.drawImage(PXC, 0, 0, w / 2.5, w / 2.5, x0, y0, w, w); cx.restore(); }   // v2 (revision): el lente pixelado al nivel PS1
      cx.strokeStyle = '#8a90a8'; cx.lineWidth = 6; cx.beginPath(); cx.arc(CX, CY, r + 3, 0, 7); cx.stroke(); cx.strokeStyle = '#2a2e3e'; cx.lineWidth = 2; cx.beginPath(); cx.arc(CX, CY, r + 7, 0, 7); cx.stroke();
      for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2, l = i % 6 ? 5 : 10; cx.strokeStyle = '#c8ccd8'; cx.lineWidth = 1; cx.beginPath(); cx.moveTo(CX + Math.cos(a) * (r + 9), CY + Math.sin(a) * (r + 9)); cx.lineTo(CX + Math.cos(a) * (r + 9 + l), CY + Math.sin(a) * (r + 9 + l)); cx.stroke(); }
      // etiqueta X-VIRUS (siempre, roja) + IN THIS WORLD + LIKE RABIES
      { const k = ease(0.35, 0.6, lt); cx.globalAlpha = k; cx.fillStyle = 'rgba(4,8,16,0.9)'; cx.fillRect(CX - 62, CY - R - 34, 124, 24); cx.strokeStyle = '#ff4030'; cx.lineWidth = 1; cx.strokeRect(CX - 61.5, CY - R - 33.5, 123, 23); bitText(cx, 'X-VIRUS', CX, CY - R - 22, 2, '#ff4030', { outline: null }); cx.globalAlpha = 1; }
      { const k = ease(W.rabies - 0.1, W.rabies + 0.12, t); if (k > 0) { cx.globalAlpha = k; cx.fillStyle = 'rgba(4,8,16,0.9)'; cx.fillRect(232, 300, 116, 34); cx.strokeStyle = '#c86cff'; cx.strokeRect(232.5, 300.5, 115, 33); bitText(cx, 'IN THIS WORLD:', 290, 310, 1, '#9ad8ff', { outline: null }); bitText(cx, 'LIKE RABIES', 290, 324, 1, '#e0b0ff', { outline: null }); cx.globalAlpha = 1; } }
      for (const [lab, w, x, y, col] of [['BLOOD', 'blood', 54, 312, '#ff4030'], ['SPIT', 'spit', 54, 336, '#ffd0a0']]) { const k = ease(W[w] - 0.08, W[w] + 0.1, t); if (k <= 0) continue; cx.globalAlpha = k; cx.fillStyle = col; cx.beginPath(); cx.arc(x - 26, y, 4, 0, 7); cx.fill(); bitText(cx, lab, x + 6, y, 1, col, { outline: '#000' }); cx.globalAlpha = 1; }
      // vias de entrada: flecha desde la lente a cada caja, la caja aparece en su palabra
      ROUTES.forEach(([lab, w, x]) => { const k = ease(W[w] - 0.08, W[w] + 0.12, t); if (k <= 0) return; const y0 = CY + R + 10, y1 = 476, yk = y0 + (y1 - y0) * k;
        cx.strokeStyle = '#ff4030'; cx.lineWidth = 2; { const x0 = CX + (x - CX) * 0.25, at = (yy) => x0 + (x - x0) * (yy - y0) / (y1 - y0); cx.beginPath(); cx.moveTo(x0, y0); cx.lineTo(at(Math.min(yk, 398)), Math.min(yk, 398)); if (yk > 442) { cx.moveTo(at(442), 442); cx.lineTo(x, yk); } cx.stroke(); }   // v3: hueco para el subtitulo
        cx.fillStyle = '#ff4030'; cx.beginPath(); cx.moveTo(x - 6, yk - 8); cx.lineTo(x + 6, yk - 8); cx.lineTo(x, yk); cx.fill();
        if (k < 1) return; const sc = 1 + 0.4 * (1 - ease(W[w] + 0.1, W[w] + 0.22, t));
        cx.save(); cx.translate(x, 520); cx.scale(sc, sc); cx.fillStyle = 'rgba(4,8,16,0.92)'; cx.fillRect(-54, -38, 108, 76); cx.strokeStyle = '#ff4030'; cx.strokeRect(-53.5, -37.5, 107, 75); icon(cx, lab, 0, -10); bitText(cx, lab, 0, 18, 1, '#f0f0e8', { outline: null });
        if (lab === 'SPLASH') bitText(cx, 'EYES / MOUTH', 0, 30, 1, '#ffb0a0', { outline: null }); cx.restore(); });
      const wk = 1 - ease(0, 0.35, lt); if (wk > 0) { cx.fillStyle = `rgba(250,248,244,${0.9 * wk})`; cx.fillRect(0, 0, LW, LH); }   // el destello de 01b se abre aqui (sin corte duro)
    } };
  }

  // ================= 05c FIRST AID SPRAY: USE =================
  { const s = new THREE.Scene(); s.background = new THREE.Color(0x05070e);
    s.add(new THREE.AmbientLight(0xffffff, 1.1)); const dl = new THREE.DirectionalLight(0xffffff, 2.0); dl.position.set(-1, 1.6, 2); s.add(dl);
    const c = new THREE.OrthographicCamera(-LW / 2, LW / 2, LH / 2, -LH / 2, -1000, 1000); c.position.set(0, 0, 500); c.lookAt(0, 0, 0);
    const bg = L.cvs(LW, LH, (cx) => { const g = cx.createLinearGradient(0, 0, 0, LH); g.addColorStop(0, '#0a1430'); g.addColorStop(1, '#03050c'); cx.fillStyle = g; cx.fillRect(0, 0, LW, LH);
      cx.fillStyle = 'rgba(40,70,140,0.10)'; for (let y = 0; y < LH; y += 3) cx.fillRect(0, y, LW, 1); bevel(cx, 14, 22, 332, 22); px(cx, 18, 26, '#04060e', 324, 14); bevel(cx, 60, 70, 240, 300, '#0e1424');
      cx.strokeStyle = 'rgba(70,200,110,0.22)'; for (let x = 60; x <= 300; x += 20) { cx.beginPath(); cx.moveTo(x + 0.5, 70); cx.lineTo(x + 0.5, 370); cx.stroke(); } for (let y = 70; y <= 370; y += 20) { cx.beginPath(); cx.moveTo(60, y + 0.5); cx.lineTo(300, y + 0.5); cx.stroke(); } });
    L.plane(LW, LH, L.basic(bg), 0, 0, -400, s);
    const sp = makeSpray(L), g = new THREE.Group(); g.add(sp); sp.position.y = -0.1; g.scale.setScalar(1250); g.position.set(0, LH / 2 - 225, 0); s.add(g);
    out['05c_spray'] = { scene: s, camera: c, update(lt) { const q = L.q15(lt); sp.rotation.set(0.12, -0.5 + q * 0.8, -0.06); },
      overlay(lt, dt, a, o) { const cx = o.tctx, t = T['05c_spray'] + lt;
        bitText(cx, 'ITEMS', 46, 33, 1, '#9cf09c', { outline: null }); bitText(cx, 'FIRST AID SPRAY', 250, 33, 1, '#c8ccd8', { outline: null });
        const k = ease(W.disinfect - 0.05, W.disinfect + 0.1, t);
        bevel(cx, 236, 330, 90, 30, '#141a2c'); bitText(cx, k > 0 ? '> USE' : '  USE', 281, 345, 2, k > 0 ? '#ffe048' : '#9a9aa8', { outline: '#000' });
        if (k > 0) { const R = L.rng(Math.floor(L.q15(lt) * 15)), d = t - W.disinfect; for (let i = 0; i < 26; i++) { const u = (i / 26 + d * 1.6) % 1, x = 205 + u * 110 + (R() - 0.5) * 30 * u, y = 108 + (R() - 0.5) * 60 * u; px(cx, x, y, `rgba(200,255,210,${0.8 * (1 - u)})`, 3, 3); }
          bitText(cx, 'DISINFECTED', 146, 345, 2, '#62f05a', { outline: '#021006' }); }
        examine(o, lt, 'FIRST AID SPRAY', 'Wash first, 15 minutes.\nThen disinfect the wound.');
        { const k = ease(W.medical - 0.1, W.medical + 0.12, t); if (k > 0) { const sc = 1 + 0.5 * (1 - k); cx.save(); cx.translate(LW / 2, 536); cx.scale(sc, sc); cx.globalAlpha = k; cx.fillStyle = 'rgba(4,10,6,0.92)'; cx.fillRect(-120, -20, 240, 40); cx.strokeStyle = '#ff4030'; cx.lineWidth = 2; cx.strokeRect(-119, -19, 238, 38);
          cx.fillStyle = '#ff4030'; cx.fillRect(-108, -6, 16, 4); cx.fillRect(-102, -12, 4, 16); bitText(cx, 'THEN: A DOCTOR, FAST', 12, -2, 1, '#f0f0e8', { outline: null }); cx.restore(); cx.globalAlpha = 1; } }
      } };
  }

  // ================= 07 FILE: SYMPTOM DIARY =================
  { const [scene, camera] = blackScene(); const R = L.rng(70);
    const paper = document.createElement('canvas'); paper.width = 300; paper.height = 400; { const c = paper.getContext('2d'); c.fillStyle = '#e4dcc4'; c.fillRect(0, 0, 300, 400);
      for (let k = 0; k < 900; k++) { c.fillStyle = `rgba(${120 + R() * 40},${100 + R() * 30},60,${0.08 + R() * 0.12})`; c.fillRect(R() * 300, R() * 400, 1 + R() * 2, 1); }
      c.fillStyle = 'rgba(90,60,30,0.25)'; for (let y = 60; y < 400; y += 26) c.fillRect(14, y, 272, 1); c.fillStyle = 'rgba(160,40,30,0.35)'; c.fillRect(40, 0, 1, 400);
      c.fillStyle = 'rgba(110,70,30,0.35)'; c.beginPath(); c.ellipse(240, 330, 36, 22, 0.4, 0, 7); c.fill(); c.fillStyle = 'rgba(228,220,196,1)'; c.beginPath(); c.ellipse(240, 330, 30, 17, 0.4, 0, 7); c.fill(); }   // mancha de taza
    const LINES = [['DAY 1', 'day1', 0, '#1a1a1a', 16], ['Fever. Headache.', 'fever', 1, '#1a1a1a', 12], ['DAY 2', 'day2', 0, '#1a1a1a', 16], ['Red eyes.', 'red', 1, '#7a1010', 12], ['Keeps staring at', 'stare', 1, '#1a1a1a', 12], ['the wall.', 'stare', 1, '#1a1a1a', 12], ['DAY 3', 'day3', 0, '#1a1a1a', 16], ['? ? ?', 'know', 1, '#8a0a0a', 16]];
    out['07_diary'] = { scene, camera, update() {}, overlay(lt, dt, a, o) {
      const cx = o.tctx, t = T['07_diary'] + lt; cx.fillStyle = '#03050a'; cx.fillRect(0, 0, LW, LH);
      bevel(cx, 14, 22, 332, 22); px(cx, 18, 26, '#04060e', 324, 14); bitText(cx, 'FILE', 40, 33, 1, '#9cf09c', { outline: null }); bitText(cx, 'SYMPTOM DIARY', 250, 33, 1, '#c8ccd8', { outline: null });
      cx.save(); cx.translate(30, 62); cx.rotate(-0.012); cx.drawImage(paper, 0, 0); cx.font = 'bold 13px "Courier New", monospace'; cx.textBaseline = 'middle'; cx.textAlign = 'left';
      cx.fillStyle = '#2a2a2a'; cx.fillText('SURVIVOR NOTES', 52, 30);
      let y = 70, prevKey = null, carry = 0;
      for (const [s, w, ind, col, size] of LINES) {
        const t0 = (w === prevKey ? carry : W[w] - 0.05), n = Math.max(0, Math.min(s.length, Math.floor((t - t0) * 22)));
        carry = t0 + s.length / 22; prevKey = w;
        if (n > 0) { cx.font = `bold ${size}px "Courier New", monospace`; cx.fillStyle = col; cx.fillText(s.slice(0, n), 52 + ind * 14, y); }
        y += size > 13 ? 30 : 24; if (ind === 1 && LINES[LINES.indexOf(LINES.find((l) => l[0] === s)) + 1]?.[2] === 0) y += 6;
      }
      cx.restore();
      { const k = ease(W.world7 - 0.1, W.world7 + 0.12, t); if (k > 0) { cx.save(); cx.translate(266, 104); cx.rotate(0.18); cx.globalAlpha = k; cx.strokeStyle = '#c01818'; cx.lineWidth = 2; cx.strokeRect(-52, -16, 104, 32); bitText(cx, 'THIS WORLD', 0, -5, 1, '#c01818', { outline: null }); bitText(cx, 'X-VIRUS', 0, 7, 1, '#c01818', { outline: null }); cx.restore(); cx.globalAlpha = 1; } }
      { const k = ease(W.fast - 0.1, W.fast + 0.12, t); if (k > 0) { cx.globalAlpha = k; bitText(cx, 'FAST: 3 DAYS', LW / 2, 494, 2, '#ff7b2e', { outline: '#000' }); cx.globalAlpha = 1; } }
    } };
  }
  return out;
}
