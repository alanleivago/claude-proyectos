---
type: handoff
status: active
tags: [atrium, novelas, majestic-stories, parte1, historia-propia, capos, chofer]
relatedTo: [mariachi-patron, viuda-aguacate, fonda-chela, reten-sierra, atrium-vista]
---
# chofer-patrona (El Chofer de la Patrona · Parte 1): estado

## La historia
- Historia propia tipo capos sobre la premisa n.º 5 de fuentes/atrium-vista/resumen.md. Valente, hijo de la patrona, tiene de rodillas a Lencho, el chofer de veinte años: "Diez minutos, Lencho. O aparece el medio millón." Lencho pide la cámara de la camioneta. Llega doña Eusebia con su gente y la grabación muestra a Valente abriendo la cajuela con su llave. Plazo invertido: hasta mañana o no vuelve a la casa. Gancho P2: el maletín lo recibió Treviño, "el que se llevó a tu padre". Sin Navidad.
- Se diferencia de camionero (también un chofer acusado, con cámaras): aquí no hay cuarto de monitores. La grabación sale en una tableta y la pista son las dos llaves y el "ya la revisé anoche".
- Indicios antes de revelar: dos llaves (c05-c06), mano al bolsillo (r1), llamada de Treviño (c11), "ya la revisé anoche" (c14).
- Guion pasado por la skill humanizer.
- Nombres únicos en pieces/ (Rodrigo, Socorro, Isidro, Herminia, Mauricio, Fausto, Matilde y Leopoldo ya existían).

## Marca
**MAJESTIC STORIES**: edit.py, BRAND = "MAJESTIC" (kit pieces/_marcas/MAJESTIC).

## Archivos
guion.md, caption.txt, lines.json, clips.py (47 clips, copia de mariachi-patron con todas sus defensas), make_sheets.py (5 personajes + LOC_COCHERARANCHO, "ordinary non-famous face"), phr.py, edit.py (EDL vacía, se arma desde renders/phr.json; música cálida de c21 a c25).

## Avance
- 2026-11-08: archivos escritos. `python -c "import clips"` OK (47 clips = lines.json). Faltan: 6 hojas (make_sheets.py), clips, QA, phr.py, EDL y montaje. NO se generó nada en Flow (había otra pieza generándose).
- 2026-11-08 tarde: hoja VALENTE_MONTALVO parecida a Adrien Brody → chars/mal; nueva VALENTE_MONTALVO2 (mestizo, bigote fino). Clips 47/47 (FIN P1; c01 salió en intento 5 = NOREF, otra cara).
- QA: c01 regenerado con línea 2 cambiada en lines.json a "O aparece ese maletín." (con hoja, "el medio millón" daba bloqueo de políticas en 6 intentos; la cifra queda en c22). c08 subtítulos quemados → crop 480x853 arriba. c26 traba "su tierra, su tiempo" → solo 1.ª frase. Bordes/crops en renders/edlcfg.json. c18 morph de pelo ~5.2 s (fuera del tramo).
- Revisión API v1 → v2: fuera i01 (hombre sin torso, artefacto), c35 regenerado con CTA "¿...la patrona debe perdonar a Valente?" (Eusebia nunca se nombra), c33 arranque 0.56 (cortaba "Pa-trona") con crop de borde, insertos i04/i05/r5 acortados, alimiter 0.76 (AAC pasaba de -1 dBTP).
- renders/share.mp4: 131.2 s, 82 tramos (1.61 s/tramo), -14.3 LUFS, -2.2 dBTP, sync 0 ms en 5 puntos, BLACK 123.8 s. NO enviado a Telegram.
