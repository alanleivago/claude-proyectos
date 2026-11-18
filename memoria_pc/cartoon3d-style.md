---
name: cartoon3d-style
description: "Estilo \"3D cartoon shorts\" (cartoon3d) — replicar al máximo los 7 shorts de \"Ref 3D cartoon animations\" siguiendo el método del video de g russ, sin Creatorize"
metadata:
  node_type: memory
  type: project
  originSessionId: e3b19138-633b-4f91-a0e9-968a2b60dee4
  modified: 2026-10-27T20:51:49.638Z
---

Estilo nuevo pedido 2026-10-21: shorts verticales 3D cartoon (cabeza-bola, cuerpo-frijol, brazos de palo, caras calcomanía con swap en parpadeo), en inglés, temas los propongo yo, la voz la genero yo (TTS) y recorto pausas a ~0.2 s.

- Fuente del método: fuentes/3d-cartoon-animations/ (notas + especificacion-tecnica-del-estilo.md, vía skill ver-youtube). Prohibido usar Creatorize (la plataforma que vende el autor).
- Referencias: "Ref 3D cartoon animations/1..7.mp4"; análisis en _analisis/ (hojas de contactos, metrics.json, words.json, tomas_gemini.md); herramientas en styles/cartoon3d/tools/.

- Pipeline and numbers: styles/cartoon3d/STYLE.md. Faces come from Google Flow sheets (only the faces); props/sets/characters in three.js code. First piece: pieces/apple-wayne (Ron Wayne, user's voice in voces/).

- Characters are 2D cut-outs (Flow layers: head with glow, faces, hair, clothes) as billboards in the 3D set; limbs are ink strokes with elbows/knees bending outward.
- Before showing any test: put every Flow variant side by side with the ref crop and pick the closest (eyes with the tiny highlight, the cap-shaped hair); then compare our frame vs the ref frame (cmp_frames.jpg). The user caught me picking worse variants (2026-10-22).

- User rules (2026-10-23): hair must hug the head (no floating); front-view glasses; beard = chin band + separate moustache that never covers the mouth; thick subtitle outline; colour graded per shot from the 7 refs (c3Look presets, not the casino look everywhere; refs are darker: mean L 0.3-0.6, tinted shadows); EVERY shot needs a fully dynamic camera and dynamic depth blur.

- Face accessories: glasses ON the eyes (the lower pair, not the brows), moustache right above the mouth (closer to mouth than eyes), never covering it. fit_faces picks the lowest feature pair as eyes (biggest pair for ringed eyes). Check a cast close-up (pieces/c3d-cast) after any face/fx change.

- Cast looks (user 2026-10-27): hair and outfits must NOT repeat across videos. Ricks Clips dresses every character in a ROLE costume (police cap+uniform, crown+robe, beanie burglar, apron, lab coat, cardigan, hoodie...). Kit library from Flow copies of 18 downloaded Ricks shorts (`Ref 3D cartoon animations/ricks/`): 24 bodies + 23 hats/hairstyles (`styles/cartoon3d/sprites/_ricks_library.jpg`, `tools/slice_ricks.py`, HAIR table in kit.js; preview glue with `tools/preview_hair.py`). Pick role-fitting, unused combos per video and copy only the used `spr_*` into the piece's assets.

**Why:** el usuario quiere "replicar lo mejor posible las referencias, haciendo lo que sea necesario".
**How to apply:** cuando el video del tutorial y las referencias difieren, mandan las referencias (ej.: subtítulos de UNA palabra a la vez, no dos). Medir contra las refs antes de dar algo por bueno. Ver también [[audio-recorded-sound]], [[script-format]].
