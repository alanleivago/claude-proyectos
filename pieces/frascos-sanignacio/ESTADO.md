---
type: handoff
status: active
tags: [atrium, novelas, majestic-stories, parte1, remake-transformado, capos, baja-california-sur, san-ignacio, partera]
relatedTo: [padre-veladoras, atrium-vista]
---
# frascos-sanignacio (Los Frascos de San Ignacio · Parte 1): estado

## Video base
- Variante transformada de "Se burlaron del padre… sin saber a quién iba a llamar" de @atriumstories_ (7702486655336320286, 231K, capos). Primera versión: `pieces/padre-veladoras`.
- Se analizó por API "En el desierto no hay perdón" (7702121152491179294, 57K, el único P1 de capos sin pieza): `fuentes/atrium-vista/videos/7702121152491179294_analisis.md`. Se descartó: robo de dinero, amenazas a la familia y disparos.
- Del original queda la historia y su ritmo: humillación a una persona de respeto, una sola llamada, burlas, en la camioneta el poderoso cuenta por qué le debe todo, convoy, cara a cara.

## Qué se cambió
- Región y oficio: plaza del oasis de San Ignacio, Baja California Sur; la humillada es una partera y hierbera de 76 años.
- Injusticia y plazo en c01: el novio rico le tira los frascos para poner su boda, "antes de que llegue la novia". Se invierte: "Antes de que llegue, levantas cada frasco. Y le besas la mano a mi madrina."
- Deuda moral: ella trajo al mundo a Belarmino y recibió a su hija caminando toda la noche por el desierto.
- Giro nuevo: el novio que la humilló se casa hoy con la hija de Belarmino ("Mi suegro es don Belarmino Arciniega").
- CTA: Tiburcia a cámara, "¿Ustedes lo dejarían casarse con su hija?"
- Nombres nuevos y únicos en pieces/: Tiburcia Osuna (76), Bastián Talamantes (29), Iker Barajas (28), Belarmino Arciniega (63), Zacarías Magaña (41).

## Marca
**MAJESTIC STORIES**: edit.py, BRAND = "MAJESTIC" (kit pieces/_marcas/MAJESTIC, con su música). SPEED = 1.15.

## Archivos
guion.md, caption.txt, lines.json (fuente única, 371 palabras), clips.py (39 clips: 30 hablados c01-c30, 2 insertos i01-i02 y 7 reacciones/presentaciones r1-r7), make_sheets.py (5 personajes + LOC_PLAZASANIGN + LOC_DESIERTOBCS = 7 hojas), phr.py y edit.py (EDL vacía; música cálida de c15 a i01).
- Copia de costal-cuyutlan con todas sus defensas: ots(), two(), MOUTH (+ GMOUTH para el grupo que habla), tuplas (prompt_nuevo, prompt_one), ONE_FROM=3 y --one; gaze + ONE + ALONE, PRES, NOSUB + CLEAN + END, NODOUBLE; SAFE/SOFT con las frases fuertes primero, variant, NOREF, TRIES=6; gatito como IMAGEN, duplicados md5, reload_flow, new_project y la parada "LIMITE DE CREDITOS" en gen(). make_sheets.py con "ordinary non-famous face", DUPLICADO por md5 y --reupload que salta las carpetas frascos-sanignacio*.
- Encuadres: OTS 20 (51 %), single 10 (26 %), two-shot 5 (13 %), grupo 4 (10 %, con los 2 insertos amplios del convoy). Geografía: puesto a la IZQUIERDA (Tiburcia; Belarmino llega a su derecha), arco de flores a la DERECHA (Bastián; Iker un paso detrás). En la camioneta: Zacarías maneja a la IZQUIERDA y Belarmino va de copiloto a la DERECHA. Cada espalda con su @{ASSET} y su ropa vista desde atrás.
- Comprobaciones: `python -m py_compile` OK en los 4 .py; IDs de CLIPS = claves de lines.json en el mismo orden (leído con ast, sin importar); cada clip hablado llama a talk() con su propio ID y los mudos no; todos los @{ASSET} tienen hoja y no sobra ninguna; sin nombres indefinidos; las frases en español de SOFT coinciden con lines.json; sin cifras en las líneas; ninguna frase aparece en lines.json ni guion.md de otra pieza.

## Avance
- 2026-11-15: archivos escritos. No se generó nada en Flow.

## Siguiente
1. `python -I make_sheets.py > sheets_log.txt` (imprime "FIN HOJAS"). Revisar que no salga DUPLICADO, `md5sum chars/*.jpg` y hoja de contactos: caras comunes y distintas; Bastián e Iker claramente distintos.
2. `python -I clips.py > clips_log.txt` y QA de cada clip: morphs y bordes; el atardecer coherente; el puesto a la izquierda y el arco a la derecha; Belarmino el único con sombrero; camionetas sin letras ni placas; que el OTS dentro de la camioneta (c15-c18) no meta un tercero; pronunciación de "Tiburcia", "Belarmino", "Arciniega", "hierbera".
3. phr.py → EDL en edit.py → montaje → verificación (sincronía en 5 puntos, ≤2 s por tramo, LUFS y pico, marca) → copia a LucidLink (carpeta Majestic) con caption.txt.
