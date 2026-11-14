---
type: handoff
status: active
tags: [atrium, novelas, vista-stories, parte2]
relatedTo: [reten-sierra]
---
# reten-sierra-p2 (El Retén · Parte 2): estado
- Marca: **VISTA STORIES** (la misma de la Parte 1, no entra en la rotación).
- Archivos listos: guion.md, lines.json (diálogos, fuente única de clips.py), clips.py (43 clips: c01–c39 + i1, r1, r2, r3; SAFE/SOFT con \b/variant/NOREF, TRIES=6, 17 s entre clips, gatito de control, salida clips/, imprime "FIN P2", acepta IDs por argumento), edit.py (plantilla reten-sierra v4, EDL en borrador con índices de línea, salida renders/v1.mp4), make_sheets.py, caption.txt, music/ (copia de la Parte 1).
- chars/: 14 jpg copiados de la Parte 1. Usar SOLO: CANDELARIA, EMILIANO, GARZAVERDE (Garza, camuflaje), SOLDADOFLACO (Pineda), DONTEO (Teodoro), LOC_SIERRA (= cabina), LOC_MONTE (loma), PROP_CAMIONETA (troca roja), PROP_LEONTINA (reloj). NO: GARZA, PINEDA, LOC_CABINA, PROP_TROCA, LOC_GARITA.
- Hoja nueva: **LOC_PUESTOVERDE** (retén con pickups verde olivo sin letreros y caseta). Ningún personaje nuevo.
- Nada generado en Flow todavía.
- Siguiente: `python -I make_sheets.py --reupload > sheets_log.txt` (sube las 9 hojas de la Parte 1 y genera LOC_PUESTOVERDE; imprime "FIN HOJAS P2"), revisar la hoja y `md5sum chars/*.jpg`, `python -I clips.py > clips_log.txt` (Monitor sobre "^FIN P2", Traceback e "intento 6"), QA de bordes (Candelaria IZQUIERDA / Garza DERECHA), ropa, camuflaje sin placas, morphs y pronunciación, regenerar, montar con edit.py (pasar el EDL a rangos, renders/phr.json), verificar, Telegram con caption.txt.
