---
type: handoff
status: active
tags: [atrium, novelas, majestic-stories, parte2, navidad]
relatedTo: [nochebuena, regreso-20-p2]
---
# nochebuena-p2 (La Cena de Nochebuena · Parte 2): estado
- Sigue en el mismo segundo del gancho de nochebuena ("mi mamá va a firmar lo que yo le diga"): Herminia lo oyó desde la puerta. Pide el papel en la cocina. Giro: Gerardo ni lo leyó y el papel pone la hacienda a nombre de Regina. Justicia: Ignacio corre a su hija, Herminia rompe el papel, Gerardo pide perdón y ella lo perdona con condición; "vamos a romper la piñata". CTA de opinión, sin Parte 3.
- Marca: **MAJESTIC STORIES** (la de la Parte 1, fuera de la rotación). Música y marca de agua de pieces/_marcas/MAJESTIC (edit.py, BRAND = "MAJESTIC", arriba a la izquierda).
- Archivos listos:
  - guion.md (pasado por humanizer).
  - lines.json, fuente única de clips.py.
  - clips.py: 31 clips (c01–c27 + i1, r1, r2, r3 mudos), 331 palabras, 51 frases, 228 s brutos (~2:05 montado). Copia de regreso-20-p2/clips.py con todas las defensas: gaze() + ONE + ALONE + NODOUBLE en todos los planos, NOSUB + CLEAN + END, nadie con sombrero, PAPER (c11, c12, c14, c21) con una sola hoja, una sola olla y una sola piñata quieta, "no nativity scene, no figurines" en patio y cocina, NOPROP en el resto, SAFE/SOFT con \b, variant, NOREF, TRIES=6, reload_flow() en fallos, 17 s entre clips, gatito de control. Imprime "FIN P2", acepta IDs y mueve la versión vieja a clips/old/. Probado en seco (variantes 0–5 de los 31 prompts).
  - make_sheets.py: 0 hojas nuevas; --reupload de 6 hojas de la Parte 1 (HERMINIA, GERARDO, REGINA, IGNACIO, LOC_PATIOPINATA, LOC_COCINAPONCHE), control md5 DUPLICADO. LOC_COMEDORLUCES (nacimiento) no se usa. Imprime "FIN HOJAS P2".
  - phr.py.
  - edit.py: EDL en borrador con índices de línea (i1/r1/r2/r3 ganancia 0); música suspenso 0→i1, cálida i1→c11, suspenso c11→c22, cálida c22→fin; BLACK 0.4 entre c26 y c27; salida renders/v1.mp4 (--remix -> v2.mp4).
  - caption.txt (#parte2).
- chars/: copia de las 6 hojas de nochebuena.
- Nada generado en Flow todavía.
- Siguiente (una sesión de Flow a la vez):
  1. `python -I make_sheets.py --reupload > sheets_log.txt` (Monitor sobre "^FIN HOJAS P2"); revisar que no haya DUPLICADO, FALTA ni FALLO.
  2. `python -I clips.py > clips_log.txt` (Monitor sobre "^FIN P2", Traceback e "intento 6").
  3. QA por agente (qa_clips.md). Revisar:
     - nadie en los bordes ni en primer plano; nadie entra caminando (c01 Herminia y c11 Gerardo ya en cuadro);
     - subtítulos quemados, 2.ª frase perdida, palabras repetidas;
     - lados fijos (patio: Gerardo/Regina izq., Herminia der.; cocina: Ignacio izq. en c06–c10, luego Gerardo/Regina izq. e Ignacio der. junto a Herminia);
     - una sola hoja (c11, c12, c14, c21), sin pluma ni carpeta; c21 la rompe en dos mitades de la misma hoja; una sola olla; una sola piñata quieta; sin nacimiento ni figuritas;
     - sin sombreros; i1, r1, r2, r3 mudos; c27 CTA con voz desde el inicio y gestos.
  4. Regenerar con `python -I clips.py <ids> > clips_log2.txt`. Luego `python -I phr.py`, EDL por rangos en edit.py y `python -I edit.py` -> renders/v1.mp4.
  5. Verificación completa (sincronía en 5 puntos, ritmo ≤ 1.9 s, LUFS/pico, marca MAJESTIC arriba a la izquierda). Después, Telegram: `python tools/enviar_telegram.py pieces/nochebuena-p2/renders/v1.mp4 "$(cat pieces/nochebuena-p2/caption.txt)" MAJESTIC` (caption.txt con la marca al inicio).
- Riesgos: c14 (leer y levantar la vista), c16 (tono frío de Regina, SOFT lo suaviza), c19 ("correr": que no salga gritado), c21 (romper el papel: segunda hoja), c22 (llanto: SAFE), c27 CTA.
- Pronunciación: "Herminia", "Gerardo", "Regina", "Ignacio", "tantito", "completita", "nomás", "ahorita", "Perdóneme", "avergoncé", "piñata".
