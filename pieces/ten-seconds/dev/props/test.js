// props test shots: one per second, each prop normal size and big
function prop_tbg(c1, c2) { ctx.fillStyle = ivVGrad(-400, 1300, [c1 || '#3a2c3c', c2 || '#1a1420']); ctx.fillRect(-1200, -400, 4300, 1900); }
function prop_tfloor(y = 900, c = '#2a2026') { ctx.fillStyle = c; ctx.fillRect(-1200, y, 4300, 900); ivLine(-1200, y, 3100, y, 2, 'rgba(255,220,180,0.25)'); }
const prop_T = [];
function prop_t(key, mood, draw) { prop_T.push([key, mood, draw]); }
prop_t('phone', 'night', () => {
  prop_tbg('#1a2033', '#0d1020'); prop_tfloor();
  P_phone(300, 500, 2.2, { screen: (w, h) => P_phoneUI.message(w, h, { from: 'UNKNOWN', text: 'Nice corner. I see twenty.', stamp: '11:42:10 PM' }) });
  P_phone(560, 500, 2.2, { screen: (w, h) => P_phoneUI.bank(w, h, {}) });
  P_phone(820, 500, 2.2, { ang: 0.12, screen: (w, h) => P_phoneUI.camera(w, h, { rec: 7, count: 47 }) });
  P_phone(1080, 500, 2.2, { screen: (w, h) => P_phoneUI.news(w, h, { head: 'City adds one second to yellow lights' }) });
  P_phone(1260, 500, 2.2, { back: true }); P_phone(1380, 840, 1); P_phone(1440, 840, 1, { off: true, ang: -0.3 });
  P_phone(1700, 560, 9, { screen: (w, h) => P_phoneUI.message(w, h, { from: 'UNKNOWN', text: 'Nice corner. I see twenty.', stamp: '11:42:10 PM' }) });
});
prop_t('lunch', 'lunch', () => {
  prop_tbg('#5a4048', '#2e2230'); ivRR(-1200, 700, 4300, 30, 0, '#9a7a78'); ctx.fillStyle = '#5c4248'; ctx.fillRect(-1200, 730, 4300, 400);
  P_tray(260, 702, 1); P_carton(470, 702, 1); P_carton(560, 702, 1, { ang: -0.6 }); P_carton(650, 702, 1, { ang: -1.57 }); P_juiceSpill(500, 712, 1, 0.3); P_juiceSpill(780, 712, 0.8, 1);
  P_tray(1200, 702, 3.2); P_carton(1640, 702, 4.5, { ang: -0.25 });
});
prop_t('school', 'day', () => {
  prop_tbg('#8a95a8', '#4a5468'); prop_tfloor(900, '#6a5a4a');
  P_basketball(150, 900, 1); P_basketball(260, 900, 3); P_quiz(560, 400, 1, { ang: 0.1 }); P_quiz(560, 680, 3.6, { name: 'THEO', answers: ['PHOTOSYNTHESIS', '', 'MITOCHONDRIA'], grade: 'A+' });
  ['rock', 'paper', 'scissors'].forEach((k, i) => { P_rpsHand(860 + i * 70, 400, 1, k, { sleeve: CAST.you.col }); P_rpsHand(920 + i * 330, 900, 4.6, k, { sleeve: i === 1 ? CAST.nia.col : CAST.you.col, flip: i === 1 }); });
});
prop_t('arcade', 'night', () => {
  prop_tbg('#2a1838', '#120a1c'); prop_tfloor(900, '#1c1226');
  P_claw(200, 300, 1, 1); P_claw(320, 300, 1, 0.4); P_claw(440, 300, 1, 0);
  ['bear', 'bunny', 'star', 'cat', 'duck', 'dino'].forEach((k, i) => { P_plush(150 + i * 80, 600, 1, k); });
  P_claw(800, 340, 4, 0.7, { cable: 400 }); P_plush(1200, 900, 5, 'bear'); P_plush(1600, 900, 5, 'bunny', { ang: 0.15 });
});
prop_t('cable+party', 'lamp', () => {
  prop_tbg('#3a2a36', '#1a1218'); ivRR(-1200, 820, 4300, 30, 0, '#6a4a40'); ctx.fillStyle = '#3a2a26'; ctx.fillRect(-1200, 850, 4300, 400);
  P_cableMap(560, 400, 0.95, 0.7 + 0.3 * clamp(TT - 4)); P_cableMap(1500, 240, 0.4, 0.4);
  P_cake(1250, 822, 1, true); P_cake(1650, 822, 2.3, true, { n: 6 }); P_cake(1060, 822, 0.8, false);
  ['#e5534b', '#f2c230', '#5aa9e6', '#9b6bd6'].forEach((c, i) => P_balloon(1150 + i * 90, 640, 1, c));
  P_balloon(200, 1000, 3.4, '#5aa9e6', { len: 120 });
});
prop_t('street1', 'sunset', () => {
  prop_tbg('#5b3a6c', '#2a1f2c'); prop_tfloor(900, '#2a1f2c');
  P_car(700, 900, 0.75, { door: 0.0, driver: true }); P_car(1500, 900, 0.75, { door: 0.8, col: '#4a7fbf', dir: -1 });
  P_ladder(130, 900, 0.8, 0); P_ladder(380, 900, 0.8, 0.5); P_ball(1100, 900, 1); P_ball(1050, 1020, 3);
  P_paintCan(1850, 900, 3, { lid: false });
});
prop_t('bike', 'day', () => {
  prop_tbg('#8a95a8', '#4a5468'); prop_tfloor(900, '#55504c');
  P_bike(350, 900, 1); P_bikeRider(1150, 900, 1, { who: CAST.cyclist }); P_bikeRider(1700, 900, 0.5, { dir: -1, who: CAST.you });
});
prop_t('truck+bus', 'rain', () => {
  prop_tbg('#121a33', '#070b18'); prop_tfloor(900, '#151a2c');
  P_truck(450, 430, 0.45); P_scooter(1000, 430, 0.6, { speed: 1 }); P_scooter(1280, 430, 1, { rider: false, dir: -1 });
  P_bus(750, 900, 0.42, { brake: 1 }); P_trafficLight(1820, 900, 0.9, 'red'); P_trafficLight(1650, 900, 0.9, 'yellow'); P_trafficLight(1550, 300, 1.2, 'green', { head: true });
});
prop_t('fall', 'rain', () => {
  prop_tbg('#2a3048', '#141826'); prop_tfloor(900, '#22252e');
  P_cane(150, 600, 1, { ang: 0.6 }); P_cane(350, 560, 1); P_bags(560, 900, 1); P_bags(800, 900, 1, { ang: -0.5, n: 1 });
  [0, 1, 2].forEach((i) => P_orange(960 + i * 50, 900, 1)); P_orange(1180, 900, 5);
  ivLine(1350, 650, 1600, 760, 34, '#8a5bb0'); P_cast(1600, 760, 2.4, { ang: Math.atan2(110, 250) });
  P_bags(1700, 900, 2.6);
});
prop_t('cards', 'office', () => {
  prop_tbg('#4a5468', '#22283a');
  P_cctv(60, 100, 620, 360, (w, h) => { ctx.fillStyle = '#556070'; ctx.fillRect(0, 0, w, h); ctx.fillStyle = '#333a44'; ctx.fillRect(0, h * 0.6, w, h); P_bus(w * 0.4, h * 0.85, 0.12); P_truck(w * 0.85, h * 0.85, 0.15, { dir: -1 }); }, { stamp: 'FRI 11:42:07 PM' });
  P_statCard(740, 100, 420, 260, '1,086', 'RED-LIGHT DEATHS A YEAR (US)', { head: 'EVERY YEAR' });
  P_statCard(1200, 100, 300, 260, '⅓', 'LESS RED-LIGHT RUNNING'); P_statCard(1540, 100, 300, 260, '2.1 s', 'THE YELLOW', { light: true });
  P_newsCard(80, 540, 560, 420, 'Bus driver suspended after sudden stop injures passenger', { kicker: 'CITY TRANSIT' });
  P_dayCard(980, 720, 0.85, 3, 19); P_dayCard(1560, 720, 0.85, 5, 47);
});
prop_t('small', 'lamp', () => {
  prop_tbg('#3a2a26', '#1a1210'); ivRR(-1200, 760, 4300, 30, 0, '#6a4a40'); ctx.fillStyle = '#3a2a26'; ctx.fillRect(-1200, 790, 4300, 400);
  P_stopwatch(120, 300, 1, 2.1); P_stopwatch(420, 360, 12, 2.1); P_clock(760, 230, 1, 11, 42, { sec: 10 }); P_clock(760, 520, 3, 7, 5);
  P_keys(1000, 200, 1); P_keys(1080, 260, 4, { ang: 0.1 }); P_mug(980, 762, 1, 1); P_mug(1250, 762, 3.5, 1, { text: '#1 DAD' });
  P_wheel(1600, 300, 1); P_wheel(1650, 680, 2.2, { tilt: 0.5, ang: 0.2 });
});
prop_t('closeWheel', 'rain', () => { prop_tbg('#141a2c', '#080a12'); P_wheel(900, 620, 5.2, { ang: -0.1 }); P_keys(1650, 300, 6); });
prop_t('closeMap', 'night', () => { prop_tbg('#141a2c', '#080a12'); P_cableMap(960, 540, 1.7, 0.75); });
prop_t('closeLight', 'rain', () => { prop_tbg('#141a2c', '#080a12'); P_trafficLight(560, 540, 3.2, 'yellow', { head: true }); P_stopwatch(1350, 560, 22, 2.0); });
prop_t('closeStreet', 'sunset', () => { prop_tbg('#5b3a6c', '#2a1f2c'); prop_tfloor(980, '#2a1f2c'); P_car(700, 980, 1.3, { door: 0.55 }); P_truck(2000, 980, 0.8, { dir: -1 }); });
prop_T.forEach(([key, mood, draw], i) => SHOT(i, key, () => { IV_M = IV_MOOD[mood]; ivStage([{ d: 1, draw }]); }));
