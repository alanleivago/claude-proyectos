---
type: spec
status: active
tags: [rocket-speedup, pov3d-hd, couldnt-stop, youtube-long]
relatedTo: [wave-grew, luckier, pov3d-hd]
---

# rocket-speedup — What If Your Rocket Couldn't Stop Speeding Up?

## Spec
- 16:9, 1920×1080, 30 fps, 510 s (8:30), 15,300 frames. English on-screen text, **no voice** (research 2026-11-03: 12 of 15 channels in the niche have no narration, incl. Minute Zero).
- Style **pov3d-hd** (kit `styles/pov3d-hd/kit.js`, HUD `hdHud`, caption, blobs). Base copied from `pieces/wave-grew` (head.html, core3d.js, scenes.js).
- Format **F5 fixed hero**: one continuous first-person POV from the cockpit. The window frames the world; a rear monitor on the console shows what's left behind. A photo taped on the console is the identity cue (first and last shot).
- Topic check (2026-11-03, yt-dlp searches): no "rocket kept accelerating / couldn't stop speeding up" video above 300 views. Title mirrors Minute Zero's "What if Your Car Couldn't Stop Speeding Up?" (426k).

## Device
The engine pushes a constant 1 g forever: inside it feels like standing on Earth the whole way, while speed climbs to 99.99…% c and the two clocks split.
HUD left: SPEED + NEXT · target. HUD right: YOUR CLOCK / EARTH CLOCK. Bottom: italic caption.
Physics: v = c·tanh(gτ/c), d = (c²/g)(cosh(gτ/c) − 1), Earth time t = (c/g)·sinh(gτ/c). Below ~1% c: v = g·t, d = ½gt².

## Beats (approved 2026-11-03)
| # | t (s) | speed / clock | picture | sound |
|---|---|---|---|---|
| 0 | 0–6 | ~99.9% c | teaser: universe squeezed into a blue ring ahead. "You can't turn it off." | drone, black 0.8 s |
| 1 | 6–45 | 0 → Mach 1 (35 s) | launch pad, countdown, the photo on the console, crowd watching, liftoff | silence → engine roar |
| 2 | 45–95 | → 7.8 km/s | clouds, sky goes black at 100 km; orbital speed but doesn't stay; CUTOFF → FAILED | air thins |
| 3 | 95–150 | 11.1 → 87 km/s | beats Apollo 10 record; the Moon sweeps past the window (2.5 h) | Moon whoosh |
| 4 | 150–210 | 176 → 2,100 km/s | passes Parker Solar Probe (5 h); Mars at 2.5 days, Jupiter, Saturn rings | each planet voiced |
| 5 | 210–265 | 3.6% → 10% c | Pluto at 13 days; Voyager 1 in the window (27 days vs its 49 years); stars ahead turn blue; RADIATION alarm | hydrogen becomes radiation |
| 6 | 265–330 | → 98% c | TURN: a 1 mg sand grain at 99% c hits like ~131 t TNT; Proxima: 2.3 yr yours / 5.1 Earth; 1 s silence → LOUDEST HIT, glass cracks | silence → loudest |
| 7 | 330–400 | 99.99% c | quiet: starbow, everything gathers ahead, black around; galactic centre 10.6 yr / 26,000 yr | lowest |
| 8 | 400–460 | 1 − 10⁻¹² c | leave the Milky Way (12 yr), whole galaxy on the rear monitor; Andromeda 15 yr / 2.5 Myr | rising drone |
| 9 | 460–510 | — | 22 yr yours / 5,000,000,000 Earth: the Sun is a red giant; callback to the photo; end card "It felt like home the whole way. There's no home to go back to." + ALTERBASE | fade |

## Sound plan
Sonido pro (real recordings + code synth for weight), no music, like wave-grew. ≥ 1 s silence before the dust impact (loudest). −14 LUFS, TP ≤ −1 dB.

## Claims + sources
- Apollo 10, 39,897 km/h (11.08 km/s), 26 May 1969 — Guinness World Records (current entry 39,937.7 km/h).
- Parker Solar Probe 635,266 km/h (~176 km/s), 2023/2024 — NASA via Space.com / Live Science.
- Voyager 1 ~17 km/s, one light-day (25.9 billion km) Nov 2026 — Gigazine / NASA dates.
- Sun escape speed at Earth's distance 42.1 km/s; Earth escape 11.2 km/s — physics.info, Astronomy.
- Constant-1 g travel: galaxy diameter ~12 yr ship time, ~113,000 yr Earth — Wikipedia "Space travel under constant acceleration"; Universe Today.
- Interstellar gas becomes an intense radiation beam above ~0.1 c; dust is the most damaging — Semyonov 2009 (arXiv physics/0610030).
- Computed by us (relativistic rocket equation, 1 g): Moon 2.5 h, Mars ~2.5 days (225 M km), Pluto ~13 days, Voyager's distance ~27 days, Proxima 2.3 yr / 5.1 yr, galactic centre 10.6 yr, Andromeda ~15 yr, 5 Gyr Earth at ~22 yr; 1 mg at 0.99 c: (γ−1)mc² ≈ 5.5×10¹¹ J ≈ 131 t TNT.
- Simplifications: liftoff thrust > 1 g, then held at 1 g; cosmic expansion ignored at Gyr scale.
