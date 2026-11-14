# QA clips · intercambio Parte 1 (MEXI, Navidad, 2026-11-06)

Método (el de sazon-concha): hoja de 4 fotogramas por clip (8/35/62/90 %) comparada con chars/ (FABIOLA_OCHOA, CONSTANZA_VILLASENOR, GERMAN_ALTAMIRANO, EMILIO_VILLASENOR, AURORA_VILLASENOR, LOC_SALAVILLASENOR, LOC_PATIOVILLASENOR, PROP_VIRGENCASIMIRO) y con la geografía fija de clips.py. Tiras del 38 % inferior a 1.5 fps (subtítulos) y de cuadro completo a 4 fps (bordes, entradas, congelado) en los 37 clips; tiras del 25 % izquierdo/derecho a 8 fps en los dudosos; zoom a resolución completa del nacimiento y de la Virgen; recortes probados en el peor fotograma. freezedetect + cortes (scene > 0.3) + LUFS por clip. Audio: faster-whisper large-v3 (es, CPU, int8) sobre el WAV cargado con numpy, contra lines.json, más F0 mediana por clip. Nada se corrió en Flow.

Resultado general: caras y ropa correctas en todos (Fabiola: trenza baja, suéter vino, falda gris. Constanza: melena lacia a los hombros, vestido de terciopelo verde, collar fino. Germán: barba gris corta, saco gris, cuello alto negro. Emilio: rizado, lampiño, chamarra café de pana, suéter crema. Aurora: chongo blanco, vestido azul marino, chal crema, broche). Nadie con sombrero, gorro ni lentes; sin niños, armas ni extremidades de más; nadie señala con el dedo (manos abiertas). Ningún clip congelado ni con cortes internos; nadie entra caminando. Subtítulos quemados solo en c18. Geografía respetada (sala: Aurora sentada al centro, Constanza/Germán DER., Fabiola/Emilio IZQ.; patio con farolitos; patio de noche con velas: Constanza IZQ., Germán DER.). Voces: hombres 113–118 Hz (Germán c03/c30, Emilio c09/c11/c20/c28), mujeres 167–219 Hz, cada una con su personaje. Transcripción = lines.json en los 32 diálogos, salvo c05 ("medianoche" sale "media de anoche", confirmado con prompt de Whisper). Sin palabras faltantes, repetidas ni segundas frases perdidas.

Utilería (checklist ESTADO): mandil blanco con moño rojo, uno solo: Constanza c01 → Fabiola c02 → Aurora c25 → Constanza c26 (bien). Caja de cartón con listón rojo, una sola, con Fabiola en c05, c10–c13 e i1; cajita blanca con moño dorado solo en c06 (bien; en c08 hay regalos decorativos bajo el árbol, fondo). Virgen: la de la hoja (manto celeste, túnica marfil, base redonda lisa) en i1, c17, c21, r4 y c27; **otra Virgen** estilo Guadalupe en c15 (túnica café, ángel a los pies), c24 (rayos dorados) y c32 (madera sin pintar con rayos). **Nacimiento con Niño en el pesebre** (y figuras de María) en c07, c23, c25, c27 y c32.

Riesgos de ESTADO: i1 manos OK (dos manos con manga vino, una sola Virgen que sale acostada de la paja, sin manos extra). c27 manos OK (una mano en la base), pero el Niño está en el pesebre junto a José. r4 manos OK; la base de abajo es lisa, sin letras ni tapitas.

| clip | estado | motivo |
|---|---|---|
| c01 | OK | Mandil en las palmas. Voz 0.8–7.64. |
| c02 | OK con crop | Figura de suéter vino en el borde DER. de 0.0 a ~1.0 s; voz desde 0.0. `crop=600:1067:0:0` en 0–1.0 (limpio). Mandil al pecho. |
| c03 | OK con crop | Figura vino abajo a la IZQ. de 0.0 a ~0.6 s; voz desde 0.38. Empezar en ≥ 0.38 y `crop=640:1138:80:0` hasta 0.6 (limpio). |
| c04 | OK | Voz 0.0–5.84. |
| c05 | **REGENERAR** | Audio: "a la medianoche" se oye "a la media de anoche" (2ª frase). Imagen OK (caja de cartón). Fallback: usar solo la 1ª frase (0.0–~2.6 s); el "Ya son las doce" de c14 sigue funcionando. |
| c06 | OK con crop | Hombro verde (doble de Constanza) en el borde IZQ. de 0.0 a ~1.4 s; voz desde 0.56. Empezar en ≥ 0.5 y `crop=580:1031:140:0` hasta 1.4 (limpio). Cajita blanca única. |
| c07 | **REGENERAR** | Nacimiento completo a su lado: Niño en el pesebre y una María (la Virgen debería faltar). Fallback probado: `crop=432:768:0:200` todo el clip (el nacimiento queda fuera; punch-in fuerte). Audio completo ("quería a la Virgen": "a" de más, menor). |
| c08 | OK con recorte | Figura verde en el borde IZQ. de 0.0 a ~1.6 s; voz desde 1.2. Empezar en ≥ 1.1 y `crop=600:1067:120:0` hasta 1.6 (limpio). |
| r1 | OK con recorte | Figura vino abajo a la DER. de 0.0 a ~0.4 s: empezar en ≥ 0.5. Mudo (−55 LUFS). |
| c09 | OK | Patio con farolitos. Voz 0.0–4.26. |
| c10 | OK | Caja de cartón. Audio completo. |
| c11 | OK con recorte | Figura vino abajo a la IZQ. (y cabeza arriba) de 0.0 a ~1.25 s; voz desde 0.96. Empezar en ≥ 0.9 y `crop=600:1067:120:0` hasta 1.25 (limpio). |
| c12 | OK | Caja de cartón. Audio completo. |
| c13 | OK con crop | Figura de vino bordado en el borde DER. de 0.0 a ~1.1 s; voz desde 0.0. `crop=530:942:0:0` en 0–1.1 (limpio). |
| c14 | OK | Manos abiertas. Audio completo. |
| i1 | OK | Una caja, una Virgen (la de la hoja), dos manos. Mudo (alucina "¡Suscríbete!": silenciar). |
| c15 | **REGENERAR** | La Virgen no es la de la hoja: túnica café, rayos/ángel a los pies (Guadalupe), justo en la revelación tras i1. Además cabeza y cuerpo de otra persona en el borde IZQ. de 0.0 a ~0.6 s (voz desde 0.0). Fallback: `crop=620:1102:100:0` en 0–0.6 (limpio), la Virgen distinta se queda. |
| c16 | OK con recorte | Cabeza oscura en el borde IZQ. de 0.0 a ~0.5 s; voz desde 1.08: empezar en ≥ 0.6. |
| c17 | OK | Virgen correcta, una sola. Audio completo. |
| c18 | **REGENERAR** | Subtítulos quemados de ~0.75 s al final (las dos frases). Fallback probado: `crop=450:800:110:0` todo el clip (el texto queda abajo, fuera; punch-in fuerte). Audio completo. |
| r2 | OK con recorte | Figura verde oscura en el borde IZQ. de 0.0 a ~1.0 s: empezar en ≥ 1.1. Mudo. |
| c19 | OK | Manos abiertas a la altura del pecho. Audio completo. |
| c20 | OK | Voz 0.58–6.06. |
| r3 | OK | Mudo (alucina "¡Suscríbete!" a −45 LUFS: silenciar). |
| c21 | OK (aviso) | La Virgen (correcta, una sola) está de pie en la mesita junto a ella, no en el regazo. Audio completo. |
| c22 | OK con crop | Doble verde en el borde IZQ. de 0.0 a ~1.1 s; voz desde 0.0. `crop=600:1067:120:0` en 0–1.1 (limpio). |
| c23 | **REGENERAR** | Nacimiento detrás con Niño en el pesebre y María. Fallback probado: `crop=450:800:0:200` todo el clip (limpio, punch-in fuerte). Audio completo. |
| c24 | OK con crop | Virgen estilo Guadalupe (rayos dorados) en la mesita, no en el regazo. `crop=540:960:0:160` todo el clip la deja fuera (probado limpio, punch-in suave). Audio completo. |
| c25 | **REGENERAR** | Nacimiento con Niño y figuras de María detrás del mandil (no se puede recortar sin perder el mandil). Audio completo ("noche buena" = grafía). |
| c26 | OK con crop | Figura vino en el borde IZQ. de 0.0 a ~1.1 s; voz desde 0.0. `crop=620:1102:100:0` en 0–1.1 (limpio). Mandil en sus manos. |
| c27 | **REGENERAR** | Niño en el pesebre a los pies de José (el payoff es el hueco junto a José). Manos y Virgen bien. Sin fallback por recorte (el pesebre está en el centro del gesto). |
| c28 | OK con recorte | Cabeza oscura en el borde IZQ. de 0.0 a ~0.9 s; voz desde 0.72. Empezar en ≥ 0.7 y `crop=600:1067:120:0` hasta 0.9 (limpio). |
| c29 | OK con recorte | Doble verde en el borde DER. de 0.0 a ~0.9 s; voz desde 0.7. Empezar en ≥ 0.6 y `crop=620:1102:0:0` hasta 0.9 (limpio). |
| c30 | OK | Voz 0.42–3.54. |
| c31 | OK | Audio completo (incluida la 2ª frase). |
| r4 | OK (aviso) | Virgen correcta, base lisa sin letras, dos manos. La sala no se ve en penumbra (ver arreglos). Mudo (alucina "Bienvenidos a mi canal…": silenciar). |
| c32 | **REGENERAR** | CTA: nacimiento de madera sin pintar con Niño en el pesebre, figuras extra y una Virgen de Guadalupe sin pintar (no la de la historia). Audio completo. Sin fallback por recorte. |

## REGENERAR
- **c05**: "medianoche" se oye "media de anoche".
- **c07**: Niño y María en el nacimiento.
- **c15**: Virgen distinta (Guadalupe café) en la revelación + figura en el borde IZQ.
- **c18**: subtítulos quemados.
- **c23**: Niño y María en el nacimiento.
- **c25**: Niño y María en el nacimiento.
- **c27**: Niño en el pesebre junto a José.
- **c32**: nacimiento sin pintar con Niño y Virgen de Guadalupe sin pintar.

Causa de los nacimientos: `SEAT` decía solo "the side table with the nativity" y Flow lo completa con María y el Niño; c27/c32 nombraban las figuras que van pero no las que no van.

Cambios en clips.py:
- Nuevo `NOKID` = "no manger, no crib, no straw bed and no Child figure anywhere".
- `NAC`: añade "no figure of Mary yet" + NOKID. `NAC2` (c32): José, buey y burro "and beside Joseph stands {VIR}" + NOKID.
- `SEAT` (Aurora sentada) ahora incluye `NAC` completo en vez de "the nativity".
- `VIR`: añade túnica marfil y "not Our Lady of Guadalupe: no golden rays or sunburst around her, no angel or moon at her feet, not bare unpainted wood".
- c05: tono con "she says the word medianoche as one single word, me-dia-no-che".
- c15: extra `NODOUBLE("white-haired woman or person in white")`.
- c18: extra "no subtitles at any moment, not even during her long first sentence; the lower half of the frame shows only her sweater and the room".
- c27: "she holds {VIR}; she gently places it beside Saint Joseph…" (para que la descripción de la Virgen no se mezcle con la del nacimiento).
- c32: toca "the base of that pale blue painted Virgin".
- Se mantienen STYLE, VOICE, NOSUB, CLEAN, END, SOLO/ONE/ALONE con gaze, NODOUBLE, una pieza de cada utilería, SAFE, SOFT con \b, variant, NOREF, STYLES, TRIES=6, los 17 s entre clips y el gatito de control.

Probado en seco en una copia con gen falso: con IDs, la versión anterior pasa a `clips/old/<id>_v1.mp4` (y _v2 en una 2ª corrida), el resto no se toca, los prompts llevan los cambios (también el mínimo del intento 6) e imprime "FIN P1".

Para regenerar (cuando Flow esté libre): `python -I clips.py c05 c07 c15 c18 c23 c25 c27 c32 > clips_log2.txt`. Revisar después: nacimiento solo con José, buey y burro (c07, c23, c25) y con la Virgen celeste junto a José sin pesebre (c27, c32); Virgen celeste de la hoja en c15; c18 sin subtítulos; c05 diciendo "medianoche".

## Arreglos menores para el montaje
- **Crops de borde** (punch-in solo mientras dura el borde): c02 `600:1067:0:0` (0–1.0), c03 `640:1138:80:0` (0.38–0.6), c06 `580:1031:140:0` (0.5–1.4), c08 `600:1067:120:0` (1.1–1.6), c11 `600:1067:120:0` (0.9–1.25), c13 `530:942:0:0` (0–1.1), c22 `600:1067:120:0` (0–1.1), c26 `620:1102:100:0` (0–1.1), c28 `600:1067:120:0` (0.7–0.9), c29 `620:1102:0:0` (0.6–0.9). Todos probados limpios en el peor fotograma.
- **Crop de todo el clip**: c24 `540:960:0:160` (saca la Virgen de Guadalupe).
- **Arranques**: c03 ≥ 0.38, c06 ≥ 0.5, c08 ≥ 1.1, c11 ≥ 0.9, c16 ≥ 0.6, c28 ≥ 0.7, c29 ≥ 0.6, r1 ≥ 0.5, r2 ≥ 1.1 s.
- **Fallbacks si la regeneración vuelve mal**: c07 `crop=432:768:0:200`, c23 `crop=450:800:0:200`, c18 `crop=450:800:110:0` (todo el clip, probados limpios); c15 `crop=620:1102:100:0` en 0–0.6; c05 solo la 1ª frase; c25, c27 y c32 no tienen recorte que salve el nacimiento.
- **r1–r4, i1**: silenciar el audio (−37 a −60 LUFS; Whisper alucina "¡Suscríbete!" y "Bienvenidos a mi canal").
- **r4**: la sala debería estar en penumbra con solo el árbol encendido; bajar exposición (p. ej. `eq=brightness=-0.08:saturation=0.9`).
- Volumen: c32 (−14.8), c25 (−16.6), c07 (−17.3) fuertes; c09, c12 (−23.3), c13 (−22.6), c11 (−22.5) bajos. El loudnorm en dos pasadas de edit.py los empareja.
- Avisos sin acción: c21 Virgen en la mesita en vez del regazo; regalos decorativos bajo el árbol en c08; "quería a la Virgen" en c07.
- Whisper escribe "12" por "doce", "noche buena", "virgen" en minúscula y cambia puntos por comas: es grafía.
