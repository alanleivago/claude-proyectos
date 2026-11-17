---
type: handoff
status: active
tags: [atrium, novelas, majestic-stories, parte2, remake-transformado, capos, patrona, nayarit, mexcaltitan, pulsera]
relatedTo: [pulsera-mexcaltitan, atrium-vista]
---
# pulsera-mexcaltitan-p2 (La Pulsera del Estero · Parte 2): estado

## La historia
Parte 2 de pieces/pulsera-mexcaltitan. Arranca donde terminó la P1 (Arsenio es el padre de Maura y Tamara lo sabía; la lancha de las seis espera).
- Gancho con recordatorio: "Ya dieron las seis, Arsenio. Y tu lancha te está esperando."
- Desenlace del giro: hace 24 años Herlinda vino al muelle a decírselo y Tamara la corrió: le dijo que Arsenio no quería saber nada y la subió a la lancha de las seis.
- Castigo: Tamara se va en esa misma lancha ("Así corriste tú a Herlinda. Y no vuelvas a pisar mi isla"); Arsenio se queda pero ya no manda en el muelle (manda Maura) y remienda redes como Herlinda.
- Reconocimiento: "Dime abuela"; Arsenio tiene que ganarse que le diga papá. Tamara voltea fría desde la lancha (gancho para el final). CTA de Maura: "¿Ustedes perdonarían a un papá que llegó veinticuatro años tarde?"

Sin armas, sangre, cifras de dinero, deudas, uniformes, niños ni Navidad. Detalle en guion.md.

## Marca
**MAJESTIC STORIES**, la misma de la Parte 1 (no entra en la rotación): edit.py, BRAND = "MAJESTIC", SPEED = 1.15.

## Archivos listos
- guion.md y caption.txt (formato Parte 2, #parte2).
- lines.json, fuente única: 366 palabras.
- clips.py, 32 clips: c01-c28 hablados (c28 = CTA de 10 s), i01 inserto sin caras y r1-r3 mudos.
  - Copia de pieces/costal-cuyutlan/clips.py: ots(), two(), MOUTH, tuplas (prompt_nuevo, prompt_one), ONE_FROM=3, --one, y todas las defensas (gatito en imagen, reload_flow, new_project, descarga corrupta, duplicados md5, TRIES=6, SAFE/SOFT con las frases fuertes primero, NOREF, parada "LIMITE DE CREDITOS"). Imprime "FIN P2".
  - Reparto: 17 OTS (55 %), 7 single (23 %), 4 two-shot (13 %), 3 grupo (10 %) + 1 inserto. Geografía fija: Arsenio y Tamara derecha, Maura y Eustolia izquierda. c01 es Eustolia hablando.
- make_sheets.py: reutiliza las 5 hojas de la P1 copiadas a chars/ (EUSTOLIA_LOMELI, ARSENIO_LOMELI, TAMARA_LOMELI, MAURA_GRACIANO, LOC_MUELLEMEXCAL). **Sin hojas nuevas.** `--reupload` salta las carpetas pulsera-mexcaltitan* en el control de duplicados.
- phr.py y edit.py (copia del de costal-cuyutlan, EDL vacía, BRAND = "MAJESTIC", SPEED = 1.15; música cálida de c22 a c27).
- Comprobaciones: py_compile OK en los 4 .py; IDs de CLIPS = claves de lines.json en el mismo orden (leído con ast, sin importar); cada clip hablado llama a talk() con su propio ID y los mudos no; ningún nombre sin definir; todos los @{ASSET} tienen hoja; frases de SOFT = lines.json; sin cifras; ninguna frase repetida de otra pieza.

Nada generado en Flow todavía.

## Siguiente
1. `python -I make_sheets.py --reupload > sheets_log.txt`: sube las 5 copias e imprime "FIN HOJAS".
2. `python -I clips.py > clips_log.txt`, con Monitor sobre "^FIN P2", Traceback, "intento 6" y "LIMITE".
3. QA: dobles en los OTS (regenerar con `--one`), ropa de la P1, pulsera en la muñeca izquierda, geografía izquierda/derecha, la lancha blanca con franja azul, pronunciación.
4. `python -I phr.py`, armar la EDL y `python -I edit.py`. Verificar sincronía en 5 puntos, ≤2 s por tramo, LUFS y pico, marca MAJESTIC arriba a la izquierda.
5. Copiar a LucidLink (Majestic/) con caption.txt.
