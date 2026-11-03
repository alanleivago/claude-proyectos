---
type: spec
status: active
tags: [yokai, style, checklist, kodamashorts]
relatedTo: [styles/yokai/STYLE.md, pieces/gashadokuro, pieces/corpo-seco, pieces/inunaki, pieces/umibozu, pieces/behemoth]
---

# yokai: the user's rules and workflow

This file collects every correction the user has given on yokai pieces (2026-10-22 to 11-01), so any machine can make this style. Read it together with `STYLE.md` (the look). Run this checklist at four points: story, look, storyboard and final.

## Channel and topics
- The channel is **kodamashorts**: 9:16, about 71 s, English first-person paragraphs on screen, no voice.
- **Rotation:** alternate a proven hit from TikTok @theredarchivesyt / @earlobehuman with a Japanese yōkai.
  - Authored IP (Trevor Henderson, SCP, creepypasta, analog horror) is fine, because copyright is not a blocker.
  - Earlobe's own topics are allowed if you retell them with a different but similar story and place.
  - Always write our own text and models. Never copy their frames or wording.
- **Warm-up phase (from 2026-10-27):** the account is new, so pick topics with fewer views on the ref accounts (under about 200 k). Save the big hits (Moon Woke Up, Watchtower, Giant Puppeteer, Qu, SCP-169, World Eater…) for later, and ask the user before using them.
  - To list views: `yt-dlp --flat-playlist --print "%(view_count)s|%(id)s|%(title)s" https://www.tiktok.com/@theredarchivesyt`.
- **Done so far:** jorogumo, behemoth, umibozu, floating-teacher, inunaki, corpo-seco, gashadokuro, the-rake.
- **Lighting (user, 2026-11-01, from earlobehuman refs):** keep interiors near black, with one practical light per shot (lamp, embers, match) that flickers (`flick`), and a damaged stuttering light in the hook (`broken`). See pieces/the-rake.
- **API review:** `python tools/revisar_render.py <video> --reglas styles/yokai/RULES.md styles/yokai/STYLE.md`. The video goes first, because `--reglas` takes the rest of the arguments.

## Workflow
1. **Pick the topic.** Offer 3–4 options with views and let the user choose (they prefer clicking options).
2. **Study the reference.** Download the ref video with yt-dlp and make a contact sheet to take the idea from.
3. **Get the story approved.** Write about 10 beats, each with its exact English paragraph, plus the creature design options. Wait for approval.
4. **Build the piece by copying the newest piece's `src/`**, currently `pieces/gashadokuro`. It has the rigs, `holdProp`/grip, IK, ykCard/ykSeal/ykBadge, grass, trees and textures. Don't rebuild systems that already exist.
5. **Self-check the creature:** render it isolated (side and 3/4) and fix the teeth, floating parts and silhouette before any board.
6. **Run the pre-board QA** (see below). Then make `storyboard.png` with a sound note on each panel, show it, list the weak points and wait for approval. Never export before the user approves the board, and that includes revisions.
7. **Export and add the sound.** Export with `export.mjs --share`, then do "sonido pro" (see below).
8. **Run the final QA:** review.mjs, the earshot timeline and critique, the frame scan, and `tools/revisar_render.py` through the API.
9. **Do one fix round, for real failures only:** clipping, floating parts, text over the subject, or a story beat that doesn't read. There is no second polish round: list the remaining minor items to the user and let them decide.

**Speed:** the board should take under 1 h and the whole piece about 2 h at most. The user complained when pieces took 3 h.

## Look
Full detail is in STYLE.md. In short:
- **Resolution and shading:** 216×384, cel shading in 3 toon bands, lots of detail (code textures, props, life).
- **Palette:** cold teal, but keep the warm browns and never go full cyan.
- **The "oppressive" feel is the 2×2 warm dot screen** (`YK.DOT`), not darkness. **Never a vignette.**
- **Lighting:** warm point lights (lamps, lanterns, tail lights) against the teal.
- **People wear Japanese clothing:** kasuri or hanten, obi, straw hat (sugegasa), mino, waraji.

## Creature
- Weird and unsettling, never cute. Match the source design closely.
- **Yōkai touches:** shimenawa with shide, ofuda, rust stripes, plus something evil (a red pupil or glint).
- **No floating bits:** spikes, plates and ribs must all connect, a neck must join the head, and a ribcage needs a spine and pelvis.
- **Teeth:** based at the gum, tips toward the other jaw, inside the mouth.
- **Silhouettes:** gentle curves, not waves or beaks, unless the design calls for them.
- **Sockets:** asymmetric and cracked, so the face doesn't read as a clean trefoil or emoji.

## Hook (0–5 s)
- **The creature:** big (at least 35 % of the frame height), in the upper half above the paragraph, lighter than its background (rim light, moon, fog) and moving within the first 2 s.
- **The first line** is a warning or a rule, readable by about 0.5 s.

## Text
- The paragraph covers y≈1150–1450 at 1080×1920, and **nothing important goes under it**: not the creature's mouth, not the key prop, not feet.
- Use a direct, big, readable shot for every story beat. No mirror shots or tiny insets.
- If a beat's text describes a mirror and the shot changes, update the text too.

## Card
- `ykCard`: stars on black, a striped beige frame, the print drawn very low-res (about 90–132 px wide), then the name and the seal.
- **The print comes from Flow (Nano Banana Pro) through the srz-google-flow-mcp tools**, never flow-auto.
  - Open a new project and upload earlobe's card prints `references/earlobe/card1-4.png` as style refs (gitignored third-party media: copy that folder to the other machine by hand), plus a creature design ref.
  - Generate one image per call and make 2–3. Keep the one whose design matches.
  - If a ref upload fails, say so. Never fall back to inventing a design that doesn't match.
- **Seal:** the same small red square every time, with ONE pixelated kanji for THAT creature (犬 Inunaki, 屍 Corpo-Seco, 骨 Gashadokuro). Never two glyphs, never the same glyph in every piece.
  - If the 7×7 raster blobs the glyph, add a hand grid to `YK_SEALG` in kit.js.

## kodamashorts badge (end)
- `ykBadge(asset('kodama.jpg'), 'kodamashorts', CX, 290, …)` from about 66.2 s, centred at the top.
- The navy woven pixel plate STAYS. Only the profile photo's black square is keyed out. `template/assets/kodama.jpg` is the photo.

## Bodies, props, camera (the user catches these)
- **Hands:** the thumb on the correct side, palms the right way.
- **Props:** held objects (lantern, sickle, goad, ladle) sit IN the fist at the grip point, never beside it.
- **Contact:** nothing passes through anything (body through vehicle, arm through body, fingers through ground). Feet stay on the floor.
- **Vehicles:** place people after the vehicle's final pose each frame, so they move with the boat or cart.
- **Camera:** never inside geometry or under the ground. Nothing near the lens.
- **No logarithmicDepthBuffer with custom ShaderMaterials:** it breaks depth.
- **Hero hands** in close-up need real detail.

## QA before showing ANY board
The scope is EVERYTHING: every object, motion, transition, prop, character, camera, light, text and story beat. The user should only judge taste, never find bugs.
- **Numeric pass every 0.25 s:** camera vs ground and geometry, feet height, arm reach, props in the fist, body vs body, fingertips vs ground. `tools/scan-example.mjs` is the gashadokuro version: adapt its checks to the new piece.
- **Frame-by-frame pop scan:** diff every pair of consecutive frames (scan mode in scan-example.mjs) and look at the outliers. The usual causes are instancing or frustum culling, shadows, the near plane, and visibility toggles.
- **One visual pass** over stills of every beat at phone size.
- **Tools:**
  - `tools/dbg.mjs` renders custom views and debug cameras.
  - `tools/review.mjs` is a copy of the animate skill's review with the drawtext filters removed (the Mac's ffmpeg lacks drawtext). With a full ffmpeg, the skill's own review works.

## Sound ("sonido pro", the default)
- **Sources:** Freesound CC0 (`sound/fs.py "query" n`) plus Wikimedia Commons beds (`commons.py`), plus a code layer in `sound/mix.py` (drones, bells, hit boom, clusters).
  - fs.py needs the `FREESOUND_API_KEY` environment variable. Never print the key.
  - Filter by the CC0 licence.
- **Choosing recordings:** use earshot (`rank` → `find` → `realness`), and write `picks.json` and `CREDITS.md`.
- **Sync every sound to its visual event:** steps on the walk cycle, a cart sound that stops when the cart stops, the bark split on the hit.
  - Check that no recording contains its own event at the wrong time. In inunaki an "idle" file had a car arriving inside it at 24 s while the car arrived at 9 s.
- **The hit:** exact digital silence 45.0–45.6, then THE HIT as the loudest moment, and the ending decays.
- **Levels:** −16 to −14 LUFS, true peak ≤ −1.4 dBTP after AAC.
- **Check:**
  - `earshot timeline` for sync.
  - `earshot critique`: ignore its launch-film flags (music presence, onset density).
- Recordings (.ogg/.mp3/.wav) are gitignored. On another machine, re-download them with fs.py using the ids in each piece's `sound/picks.json`.

## Machine notes
- **Tools outside the repo:** the animate skill (`~/.claude/skills/animate`: build, still, storyboard, export, review), playwright (global npm), ffmpeg, yt-dlp, earshot, and the srz-google-flow-mcp server must be installed on the machine.
- **Exporting on Windows:** `export.mjs --gpu` uses ANGLE d3d11 there (gpu.mjs).
- **References are gitignored** (third-party media stays out of the repo): `references/tiktok/` (re-download with yt-dlp) and `references/earlobe/card*.png` (copy by hand).
