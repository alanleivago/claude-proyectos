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
- Photo-humans: arms joined to the shoulders, real hands that hold props (nothing floating), and faces blended into the head and neck, never a pasted mask.

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
- BGM: ONLY Bert Cole "A Little R & R" (video 1) or "Waiting" (Kaneda videos). Never "Simpler Times".
- Voice: VoiceStudio profile "3d cartoon" (227af074), assemble.py at TEMPO 1.1, then retro_eq.py.
- An audible "hero" bark over line 1, about 8-9 dB over the voice, plus many dog SFX throughout. Real CC0 Freesound recordings, checked with earshot ("sonido pro").
- BGM by Bert Cole ("Music composed by Bert Cole — bitbybitsound.com").
- Master at about -11 LUFS with a -1 dBTP limit (sound/mix_zaw.py).

## Workflow
Script, then storyboard (wait for approval), then final, then QA (pop, flicker and feet checks, plus `tools/revisar_render.py --estilo lowpolyshorts`). Name the mp4 after its title, then thumbnail, CREDITS.md and alternative titles.

## Sets per video (from all 21 Zaw shorts, fuentes/zawpolyshorts-style/escenarios.md)
- Zaw reuses a fixed world: 2-5 sets per video, and a new set only every 2-3 videos, for the hook.
- Ours: a reusable kit (living room, hallway + front door, bedroom, kitchen-dining, street, yard or park), plus at most 1 new hook set per video, which then joins the kit. Vary props, colours and lighting.

## Planos (análisis de Zaw, 2026-11-09; detalle en fuentes/zawpolyshorts-style/planos/PLANOS.md)
- **Corrección del usuario:** en el video 4 había demasiado contrapicado.
- **Mezcla de alturas de cámara:**
  - ~55% a la altura del perro, frontal, horizontal y centrado;
  - ~20% picado suave (mano humana desde arriba, perro mirando a cámara);
  - ~16% humanos a altura humana, en plano medio;
  - contrapicado como máximo 1 por video, con intención;
  - insertos cenitales para objetos.
- **Movimiento — CORRECCIÓN del usuario (2026-11-09):** planos variados PERO la cámara SIEMPRE en movimiento, como en los videos 2 y 3: push-in o pull-out lento, travelling o paneo suave y órbita corta en cada toma. Nunca toda la cámara fija. (El "82% fijo" del análisis salía de fotogramas sueltos cada 2 s y no sirve como regla.)
- **Tamaños:** sobre todo plano medio y entero; nunca dos planos iguales seguidos.
- **Textos amarillos en 3D:** escalones de ~1/11 de la altura de la letra (4-8 px), con los huecos de las letras abiertos, siempre legibles a tamaño de teléfono.

## Texturas (user, 2026-11-10, video 5 — "a partir de ahora")
- **Alfombras:** textura nítida, nunca borrosa ni difuminada (foto Flow de alta resolución o filtrado nearest/closest).
- **Cielo:** foto de cielo de alta resolución, nunca pixelada ni borrosa, en exteriores y ventanas.
- **Animaciones del perro (olfatear, moverse):** suaves y naturales, sin temblor ni vibración de alta frecuencia.
- **Sin intersecciones:** nada atraviesa nada (perro a través de muebles, carteles a través del poste).
