// PS1 explainer engine: shots render at LOW res, then one pass does dissolve, captions, 15-bit colour + dither,
// nearest upscale and scanlines at OUT res. window.renderFrame(f) is the only entry point (deterministic).
import * as THREE from 'three';
import { SHOTS, loadAll } from './shots.js';
import WORDS from './words.js';

export const FPS = 30, LW = 360, LH = 640, OW = 1080, OH = 1920;

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

const post = new THREE.ShaderMaterial({
  uniforms: {
    tA: { value: rtA.texture }, tB: { value: rtB.texture }, tText: { value: textTex },
    mixAB: { value: 0 }, block: { value: 1 }, low: { value: new THREE.Vector2(LW, LH) }, outH: { value: OH },
  },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
  fragmentShader: `
    uniform sampler2D tA, tB, tText; uniform float mixAB, block, outH; uniform vec2 low; varying vec2 vUv;
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
      c = floor(c * 31.0 + bayer(px) + 0.5) / 31.0;    // 15-bit colour with ordered dither
      if (mod(floor(gl_FragCoord.y), 2.0) < 1.0) c *= 0.86;   // scanlines at output resolution
      gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
    }`,
  depthTest: false, depthWrite: false,
});
const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), post);
const postScene = new THREE.Scene(); postScene.add(quad);
const postCam = new THREE.Camera();

function caption(t) {
  tctx.clearRect(0, 0, LW, LH);
  const w = WORDS.find(([a, b], i) => t >= a && t < (WORDS[i + 1] ? WORDS[i + 1][0] : b + 0.4));
  if (w) drawText(w[2].toLowerCase(), LW / 2, LH * 0.735, 30, '#ffffff', { stroke: 7 });
}

export function drawText(s, x, y, size, fill, opts = {}) {
  tctx.font = `${opts.weight || 'bold'} ${size}px ${opts.font || 'Verdana'}`;
  tctx.textAlign = opts.align || 'center'; tctx.textBaseline = 'middle';
  tctx.lineJoin = 'round'; tctx.lineWidth = opts.stroke || 4; tctx.strokeStyle = '#000';
  tctx.strokeText(s, x, y); tctx.fillStyle = fill; tctx.fillText(s, x, y);
}

const TR = 0.3; // dissolve length (s), centred on each shot boundary
function shotAt(t) { let i = 0; while (i < SHOTS.length - 1 && t >= SHOTS[i + 1].t0) i++; return i; }

window.renderFrame = (f) => {
  const t = f / FPS;
  const i = shotAt(t);
  let a = i, b = i, m = 0, blk = 1;
  const next = SHOTS[i + 1], cur = SHOTS[i];
  if (next && t > next.t0 - TR / 2) { b = i + 1; m = (t - (next.t0 - TR / 2)) / TR; }
  else if (i > 0 && t < cur.t0 + TR / 2) { a = i - 1; m = (t - (cur.t0 - TR / 2)) / TR; }
  if (a !== b) blk = Math.max(1, Math.round(1 + 9 * Math.sin(Math.PI * m)));
  for (const [k, rt] of [[a, rtA], [b, rtB]]) {
    const s = SHOTS[k];
    s.update(t - s.t0, t);
    renderer.setRenderTarget(rt); renderer.render(s.scene, s.camera);
  }
  caption(t);
  for (const k of new Set([a, b])) if (SHOTS[k].overlay) SHOTS[k].overlay(t - SHOTS[k].t0, drawText, a === b ? 1 : (k === b ? m : 1 - m));
  textTex.needsUpdate = true;
  post.uniforms.mixAB.value = a === b ? 0 : THREE.MathUtils.smoothstep(m, 0.25, 0.75);
  post.uniforms.block.value = blk;
  renderer.setRenderTarget(null); renderer.render(postScene, postCam);
};

await loadAll(renderer);
window.READY = true;
