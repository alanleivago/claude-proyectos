---
type: spec
status: active
tags: [ifverse, cats, brief, agents]
relatedTo: [ifverse-style]
---
# BRIEF — "What If You Could Understand Every Cat?" (ifverse style, 2.5D)

English YouTube story, 16:9 1920×1080, 24 fps, ~8:20, all code on one canvas. Story: `script.md`. Voice lines with ids: `lines.md`.
Style spec: `../../styles/ifverse/STYLE.md` + `ANALISIS.md` ("Especificaciones técnicas") + `REFS2.md` (what the hit channels do).
Look: `../../styles/ifverse/kit.js` — read it fully. Approved style frames for THIS piece (the bar — match or beat): `../cats-look/look.png`, the motion clip `../cats-look/renders/final.mp4`, their code `../cats-look/src/scenes.js`. The previous piece (`../ten-seconds/`) shows the engine in use (its sections s01–s08 are good examples of shot code, SFX calls and pose ramps).

## What is NEW in this piece (the user's notes — follow them)
1. **More 2D→3D.** Every set is built in perspective: `ivRoom` (one-point interiors with mappers L/R/F for windows, doors, rugs), `ivBox` (furniture, walls, crates, cars, train cars as boxes with a visible top and side toward the vanishing point), `ivRays` (light shafts through windows/doors), `ivAO` (contact shadow where surfaces meet), `ivLightPool`, `ivCastShadow` (a long soft shadow under EVERY standing actor and cat, away from the key light). Heads and clothes are sphere/cylinder shaded automatically (IV.sphere). Use foreground elements (soft, d 0.5–0.7) to frame shots.
2. **The camera enters the sets.** Establishing shots get a slow dolly/track/crane (move `IV_CAM.x/y/z` with `EZ.io` over the shot: z 1.0→1.4, or x across 300–400 px) so the layers parallax — like `../cats-look`. About half of the wides move; close-ups stay still or push in very slightly. Never shake.
3. **Arms:** the rig now picks natural elbow bends; still check every pose you ramp (no elbow pointing up/inside unless intended).
4. **No grain**, no ghost device in this piece (the power is hearing cats — show it with **speech**: cats' mouths move on their lines via `talk:`; the narrator never has a mouth).

## Cast (src/cast.js — never redefine)
People: `CAST.kai` (you, 16, blue hoodie) · `CAST.lily` (sister, 7, yellow coat — draw her h ≈ 0.62 × Kai's) · `CAST.mom` · `CAST.gomez` (Mrs. Gomez) · `CAST.teacher` · `CAST.anchor` (TV news) · `CAST.cop` · extras `kidA–D`, `extraA–C`.
Cats (`ivCat({ x, y, s, f, coat, pose, expr, talk, look, rot, arch, phase })` — read its comment in kit.js): `CATS.pickles` (14, orange tabby, grumpy; loves `loaf` and `sit`), `CATS.duchess` (white Persian, posh), `CATS.boss` (one-eyed grey tom — draw ×1.3 bigger than other cats), `CATS.noodle` (tiny hyper kitten, ×0.6), `CATS.shadow` (black, green eyes), Mrs. Gomez's cats `CATS.gomez1–3`, street cats `CATS.alley[0..6]`. Poses: sit | loaf | stand | walk (`phase` animates) | sleep | yowl. Expressions: eyes open|half|closed|wide|happy|angry, `blink` 0..1 (the slow blink), mouth open; `look` for pupils. A sitting cat next to a 520-px actor: s ≈ 150.
`GROUND = 900` is the floor line at d = 1 in the base framing.

## The engine (src/head.html, src/main.js — never edit)
`SHOT(t0, key, draw, { sec, title })`; times only from the voice: `CUT(id, word, n)` (3 frames before the word), `VW`, `VWE`, `LT`, `LE`. Never hard-code seconds. `SFX(t, kind, v, pan, dur)` at REGISTRATION time (top level next to its SHOT, never in a draw function).

## Shots
- One picture per clause, **~26–32 shots a minute** (the narration is a bit faster than in ten-seconds). Hard cuts. The `[BEAT]` pauses are wordless shots.
- Mix: ~⅓ hand/prop/cat close-ups, ~¼ faces (people AND cats — cat close-ups are this video's selling point), ~⅓ wordless.
- The picture shows the noun on its word; every number on screen (85,000 Hz, 4B, 14 years, 40 → 100 → hundreds cats, car 9, "Boss's House").
- Acting: faces change on the word; actions happen (the hug, the shower, the balloon slipping, the yowl, the run across roofs, the slow blink). Gestures 4–6 frames with a hard stop (`ivPoseMix` + `EZ.o3`), walks with `ivWalk`.
- Text: `ivTag`/`ivText` rounded caps, never over faces, inside the bars.

## SFX (the user's rules — balanced, under the voice)
Register SFX in the same pass as the shots (kinds in `src/score.js` → SFX_KINDS: whoosh swish pop blip tick click thud impact splash drip paper cloth step slide glass metal plastic beep buzz cheer gasp laugh car brake horn engine wiper door bounce coin ding camera type heart shimmer ghost rise drop crowd). Every action gets a sound, but **about 1 sound per 0.5–1 s at most**; prefer the meaningful one. **Do NOT use `ding`/`coin`/`shimmer` except for 1–2 key moments in your whole section** (the user finds bright "tings" annoying). Cats: use `cloth` for fur rubs, `thud` for jumps landing, `step` (v 0.4) for paws, `gasp` (v 0.5) for hisses, `crowd` (dur) for many cats yowling. Music and the big moments are done separately in score.js.

## Code rules
Deterministic (`RNG(key).f`), your file only, prefix your names (`s03_…`), write in parts of ~200 lines. Build `node ~/.claude/skills/animate/tools/build.mjs pieces/cats/dev/<you>`; board `node ~/.claude/skills/animate/tools/storyboard.mjs pieces/cats/dev/<you> pieces/cats/dev/<you>/board.png`; stills `still.mjs … <t,…> … --scale 0.4`. LOOK at every shot and fix: faces cut by bars, floating/sinking feet, things passing through each other, too dark/empty frames, the same picture 3× in a row, elbows bent wrong. SFX check: `node pieces/cats/dev/sfxcount.mjs pieces/cats/dev/<you> <sec>`. Python: `/usr/bin/python3`. The voice in dev is partly a scratch voice; the real one will re-time everything.
