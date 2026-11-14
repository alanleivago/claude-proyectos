---
type: handoff
status: active
tags: [atrium, novelas, vista-stories, parte1]
relatedTo: [canasta-p2]
---
# regreso-20 (El Regreso · Parte 1, video 17): estado
- Ref: `fuentes/referencias2/videos/7696394614240185623.mp4` (+ `_analisis.md`). Mismos beats, nombres y diálogos nuevos, comprimido a una Parte 1 que cierra en el motivo oculto de don Bernardo.
- Marca: **VISTA STORIES** (edit.py, BRAND = "VISTA"; música y marca de agua de pieces/_marcas/VISTA, sin music/ propia).
- Archivos listos: guion.md, lines.json (fuente única de diálogos), clips.py (37 clips: c01–c31 + r1–r5 + i1; 453 palabras ≈ 230 s de voz, 258 s de clips en bruto; NOSUB al final de cada diálogo, SOLO en todos los planos, nadie con sombrero, una carpeta / una maleta / un retrato, SAFE/SOFT con \b, variant, NOREF, TRIES=6, 17 s entre clips, gatito de control, acepta IDs y mueve la versión vieja a clips/old/, imprime "FIN P1"), make_sheets.py (6 hojas nuevas con control md5 DUPLICADO, imprime "FIN HOJAS"), phr.py, edit.py (EDL en borrador con índices de línea, salida renders/v1.mp4), caption.txt.
- Hojas nuevas (nombres únicos en pieces/*/chars): CLEMENCIA, LEONOR, JOAQUIN, BERNARDO, LOC_ADOBE, LOC_TEJABAN.
- Nada generado en Flow todavía.
- Siguiente:
  1. `python -I make_sheets.py > sheets_log.txt` (esperar "FIN HOJAS"; si hay DUPLICADO, borrar chars/dup/<nombre>.jpg y repetir). Revisar las hojas en hoja de contactos: mestizos, ropa correcta, que no se parezcan entre sí, retrato único en LOC_ADOBE.
  2. `python -I clips.py > clips_log.txt` (Monitor sobre "^FIN P1", Traceback e "intento 6").
  3. QA con hoja de fotogramas y tiras de la franja inferior. Revisar:
     - Geografía: cocina (Clemencia/Joaquín IZQ., Leonor DER.), firma (Bernardo DER., familia IZQ.), portal aparte (Clemencia IZQ., Joaquín DER.), despedida (Leonor IZQ.; los demás DER.).
     - Nadie en los bordes, nadie de más en r4, nadie aparece de golpe; sin sombreros.
     - Un solo retrato, una sola carpeta sin sobre ni sello (i1, c13), una sola maleta (c23, r4).
     - Subtítulos quemados, frases repetidas, morphs, sin dedo acusador.
  4. Regenerar con `python -I clips.py <ids> > clips_log2.txt`. Luego `python -I phr.py`, pasar la EDL a rangos y `python -I edit.py`. Verificar (sincronía en 5 puntos, ritmo ≤ 1.9 s, LUFS/pico, marca) y mandar a Telegram con caption.txt.
- Riesgos:
  - c23: "solterona amargada" puede frenar a Flow (SOFT lo cambia desde el 2º intento).
  - r4: dos personas caminando de espaldas con la maleta.
  - r5/c30: que el retrato no cobre vida ni aparezca otra persona.
  - c31 (CTA): que no salga mudo ni rígido.
  - Pronunciación de "Joaquín", "Julián", "jefecita", "Ándele".
