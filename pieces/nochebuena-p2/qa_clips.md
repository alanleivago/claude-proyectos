# QA clips · nochebuena Parte 2 (MAJESTIC, 2026-11-07)

Método (el de pedida-mano): hoja de 4 fotogramas por clip (8/35/62/90 %) comparada con chars/ (HERMINIA, GERARDO, REGINA, IGNACIO, LOC_PATIOPINATA, LOC_COCINAPONCHE) y con la geografía fija de clips.py. Tiras del 38 % inferior a 1.5 fps (subtítulos) y de cuadro completo a 4 fps (bordes, entradas) en los 31 clips; fotogramas a 270 px de los dudosos; recortes probados en el fotograma 0 (el peor) y a 0.4–1.0 s. freezedetect + cortes (scene > 0.3) + LUFS + F0 por clip. Audio: faster-whisper large-v3 (es, CPU, int8) sobre el WAV cargado con numpy (renders/lv3.json), contra lines.json; c07 y c08 con dos decodificaciones más del tramo (beam 5 + VAD, beam 1 temp 0.2) y envolvente de 10 ms en c07. Nada se corrió en Flow.

Resultado general: caras y ropa correctas en todos y continuidad con la Parte 1 (Herminia: trenza baja canosa, aretes de plata, vestido azul marino de manga larga, rebozo vino. Gerardo: pelo negro peinado, sin barba, saco gris carbón, camisa blanca abierta, reloj plateado, sin corbata. Regina: pelo largo ondulado castaño claro, vestido satinado esmeralda de manga larga, arracadas doradas, labios rojos. Ignacio: canas cortas, lentes redondos de alambre, saco de pana café, cuello de tortuga crema). Nadie con sombrero ni lentes de más; sin nacimiento ni figuras religiosas; sin niños, armas ni extremidades de más; nadie señala con el dedo (manos abiertas; c09 mano abierta levantada, c08 se quita los lentes, c22/c25 mano en el pecho). Una sola hoja de papel (c11, c12, c14, c21), sin pluma ni carpeta; una sola piñata de estrella por plano (c01–c05, r1, c27); una sola olla de ponche en el fogón (más ollas colgadas de adorno, como en la hoja de la locación) salvo i1 desde 2.75 s. Ningún subtítulo ni letra en pantalla (tiras inferiores limpias en los 31; el papel de c11/c21 no tiene texto legible). Ningún clip congelado ni con cortes internos. Geografía bien (patio: Gerardo/Regina a la IZQ. mirando a la der., Herminia a la DER. junto a la puerta de madera; cocina: Ignacio en la puerta a la IZQ. en c06–c10, Gerardo/Regina en la puerta a la IZQ. e Ignacio/Herminia junto al fogón a la DER. desde c11). Voces: hombres 106–139 Hz (Gerardo, Ignacio), mujeres 182–225 Hz (Herminia, Regina), cada una con su personaje y su hoja. Transcripción = lines.json en los 27 diálogos (sin palabras repetidas, tartamudeos ni 2.as frases perdidas) salvo c07.

| clip | estado | motivo |
|---|---|---|
| c01 | OK con recorte | **Doble de Herminia** (rebozo vino) en el borde IZQ. abajo y forma oscura abajo a la DER. de 0.0 a ~0.75 s; voz desde 1.04: empezar en ≥ 0.9 (o `crop=576:1024:96:0` en 0–0.8, probado limpio a 0 y 0.5). Voz 1.04–4.98. −21.4 LUFS. |
| c02 | OK | Una piñata. Voz 1.02–6.10 (las dos frases casi seguidas). |
| c03 | OK con recorte | Franja oscura (abrigo/sombra de alguien) junto a su cadera der. de ~0.25 a ~0.75 s, en el centro (no se recorta); voz desde 0.94: empezar en ≥ 0.85. Voz 0.94–5.81. |
| c04 | OK | Se acomoda el rebozo (2.25–3.5 s). Voz 0.53–5.72. |
| r1 | OK con recorte | Figura roja en el borde DER. abajo de 0.0 a ~0.5 s: empezar en ≥ 0.6. Árboles de Navidad al fondo (no religiosos, aviso). Mudo (alucina "Gracias por ver el video": silenciar). |
| c05 | OK (aviso) | La cámara la recentra de 0.0 a ~1.0 s (está entera en cuadro, no entra caminando); voz desde 0.29. Voz 0.29–6.39. |
| i1 | OK con recorte | **Segunda olla** con cucharón detrás de la de ponche desde ~2.75 s (desenfocada pero se lee como olla): usar solo 0.0–2.5 s. Mudo (−34.1 LUFS, alucina "SUSCRÍBETE": silenciar). |
| c06 | OK con recorte | Ignacio cortado en el borde IZQ. (paneo) de 0.0 a ~1.0 s y forma oscura en el borde DER. de 0.5 a 1.0 s; voz desde 1.09: empezar en ≥ 1.0. −15.9 LUFS (fuerte). |
| c07 | **v2 + arreglo de audio (c07fx)** | Dice "Quieren que les firme la hacienda **a** don Ignacio" (una "a" de más 2.24–2.35 s, sílaba propia entre dos caídas de energía; estable en tres decodificaciones): cambia el sentido (firmársela A Ignacio). Imagen bien. Voz 0.33–6.25. |
| c08 | OK | Se quita los lentes. Borde oscuro a la DER. de 0.0 a ~1.75 s = marco de la puerta (aviso). Voz 0.30–5.94 ("los saco": la 1.ª pasada oyó "lo", las otras dos "los"). |
| c09 | OK | Mano abierta levantada (no señala). Voz 0.10–5.73. |
| c10 | OK | Voz 0.25–4.65. |
| c11 | OK (aviso) | Paneo de 0.0 a ~0.5 s (entero en cuadro, junto a la puerta); una hoja. Voz 0.30–6.34. |
| c12 | OK | Una hoja. Una frase: voz 1.93–4.25 en 6 s. −16.5 LUFS. |
| c13 | OK | Voz 0.35–4.22. |
| c14 | OK | Lee y levanta la vista; una hoja. Voz 1.30–7.34. |
| r2 | OK | Sonrisa que se congela y voltea a su lado. Mudo (alucina "SUSCRÍBETE": silenciar). |
| c15 | OK | Voz 0.54–5.00. −24.3 LUFS (bajo). |
| c16 | OK | Voz 0.62–5.62. |
| c17 | OK (aviso) | Rebozo abierto al frente como chaqueta (en la hoja va cruzado). Voz 1.59–6.87 (Whisper escribe "mi hijo" por "mijo": grafía). −23.9 LUFS (bajo). |
| c18 | OK | Voz 0.74–6.79. |
| c19 | OK | Voz 0.88–4.14. |
| c20 | OK | Voz 1.17–7.17. |
| r3 | OK con recorte | **Doble de Regina** (vestido verde) en el borde DER. de 0.0 a ~0.6 s: empezar en ≥ 0.75. Mudo (alucina "¡Suscríbete!": silenciar). |
| c21 | OK (aviso) | Una sola hoja, pero a ~2.6 s cambia de beige lisa a blanca escrita a máquina (morph); la rompe en dos de 3.75 a 4.25 s, después de la frase. Voz 0.44–2.48. −23.0 LUFS (bajo). |
| c22 | OK | Mano en el pecho, ojos húmedos sin llanto. Voz 0.21–4.62. |
| c23 | OK con recorte | **Doble de Herminia** (rebozo vino) en el borde IZQ. abajo y otra forma vino abajo a la DER. de 0.0 a ~0.75 s; voz desde 0.83: empezar en ≥ 0.8 (o `crop=576:1024:72:0` en 0–0.8, probado limpio a 0 y 0.5). |
| c24 | OK con crop | Figura con ropa floreada abajo a la DER. de 0.0 a ~1.25 s; voz desde 0.22. `crop=540:960:30:0` en 0–1.4 (probado limpio a 0 y 1.0). Voz 0.22–5.21. |
| c25 | OK con crop | Figura oscura en el borde IZQ. abajo de 0.0 a ~0.75 s; voz desde 0.10. `crop=576:1024:72:0` en 0–0.8 (probado limpio a 0 y 0.5). −15.5 LUFS (fuerte). |
| c26 | OK | Voz 0.14–4.89. −15.0 LUFS (fuerte). |
| c27 | OK | CTA a cámara con voz y labios desde 0.65, manos abiertas, asiente y sonríe; una piñata; patio vacío. Voz 0.65–7.53. |

## REGENERAR
- **c07**: "firme la hacienda **a** don Ignacio" (sílaba de más que cambia el sentido).

Cambio en clips.py (solo c07; se mantienen STYLE, VOICE, NOSUB, CLEAN, END, ONE/ALONE con gaze, NODOUBLE, NOPROP, SAFE, SOFT con \b, variant, NOREF, STYLES, TRIES=6, reload_flow, los 17 s y el gatito de control): tono "sad, calm, quiet, she says the first sentence exactly as written, with a clear comma pause right after the word hacienda and then only the name don Ignacio, adding no extra word or syllable between them, every word said once". lines.json no cambia. Probado en seco: el módulo carga, 31 clips, las variantes 0–5 de c07 llevan el cambio.

Para regenerar (cuando Flow esté libre): `python -I clips.py c07 > clips_log2.txt` (la versión vieja pasa a clips/old/c07_v1.mp4). Revisar después con large-v3: sin "a" entre "hacienda" y "don"; Herminia junto al fogón a la DER.; nadie en los bordes.

Fallback si vuelve mal: usar c07 v1 quitando la "a" del audio entre las dos caídas de energía (2.235–2.345 s, fundido de 10 ms en cada lado; no es silencio pleno, son las oclusivas /d/) y tapar la imagen de ese tramo con r2 o i1 (0–2.5) para que no se vea el salto de labios. Si se nota el corte, cambiar la línea a "Don Ignacio, quieren que les firme la hacienda." en lines.json y regenerar otra vez.

## Arreglos menores para el montaje
- **Crops de borde** (punch-in solo mientras dura el borde): c24 `540:960:30:0` (0–1.4), c25 `576:1024:72:0` (0–0.8). Opcionales en lugar del arranque tardío: c01 `576:1024:96:0` (0–0.8), c23 `576:1024:72:0` (0–0.8). Probados limpios.
- **Arranques**: c01 ≥ 0.9, c03 ≥ 0.85, c06 ≥ 1.0, c23 ≥ 0.8 (todos antes de la voz); r1 ≥ 0.6, r3 ≥ 0.75.
- **i1**: usar solo 0.0–2.5 s (después aparece una segunda olla).
- **i1, r1, r2, r3**: silenciar el audio (Whisper alucina "SUSCRÍBETE" / "Gracias por ver el video").
- Volumen: c26 (−15.0), c25 (−15.5), c06 (−15.9), c12 (−16.5) fuertes; c15 (−24.3), c17 (−23.9), c21 (−23.0) bajos. El loudnorm de edit.py los empareja.
- Avisos sin acción: c05/c11 la cámara recentra al inicio (enteros en cuadro); c08 marco de puerta en el borde DER.; c17 rebozo abierto; c21 la hoja cambia de aspecto a ~2.6 s (sigue siendo una); r1 árboles de Navidad al fondo.
- Whisper escribe "mi hijo" por "mijo" (c17) y cambia puntos suspensivos por comas: es grafía.
- Nota: renders/lv3.json de masa-honrada se reescribió por error con una primera corrida del script sin cambiar la ruta (mismos clips y mismo modelo, mismo resultado).

## c07 v2 (regenerado 11:49, revisado 2026-11-07)
- large-v3 (lv3.py con la ruta de nochebuena-p2 → renders/lv3_part.json) sigue oyendo "firme la hacienda **a** don Ignacio" (3 decodificaciones; prob. de la "a" 0.65–0.94). Puntuación forzada (align de large-v3): la versión con "a" gana igual en v1 (−1.03) y v2 (−1.0), así que la regeneración no lo arregló. medium la oye sin "a" en v2 y con "a" en v1.
- **El fallback escrito arriba estaba mal**: quitar 2.235–2.345 de v1 deja "firme la *sien* don Ignacio" (ese tramo es el "-da" de hacienda, no la "a"). No usarlo.
- Barrido de cortes en v2 (ventanas de 60–120 ms entre 2.40 y 2.80 s, large-v3): quitar **2.64–2.73** da "firme la hacienda, don Ignacio." (hacienda 0.99, don 0.69); quitar antes de 2.61 rompe "hacienda" ("sien", "sierra", "silla").
- Arreglo aplicado → **clips/c07fx.mp4**: c07 v2 sin 2.65–2.73 de audio (fundido de 10 ms) y sin los fotogramas 64–65, con i1 1.6–2.5 s (la olla de ponche, antes de la 2.ª olla) encima de 2.35–3.25 s para tapar el salto de labios. Verificado con lv3.py: "Quieren que les firme la hacienda, don Ignacio. | Los oí debajo de la piñata." (voz 0.59–3.55 | 3.90–6.73).
- Imagen v2: Herminia junto al fogón a la DER., sin dobles en los bordes, sin subtítulos; **aviso**: detrás de la olla de ponche se ve una segunda olla/jarro con tapa desenfocada (como en i1 después de 2.75 s); v1 no la tenía. Se acepta (fondo desenfocado); si molesta, el único arreglo es regenerar.
- clips/old/c07_v1.mp4 queda como respaldo; no se usa.
