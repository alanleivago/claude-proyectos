---
type: handoff
status: active
tags: [atrium, novelas, vista-stories, parte2, remake-transformado, madrastra-justicia, quintana-roo, bacalar, lanchas, hermano-traidor]
relatedTo: [gaviota-bacalar, costal-cuyutlan-p2, atrium-vista]
---
# gaviota-bacalar-p2 (La Gaviota de Bacalar · Parte 2): estado

## La historia
Parte 2 de pieces/gaviota-bacalar. Arranca desde el gancho de la P1 (Wilberto llega en la última lancha).
- Gancho con recordatorio: Wilberto en la punta del muelle: "Ya llegó la última lancha, hermano. Y la mitad de este muelle es mía."
- Desenlace del giro: Ixchel saca de debajo del asiento de La Gaviota el papel de su mamá: cuando Wilberto se fue a Cancún le cedió su mitad a ella; ahora es de Ixchel.
- Araceli y Wilberto se culpan entre sí. Castigo: se van los dos en la misma última lancha, Wilberto entrega la llave de la bodega y Araceli arrastra la maleta dorada por las tablas recién talladas.
- Cálida: mañana le pintan el nombre a La Gaviota; Saturnino le quita el cepillo y le pide perdón a su hija.
- Gancho: Araceli en la lancha, "ya veremos cuando mis hijas lleguen a este muelle". CTA de Saturnino: "¿Ustedes le habrían quitado la llave a su propio hermano?"

Ritmo emocional: Final de la madrastra (7705499092683590942) y la pareja que se culpa del Final de Evaristo (7706344565933985054). Sin armas, sangre, cifras de dinero, deudas, uniformes, niños ni Navidad. Detalle en guion.md.

## Marca
**VISTA STORIES**, la misma de la Parte 1 (no entra en la rotación): edit.py, BRAND = "VISTA", SPEED = 1.15.

## Archivos listos
- guion.md y caption.txt (formato Parte 2, #parte2).
- lines.json, fuente única: 362 palabras.
- clips.py, 30 clips: c01-c23 hablados (c23 = CTA de 10 s), i01 inserto sin caras y r1-r6 mudos.
  - Copia de pieces/costal-cuyutlan-p2/clips.py: ots(), two(), MOUTH, tuplas (prompt_nuevo, prompt_one), ONE_FROM=3, --one y todas las defensas (gatito en imagen, reload_flow, new_project, descarga corrupta, duplicados md5, TRIES=6, SAFE/SOFT con las frases fuertes primero, NOREF, parada "LIMITE DE CREDITOS"). Imprime "FIN P2".
  - Reparto: 15 OTS (52 %), 7 single (24 %), 4 two-shot (14 %), 3 grupo (10 %, mudos) + 1 inserto. Geografía fija: Ixchel y Saturnino a la izquierda (lanchas, La Gaviota); Araceli y Wilberto a la derecha (palapa, punta del muelle). c01 es Wilberto hablando.
- make_sheets.py: reutiliza las 5 hojas de la P1 copiadas a chars/ (SATURNINO_DZIB, ARACELI_BRACAMONTES, IXCHEL_DZIB, WILBERTO_DZIB, LOC_MUELLEBACALAR). Sin hojas nuevas ni personajes nuevos. `--reupload` salta las carpetas gaviota-bacalar* en el control de duplicados.
- phr.py y edit.py (copia del de costal-cuyutlan-p2, EDL vacía, BRAND = "VISTA", SPEED = 1.15; música cálida de c19 a c22).
- Comprobaciones: py_compile OK en los 4 .py; pyflakes sin avisos en clips.py y make_sheets.py; IDs de CLIPS = claves de lines.json en el mismo orden (leído con ast, sin importar); cada clip hablado llama a talk() con su propio ID y los mudos no; los @{ASSET} = los 5 jpg de chars/; frases de SOFT = lines.json; sin dígitos en las líneas; ninguna frase de más de 3 palabras repetida de otra pieza.

Nada generado en Flow todavía.

## Siguiente
1. `python -I make_sheets.py --reupload > sheets_log.txt`: sube las 5 copias, imprime "FIN HOJAS".
2. `python -I clips.py > clips_log.txt`, con Monitor sobre "^FIN P2", Traceback, "intento 6" y "LIMITE".
3. QA: dobles en los OTS (regenerar con `--one`), ropa de la P1, Ixchel descalza, Araceli con la maleta dorada a la derecha, el papel y el sobre sin texto, en r6 la lancha lejos y sin caras nítidas, pronunciación ("Ixchel", "Cancún", "Bacalar").
4. `python -I phr.py`, armar la EDL y `python -I edit.py`. Verificar sincronía en 5 puntos, ≤2 s por tramo, LUFS y pico, marca VISTA arriba al centro.
5. Copiar a LucidLink (Vista/) con caption.txt.
