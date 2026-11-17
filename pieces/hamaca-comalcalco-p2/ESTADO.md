---
type: handoff
status: active
tags: [atrium, novelas, vista-stories, parte2, remake-transformado, padre-hijos-herencia, justicia-familiar, tabasco, comalcalco, cacao]
relatedTo: [hamaca-comalcalco, atrium-vista]
---
# hamaca-comalcalco-p2 (La Hamaca de Comalcalco · Parte 2): estado

## La historia
Parte 2 de pieces/hamaca-comalcalco. Arranca en el mismo instante del gancho de la P1 (el notario: Norberto fue a preguntar cómo quitarle las tierras a su madre; Isaura: "Eso fue idea de él").
- Gancho: Norberto confiesa y culpa a Isaura. El notario: ella esperaba en la camioneta, abanicándose (desenlace del giro).
- Zenobia, la hija humilde, no pide nada; Fortunata pone la finca del río a su nombre: "La tierra se le da a quien no la pide."
- Castigo: el domingo le dejan las llaves de la casa (plazo de la P1 cumplido); a la mamá de Isaura, "en el asoleadero hay lugar de sobra"; Isaura deja a Norberto y Fortunata le pone a él su hamaca en los brazos.
- Gancho: Isaura llama a su mamá: "Esa finca no va a ser de Zenobia por mucho tiempo." CTA de Fortunata: "Ya repartí el cacao. ¿Hice bien con mi hijo?"

Sin armas, sangre, cifras de dinero, deudas, uniformes, niños ni Navidad. Detalle en guion.md.

## Marca
**VISTA STORIES**, la misma de la Parte 1 (no entra en la rotación): edit.py, BRAND = "VISTA", SPEED = 1.15.

## Archivos listos
- guion.md y caption.txt (formato Parte 2, #parte2).
- lines.json, fuente única: 374 palabras.
- clips.py, 30 clips: c01-c24 hablados (c24 = CTA de 10 s), i01 inserto sin caras y r1-r5 mudos.
  - Copia de pieces/sarape-saltillo-p2/clips.py: ots(), two(), MOUTH, tuplas (prompt_nuevo, prompt_one), ONE_FROM=3, --one, y todas las defensas (gatito en imagen, reload_flow, new_project, descarga corrupta, duplicados md5, TRIES=6, SAFE/SOFT con las frases fuertes primero, NOREF, parada "LIMITE DE CREDITOS"). Imprime "FIN P2".
  - Reparto: 15 OTS (52 %), 7 single (24 %), 4 two-shot (14 %), 3 grupo (10 %, los 3 mudos) + 1 inserto. Geografía fija de la P1: Isaura y Norberto a la derecha en el corredor; Zenobia, Fortunata y Olegario a la izquierda en el asoleadero. c01 es Norberto hablando.
- make_sheets.py: reutiliza las 6 hojas de la P1 copiadas a chars/ (FORTUNATA_LANDERO, ISAURA_GARDUZA, NORBERTO_LANDERO, ZENOBIA_LANDERO, OLEGARIO_OCHOA, LOC_CACAOCOMALC). Sin hojas nuevas. `--reupload` salta las carpetas hamaca-comalcalco* en el control de duplicados.
- phr.py y edit.py (copia del de sarape-saltillo-p2, EDL vacía, BRAND = "VISTA", SPEED = 1.15; música cálida de c12 a c15).
- Comprobaciones: py_compile OK en los 4 .py; pyflakes sin avisos en clips.py y make_sheets.py; IDs de CLIPS = claves de lines.json en el mismo orden (leído con ast, sin importar); cada clip hablado llama a talk() y D8() con su propio ID y los mudos no; todos los @{ASSET} tienen hoja y no sobra ninguna; frases de SOFT = lines.json; sin cifras; ninguna frase repetida de otra pieza.

Nada generado en Flow todavía.

## Siguiente
1. `python -I make_sheets.py --reupload > sheets_log.txt`: sube las 6 copias, imprime "FIN HOJAS".
2. `python -I clips.py > clips_log.txt`, con Monitor sobre "^FIN P2", Traceback, "intento 6" y "LIMITE".
3. QA: dobles en los OTS (regenerar con `--one`), ropa de la P1, la hamaca (Fortunata hasta r4, Norberto después), Isaura sentada hasta r3, geografía izquierda/derecha, nada legible en la carpeta, pronunciación.
4. `python -I phr.py`, armar la EDL y `python -I edit.py`. Verificar sincronía en 5 puntos, ≤2 s por tramo, LUFS y pico, marca VISTA arriba al centro.
5. Copiar a LucidLink (Vista/) con caption.txt.
