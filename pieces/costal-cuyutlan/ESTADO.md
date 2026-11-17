---
type: handoff
status: active
tags: [atrium, novelas, mexi-stories, parte1, remake-transformado, capos, reten, colima, cuyutlan, salinas]
relatedTo: [reten-sierra, cenote-campana, atrium-vista]
---
# costal-cuyutlan (La Sal de Cuyutlán · Parte 1): estado

## Video base
- Versión nueva y muy transformada de "Le pidió 200 mil en el retén… (El Retén)" de @atriumstories_ (7701749432621993246, **1.1M**, 2.º pico de capos en `fuentes/atrium-vista/ranking2.md`). Versiones anteriores: `pieces/reten-sierra` y `pieces/cenote-campana`.
- Del original queda solo el esqueleto: humillación con plazo → llega la figura de poder → plazo invertido → giro familiar → castigo en la Parte 2.

## Qué se cambió
- Región y oficio: salinas de Cuyutlán, Colima; el protagonista es el salinero más viejo.
- Bloqueo: una camioneta blanca atravesada en el bordo (sin retén, reja ni cadena) y un costal de sal reventado en el lodo.
- Plazo: la lluvia que viene del mar. Se invierte: "Usted me dio hasta que lloviera, ¿no, señor? Ahora ese plazo es suyo."
- Llamada: un chiflido; los salineros salen a pie de las charcas, con las manos vacías (sin radio, campana ni camionetas).
- Giro: el que vendió la mitad del bordo es Evelio, el hermano de Atanasio (traidor), que baja de la camioneta del villano.
- CTA: Atanasio a cámara con las primeras gotas, "¿Ustedes perdonarían a un hermano así?"
- Nombres nuevos y únicos en pieces/: Atanasio Varela (69), Xóchitl Varela (31), Evelio Varela (62), Leónidas Pazos (52).
(Tabla completa en guion.md, "Qué cambia respecto al original y a las versiones anteriores".)

## Marca
**MEXI STORIES**: edit.py, BRAND = "MEXI" (kit pieces/_marcas/MEXI, con su música).

## Archivos
guion.md, caption.txt, lines.json (fuente única, 368 palabras), clips.py (36 clips: 27 hablados c01-c27, 2 insertos i01-i02 y 7 reacciones/presentaciones r1-r7), make_sheets.py (4 personajes + LOC_SALINASCUYUT = 5 hojas), phr.py y edit.py (EDL vacía; música cálida de c16 a r5).
- Copia de sarape-saltillo con todas sus defensas: gaze + ONE + ALONE, PRES, NOSUB + CLEAN + END, NODOUBLE; SAFE/SOFT con las frases fuertes primero, variant, NOREF, TRIES=6; gatito como IMAGEN, duplicados md5, reload_flow, new_project y la parada "LIMITE DE CREDITOS" en gen(). make_sheets.py con "ordinary non-famous face", DUPLICADO por md5 y --reupload que salta las carpetas costal-cuyutlan*.
- Corrección del usuario aplicada: c01 es el primer clip y es Leónidas hablando en pleno conflicto (plano medio de presentación, habla desde el primer frame); ningún plano de objetos, manos o algo que cae al inicio; los insertos van solo en medio.
- Comprobaciones: `python -m py_compile` OK en los 4 .py; IDs de CLIPS = claves de lines.json en el mismo orden (leído con ast, sin importar); cada clip hablado llama a talk() con su propio ID y los mudos no; todos los @{ASSET} tienen hoja y no sobra ninguna; las frases en español de SOFT coinciden con lines.json; sin cifras en las líneas; ninguna frase aparece en lines.json ni guion.md de otra pieza.

## Avance
- 2026-11-14: archivos escritos. No se generó nada en Flow.

## Siguiente
1. `python -I make_sheets.py > sheets_log.txt` (imprime "FIN HOJAS"). Revisar que no salga DUPLICADO, `md5sum chars/*.jpg` y hoja de contactos: caras comunes y distintas; Atanasio y Evelio se parecen como hermanos pero no son la misma cara (Evelio bajito, calvo y con lentes).
2. `python -I clips.py > clips_log.txt` y QA de cada clip: morphs y bordes; nubes negras sin lluvia hasta i02; la camioneta blanca a la derecha y la azul a la izquierda, sin letras ni placas; Leónidas el único con sombrero; los salineros sin herramientas; que el chiflido de r3 se vea natural; pronunciación de "Cuyutlán", "Xóchitl", "escampe", "rastrillar".
3. phr.py → EDL en edit.py → montaje → verificación (sincronía en 5 puntos, ≤2 s por tramo, LUFS y pico, marca) → copia a LucidLink (carpeta MexiTV) con caption.txt.
