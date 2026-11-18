---
type: log
status: active
tags: [ava-restfield, zombie-14-attic, stalker, storyboard]
relatedTo: [zombie-10-stairs, zombie-13-gasstation, zombie-03-station]
---
# Ep14 "How To HIDE In Your Attic During A Zombie Outbreak" (The Stairs, Part 2): log

## 2026-11-16: storyboard v1 (esperando OK del usuario; no hay render)

**Guion:** pasada humanizer sobre `voz/guion.md`. Un solo cambio: "Light is worse." pasa a "Light's even worse." (apertura escenificada). Datos, gancho, recap y beats quedan igual.

**Voz** (`voz/`, pipeline copiado del ep13: gen → pick → prep → assemble → fix_words → fix_caps → build_cues)
- VoiceStudio REST, voz `f2f8f8dc`, num_step 32, wav, speed 0.88, en. 24 tomas (una por mitad de cada "…"), 8 semillas por toma (9 en algunas).
- [PIENSA] ("Footsteps outside. Heavy ones… and bare.") con instruct `whisper`; *temblando* ("That's not a zombie.") con `whisper, low pitch`.
- pick.py: whisper exacto + viveza + F0 final descendente. Whisper oye "bear" por "bare" (homófono): se acepta en pick. Manual (`pick_manual.json`): 08_0 = s8 (la más humana según earshot rank). 07_0 queda s2 (s6 subía +6.8 st al final).
- fix_caps parte "bareboards" en "bare boards" para los subtítulos.
- [RESPIRA] y (···) quedan como huecos en la pista (1.0 s y 1.5 s): la respiración CC0 (`zombie-03-station/largo2/audio/cand/breath_f*`) y el ambiente se ponen en la mezcla.
- Pista: `voz/track.wav` (48 kHz mono). Voz termina en 76.4 s; END = 79.0 s.

**DURACIÓN: 79 s, no 62 s.** El guion aprobado a speed 0.88 son 58.5 s de habla sola; con las pausas mínimas de la guía (0.3 s entre tomas, 0.4 entre líneas, dos (···), la respiración, ventana + 1 s de silencio + rugido, y la decisión RE3 que necesita 3.5 s antes de las opciones) da 79 s. Para llegar a ~62 s hay que recortar guion (unos 13-14 s de voz), por ejemplo: sacar "Low sounds carry farther…" (-4.3 s), "The floor pulls heat out of you…" (-4.4 s) y "Only one of them can climb your stairs at a time…" (-2.4 s), o pasar todo a speed 1.0 (sigue en ~72 s).

**Motor** (`engine/`, copia del ep13 + `npm install`)
- `sets/attic.js` = la casa del ep10 (`zombie-10-stairs/engine/sets/stairs.js`, mundo tal cual: barricada sofá+cómoda abajo, puerta de canto + estantería arriba, escalera de cuerda en UW) + todo lo nuevo:
  - desván: losa con escotilla, aislante rosa, tablas de paso, vigas, cabios, cumbrera, hastiales con rejilla, cajas, baúl, maleta; colchón (se desenrolla), agua, First Aid Spray (respray.js), maceta de hierba verde, linterna apoyada con charco de luz (raycast + disco aditivo, como `mkPoolX` del largo 3);
  - escotilla con tapa que queda ABIERTA y escalera plegable; Ava sube con IK de 2 huesos (manos y pies en los peldaños, `climbUp`, adaptado de `climbDown` del largo 3);
  - linterna en la mano con charco en el piso (04c), manta que cae sobre la ventana UW (`pull_chain`, una vez);
  - techo a dos aguas, techo bajo del living, exterior nocturno: calle, veredas, cordón, línea amarilla, cerca, buzón, árboles, arbustos, farolas apagadas, 2 autos, 14 casas vecinas (la de al lado = opción 2), luna y estrellas; anillos de sonido grave (09); llamita en la ventana (04);
  - ventana nueva WS al pie de la escalera que estalla hacia adentro (vidrio + marco en pedazos) y el gigante (`makeStalker` + `models/stalker_ps1.glb` del largo 3): salto, caída agachado, se levanta despacio, ladea la cabeza, mira arriba, pisa el sofá (solo la barricada se sacude), estira los brazos; luz verde del pecho parpadeando.
  - decisión RE3 (`12_choice`): destello 0.5 → negativo congelado sin texto → destello → negativo con opciones → destello → color, mismo encuadre (casa en corte, el gigante de espaldas abajo, Ava arrodillada en la escotilla arriba), gigante en cámara lenta, menú RE vivo con cursor + cuenta regresiva, COMMENT 1 OR 2, FOLLOW FOR MORE!. Sin subtítulos encima, sin "Oh, fudge".
- `main.js`: uniformes `iA/iB` para el negativo (como el largo 3). `film.js`: CUTS del ep14, HUD de golpe en el corte a `01a_room` (1.6 s) con la placa "HOUSE", estados FINE → CAUTION (pasos) → DANGER (entra el gigante).
- Cortes anclados a palabras en `engine/cues.json` (`voz/build_cues.py`).

**Autorevisión** (`node stills.mjs`, inicio/mitad/final de los 30 planos): arreglados cámaras dentro de paredes/estantería (01b, 02c, 03c, 06, 07c, 11b), el plano de pies (el abrigo tapaba: cámara más alta y abierta), la tapa de una caja que tapaba a Ava en la decisión (las tablas/cajas al sur se ocultan en el corte), etiquetas del medidor de dB superpuestas, pose `hold_up_object` (traía un objeto en la mano: se cambió por `pull_chain`), cara de 03c (pasó a `squat` a cámara). Ava no tiembla, la cámara no tiembla; el gigante sacude solo la barricada.

**Storyboard:** `storyboard_v1.png` (32 paneles con frames reales y la voz real + fila de objetos nuevos). `review/storyboard.py --times` da los tiempos para `stills.mjs review/sb`.

## Pendiente (después del OK)
- Decidir la duración (recorte de guion o aceptar ~79 s).
- Mezcla `audio/scripts/mix14.py` (desde mix13): gancho de terror 0-10 s, respiración CC0, (···) con ambiente, pasos descalzos pesados, ventana (`largo3/audio/cand/glass_big/536763.mp3` + `wood_break/669452.mp3`), aterrizaje, 1 s de silencio de música en `W.land` y rugido encima, gruñidos al mirar y en cada paso, drone + latido en el negativo; música 10-11 LU bajo la voz por tramo; master −14 LUFS estéreo.
- Render, revisión cuadro a cuadro, `revisar_render.py`, entrega share a LucidLink (Ava Restfield) + miniatura.

## 2026-11-16 (tarde): storyboard v2 aprobado → render
- Usuario: "está genial", sin cortes de guion. Pausas acortadas (0.25 s entre tomas, 0.28 entre líneas, (···) 0.9 s, [RESPIRA] 1.1 s con la respiración 318078, ventana + 1 s de silencio + rugido igual, decisión RE3 igual). Dentro de las tomas no había aire muerto > 0,35 s (prep.py `squeeze`). Duración nueva: **74.9 s** (voz termina 72.3 s).
- Arreglos pedidos: objetos del storyboard sin HUD ni subtítulos (`?clean=1`), 01b frontal (Ava mira a cámara y en "attic" mira la escotilla), 11b con las manos visibles por encima de la barricada. `storyboard_v2.png`.
- Mezcla `audio/scripts/mix14.py`: gancho 7 LU bajo la voz → BGM 610534 (10-12 LU por tramo), respiración real, room tone/noche más presente en las pausas, SFX reales en su cuadro (teclas, escotilla, crujidos por peldaño, pasos descalzos, ventana vidrio+madera, aterrizaje, rugido/gruñido/respiración del kit del largo 3, pasos en la barricada), música fuera ~1 s antes del rugido, decisión con drone 871189 + latido 40/60 bpm + golpes en los destellos. Estéreo (música y ambiente abiertos tras earshot critique: side −51.9 → −12.5 dB). −14.0 LUFS, −1.4 dBTP.
- QA propio: hoja a 5 fps + test de parpadeo de cuadro único (0 casos). Arreglado: la tapa de la escotilla la atravesaba Ava al subir (ahora cuelga del borde largo, al costado).
- revisar_render.py: ronda 1 (v2) y ronda 2 (v3), CASI en ambas. Arreglados los fallos claros (cámara/objetos al subir, colchón que se desenrolla con las manos, cabeza del gigante cortada por la pared en 11, luz partida en la cara de 08, etiquetas que tapaban el "13"/subtítulos, texto de la decisión sobre Ava, menú sobre la cabeza del gigante, PROGRESS SAVED antes de terminar la hoja, hoja con "HOUSE - 2F", aterrizaje más atrás, reach del 11b). No se tocó: guion aprobado ("bare", "for blocks"), barras grises de la decisión (gramática del largo 3).
- Portada vertical: `?thumb=1&clean=1` (pose aprobada vía `thumb_post.js` del largo 1, pistola negra, el gigante detrás, HUD real HOUSE · Danger compuesto al 48 % del ancho).
- Master final: `renders/How To HIDE In Your Attic During A Zombie Outbreak.mp4` (v4, 74.9 s, −14.0 LUFS, −1.5 dBTP, estéreo). Portada: `renders/How To HIDE In Your Attic During A Zombie Outbreak.png`. Sin copiar a LucidLink (espera OK).

## 2026-11-16 (noche): v5 entregado
- Usuario aprobó v4; único cambio: la subida al desván. Nueva `climbUp` (IK de 2 huesos como `climbDown` del largo 3): de cara a la escalera, cada pie apoya en un peldaño y queda quieto mientras el otro sube (mano y pie contrarios), manos agarrando los peldaños, cuerpo que sube parejo inclinado hacia la escalera siguiendo su pendiente, 0.44 s por peldaño, sin clips en bucle; al final apoya las manos en el piso del desván y se impulsa por la escotilla (tapa abierta). Cámara de costado desde el hueco de la escalera (pared del dormitorio 2 y barricada de arriba fuera de cuadro en ese plano); agua y colchón a la vista.
- mix14: un crujido real por pie apoyado (en el cuadro del apoyo) + tela/crujido al impulsarse.
- QA: hoja a 10 fps del tramo (`review/climb_sheet.png`), crops 4× (`review/qa/climb_crops.png`), parpadeo 0.
- Entregado: share a LucidLink `Ava Restfield/How To HIDE In Your Attic During A Zombie Outbreak.mp4` + `Miniaturas/…png`. En `renders/` queda solo el master con el título (+ portada y revisiones). GUIA §8 actualizada.
