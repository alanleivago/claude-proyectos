---
type: brief
status: active
tags: [pov3d, infierno, agents]
relatedTo: [pieces/universe]
---
# infierno — rules for the scene agents

Piece: pieces/infierno ("¿Qué pasaría si el infierno fuera real?"), pov3d style, 9:16 1080×1920, 24 fps, 70 s, three.js r149
rendered offscreen and drawn on a 2D canvas. Built from pieces/universe's modules (the quality bar: pieces/universe/storyboard.png).
The reference video's frames are in pieces/infierno/ref/r_NN.png (NN = second + 1). Copy its camera and timing, but every
frame must be clearly ABOVE it in modelling, textures, light and motion (the ref has blocky people and cone flames).

## How to work
- Work in a PRIVATE COPY so builds don't collide: `cp -r pieces/infierno <your scratchpad>/infierno-<you>`; edit only your
  file(s) there; build `node ~/.claude/skills/animate/tools/build.mjs <copy>`; look at frames with
  `node ~/.claude/skills/animate/tools/still.mjs <copy> 2,5.5 out.png --scale 0.4` (GPU flags are automatic) and READ the png.
  When done, copy ONLY your file back to pieces/infierno/src/. Never edit other files in pieces/infierno.
- Deterministic: RNG('key') (R.f(), R.r(a,b), R.n(sd), R.pick), hsh(i,k); never Math.random or Date.
- Prefix any new top-level name with your file's name (e.g. fiestaXxx) unless it's part of an agreed API.
- Text/HUD are drawn by overlays.js on top: keep the band y 1290–1470 (captions) and the HUD block at the left around
  y 620–780 readable — no bright clutter right behind them. Title at 0–3.5 s sits around y 450–700.
- Use: makeStage(o) / dayStage(o) (fx.js), renderStage(st, exposure), bloom(amt), vignette, camPt(st, pos, target, fov, t,
  amt, seed), camLook, handheld; people: makePerson(o) + posePerson(P, q) (faces, emotions: emo { fear, open, cry, sad,
  surprise, tremble, angry }), man(R,o)/woman(R,o) (lit.js), makeCrowd(n, o) (instanced crowd: C.set(i,x,y,z,yaw,s,armsUp,
  sway,gone), C.done()); makeHand/poseHand (hands.js); colonial facades: building(st, x, z, w, d, ry, seed, wall, floors,
  bays, o) and the rest of plaza.js; texNoise, lumpyGeo, mesh, box, cyl (helpers.js); fire API (fire.js header):
  makeFlames, makeEmbers, makeSmoke, lavaMat, FIRE_T (shared clock = TT).
- A shot is `SHOT_FN[key] = (lt, dur, t) => { ... build once via once('key', () => ...), pose, renderStage(st, exp); bloom(x); }`
  where lt = local time in the shot, dur its length, t = global time.
- Performance: a frame should render in < 1.5 s on the GPU. Instance repeated things.
- Finish with a short report: what you built, the frames you checked (times), what is still weak.
