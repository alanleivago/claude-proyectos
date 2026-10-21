# scroll3d — "how it works" 3D explainer, remade from a reference

A voice-led explainer in a simple clay-like 3D world on a near-black warm background: dioramas, mannequins, toy props, and the data drawn *inside* the scene (ghost frames, block lattices, arcs, cube columns, voxel fields), with karaoke captions and bold sans labels. Rendered with three.js r149 (`styles/pov3d/three.js`, global `THREE`) into an offscreen WebGL canvas, drawn onto the 2D canvas under the 2D overlay from `kit.js`. Motion on 1s, 30 fps.

**Proven on:** `pieces/compresion` (98.7 s, a Spanish remake of `Ref Scroll aniamtions/4.mp4`, video compression). Start the next piece from its `src/` (head.html with the `ANCH` time map, world.js, shots.js).

## What a scroll3d piece is (the user's rule, 2026-10-16)
- Each piece remakes ONE reference from `Ref Scroll aniamtions/` (1 Shazam, 2 AirTag, 3 Maps traffic, 4 video compression, 5 Face ID).
- **Same shots and camera moves**, same duration rhythm; the text paraphrased into Spanish; some elements changed (character, props, colours, wall, decor) so it is not a copy.
- I write the Spanish script (one line per English line, fitted to its time slot, "…" for pauses); the user generates the voice and drops it in `Ref Scroll aniamtions/voces/`.

## How to build one
1. Transcribe the reference with word times (faster-whisper on CPU: `WhisperModel(..., device="cpu")`; feed PCM from ffmpeg, not the file). Contact sheets at 1 and 2 fps; `ffmpeg select='gt(scene,0.25)'` for the cuts.
2. Write the script; after the take arrives, transcribe it (language "es", model "medium"), align words to the script lines (`voice/align.py`) → `voice.json`; pad the take with a 1.2 s tail → `voice/voice.wav`.
3. `ANCH` in the head: [reference time, Spanish time] pairs at line starts/ends and at the words both voices share (the words a cut or a move lands on). `refT(TT)` maps the Spanish clock to reference time; author every shot in reference time R with `camKeys(R, [[R, pos, target, fov], ...])`. Then camera moves land on the same words as in the reference.
4. Keep everything above the caption (y 1438 ± 44): frames and props sit between ~0.08 H and ~0.70 H.

## The look (what the user approved)
- Background `#0c0a08`, a dark floor with a warm radial pool under the subject. No tone mapping (`NoToneMapping`), `ColorManagement.legacyMode = false`, hemisphere 0.95 + one warm key with PCF soft shadows + a faint cool rim.
- Clay materials (MeshStandard, roughness ~0.85), code-drawn textures with relief: plaster mottling, wood planks, knit chevrons, painting, rug.
- One yellow (`#f2b632`) = "what changed", one cyan (`#3fd0d6`) = "motion / instruction"; white tags with black text for names ("Fotograma clave").
- Text: **Helvetica FreeSans Bold** for everything (`assets/FreeSans.ttf`, copied from `fonts/Helvetica FreeSansBold.ttf`; the build embeds it as a FontFace). Captions 54 px in a dark rounded box at y 1438; spoken words white, the rest grey; chunks ≤ 21 characters.
- Small grey notes for honesty ("esquemático: …", the arithmetic under a number).

## Pitfalls met
- Big outdoor worlds (a track hundreds of units long): the road flickered in and out on wide shots (coplanar ground/road/pad + depth precision) → `logarithmicDepthBuffer: true`, near plane 0.3, planes lifted apart (0.04–0.06) with polygonOffset.
- A crowd seen in a shot should react: instanced people jump on their own phase (`cheer(u)` in pieces/roadster/src/world.js) when something big happens.
- r149 `Color.getHexString(SRGBColorSpace)` returns linear hex → mix hex colours by hand for canvas textures.
- Coplanar faces z-fight (bezel vs room floor at y = 0): offset by 0.03.
- Looking obliquely into a deep diorama hides the picture → switch to a flat picture of the room (head-on render target) when the frame is treated as an image (block lattice, tilt).
- Labels near a frame corner run off a 9:16 screen: anchor them right-aligned at x ≤ 1040, and pull the camera back when a tag sits on a corner.
- Export is fast (~75 ms/frame, 4 workers); 600-frame chunks with `--no-mux`, then mux by hand with ffmpeg.

## Sound (the user's rule, 2026-10-17)
- Music: the user's "Documentary Background Music for Videos" (`Ref bit y pixels/`), from 4 s, −1.5 dB, silent ~1.15 s before the payoff number and +1.5 dB on it. `"voice": { "music": -7 }`.
- Code SFX on every on-screen action, clearly audible: `sfxBus.gain.value *= 2.2` at the top of score.js.
- A few real recordings from `sound-layer/kit` (page turns, soft swoops, cloth thump, interface clicks, pops) at −20 to −30 dB on the key moments: they add, never a noise bed. `sound/layer.py` mixes them into `audio/track-shaped.wav` with the shaped track (credits → `sound/CREDITS.md`).
- Loudness (user, 2026-10-18: "se escucha un poco bajo"): `piece.json "loudness": -11, "truePeak": -1.0` (export reads them); code SFX `sfxBus.gain.value *= 3.5`.
- End signature: **DOPAMENTES**, centred on the screen (y = H/2, 44 px, spaced).

## Transitions into a detail
Never a hard cut into a texture world: push in until the texture fills the frame, dissolve (`XFADE` in shots.js renders both shots and blends them) into the matching world seen at the same scale (the voxel field from above, coloured with the knit's chevrons), then move on; come back out the same way in one continuous pull-back.

## Frame checklist
- [ ] The shot matches the reference's framing and move at the same word
- [ ] Subject between 0.08 H and 0.70 H; nothing important under the caption
- [ ] Yellow = changed, cyan = motion, white tag = name; every label readable at phone size
- [ ] No label off the edge (textcheck PASS)
- [ ] Every number on screen has its source or its arithmetic in brief.md
