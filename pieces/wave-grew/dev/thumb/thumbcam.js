// a thumbnail camera: looks down the line so the tube towers on the right (overrides core3d's rideCam; last declaration wins)
const THUMB_CAM = { yaw: -2, pitch: -20, fov: 56, lift: 0 };
function rideCam(st) {
  const C = typeof THUMB_CAM_OVR !== 'undefined' ? THUMB_CAM_OVR : THUMB_CAM;
  return { eye: 1.15 + (C.lift ?? 0) * waveH(st), pos: knots(BOARD_POS, st), yaw: C.yaw * DEG, pitch: C.pitch * DEG, roll: (C.roll ?? -3) * DEG, fov: C.fov, H: waveH(st) };
}
// thumbnail only: the wave mesh is hidden so the board floats over the land (the flood front still shows where it hits)
function updateWave(g, st) {
  const Hm = waveH(st), c = rideCam(st), w = g.wave;
  w.U.uH.value = Hm; w.U.uCurl.value = 1; w.U.uL.value = Math.min(Math.max(900, 70 * Hm), 0.42 * Math.PI * R_EARTH);
  w.mesh.position.set(0, 0, -c.pos * Hm); w.mesh.visible = false;
  return w;
}
