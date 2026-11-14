# QA clips · pedida-mano Parte 1 (MAJESTIC, 2026-11-06)

Método (el de gardenia): hoja de 4 fotogramas por clip (8/35/62/90 %) comparada con chars/ (ISABELA_VALDIVIA, BEATRIZ_VALDIVIA, LORENZO_CARRASCO, ESTEBAN_CARRASCO, LOC_PORTONPEDIDA, LOC_COMEDORPEDIDA) y con la geografía fija de clips.py. Tiras del 38 % inferior a 1.5 fps (subtítulos) y de cuadro completo a 4 fps (bordes, entradas) en los 39 clips; fotogramas a 240 px cada 0.25 s en los dudosos; recortes probados en el fotograma 0 (el peor) y a 0.5 s. freezedetect + cortes (scene > 0.3) + LUFS por clip. Audio: faster-whisper large-v3 (es, CPU, int8) sobre el WAV cargado con numpy, contra lines.json, más F0 por clip (y earshot en c11). Nada se corrió en Flow.

Resultado general: caras correctas en todos (Isabela: pelo castaño ondulado suelto, vestido rojo de tirantes, arracadas doradas. Beatriz: bob rubio cenizo, vestido y chaqueta verde esmeralda, collar dorado. Lorenzo: pelo gris corto, bigote gris, guayabera blanca, pantalón café. Esteban: barba negra corta, saco azul marino, camisa blanca abierta). Nadie con sombrero ni lentes; sin meseros, herramientas, niños, armas ni extremidades de más. Ningún subtítulo ni texto en pantalla (tiras inferiores limpias en los 39). Ningún clip congelado ni con cortes internos. Una sola camioneta verde (c02, c04, c06, c11, c12, r1, c34, c35). Geografía respetada (estacionamiento: Lorenzo IZQ. junto a la camioneta, Isabela/Beatriz DER. en el portón; comedor: Isabela/Beatriz sentadas IZQ., Esteban/Lorenzo de pie DER.; anochecer: farol encendido). Voces: hombres 104–152 Hz (Lorenzo y Esteban; c11 167 Hz pero earshot = "male speech"), mujeres 162–232 Hz, cada una con su personaje. Transcripción = lines.json en los 35 diálogos salvo c26.

| clip | estado | motivo |
|---|---|---|
| c01 | OK | Voz 1.08–8.92. −16.4 LUFS (fuerte). |
| c02 | OK | Agachado junto a la camioneta. Voz 0.00–5.34. |
| c03 | OK (aviso) | Voz 0.00–7.18. "¿Cinco minutos?" sale casi afirmativo. |
| c04 | OK | Voz 0.00–4.74. |
| c05 | OK con recorte | Manga blanca en el borde IZQ. de 0.0 a ~0.3 s; voz desde 0.92: empezar en ≥ 0.5. |
| c06 | OK (aviso) | Guayabera de manga larga (la hoja es manga corta). Voz 1.16–6.00. |
| c07 | OK | Voz 0.00–6.02. |
| c08 | OK | Poste del portón en el borde IZQ. (escenografía). Voz 1.08–6.34. |
| c09 | OK con recorte | Lorenzo (nuca y guayabera) en el borde IZQ. de 0.0 a ~0.9 s; voz desde 1.10: empezar en ≥ 0.95 (o `crop=540:960:180:0` en 0–0.9, probado limpio). |
| c10 | OK | Se acomoda la chaqueta (manos abiertas). Voz 1.38–6.60. |
| r1 | OK | Mudo (−51.8 LUFS): silenciar. |
| c11 | OK con hflip | **Celular en la mano IZQUIERDA** todo el clip (pantalla hacia su oreja, no se ve). Voz 0.00–6.30. Arreglo: `hflip` (no hay texto en cuadro). |
| c12 | OK con hflip | **Celular en la mano IZQUIERDA** (0–0.6 s lo mira con el dorso a cámara, pantalla no legible; luego al oído). Guayabera de manga larga (aviso). Voz 1.26–5.98. Arreglo: `hflip`, igual que c11. |
| c13 | OK con crop | Figura café en el borde IZQ. de 0.0 a ~0.75 s; voz desde 0.66. `crop=540:960:180:0` en 0–0.8 (limpio). |
| c14 | OK | Voz 0.64–4.72. |
| c15 | OK | Voz 0.50–5.28. |
| c16 | OK | Una frase. Voz 0.92–2.66. |
| c17 | OK | Voz 0.00–6.66. |
| c18 | OK | Voz 0.00–6.00. |
| r2 | OK | Mudo (alucina "¡Gracias por ver el video!" a −47.1 LUFS): silenciar. |
| c19 | OK | Lorenzo en la puerta de arco. Voz 0.00–5.12. |
| c20 | OK con crop | Pelo y hombro de una mujer en el borde IZQ. de 0.0 a ~0.6 s; voz desde 0.0. `crop=540:960:180:0` en 0–0.7 (limpio). Fondo con ventanas en vez de la puerta (aviso). |
| c21 | OK con crop | Forma beige redonda (nuca/respaldo) en primer plano abajo a la DER. de 0.0 a ~2.0 s; voz desde 0.0. `crop=540:960:0:0` en 0–2.0 (limpio a 0 y 1.5 s). |
| c22 | OK | Voz 0.84–6.54. |
| c23 | OK | Mano abierta hacia la silla. Voz 1.84–7.28. |
| c24 | OK | Voz 0.74–6.40. |
| c25 | OK | Voz 0.88–7.14. |
| c26 | **REGENERAR** | Llora y la voz se traba: "Tu papá me está humillando **y llando** delante de mi familia" (sílaba repetida 4.68–5.06 s, estable con dos decodificaciones). |
| c27 | OK | Voz 0.60–6.42. |
| c28 | OK con recorte | Cara y piel en el borde IZQ. de 0.0 a ~0.6 s; voz desde 0.98: empezar en ≥ 0.75 (o `crop=600:1067:120:0` en 0–0.7, probado limpio). |
| c29 | OK | Voz 0.98–6.24. |
| c30 | OK | Voz 1.26–6.86. |
| r3 | OK | Mudo (alucina "SIGUE VIVIENDO" a −43.5 LUFS): silenciar. |
| c31 | **REGENERAR** | **Ropa equivocada**: Isabela con vestido blanco floreado en vez del rojo. Audio bien (0.00–3.98). |
| c32 | OK | Voz 0.00–6.86. |
| c33 | OK con recorte | Figura oscura en el borde IZQ. de 0.0 a ~0.6 s; voz desde 0.78: empezar en ≥ 0.7 (o `crop=600:1067:120:0` en 0–0.7, probado limpio). −25.4 LUFS (bajo). |
| c34 | OK con recorte | Lorenzo entra caminando desde el borde IZQ. (0–0.75 s); voz desde 0.78: empezar en 0.75 (ya está entero en cuadro y la cámara lo centra). |
| r4 | OK | Mudo (alucina "Gracias por ver el video" a −46.1 LUFS): silenciar. |
| c35 | **REGENERAR** | **Señala con el índice** hacia cámara de ~6.5 a 7.25 s (en "Síganme…"); no se puede recortar (la mano está a la altura del pecho/cara). Audio completo 0.72–9.20. |

## REGENERAR
- **c26**: voz trabada por el llanto ("humillando y llando").
- **c31**: vestido blanco floreado en vez del rojo.
- **c35**: levanta el índice hacia cámara (~6.5–7.25 s).

Cambios en clips.py (solo c26, c31, c35; se mantienen STYLE, VOICE, NOSUB, CLEAN, END, ONE/ALONE con gaze, NODOUBLE, PHONE, SAFE, SOFT con \b, variant, NOREF, STYLES, TRIES=6, las pausas y el gatito de control):
- c26: "her eyes shine but she is not sobbing, her voice stays steady"; tono "upset, pleading, steady and clear, no sobbing, no stutter, every word said once".
- c31: "wearing the same plain fitted RED cocktail dress with thin straps as in her reference sheet (not white, no flowers, no print), gold hoop earrings visible" + `NODOUBLE("woman in a red dress")`.
- c35: "his hands stay open and relaxed the whole time, he never points and never raises an index finger, for the last sentence he only shows one open palm and nods".

Probado en seco en una copia con gen falso: con los IDs, la versión anterior pasa a `clips/old/<id>_v1.mp4` (y _v2 en una 2.ª corrida), el resto no se toca, los prompts llevan los cambios e imprime "FIN P1".

Para regenerar (cuando Flow esté libre): `python -I clips.py c26 c31 c35 > clips_log_d.txt`. Revisar después: c26 sin tartamudeo ni sollozo; c31 vestido rojo y arracadas; c35 sin índice levantado.

Fallbacks si vuelven mal: c26 quitar el audio 4.68–5.06 ("y llando") tapando la imagen con un plano de reacción de Esteban; c31 no tiene (la ropa no se arregla en montaje); c35 usar el viejo tal cual (el dedo apunta hacia arriba en "Síganme", ~0.75 s).

## Arreglos menores para el montaje
- **Espejo**: c11 y c12 con `hflip` (celular a la mano DERECHA; sin texto en cuadro, la guayabera es simétrica).
- **Crops de borde** (punch-in solo mientras dura el borde): c13 `540:960:180:0` (0–0.8), c20 `540:960:180:0` (0–0.7), c21 `540:960:0:0` (0–2.0). Probados limpios en el fotograma 0.
- **Arranques**: c05 ≥ 0.5, c09 ≥ 0.95, c28 ≥ 0.75, c33 ≥ 0.7, c34 = 0.75 s (todos antes de la voz).
- **r1–r4**: silenciar el audio (Whisper alucina "¡Gracias por ver el video!", "SIGUE VIVIENDO").
- Volumen: c01 (−16.4), c04 (−17.4) fuertes; c33 (−25.4), c31 (−23.7), c06/c25 (−23.3) bajos. El loudnorm en dos pasadas de edit.py los empareja.
- Avisos sin acción: c06/c12 guayabera de manga larga; c03 "¿Cinco minutos?" casi afirmativo; c20 fondo con ventanas; c11 voz de Lorenzo algo aguda (167 Hz, masculina).
- Whisper cambia puntos suspensivos por comas y escribe "Don" con mayúscula: es grafía.

## Regenerados (2026-11-06, clips_log_d.txt) — QA OK, sin fallbacks
- **c26** OK: large-v3 "Tu papá me está humillando delante de mi familia" sin traba (ojos húmedos, voz firme). Vestido rojo, misma geografía.
- **c31** OK: vestido ROJO de tirantes y arracadas; audio "Don Lorenzo, perdóneme. Yo no soy así."
- **c35** OK: manos abiertas, nunca señala; a ~2.7–2.9 s se toca el bigote con la mano (dedo doblado, no apunta) — aviso aceptado.
- Montaje: renders/v1.mp4 (170.2 s, 80 tramos, -14.2 LUFS, -1.8 dBTP); transcripción en renders/v1_transcript.txt.
