---
type: handoff
status: active
tags: [atrium, novelas, majestic-stories, parte1, historia-propia, capos]
relatedTo: [reten-sierra, medalla-mezcal, foto-trucada, atrium-vista]
---
# monedas-carretera (La Gasolinera · Parte 1): estado

## La historia
- Historia propia tipo capos, sobre la premisa n.º 7 de fuentes/atrium-vista/resumen.md. La 4 ("El Valet") se descartó porque se parecía demasiado a pedida-mano. Kevin, el encargado, le tira al piso las monedas a don Amador (mil doscientos de diésel, "un minuto para quitar su troca"). Llegan siete camionetas: Amador es dueño de media carretera y del terreno. Le da diez minutos para recoger cada moneda; falta la de la crucecita y la tenía Memo. Gancho: el dueño es el papá de Kevin y Amador vino por él. El castigo queda para la Parte 2. Sin Navidad.
- La carpeta se llama monedas-carretera porque pieces/gasolinera y pieces/monedas ya existen (son piezas bitstory, no novelas).
- Guion pasado por la skill humanizer: frases de 8 palabras como máximo (salvo el CTA), sin contrastes de relleno.

## Marca
**MAJESTIC STORIES**: edit.py, BRAND = "MAJESTIC". Música y marca de agua de pieces/_marcas/MAJESTIC (brand, brand_wm). Sin carpeta music/ propia.

## Archivos listos
- guion.md y caption.txt (formato Parte 1, #parte1).
- lines.json: fuente única de clips.py (382 palabras).
- clips.py, con 47 clips (c01–c35 hablados, i01–i07 insertos sin caras, r1–r5 reacciones mudas), 300 s de generación.
  - Planos hablados de una persona: gaze(side) + ONE + ALONE; NOSUB + CLEAN + END en cada diálogo; NODOUBLE en los de riesgo.
  - SAFE/SOFT, incluidas las frases fuertes del diálogo; variant, NOREF (también quita las hojas de locación), TRIES=6, gatito de control, reload_flow() y 17 s entre clips.
  - Acepta IDs, mueve la versión vieja a clips/old/ e imprime "FIN P1".
- make_sheets.py: 6 hojas (4 personajes, 2 locaciones) con control md5 DUPLICADO y --reupload; imprime "FIN HOJAS".
- phr.py.
- edit.py: EDL en borrador por índices de línea (83 segmentos), mudos con ganancia 0, i01 de ~1 s y BLACK 0.4 s antes de c35. Música: suspenso hasta c08, cálida de c08 a i03 y suspenso hasta el final. Salida en renders/v1.mp4.

## Hojas nuevas
Aún no se generaron. Nombres verificados como únicos en pieces/*/clips.py y make_sheets.py (ni el nombre ni el apellido se repiten).
- Personajes: AMADOR_QUINTANAR, KEVIN_BARRON, MEMO_RANGEL y BENIGNO_ARTEAGA.
- Locaciones: LOC_GASCARRETERA y LOC_TRAMODESIERTO.

Nada generado en Flow todavía.

## Siguiente
1. `python -I make_sheets.py > sheets_log.txt` (imprime "FIN HOJAS"). Revisar que no haya DUPLICADO, correr `md5sum chars/*.jpg` y armar hoja de contactos: Amador (barba blanca, sombrero de paja crema) contra Benigno (bigote negro, sombrero negro); Kevin (rojo) contra Memo (azul marino).
2. `python -I clips.py > clips_log.txt`, con un Monitor sobre "^FIN P1", Traceback e "intento 6".
3. QA con hoja de fotogramas, franja inferior y bordes. Regenerar con `python -I clips.py <ids> > clips_log2.txt`.
4. `python -I phr.py`, pasar la EDL a rangos (renders/phr.json) y correr `python -I edit.py` (o `--remix`).
5. Verificar sincronía en 5 puntos, ritmo de 2 s o menos de media, LUFS y pico, y la marca MAJESTIC STORIES visible a tamaño real (arriba a la izquierda).
6. Telegram con caption.txt (3er arg = MAJESTIC).

## Revisar en el QA
- Geografía: Amador IZQ. junto a su troca blanca; Kevin DER. junto a la bomba; Memo al centro; Benigno IZQ. frente a las camionetas.
- Dobles: ningún segundo polo rojo, camisa azul marino, sombrero de paja crema ni sombrero negro.
- Utilería: un solo monedero (mano IZQUIERDA de Amador), una sola moneda con cruz (i07), una sola troca blanca; gasolinera sin logos, precios ni números; camionetas sin placas.
- Poder sin armas: los escoltas de i05 de manos cruzadas, nada en las manos.
- Fallos de Omni: subtítulos quemados, frases repetidas, 2.ª frase perdida y morphs.
- Pronunciación de "Quintanar", "Benigno", "diésel", "alcancía" y "crucecita".

## Montaje v1 (2026-11-07)
renders/v1.mp4: 153.3 s, 90 planos (1.70 s/plano), -14.3 LUFS. edit.py por frases desde renders/lv3.json; el 5.º campo acepta (clip, t, vf) = inserto encima de la voz (i02, i04, r3; J-cut de c33 sobre c32). Música: tensión 0-c08, cálida c08-c09, tensión desde c10. Falta: Telegram (no enviado).
