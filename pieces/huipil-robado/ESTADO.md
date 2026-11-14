---
type: handoff
status: active
tags: [atrium, novelas, vista-stories, parte1, historia-propia, referencias3]
relatedTo: [masa-honrada, tiendita-justa, referencias3]
---
# huipil-robado (El Huipil Robado · Parte 1): estado

## La historia
- Historia propia inspirada en la premisa n.º 4 de fuentes/referencias3/resumen.md (ref ★ 7701016469173292310 de @relatos.de.vida.9, 1.9M). Mismos beats de los virales, con personajes, nombres, diálogo y prueba final nuevos; atuendos de la ref en otros colores.
- Doña Tomasa (bordadora de la sierra de Oaxaca) y su sobrina Yaretzi (29) descubren que Romina revende sus blusas como "diseño exclusivo". Romina cancela el pedido, pide de vuelta el hilo y con una queja falsa de copia les quitan la mesa de la feria. Gancho: cada blusa lleva un colibrí bordado dentro de la manga, la prueba que Tomasa enseñará en la presentación de Romina. Sin Navidad.
- Guion pasado por la skill humanizer: frases cortas de telenovela, sin rayas ni contrastes de relleno.

## Marca
**VISTA STORIES**: edit.py, BRAND = "VISTA". La música y la marca de agua salen de pieces/_marcas/VISTA (brand, brand_wm). No hay carpeta music/ propia.

## Archivos listos
- guion.md y caption.txt (formato Parte 1, #parte1).
- lines.json: fuente única de clips.py (511 palabras, unos 225–240 s en bruto; montaje objetivo 2:00–2:20).
- clips.py, con 39 clips (c01–c35 y r1–r4). Suman 284 s de generación.
  - Todos los planos son de una persona: gaze(side) + ONE + ALONE (el insert r4 son solo las manos de Tomasa, con SOLO).
  - NOSUB + CLEAN + END en cada diálogo; NODOUBLE en los de riesgo.
  - SAFE/SOFT, incluidas las frases fuertes del diálogo.
  - variant, NOREF (también quita las hojas de locación), TRIES=6, gatito de control y 17 s entre clips.
  - Acepta IDs, mueve la versión vieja a clips/old/ e imprime "FIN P1".
- make_sheets.py: 9 hojas con control md5 DUPLICADO y --reupload; imprime "FIN HOJAS".
- phr.py.
- edit.py: EDL en borrador por índices de línea, ganancia 0 en los mudos y BLACK 0.4 s antes de c35. Música: suspenso hasta c10, cama cálida de c10 a c14 (deciden bajar a la feria) y suspenso de c14 al final. Loudnorm en dos pasadas y --remix. Salida en renders/v1.mp4.

## Hojas nuevas
Aún no se generaron. Los nombres se verificaron como únicos en pieces/*/clips.py y make_sheets.py.
- Personajes: TOMASA_SANABRIA, YARETZI_SANABRIA, ROMINA_ARRIOLA, CRESCENCIA_LOPEZ y OFELIA_FERIANTE.
- Locaciones: LOC_PATIOTOMASA, LOC_BOUTIQUEROM, LOC_FERIACARPA y LOC_CALLEFERIA. Simples: sin letreros, precios ni marcas, globos ni altar.

Nada generado en Flow todavía.

## Siguiente
1. `python -I make_sheets.py > sheets_log.txt` (imprime "FIN HOJAS"). Revisar que no haya DUPLICADO, correr `md5sum chars/*.jpg` y armar hoja de contactos: Tomasa (trenzas grises, rebozo vino) contra Crescencia (chongo gris, rebozo mostaza); Romina (blazer marfil) contra Ofelia (blusa verde azulado, cárdigan gris).
2. `python -I clips.py > clips_log.txt`, con un Monitor sobre "^FIN P1", Traceback e "intento 6".
3. QA con hoja de fotogramas, franja inferior y bordes. Regenerar con `python -I clips.py <ids> > clips_log2.txt`.
4. `python -I phr.py`, pasar la EDL a rangos (renders/phr.json) y correr `python -I edit.py` (o `--remix`).
5. Verificar sincronía en 5 puntos, ritmo ≤ 1.9 s, LUFS y pico, y la marca VISTA STORIES visible a tamaño real.
6. Telegram con caption.txt (3er arg = VISTA).

## Revisar en el QA
- Geografía: patio escena 1, Romina DER. y Tomasa/Yaretzi IZQ.; patio escenas 2 a 5, Tomasa IZQ. y Yaretzi/Crescencia DER.; feria, Ofelia/Romina DER. y Tomasa/Yaretzi IZQ.; calle, Tomasa IZQ.
- Dobles: ningún segundo rebozo vino, blazer marfil, cárdigan verde, rebozo mostaza ni blusa verde azulado. Sin otras bordadoras de fondo.
- Utilería: celular con la pantalla de espaldas; la blusa de flores moradas y amarillas igual en todos los planos; colibrí morado en r4.
- Sin lentes de sol en la cabeza de Romina, sin gafete en Ofelia, sin globos ni letreros en la feria.
- Fallos de Omni: subtítulos quemados, frases repetidas, 2.ª frase perdida y morphs.
- Riesgos: c14/c15 llamada (que no salga Ofelia en pantalla dividida); r4, insert de manos (que no salga texto ni otra mano); pronunciación de "Yaretzi", "Crescencia", "colibrí" y "desenmascarar".
