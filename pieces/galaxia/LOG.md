# galaxia — LOG

## 2026-10-18 — first build
- First pixdoc piece with a narrator. Voice take 65.1 s → 12 lines cut at silences (energy minimum, all cuts ≤ 5 dB); voice.mjs's own whisper heard 6/170 words, so word times came from faster-whisper (small, es) on the full take, offset per line.
- Storyboard round 1 fixes before showing: diffuse arm light (the stars alone didn't read as spiral), overlapping labels (Sgr A*, TÚ ESTÁS AQUÍ, VÍA LÁCTEA), the elliptical came out square (RNG.n is not gaussian → Box-Muller `gauss`).
- After export: "≈ 4 MILLONES DE SOLES" at scale 2 overflowed → split; the Milky Way under "HOY" at the start of shot 11 → moved up.
- Tooling: tile.mjs takes frames space-separated (a comma list gives NaN frames); export's narration-caption burn fails on this ffmpeg → `--no-captions`; review via the drawtext-stripping shim (recreated in the scratchpad).
- review.mjs: cuts 11/11 on grid; story arc PASS 7/7; loudest 100 ms 44.0 s (−7.2 dBFS) after 1.0 s silence; text PASS; dead beats PASS; no flat frames; loudness −13.8 LUFS, true peak −2.5 dBFS. Narration density FAIL on one line only ("aquí estás tú…", 3.58 w/s — the take's own pace).

| shot | verdict | note |
|---|---|---|
| 1 title | PASS | spiral push-in, subtitle |
| 2 bang | PASS | point → flash → fireball, sparks |
| 3 dark | PASS | haze + 3 mote layers, web hint |
| 4 web | PASS | draw-on filaments, gas drift |
| 5 stars | PASS | ignitions, counter |
| 6 small | PASS | 8 mergers with tails, far pairs |
| 7 disk | PASS | flatten + arms |
| 8 hush | PASS | 1 s silence |
| 9 hole | PASS | loupe, accretion disk, orbits |
| 10 today | PASS | HOY, spring to the Sun |
| 11 andro | PASS | approach, tails, starburst, elliptical |
| 12 end | PASS | title |
