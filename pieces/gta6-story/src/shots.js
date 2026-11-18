// ---- shot spec per beat (ids from comic_script.md). Scene: {bg, ch:[C(layer, x, h, opts)], z zoom, f focus
// [chIndex, rx, ry] | [x, y], pan, fx:[...], sfx:[{x,y,size,rot}], inset caller, off:{who:[x,y]}, radio:[x,y],
// lt:{itemIndex:{x,y}}}; page: {panels:[scene...], L layout}. Everything else is automatic.
META.cr_raul.mouth = [1105, 300]; delete META.cr_raul.noface;
const NAT = (id, o = {}) => { const m = META[id]; return C(id, (m.box[0] + m.box[2]) / 2, m.box[3] - m.box[1], Object.assign({ yb: m.box[3] }, o)); };
const CARD = { jason: 'jl_plate', lucia: 'dimez_plate', cal: 'bay_plate', drequan: 'drequan_plate', brian: 'brian_plate', dimez: 'dimez_plate', raul: 'raul_plate', boobie: 'boobie_plate' };
const card = (n, o = {}) => Object.assign({ bg: CARD[n], ch: [NAT('cr_' + n)] }, o);
const NIGHT = ['night'];
const SHOTS = {
  // 0. opening
  '0.1': { panels: [card('jason', { z: 1.1 }), card('lucia'), { bg: 'bay_plate' }], moves: [0, 1, 2] },
  '0.2': { panels: [card('lucia', { fx: ['dark'], title: { x: 0.52, y: 0.5, size: 150, at: 1.2 }, z: 1.15, f: [0, 0.5, 0.35] })] },
  // 1. the cell
  '1.1': { bg: 'bg_cell', ch: [C('lucia_bunk', 1150, 900)], fx: ['bars', 'flicker'], sfx: [{ x: 520, y: 420, rot: -0.08 }] },
  '1.2': { bg: 'bg_cell', ch: [C('lucia_bunk', 1150, 900)], z: 2.2, f: [0, 0.5, 0.66], free: true, fx: ['flicker'], tr: 'cut' },
  '1.3': { bg: 'bg_cell', ch: [C('mendez_cell', 620, 820, { enter: 'left' }), C('lucia_bunk', 1450, 860)], fx: ['bars', 'flicker'], sfx: [{ x: 1500, y: 160, size: 160, rot: 0.1 }] },
  '1.4': { bg: 'bg_cell', ch: [C('mendez_cell', 640, 880), C('lucia_bunk', 1460, 880)], fx: ['flicker'], tr: 'cut' },
  '1.5': { bg: 'bg_cell', ch: [C('lucia_bunk', 1150, 900)], z: 1.9, f: [0, 0.5, 0.22], fx: ['flicker'], off: { mendez: [-60, 620] }, tr: 'cut' },
  '1.5b': { bg: 'bg_cell', ch: [C('mendez_cell', 900, 900)], z: 1.8, f: [0, 0.45, 0.25], fx: ['flicker'], off: { lucia: [W + 60, 600] }, tr: 'cut' },
  '1.6': { panels: [{ bg: 'ins_sign', z: 1.05 }, { bg: 'bg_cell', ch: [C('lucia_bunk', 1150, 900)], z: 2.2, f: [0, 0.5, 0.2] }], sfx: [{ x: 640, y: 820, size: 90 }] },
  // 2. panel credits
  '2.1': { panels: [card('jason', { name: 'JASON DUVAL' })] },
  '2.2': { panels: [card('cal', { name: 'CAL HAMPTON' })] },
  '2.3': { panels: [card('brian', { name: 'BRIAN HEDER' })] },
  '2.4': { panels: [card('raul', { name: 'RAUL BAUTISTA' })] },
  '2.5': { panels: [card('boobie', { name: 'BOOBIE IKE' })] },
  '2.6': { panels: [card('drequan', { name: "DRE'QUAN PRIEST" })] },
  '2.7': { panels: [card('dimez', { name: 'REAL DIMEZ', z: 1.5, f: [W * 0.2, H * 0.45] })] },   // right woman fails identity: keep her cropped/secondary
  '2.8': { panels: [card('lucia', { name: 'LUCIA CAMINOS' }), { bg: 'bg_garage', ch: [C('lucia_phone', 960, 1000)], z: 1.6, f: [0, 0.5, 0.3], fx: ['red'] }], L: [[34, 34, 1360, 1012], [1416, 34, 470, 1012]] },
  // 3. release
  '3.1': { bg: 'bg_gate', ch: [C('lucia_walk', 760, 760, { yb: 1040 })], sfx: [{ x: 1250, y: 200, size: 140 }] },
  '3.2': { bg: 'bg_gate', ch: [C('lucia_walk', 560, 780, { yb: 1050 }), C('jason_lean', 1380, 900, { enter: 'right' })] },
  '3.2b': { bg: 'bg_gate', ch: [C('lucia_walk', 600, 780, { yb: 1050 }), C('jason_lean', 1380, 900)], z: 1.3, f: [W / 2, 420], tr: 'cut' },
  '3.3': { bg: 'bg_highway', fx: ['speed'], pan: -60, sfx: [{ x: 1150, y: 760, size: 150, rot: -0.06 }] },
  '3.3b': { bg: 'bg_car_int', ch: [C('jason_drive', 620, 900), C('lucia_car', 1350, 900)] },
  '3.4': { bg: 'bg_gas', ch: [C('lucia_walk', 650, 760, { yb: 1050 }), C('jason_dock', 1350, 820, { yb: 1060 })] },
  '3.5': { panels: [{ bg: 'bg_gas', ch: [C('jason_dock', 960, 800, { yb: 1060 })], fx: ['flashback'] }, card('jason', { fx: ['flashback'] }), { bg: 'bay_plate', ch: [C('jason_drive', 900, 900)], fx: ['night', 'flashback'] }] },
  '3.6': { bg: 'bg_trailer', ch: [C('lucia_phone', 1250, 900)], inset: 'mendez', insetBg: 'bg_trailer', fx: NIGHT },
  // 4. the debt
  '4.1': { bg: 'brian_plate', ch: [C('brian_beers', 1200, 920)] },
  '4.2': { bg: 'brian_plate', ch: [C('jason_dock', 600, 860, { yb: 1060 }), C('brian_beers', 1400, 920)], tr: 'cut' },
  '4.2b': { bg: 'brian_plate', ch: [C('brian_beers', 1200, 920)], z: 1.6, f: [0, 0.5, 0.25], off: { jason: [-60, 600] }, tr: 'cut' },
  '4.3': { bg: 'brian_plate', ch: [C('lori_shrimp', 640, 900, { yb: 1060, enter: 'left' }), C('brian_beers', 1450, 900)], tr: 'cut' },
  '4.4': { bg: 'bg_porch', ch: [C('cal_scanner', 1120, 900)], fx: NIGHT, radio: [1350, 900], sfx: [{ x: 1600, y: 780, rot: 0.08 }] },
  '4.5': { bg: 'bg_porch', ch: [C('jason_dock', 520, 820, { yb: 1060 }), C('cal_scanner', 1380, 900)], fx: NIGHT, tr: 'cut' },
  '4.6': { bg: 'bg_porch', ch: [C('cal_scanner', 1120, 900)], z: 1.5, f: [0, 0.45, 0.25], fx: NIGHT, off: { jason: [-60, 600] }, tr: 'cut' },
  // 5. the job
  '5.1': { bg: 'drequan_plate', fx: [], pan: 40, sfx: [{ x: 1300, y: 300, size: 130, colors: ['#FFFFFF', '#5FE6FF'] }] },
  '5.2': { bg: 'boobie_plate', ch: [C('raul_booth', 600, 860), C('boobie_booth', 1330, 800)] },
  '5.2b': { bg: 'boobie_plate', ch: [C('jason_club', 520, 820), C('boobie_booth', 1380, 820)], tr: 'cut' },
  '5.3': { bg: 'boobie_plate', ch: [C('raul_booth', 560, 860), C('lucia_club', 1380, 880)], tr: 'cut' },
  '5.4': { bg: 'bg_club_stage', ch: [C('cr_dimez', 1450, 640, { d: 0.22 }), C('drequan_film', 640, 920)] },
  '5.5': { panels: [{ bg: 'ins_map' }, { bg: 'boobie_plate', ch: [C('boobie_booth', 960, 800)], z: 1.8, f: [0, 0.5, 0.25] }] },
  '5.6': { panels: [{ bg: 'boobie_plate', ch: [C('raul_booth', 900, 860)], z: 1.7, f: [0, 0.4, 0.22] }] },
  '5.6b': { panels: [{ bg: 'boobie_plate', ch: [C('cr_dimez', 1300, 600, { d: 0.2 }), C('jason_club', 700, 860)], z: 1.2 }, { bg: 'boobie_plate', ch: [C('lucia_club', 960, 900)], z: 1.5, f: [0, 0.5, 0.3] }] },
  '5.7': { panels: [{ bg: 'ins_phone' }, { bg: 'bg_bathroom', ch: [C('lucia_mirror', 960, 900)], z: 1.5, f: [0, 0.5, 0.3] }], lt: { 0: { x: 260, y: 520 } }, sfx: [{ x: 900, y: 860, size: 80 }] },
  '5.7b': { panels: [{ bg: 'bg_bathroom', ch: [C('lucia_mirror', 960, 900)], z: 1.7, f: [0, 0.5, 0.25] }] },
  // 6. it goes wrong
  '6.1': { bg: 'bg_bank', pan: -30 },
  '6.1b': { bg: 'bg_car_int', ch: [C('lucia_car', 1200, 900)], z: 1.2, off: {} },
  '6.2': { bg: 'bg_bank', ch: [C('raul_shout', 960, 900, { enter: 'left' })], fx: ['police'], sfx: [{ x: 1450, y: 200, size: 130 }] },
  '6.3': { panels: [{ bg: 'ins_tire' }, { bg: 'ins_windshield' }, { bg: 'ins_heli' }], sfx: [{ x: 600, y: 700, size: 150 }, { x: 1500, y: 320, size: 110, colors: ['#FFFFFF', '#FF8A3D'] }, { x: 1520, y: 820, size: 110 }], off: { jason: [1180, 420] }, lt: { 3: { x: 1520, y: 140 } } },
  '6.3b': { panels: [card('jason', { bg: 'bg_bank', fx: ['police'] }), { bg: 'ins_heli' }, { bg: 'bg_car_int', ch: [C('raul_shout', 960, 900)], fx: ['police'] }], sfx: [{ x: 420, y: 300, size: 130, colors: ['#FFFFFF', '#FF8A3D'] }] },
  '6.4': { bg: 'bay_plate', fx: ['speed', 'police_soft'], pan: -80, z: 1.1 },
  '6.5': { bg: 'raul_plate', ch: [C('raul_shout', 1150, 780, { enter: 'left' })], fx: ['police_soft'], sfx: [{ x: 700, y: 760, size: 150 }] },
  '6.6': { bg: 'bg_garage', ch: [C('lucia_phone', 1250, 900)], inset: 'mendez', insetBg: 'bg_garage', sfx: [{ x: 1650, y: 520, size: 80 }] },
  '6.7': { bg: 'bg_garage', ch: [C('jason_bills', 800, 920)] },
  '6.8': { bg: 'bg_garage', ch: [C('lucia_phone', 1100, 900)], z: 1.7, f: [0, 0.45, 0.25], tr: 'cut' },
  '6.8b': { bg: 'bg_garage', ch: [C('jason_bills', 800, 920)], z: 1.5, f: [0, 0.5, 0.25], off: { lucia: [W + 60, 620] }, tr: 'cut' },
  // 7. Cal finds out
  '7.1': { bg: 'bg_motel_ext', ch: [C('cal_tape', 1180, 760, { d: 0.25 })], fx: ['rain'], sfx: [{ x: 600, y: 330, size: 120, rot: -0.1 }] },
  '7.1b': { bg: 'bg_motel_ext', ch: [C('jason_dock', 480, 820, { yb: 1060 }), C('cal_tape', 1250, 900, { enter: 'right' })], fx: ['rain'], tr: 'cut' },
  '7.2': { bg: 'bg_motel_room', ch: [C('cal_tape', 1300, 900)], radio: [700, 760], sfx: [{ x: 380, y: 650, size: 80 }] },
  '7.3': { panels: [{ bg: 'ins_sign', fx: ['red'] }, { bg: 'ins_phone', fx: ['red'] }, { bg: 'bg_garage', ch: [C('lucia_phone', 1100, 900)], z: 1.5, f: [0, 0.45, 0.3], fx: ['red'] }] },
  '7.4': { bg: 'bg_motel_room', ch: [C('jason_bed', 600, 880), C('lucia_shout', 1450, 880)] },
  '7.5': { bg: 'bg_motel_room', ch: [C('jason_bed', 560, 880), C('lucia_shout', 1420, 900)], z: 1.15, f: [1, 0.45, 0.3], tr: 'cut' },
  '7.6': { bg: 'bg_motel_room', ch: [C('jason_bed', 960, 900)], z: 1.7, f: [0, 0.5, 0.22], ghost: ['bay_plate', 'bg_porch'], off: { lucia: [W + 60, 620] }, tr: 'cut' },
  '7.7': { bg: 'bg_motel_room', ch: [C('lucia_shout', 1000, 900)], z: 1.6, f: [0, 0.5, 0.3], tr: 'cut' },
  '7.7b': { bg: 'bg_motel_room', ch: [C('jason_bed', 900, 880, { flip: true })], fx: ['rain'], off: { lucia: [W + 60, 620] }, tr: 'cut' },
  '7.8': { bg: 'bg_motel_room', ch: [C('cal_tape', 1500, 860)], fx: ['headlights'], sfx: [{ x: 620, y: 300, size: 110 }] },
  // 8. only way out
  '8.1': { bg: 'bg_swamp', fx: ['mist', 'heli'], pan: 40, sfx: [{ x: 1350, y: 200, size: 140 }] },
  '8.2': { bg: 'bg_swamp', ch: [C('lucia_phone', 1200, 900)], inset: 'mendez', insetBg: 'bg_swamp', fx: ['police_soft', 'mist'] },
  '8.2b': { bg: 'bg_swamp', ch: [C('jason_swamp', 1500, 560, { d: 0.18, flip: true }), C('lucia_phone', 640, 900)], inset: 'mendez', insetAt: [1560, 60], insetBg: 'bg_swamp', fx: ['police_soft', 'mist'], tr: 'cut' },
  '8.3': { bg: 'bg_swamp', ch: [C('jason_swamp', 1000, 920)], fx: ['police_soft', 'mist'] },
  '8.3b': { bg: 'bg_swamp', ch: [C('jason_swamp', 1000, 920)], z: 1.5, f: [0, 0.5, 0.2], fx: ['heli', 'police_soft'], tr: 'cut' },
  '8.4': { panels: [{ bg: 'ins_phone_water' }, { bg: 'bg_swamp', ch: [C('lucia_swamp', 960, 900)], z: 1.8, f: [0, 0.5, 0.25], fx: ['police_soft'] }], sfx: [{ x: 500, y: 300, size: 150 }, { x: 800, y: 820, size: 90 }] },
  '8.5': { panels: [{ bg: 'ins_knife_band' }, { bg: 'bg_swamp', ch: [C('jason_swamp', 960, 900)], z: 1.7, f: [0, 0.5, 0.2] }, { bg: 'bg_swamp', ch: [C('lucia_swamp', 960, 900)], z: 1.7, f: [0, 0.5, 0.25] }], sfx: [{ x: 560, y: 820, size: 150 }] },
  '8.5b': { panels: [{ bg: 'ins_phone_water', z: 1.15, fx: ['police_soft'] }] },
  '8.6': { panels: [{ bg: 'bg_swamp', ch: [C('cr_jason', 1400, 960, { flip: true }), C('lucia_swamp', 520, 940)], fx: ['police', 'mist'], title: { x: 0.36, y: 0.8, size: 120, at: 1.0 } }] },
  '8.7': { panels: [{ bg: 'bg_swamp', ch: [C('cr_jason', 1400, 960, { flip: true }), C('lucia_swamp', 520, 940)], fx: ['police', 'mist'], title: { x: 0.36, y: 0.8, size: 120, at: -1 } }], pull: true, sirens: true, sfx: [{ x: 1500, y: 160, size: 150 }] },
  // 9. close
  '9.1': { panels: ['jason', 'cal', 'brian', 'raul', 'boobie', 'drequan', 'dimez', 'lucia'].map((n) => n === 'lucia' ? { bg: 'bg_garage', ch: [C('lucia_phone', 960, 1000)], z: 1.5, f: [0, 0.5, 0.3], fx: ['red'] } : card(n)),
    L: [0, 1, 2, 3, 4, 5, 6, 7].map((i) => [34 + (i % 4) * 468, 34 + Math.floor(i / 4) * 512, 448, 492]), lt: { 0: { x: 560, y: 470 } } },
};
