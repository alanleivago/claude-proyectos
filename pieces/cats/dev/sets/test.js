// interior sets test shots: per set a wide, a close-up and a dolly (one second each)
const T_std = (who, x, f, h = 520, o = {}) => { ivCastShadow(x, o.y ?? GROUND, h, { a: 0.3 }); return ivMan({ who, x, y: o.y ?? GROUND, h, f, pose: ivPose(o.pose || 'relaxed'), expr: o.expr || { eyes: 'open', mouth: 'smile' } }); };
const T_cat = (coat, x, y, s = 150, f = -1, o = {}) => { ivCastShadow(x, y, s * 0.9, { a: 0.28, w: 0.5, len: 0.6 }); return ivCat({ x, y, s, f, coat, pose: o.pose || 'sit', expr: o.expr || {}, ...o }); };
const T_dolly = (lt, a, b) => { const u = EZ.io(clamp(lt)); IV_CAM = { x: lerp(a[0], b[0], u), y: lerp(a[1], b[1], u), z: lerp(a[2], b[2], u) }; };
const T_SETS = [];
const T_add = (key, wide, close, dolly, a, b) => T_SETS.push([key, wide, close, dolly, a, b]);
// ---- bedroom
const T_bedM = () => { const P = SET_POS.bedroom; ivMan({ who: CAST.kai, x: P.bedSit[0], y: P.bedSit[1], h: P.bedSit[2], f: 0.3, pose: ivPose('sit', { hL: [0.18, 0.12], hR: [0.26, 0.1] }), expr: { eyes: 'wide', mouth: 'o', brow: 'up' } }); };
const T_bedOn = () => { const P = SET_POS.bedroom; ivCat({ x: P.chest[0], y: P.chest[1], s: P.chest[2], f: -1, coat: CATS.pickles, pose: 'loaf', expr: { eyes: 'half' } }); };
T_add('bed-morning', () => SET_bedroom({ act: T_bedM, onBed: T_bedOn }), [1000, 560, 2.6], null, [820, 560, 1], [1060, 610, 1.45]);
const T_bedN = () => { T_std(CAST.kai, 1500, 0.5, 520, { expr: { eyes: 'wide', mouth: 'o' } }); T_cat(CATS.pickles, 1160, 985, 140, 1, { pose: 'loaf' }); };
T_add('bed-night', () => SET_bedroom({ t: 'night', act: T_bedN, knock: true }), [1680, 470, 2.4], null, [1300, 540, 1], [1500, 500, 1.4]);
// ---- hall
const T_hall = () => { const P = SET_POS.hall; T_cat(CATS.pickles, P.spot[0] + 10, P.spot[1] - 8, P.spot[2], 1, { pose: 'loaf', expr: { eyes: 'half' } }); T_std(CAST.kai, 1080, -0.4, 520, { expr: { eyes: 'open', mouth: 'smile' } }); };
T_add('hall', () => SET_hall({ act: T_hall }), [800, 700, 2.6], null, [700, 520, 1], [1000, 560, 1.5]);
// ---- kitchen
const T_kit = () => { const P = SET_POS.kitchen; ivMan({ who: CAST.lily, x: P.seats[0], y: GROUND, h: 340, f: 0.5, pose: ivPose('sitDesk'), expr: { eyes: 'happy', mouth: 'grin' } }); ivMan({ who: CAST.mom, x: P.seats[1], y: GROUND, h: 540, f: -0.5, pose: ivPose('sitDesk'), expr: { eyes: 'open', mouth: 'smile' } });
  T_std(CAST.kai, 760, 0.5); T_cat(CATS.pickles, P.catBed[0], P.catBed[1] - 22, P.catBed[2], 1, { pose: 'loaf', expr: { eyes: 'half' } }); };
T_add('kitchen', () => SET_kitchen({ act: T_kit }), [1200, 560, 2.6], null, [700, 540, 1], [1100, 560, 1.4]);
// ---- bathroom
const T_bath = () => { const P = SET_POS.bathroom; ivMan({ who: { ...CAST.kai, top: 'none' }, x: P.shower[0], y: P.shower[1], h: P.shower[2], f: 0.3, pose: ivPose('wave'), expr: { eyes: 'happy', mouth: 'open' } }); };
const T_bDoor = (x, y, s) => ivCat({ x, y, s, f: -1, coat: CATS.pickles, pose: 'sit', expr: { eyes: 'half' } });
T_add('bath', () => SET_bathroom({ act: T_bath, doorway: T_bDoor, curtain: 1, steam: 0.7 }), [1220, 620, 3.2], null, [800, 540, 1], [1100, 560, 1.45]);
// ---- classroom
const T_cls = () => { const P = SET_POS.classroom; T_std(CAST.teacher, P.teacher[0], 0.6, 540, { pose: 'hips', expr: { eyes: 'angry', mouth: 'flat', brow: 'angry' } }); ivMan({ who: CAST.kai, x: P.seat[0], y: P.seat[1], h: P.seat[2], f: -0.6, pose: ivPose('sitDesk'), expr: { eyes: 'happy', mouth: 'grin' } }); };
T_add('class', () => SET_classroom({ act: T_cls }), [1400, 470, 3.2], null, [1100, 540, 1], [1300, 520, 1.45]);
// ---- gomez
const T_gom = () => { ivMan({ who: CAST.gomez, x: 880, y: GROUND, h: 520, f: 0.4, pose: ivPose('sit'), expr: { eyes: 'happy', mouth: 'smile' } }); T_std(CAST.kai, 1440, -0.5, 520, { pose: 'think' }); };
T_add('gomez', () => SET_gomez({ act: T_gom, cats: 6, ring: true }), [1720, 520, 2.6], null, [700, 540, 1], [1150, 520, 1.45]);
// ---- newsroom
const T_news = () => { const P = SET_POS.newsroom; ivMan({ who: CAST.anchor, x: P.anchor[0], y: P.anchor[1], h: P.anchor[2], f: 0.1, pose: ivPose('sitDesk', { hL: [0.1, 0.17], hR: [0.16, 0.16] }), expr: { eyes: 'open', mouth: 'smile' } }); };
T_add('news', () => SET_newsroom({ act: T_news }), [960, 470, 2.4], null, [700, 520, 1], [1000, 500, 1.4]);
// ---- void
const T_void = () => { T_std(CAST.kai, 760, 0.4); T_cat(CATS.pickles, 1150, GROUND, 160, -1); };
T_add('void', () => SET_void({ act: T_void }), [900, 520, 2.6], null, [700, 540, 1], [1100, 540, 1.4]);
// ---- register: wide @ i*3, close @ i*3+1, dolly @ i*3+2
SHOT(60, 'ledge', () => { IV_CAM = { x: 1460, y: 480, z: 3.2 }; IV_FOCUS = 2.2; ivStage(SET_classroom({ act: T_cls })); });
T_SETS.forEach(([key, set, close, _d, a, b], i) => {
  SHOT(i * 3, key, () => { ivStage(set()); });
  SHOT(i * 3 + 1, key + '-close', () => { IV_CAM = { x: close[0], y: close[1], z: close[2] }; ivStage(set()); });
  SHOT(i * 3 + 2, key + '-dolly', (lt) => { T_dolly(lt, a, b); ivStage(set()); });
});
// edge checks: tracks to x ±400 at z 1, and a z 1.5 corner (t = 70 + 3i …)
T_SETS.forEach(([key, set], i) => {
  SHOT(70 + i * 3, key + '-edgeL', () => { IV_CAM = { x: 560, y: 540, z: 1 }; ivStage(set()); });
  SHOT(71 + i * 3, key + '-edgeR', () => { IV_CAM = { x: 1360, y: 540, z: 1 }; ivStage(set()); });
  SHOT(72 + i * 3, key + '-edgeZ', () => { IV_CAM = { x: 1360, y: 420, z: 1.5 }; ivStage(set()); });
});
