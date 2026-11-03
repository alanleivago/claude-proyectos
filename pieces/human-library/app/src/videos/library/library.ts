// The Human Library: its facade closing the old bridge road (street shots) and the reading room interior (desk,
// catalog counter, reading tables, shelves of painted book spines, banker lamps, a desk globe). Built in code with the
// template's materials (two-tone lam(), painted ctex textures, near-black seams); Kenney props can replace the plants,
// lamps and trees later. Ceilings and walls cast no sun shadow so the room reads lit (practical-lamp look).
import * as THREE from "three";
import { staticFile } from "remotion";
import { Batch, boxGeo, V, lam } from "./build";
import { ctex, rep, planksHD, stoneHD, rng } from "./paint";
import { twoTone } from "./shade";
import { NOINK } from "./ink";
import { RK_HAIR, RK_IMG } from "./toon";
import { D0, LIB_Z, RZ0, RZ1, RX, RH, DESK, TABLES, TABLE_Y, SEAT_DX, GLOBE } from "./story";

type Mats = Record<string, THREE.Material>;
/** the desk globe's map, loaded with the kit (world.ts loadKit) so the first rendered frame already has it */
export const EARTH: { tex: THREE.Texture | null } = { tex: null };
const loadImg = (k: string) => new Promise<void>((res) => { const im = new Image(); im.onload = () => { RK_IMG[k] = im; res(); }; im.onerror = () => res(); im.src = staticFile(`library/hair/${k}.png`); });
export const loadEarth = () => Promise.all([
  new THREE.TextureLoader().loadAsync(staticFile("library/earth.jpg")).then((t) => { t.colorSpace = THREE.SRGBColorSpace; EARTH.tex = t; }).catch(() => {}),
  ...Object.keys(RK_HAIR).map(loadImg),
]);
export type Library = { update: (id: number, t: number, cam: THREE.PerspectiveCamera) => void };

// ---------------- painted textures ----------------
const SPINES = ["#b8433a", "#3f6fb5", "#e0b03c", "#2f8a6a", "#7b5ac9", "#d9783a", "#3b4a7a", "#c25a7a", "#5d8a3a", "#8c3b4a", "#e7d9b8", "#2f5f6a"];
/** one shelf bay (1 m wide x 2.2 m, 5 shelves) of book spines with near-black seams, wood frame */
const shelfTex = (v = 0) => ctex("shelfBay" + v, 512, 1126, (g, r) => {
  for (let k = 0; k < v * 37; k++) r();
  const W = 512, H = 1126, sh = H / 4;
  g.fillStyle = "#7a4f33"; g.fillRect(0, 0, W, H);
  for (let k = 0; k < 4; k++) {
    const y0 = k * sh + 18, y1 = (k + 1) * sh - 10;
    g.fillStyle = "#3a2618"; g.fillRect(14, y0, W - 28, y1 - y0);
    let x = 18;
    while (x < W - 30) {
      const w = 34 + r() * 30, h = (y1 - y0) * (0.7 + r() * 0.26), lean = r() < 0.06;
      const col = SPINES[(Math.floor(x / 150) * 5 + k * 3 + v + (r() < 0.35 ? 1 : 0)) % SPINES.length];
      g.save(); g.translate(x, y1); if (lean) g.rotate(0.12);
      g.fillStyle = col; g.fillRect(0, -h, w, h);
      g.fillStyle = "rgba(255,255,255,0.18)"; g.fillRect(2, -h + 2, 3, h - 4);
      g.fillStyle = "rgba(0,0,0,0.2)"; g.fillRect(w - 4, -h, 4, h);
      g.fillStyle = "rgba(255,236,170,0.75)"; g.fillRect(3, -h * 0.78, w - 6, 4); g.fillRect(3, -h * 0.25, w - 6, 3);
      g.strokeStyle = "#140e10"; g.lineWidth = 4; g.strokeRect(0, -h, w, h);
      g.restore();
      x += w + (lean ? 8 : 1);
    }
    g.fillStyle = "#8a5a3c"; g.fillRect(0, y1, W, 14); g.fillStyle = "#140e10"; g.fillRect(0, y1 + 12, W, 3);
  }
  g.strokeStyle = "#140e10"; g.lineWidth = 6; g.strokeRect(3, 3, W - 6, H - 6);
});
/** warm plaster wall with a dark green wainscot (lower 1.1 m of a 7.6 m wall) */
const wallTex = () => ctex("roomWall", 512, 1024, (g, r) => {
  const H = 1024, wain = H * (1 - 1.1 / RH);
  g.fillStyle = "#e9c46a"; g.fillRect(0, 0, 512, H);
  for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(${r() > 0.5 ? "255,255,255" : "150,100,40"},0.06)`; g.beginPath(); g.ellipse(r() * 512, r() * wain, 30 + r() * 60, 20 + r() * 40, 0, 0, 7); g.fill(); }
  for (const x of [0, 256]) { g.fillStyle = "rgba(150,100,40,0.18)"; g.fillRect(x, 0, 26, wain); g.fillStyle = "#140e10"; g.fillRect(x + 26, 0, 3, wain); }
  g.fillStyle = "#2f6a52"; g.fillRect(0, wain, 512, H - wain);
  for (let x = 0; x < 512; x += 128) { g.strokeStyle = "#1c4a38"; g.lineWidth = 6; g.strokeRect(x + 14, wain + 18, 100, H - wain - 34); }
  g.fillStyle = "#7a4f33"; g.fillRect(0, wain - 10, 512, 14); g.fillStyle = "#140e10"; g.fillRect(0, wain + 3, 512, 3);
});
const rugTex = () => ctex("rug", 512, 256, (g) => {
  g.fillStyle = "#a8323a"; g.fillRect(0, 0, 512, 256);
  g.strokeStyle = "#e0b03c"; g.lineWidth = 10; g.strokeRect(18, 18, 476, 220);
  g.strokeStyle = "#2f3f6a"; g.lineWidth = 6; g.strokeRect(40, 40, 432, 176);
  g.fillStyle = "#e0b03c"; for (const x of [140, 256, 372]) { g.beginPath(); g.moveTo(x, 80); g.lineTo(x + 34, 128); g.lineTo(x, 176); g.lineTo(x - 34, 128); g.closePath(); g.fill(); }
});
/** library facade: sandstone ashlar, two tall arched windows each side, a big arched door, a cornice line */
const facadeTex = () => ctex("libFacade", 1024, 960, (g, r) => {
  const W = 1024, H = 960, m = W / 13; // 13 m wide, 12 m high
  g.fillStyle = "#e3c590"; g.fillRect(0, 0, W, H);
  for (let y = 0, row = 0; y < H; y += m * 0.5, row++) {
    g.strokeStyle = "rgba(120,85,45,0.45)"; g.lineWidth = 2; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke();
    for (let x = (row % 2) * m * 0.6; x < W; x += m * 1.2) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + m * 0.5); g.stroke(); }
  }
  for (let i = 0; i < 30; i++) { g.fillStyle = `rgba(${r() > 0.5 ? "255,255,255" : "140,100,60"},0.07)`; g.beginPath(); g.ellipse(r() * W, r() * H, 40 + r() * 60, 30 + r() * 40, 0, 0, 7); g.fill(); }
  const arch = (cx: number, top: number, w: number, h: number, fill: string) => {
    g.beginPath(); g.moveTo(cx - w / 2, top + h); g.lineTo(cx - w / 2, top + w / 2); g.arc(cx, top + w / 2, w / 2, Math.PI, 0); g.lineTo(cx + w / 2, top + h); g.closePath();
    g.fillStyle = fill; g.fill(); g.strokeStyle = "#140e10"; g.lineWidth = 5; g.stroke();
  };
  for (const cx of [1.6, 3.9, 9.1, 11.4]) {
    arch(cx * m, 1.4 * m, 1.3 * m, 3.0 * m, "#3f6f9a"); arch(cx * m, 5.6 * m, 1.3 * m, 2.6 * m, "#3f6f9a");
    for (const top of [1.4, 5.6]) { g.strokeStyle = "#f3ead8"; g.lineWidth = 6; g.beginPath(); g.moveTo(cx * m, (top + 0.65) * m); g.lineTo(cx * m, (top + (top < 3 ? 3.0 : 2.6)) * m); g.stroke(); }
    g.fillStyle = "rgba(255,255,255,0.35)"; g.fillRect(cx * m - 0.45 * m, 2.4 * m, 0.18 * m, 1.6 * m);
  }
  arch(6.5 * m, 6.6 * m, 2.6 * m, 5.4 * m, "#5a3424"); // door 2.6 m wide, 5.4 m tall (bottom at 12 m)
  g.strokeStyle = "#e0b03c"; g.lineWidth = 4; g.beginPath(); g.moveTo(6.5 * m, 8.0 * m); g.lineTo(6.5 * m, 12 * m); g.stroke();
  g.fillStyle = "#c9a36a"; g.fillRect(0, 0.2 * m, W, 0.5 * m); g.fillStyle = "#140e10"; g.fillRect(0, 0.7 * m, W, 4);
  g.fillStyle = "#c9a36a"; g.fillRect(0, 5.0 * m, W, 0.3 * m); g.fillStyle = "#140e10"; g.fillRect(0, 5.3 * m, W, 3);
});
/** banner over the door: unlit painted face (template gotcha: a side-lit sign goes grey and unreadable) */
const bannerTex = () => ctex("libBanner", 1024, 300, (g) => {
  g.fillStyle = "#b8433a"; g.fillRect(0, 0, 1024, 300);
  g.strokeStyle = "#e0b03c"; g.lineWidth = 10; g.strokeRect(14, 14, 996, 272);
  let fs = 128; g.font = `bold ${fs}px 'Arial Black', Arial, sans-serif`;
  while (g.measureText("HUMAN LIBRARY").width > 900 && fs > 40) { fs -= 4; g.font = `bold ${fs}px 'Arial Black', Arial, sans-serif`; }
  g.fillStyle = "#fff3d6"; g.textAlign = "center"; g.textBaseline = "middle";
  g.lineWidth = 14; g.strokeStyle = "#241726"; g.strokeText("HUMAN LIBRARY", 512, 156); g.fillText("HUMAN LIBRARY", 512, 156);
});
const signTex = () => ctex("deskSign", 512, 160, (g) => {
  g.fillStyle = "#2f6a52"; g.fillRect(0, 0, 512, 160);
  g.strokeStyle = "#e0b03c"; g.lineWidth = 8; g.strokeRect(8, 8, 496, 144);
  g.fillStyle = "#fff3d6"; g.font = "bold 74px 'Arial Black', Arial, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText("LOANS", 256, 84);
});

// ---------------- set dressing (Ricks density: trims, frames, posters, clutter, windows with a view, lamps) ----------------
const posterTex = (key: string, bg: string, draw: (g: CanvasRenderingContext2D) => void) => ctex(key, 300, 400, (g) => {
  g.fillStyle = bg; g.fillRect(0, 0, 300, 400); draw(g);
  g.strokeStyle = "#140e10"; g.lineWidth = 8; g.strokeRect(4, 4, 292, 392);
});
const T_FONT = "bold 54px 'Arial Black', Arial, sans-serif";
const POSTERS = [
  posterTex("posRead", "#e0b03c", (g) => { g.fillStyle = "#2f3f6a"; g.font = T_FONT; g.textAlign = "center"; g.fillText("READ", 150, 120); g.fillStyle = "#c0353a"; g.beginPath(); g.moveTo(70, 330); g.lineTo(150, 190); g.lineTo(230, 330); g.closePath(); g.fill(); }),
  posterTex("posSilence", "#2f6a52", (g) => { g.fillStyle = "#fff3d6"; g.font = "bold 46px 'Arial Black', Arial, sans-serif"; g.textAlign = "center"; g.fillText("SHH", 150, 220); g.beginPath(); g.arc(150, 120, 46, 0, 7); g.fill(); }),
  posterTex("posMap", "#7ec8e3", (g) => { g.fillStyle = "#5ea64a"; for (const [x, y, r] of [[90, 140, 50], [200, 200, 70], [120, 300, 40]]) { g.beginPath(); g.ellipse(x, y, r, r * 0.7, 0.4, 0, 7); g.fill(); } g.fillStyle = "#e2453c"; g.beginPath(); g.arc(205, 190, 10, 0, 7); g.fill(); }),
  posterTex("posBook", "#c25a7a", (g) => { g.fillStyle = "#fff3d6"; g.fillRect(70, 120, 160, 200); g.fillStyle = "#3f6fb5"; g.fillRect(70, 120, 24, 200); g.fillStyle = "#140e10"; g.font = "bold 40px 'Arial Black', Arial"; g.textAlign = "center"; g.fillText("BOOK", 160, 90); }),
];
const windowTex = () => ctex("clerestory", 512, 256, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, "#5e93d9"); gr.addColorStop(1, "#cfe6ff"); g.fillStyle = gr; g.fillRect(0, 0, 512, 256);
  g.fillStyle = "#ffffff"; for (const [x, y] of [[90, 90], [300, 70], [420, 130]]) { g.beginPath(); g.ellipse(x, y, 60, 24, 0, 0, 7); g.ellipse(x + 40, y - 14, 40, 22, 0, 0, 7); g.fill(); }
  g.fillStyle = "#c96a3f"; g.fillRect(0, 200, 120, 56); g.fillStyle = "#e0b03c"; g.fillRect(130, 186, 90, 70); g.fillStyle = "#3f6fb5"; g.fillRect(380, 196, 132, 60);
  g.fillStyle = "#f6ecd2"; for (let x = 0; x < 512; x += 128) g.fillRect(x, 0, 12, 256); g.fillRect(0, 122, 512, 12);
  g.strokeStyle = "#140e10"; g.lineWidth = 6; g.strokeRect(3, 3, 506, 250);
});
const clockTex = () => ctex("wallClock", 256, 256, (g) => {
  g.fillStyle = "#fff8e8"; g.beginPath(); g.arc(128, 128, 118, 0, 7); g.fill(); g.lineWidth = 12; g.strokeStyle = "#2f3f6a"; g.stroke();
  g.fillStyle = "#140e10"; for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.283; g.fillRect(128 + Math.sin(a) * 92 - 4, 128 - Math.cos(a) * 92 - 8, 8, 16); }
  g.lineCap = "round"; g.lineWidth = 10; g.beginPath(); g.moveTo(128, 128); g.lineTo(128, 62); g.stroke(); g.lineWidth = 7; g.beginPath(); g.moveTo(128, 128); g.lineTo(178, 150); g.stroke();
});
const drawerTex = () => ctex("cardDrawers", 256, 256, (g) => {
  g.fillStyle = "#9a6440"; g.fillRect(0, 0, 256, 256);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) {
    const x = 10 + c * 82, y = 10 + r * 61; g.fillStyle = "#b07a4a"; g.fillRect(x, y, 72, 52); g.strokeStyle = "#140e10"; g.lineWidth = 4; g.strokeRect(x, y, 72, 52);
    g.fillStyle = "#f4ecd8"; g.fillRect(x + 22, y + 10, 28, 12); g.fillStyle = "#c9a040"; g.beginPath(); g.arc(x + 36, y + 36, 6, 0, 7); g.fill();
  }
});
const bookRowTex = () => ctex("bookRow", 256, 128, (g, r) => {
  let x = 0;
  while (x < 256) { const w = 18 + r() * 22; g.fillStyle = SPINES[Math.floor(r() * SPINES.length)]; g.fillRect(x, 128 - (90 + r() * 38), w, 128); g.strokeStyle = "#140e10"; g.lineWidth = 3; g.strokeRect(x, 128 - 128, w, 128); x += w; }
});
const unlitPlane = (R: THREE.Object3D, tex: THREE.Texture, w: number, h: number, x: number, y: number, z: number, ry: number, k = 1) => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, color: new THREE.Color(k, k, k) }));
  m.position.set(x, y, z); m.rotation.y = ry; R.add(m); return m;
};
const dress = (f: Batch, M: Mats, R: THREE.Object3D, glow: THREE.Mesh[]) => {
  // high windows above the shelves on both side walls (the key light's source), with sills + frames
  const win = windowTex();
  for (const [x, ry] of [[-RX + 0.02, Math.PI / 2], [RX - 0.02, -Math.PI / 2]] as const)
    for (const z of [416.5, 421.5, 426.5, 431.0]) {
      unlitPlane(R, win, 3.4, 1.7, x, D0 + 6.0, z, ry, 1.05);
      f.add(boxGeo(V(x - 0.12, D0 + 5.1, z - 1.8), V(x + 0.12, D0 + 5.18, z + 1.8)), M.woodDk);
    }
  // back wall: clock in the middle, framed posters either side, over the gallery rail
  unlitPlane(R, clockTex(), 1.3, 1.3, 0, D0 + 6.05, RZ1 - 0.06, Math.PI);
  [-8.5, -5.2, 5.2, 8.5].forEach((x, i) => {
    unlitPlane(R, POSTERS[i], 1.2, 1.6, x, D0 + 6.0, RZ1 - 0.13, Math.PI);
    f.add(boxGeo(V(x - 0.68, D0 + 5.12, RZ1 - 0.1), V(x + 0.68, D0 + 6.88, RZ1 - 0.04)), M.woodDk);
  });
  // crown moulding + skirting
  for (const [a, b] of [[V(-RX, D0 + RH - 0.25, RZ1 - 0.18), V(RX, D0 + RH, RZ1)], [V(-RX, D0 + RH - 0.25, RZ0), V(-RX + 0.18, D0 + RH, RZ1)], [V(RX - 0.18, D0 + RH - 0.25, RZ0), V(RX, D0 + RH, RZ1)]] as const) f.add(boxGeo(a, b), M.wood);
  // rolling ladder on the back shelves
  for (const x of [3.9, 4.6]) f.add(boxGeo(V(x - 0.04, D0, RZ1 - 0.7), V(x + 0.04, D0 + 4.6, RZ1 - 0.62)), M.woodDk);
  for (let y = 0.4; y < 4.6; y += 0.4) f.add(boxGeo(V(3.9, D0 + y, RZ1 - 0.69), V(4.6, D0 + y + 0.05, RZ1 - 0.63)), M.woodDk);
  // card-catalog cabinet + book cart by the desk; desk clutter (bell, mug, in-tray, plant)
  const cab = lam("cardDrawers", () => ({ map: drawerTex() }));
  f.add(boxGeo(V(-10.6, D0, 417.0), V(-9.4, D0 + 1.3, 417.7)), cab);
  f.add(boxGeo(V(-10.7, D0 + 1.3, 416.95), V(-9.3, D0 + 1.36, 417.75)), M.top);
  const books = lam("bookRow", () => ({ map: bookRowTex() }));
  for (const [x, z] of [[-2.6, 418.6], [9.8, 428.6]] as const) {
    f.add(boxGeo(V(x - 0.6, D0 + 0.25, z - 0.25), V(x + 0.6, D0 + 0.3, z + 0.25)), M.woodDk);
    f.add(boxGeo(V(x - 0.6, D0 + 0.75, z - 0.25), V(x + 0.6, D0 + 0.8, z + 0.25)), M.woodDk);
    for (const y of [0.3, 0.8]) f.add(boxGeo(V(x - 0.56, D0 + y, z - 0.2), V(x + 0.56, D0 + y + 0.3, z + 0.2)), books);
    for (const sx of [-1, 1]) { const w = new THREE.TorusGeometry(0.1, 0.03, 6, 14); f.add(w, M.woodDk, at(x + sx * 0.45, D0 + 0.1, z - 0.27)); }
  }
  const [dx, , dz] = DESK;
  f.add(cyl(0.06, 0.05, 0.12, 12), M.chair, at(dx - 0.75, D0 + 1.12, dz + 0.38)); // mug
  f.add(new THREE.SphereGeometry(0.07, 12, 8, 0, 6.29, 0, 1.6), M.brass, at(dx - 0.72, D0 + 1.06, dz - 0.32)); // bell
  for (let i = 0; i < 4; i++) f.add(boxGeo(V(dx + 1.55, D0 + 1.06 + i * 0.06, dz + 0.1), V(dx + 1.85, D0 + 1.11 + i * 0.06, dz + 0.32)), [M.chair, M.green, M.paper, M.top][i]);
  // book stacks + open book + mug on every reading table
  for (const [cx, cz] of TABLES) {
    for (let i = 0; i < 3; i++) f.add(boxGeo(V(cx - 0.32, D0 + TABLE_Y + i * 0.05, cz + 0.05), V(cx - 0.08, D0 + TABLE_Y + 0.05 + i * 0.05, cz + 0.36)), [M.chair, M.green, M.top][i]);
    f.add(cyl(0.045, 0.04, 0.1, 10), M.paper, at(cx + 0.28, D0 + TABLE_Y + 0.05, cz + 0.25));
  }
  // second rug under the back row, plants with leaf blades in the corners and by the desk
  const rug2 = new THREE.PlaneGeometry(10, 3.4); rug2.rotateX(-Math.PI / 2); rug2.translate(1.5, D0 + 0.021, 429.6);
  f.add(rug2, lam("rug2", () => ({ map: rugTex(), color: "#7ec8e3" })));
  for (const [x, z, h] of [[-7.6, 416.6, 1.1], [-11.2, 433.0, 1.6], [11.2, 433.0, 1.6], [-1.0, 419.0, 1.2]] as const) {
    f.add(cyl(0.28, 0.2, 0.5, 14), M.pot, at(x, D0 + 0.25, z));
    for (let i = 0; i < 9; i++) {
      const a = i * 2.4, leaf = new THREE.ConeGeometry(0.09, h * 0.7, 6); leaf.translate(0, h * 0.35, 0);
      leaf.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0.45 * Math.cos(a), 0, 0.45 * Math.sin(a))));
      f.add(leaf, i % 2 ? M.leaf : M.leaf2, at(x, D0 + 0.5, z));
    }
  }
};
const streetDress = (s: Batch, M: Mats, R: THREE.Object3D) => {
  // lamp posts, benches, bike racks with bikes, flower boxes along both quays; boats moored in the canal
  for (const x of [-12, -4.5, 4.5, 12]) {
    s.add(cyl(0.07, 0.1, 4.2, 10), M.iron ?? M.woodDk, at(x, D0 + 2.1, -32.2));
    s.add(new THREE.SphereGeometry(0.28, 14, 10), lam("lampGlass", () => ({ color: "#fff3c4", emissive: new THREE.Color("#ffd27a"), emissiveIntensity: 0.35 })), at(x, D0 + 4.35, -32.2));
  }
  for (const x of [-8.2, 8.2]) {
    s.add(boxGeo(V(x - 0.9, D0 + 0.42, -33.2), V(x + 0.9, D0 + 0.5, -32.8)), M.woodDk);
    s.add(boxGeo(V(x - 0.9, D0 + 0.5, -32.82), V(x + 0.9, D0 + 0.95, -32.74)), M.woodDk);
    for (const sx of [-0.8, 0.8]) s.add(boxGeo(V(x + sx - 0.04, D0, -33.15), V(x + sx + 0.04, D0 + 0.42, -32.85)), M.iron ?? M.woodDk);
  }
  const bikeCol = ["#c0353a", "#3f6fb5", "#e0b03c", "#2f8a6a"];
  [-16, -15.2, 15.4, 16.2].forEach((x, i) => {
    const fm = lam("bike" + i, () => ({ color: bikeCol[i] }));
    for (const dz of [-0.45, 0.45]) { const w = new THREE.TorusGeometry(0.32, 0.035, 6, 20); w.rotateY(Math.PI / 2); s.add(w, M.iron ?? M.woodDk, at(x, D0 + 0.34, -40.5 + dz)); }
    s.add(boxGeo(V(x - 0.03, D0 + 0.34, -40.95), V(x + 0.03, D0 + 0.4, -40.05)), fm);
    s.add(boxGeo(V(x - 0.03, D0 + 0.34, -40.3), V(x + 0.03, D0 + 0.85, -40.24)), fm);
    s.add(boxGeo(V(x - 0.2, D0 + 0.85, -40.32), V(x + 0.2, D0 + 0.88, -40.22)), M.iron ?? M.woodDk);
  });
  const flowers = ["#e2453c", "#e0b03c", "#c25a7a", "#ffffff"];
  for (const x of [-5.6, 5.6]) for (let i = 0; i < 2; i++) {
    const z = LIB_Z + 1.5 + i * 2.2;
    s.add(boxGeo(V(x - 0.5, D0, z - 0.3), V(x + 0.5, D0 + 0.5, z + 0.3)), M.pot);
    for (let k = 0; k < 6; k++) s.add(new THREE.SphereGeometry(0.13, 8, 6), lam("fl" + k % 4, () => ({ color: flowers[k % 4] })), at(x - 0.35 + k * 0.14, D0 + 0.62 + (k % 2) * 0.06, z + (k % 3 - 1) * 0.12));
  }
  // cafe terraces on both quays: striped parasols, round tables, chairs (Ricks streets are dense with small life)
  const stripeTex = (k: string, c: string) => ctex("parasol" + k, 256, 64, (g) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? "#fff8e8" : c; g.fillRect(i * 32, 0, 32, 64); } });
  [[-20, -33.6, "#c0353a"], [-23.5, -34.2, "#2f8a6a"], [20.5, -33.8, "#3f6fb5"], [24, -34.3, "#e0b03c"], [-21, 33.6, "#e0b03c"], [21, 33.8, "#c0353a"], [-30, 34.0, "#3f6fb5"]].forEach(([x, z, c], i) => {
    const pm = lam("parasol" + i, () => ({ map: stripeTex(String(i), c as string), side: THREE.DoubleSide }));
    s.add(cyl(0.035, 0.035, 2.3, 8), M.iron ?? M.woodDk, at(x as number, D0 + 1.15, z as number));
    s.add(new THREE.ConeGeometry(1.2, 0.5, 16, 1, true), pm, at(x as number, D0 + 2.45, z as number));
    s.add(cyl(0.38, 0.38, 0.05, 16), M.paper, at(x as number, D0 + 0.74, z as number));
    s.add(cyl(0.05, 0.05, 0.72, 8), M.iron ?? M.woodDk, at(x as number, D0 + 0.36, z as number));
    for (const dx of [-0.7, 0.7]) s.add(boxGeo(V((x as number) + dx - 0.18, D0 + 0.42, (z as number) - 0.18), V((x as number) + dx + 0.18, D0 + 0.47, (z as number) + 0.18)), M.chair);
  });
  // Danish flags on the facade, bunting over the steps, a kiosk with posters on the quay
  const dk = ctex("dkFlag", 128, 96, (g) => { g.fillStyle = "#c8102e"; g.fillRect(0, 0, 128, 96); g.fillStyle = "#ffffff"; g.fillRect(36, 0, 14, 96); g.fillRect(0, 41, 128, 14); });
  for (const x of [-4.8, 4.8]) {
    s.add(cyl(0.04, 0.04, 3.2, 8), M.iron ?? M.woodDk, at(x, D0 + 9.6, LIB_Z + 0.6));
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.1), new THREE.MeshLambertMaterial({ map: dk, side: THREE.DoubleSide }));
    fl.position.set(x + 0.78 * Math.sign(x), D0 + 10.6, LIB_Z + 0.6); R.add(fl);
  }
  const bunt = ["#c0353a", "#e0b03c", "#3f6fb5", "#2f8a6a", "#fff8e8"];
  for (let i = 0; i < 18; i++) {
    const u = i / 17, x = -5.4 + 10.8 * u, y = D0 + 5.4 - 1.1 * 4 * u * (1 - u), tri = new THREE.ConeGeometry(0.16, 0.36, 3);
    tri.rotateX(Math.PI); s.add(tri, lam("bunt" + (i % 5), () => ({ color: bunt[i % 5] })), at(x, y - 0.2, LIB_Z + 3.2));
  }
  s.add(cyl(0.9, 0.9, 2.6, 16), lam("kiosk", () => ({ map: rep(ctex("kioskTex", 512, 256, (g) => {
    const cols = ["#e0b03c", "#c25a7a", "#3f6fb5", "#2f8a6a"]; for (let i = 0; i < 8; i++) { g.fillStyle = cols[i % 4]; g.fillRect(i * 64 + 4, 30, 56, 190); g.fillStyle = "#140e10"; g.fillRect(i * 64 + 4, 30, 56, 6); }
  }), 1, 1) })), at(-12.5, D0 + 1.3, -37.6));
  s.add(new THREE.ConeGeometry(1.15, 0.8, 16), lam("kioskRoof", () => ({ color: "#2f6a52" })), at(-12.5, D0 + 3.0, -37.6));
  for (const [x, z, c] of [[-14, -26.5, "#c0353a"], [10, -27.0, "#2f8a6a"], [26, 27.0, "#e0b03c"]] as const) {
    const hull = lam("boat" + c, () => ({ color: c }));
    s.add(boxGeo(V(x - 2.6, -0.2, z - 0.8), V(x + 2.6, 0.45, z + 0.8)), hull);
    s.add(boxGeo(V(x - 2.0, 0.45, z - 0.6), V(x + 2.0, 0.55, z + 0.6)), M.woodDk ?? hull);
    s.add(boxGeo(V(x - 0.6, 0.55, z - 0.5), V(x + 0.6, 1.25, z + 0.5)), lam("cabin", () => ({ color: "#f4ecd8" })));
  }
};

// ---------------- builders ----------------
const cyl = (r0: number, r1: number, h: number, n = 16) => new THREE.CylinderGeometry(r0, r1, h, n);
const at = (x: number, y: number, z: number, ry = 0) => new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ry, 0)), V(1, 1, 1));
/** storybook tree: trunk + clustered smooth spheres (the template's rounded canopy idea, without the Kenney model) */
const tree = (b: Batch, M: Mats, x: number, z: number, h = 6.5, seed = 1) => {
  const r = rng(seed * 97 + 13);
  b.add(cyl(0.18, 0.26, h * 0.45, 10), M.bark, at(x, D0 + h * 0.225, z));
  for (let i = 0; i < 11; i++) {
    const a = r() * 6.28, d = 0.3 + r() * 1.1, rr = 0.75 + r() * 0.75;
    b.add(new THREE.SphereGeometry(rr, 18, 12), i % 2 ? M.leaf : M.leaf2, at(x + Math.cos(a) * d, D0 + h * 0.62 + r() * 1.2, z + Math.sin(a) * d));
  }
};
const lampShade = (b: Batch, M: Mats, glow: THREE.Mesh[], parent: THREE.Object3D, x: number, y: number, z: number) => {
  b.add(cyl(0.07, 0.11, 0.05, 12), M.brass, at(x, y + 0.025, z));
  b.add(cyl(0.015, 0.015, 0.36, 6), M.brass, at(x, y + 0.2, z));
  const sh = new THREE.CylinderGeometry(0.06, 0.2, 0.16, 16, 1, true);
  b.add(sh, M.shade, at(x, y + 0.42, z));
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.6, 2.1, 1.2), fog: false }));
  bulb.position.set(x, y + 0.36, z); bulb.layers.set(NOINK); parent.add(bulb); glow.push(bulb);
};

export const buildLibrary = (R: THREE.Object3D, M0: Mats): Library => {
  const M: Mats = { ...M0 };
  M.sand = lam("libSand", () => ({ map: stoneHD("libSand", ["#e8cc98", "#dfc28c", "#ecd4a6", "#d6b880"], "#a88a5a") }));
  M.facade = lam("libFacade", () => ({ map: facadeTex() }));
  M.roof = lam("libRoof", () => ({ color: "#4f6f7a" }));
  M.bark = lam("bark", () => ({ color: "#8a5a3c" }));
  M.leaf = lam("leafA", () => ({ color: "#5ea64a" }));
  M.leaf2 = lam("leafB", () => ({ color: "#4f9a44" }));
  M.floor = lam("roomFloor", () => ({ map: rep(planksHD(), 6, 6) }));
  M.wallR = lam("roomWall", () => ({ map: rep(wallTex(), 6, 1) }));
  M.ceil = lam("roomCeil", () => ({ color: "#f1dfb6" }));
  const SH = [0, 1, 2].map((v) => lam("shelf" + v, () => ({ map: shelfTex(v) })));
  M.wood = lam("roomWood", () => ({ color: "#9a6440" }));
  M.woodDk = lam("roomWoodDk", () => ({ color: "#6e4530" }));
  M.top = lam("tableTop", () => ({ color: "#b07a4a" }));
  M.green = lam("deskGreen", () => ({ color: "#2f6a52" }));
  M.chair = lam("chair", () => ({ color: "#b8433a" }));
  M.rug = lam("rug", () => ({ map: rugTex() }));
  M.brass = twoTone(new THREE.MeshPhongMaterial({ color: "#c9a040", specular: "#fff0b0", shininess: 50 }), 0.15);
  M.shade = lam("lampShade", () => ({ color: "#2f8a5a", side: THREE.DoubleSide }));
  M.pot = lam("pot", () => ({ color: "#c96a3f" }));
  M.paper = lam("paper", () => ({ color: "#f4ecd8" }));
  M.iron = lam("ironStreet", () => ({ color: "#2f3542" }));
  const glow: THREE.Mesh[] = [];

  // ---- street: the library facade at the end of the old bridge road ----
  const s = new Batch();
  const z0 = LIB_Z, z1 = LIB_Z - 12;
  s.add(boxGeo(V(-6.5, D0, z1), V(6.5, D0 + 12, z0), 2), M.sand);
  const front = new THREE.PlaneGeometry(13, 12); front.translate(0, D0 + 6, z0 + 0.02);
  s.add(front, M.facade);
  s.add(boxGeo(V(-7.0, D0 + 12, z1 - 0.5), V(7.0, D0 + 12.6, z0 + 0.5), 2), M.sand); // cornice
  const ped = new THREE.Shape([new THREE.Vector2(-6.8, 0), new THREE.Vector2(6.8, 0), new THREE.Vector2(0, 3.0)]);
  const pg = new THREE.ExtrudeGeometry(ped, { depth: 0.9, bevelEnabled: false }); pg.translate(0, D0 + 12.6, z0 - 0.4);
  s.add(pg, M.sand);
  s.add(boxGeo(V(-6.3, D0 + 12.6, z1), V(6.3, D0 + 14.6, z0 - 0.5), 0), M.roof);
  for (let k = 0; k < 3; k++) s.add(boxGeo(V(-3.2 - k * 0.5, D0, z0), V(3.2 + k * 0.5, D0 + 0.18 * (3 - k), z0 + 0.6 + k * 0.6), 1), M.sand); // steps
  for (const x of [-2.9, 2.9]) { s.add(cyl(0.38, 0.42, 6.2, 18), M.sand, at(x, D0 + 0.54 + 3.1, z0 + 0.6)); s.add(boxGeo(V(x - 0.55, D0 + 6.7, z0 + 0.05), V(x + 0.55, D0 + 7.1, z0 + 1.15), 0), M.sand); }
  for (const [x, z, h] of [[-9.0, -37.5, 6.2], [9.0, -37.5, 6.8], [-15.5, -37.8, 6.0], [15.5, -37.6, 6.5], [-24, -37.6, 6.4], [22, -37.7, 6.0]] as const) tree(s, M, x, z, h, Math.round(x * 3 + z));
  for (const [x, z, h] of [[-9.0, 37.6, 6.0], [9.5, 37.8, 6.6], [-18, 37.5, 6.4], [18.5, 37.7, 6.1]] as const) tree(s, M, x, z, h, Math.round(x * 5 + z));
  streetDress(s, M, R);
  s.build(R);
  const banner = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 1.9), new THREE.MeshBasicMaterial({ map: bannerTex(), color: 0xe8e8e8 }));
  banner.position.set(0, D0 + 8.6, z0 + 0.06); banner.layers.set(NOINK); R.add(banner);

  // ---- reading room ----
  const w = new Batch(), f = new Batch();
  const floor = new THREE.PlaneGeometry(2 * RX, RZ1 - RZ0); floor.rotateX(-Math.PI / 2); floor.translate(0, D0 + 0.01, (RZ0 + RZ1) / 2);
  w.add(floor, M.floor);
  const ceil = new THREE.PlaneGeometry(2 * RX, RZ1 - RZ0); ceil.rotateX(Math.PI / 2); ceil.translate(0, D0 + RH, (RZ0 + RZ1) / 2);
  w.add(ceil, M.ceil);
  const wall = (pts: [number, number, number, number]) => { // x0, z0 -> x1, z1, facing the room centre
    const [x0, za, x1, zb] = pts, len = Math.hypot(x1 - x0, zb - za);
    const g = new THREE.PlaneGeometry(len, RH); g.translate(0, RH / 2, 0);
    const yaw = Math.atan2(-(zb - za), x1 - x0);
    g.applyMatrix4(new THREE.Matrix4().compose(V((x0 + x1) / 2, D0, (za + zb) / 2), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw, 0)), V(1, 1, 1)));
    const uv = g.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * len / 4);
    w.add(g, M.wallR);
  };
  wall([RX, RZ1, -RX, RZ1]); wall([-RX, RZ1, -RX, RZ0]); wall([RX, RZ0, RX, RZ1]); wall([-RX, RZ0, RX, RZ0]);
  w.build(R, false); // walls + ceiling cast no sun shadow: the room reads lit by its lamps
  // shelves: bays of 1 m along the back wall and both side walls, 2.2 m tall, a ladder of second tier above
  const bays: [number, number, number][] = []; // x, z, yaw (bay faces the room)
  for (let x = -RX + 1.0; x <= RX - 1.0; x += 1.0) bays.push([x, RZ1 - 0.25, Math.PI]);
  for (let z = RZ0 + 5.5; z <= RZ1 - 1.0; z += 1.0) { bays.push([-RX + 0.25, z, Math.PI / 2]); bays.push([RX - 0.25, z, -Math.PI / 2]); }
  for (const [x, z, yaw] of bays) for (const tier of [0, 2.45]) {
    const g = new THREE.BoxGeometry(1.0, 2.2, 0.42); g.translate(0, 1.1 + tier, 0);
    f.add(g, SH[Math.abs(Math.round(x * 3 + z * 7) + (tier ? 1 : 0)) % 3], new THREE.Matrix4().compose(V(x, D0, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw + Math.PI, 0)), V(1, 1, 1)));
  }
  f.add(boxGeo(V(-RX, D0 + 4.65, RZ1 - 0.6), V(RX, D0 + 4.75, RZ1 - 0.1)), M.woodDk); // gallery rail
  for (let x = -RX + 2; x < RX; x += 3) { const bm = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.4, RZ1 - RZ0), M.woodDk); bm.position.set(x, D0 + RH - 0.2, (RZ0 + RZ1) / 2); bm.castShadow = false; R.add(bm); } // ceiling beams
  // front desk with a green front, sign, stamp pad, stack of cards
  const [dx, , dz] = DESK;
  f.add(boxGeo(V(dx - 1.9, D0, dz - 0.45), V(dx + 1.9, D0 + 1.0, dz + 0.45)), M.green);
  f.add(boxGeo(V(dx - 2.0, D0 + 1.0, dz - 0.55), V(dx + 2.0, D0 + 1.06, dz + 0.55)), M.top);
  f.add(boxGeo(V(dx + 0.9, D0 + 1.06, dz - 0.1), V(dx + 1.3, D0 + 1.12, dz + 0.2)), M.paper);
  f.add(boxGeo(V(dx + 1.45, D0 + 1.06, dz - 0.05), V(dx + 1.7, D0 + 1.1, dz + 0.12)), M.woodDk);
  lampShade(f, M, glow, R, dx - 1.2, D0 + 1.06, dz + 0.25);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.375), new THREE.MeshBasicMaterial({ map: signTex(), color: 0xe0e0e0 }));
  sign.position.set(dx, D0 + 0.62, dz - 0.46); sign.rotation.y = Math.PI; sign.layers.set(NOINK); R.add(sign);
  // globe on its stand (the map from the earth texture), turning slowly
  const globe = new THREE.Mesh(new THREE.SphereGeometry(0.22, 40, 28),
    new THREE.MeshBasicMaterial({ map: EARTH.tex, color: new THREE.Color(0.92, 0.92, 0.92) })); // unlit: shaded it read as a dark ball
  globe.position.set(GLOBE[0], GLOBE[1] + 0.34, GLOBE[2]); globe.rotation.z = 0.41; globe.castShadow = true; R.add(globe);
  f.add(cyl(0.1, 0.13, 0.04, 16), M.brass, at(GLOBE[0], GLOBE[1] + 0.02, GLOBE[2]));
  f.add(cyl(0.02, 0.02, 0.12, 8), M.brass, at(GLOBE[0], GLOBE[1] + 0.08, GLOBE[2]));
  const ring = new THREE.TorusGeometry(0.25, 0.012, 6, 40); ring.rotateY(Math.PI / 2); ring.rotateX(0.41);
  f.add(ring, M.brass, at(GLOBE[0], GLOBE[1] + 0.34, GLOBE[2]));
  // reading tables: top, apron, legs; a chair on each side; a lamp and a few books on each
  for (const [cx, cz] of TABLES) {
    f.add(boxGeo(V(cx - 0.45, D0 + TABLE_Y - 0.06, cz - 0.5), V(cx + 0.45, D0 + TABLE_Y, cz + 0.5)), M.top);
    f.add(boxGeo(V(cx - 0.4, D0 + TABLE_Y - 0.2, cz - 0.45), V(cx + 0.4, D0 + TABLE_Y - 0.06, cz + 0.45)), M.wood);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) f.add(boxGeo(V(cx + sx * 0.37 - 0.05, D0, cz + sz * 0.4 - 0.05), V(cx + sx * 0.37 + 0.05, D0 + TABLE_Y - 0.06, cz + sz * 0.4 + 0.05)), M.woodDk);
    for (const sx of [-1, 1]) {
      const x = cx + sx * SEAT_DX;
      f.add(boxGeo(V(x - 0.24, D0 + 0.42, cz - 0.24), V(x + 0.24, D0 + 0.48, cz + 0.24)), M.chair);
      for (const lx of [-1, 1]) for (const lz of [-1, 1]) f.add(boxGeo(V(x + lx * 0.2 - 0.03, D0, cz + lz * 0.2 - 0.03), V(x + lx * 0.2 + 0.03, D0 + 0.42, cz + lz * 0.2 + 0.03)), M.woodDk);
      f.add(boxGeo(V(x - 0.24, D0 + 0.48, cz + 0.2), V(x + 0.24, D0 + 1.05, cz + 0.26)), M.chair); // back rest behind the sitter (review: crossed faces)
    }
    lampShade(f, M, glow, R, cx - 0.1, D0 + TABLE_Y, cz + 0.3);
    f.add(boxGeo(V(cx + 0.02, D0 + TABLE_Y, cz - 0.3), V(cx + 0.3, D0 + TABLE_Y + 0.05, cz - 0.08)), M.paper);
  }
  // rug under the front tables, plants in the corners
  const rug = new THREE.PlaneGeometry(9, 4.2); rug.rotateX(-Math.PI / 2); rug.translate(3.0, D0 + 0.02, 425);
  f.add(rug, M.rug);
  for (const [x, z] of [[-RX + 1.2, RZ0 + 2.5], [RX - 1.2, RZ0 + 2.5], [11.0, 422.0], [-10.6, 427.0]] as const) {
    f.add(cyl(0.3, 0.22, 0.55, 14), M.pot, at(x, D0 + 0.275, z));
    for (let i = 0; i < 4; i++) f.add(new THREE.SphereGeometry(0.42 - i * 0.05, 14, 10), i % 2 ? M.leaf : M.leaf2, at(x + Math.cos(i * 1.7) * 0.18, D0 + 0.85 + i * 0.32, z + Math.sin(i * 1.7) * 0.18));
  }
  // hanging pendant lamps over the tables (emissive, bloom)
  for (const [cx, cz] of TABLES) {
    { const cord = new THREE.Mesh(cyl(0.008, 0.008, RH - 3.3, 4), M.woodDk); cord.position.set(cx, D0 + 3.3 + (RH - 3.3) / 2, cz); cord.castShadow = false; R.add(cord); }
    f.add(new THREE.ConeGeometry(0.36, 0.3, 18, 1, true), M.shade, at(cx, D0 + 3.3, cz));
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 2.0, 1.2), fog: false }));
    bulb.position.set(cx, D0 + 3.2, cz); bulb.layers.set(NOINK); R.add(bulb); glow.push(bulb);
  }
  dress(f, M, R, glow);
  f.build(R);
  // verifier r1 (flat ambient interior): warm light pools under every lamp (additive) and soft contact shadows under
  // the furniture (multiply), as flat decals just above the floor / table tops
  const radial = (key: string, inner: string, outer: string) => ctex(key, 256, 256, (g) => {
    const gr = g.createRadialGradient(128, 128, 8, 128, 128, 126); gr.addColorStop(0, inner); gr.addColorStop(1, outer);
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  });
  const poolM = new THREE.MeshBasicMaterial({ map: radial("pool", "rgba(255,190,90,0.3)", "rgba(255,190,90,0)"), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
  const shadM = new THREE.MeshBasicMaterial({ map: radial("cshadow", "rgba(40,25,60,0.55)", "rgba(40,25,60,0)"), transparent: true, depthWrite: false, fog: false });
  const decal = (m: THREE.Material, x: number, y: number, z: number, w: number, d: number) => {
    const q = new THREE.Mesh(new THREE.PlaneGeometry(w, d), m); q.rotation.x = -Math.PI / 2; q.position.set(x, y, z); q.layers.set(NOINK); q.renderOrder = 0.4; R.add(q);
  };
  for (const [cx, cz] of TABLES) {
    decal(shadM, cx, D0 + 0.03, cz, 2.6, 1.9);
    decal(poolM, cx, D0 + 0.035, cz, 3.4, 3.0);
    decal(poolM, cx - 0.1, D0 + TABLE_Y + 0.004, cz + 0.15, 1.0, 0.9);
  }
  decal(shadM, dx, D0 + 0.03, dz, 5.0, 1.8);
  decal(poolM, dx - 1.2, D0 + 1.064, dz + 0.1, 1.2, 1.0);
  for (const [x, z] of [[-6, 422], [6, 422], [0, 431]] as const) decal(poolM, x, D0 + 0.03, z, 6, 5);

  return {
    update: (_id, t) => { globe.rotation.y = 0.6 + t * 0.12; },
  };
};
