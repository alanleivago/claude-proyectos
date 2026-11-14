# QA clips · hacienda-sangre-p2 (2026-11-05)

Método (el de reten-sierra-p2): hoja de 4 fotogramas por clip (8/35/62/90 %), tiras de la parte de abajo del cuadro a 1.5 fps en los 39 clips (para buscar subtítulos), todo comparado con chars/ (Octavio = OCTAVIO, Mateo = MATEO, Teresa = TERESA, Arturo = ARTURO, Nicanor = DONNICO, sobre = PROP_SOBRELACRE, San Isidro = PROP_SANISIDRO). freezedetect + detección de cortes (scene > 0.3) + LUFS por clip. Audio: faster-whisper large-v3 (es, CPU, int8) sobre WAV cargado con numpy, palabra por palabra, más F0 mediana por frase para el género (hombres 94–160 Hz, mujeres 167–211 Hz).

Resultado general: personas correctas en los 39 clips (nadie de más, sin niños, sin armas, sin dos sombreros, sin objetos flotando ni miembros de más). Geografía bien: en el porche, el porche a la IZQUIERDA y Octavio a la DERECHA (c01, c02, c05, c06, c09, c17, c18); de noche, Mateo a la IZQUIERDA y Teresa a la DERECHA (c33, c34), Arturo en la puerta a la derecha en c30. Ningún clip congelado ni con corte duro. Todas las voces tienen el género correcto y no falta ni se repite ninguna palabra. El único problema grave son **subtítulos quemados** en 3 clips.

| clip | estado | motivo |
|---|---|---|
| c01 | OK | OTS: Nicanor a la izq., espalda de Octavio a la der. Pasó en el intento 4 con SOFT: dice "Ayer usted **sacó** a Mateo por no ser su **familia**" (guion: "corrió", "sangre"). Se entiende igual. |
| c02 | menor | OTS bien (Nicanor de espaldas a la izq.). La camioneta es una pickup vieja verde oscuro, no la negra brillante (igual en c13, c15, c20, c22, c24: es consistente). Audio completo. |
| c03 | OK | Audio completo ("regrésese" bien pronunciado). |
| c04 | OK | Octavio sube al porche y toca la puerta; Nicanor no se mezcla con él. Mudo (Whisper alucina "¡Suscríbete!": silenciar). |
| c05 | OK | Mateo con la taza. Audio completo. |
| c06 | OK | Octavio con el papel, Mateo de espaldas a la izq. Audio completo (la frase 1 empieza en ~1.4 s). |
| c07 | OK | Audio completo. |
| c08 | OK | Le tiende el papel. Audio completo. |
| c09 | OK | Audio completo. |
| r1 | OK | La sonrisa se le borra. Mudo (alucina "¡Suscríbete!": silenciar). |
| c10 | OK | Manos abiertas. Audio completo. |
| c11 | OK | Devuelve el papel. Audio completo ("heredó" bien). |
| c12 | menor | Teresa llega caminando con la maleta (no aparece de golpe). Octavio está en el porche junto a Mateo y Nicanor en vez de en el patio a la derecha; pasa porque acaba de tocar la puerta. Mudo (alucina "¡Suscríbete!"). |
| c13 | OK | Audio completo. |
| c14 | REGENERAR | **Subtítulos quemados** en el pecho durante todo el clip ("No, Octavio.", "Treinta años guardé silencio en esa casa.", "Hoy ya no."). Audio OK. |
| c15 | OK | Audio completo. |
| c16 | OK | Teresa deja la maleta y queda junto a Mateo. Pausa larga entre frases (3.3–5.5 s), el montaje por frases la quita. |
| c17 | OK | OTS: Teresa de espaldas a la izq. Audio completo. |
| c18 | OK | Brazos cruzados, Octavio de espaldas a la der. Audio completo. |
| c19 | REGENERAR | **Subtítulo quemado** "Puede seguir viviendo en la casa grande." en 7.3–9.3 s, justo en la frase que c20 contesta. Audio completo. |
| c20 | OK | Audio completo. |
| c21 | OK | Audio completo. |
| r2 | menor | Octavio baja la mirada (sin pañuelo en el bolsillo, pasa). Mudo (alucina "Gracias por ver el video": silenciar). |
| c22 | OK | Audio completo ("soberbia" bien). Pausa de 1 s antes de "me cegó". |
| c23 | OK | Audio completo. |
| c24 | OK | Audio completo. |
| c25 | menor | Se toca el ala del sombrero. Audio completo pero fuerte (−13.9 LUFS): bajar ~5 dB. |
| c26 | menor | Octavio se va en la camioneta; aquí es una Ram negra moderna (distinta a la de los otros planos). Mudo (alucina "¡Suscríbete!"). |
| c27 | OK | Audio completo. |
| c28 | OK | San Isidro en las manos. Audio completo. |
| c29 | OK | Sirve café de la cafetera azul. Audio completo. |
| c30 | OK | Arturo en la puerta con el sobre. Whisper oye "Perdónenla ahora" por "Perdonen la hora" (suena igual). "Isauro" bien. |
| c31 | OK | Audio completo. |
| c32 | menor | Arturo está **sentado** a la mesa (no de pie en la puerta) cuando deja el sobre. Pasa. Audio completo. |
| i1 | menor | Los primeros **1.5 s** son un cuadro más chico con bordes negros a los lados (cambio brusco a pantalla completa en 1.5 s): empezar el clip en **1.5 s**. Mudo (alucina "¡SUSCRÍBETE!"). |
| c33 | REGENERAR | **Subtítulos quemados** ("Mamá…", "¿De verdad es él?", "¿Por qué nunca me lo contaste?"). Audio completo. |
| c34 | OK | OTS: Mateo de espaldas a la izq., Teresa a la der. Audio completo. |
| r3 | menor | Mateo gira hacia la puerta oscura. Un murmullo débil en 2.2–2.6 s (Whisper: "¿Qué pasa?"): silenciar. |
| c35 | OK | CTA con gestos y San Isidro en la mano. Audio completo. |

## REGENERAR
- **c14**: subtítulos quemados todo el clip.
- **c19**: subtítulo quemado en la última frase (7.3–9.3 s).
- **c33**: subtítulos quemados en las tres frases.

Cambios en clips.py:
- Constante **NOSUB** ("The dialogue is only heard, never written: clean picture with no subtitles, no captions and no words anywhere on screen."), que `talk()` agrega al final de cada clip con diálogo. Queda también en el intento 6 (prompt mínimo), porque va después del diálogo.
- Se mantienen SAFE, SOFT, NOREF, TRIES=6, los 17 s entre clips y el gatito de control.
- Probado en seco en una copia con gen falso: con IDs, la versión anterior pasa a `clips/old/<id>_vN.mp4` (sin pisar las que ya hay), el resto de los clips no se toca, e imprime "FIN P2".

Para regenerar solo esos: `python -I clips.py c14 c19 c33 > clips_log3.txt`. Imprime "FIN P2" al terminar.

## Arreglos menores para el montaje
- **i1**: empezar en 1.5 s (antes hay un cuadro con bordes negros).
- **c04, r1, c12, r2, c26, i1**: silenciar el audio del clip (solo hay alucinaciones de Whisper sobre el ruido). En **r3**, silenciar el murmullo de 2.2–2.6 s.
- **c25**: bajar unos 5 dB (está a −13.9 LUFS).
- c01 (texto suavizado), c02/c26 (camioneta), c12 (Octavio en el porche), c32 (Arturo sentado): detalles menores, se dejan.
