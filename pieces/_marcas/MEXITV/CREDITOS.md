# Música: MEXI TV (@mexitve) (propia desde el 2026-11-16; antes era una copia de MEXI)

Todo es CC0 1.0 (dominio público): uso comercial sin dar crédito en el video. Igual queda anotado el autor.
Ningún archivo se comparte con otra marca (VISTA, MAJESTIC, MEXI, SINMARCA): md5 distintos y fuentes de Freesound que ninguna otra marca usa.
Las pistas largas son previews HQ mp3 de Freesound (filtro CC0). Elegidas con earshot (rank + describe + realness + compare) entre 68 candidatas de tensión y 97 cálidas.
Biblioteca del usuario (D:\Alan\Fiverr Upwork...\Audios musica terror / violines / documentales): revisada y descartada, son ripeos de YouTube y pistas de Artlist/Soundstripe (una con marca de agua): licencia dudosa y riesgo de Content ID / "no original" en TikTok.
Nivelado como pide marcas.json: banda de celular (sobre 200 Hz) tension -23.5±0.5 y calida ~-17 LUFS, LRA < 4 LU, loop sin hueco (la cola se funde con la cabeza, así edit.py puede usar -stream_loop).

## tension.mp3: 123.6 s, -18.5 LUFS (banda de celular -23.8, LRA 3.3)
- **Fuente:** "Fish - Cinematic soundtrack background music.wav", szegvari, https://freesound.org/people/szegvari/sounds/593910
- **Licencia:** CC0 1.0
- **Por qué:** 1.ª de 54 con "dark suspenseful thriller underscore with a low pulsing bass, ominous pads and drum hits" (z +3.9, strong). Ánimo "dark and tense" z +3.5 (VISTA da +3.1): pad oscuro con percusión y golpes de cola larga, mismo clima que VISTA pero otra pista. p_real 0.96. Coseno con las tensiones de las otras marcas: MAJESTIC 0.72, VISTA 0.65, MEXI 0.62, SINMARCA 0.55. Pareja de punta a punta (LRA 3.1 en el original).
- **Edición:** 0.3-66.1 s dos veces con fundido cruzado de 4 s y la cola fundida en la cabeza (loop sin costura), -0.7 dB y limitador. Ya nivelada: "dark and tense suspense music" z +3.6 (99 % frente a alegre, piano triste y épico).

## calida.mp3: 125 s, -15.4 LUFS (banda de celular -17.0, LRA 2.6)
- **Fuente:** "FieldViewDream", Bigvegie, https://freesound.org/people/Bigvegie/sounds/580635
- **Licencia:** CC0 1.0
- **Por qué:** cuerdas lentas, triste y romántica: "sad and melancholic music" z +4.0, "romantic" z +3.1; AudioSet Sad music 0.34. p_real 0.87. Descarté los pianos solos (Late Spring 654840 daba coseno 0.94 con la cálida de MEXI) y "Violin Ending" 707451 (sale edificante/heroica, LRA 11). Coseno con las cálidas de las otras marcas: MAJESTIC 0.70, VISTA 0.66, SINMARCA 0.58, MEXI 0.54.
- **Edición:** 3-131 s con la cola fundida 3 s en la cabeza, dynaudnorm (f 400, g 15) + compresor 3:1, +9.4 dB. Ya nivelada: "sad, tender and melancholic emotional string music" z +3.7 (98 %), p_real 0.84.

## revelacion.mp3: 4 s, -16.1 LUFS
- **Fuente:** "Cinematic Alarm Hit", Rizzard, https://freesound.org/people/Rizzard/sounds/560157 (librería sound-layer)
- **Licencia:** CC0 1.0
- **Por qué:** "a single dramatic cinematic orchestral hit with deep boom and a long dark tail" z +3.8 (strong, 93 % frente a sirena/tambor/whoosh); suena a "a cinematic hit with a long tail" z +4.6. Recortado a 4 s con fundido de 1.2 s.

## boom.mp3 y boom/hit.mp3: 4 s
- **Fuente:** "Deep Impact", Poligonstudio, https://freesound.org/people/Poligonstudio/sounds/441593 (librería sound-layer)
- **Licencia:** CC0 1.0
- **Por qué:** "a deep low cinematic boom impact" z +4.1 (strong). Recortado a 4 s con fundido. boom/hit.mp3 es el golpe grave del final en edit.py (-22.6 LUFS, como los de las otras marcas); boom.mp3 es el mismo golpe más fuerte (-16.3 LUFS, con limitador).
