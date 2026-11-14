# QA clips · fierro-herradura Parte 1 (VISTA, 2026-11-06)

Método (el de nochebuena): hoja de 4 fotogramas por clip (8/35/62/90 %) comparada con chars/ (JACINTA_CORRAL, FULGENCIO_ARREDONDO, CRISTOBAL_ARREDONDO, LEOCADIO_JUEZ, ELOISA_REGISTRO, LOC_CORRALFERIA, LOC_OFICINAASOC, LOC_PISTAFERIA, PROP_TOROLUCERO) y con la geografía fija de clips.py. Tiras del 38 % inferior a 1.5 fps (subtítulos), tiras de cuadro completo a 4 fps (bordes, entradas, congelado) en los 35 clips, fotogramas a resolución completa de lo dudoso y los recortes de prueba aplicados en el peor fotograma. freezedetect + cortes (scene > 0.3) + LUFS por clip. Audio: faster-whisper large-v3 (es, CPU, int8) sobre el WAV cargado con numpy, palabra por palabra contra lines.json, más F0 mediana por clip. Nada se corrió en Flow.

Resultado general: caras y ropa correctas en todos (Jacinta: trenza, sombrero de paja con cinta café, camisa vino de broches, jeans. Fulgencio: sombrero crema, saco chocolate, corbata de bolo. Cristóbal: camisa azul cielo, sin sombrero, lampiño. Leocadio: sombrero gris, guayabera blanca sin insignias. Eloísa: cárdigan verde azulado, cola baja, sin sombrero). Un sombrero por persona en la cabeza; sin niños, armas, uniformes ni extremidades de más; nadie señala con el dedo (manos abiertas). Lucero igual en c07, i2 y c30: negro, estrella blanca en la frente, cabestro de soga, un solo toro. Un solo libro en manos (c11, c13, c27, c28); letra manuscrita borrosa e ilegible. Ningún clip congelado ni con cortes internos. Sin subtítulos en ningún clip (tira inferior limpia). Voces: hombres 113–165 Hz (c22 181 Hz porque grita el anuncio; AudioSet: "Male speech"), mujeres 195–219 Hz, cada una con su personaje. Transcripción = lines.json en los 30 diálogos: sin palabras faltantes, repetidas ni segundas frases perdidas.

| clip | estado | motivo |
|---|---|---|
| c01 | OK | Voz 0.88–8.88. |
| c02 | OK con crop | Ala de sombrero y camisa a cuadros de otra persona en el borde DER. de 0.0 a ~1.0 s; voz desde 0.0. Frase 1 (0.0–2.44) con `crop=576:1024:0:0` (limpio). Audio completo. |
| c03 | OK con crop | Ala de sombrero en el borde IZQ. arriba de 0.0 a ~0.5 s; voz desde 0.48. Frase 1 (0.48–1.6) con `crop=594:1056:126:0` (limpio). Vacas al fondo (otras reses del corral, sin Lucero): aceptable. Audio completo. |
| c04 | OK | Voz 0.96–8.98. |
| c05 | OK con crop | **Sombrero flotando** arriba a la DER. de 0.0 a ~2.0 s y camisa a cuadros en la esquina inferior DER. de 0.0 a ~0.5 s; voz desde 0.0. Frase 1 (0.0–2.74) con `crop=540:960:0:0` (limpio en 0.0, 1.0 y 2.0). Audio completo. |
| c06 | OK (aviso) | Un vaquero de sombrero blanco, chico y desenfocado, detrás de la cerca a la IZQ. de Fulgencio en buena parte del clip. Se lee como gente de la feria, no como doble; si molesta, usar solo la frase 2. Voz 0.98–9.36. |
| c07 | OK con crop | Riesgo ESTADO (toro junto a persona): bien, un solo Lucero con estrella y cabestro, mano de Jacinta en el cuello. Ala de sombrero arriba a la DER. de 0.0 a ~1.75 s y figura a cuadros entre ella y el toro de 0.0 a ~0.75 s; voz desde 0.0. Frase 1 (0.0–2.1) con `crop=624:1109:0:0` (limpio, el toro queda en cuadro). Audio completo. |
| r1 | OK con recorte | Ala de sombrero flotando arriba a la IZQ. de 0.0 a ~3.75 s y hombro a cuadros abajo a la IZQ. de 0.0 a ~0.5 s. Usar 4.0–6.0 s, o 0.0–4.0 con `crop=480:853:240:100` (limpio). Mudo (tararea "Mmm": silenciar). |
| c08 | OK | Mano abierta. Audio completo, fuerte (−16.0). |
| c09 | OK con crop | Ala de sombrero arriba a la IZQ. de 0.0 a ~0.75 s y figura a cuadros en el borde IZQ. de 0.0 a ~0.25 s; voz desde 0.68. Frase 1 (0.68–2.24) con `crop=594:1056:126:0` (limpio), o empezar en ≥ 0.8 s. Audio completo. |
| c10 | OK | Vaca blanca al fondo (no es Lucero). Audio completo. |
| c11 | OK | Un libro, ilegible. Audio completo. |
| i1 | OK | Riesgo ESTADO: letra manuscrita en garabatos, ningún texto legible; herradura dibujada bien; la mano con manga verde azulado pasa la hoja. Aviso: hay un segundo libro cerrado detrás (viene de LOC_OFICINAASOC). Mudo (alucina "Bienvenidos a mi canal": silenciar). |
| c12 | OK | Voz 0.9–6.06. |
| c13 | OK | Mano sobre el libro. Audio completo. |
| c14 | OK con crop | Hombro oscuro a cuadros en la esquina inferior IZQ. de 0.0 a ~1.0 s; voz desde 0.0. Frase 1 (0.0–1.92) con `crop=594:1056:126:0` (limpio). Audio completo. |
| c15 | OK | Audio completo. |
| c16 | OK con recorte | De 0.0 a ~1.0 s Cristóbal está cortado en el borde DER. y salta al centro (paneo brusco); la voz arranca en 2.12: empezar en ≥ 1.25 s. Audio completo, bajo (−24.8). |
| c17 | **REGENERAR** | Un segundo sombrero crema (copa) flota arriba a la DER. en todo el clip (0–6 s), justo junto al de Fulgencio; ningún recorte lo saca sin cortarle el sombrero a él. Audio completo. |
| c18 | OK | Sin subtítulos. Audio completo. |
| r2 | OK con recorte | Figura oscura en el borde IZQ. de 0.0 a ~0.5 s: empezar en ≥ 0.75 s. Mudo (silenciar). |
| c19 | OK | Audio completo. |
| c20 | OK (aviso) | Cuadro desenfocado en la pared DER. con seudoletras ilegibles. Voz 0.46–6.34. |
| c21 | OK | Audio completo, bajo (−24.1). |
| c22 | OK | Mano abierta levantada, no señala. Se oyen aplausos de fondo bajo la voz (bien para el anuncio; la cama los tapa). Audio completo. |
| i2 | **REGENERAR** | La escarapela azul trae letras ("FISIE LIPEIRD") legibles desde ~1.5 s hasta el final. Toro bien (mismo Lucero) y solo manos con manga vino. Fallback si vuelve a salir con letras: usar 0.75–1.5 s (manos acercando la escarapela) o `boxblur` sobre el centro de la escarapela. Mudo (alucina: silenciar). |
| c23 | OK con crop | Ala de sombrero arriba a la DER. de 0.0 a ~2.0 s y hombro a cuadros abajo a la DER. de 0.0 a ~0.75 s; voz desde 0.0. Frase 1 y arranque de la 2ª (0.0–2.25) con `crop=560:996:0:0` (limpio). Audio completo. |
| c24 | OK | Audio completo. |
| c25 | OK con recorte | Figura blanca abajo a la IZQ. de 0.0 a ~0.75 s; voz desde 3.0: empezar en ≥ 1.0 s. Audio completo. |
| c26 | OK | Voz 1.2–4.94. |
| c27 | OK con crop | Figura de blanco en el borde IZQ. de 0.0 a ~1.25 s; voz desde 0.0. Frase 1 (0.0–1.5) con `crop=630:1120:90:0` (limpio). Un libro. Audio completo. |
| c28 | OK | Un libro. Voz 2.76–6.88. Fuerte (−15.9). |
| c29 | OK con recorte | De 0.0 a ~0.75 s Jacinta entra desde el borde IZQ. (cortada): empezar en ≥ 1.0 s (voz desde 1.8). Audio completo. |
| r3 | OK | Mudo (alucina "Gracias por ver el video": silenciar). |
| c30 | OK | Riesgo ESTADO: un solo Lucero, igual (estrella, cabestro); sombrero liso; CTA a cámara con sonrisa, se toca el ala, cabecea y palmea al toro con la mano abierta. Audio completo (las dos frases y la pregunta doble). Fuerte (−15.0). |

## REGENERAR
- **c17**: sombrero crema duplicado flotando arriba a la DER. todo el clip.
- **i2**: letras en la escarapela.

Cambios en clips.py:
- c17: `one(...)` lleva ahora como extra `NODOUBLE("cowboy hat or man in a cowboy hat")` + "nothing hanging on the wall or the shelves behind him, the only hat in the shot is the one on his head".
- `RIB` (solo lo usa i2): "one single plain solid blue ribbon rosette, its round center button completely blank and smooth, with no letters, no words, no numbers and no printing anywhere on it".
- Se mantienen STYLE, VOICE, NOSUB, END, SOLO/ONE/ALONE con gaze, PLAINHAT, LUC (un solo toro), SAFE, SOFT con \b, variant, NOREF, STYLES, TRIES=6, los 17 s entre clips y el gatito de control.

Probado en seco en una copia con gen falso: con IDs, la versión anterior pasa a `clips/old/c17_v1.mp4` y `clips/old/i2_v1.mp4`, el resto no se toca, los prompts llevan los cambios e imprime "FIN P1".

Para regenerar (cuando Flow esté libre): `python -I clips.py c17 i2 > clips_log2.txt`. Revisar después: c17 sin segundo sombrero ni nadie en los bordes y voz completa; i2 escarapela sin letras y el mismo Lucero.

## Arreglos menores para el montaje
- **Crops de la frase 1** (punch-in solo mientras dura el borde): c02 `576:1024:0:0` (0–2.44), c03 `594:1056:126:0` (0.48–1.6), c05 `540:960:0:0` (0–2.74), c07 `624:1109:0:0` (0–2.1), c09 `594:1056:126:0` (0.68–2.24), c14 `594:1056:126:0` (0–1.92), c23 `560:996:0:0` (0–2.25), c27 `630:1120:90:0` (0–1.5). Todos probados limpios en el peor fotograma.
- **Arranques**: r1 desde 4.0 s (o `crop=480:853:240:100` en 0–4.0), r2 ≥ 0.75 s, c16 ≥ 1.25 s, c25 ≥ 1.0 s, c29 ≥ 1.0 s.
- **r1–r3, i1, i2**: silenciar el audio (−31 a −53 LUFS; Whisper alucina "Bienvenidos a mi canal", "Gracias por ver el video", tarareo en r1).
- Volumen: c30 (−15.0), c28 (−15.9), c08 (−16.0), c22 (−16.4) fuertes; c17 (−24.9), c16 (−24.8), c21 (−24.1), c20 (−23.7) bajos. El loudnorm en dos pasadas de edit.py los empareja.
- Arranques tardíos de voz (c25 3.0, c28 2.76, c16 2.12, c29 1.8, c26 1.2, c06 0.98, c04 0.96, c12 0.9, c01 0.88 s): el montaje por frases (phr.py) los recorta.
- Avisos sin acción: vaquero desenfocado al fondo en c06, cuadro con seudoletras ilegibles en c20, segundo libro cerrado en i1, aplausos de fondo en c22.
- Whisper escribe "Eloisa", "Señor", "robles", "15"/"30": es grafía; el audio dice lo de lines.json.
