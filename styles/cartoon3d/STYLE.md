# cartoon3d — "3D cartoon shorts"

Flat-drawn cartoon people (white ball head, bean body, ink-brown stick limbs, thick brown outline, Flow-drawn face decals that swap on a blink) inside dense, glossy, warmly lit 3D sets. Second-person true stories, one clause = one shot, a camera that never stops. 9:16, 30 fps, motion on 1s.

**Goal (user, 2026-10-22):** replicate the 7 references in `Ref 3D cartoon animations/` as closely as possible. When the tutorial (fuentes/3d-cartoon-animations/) and the references disagree, the references win (e.g. subtitles are ONE word at a time). No Creatorize.

## Pipeline (as the tutorial does it, minus Creatorize)
1. **Refs measured** — `tools/analyze_refs.py` (frames at 30 fps, contact sheets, words, cuts/dissolves, camera) → `Ref 3D cartoon animations/_analisis/`.
2. **People = 2D cut-outs from Google Flow, living in the 3D set** (refs, user 2026-10-22). Every layer is generated in Flow with crops of the refs uploaded as references (`_analisis/flowref/`, Flow assets `ref_head_*`, `ref_body_teal`, `ref_char_full`, `faces_master`): the bare glowing head, 43 faces + blink frames (sheets copied from the ref faces), hairstyles with the lilac gloss, bean torsos with clothes, mustache/beard/glasses, emotion symbols. `sprites/sheets.json` + `tools/slice_sprites.py` key the green out → `sprites/png/` (`face_*` cell-centred, others trimmed). Copy into a piece as `assets/face_*.png` and `assets/spr_<name>.png`. Use Nano Banana 2 when Pro hits its usage limit; the srz Flow MCP needed a patch (tile names are in aria-label now).
3. **Sets in code** (three.js r149): props and sets (`c3Prop` PBR + `c3RBox` rounded boxes + ink hulls + room env reflections + VSM soft shadows, `c3Chrome` platinum metal), effects. Characters: `c3Person` billboards (face the camera, 2D IK limbs as ink strokes, contact shadow, subtle idle breathing/sway seen in the refs).
4. **Voice** — `tools/trim_voice.py voz.mp3 pieces/<name>/voice`: sentence pauses → 0.20 s (max ~0.3), inner pauses ≤ 0.12 s, breaths removed, cuts only in silence; words.json for sync. Refs: ~219 wpm, voice 93–99 % of the runtime.

## Measured numbers (refs + tutorial)
- Shots: one clause each, new stimulus every ~1.1 s (~4 words), 25–30 per 50 s; transitions mostly 6–13-frame dissolves starting on the next phrase's first word; 0–2 hard cuts per short.
- Camera moving ~81–96 % of frames; creep ~5 %/s, accelerating to ~3.3 %/frame into the transition; no handheld shake.
- Faces: swap via half-lid (−4 f), closed (−3 f), new face (−2 f before the stressed word); a change every ~1.2 s; no lip-sync. Holds: no big moves, but the refs show a soft idle (breath + tiny sway) — keep it subtle.
- Gestures end 3–5 f before their word; head follows the hand 2–4 f later. Walk: step every 5–6 f, bob 7 % of a head. Sit: dip 3 f, rise 5 f, down 11 f, bounce. Jolt: +45 % of a head in 2 f.
- Facts are objects (LED counter, gauge, calendar, clock, newspaper, magnifier, stacked bars) landing on their word.
- Subtitles: one word, white heavy sans with a dark outline, baseline ~71 % of H; faces out of the 66–76 % band.
- Sound: SFX 12–20/min tied to visible actions (hits −10 LU, whooshes −15, ticks −22 vs voice), music bed flat at −18 LU (no ducking), master −14 LUFS.
- Render 1080×1920, 30 fps (GPU, ~30–40 ms/frame).

## Kit API (kit.js)
`c3Person({ key, outfit: teal|mustard|white|plaid|stripes|navy, hairStyle: side|spiky|messy|swept|neat|neat2|long|bald|white, fx: [mustache, beard, glasses], bodyW, hairW, hairUp })`, `c3PersonPose(p, cam, t, { hand:{armL:[x,y]}, foot, bend, head:[tilt,dx,dy], lean, expr, gaze, x:[sweat,tears,anger,blush,sparkle,question,exclaim,stars,smoke], idle })` (call after the camera is set), `c3FaceAt(track, t)` (blink swap), `c3Hold(keys, t)` (dead-still holds), `c3CamAt(keys, t)`, `c3Prop`, `c3RBox`, `c3Env`, `c3Shadows`, `c3Render(scene, cam, { bg, bgBlur, glow, glowBlur, grade })` (passes: bg blurred / focus layer sharp / glow / near blurred), `c3Vignette`, `c3Grain`, `c3Subtitle(WORDS, t)`.

## Frame checklist
- Set dense, glossy, no empty floor; warm key + rim; deep saturated colour (grade ~saturate 1.3, contrast 1.15).
- Face readable, lit, out of the subtitle band; outline visible on every person and prop.
- Nothing floating, sliding or passing through (hands vs heads, feet on floor/foot-rests).
- Every number lands as an object on its word.

## Not matched yet
- The refs' sets are richer (painted micro-detail, bokeh, many more props); hair is still a lumpy mop vs the refs' smooth glossy locks; pupils/lids don't track yet (gaze shifts the whole decal); the 20-character cast and outfits aren't built.

## Proven on
`pieces/c3d-test` (ref 6 opening recreated, 4.5 s). `pieces/apple-wayne` in progress (look check).
