# QA clips · camionero-p2 Parte 2 (MEXI STORIES, 2026-11-06)

Método (el de pedida-mano): hoja de 4 fotogramas por clip (8/35/62/90 %) comparada con chars/ (TEOFILO_TRAILERO, LEONOR_DIRECTORA, NAYELI_MONITOREO, LALO_CHALECO, FIDEL_CARGADOR, IVAN_SOBRINO) y con la geografía fija de clips.py. Tiras del 38 % inferior a 1.5 fps (subtítulos) y de cuadro completo a 4 fps (bordes, entradas) en los 31 clips; fotogramas a 240 px cada 0.125 s en los dudosos (c06, c09, c11, c16), recortes probados en el fotograma 0; gorras de Teófilo ampliadas (c04, c11, c20, c25, c29). freezedetect + cortes (scene > 0.3) + LUFS + F0 por clip. Audio: faster-whisper large-v3 (es, CPU, int8) sobre el WAV cargado con numpy, contra lines.json; las dudas (c16, c22, c24, c27) re-decodificadas 3 veces (beam 5, temperatura 0.4, sin prompt) sobre el tramo recortado + silencedetect. Nada se corrió en Flow. Todos los clips salieron al 1.er intento (prompt completo, con referencias).

Resultado general: caras y ropa correctas en todos (Leonor: pelo castaño ondulado, blazer camel, blusa azul rey, cadena con dije redondo, arracadas plateadas. Nayeli: chongo bajo, blusa lavanda, gafete blanco en blanco con cordón gris. Teófilo: bigote canoso, UNA gorra verde lisa (sin parche ni letras; malla trasera en c11), franela a cuadros azul/negro, playera blanca. Lalo: chaleco naranja con reflejantes sin letras, playera azul marino. Fidel: barba corta, chaleco acolchado gris, sudadera guinda. Iván: sin barba, camisa azul cielo, sin corbata ni gafete, reloj plateado). Nadie señala ni lleva utilería salvo la tabla de Nayeli (una sola, c07 y c16). Ningún subtítulo ni texto en pantalla en los clips con diálogo (tiras inferiores limpias en los 31; el único texto es el timestamp dentro del monitor de i1). Ningún clip congelado; único corte interno en i1 (0.21 s). Geografía respetada (andén: tráiler blanco y anaqueles; monitores a la IZQ. con Nayeli sentada; Fidel/Leonor/Teófilo de pie a la DER. en c09–c11). Voces: hombres 103–150 Hz (Teófilo, Fidel, Lalo, Iván), mujeres 193–227 Hz, cada una con su personaje. Transcripción = lines.json en 26 de los 29 diálogos (salvo c16, c27 y el aviso de c24).

| clip | estado | motivo |
|---|---|---|
| c01 | OK | Frase larga completa. Voz 0.48–9.00. |
| c02 | OK | Cabeza baja y luego levanta la vista. Voz 1.04–6.98. |
| c03 | OK | Voz 1.34–7.26. |
| c04 | OK | Gorra lisa, una sola. Voz 0.00–7.32 (las dos frases casi seguidas). −18.3 LUFS. |
| c05 | OK | Voz 0.00–6.38. |
| c06 | OK con recorte | Figura oscura en el borde IZQ. abajo de 0.0 a ~0.3 s; voz desde 1.48: empezar en ≥ 0.4 (o `crop=540:960:180:0` en 0–0.4, probado limpio). −13.5 LUFS (fuerte). |
| c07 | OK | Una sola tabla (al principio con clip, luego baja las hojas). Voz 0.88–7.40. |
| c08 | OK | Sentada frente a los monitores. Voz 0.00–6.96. |
| i1 | **REGENERAR** | **Texto legible en el monitor**: timestamp "208-09-16 08:1:59" arriba a la IZQ. de la pantalla (legible desde ~2 s con el push-in) que además dice las 8 y no "las tres de la mañana"; placa trasera de la camioneta visible (~5 s); imagen de día, no de noche. Corte interno a 0.21 s (cuarto vacío con silla → monitores). Murmullo "¿Qué pasa?" a −40.9 LUFS: silenciar. |
| c09 | OK con crop | Forma oscura en el borde IZQ. abajo de 0.0 a ~0.3 s; voz desde ~0.6. `crop=540:960:180:0` en 0–0.4 (limpio). −25.5 LUFS (bajo). |
| c10 | OK | Ojos brillantes, manos abiertas. Voz 0.78–6.66 ("¿Y así me lo agradecía?" sale interrogativo, vale como reproche). |
| c11 | OK con crop | Figura oscura en el borde IZQ. abajo de 0.0 a ~0.5 s; voz desde ~0.6. `crop=540:960:180:0` en 0–0.6 (limpio). Gorra lisa con malla. |
| r1 | OK | Iván ya en cuadro, se acomoda el puño. Mudo (alucina "Gracias por ver el video" a −42.5 LUFS): silenciar. |
| c12 | OK | Voz 0.60–4.90. |
| c13 | OK | Voz 2.06–7.34 (arranca tarde: se puede entrar en ~1.8). |
| c14 | OK | Voz 0.00–6.12. |
| c15 | OK (aviso) | Voz 0.86–6.66. "Él decía a qué hora…" sale con entonación de pregunta. |
| c16 | **REGENERAR** | **Voz trabada**: "desde su computadora **de locadora** de la oficina" (5.76–6.24 s, igual en 3 decodificaciones). Además figura borrosa lavanda/blanca en el borde DER. de 0.0 a ~1.0 s (voz desde 0.78) → si se usa, `crop=540:960:0:0` en 0–1.0 (probado limpio). |
| c17 | OK | Voz 0.90–4.60. |
| c18 | OK | Voz 0.00–3.80. |
| c19 | OK | Motivo largo completo. Voz 0.86–7.52. |
| c20 | OK (aviso) | "cargar con la culpa **a** un chofer" (a de más, gramatical). Voz 0.56–6.48. |
| c21 | OK | Voz 0.00–5.56. |
| c22 | OK | Manos juntas vacías (no hay celular). "Tía… somos familia… por favor" con pausas largas (voz 0.74–4.82). −24.3 LUFS (bajo). |
| c23 | OK | Mano en el corazón. Voz 0.58–5.94. |
| c24 | OK (aviso) | Whisper oye "¿Quiere**s** ser…?" (estable; puede ser la s de "ser" pegada). Voz 0.00–6.20. |
| c25 | OK | Voz 0.00–6.18. |
| c26 | OK | Voz 0.88–4.20. |
| c27 | **REGENERAR** | **Repite palabras**: "Tía, yo no lo planeé solo. **Planeé solo.** Pregúntale…" (2.64–3.40 s, igual en 3 decodificaciones). −24.0 LUFS (bajo). |
| c28 | OK | Ojos abiertos, sorpresa. Voz 1.10–3.98. |
| c29 | OK | A cámara desde el inicio, se toca la gorra (~2.5 s), palma abierta (~7 s), nunca señala. Voz 0.00–8.48. |

## REGENERAR
- **i1**: timestamp legible "08:1:59" en el monitor (contradice "tres de la mañana") + placa visible + corte a 0.21 s.
- **c16**: voz trabada "computadora de locadora de la oficina".
- **c27**: repite "planeé solo".

Cambios sugeridos en clips.py (no aplicados; solo i1, c16, c27):
- i1: quitar "no timestamps" como única defensa y describir "the screen shows only the grey image, with no date, no time, no numbers and no letters anywhere on the screen or its frame; night-time footage, dark sky; the truck seen from the side, its license plate area blank"; plano fijo sin push-in fuerte (el zoom es lo que vuelve legible el texto).
- c16: frase más corta en voz: tono "calm, clear, slow, every word said once" y la 2.ª frase "Desde la computadora de su oficina." o cortar en dos clips cortos.
- c27: tono "low, serious, slow, says 'yo no lo planeé solo' only once, then goes straight to the next sentence".

Fallbacks si vuelven mal: i1 usar solo 0.25–1.5 s (plano abierto, el timestamp es ilegible a ese tamaño); c16 quitar 5.74–6.24 ("de loca") tapando con un plano de reacción de Iván (queda "computadora de la oficina"); c27 quitar 2.55–4.35 ("Planeé solo." + pausa) tapando con un plano de reacción de Leonor.

## Regenerados (2026-11-06, regen_log.txt, 1.er intento) — QA
Mismo método: tiras de cuadro completo cada 0.5 s, fotograma final a resolución completa con recorte ampliado de la placa, scene > 0.3, large-v3 (beam 5) + 3 re-decodificaciones del tramo (beam 5, temperatura 0.4, sin prompt) + envolvente 20 ms.
- **i1 OK**: de noche (cielo negro, faroles), monitor con la camioneta gris de lado y Fidel cargando cajas; **ningún texto, fecha, hora ni número** en la pantalla ni en el marco; sin corte interno (scene > 0.3: ninguno); push-in hasta el final. La placa trasera aparece como rectángulo blanco desde ~3.5 s y **no se lee** ni ampliada al doble; en el montaje se usa 1.0–2.5 s (monitor pequeño, placa sin detalle). Audio: silencio (Whisper "SILENCIO"), ganancia 0 igual.
- **c16 OK**: large-v3 = "Y la cámara de atrás se apagaba con su usuario, Iván, desde su computadora de la oficina." igual en las 3 decodificaciones (sin "de locadora"). Voz 1.27–6.95. Sin figura en los bordes (ya no hace falta crop); una sola tabla, que baja a ~2 s.
- **c27 OK con corte**: "planeé solo" sale **una sola vez** (3 decodificaciones). Nueva traba en la 2.ª frase: "la clave **de las de las** cámaras" (5.70–6.21, estable en 3 decodificaciones y al partir el tramo). Arreglo de montaje (sin Flow): quitar 5.95–6.23 (el 2.º "de las"; cortes en el valle de −36 dB y en el silencio de −50 dB antes de "cámaras"); el empalme transcribe "…quién me dio la clave de las cámaras." en las 3 decodificaciones. El salto se tapa con 0.5 s de reacción muda de Leonor (c28 0.2–0.7, antes de su voz en 1.10). Sin figuras en los bordes.

## Montaje v1 (renders/v1.mp4) — verificado
136.8 s, 62 tramos (EDL por frases phr.json + lv3.json), 720x1280 SAR 1:1 24 fps. −14.1 LUFS, −1.7 dBTP, LRA 1.9. Sin congelados. Marca MEXI STORIES arriba a la der. en todo el video. Transcripción large-v3 completa = lines.json (las 2 dudas del pase completo, "Don Clemente" y "Te acepto", re-decodificadas sobre el tramo: "Clemente…" y "Claro que acepto"). Avisos que quedan: c20 "a un chofer", c24 "¿Quieres ser…?". c09/c11 entran después del borde (sin crop). Cama de suspenso (tension.mp3: earshot "dark and tense music", cinematic orchestral) audible a ~−22.5 LUFS en i1.

## Arreglos menores para el montaje
- **Crops de borde** (punch-in solo mientras dura el borde): c09 `540:960:180:0` (0–0.4), c11 `540:960:180:0` (0–0.6), c16 `540:960:0:0` (0–1.0) si se rescata. Probados limpios en el fotograma 0.
- **Arranques**: c06 ≥ 0.4 (antes de la voz, 1.48); c13 se puede entrar en ~1.8.
- **r1 e i1**: silenciar el audio (Whisper alucina "Gracias por ver el video", "¿Qué pasa?").
- Volumen: c06 (−13.5), c16 (−16.0), c26/c29 (−16.1) fuertes; c09 (−25.5), c22 (−24.3), c27 (−24.0) bajos. El loudnorm en dos pasadas de edit.py los empareja.
- Avisos sin acción: c15 entonación de pregunta; c20 "a un chofer"; c24 posible "¿Quieres?"; c10 "¿Y así me lo agradecía?" interrogativo.
- Whisper escribe "10"/"3" en cifras y "Don" con mayúscula: es grafía.
