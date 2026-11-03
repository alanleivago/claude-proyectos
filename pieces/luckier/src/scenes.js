// =====================================================================
//  SCENES — the beat table (one row per beat), dispatch to the set that owns each beat, HUD, captions, fact cards.
//  A set function gets (g, t, b): t = film time, b = the beat row (b.id, b.t0, b.t1, b.k = 0..1 progress, b.shot).
//  Sets: STREET (setStreet), INSIDE (setInside), CASINO (setCasino), ISLAND (setIsland).
// =====================================================================
// [t0, set, shot id, caption, breaks-in-a-row, people-who-lost, status, day]
const BEATS = [
  [0.0,   'island', 'teaser',      'You can\'t lose.',                                        null, null, null, null],
  [7.0,   'street', 'flip',        'You flip a coin. Heads.',                                  1, 0, 'NORMAL', 1],
  [16.0,  'inside', 'toast',       'The toast lands butter side up.',                          2, 0, 'NORMAL', 1],
  [25.0,  'street', 'greens',      'Every light turns green.',                                 11, 0, 'NORMAL', 1],
  [34.0,  'street', 'twenty',      'Twenty dollars, just lying there.',                        12, 0, 'LUCKY', 1],
  [43.0,  'inside', 'cafe',        'You\'re the 100th customer today. Coffee\'s free.',        13, 0, 'LUCKY', 1],
  [52.0,  'street', 'rival',       'The other guy up for your job? His car won\'t start.',     14, 1, 'LUCKY', 2],
  [61.0,  'inside', 'hired',       'You get the job.',                                         15, 1, 'LUCKY', 2],
  [70.0,  'inside', 'scratch',     'First scratch card of your life. A winner.',               16, 1, 'LUCKY', 4],
  [79.0,  'inside', 'powerball',   'Then the Powerball. Every number.',                        17, 1, 'JACKPOT', 9],
  [88.0,  'inside', 'cheque',      'Half the price of every ticket goes into the prize.',      17, 1, 'JACKPOT', 10],
  [97.0,  'street', 'losers',      'So your jackpot is everyone else\'s losing ticket.',       17, 92000000, 'JACKPOT', 10],
  [106.0, 'inside', 'again',       'You win again. And again.',                                21, 160000000, 'JACKPOT', 60],
  [115.0, 'inside', 'ginther',     'It has happened before.',                                  22, 175000000, 'JACKPOT', 90],
  [124.0, 'inside', 'news',        'The news calls you the luckiest man alive.',               24, 190000000, 'FAMOUS', 120],
  [133.0, 'casino', 'arrive',      'So you go where luck is the whole business.',              24, 190000000, 'FAMOUS', 121],
  [142.0, 'casino', 'slots',       'Every machine you touch pays out.',                        31, 190000140, 'FAMOUS', 121],
  [151.0, 'casino', 'roulette',    'Your number comes up. Then again.',                        35, 190000180, 'FAMOUS', 121],
  [160.0, 'casino', 'montecarlo',  'The famous record is 26 in a row.',                        51, 190000260, 'FAMOUS', 121],
  [169.0, 'casino', 'forty',       'You get to 40.',                                           65, 190000410, 'FAMOUS', 121],
  [178.0, 'casino', 'pitboss',     'The casino notices.',                                      65, 190000410, 'FAMOUS', 121],
  [187.0, 'casino', 'banned',      'In Nevada, a casino can ban you for any reason.',          65, 190000410, 'BANNED', 121],
  [196.0, 'casino', 'photos',      'Every casino in town has your photo.',                     65, 190000410, 'BANNED', 122],
  [205.0, 'street', 'stormcomes',  'On the way home, a storm rolls in.',                       66, 190000410, 'BANNED', 122],
  [214.0, 'street', 'sunhole',     'It rains on every house but yours.',                       70, 190000460, 'BANNED', 123],
  [223.0, 'street', 'strikes',     'Lightning finds everyone near you.',                       74, 190000470, 'BANNED', 123],
  [232.0, 'street', 'sullivan',    'One park ranger was struck seven times.',                  74, 190000470, 'BANNED', 123],
  [241.0, 'casino', 'stadium',     'A football team pays you just to sit in the stands.',      90, 190060000, 'A LUCKY CHARM', 160],
  [250.0, 'casino', 'plane',       'Airlines fly you for free. Nothing goes wrong on your flights.', 120, 190060000, 'A LUCKY CHARM', 200],
  [259.0, 'casino', 'ship',        'A stewardess once survived three ship disasters.',         120, 190060000, 'A LUCKY CHARM', 210],
  [268.0, 'casino', 'otherteam',   'The other team never wins again.',                         150, 190900000, 'A LUCKY CHARM', 260],
  [277.0, 'street', 'flood',       'Your neighbors\' basements flood. Yours stays dry.',       170, 191000000, 'A LUCKY CHARM', 300],
  [286.0, 'inside', 'laidoff',     'Your best friend gets laid off. You get promoted.',        172, 191000001, 'FEARED', 310],
  [295.0, 'inside', 'insurance',   'Insurers won\'t cover anyone who lives near you.',         175, 191000300, 'FEARED', 330],
  [304.0, 'street', 'moving',      'One by one, the neighbors move away.',                     180, 191000420, 'FEARED', 360],
  [313.0, 'inside', 'giveaway',    'You give your money away.',                                181, 191000420, 'FEARED', 380],
  [322.0, 'inside', 'comesback',   'It comes back. Doubled.',                                  182, 391000420, 'FEARED', 381],
  [331.0, 'inside', 'tvwarning',   'Every winner needs a loser. And you never lose.',          190, 700000000, 'FEARED', 400],
  [340.0, 'street', 'billion',     'A billion people have lost something to your luck.',      200, 1000000000, 'FEARED', 420],
  [349.0, 'street', 'signs',       'They don\'t hate you. They\'re scared of you.',            200, 1000000000, 'FEARED', 430],
  [358.0, 'street', 'leave',       'So you leave.',                                            200, 1000000000, 'FEARED', 440],
  [367.0, 'island', 'eye',         'You go where your luck can\'t hurt anyone.',               201, 1000000000, 'ALONE', 445],
  [376.0, 'island', 'ring',        'The storms go around you.',                                220, 1000000000, 'ALONE', 500],
  [385.0, 'island', 'fish',        'You never have to fish. They come to you.',                260, 1000000000, 'ALONE', 600],
  [394.0, 'island', 'strike',      'Lightning hits the water a few meters away. Again.',       300, 1000000000, 'ALONE', 700],
  [403.0, 'island', 'night',       'At night, the shooting stars all miss.',                   330, 1000000000, 'ALONE', 760],
  [412.0, 'island', 'asteroid',    'Then an asteroid heads straight for Earth.',               331, 1000000000, 'ALONE', 800],
  [421.0, 'island', 'swerve',      'It misses. You\'re on Earth.',                            332, 1000000000, 'ALONE', 800],
  [430.0, 'island', 'lonely',      'The luckiest man alive. And no one to tell.',              340, 1000000000, 'ALONE', 900],
  [439.0, 'island', 'pocket',      'In your pocket, the same old coin.',                       340, 1000000000, 'ALONE', 901],
  [448.0, 'island', 'flipagain',   'You flip it, one more time.',                              340, 1000000000, 'ALONE', 901],
  [457.0, 'island', 'spin',        '',                                                         340, 1000000000, 'ALONE', 901],
  [466.0, 'island', 'edge',        'It lands on its edge.',                                    0, 1000000000, '???', 901],
  [475.0, 'island', 'nobody',      'Not heads. Not tails. For once, nobody lost.',             0, 1000000000, '???', 901],
  [486.0, 'island', 'smile',       'Not even you.',                                            0, 1000000000, 'NORMAL', 901],
  [496.0, 'card',   'card',        '',                                                         null, null, null, null],
];
const BEAT_ROWS = BEATS.map(([t0, set, shot, cap, row, lost, status, day], i) => ({ id: i, t0, t1: i + 1 < BEATS.length ? BEATS[i + 1][0] : DURATION, set, shot, cap, row, lost, status, day }));
const beatAt = (t) => { let i = 0; while (i + 1 < BEAT_ROWS.length && t >= BEAT_ROWS[i + 1].t0) i++; return BEAT_ROWS[i]; };
// glass fact cards [t0, card]
const FACTS = [
  [81,  { title: 'Powerball jackpot', value: '1 in 292,201,338', lines: ['The odds of matching all six numbers', 'Multi-State Lottery Association'] }],
  [90,  { title: 'Where the prize comes from', value: '50%', lines: ['of every ticket\'s price goes into the prize pool', 'Colorado lottery rule (Powerball)'] }],
  [116, { title: 'Joan Ginther, Texas', value: '4 wins', lines: ['Four Texas lottery jackpots, 1993–2010', 'About $20.4 million in all'] }],
  [161, { title: 'Monte Carlo, 18 Aug 1913', value: '26 blacks', lines: ['The ball landed on black 26 times in a row', 'Odds: about 1 in 67 million'] }],
  [188, { title: 'Nevada law', value: 'Any reason', lines: ['Casinos keep the right to bar a player', 'as long as it isn\'t discrimination'] }],
  [233, { title: 'Roy Sullivan, park ranger', value: '7 strikes', lines: ['Struck by lightning seven times, 1942–1977', 'For most people: 1 in 1,222,000 a year (NWS)'] }],
  [260, { title: 'Violet Jessop', value: '3 disasters', lines: ['Olympic collision 1911 · Titanic 1912', 'Britannic 1916. She survived all three'] }],
  [467, { title: 'A coin on its edge', value: '1 in 6,000', lines: ['Estimated for a US nickel', 'Murray & Teare, Physical Review E, 1993'] }],
];
function facts(t) {
  for (const [t0, F] of FACTS) { const t1 = t0 + 8; if (t < t0 || t >= t1) continue;
    hdFact({ ...F, unit: '', a: Math.min(ev(t0, 0.5), 1 - ev(t1 - 0.5, 0.5)), y: 250 }); }
}
// ---- HUD: left = the streak and the red counter, right = status + day
function lkCount(b, t) {   // the red counter eases from the previous beat's value
  const prev = BEAT_ROWS[Math.max(0, b.id - 1)].lost ?? 0, cur = b.lost ?? 0, k = EZ.io(seg(t, b.t0 + 0.8, b.t0 + 3.5));
  return Math.round(lerp(prev, cur, k));
}
function hud(t, b) {
  if (b.row == null) return;
  const a = Math.min(ev(7.4, 0.8), 1 - ev(495, 0.8)); if (a <= 0) return;
  const lost = lkCount(b, t), f = () => {
    const x = 56, y = 52, w = 500, h = 236, pad = 30, halo = 'rgba(0,0,0,0.3)';
    hdGlass(x, y, w, h, 22, a);
    hdText('LUCKY BREAKS IN A ROW', x + pad, y + 44, 16, { font: HD.thin, weight: 600, spacing: 2.6, alpha: a, halo });
    hdText(b.row.toLocaleString('en-US'), x + pad, y + 112, 66, { font: HD.thin, weight: 300, alpha: a, halo });
    ctx.save(); screen(); ctx.globalAlpha = a * 0.3; ctx.fillStyle = '#fff'; ctx.fillRect(x + pad, y + 138, w - 2 * pad, 1); ctx.restore();
    hdText('PEOPLE WHO LOST SO YOU COULD WIN', x + pad, y + 172, 14, { font: HD.thin, weight: 700, spacing: 2.2, alpha: a, color: '#ff8a7a', halo });
    hdText(lost.toLocaleString('en-US'), x + pad, y + 216, 38, { font: HD.thin, weight: 400, alpha: a, color: '#ff6b5a', halo });
    const rw = 380, rx = W - 56 - rw;
    hdGlass(rx, y, rw, 130, 22, a);
    hdText('YOU ARE', rx + rw - pad, y + 44, 16, { font: HD.thin, weight: 600, spacing: 2.6, alpha: a, align: 'right', halo });
    hdText(b.status, rx + rw - pad, y + 92, 40, { font: HD.thin, weight: 600, alpha: a, align: 'right', color: b.status === 'BANNED' || b.status === 'FEARED' ? '#ff8a7a' : '#ffffff', halo });
    hdText(`DAY ${b.day}`, rx + rw - pad, y + 118, 14, { font: HD.thin, weight: 600, spacing: 2.4, alpha: a * 0.8, align: 'right', halo });
  };
  if (DEFER) DEFER.push(f); else f();
}
function captions(t, b) {
  if (!b.cap) return;
  hdCaption(b.cap, b.t0 + 0.6, Math.min(b.t1 - 0.3, b.t0 + 8.2));
}
function endCard(t) {
  fillAll('#07080b');
  const a = ev(496.6, 0.8), d = ev(499.6, 0.9);
  hdText('What if you kept getting luckier', W / 2, 360, 60, { align: 'center', alpha: a });
  hdText('and couldn\'t stop?', W / 2, 434, 60, { align: 'center', alpha: a });
  ['Powerball jackpot odds: 1 in 292,201,338', 'Lightning, any given year: 1 in 1,222,000 · A coin on its edge: 1 in 6,000'].forEach((l, i) =>
    hdText(l.toUpperCase(), W / 2, 526 + i * 34, 16, { font: HD.sans, weight: 600, spacing: 3, align: 'center', alpha: ev(497.4 + i * 0.4, 0.8) * 0.8 }));
  ctx.save(); screen(); ctx.globalAlpha = 0.45 * d; ctx.fillStyle = HD.amber; ctx.fillRect(W / 2 - 50, 636, 100, 2); ctx.restore();
  hdText('relax, this could never happen...', W / 2, 736, 46, { italic: true, align: 'center', alpha: d });
  hdText('could it?', W / 2, 804, 52, { italic: true, align: 'center', alpha: ev(501.0, 0.9) });
}
const SETS = { street: () => setStreet, inside: () => (typeof setInside === 'function' ? setInside : null), casino: () => setCasino, island: () => setIsland };
function sceneMain() {
  const t = TT, b = beatAt(t); b.k = seg(t, b.t0, b.t1);
  if (t >= 6.2 && t < 7.0) { fillAll('#000'); return; }
  if (b.set === 'card') { endCard(t); return; }
  const fn = SETS[b.set] && SETS[b.set]();
  if (fn) fn(g3(), t, b); else { fillAll('#333'); hdText(`[${b.set}: ${b.shot}]`, W / 2, H / 2, 40, { align: 'center' }); }
  hud(t, b); captions(t, b); facts(t);
}
TIMELINE.board = BEAT_ROWS.filter((b) => b.set !== 'card').map((b, i, A) => ({ t: b.t0 + Math.min(4.2, (b.t1 - b.t0) * 0.55), title: `${b.shot}: ${b.cap || '(no caption)'}`, sound: '', next: A[i + 1] ? A[i + 1].shot : 'card' }));
