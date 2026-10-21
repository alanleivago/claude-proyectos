# ¿Qué pasaría si Jesús regresara? — LOG

- **Ref:** "What if Jesus came back" (Ref Lunar Animation). Same structure; places/elements changed: rooftop restaurant → café terrace on a colonial plaza; phone → smartwatch; wheelchair → crutches; highway → private airfield; same night-city descent.
- **Format:** pov3d, 9:16, 24 fps, 79 s (1896 frames), Spanish, no music; real CC0 choirs in 4 moments (17–24, 34–40, 54–61, 66.5–72).
- **Card:** "Más de 4.300 millones de cristianos y musulmanes esperan su regreso." → "¿Estás listo?" → ALTERBASE.ESP (user chose this over the usual "esto nunca pasará").
- **Facts:** Pew 2025 (2020 data): Christians 2.3 bn (28.8 %), Muslims ~2.0 bn (25.6 %). Verses: Mt 24:27, 24:29, 24:36, 24:40; 1 Tes 4:16; Ap 1:7, 6:15, 21:4.

## Build
- src: heaven.js (one shared sky dome: dusk, the opening with rays and lens-cloud rings, eclipse ring, night, stars, falling stars; 2D bolt), plaza.js (facade textures with map+emissive, clock tower, café, fountain, tram, pigeons, bistro tables/chairs), plazapose.js (one clock for every pose across cuts), far.js (cemetery with light columns, airfield, city street + 2D figure), shots.js, overlays.js.
- User notes applied: panel 13 the figure must read as Jesus → long hair, beard, halo, tunic + mantle, open arms with palms out, no facial features; airfield brightened (floodlights, apron texture, closer camera); kneel panel reframed.
- Gotcha: state read across frames (the tray's release point) broke single-frame stills → compute it deterministically.
- Gotcha: a hero cue with "align": "peak" on a sound whose peak is late starts early and fills the planned silence → use "align": "start".

## Checks
- QA PASSED: sync 0 samples, -15.6 LUFS, TP -2.4 dBTP, DESCEND lifted 8 dB, no unplanned silence (fixed a gap at 46.0–46.5 by extending the wind).
- Loudest 100 ms: 66.5 s (the descent), after 1.05 s of digital silence (65.45–66.5).
- Review first run: story arc 5/6 (peak cut rate 0.15 < journey 0.18) → added two shots (sun2 50.5 s close on the black sun; grave2 57.5 s low among the graves), re-rendered 1104–1464; night cloud sprites hidden.
- Review final: cuts on grid PASS, story arc 6/6, text PASS, loudest 66.5 s in the payoff with 1.2 s silence before; dead-beat WARN on the end card (as always).
