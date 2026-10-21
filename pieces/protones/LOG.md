# LOG — protones

## Run 1 (2026-10-17)
- Hands: tube fingers (CatmullRom + parallel transport), rounded fingertips (the cone tip removed), nails seated, bare forearm (no sleeve) with the wrist bump. In the magenta phase the bones are dark before the 2D inversion, so they read white after it.
- Park redone after board notes: dense textured lumpy crowns (3 LODs), towers 1 km south, a promenade with benches and lamps, walkers, joggers, a dog walker, people on blankets, a crowd around the lake, a city grid with world-space windows for the rise.
- Shots re-cut to the reference's camera moves (shots2.js):
  - the open: low shot by the water, tracking the dog walker, then a tilt down to the palms;
  - the gone phase: hands raised, a pan over the frozen park, one hand rising;
  - the crack: one cracked hand, then a pan;
  - the rise: crane up to the city grid, then the cracking Earth pulling back;
  - the fall: the Earth rushes in, a crane down, then the hands;
  - the return: a turn to the jogger.
- Motion blur from the camera's rotation half a frame earlier (CAMONLY pass, camBlur in main.js).
- Audio: 41 layers, with recordings from the park/geese/kids searches and the code SFX in synth.py. Mix at −15.5 LUFS, TP −1.95.
- QA: all pass. Hero sync is 0 frames; the picture cut is at frame 1356.
- Review fixes:
  - The whoosh at 19.7 was the loudest moment; lowered it 9 dB.
  - The card title was in the safe zone; changed 56 → 48 px.
  - Silence act now ends at 56.4, where the hit's attack starts.
- Review: story arc 5/5, text PASS. Dead-beat WARN on the static end card (as in the reference).
- End card wording: "casi la mitad" → "cerca de la mitad" (protons ≈ 54 % of body mass).
