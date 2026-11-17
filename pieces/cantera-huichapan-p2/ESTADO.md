---
type: handoff
status: active
tags: [atrium, novelas, majestic-stories, parte2, remake-transformado, patron-injusticia, huichapan, hidalgo, cantera]
relatedTo: [cantera-huichapan, atrium-vista]
---
# cantera-huichapan-p2 (La Cantera de Huichapan · Parte 2): estado

## La historia
Es la Parte 2 de pieces/cantera-huichapan y sigue el ritmo emocional de la P2 de Atrium "Su jefe les cobraba lo que era gratis" (7698054444662934815, 141K). Análisis: `fuentes/atrium-vista/videos/7698054444662934815_analisis.md`.
- Gancho con recordatorio: el celular en llamada en la bolsa de Abdías; "Les cobraste a todos lo que era gratis, Sotero. Hoy se te acaba el turno."
- Sotero alega un malentendido y culpa a Abdías; Rosalba saca su libreta negra (el nombre de cada cantero que le pagó). Orgullo herido: "¿y así me lo paga?"
- Castigo: despedido, las llaves del almacén en el escritorio, devolver lo de cada uno en su mano y delante de todos antes de que acabe el turno (el plazo de la P1), o la ley.
- Patio: "Esto te lo voy a cobrar" / "Ya cobró bastante. Ahora le toca devolver." Rosalba: "Yo le creo a Abdías."
- Desenlace: Abdías encargado del patio, reparte guantes y lentes; don Bonifacio recibe los suyos. CTA: "¿Ustedes le habrían dado otra oportunidad a Sotero? … para más historias de la cantera."

No hay armas, sangre, cifras de dinero, deudas, uniformes, niños ni Navidad. Detalle en guion.md.

## Marca
**MAJESTIC STORIES**, la misma de la Parte 1 (no entra en la rotación): edit.py, BRAND = "MAJESTIC".

## Archivos listos
- guion.md y caption.txt (formato Parte 2, #parte2).
- lines.json es la fuente única: 376 palabras.
- clips.py tiene 41 clips: c01-c30 hablados (c30 = CTA de 10 s), i01-i06 insertos sin caras y r1-r5 mudos (r4 = presentación de Bonifacio).
  - Es copia del clips.py de la Parte 1 con todas sus defensas: gatito en imagen, reload_flow, new_project, descarga corrupta, duplicados md5, TRIES=6, SAFE/SOFT (frases fuertes de la P2 primero), NOREF (con Bonifacio) y la parada "LIMITE DE CREDITOS" en gen(). Imprime "FIN P2".
  - Anclas ROS, ABD y SOT idénticas a la P1 (misma ropa).
- make_sheets.py:
  - Reutiliza las 5 hojas de la Parte 1: ROSALBA_MONROY, ABDIAS_CARBAJAL, SOTERO_VERASTEGUI, LOC_CANTERAHUICH y LOC_CASETACANT (lista REUSED: las copia de pieces/cantera-huichapan/chars a chars/; nunca las regenera).
  - **Ojo: la Parte 1 todavía no tiene chars/ (sus hojas no se han generado).** Por eso chars/ de la P2 está vacía: al correr la P2 sin las hojas de la P1 imprime "FALTA <hoja>" y no la inventa.
  - **1 hoja nueva: BONIFACIO_URIBE.**
  - En `--reupload` las copias no cuentan como DUPLICADO: se saltan las carpetas cantera-huichapan*. El make_sheets.py de la P1 también salta esas carpetas ahora.
- phr.py y edit.py (copias de la P1, EDL vacía, BRAND = "MAJESTIC"). Música: suspenso hasta c20, cálida de c20 a c30 (las gracias, el ascenso, el equipo, los lentes de Bonifacio), suspenso en el CTA.
- Comprobaciones: `python -m py_compile` OK en los 4 .py; IDs de CLIPS = claves de lines.json en el mismo orden (leído con ast, sin importar); todos los @{ASSET} tienen hoja.

Nada generado en Flow todavía.

## Siguiente
1. Parte 1: `python -I make_sheets.py > sheets_log.txt` en pieces/cantera-huichapan (si no se hizo ya).
2. P2: `python -I make_sheets.py --reupload > sheets_log.txt`: copia y sube las 5 hojas de la P1, genera y sube BONIFACIO_URIBE e imprime "FIN HOJAS". Revisar que no diga FALTA, el md5 y que Bonifacio no se parezca a Sotero ni a Abdías.
3. `python -I clips.py > clips_log.txt`, con un Monitor sobre "^FIN P2", Traceback, "intento 6" y "LIMITE".
4. QA: misma ropa que la P1 en todos los planos; el chaleco de Sotero sin letras; la libreta negra sin nada legible (i02); Bonifacio con sombrero y lentes nuevos en c29; pronunciación de "Bonifacio", "Sotero", "Abdías", "revoltoso".
5. `python -I phr.py`, armar la EDL y correr `python -I edit.py`.
6. Verificar sincronía en 5 puntos, ≤2 s por tramo, LUFS y pico, y la marca MAJESTIC arriba a la izquierda.
7. Copiar a LucidLink (Majestic/) con caption.txt.
