---
type: handoff
status: active
tags: [atrium, novelas, vista-stories, parte2, historia-propia, capos]
relatedTo: [fonda-chela, reten-sierra-p2, atrium-vista]
---
# fonda-chela-p2 (El Jefe Nuevo · Parte 2): estado

## La historia
Parte 2 de pieces/fonda-chela. Se acabó el café y decide Chela: Saúl devuelve los 200 mil casa por casa, a pie, antes de las doce (campanario y reloj como cuenta atrás). Sus camionetas y sus muchachos pasan a Macario; el Güero cambia de lealtad. Chela lo deja un año de mesero (callback a "Yo no soy su mesero"). Gancho a la Parte 3: la mitad de lo cobrado iba cada domingo al que se lo recomendó a Macario, alguien que come en su mesa. Sin armas ni sangre. Sin Navidad. Guion pasado por la skill humanizer.

## Marca
**VISTA STORIES**, la misma de la Parte 1 (no entra en la rotación): edit.py, BRAND = "VISTA". Sin carpeta music/ propia.

## Archivos listos
- guion.md, caption.txt ("· Parte 2", #parte2, anuncia la tercera parte).
- lines.json: fuente única de clips.py (398 palabras).
- clips.py: 48 clips (c01–c34 hablados, i01–i08 insertos sin caras, r1–r6 reacciones mudas), 298 s de generación. Copia del clips.py de fonda-chela con todas sus defensas: SAFE/SOFT (con las frases fuertes de este diálogo), variant, NOREF, TRIES=6, gatito de control, reload_flow(), new_project() (proyecto nuevo + make_sheets --reupload), comprobación de descarga corrupta con ffmpeg, 17 s entre clips. Acepta IDs, mueve la versión vieja a clips/old/ e imprime "FIN P2".
- make_sheets.py: las 7 hojas de la Parte 1 ya copiadas en chars/; con --reupload las sube al proyecto activo (las copias de fonda-chela y fonda-chela-p2 no cuentan como DUPLICADO; también se ajustó fonda-chela/make_sheets.py para ignorar la copia de la P2). Imprime "FIN HOJAS".
- phr.py.
- edit.py: EDL en borrador por índices de frase (83 tramos), mudos con ganancia 0, BLACK 0.4 s antes de c34. Música: suspenso hasta c16, cálida de c16 a i07, suspenso hasta el final. Salida en renders/v1.mp4.

## Hojas
Ninguna nueva. CHELA_VILLEGAS, TAVO_VILLEGAS2, SAUL_BETANCOURT2, ROLANDO_GUERO2, MACARIO_LEDESMA2, LOC_FONDACHELA, LOC_CALLEFONDA (copias de pieces/fonda-chela/chars).

Nada generado en Flow todavía.

## Siguiente
1. `python -I make_sheets.py --reupload > sheets_log.txt` (proyecto Flow activo; imprime "FIN HOJAS").
2. `python -I clips.py > clips_log.txt`, con un Monitor sobre "^FIN P2", Traceback e "intento 6".
3. QA con hoja de fotogramas, franja inferior y bordes (qa_clips.md). Regenerar con `python -I clips.py <ids> > clips_log2.txt`.
4. `python -I phr.py`, pasar la EDL a rangos (renders/phr.json) y correr `python -I edit.py`.
5. Verificar sincronía en 5 puntos, ritmo de 2 s o menos de media, LUFS y pico, y la marca VISTA STORIES visible (arriba al centro).
6. Telegram con caption.txt (3er arg = VISTA).

## Revisar en el QA
- Saúl: si un clip sale en el intento 5 (sin hoja), compararlo cara a cara con SAUL_BETANCOURT2 y con los demás clips de Saúl (canas en las sienes, barba unida al bigote, traje gris carbón oscuro, no azul ni beige).
- El Güero: que sea el de la hoja ROLANDO_GUERO2 (rubio rapado, chivo, chamarra de piel), igual que c06/c22 de la Parte 1.
- Geografía: mesa del fondo con Saúl de pie IZQ. y Macario sentado DER.; Chela en el mostrador mira a la DER.; en la calle Tavo IZQ. y Saúl DER.
- Utilería: un solo jarro; el anillo en la mano DERECHA de Macario; el maletín cerrado hasta i08 (ahí vacío); sobres cerrados, sin billetes; tres llaves en i03; el mandil de Saúl solo desde c27/r6.
- Campanario sin reloj ni letras; reloj de pulsera sin números legibles.
- Fallos de Omni: subtítulos quemados, frases repetidas, 2.ª frase perdida, morphs, dobles en el borde.

## Montaje v1 (2026-11-08)
- QA en qa_clips.md (lv3.py large-v3 → renders/lv3.json, hojas de contacto, bordes cada 0.25 s). Todo se arregló en la edición salvo **c13** (Saúl con otra cara en el intento 5 sin hoja): regenerado con prompt nuevo; con hoja vuelve a dar "políticas" y salió de nuevo en el intento 5 sin hoja, ahora parecido (pelo, barba, traje). Viejo en clips/old/c13_v1.mp4. Un 3.er intento (diálogo suavizado) también salió sin hoja y con borde sucio (old/c13_v3.mp4): se quedó la v2. Si el usuario lo pide, la salida es quitar c13 del montaje (c12 → c14 se entiende).
- edit.py = plantilla viuda-aguacate con BRAND = "VISTA" (borrador viejo en edit_borrador.py). Crops de borde c01 c03 c06 c11 c16 c18 c23 c26 c27 c30; c27 sale antes del "atiendo primero" repetido; i06 solo el reloj (1.55–2.90); i08 maletín abierto vacío; i07 campanas reales a −6 dB.
- renders/share.mp4: 156.8 s, 81 tramos / 97 planos, 1.61 s/plano (58 cortes con scene>0.3), −14.2 LUFS, pico −1.7 dBFS, sincronía 0 ms en 5 puntos. Revisión API: renders/share_revision.md.
- caption.txt en formato Parte 2. No enviado a Telegram.
