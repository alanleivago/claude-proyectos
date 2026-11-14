# QA clips · medalla-mezcal-p2 (2026-11-05)

Método: hoja de 4 fotogramas por clip (8/35/62/90 %) más fotogramas de detalle en los dudosos, comparados con chars/ (Fausto = ARREOLA, Severo = SEVERO, Marisol = HEROINA, Nicanor = CAPORAL, Tobías = TOBIAS, PROP_MEDALLA, PROP_ANILLO). Audio: faster-whisper large-v3 (es, CPU) sobre WAV cargado con numpy, y F0 mediana por clip para el género de la voz (hombres 99–152 Hz, mujeres 203–246 Hz, todos correctos). Ningún clip congelado ni con cortes salvo c31 (corte duro a 6.46 s, entre frases). Los bultos negros en la cadera de Severo son walkie-talkies con antena, no armas.

| clip | estado | motivo |
|---|---|---|
| c01 | REGENERAR | Audio: "y hoy vienes por su hija" **dos veces** (4.2–5.8 s y 6.7–7.5 s). Imagen OK (Severo de espaldas con chaleco negro y camisa de mezclilla). |
| c02 | OK | Fausto de espaldas en el borde izq. (sombrero de palma, guayabera, canas). Audio completo ("Arreola" suena "a reola"). |
| c03 | OK | Audio completo. |
| c04 | menor | La medalla de Severo se ve entera (debería ser media). Pequeña, se puede dejar. Audio completo. |
| r1 | OK | Mudo. |
| c05 | menor | Marisol lleva paliacate amarillo en las **dos** muñecas (la hoja: solo la izq.). Medalla en la mano derecha (bien). Audio completo. |
| c06 | OK | Audio completo. |
| c07 | OK | Dúo Fausto/Marisol, voces correctas. Audio completo. |
| c08 | OK | Audio completo. |
| c09 | OK | Levanta la media medalla con la mano derecha. Audio completo. |
| i1 | OK | Media medalla con borde roto visible. Mudo. |
| c10 | OK | Audio completo. |
| c11 | OK | Audio completo. |
| c12 | menor | Paliacate en las dos muñecas. Media medalla en la palma derecha (bien). Audio completo. |
| c13 | OK | Audio completo. |
| c14 | menor | Nicanor lleva **dos** walkie-talkies (uno a cada lado del cinturón). Audio completo. |
| c15 | REGENERAR | Los hombres de negro llevan **rifles** (0.5–6 s) y están mezclados con los pobladores. |
| c16 | REGENERAR | Borde der.: sombrero de palma y hombro de guayabera blanca sin cabeza visible durante todo el clip (otra persona/doble de Fausto, no Severo). Audio OK. |
| c17 | OK | Se quita la cadena; la medalla queda abajo del cuadro al final. Audio completo. |
| i2 | REGENERAR | Marisol ya tiene una medalla **entera** en la palma y Severo pone otra encima: no se ven dos mitades que encajan. Whisper oye ruido como "Suscríbete" (silenciar). |
| c18 | OK | Medalla completa en la mano derecha. Audio completo. |
| c19 | OK | Audio completo ("Arreola" suena "riola"). |
| r2 | REGENERAR | Severo **sigue con la cadena y la medalla** en el pecho después de entregarla (i2). |
| c20 | REGENERAR | Marisol sostiene una **medalla militar con listón rojo, blanco y azul**, no la de San Judas. Audio OK. |
| c21 | menor | Severo aún lleva la medalla (pequeña, en plano medio); Tobías con los lentes puestos. Audio completo, dos voces masculinas. |
| c22 | OK | Audio completo. |
| c23 | OK | Audio completo. |
| c24 | REGENERAR | Tobías con **dos sombreros**: uno puesto y otro en las manos. Audio OK. |
| c25 | REGENERAR | Severo con la medalla grande y visible en el pecho (ya la entregó). Audio OK. |
| c26 | menor | 0–2.2 s con **marco negro y esquinas redondeadas** (~10 px). La primera frase empieza a 1.26 s: hacer zoom 108 % a todo el clip. Audio completo. |
| c27 | menor | Severo aún con la medalla (pequeña). Whisper alucina "¡Vamos!" sobre ruido: silenciar el audio del clip. |
| c28 | OK | Sin cadena (bien). Audio completo. |
| c29 | OK | Audio completo. |
| c30 | menor | Una voz dice "¡Vamos a ver!" en 5.1–5.6 s: silenciar el audio del clip. Imagen OK (Severo sin medalla). |
| c31 | menor | Corte duro a 6.46 s (plano más cerrado), entre las dos frases: se puede usar como corte o partir el clip ahí. Audio completo. |
| c32 | REGENERAR | Marisol tiene en la palma una **medalla militar con listón tricolor**. Audio OK. |
| c33 | menor | Whisper oye "Bienvenida **a** Marisol" (debería ser "Bienvenida, Marisol"); casi imperceptible. Borde der. claro y borroso (su hombro), sin problema. |
| c34 | menor | Nicanor sin gorra se ve con pelo más largo y oscuro que en la hoja; pasa. Audio completo. |
| c35 | REGENERAR | Tobías con **dos sombreros** (puesto y en las manos). Audio OK. |
| c36 | OK | Medalla completa colgada al cuello. Audio completo. |
| c37 | OK | Audio completo. |
| c38 | OK | Mano derecha a la medalla. Audio completo. |
| c39 | menor | El paliacate cambia de muñeca dentro del clip (izq. al principio, der. al final). CTA con gestos. Audio completo. |

Los clips mudos (r1, i1, c15, c27) solo traen ruido de fondo; Whisper alucina palabras sueltas ("¡Vamos!").

## REGENERAR
- **c01**: frase repetida "y hoy vienes por su hija".
- **c15**: hombres con rifles.
- **c16**: persona equivocada (sombrero y guayabera sin cabeza) en el borde der.
- **i2**: no se juntan dos mitades; una medalla entera encima de otra.
- **r2**: Severo con la medalla después de entregarla.
- **c20**: medalla militar con listón.
- **c24**: dos sombreros.
- **c25**: Severo con la medalla después de entregarla.
- **c32**: medalla militar con listón.
- **c35**: dos sombreros (ahora va con el sombrero puesto, igual que c37).

Prompts corregidos en clips.py (nuevas constantes SE0 = Severo sin cadena, TOH = Tobías sin sombrero en la cabeza, CMED = medalla completa de plata sin listón; MEN sin nada en las manos). Para regenerar solo esos: `python -I clips.py c01 c15 c16 i2 r2 c20 c24 c25 c32 c35 > clips_log2.txt` (las versiones viejas pasan a clips/old/). Imprime "FIN P2" al terminar.

## Arreglos menores para el montaje
- **c26**: zoom 108 % (escala + recorte centrado) en todo el clip para tapar el marco de 0–2.2 s.
- **c27, c30**: silenciar el audio del clip. También i2 nuevo si trae ruido.
- **c31**: corte duro a 6.46 s; usar como corte entre las dos frases.
- c04, c05, c12, c14, c21, c33, c34, c39: detalles menores, se dejan.
