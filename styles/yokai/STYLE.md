# yokai — dithered folk horror (three.js)

A first-person folk tale told in on-screen paragraphs over a low-res 3D world, cold and foggy, pushed through a fixed palette with ordered dither. Made from `Ref earlobe horror/` (reel 5 the main reference).

**Quality bar (2026-10-25, approved by the user): `pieces/behemoth`** (before it, pieces/jorogumo). Its full source is in `template/` (src, piece.json, brief, the card print, sound/mix.py). Start every new yokai piece from `template/` and go further from there — this level is the minimum.

## The look (measured, then pushed by the user's notes)
- **Pixels:** three.js renders at `YK.LW × YK.LH` = 216×384 (5 px pixel at 1080), no antialias, blown up with no smoothing.
- **Palette:** `YK.PAL.main` — blue-blacks, teals, cold greys, a few warm browns and rusts, no mid greens or oranges. Keep the warm browns: going full cyan was rejected.
- **Grade before quantising** (`ykBlit`): saturation 0.6, cold grade `[0.9, 0.97, 1.0]` + lift `[1, 5, 7]`, gain 0.9, Bayer 4×4 spread 34 — gradients and fog read as dot screens.
- **Cel shading:** every MeshStandardMaterial becomes MeshToon with a 3-band gradient (45 / 135 / 255).
- **Fog:** dense in every light preset (night / day / dusk / dawn, all cool teal; dusk is teal, not orange).
- **Detail:** code textures on everything (gravel, basalt, bark, needles, kasuri, robe, creature stripes), tens of thousands of wind-swayed grass blades, layered trees, props that tell the place (shrine, rope, lanterns, firewood, hat), mist sprites, spray, motes, falling leaves, birds.
- **Text:** the code pixel font (`ykPara`): centred paragraph at y≈1300, u = 6 px, outlined; decodes glyph by glyph from noise and scrambles out. No badge in the top left.
- **Card** (`ykCard`): stars on black, a striped beige frame, a legend-style print (generated with Flow / Nano Banana Pro as an Edo woodblock print, `assets/print.jpg`) drawn ~132 px wide through `YK.PAL.print` so it reads very pixelated, the name and a red seal.
- **Transitions:** dithered fades (`vis`) and hard cuts; a planned black + exact silence before the reveal.

## The opening shot is the hook (user, 2026-10-22)
The first 0–4 s decide whether people stay, so the creature must read clearly in the opening shot, as it does in every reference. Keep it dark and keep the same mood, but:
- frame the creature as the subject: big in frame (≥ 35% of the height), in the upper half above the paragraph, from a good angle (a low angle or a silhouette against a lighter sky or fog);
- separate it from the ground: rim or back light, a lighter fog layer behind it, and a tonal gap between the creature and the background;
- show its defining wrong feature in that shot (legs, neck, face), not just a vague shape.
Jorōgumo's opening (her shape lost in the mist behind the falls) is too hard to read. Do better than it.

How the reference account does it (7 hooks studied, 2026-10-24, `references/tiktok/earlobehuman/`):
- The creature is in frame from frame 0, centred in the upper half, filling 30–60% of the width, and the paragraph sits below it.
- It is the brightest or the most saturated thing in the frame: a pale body against a dark night, a lit face, glowing eyes or a burning body against cold teal.
- Simple readable silhouette: a pale round head with long legs, a thin white dancing figure against a bright sky, a face in a ring of fire.
- Something moves or reveals in the first 2 s: it sways, twitches, flickers in the rain, or eyes light up in a window.
- The first sentence is a warning or a rule ("Hold your breath…", "If you ever hear…, keep your eyes shut") and is in place by about 0.5 s.

From `@theredarchivesyt` (8 hooks studied, a different look, so take only the grammar): a 3–5 s hook of the creature doing its thing, with a 2-line caption of a threat or a rule ("Don't wave back", "If it asks for a ladle… break the bottom first"), then a title card. Its biggest hits (1–1.8 M views) are giants against a landscape (scale reads instantly) and a single unsettling face that moves.

## The "oppressive" dither (user, 2026-10-25)
Measured at pixel zoom on earlobehuman's whale video: on top of the quantised palette, a regular 2×2 dot screen covers every mid-tone surface: one pixel in four gets a contrasting warm dot (rust or orange over grey and teal). That regular warm/cold weave reads as "oppressive", not darkness. In the kit: `YK.DOT` 52 (dot strength), `YK.DOTC` (its warm direction), `YK.SPREAD` 16 (keep the 4×4 Bayer noise gentle so the dot screen dominates). **No vignette** (`YK.VIG` 0): the references don't have one, and the user rejected it. Rain streaks are part of the look.

## The creature rule
Never cute. Wrong proportions (a neck far too long, arms too long and thin), a tilted head, a blank noh-mask face with blackened teeth, and a body-horror turn (the mask splits to show a cluster of glossy eyes and fangs). Light faces from the side so they stay grey, not glowing white.

## Sound
Wikimedia Commons CC0 / public-domain recordings (beds and hits) + a code layer in `sound/mix.py` (bells, drones, a thin hum for the threat, sub-drop hit with a dissonant cluster on the reveal, chitter, footsteps, heartbeat). −16 to −14 LUFS, peak ≤ −1.4 dBFS, loudest moment on the reveal after ≥ 0.5 s of exact silence. Write CREDITS.md.

## Frame checklist
- Reads as the reference at phone size: chunky pixels, dot-screen gradients, teal fog, cel bands.
- The subject is clear above the paragraph (the text covers y≈1150–1450; nothing important there).
- No hard black voids except planned ones; no fully cyan frame.
- The creature is unsettling in every frame it appears in.

## Tools note
This Mac's ffmpeg lacks `drawtext`: run `review.mjs` from a copy with its drawtext filters removed.
