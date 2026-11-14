# QA clips · foto-trucada Parte 1 (MEXI, 2026-11-07)

Método (el de pedida-mano): hoja de 4 fotogramas por clip (8/35/62/90 %) comparada con chars/ (NORMA_BECERRIL, ERNESTO_BECERRIL, ROCIO_MONTIEL, HUGO_MONTIEL, KARLA_BECERRIL, CLOTILDE_RAMOS, LOC_CALLECOLONIA, LOC_DEPAKARLA, LOC_COSTURAROCIO) y con la geografía fija de clips.py. Tiras del 38 % inferior a 1.5 fps (subtítulos) y de cuadro completo a 4 fps (bordes, entradas) en los 32 clips decodificables; fotogramas a 200 px cada 0.25 s en los dudosos; recortes probados en el fotograma 0 (el peor) y a 0.25–1.0 s. freezedetect + cortes (scene > 0.3) + LUFS por clip. Audio: faster-whisper large-v3 (es, CPU, int8) sobre el WAV con numpy (lv3.py apuntado a foto-trucada, salida en renders/lv3_part.json), contra lines.json, más F0 por clip. Nada se corrió en Flow.

Resultado general: caras y ropa correctas en todos (Norma: permanente rojizo corto, arracadas doradas, blusa fucsia de lunares. Ernesto: pelo gris, bigote gris, franela café a cuadros arremangada. Rocío: pelo castaño ondulado suelto, blusa mostaza, cinta métrica amarilla al cuello en todos sus planos, jeans claros. Hugo: barba negra corta, polo azul marino sin logo, pantalón gris. Karla: chongo alto, aretes pequeños, chamarra de mezclilla negra, playera blanca. Clotilde: pelo gris corto, aretes de perla, cárdigan rosa, blusa blanca, vestido azul). Nadie con sombrero, gorra ni lentes; nadie señala; sin armas, niños ni extremidades de más. Ningún subtítulo ni texto en pantalla (tiras inferiores limpias en los 32). Ningún clip congelado ni con cortes internos. Celular solo en c08, c10, c19, r3, c25, siempre uno, pantalla nunca visible. Una sola maleta café (c02, c04, c06). Calle: casa verde + casa durazno en todos; de noche, cajas de cartón junto a la cochera y farol encendido. Voces: hombres 115–145 Hz (Ernesto, Hugo), mujeres 183–231 Hz, cada una con su personaje. Transcripción = lines.json en los 28 diálogos legibles (sin palabras repetidas, tartamudeos ni frases inventadas; ninguna 2.ª frase perdida).

| clip | estado | motivo |
|---|---|---|
| c01 | OK con crop | Cabeza y hombro de un hombre (pelo negro, camisa verde) en el borde IZQ. de 0.0 a ~1.0 s; voz desde 0.34. `crop=540:960:180:0` en 0–1.1 (limpio a 0 s; `600:1067:120:0` deja una astilla). Placa ilegible en la pared (aviso). |
| c02 | OK con crop | **Doble de Norma** en el borde DER. (rizo rojizo + manga fucsia de lunares) de 0.0 a ~0.75 s; voz desde 0.40. `crop=540:960:0:0` en 0–0.8 (limpio a 0 y 0.5 s). |
| c03 | OK | Voz 0.51–5.38. |
| c04 | OK con crop | Paneo de entrada: Norma medio fuera por la IZQ. 0–0.5 s y una camisa a cuadros azul/blanca en el borde inferior DER. de 0.0 a ~1.25 s; voz desde 0.66. Empezar en 0.6 con `crop=540:960:0:0` hasta 1.5 (probado a 0.6 y 1.0; a 0.6–0.85 la cara de Norma roza el borde IZQ., aviso). −16.1 LUFS (fuerte). |
| c05 | OK | Voz 0.30–5.66. |
| c06 | OK | Voz 1.04–6.38. −25.4 LUFS (bajo). |
| c07 | OK | Voz 0.82–5.41. |
| c08 | OK (aviso) | Celular en la mano IZQUIERDA (la hoja pide derecha), pantalla de canto, no se ve. Sin hflip: rompería la mirada a la IZQ. Voz 0.75–7.48. "¿tú qué sabes…?" sale como pregunta (grafía). |
| c09 | OK (aviso) | Voz 0.55–4.11. "pásemela": large-v3 escribe "pásamela" (0.86) y con prompt "pásemela" (0.76): ambiguo, no se nota. |
| r1 | OK con recorte | Mancha rojiza rizada (¿nuca de otra Norma?) abajo a la IZQ. de 0.0 a ~1.5 s: empezar en ≥ 1.75. Risa real "jajaja" 3.91–4.49 (−25.6 LUFS): silenciar como los mudos o dejarla baja. |
| c10 | OK (aviso) | Celular en la mano IZQUIERDA (pantalla no visible). Voz 1.21–7.35. |
| c11 | OK con crop | Hombro con camisa a cuadros azul/blanca en el borde inferior DER. de 0.0 a ~1.1 s; voz desde 0.63. `crop=540:960:0:0` en 0–1.2 (limpio a 0 y 0.5 s). |
| c12 | OK | Voz 0.43–4.75. |
| r2 | OK con recorte | Rocío entra por la IZQ. (medio fuera 0–0.75 s) y cuadros azul/blanco abajo a la DER. 0–0.5 s: empezar en ≥ 1.0. Mudo (alucina "¡Suscríbete!" a −44.3 LUFS): silenciar. |
| c13 | OK con recorte | Mano/brazo color piel en el borde IZQ. 0–0.25 s; voz desde 0.82: empezar en ≥ 0.5. Baja el vestido azul fuera de cuadro a ~3.75 s (se va con el push-in, no desaparece de golpe; aviso). |
| c14 | OK | Máquina de coser en el borde IZQ. (escenografía). Voz 0.37–5.53. |
| c15 | OK | Voz 0.14–4.33. |
| c16 | OK con crop | Astilla de camisa a cuadros azul/blanca en el borde DER. de 0.25 a ~0.75 s; voz desde 0.10. `crop=540:960:0:0` en 0–1.0 (limpio a 0.25 y 0.5 s). |
| c17 | OK | Voz 0.44–4.50. |
| c18 | OK | Mano en el pecho (abierta). Voz 0.37–5.45. |
| c19 | OK | Celular en la mano DERECHA, pantalla no visible. Voz 0.88–6.10. |
| c20 | OK | "mustia" claro. Voz 0.14–5.43. |
| c21 | OK con crop | **Regenerado** (clips_log2: OK intento 1; versión rota en clips/old/c21_v1.mp4). Decodifica sin errores (8.0 s video / 8.04 s audio), −19.2 LUFS. Karla correcta (chongo, aretes pequeños, chamarra de mezclilla negra, playera blanca), mirada a la DER., sin subtítulos, sin congelados ni cortes. large-v3: "Por esa foto, el marido de Rocío se fue, mamá." (1.17–3.67) / "Y ya nadie le lleva costura." (4.57–6.00) = lines.json. **Figura oscura** (perfil de cabello oscuro + cuerpo) en el borde DER. (x ≥ 640) de 0.0 a ~2.25 s: `crop=600:1067:0:0` en el 1.er tramo (1.09–3.82). |
| c22 | OK con crop | Mancha rojiza desenfocada en el borde IZQ. de 0.0 a ~1.75 s; voz desde 0.31. `crop=540:960:180:0` en 0–2.0 (limpio a 0 y 1.0 s). |
| r3 | OK | Mudo (alucina "Gracias por ver el video." a −51.7 LUFS): silenciar. |
| c23 | OK | Voz 0.15–5.53 ("Carla" = grafía de Karla). |
| c24 | OK con crop | Hombro oscuro en el borde IZQ. de 0.0 a ~0.5 s; voz desde 0.21. `crop=540:960:180:0` en 0–0.6 (limpio a 0 y 0.25 s). |
| c25 | OK | Celular en la mano DERECHA. Voz 0.24–6.38. |
| c26 | OK | Voz 0.65–4.42. |
| c27 | OK | Voz 0.55–7.24. |
| r4 | OK | Mudo (alucina "SILENCIO" a −46.6 LUFS): silenciar. |
| c28 | OK | Voz 0.76–5.30. −24.1 LUFS (bajo). |
| c29 | OK | CTA a cámara, sonríe y asiente. "delatar" claro. Voz 0.61–8.59. |

## REGENERAR
Ninguno. c21 regenerado el 2026-11-07 y revisado (ver tabla); el fallback (quitar c21) no hizo falta.

## Arreglos menores para el montaje
- **Crops de borde** (punch-in solo mientras dura el borde; probados limpios): c01 `540:960:180:0` (0–1.1), c02 `540:960:0:0` (0–0.8), c04 `540:960:0:0` (0.6–1.5), c11 `540:960:0:0` (0–1.2), c16 `540:960:0:0` (0–1.0), c22 `540:960:180:0` (0–2.0), c24 `540:960:180:0` (0–0.6), c21 `600:1067:0:0` (0–2.3).
- **Arranques**: c04 = 0.6, c13 ≥ 0.5, r1 ≥ 1.75, r2 ≥ 1.0 (todos antes de la voz).
- **r1–r4**: silenciar (r1 tiene una risa real a −25.6 LUFS; las demás son alucinaciones de Whisper sobre ruido).
- Volumen: c04 (−16.1), c09 (−16.6), c23 (−16.9) fuertes; r1 (−25.6), c06 (−25.4), c28 (−24.1), c20 (−23.7) bajos. El loudnorm en dos pasadas de edit.py los empareja.
- Avisos sin acción: c08 y c10 celular en la mano izquierda (hflip rompería la geografía); c09 "pásemela/pásamela" ambiguo; c01 placa ilegible en la pared; c13 el vestido sale de cuadro con el push-in.
- Whisper escribe "Carla", "Rocio", "30", "Junta de Vecinos" y cambia puntos por comas: es grafía.
