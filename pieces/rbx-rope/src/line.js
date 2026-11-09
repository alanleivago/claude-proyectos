// rbx-rope LINE: stage people along the rope. Each entry gets a station on the rope curve (arclength s), grips it with
// GN.grip (both hands on the rope), and gets its own knot between the hands (+ an optional name tag).
'use strict';
const LINE = { KN: {} };
(function () {
  const T = THREE, V = (x, y, z) => new T.Vector3(x, y, z);
  // entries: [{ name, s, side, face, ground, tag, hands, pose, lean, noKnot }]; add(obj) registers temporary objects
  LINE.stage = function (scene, rope, entries, add, o = {}) {
    const cv = rope.userData.curve, L = rope.userData.len, R = o.R || 0.32, out = []; out.knots = [];
    entries.forEach((e, i) => {
      const u = Math.min(1, Math.max(0, e.s / L)), P = cv.getPointAt(u), D = cv.getTangentAt(u); if (o.flip) D.negate();
      let a; for (const gr of e.grounds || [e.ground ?? (o.ground ? o.ground(P) : 0)]) { a = CAST.put(scene, e.name, { face: e.face, keep: e.keep, pose: e.pose, rope: { P, D, side: e.side ?? (i % 2 ? -1 : 1), ground: gr, lean: e.lean ?? o.lean, hands: e.hands, ropeR: R, reach: e.reach } }); a.ground = gr; if (a.gripOK) break; }
      out.push(a);
      if (!e.noKnot && a.grip) { const hs = Object.values(a.grip.hands), mid = hs.reduce((m, h) => m.add(h), V(0, 0, 0)).multiplyScalar(1 / hs.length);
        // nearest curve param to the hands' midpoint
        let bu = u, bd = 1e9; for (let k = -40; k <= 40; k++) { const uu = u + (k * 0.05) / L; if (uu < 0 || uu > 1) continue; const d = cv.getPointAt(uu).distanceTo(mid); if (d < bd) { bd = d; bu = uu; } }
        if (hs.length === 2) { const tA = [...hs].map((h) => { let b = bu, bb = 1e9; for (let k = -30; k <= 30; k++) { const uu = bu + (k * 0.05) / L; const d = cv.getPointAt(Math.min(1, Math.max(0, uu))).distanceTo(h); if (d < bb) { bb = d; b = uu; } } return b; }); bu = (tA[0] + tA[1]) / 2; }
        else bu += ((o.flip ? 1 : -1) * 0.7) / L;
        const kk = rope.uuid + '|' + bu.toFixed(5) + '|' + (e.tag || ''); LINE.KN[kk] = LINE.KN[kk] || ROPE.knot(cv, Math.min(1, Math.max(0, bu)), R, { tag: e.tag }); out.knots.push(add(LINE.KN[kk])); }
    });
    return out;
  };
  // deep-clone a block of staged actors (and nothing else) shifted by `off`, n times: cheap copy-paste crowds for the distance
  LINE.repeat = function (objs, off, n, add) {
    for (let k = 1; k <= n; k++) objs.forEach((a) => { const c = (a.root || a).clone(); c.position.add(off.clone().multiplyScalar(k)); add(c); });
  };
})();
