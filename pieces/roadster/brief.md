# Cómo vuela el Roadster — brief

**Style:** scroll3d. **Format:** 9:16, 1080×1920, 30 fps, 89.8 s (the voice: 88.4 s + 1.2 s tail).
**Source:** a Spanish remake of `Ref Scroll animations/6.mp4` (Tesla Roadster upside down, 78.7 s): its shots and camera moves, re-timed to the user's voice through 100 word anchors (`ANCH`). The look follows `7.mp4` (dusk test track, HUD) and the scroll3d kit.

## Changes from the reference
- Dusk desert test track (reference: green floating park): navy-violet-orange sky, mountains, grandstand with ~1,400 people, parking pad with cars and a truck, cones, light poles, rocks and shrubs.
- The loop turns over into a long inverted ceiling deck under a steel truss gantry; a live LED speed sign in km/h.
- An improved silver Roadster: curved, rounded body (tumblehome), glass canopy, 5-spoke rims, red calipers, LED bars; x-ray mode with the parts named.
- A red Toyota Corolla instead of the white Honda Civic.
- HUD: status pill, km/h readout, "RECREADO · ILUSTRATIVO", labels in yellow/cyan/white, karaoke captions in FreeSans Bold. End tag DOPAMENTES.

## Sound
The user's "Documentary Background Music for Videos" from 4 s (voice.music −7), silent 0.9 s before the launch; code SFX (×2.2) on every action; 20 quiet real recordings (car passes, swoops, cloth thumps, clicks, crowd) in `sound/layer.py` → `audio/track-shaped.wav`. Credits: `sound/CREDITS.md`. The loudest hit = the launch (R 59.6).

## Claims and sources
- The demo (mid-October 2026): upside down on a ramp held by suction, then thrusters, a flip and a landing — https://www.motor1.com/news/812195/tesla-roadster-stunt-2028-production/ · https://www.nbcnews.com/tech/tech-news/elon-musk-shows-flying-tesla-roadster-years-delays-rcna603905
- Suction fans "up to 2 G" (Tesla VP Lars Moravy) and cold-gas thrusters — https://electrek.co/2026/10/15/an-updated-technical-look-at-teslas-kick-flipping-0-60-in-1s-next-gen-roadster/
- "0 → 97 km/h en 0,81 s · cifra de Tesla": the live run was timed at 0.81 s after timer trouble; a Tesla claim, not independently verified — same sources.
- "El mismo truco que usa SpaceX para voltear sus cohetes": Falcon 9's first stage flips with nitrogen cold-gas thrusters — https://cosmosmagazine.com/space/launch-land-repeat-reusable-rockets-explained · https://www.wevolver.com/specs/falcon-9-v12-or-full-thrust-block-5
- Dropped from the reference: "4× harder than your tires" (not found), "SpaceX capsules" (Dragon uses hypergolic Dracos, not cold gas), "last night" → "hace unos días".
