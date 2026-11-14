LOOK.panels.x_hair = async () => { const S = await LOOK.set('road'), sc = S.scene; S.mood('fall'); const a = CAST.put(sc, 'rudy', { p: [5, 0.3, 14.4], ry: PI_H, face: 'F1' }); a.root.updateMatrixWorld(true); const h = a.head.getWorldPosition(new THREE.Vector3());
  return { scene: sc, p: [h.x + 0.6, h.y + 0.5, h.z - 3.6], l: [h.x, h.y + 0.25, h.z], fov: 36, grade: 'day', f: h.toArray(), post: { aperture: 1.2 } }; };
LOOK.panels.x_hair2 = async () => { const r = await LOOK.panels.x_hair(); r.p = [r.f[0] - 2.6, r.f[1] + 0.3, r.f[2] - 2.6]; r.fov = 40; return r; };
