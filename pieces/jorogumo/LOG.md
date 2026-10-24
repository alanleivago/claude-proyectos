# LOG — jorogumo

## 2026-10-21/22 — new style "yokai", story, look (4 rounds), board (3 rounds), build, sound, export
- Ref: `Ref earlobe horror/` 1–5.mp4 (75–80 s, text-only folk tales). Measured: fixed teal/brown palette with ordered dither, ~3 px pixel at 1080, pixel font decoding per glyph, card = pixelated classic print + name + red seal, no voice.
- User notes: much more detail (→ code textures: gravel, basalt, bark, needles, kasuri, robe web, jorō stripes; 45k wind-swayed grass blades, layered cedars, hokora + shimenawa, lanterns); card image must look like a legend print (→ Flow/Nano Banana Pro Edo-style print as asset, 132 px wide through a print palette); more pixelated + cel shading + muted (→ 216×384, MeshToon 3 bands, desaturate, sparse palette); creature was cute (→ noh mask face, long neck, tilted head, ohaguro teeth, long thin arms; the mask splits into eight eyes + fangs); more teal and cold (→ cold grade, palette without mid greens/oranges, denser fog). Language switched to English.
- Bugs: fall veil shader failed to compile (int + float literal) → toFixed; splash hidden by a reset after the update; man under the text in the wide (kept as an establishing shot).
- Sound: Commons CC0/PD recordings + code layer in sound/mix.py; −15.8 LUFS, peak −1.0 dBFS, loudest 100 ms at 45.95 s (the reveal), silence 45.0–45.6 s exact zero.
- Review (scratchpad copy of review.mjs without drawtext): story arc 5/5 PASS (gift p90 −8.6 vs −11.9); text PASS (0/0/0, 310 frames); dead beats PASS; loudest 100 ms 45.6 s in the payoff act, 0.9 s ≤ −40 dBFS before it; after limiter fix −16.2 LUFS, peak −1.4 dBFS. tile deterministic: true. Flat frames only at the dither fades (0–1, 213–217, 1078–1094 planned black, 1797–1799).
| shot | result |
|---|---|
| 1 open | PASS |
| 2 card | PASS |
| 3 nap (wide is establishing only) | PASS |
| 4 threads | PASS |
| 5 stump | PASS |
| 6 pull + black | PASS |
| 7 reveal | PASS |
| 8 mask / run | PASS |
| 9 dawn | PASS |
