# wave-grew — the stage contract (for the agents building the worlds)

**The piece.** *What If a Wave Grew and Couldn't Stop?* 16:9 1920×1080, 30 fps, 8:30, EN, no voice. One continuous first-person shot: **you are a surfer on a wave that keeps growing**, from 1.2 m to the Moon. Style `pov3d-hd` (the soft-lit low-poly 3D of the reference channels, but richer: more detail, more props, more life, better light). three.js r149 (global `THREE`), drawn into an offscreen WebGL canvas, then the 2D HUD + captions on top.

## Files — who owns what
| file | owner |
|---|---|
| `src/head.html` (timeline, `waveH(st)`, `waveV(st)`, `travel(st)`, `knots()`, MILES) | lead — read only |
| `src/core3d.js` (renderer `g3()`, `rideCam`, `applyCam`, the WAVE mesh + shader, the rider overlay, bloom/flare, shared uniforms) | lead — read only |
| `src/scenes.js` (dispatch, HUD, captions) | lead — read only |
| `src/stage-near.js` → `function stageNear(g, st)` | agent NEAR |
| `src/stage-high.js` → `function stageHigh(g, st)` | agent HIGH |
| `src/stage-space.js` → `function stageSpace(g, st)` | agent SPACE |

Never edit a file you don't own. If you need a helper, write it in your own file with your prefix (`nr`, `hi`, `sp`) — **every top-level name in your file must start with your prefix** (all files share one global scope). Build and render only in your own dev folder: `pieces/wave-grew/dev/<near|high|space>/` (it has its own `piece.json` pointing at `../../src/`).

## The stage function
```js
function stageNear(g, st) {          // g = g3(), st = story time in seconds
  // 1. build your scene once (cache it in a prefixed global)
  // 2. const c = applyCam(g, st, near, far)  -> poses g.cam (position (0, eyeY(st), 0), yaw/pitch/roll from rideCam)
  // 3. updateWave(g, st); add g.wave.mesh to YOUR scene if it isn't (scene.add moves it from another scene: fine)
  // 4. set the shared uniforms so the wave matches your world:
  //      FOGC.value (fog colour), FOGD.value (exp fog density per metre), SKYC.value (sky colour reflected by the wave),
  //      CURVE_R.value (planet radius used by the wave's curvature, default 6371000), g.wave.U.uIce/uBoil/uDark (0..1)
  // 5. g.r.render(yourScene, g.cam)   (the frame is cleared before; autoClear is false, so render passes stack)
  // 6. return { sky, ground, key, hemi, spray, flare, bloom, post }   (all optional)
  //      sky/ground: THREE.Color for the rider's hemisphere light; key: its sun intensity; hemi: its fill
  //      spray: 0..1 droplets near the board; flare: 0..1 the sun's lens flare; bloom: 0..1; post(st): 2D extra over the frame
}
```
- **Floating origin.** The camera is always at x = z = 0, height `eyeY(st)` above sea level (y = 0). The wave travels towards **−Z** (the shore is ahead at −Z). A fixed world point at world (xw, zw) is drawn at camera-relative (xw, zw + travel(st)). Put your world in a group and set `group.position.z = travel(st)` each frame (or the equivalent in a shader).
- **The wave** is a ridge along X: crest at camera-relative z = +0.1·H, its face falls towards −Z to a trough at z ≈ −1.2·H, its back is long (+Z). It's H tall (`waveH(st)`) and `g.wave.U.uL.value` metres long each side. **Your sea surface at y = 0 meets it**: the region within ~2·H in front of the wave and ~6·H behind it should look like it's being sucked into / dragged by the wave (dark trough water in front, foamy wake behind). The lead is still improving the wave's own shape and shader — judge your world, not the wave.
- **The camera** looks down the line of the wave (yaw −50° → 0°), pitched down more as it grows (see `YAW` / `PITCH` knots in core3d.js). Land ahead is to the **left / ahead**; the open sea behind is to the right. fov 52° vertical.
- **Light:** `SUN` (core3d.js) is a low warm afternoon sun ahead-right (elevation ~11°). Every stage uses the same SUN so the light is continuous.
- Logarithmic depth buffer is on: choose near/far per frame (e.g. near = max(0.3, H·0.02), far = enough to the horizon). Custom ShaderMaterials need the `logdepthbuf` chunks (see the wave shader).
- **Shadows:** VSM is on; keep one shadow-casting DirectionalLight whose shadow camera follows the visible area (or bake shading in vertex colours at large scales).
- **Deterministic:** only `RNG('name')` (kit/core.js: `.f()`, `.r(a,b)`, `.pick()`, `.n(s)`), and `st`. Never Math.random or the clock. All textures drawn in code (canvas → `g3Tex(draw, w, h)` in core3d.js); no image files, no URLs, no data URIs.
- **Performance:** ≤ 2.5 s per frame at 1920×1080 in headless Chromium (software GL). 15,300 frames are exported. Build heavy geometry once; per frame only move/scale things and set uniforms. Use InstancedMesh for anything repeated.
- **Hand-off frames:** NEAR ends at st 185 inside the cloud deck (whiteout 180–185); HIGH starts at 185 coming out of the white and ends at 290; SPACE starts at 290 and must match HIGH's last frame (black sky, curved horizon, same land/sea colours). The lead stitches the seams; make your side clean (a frame at the boundary must look finished, not half-built).

## Commands (run in your dev folder)
```
S=/Users/alanleiva/.claude/skills/animate
node $S/tools/build.mjs .
node $S/tools/still.mjs . 40,70,145 /private/tmp/claude-501/-Users-alanleiva-claude-proyectos/f7abc0ff-06e3-4d79-af97-53f7ae6b6b67/scratchpad/<stage>-x.png --scale 0.5
```
`still.mjs` renders at the story times given (TT = st except during the 0–7 s teaser). Look at every still you render. Time a frame: still at --scale 1 and note the seconds.

## The references (local, never commit, never copy)
`/Users/alanleiva/claude-proyectos/references/couldnt-stop/` — `sheet-*.png` (contact sheets, one frame per 10 s), `f-*.png` (full frames), `*.mp4` (720p; extract frames with ffmpeg into that folder). Most relevant: `sgM6Fm0B_0E` ("You Grew": town from above, clouds, fields, Earth from space, cosmic scale), `gpLC_ELulyg` (speed: road, fields, mountains, space), `5gbgKYMEySI` (time: street, sky, desert, deep time), `ylnTesFVoOo` (twice as big: houses from above, clouds, Earth with continents), `NaW9nvqZbt4` (the Moon falls).
**What the look is:** soft afternoon light, gentle gradients, low-poly but dense worlds (hundreds of houses, trees, cars, fields in patchwork), strong aerial perspective (haze to a warm horizon), simple shapes, no outlines, everything readable. **Our bar is above theirs:** more detail and life (people, boats, birds, moving cars, flags, smoke from chimneys), richer textures (code-drawn), better water, real soft shadows near the ground, clouds with volume.
