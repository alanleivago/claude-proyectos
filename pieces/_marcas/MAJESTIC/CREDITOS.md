# Música: MAJESTIC STORIES (paleta de cuerdas orquestales)

Todo es CC0 1.0 (dominio público): uso comercial sin dar crédito en el video. Igual queda anotado el autor.
Las pistas largas son previews HQ mp3 de Freesound (vía Openverse, filtro cc0). Las elegí con earshot (rank + describe + realness + compare) entre 121 candidatas de tensión y 61 cálidas, comparadas con la tensión de VISTA.
Los archivos del kit van nivelados a los de VISTA por la banda de celular (sobre 200 Hz: tensión -23.8, cálida -17.0 LUFS), así edit.py usa las mismas ganancias.

## tension.mp3: 195 s, -20.7 LUFS (banda de celular -23.8) (reemplazada el 2026-11-06)
- **Fuente:** "Orchestral Suspense Loop 1", awrmacd, https://freesound.org/people/awrmacd/sounds/387223
- **Licencia:** CC0 1.0
- **Por qué se cambió:** al usuario no lo convencía la anterior (szegvari 612949, guardada en `_anterior/tension_2026-11-05.mp3`; la de antes sigue en `_anterior/tension_2026-11-04.mp3`): sonaba a drone triste, no a suspenso de telenovela.
- **Por qué esta:** 1.ª de 20 candidatas con "dramatic soap opera suspense music with ominous strings, a pulsing low end and suspense hits" (z +4.0, strong). Ánimo "dark and tense" z +3.8 (el más alto); AudioSet: scary music 0.43, throbbing 0.30; cuerdas en conjunto y pizzicato sobre un pulso grave, con crescendos y golpes. Es la más cercana en clima a VISTA (coseno 0.78) sin ser la misma: cuerdas orquestales en vez de pad y tambores. Sigue en la paleta de cuerdas de MAJESTIC.
- **Edición:** 0-71 s + 4-71 s + 4-71 s con fundidos cruzados de 5 s (el original se apaga desde 72 s; así no hay hueco al loopear), pasa-altos 40 Hz, low shelf -4 dB en 150 Hz, compresor suave (umbral -32 dB, 3:1, ataque 300 ms), +8.8 dB. Banda de celular -23.8 LUFS, ventanas de 4 s p10/p90 -24.7/-22.4, LRA 2.8 LU.
## calida.mp3: 113 s, -13.8 LUFS (banda de celular -17.0) (reemplazada el 2026-11-06)
- **Fuente:** "Contemplative String Loop (Violin and Cello)", CVLTIV8R, https://freesound.org/people/CVLTIV8R/sounds/839571
- **Licencia:** CC0 1.0
- **Por qué se cambió:** al usuario no le gustó la anterior ("Beautiful String Music", Cunningar0807 353964, guardada en `_anterior/calida_2026-11-05.mp3`) en buen-hijo-p2 v2 (1:22-1:45): sonaba alegre. earshot le daba "uplifting orchestral film score" z +3.4 y "triumphant and heroic" z +3.4.
- **Por qué esta:** entre 105 candidatas CC0 de Freesound (cuerdas tristes, cello, piano con cuerdas), "sad, melancholic and tender emotional string music" z +4.6, 99 % frente a alegre/edificante (1 %), suspenso y heroico; ánimo "sad and melancholic" z +3.4, AudioSet cello 0.48 y sad music 0.33. Violín y cello lentos, agridulce, sin tono de triunfo. p_real 0.82. Coseno 0.72 con la cálida anterior y 0.65 con la tensión nueva: sigue en la paleta de cuerdas de MAJESTIC.
- **Edición:** 0.1-39.5 s tres veces con fundidos cruzados de 2.5 s (el original es un loop de 45 s que se apaga desde 38 s), compresor suave (umbral -36 dB, 2.5:1, ataque 200 ms), +20 dB y limitador. Banda de celular -17.0 LUFS (como VISTA), ventanas de 3 s entre -21 y -15, LRA 3.6 LU, pico -1.9 dBFS.

## revelacion.mp3: 4 s
- **Fuente:** "Cinematic Trailer Hit Explosion CC0.mp3", Wakerone, https://freesound.org/people/Wakerone/sounds/513110 (de la librería sound-layer)
- **Licencia:** CC0 1.0
- **Por qué:** 2.ª de 301 golpes con "a single dramatic cinematic orchestral hit with deep boom and a long dark tail" (z +4.0, strong; suena a "cinematic hit with a long tail" z +4.4).

## boom.mp3 y boom/hit.mp3: 4 s
- **Fuente:** "Low Metal Hit 2.wav", zazz.sound.design, https://freesound.org/people/zazz.sound.design/sounds/359140 (sound-layer)
- **Licencia:** CC0 1.0
- **Por qué:** 1.º de 301 con la misma búsqueda (z +4.0). boom/hit.mp3 es el golpe grave del final en edit.py (nivelado a -22.8 LUFS como el 701308 de VISTA); boom.mp3 es el mismo golpe más fuerte.
