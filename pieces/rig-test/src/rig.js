// =====================================================================
//  rig.js — mesh puppet for ONE character image (like AE Puppet / Spine / Live2D), WebGL2, linear-blend skinning.
//  Data comes from tools/rig_build.py (const RIG_<NAME>): per layer a triangle mesh over the layer's texture, up to 3
//  bone weights per vertex, plus the skeleton (bones from joint to joint in the source image's pixel space).
//
//  const R = Rig.create(RIG_LINK, ASSETS, { prefix: 'link_' });           // once
//  R.draw(glcanvas, pose)                                                   // each frame (stateless: pose -> pixels)
//  pose = { x, y, s, rot,                // where the anchor (feet) lands on screen, scale, lean (deg)
//           anchor: [x, y],              // a point in source pixels (default: between the feet, on the ground)
//           b: { chest: 4, uarmF: -120, ... },     // per-bone rotation in degrees, relative to the rest pose
//           sc: { chest: [1, 1.02] },              // optional per-bone scale (breathing)
//           props: { sword: { parent: 'handB', at: [0.5, 0], rot: -80, slot: 'armB', front: false } } }
//  A prop is a rigid textured quad held by a bone: 'at' = [fraction along the bone, perpendicular offset px],
//  'rot' = angle of the prop's axis (grip -> tip) relative to the bone, drawn just before ('front' false) or after
//  ('front' true) the layer named in 'slot'.
// =====================================================================
const Rig = (() => {
  const VS = `#version 300 es
in vec2 p; in vec2 uv; uniform vec2 res; out vec2 v;
void main(){ v = uv; gl_Position = vec4(p.x / res.x * 2. - 1., 1. - p.y / res.y * 2., 0, 1); }`;
  const FS = `#version 300 es
precision highp float; in vec2 v; uniform sampler2D t; uniform float a; out vec4 o;
void main(){ o = texture(t, v) * a; }`;
  // 2D affine [a, b, c, d, e, f]: x' = a x + c y + e, y' = b x + d y + f
  const mul = (m, n) => [m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1], m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3],
    m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]];
  const inv = (m) => { const D = m[0] * m[3] - m[1] * m[2]; return [m[3] / D, -m[1] / D, -m[2] / D, m[0] / D, (m[2] * m[5] - m[3] * m[4]) / D, (m[1] * m[4] - m[0] * m[5]) / D]; };
  const T = (x, y) => [1, 0, 0, 1, x, y];
  const Rm = (r) => [Math.cos(r), Math.sin(r), -Math.sin(r), Math.cos(r), 0, 0];
  const S = (x, y) => [x, 0, 0, y, 0, 0];
  const D2R = Math.PI / 180;

  function create(data, assets, opt = {}) {
    const prefix = opt.prefix || '';
    const canvas = opt.canvas || document.createElement('canvas');
    const gl = canvas.getContext('webgl2', { premultipliedAlpha: true, preserveDrawingBuffer: true, antialias: true });
    if (!gl) throw new Error('rig.js needs WebGL2');
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    const prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
    const loc = { p: gl.getAttribLocation(prog, 'p'), uv: gl.getAttribLocation(prog, 'uv'), res: gl.getUniformLocation(prog, 'res'), a: gl.getUniformLocation(prog, 'a') };
    const tex = (img) => {
      const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img); gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return t;
    };
    const [IW, IH] = data.size;
    const bones = data.bones.map((b) => ({ ...b }));
    const bi = Object.fromEntries(bones.map((b, i) => [b.name, i]));
    for (const b of bones) {                          // rest frames: origin at the joint, x along the bone
      const h = data.joints[b.head], t = data.joints[b.tail];
      b.len = Math.hypot(t[0] - h[0], t[1] - h[1]);
      b.rest = mul(T(h[0], h[1]), Rm(Math.atan2(t[1] - h[1], t[0] - h[0])));
      b.restInv = inv(b.rest);
    }
    for (const b of bones) b.local = b.parent ? mul(bones[bi[b.parent]].restInv, b.rest) : b.rest;
    const layers = data.layers.map((L) => {
      const n = L.verts.length / 2, k = L.bones.length;
      const uv = new Float32Array(n * 2); for (let i = 0; i < n; i++) { uv[2 * i] = L.verts[2 * i] / IW; uv[2 * i + 1] = L.verts[2 * i + 1] / IH; }
      const vao = gl.createVertexArray(); gl.bindVertexArray(vao);
      const pb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, pb); gl.bufferData(gl.ARRAY_BUFFER, n * 8, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(loc.p); gl.vertexAttribPointer(loc.p, 2, gl.FLOAT, false, 0, 0);
      const ub = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, ub); gl.bufferData(gl.ARRAY_BUFFER, uv, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(loc.uv); gl.vertexAttribPointer(loc.uv, 2, gl.FLOAT, false, 0, 0);
      const ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(L.tris), gl.STATIC_DRAW);
      gl.bindVertexArray(null);
      return { name: L.name, n, k, verts: L.verts, w: L.weights, bidx: L.bones.map((nm) => bi[nm]), vao, pb, count: L.tris.length,
        tex: tex(assets[prefix + L.name + '.png']), out: new Float32Array(n * 2) };
    });
    const li = Object.fromEntries(layers.map((l, i) => [l.name, i]));
    const props = Object.fromEntries((data.props || []).map((p) => {
      const img = assets[p.img]; const vao = gl.createVertexArray(); gl.bindVertexArray(vao);
      const pb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, pb); gl.bufferData(gl.ARRAY_BUFFER, 32, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(loc.p); gl.vertexAttribPointer(loc.p, 2, gl.FLOAT, false, 0, 0);
      const ub = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, ub); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(loc.uv); gl.vertexAttribPointer(loc.uv, 2, gl.FLOAT, false, 0, 0);
      gl.bindVertexArray(null);
      const ax = Math.atan2(p.tip[1] - p.grip[1], p.tip[0] - p.grip[0]);
      return [p.name, { ...p, img, vao, pb, tex: tex(img), base: mul(Rm(-ax), T(-p.grip[0], -p.grip[1])), W: img.naturalWidth, H: img.naturalHeight }];
    }));

    // forward kinematics: pose -> world matrix of every bone (screen space)
    function solve(pose) {
      const an = pose.anchor || data.anchor || [IW / 2, IH];
      const root = mul(mul(mul(T(pose.x || 0, pose.y || 0), Rm((pose.rot || 0) * D2R)), S(pose.s || 1, pose.s || 1)), T(-an[0], -an[1]));
      const Wm = new Array(bones.length);
      bones.forEach((b, i) => {                       // parents are listed before children
        const r = ((pose.b && pose.b[b.name]) || 0) * D2R, sc = (pose.sc && pose.sc[b.name]) || [1, 1];
        const parent = b.parent ? Wm[bi[b.parent]] : root;
        Wm[i] = mul(mul(mul(parent, b.local), Rm(r)), S(sc[0], sc[1]));
      });
      return { Wm, skin: Wm.map((m, i) => mul(m, bones[i].restInv)), root };
    }
    function boneWorld(pose, name) { return solve(pose).Wm[bi[name]]; }

    function draw(pose, opt2 = {}) {
      const w = opt2.width || canvas.width, h = opt2.height || canvas.height;
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      const { Wm, skin, root } = solve(pose);
      gl.viewport(0, 0, w, h); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(prog); gl.uniform2f(loc.res, w, h); gl.uniform1f(loc.a, pose.alpha == null ? 1 : pose.alpha); gl.activeTexture(gl.TEXTURE0);
      const order = data.draw || layers.map((l) => l.name);
      const propAt = {}; for (const [nm, pp] of Object.entries(pose.props || {})) { if (!pp || pp.hide) continue; const key = (pp.front ? '>' : '<') + pp.slot; (propAt[key] = propAt[key] || []).push([nm, pp]); }
      const drawProp = ([nm, pp]) => {
        const P = props[nm], at = pp.at || [0, 0];
        // parent null: 'at' is a point in source pixels of the character's own space (planted in the scene), rot absolute
        const hold = pp.parent ? mul(Wm[bi[pp.parent]], T(at[0] * bones[bi[pp.parent]].len, at[1])) : mul(root, T(at[0], at[1]));
        const m = mul(mul(hold, Rm((pp.rot || 0) * D2R)), mul(S(pp.scale || 1, pp.scale || 1), P.base));
        const q = [[0, 0], [P.W, 0], [0, P.H], [P.W, P.H]].flatMap(([x, y]) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]]);
        gl.bindVertexArray(P.vao); gl.bindBuffer(gl.ARRAY_BUFFER, P.pb); gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(q));
        gl.bindTexture(gl.TEXTURE_2D, P.tex); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      };
      for (const name of order) {
        (propAt['<' + name] || []).forEach(drawProp);
        const L = layers[li[name]]; if (!L || (pose.hide && pose.hide.includes(name))) continue;
        const { verts, w: wt, k, bidx, out } = L;
        for (let i = 0; i < L.n; i++) {                // linear-blend skinning on the CPU (a few hundred vertices)
          const x = verts[2 * i], y = verts[2 * i + 1]; let X = 0, Y = 0;
          for (let j = 0; j < k; j++) { const a = wt[i * k + j]; if (!a) continue; const m = skin[bidx[j]]; X += a * (m[0] * x + m[2] * y + m[4]); Y += a * (m[1] * x + m[3] * y + m[5]); }
          out[2 * i] = X; out[2 * i + 1] = Y;
        }
        gl.bindVertexArray(L.vao); gl.bindBuffer(gl.ARRAY_BUFFER, L.pb); gl.bufferSubData(gl.ARRAY_BUFFER, 0, out);
        gl.bindTexture(gl.TEXTURE_2D, L.tex); gl.drawElements(gl.TRIANGLES, L.count, gl.UNSIGNED_SHORT, 0);
        (propAt['>' + name] || []).forEach(drawProp);
      }
      gl.bindVertexArray(null);
      return canvas;
    }
    // overlay of the skeleton for debugging (2D context, same pose)
    function bonesOverlay(g, pose) {
      const { Wm } = solve(pose); g.save(); g.lineWidth = 3; g.strokeStyle = '#fff'; g.fillStyle = '#ff0';
      bones.forEach((b, i) => { const m = Wm[i]; const x0 = m[4], y0 = m[5], x1 = m[0] * b.len + m[4], y1 = m[1] * b.len + m[5];
        g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.beginPath(); g.arc(x0, y0, 5, 0, 7); g.fill(); });
      g.restore();
    }
    return { canvas, draw, solve, boneWorld, bonesOverlay, bones, layers };
  }
  return { create };
})();
