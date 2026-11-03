---
type: log
status: active
tags: [punkpolyshorts, onoda, video-2]
relatedTo: [pieces/lps-onoda/guion.md, pieces/lps-own-face/LOG.md]
---
# lps-onoda — "The Soldier Who Fought For 29 Extra Years" (punkpolyshorts #2)

## 2026-10-30 — soldier look approved
- Template copied from lps-own-face (kit, build, post, assemble, retro_eq).
- `tex/make_soldier.py`: every expression atlas recoloured olive in 3 wear stages (`tex/soldier/w0..w2`). Use it through `K.Kaneda(..., faces_dir=...)`.
- `K.field_cap(k, flaps=True)`: an IJA field cap fitted by raycasting onto the Head mesh, with straight sides, a back drop and the havelock. The user approved the flaps.
- `K.rifle()` + `K.attach(o, k, bone)`: Arisaka slung on the back. Test sheet: `test/soldier_sheet.png`.
- Rules for this video: wobble grid 180, more expressions, more characters. The forest is built following fuentes/blender-bosques.

## 2026-10-30 — voice
- `voice/gen_voice.py`: 17 lines × 3 seeds with "3d cartoon"; Whisper picks the take. The TTS read "Onoda" at the start of a sentence as "A nota", so l13 and l16 were regenerated as "Oh-noh-dah" and the takes picked by ear (l13 s2, l16 s3).
- `assemble.py` FIX map turns ASR spellings back into the script's words in the captions (two, ten twenty, a panda, lieutenant, onoda).
- Voice 46.3 s → `voice/voice_retro.wav`. Facts checked against Wikipedia (Onoda, Suzuki, Taniguchi).

## 2026-10-30 — storyboard v2 (user feedback)
- No more Kaneda recolours: `tex/people.py` turns 8 Flow passport faces into distinct people (comrades Akatsu/Shimada/Kozuka, Suzuki, and a 1945 crowd: woman, sailor, old man, worker).
  - Eye positions come from `tex/locate_eyes.py` (API).
  - Flow's B&W soldier photos are colourised.
  - Each person gets their own clothes and build (`person()` in build.py).
- Map: low-poly relief made from `props/map_height.png`, with depth-shaded sea, wave streaks, beaches, forest and mountain colours, chunky clouds and a dashed flight path.
- Jungle: `jungle.py` (subagent) — alpha cutouts via GREATER_THAN + DITHERED, fog through the JungleLook node group.

## 2026-10-30 — sound + post (approved lps-own-face config)
- `out/make_cues.py` → `out/cues.json` (55 cues, ~71/min, from timing.json + build.py timings) and the music ducking (`buses.music.auto`: 0 dB on speech, +4 dB in pauses).
- `audio/design/sfx.json`: real Freesound recordings (new ones in `audio/assets/manifests/new.json`, trims picked with earshot find) + the pops/whooshes/tick/cloth of video #1. No ambience.
- Mix: `bash out/audio-review/mix_variant.sh waiting` (mix.py --no-master, voice +7 dB, master −14 LUFS); `out/audio-review/levels.sh` measures the stems at master scale.
- `post.py`: video #1 captions only; the caption block that says a number hides while its 3D number is on screen (`HIDE = "spoken"`: only "in 1944" and "in 1974"; the two "29"s are framed half off-screen, so their captions stay; "all" would leave ~14 s of speech uncaptioned).
- Output `renders/lps-onoda.mp4` (1080×1920, 30 fps, 1390 frames, CRF 18, AAC 192k). Levels at master scale: voice ≈ −14.1, music −25.0, SFX −35.1 LUFS; master −14.0 LUFS, −3.1 dBTP. earshot critique: close (only major item = salient hit density 1.86/s, the voice).
- QA: `revisar_render` gives CASI (the "29" is cropped off-frame, the s12 face-off framing, the bookseller's neck, the map stripe artefact, the backpack slab, the s08 montage). `out/qa/popcheck.py` flags f695: a lens jump at the render-batch boundary (s10 has no lens set, so it inherits 26 mm from s09 only in the batch that rendered s09). Fix: re-render 660–694 in a fresh process. Every other flag is an intended in-shot cut.

## 2026-10-31 — v2 picture fixes (build.py) + full re-render
- s01 rifle: `aim_rifle(pitch 0, yaw 55°, grip y −0.30, lead 0.24)`, no BVH overlap with the body (s12 keeps the defaults).
- Campfire: 9 stones, 2 logs, 3 flickering emissive cone flames (`fire(t)` in apply). Map: height map smoothed and flattened under the LUZON label. The seller's head sits 3 cm lower, into the collar. Suzuki: shaped pack (body, bulge, flap, pocket, side pockets, shoulder straps).
- Coordinator's edits are included: lens reset per frame, "29" above the head, wider s12.
- Re-rendered 0–1389 in 5 fresh processes aligned to shot boundaries. post.py moves the caption down (`CAP_Y`) in s02, s06, s11 and the s14 map part.
- QA: the pop check shows f695 is gone; the remaining flags are intended in-shot cuts. revisar_render: CASI. Still open: "29" cropped at the top, s12 framing, Yeti poster, s07 crumple, s08 montage, crowd and seller heads, tear, static s13.

## 2026-10-31 — v3 (coordinator pass)
- "29" via `number_by_face()`: camera-space, beside the face, 40 % of the frame width, fixed side. Fully in frame in all checked frames (world_to_camera_view); its caption blocks hide again.
- s12: side two-shot. Onoda faces −Y, the rifle is pitched at Suzuki's nose and Suzuki is placed so the muzzle stops `NOSE_GAP` = 5 cm short. Hands up beside the head.
- Yeti poster redrawn shaggy (`tex/make_props.py`), cut on "Yeti" (the whip SFX moves with it). s07: the sheet scrunches, swaps to a lumpy ico ball printed with leaflet scraps, then the toss.
- s08: tear-off calendar 1945/1946/1955/1965, flipping on each beat. 4 wear stages: `make_soldier.py` w0–w3, bigger patches; the 1974 shots use w3.
- s16: an alpha tear under the eye, sliding down. s13: orbit −0.7→+0.5, push-in and a punch on the head turn, stern→skeptic.
- Re-rendered s01, s07–s09, s11–s13, s15–s17 in fresh processes. The pop check flags only intended cuts. revisar_render: CASI.

## 2026-10-31 — v4 (user feedback)
- Wobble back to video #1: PS1_GRID 240.
- Real images on the walls (`tex/make_eggs.py`, sources in `tex/eggs/src`): Bao Li panda chewing bamboo, the Patterson–Gimlin Bigfoot, Onoda's 1944 portrait on the For Dummies cover, Roll Safe on "Surrender? In this economy?".
- s02 plane: `r.plane.map` −1 dB, HP 70 Hz, so the engine body sits under the voice band; earshot tags it as aircraft/vehicle in the mix.
- l08: `voice/gen_l08.py` generates "So he kept going." / "One year." / "Ten." / "Twenty." as separate "3d cartoon" takes, joined with ~0.25/0.35/0.35 s pauses (the fast take is kept in voice/takes/l08v). assemble + retro_eq were re-run; the voice is now 48.23 s, END 1447. Old voice and timing are in voice/v1_fast. Word prefixes are now "ten"/"twenty". The calendar holds each page until the next word.
- Full re-render 0–1446 (6 shot-aligned processes), new cues and remix.
