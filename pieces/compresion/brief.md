# Cómo se comprime un video — brief

**Style:** scroll3d (new; three.js engine from pov3d). **Format:** 9:16, 1080×1920, 30 fps, 98.7 s (the voice: 97.3 s + 1.2 s tail).
**Source:** a Spanish remake of `Ref Scroll aniamtions/4.mp4` (video compression, 91.8 s). Same shots and camera moves, re-timed to the user's Spanish voice through word anchors (`ANCH` in `src/head.html`: every shot is authored in reference time R = refT(TT)).

## Changes from the reference (so it is not a copy)
- Woman in a mustard knit sweater (reference: man in green) · red toy car (reference: red ball)
- Grey-blue plaster wall, a landscape painting instead of the window, side table + table lamp instead of the floor lamp, white pot plant, terracotta rug
- All on-screen text paraphrased into Spanish, in Helvetica FreeSans Bold (`assets/FreeSans.ttf`, embedded by the build)
- End tag "ALTERBASE.ESP" in place of the reference's handle
- Voxel field in the sweater's mustard; pixel column 6 × 6 × 100

## Beats (reference time → what happens)
0–5.4 keyframe + 3 ghosts "solo lo que se movió" · 5.4–10.6 a tower of full frames, "carísimo", they dim into ghosts · 10.6–14.9 inside the room, the car crosses · 14.9–18 pull back, white grid "la imagen completa" · 18–21 cuts: persona / cuarto / carrito · 21–30.2 keyframe + "1 fotograma después", it turns into a ghost "solo esto se movió" · 30.2–34.5 black block lattice · 34.5–44.9 the frames tilt, rings, the block hops 2 blocks right, "Vector de movimiento" · 44.9–50.4 57.600-pixel column vs "2 bloques → pocos bytes" · 50.4–52.3 back to her, into the sweater · 52.3–58.9 voxel knit: original | simplificado, "color: 1 por cada 4 píxeles" · 58.9–62.3 tiny differences thrown away · 62.3–69.6 a new keyframe in the stack · 69.6–75 what it is NOT: a stack of full frames · 75–80.4 full frames / changes / motion instructions · 80.4–85.3 the phone rebuilds it · 85.3–91.8 11 GB → 40 MB.

## Sound
A soft code bed (D minor, 120 BPM, Dm9–Bbmaj7–Fmaj7–C6) under the voice, a code SFX on each action (ticks, whooshes, thunks, sweeps, the pixel ticks rising). The bed stops 1.15 s before "11 GB"; the loudest hit (sub + noise + chime) lands with the number. Voice over the score at −12 dB, −14 LUFS.

## Claims and sources
- "57.600 píxeles, este pedazo en 1080p": the moved piece is 2 × 2 blocks of the 16 × 9 grid at 1920 × 1080 → 240 × 240 = 57,600 px; 1 cube = 16 px (4 × 4) → 3,600 cubes. Arithmetic.
- "color: 1 por cada 4 píxeles / brillo: cada píxel": 4:2:0 chroma subsampling (the norm for streamed H.264/HEVC): one Cb/Cr pair per 2 × 2 pixels, luma at every pixel. https://haivision.com/glossary/chroma-subsampling
- "unos 11 GB sin comprimir": 1920 × 1080 × 3 bytes × 30 fps × 60 s = 11.2 GB. Arithmetic.
- "unos 40 MB en streaming": ~5 Mb/s × 60 s = 37.5 MB. Netflix recommends 5 Mbps for 1080p: https://help.netflix.com/en/node/306
- "esquemático: los códecs reales mezclan tamaños de bloque": H.264/HEVC use variable block sizes. Same caveat as the reference.
