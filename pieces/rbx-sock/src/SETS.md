---
type: spec
status: active
tags: [roblox, rbx-sock, three.js, sets]
relatedTo: [styles/roblox/STYLE.md, pieces/rbx-sock/src/shotlist.js, pieces/rbx-sock/script.md]
---

# rbx-sock — set contract (read before building a set)

Piece: Roblox-story short "Never Lose A Sock" (script.md): soft horror about the Sock Man who takes missing socks;
sets come from pieces/rbx-thursday (street, kitchen, bedroom, classroom) plus new ones for this story.
Approved look of the style: Look = Roblox Studio "Future lighting": R6 block avatars in
RICH realistic textured sets (wood grain, brick, shingles, wallpaper, fabric, PBR normal maps), bloom on emissives,
night = cobalt blue + cold moonlight + warm orange practicals. `../rbx-thursday/look/look_sheet.jpg`, code `../rbx-thursday/look/look.js`
(bedroom + rooftop — copy its techniques: texPair painters, world-UV boxes, beams, dust, string lights).
Sets must be DENSE (props, trims, mouldings, clutter), never flat/empty, never smooth plastic.

## Runtime
- three.js r149 global `THREE` (`styles/pov3d/three.js`), `physicallyCorrectLights = true`, PCFSoft shadows.
- `RBX` (styles/roblox/rbx.js): `RBX.pbr(colorCanvas, heightCanvas, {rough,bump,repeat,emissive...})`, `RBX.rbox(w,h,d,r)`,
  `RBX.cnv`, `RBX.tex`, `RBX.rng`, `RBX.fbm`, `RBX.tnoise`, `RBX.plushMat`, `RBX.fleece`, `RBX.beam/beamMat`, `RBX.avatar(...)`.
- `SOCKS` (src/socks.js): `SOCKS.mat(kind,{repeat,lit})` knit sock material (kinds: SOCKS.KINDS — dino, pizza, duck, knit, stripe, dots, argyle, gym, baby, red, green, grey, grey2, oat, fadeblue, fadestripe, grandpa, star, mail...),
  `SOCKS.geo(flat)` a loose sock geometry (cuff at origin, leg down -y ~1.8, foot forward +z ~1.45, flat axis x), `SOCKS.one(kind, s)` one sock mesh group,
  `SOCKS.lying(kind, s, ry)` a sock lying on its side on the floor, `SOCKS.instanced([{kind, m: Matrix4}], {lit, cast})` -> Group of InstancedMeshes (for piles/mountains).
- `KIT` (src/kit.js): `texPair, noiseOver, woodPlanks, bricks, uvBox, box, rb, wm, textTex, shadow, star, V, GRADE`.
- No external assets / no network: everything procedural in code (canvas textures + geometry).

## Contract
One file `src/set-<name>.js` that registers an async builder:

```js
SETS.<name> = async function (ctx) {   // ctx = { renderer }
  const scene = new THREE.Scene(); ...
  return {
    scene,                 // with its own lights; fog if exterior
    grade: 'night',        // default KIT.GRADE key
    marks: { p_name: { p: [x, y, z], ry: rad, sit?: true }, cam_name: {...}, ... },   // p_* = where people stand (feet)
    props: { name: Object3D, ... },   // things shots animate/toggle (bell, board, clock hands, car...)
    mood(name) { ... },    // optional lighting/state presets (e.g. 'night', 'sunset', 'finale', 'day')
    views: { name: { p: [x,y,z], l: [x,y,z], fov, roll?, mood?, grade? }, ... },   // self-check cameras (vertical 9:16)
  };
};
```
- Units: R6 avatar feet at y=0, torso 2-4, head top ≈5.6 (hood ≈6.3). An adult door ≈ 8.5 tall, ceiling ≈ 12.
  Avatar is 4 wide (arms) x 1 deep. Sitting: seat height 2 (legs rotate forward), desk top ≈ 3.3.
- Frame is VERTICAL 1080x1920; most shots are low angles, push-ins, close-ups of props, top-downs. Model detail
  where the camera goes (see your shots in src/shotlist.js — the 3rd field says what each shot needs).
- Text in the world (signs, chalk, calendar, clocks) = canvas textures, readable, big strokes, hand-made feel.
- Keep each file self-contained; prefix helper names to avoid globals (wrap in an IIFE or inside the builder).
- Performance: a frame must render in < 1 s at 2x supersampling on an M5. Share geometries/materials; ≤ 2 shadow-casting lights.

## Check
`node setview.mjs <name> /private/tmp/.../scratchpad/<name> src/socks.js` (3rd arg loads socks.js first) renders every view to jpg + a sheet
(blue stand-in avatars appear at every `p_*` mark for scale). Look at your renders, fix, repeat until it looks
like a rich Roblox Studio scene (compare with look/look_sheet.jpg). Return: file path, list of marks/props/moods
with one line each, and the sheet path.
