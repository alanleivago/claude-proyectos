---
type: handoff
status: active
tags: [atrium, novelas, mexi-stories, parte2, remake-transformado, padre-hijos-herencia, aguascalientes, calvillo, guayaba, empacadora]
relatedTo: [ate-calvillo, costal-cuyutlan-p2, atrium-vista]
---
# ate-calvillo-p2 (El Ate de Calvillo · Parte 2): estado

## La historia
Parte 2 de pieces/ate-calvillo. Arranca desde el gancho de la P1 ("el lunes te presentas en la empacadora: ya es hora de que conozcas a tu patrón").
- Gancho con recordatorio: Eleazar, pálido: "¿Mi patrón? ¿La empacadora es suya, apá?"
- Desenlace del giro: Cleofas la compró con la guayaba del cañón y pidió el puesto para su hijo; el lunes Eleazar empieza desde abajo, cortando guayaba en la huerta de su hermana.
- Castigo de la villana: cuaja el ate (la pala queda parada), las llaves se quedan en la mesa de Cleofas y Marcela se va a pie, en tacones, a la central de camiones, como lo mandaron a él.
- Eleazar se queda, llora y pide perdón; Cleofas lo perdona sin cambiar su decisión ("volver a confiar en ti me va a tomar tiempo"). Se quita el reloj dorado y carga guayaba.
- Gancho: Marcela al teléfono en la calle, "el viejo no sabe lo que firmó Eleazar". CTA de Cleofas: "Si fuera su hijo, ¿le darían la canasta o el boleto de camión?"

Ritmo emocional: Final de Evaristo (7706344565933985054, bloques 5-9) y salida de la villana del Final de la madrastra (7705499092683590942). Sin armas, sangre, cifras de dinero, deudas, uniformes, niños ni Navidad. Detalle en guion.md.

## Marca
**MEXI STORIES**, la misma de la Parte 1 (no entra en la rotación): edit.py, BRAND = "MEXI", SPEED = 1.15.

## Archivos listos
- guion.md y caption.txt (formato Parte 2, #parte2).
- lines.json, fuente única: 369 palabras.
- clips.py, 30 clips: c01-c24 hablados (c24 = CTA de 10 s), i01 inserto sin caras y r1-r5 mudos.
  - Copia de pieces/costal-cuyutlan-p2/clips.py: ots(), two(), MOUTH, tuplas (prompt_nuevo, prompt_one), ONE_FROM=3, --one y todas las defensas (gatito en imagen, reload_flow, new_project, descarga corrupta, duplicados md5, TRIES=6, SAFE/SOFT con las frases fuertes primero, NOREF, parada "LIMITE DE CREDITOS"). Imprime "FIN P2".
  - Reparto: 15 OTS (52 %), 7 single (24 %), 4 two-shot (14 %), 3 grupo (10 %, mudos) + 1 inserto. Geografía fija: Gertrudis y Cleofas a la izquierda (fogón); Marcela y Eleazar a la derecha (portón). c01 es Eleazar hablando.
- make_sheets.py: reutiliza las 5 hojas de la P1 copiadas a chars/ (CLEOFAS_ELIZALDE, GERTRUDIS_ELIZALDE, MARCELA_COLLADO, ELEAZAR_ELIZALDE, LOC_ATECALVILLO). Sin hojas nuevas ni personajes nuevos. `--reupload` salta las carpetas ate-calvillo* en el control de duplicados.
- phr.py y edit.py (copia del de costal-cuyutlan-p2, EDL vacía, BRAND = "MEXI", SPEED = 1.15; música cálida de c19 a c23).
- Comprobaciones: py_compile OK en los 4 .py; pyflakes sin avisos en clips.py y make_sheets.py; IDs de CLIPS = claves de lines.json en el mismo orden (leído con ast, sin importar); cada clip hablado llama a talk() con su propio ID y los mudos no; los @{ASSET} = los 5 jpg de chars/; frases de SOFT = lines.json; sin dígitos en las líneas; ninguna frase de más de 3 palabras repetida de otra pieza.

Nada generado en Flow todavía.

## Siguiente
1. `python -I make_sheets.py --reupload > sheets_log.txt`: sube las 5 copias, imprime "FIN HOJAS".
2. `python -I clips.py > clips_log.txt`, con Monitor sobre "^FIN P2", Traceback, "intento 6" y "LIMITE".
3. QA: dobles en los OTS (regenerar con `--one`), ropa de la P1, Cleofas con sombrero y paliacate, Eleazar sin la llave y con reloj hasta r4, la pala parada en i01, pronunciación ("Calvillo", "cuajó", "terracería").
4. `python -I phr.py`, armar la EDL y `python -I edit.py`. Verificar sincronía en 5 puntos, ≤2 s por tramo, LUFS y pico, marca MEXI arriba a la derecha.
5. Copiar a LucidLink (MexiTV/) con caption.txt.
