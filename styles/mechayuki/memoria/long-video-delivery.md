---
name: long-video-delivery
description: "when delivering the FINAL version of any long YouTube video, always include the title and a YouTube thumbnail (1280x720)"
metadata:
  node_type: memory
  type: feedback
  originSessionId: b19cd1d9-332a-4ffd-91ff-b618e0ca55df
  modified: 2026-11-01T01:49:51.970Z
---

From 2026-10-30, the user's request: every long video's final delivery includes the **YouTube title** and the **thumbnail**.

**Why:** the user publishes the long versions on YouTube and wants the packaging ready with the video.

**How to apply:**
- Research the title for virality (yt-package, yt-viral).
- Design the thumbnail from competitor thumbnails in the same niche plus the lessons in `fuentes/miniaturas/` (YouTube video KE4zqD0ONDI).
- Render it from the video's own 3D engine. Save it in `largo/miniatura_1280x720.png`.
- See [[ava-rules]].

Mechayuki Expeditions too (user 2026-10-31): every final Expedition → viral title + 1280x720 thumbnail rendered from the expedition engine (Mechayuki + the episode's artifact/ruin in MML2 style), saved in the piece folder as miniatura_1280x720.png. See [[mechayuki-expeditions]]. Mechayuki thumbnails (user 2026-10-31): NO brightness/glow boost (keep the film's natural PS1 look), MML2-style game-UI font (never Ava's font), and show her FULL body head to feet. Liked look (user's Gemini ref, pieces/expedition-01-bedroom/review/ref_thumb_gemini.jpg): holographic cyan→blue grid room, big golden 3D beveled text with orange outline, cheerful full-body pose beside one big artifact with sparkles. Her EYES always OPEN in thumbnails. APPROVED thumbnail (2026-10-31): pieces/expedition-01-bedroom/miniatura_A1.png (= miniatura_1280x720.png; code engine/thumb_shots.js + thumb_compose.py, font Luckiest Guy) — curved cyan/blue grid dome, big one-line 3D jittered letters #FFE21A with amber #A87800 extrusion and NO black outline, Mechayuki hands on hips with smirk + one big artifact with sparkles. SHORTS too: every Mechayuki short gets a vertical 1080x1920 cover in this same style (and a viral title). She must be BIG in frame (most of the height); thinking/expressive poses; title as real 3D extruded letters with per-letter jitter, Low Poly Shorts logo style (spec in fuentes/lowpolyshorts-style/especificacion-tecnica-del-estilo.md).

**Thumbnail subject (user, 2026-10-30):** Ava's body is always the main subject: action-heroine key-art pose (RE cover style), full or 3/4 body, slightly in profile, holding her black pistol, legs and thighs visible, attractive but tasteful. The threat (zombies, Vickers) goes behind her. Be creative with poses and lighting.

**Approved thumbnail pose (user screenshot, 2026-10-31):** `fuentes/miniaturas/ref_pose/ava_pose_usuario.jpg`.
- Ava in 3/4 profile, aiming the pistol two-handed at chest height, knees bent in a wide stance, thighs clearly visible, determined look.
- The RE CONDITION/ECG panel ("STATION · Fine") at the top, smaller than in the screenshot. It is a Resident Evil reference people recognize.
- Horizontal thumbnails: the same pose and HUD inside the split-screen idea. The calm left side shows a DIFFERENT place (e.g. the station entrance from outside); the right side is the dark night with the threat.

**Review before showing (user, 2026-10-31):** never show the user a thumbnail without a careful review at 100 % zoom and 4× crops.
- The pistol must be BLACK and readable as a handgun; never white or glowing.
- Ava's thighs must look full, with the camera matched to the screenshot.
- The text needs margin from the divider and edges.
- The background place must be understandable (pull back to show the entrance).
- Don't push Ava into a corner.
- The short cover's HUD is centered at about 45–50 % of the width.
- **HUD in thumbnails = the REAL engine HUD** (render it with `largo/engine/hud_png.mjs` using film.js hud()), never a redrawn panel; upscale with nearest-neighbor.
