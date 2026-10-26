# ¿Qué pasaría si la Tierra saliera del universo durante 5 segundos? — LOG

- **Ref:** "What if Earth left the universe for 5 seconds" (80 s). Timings, beats and camera are copied.
  - **Elements changed:** a hilltop esplanade with a domed palace, the fountain over a bay and skyline (instead of Central Park); a palace brochure (instead of the park map); a purple three-eyed alien child with a remote (instead of the green hoodie alien).
- **Format:** pov3d, 9:16, 24 fps, 80 s (1920 frames), Spanish, no music.
- **Card:**
  - 1964: the oldest light was first blamed on pigeons (Penzias & Wilson).
  - 2012: a test for whether we live in a simulation, through cosmic rays (Beane, Davoudi & Savage).
  - Then "Pero tranquilo, esto nunca sucederá… ¿o sí?" and ALTERBASE.ESP.
- **Facts:** 46,000 million light-years; the Milky Way is 100,000 light-years across; quasars over 500 billion suns; first stars 100–200 million years after the Big Bang; 233 °C (Fahrenheit 451, disputed); the CMB at about 2,700 °C.

## Build
- **Mine:**
  - The skeleton: head, esplanade v1, shots (each from VT(t), a virtual clock that plays 61 → 0.5 s backward during the rewind).
  - Overlays: orange edge ring, counters (km/light-years, years, °C, time), captions that wrap to two lines, cracks, card.
  - Sound.
- **Four agents at high effort**, each in an isolated copy, each owning one file:
  - **space.js:** sunset/night sky, warp streaks, Milky Way, galaxies, the YOU→Earth shot, cosmic web, quasar, first stars, labels.
  - **heat.js:** brochure in hand and burning, steam, burning trees and city, CMB red → plasma → white sky, raised hand.
  - **alien.js:** the alien child in its room, blinking, "oh", pressing rewind.
  - **esplanade.js:** golden light, bay and skyline with reflections, glowing fountain, 19 heroes plus a crowd, detailed palace.
- **Bug caught by the agents:** `EZ.in` does not exist in the kit, so the rewind frames crashed; it is now `EZ.i2`.
- **User notes:**
  - The sunset sky is now blue with a fade (fewer clouds, pale horizon, lower exposure, bloom and flare).
  - The line in panel 5 was a balustrade lamp in front of the camera; the camera is now centred between lamps.

## Checks
- **QA:** PASSED. Sync 0, −15.4 LUFS, TP −2.4 dBTP, REWIND lifted 8.1 dB.
- **Review:** story arc 6/6, cuts on grid PASS, text PASS. The loudest moment is 67.0 s (the rewind). Silence 61.6–62.4 before the alien. Dead-beat WARN on the card.
  - **First run:** 4/6. The silence act held the 62 s cut, and the goodbye was louder than the quiet alien room (room tone up, end down).
  - **Text:** the Earth label and two card lines were in the safe zone; both fixed.
