# ¿Qué pasaría si la Tierra girara cada vez más rápido? — LOG

- **Ref:** "What if the Earth spun faster?" (Coney Island). Timings, beats and camera copied.
  - **Elements changed:** the Brighton pier (Inglaterra) with its pebble beach and groynes, beach huts, Regency terraces, an i360-style tower and a Ferris wheel on the beach.
- **Format:** pov3d, 9:16, 24 fps, 80 s (1920 frames), Spanish, no music.
- **Card:** 84-minute day = you'd weigh nothing at the equator · the real Earth is slowing: the day gets 1.7 ms longer per century · "Pero tranquilo, esto nunca sucederá… ¿o sí?" · ALTERBASE (the user asked to drop the ".ESP").

## Build
- **Mine:** the skeleton.
  - `head` (17 shots, acts, cues).
  - `shots` (reference cameras from the deck).
  - `overlays`: day-length HUD with sea level, then air left, then "abajo apunta al sur", then "El ecuador · Cuesta abajo"; 15 captions; the card.
- **Four high-effort agents** in isolated copies, one file each:
  - **pier.js:** individual planks, Victorian cast-iron railing, double-globe lamps, columns and bracing, onion-dome kiosks, the pier-head funfair, the pebble beach with groynes and about 800 people, beach huts, cars, terraces and the town up to the Downs, the i360, the detailed Ferris wheel.
  - **ocean.js:** a wave shader, the sea draining south (SEAEDGE/SEA), a wet-to-dry seabed, rocks, seaweed, tide pools, stranded boats, swimmers who stand up, people walking out.
  - **skytime.js:** the real sun path for Brighton, days flashing past, star trails around the pole, lightning, clouds, gulls, the banner plane, the helicopter, debris, and the black noon sky with a harsh sun.
  - **tilt.js:** TILT roll, people and objects sliding and tumbling, cracks, splitting planks, the wheel snapping off its legs and rolling south, the first-person hands.
- **My fixes after the merge:**
  - camera at 11 s (the town looked as if it floated) and at 36 s (a lamp filled the frame);
  - the i360 moved next to the wheel so it is in frame;
  - "ALTERBASE".
- **User notes:** the hands looked blocky. A second agent rebuilt them (rounded palm, knuckles, fingers hooked over the rail, wrist into a denim cuff).

## Sound ("sonido pro": real-sound skill + earshot)
- **Cues** (`out/cues.json`, 43 events) and the brief (`audio/SOUND_BRIEF.md`) come from the picture code.
- **Two agents** sourced and designed it:
  - **Ambience:** 16 field recordings (Brighton beach and gulls, pebble waves, draining water, wind and gale, heartbeat, rumbles).
  - **Event SFX:** 30 recordings (boardwalk footsteps, propeller plane, thunder, helicopter, groans, slides, steel snaps, metal crash, rolling wheel, splitting planks, hand on the railing).
- **Licences:** 46 Freesound recordings (33 CC0, 12 CC BY 4.0, 1 CC BY 3.0). `audit.py` exit 0; `credits.py` wrote `CREDITS.md` and `out/CREDITS_description.txt`. The CC BY credits must go in the video description.
- **Mix:** −14.0 LUFS, true peak −2.3 dBTP, LRA 13.7.
  - The loudest moment is the wheel (65–69 s).
  - The black frame is digital silence.
  - A −2.5 dB ride on 40–63.6 s keeps the wheel clearly the loudest act.
- **Checks:**
  - **qa.py:** sync and edges OK; clicks WARN (the recordings' own transients); masking WARN (the gale gust under the wind bed, the roll under the crash).
  - **earshot timeline:** the snaps land within 0–43 ms of their frames. On the 64–65 s window, "heavy steel beams snapping" is a strong match (z +3.4, 99% against "ding").

## Checks
- **Review:** story arc 6/6, text PASS. Loudest 100 ms window at 69.1 s, in the payoff act. Dead-beat WARN on the card (74.5–80 s), as in earlier pieces.
- **First review run:** 5/6 (gift p90 was only 0.9 dB above the peak act); fixed with the bus ride.

## Revision 2 (user notes: painted clouds, window flicker at 12 s, unbalanced/empty SFX)
- **Clouds:** procedural density-field sprites with self-shadowing (bright tops, grey bases); a cumulus deck plus stratocumulus and cirrus.
- **Window flicker:** z-fighting between the facade texture plane and its box 2 cm behind it; the box is now set back 0.27 m.
- **Sound:** a full rebalance with 27 more recordings (72 in all: CC0 51, CC BY 4.0 20, CC BY 3.0 1).
  - Waves lowered 12 dB.
  - New: pier walla, kids and passers-by; backwash, draining roar and runners on wet sand; 18 wind gusts on the day/night flips; an audible helicopter; jet drone; heartbeat EQ'd to read on phones; breathing; chaos gale with screams, debris and the railing straining.
  - Nothing between 0 and 74 s is quieter than −17.6 LUFS short-term.
- **Checks:** review story arc 6/6; text PASS; −14.0 LUFS, TP −2.3, LRA 6.6; loudest moment 65.4 s (the wheel); card dead-beat WARN.
- **Weak spot:** the thunder at 37.9 s (earshot rates "a loud thunder crack" weak, z +2.1).
