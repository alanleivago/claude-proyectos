---
type: handoff
status: active
tags: [atrium, novelas, vista-stories, parte2, remake-transformado, padre-hijos-herencia, madre-hijos, saltillo, coahuila, sarape]
relatedTo: [sarape-saltillo, atrium-vista]
---
# sarape-saltillo-p2 (El Sarape de Saltillo · Parte 2): estado

## La historia
Parte 2 de pieces/sarape-saltillo. Arranca desde el gancho de la P1 (el carro negro del dueño de la fábrica).
- Gancho con recordatorio: Fabián ve a su suegra bajarse de ese carro a las nueve.
- Mauricio Arocha (nuevo, 56) dice que Clementina fue su nana y la crió en la fábrica de su padre (desenlace del giro).
- Florinda (la hija traidora) se hace la que no sabía; Tereso: "En mi panadería a mi amá nadie la corrió."
- Castigo del villano: por el sarape tirado, Fabián entrega mañana la oficina de gerente. "Yo no combino con su casa."
- Castigo de la traidora: su madre la perdona pero se queda con Tereso, y le da a él el sarape de la boda de Florinda. Florinda suelta a Fabián.
- Gancho: Fabián, "todavía no sabe lo que yo sé de esa fábrica". CTA de Clementina: "¿Ustedes habrían perdonado a una hija así?"

Sin armas, sangre, cifras de dinero, deudas, uniformes, niños ni Navidad. Detalle en guion.md.

## Marca
**VISTA STORIES**, la misma de la Parte 1 (no entra en la rotación): edit.py, BRAND = "VISTA", SPEED = 1.15.

## Archivos listos
- guion.md y caption.txt (formato Parte 2, #parte2).
- lines.json, fuente única: 378 palabras.
- clips.py, 32 clips: c01-c26 hablados (c26 = CTA de 10 s), i01-i02 insertos sin caras y r1-r4 mudos.
  - Copia de pieces/jipi-becal-p2/clips.py: ots(), two(), MOUTH, tuplas (prompt_nuevo, prompt_one), ONE_FROM=3, --one, y todas las defensas (gatito en imagen, reload_flow, new_project, descarga corrupta, duplicados md5, TRIES=6, SAFE/SOFT con las frases fuertes primero, NOREF con Mauricio, parada "LIMITE DE CREDITOS"). Imprime "FIN P2".
  - Reparto: 16 OTS (53 %), 7 single (23 %), 4 two-shot (13 %), 3 grupo (10 %) + 2 insertos. Geografía fija: Fabián y Florinda arriba a la derecha; Tereso, Clementina y Mauricio abajo a la izquierda. c01 es Fabián hablando.
- make_sheets.py: reutiliza las 5 hojas de la P1 copiadas a chars/ (CLEMENTINA_RAMOS, FABIAN_ELIZONDO, FLORINDA_RAMOS, TERESO_RAMOS, LOC_CASASALTILLO) y **1 hoja nueva: MAURICIO_AROCHA**. `--reupload` salta las carpetas sarape-saltillo* en el control de duplicados.
- phr.py y edit.py (copia del de jipi-becal-p2, EDL vacía, BRAND = "VISTA", SPEED = 1.15; música cálida de c19 a c24).
- Comprobaciones: py_compile OK en los 4 .py; pyflakes sin avisos en clips.py y make_sheets.py; IDs de CLIPS = claves de lines.json en el mismo orden (leído con ast, sin importar); cada clip hablado llama a talk() con su propio ID y los mudos no; todos los @{ASSET} tienen hoja y no sobra ninguna; frases de SOFT = lines.json; sin cifras; ninguna frase repetida de otra pieza.

Nada generado en Flow todavía.

## Siguiente
1. `python -I make_sheets.py --reupload > sheets_log.txt`: sube las 5 copias, genera y sube MAURICIO_AROCHA, imprime "FIN HOJAS". Revisar md5 y que Mauricio no se parezca a Fabián ni a nadie de otra pieza.
2. `python -I clips.py > clips_log.txt`, con Monitor sobre "^FIN P2", Traceback, "intento 6" y "LIMITE".
3. QA: dobles en los OTS (regenerar con `--one`), ropa de la P1, el sarape (brazo de Clementina hasta i02, hombros de Tereso después), geografía arriba/abajo, carro sin placas, pronunciación.
4. `python -I phr.py`, armar la EDL y `python -I edit.py`. Verificar sincronía en 5 puntos, ≤2 s por tramo, LUFS y pico, marca VISTA arriba al centro.
5. Copiar a LucidLink (Vista/) con caption.txt.
