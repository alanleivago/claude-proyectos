---
type: style
status: active
tags: [zawdog, lowpoly, ps1, blender, dog]
relatedTo: [pieces/zaw-dog-01, pieces/zaw-dog-02, pieces/zaw-dog-v2]
---
# zawdog: dog shorts in @zawpolyshorts style

Copy of the user's approved rules (memory), so they can be used on another machine.

## Format
- 9:16 English shorts, ~30-40 s. Dog-behaviour premise ("Your Dog Thinks X When You Y"), true-fact twist, ending that loops into the first line.
- Notes on Zaw's channel: fuentes/zawpolyshorts-style/. Dog tutorials: fuentes/blender-lowpoly-perro/. VLVT guide: fuentes/blender-lowpoly/vlvt-guide.md.

## Dog (APPROVED)
- pieces/zaw-dog-v2: dog.py, bake.py and README. The .blend is in renders/zaw_dog_v2.blend, force-added to git.
- It must look like a REAL dog: real proportions, photo fur and face, one colour-matched atlas. Never anime or toy-like, and no patches.
- 5 expressions plus a realistic sad face. The ear roots are buried in the skull and the ears are 25% bigger. Use D.happy_wag when a human is near.

## Sets and people
- Sets replicate Zaw's: furniture and rooms modelled in Blender with photo textures, never odd code shapes. Real sky photo with clouds behind windows. Windows have depth: a frame, a sill and a 3D exterior behind them.
- Humans built from Flow photos (front, side, back) with pieces/zaw-dog-01/photohuman.py (VLVT method). The torso sides use the front photo so there are no extra arms.
- Feet always on the floor. Wall pictures are funny dog images.

## Camera (from Zaw)
- Wide game camera at the dog's eye level.
- Hold, then a slow push-in or slow track. No shake.
- Shots about 1-1.5 s, hard cuts.

## Post
- Stable ps1 dither (pieces/zaw-dog-01/final_post.py), then big yellow Courier captions with a black stroke.
- Anti-flicker:
  - the static set is not snapped; only the characters wobble (300-row grid);
  - decals are offset from their surfaces;
  - floors use Linear filtering, props Closest;
  - 16 AA samples.

## Sound
- Voice: VoiceStudio profile "3d cartoon" (227af074), assemble.py at TEMPO 1.1, then retro_eq.py.
- An audible "hero" bark over line 1, about 8-9 dB over the voice, plus many dog SFX throughout. Real CC0 Freesound recordings, checked with earshot ("sonido pro").
- BGM by Bert Cole ("Music composed by Bert Cole — bitbybitsound.com").
- Master at about -11 LUFS with a -1 dBTP limit (sound/mix_zaw.py).

## Workflow
Script, then storyboard (wait for approval), then final, then QA (pop, flicker and feet checks, plus `tools/revisar_render.py --estilo lowpolyshorts`). Name the mp4 after its title, then thumbnail, CREDITS.md and alternative titles.
