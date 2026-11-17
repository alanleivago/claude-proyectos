---
type: handoff
status: active
tags: [atrium, novelas, mexi-stories, parte1, remake-transformado, padre-hijos-herencia, justicia-familiar, aguascalientes, calvillo, guayaba]
relatedTo: [baul-sanmiguel, sarape-saltillo, hamaca-comalcalco, atrium-vista]
---
# ate-calvillo (El Ate de Calvillo · Parte 1): estado

## Video base
- Variante transformada del Final de la saga de don Evaristo de @atriumstories_, "Su padre por fin tomó una decisión" (7706344565933985054, 210K; saga 1.06M; tipo padre-hijos-herencia, mediana 276K en `fuentes/atrium-vista/ranking2.md`). Bajado con yt-dlp y analizado por API el 2026-11-15: `fuentes/atrium-vista/videos/7706344565933985054_analisis.md`.
- baul-sanmiguel y sarape-saltillo rehicieron la P1 y hamaca-comalcalco la P3; esta toma el Final: anuncio de la herencia frente al hijo ingrato, el reproche, la pareja que se culpa entre sí y el hijo que se quiebra.

## Qué se cambió
- Vínculo y región: un guayabero y su hija humilde, en un patio de adobe de Calvillo, Aguascalientes.
- Injusticia y plazo en c01: la nuera viene por el suegro "antes de que cuaje el ate" porque ya supo de las huertas. Se invierte: "Antes de que cuaje el ate, Marcela, me dejas las llaves."
- Herida: el hijo lo subió a un camión sin bajarse del carro (en vez de la puerta cerrada).
- Giro nuevo: la camioneta está a nombre del padre y la empacadora donde el hijo es gerente también es suya ("el lunes conoces a tu patrón").
- CTA: Cleofas a cámara, "¿Ustedes le devolverían las llaves a un hijo así?"
- Nombres nuevos y únicos en pieces/: Cleofas Elizalde (74), Eleazar Elizalde (48), Marcela Collado (44), Gertrudis Elizalde (41).

## Marca
**MEXI STORIES**: edit.py, BRAND = "MEXI" (kit pieces/_marcas/MEXI, con su música). SPEED = 1.15.

## Archivos
guion.md, caption.txt, lines.json (fuente única, 387 palabras), clips.py (38 clips: 29 hablados c01-c29, 2 insertos i01-i02 y 7 reacciones/presentaciones r1-r7), make_sheets.py (4 personajes + LOC_ATECALVILLO = 5 hojas), phr.py y edit.py (EDL vacía; música cálida de c14 a c19).
- Copia de hamaca-comalcalco con todas sus defensas: ots(), two(), MOUTH (+ GMOUTH en c25), tuplas (prompt_nuevo, prompt_one), ONE_FROM=3 y --one; gaze + ONE + ALONE, PRES, NOSUB + CLEAN + END, NODOUBLE; SAFE/SOFT con las frases fuertes primero, variant, NOREF, TRIES=6; gatito como IMAGEN, duplicados md5, reload_flow, new_project y la parada "LIMITE DE CREDITOS" en gen(). make_sheets.py con "ordinary non-famous face", DUPLICADO por md5 y --reupload que salta las carpetas ate-calvillo*.
- Encuadres: OTS 18 (50 %), single 9 (25 %), two-shot 5 (14 %), grupo 4 (11 %, solo c25 hablado), insertos 2.
- Comprobaciones: `python -m py_compile` OK en los 4 .py; IDs de CLIPS = claves de lines.json en el mismo orden (leído con ast, sin importar); cada clip hablado llama a talk() con su propio ID y los mudos no; todos los @{ASSET} tienen hoja y no sobra ninguna; pyflakes sin nombres indefinidos; las frases en español de SOFT coinciden con lines.json; sin dígitos en las líneas; ninguna frase de más de 3 palabras aparece en el lines.json de otra pieza.

## Avance
- 2026-11-15: archivos escritos. No se generó nada en Flow.

## Siguiente
1. `python -I make_sheets.py > sheets_log.txt` (imprime "FIN HOJAS"). Revisar que no salga DUPLICADO, `md5sum chars/*.jpg` y hoja de contactos: caras comunes y distintas; Eleazar y Gertrudis se parecen como hermanos pero no son la misma cara.
2. `python -I clips.py > clips_log.txt` y QA de cada clip: morphs y bordes; Cleofas con sombrero y paliacate en todos sus planos; Marcela y Eleazar siempre en el portón a la derecha; la camioneta gris oscuro; pronunciación de "Calvillo", "Cleofas", "Gertrudis", "Eleazar", "cuaje".
3. phr.py → EDL en edit.py → montaje → verificación (sincronía en 5 puntos, ≤2 s por tramo, LUFS y pico, marca) → copia a LucidLink (carpeta MexiTV) con caption.txt.
