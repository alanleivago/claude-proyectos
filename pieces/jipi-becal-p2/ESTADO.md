---
type: handoff
status: active
tags: [atrium, novelas, mexi-stories, parte2, remake-transformado, madrastra-justicia, suegra-nuera, becal, campeche, sombrero-jipi]
relatedTo: [jipi-becal, atrium-vista]
---
# jipi-becal-p2 (La Cueva de Bécal · Parte 2): estado

## La historia
Parte 2 de pieces/jipi-becal. Arranca desde el gancho de la P1 (Zoraida le llama a su hijo a escondidas).
- Gancho con recordatorio: Zoraida, castigada en la cueva, le pide a Lisandro que venga a sacarla.
- Lisandro (nuevo, 30) baja un día antes de la plataforma. Zoraida se hace la víctima; Nicté dice que nunca le escribió; la abuela le da el celular rosa.
- Desenlace del giro: los mensajes de "ya no me busques" salían cada noche del celular de Nicté y luego Zoraida le llamaba a su hijo para consolarlo.
- Castigo: Lisandro le quita el celular dorado "para que rindas"; la abuela le da el cuartito de la palma y el petate; los doce sombreros siguen; Nicté deja la escalera abajo: "Yo no soy como usted."
- Gancho: Zoraida en la cueva, "ya van a ver quién teje a quién". CTA de Nicté: "¿Ustedes la dejarían salir de esa cueva?"

Sin armas, sangre, cifras de dinero, deudas, uniformes, niños ni Navidad. Detalle en guion.md.

## Marca
**MEXI STORIES**, la misma de la Parte 1 (no entra en la rotación): edit.py, BRAND = "MEXI", SPEED = 1.15.

## Archivos listos
- guion.md y caption.txt (formato Parte 2, #parte2).
- lines.json, fuente única: 375 palabras.
- clips.py, 35 clips: c01-c28 hablados (c28 = CTA de 10 s), i01-i03 insertos sin caras y r1-r4 mudos.
  - Copia de pieces/costal-cuyutlan/clips.py: ots(), two(), MOUTH, tuplas (prompt_nuevo, prompt_one), ONE_FROM=3, --one, y todas las defensas (gatito en imagen, reload_flow, new_project, descarga corrupta, duplicados md5, TRIES=6, SAFE/SOFT con las frases fuertes primero, NOREF con Lisandro, parada "LIMITE DE CREDITOS"). Imprime "FIN P2".
  - Reparto: 18 OTS (56 %), 7 single (22 %), 4 two-shot (12 %), 3 grupo (9 %) + 3 insertos. Geografía fija: Zoraida izquierda, Lisandro en medio, Nicté y la abuela derecha. c01 es Zoraida hablando.
- make_sheets.py: reutiliza las 5 hojas de la P1 copiadas a chars/ (APOLONIA_CHABLE, ZORAIDA_CANUL, NICTE_UCAN, LOC_CUEVABECAL, LOC_PATIOBECAL) y **1 hoja nueva: LISANDRO_PECH**. `--reupload` salta las carpetas jipi-becal* en el control de duplicados.
- phr.py y edit.py (copia del de costal-cuyutlan, EDL vacía, BRAND = "MEXI", SPEED = 1.15; música cálida de c24 a c27).
- Comprobaciones: py_compile OK en los 4 .py; IDs de CLIPS = claves de lines.json en el mismo orden (leído con ast, sin importar); cada clip hablado llama a talk() con su propio ID y los mudos no; ningún nombre sin definir; todos los @{ASSET} tienen hoja (LISANDRO_PECH la genera make_sheets.py); frases de SOFT = lines.json; sin cifras; ninguna frase repetida de otra pieza.

Nada generado en Flow todavía.

## Siguiente
1. `python -I make_sheets.py --reupload > sheets_log.txt`: sube las 5 copias, genera y sube LISANDRO_PECH, imprime "FIN HOJAS". Revisar md5 y que Lisandro no se parezca a nadie de otra pieza.
2. `python -I clips.py > clips_log.txt`, con Monitor sobre "^FIN P2", Traceback, "intento 6" y "LIMITE".
3. QA: dobles en los OTS (regenerar con `--one`), ropa de la P1, Lisandro sin uniforme, escalera en la boca de la cueva, geografía izquierda/derecha, pantallas sin texto, pronunciación.
4. `python -I phr.py`, armar la EDL y `python -I edit.py`. Verificar sincronía en 5 puntos, ≤2 s por tramo, LUFS y pico, marca MEXI arriba a la derecha.
5. Copiar a LucidLink (MexiTV/) con caption.txt.
