---
type: handoff
status: active
tags: [atrium, novelas, majestic-stories, parte2]
relatedTo: [padre-veladoras]
---
# padre-veladoras-p2 (Las Veladoras · Parte 2): estado
- Marca: **MAJESTIC STORIES** (la misma de la Parte 1, no entra en la rotación).
- Archivos listos: guion.md, lines.json (diálogos, fuente única de clips.py), clips.py (38 clips: c01–c31 + r1–r6 + i1; NOSUB al final de cada diálogo, SAFE/SOFT con \b, variant, NOREF, TRIES=6, 17 s entre clips, gatito de control, salida clips/, imprime "FIN P2", acepta IDs por argumento y mueve la versión vieja a clips/old/), make_sheets.py (solo --reupload), phr.py (copia de medalla-mezcal-p2), edit.py (método medalla-mezcal-p2: EDL en borrador con índices de línea, ganancia 0 en los mudos, loudnorm en dos pasadas, MAJESTIC STORIES 22 px alpha 80 y=135, salida renders/v1.mp4), caption.txt, music/ (copia de la Parte 1).
- chars/: las 9 hojas buenas de la Parte 1 (ANSELMO, RUFINOVIBORA, CHATOBANDANA, RAMIRO, MAUROESCOLTA, LOC_TEMPLO, LOC_ATRIO, PROP_VELADORAS y LOC_TERRAZA, que no se usa), revisadas en hoja de contactos: todas correctas y con md5 distintos. Las corridas de la Parte 1 (chars/mal) no se copiaron.
- **Ninguna hoja nueva.**
- Nada generado en Flow todavía.
- Siguiente: `python -I make_sheets.py --reupload > sheets_log.txt` (sube las 8 hojas al proyecto Flow activo; imprime "FIN HOJAS P2"), luego `python -I clips.py > clips_log.txt` (Monitor sobre "^FIN P2", Traceback e "intento 6"). Después, QA con la hoja de fotogramas y tiras de la franja inferior. Revisar:
  - Bordes: en la nave, Anselmo y el candelero a la DERECHA; Ramiro a la IZQUIERDA en c04–c08 y a la DERECHA desde r1; Rufino y Chato a la IZQUIERDA.
  - Un solo sombrero.
  - Un solo San Judas de plata en Rufino y una sola medalla de oro en Ramiro, sin listón.
  - Un solo cerillo.
  - Subtítulos quemados y frases repetidas.
  - Mauro sin armas, sin feligreses ni niños.
  - Anselmo lampiño.
- Regenerar con `python -I clips.py <ids> > clips_log2.txt`. Luego `python -I phr.py`, pasar la EDL a rangos y `python -I edit.py`. Verificar y mandar a Telegram con caption.txt.
- Riesgos:
  - r2: entrada de Rufino y Chato; que no entre nadie más y que no aparezcan de golpe.
  - i1 y c26: el San Judas puede salir con listón o duplicado (medalla-mezcal-p2 tuvo medallas militares).
  - c27 y r6: Ramiro con su medalla de oro, que no se convierta en dos.
  - c04: el cerillo y la veladora.
  - c09: Mauro en la puerta.
  - Pronunciación de "sacristía", "Socorro", "albañiles" y "Efraín".
