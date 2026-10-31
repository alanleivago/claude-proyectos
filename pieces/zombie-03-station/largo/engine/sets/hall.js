// sets/hall.js â€” LARGO 16:9: the police-station LOBBY (never "RPD"/"Raccoon") and its FRONT GLASS DOORS onto a rainy street.
// Shots (shots.json, set "hall"): 02_gate 03_safe 04_isnt 06_hook_door 09_desk 10_lock 11_desk_radio 12_broadcast 13_ava_seven 14_clock
// 15_again 16_remember 17_glass 18_glass_break 19_lobby_never 20_benches 21_lights_off 22_count 37_k9_door 44_power 47_rule_three 48_boots
// 51_radio_hall 52_knock 53_ribbon_stares 54_cop 55_badge_rule 57_vickers 58_twenty 59_lights_on 60_fudge 67_final_glass; round 2: 10b_okayest
// 43b_phones 43d_text 48p_tired 48r_guard 48s_nose 58b_fifty 58c_inside 58d_cross 58e_breathing 58f_faster 67b_hallway. Contract: ../SETS.md.
// World: front glass wall at z=0 (lobby +z, street -z), lobby x in [-5,5], z in [0,13], ceiling 5 m. Back wall: barred gate (x -4.4..-2.4),
// inner double doors (x 2.4..4.4) with the emergency light above; K-9 door on the left wall (z 10.4..11.4); counter at z=9.2 with the
// police radio, coffee mug, lamp; wall clock under the CITY POLICE sign. Every update() sets the whole state. Only hit objects shake.

// ---------- anchors: every time comes from a WORD of the voice (timeline is provisional) ----------
const normW = (s) => String(s).toLowerCase().replace(/[^a-z0-9']/g, '');
const HALL_IDS = ['02_gate', '03_safe', '04_isnt', '06_hook_door', '09_desk', '10_lock', '11_desk_radio', '12_broadcast', '13_ava_seven', '14_clock',
  '15_again', '16_remember', '17_glass', '18_glass_break', '19_lobby_never', '20_benches', '21_lights_off', '22_count', '37_k9_door', '44_power',
  '47_rule_three', '48_boots', '51_radio_hall', '52_knock', '53_ribbon_stares', '54_cop', '55_badge_rule', '57_vickers', '58_twenty', '59_lights_on',
  '60_fudge', '67_final_glass', '10b_okayest', '43b_phones', '43d_text', '48p_tired', '48r_guard', '48s_nose', '58b_fifty', '58c_inside', '58d_cross',
  '58e_breathing', '58f_faster', '67b_hallway'];
function anchors(ctx) {
  const { at, endOf, words, T, CUTS } = ctx;
  const last = (take, w) => { const ws = words(take); for (let i = ws.length - 1; i >= 0; i--) if (normW(ws[i][4]).startsWith(normW(w)) || normW(ws[i][0]).startsWith(normW(w))) return ws[i][1]; throw new Error(`hall: ${w} in ${take}`); };
  const all = (take, w) => words(take).filter((x) => normW(x[4]).startsWith(normW(w)) || normW(x[0]).startsWith(normW(w))).map((x) => x[1]);
  const endT = (id) => { const i = CUTS.findIndex((c) => c[0] === id); return i >= 0 && CUTS[i + 1] ? CUTS[i + 1][1] : T[id] + 5; };
  const tri = (t0, dt = 0.2, n = 3) => Array.from({ length: n }, (_, i) => +(t0 + i * dt).toFixed(3));
  const inShot = (id, list) => list.filter((t) => t >= T[id] && t < endT(id) - 0.05);
  const A = { endT, T };
  // 02 gate: chain grabbed, padlock snaps on "locked", she turns and crosses the frame
  A.lock02 = at('h2', 'locked'); A.chain02 = A.lock02 - 0.37; A.walk02 = A.lock02 + 0.95;
  A.steps02 = []; for (let t = A.walk02 + 0.25; t < endT('02_gate') - 0.1; t += 0.5) A.steps02.push(+t.toFixed(3));
  A.smug03 = at('h3', 'safest'); A.wink03 = at('h3', 'town');
  { const a = at('h4', 0), b = at('h4', 1); A.hits04 = inShot('04_isnt', [a - 0.02, a + 0.3, b + 0.02, b + 0.32, b + 0.6]); }
  A.raise06 = [at('h6', 'open'), at('h6', 'door')];
  A.warm09 = at('a3', 'warm'); A.coffee09 = at('a3', 'coffee');
  A.walk10 = [T['10_lock'] + 0.3, at('a5', 0) - 0.4]; A.lock10 = at('a5', 'locked'); A.click10 = at('a5', 'click');
  A.steps10 = []; for (let t = A.walk10[0] + 0.25; t < A.walk10[1]; t += 0.5) A.steps10.push(+t.toFixed(3));
  A.radio11 = at('a6', 'radio');
  A.open12 = T['12_broadcast'] + 0.12; A.seven12 = at('r1', 'seven'); A.rules12 = [at('r1', 'lights'), at('r1', 'gate'), at('r1', 'open')];
  A.you13 = at('r2', 'you'); A.seven13 = last('r2', 'seven');
  A.twenty14 = at('r4', 'twenty'); A.later14 = endOf('r4', -1);
  A.plays15 = at('r5', 'plays'); A.same15 = all('r5', 'same');
  A.glass17 = last('g2', 'glass'); A.temp17 = at('g3', 'tempered');
  A.goes18 = at('g4', 'goes'); A.once18 = last('g4', 'once'); A.thou18 = at('g4', 'thousands'); A.warn18 = at('g4', 'warning');
  A.never19 = at('g6', 'never'); A.rule19 = at('g5', 'rule');
  A.benches20 = at('g7', 'benches'); A.doors20 = at('g7', 'doors');
  A.scrape20 = []; for (let t = T['20_benches'] + 0.35; t < A.doors20 - 0.2; t += 0.55) A.scrape20.push(+t.toFixed(3));
  A.kill21 = at('g7', 'kill'); A.off21 = Array.from({ length: 6 }, (_, i) => +(A.kill21 + 0.15 + i * 0.22).toFixed(3)); A.lamp21 = at('g7', 'see');
  A.three22 = at('g9', 'three'); A.stand22 = at('g10', 'standing');
  { const s = at('k1', 'scratching'), k = at('k1', 'k'); A.scr37 = [...tri(s, 0.13, 5), ...tri(k + 0.45, 0.13, 4), ...tri(at('k2', 'open') + 0.1, 0.13, 5)].filter((t) => t < endT('37_k9_door') - 0.05); }
  A.power44 = at('p1', 'power'); A.dies44 = at('p1', 'dies');
  A.lights47 = at('p7', 'lights');
  A.plays51 = at('s6', 'plays'); A.same51 = at('s7', 'same');
  { const s = A.same51; A.d51 = { o0: s - 1.15, push1: s - 0.8, open1: s - 0.25, w0: s - 0.4, w1: s + 0.3 }; }
  A.knock52 = inShot('52_knock', [...tri(at('n1', 'knocks')), ...tri(endOf('n1', -1) + 0.1)]);
  A.stands53 = at('n2', 'stands'); A.stares53 = at('n3', 'stares');
  A.knock54 = inShot('54_cop', [...tri(endOf('n4', 'block') + 0.06), ...tri(endOf('n4', -1) + 0.06)]);
  A.n55 = { uniform: at('n5', 'uniform'), cap: at('n5', 'cap'), badge: at('n5', 'badge'), rule: at('n5', 'rule'), pass: at('n7', 'password') };
  A.flash57 = at('n10', 'officer'); A.vick57 = at('n10', 'vickers');
  A.three58 = at('n12', 'three'); A.eight58 = at('n12', 'eight'); A.twenty58 = at('n12', 'twenty');
  { const k = []; for (let t = T['58_twenty'] + 0.35; t < endT('58_twenty') - 0.6; t += 1.45) k.push(...tri(t)); A.knock58 = inShot('58_twenty', k); }
  A.light59 = at('l1', 'light'); A.rows59 = Array.from({ length: 6 }, (_, i) => +(A.light59 + i * 0.16).toFixed(3));
  A.knock59 = inShot('59_lights_on', [...tri(at('l1', 'still')), ...tri(endOf('l1', 'knocking') + 0.05)]);
  A.fudge60 = at('l3', 'fudge');
  A.knock67 = inShot('67_final_glass', [...tri(at('f2', 'officer')), ...tri(at('f2', 'glass')), ...tri(at('f2', 'knocking') + 0.1)]);
  // ---------- round 2 ----------
  // walks: [t0, t1, clip speed] (global); 'walk' seg starts at t0 from clip time 0 -> steps from the clip phase
  A.walks = { '02_gate': [[A.walk02, endT('02_gate'), 1]], '10_lock': [[A.walk10[0], A.walk10[1], 1]] };
  { const T0 = T['10b_okayest'], lk = at('a5b', 'locked'), cl = at('a5b', 'closet');
    A.b10 = { rA: [T0 + 0.06, T0 + 0.3], wAB: [T0 + 0.45, T0 + 1.18], rB: [lk - 0.22, lk], lk, wBC: [lk + 0.15, cl - 0.02], closet: cl, mug: at('a5b', 'mug') - 0.12, ok: at('a5b', 'okayest') };
    A.walks['10b_okayest'] = [[...A.b10.wAB, 1.3], [...A.b10.wBC, 0.8]]; }
  { const ph = at('ph1', 'phones'); A.ph = { lift: ph + 0.05, ear: ph + 0.4, dead: at('ph1', 'dead'), cell: at('ph1', 'cell'), one: at('ph1', 'one') }; }
  { const sf = at('ph4', 'safe'); A.tx = { keys: [0, 1, 2, 3].map((i) => +(sf - 0.48 + i * 0.15).toFixed(3)), send: sf + 0.32, deliv: at('ph4', 'delivered') }; A.tx.cut = A.tx.deliv + 0.42; }
  A.z1 = { twenty: at('z1', 'twenty'), yawn: T['48p_tired'] + 0.25 };
  A.zg = { door: at('z4', 'doorway'), two: at('z5', 'two'), feels: at('z5', 'feels') }; A.zg.cB = A.zg.door - 0.15; A.zg.cC = A.zg.two - 0.25; A.zg.cA = A.zg.feels - 0.05;
  A.nose = at('z6', 'nose'); A.wake = A.nose + 0.35;
  A.fifty = at('x1', 'fifty'); A.cnt58b = at('x1', 'counter');
  { const k = []; for (let t = T['58b_fifty'] + 0.2; t < endT('58b_fifty') - 0.3; t += 0.95) k.push(...tri(t)); A.knock58b = inShot('58b_fifty', k); }
  A.turns = at('x2', 'turns'); A.growls = at('x2', 'growls');
  A.walks['51_radio_hall'] = [[A.d51.w0, A.d51.w1, 1.0]];
  A.cross = { t0: T['58d_cross'], t1: endT('58d_cross'), cut: T['58d_cross'] + 1.7 }; A.walks['58d_cross'] = [[A.cross.t0, A.cross.t1, 0.9]];
  A.breath = at('x4', 'breathing'); A.breaths = []; for (let t = T['58e_breathing'] + 0.35; t < endT('58e_breathing') - 0.3; t += 1.35) A.breaths.push(+t.toFixed(3));
  { const f = at('x5', 'faster'), k = []; let t = T['58f_faster'] + 0.1, g = 0.52;
    while (t < endT('58f_faster') - 0.08) { k.push(+t.toFixed(3)); g = t < f - 0.6 ? 0.52 : Math.max(0.17, g * 0.8); t += g; }
    A.fast = f; A.knock58f = k; A.walks['58f_faster'] = [[T['58f_faster'], endT('58f_faster'), 1.0]]; }
  A.growl67 = at('f2b', 'growling'); A.radio67 = at('f2b', 'radio');
  A.rule47 = at('p6', 'rule');
  A.n55.writing = at('n6', 'writing'); A.n55.a = at('n7', 0);
  // foot contacts of the 'walk' clip (1.00 s): left heel at phase 0.09, right at 0.59 (measured on Foot.L/R heights)
  A.steps = (id) => { const o = []; for (const [t0, t1, sp] of A.walks[id] || []) for (let k = 0; ; k++) { const t = t0 + (k * 0.5 + 0.09) / sp; if (t >= t1) break; o.push([+t.toFixed(3), sp]); } return o; };
  return A;
}

/** every visible action's SFX on its frame: [[t_global, name], ...] */
export function sfx(ctx) {
  const A = anchors(ctx), T = ctx.T, E = [];
  const add = (t, n) => { if (Number.isFinite(t)) E.push([+t.toFixed(3), n]); };
  for (const id of Object.keys(A.walks)) A.steps(id).forEach(([t, sp]) => add(t, sp > 1.8 ? 'step_run' : 'step_walk'));
  add(A.chain02, 'chain_rattle'); add(A.lock02 - 0.28, 'key_turn'); add(A.lock02, 'padlock_click');
  A.hits04.forEach((t) => add(t, 'glass_hit'));
  add(A.raise06[1] - 0.25, 'cloth_rustle');
  add(A.lock10, 'chain_rattle'); add(A.click10 - 0.33, 'key_turn'); add(A.click10, 'padlock_click');
  add(A.radio11, 'radio_static_on');
  add(A.open12, 'file_open'); add(A.seven12, 'file_line'); A.rules12.forEach((t) => add(t, 'file_line'));
  for (let t = T['14_clock'] + 0.5; t < A.twenty14; t += 1) add(t, 'clock_tick');
  for (let i = 0; i < 20; i++) add(A.twenty14 + (A.later14 - A.twenty14) * i / 20, 'clock_tick_fast');
  add(A.plays15, 'radio_static_on');
  add(A.goes18, 'glass_hit'); add(A.once18, 'glass_shatter'); add(A.once18 + 0.45, 'glass_debris_fall');
  add(A.never19, 'stamp_x');
  A.scrape20.forEach((t) => add(t, 'bench_scrape')); add(A.doors20, 'bench_thud');
  A.off21.forEach((t) => add(t, 'light_clack_off')); add(A.off21[0], 'fluorescent_hum_stop'); add(A.lamp21, 'lamp_click_off');
  add(A.three22, 'counter_blip');
  A.scr37.forEach((t) => add(t, 'door_scratch'));
  add(A.power44, 'light_buzz_flicker'); add(A.dies44, 'light_clack_off'); add(A.dies44 + 0.02, 'power_down_hum');
  add(T['48_boots'] + 0.3, 'dog_sleep_breath');
  add(A.plays51, 'radio_static_on'); add(A.d51.o0 - 0.12, 'door_handle_push'); add(A.d51.o0, 'door_open'); add(A.d51.push1 + 0.05, 'door_creak');
  A.knock52.forEach((t) => add(t, 'glass_knock'));
  add(A.stands53, 'dog_tags_jingle'); add(A.stands53 + 0.3, 'dog_paws');
  A.knock54.forEach((t) => add(t, 'glass_knock'));
  add(A.flash57, 'thunder');
  A.knock58.forEach((t) => add(t, 'glass_knock'));
  add(A.three58, 'counter_blip'); add(A.eight58, 'counter_blip'); add(A.twenty58, 'counter_blip');
  add(A.eight58 - 0.7, 'zombie_groan'); add(A.twenty58 - 0.9, 'zombie_groan_crowd');
  A.knock59.forEach((t) => add(t, 'glass_knock')); A.rows59.forEach((t) => add(t, 'light_clack')); add(A.light59 + 0.05, 'fluorescent_hum_start');
  A.knock67.forEach((t) => add(t, 'glass_knock'));
  // ---------- round 2 ----------
  { const b = A.b10; [...b.rA, ...b.rB].forEach((t) => add(t, 'door_handle_rattle')); add(b.closet - 0.14, 'door_handle_pull'); add(b.closet, 'closet_door_creak'); add(b.mug, 'cut_whoosh_soft'); add(b.ok, 'label_pop'); }
  add(A.ph.lift, 'phone_pickup'); add(A.ph.ear, 'dial_tone_dead'); add(A.ph.cell - 0.12, 'phone_hangup'); add(A.ph.cell + 0.1, 'cloth_rustle'); add(A.ph.one, 'phone_signal_blip');
  A.tx.keys.forEach((t) => add(t, 'phone_type')); add(A.tx.send, 'sms_sent'); add(A.tx.deliv, 'sms_delivered');
  add(A.z1.yawn, 'yawn'); add(A.z1.twenty, 'label_pop');
  for (let t = T['48r_guard'] + 0.4; t < A.zg.two - 0.1; t += 1) add(t, 'clock_tick');
  for (let i = 0; i < 12; i++) add(A.zg.two + i * 0.045, 'clock_tick_fast');
  for (let t = A.zg.two + 0.7; t < A.endT('48r_guard'); t += 1) add(t, 'clock_tick');
  for (let t = T['48r_guard'] + 0.8; t < A.endT('48r_guard'); t += 2.4) add(t, 'dog_breath');
  add(A.nose - 0.35, 'dog_sniff'); add(A.nose, 'dog_sniff'); add(A.wake, 'cloth_rustle');
  A.knock58b.forEach((t) => add(t, 'glass_knock')); add(A.fifty, 'counter_blip'); add(A.fifty - 0.9, 'zombie_groan_crowd');
  add(A.turns, 'dog_paws'); add(A.turns + 0.05, 'dog_tags_jingle'); add(A.growls, 'dog_growl');
  A.breaths.forEach((t) => add(t, 'creature_breath_far'));
  A.knock58f.forEach((t) => add(t, t > A.fast - 0.6 ? 'glass_knock_fast' : 'glass_knock'));
  add(A.growl67, 'dog_growl'); add(A.radio67, 'radio_static_on');
  add(A.n55.writing, 'pencil_scribble');
  return E.sort((a, b) => a[0] - b[0]);
}
void HALL_IDS;

import { reText, reWidth } from '../refont.js';

export async function shots(ctx) {
  const { L, TL } = ctx; const A = anchors(ctx);
  const { THREE, LW, LH } = L;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const px = (c, x, y, col, w = 1, h = 1) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const rgb = (r, g, b) => `rgb(${Math.max(0, Math.min(255, r | 0))},${Math.max(0, Math.min(255, g | 0))},${Math.max(0, Math.min(255, b | 0))})`;
  const B = (w, h, d, m, x, y, z, p) => L.box(w, h, d, m, x, y, z, p);
  const cyl = (r1, r2, h, n, m, x, y, z, p) => L.mesh(new THREE.CylinderGeometry(r1, r2, h, n), m, x, y, z, p);
  const mouthAt = (t, base) => { const c = TL.mouth[Math.floor(t * 15 + 1e-6)]; return c === 'A' ? 'talkA' : c === 'O' ? 'talkO' : base; };
  const lam = (t, col = 0xffffff, extra) => L.lam(t, col, extra);
  const DS = THREE.DoubleSide;

  const BG = 0x121826;
  const scene = new THREE.Scene(); scene.background = new THREE.Color(BG); scene.fog = new THREE.Fog(BG, 9, 30);

  // ---------- lights (OFF: moon/streetlight blue through the glass + one warm desk lamp; ON: fluorescent rows) ----------
  const hemi = new THREE.HemisphereLight(0x7088c0, 0x2a2830, 1.15); scene.add(hemi);
  const moon = new THREE.DirectionalLight(0x9ab8ff, 1.0); moon.position.set(-1.5, 5, -8); moon.target.position.set(0.5, 0, 6); scene.add(moon, moon.target);
  const fill = new THREE.DirectionalLight(0x8aa0d0, 0.45); fill.position.set(0.5, 2.5, 6); fill.target.position.set(0, 1.2, -2); scene.add(fill, fill.target);
  const street = new THREE.PointLight(0xc8dcff, 9, 10, 1); street.position.set(1.6, 3.4, -2.8); scene.add(street);
  const flash = new THREE.DirectionalLight(0xe4ecff, 0); flash.position.set(0.6, 2.2, 3); flash.target.position.set(0.3, 1.5, -0.4); scene.add(flash, flash.target);
  const top = new THREE.PointLight(0xffffff, 0, 4, 1); scene.add(top);

  // ---------- textures ----------
  const tFloor = L.cvs(64, 64, (c, w, h) => {   // worn marble checker (2x2 tiles), veins, grout, grime
    const r = L.rng(301);
    for (let ty = 0; ty < 2; ty++) for (let tx = 0; tx < 2; tx++) {
      const dark = (tx + ty) % 2 === 1;
      for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {
        const n = r() * 14 - 7, v = Math.sin((x + y * 0.6) * 0.35 + tx * 3) * 6;
        px(c, tx * 32 + x, ty * 32 + y, dark ? rgb(54 + n + v * 0.4, 56 + n + v * 0.4, 64 + n) : rgb(196 + n + v, 188 + n + v, 166 + n));
      }
      c.strokeStyle = dark ? 'rgba(130,130,140,0.45)' : 'rgba(120,110,90,0.45)'; c.lineWidth = 1;
      c.beginPath(); let x = tx * 32 + r() * 32, y = ty * 32; c.moveTo(x, y); for (let s = 0; s < 5; s++) { x += r() * 10 - 5; y += 6 + r() * 3; c.lineTo(x, y); } c.stroke();
    }
    px(c, 0, 0, '#2a2622', w, 1); px(c, 0, 32, '#2a2622', w, 1); px(c, 0, 0, '#2a2622', 1, h); px(c, 32, 0, '#2a2622', 1, h);
    for (let k = 0; k < 40; k++) px(c, r() * w | 0, r() * h | 0, 'rgba(40,30,20,0.35)', 1 + (r() * 3 | 0), 1);
  });
  const tWall = L.cvs(64, 128, (c, w, h) => {   // upper: beige ashlar plaster; lower 22 %: dark wood wainscot with panels + chair rail
    const r = L.rng(302), WY = Math.round(h * 0.78);
    for (let y = 0; y < WY; y++) for (let x = 0; x < w; x++) { const n = r() * 12 - 6; px(c, x, y, rgb(176 + n, 160 + n, 128 + n)); }
    for (let y = 0; y < WY; y += 16) { px(c, 0, y, '#8e7e60', w, 1); const off = (y / 16) % 2 ? 0 : 32; px(c, off, y, '#8e7e60', 1, 16); px(c, (off + 32) % 64 === 0 ? 63 : off + 31, y, 'rgba(0,0,0,0)', 1, 1); }
    for (let k = 0; k < 8; k++) { const x = r() * w | 0, y0 = r() * WY | 0; for (let y = y0; y < Math.min(WY, y0 + 12 + r() * 20); y++) if (r() < 0.8) px(c, x, y, 'rgba(90,70,40,0.25)'); }   // water stains
    for (let y = WY; y < h; y++) for (let x = 0; x < w; x++) { const n = r() * 10 - 5 + (Math.sin(y * 0.9 + x * 0.05) > 0.8 ? -10 : 0); px(c, x, y, rgb(92 + n, 58 + n * 0.7, 34 + n * 0.4)); }
    px(c, 0, WY, '#c8a878', w, 2); px(c, 0, WY + 2, '#3a2414', w, 1);
    for (const x0 of [3, 35]) { c.strokeStyle = '#4a2c16'; c.strokeRect(x0 + 0.5, WY + 6.5, 25, h - WY - 12); c.strokeStyle = '#7a5434'; c.strokeRect(x0 + 1.5, WY + 7.5, 23, h - WY - 14); }
    px(c, 0, h - 3, '#2a1a0c', w, 3);
  });
  const tCeil = L.cvs(32, 32, (c, w, h) => { const r = L.rng(303); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const e = x < 2 || y < 2; const n = r() * 8; px(c, x, y, e ? rgb(60 + n, 56 + n, 50 + n) : rgb(120 + n, 114 + n, 100 + n)); } px(c, 3, 3, '#8a8474', 26, 1); px(c, 3, 3, '#8a8474', 1, 26); });
  const tWood = L.cvs(64, 32, (c, w, h) => {   // reception counter front: walnut raised panels
    const r = L.rng(304);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = r() * 10 - 5 + Math.sin(x * 0.5 + Math.sin(y * 0.3) * 2) * 6; px(c, x, y, rgb(104 + n, 62 + n * 0.7, 34 + n * 0.4)); }
    for (const x0 of [2, 34]) { c.strokeStyle = '#3a200e'; c.strokeRect(x0 + 0.5, 4.5, 27, 23); c.strokeStyle = '#a07048'; c.strokeRect(x0 + 1.5, 5.5, 25, 21); }
    px(c, 0, 0, '#c89868', w, 2); px(c, 0, h - 2, '#24140a', w, 2);
  });
  const tTop = L.cvs(32, 16, (c, w, h) => { const r = L.rng(305); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = r() * 10 + Math.sin(x * 0.7) * 5; px(c, x, y, rgb(132 + n, 86 + n, 50 + n)); } });
  const tStone = L.cvs(32, 64, (c, w, h) => { const r = L.rng(306); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = r() * 16 - 8; px(c, x, y, rgb(170 + n, 162 + n, 146 + n)); } for (let y = 0; y < h; y += 16) px(c, 0, y, '#7a7262', w, 1); px(c, 0, 0, '#7a7262', 1, h); for (let k = 0; k < 10; k++) px(c, r() * w | 0, r() * h | 0, '#8a8272', 2, 1); });
  const tIron = L.cvs(8, 32, (c, w, h) => { const r = L.rng(307); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = r(); px(c, x, y, n < 0.12 ? '#6a3a1e' : n < 0.3 ? '#3e3e42' : x < 2 ? '#5a5a60' : '#2c2c30'); } });
  const tMetal = L.cvs(8, 32, (c, w, h) => { const r = L.rng(308); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = r() * 10; px(c, x, y, x === 1 ? rgb(118 + n, 112 + n, 100 + n) : rgb(72 + n, 68 + n, 62 + n)); } });
  const tGlass = L.cvs(32, 64, (c, w, h) => {   // wet glass: blue-grey with vertical water streaks
    const r = L.rng(309);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const k = 0.8 + r() * 0.2 + (y / h) * 0.15; px(c, x, y, rgb(150 * k, 170 * k, 196 * k)); }
    for (let k = 0; k < 9; k++) { const x = r() * w | 0, y0 = r() * h | 0; for (let y = y0; y < y0 + 10 + r() * 30; y++) px(c, x + (y % 9 === 0 ? 1 : 0), y % h, 'rgb(220,232,250)'); }
  });
  const tDrops = L.cvs(32, 64, (c, w, h) => {   // rain drops + trails on the glass (alpha cut, scrolls down)
    c.clearRect(0, 0, w, h); const r = L.rng(310);
    for (let k = 0; k < 12; k++) { const x = r() * w | 0, y = r() * h | 0; px(c, x, y, '#e8f2ff', 1, 2); if (r() < 0.3) for (let t = 1; t < 4 + r() * 6; t++) px(c, x, (y - t * 2 + h) % h, 'rgba(200,220,245,1)', 1, 1); }
  });
  const tCork = L.cvs(64, 40, (c, w, h) => {   // notice board: cork, wood frame, pinned notices
    const r = L.rng(311);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = r() * 30 - 15; px(c, x, y, rgb(168 + n, 120 + n, 70 + n)); }
    c.strokeStyle = '#3a2210'; c.lineWidth = 2; c.strokeRect(1, 1, w - 2, h - 2);
    const paper = (x, y, pw, ph, col, title) => { px(c, x, y, col, pw, ph); for (let l = y + 5; l < y + ph - 2; l += 2) px(c, x + 2, l, 'rgba(40,40,50,0.55)', pw - 4 - (r() * 4 | 0), 1); px(c, x + pw / 2 | 0, y + 1, '#c02020', 1, 1); if (title) { c.fillStyle = '#202020'; c.font = 'bold 5px monospace'; c.textAlign = 'center'; c.textBaseline = 'top'; c.fillText(title, x + pw / 2, y + 1); } };
    paper(5, 5, 16, 20, '#e8e4d8', 'MISSING'); paper(24, 4, 14, 14, '#f0e090', 'CURFEW'); paper(41, 6, 18, 13, '#e0e0e0', 'NOTICE'); paper(26, 21, 12, 15, '#d8d0c0', ''); paper(43, 22, 15, 13, '#e8e4d8', 'WANTED');
    px(c, 8, 9, '#6a6a70', 9, 8);   // photo on MISSING
  });
  const tSign = L.cvs(128, 20, (c, w, h) => {   // "CITY POLICE": brass letters on a dark wood board
    c.fillStyle = '#2e1a0e'; c.fillRect(0, 0, w, h); c.fillStyle = '#4a2c18'; c.fillRect(2, 2, w - 4, h - 4);
    c.fillStyle = '#b08a3a'; c.fillRect(0, 0, w, 1); c.fillRect(0, h - 1, w, 1);
    c.font = 'bold 13px "Times New Roman", serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = '#1a0e06'; c.fillText('CITY  POLICE', w / 2 + 1, h / 2 + 2); c.fillStyle = '#e0b850'; c.fillText('CITY  POLICE', w / 2, h / 2 + 1);
    c.fillStyle = '#e0b850'; c.beginPath(); c.arc(8, h / 2, 4, 0, 7); c.fill(); c.beginPath(); c.arc(w - 8, h / 2, 4, 0, 7); c.fill();
  });
  const tFlagA = L.cvs(32, 20, (c, w, h) => { px(c, 0, 0, '#1e2e6a', w, h); c.fillStyle = '#d8b040'; c.beginPath(); c.arc(16, 10, 6, 0, 7); c.fill(); px(c, 13, 7, '#1e2e6a', 6, 6); px(c, 15, 5, '#d8b040', 2, 10); px(c, 0, 0, '#c0a030', w, 1); px(c, 0, h - 1, '#c0a030', w, 1); });
  const tFlagB = L.cvs(32, 20, (c, w, h) => { for (let y = 0; y < h; y++) px(c, 0, y, Math.floor(y / 2) % 2 ? '#e8e4dc' : '#b0242a', w, 1); px(c, 0, 0, '#22306a', 14, 10); for (let y = 1; y < 10; y += 2) for (let x = 1 + (y % 4 === 1 ? 0 : 1); x < 14; x += 3) px(c, x, y, '#e8e8e8'); });
  const tExt = L.cvs(16, 32, (c, w, h) => { for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) px(c, x, y, x === 3 ? '#f05040' : x > 12 ? '#801010' : '#c41e16'); px(c, 2, 12, '#e8e4d8', 12, 9); px(c, 4, 14, '#202020', 8, 1); px(c, 4, 16, '#202020', 6, 1); px(c, 4, 18, '#202020', 7, 1); });
  const tPot = L.cvs(16, 16, (c, w, h) => { const r = L.rng(312); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = r() * 20 - 10; px(c, x, y, y < 3 ? rgb(170 + n, 92 + n, 52 + n) : rgb(150 + n, 74 + n, 40 + n)); } px(c, 0, 3, '#6a3018', w, 1); });
  const leafTex = (col, dark) => L.cvs(32, 32, (c, w, h) => {
    c.clearRect(0, 0, w, h); const r = L.rng(313);
    for (let k = 0; k < 9; k++) { const cx = 4 + r() * 24, cy = 6 + r() * 22, a = r() * Math.PI;
      c.fillStyle = k % 3 ? col : dark; c.beginPath(); c.ellipse(cx, cy, 5, 2.2, a, 0, 7); c.fill(); c.fillStyle = dark; c.fillRect(cx | 0, cy | 0, 1, 1); }
    c.fillStyle = '#2a4a1a'; c.fillRect(15, 20, 2, 12);
  });
  const tSpray = L.cvs(32, 32, (c, w, h) => {   // First Aid Spray can: white, green band, red cross, text
    px(c, 0, 0, '#e8ecee', w, h); px(c, 0, 0, '#c8ccd0', w, 2); px(c, 0, 10, '#2a9a4a', w, 12); px(c, 0, 10, '#1a6a30', w, 1); px(c, 0, 21, '#1a6a30', w, 1);
    px(c, 4, 12, '#e8ecee', 6, 8); px(c, 6, 13, '#c82020', 2, 6); px(c, 4, 15, '#c82020', 6, 2);
    c.fillStyle = '#ffffff'; c.font = 'bold 5px monospace'; c.textAlign = 'left'; c.textBaseline = 'top'; c.fillText('FIRST', 12, 11); c.fillText('AID', 12, 16);
    px(c, 0, 26, '#9aa0a4', w, 1);
  });
  const tClock = L.cvs(64, 64, (c, w, h) => {   // wall clock face (hands are meshes)
    c.fillStyle = '#e8e2d0'; c.beginPath(); c.arc(32, 32, 31, 0, 7); c.fill();
    c.fillStyle = '#1a1a1a';
    for (let k = 0; k < 60; k++) { const a = k / 60 * Math.PI * 2, r0 = k % 5 ? 28 : 25; for (let rr = r0; rr < 30; rr++) c.fillRect(Math.round(32 + Math.sin(a) * rr), Math.round(32 - Math.cos(a) * rr), 1, 1); }
    c.font = 'bold 9px "Times New Roman", serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    for (let k = 1; k <= 12; k++) { const a = k / 12 * Math.PI * 2; c.fillText(String(k), 32 + Math.sin(a) * 20, 33 - Math.cos(a) * 20); }
    c.font = 'bold 4px monospace'; c.fillStyle = '#5a2a1a'; c.fillText('CITY POLICE', 32, 43);
  });
  const tAsph = L.cvs(64, 64, (c, w, h) => {   // wet asphalt: dark, puddles reflecting the streetlight
    const r = L.rng(314);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = r() * 14 - 7; px(c, x, y, rgb(40 + n, 44 + n, 54 + n)); }
    for (let k = 0; k < 6; k++) { const cx = r() * w, cy = r() * h, rx = 5 + r() * 9, ry = 2 + r() * 3; for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) if (x * x / (rx * rx) + y * y / (ry * ry) < 1) px(c, (cx + x + w) % w | 0, (cy + y + h) % h | 0, (x + y) % 4 === 0 ? '#7a8aa8' : '#4e5a72'); }
    px(c, 0, 30, '#9a9068', w, 2);   // faded lane line
  });
  const tSide = L.cvs(32, 32, (c, w, h) => { const r = L.rng(315); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = r() * 14 - 7; px(c, x, y, rgb(92 + n, 94 + n, 100 + n)); } px(c, 0, 0, '#4a4c54', w, 1); px(c, 0, 0, '#4a4c54', 1, h); });
  const tBuild = L.cvs(64, 64, (c, w, h) => {   // building across the street: dark brick, windows (two lit warm), shop awning
    const r = L.rng(316);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = r() * 10 - 5, m = (y % 4 === 0) || ((x + (Math.floor(y / 4) % 2) * 4) % 8 === 0); px(c, x, y, m ? rgb(30 + n, 26 + n, 28 + n) : rgb(58 + n, 40 + n, 40 + n)); }
    for (let wy = 6; wy < 44; wy += 12) for (let wx = 4; wx < 64; wx += 12) { const lit = (wx === 16 && wy === 18) || (wx === 52 && wy === 6); px(c, wx, wy, lit ? '#d8a050' : '#14182a', 7, 8); px(c, wx + 3, wy, '#2a2428', 1, 8); if (lit) px(c, wx + 1, wy + 1, '#f0c878', 2, 3); }
    px(c, 0, 50, '#1e3a2a', w, 4); for (let x = 0; x < w; x += 4) px(c, x, 54, '#e8e0d0', 2, 2); px(c, 0, 56, '#0e0e14', w, 8);
  });
  const tCarSide = L.cvs(64, 16, (c, w, h) => {   // classic black & white: white doors with POLICE, black fenders
    px(c, 0, 0, '#16161a', w, h); px(c, 14, 0, '#e4e4e0', 34, 11); px(c, 31, 0, '#9a9a96', 1, 11);
    c.fillStyle = '#16161a'; c.font = 'bold 6px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('POLICE', 31, 6);
    px(c, 0, 11, '#0a0a0c', w, 1); px(c, 0, 14, '#2a2a30', w, 2);
  });
  const tCarWin = L.cvs(32, 8, (c, w, h) => { px(c, 0, 0, '#e4e4e0', w, h); px(c, 2, 1, '#1a2234', 13, 7); px(c, 17, 1, '#1a2234', 13, 7); px(c, 3, 1, '#4a5a7a', 2, 2); px(c, 18, 1, '#4a5a7a', 2, 2); });
  const tCarFront = L.cvs(32, 16, (c, w, h) => { px(c, 0, 0, '#16161a', w, h); px(c, 2, 4, '#9a9a90', 6, 4); px(c, 24, 4, '#9a9a90', 6, 4); px(c, 10, 5, '#2a2a2e', 12, 6); for (let x = 11; x < 22; x += 2) px(c, x, 5, '#4a4a50', 1, 6); px(c, 0, 12, '#4a4a50', w, 3); });
  // zombie / cop textures (outside.js / ep1): plaid shirt + jeans, grey dead skin; navy police uniform
  const zTex = L.cvs(32, 64, (c) => {
    const r = L.rng(31);
    for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const sx = x % 8 < 2, sy = y % 8 < 2, th = x % 8 === 5 || y % 8 === 5; const col = sx && sy ? [60, 10, 10] : sx || sy ? [110, 18, 16] : th ? [210, 110, 90] : [176, 38, 30]; const n = r() * 16 - 8; px(c, x, y, rgb(col[0] + n, col[1] + n / 2, col[2] + n / 2)); }
    for (let y = 32; y < 64; y++) for (let x = 0; x < 32; x++) { const n = r() * 18 - 9 + (x % 16 === 0 ? -18 : 0); px(c, x, y, rgb(58 + n, 84 + n, 138 + n)); }
    for (let k = 0; k < 7; k++) px(c, Math.floor(r() * 30), Math.floor(r() * 30), '#2a2420', 2 + Math.floor(r() * 3), 2 + Math.floor(r() * 3));
  });
  zTex.wrapS = THREE.RepeatWrapping; zTex.wrapT = THREE.ClampToEdgeWrapping;
  const navyTex = L.cvs(32, 64, (c) => {   // top half: navy uniform shirt (seams, pocket flaps, buttons, grime; no painted blood); bottom: darker trousers, belt, side stripe
    const r = L.rng(32);
    for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const n = r() * 10 - 5; px(c, x, y, rgb(30 + n, 40 + n, 70 + n)); }
    for (let x = 0; x < 32; x += 16) px(c, x + 7, 0, '#121a30', 1, 32);
    for (let x = 0; x < 32; x += 16) { px(c, x + 2, 8, '#18223e', 4, 2); px(c, x + 10, 8, '#18223e', 4, 2); px(c, x + 8, 4, '#a0a0a8', 1, 1); px(c, x + 8, 12, '#a0a0a8', 1, 1); px(c, x + 8, 20, '#a0a0a8', 1, 1); }
    for (let k = 0; k < 5; k++) px(c, Math.floor(r() * 30), 14 + Math.floor(r() * 16), '#151a28', 2 + Math.floor(r() * 2), 1 + Math.floor(r() * 3));
    for (let y = 32; y < 64; y++) for (let x = 0; x < 32; x++) { const n = r() * 8 - 4; px(c, x, y, rgb(20 + n, 26 + n, 46 + n)); }
    px(c, 0, 32, '#0c0c0e', 32, 3); px(c, 14, 32, '#9a8a50', 3, 3); for (let x = 0; x < 32; x += 16) px(c, x + 3, 36, '#3a4a7a', 1, 28);
  });
  navyTex.wrapS = THREE.RepeatWrapping; navyTex.wrapT = THREE.ClampToEdgeWrapping;
  const skinT = L.rep(L.cvs(32, 32, (c) => {
    const r = L.rng(33);
    for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const n = r() * 20 - 10; px(c, x, y, rgb(138 + n, 150 + n, 152 + n)); }
    for (let k = 0; k < 14; k++) px(c, Math.floor(r() * 30), Math.floor(r() * 30), r() < 0.5 ? '#6a7064' : '#5a5e54', 1 + Math.floor(r() * 3), 1 + Math.floor(r() * 3));
  }), 1, 1);
  const tPlate = L.cvs(64, 16, (c, w, h) => {   // name plate VICKERS
    px(c, 0, 0, '#6a5420', w, h); px(c, 1, 1, '#d8bc60', w - 2, h - 2); px(c, 1, 1, '#f4e098', w - 2, 2); px(c, 1, h - 3, '#a08030', w - 2, 2);
    c.fillStyle = '#141008'; c.font = 'bold 11px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('VICKERS', w / 2, h / 2 + 1);
  });
  const tShield = L.cvs(16, 16, (c) => { c.clearRect(0, 0, 16, 16); c.fillStyle = '#d8bc60'; c.beginPath(); c.moveTo(8, 0); c.lineTo(15, 3); c.lineTo(14, 10); c.lineTo(8, 15); c.lineTo(2, 10); c.lineTo(1, 3); c.closePath(); c.fill(); c.fillStyle = '#806020'; c.beginPath(); c.arc(8, 7, 3, 0, 7); c.fill(); px(c, 4, 1, '#f8e8a8', 8, 1); });
  const tPaper = L.cvs(16, 16, (c) => { px(c, 0, 0, '#e8e4d8', 16, 16); for (let y = 3; y < 15; y += 2) px(c, 2, y, '#8a8a90', 9 + (y % 3), 1); });

  // ---------- materials ----------
  const mFloor = lam(L.rep(tFloor, 10 / 1.2, 13 / 1.2)), mCeil = lam(L.rep(tCeil, 10 / 1.2, 13 / 1.2));
  const mStone = lam(L.rep(tStone, 1, 2)), mIron = lam(tIron), mMetal = lam(tMetal), mDark = lam(null, 0x18181c), mBrass = lam(null, 0xc8a040);
  const mWoodC = lam(L.rep(tWood, 4, 1)), mTop = lam(L.rep(tTop, 6, 1)), mBench = lam(tTop, 0x9a7a5a);

  // ---------- lobby shell ----------
  const XW = 5, ZB = 13, HC = 5;
  L.plane(XW * 2, ZB, mFloor, 0, 0, ZB / 2, scene, 0, -Math.PI / 2);
  L.plane(XW * 2, ZB, mCeil, 0, HC, ZB / 2, scene, 0, Math.PI / 2);
  const mW = lam(tWall); mW.map.wrapS = mW.map.wrapT = THREE.RepeatWrapping;
  // wall part with world-mapped UVs (u = along/2 m, v = y/5 m) so cut walls keep the wainscot at the floor
  const wallPart = (a0, a1, y0, y1, place) => {
    const w = a1 - a0, h = y1 - y0, g = new THREE.PlaneGeometry(w, h), uv = g.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (a0 + uv.getX(i) * w) / 2, (y0 + uv.getY(i) * h) / HC);
    const m = L.mesh(g, mW, 0, (y0 + y1) / 2, 0, scene); place(m, (a0 + a1) / 2); return m;
  };
  const left = (m, c) => { m.position.set(-XW, m.position.y, c); m.rotation.y = Math.PI / 2; };
  const right = (m, c) => { m.position.set(XW, m.position.y, ZB - c); m.rotation.y = -Math.PI / 2; };
  const back = (m, c) => { m.position.set(-c, m.position.y, ZB); m.rotation.y = Math.PI; };   // a = -x along the back wall
  const front = (m, c) => { m.position.set(c, m.position.y, 0); };
  // left wall: K-9 corridor door opening (z 10.4..11.4, y < 2.2); right wall solid
  wallPart(0, 10.4, 0, HC, left); wallPart(11.4, ZB, 0, HC, left); wallPart(10.4, 11.4, 2.2, HC, left); wallPart(0, ZB, 0, HC, right);
  // back wall (a = -x): inner double doors x 2.4..4.4 (a -4.4..-2.4), barred gate x -4.4..-2.4 (a 2.4..4.4), both y < 2.6
  wallPart(-XW, -4.4, 0, HC, back); wallPart(-4.4, -2.4, 2.6, HC, back); wallPart(-2.4, 2.4, 0, HC, back);
  wallPart(4.4, XW, 0, HC, back); wallPart(2.4, 4.4, 2.6, HC, back);
  wallPart(-XW, -2.25, 0, HC, front); wallPart(2.25, XW, 0, HC, front); wallPart(-2.25, 2.25, 3.25, HC, front);
  for (const [x, z, w, d] of [[-XW + 0.02, ZB / 2, 0.04, ZB], [XW - 0.02, ZB / 2, 0.04, ZB]]) B(w, 0.12, d, lam(null, 0x2a1a0c), x, 0.06, z, scene);   // skirting
  B(10, 0.2, 0.12, lam(null, 0x8a7a5a), 0, HC - 0.1, ZB - 0.06, scene);   // cornice
  B(0.12, 0.2, ZB, lam(null, 0x8a7a5a), -XW + 0.06, HC - 0.1, ZB / 2, scene); B(0.12, 0.2, ZB, lam(null, 0x8a7a5a), XW - 0.06, HC - 0.1, ZB / 2, scene);

  // columns (stone, base + capital) and the extinguisher on one of them
  for (const z of [2.6, 6.0, 9.6]) for (const x of [-2.8, 2.8]) {
    B(0.56, HC, 0.56, mStone, x, HC / 2, z, scene); B(0.72, 0.32, 0.72, mStone, x, 0.16, z, scene); B(0.72, 0.28, 0.72, mStone, x, HC - 0.34, z, scene);
    B(0.62, 0.06, 0.62, lam(null, 0x8a8270), x, 0.36, z, scene);
  }
  { const ex = new THREE.Group(); ex.position.set(-2.8, 0, 6.0 + 0.37); scene.add(ex);
    cyl(0.075, 0.075, 0.48, 10, lam(tExt), 0, 0.95, 0, ex); cyl(0.04, 0.06, 0.05, 8, lam(null, 0x1a1a1a), 0, 1.215, 0, ex);
    B(0.1, 0.03, 0.03, lam(null, 0x1a1a1a), 0.03, 1.25, 0, ex); B(0.02, 0.3, 0.02, lam(null, 0x101010), -0.08, 1.0, 0.03, ex);
    B(0.18, 0.06, 0.04, mMetal, 0, 0.72, -0.06, ex);   // wall bracket
    L.plane(0.2, 0.08, L.basic(L.cvs(32, 12, (c) => { px(c, 0, 0, '#c41e16', 32, 12); c.fillStyle = '#fff'; c.font = 'bold 6px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('FIRE', 16, 6); })), 0, 1.45, -0.07, ex, 0);
  }

  // reception counter (walnut, two wings), desk lamp, First Aid Spray, papers, phone; CITY POLICE sign, flags
  const counter = new THREE.Group(); counter.position.set(0, 0, 9.2); scene.add(counter);
  B(4.6, 1.08, 0.7, [mWoodC, mWoodC, mTop, mTop, mWoodC, mWoodC], 0, 0.54, 0, counter);
  B(4.76, 0.06, 0.86, mTop, 0, 1.11, 0, counter);
  B(4.6, 0.1, 0.02, lam(null, 0x24140a), 0, 0.05, -0.36, counter);
  for (const s of [-1, 1]) { B(0.7, 1.08, 1.6, [mWoodC, mWoodC, mTop, mTop, mWoodC, mWoodC], s * 2.65, 0.54, 0.45, counter); B(0.86, 0.06, 1.76, mTop, s * 2.65, 1.11, 0.45, counter); }
  const LAMP = V(-1.4, 1.14, 9.05); let lampBulb;
  { const lp = new THREE.Group(); lp.position.copy(LAMP); scene.add(lp);
    cyl(0.08, 0.1, 0.03, 8, lam(null, 0x2a4a2a), 0, 0.015, 0, lp); const arm = B(0.02, 0.32, 0.02, mBrass, 0, 0.17, 0, lp); arm.rotation.z = 0.2;
    const sh = cyl(0.04, 0.12, 0.12, 8, lam(null, 0x1e5a2e, { side: DS }), -0.07, 0.34, -0.02, lp); sh.rotation.z = -0.5;
    lampBulb = L.mesh(new THREE.CircleGeometry(0.1, 8), L.basic(null, 0xffe0a0), -0.1, 0.29, -0.02, lp); lampBulb.rotation.set(Math.PI / 2, 0, -0.5); }
  const lampL = new THREE.PointLight(0xffa860, 3.2, 6, 1); lampL.position.set(LAMP.x - 0.1, LAMP.y + 0.25, LAMP.z - 0.2); scene.add(lampL);
  { const sp = new THREE.Group(); sp.position.set(0.9, 1.14, 8.98); scene.add(sp);   // First Aid Spray (RE)
    cyl(0.038, 0.038, 0.15, 10, lam(tSpray), 0, 0.075, 0, sp).rotation.y = Math.PI * 0.5; cyl(0.03, 0.036, 0.03, 8, lam(null, 0xd8dcde), 0, 0.165, 0, sp); B(0.02, 0.02, 0.03, lam(null, 0x2a9a4a), 0, 0.19, -0.01, sp); }
  for (let k = 0; k < 3; k++) { const p = B(0.22, 0.008, 0.3, lam(tPaper), 0.25 + k * 0.03, 1.145 + k * 0.009, 9.25, scene); p.rotation.y = 0.2 * k - 0.1; }
  // desk phone: base with keypad + a handset (recv) that Ava can lift (43b)
  const PHONE = V(1.5, 1.14, 9.0);
  const tKeys = L.cvs(16, 16, (c) => { px(c, 0, 0, '#1c1c20', 16, 16); for (let y = 0; y < 4; y++) for (let x = 0; x < 3; x++) px(c, 3 + x * 4, 2 + y * 3, '#b8b8b0', 2, 2); px(c, 1, 14, '#c82020', 3, 1); });
  { const mP = lam(null, 0x16161a); const pb = new THREE.Group(); pb.position.copy(PHONE); scene.add(pb);
    B(0.2, 0.06, 0.17, [mP, mP, lam(tKeys), mP, mP, mP], 0, 0.03, 0, pb); B(0.2, 0.025, 0.06, mP, 0, 0.07, 0.045, pb);
    const cord = []; for (let i = 0; i <= 24; i++) { const u = i / 24; cord.push(V(PHONE.x + 0.1 + 0.05 * Math.sin(u * 3), PHONE.y + 0.01 + 0.004 * Math.sin(u * 50), PHONE.z + 0.05 - 0.12 * u)); }
    scene.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cord), 40, 0.004, 3), lam(null, 0x101012))); }
  const recv = new THREE.Group(); scene.add(recv);   // handset, local x = its length
  { const mP = lam(null, 0x18181c); B(0.13, 0.022, 0.035, mP, 0, 0, 0, recv); for (const s of [-1, 1]) B(0.045, 0.035, 0.05, mP, s * 0.075, -0.012, 0, recv); }
  const RECV0 = V(PHONE.x, PHONE.y + 0.1, PHONE.z + 0.045);
  const recvHome = () => { recv.position.copy(RECV0); recv.rotation.set(0, 0, 0); };
  recvHome();
  L.plane(3.2, 0.5, lam(tSign), 0, 3.5, ZB - 0.02, scene, Math.PI);
  for (const [x, t] of [[-1.85, tFlagA], [1.85, tFlagB]]) {
    cyl(0.02, 0.02, 2.6, 6, mBrass, x, 1.3, ZB - 0.3, scene); L.mesh(new THREE.SphereGeometry(0.04, 6, 4), mBrass, x, 2.63, ZB - 0.3, scene);
    cyl(0.18, 0.2, 0.06, 8, lam(null, 0x2a2a2a), x, 0.03, ZB - 0.3, scene);
    const f = L.plane(0.75, 0.5, lam(t, 0xffffff, { side: DS }), x + (x < 0 ? 0.39 : -0.39), 2.25, ZB - 0.3, scene, Math.PI); void f;
  }
  // RE herb pots by the counter: green left, red right (+ one green by the doors)
  const herb = (x, z, col, dark) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
    cyl(0.17, 0.12, 0.28, 8, lam(tPot), 0, 0.14, 0, g); L.mesh(new THREE.CircleGeometry(0.15, 8), lam(null, 0x2a1a10), 0, 0.27, 0, g).rotation.x = -Math.PI / 2;
    const m = L.lam(leafTex(col, dark), 0xffffff, { alphaTest: 0.5, side: DS });
    for (let k = 0; k < 4; k++) { const p = L.plane(0.45, 0.45, m, 0, 0.47, 0, g, k * Math.PI / 4); p.rotation.x = 0.0; }
    return g;
  };
  // (the red herb read as a painted blood splat by the counter: both counter herbs are green now)
  herb(-2.2, 8.45, '#3aa03a', '#1e6a1e'); herb(2.2, 8.45, '#3aa03a', '#1e6a1e'); herb(4.5, 1.0, '#3aa03a', '#1e6a1e');
  // benches along the walls
  const bench = (x, z, ry) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g);
    for (let k = 0; k < 3; k++) B(1.8, 0.04, 0.12, mBench, 0, 0.45, -0.14 + k * 0.14, g);
    for (let k = 0; k < 2; k++) B(1.8, 0.1, 0.03, mBench, 0, 0.7 + k * 0.16, -0.23, g);
    for (const sx of [-0.8, 0.8]) { B(0.05, 0.45, 0.4, lam(null, 0x2a2420), sx, 0.225, 0, g); B(0.05, 0.5, 0.04, lam(null, 0x2a2420), sx, 0.7, -0.24, g); }
    return g;
  };
  bench(-4.5, 4.3, Math.PI / 2);
  // the two right-wall benches are the barricade: pushed against the INNER double doors (back wall, x 2.4..4.4)
  const benchA = bench(4.5, 7.0, -Math.PI / 2), benchB = bench(4.5, 4.3, -Math.PI / 2);
  const BENCH_A = V(3.4, 0, 12.75), BENCH_B = V(3.4, 0, 12.25);
  const setBenches = (barr, bz = BENCH_B.z) => {
    if (barr === 0) { benchA.position.set(4.5, 0, 7.0); benchA.rotation.y = -Math.PI / 2; benchB.position.set(4.5, 0, 4.3); benchB.rotation.y = -Math.PI / 2; return; }
    benchA.position.copy(BENCH_A); benchA.rotation.y = 0; benchB.position.set(BENCH_B.x, 0, barr === 1 ? bz : BENCH_B.z); benchB.rotation.y = 0;
  };
  // inner double doors (back wall right): dark wood leaves with wired-glass windows, brass push plates, EXIT-less transom
  const tDoorW = L.cvs(32, 64, (c, w, h) => {
    const r = L.rng(341); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = r() * 10 - 5 + Math.sin(y * 0.6 + x * 0.2) * 4; px(c, x, y, rgb(98 + n, 62 + n * 0.7, 36 + n * 0.4)); }
    c.strokeStyle = '#3a200e'; c.strokeRect(3.5, 36.5, 25, 22); c.strokeStyle = '#a07048'; c.strokeRect(4.5, 37.5, 23, 20);
    px(c, 5, 5, '#141a26', 22, 24); for (let y = 6; y < 29; y += 4) px(c, 5, y, '#3a4250', 22, 1); for (let x = 6; x < 27; x += 4) px(c, x, 5, '#3a4250', 1, 24);
    c.strokeStyle = '#2a1608'; c.strokeRect(4.5, 4.5, 23, 25); px(c, 0, 0, '#2a1608', w, 1); px(c, 0, h - 1, '#2a1608', w, 1);
  });
  { const ID = new THREE.Group(); ID.position.set(3.4, 0, ZB - 0.03); scene.add(ID);
    L.plane(2.0, 2.6, lam(null, 0x0a0a0e), 0, 1.3, 0.4, ID, Math.PI);
    for (const s of [-1, 1]) { B(0.97, 2.5, 0.05, lam(tDoorW), s * 0.495, 1.25, 0, ID); B(0.05, 0.3, 0.02, mBrass, s * 0.12, 1.15, -0.035, ID); }
    for (const s of [-1, 1]) B(0.1, 2.62, 0.12, lam(null, 0x3a2210), s * 1.04, 1.31, 0, ID);
    B(2.18, 0.1, 0.12, lam(null, 0x3a2210), 0, 2.6, 0, ID);
    L.plane(1.2, 0.26, lam(L.cvs(64, 14, (c, w, h) => { px(c, 0, 0, '#1c2a1c', w, h); c.fillStyle = '#d8d0b0'; c.font = 'bold 9px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('OFFICES', w / 2, h / 2 + 1); })), 0, 2.85, -0.01, ID, Math.PI);
  }
  // emergency light (twin heads) above the inner doors: on backup power until "dies" (p1)
  const emerg = new THREE.Group(); emerg.position.set(3.4, 3.3, ZB - 0.08); scene.add(emerg);
  B(0.46, 0.16, 0.1, lam(null, 0xd8d4c8), 0, 0, 0, emerg); B(0.1, 0.03, 0.02, L.basic(null, 0x50ff50), 0.12, 0.03, -0.055, emerg);
  const emHeads = [-1, 1].map((s) => { const hd = B(0.12, 0.1, 0.12, lam(null, 0xd8d4c8), s * 0.17, -0.06, -0.09, emerg); hd.rotation.x = 0.5;
    return L.mesh(new THREE.CircleGeometry(0.045, 8), L.basic(null, 0xfff0c8), s * 0.17, -0.1, -0.15, emerg); });
  emHeads.forEach((m) => { m.rotation.x = Math.PI - 0.5; m.material.side = DS; });
  const emL = new THREE.PointLight(0xffdcae, 0, 11, 1); emL.position.set(3.4, 2.9, ZB - 0.6); scene.add(emL);
  // K-9 corridor door (left wall, z 10.4..11.4): green-grey steel, kick plate, K-9 plate, scratches at the bottom; hinge at z 10.4
  const tK9 = L.cvs(32, 64, (c, w, h) => {
    const r = L.rng(342); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = r() * 10 - 5; px(c, x, y, rgb(84 + n, 96 + n, 88 + n)); }
    px(c, 0, 0, '#3a443e', w, 1); px(c, 0, 0, '#3a443e', 1, h); px(c, w - 1, 0, '#2a302c', 1, h);
    px(c, 2, 54, '#9a9a90', w - 4, 9); for (let x = 3; x < w - 3; x += 3) px(c, x, 55, '#6a6a62', 1, 7);   // kick plate
    for (let k = 0; k < 9; k++) { const x0 = 5 + r() * 20 | 0, y0 = 40 + r() * 12 | 0; for (let i = 0; i < 5 + r() * 5; i++) px(c, x0 + (i * 0.3 | 0), y0 + i, 'rgba(210,214,200,0.9)'); }   // claw marks
    for (let k = 0; k < 6; k++) px(c, r() * w | 0, r() * 50 | 0, 'rgba(60,40,24,0.5)', 2, 3);
  });
  const tK9Plate = L.cvs(48, 20, (c, w, h) => { px(c, 0, 0, '#5a4818', w, h); px(c, 1, 1, '#d8bc60', w - 2, h - 2); px(c, 1, 1, '#f4e098', w - 2, 2);
    c.fillStyle = '#141008'; c.font = 'bold 13px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('K-9', w / 2, h / 2 + 1); });
  const k9 = new THREE.Group(); k9.position.set(-XW + 0.04, 0, 11.4); scene.add(k9);   // hinge (z 11.4); leaf extends to -z
  const k9Leaf = new THREE.Group(); k9.add(k9Leaf);
  B(0.05, 2.15, 0.98, [lam(tK9), lam(tK9), mDark, mDark, mDark, mDark], 0, 1.075, -0.5, k9Leaf);
  L.plane(0.34, 0.14, lam(tK9Plate), 0.03, 1.6, -0.5, k9Leaf, Math.PI / 2);
  for (const s of [-1, 1]) B(0.06, 0.04, 0.16, lam(null, 0xb8b4a8), s * 0.05, 1.05, -0.86, k9Leaf);   // lever handles, both faces
  for (const z of [-0.04, 1.04]) B(0.1, 2.24, 0.08, lam(null, 0x3a3e3a), -XW + 0.04, 1.12, 10.4 + z, scene);
  B(0.1, 0.08, 1.16, lam(null, 0x3a3e3a), -XW + 0.04, 2.2, 10.9, scene);
  L.plane(2.0, 2.2, lam(null, 0x08080c), -XW - 1.6, 1.1, 10.9, scene, Math.PI / 2);   // dark corridor behind
  L.plane(1.6, 1.0, mFloor, -XW - 0.8, 0.001, 10.9, scene, 0, -Math.PI / 2);
  for (const s of [-1, 1]) L.plane(1.6, 2.2, lam(null, 0x24262a), -XW - 0.8, 1.1, 10.9 + s * 0.5, scene, s < 0 ? 0 : Math.PI);
  L.plane(1.6, 1.0, lam(null, 0x1a1a1e), -XW - 0.8, 2.2, 10.9, scene, 0, Math.PI / 2);   // stub ceiling (48r looks out through it)
  // swivel chair behind the counter (turned away, like someone left in a hurry)
  const chair = new THREE.Group(); chair.position.set(0.35, 0, 10.05); chair.rotation.y = 2.3; scene.add(chair);
  { const mC = lam(null, 0x1e2228), mL = lam(null, 0x2a2a2e);
    B(0.5, 0.08, 0.48, mC, 0, 0.5, 0, chair); B(0.48, 0.55, 0.07, mC, 0, 0.86, -0.22, chair); cyl(0.025, 0.025, 0.42, 6, mL, 0, 0.25, 0, chair);
    for (let k = 0; k < 5; k++) { const l = B(0.32, 0.03, 0.04, mL, 0, 0.05, 0, chair); l.rotation.y = k / 5 * Math.PI * 2; l.position.set(Math.sin(k / 5 * Math.PI * 2) * 0.14, 0.05, Math.cos(k / 5 * Math.PI * 2) * 0.14); }
    for (const s of [-1, 1]) B(0.05, 0.04, 0.3, mL, s * 0.26, 0.68, -0.02, chair); }
  // notice board (left wall)
  { B(1.5, 0.95, 0.04, lam(null, 0x3a2210), -XW + 0.03, 1.75, 6.4, scene); L.plane(1.42, 0.88, lam(tCork), -XW + 0.055, 1.75, 6.4, scene, Math.PI / 2); }
  // wall clock (back wall, under the CITY POLICE sign); hands are meshes, setClock(h, m, s)
  const clock = new THREE.Group(); clock.position.set(0, 2.62, ZB - 0.03); clock.rotation.y = Math.PI; scene.add(clock);
  { const rim = cyl(0.25, 0.25, 0.06, 16, lam(null, 0x2a1a10), 0, 0, 0, clock); rim.rotation.x = Math.PI / 2;
    L.mesh(new THREE.CircleGeometry(0.22, 24), lam(tClock), 0, 0, 0.031, clock);
    L.mesh(new THREE.CircleGeometry(0.012, 8), lam(null, 0x101010), 0, 0, 0.04, clock); }
  const hand = (len, wid, col, z) => { const g = new THREE.Group(); g.position.z = z; clock.add(g); B(wid, len, 0.004, lam(null, col), 0, len / 2 - 0.02, 0, g); return g; };
  const hH = hand(0.12, 0.018, 0x101010, 0.034), hM = hand(0.18, 0.012, 0x101010, 0.037), hS = hand(0.19, 0.005, 0xb01818, 0.04);
  const setClock = (h, m, sec = 0) => { hH.rotation.z = -(h + m / 60) / 12 * Math.PI * 2; hM.rotation.z = -(m + sec / 60) / 60 * Math.PI * 2; hS.rotation.z = -sec / 60 * Math.PI * 2; };
  const ROWS = 6;
  // fluorescent rows (6, two fixtures each); tubes switch from dead grey to white
  const ROWZ = Array.from({ length: ROWS }, (_, i) => 1.6 + i * 2.0);
  const tubeOff = L.basic(null, 0x50565e), rows = [];
  for (const z of ROWZ) {
    const tubes = [];
    for (const x of [-1.8, 1.8]) { B(1.3, 0.08, 0.34, lam(null, 0xb8b8b0), x, HC - 0.05, z, scene); const t = B(1.2, 0.02, 0.24, tubeOff, x, HC - 0.1, z, scene); tubes.push(t); }
    const pl = new THREE.PointLight(0xf4f8ff, 0, 8, 1); pl.position.set(0, HC - 0.6, z); scene.add(pl);
    rows.push({ tubes, pl, mOn: L.basic(null, 0xf8fbff) });
  }
  // barred gate (back wall), chain + padlock at her lock height (set below once Ava's hand is measured)
  const GX = -3.4, GZ = ZB - 0.04;
  // behind the gate: the long interior HALLWAY (z 13..29), unlit; a window at the far end lets in a little blue
  const HL = 16, HZ1 = ZB + HL;
  { const mHW = lam(L.rep(tWall, HL / 2, 1), 0x8a8c96), mHF = lam(L.rep(tFloor, 2 / 1.2, HL / 1.2), 0x9a9aa0);
    L.plane(2.0, HL, mHF, GX, 0.001, ZB + HL / 2, scene, 0, -Math.PI / 2);
    L.plane(2.0, HL, lam(L.rep(tCeil, 2, HL / 1.2), 0x707070), GX, 2.6, ZB + HL / 2, scene, 0, Math.PI / 2);
    for (const s of [-1, 1]) L.plane(HL, 2.6, mHW, GX + s * 1.0, 1.3, ZB + HL / 2, scene, -s * Math.PI / 2);
    L.plane(2.0, 2.6, lam(tWall, 0x8a8c96), GX, 1.3, HZ1, scene, Math.PI);
    const tWin = L.cvs(16, 20, (c) => { px(c, 0, 0, '#3a4c70', 16, 20); px(c, 7, 0, '#141820', 2, 20); px(c, 0, 9, '#141820', 16, 2); for (let k = 0; k < 6; k++) px(c, (k * 5) % 15, (k * 7) % 19, '#5a6e98', 1, 3); });
    L.plane(0.8, 1.0, L.basic(tWin, 0x8090b0), GX, 1.6, HZ1 - 0.01, scene, Math.PI);
    for (const [s, z] of [[-1, ZB + 4], [1, ZB + 7.5], [-1, ZB + 11]]) {   // office doors along the hallway
      const dz = new THREE.Group(); dz.position.set(GX + s * 0.97, 0, z); dz.rotation.y = -s * Math.PI / 2; scene.add(dz);
      B(0.9, 2.1, 0.04, lam(tDoorW, 0x9a9a9a), 0, 1.05, 0, dz); for (const e of [-1, 1]) B(0.08, 2.2, 0.06, lam(null, 0x2a1a0c), e * 0.49, 1.1, 0, dz);
    }
    for (let z = ZB + 2.5; z < HZ1; z += 4) B(0.3, 0.06, 1.2, lam(null, 0x9a9a92), GX, 2.57, z, scene);   // dead light fixtures
  }
  // something at the far end of the hallway (58e): a soft dark shape that drifts across the window light, never revealed
  const tShade = L.cvs(32, 64, (c, w, h) => { c.clearRect(0, 0, w, h); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const dx = (x - 16) / (y < 14 ? 6 : 11), dy = y < 14 ? (y - 8) / 6 : 0; const a = Math.max(0, 1 - Math.hypot(dx, dy)); if (a > 0 && (y < 14 || y > 15)) px(c, x, y, `rgba(4,4,8,${Math.min(1, a * 1.6)})`); } });
  const shade = L.plane(0.7, 1.75, L.basic(tShade, 0xffffff, { transparent: true, depthWrite: false }), GX, 0.88, HZ1 - 0.6, scene, Math.PI); shade.visible = false;
  const hallL = new THREE.PointLight(0x6a80b8, 0, 7, 1); hallL.position.set(GX, 1.9, HZ1 - 0.8); scene.add(hallL);
  {
    for (const s of [-1, 1]) B(0.1, 2.7, 0.14, mIron, GX + s * 1.04, 1.35, GZ, scene);
    B(2.18, 0.1, 0.14, mIron, GX, 2.65, GZ, scene);
    for (const s of [-1, 1]) { const lx = GX + s * 0.5;
      for (const y of [0.12, 1.0, 2.5]) B(0.98, 0.05, 0.05, mIron, lx, y, GZ, scene);
      for (let k = 0; k < 8; k++) B(0.025, 2.5, 0.025, mIron, lx - 0.44 + k * 0.125, 1.3, GZ, scene);
      B(0.05, 2.5, 0.05, mIron, GX + s * 0.03, 1.3, GZ, scene); }
  }
  // low-poly brass padlock (built facing +z, turned to face the lobby): body 50 x 52 x 24 mm with a front keyway, steel U-shackle
  // (long leg = pivot); padSet(k): k = 0 open (shackle up + swung out) .. 1 shut. Key in the keyway while her hand is on it.
  const padlock = new THREE.Group(); scene.add(padlock); padlock.rotation.y = Math.PI;
  const tPadF = L.cvs(32, 32, (c, w, h) => { const r = L.rng(351);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = r() * 16 - 8, e = x < 2 || x > w - 3 || y < 2 || y > h - 3; px(c, x, y, e ? rgb(150 + n, 108 + n, 34) : rgb(214 + n - y * 1.2, 168 + n - y, 60 + n * 0.5)); }
    px(c, 4, 4, '#f0d888', w - 8, 1); px(c, 8, 9, '#8a6420', 16, 5); px(c, 9, 10, '#e8c868', 14, 1); px(c, 11, 12, '#6a4a14', 10, 1);   // stamped maker plate
    for (let x = 6; x < w - 6; x += 4) px(c, x, 24, '#9a7424', 2, 2);   // rivet row
  });
  const tPadB = L.cvs(32, 16, (c, w, h) => { px(c, 0, 0, '#a07a28', w, h); px(c, 1, 1, '#c89a3a', w - 2, h - 2);
    px(c, 13, 5, '#5a3c10', 7, 7); px(c, 14, 6, '#0c0804', 5, 5); px(c, 15, 7, '#3a2a0c', 3, 1); });   // keyway (bottom face)
  const mBrassP = lam(null, 0xb88a2a), mSteel = lam(null, 0xc4c8cc);
  B(0.05, 0.052, 0.024, [mBrassP, mBrassP, lam(null, 0xd0a040), lam(tPadB), lam(tPadF), mBrassP], 0, 0, 0, padlock);
  B(0.044, 0.004, 0.026, lam(null, 0x8a6420), 0, 0.024, 0, padlock); B(0.044, 0.004, 0.026, lam(null, 0x8a6420), 0, -0.024, 0, padlock);   // rims
  const shackle = new THREE.Group(); shackle.position.set(0.016, 0.026, 0); padlock.add(shackle);   // pivot on the long leg
  { const leg = (h, x) => L.mesh(new THREE.CylinderGeometry(0.0045, 0.0045, h, 6), mSteel, x, h / 2 - 0.006, 0, shackle);
    leg(0.022, 0); leg(0.02, -0.032);
    const arc = L.mesh(new THREE.TorusGeometry(0.016, 0.0045, 6, 10, Math.PI), mSteel, -0.016, 0.014, 0, shackle); void arc; }
  const padKey = new THREE.Group(); padKey.position.set(0, -0.026, 0); padlock.add(padKey);   // key in the bottom keyway, bow down
  { const mK = lam(null, 0xd8b450); B(0.006, 0.014, 0.003, mK, 0, -0.007, 0, padKey); B(0.018, 0.018, 0.003, mK, 0, -0.022, 0, padKey); B(0.006, 0.006, 0.0035, lam(null, 0x2a1e08), 0, -0.025, 0, padKey); }
  function padSet(k) { shackle.position.y = 0.026 + 0.014 * (1 - k); shackle.rotation.y = 0.75 * (1 - k); }
  const chain = new THREE.Group(); scene.add(chain);

  // ---------- front glass doors (z=0): static metal frame + glass groups that shake ----------
  const frameM = mMetal;
  for (const x of [-2.25, -0.95, 0.95, 2.25]) B(0.1, 3.25, 0.14, frameM, x, 1.625, 0, scene);
  B(4.6, 0.12, 0.14, frameM, 0, 3.22, 0, scene); B(1.8, 0.1, 0.14, frameM, 0, 2.38, 0, scene);
  for (const s of [-1, 1]) B(1.2, 0.16, 0.14, frameM, s * 1.6, 0.08, 0, scene);
  const mGlass = L.basic(tGlass, 0xa8bcd8, { transparent: true, opacity: 0.13, depthWrite: false, side: DS });
  const dropMats = [], dropMeshes = [], streakMats = [];
  const tStreak = L.cvs(32, 128, (c, w, h) => {   // a few long fast water runs (bright head at the bottom, fading trail above)
    c.clearRect(0, 0, w, h); const r = L.rng(331);
    for (let k = 0; k < 3; k++) { const x = 3 + (r() * 26 | 0), y = 20 + (r() * 100 | 0), len = 14 + (r() * 16 | 0);
      for (let i = 0; i < len; i++) px(c, x, y - i, i < 2 ? '#f0f6ff' : 'rgba(200,220,245,1)', 1, 1); px(c, x, y + 1, '#ffffff', 1, 1); }
  });
  const pane = (w, h, x, y, parent) => {
    L.plane(w, h, mGlass, x, y, 0, parent);
    const t = L.rep(tDrops, w / 0.7, h / 1.4); dropMats.push(t);
    const st = L.rep(tStreak, w / 0.7, h / 2.8); st.userData.ph = streakMats.length * 0.37; streakMats.push(st);
    dropMeshes.push(L.plane(w, h, L.basic(st, 0xd8e6f8, { transparent: true, opacity: 0.45, depthWrite: false, alphaTest: 0.3, side: DS }), x, y, -0.007, parent));
    dropMeshes.push(L.plane(w, h, L.basic(t, 0xc8d8ee, { transparent: true, opacity: 0.4, depthWrite: false, alphaTest: 0.3, side: DS }), x, y, -0.006, parent));
  };
  const glassGroups = [];
  const leaf = (s) => {   // door leaf: pivot at its outer hinge; frame + glass + push bar
    const g = new THREE.Group(); g.position.set(s * 0.475, 0, 0); scene.add(g);
    B(0.07, 2.3, 0.06, frameM, -s * 0.4, 1.15, 0, g); B(0.07, 2.3, 0.06, frameM, s * 0.4, 1.15, 0, g);
    B(0.87, 0.08, 0.06, frameM, 0, 2.29, 0, g); B(0.87, 0.24, 0.06, frameM, 0, 0.12, 0, g);
    pane(0.73, 1.97, 0, 1.25, g);
    B(0.6, 0.04, 0.04, lam(null, 0xb8b4a8), 0, 1.05, 0.07, g); for (const k of [-0.27, 0.27]) B(0.03, 0.03, 0.06, lam(null, 0xb8b4a8), k, 1.05, 0.04, g);
    B(0.03, 0.4, 0.04, lam(null, 0xb8b4a8), -s * 0.34, 1.1, -0.06, g);   // outside pull handle
    glassGroups.push({ g, base: g.position.clone(), k: 1 }); return g;
  };
  leaf(-1); leaf(1);
  for (const s of [-1, 1]) { const g = new THREE.Group(); g.position.set(s * 1.6, 0, 0); scene.add(g); pane(1.2, 3.0, 0, 1.68, g); glassGroups.push({ g, base: g.position.clone(), k: 0.6 }); }
  { const g = new THREE.Group(); scene.add(g); pane(1.8, 0.72, 0, 2.8, g); glassGroups.push({ g, base: g.position.clone(), k: 0.4 }); }
  // bloody handprint on the outside of the left leaf (from the zombies)
  const tPrint = await L.loadTex('tex/handprint.png', 128);
  const print = L.plane(0.24, 0.24, L.basic(tPrint, 0xffffff, { alphaTest: 0.4, side: DS }), -0.15, 1.55, -0.012, glassGroups[0].g); print.rotation.z = 0.3;
  // moonlight through the glass on the floor (additive panes with mullion shadows)
  const tSpill = L.cvs(64, 32, (c, w, h) => { c.fillStyle = '#000'; c.fillRect(0, 0, w, h); c.fillStyle = '#7a92c8'; for (const [x0, x1] of [[2, 15], [17, 31], [33, 47], [49, 62]]) c.fillRect(x0, 4, x1 - x0, h - 4); c.fillStyle = '#000'; c.fillRect(0, 14, w, 1); });
  const spill = L.plane(5.2, 4.2, new THREE.MeshBasicMaterial({ map: tSpill, color: 0xffffff, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }), 0.5, 0.025, 2.2, scene, 0, -Math.PI / 2);
  spill.rotation.z = 0.12;
  // streetlamp haze behind the doors: the cop/zombies read as silhouettes against it
  const tGlow = L.cvs(32, 32, (c, w, h) => { const g = c.createRadialGradient(16, 16, 1, 16, 16, 16); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.5, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
  const glow = L.plane(5, 5, L.basic(tGlow, 0x6a86b8, { transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }), 0.8, 2.2, -3.0, scene);

  // ---------- outside: landing, curb, wet street, building across, streetlamps, patrol cars, rain ----------
  L.plane(12, 3.6, lam(L.rep(tSide, 12 / 1.2, 3.6 / 1.2)), 0, 0, -1.8, scene, 0, -Math.PI / 2);
  B(12, 0.15, 0.25, lam(L.rep(tSide, 10, 1)), 0, -0.075, -3.7, scene);
  L.plane(40, 14, lam(L.rep(tAsph, 10, 3.5)), 0, -0.15, -10.6, scene, 0, -Math.PI / 2);
  L.plane(40, 2, lam(L.rep(tSide, 30, 1.5)), 0, -0.05, -16.5, scene, 0, -Math.PI / 2);
  L.plane(40, 12, lam(L.rep(tBuild, 6, 1.5), 0xb0b0b8), 0, 5.8, -17.5, scene);
  const lampPost = (x, z) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
    cyl(0.06, 0.08, 4.2, 6, lam(null, 0x2a2c30), 0, 2.1, 0, g); B(0.9, 0.06, 0.06, lam(null, 0x2a2c30), -0.42, 4.15, 0, g);
    B(0.4, 0.12, 0.22, lam(null, 0x3a3c40), -0.85, 4.1, 0, g); B(0.34, 0.02, 0.16, L.basic(null, 0xe4eeff), -0.85, 4.035, 0, g);
  };
  lampPost(2.4, -3.3); lampPost(-4.5, -12);
  const makeCar = () => {
    const g = new THREE.Group(), mS = lam(tCarSide), mF = lam(tCarFront), mBl = lam(null, 0x16161a), mWh = lam(null, 0xe4e4e0), mWin = lam(tCarWin), mGl = lam(null, 0x1a2234);
    B(4.6, 0.62, 1.8, [mF, mF, mBl, mBl, mS, mS], 0, 0.62, 0, g);
    B(2.3, 0.55, 1.62, [mGl, mGl, mWh, mBl, mWin, mWin], -0.2, 1.2, 0, g);
    B(1.3, 0.12, 0.3, lam(null, 0x5a1418), -0.2, 1.53, -0.0, g); B(0.64, 0.125, 0.31, lam(null, 0x14204a), -0.52, 1.53, 0, g);
    for (const sx of [-1.45, 1.45]) for (const sz of [-0.86, 0.86]) { const w = cyl(0.34, 0.34, 0.24, 10, lam(null, 0x0e0e10), sx, 0.34, sz, g); w.rotation.x = Math.PI / 2; }
    const door = B(1.0, 0.55, 0.05, mWh, 0, 0, 0, null); const hinge = new THREE.Group(); hinge.position.set(0.55, 0.75, 0.92); hinge.rotation.y = -0.75; g.add(hinge); door.position.set(-0.5, 0, 0); hinge.add(door);
    return g;
  };
  { const c1 = makeCar(); c1.position.set(-1.4, -0.15, -6.6); c1.rotation.y = 0.28; scene.add(c1);
    const c2 = makeCar(); c2.position.set(4.6, -0.15, -11.5); c2.rotation.y = -0.5; scene.add(c2); }
  // rain: deterministic falling streaks in front of the station
  const NR = 420, rr = L.rng(321), RAIN = [];
  for (let i = 0; i < NR; i++) RAIN.push([rr() * 14 - 7, rr() * 5.6, -0.25 - rr() * 13, 6 + rr() * 2]);
  const rainPos = new Float32Array(NR * 6), rainGeo = new THREE.BufferGeometry(); rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
  const rain = new THREE.LineSegments(rainGeo, new THREE.LineBasicMaterial({ color: 0x9ab0d4, transparent: true, opacity: 0.4, fog: true })); rain.frustumCulled = false; scene.add(rain);
  const setRain = (t) => {
    for (let i = 0; i < NR; i++) { const [x, y0, z, v] = RAIN[i], H = 5.8, y = H - 0.2 - (((H - y0) + t * v) % H);
      rainPos.set([x, y, z, x + 0.03, y + 0.26, z], i * 6); }
    rainGeo.attributes.position.needsUpdate = true;
    for (const d of dropMats) d.offset.y = t * 0.07;   // drops slide DOWN
    for (const d of streakMats) d.offset.y = t * 0.9 + d.userData.ph;   // occasional fast runs
  };

  // ---------- zombies (models' own hands) + the cop ----------
  window.__fx.renderer.localClippingEnabled = true;
  const GLB = {};
  const getG = async (n) => GLB[n] || (GLB[n] = await L.loadModel(`models/${n}.glb`));
  const city = await getG('city-zombie');
  city.scene.traverse((o) => {   // outside.js: the city GLB has no usable UVs -> planar UVs (shirt top half, trousers bottom half)
    if (!o.isMesh) return; const g = o.geometry, p = g.attributes.position, uv = new Float32Array(p.count * 2), n = o.material.name || '';
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      if (n.includes('Outfit')) { uv[i * 2] = (x * 0.8 + z * 0.9) * 3; uv[i * 2 + 1] = y > 0.97 ? 0.5 + Math.min(0.49, (y - 0.97) * 0.9) : Math.max(0.01, Math.min(0.48, (y - 0.25) * 0.66)); }
      else { uv[i * 2] = (x + z) * 4; uv[i * 2 + 1] = y * 4; } }
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  });
  const thinTex = await L.loadTex('tex/thin_zombie.png', 256); thinTex.flipY = false; thinTex.needsUpdate = true;
  const GLASS_CLIP = new THREE.Plane(V(0, 0, -1), -0.012);   // nothing of them passes the glass (keeps z <= -0.012)
  async function makeZ(kind, h, matFn, tint = 0xffffff) {
    const g = await getG(kind), root = L.ps1Clone(g.scene);
    root.traverse((o) => { if (!o.isMesh) return;
      if (matFn) o.material = matFn(o.material.name || '', o.material);
      for (const m of (Array.isArray(o.material) ? o.material : [o.material])) { m.clippingPlanes = [GLASS_CLIP]; m.side = DS; m.color.multiply(new THREE.Color(tint)); m.needsUpdate = true; } });
    const wrap = new THREE.Group(); wrap.add(root); root.updateMatrixWorld(true);
    const bb = new THREE.Box3().setFromObject(root), k = h / (bb.max.y - bb.min.y);
    root.scale.multiplyScalar(k); root.position.y = -bb.min.y * k;
    const mixer = new THREE.AnimationMixer(root), acts = {};
    const clip = (n) => THREE.AnimationClip.findByName(g.animations, n);
    const act = (n) => acts[n] || (acts[n] = (() => { const a = mixer.clipAction(clip(n)); a.play(); a.setEffectiveWeight(0); return a; })());
    let hip = null; const meshes = []; root.traverse((o) => { if (o.isSkinnedMesh) { if (!hip) hip = o.skeleton.bones[0]; meshes.push(o); } });
    const hip0 = hip.position.clone();
    const bone = (re) => { let b = null; root.traverse((o) => { if (!b && re.test(o.name)) b = o; }); return b; };
    const hR = bone(/(hand.?R|RightHand)$/), hL = bone(/(hand.?L|LeftHand)$/), head = bone(/(^head|Head)$/) || bone(/spine.?006$/);
    if (!hR || !hL || !head) throw new Error(`bones ${kind}: ${[hR, hL, head].map((b) => b && b.name)}`);
    scene.add(wrap);
    return { wrap, root, meshes, hR, hL, head, bone, anims: g.animations.map((a) => a.name), dur: (n) => clip(n).duration,
      pose(list) { for (const a of Object.values(acts)) a.setEffectiveWeight(0); for (const [n, t, w] of list) { const a = act(n), d = a.getClip().duration; a.time = ((t % d) + d) % d; a.setEffectiveWeight(w); } mixer.update(0); hip.position.x = hip0.x; hip.position.z = hip0.z; wrap.updateMatrixWorld(true); } };
  }
  // best clip time: sample every clip, keep the frame that scores best (hands forward on the glass / one fist up to knock)
  const BAD = /dying|death|dead|hurt|hit|pain|logo|editpose|run|walk|forward|waddle|enter/i;
  function findPose(z, score, yaws = [0, Math.PI], clips = z.anims.filter((n) => !BAD.test(n))) {
    const keep = [z.wrap.position.clone(), z.wrap.rotation.y]; z.wrap.position.set(0, 0, 0);
    let best = null;
    for (const yaw of yaws) { z.wrap.rotation.y = yaw;
      for (const n of clips) { const d = z.dur(n); for (let i = 0; i <= 48; i++) { const t = d * i / 48; z.pose([[n, t, 1]]); const s = score(z.hL.getWorldPosition(V()), z.hR.getWorldPosition(V()), z.head.getWorldPosition(V())); if (!best || s > best.s) best = { n, t, s, yaw }; } } }
    z.wrap.position.copy(keep[0]); z.wrap.rotation.y = keep[1]; return best;
  }
  const press = (hl, hr, hd) => Math.min(hl.z, hr.z) * 2 - Math.abs((hl.y + hr.y) / 2 - 1.45) * 1.5 - Math.max(0, Math.abs(hl.x - hr.x) - 0.6) - Math.max(0, 1.5 - hd.y) * 3;
  const cityMat = (shirt) => (n) => n.includes('Outfit') ? L.lam(shirt) : n.includes('Body') ? L.lam(skinT) : L.lam(null, 0x6a2a20);
  // three city zombies (their faces read through the glass; the thin-zombie face is too dark at this distance): plaid, faded blue plaid, mustard
  const ZS = [
    await makeZ('city-zombie', 1.78, cityMat(zTex), 0x9aa8c8),
    await makeZ('city-zombie', 1.84, cityMat(zTex)),
    await makeZ('city-zombie', 1.8, cityMat(zTex), 0xd8c890),
  ];
  const ZP = ZS.map((z, i) => findPose(z, press, [0]));
  // cop: city zombie in a dark-navy uniform; knock pose = right fist forward at head height, left hand down
  const cop = await makeZ('city-zombie', 1.86, cityMat(navyTex));
  const copSkin = []; cop.root.traverse((o) => { if (o.isMesh) for (const m of (Array.isArray(o.material) ? o.material : [o.material])) if (m.map === skinT) copSkin.push(m); });
  const KN = { n: 'Zombie_Idle', t: 0.6, yaw: 0 };   // upright idle; the knocking arm is aimed at the glass by hand (aimBone)
  const attachAt = (bone, obj, Mw) => { bone.add(obj); bone.updateMatrixWorld(true); bone.matrixWorld.clone().invert().multiply(Mw).decompose(obj.position, obj.quaternion, obj.scale); };
  const capG = new THREE.Group(), eyes = new THREE.Group(), badge = new THREE.Group();
  let BADGE_LOCAL = V();
  {
    cop.wrap.position.set(0, 0, 0); cop.wrap.rotation.y = KN.yaw; cop.pose([[KN.n, KN.t, 1]]);
    const hd = cop.head.getWorldPosition(V()), topB = cop.bone(/HeadTop_End$/), tp = topB ? topB.getWorldPosition(V()) : hd.clone().add(V(0, 0.2, 0));
    // skinned vertices in world space (front surfaces for the cap, eyes and badge)
    const pts = []; for (const m of cop.meshes) { const p = V(), n = m.geometry.attributes.position.count; for (let i = 0; i < n; i += 1) { m.getVertexPosition(i, p); pts.push(p.clone().applyMatrix4(m.matrixWorld)); } }
    const frontAt = (x, y, r = 0.025, zmax = 9) => { let z = -9; for (const q of pts) if (Math.abs(q.x - x) < r && Math.abs(q.y - y) < r && q.z > z && q.z < zmax) z = q.z; return z; };
    const up = tp.clone().sub(hd).normalize(), fw = V(0, 0, 1).sub(up.clone().multiplyScalar(up.z)).normalize(), xx = up.clone().cross(fw).normalize();
    // head extents: highest vertex near the head axis -> cap sits on the crown
    let crown = -9; for (const q of pts) if (Math.abs(q.x - hd.x) < 0.05 && Math.abs(q.z - hd.z) < 0.08 && q.y > crown) crown = q.y;
    let noseZ = -9, noseY = hd.y; for (const q of pts) if (Math.abs(q.x - hd.x) < 0.012 && q.y > hd.y && q.y < crown && q.z > noseZ) { noseZ = q.z; noseY = q.y; }
    const mNavy = lam(null, 0x1a2244), mBlk = lam(null, 0x0c0c0e), mGold = lam(null, 0xd8b850);
    // peaked police cap scaled to the head: band + slightly flared, low crown with a soft rounded top, short black visor
    // angled down, small gold cap badge. Origin = bottom of the band at the head centre, visor toward +z.
    let sx = 0, sz = 0, sn = 0; for (const q of pts) if (q.y > crown - 0.07 && Math.abs(q.x - hd.x) < 0.15 && Math.abs(q.z - hd.z) < 0.2) { sx += q.x; sz += q.z; sn++; }
    const cx = sn ? sx / sn : hd.x, cz = sn ? sz / sn : hd.z;
    let hw = 0, hdp = 0; for (const q of pts) if (q.y > crown - 0.09 && q.y < crown - 0.04 && Math.abs(q.z - cz) < 0.14 && Math.abs(q.x - cx) < 0.14) { hw = Math.max(hw, Math.abs(q.x - cx)); hdp = Math.max(hdp, Math.abs(q.z - cz)); }
    const R = Math.min(0.1, Math.max(0.07, hw || 0.085)), DZ = Math.min(1.25, Math.max(1.0, (hdp || R) / R));
    const cylG = (r0, r1, h, n = 12) => new THREE.CylinderGeometry(r0, r1, h, n);
    // LOW cap (user rule: never a tall block): short band, crown flaring wide to an almost flat top, long peak
    const band = L.mesh(cylG(R * 1.04, R * 1.04, 0.024), mBlk, 0, 0.012, 0, capG);
    const crownM = L.mesh(cylG(R * 1.34, R * 1.05, 0.026), mNavy, 0, 0.037, 0, capG);
    const dome = L.mesh(new THREE.SphereGeometry(R * 1.34, 12, 4, 0, Math.PI * 2, 0, Math.PI / 2), mNavy, 0, 0.05, 0, capG); dome.scale.y = 0.08;
    for (const m of [band, crownM, dome]) m.scale.z = DZ;
    L.mesh(cylG(R * 1.045, R * 1.045, 0.005), mGold, 0, 0.022, 0, capG).scale.z = DZ;                // thin gold cord above the band
    const visor = L.mesh(new THREE.CylinderGeometry(R * 1.02, R * 1.02, 0.008, 12, 1, false, -Math.PI / 2, Math.PI), mBlk, 0, 0.004, R * DZ * 0.62, capG);
    visor.scale.z = 0.9; visor.rotation.x = 0.32;                                                      // half-disc peak, tipped down
    // small round gold cap badge (disc + darker star-ish centre), facing forward on the flared crown front
    const cb = L.mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.004, 10), mGold, 0, 0.036, R * 1.2 * DZ + 0.002, capG); cb.rotation.x = Math.PI / 2 + 0.55;
    L.mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.002, 5), lam(null, 0x8a6a20), 0, 0.003, 0, cb);
    const capC = V(cx, crown - 0.042, cz);
    attachAt(cop.head, capG, new THREE.Matrix4().makeBasis(V(1, 0, 0), V(0, 1, 0), V(0, 0, 1)).setPosition(capC));
    const mEye = L.basic(null, 0xf4f4ee);
    for (const s of [-1, 1]) { const ey = noseY + 0.03, ex = hd.x + s * 0.032, ez = frontAt(ex, ey, 0.012); L.mesh(new THREE.PlaneGeometry(0.026, 0.014), mEye, s * 0.032, 0, 0, eyes).userData.z = ez; }
    { const ez = Math.max(frontAt(hd.x + 0.032, noseY + 0.03, 0.012), frontAt(hd.x - 0.032, noseY + 0.03, 0.012));
      attachAt(cop.head, eyes, new THREE.Matrix4().makeBasis(V(1, 0, 0), V(0, 1, 0), V(0, 0, 1)).setPosition(V(hd.x, noseY + 0.03, ez + 0.004))); }
    const sp = cop.bone(/Spine2$/), s2 = sp.getWorldPosition(V());
    const by = s2.y + 0.04, bxL = s2.x + 0.085, bxR = s2.x - 0.085;
    const zL = frontAt(bxL, by + 0.03, 0.03), zR = frontAt(bxR, by, 0.03);
    const plate = L.plane(0.1, 0.026, L.basic(tPlate), 0, 0, 0, null); const shield = L.plane(0.06, 0.06, L.basic(tShield, 0xffffff, { alphaTest: 0.5 }), 0, 0, 0, null);
    const gp = new THREE.Group(); gp.add(plate); const gs = new THREE.Group(); gs.add(shield);
    attachAt(sp, gp, new THREE.Matrix4().makeTranslation(s2.x - (bxL - s2.x), by, Math.max(zL, zR) + 0.02));
    attachAt(sp, gs, new THREE.Matrix4().makeTranslation(bxL, by + 0.035, Math.max(zL, zR) + 0.02));
    badge.userData.plate = plate; BADGE_LOCAL = V(bxR, by, zR + 0.012);
    void BADGE_LOCAL;
  }

  // ---------- Ava ----------
  const ch = L.hero(); scene.add(ch.root);
  const palm = (clip, x) => { ch.root.position.set(0, 0, 0); ch.root.rotation.set(0, 0, 0); ch.pose(0, L.still(clip, x)); ch.root.updateMatrixWorld(true); return ch.hand('R').localToWorld(V(0, 0.78, 0)); };
  const KEY = palm('turn_key', 15 / 30);
  const LOCK = V(GX + 0.03, KEY.y, GZ - 0.075);
  const AVA02 = V(LOCK.x - KEY.x, 0, LOCK.z - KEY.z);
  // padlock: keyway at her palm; chain = oval steel links looped round the two meeting stiles (+ the next bar), both end links
  // through the shackle, a short tail hanging beside the lock
  padlock.position.set(LOCK.x, LOCK.y + 0.062, GZ - 0.045);
  { const mC = lam(null, 0x80868e), lg = new THREE.TorusGeometry(0.009, 0.0026, 4, 10); lg.scale(1.5, 1, 1);
    const PY = padlock.position.y, F = V(LOCK.x, PY + 0.074, GZ - 0.045), C0 = V(GX + 0.025, F.y, GZ), RX = 0.13, RZ = 0.045;
    const link = (p, x, z) => { x = x.clone().normalize(); z = z.clone().sub(x.clone().multiplyScalar(z.dot(x))).normalize(); const y = z.clone().cross(x);
      const m = new THREE.Mesh(lg, mC); m.position.copy(p); m.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z)); chain.add(m); };
    const ell = (a) => V(C0.x + RX * Math.sin(a), F.y, C0.z - RZ * Math.cos(a));
    const a0 = Math.asin((F.x - C0.x) / RX), N = 22, UPV = V(0, 1, 0);
    for (let i = 0; i < N; i++) { const a = a0 + 0.22 + (i / (N - 1)) * (Math.PI * 2 - 0.44), t = ell(a + 0.01).sub(ell(a - 0.01)); link(ell(a), t, i % 2 === 0 ? UPV : UPV.clone().cross(t)); }
    // the two end links hang on the shackle bow (the bow passes through their openings), tilted up toward the loop
    for (const s of [-1, 1]) link(V(F.x + s * 0.008, PY + 0.061, F.z), V(s * 0.25, 1, 0), V(1, 0, 0));
  }

  // ---------- state ----------
  // every update() sets the WHOLE state. lit = fluorescent rows on; lamp = desk lamp; em = emergency light (backup power);
  // barr = benches (0 by the wall, 1 = A at the doors + B free at benchZ, 2 = both at the doors); horde = zombies standing outside;
  // k9a = K-9 door opening angle; doorsOpen = front leaves open (09); radio = 0 off / 1 on (LED + dial)
  // lift = moonlight/streetlight through the glass + lifted shadows for the dark-lobby shots (like the approved short)
  function setState({ hero = true, zs = false, copOn = false, lit = 0, padOpen = false, lamp = true, em = false, barr = 0, benchZ, horde = 0, dogOn = false, k9a = 0, doorsOpen = 0, radio = 0, lift = 0 } = {}) {
    setState2(lift);
    ch.root.visible = hero; ch.root.rotation.set(0, 0, 0); ch.root.position.set(0, 0, 0);
    ZS.forEach((z) => { z.wrap.visible = zs; }); xZone.visible = false; cop.wrap.visible = copOn; eyes.visible = false;
    HD.forEach((z, i) => { z.wrap.visible = i < horde; });
    padSet(padOpen ? 0 : 1); padKey.visible = false; padKey.rotation.set(0, 0, 0);
    for (const g of glassGroups) { g.g.position.copy(g.base); g.g.rotation.set(0, 0, 0); g.g.visible = true; }
    if (doorsOpen) glassGroups.slice(0, 2).forEach((g, i) => { const s = i ? 1 : -1, hx = s * 0.9, a = s * doorsOpen;
      g.g.rotation.y = a; g.g.position.set(hx + (g.base.x - hx) * Math.cos(a), 0, -(g.base.x - hx) * Math.sin(a)); });
    copSkin.forEach((m) => m.color.set(0xffffff)); flash.intensity = 0; top.intensity = 0; top.color.set(0xffffff); top.distance = 4; steamG.visible = false;
    dropMeshes.forEach((m) => { m.visible = true; }); fill.intensity = 0.45; mGlass.opacity = 0.13; mGlass.map = tGlass;
    setBenches(barr, benchZ); k9Leaf.rotation.y = -k9a; k9Leaf.position.x = 0;
    dog.root.visible = dogOn; shards.visible = false; cold.visible = false;
    emHeads.forEach((m) => m.material.color.set(em ? 0xfff0c8 : 0x4a4a46)); emL.intensity = em ? 7.0 : 0;
    radioSet(radio, 0);
    scene.background.set(BG);
    setLit(lit, lamp);
    if (lift) { hemi.intensity += 0.6 * lift; fill.intensity = 0.45 + 0.8 * lift; moon.intensity = 1 + 0.6 * lift; spill.material.opacity = 0.55 + 0.25 * lift; }
  }
  // lit: number of rows on; 0 = dark night lobby
  function setLit(lit, lamp = true) {
    const mask = Array.isArray(lit) ? lit : null; if (mask) lit = mask.filter(Boolean).length;
    rows.forEach((r, i) => { const on = mask ? mask[i] : lit > i; r.tubes.forEach((t) => { t.material = on ? r.mOn : tubeOff; }); r.pl.intensity = on ? 7 : 0; });
    const k = Math.min(1, lit / ROWS);
    hemi.color.set(0x7088c0).lerp(new THREE.Color(0xfff4e4), k); hemi.groundColor.set(0x2a2830).lerp(new THREE.Color(0x7a7262), k); hemi.intensity = 1.15 + 1.0 * k;
    spill.visible = k < 0.5; lampL.intensity = lamp ? 3.2 * (1 - k * 0.5) : 0; lampBulb.material.color.set(lamp ? 0xffe0a0 : 0x3a3428);
  }
  // only the glass shakes on hits/knocks (global s)
  function rattle(t, k = 1, hits = []) {
    let a = 0; for (const t0 of hits) { const d = t - t0; if (d >= 0 && d < 0.5) a += Math.exp(-d * 10) * Math.cos(d * 60); }
    for (const g of glassGroups) { g.g.position.z = g.base.z - 0.008 * k * g.k * a; g.g.rotation.x = 0.002 * k * g.k * a; }
    return a;
  }
  const pulse = (t, hits, w = 0.08) => { let p = 0; for (const h of hits) { const d = t - h; p = Math.max(p, Math.exp(-((d / w) ** 2))); } return p; };
  // zombie pressed on the glass at (x, yaw): pose near its best "hands forward" frame, palms slam on its hits
  // zombie pressed on the glass at (x, yaw), facing INTO the lobby (+z): idle body ~0.4 m behind the glass, both arms aimed
  // at the glass at shoulder height (the models' own hands, palms flattened by the clip plane); they slam on their hits
  const IDLE = ['Zombie_Idle', 'Zombie_Idle', 'Zombie_Idle'], IDT = [0.4, 1.3, 2.2];
  const armsOf = (z) => [z.hL, z.hR].map((h) => [h, h.parent, h.parent.parent]);
  ZS.forEach((z, i) => { z.wrap.position.set(0, 0, 0); z.wrap.rotation.y = 0; z.pose([[IDLE[i], IDT[i], 1]]); for (const [, f, a] of armsOf(z)) { f.userData.q0 = f.quaternion.clone(); a.userData.q0 = a.quaternion.clone(); } });
  function pressZ(i, x, yaw, t, hits, lt) {
    const z = ZS[i], p = pulse(t, hits);
    for (const [, f, a] of armsOf(z)) { f.quaternion.copy(f.userData.q0); a.quaternion.copy(a.userData.q0); }
    z.wrap.position.set(x, 0, -0.4 + 0.05 * p); z.wrap.rotation.y = yaw;
    z.pose([[IDLE[i], IDT[i], 1]]);
    for (const [h, f, a] of armsOf(z)) {
      const sh = a.getWorldPosition(V()), out = Math.sign(sh.x - x) || 1, k = h === z.hL ? 0 : 1;
      const tgt = V(sh.x + out * 0.12, sh.y + 0.08 + 0.05 * Math.sin(lt * 3 + i * 2 + k), -0.01 - 0.07 * (1 - p) - 0.03 * k * (1 - p));
      aimBone(a, h, tgt); aimBone(f, h, tgt);
    }
    z.wrap.updateMatrixWorld(true); void lt;
  }
  // cop knocking at x: right fist on the glass on each knock
  // rotate bone so that the direction bone->tip points at target (world), keeps the rest of the chain
  function aimBone(bone, tip, target) {
    const bp = bone.getWorldPosition(V()), cur = tip.getWorldPosition(V()).sub(bp).normalize(), want = target.clone().sub(bp).normalize();
    const qW = new THREE.Quaternion().setFromUnitVectors(cur, want), bw = bone.getWorldQuaternion(new THREE.Quaternion()), pw = bone.parent.getWorldQuaternion(new THREE.Quaternion());
    bone.quaternion.copy(pw.invert().multiply(qW.multiply(bw))); bone.updateMatrixWorld(true);
  }
  // cop knocking at x: idle body ~0.45 m behind the glass, right fist aimed at the glass at head height, taps on each knock
  function copKnock(x, t, hits, knock = true) {
    const p = pulse(t, hits, 0.06);
    const fore = cop.hR.parent, arm = fore.parent;
    if (!arm.userData.q0) { arm.userData.q0 = arm.quaternion.clone(); fore.userData.q0 = fore.quaternion.clone(); }
    arm.quaternion.copy(arm.userData.q0); fore.quaternion.copy(fore.userData.q0);   // undo last aim (the mixer skips unchanged tracks)
    if (!cop.head.userData.q0) cop.head.userData.q0 = cop.head.quaternion.clone(); cop.head.quaternion.copy(cop.head.userData.q0);   // undo copHeadTo
    cop.wrap.position.set(x, 0, -0.5); cop.wrap.rotation.y = KN.yaw;
    cop.pose([[KN.n, KN.t, 1]]);
    if (!knock) return;
    const hp = cop.head.getWorldPosition(V());
    const tgt = V(hp.x - 0.38, hp.y - 0.02, -0.03 - 0.1 * (1 - p));
    aimBone(arm, cop.hR, tgt); aimBone(fore, cop.hR, tgt); cop.wrap.updateMatrixWorld(true);
  }
  const cam = (fov) => new THREE.PerspectiveCamera(fov, LW / LH, 0.03, 60);
  const look = (c, p, t) => { c.position.copy(p); c.lookAt(t); c.updateMatrixWorld(); };
  const lerpV = (a, b, k) => a.clone().lerp(b, k);
  const vignette = (o, k = 0.4) => {
    const c = o.tctx, g = c.createRadialGradient(LW / 2, LH * 0.45, LH * 0.32, LW / 2, LH * 0.45, LH * 0.8);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${k})`); c.fillStyle = g; c.fillRect(0, 0, LW, LH);
  };
  const ov = (k) => (lt, dt, a, o) => vignette(o, k);
  // small diagram label: 1 px box, pixel text, thin line to the target
  const label = (o, text, x, y, col, tx, ty) => {
    const c = o.tctx, w = reWidth(text, 1) + 12, h = 15;
    c.strokeStyle = col; c.lineWidth = 1; c.beginPath(); c.moveTo(x + 0.5, y + (ty > y ? h / 2 : -h / 2) + 0.5); c.lineTo(tx + 0.5, ty + 0.5); c.stroke();
    c.fillStyle = col; c.fillRect(tx - 1, ty - 1, 3, 3);
    c.fillStyle = 'rgba(6,8,14,0.88)'; c.fillRect(Math.round(x - w / 2), Math.round(y - h / 2), w, h); c.strokeRect(Math.round(x - w / 2) + 0.5, Math.round(y - h / 2) + 0.5, w - 1, h - 1);
    reText(c, text, x, y, 1, col, { outline: null });
  };
  // big label: dark plate, 2 px border, RE font, pops in, optional line to a target; lines = string or [line1, line2]
  const bigLabel = (o, text, x, y, col, tx, ty, age, sc = 2) => {
    const lines = Array.isArray(text) ? text : [text];
    const c = o.tctx, k = age < 0.12 ? 0.6 + 0.4 * (age / 0.12) : 1, lh = sc * 9 + 4;
    const w = Math.round(Math.max(...lines.map((s) => reWidth(s, sc))) + 20), h = Math.round(lh * lines.length + 8);
    if (tx != null) { c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y + (ty > y ? h * k / 2 : -h * k / 2)); c.lineTo(tx, ty); c.stroke(); c.fillStyle = col; c.fillRect(tx - 3, ty - 3, 6, 6); }
    // box and text pop in TOGETHER (scaled as one; never an empty plate)
    c.save(); c.translate(x, y); c.scale(k, k);
    c.fillStyle = 'rgba(6,6,12,0.9)'; c.fillRect(-w / 2, -h / 2, w, h);
    c.fillStyle = col; c.fillRect(-w / 2, -h / 2, w, 2); c.fillRect(-w / 2, h / 2 - 2, w, 2); c.fillRect(-w / 2, -h / 2, 2, h); c.fillRect(w / 2 - 2, -h / 2, 2, h);
    lines.forEach((s, i) => reText(c, s, 0, (i - (lines.length - 1) / 2) * lh, sc, i === 0 || lines.length === 1 ? col : '#f0f0f0', { outline: '#000000' }));
    c.restore();
  };
  // RE-style zombie counter drawn ON the glass (screen pos of a glass point): skull plate + big number, pops on change
  const zCounter = (o, x, y, n, age) => {
    const c = o.tctx, k = age < 0.15 ? 1.35 - 0.35 * (age / 0.15) : 1, s = 4;
    // wide enough for OUTSIDE and a 2-digit number: skull 34 px + number + margins
    const nw = reWidth(String(n), s), w = Math.max(Math.ceil(reWidth('OUTSIDE', 1)) + 24, Math.ceil(nw) + 34 + 22), h = 74;
    x = Math.min(LW - 8 - w * 0.68, x);   // never past the right edge (also during the 1.35x pop)
    c.save(); c.translate(x, y); c.scale(k, k);
    c.fillStyle = 'rgba(8,4,4,0.82)'; c.fillRect(-w / 2, -h / 2, w, h);
    c.fillStyle = '#c8281e'; c.fillRect(-w / 2, -h / 2, w, 2); c.fillRect(-w / 2, h / 2 - 2, w, 2); c.fillRect(-w / 2, -h / 2, 2, h); c.fillRect(w / 2 - 2, -h / 2, 2, h);
    reText(c, 'OUTSIDE', 0, -h / 2 + 10, 1, '#e8a090', { outline: null });
    // little skull icon
    c.fillStyle = '#e8e0d0'; c.fillRect(-w / 2 + 10, -2, 16, 14); c.fillRect(-w / 2 + 12, 12, 12, 5); c.fillStyle = '#100808'; c.fillRect(-w / 2 + 12, 2, 5, 5); c.fillRect(-w / 2 + 19, 2, 5, 5); c.fillRect(-w / 2 + 17, 8, 2, 3);
    reText(c, String(n), 11, 11, s, age < 0.12 ? '#ffffff' : '#ff3a26', { outline: '#000000' });
    c.restore();
  };
  const angTo = (from, to) => Math.atan2(to.x - from.x, to.z - from.z);
  const voiceAmp = (t) => { let s = 0; for (let k = 0; k < 3; k++) { const c = TL.mouth[Math.floor(t * 15 + 1e-6) - k]; s += c === 'A' ? 1 : c === 'O' ? 0.8 : 0.08; } return s / 3; };
  const hexRGB = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mixHex = (a, b, k) => '#' + hexRGB(a).map((v, i) => Math.round(v + (hexRGB(b)[i] - v) * k).toString(16).padStart(2, '0')).join('');
  const fadeIn = (lt, t0, d = 0.12) => L.clamp01((lt - t0) / d);
  const T0 = ctx.T, LEN = (id) => A.endT(id) - T0[id];
  const out = {};

  // ---------- police radio ON the front desk (copied from rooms.js 05_radio): LED, green dial/LCD, glows when talking ----------
  const RW = 0.24, RH = 0.09, RD = 0.2, radio = new THREE.Group(); radio.position.set(-0.55, 1.14, 8.9); radio.rotation.y = Math.PI + 0.22; scene.add(radio);
  const tRFace = L.cvs(96, 36, (c, w, h) => {
    px(c, 0, 0, '#2c2e32', w, h); px(c, 0, 0, '#45484e', w, 2); px(c, 0, h - 2, '#141518', w, 2);
    px(c, 4, 4, '#18191c', 40, 28); for (let y = 6; y < 31; y += 3) for (let x = 6; x < 43; x += 3) px(c, x, y, '#050506', 2, 2); px(c, 4, 4, '#55585e', 40, 1);
    px(c, 50, 25, '#d8d8d0', 10, 1); px(c, 64, 25, '#d8d8d0', 6, 1); px(c, 76, 25, '#d8d8d0', 12, 1); px(c, 50, 3, '#c8c8c0', 18, 2);
  });
  const tRSide = L.cvs(32, 32, (c, w, h) => { const r = L.rng(373); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = r() * 12 - 6; px(c, x, y, rgb(58 + n, 60 + n, 64 + n)); } for (let k = 0; k < 6; k++) px(c, r() * w | 0, r() * h | 0, 'rgba(200,200,190,0.5)', 3, 1); });
  { const mBody = lam(tRSide), mFace = lam(tRFace);
    B(RW, RH, RD, [mBody, mBody, mBody, mBody, mFace, mBody], 0, RH / 2, -RD / 2, radio);
    B(RW + 0.012, 0.012, RD + 0.01, lam(null, 0x1e1f22), 0, RH + 0.003, -RD / 2, radio);
    for (const sx of [-1, 1]) B(0.02, 0.012, 0.02, lam(null, 0x101012), sx * (RW / 2 - 0.02), -0.004, -0.03, radio); }
  const lcdCv = document.createElement('canvas'); lcdCv.width = 48; lcdCv.height = 18;
  const lcdTex = L.canvasTex(lcdCv), lc = lcdCv.getContext('2d');
  L.plane(0.095, 0.036, L.basic(lcdTex), 0.045, 0.058, 0.0012, radio);
  B(0.103, 0.044, 0.004, lam(null, 0x111214), 0.045, 0.058, -0.0025, radio);
  { const mKnob = lam(null, 0x18181a), mCap = lam(null, 0xb8b8b0);
    for (const [x, r] of [[0.0, 0.011], [0.032, 0.009], [0.07, 0.012]]) { const k = cyl(r, r, 0.014, 8, mKnob, x + 0.005, 0.02, 0.007, radio); k.rotation.x = Math.PI / 2; B(0.002, r * 0.9, 0.002, mCap, x + 0.005, 0.02 + r * 0.45, 0.0145, radio); }
    cyl(0.007, 0.009, 0.02, 6, mKnob, 0.09, RH + 0.01, -0.17, radio);
    const ant = cyl(0.0025, 0.004, 0.36, 5, lam(null, 0x2a2a2c), 0.09, RH + 0.19, -0.17, radio); ant.rotation.z = -0.12; ant.rotation.x = -0.08;
    cyl(0.006, 0.006, 0.01, 6, lam(null, 0x1a1a1a), 0.11, RH + 0.37, -0.185, radio);
    const mic = new THREE.Group(); mic.position.set(-RW / 2 - 0.035, 0.06, -0.04); mic.rotation.z = 0.15; radio.add(mic);
    B(0.04, 0.07, 0.025, lam(null, 0x1a1a1c), 0, 0, 0, mic); B(0.012, 0.016, 0.006, lam(null, 0x4a4a4c), -0.022, -0.005, 0, mic);
    const pts = []; for (let i = 0; i <= 60; i++) { const u = i / 60; pts.push(V(-RW / 2 - 0.035 + 0.05 * Math.sin(u * 3), 0.025 - 0.02 * u + 0.008 * Math.sin(u * 60), -0.04 - 0.1 * u + 0.008 * Math.cos(u * 60))); }
    radio.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 0.003, 4), lam(null, 0x101012))); }
  const rLed = B(0.008, 0.008, 0.004, L.basic(null, 0xff2a1a), -0.075, 0.078, 0.002, radio);
  const rGlowTex = L.cvs(16, 16, (c) => { const g = c.createRadialGradient(8, 8, 0, 8, 8, 8); g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, 16, 16); });
  const rGlow = L.plane(0.05, 0.05, L.basic(rGlowTex, 0xff4a30, { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }), -0.075, 0.078, 0.006, radio);
  const lcdGlow = L.plane(0.2, 0.1, L.basic(rGlowTex, 0x40ff60, { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.6 }), 0.045, 0.058, 0.008, radio);
  const rTx = B(0.006, 0.006, 0.004, L.basic(null, 0x40ff50), -0.06, 0.078, 0.002, radio);
  const rLight = new THREE.PointLight(0x60ff70, 0, 1.6, 1.5); rLight.position.set(0, 0.07, 0.12); radio.add(rLight);
  const RADIO = radio.localToWorld(V(0, 0.05, 0)), RLCD = radio.localToWorld(V(0.045, 0.058, 0)), RSPK = radio.localToWorld(V(-0.05, 0.045, 0));
  /** radio state: on 0/1, talking amplitude follows the voice at global t; static = noise on the dial */
  function radioSet(on, t, { talk = true, stat = 0 } = {}) {
    const a = on && talk ? voiceAmp(t) : 0, q = L.q15(t);
    lc.fillStyle = on ? '#1e5a26' : '#0c1a0e'; lc.fillRect(0, 0, 48, 18);
    if (on) {
      lc.fillStyle = '#2a7a34'; lc.fillRect(0, 0, 48, 1);
      lc.fillStyle = '#9cff8a'; lc.font = 'bold 7px monospace'; lc.textBaseline = 'top'; lc.fillText('155.47', 2, 1);
      lc.fillStyle = '#6ae070'; lc.fillRect(36, 2, 2, 5); lc.fillRect(40, 3, 2, 4); lc.fillRect(44, 1, 2, 6);
      lc.fillStyle = '#c8ffb0'; let prev = 12; const R = L.rng(Math.floor(q * 15) + 9);
      for (let x = 1; x < 47; x++) {
        const v = Math.sin(x * 0.9 + q * 23) * 0.6 + Math.sin(x * 2.3 - q * 31) * 0.4 + (R() - 0.5) * 2.2 * stat, y = Math.max(8, Math.min(17, Math.round(12.5 + v * (0.6 + 4.2 * a + 2 * stat))));
        const lo = Math.min(y, prev), hi = Math.max(y, prev); lc.fillRect(x, lo, 1, hi - lo + 1); prev = y;
      }
    }
    lcdTex.needsUpdate = true;
    const blink = on && Math.floor(q * 2.5) % 2 === 0;
    rLed.material.color.set(on ? (blink ? 0xff2a1a : 0x8a140a) : 0x2a0806); rGlow.visible = blink;
    rTx.material.color.set(a > 0.4 ? 0x60ff60 : 0x14301a); lcdGlow.visible = !!on; lcdGlow.material.opacity = 0.35 + 0.5 * a;
    rLight.intensity = on ? 0.6 + 2.2 * a : 0;
  }
  // ---------- coffee mug with steam (desk, right of the papers) ----------
  const MUG = V(0.62, 1.14, 8.98);
  { const mm = lam(null, 0xd8d4c8); cyl(0.042, 0.038, 0.105, 9, mm, MUG.x, MUG.y + 0.052, MUG.z, scene); cyl(0.036, 0.036, 0.002, 9, lam(null, 0x2a1408), MUG.x, MUG.y + 0.1, MUG.z, scene);
    const hd = new THREE.Mesh(new THREE.TorusGeometry(0.028, 0.008, 4, 8), mm); hd.position.set(MUG.x + 0.045, MUG.y + 0.055, MUG.z); scene.add(hd);
    L.plane(0.05, 0.03, lam(L.cvs(8, 4, (c) => { c.fillStyle = '#1a2a6a'; c.fillRect(0, 0, 8, 4); c.fillStyle = '#e8c840'; c.fillRect(2, 1, 4, 2); })), MUG.x, MUG.y + 0.062, MUG.z - 0.0425, scene, Math.PI); }
  const tSteam = L.cvs(16, 32, (c) => { c.clearRect(0, 0, 16, 32); const r = L.rng(381); for (let k = 0; k < 40; k++) { const y = r() * 30, x = 8 + Math.sin(y * 0.35) * 3 + (r() - 0.5) * 3; c.fillStyle = `rgba(255,255,255,${0.25 + r() * 0.4})`; c.fillRect(x | 0, y | 0, 2, 2); } });
  const steamG = new THREE.Group(); scene.add(steamG);
  const steams = [0, 1, 2].map(() => L.plane(0.07, 0.14, L.basic(tSteam, 0xe8eef8, { transparent: true, depthWrite: false, opacity: 0.5, side: DS }), 0, 0, 0, steamG));
  function steam(t, camera) {
    steamG.visible = true;
    steams.forEach((p, i) => { const ph = ((t * 0.32 + i / 3) % 1 + 1) % 1, q = L.q15(ph * 3) / 3;
      p.position.set(MUG.x + Math.sin(t * 1.3 + i * 2) * 0.012, MUG.y + 0.16 + q * 0.2, MUG.z); p.quaternion.copy(camera.quaternion);
      p.material.opacity = 0.55 * Math.sin(Math.PI * ph); p.scale.set(1 + ph * 0.8, 1 + ph * 0.5, 1); });
  }
  // ---------- red X zone on the floor near the glass ----------
  const tX = L.cvs(64, 48, (c, w, h) => {
    c.clearRect(0, 0, w, h); c.strokeStyle = '#ff3a2a'; c.lineWidth = 2;
    for (let x = 2; x < w - 2; x += 6) { c.beginPath(); c.moveTo(x, 2); c.lineTo(Math.min(w - 2, x + 3), 2); c.moveTo(x, h - 2); c.lineTo(Math.min(w - 2, x + 3), h - 2); c.stroke(); }
    for (let y = 2; y < h - 2; y += 6) { c.beginPath(); c.moveTo(2, y); c.lineTo(2, Math.min(h - 2, y + 3)); c.moveTo(w - 2, y); c.lineTo(w - 2, Math.min(h - 2, y + 3)); c.stroke(); }
    c.lineWidth = 5; c.beginPath(); c.moveTo(12, 8); c.lineTo(w - 12, h - 8); c.moveTo(w - 12, 8); c.lineTo(12, h - 8); c.stroke();
  });
  const xZone = L.plane(4.4, 3.2, L.basic(tX, 0xffffff, { transparent: true, depthWrite: false, alphaTest: 0.2, polygonOffset: true, polygonOffsetFactor: -6, polygonOffsetUnits: -6 }), 0, 0.03, 1.9, scene, 0, -Math.PI / 2);
  // ---------- tempered pane breaking ALL AT ONCE into small cubes (18_glass_break): left side pane 1.2 x 3.0 ----------
  const SH_N = 0.05, SH_W = 1.2, SH_H = 3.0, SH_X = -1.6, SH_Y = 1.68, NX = Math.round(SH_W / SH_N), NY = Math.round(SH_H / SH_N), NS = NX * NY;
  const shards = new THREE.InstancedMesh(new THREE.BoxGeometry(SH_N * 0.92, SH_N * 0.92, 0.03), L.basic(null, 0xffffff, { transparent: true, opacity: 0.85 }), NS);
  shards.frustumCulled = false; scene.add(shards);
  const SHD = []; { const r = L.rng(391), col = new THREE.Color();
    for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
      const x0 = SH_X - SH_W / 2 + (i + 0.5) * SH_N, y0 = SH_Y - SH_H / 2 + (j + 0.5) * SH_N;
      const vx = (r() - 0.5) * 0.7, vy = (r() - 0.25) * 0.8, vz = 0.35 + r() * 1.5, d = r() * 0.04, y1 = 0.012 + r() * 0.02;
      const tl = (vy + Math.sqrt(vy * vy + 4 * 4.9 * (y0 - y1))) / 9.8;
      SHD.push({ x0, y0, vx, vy, vz, d, tl, y1, sx: r() * 12 - 6, sy: r() * 12 - 6, ry: r() * 6.28, sl: 0.15 + r() * 0.3 });
      col.setRGB(0.62 + r() * 0.3, 0.76 + r() * 0.2, 0.9 + r() * 0.1); shards.setColorAt(SHD.length - 1, col);
    } }
  const dummy = new THREE.Object3D();
  function breakPane(tau) {   // tau = s since the break (<0 = intact pane, cubes hidden)
    shards.visible = tau >= 0; glassGroups[2].g.visible = tau < 0; if (tau < 0) return;
    SHD.forEach((s, i) => {
      const u = Math.max(0, tau - s.d);
      if (u < s.tl) { dummy.position.set(s.x0 + s.vx * u, s.y0 + s.vy * u - 4.9 * u * u, s.vz * u); dummy.rotation.set(s.sx * u, s.sy * u, 0); }
      else { const sl = Math.min(s.sl, (u - s.tl) * 0.8); dummy.position.set(s.x0 + s.vx * (s.tl + sl), s.y1, s.vz * (s.tl + sl)); dummy.rotation.set(-Math.PI / 2, 0, s.ry); }
      dummy.updateMatrix(); shards.setMatrixAt(i, dummy.matrix);
    });
    shards.instanceMatrix.needsUpdate = true;
  }
  const cold = new THREE.DirectionalLight(0x9ac8ff, 0); cold.position.set(-1, 3, 4); cold.target.position.set(-1.5, 1, 0); scene.add(cold, cold.target);
  // ---------- the horde: 20 city zombies standing in the rain (slots 0-2 = the first three) ----------
  const SLOTS = [[-1.25, -2.7, 0.22], [0.55, -3.5, -0.08], [1.95, -2.5, -0.32], [-2.6, -3.9, 0.36], [-0.55, -4.7, 0.08], [1.25, -5.2, -0.14], [3.0, -4.1, -0.45], [-3.7, -2.6, 0.55]];
  { const r = L.rng(401); for (let k = 0; k < 12; k++) SLOTS.push([(k % 6 - 2.5) * 1.35 + (r() - 0.5) * 0.5, -1.7 - (k < 6 ? 0.0 : 4.6) - r() * 1.4, (r() - 0.5) * 0.6]); }
  const TINTS = [0xb8c0d8, 0xffffff, 0xd8c890, 0xa8b8a0, 0xe0b0a0, 0x9aa8c8, 0xc8c8c8, 0xd0d8b0];
  const HD = [];
  { const r = L.rng(402); for (let k = 0; k < 30; k++) SLOTS.push([(k % 10 - 4.5) * 1.05 + (Math.floor(k / 10) % 2) * 0.5 + (r() - 0.5) * 0.4, -3.7 - Math.floor(k / 10) * 1.05 - r() * 0.4, (r() - 0.5) * 0.7]); }   // 20 -> 50 (58b)
  for (let i = 0; i < 50; i++) HD.push(await makeZ('city-zombie', 1.72 + (i * 7 % 5) * 0.035, cityMat(zTex), TINTS[i % TINTS.length]));
  /** horde: n visible; arr[i] = arrival time (global) for slots that walk in from the side; standing idle otherwise */
  function horde(t, n, arr = []) {
    HD.forEach((z, i) => {
      if (i >= n) { z.wrap.visible = false; return; }
      const [x, zz, yaw] = SLOTS[i], ta = arr[i];
      let k = 1; if (ta != null) k = L.smooth((t - (ta - 1.15)) / 1.1);
      z.wrap.visible = ta == null || t > ta - 1.15;
      const side = x < 0.3 ? -1 : 1, sx = x + side * (4.8 + (i % 3) * 0.6);
      z.wrap.position.set(sx + (x - sx) * k, 0, zz); z.wrap.rotation.y = k < 1 ? -side * Math.PI / 2 * (1 - k * 0.6) : yaw;
      if (k < 1) z.pose([['Walking', t * 1.6 + i * 0.37, 1]]); else z.pose([[i % 2 ? 'Zombie_Idle2' : 'Zombie_Idle', L.q15(t) * 0.6 + i * 0.83, 1]]);
    });
  }
  // ---------- Ribbon (sets/dog.js by another agent; grey box placeholder if it is missing) ----------
  let dog;
  try { const m = await import('./dog.js'); dog = await m.loadDog(L); }
  catch (e) {
    console.warn('hall: dog.js unavailable, placeholder dog (' + e + ')');
    const g = new THREE.Group(), mG = lam(null, 0x6a6460); B(0.3, 0.3, 0.8, mG, 0, 0.5, 0, g); B(0.2, 0.22, 0.28, mG, 0, 0.72, 0.48, g);
    for (const [x, z] of [[-0.1, 0.3], [0.1, 0.3], [-0.1, -0.3], [0.1, -0.3]]) B(0.07, 0.36, 0.07, mG, x, 0.18, z, g);
    dog = { root: g, update() {} };
  }
  scene.add(dog.root);
  // undo-able raise of the cop's knocking fist: k = 0 hand down .. 1 fist on the glass
  function copRaise(x, k) {
    copKnock(x, 0, [], false);
    const fore = cop.hR.parent, arm = fore.parent, hp = cop.head.getWorldPosition(V()), rest = cop.hR.getWorldPosition(V());
    const tgt = rest.lerp(V(hp.x - 0.3, hp.y + 0.02, -0.08), k);
    if (k > 0) { aimBone(arm, cop.hR, tgt); aimBone(fore, cop.hR, tgt); cop.wrap.updateMatrixWorld(true); }
  }
  // ================================= round 2 builds =================================
  // ---------- FIRST-FLOOR CORRIDOR (10b), built off to the side at x = 40: z 0..16, 2 m wide, 3 m high, lit ----------
  const FX = 40, FL = 16, FHt = 3;
  const wseg = (a0, a1, y0, y1, xw, ry) => { const w = a1 - a0, h = y1 - y0, g = new THREE.PlaneGeometry(w, h), uv = g.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (a0 + uv.getX(i) * w) / 2, (y0 + uv.getY(i) * h) / HC);
    const m = L.mesh(g, mW, xw, (y0 + y1) / 2, (a0 + a1) / 2, scene); m.rotation.y = ry; return m; };
  const DCZ = 3.8, DW = 0.76, DH = 2.05;   // closet door (left wall) has a real opening
  wseg(0, DCZ - DW / 2, 0, FHt, FX - 1, Math.PI / 2); wseg(DCZ + DW / 2, FL, 0, FHt, FX - 1, Math.PI / 2); wseg(DCZ - DW / 2, DCZ + DW / 2, DH, FHt, FX - 1, Math.PI / 2);
  wseg(0, FL, 0, FHt, FX + 1, -Math.PI / 2);
  L.plane(2, FL, lam(L.rep(tFloor, 2 / 1.2, FL / 1.2)), FX, 0, FL / 2, scene, 0, -Math.PI / 2);
  L.plane(2, FL, lam(L.rep(tCeil, 2 / 1.2, FL / 1.2)), FX, FHt, FL / 2, scene, 0, Math.PI / 2);
  L.plane(2, FHt, lam(tWall), FX, FHt / 2, 0, scene, 0); L.plane(2, FHt, lam(tWall), FX, FHt / 2, FL, scene, Math.PI);
  L.plane(0.7, 0.9, L.basic(L.cvs(16, 20, (c) => { px(c, 0, 0, '#1a2440', 16, 20); px(c, 7, 0, '#2a2020', 2, 20); px(c, 0, 9, '#2a2020', 16, 2); px(c, 3, 3, '#e8c060', 1, 1); px(c, 12, 14, '#e8c060', 1, 1); })), FX, 1.65, 0.01, scene, 0);
  for (const s of [-1, 1]) B(0.04, 0.12, FL, lam(null, 0x2a1a0c), FX + s * 0.98, 0.06, FL / 2, scene);
  const fcDoor = (z, closet) => {   // door on the left wall; hinge at z + DW/2, leaf extends to -z, opens into the corridor
    for (const e of [-1, 1]) B(0.07, DH + 0.06, 0.07, lam(null, 0x3a2210), FX - 0.98, (DH + 0.06) / 2, z + e * (DW / 2 + 0.035), scene);
    B(0.07, 0.07, DW + 0.14, lam(null, 0x3a2210), FX - 0.98, DH + 0.03, z, scene);
    const sg = closet ? -1 : 1, hg = new THREE.Group(); hg.position.set(FX - 1 + (closet ? 0.02 : 0.03), 0, z + sg * DW / 2); scene.add(hg);   // closet: hinge on the far (-z) side, opens toward +x/+z
    B(0.04, DH, DW, lam(tDoorW), 0, DH / 2, -sg * DW / 2, hg); B(0.06, 0.04, 0.1, mBrass, 0.04, 1.0, -sg * (DW - 0.09), hg);
    L.plane(0.22, 0.07, lam(L.cvs(32, 10, (c) => { px(c, 0, 0, '#d8d0b0', 32, 10); c.fillStyle = '#202020'; c.font = 'bold 7px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(closet ? 'JAN.' : z > 5 ? '104' : '105', 16, 5); })), 0.025, 1.6, -sg * DW / 2, hg, Math.PI / 2);
    return hg; };
  const doorA = fcDoor(5.6), doorB = fcDoor(4.7), closetLeaf = fcDoor(DCZ, true);
  { const ix = FX - 1.55;   // janitor closet: shelves, mop, bucket
    L.plane(0.8, DH, lam(null, 0x3a3a34), ix, DH / 2, DCZ, scene, Math.PI / 2);
    for (const s of [-1, 1]) L.plane(0.55, DH, lam(null, 0x34342e), FX - 1.27, DH / 2, DCZ + s * DW / 2, scene, s < 0 ? 0 : Math.PI);
    L.plane(0.55, DW, lam(null, 0x2a2a26), FX - 1.27, 0.002, DCZ, scene, Math.PI / 2, -Math.PI / 2);
    L.plane(0.55, DW, lam(null, 0x1a1a18), FX - 1.27, DH, DCZ, scene, Math.PI / 2, Math.PI / 2);
    const mop = cyl(0.012, 0.012, 1.4, 5, lam(null, 0xb08850), ix + 0.25, 0.75, DCZ - 0.15, scene); mop.rotation.z = -0.25;
    cyl(0.09, 0.05, 0.14, 6, lam(null, 0xd8d0c0), ix + 0.08, 0.07, DCZ - 0.15, scene);
    cyl(0.13, 0.11, 0.26, 8, lam(null, 0xe0b020), ix + 0.18, 0.13, DCZ + 0.17, scene);
    B(0.3, 0.02, 0.6, lam(null, 0x5a4a3a), ix + 0.15, 1.35, DCZ, scene); B(0.06, 0.18, 0.06, lam(null, 0x3a8adf), ix + 0.12, 1.45, DCZ - 0.1, scene); B(0.06, 0.14, 0.06, lam(null, 0xe04040), ix + 0.12, 1.43, DCZ + 0.05, scene); }
  const fcRows = [];
  for (const z of [2.2, 5.4, 8.6, 11.8, 15]) { B(0.36, 0.06, 1.3, lam(null, 0xb8b8b0), FX, FHt - 0.03, z, scene); fcRows.push(B(0.26, 0.02, 1.2, tubeOff, FX, FHt - 0.07, z, scene)); }
  const fcTubeOn = L.basic(null, 0xf8fbff);
  const fcL = [3.0, 8.6, 13.5].map((z) => { const p = new THREE.PointLight(0xfff2e0, 0, 9, 1); p.position.set(FX, FHt - 0.5, z); scene.add(p); return p; });
  const fcLights = (on) => { fcRows.forEach((m) => { m.material = on ? fcTubeOn : tubeOff; }); fcL.forEach((p) => { p.intensity = on ? 5.5 : 0; }); };
  { const ex = new THREE.Group(); ex.position.set(FX + 0.95, 0, 6.8); ex.rotation.y = -Math.PI / 2; scene.add(ex); cyl(0.075, 0.075, 0.48, 10, lam(tExt), 0, 0.95, 0, ex); }
  { B(0.04, 0.8, 1.2, lam(null, 0x3a2210), FX + 0.97, 1.75, 11.6, scene); L.plane(1.12, 0.72, lam(tCork), FX + 0.95, 1.75, 11.6, scene, -Math.PI / 2); }
  herb(FX - 0.7, 0.4, '#3aa03a', '#1e6a1e');
  // office desk against the right wall with the WORLD'S OKAYEST COP mug
  const MUG2 = V(FX + 0.6, 0.76, 1.3);
  { const g = new THREE.Group(); g.position.set(FX + 0.68, 0, 1.3); scene.add(g);
    B(0.6, 0.04, 1.2, mTop, 0, 0.74, 0, g); B(0.56, 0.7, 0.04, lam(tWood), 0, 0.37, -0.56, g); B(0.56, 0.7, 0.04, lam(tWood), 0, 0.37, 0.56, g);
    for (let k = 0; k < 3; k++) { const p = B(0.22, 0.006, 0.3, lam(tPaper), -0.05 + k * 0.02, 0.763 + k * 0.006, 0.32, g); p.rotation.y = 0.15 * k - 0.1; }
    cyl(0.035, 0.03, 0.1, 8, lam(null, 0x2a2a30), 0.05, 0.81, -0.35, g); for (let k = 0; k < 3; k++) { const pn = cyl(0.004, 0.004, 0.14, 4, lam(null, k ? 0x2040c0 : 0xd0a020), 0.05 + (k - 1) * 0.012, 0.88, -0.35, g); pn.rotation.z = (k - 1) * 0.15; }
    B(0.2, 0.05, 0.03, lam(L.cvs(32, 8, (c) => { px(c, 0, 0, '#6a5420', 32, 8); px(c, 1, 1, '#d8bc60', 30, 6); c.fillStyle = '#141008'; c.font = 'bold 6px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('SGT.', 16, 4); })), -0.12, 0.785, -0.42, g).rotation.y = -Math.PI / 2;
    cyl(0.1, 0.12, 0.02, 8, lam(null, 0x2a4a2a), 0.12, 0.75, 0.0, g); }
  const tMug = L.cvs(192, 48, (c, w, h) => { px(c, 0, 0, '#ece8de', w, h); px(c, 0, 0, '#c8c4b8', w, 2); px(c, 0, h - 3, '#c8c4b8', w, 3);
    reText(c, "WORLD'S", w / 2, 11, 1, '#1a2a6a', { outline: null }); reText(c, 'OKAYEST', w / 2, 23, 1, '#c8281e', { outline: null }); reText(c, 'COP', w / 2, 35, 1, '#1a2a6a', { outline: null });
    px(c, w / 2 - 40, 18, '#d8b040', 6, 8); px(c, w / 2 + 34, 18, '#d8b040', 6, 8); });
  const mug2 = new THREE.Group(); mug2.position.copy(MUG2); mug2.rotation.y = Math.PI / 2 - 0.2; scene.add(mug2);
  { const mm = lam(null, 0xe8e4dc); L.mesh(new THREE.CylinderGeometry(0.05, 0.046, 0.11, 18, 1, true), lam(tMug, 0xffffff, { side: DS }), 0, 0.055, 0, mug2);
    L.mesh(new THREE.CircleGeometry(0.046, 12), lam(null, 0x2a1408), 0, 0.098, 0, mug2).rotation.x = -Math.PI / 2;
    L.mesh(new THREE.CircleGeometry(0.046, 12), mm, 0, 0.001, 0, mug2).rotation.x = -Math.PI / 2;
    const hd = new THREE.Mesh(new THREE.TorusGeometry(0.032, 0.009, 4, 8), mm); hd.position.set(0.055, 0.058, 0); mug2.add(hd); }
  // ---------- props that follow Ava's hands (cell phone, flashlight, notepad) ----------
  const cell = new THREE.Group(); scene.add(cell);
  B(0.07, 0.135, 0.012, lam(null, 0x141418), 0, 0, 0, cell); const cellScr = L.plane(0.06, 0.11, L.basic(null, 0x9ad0ff), 0, 0.004, 0.0065, cell);
  const cellL = new THREE.PointLight(0xa8d0ff, 0, 1.4, 1.5); scene.add(cellL);
  const torch = new THREE.Group(); scene.add(torch);
  { const r = cyl(0.018, 0.018, 0.17, 8, lam(null, 0x1a1a1c), 0, 0, 0, torch); r.rotation.x = Math.PI / 2; const hd = cyl(0.028, 0.02, 0.05, 8, lam(null, 0x2a2a2e), 0, 0, 0.1, torch); hd.rotation.x = Math.PI / 2;
    L.mesh(new THREE.CircleGeometry(0.024, 8), lam(null, 0x8a9098), 0, 0, 0.126, torch); }
  const pad = new THREE.Group(); scene.add(pad);
  B(0.085, 0.115, 0.008, lam(tPaper), 0, 0, 0, pad); B(0.085, 0.012, 0.012, lam(null, 0x9a2020), 0, 0.058, 0, pad);
  const pencil = cyl(0.004, 0.004, 0.12, 5, lam(null, 0xe0b020), 0.03, 0.0, 0.02, pad); pencil.rotation.z = 0.6;
  // 43d: a 3D phone parented to Ava's right hand bone (66 x 122 x 11 mm, screen = +z face, long axis +y): its back rests on the
  // palm of her REAL hand mesh (black fingerless glove); no added finger boxes. Screen = canvas (drawPhone).
  const hPhone = new THREE.Group();
  const phCv = document.createElement('canvas'); phCv.width = 124; phCv.height = 224; const phTex = L.canvasTex(phCv);
  B(0.066, 0.122, 0.011, lam(null, 0x1a1a20), 0, 0, 0, hPhone);
  L.plane(0.066, 0.122, L.basic(phTex), 0, 0, 0.0056, hPhone);
  const PS = 1;   // palm side of the hand bone = its -z face (checked from the side: the phone rests on the palm, no gap)
  const HOFF = [-0.25, 0.55, -0.5 * PS];   // phone centre in Hand.R space: back on the palm, her real fingers show along its left edge
  L.holdIn(ch, hPhone, 'R', HOFF, [0, PS > 0 ? Math.PI : 0, 0]); hPhone.visible = false;
  // procedural right arm (on top of the clip): phone centre at PT with its screen facing `eye`, text upright; undone in setState2
  const UAR = ch.bone.getObjectByName('UpperArmR'), FAR = ch.bone.getObjectByName('ForearmR'), HAR = ch.hand('R');
  let armSaved = null;
  const armB = (s) => [ch.bone.getObjectByName('UpperArm' + s), ch.bone.getObjectByName('Forearm' + s), ch.hand(s)];
  const saveArm = (s) => { armSaved = armSaved || []; for (const b of armB(s)) if (!armSaved.some(([x]) => x === b)) armSaved.push([b, b.quaternion.clone()]); };
  // two-bone reach (CCD) of the wrist to a world point, blended over the clip by w (0..1); undone in setState2
  function reachTo(s, target, w) {
    if (!(w > 0)) return; saveArm(s); ch.root.updateMatrixWorld(true);
    const [ua, fa, hd] = armB(s), q0 = [ua.quaternion.clone(), fa.quaternion.clone()];
    for (let i = 0; i < 10; i++) { aimBone(fa, hd, target); aimBone(ua, hd, target); }
    if (w < 1) { ua.quaternion.copy(q0[0].slerp(ua.quaternion, w)); fa.quaternion.copy(q0[1].slerp(fa.quaternion, w)); ch.root.updateMatrixWorld(true); }
  }
  function holdPhoneAt(PT, eye) {
    saveArm('R');
    ch.root.updateMatrixWorld(true);
    const N = eye.clone().sub(PT).normalize(), y = V(0, 0, 1).addScaledVector(N, -N.z).normalize(), z = N.clone().multiplyScalar(-PS), x = y.clone().cross(z);
    const Q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
    const wrist = PT.clone().sub(V(...HOFF).multiplyScalar(L.S).applyQuaternion(Q));
    for (let i = 0; i < 10; i++) { aimBone(FAR, HAR, wrist); aimBone(UAR, HAR, wrist); }
    const pw = HAR.parent.getWorldQuaternion(new THREE.Quaternion()); HAR.quaternion.copy(pw.invert().multiply(Q)); HAR.updateMatrixWorld(true);
    return y;
  }
  // 3D phone screen (124 x 224): BIG text so it reads in the close-up: MOM, SAFE bubble, Delivered, typing field
  function phoneScreen(st) {
    const c = phCv.getContext('2d'), R = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
    R(0, 0, 124, 224, '#050508'); R(4, 4, 116, 216, '#0e1626');
    for (let i = 0; i < 4; i++) R(10 + i * 6, 18 - (i + 1) * 3, 4, (i + 1) * 3, i < st.bars ? '#ffd23f' : '#2c3448');
    R(96, 10, 16, 8, '#8a9ab8'); R(98, 12, 5, 4, '#e04030');
    R(4, 24, 116, 26, '#16223a'); R(10, 29, 16, 16, '#ff7a9a'); reText(c, 'MOM', 66, 37, 2, '#e8ecff', { outline: null });
    if (st.sent) { const k = Math.min(1, st.sentAge / 0.12), w = Math.round(100 * k); R(114 - w, 62, w, 40, '#2a7aff'); if (k >= 1) reText(c, 'SAFE', 64, 82, 3, '#ffffff', { outline: null }); }
    if (st.deliv) reText(c, 'Delivered', 62, 120, 2, '#8cff5a', { outline: null });
    R(8, 178, 108, 28, '#1c2840'); R(8, 178, 108, 2, '#3a4a6a');
    const tx = st.sent ? '' : 'SAFE'.slice(0, st.typed), tw = tx ? reWidth(tx, 2) : 0;
    if (tx) reText(c, tx, 14 + tw / 2, 192, 2, '#ffffff', { outline: null });
    if (!st.sent && st.cursor) R(16 + tw, 184, 2, 16, '#ffffff');
    phTex.needsUpdate = true;
  }
  const follow = (obj, side, off = [0, 0.8, 0], rot = [0, 0, 0]) => {
    ch.root.updateMatrixWorld(true); const h = ch.hand(side);
    obj.position.copy(h.localToWorld(V(...off))); obj.quaternion.copy(h.getWorldQuaternion(new THREE.Quaternion()).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot)))); obj.visible = true; };
  const CLOCK0 = clock.position.clone();
  // resets every round-2 piece (called at the top of setState)
  function setState2() {
    moon.intensity = 1; spill.material.opacity = 0.55;
    clock.position.copy(CLOCK0); clock.rotation.set(0, Math.PI, 0); clock.scale.setScalar(1);
    if (armSaved) { armSaved.forEach(([b, q]) => b.quaternion.copy(q)); armSaved = null; }
    recvHome(); cell.visible = false; hPhone.visible = false; torch.visible = false; pad.visible = false; cellL.intensity = 0;
    fcLights(false); shade.visible = false; hallL.intensity = 0; hallL.distance = 7; rGlow.scale.setScalar(1); lcdGlow.scale.setScalar(1);
    closetLeaf.rotation.y = 0; doorA.position.z = 5.6 + DW / 2; doorB.position.z = 4.7 + DW / 2;
  }
  // polyline walk: position + heading at arc length s
  const pathAt = (pts, s) => { for (let i = 0; i < pts.length - 1; i++) { const d = pts[i].distanceTo(pts[i + 1]); if (s <= d || i === pts.length - 2) { const k = Math.min(1, Math.max(0, s / d)); return { p: lerpV(pts[i], pts[i + 1], k), yaw: angTo(pts[i], pts[i + 1]) }; } s -= d; } };
  // cop's head turns (yaw) toward a world point; undone by copKnock()
  function copHeadTo(p, w = 1) {
    const hd = cop.head, hp = hd.getWorldPosition(V()), yaw = Math.max(-0.95, Math.min(0.95, Math.atan2(p.x - hp.x, p.z - hp.z))) * w;
    const q = new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), yaw), bw = hd.getWorldQuaternion(new THREE.Quaternion()), pw = hd.parent.getWorldQuaternion(new THREE.Quaternion());
    hd.quaternion.copy(pw.invert().multiply(q.multiply(bw))); cop.wrap.updateMatrixWorld(true);
  }
  // pixel cell phone (screen coords). mode 'bars': status only; 'chat': typed text / bubble / Delivered
  function drawPhone(o, x, y, s, st) {
    const c = o.tctx, R = (a, b, w, h, col) => { c.fillStyle = col; c.fillRect(x + a * s, y + b * s, w * s, h * s); };
    const W = 60, H = 110;
    R(-1, -1, W + 2, H + 2, '#050508'); R(0, 0, W, H, '#1c1c22'); R(1, 1, W - 2, 1, '#3a3a44'); R(4, 9, W - 8, H - 20, '#0e1626'); R(24, 4, 12, 1, '#3a3a44'); R(26, H - 7, 8, 3, '#2a2a32');
    // status bar: signal bars (1 of 4 lit), carrier, battery
    for (let i = 0; i < 4; i++) R(6 + i * 3, 16 - (i + 1) * 1.5, 2, (i + 1) * 1.5, i < st.bars ? (st.barFlash ? '#ffffff' : '#ffd23f') : '#2c3448');
    R(W - 14, 12, 8, 4, '#8a9ab8'); R(W - 6, 13, 1, 2, '#8a9ab8'); R(W - 13, 13, 3, 2, '#e04030');
    if (st.mode === 'bars') {
      reText(c, '12:01', x + 30 * s, y + 34 * s, s, '#e8ecff', { outline: null });
      R(10, 52, W - 20, 1, '#2c3448'); reText(c, 'CALLING', x + 30 * s, y + 62 * s, 1, '#9aa8d8', { outline: null });
      reText(c, 'BUSY', x + 30 * s, y + 76 * s, 1, st.busy ? '#ff5a40' : '#2c3448', { outline: null });
    } else {
      R(4, 20, W - 8, 12, '#16223a'); R(8, 22, 8, 8, '#ff7a9a'); reText(c, 'MOM', x + 34 * s, y + 26.5 * s, 1, '#e8ecff', { outline: null });
      if (st.sent) { const k = Math.min(1, st.sentAge / 0.12); R(W - 8 - 30 * k, 42, 30 * k, 12, '#2a7aff'); if (k >= 1) reText(c, 'SAFE', x + (W - 23) * s, y + 48 * s, 1, '#ffffff', { outline: null }); }
      if (st.deliv) reText(c, 'Delivered', x + (W - 24) * s, y + 60 * s, 1, '#9aa8c8', { outline: null });
      R(6, H - 24, W - 12, 11, '#1c2840'); R(6, H - 24, W - 12, 1, '#3a4a6a');
      const tx = st.sent ? '' : 'SAFE'.slice(0, st.typed); if (tx) reText(c, tx, x + (8 + reWidth(tx, 1) / (2 * s)) * s, y + (H - 18.5) * s, 1, '#ffffff', { outline: null });
      if (!st.sent && st.cursor) R(9 + reWidth(tx, 1) / s + 1, H - 22, 1, 7, '#ffffff');
    }
  }
  const lit6 = ROWS;
  // shot-local time of a global anchor
  const lo = (id, t) => t - T0[id];
  const ROWZ_ = rows.map((r) => r.pl.position.z);
  void ROWZ_;

  // ================================= HOOK (flash-forward, dark lobby, desk lamp) =================================
  // 02_gate: FIXED high corner (RE): she snaps the padlock on the gate (turn_key, click on "locked"), turns and crosses the frame
  { const id = '02_gate', c = cam(44), P = V(-0.2, 3.7, 10.4), TG = V(-2.9, 0.9, 12.3);
    const W1 = V(-0.9, 0, 10.55), tL = lo(id, A.lock02), tW = lo(id, A.walk02), dir = angTo(AVA02, W1), D = AVA02.distanceTo(W1);
    out[id] = { scene, camera: c, overlay: ov(0.38), update(lt, t) {
      setState({ padOpen: t < A.lock02, barr: 2 }); setRain(t); look(c, P, TG);
      padSet(L.smooth((lt - (tL - 0.1)) / 0.1)); padKey.visible = lt > tL - 0.3 && lt < tL + 0.35; padKey.rotation.y = -0.9 * L.smooth((lt - (tL - 0.3)) / 0.2);
      const walking = lt > tW, u = Math.max(0, lt - tW), d = Math.min(D, u * 1.05);
      ch.root.position.copy(AVA02).lerp(W1, d / D);
      const turn = L.smooth((lt - (tL + 0.35)) / 0.5); ch.root.rotation.y = dir * turn;
      ch.pose(lt, [L.seg('idle', -99, { loop: true }), L.seg('turn_key', tL - 0.5, { fade: 0.1 }), L.seg('idle', tL + 0.35, { loop: true, from: 0.4, fade: 0.25 }), L.seg('walk', tW, { loop: true, fade: 0.2 })],
        [[-99, 'open', 'neutral'], [tL - 0.1, 'half', 'neutral'], [tL + 0.05, 'happy', 'smile'], [tL + 0.6, 'open', mouthAt(t, 'smile')]]);
      void walking;
    } };
  }
  // 03_safe: frontal medium, hands on hips -> smug, LOOKS AT CAMERA, wink on "town"; counter + columns behind
  { const id = '03_safe', c = cam(36), P = V(0.55, 0, 5.3), tS = lo(id, A.smug03), tW = lo(id, A.wink03);
    out[id] = { scene, camera: c, overlay: ov(0.38), update(lt, t) {
      setState({ barr: 2 }); setRain(t);
      look(c, V(0.32, 1.42, 3.45 + lt * 0.03), V(0.22, 1.32, 5.3));
      ch.root.position.copy(P); ch.root.rotation.y = Math.PI;
      const eyes = lt > 0.55 && lt < 0.65 ? 'blink' : lt > tW && lt < tW + 0.6 ? 'wink' : lt > tS ? 'relaxed' : 'open';
      ch.pose(lt, [L.seg('hands_on_hips', 0, { from: 0.3, speed: 0.8 }), L.seg('smug', tS - 0.1, { from: 0.1, fade: 0.25 })], [[-99, eyes, mouthAt(t, lt > tS ? 'cat' : 'smile')]]);
      ch.lookAt(c, 1, 40);
    } };
  }
  // 04_isnt: reverse: glass doors from inside, 3 zombies with their own hands on the glass; only the glass shakes on each hit
  { const id = '04_isnt', c = cam(42), H = A.hits04, HZ = [[H[0], H[3]], [H[1], H[4]], [H[2]]].map((l) => l.filter((x) => x != null));
    out[id] = { scene, camera: c, overlay: ov(0.42), update(lt, t) {
      setState({ hero: false, zs: true, barr: 2 }); setRain(t); rattle(t, 1.2, H); fill.intensity = 1.4;
      pressZ(0, -0.6, 0.12, t, HZ[0], lt); pressZ(1, 0.02, -0.05, t, HZ[1], lt); pressZ(2, 0.7, -0.15, t, HZ[2], lt);
      look(c, V(0.05, 1.5, 3.4 - lt * 0.12), V(0.05, 1.36, 0));
    } };
  }
  // 06_hook_door: slow push-in to the glass doors; a silhouette in a police cap raises its fist (no hit)
  { const id = '06_hook_door', c = cam(40), [r0, r1] = A.raise06.map((x) => lo(id, x));
    out[id] = { scene, camera: c, overlay: ov(0.45), update(lt, t) {
      setState({ hero: false, copOn: true, barr: 2 }); setRain(t);
      copSkin.forEach((m) => m.color.set(0x30343c));
      copRaise(0.2, L.smooth((lt - r0) / Math.max(0.3, r1 - r0)));
      const k = L.smooth(lt / LEN(id));
      look(c, V(0.15, 1.52, 4.8 - 1.6 * k), V(0.18, 1.5, 0));
    } };
  }

  // ================================= 9:02 PM: lights still on =================================
  // 09_desk: FIXED high from behind the counter: empty desk, turned chair, coffee with steam (WARM on "warm"), front doors open
  { const id = '09_desk', c = cam(46), tW = lo(id, A.warm09);
    out[id] = { scene, camera: c, overlay(lt, dt, a, o) {
      vignette(o, 0.3);
      if (lt > tW) { const [tx, ty] = L.toScreen(c, MUG.x, MUG.y + 0.12, MUG.z); bigLabel(o, 'WARM', tx + 70, ty - 50, '#ffb040', tx + 6, ty - 4, lt - tW, 2); }
    }, update(lt, t) {
      setState({ hero: false, lit: lit6, doorsOpen: 1.25, radio: 0 }); setRain(t);
      look(c, V(1.55, 2.35, 10.7 - lt * 0.02), V(-0.05, 0.85, 5.0)); steam(t, c);
    } };
  }
  // 10_lock: Ava walks to the gate and chains it (turn_key); on "Click" close-up of the padlock snapping shut
  { const id = '10_lock', c = cam(42), W0 = V(-0.4, 0, 12.0), tL = lo(id, A.lock10), tC = lo(id, A.click10), tw0 = lo(id, A.walk10[0]), tw1 = lo(id, A.walk10[1]);
    const dir = angTo(W0, AVA02), tCU = tC - 0.4;
    out[id] = { scene, camera: c, overlay: ov(0.3), update(lt, t) {
      setState({ lit: lit6, padOpen: t < A.click10 }); setRain(t);
      padSet(L.smooth((lt - (tC - 0.1)) / 0.1)); padKey.visible = lt > tL + 0.4; padKey.rotation.y = -0.9 * L.smooth((lt - (tC - 0.35)) / 0.25);
      const k = L.smooth((lt - tw0) / (tw1 - tw0)); ch.root.position.copy(W0).lerp(AVA02, k);
      const tr = L.smooth((lt - tw1) / 0.4); ch.root.rotation.y = dir * (1 - tr);
      if (lt < tCU) {
        c.fov = 42; c.updateProjectionMatrix(); look(c, V(-1.3, 1.65, 9.7), V(-3.0, 1.15, 12.4));
        ch.pose(lt, [L.seg('idle', -99, { loop: true }), L.seg('walk', tw0, { loop: true, fade: 0.2 }), L.seg('idle', tw1, { loop: true, fade: 0.3 }), L.seg('turn_key', tL - 0.15, { fade: 0.12, speed: 0.6 })],
          [[-99, 'open', mouthAt(t, 'neutral')], [tL, 'half', 'neutral']]);
      } else {
        ch.pose(lt, L.still('turn_key', 15 / 30), [[-99, 'half', 'neutral']]);
        c.fov = 30; c.updateProjectionMatrix(); const kk = L.smooth((lt - tCU) / 2.5);
        const PL = padlock.position; look(c, V(PL.x + 0.34 - 0.05 * kk, PL.y + 0.12, PL.z - 0.19 + 0.02 * kk), V(PL.x, PL.y + 0.012, PL.z));
      }
    } };
  }
  // 11_desk_radio: push-in to the radio on the front desk: red LED + green dial come on at "radio"; static
  { const id = '11_desk_radio', c = cam(40), tR = lo(id, A.radio11);
    out[id] = { scene, camera: c, overlay: ov(0.35), update(lt, t) {
      setState({ hero: false, lit: lit6 }); setRain(t); steam(t, c);
      const k = L.smooth(lt / LEN(id));
      look(c, lerpV(V(0.4, 1.95, 6.6), V(-0.2, 1.42, 7.95), k), RADIO.clone().add(V(-0.05, 0.02, 0)));
      radioSet(lt > tR, t, { stat: lt > tR ? Math.max(0.15, 1 - (lt - tR) * 0.7) : 0, talk: false });
    } };
  }
  // 12_broadcast: radio close-up (left) + RE FILE panel (right): EMERGENCY BROADCAST / HELP ARRIVES IN 7 DAYS / the 3 rules on their words
  { const id = '12_broadcast', c = cam(36), tO = lo(id, A.open12), tSev = lo(id, A.seven12), tRules = A.rules12.map((x) => lo(id, x));
    out[id] = { scene, camera: c, update(lt, t) {
      setState({ hero: false, lit: lit6 }); setRain(t); steam(t, c);
      const k = L.smooth(lt / LEN(id));
      look(c, V(RADIO.x - 0.1 + 0.02 * k, 1.36 - 0.02 * k, RADIO.z - 0.72 + 0.1 * k), V(RADIO.x - 0.36, RADIO.y + 0.04, RADIO.z + 0.2));
      radioSet(1, t, { stat: 0.1 });
    }, overlay(lt, dt, a, o) {
      vignette(o, 0.45);
      const c2 = o.tctx, open = L.smooth((lt - tO) / 0.16); if (open <= 0) return;
      const X = Math.round(404 + (1 - open) * 240), Y = 52, Wd = 214, Hd = 232;
      c2.fillStyle = 'rgba(6,10,26,0.93)'; c2.fillRect(X, Y, Wd, Hd);
      c2.fillStyle = 'rgba(40,60,120,0.18)'; for (let y = Y + 3; y < Y + Hd - 3; y += 2) c2.fillRect(X + 2, y, Wd - 4, 1);
      c2.fillStyle = '#5a7ad8'; c2.fillRect(X, Y, Wd, 1); c2.fillRect(X, Y + Hd - 1, Wd, 1); c2.fillRect(X, Y, 1, Hd); c2.fillRect(X + Wd - 1, Y, 1, Hd);
      c2.fillStyle = '#26386e'; c2.fillRect(X + 3, Y + 3, Wd - 6, 1); c2.fillRect(X + 3, Y + Hd - 4, Wd - 6, 1); c2.fillRect(X + 3, Y + 3, 1, Hd - 6); c2.fillRect(X + Wd - 4, Y + 3, 1, Hd - 6);
      c2.fillStyle = '#26386e'; c2.fillRect(X + 8, Y - 15, 52, 16); c2.fillStyle = '#5a7ad8'; c2.fillRect(X + 8, Y - 15, 52, 1); c2.fillRect(X + 8, Y - 15, 1, 15); c2.fillRect(X + 59, Y - 15, 1, 15);
      reText(c2, 'FILE', X + 34, Y - 7, 2, '#e8ecff', { outline: null });
      const cx = X + Wd / 2, L1 = (s, y, col, sc = 1, k = 1) => { if (k > 0) reText(c2, s, cx, y, sc, mixHex('#06091a', col, k), { outline: null }); };
      const left = (s, y, col, k) => { if (k <= 0) return; const w = reWidth(s, 2); reText(c2, s, X + 14 + w / 2, y, 2, mixHex('#06091a', col, k), { outline: null }); };
      const kb = fadeIn(lt, tO + 0.08);
      L1('EMERGENCY', Y + 18, '#ff5a40', 2, kb); L1('BROADCAST', Y + 36, '#ff5a40', 2, kb);
      c2.fillStyle = mixHex('#06091a', '#5a7ad8', kb); c2.fillRect(X + 12, Y + 48, Wd - 24, 1);
      const ks = fadeIn(lt, tSev, 0.08);
      L1('HELP ARRIVES', Y + 62, '#e8ecff', 2, ks);
      if (ks > 0) L1('IN 7 DAYS', Y + 88, lt - tSev < 0.1 ? '#ffffff' : '#ffe048', 3, ks);
      c2.fillStyle = mixHex('#06091a', '#5a7ad8', ks); c2.fillRect(X + 12, Y + 106, Wd - 24, 1);
      if (ks > 0) L1('RULES', Y + 118, '#9aa8d8', 1, ks);
      ['1. LIGHTS OFF', '2. GATE LOCKED', '3. OPEN FOR NO ONE'].forEach((s, i) => {
        const kr = fadeIn(lt, tRules[i], 0.06); if (kr <= 0) return;
        const y = Y + 140 + i * 30, fl = lt - tRules[i] < 0.1;
        if (fl) { c2.fillStyle = 'rgba(120,150,255,0.35)'; c2.fillRect(X + 5, y - 12, Wd - 10, 24); }
        left(s, y, fl ? '#ffffff' : '#e8ecff', kr); c2.fillStyle = mixHex('#06091a', '#ff4a34', kr); c2.fillRect(X + 6, y - 3, 4, 6);
      });
    } };
  }
  // 13_ava_seven: Ava frontal by the desk, LOOKS AT CAMERA, shrug on "You can do...", wink on "seven"
  { const id = '13_ava_seven', c = cam(36), P = V(-1.35, 0, 8.25), tY = lo(id, A.you13), tS = lo(id, A.seven13);
    out[id] = { scene, camera: c, overlay: ov(0.32), update(lt, t) {
      setState({ lit: lit6 }); setRain(t); radioSet(0, t); steam(t, c);
      look(c, V(-1.05, 1.47, 6.35 + lt * 0.03), V(-1.05, 1.3, 8.25));
      ch.root.position.copy(P); ch.root.rotation.y = Math.PI;
      const eyes = lt > tS && lt < tS + 0.55 ? 'wink' : lt > 0.9 && lt < 0.98 ? 'blink' : lt > tY ? 'happy' : 'open';
      ch.pose(lt, [L.seg('idle', -99, { loop: true, speed: 0.7 }), L.seg('nod', 0.2, { fade: 0.2, speed: 0.8 }), L.seg('shrug', tY - 0.1, { fade: 0.2, speed: 0.75 })],
        [[-99, eyes, mouthAt(t, lt > tY ? 'smile' : 'neutral')]]);
      ch.lookAt(c, 1, 40);
    } };
  }
  // 14_clock: FIXED high: the radio on the desk and the wall clock; on "twenty minutes later" the hands race 20 minutes
  { const id = '14_clock', c = cam(40), tT = lo(id, A.twenty14), tE = lo(id, A.later14);
    out[id] = { scene, camera: c, overlay: ov(0.38), update(lt, t) {
      setState({ hero: false, lit: lit6 }); setRain(t); steam(t, c);
      const k = L.smooth((lt - tT) / (tE - tT)), m = 16 + 20 * Math.floor(k * 20) / 20, sec = Math.floor(lt + 0.5) % 60 + 12;
      setClock(9, m, k > 0 && k < 1 ? (Math.floor(k * 20) * 23) % 60 : sec);
      radioSet(lt < tT - 0.6 ? 1 : 0, t, { talk: false, stat: 0.2 });
      const kc = L.smooth(lt / LEN(id));
      look(c, lerpV(V(1.4, 2.5, 6.2), V(1.0, 2.35, 7.0), kc), V(-0.3, 1.55, 11.2));
    } };
  }
  // 15_again: radio close-up again, same waveform; SAME WORDS / SAME PAUSE / SAME COUGH on their words
  { const id = '15_again', c = cam(36), tP = lo(id, A.plays15), tS = A.same15.map((x) => lo(id, x));
    const LB = ['SAME WORDS', 'SAME PAUSE', 'SAME COUGH'], COL = ['#9cff8a', '#9cff8a', '#ff5a40'];
    out[id] = { scene, camera: c, update(lt, t) {
      setState({ hero: false, lit: lit6 }); setRain(t); steam(t, c);
      const k = L.smooth(lt / LEN(id));
      look(c, V(RADIO.x + 0.3 - 0.05 * k, 1.34, RADIO.z - 0.62 + 0.08 * k), V(RADIO.x + 0.02, RADIO.y + 0.05, RADIO.z));
      radioSet(lt > tP - 0.2 ? 1 : 0, t, { stat: 0.1 });
    }, overlay(lt, dt, a, o) {
      vignette(o, 0.42);
      const [lx, ly] = L.toScreen(c, RLCD.x, RLCD.y, RLCD.z), [sx, sy] = L.toScreen(c, RSPK.x, RSPK.y, RSPK.z);
      tS.forEach((ts, i) => { if (lt > ts) bigLabel(o, LB[i], 500, 96 + i * 54, COL[i], i === 2 ? sx : lx, i === 2 ? sy : ly, lt - ts, 2); });
    } };
  }
  // 16_remember: slow push-in to Ava frontal, serious, looking at camera (no shake)
  { const id = '16_remember', c = cam(34), P = V(0.9, 0, 6.6);
    out[id] = { scene, camera: c, overlay: ov(0.42), update(lt, t) {
      setState({ lit: lit6 }); setRain(t);
      const k = L.smooth(lt / LEN(id));
      look(c, V(0.72, 1.5, 4.25 + 0.8 * k), V(0.72, 1.44 + 0.03 * k, 6.6));
      ch.root.position.copy(P); ch.root.rotation.y = Math.PI;
      ch.pose(lt, [L.seg('idle', -99, { loop: true, speed: 0.5, from: 0.3 })], [[-99, lt > 1.2 && lt < 1.28 ? 'blink' : 'open', mouthAt(t, 'neutral')]]);
      ch.lookAt(c, 1, 40);
    } };
  }

  // ================================= 9:40 PM: the glass =================================
  // 17_glass: FIXED from the desk toward the glass doors (rain); GLASS on "glass", TEMPERED GLASS on "tempered"
  { const id = '17_glass', c = cam(40), tG = lo(id, A.glass17), tT = lo(id, A.temp17);
    out[id] = { scene, camera: c, update(lt, t) {
      setState({ hero: false, lit: lit6 }); setRain(t); steam(t, c);
      dropMeshes.forEach((m) => { m.visible = false; });   // wide shot: steady glass, no twinkle
      const k = L.smooth(lt / LEN(id));
      look(c, V(0.35, 1.68, 10.35 - 0.5 * k), V(0.0, 1.45, 0));
    }, overlay(lt, dt, a, o) {
      vignette(o, 0.35);
      const [tx, ty] = L.toScreen(c, -0.45, 1.75, 0);
      if (lt > tG && lt < tT) bigLabel(o, 'GLASS', 470, 120, '#4fd6ff', tx, ty, lt - tG, 2);
      if (lt > tT) bigLabel(o, 'TEMPERED GLASS', 470, 120, '#ff5a40', tx, ty, lt - tT, 2);
    } };
  }
  // 18_glass_break: IMAGINED (cold tint): one zombie palm on "goes", then the whole pane comes down at once in small cubes
  { const id = '18_glass_break', c = cam(42), tGo = lo(id, A.goes18), tO = lo(id, A.once18), tTh = lo(id, A.thou18), tN = lo(id, A.warn18);
    out[id] = { scene, camera: c, update(lt, t) {
      setState({ hero: false, zs: false, lamp: false, em: true, barr: 0 }); setRain(t);
      ZS[0].wrap.visible = true; pressZ(0, -1.6, 0.05, t, [A.goes18], lt);
      rattle(t, 1.4, [A.goes18]); breakPane(lt - tO);
      cold.intensity = 1.6; fill.intensity = 1.2; scene.background.set(0x0c1830);
      const k = L.smooth(lt / LEN(id));
      look(c, V(-0.2 - 0.3 * k, 1.45, 3.6 - 0.5 * k), V(-1.45, 1.2, 0.2));
    }, overlay(lt, dt, a, o) {
      const c2 = o.tctx; c2.fillStyle = 'rgba(60,120,210,0.22)'; c2.fillRect(0, 0, LW, LH); vignette(o, 0.55);
      if (lt > tO && lt < tO + 0.08) { c2.fillStyle = 'rgba(220,240,255,0.5)'; c2.fillRect(0, 0, LW, LH); }
      const [fx, fy] = L.toScreen(c, -1.5, 0.05, 0.5);
      if (lt > tTh) bigLabel(o, "1000s OF PIECES", 470, 112, '#9ad8ff', fx, fy, lt - tTh, 2);
      if (lt > tN) bigLabel(o, 'NO WARNING', 470, 168, '#ff5a40', null, null, lt - tN, 2);
      reText(c2, 'IMAGINE', 586, 18, 1, '#9ac8ff', { outline: null });
    } };
  }
  // 19_lobby_never: FIXED high lobby corner: red X on the glass zone + RULE 1: NEVER GO NEAR THE LOBBY on "never"
  { const id = '19_lobby_never', c = cam(46), tN = lo(id, A.never19);
    out[id] = { scene, camera: c, update(lt, t) {
      setState({ hero: false, lit: lit6 }); setRain(t);
      dropMeshes.forEach((m) => { m.visible = false; });
      look(c, V(2.0, 4.4, 8.4), V(-0.4, 0.4, 1.4));
      const k = L.smooth((lt - tN) / 0.12); xZone.visible = lt > tN; xZone.scale.setScalar(0.85 + 0.15 * k);
    }, overlay(lt, dt, a, o) {
      vignette(o, 0.36);
      if (lt > tN) { const [tx, ty] = L.toScreen(c, -1.0, 0.02, 2.2); bigLabel(o, ['MY RULE 1:', 'NEVER GO NEAR THE LOBBY'], 440, 104, '#ff3a2a', tx, ty, lt - tN, 2); }
    } };
  }
  // 20_benches: Ava pushes a bench (push_heavy) against the inner double doors; the second is already there; BENCHES on "benches"
  { const id = '20_benches', c = cam(48), tB = lo(id, A.benches20), tD = lo(id, A.doors20), Z0 = 11.0;
    out[id] = { scene, camera: c, update(lt, t) {
      const k = L.clamp01((lt - 0.3) / (tD - 0.3)), bz = Z0 + (BENCH_B.z - Z0) * k;
      setState({ lit: lit6, barr: 1, benchZ: bz }); setRain(t);
      ch.root.position.set(BENCH_B.x - 0.05, 0, bz - 0.23 - 0.42); ch.root.rotation.y = 0;
      ch.pose(lt, [L.seg('push_heavy', -99, { loop: true, from: 0.3, speed: lt < tD ? 1 : 0.0001 })], [[-99, 'angry', mouthAt(t, 'frown')]]);
      look(c, V(1.2, 3.2, 11.0), V(3.4, 0.55, 11.8));
    }, overlay(lt, dt, a, o) {
      vignette(o, 0.35);
      if (lt > tB) { const p = benchB.position; const [tx, ty] = L.toScreen(c, p.x - 0.5, 0.8, p.z); bigLabel(o, 'BENCHES', 210, 236, '#ffd23f', tx, ty, lt - tB, 2); }
    } };
  }
  // 21_lights_off: reverse angle down the lobby: the fluorescent rows clack off one by one on "kill every light", then the desk lamp
  { const id = '21_lights_off', c = cam(48), OFF = A.off21;
    out[id] = { scene, camera: c, overlay: ov(0.4), update(lt, t) {
      const mask = rows.map((r, i) => t < OFF[i]);
      setState({ hero: false, lit: 0, lamp: t < A.lamp21, em: true, barr: 2 }); setRain(t); setLit(mask, t < A.lamp21);
      look(c, V(1.2, 3.0, 12.4), V(-0.3, 1.2, 1.0));
    } };
  }
  // 22_count: through the glass: 3 zombies standing in the rain; counter on the glass shows 3 on "Three"; slow push-in on "standing"
  { const id = '22_count', c = cam(44), tT = lo(id, A.three22), tS = lo(id, A.stand22);
    out[id] = { scene, camera: c, update(lt, t) {
      setState({ hero: false, lamp: false, em: true, barr: 2 }); setRain(t); horde(t, 3);
      const k = L.smooth((lt - tS) / (LEN(id) - tS));
      look(c, V(0.25, 1.55, 3.4 - 1.5 * k), V(0.3, 1.25, -3.0));
    }, overlay(lt, dt, a, o) {
      vignette(o, 0.42);
      if (lt > tT) { const [x, y] = L.toScreen(c, 1.6, 2.75, 0); zCounter(o, Math.min(560, Math.max(380, x)), Math.max(100, y), 3, lt - tT); }
    } };
  }

  // ================================= 11:30 PM .. 12:40 AM =================================
  // 37_k9_door: the door marked K-9 on the side wall; scratching (only the door shakes a little); push-in
  { const id = '37_k9_door', c = cam(40), S = A.scr37;
    out[id] = { scene, camera: c, overlay: ov(0.45), update(lt, t) {
      setState({ hero: false, lamp: false, em: true, barr: 2 }); setRain(t);
      const p = pulse(t, S, 0.05); k9Leaf.position.x = 0.006 * p; k9Leaf.rotation.y = 0.004 * p;
      const k = L.smooth(lt / LEN(id));
      look(c, lerpV(V(-1.9, 1.5, 11.5), V(-3.55, 1.35, 11.05), k), V(-5.0, 1.1, 10.9));
      top.position.set(-3.6, 2.6, 10.6); top.color.set(0x8aa0d8); top.intensity = 2.2; top.distance = 4;
    } };
  }
  // 44_power: FIXED high from the back of the lobby, down the aisle to the glass: the backup power keeps the fluorescent rows and the
  // emergency light on; they stutter on "power" and go OFF on "dies" (clack + hum down). Only the blue street light through
  // the glass remains (spill on the floor + moonlight). Every later lobby shot stays dark until 59_lights_on.
  { const id = '44_power', c = cam(48);
    const FLK = [1, 0, 0, 1, 0, 1, 1, 0, 0];   // per-frame stutter pattern between "power" and "dies"
    out[id] = { scene, camera: c, overlay: ov(0.42), update(lt, t) {
      const dead = t >= A.dies44, f = Math.floor((t - A.power44) * 30), fl = t >= A.power44 && !dead ? FLK[f % FLK.length] : 1;
      if (dead) {
        setState({ hero: false, lit: 0, lamp: false, em: false, barr: 2, lift: 0.55 }); setRain(t);
        moon.intensity = 1.9; spill.material.opacity = 0.95; hemi.intensity = 1.25; fill.intensity = 0.55;
      } else {
        setState({ hero: false, lit: fl ? lit6 : 0, lamp: false, em: !!fl, barr: 2 }); setRain(t);
        if (!fl) hemi.intensity = 1.0;
      }
      const k = L.smooth(lt / LEN(id));
      look(c, V(0.7, 3.6, 11.7 - 0.35 * k), V(-0.2, 1.7, 0.5));
    } };
  }
  // 47_rule_three: dark lobby. A) FIXED high corner with a strong push-in; B) cut on "rule" to a LOW angle under the dead
  // fluorescent rows (push-in, looking up toward the glass); RULE 3: LIGHTS OFF. ALL OF THEM on "lights"
  { const id = '47_rule_three', c = cam(46), tL = lo(id, A.lights47), tC = lo(id, A.rule47 - 0.05);
    out[id] = { scene, camera: c, update(lt, t) {
      setState({ hero: false, lamp: false, barr: 2, lift: 0.8 }); setRain(t); horde(t, 3);
      dropMeshes.forEach((m) => { m.visible = false; });
      if (lt < tC) { const k = L.smooth(lt / tC); c.fov = 46; c.updateProjectionMatrix(); look(c, lerpV(V(1.8, 4.2, 12.4), V(0.9, 3.0, 8.4), k), V(-0.5, 0.9, 1.5)); }
      else { const k = L.smooth((lt - tC) / (LEN(id) - tC)); c.fov = 50; c.updateProjectionMatrix(); look(c, lerpV(V(-0.9, 0.32, 8.3), V(-0.6, 0.5, 6.2), k), V(0.3, 2.9, 0.8)); }
    }, overlay(lt, dt, a, o) {
      vignette(o, 0.42);
      if (lt > tL) bigLabel(o, ['MY RULE 3:', 'LIGHTS OFF. ALL OF THEM'], 420, 150, '#ffd23f', null, null, lt - tL, 2);
    } };
  }
  // 48_boots: Ava sits on the floor against the desk; Ribbon sleeps on her boots; she looks at camera and smiles
  { const id = '48_boots', c = cam(33), P = V(-1.1, 0, 8.3);
    out[id] = { scene, camera: c, overlay: ov(0.38), update(lt, t) {
      setState({ lamp: false, barr: 2, dogOn: true, lift: 1 }); setRain(t);
      fill.intensity = 1.4; top.position.set(P.x + 0.3, 1.7, P.z - 1.6); top.color.set(0xb8c8f0); top.distance = 4.5; top.intensity = 3.2;
      ch.root.position.copy(P); ch.root.rotation.y = Math.PI;
      ch.pose(lt, [L.seg('sit_floor', -99, { from: 2.6, speed: 0 })], [[-99, 'happy', mouthAt(t, 'smile')], [1.6, lt < 1.68 ? 'blink' : 'happy', mouthAt(t, 'smile')]]);
      // legs stretched out along the floor (knees down, boots toes-up) so Ribbon can lie across her ankles; undone in setState2
      ch.root.updateMatrixWorld(true);
      for (const sd of ['L', 'R']) {
        const th = ch.bone.getObjectByName('Thigh' + sd), ca = ch.bone.getObjectByName('Calf' + sd), ft = ch.bone.getObjectByName('Foot' + sd);
        armSaved = armSaved || []; for (const b of [th, ca, ft]) if (!armSaved.some(([x]) => x === b)) armSaved.push([b, b.quaternion.clone()]);
        const hp = th.getWorldPosition(V()), dx = sd === 'L' ? -0.05 : 0.05;
        aimBone(th, ca, V(hp.x + dx, 0.13, hp.z - 1)); aimBone(ca, ft, V(hp.x + dx * 1.6, 0.1, hp.z - 1.5));
      }
      look(c, V(0.6, 1.1, 6.45), V(-1.0, 0.3, 8.15));
      dog.root.position.set(P.x + 0.42, 0, P.z - 0.22); dog.root.rotation.y = Math.PI + 0.55; dog.update(lt, 'sleepy_wag', { breath: 1, headUp: -0.1, wag: 0.15, look: c.position, mv: [['IKFrontLeg.L', 0, 0, -0.25], ['IKFrontLeg.R', 0, 0, -0.25]] });
      ch.lookAt(c, 1, 40);
    } };
  }

  // ================================= 2:47 AM .. 3:40 AM =================================
  // 51_radio_hall: FIXED high: dark lobby, the desk radio switches on by itself and plays; on "Same cough" Ava comes in at the
  // K-9 door: from the corridor she puts both hands on the leaf and pushes it (it swings INTO the lobby on its hinge), lets go,
  // the door swings fully open (~93 deg, flat along z 11.4), and only then she steps through (z 10.88, 0.5 m clear of the leaf)
  // and peeks toward the radio. Hands = IK on the leaf (corridor face), never through it.
  { const id = '51_radio_hall', c = cam(50), tP = lo(id, A.plays51), D = A.d51, o0 = lo(id, D.o0), p1 = lo(id, D.push1), op = lo(id, D.open1), w0 = lo(id, D.w0), w1 = lo(id, D.w1);
    const ZC = 10.88, X0 = -5.62, X1 = -5.36, X2 = -4.74, YR = Math.PI / 2 + 0.45;
    out[id] = { scene, camera: c, overlay: ov(0.42), update(lt, t) {
      const ease = (x) => { x = L.clamp01(x); return 1 - (1 - x) * (1 - x); };
      const a = 0.38 * L.smooth((lt - o0) / (p1 - o0)) + 1.24 * ease((lt - p1) / (op - p1));
      setState({ hero: lt > o0 - 0.6, lamp: false, barr: 2, k9a: a }); setRain(t);
      radioSet(lt > tP ? 1 : 0, t, { talk: true, stat: lt > tP && lt < tP + 0.5 ? 1 : 0.15 });
      const x = lt < w0 ? X0 + (X1 - X0) * L.smooth((lt - (o0 - 0.1)) / (p1 - o0 + 0.1)) : X1 + (X2 - X1) * L.clamp01((lt - w0) / (w1 - w0));
      ch.root.position.set(x, 0, ZC); ch.root.rotation.y = Math.PI / 2 + (YR - Math.PI / 2) * L.smooth((lt - w1) / 0.35);
      ch.pose(lt, [L.seg('push_door', -99, { from: 0.1, speed: 0 }), L.seg('push_door', o0 - 0.1, { from: 0.1, speed: 0.8 }), walkSeg(id, 0, { fade: 0.2 }), L.seg('peek', w1, { fade: 0.25, speed: 0.8 })],
        [[-99, 'open', 'neutral'], [w0, 'surprised', 'neutral']]);
      k9.updateMatrixWorld(true);
      const wH = L.smooth((lt - (o0 - 0.5)) / 0.3) * (1 - L.smooth((lt - p1) / 0.22));
      reachTo('L', k9Leaf.localToWorld(V(-0.12, 1.05, -0.84)), wH); reachTo('R', k9Leaf.localToWorld(V(-0.12, 1.2, -0.42)), wH);
      look(c, V(-0.6, 3.9, 4.0), V(-3.4, 0.9, 10.6));
    } };
  }
  // 52_knock: police silhouette (low cap) behind the wet glass knocks on "knocks"; only the glass shakes. HUD CAUTION
  { const id = '52_knock', c = cam(44), K = A.knock52;
    out[id] = { scene, camera: c, overlay: ov(0.42), update(lt, t) {
      setState({ hero: false, copOn: true, lamp: false, barr: 2 }); setRain(t); rattle(t, 1, K); horde(t, 3);
      copSkin.forEach((m) => m.color.set(0x3a4048)); copKnock(0.35, t, K);
      look(c, V(0.15, 1.5, 4.0 - lt * 0.1), V(0.15, 1.45, 0));
    } };
  }
  // 53_ribbon_stares: low camera by the glass: Ribbon stands up on "stands" and stares at the door, no bark; Ava in the background
  { const id = '53_ribbon_stares', c = cam(44), tU = lo(id, A.stands53), tS = lo(id, A.stares53), DP = V(0.1, 0, 3.9), AP = V(-0.95, 0, 6.9);
    out[id] = { scene, camera: c, overlay: ov(0.4), update(lt, t) {
      setState({ lamp: false, barr: 2, dogOn: true }); setRain(t); fill.intensity = 1.0;
      dog.root.position.copy(DP); dog.root.rotation.y = Math.PI;
      const gaze = V(0.2, 1.5, 0);
      if (lt < tU) dog.update(lt, 'sleepy_wag', { wag: 0.2 });
      else if (lt < tS) dog.update(lt, 'stand', { from: 'sleepy_wag', k: L.smooth((lt - tU) / 0.5), look: gaze, wag: 0 });
      else dog.update(lt, 'stare', { look: gaze, wag: 0 });
      ch.root.position.copy(AP); ch.root.rotation.y = Math.PI;
      ch.pose(lt, [L.seg('idle', -99, { loop: true, speed: 0.5 })], [[-99, 'open', 'neutral']]);
      look(c, V(0.4, 0.5, 0.9), V(-0.1, 0.7, 4.5));
    } };
  }
  // 54_cop: from inside: the cop (VICKERS) knocks with his knuckles; Ava from behind in the foreground
  { const id = '54_cop', c = cam(42), P = V(-0.9, 0, 1.5), K = A.knock54;
    out[id] = { scene, camera: c, overlay: ov(0.42), update(lt, t) {
      setState({ copOn: true, lamp: false, barr: 2 }); setRain(t); rattle(t, 1, K); horde(t, 3);
      copSkin.forEach((m) => m.color.set(0x3a4048)); copKnock(0.55, t, K);
      ch.root.position.copy(P); ch.root.rotation.y = angTo(P, V(0.3, 0, -0.3));
      ch.pose(lt, [L.seg('idle', 0, { loop: true, from: 0.2, speed: 0.7 })], [[-99, 'open', 'neutral']]);
      look(c, V(-1.4, 1.72, 3.1 + lt * 0.03), V(0.4, 1.5, -0.3));
    } };
  }
  // 55_badge_rule: close-ups on uniform / cap / badge on their words; RULE 4: A BADGE IS NOT A PASSWORD on "password"
  // 4 fixed angles: A) close-ups uniform/cap/badge; B) on "Rule": over Ava's shoulder from inside, push-in to the cop;
  // C) on "writing": Ava frontal with her notepad, looks at camera; D) on "a badge...": strong push-in to his face + badge
  { const id = '55_badge_rule', c = cam(34), W = A.n55, tU = lo(id, W.uniform), tC = lo(id, W.cap), tB = lo(id, W.badge), tR = lo(id, W.rule), tP = lo(id, W.pass), tW = lo(id, W.writing - 0.12), tA = lo(id, W.a - 0.1);
    const AP = V(-1.1, 0, 2.3);
    let pts = null, seg = 'A';
    out[id] = { scene, camera: c, update(lt, t) {
      seg = lt < tR ? 'A' : lt < tW ? 'B' : lt < tA ? 'C' : 'D';
      setState({ hero: seg === 'B' || seg === 'C', copOn: true, lamp: false, barr: 2, lift: 0.7 }); setRain(t); horde(t, 3);
      if (seg !== 'B') { dropMeshes.forEach((m) => { m.visible = false; }); mGlass.opacity = 0.08; mGlass.map = null; }
      copSkin.forEach((m) => m.color.set(0x343840)); copKnock(0.3, t, [], false); cop.wrap.updateMatrixWorld(true);
      const chest = cop.bone(/Spine2$/).getWorldPosition(V()), capP = capG.getWorldPosition(V()).add(V(0, 0.03, 0)), bp = badge.userData.plate.getWorldPosition(V()), hd = cop.head.getWorldPosition(V());
      pts = { chest, capP, bp };
      ch.root.position.copy(AP); ch.root.rotation.y = Math.PI;
      if (seg === 'A') {
        c.fov = 34; c.updateProjectionMatrix();
        // [t, target, distance, camera height above target]: the cap is seen a bit from above so its low crown + peak read
        const keys = [[-99, chest, 0.95, 0.03], [tC, capP, 0.62, 0.2], [tB, bp, 0.42, 0.03]];
        let i = 0; while (i < keys.length - 1 && lt >= keys[i + 1][0]) i++;
        const prev = keys[Math.max(0, i - 1)], cur = keys[i], k = i === 0 ? 1 : L.smooth((lt - cur[0]) / 0.35);
        const tg = lerpV(prev[1], cur[1], k), dist = prev[2] + (cur[2] - prev[2]) * k, dy = prev[3] + (cur[3] - prev[3]) * k;
        look(c, V(tg.x + 0.05, tg.y + dy, tg.z + dist), tg);
      } else if (seg === 'B') {
        const k = L.smooth((lt - tR) / (tW - tR)); c.fov = 40; c.updateProjectionMatrix();
        look(c, lerpV(V(-0.6, 1.62, 4.4), V(-0.45, 1.62, 3.5), k), V(0.3, 1.55, -0.4));
        ch.pose(lt, [L.seg('idle', -99, { loop: true, speed: 0.5 })], [[-99, 'open', 'neutral']]);
      } else if (seg === 'C') {
        const k = L.smooth((lt - tW) / (tA - tW)); c.fov = 34; c.updateProjectionMatrix();
        look(c, V(AP.x + 0.05, 1.5, 0.75 + 0.12 * k), V(AP.x, 1.36, AP.z));
        ch.pose(lt, [L.seg('hold_up_object', tW - 0.4, { speed: 0.9 })], [[-99, 'open', mouthAt(t, 'smile')], [tW + 0.7, lt < tW + 1.2 ? 'wink' : 'open', mouthAt(t, 'smile')]]);
        ch.lookAt(c, 1, 40);
        follow(pad, 'R', [0, 0.95, 0.15], [Math.PI / 2, 0, 0]);
      } else {
        const k = L.smooth((lt - tA) / (LEN(id) - tA)); c.fov = 30; c.updateProjectionMatrix();
        const tg = lerpV(hd.clone().add(V(0, -0.25, 0)), hd.clone().add(V(0, -0.06, 0)), k);
        look(c, V(tg.x + 0.04, tg.y + 0.02, tg.z + 1.9 - 1.25 * k), tg);
      }
    }, overlay(lt, dt, a, o) {
      vignette(o, 0.45); if (!pts) return;
      const s = (p) => L.toScreen(c, p.x, p.y, p.z);
      if (lt > tU && lt < tC) { const [x, y] = s(pts.chest); label(o, 'UNIFORM', 470, 110, '#4fd6ff', x, y); }
      if (lt > tC && lt < tB) { const [x, y] = s(pts.capP); label(o, 'CAP', 470, 110, '#4fd6ff', x, y); }
      if (lt > tB && lt < tR) { const [x, y] = s(pts.bp); label(o, 'BADGE', 470, 110, '#ffd23f', x, y); }
      if (lt > tR && lt < tW) bigLabel(o, 'MY RULE 4', 470, 100, '#ff3a2a', null, null, lt - tR, 2);
      if (lt > tP) bigLabel(o, ['MY RULE 4:', 'A BADGE IS NOT A PASSWORD'], 420, 100, '#ff3a2a', null, null, lt - tP, 2);
    } };
  }
  // 57_vickers: close on the VICKERS plate behind the glass; lightning on "Officer": grey skin, white eyes. HUD DANGER
  const flashK = (t, F) => { let k = 0; for (const [h, a] of [[F, 1], [F + 0.2, 0.7], [F + 0.66, 0.5]]) { const d = t - h; if (d > -0.04) k = Math.max(k, a * (d < 0 ? 1 + d / 0.04 : Math.exp(-d * 9))); } return k; };
  { const id = '57_vickers', c = cam(34), tV = lo(id, A.vick57), F = A.flash57;
    out[id] = { scene, camera: c, update(lt, t) {
      setState({ hero: false, copOn: true, lamp: false, barr: 2 }); setRain(t);
      dropMeshes.forEach((m) => { m.visible = false; }); mGlass.opacity = 0.07; mGlass.map = null;
      const f = flashK(t, F);
      copKnock(0.3, t, [], false);
      copSkin.forEach((m) => m.color.set(0x2a2e34).lerp(new THREE.Color(0xd8e0e0), Math.min(1, f * 1.4)));
      eyes.visible = true; eyes.children.forEach((e) => e.material.color.setScalar(0.35 + 0.65 * Math.min(1, f * 1.5)));
      flash.intensity = 3.5 * f; scene.background.set(BG).lerp(new THREE.Color(0x8a9ac8), f * 0.6);
      cop.wrap.updateMatrixWorld(true);
      const hd = cop.head.getWorldPosition(V()), bp = badge.userData.plate.getWorldPosition(V());
      if (lt < tV) { c.fov = 34; c.updateProjectionMatrix(); look(c, V(hd.x + 0.05, hd.y - 0.12, 1.15 - lt * 0.06), V(hd.x, hd.y - 0.17, hd.z)); }
      else { c.fov = 28; c.updateProjectionMatrix(); const k = L.smooth((lt - tV) / 0.5); look(c, V(bp.x + 0.02, bp.y + 0.01, bp.z + 0.5 - 0.06 * k), bp); }
    }, overlay(lt, dt, a, o) {
      vignette(o, 0.45); const f = flashK(T0[id] + lt, F);
      if (f > 0.02) { o.tctx.fillStyle = `rgba(200,215,255,${0.22 * f})`; o.tctx.fillRect(0, 0, LW, LH); }
    } };
  }
  // 58_twenty: through the glass: the horde grows 3 -> 8 -> 20 on the words; counter on the glass; the knocking goes on
  const ARR = (tE, tT) => Array.from({ length: 20 }, (_, i) => (i < 3 ? null : i < 8 ? tE - 0.1 * (7 - i) : tT - 0.06 * (19 - i)));
  { const id = '58_twenty', c = cam(46), K = A.knock58, tTh = lo(id, A.three58), tE = lo(id, A.eight58), tT = lo(id, A.twenty58), arr = ARR(A.eight58, A.twenty58);
    out[id] = { scene, camera: c, update(lt, t) {
      setState({ hero: false, copOn: true, lamp: false, barr: 2 }); setRain(t); rattle(t, 1, K);
      copSkin.forEach((m) => m.color.set(0x3a4048)); copKnock(-0.55, t, K);
      horde(t, 20, arr);
      const k = L.smooth(lt / LEN(id));
      look(c, V(0.3, 1.65, 3.6 - 0.5 * k), V(0.3, 1.3, -3.0));
    }, overlay(lt, dt, a, o) {
      vignette(o, 0.4);
      const n = lt > tT ? 20 : lt > tE ? 8 : lt > tTh ? 3 : 0, age = lt - (n === 20 ? tT : n === 8 ? tE : tTh);
      if (n) { const [x, y] = L.toScreen(c, 1.6, 2.75, 0); zCounter(o, Math.min(560, Math.max(380, x)), Math.max(100, y), n, age); }
    } };
  }
  // 59_lights_on: the glass shakes (knocking); on "light" the fluorescent rows clack on row by row toward camera; Ava turns
  { const id = '59_lights_on', c = cam(48), P = V(0.15, 0, 5.4), CP = V(1.0, 1.75, 8.3), K = A.knock59, RT = A.rows59, tL = lo(id, A.light59);
    out[id] = { scene, camera: c, overlay: ov(0.35), update(lt, t) {
      let lit = 0; RT.forEach((rt, i) => { const d = t - rt; if (d >= 0 && !(d > 0.05 && d < 0.09)) lit = i + 1; else if (d >= 0) lit = i; });
      setState({ copOn: true, lit, lamp: false, barr: 2 }); setRain(t); rattle(t, 1, K); horde(t, 50);
      copSkin.forEach((m) => m.color.set(0x2a2e34)); copKnock(0.3, t, K);
      look(c, CP, V(-0.05, 1.5, 0.5));
      const tT = tL + 0.5, k = L.smooth((lt - tT) / 0.4);
      const a0 = angTo(P, V(0, 0, 0)), a1 = angTo(P, CP) - Math.PI * 2;
      ch.root.position.copy(P); ch.root.rotation.y = a0 + (a1 - a0) * k;
      const talk = mouthAt(t, lt > tT ? 'gasp' : 'neutral');
      ch.pose(lt, [L.seg('idle', 0, { loop: true, from: 0.6, speed: 0.6 }), L.seg('surprised', tT, { fade: 0.15 })],
        [[-99, 'open', talk], [tL, 'surprised', talk], [tT + 0.5, 'shocked', mouthAt(t, 'gasp')]]);
      if (k > 0) ch.lookAt(c, k, 40);
    } };
  }
  // 60_fudge: Ava frontal "Oh, fudge" (surprised -> nervous smile), white light above
  { const id = '60_fudge', c = cam(36), P = V(0.15, 0, 5.4), CP = V(1.0, 1.75, 8.3), tF = lo(id, A.fudge60);
    out[id] = { scene, camera: c, overlay: ov(0.3), update(lt, t) {
      setState({ copOn: true, lit: lit6, lamp: false, barr: 2 }); setRain(t); horde(t, 50);
      copSkin.forEach((m) => m.color.set(0x2a2e34)); copKnock(0.3, t, []);
      top.position.set(P.x, 3.0, P.z + 0.3); top.intensity = 4;
      const a1 = angTo(P, CP); ch.root.position.copy(P); ch.root.rotation.y = a1;
      const d = V(Math.sin(a1), 0, Math.cos(a1));
      look(c, V(P.x + d.x * 2.0, 1.48, P.z + d.z * 2.0), V(P.x, 1.36, P.z));
      const eyes = lt < 0.4 ? 'shocked' : lt < tF ? 'surprised' : lt > tF + 0.4 && lt < tF + 0.47 ? 'blink' : 'happy';
      ch.pose(lt, [L.seg('shrug', 0, { from: 0.25, speed: 0.5 }), L.seg('scratch_head', tF - 0.1, { fade: 0.25 })], [[-99, eyes, mouthAt(t, lt < 0.17 ? 'bigShock' : lt < tF ? 'gasp' : 'smile')]]);
      ch.lookAt(c, 1, 40);
    } };
  }
  // 67_final_glass: wide, lobby lit: Vickers knocking at the glass, the horde behind; Ava and Ribbon in the foreground
  { const id = '67_final_glass', c = cam(48), K = A.knock67, P = V(0.55, 0, 3.6), DP = V(-0.35, 0, 3.3);
    out[id] = { scene, camera: c, overlay: ov(0.35), update(lt, t) {
      setState({ copOn: true, lit: lit6, lamp: false, barr: 2, dogOn: true }); setRain(t); rattle(t, 1, K); horde(t, 50);
      copSkin.forEach((m) => m.color.set(0x2a2e34)); copKnock(-0.2, t, K);
      ch.root.position.copy(P); ch.root.rotation.y = Math.PI + 0.35;
      ch.pose(lt, [L.seg('idle', -99, { loop: true, speed: 0.6 })], [[-99, 'open', 'neutral']]);
      dog.root.position.copy(DP); dog.root.rotation.y = Math.PI - 0.1; dog.update(lt, 'growl', { look: V(-0.2, 1.4, 0), growl: 0.6 });
      const k = L.smooth(lt / LEN(id));
      look(c, V(1.7, 1.85, 7.6 - 0.5 * k), V(0.0, 1.3, 0));
    } };
  }

  // ================================= ROUND 2 =================================
  const walkSeg = (id, i, o = {}) => { const [t0, , sp] = A.walks[id][i]; return L.seg('walk', t0 - T0[id], { loop: true, speed: sp, fade: 0.15, ...o }); };
  // 10b_okayest: LONG first-floor corridor, FIXED high at the far end, Ava small trying doors (only the door rattles):
  // two locked (LOCKED labels on "locked"), the third is a closet (opens on "closet"); cut on "mug" to the mug: WORLD'S OKAYEST COP
  { const id = '10b_okayest', c = cam(40), b = A.b10, tm = lo(id, b.mug), tOk = lo(id, b.ok), tLk = lo(id, b.lk), tCl = lo(id, b.closet);
    // closet (hinge on its far side): she stands on the near side OUTSIDE the leaf's swing, right hand on the handle, pulls it
    // open into the corridor, lets go once it swings, then turns to look in (hinge-to-body 1.11 m > leaf 0.76 m + 0.25 m)
    const PA = V(FX - 0.5, 0, 5.6), PB = V(FX - 0.5, 0, 4.7), PC = V(FX - 0.5, 0, DCZ + 0.62), YIN = angTo(PC, V(FX - 1.27, 0, DCZ));
    const [wa0, wa1] = b.wAB.map((x) => lo(id, x)), [wb0, wb1] = b.wBC.map((x) => lo(id, x)), RA = b.rA, RB = b.rB;
    const YD = -Math.PI / 2, YW = -Math.PI;
    out[id] = { scene, camera: c, update(lt, t) {
      setState({ lit: lit6, lamp: false, hero: lt < tm }); setRain(t); fcLights(true);
      const pA = pulse(t, RA, 0.06), pB = pulse(t, RB, 0.06);
      doorA.position.z = 5.6 + DW / 2 + 0.006 * pA * Math.sin(lt * 90); doorB.position.z = 4.7 + DW / 2 + 0.006 * pB * Math.sin(lt * 90);
      closetLeaf.rotation.y = 1.15 * L.smooth((lt - (tCl - 0.1)) / 0.5);
      if (lt < tm) {
        c.fov = 40; c.updateProjectionMatrix(); look(c, V(FX + 0.62, 2.6, FL - 0.35), V(FX - 0.3, 0.75, 3.4));
        let p, yaw;
        const tw = (a, b2) => L.smooth(Math.min((lt - a) / 0.18, (b2 - lt) / 0.18));
        if (lt < wa0) { p = PA; yaw = YD; } else if (lt < wa1) { p = lerpV(PA, PB, (lt - wa0) / (wa1 - wa0)); yaw = YD + (YW - YD) * tw(wa0, wa1); }
        else if (lt < wb0) { p = PB; yaw = YD; } else if (lt < wb1) { p = lerpV(PB, PC, (lt - wb0) / (wb1 - wb0)); yaw = YD + (YW - YD) * tw(wb0, wb1); } else { p = PC; yaw = YD + (YIN - YD) * L.smooth((lt - (tCl + 0.2)) / 0.3); }
        ch.root.position.copy(p); ch.root.rotation.y = yaw;
        ch.pose(lt, [L.seg('push_door', 0, { from: 0.15 }), walkSeg(id, 0), L.seg('push_door', wa1, { from: 0.2, fade: 0.15 }), walkSeg(id, 1), L.seg('push_door', wb1, { from: 0.1, fade: 0.12, speed: 0.8 })],
          [[-99, 'open', 'neutral'], [tLk, 'angry', 'frown'], [tCl, 'surprised', 'neutral']]);
        const wH = L.smooth((lt - (wb1 - 0.05)) / 0.15) * (1 - L.smooth((lt - (tCl + 0.12)) / 0.18));
        closetLeaf.updateMatrixWorld(true); reachTo('R', closetLeaf.localToWorld(V(0.09, 1.0, DW - 0.09)), wH);
      } else {
        c.fov = 30; c.updateProjectionMatrix(); const k = L.smooth((lt - tm) / (LEN(id) - tm));
        look(c, V(FX + 0.6 - 0.46 + 0.1 * k, 0.9 - 0.02 * k, MUG2.z - 0.12 + 0.04 * k), V(MUG2.x, MUG2.y + 0.055, MUG2.z));
      }
    }, overlay(lt, dt, a, o) {
      vignette(o, 0.32);
      if (lt < tm) {
        if (lt > tLk) { const [x1, y1] = L.toScreen(c, FX - 0.97, 1.9, 5.6), [x2, y2] = L.toScreen(c, FX - 0.97, 1.9, 4.7); label(o, '2 LOCKED', 190, 120, '#ff5a40', x1, y1); o.tctx.beginPath(); o.tctx.moveTo(190.5, 127.5); o.tctx.lineTo(x2 + 0.5, y2 + 0.5); o.tctx.stroke(); o.tctx.fillStyle = '#ff5a40'; o.tctx.fillRect(x2 - 1, y2 - 1, 3, 3); }
        if (lt > tCl) { const [x, y] = L.toScreen(c, FX - 0.97, 1.6, DCZ); label(o, 'CLOSET', 200, 200, '#ffd23f', x, y); }
      } else if (lt > tOk) { const [x, y] = L.toScreen(c, MUG2.x, MUG2.y + 0.11, MUG2.z); bigLabel(o, ["WORLD'S", 'OKAYEST COP'], 470, 96, '#ffd23f', x + 10, y - 6, lt - tOk, 2); }
    } };
  }
  // 43b_phones: dark front desk, over-object: the desk phone big in the foreground, Ava (frontal, looks at camera) lifts the
  // receiver ("phones"): dead line; hangs up on "cell"; her phone with ONE bar pops up as a pixel overlay on "one"
  { const id = '43b_phones', c = cam(42), P = V(1.45, 0, 8.4), tLf = lo(id, A.ph.lift), tE = lo(id, A.ph.ear), tD = lo(id, A.ph.dead), tH = lo(id, A.ph.cell - 0.12), tCe = lo(id, A.ph.cell), tO = lo(id, A.ph.one);
    out[id] = { scene, camera: c, update(lt, t) {
      setState({ lamp: false, barr: 2, lift: 0.8 }); setRain(t);
      look(c, V(1.66, 1.33, 9.62), V(1.42, 1.36, 8.4));
      ch.root.position.copy(P); ch.root.rotation.y = 0;
      ch.pose(lt, [L.seg('idle', -99, { loop: true, speed: 0.6 }), L.seg('scratch_head', tLf - 0.1, { from: 0.45, speed: 0, fade: 0.3 }), L.seg('idle', tH - 0.2, { loop: true, fade: 0.25 }), L.seg('phone_look', tCe + 0.05, { from: 0.4, speed: 0.4, fade: 0.25 })],
        [[-99, 'open', 'neutral'], [tE, 'half', 'neutral'], [tD, 'sad', 'frown'], [tO, 'surprised', 'gasp'], [tO + 0.45, 'sad', 'blep']]);
      ch.lookAt(c, lt > tCe + 0.2 && lt < tO ? 0.3 : 1, 40);
      if (lt > tLf - 0.05 && lt < tH + 0.25) {
        const hand = ch.hand('R').localToWorld(V(0, 0.75, 0.2)), k = L.smooth(Math.min((lt - tLf + 0.05) / 0.3, (tH + 0.25 - lt) / 0.3));
        recv.position.copy(RECV0).lerp(hand, k); recv.rotation.set(0, 0, 1.3 * k);
      }
      if (lt > tCe + 0.05) { follow(cell, 'R', [0, 0.85, 0.1], [Math.PI / 2, 0, 0]); cellL.position.copy(cell.position).add(V(0, 0.1, 0.12)); cellL.intensity = 1.2; }
    }, overlay(lt, dt, a, o) {
      vignette(o, 0.4);
      if (lt > tD && lt < tH + 0.1) label(o, 'DEAD LINE', 180, 104, '#ff5a40', ...L.toScreen(c, recv.position.x, recv.position.y, recv.position.z));
      if (lt > tO) { const k = L.smooth((lt - tO) / 0.12); drawPhone(o, 488, 56 + (1 - k) * 250, 2, { mode: 'bars', bars: 1, barFlash: (lt - tO) < 0.25 && Math.floor((lt - tO) * 16) % 2 === 0, busy: lt > tO + 0.4 });
        if (lt > tO + 0.1) bigLabel(o, 'ONE BAR', 380, 76, '#ffd23f', 498, 82, lt - tO - 0.1, 2); }
    } };
  }
  // 43d_text: A) close-up of Ava's OWN right hand (hero model, black fingerless glove) holding a 3D phone parented to Hand.R
  // (L.holdIn): the phone's back rests on her real palm (her own fingers along its left edge, no added boxes); SAFE typed on "safe", sent,
  // 'Delivered' on "delivered" (screen = canvas texture); B) cut to Ava frontal, the same phone in her hand, smiling at camera.
  // Brighter than the rest of the dark lobby (user note: the close-up read too dark).
  { const id = '43d_text', c = cam(24), P = V(1.45, 0, 8.4), K = A.tx.keys.map((x) => lo(id, x)), tS = lo(id, A.tx.send), tD = lo(id, A.tx.deliv), tC = lo(id, A.tx.cut);
    const UP = V(0, 1, 0);
    out[id] = { scene, camera: c, update(lt, t) {
      setState({ lamp: false, barr: 2, lift: 1 }); setRain(t);
      ch.root.position.copy(P); ch.root.rotation.y = 0;
      const typed = K.filter((k) => lt >= k).length;
      phoneScreen({ mode: 'chat', bars: 1, typed, cursor: Math.floor(lt * 3) % 2 === 0, sent: lt >= tS, sentAge: lt - tS, deliv: lt >= tD });
      hPhone.visible = true;
      if (lt < tC) {
        ch.pose(lt, L.still('phone_look', 0.6), [[-99, 'happy', 'smile']]);
        const k = L.smooth(lt / tC), PT = P.clone().add(V(-0.09, 1.16, 0.36)), EYE = P.clone().add(V(-0.06, 1.45, 0.13));
        const u = holdPhoneAt(PT, EYE);
        const pc = hPhone.localToWorld(V(0, 0, 0)), n = EYE.clone().sub(pc).normalize();
        // medium close-up from her right side, just off her eye line: her real gloved hand + forearm holding the phone, screen readable
        const R = V(-1, 0, 0), CO = [0.64, 0.3, 0.1, 38];
        c.fov = CO[3]; c.updateProjectionMatrix(); c.up.copy(u);
        look(c, pc.clone().addScaledVector(n, CO[0] - 0.05 * k).addScaledVector(R, CO[1]).addScaledVector(u, CO[2]), pc.clone().addScaledVector(u, -0.01));
        // brighter close-up: soft key light from her face side + the screen glow on the hand
        top.position.copy(pc).addScaledVector(n, 0.45).add(V(0.1, 0.15, 0)); top.color.set(0xe8eeff); top.distance = 1.1; top.intensity = 1.6;
        cellL.position.copy(pc).addScaledVector(n, 0.2); cellL.intensity = 0.45;
        hemi.intensity -= 0.35; fill.intensity -= 0.2;   // the front desk behind stays dark; only the hand/phone are lit
      } else {
        c.up.copy(UP);
        const k = L.smooth((lt - tC) / (LEN(id) - tC)); c.fov = 34; c.updateProjectionMatrix(); look(c, V(1.5, 1.48, 9.55 - 0.2 * k), V(1.45, 1.4, 8.4));
        ch.pose(lt, L.still('phone_look', 0.6), [[-99, 'happy', 'smile'], [tC + 0.5, lt < tC + 0.58 ? 'blink' : 'happy', 'cat']]);
        holdPhoneAt(P.clone().add(V(-0.13, 1.2, 0.3)), P.clone().add(V(-0.02, 1.52, 0.06)));
        ch.lookAt(c, 1, 40);
        ch.root.updateMatrixWorld(true); cellL.position.copy(hPhone.localToWorld(V(0, 0, 0))).add(V(0, 0.18, -0.05)); cellL.intensity = 1.6;
      }
    }, overlay(lt, dt, a, o) {
      if (lt >= tC) { vignette(o, 0.35); return; }
      vignette(o, 0.28);
      if (lt >= tD) { hPhone.updateMatrixWorld(true); const p = hPhone.localToWorld(V(0.0064, -0.0055, 0.006)); const [x, y] = L.toScreen(c, p.x, p.y, p.z); bigLabel(o, 'DELIVERED', 520, 110, '#8cff5a', x, y, lt - tD, 2); }
    } };
  }
  // 48p_tired: FIXED high corner of the dark lobby: Ava sits against the desk and yawns; 20 HOURS AWAKE on "twenty"
  { const id = '48p_tired', c = cam(42), P = V(-1.1, 0, 8.3), tY = lo(id, A.z1.yawn), tT = lo(id, A.z1.twenty);
    out[id] = { scene, camera: c, update(lt, t) {
      setState({ lamp: false, barr: 2, lift: 1 }); setRain(t); fill.intensity = 1.3;
      const k = L.smooth(lt / LEN(id)); look(c, lerpV(V(1.9, 3.3, 5.2), V(1.6, 3.1, 5.6), k), V(-1.1, 0.55, 8.2));
      ch.root.position.copy(P); ch.root.rotation.y = Math.PI;
      const yawn = lt > tY && lt < tY + 1.0;
      ch.pose(lt, [L.seg('sit_floor', -99, { from: 2.6, speed: 0 })], [[-99, yawn ? 'blink' : 'half', yawn ? (lt < tY + 0.15 || lt > tY + 0.85 ? 'surprised' : 'bigShock') : 'neutral']]);
      ch.lookAt({ position: yawn ? V(-1.1, 3.0, 6.5) : c.position }, yawn ? 0.6 : 1, 35);
    }, overlay(lt, dt, a, o) {
      vignette(o, 0.4);
      if (lt > tT) { const [x, y] = L.toScreen(c, P.x, 1.0, P.z); bigLabel(o, ['20 HOURS', 'AWAKE'], 470, 104, '#ffd23f', x + 8, y, lt - tT, 2); }
    } };
  }
  // 48r_guard: A) THROUGH the K-9 door frame: Ribbon lies across the doorway, eyes open, Ava asleep behind (slow push);
  // B) on "doorway": low close on Ribbon's open eyes, Ava asleep behind; C) on "two hours": the wall clock jumps 12:40 -> 2:40;
  // back to A on "feels like ten minutes"
  { const id = '48r_guard', c = cam(44), AV = V(-3.4, 0, 10.3), DP = V(-4.72, 0, 10.9), tB = lo(id, A.zg.cB), tC = lo(id, A.zg.cC), tA2 = lo(id, A.zg.cA), tTwo = lo(id, A.zg.two);
    out[id] = { scene, camera: c, update(lt, t) {
      setState({ lamp: false, barr: 2, dogOn: true, k9a: 1.5, lift: 1 }); setRain(t); fill.intensity = 1.3;
      clock.position.set(XW - 0.03, 2.25, 10.9); clock.rotation.set(0, -Math.PI / 2, 0); clock.scale.setScalar(1.8);
      const jm = L.smooth((lt - tTwo) / 0.55), tot = 40 + 120 * jm + (lt < tTwo ? lt / 60 : (lt - tTwo) / 60);
      setClock(Math.floor(tot / 60), tot % 60, jm > 0 && jm < 1 ? (jm * 600) % 60 : Math.floor(lt) % 60);
      ch.root.position.copy(AV); ch.root.rotation.y = -Math.PI / 2;
      ch.pose(lt, [L.seg('sit_floor', -99, { from: 2.6, speed: 0 })], [[-99, 'blink', 'neutral']]);
      ch.lookAt({ position: V(-4.2, 0.2, 10.75) }, 1, 28);   // asleep: chin down, head tipped
      dog.root.position.copy(DP); dog.root.rotation.y = Math.PI;
      if (lt < tB || lt >= tA2) {
        const k = L.smooth(lt / tB); c.fov = 44; c.updateProjectionMatrix();
        look(c, lerpV(V(-6.4, 1.2, 10.9), V(-6.0, 1.0, 10.88), lt < tB ? k : 1), V(-2.6, -0.1, 10.62));   // high enough that her boots clear Ribbon's back
        dog.update(lt, 'sleepy_wag', { headUp: 0.3, look: c.position, wag: 0.12 });
      } else if (lt < tC) {
        const k = L.smooth((lt - tB) / (tC - tB)); c.fov = 38; c.updateProjectionMatrix();
        look(c, lerpV(V(-4.05, 0.42, 9.6), V(-4.2, 0.4, 9.8), k), V(-4.78, 0.38, 10.55));
        dog.update(lt, 'sleepy_wag', { headUp: 0.35, look: c.position, wag: 0.1 });
      } else {
        c.fov = 45; c.updateProjectionMatrix(); look(c, V(3.15, 2.2, 10.9), V(XW, 2.25, 10.9));
        dog.update(lt, 'sleepy_wag', { headUp: 0.3, wag: 0.1 });
      }
    }, overlay(lt, dt, a, o) {
      vignette(o, 0.45);
      if (lt > tTwo && lt < tA2) bigLabel(o, '+2 HOURS', 470, 104, '#ffd23f', null, null, lt - tTwo, 2);
    } };
  }
  // 48s_nose: steep high angle (near top-down): Ava asleep against the desk; Ribbon pushes her nose into her ear on "nose";
  // Ava opens her eyes and looks up at camera, cute. 2:40 AM
  { const id = '48s_nose', c = cam(42), AV = V(-3.4, 0, 10.3), DP = V(-3.3, 0, 11.4), tN = lo(id, A.nose), tW = lo(id, A.wake);
    const NOSE_H = [-0.00022, 0.00179, -0.00097], EAR = V();   // Ribbon's nose tip in Head-bone space (measured: farthest skinned vertex)
    out[id] = { scene, camera: c, update(lt, t) {
      setState({ lamp: false, barr: 2, dogOn: true, lift: 1 }); setRain(t); fill.intensity = 1.3;
      top.position.set(-3.9, 2.4, 10.4); top.color.set(0xb8c8f0); top.distance = 4; top.intensity = 2.4;
      look(c, V(-4.78, 2.5, 10.05), V(-3.5, 0.62, 10.5));
      ch.root.position.copy(AV); ch.root.rotation.y = -Math.PI / 2;
      const awake = lt > tW, kk = L.smooth((lt - tW) / 0.35);
      ch.pose(lt, [L.seg('sit_floor', -99, { from: 2.6, speed: 0 })], [[-99, 'blink', 'neutral'], [tW, 'surprised', 'neutral'], [tW + 0.4, 'happy', 'cat']]);
      if (!awake) ch.lookAt({ position: V(-4.2, 0.2, 10.75) }, 1, 28); else ch.lookAt(c, kk, 40);
      // her left ear (toward Ribbon, +z) from the posed Head bone; Ribbon walks in and touches it with her nose tip on "nose"
      ch.root.updateMatrixWorld(true); const ear = EAR.copy(ch.bone.getObjectByName('Head').getWorldPosition(V())).add(V(0, 0.07, 0.085));
      const kin = L.smooth((lt - (tN - 0.55)) / 0.5), kout = L.smooth((lt - (tW + 0.45)) / 0.4), k = kin * (1 - 0.6 * kout);
      dog.root.position.set(DP.x, 0, DP.z); dog.root.rotation.y = Math.PI + 0.25;
      dog.update(lt, 'stand', { look: ear, wag: lt > tW ? 0.6 : 0.2 });
      const nose = dog.head.localToWorld(V(...NOSE_H)), d = ear.clone().add(V(0, 0, 0.015)).sub(nose); d.y = 0;
      dog.root.position.addScaledVector(d, k); dog.update(lt, 'stand', { look: ear, wag: lt > tW ? 0.6 : 0.2 });
    }, overlay(lt, dt, a, o) {
      vignette(o, 0.42);
      reText(o.tctx, '2:40 AM', 590, 20, 1, '#9aa8d8', { outline: '#000000' });
      if (lt > tN && lt < tN + 0.6) { const ear = L.toScreen(c, EAR.x, EAR.y, EAR.z); reText(o.tctx, 'SNIFF!', ear[0] + 46, ear[1] - 30, 2, '#ffffff', { outline: '#000000' }); }
    } };
  }
  // 58b_fifty: through the glass: the street fills; counter on the glass 20 -> 50 on "fifty"; Vickers keeps knocking
  { const id = '58b_fifty', c = cam(46), K = A.knock58b, tF = lo(id, A.fifty);
    const arr = Array.from({ length: 50 }, (_, i) => (i < 20 ? null : A.cnt58b + (A.fifty - 0.15 - A.cnt58b) * (i - 20) / 29));
    out[id] = { scene, camera: c, update(lt, t) {
      setState({ hero: false, copOn: true, lamp: false, barr: 2 }); setRain(t); rattle(t, 1, K);
      copSkin.forEach((m) => m.color.set(0x3a4048)); copKnock(-0.55, t, K);
      horde(t, 50, arr);
      const k = L.smooth(lt / LEN(id)); look(c, V(0.3, 1.75 + 0.1 * k, 3.4 - 0.4 * k), V(0.3, 1.2, -5.0));
    }, overlay(lt, dt, a, o) {
      vignette(o, 0.4);
      const n = lt > tF ? 50 : 20, age = lt > tF ? lt - tF : 9; const [x, y] = L.toScreen(c, 1.6, 2.75, 0);
      zCounter(o, Math.min(560, Math.max(380, x)), Math.max(100, y), n, age);
    } };
  }
  // 58c_inside: LOW angle: Ribbon stares at the glass, turns away ("turns") toward the dark interior hallway behind the
  // barred gate and growls on "growls"
  { const id = '58c_inside', c = cam(50), DP = V(-0.7, 0, 5.1), tT = lo(id, A.turns), tG = lo(id, A.growls), GATE = V(GX, 0.8, ZB + 1.5);
    const Y1 = Math.PI + ((((angTo(DP, GATE) - Math.PI + Math.PI) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) - Math.PI);   // shortest turn from PI
    out[id] = { scene, camera: c, update(lt, t) {
      setState({ hero: false, lamp: false, barr: 2, dogOn: true, lift: 0.8 }); setRain(t); fill.intensity = 1.3; hallL.intensity = 0.5;
      const k = L.smooth(lt / LEN(id)); look(c, V(1.0 - 0.1 * k, 0.32, 2.4 + 0.25 * k), V(-2.0, 1.15, 12.5));
      const kt = L.smooth((lt - tT) / 0.8); dog.root.position.copy(DP); dog.root.rotation.y = Math.PI + (Y1 - Math.PI) * kt;
      if (lt < tT) dog.update(lt, 'stare', { look: V(0.2, 1.5, 0) });
      else if (lt < tT + 0.8) dog.update(lt, 'walk', { speed: 0.8 });
      else if (lt < tG) dog.update(lt, 'stare', { look: GATE });
      else dog.update(lt, 'growl', { look: GATE, growl: 1 });
    }, overlay: ov(0.45) };
  }
  // 58d_cross: A) FIXED high corner of the dark lobby: Ava crosses slowly, flashlight off; B) cut when she reaches the
  // hallway zone: from BEHIND the barred gate (bars in the foreground), she comes toward it and looks at camera
  { const id = '58d_cross', c = cam(46), W = A.walks[id][0], v = 0.92 * W[2], tC = lo(id, A.cross.cut);
    const PTS = [V(-1.9, 0, 7.2), V(-3.75, 0, 8.55), V(-3.6, 0, 12.0)];
    out[id] = { scene, camera: c, update(lt, t) {
      setState({ lamp: false, barr: 2, lift: 0.8 }); setRain(t); fill.intensity = 1.2;
      const { p, yaw } = pathAt(PTS, v * lt); ch.root.position.copy(p); ch.root.rotation.y = yaw;
      ch.pose(lt, [walkSeg(id, 0, { fade: 0 })], [[-99, 'open', 'neutral'], [tC + 0.5, 'surprised', 'neutral']]);
      if (lt < tC) { c.fov = 46; c.updateProjectionMatrix(); look(c, V(2.3, 4.3, 3.9), V(-2.6, 0.6, 8.8)); }
      else { c.fov = 44; c.updateProjectionMatrix(); const k = L.smooth((lt - tC) / (LEN(id) - tC)); look(c, V(GX - 0.15, 1.45, ZB + 1.25 - 0.15 * k), V(-3.7, 1.0, 8.4)); ch.lookAt(c, L.smooth((lt - tC - 0.3) / 0.4), 40); }
      follow(torch, 'R', [0, 0.7, 0.15], [0, 0, 0]);
    }, overlay: ov(0.45) };
  }
  // 58e_breathing: the long pitch-dark hallway seen through the gate bars, slow push-in; something breathes far away
  // (a dark shape drifts across the faint window light at the far end; never revealed)
  { const id = '58e_breathing', c = cam(40), tB = lo(id, A.breath);
    out[id] = { scene, camera: c, update(lt, t) {
      setState({ hero: false, lamp: false, barr: 2 }); setRain(t); hallL.intensity = 2.2; hallL.distance = 13;
      const k = L.smooth(lt / LEN(id)); look(c, V(GX + 0.3, 1.45, ZB - 1.3 + 0.95 * k), V(GX + 0.1, 1.15, HZ1));
      const ks = L.smooth((lt - tB) / 2.6); shade.visible = lt > tB - 0.1; shade.position.set(GX - 0.75 + 1.2 * ks, 0.88, HZ1 - 0.6);
    }, overlay(lt, dt, a, o) { vignette(o, 0.6); } };
  }
  // 58f_faster: from inside: Vickers knocks faster and faster (only the glass shakes); his head follows Ava as she crosses the
  // foreground
  { const id = '58f_faster', c = cam(44), W = A.walks[id][0], v = 0.92 * W[2], K = A.knock58f, P0 = V(2.5, 0, 3.3), P1 = V(-2.5, 0, 3.3);
    out[id] = { scene, camera: c, update(lt, t) {
      setState({ copOn: true, lamp: false, barr: 2, lift: 0.6 }); setRain(t); rattle(t, 1, K); horde(t, 50);
      const { p, yaw } = pathAt([P0, P1], v * lt); ch.root.position.copy(p); ch.root.rotation.y = yaw;
      ch.pose(lt, [walkSeg(id, 0, { fade: 0 })], [[-99, 'open', 'neutral']]);
      copSkin.forEach((m) => m.color.set(0x3a4048)); copKnock(0.3, t, K); copHeadTo(p.clone().add(V(0, 1.4, 0)), 1);
      look(c, V(0.25, 1.32, 7.6 - 0.25 * L.smooth(lt / LEN(id))), V(0.25, 1.45, 0));
    }, overlay: ov(0.42) };
  }
  // 67b_hallway: LOW fixed: Ribbon growls at the dark hallway behind the barred gate; on the desk in the background the
  // radio's LED lights up on "radio"
  { const id = '67b_hallway', c = cam(44), DP = V(-3.8, 0, 9.8), tG = lo(id, A.growl67), tR = lo(id, A.radio67);
    out[id] = { scene, camera: c, update(lt, t) {
      setState({ hero: false, lit: lit6, lamp: false, barr: 2, dogOn: true }); setRain(t); horde(t, 50);
      look(c, V(-2.6, 0.55, 6.0), V(-2.0, 1.0, 11.5));
      dog.root.position.copy(DP); dog.root.rotation.y = angTo(DP, V(GX, 0, ZB));
      dog.update(lt, lt < tG - 0.3 ? 'stare' : 'growl', { look: V(GX, 0.9, ZB + 1), growl: 1 });
      radioSet(lt > tR ? 1 : 0, t, { talk: false, stat: 0.5 }); rGlow.scale.setScalar(6); lcdGlow.scale.setScalar(3);
    }, overlay: ov(0.42) };
  }
  return out;
}
