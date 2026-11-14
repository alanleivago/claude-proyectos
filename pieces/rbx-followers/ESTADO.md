---
type: plan
status: complete
tags: [roblox, rbx-followers, handoff]
relatedTo: [styles/roblox/STYLE.md, pieces/rbx-rope, Ref roblox/tiktok/informe.md]
---

# rbx-followers: estado (2026-11-09)

## Hecho y aprobado por el usuario
- Premisa: n.º 1 de [informe.md](../../Ref%20roblox/tiktok/informe.md) (análisis de 6 cuentas TikTok), "Your Followers Actually Follow You 👣".
- Guion APROBADO: [script.md](script.md) (481 palabras; empieza con "In this town", regla fija del estilo).
- Voz APROBADA: `voice/voice_final.wav` (108.2 s → video ~108.7 s), "3D cartoon 2" d9b69bea, speed 1.25, +4 st, verificada con Whisper. Tiempos en `voice/words.json` ({word,start,end}) y `voice/words_raw.json`.
- BGM: `styles/roblox/bgm/bgm.wav` (TEMPOREX Numbers, 9 LU bajo la voz).

## Paso 2 (2026-11-09): pipeline copiado + look de prueba (ESPERANDO APROBACIÓN)
- Copiado de rbx-rope: src/{engine,cast,gneef,props,kit,env,rope}.js, board/render .mjs/.html, board_sheet.py, qa_frames.py, check/thumb.mjs, sound/*.py. Flag de GPU según plataforma (metal en Mac, d3d11 en Windows).
- Nuevo: src/followers.js (contador sobre la cabeza, multitud = clones + instanciados, mochila, zapato viejo), sets street/kitchen/subway/bridge, elenco nuevo en cast.js (hero azul, dad con chaleco + zapato viejo, popstar, teacher, date).
- Look: `node look/look.mjs` + `python look/sheet.py` → look/look_sheet.jpg. Faltan shotlist.js/shots.js (paso 3).

## Render v4 (2026-11-09): renders/final.mp4 (108.1 s), look aprobado con brillo de día bajado
- 97 tomas en src/shots.js (SHOTLIST + STAGEI, filas pueden repetir palabras). Set nuevo classroom, props-fol.js.
- Usuario pidió render directo (sin aprobar storyboard). Revisión API: CASI; corregidos papá 3 pasos atrás, contadores, teléfono en la mano, gato, letrero MALL, caras naranjas del atardecer.
- Subtítulos verificados contra la voz (silencedetect + cuadros): coinciden; el revisor API se equivoca en eso.
- Sonido pro HECHO: `sound/fs_fetch.py` (Freesound CC0) → `sound/sfx_mix.py` (89 SFX + ambientes por toma) → `sound/remix.py --own` → `sound/mux.sh`. earshot critique: launch-grade (20/21, bajos algo finos).
- ENTREGADO: renders/final.mp4 (+share.mp4) enviado a Telegram; título "Your Followers Actually Follow You 👣"; miniatura renders/thumb.jpg.

## Siguiente (receta de styles/roblox/STYLE.md)
1. Copiar el pipeline EXACTO de `pieces/rbx-rope` (src/engine.js, cast.js, gneef.js, props.js, kit.js, env.js, words.js, sets, shots.js/shotlist.js, board.mjs + board_sheet.py, render.mjs/html, sound/), adaptado a esta historia. Referencias aprobadas en `Ref roblox/*.mp4`.
2. Look: 4-6 fotogramas de prueba (calle llena de seguidores, héroe con el número "1" en el mundo, nota en la nevera, metro, puente con 3 millones, papá con chaleco nocturno y zapato viejo). Personajes Gneef (`fuentes/roblox-cartoon/gneef-looks.md`). Mostrar y esperar aprobación.
3. Storyboard completo (1 toma por cláusula, ~1.3 s) → aprobación ANTES de renderizar.
4. Render → QA cuadro a cuadro → `python tools/revisar_render.py --estilo roblox` → sonido pro (music.py/beds.py/remix.py de rope) → título + miniatura → Telegram.
