---
type: handoff
status: active
tags: [atrium, novelas, vista-stories, parte2]
relatedTo: [chocolate-rancho]
---
# chocolate-rancho-p2 (La Taza de Chocolate · Parte 2): estado
- Marca: **VISTA STORIES** (la misma de la Parte 1, no entra en la rotación).
- Archivos listos: guion.md, lines.json (diálogos, fuente única de clips.py), clips.py (41 clips: c01–c35 + i1, i2, r1–r4; SAFE/SOFT con \b, variant, NOREF, TRIES=6, 17 s entre clips, gatito de control, salida clips/, imprime "FIN P2", acepta IDs por argumento y mueve la versión vieja a clips/old/), edit.py (plantilla reten-sierra v4, EDL en borrador con índices de línea, VISTA STORIES 22 px alpha 80 y=135, salida renders/v1.mp4), make_sheets.py, caption.txt, music/ (copia de la Parte 1).
- chars/: las 7 hojas de la Parte 1 (RENATA, PRUDENCIO, EULALIA, DAMIAN, BENAVIDES, LOC_HUERTO, PROP_TAZA), revisadas en hoja de contactos: todas correctas, md5 distintos.
- Hoja nueva: **LOC_DESPACHOROBLES** (oficina de Damián). Ningún personaje nuevo.
- Nada generado en Flow todavía.
- Siguiente: `python -I make_sheets.py --reupload > sheets_log.txt` (sube las 7 hojas de la Parte 1 y genera LOC_DESPACHOROBLES; imprime "FIN HOJAS P2"), revisar la hoja nueva y `md5sum chars/*.jpg`, `python -I clips.py > clips_log.txt` (Monitor sobre "^FIN P2", Traceback e "intento 6"), QA (bordes: Renata IZQUIERDA en la oficina / Prudencio-Eulalia IZQUIERDA en el rancho; un solo sombrero; una sola carpeta y una sola taza; subtítulos quemados; frases repetidas; Benavides sin carpeta), regenerar con `python -I clips.py <ids> > clips_log2.txt`, montar con edit.py (pasar el EDL a rangos, renders/phr.json), verificar, Telegram con caption.txt.
- Riesgos: c04 (entrada por la puerta, Damián y Benavides en cuadro), c19 (SH con Prudencio de espaldas y Damián detrás), i2 (taza y concha: que no salgan dos tazas), r3/c31 (pronunciación de "Esperanza Robles").
- 2026-11-05: QA de los 7 regenerados OK (qa_clips.md). Montaje renders/v1.mp4 (159.5 s, 86 tramos + 0.4 s de negro, kit _marcas/VISTA) verificado: -14.2 LUFS, -1.3 dBTP, sync +5 ms en 5 puntos, transcripción completa. Falta: revisión del usuario y Telegram con caption.txt.
