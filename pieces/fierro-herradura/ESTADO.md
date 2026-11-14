---
type: handoff
status: active
tags: [atrium, novelas, vista-stories, parte1, historia-original, feria-ganadera]
relatedTo: [camionero, posada, nochebuena]
---
# fierro-herradura (El Fierro de Herradura · Parte 1, video 20): estado
- Historia ORIGINAL (no navideña) inspirada en `DfIHLMYtKee` (feria ganadera, 6.7M vistas, n.º 1 de fuentes/referencias2/ranking.md). Fórmula: humillación en la 1.ª línea → giro de poder (el libro de fierros) → payoff (Lucero gana) → gancho (la firma de Mauricio).
- Marca: **VISTA STORIES**. Música y marca de agua de pieces/_marcas/VISTA (edit.py, BRAND = "VISTA"); no hay music/ propia.
- Archivos listos:
  - guion.md y caption.txt (formato Parte 1).
  - lines.json: fuente única de clips.py.
  - clips.py, con 35 clips: c01–c30, r1–r3, i1 e i2. Son 244 s hablados en bruto.
    - Todos los planos con diálogo son de una persona: `gaze(side)` + ONE + ALONE. Nunca "looking at X off-screen".
    - NOSUB y END al final de cada diálogo; NODOUBLE en los planos de riesgo.
    - Una pieza de cada utilería: un toro, un libro, un listón, un sombrero por personaje.
    - SAFE/SOFT con \b, variant, NOREF (también quita la hoja del toro), TRIES=6, 17 s entre clips y gatito de control.
    - Guarda en clips/, imprime "FIN P1", acepta IDs y mueve la versión vieja a clips/old/.
  - make_sheets.py: 9 hojas nuevas (5 personajes, 3 locaciones y el toro) + control md5 DUPLICADO; --reupload.
  - phr.py.
  - edit.py: EDL en borrador por índices de línea, ganancia 0 en los mudos, BLACK 0,4 s antes del CTA, camas en c22 y c27, loudnorm en dos pasadas, salida renders/v1.mp4.
- Hojas nuevas (aún no generadas): JACINTA_CORRAL, FULGENCIO_ARREDONDO, CRISTOBAL_ARREDONDO, LEOCADIO_JUEZ, ELOISA_REGISTRO, LOC_CORRALFERIA, LOC_OFICINAASOC, LOC_PISTAFERIA, PROP_TOROLUCERO.
- Nada generado en Flow todavía.
- Siguiente:
  1. `python -I make_sheets.py > sheets_log.txt` (imprime "FIN HOJAS"). Revisar que no haya DUPLICADO, correr `md5sum chars/*.jpg` y armar una hoja de contactos. Cada nombre tiene que ser su persona o lugar, los personajes no se parecen entre sí, cada uno lleva un solo sombrero (Cristóbal y Eloísa sin sombrero) y el toro tiene una sola estrella y un solo fierro.
  2. `python -I clips.py > clips_log.txt`, con un Monitor sobre "^FIN P1", Traceback e "intento 6".
  3. QA con hoja de fotogramas y tiras de la franja inferior.
- Revisar en el QA:
  - Geografía: corral (Jacinta y Lucero IZQ., Fulgencio y Cristóbal DER., Leocadio CENTRO), oficina (libro y Eloísa IZQ.), pista (Jacinta IZQ., Cristóbal y Eloísa DER.).
  - Nadie en los bordes y ningún doble (sombrero flotando, segundo vaquero).
  - Un solo toro, siempre el mismo (estrella blanca, fierro en la anca izquierda); un solo libro, ilegible; un solo listón sin letras.
  - Leocadio sin insignias ni nada que parezca uniforme; nadie señala con el dedo.
  - Subtítulos quemados, frases repetidas, morphs, personajes que entran caminando.
- Regenerar con `python -I clips.py <ids> > clips_log2.txt`. Luego `python -I phr.py`, pasar la EDL a rangos (renders/phr.json) y `python -I edit.py`. Verificar (sincronía en 5 puntos, ritmo ≤ 1,9 s, LUFS y pico, marca) y mandar a Telegram con caption.txt.
- Riesgos:
  - c07, i2 y c30: el toro junto a una persona.
  - i1: el libro sin texto legible.
  - c30: el CTA con gestos y el sombrero liso.
  - Pronunciación de "Fulgencio", "Leocadio", "Eloísa", "Arredondo", "acompáñenla" y "anca".
- 2026-11-06: c17 e i2 regenerados y revisados (c17 vuelve a traer un sombrero crema en el borde DER. → crop=608:1081:0:0 en todo el clip; i2 sin letras, se usa 2.9-4.4). edit.py y phr.py copiados de nochebuena, renders/phr.json regenerado, EDL por frases (large-v3). renders/v1.mp4: 160.7 s, 81 planos, -14.1 LUFS, -1.8 dBTP, sincronía ≤ 1 fotograma en 5 puntos, transcripción completa en orden. Falta: visto bueno del usuario y Telegram.
