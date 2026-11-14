---
type: handoff
status: active
tags: [atrium, novelas, mexi-stories, parte1]
relatedTo: [canasta-p2, mecanico, recetario]
---
# camionero (El Camionero · Parte 1, video 16): estado
- Remake de `fuentes/referencias2/videos/7697078993438182687.mp4` (1.4M vistas; análisis `7697078993438182687_analisis.md`). Mismos bloques; nombres, diálogos y colores cambiados; gancho nuevo para la Parte 2 ("alguien de su familia").
- Marca: **MEXI STORIES** (rotación). Música y marca de agua de pieces/_marcas/MEXI (edit.py, BRAND = "MEXI"); no hay music/ propia.
- Archivos listos: guion.md, lines.json (fuente única de clips.py), clips.py (37 clips: c01–c33 + r1–r3 + i1; 240 s hablados en bruto; NOSUB y END al final de cada diálogo, SOLO en todos los planos, una de cada utilería, SAFE/SOFT con \b, variant, NOREF, TRIES=6, 17 s entre clips, gatito de control, salida clips/, imprime "FIN P1", acepta IDs y mueve la versión vieja a clips/old/), make_sheets.py (10 hojas nuevas + control md5 DUPLICADO; --reupload), phr.py, edit.py (EDL en borrador con índices de línea, ganancia 0 en los mudos, loudnorm en dos pasadas, salida renders/v1.mp4), caption.txt.
- Hojas nuevas (aún no generadas): TEOFILO_TRAILERO, LEONOR_DIRECTORA, CLEMENTE_BODEGUERO, NAYELI_MONITOREO, LALO_CHALECO, FIDEL_CARGADOR, LOC_ANDENCARGA, LOC_SALAMONITORES, LOC_PASILLORACKS, LOC_CUARTOCAJAS.
- Nada generado en Flow todavía.
- Siguiente: `python -I make_sheets.py > sheets_log.txt` (imprime "FIN HOJAS"; revisar que no haya DUPLICADO, `md5sum chars/*.jpg` y hoja de contactos: cada nombre es su persona/lugar, personajes distintos no se parecen), luego `python -I clips.py > clips_log.txt` (Monitor sobre "^FIN P1", Traceback e "intento 6"). Después, QA con hoja de fotogramas y tiras de la franja inferior. Revisar:
  - Geografía: andén (Teófilo/Lalo IZQ., Clemente/Fidel DER., Leonor/Nayeli CENTRO), monitores (pantallas y Nayeli IZQ.), pasillo (puerta y Clemente/Fidel DER.), cuarto (cajas y Nayeli IZQ., Clemente DER.).
  - Nadie en los bordes, nadie de más en r2; Clemente sin saco en todos los planos (falló en la ref); gafetes lisos sin letras; una sola gorra en Teófilo.
  - Pantallas (c10–c12, i1): la imagen 2D DENTRO del marco, nada sale de la pantalla, sin texto legible ni etiquetas tipo "ESC04_…" (se colaron en la ref).
  - Una sola llave, una sola tabla, una sola pila de cajas; nadie señala con el dedo.
  - Subtítulos quemados, frases repetidas, morphs.
- Regenerar con `python -I clips.py <ids> > clips_log2.txt`. Luego `python -I phr.py`, pasar la EDL a rangos y `python -I edit.py`. Verificar y mandar a Telegram con caption.txt.
- 2026-11-05: QA v2 de c04 c05 c16 c25 c30 c33 OK (c05/c16/c30 con punch-in en la 1ª frase) y renders/v1.mp4 montado y verificado (ver qa_clips.md). Falta: revisión del usuario y Telegram.
- Riesgos: c10/c11/c12/i1 (monitores), r2 (llave y puerta), c17 (pila de cajas y tabla), c33 (CTA con gestos), pronunciación de "Teófilo", "Nayeli", "tráiler", "malentendido".
