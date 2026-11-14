---
type: handoff
status: active
tags: [atrium, novelas, vista-stories, parte2]
relatedTo: [agua-hacienda]
---
# agua-hacienda-p2 (Agua en la hacienda · Parte 2): estado
- Marca: **VISTA STORIES** (la misma de la Parte 1, no entra en la rotación).
- Archivos listos: guion.md, lines.json (diálogos, fuente única de clips.py), clips.py (40 clips: c01–c38 + r1, r2; SAFE/SOFT/variant/NOREF, TRIES=6, 17 s entre clips, gatito de control, imprime "FIN P2"), edit.py (plantilla hacienda-sangre v2, EDL en borrador con índices de línea), make_sheets.py, caption.txt, music/ (copia de hacienda-sangre).
- chars/: 18 jpg copiados de la Parte 1 (mismos personajes y ropa).
- Hoja nueva: **LOC_COMPUERTA** (canal de piedra con compuerta oxidada). No hay personajes nuevos.
- Nada generado en Flow todavía.
- Siguiente: `python -I make_sheets.py --reupload > sheets_log.txt` (sube las 8 hojas de la Parte 1 al proyecto Flow activo y genera LOC_COMPUERTA), revisar la hoja, `python -I clips.py > clips_log.txt` (Monitor sobre "^FIN P2", Traceback y "intento 6"), QA de bordes y ropa, regenerar, montar con edit.py (pasar el EDL a rangos), verificar, Telegram con caption.txt.
