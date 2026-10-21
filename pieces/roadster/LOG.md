# roadster — log

## 2026-10-18 — story, look, board, build
- References: `Ref Scroll animations/6.mp4` (78.7 s, the shots and camera) + `7.mp4` (109.7 s, the same subject in a look close to scroll3d). The folder was renamed from "Ref Scroll aniamtions".
- Facts web-checked; three reference claims corrected (see brief). Script approved; the user's take 88.6 s (says "Así que mírate", "disparan soplidos", Whisper hears "Roaster" → fixed to Roadster in voice.json).
- New in the style kit: `s3Pill` (status pill), `s3Readout` (value box), `s3Note`, and a soft dark halo on every `s3Text`.
- World: swept deck along the loop + ceiling (`trackPose(s)`), truss beams as instanced bars, LED speed sign from a canvas texture, sky shader + PMREM environment from it, ACES.
- Bugs fixed: x-ray invisible (material.transparent toggled without needsUpdate → transparent from the start); a full-width dark sill slab hid the fans and darkened the x-ray (→ two side strips); under-deck shots black (→ a warm fill light from below, lighter deck concrete); air arrows above the deck (local −y of an inverted car is world up); camera too close under the deck.
- Look approved (5 frames), storyboard approved (15 panels).

## 2026-10-18 — render + review
- Render 2693 frames in 5 chunks (~0.25 s/frame: the desert world is heavier than compresion). Audio: track + 21 recordings (sound/layer.py) + SFX stem, voice at −7.
- Review round 1: loudest window was the music's own swell in the suction act, and then the Corolla crash (the score's compressor levels every hit to about −7 dB). Fixed: the track −7 dB under the explanation (R 25.4–50.7), back to 0 for the cold gas, silent 0.9 s before the launch, +6 dB on it; other thuds lowered; a recorded deep boom (kit) on the launch; a 3 s jet-of-air roar. Label overlap "Boquillas" × "sin fuego" fixed.
- Final: text PASS (0 cut-off/overlap) · loudest 65.5 s −9.6 dBFS in the payoff (the launch) after 0.7 s ≤ −40 dBFS · −14.2 LUFS, TP −3.7 · dead beats PASS · story arc 3/5: the payoff act's p90 sits under the others because the arc is measured on the mix with the voice, and the voice is softer on that line.

## 2026-10-18 — round 2 (user: "muy bien", detalles)
- Master louder: export.mjs now reads piece.json "loudness"/"truePeak" (here −11 LUFS, −1 dB) and normalises LINEARLY (measure, one gain, limiter). The old one-pass ffmpeg loudnorm was dynamic: it pumped quiet stretches up, which is why the suction act measured as the loudest.
- Code SFX ×3.5 (was ×2.2); intro and suction SFX trimmed a little so the launch stays the loudest act.
- Road flicker 0:06–0:17 (coplanar ground/road/pad at long range): logarithmicDepthBuffer, near 0.3, planes lifted apart + polygonOffset; checked on consecutive frames.
- The crowd jumps and squashes on its own phase (`cheer(u)`): full when the car flies (R 3.6–12.5) and lands (R 73.3+).
- DOPAMENTES centred (y = H/2).
- Found by tile's determinism check: wheel and fan rotations carried over between frames in shots that didn't set them (intro flight, actitud, atorado) → reset every frame in resetWorld.
