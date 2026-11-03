// Timeline of "The Library Where You Borrow People": shots timed to the voice words (../../voice/words.json, take 13),
// the camera grammar measured in the reference study (template: the bridge short): continuous slow push-ins;
// symmetric ease-in-out moves ~23 f; big reframes are cuts; impacts are 7-frame kicks that flip sign every frame.
export const FPS = 30;
export const TOTAL = 1850; // story timeline: voice 61.44 s + tail
import STORY_WORDS from "./words_story.json";
import VOICE_WORDS from "./words.json";
/** The story (shots, cameras, cast cues) was timed to take 13; the voice is take 17. Every beat sits on a word, so the
 *  render maps each voice-time instant to story time piecewise-linearly through the word onsets (same script, same
 *  221 words): storyFrame(f) is the story frame to pose for output frame f. */
const ANCH: [number, number][] = (() => {
  const a: [number, number][] = [[0, 0]];
  const sw = STORY_WORDS as { s: number }[], vw = VOICE_WORDS as { s: number }[];
  for (let i = 0; i < Math.min(sw.length, vw.length); i++) if (vw[i].s > a[a.length - 1][0] && sw[i].s > a[a.length - 1][1]) a.push([vw[i].s, sw[i].s]);
  a.push([TOTAL / 30, TOTAL / 30]);
  return a;
})();
export const storyTime = (tv: number) => {
  for (let i = 1; i < ANCH.length; i++) if (tv <= ANCH[i][0]) {
    const [v0, s0] = ANCH[i - 1], [v1, s1] = ANCH[i];
    return s0 + ((tv - v0) * (s1 - s0)) / (v1 - v0);
  }
  return tv;
};
export const storyFrame = (f: number) => storyTime(f / 30) * 30;
export const D0 = 6.0; // ground level (quay top) in the world built from the bridge template (m)
export type V3 = [number, number, number];

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const easeOut = (u: number) => 1 - (1 - clamp01(u)) ** 4;

// ---------------- places ----------------
// street: the library facade closes the old bridge road (x -6..6) at z = -50, facing the canal (+z)
export const LIB_Z = -50;
// reading room: an interior built far up the bank (x -12..12, z 412..434), entrance wall at z 412, shelves on the others
export const RZ0 = 412, RZ1 = 434, RX = 12, RH = 7.6;
export const DESK: V3 = [-6, D0, 418]; // front desk centre (librarian behind it at z + 1)
export const TABLE_Y = 0.78;
/** reading tables [centre x, z] and who sits at them (left chair faces +x, right chair faces -x) */
export const TABLES: [number, number][] = [[1.5, 425], [7.2, 425], [-4.2, 425], [-1.4, 429.6], [4.6, 429.6]];
export const SEAT_DX = 0.7;
export const YOU_SEAT: V3 = [TABLES[0][0] - SEAT_DX, D0, TABLES[0][1]];
export const MAN_SEAT: V3 = [TABLES[0][0] + SEAT_DX, D0, TABLES[0][1]];
export const LADY_SEAT: V3 = [TABLES[1][0] - SEAT_DX, D0, TABLES[1][1]];
export const FIRE_SEAT: V3 = [TABLES[1][0] + SEAT_DX, D0, TABLES[1][1]];
export const GLOBE: V3 = [-7.4, D0 + 1.05, 418];

// ---------------- shots ----------------
export type Light = "day" | "golden";
export type Crowd = "street" | "room" | "desk" | "catalog" | "farbank" | "globe";
export type ShotDef = { id: number; a: number; b: number; light: Light; crowd: Crowd; tau: (t: number) => number; towns?: boolean; sunAz?: number; sunEl?: number; inside?: boolean };
// interiors: a low raking key from the high windows (screen left, 34 deg up) so furniture and people throw real shadows
const S = (id: number, a: number, b: number, crowd: Crowd, towns = false): ShotDef => {
  const inside = crowd !== "street" && crowd !== "farbank";
  return { id, a, b, light: "day", crowd, tau: (t) => t, towns, inside, ...(inside ? { sunAz: -58, sunEl: 34 } : {}) };
};
export const SHOTS: ShotDef[] = [
  S(1, 0, 62, "street"), // hook: people walk into the library, nobody carries a book
  S(2, 62, 91, "room"), // "You borrow people." (white flash) reading room: every table is a reader + a person
  S(3, 91, 176, "desk"), // "You walk up to the desk ... catalog"
  S(4, 176, 375, "catalog"), // the catalog: Cooking for Beginners (crossed out) -> Refugee, Former Prisoner, Police Officer, Covered in Tattoos
  S(5, 375, 455, "desk"), // you pick one, "Former Prisoner, please."
  S(6, 455, 600, "desk"), // stamp + "Thirty minutes. Please return him in the same condition."
  S(7, 600, 700, "room"), // an actual man walks over and sits down
  S(8, 700, 838, "room"), // awkward two-shot, a hundred questions
  S(9, 838, 940, "room"), // "He's the book"
  S(10, 940, 1093, "room"), // glide to the next table: the lady + her firefighter
  S(11, 1093, 1162, "room"), // "Mine's way more interesting than yours"
  S(12, 1162, 1275, "street", true), // "this started in Denmark ... the Human Library"
  S(13, 1275, 1410, "farbank", true), // volunteers judged from far away
  S(14, 1410, 1495, "room"), // the rules: sit down, ask, they answer
  S(15, 1495, 1660, "room"), // a whole group -> the one sitting right in front of you
  S(16, 1660, 1755, "globe"), // dozens of countries
  S(17, 1755, TOTAL, "desk"), // "Don't judge a book by its cover... just borrow it."
];
/** crossfades (frames) at place changes; a white 4-frame flash after the hook */
export const XFADE: Record<number, number> = { 12: 8, 14: 8 };
export const FLASH_AT = 62;

export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
/** layers to draw at frame f: base shot, plus the next shot fading in during a crossfade */
export const layersAt = (f: number): { id: number; alpha: number }[] => {
  for (const s of SHOTS) {
    const x = XFADE[s.id];
    if (x && f >= s.a - x / 2 && f < s.a + x / 2) return [{ id: s.id - 1, alpha: 1 }, { id: s.id, alpha: (f - (s.a - x / 2) + 1) / (x + 1) }];
  }
  return [{ id: shotAt(f).id, alpha: 1 }];
};

// ---------------- camera ----------------
// Grammar (motion.md): every move is a symmetric smootherstep glide of 18-40 f; a reframe bigger than about half a
// frame width is a hard cut. Holds push in 0.15-0.35 %/f, ~0.6 %/f for ~35 f on punch words. Rolls of 4-5 deg.
export type Cam = { pos: V3; look: V3; fov: number; roll: number };
type Shot = Partial<Cam> & { pos: V3; look: V3 };
type Key = { f: number; dur?: number; cut?: boolean; s: (f: number) => Shot };
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
const mix = (a: Cam, b: Cam, k: number): Cam => ({
  pos: a.pos.map((v, i) => v + (b.pos[i] - v) * k) as V3, look: a.look.map((v, i) => v + (b.look[i] - v) * k) as V3,
  fov: a.fov + (b.fov - a.fov) * k, roll: a.roll + (b.roll - a.roll) * k,
});
const full = (c: Shot): Cam => ({ fov: 40, roll: 0, ...c });
const run = (keys: Key[], f: number) => {
  let cur = full(keys[0].s(f));
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (f < k.f) break;
    cur = k.cut ? full(k.s(f)) : mix(cur, full(k.s(f)), glide((f - k.f) / (k.dur ?? 24)));
  }
  return cur;
};
const T = (f: number) => f / FPS;
/** push-in factor since f0: the subject grows ~rate per frame; `punch` raises it (with 8 f soft edges) for the first n frames */
const pushK = (f: number, f0: number, rate: number, punch = 0, n = 35) => {
  const x = Math.max(0, f - f0);
  let s = rate * x;
  if (punch > rate) for (let i = 0; i < Math.min(x, n); i++) s += (punch - rate) * Math.max(0, Math.min(1, (i + 0.5) / 8, (n - i - 0.5) / 8));
  return Math.exp(-s);
};
/** several punches (word frames) on top of a steady creep */
const pushMulti = (f: number, f0: number, rate: number, punches: number[], punch = 0.006, n = 24) =>
  punches.reduce((k, p) => k * (f >= p ? pushK(f, p, 0, punch, n) : 1), pushK(f, f0, rate));
const dolly = (pos: V3, look: V3, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos: [look[0] + (pos[0] - look[0]) * k, look[1] + (pos[1] - look[1]) * k, look[2] + (pos[2] - look[2]) * k], look, ...rest });
const zoom = (pos: V3, look: V3, fov: number, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos, look, fov: (360 / Math.PI) * Math.atan(Math.tan((fov * Math.PI) / 360) * k), ...rest });
const rolled = (s: (f: number) => Shot, roll: number) => (f: number): Shot => ({ ...s(f), roll });
const W = (t: number) => Math.round(t * FPS) - 2; // a visual beat lands ~2 f before its word

// ---- framings (f -> camera) ----
const Y = D0;
const S1a = (f: number) => dolly([3, Y + 4.6, -22], [0, Y + 3.6, LIB_Z], pushK(f, 0, 0.002), { fov: 44 });
const S1b = (f: number) => dolly([1.6, Y + 2.3, -35], [0, Y + 3.4, LIB_Z], pushK(f, 22, 0.0025), { fov: 42 });
const S2a = (f: number) => dolly([-10.5, Y + 4.4, 413.2], [2.6, Y + 1.0, 427.5], pushK(f, 62, 0.0025), { fov: 54 });
const S3a = (f: number) => dolly([-5.25, Y + 1.85, 411.8], [-5.6, Y + 1.25, 418.3], pushK(f, 91, 0.0022), { fov: 44 });
const S4a = (f: number) => {
  const P = [W(6.98), W(8.34), W(9.26), W(10.3), W(11.3)];
  return dolly([-6.0, Y + 3.8, 417.75], [-6, Y + 1.06, 418.0], pushMulti(f, 176, 0.0008, P, 0.0024, 20), { fov: 41 }); // review: punches cut 'Beginners'
};
const S5a = (f: number) => dolly([-4.6, Y + 1.62, 414.4], [-5.6, Y + 1.5, 416.9], pushK(f, 375, 0.0022), { fov: 42 }); // medium close-up, not a big head (FRAMING.md)
const S6a = (f: number) => dolly([-6.25, Y + 1.6, 414.5], [-6.05, Y + 1.4, 419], pushMulti(f, 455, 0.002, [W(16.38)], 0.006, 30), { fov: 40 });
const S6b = (f: number) => dolly([-6.3, Y + 1.62, 416.0], [-6.25, Y + 1.55, 419], pushK(f, W(17.84), 0.0022), { fov: 38 });
const S7a = (f: number) => dolly([9.4, Y + 3.2, 420.6], [8.3, Y + 1.0, 427.3], pushK(f, 600, 0.002), { fov: 44 });
export const manWalkX = (t: number) => 10.6 + (MAN_SEAT[0] + 0.1 - 10.6) * clamp01((t - 20.3) / 1.55);
const S7b = (f: number) => { const x = manWalkX(T(f)); return dolly([x + 0.4, Y + 3.5, 421.2], [x - 0.2, Y + 1.0, 427.3], pushK(f, 618, 0.002), { fov: 42 }); }; // tracks him at 5.5 m, eye level
const S8a = (f: number) => dolly([1.5, Y + 1.7, 418.8], [1.5, Y + 1.3, 425], pushMulti(f, 700, 0.0018, [W(25.34)], 0.004, 30), { fov: 47 });
const S9a = (f: number) => dolly([2.05, Y + 1.6, 421.5], [MAN_SEAT[0], Y + 1.35, 425], pushMulti(f, 838, 0.0025, [W(29.74)], 0.006, 30), { fov: 36 });
const S10a = (f: number) => dolly([2.2, Y + 1.65, 419.0], [2.5, Y + 1.15, 425], pushK(f, 940, 0.002), { fov: 42 });
const S10b = (f: number) => dolly([6.95, Y + 1.7, 418.8], [6.95, Y + 1.25, 425], pushK(f, 958, 0.002), { fov: 42 });
const S11a = (f: number) => dolly([6.3, Y + 1.55, 421.2], [LADY_SEAT[0] - 0.12, Y + 1.35, 425], pushK(f, 1093, 0.003, 0.006, 30), { fov: 36 });
const S12a = (f: number) => dolly([34, Y + 18, 4], [0, Y + 4, LIB_Z + 2], pushK(f, 1158, 0.002), { fov: 44 }); // ~25 deg high, not a top-down over the billboards
const S12b = (f: number) => zoom([0, Y + 2.2, -35.5], [0, Y + 7.6, LIB_Z], 44, pushK(f, W(41.34), 0.002, 0.006, 30));
const S13a = (f: number) => zoom([18.1, Y + 2.7, -31.0], [18.1, Y + 2.1, 34], 6.0, pushMulti(f, 1275, 0.0022, [W(45.72)], 0.006, 30));
const S14a = (f: number) => dolly([-4.2, Y + 1.7, 418.5], [-4.2, Y + 1.25, 425], pushK(f, 1406, 0.0025), { fov: 42 });
const S15a = (f: number) => dolly([1.5, Y + 6.2, 413.4], [1.6, Y + 0.9, 427.5], pushK(f, 1495, 0.0013), { fov: 56 });
const S15b = (f: number) => dolly([1.5, Y + 1.6, 419.0], [1.5, Y + 1.2, 425], pushK(f, W(53.08), 0.0025), { fov: 40 });
const S16a = (f: number) => dolly([-6.75, Y + 1.75, 415.7], [GLOBE[0], Y + 1.35, GLOBE[2]], pushMulti(f, 1660, 0.0022, [W(56.36)], 0.005, 30), { fov: 36 });
const S16b = (f: number) => dolly([-5.9, Y + 1.7, 414.6], [-6.5, Y + 1.4, 418.6], pushK(f, W(58.0), 0.0025), { fov: 40 });
const S17a = (f: number) => dolly([-5.05, Y + 1.85, 412.0], [-5.08, Y + 1.4, 417.6], pushMulti(f, 1755, 0.0018, [W(60.6)], 0.005, 30), { fov: 46 });

export const CAMS: Record<number, Key[]> = {
  1: [{ f: 0, s: S1a }, { f: 22, dur: 36, s: S1b }],
  2: [{ f: 62, s: S2a }],
  3: [{ f: 91, s: S3a }],
  4: [{ f: 176, s: S4a }, { f: W(13.18), dur: 20, s: rolled(S4a, 0.04) }],
  5: [{ f: 375, s: S5a }, { f: W(13.52), dur: 20, s: rolled(S5a, 0.075) }, { f: W(14.26), dur: 18, s: rolled(S5a, 0) }],
  6: [{ f: 455, s: S6a }, { f: W(17.84), cut: true, s: S6b }, { f: W(19.48), dur: 20, s: rolled(S6b, -0.075) }],
  7: [{ f: 600, s: S7a }, { f: 618, dur: 40, s: S7b }],
  8: [{ f: 700, s: S8a }],
  9: [{ f: 838, s: S9a }],
  10: [{ f: 940, s: S10a }, { f: 958, dur: 36, s: S10b }],
  11: [{ f: 1093, s: rolled(S11a, -0.075) }],
  12: [{ f: 1158, s: S12a }, { f: W(41.34), cut: true, s: S12b }],
  13: [{ f: 1275, s: S13a }],
  14: [{ f: 1406, s: S14a }],
  15: [{ f: 1495, s: S15a }, { f: W(53.08) - 20, dur: 40, s: S15b }],
  16: [{ f: 1660, s: S16a }, { f: W(58.0), cut: true, s: S16b }],
  17: [{ f: 1755, s: S17a }, { f: W(59.86), dur: 20, s: rolled(S17a, 0.07) }],
};

// impact kicks (reference v14): the image offset flips sign every frame, decays to 0 in 7 f
export const KICKS: [number, number][] = [[16.38, 1], [25.34, 0.4], [60.6, 0.8]];
export const kickAt = (t: number) => {
  let a = 0;
  for (const [t0, g] of KICKS) {
    const n = Math.floor((t - t0) * FPS + 1e-6);
    if (n >= 0 && n < 7) a += g * (n % 2 ? -1 : 1) * (1 - n / 7) ** 1.5;
  }
  return a;
};
export const camAt = (id: number, f: number): Cam => {
  const c = run(CAMS[id], f), a = kickAt(T(f));
  if (!a) return c;
  const d: V3 = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]];
  const L = Math.hypot(...d), h = Math.hypot(d[0], d[2]) || 1;
  const m = (3 / 640) * Math.tan((c.fov * Math.PI) / 360) * L * a;
  return { ...c, look: [c.look[0] - (d[2] / h) * m, c.look[1] + 0.6 * m, c.look[2] + (d[0] / h) * m], roll: c.roll + a * 0.004 };
};

// ---------------- lens: depth of field ----------------
// cInf px at 1080 (template table): hook CU 15-16, close-ups 12-14, MS 10-12, wides/aerials/inserts 0.
export type Dof = { f: number; dur?: number; cInf: number; focus?: (f: number) => V3 };
const eyesOf = (p: V3, h = 1.25): (() => V3) => () => [p[0], p[1] + h, p[2]];
export const DOF: Dof[] = [
  { f: 0, cInf: 0 }, // street establishing
  { f: 22, dur: 36, cInf: 6 }, // eye level on the quay: facade sharp, nothing near
  { f: 62, cInf: 0 }, // room reveal (wide)
  { f: 91, cInf: 10 }, // desk MS
  { f: 176, cInf: 0 }, // catalog insert (flat page)
  { f: 375, cInf: 16, focus: eyesOf([-5.6, D0, 416.9], 1.6) }, // CU you
  { f: 455, cInf: 13 }, // librarian MS
  { f: 600, cInf: 0 }, // man walks across the room (tracking wide)
  { f: 700, cInf: 10, focus: () => [1.5, D0 + 1.0, 425] }, // two-shot
  { f: 838, cInf: 16, focus: eyesOf(MAN_SEAT) }, // CU him
  { f: 940, cInf: 10 }, // next table MS
  { f: 1093, cInf: 16, focus: eyesOf(LADY_SEAT) }, // CU lady
  { f: 1162, cInf: 0 }, // aerial + banner
  { f: 1275, cInf: 6, focus: () => [15, D0 + 1.6, 34] }, // across the canal: the far bank sharp
  { f: 1410, cInf: 10 }, // rules vignette
  { f: 1495, cInf: 0 }, // wide over the room
  { f: W(53.08) - 20, dur: 40, cInf: 10, focus: () => [1.5, D0 + 1.0, 425] }, // down to the one in front of you
  { f: 1660, cInf: 15 }, // globe insert
  { f: W(58.0), cInf: 10 }, // desk
  { f: 1755, cInf: 11 }, // ending at the desk
];
export const dofAt = (f: number) => {
  let i = 0; while (i + 1 < DOF.length && f >= DOF[i + 1].f) i++;
  const d = DOF[i], p = DOF[Math.max(0, i - 1)];
  const k = d.dur ? Math.min(1, (f - d.f) / d.dur) : 1;
  return { cInf: p.cInf + (d.cInf - p.cInf) * k, focus: d.focus };
};
export const focusAt = (id: number, f: number): V3 => {
  const d = dofAt(f);
  return d.focus ? d.focus(f) : camAt(id, f).look;
};

/** near framing objects (Kenney GLBs): none until the Kenney packs arrive */
export type Fg = { a: number; b: number; kit: string; pos: V3; s?: number; yaw?: number };
export const FOREGROUND: Fg[] = [];
