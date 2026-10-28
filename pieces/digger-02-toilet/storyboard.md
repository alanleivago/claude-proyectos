---
type: plan
status: complete
tags: [digger, digger-02, storyboard, the-toilet, inodoro, zero-fem, ps1, mechayuki]
relatedTo: [digger-01-fridge, mechayuki-rules, digger-channel, guion]
---

# Digger 02: The toilet — storyboard

- **Duración:** la voz dura 94,1 s. Con el outro, el vídeo dura **96,7 s**. Son 32 planos, unos 20 planos/min.
- **Comentario de Jake:** empieza en el 58 % (56,4 s). La norma es 35-40 %, pero el guion fija el orden y el comentario va en el párrafo 9.
- **Lenguaje visual:** el mismo del ep 01.
  - Etiquetas amarillas "This is a…" en un corte seco (C) sobre la palabra: TOILET, OUTHOUSE, CHAMBER POT, FLUSH TOILET y TRAP.
  - Placas pequeñas con `pixfont.js`.
  - Disolvencias de mosaico (M) en las pausas.
  - Corte seco de reacción en "Gross".
  - Diagrama en corte del sifón en S.
- **Motor:** `engine/film.js` (`index.html?v=megagirl`). Los tiempos salen de `timeline_megagirl.json`.
- **Caras:** `ojos/boca` según `zero-fem/face/README.md`.
- **Acciones nuevas:** `squat`, `pinch_nose`, `pull_chain`, `throw_out_window` y `bend_pipe`. Están en `zero-fem/anim/build_anim.py`.

## v2: cambios tras las notas del usuario (pendiente de aprobación; todavía no se ha renderizado)

**Tablero:** `storyboard_v2.png` muestra el still central de cada plano, con la etiqueta **CHANGED** en los modificados. Inicio, mitad y final de cada plano están en `review/v2/sheet_1-4.png`.

**Voces para escuchar** (en `voz-studio/v2_listen/`):
- `NEW_p01_opening_Operator.wav` y `OLD_p01_opening.wav`
- `ALT_p01_opening_shouted_Operator.wav`
- `NEW_p09_Operator_Jake_asks.wav` y `OLD_p09_Operator_Jake_asks.wav`
- `NEW_full_voice_track.wav`

### 1. Inicio y final distintos (como sinaboto)
Se miraron los primeros y últimos planos de los 9 vídeos (`fuentes/tiktok-research/sinaboto`):
- **Abren** con la situación primitiva del gancho, en plano medio.
- **Cierran** en otro sitio, el del resultado ya funcionando, en plano medio y de frente. A veces hay antes un plano general del resultado.
- **Nunca** cierran con el mismo lugar ni el mismo encuadre del inicio.

Cómo queda aquí:
- **#1 (nuevo encuadre):** contrapicado medio. Ella cava con energía junto a la valla y los pinos, y en "artifact" suena el *clink*.
- **#2 (nuevo encuadre):** picado 3/4 dentro del hoyo. El escáner marca el váter enterrado.
- **#28, #31 y #32 (nuevo lugar):** un baño en ruinas del pueblo, con papel pintado roto, suelo de damero, bañera, lavabo, nieve que entra por el techo y el váter desenterrado ya instalado y con agua.
  - #28: manos en la cadera y el agua brilla.
  - #31: el váter le echa una bocanada verde y ella se encoge de hombros.
  - #32: despedida en plano medio con la cámara alejándose. El outro va encima, como antes.
- **#30:** pasa a la letrina del pueblo (lo viejo frente a lo nuevo), con el contador 1596 → 1775.

La excavación ya no aparece al final.

### 2. Caca estilo anime
Se cambió el "grumo" por el **emoji en espiral**: tres rollos marrones, punta y carita mona. Sale en:
- #5: flota en el hoyo que se llena.
- #6: en el fondo del pozo, en el corte.
- #10: asoma del orinal.
- #11: sale volando por la ventana.
- #12: cae al adoquín.
- #13: le cae en la cabeza al transeúnte, como un sombrero.
- #16: gira y desaparece en la cisterna.
- #18: baja por la tubería.

El salpicón 2D marrón se queda.

### 3. Voz
- **p01:** 24 tomas nuevas ("Operator!" / "!" y guidance 2 y 3), medidas con F0 y earshot. Se eligió **B_g2_s1**.
  - earshot "excited, cheerful, energetic woman": z 7,9, frente a 6,8 de la toma vieja.
  - F0 mediana 345 Hz (antes 298), y "Operator" arranca en 370–400 Hz (antes 237).
  - Alternativa más gritada, por si la prefiere: `ALT_…shouted` (A_g3_s2, "Operator!" a ~600 Hz).
- **p09:** 16 tomas nuevas. Se eligió **J_g3_s7**, la más natural según earshot.
  - Antes sonaba robótica porque la toma entera había pasado por PSOLA. Ahora la rampa PSOLA solo toca "sewer?" y se injerta en la toma original: entra en el arranque sordo de la "s" (las dos señales son idénticas ahí) y sale en el silencio. El resto es audio original. "sewer?" sube **+8,6 st**.
  - "asks" se cortaba porque se metía silencio en la cola de la "s". Ahora no se corta ahí: "asks" dura 0,50 s y la "s" decae sola.
- El resto de la voz es igual. Whisper coincide con el guion. Duración de la voz: 93,9 s.

### 4. Planos débiles
- **#4:** picado 3/4 alto con un hoyo más grande y oscuro: se ve debajo de ella, entre los pies.
- **#13:** los tres transeúntes caminan en la misma dirección, separados (−1,2 / 0,25 / 1,9 m) y con la cámara más abierta. La caca cae y se le queda en la cabeza al del centro.
- **#25:** el tubo se convierte en un **sifón en S** de verdad: entrada hacia arriba, curva en U que se llena de agua azul, corona y bajada a la cloaca. Placas S-TRAP y WATER. El tubo ya no le pasa por la cara.

Pendiente para el render final, cuando se apruebe: volver a renderizar la música con los tiempos nuevos, hacer la mezcla y la revisión final.

### Tabla de planos (v1)
Los planos marcados como CHANGED en `storyboard_v2.png` (1, 2, 4, 5, 6, 10, 11, 12, 13, 16, 18, 25, 28, 30, 31 y 32) cambian como se describe arriba. Los tiempos de la v2 son unos 0,15 s más cortos desde el plano #2 (la toma nueva de p01 es más corta).

| # | inicio (s) | tr. | línea | plano / set | acción · cara | el mundo reacciona / FX | rótulo |
|---|---|---|---|---|---|---|---|
| 1 | 0,00 | — | Operator… I dug up another human artifact. | G picado, excavación (pueblo nevado, váter enterrado) | `dig` → `surprised`; angry/shout → surprised/gasp | el hoyo crece en cada palada, la nieve vuela al montón, *clink* de porcelana con impacto y "!" | — |
| 2 | 3,24 | C | Humans called it… a toilet. | PM, ella y el váter | `cheer`; surprised → hearts/smileOpen | caja HUD de escaneo, destellos, corazones | SCANNING → ARTIFACT 002 |
| 3 | 5,61 | M | If you dig a hole in the snow | ¾ picado, hoyo pequeño | `dig` con la pala; angry/shout | el hoyo crece, terrones al montón, polvo de nieve, sudor | — |
| 4 | 7,78 | M | and sit over it… you have a toilet. | PE ¾ alto, hoyo oscuro entre los pies | **`squat`**; shocked/bigShock → half/frown → relaxed/cat | temblor, vaho, copos, viento | **TOILET** (guía al hoyo) |
| 5 | 10,77 | M | But the hole fills up… | PE, el hoyo | **`pinch_nose`**; surprised → disgust | el hoyo se llena de marrón (dibujo limpio) con grumos, burbujas, olor y moscas | — |
| 6 | 12,90 | M | so humans built a little wooden shed over a deep pit. | corte del suelo: tierra en sección | idle → `point`; happy | la caseta se monta pieza a pieza ("built / little / wooden / shed") con polvo; el pozo se hace más hondo en "deep" | DEEP PIT |
| 7 | 16,73 | C | This is an outhouse. | G, letrina con puerta de luna | `hands_on_hips` → `smug` con guiño | la puerta se abre y chirría, moscas y olor por el tejado | **OUTHOUSE** |
| 8 | 18,46 | M | At night, nobody wanted to walk outside in the cold… | noche en el pueblo (gradación azul, ventanas encendidas, luna), letrina al fondo | `shiver`; sad → shocked | temblor, vaho, viento, copos, "?" en una burbuja | — |
| 9 | 22,50 | M | so they kept a pot under the bed. | dormitorio de noche, cama de hierro (CC0), vela | `kneel`; half → happy | el orinal sale deslizándose de debajo de la cama, "!" y destellos | — |
| 10 | 25,00 | C | This is a chamber pot. | detalle bajo del orinal | — | la tapa salta, olor y moscas | **CHAMBER POT** |
| 11 | 26,80 | M | And in the morning… they threw it out the window. | fachada por la mañana, ella en una ventana de verdad | **`throw_out_window`**; angry/shout → happy | los postigos se abren, gallo; el orinal se vuelca y los grumos marrones salen volando | sol pixel |
| 12 | 30,88 | C | Into the street. | contrapicado desde la calle | pose final del lanzamiento | los grumos caen por la fachada y hacen *splat* en el adoquín: salpicón, charco que crece, olor, temblor de cámara | — |
| 13 | 32,18 | M | Where people were walking. | calle, tres transeúntes (relleno `lib-mml` recoloreado) andando | — | un grumo cae en la cabeza del cajero: *splat*, se queda parado y tiembla; "!", marca de enfado, olor, moscas; otro transeúnte se para con "!" | — |
| 14 | 34,62 | C | Gross. | PP en la ventana | `shake_head`; **disgust/disgust** sin aleteo de boca | olor a ambos lados, sudor, moscas, impacto verde, temblor | — |
| 15 | 35,96 | M | So a man named John Harington built a seat with a water tank above it. | sala de 1596 (roble y piedra) | idle → `present` | flecha al asiento; destellos en la cisterna; *punch-in* en "tank" | J. HARINGTON 1596 · SEAT · WATER TANK |
| 16 | 41,74 | C | Pull the handle… and the water flushes everything away. | PM ¾ | **`pull_chain`**: el puño agarra el asa, la cadena y la palanca bajan con la mano | el agua baja por la tubería, salpica, remolino, el grumo gira y desaparece | — |
| 17 | 46,04 | C | This is a flush toilet. | PE | `cheer` | remolino, destellos, corazones | **FLUSH TOILET** |
| 18 | 48,32 | M | But the pipe went straight down to the sewer… | corte de la casa: suelo, tierra, tubería recta y cloaca de ladrillo | — | el agua y los grumos bajan por la tubería, el agua de la cloaca corre, burbujas | PIPE · SEWER |
| 19 | 51,78 | C | and the sewer breathed back up. | corte, más cerca | — | bolas de gas verde suben por la tubería y salen del asiento como una nube; olor, flecha hacia arriba, temblor | SEWER GAS |
| 20 | 53,77 | M | The whole house smelled. | sala de Harington con niebla verde | **`pinch_nose`**; disgust | humo verde del asiento, olor por toda la sala, moscas | — |
| 21 | 55,88 | M | Operator Jake asks: "Why doesn't my bathroom smell like a sewer?" | buzón (S5) | `phone_look` con la carta; surprised → gasp | pegatina de TikTok de operator_jake, "?" en "sewer?", *punch-in* en "Why" | comentario |
| 22 | 61,51 | C | Jake… look behind your toilet. | PP | `point`; guiño en "toilet" | flecha y destello | — |
| 23 | 63,97 | M | In 1775, | banco del relojero (engranajes y reloj de bolsillo) | `think` | tictac, los engranajes giran, destello | **1775** (grande) |
| 24 | 66,15 | C | a watchmaker named Alexander Cumming | detalle del reloj, se abre a ella | idle; happy | el reloj marca, bombilla | WATCHMAKER · ALEXANDER CUMMING |
| 25 | 68,87 | C | bent the pipe into an S. | PM | **`bend_pipe`**; angry/shout → happy | el tubo de cobre entre sus puños se dobla en S, líneas de esfuerzo, sudor, destellos | S BEND |
| 26 | 70,98 | M | Water gets stuck in the bend… and blocks the gas. | diagrama del sifón en S (vacío de escáner) | — | el agua llena la curva, el gas sube desde la cloaca y rebota en el sello: impacto, olor | WATER · GAS · BLOCKED! · SEWER |
| 27 | 74,97 | C | This is a trap. | *punch-in* al sello de agua | — | destellos | **TRAP** |
| 28 | 76,35 | M | That's why there's always water in your toilet… | el váter desenterrado con la tapa arriba | `hands_on_hips`; happy | el agua del cuenco brilla y burbujea, flecha al agua | — |
| 29 | 80,26 | C | it's a tiny wall between you and the sewer. | diagrama, con ella en miniatura sobre la taza | `smug` y guiño | un muro de ladrillos pixel sale del agua y el gas rebota en él | TINY WALL · YOU · SEWER |
| 30 | 83,41 | M | Humans spent almost two hundred years… | excavación, ella y el váter | `think` → surprised | contador de años 1596 → 1775 | 1596 TO 1775 |
| 31 | 86,70 | C | just to stop their pipes from breathing on them? | PM | surprised → `shrug` | el váter le echa una bocanada verde, sudor, "?" | — |
| 32 | 90,78 | M | Artifact understood. Logging off. | G con grúa | `wave` ×2 | destellos y nieve | LOGGING OFF… → MECHAYUKI, ARTIFACT 002: TOILET y FOLLOW @MECHAYUKI sobre la despedida |

## Sets
| set | qué es | planos |
|---|---|---|
| Excavación | El pueblo de `village()` con el hoyo grande y el váter moderno hecho en código (taza abierta con agua, asiento, tapa y cisterna) | 1, 2, 28, 30-32 |
| Hoyo pequeño | Mismo pueblo, con un hoyo de r 0,22 m. En el plano 5 se llena | 3-5 |
| Corte de la letrina | Pueblo a medias con el suelo cortado en z = 0 (sección de tierra) y la letrina sin frente sobre el pozo | 6 |
| Letrina | Tablas, tejado inclinado con nieve, puerta con luna, banco con agujero, moscas | 7, 8 |
| Pueblo de noche | `mailSet` con gradación nocturna, ventanas encendidas y luna pixel | 8 |
| Dormitorio | Papel pintado, suelo de tablas, alfombra, cama de hierro (Quaternius CC0), mesilla y vela | 9, 10 |
| Calle | Fachada de piedra con un hueco de ventana real, postigos, adoquines, casas y farola | 11-14 |
| Sala de Harington | Paneles de roble y suelo de piedra. Asiento de roble, cisterna de plomo, bajante, palanca y cadena con asa (la cadena sigue al puño) | 15-17, 20 |
| Corte de la casa | Suelo, tierra en sección, tubería recta abierta y cloaca de ladrillo con agua que corre | 18, 19 |
| Taller | Banco del relojero, engranajes, reloj de bolsillo con aguja que marca y tubos de cobre | 23-25 |
| Diagrama del sifón | Vacío del escáner; tubo abierto en sección, agua recortada por un plano de nivel, taza y cloaca | 26, 27, 29 |

## Style frames
Los primeros style frames están en `review/t1`. Las hojas finales de revisión (inicio, mitad y final de cada plano) están en `review/t5/sheet_1-4.png`.
