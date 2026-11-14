# QA clips · tiendita-justa Parte 1 (MEXI, 2026-11-07)

Método (el de pedida-mano): hoja de 4 fotogramas por clip (8/35/62/90 %) comparada con chars/ (CHUY_MEDINA, AURELIO_MEDINA, EVARISTO_LOZANO, CIPRIANO_ROBLES, TONA_ARELLANO, FIDEL_CARMONA, MARISOL_TREJO, LIC_ZAMARRIPA y las 6 LOC_) y con la geografía fija de clips.py. Tiras del 38 % inferior a 1.5 fps (subtítulos) y de cuadro completo a 4 fps (bordes, entradas) en los 45 clips; fotogramas a 200 px cada 0.25 s en los dudosos; recortes probados en el fotograma 0 (el peor) y al final de la ventana. freezedetect + cortes (scene > 0.3) + LUFS + F0 por clip (y earshot en c01). Audio: faster-whisper large-v3 (es, CPU, int8) sobre el WAV cargado con numpy, contra lines.json; las dudas (c07, c40, c16, c22) se volvieron a decodificar por tramo con beam 1 y con beam 5 a T 0.4. Nada se corrió en Flow.

Resultado general: caras correctas (Chuy: pelo negro corto, lampiño, camiseta guinda, jeans negros. Aurelio: pelo gris corto, bigote gris, camisa azul cielo de manga remangada, paliacate mostaza LISO igual en todos. Evaristo: bigote negro grueso, pelo engominado con sienes grises, camisa a cuadros azul/blanco, mandil verde. Cipriano: pelo y bigote blancos, camisa gris, pantalón café, bolsas blancas. Fidel: camisa caqui, jeans. Marisol: cola de caballo, blusa guinda, sin gafete. Inspector: traje café oscuro, camisa blanca, corbata guinda, portapapeles, sin gafete ni escudos). Nadie con sombrero, gorra ni lentes; nadie señala; sin billetes, cifras ni precios legibles; una sola camioneta, la roja (c19, c27). Ningún subtítulo ni texto en pantalla (tiras inferiores limpias en los 45). Ningún clip congelado ni con cortes internos. Geografía respetada (tienda vieja: Evaristo IZQ. / Cipriano DER.; tiendita: Chuy IZQ. / Aurelio, Toña e inspector DER.; bodega: Chuy IZQ. / Fidel DER. con la camioneta; cabina: Chuy al volante / Aurelio copiloto; ventanilla: Marisol / Evaristo). Voces: hombres 113–182 Hz (c01 213 Hz gritando, earshot = "a man shouting", Male speech), mujeres 208–239 Hz, cada una con su personaje. Transcripción = lines.json en los 42 diálogos salvo c07 y c40 (y "papá" por "apá" en c16/c22).

| clip | estado | motivo |
|---|---|---|
| c01 | OK | Voz 0.96–7.04. 213 Hz por el grito (earshot: hombre gritando). |
| c02 | OK | Bolsas blancas en cada mano. Voz 0.00–6.22. |
| r1 | OK con crop | **Brazo/torso con camisa a cuadros (doble de Evaristo) en el borde DER.** de 0.0 a ~1.1 s. Mudo: `crop=540:960:0:0` en 0–1.25 (limpio a 0, 0.6 y 1.2 s) o empezar en ≥ 1.25. Whisper alucina "SILENCIO" (−45.8 LUFS): silenciar. |
| c03 | OK | Voz 1.28–3.82. |
| c04 | OK (aviso) | Cipriano ya sin las bolsas (en c02 las traía). Voz 1.20–6.04. −16.7 LUFS (fuerte). |
| c05 | OK | Manos sobre el mostrador. Voz 1.08–2.66. |
| c06 | OK | Voz 0.88–6.14. |
| c07 | OK (v2, regenerado) | large-v3: "Apá, no lo va a creer." 0.83–2.38 / "Lo de toda la semana se vendió en un día." 3.33–6.26, "se vendió" UNA vez. Sin figura verde en el borde (cuadro limpio de 0 a 8 s, sin crop). Viejo en clips/old/c07_v1.mp4. |
| c08 | OK (aviso) | Bolsas de botana de colores tipo marca en el estante (sin letras legibles). Voz 0.70–5.42. |
| c09 | OK | Voz 0.62–5.04. |
| c10 | OK | Voz 0.00–6.52. |
| c11 | OK (aviso) | Salió en el intento 5 (NOREF): Toña sin hoja, cara más delgada y pelo más oscuro que TONA_ARELLANO, pero ropa, trenza y morral bien e igual en c13 y c29 (sus tres planos coinciden entre sí). Etiquetas amarillas en el estante (sin texto legible). Voz 1.38–3.88. |
| c12 | OK con crop | **Doble de Chuy: hombro y brazo con camiseta guinda en el borde DER.** de 0.0 a ~4.0 s; voz desde 0.70. `crop=540:960:0:0` en 0–4.0 (limpio a 0, 1.3, 2.6 y 3.9 s; o todo el clip con ese crop para evitar el salto). |
| c13 | OK (aviso) | NOREF (intento 5), misma Toña que c11/c29. Morral en el brazo DERECHO (hoja: izq.). Voz 0.00–8.88, las dos frases completas. |
| c14 | OK | Voz 0.46–4.80. |
| c15 | OK (aviso) | Escoba en la mano IZQUIERDA (prompt: derecha). Voz 0.00–4.72. |
| c16 | OK con crop | Figura verde oscura en el borde DER. de 0.0 a ~1.9 s; voz desde 0.62. `crop=540:960:0:0` en 0–2.0 (limpio). Dice "Ahorita le hablo, **papá**" (no "apá"; estable, aviso). |
| c17 | OK | Voz 1.08–6.28. |
| c18 | OK | Manos abiertas, sin billetes. Voz 0.90–6.84. |
| c19 | OK | Camioneta roja detrás, mano en el pecho. Voz 0.00–5.52. |
| c20 | OK con crop | Cara/hombro de alguien en el borde IZQ. de 0.0 a ~1.9 s; voz desde 0.00. `crop=540:960:180:0` en 0–2.0 (limpio). |
| c21 | OK | Voz 1.22–4.88. |
| c22 | OK (aviso) | "…no subir el precio, **papá**" (estable). Voz 0.00–5.52. |
| c23 | OK | Voz 0.94–3.96. |
| c24 | OK | Trapo en la mano. Voz 0.58–6.40. −25.2 LUFS (bajo). |
| c25 | OK | Voz 1.34–3.26. |
| c26 | OK con recorte | Manga gris en el borde DER. abajo de 0.0 a ~0.5 s; voz desde 0.94: empezar en ≥ 0.6 (o `crop=540:960:0:0` en 0–0.6, limpio). Fila al fondo, nadie con camiseta guinda. −14.8 LUFS (fuerte). |
| c27 | OK con crop | Brazo blanco en el borde IZQ. de 0.0 a ~0.5 s; voz desde 0.60. `crop=540:960:180:0` en 0–0.6 (limpio). Aviso: letrero desenfocado con letras ilegibles y un logo verde en la tienda del fondo. |
| c28 | OK con crop | **Hombro con camisa a cuadros (doble de Evaristo) en el borde DER.** de 0.0 a ~0.9 s; voz desde 0.76. `crop=540:960:0:0` en 0–1.0 (limpio). |
| c29 | OK (aviso) | NOREF (intento 5), misma Toña que c11/c13. Voz 0.60–3.68. |
| c30 | OK | Detrás de la cerca, fila lejos y desenfocada. Voz 0.00–6.24. |
| c31 | OK | Voz 1.14–5.98. |
| c32 | OK con recorte | Evaristo **entra desde el borde DER.** (0–0.75 s, cabeza cortada); voz desde 0.84: empezar en 0.75. Sin mandil (correcto). Aviso: logo bordado pequeño en el bolsillo. |
| c33 | OK | Pluma en la mano, sin gafete. Voz 0.92–2.34. |
| c34 | OK (v2, regenerado) | Evaristo SIN mandil (solo camisa a cuadros azul/blanco, como en c32), centrado desde el fotograma 0, sin doble ni nadie en los bordes. large-v3: "Con mucho gusto, señorita." 1.82–3.15. Logo bordado pequeño en el bolsillo (igual que c32). |
| c35 | OK (aviso) | "empiezan" alargado (4.18–5.48). Voz 0.00–6.24. |
| c36 | OK con crop | Figura con camisa a cuadros roja/negra en el borde IZQ. de 0.0 a ~2.4 s; voz desde 0.66. `crop=540:960:180:0` en 0–2.5 (limpio a 0, 0.8, 1.6 y 2.4 s). |
| c37 | OK (aviso) | Portapapeles en la mano DERECHA (prompt: izq.; igual en c39 y c41, continuidad bien). Voz 0.72–4.36. |
| c38 | OK | Voz 0.00–3.86. |
| c39 | OK con crop | Forma blanca (brazo) en el borde IZQ. abajo de 0.0 a ~1.9 s; voz desde 0.00. `crop=540:960:180:0` en 0–2.0 (limpio). −15.9 LUFS (fuerte). |
| c40 | OK con crop (v2, regenerado) | large-v3: "Apá, tráigame la carpeta del cajón por favor." 1.36–3.90, "del cajón" UNA vez. Figura con camisa verde azulada en el borde DER. de 0 a ~2.3 s: `crop=600:1067:0:0` en todo el tramo (limpio a 4 fps de 1.28 a 4.05 s, Chuy entero). |
| r2 | OK | Mudo (alucina "¡Suscríbete!" a −50.0 LUFS): silenciar. |
| c41 | OK | Voz 0.00–5.54. |
| r3 | OK | Mudo (alucina "¡Suscríbete!" a −49.5 LUFS): silenciar. |
| c42 | OK | CTA a cámara, manos en el mostrador. Voz 0.48–8.72, las dos frases completas. −15.0 LUFS. |

## REGENERAR (hecho 2026-11-07: c07, c34 y c40 v2 OK, no hizo falta fallback)
- **c07**: repite "se vendió" (4.48–5.70).
- **c34**: Evaristo con mandil en la ventanilla (c32 sin mandil) y entra desde el borde.
- **c40**: repite "del cajón" (2.76–3.68).

Cambios en clips.py (solo c07, c34, c40; se mantienen STYLE, VOICE, NOSUB, CLEAN, END, ONE/ALONE con gaze, NODOUBLE, NOTE, SAFE, SOFT, variant, NOREF, STYLES, TRIES=6, las pausas y el gatito de control):
- c07: tono "happy, excited, warm, steady pace, each word said only once, he says 'se vendió' a single time and never repeats it" + ", no green clothing at the right edge" tras el NODOUBLE.
- c34: "centered in the frame from the very first frame, never walking in from the side, WITHOUT any apron: only his blue-and-white checked shirt is visible, no green apron, the same outfit as when he arrived at the window" + `NODOUBLE("man in a checked shirt")` (la hoja de Evaristo lleva mandil y STYLE pide la ropa de la hoja: por eso hay que negarlo explícito).
- c40: "centered in the frame from the very first frame" + `NODOUBLE("man in a wine-red t-shirt")`; tono "worried, quiet, polite, each word said only once, he says 'del cajón' a single time and never repeats it".

Probado en seco: el módulo carga, 45 clips, y variant(k=0 y k=1) de c07/c34/c40 lleva los cambios (SOFT solo cambia "false" → "calm" en c34).

Para regenerar (cuando Flow esté libre): `python -I clips.py c07 c34 c40 > clips_log2.txt` (la versión vieja pasa a clips/old/<id>_v1.mp4; imprime "FIN P1"). Revisar después: c07 y c40 sin palabras repetidas (Whisper por palabra); c34 sin mandil, ya centrado en el fotograma 0.

Fallbacks si vuelven mal:
- c07: quitar 4.48–5.26 (el primer "se vendió,"; corte entre palabras con fundido de 20 ms, sin cortar dentro de ninguna) y tapar el salto de imagen con el arranque de c08 (Aurelio sonriendo antes de hablar, 0–0.7 s). Comprobar con earshot que no se oiga el pegado.
- c34: poner "Con mucho gusto, señorita" (audio 1.24–3.02 del c34 viejo) sobre la cola muda de c33 (Marisol en silencio de 2.34 a 6.0 s) y no mostrar a Evaristo con mandil.
- c40: cortar en 3.22 (fin del primer "cajón") con fundido de 20 ms y pasar a r2 (Aurelio): queda "Apá, tráigame la carpeta del cajón" y se pierde "por favor". Arranque ≥ 0.75.

## Arreglos menores para el montaje
- **Crops de borde** (punch-in solo mientras dura el borde): r1 `540:960:0:0` (0–1.25), c07 `540:960:0:0` (0–2.0) si se usa el viejo, c12 `540:960:0:0` (0–4.0 o todo el clip), c16 `540:960:0:0` (0–2.0), c20 `540:960:180:0` (0–2.0), c27 `540:960:180:0` (0–0.6), c28 `540:960:0:0` (0–1.0), c36 `540:960:180:0` (0–2.5), c39 `540:960:180:0` (0–2.0). Probados limpios en el fotograma 0 y al final de la ventana.
- **Arranques**: c26 ≥ 0.6, c32 = 0.75, c40 ≥ 0.75 (todos antes de la voz).
- **r1–r3**: silenciar el audio (Whisper alucina "SILENCIO" y "¡Suscríbete!").
- Volumen: c26 (−14.8), c42 (−15.0), c28 (−15.3), c18 (−15.8), c39 (−15.9) fuertes; c24 (−25.2), c25 (−24.5), c30 (−24.4), c05/c06 (−24.3) bajos. El loudnorm en dos pasadas de edit.py los empareja.
- Avisos sin acción: Toña NOREF en sus tres planos (c11, c13, c29; coherente entre ellos, distinta de la hoja); "papá" por "apá" en c16 y c22; Cipriano sin bolsas en c04; escoba (c15) y portapapeles (c37/c39/c41) en la otra mano; morral de Toña en el brazo derecho en c13; bolsas tipo marca (c08), etiquetas amarillas (c11, c29), letrero ilegible al fondo (c27) y logo bordado (c32), todo sin texto legible; "empiezan" alargado en c35. La hoja LOC_TIENDITACHUY se parece a la tienda de Evaristo (oscura, con báscula), pero los clips de la tiendita salieron con estantes de pino claros: no se mezclan.
- Whisper escribe "chui"/"Chuy", "Don" con mayúscula y "a Pa" por "apá": es grafía.

## Montaje v1 (renders/v1.mp4, 2026-11-07)
- EDL por frases desde renders/lv3.json (large-v3 + envolvente floor+7; 45 clips), 71 planos, 188.7 s, 720x1280 SAR 1:1. Crops de borde y arranques tardíos aplicados; r1 desde 1.25; c40 v2 con `crop=600:1067:0:0`. Fotograma 0 de cada tramo recortado: bordes limpios.
- −14.2 LUFS, −1.7 dBTP, LRA 2.8. Sincronía exacta por construcción (71 partes con audio = video, total 188.708 s los dos).
- Transcripción large-v3 del render completo = lines.json, sin palabras repetidas ni frases perdidas ("papá" por "apá" en c16, aviso conocido).
- Marca MEXI STORIES arriba a la derecha; música de suspenso audible en los mudos (r1: cuerdas, −23 LUFS, earshot Music 0.50).
