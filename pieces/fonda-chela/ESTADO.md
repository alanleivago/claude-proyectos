---
type: handoff
status: active
tags: [atrium, novelas, vista-stories, parte1, historia-propia, capos]
relatedTo: [reten-sierra, medalla-mezcal, foto-trucada, atrium-vista]
---
# fonda-chela (El Jefe Nuevo · Parte 1): estado

## La historia
- Historia propia tipo capos, sobre la premisa n.º 1 de fuentes/atrium-vista/resumen.md. Saúl, el jefe nuevo, le cobra a doña Chela 50 mil antes del domingo. Ella le manda el café a la mesa del fondo, donde desayuna don Macario, el que le dio el pueblo. Hay convoy de siete camionetas, el anillo, un plazo (lo que dura el café) y el maletín cerrado. Macario deja que Chela decida; el castigo queda para la Parte 2. Sin Navidad.
- Guion pasado por la skill humanizer: frases de 8 palabras como máximo (salvo el CTA), sin contrastes de relleno.

## Marca
**VISTA STORIES**: edit.py, BRAND = "VISTA". Música y marca de agua de pieces/_marcas/VISTA (brand, brand_wm). Sin carpeta music/ propia.

## Archivos listos
- guion.md y caption.txt (formato Parte 1, #parte1).
- lines.json: fuente única de clips.py (389 palabras).
- clips.py, con 48 clips (c01–c36 hablados, i01–i07 insertos sin caras, r1–r5 reacciones mudas), 320 s de generación.
  - Planos hablados de una persona: gaze(side) + ONE + ALONE; NOSUB + CLEAN + END en cada diálogo; NODOUBLE en los de riesgo.
  - SAFE/SOFT, incluidas las frases fuertes del diálogo; variant, NOREF (también quita las hojas de locación), TRIES=6, gatito de control, reload_flow() y 17 s entre clips.
  - Acepta IDs, mueve la versión vieja a clips/old/ e imprime "FIN P1".
- make_sheets.py: 7 hojas (5 personajes, 2 locaciones) con control md5 DUPLICADO y --reupload; imprime "FIN HOJAS".
- phr.py.
- edit.py: EDL en borrador por índices de línea (85 segmentos), mudos con ganancia 0, i01 de ~1 s y BLACK 0.4 s antes de c36. Música: suspenso hasta c30, cálida de c30 a c33 y suspenso hasta el final. Salida en renders/v1.mp4.

## Hojas nuevas
Aún no se generaron. Nombres verificados como únicos en pieces/*/clips.py y make_sheets.py (ni el nombre ni el apellido se repiten).
- Personajes: CHELA_VILLEGAS, TAVO_VILLEGAS, SAUL_BETANCOURT, ROLANDO_ALCOCER (el Güero) y MACARIO_LEDESMA.
- Locaciones: LOC_FONDACHELA y LOC_CALLEFONDA.

Nada generado en Flow todavía.

## Siguiente
1. `python -I make_sheets.py > sheets_log.txt` (imprime "FIN HOJAS"). Revisar que no haya DUPLICADO, correr `md5sum chars/*.jpg` y armar hoja de contactos: Chela (gris, lila) contra Macario; Saúl (barba, traje gris) contra el Güero (rubio, chamarra de piel negra); Tavo (camisa blanca).
2. `python -I clips.py > clips_log.txt`, con un Monitor sobre "^FIN P1", Traceback e "intento 6".
3. QA con hoja de fotogramas, franja inferior y bordes. Regenerar con `python -I clips.py <ids> > clips_log2.txt`.
4. `python -I phr.py`, pasar la EDL a rangos (renders/phr.json) y correr `python -I edit.py` (o `--remix`).
5. Verificar sincronía en 5 puntos, ritmo de 2 s o menos de media, LUFS y pico, y la marca VISTA STORIES visible a tamaño real (arriba al centro).
6. Telegram con caption.txt (3er arg = VISTA).

## Revisar en el QA
- Geografía: en el mostrador, Chela IZQ. y Saúl DER.; en la mesa del fondo, Saúl de pie IZQ. y Macario sentado DER.; el Güero en la puerta mira a la IZQ.
- Dobles: ningún segundo traje gris, chamarra de piel negra, sombrero gris ni mandil blanco.
- Utilería: un solo jarro de barro (Macario no tiene taza antes de c14); anillo en la mano DERECHA de Macario; maletín siempre CERRADO; camionetas sin logos ni placas.
- Poder sin armas: los escoltas de i03 de manos cruzadas, nada en las manos.
- Fallos de Omni: subtítulos quemados, frases repetidas, 2.ª frase perdida y morphs.
- Pronunciación de "Macario", "Ledesma", "cafecito" y "fiado".
