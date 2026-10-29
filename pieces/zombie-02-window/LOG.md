---
type: note
status: active
tags: [zombie-channel, ava-restfield, remake, learn-with-alya, render-log, window]
relatedTo: [zombie-channel, ava-rules]
---

# zombie-02-window — ep2 "How to properly barricade a window" (Ava Restfield)

Entregable: `zombie02_window_v1.mp4` (1080x1920, 30 fps, 54,3 s, H.264 + AAC estéreo, −14,0 LUFS, pico −1,2 dBFS).
Ref: `fuentes/zombie-ref2/ref.mp4` (Learn with Alya). Planos: `shotlist.md`. Storyboard aprobado: `storyboard_v1.png`.

## Cómo se rehace
```
python voz/assemble.py            # voz "ava bread 2" 3824e262 (tomas separadas en voz/lines/, 13_fudge = toma del ep1)
python audio/scripts/music.py audio/sections.json "F:/Claude Proyectos/pieces/zombie-02-window/audio/music/music.wav"
python audio/scripts/mix.py       # voz + música + SFX -> audio/mix.wav
cd engine && node render_film.mjs ava ../zombie02_window_v1.mp4 ../audio/mix.wav
```
Sets: room.js (01 02 03 04 10 12 15), closeups.js (06 14 16 18), diagrams.js (05 08 09 11), outside.js (13 17 19); film.js: YOU DIED, HUD, tarjeta.
Acciones nuevas en zombie-girl/anim/build_anim.py: hammer, hammer_high, drill, knock.

## Decisiones del usuario
- Guion mejorado (no copia): orden lógico, pulgadas (FEMA/FLASH: +4 in por lado, tornillos cada 12 in), callback "friction still…", chistes en inglés.
- "Oh, fudge!" = coletilla fija de Ava (misma toma del ep1).
- Luz: gamma 0,8 en el post sobre planos 3D (main.js `gA/gB`, film.js `LIFT`/`DARK`); diagramas y negros sin tocar.
- HUD desde 3 s con animación (desliza, parpadeo CRT, pantalla se enciende de arriba abajo).
- Nombre: AVA RESTFIELD; tarjeta "FOLLOW AVA RESTFIELD!", NEXT: WATER. con bidón girando.
- YOU DIED recortado 3 corcheas (film.js CUTS_T = mix.py).

## Créditos (Freesound CC0)
394891 martillo, 411811 chorro de agua, 186926 estallido, 803551 golpe de madera, 865361 nudillos + los del ep1 (ver su LOG.md).
Dino Crisis y zombis RE de YouTube (uso no monetizado).

## v2 (revisión del usuario sobre la v1) → `zombie02_window_v2.mp4` (54,3 s)
- "Zombies are at your window" sonaba a pregunta: nueva toma e46cc642 (F0 de "window" baja 154→121 Hz; la vieja subía 188→348).
- Huella de sangre: textura real generada en Flow (`engine/tex/handprint.png`, de `tex/gen/`), sin píxeles pintados en cristal ni tablas.
- 04: la mano es la del modelo thin-zombie (attack2) detrás de las tablas, no un brazo de cajas.
- La ventana tiembla en cada golpe del zombi (room.js `WIN_HITS`), con cristal/golpe en mix.py en los mismos tiempos.
- HUD aparece de golpe en el corte a 02 (2,3 s); sin animación de entrada. Quitada la marca 💢 de 18.
- 08 EXAMINE: inventario RE2 (escopeta, First Aid Sprays, hierbas, munición, cartuchos, cinta de tinta, menú EQUIP/USE/CHECK/COMBINE).
