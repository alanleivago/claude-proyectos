---
type: handoff
status: active
tags: [atrium, novelas, majestic-stories, parte2]
relatedTo: [regreso-chicago]
---
# regreso-chicago-p2 (La Casa de Chicago · Parte 2): estado
- Marca: **MAJESTIC STORIES** (la misma de la Parte 1, no entra en la rotación). Música y marca de agua salen de pieces/_marcas/MAJESTIC (edit.py, BRAND = "MAJESTIC"); no hay music/ propia.
- Archivos listos: guion.md, lines.json (diálogos, fuente única de clips.py), clips.py (36 clips: c01–c29 + r1–r7; 234 s hablados en bruto; NOSUB al final de cada diálogo, SOLO en todos los planos, SAFE/SOFT con \b, variant, NOREF, TRIES=6, 17 s entre clips, gatito de control, salida clips/, imprime "FIN P2", acepta IDs y mueve la versión vieja a clips/old/), make_sheets.py (--reupload con control md5), phr.py (copia de canasta-p2), edit.py (método canasta-p2: EDL en borrador con índices de línea, ganancia 0 en los mudos, loudnorm en dos pasadas, salida renders/v1.mp4), caption.txt.
- chars/: las 8 hojas de la Parte 1 (ROGELIO, YESENIA, ULISES, REBECA, JOSEFINA, LOC_FACHADA, LOC_COCHERA, PROP_CARPETA), revisadas en hoja de contactos: cada nombre es su persona/lugar, md5 distintos y sin coincidencias con otras piezas. **PROP_CARPETA no se usa ni se sube** (la hoja trae una etiqueta escrita "PROP REF 4C"); la carpeta va descrita en texto.
- **Ninguna hoja nueva.** make_sheets.py compara por md5 cada hoja nueva contra todas las pieces/*/chars/**/*.jpg e imprime "DUPLICADO <nombre>" (la aparta en chars/dup/ y no la sube); con --reupload revisa también las reusadas contra las otras piezas.
- Nada generado en Flow todavía.
- Siguiente: `python -I make_sheets.py --reupload > sheets_log.txt` (sube las 7 hojas al proyecto Flow activo; imprime "FIN HOJAS P2"; revisar que no haya DUPLICADO), luego `python -I clips.py > clips_log.txt` (Monitor sobre "^FIN P2", Traceback e "intento 6"). Después, QA con hoja de fotogramas y tiras de la franja inferior. Revisar:
  - Geografía: fachada (reja, Yesenia, Rebeca y Ulises IZQ.; Rogelio y Josefina DER.), cochera (camioneta y Ulises IZQ.; Yesenia y Rogelio DER.).
  - Nadie en los bordes (todos los planos son primeros planos limpios), nadie de más en r2, r3 y r5.
  - Ulises con pantalón beige (falló en P1 c03/c18/c23); Rebeca sin dedo acusador (falló en P1 c13).
  - Una sola carpeta azul cerrada (sin sobre ni sello), una sola maleta negra (r5, c21), una sola camioneta.
  - Subtítulos quemados, frases repetidas, morphs.
- Regenerar con `python -I clips.py <ids> > clips_log2.txt`. Luego `python -I phr.py`, pasar la EDL a rangos y `python -I edit.py`. Verificar y mandar a Telegram con caption.txt.
- 2026-11-05: QA v2 de c11 (punch-in en la frase 1 por un capó en primer plano; corte antes de que repita "y me la llevo") y c16 OK. renders/v1.mp4 montado y verificado (ver qa_clips.md). Falta: revisión del usuario y Telegram.
- Riesgos:
  - r3: la camioneta saliendo con Ulises al volante (que no salga otra persona ni otra camioneta).
  - r5/c21: la maleta de Yesenia (una sola, negra, de rueditas; que no aparezca la maleta café de Rogelio).
  - c26/c29: "me quitó" — si la política lo frena, SOFT lo cambia por "lo que pasó"; revisar que c29 (CTA) siga cuadrando con c26.
  - c29 (CTA): en P1 salió bien con el mismo tipo de prompt (se ajusta la correa del bolso).
  - Pronunciación de "Josefina", "Rebeca", "azotea", "techando", "treinta".
