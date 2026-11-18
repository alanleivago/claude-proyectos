---
type: style
status: active
tags: [zawdog, lowpoly, ps1, blender, dog]
relatedTo: [pieces/zaw-dog-01, pieces/zaw-dog-02, pieces/zaw-dog-v2]
---
# zawdog: dog shorts in @zawpolyshorts style

Copy of the user's approved rules (memory), so they can be used on another machine.

## Format
- 9:16 English shorts, ~15-20 s (from video 7; #1-6 were 30-40 s with loops). Zaw structure in 5 beats: claim ("Your Dog Thinks X When You Y"), premise, dog logic (a study in 1 line max), behaviour, closing punchline. NO loop.
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
- Kit hallway + front door (used from #7 for the doorstep): hide `facade_e0` and `facade_e_eave` (the house front cuts through the hallway), open the door with `DOOR_PIV.rotation_euler.z = -1.75`; the porch and the street photo show through it (`pieces/zaw-dog-07/shots.py` `hall()`).

## Planos (medido 2026-11-13: 14 shorts de Zaw, 187 planos reales; detalle y tablas en fuentes/zawpolyshorts-style/planos/ENCUADRE.md)
- **Corrección del usuario (2026-11-13):** los sets de Zaw se sienten MÁS GRANDES respecto de los personajes y los planos están casi siempre CERCA del gato y de la gente; los nuestros eran más abiertos. Reglas medidas:
- **Lente:** 25 mm (sensor vertical 36 mm: FOV horizontal 44°, vertical 72°). 22 mm solo para whips/insertos; 28-30 mm solo para caras. Altura de cuadro = 1.44 x distancia.
- **Escala de set:** `scale_set(1.35)` de `pieces/zaw-dog-05/build.py` en todo video nuevo (desde #7; #5/#6 no lo llaman). Muebles, cuartos, puertas y calle x1.35; el perro, la gente, los cuencos/props del perro, los textos 3D y las sombras quedan igual. Las coordenadas del set se pasan a mundo con `sw((x, y))`. (Zaw: el sillón mide 1.2x la altura del gato; nuestro sillón real medía 0.55x nuestro perro sentado de 0.87 m.)
- **Perro (el sujeto en ~65 % de los planos):**
  - visible 0.40-0.60 del alto del cuadro (Zaw: mediana 0.43); cortado por los lados o abajo en la mitad de los planos;
  - distancia 1.0-1.4 m (perro entero sentado) o 0.65-0.8 m (cabeza + pecho);
  - cámara a 0.75-0.85 m (ojo del perro 0.68 m) con pitch −5° a −15°; Zaw mira levemente hacia abajo (mediana −5°). Nunca por debajo de 0.6 m mirando hacia arriba;
  - el `dog_sit` del kit levanta la cabeza: en los planos sentados bajar el cuello ~0.3 rad (#7 `nod`), si no lee como aullido/contrapicado.
- **Gente:** de la cintura o la rodilla para arriba, nunca de cuerpo entero salvo 1 plano de puerta/entrada.
  - cintura arriba: 0.65-0.8 m de distancia; rodilla arriba: 1.0-1.2 m; cámara a la altura del pecho (1.2-1.4 m), casi horizontal;
  - la cabeza arriba, a ~0.2 del borde superior (Zaw 0.20; nosotros teníamos 0.25-0.27);
  - el recurso típico de Zaw: solo un brazo, una mano o las piernas entrando al cuadro junto al perro (cámara a la altura de la cadera o detrás del hombro);
  - la gente visible en ≤ 60 % de los planos (Zaw 25 %; nuestras historias piden más) y solo-humano ≤ 20 %.
- **Mezcla de tamaños:** perro MFS ~45 %, MS ~30 %, insertos ~10 %, general/entero ≤ 10 % (un plano de ubicación como mucho), CU ≤ 5 %. Nunca dos tamaños iguales seguidos con el mismo sujeto.
- **Fondo:** detrás del sujeto una pared o un rincón en ≥ 45 % de los planos; el cuarto entero en ≤ 50 %; sin techo en los planos de perro. Objeto en primer plano a 0.35-0.7 m de la lente en ~60 % de los planos (Zaw 0.5 m; nosotros 0.8-1.1 m).
- **Contrapicado como máximo 1 por video**, con intención (corrección del usuario, video 4). Cenital solo para insertos de objetos.
- **Movimiento — CORRECCIÓN del usuario (2026-11-09), sigue vigente:** la cámara se mueve en TODOS los planos (push-in/pull-out, travelling, órbita corta, grúa), dinámica como el #6: zoom ~0.10-0.17 log/s y paneo ~0.15-0.25 anchos de cuadro/s (Zaw: 0.10 y 0.14; el #6: 0.17 y 0.23).
- **Duración:** 1.0-1.4 s por plano, corte duro (Zaw: media 1.37 s, mediana 1.28 s, 0.73 cortes/s).
- **Textos amarillos en 3D:** escalones de ~1/11 de la altura de la letra (4-8 px), con los huecos de las letras abiertos, siempre legibles a tamaño de teléfono.
- Medición repetible: `fuentes/zawpolyshorts-style/planos/medir_encuadre.py` (cortes + movimiento por píxeles + API) y `resumen_encuadre.py`; correrla también sobre el preview de cada video nuevo.

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

## Kit v6 garments (2026-11-12, user correction: clothes from Flow IMAGES, never code-painted)
- **Rules (standing):** garments come from Google Flow photos (Nano Banana via the srz-google-flow-mcp tools, one image per call, never flow-auto), like Mr omi's photo atlas and our v2 dog; `garments.py` painting is only the fallback for a human without `photo/map.npz`. **Build/upgrade only the cast the current video needs** (video 6: owner, businesswoman, mailman, scientist).
- **Flow images per person** (`humans/<name>/photo/`): `garments.jpg` = one 16:9 ghost-mannequin sheet, FRONT left / BACK right, full length collar → trouser hems, sleeves angled out and separated from the torso, legs apart, empty magenta neck opening, no head/skin/hands/shoes/bag (reference: the person's `src/sheet.jpg`); `<date>-…hand….jpg` = the person's right hand, back left / palm right, hanging down (reference: `faces/neutral.jpg`). Flow does NOT keep a guide silhouette, so the mapping is semantic, not a projection of a guide.
- **Pipeline:** `photo_tools/export_mesh.py` (Blender, the built body's rest mesh) → `guide.py <name> grey` (the body's own ghost silhouette, front/back, `guide.json` = px↔m) → `parts.py <name> photo/garments.jpg [--drop-dark]` (same landmark finder on guide and photo: collar top, armpit, split = crotch or coat hem, bottom, torso edges per row, the two leg runs, sleeve frames; magenta despill + bleed; neck-opening mask; `map_debug.jpg` + `warp_preview.jpg` to check) → `hand_parts.py <name> <hand.jpg>` → `rebuild.py <name>` (build_human3 + idle bake + inspect/sheet/cast sheet). `build_human3.py` uses `photo_map.py` automatically when `photo/map.npz` exists: front photo for front-facing texels, back photo for back-facing ones, cross-faded at the side seams; torso by rows between the landmarks and across the torso edges, legs across each leg run, sleeves along their axis (real length for short sleeves → the hem lands where the photo's is), skin only through the photo's neck opening / below a short sleeve / on the throat, hands from the hand photo (back/palm by the normal, toned to the forearm). Lab coat skirt gets its own 128 px photo texture (`coat.png`). Same mesh, faces, rig, bone names and motions as v5; 256 px texels, Closest.
- **Props:** briefcase case hangs 7.5 cm outside the hand (idle 0 mm into the thigh), mail bag 2.5 cm further out and 3 cm higher, coat skirt follows the thighs sooner. Check with `photo_tools/prop_check.py -- <name> <actions>` (worst penetration per accessory and the bone it hits).
- Review for video 6: `pieces/zaw-dog-06/review/cast/` (`cast6_lineup.jpg`, `<name>_cast.jpg`, `<name>_selfcheck.jpg` = v5 vs v6 + walk + Kimodo + rest-pose sheet; v5 copies in `v5_before/`).
