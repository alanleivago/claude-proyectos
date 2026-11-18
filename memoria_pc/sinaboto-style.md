---
name: sinaboto-style
description: "New PS1 low poly explainer style copied from TikTok @sinaboto (refs in \"Ref sinaboto/\"); my analysis and chosen pipeline"
metadata:
  node_type: memory
  type: project
  originSessionId: b19cd1d9-332a-4ffd-91ff-b618e0ca55df
  modified: 2026-10-26T16:29:27.421Z
---

2026-10-25: the user switched focus from emberlite to the style of TikTok @sinaboto ("How to build X / how X works" engineering explainers, 85-107 s, 1080x1920, 1-5.5M views). 5 refs downloaded to `Ref sinaboto/` (yt-dlp needs `--impersonate chrome` + curl_cffi). The user says that account is made with Claude Code.

What I measured: a rigged anime girl (VRoid/VRM look: hard hat, hi-vis vest, facial expressions) doing actions; low poly sets with photo textures and billboard trees; cutaway diagrams (house cross-section with temperature labels); PS1 post-process = render at ~1/3 res with nearest upscale, posterized/banded colour, 2-px horizontal scanlines; 1-word captions in a white pixel font with a black outline, yellow pixel-font labels, pixel-art sprites (germs, mascot), TikTok comment overlays, many short shots.

2026-10-25 test: `pieces/sina-test/` replicates the first 10 s of the heating video (ref audio only for comparison, not to publish). Engine works: `main.js` (360x640 shots -> post pass: sRGB encode, 15-bit + 4x4 Bayer dither, pixel-mosaic dissolve 0.3 s centred on each cut, hard-edged low-res captions, scanlines at 1080x1920), `shots.js`, `char.js` (placeholder box girl), `render.mjs` (Playwright, 300 frames in 14 s), `compare.py` (ours vs ref sheet), Flow textures via `gen_tex.py` (Flow drew the face as pixel art, crop it). Measured from the ref: transitions are pixelated dissolves, not hard cuts; captions = one word at 73.5% height.

2026-10-25 user verdict on the test: our box girl looks nothing like hers. The user confirmed sinaboto's girl comes from evanciao's NETO512 asset (free, credit required, no redistribution; tutorial notes in `fuentes/lowpoly-anime/`), with outfit changes. Plan: character in Blender from NETO512 (modify, rig, animate), export GLB to the three.js scenes. The user sends several tutorials; watch them fully myself (transcript + frame sheets), not through Gemini.

2026-10-26: studied evanciao, SunnyIsOnline and Crashsune's 14-video low poly series (agents, notes in `fuentes/lowpoly-anime/crashsune/`). The combined plan is `fuentes/lowpoly-anime/GUIA-personaje-ps1.md` (work order: fix GLB export → sinaboto outfit → expressions → action library → vertex snapping). The user keeps sending tutorials; NETO512 + sinaboto remain the base, the others only add techniques.

Also studied (2026-10-26): Crashsune PDFs, example .blends (Juliet, Astolfo, Teto, Love-chan eye rig; fan art, study only), Patreon captures (FOV, lighting, walk poses), animation series parts 7/9/10/11 and the walk cycle video (working walk script on a NETO copy). Everything is merged into the GUIA.

Character v1 (2026-10-26): `pieces/sina-char/` — `uvmap_neto.py` (per-texel part/3D/normal maps), `outfit.py` (repaints by UV island + 3D position, tint mode so dark colours stay dark), `build_sina.py` (flattens hair, hard hat rigid-skinned to DEF-spine.006, DEF hierarchy fix, <=4 weights, checks, GLB export to `pieces/sina-test/models/sina.glb`, 638 tris). Preview: `node render.mjs --page viewer.html` in sina-test. Pending: expressions/eyes (NETO's goth eyes), real boots, action library.

**Why:** the character carries the style, and every shot needs her animated.
**How to apply:** I proposed three.js in code (VRM character + Mixamo clips + PS1 shader, rendered frame by frame in headless Chromium) over Blender. Make our own character, never copy theirs (the "S" helmet / brand). Related: [[emberlite-style]] (paused), [[verify-tutorial-claims]].
