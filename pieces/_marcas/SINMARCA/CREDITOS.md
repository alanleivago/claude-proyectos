# Música: SINMARCA (videos sin marca de agua; paleta de guitarra oscura y pads)

Todo es CC0 1.0 (dominio público): uso comercial sin dar crédito en el video. Igual queda anotado el autor.
Las pistas largas son previews HQ mp3 de Freesound (búsqueda con filtro "Creative Commons 0"); los golpes salen de la librería sound-layer (también CC0). Las elegí con earshot (rank + describe + compare + realness) entre 44 candidatas de tensión y 17 cálidas, comparadas con la tensión de VISTA.
Nivel por la banda que suena en un celular (sobre 200 Hz, mismo medidor para todas): tensión -23.8 LUFS (VISTA -24.2, MAJESTIC y MEXI -23.8) y cálida -17.0 (VISTA -17.0). Así edit.py usa las mismas ganancias que en las otras marcas.

## tension.mp3: 224 s, -22.2 LUFS (banda de celular -23.8)
- **Fuente:** "Ambiguity", itinerantmonk108, https://freesound.org/people/itinerantmonk108/sounds/686210
- **Licencia:** CC0 1.0
- **Por qué:** 2.ª de 10 guitarras con "dark tense suspenseful music with a brooding reverb electric guitar over a low drone" (z +3.9, strong; suena a "a bass guitar" z +3.6). Mismo suspenso oscuro y lento que VISTA, pero con guitarra y bajo en vez de pad y tambores: coseno 0.54 con VISTA, 0.59 con MAJESTIC y 0.56 con MEXI (las más lejanas de todas). La 1.ª ("Ambiguity-Guitar", 711610) es la pista de guitarra sola de esta misma pieza (coseno 0.92) y queda más vacía.
- **Edición:** pasa-altos 40 Hz, low shelf -3 dB en 150 Hz, dynaudnorm suave y compresor 2:1 (ataque 200 ms), +2.5 dB. Ventanas de 4 s p10/p90 -26.1/-22.6, LRA 4.5 LU en la banda de celular (la guitarra respira entre frases; no tiene huecos mudos).

## calida.mp3: 270 s, -12.7 LUFS (banda de celular -17.0)
- **Fuente:** "Slowly Evolving Guitar Ambient Soundscape in C Major", bassimat, https://freesound.org/people/bassimat/sounds/877547
- **Licencia:** CC0 1.0
- **Por qué:** 2.ª de 17 con "warm tender emotional romantic music with a soft clean electric guitar and ambient pads" (z +3.0); guitarra ambiental con pads, muy pareja (LRA 1.5 LU). Distinta de las cálidas de las otras marcas (coseno 0.52 VISTA, 0.52 MAJESTIC, 0.30 MEXI). realness p_real 0.72 (dudoso: guitarra muy procesada, ninguna ventana sale sintetizada).
- **Edición:** pasa-altos 50 Hz y low shelf -10 dB en 200 Hz (venía cargada de graves), +6.3 dB.

## revelacion.mp3: 4 s
- **Fuente:** "Hard Cinematic Hit", Vendarro, https://freesound.org/people/Vendarro/sounds/328448 (de la librería sound-layer)
- **Licencia:** CC0 1.0
- **Por qué:** 4.º de 301 golpes con "a single dramatic cinematic hit with deep boom and a long dark tail" (z +4.2, strong); los tres primeros ya los usan MAJESTIC y MEXI.

## boom.mp3 y boom/hit.mp3: 4 s
- **Fuente:** "Cinematic Impact", Rizzard, https://freesound.org/people/Rizzard/sounds/559387 (sound-layer)
- **Licencia:** CC0 1.0
- **Por qué:** 6.º de 301 con la misma búsqueda (z +4.1). boom/hit.mp3 es el golpe grave del final en edit.py (nivelado a -22.9 LUFS, como el 701308 de VISTA); boom.mp3 es el mismo golpe más fuerte.
