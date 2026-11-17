---
type: handoff
status: active
tags: [atrium, novelas, majestic-stories, parte2, remake-transformado, capos, baja-california-sur, san-ignacio, partera, boda]
relatedTo: [frascos-sanignacio, atrium-vista]
---
# frascos-sanignacio-p2 (Los Frascos de San Ignacio · Parte 2): estado

## La historia
Parte 2 de pieces/frascos-sanignacio. Arranca en el mismo instante del gancho de la P1 ("¿Usted… es don Belarmino? Señor, yo no sabía.").
- Gancho: Belarmino pone a Bastián a levantar los frascos "que la novia ya viene en camino"; Iker quiere irse y lo obliga a quedarse.
- Llega Jimena (nueva, 27), la novia, hija de Belarmino: Tiburcia la recibió al nacer (desenlace del giro: el novio que humilló a la partera se casa hoy con ella).
- Castigo: Bastián le besa la mano a Tiburcia ("me lo da el miedo que trae"); Jimena deja el anillo en el puesto, "Hoy en esta plaza no hay boda", y le da su ramo a Tiburcia; Belarmino manda quitar el arco.
- Gancho: Bastián llama a su papá y Tiburcia: "A él también lo recibí yo." CTA de Jimena: "Me quedé sin boda, pero no sin madrina. ¿Ustedes lo habrían perdonado?"

Sin armas, sangre, cifras de dinero, deudas, uniformes, niños ni Navidad. Detalle en guion.md.

## Marca
**MAJESTIC STORIES**, la misma de la Parte 1 (no entra en la rotación): edit.py, BRAND = "MAJESTIC", SPEED = 1.15.

## Archivos listos
- guion.md y caption.txt (formato Parte 2, #parte2).
- lines.json, fuente única: 380 palabras.
- clips.py, 32 clips: c01-c25 hablados (c25 = CTA de 10 s), i01 inserto sin caras y r1-r6 mudos.
  - Copia de pieces/sarape-saltillo-p2/clips.py: ots(), two(), MOUTH, tuplas (prompt_nuevo, prompt_one), ONE_FROM=3, --one, y todas las defensas (gatito en imagen, reload_flow, new_project, descarga corrupta, duplicados md5, TRIES=6, SAFE/SOFT con las frases fuertes primero, NOREF con Jimena, parada "LIMITE DE CREDITOS"). Imprime "FIN P2".
  - Reparto: 16 OTS (52 %), 7 single (23 %), 5 two-shot (16 %), 3 grupo (10 %, los 3 mudos) + 1 inserto. Geografía fija de la P1: Tiburcia, Belarmino y Jimena a la izquierda (puesto); Bastián e Iker a la derecha (arco). c01 es Belarmino hablando.
- make_sheets.py: reutiliza 6 hojas de la P1 copiadas a chars/ (TIBURCIA_OSUNA, BASTIAN_TALAMANTES, IKER_BARAJAS, BELARMINO_ARCINIEGA, ZACARIAS_MAGANA, LOC_PLAZASANIGN; LOC_DESIERTOBCS no hace falta) y **1 hoja nueva: JIMENA_ARCINIEGA**. `--reupload` salta las carpetas frascos-sanignacio* en el control de duplicados.
- phr.py y edit.py (copia del de sarape-saltillo-p2, EDL vacía, BRAND = "MAJESTIC", SPEED = 1.15; música cálida de c20 a c22).
- Comprobaciones: py_compile OK en los 4 .py; pyflakes sin avisos en clips.py y make_sheets.py; IDs de CLIPS = claves de lines.json en el mismo orden (leído con ast, sin importar); cada clip hablado llama a talk() y D8() con su propio ID y los mudos no; todos los @{ASSET} tienen hoja y no sobra ninguna; frases de SOFT = lines.json; sin cifras; ninguna frase repetida de otra pieza.

Nada generado en Flow todavía.

## Siguiente
1. `python -I make_sheets.py --reupload > sheets_log.txt`: sube las 6 copias, genera y sube JIMENA_ARCINIEGA, imprime "FIN HOJAS". Revisar md5 y que Jimena no se parezca a nadie de otra pieza; vestido con cuello alto y mangas largas.
2. `python -I clips.py > clips_log.txt`, con Monitor sobre "^FIN P2", Traceback, "intento 6" y "LIMITE".
3. QA: dobles en los OTS (regenerar con `--one`), ropa de la P1, frascos tirados hasta r2 y de pie después, el ramo (Jimena hasta c20, Tiburcia después), geografía izquierda/derecha, camionetas sin placas, pronunciación.
4. `python -I phr.py`, armar la EDL y `python -I edit.py`. Verificar sincronía en 5 puntos, ≤2 s por tramo, LUFS y pico, marca MAJESTIC arriba a la izquierda.
5. Copiar a LucidLink (Majestic/) con caption.txt.
