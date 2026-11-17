---
type: handoff
status: active
tags: [atrium, novelas, vista-stories, parte1, remake-transformado, padre-hijos-herencia, justicia-familiar, tabasco, comalcalco, cacao]
relatedTo: [baul-sanmiguel, sarape-saltillo, atrium-vista]
---
# hamaca-comalcalco (La Hamaca de Comalcalco · Parte 1): estado

## Video base
- Variante transformada de la saga de don Evaristo de @atriumstories_, desde su P3 "Lo trataron como un estorbo… sin saber que era millonario" (7706316327023119647, 121K; saga 1.06M; tipo padre-hijos-herencia, mediana 276K en `fuentes/atrium-vista/ranking2.md`). Analizado por API el 2026-11-15: `fuentes/atrium-vista/videos/7706316327023119647_analisis.md`.
- baul-sanmiguel y sarape-saltillo rehicieron la P1 (la puerta cerrada); esta toma la reunión con el abogado: la prueba revelada, el hijo ingrato que recula, la insinuación contra el hijo humilde y la defensa del mayor.

## Qué se cambió
- Vínculo y región: una madre cacaotera y su nuera, en una finca de cacao de Comalcalco, Tabasco.
- Injusticia y plazo en c01: la nuera, en su mecedora, la manda a colgar su hamaca en el asoleadero y le da hasta el domingo para irse a una casa de reposo. Se invierte: "Pues el domingo, ustedes me entregan esta casa."
- Poder: la finca de cacao del río y el terreno de la casa del hijo son de ella (sin cifras).
- Sacrificio de la hija humilde: vendió su molino de nixtamal; la madre ya mandó recogerlo.
- Giro nuevo: el hijo ya había ido con el notario a preguntar cómo quitarle las tierras; la nuera lo entrega.
- CTA: Fortunata a cámara, "¿Le darían otra oportunidad a un hijo así?"
- Nombres nuevos y únicos en pieces/: Fortunata Landero (73), Norberto Landero (47), Isaura Garduza (43), Zenobia Landero (40), Olegario Ochoa (61).

## Marca
**VISTA STORIES**: edit.py, BRAND = "VISTA" (kit pieces/_marcas/VISTA, con su música). SPEED = 1.15.

## Archivos
guion.md, caption.txt, lines.json (fuente única, 390 palabras), clips.py (38 clips: 29 hablados c01-c29, 2 insertos i01-i02 y 7 reacciones/presentaciones r1-r7), make_sheets.py (5 personajes + LOC_CACAOCOMALC = 6 hojas), phr.py y edit.py (EDL vacía; música cálida de r5 a c17).
- Copia de costal-cuyutlan con todas sus defensas: ots(), two(), MOUTH (+ GMOUTH para los grupos que hablan), tuplas (prompt_nuevo, prompt_one), ONE_FROM=3 y --one; gaze + ONE + ALONE, PRES, NOSUB + CLEAN + END, NODOUBLE; SAFE/SOFT con las frases fuertes primero, variant, NOREF, TRIES=6; gatito como IMAGEN, duplicados md5, reload_flow, new_project y la parada "LIMITE DE CREDITOS" en gen(). make_sheets.py con "ordinary non-famous face", DUPLICADO por md5 y --reupload que salta las carpetas hamaca-comalcalco*.
- Encuadres: OTS 19 (50 %), single 9 (24 %), two-shot 5 (13 %), grupo 3 (8 %), insertos 2. Geografía: corredor y mecedora a la DERECHA (Isaura sentada, Norberto de pie), asoleadero a la IZQUIERDA (Fortunata con la hamaca, Zenobia a su izquierda, Olegario en el camino). Cada espalda con su @{ASSET} y su ropa vista desde atrás.
- Comprobaciones: `python -m py_compile` OK en los 4 .py; IDs de CLIPS = claves de lines.json en el mismo orden (leído con ast, sin importar); cada clip hablado llama a talk() con su propio ID y los mudos no; todos los @{ASSET} tienen hoja y no sobra ninguna; sin nombres indefinidos; las frases en español de SOFT coinciden con lines.json; sin cifras en las líneas; ninguna frase aparece en lines.json ni guion.md de otra pieza.

## Avance
- 2026-11-15: archivos escritos. No se generó nada en Flow.

## Siguiente
1. `python -I make_sheets.py > sheets_log.txt` (imprime "FIN HOJAS"). Revisar que no salga DUPLICADO, `md5sum chars/*.jpg` y hoja de contactos: caras comunes y distintas; Norberto y Zenobia se parecen como hermanos pero no son la misma cara.
2. `python -I clips.py > clips_log.txt` y QA de cada clip: morphs y bordes; Fortunata con la hamaca en todos sus planos; Isaura siempre sentada en la mecedora a la derecha; ningún texto legible en la carpeta; pronunciación de "Comalcalco", "asoleadero", "Fortunata", "Zenobia", "quitárselas".
3. phr.py → EDL en edit.py → montaje → verificación (sincronía en 5 puntos, ≤2 s por tramo, LUFS y pico, marca) → copia a LucidLink (carpeta Vista) con caption.txt.
