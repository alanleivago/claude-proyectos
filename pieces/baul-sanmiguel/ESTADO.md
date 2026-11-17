---
type: handoff
status: active
tags: [atrium, novelas, majestic-stories, parte1, remake-transformado, padre-hijos-herencia, san-miguel-de-allende, guanajuato, cantera]
relatedTo: [plata-taxco, aserrin-huamantla, baul-sanmiguel, betun-zacatecas, atrium-vista]
---
# baul-sanmiguel (El Baúl de San Miguel · Parte 1): estado

## Video base
- Remake transformado de **"Su propio hijo le cerró la puerta · Parte 1"** de @atriumstories_ (7706224426399829279, **342K vistas**, 190 s, 88 planos). Su P2 tiene 390K y la saga suma 1.06M. Análisis: `fuentes/atrium-vista/videos/7706224426399829279_analisis.md`.
- Por qué este: es la saga nueva con más vistas que no tenía pieza, y su P2 superó a la P1. Ver `fuentes/atrium-vista/ranking2.md`.
- Pedido del usuario (2026-11-14): más cerca de las historias de Atrium, pero sin copiar. Se conservan la historia y su ritmo emocional. Cambian el escenario y la región, el oficio, el objeto clave, los nombres, todos los diálogos, el detalle del giro y el CTA.

## Qué se cambió
- Región y escenario: la mansión moderna sin región pasa a ser una casona colonial de San Miguel de Allende (Guanajuato), y la casa del hijo pobre, una casita de cantera.
- Oficios: el hijo pobre deja de ser repartidor en moto y pasa a ser Ciriaco, cantero. El hijo rico es Raymundo, arquitecto.
- Objeto: la maleta de cuero se cambia por un baúl de lámina verde pintado de flores. Dentro lleva papeles atados con cordón rojo y un llavero de latón.
- Plazo nuevo en el gancho: "Su baúl afuera antes de las ocho", porque a esa hora llega la mamá de Mirna.
- Complicación sin cifras ni deudas: el dueño quiere el cuartito para su sobrino, así que Ciriaco piensa vender su cortadora.
- Giro: Hilario abre el baúl y llama al notario: "Ya sé cuál de mis hijos se va a quedar con todo."
- CTA a cámara: "¿Ustedes a cuál de los dos le dejarían todo?"
- Nombres nuevos y únicos en pieces/: Hilario, Raymundo y Ciriaco Peñaloza, Mirna Olguín, Felícitas Canchola y el licenciado Villagómez.
(Detalle en guion.md, tabla "Qué cambia respecto al original".)

## Marca
**MAJESTIC STORIES**: edit.py, BRAND = "MAJESTIC" (kit pieces/_marcas/MAJESTIC, con su música; la pieza no tiene carpeta music/ propia).

## Archivos
guion.md, caption.txt, lines.json (fuente única, unas 380 palabras), clips.py (45 clips: 38 hablados c01-c38, 4 insertos i01-i04 y 3 reacciones r1-r3), make_sheets.py (5 personajes + LOC_CASONASM + LOC_CUARTOCANTERA = 7 hojas), phr.py y edit.py (EDL vacía; música cálida de c22 a c32). Es el más largo de la tanda: si el montaje pasa de unos 2:20, se recortan frases de c13 a c18.
- Es copia de la plantilla plata-taxco y conserva todas sus defensas:
  - en los prompts: gaze + ONE + ALONE, PRES (un plano de presentación por personaje), NOSUB + CLEAN + END, NODOUBLE;
  - en los reintentos: SAFE/SOFT con las frases fuertes primero, variant, NOREF, TRIES=6;
  - contra fallos de Flow: gatito como IMAGEN, control de duplicados por md5, reload_flow, new_project y la parada "LIMITE DE CREDITOS" en gen().
- make_sheets.py pide "ordinary non-famous face", controla duplicados por md5 (DUPLICADO) y acepta --reupload.
- Comprobaciones:
  - `python -m py_compile` OK en clips.py, make_sheets.py, edit.py y phr.py.
  - Los IDs de CLIPS coinciden con las claves de lines.json, en el mismo orden (leído con ast, sin importar el módulo).
  - Todos los @{ASSET} tienen hoja y no sobra ninguna hoja.
  - Las frases en español de SOFT coinciden con lines.json.

## Avance
- 2026-11-14: archivos escritos. No se generó nada en Flow. Faltan las hojas, los clips, el QA, phr.py, la EDL y el montaje.

## Siguiente
1. `python -I make_sheets.py > sheets_log.txt` (imprime "FIN HOJAS"). Revisar que no salga DUPLICADO, correr `md5sum chars/*.jpg` y mirar la hoja de contactos: caras comunes y distintas entre sí.
2. `python -I clips.py > clips_log.txt` y QA de cada clip. Revisar:
   - morphs y bordes del cuadro;
   - el baúl verde con flores rojas igual en todos los planos y el bastón siempre en la mano izquierda;
   - que solo Hilario lleve sombrero, y que de noche (c36, c37 y r3) no lo lleve;
   - Mirna arriba a la derecha y Raymundo arriba a la izquierda;
   - la cortina floreada en la escena de noche y el celular de tapa en la mano derecha;
   - la pronunciación de "Hilario", "Ciriaco", "Felícitas" y "Villagómez".
3. phr.py → EDL en edit.py → montaje → verificación (sincronía en 5 puntos, ≤2 s por tramo, LUFS y pico, marca) → copia a LucidLink con caption.txt.
