# QA clips · gardenia Parte 1 (VISTA, 2026-11-06)

Método (el de intercambio): hoja de 4 fotogramas por clip (8/35/62/90 %) comparada con chars/ (ROSAURA_ALCANTARA, LETICIA_ALCANTARA, ABEL_SANDOVAL, CHONA_BECERRA, GILBERTO_ARRIAGA, LOC_PATIOALCANTARA, LOC_PUERTAGARDENIAS) y con la geografía fija de clips.py. Tiras del 38 % inferior a 1.5 fps (subtítulos) y de cuadro completo a 4 fps (bordes, entradas) en los 39 clips; tiras del 25 % izquierdo/derecho a 8 fps (0–2.5 s) en los dudosos; recortes probados en el fotograma 0 (el peor). freezedetect + cortes (scene > 0.3) + luma de los primeros fotogramas + LUFS por clip. Audio: faster-whisper large-v3 (es, CPU, int8) sobre el WAV cargado con numpy, contra lines.json, más F0 mediana por clip. Nada se corrió en Flow.

Resultado general: caras y ropa correctas en todos (Rosaura: chongo bajo con listón blanco, vestido blanco de manga corta, sin velo. Leticia: cola alta, satín azul rey, perlas. Abel: lampiño, traje gris oscuro, corbata delgada. Chona: pelo gris rizado, cárdigan vino, vestido azul marino floreado. Gilberto: pelo blanco peinado atrás, bigote blanco, abrigo camello). Nadie con sombrero, velo ni lentes; sin niños, armas ni extremidades de más; nadie señala con el dedo (manos abiertas). Ningún clip congelado ni con cortes internos (salvo el destello de r5). Geografía respetada (patio de tarde: Rosaura/Abel/Chona IZQ., Leticia/Gilberto DER.; anochecer: Rosaura IZQ., Abel DER.; noche con foco: Rosaura IZQ., Gilberto/Chona DER.; puerta del salón: Leticia IZQ. con la puerta cerrada, Gilberto/Rosaura DER. con la puerta abierta). Subtítulos quemados solo en c20. Voces: hombres 106–129 Hz (Abel c07/c17, Gilberto c13/c15/c20/c22/c23/c25/c28/c30), mujeres 174–244 Hz, cada una con su personaje. Transcripción = lines.json en los 34 diálogos (sin palabras faltantes, repetidas ni 2.ª frase perdida).

Utilería: un solo pastel blanco de un piso, sin tocar, en c09. Una sola gardenia: Rosaura c14 (en la palma) → Gilberto c15 → r2. Una sola olla de barro con las dos manos en c26. Celular negro con la pantalla de espaldas en c33 y r5 (en r5 lo mira, se ve solo el dorso). Ningún sobre, papel ni carpeta.

Problema repetido: **dobles en el borde durante el primer ~0.5–2 s** (vestido blanco a la DER. de Rosaura; figura oscura a la IZQ. de Gilberto; doble vino a la IZQ. de Chona). Todos salen antes de 2 s y se arreglan con punch-in.

| clip | estado | motivo |
|---|---|---|
| c01 | OK | Reja a la DER. Voz 1.32–8.46. |
| c02 | OK con crop | Doble de vestido blanco en el borde DER. de 0.0 a ~0.8 s; voz desde 0.0. `crop=600:1067:0:0` en 0–0.8 (limpio). |
| c03 | OK | Voz 0.64–7.40. |
| c04 | OK con recorte | Figura oscura (traje) en el borde IZQ. de 0.0 a ~1.1 s; voz desde 0.96. Empezar en ≥ 0.9 y `crop=600:1067:120:0` hasta 1.1 (limpio). |
| c05 | OK con crop | Doble blanco abajo a la DER. de 0.0 a ~1.6 s; voz desde 0.62. Empezar en ≥ 0.5 y `crop=540:960:0:0` hasta 1.6 (limpio). |
| c06 | OK | Voz 0.0–5.26. |
| c07 | OK (aviso) | Abel arranca medio cortado en el borde IZQ. y la cámara lo centra en ~1.2 s (no entra nadie). Voz 0.0–4.32. |
| c08 | OK (aviso) | Leticia arranca en el borde DER. y la cámara la centra en ~1 s. Voz 0.56–6.18. |
| c09 | OK | Un pastel, sin tocar. Voz 0.96–7.30. |
| c10 | OK | Chona en la puerta verde. Voz 0.92–6.32. |
| c11 | OK | Voz 1.28–7.06. |
| c12 | OK | Se acomoda el collar (mano abierta). Voz 0.56–5.52. |
| r1 | OK | Mudo (−43.8 LUFS): silenciar. |
| c13 | OK | Voz 0.54–5.08. |
| c14 | OK con crop | Doble blanco abajo a la DER. de 0.0 a ~1.4 s; voz desde 0.0. `crop=540:960:0:0` en 0–1.4 (limpio, gardenia dentro). |
| c15 | OK con crop | Figura oscura en el borde IZQ. de 0.0 a ~1.1 s; voz desde 0.84. `crop=600:1067:120:0` en 0–1.1 (limpio, gardenia dentro). Audio: "¿Quién le quitó su boda a Rosaura?" (Whisper oye una "a" de 60 ms en el enlace "boda, Rosaura"; menor, revisar de oído). |
| c16 | OK con crop | Doble blanco (cabeza arriba y cuerpo abajo) en el borde DER. de 0.0 a ~1.9 s; voz desde 0.0. `crop=540:960:0:0` en 0–1.9 (limpio). |
| r2 | OK | Una gardenia. Mudo (alucina "¡Gracias por ver!" a −41.8 LUFS): silenciar. |
| c17 | OK | Anochecer. Voz 0.66–5.14. |
| c18 | OK con crop | Doble blanco en el borde DER. de 0.0 a ~1.2 s; voz desde 0.84. `crop=540:960:0:0` en 0–1.2 (limpio). |
| c19 | OK | Voz 0.0–4.92. |
| c20 | **REGENERAR** | Subtítulos quemados de las dos frases (~0.9–3.9 s). Además Gilberto entra caminando desde el borde DER. (0–1.2 s) y hay una figura oscura en el borde IZQ. (0–0.6 s). "Aquí estoy yo" sale con entonación de pregunta. Fallback probado: `crop=450:800:270:0` en todo el clip (el subtítulo cae en y≈1030, fuera; punch-in fuerte) a partir de ~1.1 s, cuando ya está centrado; la voz empieza en 0.94, así que meter 0.94–1.1 de audio como J-cut sobre el plano anterior. |
| c21 | OK con crop | Doble blanco en el borde DER. de 0.0 a ~1.3 s; voz desde 1.12. `crop=540:960:0:0` en 0–1.3 (limpio). |
| c22 | OK con crop | Figura oscura en el borde IZQ. de 0.0 a ~1.4 s; voz desde 0.0. `crop=600:1067:120:0` en 0–1.4 (limpio). |
| c23 | OK con crop | Figura oscura grande en primer plano IZQ. de 0.0 a ~2.0 s; voz desde 0.0. `crop=540:960:180:0` en 0–2.0 (limpio). Foco con pantalla en vez de foco pelón (aviso). |
| c24 | OK con recorte | Borde blanco abajo a la DER. de 0.0 a ~0.6 s; voz desde 1.10: empezar en ≥ 0.7. |
| c25 | OK con crop | Figura oscura en el borde IZQ. de 0.0 a ~0.9 s; voz desde 0.62. `crop=600:1067:120:0` en 0–0.9 (limpio). Fondo con mesas y sillas (aviso). |
| c26 | OK con crop | Doble con cárdigan vino y pelo gris en el borde IZQ. de 0.0 a ~1.6 s; voz desde 0.0. `crop=540:960:180:0` en 0–1.6 (limpio). Una olla. |
| r3 | OK con recorte | Borde blanco abajo a la DER. de 0.0 a ~0.6 s: empezar en ≥ 0.7. Mudo (alucina "¡Suscríbete!"): silenciar. |
| c27 | OK | Puerta cerrada. Voz 0.0–6.48. |
| c28 | OK con crop | Figura oscura en el borde IZQ. de 0.0 a ~1.4 s; voz desde 0.0. `crop=600:1067:120:0` en 0–1.4 (limpio). |
| c29 | OK con recorte | Borde blanco abajo a la DER. de 0.0 a ~0.3 s; Leticia camina de IZQ. al centro en 0–2 s (está en cuadro desde el frame 0). Voz desde 1.12: empezar en ≥ 0.9. |
| c30 | OK con crop | Figura oscura en el borde IZQ. de 0.0 a ~1.1 s; voz desde 0.0. `crop=600:1067:120:0` en 0–1.1 (limpio). Flores blancas dentro del salón (fondo, bien). |
| c31 | OK con recorte | Figura oscura en el borde DER. de 0.0 a ~0.8 s; voz desde 1.18: empezar en ≥ 0.9. |
| c32 | OK | Puerta abierta, nadie adentro. Voz 0.76–6.76. |
| r4 | OK | Mudo (alucina "Sigue viviendo" a −38.4 LUFS): silenciar. |
| c33 | OK | Celular de espaldas. Voz 0.72–5.24. |
| r5 | OK con recorte | **Destello de la hoja de referencia** (Abel sobre fondo blanco) en los fotogramas 0–3 (0–0.17 s): empezar en ≥ 0.2. Celular de espaldas. Mudo (alucina "¡Suscríbete!" a −24.6 LUFS): silenciar. |
| c34 | OK | A cámara, puerta abierta. Voz 0.0–8.06 (completa). El listón se ve a los lados del chongo (aviso). |

## REGENERAR
- **c20**: subtítulos quemados + Gilberto entra caminando desde el borde DER. + figura oscura en el borde IZQ.

Cambios en clips.py (solo c20; se mantienen STYLE, VOICE, NOSUB, CLEAN, END, SOLO/ONE/ALONE con gaze, NODOUBLE, una pieza de cada utilería, SAFE, SOFT con \b, variant, NOREF, STYLES, TRIES=6, los 17 s entre clips y el gatito de control):
- "standing still on the RIGHT just inside the iron gate, already centered in the frame and close to the camera from the very first frame, he does not walk".
- extra `NODOUBLE("person")` + "no subtitles at any moment, not even for his short question; the lower half of the frame shows only his camel coat and the dark courtyard floor".

Probado en seco en una copia con gen falso: con el ID, la versión anterior pasa a `clips/old/c20_v1.mp4` (y _v2 en una 2.ª corrida), el resto no se toca, el prompt lleva los cambios e imprime "FIN P1".

Para regenerar (cuando Flow esté libre): `python -I clips.py c20 > clips_log2.txt`. Revisar después: sin subtítulos, Gilberto quieto y centrado desde el frame 0, bordes limpios, "Aquí estoy yo" afirmativo.

## Arreglos menores para el montaje
- **Crops de borde** (punch-in solo mientras dura el borde): c02 `600:1067:0:0` (0–0.8), c04 `600:1067:120:0` (0.9–1.1), c05 `540:960:0:0` (0.5–1.6), c14 `540:960:0:0` (0–1.4), c15 `600:1067:120:0` (0–1.1), c16 `540:960:0:0` (0–1.9), c18 `540:960:0:0` (0–1.2), c21 `540:960:0:0` (0–1.3), c22 `600:1067:120:0` (0–1.4), c23 `540:960:180:0` (0–2.0), c25 `600:1067:120:0` (0–0.9), c26 `540:960:180:0` (0–1.6), c28 `600:1067:120:0` (0–1.4), c30 `600:1067:120:0` (0–1.1). Todos probados limpios en el fotograma 0.
- **Fallback si c20 vuelve mal**: `crop=450:800:270:0` en todo el clip desde ~1.1 s, con el audio desde 0.94 en J-cut.
- **Arranques**: c04 ≥ 0.9, c05 ≥ 0.5, c24 ≥ 0.7, c29 ≥ 0.9, c31 ≥ 0.9, r3 ≥ 0.7, r5 ≥ 0.2 s (destello de la hoja de referencia).
- **r1–r5**: silenciar el audio (Whisper alucina "¡Gracias por ver!", "¡Suscríbete!", "Sigue viviendo").
- Volumen: c29 (−16.9), c11 (−17.5) fuertes; c17 (−25.1), c25 (−23.9), c22 (−23.8) bajos. El loudnorm en dos pasadas de edit.py los empareja.
- Avisos sin acción: c07/c08 la cámara centra al personaje en el primer segundo; c15 posible "a" de enlace en "boda, Rosaura"; c23 foco con pantalla; c25 mesas y sillas en el fondo; c34 listón visible a los lados.
- Whisper escribe "amparo" en minúscula, "Salón" con mayúscula, "Doña" y cambia puntos suspensivos por comas: es grafía.

## QA c20 regenerado (2026-11-06)
- Nuevo clips/c20.mp4: sin subtítulos y bordes limpios, pero Gilberto camina desde la reja hasta ~1.75 s y "¿Aquí estoy yo?" sube como pregunta (F0 118→184 Hz; large-v3 lo escribe con signos). NO PASA.
- Se usa el fallback: clips/old/c20_v1.mp4 con `crop=450:800:270:0` desde 1.20 s y J-cut de 0.13 s (audio desde 1.07; la voz real empieza en 1.15 por envolvente, no en 0.94). El "yo" del viejo también sube un poco (107→162 Hz): aviso aceptado.
