// vera-02 storyboard engine: "THE LAST CUP" (ep 2), PS1 rom-com in a highway diner on a rainy night. Vera (upnext-waitress, JEANS) + Theo (upnext-suitor).
// Built on the vera-01 engine (main_sb.js: unlit characters, face-cell _meta swaps, lens 0.016, emissive bloom, afps, DOF on 50 mm CUs).
// Interface for main_sb.js: SHOTS = [{ t0, scene, camera, update(lt, t), hard, dof }], loadAll(renderer).
// Storyboard mode: every shot is a still held 3 s (t0 = 3 * i); subtitles, title card, vignette and grain are added in post (tools/compose.py).
// Units: metres, Y up. MOONLITE DINER interior x in [-3, 3], z in [-3.2, 3]; back wall z = -3.2 (back bar, brewer, menu sign, the umbrella hook),
// chrome counter along x at z ~ -1.75 with red stools in front, jukebox on the left wall, right wall x = 3 = the highway side
// (glass door with bell + OPEN/CLOSED sign at z = -1.2, big rain-streaked window z -0.35..2.75 with HER booth), parking lot + rain outside (x > 3).
// ?set=1 -> set stills only; ?poses=vera|theo -> pose sheet (one still per clip, 3 phases).
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const SHOTS = [];
export const UT = { value: 0 };   // film/still time (s), set by main_sb.js renderFrame: drives the drops on the glass and the falling rain
// vera-02 v2 (user: the rain looked wrong from inside): procedural drops ON the glass plane. Static beads + drops running down in
// wobbling columns with broken trails, quantised to 7 mm cells (PS1 pixels), light rim on top / dark core below (reads as refraction).
function rainGlass(w, h, seed = 0) {
  return keepA(new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide,
    uniforms: { uT: UT, uSize: { value: new THREE.Vector2(w, h) }, uSeed: { value: seed } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform float uT, uSeed; uniform vec2 uSize; varying vec2 vUv;
      float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21) + uSeed); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      void drops(vec2 m, float cw, float k, inout float a, inout float lit){
        float cx = floor(m.x / cw), rc = h21(vec2(cx, k)); if (rc < 0.35) return;
        float sp = 0.05 + 0.16 * fract(rc * 9.1), H = uSize.y * 0.5 + 0.5;
        float dy = uSize.y * 0.5 + 0.25 - mod(uT * sp * 0.5 + rc * 37.0, H);                       // drop centre height (falls)
        float xc = (cx + 0.5) * cw + 0.008 * sin(m.y * 23.0 + rc * 40.0) + 0.006 * sin(m.y * 7.0 + rc * 11.0);
        vec2 q = vec2((m.x - xc) / 0.0075, (m.y - dy) / 0.011); float d = length(q);
        if (d < 1.0) { a = max(a, 0.8); lit = q.y > 0.15 ? 1.0 : (q.y < -0.45 ? -1.0 : 0.25); }
        float tr = m.y - dy;                                                              // trail above the drop
        if (tr > 0.01 && tr < 0.3 && abs(m.x - xc) < 0.0032 && fract(m.y * 34.0 + rc * 5.0) < 0.55) a = max(a, 0.42 * (1.0 - tr / 0.3));
      }
      void main(){
        vec2 m = floor(vUv * uSize * 0.5 / 0.0045) * 0.0045 + 0.0022; float a = 0.05, lit = 0.0;   // x0.5: drops read ~2x bigger than life at the 270x480 grid   // faint wet film over the whole pane
        vec2 g = m / 0.03, id = floor(g), f = fract(g) - 0.5; float r = h21(id);              // static beads
        vec2 o = vec2(r - 0.5, fract(r * 7.3) - 0.5) * 0.5; float bd = length(f - o);
        if (r > 0.62 && bd < 0.08 + 0.12 * fract(r * 13.7)) { a = 0.3; lit = (f.y - o.y) > 0.03 ? 0.3 : -0.6; }
        drops(m, 0.055, 7.0, a, lit); drops(m + vec2(0.021, 0.0), 0.041, 3.0, a, lit);
        vec3 col = lit > 0.5 ? vec3(0.92, 0.96, 1.0) : (lit < -0.5 ? vec3(0.10, 0.12, 0.2) : vec3(0.62, 0.72, 0.86));
        gl_FragColor = vec4(col, a);
      }` }));
}
// soft out-of-focus lights behind the glass (inside view only: the plane faces -x, culled from the street)
function bokehTex() { return cvs(64, 32, (c, w, h) => { c.clearRect(0, 0, w, h); const r = rng(51);
  for (let k = 0; k < 16; k++) { const x = r() * w, y = 6 + r() * (h - 14), rad = 2 + r() * 4, col = ['255,90,160', '60,224,216', '255,190,110', '220,230,255'][k % 4];
    const g = c.createRadialGradient(x, y, 0, x, y, rad); g.addColorStop(0, `rgba(${col},0.85)`); g.addColorStop(0.6, `rgba(${col},0.35)`); g.addColorStop(1, `rgba(${col},0)`); c.fillStyle = g; c.fillRect(x - rad, y - rad, rad * 2, rad * 2); } }); }

const LW = 270, LH = 480;
const QS = new URLSearchParams(location.search);
const CH = {};   // kind -> { src, clips, face, S, foot, H }
const HEIGHTS = { vera: 1.75, theo: 1.67 };   // as approved in upnext-suitor/review/height_pair_v3.png (she is slightly taller)

// ---------- helpers ----------
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function snap(m) {
  if (QS.has('nosnap') || m.userData.noSnap) return m;   // v3: PS1 vertex wobble back on the set (user); single pieces can opt out (userData.noSnap)
  const prev = m.onBeforeCompile;
  m.onBeforeCompile = (sh, r) => {
    if (prev) prev(sh, r);
    sh.vertexShader = sh.vertexShader.replace('#include <project_vertex>', `#include <project_vertex>
      if (gl_Position.w > 0.0) { vec2 g = vec2(${LW / 2}.0, ${LH / 2}.0); gl_Position.xy = floor(gl_Position.xy / gl_Position.w * g + 0.5) / g * gl_Position.w; }`);
  };
  m.customProgramCacheKey = () => 'snap' + (m.userData.mixK ?? '');
  return m;
}
// emissive surfaces write alpha > 1 into the HDR target -> the only bloom sources (main_sb.js)
function emissive(m, gain = 1) { const prev = m.onBeforeCompile; m.onBeforeCompile = (sh, r) => { if (prev) prev(sh, r); sh.fragmentShader = sh.fragmentShader.replace('#include <opaque_fragment>', '#include <opaque_fragment>\n  gl_FragColor.a = ' + (1 + gain).toFixed(2) + ';'); };
  const k = m.customProgramCacheKey; m.customProgramCacheKey = () => k.call(m) + 'em' + gain; return m; }
function nearest(t) { if (t) { t.minFilter = t.magFilter = THREE.NearestFilter; t.generateMipmaps = false; t.needsUpdate = true; } return t; }
function canvasTex(cv) { const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return nearest(t); }
function cvs(w, h, f) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; f(cv.getContext('2d'), w, h); return canvasTex(cv); }
function rep(t, rx, ry) { const c = t.clone(); c.wrapS = c.wrapT = THREE.RepeatWrapping; c.repeat.set(rx, ry); c.needsUpdate = true; return c; }
const lam = (map, color = 0xffffff, extra = {}) => snap(new THREE.MeshLambertMaterial({ map, color, ...extra }));
// vera-02: transparent pieces keep the destination alpha (the post pass reads alpha as the bloom/emission channel; normal blending
// lowered it and the glass / coffee read washed-out grey)
const keepA = (m) => { if (m.transparent) Object.assign(m, { blending: THREE.CustomBlending, blendSrc: THREE.SrcAlphaFactor, blendDst: THREE.OneMinusSrcAlphaFactor, blendSrcAlpha: THREE.ZeroFactor, blendDstAlpha: THREE.OneFactor }); return m; };
const basic = (map, color = 0xffffff, extra = {}) => snap(keepA(new THREE.MeshBasicMaterial({ map, color, ...extra })));
function mesh(geo, m, x, y, z, parent) { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); if (parent) parent.add(o); return o; }
function box(w, h, d, m, x, y, z, parent) { return mesh(new THREE.BoxGeometry(w, h, d), m, x, y, z, parent); }
function plane(w, h, m, x, y, z, parent, ry = 0, rx = 0) { const o = mesh(new THREE.PlaneGeometry(w, h), m, x, y, z, parent); o.rotation.set(rx, ry, 0); return o; }
function cyl(rt, rb, h, seg, m, x, y, z, parent) { return mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m, x, y, z, parent); }
function blob(parent, x, z, r, op = 0.6, y = 0.006) { const o = mesh(new THREE.CircleGeometry(r, 12), basic(null, 0x1a0e08, { transparent: true, opacity: op, depthWrite: false }), x, y, z, parent); o.rotation.x = -Math.PI / 2; return o; }
function txt(c, s, x, y, size, col, align = 'center', font = 'Pixelify') { c.font = `700 ${size}px ${font}`; c.textAlign = align; c.textBaseline = 'middle'; c.fillStyle = col; c.fillText(s, x, y); }

// ---------- textures (8-64 px, nearest, like the characters) ----------
const TX = {};
function makeTextures() {
  TX.floor = cvs(32, 32, (c, w, h) => { for (let y = 0; y < h; y += 8) for (let x = 0; x < w; x += 8) { c.fillStyle = ((x + y) / 8) % 2 ? '#1e1a1e' : '#e8e0d0'; c.fillRect(x, y, 8, 8); }   // diner checker
    const r = rng(5); for (let i = 0; i < 26; i++) { c.fillStyle = r() < 0.5 ? 'rgba(90,70,60,0.35)' : 'rgba(255,255,255,0.12)'; c.fillRect((r() * w) | 0, (r() * h) | 0, 2, 1); } });
  TX.wall = cvs(32, 32, (c, w, h) => { c.fillStyle = '#e9dcbc'; c.fillRect(0, 0, w, h); const r = rng(11);   // cream upper wall, faint boomerang flecks
    for (let i = 0; i < 22; i++) { c.fillStyle = ['#d8c8a4', '#e0a8b0', '#9ccac4'][i % 3]; const x = (r() * w) | 0, y = (r() * h) | 0; c.fillRect(x, y, 2, 1); c.fillRect(x + 1, y + 1, 1, 1); } });
  TX.wains = cvs(32, 32, (c, w, h) => { c.fillStyle = '#2f8a86'; c.fillRect(0, 0, w, h);   // teal enamel wainscot panels + chrome seams
    for (let x = 0; x < w; x += 16) { c.fillStyle = '#26706e'; c.fillRect(x, 0, 1, h); c.fillStyle = '#3ea29c'; c.fillRect(x + 1, 0, 1, h); }
    c.fillStyle = '#c8d0d8'; c.fillRect(0, 0, w, 2); c.fillStyle = '#1e5a58'; c.fillRect(0, h - 3, w, 3); });
  TX.counterFront = cvs(32, 32, (c, w, h) => { c.fillStyle = '#c8303c'; c.fillRect(0, 0, w, h);   // red quilted vinyl counter front + chrome ribs
    for (let y = 0; y < h; y += 8) for (let x = (y / 8 % 2) * 4; x < w; x += 8) { c.fillStyle = '#a82430'; c.fillRect(x, y + 3, 1, 1); c.fillStyle = '#dc4450'; c.fillRect(x + 1, y + 2, 1, 1); }
    c.fillStyle = '#d8dde4'; c.fillRect(0, 0, w, 2); c.fillRect(0, 15, w, 1); c.fillStyle = '#8a929c'; c.fillRect(0, 16, w, 1); });
  TX.formica = cvs(32, 32, (c, w, h) => { c.fillStyle = '#d8ece6'; c.fillRect(0, 0, w, h); const r = rng(4);   // mint boomerang formica
    for (let i = 0; i < 14; i++) { const x = (r() * w) | 0, y = (r() * h) | 0; c.fillStyle = ['#e07a8a', '#4a9a98', '#b8c8c4'][i % 3]; c.fillRect(x, y, 3, 1); c.fillRect(x + 2, y + 1, 1, 2); } });
  TX.chrome = cvs(8, 16, (c, w, h) => { const g = ['#f2f5f8', '#c4ccd6', '#8e98a6', '#d8dee6', '#aab2be', '#6e7886', '#c8d0da', '#e8ecf2']; for (let y = 0; y < h; y++) { c.fillStyle = g[y % 8]; c.fillRect(0, y, w, 1); } });
  TX.vinyl = cvs(16, 16, (c, w, h) => { c.fillStyle = '#b8202c'; c.fillRect(0, 0, w, h);   // red booth vinyl, tufted
    for (let y = 2; y < h; y += 8) for (let x = (y > 8 ? 4 : 0) + 2; x < w; x += 8) { c.fillStyle = '#8a1620'; c.fillRect(x, y, 2, 2); c.fillStyle = '#e04050'; c.fillRect(x - 2, y - 2, 2, 1); } });
  TX.steel = cvs(16, 16, (c, w, h) => { c.fillStyle = '#9aa2ae'; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 4) { c.fillStyle = '#b4bcc8'; c.fillRect(x, 0, 1, h); } c.fillStyle = '#7a828e'; c.fillRect(0, h - 1, w, 1); });
  TX.asphalt = cvs(32, 32, (c, w, h) => { c.fillStyle = '#16181f'; c.fillRect(0, 0, w, h); const r = rng(8);   // wet asphalt with puddle glints
    for (let i = 0; i < 60; i++) { c.fillStyle = r() < 0.5 ? '#0e1016' : '#22252e'; c.fillRect((r() * w) | 0, (r() * h) | 0, 1, 1); }
    for (let i = 0; i < 6; i++) { c.fillStyle = r() < 0.5 ? '#3a2a44' : '#1e3a44'; c.fillRect((r() * w) | 0, (r() * h) | 0, 4, 1); } });
  TX.pave = cvs(16, 16, (c, w, h) => { c.fillStyle = '#4a4e5a'; c.fillRect(0, 0, w, h); c.fillStyle = '#383c48'; c.fillRect(0, 0, w, 1); c.fillRect(0, 0, 1, h); c.fillStyle = '#5a6070'; c.fillRect(5, 6, 3, 1); });
  TX.facade = cvs(32, 32, (c, w, h) => { c.fillStyle = '#7e8896'; c.fillRect(0, 0, w, h);   // diner exterior: ribbed stainless + teal band
    for (let x = 0; x < w; x += 4) { c.fillStyle = '#9aa4b2'; c.fillRect(x, 0, 1, h); c.fillStyle = '#5e6876'; c.fillRect(x + 2, 0, 1, h); }
    c.fillStyle = '#2f8a86'; c.fillRect(0, 22, w, 5); c.fillStyle = '#1e5a58'; c.fillRect(0, 27, w, 1); });
  TX.menu = cvs(64, 40, (c, w, h) => { c.fillStyle = '#16141a'; c.fillRect(0, 0, w, h); c.fillStyle = '#e8507a'; c.fillRect(0, 0, w, 1); c.fillRect(0, h - 1, w, 1);   // backlit menu
    txt(c, 'MENU', w / 2, 6, 7, '#ff9ab8'); [['COFFEE', '1.50'], ['PIE', '3'], ['BURGER', '5'], ['SHAKE', '4']].forEach(([a, b], i) => { txt(c, a, 4, 15 + i * 7, 6, '#f0ead8', 'left'); txt(c, b, w - 4, 15 + i * 7, 6, '#7ef0e0', 'right'); }); });
  TX.closed = cvs(32, 16, (c, w, h) => { c.fillStyle = '#efe6d2'; c.fillRect(0, 0, w, h); c.fillStyle = '#8a2222'; c.fillRect(0, 0, w, 1); c.fillRect(0, h - 1, w, 1); txt(c, 'CLOSED', w / 2, 8.5, 8, '#a01e28'); });
  TX.openTag = cvs(32, 16, (c, w, h) => { c.fillStyle = '#efe6d2'; c.fillRect(0, 0, w, h); c.fillStyle = '#1e6a66'; c.fillRect(0, 0, w, 1); c.fillRect(0, h - 1, w, 1); txt(c, 'OPEN', w / 2, 8.5, 9, '#1e6a66'); });
  TX.rain = cvs(32, 64, (c, w, h) => { c.clearRect(0, 0, w, h); const r = rng(17);   // window streaks: runs + beads (alpha cut-out)
    for (let k = 0; k < 9; k++) { let x = (r() * w) | 0; const y0 = (r() * h * 0.6) | 0, len = 14 + (r() * 40) | 0; for (let y = y0; y < Math.min(h, y0 + len); y++) { if (r() < 0.12) x += r() < 0.5 ? -1 : 1; c.fillStyle = 'rgba(200,225,255,0.9)'; c.fillRect((x + w) % w, y, 1, 1); } c.fillRect((x + w) % w, Math.min(h - 2, y0 + len), 2, 2); }
    for (let k = 0; k < 26; k++) { c.fillStyle = 'rgba(210,232,255,0.9)'; c.fillRect((r() * w) | 0, (r() * h) | 0, 1, 1); } });
  TX.towel = cvs(16, 16, (c, w, h) => { c.fillStyle = '#f4f0e6'; c.fillRect(0, 0, w, h); c.fillStyle = '#c8303c'; c.fillRect(0, 3, w, 2); c.fillRect(0, 11, w, 2); c.fillStyle = '#e0dace'; for (let x = 0; x < w; x += 2) c.fillRect(x, 0, 1, 1); });
  TX.photo = cvs(16, 16, (c, w, h) => { c.fillStyle = '#2a3a5a'; c.fillRect(0, 0, w, h); c.fillStyle = '#e8a050'; c.fillRect(0, 10, w, 6); c.fillStyle = '#c8303c'; c.fillRect(4, 7, 8, 4); c.fillStyle = '#1a1a1a'; c.fillRect(5, 11, 2, 2); c.fillRect(10, 11, 2, 2); });   // a red car photo
  TX.record = cvs(16, 16, (c, w, h) => { c.fillStyle = '#121214'; c.fillRect(0, 0, w, h); c.fillStyle = '#2a2a30'; for (let r2 = 3; r2 < 8; r2 += 2) c.fillRect(8 - r2, 8, r2 * 2, 1); c.fillStyle = '#e8507a'; c.fillRect(6, 6, 4, 4); });
  TX.jukeGlow = cvs(8, 32, (c, w, h) => { const g = ['#ff4f8a', '#ff8a5a', '#ffd25a', '#7ef0a0', '#5ad8f0', '#a07aff']; for (let y = 0; y < h; y++) { c.fillStyle = g[Math.floor(y / h * g.length)]; c.fillRect(0, y, w, 1); } c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(2, 0, 1, h); });
  TX.grille = cvs(16, 16, (c, w, h) => { c.fillStyle = '#2a2024'; c.fillRect(0, 0, w, h); c.fillStyle = '#c8b070'; for (let x = 1; x < w; x += 3) c.fillRect(x, 0, 1, h); });
  TX.selector = cvs(32, 16, (c, w, h) => { c.fillStyle = '#f2ead8'; c.fillRect(0, 0, w, h); c.fillStyle = '#7a6a5a'; for (let y = 2; y < h; y += 3) for (let x = 2; x < w; x += 8) c.fillRect(x, y, 6, 1); c.fillStyle = '#c8303c'; c.fillRect(0, 0, w, 1); });
  TX.clock = cvs(16, 16, (c, w, h) => { c.fillStyle = '#f2ece0'; c.fillRect(0, 0, w, h); c.fillStyle = '#1a1a1a'; c.fillRect(7, 2, 1, 6); c.fillRect(6, 4, 2, 4); for (const [x, y] of [[7, 1], [14, 7], [7, 14], [1, 7]]) c.fillRect(x, y, 2, 1); });
  TX.facadeWin = cvs(8, 8, (c, w, h) => { c.fillStyle = '#ffcf80'; c.fillRect(0, 0, w, h); c.fillStyle = '#e8a050'; c.fillRect(0, 5, w, 3); });
}
// neon lettering on a transparent canvas (alpha cut-out, so it can write the bloom alpha): bright core + darker halo pixels
function neonTex(s, w, h, core, halo, size, font = 'Verdana') {
  return cvs(w, h, (c) => { c.clearRect(0, 0, w, h); c.font = `700 ${size}px ${font}`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.lineJoin = 'round'; c.strokeStyle = halo; c.lineWidth = Math.max(2, size / 5); c.strokeText(s, w / 2, h / 2 + 1); c.fillStyle = core; c.fillText(s, w / 2, h / 2 + 1); });
}
// the umbrella's name tag: kraft paper, "THEO / last tue." (read in the twist insert, shot 21)
function tagTex() {
  return cvs(64, 40, (c, w, h) => {
    c.fillStyle = '#e2cfa4'; c.fillRect(0, 0, w, h); c.fillStyle = '#c8b284'; c.fillRect(0, h - 3, w, 3); c.fillRect(w - 3, 0, 3, h);
    c.fillStyle = '#a88c60'; c.fillRect(4, 4, 4, 4); c.fillStyle = '#e2cfa4'; c.fillRect(5, 5, 2, 2);   // string hole
    txt(c, 'THEO', w / 2 + 3, 15, 17, '#2a1a12');
    txt(c, 'last tue.', w / 2 - 2, 31, 10, '#8a2a3a', 'center', 'Verdana');
    c.fillStyle = '#c83a52'; c.fillRect(54, 26, 2, 2); c.fillRect(57, 26, 2, 2); c.fillRect(54, 28, 5, 2); c.fillRect(55, 30, 3, 1); c.fillRect(56, 31, 1, 1);
  });
}
const tagBack = () => cvs(16, 10, (c, w, h) => { c.fillStyle = '#d8c498'; c.fillRect(0, 0, w, h); c.fillStyle = '#c0aa7c'; c.fillRect(0, h - 1, w, 1); c.fillStyle = '#a88c60'; c.fillRect(w - 3, 1, 2, 2); });
// ---------- characters ----------
// UNLIT (MeshBasic + nearest, like the approved upnext-01 look); a per-shot tint stands in for the light (warm amber inside, cool at the door)
function charMat(src) { const m = new THREE.MeshBasicMaterial({ name: src.name, map: src.map, alphaTest: 0.5, side: THREE.DoubleSide }); if (QS.has('nodecal') && /^face_/.test(src.name)) m.visible = false; return QS.has('charsnap') ? snap(m) : m; }
// v2 (face streaks, user review): the PS1 vertex snap is OFF on the characters. Snapping each vertex to the 270x480 grid opened
// cracks at the head mesh's T-junctions (cheek/eye seams) and the hair's dark back faces showed through as dashed lines across
// the face (proved: ?nodecal keeps the line, ?nosnap removes it; DOF, lens and atlas inset change nothing). The set keeps the snap.
function prepChar(root) {
  root.traverse((o) => {
    if (!o.isMesh) return; o.frustumCulled = false;
    const conv = (m) => { nearest(m.map); return charMat(m); };
    o.material = Array.isArray(o.material) ? o.material.map(conv) : conv(o.material);
  });
}
function faceSet(root, eyes, mouth, kind) {
  const meta = CH[kind].face._meta, cols = meta.cols, rows = meta.rows;
  root.traverse((o) => {
    if (!o.isMesh) return;
    const list = Array.isArray(o.material) ? o.material : [o.material];
    list.forEach((m, i) => {
      const cells = meta[m.name]; if (!cells) return;
      if (!m.userData.faceOwn) { const t = m.map.clone(); nearest(t); t.flipY = false; t.needsUpdate = true; m = charMat({ name: m.name, map: t }); m.userData.faceOwn = true; if (Array.isArray(o.material)) o.material[i] = m; else o.material = m; }
      const want = /eyes/.test(m.name) ? eyes : mouth; const k = cells.indexOf(want);
      if (k < 0) console.log('missing face cell', kind, m.name, want);
      else {   // v2 (face streaks): the cells abut with no padding and the decal UVs end exactly on the cell edge, so nearest sampling
        // pulled the NEIGHBOUR cell's edge pixels (the eyebrows of the row below = a dashed dark line across the cheeks).
        // Inset the sampled window by 1 atlas texel on every side.
        const img = m.map.image, eu = 1 / (img.width || 2944), ev = 1 / (img.height || 416);
        m.map.repeat.set(1 - 2 * eu * cols, 1 - 2 * ev * rows);
        m.map.offset.set((k % cols) / cols + eu, Math.floor(k / cols) / rows + ev);
      }
    });
  });
}
// kind 'vera' | 'theo'. Returns { root (group at the feet), model, pose(clip, t, eyes, mouth), bone(name), world(name, off) }
function character(kind, { tint = 0xffffff, shadow = 0.5 } = {}) {
  const C = CH[kind]; const model = SkeletonUtils.clone(C.src); prepChar(model);
  model.scale.setScalar(C.S); model.position.y = -C.foot * C.S;
  const root = new THREE.Group(); root.add(model);
  const sh = shadow ? blob(root, 0, 0, 0.26, shadow) : null;
  const mixer = new THREE.AnimationMixer(model); let cur = null;
  const ch = {
    root, model, kind, shadow: sh,
    pose(clip, t, eyes, mouth) {
      const c = THREE.AnimationClip.findByName(C.clips, clip); if (!c) { console.log('NO CLIP', kind, clip); return ch; }
      if (cur) cur.stop(); cur = mixer.clipAction(c); cur.play(); cur.time = Math.min(t, c.duration - 1e-3); mixer.update(0);
      if (eyes) faceSet(model, eyes, mouth, kind);
      model.traverse((o) => { if (o.isMesh) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.color.set(tint)); });
      root.updateMatrixWorld(true); return ch;
    },
    bone(n) { return model.getObjectByName(n) || model.getObjectByName(n.replace('.', '')); },
    world(n, off = [0, 0, 0]) { root.updateMatrixWorld(true); return ch.bone(n).localToWorld(V3(...off)); },
  };
  return ch;
}
function holdAt(scene, ch, boneName, prop, off = [0, 0, 0], rot = [0, 0, 0]) {
  ch.root.updateMatrixWorld(true); const b = ch.bone(boneName);
  prop.position.copy(b.localToWorld(V3(...off)));
  const q = new THREE.Quaternion(); b.getWorldQuaternion(q); prop.quaternion.copy(q).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot)));
  scene.add(prop); return prop;
}

// ---------- props ----------
const glassM = (op = 0.16, col = 0xcfe4ff) => basic(null, col, { transparent: true, opacity: op, depthWrite: false, side: THREE.DoubleSide });
function mug({ coffee = false, col = 0xf4f0e6 } = {}) {   // thick white diner mug, origin = bottom centre, handle toward +x
  const g = new THREE.Group(); const m = lam(null, col);
  cyl(0.042, 0.038, 0.09, 10, m, 0, 0.045, 0, g); cyl(0.032, 0.032, 0.004, 10, lam(null, coffee ? 0x3a1e10 : 0xd8d2c6), 0, coffee ? 0.08 : 0.012, 0, g);
  const h = mesh(new THREE.TorusGeometry(0.024, 0.008, 4, 8, Math.PI), m, 0.042, 0.048, 0, g); h.rotation.z = -Math.PI / 2;
  return g;
}
// glass carafe, origin = bottom centre; level = coffee height (one cup left = 0.028); handle toward -x
function coffeePot(level = 0.028) {
  const g = new THREE.Group();
  if (level > 0) cyl(0.066, 0.06, level, 12, basic(null, 0x2a1408, { transparent: true, opacity: 1 }), 0, level / 2 + 0.006, 0, g).renderOrder = 2;   // drawn after the glass so it reads dark brown
  cyl(0.074, 0.064, 0.13, 12, glassM(0.07), 0, 0.065, 0, g);
  cyl(0.05, 0.072, 0.04, 12, glassM(0.22), 0, 0.15, 0, g);
  cyl(0.052, 0.052, 0.035, 12, lam(null, 0x1a1a1e), 0, 0.185, 0, g);                 // black collar
  cyl(0.03, 0.05, 0.02, 10, lam(null, 0xd8702a), 0, 0.212, 0, g);                    // orange decaf-style lid knob ring
  box(0.016, 0.11, 0.024, lam(null, 0x1a1a1e), -0.095, 0.12, 0, g); box(0.04, 0.016, 0.024, lam(null, 0x1a1a1e), -0.075, 0.175, 0, g); box(0.03, 0.016, 0.024, lam(null, 0x1a1a1e), -0.08, 0.07, 0, g);
  const hl = emissive(basic(null, 0xffffff, { transparent: true, opacity: 0.5, depthWrite: false }), 0.5); const s = plane(0.01, 0.08, hl, 0.035, 0.08, 0.068, g); s.rotation.y = 0.4;
  return g;
}
// closed umbrella, origin = top of the J hook; hangs down -y. tag: 'away' (blank back toward the viewer at +z), 'read' (text up / +z)
function umbrella(tag = 'away') {
  const g = new THREE.Group(); const wood = lam(null, 0x6a3a1e), navy = lam(null, 0x1e2a4a), trim = lam(null, 0xc8b070);
  const j = mesh(new THREE.TorusGeometry(0.04, 0.011, 5, 10, Math.PI), wood, -0.04, -0.04, 0, g); j.rotation.z = 0;   // J hook (arc over the peg)
  cyl(0.011, 0.011, 0.13, 6, wood, 0, -0.105, 0, g);                              // grip
  cyl(0.016, 0.016, 0.02, 6, trim, 0, -0.18, 0, g);
  const canopy = mesh(new THREE.ConeGeometry(0.05, 0.62, 8), navy, 0, -0.5, 0, g); canopy.rotation.x = Math.PI;   // wrapped canopy, widest at the top
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; const r = box(0.004, 0.6, 0.004, lam(null, 0x2e3e66), Math.cos(a) * 0.026, -0.5, Math.sin(a) * 0.026, g); r.rotation.set(Math.sin(a) * 0.075, 0, -Math.cos(a) * 0.075); }
  cyl(0.02, 0.02, 0.025, 8, lam(null, 0x2a3a60), 0, -0.21, 0, g);                 // strap
  cyl(0.004, 0.002, 0.06, 4, trim, 0, -0.84, 0, g);                               // ferrule
  // tag on a string from the grip
  const T = new THREE.Group(); T.name = 'tag'; g.add(T); T.position.set(0, -0.15, 0.058);
  cyl(0.0015, 0.0015, 0.05, 3, lam(null, 0xe8e0c8), 0, -0.02, 0.0, T);
  const front = plane(0.064, 0.04, lam(tagTex()), 0, -0.065, 0.003, T); front.name = 'tagFront';
  const back = plane(0.064, 0.04, lam(tagBack()), 0, -0.065, -0.003, T, Math.PI); void back;
  if (tag === 'away') T.rotation.y = Math.PI;
  return g;
}
function towel(open = false) {   // folded diner towel (origin = bottom centre) or an open flying one
  const g = new THREE.Group(); const m = lam(TX.towel);
  if (!open) { box(0.26, 0.04, 0.17, m, 0, 0.02, 0, g); return g; }
  const a = box(0.34, 0.012, 0.2, m, -0.08, 0, 0, g); a.rotation.z = 0.35; const b = box(0.3, 0.012, 0.2, m, 0.15, -0.03, 0, g); b.rotation.z = -0.25; return g;
}
function rag() { const g = new THREE.Group(); box(0.13, 0.02, 0.09, lam(TX.towel), 0, 0, 0, g); return g; }
function stool(scene, x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g); const ch = lam(TX.chrome);
  cyl(0.17, 0.2, 0.03, 12, ch, 0, 0.015, 0, g); cyl(0.03, 0.03, 0.66, 6, ch, 0, 0.35, 0, g);
  cyl(0.19, 0.17, 0.035, 12, ch, 0, 0.69, 0, g); cyl(0.19, 0.19, 0.08, 12, lam(TX.vinyl), 0, 0.748, 0, g);
  return g;
}
function globeLamp(scene, x, y, z, warm = 0xffc890, I = 1.5) {   // milk-glass globe on a chrome stem
  const g = new THREE.Group(); g.position.set(x, y, z); scene.add(g);
  cyl(0.006, 0.006, CEIL - y, 3, lam(TX.chrome), 0, (CEIL - y) / 2, 0, g); cyl(0.05, 0.03, 0.04, 8, lam(TX.chrome), 0, 0.09, 0, g);
  mesh(new THREE.SphereGeometry(0.1, 10, 7), emissive(basic(null, 0xfff2d8), 1.6), 0, 0, 0, g);
  const pl = new THREE.PointLight(warm, I, 3.4, 1.6); pl.position.set(0, -0.2, 0); g.add(pl); return g;
}
function jukebox(scene, x, z, ry) {   // Wurlitzer-ish: arch top, glowing rainbow pillars, record dome, selector strip, grille. Faces +z locally.
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g);
  const wood = lam(null, 0x5a2a1a), W = 0.78, D = 0.5;
  box(W, 0.95, D, wood, 0, 0.475, 0, g);
  const arch = mesh(new THREE.CylinderGeometry(W / 2, W / 2, D, 14, 1, false, -Math.PI / 2, Math.PI), wood, 0, 0.95, 0, g); arch.rotation.x = -Math.PI / 2;
  const glow = emissive(basic(TX.jukeGlow), 1.4);
  for (const sx of [-1, 1]) { const p = box(0.07, 0.92, 0.06, glow, sx * (W / 2 - 0.05), 0.5, D / 2 + 0.012, g); void p; }
  const tube = mesh(new THREE.TorusGeometry(W / 2 - 0.05, 0.03, 5, 16, Math.PI), glow, 0, 0.95, D / 2 + 0.012, g); void tube;
  mesh(new THREE.CircleGeometry(W / 2 - 0.1, 14, 0, Math.PI), emissive(basic(null, 0xff9ac0), 0.9), 0, 0.95, D / 2 + 0.006, g);   // lit dome face
  plane(0.22, 0.22, emissive(basic(TX.record), 0.3), 0, 1.06, D / 2 + 0.018, g);
  plane(0.5, 0.14, emissive(basic(TX.selector), 0.8), 0, 0.82, D / 2 + 0.008, g);
  plane(0.5, 0.42, lam(TX.grille), 0, 0.42, D / 2 + 0.008, g);
  box(W - 0.02, 0.06, D - 0.02, lam(TX.chrome), 0, 0.03, 0, g);
  const pl = new THREE.PointLight(0xff6aa8, 2.2, 2.6, 1.4); pl.position.set(0, 1.0, D / 2 + 0.5); g.add(pl);
  return g;
}
// booth against a side wall: table from the wall inward, two benches facing each other along z. wallX = inner wall x, s = +1 (right wall) / -1 (left)
function booth(scene, wallX, tz, s) {
  const g = new THREE.Group(); scene.add(g); const L = BOOTH.len, xin = wallX - s * BOOTH.gap, xout = xin - s * L, xc = (xin + xout) / 2;
  const tl = Math.abs(BOOTH.tx1 - BOOTH.tx0), txc = wallX - s * (BOOTH.wallGap + tl / 2);
  box(tl, 0.035, BOOTH.td, lam(rep(TX.formica, 2, 1)), txc, TABLE_H - 0.0175, tz, g);
  box(tl + 0.024, 0.02, BOOTH.td + 0.024, lam(TX.chrome), txc, TABLE_H - 0.028, tz, g);
  cyl(0.035, 0.035, TABLE_H - 0.05, 6, lam(TX.chrome), txc, (TABLE_H - 0.05) / 2, tz, g); cyl(0.22, 0.24, 0.025, 10, lam(TX.chrome), txc, 0.0125, tz, g);
  for (const sz of [-1, 1]) {   // bench toward -z / +z of the table
    const zc = tz + sz * BOOTH.seatOff;
    box(L, 0.12, 0.46, lam(rep(TX.vinyl, 4, 2)), xc, SEAT_H - 0.06, zc, g);                         // cushion (top = SEAT_H)
    box(L - 0.04, 0.31, 0.4, lam(null, 0x5a1218), xc, 0.165, zc + sz * 0.02, g);                  // base
    box(L, 0.74, 0.12, lam(rep(TX.vinyl, 4, 3)), xc, SEAT_H + 0.36, zc + sz * 0.27, g);           // backrest (front face 0.21 behind the seat centre)
    const roll = cyl(0.065, 0.065, L, 8, lam(TX.chrome), xc, SEAT_H + 0.74, zc + sz * 0.27, g); roll.rotation.z = Math.PI / 2;
    box(L + 0.004, 0.022, 0.02, lam(TX.chrome), xc, SEAT_H - 0.07, zc - sz * 0.235, g);          // chrome edge on the cushion front
    box(0.03, 0.9, 0.62, lam(null, 0x7a1620), xout - s * 0.016, 0.45, zc + sz * 0.05, g);              // end cap on the aisle side
  }
  return g;
}
function brewer(scene, x, y, z) {   // two-warmer drip brewer on the back bar, an empty pot on the lower warmer
  const g = new THREE.Group(); g.position.set(x, y, z); scene.add(g); const st = lam(TX.steel), dk = lam(null, 0x1e2026);
  box(0.42, 0.5, 0.36, st, 0, 0.25, -0.02, g); box(0.42, 0.06, 0.44, st, 0, 0.53, 0.02, g);
  box(0.42, 0.03, 0.44, dk, 0, 0.015, 0.02, g); cyl(0.07, 0.07, 0.012, 10, dk, -0.1, 0.036, 0.13, g); cyl(0.07, 0.07, 0.012, 10, dk, 0.1, 0.565, 0.1, g);
  const p = coffeePot(0); p.position.set(-0.1, 0.042, 0.13); g.add(p);
  mesh(new THREE.CircleGeometry(0.012, 6), emissive(basic(null, 0xff3030), 1.2), 0.15, 0.4, 0.162, g);
  return g;
}

// ---------- the diner ----------
const CEIL = 2.9;
const COUNTER = { x0: -2.95, x1: 0.85, zf: -1.45, zb: -2.05, h: 1.02 };   // front face z = -1.45, back z = -2.05
const BACKBAR = { x0: -2.95, x1: 0.0, zf: -2.75, h: 0.95 };
const POT = { x: -0.35, z: -1.72 };                                          // the carafe with ONE cup left, on its warmer on the counter
const UMB = { x: 0.42, y: 1.9, z: -3.12 };                                   // brass peg on the back wall behind the counter: the umbrella hangs here
const DOOR = { z: -1.2, w: 0.95, h: 2.15 };
const WIN = { z0: -0.35, z1: 2.75, y0: 0.8, y1: 2.3 };
const TABLE_H = 0.74, SEAT_H = 0.45;
const BOOTH = { tz: 1.15, td: 0.62, tx0: 1.98, tx1: 2.84, len: 1.0, gap: 0.2, wallGap: 0.06, seatOff: 0.72 };   // HER booth: right wall (window), table z 1.15
const BOOTH2 = { tz: 1.75 };                                                 // a second, empty booth on the left wall (set dressing)
const JUKE = { x: -2.45, z: -0.25 };
const STOOLS = [-2.4, -1.75, -1.1, -0.45, 0.62];
const WALL_T = 0.14;
const WX = 3 - WALL_T / 2 - 0.002;                                           // right wall inner skin x
function diner({ sign = 'open', doorOpen = 0, umb = 'hook', pot = true, extraLight = 1, rain = true } = {}) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x070914);
  scene.add(new THREE.HemisphereLight(0xffdcb0, 0x3a2030, 1.15 * extraLight));
  const key = new THREE.DirectionalLight(0xffc890, 0.5); key.position.set(-2, 4, 2); scene.add(key);
  plane(6, 6.2, lam(rep(TX.floor, 8, 8)), 0, 0, -0.1, scene, 0, -Math.PI / 2);
  plane(6, 6.2, basic(null, 0x1c2a2c), 0, CEIL, -0.1, scene, 0, Math.PI / 2);
  for (let k = 0; k < 3; k++) box(5.9, 0.04, 0.16, emissive(basic(null, 0xf6eedc), 0.25), 0, CEIL - 0.03, -2.2 + k * 2.2, scene);   // flush ceiling light strips (low gain)
  // walls: teal wainscot (0-1.0) + chrome rail + cream upper + a pink stripe at 2.05
  const wallStrip = (len, x, z, ry) => { plane(len, 1.0, lam(rep(TX.wains, len * 2, 1)), x, 0.5, z, scene, ry); plane(len, CEIL - 1.0, lam(rep(TX.wall, len * 2, 2)), x, 1.0 + (CEIL - 1.0) / 2, z, scene, ry);
    const dx = Math.sin(ry) * 0.012, dz = Math.cos(ry) * 0.012;
    const r = box(len, 0.04, 0.02, lam(TX.chrome), x + dx, 1.0, z + dz, scene); r.rotation.y = ry;
    const p = box(len, 0.07, 0.02, lam(null, 0xe0607a), x + dx, 2.05, z + dz, scene); p.rotation.y = ry; };
  wallStrip(6, 0, -3.2, 0); wallStrip(6.2, -3, -0.1, Math.PI / 2); wallStrip(6, 0, 3.0, Math.PI);
  // right wall (the highway side) on ONE vertex grid (vera-01 v3 lesson: no T-junction cracks under the snap), inner face of the box hidden
  const rw = (z0, z1, y0, y1) => { const len = z1 - z0, h = y1 - y0, zc = (z0 + z1) / 2, yc = (y0 + y1) / 2;
    box(WALL_T, h, len, [lam(rep(TX.facade, len * 1.5, h * 1.5)), lam(null, 0xc9a77e, { visible: false }), lam(null, 0x2a1c14), lam(null, 0x2a1c14), lam(null, 0x8a8e98), lam(null, 0x8a8e98)], 3, yc, zc, scene);
    if (y0 < 1.0) plane(len, Math.min(1.0, y1) - y0, lam(rep(TX.wains, len * 2, 1)), WX, (y0 + Math.min(1.0, y1)) / 2, zc, scene, -Math.PI / 2);
    if (y1 > 1.0) plane(len, y1 - Math.max(1.0, y0), lam(rep(TX.wall, len * 2, 2)), WX, (Math.max(1.0, y0) + y1) / 2, zc, scene, -Math.PI / 2); };
  const dz0 = DOOR.z - DOOR.w / 2, dz1 = DOOR.z + DOOR.w / 2;
  { const zs = [-3.2, dz0, dz1, WIN.z0, WIN.z1, 3.0], ys = [0, WIN.y0, 1.0, DOOR.h, WIN.y1, CEIL + 0.1];
    for (let i = 0; i < zs.length - 1; i++) for (let j = 0; j < ys.length - 1; j++) {
      const yc = (ys[j] + ys[j + 1]) / 2;
      if (zs[i] === dz0 && yc < DOOR.h) continue;
      if (zs[i] === WIN.z0 && yc > WIN.y0 && yc < WIN.y1) continue;
      rw(zs[i], zs[i + 1], ys[j], ys[j + 1]); } }
  // window: glass + rain-streak layer 1.5 cm outside it + chrome frame + sill
  const frm = lam(TX.chrome), glass = glassM(0.1, 0x9ab8e0);
  plane(WIN.z1 - WIN.z0, WIN.y1 - WIN.y0, glass, 3, (WIN.y0 + WIN.y1) / 2, (WIN.z0 + WIN.z1) / 2, scene, -Math.PI / 2);
  plane(WIN.z1 - WIN.z0, WIN.y1 - WIN.y0, rainGlass(WIN.z1 - WIN.z0, WIN.y1 - WIN.y0, 0.1), 3.006, (WIN.y0 + WIN.y1) / 2, (WIN.z0 + WIN.z1) / 2, scene, -Math.PI / 2);   // drops 6 mm outside the glass, no frame face nearby
  { const bk = rep(bokehTex(), 2, 1); plane(WIN.z1 - WIN.z0 + 0.6, WIN.y1 - WIN.y0 + 0.3, basic(bk, 0xffffff, { transparent: true, opacity: 0.55, depthWrite: false }), 3.4, (WIN.y0 + WIN.y1) / 2 + 0.05, (WIN.z0 + WIN.z1) / 2, scene, -Math.PI / 2); }
  for (const z of [WIN.z0, WIN.z0 + (WIN.z1 - WIN.z0) / 3, WIN.z0 + 2 * (WIN.z1 - WIN.z0) / 3, WIN.z1]) box(WALL_T + 0.04, WIN.y1 - WIN.y0, 0.05, frm, 3, (WIN.y0 + WIN.y1) / 2, z, scene);
  box(WALL_T + 0.04, 0.05, WIN.z1 - WIN.z0, frm, 3, WIN.y0, (WIN.z0 + WIN.z1) / 2, scene); box(WALL_T + 0.04, 0.05, WIN.z1 - WIN.z0, frm, 3, WIN.y1, (WIN.z0 + WIN.z1) / 2, scene);
  box(0.2, 0.035, WIN.z1 - WIN.z0 + 0.1, lam(TX.formica), 2.86, WIN.y0 - 0.005, (WIN.z0 + WIN.z1) / 2, scene);   // sill
  // neon spill from the signs outside onto the booth (pink + teal)
  { const p1 = new THREE.PointLight(0xff4f9a, 1.6, 3.0, 1.5); p1.position.set(3.35, 2.5, 0.2); scene.add(p1);
    const p2 = new THREE.PointLight(0x3ae0d8, 1.3, 3.0, 1.5); p2.position.set(3.35, 2.3, 2.3); scene.add(p2); }
  // glass door (hinge at dz0, opens inward), rain streaks on its glass, OPEN/CLOSED sign
  const door = new THREE.Group(); door.position.set(WX + 0.002, 0, dz0); scene.add(door);
  { const dw = DOOR.w, dh = DOOR.h;
    box(0.05, dh, 0.08, frm, 0, dh / 2, 0.04, door); box(0.05, dh, 0.08, frm, 0, dh / 2, dw - 0.04, door); box(0.05, 0.1, dw, frm, 0, dh - 0.05, dw / 2, door); box(0.05, 0.3, dw, lam(null, 0xc8303c), 0, 0.15, dw / 2, door);
    plane(dw - 0.16, dh - 0.4, glass, 0, dh / 2 + 0.1, dw / 2, door, Math.PI / 2);
    plane(dw - 0.16, dh - 0.4, rainGlass(dw - 0.16, dh - 0.4, 0.7), 0.008, dh / 2 + 0.1, dw / 2, door, Math.PI / 2);
    box(0.06, 0.03, 0.22, lam(TX.chrome), -0.05, 1.02, dw - 0.15, door);
    const tag = new THREE.Group(); tag.position.set(0.0, 1.5, dw / 2); door.add(tag);
    const sg = sign === 'closed' ? TX.closed : TX.openTag;
    plane(0.42, 0.21, lam(sg), 0.035, 0, 0, tag, Math.PI / 2); plane(0.42, 0.21, lam(sg), -0.035, 0, 0, tag, -Math.PI / 2);   // both faces read the same
    cyl(0.002, 0.002, 0.2, 3, lam(null, 0x8a8a8a), 0, 0.12, 0, tag); }
  door.rotation.y = doorOpen;
  { const b = new THREE.Group(); b.position.set(WX - 0.12, DOOR.h + 0.06, dz1 - 0.2); scene.add(b);
    box(0.2, 0.015, 0.015, lam(null, 0xb08a40), 0.05, 0.1, 0, b); mesh(new THREE.CylinderGeometry(0.012, 0.045, 0.06, 8, 1, true), lam(null, 0xd8b050, { side: THREE.DoubleSide }), -0.04, 0.05, 0, b);
    mesh(new THREE.SphereGeometry(0.01, 5, 4), lam(null, 0x806020), -0.04, 0.015, 0, b); scene.userData.bell = b; }
  // rubber mat inside the door (wet)
  box(0.7, 0.012, 1.0, lam(null, 0x2a2a30), WX - 0.42, 0.006, DOOR.z, scene);
  // chrome counter: red vinyl front, chrome bands + kick + foot rail, formica top with a chrome edge
  { const C = COUNTER, len = C.x1 - C.x0, xc = (C.x0 + C.x1) / 2, zc = (C.zf + C.zb) / 2;
    box(len, C.h - 0.05, 0.6, lam(rep(TX.counterFront, len * 3, 1)), xc, (C.h - 0.05) / 2, zc, scene);
    box(len + 0.06, 0.04, 0.68, lam(rep(TX.formica, len * 2, 1)), xc, C.h - 0.02, zc + 0.02, scene);
    box(len + 0.08, 0.025, 0.7, lam(TX.chrome), xc, C.h - 0.045, zc + 0.02, scene);   // chrome edge band (its top inside the formica slab)
    box(len, 0.1, 0.02, lam(TX.chrome), xc, 0.05, C.zf + 0.012, scene);
    const rail = cyl(0.018, 0.018, len, 6, lam(TX.chrome), xc, 0.2, C.zf + 0.13, scene); rail.rotation.z = Math.PI / 2;
    for (const x of [C.x0 + 0.3, xc, C.x1 - 0.2]) { const b = box(0.02, 0.2, 0.12, lam(TX.chrome), x, 0.2, C.zf + 0.065, scene); void b; }
  }
  STOOLS.forEach((x) => stool(scene, x, -1.05));
  // on the counter: the carafe on its warmer (ONE cup left), napkins, sugar, ketchup/mustard, an empty pie dome, the register
  let potM = null;
  { const top = COUNTER.h; box(0.22, 0.02, 0.2, lam(TX.steel), POT.x, top + 0.01, POT.z, scene); cyl(0.085, 0.085, 0.006, 12, lam(null, 0x1e2026), POT.x, top + 0.023, POT.z, scene);
    if (pot) { potM = coffeePot(0.045); potM.position.set(POT.x, top + 0.026, POT.z); potM.rotation.y = 0.4; scene.add(potM); }
    const nd = new THREE.Group(); nd.position.set(-1.3, top, -1.68); scene.add(nd); box(0.1, 0.13, 0.08, lam(TX.chrome), 0, 0.065, 0, nd); plane(0.08, 0.06, lam(null, 0xf4f0e6), 0, 0.09, 0.052, nd);
    cyl(0.03, 0.035, 0.1, 8, glassM(0.35), -1.12, top + 0.05, -1.68, scene); cyl(0.02, 0.03, 0.03, 8, lam(TX.chrome), -1.12, top + 0.115, -1.68, scene);
    cyl(0.025, 0.025, 0.16, 6, lam(null, 0xc8202c), -1.5, top + 0.08, -1.7, scene); cyl(0.025, 0.025, 0.16, 6, lam(null, 0xe8c020), -1.56, top + 0.08, -1.66, scene);
    const pd = new THREE.Group(); pd.position.set(-2.0, top, -1.78); scene.add(pd); cyl(0.16, 0.16, 0.012, 14, lam(null, 0xf2ece2), 0, 0.006, 0, pd);
    mesh(new THREE.SphereGeometry(0.15, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), glassM(0.12), 0, 0.012, 0, pd); cyl(0.05, 0.05, 0.012, 8, lam(null, 0xf6f2ea), 0, 0.018, 0, pd);
    const rg = new THREE.Group(); rg.position.set(-2.62, top, -1.82); scene.add(rg); box(0.36, 0.12, 0.32, lam(null, 0x8a2a2a), 0, 0.06, 0, rg); box(0.3, 0.05, 0.18, lam(TX.chrome), 0, 0.145, 0.04, rg);
    const sc = box(0.26, 0.1, 0.03, lam(null, 0x2a2d34), 0, 0.24, -0.1, rg); sc.rotation.x = -0.35;
    for (const [x, z] of [[-0.85, -1.62], [0.45, -1.66]]) { const m = mug(); m.position.set(x, top, z); m.rotation.y = 2.2; scene.add(m); } }
  // back bar: stainless cabinet, brewer, mug stacks, milkshake mixer, shelves; backlit menu, clock; the umbrella peg (right of the back bar)
  { const B = BACKBAR, len = B.x1 - B.x0, xc = (B.x0 + B.x1) / 2, zc = (-3.2 + B.zf) / 2;
    box(len, B.h, 0.45, lam(rep(TX.steel, len * 3, 2)), xc, B.h / 2, zc, scene);
    box(len + 0.04, 0.04, 0.5, lam(rep(TX.formica, len * 2, 1)), xc, B.h + 0.02, zc + 0.01, scene);
    brewer(scene, -0.55, B.h + 0.04, zc + 0.02);
    for (let k = 0; k < 3; k++) for (let j = 0; j < 3; j++) { const m = mug(); m.position.set(-1.15 + k * 0.1, B.h + 0.04 + j * 0.092, zc + 0.05); m.rotation.y = 1.9; scene.add(m); }
    const mx = new THREE.Group(); mx.position.set(-1.7, B.h + 0.04, zc); scene.add(mx); box(0.16, 0.08, 0.16, lam(null, 0x6ac0a8), 0, 0.04, 0, mx); cyl(0.025, 0.025, 0.36, 6, lam(null, 0x6ac0a8), 0, 0.26, -0.04, mx);
    box(0.16, 0.08, 0.14, lam(null, 0x6ac0a8), 0, 0.42, 0.0, mx); cyl(0.05, 0.04, 0.18, 8, lam(TX.chrome), 0, 0.17, 0.03, mx);
    for (const y of [1.55, 1.92]) { box(2.6, 0.03, 0.24, lam(TX.steel), -1.6, y, -3.075, scene);
      for (let x = -2.8; x < -0.4; x += 0.16) { if (y > 1.8) { const p = cyl(0.07, 0.07, 0.014, 10, lam(null, 0xf4f0e6), x, y + 0.022, -3.075, scene); p.rotation.x = 1.25; p.position.z = -3.13; } else { const m = mug(); m.position.set(x, y + 0.015, -3.075); m.rotation.y = 1.6; scene.add(m); } } }
    box(1.7, 0.6, 0.04, lam(null, 0x16141a), -1.6, 2.42, -3.17, scene); plane(1.6, 0.52, emissive(basic(TX.menu), 0.55), -1.6, 2.42, -3.135, scene);
    const ck = new THREE.Group(); ck.position.set(1.55, 2.35, -3.16); scene.add(ck);   // 11:55, almost closing
    mesh(new THREE.CircleGeometry(0.2, 16), lam(TX.clock), 0, 0, 0.012, ck); mesh(new THREE.TorusGeometry(0.21, 0.018, 4, 18), emissive(basic(null, 0x5af0e0), 1.3), 0, 0, 0.02, ck);
    // the umbrella peg + apron next to it
    box(0.06, 0.06, 0.04, lam(null, 0x3a2416), UMB.x, UMB.y, -3.18, scene); cyl(0.008, 0.008, 0.12, 5, lam(null, 0xc8a050), UMB.x, UMB.y, -3.11, scene).rotation.x = Math.PI / 2;
    box(0.06, 0.06, 0.04, lam(null, 0x3a2416), UMB.x + 0.38, UMB.y, -3.18, scene);
    const ap = box(0.32, 0.6, 0.02, lam(null, 0xe8e2d4), UMB.x + 0.38, UMB.y - 0.33, -3.155, scene); void ap;
  }
  let umbM = null;
  if (umb === 'hook') { umbM = umbrella('away'); umbM.position.set(UMB.x + 0.04, UMB.y + 0.01, UMB.z + 0.045); scene.add(umbM); }
  // globe lamps over the counter and the booths
  for (const x of [-2.1, -0.95, 0.2]) globeLamp(scene, x, 2.2, -1.75);
  globeLamp(scene, 2.35, 2.05, BOOTH.tz, 0xffb870, 1.7); globeLamp(scene, -2.35, 2.05, BOOTH2.tz, 0xffb870, 1.2);
  booth(scene, WX, BOOTH.tz, 1); booth(scene, -3 + 0.002, BOOTH2.tz, -1);
  jukebox(scene, JUKE.x, JUKE.z, Math.PI / 2 - 0.55);
  // left / front wall decor: photos, a neon EAT sign, a coat stand by the door
  for (const [z, t] of [[-1.4, 0], [0.55, 1]]) { box(0.03, 0.42, 0.56, lam(TX.chrome), -2.975, 1.72, z, scene); plane(0.48, 0.34, lam(t ? TX.photo : TX.facadeWin, t ? 0xffffff : 0xd8b0a0), -2.955, 1.72, z, scene, Math.PI / 2); }
  plane(0.9, 0.3, emissive(basic(neonTex('EAT', 48, 16, '#ff7ab0', '#a01e58', 13), 0xffffff, { alphaTest: 0.5 }), 1.4), -2.96, 2.45, 1.75, scene, Math.PI / 2);
  plane(1.2, 0.35, emissive(basic(neonTex('PIE  COFFEE', 64, 16, '#7ef0e0', '#1e7a74', 10), 0xffffff, { alphaTest: 0.5 }), 1.2), -0.3, 2.45, 2.975, scene, Math.PI);
  { const cr = new THREE.Group(); cr.position.set(2.6, 0, -2.55); scene.add(cr); cyl(0.02, 0.02, 1.8, 5, lam(TX.chrome), 0, 0.9, 0, cr); cyl(0.2, 0.22, 0.03, 8, lam(TX.chrome), 0, 0.015, 0, cr);
    for (const a of [0, 2.1, 4.2]) box(0.14, 0.02, 0.02, lam(TX.chrome), Math.cos(a) * 0.07, 1.75, Math.sin(a) * 0.07, cr).rotation.y = -a; }
  // ---- outside: wet sidewalk, parking lot, highway, the neon signs, rain ----
  { plane(1.3, 14, lam(rep(TX.pave, 5, 50), 0x8a90a8), 3.65, 0.0, -0.1, scene, 0, -Math.PI / 2);
    box(0.12, 0.14, 14, lam(null, 0x5a6070), 4.3, 0.07, -0.1, scene);
    plane(14, 30, lam(rep(TX.asphalt, 24, 50), 0x8a90b0), 11.3, -0.06, -0.1, scene, 0, -Math.PI / 2);
    for (let k = -4; k <= 5; k++) plane(2.4, 0.06, lam(null, 0xb8bcc8), 6.0, -0.048, k * 1.3, scene, 0, -Math.PI / 2);   // parking lines (12 mm above the asphalt)
    // neon reflections smeared on the wet lot (low-gain emissive strips)
    const refl = (x, z, w, d, col) => plane(w, d, basic(null, col, { transparent: true, opacity: 0.16, depthWrite: false }), x, -0.04, z, scene, 0, -Math.PI / 2);
    refl(5.0, 1.2, 1.8, 2.6, 0xff4f9a); refl(5.6, 0.2, 2.6, 0.3, 0xff4f9a); refl(5.4, 2.3, 2.2, 0.4, 0x3ae0d8); refl(6.4, -3.4, 3.0, 0.5, 0xff8ac0);
    // a parked car under the rain
    { const car = new THREE.Group(); car.position.set(6.6, 0, -1.6); scene.add(car); box(1.7, 0.5, 3.6, lam(null, 0x2a4a6a), 0, 0.45, 0, car); box(1.5, 0.42, 1.8, lam(null, 0x223a54), 0, 0.9, -0.2, car);
      box(1.52, 0.3, 1.6, basic(null, 0x0e1420), 0, 0.92, -0.2, car).scale.set(1.0, 1.0, 1.0);
      for (const [x, z] of [[-0.8, 1.15], [0.8, 1.15], [-0.8, -1.15], [0.8, -1.15]]) { const w = cyl(0.3, 0.3, 0.2, 8, lam(null, 0x101014), x, 0.3, z, car); w.rotation.z = Math.PI / 2; }
      for (const x of [-0.55, 0.55]) mesh(new THREE.CircleGeometry(0.08, 6), emissive(basic(null, 0xff3030), 0.6), x, 0.55, -1.81, car).rotation.y = Math.PI; }
    // highway: guardrail + passing headlights far away, dark hills, sky
    box(0.08, 0.3, 30, lam(null, 0x6a7080), 16.5, 0.6, -0.1, scene);
    for (let k = -6; k <= 6; k++) cyl(0.04, 0.04, 0.7, 4, lam(null, 0x4a5060), 16.5, 0.35, k * 2.2, scene);
    for (const [z, col] of [[-6, 0xfff2c8], [-5.6, 0xfff2c8], [4.5, 0xff4030], [4.9, 0xff4030]]) mesh(new THREE.SphereGeometry(0.08, 5, 4), emissive(basic(null, col), 2.0), 18.5, 0.7, z, scene);
    plane(80, 9, basic(null, 0x0c1020), 34, 2.0, -0.1, scene, -Math.PI / 2);
    const hills = cvs(64, 16, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = '#121828'; for (let x = 0; x < w; x++) { const y = 8 + 4 * Math.sin(x * 0.2) + 2 * Math.sin(x * 0.53); c.fillRect(x, y | 0, 1, h); } });
    plane(80, 8, basic(hills, 0xffffff, { alphaTest: 0.5 }), 33, 4.0, -0.1, scene, -Math.PI / 2);
    // roof sign over the window: MOONLITE (pink) DINER (teal) on a stainless parapet + pink neon edge
    box(0.12, 0.7, 3.8, lam(rep(TX.facade, 4, 1)), 3.13, CEIL + 0.45, (WIN.z0 + WIN.z1) / 2, scene);
    plane(2.3, 0.5, emissive(basic(neonTex('MOONLITE', 96, 20, '#ff8ac0', '#d0206a', 16), 0xffffff, { alphaTest: 0.5 }), 1.5), 3.21, CEIL + 0.45, WIN.z0 + 2.4, scene, Math.PI / 2);
    plane(1.3, 0.5, emissive(basic(neonTex('DINER', 56, 20, '#8afff0', '#109a90', 16), 0xffffff, { alphaTest: 0.5 }), 1.5), 3.21, CEIL + 0.45, WIN.z0 + 0.55, scene, Math.PI / 2);
    box(0.04, 0.04, 3.8, emissive(basic(null, 0xff5aa0), 1.4), 3.22, CEIL + 0.82, (WIN.z0 + WIN.z1) / 2, scene);
    box(0.04, 0.04, 3.8, emissive(basic(null, 0x3ae0d8), 1.2), 3.22, CEIL + 0.06, (WIN.z0 + WIN.z1) / 2, scene);
    // pole sign in the lot: a crescent moon + MOONLITE / OPEN 24 (well, until midnight)
    { const ps = new THREE.Group(); ps.position.set(5.6, 0, -4.2); scene.add(ps); cyl(0.08, 0.1, 4.2, 6, lam(null, 0x3a3e4a), 0, 2.1, 0, ps);
      box(0.25, 1.1, 2.3, lam(null, 0x1a1c26), 0, 4.6, 0, ps);
      plane(2.1, 0.55, emissive(basic(neonTex('MOONLITE', 96, 24, '#ff8ac0', '#d0206a', 18), 0xffffff, { alphaTest: 0.5 }), 1.6), -0.14, 4.75, 0, ps, -Math.PI / 2);
      plane(1.3, 0.35, emissive(basic(neonTex('DINER', 56, 16, '#8afff0', '#109a90', 13), 0xffffff, { alphaTest: 0.5 }), 1.4), -0.14, 4.3, 0, ps, -Math.PI / 2);
      const moon = mesh(new THREE.TorusGeometry(0.32, 0.06, 4, 12, Math.PI * 1.2), emissive(basic(null, 0xffe27a), 1.6), -0.15, 5.55, 0.6, ps); moon.rotation.y = -Math.PI / 2; moon.rotation.z = 0.9; }
    const moonL = new THREE.DirectionalLight(0x5a70c8, 0.5); moonL.position.set(8, 6, 2); moonL.target.position.set(3, 0, 0); scene.add(moonL); scene.add(moonL.target);
    const lotL = new THREE.PointLight(0xff5aa0, 2.2, 7, 1.3); lotL.position.set(4.2, 3.0, 1.2); scene.add(lotL);
    const lotT = new THREE.PointLight(0x3ae0d8, 1.6, 6, 1.3); lotT.position.set(4.2, 2.6, -1.2); scene.add(lotT);
  }
  // rain: falling streaks outside (static in the stills, scrolled in the film)
  if (rain) { const r = rng(33), N = 1000, pos = new Float32Array(N * 6);
    for (let i = 0; i < N; i++) { const x = 3.2 + r() * 11, y = r() * 6, z = -8 + r() * 16, l = 0.18 + r() * 0.16; pos.set([x, y, z, x - 0.02, y - l, z + 0.01], i * 6); }
    const base = new Float32Array(N * 2); for (let i = 0; i < N; i++) base[i * 2] = base[i * 2 + 1] = pos[i * 6 + 1];
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('base', new THREE.BufferAttribute(base, 1));
    const lm = keepA(new THREE.LineBasicMaterial({ color: 0xa8c4f0, transparent: true, opacity: 0.2, depthWrite: false }));
    lm.onBeforeCompile = (sh) => { sh.uniforms.uT = UT; sh.vertexShader = 'uniform float uT; attribute float base;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n transformed.y += mod(base - uT * 7.5, 6.0) - base;'); };
    const rl = new THREE.LineSegments(geo, lm); rl.frustumCulled = false; scene.add(rl); scene.userData.rain = rl; }
  return { scene, door, bell: scene.userData.bell, pot: potM, umb: umbM };
}
// ---------- shot helpers ----------
function cam(fov, pos, look, roll = 0) {
  const c = new THREE.PerspectiveCamera(fov, LW / LH, 0.03, 80); c.position.set(...pos); c.lookAt(...look); if (roll) c.rotateZ(roll); return c;
}
let SI = 0;
function addShot(scene, camera, extra = {}) { if (QS.has('camlog')) { const d = new THREE.Vector3(); camera.getWorldDirection(d); console.log('cam', SI, camera.position.toArray().map((v) => v.toFixed(2)).join(','), 'dir', d.toArray().map((v) => v.toFixed(2)).join(','), 'fov', camera.fov); } SHOTS.push({ t0: SI * 3, scene, camera, hard: true, update() {}, ...extra }); SI++; }


// ---------- loading ----------
export async function loadAll() {
  const gl = new GLTFLoader();
  for (const kind of ['vera', 'theo']) {
    const g = await gl.loadAsync(`models/${kind}.glb`); const face = await (await fetch(`models/${kind}_face_tracks.json`)).json();
    const bb = new THREE.Box3().setFromObject(g.scene, true);
    CH[kind] = { src: g.scene, clips: g.animations, face, foot: bb.min.y, S: HEIGHTS[kind] / (bb.max.y - bb.min.y), H: HEIGHTS[kind] };
    console.log(kind, 'bind', bb.min.toArray().map((v) => v.toFixed(2)), bb.max.toArray().map((v) => v.toFixed(2)), 'S', CH[kind].S.toFixed(4), 'clips', g.animations.length);
  }
  makeTextures();
  window.WORDS_OVERRIDE = [];
  const L = { UT, CH, addShot, diner, character, holdAt, mug, coffeePot, umbrella, towel, rag, cam, box, plane, mesh, cyl, lam, basic, emissive, blob, cvs, TX,
    COUNTER, POT, UMB, DOOR, WIN, BOOTH, JUKE, STOOLS, TABLE_H, SEAT_H, WX, V3, THREE };
  if (QS.get('poses')) {   // pose sheet: one still per clip, three phases side by side
    const kind = QS.get('poses'), list = (QS.get('clips') || '').split(',').filter(Boolean);
    const clips = list.length ? list : CH[kind].clips.map((c) => c.name); window.SB = [];
    for (const name of clips) {
      const sc = new THREE.Scene(); sc.background = new THREE.Color(0xd8d0c4); sc.add(new THREE.HemisphereLight(0xffffff, 0x888888, 1));
      const c = THREE.AnimationClip.findByName(CH[kind].clips, name); if (!c) continue;
      const ph = (QS.get('phases') || '0.2,0.5,0.85').split(',').map(Number);
      ph.forEach((f, i) => { const ch = character(kind, { shadow: 0.4 }); ch.pose(name, c.duration * f, 'open', 'neutral'); if (QS.has('side')) ch.root.position.z = (i - (ph.length - 1) / 2) * 0.75; else ch.root.position.x = (i - (ph.length - 1) / 2) * 0.75; sc.add(ch.root); });
      window.SB.push({ id: name, dur: c.duration }); addShot(sc, QS.has('side') ? cam(40, [1.55 * ph.length, 1.0, 0], [0, 0.88, 0]) : cam(40, [0, 1.0, QS.has('back') ? -1.6 * ph.length : 1.55 * ph.length], [0, 0.88, 0]));
    }
    return;
  }
  if (QS.has('film')) L.TL = await (await fetch('film_timeline.json')).json();
  const { buildShots } = await import('./sb_shots.js');
  buildShots(L);
  if (L.TL) window.FILM = { dur: L.TL.dur, frames: Math.round(L.TL.dur * 30), shots: L.TL.shots.map((s) => [s.id, s.t0]) };
}
