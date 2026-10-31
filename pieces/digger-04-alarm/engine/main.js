// PS1 explainer engine: shots render at LOW res, then one pass does dissolve, captions, colour quantise (+ optional dither),
// nearest upscale and scanlines at OUT res. v2: 270x480 x4 like the ref (measured: 4-px pixel grid, one scanline per
// low-res row at -8.5 %, no visible dither). window.renderFrame(f) is the only entry point (deterministic).
import * as THREE from 'three';
import { SHOTS, loadAll } from './shots.js';
import WORDS, { KEYWORDS } from './words.js';

export const FPS = 30, LW = 270, LH = 480, OW = 1080, OH = 1920;
const FILTER = { levels: 63, dither: 0.0, scan: 0.915 };   // v1 was 31 levels, dither 1.0, scan 0.86 on every 2nd row

const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(OW, OH, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

// scenes render linear into half-float targets; the post pass encodes to sRGB before quantising
const mkRT = () => new THREE.WebGLRenderTarget(LW, LH, {
  minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, type: THREE.HalfFloatType,
});
const rtA = mkRT(), rtB = mkRT();

// captions + labels are drawn on a low-res 2D canvas so they pixelate like the picture
const tcv = document.createElement('canvas'); tcv.width = LW; tcv.height = LH;
const tctx = tcv.getContext('2d');
const textTex = new THREE.CanvasTexture(tcv);
textTex.minFilter = textTex.magFilter = THREE.NearestFilter;
// v3: the caption has its own low-res canvas, drawn at size 1; the post pass scales that bitmap about the pivot at OUTPUT
// resolution (nearest), like an editor scaling a layer: the ref's pop frames are not on the 4 px grid (widths 134/165/154/157)
const capcv = document.createElement('canvas'); capcv.width = LW; capcv.height = LH; const capctx = capcv.getContext('2d');
const capTex = new THREE.CanvasTexture(capcv); capTex.minFilter = capTex.magFilter = THREE.NearestFilter; capTex.generateMipmaps = false;

const post = new THREE.ShaderMaterial({
  uniforms: {
    tA: { value: rtA.texture }, tB: { value: rtB.texture }, tText: { value: textTex }, tCap: { value: capTex }, capScale: { value: 1 }, capPivot: { value: new THREE.Vector2(LW / 2, LH * 0.8) },
    mixAB: { value: 0 }, block: { value: 1 }, low: { value: new THREE.Vector2(LW, LH) }, outH: { value: OH },
    levels: { value: FILTER.levels }, dith: { value: FILTER.dither }, scan: { value: FILTER.scan }, rowsPer: { value: OH / LH },
  },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
  fragmentShader: `
    uniform sampler2D tA, tB, tText, tCap; uniform float capScale; uniform vec2 capPivot; uniform float mixAB, block, outH, levels, dith, scan, rowsPer; uniform vec2 low; varying vec2 vUv;
    float bayer(vec2 p){ int x=int(mod(p.x,4.0)), y=int(mod(p.y,4.0));
      int m[16]; m[0]=0;m[1]=8;m[2]=2;m[3]=10;m[4]=12;m[5]=4;m[6]=14;m[7]=6;m[8]=3;m[9]=11;m[10]=1;m[11]=9;m[12]=15;m[13]=7;m[14]=13;m[15]=5;
      return float(m[y*4+x])/16.0 - 0.5; }
    void main(){
      vec2 px = floor(vUv * low);                       // the low-res pixel this output pixel belongs to
      vec2 bp = (floor(px / block) * block + 0.5 * block) / low;   // mosaic during the dissolve
      vec3 c = mix(texture2D(tA, bp).rgb, texture2D(tB, bp).rgb, mixAB);
      c = mix(c * 12.92, 1.055 * pow(max(c, 0.0), vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
      vec4 tx = texture2D(tText, (px + 0.5) / low);
      if (tx.a > 0.5) c = tx.rgb;                       // hard-edged text, no anti-aliasing
      vec2 pc = vec2(vUv.x * low.x, (1.0 - vUv.y) * low.y);              // caption: scaled about the pivot per output pixel
      vec2 qc = capPivot + (pc - capPivot) / capScale;
      vec4 cp = texture2D(tCap, vec2(qc.x / low.x, 1.0 - qc.y / low.y));
      if (cp.a > 0.5) c = cp.rgb;
      c = floor(c * levels + dith * bayer(px) + 0.5) / levels;   // colour quantise, optional ordered dither
      if (mod(floor(gl_FragCoord.y), rowsPer) < 1.0) c *= scan;      // one dark output row per low-res row (bottom row)
      gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
    }`,
  depthTest: false, depthWrite: false,
});
const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), post);
// digger: snowfall/HUD drawn by shots go through the same fx canvas
// v3: code VFX (fx.js) are drawn per shot on a low-res canvas and composited INTO the shot's render target, so they
// get the mosaic dissolve and the colour pipeline like the 3D picture (the ref's stink lines mosaic out at 7.35 s)
const fcv = document.createElement('canvas'); fcv.width = LW; fcv.height = LH; const fctx = fcv.getContext('2d', { willReadFrequently: true });
const fxTex = new THREE.CanvasTexture(fcv); fxTex.colorSpace = THREE.SRGBColorSpace; fxTex.minFilter = fxTex.magFilter = THREE.NearestFilter; fxTex.generateMipmaps = false;
const fxScene = new THREE.Scene(), fxCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1); fxCam.position.z = 0.5;
window.__fx = { fcv, fxTex, renderer, rtA, fxScene, fxCam }; fxScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: fxTex, alphaTest: 0.5, depthTest: false, depthWrite: false, toneMapped: false })));
const postScene = new THREE.Scene(); postScene.add(quad);
const postCam = new THREE.Camera();

// captions (v3: centred at x = 0.449 like the ref, measured mean text centre 485/1080 over all words): Pixelify Sans Bold (OFL, fonts/), lower case as spoken, hard 1-bit glyphs, blocky square black outline
// plus a drop toward the bottom (measured on the ref crops, caption_compare.png)
const CAP = { size: 24, out: 3, drop: 1, x: 0.449, y: 0.74, bold: 1, font: 'Pixelify', weight: 700, white: '#fefeff', black: '#040412', yellow: '#fdd941' };   // colours measured on the ref
const KEY = new Set(KEYWORDS);   // technical terms in yellow (words.js)
// v3 pop-in, measured on the ref at frame level (ref/capmeasure: text bbox of 26 word onsets): the new word is drawn
// at once (no fade) at 0.86 of its size, then 1.05, 0.98, 1.00 on the next 30 fps frames, same factor in x and y,
// re-rasterised crisp each frame; centred in x, anchored on a line 9 low-res px (36 out px) below the glyph baseline
const POP = [0.86, 1.05, 0.98], PIVOT = 9;
let BASE = null;   // px from the 'middle' text line down to the alphabetic baseline at CAP.size (measured once)
const ccv = document.createElement('canvas'); ccv.width = LW; ccv.height = 72;
const cctx = ccv.getContext('2d', { willReadFrequently: true });
const ocv = document.createElement('canvas'); ocv.width = LW; ocv.height = 72; const octx = ocv.getContext('2d');
export function pixelText(s, x, y, size, fill, out = CAP.out, drop = CAP.drop, opts = {}) {
  const W = ccv.width, H = ccv.height;
  cctx.clearRect(0, 0, W, H);
  cctx.font = `${CAP.weight} ${size}px ${CAP.font}`; cctx.textAlign = 'center'; cctx.textBaseline = 'middle';
  cctx.letterSpacing = `${opts.spacing || 0}px`;   // v4: labels get real letter spacing so glyphs never touch
  cctx.fontVariantLigatures = 'none'; if ('fontKerning' in cctx) cctx.fontKerning = 'none';
  s = s.replace(/f(?=[ijl])/g, 'f ');   // digger-04: Pixelify 'fi'/'fl' merged into one blob ('fired' read 'Ared'): hair space after f
  cctx.fillStyle = '#fff'; cctx.fillText(s, W / 2, H / 2); cctx.letterSpacing = '0px';
  const src = cctx.getImageData(0, 0, W, H), m = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) m[i] = src.data[i * 4 + 3] > 110 ? 1 : 0;
  const bold = opts.bold ?? CAP.bold;
  for (let i = W * H - 1; i > 0; i--) if (bold && i % W && m[i - 1]) m[i] = 1;   // 1 px faux-bold: the ref strokes are fatter (captions only)
  const hx = new Uint8Array(W * H), o = new Uint8Array(W * H);         // separable square dilation, longer downward
  for (let yy = 0; yy < H; yy++) for (let xx = 0; xx < W; xx++) { let v = 0; for (let k = -out; k <= out && !v; k++) { const q = xx + k; if (q >= 0 && q < W) v = m[yy * W + q]; } hx[yy * W + xx] = v; }
  for (let yy = 0; yy < H; yy++) for (let xx = 0; xx < W; xx++) { let v = 0; for (let k = -out - drop; k <= out && !v; k++) { const q = yy + k; if (q >= 0 && q < H) v = hx[q * W + xx]; } o[yy * W + xx] = v; }
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));   // raw sRGB bytes (THREE.Color would linearise)
  const img = octx.createImageData(W, H), fc = hex(fill), bc = hex(CAP.black);
  for (let i = 0; i < W * H; i++) {
    const c = m[i] ? fc : o[i] ? bc : null; if (!c) continue;
    img.data[i * 4] = c[0]; img.data[i * 4 + 1] = c[1]; img.data[i * 4 + 2] = c[2]; img.data[i * 4 + 3] = 255;
  }
  octx.putImageData(img, 0, 0);
  (opts.ctx || tctx).drawImage(ocv, Math.round(x - W / 2), Math.round(y - H / 2));
}
function baseline() {
  const H = ccv.height; cctx.clearRect(0, 0, ccv.width, H);
  cctx.font = `${CAP.weight} ${CAP.size}px ${CAP.font}`; cctx.textAlign = 'center'; cctx.textBaseline = 'middle'; cctx.fillStyle = '#fff'; cctx.fillText('xo', ccv.width / 2, H / 2);
  const d = cctx.getImageData(0, 0, ccv.width, H).data; let low = 0;
  for (let i = 3; i < d.length; i += 4) if (d[i] > 110) low = Math.max(low, Math.floor(i / 4 / ccv.width));
  return low + 1 - H / 2;
}
function caption(t) {
  tctx.clearRect(0, 0, LW, LH); capctx.clearRect(0, 0, LW, LH); post.uniforms.capScale.value = 1;
  const W = window.WORDS_OVERRIDE || WORDS; const w = W.find(([a, b], i) => t >= a && t < (W[i + 1] ? W[i + 1][0] : b + 0.4));
  if (!w) return;
  if (BASE === null) BASE = baseline();
  const f = Math.floor((t - w[0]) * FPS + 1e-6), x = Math.round(LW * CAP.x), y = Math.round(LH * CAP.y);
  pixelText(w[2], x, y, CAP.size, KEY.has(w[2].replace(/[.,]/g, '').toLowerCase()) ? CAP.yellow : CAP.white, CAP.out, CAP.drop, { ctx: capctx });
  post.uniforms.capScale.value = f < POP.length ? POP[f] : 1;
  post.uniforms.capPivot.value.set(x, y + BASE + PIVOT);
}

export function drawText(s, x, y, size, fill, opts = {}) {
  tctx.font = `${opts.weight || 'bold'} ${size}px ${opts.font || 'Verdana'}`;
  tctx.textAlign = opts.align || 'center'; tctx.textBaseline = 'middle';
  tctx.lineJoin = 'round'; tctx.lineWidth = opts.stroke || 4; tctx.strokeStyle = '#000';
  tctx.strokeText(s, x, y); tctx.fillStyle = fill; tctx.fillText(s, x, y);
}

const DBG = new URLSearchParams(location.search).get('cam')?.split(',').map(Number);   // debug: ?cam=x,y,z,lx,ly,lz[,fov]
const TR = 0.3; // dissolve length (s), centred on each shot boundary
function shotAt(t) { let i = 0; while (i < SHOTS.length - 1 && t >= SHOTS[i + 1].t0) i++; return i; }

window.renderFrame = (f) => {
  const t = f / FPS;
  const i = shotAt(t);
  let a = i, b = i, m = 0, blk = 1;
  const next = SHOTS[i + 1], cur = SHOTS[i];
  if (next && !next.hard && t > next.t0 - TR / 2) { b = i + 1; m = (t - (next.t0 - TR / 2)) / TR; }
  else if (i > 0 && !cur.hard && t < cur.t0 + TR / 2) { a = i - 1; m = (t - (cur.t0 - TR / 2)) / TR; }
  if (a !== b) blk = Math.max(1, Math.round(1 + 9 * Math.sin(Math.PI * m)));
  for (const [k, rt] of [[a, rtA], [b, rtB]]) {
    const s = SHOTS[k];
    s.update(t - s.t0, t);
    if (DBG) { s.camera.position.set(DBG[0], DBG[1], DBG[2]); s.camera.lookAt(DBG[3], DBG[4], DBG[5]); if (DBG[6]) { s.camera.fov = DBG[6]; s.camera.updateProjectionMatrix(); } }
    renderer.setRenderTarget(rt); renderer.render(s.scene, s.camera);
    if (s.fx) { s.fx.draw(fctx, t, s.camera); fxTex.needsUpdate = true; renderer.autoClear = false; renderer.render(fxScene, fxCam); renderer.autoClear = true; }
  }
  caption(t);
  for (const k of new Set([a, b])) if (SHOTS[k].overlay) SHOTS[k].overlay(t - SHOTS[k].t0, drawText, a === b ? 1 : (k === b ? m : 1 - m), { pixelText, tctx, camera: SHOTS[k].camera });
  textTex.needsUpdate = true; capTex.needsUpdate = true;
  post.uniforms.mixAB.value = a === b ? 0 : THREE.MathUtils.smoothstep(m, 0.25, 0.75);
  post.uniforms.block.value = blk;
  renderer.setRenderTarget(null); renderer.render(postScene, postCam);
};

const pix = new FontFace('Pixelify', 'url(fonts/PixelifySans.ttf)', { weight: '400 700' });
document.fonts.add(await pix.load());
await loadAll(renderer);
window.READY = true;
