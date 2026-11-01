---
name: feedback-onebit-flow-look
description: "User's rules for the 1-bit Junji Ito / World of Horror Flow look (expressions, white outline, flat square-pixel shading, thick subtitle stroke)"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 1c7aad81-0e25-4506-80b3-370d9bd671ea
  modified: 2026-10-27T14:47:31.435Z
---

From the elevator-game look check (2026-10-27), for every video in this style (refs: `Ref 1 bit pixelated junji ito madfable`, piece `pieces/elevator-game` has the Flow→1-bit pass `flowShot`):
- Characters change facial expression and move the head side to side across frames, like `Referencias Madfable 2.mp4` around 0:06 (brows, eye direction, mouth, small tilts every few frames), matched to the situation. Make expression/pose variants in Flow by editing the character image; swap them in code.
- Every character (human or creature) gets the subtle white outline (in the Flow prompt AND the code rim), see [[feedback-onebit-flow-outline]].
- Flatter: simpler backgrounds and less detail on figures; most shading is flat square pixels (posterized grey/black steps), not fine stipple dither. The ref close-ups have ~10 px pixels at 1080.
- Subtitles: a thicker black stroke around the white aansa letters (`fonts/aansa.ttf`); typing sfx = `Talking 1 Loop.wav` in the Ref folder.
- Keep the World of Horror UI window (e.g. a FLOOR counter) when the story has one.

**Why:** the user's corrections on the first look frames. **How to apply:** before every look/board in this style.

**Sound and captions (user, 2026-10-27, amigara board):** these videos have NO voice. The captions carry the story; while they type, `Talking 1 Loop.wav` plays, and the more disturbing the line, the more the loop is stretched (slower, lower, deeper) for an eerie feel. Captions: aansa, lower case, thick black stroke, NO white outer edge.
**Board errors the user caught (don't repeat):** keyed characters showing see-through patches (the keyer must never cut dark pixels; fill interior holes), silhouette holes that show clothing folds (a hole is pure black inside), code-drawn light beams that read as a stray limb, a creature whose origin isn't readable (show it coming out of the hole).

**Never re-pixelate Flow pixel art (user, 2026-10-27):** Flow renders this look on a native grid of ~134x240 (5.74 px per pixel in a 768x1376 image). Re-gridding it at another size broke every line ("se ve baja calidad, como si les faltaran píxeles"). Recover the native pixels with `pieces/amigara/tools/native.py` (grid detect → centre sample → palette, checker shadows on characters, flat on backgrounds, 1-px white rim on keyed layers) and only scale them up nearest-neighbour. Keep the wiggle (idle head drift) and the slow push-ins: without them it looks static.
Wiggle = the HotD/GoW whole-frame turbulence displacement (`egWiggle(2.6)`), NOT a per-layer position jitter (that read as an earthquake); see [[feedback-verify-before-render]].

**From amigara delivery (user, 2026-10-27), for EVERY video in this style:**
- Black-and-white filter over everything: Flow's images come out greyish, never full B&W. Done in the wiggle SVG filter (`egWiggle` in pieces/amigara/src/scenes.js): feColorMatrix saturate 0 + feComponentTransfer gamma 1.8 amp 1.03 (sRGB). Keep refining it video by video (refs are mostly pure black/white with little grey).
- Caption letters a bit tighter: `AF_TRACK = 0.4` (was 1).
- Outro: the channel logo `Ref 1 bit pixelated junji ito madfable/madfable icono perfil.png` (a pixel spiral) in white on black, drawn in like a pen along its stroke, then "Madfable" in `fonts/thatthatnewpixelfamilytest-square.otf` dissolving in by 9-px cells; assets from `pieces/amigara/tools/logo.py`, scene `sceneLogo`, ~3.6s, scrape + low hit.
- The user's channel is Madfable; long-form plan: cosmic-horror stories like YouTube @Urbn.Theory, with our Japanese / Junji Ito / World of Horror twist. Face and place refs: `Ref 1 bit pixelated junji ito madfable/ref caras personajes y lugares/`.
- Long-form cosmic horror (user, 2026-10-27): length is free (no 8-min target; ~3.5–6 min like Urbn.Theory is fine); stories can happen anywhere in the world, not only Japan (Junji Ito style, not Japan-only setting); no voice: captions + Talking loop + a cryptic dark BGM bed like Urbn.Theory's (sub-bass trailer/synth, booms at turns, silence over the logo). Urbn study notes: /Users/alanleiva/claude-proyectos/fuentes/urbn-theory/.
- 16:9 long-form look notes (user, lost-second look check 2026-10-28): captions SMALLER than in 9:16; the white outline around characters/creatures must be SUBTLE = thin like the refs (the 1-native-pixel code rim from native.py was too thick: drop it, keep only Flow's thin outline); align CCTV overlay text with its marks (the "rec" sat below its square); vary the shots like Urbn.Theory (high/low angles, over-the-shoulder, wide establishing, extreme close-ups, side views), not only frontal. Piece: pieces/lost-second.
- Madfable OUTRO (user, 2026-10-28, replaces the black spiral outro): red background with black tree silhouettes (file in `Ref 1 bit pixelated junji ito madfable/`), "madfable" big white in That That New Pixel, LOWER CASE, letters tighter, top centre; bottom-right the animated card (video in the same folder) pixelated a bit, background removed. Faces must be eerie/unsettling, never simple (phone-reflection face was too plain).
- Long-form length (user, 2026-10-28): these cosmic-horror videos must last AT LEAST 3 minutes (lost-second came out 1:52, too short): slower pacing like Urbn.Theory (each image held 8–20 s, slow moves) + enough story beats. Outro wordmark "madfable": NO shadow, letters nearly touching.
- Lost-second delivery fixes (user, 2026-10-28), for EVERY video in this style:
  - Deliver ONLY the final MP4 WITH audio (muxed). No silent final.mp4, no share.mp4: delete the extras or name the one deliverable clearly.
  - The wiggle was too strong; it is now lower than 2.6.
  - HUDs, CCTV frames and boxes, labels and captions get NO wiggle; only the picture does.
  - Talking-loop captions were too loud. Keep them clearly under the BGM and SFX, and raise the SFX and BGM.
  - Captions even smaller in 16:9, with tighter line spacing.
  - Always apply the B&W filter to the whole frame, Flow images included.
  - Code-drawn clock hands must leave no white boxed artefacts.
  - The white REC square sits exactly beside the word "REC", vertically centred on it.
  - The red outro card lasts longer (the user places YouTube end screens there, so at least about 20 s), and the red is saturated: red, not orange.
- Second lost-second round (user, 2026-10-28):
  - Wiggle 1.5 px, applied to the captions too. CCTV and HUD boxes still get no wiggle.
  - Master louder than -14, but -11 sounded squashed. The final lost-second master is -13 LUFS: a transparent oversampled true-peak limiter (no tanh), a bed high-pass at 35 Hz with a cut below 90 Hz, and booms on the SFX bus. The talking loop ended 12.5 dB below its first level.
  - The last caption ("whose face…") holds a few more seconds.
  - Pure 1-bit was tried: a hard threshold to #000/#fff plus checker dither. It "damaged everything" and was REVERTED. Keep the B&W pass from round 2: saturate 0 plus a steep contrast curve, with one flat grey allowed.
- **lost-second is the approved bar** (user, 2026-10-28: "quedó excelente, guarda todas estas instrucciones y nivel de detalle"). Repeat its whole pipeline and every rule above for each new long-form video:
  - story, look check and board before rendering;
  - at least 3 minutes, slow pacing, varied shots;
  - sonido pro, plus QA agents (visual frame by frame and earshot) on the FINAL export;
  - only the muxed mp4 is delivered.
  The code to copy is pieces/lost-second: src/scenes.js (HUD queue, egbw, cctv, sceneLogo) and sound/mix.py (master chain).
- **Each video also ships a title and several thumbnails** (user, 2026-10-28):
  - Title like Urbn.Theory's: the one-sentence premise in Title Case, often with "(Cosmic Horror)" or "[cosmic horror]", e.g. "They Found Human Footprints At The Bottom Of Ocean (Cosmic Horror)" or "One night, the Moon blinked. [cosmic horror]".
  - Thumbnails: always SEVERAL versions (subject moved right with the title beside it, subject centred, a tight face crop, and so on), built from the strongest frame (the user picks it, e.g. lost-second 2:20). 1280x720, with a small-size check. The Urbn refs are in fuentes/urbn-theory/thumbs/.
- Thumbnails (user, 2026-10-28):
  - Follow the user's own thumbnails in `Ref 1 bit pixelated junji ito madfable/ref miniaturas/`, especially their text style; our aansa-caps title text was disliked.
  - Always overlay "borde encima.jpeg" (a white border on green screen, chroma-keyed) on top.
  - Liked look (lost-second r7): the background in red+black duotone, with the subject cut out and kept in normal B&W on top.
  - The extracted rules are in fuentes/urbn-theory/thumbs/madfable-thumb-rules.md.
- Lost-second thumbnail chosen (2026-10-28): the m2c "bold20" look (the man ×7 on the right on a red-black subway, kanji in ONE white vertical column centred between him and the border). The user calls the bold20 render "your font": Nosutaru-dotMPlusH-10 drawn at 20 px with a bold pass. The thin native dot render (12 px) was rejected. Script: pieces/lost-second/tools/thumbs_m2c.py.
- 9:16 Madfable outro (user, 2026-10-29, nure-onna): the animated card is CENTRED below the "madfable" wordmark and bigger, not bottom-right. The 16:9 outro keeps the card bottom-right.
- Nure-onna fixes (user, 2026-10-29):
  - "B&W" means a Premiere-style Black & White effect: desaturate the whole final picture to luma, with no threshold, posterize or extra contrast. Apply it to everything except the red outro.
  - The 9:16 red outro lasts only 5 s. The 16:9 long-form outro keeps about 20 s for the end screens.
  - Never repeat the same image for two beats; each beat gets its own shot.

- 2026-10-29 (bells): whenever possible split images into LAYERS (foreground/subject/background, fog, figures cut out) to give dynamic motion (parallax, independent drift), not just a flat push on one image.
- 2026-10-29 (bells): top-left tag = the user's own WoH tag from https://youtu.be/AMpBNywoQB0 (black icon box + white bar with double border, "KANJI-THE TITLE" in Nosutaru dot, dithered dots bottom-right); implemented in pieces/bells (src/tagfont.js, scenes.js). Flow style refs for characters/places: 'Ref 1 bit pixelated junji ito madfable/ref caras personajes y lugares/' ("use ONLY as a drawing-style reference, do NOT copy its scene"). End-question card uses thatthatnewpixelfamilytest-square like the madfable wordmark. Bell inscriptions engraved along the curve, not flat. Junji horror = stillness/realism; googly or vertical-slit eyes read as funny.
---
name: feedback-onebit-flow-outline
description: "1-bit Junji Ito / World of Horror Flow prompts always include \"the character has a subtle white outline around him/her\""
metadata:
  node_type: memory
  type: feedback
  originSessionId: 1c7aad81-0e25-4506-80b3-370d9bd671ea
  modified: 2026-10-27T14:30:13.165Z
---

Every Nano Banana prompt for the 1-bit pixel Junji Ito / World of Horror look (refs in `Ref 1 bit pixelated junji ito madfable`) must say: "the character has a subtle white outline around her (or him)".

**Why:** the user always adds it in Flow; it gives the World of Horror rim around figures (user, 2026-10-27, elevator-game).
**How to apply:** add it to every character prompt; for a hidden-face reveal, don't pass the creature's face image as a ref (Flow copies the face). Related: [[feedback-flow-mcp]].
