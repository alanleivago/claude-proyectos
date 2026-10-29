---
type: brief
status: active
tags: [pov3d, papel, agents]
relatedTo: [pieces/infierno/AGENTS.md, pieces/universe]
---
# papel — rules for the scene agents

Piece: pieces/papel ("¿Qué pasaría si doblaras una hoja de papel por la mitad 103 veces?"), pov3d, 9:16 1080×1920, 24 fps,
70 s, three.js r149 offscreen → 2D canvas. Spanish, metric, no voice (text on screen only). Quality bar: pieces/infierno
(look at its storyboard.png) — every frame clearly ABOVE the reference (pieces/papel/ref/r_NN.png, NN = second + 1): its
city is low-poly grey boxes and its space is a black screen with a thin line; ours must be rich, lit, textured, cinematic.

## The fold clock (src/base.js — read it)
foldAt(t) → { n folds done, k 0..1 progress of the fold in flight }; thickM(n) = 0.1 mm × 2^n (metres); fmtLen(m);
FOLD_T[n] = time fold n lands. Milestones: 14 @10.4 (1.64 m), 21 @18.2 (210 m > Torre Latinoamericana 183 m),
26 @24.2 (6.7 km > Popocatépetl 5,393 m), 27–28 (13–27 km > Everest 8,849 m, airliners ~11 km), 30 @29.4 (107 km: space,
Kármán line 100 km), 32 @32.4 (429 km > ISS ~400 km), 42 @39.4 (439,805 km > the Moon 384,400 km), 51 @46.2 (225 million km
> the Sun 150 million km), 57 (~Neptune 4,500 million km), 69 @50.0 (6.2 ly > Proxima Centauri 4.24 ly), 83 @54.0
(102,000 ly > the Milky Way ~100,000 ly), 88 @57.8 (3.27 million ly > Andromeda 2.5 million ly), 103 @62.0 (107 billion ly
> the observable universe ~93 billion ly).

## How to work
- Work in a PRIVATE COPY: `cp -r pieces/papel <your scratchpad>/papel-<you>`; edit only your file(s) there; build
  `node ~/.claude/skills/animate/tools/build.mjs <copy>`; look at frames with
  `node ~/.claude/skills/animate/tools/still.mjs <copy> 2,5.5 out.png --scale 0.4` and READ the png. Tile consecutive frames
  for motion: `node ~/.claude/skills/animate/tools/tile.mjs <copy> tile.png 240 241 242`. When done, copy ONLY your file back
  to pieces/papel/src/. Never edit other files in pieces/papel.
- Deterministic: RNG('key') (R.f(), R.r, R.n, R.pick), hsh(i,k); never Math.random or Date.
- Prefix new top-level names with your file name (studioXxx, ascentXxx, cosmosXxx, colXxx) unless part of the column API.
- Overlays (overlays.js) draw on top: the HUD block at the LEFT (x 60–420, y 600–870: PLIEGUES + number + GROSOR), the title at
  0–3.9 s (y 300–620), captions in the band y 1290–1470. Keep those readable: no bright clutter right behind them.
- Use: makeStage(o)/dayStage(o) (fx.js), renderStage(st, exposure), bloom(amt), vignette, camPt(st, pos, target, fov, t, amt,
  seed), camLook, handheld; people: makePerson + posePerson (lit.js man/woman); hands (makeHand/poseHand); plaza.js
  building()/facades/winLit; sky.js buildSky/addSkyClouds/cloudTex (cloud decks); texNoise, lumpyGeo, mesh, box, cyl.
  pieces/universe/src/space.js has a Milky Way, galaxies, a cosmic web, a quasar and an Earth you may study and adapt.
- THE COLUMN: use makeColumn/C.pose and colLabel from column.js (a stub now, being upgraded in parallel; code against the
  API). The column must be continuous across shots: the paper stack you see at the desk is the same one that pierces space.
- A shot is `SHOT_FN[key] = (lt, dur, t) => { build once via once('key', ...); pose; renderStage(st, exp); bloom(x); }`.
- Performance: < 1.5 s per frame; instance repeated things.
- Finish with a short report: what you built, frames checked (times), what is still weak.
