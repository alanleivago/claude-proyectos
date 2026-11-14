# QA clips · padre-veladoras-p2 (2026-11-05)

Método (el de chocolate-rancho-p2): hoja de 4 fotogramas por clip (8/35/62/90 %), tiras de la parte de abajo del cuadro (38 % inferior) a 1.5 fps en los 38 clips (para buscar subtítulos), todo comparado con chars/ (ANSELMO, RUFINOVIBORA, CHATOBANDANA, RAMIRO, MAUROESCOLTA, PROP_VELADORAS, LOC_TEMPLO, LOC_ATRIO) y con la geografía fija de clips.py. freezedetect + detección de cortes (scene > 0.3) + LUFS por clip. Bordes revisados con tiras a 1 fps de la mitad derecha del cuadro. Audio: faster-whisper large-v3 (es, CPU, int8) sobre WAV cargado con numpy, palabra por palabra, más F0 mediana por clip para el género.

**Hojas (md5):** las 9 de chars/ son idénticas a las buenas de `padre-veladoras/chars/` (Parte 1) y no coinciden con ninguna otra pieza. Las únicas otras coincidencias son las de `padre-veladoras/chars/mal/` (las hojas corridas un nombre de la Parte 1, que ya se sabía: mal/RUFINO = ANSELMO, mal/CHATO = RUFINOVIBORA, mal/LOC_PARROQUIA = CHATOBANDANA, mal/LOC_MIRADOR = LOC_TEMPLO). Revisadas a la vista: cada hoja es su personaje. Flow no devolvió ninguna imagen vieja.

**Causa raíz de la falla principal:** en los planos de Rufino con `RAM_B` en el borde DERECHO (c11, c21, c30), la cámara se corre a la izquierda, el cuerpo de Ramiro sale de cuadro y **su sombrero queda flotando** en la esquina superior derecha (desde ~3–4 s hasta el final). Los planos con `RUF_B` o `ANS_B` en el borde (c05, c12, c14, c15, c20, c25) salen bien, y c04 (RAM_B a la izquierda) también.

Resultado general: personas correctas en los 38 clips (nadie de más, sin niños, sin armas, Mauro con las manos vacías, Anselmo lampiño). Ramiro con un solo sombrero y una sola medalla de oro en todos sus planos. Rufino con una sola medalla oval de plata sin listón en todos menos c26. Un solo cerillo en c04 e i1. Geografía bien: candelero y Anselmo a la DERECHA; Ramiro a la IZQUIERDA en c04–c08 y a la DERECHA desde r1; Rufino y Chato a la IZQUIERDA. En r2 entran caminando por el pasillo central y se ven desde el primer cuadro (nadie aparece de golpe). Sin subtítulos ni texto en ningún clip. Ningún clip congelado ni con cortes. Todas las voces son masculinas (F0 100–136 Hz) y dicen el guion completo, sin palabras repetidas.

| clip | estado | motivo |
|---|---|---|
| c01 | OK | Ramiro a la izq., Mauro a la der. junto a la SUV. Audio completo. |
| c02 | OK | Audio completo (voz desde 1.3 s). |
| c03 | OK | Se acomoda el sombrero y camina a la puerta. Audio completo. |
| c04 | OK | Anselmo enciende la veladora con un cerillo, Ramiro de espaldas a la izq. Audio completo. |
| c05 | OK | Ramiro a la izq., Anselmo de espaldas a la der. Audio completo ("15" = quince). |
| c06 | OK | Audio completo. |
| c07 | OK | Audio completo ("8" = ocho). |
| c08 | OK | Audio completo. |
| r1 | OK | Ramiro junto a la banca, Anselmo detrás junto al candelero. Mudo (Whisper alucina "Gracias": silenciar). |
| c09 | menor | Mauro entra por la puerta pero detrás se ve la nave, no la plaza. Pasa. Audio completo (voz desde 1.7 s). |
| r2 | OK | Rufino y Chato caminan por el pasillo central desde el primer cuadro. Solo pasos (alucina "¡Gracias!"): silenciar o dejar bajo. |
| c10 | OK | Audio completo. |
| c11 | REGENERAR | **Sombrero flotando**: Ramiro sale de cuadro por la der. y su sombrero queda suspendido arriba a la der. (~4–8 s). Audio completo. |
| c12 | OK | Ramiro a la der., Rufino de espaldas a la izq. Audio completo. |
| c13 | OK | Audio completo. |
| c14 | OK | Anselmo a la der. con el candelero, Rufino de espaldas a la izq. Audio completo. |
| r3 | OK | Baja la mirada y asiente. Mudo (alucina: silenciar). |
| c15 | OK | Rufino a la izq., Anselmo de espaldas a la der. Audio completo pero bajo (−25.9 LUFS). |
| c16 | OK | Rosario en las manos. Audio completo. |
| c17 | OK | Audio completo, algo bajo (−24.7 LUFS). |
| c18 | OK | Audio completo. |
| c19 | OK | Mano en la banca. Audio completo. |
| r4 | OK | Mudo (alucina: silenciar). |
| c20 | OK | Ramiro a la der., Rufino de espaldas a la izq. Audio completo. |
| c21 | REGENERAR | **Sombrero flotando** arriba a la der. (~4–10 s), igual que c11. Audio completo. |
| c22 | menor | Una mancha blanca en el borde izquierdo los primeros ~0.7 s (borde de un mantel). Recortar el inicio. Audio completo. |
| c23 | menor | Audio completo pero fuerte (−15.1 LUFS): bajar ~4 dB. |
| c24 | OK | Audio completo. |
| i1 | OK | Un cerillo, la medalla oval de plata sin listón. Mudo (alucina "¡Suscríbete!": silenciar). |
| r5 | OK | Mudo (alucina: silenciar). |
| c25 | OK | Ramiro a la der. con un sombrero, Rufino de espaldas a la izq. Audio completo. |
| c26 | REGENERAR | **Medalla duplicada**: Rufino lleva **dos cadenas de plata**; tira de una segunda cadena larga mientras la medalla oval sigue colgando de la primera (todo el clip). Audio completo. |
| c27 | OK | Una sola medalla de oro, la toca. Audio completo (Whisper escribe "mandé a ser" = "mandé hacer"). |
| c28 | OK | Audio completo. |
| c29 | OK | Audio completo. |
| c30 | REGENERAR | **Sombrero flotando** arriba a la der. (~3–10 s), igual que c11. Audio completo, "Efraín" bien. |
| r6 | OK | Mano en la medalla de oro, sin moverse. Mudo (alucina: silenciar). |
| c31 | OK | CTA a cámara: asiente, se acomoda los lentes, gesto con el rosario. Iglesia vacía. Audio completo. |

## REGENERAR
- **c11, c21, c30**: sombrero de Ramiro flotando en el borde derecho cuando su cuerpo sale de cuadro.
- **c26**: segunda cadena de plata (medalla duplicada).

Cambios en clips.py:
- Constante **RUF_SOLO** ("nobody in the foreground, he looks at Ramiro off-screen to the RIGHT"): c11, c21 y c30 pasan de "Over-the-shoulder close-up" con `{RAM_B}` a "Close-up" de Rufino a la IZQUIERDA mirando a Ramiro fuera de cuadro a la derecha. La geografía se mantiene (Rufino a la izq., mira a la der.).
- **MEDAL** ahora dice "on his only thin silver chain (no ribbon, no second medal, no second chain)". c26: "he lifts {MEDAL} a little… he wears only that one chain". El cambio también llega a c30 (y a i1 si algún día se regenera).
- Se mantienen STYLE, VOICE, NOSUB, SAFE, SOFT, NOREF, STYLES, TRIES=6, los 17 s entre clips y el gatito de control.
- Probado en seco en una copia con gen falso: con IDs, la versión anterior pasa a `clips/old/<id>_vN.mp4` (sin pisar las que ya hay), el resto de los clips no se toca, e imprime "FIN P2".

Para regenerar solo esos (cuando Flow esté libre): `python -I clips.py c11 c21 c26 c30 > clips_log2.txt`. Imprime "FIN P2" al terminar. Revisar después el borde derecho de c11/c21/c30 y las cadenas de c26.

## Arreglos menores para el montaje
- **i1, r1, r3, r4, r5, r6**: silenciar el audio del clip (solo hay alucinaciones de Whisper sobre el ruido, −48 a −57 LUFS). **r2**: silenciar o dejar los pasos bajos (−42.7 LUFS).
- **c22**: recortar los primeros ~0.7 s (mancha blanca en el borde izquierdo).
- **c23**: bajar ~4 dB (−15.1 LUFS). **c15** (−25.9) y **c17** (−24.7): subir ~3 dB. El resto anda entre −16.7 y −24.3.
- Arranques tardíos de voz (c02 1.3 s, c09 1.7 s, c14 1.7 s, c15 1.7 s, c28 1.3 s, c26 1.3 s): el montaje por frases (phr.py) los recorta.
- c09 (nave detrás de Mauro en vez de la plaza): detalle menor, se deja.

## QA regeneración v2 (c11, c21, c26, c30) · 2026-11-05
Mismo método (hoja 8/35/62/90 %, tiras del 38 % inferior a 1.5 fps, faster-whisper large-v3 CPU int8 sobre WAV con numpy).
| clip | estado | motivo |
|---|---|---|
| c11 | OK | Close-up de Rufino solo, sin sombrero flotando. Una cadena, una medalla. Sin texto. Audio completo. |
| c21 | OK con recorte | Sin sombrero flotando, una medalla, sin texto. Al final repite "...nuestras manos **tras manos**" (7.84–8.2 s): la frase se corta en 7.79 s (hueco de −52 dB en 7.76 s). |
| c26 | OK | Una sola cadena con una medalla oval de plata (la levanta con dos dedos). Sin texto. Audio completo. |
| c30 | **REGENERAR** | **Dos cadenas de plata con dos medallas** todo el clip (la que sostiene en la mano + otra colgando). Sin sombrero flotando, sin texto, audio completo con "Efraín". Ni recorte ni silencio lo arreglan. |

Cambio en clips.py (c30): manos abajo y vacías, sin tocar la medalla; la medalla cuelga sola al centro del pecho; "he wears only that one chain" (lo que funcionó en c26). Regenerar: `python -I clips.py c30 > clips_log3.txt`, luego `python -I phr.py` y volver a medir los dos rangos de c30 en la EDL de edit.py (el resto de la EDL ya está por rangos de renders/phr.json).
- **c30 v3**: OK (una cadena, una medalla colgando, sin texto, audio completo con "Efraín"). EDL medida, renders/v1.mp4 renderizado (165.0 s, 75 planos, −14.6 LUFS, TP −1.7).
