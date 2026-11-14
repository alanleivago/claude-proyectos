# QA clips · casera-recibos Parte 1 (MAJESTIC, 2026-11-07)

Método (el de pedida-mano): hoja de 4 fotogramas por clip (8/35/62/90 %) comparada con chars/ (MARICELA_ORNELAS, CHELO_VALDIVIA, NANCY_GUILLEN, PACHITA_ROBLES, GRACIELA_MONDRAGON, LOC_PATIOCHELO, LOC_COCINACHELO, LOC_SALAPACHITA, LOC_OFIHOSPITAL) y con la geografía fija de clips.py. Tiras del 38 % inferior a 1.5 fps (subtítulos) en los 37 clips. Tiras de cuadro completo a 4 fps (bordes, entradas) en los sospechosos (c02 c03 c05 c06 c08 c09 c11 c12 c13 c16 c21 c22 c24 c25 c26 c28 c29 c32 r1 r4) y fotogramas a 300 px en los dudosos. Recortes probados en el fotograma peor. Además: freezedetect, cortes (scene > 0.3), LUFS y F0 por clip. Audio: faster-whisper large-v3 (es, CPU, int8) contra lines.json (renders/lv3.json), con una segunda decodificación por segmento en c28, c30 y r1–r3. Nada se corrió en Flow.

Resultado general: caras y ropa correctas en todos. Maricela lleva pelo negro lacio a los hombros y suéter azul marino. Chelo, pelo cobrizo corto, bata verde esmeralda con florecitas blancas y cadena dorada. Nancy, pelo rizado castaño, chamarra polar lila y playera blanca. Pachita, chongo blanco, chal rojo tejido y vestido gris. Graciela, bob castaño con mechón gris, blazer gris carbón y blusa blanca.

Nadie lleva sombrero, lentes, uniforme ni gafete. No aparece ningún nacimiento, Niño ni imagen religiosa. Navidad: una sola piñata de estrella y las luces en el patio, y las luces y el ponche en la sala. No hay subtítulos ni texto en pantalla (las 37 tiras inferiores están limpias), ni clips congelados, ni cortes internos. Geografía respetada. Todas las voces son femeninas (F0 177–229 Hz), cada una con su personaje. La transcripción coincide con lines.json en los 33 diálogos, salvo los avisos de c28 y c30. Hay muchos dobles de borde en los primeros 0.3–2 s (patrón de Omni): todos se arreglan con punch-in o con arranque tardío.

| clip | estado | motivo |
|---|---|---|
| c01 | OK (aviso) | Recibo en la mano IZQUIERDA (en c03 lo lleva en la derecha). Voz 0.79–8.63. |
| c02 | OK con crop | Figura gris/blanca en el borde IZQ. 0.0–0.6 s; voz desde 0.53. `crop=540:960:180:0` en 0–0.8 (limpio). |
| c03 | OK con crop | Figura clara en el borde DER. abajo 0.25–1.0 s; voz desde 0.37. `crop=540:960:0:0` en 0–1.1 (limpio). |
| c04 | OK (aviso) | "¿Tres meses aquí…?" sale como pregunta. Voz 0.10–7.00. |
| c05 | OK con recorte | Pelo rizado (doble de Nancy) en el borde IZQ. 0.0–0.3 s; voz desde 0.47: empezar en ≥ 0.4 (o `crop=540:960:180:0` en 0–0.5, limpio). |
| c06 | OK | Voz 0.10–4.88. |
| c07 | OK | Voz 0.39–7.19. |
| c08 | OK con crop | **Persona con camisa a cuadros** en el borde IZQ. 0.0–1.0 s; voz desde 0.28. `crop=540:960:180:0` en 0–1.1 (limpio a 0 y 0.75 s). Brazos cruzados (pedido en el prompt). |
| c09 | OK | Toca la piñata (pedido). Voz 0.92–6.90. |
| c10 | OK | Voz 1.15–6.84. |
| c11 | OK con recorte | **Persona con camisa a cuadros y mano** en el borde IZQ. 0.0–0.6 s; voz desde 2.31: empezar en ≥ 0.75. |
| c12 | OK con crop | Figura blanca en el borde DER. 0.0–0.75 s; voz desde 0.39. `crop=540:960:0:0` en 0–0.9 (limpio). |
| c13 | OK | Voz 0.24–7.57. |
| c14 | OK | Voz 0.84–6.59. |
| c15 | OK | Maletas azul oscuro. Voz 0.96–6.15. −17.0 LUFS (fuerte). |
| c16 | OK con crop | Figura oscura en el borde IZQ. 0.0–0.5 s; voz desde 0.48. `crop=540:960:180:0` en 0–0.6 (limpio). |
| c17 | OK | Jarrito con las dos manos. Voz 1.02–6.48. |
| c18 | OK | Una toma seguida. Voz 0.68–7.18. |
| c19 | OK | Voz 0.37–7.48. |
| c20 | OK | Voz 0.28–5.32. |
| c21 | OK con crop | Hombro azul de otra persona en el borde DER. abajo 0.0–1.0 s; voz desde 0.63. `crop=540:960:0:0` en 0–1.1 (limpio). "¿La que recomiendan…?" sale como pregunta (aviso). |
| c22 | OK con crop | Figura oscura en el borde IZQ. abajo 0.0–0.75 s; voz desde 0.0. `crop=540:960:180:0` en 0–0.9 (limpio). |
| c23 | OK | Voz 0.97–7.19. |
| c24 | OK con crop | Figura clara en el borde DER. 0.0–0.25 s; voz desde 0.0. `crop=540:960:0:0` en 0–0.4 (limpio). Libreta en la mano IZQ. al inicio (aviso). |
| c25 | OK con crop | **Hombro y nuca oscuros (over-the-shoulder)** abajo a la IZQ. 0.0–3.25 s; voz desde 0.28. `crop=540:960:180:0` en 0–3.4 (limpio a 0, 1.5 y 3.0 s). |
| c26 | OK con crop | Cara/hombro de otra persona en el borde DER. 0.0–0.75 s; voz desde 0.14. `crop=540:960:0:0` en 0–0.9 (limpio). |
| c27 | OK | Voz 0.42–5.56. |
| c28 | OK con crop (aviso) | Espalda oscura en el borde DER. 0.0–2.0 s; voz desde 0.8. `crop=540:960:0:0` en 0–2.1 (limpio a 0.25 y 1.5 s). Audio: el clip entero da "¿Lo quieres rentar…?" y el segmento aislado da "¿Lo quiere rentar…?" (dos decodificaciones): escucharlo, pero es dudoso, no un error firme. |
| c29 | OK con crop | Hombro oscuro abajo a la IZQ. 0.0–2.0 s; voz desde 0.5. `crop=540:960:180:0` en 0–2.1 (limpio). |
| c30 | OK (aviso) | Celular en la mano DERECHA. Whisper oye "Vengas el 24" (estable) y en el segmento corto "Venga a celebrar": parece "Véngase el" con las vocales fundidas. Escucharlo. Voz 0.45–6.63. |
| c31 | OK | Celular en la mano DERECHA. Voz 0.28–5.60. |
| c32 | OK (aviso) | Smartphone en la mano IZQUIERDA. Voz 1.25–4.70. |
| r4 | OK con recorte | **Continuidad**: en c32 usa smartphone y aquí un teléfono fijo negro de cable (0–2.5 s). Usar solo desde ≥ 2.75 s (ya colgó; sonrisa de lado). Mudo (−42.7 LUFS): silenciar. |
| c33 | OK | CTA a cámara con jarrito. Voz 0.65–8.48. −15.1 LUFS (fuerte). |
| r1 | OK (regenerado) | Intento 1 del 2026-11-07 (el viejo en clips/old/r1_v1.mp4). Nancy quieta junto a la mesa desde el fotograma 0 (tira a 4 fps y caras a 0/1.25/2.5/3.75/5/5.8 s): labios cerrados todo el clip, sin entrar caminando, bordes limpios, push-in lento. Audio −59.7 LUFS (mudo); large-v3 solo alucina "Gracias por ver el video" sobre el silencio. Silenciar. En v1: 1.0–2.5 s. |
| r2 | OK | Mudo (alucina "¡Suscríbete!" a −44.6 LUFS): silenciar. |
| r3 | OK | Mudo (alucina "SILENCIO" a −36.8 LUFS): silenciar. |

## REGENERAR
Nada. r1 se regeneró (intento 1) y pasó la revisión; el fallback no hizo falta.

## Arreglos menores para el montaje
- **Crops de borde** (punch-in solo mientras dura el borde; todos probados limpios):
  - `540:960:180:0`: c02 (0–0.8), c08 (0–1.1), c16 (0–0.6), c22 (0–0.9), c25 (0–3.4), c29 (0–2.1).
  - `540:960:0:0`: c03 (0–1.1), c12 (0–0.9), c21 (0–1.1), c24 (0–0.4), c26 (0–0.9), c28 (0–2.1).
- **Arranques**: c05 ≥ 0.4, c11 ≥ 0.75 y r4 ≥ 2.75 s (todos antes de la voz; r4 es mudo).
- **r1–r4**: silenciar el audio (r1 nuevo es mudo; r2 y r3 alucinan "¡Suscríbete!" y "SILENCIO").
- Volumen: c33 (−15.1), c15 y c30 (−17.0), c10 (−17.4) y c03 (−17.5) están fuertes; c13 (−23.8), c11 (−23.7), c14 (−23.5), c08 (−23.2) y c09 (−23.3) están bajos. El loudnorm en dos pasadas de edit.py los empareja.
- Avisos sin acción:
  - El recibo cambia de mano (izquierda en c01, derecha en c03).
  - En c24 la libreta empieza en la mano izquierda; en c32 el smartphone va en la mano izquierda.
  - c04 y c21 salen con entonación de pregunta.
  - c28 y c30 escuchados en el montaje (renders/v1.mp4, large-v3 sobre la mezcla): se oye "¿Lo quiere rentar para Nochebuena?" y "Véngase el 24 a la hora de la posada", como en lines.json. No se recorta nada (además ninguna de las dos palabras cae en límite de frase).
  - La puerta del patio queda a un lado distinto según el plano (c02 contra c04).
- Whisper escribe "Marisela" con s, cifras ("15", "24") y "Doña" con mayúscula: es grafía.
