---
type: log
status: active
tags: [ava-restfield, zombie-15-lasttrain3, last-train, storyboard]
relatedTo: [zombie-09-subway2, zombie-04-subway, zombie-14-attic]
---
# Ep15 "CHOOSE: You Stayed On The Last Train… - Part 3": log

## 2026-11-17: storyboard v1 (esperando OK del usuario; no hay render final)

**Guion:** pasada humanizer sobre `voz/guion.md`: sin cambios. No tiene tics de IA; las rayas solo están en las etiquetas de pantalla y "rip the tape off the lever, and pull the brake" son tres acciones reales.

**Voz** (`voz/`, pipeline del ep14: gen → pick → prep → assemble → fix_words → fix_caps → build_cues)
- VoiceStudio REST, voz `f2f8f8dc`, num_step 32, wav, speed 0.88, en. 15 tomas (una por cada mitad de "…"), 8 semillas cada una (120 en total). "Oh, fudge" es la toma del ep1 (`takes/04_fudge.wav`).
- pick.py: whisper exacto, con "breaks" aceptado como homófono de "brakes". Manual (`pick_manual.json`): 09_1 = s8 (earshot rank: la más humana, z +3.4). 07_1 = s8 (z +3.2, F0 final −8 st).
- prep.py (nuevo en el ep15): `split_sil` parte las tomas de varias frases en sus silencios reales (02, 06, 07, 09, 10), y las pausas de `GAPS` caen en beats con acción.
- **Duración:** el guion son unos 42 s de habla. Con pausas de 0.25–0.3 s daba 50.5 s, por debajo del piso de 61 s. Para cumplir la guía, las pausas van donde hay acción: 0.4–0.8 s entre frases, 1.6 s de aparición de la criatura, YOU DIED de 2 s, (···) de 1.8 s con chispas y 1.3 s tras "nobody driving". La voz termina en 56.3 s y END = 62.0 s (menú vivo con la cuenta llegando a 1).
- Pista: `voz/track.wav`.

**Motor** (`engine/`, copia del ep9 + `main.js` del ep14 + `npm install`). Set nuevo `sets/lasttrain3.js`:
- Del ep9: el túnel desconocido (ladrillo, lámparas rojas), el vagón con su interior en código, la pantalla, la criatura (dos ojos separados + sonrisa demasiado ancha), la hoja FILE y el rebobinado VHS.
- Nuevo:
  - tren sin conductor que acelera tras cerrarse las puertas, toma un segundo cambio de vía (con señal y motor de agujas) y frena en "pull" hasta parar en "stops";
  - cabina: parabrisas, consola con diales, asiento vacío, puerta entreabierta con CREW ONLY y la hoja NIGHT SHIFT, palanca con pomo rojo (dead man's switch) atada con cinta gris, palanca fantasma para el diagrama, First Aid Spray en el estante;
  - Ava arranca la cinta (la tira sigue a su mano) y tira del freno con las dos manos (IK de 2 huesos del ep14);
  - tercer riel con tablón y carteles DANGER 600 V;
  - Ava camina con la linterna (charco de luz en las traviesas);
  - la criatura sale de lo negro (primero los ojos, después el cuerpo, después la sonrisa), en el vidrio de la puerta y en la ventana del vagón siguiente;
  - chispas en las ruedas al frenar, faros que parpadean, luces del vagón que parpadean lento (2.5 Hz, sin estrobo);
  - pantalla YOU BROKE RULE 3 con cuenta desde 10;
  - salida de emergencia con EXIT encendido y maceta de hierba verde;
  - menú final vivo: 1. RUN FOR EXIT / 2. LOCK THE CAB, etiquetas 1 EXIT y 2 CAB, cuenta, COMMENT 1 OR 2, FOLLOW FOR MORE!.
- `film.js`: CUTS del ep15, HUD de golpe en el corte a `01b_cab` (2.4 s) con la placa "SUBWAY". Estados: CAUTION → DANGER (pasos) → CAUTION → FINE (puertas cerradas) → CAUTION → DANGER (pasos en el vagón siguiente). YOU DIED se congela desde `04_fudge`.
- `?prop=<clave>&clean=1`: primeros planos de los objetos para el storyboard, sin HUD ni subtítulos.
- `render_film.mjs`: precalienta los shaders de cada plano y reintenta cuadros vacíos. El primer render de QA salía negro de 0 a 5 s (lienzo en blanco mientras compilaba).

**Autorevisión:**
- `stills.mjs`: inicio, mitad y final de los 27 planos (`review/qa/all_sheet.png`).
- Preview de QA en el scratchpad (no se entrega): test de parpadeo de cuadro único, 0 casos. Los saltos grandes que quedan son intencionales: rebobinado, palanca fantasma, parpadeo de luces.
- Arreglado:
  - encuadres en los que Ava quedaba fuera del cuadro vertical (03b, 04, 06b, 08c, 08d, 09b);
  - la criatura metida dentro del vagón o tapada por el plano negro (06b);
  - la puerta de la cabina tapando la cámara;
  - el cono de la linterna, que se veía como una cuña blanca (queda solo el charco);
  - una cinta demasiado ancha y blanca;
  - el estrobo de luces;
  - etiquetas cruzadas en el menú final.

**Storyboard:** `storyboard_v1.png` (28 paneles con frames reales y la voz real + fila de 7 objetos nuevos). `review/storyboard.py --times` / `--props`.

## Pendiente (después del OK)
- Mezcla `audio/scripts/mix15.py` (desde mix14):
  - gancho de terror 0–10 s;
  - pasos en el túnel y en el vagón siguiente;
  - zumbido del tercer riel;
  - puertas, tren que acelera, chirrido de frenos y chispas en (···);
  - glitch del rebobinado;
  - cinta arrancada, palanca, tic de la cuenta;
  - YOU DIED sin música;
  - −14 LUFS estéreo.
- Render, revisión cuadro a cuadro, `revisar_render.py`, entrega share + portada.

## 2026-11-17: storyboard v2 (correcciones del usuario sobre v1; esperando OK, sin mezcla ni render)
- **El gigante reemplaza a la criatura** en todos los planos (`makeStalker` + `models/stalker_ps1.glb` del largo 3, igual que el ep14). 2,6 m, luz verde del pecho, dientes sin labios = "the smile" (voz y guion sin cambios), luz suave `faceL` en la cara para leer los dientes.
  - Rama LEAVE: las lámparas detrás de Ava se apagan; el gigante sale de lo negro caminando lento (primero la luz verde), con la fase del paso atada a la distancia (los pies no patinan).
  - `03c_back` nuevo: plano grande desde su espalda (~70 % del cuadro), Ava chica al fondo, un paso pesado. Después `04_fudge` (se inclina sobre ella) y YOU DIED.
  - `06b`: sale de lo oscuro junto a la puerta, del pecho para arriba en el vidrio; golpe de la manopla en "smile", solo tiemblan las hojas; plano de recorte para que no entre al vagón.
  - `09b`/`09c`: agachado en el vagón siguiente, solo del pecho arriba por la ventana del fondo; plano de recorte detrás del muro del fondo (nunca atraviesa el techo ni el muro).
- **Cambio de vía:** agujas que se corren (varilla del motor), señal a verde, plano alto sobre el cambio; el tren toma la vía y el vagón se sacude (roll por curvatura). Etiqueta SWITCH.
- **Luz:**
  - `06d`: relleno en la cabina, se lee el asiento vacío.
  - `09`: relleno suave y hemisferio ≥ 0,4.
  - Interior del vagón neutro: luz base 1,8 + pantalla 0,8, menos roja.
  - Prop del tercer riel con luz.
- **`08b`:** cámara del lado del vagón, Ava se lee desde el primer cuadro empujando la puerta.
- **Menú final en 5 ángulos vivos** (mismo menú y cuenta):
  - sobre el hombro hacia la salida;
  - contraplano hacia la cabina;
  - general;
  - primer plano de Ava;
  - desde la cabina con el gigante en la ventana del fondo.
  - Las etiquetas solo aparecen si su objetivo está en cuadro.
- **Rebobinado:** 1,21 s (glitch 0,35). La pausa recuperada va a la aparición del gigante (2,0 s). END sigue en 62,0 s; la voz termina en 56,3 s.
- **QA:** preview en el scratchpad, 0 pops de cuadro único, tira a 5 fps del encuentro (`review/qa/giant_strip.png`). `storyboard_v2.png` con la fila de props (primer plano del gigante y gigante entero, sin HUD ni subtítulos).

## 2026-11-17 (tarde): v2 aprobado → arreglos, mezcla y render (sin entregar)
- **Arreglos:**
  - "Oh, fudge" más cerca y con luz fuerte en la cara: los dientes se leen.
  - Contraluz suave detrás del gigante en `03b` (la silueta se lee y sigue saliendo de lo oscuro).
  - Agujas más grandes, punta amarilla y cámara más cerca.
  - `10_choice2` con Ava entera.
  - `10_choice5`: el gigante se ve en la ventana del fondo.
- **Mezcla `audio/scripts/mix15.py`:**
  - Gancho de terror 0–10 s (7,0 LU bajo la voz). BGM CC0 610534 a 10,3–10,9 LU bajo la voz por tramo.
  - **Tema del gigante** (pedido del usuario): "Resident Evil 3 - Menacing Nemesis (Cover)", de Andre Kane, https://www.youtube.com/watch?v=nHx2FLQQDSM, en `audio/bgm_giant/`. Entra (0,6 s) en cada aparición y sale (0,8 s) al cambiar de escena: 14,03–19,09 · 24,14–26,53 · 45,54–49,79 · 59,82–62,0. Mismo nivel por tramo. Música fuera en YOU DIED y en el rebobinado.
  - Gigante, kit del largo 3 (earshot rank: 366837, 222523 y 634201 "strong" como monstruo):
    - gruñido o respiración en cada cuadro de aparición y rugido cuando Ava lo ve y en "the smile";
    - pasos descalzos pesados GSTEP sincronizados con su zancada;
    - golpe en el vidrio en `06b`.
  - Metro y cabina:
    - tren que arranca y rodadura con la velocidad, agujas, golpe al tomar el cambio;
    - frenos con chirrido hasta parar y apagón;
    - cinta arrancada (Freesound CC0 267712), puerta metálica, palanca;
    - glitch + VHS, tics de la cuenta, zumbido de tubos que parpadean;
    - pasos de Ava (Dino Crisis), room tone del vagón y rumor del túnel.
  - Golpe final en el último tic.
  - Master estéreo: −14,0 LUFS, −1,3 dBTP (mp4). earshot critique: launch-grade 23/23, realness 0,95.
- **Render:** `renders/CHOOSE - You Stayed On The Last Train… - Part 3.mp4` (62,0 s, 1080x1920, 30 fps). Portada `….png` (pose aprobada vía `thumb_post.js`, pistola negra, el gigante detrás, HUD real SUBWAY · Danger al 48 %).
- **QA propio:**
  - Hojas a 5 fps del mp4 exportado (`review/qa/final/sheet_0..3.png`) y recortes 4× (`review/qa/final/crops.png`).
  - Scan de parpadeo de cuadro único: 0.
  - Sin clipping del gigante por paredes o techo.
  - Ava no tiembla, la cámara no tiembla.
- **`revisar_render.py`:** no corrió. La API respondió "credit balance is too low" (créditos del mes agotados): solo queda mi QA cuadro a cuadro.

## 2026-11-17 (noche): "the hunter" + poster + entrega
- **Voz:** el gigante pasa a llamarse "the hunter".
  - Regeneradas solo dos tomas, cada una con 10 semillas (VoiceStudio REST, f2f8f8dc, 32 pasos, speed 0.88):
    - 06_0: "The doors close, and the hunter stays outside." Elegida s6: whisper exacto, F0 final −2,4 st, earshot rank "a woman speaking".
    - 09_1: "The hunter got on board." Elegida s6: whisper exacto, F0 final −0,9 st.
  - Las tomas viejas quedan en `voz/takes_smile/`.
  - `guion.md`, `gen.py`, `prep.py`, `build_cues.py` (palabras clave `hunter`) y el color del subtítulo actualizados. Cortes, gigante, tema y gruñidos se recalculan solos desde la voz.
- **"OH FUDGE"** ya no sigue sobre YOU DIED: subtítulo vacío en `04c_died`, en film.js.
- **Mezcla y render:** 62,0 s, −14,0 LUFS, −1,4 dBTP. Tema del gigante en 14,03–19,09 · 23,77–26,48 · 45,08–49,52 · 59,68–62,0.
- **QA:**
  - Tramos cambiados a 10 fps (`review/qa/final/hunter_a.png`, `hunter_b.png`).
  - Scan de parpadeo: 0.
  - earshot timeline: voz natural y rugido en "the hunter".
  - `revisar_render.py` sin correr: créditos de API agotados.
- **Miniatura, estilo nuevo fijo (GUIA §7):** poster de cine tipo RE3. `review/poster_layers.sh` + `review/poster.py` → `review/poster_v1.png` (= `renders/CHOOSE - You Stayed On The Last Train… - Part 3.png`).
- **Entregado (versión share CRF 24):**
  - LucidLink `Ava Restfield/CHOOSE - You Stayed On The Last Train… - Part 3.mp4` + `Miniaturas/…png`.
  - `/Users/Shared/Contenido/Ava Restfield/…mp4` + `Imagenes y miniaturas/…png`.
  - Sin mp4 en `renders/`.
  - GUIA §3/§6/§7/§8 y STALKER.md actualizados.

## 2026-11-17 (noche 2): final reformulado con la gramática RE3 + reentrega
- `10_choice` nuevo (reemplaza los 5 ángulos del menú):
  - Corte seco 0,3 s después de "Ten seconds." → destello → negativo sin texto → parpadeo → negativo con "1. RUN FOR EXIT / 2. LOCK THE CAB" (la voz entra aquí) → parpadeo → color, mismo encuadre.
  - Al volver el color: caja azul en "one"/"two", cuenta y menú vivo.
  - El cazador golpea la puerta de paso del fondo: hoja con bisagra que cede y rebota, vidrio que se raja de a poco (8 golpes en tiempo de historia, congelado en los negativos y ×0,5 en color).
- Mezcla:
  - Tema del cazador sin cortes de 45,08 s al final.
  - Drone 871189 + latido 40/60 bpm.
  - Impactos en cada golpe y en los destellos; gruñidos ×0,5.
  - −14,0 LUFS, −1,4 dBTP, earshot launch-grade 21/21.
- QA:
  - Tira del final a 5 fps (`review/qa/final/ending_5fps.png`) y golpe a 30 fps (`review/qa/final/door_hit_30fps.png`).
  - Scan de parpadeo: 0. El cazador queda detrás del muro (plano de recorte).
- Duración: 62,1 s. Share reescrito en LucidLink y en /Users/Shared/Contenido. Sin mp4 en `renders/`. GUIA §6 "Finales y tarjetas" actualizada.
- 2026-11-17 (v4 audio): el tema del cazador reinicia en 0,5 s en cada aparición (14,03 · 23,77 · 45,08→final), entrada 0,2 s; remux sobre la imagen ya entregada (-c:v copy), -14,0 LUFS, -1,3 dBTP; reescrito en LucidLink y /Users/Shared/Contenido; GUIA §4 y STALKER.md.
