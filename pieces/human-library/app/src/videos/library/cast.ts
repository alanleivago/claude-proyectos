// Our cast as lit flat sprites in the 3D world. Each frame every character asks for a drawing (a key + a draw call);
// the pool keeps one canvas per distinct drawing, so soldiers marching in step share canvases (7 head shapes x 4
// outfits). Characters are yaw-only billboards shaded by cardShade() (scene tint, bright floor, side gradient toward
// the sun, painted crescent in the drawing); standing ones get a soft multiply contact blob. Effects are unlit cards.
// Cards, effects and blobs live on the NOINK layer so the world ink pass never outlines their quads.
import * as THREE from "three";
import { Pen, bodyFront, bodySide, fxBurst, fxShadow, fxContact, Outfit, Expr, FrontOpts, SideOpts, INK, SKINS } from "./toon";
import {
  FPS, D0, SHOTS, V3, smooth, clamp01, DESK, TABLES, SEAT_DX, YOU_SEAT, MAN_SEAT, LADY_SEAT, FIRE_SEAT, GLOBE, LIB_Z,
} from "./story";
import { LIGHTS } from "./lights";
import { NOINK } from "./ink";
import { cardShade, blobMaterial, CARD_K } from "./cardshade";

// ---------------- canvas pool ----------------
type Entry = { cv: HTMLCanvasElement; tex: THREE.CanvasTexture; w: number; h: number };
export type Req = { key: string; w: number; h: number; k: number; draw: (p: Pen) => void; tex?: THREE.CanvasTexture };
const makeEntry = (w: number, h: number): Entry => {
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  return { cv, tex, w, h };
};
export class Pool {
  private live = new Map<string, Entry>();
  private free: Entry[] = [];
  private reqs: Req[] = [];
  req(key: string, w: number, h: number, k: number, draw: (p: Pen) => void) {
    const r: Req = { key: `${w}x${h}|${key}`, w, h, k, draw };
    this.reqs.push(r);
    return r;
  }
  flush() {
    const want = new Map<string, Req[]>();
    for (const r of this.reqs) { const l = want.get(r.key); if (l) l.push(r); else want.set(r.key, [r]); }
    for (const [key, e] of this.live) if (!want.has(key)) { this.live.delete(key); this.free.push(e); }
    for (const [key, rs] of want) {
      let e = this.live.get(key);
      if (!e) {
        const r = rs[0], i = this.free.findIndex((x) => x.w === r.w && x.h === r.h);
        e = i >= 0 ? this.free.splice(i, 1)[0] : makeEntry(r.w, r.h);
        const g = e.cv.getContext("2d")!;
        g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, e.w, e.h); g.setTransform(r.k, 0, 0, r.k, 0, 0);
        r.draw(new Pen(g));
        e.tex.needsUpdate = true;
        this.live.set(key, e);
      }
      for (const r of rs) r.tex = e.tex;
    }
    this.reqs = [];
  }
}

// ---------------- sprite meshes ----------------
const blank = (() => { const c = document.createElement("canvas"); c.width = c.height = 2; return new THREE.CanvasTexture(c); })();
export const SU = 0.00216; // metres per design unit: 1000 units = 2.16 m
const BODY = (() => { const g = new THREE.PlaneGeometry(600 * SU, 1000 * SU); g.translate(0, (975 - 500) * SU, 0); return g; })();
const CARD = new THREE.PlaneGeometry(1, 1);
/** world roots that hold actors (to find the scene's sun when world.ts does not pass it) */
const ROOTS = new Set<THREE.Object3D>();

/** lit flat character: cardShade() material, receives shadows (dims to the bright floor only), casts its silhouette
 *  when world.ts says so (golden). Drawn after the contact blobs (renderOrder 1). */
export class Actor {
  mesh: THREE.Mesh; mat: THREE.MeshLambertMaterial; dmat: THREE.MeshDepthMaterial; r: Req | null = null;
  constructor(parent: THREE.Object3D, geo: THREE.BufferGeometry = BODY) {
    this.mat = cardShade(new THREE.MeshLambertMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide }));
    this.mat.alphaToCoverage = false; // A2C + MSAA left 1 px sky-depth seams on blurred far cards (POST)
    this.dmat = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mesh = new THREE.Mesh(geo, this.mat);
    this.mesh.customDepthMaterial = this.dmat;
    // rim width is in output pixels: tell the card shader the render height (1920 = 1080 x 1920 frame)
    this.mesh.onBeforeRender = (r) => { const rt = r.getRenderTarget(); CARD_K.uPx.value = (rt ? rt.height : r.domElement.height) / 1920; };
    this.mesh.castShadow = false; this.mesh.receiveShadow = true; this.mesh.visible = false;
    this.mesh.rotation.order = "YXZ"; this.mesh.renderOrder = 1; this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
    ROOTS.add(parent);
  }
  bind() { const t = this.r?.tex; if (t) { this.mat.map = t; this.dmat.map = t; } }
}
/** unlit effect card: hard cut-out (ink drawings), soft see-through (dust, mist) or a multiply ground blob */
export class Fx {
  mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; soft: THREE.MeshBasicMaterial; blob: THREE.MeshBasicMaterial; r: Req | null = null;
  constructor(parent: THREE.Object3D) {
    this.mat = new THREE.MeshBasicMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mat.alphaToCoverage = false; // A2C + MSAA left 1 px sky-depth seams on blurred far cards (POST)
    this.soft = new THREE.MeshBasicMaterial({ map: blank, transparent: true, depthWrite: false, side: THREE.DoubleSide });
    this.blob = blobMaterial(blank);
    this.mesh = new THREE.Mesh(CARD, this.mat);
    this.mesh.visible = false; this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
  }
  use(soft: boolean) { this.mesh.material = soft ? this.soft : this.mat; }
  bind() {
    const t = this.r?.tex;
    if (!t) return;
    if (this.r!.key.includes("|blob|")) {
      // no mipmaps: at grazing views the mip chain averages the blob with its white surround and it fades out
      if (t.generateMipmaps) { t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; t.needsUpdate = true; }
      this.blob.map = t; this.mesh.material = this.blob; this.mesh.renderOrder = 0.5;
    }
    else { this.mat.map = t; this.soft.map = t; this.mesh.renderOrder = 0; }
  }
}

// ---------------- placements ----------------
export type Place = {
  key: string; draw: (p: Pen) => void; x: number; y: number; z: number;
  scale?: number; mirror?: boolean; yaw?: number; geo?: "body" | "swing"; roll?: number; size?: [number, number, number];
};
export type FxPlace = { key: string; cw: number; ch: number; draw: (p: Pen) => void; x: number; y: number; z: number; w: number; h: number; flat?: boolean; rot?: number; soft?: boolean };
/** sun = world direction TOWARD the sun (optional: when absent the scene's shadow-casting light is used) */
export type CamInfo = { pos: THREE.Vector3; right: THREE.Vector3; sun?: THREE.Vector3; proj?: (x: number, y: number, z: number) => [number, number] };
let CUR: CamInfo | null = null;

const hh = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
const q = (v: number, n = 120) => Math.round(v * n) / n;
const vOf = (i: number) => (i * 7 + (i >> 2)) % 4;
/** head-shape seed: 7 shapes, so marching soldiers in step still share canvases */
const seedOf = (i: number) => ((i * 5 + 3) % 7) + 1;
/** drawing resolution by distance: [canvas w, h, scale from the 600 x 1000 design]; sized for the 1440 x 2560 final */
const tier = (d: number): [number, number, number] =>
  d < 3.2 ? [1800, 3000, 3.0] : d < 6.5 ? [1080, 1800, 1.8] : d < 16 ? [480, 800, 0.8] : [240, 400, 0.4];

export type Stage = { places: Place[]; fx: FxPlace[] };

// ---------------- light ----------------
const SUN = new THREE.Vector3(0.5, 0.75, -0.4).normalize();
const tmp = new THREE.Vector3();
let LNAME: "day" | "golden" = "day";
const sunOf = (root: THREE.Object3D) => {
  let s: THREE.DirectionalLight | null = null;
  root.traverse((o) => { if (!s && o instanceof THREE.DirectionalLight && o.castShadow) s = o; });
  return s as THREE.DirectionalLight | null;
};
/** the sun of the world that is calling: the attached root whose sun target sits on this camera's view axis */
const findSun = (cam: CamInfo, out: THREE.Vector3) => {
  if (cam.sun) return out.copy(cam.sun).normalize();
  let best: THREE.DirectionalLight | null = null, err = Infinity;
  for (const r of ROOTS) {
    if (!r.parent) continue;
    const s = sunOf(r);
    if (!s) continue;
    const d = tmp.copy(s.target.position).sub(cam.pos), e = Math.abs(d.dot(cam.right)) / (d.length() || 1);
    if (e < err) { err = e; best = s; }
  }
  return best ? out.copy(best.position).sub(best.target.position).normalize() : out;
};
/** canvas angle the sun comes FROM on an upright card facing the camera, in 45-degree steps (small texture cache) */
const light2D = (cam: CamInfo, mirror: boolean) => {
  const sx = SUN.dot(cam.right) * (mirror ? -1 : 1), sy = -SUN.y;
  return Math.round(Math.atan2(sy, sx) / (Math.PI / 4)) * (Math.PI / 4);
};

/** front / side view and mirroring for someone at (x, z) walking along (dx, dz); fs = foreshortening of the walk */
const viewOf = (cam: CamInfo, x: number, z: number, dx: number, dz: number) => {
  const tx = cam.pos.x - x, tz = cam.pos.z - z, tl = Math.hypot(tx, tz) || 1;
  const c = (tx * dx + tz * dz) / tl;
  return { side: c < 0.57, mirror: dx * cam.right.x + dz * cam.right.z < 0, fs: Math.round(Math.sqrt(Math.max(0, 1 - c * c)) * 20) / 20 };
};

// ---------------- life: blinks and reaction timing ----------------
/** reference expression and action changes land 0-3 f before the word onset */
const LEAD = 2 / FPS;
/** eyelid 0 open .. 1 shut. Reference: gaps 0.5-2.3 s, 4-frame blink half / shut / shut / half, plus a blink across
 *  every expression swap (the shut frames hide the swap) */
const LID = [0.5, 1, 1, 0.5];
const SWAPS: Record<number, number[]> = {};
const lidAt = (t: number, i: number, swaps: number[] = []) => {
  const f = Math.round(t * FPS);
  for (const ts of swaps) { const k = f - Math.round((ts - LEAD) * FPS) + 1; if (k >= 0 && k < 4) return LID[k]; }
  let s = Math.round(-60 * hh(i, 9));
  for (let n = 0; s <= f && n < 400; n++) {
    const k = f - s;
    if (k >= 0 && k < 4) return LID[k];
    s += Math.round(15 + 54 * hh(i * 31 + n, 13)); // next blink 0.5-2.3 s later
  }
  return 0;
};
const fkey = (o: object) => JSON.stringify(o, (_k, v) => (typeof v === "number" ? q(v) : v));

type Who = { i: number; o: Outfit; okey: string };
/** one character drawing in the 600 x 1000 design space, sized by distance, lit from the scene's sun */
const person = (cam: CamInfo, who: Who, x: number, y: number, z: number, view: { side: boolean; mirror: boolean }, fo: FrontOpts, so: SideOpts, scale = 1): Place & { tierKey: string } => {
  const d = cam.pos.distanceTo(tmp.set(x, y + 1.2, z)) / scale;
  const [w, h, k] = tier(d);
  const mirror = view.side && view.mirror, light = light2D(cam, mirror), seed = seedOf(who.i);
  const f2: FrontOpts = { ...fo, light, seed }, s2: SideOpts = { ...so, light, seed };
  const key = view.side ? `S|${who.okey}|${fkey(s2)}` : `F|${who.okey}|${fkey(f2)}`;
  return {
    key, x, y, z, scale, mirror, tierKey: `${w}`,
    draw: (p) => (view.side ? bodySide(p, who.o, s2) : bodyFront(p, who.o, f2)),
    size: [w, h, k],
  };
};

/** ground shadow under a standing / sitting card (review rounds 2-4), multiply, blue-violet: a TIGHT contact pool right under
 *  the feet (~.5 on screen at the core) so nobody floats, plus by day (cards cast no real shadow) a lighter soft tail
 *  stretched AWAY from the sun, length ~1.6 m / tan(sun elevation), capped. Golden: world.ts casts real card shadows. */
const CONTACT: Record<"day" | "golden", [number, number, number]> = { day: [0.2, 0.21, 0.33], golden: [0.24, 0.2, 0.33] };
const TAIL: [number, number, number] = [0.42, 0.44, 0.62];
const toSrgb = (v: number) => { const c = clamp01(v); return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055; };
const hexOf = (c: [number, number, number], k: number) => "#" + c.map((v) => Math.round(255 * toSrgb(1 - (1 - v) * k)).toString(16).padStart(2, "0")).join("");
const blob = (out: Stage, x: number, y: number, z: number, sc = 1, k = 1) => {
  const hl = Math.hypot(SUN.x, SUN.z) || 1, ox = -SUN.x / hl, oz = -SUN.z / hl, rot = Math.atan2(-ox, -oz);
  if (LNAME === "day") {
    const el = Math.asin(Math.min(0.99, Math.max(0.1, SUN.y)));
    const len = Math.min(2.4, Math.max(0.5, 1.6 / Math.tan(el))) * sc, h = len + 0.55 * sc, c = 0.3 * h; // feet at v = .2 of the card
    const tc = hexOf(TAIL, k);
    out.fx.push({ key: `blob|shadow|${tc}`, cw: 128, ch: 256, draw: (p) => fxShadow(p, tc), x: x + ox * c, y: y + 0.018, z: z + oz * c,
      w: 0.72 * sc, h, flat: true, rot });
  }
  const cc = hexOf(CONTACT[LNAME], k);
  out.fx.push({ key: `blob|contact|${cc}`, cw: 128, ch: 128, draw: (p) => fxContact(p, cc), x: x + ox * 0.03 * sc, y: y + 0.022, z: z + oz * 0.03 * sc,
    w: 0.52 * sc, h: 0.4 * sc, flat: true, rot });
};

// ---------------- the library cast (toon.ts outfits: bean heads, stick limbs, plum ink) ----------------
const O = (jacket: string, pants: string, boots: string, hat: string | null, extra: Partial<Outfit> = {}): Outfit => ({ jacket, pants, boots, hat, ...extra });
// hair = the exact Ricks Clips cuts (toon.ts RK_HAIR, real pixels with their strands, shine and outline); clothes in the
// Ricks palette with collars, lapels, ties, stripes, checks, pockets, hoods (toon.ts clothes())
const YOU = O("#d9a43a", "#3b5b9a", "#5a3b2a", "rk_darkbowl", { skin: SKINS[0], collar: "#f4f1ea", pockets: true }); // mustard cardigan
const LIBRARIAN = O("#5b4ab0", "#3b3f52", "#3b2a22", "rk_brownbig", { skin: SKINS[0], dress: "#5b4ab0", lapel: "#4a3a96", collar: "#f4f1ea", glasses: "square" });
const MAN = O("#7f8792", "#3b3f52", INK, null, { skin: SKINS[3], build: "stout", hood: true }); // grey hoodie, shaved head
const LADY = O("#c0353a", "#3b3f52", "#3b2a22", "rk_bungrey", { skin: SKINS[0], dress: "#c0353a", stripes: ["#a12a30", "v"], collar: "#f4ecd8", necklace: "#f4f1ea", glasses: "round" });
const FIRE = O("#c99a3a", "#c99a3a", INK, "helmet", { cap: "#d23b3b", skin: SKINS[0], build: "stout", reflect: "#e8e04a", collar: "#b8862e", noButtons: true }); // turnout coat
const EXTRAS: { o: Outfit; label: string }[] = [
  { o: O("#5d7a3a", "#3b3f52", "#4a3426", "rk_curly", { skin: SKINS[3], zip: true, pockets: true }), label: "REFUGEE" },
  { o: O("#3d63a6", "#24365e", INK, "policecap", { skin: SKINS[1], collar: "#3d63a6", pockets: true, lapel: undefined }), label: "POLICE OFFICER" },
  { o: O("#2a2a2e", "#3b3f52", INK, "rk_spiky", { skin: SKINS[0], stripes: ["#3c3c44", "h"], noButtons: true }), label: "COVERED IN TATTOOS" },
  { o: O("#c99a3a", "#c99a3a", INK, "rk_boss", { skin: SKINS[3], reflect: "#e8e04a", noButtons: true }), label: "FIREFIGHTER" },
  { o: O("#3f6fb5", "#3b3f52", "#3b2a22", "rk_edison", { skin: SKINS[0], hood: true }), label: "FORMER PRISONER" },
  { o: O("#b5653f", "#3b3f52", "#4a3426", "rk_kyle", { skin: SKINS[2], check: "#7a3a20", collar: "#f4ecd8" }), label: "REFUGEE" },
];
const READERS: Outfit[] = [
  O("#2f8a85", "#3b5b9a", "#3b2a22", "rk_genius", { skin: SKINS[0], stripes: ["#f4ecd8", "h"], noButtons: true }),
  O("#2f8a6a", "#3b3f52", "#3b2a22", "rk_sweep", { skin: SKINS[1], lapel: "#246f56", collar: "#f4f1ea", tie: "#c0353a" }),
  O("#c25a7a", "#3b5b9a", "#3b2a22", "rk_part", { skin: SKINS[3], check: "#8c3b4a", collar: "#f4ecd8" }),
  O("#3f6fb5", "#3b3f52", "#3b2a22", "rk_brownshort", { skin: SKINS[2], collar: "#f4f1ea", pockets: true }),
];
const L2 = LEAD;
const SIT_Y = D0 + 0.06; // hips on the 0.48 m chair seat (toon.ts sit pose: hips 0.87 HH over the soles)

// ---------------- effect drawings (unlit cards, plum ink like the characters) ----------------
const FONT = "'Arial Black', Arial, sans-serif";
const textCard = (p: Pen, w: number, h: number, text: string, bg: string, fg = "#fff8e8", size = 0.5) => {
  const g = p.g, r = h * 0.18;
  g.beginPath(); g.roundRect(10, 10, w - 20, h - 20, r); g.fillStyle = bg; g.fill(); g.lineWidth = 10; g.strokeStyle = INK; g.stroke();
  g.fillStyle = fg; g.textAlign = "center"; g.textBaseline = "middle";
  let fs = h * size; g.font = `bold ${fs}px ${FONT}`;
  while (g.measureText(text).width > w - 60 && fs > 10) { fs -= 2; g.font = `bold ${fs}px ${FONT}`; }
  g.fillText(text, w / 2, h / 2 + fs * 0.04);
};
/** the human catalog page: header, then entries (portrait + title) revealed one by one; the first one gets crossed out */
const CAT = ["Cooking for Beginners", "Refugee", "Former Prisoner", "Police Officer", "Covered in Tattoos"];
const CAT_T = [6.98, 8.34, 9.26, 10.3, 11.3];
const CAT_COL = ["#e0b03c", "#5d7a3a", "#8d939c", "#24365e", "#2a2a2e"];
const catalogPage = (n: number, crossed: number, pick: number) => (p: Pen) => {
  const g = p.g, W = 900;
  g.fillStyle = "#f6ecd2"; g.fillRect(0, 0, W, 1200);
  g.lineWidth = 14; g.strokeStyle = INK; g.strokeRect(7, 7, W - 14, 1200 - 14);
  g.fillStyle = "#2f6a52"; g.fillRect(14, 14, W - 28, 150);
  g.fillStyle = "#fff3d6"; g.font = `bold 78px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("CATALOG", W / 2, 92);
  for (let i = 0; i < n; i++) {
    const y = 210 + i * 196, k = Math.min(1, crossed);
    g.fillStyle = i === pick ? "#ffe9a0" : "#fffaf0"; g.beginPath(); g.roundRect(40, y, W - 80, 170, 22); g.fill(); g.lineWidth = 8; g.strokeStyle = INK; g.stroke();
    if (i === 0) { g.fillStyle = "#c0353a"; g.fillRect(70, y + 20, 110, 130); g.lineWidth = 6; g.strokeRect(70, y + 20, 110, 130); g.fillStyle = "#fff3d6"; g.fillRect(88, y + 50, 74, 12); }
    else {
      g.fillStyle = CAT_COL[i]; g.beginPath(); g.ellipse(125, y + 160, 58, 48, 0, Math.PI, 0); g.fill(); g.lineWidth = 6; g.stroke();
      g.fillStyle = SKINS[(i + 1) % 4]; g.beginPath(); g.ellipse(125, y + 78, 40, 44, 0, 0, 7); g.fill(); g.stroke();
      g.fillStyle = INK; g.beginPath(); g.ellipse(112, y + 76, 5, 7, 0, 0, 7); g.ellipse(138, y + 76, 5, 7, 0, 0, 7); g.fill();
    }
    g.fillStyle = INK; g.textAlign = "left"; g.font = `bold ${i === 0 ? 50 : 58}px ${FONT}`; g.fillText(CAT[i], 210, y + 86);
    if (i === 0 && crossed > 0) { g.strokeStyle = "#d23b3b"; g.lineWidth = 16; g.lineCap = "round"; g.beginPath(); g.moveTo(200, y + 88); g.lineTo(200 + (W - 260) * k, y + 80); g.stroke(); }
  }
};
const qmark = (p: Pen, col: string) => {
  const g = p.g; g.font = `bold 230px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle";
  g.lineWidth = 22; g.strokeStyle = INK; g.strokeText("?", 130, 140); g.fillStyle = col; g.fillText("?", 130, 140);
};
const bubble = (p: Pen, text: string) => {
  const g = p.g;
  g.beginPath(); g.ellipse(200, 120, 180, 100, 0, 0, 7); g.moveTo(130, 200); g.lineTo(90, 280); g.lineTo(190, 214);
  g.fillStyle = "#ffffff"; g.fill(); g.lineWidth = 12; g.strokeStyle = INK; g.stroke();
  g.fillStyle = INK; g.font = `bold 120px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(text, 200, 124);
};
const pin = (p: Pen) => { p.stroke([[60, 70], [60, 150]], 10); p.ell(60, 60, 34, 34, "#e2453c", 7); p.ell(50, 50, 9, 9, "#ffd0c8", 0); };
const stampCard = (text: string) => (p: Pen) => {
  const g = p.g; g.fillStyle = "#f6ecd2"; g.fillRect(8, 8, 484, 284); g.lineWidth = 10; g.strokeStyle = INK; g.strokeRect(8, 8, 484, 284);
  g.save(); g.translate(250, 150); g.rotate(-0.16);
  g.strokeStyle = "#d23b3b"; g.lineWidth = 12; g.beginPath(); g.roundRect(-200, -70, 400, 140, 18); g.stroke();
  g.fillStyle = "#d23b3b"; g.font = `bold ${text.length > 6 ? 62 : 80}px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(text, 0, 4);
  g.restore();
};

// ---------------- placement helpers ----------------
const pop = (t: number, t0: number, dur = 0.18) => (t < t0 ? 0 : t < t0 + dur ? 1.25 * Math.sin((Math.PI / 2) * ((t - t0) / dur) * 1.1) : 1);
/** a person standing / sitting / walking at (x, z) with an expression and an optional facing / lean */
const put = (cam: CamInfo, out: Stage, t: number, i: number, o: Outfit, okey: string, x: number, y: number, z: number,
  fo: FrontOpts, walk?: { dx: number; dz: number; phase: number }, sc = 1) => {
  const who: Who = { i, o, okey };
  const view = walk ? viewOf(cam, x, z, walk.dx, walk.dz) : { side: false, mirror: false, fs: 1 };
  const blink = fo.blink ?? lidAt(t, i);
  const f2: FrontOpts = { mode: "stand", ...fo, blink, ...(walk ? { mode: "stroll" as const, phase: walk.phase } : {}) };
  const so: SideOpts = { mode: "march", phase: walk?.phase ?? 0, expr: fo.expr, blink, stomp: 0.5, stride: 0.875 * view.fs };
  out.places.push(person(cam, who, x, y, z, view, f2, so, sc));
  if (f2.mode !== "sit") blob(out, x, y, z, sc);
};
/** an upright title card floating above someone (the "book title" every volunteer wears) */
const titleOver = (out: Stage, text: string, x: number, y: number, z: number, k: number, w = 1.6) => {
  if (k <= 0.02) return;
  if (CUR?.proj) { // keep every card inside the frame: none may touch an edge (verifier r5)
    const hw = (w * k) / 2, [l] = CUR.proj(x - CUR.right.x * hw, y, z - CUR.right.z * hw), [r, sy] = CUR.proj(x + CUR.right.x * hw, y, z + CUR.right.z * hw);
    if (Math.min(l, r) < -0.94 || Math.max(l, r) > 0.94 || sy > 0.9) return;
  }
  out.fx.push({ key: `title|${text}`, cw: 760, ch: 200, draw: (p) => textCard(p, 760, 200, text, "#fff3d6", INK, 0.42), x, y, z, w: w * k, h: w * (200 / 760) * k });
};
const walkLerp = (t: number, t0: number, t1: number, a: [number, number], b: [number, number]) => {
  const u = clamp01((t - t0) / (t1 - t0));
  return { x: a[0] + (b[0] - a[0]) * u, z: a[1] + (b[1] - a[1]) * u, moving: t > t0 && t < t1, phase: q(((t - t0) * 1.3) % 1, 120) };
};

// ---------------- staging per place ----------------
const LIB_DOOR_Z = LIB_Z + 0.9;
const street = (id: number, t: number, cam: CamInfo, out: Stage) => {
  // people walking into the library, nobody carries a book
  const W: [number, number, number][] = [[-1.6, -39.5, 0.0], [1.2, -41.0, 0.35], [2.6, -43.0, 0.7], [-2.4, -44.5, 0.2], [0.4, -46.5, 0.55], [3.4, -42.2, 0.85]]; // all >= 4 m ahead of the s1 push-in (no heads at the lens)
  const tw = id === 12 ? t - 38.8 : t;
  W.forEach(([x0, z0, ph], i) => {
    const z = z0 - 0.85 * tw, x = x0 * Math.max(0.25, Math.min(1, (z - LIB_DOOR_Z) / 14));
    if (z < LIB_DOOR_Z + 0.4) return;
    const o = i < READERS.length ? READERS[i] : EXTRAS[i % EXTRAS.length].o;
    const y = z < LIB_Z + 2.4 ? D0 + 0.54 * clamp01((LIB_Z + 2.4 - z) / 1.8) : D0;
    put(cam, out, t, 300 + i, o, `st${i}`, x, y, z, { expr: i % 2 ? "smile" : "smile_closed" }, { dx: 0, dz: -1, phase: q((t * 1.3 + ph) % 1, 120) });
  });
};
/** everybody at the reading tables. `labels` = 0..1 scale of the floating titles (s2, s15) */
const tables = (t: number, cam: CamInfo, out: Stage, labels: number, withYou: boolean, withMan: boolean, withLady: boolean) => {
  [2, 3, 4].forEach((ti, k) => {
    const [cx, cz] = TABLES[ti], ex = EXTRAS[k], rd = READERS[k];
    const talk = Math.sin(t * 2.1 + k * 1.7) > 0.2;
    put(cam, out, t, 400 + k, rd, `rd${k}`, cx - SEAT_DX, SIT_Y, cz, { mode: "sit", expr: talk ? "smile" : "neutral", facing: -1 });
    put(cam, out, t, 410 + k, ex.o, `ex${k}`, cx + SEAT_DX, SIT_Y, cz, { mode: "sit", expr: talk ? "neutral" : "grin", facing: 1 });
    titleOver(out, ex.label, cx + SEAT_DX, D0 + 1.78, cz, labels);
    blob(out, cx - SEAT_DX, D0, cz, 1.1, 0.8); blob(out, cx + SEAT_DX, D0, cz, 1.1, 0.8);
  });
  if (withYou) blob(out, YOU_SEAT[0], D0, YOU_SEAT[2], 1.1, 0.8);
  if (withMan) blob(out, MAN_SEAT[0], D0, MAN_SEAT[2], 1.1, 0.8);
  if (withYou) put(cam, out, t, 1, YOU, "you", YOU_SEAT[0], SIT_Y, YOU_SEAT[2], { mode: "sit", expr: youExpr(t), facing: -1 });
  if (withMan) {
    put(cam, out, t, 2, MAN, "man", MAN_SEAT[0], SIT_Y, MAN_SEAT[2], { mode: "sit", expr: manExpr(t), facing: 1 });
    titleOver(out, "FORMER PRISONER", MAN_SEAT[0], D0 + 1.8, MAN_SEAT[2], labels);
  }
  if (withLady) {
    const lean = smooth((t - (33.16 - L2)) / 0.4);
    put(cam, out, t, 3, LADY, "lady", LADY_SEAT[0] - 0.12 * lean, SIT_Y, LADY_SEAT[2], { mode: "sit", expr: lean > 0.5 ? "smile_closed" : "smile", facing: lean > 0.5 ? 1 : -1, tilt: 9 * lean });
    const wave = t > 35.7 && t < 37.2 ? q(Math.sin(t * 10), 30) : undefined;
    put(cam, out, t, 4, FIRE, "fire", FIRE_SEAT[0], SIT_Y, FIRE_SEAT[2], { mode: "sit", expr: "grin", facing: 1, wave });
    titleOver(out, "FIREFIGHTER", FIRE_SEAT[0], D0 + 1.85, FIRE_SEAT[2], labels);
  }
};
const youExpr = (t: number): Expr => (t < 23.6 ? "smile" : t < 27.9 ? "nervous" : t < 31.3 ? "relief" : t < 36.5 ? "smile" : t < 38.8 ? "shock" : "smile_closed");
const manExpr = (t: number): Expr => (t < 23.6 ? "smile_closed" : t < 27.9 ? "neutral" : t < 31.3 ? "grin" : "smile");

const room = (id: number, t: number, cam: CamInfo, out: Stage) => {
  if (id === 2) { tables(t, cam, out, 1.5, false, false, true); return; }
  if (id === 7) {
    // the man walks in along the aisle between the rows and sits down on "sits"
    const w = walkLerp(t, 20.3, 21.85, [10.6, 427.3], [MAN_SEAT[0] + 0.1, 427.3]);
    if (t < 22.04 - L2) {
      const z = t < 21.85 ? w.z : 427.3 - (427.3 - MAN_SEAT[2]) * smooth((t - 21.85) / 0.12);
      put(cam, out, t, 2, MAN, "man", w.x, D0, z, { expr: "smile_closed" }, { dx: t < 21.85 ? -1 : 0, dz: t < 21.85 ? 0 : -1, phase: w.phase });
      tables(t, cam, out, 0, true, false, true);
    } else tables(t, cam, out, 0, true, true, true);
    return;
  }
  if (id === 15) {
    const k = 1.5 * (1 - smooth((t - (53.08 - L2)) / 0.45)); // titles pop away as we get to the one in front of you
    tables(t, cam, out, k, true, true, true);
    return;
  }
  tables(t, cam, out, 0, true, true, true);
  if (id === 8) for (let n = 0; n < 7; n++) {
    const k = pop(t, 25.34 - L2 + n * 0.22);
    if (k <= 0) continue;
    const a = -1.2 + n * 0.42, r = 0.4 + (n % 3) * 0.08;
    out.fx.push({ key: `q${n % 3}`, cw: 260, ch: 280, draw: (p) => qmark(p, ["#e0b03c", "#3f6fb5", "#e2453c"][n % 3]), x: YOU_SEAT[0] + Math.sin(a) * r, y: D0 + 1.45 + Math.cos(a) * r * 0.6, z: YOU_SEAT[2] - 0.15, w: 0.22 * k, h: 0.24 * k, rot: 0.2 * Math.sin(n) });
  }
  if (id === 9) {
    const k = pop(t, 29.74 - L2);
    if (k > 0) out.fx.push({ key: "bookTag", cw: 760, ch: 200, draw: (p) => textCard(p, 760, 200, "THE BOOK", "#e0b03c", INK, 0.5), x: MAN_SEAT[0] + 0.02, y: D0 + 1.9, z: MAN_SEAT[2] - 0.1, w: 0.5 * k, h: 0.13 * k, rot: -0.05 }); // a title card over his head, clear of the subtitles
  }
  if (id === 14) {
    const [cx, cz] = TABLES[2];
    for (const [t0, x, txt] of [[48.04, cx - SEAT_DX, "?"], [49.32, cx + SEAT_DX, "..."]] as const) {
      const k = pop(t, t0 - L2);
      if (k > 0) out.fx.push({ key: `bub${txt}`, cw: 400, ch: 300, draw: (p) => bubble(p, txt), x: x + (x < cx ? 0.12 : -0.12), y: D0 + 1.85, z: cz - 0.1, w: 0.52 * k, h: 0.4 * k });
    }
  }
};
const desk = (id: number, t: number, cam: CamInfo, out: Stage) => {
  const [dx, , dz] = DESK, libX = dx - 0.3, libZ = dz + 0.95;
  const libExpr: Expr = id === 6 ? (t > 18.6 ? "smile_closed" : "neutral") : id === 17 ? "smile_closed" : "smile";
  put(cam, out, t, 10, LIBRARIAN, "lib", libX, D0, libZ, { expr: libExpr, facing: id === 3 ? -1 : 0 });
  if (id === 3) {
    const w = walkLerp(t, 3.05, 3.95, [-9.6, 416.7], [-4.95, 416.7]);
    put(cam, out, t, 1, YOU, "you", w.x, D0, 416.7, { expr: "smile", facing: 1 }, w.moving ? { dx: 1, dz: 0, phase: w.phase } : undefined);
    const k = clamp01((t - (4.56 - L2)) / 0.4); // the catalog slides across the desk
    out.fx.push({ key: "catClosed", cw: 900, ch: 1200, draw: catalogPage(0, 0, -1), x: dx - 0.2 + 0.6 * smooth(k), y: D0 + 1.075, z: dz - 0.1, w: 0.42, h: 0.56, flat: true, rot: Math.PI - 0.3 });
  }
  if (id === 5) put(cam, out, t, 1, YOU, "you", -5.6, D0, 416.9, { expr: t < 13.18 - L2 ? "nervous" : t < 14.26 - L2 ? "stern" : "grin", facing: 0 });
  if (id === 6) {
    put(cam, out, t, 1, YOU, "you", -5.0, D0, 416.6, { expr: t > 19.5 ? "nervous" : "smile", facing: -1 });
    const th = 16.38 - L2;
    if (t >= th && t < th + 0.3) { const u = (t - th) / 0.3; out.fx.push({ key: `burst${q(u, 30)}`, cw: 500, ch: 500, draw: (p) => fxBurst(p, q(u, 30)), x: dx + 0.2, y: D0 + 1.3, z: dz - 0.6, w: 0.8, h: 0.8 }); }
    if (t >= th) out.fx.push({ key: "stamp30", cw: 500, ch: 300, draw: stampCard("30 MIN"), x: dx + 0.2, y: D0 + 1.068, z: dz - 0.2, w: 0.5, h: 0.3, flat: true, rot: Math.PI + 0.1 });
  }
  if (id === 17) {
    put(cam, out, t, 1, YOU, "you", -5.55, D0, 416.6, { expr: "grin", facing: -1 });
    put(cam, out, t, 2, MAN, "man", -4.6, D0, 416.3, { expr: t > 60.6 ? "laugh" : "grin", facing: 1 });
    const th = 60.6 - L2;
    if (t >= th && t < th + 0.3) { const u = (t - th) / 0.3; out.fx.push({ key: `burst${q(u, 30)}`, cw: 500, ch: 500, draw: (p) => fxBurst(p, q(u, 30)), x: -5.0, y: D0 + 2.3, z: 416.25, w: 0.9, h: 0.9 }); }
    if (t >= th) out.fx.push({ key: "stampBorrowed", cw: 500, ch: 300, draw: stampCard("BORROWED"), x: -5.0, y: D0 + 2.3, z: 416.3, w: 0.52, h: 0.31, rot: -0.06 });
  }
};
const catalog = (t: number, out: Stage) => {
  const [dx, , dz] = DESK;
  const n = CAT_T.filter((x) => t >= x - L2).length, crossed = clamp01((t - (7.98 - L2)) / 0.35), pick = t > 12.9 ? 2 : -1;
  out.fx.push({ key: `cat|${n}|${q(crossed, 20)}|${pick}`, cw: 900, ch: 1200, draw: catalogPage(n, crossed, pick), x: dx, y: D0 + 1.075, z: dz + 0.2, w: 0.8, h: 1.07, flat: true, rot: Math.PI });
};
const farBank = (t: number, cam: CamInfo, out: Stage) => {
  const P: [number, number, string][] = [[16.5, 34.0, "REFUGEE"], [17.3, 33.4, "FORMER PRISONER"], [18.1, 34.5, "POLICE OFFICER"], [18.9, 33.6, "COVERED IN TATTOOS"], [19.7, 34.3, "FIREFIGHTER"]];
  P.forEach(([x, z, label], i) => {
    const o = [EXTRAS[0].o, MAN, EXTRAS[1].o, EXTRAS[2].o, FIRE][i];
    put(cam, out, t, 500 + i, o, `fb${i}`, x, D0, z, { expr: (["smile", "neutral", "smile_closed", "grin"] as Expr[])[i % 4] });
    titleOver(out, label, x, D0 + 2.3 + (i % 2) * 0.42, z, pop(t, 42.62 + i * 0.14), 0.95);
  });
};
const globePins = (t: number, cam: CamInfo, out: Stage) => {
  const c = new THREE.Vector3(GLOBE[0], GLOBE[1] + 0.34, GLOBE[2]), d = cam.pos.clone().sub(c).normalize();
  const rt = new THREE.Vector3().crossVectors(d, new THREE.Vector3(0, 1, 0)).normalize(), up = new THREE.Vector3().crossVectors(rt, d);
  for (let n = 0; n < 14; n++) {
    const k = pop(t, 56.36 - L2 + n * 0.12, 0.12);
    if (k <= 0) continue;
    const a = n * 2.39996, r = 0.08 + 0.1 * Math.sqrt((n + 0.5) / 14);
    const pp = c.clone().add(d.clone().multiplyScalar(0.2).addScaledVector(rt, Math.cos(a) * r).addScaledVector(up, Math.sin(a) * r * 0.9).normalize().multiplyScalar(0.245)); // on the surface, never sunk
    out.fx.push({ key: "pin", cw: 120, ch: 160, draw: pin, x: pp.x, y: pp.y + 0.03, z: pp.z, w: 0.05 * k, h: 0.066 * k });
  }
};

/** everything with a face in shot `id` at time t */
export const stage = (id: number, t: number, cam: CamInfo): Stage => {
  const out: Stage = { places: [], fx: [] };
  const s = SHOTS[id - 1];
  LNAME = s.light;
  CUR = cam;
  findSun(cam, SUN);
  if (s.crowd === "street") street(id, t, cam, out);
  if (s.crowd === "room") room(id, t, cam, out);
  if (s.crowd === "desk") desk(id, t, cam, out);
  if (s.crowd === "catalog") catalog(t, out);
  if (s.crowd === "farbank") farBank(t, cam, out);
  if (s.crowd === "globe") { desk(id, t, cam, out); globePins(t, cam, out); }
  return out;
};
export { FPS };
