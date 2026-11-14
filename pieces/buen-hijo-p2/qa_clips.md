# QA clips · buen-hijo Parte 2 (MAJESTIC, 2026-11-06)

Método (el de intercambio): hoja de 4 fotogramas por clip (8/35/62/90 %) comparada con chars/ (ABUNDIO, TADEO, ROMAN, AURELIA, LOC_SALON, LOC_FOGON) y con la geografía fija de clips.py. Tiras del 38 % inferior a 1.5 fps (subtítulos) y de cuadro completo a 4 fps (bordes, entradas, congelado) en los 30 clips; tiras de 0–2.5 s más grandes y tiras del 28 % izquierdo/derecho a 4 fps en los dudosos; zoom a resolución completa de la carta abierta (c13); recortes probados en el peor fotograma. freezedetect + cortes (scene > 0.3) + LUFS por clip. Audio: faster-whisper large-v3 (es, CPU, int8) sobre el WAV cargado con numpy, contra lines.json, más F0 mediana por clip. Nada se corrió en Flow.

Resultado general: caras y ropa correctas (Abundio: canas peinadas atrás, bigote gris, camisa beige. Tadeo: rizado, lampiño, camisa verde salvia, pantalón gris claro. Román: pelo engominado, lampiño, suéter azul marino, reloj plateado en c12. Aurelia: chongo bajo, blusa blanca bordada, mandil turquesa), salvo Aurelia en c26 (sin mandil). Lados respetados (cocina: Tadeo mira a la DER., Aurelia a la IZQ.; salón: Tadeo/Aurelia miran a la DER., Abundio/Román a la IZQ.). Nadie con sombrero; sin niños, armas ni extremidades de más; nadie señala con el dedo (manos abiertas en c17, c20, c27, c29). Ningún clip congelado ni con cortes internos. Una sola carta en todos: c04 en la mano de Aurelia, de c05 en adelante con Tadeo, sin sobre ni sello. En c13 la carta abierta tiene garabatos tipo letra manuscrita que no se pueden leer (bien). Subtítulos quemados solo en c27. Voces: hombres 104–130 Hz, Aurelia 172–205 Hz, cada una con su personaje. La transcripción coincide con lines.json en los 29 diálogos. Ningún clip pierde la 2ª frase ni tiene palabras repetidas.

Aviso de set: el salón de la hoja (moderno, escalera flotante sin barandal) sale en c11, c13, c15–c17, c19, c21, c22 y c24–c29. En r1, c10, c12, c14, c18, c20 y c23 sale un salón clásico con barandal de hierro y ventanas con cortinas. Como casi siempre cae del lado de Abundio y Román, se puede leer como la otra mitad del cuarto, pero c23 (Aurelia) y c21/c17 lo mezclan. No se regenera por esto; para los regenerados, SAL ahora describe el salón moderno.

| clip | estado | motivo |
|---|---|---|
| c01 | OK (aviso) | Dice "te **mandó lejos** de la casa" en lugar de "te sacó" (salió en el intento 2 con SOFT; el sentido se mantiene). Audio completo, voz 0.78–8.76. |
| c02 | OK | Voz 0.7–6.04. |
| c03 | OK con crop | Hombro/brazo oscuro en el borde IZQ. de 0.0 a ~1.0 s; la voz entra en 0.72. `crop=580:1031:140:0` en 0–1.0 (limpio). |
| c04 | OK | Una carta, en la mano de Aurelia. Audio completo. |
| c05 | OK | Carta al pecho, una sola. Audio completo. |
| c06 | OK | Manos juntas, sin carta. Audio completo. |
| c07 | OK con crop | Cabeza de pelo oscuro en el borde DER. de 0.0 a ~2.0 s; la voz entra en 0.9. `crop=480:853:40:100` en 0–2.0 (limpio en 0.3 y 1.8; punch-in fuerte). La mano abajo a la IZQ. con la carta es la derecha de Tadeo. |
| c08 | OK con crop | Doble de blusa blanca de encaje en el borde IZQ. de 0.0 a ~1.0 s; la voz entra en 0.74. `crop=600:1067:120:0` en 0–1.0 (limpio). |
| c09 | OK | Una carta. "oír lo de él" es grafía de Whisper. |
| r1 | OK | Mudo (−47.6 LUFS; Whisper alucina "¡Suscríbete!": silenciar). |
| c10 | OK con crop | Figura oscura en el borde IZQ. de 0.0 a ~0.5 s; la voz entra en 0.0–0.56. `crop=620:1102:100:0` en 0–0.5 (limpio). |
| c11 | OK | Una carta. Audio completo. |
| c12 | OK con crop | Mujer de pelo castaño largo y blusa floreada abajo a la IZQ. de 0.0 a ~0.75 s; la voz entra en 0.68. `crop=540:960:150:0` en 0–0.75 (limpio). |
| c13 | OK | Carta abierta, una sola; la letra no se lee. Audio completo (Whisper une las dos frases con coma). |
| c14 | OK | Audio completo. |
| c15 | OK | Audio completo. |
| c16 | OK | Arranca en plano más abierto con push-in rápido; sin nadie en los bordes. Audio completo. |
| c17 | OK | Mano abierta. Audio completo. |
| c18 | OK | Audio completo. |
| c19 | OK | La carta baja y sale de cuadro en ~2 s (está en su mano). Audio completo. |
| c20 | OK con crop | Figura de blanco en el borde IZQ. de 0.0 a ~0.75 s; la voz entra en 0.0–0.68. `crop=600:1067:120:0` en 0–0.75 (limpio). |
| c21 | OK | Audio completo. |
| c22 | OK | Una carta. Audio completo. |
| c23 | OK | Mano en el corazón. Audio completo. |
| c24 | OK con recorte | Aurelia entra desplazándose desde el borde IZQ. de 0.0 a ~1.0 s (a los 0.25 s el cuadro está vacío). La voz entra en 1.08: empezar en ≥ 1.0. |
| c25 | OK | Una carta. Audio completo. |
| c26 | **REGENERAR** | Aurelia **sin mandil turquesa**: lleva una playera beige lisa (en c23/c24, justo antes, sí tiene blusa bordada y mandil). Audio completo ("Petra…" + 2ª frase). No hay recorte que lo arregle. |
| c27 | **REGENERAR** | **Subtítulos quemados** en las dos frases (de ~0.7 a ~7.0 s, a media altura, y ≈ 870–930). Además, una mujer de blusa floreada en el borde IZQ. de 0.0 a ~1.25 s. Fallback probado: `crop=480:853:120:0` en todo el clip (deja fuera los subtítulos y a la mujer; punch-in fuerte). Audio completo. |
| c28 | OK con crop | Figura de blanco en el borde DER. de 0.0 a ~1.0 s; la voz entra en 1.04. `crop=600:1067:0:0` en 0–1.0, o empezar en ≥ 1.0. |
| c29 | OK | CTA a cámara desde el frame 0, asiente, sonríe y gesticula con la mano abierta. Audio completo (incluida la 2ª frase). |

## REGENERAR
- **c26**: Aurelia sin mandil (playera beige).
- **c27**: subtítulos quemados + mujer en el borde IZQ.

Cambios en clips.py (se mantienen STYLE, VOICE, NOSUB, END, SOLO/ONE/ALONE con gaze, LET/NOLET, NOBADGE, SAFE, SOFT con \b, variant, NOREF, STYLES, TRIES=6, los 17 s entre clips y el gatito de control):
- `SAL`: salón "modern minimalist" con "a floating dark wood staircase with no railing", como LOC_SALON. Antes decía solo "a dark wood staircase at the back" y Flow ponía a veces un salón clásico con barandal.
- c26: "she wears her white embroidered blouse with the turquoise apron over it for the whole shot, exactly as in her reference sheet".
- c27: "no woman and no floral blouse at the left edge" + al final "No subtitles at any moment, not even during his long first sentence; the middle and lower part of the frame show only his shirt and the room."

Probado en seco en una copia con gen falso: con IDs, la versión anterior pasa a `clips/old/<id>_v1.mp4` (y _v2 en una 2ª corrida), los demás no se tocan, los prompts llevan los cambios (también el mínimo del intento 6) e imprime "FIN P2".

Para regenerar (cuando Flow esté libre): `python -I clips.py c26 c27 > clips_log2.txt`. Revisar después: c26 con mandil turquesa; c27 sin subtítulos y sin nadie en el borde.

## Arreglos menores para el montaje
- **Crops de borde** (punch-in solo mientras dura el borde): c03 `580:1031:140:0` (0–1.0), c07 `480:853:40:100` (0–2.0), c08 `600:1067:120:0` (0–1.0), c10 `620:1102:100:0` (0–0.5), c12 `540:960:150:0` (0–0.75), c20 `600:1067:120:0` (0–0.75), c28 `600:1067:0:0` (0–1.0). Todos probados limpios en el peor fotograma.
- **Arranques**: c24 ≥ 1.0 s (Aurelia entra de lado); c28 ≥ 1.0 s como alternativa al crop.
- **Fallback si la regeneración vuelve mal**: c27 `crop=480:853:120:0` en todo el clip (probado limpio en 1.0 y 5.5 s). c26 no tiene recorte; si vuelve mal, usar el actual (solo falla la ropa).
- **r1**: silenciar el audio (−47.6 LUFS; Whisper alucina "¡Suscríbete!").
- Volumen: c03 (−17.7), c15 (−17.6) y c08 (−18.0) suenan fuertes; c05 y c07 (−23.3) suenan bajos. El loudnorm de edit.py los empareja.
- Avisos sin acción: el salón clásico en r1, c10, c12, c14, c18, c20 y c23 (ver arriba). En c01 dice "mandó lejos" en lugar de "sacó". Whisper escribe "Nana"/"Señor"/"Puerta Verde" con mayúscula y cambia "…" por comas: es grafía.
