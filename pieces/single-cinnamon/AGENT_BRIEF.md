---
type: spec
status: active
tags: [cartoon3d, single-cinnamon, agent-brief, sets]
relatedTo: [styles/cartoon3d/STYLE.md, pieces/single-cinnamon/shots.md, pieces/trash-library/AGENT_BRIEF.md]
---
# Brief for the set agents (single-cinnamon, cartoon3d)

You build ONE set file of a 60.5 s, 9:16, 30 fps YouTube Short in the house style **cartoon3d** (three.js 3D sets + 2D-3D
toon character cards, drawn 100 % in code). Windows PC, repo root `F:\Claude Proyectos` (Git Bash: `/f/Claude Proyectos`).
Piece: `pieces/single-cinnamon`. Topic: the Danish tradition — single on your 25th birthday → friends tie you to a lamppost
and cover you in cinnamon; at 30 → pepper. The quality bar is `pieces/trash-library` (approved by the user): match it.
This pass is for the **storyboard** (stills), but build the set fully animated so the final render needs no rework.

## Read first (in this order)
1. `styles/cartoon3d/STYLE.md` §4–7 and §9 incl. "Lecciones de trash-library v2" (mandatory checklist).
2. `fuentes/cartoon3d/camara-secuencial-ricks.md` — THE CAMERA RULE (most important part of this job).
3. `pieces/single-cinnamon/shots.md` (beat table) and `src/shots.js` (`SHOT_LIST`, `COLOR`, kicks).
4. `pieces/single-cinnamon/src/common2.js` — helpers (`pose` with `look`/`heading`, `toonPerson`, `gripDot`, `gripProp`,
   `tex`, `redraw`, `pop`, `popAt`, `texStamp`, `texSay`, `hideAll`, `CAST`, `stableShadow`, `toonShadowTwin`) and at the
   end **`seqCam`/`CAMSEQ`**. `CAST` already holds the main characters (hero, fRope, fBucket, fSpice, stranger,
   pepperman, thirty, passer) — use those keys, do not redefine them.
5. The model set: `pieces/trash-library/src/set-street.js` (build once, getter, `stBake`, facades, `stShadowAt`,
   `stFrame`, the FOCUS-layer depth occluders in `stEndKit`, `c3SetLook` at the end, CAMSEQ). Other good models:
   `pieces/trash-library/src/set-depot.js`, `set-factory.js`, `set-lending.js`. Copy their patterns; copy helper
   functions you need into your file WITH YOUR PREFIX (never reference another set's `st*` functions — they are not built).
6. `pieces/single-cinnamon/voice/words.json` — every word's start/end. Actions and camera landings go ON words.

## Work in your own copy (4 agents run at once)
```
cd "/f/Claude Proyectos"
mkdir -p pieces/_sc-<set> && cp -R pieces/single-cinnamon/src pieces/single-cinnamon/piece.json pieces/_sc-<set>/ && mkdir -p pieces/_sc-<set>/qa
node "C:/Users/Alan Leiva/.claude/skills/animate/tools/build.mjs" pieces/_sc-<set>
node "C:/Users/Alan Leiva/.claude/skills/animate/tools/still.mjs" pieces/_sc-<set> 1.0,2.5,4.0 pieces/_sc-<set>/qa/out.png --scale 0.3
```
(build must run from the repo root). Edit ONLY `src/set-<set>.js` (it is a stub now). When done, copy that one file back
to `pieces/single-cinnamon/src/` and delete your `_sc-` copy. Never edit common2.js / shots.js / head.html / kit files /
the other set stubs: if you need a helper, write it in your file with your prefix.

## Code contract
- Prefix every global with your set prefix (street `SR`, canal `CN`, history `HI`, square `SQ`); extra characters go in
  `Object.assign(CAST, { <prefix>Name: {...} })` with hair/colour/outfit combos not used in STYLE.md §5's list or the main CAST.
- Build the scene once (`const XX_get = () => XX.s ||= xxBuild()`, `SETS.<set> = XX_get`), `c3SetLook(...)` at the end.
- **Camera = `seqCam(s, '<set>', t)` only.** Define `CAMSEQ['<set>'] = [[t, [px,py,pz], [lx,ly,lz], fov, rollDeg], ...]`
  in ABSOLUTE seconds covering your whole time range (+ a phantom key just past each end so the whip leaves/arrives
  moving). A key every 1.2–1.8 s; each leg on a different axis (push, whip to the next subject landing ON its word, orbit
  with real parallax around the subject, crane up/down, dutch roll ±3–8° that breathes); never a single-direction 2D pan;
  never still; peak angular speed < 110°/s. Land each subject framed whole (heads, signs, readable text) on the word that
  names it. Nothing between camera and subject; camera never inside walls. Faces out of the subtitle band (~71 % of H,
  y≈1360 px) and never cut by the frame edge; no text cut by the frame edge.
- **One render function for the whole set, driven by absolute t**, registered for every shot id of your set:
  `for (const id of [...]) { SHOT_FN[id] = (t) => xxFrame(t); SNAPS[id] = 'free'; }`. People keep their positions across
  shot boundaries (one continuous take): no teleporting, no popping props.
- Characters: `toonPerson` / `pose` (toon.js API in STYLE.md §5): Ricks timing (snap pose-to-pose, then stillness with the
  slight `alive` weight shift), expressions change on words, arms start on words, `look:[x,z]` so bodies turn with the
  orbit, anticipation + squash on jumps. Hands holding things: `gripProp` + `gripDot`, props in FOCUS in front of the card.
  Faces always complete (2 eyes, 2 brows, mouth), never in shadow.
- **Tied to a lamppost** (canal + square): rope = 3D coils (torus/tube) around body + post, drawn so the FRONT arcs pass in
  front of the card and the back arcs are hidden (FOCUS layer, depth occluder of the post); arms down at the sides under
  the rope. Never rope through the face.
- **Dusted in cinnamon / pepper**: tint the person's card toward cinnamon (#c8844a) or pepper (dark grey speckle) — e.g.
  a speckle overlay drawn into a FOCUS plane matching the card, or a material colour multiply on the card — but keep the
  face readable (white head lightly dusted, eyes/brows/mouth clear). Clouds = soft billboard puffs (cinnamon #b8743a,
  pepper #3a3434) on the FOCUS layer, additive-free (normal alpha), never black specks floating in the air.
- Sets big and DENSE (STYLE §6): Danish row-house facades with real silhouettes (stepped and curved Dutch gables, dormers,
  chimneys, window boxes, shutters, cellar shops with steps, bikes, lampposts, Dannebrog flags, cafe parasols), saturated
  walls (ochre, brick red, teal, mustard, Nyhavn blue), practical lights, no ink on the set, VSM soft shadows, never dark
  or burnt areas. Golden hour: low warm key + BLUE sky fill/env (an orange or lavender env turns the cobbles violet).
  Text only in the world (signs, labels), never cut by the frame edge (`inked()` shrinks to fit). Danish words OK on signs
  (BAGERI, KAGE, KANEL, PEBER, CAFÉ).
- End the frame with `c3Render(s.scene, s.cam, {...})`; shots.js adds grade, crisp and the one-word subtitles.
- Deterministic only: `RNG('seed')`, never Math.random or Date.
- Keep the file < ~120 KB; bake static detail (`xxBake` copied from `stBake`) so a frame renders fast.

## Prove it before you report
- Build passes (`syntax ok`, no `pageerror`). Render stills every 0.25 s across your range at scale 0.3 (several still calls,
  then tile them: e.g. `ffmpeg -i qa/s_%03d.png -vf tile=8x4 qa/sheet.jpg`, or pass many times to one still call) and LOOK
  at them (Read). Fix everything on the STYLE §9 checklist. Also check 3-4 consecutive frames (1/30 s apart) at a fast
  camera move and where people move (no flicker, no shadow swimming, no flipping arms).
- Check the camera really changes axis every ~1.5 s and lands on the words.
- Report back (short): your file, the shot ids covered, what the camera does leg by leg, the 2–3 PNG paths of your best
  contact sheets (copy them to `pieces/single-cinnamon/qa/` before deleting your copy), and anything you could not solve.
