---
type: handoff
status: active
tags: [atrium, novelas, majestic-stories, parte1, remake-transformado, capos, patrona, nayarit, mexcaltitan, pulsera]
relatedTo: [medalla-mezcal, sarape-saltillo, atrium-vista]
---
# pulsera-mexcaltitan (La Pulsera del Estero · Parte 1): estado

## Video base
- Versión nueva y muy transformada de "Llegó buscando a la patrona… secreto de 20 años" de @atriumstories_ (7702501478056971550, **1.6M**, el pico de capos en `fuentes/atrium-vista/ranking2.md`). La primera versión es `pieces/medalla-mezcal`.
- Del original queda solo el esqueleto: humillación con plazo → llega la figura de poder → plazo invertido → giro familiar → castigo en la Parte 2.

## Qué se cambió
- Región y oficio: muelle de la isla de Mexcaltitán, Nayarit; la patrona es dueña de las lanchas del estero. La víctima vende tamales.
- Objeto: pulsera de chaquira azul y amarilla con un venado blanco, tejida por la patrona para su hijo.
- Plazo: la última lancha, a las seis. Se invierte: "¿En la de las seis? Qué bueno, porque en esa te vas tú."
- Giro: el villano (hijo de la patrona) es el padre de la muchacha que humilló; la nuera (traidora) lo sabía.
- CTA: Eustolia a cámara, "¿Qué harían ustedes con un hijo así?"
- Nombres nuevos y únicos en pieces/: Eustolia Lomelí (72), Arsenio Lomelí (47), Tamara Lomelí (44), Maura Graciano (24). Herlinda Graciano solo se nombra.
(Tabla completa en guion.md, "Qué cambia respecto al original y a medalla-mezcal".)

## Marca
**MAJESTIC STORIES**: edit.py, BRAND = "MAJESTIC" (kit pieces/_marcas/MAJESTIC, con su música).

## Archivos
guion.md, caption.txt, lines.json (fuente única, 375 palabras), clips.py (38 clips: 28 hablados c01-c28, 4 insertos i01-i04 y 6 reacciones/presentaciones r1-r6), make_sheets.py (4 personajes + LOC_MUELLEMEXCAL = 5 hojas), phr.py y edit.py (EDL vacía; música cálida de c18 a r5).
- Copia de sarape-saltillo con todas sus defensas: gaze + ONE + ALONE, PRES, NOSUB + CLEAN + END, NODOUBLE; SAFE/SOFT con las frases fuertes primero, variant, NOREF, TRIES=6; gatito como IMAGEN, duplicados md5, reload_flow, new_project y la parada "LIMITE DE CREDITOS" en gen(). make_sheets.py con "ordinary non-famous face", DUPLICADO por md5 y --reupload que salta las carpetas pulsera-mexcaltitan*.
- Corrección del usuario aplicada: c01 es el primer clip y es Arsenio hablando en pleno conflicto (plano medio de presentación, habla desde el primer frame); ningún plano de objetos, manos o algo que cae al inicio; los insertos van solo en medio.
- Comprobaciones: `python -m py_compile` OK en los 4 .py; IDs de CLIPS = claves de lines.json en el mismo orden (leído con ast, sin importar); cada clip hablado llama a talk() con su propio ID y los mudos no; todos los @{ASSET} tienen hoja y no sobra ninguna; las frases en español de SOFT coinciden con lines.json; sin cifras en las líneas; ninguna frase aparece en lines.json ni guion.md de otra pieza.

## Avance
- 2026-11-14: archivos escritos. No se generó nada en Flow.

## Siguiente
1. `python -I make_sheets.py > sheets_log.txt` (imprime "FIN HOJAS"). Revisar que no salga DUPLICADO, `md5sum chars/*.jpg` y hoja de contactos: caras comunes y distintas; Arsenio y Eustolia pueden parecerse como madre e hijo, Maura con algo de los dos pero no la misma cara.
2. `python -I clips.py > clips_log.txt` y QA de cada clip: morphs y bordes; la pulsera azul y amarilla siempre en la muñeca IZQUIERDA de Maura; Arsenio barbado de camisa blanca; Tamara rubia de rosa con abanico; la flor roja de Eustolia; la lancha blanca con franja azul; pronunciación de "Herlinda Graciano", "Arsenio", "arrimada", "remendaba".
3. phr.py → EDL en edit.py → montaje → verificación (sincronía en 5 puntos, ≤2 s por tramo, LUFS y pico, marca) → copia a LucidLink (carpeta Majestic) con caption.txt.
