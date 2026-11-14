# QA clips · posada Parte 1 (MEXI, 2026-11-05)

Método (el de camionero): hoja de 4 fotogramas por clip (8/35/62/90 %) comparada con chars/ (CATALINA, NACHO_ARCOS, BRUNO, HERMINIA_MERCADO, LOC_ARCOS, LOC_PLAZUELA) y con la geografía fija de clips.py; filas de fotograma completo a 2 fps; tiras del 38 % inferior a 1.5 fps (subtítulos) y tiras de bordes izq./der. (20 %) a 4 fps en los 37 clips; fotogramas completos cada 0.25 s de los bordes dudosos. freezedetect + cortes + LUFS por clip; luces de i1/r2/i3 cuadro a cuadro. Audio: faster-whisper large-v3 (es, CPU, int8) sobre WAV cargado con numpy, palabra por palabra contra lines.json, más F0 mediana; earshot sobre c19/c20. Nada se corrió en Flow.

Resultado general: caras y ropa correctas en todos (Bruno abrigo gris carbón, cuello alto negro, reloj dorado; Cata trenza gris, rebozo guinda, vestido marino; Nacho bigote blanco, cárdigan café, camisa crema; Herminia abrigo camel, bufanda lila, una vela). Nadie con sombrero, sin niños (las multitudes de r3 y r5 son solo adultos, revisadas a resolución completa), sin armas ni policías, sin extremidades de más, nadie señala con el dedo (manos abiertas). Una sola carpeta negra, un solo jarrito, una sola clavija, una sola piñata. **Sin subtítulos ni texto** en ninguno (hojas de la carpeta ilegibles). Ningún clip congelado. Voces: hombres 100–139 Hz (Bruno, Nacho), mujeres 186–224 Hz (Cata, Herminia), cada una con su personaje.

Luces: c01–c07 encendidas; **i1** se apagan de verdad a los ~5.5 s; c08–c18 a oscuras con farol y velas (c17 deja 6 foquitos prendidos arriba a la der., ver menores); **r2 sale con las series ENCENDIDAS** todo el clip; **i3** se encienden de verdad a los ~4.0 s; r5 en adelante encendidas.

| clip | estado | motivo |
|---|---|---|
| c01 | OK | Audio completo (0.56–7.38). |
| r1 | OK | Un jarrito. Mudo (alucina "¡Suscríbete!"). |
| c02 | OK | Audio completo. |
| c03 | OK | Audio completo ("treinta" sale como 30). |
| c04 | OK | Mano abierta. Audio completo. |
| c05 | OK | Mira el reloj. Audio completo. |
| c06 | OK | Manos abiertas. Audio completo. |
| c07 | **REGENERAR** | Espalda/hombro oscuro de otra persona en primer plano abajo a la IZQ. de 0.0 a ~1.0 s; la voz arranca en 0.48. |
| i1 | OK | Las luces se apagan de verdad a ~5.5 s. Mudo. |
| r2 | **REGENERAR** | Las series de foquitos siguen ENCENDIDAS todo el clip (debe estar a oscuras desde r2). |
| c08 | OK | Audio completo, bajo (−22.7). |
| c09 | **REGENERAR** | **Doble de Cata** (rebozo guinda) a la DER. de 0.0 a ~2.8 s, con la voz desde 0.9. Además salió la frase suavizada del intento 2 ("Y nos saca así nomás"). |
| r3 | OK* | Corte interno a ~1.4 s (kiosko vacío → procesión aparece de golpe): usar desde 1.5 s. Solo adultos. Coro de fondo (−26.5). |
| c10 | OK | Carpeta bajo el brazo. Audio completo. |
| c11 | OK* | Figura oscura en el borde DER. de 0.0 a ~1.0 s; voz desde 1.16: recortar. |
| c12 | OK | Audio completo, bajo (−23.1). |
| c13 | OK | Las dos frases completas. |
| c13b | OK* | Figura oscura en el borde DER. de 0.0 a ~0.6 s; voz desde 0.86: recortar. |
| c14 | OK | Audio completo. |
| c15 | OK | Audio completo, las dos frases (1.16–7.24). |
| i2 | OK | Una carpeta, texto ilegible. Mudo. |
| r4 | OK | Mudo. |
| c16 | **REGENERAR** | Otro hombre de pelo negro (doble de Bruno, nuca/perfil) en el borde DER. de 0.0 a ~5 s; voz desde 0.0. |
| c17 | OK* | Audio completo. Arriba a la der. se ven ~6 foquitos encendidos junto al farol (escena a oscuras). |
| c18 | OK | Cierra la carpeta. Audio completo, bajo (−22.5). |
| i3 | OK | Las luces se encienden de verdad a ~4.0 s; la cara que asoma a la izq. es Bruno. Mudo (alucina "Música"). |
| r5 | OK* | La procesión aparece de golpe (fundido) entre 0.9 y 2.1 s: usar desde 2.2 s. Solo adultos, una piñata. Mudo. |
| c19 | OK | Verso medio cantado, completo y claro (0.0–7.4). **Sin música** (earshot: voz + grillos, ninguna etiqueta de música). Usable. |
| c20 | OK | Verso medio cantado, completo (0.0–7.4). **Sin música**. Usable. |
| i4 | OK | Manos de Cata, un jarrito. Mudo (alucina texto). |
| c21 | **REGENERAR** | Figura oscura (espalda) en el borde DER. de 0.0 a ~2.4 s; voz desde 0.0. |
| c22 | OK* | "Herminia" **repetido** al final (2.74–3.24 y 3.24–3.72): cortar en 3.22 s. |
| c23 | **REGENERAR** | Espalda de alguien en primer plano abajo a la DER. de 0.0 a ~1.9 s; voz desde 0.0. |
| r6 | OK | Un jarrito. Mudo (alucina "Gracias por ver el video"). |
| r7 | OK | Solo, mano abierta en el piso. Mudo. |
| c24 | OK | Solo, sin nadie más en el portal. Voz 1.22–7.62, baja (−23.7). |
| c25 | OK | CTA a cámara con gestos, audio completo (0.0–7.7). |

## REGENERAR
- **c07**: espalda oscura en primer plano abajo a la izq. (0–1.0 s, voz desde 0.48).
- **r2**: series de luces encendidas (rompe la continuidad: a oscuras desde r2).
- **c09**: doble de Cata a la der. (0–2.8 s, voz desde 0.9) + frase suavizada.
- **c16**: doble de Bruno en el borde der. (casi todo el clip).
- **c21**: espalda oscura en el borde der. (0–2.4 s, voz desde 0.0).
- **c23**: espalda en primer plano abajo a la der. (0–1.9 s, voz desde 0.0).

Cambios en clips.py: `DARK` ahora pide las series "dark and unlit with no glowing bulbs anywhere"; nueva `NODOUBLE(what)` ("no other <what> anywhere in the frame, no dark figure or back of anyone at the left or right edge"). c16, c21 y c23 cambian `look(...)` por `gaze(...)`; c09 y c16 suman ONE; c07 suma ALONE + "the lower left corner shows only the empty stone floor"; r2 ya no menciona las luces (decía "looks up at the dark string lights" y Omni las dibujó prendidas): "looks up into the darkness overhead, no lit bulbs anywhere" + ONE + ALONE. NODOUBLE: c07/c21/c23 "person in dark clothes", c09 "woman in a burgundy shawl", c16 "man with black hair". Se mantienen STYLE, VOICE, NOSUB, SOLO, SAFE, SOFT, NOREF, STYLES, TRIES=6, los 17 s entre clips y el gatito de control.

Probado en seco en una copia con gen falso: con IDs, la versión anterior pasa a `clips/old/<id>_vN.mp4` (sin pisar las que ya hay), el resto no se toca, e imprime "FIN P1".

Para regenerar (cuando Flow esté libre): `python -I clips.py c07 r2 c09 c16 c21 c23 > clips_log2.txt`. Revisar después: nadie en los bordes (tiras de bordes a 4 fps), r2 sin foquitos prendidos, c09 con "como si no fuéramos nadie" (si vuelve a salir "así nomás" es el intento 2, aceptable).

## Arreglos menores para el montaje
- **Recortes de inicio**: c11 desde 1.1 s, c13b desde 0.8 s (figura oscura en el borde antes de la voz); r3 desde 1.5 s (corte interno); r5 desde 2.2 s (la gente aparece en fundido).
- **c22**: terminar en 3.22 s (quita el segundo "Herminia").
- **i1**: usar hasta el final (el apagón es a ~5.5 s). **i3**: incluir 3.6–6.0 s (se encienden a ~4.0 s).
- **Silenciar**: r1, r2, r4, r5, r6, r7, i1, i2, i3, i4 (ruido de sala; Whisper alucina "¡Suscríbete!", "Música", "Gracias por ver el video"). r3: coro suave de la procesión (−26.5), dejarlo bajo como ambiente o silenciar.
- **c17**: ~6 foquitos encendidos arriba a la der.; se puede dejar (se leen como adorno junto al farol) o zoom 1.15 hacia abajo-izq. para sacarlos.
- **Pesebre**: en LOC_ARCOS va vacío, pero en r5 y c17 se ve un Niño en el pesebre; menor, a tamaño de teléfono casi no se nota.
- **Geografía**: c19 Nacho sale al centro-izq. con la reja a la izq. (pedía DER. afuera del portón); como es plano de una sola persona no se nota en el corte.
- Volumen: c03 (−15.3), c19 (−15.8), c22 (−15.8), c25 (−15.7) fuertes; c08, c12, c18 (−22.5 a −23.1) y c24 (−23.7) bajos. El loudnorm en dos pasadas de edit.py los empareja.
- Arranques tardíos de voz (c24 1.22, c11 1.16, c15 1.16, c05/c13b 0.86, c14 0.76, c12 0.74): el montaje por frases (phr.py) los recorta.
- Whisper escribe "30" por "treinta" (c03, c09, c24): coincide con lines.json. Fuera de c09 (frase suavizada) y c22 (repetición), no hay palabras faltantes, repetidas ni segundas frases perdidas.
