// sets/reuse.js — LARGO 2: reutiliza planos ya construidos de la Parte 1 (sets/hall.js, rooms.js, ext.js, radio.js...)
// sin tocar esos modulos. Se cargan con un ctx de la PARTE 1 (p1_timeline.json + p1_T.json), asi sus anclas a palabras
// siguen funcionando; cada plano de la Parte 2 reproduce un tramo del plano de la Parte 1: lt1 = off + lt * speed.
// La boca de Ava sigue la voz de la Parte 2 (proxy de TL.mouth desplazado). Los textos/etiquetas de la Parte 1 NO se dibujan
// (no se llama a su overlay) salvo que el mapa diga overlay: true; la Parte 2 pone los suyos (o.ov).
import { reText as bitText } from '../refont.js';

// id parte 2 -> [id parte 1, desde (s dentro del plano p1), velocidad, opciones]
const MAP = {
  '01_knock': ['52_knock', 0.0, 1],
  '01b_choice': ['57_vickers', 0.0, 0.8, { dry: true }],
  '01c_saidno': ['17_glass', 0.0, 0.7],
  '03_think_dontlook': ['54_cop', 0.6, 0.6],
  '02_floor': ['48_boots', 0.0, 0.7],
  '04_dawn_knock': ['54_cop', 0.0, 1, { day: 'dawn' }],
  '06_whatsleft': ['57_vickers', 0.3, 0.8, { day: 'dawn' }],
  '07_lit_lobby': ['67_final_glass', 0.0, 0.8, { day: 'day' }],
  '08_lighthouse': ['68_final_ext', 0.0, 0.8, { ov: 'lighthouse', day: 'dawn' }],
  '09_count80': ['58b_fifty', 0.0, 0.8, { day: 'day', ov: 'count80' }],
  '11_cross': ['58d_cross', 0.0, 1, { day: 'day' }],
  '16_dark': ['44_power', 0.0, 1, { day: 'day' }],
  '17_turnaway': ['28_dinner_bell', 0.6, 0.8, { day: 'day', noRings: true, horde: true }],
  '19_radio_room': ['63_radio_room', 0.5, 0.8],
  '20_stop': ['65_vickers_tag', 0.0, 0.6],
  '21_silent': ['47_rule_three', 0.0, 0.7, { day: 'day' }],
  '27_ribbon_hall': ['58c_inside', 0.0, 1, { day: 'day' }],
  '28_hallway': ['58e_breathing', 0.0, 1, { day: 'day' }],
  '41_breakroom': ['36b_breakroom', 0.0, 1, { day: 'day' }],
  '47_lockers': ['25b_lockers', 0.0, 1, { day: 'day' }],
  '50_loading_door': ['33_door_basement', 0.0, 1, { overlay: true }],
  '91_sunset': ['21_lights_off', 0.6, 0.8, { day: 'dusk' }],
  '92_lights_on': ['59_lights_on', 0.0, 1, { day: 'dusk' }],
  '95_stopped': ['17_glass', 0.0, 0.6, { day: 'dusk' }],
};

export async function shots(ctx) {
  const { L } = ctx, { THREE } = L;
  const TL1 = await (await fetch('p1_timeline.json')).json(), T1 = await (await fetch('p1_T.json')).json();
  const WBY = {}; for (const w of TL1.words) { const id = TL1.takes[w[3] - 1]; (WBY[id] = WBY[id] || []).push(w); }
  const normW = (s) => String(s).toLowerCase().replace(/[^a-z0-9']/g, '');
  const at1 = (take, k = 0, which = 1) => {
    const ws = WBY[take]; if (!ws) return 0;
    let w; if (typeof k === 'number') w = ws[k < 0 ? ws.length + k : k]; else w = ws.find((x) => normW(x[4]).startsWith(normW(k)) || normW(x[0]).startsWith(normW(k)));
    if (!w) w = ws[0]; return which === 1 ? w[1] : w[2];
  };
  const SHIFT = { v: 0 };   // s: t2 - t1 del plano que se esta pintando
  const mouth2 = ctx.TL.mouth;
  const mouthProxy = new Proxy({}, { get(_, k) { if (k === 'length') return 1e9; const i = Number(k); if (!Number.isFinite(i)) return undefined; return mouth2[i + Math.round(SHIFT.v * 15)] ?? '-'; } });
  const TLp1 = { ...TL1, mouth: mouthProxy };
  const ctx1 = { ...ctx, P2: true, TL: TLp1, T: T1, at: at1, endOf: (take, k = -1) => at1(take, k, 2), words: (take) => WBY[take] || [], CUTS: Object.entries(T1) };
  const P1SET = Object.fromEntries((await (await fetch('p1_shots.json')).json()).map((x) => [x[0], x[1]]));
  const need = [...new Set(Object.values(MAP).map((m) => P1SET[m[0]]))];
  const built = {};
  for (const set of need) { const m = await import(`./${set}.js`); Object.assign(built, await m.shots(ctx1)); }
  // MODO DIA (v2): las escenas de la Parte 1 son de noche con lluvia. En los planos de manana/dia/atardecer: sin lluvia (lineas y
  // fx), cielo/fondo y niebla de dia, luz de sol calida por las ventanas (direccional + relleno). Se aplica y se deshace por cuadro.
  const DAY = { dawn: [0xe8b890, 0xffd0a0, 1.5, 0.7], day: [0xc8d8e8, 0xfff0d8, 1.9, 0.9], dusk: [0x1e3a8a, 0x7aa0f0, 1.1, 0.5] };   // atardecer frio azul-violeta
  const dayState = new Map();
  const setDay = (scene, mode) => {
    let st = dayState.get(scene);
    if (!st) { st = { bg: scene.background && scene.background.clone(), fog: scene.fog && scene.fog.color.clone(), rain: [], sun: new THREE.DirectionalLight(0xffffff, 0), amb: new THREE.AmbientLight(0xffffff, 0) };
      scene.traverse((o) => { if (o.isLineSegments && o.material && o.material.color && o.material.color.getHex() === 0x9ab0d4) st.rain.push(o); if (o.isMesh && o.material && o.material.transparent && o.material.map && [0xd8e6f8, 0xc8d8ee].includes(o.material.color.getHex())) st.rain.push(o); if (o.isMesh && o.material && o.material.blending === THREE.AdditiveBlending && !(o.geometry && o.geometry.type === 'RingGeometry')) st.rain.push(o); });   // v3: + charcos de luz aditivos de la noche (parpadeaban de dia)   // + gotas/regueros del vidrio
      st.sun.position.set(-6, 9, -10); scene.add(st.sun, st.amb); dayState.set(scene, st); }
    const d = DAY[mode];
    if (scene.background && st.bg) scene.background.copy(d ? new THREE.Color(d[0]) : st.bg);
    if (scene.fog && st.fog) scene.fog.color.copy(d ? new THREE.Color(d[0]) : st.fog);
    st.rain.forEach((o) => { o.visible = !d; });
    st.sun.color.set(d ? d[1] : 0xffffff); st.sun.intensity = d ? d[2] : 0; st.amb.color.set(d ? d[1] : 0xffffff); st.amb.intensity = d ? d[3] : 0;
  };
  const out = {};
  for (const [id, [p1, off, speed, opt = {}]] of Object.entries(MAP)) {
    const s1 = built[p1]; if (!s1) { console.warn('reuse: falta ' + p1); continue; }
    const t1start = T1[p1], dawn = false;
    const w = { scene: s1.scene, camera: s1.camera, gamma: s1.gamma, reuseOf: p1, fx: opt.day ? undefined : s1.fx,
      update(lt, t) { const lt1 = off + lt * speed; SHIFT.v = t - (t1start + lt1); s1.update(lt1, t1start + lt1); w.camera = s1.camera; w.scene = s1.scene; setDay(s1.scene, opt.day); if (opt.dry) s1.scene.traverse((o) => { if (o.isMesh && o.material && o.material.transparent && o.material.map && [0xd8e6f8, 0xc8d8ee].includes(o.material.color.getHex())) o.visible = false; }); if (opt.horde && s1.scene.userData.hordeAway) s1.scene.userData.hordeAway(lt1); if (opt.noRings) s1.scene.traverse((o) => { if (o.isMesh && o.geometry && o.geometry.type === 'RingGeometry') o.visible = false; }); },
      overlay(lt, dt, a, o) {
        const lt1 = off + lt * speed;
        if (opt.overlay && s1.overlay) s1.overlay(lt1, dt, a, o);
        const c = o.tctx, t = w.t0 + lt;
        if (opt.day === 'dusk') { c.fillStyle = 'rgba(30,70,190,0.16)'; c.fillRect(0, 0, L.LW, L.LH); } if (opt.day === 'dawn') { c.fillStyle = 'rgba(255,190,130,0.10)'; c.fillRect(0, 0, L.LW, L.LH); }
        if (opt.ov === 'count80') { const k = L.smooth((t - ctx.at('l4', 'eighty') + 0.6) / 0.8), n = Math.round(50 + 30 * k);
          c.fillStyle = 'rgba(4,8,16,0.86)'; c.fillRect(500, 22, 120, 46); c.strokeStyle = '#ff4030'; c.strokeRect(500.5, 22.5, 119, 45); bitText(c, String(n), 560, 46, 3, '#ff4030', { outline: '#000' }); bitText(c, 'OUTSIDE', 560, 64, 1, '#e8e8e8', { outline: null }); }
        if (opt.ov === 'lighthouse') { const k = L.smooth((t - ctx.at('l2', 'lighthouse') + 0.1) / 0.3); if (k > 0) { c.globalAlpha = k; c.fillStyle = 'rgba(4,8,16,0.86)'; c.fillRect(250, 40, 140, 26); c.strokeStyle = '#ffd23f'; c.strokeRect(250.5, 40.5, 139, 25); bitText(c, 'LIGHTHOUSE', 320, 53, 2, '#ffd23f', { outline: null }); c.globalAlpha = 1; } }
      } };
    out[id] = w;
  }
  return out;
}
