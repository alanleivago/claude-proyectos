---
type: handoff
status: active
tags: [atrium, novelas, vista-stories, parte2, historia-propia, capos, mariachi]
relatedTo: [mariachi-patron, viuda-aguacate-p2, atrium-vista]
---
# mariachi-patron-p2 (El Mariachi del Patrón · Parte 2): estado

## La historia
Parte 2 de pieces/mariachi-patron. Los escoltas de Rosendo cierran los arcos; Gildardo niega a su padre y Rosendo lo sube a la tarima a confesar por el micrófono que el mariachi es su padre y que lo corrió sin pagarle. Eulogio deja el radio y se va a pie al pueblo. Al alba Rosendo se lleva el ganado por la cosecha. Momento cálido: Higinio lo esperó y le escribió cartas; la mamá le dijo que él los dejó. Higinio decide: le devuelven el ganado si toca un año con él en la plaza, por limosna. Amanece, mañanitas para Rosendo. CTA con dilema; historia cerrada. Sin armas, sin sangre, sin Navidad. Guion pasado por la skill humanizer.

## Marca
**VISTA STORIES**, la misma de la Parte 1 (no entra en la rotación): edit.py, BRAND = "VISTA". Sin carpeta music/ propia.

## Archivos listos
- guion.md y caption.txt (formato Parte 2, #parte2, sin anunciar tercera parte).
- lines.json: fuente única de clips.py (323 palabras, 3 a 6 por frase salvo el CTA; primera línea sin cifras).
- clips.py: 47 clips (c01–c34 hablados, i01–i08 insertos sin caras, r1–r5 reacciones mudas). Copia del clips.py de chofer-patrona (gatito en imagen, reload_flow, new_project, descarga corrupta, duplicados md5, TRIES=6). Imprime "FIN P2". `python -c "import clips"` OK.
- make_sheets.py: las 6 hojas de la Parte 1 copiadas en chars/ (HIGINIO_LUMBRERAS, MACLOVIO_ZAVALETA, GILDARDO_MONTEMAYOR, EULOGIO_MANCERA, ROSENDO_CABANAS, LOC_PATIOGANADERO). Sin hojas nuevas. Las copias no cuentan como DUPLICADO (skip mariachi-patron y mariachi-patron-p2; también se ajustó mariachi-patron/make_sheets.py para ignorar la copia).
- phr.py.
- edit.py: plantilla mariachi-patron, EDL en BORRADOR por índices de frase (82 tramos), mudos con ganancia 0, BLACK 0.4 s antes de c34. Música: suspenso hasta c20, cálida c20–c24, suspenso hasta el final.

Nada generado en Flow todavía.

## Siguiente
1. `python -I make_sheets.py --reupload > sheets_log.txt` (solo sube las 6 copias; imprime "FIN HOJAS").
2. `python -I clips.py > clips_log.txt`, con un Monitor sobre "^FIN P2", Traceback e "intento 6".
3. QA (qa_clips.md), regenerar con `python -I clips.py <ids> > clips_log2.txt`.
4. `python -I phr.py`, pasar la EDL a rangos y correr `python -I edit.py`.
5. Verificar sincronía en 5 puntos, ritmo ≤2 s, LUFS y pico, marca VISTA STORIES arriba al centro.
6. Telegram con caption.txt (3er arg = VISTA).

## Revisar en el QA
- Geografía: Higinio y Maclovio IZQ.; Gildardo y Eulogio DER. (Gildardo en la tarima con micrófono en c07 y c09); Rosendo CENTRO.
- Luz: noche hasta c14, azul del alba c15–c30, amanecer dorado i07–c34.
- Utilería: sombrero en las manos de Higinio (no en la cabeza hasta el CTA); un solo micrófono; radio en la mano derecha de Eulogio hasta i03; el estuche pasa a Gildardo en i06; camiones ganaderos sin logos ni placas.
- i04: el que se va de espaldas debe ser Eulogio (calvo, chamarra de cuero negra), manos vacías.
- c07/c09: la voz por micrófono no debe salir con eco exagerado ni subtítulos.
- Fallos de Omni: subtítulos quemados, frases repetidas, 2.ª frase perdida, morphs.
- Pronunciación: "Higinio", "Rosendo", "Gildardo", "limosna", "mañanitas", "esperándote".
- 2026-11-08 noche: clips 47/47 (FIN P2). Desde c12 Flow no veía las hojas (NOREF en c12/c13): pausa, --reupload, regenerados. QA (lv3 + hojas): Flow devolvió clips cruzados/mudos → regenerados c11 (subtítulo quemado), c13 ("don Iginio" en lines.json; aún suena "Eugenio"), c16, c19, c20, c23, c24, c26, c30, c32 (luz de amanecer), c33, c34, i03, i04 (Eulogio de espaldas), i05; tras la revisión API: c12 (noche cerrada) y r5 (cara de Gildardo).
- renders/share.mp4: 133.6 s, 85 tramos (1.59 s/tramo), -14.2 LUFS, -1.7 dBTP, sync 0 ms en 8 puntos, BLACK 125.7 s, VISTA arriba al centro. Revisión API: renders/share_revision.md (v1). NO enviado a Telegram.
