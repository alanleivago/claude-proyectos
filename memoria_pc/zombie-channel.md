---
name: zombie-channel
description: New TikTok/Shorts channel (2026-10-28) — PS1 Resident-Evil-style blonde heroine teaches zombie-survival tips; built from scratch in pieces/zombie-girl
metadata:
  node_type: memory
  type: project
  originSessionId: 3b008220-5710-444f-9064-2bac0d02be64
  modified: 2026-10-30T00:07:00.276Z
---

Started 2026-10-28. Same production approach as Mechayuki ([[mechayuki-rules]], [[digger-channel]]) but a new niche: zombie-survival lessons. Reference to beat: "Learn with Alya" (YouTube @, 1 video, 46 s, `fuentes/zombie-ref/`): failed attempt → "YOU DIED" → real fix with diagrams/labels → joke; HUD ECG "FINE/CAUTION/DANGER", one-word captions.

User decisions: English, 9:16, 45–60 s, NEW VoiceStudio voice designed with a normal US accent (no Russian accent), look = PS1 Resident Evil / Parasite Eve 2 (Jill / Aya), NOT Megaman-Legends cartoon.

Heroine (original, 100 % ours, no credits): Flow sheet `pieces/zombie-girl/ref/sheet3.jpg` (blonde, cropped brown leather jacket, white crop top with navel, black pants, black fingerless gloves, combat boots; user chose the LEAST curvy of 4 variants). Built like the Stark Crafts PS1 tutorial (`fuentes/lowpoly-girl-tut/TECNICA.md`): `model/measure.py` (silhouette → rings) → `build.py` (1510 tris) → `texture.py` (projects the sheet front/side/back by normal, 256/128 px, Closest; rejects bg grey; hair accepts only hair-colour samples) → `out/heroine_tex.blend`. User approved grey mesh and textured look.

Voice NOW (user, 2026-10-28, ep1 v4): VoiceStudio clone **"ava bread 2" `3824e262`** (the first "ava bread" 2dd9cbec had an error — don't use it). NEVER split a take at "…" (the pause is not silence → words get cut): generate each half as its own take (steps 32; "Oh, fudge"-style short lines: generate inside a longer sentence and cut in the silence). SFX must hit on the visual event: trim leading silence of every SFX file (Dino Crisis default sound had 0.33 s); typewriter = one key per letter. Earlier voice: design **"Zombie heroine B (medium)" `ef006e80`** (female, young adult, moderate pitch, american accent; F0 ≈ 190 Hz), steps=32 wav; casting takes in `pieces/zombie-girl/voz/casting/`.

Rig done: `model/rig.py` copies zero-fem's 23-bone Armature (same names/rolls/IK) into Zero units (×7.76, sole z=-9); `anim/build_anim.py` = copy of zero-fem's with this body's constants + wider base stance → all 46 actions work (`anim/heroine_anim.glb`, poses_v3.png). Other actions still carry Zero's bent-knee/wide-elbow look: tune per episode.

Faces done: `face/face_sheets.py` (system python: eye bands from Flow edits of the front face `gen/eyes_*`, mouths painted as 13-px pixel-art grids) → `face/face.py` (Blender: re-projects Head per variant → `face_eyes.png`/`face_mouth.png` 16 cells, SAME cell order/names as zero-fem so the Mechayuki engine works; eye/mouth polys UV x/16). Head face zone projects front view only (side view leaked profile lashes). Eyes `disgust` = copy of angry until Flow quota resets. Full pipeline: texture.py → face.py → rig.py (on heroine_face.blend) → anim/build_anim.py → `anim/heroine_anim.glb` (nearest filter, 46 anims).

Episode 1 = shot-for-shot remake of the ref (`pieces/zombie-01-door`, LOG.md has the rebuild commands). Heroine/channel name: **AVA RESTFIELD** (user, 2026-10-28 ep2; ep1 used "Ava Bread"; voice profile still named "ava bread 2"). User style rules from its review rounds (full, current list: [[ava-rules]]):
- Fonts: "Resident Evil" look everywhere (refont.js = Tahoma Bold no-AA stretched x1.25); captions pixelated (9px x3) and ~20 % smaller than first try; NO channel header at the top; end card text in typewriter (Courier) with an examined-object 3D model (e.g. boarded window) just above it, "NEXT:" not "NEXT WEEK:".
- HUD = remake ECG mixed with the RE2 CONDITION panel (`Ref ava bread/re2-health.webp`): grey bevel, name plate, green screen, Fine/Caution/Danger.
- No Russian text (translate to English); jokes in English; no "(the polite version)"-style sub-captions.
- YOU DIED in classic RE style (red-tinted freeze, red serif with drips, CONTINUE?).
- Props/sets need real low-poly texture detail (couch, window); check Ava's texture for stray lines.
- SFX: user likes Dino Crisis sounds (`assets/dino-crisis-sfx`: default sound, radio beep, chapters of "The Sound Effects Of Dino Crisis"); use them creatively + Freesound CC0. Not monetized.
- v1 review: transitions must be seamless (white flash ramps in/out, no hard pop); YOU DIED black is translucent (~86 %, scene visible behind, like the ref); opening with a pistol reload; RE props in sets (First Aid Sprays, green/red/yellow herb pots); zombie voices = Resident Evil sounds (`assets/zombie-sfx-yt/seg`, YouTube 4JCoB0GUIVs from 1:20).
- Mix in STEREO measured at -14 LUFS (a mono file read 3 dB louder on platforms).

**Format change (user, 2026-10-29, after ep2):** new series "AVA: DAY 1" adapting the niche winners the user listed (dontopenit.stories 7M, survivenight1 2.2M, drawn.tosurvive 1.76M, nionarratives 1.6M; analysis + transcripts in `fuentes/zombie-nicho/`): 2nd-person situation in a place with an advantage and a trap, clock/DAY counter, real survival facts with numbers, twist + binary choice ending ("comment, most comments decide Part 2"), serialized parts, a pet later. RE mechanics as the storytelling devices (ITEM screen = supplies math, typewriter save = clock, FILE = scary note, door-loading transition, YES/NO menu cursor for the choice, YOU DIED = bad ending) + RE easter eggs (visual only, no trademarked names in titles). Ep3 = "The Police Station" (RPD nod).

Next: same 23-bone rig names as zero-fem so `pieces/zero-fem/anim/build_anim.py` actions can be reused; face expressions; voice design; first episode storyboard. Rejected alternatives (CC-BY Sketchfab models, list in `fuentes/zombie-models/`).
