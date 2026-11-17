---
type: handoff
status: active
tags: [atrium, novelas, vista-stories, parte2, remake-transformado, patron-injusticia, bernal, queretaro, vendimia]
relatedTo: [garrafon-bernal, atrium-vista]
---
# garrafon-bernal-p2 (Los Garrafones de Bernal · Parte 2): estado

## La historia
Es la Parte 2 de pieces/garrafon-bernal y sigue el ritmo emocional de la P2 de Atrium "La siguió hasta una bodega abandonada" (7707034442048507166, 192K). Análisis: `fuentes/atrium-vista/videos/7707034442048507166_analisis.md`.
- Gancho con recordatorio: la camioneta blanca en el portón; "Antes de que se meta el sol, la sigo."
- Lorena le ordena a Ruperto cargar la mitad del mandado y los garrafones llenos, y le exige silencio. Ruperto, con miedo, no sabe a dónde va.
- Bodega de adobe con puerta azul: "Abres tú, o abro yo." Adentro, el mandado y los garrafones: Lorena los vende en el tianguis.
- Castigo: las llaves de la camioneta y del candado; "antes de que se meta el sol, te vas" (el plazo de la P1 al revés).
- Desenlace: el candado se abre, Jovita toma agua limpia, Petronila manda en la cocina, cena de todos. CTA: "¿Ustedes habrían perdonado a Lorena? … para ver qué pasó con ella."

No hay armas, sangre, cifras de dinero, deudas, uniformes, niños ni Navidad. Detalle en guion.md.

## Marca
**VISTA STORIES**, la misma de la Parte 1 (no entra en la rotación): edit.py, BRAND = "VISTA".

## Archivos listos
- guion.md y caption.txt (formato Parte 2, #parte2).
- lines.json es la fuente única: 395 palabras.
- clips.py tiene 46 clips: c01-c32 hablados (c32 = CTA de 10 s), i01-i09 insertos sin caras y r1-r5 mudos (r1 y r2 = presentaciones de Lorena y Ruperto).
  - Es copia del clips.py de la Parte 1 con todas sus defensas: gatito en imagen, reload_flow, new_project, descarga corrupta, duplicados md5, TRIES=6, SAFE/SOFT (frases fuertes de la P2 primero), NOREF (con Lorena y Ruperto) y la parada "LIMITE DE CREDITOS" en gen(). Imprime "FIN P2".
  - Anclas LEO, JOV y PET idénticas a la P1 (misma ropa).
- make_sheets.py:
  - Reutiliza las 5 hojas de la Parte 1 copiadas a chars/: LEONCIO_AVALOS, JOVITA_RESENDIZ, PETRONILA_OCADIZ, LOC_PATIOBERNAL y LOC_COCINABERNAL (lista REUSED: si falta una, la copia de la P1; nunca la regenera).
  - **4 hojas nuevas: LORENA_ALDACO, RUPERTO_MENDIOLA, LOC_PORTONBERNAL y LOC_BODEGABERNAL.**
  - En `--reupload` las copias no cuentan como DUPLICADO: se saltan las carpetas garrafon-bernal*. El make_sheets.py de la P1 también salta esas carpetas ahora, para que su --reupload no marque las copias de la P2.
- phr.py y edit.py (copias de la P1, EDL vacía, BRAND = "VISTA"). Música: suspenso hasta i08, cálida de i08 a c32 (el candado, el agua, la cena), suspenso en el CTA.
- Comprobaciones: `python -m py_compile` OK en los 4 .py; IDs de CLIPS = claves de lines.json en el mismo orden (leído con ast, sin importar); todos los @{ASSET} tienen hoja.

Nada generado en Flow todavía.

## Siguiente
1. `python -I make_sheets.py --reupload > sheets_log.txt`: sube las 5 copias, genera y sube las 4 nuevas e imprime "FIN HOJAS". Revisar md5 y que Lorena no se parezca a Jovita ni a Petronila, ni Ruperto a Leoncio.
2. `python -I clips.py > clips_log.txt`, con un Monitor sobre "^FIN P2", Traceback, "intento 6" y "LIMITE".
3. QA: misma ropa que la P1 en todos los planos; Lorena con blusa turquesa y moño bajo; camioneta y bodega sin letras ni placas; la cadena y el candado de i08 iguales a los de la P1; pronunciación de "Ruperto", "Lorena", "tianguis", "garrafones".
4. `python -I phr.py`, armar la EDL y correr `python -I edit.py`.
5. Verificar sincronía en 5 puntos, ≤2 s por tramo, LUFS y pico, y la marca VISTA arriba al centro.
6. Copiar a LucidLink (Vista/) con caption.txt.
