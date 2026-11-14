---
type: handoff
status: active
tags: [atrium, novelas, vista-stories, parte1, historia-propia, capos, mariachi]
relatedTo: [viuda-aguacate, fonda-chela, monedas-carretera, reten-sierra, atrium-vista]
---
# mariachi-patron (El Mariachi del Patrón · Parte 1): estado

## La historia
- Historia propia tipo capos sobre la premisa n.º 8 de fuentes/atrium-vista/resumen.md. El ganadero Gildardo corre de su fiesta, sin los veinte mil, a don Higinio, el mariachi viejo (cinco minutos para irse). A medianoche llega don Rosendo Cabañas con ocho camionetas: Higinio nunca faltó a uno de sus cumpleaños. Plazo invertido: Gildardo le debe la cosecha y tiene hasta que amanezca. Gancho P2: "Gildardo es mi hijo". Sin Navidad.
- Guion pasado por la skill humanizer.
- Nombres únicos en pieces/ (Evaristo, Tadeo, Chencho, Cirilo, Alcántar ya existían).

## Marca
**VISTA STORIES**: edit.py, BRAND = "VISTA" (kit pieces/_marcas/VISTA).

## Archivos
guion.md, caption.txt, lines.json, clips.py (48 clips, copia de viuda-aguacate + control de duplicados md5 de clips), make_sheets.py (5 personajes + LOC_PATIOGANADERO, "ordinary non-famous face"), phr.py, edit.py (EDL por armar desde renders/phr.json).

## Avance
- (se actualiza abajo)
- 2026-11-08: hojas OK (revisadas a ojo, md5 únicos, caras comunes). Proyecto Flow nuevo 8090b0be (el viejo daba "actividad inusual").
- 48/48 clips (FIN P1). QA en qa_clips.md (método pedida-mano + qa.py): 0 regeneraciones; crops de borde en c03 c11 c20 c21 c23 c26 c30 c33; i05 trae 2.9 s de una mujer ajena al inicio (se usa 3.1-4.4).
- Montaje v1: renders/share.mp4, 166.6 s, 73 tramos / 96 planos (1.73 s/plano), -14.2 LUFS, pico -1.7 dBTP, sincronía 0 ms en 5 puntos, transcripción completa = lines.json (renders/v1_transcript.txt), marca VISTA STORIES visible. Revisión API: renders/share_revision.md (se agregó r3 tras "Gildardo es mi hijo").
- NO enviado a Telegram (pedido de la sesión coordinadora).
- Dudas: manga gris en i02 (Eulogio lleva chamarra negra); el giro "es mi hijo" no tiene pista previa salvo r3.
