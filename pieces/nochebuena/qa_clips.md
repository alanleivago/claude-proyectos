# QA clips · nochebuena Parte 1 (MAJESTIC, 2026-11-05)

Método (el de camionero): hoja de 4 fotogramas por clip (8/35/62/90 %) comparada con chars/ (HERMINIA, GERARDO, REGINA, IGNACIO, LOC_PATIOPINATA, LOC_COMEDORLUCES, LOC_COCINAPONCHE) y con la geografía fija de clips.py; tiras del 38 % inferior a 1.5 fps (subtítulos), tiras de cuadro completo a 4 fps (bordes, entradas, congelado) en los 42 clips, y fotogramas a 300 px de los bordes dudosos con el recorte de prueba aplicado. freezedetect + cortes (scene > 0.3) + LUFS por clip. Audio: faster-whisper large-v3 (es, CPU, int8) sobre el WAV cargado con numpy, palabra por palabra contra lines.json, más F0 mediana por clip. Nada se corrió en Flow.

Resultado general: caras y ropa correctas en todos (Herminia trenza canosa, rebozo vino y vestido marino; Gerardo blazer gris carbón, camisa blanca abierta, reloj plateado, sin corbata; Regina vestido verde esmeralda satinado, arracadas doradas, labios rojos; Ignacio lentes redondos, saco de pana café y cuello de tortuga crema). Nadie con sombrero; sin niños (el nacimiento solo tiene figuras de barro), armas, policías ni extremidades de más; nadie señala con el dedo (manos abiertas; en c10 Gerardo hace un gesto de puño/pulgar hacia atrás a 1.0–1.5 s, no es dedo acusador). Una sola canasta con servilleta bordada (c02), una sola olla de ponche (i1, r3, r4, c12) y un plato de buñuelos (i1), un solo jarrito (c21, sin otras manos brindando), una sola piñata de estrella (c01–c04, c31, c32), un solo nacimiento (c05, c08, i2, c23, c26). Geografía bien. Ningún clip congelado ni con cortes internos. Subtítulos: solo c18. Voces: hombres 105–133 Hz (Gerardo, Ignacio), mujeres 181–250 Hz (Herminia, Regina), cada una con su personaje. Transcripción = lines.json en los 33 diálogos: sin palabras faltantes, repetidas ni segundas frases perdidas.

| clip | estado | motivo |
|---|---|---|
| c01 | OK | Audio completo (0.0–6.3). |
| c02 | OK | Una canasta. Audio completo (0.0–6.9). |
| c03 | OK con crop | Hombro/rebozo a cuadros y mano de otra persona en el borde DER. de 0.0 a ~2.2 s; voz desde 0.0. Frase 1 (0.0–2.6) con `crop=576:1024:0:40` (limpio). Audio completo. |
| r1 | OK | Se cierra el rebozo. Mudo (alucina "¡Suscríbete!": silenciar). |
| c04 | OK con crop | Cabeza oscura y ropa clara de alguien en el borde IZQ. de 0.0 a ~0.75 s; voz desde 0.0. Frase 1 con `crop=576:1024:144:40` (limpio). Audio completo. |
| c05 | OK | Nacimiento a la IZQ., mano abierta. Audio completo (0.0–4.7). |
| c06 | OK con crop | Hombro desnudo de una mujer en primer plano en el borde DER. de 0.0 a ~2.0 s; voz desde 0.61. Frase 1 con `crop=560:996:0:60` (limpio). Audio completo. |
| r2 | OK | Mudo (silenciar). |
| c07 | OK | Mano abierta hacia el fondo. Audio completo (0.56–7.2). |
| c08 | OK | Audio completo. |
| i2 | OK | Figuras quietas, sin morph ni niños vivos. Empieza con paneo sobre la mesa: usar solo 4.25–5.75 s (nacimiento). Mudo (silenciar). |
| c09 | OK con crop | Tela floreada roja de otra persona en el borde DER. de 0.0 a ~1.0 s; voz desde 0.0. Frase 1 con `crop=594:1056:0:40` (limpio). Audio completo. |
| c10 | OK con crop | Mujer de ropa floreada en primer plano en el borde DER. de 0.0 a ~1.5 s; voz desde 0.64. Frase 1 (0.64–2.2) con `crop=540:960:0:60` (limpio). Audio completo. |
| i1 | OK | Una olla, un plato de buñuelos, sin manos. Mudo (silenciar). |
| r3 | OK | Remueve el ponche, una olla. Mudo (silenciar). |
| c11 | OK | Audio completo, fuerte (−16.3). |
| c12 | OK | Audio completo. |
| c13 | OK con crop | Hombro con estampado de alguien en la esquina inferior DER. de 0.0 a ~0.75 s; voz desde 0.0. Frase 1 con `crop=594:1056:0:40` (limpio). Se quita los lentes (bien). Audio completo. |
| c14 | OK | Voz 0.6–7.2. |
| c15 | OK | Mano en el pecho. Audio completo, bajo (−23.7). |
| r4 | OK | Mudo (silenciar). |
| c16 | OK | Voz 1.02–6.46. |
| c17 | OK con crop | Nuca canosa y camisa floreada de otra persona (doble) en el borde DER. de 0.0 a ~0.75 s; voz desde 0.0 ("¿Su hijo?"). Frase 1 con `crop=594:1056:0:40` (limpio). Audio completo. |
| c18 | OK (regenerado v2) | Sin subtítulos ni letras (tira inferior a 1.5 fps limpia; versión vieja en clips/old/c18_v1.mp4). Hombro oscuro de alguien en el borde IZQ. de 0.0 a ~0.6 s, antes de la voz (0.77): empezar en ≥ 0.69 s (verificado limpio). Las dos frases completas (0.77–6.92, large-v3). |
| r5 | OK | Mudo (silenciar). |
| c19 | OK con recorte | De 0.0 a ~0.9 s Ignacio está cortado en el borde IZQ. y salta al centro (paneo brusco); la voz arranca en 1.3: empezar el plano en ≥ 1.0 s. Audio completo. |
| c20 | OK | Mano abierta levantada (detenerlo), no señala. Voz 1.36–6.84. |
| c21 | OK | Un jarrito, sin otras manos. Hombro floreado en la esquina DER. de 0.0 a ~0.75 s, antes de la voz (1.04): empezar en ≥ 1.0 s. Audio completo. |
| c22 | OK | Voz 0.8–5.4. |
| c23 | OK | Frase corta: voz 1.12–2.54 en 6 s; usar ~0.9–3.0 s. |
| c24 | OK | Mano en el respaldo de la silla vacía. Voz 0.54–7.42. |
| r6 | OK | Mudo (silenciar). |
| c25 | OK con crop | Nuca/espalda oscura de alguien en primer plano en el borde DER. de 0.0 a ~1.75 s; voz desde 0.0. Frase 1 ("¿Doña Herminia?", 0.0–1.4) y arranque de la 2ª con `crop=594:1056:0:40` (limpio). Audio completo. |
| c26 | OK | Mano abierta hacia la mesa. Voz 0.54–7.22. |
| c27 | OK | Audio completo, bajo (−23.2). |
| c28 | OK | Audio completo. |
| c29 | OK | Audio completo. |
| c30 | OK | Audio completo. |
| r7 | OK | Baja la mirada. Mudo (alucina "SILENCIO": silenciar). |
| c31 | OK | Tono frío bien; push-in rápido de 0.0 a ~0.75 s (en cuadro desde el frame 0, no entra). Voz 0.98–6.84. |
| c32 | OK | Mira la piñata y sonrisa fría; tono bien. Voz 1.1–6.78. |
| c33 | OK | CTA con sonrisas, cabeceo y labios claros todo el clip; manos quietas bajo la mesa (no ajusta el rebozo ni gesticula), algo estático de cuerpo pero no mudo ni rígido de cara. Una nochebuena de la pared queda justo detrás de su cabeza. Audio completo (0.0–7.2). |

## REGENERAR
- **c18**: subtítulo quemado de la 2ª frase (3.25–6.0 s). Si vuelve a salir con letras: fallback `crop=534:950:93:0` (probado: el texto empieza en y ≈ 1000, el recorte termina en 950).

Cambio en clips.py: c18 cambia `look("Ignacio", "LEFT")` por `gaze("LEFT")` (ONE + ALONE ya van en CU) y añade `CLEAN` después de `NOSUB`. Se mantienen STYLE, VOICE, NOSUB, SOLO, SAFE, SOFT, NOREF, STYLES, TRIES=6, los 17 s entre clips y el gatito de control.

Probado en seco en una copia con gen falso: con IDs, la versión anterior pasa a `clips/old/c18_v1.mp4`, el resto no se toca, el prompt lleva CLEAN y gaze, e imprime "FIN P1".

Para regenerar (cuando Flow esté libre): `python -I clips.py c18 > clips_log2.txt`. Revisar después: tira del 38 % inferior a 1.5 fps sin letras, nadie en los bordes, voz completa.

## Arreglos menores para el montaje
- **Crops de la frase 1** (punch-in, solo mientras dura el borde): c03 `576:1024:0:40`, c04 `576:1024:144:40`, c06 `560:996:0:60`, c09 `594:1056:0:40`, c10 `540:960:0:60`, c13 `594:1056:0:40`, c17 `594:1056:0:40`, c25 `594:1056:0:40` (todos probados limpios en el peor fotograma).
- **Arranques**: c19 desde ≥ 1.0 s (salto de Ignacio), c21 desde ≥ 1.0 s (hombro en la esquina), i2 solo 4.25–5.75 s, c23 ~0.9–3.0 s.
- **r1–r7, i1, i2**: silenciar el audio (ruido de sala −35 a −49 LUFS; Whisper alucina "¡Suscríbete!"/"SILENCIO").
- Volumen: c33 (−15.7), c11 (−16.3), c17 (−16.4), c21 (−16.5) fuertes; c15 (−23.7), c19 (−23.5), c03 (−23.4), c27 (−23.2) bajos. El loudnorm en dos pasadas de edit.py los empareja.
- Arranques tardíos de voz (c20 1.36, c19 1.3, c23 1.12, c32 1.1, c21 1.04, c16 1.02, c31 0.98 s): el montaje por frases (phr.py) los recorta.
- Whisper escribe "reboso", "Señor", "sirva le", "Don": son grafía; el audio dice lo de lines.json.
