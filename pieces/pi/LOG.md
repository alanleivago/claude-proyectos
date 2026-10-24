# ¿Qué pasaría si π valiera exactamente 3 durante 5 segundos? — LOG

- **Ref:** "What if π was exactly 3 for 5 seconds" (80 s). Its timings and camera moves are copied shot by shot, including the slow motion from 8 s to 56 s.
  - **Park elements changed:** donut instead of bagel, ice-cream cart instead of hot-dog cart, Ferris wheel instead of carousel, bikes instead of a carriage, stone bridge over a lake, burst domes instead of water tanks.
- **Format:** pov3d, 9:16, 24 fps, 82 s (1968 frames), Spanish, no music.
- **Card:** Indiana 1897: the House voted 67 to 0 for a bill implying π = 3.2, and the Senate shelved it. Then "Pero tranquilo, esto nunca sucederá… … ¿o sí?" (user request) and ALTERBASE.ESP.
- **Facts:**
  - 1 − 3/π = 4.5 %; π/3 − 1 = 4.7 %.
  - Equator 40,075 km × 4.5 % ≈ 1,800 km.
  - Indiana pi bill (Wikipedia, Mental Floss).
  - Dropped the ref's "Central Park must lose 595 feet" (unverifiable).

## Build
- **One park stage.** `TS(t)` is the living clock (slowed ×12 while π = 3); failures run on real t.
- **Files:**
  - park.js: the world.
  - parkpose.js: walkers, pigeons, bubbles, parasols, wheel, bikes, fountain, manholes, bridge.
  - shots.js: the ref's camera per shot.
  - overlays.js: HUD, captions, sun/halo/moon/wedge/cracked-sky in 2D, card.
- **Round 2 (user notes), four agents at high effort**, each in an isolated copy (pieces/pi_city, pi_fold, pi_sky, pi_hand) and each owning one file:
  - **city.js:** a 250-tower NY-like skyline merged into one mesh with a custom shader (tan, brick and grey; art-deco setbacks, water tanks, haze). The vertex-shader "suck" bends the towers toward a sky point at 44–47.5 s.
  - **fold.js:** ground waves from 46 s, cracks, plumes; a 22 m earth fold with strata, torn grass, a road climbing the face, slabs, rocks and dust. Objects ride the ground.
  - **skypi.js:** darker, contrastier light; a deep blue sky with a fade; a giant glowing 3D π circle in the sky (opens 4.5 % at 8 s, closes at 56 s, huge in the planet shot).
  - **donut.js:** a believable grip, with fingers solved to touch the donut surface, glaze drips, crumbs on the crack.
  - **Mine:** a reflective lake (mirror render target; the π symbol is hidden during the reflection pass) and reframed wedge shot.
- **Gotcha:** split a single big piece file into owned files before parallel agents. Each agent works in a copy of the piece and its file is copied back. No build races.

## Checks
- **QA:** PASSED. Sync 0, −15.3 LUFS, TP −2.3 dBTP, BACK lifted 5.3 dB. The card silence was filled with a soft ambience.
- **Review:** story arc 6/6, cuts on grid PASS, text PASS (the card line was shrunk out of the safe zone). The loudest moment is 56.2 s (π comes back), after 0.5 s of silence. Dead-beat WARN on the 16.5 s card (the reference's card is just as long).
