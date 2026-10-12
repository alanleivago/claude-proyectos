# luna — log

## 2026-10-10 — build to stills + storyboard (export NOT run: waiting for storyboard approval)
- Copied piece.json + src from styles/pov3d/template-ola; name luna, 70 s, 1680 frames; build list kept.
- Reference measured: shotlog (loudest −9.1 dB at 55.9 s; 0–18 s ≈ −30…−24 dB; 19–68 s ≈ −17…−11 dB), spectrogram `references/lunar/moon_spec.png`, key stills `moon_s*.png`, `moon_keys.png`, comparison `moon_cmp.png` (reference top, ours bottom).
- Look round 1: church tower too big/close; roofs missing (gable winding inverted → culled); sea washed white (glitter wide term); moon craters like soap bubbles, maria too faint.
- Round 2: fixed moon map, glitter, bluer moonlit sky, darker ground, church moved; a PowerShell Get-Content/Set-Content pass broke UTF-8 (mojibake in captions) → repaired; rule: edit sources with Edit or .NET UTF-8 (no BOM) only.
- Round 3: roof winding fixed, church scaled 0.7, window light ×1.9 and more lit at start, molten-interior shader with veins instead of stripes.
- Round 4 (vs reference): taller town (3–6 floors) and camera 40 m / z 14 so facades with lit windows fill the lower third; fireball + 70 burning debris at the break-up; plates drift slower; lip mist less regular; moon shell 240×120 so plate edges are less saw-toothed.
- Score: no pad/pluck/chime/stab (template's musical layers removed). Rebalanced the 5–16 s ambience (+5 dB).
- Checks: build syntax ok; tile 24 400 900 1400 → ms/frame 2058 1096 1036 1070, deterministic: true; textcheck PASS (0 cut-off/overlap/safe-zone); score −16.5 LUFS, peak −1.4 dBFS, loudest 100 ms −7.8 dB at 63.2 s, vacuum −99 dB, 64–66 s silent.

## 2026-10-10 — polish round (user notes, before storyboard approval; export still NOT run)
1. Moon = 22 solid wedges: crust patch (border vertices snapped to the bisecting great circle → smooth edges, slight rim chipping, rough displacement) + 5-row jittered fracture walls down to an inner apex; molten fracture shader (dark crust, orange veins, hotter deeper, cooling 42–50 s); chunks rotate about their own centres; flame + smoke trails per chunk; 160 rubble rocks (30 drift off from 29 s, 130 thrown at the break-up).
2. Moon maps in code: albedo (larger, darker maria, soft bright ejecta, rays on 4 craters) + height map (bowls, raised rims, central peaks) → bump normal in the shader (rim lit on the sun side, shadowed floor).
3. Fire: horizon glow ×1.6, 0.25 s white flash + 2.2 s fireball + 12 s burning base per impact, flashes pulse the key/fill/hemi lights and exposure, 90 embers rising over the town, warmer sky and clouds.
4. Smoke: billowing columns (puffs born every 0.55 s, 9 s life, rising and slowing, growing, drifting with wind, orange-lit at the base → dark grey; lit-from-below billow texture); ocean impact column white.
5. Pale band at the wave foot: spray pool now depth-tested; toe mist patchy (noise along x), smaller, above the water; wave toe foam ×0.3; sea churn foam ×0.35; the harbour refills with the surge ahead of the wall (57.2–61.2 s) so the drained bed no longer shows as a grey strip.
6. Tide +4.3 m (water over the quay into the first street rows), foam lines at the flood edge (sea shader `uFlood`), spill foam along the quay edge, analytic street-lamp reflections in the water (24 lamps), boats rise above the wall.
7. Close figures: a roof terrace just below the camera (parapet, pots, table, stair hut with lit door, string of bulbs) with 4 people (come out 6–11 s, point at the Moon, run back in at 38.7–39.8 s) + 9 neighbours in the street below (out 7–15 s, flee uphill 38.5–41 s).
8. Sound 5–16 s: 3 TV/radio voice beds (formant noise, no music), 20 neighbour calls, 16 more shutters, footsteps, 9 more barks, a moped, a wind bed. Sub rumble trimmed (28–38 Hz sine −6 dB, brown bed −2 dB) to win back integrated loudness.
- Checks: build ok; tile 24/400/900/1400 → 2319/1158/1138/1141 ms, deterministic: true; textcheck PASS; score −17.4 LUFS, peak −1.4 dBFS, loudest 100 ms −7.3 dB at 63.2 s (the hit), 62.45–62.95 −99 dB, 64–66 s silent, 5–16 s now −33…−28 dB (reference ≈ −30).

## Weakest / to do
- Integrated loudness −17.4 LUFS, under the style's −14…−16 target (the tail normalises RMS to −17 dBFS; the denser ambience lowered it).
- Crater rims in the maria still read slightly ring-like at full size; the fracture walls show faint radial facets.
- The wave foot meets the refilled harbour with a hard line (no churning white water at the toe).
- Beat 1–2: the flood and the terrace people are in the lower corner, partly under the caption zone at times.
