---
type: note
status: active
tags: [scroll3d, google-maps, log]
relatedTo: [pieces/maps/brief.md, pieces/airtag/LOG.md]
---
# maps — log

## 2026-10-26 — story, voice, look, board, build
- Reference @scroll.engineer #3 (Google Maps, 158.3 s, 32 cuts, 49 lines). Script approved (the "no cameras/sensors/reports" claim softened). Voice: 16 takes with the "Veamos." trick, 162.46 s; whisper skipped "desviarse" and "fiarse de uno" but the take says them (checked on clips).
- Bugs met: road ribbons backface-culled half of the road and all the verges → DoubleSide; white labels unreadable on a light world → white text in a dark box; duplicate street+highway edges made Dijkstra pick the street; a `pathLen` name clash with the kit.
- Review: story arc 4/4 · text PASS (fixed 6: chip clamp by width, tags fading before shot ends, alternate sides) · dead beats PASS · loudest window in the payoff (48.0 s) with 0.7 s of silence before it · narration density FAIL (voice pace) · morph grid FAIL (voice-led dissolves, expected).
- Master: −10.4 LUFS, TP −1.3 dBFS.

## 2026-10-26 — round 2 (user: "a partir del 2:09 el audio se corta")
- Cause: the documentary track lasts 133.5 s and fades out at ~128 s; started at 4 s it ran out at 129.5 s → the export's mix (amix duration=first) stopped there and the `-shortest` remux cut the video too. Fix in `sound/layer.py`: play 4–126 s, then crossfade (2 s, equal power) back into the strong part from 29 s as often as needed; fade over the last 5 s; remux without `-shortest`. Verified: video 162.37 s, audio 162.40 s, sound to the end.
- The end bell became the loudest window once the music ran on → shimmer −36 dB, code bell 0.015. Loudest window back on the payoff (48.0 s).
- Google Maps logo (code-drawn pin in a white tile) top-left at the opening and at "cuando ves una autopista", as in the reference.
- Master: −11.3 LUFS, TP −2.3 dBFS.
