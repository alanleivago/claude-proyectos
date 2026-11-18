---
type: research
status: active
tags: [gta6, estilo, key-art, parallax, referencia, instagram]
relatedTo: [styles/gta6/STYLE.md, pieces/gta6-look]
---
# Reel de referencia: "GTA-style VOX animation" (sanji.chien)

- Link: https://www.instagram.com/reel/Dfq_-rXgymT/ (bajado con yt-dlp, sin bloqueo). Archivo: `reel/reel.mp4` + `reel/reel.info.json`.
- Autor: Sanjar Nai-Chien (@sanji.chien), 465 likes al 2026-11-13.
- **Tema real:** es un **anuncio de Higgsfield MCP + Claude** ("comentá VOX y te mando el skill"). El arte GTA es el gancho visual de los primeros 8 s y vuelve como "resultado" en 21–24 s. El resto es el creador hablando a cámara, capturas de Claude y placas de oferta de Higgsfield.
- Los personajes del gancho son el parecido de una persona real (CEO tech) + una mujer, y después dos personajes al estilo de los protagonistas de GTA VI. **Nosotros no copiamos caras reales ni personajes de Rockstar.**

## Formato
- 9:16, 1080×1920, 25 fps de contenedor, 56,9 s. Audio AAC, master a **-14,1 LUFS**.
- **El movimiento del arte GTA va "en dos":** medí la diferencia entre cuadros consecutivos en 0–8 s y los cuadros impares son casi iguales al anterior (diff ≈ 0,1–0,6 contra 3–40 en los pares). O sea, la imagen cambia **cada 2 cuadros = 12,5 fps escalonado**, **incluida la cámara** (el push-in también va a saltos). Sólo el encogimiento a pantalla partida (7,1–8,2 s) va suave a 25 fps.
- Textura: el arte tiene **trama de puntos de imprenta (halftone) + grano de papel** encima de todo, con look de impreso desteñido por el sol.

## Lista de planos (gancho GTA)
| Tiempo | Qué pasa | Cámara / capas |
|---|---|---|
| 0,00–0,80 | Pareja frente a un skyline al atardecer (cielo rosa→naranja). Entran **hojas de palmera en silueta lila desde arriba** y **billetes de 100 volando desde abajo**. | Push-in fuerte con ease-out (≈ +10 %), a saltos. Cada capa entra a distinta velocidad: parallax por profundidad. |
| 0,3–3,3 | Título "LOOK AT THIS" en letras gruesas blancas con borde negro, tipo Pricedown, + **sticker amarillo "Vox"** que entra con pop. | Deriva lenta, capas respirando. |
| 3,3 | El título se disuelve; subtítulo karaoke chico, blanco con caja gris, abajo-centro ("SEE IT?", "NOW"). | — |
| 4,0–4,8 | **Cambio de fondo:** la capa de palmeras/cielo rosa sale **hacia arriba**, un fondo nuevo (skyline turquesa con helicóptero) **sube desde abajo** por capas escalonadas. Los personajes quedan quietos. Una barra de prompt falsa escribe "Change the background". | Push suave después del cambio. |
| 6,0–6,8 | **Cambio de personajes:** un hombre con pistola **entra empujando desde la izquierda** y saca a la pareja por la derecha; la mujer nueva entra 3–4 cuadros después, también desde la izquierda, detrás. "Put another people". | Slide horizontal a saltos, con overshoot leve. |
| 7,1–8,2 | El plano GTA se encoge y queda arriba; el creador aparece abajo (pantalla partida) y después corte a él. | Único movimiento suave (en uno). |
| 21,0–24,0 | Vuelve la secuencia GTA como "resultado" (pareja → swap fondo → swap personajes), mismos movimientos. | Igual que arriba. |

Resto (8,3–56,9 s): talking head con micro (subtítulos de una o dos palabras en mayúsculas, centro-abajo), insertos Vox/After Effects, capturas de Claude, placas "UP TO -60% OFF", logos de modelos de video. Corte cada 1–2 s.

## Sonido y voz
- **Hay narración** (el creador, inglés, ritmo rápido de anuncio). Guion reconstruido de los subtítulos quemados: "Look at this… see it? Now watch that prompt bar. Change the background. Put another people. Now normally Vox-style explainers take dozens of hours in After Effects. But today you can generate and edit entire Vox sequences straight inside of Claude using the Higgsfield MCP…" y termina con "comment VOX… send this to a creator who's still keyframing by hand".
- Música de fondo de anuncio por debajo de la voz; whooshes en los swaps. Master -14 LUFS.
- Whisper local no está instalado en esta Mac (`.venv` sin `whisper`) y VoiceStudio rechaza rutas (sin `OMNIVOICE_MCP_BASE_PATH`), así que el guion sale de los subtítulos, que son palabra por palabra.

## Paleta medida (median-cut, 10 colores)
- Atardecer: `#EC797D` salmón-rosa (23 %), `#D76364`, `#A0607B` malva, `#6C4969` lila oscuro (siluetas de palmera), `#422734` sombras, `#E7C2B3` y `#D2A192` pieles/arena.
- Turquesa: `#8CAABA` cielo, `#D4D1CC` blancos, `#A78C9C` lavanda edificios, `#211E26` tinta.

## Qué tomamos para nuestro estilo
1. Capas separadas (fondo, skyline, personaje, frente de palmeras, frente de billetes) con parallax por profundidad.
2. Todo a 12 fps escalonado; push-in con ease-out al abrir cada plano.
3. Transiciones de la ref: **swap de fondo** (sale arriba / entra de abajo, escalonado) y **swap de personaje** (entra empujando desde la izquierda).
4. Título propio grueso con borde negro + sticker amarillo; subtítulos chicos abajo.
5. Trama halftone + grano encima, gradientes rosa→naranja o turquesa→lavanda.

Lo que no tomamos: caras reales, logos de Rockstar/GTA, tipografía Pricedown, el formato anuncio-talking-head.

## Refs oficiales de GTA VI (`refs/`, 12 imágenes)
Bajadas de gta.wiki (copias del arte oficial de Rockstar, 3840×2160): Cal Hampton, Boobie Ike, Dre'Quan Priest, Real Dimez, Raul Bautista, Brian Heder, Jason & Lucia (3 y motel), arte del Trailer 1, Vice City BG, Leonida Keys BG y el fondo de Real Dimez. Hoja: `refs_sheet.jpg`; detalle de caras: `frames/ref_detail.jpg`. **Solo como referencia de estilo, no se publican.**

Rasgos de render (vistos de cerca):
- Proporciones y caras semirrealistas: anatomía real, asimetría, arrugas, poros, barba de días, vello en antebrazos, tatuajes, manos realistas.
- Contorno oscuro fino, más grueso en la silueta; el interior de la cara se modela con líneas pintadas finas, sin rayado de cómic.
- Luz en formas duras posterizadas: la piel y la tela al sol quedan crema-amarillo pálido; las sombras van rosa-magenta-violeta; borde cian en el lado en sombra.
- El personaje está más saturado y contrastado que el fondo; el fondo es bruma pastel (lavanda, menta, durazno, cian) con gradientes aerografiados.
- Composición: corte a pecho/cintura, cámara baja, gran angular leve, objetos en primer plano (mesa, botellas, mapa, capó), el personaje se inclina hacia la cámara.
- Expresiones: frías, aburridas, de "no me impresionás", a mitad de frase.
- Las refs oficiales no tienen halftone; lo agrega el reel.
