---
type: handoff
status: active
tags: [atrium, novelas, sin-marca, parte1, historia-propia, capos, matriarca]
relatedTo: [fonda-chela, monedas-carretera, reten-sierra, medalla-mezcal, atrium-vista]
---
# madrina-central (La Madrina de la Central · Parte 1): estado

## La historia
- Historia propia tipo capos con protagonista matriarca, sobre la premisa n.º 6 de fuentes/atrium-vista/resumen.md. El agiotista Gaspar le engancha la grúa al tráiler de Rubén el día que nace su hija: ochenta mil, hasta las seis. Rubén busca a doña Eva, que manda cerrar las puertas de la Central. Gaspar resulta ser su ahijado; ella le devuelve el mismo plazo (hasta las seis) para regresar el tráiler y los papeles de todos. Gancho: llega llorando Imelda, la mamá de Gaspar y comadre de Eva. El castigo queda para la Parte 2. Sin Navidad.
- Los nombres de la premisa se cambiaron: Toño se parecía a Toña (TONA_ARELLANO) y pasó a Rubén. Doña Eva se conserva.
- Guion pasado por la skill humanizer: frases de 8 palabras como máximo (salvo el CTA), sin contrastes de relleno.

## Marca
**SIN MARCA**: edit.py, BRAND = "SINMARCA". brand_wm da un png transparente y la música sale de pieces/_marcas/SINMARCA. Sin carpeta music/ propia.

## Archivos listos
- guion.md y caption.txt (formato Parte 1, #parte1).
- lines.json: fuente única de clips.py (396 palabras).
- clips.py, con 47 clips (c01–c36 hablados, i01–i06 insertos sin caras, r1–r5 reacciones mudas), 312 s de generación. Es la copia del clips.py de fonda-chela con todas sus defensas:
  - Planos hablados de una persona: gaze(side) + ONE + ALONE; NOSUB + CLEAN + END en cada diálogo; NODOUBLE en los de riesgo.
  - SAFE/SOFT (con las frases fuertes del diálogo), variant, NOREF (también quita las hojas de locación), TRIES=6, gatito de control, reload_flow(), new_project() tras dos caídas, comprobación de descarga corrupta con ffmpeg y 17 s entre clips.
  - Acepta IDs, mueve la versión vieja a clips/old/ e imprime "FIN P1".
- make_sheets.py: 6 hojas (4 personajes, 2 locaciones) con control md5 DUPLICADO y --reupload; imprime "FIN HOJAS".
- phr.py.
- edit.py: EDL en borrador por índices de línea (84 segmentos), mudos con ganancia 0, i01 de ~1 s y BLACK 0.4 s antes de c36. Música: suspenso hasta c33, cálida de c33 a c35 y suspenso hasta el final. Salida en renders/v1.mp4.

## Hojas nuevas
Aún no se generaron. Nombres verificados como únicos en pieces/*/clips.py y make_sheets.py (ni el nombre ni el apellido se repiten en otras piezas).
- Personajes: EVA_SALDIVAR, RUBEN_GALINDO, GASPAR_LEYVA y PORFIRIO_TAPIA.
- Locaciones: LOC_PATIOCENTRAL y LOC_BODEGAEVA.

Nada generado en Flow todavía.

## Siguiente
1. `python -I make_sheets.py > sheets_log.txt` (imprime "FIN HOJAS"). Revisar que no haya DUPLICADO, correr `md5sum chars/*.jpg` y armar hoja de contactos: Eva (chongo negro, arracadas, cárdigan negro); Gaspar (rapado, camisa crema bordada, cadena) contra Porfirio (boina negra, bigote gris, azul marino); Rubén (barba, mezclilla).
2. `python -I clips.py > clips_log.txt`, con un Monitor sobre "^FIN P1", Traceback e "intento 6".
3. QA con hoja de fotogramas, franja inferior y bordes. Regenerar con `python -I clips.py <ids> > clips_log2.txt`.
4. `python -I phr.py`, pasar la EDL a rangos (renders/phr.json) y correr `python -I edit.py` (o `--remix`).
5. Verificar sincronía en 5 puntos, ritmo de 2 s o menos de media, LUFS y pico, y que no quede ninguna marca de agua.
6. Telegram con caption.txt (3er arg = SIN MARCA).

## Revisar en el QA
- Geografía: en el patio, Gaspar DER. junto a la grúa y Rubén IZQ. delante del tráiler; en la bodega, Eva sentada DER. tras el escritorio, Rubén y Gaspar IZQ., Porfirio en la cortina.
- Dobles: ninguna segunda camisa crema bordada, boina negra, cárdigan negro ni camisa de mezclilla.
- Utilería: un solo tráiler rojo sin logo, un solo llavero (mano DERECHA de Gaspar), una sola libreta negra sin texto legible, el radio al pecho de Porfirio; Central sin letreros, precios ni números.
- Poder sin armas: los cargadores de i05 de manos cruzadas, nada en las manos.
- Sin niños en cuadro: la hija de Rubén solo se nombra.
- Fallos de Omni: subtítulos quemados, frases repetidas, 2.ª frase perdida y morphs.
- Pronunciación de "Saldívar", "Melquiades", "tráiler", "redondees" e "Imelda".

## Montaje v1 (2026-11-08)
- c04 regenerado (Rubén bien) transcrito con lv3.py y metido en renders/lv3.json; tiene camisa de cuadros ajena en el borde DER. hasta ~2 s: crop 540:960:0:0 en la 1.ª frase.
- edit.py por frases (plantilla viuda-aguacate) con todo el QA aplicado -> renders/share.mp4: 155.4 s, 101 planos, 1.53 s/plano, -14.1 LUFS, pico -1.8 dBTP. Sincronía 0 ms en 5 puntos. Revisión API en renders/share_revision.md.
- Pendiente cuando Flow esté libre: c01 sale con una camisa de Gaspar sin el ribete negro ni las flechas de la hoja (regenerar c01 si el usuario lo pide). La blusa de Eva cambia de cuello en V a cuello de ojo de cerradura entre clips (r2, c13, c34, c36): no se corrigió.
- No se envió a Telegram.
