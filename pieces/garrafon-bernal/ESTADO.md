---
type: handoff
status: active
tags: [atrium, novelas, vista-stories, parte1, remake-transformado, patron-injusticia, bernal, queretaro, vendimia]
relatedTo: [aserrin-huamantla, garrafon-bernal, cantera-huichapan, atrium-vista]
---
# garrafon-bernal (Los Garrafones de Bernal · Parte 1): estado

## Video base
- Remake transformado de **"Su esposa les prohibió el agua a los empleados… (P1)"** de @atriumstories_ (7706934829392203039, 71K, 178 s, 73 planos). Su P2, "La siguió hasta una bodega abandonada" (7707034442048507166), hizo **192K**. Análisis nuevos (Whisper + API): `fuentes/atrium-vista/videos/7706934829392203039_analisis.md` y `7707034442048507166_analisis.md`.
- Por qué este: es una de las 2 historias nuevas sin pieza que recomienda `fuentes/atrium-vista/ranking2.md`.
- Pedido del usuario (2026-11-14): más cerca de las historias de Atrium, sin copiar. Se conservan la historia y su ritmo emocional (capas del misterio: agua → comida → miedo → cocina → la mitad del mandado → el carro vuelve vacío). Cambian el escenario y la región, el oficio, los objetos clave, los nombres, todos los diálogos y el CTA.

## Qué se cambió
- Región y escenario: la hacienda con piscina pasa a ser un viñedo familiar cerca de Bernal (Querétaro), en vendimia, con la Peña de Bernal.
- Oficios: empleada doméstica → vendimiadora; patrón de traje → viñatero con chaleco de gamuza.
- Objetos: la manguera → la tina de lavar cajas de uva y los garrafones azules con cadena y candado; las compras → el mandado del jueves y la camioneta blanca por el portón de atrás.
- Plazo nuevo: "antes de que se meta el sol" (gancho y promesa final).
- CTA: "¿A dónde creen que se lleva Lorena el mandado?"
- Nombres nuevos y únicos en pieces/: Leoncio Ávalos, Jovita Reséndiz (26), Petronila Ocádiz (64). Lorena (la esposa) solo se nombra.
(Detalle en guion.md, tabla "Qué cambia respecto al original".)

## Marca
**VISTA STORIES**: edit.py, BRAND = "VISTA" (kit pieces/_marcas/VISTA, con su música).

## Archivos
guion.md, caption.txt, lines.json (fuente única, 352 palabras), clips.py (38 clips: 29 hablados c01-c29, 5 insertos i01-i05 y 4 reacciones r1-r4), make_sheets.py (3 personajes + LOC_PATIOBERNAL + LOC_COCINABERNAL = 5 hojas), phr.py y edit.py (EDL vacía; música cálida de c14 a c15).
- Copia de aserrin-huamantla con todas sus defensas: gaze + ONE + ALONE, PRES, NOSUB + CLEAN + END, NODOUBLE; SAFE/SOFT con las frases fuertes primero, variant, NOREF, TRIES=6; gatito como IMAGEN, duplicados md5, reload_flow, new_project y la parada "LIMITE DE CREDITOS" en gen(). make_sheets.py con "ordinary non-famous face", DUPLICADO por md5 y --reupload.
- Comprobaciones: `python -m py_compile` OK en los 4 .py; IDs de CLIPS = claves de lines.json en el mismo orden (leído con ast, sin importar); todos los @{ASSET} tienen hoja y no sobra ninguna; las frases en español de SOFT coinciden con lines.json; sin cifras en las líneas.

## Avance
- 2026-11-14: archivos escritos. No se generó nada en Flow.

## Siguiente
1. `python -I make_sheets.py > sheets_log.txt` (imprime "FIN HOJAS"). Revisar que no salga DUPLICADO, `md5sum chars/*.jpg` y hoja de contactos: caras comunes y distintas.
2. `python -I clips.py > clips_log.txt` y QA de cada clip: morphs y bordes; Jovita a la izquierda junto a la tina, con paliacate rojo y camisa verde olivo, adulta; Leoncio con barba blanca y chaleco de gamuza; los garrafones con cadena y candado iguales en i01, i02 y el patio; Petronila con mandil de cuadros rojos; pronunciación de "Jovita", "Petronila", "Lorena" y "garrafones".
3. phr.py → EDL en edit.py → montaje → verificación (sincronía en 5 puntos, ≤2 s por tramo, LUFS y pico, marca) → copia a LucidLink con caption.txt.
