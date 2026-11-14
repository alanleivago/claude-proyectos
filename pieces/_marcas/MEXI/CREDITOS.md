# Música: MEXI STORIES (paleta de piano y violín; la tensión es de cuerdas y timbales desde el 2026-11-06)

Todo es CC0 1.0 (dominio público): uso comercial sin dar crédito en el video. Igual queda anotado el autor.
Las pistas largas son previews HQ mp3 de Freesound (vía Openverse, filtro cc0). Las elegí con earshot (rank + describe + realness + compare) entre 121 candidatas de tensión y 61 cálidas, comparadas con la tensión de VISTA.
Los archivos del kit van nivelados a los de VISTA (tension -22.3 LUFS, calida -15.6 LUFS), así edit.py usa las mismas ganancias.

## tension.mp3: 141 s, -20.4 LUFS (banda de celular -23.8) (reemplazada el 2026-11-06)
- **Fuente:** "villian-monologue-ian-mulloy-music", ian111, https://freesound.org/people/ian111/sounds/673334
- **Licencia:** CC0 1.0
- **Por qué se cambió:** al usuario no lo convencía la anterior (Magmi.Soundtracks 478255, guardada en `_anterior/tension_2026-11-05.mp3`; el original sin nivelar en `_anterior/tension_2026-11-04.mp3`): piano atmosférico, poco de telenovela.
- **Por qué esta:** 3.ª de 20 con "dramatic soap opera suspense music with ominous strings, a pulsing low end and suspense hits" (z +3.7, strong). Ánimo "dark and tense" z +3.4; AudioSet: timbales 0.55, scary music 0.43; cuerdas de villano sobre timbales que laten, con golpes graves. Coseno 0.69 con VISTA, 0.75 con la nueva de MAJESTIC (cuerdas sostenidas y timbal, mono; la de MAJESTIC es pizzicato ancho) y 0.56 con SINMARCA. Las de piano (szegvari 609755 y otras) salían parecidas a la anterior de MEXI o sin match.
- **Edición:** los primeros 34 s del original son casi solo timbal (en la banda de celular a -43 LUFS: no se oiría en el teléfono), así que uso 38-77 s cuatro veces con fundidos cruzados de 5 s (141 s, sin hueco), pasa-altos 45 Hz, low shelf -9 dB en 170 Hz (venía muy cargada de graves), dynaudnorm suave y compresor 2:1, +5.3 dB. Banda de celular -23.8 LUFS, ventanas de 4 s p10/p90 -26.9/-21.9, LRA 4.9 LU (crece dentro de cada vuelta).
## calida.mp3: 90 s, -15.6 LUFS
- **Fuente:** "Nostalgic Childhood - Grand Piano.mp3", akirawakira, https://freesound.org/people/akirawakira/sounds/488683
- **Licencia:** CC0 1.0
- **Por qué:** 5.ª de 61 con "tender romantic melancholic emotional music, soft piano or strings, warm and heartfelt" (z +4.2); match "tender warm nostalgic solo piano ballad" z +4.3 (88 % frente a suspenso, piano infantil y triste). LRA 3.5 LU. p_real 0.90.

## revelacion.mp3: 4 s
- **Fuente:** "Braam", unfa, https://freesound.org/people/unfa/sounds/647712 (de la librería sound-layer)
- **Licencia:** CC0 1.0
- **Por qué:** 9.º de 301 golpes con "a single dramatic cinematic orchestral hit with deep boom and a long dark tail" (z +3.5, strong); braam de metales, distinto del golpe orquestal de VISTA y del de MAJESTIC.

## boom.mp3 y boom/hit.mp3: 3.8 s
- **Fuente:** "Cold Cave A.mp3", DJmastah, https://freesound.org/people/DJmastah/sounds/130855 (sound-layer)
- **Licencia:** CC0 1.0
- **Por qué:** 6.º de 301 con la misma búsqueda (z +3.6; suena a "a big drum hit" z +4.2). boom/hit.mp3 es el golpe grave del final en edit.py (nivelado a -22.8 LUFS como el 701308 de VISTA); boom.mp3 es el mismo golpe más fuerte.
