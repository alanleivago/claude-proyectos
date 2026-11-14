# QA clips · masa-honrada Parte 1 (SIN MARCA, 2026-11-07)

Método (el de pedida-mano): hoja de 4 fotogramas por clip (8/35/62/90 %) comparada con chars/ (LUPE_OLVERA, YESENIA_BARRAGAN, RIGO_MOLINERO, CHAYO_ZAMUDIO, ABUNDIO_ZAMUDIO, TONA_VECINA, LOC_PUESTOYESE, LOC_COMALLUPE, LOC_PATIOZAMUDIO) y con la geografía fija de clips.py. Tiras del 38 % inferior a 1.5 fps (subtítulos) y de cuadro completo a 4 fps (bordes, entradas, dobles) en los 39 clips; fotogramas a 200 px cada 0.25 s en los dudosos; recortes probados en el fotograma 0 (el peor) y a 0.5–1.25 s. freezedetect + cortes (scene > 0.3) + LUFS por clip. Audio: faster-whisper large-v3 (es, CPU, int8) sobre el WAV cargado con numpy, contra lines.json, más F0 por clip (y earshot en c04); segunda decodificación (beam 1 / beam 5 t=0.2) en c06, c19, c27 y c34. Nada se corrió en Flow.

Resultado general: caras y ropa correctas en todos (Lupe: trenza gris, blusa amarilla pálida, mandil granate. Yesenia: chongo vino, blusa turquesa, mandil gris. Rigo: bigote, playera verde olivo, mandil azul marino. Chayo: pelo negro ondulado, blusa coral, pantalón azul. Abundio: pelo gris, barba gris, camisa de cuadros azul. Toña: pelo corto rizado entrecano, cárdigan mostaza, blusa blanca). c28 salió en el intento 5 (NOREF, sin hoja) y aun así coincide con Yesenia. Nadie con sombrero, gorra, red ni lentes; nadie señala con el dedo; sin armas ni extremidades de más. Ningún subtítulo ni texto en la franja inferior (tiras limpias en los 39). Ningún clip congelado ni con cortes internos. Utilería: un solo costal blanco sin letras (c03), tina azul con maíz (c31), tortillas que se rompen bien (c15, r3). Geografía respetada (puesto: Yesenia DER. tras su mesa, Rigo/Chayo IZQ.; carrito: Lupe IZQ., Toña/Chayo/Yesenia DER.; patio de noche con foco: Chayo IZQ., Abundio DER.). Voces: hombres 134–160 Hz (Rigo y Abundio; c04 160 Hz pero earshot = "a man speaking" z 3.6 vs mujer 2.5), mujeres 186–278 Hz, cada una con su personaje. Transcripción = lines.json en los 34 diálogos salvo c27 y c34.

| clip | estado | motivo |
|---|---|---|
| c01 | OK | Voz 0.98–9.30. |
| c02 | OK | Voz 0.00–6.54. |
| c03 | OK (aviso) | Dice "harina **barata**" (lo cambió SOFT en el 2.º intento, esperado). Un costal blanco sin letras. Voz 0.88–6.68. |
| c04 | OK con recorte | Manga verde olivo (doble de Rigo) en el borde DER. de 0.0 a ~1.0 s; voz desde 1.28: empezar en ≥ 1.1. |
| c05 | OK | Voz 0.62–6.20. |
| r1 | OK | Mudo (−44.7 LUFS, alucina "¡Hu, hu, hu!"): silenciar. |
| c06 | OK (aviso) | Placa azul con número de casa ("1457…") arriba a la DER. de 0 a ~3 s (pequeña; opcional `crop=600:1067:120:213` en 0–3). "allá" se oye "ya" (yeísmo, estable en dos decodificaciones). Voz 0.82–6.12. |
| c07 | OK | Voltea tortillas en el comal. Voz 0.72–7.00. |
| c08 | OK | Voz 0.00–4.12. |
| c09 | OK | Saluda con la mano abierta (no señala). Voz 0.00–5.94. −14.4 LUFS (fuerte). |
| c10 | OK | Voz 0.00–6.32. |
| c11 | OK | Voz 0.00–4.04. |
| r2 | OK con recorte | **Doble de Lupe** (trenza gris, blusa amarilla, mandil granate) cruza al fondo DER. de ~1.5 a 3.0 s ("watches someone walk away"). Usar 3.25–6.0 (o 0–1.4). Mudo (alucina "Gracias por ver el video"): silenciar. |
| c12 | OK | Voz 0.00–7.40. |
| c13 | OK | Se acerca la tortilla a la nariz (~2.0–2.8 s). Voz 0.00–5.02. −23.8 LUFS (bajo). |
| c14 | OK | Voz 0.00–4.64. |
| c15 | OK | La tortilla se desmorona en el plato. Voz 1.08–6.34. |
| c16 | OK (aviso) | Tortilla en las dos manos / la IZQUIERDA. Voz 0.86–5.84. |
| r3 | OK | Mudo (alucina "¡SUSCRIBETE!" a −29.0 LUFS): silenciar. |
| c17 | OK con crop | Brazo/figura en el borde DER. de 0.0 a ~1.3 s; voz desde 0.68. `crop=540:960:0:0` en 0–1.5 (limpio a 0 y 1.0 s). Tortilla en la mano IZQUIERDA (aviso). |
| c18 | OK | Voz 0.00–4.10. |
| c19 | OK (aviso) | Bolsas lilas al fondo DER. sobre la mesa (sin letras legibles). Voz 0.92–8.36. |
| c20 | OK (aviso) | Mesa con mantel floreado y tortillas abajo a la IZQ. de 0 a ~2.2 s (utilería de más, no es persona). Voz 0.00–5.04. |
| c21 | OK (aviso) | **Celular en la mano IZQUIERDA**, pantalla hacia ella (no se ve). Sin hflip: voltearía la geografía (Chayo va a la IZQ. en el puesto). Voz 0.42–4.18. |
| c22 | OK | Voz 0.64–6.88. |
| c23 | OK | Mano en el pecho. Voz 0.82–6.96. |
| c24 | OK con crop | Brazo en el borde DER. de 0.0 a ~1.3 s; voz desde 0.00. `crop=600:1067:0:0` en 0–1.5 (limpio a 0 y 1.25 s). |
| c25 | OK con recorte | Brazo con manga verde olivo (doble de Rigo) en el borde DER. de 0.0 a ~1.0 s; voz desde 1.20: empezar en ≥ 1.05 (o `crop=540:960:0:160` en 0–1.1, probado limpio). |
| c26 | OK | Brazos cruzados. Voz 0.00–4.70. |
| c27 | OK (regenerado 07-11) | v2: large-v3 (beam 5) "Se lo dije, patrona. La gente de aquí no es tonta. \| Hasta aquí llego." = lines.json, sin repetición. Manos quietas sobre la mesa todo el clip; tira a 4 fps sin hombro verde ni nadie en los bordes (a la DER. solo tinas amarillas). Voz 0.56–4.02 y 5.23–5.99. La v1 queda en clips/old/c27_v1.mp4. |
| r4 | OK | Mudo (−35.4 LUFS, alucina "¡Gracias por ver el video!"): silenciar. |
| c28 | OK | Intento 5 (NOREF) pero cara, chongo vino, blusa turquesa y mandil gris = Yesenia. Voz 0.00–6.58. −22.2 LUFS. |
| c29 | OK | Voz 0.00–6.28. |
| c30 | OK con recorte | Camisa a cuadros (figura) en el borde IZQ. de 0.0 a ~0.4 s; voz desde 1.02: empezar en ≥ 0.5 (o `crop=600:1067:120:0`, probado limpio). |
| c31 | OK | Tina azul con maíz; voz 0.94–6.78. |
| c32 | OK con crop | Cabeza oscura en el borde IZQ. de 0.0 a ~0.5 s; voz desde 0.00. `crop=600:1067:120:0` en 0–0.6 (limpio a 0 y 0.5 s). |
| c33 | OK | Voz 0.88–5.76. |
| r5 | OK | Mudo (−41.9 LUFS, alucina "¡Gracias por ver el video!"): silenciar. |
| c34 | OK (regenerado 07-11, intento 3) | v2: large-v3 "¿Ustedes creen que Yesenia de veras cambió o me quiere ganar otra vez? \| Síganme para ver la segunda parte y denle me gusta." = lines.json, sin frases inventadas. Tira a 4 fps: Lupe sola, bordes limpios, sin texto. Trenza otra vez sobre su hombro IZQUIERDO (aviso, igual que en el resto de planos de Lupe no importa). Voz 0.42–4.77 y 5.48–8.62. La v1 queda en clips/old/c34_v1.mp4. |

## REGENERAR (hecho 07-11: c27 y c34 v2 OK, no hacen falta los fallbacks)
- ~~**c27**: repite "la gente de aquí" + doble de Rigo (hombro verde olivo) en el borde DER.~~ v2 OK.
- ~~**c34**: CTA con una frase inventada en lugar de las dos líneas de lines.json.~~ v2 OK (intento 3).

Cambios en clips.py (solo c27 y c34; se mantienen STYLE, VOICE, NOSUB, CLEAN, END, ONE/ALONE con gaze, NODOUBLE, SAFE, SOFT con \b, variant, NOREF, STYLES, TRIES=6, las pausas y el gatito de control):
- c27: acción "both hands resting still on the steel table the whole time" desde el 1.er intento (sin desatarse el mandil); `NODOUBLE("man in an olive green t-shirt or navy apron, no green sleeve or shoulder")`; tono "calm, firm, tired, steady and clear, no stutter, every word said once, he never repeats a phrase".
- c34: "her grey braid over her RIGHT shoulder" + "She says only the two Spanish lines quoted below, word for word, about Yesenia and the second part, and no other words or phrases."; tono "…, exactly the quoted words".

Probado en seco en una copia con gen falso: con los IDs, la versión anterior pasa a `clips/old/<id>_v1.mp4`, el resto no se toca, los prompts llevan los cambios e imprime "FIN P1".

Para regenerar (cuando Flow esté libre): `python -I clips.py c27 c34 > clips_log2.txt`. Revisar después: c27 sin frase repetida y sin hombro verde en los bordes; c34 transcripción = lines.json y trenza a la DER.

Fallbacks si vuelven mal:
- c27: quitar 2.30–3.64 s (el primer "La gente de aquí,"; pausas a ambos lados: "patrona." termina en 2.16, "la" empieza en 3.70) y tapar el salto con un plano de reacción de Yesenia (r4 o c26 mudo); más `crop=600:1067:0:0` en 0–1.5 (probado limpio a 0 y 1.25 s).
- c34: no se arregla en montaje (la voz dice otra cosa). Cerrar con r5 (Lupe, mirada cómplice) y el CTA como tarjeta de texto + voz en off de Lupe sin labios a cámara.

## Arreglos menores para el montaje
- **Crops de borde** (punch-in solo mientras dura el borde): c17 `540:960:0:0` (0–1.5), c24 `600:1067:0:0` (0–1.5), c32 `600:1067:120:0` (0–0.6). Probados limpios en el fotograma 0.
- **Arranques**: c04 ≥ 1.1, c25 ≥ 1.05, c30 ≥ 0.5 s (todos antes de la voz).
- **r2**: usar 3.25–6.0 (el doble de Lupe cruza de 1.5 a 3.0 s).
- **r1–r5**: silenciar el audio (Whisper alucina "¡Hu, hu, hu!", "Gracias por ver el video", "¡SUSCRIBETE!"; r3 a −29 LUFS).
- Volumen: c09 (−14.4), c05 (−16.0) fuertes; c13 (−23.8), c28 (−22.2), c18 (−21.9) bajos. El loudnorm en dos pasadas de edit.py los empareja.
- Avisos sin acción: c03 "harina barata" (SOFT); c06 placa con número y "allá"→"ya"; c16/c17 tortilla en la mano IZQ.; c21 celular en la mano IZQ. (sin hflip por geografía); c19 bolsas lilas; c20 mesa con mantel floreado.
- Whisper cambia puntos suspensivos por comas y escribe "Doña" con mayúscula: es grafía.
