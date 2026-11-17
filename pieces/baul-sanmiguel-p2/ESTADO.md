---
type: handoff
status: active
tags: [atrium, novelas, majestic-stories, parte2, remake-transformado, padre-hijos-herencia, san-miguel-de-allende, guanajuato, cantera]
relatedTo: [baul-sanmiguel, atrium-vista]
---
# baul-sanmiguel-p2 (El Baúl de San Miguel · Parte 2): estado

## La historia
Es la Parte 2 de pieces/baul-sanmiguel y sigue el ritmo emocional de la P2 de Atrium "Le dio otra oportunidad a su hijo… y lo volvió a humillar" (7706270980758441247, 390K). Análisis nuevo hecho por API: `fuentes/atrium-vista/videos/7706270980758441247_analisis.md`.
- De noche, Hilario oyó todo: "La cortadora no se vende, mijo." Pide que Raymundo venga mañana a las nueve.
- Reunión en el patio de la casita: Mirna lo trata de "una boca más", Raymundo propone una casa de reposo, Ciriaco le recuerda que él le labró la cantera de la casona. "Me recibieron, hijo. No me recogieron."
- Hilario abre el baúl y llega el notario Villagómez: la casona siempre fue de Hilario.
- Castigo (el gancho de la P1 al revés): "Sus cosas afuera antes de las ocho. Esa casa no es pensión."
- Reconocimiento: Ciriaco firma; la casona y la cantera del abuelo son suyas; el llavero de latón pasa a su mano. CTA: "¿Ustedes creen que Raymundo merece otra oportunidad? … para ver el final."

No hay armas, sangre, cifras de dinero, deudas, uniformes, niños ni Navidad. Detalle en guion.md.

## Marca
**MAJESTIC STORIES**, la misma de la Parte 1 (no entra en la rotación): edit.py, BRAND = "MAJESTIC".

## Archivos listos
- guion.md y caption.txt (formato Parte 2, #parte2).
- lines.json es la fuente única: 457 palabras.
- clips.py tiene 49 clips: c01-c41 hablados (c41 = CTA de 10 s), i01-i05 insertos sin caras y r1-r3 reacciones mudas.
  - Es copia del clips.py de aserrin-huamantla-p2, con todas sus defensas: gatito en imagen, reload_flow, new_project, descarga corrupta, duplicados md5, TRIES=6, SAFE/SOFT (frases fuertes de la P2 primero), NOREF (con el notario) y la parada "LIMITE DE CREDITOS" en gen().
  - Imprime "FIN P2". Presentación del notario en c26. Hilario lleva el sombrero en todos los planos (ancla HIL).
- make_sheets.py:
  - Reutiliza las 7 hojas de la Parte 1 copiadas a chars/: HILARIO_PENALOZA, RAYMUNDO_PENALOZA, MIRNA_OLGUIN, CIRIACO_PENALOZA, FELICITAS_CANCHOLA, LOC_CASONASM y LOC_CUARTOCANTERA (LOC_CASONASM no sale en ningún plano de la P2).
  - **1 hoja nueva: ANSELMO_VILLAGOMEZ** (el notario).
  - En `--reupload` las copias no cuentan como DUPLICADO: se saltan todas las carpetas baul-*.
  - Ojo: el `--reupload` del make_sheets.py de la P1 no salta la carpeta p2 y ahora marcaría sus hojas como DUPLICADO.
- phr.py.
- edit.py: copia del de aserrin-huamantla-p2 con la EDL vacía y BRAND = "MAJESTIC". Música: suspenso hasta c35, cálida de c35 a c40 (el reconocimiento), suspenso en el CTA.

Nada generado en Flow todavía.

## Siguiente
1. `python -I make_sheets.py --reupload > sheets_log.txt`: sube las 7 copias, genera y sube ANSELMO_VILLAGOMEZ e imprime "FIN HOJAS". Revisar md5 y que el notario no se parezca a Raymundo ni a Hilario.
2. `python -I clips.py > clips_log.txt`, con un Monitor sobre "^FIN P2", Traceback, "intento 6" y "LIMITE".
3. QA:
   - Hilario con sombrero en todos los planos, también de noche (c01-c07);
   - el baúl igual que en la P1 y el bastón en la mano izquierda;
   - Mirna y Raymundo a la derecha, Ciriaco y Felícitas a la izquierda;
   - el notario el único calvo con lentes de carey;
   - papeles sin texto legible; pronunciación de "Villagómez", "arrimado", "labré".
4. `python -I phr.py`, armar la EDL y correr `python -I edit.py`.
5. Verificar sincronía en 5 puntos, ≤2 s por tramo, LUFS y pico, y la marca MAJESTIC arriba a la izquierda.
6. Copiar a LucidLink (Majestic/) con caption.txt.
