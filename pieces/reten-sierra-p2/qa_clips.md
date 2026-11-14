# QA clips · reten-sierra-p2 (2026-11-05)

Método: hoja de 4 fotogramas por clip (8/35/62/90 %), tiras de la franja inferior a 1.5 fps en los 43 clips (para buscar subtítulos) y fotogramas de detalle en los dudosos, todo comparado con chars/ (Candelaria = CANDELARIA, Garza = GARZAVERDE, Pineda = SOLDADOFLACO, Teodoro = DONTEO, Emiliano = EMILIANO, reloj = PROP_LEONTINA). Geografía bien en todos los planos sobre el hombro y de dos personas: Candelaria a la IZQUIERDA, Garza (y Pineda en c16) a la DERECHA. Audio: faster-whisper large-v3 (es, CPU, int8) sobre WAV cargado con numpy, palabra por palabra en los dudosos, más F0 mediana por frase para el género (hombres 105–188 Hz, mujeres 186–211 Hz). c17 da 240 Hz porque grita: earshot lo confirma como "a man shouting" (z 4.1, mujer z 2.1). Todas las voces tienen el género correcto. Ningún clip congelado (freezedetect). El único corte duro es el de c23 (0.33 s).

Uniforme: Garza lleva cintas de nombre con letras inventadas ("KONY / FL AJ" en c06, "A. N.EFU" en c10, "LO.M. LMATO" en c14, "GARZA" en c17, "LIU I.C." en c19) y parches de bandera. No hay placas de policía ni letreros de POLICÍA en ningún clip.

| clip | estado | motivo |
|---|---|---|
| c01 | OK | OTS: Candelaria a la izq. con el reloj y la espalda de Garza a la der. Audio completo. |
| c02 | OK | OTS: Garza a la der. y Candelaria de espaldas a la izq. Whisper oye "Oye, ¿sus motores?" en vez de "¿Oye esos motores?", casi imperceptible. |
| c03 | menor | Llegan las pickups y Garza camina hacia cámara. Sin armas. Whisper alucina "Gracias por ver el video" sobre el ruido (4.6–6 s): silenciar. |
| c04 | menor | Audio: repite "vámonos de aquí, por favor" en 5.14–6.20 s. Cortar el clip en **5.08 s**. Imagen OK. |
| c05 | OK | Audio completo. |
| c06 | menor | Cinta de nombre legible "KONY / FL AJ" en el pecho. Hombres de fondo sin armas. Audio completo. |
| c07 | menor | Audio: tartamudea "Los muchachos, los muchachos" (3.44–4.94 s). La frase 2 debe empezar en **4.46 s**. |
| c08 | OK | Mano abierta. Audio completo. |
| c09 | OK | Levanta el reloj. Audio completo. |
| c10 | menor | Cinta "A. N.EFU". Audio completo. |
| i1 | OK | Abre la tapa del reloj. Mudo (Whisper alucina "Gracias por ver el video": silenciar). |
| c11 | OK | Audio completo. |
| r1 | OK | Mudo (Whisper alucina "¡Suscríbete!": silenciar). |
| c12 | OK | Se gira hacia la caseta. Audio completo. |
| c13 | OK | Pineda. Audio completo. |
| c14 | menor | Cinta "LO.M. LMATO" legible en plano cerrado. Audio completo. |
| c15 | REGENERAR | Pineda tiene la gorra **puesta y otra gorra en las manos** (dos gorras). Audio OK. |
| c16 | OK | Pineda se pone a la derecha de Candelaria. Audio completo. |
| c17 | menor | Cinta "GARZA" legible. Audio muy fuerte (−11 LUFS), grita: bajar ganancia en la mezcla. |
| c18 | REGENERAR | Varios hombres con **rifles** (0–3 s). Whisper alucina "¡Suscríbete!": mudo. |
| c19 | menor | Cinta "LIU I.C.". Audio completo. |
| c20 | OK | OTS: Candelaria a la izq. y Garza de espaldas a la der. Audio completo. |
| c21 | REGENERAR | Se quita los lentes (2.5–3.5 s) y **se los vuelve a poner** (desde 4.5 s), y en c23/c25 los tiene en la mano. Audio OK. |
| c22 | OK | Audio completo. |
| c23 | REGENERAR | Pasó en el intento 5 con NOREF: **otra persona** (más flaco, calvo, gorra de otro camuflaje, fondo de bosque sin retén) y **corte duro** a 0.33 s (retén vacío). El texto suavizado dice "y unos hombres se lo llevaron **lejos**", así que c24 ("¿**Al monte**?") queda sin sentido. Ver la línea nueva abajo. |
| c24 | OK | "¿Al monte?" en 0–0.86 s y la frase 2 en 3.9 s (pausa larga entre frases, el montaje por frases la quita). |
| c25 | OK | Lentes en la mano (bien). Audio completo. |
| c26 | OK | Whisper oye "quita" en vez de "quite", casi imperceptible. |
| c27 | OK | Mueve la valla. La frase empieza en 3.2 s. |
| c28 | REGENERAR | En vez de quitarse la gorra, se toca la visera y aparece **una segunda gorra en la mano** con la primera puesta. Audio OK. |
| c29 | menor | OTS bien (Garza a la der.). Audio: "Teodoro, Teodoro iba con su esposo". La frase 2 debe empezar en **5.50 s**. Garza otra vez con lentes puestos (continuidad, pasa). |
| r2 | menor | Candelaria se gira hacia Teodoro, que está al fondo. Hay un sonido "¡Ah! ¡Ah!" en 2.7–4.9 s: silenciar. |
| c30 | menor | Garza se va y pasan la troca roja y los camiones de ganado. Una voz dice "¡Claro!" en 0–0.52 s: silenciar (el EDL ya usa 0.5–3.0). |
| c31 | OK | Audio completo. |
| c32 | OK | Reloj en la mano. Audio completo. |
| c33 | OK | Audio completo (Whisper oye "Y lo que dijo" en vez de "¿Y lo que dijo"). |
| c34 | OK | Cierra el reloj (se ve claro, pasa). Audio completo. |
| c35 | OK | Fogata. Audio completo. |
| c36 | REGENERAR | **Subtítulos quemados** en pantalla ("Sí, patrona. Yo iba con él." y "Y le prometí que nunca se lo iba a contar.") desde los 3 s. Además lleva el **sombrero puesto y otro en el pecho**. |
| c37 | OK | Audio completo. |
| c38 | REGENERAR | Teodoro con el **sombrero puesto y otro sombrero en el pecho**. Audio completo. |
| r3 | menor | Ojos abiertos y mano al reloj. Hay un "¡Ah!" en 2.06–3.46 s: silenciar o dejarlo bajo como respiración de susto. |
| c39 | OK | CTA con gestos, reloj en la mano. Audio completo. |

## c23: cómo queda la historia
El texto que pasó la política ("se lo llevaron lejos") rompe la pregunta de c24 ("¿Al monte?"). La línea nueva en lines.json (y en guion.md) mantiene "monte" sin decir que se lo llevaron a la fuerza:
"Ese nombre no se lo puedo decir, señora." / "Su esposo no quiso pagar **la cuota**." / "Y esa tarde **se fue con unos hombres rumbo al monte**."
Sigue funcionando con c24 ("¿Al monte? ¿Y usted se quedó callado veinte años?") y con c29 y c36 ("Teodoro iba con su esposo", "Yo iba con él"). No la cambia SOFT, así que "monte" se queda aunque haya reintentos. El EDL de edit.py sigue igual (tres frases, índices 0–2).

## REGENERAR
- **c15**: dos gorras (una puesta y otra en las manos).
- **c18**: hombres con rifles.
- **c21**: se quita los lentes y se los vuelve a poner.
- **c23**: persona equivocada (pasó sin referencia), corte duro a 0.33 s y "lejos" en vez de "monte".
- **c28**: dos gorras.
- **c36**: subtítulos quemados y dos sombreros.
- **c38**: dos sombreros.

Cambios en clips.py:
- Constante **TE0**: Teodoro sin sombrero en la cabeza y con un solo sombrero en el pecho (c36, c38). Se quitó la acción "se quita el sombrero".
- Constante **GA0**: Garza sin lentes en la cara (c23, c28).
- **MEN** ahora dice "both hands empty and visible, arms relaxed at their sides, carrying nothing".
- c15 con la gorra puesta y las manos juntas, sin gorra en las manos. c28 con la gorra puesta y los lentes doblados en la mano. c21 se quita los lentes y ya no se los pone.
- GA y PI ahora dicen "plain uniform without name tapes or lettering".
- Se mantienen SAFE, SOFT, NOREF, TRIES=6 y el gatito de control.
- main(): con IDs, la versión anterior pasa a `clips/old/<id>_vN.mp4` antes de regenerar. Lo probé en seco con gen falso: mueve los archivos e imprime "FIN P2".

Para regenerar solo esos: `python -I clips.py c15 c18 c21 c23 c28 c36 c38 > clips_log2.txt`. Imprime "FIN P2" al terminar.

## Arreglos menores para el montaje
- **c04**: cortar el clip en 5.08 s (la repetición "vámonos de aquí, por favor" está en 5.14–6.20 s).
- **c07**: la frase 2 empieza en 4.46 s, después del tartamudeo "los muchachos".
- **c29**: la frase 2 empieza en 5.50 s, después del primer "Teodoro".
- **c03, i1, r1, c18, r2, c30**: silenciar el audio del clip (son alucinaciones o voces sueltas sobre el ruido). En **r3**, silenciar el "¡Ah!" o dejarlo bajo.
- **c17**: bajar unos 6 dB (está a −11 LUFS).
- c02, c06, c10, c14, c19, c26, c29 (lentes): detalles menores, se dejan.
