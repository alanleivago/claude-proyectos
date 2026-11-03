# torre-sur — log

## 2026-11-02 · look check
- Started from pieces/grow (core3d, people, skinbody, hands, helpers, lit, shots, main). New: `toon.js` (cel ramp + ink + DOF post), `cast.js` (office people, ties, Diego), `world.js` (stTower: office 89 + North Tower with proud columns + Lower Manhattan + plane; stStair: Stair A switchbacks; stLobby: sky lobby 78), `hud.js` (clock, place, tag, floor counter, subtitles), `scenes.js` (window, stairs, lobby).
- Look frames t=4 / 26 / 36 → look.png. Render ~1.5 s per frame (3 frames in ~4.5 s incl. startup).
- Fixed on the way: hand bones/vessels were inked (hidden now); city instances capped before reaching the foreground (N 2600 → 14000); plane nose-on and out of view (path re-aimed from the NNE); far ink fade so the North Tower's columns don't turn into black stripes; Diego out of frame in the lobby.

## 2026-11-02 · restyle (look rejected: too toon)
- Dropped the cel ramp and the ink pass; `toon.js` is now `renderSoft`: matte MeshStandard, half-res depth pass → SSAO (blurred, multiplied) + DOF mask. HUD text-only like the reference; subtitles on a blurred band; PISO counter minimal, 81 at t=26.
- People: head 0.128 → 0.112, eyes smaller, sculpted short hair (cap with volume + fringe + nape), belts; Diego without glasses (light-blue shirt, red tie, side part); index-finger pointing (`pointFinger`).
- Window: BAY 1.5 / column 0.6 beige, North Tower moved to show its corner, flat window-grid façade, hazy city, plane at 120 m/s so it reads bigger; white mug with own logo, hand through the handle with a white sleeve.
- Stair: smooth light-grey concrete, pale glow nosings, yellow wall line + yellow rail, over-the-shoulder camera down flight A (fixed stairPath going up a level for negative distances).
- Lobby: tiled ceiling, brighter floor, sign band above the doors, 70 people, Diego points up beside (not over) the sign.
- look.png + look-vs-ref.png; ~1.6 s/frame.

## 2026-11-02 · storyboard on the voice
- VOICE injected (voice.json, 67.709 s, 1625 frames); piece.json `voice` set. SHOTS cut on line times (VL/LT0/LT1/VW); clock t=0 → 8:46:34.4 (hit 5.6 s = 8:46:40), race 33→35 s to 8:54:58, 9:02:47 at 49.3, red 9:03:02 at the cut 64.2.
- New: sets2.js (fireball/gash/plume/papers/debris, office cast, smashed mug, POV left hand + 2001 phone, core: elevator lobby with opening doors + packed car + car going up with live indicator, POV right hand pressing). City rebuilt (Manhattan/Brooklyn/NJ shapes over water, brick walk-ups, FiDi, Midtown, Governors Island, Statue of Liberty). South half of floor 89 (mirror). Collars, muted hair, bigger lobby sign, crowd at eye level.
- Mouths from VOICE words (mouthOf); subtitles from VOICE words. Board: 19 panels, ~1.0 s per full-size frame.

## 2026-11-02 · board conditions + animation
- Panel 2: fireball as ragged 3D lumpy clusters (lumpyGeo, emissive while burning → sooty), smoke plume clusters drifting SE, debris and papers, a radial orange glare (no full-screen wash).
- Panel 7: Diego faces the camera properly (yaw ≈ π), head raised on the neck (+0.025), slimmer lower collar.
- Panel 13: POV legs and shoes under the camera; the view sinks to them during l15.
- Panel 14: close camera on the open lobby car (lit car plane in front of the marble), Diego large, sign above.
- Panel 16: open aisle (no cubicles at x≈8), walk to the glass, tilt up to the burning North Tower and smoke.
- Panels 17–18: camera at the glass (bay -0.75), colleague in the next bay; look turns from her to the harbour and tracks the plane; plane 260 m/s, hit at 64.35 → fills the frame by 64.0–64.15; Statue scaled 2.2×; skirt thighs in skirt colour (no skin through).
- Hands: mug wrapped from the right (no handle contact), phone flat in the palm with thumb on keys, fingertip placed on the button face (tipTo), door push stops at the door plane (stopAt). Checked at 2, 5.5, 15.6, 17.5, 19.0, 21.05, 31.3, 32.5 s.
- Stair walk phase locked to the treads (one step per tread); crowd shuffles; cut tile checked (boss-shot runner spawning at the lens fixed).

## 2026-11-02 · export + review
- Frames 0–1624 rendered in six chunks (≤300 frames, 3 workers), muxed with ffmpeg (export.mjs settings: x264 slow CRF 14) + export.mjs --only-audio --share. renders/final.mp4 (52 MB), renders/share.mp4 (14 MB). Audio = voice over the placeholder score (sound is done separately).
- review.mjs: dead beats PASS (0 stretches > 3 s); word hits PASS; narration density FAIL (l02 3.8 w/s, l06 3.75 w/s — voice takes, not picture); story arc 1/2 (silence rule fails: there is no score yet); loudness -14.3 LUFS, TP -1.4 dBFS; text FAIL ×12 = the PISO counter's off-clip rolling digits traced over the tag (invisible in pixels; fixed in hud.js — digits outside the clip are no longer drawn; textcheck after the fix: 2 → 0 expected with the 60 px limit, the video frames are visually identical so they were not re-rendered).

| # | shot | t | PASS | note |
|---|---|---|---|---|
| 1 | window | 0–5.6 | PASS | plane right of the tower, mug below the captions |
| 2 | impact | 5.6–8.1 | PASS | 3D fireball clusters, glare, mug drop + smash on the carpet |
| 3 | react | 8.1–10.9 | PASS | Diego hands to head, aisle reacting |
| 4 | boss | 10.9–15.1 | PASS (weak) | boss small at the end of the aisle |
| 5 | call | 15.1–18.3 | PASS | phone flat in the palm, thumb on keys |
| 6 | elev | 18.3–22.9 | PASS | fingertip on the button, lit after the first press |
| 7 | full | 22.9–25.2 | PASS | Diego faces camera, packed car, pan to SALIDA |
| 8 | stairs | 25.2–29.7 | PASS | steps locked to treads, PISO 89→79 |
| 9 | arrive | 29.7–33.0 | PASS | 78, hand stops on the door |
| 10 | jump | 33.0–35.0 | PASS | dim + racing clock |
| 11 | lobby | 35.0–40.4 | PASS | crowd at eye height, ALTAVOZ |
| 12 | point | 40.4–43.3 | PASS | index up, sign readable |
| 13 | doubt | 43.3–47.5 | PASS | view sinks to own shoes |
| 14 | wave | 47.5–49.3 | PASS | Diego large in the lit car door |
| 15 | up | 49.3–54.8 | PASS | indicator 79→89, Diego talking |
| 16 | back | 54.8–58.7 | PASS | open aisle → glass → burning North Tower |
| 17 | window2 | 58.7–64.2 | PASS (weak) | colleague only at the start; Statue small; plane fills the frame 64.0–64.15 |
| 18 | part2 | 64.2–67.7 | PASS | 9:03:02 red, PARTE 2 |
