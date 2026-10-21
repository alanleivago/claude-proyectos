# LOG — alcibiades

## 2026-10-18 — first build
- New style **amphora** made from refs (measured: parchment #bca27a, Athens blue #5b87b5; wiggle = ~2px displacement re-seeded every 3 frames).
- Look-check notes applied: friezes in paper colour (opaque, picture passes under), ITC Garamond captions bigger and alternating top/bottom, global wiggle (SVG turbulence displacement in STYLE.post), subtle cloud stains, more detail (curl-glyph hair, lidded eyes, brows, hands, rough coasts).
- Storyboard notes applied: wave lines in every sea, apple symbol in the sign-off.
- Voice: one take (67.2s) cut into 15 lines with references/voltamps/tools/cut.py; every cut re-transcribed clean.

## Review (renders/share.mp4, 70.5s)
| check | result |
|---|---|
| deterministic (tile) | PASS |
| dead beats | PASS (0 stretches > 3s) |
| sound | PASS: loudest 62.4s in the payoff act, 0.5s silence before (music dipped 61.7–62.15 in audio/track.wav), −13.8 LUFS, TP −1.5 dBFS |
| story arc | gift loudest PASS, silence PASS, goodbye decays PASS; "peak has the highest cut rate" FAIL (voice-led, cuts follow the lines) |
| cuts on 8th grid | FAIL by design: the voice is the clock |
| narration | word hits PASS; density FAIL on 5 lines (3.5–3.85 w/s, the take's own pace) |
| text | fixed: captions out of the bottom phone UI (bottom baseline 1430, maxW 790), PERICLES/QUEEN labels, KING AGIS × caption, Sardis × PERSIA. Remaining 11 "cut off": map labels sliding off the edge during map pans (art, intended) |
- Review needs ffmpeg-full on PATH (drawtext/subtitles): PATH=/opt/homebrew/opt/ffmpeg-full/bin:$PATH.
- Weakest shots: 7 (Spartans crowd overlap), 14 (flames stiff), 15 (portrait face simple).

## 2026-10-18 — mix (user: lower sfx, much more bgm presence)
- Cause: Odysseus bgm.mp3 is very quiet at the source (−29.6 LUFS) vs the sfx stem (−13.8); at gain −6 and voice.music −5 it was ~20 dB under.
- Fix: audio/track.wav loudnorm'd to −14 LUFS (pre-payoff dip kept), music gain +7 (music ≈ 7 dB over the sfx), voice.music −4 (music ≈ −18 LUFS under −20 voice, ducked by the sidechain while he speaks).
- Note: the score tail RMS-normalises the sfx, so sfxBus gain does nothing — balance via music gain.
- share.mp4: −13.9 LUFS, peak −1.2 dBFS. Review: payoff is no longer the loudest 100ms window (music now dominates); the hit still lands in the music's silence.
