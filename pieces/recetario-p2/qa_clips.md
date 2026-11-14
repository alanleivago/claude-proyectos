# QA clips · recetario Parte 2 (MEXI STORIES, 2026-11-06)

Método (el de fierro-herradura): hoja de 4 fotogramas por clip (8/35/62/90 %) comparada con chars/ (MIREYA, CHENCHO, HORTENSIA, SAMANTA, LEOPOLDO, LOC_ALACENA, LOC_OFICINA, LOC_CAFETERIA, LOC_OBRADOR, PROP_RECETARIO) y con la geografía fija de clips.py. Tiras del 38 % inferior a 1.5 fps (subtítulos), tiras de cuadro completo a 4 fps (bordes, entradas, congelado) en los 31 clips, tiras del 30 % del borde dudoso a 4 fps para medir cuánto dura cada figura, fotogramas a resolución completa de lo dudoso y los recortes probados en el peor fotograma. freezedetect + cortes (scene > 0.3) + LUFS por clip. Audio: faster-whisper large-v3 (es, CPU, int8) sobre el WAV cargado con numpy, palabra por palabra contra lines.json, F0 mediana por clip; los tramos dudosos (c01, c20) repasados con large-v3, medium y small. Nada se corrió en Flow.

Resultado general: caras y ropa correctas en todos (Mireya: vestido lila de flores blancas y tirantes, aretes de aro, sin filipina en el obrador. Samanta: traje gris claro y blusa blanca. Hortensia: bata azul de flores, chongo gris, cadena. Chencho: playera verde menta con manchas, barba. Leopoldo: camisa lavanda de rayas, barba y bigote, reloj). Geografía respetada (izq./der. y miradas según clips.py). Sin niños, armas, uniformes ni extremidades de más; nadie señala con el dedo (manos abiertas). Utilería: una sola libreta café y en una sola mano en c17 y c22 (Leopoldo), c23 y c26 (Mireya); en c26 la libreta abierta trae garabatos ilegibles (nada se lee). Una sola hoja doblada en c28, amarillenta, solo marcas tenues ilegibles. Un solo vasito con cuchara en c20. Ningún clip congelado ni con cortes internos. Sin subtítulos ni texto en pantalla en ningún clip (tira inferior limpia). Voces con el género correcto: Mireya 195–225 Hz, Samanta 198–213 Hz, Hortensia 174–200 Hz, Leopoldo 113–125 Hz, Chencho 109–145 Hz.

| clip | estado | motivo |
|---|---|---|
| c01 | **REGENERAR** | Imagen bien. Audio: la 2ª frase se oye "Licenciada… **a/o** mi propia familia": el "fue" se pierde (large-v3 "o" p 0.52, medium y small "a"), y la revelación cambia de sentido. Frase 1 completa (0.72–6.44). |
| c02 | OK con recorte | Sombra oscura abajo a la IZQ. de 0.0 a ~0.25 s; voz desde 1.08: empezar en ≥ 0.5 s. Audio completo. |
| c03 | OK | Voz 1.12–7.34. Audio completo. |
| c04 | OK con recorte | Hombro oscuro de otra persona en el borde IZQ. abajo de 0.0 a ~0.6 s; voz desde 0.74: empezar en ≥ 0.75 s (limpio). Audio completo. |
| c05 | OK | Voz 0.0–3.7. Audio completo. |
| c06 | OK | Arranca junto al marco de la puerta y la cámara se acerca; no entra caminando. Voz 1.24–5.0. |
| c07 | OK | Manos abiertas (encogida de hombros). Audio completo. |
| c08 | OK con crop | Nuca de otra persona en el borde IZQ. de 0.0 a ~0.25 s; voz desde 0.0. Tramo 0.0–0.5 con `crop=640:1138:80:0` (limpio). Audio completo. |
| c09 | OK | Mano abierta saludando, no señala. Audio completo. |
| c10 | OK | Vasitos sobre la mesa de fondo (la cocina de la Parte 1). Audio completo. |
| c11 | OK | Audio completo, bajo (−24.1). |
| c12 | OK | Audio completo. |
| r1 | OK | Mudo (−49.3; Whisper alucina "SILENCIO": silenciar). |
| c13 | OK | Audio completo. |
| c14 | OK | Tazas de café en la mesa (no son vasitos). Audio completo. |
| c15 | OK | Audio completo. |
| c16 | OK | Servilleta blanca en la mesa abajo a la IZQ., no es la libreta. Audio completo. |
| c17 | OK | Una libreta cerrada contra el pecho, en su mano. Audio completo. |
| c18 | OK con crop | Nuca y hombro oscuros de otra persona en el borde IZQ. de 0.0 a ~1.5 s; voz desde 1.04. Tramo 1.04–1.75 con `crop=600:1067:120:0` (limpio en 0.0, 1.0 y 1.5), o empezar en ≥ 1.75 s si la frase se puede cortar. Audio completo. |
| c19 | OK | Audio completo. |
| c20 | OK (aviso) | Un vasito y una cuchara. Audio: **falta el "Mireya…" inicial** (silencio hasta 1.7 s, empieza en "Esto sabe…"); el resto completo y la frase se entiende sin el vocativo. Si se quiere el nombre, regenerar c20 (no lo incluyo). |
| c21 | OK | Mano en el pecho. Audio completo. |
| c22 | OK con crop | Cabeza de otra persona arriba en el borde DER. de 0.0 a ~0.5 s y manga blanca abajo a la DER. de 0.0 a ~1.75 s; voz desde 0.0. Tramo 0.0–1.94 ("Mireya, esto es suyo.") con `crop=576:1024:0:70` (limpio, cabeza entera y la libreta en cuadro). Una libreta. Audio completo. |
| c23 | OK | Una libreta contra el pecho. Audio completo. |
| c24 | OK con crop | Manga blanca de otra persona abajo a la DER. de 0.0 a ~1.25 s; voz desde 0.0. Tramo 0.0–1.5 con `crop=560:996:0:0` (limpio en 0.0 y 1.25). Manos vacías. Audio completo. |
| c25 | OK con crop | Figura de saco gris (otra persona) en el borde DER. de 0.0 a ~1.75 s, limpio desde 2.0; voz desde 0.44. Tramo 0.44–2.0 con `crop=540:960:0:100` (limpio en 0.0, 1.25 y 1.75). Audio completo. |
| c26 | OK | Libreta abierta: garabatos ilegibles, una sola. Voz 1.94–5.3 (empieza tarde). |
| c27 | OK | Audio completo. |
| c28 | OK | Una hoja doblada entre los dedos, sin letra legible. Audio completo, bajo (−23.2). |
| c29 | OK con crop | Persona con ropa de flores rojas en el borde DER. de 0.0 a ~0.75 s; voz desde 0.76. Tramo 0.76–1.0 con `crop=600:1067:0:0` (limpio), o empezar en ≥ 1.0 s si se recorta la entrada de "Con". Audio completo. |
| c30 | OK | CTA a cámara desde el primer cuadro, sola, sonríe, cabecea y gesticula con la mano abierta. Audio completo (las dos frases). |

## REGENERAR
- **c01**: el "fue" de "Licenciada… fue mi propia familia" no se oye (sale "a"/"o"); es la revelación del episodio.

Cambios:
- lines.json c01, 2ª frase: "Licenciada… fue mi propia familia." → "Licenciada, fue mi propia familia." (mismo texto, sin los puntos suspensivos que alargaban "Licenciada" y se comían el "fue").
- clips.py c01, tono: + "she says the second sentence in one breath, every word clear and complete, with no long pause inside it".
- Se mantienen STYLE, VOICE, NOSUB, END, SOLO/ONE/ALONE con gaze, NB/NONB/PAGE/CUP, SAFE, SOFT con \b, variant, NOREF, STYLES, TRIES=6, los 17 s entre clips y el gatito de control.

Probado en seco en una copia con gen falso: con el ID, la versión anterior pasa a `clips/old/c01_v1.mp4`, c02 no se toca, el prompt lleva los cambios e imprime "FIN P2".

Para regenerar (cuando Flow esté libre): `python -I clips.py c01 > clips_log2.txt`. Revisar después: "fue" audible, frase 1 completa, nadie en los bordes. Si vuelve a salir mal: usar la frase 1 de `clips/old/c01_v1.mp4` (0.72–6.44) y la mejor toma de la frase 2.

## Arreglos menores para el montaje
- **Crops** (punch-in solo mientras dura el borde; todos probados limpios en el peor fotograma): c08 `640:1138:80:0` (0.0–0.5), c18 `600:1067:120:0` (1.04–1.75), c22 `576:1024:0:70` (0.0–1.94), c24 `560:996:0:0` (0.0–1.5), c25 `540:960:0:100` (0.44–2.0), c29 `600:1067:0:0` (0.76–1.0).
- **Arranques**: c02 ≥ 0.5 s, c04 ≥ 0.75 s (o c18 ≥ 1.75 s y c29 ≥ 1.0 s en vez del crop).
- **r1**: silenciar el audio (−49.3 LUFS; Whisper alucina "SILENCIO").
- Volumen: c01 (−17.8), c04 (−17.9), c30 (−17.9) fuertes; c11 (−24.1), c28 (−23.2), c05 (−22.9), c02 (−22.8) bajos. El loudnorm de edit.py los empareja.
- Arranques tardíos de voz (c26 1.94, c20 1.7, c06 1.24, c03 1.12, c07 1.1, c02 1.08, c18 1.04 s): el montaje por frases (phr.py) los recorta.
- Avisos sin acción: c20 sin el "Mireya…" inicial; servilleta blanca en c16; vasitos de fondo en la cocina (c08, c10, r1, c29), como en la Parte 1.
- Whisper escribe "Mireia" y "Don" con mayúscula: es grafía; el audio dice lo de lines.json.
- sheets_log: la subida de PROP_RECETARIO marcó "did not finish within 60s", pero la libreta sale igual (café de cuero) en c17, c22, c23 y c26.
