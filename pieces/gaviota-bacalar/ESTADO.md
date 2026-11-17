---
type: handoff
status: active
tags: [atrium, novelas, vista-stories, parte1, remake-transformado, madrastra-justicia, justicia-familiar, quintana-roo, bacalar, lanchas]
relatedTo: [aserrin-huamantla, jipi-becal, aserrin-huamantla-p2, atrium-vista]
---
# gaviota-bacalar (La Gaviota de Bacalar · Parte 1): estado

## Video base
- Variante transformada del Final de la saga de la madrastra de @atriumstories_, "¡Quería quedarse con la casa de su hijastra! FINAL" (7705499092683590942, 105K; saga 1.07M; tipo madrastra-justicia, mediana 336K, el mejor de `fuentes/atrium-vista/ranking2.md`). Bajado con yt-dlp y analizado por API el 2026-11-15: `fuentes/atrium-vista/videos/7705499092683590942_analisis.md`.
- aserrin-huamantla y jipi-becal rehicieron la P1 y aserrin-huamantla-p2 la P2; esta toma el Final: la expulsión de la madrastra, su reclamo, la hija que la desmiente y la humillación devuelta.

## Qué se cambió
- Región y oficio: el dueño de las lanchas del muelle de Bacalar, Quintana Roo.
- Injusticia y plazo en c01: la madrastra se burla del plazo ("¿antes de que regrese la última lancha?") mientras la hija talla el muelle de rodillas al fondo.
- Objeto: La Gaviota, la lancha de la madre, a la que la madrastra mandó borrar el nombre; el cepillo de tallar en lugar de la escoba.
- Giro nuevo: la madrastra llama a Wilberto, el hermano del padre, que llega en la última lancha: "La mitad de este muelle es mía." El plazo se vuelve contra el padre.
- CTA: Saturnino a cámara, "¿Ustedes qué harían con un hermano así?"
- Nombres nuevos y únicos en pieces/: Saturnino Dzib (56), Araceli Bracamontes (45), Ixchel Dzib (24), Wilberto Dzib (52).

## Marca
**VISTA STORIES**: edit.py, BRAND = "VISTA" (kit pieces/_marcas/VISTA, con su música). SPEED = 1.15.

## Archivos
guion.md, caption.txt, lines.json (fuente única, 373 palabras), clips.py (38 clips: 29 hablados c01-c29, 2 insertos i01-i02 y 7 reacciones/presentaciones r1-r7), make_sheets.py (4 personajes + LOC_MUELLEBACALAR = 5 hojas), phr.py y edit.py (EDL vacía; música cálida de c11 a c13).
- Copia de hamaca-comalcalco con todas sus defensas: ots(), two(), MOUTH, tuplas (prompt_nuevo, prompt_one), ONE_FROM=3 y --one; gaze + ONE + ALONE, PRES, NOSUB + CLEAN + END, NODOUBLE; SAFE/SOFT con las frases fuertes primero, variant, NOREF, TRIES=6; gatito como IMAGEN, duplicados md5, reload_flow, new_project y la parada "LIMITE DE CREDITOS" en gen(). make_sheets.py con "ordinary non-famous face", DUPLICADO por md5 y --reupload que salta las carpetas gaviota-bacalar*.
- Encuadres: OTS 19 (53 %), single 10 (28 %), two-shot 4 (11 %), grupo 3 (8 %, todos mudos), insertos 2. c01 es un OTS con una tercera persona al fondo (Ixchel tallando, desenfocada y callada).
- Comprobaciones: `python -m py_compile` OK en los 4 .py; IDs de CLIPS = claves de lines.json en el mismo orden (leído con ast, sin importar); cada clip hablado llama a talk() con su propio ID y los mudos no; todos los @{ASSET} tienen hoja y no sobra ninguna; pyflakes sin nombres indefinidos; las frases en español de SOFT coinciden con lines.json; sin dígitos en las líneas; ninguna frase de más de 3 palabras aparece en el lines.json de otra pieza.

## Avance
- 2026-11-15: archivos escritos. No se generó nada en Flow.

## Siguiente
1. `python -I make_sheets.py > sheets_log.txt` (imprime "FIN HOJAS"). Revisar que no salga DUPLICADO, `md5sum chars/*.jpg` y hoja de contactos: Saturnino y Wilberto hermanos pero bien distintos.
2. `python -I clips.py > clips_log.txt` y QA de cada clip: morphs y bordes; en c01 que Ixchel al fondo no mueva la boca; Ixchel descalza y con playera blanca; Araceli siempre a la derecha con la maleta dorada; La Gaviota sin letras legibles; pronunciación de "Bacalar", "Saturnino", "Ixchel", "Wilberto".
3. phr.py → EDL en edit.py → montaje → verificación (sincronía en 5 puntos, ≤2 s por tramo, LUFS y pico, marca) → copia a LucidLink (carpeta Vista) con caption.txt.
