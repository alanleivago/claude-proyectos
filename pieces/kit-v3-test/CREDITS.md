---
type: doc
status: complete
tags: [zawdog, kit-v3, credits, mocap, makehuman, kimodo, freesound]
relatedTo: [pieces/kit-v3-test/shots.py, styles/zawdog/STYLE.md, styles/zawdog/motions/README.md, fuentes/mromi-lowpoly/MEJORAS.md]
---
# Credits: kit v3 test clip

## Character
- Body and skeleton: MakeHuman base mesh and "default" rig through MPFB2 2.0.18 (Blender extension). MPFB output is CC0.
- Face and clothes: the approved owner (Google Flow sheet from zaw-dog #2) and six expression portraits made with Google Flow (Nano Banana 2, one image per call via srz-google-flow-mcp, the neutral portrait uploaded as the reference).

## Motion
- Walk: CMU Graphics Lab Motion Capture Database, subject 02 trial 01. "The data used in this project was obtained from mocap.cs.cmu.edu. The database was created with funding from NSF EIA-0196217." BVH conversion by Bruce Hahne (cgspeed.com).
- Shrug: CMU subject 141 trial 21 (same credit).
- Startle: generated on this Mac with kimodo.cpp (Apache-2.0, LocalAI) and NVIDIA Kimodo SOMA-SEED v1.1 (NVIDIA Open Model License, commercial use allowed), prompt "a man startles and jumps back". Text encoder: LocalAI-io/Llama-3-Kimodo-GGML Q4_K (Meta Llama 3 terms).

## Music
- "A Little R & R" from the *16-Bit Starter Pack*. Music composed by Bert Cole, https://bitbybitsound.com (free license; credit required).

## Sound effects (Freesound, CC0)
All checked with earshot (rank/find, realness p_real 0.89-1.00).

| id | name | author | use |
|---|---|---|---|
| [823246](https://freesound.org/s/823246/) | Short male scream | ihitokage | the subtle scream on the scared face swap |
| [434550](https://freesound.org/s/434550/) | breath taken aback | TheCurlyOne | gasp under the scream |
| [505832](https://freesound.org/s/505832/) | Footsteps indoors wood floor | jedg | walk + the steps back |
| [565536](https://freesound.org/s/565536/) | Room tone Medium living room | visionear | room tone |
| [483180](https://freesound.org/s/483180/) | Dog Barking Single 2.wav | SpaceJoe | bark 1 (zaw-dog #5 library) |
| [819516](https://freesound.org/s/819516/) | Pug Barking | WhyNickk | bark 2 |
| [208654](https://freesound.org/s/208654/) | dogskitter.wav | luckylittleraven | paws on the hop |
| [851618](https://freesound.org/s/851618/) | Double small cowbells jingle 2 | Sadiquecat | collar tags |
| [657779](https://freesound.org/s/657779/) | Dog wagging tail | tallandtrue | wag |
| [801176](https://freesound.org/s/801176/) | Surprised - Huh 2 | Sadiquecat | the shrug's "huh" |
| [841349](https://freesound.org/s/841349/) | Dog Panting Loop 2 | qubodup | panting |
