---
type: note
status: active
tags: [scroll3d, airtag, log]
relatedTo: [pieces/airtag/brief.md]
---
# airtag — log

## 2026-10-25 — story, voice, look, board, build
- Reference: @scroll.engineer #2 (AirTag, 97.6 s, 11 cuts); downloaded with yt-dlp into `Ref Scroll animations/` (the old folder was lost in the iCloud move). Script approved; user: end tag ALTERBASE.
- Voice: VoiceStudio "scroll 2 buena español". Takes clipped the last syllable even at +35 % duration → new trick: generate each paragraph + " Veamos." and cut in the pause before it (`voice/gen2.py`); falls 250–480 ms, natural pace, 97.05 s.
- Look notes (user): city like the reference (slate blocks, few warm windows), every label white, more detailed people (agent: `src/people-hd.js`, ~24 meshes, +0–18 % render time).
- Bugs met: `updateMatrixWorld(true)` ignores stale parents → `updateWorldMatrix(true, false)` in `wpt`; a cyan wash on the floor = the rim light's specular at grazing angles (floor roughness 0.45) → floor r 0.8, rim 0.25; the bus was offset twice (child of the city group).
- Review: text PASS · dead beats PASS · loudest window in the payoff (74.8 s) with 1.4 s of silence before it · story arc 3/4 (music under the voice in the journey acts is 11.7 dB under the gift, as in shazam) · narration density FAIL (the voice runs ~3.3–4.5 words/s on some lines) · morph grid FAIL (dissolves follow the voice, not the 8th grid — expected for scroll3d).
- Master: −10.6 LUFS, TP −1.3 dBFS (export's −14 then loudnorm −9.5 → remux of final.mp4 and share.mp4). Needs ffmpeg-full on PATH for review/captions (`/opt/homebrew/opt/ffmpeg-full/bin`).
