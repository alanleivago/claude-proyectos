---
type: spec
status: active
tags: [cartoon3d, trash-library, agent-brief, sets]
relatedTo: [styles/cartoon3d/STYLE.md, pieces/trash-library/shots.md]
---
# Brief for the set agents (trash-library, cartoon3d)

You build ONE set file of a 61 s, 9:16, 30 fps YouTube Short in the house style **cartoon3d** (three.js 3D sets + 2D-3D
toon character cards, drawn 100 % in code). Root: `/Users/alanleiva/claude-proyectos`. Piece: `pieces/trash-library`.

## Read first (in this order)
1. `styles/cartoon3d/STYLE.md` sections 4–7 and 9 (structure, characters, sets & colour, camera/text, QA checklist).
2. `fuentes/cartoon3d/camara-secuencial-ricks.md` — THE NEW CAMERA RULE (most important part of this job).
3. `pieces/trash-library/shots.md` (the approved beat table) and `src/shots.js` (`SHOT_LIST`, `COLOR`, kicks).
4. `pieces/trash-library/src/common2.js` — helpers (`pose`, `toonPerson`, `gripDot`, `gripProp`, `tex`, `redraw`,
   `pop`, `popAt`, `texStamp`, `texSay`, `texBooks`, `dustCloud`, `hideAll`, `CAST`…) and at the end **`seqCam`/`CAMSEQ`**.
5. A finished set as a model of quality and code shape: `pieces/lost-luggage/src/set-outside.js` (exterior) and
   `pieces/lost-luggage/src/set-sort.js` (interior). Copy their patterns (build once, getter, reset, render, setlook).
6. `pieces/trash-library/voice/words.json` — every word's start/end in seconds. Actions and camera landings go ON words.

## Work in your own copy (4 agents run at once)
```
cp -R pieces/trash-library pieces/_tl-<yourset>      # build/still ONLY this copy
node ~/.claude/skills/animate/tools/build.mjs pieces/_tl-<yourset>
node ~/.claude/skills/animate/tools/still.mjs pieces/_tl-<yourset> 1.0,2.5,4.0 /tmp-path/out.png --scale 0.4
```
(still/tile output: put PNGs in `pieces/_tl-<yourset>/qa/`). Edit ONLY `src/set-<yourset>.js`. When done, copy that one
file back to `pieces/trash-library/src/` and delete your `_tl-` copy. Never edit common2.js / shots.js / head.html /
kit files: if you need a helper, write it in your file with your prefix.

## Code contract
- Prefix every global with your set prefix (street `ST`, depot `DP`, factory `FA`, lending `LE`); extra characters go in
  `Object.assign(CAST, { <prefix>Name: {...} })` with hairstyles/outfits not in STYLE.md's used list or the main CAST.
- Build the scene once (`const XX_get = () => XX.s ||= xxBuild()`, `SETS.<set> = XX_get`), `c3SetLook(...)` at the end.
- **Camera = `seqCam(s, '<set>', t)` only** (never camMove/soCam/c3SetCam). Define `CAMSEQ['<set>'] = [[t, [px,py,pz],
  [lx,ly,lz], fov, rollDeg], ...]` in ABSOLUTE seconds covering your whole time range. Rules: a key every 1.2–1.8 s;
  each leg on a different axis (push, whip to the next subject landing ON its word, orbit with real parallax around the
  subject, crane up/down, dutch roll ±3–8° that breathes in and out); never a single-direction 2D pan; never still. Land
  each subject framed whole (heads, signs, readable text) on the word that names it. Nothing between camera and subject;
  camera never inside walls.
- **One render function for the whole set, driven by absolute t**, and register it for every shot id of your set:
  `for (const id of [...]) { SHOT_FN[id] = (t) => xxFrame(t); SNAPS[id] = 'free'; }`. People keep their positions
  across shot boundaries (it is one continuous take): no teleporting, no popping props.
- Characters: `toonPerson` / `pose` (toon.js API in STYLE.md §5): Ricks timing (snap pose-to-pose, then total stillness),
  expressions change on words, arms start on words, hands holding things use `gripProp` + `gripDot`. `facing` + = screen right.
- Sets big and DENSE (STYLE §6): saturated walls, many props, practical lights, no ink on the set, VSM soft shadows, never
  dark or burnt areas. Text only in the world (signs, labels, counters), never cut by the frame edge (`inked()` in scenes.js).
- End the frame with your render call like the model sets (`c3Render(s.scene, s.cam, {...})`); shots.js adds grade,
  crisp and the one-word subtitles (keep faces out of the subtitle band ~71 % of H = y≈1360 px).
- Deterministic only: `RNG('seed')`, never Math.random or Date.

## Prove it before you report
- Build passes (`syntax ok`). Render stills every 0.25 s across your range at scale 0.3 (several still calls / sheets)
  and LOOK at them (Read). Fix anything on the STYLE §9 checklist. Check the camera really changes axis every ~1.5 s and
  lands on the words.
- Report back (short): your file, the shot ids covered, what the camera does leg by leg, the 2–3 PNG paths of your best
  contact sheets, and anything you could not solve.
