---
type: handoff
status: active
tags: [atrium, novelas, majestic-stories, parte1, historia-original, cocina]
relatedTo: [fierro-herradura, nochebuena, posada]
---
# sazon-concha (El Sazón de Doña Concha · Parte 1, video 21): estado
- Historia ORIGINAL (no navideña) inspirada en `7699705850595659030` ("La despidió después de 30 años, pero su sazón sería su ruina", 1.4M) y en el sabotaje de `7694502933370637590` ("Le saló la comida", 1.8M). Fórmula: humillación en la 1.ª línea ("Este mole huele a fonda de pueblo") → giro de poder (Victoria prueba el mole y Darío no sabe qué lleva) → payoff (Concha vuelve a su cocina y Darío lava cazuelas) → gancho (Maximiliano: "la sal la vas a poner tú").
- Marca: **MAJESTIC STORIES**. Música y marca de agua de pieces/_marcas/MAJESTIC (edit.py, BRAND = "MAJESTIC"); no hay music/ propia.
- Archivos listos:
  - guion.md y caption.txt (formato Parte 1).
  - lines.json: fuente única de clips.py (479 palabras).
  - clips.py, con 36 clips: c01–c31, r1–r4 e i1. Son 240 s hablados en bruto, más 30 s de mudos.
    - Todos los planos con diálogo son de una persona: `gaze(side)` + ONE + ALONE. Nunca "looking at X off-screen".
    - NOSUB y END al final de cada diálogo; NODOUBLE en los planos de riesgo (c01, c03, c12, c17, c28).
    - Una pieza de cada utilería: una cazuela (hoja PROP_CAZUELAMOLE), un plato, un mandil por persona y una cuchara de madera solo en el CTA. Nadie con sombrero ni lentes, sin filipinas ni gorros, sin cuchillos.
    - SAFE/SOFT con \b (incluye las frases fuertes del diálogo: "que nadie la vea", "como si no valiera nada", "va a saber a pura sal"), variant, NOREF (también quita la hoja de la cazuela), TRIES=6, 17 s entre clips y gatito de control.
    - Guarda en clips/, imprime "FIN P1", acepta IDs y mueve la versión vieja a clips/old/.
  - make_sheets.py: 9 hojas nuevas (5 personajes, 3 locaciones y la cazuela) + control md5 DUPLICADO; --reupload. Imprime "FIN HOJAS".
  - phr.py.
  - edit.py: EDL en borrador por índices de línea, ganancia 0 en los mudos, BLACK 0,4 s antes del CTA (c31), cama cálida c25 → c28, loudnorm en dos pasadas, salida renders/v1.mp4.
- Hojas nuevas (aún no generadas; nombres verificados como únicos en pieces/*/chars y en todos los make_sheets.py): CONCEPCION_MOLERA, MAXIMILIANO_GERENTE, DARIO_COCINERO, ANTONIO_LAVALOZA, VICTORIA_LAZCANO, LOC_COCINACASONA, LOC_CALLEJONCASONA, LOC_COMEDORCASONA, PROP_CAZUELAMOLE.
- Nada generado en Flow todavía.
- Siguiente:
  1. `python -I make_sheets.py > sheets_log.txt` (imprime "FIN HOJAS"). Revisar que no haya DUPLICADO, correr `md5sum chars/*.jpg` y armar una hoja de contactos. Cada nombre tiene que ser su persona o lugar y los personajes no se parecen entre sí (Maximiliano lampiño y Darío con barba). Nadie lleva sombrero, lentes, filipina ni gorro, y la cazuela es una sola.
  2. `python -I clips.py > clips_log.txt`, con un Monitor sobre "^FIN P1", Traceback e "intento 6".
  3. QA con hoja de fotogramas y tiras de la franja inferior.
- Revisar en el QA:
  - Geografía: cocina (Concha y la cazuela IZQ., Maximiliano y Darío DER., Toño CENTRO; en el payoff, Victoria DER.), callejón (de tarde Concha IZQ. y Toño DER.; de noche Maximiliano IZQ. y Darío DER.), comedor (Victoria sentada al CENTRO, Maximiliano y Darío DER., Concha y Toño IZQ.).
  - Nadie en los bordes y ningún doble (otro saco vino, otra blusa bordada).
  - Una sola cazuela y siempre la misma; un solo plato; ningún cuchillo; ni menús ni cuadros con letras.
  - El mandil: Concha lo lleva puesto en c01–c06, lo dobla en c07, lo trae en la mano en c09, c11 y c17, y lo vuelve a llevar puesto en c25 y c31.
  - Callejón de noche (c28–c30, r4) oscuro de verdad; el de la tarde (c08–c11), con luz.
  - Subtítulos quemados, frases repetidas, morphs, personajes que entran caminando, manos o utilería que cambian de lado.
- Regenerar con `python -I clips.py <ids> > clips_log2.txt`. Luego `python -I phr.py`, pasar la EDL a rangos (renders/phr.json) y `python -I edit.py`. Verificar (sincronía en 5 puntos, ritmo ≤ 1,9 s, LUFS y pico, marca) y mandar a Telegram con caption.txt.
- Riesgos:
  - c07: doblar el mandil junto a la cazuela (manos y utilería).
  - i1: un solo plato y una sola cuchara.
  - c13: probar con cuchara sin que aparezca un segundo plato.
  - c31: el CTA con gestos y la cuchara de madera.
  - Pronunciación de "Maximiliano", "metate", "aguacate", "comal", "Llévense" y "perdóneme".
- 2026-11-06: c09/c16/i1 regenerados y aprobados en QA (c09 mandil verde en la mano, falda gris oscuro, figura del borde DER. solo hasta ~0.6 s y se arranca en 1.48; c16 sin subtítulos, crop en "Suegra," por una cabeza abajo a la IZQ. hasta ~0.9 s; i1 una sola cuchara). renders/v1.mp4 montado (157.7 s, 85 planos, media 1.9 s, -14.1 LUFS, -1.8 dBTP, sincronía +5 ms en 5 puntos, transcripción completa). Falta: revisión del usuario y Telegram.
