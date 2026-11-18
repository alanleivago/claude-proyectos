---
name: mechayuki-rules
description: APPROVED level and every rule/check the user asked for in the Mechayuki (@mechayuki) TikTok videos — run all checks before every final render
metadata:
  node_type: memory
  type: feedback
  originSessionId: b19cd1d9-332a-4ffd-91ff-b618e0ca55df
  modified: 2026-11-05T12:25:55.141Z
---

Approved bar (2026-10-27): `pieces/digger-01-fridge/digger01_megagirl_v3.mp4` ("perfect now"). Every new episode must be at least this level. Pipeline: digger-01-fridge (engine/film.js, voz-studio scripts, audio/scripts music+mix, render_film.mjs, LOG.md). See [[digger-channel]], [[zero-fem-model]].

**Why:** the user reviewed v1→v3 and each item below was an explicit correction; repeating them wastes rounds.
**How to apply:** build every episode with these rules and tick each one on start/mid/end stills of EVERY shot (review/ contact sheets) + earshot BEFORE the final render; write a per-shot PASS table in LOG.md.

FORMAT BACK TO ARTIFACTS (user 2026-11-05): the cat.explains.it format (#06 bathing, #07 GPS, #08 music) did NOT perform well, so it is dropped. Shorts are again the artifact format (ep01-#05 style): she FINDS a human artifact in a VARIED location (different biome/place each episode, creative discovery) and explains it. Keep all the picture/sound/delivery rules below; the cat.explains.it lines are history only.
OLD FORMAT, DROPPED (user 2026-11-01): make Mechayuki shorts like TikTok @cat.explains.it ("How people [did X] before [Y]": problem→solution chain, she tries/wears each historical solution in 3D, progress meter HUD, cut-aways, etymology/fun-fact ending; analysis in fuentes/cat-explains-it/). EVERYTHING with volume, NOTHING flat: the ref's flat 2D cartoon cards must be rebuilt as 3D PS1 scenes/panels.
cat.explains.it-format lessons (short #06, 2026-11-02): each solution in its OWN recognizable set (never the same room); she physically TRIES/WEARS every solution; historical figures = an existing good-looking NPC + costume pieces (crown, cape…), never a new custom model (custom Henry VIII looked horrible); open with time first ("Five hundred years ago, there were no X… so…").
Shorts max 1:20 (80 s) from 2026-10-31 (user) — script ~200 words max.
Final files named with the video's TITLE (user 2026-10-31), for shorts AND long videos: "<Title>.mp4" + "<Title>.png" (thumbnail/cover) in the piece folder; strip characters Windows forbids (? : " / etc.).
Delivery (user 2026-10-31): every short ends with a viral title + a vertical 1080x1920 cover in the approved thumbnail style (see [[long-video-delivery]], ref pieces/expedition-01-bedroom/miniatura_A1.png).

Workflow (ep 02 feedback, 2026-10-27)
- ALWAYS send the storyboard (+ style frames) to the user and wait for approval BEFORE rendering the video.
- A video never starts and ends in the same place with the same shot (like sinaboto: different locations/framings for the opening and the ending).
- ALTERNATE FORMATS (user, 2026-10-27): not every episode is "I found an artifact". Mix the Digger format with sinaboto-style episodes that open straight with the hook "If you [do X]… you have a Y." (no "Operator… I dug up" frame, no find scene). Decide the format per episode and propose it with the script; ep03 (lock) stays as an artifact episode.
- Render rounds (user, ep04 + Exp01 v2, 2026-10-31): render, run revisar_render.py, FIX every valid flag yourself, re-render, then show the user (at most one self-fix pass; no endless v2/v3 loops). Never show a render with known review flags left unfixed — the review exists so the user doesn't have to list them.
- NEVER put "!" in any TTS text (not only "Operator"): Exp01 v2 "Operators!" at the ending sounded horrible. Use "…" or ".".
- Vary HOW she finds the artifact each episode (ep 03 feedback): not always digging with the shovel — invent a creative discovery (metal detector, melting ice block, snowplow, drone, falling out of a tree…). Check the previous episodes' openings and never repeat one.
- Write the Operator comment at 35-40% of the script (ep 02 had it at 58%).
- Opening "Operator…": NEVER use "!" (VoiceStudio changes delivery AND timbre -> sounds like another voice). Reuse `pieces/voice-fx/megagirl_operator.wav` (approved ep 01 v3 word) spliced in silence (`digger-02-toilet/voz-studio/scripts/splice_operator.py`), and pick any new take by speaker similarity to approved paragraphs (`speaker_sim.py`, WavLM-SV).

Voice and script
- Never write the opening as "Operator!" (the exclamation makes VoiceStudio change the voice's timbre); use "Operator…" like ep 01, or the reusable approved clip pieces/voice-fx/megagirl_operator.wav.
- The opening "Operator…" must sound energetic, not flat/sad; "Operator X asks" must sound natural (not robotic) and never clip a word ("asks" got cut) — regenerate those takes and listen/measure.
- Megagirl voice (user clone baab32b2) only, CLEAN chain (HPF ~170 Hz + gentle comp + -14 LUFS). No 'digger'/retro filter (sounds robotic).
- Questions must sound like questions (rising pitch): check the contour; the TTS fails on wh-questions → regenerate or PSOLA ramp on the last word.
- Whisper-check every line against the script (it once said "hit them" for "hid them"); never cut inside a word; give reaction words ("Gross!") room with a pause + reaction shot.
- 80-100 s is fine; ~2.7 words/s. Fixed opening/closing lines, Operator comment at 35-40%, "This is a…" labels.

Picture
- She must be animated and the world must react: dynamic effects for actions (e.g. the snow hole grows with each shovel stroke, snow flies and piles up; poured material visibly streams out).
- Every action must read clearly (what is she doing? what is in her hand? clear props, e.g. leftovers = recognisable takeout box/plate).
- Hands never pass through objects; props stay in hand; objects sit ON surfaces (no floating holes or props).
- Ep03 v1 corrections: pushed/carried props stay ON the ground and touching her hands (the rock sank and drifted away); every action has an SFX (the bar on the door); doors complete down to the floor with detail (planks, hinges, frame) — nothing flat; historical/diagram scenes with volume and contrast, never flat planes; NPCs with correct knees (the thief's legs bent backwards) — check walks in profile; tools IN the hands (the lockpicks); an open door shows a real interior; she is never cut off at the edge; keys/props complete in frame and never passing through the hand. Every action must be unmistakable (melting the ice: visible beam).
- Ep04 storyboard: don't saturate everything with snow — add green areas (grass, trees, gardens) in every episode; she never passes through the bed/furniture when lying down; NPC hats in the PS1 style, attached to the head (no floating).
- Ep04 storyboard feedback (2026-10-29): too much snow in every episode -> the overall balance must be GREEN (grass, leafy trees, bushes, gardens/flower pots, ivy, green valleys); snow only where the story needs winter. Lying/sitting in bed must never pass through the bed or the quilt (use the rig clips sleep_lie / wake_sit_up / slap_snooze with the root on the mattress, duvet arched over the legs; check from the side and above). NPC hats: low poly PS1 with small textures like the NPCs, sized from the measured head, attached to the head bone (Bone001), no gap/float/hair poking through.
- Overlays stay inside their frames (e.g. water inside its circle); scan/diagram boxes small and clear.
- Object/term labels: readable pixel font (engine/pixfont.js), spaced letters, moderate size ≈ caption height — never too big.
- Expressions must match the line (real disgust face for "gross", etc.); paint new cells if missing.
- Poop is drawn the anime way: the swirl poop-emoji shape (brown, coiled, often with a cute face), never realistic blobs.
- Plenty of FX like the refs (shiver lines, cold puffs, sparkles…); her shadow fairly dark; face visible (avoid profile/hair covering it in key shots).
- Captions: one word, Pixelify-style pixel font with the measured pop-in (0.86→1.05→0.98→1.0).
- Ending: no black end screen and no "more soon" text; the outro (MECHAYUKI, artifact number, follow CTA, small) goes over her goodbye shot.

Sound
- Music NOT pure chiptune: original playful plucky track with a real bass line and soft drums (~105-112 BPM, major), ~7 dB under the voice, -12 LUFS master / TP ≤ -1 dBTP (user asked for louder in ep03); the pause after the opening "Operator…" ≈0.4 s, no clipping; real CC0 SFX on actions; check with earshot.
- Credits: only CC0/CC-BY assets, CC-BY listed in the TikTok description (LOG.md).
