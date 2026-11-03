---
type: log
status: in_review
tags: [punkpolyshorts, saccadic-masking, kaneda-punk, video-3]
relatedTo: [pieces/lps-blind/guion.md, pieces/lps-onoda/LOG.md, pieces/lps-own-face/LOG.md]
---
# lps-blind — "You're Blind 40 Minutes A Day" (punkpolyshorts #3)

## 2026-11-01 — fact check, voice, storyboard v1 (waiting for the user's OK; no render, no mix)
- **Fact check:** at the bottom of guion.md. All 5 facts hold. "Three or four" is the top of the usual ~3/s, and "40 min" is a rough popular estimate (30 min to 2 h) that the script already hedges with "about". No wording changed.
- **Voice:**
  - `voice/gen_voice.py`: "3d cartoon" (227af074), 3 seeds per part, and Whisper picks the take.
  - Line 10 reuses the exact samples of "You're blind for about forty minutes every day." from line 1 (p01a). An "And" cut from its own take goes in front, so "forty minutes" is identical in both lines.
  - `assemble.py` (TEMPO 1.1) + `retro_eq.py` → `voice/voice_retro.wav`, 31.27 s, END 938.
- **Kit:** copied from lps-onoda: lpskit, post, assemble, retro_eq, people/paint_heads, mix_variant.sh, finish_v2.py. `photoprop.py` is copied from lps-lowpoly-test.
- **Props from Flow photos (ref/, magenta background):**
  - Lathe props (`loft`): the clock (handless photo + code hands; the second hand runs the chronostasis hold), the mug and the banker's lamp.
  - Alpha cut-outs: the CRT front (+ beige body boxes) and the gilded mirror frame.
  - `tex/despill.py` removes the magenta fringe.
- **Cast:**
  - Kaneda keeps his blue jacket.
  - `tex/make_eyes.py` makes the eye-direction atlases (`<base>_L/_R`) for the saccade gags.
  - Friend: a distinct person. The face is a Flow passport photo (`tex/flow/face_friend.jpg`), run through people.py, with her own `friend` outfit: mustard hoodie, black jeans, white sneakers.
- **Sets:**
  - Kaneda's room: standing desk, CRT, mug, lamp, wall clock.
  - Brain control room: 8 photo CRTs fed by `--feed` renders of what Kaneda sees; a lever pulled by the brain's noodle arm.
  - Eyeball cutaway: the eye snaps between 4 targets, and yellow jump lines stay drawn.
  - The #1 bathroom mirror set with the photo frame.
- **Easter eggs (`tex/make_eggs.py`, imgflip templates):** Distracted Boyfriend ("MY EYES / LITERALLY ANYTHING / THE LINE I WAS READING"), This Is Fine ("MY BRAIN, 3x A SECOND"), Monkey Puppet ("ME WATCHING MY OWN EYES IN THE MIRROR"), plus Harold and the Mona Lisa selfie from #1.
- **post.py:**
  - ps1_post dither BEFORE the captions.
  - s03 smear from `motion.py`.
  - One black frame on "blind" (s01) and 4 on "tiny blackouts" (s10).
  - The "40" caption blocks hide while the 3D "40 MIN" is on screen.
- **Self-check:**
  - `test/selfcheck_*.png` (props, friend face, mirror, eye).
  - Body vs desk: 10 cm clearance.
  - No held props in this video.
- **Board:** `review/board/board_a.jpg` (shots 1–5) and `board_b.jpg` (6–10), with key frames in `review/board/shot_*.png`.

## 2026-11-02 — storyboard v2 (user feedback)
- **Control room:**
  - The brain sits on a photo bar stool (`loft`) and faces the monitors.
  - Shots 4 and 5 now cut between two angles: from behind the brain (`cam_behind`, the screens it watches) and from the screens' side (`cam_front`, its eyes). The lever yank and the "ON TIME" lie are in the front angle, with the pupils darting via `gaze()`.
  - Bigger feeds: 3×2 CRTs at 0.62 m. "LIVE FEED" is fully popped in from the first frame.
- **Shot 8:** `Kaneda_blankp` is the blank stare with dot pupils, plus its L/R variants (`tex/make_eyes.py`).
- **Friend:** curly bun mesh (`add_bun`), parented to the head.
- **Mirror tint:** 0.12 → 0.04.
- **Shot 10:** the black cards slide in low from the right and never cross his face.
- **Wall pictures, mixed per set (all Flow):** gross-up Kaneda and gross-up friend (Ren & Stimpy / Courage style), a chicken-in-a-bowler eerie painting, a Renaissance potato, a googly-eye rubber duck photo, and "EYEBALL KART 2" PS1 box art. The memes stay.
- **Photo set pieces (`wallprop()`, alpha cut-outs from one Flow photo):** a door (room and bathroom), a window and a bookshelf (with a body box). The bar stool is lathed.
- **Dither:** ps1_post runs on every board frame before the captions; the 270×480 tiles keep the grid.
- **Board:** review/board/board_a.jpg and board_b.jpg (23 frames).

## 2026-11-02 — board v3 (user feedback)
- The gross-up Kaneda is replaced by `kaneda_selfie`. `build.py --selfie` renders the Kaneda model, happy, in front of a Flow Eiffel Tower photo, as a pixelated print captioned "PARIS 2019 :)".
- The gross-up friend is replaced by `goldfish`, an eerie Courage-style painting.
- **Black papers:** the s10 "blackout" cards were built as solid black emissive boxes (#060606) on purpose, so nothing was broken: no missing texture, no alpha, normals or dither problem. They are now white sheets: a thin box plus a top plane with a printed paper texture (a black frame and lines of print).
- Shots 1, 3, 6, 9 and 10 were re-rendered; board_a and board_b are updated.

## 2026-11-02 — final render (board approved)
- **Picture:**
  - `out/render_all.sh` renders every shot in its own fresh Blender process (2 workers), then post.py runs ps1_post → captions.
  - Pop check (`out/qa/popcheck.py`): all 16 flags are planned in-shot cuts or motions (f80, 161, 325, 428, 452, 483, 533, 615 and 869 are cuts; 167, 331–333 and 477–479 are the saccade, lever and glance).
  - After QA the captions in the face close-ups moved down to 0.80 H (`CAP_Y`), off the eyes.
- **Sound ("sonido pro"):**
  - `out/make_cues.py` writes 53 cues. New CC0 recordings in `audio/assets/sfx2` (manifests/blind.json): clock tick, iMac CRT off, a sheet of paper dropping. The rest comes from the lps-onoda library (symlinked).
  - Trims picked with earshot find.
  - Mix: `mix.py --no-master` + `finish_v2.py`, voice +7 dB, master −11 LUFS / −1 dBTP. At master scale the music sits at −22.3 LUFS and the SFX at −32.5, the same proportions as −25/−35 at a −14 master.
- **QA:**
  - earshot critique: "close". The only major item is salient hits at 1.98/s, driven by the voice syllables, the same as onoda.
  - revisar_render: CASI. Fixed: captions over the eyes.
  - Left as is: the friend's cheek smudge, Kaneda's boots below the desk, the meme partly hidden by his head, the s09 arrows half hidden. "About 40 minutes" is hidden on purpose by the 3D 40 MIN.
- **Output:**
  - `renders/You're Blind 40 Minutes A Day.mp4` (31.25 s, 1080×1920, 30 fps, CRF 18, AAC 192k).
  - `renders/thumbnail.png` (`build.py --thumb` + text).
  - CREDITS.md.
