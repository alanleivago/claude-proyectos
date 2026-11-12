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

## Kit v3 (2026-11-11, test: pieces/kit-v3-test — pending the user's approval before video 6)
- **Rigged humans:** `humans/` turns any Flow outfit sheet (front | right profile | back, A-pose, magenta) + a Flow face into a MakeHuman (MPFB2, CC0) body with the MakeHuman "default" skeleton (`upperarm01.L`, `lowerarm01.L`, `spine02`, `finger1-1.L` ...), real fingers, sneaker volume with a flat sole, ~2.7k faces. Steps: `.venv/bin/python humans/prep_human.py <name>` → `Blender -b -P humans/build_human.py -- <name>` → self-check `humans/inspect_human.py` + `humans/sheet.py` (front/side/back, head, neck, hands, feet, hips) before any shot. In a scene: `import human as HU; P = HU.Human(name); P.play(HU.load_action(...)); P.face("scared")`.
- **Faces:** 6 Flow portraits per person in `humans/<name>/faces/` (neutral, smile, surprised, crying, laughing, scared), each an edit of the approved neutral uploaded as the reference (srz-google-flow-mcp, one image per call). `prep_human.py` aligns them to the neutral and fills the grey background. Hard swap on the beat (`P.face(...)`), also mid-shot.
- **Mocap:** library in `motions/` (56 BVH: CMU + 100STYLE, `index.json` by emotion; credits in `motions/README.md`). `tools/retarget.py` (headless) bakes any BVH / Kimodo clip onto the MakeHuman rig with foot planting (heel/ball locks, analytic leg IK, shoes on z = 0); standing gestures add `still=1 stance=0.12`, walks `yaw=path`. Check every clip with `tools/motion_check.py` (real shoe vertices: no floating > 2 cm, no sinking, slide ≤ 3 cm).
- **Kimodo clips from the PC (official, SOMA-SEED-v1.1):** 12 in `motions/kimodo/`, baked as `motions/baked/k_<name>`, listed in `index.json` (`kimodo_<name>`). Their BVH rest pose is not upright (bones along +X, cm): `retarget.py` detects it and uses per-bone rest frames. `sit_on_sofa` ends with the hips on a ~0.50 m seat (the kit sofa cushion is 0.38 m: use the armchair or raise the cushion).
- **Kimodo:** works on this Mac (kimodo.cpp CPU, SOMA-SEED, ~2 min per 3.5 s clip, models in ~/kimodo-cpp, outside git); the PC route is `KIMODO_PC.md`.
- **Sound rule:** a real, quiet human scream/gasp exactly on a scared face swap (2-3 per short), the dog answers with a real bark; levels and master as above.
- **Fix round 2 (2026-11-11):** arms hang relaxed by the body outside gestures (retarget `arms=relax`: idle elbows ~15°, hands continue the forearm, curled fingers), shirt texture covers the shoulder tops + smoothed shoulder weights, the face portrait now covers the whole neck down to the collar, sneakers are 100 % rigid on the foot bone. **Round 3:** modelled rigid low-poly sneakers (gum sole with thickness, toe cap, stripe, laces; `humans/<name>/shoe.png`), body skin colour-matched to the face cheeks + the throat lifted in every face photo (`prep_human.py`), the photo's own collar line (no polygon notches), both sleeves from the evenly lit side of the sheet. **Still open (API review):** a small chest notch, cheek/hair joins in profile, hands read as fists at distance; keep human close-ups to medium shots.

## Kit v5 humans + cast pack (2026-11-11, user correction of v4: back to low poly, clothes in the texture)
- 16 humans (owner + 15 cast, `humans/cast.json`), each with its own Flow face AND body. Build: `humans/build_human3.py` (+ `garments.py`); `build_human.py` (v3 projection) and `build_human2.py` (v4 MakeHuman cloth meshes, rejected: not low poly, bodies poked through) stay only for reference.
- **Body:** one decimated MakeHuman mesh (~2.5-3k faces, PS1), same rig and bone names (all 68 motions incl. the 12 Kimodo clips work; checked k_startle_jump_back / k_wave_hello on the owner and k_happy_jump on the kid).
- **Clothes = texture on the body** (nothing can poke through): `garments.py` paints clean procedural garments into the body's own MakeHuman-UV texture AFTER the decimation (its final UVs: straight hems), 256 px texels, colours from the Flow sheet (`look.json`), garment type per person in cast.json `garment` (tee, vneck/scrubs, shirt, uniform(_short), polo, hoodie, sweater, cardigan, blazer, jacket(+yoke), chef, zip; jeans, trousers, chinos, scrubs, cargo, joggers, leggings, skirt; belt, `coat` colour on the thighs). Torso vs legs split by height (bone regions mix at the hips). Silhouette = vertex inflation (looser tops, regular-fit legs widening to the ankle).
- **Face:** v4 method kept: the Flow photo only inside a soft face oval (`faces/mask.png`) over a tone-matched MakeHuman CC0 skin; open-mouth faces squashed toward the neutral chin in `prep_look.py`. Hands re-toned to the forearm skin.
- **Low-poly modelled parts (rigid):** hair = MakeHuman hair mesh tinted; glasses = temples only (the front is the photo's); cap / flat cap; badge (person's left chest); mail bag + strap on the body surface; lab-coat skirt (closed tube, each side follows its thigh); apron; one held prop on the right hand (`prop=` clipboard, letters, parcel, spatula, briefcase, leash).
- Rebuild one: `.venv/bin/python pieces/cast-pack/tools/build_cast.py <slug>`; motion self-check: `pieces/cast-pack/tools/motion_strip.py`. Montage in the kit living room with the dog: `pieces/cast-pack/montage_run.py` (→ `montage_kit.py` through `pieces/zaw-dog-05/build.py exec`).
- Assets: MakeHuman CC0 system assets (skins, hair) in `~/Library/Application Support/Blender/5.2/mpfb/data` (zip in `para_pc/assets/`).
- **PC pack (2026-11-11):** 15 more humans built on the Windows PC with the same kit v5, listed in `humans/cast_pc.json` (same schema; `top_prompt` = Flow prompt): firefighter, gardener, librarian, mechanic, nurse, painter, barista, guard, teacher, tourist, skater, vendor, driver, yogi, fisherman. `build_cast.py` / `compose_sheet.py` / `label_lineup.py` / `montage_post.py` read both cast files; scripts pick Mac or Windows paths (Blender, MPFB module, `%APPDATA%\Blender Foundation\Blender\5.2\mpfb\data`). Line-up `pieces/cast-pack/review/cast_pc_lineup.jpg`, montage `montage_run_pc.py` → `renders_pc/`.
