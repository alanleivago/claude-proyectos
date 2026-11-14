---
type: handoff
status: active
tags: [atrium, novelas, majestic-stories, parte1, historia-propia, capos]
relatedTo: [fonda-chela, reten-sierra, medalla-mezcal, atrium-vista]
---
# velorio-patron (El Velorio del Patrón · Parte 1): estado

## La historia
Historia propia tipo capos, premisa n.º 3 de fuentes/atrium-vista/resumen.md. En el velorio de don Eleuterio (rebautizado porque CIPRIANO_ROBLES ya existía), los hijos Leonel e Ivonne corren a Nati, la cocinera de 25 años: diez minutos y tres mil pesos. El licenciado Efrén lee la carta: el anillo es para Nati, y los doce de la escolta, con Nazario al frente, solo obedecen a quien lo trae. Sin el anillo no hay firma para la venta de ocho millones de mañana. Siguen el momento cálido (ella lo cuidó al final), la oferta de Leonel, el "¿qué ordena?", el portón que se cierra, la cita de mañana a las ocho y la carta sellada solo para ella. El castigo queda para la Parte 2. Sin Navidad. Guion pasado por la skill humanizer.

## Marca
**MAJESTIC STORIES**: edit.py, BRAND = "MAJESTIC" (arriba a la izquierda, música de pieces/_marcas/MAJESTIC). Sin carpeta music/ propia.

## Archivos listos
- guion.md y caption.txt (formato Parte 1, #parte1, anuncia la segunda parte).
- lines.json: fuente única de clips.py (384 palabras).
- clips.py: 47 clips (c01–c32 hablados, i01–i09 insertos sin caras, r1–r6 reacciones mudas), 292 s de generación. Copia del clips.py de fonda-chela con todas sus defensas: SAFE/SOFT (con las frases fuertes de este diálogo y "wake"), variant, NOREF (también quita las hojas de locación), TRIES=6, gatito de control, reload_flow(), new_project(), comprobación de descarga corrupta con ffmpeg y 17 s entre clips. Acepta IDs, mueve la versión vieja a clips/old/ e imprime "FIN P1".
- make_sheets.py: 7 hojas (5 personajes, 2 locaciones) con control md5 DUPLICADO y --reupload; imprime "FIN HOJAS".
- phr.py.
- edit.py: EDL en borrador por índices de frase (80 tramos), mudos con ganancia 0, BLACK 0.4 s antes de c32. Música: suspenso hasta c22, cálida de c22 a c26 y suspenso hasta el final. Salida en renders/v1.mp4.

## Hojas nuevas
Aún no se generaron. Nombres verificados como únicos en pieces/*/clips.py y make_sheets.py (ni nombre ni apellido se repiten).
- Personajes: NATI_CERVERA, LEONEL_GARIBAY, IVONNE_GARIBAY, EFREN_SOTOMAYOR, NAZARIO_QUEZADA.
- Locaciones: LOC_PATIOVELORIO, LOC_COCINAGARIBAY.

Nada generado en Flow todavía.

## Siguiente
1. `python -I make_sheets.py > sheets_log.txt` (imprime "FIN HOJAS"). Revisar que no haya DUPLICADO, correr `md5sum chars/*.jpg` y armar hoja de contactos: Leonel (lentes, bigote, traje negro) contra Nazario (barba blanca, camisa negra); Ivonne (perlas, caoba) contra Nati (trenza, mandil); Efrén calvo y de café. Que ninguna cara se parezca a un actor conocido.
2. `python -I clips.py > clips_log.txt`, con un Monitor sobre "^FIN P1", Traceback e "intento 6".
3. QA con hoja de fotogramas, franja inferior y bordes (qa_clips.md). Regenerar con `python -I clips.py <ids> > clips_log2.txt`.
4. `python -I phr.py`, pasar la EDL a rangos (renders/phr.json) y correr `python -I edit.py`.
5. Verificar sincronía en 5 puntos, ritmo de 2 s o menos de media, LUFS y pico, y la marca MAJESTIC STORIES visible a tamaño real (arriba a la izquierda).
6. Telegram con caption.txt (3er arg = MAJESTIC).

## Revisar en el QA
- Geografía: Nati IZQ. junto a la puerta de la cocina; Leonel e Ivonne DER.; Efrén junto a la caja; Nazario delante de los arcos.
- Dobles: ningún segundo hombre con lentes, de barba blanca o de traje café; ninguna segunda mujer de mandil o de perlas. Los escoltas de lentes oscuros solo en los insertos.
- Utilería: un solo anillo (en la palma hasta r3, en la mano DERECHA de Nati desde i05); la carta doblada en la carpeta; el sobre con lacre solo en c31/i09; la caja del patrón siempre cerrada, sin foto ni letras.
- Poder sin armas: escoltas de manos cruzadas, nadie toca a nadie en i07.
- Fallos de Omni: subtítulos quemados, frases repetidas, 2.ª frase perdida, morphs.
- Pronunciación de "Eleuterio", "Nazario" y "ocho millones".

## Hojas y clips (2026-11-08)
- 7 hojas generadas (make_sheets.py, sheets_log.txt): ningún DUPLICADO, md5 distintos, revisadas a ojo: cada una coincide con su descripción, sin gatitos ni caras de actores conocidos (Nati aparenta algo más de 25, aviso). Ninguna rehecha.
- `python -I clips.py >> clips_log.txt` en marcha (se pausó una vez tras c04 para regenerar c13 de fonda-chela-p2 y se relanzó; salta los clips ya hechos).
- Revisar en el QA: **c04 salió en el intento 6** (prompt mínimo: solo la 1.ª línea de diálogo) y c03 en el 2; i01 en el 3.

## Montaje v1 (2026-11-08) — renders/share.mp4, LISTO para revisión (NO enviado a Telegram)
- **Flow devolvió el video anterior en 6 clips** (md5 idéntico: c06=r1, c07=r2, c09=c12, i04=c10, c25=c24, c31=r6). c05 era un mudo de Leonel. Regenerados c04 (2.ª frase), c05, c06, c07, c09, c25, c31, i04 e i06, todos OK. clips.py ahora descarta descargas con el md5 de otro clip ("DUPLICADO"). Detalle en qa_clips.md.
- **i06**: v3 (trajes grises, sin velorio) pasó la política, pero quedó FUERA del montaje porque no coincide con la escolta de negro y gafas. **i05** fuera (mano envejecida con manga larga).
- **edit.py** (plantilla viuda-aguacate, BRAND = "MAJESTIC", música suspenso / cálida c22–c26 / suspenso):
  - 148.6 s, 75 cortes (1.98 s por corte), 98 planos contando punch-ins y crops (1.51 s por plano).
  - −14.3 LUFS, −1.8 dBTP. Sincronía ±6 ms en 6 puntos.
- **Revisión** (tools/revisar_render.py → renders/share_revision.md, veredicto CASI) y hojas de contacto. Los falsos positivos (desfase, voz sobre quien escucha) están descartados con medición. Quedan avisos para el usuario:
  - CTA con anillos en las dos manos.
  - c22 con el ataúd sin flores.
  - c28 con un grade algo más frío.
  - Posibles "alargarte" (c01) y "nada al licenciado" (c25).
- Siguiente: decisión del usuario sobre los avisos y luego Telegram con caption.txt (3er arg = MAJESTIC).
