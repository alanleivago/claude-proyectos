---
type: handoff
status: active
tags: [atrium, novelas, vista-stories, parte2]
relatedTo: [canasta]
---
# canasta-p2 (La Canasta · Parte 2): estado
- Marca: **VISTA STORIES** (la misma de la Parte 1, no entra en la rotación). Música y marca de agua salen de pieces/_marcas/VISTA (edit.py, BRAND = "VISTA"); no hay music/ propia.
- Archivos listos: guion.md, lines.json (diálogos, fuente única de clips.py), clips.py (37 clips: c01–c30 + r1–r6 + i1; 236 s hablados en bruto; NOSUB al final de cada diálogo, SOLO en todos los planos, SAFE/SOFT con \b, variant, NOREF, TRIES=6, 17 s entre clips, gatito de control, salida clips/, imprime "FIN P2", acepta IDs y mueve la versión vieja a clips/old/), make_sheets.py (--reupload con control md5), phr.py (copia de padre-veladoras-p2), edit.py (método padre-veladoras-p2: EDL en borrador con índices de línea, ganancia 0 en los mudos, loudnorm en dos pasadas, salida renders/v1.mp4), caption.txt.
- chars/: las 9 hojas de la Parte 1 (REFUGIO, HORACIO, MARIBEL, EUSEBIO, FEDERICO, LOC_VESTIBULO, LOC_GERENCIA, LOC_BANQUETA, LOC_SALITA), revisadas en hoja de contactos: cada nombre es su persona/lugar, md5 distintos y sin coincidencias con otras piezas.
- **Ninguna hoja nueva.** make_sheets.py compara por md5 cada hoja nueva contra todas las pieces/*/chars/**/*.jpg e imprime "DUPLICADO <nombre>" (la aparta en chars/dup/ y no la sube); con --reupload revisa también las reusadas contra las otras piezas.
- Nada generado en Flow todavía.
- Siguiente: `python -I make_sheets.py --reupload > sheets_log.txt` (sube las 9 hojas al proyecto Flow activo; imprime "FIN HOJAS P2"; revisar que no haya DUPLICADO), luego `python -I clips.py > clips_log.txt` (Monitor sobre "^FIN P2", Traceback e "intento 6"). Después, QA con hoja de fotogramas y tiras de la franja inferior. Revisar:
  - Geografía: banqueta (Federico/Refugio IZQ., Horacio DER.), recepción (Federico/Refugio IZQ.; mostrador, Maribel, Horacio, Eusebio DER.), gerencia (Federico DER., Refugio IZQ.).
  - Nadie en los bordes (todos los planos son primeros planos limpios), nadie de más en r2 y r4.
  - Refugio sin gafete (falló en P1 c28); Horacio sin dedo acusador (falló en P1 c18); gafetes lisos sin letras.
  - Un solo paraguas (c01–c06, r2), una sola canasta, una sola carpeta sin sobre ni sello (i1, c26, c28, r6).
  - Subtítulos quemados, frases repetidas, morphs.
- Regenerar con `python -I clips.py <ids> > clips_log2.txt`. Luego `python -I phr.py`, pasar la EDL a rangos y `python -I edit.py`. Verificar y mandar a Telegram con caption.txt.
- Riesgos:
  - c01–c06: lluvia y paraguas en primer plano.
  - r2 y r4: dos personas caminando; que no aparezca nadie de golpe.
  - i1: que no salga texto legible ni "Dulces Montiel" escrito en la hoja.
  - c30 (CTA): en P1 salió mudo y quieto la primera vez; el prompt ya es el corregido.
  - Pronunciación de "Montiel", "malentendido", "Eusebio", "Refugio".
