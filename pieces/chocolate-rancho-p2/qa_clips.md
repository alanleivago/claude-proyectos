# QA clips · chocolate-rancho-p2 (2026-11-05)

Método (el de hacienda-sangre-p2): hoja de 4 fotogramas por clip (8/35/62/90 %), tiras de la parte de abajo del cuadro (38 % inferior) a 1.5 fps en los 41 clips (para buscar subtítulos), todo comparado con chars/ (RENATA, DAMIAN, BENAVIDES, PRUDENCIO, EULALIA, PROP_TAZA, LOC_HUERTO) y con la geografía fija de clips.py. freezedetect + detección de cortes (scene > 0.3) + LUFS por clip. Audio: faster-whisper large-v3 (es, CPU, int8) sobre WAV cargado con numpy, palabra por palabra, más F0 mediana por frase para el género (hombres 101–140 Hz, Prudencio 123–165 Hz en preguntas; mujeres 165–250 Hz).

**Causa raíz encontrada:** `chars/LOC_DESPACHOROBLES.jpg` NO es la oficina: es el sobre lacrado de hacienda-sangre-p2 (md5 1A2B991F… idéntico a `hacienda-sangre-p2/chars/PROP_SOBRELACRE.jpg`; el log dice "1 image(s) in 3s": Flow devolvió una imagen vieja). Con esa referencia, Omni puso **un sobre con sello de cera** sobre el escritorio en c08, c09, c11, r1 y c17. La carpeta crema con hojas (la correcta) sale bien en c04, c05, c07, i1, c10, c13, c29, c34.

Resultado general: personas correctas en los 41 clips (nadie de más, sin niños, sin armas, un solo sombrero en Prudencio, Benavides sin carpeta, sin objetos flotando ni miembros de más). Una sola taza y una sola concha en i2/c25. Geografía bien: oficina con la puerta a la izquierda y Renata a la IZQUIERDA (c04, c05, c06, c16); rancho con Prudencio/Eulalia a la IZQUIERDA y Renata/Damián a la DERECHA (c18, c19, c20). Ningún clip congelado. Todas las voces tienen el género correcto y la persona correcta.

| clip | estado | motivo |
|---|---|---|
| c01 | menor | Benavides de pie junto a la ventana, Damián sentado borroso a la der. Benavides queda más al centro-izquierda que a la derecha. Una libreta crema bajo las manos de Damián los primeros ~2 s (sale de cuadro con el push-in). Audio completo. |
| c02 | OK | Audio completo. |
| c03 | menor | Benavides **sentado** a la mesa (no de pie junto a la ventana). Pasa. Audio completo. |
| c04 | menor | Puerta a la izq., Renata entra con la carpeta; Damián ya está de pie (no se levanta). Mudo (Whisper alucina "¡Vamos!": silenciar). |
| c05 | OK | OTS, Damián de espaldas a la der. Audio completo. |
| c06 | OK | OTS, Renata de espaldas a la izq. Audio completo. |
| c07 | OK | Carpeta en el regazo. Audio completo. |
| i1 | OK | Deja la carpeta y la abre: hojas con lista ilegible. Mudo (alucina "¡Vamos a ver!": silenciar). |
| c08 | REGENERAR | **Sobre lacrado** dentro de la carpeta abierta (0–2.7 s). Audio completo. |
| c09 | REGENERAR | **Sobre lacrado** encima de la carpeta durante todo el clip. Audio completo. |
| c10 | menor | Carpeta con hojas, bien. Audio completo pero fuerte (−15.2 LUFS): bajar ~4 dB. |
| c11 | REGENERAR | **Sobre lacrado** en el escritorio (0–4.7 s). Además pasó en el intento 2 con SOFT: dice "podía **guardarla**" (guion: "romperla"). |
| c12 | OK | Audio completo. |
| r1 | REGENERAR | **Sobre lacrado** en el escritorio (0–2.7 s). Mudo (alucina "Gracias por ver el video"). |
| c13 | OK | Carpeta con hojas. Audio completo. |
| c14 | OK | Se levanta. Audio completo. |
| c15 | OK | Audio completo. |
| c16 | OK | OTS, Renata de espaldas a la izq. Pausa de 2 s entre frases (2.98–5.08), el montaje por frases la quita. |
| c17 | REGENERAR | **Sobre lacrado** en el escritorio (0–4 s). Audio completo. |
| c18 | OK | OTS, Prudencio a la izq. (un sombrero), Renata de espaldas a la der. Audio completo. |
| c19 | OK | Renata con las manos juntas, Damián detrás, Prudencio de espaldas a la izq. Audio completo. |
| c20 | OK | Eulalia brazos cruzados, Prudencio a su lado. Audio completo. |
| c21 | OK | Audio completo. |
| c22 | OK | Audio completo. |
| c23 | OK | Audio completo. |
| r2 | OK | Eulalia se ablanda. Mudo (alucina: silenciar). |
| c24 | OK | Saca la silla y la ofrece. Audio completo. |
| i2 | menor | Una taza y una concha, bien. **Corte duro en 3.1 s** (plano general → primer plano de la taza): usar 0–3.1 o 3.1–6.0, no ambos pegados. Sin voz, solo ruidos de loza (Whisper alucina "¡Suscríbete al canal!"): silenciar o dejar bajo. |
| c25 | REGENERAR | **Subtítulos quemados** ("Doña Eulalia, yo le tiré una taza como esta a Damián." 1.3–4.7 s y "Y usted me sirve una a mí." 5.3–7.3 s). Taza y concha bien. Audio completo. |
| c26 | OK | Audio completo. |
| c27 | menor | Dice "Ya **ves**, Renata" (guion: "¿Ya ve, Renata?"). Se entiende, pasa. |
| c28 | OK | Audio completo. |
| c29 | OK | Abre la carpeta y lee. "Esperanza Robles" bien. |
| r3 | OK | Se le borra la sonrisa, ojos abiertos. Mudo (alucina: silenciar). |
| c30 | OK | Audio completo. |
| c31 | OK | "Esperanza Robles" bien. Audio completo. |
| c32 | OK | Manos en el pecho. Audio completo. |
| c33 | OK | Audio completo. |
| c34 | REGENERAR | **Repite** el final: "…yo no sabía que era su madre, **que era su madre**" (6.2–7.0 s) sin pausa limpia para cortar (no hay silencio entre "madre," y "que"). Además está de pie junto a la mesa, no sentada. |
| r4 | OK | Mira el camino al atardecer. Mudo (alucina: silenciar). |
| c35 | OK | CTA a cámara con gestos. Audio completo. |

## REGENERAR
- **c08, c09, c11, r1, c17**: sobre lacrado en el escritorio (por la hoja LOC_DESPACHOROBLES equivocada).
- **c25**: subtítulos quemados en las dos frases.
- **c34**: repite "que era su madre" sin pausa para cortar.

Cambios en clips.py:
- **OFI** ya no usa `@{LOC_DESPACHOROBLES}`: la oficina va descrita en texto ("bright modern executive office…, brown leather chairs…") y con "no envelopes and no wax seals anywhere". Ningún clip referencia ya esa hoja.
- Constante **OPEN** ("the open cream folder on the desk, holding only a few loose typed sheets of paper, no envelope") en c08 y c09; en c11, r1 y c17 "nothing on the desk in front of him/her".
- Constante **NOSUB** (la de hacienda-sangre-p2) que `talk()` agrega al final de cada clip con diálogo; queda también en el intento 6 (prompt mínimo).
- c34: sentada en su silla y "after the last word she stays silent until the end of the shot".
- Se mantienen SAFE, SOFT, NOREF, STYLES, TRIES=6, los 17 s entre clips y el gatito de control.
- Probado en seco en una copia con gen falso: con IDs, la versión anterior pasa a `clips/old/<id>_vN.mp4` (sin pisar las que ya hay), el resto de los clips no se toca, e imprime "FIN P2".

Para regenerar solo esos: `python -I clips.py c08 c09 c11 r1 c17 c25 c34 > clips_log2.txt`. Imprime "FIN P2" al terminar.

Pendiente aparte (cuando Flow esté libre): el asset "LOC_DESPACHOROBLES" del proyecto Flow es el sobre. Si se quiere la hoja de la oficina, borrar `chars/LOC_DESPACHOROBLES.jpg`, volver a correr make_sheets.py y comprobar el md5 antes de usarla.

## Arreglos menores para el montaje
- **c04, i1, r2, r3, r4** (y r1 si se queda): silenciar el audio del clip (solo hay alucinaciones de Whisper sobre el ruido). **i2**: silenciar o dejar los ruidos de loza bajos.
- **i2**: corte duro en 3.1 s; usar un solo tramo (0–3.1 general o 3.1–6.0 taza y concha).
- **c10**: bajar ~4 dB (−15.2 LUFS; el resto anda entre −16 y −24).
- c01 (libreta y Benavides al centro), c03 (Benavides sentado), c04 (Damián ya de pie), c27 ("Ya ves"): detalles menores, se dejan.

## QA de los 7 regenerados (2026-11-05, mismo método; versiones viejas en clips/old/)
| clip | estado | motivo |
|---|---|---|
| c08 | OK | Carpeta abierta con hojas sueltas, sin sobre. Oficina con ventanal y ciudad. "¿Qué es esta lista, Renata?" completo. |
| c09 | OK | Carpeta con hojas, sin sobre. Las dos frases completas. |
| c11 | OK | Escritorio vacío, sin sobre. Dice "podía **romperla**" (guion). |
| r1 | OK | Sin sobre, sonríe al final. Mudo (whisper solo oye "SILENCIO"): silenciar. |
| c17 | menor | Sin sobre. Repite "ni ver, **ni ver**" (6.26–6.68) con un valle de voz en 6.31–6.36: el montaje corta en 6.33. |
| c25 | OK | Sin subtítulos (tiras a 1.5 fps limpias). Una taza y una concha. Las dos frases completas. |
| c34 | OK | Sentada, cierra y abraza la carpeta; "Créame, yo no sabía que era su madre." sin repetir. |
Oficina: misma ciudad tras el ventanal y sillas de cuero café que c03/c05/c10/c13; en c08/c09/c17/r1 se ven más sillas de sala de juntas detrás (pasa).
