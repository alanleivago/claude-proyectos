# LOG — rayos

## 2026-10-14 run 1
- Intake: new style from `Ref volt y amps/`; EN paraphrase of the Spanish ref, condensed (162 s → 132 s), title at start, voice by user.
- Fact-check changed: "3 of 4 never touch" → "most"; field ratio phrased without "10×"; Empire State "about two dozen".
- Voice: one take (125 s) — first pass mis-aligned (take reads the title aloud) → difflib alignment + a `title` line; all 19 cuts in inter-word gaps.
- Look: v1 cloud read as a bucket (core `trace` smooths points) → rigid `vaTrace` + union-envelope dome + lens anvil; town ×1.4.
- User: "push it further" → far bank/ridges, rain, grain, glyph glow, cloud boil + inner light.
- Board: fixed far ridges filling below the ground; types labels collided; "10 % +" over the bolt.
- Music: user's track (Ref "Documentary Background Music"), shaped to `audio/track-shaped.wav` (dip −26 dB through the 0.65 s silence before HIT, 7 s tail fade); SFX bus loud.
- ffmpeg 9 (Homebrew) has no drawtext/subtitles → installed keg-only `ffmpeg-full`; run export/review with PATH=/opt/homebrew/opt/ffmpeg-full/bin:$PATH.

## Review (final)
| check | result |
|---|---|
| text | PASS (0 cut-off, 0 in safe zone) — fixed: −15 °C off-frame in zoom, 16 labels under the phone UI |
| sound | loudest = HIT 60.4 s (−9.1 dBFS), 0.9 s silence before; −14.1 LUFS, TP −1.4 dBFS |
| story arc | 4/6 — FAIL "peak has most cuts" (voice-led fixed stage, no cut engine); FAIL "goodbye decays" (end −27.5 vs gift −22.9 med; needs −29) |
| narration | word hits PASS; density FAIL on 3 lines (return 3.9, upward 4.0, rod 3.5 w/s — the take's own pace) |
| dead beats | 1 WARN (98.75–101.75 s, positive stage) |
| per shot | 1–20 PASS on stills/board; weakest: 16 positive (slow), 11 hit frame crops the cloud top during the shake |
- run 2: removed the rain hiss bed (pumped audibly in every voice pause), title hit softened, 'Bitvolts' sign-off under the end title.
