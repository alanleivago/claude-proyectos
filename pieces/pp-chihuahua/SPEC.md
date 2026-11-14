---
type: spec
status: active
tags: [positpixel, style-test, pixel-art]
relatedTo: [styles/pixdoc]
---

# pp-chihuahua — replica test of a positpixel short (first 10.3 s)

Private style test. Reference: `references/positpixel/H_0efVEWVy8.mp4` (gitignored, never published).
Key frames: `references/positpixel/k00..k14.png` (t = 0.0,0.8,1.6,2.45,3.0,4.0,4.8,5.8,6.4,7.0,7.7,8.3,9.0,10.0,10.3), sheet `chi-keys.png`.
Two versions, same timing and captions: `flow/` (Flow images + code) and `code/` (everything drawn in code).

## Contract (each version is one `index.html`)
- `<canvas id="c" width="1080" height="1920">`, `window.TIMELINE = { fps: 30, duration: 10.3, width: 1080, height: 1920 }`, `window.renderFrame(t)` draws time t synchronously and deterministically (seeded RNG, no Math.random, no clock). If images must decode first, define `renderFrame` only after they load.
- Render with `node pieces/pp-chihuahua/render.mjs pieces/pp-chihuahua/<version>` → `<version>/frames/` + `<version>/out.mp4` (reference audio muxed).
- Look: art drawn on a **180×320 low-res buffer**, upscaled ×6 with nearest neighbour (pixels 6 px). Zooms/scales happen in the low-res buffer so pixels stay 6 px. Flat posterized planes (3–4 tones per material), 1-px near-black (#1a1014) outlines on figures, checkerboard (2-tone) dither for gradients/glows. Captions are drawn at full res on top (NOT pixelated).
- Captions: white, bold rounded sans (`"Montserrat ExtraBold", "Segoe UI Black", "Arial Black"`), ~64 px, black outline ~8 px + soft shadow, centred x=540, baseline y≈1390 (shots 1–8). Groups (start time → text, each holds until the next):
  0.00 Your head shrinks · 0.94 while your eyes · 1.56 remain large and · 2.56 your jaw forms · 3.34 a muzzle that · 4.12 overcrowds your teeth · 5.48 Because of selective · 6.30 breeding your body · 7.38 mass shrinks to · 8.28 1/6 of · 9.12 its normal size · 10.20 and now you

## Palette (measured on the reference)
skin light #e8a493, skin #d98d7d, skin shade #b8705f, skin deep #8e4f45, lips/gum #c0364a, mouth dark #4a0f18, teeth #f4f1ee / #c9c4cc, iris #2a64c8 / #0d2a6e, eye red rim #d0606a, brow #4a2a18, room dark #120a1e, room purple #3a2050, grid line #050308, floor light #c8c4d0, sign fire #ffb030 / #ff6a10 / glow #ff3a00, briefs #f2f2f2 / #c8c8d0, green nails #3ee03a, hand bg grey #6c6c70.

## Shots (30 fps)
| # | t | what | motion |
|---|---|---|---|
| 1 | 0.00–2.30 | Bald middle-aged man, 3/4 view looking left, screaming (mouth open, lower teeth). Bare shoulders fill the bottom. Background: dark purple tiled wall (black grid lines, perspective) with a glowing fire sign "POSIT PIXEL" (2 lines, bone/fire letters) top-centre, purple light falloff. | Head **shrinks in steps** (cuts at 0.13,0.27,0.37,0.50,0.63,0.73, then smooth to 2.3) from filling the frame (k00) to ~35 % size (k02) sitting on the same shoulders; the sign is revealed behind. Mouth flaps open/closed with the voice (on 2s). At ~1.56 ("remain large") the eyes stay big while the head is small. |
| 2 | 2.30–2.70 | Frontal close-up of the small-headed face: huge round blue eyes with red rims, wide screaming mouth, big ears, purple wall behind (k03). | Eyes swell (scale 1→1.25) in 0.4 s; slight push-in. |
| 3 | 2.70–4.33 | Dark purple-black room, side profile (facing left) of the tiny head on a huge purple-lit torso (k04, k05). Red arrow (pixel, with dark outline) points at the jaw from the upper left. | Jaw pushes forward into a snout over 2.7→4.0 (on 2s), mouth opens showing fangs; arrow bobs. |
| 4 | 4.33–6.20 | Macro of the mouth (k06): pink lips frame, rows of crowded white teeth (some fangs, overlapping, tilted), red gums with white saliva bubble rings, dark throat, tongue. | Slow push-in + drift down; bubbles shimmer; teeth crowd (more teeth pop in) on 2s. |
| 5 | 6.20–6.73 | Extreme close-up of skin (k07): soft horizontal bands of skin tones (chin/neck), blurred. | Fast vertical whip (smear) — transition. |
| 6 | 6.73–7.90 | Wide: the purple grid room in one-point perspective (floor grid lines converging, lighter floor centre, dark walls), sign top-centre. The man stands full-body in white briefs, small head, arms out; small fleshy creature (head + tail) crouched on the right (k08). | Body **shrinks** to ~1/3 height and hunches over 6.73→7.9 (k09), legs bow. Creature idles. |
| 7 | 7.90–8.67 | Same room lower/darker (k11): tiny man (sprite ~20 px tall) standing on the floor, centre. A giant hand with long green nails swoops in from the left, blurred, and grabs him. | Hand enters 7.9→8.4 with smear, closes at 8.5. |
| 8 | 8.67–10.30 | Close: the tiny man (gaunt, big ears, small head, ribs, briefs) held upright in a giant palm, fingers with green nails curling around him, grey tiled background (k12–k14). | Mouth opens to scream at 9.0 (stays), eyes dart, slight hand bob; at 10.2 cut to black (end). |

## Pass criteria
Side-by-side with the reference at the same frame (`compare.png`): same composition (subject size/position on the 10 % grid), palette, pixel size, caption position. Render must be deterministic.
