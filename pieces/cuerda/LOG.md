# LOG — cuerda

## 2026-10-18 run 1
- New channel Bitstory (refs `Ref bit y pixels/`), video 7 → new style `styles/bitstory` (voltamps kit recoloured).
- Voice: one take, cut by cut.py; whisper merged "two pi | Two pi" and cut twopi/div on a word onset → recut by energy profile at 42.97 and 44.72.
- Word cue "isn" never matched (VW keeps apostrophes) → "isn't"; a check script now lists every VW cue missing from voice.json.
- Board fixes: overlapping add captions; empty test beat (string coil added); wrist cross-section read as a face (bones → hatch); "what you wrap" too faint.
- Review 1: arc 2/5 (act roles mislabelled; loudest = the dive whoosh at 33 s), text overlap wrist/skin captions, wrist label in the safe zone, dead 61.5–65.8 s → roles fixed, dive SFX lowered, math SFX −3 dB, ring pulses on "same", Bitstory shimmer.
- Master: `alimiter` auto-levels by default (→ −9 LUFS, peak +0.7) → `level=false`: −11.5 LUFS, peak −2.0 dBFS.

## Review (final)
| check | result |
|---|---|
| story arc | PASS 5/5 |
| text | PASS (0 overlaps, 0 in safe zone) |
| payoff | loudest window 28.3 s = HIT, 0.9 s silence before |
| dead beats | WARN 95.75–98.75 s (end card hold, 3.0 s) |
| narration density | FAIL on 3.5 w/s rule (user's take, not changed) |
| master (share.mp4) | −11.5 LUFS, peak −2.0 dBFS |
