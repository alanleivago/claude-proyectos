---
type: note
status: active
tags: [the-rake, yokai, storyboard, qa, lighting, earlobe]
relatedTo: [pieces/the-rake/brief.md, styles/yokai/RULES.md, pieces/gashadokuro/LOG.md]
---
# LOG: the-rake

## 2026-11-01: first build up to the storyboard
- **Reused** from pieces/gashadokuro: render, rig (poseP, grip, holdProp), cedars, kimono, textures, walk.
- **New:** `src/house.js` has the minka set, the Rake rig (two-bone IK crawl, claw tips clamped to the floor or futon with `surfY`), the futons, sleepers, ejiko, match, torn panel, scroll and ofuda.
- **Creature self-check:**
  - Spine bumps floated above the back. They are now placed on the real surface (chest ellipsoid or belly radius).
  - The shoulder joints read as mouse ears in front view. They are smaller now, and the head is lower and further forward.
  - The thighs were too thick. They are thinner now.
- **QA:**
  - The numeric pass every 0.25 s (camera vs floor and walls, claws vs surface, nothing near the lens, her feet) found the hind claws 4 cm into the floor. The ankle was raised, and the rerun is clean.
  - The frame-pair scan found camera shake in the run shot, because the camera followed her bob and sway. It now follows a smooth path.
- **Card:** a new Flow project (Nano Banana Pro) with gashadokuro's print as the style ref, because the earlobe refs aren't on this PC. The first generation matched the design. Seal 爪, with a hand grid added to `YK_SEALG`.

## 2026-11-01: user notes on the board: a more disturbing face, less light, flickering lights
- The refs are 5 earlobehuman videos (`references/tiktok/earlobehuman/ref1-5.mp4`; Kunekune, wheel, whale, Bridge Worm, skeleton).
- What they do:
  - The frame is mostly blue-black.
  - Each shot has one practical light (a bulb, a lantern, fire) with a hard falloff.
  - The light flickers.
  - The disturbing face is a wide grin of many long human teeth on red gums, with sunken raw eye holes.
- **Face:**
  - A grin from ear to ear: 16 upper and 14 lower flat teeth on red gums, on the face surface.
  - The jaw opens wider.
  - Raw red-brown flesh round the sockets.
  - More, darker veins on the skin.
- **Light:**
  - The `inside` preset: hemi 0.14, moon 0.32, exposure 0.95, black fog at 1.5–9 m.
  - The shōji paper is dim teal.
  - A lit andon by the futon's end is the main warm light (`lamp`), with a deterministic flicker (`flick`: a breath, a shiver and hashed dips).
  - The embers and the match flicker too, and the rim lights are cut to a third.

## 2026-11-01: round 3 (user: fix the listed weak points + a damaged flickering light at the start)
- The damaged lamp is `broken(t)`: it stutters on and off in 1/20 s steps, in hashed bursts, with dead spells. It runs at full damage in the hook and at 0.6 in beat 4. The andon was moved behind the creature, in frame, with a glow sprite.
- The partition paper is darker (match shot, run shot).
- The sockets are narrower and more slanted, so they read less round and cute.
- The "crown" over the head in the hit was the ribcage seen end-on behind the head. Fixed with a lower camera and the head raised (dip −0.07, arch −0.04). The shimenawa now sits up near the head.
- Last shot: moon 0.22, so the tatami no longer glares.
- Numeric pass: clean.

## 2026-11-01: export + sonido pro + final QA
- **Export:** `export.mjs --share --gpu` (ANGLE d3d11, 14 ms/frame, 21 s).
- **Sound:**
  - 19 Freesound CC0 queries, picked with earshot rank → find → realness (`sound/picks.json`). fs.py now reads `~/.freesound.json` (utf-8-sig) when the env var is missing.
  - Run pick.py with `F:\earshot\.venv\Scripts\python.exe`.
  - `sound/mix.py` puts each sound on the picture's clocks:
    - lamp sputters on each `broken()` drop-out;
    - neck cracks on each `jerk()` tick;
    - claw ticks on every crawl landing;
    - her bare feet on walkWoman's contacts;
    - match 32.82, tear 34.83, whisper 43.35.
  - Exact silence 40.0–40.6. THE HIT at 40.6 is the loudest 100 ms.
- **AAC overshoot:**
  - −5 dBFS sample peak became −0.1 dBTP after AAC.
  - Fix: a 4×-oversampled true-peak limiter at −4.5 dBTP plus a 15 kHz low-pass, before loudness make-up.
  - Final: −15.2 LUFS, −3.9 dBTP after AAC.
- **review.mjs:**
  - text PASS; dead beats PASS; all cuts on grid.
  - Arc 4/5: "gift p90 ≥ peak p90 + 1 dB" is short (−13.1 vs −13.8). Envelope moves didn't widen the gap because the limiter flattens the p90s. Left as is.
- **revisar_render (API):** CASI. The real failures were fixed in one round:
  - The rake was re-posed after its leap: `crawlPose(Wd, 32)` was being called just to read p0.
  - The torn hole sat right behind her head in the run, reading as spiky hair. Fixed by moving the camera aside.
  - In the day shot the hole was black and read as a floating spiky shape. Fixed by lighting the baby's room.
  - The cradle sat under the text. The camera now aims lower.
  - The crawl was too dark. The lamp and embers are up.
- **Left (minor):**
  - The exterior has little detail.
  - The scroll drawing reads as a frog.
  - The last silhouette reads heavy.
  - The print is 150 px wide.
  - There is ochre floor under the lamp in shot 5.
- **earshot critique (fast):** close, 18/21. Flags:
  - onset density and final moment (launch-film flags, ignored per the yokai rules);
  - sync 31% (the lamp flicker counts as visual events).
- Sent to Telegram.
