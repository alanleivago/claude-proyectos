# QA clips · canasta-p2 (2026-11-05)

Método (el de padre-veladoras-p2): hoja de 4 fotogramas por clip (8/35/62/90 %), tiras de la parte de abajo del cuadro (38 % inferior) a 1.5 fps en los 37 clips (para buscar subtítulos), todo comparado con chars/ (REFUGIO, HORACIO, MARIBEL, EUSEBIO, FEDERICO, LOC_VESTIBULO, LOC_GERENCIA, LOC_BANQUETA, LOC_SALITA) y con la geografía fija de clips.py. freezedetect + detección de cortes (scene > 0.3) + LUFS por clip. Bordes dudosos revisados con tiras a 2–4 fps. Audio: faster-whisper large-v3 (es, CPU, int8) sobre WAV cargado con numpy, palabra por palabra, más F0 mediana por clip para el género. Nada se corrió en Flow.

Resultado general: personas correctas en los 37 clips (cada uno es su hoja, nadie de más, sin niños, sin armas). Un solo paraguas en c01–c06 y r2 (Federico lo cierra al entrar), una sola canasta en todos los planos de Refugio, una sola carpeta en i1. Refugio sin gafete; gafetes de Maribel y Eusebio lisos, sin letras. Horacio siempre con las manos abiertas, sin señalar. Sin extremidades de más. Geografía bien: banqueta (Federico/Refugio IZQ., Horacio DER.), recepción (mostrador a la DER.), gerencia. Sin subtítulos ni texto en las tiras inferiores de ningún clip. Ningún clip congelado ni con cortes. Voces: hombres 100–143 Hz (Federico, Horacio, Eusebio), mujeres 178–239 Hz (Refugio, Maribel), cada una con su personaje. Todos los diálogos completos, sin palabras repetidas ni cortadas.

| clip | estado | motivo |
|---|---|---|
| c01 | OK | Federico con un paraguas, a la izq. Audio completo. |
| c02 | OK | Horacio en la puerta de vidrio. Audio completo (voz desde 2.1 s), algo bajo (−20.9 LUFS). |
| c03 | OK | Refugio bajo el paraguas, una canasta. Audio completo. |
| c04 | OK | Audio completo. |
| r1 | OK | Mudo (Whisper alucina "Gracias por ver el video": silenciar). |
| c05 | OK | Mano abierta hacia el edificio, sin señalar. Audio completo. |
| c06 | OK | Audio completo. |
| r2 | OK | Federico cierra el paraguas y entra con Refugio; los dos visibles desde el primer cuadro. Solo pasos (alucina "Gracias."): silenciar. |
| c07 | menor | Mancha rosa desenfocada en el borde izquierdo los primeros ~0.8 s. Recortar ~0.9 s (la voz arranca en 1.3 s). Audio completo. |
| c08 | OK | Audio completo. |
| c09 | OK | Maribel detrás del mostrador. Audio completo. |
| c10 | OK | Manos juntas, gafete liso. Audio completo. |
| c11 | OK | Audio completo. |
| c12 | OK | Manos abiertas, sin señalar. Audio completo. |
| c13 | OK | Audio completo. |
| c14 | OK | Audio completo. |
| c15 | OK | Audio completo. |
| c16 | OK | Audio completo, algo bajo (−21.0 LUFS). |
| r3 | OK | Mudo (alucina "¡Suscríbete!": silenciar). |
| c17 | OK | Audio completo. |
| c18 | OK | Manos abiertas y bajas. Audio completo ("15" = quince). |
| c19 | OK | Una canasta en las dos manos. Audio completo. |
| c20 | OK | Audio completo (Whisper escribe "Acompaña" por "Acompañe"). |
| c21 | OK | Eusebio ofrece el brazo hacia la izq. (sale de cuadro, sin nada flotando). Audio completo. |
| r4 | **REGENERAR** | Caminan **hacia la cámara**, alejándose de las puertas (entran en vez de salir), y desde ~4.5 s aparece arriba a la izq. un **letrero verde de salida con letras**. |
| c22 | OK | Audio completo (voz desde 2.0 s). |
| c23 | OK | Audio completo. |
| c24 | OK | Audio completo, fuerte (−13.6 LUFS). |
| c25 | OK | Mano en el pecho. Audio completo. |
| i1 | OK | Una carpeta crema, hojas con texto ilegible, sin sobre ni sello. Mudo (alucina: silenciar). |
| c26 | OK | Una hoja en la mano, ilegible. Audio completo. |
| c27 | OK | Audio completo. |
| c28 | OK | Audio completo, "Montiel" bien. |
| r5 | OK | Abraza la canasta. Mudo (alucina: silenciar). |
| c29 | OK | Audio completo, algo bajo (−21.4 LUFS). |
| r6 | OK | Hoja en la mano, quieto. Mudo (alucina: silenciar). |
| c30 | OK | CTA a cámara, habla desde el primer segundo, salita vacía, una canasta. Audio completo. |

## REGENERAR
- **r4**: dirección equivocada (caminan hacia adentro en vez de salir) y letrero verde de salida con letras al final.

Cambio en clips.py (r4): "Medium shot from behind", Eusebio y Horacio de espaldas, alejándose de la cámara hacia las puertas de vidrio a la IZQUIERDA, saliendo del edificio; "No exit signs and no signs with words anywhere on the walls or doors". Se mantienen STYLE, VOICE, NOSUB, SOLO, SAFE, SOFT, NOREF, STYLES, TRIES=6, los 17 s entre clips, el gatito de control y "Only these two characters appear… exactly once".

Probado en seco en una copia con gen falso: con IDs, la versión anterior pasa a `clips/old/r4_vN.mp4` (sin pisar las que ya hay), el resto de los clips no se toca, e imprime "FIN P2".

Para regenerar (cuando Flow esté libre): `python -I clips.py r4 > clips_log2.txt`. Revisar después que salgan de espaldas hacia las puertas y que no haya letreros con letras.

## Arreglos menores para el montaje
- **r1, r2, r3, r5, r6, i1** (y r4 nuevo): silenciar el audio del clip (solo alucinaciones de Whisper sobre ruido, −37 a −52 LUFS).
- **c07**: recortar los primeros ~0.9 s (mancha rosa en el borde izquierdo).
- Volumen: c24 (−13.6) y c03 (−14.2) fuertes, bajar ~3 dB; c02 (−20.9), c16 (−21.0) y c29 (−21.4) bajos, subir ~3 dB. El resto anda entre −14.7 y −19.5. El loudnorm en dos pasadas de edit.py los empareja igual.
- Arranques tardíos de voz (c02 2.1 s, c22 2.0 s, c24 1.8 s, c29 1.5 s): el montaje por frases (phr.py) los recorta.
