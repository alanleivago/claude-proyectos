# QA clips · regreso-20 Parte 1 (2026-11-05)

Método (el de canasta-p2): hoja de 4 fotogramas por clip (8/35/62/90 %), tiras de la parte de abajo del cuadro (38 % inferior) a 1.5 fps en los 37 clips (para buscar subtítulos), todo comparado con chars/ (CLEMENCIA, LEONOR, JOAQUIN, BERNARDO, LOC_ADOBE, LOC_TEJABAN) y con la geografía fija de clips.py. freezedetect + detección de cortes (scene > 0.3) + LUFS por clip. Bordes dudosos revisados con tiras a 2 fps. Audio: faster-whisper large-v3 (es, CPU, int8) sobre WAV cargado con numpy, palabra por palabra, comparado con lines.json, más F0 mediana por clip para el género. Nada se corrió en Flow.

Resultado general: caras y ropa correctas en todos los clips (Clemencia con chongo gris, vestido verde floreado y mandil gris con encaje; Leonor con playera verde petróleo y mandil beige; Joaquín con camisa a cuadros roja y bigote; Bernardo con guayabera beige). Nadie con sombrero, sin niños, sin armas, sin dedo acusador, sin extremidades de más. Un solo retrato sepia y estable (no cambia dentro de ningún clip), una sola carpeta (i1, c13), una sola maleta (c23, r4). Geografía bien. Ningún clip congelado; solo r4 tiene un corte interno (1.46 s). Subtítulos quemados solo en **c25**. Voces: hombres 100–131 Hz (Joaquín, Bernardo), mujeres 182–232 Hz (Clemencia, Leonor), cada una con su personaje.

| clip | estado | motivo |
|---|---|---|
| c01 | OK | Retrato a la izq. Audio completo. Fuerte (−16.6 LUFS). |
| r1 | OK | Joaquín callado. Mudo (alucina "Gracias por ver el video": silenciar). |
| c02 | OK | Audio completo, bajo (−22.3). |
| c03 | OK | Brazos cruzados. Audio completo. |
| c04 | OK | Mano en el pecho. Audio completo. |
| c05 | menor | Al final (~5.3 s en adelante) asoma una orilla oscura en el borde derecho. La voz termina en 5.2 s: cortar ahí. |
| c06 | **REGENERAR** | Un segundo hombre con camisa a cuadros (doble de Joaquín) en el borde derecho los primeros ~2 s; la voz arranca en 0.0 s, no se puede recortar. |
| c07 | OK | Audio completo (voz desde 1.3 s). |
| c08 | OK | Manos abiertas. Audio completo. |
| c09 | OK | Manos juntas. Audio completo. |
| c10 | OK | Un poco de pelo de alguien en el borde derecho (lado de Leonor), sin cambiar de forma. Audio completo. |
| c11 | OK | Audio completo. |
| c12 | OK | Se voltea al final. Dice "Así lo decidí" en vez de "Te guste o no" (salió con SOFT); lines.json ya actualizado. |
| r2 | OK | Mira el retrato. Mudo (alucina: silenciar). |
| i1 | OK | Una carpeta café, hojas ilegibles, sin sobre ni sello. Mudo (alucina: silenciar). |
| c13 | OK | Carpeta bajo la mano. Audio completo. |
| c14 | **REGENERAR** | Falta la 2ª frase ("Mi difunto Julián cuidó estas tierras…"): la voz acaba en 3.6 s y el resto es silencio. |
| c15 | OK | Audio completo. |
| c16 | OK | Audio completo, bajo (−21.7). |
| c17 | OK | Mano abierta. Audio completo. |
| r3 | OK | Mueve los labios sin voz: usar solo el tramo de edit.py (1.0–2.4 s). Mudo (alucina: silenciar). |
| c18 | OK | Orilla clara en el borde derecho el primer segundo (lado de Bernardo). Audio completo. |
| c19 | OK | Audio completo (voz desde 1.1 s), bajo (−23.0). |
| c20 | OK | La cámara gira despacio y el fondo cambia de lado, continuo. Audio completo. |
| c21 | **REGENERAR** | Una mujer de pelo oscuro y blusa blanca floreada (no es Leonor ni Clemencia) en el borde derecho los primeros ~1.5 s; la voz arranca en 0.0 s. |
| c22 | **REGENERAR** | Falta la 2ª frase ("Don Bernardo apenas conoce a Leonor…"): la voz acaba en 4.1 s y el resto es silencio. Además hay alguien en el borde derecho al inicio. |
| c23 | OK | Una maleta. Audio completo ("solterona amargada" bien). |
| c24 | OK | Audio completo. |
| c25 | **REGENERAR** | **Subtítulos quemados** "Ojalá encuentres esa felicidad que tanto buscabas." (~2.7–5.3 s). |
| c26 | **REGENERAR** | Arranca con el portal vacío y una mano en el borde izq.; Clemencia **entra a cuadro** por la derecha. |
| r4 | menor | Primeros 1.46 s: portal vacío, y luego corte a los dos de espaldas por el camino con la maleta (bien). Usar desde 1.6 s. Mudo (alucina: silenciar). |
| c27 | **REGENERAR** | Una mujer con blusa blanca floreada (no es Leonor) en el borde izq. y otra en el borde der.: personas equivocadas. |
| c28 | **REGENERAR** | Repite una palabra: "me dejaría aquí, aquí sola" (5.6–6.3 s). |
| c29 | OK | Audio completo. |
| r5 | OK | Bernardo solo, retrato estable. Mudo (alucina "receta de pan": silenciar). |
| c30 | OK | Retrato estable; mira a cámara más que al retrato. Audio completo, "Julián" bien. |
| c31 | OK | CTA a cámara desde el primer segundo, se acomoda el pelo, sonríe; portal vacío. Audio completo. |

## REGENERAR
- **c06**: doble de Joaquín (otro hombre a cuadros) en el borde derecho.
- **c14**: le falta la 2ª frase.
- **c21**: mujer equivocada (blusa blanca) en el borde derecho.
- **c22**: le falta la 2ª frase (y alguien en el borde).
- **c25**: subtítulos quemados.
- **c26**: Clemencia entra a cuadro, portal vacío al inicio y mano en el borde.
- **c27**: dos mujeres equivocadas en los bordes.
- **c28**: repite "aquí".

Cambios en clips.py: nuevas constantes `ALONE` ("the only person in the whole shot, already in place from the very first frame, never walking in; no second person, no hands or arms entering from the edges…") y `CLEAN` ("The bottom of the frame stays clean the whole time: no subtitles, no captions, no words."). c06 añade ALONE + "no other man in a plaid shirt anywhere". c21 añade ALONE + "no woman beside him". c25 añade ALONE y CLEAN antes y después del diálogo. c26 añade "standing still… framed from the first frame and speaking from the first second" + ALONE. c27 añade ALONE + "no women in the shot, only the wooden fence and trees beside him". c14 y c22 añaden ALONE + "She keeps talking until the end of the clip and says both sentences completely." c28 añade "She says every word only once, without repeating any word." Se mantienen STYLE, VOICE, NOSUB, SOLO, SAFE, SOFT, NOREF, STYLES, TRIES=6, los 17 s entre clips y el gatito de control.

Probado en seco en una copia con gen falso: con IDs, la versión anterior pasa a `clips/old/<id>_vN.mp4` (sin pisar las que ya hay), el resto no se toca, e imprime "FIN P1".

Para regenerar (cuando Flow esté libre): `python -I clips.py c06 c14 c21 c22 c25 c26 c27 c28 > clips_log2.txt`. Revisar después: nadie en los bordes, nadie entrando a cuadro, sin subtítulos, c14/c22 con las dos frases y c28 sin repetir palabras.

## Arreglos menores para el montaje
- **r1, r2, r3, r4, r5, i1**: silenciar el audio del clip (solo alucinaciones de Whisper sobre ruido, −39 a −53 LUFS).
- **r4**: en edit.py el rango (0.8, 3.0) cae en el portal vacío y en el corte de 1.46 s: usar (1.6, 3.8).
- **c05**: cortar al terminar la voz (~5.3 s) por la orilla oscura en el borde derecho.
- **c12**: la 2ª frase es "Así lo decidí." (lines.json ya corregido para phr.py).
- Volumen: c01 (−16.6) fuerte; c19 (−23.0), c09 (−22.4), c02 y c05 (−22.3) bajos. El loudnorm en dos pasadas de edit.py los empareja.
- Arranques tardíos de voz (c07 1.3 s, c19 1.1 s, c11 0.9 s): el montaje por frases (phr.py) los recorta.

## QA v2 (2026-11-05, clips regenerados; viejos en clips/old/*_v1.mp4)
Mismo método (hojas 2 fps, tiras del 38 % inferior a 1.5 fps, tiras de bordes a 4 fps, faster-whisper large-v3 palabra por palabra). Sin subtítulos en ninguno de los 8.

| clip | estado | motivo |
|---|---|---|
| c06 | **REGENERAR** | Perfil de otra persona (oreja/pelo, ropa azul estampada) en el borde DERECHO de 0.25 a 1.5 s; la voz va de 0.0 a 1.6 s. Plan B si vuelve a fallar: frase 1 con punch-in 1.25x (crop izq. 80 %), frase 2 (2.66–5.06) limpia. |
| c14 | **REGENERAR (partido)** | Otra vez solo la 1ª frase (1.36–3.44 s); salió en el intento 6, que por diseño deja una sola línea. Se queda como c14 (1 frase) y la 2ª va en el clip nuevo **c14b**. |
| c21 | OK | "Mira nomás, hermanita, hasta te salió bien el asunto." (0.0–4.2). |
| c22 | OK | Las dos frases completas (0.56–7.36); la 2ª sale como pregunta ("¿Don Bernardo… facilidades?"), lines.json ajustado. Sin nadie en los bordes. Intento 5 (sin hoja de Clemencia), cara correcta. |
| c25 | OK | Sin subtítulos. Audio completo (0.0–5.52). |
| c26 | OK | En cuadro desde el frame 0, sin entrar. "Tú acomódate bien aquí con don Bernardo. Adiós, Leonor." (0.0–4.34). Intento 5, cara correcta. |
| c27 | **REGENERAR** | Mujer de pelo oscuro y blusa blanca de espaldas en primer plano a la IZQ. de 0.0 a ~1.75 s (plano por encima del hombro); la 1ª frase va de 0.0 a 1.3 s. |
| c28 | OK | Sin repetir: "…me dejaría aquí sola." (1.16–6.28). |

Cambios en clips.py: constante `ONE` (plano de una sola persona, NO por encima del hombro, sin nuca/hombro/oreja de nadie) y `gaze(side)` (mira a un lado de cámara sin nombrar al otro personaje) en c06 y c27; clip nuevo **c14b** (6 s, solo "Mi difunto Julián cuidó estas tierras con mucho cariño."). lines.json: c14 = 1ª frase, c14b = 2ª, c22 2ª frase como pregunta. edit.py (borrador): ("c14", 0), ("c14b", 0) y r4 (1.6, 3.8).

Regenerar (cuando Flow esté libre): `python -I clips.py c06 c14b c27 > clips_log3.txt` (c14 NO va: el actual sirve para la 1ª frase).

## QA v3 + montaje v1 (2026-11-05)
c06 (voz 0.68–5.24), c14b ("Mi difunto Julián cuidó estas tierras con mucho cariño.", intento 6) y c27 (voz 0.54–4.84): OK, nadie en los bordes ni en primer plano, sin subtítulos; no hizo falta ningún plan B.
renders/v1.mp4: 154.5 s, 79 planos (media 1.97 s), -14.1 LUFS, -1.7 dBTP, LRA 3.1. Transcripción large-v3 = lines.json palabra por palabra (452/452, en orden). Sincronía: 0 fotogramas / -5 ms en 5 puntos, deriva A/V acumulada 0 ms.
