---
name: pov3d-style
description: "User's standing rules for pov3d \"¿Qué pasaría si...?\" videos (look, people, camera, effects, sound, end card, versions, workflow)"
metadata:
  node_type: memory
  type: feedback
  originSessionId: dd621c73-0dc8-4663-a3a9-e8d02c9a413f
  modified: 2026-10-17T07:36:52.020Z
---

Standing rules for every pov3d video (set 2026-10-11 → 2026-10-13; the oxygen piece, pieces/oxigeno + pieces/oxygen-en, is the current quality bar — "excelente, mucho mejor").

**Text**
- Title exactly as the user writes it; bigger and centred (bigTitle). Captions/HUD unchanged.
- End card centred: the fact higher; ~2 s later below it "y tranquilo, esto nunca pasará", then 1 s later below that "... o si?", then "ALTERBASE.ESP" at the very bottom, well apart (user's wording from 2026-10-13, sol piece). English versions: paraphrased teaser + "ALTERBASE" (unless told otherwise).

**Look and detail** (minimum = oxigeno; always push higher)
- Rich textures with relief (wood grain, plaster, canvas, bump maps); no flat surfaces. Detailed sea (fine ripples), smoke/dust as ragged lit clusters, volumetric cloud clumps, real trees (not spheres), grass blades (not spikes), detailed cars, buildings/towers with façades.
- Light: sun lens flare, bloom, long soft shadows; shadow box fixed (never follow the camera → flicker).
- Show every claim on screen literally (e.g. "todo fuego se apaga" → visible fires/candles/fire pits that go out).
- Destruction reads big and physical: buildings/towers crumbling from the top in pieces with dust; floors ripple, crack with dusty rims, then give way; clouds react to the event.
- Climax like the references: a bright ignition point with particles and detailed smoke; shock/fire fronts as huge churning billows (never a plain dome/sphere) that reach the camera and crack its glass.

**People**: the moment the event begins they must visibly look scared — some running off, others hands to the head, kneeling, phones up — and the camera must look at them then (always, every video). They react to every event (hands to ears in pain, doubling over, kneeling, collapsing); put some right next to the camera so it reads up close.

**Match the reference closely when asked** (giro, 2026-10-13): same kind of place (city street, not a variant), POV height like the reference (e.g. one floor up), cel-shaded look (toon shading, not flat PBR), detailed bodies and cars (shaped sedans, lights, rims), real-looking ground cracks (fissures with chipped lit edges, heaved slabs), buildings stripped in layers (skin peels, floors exposed, they lean and sway more as it worsens), FAR more debris/particles — total chaos like the reference — and the final wave carrying buildings and debris; camera shake scaled to each event.

**Replicate the reference's shots and camera moves** (protones, 2026-10-17): same shot order, framings and moves (low shot, tracking shot, tilt down to hands, pans over people, crane up/down), not just its beats.

**Camera**: never locked — sways, glances at the action (slowly looks round at people after a shock), turns to show what the caption says, motion blur on moves.

**Sound**: real CC0 recordings ([[audio-recorded-sound]]) layered with code SFX for weight (pressure hits, sub drops, rumbles, risers, cracks) plus a constant bed like the reference (e.g. the compressed breathing pulse over a drone). Much presence/weight; the payoff hit stays the loudest after a silence; check AAC true peak (rebalance, don't crush with a limiter).

**References**: study the given reference frame by frame (key moments + spectrogram) and match its effects/sounds, but change places, sides and elements so it is not a copy.

**Versions**: English versions (updated 2026-11-01, replaces the 2026-10-13 rule): the SAME video with the text in English — same scenes and the SAME sound; units in imperial (feet, miles, mph, °F). Separate copy pieces/<name>-en. Fix only what the user flags for that version. (Before 2026-11-01 the rule was to change the scene and use different sound; no longer.)

**Workflow**: story → look → storyboard approval → render in 280–300-frame chunks (one long export slows to ~60 s/frame) → audio → qa.py + review.mjs → deliver.

**Why:** accumulated user feedback across corre, agujero and oxigeno.
**How to apply:** start new pieces from pieces/oxigeno (oxy.js techniques: people poses, dissolve, towers, blast front, lensFlare/bloom/motionBlur/crackGlass, synth.py) and plan these in the beat table.

**Sound balance (faster, 2026-10-25)**: the user rejected a "correct" but sparse mix. Beds (waves) must not dominate; NO stretch may feel empty. Sound every visible thing: crowd walla around you, the sea retreating, time-lapse rushes when the sky races, helicopter, people running/screaming, and in chaos scenes big wind + debris so you FEEL it.
**Clouds**: sprite/cartoon cumulus "look painted" — use realistic volumetric-looking clouds.
