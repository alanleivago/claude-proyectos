// props test shots: one per second, each prop normal size and big
function prop_tbg(c1, c2) { ctx.fillStyle = ivVGrad(-400, 1300, [c1 || '#3a2c3c', c2 || '#1a1420']); ctx.fillRect(-1200, -400, 4300, 1900); }
function prop_tfloor(y = 900, c = '#2a2026') { ctx.fillStyle = c; ctx.fillRect(-1200, y, 4300, 900); ivLine(-1200, y, 3100, y, 2, 'rgba(255,220,180,0.25)'); }
const prop_T = [];
function prop_t(key, mood, draw) { prop_T.push([key, mood, draw]); }
prop_t('party', 'lamp', () => {
  prop_tbg('#4a3434', '#1e1416'); prop_tfloor(860, '#4a3228');
  P_balloon(140, 700, 1); P_balloon(260, 700, 1, { free: clamp(TT % 1), key: 'f' }); P_balloon(420, 1000, 2.6, { col: '#e0393b', len: 60 });
  P_lemonCake(720, 860, 1); P_lemonCake(1150, 860, 2.2, { slice: true });
  P_ring(1450, 860, 1); P_ring(1600, 860, 6);
  ivCat({ x: 1800, y: 860, s: 150, f: -1, coat: CATS.pickles, pose: 'sit', expr: { eyes: 'half' } }); P_catHat(1793, 772, 0.85, { ang: -0.25 });
  P_catHat(1860, 520, 3, { ang: 0.1 });
});
prop_t('found', 'night', () => {
  prop_tbg('#1a2033', '#0d1020'); prop_tfloor(900, '#1a1a24');
  P_wallet(200, 900, 1); P_wallet(330, 900, 1, { flat: true }); P_wallet(600, 900, 3.2);
  ivRR(940, 100, 40, 900, 8, '#3a3d48'); P_flyer(960, 520, 1); P_flyer(1450, 520, 3.6, { ang: 0.02 });
});
prop_t('phones', 'night', () => {
  prop_tbg('#1a2033', '#0d1020');
  P_phone(200, 500, 2.4, { screen: (w, h) => P_phoneUI.map(w, h, { route: clamp(TT % 1 * 1.5) }) });
  P_phone(470, 500, 2.4, { screen: (w, h) => P_phoneUI.call(w, h, { name: 'MOM', incoming: true }) });
  P_phone(740, 500, 2.4, { screen: (w, h) => P_phoneUI.call(w, h, { name: 'POLICE', status: '02:14' }) });
  P_phone(1010, 500, 2.4, { screen: (w, h) => P_phoneUI.news(w, h, { head: 'Teen "Cat Whisperer" finds 11 lost pets' }) });
  P_phone(1600, 560, 9.5, { screen: (w, h) => P_phoneUI.map(w, h, { drop: clamp(TT % 1 * 2) }) });
});
prop_t('police', 'night', () => {
  prop_tbg('#141a2c', '#080a12'); prop_tfloor(900, '#151a24');
  P_policeCar(560, 900, 0.75, { lights: 1 }); P_policeCar(1450, 900, 0.55, { lights: 0, dir: -1 });
  ivMan({ who: CAST.cop, x: 1050, y: 900, h: 520, f: 0.4, pose: ivPose('relaxed') });
});
prop_t('policeBig', 'night', () => { prop_tbg('#141a2c', '#080a12'); prop_tfloor(1000, '#151a24'); P_policeCar(900, 1000, 1.5, { lights: 1 }); });
prop_t('kitchen', 'lunch', () => {
  prop_tbg('#6a5048', '#2e2230'); prop_tfloor(860, '#7a5a44');
  P_bowl(160, 860, 1, { full: 1, name: 'PICKLES' }); P_bowl(320, 860, 1, { water: true, col: '#e05a7a' }); P_tunaCan(450, 860, 1); P_tunaCan(540, 860, 1, { open: true });
  P_bowl(800, 860, 3, { full: 0.7 }); P_tunaCan(1200, 860, 3.2, { open: true });
  P_tv(1640, 860, 1, { screen: (w, h) => { ctx.fillStyle = '#2a3a6a'; ctx.fillRect(0, 0, w, h); ivMan({ who: CAST.anchor, x: w / 2, y: h + 120, h: 300, f: 0 }); } });
});
prop_t('bath', 'office', () => {
  prop_tbg('#8aa0b0', '#4a5a6a');
  P_showerHead(120, 200, 1); P_showerHead(700, 160, 2.4, { len: 800 }); P_showerHead(1880, 220, 1, { dir: -1, on: false });
  P_pipe(1300, 700, 1, { len: 400, floor: 260 }); P_gasMeter(1600, 500, 1, { leak: 1 });
});
prop_t('basement', 'lamp', () => {
  prop_tbg('#3a2e2a', '#181210'); prop_tfloor(950, '#2a2220');
  P_pipe(700, 250, 3, { len: 400, floor: 230 }); P_gasMeter(1500, 700, 2.4, { leak: 1, pipe: 120 }); P_gasMeter(200, 700, 0.8);
});
prop_t('dogs', 'night', () => {
  prop_tbg('#1e2440', '#0c0f1c'); prop_tfloor(900, '#1a1d2c');
  ivMan({ who: CAST.kai, x: 200, y: 900, h: 520, f: 0.4, pose: ivPose('relaxed') });
  ivCat({ x: 420, y: 900, s: 150, f: 1, coat: CATS.shadow, pose: 'sit' });
  P_dog(650, 900, 1); P_dog(950, 900, 1, { pose: 'stand', f: -1 }); P_dog(1350, 900, 1, { pose: 'bark' });
  P_dog(1750, 900, 0.6, { pose: 'bark', f: -1, col: '#3a3438', belly: '#d8d0c8' });
});
prop_t('dogBig', 'night', () => { prop_tbg('#1e2440', '#0c0f1c'); prop_tfloor(1040, '#1a1d2c'); P_dog(520, 1040, 3, { pose: 'bark' }); P_dog(1550, 1040, 2.8, { pose: 'sit', f: -1, expr: { eyes: 'happy' } }); });
prop_t('critters', 'day', () => {
  prop_tbg('#9aa8b8', '#5a6878'); prop_tfloor(900, '#7a7066');
  P_pigeon(150, 900, 1); P_pigeon(260, 900, 1, { f: -1, key: 'p2' }); P_pigeon(380, 700, 1, { fly: true }); P_mouse(520, 900, 1); P_mouse(640, 900, 1, { run: true, f: -1 }); P_moth(760, 700, 1);
  P_pigeon(1000, 900, 5); P_mouse(1550, 900, 5, { run: true }); P_moth(1600, 300, 6);
});
prop_t('garage', 'night', () => {
  prop_tbg('#141a30', '#080a14'); prop_tfloor(920, '#141824');
  P_garageDoor(560, 920, 0.9, { open: 0, tag: 'BOSS' }); P_garageDoor(1450, 920, 0.6, { open: 0.6, lit: 1 });
  P_streetLamp(1100, 920, 1); P_sign(1750, 920, 0.6, "BOSS'S HOUSE");
});
prop_t('sign', 'lunch', () => { prop_tbg('#a88a70', '#5a4a40'); prop_tfloor(920, '#6a5a4a'); P_sign(960, 920, 1.6, "BOSS'S HOUSE"); P_sign(300, 500, 0.8, 'FREE FOOD', { posts: false, paw: false }); P_streetLamp(1750, 920, 1, { on: false, dir: -1 }); });
prop_t('train', 'night', () => {
  prop_tbg('#141a30', '#080a14'); prop_tfloor(860, '#1a1a22');
  const r = P_trainCar(820, 860, 0.85, { door: clamp(TT % 1 * 1.3), light: 1, inside: (w, h) => ivMan({ who: CAST.lily, x: w / 2, y: h - 10, h: 320, f: 0.2, pose: ivPose('relaxed'), expr: { eyes: 'sad' } }) });
  P_balloon(r.door[0] + r.door[2] + 20, r.door[1] + 120, 1, { key: 'tb' });
  P_trainCar(1750, 860, 0.4, { num: '7', ext: [-40, -30] });
});
prop_t('fair', 'sunset', () => {
  prop_tbg('#6a3a5a', '#2a1a2c'); prop_tfloor(900, '#3a2a30');
  P_stringLights(-100, 120, 2000, 160, { sag: 110 });
  P_stall(450, 900, 0.9, { goods: 'lemonade' }); P_stall(1150, 900, 0.75, { goods: 'balloons', text: 'BALLOONS', col: '#3c6fd1', vp: [-160, -420] }); P_stall(1720, 900, 0.6, { goods: 'toys', text: 'TOYS', col: '#7a4ab0' });
});
prop_t('rings+map', 'night', () => {
  prop_tbg('#141a30', '#080a14');
  P_soundRings(250, 300, 220, clamp(TT % 1 * 1.2)); P_soundRings(250, 800, 200, 1, { loop: 0.8, squash: 0.35 });
  P_cityMap(1150, 540, 1.1, 0.45 + 0.4 * clamp(TT % 1), { yard: 1 });
});
prop_t('hz', 'night', () => { prop_tbg('#141a30', '#080a14'); P_hzChart(960, 540, 1.3, clamp(TT % 1 * 1.1)); });
prop_t('news', 'office', () => {
  prop_tbg('#3a4458', '#1a2030');
  P_tv(450, 820, 1.2, { screen: (w, h) => { ctx.fillStyle = '#25356a'; ctx.fillRect(0, 0, w, h); ctx.scale(0.45, 0.45); P_newsLowerThird(20, 270, 840, 'Cat Whisperer finds 11 pets', { a: 1 }); } });
  P_newsLowerThird(700, 700, 1150, 'LOCAL TEEN "CAT WHISPERER" FINDS ELEVEN LOST PETS', { a: clamp(TT % 1 * 3) });
});
prop_t('closeRing', 'lamp', () => { prop_tbg('#3a2a26', '#1a1210'); P_ring(700, 860, 10); P_balloon(1500, 1150, 6, { len: 40 }); });
prop_T.forEach(([key, mood, draw], i) => SHOT(i, key, () => { IV_M = IV_MOOD[mood]; ivStage([{ d: 1, draw }]); }));
