---
type: handoff
status: active
tags: [atrium, novelas, mexi-stories, parte1, historia-propia, capos, caballos]
relatedTo: [chofer-patrona, mariachi-patron, viuda-aguacate, reten-sierra, atrium-vista]
---
# cincha-cortada (La Cincha Cortada · Parte 1): estado

## La historia
- Historia propia tipo capos en las carreras de caballos de Sonora. Las premisas 1-8 de fuentes/atrium-vista/resumen.md ya estaban hechas, así que el conflicto es nuevo. El licenciado Arteaga tira la cubeta del agua de Centella: "Veinte minutos, viejo. Y tu caballo pierde." Apostó tres millones y presume los papeles del rancho de doña Teodora. Jacinto, el ayudante, le cortó la cincha a cambio de cien mil. Teodora llega con su gente: los papeles ya son suyos y Arteaga le debe tres millones antes de que acabe la carrera, en cinco minutos. Gancho P2: "el dinero salió de su casa". Sin Navidad.
- Indicios antes de revelar: Jacinto quiere ensillar (c09), Arteaga sabe lo de la cincha nueva (c10, r1), "nomás tú y yo sabíamos" (c12), botas de avestruz nuevas (i03, c14), celular escondido (r2).
- Guion pasado por la skill humanizer.
- Nombres únicos en pieces/ (Cruz, Lalo, Lucero, Octavio, Leonel, Ofelia y Valdivia ya existían).

## Marca
**MEXI STORIES**: edit.py, BRAND = "MEXI" (kit pieces/_marcas/MEXI).

## Archivos
guion.md, caption.txt, lines.json, clips.py (47 clips, copia de chofer-patrona con todas sus defensas), make_sheets.py (5 personajes + LOC_CABALLERIZA + CABALLO_CENTELLA, "ordinary non-famous face"), phr.py, edit.py (EDL vacía, se arma desde renders/phr.json; música cálida de c23 a c27).

## Avance
- 2026-11-08: archivos escritos. `python -c "import clips"` OK (47 clips = lines.json). Faltan: 7 hojas (make_sheets.py), clips, QA, phr.py, EDL y montaje. NO se generó nada en Flow (había otra pieza generándose).
- 2026-11-08 noche: 7 hojas OK a ojo (md5 únicos). Clips 47/47 (c36 en intento 2), sin md5 duplicados. QA: transcripción = lines.json en los 36 diálogos; sin regeneraciones. Crops de borde en c10/c18/c19/c23 (renders/edlcfg.json).
- renders/share.mp4: 147.0 s, 86 tramos (1.73 s/tramo), -14.4 LUFS, -1.7 dBTP, sync 0 ms en 7 puntos, BLACK 139.7 s. Revisión API: renders/share_revision.md. NO enviado a Telegram.
