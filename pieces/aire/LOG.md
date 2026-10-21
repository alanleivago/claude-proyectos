# aire — log

## 2026-10-19 — story, board, build
- Reference `8.mp4` (105.9 s, 34 shots). Script approved; the user's take 110.1 s (Whisper writes 100, 0.81, 250 as digits → lines.txt in the same form so align.py matches).
- Reused pieces/roadster/src/world.js; `src/extra.js` adds the stage (everything else hidden while on it), town crossing + traffic light, gas station, rock, woman, x-ray tanks, Corolla motor, Plaid, two extra Roadsters.
- Fixes before the board: line-up cropped (cars side by side, camera from the front); balloon hid the woman; her hair cap covered the face.
- Storyboard approved (29 panels), same look as roadster.

## 2026-10-19 — render + review
- 3340 frames in 6 chunks (~0.27 s/frame). Text check found 4 labels (rock tag over the pill, "+ ?" and the balloon labels off-screen) → fixed, those frames re-rendered.
- Loudness: the user wanted the bgm and the master up. bgm 0 dB in the track shape, voice.music −4. Master target pushed until the limiter hits the wall: −9.7 LUFS clipped the AAC (+0.5 dB), so settled at −10.0 LUFS, mp4 peak −1.3 dB (roadster was −11).
- Final: story arc 5/5 · text PASS · dead beats PASS · −10.0 LUFS, TP −1.3 (mp4). The loudest 100 ms window sits at 39.5 s (−9.8 dBFS), not in the live run: at this loudness the limiter flattens every hit to the same level. Grid check FAIL is expected (cuts follow the voice, not a 120 BPM grid); narration density FAIL is the user's take (>3.5 words/s in places).
