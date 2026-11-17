---
type: handoff
status: active
tags: [atrium, novelas, vista-stories, parte1, remake-transformado, padre-hijos-herencia, madre-hijos, saltillo, coahuila, sarape]
relatedTo: [baul-sanmiguel, garrafon-bernal, jipi-becal, atrium-vista]
---
# sarape-saltillo (El Sarape de Saltillo · Parte 1): estado

## Video base
- Segunda versión, muy transformada, de la saga de **don Evaristo** de @atriumstories_ ("Su propio hijo le cerró la puerta", 7706224426399829279, 342K; P2 390K; la saga suma **1.06M**). La primera versión es `pieces/baul-sanmiguel`.
- Por qué: padre-hijos es el 2.º tipo con mejor mediana de Atrium (276K) y el de más engagement, según `fuentes/atrium-vista/ranking2.md`.

## Qué se cambió
- Vínculo: madre, hija que se alinea (traidora) y yerno (villano); el hijo humilde es soltero y panadero.
- Región y oficio: tejedora de sarapes retirada en Saltillo, Coahuila; casa moderna y panadería del centro.
- Objeto: el sarape de Saltillo que el yerno tiró al escalón ("ese trapo de colores").
- Excusa: a las nueve cena el jefe del yerno; "usted no combina con mi casa".
- Sacrificio: Tereso le da su catre, duerme en los costales y le trabajará el domingo al patrón.
- Giro: Clementina fue la nana del dueño de la fábrica y le pide que pase por ella antes de las nueve para llegar juntos a esa cena (plazo invertido).
- CTA: "¿Qué cara creen que va a poner Fabián cuando me vea llegar?"
- Nombres nuevos y únicos en pieces/: Clementina Ramos (74), Fabián Elizondo (46), Florinda Ramos (49), Tereso Ramos (41). Mauricio Arocha (el dueño) solo se nombra.
(Detalle en guion.md, tabla "Qué cambia respecto al original y a baul-sanmiguel".)

## Marca
**VISTA STORIES**: edit.py, BRAND = "VISTA" (kit pieces/_marcas/VISTA, con su música).

## Archivos
guion.md, caption.txt, lines.json (fuente única, 381 palabras), clips.py (39 clips: 30 hablados c01-c30, 4 insertos i01-i04 y 5 reacciones r1-r5), make_sheets.py (4 personajes + LOC_CASASALTILLO + LOC_PANADERIASALT = 6 hojas), phr.py y edit.py (EDL vacía; música cálida de c16 a i03).
- Copia de garrafon-bernal con todas sus defensas: gaze + ONE + ALONE, PRES, NOSUB + CLEAN + END, NODOUBLE; SAFE/SOFT con las frases fuertes primero, variant, NOREF, TRIES=6; gatito como IMAGEN, duplicados md5, reload_flow, new_project y la parada "LIMITE DE CREDITOS" en gen(). make_sheets.py con "ordinary non-famous face", DUPLICADO por md5 y --reupload que salta las carpetas sarape-saltillo*. Nuevo: vert() para la mirada al piso durante la llamada.
- Comprobaciones: `python -m py_compile` OK en los 4 .py; IDs de CLIPS = claves de lines.json en el mismo orden (leído con ast, sin importar); cada clip hablado llama a talk() con su propio ID; todos los @{ASSET} tienen hoja y no sobra ninguna; las frases en español de SOFT coinciden con lines.json; sin cifras en las líneas.

## Avance
- 2026-11-14: archivos escritos. No se generó nada en Flow.

## Siguiente
1. `python -I make_sheets.py > sheets_log.txt` (imprime "FIN HOJAS"). Revisar que no salga DUPLICADO, `md5sum chars/*.jpg` y hoja de contactos: caras comunes y distintas; Florinda y Clementina se parecen como madre e hija pero no son la misma cara.
2. `python -I clips.py > clips_log.txt` y QA de cada clip: morphs y bordes; el sarape de franjas de colores igual en todos los planos (sobre el antebrazo izquierdo); Fabián rapado con candado y camisa blanca; Florinda con blusa verde esmeralda; Tereso con mandil blanco con harina; el celular viejo sin texto en pantalla; el carro negro sin logos ni placas; pronunciación de "Clementina", "Arocha", "Tereso" y "pan de pulque".
3. phr.py → EDL en edit.py → montaje → verificación (sincronía en 5 puntos, ≤2 s por tramo, LUFS y pico, marca) → copia a LucidLink (carpeta Vista) con caption.txt.
