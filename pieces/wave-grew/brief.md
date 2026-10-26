# wave-grew — What If a Wave Grew and Couldn't Stop?

## Spec
- 16:9, 1920×1080, 30 fps, 510 s (8:30), 15,300 frames. English on-screen text, no voice.
- Style **pov3d-hd** (new, from the reference channels AfterTheDoor / frame-onee / Minute Zero: their 7 most-viewed videos, studied in `references/couldnt-stop/`, local only). three.js r149 into an offscreen WebGL canvas + a 2D HUD.
- Format **F5 fixed hero**: you are the surfer; one continuous POV shot. Teaser 0–6.2 s (story time 380 s), 0.8 s black, then the ride from 1.2 m.
- Topic check (2026-10-24): 36 YouTube searches; "wave grew and couldn't stop" has no video. Adapted from our pieces ola-700 / tsunami-ny.

## The height curve
`waveH(st)` = 10^knots(LOGH): 1.2 m (7 s) · 26.2 m (70) · 524 m (145) · 1.5 km (175) · 3.68 km (195) · 8.85 km (215) · 19 km (236) · 100 km (275) · 1,000 km (315) · 12,700 km (405) · 384,400 km (468). Speed √(g·h). Distance travelled is small (14 km at 8.8 km high), so each stage is one region seen from higher and higher.

## Beats
| # | story time | height | picture |
|---|---|---|---|
| 0 | teaser | ~6,800 km | the wave rings the planet, "You can't get off." |
| 1 | 7–90 | 1 → 40 m | beach, swimmers, pier, lifeguard tower; 26.2 m at 70 s |
| 2 | 90–160 | 40 → 830 m | lighthouse, rooftops, the town below; 524 m at 145 s |
| 3 | 160–240 | 0.8 → 19 km | clouds; the sea ahead drains (195–212); Everest; airliner; crest boiling |
| 4 | 240–315 | 19 → 1,000 km | the sky goes black, stars by day, spray freezes, ISS below |
| 5 | 315–405 | → 12,700 km | it wraps the planet; the oceans drain to grey basins |
| 6 | 405–470 | → 384,400 km | geostationary ring, the Moon; silence, then the crest hits the Moon (468) |
| 7 | 470–510 | — | the lip closes: the barrel holds the Moon; end card at 498 |

## Sound plan
Recordings + a code-synth layer (pov3d rule). No music, no voice. Ambience → wave roar → thinning air → drone in space; ≥ 0.6 s silence before the Moon hit (the loudest moment). −14 LUFS, TP ≤ −1 dB.

## Claims + sources
- Biggest wave ever surfed: 26.21 m, Sebastian Steudtner, Nazaré, 29 Oct 2020 — Guinness World Records (2022-05-24).
- Tallest wave ever measured: 524 m run-up, Lituya Bay, Alaska, 9 Jul 1958 — NASA Earth Observatory; Fritz/Weiss et al. 2009 GRL.
- The Chicxulub (dinosaur) impact tsunami's initial wave ~1.5 km — Range et al. 2022, AGU Advances (Eos coverage).
- Average ocean depth 3,682 m; ocean volume ~1.332 billion km³ — NOAA/WHOI 2010, NIST.
- Armstrong limit ~18–19 km: water boils at 37 °C — Wikipedia / Stratocat / Guinness.
- Tsunami speed √(g·d) — NOAA / ArcGIS Learn.
- Kármán line 100 km; ISS ~400–420 km; geostationary 35,786 km; Moon 384,400 km; Earth diameter 12,742 km — standard values (NASA).
- Statue of Liberty 93 m (ground to torch), Eiffel Tower 330 m, Burj Khalifa 828 m, Everest 8,849 m — standard values.
