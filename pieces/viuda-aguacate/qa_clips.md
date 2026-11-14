# QA clips · viuda-aguacate Parte 1 (MEXI, 2026-11-08)

Método (el de pedida-mano): hoja de 5 fotogramas por clip (2/25/50/75/97 %) comparada con chars/ (ENGRACIA_MURGUIA, FITO_CUEVAS, PONCIANO_UGALDE, WENCES_PICHARDO, NICANDRO_SOLORZANO, LOC_HUERTAGUACATE, LOC_COCINAENGRACIA) y con la geografía fija de clips.py. Tiras de cuadro completo cada 0.25 s de 0 a 2.5–3.5 s (bordes, entradas) en los dudosos y cada 0.5 s en los insertos; recortes probados en el peor fotograma. Cortes internos con scene > 0.3 y scdet; LUFS por clip; earshot describe en i02, i05, i06 y r5 (foley, sin música). Audio: faster-whisper large-v3 (es, CPU, int8) con lv3.py → renders/lv3.json, contra lines.json; c24, c03 y c27 redecodificados con beam 1 y beam 5 + VAD. Nada se corrió en Flow.

Resultado general: caras y ropa correctas en todos los planos de personaje (Engracia: gris corto ondulado, blusa negra, rebozo gris, aretes plata. Fito: gorra beige, camisa verde olivo. Ponciano: calvo, lentes redondos dorados, traje de lino beige, corbata café. Wences: cola de caballo, piocha, camisa guinda, chaleco negro. Nicandro: sombrero de palma con cinta negra, chamarra de gamuza café, bolo plata, barba blanca corta como en su hoja). Ningún subtítulo ni texto en pantalla. Sin armas ni sangre (i06: escoltas de traje negro, manos cruzadas y vacías). Maletín siempre cerrado (c08, c32). Un solo candado, una sola caja. Ninguna música dentro de los clips (inserts = foley). Geografía respetada. Transcripción = lines.json en los 36 diálogos salvo c24 (y la pronunciación de "Engracia" en c03). Ningún clip mudo que debía hablar. Fallo repetido de Omni: **figuras en el borde los primeros 0.25–1.0 s** (otro personaje del plano/contraplano asomando, a veces un 2.º sombrero de palma); se arregla en todos con el arranque o un crop.

| clip | estado | motivo |
|---|---|---|
| i01 | OK | Mano con manga guinda (Wences) cierra el candado. Mano entra a 2.5 s; útil 2.4–5.8. Audio: Whisper alucina "¡Suscríbete al canal!": foley bajo o silencio. |
| c01 | OK con recorte | Mancha oscura en el borde IZQ. solo en el fotograma 0. Voz 1.57–3.35 / 5.17–6.69: empezar ≥ 0.25. |
| i02 | OK | Bota tira la caja, aguacates al piso. Útil 1.0–4.8. Foley real (−18.8 LUFS), sin voz. |
| c02 | OK | Voz 0.28–4.76. |
| c03 | OK con recorte | Dice "doña **Ingracia**" (5.60–6.20, estable en 3 decodificaciones). Cortar después de "nada," : voz 0.58–2.41 / 3.76–5.45, salida 5.50. "Su Lauro ya no firma nada." se sostiene sola. |
| r1 | OK con recorte | Fito **entra caminando** desde el borde IZQ. (0–0.9 s). Útil 1.0–6.0. Mudo: silenciar. |
| c04 | OK con recorte | Forma blanca abajo a la DER. 0.25–0.75 s. Voz 1.10–5.94: empezar ≥ 0.9. |
| c05 | OK con crop | Cabeza oscura en el borde IZQ. (0–0.25) y **otra camisa guinda** abajo a la IZQ. (0–~1.0). Voz 0.98–5.01. `crop=540:960:180:0` en 0–1.25 (probado limpio a 0.25 y 0.75) o empezar en 1.15. |
| c06 | OK con crop | Hombro/cabeza gris abajo a la DER. 0–0.75 s. Voz 0.66–3.86. `crop=540:960:0:0` en 0–0.9 (probado limpio). |
| c07 | OK | Se acomoda los lentes. Voz 0.53–4.92. |
| c08 | OK con recorte | Figura beige en el borde IZQ. 0–0.25 s. Voz 0.82–4.97: empezar ≥ 0.5. Aviso: el maletín sale de cuadro hacia abajo desde ~2.8 s (cerrado siempre). |
| c09 | OK con recorte | Forma gris abajo a la IZQ. 0.25–0.75 s. Voz 0.81–5.72: empezar en 0.75, o `crop=600:1067:120:0` en 0–0.9 (probado limpio). |
| c10 | OK | Radio en la mano derecha. Voz 0.70–4.04. |
| r2 | OK | Mudo (alucina "¡Suscríbete!" a −49.2 LUFS): silenciar. |
| c11 | OK con recorte | Forma café en el borde IZQ. 0.25–0.5 s. Voz 1.29–5.00: empezar ≥ 0.75. |
| c12 | OK | Voz 0.40–5.05. |
| i03 | OK con recorte | **Cabeza de una persona** asoma en el borde IZQ. arriba ~1.0–1.75 s ("no faces"). Útil 2.0–5.9 (abre el cajón y desenvuelve el celular). Mudo: silenciar. Aviso: el "ropero" sale como cómoda baja. |
| c13 | OK | Voz 0.83–5.36. |
| c14 | OK (aviso) | Celular en la mano DERECHA (el prompt pide IZQ.); igual en c15, c18 e i04, así que es coherente entre planos: sin acción. Voz 0.80–4.76. |
| i04 | OK con recorte | Manga a cuadros de otra persona en el borde IZQ. abajo 0–0.75 s; desde ~3 s la pantalla muestra una interfaz con etiquetas borrosas (no legibles a 720p). Útil 1.0–3.0 (pulgar en la tecla, pantalla encendiéndose). Silenciar. |
| c15 | OK (aviso) | Celular en la oreja DERECHA (pedía IZQ.), coherente con c14. Voz 1.06–6.48. −24.4 LUFS. |
| c16 | OK | Baja el celular, bastón visible. Voz 0.85–5.85. |
| i05 | OK con recorte | **Corte interno a 2.96 s**: 0–2.95 es OTRA mujer (pelo castaño, blusa verde, en una sala) que no existe en la historia. Usar solo 3.0–6.0 (drone, 8 camionetas, sin placas). Silenciar (alucina "SIGUE VIVIENDO"). |
| c17 | OK | Voz 0.61–3.66. |
| c18 | OK con crop | Figura beige en el borde DER. y **un sombrero de palma** arriba 0.25–0.75 s (Nicandro aún no llega). Voz 0.83–4.46. `crop=540:960:0:0` en 0–1.0 (probado limpio) o empezar en 0.8. |
| c19 | OK | Voz 0.93–5.00. |
| c20 | OK | Voz 0.56–4.62. |
| i06 | OK con recorte | **Corte interno a 3.92 s** (plano abierto → escoltas de cerca). Dos tramos útiles: 0.0–3.85 (llegan las camionetas al portón) y 3.95–6.0 (escoltas en fila, manos cruzadas). Foley de autos (−21 LUFS). |
| c21 | OK | Voz 0.84–5.38. |
| i07 | OK con recorte | Mano en el bastón 0–3.0; de 3.0 a 4.5 la mano sale y el bastón queda casi solo; botas bajan 4.8–5.9. Útil 0.3–3.0 o 4.6–5.9. |
| c22 | OK (aviso) | Se toca el ala del sombrero. Sin bastón a la vista. Voz 1.07–4.98. |
| c23 | OK con recorte | Pelo rojizo en el borde IZQ. solo en el fotograma 0. Voz 0.53–4.59: empezar ≥ 0.25. |
| c24 | **REGENERAR** | Audio: "Nicandro **Solor**, licenciado" (Solórzano cortado, 0.4 s) y "Usted me firmó **papel, me firmó** papeles en Zamora" (se traba y repite). Igual en beam 5 y con VAD. Imagen bien salvo figura en el borde DER. 0–0.5 s. |
| r3 | OK con recorte | Blanco en el borde IZQ. 0–0.25 y DER. 0.25–0.5 s. Útil 0.75–6.0 (se quita los lentes). Silenciar. |
| c25 | OK con recorte | Figura blanca IZQ. 0–0.25 y DER. 0.25–0.5 s. Voz 0.77–5.43: empezar en 0.7. |
| c26 | OK con crop | Sombrero de palma arriba a la DER. y figura beige en el borde DER. 0–0.75 s. Voz 0.87–5.29: empezar en 0.8, o `crop=540:960:90:0` en 0–0.9 (probado limpio). |
| c27 | OK con crop | **Cabeza gris** en el borde DER. 0–0.75 y hombro gris abajo DER. hasta ~1.0 s. Voz 0.69–4.64. `crop=540:960:0:0` en 0–1.0 (probado limpio a 0.25 y 0.75). |
| c28 | OK | Voz 1.38–6.44. −16.0 LUFS (fuerte). |
| c29 | OK | Camionetas al fondo. Voz 0.59–5.66. |
| r4 | OK (aviso) | Celular de tapa (en c14/i04 es de barra). Mudo (alucina "Gracias por ver el video"): silenciar. |
| c30 | OK con crop | Sombrero arriba a la DER. 0.25–0.5 y figura beige en el borde DER. 0–0.75 s. Voz 0.81–4.90: `crop=540:960:0:0` en 0–0.9 (probado limpio) o empezar en 0.75. |
| r5 | OK | Wences de rodillas devuelve los aguacates. Foley de pasos (−34.9): bajo o silencio. |
| c31 | OK con recorte | **Sombrero de palma** (doble) arriba a la DER. 0–0.75 s. Voz 1.28–6.69: empezar ≥ 0.9. |
| c32 | OK con recorte | Blanco en el borde IZQ. 0–0.25 s. Maletín cerrado contra el pecho. Voz 0.73–5.11: empezar ≥ 0.4. |
| c33 | OK | Voz 0.48–3.21. |
| c34 | OK | Voz 0.64–5.56. −26.9 LUFS (bajo). |
| c35 | OK | Pausa larga 3.6–5.0 entre frases (salto dentro del clip). Voz 1.32–3.60 / 5.04–6.25. |
| c36 | OK | CTA con carisma: se acomoda el rebozo, ladea la cabeza, sonríe. Voz 0.40–4.02 / 5.19–8.62. |

## REGENERAR
- **c24**: "Solor" en vez de "Solórzano" y "me firmó papel, me firmó papeles" (se traba).

Cambio en clips.py (solo c24; se mantiene todo lo demás):
- Partir el apellido para que no lo coma y bajar a una idea por frase. En lines.json (fuente de clips.py): `"c24": ["Soy Nicandro Solórzano, licenciado.", "Usted me firmó unos papeles en Zamora."]`. Si se prefiere no tocar lines.json, igual que en pedida-mano: en el tono de c24 agregar "says his full surname So-LÓR-za-no completely and clearly, says each sentence once with no restart and no repeated words".
- Tono: "calm, cold, slow, every word said once".

Para regenerar (cuando Flow esté libre): `python -I clips.py c24 > clips_log2.txt`. Revisar: "Solórzano" completo, sin repetición, Nicandro con sombrero y bolo, bordes limpios.

Fallback si vuelve mal: usar el viejo con salto dentro del clip: "Nicandro Solor, licenciado" no tiene arreglo de audio; quitar la primera frase (Ponciano ya preguntó "¿Y usted quién es?", y c25 dice "Don Nicandro") y dejar solo "Usted me firmó papeles en Zamora" = "Usted" 3.38–4.00 + salto a 4.78–6.40 ("me firmó papeles en Zamora"); el salto de imagen se tapa con r3 o una reacción de Ponciano.

## Arreglos para el montaje (tramos útiles)
- **Recortes internos de insertos**: i05 solo 3.0–6.0 (0–2.95 es otra mujer); i06 0.0–3.85 o 3.95–6.0 (corte a 3.92); i03 2.0–5.9; i04 1.0–3.0; i07 0.3–3.0 o 4.6–5.9; i01 2.4–5.8; i02 1.0–4.8; r1 1.0–6.0; r3 0.75–6.0.
- **Crops de borde** (punch-in solo mientras dura el borde, probados limpios): c05 `540:960:180:0` (0–1.25), c06 `540:960:0:0` (0–0.9), c09 `600:1067:120:0` (0–0.9), c18 `540:960:0:0` (0–1.0), c26 `540:960:90:0` (0–0.9), c27 `540:960:0:0` (0–1.0), c30 `540:960:0:0` (0–0.9).
- **Arranques** (antes de la voz): c01 ≥ 0.25, c04 ≥ 0.9, c08 ≥ 0.5, c09 = 0.75, c11 ≥ 0.75, c23 ≥ 0.25, c25 = 0.7, c31 ≥ 0.9, c32 ≥ 0.4. Sin crop: c05 = 1.15, c18 = 0.8, c26 = 0.8, c30 = 0.75; c06 y c27 necesitan el crop (la voz empieza a 0.66 y 0.69, antes de que se limpie el borde).
- **Salida** de c03 en 5.50 (quita "doña Ingracia").
- **Silenciar**: r1–r4, i03, i04, i05 (Whisper alucina "¡Suscríbete!", "Gracias por ver el video", "SIGUE VIVIENDO"). i01, i02, i06, i07, r5 tienen foley real: dejarlo bajo o silenciar.
- **Volumen**: c28 (−16.0), c18 (−17.0), c36 (−17.6) fuertes; c34 (−26.9), c03 (−25.6), c32 (−25.2) bajos. El loudnorm de edit.py los empareja.
- **Avisos sin acción**: celular en la mano/oreja DERECHA en c14, c15, c18, i04 (coherente entre sí; hflip no conviene porque invierte la mirada y el ropero); celular de tapa en r4; sin bastón en c22; maletín sale de cuadro en c08; "ropero" como cómoda en i03.
- Whisper escribe cifras ("72", "100,000", "10") y "Don" con mayúscula: es grafía.
