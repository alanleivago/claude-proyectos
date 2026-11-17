---
type: handoff
status: active
tags: [atrium, novelas, mexi-stories, parte2, remake-transformado, capos, colima, cuyutlan, salinas, hermano-traidor]
relatedTo: [costal-cuyutlan, atrium-vista]
---
# costal-cuyutlan-p2 (La Sal de Cuyutlán · Parte 2): estado

## La historia
Parte 2 de pieces/costal-cuyutlan. Arranca desde el gancho de la P1 (Evelio bajó de la camioneta blanca y cayeron las primeras gotas).
- Gancho con recordatorio: Leónidas, bajo la llovizna, presume que el bordo se lo vendió el hermano de Atanasio.
- Remigia (nueva, 78), la salinera más vieja, trae el papel de la asamblea: el padre dejó el bordo al pueblo. Evelio vendió lo que no era suyo (desenlace del giro).
- Leónidas y Evelio se culpan; Evelio confiesa que solo quería irse de la sal.
- Castigo del villano: el plazo se cumplió, la camioneta se atasca, nadie la empuja y Leónidas se va a pie por la playa.
- Castigo del traidor: Evelio carga los costales a la caseta, uno por uno, bajo la lluvia.
- Gancho: Evelio solo en la caseta, "es quién me presentó a ese señor". CTA de Atanasio: "¿Ustedes lo pondrían a cargar sal o lo correrían del pueblo?"

Sin armas, sangre, cifras de dinero, deudas, uniformes, niños ni Navidad. Detalle en guion.md.

## Marca
**MEXI STORIES**, la misma de la Parte 1 (no entra en la rotación): edit.py, BRAND = "MEXI", SPEED = 1.15.

## Archivos listos
- guion.md y caption.txt (formato Parte 2, #parte2).
- lines.json, fuente única: 388 palabras.
- clips.py, 33 clips: c01-c26 hablados (c26 = CTA de 10 s), i01-i02 insertos sin caras y r1-r5 mudos.
  - Copia de pieces/jipi-becal-p2/clips.py: ots(), two(), MOUTH, tuplas (prompt_nuevo, prompt_one), ONE_FROM=3, --one, y todas las defensas (gatito en imagen, reload_flow, new_project, descarga corrupta, duplicados md5, TRIES=6, SAFE/SOFT con las frases fuertes primero, NOREF con Remigia, parada "LIMITE DE CREDITOS"). Imprime "FIN P2".
  - Reparto: 16 OTS (52 %), 8 single (26 %), 4 two-shot (13 %), 3 grupo (10 %) + 2 insertos. Geografía fija: Atanasio, Xóchitl y Remigia a la izquierda; Leónidas y Evelio a la derecha. c01 es Leónidas hablando.
- make_sheets.py: reutiliza las 5 hojas de la P1 copiadas a chars/ (ATANASIO_VARELA, XOCHITL_VARELA, LEONIDAS_PAZOS, EVELIO_VARELA, LOC_SALINASCUYUT) y **1 hoja nueva: REMIGIA_SOTELO**. `--reupload` salta las carpetas costal-cuyutlan* en el control de duplicados.
- phr.py y edit.py (copia del de jipi-becal-p2, EDL vacía, BRAND = "MEXI", SPEED = 1.15; música cálida de c22 a c25).
- Comprobaciones: py_compile OK en los 4 .py; pyflakes sin avisos en clips.py y make_sheets.py; IDs de CLIPS = claves de lines.json en el mismo orden (leído con ast, sin importar); cada clip hablado llama a talk() con su propio ID y los mudos no; todos los @{ASSET} tienen hoja y no sobra ninguna; frases de SOFT = lines.json; sin cifras; ninguna frase repetida de otra pieza.

Nada generado en Flow todavía.

## Siguiente
1. `python -I make_sheets.py --reupload > sheets_log.txt`: sube las 5 copias, genera y sube REMIGIA_SOTELO, imprime "FIN HOJAS". Revisar md5 y que Remigia no se parezca a nadie de otra pieza.
2. `python -I clips.py > clips_log.txt`, con Monitor sobre "^FIN P2", Traceback, "intento 6" y "LIMITE".
3. QA: dobles en los OTS (regenerar con `--one`), ropa de la P1, llovizna constante, Leónidas el único con sombrero, camionetas a su lado sin placas, el papel sin texto, pronunciación.
4. `python -I phr.py`, armar la EDL y `python -I edit.py`. Verificar sincronía en 5 puntos, ≤2 s por tramo, LUFS y pico, marca MEXI arriba a la derecha.
5. Copiar a LucidLink (MexiTV/) con caption.txt.
