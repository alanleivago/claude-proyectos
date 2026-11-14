# QA clips · sazon-concha Parte 1 (MAJESTIC, 2026-11-06)

Método (el de fierro-herradura): hoja de 4 fotogramas por clip (8/35/62/90 %) comparada con chars/ (CONCEPCION_MOLERA, MAXIMILIANO_GERENTE, DARIO_COCINERO, ANTONIO_LAVALOZA, VICTORIA_LAZCANO, LOC_COCINACASONA, LOC_CALLEJONCASONA, LOC_COMEDORCASONA, PROP_CAZUELAMOLE) y con la geografía fija de clips.py. Tiras del 38 % inferior a 1.5 fps (subtítulos) y de cuadro completo a 4 fps (bordes, entradas, congelado) en los 36 clips; fotogramas a resolución completa de lo dudoso y los recortes probados en el peor fotograma. freezedetect + cortes (scene > 0.3) + LUFS por clip. Audio: faster-whisper large-v3 (es, CPU, int8) sobre el WAV cargado con numpy, palabra por palabra contra lines.json, más F0 mediana por clip. Nada se corrió en Flow.

Resultado general: caras y ropa correctas en todos (Concha: moño bajo canoso, blusa blanca con flores rojas, mandil verde. Maximiliano: lampiño, saco vino, camisa negra abierta, reloj. Darío: barba corta, laterales rapados, camisa negra, mandil gris. Toño: bigote, playera mostaza, mandil blanco. Victoria: pelo plateado corto, vestido negro, chal ciruela). Nadie con sombrero, lentes, filipina, gorro ni cuchillo (en la mesa del comedor solo tenedores/cucharas). Sin niños, armas ni extremidades de más; nadie señala con el dedo (manos abiertas). Una sola cazuela de mole, la de la hoja, en c02, c07, c25 y c31; una sola cuchara de madera, solo en c31. Ningún clip congelado ni con cortes internos (c22 tiene un salto de encuadre, ver tabla). Subtítulos solo en c16. Geografía respetada (cocina: Concha IZQ., Max/Darío DER., Toño CENTRO; comedor: Victoria sentada al centro; callejón de noche: Max IZQ., Darío DER.). Voces: hombres 96–154 Hz, mujeres 174–219 Hz, cada una con su personaje. Transcripción = lines.json en los 31 diálogos: sin palabras faltantes, repetidas ni segundas frases perdidas.

Mandil de Concha (checklist ESTADO): c02 puesto · c05 puesto · c07 puesto todo el plano (no lo desata ni lo dobla; desde ~3.2 s tiene las manos en el nudo) · c09 **mal** (rebozo oscuro a cuadros en la mano y falda verde que se lee como el mandil puesto) · c11 en la mano (verde) · c17 en la mano (verde; la falda sale verde oscuro en vez de gris) · c25 puesto · c31 puesto.

| clip | estado | motivo |
|---|---|---|
| c01 | OK | Voz 0.0–8.58. |
| c02 | OK | Cazuela única a su lado, mano en el pecho. Voz 0.52–6.68. |
| c03 | OK con crop | Figura de blusa blanca en el borde IZQ. de 0.0 a ~0.75 s; voz desde 0.0. Frase 1 (0.0–1.0) con `crop=576:1024:144:0` (limpio). Audio completo. |
| c04 | OK | Mano abierta. Audio completo, bajo (−24.6). |
| c05 | OK con crop | Figura de blanco en el borde DER. (y pelo oscuro arriba a la DER. en 0–0.25) de 0.0 a ~1.25 s; voz desde 0.0. "Doña Victoria" (0.0–1.4) con `crop=450:800:0:60` (limpio; punch-in fuerte). Audio completo. |
| c06 | OK | Voz 0.62–6.86. |
| c07 | OK con crop (aviso) | Antebrazo de otra persona en el borde DER. junto a la cazuela de 0.0 a ~1.0 s; voz desde 0.0. Frase 1 (0.0–1.2) con `crop=576:1024:0:0` (limpio). Aviso: no se quita el mandil (ver checklist); la cazuela es una sola. Audio completo. |
| r1 | OK | Toño baja la vista. Mudo (Whisper alucina "Gracias": silenciar). |
| c08 | OK | Voz 0.0–6.82. Callejón con luz de tarde. |
| c09 | **REGENERAR** | Lleva en la mano un rebozo oscuro a cuadros en lugar del mandil verde y la falda sale verde (parece que sigue con el mandil puesto); además, doble de Concha (blusa blanca con ribete rojo) en el borde DER. de 0.0 a ~1.0 s. Audio completo (voz 0.92–5.72). |
| c10 | OK | Audio completo. |
| c11 | OK con crop | Doble de blusa blanca en el borde DER. de 0.0 a ~1.25 s; voz desde 0.0. "¿Doña Victoria está aquí?" (0.0–1.5) con `crop=540:960:0:0` (limpio). Mandil verde en la mano. Audio completo, fuerte (−17.2). |
| c12 | OK con recorte | Figura blanca abajo a la IZQ. de 0.0 a ~0.5 s; voz desde 0.64: empezar en ≥ 0.6 s. Audio completo. |
| i1 | **REGENERAR** | Dos cucharas: una queda en la mesa junto al plato y la mano levanta otra (todo el clip). Plato único y bien. Mudo (alucina "Bienvenidos a mi canal": silenciar). Fallback: sacar el inserto. |
| c13 | OK | Prueba con cuchara, un solo plato. Voz 1.38–5.3. |
| c14 | OK con crop | Figura blanca en el borde IZQ. de 0.0 a ~0.75 s; voz desde 0.0. "Se equivoca, señora." (0.0–1.0) con `crop=594:1056:126:0` (limpio). Audio completo. |
| c15 | OK | Una cuchara en la mesa, sin plato. Voz 0.86–6.56. |
| r2 | OK | Mudo (alucina "Bienvenidos a mi canal…": silenciar). |
| c16 | **REGENERAR** | Subtítulo quemado "Mejor pruebe el postre." de ~4.5 a ~6.25 s (2ª frase, voz 4.62–5.94). Fallback probado: `crop=608:1081:56:0` de 4.4 a 6.3 s (el texto queda fuera, limpio). Audio completo, fuerte (−17.2). |
| c17 | OK (aviso) | Mandil verde en la mano; falda verde oscuro en vez de gris. Poste del arco en el borde IZQ. (arquitectura). Audio completo. |
| c18 | OK | Mesa con plato pequeño y tenedor (servicio, sin cuchillo). Voz 1.56–6.0. |
| c19 | OK | Manos abiertas. Audio completo, bajo (−23.6). |
| r3 | OK | Mudo (alucina "Gracias por ver el video": silenciar). |
| c20 | OK | Audio completo (las dos frases). |
| c21 | OK | Voz 0.92–6.0. |
| c22 | OK con crop | Hombro vino oscuro abajo a la DER. y un tenedor en la mesa de 0.0 a ~1.5 s, luego salto de encuadre (más cerrado) entre 1.5 y 1.75 s, en medio de "no te la regalé". Con `crop=610:1085:0:0` en 0.0–1.6 s se quitan los dos y el encuadre queda igual al de después del salto (probado limpio). Audio completo. |
| c23 | OK | Audio completo. |
| c24 | OK | Voz 1.06–4.52. Bajo (−23.5). |
| c25 | OK | Mandil puesto de nuevo, cazuela única. Voz 1.0–4.88. |
| c26 | OK con crop | Figura oscura en el borde IZQ. de 0.0 a ~0.5 s; voz desde 0.0. "Gracias a ti" (0.0–0.75) con `crop=612:1088:108:0` (limpio). Audio completo. |
| c27 | OK | Mano abierta hacia la estufa. Voz 0.82–4.56. Fuerte (−17.2). |
| c28 | OK con crop | Cabeza/hombro oscuro en el borde DER. de 0.0 a ~1.25 s; voz desde 1.06. Empezar en ≥ 1.0 s y `crop=576:1024:0:128` de 1.0 a 1.5 s (limpio). Callejón de noche iluminado por el farol, no muy oscuro (ver arreglos). Audio completo, bajo (−24.5). |
| c29 | OK con recorte | Figura oscura en el borde IZQ. de 0.0 a ~0.25 s; voz desde 0.94: empezar en ≥ 0.5 s. La mano en la nuca es la suya (manga negra visible a los 2.75 s). Audio completo. |
| c30 | OK con crop | Hombro oscuro abajo a la DER. de 0.0 a ~1.75 s; voz desde 0.0. "No se va a enterar, Darío," (0.0–1.8) con `crop=540:960:0:0` (limpio). Audio completo, bajo (−25.1). |
| r4 | OK con recorte | Figura oscura en el borde IZQ. de 0.0 a ~0.5 s: empezar en ≥ 0.75 s. Mudo (Whisper oye "¡Suscríbete!" a −37 LUFS: silenciar). |
| c31 | OK | CTA a cámara: una cazuela, una cuchara de madera, mandil puesto, sonrisa y gestos. Audio completo (pregunta doble y la 2ª frase). |

## REGENERAR
- **c09**: rebozo a cuadros en vez del mandil verde, falda verde, y doble de Concha en el borde DER.
- **c16**: subtítulo quemado en la 2ª frase.
- **i1**: dos cucharas (una en la mesa y otra en la mano).

Cambios en clips.py:
- c09: `one(...)` lleva ahora como extra `NODOUBLE("woman in a white embroidered blouse")` + "she no longer wears the apron, her long dark grey skirt is visible; the only cloth in her hand is her own plain dark green apron, folded, the same green as in her reference; no shawl, no rebozo, no plaid or striped cloth".
- c16: extra "no subtitles at any moment, not even for his last short sentence; the lower part of the frame shows only his blazer and the room".
- `PLATE` (solo lo usa i1): sin cuchara al lado ("no spoon, fork or any cutlery next to it") y i1 cierra con "That silver spoon is the only spoon in the whole shot, nothing else lies on the tablecloth."
- Se mantienen STYLE, VOICE, NOSUB, END, SOLO/ONE/ALONE con gaze, NODOUBLE, POT (una cazuela), SAFE, SOFT con \b, variant, NOREF, STYLES, TRIES=6, los 17 s entre clips y el gatito de control.

Probado en seco en una copia con gen falso: con IDs, la versión anterior pasa a `clips/old/c09_v1.mp4`, `clips/old/c16_v1.mp4` y `clips/old/i1_v1.mp4`, el resto no se toca, los prompts llevan los cambios e imprime "FIN P1".

Para regenerar (cuando Flow esté libre): `python -I clips.py c09 c16 i1 > clips_log2.txt`. Revisar después: c09 con el mandil verde en la mano, falda gris y nadie en los bordes; c16 sin subtítulos; i1 con una sola cuchara.

## Arreglos menores para el montaje
- **Crops de la frase 1** (punch-in solo mientras dura el borde): c03 `576:1024:144:0` (0–1.0), c05 `450:800:0:60` (0–1.4), c07 `576:1024:0:0` (0–1.2), c11 `540:960:0:0` (0–1.5), c14 `594:1056:126:0` (0–1.0), c22 `610:1085:0:0` (0–1.6), c26 `612:1088:108:0` (0–0.75), c28 `576:1024:0:128` (1.0–1.5), c30 `540:960:0:0` (0–1.8). Todos probados limpios en el peor fotograma.
- **Arranques**: c12 ≥ 0.6 s, c28 ≥ 1.0 s, c29 ≥ 0.5 s, r4 ≥ 0.75 s.
- **Fallbacks si la regeneración vuelve mal**: c16 `crop=608:1081:56:0` de 4.4 a 6.3 s; i1 fuera del montaje; c09 usar desde ≥ 1.0 s (aunque el rebozo sigue).
- **r1–r4, i1**: silenciar el audio (−37 a −57 LUFS; Whisper alucina "Gracias", "Bienvenidos a mi canal", "Gracias por ver el video", "¡Suscríbete!").
- **Callejón de noche (c28–c30, r4)**: el farol ilumina la pared ocre y se ve más atardecer que noche; bajar exposición/temperatura en el montaje (p. ej. `eq=brightness=-0.06:saturation=0.85` + `colorbalance=bs=0.05`) para que se lea como noche.
- Volumen: c11, c16, c27 (−17.2), c12 (−17.3), c21 (−17.4) fuertes; c30 (−25.1), c04 (−24.6), c28 (−24.5), c05 (−24.1) bajos. El loudnorm en dos pasadas de edit.py los empareja.
- Arranques tardíos de voz (c18 1.56, c13 1.38, c24 1.06, c28 1.06, c25 1.0, c29 0.94, c09 0.92, c21 0.92 s): el montaje por frases (phr.py) los recorta.
- Avisos sin acción: c07 no se quita el mandil (la frase "Llévense mi mandil" funciona igual; el siguiente plano ya es el callejón), falda verde oscuro de Concha en c17, plato pequeño de servicio en la mesa de c18.
- Whisper escribe "30" por "treinta", "concha" en minúscula y cambia puntos por comas: es grafía; el audio dice lo de lines.json.
