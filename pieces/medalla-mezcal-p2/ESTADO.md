---
type: handoff
status: active
tags: [atrium, novelas, vista-stories, parte2]
relatedTo: [medalla-mezcal]
---
# medalla-mezcal-p2 (La media medalla · Parte 2): estado
- Marca: **VISTA STORIES** (la misma de la Parte 1, no entra en la rotación).
- Archivos listos: guion.md, lines.json (diálogos, fuente única de clips.py), clips.py (43 clips: c01–c39 + r1, r2, i1, i2; SAFE/SOFT/variant/NOREF, TRIES=6, 17 s entre clips, gatito de control, imprime "FIN P2"), edit.py (plantilla agua-hacienda-p2, EDL en borrador con índices de línea, salida renders/v1.mp4), make_sheets.py, caption.txt, music/ (copia de la Parte 1).
- chars/: 13 jpg copiados de la Parte 1 (mismos personajes y ropa). Fausto va SIEMPRE como @{ARREOLA} (el asset FAUSTO tenía la imagen equivocada).
- Hojas nuevas: ninguna.
- Nada generado en Flow todavía.
- Siguiente: `python -I make_sheets.py --reupload > sheets_log.txt` (sube ARREOLA, HEROINA, CAPORAL, SEVERO, TOBIAS, LOC_PORTON, LOC_MEZCALERA, PROP_MEDALLA, PROP_ANILLO al proyecto Flow activo; imprime "FIN HOJAS P2"), comprobar miniaturas en Flow, `python -I clips.py > clips_log.txt` (Monitor sobre "^FIN P2", Traceback e "intento 6"), QA de bordes (Fausto IZQUIERDA / Severo DERECHA), ropa, medalla en la mano derecha, morphs y pronunciación, regenerar, montar con edit.py (pasar el EDL a rangos, renders/phr.json), verificar, Telegram con caption.txt.
- 2026-11-05: 10 clips regenerados pasan QA (c01 con arranque repetido "y hoy" quitado en el montaje; c15, i2, r2 mudos). Montado renders/v1.mp4 (170.3 s, 91 planos, -14.6 LUFS, TP -1.7, sync OK, transcripción completa). Falta: revisión del usuario y Telegram con caption.txt.
