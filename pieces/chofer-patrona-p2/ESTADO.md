---
type: handoff
status: active
tags: [atrium, novelas, majestic-stories, parte2, historia-propia, capos, chofer]
relatedTo: [chofer-patrona, mariachi-patron-p2, viuda-aguacate-p2, atrium-vista]
---
# chofer-patrona-p2 (El Chofer de la Patrona · Parte 2): estado

## La historia
Es la Parte 2 de pieces/chofer-patrona. Valente confiesa que Treviño le cobró una supuesta deuda de su papá. Llega Treviño en la troca blanca con un pagaré "del doce de mayo", y Lencho recuerda que ese día el patrón estaba internado y él mismo lo llevó. Eusebia cierra el portón, recupera el maletín y le quita la troca blanca, que era de su marido. Treviño sale a pie por la puerta chica. Valente le pide perdón a "don Lencho". Lencho sabía que era él y no lo acusó porque el papá le pidió que lo cuidara. Castigo: Valente pasa a ser el chofer de Lencho. Chema se queda con la caballeriza y la troca es para Lencho. Cierre: "Al panteón, joven. Vamos a ver a su papá." CTA con dilema y la historia queda cerrada. No hay armas, sangre, cifras de dinero ni Navidad.

## Marca
**MAJESTIC STORIES**, la misma de la Parte 1 (no entra en la rotación): edit.py, BRAND = "MAJESTIC".

## Archivos listos
- guion.md y caption.txt (formato Parte 2, #parte2).
- lines.json es la fuente única de clips.py: 373 palabras y la primera línea sin cifras.
- clips.py tiene 46 clips: c01-c34 hablados, i01-i08 insertos sin caras y r1-r4 reacciones mudas. Es copia del clips.py de chofer-patrona, con gatito en imagen, reload_flow, new_project, control de descarga corrupta, duplicados md5, TRIES=6, SOFT con frases alternativas y NOREF con Treviño. Imprime "FIN P2". py_compile da OK y las claves coinciden con lines.json.
- make_sheets.py usa las 6 hojas de la Parte 1 copiadas en chars/ (FLORENCIO_ARAMBULA, VALENTE_MONTALVO2, EUSEBIA_MONTALVO, BRIGIDO_TOSTADO, CHEMA_ARAMBULA, LOC_COCHERARANCHO) y **1 hoja nueva: LISANDRO_TREVINO**. Las copias no cuentan como DUPLICADO porque se saltan chofer-patrona y chofer-patrona-p2. Ojo: el `--reupload` de chofer-patrona/make_sheets.py (P1) no salta la carpeta p2 y ahora marcaría sus hojas como DUPLICADO. No hace falta porque la P1 está terminada.
- phr.py.
- edit.py: copia del edit.py de chofer-patrona con la EDL vacía (se arma desde renders/phr.json) y BLACK de 0,4 s antes de c34. Música: suspenso hasta c21, cálida de c21 a i08 y suspenso hasta el final.

Nada generado en Flow todavía.

## Siguiente
1. `python -I make_sheets.py --reupload > sheets_log.txt`: sube las 6 copias, genera y sube LISANDRO_TREVINO e imprime "FIN HOJAS". Revisar md5 y que Treviño no se parezca a nadie famoso ni a otro personaje.
2. `python -I clips.py > clips_log.txt`, con un Monitor sobre "^FIN P2", Traceback e "intento 6".
3. QA (qa_clips.md): bordes y ropa, la tableta plana en i01, la troca blanca igual en todos los planos, Treviño con lentes y Brígido con sombrero. Regenerar con `python -I clips.py <ids> > clips_log2.txt`.
4. `python -I phr.py`, armar la EDL y correr `python -I edit.py`.
5. Verificar sincronía en 5 puntos, ritmo ≤2 s, LUFS y pico, y la marca MAJESTIC STORIES arriba a la izquierda.
- 2026-11-09: hoja nueva LISANDRO_TREVINO OK a ojo (md5 único); 6 de la P1 resubidas. Clips 46/46. QA: regenerados c34 (CTA: primer plano, media sonrisa, ceja, pausa, levanta la llave) y c02 (con hoja Omni bloqueaba "Que si no pagaba, perdíamos el rancho" → lines.json "Y que el rancho estaba en juego, madre."; ahora con hoja de Valente). i01 (tableta) va después de c01 para abrir con Eusebia hablando; i02 acortado.
- renders/share.mp4: 142.0 s, 82 tramos (1.75 s/tramo), -14.3 LUFS, -2.0 dBTP, sync 0 ms en 5 puntos, BLACK 134.0 s, MAJESTIC arriba a la izquierda. Revisión API v1: renders/share_revision.md. NO enviado a Telegram.
