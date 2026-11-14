# QA clips · fonda-chela Parte 1 (El Jefe Nuevo, VISTA, 2026-11-07)

Método (el de pedida-mano): hoja de 4 fotogramas por clip (8/35/62/90 %) comparada con chars/ (CHELA_VILLEGAS, TAVO_VILLEGAS2, SAUL_BETANCOURT2, ROLANDO_ALCOCER, MACARIO_LEDESMA2, LOC_FONDACHELA, LOC_CALLEFONDA) y con la geografía fija de clips.py, más hojas de caras a tamaño grande hoja contra clip. Tiras del 38 % inferior a 1.5 fps (subtítulos) y de cuadro completo a 4 fps (bordes, entradas, dobles) en los 48 clips; fotogramas cada 0.25 s en los dudosos; recortes probados en el fotograma 0 y a lo largo del borde. Los 48 decodifican sin errores (ffmpeg -f null), todos 720x1280. LUFS por clip y F0 por clip. Audio: faster-whisper large-v3 (es, CPU, int8) → renders/lv3.json, contra lines.json. Nada se corrió en Flow.

**Hoja mala:** chars/ROLANDO_ALCOCER.jpg NO es el Güero: es otro Saúl (pelo negro engominado, barba, traje gris). Por eso c06 y c22 salieron con un Saúl repetido. c19 salió bien (rubio, chamarra de piel) porque ganó el texto del prompt. Antes de otra tanda con el Güero hay que rehacer esa hoja (make_sheets.py, ROLANDO_ALCOCER2: rubio rapado, sin barba, chamarra de piel negra) y revisarla. Mientras tanto, c06/c22 van sin esa hoja (ver cambios).

**Clips sin hoja (log: "intento 5" = variante NOREF):** c01, c02, c08, c15, c28 y c29 se generaron sin ninguna imagen de referencia. c01, c02 y c15 coinciden con las hojas; c08, c28 y c29 no.

**Chela en c01, c02, c03 y r1 (generados sin la hoja de Chela en el proyecto):** solo c02 tiene a Chela. Coincide con CHELA_VILLEGAS.jpg: pelo gris en chongo bajo, aretes chicos dorados, blusa lila, mandil blanco, sin sombrero ni lentes. La cara es la misma que en c04, c13 y c30. Se queda (OK). c01 y c03 (Saúl) y r1 (Tavo, camisa blanca con cuello y bolsa, igual que la hoja) también coinciden.

Resultado general: no hay subtítulos ni texto en las tiras inferiores de los 48. Nadie lleva armas, sangre ni uniformes: los escoltas de i03 van de traje negro con lentes oscuros y las manos cruzadas. Solo Macario lleva sombrero. Un solo jarro por plano y el maletín de i07 siempre cerrado. Las voces van con su personaje: Chela 193–231 Hz (femenina) y los hombres 96–145 Hz. Ningún tartamudeo ni frase repetida. Cambios de texto: c15 inventa "dólares"; c01 y c29 dicen la variante SOFT prevista ("Y luego, cada semana", "Ve trayendo el maletín"). Los mudos alucinan "Gracias por ver el video", "¡Suscríbete!" y "¡Vamos a ver!", así que hay que silenciarlos.

| clip | estado | motivo |
|---|---|---|
| i01 | OK con recorte | Calle vacía hasta ~1.2 s; las camionetas entran después. EDL (0.3, 1.3) muestra casi solo calle: usar (1.3, 2.3). Silenciar (alucina). |
| c01 | OK | Sin hoja (intento 5) pero Saúl coincide. Voz 1.24–6.09 ("Y luego, cada semana", variante SOFT). |
| i02 | OK | Mano con manga de piel en el hombro de la camisa blanca. Silenciar. |
| c02 | OK | **Chela coincide con la hoja** (generado sin hoja). Voz 0.38–3.75. |
| c03 | OK | Voz 0.23–4.73. |
| r1 | OK con recorte | Figura clara en el borde IZQ. de 0.0 a ~1.0 s; la EDL ya empieza en 1.25. Mudo (−46.9 LUFS): silenciar. |
| c04 | OK | Voz 1.32–6.07. |
| c05 | OK con recorte | Sombra oscura en el borde IZQ. de 0.0 a 0.25 s; voz desde 0.63: empezar en ≥ 0.4. Mano abierta en ~1.0–1.5 s, sin señalar. |
| c06 | OK (regenerado, intento 1) | Güero = hoja nueva ROLANDO_GUERO2: rubio decolorado, piel morena, chivo, chamarra de piel negra, playera negra (la cicatriz de la ceja no se distingue a este tamaño). Sombra oscura abajo a la IZQ. de 0.0 a ~1.0 s; la EDL entra en 1.05. large-v3: "Le cerramos la fonda, jefe." (sale afirmativa) \| "Los muchachos ya están afuera." 1.13–4.47. |
| i03 | OK con recorte | Fundido o morph calle→escoltas de 0.0 a ~1.4 s (figuras fantasma). EDL (1.0, 2.5): usar (1.5, 3.0). Silenciar. |
| c07 | OK | Sirve de la olla grande a un jarro. Voz 1.03–6.06. −17.8 LUFS. |
| c08 | OK con crop (regenerado, intento 5 sin hoja) | Cara, pelo engominado y barba = Saúl de c03/c05/c10 y de la hoja; saco gris oscuro con textura, algo más claro que en c03 por la luz (aviso). Pizarrón con letras arriba a la DER. y cartel arriba al centro: `crop=540:960:60:60` en todo el tramo (el pizarrón queda fuera). Sombra arriba a la IZQ. 0–0.25 s (fuera de la EDL). Voz 1.87–3.12 \| 4.35–5.90, texto = lines.json. |
| c09 | OK | Voz 0.60–4.88. |
| c10 | OK con crop | Sombra en el borde IZQ. de 0.0 a ~0.3 s; voz desde 0.11. `crop=540:960:180:0` en 0–0.4 (probado limpio). |
| c11 | OK | Voz 0.39–5.32. |
| i04 | OK | Mano con anillo junto a los chilaquiles, sin taza. Silenciar. |
| c12 | OK (regenerado, intento 2) | Tavo con camisa blanca de manga corta, cuello y bolsa = hoja y r1. Sigue diciendo "¿está**s** segura?" (aviso). Voz 1.23–2.98 \| 3.78–5.08. |
| c13 | OK | Voz 0.10–4.11. |
| c14 | OK | Jarro en la mano. Voz 0.78–5.28. −16.9 LUFS (fuerte). |
| r2 | OK | Mudo (−39.1): silenciar. |
| c15 | OK con corte de audio | Sin hoja (intento 5) pero Saúl coincide. **Inventa "dólares"**: "Cinco mil dólares a la semana". Arreglo verificado con large-v3: quitar el audio 3.20–3.44 (crossfade 10 ms) → "Cinco mil a la semana". Tapar el salto de imagen con un plano mudo de Macario (r2) como cutaway. Las variantes 3.21–3.48 ("mils") y 3.18–3.40 también pasan; usar 3.20–3.44. |
| c16 | OK con crop | **Hombro y mano de alguien de camisa blanca** en primer plano abajo a la IZQ. casi todo el clip; voz desde 2.20. `crop=540:960:180:0` en **todo** el clip (probado limpio a 0, 1.5, 2.5, 4, 6 y 7.5 s). |
| c17 | OK con cutaway | **Doble de traje oscuro** a la derecha de Saúl de 0.0 a ~1.4 s (se funde con él); voz desde 1.25. No se arregla con crop (están pegados). Poner audio de c17 desde 1.17 y cubrir la imagen hasta 1.5 con un plano mudo de Macario (r2 o la parte muda de c18), o empezar la imagen en 1.5 como J-cut. |
| c18 | OK | Voz 0.68–3.76. |
| i05 | OK | Una segunda mano entra por la DER. de ~2.5 a 3.0 s; la EDL (1.0, 2.5) no llega a esa parte. Silenciar (alucina "¡Suscríbete!"). |
| c19 | **PLAN B** (voz sobre otro plano) | El Güero de c19 (cara flaca, barba de días, sin chivo) ya no coincide con el de c06/c22 regenerados con la hoja nueva. Su voz completa (0.88–5.30) va sobre i05 (mano con radio, manga de piel) y i06 (dron con el convoy), sin cara. −24.8 LUFS (+5.5 dB). |
| i06 | OK | Dron: llegan las camionetas. Sin voz (−21.6 LUFS, motores). |
| c20 | OK | Gira hacia la puerta. Voz 1.47–4.63. |
| c21 | OK | Voz 1.40–5.60. |
| c22 | OK (regenerado, intento 1) | Güero = c06 y la hoja nueva (rubio, chivo, chamarra de piel). Limpio en los bordes. Voz 0.59–1.74 \| 2.87–4.21, texto = lines.json. −25.9 LUFS (bajo: +6.5 dB). |
| r3 | OK | Mudo (−46.8): silenciar. |
| c23 | OK con cutaway | Faldón o figura oscura a la IZQ. de Saúl de ~0.25 a 0.9 s (morph al caminar); voz desde 0.31. Cubrir 0–1.0 con un plano mudo de Macario (r2) y dejar el audio de c23 (J-cut). |
| c24 | OK con crop | Hombro de camisa azul abajo a la IZQ. de 0.0 a ~1.25 s; voz desde 0.49. `crop=540:960:180:0` en 0–1.3 (probado limpio). |
| c25 | OK con crop | Forma blanca abajo a la IZQ. de 0.0 a ~0.5 s; voz desde 1.17. Empezar en ≥ 0.75 o `crop=540:960:180:0` en 0–0.6 (probado limpio). Las dos frases salen como una sola pregunta (aviso). |
| c26 | OK (aviso) | Saco gris azulado, más claro que en los demás planos. Voz 0.67–4.33. |
| c27 | OK | Voz 0.53–4.67. |
| c28 | OK (regenerado, intento 5 sin hoja) | Saúl coincide (pelo negro engominado, barba, camisa negra; saco casi negro). Sin pizarrones ni letras; puerta y repisa con ollas a la DER. Voz 0.09–4.56 "Doscientos mil entre todos. Se los devuelvo completos." |
| c29 | OK (regenerado, intento 5 sin hoja; aviso) | Macario: sombrero gris, bigote blanco, guayabera crema, anillo; cara algo más delgada que en c24/c25 pero pasa por el mismo personaje. Puerta a la DER. Toma del jarro. Voz 2.65–4.15 \| 5.10–6.25 (variante SOFT "Ve trayendo el maletín"). |
| i07 | OK | Maletín cerrado junto al jarro; manos con manga de piel. Silenciar. |
| c30 | OK | Voz 0.75–5.24. |
| c31 | OK | Voz 0.88–5.96. |
| c32 | OK | Voz 0.58–4.54. |
| r4 | OK | Mudo (−52.2): silenciar. |
| c33 | OK | Manos abiertas. Voz 0.94–5.53. |
| c34 | OK (regenerado, intento 1) | Tavo **con camisa** blanca con cuello todo el clip (se toca el hombro vestido). Forma blanca en el borde IZQ. 0–0.25 s; la EDL entra en 0.30. Voz 0.38–3.10 \| 3.87–5.22. |
| c35 | OK | Deja el jarro. Voz 0.95–6.47. |
| r5 | OK | Mudo (−43.3): silenciar. |
| c36 | OK | CTA a cámara, sola en el mostrador. Voz 0.83–8.08. |

## Regenerados (clips_log2.txt, 2026-11-07) — revisados
Los 7 se aceptan; ninguno necesitó el plan B. c08, c28 y c29 salieron en el intento 5 (sin hoja, tras 4 rechazos de políticas) pero se compararon cara a cara con SAUL_BETANCOURT2 / MACARIO_LEDESMA2 y con c03/c05/c10 y c24/c25: pasan por el mismo personaje. Versiones viejas en clips/old/*_v1.mp4. large-v3 de los 7 en renders/lv3.json.
- c06, c22: Güero de la hoja nueva ROLANDO_GUERO2.
- c12, c34: Tavo con camisa con cuello.
- c08: crop por el pizarrón con letras. c28: sin letras. c29: puerta a la DER.
- **Consecuencia:** c19 (el Güero viejo) ya no coincide → plan B: su voz sobre i05 + i06.

## Arreglos menores para el montaje
- **Crops de borde** (punch-in solo mientras dura el borde): c10 `540:960:180:0` (0–0.4), c16 `540:960:180:0` (**todo el clip**), c24 `540:960:180:0` (0–1.3), c25 `540:960:180:0` (0–0.6) o arrancar en ≥ 0.75. Probados limpios.
- **Cutaways (J-cut)** por dobles pegados al personaje: c17 imagen desde 1.5 (audio desde 1.17) y c23 imagen desde 1.0 (audio desde 0.23). El hueco se tapa con un plano mudo de Macario (r2, c18 en silencio).
- **c15**: quitar el audio 3.20–3.44 ("dólares") con crossfade de 10 ms y tapar el salto con r2. Verificado con large-v3: "Cinco mil a la semana".
- **Arranques**: c05 ≥ 0.4, r1 ≥ 1.25 (la EDL ya lo tiene).
- **Insertos (EDL)**: i01 (0.3, 1.3) → (1.3, 2.3), para que se vean las camionetas; i03 (1.0, 2.5) → (1.5, 3.0), para saltar el morph; i05 (1.0, 2.5) está bien (la 2.ª mano entra a los 2.5 s).
- **Silenciar** r1–r5 e i01–i05, i07 (Whisper alucina "¡Gracias por ver el video!", "¡Suscríbete!", "¡Vamos a ver!"). i06 tiene motores reales (−21.6 LUFS): ganancia 0 como dice la EDL, o bajito bajo la música.
- Volumen: c14 y c26 (−16.9), c07 (−17.8) fuertes; c19 (−24.8), c05 (−24.4), c28 (−23.9), c02 (−23.8) bajos. El loudnorm por clip de edit.py los empareja.
- Avisos sin acción: anillo de Macario en la mano IZQ. en c24/c25 (en otros planos en la DER.); c19 con barba de días; c26 saco más azulado; c12 dice "¿estás segura?"; c25 dice las dos frases como una sola pregunta.
- Whisper escribe "50,000", "30 años", "200.000" y "chela" en minúscula: es grafía.
