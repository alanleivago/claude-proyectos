# El límite del Roadster — brief

**Style:** scroll3d. **Format:** 9:16, 1080×1920, 30 fps, 111.3 s (voice 110.1 s + 1.2 s tail).
**Source:** Spanish remake of `Ref Scroll animations/8.mp4` (thrust vs tire grip, 105.9 s): its 34 shots and camera moves, re-timed to the user's voice through line anchors (`ANCH`). Built on the roadster world (pieces/roadster) + `src/extra.js`.

## Changes from the reference
- The red Corolla at the light (reference: grey sedan), in a small town crossing beside our test track.
- The rock falls from our truss gantry tower (reference: a water tower); the race and every number in km/h.
- The balloon is let go by a woman by the grandstand (reference: a living room); the "air around you" shot is her, outdoors.
- Gas station with a red "GASOLINERA" canopy; dark stage plinth for the diagrams; the improved Roadster with x-ray tanks; HUD pill, readout, timer box, bars; DOPAMENTES centred.

## Sound
User's documentary track from 4 s, louder (0 dB, voice.music −4), silent 0.9 s before the live run, +4 dB on it; code SFX ×3.5; 22 quiet recordings (`sound/layer.py`). Master −9 LUFS, TP −1 (user: "sube la bgm y el master").

## Claims and sources
- Falling rock 0→100 km/h in 2.83 s: 27.78 m/s ÷ 9.81 m/s² (arithmetic). Tires ≈ 1 g; the Roadster needs ≈ 3.5 g (27.78/0.81/9.81).
- Model S Plaid 0–60 mph 1.99 s (Tesla's figure) — https://www.techradar.com/news/crazy-fast-tesla-model-s-plaid-is-now-on-roads-and-it-plays-ps5-level-games · https://www.topgear.com/car-news/electric/tesla-model-s-plaid-200mph-1020bhp-electric-car
- Thrusters 4–5× the tires (Tesla's claim) — https://cellcog.ai/blog/tesla-roadster-physics/
- Thrust trims: < 1 s; Performance has no thrusters — https://www.topgear.com/car-news/electric/tesla-roadster-has-finally-landed-thrusters-0-60mph-059s-and-flight · https://www.engadget.com/2288437/teslas-redesigned-roadster-cold-gas-thruster-option-reservation/
- 0.81 s on Tesla's timer — https://electrek.co/2026/10/15/an-updated-technical-look-at-teslas-kick-flipping-0-60-in-1s-next-gen-roadster/
- ≈ 250 kg of air (flight configuration) — https://dealroom.co/news/163238-how-teslas-roadster-flips-250kg-of-compressed-air-10-spacex-style-thrust/
- Self-refill with outside air: Tesla's claim, recharge time undisclosed — https://www.digitaltoday.co.kr/en/view/115853/tesla-roadster-can-self-recharge-compressed-air-recharge-time-undisclosed (Top Gear reports a station refill for the Thrust tank: conflicting, so "según Tesla").
- "Rocket fuel vs squeezed air" bars: illustrative, no numbers.
