# Learning Faces — brief (Madfable long-form cosmic horror, 16:9, ~3:30 + ~20 s red outro, no voice)

Title: Something Down There Is Learning Our Faces
Device: on every dive into the Challenger Deep, a pale face at the edge of the sub's lights mimics the crew, a little more accurate each dive; the last tape shows the cameraman's face — wrong.
Setting: all dark water and the cramped sub; the sub camera HUD (rec, timecode, dive/tape, depth) as an overlay, no wiggle.
Pipeline: copied from pieces/bells (the approved bar): Flow (Nano Banana Pro via MCP) -> tools/gentle.py (480x268 flat greys, 4 px cells, no dither, + a pass that flattens Flow's halftone dots) -> tools/wrong.py (reveal teeth) -> tools/masks.py (fg/bg) -> tools/outline.py (1-cell ring) -> flowShot. Captions in aansa (SUB_S 4), wiggle 1.5 px on picture + captions, HUD/tags no wiggle, Premiere-style B&W on everything but the red outro. voice/script.json + `voice.mjs --scratch` is the clock; Talking 1 Loop.wav under the captions.

## Script
29 approved lines in voice/script.json (scratch timing: last line ends 208.2 s; card +2.2 s; outro +6.4 s, ~21 s).
Longer pauses on `still` (6), `dark` (21), `smiling` (23, hard silence before the reveal) and `wasnt` (24, the reveal: loudest hit + glitch burst).

## Facts (the rest is fiction, user OK)
- 23 Jan 1960: the bathyscaphe Trieste (Jacques Piccard and Don Walsh) reached the bottom of the Challenger Deep, ~10,916 m. Source: https://Wikipedia.com/wiki/Bathyscaphe_Trieste
- Piccard reported seeing a flatfish on the bottom; there was no camera, and the sighting is not accepted today (unlikely at that depth). Sources: https://Wikipedia.com/wiki/Bathyscaphe_Trieste , https://www.usni.org/magazines/proceedings/2020/january/first-deepest-dive

## Look-check assets (gen/PROMPTS.md)
f08_face.jpg (beat 8), f09_pilot_b.jpg / f09_pilot.jpg (beat 9: holding breath / gasp), f24_base.jpg (beat 24, the face; teeth and slipped half added in code).
