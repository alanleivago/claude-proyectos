---
type: spec
status: active
tags: [roblox, rbx-chess, three.js, sets]
relatedTo: [styles/roblox/STYLE.md, pieces/rbx-chess/script.md, pieces/rbx-chess/look/look_sheet.jpg]
---

# rbx-chess — set contract (read before building a set)

Piece: "Everyone Moves Like A Chess Piece" (script.md). A kingdom built ON a giant chessboard lying on a giant walnut table.
Look test: `look/look_sheet.jpg` (code `look/look.js`, run `node look/look.mjs` then `python look/sheet.py`).

## Runtime
- three.js r149 global `THREE`, `RBX` (styles/roblox/rbx.js), `KIT` (src/kit.js; grades day, morning, gamenight, box, night, sunset), `PROPS` (src/props.js: hair, glasses, hold...).
- `CHESS` (src/chess.js): `pawnCap(side)`, `rookHat(side, taxi)`, `mitre(side)`, `queenCrown()`, `kingCrown()`, `bakerToque()` (head-local),
  `badge(kind, side, r)` (chest pin), `gown()`, `cape()`, `apron()` (body-local), `horseHood(av)` (knight hood on the dino-hood shell),
  `hand({sleeve})` (giant Hand: `userData.pose/pinch/tipMid`), `lacquer(side)` boxwood/ebony material, `latheGeo`, `silCanvas(kind)`, `citizen(kind, side, o)`.
  Extra faces registered into RBX.FACES: haughty, kindly, lashes. side 'w' = cream boxwood, 'b' = ebony.
- `CAST` (src/cast.js): hero, dad, aunt, uncle, queen, king, baker, rook, rook2, pawn0..pawn7.
- Board coordinates (set-kingdom): square SQ=16, file f (a..h = 0..7) x = -56 + 16 f, rank r (1..8) z = 56 - 16 (r - 1). Rank 1 (castle) near +z, rank 8 (fog) far -z.
  Street: x along, z -38.5..-25.5 (centre -32) between the rank-6 shops (facing -z) and the rank-7 pawn cottages (facing +z). Alleys between cottages at x = FX(f) + 8.

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
`node setview.mjs <name> /private/tmp/.../scratchpad/<name> src/chess.js` (3rd arg loads chess.js first) renders every view to jpg + a sheet
(blue stand-in avatars appear at every `p_*` mark for scale). Look at your renders, fix, repeat until it looks
like a rich Roblox Studio scene (compare with look/look_sheet.jpg). Return: file path, list of marks/props/moods
with one line each, and the sheet path.
