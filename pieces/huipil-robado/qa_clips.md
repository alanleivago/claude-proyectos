# QA clips · huipil-robado Parte 1 (VISTA, 2026-11-07)

Método (el de pedida-mano): hoja de 4 fotogramas por clip (8/35/62/90 %) comparada con chars/ (TOMASA_SANABRIA, YARETZI_SANABRIA, ROMINA_ARRIOLA, CRESCENCIA_LOPEZ, OFELIA_FERIA2; chars/mal/OFELIA_FERIANTE descartada, no se usó) y con la geografía fija de clips.py. Tiras del 38 % inferior a 1.5 fps (subtítulos) y de cuadro completo a 4 fps (bordes, entradas) en los 39 clips; fotogramas a 200 px cada 0.25 s en los dudosos (0–1.5 s y 1.75–5 s); recortes probados en el fotograma 0 y en el último instante del defecto. freezedetect + cortes (scene > 0.3) + LUFS + F0 por clip. Audio: faster-whisper large-v3 (es, CPU, int8) sobre el WAV cargado con numpy, contra lines.json (c08 decodificado dos veces más). Nada se corrió en Flow. Los 39 clips salieron al 1.er intento salvo c04, r2 y c27 (2.º); ninguno con NOREF.

Resultado general: caras y ropa correctas en todos (Tomasa: dos trenzas grises, blusa blanca con flores moradas y amarillas, rebozo vino, falda negra. Yaretzi: cola baja negra, cárdigan verde, playera crema, aretes plata. Romina: chongo bajo, labios rojos, blazer marfil, top negro, collar dorado. Crescencia: chongo gris, blusa azul claro, rebozo mostaza. Ofelia = hoja FERIA2: pelo corto ondulado castaño, blusa verde azulado, cárdigan gris, portapapeles beige). Nadie con sombrero ni lentes (tampoco en la cabeza de Romina); Ofelia sin gafete. Nadie señala (c35 manos abiertas, se acomoda el rebozo). Ningún subtítulo ni texto en pantalla (tiras inferiores limpias en los 39). Ningún clip congelado ni con cortes internos. Celular siempre en la mano DERECHA (c06, c08, r2, c14–c16), pantalla nunca legible. Blusa de flores moradas y amarillas igual en todos; colibrí morado en r4. Geografía respetada (patio 1: Romina DER., Tomasa/Yaretzi IZQ.; patio tarde: Tomasa IZQ. sentada, Yaretzi/Crescencia DER.; feria: Ofelia/Romina DER., Tomasa/Yaretzi IZQ.; calle: Tomasa sentada IZQ., farol encendido). Voces: todas femeninas (F0 173–271 Hz), cada una con su personaje. Transcripción = lines.json en los 35 diálogos, sin palabras repetidas, tartamudeos, frases inventadas ni 2.ª frase perdida; "Yaretzi", "Crescencia", "colibrí" y "desenmascarar" bien pronunciados.

| clip | estado | motivo |
|---|---|---|
| c01 | OK | Voz 0.66–8.10. |
| c02 | OK con crop | **Doble**: cabeza gris + rebozo vino en el borde DER. de 0.0 a ~1.5 s; voz desde 0.57. `crop=600:1067:0:0` en 0–1.6 (probado limpio a 0, 0.75 y 1.5 s). |
| c03 | OK | Voz 0.88–7.24. |
| c04 | OK | Voz 1.08–5.04. |
| c05 | OK | Voz 1.32–7.11. |
| r1 | OK con recorte | Tomasa entra caminando desde el borde IZQ. y se acomoda (0–~1.75 s): empezar en ≥ 2.0. Mudo (alucina "¡Suscríbete!", −38.8 LUFS): silenciar. |
| c06 | OK | Celular en la DER. Voz 1.33–7.31. −16.5 LUFS (fuerte). |
| c07 | OK | Mano en el pecho. Voz 1.17–6.50. |
| c08 | OK (aviso) | Voz 1.40–7.32. Whisper oye "Romina **Riola**" (estable en 3 decodificaciones): es la sinalefa "Romina‿Arriola", no un error. |
| c09 | OK | Voz 1.10–6.60. |
| r2 | OK con recorte | **Doble**: espalda/hombro con cárdigan verde en primer plano IZQ. de 0.0 a ~1.0 s: empezar en ≥ 1.25. Mudo (alucina "SILENCIO"): silenciar. |
| c10 | OK con recorte | Mancha de piel en el borde inferior IZQ. 0–0.25 s; voz desde 0.77: empezar en ≥ 0.3. |
| c11 | OK con crop | Figura blanca (brazo/espalda) en el borde IZQ. de 0.0 a ~1.75 s; voz desde 1.65. `crop=600:1067:120:0` en 0–2.0 (limpio a 0, 0.5 y 1.0 s). −23.5 LUFS (bajo). |
| c12 | OK | Voz 0.44–7.54. |
| c13 | OK | Voz 0.83–6.11. |
| c14 | OK | Llamada sin pantalla dividida, Ofelia no aparece. Voz 0.34–6.71. |
| c15 | OK | Voz 0.90–7.12. |
| c16 | OK con recorte | Sombra oscura en el borde DER. en el fotograma 0; voz desde 0.52: empezar en ≥ 0.3. |
| c17 | OK | Voz 0.50–5.87. |
| c18 | OK | Mano sobre las blusas dobladas. Voz 0.85–5.50. |
| c19 | OK | Voz 0.89–5.25. |
| c20 | OK con crop | Tela roja (rebozo) en el borde IZQ. de 0.0 a ~0.5 s; voz desde 0.41. `crop=600:1067:120:0` en 0–0.6 (limpio). |
| c21 | OK | Voz 0.89–5.41. |
| c22 | OK | Voz 0.52–5.30. −23.9 LUFS (bajo). |
| c23 | OK | Voz 0.68–4.51. −16.3 LUFS (fuerte). |
| c24 | OK | Voz 1.60–7.32. |
| c25 | OK con recorte | Mano/brazo color piel en el borde DER. de 0.0 a ~0.75 s; voz desde 1.32: empezar en ≥ 0.8 (o `crop=600:1067:0:100` en 0–0.8, limpio). |
| c26 | OK | Sillas de la feria abajo a la IZQ. (escenografía). Voz 0.31–4.87. |
| c27 | OK con crop | Figura (nuca) en el borde IZQ. de 0.0 a ~0.25 s; voz desde 0.10. `crop=600:1067:120:0` en 0–0.4 (limpio). |
| c28 | OK con crop | **Figura de blanco** en el borde DER. de 0.0 a ~1.75 s; voz desde 0.10. `crop=576:1024:0:0` en 0–1.8 (limpio a 0, 0.75 y 1.5 s). Fondo con otras carpas y gente lejana desenfocada (aviso). |
| c29 | OK | Voz 0.91–5.54. |
| r3 | OK con recorte | Una mujer de blusa blanca camina en el fondo de 0.0 a ~1.0 s: empezar en ≥ 1.25. Mudo (alucina "Gracias por ver el video"): silenciar. |
| c30 | OK con recorte | Figura oscura en el borde IZQ. 0–0.25 s; voz desde 1.19: empezar en ≥ 0.4. |
| c31 | OK | Voz 0.55–5.81. |
| c32 | OK | Voz 0.61–6.34. |
| c33 | OK con crop | Figura oscura en el borde IZQ. de 0.0 a ~1.0 s; voz desde 1.08. `crop=600:1067:120:0` en 0–1.25 (limpio a 0, 0.5 y 1.0 s). |
| c34 | OK | Voz 0.70–7.55 (baja la blusa en los últimos 0.4 s, sin morph). |
| r4 | OK con recorte | Barbilla de Tomasa arriba a la DER. de 0.0 a ~2.2 s (se pidió sin cara); colibrí morado desde ~3.0 s: empezar en ≥ 2.5. Mudo (alucina "¡SUSCRÍBETE!"): silenciar. |
| c35 | OK | Manos abiertas, se acomoda el rebozo, nunca señala. Voz 0.45–9.03. |

## REGENERAR
Ninguno. Todos los defectos son de borde o de arranque y se arreglan en el montaje; clips.py no se tocó.

## Arreglos para el montaje
- **Crops de borde** (punch-in solo mientras dura el borde): c02 `600:1067:0:0` (0–1.6), c11 `600:1067:120:0` (0–2.0), c20 `600:1067:120:0` (0–0.6), c27 `600:1067:120:0` (0–0.4), c28 `576:1024:0:0` (0–1.8), c33 `600:1067:120:0` (0–1.25). Probados limpios.
- **Arranques**: c10 ≥ 0.3, c16 ≥ 0.3, c25 ≥ 0.8, c30 ≥ 0.4 (todos antes de la voz); insertos r1 ≥ 2.0, r2 ≥ 1.25, r3 ≥ 1.25, r4 ≥ 2.5.
- **r1–r4**: silenciar el audio (Whisper alucina "¡Suscríbete!", "SILENCIO", "Gracias por ver el video").
- Volumen: c23 (−16.3), c06 (−16.5) fuertes; c22 (−23.9), c11 (−23.5) bajos. El loudnorm en dos pasadas de edit.py los empareja.
- Avisos sin acción: c08 "Romina‿Arriola" con sinalefa; c28 carpas y gente lejana al fondo.
- Whisper escribe "Doña" con mayúscula, quita los "…" y cambia puntos por comas: es grafía.
