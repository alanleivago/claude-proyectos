// =====================================================================
//  styles/cartoon3d/color.js — OPT-IN colour design for a cartoon3d piece (2026-11-10, pieces/lost-luggage v5).
//  Measured on the Ricks Clips refs (fuentes/cartoon3d/ricks-color.md): the look is a designed palette per scene, not
//  brightness — warm key / cool shadow, smooth fades (sky, walls, light falloff), saturated mid-tones with desaturated
//  highlights, whites that roll off below 0.95 (papers cream with shading, never clipped), lifted coloured darks
//  (p5 ~0.15), and a very slight wide-angle bulge.
//  Add "styles/cartoon3d/color.js" to the build list after setlook.js / exterior.js. Then:
//    c3ColorWorld(spec.world)      set the world-space fades for the scene about to render (setlook.js patch uniforms)
//    c3Grade(spec.grade)           ONE post pass over the composited frame (before the subtitles, which stay undistorted):
//                                  exposure, split tone, coloured lift, saturation by luminance, filmic shoulder,
//                                  screen fades + a radial light glow, vignette, barrel distortion, dither
//  spec.grade = { expo, lift: '#hex', liftK, shadow: '#hex' (shadow tint), hi: '#hex' (highlight tint), tintK,
//                 sat: [dark, mid, bright], contrast, shoulder: [start, white], top: '#hex', bot: '#hex', fadeK,
//                 glow: [x, y, r, k, '#hex'] (screen units 0..1), vig, barrel }
//  spec.world = { top: '#hex', bot: '#hex', y: [y0, y1], near: '#hex', far: '#hex', c: [x, z], r: [r0, r1], ceil: '#hex' }
//  (colours are multipliers: '#ffffff' = no change)
// =====================================================================
const C3G = {};
const C3_GRADE_DEF = { expo: 1, lift: '#3a3466', liftK: 0.0, shadow: '#ffffff', hi: '#ffffff', tintK: 1, sat: [1, 1, 1], contrast: 1, shoulder: [0.8, 1.0],
  top: '#ffffff', bot: '#ffffff', fadeK: 0, glow: [0.5, 0.2, 0.5, 0, '#ffffff'], vig: 0.18, barrel: 0.12 };
const c3V3c = (hex) => { const c = new THREE.Color(hex); return new THREE.Vector3(c.r, c.g, c.b); };   // raw sRGB triplet (the pass works on canvas values)
function c3Grade(spec = {}) {
  const o = Object.assign({}, C3_GRADE_DEF, spec), { r, cv } = c3Renderer();
  if (!C3G.mat) {
    C3G.tex = new THREE.CanvasTexture(ctx.canvas); C3G.tex.minFilter = C3G.tex.magFilter = THREE.LinearFilter; C3G.tex.generateMipmaps = false;
    C3G.scene = new THREE.Scene(); C3G.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    C3G.mat = new THREE.ShaderMaterial({ depthTest: false, depthWrite: false, toneMapped: false,
      uniforms: { src: { value: C3G.tex }, asp: { value: W / H }, expo: { value: 1 }, lift: { value: new THREE.Vector3() }, liftK: { value: 0 }, sh: { value: new THREE.Vector3(1, 1, 1) }, hi: { value: new THREE.Vector3(1, 1, 1) },
        sat: { value: new THREE.Vector3(1, 1, 1) }, con: { value: 1 }, shoulder: { value: new THREE.Vector2(0.8, 1) }, top: { value: new THREE.Vector3(1, 1, 1) }, bot: { value: new THREE.Vector3(1, 1, 1) }, fadeK: { value: 0 },
        glow: { value: new THREE.Vector4(0.5, 0.2, 0.5, 0) }, glowC: { value: new THREE.Vector3(1, 1, 1) }, vig: { value: 0.2 }, barrel: { value: 0.1 }, seed: { value: 0 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: [
        'uniform sampler2D src; uniform float asp, expo, liftK, con, fadeK, vig, barrel, seed; uniform vec3 lift, sh, hi, sat, top, bot, glowC; uniform vec2 shoulder; uniform vec4 glow; varying vec2 vUv;',
        'vec3 toLin(vec3 c){ return pow(max(c, 0.0), vec3(2.2)); } vec3 toSrgb(vec3 c){ return pow(max(c, 0.0), vec3(1.0 / 2.2)); }',
        'float luma(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }',
        'void main(){',
        // barrel: corners stay on the corners, the centre bulges (straight lines bow outward)
        '  vec2 p = vUv - 0.5; p.x *= asp; float rm = 0.25 * asp * asp + 0.25, r2 = dot(p, p);',
        '  vec2 q = p * (1.0 + barrel * r2) / (1.0 + barrel * rm); q.x /= asp; vec2 uv = q + 0.5;',
        '  vec3 c = texture2D(src, uv).rgb;',
        // exposure + split tone in linear light (tints are luma-normalised so they move hue, not value)
        '  float cmx = max(c.r, max(c.g, c.b)), cs = (cmx - min(c.r, min(c.g, c.b))) / max(cmx, 1e-3), keep = 1.0 - 0.75 * cs;',   // saturated colours keep their hue (a dark red must not turn magenta)
        '  vec3 L = toLin(c) * expo; float Y = luma(L), Yp = pow(Y, 1.0 / 2.2);',
        '  vec3 shN = sh / max(luma(sh), 1e-3), hiN = hi / max(luma(hi), 1e-3);',
        '  L *= mix(vec3(1.0), shN, (1.0 - smoothstep(0.05, 0.5, Yp)) * keep); L *= mix(vec3(1.0), hiN, smoothstep(0.45, 0.95, Yp));',
        '  vec3 s = toSrgb(L);',
        // coloured lift: the darks rise toward the lift colour (Ricks p5 ~0.15, never crushed black)
        '  float d = 1.0 - smoothstep(0.0, 0.55, luma(s)); s += lift * liftK * d * (1.0 - 0.7 * cs);',
        // saturation by luminance: rich mids, softer darks, creamy highlights
        '  float y = luma(s), k = mix(sat.x, sat.y, smoothstep(0.08, 0.4, y)); k = mix(k, sat.z, smoothstep(0.62, 0.95, y)); s = y + (s - y) * k;',
        '  s = (s - 0.45) * con + 0.45;',
        // screen fades (a graduated filter) + a soft radial light glow (screen blend)
        '  s *= mix(vec3(1.0), mix(bot, top, smoothstep(0.0, 1.0, vUv.y)), fadeK);',
        '  vec2 gp = vec2((vUv.x - glow.x) * asp, vUv.y - glow.y); float g = glow.w * exp(-dot(gp, gp) / (glow.z * glow.z)); s = 1.0 - (1.0 - s) * (1.0 - glowC * g);',
        // filmic shoulder per channel: nothing clips (white -> ~0.93), the brightest colours desaturate a little
        '  float a = shoulder.x, w = shoulder.y - a; s = mix(s, a + w * (1.0 - exp(-(s - a) / w)), step(a, s));',
        '  vec2 vp = vec2((vUv.x - 0.5) * asp, vUv.y - 0.52); s *= 1.0 - vig * smoothstep(0.25, 0.85, length(vp) * 1.25);',
        '  float n = fract(sin(dot(gl_FragCoord.xy + seed, vec2(12.9898, 78.233))) * 43758.5453); s += (n - 0.5) / 255.0;',
        '  gl_FragColor = vec4(clamp(s, 0.0, 1.0), 1.0); }'].join('\n') });
    C3G.scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), C3G.mat));
  }
  const U = C3G.mat.uniforms; U.expo.value = o.expo; U.lift.value = c3V3c(o.lift); U.liftK.value = o.liftK;
  const mixW = (hex) => { const v = c3V3c(hex); return new THREE.Vector3(1, 1, 1).lerp(v, o.tintK); };
  U.sh.value = mixW(o.shadow); U.hi.value = mixW(o.hi); U.sat.value.set(...o.sat); U.con.value = o.contrast; U.shoulder.value.set(...o.shoulder);
  U.top.value = c3V3c(o.top); U.bot.value = c3V3c(o.bot); U.fadeK.value = o.fadeK;
  U.glow.value.set(o.glow[0], o.glow[1], o.glow[2], o.glow[3]); U.glowC.value = c3V3c(o.glow[4] ?? '#ffffff'); U.vig.value = o.vig; U.barrel.value = o.barrel; U.seed.value = (typeof F !== 'undefined' ? F : 0) % 97;
  C3G.tex.needsUpdate = true;
  const tm = r.toneMapping; r.toneMapping = THREE.NoToneMapping; r.setRenderTarget(null); r.setClearColor(0x000000, 1); r.clear(); r.render(C3G.scene, C3G.cam); r.toneMapping = tm;
  ctx.save(); screen(); ctx.globalCompositeOperation = 'copy'; ctx.drawImage(cv, 0, 0, W, H); ctx.restore();
}
// world-space fades for the next render (setlook.js material patch): walls fade top->bottom, floors near->far from a
// point (a light pool), ceilings take their own tint. Shared uniforms, so call it before each scene's render.
function c3ColorWorld(o = {}) {
  const U = C3SL_U, set = (k, hex) => U[k].value.copy(c3V3c(hex ?? '#ffffff'));
  set('c3WT', o.top); set('c3WB', o.bot); set('c3FN', o.near); set('c3FF', o.far); set('c3CE', o.ceil ?? o.top);
  U.c3WY.value.set(...(o.y ?? [0, 30])); U.c3FC.value.set(...(o.c ?? [0, 0])); U.c3FR.value.set(...(o.r ?? [10, 80]));
}
