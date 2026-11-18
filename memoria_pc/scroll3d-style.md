---
name: scroll3d-style
description: "scroll3d = Spanish remake of a \"how it works\" 3D explainer reference (Ref Scroll animations/*.mp4) — same shots and camera moves, paraphrased text, some elements changed; user records the Spanish voice"
metadata:
  node_type: memory
  type: project
  originSessionId: 62eb6334-9eb3-4f82-9565-e63613e0a978
  modified: 2026-10-21T22:23:30.425Z
---

Set 2026-10-16. Style folder: styles/scroll3d (built on pov3d's three.js engine, [[pov3d-style]]).
- Each piece replicates one reference video from `Ref Scroll animations/` (renamed 2026-10-18; 1 Shazam, 2 AirTag, 3 Google Maps, 4 video compression, 5 Face ID, 6 Tesla Roadster upside down, 7 same subject in a look close to ours). Done: #4 → pieces/compresion; #6 → pieces/roadster (shots/camera of 6, look like 7 but improved, improved car); #8 → pieces/aire (thrust vs grip, reuses the roadster world); #9 → pieces/escucha (phone listening myth, living-room world); #10 → pieces/tarjeta (contactless skimming); #1 → pieces/shazam.
- Keep the reference's shots, camera moves and duration identical; paraphrase all text into Spanish; change some elements (character, props, colours) so it is not an exact copy.
- I write the Spanish script (clean copy-paste text, "…" for pauses, [[script-format]]); the user generates the voice and sends it; I time the picture to it (cuts only in silences, [[voice-cuts-in-silence]]).
- Look: dark backgrounds, toon/clay low-poly 3D, one accent colour, karaoke captions in a dark pill at ~77% height (current word bright, rest grey), small mono labels ("ilustrativo", "esquemático"), data drawn inside the 3D scene.

- Sound (user, 2026-10-17): the same "Documentary Background Music for Videos" track as bitpix (from 4 s, voice.music -7), code SFX clearly audible (sfxBus ×2.2), plus a few quiet real recordings from sound-layer/kit (paper, soft whooshes, cloth thump, clicks, pops) that add without getting in the way — never noise beds. Built by `pieces/compresion/sound/layer.py` into audio/track-shaped.wav.
- End signature: "DOPAMENTES" (not ALTERBASE), centred on the screen.
- Louder (2026-10-19, asked twice): master -9 LUFS (piece.json "loudness"), bgm at voice.music -4 and 0 dB in the track shape, code SFX ×3.5. Crowds in shot cheer/jump at the big moments.
- Always (user, 2026-10-20): improve the animation of everything (people breathe, blink, look, talk with hands; springs on every pop; things never static), and EVERY transition seamless (no hard cuts: dissolve both shots with both cameras moving, or a match move).
- Voice option (2026-10-22): when asked, generate it myself with VoiceStudio voice "Scroll español" (profile 0381b8fe), steps=32, one take per paragraph; every take opens with a stray ~0.12 s blip at 0.10 s and room noise (−33…−42 dB) → pieces/shazam/voice/clean.py cuts after the blip, high-pass + afftdn + soft gate; re-transcribe and regenerate any paragraph that drops words.
- ALWAYS verify before delivering (user, 2026-10-22: "verifica estos detalles siempre antes de pasarme el video"): run styles/scroll3d/tools/qa.py (one-frame flashes, clipped word ends, stray blips, pause noise, broadband noise in the bed) and listen-proxy checks; never send with a FAIL. Known causes: InstancedMesh without instance colours at creation → white-field flashes in some workers; VoiceStudio clips the last syllable (use /generate with duration ×1.15–1.35 then rubberband back to the pace, gen.py); a gate between words cuts word tails (don't gate); noise-band SFX (long bandpass noiseHit, whooshes) read as background noise → avoid long noise beds.
- Captions the user likes (2026-10-22, ref 1): spoken words white, the CURRENT word yellow (S3.hl = true) + a step bar on top (s3Steps). If a ref shows a place in a grey monochrome look (people included), match it (greyOut in pieces/shazam/src/world.js).
- Reuse pov3d assets (user, 2026-10-21): for people or any element, take the pov3d builders when they raise the quality (people: pieces/oxigeno/src/scenes.js ~l.560–900, PG parts + personPose with cloth fold texture, hair, long hair; cars in pieces/giro; buildings/trees/props in pieces/oxigeno, agujero, asteroide). Only if they look better than the scroll3d ones.
- Transitions into/out of a detail (e.g. the sweater) must be seamless: push in until the texture fills the frame, dissolve into the matching world (XFADE in shots.js), and back out in one move, no hard cut.
- First piece `pieces/compresion` approved as "excelente" with those notes.

**Why:** the user asked for this in the session that created the style.
**How to apply:** for every scroll3d piece, transcribe the reference (faster-whisper on CPU, device="cpu"), log its shots at 1 fps, and match each Spanish line to the English line's time slot.
