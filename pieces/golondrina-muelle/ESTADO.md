---
type: handoff
status: active
tags: [atrium, novelas, sinmarca, parte1, historia-propia, capos, muelle, nochebuena]
relatedTo: [chofer-patrona, cincha-cortada, mariachi-patron, madrina-central, atrium-vista]
---
# golondrina-muelle (La Golondrina · Parte 1): estado

## La historia
- Historia propia tipo capos en un muelle de pescadores de Sinaloa, la mañana del 24 de diciembre. Conflicto nuevo (las premisas 1-8 de fuentes/atrium-vista/resumen.md ya estaban hechas). El licenciado Ruelas, administrador nuevo del muelle, le riega el pescado a don Cheyo y le encadena la lancha: "Media hora, don Cheyo. Y esta lancha es mía." Cheyo pide el radio: "Vinieron por su lancha." Llega don Arcadio en tres lanchas: la Golondrina es suya y se la regaló a Cheyo el día que lo sacó del mar. Plazo invertido: Ruelas tiene hasta que suba la marea para decir quién lo mandó. Gancho P2: en el celular de Ruelas aparece Abelardo, el hermano de Arcadio.
- Con Navidad (las tres anteriores no la tenían): pescado de la cena de Nochebuena y "esta Nochebuena cenas conmigo".
- Indicios antes de revelar: golondrina en la proa (i02), "yo nomás la trabajo" (c04), "hoy mismo es suya" (c08, r1), "esa lancha no se toca" (c09), el radio (c13), el anillo con la golondrina (i05).
- Guion pasado por la skill humanizer.
- Nombres únicos en pieces/ (Anselmo, Clemente, Baltazar, Evaristo, Gerardo, Octavio, Rogelio y Fulgencio ya existían).

## Marca
**SIN MARCA**: edit.py, BRAND = "SINMARCA" (kit pieces/_marcas/SINMARCA, sin marca de agua).

## Archivos
guion.md, caption.txt, lines.json, clips.py (47 clips, copia de chofer-patrona con todas sus defensas: gatito en imagen y control de duplicados), make_sheets.py (5 personajes + LOC_MUELLEPESCA, "ordinary non-famous face"), phr.py, edit.py (EDL vacía, se arma desde renders/phr.json; música cálida de c24 a c27).

## Avance
- 2026-11-08: archivos escritos. `python -c "import clips"` OK (47 clips = lines.json). Faltan: 6 hojas (make_sheets.py), clips, QA, phr.py, EDL y montaje. NO se generó nada en Flow.
- 2026-11-08 noche: 6 hojas OK a ojo. Clips 47/47 al 1.er intento, sin md5 duplicados. QA: sin regeneraciones. c03 dice "y le toca una multa" (sin cifra; los 40 mil quedan en c22); c06 traba la 2.ª frase → solo 1.ª; c15 omite "Apá". i03/i04/i02 tienen cortes internos (usados tramos limpios). Crops de borde en renders/edlcfg.json.
- renders/share.mp4: 134.7 s, 84 tramos (1.62 s/tramo), -14.2 LUFS, -2.1 dBTP, sync 0 ms en 5 puntos, BLACK 126.3 s, sin marca. Revisión API: renders/share_revision.md. NO enviado a Telegram.
