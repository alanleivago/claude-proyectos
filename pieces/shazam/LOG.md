# shazam — log

## 2026-10-22 — story, voice, board, build
- Reference `1.mp4` (104.2 s, 25 shots). Script approved. Voice generated with VoiceStudio "Scroll español" (0381b8fe), 15 paragraph takes.
- Takes open with a stray ~0.12 s blip at 0.10 s + room noise; one paragraph dropped "toda la canción" (regenerated).
- New in the style: people.js (pov3d people rigged for pose()), S3.hl karaoke (current word yellow), s3Steps bar, tools/tr.py, tools/mids.js.
- User: taquería in the reference's grey monochrome (greyOut). Storyboard approved.

## 2026-10-22 — round 2 (user notes) + the pre-delivery QA
- Flicker 0–20 s: some frames had the whole field white — the InstancedMesh got instance colours only after the first frames, so renderers whose first frame came earlier compiled the shader without them. Fixed by colouring every instance at creation. Measured: 0 one-frame flashes in 2813 frames.
- Clipped word ends (lentísimo, momento, puntos, basta, encaja): two causes — (1) a gate between words in clean.py ate soft tails (removed), (2) VoiceStudio clips the last syllable of most takes (fall 30–40 ms). Regenerated all 15 with /generate duration ×1.15–1.35 (natural falls 50–240 ms), then rubberband back to the original pace (speech 20 % slower otherwise). A 120 ms room tail at −24 dB softens the in-sentence pauses.
- Noise at 0:24 and 1:10: my SFX — a low 300→160 Hz thud on "lentísimo" right under "así que Shazam", a 5 s bandpass "chatter" bed and noise whooshes. Removed; small chimes −8 dB; payoff hit raised.
- New tool: styles/scroll3d/tools/qa.py (flashes, clipped ends, blips, pause noise, broadband bed noise) — PASS.
- Final: QA PASS · text PASS · dead beats PASS · loudest window on the payoff (69.0 s) · −9.5 LUFS, TP −1.7 · story arc 3/4 (music under the voice in act 2 is 9.5 dB under the gift).
