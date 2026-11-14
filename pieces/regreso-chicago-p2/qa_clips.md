# QA clips · regreso-chicago Parte 2 (MAJESTIC, 2026-11-05)

Método (el de camionero): hoja de 4 fotogramas por clip (8/35/62/90 %) comparada con chars/ (ROGELIO, YESENIA, ULISES, REBECA, JOSEFINA, LOC_FACHADA, LOC_COCHERA) y con la geografía fija de clips.py; tiras del 38 % inferior a 1.5 fps (subtítulos), tiras de bordes izq./der. (25 %) a 4 fps, hoja completa a 2 fps en los 36 clips y a 4 fps (primeros 4 s) en los dudosos, más fotogramas completos de los bordes dudosos. freezedetect + cortes (scene > 0.3) + LUFS por clip. Audio: faster-whisper large-v3 (es, CPU, int8) sobre WAV cargado con numpy, contra lines.json, más F0 mediana por clip (y earshot en c26/c27). Nada se corrió en Flow.

Resultado general: caras y ropa correctas en todos (Rogelio chamarra de mezclilla negra, playera mostaza, morral verde olivo; Yesenia blazer negro, blusa esmeralda, arracadas y cadena; Ulises polo azul rey con lentes en el cuello, reloj dorado y **pantalón chino beige en todos** (r1, c06, c08, r2, c11, r3); Rebeca cabello platino, blusa cebra y cárdigan guinda, **manos abajo** en c04, c13, c24, c26, r7; Josefina trenza gris, rebozo marino, blusa bordada). Una sola carpeta azul (sin sobres ni papeles), una sola maleta negra (r5, c21). Sin niños, armas, policías ni extremidades de más; nadie señala con el dedo (c29: mano abierta y pulgar arriba). Geografía bien (fachada: Yesenia/Rebeca/Ulises a la IZQ. en la reja, Rogelio/Josefina a la DER.; cochera con la camioneta). **Sin subtítulos ni texto en ninguno.** Ningún clip congelado; sin cortes detectados (pero r2 trae un fundido interno, ver abajo). Voces: hombres 98–147 Hz (Rogelio, Ulises), mujeres 155–242 Hz (Yesenia, Rebeca, Josefina), cada una con su personaje; c26 (Rebeca, 155 Hz, grave) y c27 (Rogelio, 148 Hz, pregunta) confirmados con earshot: mujer / hombre.

| clip | estado | motivo |
|---|---|---|
| c01 | OK | Mano abierta propia. Voz 0.38–9.10, las dos frases. |
| c02 | OK con crop | Bulto oscuro (ropa negra) en el borde DER. de 0.0 a ~0.75 s; voz desde 0.54. Frase 1 con `crop=630:1120:0:40`. Voz completa. |
| c03 | OK | Una carpeta. Voz 0.0–7.1 completa. |
| c04 | OK | Manos abajo. Voz 0.52–7.0 completa. |
| c05 | OK (recorte) | Orilla roja/blanca (blusa bordada, doble de Josefina) en el borde IZQ. de 0.0 a ~0.5 s; voz desde 0.96: el corte por frases ya la deja fuera (no empezar antes de 0.6 s). Voz completa, baja (−25.2). |
| r1 | OK | Ulises solo, chino beige, toca los lentes. Mudo (alucina "¡Suscríbete!": silenciar). |
| c06 | OK con crop | Mujer de blusa blanca bordada (doble de Josefina) en el borde DER. de 0.0 a ~1.5 s; voz desde 1.20. Frase 1 con `crop=630:1120:0:40`. Voz completa. |
| c07 | OK | Voz 0.0–5.86 completa. |
| c08 | OK con crop | Mujer de blanco y pelo oscuro en el borde DER. (último ~7 %) de ~0.75 a ~2.5 s; voz desde 1.30. Frase 1 con `crop=630:1120:0:40`. Voz completa. |
| c09 | OK | Voz 0.86–5.82 completa. |
| r2 | OK (recorte) | Ulises entra caminando a la cochera (desde el borde, no aparece de golpe). **Fundido interno ~3.2–3.5 s** a otra toma (otra camioneta, otro fondo con árboles): usar solo 0.5–3.1 s. Silenciar (−21.9 LUFS, alucina "Bienvenidos..." en 4.6–6.0). |
| c10 | OK con crop | Persona de blanco en el borde IZQ. de 0.0 a ~0.75 s; voz desde 0.58. Frase 1 con `crop=630:1120:90:40`. Una camioneta al fondo. Voz completa, fuerte (−14.3). |
| c11 | **REGENERAR** | **Dos camionetas**: una puerta blanca abierta "flotando" en primer plano a la IZQ. y otra camioneta (con calavera roja) detrás de Ulises, los 8 s. Voz completa. |
| c12 | OK | Una camioneta al fondo. Voz 1.48–6.32 completa (Whisper junta las frases). |
| r3 | OK | Una camioneta sale, Ulises al volante. Mudo (silenciar, −32.4). |
| c13 | OK | Manos abajo. Voz 0.80–5.80 completa. |
| c14 | OK | Voz 0.50–6.22 completa ("Rogelio…" con la pausa). |
| c15 | OK | Voz 0.0–6.64 completa. |
| c16 | **REGENERAR** | Bulto oscuro grande (chamarra negra, doble de Rogelio) en primer plano en el borde DER. (~20 % del ancho) de 0.0 a ~1.75 s; la voz arranca en 0.0: el crop necesario (1.33×) descentra a Yesenia. |
| c17 | OK | Voz 0.46–6.78 completa ("5" = cinco). |
| r4 | OK | Yesenia sola. Mudo (alucina "¡Suscríbete al canal!": silenciar). |
| c18 | OK | Una carpeta. Voz 0.56–7.54 completa. |
| c19 | OK | Voz 0.64–6.52 completa. |
| r5 | OK (recorte) | Yesenia sale con una maleta; desde ~2.5 s la suelta y sigue caminando, la maleta se queda atrás y sale de cuadro: usar solo 0–2.5 s. Silenciar. |
| c20 | OK | Voz 0.94–6.68 completa. |
| c21 | OK | Mano en la maleta. Voz 1.16–5.30 completa. |
| c22 | OK | Una carpeta. Voz 1.06–6.30 completa. |
| c23 | OK | Voz 0.0–6.70 completa. |
| c24 | OK | Manos abajo. Voz 0.0–4.68 completa. |
| c25 | OK | Una carpeta. Voz 1.18–6.42 completa. |
| c26 | OK con crop | En 0.0–0.25 s Rebeca salta de la orilla IZQ. al centro, y un cárdigan guinda (doble) asoma en el borde DER. (último ~12 %) hasta ~1.5 s; voz desde 0.90. Frase 1 con `crop=594:1056:0:40`. Voz completa ("30" = treinta), voz de mujer. |
| r6 | OK (recorte) | Josefina sin la carpeta a la vista hasta ~2.5 s, luego la sube desde abajo: usar desde 3.0 s (continuidad con c25/c28). Silenciar (alucina "¡Suscríbete!"). |
| c27 | OK | Voz 0.38–4.56 completa; "habla, amá" se oye "habla, ma" (elisión natural), voz de hombre. |
| c28 | OK | Una carpeta. Voz 0.0–5.78 completa. |
| r7 | OK | Rebeca sola, sonrisa. Mudo (alucina "¡Suscríbete!": silenciar). |
| c29 | OK | CTA a cámara, manos abiertas/pulgar, sin señalar. Voz 0.60–8.84 completa. |

## REGENERAR
- **c11**: dos camionetas (puerta abierta flotando en primer plano + otra camioneta detrás de Ulises).
- **c16**: doble de Rogelio (chamarra negra) en primer plano en el borde der. de 0.0 a ~1.75 s, con la voz desde 0.0.

Cambios en clips.py: constantes `ALONE`, `ONE` y `gaze(side)` (como camionero v2). c11: Ulises "in front of" la camioneta con la mano en el cofre (ya no junto a la puerta abierta), `gaze('RIGHT')` + ONE + ALONE + "the truck behind him is the only vehicle in the shot, all its doors closed, no second truck and no loose car door anywhere". c16: `look('Rogelio', ...)` → `gaze('RIGHT')` + ONE + ALONE + "no man in a black jacket anywhere". Se mantienen STYLE, VOICE, NOSUB, SOLO, SAFE, SOFT, NOREF, STYLES, TRIES=6, los 17 s entre clips y el gatito de control.

Probado en seco en una copia con gen falso: con IDs, la versión anterior pasa a `clips/old/<id>_vN.mp4` (sin pisar las que ya hay), el resto no se toca, e imprime "FIN P2".

Para regenerar (cuando Flow esté libre): `python -I clips.py c11 c16 > clips_log2.txt`. Revisar después: una sola camioneta y ninguna puerta suelta (c11), nadie en los bordes (tiras a 4 fps), voces completas.

## Arreglos menores para el montaje
- **Crops de la frase 1** (punch-in, 720×1280 → escalar de vuelta): c02, c06, c08 `crop=630:1120:0:40`; c10 `crop=630:1120:90:40`; c26 `crop=594:1056:0:40`. c05 no necesita crop si la frase 1 arranca ≥ 0.6 s.
- **Tramos útiles**: r2 0.5–3.1 s (fundido interno después); r5 0–2.5 s (suelta la maleta después); r6 desde 3.0 s (carpeta a la vista).
- **Silenciar** r1–r7 (ruido de sala; Whisper alucina "¡Suscríbete!" / "Bienvenidos...").
- Volumen: c10 (−14.3) fuerte; c15, c27, c29 (−16.9) algo fuertes; c05 (−25.2) y c11 (−23.5) bajos. El loudnorm en dos pasadas de edit.py los empareja.
- Arranques tardíos de voz (c12 1.48, c08 1.30, c06 1.20, c25 1.18, c21 1.16, c22 1.06 s): el montaje por frases (phr.py) los recorta.
- Whisper escribe números con cifras (5, 30) y a veces junta las dos frases en una (c12, c19, c24): coinciden con lines.json; no hay palabras faltantes, repetidas ni segundas frases perdidas en ningún clip.

## QA v2 (c11, c16) y montaje v1 (2026-11-05)
- **c11 v2**: una sola camioneta al fondo y ninguna puerta suelta, pero de 0.0 a ~2.0 s asoma en primer plano (abajo a la der.) el capó blanco donde apoya la mano. Arreglo: frase 1 con `crop=594:1056:0:40` (verificado a 4 fps: queda solo la camioneta del fondo). Voz completa (large-v3), aunque **repite "y me la llevo"** (5.79–6.25) y hay un ruido en 7.4 s: se corta en 5.32. Sin subtítulos.
- **c16 v2**: tiras de bordes a 4 fps limpias (nadie en los bordes; solo el hombro y el pelo de Yesenia). Voz completa 0.83–5.73. Sin subtítulos. Viejas en clips/old/.
- **renders/v1.mp4**: 147.2 s, 76 planos (media 1.96 s), 0.4 s de negro antes del CTA. EDL en edit.py (rangos de phr.json + envolvente, confirmados con large-v3). -14.3 LUFS, -1.6 dBTP, LRA 4.0. Sync en 5 puntos (6.3/37.3/71.2/107.0/143.2 s): audio +5 ms, imagen con desfase de 0 fotogramas. Hoja de contactos sin texto (solo la marca MAJESTIC STORIES arriba a la izq.). Transcripción large-v3: las 58 líneas en orden, ninguna falta ni se repite. earshot: Music 0.69–0.73 bajo la voz en los tres tramos.
