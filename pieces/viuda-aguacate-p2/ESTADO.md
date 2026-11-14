---
type: handoff
status: active
tags: [atrium, novelas, mexi-stories, parte2, historia-propia, capos, matriarca]
relatedTo: [viuda-aguacate, fonda-chela-p2, atrium-vista]
---
# viuda-aguacate-p2 (La Viuda del Aguacate · Parte 2): estado

## La historia
Parte 2 de pieces/viuda-aguacate. Nicandro manda llamar a su hijo Arnulfo (el comprador) antes de que se meta el sol. Arnulfo llega solo en camioneta blanca; Ponciano confiesa que Arnulfo pidió hacerlo rápido y sin ruido. Momento cálido: Lauro era el padrino de Arnulfo. Castigos sin armas ni sangre: Ponciano rompe las escrituras, entrega su sello de notario y el maletín (cerrado) pasa a Fito para los 40 cortadores; Wences suelta el radio y se va a pie con el licenciado; Arnulfo entrega llaves de su camioneta y de sus tres huertas (pasan a Engracia) y queda una temporada de cortador bajo Fito, sin apellido. Cierre: "Mi palabra pesa más que mi apellido"; se mete el sol. CTA con dilema; historia cerrada (sin Parte 3). Sin Navidad. Guion pasado por la skill humanizer.

## Marca
**MEXI STORIES**, la misma de la Parte 1 (no entra en la rotación): edit.py, BRAND = "MEXI". Sin carpeta music/ propia.

## Archivos listos
- guion.md y caption.txt (formato Parte 2, #parte2, sin anunciar tercera parte).
- lines.json: fuente única de clips.py (359 palabras, ≤7 por frase salvo el CTA).
- clips.py: 47 clips (c01–c34 hablados, i01–i08 insertos sin caras, r1–r5 reacciones mudas), 294 s de generación. Copia del clips.py de viuda-aguacate con todas sus defensas (gaze+ONE+ALONE, NOSUB+CLEAN+END, NODOUBLE, SAFE/SOFT con las frases fuertes de este diálogo, variant, NOREF con Arnulfo, TRIES=6, gatito en imagen, reload_flow, new_project, descarga corrupta, 17 s). Acepta IDs, mueve la versión vieja a clips/old/ e imprime "FIN P2". `python -c "import clips"` OK.
- make_sheets.py: 6 hojas de la Parte 1 copiadas en chars/ (ENGRACIA_MURGUIA, FITO_CUEVAS, PONCIANO_UGALDE, WENCES_PICHARDO, NICANDRO_SOLORZANO, LOC_HUERTAGUACATE) + 1 NUEVA a generar: ARNULFO_SOLORZANO. Las copias no cuentan como DUPLICADO (skip viuda-aguacate y viuda-aguacate-p2; también se ajustó viuda-aguacate/make_sheets.py para ignorar la copia de la P2). Imprime "FIN HOJAS".
- phr.py.
- edit.py: plantilla viuda-aguacate, EDL en BORRADOR por índices de frase (82 tramos), mudos con ganancia 0, BLACK 0.4 s antes de c34. Música: suspenso hasta c10, cálida c10–c13, suspenso hasta el final. Salida renders/share.mp4.

## Hoja nueva
ARNULFO_SOLORZANO (40, "ordinary non-famous face", quijada cuadrada, pelo negro corto de lado, lampiño, lunar en mejilla izquierda, saco azul marino, camisa azul clara, reloj de oro en la izquierda, mocasines café). Nombre verificado único en pieces/*/clips.py y make_sheets.py.

Nada generado en Flow todavía.

## Siguiente
1. `python -I make_sheets.py --reupload > sheets_log.txt` (sube las 6 copias y genera + sube ARNULFO; imprime "FIN HOJAS"). Revisar DUPLICADO, `md5sum chars/*.jpg`, y que Arnulfo no se parezca a Ponciano ni a Wences.
2. `python -I clips.py > clips_log.txt`, con un Monitor sobre "^FIN P2", Traceback e "intento 6".
3. QA (qa_clips.md): hoja de fotogramas, franja inferior y bordes. Regenerar con `python -I clips.py <ids> > clips_log2.txt`.
4. `python -I phr.py` / lv3, pasar la EDL a rangos y correr `python -I edit.py`.
5. Verificar sincronía en 5 puntos, ritmo ≤2 s de media, LUFS y pico, marca MEXI STORIES visible arriba a la derecha.
6. Telegram con caption.txt (3er arg = MEXI).

## Revisar en el QA
- Geografía: Engracia y Fito IZQ.; Ponciano, Wences y Arnulfo DER. (Arnulfo con la camioneta blanca detrás); Nicandro CENTRO.
- Arnulfo: igual a su hoja en todos los clips; si sale en el intento 5 (sin hoja), compararlo cara a cara. Ningún doble de saco azul marino, rebozo gris, sombrero de palma, traje de lino ni cola de caballo.
- Luz: atardecer bajo en todo; puesta de sol solo en i08, c33 y c34.
- Utilería: maletín siempre CERRADO (i05, c19), escrituras rotas sin texto legible (i04), llavero en la mano IZQUIERDA de Engracia (c31, c34), smartphone de Ponciano en la oreja derecha (c02), bastón en la derecha de Nicandro; camionetas sin logos ni placas.
- i06: los dos de espaldas deben ser Ponciano (calvo, lino beige) y Wences (cola de caballo, guinda), manos vacías.
- Fallos de Omni: subtítulos quemados, frases repetidas, 2.ª frase perdida, morphs.
- Pronunciación: "Arnulfo", "Nicandro", "Engracia", "Uruapan", "injertar".

## Avance 2026-11-08
- Clips 47/47 al primer intento, sin md5 duplicados. QA: c12 regenerado (Arnulfo sin saco → saco azul marino). c32 (dos bastones) tapado con crop 480x853; i02 solo desde 3.3 s (mujer ajena 0-3 s); bordes de c11/c16/c20/c24/c29/c30/c33 con arranque o crop (renders/edlcfg.json).
- EDL generada desde renders/lv3.json (scratchpad mkedl_p2.py): frases por envolvente, pausas internas ≥0.5 s cortadas, ganancia -19.5-LUFS.
- renders/share.mp4: 143.0 s, 83 tramos (1.74 s/tramo), -14.2 LUFS, -1.8 dBTP, sync 0 ms en 6 puntos. Revisión API: renders/share_revision.md. NO enviado a Telegram.
