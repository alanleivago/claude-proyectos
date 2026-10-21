# meteorito — log

## 2026-10-13 — Spanish version of asteroide
- User approved asteroide ("excelente") and asked for it in Spanish with fixes:
  - title in their words: "¿Que pasaría si un meteorito cayera en tu ciudad?"; HUD in km and km/h (Spanish pieces use metric)
  - "a strange line in the sky": the porch valance texture repeated in v, so filtering bled its opaque top row along the plane's bottom edge (a dashed line under the valance, across the sky). Fixed with wrapT = clamp (also in asteroide/src).
  - people screaming and alarmed after the silence: 7 staggered screams near and far, a yelling crowd, an alarmed murmur, dogs (Wikimedia Commons CC0/PD; the Wilhelm-scream recording kept low and far).
  - more disaster in the countryside after the blast: ~40% of houses fold and slump, fires on houses, haystacks and trees (flickering flames, dark smoke columns leaning with the wind), embers, ~900 pieces of wreckage on the ground.
  - end card: "Tranquilo, esto no sucederá de nuevo pronto." then "...o si?" 1.2 s later, "ALTERBASETV" at the bottom.
- Export on the GPU, mix −15.2 LUFS, TP −2.0, loudest 100 ms 57.6 s −7.2 dBFS, 0.6 s of silence before it.
- Review: story arc 5/5 PASS; text PASS (0 cut-off, 0 overlap, 0 safe zone); loudest 57.6 s in the payoff act; 0.6 s ≤ −40 dBFS before it; −15.2 LUFS, TP −2.0. WARN dead beat 64.25–70 s on the end card (the lines now arrive until 67.8 s, still under the metric). Flat frames 1525–1526 = fade to black (intended).
