# corre — log

## 2026-10-11 — story, look, storyboard, build
- Reference measured (`references/faster/`: 1 s contact sheet, shotlog: 81.75 s, 9 hard cuts, loudest −7.0 dB at 65.8 s). Story approved as is; title kept exactly as the user wrote it (the double meaning of "correrse" in Spain was mentioned once).
- New build in four files: `scenes.js` (story curves, speed/distance tables, camera, code textures), `world.js` (ground scene), `space.js` (Earth, Moon, Jupiter, relativistic stars), `run.js` (per-frame posing, 2D lens effects, HUD, text).
- Look rounds: sun moved into frame (az −13°); title fit 800 px; black ground-floor boxes → glass shop fronts; hero car moved to the far lane; look-back zoom blur centred on the point behind; Moon/Jupiter: wrong z sign (came from behind), lit from behind (black on black) → light from the side, camera glances at each; Moon maps reused from luna; Earth noise lattice made seamless with a configurable period (6 cells) — continents instead of camouflage; shards bigger, additive.
- User notes on the storyboard: car detail (extruded side profile, glass house, rims, bumpers, grille, plates, mirrors, door seams, handles), atmosphere feather (back-face halo shell computed from the ray's closest height; softer inner rim), more saturated sky and a bluer sea.
- Sound (recorded, sound/): 104 bed layers (bed.py) + 3 cues (mix.py). Footfalls cut from one recording and placed on the camera's own stride phase (56 steps); car passes placed from the computed pass times (passes.json); nothing from behind after Mach 1. Rebalanced 4 times so the hit (65.5) is the loudest: −15.1 LUFS, TP −2.0 dBTP, loudest 100 ms 65.7 s −9.5 dB, silence 64.9–65.42.

## 2026-10-11 — export + review
- Export: 1800 frames in 1192 s (~0.66 s/frame); re-rendered 624-744 and 1308-1799 after the review fixes (captions shortened out of the safe zone; "días" caption moved to 62.5 s when γ passes a day; 1-decimal Earth time under 10 s; slow roll in the light phase; a breathing glow behind the end card). final.mp4 re-encoded from frames + sound/audio/mix.wav (CRF 14), share.mp4 CRF 24.
- review.mjs: text PASS (0 cut-off/overlap, 0 in the safe zone); story arc PASS 5/5 (gift p90 -10.5 vs peak -12.6; silence median -35.9); loudest 100 ms 65.7 s -9.7 dBFS in the payoff act; 0.5 s <= -40 dBFS before it; -15.1 LUFS, TP -2.0. Dead beats WARN: 55-59, 61-65 (relativistic sky changes slowly), 70.25-75 (end card).
- qa.py (sound-layer): PASSED, 0 failed (picture cut at the hit frame 1572: 233 vs local 5.5).
- Weakest: the relativistic stretch and the end card read as still at phone size; Jupiter's caption lands just after it has passed; the car glass house is barely visible on white cars.

## 2026-10-11 — re-render (user notes)
- Title → "¿Que pasaría si corrieras cada vez más rapido?" (user's exact words). Towers: curtain walls burst as you pass (7000 shards, triggered 0.15-0.5 s before you arrive so the glass fills the street ahead), 44 more cars, visual speed 260 → 470 m/s, FOV 66 → 75°, stronger zoom blur, speed lines. Jupiter: lit from the camera side (no hard terminator), farther and less of a head turn so it sits right of the HUD (the HUD's dark feather no longer lands on the bright planet); its caption at 52.1 s when it is in view. Sound: 7 faint, filtered glass bursts in the towers.
- qa.py PASSED (0 failed; -15.2 LUFS, TP -1.9). review: text PASS, story arc 5/5, loudest 65.7 s -9.7 dBFS after 0.5 s silence; dead beats WARN as before (54-59, 61-65, 70-75).
