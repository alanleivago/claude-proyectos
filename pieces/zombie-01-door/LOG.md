---
type: note
status: active
tags: [zombie-channel, remake, learn-with-alya, ava-bread, ps1, render-log]
relatedTo: [zombie-channel]
---

# zombie-01-door — remake de "How to properly barricade a door" con Ava Bread

Entregable: `zombie01_door_v1.mp4` (1080x1920, 30 fps, 49 s, H.264 + AAC estéreo, −14,0 LUFS, TP −1,1 dBTP).
Referencia: `fuentes/zombie-ref/ref.mp4` (Learn with Alya). Lista de planos: `shotlist.md`. Storyboards aprobados: v1 → v3.

## Cómo se rehace
```
python voz/assemble.py                                 # voz B ef006e80 en los tiempos de la ref -> voz/track.wav + engine/timeline.json
python audio/scripts/music.py audio/sections.json "F:/.../audio/music/music.wav"   # bed 111 BPM (familia Mechayuki)
python audio/scripts/mix.py                            # voz + música + SFX -> audio/mix.wav (estéreo, -14 LUFS)
cd engine && node render_film.mjs ava ../zombie01_door_v1.mp4 ../audio/mix.wav
node stills.mjs ../review/x 1.2,5.0 --sheet ../review/x.png   # fotogramas sueltos
```
Motor: `engine/` (main.js de Mechayuki a 360x640, lib.js, film.js con HUD/subtítulos/YOU DIED/EXAMINE/tarjeta, sets/hall.js,
diagrams.js, rooms.js hechos por agentes según `engine/SETS.md`; refont.js = fuente estilo RE).

## Cambios pedidos por el usuario (todos aplicados)
- Pistola en vez de subfusil; "YOU DIED" estilo RE clásico (imagen teñida de rojo, letras con chorreones, CONTINUE?).
- Nombre "AVA BREAD"; chiste en inglés "Oh, fudge"; ruso traducido ("DO NOT ENTER").
- Fuente estilo Resident Evil (Tahoma Bold sin suavizado, estirada x1.25: no hay fuente RE descargable fiable); subtítulos
  pixelados (9 px x3) y un 20 % más pequeños; sin cabecera; HUD = ECG + panel CONDITION de RE2.
- Tarjeta final: ventana tapiada girando (examinar objeto) pegada al texto, NEXT: / WINDOWS. a máquina, AVA BREAD.
- Sin raya gris sobre el ombligo (sombra de la lámina), EXAMINE alineado a la izquierda, sofá y ventana con más textura.
- SFX de Dino Crisis (pestillo, pitido de radio al entrar el HUD, sonido por defecto en etiquetas, pasos, arrastre del sofá,
  inventario + tecleo de Rick en EXAMINE, desbloqueo en CONGRATULATIONS, ventilación de fondo).

## Revisión en movimiento (review/final_0.png, final_1.png: inicio/mitad/final de los 23 planos)
Todos PASS salvo el 21 en la v1 (43,5 s: el brazo de ataque de un zombi atravesaba la pared delante de Ava) → corregido con
un plano de recorte en la pared de la ventana (rooms.js) y re-render.
Diferencias que quedan con la ref: plano 14 en espejo, 13 con la puerta abierta, 9 cae en el centro de la alfombra, mano del 2 simple.

## v2 (revisión del usuario sobre la v1)
- Plano 01: recarga de la pistola (acción `reload` nueva en zombie-girl/anim/build_anim.py, 60 frames): suelta el cargador (f8),
  saca otro del cinturón (f17), lo mete (f30), tira de la corredera (f36-42). El modelo de pistola solo trae la base del
  cargador: hall.js le pega un cuerpo de 10 cm para que se lea. SFX Freesound CC0: 711555 (sale), 815879 (entra), 866514 (corredera).
- Destello de 3 s sin corte: `flash()` en film.js por tiempo global (sube 3,40-3,75, se sostiene, se abre 3,95-4,45), óvalo blanco con bordes grises.
- YOU DIED (11 s): negro al 86 % como la ref (se ve el zombi detrás).
- Plano 10 (19 s): frascos → First Aid Sprays (copia del modelo de pago de Markus Darius en itch.io, hecho en código) y macetas de hierba verde/roja/amarilla.
- Zombis: sonidos de Resident Evil (YouTube 4JCoB0GUIVs desde 1:20, troceados en assets/zombie-sfx-yt/seg; uso no monetizado).

## v3 (revisión del usuario sobre la v2) → `zombie01_door_v3.mp4` (48,47 s)
- Voz nueva: VoiceStudio "ava bread" `2dd9cbec` (clon), steps 32; whisper OK en las 14 líneas ("Oh, fudge" cortado de una frase más larga en el silencio). La voz B anterior queda en `voz/lines_voiceB/`.
- Sin cargador visible en la recarga (atravesaba la pistola): solo mano, corredera y SFX.
- Recorte de 0,54 s (1 pulso a 111 BPM) tras "so you lock it": `CUT` en film.js (main.js salta ese tramo) + mix.py quita lo mismo del audio con fundido de 30 ms.
- "NOT EVEN CLOSE" y el parpadeo rojo entran en "don't" (antes en "wall"); "THE WALL (STUD)" en "reach".
- SFX: mix.py recorta el silencio inicial de cada efecto (el sonido por defecto de Dino Crisis traía 0,33 s: todas las etiquetas sonaban tarde). Tarjeta final: una tecla de máquina por letra de NEXT: / WINDOWS. y el sonido por defecto en el frame en que aparece AVA BREAD.

## v4 (voz corregida) → `zombie01_door_v4.mp4` (49,0 s, −14,0 LUFS, TP −1,1 dBTP)
- Voz: VoiceStudio **"ava bread 2" `3824e262`** (el usuario re-clonó; la de v3 tenía un error). Steps 32. Tomas en `voz/lines/` (v3 en `lines_voiceAB/`).
- Palabras cortadas (queja del usuario): las pausas "…" de una toma NO son silencio, cortar dentro de la toma partía palabras.
  Ahora cada parte es su propia toma (`lines/<id>_<j>.wav`); assemble.py recorta con umbral −45 dB y márgenes 80/180 ms,
  fundido de salida 30 ms, y coloca cada parte para que el *sonido* (no el margen) caiga en su tiempo. Whisper oye cada parte completa.
- Líneas 01 y 08 a speed 1.12 (la voz nueva es más lenta y empujaba la 09). La pausa tras "so you lock it" quedó en 0,6 s sin recorte (CUT = 0).

## v5 → `zombie01_door_v5.mp4` (47,65 s, −14,0 LUFS, TP −0,9 dBTP)
- Huecos recortados sin tocar la voz: film.js `CUTS_T` (5,95 s +3 corcheas tras "two tiny screws"; 18,98 s +2 corcheas tras "feelings");
  main.js `warp()` salta esos tramos y mix.py quita los mismos del audio (fundido 30 ms, en corcheas a 111 BPM). HUD a DANGER y su pitido tras el recorte.
- Plano 10 (friction): encoge los hombros en "care", guiña y sonríe en "feelings", mira a cámara (`ch.lookAt` en lib.js gira Neck/Head hacia la cámara, máx. 40°).
- Plano 16 (29 s): mira a cámara.
- Zombis empujando la puerta: hall.js `THUMPS` + `rattle()` (la hoja cede y rebota, la manilla tiembla, la cámara vibra) en 05, 16, 17 y 19; golpes y gruñidos en mix.py en los mismos tiempos.
- assemble.py: tiempos de palabra por toma (whisper estiraba la 1.ª palabra de la 2.ª toma sobre el silencio → subtítulos adelantados).

## v6 → `zombie01_door_v6.mp4` (47,65 s, mismo audio que v5)
- Ava temblaba: (1) `lookAt` alternaba frame a frame: el AnimationMixer no reescribe un hueso si su valor no cambió (pose a 15 fps),
  así que el giro se aplicaba un frame sí y otro no → lib.js guarda el valor animado y lo restaura antes de cada pose;
  (2) la vibración de cámara de `rattle()` movía a Ava en 16/17 → quitada: solo tiembla la puerta.
  Medido (centroide del pelo, 24 frames): ≤1 px entre frames, sin vaivén frame a frame.

## Créditos
Freesound CC0: 160213 "Kicking/Forcing/Breaking Wooden Door", 754440 "Zombie Groan 2", 196723 "SZ_Zombies_05", 346692 "Body fall_04",
871631 "Electric Drill", 873413 "Drill_Noises_06", 104339 "Glass Window Knocking 1", 587930 "Knocking and banging on my apartment door",
835169 "pipewrenchdrop". sound-layer kit (CC0): deep boom 539968, deep hit 636624, whoosh 109747.
Dino Crisis (Capcom) extraídos de YouTube a petición del usuario (uso no monetizado). Modelos: city/thin/hazmat zombie
(OpenGameArt; thin-zombie CC-BY 3.0 dogchicken), pistol-retro (CC0).
