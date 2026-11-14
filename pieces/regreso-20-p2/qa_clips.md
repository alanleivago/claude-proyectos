# QA clips · regreso-20-p2 (El Regreso · Parte 2, VISTA STORIES, 2026-11-07)

Método (el de pedida-mano): hoja de 4 fotogramas por clip (8/35/62/90 %) comparada con chars/ (CLEMENCIA, LEONOR, JOAQUIN, BERNARDO, LOC_ADOBE, LOC_TEJABAN), con la geografía fija de clips.py y con fotogramas de la Parte 1 (regreso-20 c05, c10, c12, c15, c20, c25, c28, c30). Tiras del 38 % inferior a 1.5 fps (subtítulos) y de cuadro completo a 4 fps (bordes, entradas) en los 32 clips. En los dudosos, fotogramas a 180 px cada 0.25 s (0–2.25 s) y cada 0.5 s (2–6 s); recortes probados en el fotograma 0 y dentro del tramo. freezedetect + cortes (scene > 0.3) + LUFS + F0 por clip (earshot en c13). Audio: faster-whisper large-v3 (es, CPU, int8) contra lines.json → renders/lv3.json. Nada se corrió en Flow.

Resultado general: caras y ropa correctas en todos y continuas con la Parte 1 (Leonor: cola baja, playera verde azulado, mandil beige. Clemencia: chongo gris, vestido verde con florecitas, mandil gris con encaje, aretitos. Joaquín: bigote negro, camisa a cuadros roja y café, jeans, cinturón café. Bernardo: pelo gris peinado hacia atrás, bigote gris, guayabera beige, pantalón caqui). Nadie lleva sombrero. Nadie señala con el dedo. Ningún subtítulo ni texto en pantalla: tiras inferiores limpias en los 32. Ningún clip congelado ni con cortes internos. Hay una sola hoja (c03, c15; en i1 la hoja doblada se abre, es una sola) y una sola maleta (r1, c13, c22, r2). Hay un solo retrato sepia en la cocina y está quieto. r2: Joaquín solo, de espaldas, con la maleta y sin nadie en el portal. Geografía bien: en la cocina la puerta queda a la IZQ. con Leonor y la ventana a la DER. con Bernardo sentado; en el portal están los postes y la cerca. Voces: hombres 103–118 Hz (Bernardo); Joaquín 155–165 Hz (c13 earshot = "Male speech"; suena enojado y masculino). Mujeres 180–242 Hz, cada una con su personaje. La transcripción coincide con lines.json en los 29 diálogos salvo c13 (repetición) y c22 ("Allá ustedes", que es el reemplazo SOFT del intento 2 y suena natural).

| clip | estado | motivo |
|---|---|---|
| c01 | OK | Marco de la puerta en el borde IZQ. (escenografía). Voz 1.64–6.57. |
| c02 | OK | Voz 0.54–7.36. |
| c03 | OK | Una sola hoja en las manos. Voz 0.22–7.17. |
| i1 | **FUERA (fallback)** | v2 (regenerado, intento 1; v1 en clips/old): mangas beige de guayabera, sin cuadros, OK; pero al abrir la carta (≥ 2.3 s) aparece una 2.ª hoja debajo y hay papeles al fondo de la mesa. Mudo (Whisper: "Música"). Fallback: no se usa, c03 → c04 directo. |
| c04 | OK con crop | Manga blanca en el borde DER. de 0.0 a ~0.6 s; voz desde 0.42. `crop=540:960:0:0` en 0–0.7 (limpio). |
| c05 | OK con crop | Figura oscura con algo rojo abajo a la IZQ. de 0.0 a ~1.3 s; voz desde 1.20. `crop=540:960:180:0` en 0–1.4 (limpio a 0 y 1.0 s). −24.7 LUFS (bajo). |
| c06 | OK | Voz 0.35–6.05. |
| c07 | OK | Voz 1.05–7.21. |
| c08 | OK con crop | **Nuca oscura en el borde IZQ. y manga a cuadros con una mano abajo a la IZQ.**, de 0.0 a ~2.2 s; voz desde 0.53. `crop=540:960:150:0` en 0–2.3 (limpio a 0, 1.0 y 2.0 s). Bernardo mira casi a cámara (aviso). |
| c09 | OK con crop | Hombro con camisa a cuadros azul y blanca en el borde DER. de 0.0 a ~2.0 s; voz desde 0.48. `crop=540:960:0:0` en 0–2.1 (limpio a 0, 1.0 y 1.8 s). |
| c10 | OK con crop | Figura oscura a cuadros en el borde IZQ. de 0.0 a ~2.4 s; voz desde 0.24. `crop=540:960:180:0` en 0–2.5 (limpio a 0, 1.2 y 2.2 s). |
| c11 | OK | Voz 0.89–3.15. −16.7 LUFS (fuerte). |
| c12 | OK con crop | Pelo oscuro largo (nuca) en el borde IZQ. de 0.0 a ~2.5 s; voz desde 0.78. `crop=540:960:180:0` en 0–2.6 (limpio a 0, 1.2 y 2.2 s). |
| r1 | OK con recorte | Figura con camisa a cuadros azul y blanca en el borde IZQ. de 0.0 a ~2.0 s. Mudo (alucina "SIGUE VIVIENDO"): empezar en ≥ 2.0 y silenciar. Una sola maleta. |
| c13 | OK (v2) | Regenerado (intento 1; v1 en clips/old). large-v3: "A ver, don Bernardo, ¿qué firma falta?" 1.53–4.31 \| "Por su culpa nos regresamos a medio camino." 5.05–6.89, sin repetición. Voz masculina (earshot: Male speech / a man shouting). Una sola maleta. Figura blanca en el borde IZQ. de 0.0 a ~0.5 s: entra en 1.45 (limpio). −22.5 LUFS. |
| c14 | OK con crop | Figura blanca en el borde DER. de 0.0 a ~0.9 s; voz desde 0.65. `crop=540:960:0:0` en 0–1.0 (limpio a 0 y 0.6 s). −17.8 LUFS. |
| c15 | OK con recorte | Hombro verde azulado (otra Leonor) en el borde IZQ. de ~0.25 a ~0.8 s; voz desde 1.50: empezar en ≥ 0.9. Una sola hoja. |
| c16 | OK con crop | Figura blanca en el borde IZQ. de 0.0 a ~0.6 s; voz desde 0.48. `crop=540:960:180:0` en 0–0.7 (limpio). |
| c17 | OK con crop | Hombro a cuadros (Joaquín) en el borde DER. de 0.0 a ~2.0 s; voz desde 0.68. `crop=540:960:0:0` en 0–2.1 (limpio a 0, 1.0 y 1.8 s). |
| c18 | OK | Brazos cruzados. Voz 1.27–6.07. |
| c19 | OK con crop | Figura blanca en el borde DER. de 0.0 a ~1.4 s; voz desde 1.44. `crop=540:960:0:0` en 0–1.5 (limpio), o empezar en 1.4. |
| c20 | OK | "¿Entonces no hay rancho, jefecita?" sale casi afirmativo (aviso). Voz 0.67–5.05. −17.4 LUFS. |
| c21 | OK | Voz 1.00–5.19. |
| c22 | OK con crop | Figura blanca en el borde IZQ. (y un borde claro a la DER. a 0.25 s) de 0.0 a ~1.0 s; voz desde 0.92. `crop=540:960:90:0` en 0–1.1 (limpio a 0 y 0.5 s). Dice "Allá ustedes" (SOFT del intento 2) en vez de "Arréglense ustedes" (aviso). No toca la maleta. |
| r2 | OK | Mudo (alucina "Gracias por ver el video"): silenciar. |
| c23 | OK | Manos abiertas y bajas. Voz 1.10–5.05. |
| c24 | OK con recorte | Figura entre los postes en el borde IZQ. de 0.0 a ~1.1 s; voz desde 1.55: empezar en ≥ 1.2. |
| c25 | OK | Voz 1.20–3.57. |
| c26 | OK con crop | Figura oscura azul en el borde IZQ. (y a la DER. a 0.25 s) de 0.0 a ~0.6 s; voz desde 0.64: empezar en 0.6 o `crop=540:960:90:0` en 0–0.7 (limpio). |
| c27 | OK con crop | **Figura blanca en el borde DER. de 0.0 a ~3.5 s**; voz desde 0.98. `crop=540:960:0:0` en 0–3.6 (limpio a 0, 1.5 y 3.0 s). −17.9 LUFS. |
| c28 | OK | Las dos frases salen juntas ("Gracias, don Bernardo, por cumplirle a mi papá"). Voz 0.96–4.36. |
| c29 | OK | CTA a cámara con voz desde 0.64, asiente, sonríe y hace gestos con la mano abierta. Voz 0.64–8.50. −17.2 LUFS. |

## REGENERAR (resuelto 2026-11-07: c13 v2 OK; i1 v2 con 2.ª hoja → fallback, fuera del montaje)
- **c13**: repite "por su culpa nos regresamos".
- **i1**: mangas de franela a cuadros gris oscuro en vez de la guayabera beige de Bernardo.

Cambios en clips.py (solo c13 e i1; se mantienen STYLE, VOICE, NOSUB, CLEAN, END, ONE/ALONE/NODOUBLE con gaze, LETTER/BAG/NOPROP, SAFE, SOFT con \b, variant, NOREF, STYLES, TRIES=6, las pausas y el gatito de control):
- c13: el tono pasa de "impatient, annoyed, fast" a "impatient, annoyed, clear and unhurried, every word said only once, no repeated phrase".
- i1: "the hands of @{BERNARDO}, an older man wearing a light beige linen long-sleeve guayabera shirt, only the light beige cuffs and sleeves visible (no plaid, no flannel, no dark sleeves)" + "no second sheet under it". Con NOREF (intento 5) queda "an older Mexican rancher" y la guayabera sigue descrita.

Probado en seco: se importó clips.py, siguen los 32 clips y se armaron las variantes 0, 1, 4 y 5 de c13 e i1. No se generó nada.

Para regenerar (cuando Flow esté libre): `python -I clips.py c13 i1 > clips_log2.txt` (Monitor sobre "^FIN P2"). Revisar después: c13 sin frase repetida y con la voz masculina; i1 con mangas beige y una sola hoja.

Fallbacks si vuelven mal:
- c13: quitar 2.90–4.68 s (el primer "Por su culpa nos regresamos,"). Los dos cortes caen en silencio: 2.0–2.98 está a −62 dB y 4.64–4.70 a −61 dB. Queda "¿Qué firma falta? … Por su culpa nos regresamos a medio camino". El salto de imagen se tapa con r1 (de ≥ 2.0) o con una reacción de Bernardo (c14 antes de la voz).
- i1: no usarlo. c03 ya muestra la hoja en las manos de Bernardo; montar c03 → c04 directo.

## Arreglos menores para el montaje
- **Crops de borde** (punch-in solo mientras dura el borde; todos probados limpios): c04 `540:960:0:0` (0–0.7), c05 `540:960:180:0` (0–1.4), c08 `540:960:150:0` (0–2.3), c09 `540:960:0:0` (0–2.1), c10 `540:960:180:0` (0–2.5), c12 `540:960:180:0` (0–2.6), c14 `540:960:0:0` (0–1.0), c16 `540:960:180:0` (0–0.7), c17 `540:960:0:0` (0–2.1), c19 `540:960:0:0` (0–1.5), c22 `540:960:90:0` (0–1.1), c26 `540:960:90:0` (0–0.7), c27 `540:960:0:0` (0–3.6).
- **Arranques** (antes de la voz): r1 ≥ 2.0, c15 ≥ 0.9, c24 ≥ 1.2 (c19 = 1.4 y c26 = 0.6 sirven como alternativa al crop).
- **i1, r1, r2**: silenciar el audio. Whisper alucina "¡SUSCRÍBETE!", "SIGUE VIVIENDO" y "Gracias por ver el video" (−42 a −45 LUFS).
- Volumen: c11 (−16.7), c29 (−17.2), c20 (−17.4), c14 (−17.8) y c27 (−17.9) están fuertes. c05 (−24.7), c22 (−24.6) y c18 (−24.2) están bajos. El loudnorm de edit.py los empareja.
- Avisos sin acción: en la cocina el mandil de Leonor sale más blanco que en el portal y en la Parte 1. c08: Bernardo mira casi a cámara. c20: la pregunta sale casi afirmativa. c22 dice "Allá ustedes".
- Whisper escribe "20" en cifras y cambia algunos signos de puntuación: es solo grafía.


## Montaje v1 (2026-11-07)
edit.py por frases desde renders/lv3.json (large-v3, c13 v2 incluido); ganancias de renders/lufs.txt. i1 fuera. Camas: tensión 0–c09, cálida c09–r1, tensión r1–c23 (antes empezaba en c13 y la cálida sonaba sobre la llegada de Joaquín), cálida c23–fin. `at()` ahora mide el stream de video (los .mov sumaban ~0.02 s por plano y corrían las camas hasta ~0.9 s). renders/v1.mp4: 137.6 s, −14.1 LUFS, −1.7 dBTP; transcripción completa = lines.json (c22 "Allá ustedes").
