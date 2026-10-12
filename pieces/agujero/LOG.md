# agujero — log

## 2026-10-11 — story, look, storyboard, build
- Reference measured (`references/blackhole/`: 1 s sheet, shotlog: 83 s, 1 cut, loudest −8.0 dB at 7.6 s). Story approved as is.
- Started from corre's helpers/textures + luna's window light sheet and Moon maps; new world.js (terrain, town of ~840 houses, road, trees, grass, clouds, debris, Moon), bh.js (per-pixel black hole), run.js.
- Look rounds: the hole read as a flat sketch (disk too dim, brown sky) → disk emission ×3.4, darker sky, gold glow localised; clouds washed the shadow → silhouettes; Moon black (fogged) → fog off + emissive; a near tree and a huge debris slab in frame → kept out of the view cone.
- User notes (storyboard): detailed clouds (cumulus of billows, lit above / shaded below), grass clumps of curved blades (no spikes), real trees (broadleaf with trunk, branches, lumpy leaf clusters; conifers), a road with lamp posts, light pools and two cars, earth yards round the houses, houses torn up into the sky, wider shadows (±420 m box), the hole forming by lensing the sky round itself (sky + stars as shared GLSL, drawn along bent rays), more visible stars, the new end card + "...o no?" + ALTERBASE (then moved lower, apart).
- Bugs found: `RRTAndODTFit` clashes with three's prefix (renamed); premultiplied colour encoded before blending showed the lens edge (un-premultiply → sRGB → re-premultiply); the composite was in the transparent list and painted over the ground (moved to the opaque pass with custom blending); a white moon light lit the whole scene (off).
- Sound (recorded, sound/): 32 bed layers + 5 cues. −15.1 LUFS, TP −2.0 dBTP; loudest 100 ms 62.7 s −9.6 dB (the hit); 61.05–62.4 s at −91 dB.

## 2026-10-11 — export + review
- Export: 1680 frames (~2.6 s/frame); final.mp4 + audio (sound/audio/mix.wav), share.mp4 CRF 24.
- qa.py: PASSED (0 failed; the hit's picture change at frame 1500: 245.6 vs local 4.6). review.mjs: text PASS (0 cut-off/overlap/safe zone); story arc PASS 5/5 (gift p90 −9.8 vs peak −11.1; silence −120); loudest 100 ms 62.7 s −9.8 dBFS; 1.7 s ≤ −40 dBFS before it; −15.1 LUFS, TP −2.0; dead beats PASS. Flat frames 1464–1499 (the shadow fills the view) and 1529–1543 (black after the flash) are intended.
- Weakest: the disk is rendered at half resolution (soft at full size); the Moon is drawn ~2× its true size.
