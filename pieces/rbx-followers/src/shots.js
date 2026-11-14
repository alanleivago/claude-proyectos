// rbx-followers shot list + staging. Each row: [first words (matched in order in words.json), set, what we see, stage(s, u, sh)].
// stage places the cast/props and returns the camera { p, l, fov (pre-WIDEN), f, roll, grade, lead, faces, talk, post }.
// SHOTLIST (rows without the fn) feeds ENG.timeShots; STAGEI[i] is the stage of row i (rows may repeat words, e.g. "Squeak").
'use strict';
const STAGES = {};
let SHOTLIST, STAGEI;
(function () {
  const T = THREE, PI = Math.PI, V = (x, y, z) => new T.Vector3(x, y, z), L = (a, b, u) => (Array.isArray(a) ? ENG.lerp(a, b, u) : a + (b - a) * u);
  const put = (s, n, o) => CAST.put(s.scene, n, o);
  const cnt = (n, t, o) => FOL.counter(CAST.get(n), t, o);
  const head = (n) => { const a = CAST.get(n); a.root.updateMatrixWorld(true); return a.head.getWorldPosition(V(0, 0, 0)); };
  const cam = (p, l, fov, o = {}) => Object.assign({ p: p.toArray ? p.toArray() : p, l: l.toArray ? l.toArray() : l, fov }, o);
  const off = (v, x, y, z) => V(v.x + x, v.y + y, v.z + z);
  const tOf = (sh, u) => sh.t0 + u * (sh.t1 - sh.t0);
  const crowd = (s, key, o) => FOL.crowd(s.scene, (x) => ENG.add(s.scene, x), Object.assign({ key }, o));
  const prop = (s, fn, args, pos, ry = 0, sc = 1) => ENG.prop(s, fn, args, pos, ry, sc);
  const hold = (n, obj, arm = 'R', o = [0, -2.0, 0.4]) => { const a = CAST.get(n), A = arm === 'R' ? a.armR : a.armL; A.inner.add(obj); obj.position.set(...o); obj.rotation.set(0, 0, 0); return obj; };
  const faceTo = (n, x, z) => { const a = CAST.get(n), p = a.root.position; a.root.rotation.y = Math.atan2(x - p.x, z - p.z); };
  const W = CAST.POSE.walk(0), SW = 0.25;   // walk pose; sidewalk height
  // a walker on the -x sidewalk going +z (hero, Dad 3 steps behind = 4.4 units)
  const walker = (s, n, z, sh, u, o = {}) => { const zz = z + (o.v ?? 2.2) * (tOf(sh, u) - sh.t0); put(s, n, { p: [o.x ?? -8.6, o.y ?? SW, zz], ry: o.ry ?? 0, face: o.face, keep: !!o.face, pose: W }); return zz; };
  // a line of followers behind someone (clones, cached): along -z from (x, z) with the given gap, facing +z
  const line = (s, key, x, z, n, gap = 3.2, o = {}) => crowd(s, key, { x0: x, x1: x + 0.01, z0: z - n * gap, z1: z - gap, gap, face: [x, z + 400], focus: [x, z], nearR: 999, max: n, seed: o.seed || key.length * 7, y: () => o.y ?? SW });
  // the street packed for the "street full" act (cached): everybody faces the hero's porch
  const fullStreet = (s, key = 'full') => { const z0 = s.HZ; return crowd(s, key, { x0: -15, x1: 15, z0: z0 - 90, z1: z0 + 90, gap: 2.4, face: [16, z0], focus: [16, z0], nearR: 34, max: 150, seed: 11,
    y: (x) => (Math.abs(x) > 7.1 && Math.abs(x) < 10 ? SW : 0), skip: (x, z) => (x > 9.5 && Math.abs(z - z0) < 6) || (x > 12.5 && Math.abs(z - z0) < 9) }); };
  // the crowd marching along the street behind the hero (cached group, slid along +z with the shot time)
  const march = (s, z, sh, u, key = 'march') => { const g = crowd(s, key, { x0: -14, x1: 14, z0: -150, z1: -4, gap: 2.4, face: [0, 400], focus: [0, -4], nearR: 26, max: 120, seed: 13, y: (x) => (Math.abs(x) > 7.1 && Math.abs(x) < 10 ? SW : 0) }); g.position.z = z; return g; };
  const bridgeCrowd = (s, key = 'bridge') => crowd(s, key, { x0: -8.2, x1: 8.2, z0: 4.5, z1: 330, gap: 2.3, face: [0, 0], focus: [0, 0], nearR: 26, max: 110, seed: 31 });
  const subwayCrowd = (s) => crowd(s, 'subway', { x0: -5, x1: 5, z0: -84, z1: 0.0, gap: 2.0, face: [0.6, 3.0], focus: [0.6, 3.0], nearR: 46, max: 130, seed: 21 });
  const classCrowd = (s) => crowd(s, 'class', { x0: -12, x1: 12, z0: -4, z1: 11, gap: 2.2, face: [0, -11], focus: [0, -2], nearR: 60, max: 120, seed: 51, skip: (x, z) => Math.abs(x - 2) < 1.6 && Math.abs(z + 1) < 1.6 });
  const R = [];
  const row = (w, set, d, fn) => R.push([w, set, d, fn]);
  // ======================= THE TOWN =======================
  row('In this town', 'street', 'aerial: people walk the street, each with a line of followers', (s, u, sh) => { line(s, 'a1', -8.6, 30, 6); line(s, 'a2', 8.6, 10, 9, 3.2, { seed: 5 }); line(s, 'a3', -2.5, -5, 14, 3, { seed: 9, y: 0 }); line(s, 'a4', 3, 40, 4, 3.2, { seed: 15, y: 0 });
    return cam(L([22, 40, 70], [20, 36, 62], u), [0, 0, 10], 40, { talk: false, post: { aperture: 0 } }); });
  row('everyone has followers', 'street', 'a lady with a counter, her line behind her', (s, u, sh) => { const z = walker(s, 'date', 20, sh, u, { face: 'F6' }); cnt('date', '12'); line(s, 'b1', -8.6, z, 12, 3.4);
    const h = head('date'); return cam(off(h, 3.2, 0.6, 7), off(h, -0.4, 0.4, -4), 38, { talk: false, f: h.toArray() }); });
  row('And they really do', 'street', 'low: a parade of feet stepping in sync behind her', (s, u, sh) => { const z = walker(s, 'date', 20, sh, u, { face: 'F6' }); line(s, 'b1', -8.6, z, 12, 3.4);
    return cam([-4.8, 1.3, z - 1], [-8.6, 0.8, z - 14], 36, { talk: false, f: [-8.6, 1, z - 5] }); });
  row('Every follower is a', 'street', 'the followers: different real people in a row, looking ahead', (s, u, sh) => { const z = walker(s, 'date', 20, sh, u, { face: 'F6' }); line(s, 'b1', -8.6, z, 12, 3.4);
    return cam([-3.5, 5, z - 8 + 2 * u], [-8.6, 4.2, z - 12], 36, { talk: false, roll: -8 }); });
  row('walking right behind you', 'street', 'over the follower\'s shoulder: the back of her head, inches away', (s, u, sh) => { const z = walker(s, 'date', 20, sh, u, { face: 'F6' }); cnt('date', '12'); line(s, 'b1', -8.6, z, 12, 3.4);
    return cam([-6.4, 7.6, z - 7.8], [-8.6, 4.8, z + 2], 40, { talk: false }); });
  row('wherever you go', 'street', 'wide: the line snakes after her across the street', (s, u, sh) => { const z = walker(s, 'date', 0, sh, u, { face: 'F6' }); line(s, 'b1', -8.6, z, 12, 3.4);
    return cam([14, 14, z + 22], [-6, 2, z - 14], 40, { talk: false }); });
  row("There's only one way", 'street', 'a moustache man walks, his counter says 4', (s, u, sh) => { const z = walker(s, 'crowd8', 20, sh, u); cnt('crowd8', '4'); line(s, 'c1', -8.6, z, 4, 3.4);
    const h = head('crowd8'); return cam(off(h, 2.5, 0.2, 6), off(h, -0.3, 0, -3), 36, { lead: 'crowd8', f: h.toArray() }); });
  row('Turn around and look', 'street', 'he turns around and stares into a follower\'s eyes', (s, u, sh) => { put(s, 'crowd8', { p: [-8.6, SW, 30], ry: PI, face: 'F11', keep: true, pose: CAST.POSE.point }); cnt('crowd8', '4'); put(s, 'crowd5', { p: [-8.6, SW, 26.6], ry: 0, face: 'F7', keep: true });
    const h = head('crowd8'); return cam(off(h, 4.5, 0.2, -1.8), off(h, -0.6, -0.4, -1.6), 34, { lead: 'crowd8', talk: false, f: h.toArray() }); });
  row('and they stop following', 'street', 'the follower freezes: shock face', (s, u, sh) => { put(s, 'crowd8', { p: [-8.6, SW, 30], ry: PI, face: 'F11', keep: true }); cnt('crowd8', '3'); put(s, 'crowd5', { p: [-8.6, SW, 26.6], ry: 0, face: 'F7', keep: true, pose: CAST.POSE.handsHead });
    const h = head('crowd5'); return cam(off(h, 2.6, 0.3, 5.4), off(h, 0, -0.3, 0), 32, { lead: 'crowd5', talk: false, f: h.toArray() }); });
  row('Forever', 'street', 'the ex-follower walks off the other way, sad', (s, u, sh) => { put(s, 'crowd5', { p: [-8.6, SW, L(25, 22, u)], ry: PI, face: 'F9', keep: true, pose: W }); put(s, 'crowd8', { p: [-8.6, SW, 31], ry: PI, face: 'F8', keep: true }); cnt('crowd8', '3');
    return cam([-3, 3.4, 16], [-8.6, 3.2, 27], 36, { talk: false, roll: 6 }); });
  row("That's why famous people", 'bridge', 'the pop star strides, sunglasses on, never turning', (s, u, sh) => { s.mood('dawn'); put(s, 'popstar', { p: [0, 0, L(0, -2, u)], ry: PI, face: 'F3', keep: true, pose: W }); cnt('popstar', '90,000,000', { k: 0.45 }); bridgeCrowd(s);
    const h = head('popstar'); return cam(off(h, -1.0, 0.8, -8.5), off(h, 0, 1.0, 2), 36, { grade: 'morning', lead: 'popstar', talk: false }); });
  row('A pop star with', 'bridge', 'her counter: 90,000,000, the crowd to the horizon behind', (s, u, sh) => { s.mood('dawn'); put(s, 'popstar', { p: [0, 0, L(0, -2, u)], ry: PI, face: 'F6', keep: true, pose: W }); cnt('popstar', '90,000,000', { k: 1.1 }); bridgeCrowd(s);
    return cam([1.4, 12, -14], [0, 3, 34], 40, { grade: 'morning', talk: false, post: { aperture: 0.25 } }); });
  row('took four years to', 'bridge', 'aerial: the line runs over the bridge, the hills, out of sight', (s, u, sh) => { s.mood('dawn'); put(s, 'popstar', { p: [0, 0, 0], ry: PI, face: 'F6', keep: true, pose: W }); bridgeCrowd(s);
    return cam(L([60, 70, -60], [56, 76, -50], u), [0, 0, 80], 40, { grade: 'morning', talk: false, post: { aperture: 0 } }); });
  const dateScene = (s, f1, f2) => { prop(s, 'table', [], [-13, 0, -30], PI / 2); put(s, 'date', { p: [-13, -1.4 * 1, -32.6], ry: 0, face: f1, keep: true, pose: CAST.POSE.sit }); put(s, 'crowd3', { p: [-13, -1.4, -27.4], ry: PI, face: f2, keep: true, pose: CAST.POSE.sit });
    crowd(s, 'datecrowd', { x0: -19, x1: -5, z0: -42, z1: -18, gap: 2.3, face: [-13, -30], focus: [-13, -30], nearR: 20, max: 60, seed: 61, skip: (x, z) => Math.abs(x + 13) < 3.2 && Math.abs(z + 30) < 5.2 }); };
  row('First dates are crowded', 'street', 'a candle-lit date table on a lawn; the couple, nervous', (s, u, sh) => { dateScene(s, 'F5', 'F8'); return cam([-2, 10, -22], [-13, 3, -30], 38, { lead: 'date', talk: false }); });
  row('You bring everyone', 'street', 'pull out: hundreds of followers crammed around the table', (s, u, sh) => { dateScene(s, 'F8', 'F8'); return cam(L([6, 16, -16], [8, 20, -12], u), [-13, 2, -30], 40, { talk: false }); });
  row('And when a cat', 'bridge', 'a tiny orange cat walks the bridge, counter 40,000,000', (s, u, sh) => { s.mood('dawn'); const c = prop(s, 'cat', [], [0, 0, L(0, -1.5, u)], PI); bridgeCrowd(s); return cam([2.4, 2.4, -7], [0, 2, 0], 34, { grade: 'morning', talk: false, f: [0, 2, 0] }); });
  row('the highway closes for', 'bridge', 'aerial: the whole bridge jammed behind one cat', (s, u, sh) => { s.mood('dawn'); prop(s, 'cat', [], [0, 0, 0], PI); bridgeCrowd(s); return cam(L([-30, 50, -30], [-28, 56, -26], u), [0, 0, 40], 40, { grade: 'morning', talk: false, post: { aperture: 0 } }); });
  // ======================= THE HERO =======================
  const heroWalk = (s, sh, u, face = 'F1', z0 = -20, c = '1', gap = 4.4) => { const z = walker(s, 'hero', z0, sh, u, { face }); cnt('hero', c); walker(s, 'dad', z0 - gap, sh, u, { face: 'F2' }); return z; };
  row("I've had one follower", 'street', 'the hero walks to school, counter "1"', (s, u, sh) => { const z = heroWalk(s, sh, u); const h = head('hero'); return cam([-8.4, 2.4, z + 10.5], off(h, 0, 0.2, 0), 46, { lead: 'hero', f: h.toArray() }); });
  row('Just one', 'street', 'close: the "1" over his hair', (s, u, sh) => { const z = heroWalk(s, sh, u, 'F3'); const h = head('hero'); return cam([-8.5, 3.6, z + 7], off(h, 0, 1.6, 0), 34, { lead: 'hero', talk: false, f: h.toArray() }); });
  row("I've never seen who", 'street', 'his face, eyes front, calm', (s, u, sh) => { const z = heroWalk(s, sh, u, 'F1'); const h = head('hero'); return cam([-8.45, 4.2, z + 5], h, 30, { lead: 'hero', f: h.toArray() }); });
  row('I never look back', 'street', 'side view: he walks, chin up; behind him only blur', (s, u, sh) => { const z = heroWalk(s, sh, u, 'F3'); const h = head('hero'); return cam([-4.6, 4.4, z + 3.4], off(h, 0, -0.2, 0.6), 34, { lead: 'hero', f: h.toArray(), post: { aperture: 1.6 } }); });
  row('But I know the', 'street', 'low behind: his sneakers, and three steps back, two feet', (s, u, sh) => { const z = heroWalk(s, sh, u, 'F1'); return cam([-5.4, 1.7, z - 1.0], [-8.4, 0.4, z - 4.4], 30, { talk: false, f: [-8.4, 0.3, z - 4.4], post: { aperture: 1.2 } }); });
  const shoe = (s, sh, u, set) => { if (set === 'bridge') { s.mood('dusk'); put(s, 'dad', { p: [0, 0, 2.8], ry: PI, face: 'F2', keep: true, pose: W }); bridgeCrowd(s); const pl = new THREE.PointLight('#ffd8b0', 60, 9, 2); pl.position.set(-1.8, 1.4, 1.0); ENG.add(s.scene, pl); return cam([-2.6, 1.6, 0.2], [-0.6, 0.4, 2.8], 30, { grade: 'sunset', talk: false, f: [-0.6, 0.4, 2.8], post: { aperture: 1.2, exposure: 1.4 } }); }
    const z = heroWalk(s, sh, u, 'F1'); return cam([-5.2, 2.4, z - 1.6], [-8.6, 0.4, z - 4.4], 40, { talk: false, f: [-8.2, 0.35, z - 4.4], post: { aperture: 1.6 } }); };
  row('Squeak', 'street', 'extreme close: the old taped shoe hits the pavement', (s, u, sh) => shoe(s, sh, u, 'street'));
  row('Step', 'street', 'his white sneaker steps', (s, u, sh) => { const z = heroWalk(s, sh, u); return cam([-7.0, 0.7, z + 2.2], [-8.6, 0.35, z], 26, { talk: false, f: [-8.4, 0.35, z] }); });
  row('Squeak', 'street', 'the old shoe again, sole flapping', (s, u, sh) => shoe(s, sh, u, 'street'));
  row('One of their shoes', 'street', 'mid shot from behind, low: the mismatched feet, blurred legs', (s, u, sh) => { const z = heroWalk(s, sh, u); return cam([-11.8, 1.6, z - 1.6], [-8.6, 0.4, z - 4.4], 30, { talk: false, f: [-8.6, 0.3, z - 4.4], roll: 8 }); });
  // ======================= KITCHEN =======================
  row('My dad works nights', 'kitchen', 'night: the kitchen, a hi-vis vest on the chair, the hero alone', (s, u, sh) => { const F = s.fridge; put(s, 'hero', { p: [2.5, 0, 6.5], ry: PI - 0.4, face: 'F1', keep: true }); cnt('hero', '1', { y: 7.6 });
    return cam([7.5, 7.5, 6.8], [-2, 3.5, -4], 46, { grade: 'night', lead: 'hero', post: { exposure: 1.2 } }); });
  row("He's never home when", 'kitchen', 'the hero eats cereal alone at the table, the empty chair', (s, u, sh) => { put(s, 'hero', { p: [3.0, -1.45 * 0.9, 5.8], ry: PI, face: 'F9', keep: true, pose: CAST.POSE.sit }); const h = head('hero');
    return cam(off(h, -3, 0.6, -5.4), off(h, 0.5, -0.4, 0), 34, { grade: 'night', lead: 'hero', post: { exposure: 1.25 } }); });
  row('He leaves me notes', 'kitchen', 'the fridge door covered in notes', (s, u, sh) => { const F = s.fridge; return cam([F.x + 2.8, 6.4, F.z + L(7.5, 6.6, u)], [F.x, 5.8, F.z], 40, { grade: 'night', talk: false, f: [F.x, 6, F.z], post: { exposure: 1.25 } }); });
  row('and every note ends', 'kitchen', 'slide across the old notes: "Don\'t look back, kiddo..."', (s, u, sh) => { const F = s.fridge; const x = L(F.x - 0.7, F.x + 0.6, u); return cam([x + 0.4, 5.8, F.z + 2.6], [x, 5.6, F.z], 34, { grade: 'night', talk: false, f: [x, 5.6, F.z], post: { exposure: 1.3 } }); });
  row("Don't look back kiddo", 'kitchen', 'close: today\'s note', (s, u, sh) => { const F = s.fridge; return cam([F.x + 0.5, 6.0, F.z + L(2.8, 2.4, u)], [F.x - 0.05, 5.55, F.z], 34, { grade: 'night', talk: false, f: [F.x, 6.05, F.z], post: { exposure: 1.3 } }); });
  row("Whatever's behind you", 'kitchen', 'the hero reads it, a small smile', (s, u, sh) => { const F = s.fridge; put(s, 'hero', { p: [F.x + 2.3, 0, F.z + 2.2], ry: Math.atan2(-2.3, -2.2), face: 'F5', keep: true }); const h = head('hero');
    return cam(off(h, -1.5, 0.3, -1.4), h, 34, { grade: 'night', lead: 'hero', talk: false, post: { exposure: 1.25 } }); });
  // ======================= THE MALL FOUNTAIN =======================
  const fountain = (s) => { prop(s, 'banner', ['CITY MALL', 16, '#f6efe0', '#2F7BF5', '#E0101A'], [-18, 0, 47], 0.5 + Math.PI); return prop(s, 'fountain', [], [-16, 0, 40]); };
  row('Then one day I', 'street', 'the hero at the plaza fountain, counter 1, a few people around', (s, u, sh) => { fountain(s); put(s, 'hero', { p: [-10, SW, L(34, 36, u)], ry: -0.6, face: 'F1', keep: true, pose: W }); cnt('hero', '1'); put(s, 'crowd12', { p: [-22, 0, 33], ry: 0.8, face: 'F6', keep: true });
    return cam([-2, 5, 26], [-13, 3, 40], 40, { talk: false }); });
  row('slipped and fell into', 'street', 'he slips backwards into the fountain: SPLASH', (s, u, sh) => { fountain(s); const a = put(s, 'hero', { p: [-12.2, 1.6 - u * 1.4, 37], ry: -0.6, face: 'F12', keep: true, pose: { armL: [-2.8, 0, 0.6], armR: [-2.8, 0, -0.6], legL: [-1.2, 0, 0], legR: [-0.9, 0, 0], body: [0.6 * u + 0.4, 0, 0] } }); cnt('hero', '1');
    prop(s, 'splash', [], [-12.4, 1.2, 37.6], 0, 0.55 + 0.35 * u); return cam([-6, 3.4, 31], [-12.2, 2.4, 37], 36, { talk: false, roll: -12 }); });
  row('Somebody filmed it', 'street', 'a bystander films on her phone, laughing', (s, u, sh) => { fountain(s); put(s, 'crowd12', { p: [-6, SW, 34], ry: -0.9, face: 'F5', keep: true, pose: { armR: [-1.6, 0, 0.3] } }); hold('crowd12', prop(s, 'phone', ['REC'], [0, 0, 0]), 'R', [0, -2.1, 0.5]);
    const h = head('crowd12'); return cam(off(h, -3.1, 0.2, 2.5), off(h, 0.4, -0.4, 0), 34, { lead: 'crowd12', talk: false }); });
  row('By lunch it had', 'street', 'her phone in her hand: 3,000,000 views', (s, u, sh) => { put(s, 'crowd12', { p: [0, SW, 60], ry: PI, face: 'F5', keep: true, pose: { armR: [-1.5, 0, 0.25] } }); hold('crowd12', prop(s, 'phone', ['3,000,000'], [0, 0, 0]), 'R', [0, -2.1, 0.5]).rotation.set(-1.5, 0, Math.PI); const a = CAST.get('crowd12'); a.root.updateMatrixWorld(true); const p = a.armR.inner.localToWorld(V(0, -2.1, 0.5));
    return cam(off(p, 0.4, 1.1, L(3.2, 2.8, u)), off(p, 0, -0.45, 0), 34, { talk: false, f: p.toArray(), post: { aperture: 1.4 } }); });
  // ======================= THE STREET IS FULL =======================
  const door = (s) => { s.house.visible = false; return s.HZ; };
  row('The next morning I', 'street', 'morning: the hero steps onto his porch', (s, u, sh) => { const z0 = door(s); put(s, 'hero', { p: [L(16.6, 15.6, u), 0.5, z0 + 0.6], ry: -PI / 2, face: 'F1', keep: true, pose: W }); cnt('hero', '1');
    const h = head('hero'); return cam(off(h, -5, -0.6, 2.6), off(h, 0, -0.2, 0), 36, { grade: 'morning', lead: 'hero', talk: false }); });
  row('and the whole street', 'street', 'over his shoulder: the street packed with people, all staring', (s, u, sh) => { const z0 = door(s); put(s, 'hero', { p: [15.2, 0.5, z0 + 0.9], ry: -PI / 2 - 0.12, face: 'F7', keep: true }); fullStreet(s);
    return cam([19.6, L(9.2, 10, u), z0 + 0.2], [-4, 1.2, z0 - 1.5], 44, { grade: 'morning', talk: false, post: { aperture: 0.45 } }); });
  row('Three million and one', 'street', 'reverse: his shocked face, counter 3,000,001', (s, u, sh) => { const z0 = door(s); put(s, 'hero', { p: [15.2, 0.5, z0 + 0.9], ry: -PI / 2, face: 'F7', keep: true }); cnt('hero', '3,000,001', { k: 0.42 }); fullStreet(s);
    const h = head('hero'); return cam(off(h, -8.5, 1.4, -0.2), off(h, 0, 1.6, 0), 36, { grade: 'morning', lead: 'hero', talk: false }); });
  row('All waiting for me', 'street', 'the front rows: every face stares at him', (s, u, sh) => { const z0 = door(s); fullStreet(s); return cam([14.5, 5.4, z0 + 4], [4, 4.0, z0 - 2], 38, { grade: 'morning', talk: false, roll: -6 }); });
  row('I walked to school', 'street', 'the hero walks; the whole street walks behind him', (s, u, sh) => { const z = walker(s, 'hero', 0, sh, u, { x: 0, y: 0, face: 'F8' }); cnt('hero', '3,000,001', { k: 0.8 }); march(s, z - 1, sh, u); const h = head('hero');
    return cam([1.5, 3.4, z + 10], off(h, 0, 0.4, 0), 40, { lead: 'hero' }); });
  row('They walked to school', 'street', 'aerial: a river of people fills the street', (s, u, sh) => { const z = walker(s, 'hero', 0, sh, u, { x: 0, y: 0, face: 'F8' }); cnt('hero', '3,000,001'); march(s, z - 1, sh, u);
    return cam([18, 34, z + 26], [0, 0, z - 20], 40, { talk: false, post: { aperture: 0 } }); });
  row('They followed me into', 'classroom', 'math class: the room packed, people on desks, in the doorway', (s, u, sh) => { put(s, 'hero', { p: [2, 0, -1], ry: PI, face: 'F8', keep: true }); put(s, 'teacher', { p: [-3, 0, -9], ry: 0.2, face: 'F7', keep: true }); classCrowd(s);
    return cam([10, 9, 11], [-1, 3, -6], 44, { talk: false }); });
  row('The teacher gave up', 'classroom', 'the teacher, defeated, points at the board for everyone', (s, u, sh) => { put(s, 'teacher', { p: [-3, 0, -9], ry: 0.3, face: 'F8', keep: true, pose: { armR: [-2.4, 0, -0.5] } }); classCrowd(s); const h = head('teacher');
    return cam(off(h, 3, 2.4, 7.5), h, 36, { lead: 'teacher' }); });
  row('If I stopped they', 'street', 'he stops; the front row bumps into his back', (s, u, sh) => { put(s, 'hero', { p: [0, 0, 40], ry: 0, face: 'F12', keep: true, pose: { body: [0.25 * Math.max(0, Math.sin(u * PI)), 0, 0] } }); cnt('hero', '3,000,001', { k: 0.8 }); march(s, 38.6 + 0.6 * u, sh, u);
    const h = head('hero'); return cam(off(h, 4.8, 0.4, 4), off(h, -0.6, -0.6, -1.5), 36, { lead: 'hero', talk: false, roll: 8 }); });
  row('If I turned left', 'street', 'top-down: the whole crowd bends left behind him', (s, u, sh) => { put(s, 'hero', { p: [L(0, -8, u), 0, 40], ry: L(0, -PI / 2, u), face: 'F8', keep: true, pose: W }); march(s, 38.5, sh, u);
    return cam([0.01, 60, 30], [0, 0, 28], 40, { talk: false, post: { aperture: 0 } }); });
  row("I couldn't even go", 'street', 'his house: the porch buried in people', (s, u, sh) => { const z0 = s.HZ; fullStreet(s); crowd(s, 'lawn', { x0: 11, x1: 17, z0: z0 - 30, z1: z0 + 30, gap: 2.2, face: [0, z0], focus: [14, z0], nearR: 18, max: 50, seed: 71, y: (x) => (x > 14.6 && Math.abs(0) < 1 ? 0.5 : 0) });
    return cam([-2, 12, z0 + 26], [20, 4, z0], 40, { grade: 'morning', talk: false }); });
  row('There was no room', 'street', 'aerial: only the roof of his house pokes out of the crowd', (s, u, sh) => { const z0 = s.HZ; fullStreet(s); crowd(s, 'lawn', { x0: 11, x1: 17, z0: z0 - 30, z1: z0 + 30, gap: 2.2, face: [0, z0], focus: [14, z0], nearR: 18, max: 50, seed: 71 });
    return cam(L([40, 60, z0 + 40], [36, 66, z0 + 34], u), [10, 0, z0], 40, { grade: 'morning', talk: false, post: { aperture: 0 } }); });
  row('So I tried to', 'street', 'the hero, determined (strain face)', (s, u, sh) => { put(s, 'hero', { p: [0, 0, 40], ry: 0, face: 'F14', keep: true, pose: CAST.POSE.crossed }); cnt('hero', '3,000,001', { k: 0.8 }); march(s, 38.5, sh, u);
    const h = head('hero'); return cam(off(h, 0.8, -0.6, 4.4), off(h, 0, 0.4, 0), 30, { lead: 'hero', talk: false, roll: -8 }); });
  // ======================= SUBWAY / MEGAPHONE =======================
  row('I jumped on the', 'subway', 'he leaps into the empty car', (s, u, sh) => { put(s, 'hero', { p: [0.6, 1.4 * Math.sin(u * PI), L(-6, 2, u)], ry: 0.1, face: 'F14', keep: true, pose: { armL: [-2.6, 0, 0.4], armR: [-2.6, 0, -0.4], legL: [-0.9, 0, 0], legR: [0.5, 0, 0] } });
    return cam([-2, 6, 7.5], [0.4, 3, -8], 44, { talk: false }); });
  row('Three million people got', 'subway', 'the car fills behind him, faces pressed everywhere', (s, u, sh) => { put(s, 'hero', { p: [0.6, 0, 3.0], ry: 0.25, face: 'F8', keep: true, pose: { armL: [-2.6, 0, 0.5], armR: [-0.5, 0, -0.7] } }); subwayCrowd(s);
    return cam([-0.9, 6.2, 7.5], [0.3, 4.0, -10], 44, { lead: 'hero', talk: false, post: { aperture: 0.4 } }); });
  row('I grabbed a megaphone', 'street', 'on a mailbox, the hero raises a yellow megaphone', (s, u, sh) => { put(s, 'hero', { p: [0, 1.2, 40], ry: PI, face: 'F14', keep: true, pose: { armR: [-1.7, 0, 0.1] } }); hold('hero', prop(s, 'megaphone', [], [0, 0, 0]), 'R', [0, -2.0, 0.3]); march(s, 36, sh, u);
    const h = head('hero'); return cam(off(h, -3, -1.4, -5.2), off(h, 0.4, 0.2, 0), 36, { lead: 'hero', talk: false }); });
  row('Unfollow', 'street', 'close: mega scream into the megaphone', (s, u, sh) => { put(s, 'hero', { p: [0, 1.2, 40], ry: PI, face: 'F12', keep: true, pose: { armR: [-1.7, 0, 0.1] } }); hold('hero', prop(s, 'megaphone', [], [0, 0, 0]), 'R', [0, -2.0, 0.3]); march(s, 36, sh, u);
    const h = head('hero'); return cam(off(h, -1.4, 0.0, -3.6), h, 28, { lead: 'hero', talk: false, roll: 10 }); });
  row('Nobody left', 'street', 'reverse: thousands of blank stares', (s, u, sh) => { march(s, 36, sh, u); return cam([0, 6.4, 39], [0, 4.0, 20], 40, { talk: false }); });
  // ======================= THREE DAYS / THE BRIDGE =======================
  const bh = (s, face, o = {}) => { s.mood(o.mood || 'dusk'); put(s, 'hero', { p: [o.x ?? 0, 0, o.z ?? 0], ry: o.ry ?? PI, face, keep: true, pose: o.pose }); if (o.c !== false) cnt('hero', o.c || '3,000,001', { k: o.k || 0.9 }); if (o.crowd !== false) bridgeCrowd(s); return head('hero'); };
  row('Three days', 'bridge', 'dusk: the hero trudges over the bridge, the crowd behind', (s, u, sh) => { bh(s, 'F9', { pose: W, z: L(2, 0, u) }); return cam([6, 5, -12], [0, 4, 8], 40, { grade: 'sunset', lead: 'hero', talk: false }); });
  row('No sleep', 'bridge', 'close: bags under his eyes', (s, u, sh) => { const h = bh(s, 'F9'); return cam(off(h, 0.6, 0.1, -3.6), h, 28, { grade: 'sunset', lead: 'hero', talk: false }); });
  row('No home', 'bridge', 'wide: tiny hero, endless crowd, the city lights coming on', (s, u, sh) => { bh(s, 'F9', { k: 1.2 }); return cam(L([-14, 30, -30], [-12, 34, -26], u), [0, 0, 40], 40, { grade: 'sunset', talk: false, post: { aperture: 0 } }); });
  row('And somewhere in all', 'bridge', 'the noise: front rows yelling and waving', (s, u, sh) => { bh(s, 'F10', { c: false }); return cam([1, 5, 2], [0, 4, 14], 40, { grade: 'sunset', talk: false, roll: -10 }); });
  row("I couldn't hear the", 'bridge', 'low: a forest of feet; no squeak anywhere', (s, u, sh) => { bh(s, 'F10', { c: false, pose: W }); return cam([2, 4.6, 1], [0, 4, 14], 40, { grade: 'sunset', talk: false, roll: 9 }); });
  row('There was only one', 'bridge', 'the hero, close, thinking', (s, u, sh) => { const h = bh(s, 'F10'); return cam(off(h, -1.4, 0.3, -3.8), off(h, 0.3, 0, 0), 30, { grade: 'sunset', lead: 'hero' }); });
  row('I had to turn', 'bridge', 'over the shoulder: the wall of people behind him', (s, u, sh) => { const h = bh(s, 'F10', { c: false }); return cam(off(h, 1.4, 0.4, -2.6), off(h, -1, -0.5, 10), 40, { grade: 'sunset', talk: false }); });
  row('But if I turned', 'bridge', 'low angle, dutch: the hero, eyes wet', (s, u, sh) => { const h = bh(s, 'F9'); return cam(off(h, 2.4, -2.6, -4.2), off(h, -0.4, 0.8, 1), 40, { grade: 'sunset', lead: 'hero', roll: -14 }); });
  row('Even the one who\'d', 'bridge', 'closer: he holds his breath', (s, u, sh) => { const h = bh(s, 'F9'); return cam(off(h, 1.6, 0.4, -3.6), off(h, -0.2, 0.1, 0), 30, { grade: 'sunset', lead: 'hero', talk: false }); });
  row('I stopped in the', 'bridge', 'high wide: he stops dead in the middle of the bridge', (s, u, sh) => { bh(s, 'F10', { k: 1.2 }); return cam([1.4, L(14, 15, u), -12], [0, 1, 12], 40, { grade: 'sunset', talk: false, post: { aperture: 0.25 } }); });
  row('with three million strangers', 'bridge', 'the front row looms right behind his back', (s, u, sh) => { const h = bh(s, 'F8'); return cam(off(h, 3.5, 0.6, -3.5), off(h, -0.5, 0, 2.5), 36, { grade: 'sunset', lead: 'hero', talk: false, roll: 8 }); });
  row('My legs were shaking', 'bridge', 'low: his knees trembling', (s, u, sh) => { bh(s, 'F8', { c: false, pose: { legL: [0.06 * Math.sin(u * 60), 0, 0.05], legR: [-0.06 * Math.sin(u * 60), 0, -0.05] } }); return cam([2.4, 1.3, -4.6], [0, 1.2, 0], 32, { grade: 'sunset', talk: false, post: { exposure: 1.35 } }); });
  row('They were chanting my', 'bridge', 'crowd faces mid-chant, fists up', (s, u, sh) => { bh(s, 'F8', { c: false }); return cam([-2, 4.6, 3], [1, 4.2, 12], 36, { grade: 'sunset', talk: false, roll: -12 }); });
  row("Dad's last note was", 'bridge', 'the note peeks out of his pocket', (s, u, sh) => { bh(s, 'F9', { c: false, pose: { armR: [-0.9, 0, 0.3] } }); hold('hero', prop(s, 'note', [], [0, 0, 0]), 'R', [0, -2.0, 0.6]); const a = CAST.get('hero'); a.root.updateMatrixWorld(true); const p = a.armR.inner.localToWorld(V(0, -2, 0.6));
    return cam(off(p, 0.3, 0.8, -2.2), p, 30, { grade: 'sunset', talk: false, f: p.toArray(), post: { aperture: 1.4 } }); });
  row('And then really quiet', 'bridge', 'his face: the noise drops away', (s, u, sh) => { const h = bh(s, 'F7'); return cam(off(h, 0.5, 0.2, L(-3.4, -2.8, u)), h, 28, { grade: 'sunset', lead: 'hero', talk: false }); });
  row('right behind me I', 'bridge', 'his eyes slide sideways; behind, the blurred crowd', (s, u, sh) => { const h = bh(s, 'F7'); CAST.get('hero').neck.rotation.y = 0.3; return cam(off(h, -1.0, 0.1, -3.2), off(h, 0.3, 0, 0), 28, { grade: 'sunset', lead: 'hero', talk: false }); });
  row('Squeak', 'bridge', 'among all the feet: the old taped shoe', (s, u, sh) => shoe(s, sh, u, 'bridge'));
  row('Step', 'bridge', 'the hero\'s eyes go wide', (s, u, sh) => { const h = bh(s, 'F7'); return cam(off(h, 0.2, 0.1, -2.6), h, 24, { grade: 'sunset', lead: 'hero', talk: false }); });
  row('Squeak', 'bridge', 'the old shoe once more', (s, u, sh) => shoe(s, sh, u, 'bridge'));
  row('So I turned around', 'bridge', 'he turns around', (s, u, sh) => { const h = bh(s, 'F14', { ry: L(PI, 0.2, Math.min(1, u * 1.6)) }); return cam(off(h, 3, 0.8, -4), off(h, -0.5, -0.4, 1), 34, { grade: 'sunset', lead: 'hero', talk: false }); });
  row('Three million people blinked', 'bridge', 'the crowd: blank blink faces', (s, u, sh) => { bh(s, 'F7', { ry: 0.2, c: false }); return cam([3.2, 5.2, -1], [0, 4.2, 14], 40, { grade: 'sunset', talk: false, mood: 'calm' }); });
  row('shrugged', 'bridge', 'they shrug', (s, u, sh) => { bh(s, 'F7', { ry: 0.2, c: false }); return cam([-1, 5.4, -1], [0, 4, 16], 40, { grade: 'sunset', talk: false }); });
  row('and walked away', 'bridge', 'dawn: the crowd streams away down the bridge', (s, u, sh) => { bh(s, 'F7', { mood: 'dawn', ry: 0.2, c: '0', crowd: false }); const sp = []; const r = RBX.rng(4); for (let i = 0; i < 200; i++) sp.push({ x: (r() - 0.5) * 16, z: 30 + u * 8 + r() ** 0.7 * 260, ry: (r() - 0.5) * 0.6 }); ENG.add(s.scene, FOL.farCrowd(new THREE.Group(), sp, 41));
    put(s, 'dad', { p: [-0.2, 0, 4.6], ry: PI + 0.1, face: 'F2', keep: true }); return cam([12, 14, -12], [0, 0, 40], 40, { grade: 'morning', talk: false }); });
  const dawn = (s, u) => { bh(s, 'F7', { mood: 'dawn', ry: 0.26, x: -1.4, c: '0', k: 0.8, crowd: false }); put(s, 'dad', { p: [0.4, 0, 6.2], ry: PI + 0.1, face: 'F2', keep: true }); const sp = []; const r = RBX.rng(4); for (let i = 0; i < 160; i++) sp.push({ x: (r() - 0.5) * 16, z: 60 + r() ** 0.7 * 240, ry: (r() - 0.5) * 0.6 }); ENG.add(s.scene, FOL.farCrowd(new THREE.Group(), sp, 41)); };
  row('The number above my', 'bridge', 'his counter: 0', (s, u, sh) => { dawn(s, u); const h = head('hero'); return cam(off(h, 1.6, 2.0, -4), off(h, 0, 2.2, 0), 30, { grade: 'morning', talk: false }); });
  row('And there three steps', 'bridge', 'over his shoulder: a man three steps back', (s, u, sh) => { dawn(s, u); return cam([1.6, 7.8, -10], [0.0, 3.4, 4.0], 46, { grade: 'morning', lead: 'dad', talk: false }); });
  row('One old shoe', 'bridge', 'the vest, then down: one old taped shoe', (s, u, sh) => { dawn(s, u); return cam([2.6, L(4, 1.4, u), 0.6], [0.2, L(3.6, 0.5, u), 6.2], 32, { grade: 'morning', talk: false, f: [0.1, 1, 6.2] }); });
  row('Squeaking', 'bridge', 'close: the shoe shifts, squeak', (s, u, sh) => { dawn(s, u); return cam([-2.0, 0.8, 3.6], [-0.1, 0.35, 6.2], 28, { grade: 'morning', talk: false, f: [-0.1, 0.35, 6.2], post: { aperture: 1.4 } }); });
  row('My dad', 'bridge', 'Dad\'s face: a soft smile under the moustache', (s, u, sh) => { dawn(s, u); const h = head('dad'); return cam(off(h, 1.2, 0.0, -4.2), h, 28, { grade: 'morning', lead: 'dad', talk: false }); });
  row('He never worked nights', 'bridge', 'two-shot: father and son on the empty bridge', (s, u, sh) => { dawn(s, u); return cam([6.5, 5.2, -7], [-0.5, 3.4, 3.1], 40, { grade: 'morning', talk: false }); });
  row('He told me that', 'bridge', 'the hero, realising', (s, u, sh) => { dawn(s, u); const h = head('hero'); return cam(off(h, 1.6, 0.2, 3.8), h, 28, { grade: 'morning', lead: 'hero', talk: false }); });
  // ======================= FLASHBACK: ELEVEN YEARS =======================
  row('For eleven years he\'d', 'street', 'flashback: side view, the hero walks and Dad walks three steps behind', (s, u, sh) => { heroWalk(s, sh, u, 'F1', -10, '1', 6.5); const h = head('hero'); return cam([8, 6, h.z - 3.2], [-8.6, 3.4, h.z - 3.2], 44, { grade: 'sepia', talk: false }); });
  row('Every crosswalk', 'street', 'a crosswalk: the boy crosses, Dad holds back the traffic, 3 steps behind', (s, u, sh) => { prop(s, 'crosswalk', [], [0, 0, 70]); put(s, 'hero', { p: [L(-5, 1, u), 0, 70], ry: PI / 2, face: 'F1', keep: true, pose: W }); put(s, 'dad', { p: [L(-11.5, -5.5, u), 0, 70], ry: PI / 2, face: 'F2', keep: true, pose: Object.assign({}, W, { armL: [-2.7, 0, 0.4] }) });
    return cam([-3, 9, 84], [-2, 1, 70], 40, { grade: 'sepia', talk: false }); });
  row('Every bad day', 'street', 'the boy walks with his head down; Dad behind, hand half-raised', (s, u, sh) => { const z = heroWalk(s, sh, u, 'F9', 40, '1', 6.5); return cam([-2.4, 5.2, z + 5], [-8.6, 3, z - 3.5], 42, { grade: 'sepia', lead: 'hero', talk: false }); });
  row("He wasn't following me", 'bridge', 'Dad, close, warm', (s, u, sh) => { dawn(s, u); const h = head('dad'); return cam(off(h, -1.4, 0.2, -4.4), h, 30, { grade: 'morning', lead: 'dad' }); });
  row('He was walking me', 'street', 'sepia wide: the two of them walking home, 3 steps apart', (s, u, sh) => { heroWalk(s, sh, u, 'F1', 0, '1', 6.5); const h = head('hero'); return cam([10, 22, h.z - 3], [-8.6, 0, h.z - 3.2], 40, { grade: 'sepia', talk: false }); });
  row('He said You looked', 'bridge', 'Dad smiles, half laughing', (s, u, sh) => { dawn(s, u); CAST.face('dad', 'laugh'); const h = head('dad'); return cam(off(h, 1.4, 0.2, -4.0), h, 30, { grade: 'morning', lead: 'dad', faces: { dad: [[0, 'laugh']] } }); });
  row('I said I wanted', 'bridge', 'the hero smiles back', (s, u, sh) => { dawn(s, u); const h = head('hero'); return cam(off(h, 1.8, 0.3, 3.6), h, 30, { grade: 'morning', lead: 'hero', faces: { hero: [[0, 'laugh']] } }); });
  // ======================= NOW =======================
  const side = (s, sh, u, z0 = -10) => { const z = walker(s, 'hero', z0, sh, u, { face: 'F5' }); cnt('hero', '0'); walker(s, 'dad', z0, sh, u, { x: -5.6, y: 0, face: 'F5' }); return z; };
  row('Now we walk side', 'street', 'day: father and son walk side by side, counter 0', (s, u, sh) => { const z = side(s, sh, u); return cam([-7, 4.2, z + 12], [-7, 4, z], 40, { talk: false }); });
  row('He still squeaks', 'street', 'low: the old shoe next to the white sneaker', (s, u, sh) => { const z = side(s, sh, u); return cam([-2.6, 1.0, z + 5], [-5.6, 0.4, z], 30, { talk: false, f: [-5.6, 0.4, z] }); });
  row('I still never look', 'street', 'the hero, smiling, looking ahead', (s, u, sh) => { const z = side(s, sh, u); const h = head('hero'); return cam([-9.8, 4.4, z + 4.6], h, 30, { lead: 'hero' }); });
  row("I don't have to", 'street', 'from behind: the two walk away down the street', (s, u, sh) => { const z = side(s, sh, u); return cam([-7, 7, z - 14], [-7, 3.6, z + 6], 40, { talk: false }); });
  row('Zero followers', 'street', 'close: the "0" over his hair', (s, u, sh) => { const z = side(s, sh, u); const h = head('hero'); return cam([-9.2, 6.8, z + 5], off(h, 0, 1.8, 0), 30, { talk: false, f: off(h, 0, 1.8, 0).toArray() }); });
  row('Never alone', 'street', 'aerial: two small figures, side by side, the street ahead', (s, u, sh) => { const z = side(s, sh, u); return cam(L([10, 18, z + 22], [12, 24, z + 26], u), [-7, 0, z], 40, { talk: false, post: { aperture: 0 } }); });
  SHOTLIST = R.map((r) => r.slice(0, 3)); STAGEI = R.map((r) => r[3]);
})();
