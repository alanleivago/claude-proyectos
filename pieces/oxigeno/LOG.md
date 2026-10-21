# oxigeno — log

## 2026-10-12 — story, look, build, export
- Reference measured (`references/oxygen/`: 80 s, 3 cuts, loudest −8.3 dB at 8.0 s). Story approved as is.
- Built on luna's harbour world (scenes.js, sea level redefined so the harbour drains) + new `oxy.js`: a café on a seafront roof (tile deck that breaks and falls, parapet with glass, tables/chairs/candles/bottles, two fire-pit tables, heaters, bar, parasols, plants, string lights, 23 people), town crumbling far-to-near, boats with wakes that stall, hydrogen mist, dust, falling debris, a fireball sphere over the harbour, ear-pop zoom bump.
- Bugs: café people shared luna's geometry/materials → neon heads (fixed by cloning per InstancedMesh); camera inside a tall house (café moved onto the promenade row, houses under its footprint removed); camera fell through the building (fall capped at the ground); fireball sprites washed the frame white (real sphere + fewer, darker sprites).
- User notes: richer textures (wood grain, plaster, woven canvas, bump maps), visible fires that go out (fire-pit tables + candles + heaters), sea ripples and smoke clusters, end card: fact higher, teaser 2 s later ("tranquilo, esto no puede pasar... o si?"), "ALTERBASE.ESP" at the bottom (now a rule for this style).
- Export slowed to ~60 s/frame after ~400 frames in one browser (accumulating cost; fresh browser = 1.3 s/frame) → rendered the rest in 300-frame chunks. Rule: export long pov3d pieces in chunks.
- qa.py PASSED (−15.1 LUFS, TP −1.9). review: text PASS, story arc 5/5, loudest 55.7 s −9.5 dBFS after 1.2 s ≤ −40 dBFS; flat frames 1509–1543 = intended black before the card; dead beats WARN 1.5–4.5 (title hold) and 7.75–10.75.

## 2026-10-13 — round 2 (user notes), ES + EN from one shared oxy.js (OX_EN flag in the EN head)
- People: hands clamped to ears, doubled over (upper body pivots at the hips), kneeling, some topple onto their side, pained rocking; 5 people placed right by the camera; the camera slowly looks round at them after the pop (5.5–10.9 s). 2D motion blur from the camera's angular velocity.
- Shadow flicker fixed: the shadow box no longer follows the camera (fixed over the café/harbour, normalBias).
- Floor: a travelling ripple (T_FALL−3.2…T_FALL), then a noise dissolve with pale dusty rims on deck tiles and plaster; then it falls. The camera turns round to watch it.
- A district of ~30 glass towers (ES across the bay, EN behind the bridge) crumbling from the top (per-instance cut height + jagged rim), 1800 façade chunks falling, dust at the front and the base.
- Volumetric cloud clumps that boil away at the event; sun lens flare (glow, starburst, ghosts); bloom (blurred high-contrast copy, screen).
- Return of the oxygen: a white-hot point, 1200 sparks, a front of ~430 orange billows + inner flames + dark smoke rolling to the lens (T_HIT2 59.5), the frame drowns in orange and the camera glass cracks (procedural radial + ring cracks).
- Sound: code SFX (synth.py: pressure blow + ear ring, the 0.46 s "compressed breathing" pulse over a 368 Hz drone 5.2–53 s, collapse thuds, floor rumble/crack/drop, riser, blast sub/explosion/roar/crackle, glass crack) layered with the recordings; recorded crumble/quake/glass louder. AAC overshoot: a post limiter crushed the hit below the 5 s pop → rebalanced (pop −8, collapse −9) + gentle oversampled limiter.
- Export: 280-frame chunks (~2.1 s/frame). ES and EN: qa PASSED (−15.5 LUFS, TP −1.4 / −1.05), review story arc 5/5, text PASS, loudest 55.8 s −9.0 dBFS after 1.1 s ≤ −40 dBFS; dead beats WARN 1.25–4.5 s (title hold).
