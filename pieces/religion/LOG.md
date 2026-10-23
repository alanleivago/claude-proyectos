# ¿Qué pasaría si la religión desapareciera? — LOG

- **Ref:** "What if religion just disapeared" (Ref Lunar Animation, 62 s). Same structure, elements changed: the church becomes a baroque cathedral; the mosque, Hindu and Buddhist cuts get a synagogue added and a Japanese hall; the Kaaba becomes St Peter's Square; the classroom names become a maternity nursery; the living-room TV becomes a stadium; the city at "7 % of wars" becomes a military cemetery; the street becomes a hospital corridor.
- **Format:** pov3d, 9:16, 24 fps, 64 s (1536 frames), Spanish, no music.
- **Card:** "Casi 6.000 millones de personas tienen una religión." → "¿En qué creerías tú?" → ALTERBASE.ESP.
- **Facts:**
  - Pew 2025, 2020 data: 75.8 % affiliated.
  - Maha Kumbh 2025: 66.21 crore (official).
  - ONS 2024 boys' names: Muhammad, Noah, Oliver.
  - "In God We Trust" on the $1 note since 1957.
  - Encyclopedia of Wars: 123 of 1,763 (7 %).
  - Pew 2019: 36 % vs 25 % "very happy". "Faith as a brake on crime" is softened to an opinion.

## Build
- **fx.js:** `dissolver(st, root, n)` sweeps a clip plane down from the top, and sparks sampled from the surfaces are released as the plane passes them. Also the day sky dome, glass panes, light shafts, candles, lamp rings and crowd rows.
- **sets1.js:** five interiors. **sets2.js:** the plaza church, the city from above, the Vatican, the Ganges. **sets3.js:** nursery, bill, stadium, jewellery shop, military cemetery, hospital.
- **Gotcha:** `camAt` clashes with the kit's `camAt` in morph.js, which is built later and wins. Renamed it `camPt`. Never reuse kit names in shots.
- **Gotcha:** the dissolver must call `root.updateWorldMatrix(true, true)`. Otherwise a nested root, such as the motto on the bill, gets a clip plane computed in local space and is clipped from the start.
- **User note:** in panel 1 the seated people showed through the floor and under the benches. Fixed by closing the pew backs down to the floor and raising the seated crowd.

## Checks
- **QA:** PASSED. Sync 0 samples, −15.4 LUFS, TP −2.4 dBTP, SMASH lifted 4.8 dB in 125–250 Hz.
  - The first smash synth was high-band noise and the glass masked it; it was rebuilt as a low thump.
- **Review:** cuts on grid PASS, story arc 6/6, text PASS. The loudest moment is 46.7 s (the window smash), after 1.0 s of silence. Dead-beat WARN on the end card.
  - First run: 4/6. The silence act contained the 45.5 cut (t0 moved to 45.6), and the goodbye did not decay (alarm +6 dB, end ambiences −4 dB).

## Round 2 (user notes)
- **6 s temples:** less glare. The dissolve now starts at 0.3 s and runs 0.85 s, the sparks are dimmer and smaller, the key and bloom are lower, and the mosque exposure is 0.68.
  - Each interior got `surround()`: paving, rows of houses, trees and far hills in its own theme (Middle East, Europe, India, Japan). When the walls go, the people stay in a street, not a void.
- **15 s city:** street-grid texture, an instanced muted city out to the horizon and hills. Six large coloured temples sit in the centre column (gold and blue domes, gothic spire, pagoda, shikhara, baroque church), with people on their plazas after they vanish.
- **21 s Vatican:** Rome around it. The avenue, palaces, the gardens hill with umbrella pines, far hills.
- **23 s Ganges:** a real reflective river (mirror render target + ripples + fresnel), with marigold garlands floating on it.
- **Captions:** a long line wraps to two lines at 52 px instead of shrinking.
- **58 s hospital:** removed the metal bar that cut through the people. The father leans with forearms on his knees. The child is raised onto the seat. Clean checker floor.
- **Checks:** QA PASSED, review story arc 6/6, text PASS, loudest 46.7 s.
