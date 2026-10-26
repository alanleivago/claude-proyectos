---
type: brief
status: active
tags: [scroll3d, airtag, scroll-engineer, remake]
relatedTo: [styles/scroll3d/STYLE.md, pieces/shazam]
---
# Cómo te encuentra un AirTag — brief

**Style:** scroll3d. **Format:** 9:16, 1080×1920, 30 fps, 97.05 s (voice 95.8 s + 1.2 s tail).
**Source:** Spanish remake of @scroll.engineer #2 (AirTag, 2026-10-07, 97.6 s; `Ref Scroll animations/2-airtag.mp4`): its shots and camera moves, re-timed to the Spanish voice through line anchors (`ANCH`, 54 pairs).
**Voice:** VoiceStudio "scroll 2 buena español" (44a50a60), 10 paragraph takes, each with a sacrificial "Veamos." cut in the pause before it (`voice/gen2.py`), joined by `voice/clean.py`, aligned by `voice/align2.py`.

## Changes from the reference
- A train station at night (benches, pillars, SALIDAS board, arched trusses) instead of the airport; a bus instead of the shuttle.
- A mustard ribbed suitcase with the AirTag in a tan leather holder (reference: white suitcase).
- Detailed pov3d-style people (`src/people-hd.js`: faces, hair styles, hoodies/jackets/shirts, sneakers, glasses, bags) instead of grey mannequins.
- Cyan Bluetooth dome and rings (reference: blue), yellow report beams and pins (reference: green); status pill on top in Spanish.
- The search screen reads "Buscando · Maleta · 1,8 m a tu izquierda" (reference: feet). All labels white (user). End tag ALTERBASE (user).
- City in the reference's slate monochrome with sparse warm windows (user).

## Sound
User's documentary track (`Ref volt y amps/`), −4.5 dB, silent 1.15 s before "la flecha", +3 dB on it; code SFX ×3.5 (pings, pops, ticks, risers); 20 quiet recordings (`sound/layer.py`, credits in `sound/CREDITS.md`). The loudest hit: the arrow (ref 77.0 s).

## Claims and sources
- AirTag has no GPS; it uses Bluetooth and the encrypted, anonymous Find My network; nearby devices send its location to iCloud — [Apple: AirTag](https://www.apple.com/in/airtag), [Apple Support](https://apple.co/3oR5Pkx).
- Precision Finding uses Ultra Wideband on supported iPhones only — [TechCrunch 2021](https://techcrunch.com/2021/04/20/apple-officially-unveils-its-lost-item-finder-airtag), [Pulse 2.0 (AirTag 2026)](https://pulse2.com/new-apple-airtag/).
- "1,8 m a tu izquierda", "hace 1 min", the Bluetooth range drawn: illustrative (marked ILUSTRATIVO / "no a escala").
