---
type: handoff
status: active
tags: [atrium, novelas, majestic-stories, parte2]
relatedTo: [hacienda-sangre]
---
# hacienda-sangre-p2 (La Hacienda · Parte 2): estado
- Marca: **MAJESTIC STORIES** (la misma de la Parte 1, no entra en la rotación).
- Archivos listos: guion.md, lines.json (diálogos, fuente única de clips.py), clips.py (39 clips: c01–c35 + r1, r2, r3, i1; SAFE/SOFT con \b, variant, NOREF, TRIES=6, 17 s entre clips, gatito de control, salida clips/, imprime "FIN P2"; con IDs regenera solo esos y la versión anterior pasa a clips/old/<id>_vN.mp4), edit.py (plantilla reten-sierra v4 / hacienda-sangre v2, EDL en borrador armado desde lines.json con índices de línea, salida renders/v1.mp4), make_sheets.py, caption.txt, music/ (copia de la Parte 1).
- chars/: 12 jpg copiados de la Parte 1 y verificados en hoja de contactos (todos muestran a la persona/lugar correcto). Se usan: OCTAVIO, MATEO, TERESA, ARTURO, DONNICO (= Nicanor), LOC_RANCHITO, PROP_SANISIDRO. Sin uso: QUINTERO, LOC_BANCO, LOC_BUFETE, LOC_ESTANCIA, LOC_RECAMARA.
- Hojas nuevas: **LOC_QUINQUE** (interior de adobe de noche con quinqué) y **PROP_SOBRELACRE** (sobre crema con lacre rojo).
- Nada generado en Flow todavía.
- Siguiente:
  1. `python -I make_sheets.py --reupload > sheets_log.txt` (sube 7 hojas de la Parte 1 y genera las 2 nuevas; imprime "FIN HOJAS P2"). Revisar las 2 hojas y `md5sum chars/*.jpg`.
  2. `python -I clips.py > clips_log.txt` (Monitor sobre "^FIN P2", Traceback e "intento 6").
  3. QA: bordes (porche a la IZQUIERDA con Nicanor/Mateo/Teresa, Octavio a la DERECHA con la camioneta negra; de noche Mateo IZQUIERDA, Teresa DERECHA), ropa, morphs, pronunciación ("Isauro", "heredó", "crió", "soberbia", "regrésese"). Regenerar con `python -I clips.py c05 c09`.
  4. Montar con `python -I edit.py` (pasar el EDL a rangos exactos, renders/phr.json), verificar (sincronía en 5 puntos, ritmo ≤ 1.9 s, LUFS/pico, marca), Telegram con caption.txt.
- Riesgos: c04 (Octavio sube al porche y toca: que no se mezcle con Nicanor), c12 (Teresa llega caminando, que no aparezca de golpe), c26 (camioneta se va), i1 (manos y lacre), c33/c34 (SH de noche con poca luz).
