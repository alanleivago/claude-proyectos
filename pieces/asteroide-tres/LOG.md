# asteroide-tres — log

## 2026-10-13 — English variant B (user: "same texts, all elements changed, something more creative — e.g. three asteroids, a triple impact")
- Copied from asteroide (with the valance wrapT fix). scenes.js: three asteroid paths (A_PATHS), BURSTS, TB, T_HITS; the sky shader takes three fireball glows (uniform arrays); sun moved to the right; shake impulses for hits 2 and 3.
- world.js: river, railway, bridge, church, streets moved; new seeds for town/trees/taiga/clouds/cows/hay/folk; red-copper crowns; blue-grey porch, sawtooth valance; three cores/glares/rings; trail/plume pools split per asteroid (i % 3); debris in three waves.
- run.js: per-asteroid loop for stars, fireballs, trails, rings, plumes, sky, light; 2D glare/rays/glint/streak per asteroid; three flashes; debris past the lens, brown-out pulses and lens cracks per hit; the train reversed.
- Sky over-bright with three pre-burst glows → glow factor 0.22 → 0.11.
- Sound: −15.3 LUFS, TP −2.0; loudest 100 ms 57.6 s −7.2 dBFS; hits at 57.4 / 58.6 / 59.8 s; silence 56.65–57.25 s −59.5 dB. Deterministic tile check: true.
- Review: story arc 5/5 PASS; text PASS (0/0/0); loudest 57.6 s −7.2 dBFS with 0.6 s ≤ −40 dBFS before it; −15.2 LUFS, TP −2.0. WARN dead beat 64.25–70 s (end card, same as asteroide). Flat 1525–1526 = fade to black.
