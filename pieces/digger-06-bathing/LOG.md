# Digger 06: How people bathed before showers

- Final: `The 1767 Shower That Recycled Your Dirt.mp4` (= renders/digger06_bathing_v2.mp4), 76.8 s, -12.0 LUFS, peak -1.5 dBFS (mix TP -1.8 dBTP). Sent to Telegram.
- Cover: `portada_1080x1920.png` / `The 1767 Shower That Recycled Your Dirt.png` (A1: curved grid, 3D "SAME WATER?", Feetham shower + brown stream, she points, eyes open). Tools: engine/thumb_shots06.js, thumb_exp06.mjs, thumb_compose06.py.
- Voice: megagirl clean chain (VoiceStudio baab32b2, 32 steps). Whisper OK on all 9 paragraphs (only spelling diffs: "VIII"). p07 regenerated with "Feethum" so it is heard as Feetham. Pause before "Logging off." (assemble INNER). Speaker sim 0.969-0.992.
- Music: music_d06.py (VSCO-2 CC0 areas). Mix: mix_d06.py, bed 14 LU under the voice, 10 dB duck.
- SFX (Freesound CC0, picked with earshot rank): river 734931, shower 365656, hand pump 832470/832466, bath splash 417786/333349, sniff 346677, shiver 436785, metal scrape 337843, perfume spray 536407, pour 700153; reused CC0 from digger-01/02/03 and zombie-03 (teeth, chain, tank gush, steam hiss, stamp, cloth, glug).
- Shots: engine/d06_head.js + d06_body.js -> d06_shots.js (tools/prep_engine.py). Fix patches tools/p_fix_v2..v6.py.
- Reviews: renders/digger06_bathing_v1_revision.md (17 flags, fixed in one pass), renders/digger06_bathing_v2_revision.md (9 minor flags, open).
- User round 2: opening "Five hundred years ago, there were no showers…" (p01 regenerated, Whisper 1.000, sim 0.993); Henry VIII = lib NPC bank_teller navy + crownOf + royalCape (no custom model); plague-doctor robe/hat/book/flask; strigil2 + oil flask in hand; kettle attached to the mother's hand bone; baby bundle held by the father; shower head on a riser connected to the heater; cover: fist clear of the stream, text clear of the tank. Patches tools/p_fix_v7..v9.py. Renders v3 (reviewed, fixed) -> v4 = final, overwritten as the title-named mp4, sent to Telegram.
