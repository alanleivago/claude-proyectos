---
type: handoff
status: active
tags: [atrium, novelas, vista-stories, parte2, remake-transformado, madrastra-justicia, huamantla, tlaxcala, alfombras-de-aserrin]
relatedTo: [aserrin-huamantla, atrium-vista]
---
# aserrin-huamantla-p2 (La Alfombra de Huamantla · Parte 2): estado

## La historia
Es la Parte 2 de pieces/aserrin-huamantla y sigue el ritmo emocional de la P2 de Atrium "¡La echó de la casa por cómo trataba a su hija!" (7705479449055169822, 336K). Análisis nuevo hecho por API: `fuentes/atrium-vista/videos/7705479449055169822_analisis.md`.
- Delfino le pide perdón a Abigail y le quita la escobeta de la mano.
- Cleotilde reclama su "autoridad" y dice que sus hijas "son de otra clase".
- Kenia trae la carpeta azul: las escrituras dicen Abigail Cuapio. Kenia se pone del lado de Abigail y le pide perdón.
- Castigo: Cleotilde tiene que irse con sus cosas y las de sus princesas antes de la procesión. Sale con su maleta por la orilla de la alfombra ("la alfombra de la Virgen no se pisa") y amenaza con volver.
- Payoff: esta noche el colibrí lo pone Abigail. Moraleja y CTA "¿Ustedes creen que Cleotilde va a regresar? … para ver el final."

No hay armas, sangre, cifras de dinero, deudas, uniformes, niños ni Navidad. Detalle en guion.md.

## Marca
**VISTA STORIES**, la misma de la Parte 1 (no entra en la rotación): edit.py, BRAND = "VISTA".

## Archivos listos
- guion.md y caption.txt (formato Parte 2, #parte2).
- lines.json es la fuente única: 325 palabras.
- clips.py tiene 39 clips: c01-c30 hablados (c30 = CTA de 10 s), i01-i06 insertos sin caras y r1-r3 reacciones mudas.
  - Es copia del clips.py de la Parte 1, con todas sus defensas: gatito en imagen, reload_flow, new_project, descarga corrupta, duplicados md5, TRIES=6, SAFE/SOFT (con las frases fuertes de la P2 primero), NOREF con Kenia y la parada "LIMITE DE CREDITOS" en gen().
  - Imprime "FIN P2".
  - Presentación de Kenia en c14.
- make_sheets.py:
  - Reutiliza 4 hojas de la Parte 1 copiadas a chars/, las vigentes: DELFINO_CUAPIO, ABIGAIL_CUAPIO, CLEOTILDE_TENOPALA2 y LOC_PATIOHUAM2.
  - **1 hoja nueva: KENIA_TENOPALA**.
  - Las copias no cuentan como DUPLICADO porque se saltan aserrin-huamantla y aserrin-huamantla-p2.
  - Ojo: el `--reupload` del make_sheets.py de la P1 no salta la carpeta p2 y ahora marcaría sus hojas como DUPLICADO.
- phr.py.
- edit.py: copia del de la P1 con la EDL vacía y BRAND = "VISTA". Música: suspenso hasta c02, cálida de c02 a c07 (el perdón) y suspenso hasta el final.
- Comprobaciones:
  - `python -m py_compile` OK en los 4 .py.
  - Los IDs de CLIPS coinciden con las claves de lines.json, en el mismo orden (leído con ast, sin importar el módulo).
  - Todos los @{ASSET} tienen hoja y no sobra ninguna.
  - Las frases en español de SOFT están en lines.json.

Nada generado en Flow todavía.

## Siguiente
1. `python -I make_sheets.py --reupload > sheets_log.txt`: sube las 4 copias, genera y sube KENIA_TENOPALA e imprime "FIN HOJAS". Revisar md5 y que Kenia no se parezca a Abigail ni a Cleotilde más allá de un aire de madre e hija.
2. `python -I clips.py > clips_log.txt`, con un Monitor sobre "^FIN P2", Traceback, "intento 6" y "LIMITE".
3. QA:
   - Abigail con el mandil todo el video;
   - Cleotilde con tubos y bata, también al salir;
   - Kenia la única con cola y sudadera lila;
   - la carpeta azul sin texto legible;
   - en i05 la maleta no pisa la alfombra.
4. `python -I phr.py`, armar la EDL y correr `python -I edit.py`.
5. Verificar sincronía en 5 puntos, ≤2 s por tramo, LUFS y pico, y la marca VISTA arriba al centro.
6. Copiar a LucidLink (Vista/) con caption.txt.
