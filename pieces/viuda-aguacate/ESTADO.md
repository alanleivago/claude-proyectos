---
type: handoff
status: active
tags: [atrium, novelas, mexi-stories, parte1, historia-propia, capos, matriarca]
relatedTo: [fonda-chela, monedas-carretera, reten-sierra, medalla-mezcal, atrium-vista]
---
# viuda-aguacate (La Viuda del Aguacate · Parte 1): estado

## La historia
- Historia propia tipo capos con protagonista matriarca, sobre la premisa n.º 2 de fuentes/atrium-vista/resumen.md. El notario Ponciano le pone candado a la huerta de doña Engracia: 72 horas para irse y cien mil por una huerta de ocho millones. Ella marca el único número del celular de su difunto Lauro y llega don Nicandro con ocho camionetas. Hay un plazo invertido (hasta que se meta el sol) y el maletín siempre cerrado. Gancho: el comprador es Arnulfo, el hijo de Nicandro. El castigo queda para la Parte 2. Sin Navidad.
- Los nombres de la premisa se cambiaron porque ya existían: Esperanza (chocolate-rancho-p2) pasó a Engracia y Ramón (reten-sierra-p2, fierro-herradura) a Lauro.
- Guion pasado por la skill humanizer: frases de 8 palabras como máximo (salvo el CTA), sin contrastes de relleno.

## Marca
**MEXI STORIES**: edit.py, BRAND = "MEXI". Música y marca de agua de pieces/_marcas/MEXI (brand, brand_wm), arriba a la derecha. Sin carpeta music/ propia.

## Archivos listos
- guion.md y caption.txt (formato Parte 1, #parte1).
- lines.json: fuente única de clips.py (382 palabras).
- clips.py, con 48 clips (c01–c36 hablados, i01–i07 insertos sin caras, r1–r5 reacciones mudas), 318 s de generación. Es la copia del clips.py de fonda-chela con todas sus defensas:
  - Planos hablados de una persona: gaze(side) + ONE + ALONE; NOSUB + CLEAN + END en cada diálogo; NODOUBLE en los de riesgo.
  - SAFE/SOFT (con las frases fuertes del diálogo), variant, NOREF (también quita las hojas de locación), TRIES=6, gatito de control, reload_flow(), new_project() tras dos caídas, comprobación de descarga corrupta con ffmpeg y 17 s entre clips.
  - Acepta IDs, mueve la versión vieja a clips/old/ e imprime "FIN P1".
- make_sheets.py: 7 hojas (5 personajes, 2 locaciones) con control md5 DUPLICADO y --reupload; imprime "FIN HOJAS".
- phr.py.
- edit.py: EDL en borrador por índices de línea (85 segmentos), mudos con ganancia 0, i01 de ~1 s y BLACK 0.4 s antes de c36. Música: suspenso hasta c27, cálida de c27 a c30 y suspenso hasta el final. Salida en renders/v1.mp4.

## Hojas nuevas
Aún no se generaron. Nombres verificados como únicos en pieces/*/clips.py y make_sheets.py (ni el nombre ni el apellido se repiten en otras piezas).
- Personajes: ENGRACIA_MURGUIA, FITO_CUEVAS, PONCIANO_UGALDE, WENCES_PICHARDO y NICANDRO_SOLORZANO.
- Locaciones: LOC_HUERTAGUACATE y LOC_COCINAENGRACIA. c16 (Nicandro en su camioneta) va sin hoja.

Nada generado en Flow todavía.

## Siguiente
1. `python -I make_sheets.py > sheets_log.txt` (imprime "FIN HOJAS"). Revisar que no haya DUPLICADO, correr `md5sum chars/*.jpg` y armar hoja de contactos: Engracia (gris corto, rebozo) contra Nicandro (sombrero de palma, bastón); Ponciano (calvo, lentes, lino beige) contra Wences (cola de caballo, guinda); Fito (gorra beige, verde olivo).
2. `python -I clips.py > clips_log.txt`, con un Monitor sobre "^FIN P1", Traceback e "intento 6".
3. QA con hoja de fotogramas, franja inferior y bordes. Regenerar con `python -I clips.py <ids> > clips_log2.txt`.
4. `python -I phr.py`, pasar la EDL a rangos (renders/phr.json) y correr `python -I edit.py` (o `--remix`).
5. Verificar sincronía en 5 puntos, ritmo de 2 s o menos de media, LUFS y pico, y la marca MEXI STORIES visible a tamaño real (arriba a la derecha).
6. Telegram con caption.txt (3er arg = MEXI).

## Revisar en el QA
- Geografía: en el portón, Engracia y Fito a la IZQ., Ponciano y Wences a la DER., Nicandro al CENTRO; en la cocina, Engracia IZQ. junto al ropero y Fito DER. en la puerta.
- Dobles: ningún segundo traje de lino beige, rebozo gris, sombrero de palma ni cola de caballo.
- Utilería: un solo candado, una sola caja de aguacates, el celular siempre en la mano IZQUIERDA de Engracia, el maletín siempre CERRADO, el bastón en la mano derecha de Nicandro; camionetas sin logos ni placas.
- Poder sin armas: los escoltas de i06 de manos cruzadas, nada en las manos.
- Pantalla del celular (i04): solo brillo, sin texto ni cara dentro.
- Fallos de Omni: subtítulos quemados, frases repetidas, 2.ª frase perdida y morphs.
- Pronunciación de "Engracia", "Nicandro", "Solórzano", "Uruapan" y "Arnulfo".

## Montaje v1 (2026-11-08)
- c24 regenerado OK (large-v3: "Soy Nicandro Solórzano. Licenciado, usted me firmó unos papeles en Zamora."); lv3.json actualizado. Viejo en clips/old/c24_v1.mp4.
- renders/share.mp4: 156.2 s, 104 planos, 1.50 s/plano, -14.2 LUFS, pico -1.8 dBTP; sincronía 0 ms en 5 puntos. Crops extra vistos en el render: c09 (rebozo ajeno abajo DER. hasta 1.5) y c25 (figura blanca IZQ. hasta 1.1). Revisión API: renders/share_revision.md.
- Falta: Telegram (no enviado).
