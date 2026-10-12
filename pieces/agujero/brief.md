# agujero — ¿Que pasaría si la Tierra cayera en un agujero negro?

## Spec
- 9:16, 1080×1920, 24 fps, 70 s (1680 frames). Spanish; the title and the end card in the user's exact words. Style **pov3d** (three.js r149), new world.
- Format **F5, fixed place**; the camera lifts off at 33 s and climbs through the clouds to the shadow. Reference: `Ref Lunar Animation/what if earth fell into a black hole.mp4` (83 s: night field, a tree, the Moon pulled in, a lensed disk, golden sky, the ground pulled, debris rising, lava cracks, black). Ours: a hilltop above a valley town at dusk → night, hundreds of lit houses, a road of lights, clouds, the houses torn from the ground, the camera rising.
- Black hole: ray-traced per pixel (bh.js), Schwarzschild photon bending; shadow, photon ring, Doppler-beamed Keplerian disk, and the SKY itself (gradient + procedural stars, shared GLSL with the dome) drawn along bent rays so the hole visibly lenses the sky and the stars round itself from the first frame.

## Beats
| # | time | picture | camera | caption |
|---|---|---|---|---|
| 1 | 0–5 | dusk hilltop, town lights, stars; a small lensing ring by the Moon | still, breathing | title (3 lines) |
| 2 | 5–13 | the Moon stretched towards the hole and torn into a stream | slow | La Luna está cayendo. / Se deshace. |
| 3 | 13–23 | the stream becomes the disk; the sky turns gold | looks up | Ahora tiene un anillo. |
| 4 | 23–33 | clouds stream to it; wind; the town's power flickers out | glances left/right | La gravedad tira del suelo. |
| 5 | 33–43 | rocks, tiles, trees fall upwards | lifts off | Todo lo suelto cae hacia arriba. |
| 6 | 43–53 | lava cracks; houses tear free and tumble up | looks down, climbing | La Tierra es la siguiente. |
| 7 | 53–61 | through the clouds towards the shadow | climbs, tilts up | Desde fuera, te verían congelado. |
| 8 | 61–62.5 | silence | — | — |
| 9 | 62.5 | the crossing: white flash, black | — | — |
| 10 | 64–70 | end card (centred): "Tranquilo, El agujero negro más cercano es Gaia BH1 y esta a 1.560 años luz." / "...o no?" (2 s later) / ALTERBASE (lower, apart) | — | — |

## Claims + sources
- Gaia BH1, the nearest known black hole, ~1,560 light-years, ~10 solar masses (Wikipedia list of nearest black holes; MPIA 2022).
- Event horizon radius ≈ 2.95 km per solar mass (NRAO) → ~30 km for Gaia BH1 (not on screen).
- Seen from far away, an infalling object appears to freeze at the horizon (UMD ASTR350 lecture notes) → "Desde fuera, te verían congelado."
- Illustrative: the countdown, the distances, the hole's angular size, the Moon's size (drawn ~2× so it reads).
