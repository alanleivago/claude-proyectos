---
type: style
status: active
tags: [ali-abdaal, docucollage, motion-graphics, talking-head, editorial-collage, typewriter-title, karaoke-captions, stimulus, hyperframes, vertical]
relatedTo: [styles/docucollage/CATALOGO.md, styles/docucollage/kit.js, styles/docucollage/ref_frames, fuentes/docucollage, pieces/docucollage-test, styles/stimulus/ESTILO.md]
---

> **Nombre del estilo: ALI ABDAAL** (antes "docucollage"). APROBADO 2026-11-11, nivel mínimo = pieces/docucollage-test/renders/docucollage-v3c-final.mp4. Cada detalle de este archivo es una regla.


# docucollage: explainer de psicología con collage editorial (vertical)

Referencia: 4 reels de IG del mismo creador. Son explainers de psicología o autoayuda: un presentador habla a cámara y entre frases aparece un collage editorial.

| Apodo | Reel | Tema | Duración | Fuente |
|---|---|---|---|---|
| GOLD | DIV6ZPFIx3y | Gold Medal Syndrome | 54.7 s | 608×1080 |
| JAM | DHt949poQGJ | Paradox of choice (jam jar) | 59.5 s | 720×1280 |
| DK | DHgssOYoF6v | Dunning-Kruger | 56.7 s | 1080×1920 |
| ARR | DF0jP-vIYlk | Arrival fallacy | 59.2 s | 608×1080 |

Los cuatro están a 25 fps y se descargaron con yt-dlp. Para 3 de ellos IG solo sirve 608p o 720p, y con cookies no se pudo, porque Chrome bloquea la base de cookies.

Material en `fuentes/docucollage/`:
- `reels/<id>/`: reel.mp4, words.json (Whisper), scenes.txt, diffs.json (diferencia por frame), earshot_timeline.txt y framelevel/w_*.md.
- El análisis por la API cubre el 100 % de los frames, uno de cada dos (12.5 fps), en ventanas de 7.2 s.
- `CATALOGO_api.md` es la síntesis de las 33 ventanas. `shots_all.json` tiene los 155 planos clasificados.
- Los scripts están en `fuentes/docucollage/tools/`: transcribe, cuts, fps, framelevel, catalog, fontsheet.

## Medidas

### FPS de los gráficos: 10 fps
- Patrón de diferencias entre frames en todos los tramos de gráficos y collage de los 4 reels: `x__x_x__x_` (hay cambio cada 3, 2, 3, 2 frames a 25 fps). Eso da 10 imágenes únicas por segundo.
- El talking head y el metraje van a 25 fps.
- Frames únicos por segundo: 10-15 en gráficos (10 más el movimiento del video de fondo) y 24-25 en talking head.
- Réplica: render a 30 fps. Los gráficos van en `tlg`, buscado a `floor(t*10)/10`, así que cambian cada 3 frames.
  - El talking head, los push-ins sobre el video, las cutouts del host y los subtítulos van suaves en `tl`.

### Ritmo
- 155 planos en 230 s: 40 planos por minuto, con una media de 1.48 s.
- Reparto del tiempo en pantalla:
  - talking head 41 %;
  - host recortado sobre un fondo diseñado 20 %;
  - foto o collage 37 %;
  - transiciones 2 % del tiempo (14 % de los planos, de 0.1 a 0.5 s cada una).
- Hay un evento visual cada 2-3 s.
- Los títulos se adelantan a la palabra entre 0.1 y 0.6 s.
- Transiciones en los ~154 bordes de plano:

| Transición | Peso |
|---|---|
| Corte seco o jump cut | ~65 % |
| Blur-in o disolvencia | ~15 % |
| Papel rasgado | ~7 % (es la firma del estilo: 48 % de los planos de transición) |
| Slide, push o círculo | ~5 % |
| Host que sube o baja | ~5 % |
| Wipes orgánicos (quemado, sangre, croma) | ~3 % |

### Subtítulos (siempre encima de todo)
- Píldora crema #FDF9ED de 103 px de alto, radio 16 y padding lateral de 42 px. El ancho se ajusta al texto. Centro en y=1390 (72 %).
- Texto en Poppins Bold de 54 px, en minúsculas de oración.
- Karaoke de 3 estados, con cambio seco:
  - palabra que viene: #CFCAC0;
  - palabra que se está diciendo: #3C3830;
  - palabra ya dicha: #000.
- Bloques de 2-4 palabras. El cambio de bloque es seco y la píldora se redimensiona al instante, 0.1 s antes de la primera palabra.
- Variantes de los reels: JAM y ARR usan píldora blanca con la palabra que viene en #A8A8A8. GOLD tiene la píldora en y=47 % hasta los 23 s.

### Títulos
Dos líneas tecleadas letra por letra. La línea grande va detrás de la cabeza del host.
- **Línea 1 (etiqueta):** Bebas Neue con tracking 0.2em, de 74-96 px, en crema #EFE7D8 o dorado #EBCB86. Se teclea a 2.5-3 caracteres por paso (25-30 cps).
- **Línea 2 (héroe):** Lora Bold en mayúsculas, de 130-236 px.
  - Degradado dorado #F6DA92 → #E2B566 → #B9853A.
  - Sombra dura de 4/5 px en rgba(20,12,6,.55).
  - Se teclea a 1 carácter por paso (10 cps).
  - La letra nueva aparece al 45 % de opacidad durante un paso y luego al 100 %.
- **Variantes:**
  - crema #EFE7D8 (nombres);
  - amarillo #F2DE2E (tarjetas JAM);
  - rojo #E8321F con Montserrat ExtraBold (ARR);
  - años y cifras en Montserrat ExtraBold dorado, construidos dígito a dígito con el nuevo al 30 %.
- **Mono typewriter:** Courier Prime Bold amarillo #F2E04A, alineado a la izquierda en x=84, de 56-66 px, a 20-25 cps.
  - Se usa en definiciones, etiquetas de lista y la cita final.
  - Lleva detrás un degradado oscuro arriba: #0A0A0A al 62 % → 0, 430 px de alto, que entra en 0.3 s.
- **Marcas a mano:** Gaegu Bold y trazos rojos #D8232A de 9-18 px que se dibujan en 0.2-0.4 s (stroke-dashoffset).
- Todo el texto va entre y=168 y y=1330, y como mucho hasta x=940. Los títulos centrados miden ≤800 px.

### Fuentes elegidas
Hojas comparativas en `fuentes/docucollage/_crops/fs_*.jpg`. Las fuentes de la pieza están en `pieces/docucollage-test/assets/fonts`.

| Rol | Reel | Nuestra | Origen |
|---|---|---|---|
| Etiqueta condensada | grotesca condensada con mucho tracking | Bebas Neue | biblioteca del usuario (`Fuentes/bebas_neue`) |
| Serif héroe | serif bold ancha, contraste medio | Lora Bold | biblioteca del usuario |
| Sans pesada (Jane, FALLACY, 2006) | geométrica extra bold | Montserrat ExtraBold | biblioteca del usuario |
| Máquina de escribir | slab mono bold | Courier Prime Bold | Google Fonts (OFL) |
| Mano / marcador | rotulador fino | Gaegu Bold | Google Fonts (OFL) |
| Subtítulos | geométrica bold | Poppins Bold | Google Fonts (OFL) |

Descartadas para la serif: Playfair, DM Serif Display, Abril, Old Standard, Rozha, Gloock, Newsreader, Source Serif, Frank Ruhl, Georgia y Times.

### Color
- Cada reel usa fotos B/N o sepia con tramado más **un** color de acento.
- Fondos con degradado y tramado de puntos (pitch de 7 px, rotado 45°, al 26 %), más viñeta. Las paletas están en CATALOGO.md, "Palettes per reel".
- Usadas en la prueba:

| Uso | Colores |
|---|---|
| Granate | #2E2224 → #7A5558, con sol rojo #D42A30 |
| Granate del documento | #6E3A3A → #4E2628 |
| Navy | #0E2038 → #2F5B8C |
| Morado (tarjeta de título) | #5547A6 → #3B2F86 |
| Atardecer | #0E1526 → #D9722E |
| Azul (cita) | #4F6EB8 → #1F3A85 |
| Papel rasgado | #7A3340, #5547A6, #0F2038, #3C6C9E |

- Tratamiento de fotos (`prep/assets.py`, función `treat`):
  - gris con contraste ×1.15-1.3;
  - trama de puntos AM a 45°, de 6 px a tamaño final, mezclada al 42 %;
  - duotono: B/N #141414/#F0F0EE, sepia #2A1C12/#F1E4CC, teal #13272A/#CFE2DC.
  - Las fotos de familia "de los 80" van en color desvaído.

### Movimiento (pasos a 10 fps)
| Elemento | Movimiento |
|---|---|
| Cutout que sube | 4-5 pasos, power3.out, sin rebote |
| Host que sube (pop-up) | 4 pasos, escala 1→1.42 desde abajo, back.out(1.2) |
| Host que baja (sink) | 4-5 pasos, power2.in |
| Prop pop | 2 pasos, escala 0.4→1 con back.out(1.8) |
| Prop que cae | 2 pasos más un rebote de 16 px |
| Zoom escalonado a un detalle | 4 pasos, 1→1.4, power2.inOut |
| Push de fondo | 4 %/s; 8-12 %/s en stills de ≤1 s |
| Salida con zoom | 3 pasos a ×1.34, power2.in |
| Blur-in | copia pre-borrosa (gblur 22-24) que se desvanece en 2 pasos |
| Círculo | círculo de 0→36 % en 1 paso; llena el cuadro en 2 pasos más |
| Papel rasgado | 3 pasos: franja en el centro (y 640-1440) → sube hasta arriba → cuadro lleno |

- El papel rasgado tiene bordes dentados, borde blanco de fibra #F2EEE4 de 7 px y sombra de 8/10 px. El color del papel es el del fondo de la escena siguiente.
- Tile de app: aparece seco. El contorno lima #C6F200 de 9 px se dibuja en 0.7 s y al cerrarse suena un clic.
- Push-ins del talking head (suaves): de 1.0 a 1.05-1.07 por plano. Los jump cuts empiezan en 1.08-1.14.

### Sonido (earshot timeline de los 4 reels)
- **Mezcla:** -14.3 a -14.5 LUFS, LRA 1.8-2.3 LU, pico real de -0.2 a -0.7 dBTP.
  - El 88-97 % de los cortes tiene un onset a ≤100 ms y la mediana del desfase es de 30-43 ms.
- **Música:** cama baja de corporate o tech house "confident & cool" con vocal chops, sin un pulso claro (pulse clarity 0.04-0.06).
- **SFX** escasos y ligados a eventos:

| Evento | SFX |
|---|---|
| Elemento que aparece | bubble pop (GOLD 7.38, 10.26, 17.36, 21.94; DK 38.4, 48.48; ARR 39.97) |
| Transición | whip whoosh (DK 5.70, 54.80; ARR 37.57) |
| Antes de una revelación | uplifter (DK 17.12, 53.07) |
| Algunos cortes | golpe seco (JAM 36.70; ARR 21.48) |
| Título tecleado | teclas (AST "typing" en ARR 0-14 s y en la cita de JAM 52-59 s) |
| Ícono de app | chat pop (JAM 10.08) |

- **Prueba:**
  - Voz del raw con afftdn 18, agate, compresor y -15 LUFS.
  - Música: "A La Mode" (background vocals) de Matt Wigton, de la biblioteca del usuario (Audios musica UPBEAT), a 0.11. Es la más cercana a la música del reel según earshot compare entre 9 candidatas.
  - SFX:
    - pops y whooshes de f1motion;
    - teclas `sound-layer/kit/key` (539146, 348238);
    - rasgado Freesound 170311 (CC0);
    - rotulador Freesound 257518 (CC0);
    - golpe `kit/hit` 710368;
    - clic y riser.

## Reglas de construcción
- **Todo lo que tenga pinta de objeto o foto** se genera en Google Flow (MCP srz-google-flow-mcp, Nano Banana Pro) con recortes del reel como referencia de estilo (`pieces/docucollage-test/flow/ref`), y luego se recorta con rembg birefnet-general:
  - personas vintage, documentos, vales, camisetas, chaqueta, dinero, tienda, campo y familia.
- **Código:** títulos, píldoras, papel rasgado, tramado, sol, barras de censura, marcas a mano, tiles, toggles y movimiento.
- **Personas que no son el host:** llevan barra de censura negra sobre los ojos, dentro de la capa de la foto para que siga el push. Tamaño ≈ ancho de cara × 18 %.
- **Host recortado:** se usa `cutout.webm` (el matte del raw). Si va en sepia, se hace con ffmpeg (`cutout_sep.webm`), nunca con filtros CSS.
- **Cutout delante del título:** el host va en z 20 sobre la escena (z 10-13).
  - Si el fondo es la sala real con el neón de Stimulus, se oscurece con `.dim` (#08080A del 72 % al 25 %) para que el título se lea.
- **Contrato de HyperFrames:** los `<video>` van en wrappers a nivel raíz, nunca dentro de un div con data-start.

## Correcciones de las rondas de revisión (prueba)
- **Matte del host:** el `cutout.webm` del raw perdía el balón y dejaba restos de silla.
  - `prep/fix_matte.py` detecta el balón con Hough en edit.mp4 y lo devuelve con sus colores reales.
  - Se queda con el componente conexo mayor, borra la zona y>1530 & x<440 y recorta el borde inferior en suave (y 1580-1660).
  - Salen `cutout_fix.webm` y `cutout_fix_sep.webm`.
- **Títulos fuera del push:** van en una capa `over` fija de la escena, debajo del host (z20). Así no crecen ni pasan de x 940 con los zooms.
  - En el reel a veces el título viaja con el zoom de salida. Aquí no se hace, por la zona segura.
- **Etiqueta mono:** sale hacia arriba en 2 pasos cuando la cámara hace zoom sobre papel claro, para no quedar ilegible.
- **Todo personaje que no sea el host lleva barra:** también el vendedor y el entrenador.
- **Foto familiar en color selectivo, como GOLD 8.8:** personas en color (máscara rembg) y fondo B/N con trama. Se escala ×1.4 para que las caras queden bajo el título y la foto cubra el cuadro.
- **Tarjeta de título amarilla (variante JAM):** Lora en amarillo #F2DE2E con sombra dura, ≤860 px. No lleva degradado dorado.
- **Sol:** su borde superior va a la altura de la cabeza del sujeto (DK 10.96-14.4), no centrado en la cabeza.
- **Props:** nunca encima de la cara del host. Los colores de la grilla deben contrastar con el fondo (en vez de morado sobre morado, amarillo).
- **El cartel del vendedor** debe quedar por encima de la píldora de subtítulos (y < 1330).

## Pieza de prueba
`pieces/docucollage-test`, sobre el raw stimulus-01 ("$5,000 en crédito de tienda"). Ver CATALOGO.md para los tipos.
- **Resultado:** v9 enviada (2026-11-10).
  - `tools/revisar_render.py --estilo docucollage`: NO LISTO → CASI → CASI. Los menores del último informe se corrigieron en v9.
  - earshot critique: launch-grade, 22/23 en el pase completo. El único fallo menor es la mezcla casi mono (voz mono y música estrecha).
  - Sincronía: el 92-93 % de los eventos visuales tiene un onset a ≤100 ms (el reel da 88-97 %).
  - Cadencia medida en el render: `x__` (10 fps) en los gráficos.
- **Comparaciones lado a lado:** `pieces/docucollage-test/review/cmp_*.jpg` (render a la izquierda, reel a la derecha).

## v2 (2026-11-10): rebuild sobre el reel 1 con el feedback del usuario. MANDA sobre lo anterior
- **Referencia única:** reel 1 (Ali Abdaal, "Gold Medal Syndrome").
  - La copia 1080p se bajó de YouTube (`alLf0hN5JsQ`) a `fuentes/docucollage/reels/DIV6ZPFIx3y/reel1080.mp4`.
  - Análisis cuadro a cuadro de todos los frames en `REEL1_FRAME_ANALISIS.md`.
  - Los 21 favoritos del usuario están en `ref_frames/user_favs/`.
- **Medidas clave (código):**
  - cadencia de gráficos 10 poses/s; se usan **12 fps** por pedido del usuario;
  - wiggle por letra: offset std ~3 px x / 2 px y, rotación std 1.6°, pose nueva cada paso en el 76-94 % de las letras;
  - shine: ~970-1100 px/s, una pasada, banda de 150-250 px, al terminar el tipeo;
  - sombra del título: +10/+9 px #422F1A;
  - nitidez tras los cortes: 0.03-0.37 de lo normal, se recupera en 4-8 frames;
  - push: +1.2…+5.8 %/s; burst del podio ×1.28 en 5 pasos.
- **Fuentes de título:** Bebas Neue (+2 px de stroke, tracking .2em) y Besley 900 para TODOS los títulos, números incluidos.
  - Mano: Covered By Your Grace, solo para marcas.
  - Poppins Bold solo en subtítulos (44 px, píldora de 86 px).
- **Host:**
  - encuadre grande (`th_big.mp4`, crop 654×1164 desde (273, 690), ×1.65);
  - recortado abajo delante de una escena completa con el título detrás (fav 1/2);
  - o sube sobre una foto y la foto se disuelve al TH;
  - nunca solo sobre un fondo gráfico; nunca teñido.
- **Composiciones de la prueba v2** (`prep/gen2.py`):
  - host abajo + vestuario + título;
  - vendedor de cuerpo entero (barra con landmarks) que evoluciona: el cheque hace pop detrás de la cabeza, como los aros;
  - documento + lupa + zoom + círculo;
  - vidriera + cadena con candado (péndulo) + chaqueta;
  - caja registradora + billetes volando;
  - TH con título detrás de la cabeza que cae letra por letra;
  - dos camisetas colgadas + tachado + "less!";
  - perchero + etiquetas "+$" en péndulo + burst de zoom;
  - familia en color selectivo con capa de personas en parallax;
  - host que sube y se disuelve al TH;
  - bolso con lluvia de billetes + vale roto en dos;
  - montaje B/N con rack-focus;
  - campeones con capa de chicos en parallax + burst;
  - termómetro de recaudación que se llena + título serif apilado.
- **Revisión v2:** 3 rondas.
  - `revisar_render`: NO LISTO → NO LISTO → NO LISTO, con cada vez menos fallos y más leves. Ya no quedan problemas de títulos, matte, tinte ni host solo; el resto eran detalles de posición de la píldora, barras de perfil y un billete repetido, corregidos en v2g.
  - earshot: launch-grade (20/21 en el pase rápido; la mezcla es casi mono).
- **Enviado a Telegram:** v2g, 2026-11-10.

## v3b (2026-11-11): reglas generales del usuario. MANDAN sobre lo anterior
Storyboard en `pieces/docucollage-test/storyboard/v3b/`, código en `prep/board3b.py` (escenas como funciones de t: el board y la prueba en video salen del mismo código) y `prep/assets3b.py`.
- **Todo por capas, nunca una foto entera de fondo.** Fondo plano (color + brillo) como capa propia, escenario (casas, piso, gradas, banco) en otra y personaje en otra, cada una con su movimiento.
  - Parallax medido en la ref: título 1.4-1.5x (o fijo en la zona segura), sujeto 1.0, escenario 0.45-0.6, fondo 0.15-0.3, primer plano (gradas/espectadores) 1.5x.
  - ARR Jane: la mujer sube desde +620 px (decay 0.62 por paso) y crece 0.8→1.0; la mansión sube 180 px a la vez y luego queda casi quieta (±10 px).
  - GOLD P20: ráfaga +3/+7/+6/+3/+5 % en 5 pasos; el estadio recibe el 45 % del zoom.
  - GOLD P10: entra a x1.3 con pan 186 px y blur 12/8/4/1.5, asienta en 5 pasos y luego pull-out -2.4 %/s.
  - JAM P53: la cabeza a color es una capa aparte sobre el cuerpo B/N y se mueve sola (±3.5° de inclinación, ±10-25 px).
- **Grunge encima de casi todos los planos de motion graphics**: textura de papel del usuario (`Overlays/scracth bueno que cambia.mp4`) × motas (`Overlays/grunge 1.mp4` invertido), en multiply al 22-32 %. Cambia cada 2 pasos y deriva 36 px/s. Va debajo del host y de la píldora. Frames en `assets/grunge/g_###.png`.
- **Fondos con brillo blanco suave** en el centro, un poco arriba o a la izquierda (S19). Es una elipse con smoothstep en ambos extremos (sin borde visible), al 8-17 % (sol de S18: 55 %), con dither para que no haya banding. Puede oscurecerse hacia un lado (S19: -38 % a la derecha).
- **Fades a negro u oscuro siempre con mucho feather**: smoothstep^1.5-1.8 a lo largo de 640-1000 px, nunca un degradado lineal corto. Fade inferior de S22: 42 % máximo.
- **Halftone solo donde la ref lo tiene.** Puntos claros sobre fondos oscuros (navy, rojo, granate) y oscuros sobre fondos claros (cielo). Pitch 11-17 px a 1080 (el de 7 px era demasiado fino).
  - Lo tienen S06, S10, S13, S14, S15, S16, S17, S18, S19 y la pista B/N de S12.
  - No lo tienen S01, S07, S08, S11, S22 ni S24.
- **Recortes:** nunca se ve el borde de un recorte. Lo que toca un borde de su imagen fuente tiene que seguir fuera del cuadro durante todo el movimiento.
  - S01: cabeza y lado derecho siempre fuera.
  - S08: el brazo termina 340 px fuera.
  - S11: los pies nunca entran.
  - S07: el cuerpo termina detrás del mostrador.
  - S24: la cuerda va a un piton y cuelga fuera del borde inferior.
- **Títulos apilados juntos**: cada línea se apila por su caja de tinta. Hueco = 0.09 × cap (0.12-0.15 donde la ref es más suelta: S24, S11, S16).
  - Medido en la ref: 8-14 px (SYNDROME, CLIMB) y 29-30 px (MEDAL, DREAM). En v3 eran 37-86 px.
- **Grosor de la serif:** EB Garamond 800 + stroke del mismo color de round(size × 0.013) px (2 px a 150, 3 px a 230). Comparado con SYNDROME en `storyboard/v3b/font_weight_compare.jpg`. Bebas lleva +2 px.
- **Palabras héroe grandes**: llenan 930-990 px de ancho cuando hay margen (la ref llega a 930-967 px). Ejemplos: COMPANY, PRICE, YOUR CLUB, COACHES (240 px), NEEDS (~330 px), CASH, FREEDOM.
- **El color sigue al texto, no a la ref:** si la ref es triste (cielo rojo de LOST) y nuestra frase no lo es, se copian la composición y la técnica con otra paleta. S18 usa amanecer dorado, barrio con ventanas encendidas y silueta navy con borde dorado.

## v3c (2026-11-11): valores finales aprobados. MANDAN sobre v3b
Storyboard en `pieces/docucollage-test/storyboard/v3c/`, código en `prep/board3c.py`.
- **Wiggle del título (aprobado en title_test_v3b, vuelto a poner):** ruido suave Catmull-Rom por letra, 3.5 poses clave por segundo, 60 % de amplitud.
  - x = 0.6 × 0.029 × h y y = 0.6 × 0.055 × h, con h = 0.70 × tamaño de la fuente.
  - Solo posición, muestreado a 12 fps. Es la función `wiggle_xy` (mismo hash que `wiggle_test.html`).
  - Medido: desviación de 2.3/4.4 px y salto medio de 0.9/1.6 px por paso a 230 px. NO usar una pose aleatoria nueva en cada paso: eso es el wiggle rápido rechazado.
- **Shine:** una sola pasada de blanco casi puro (95 % hacia #FFFFFF) dentro de las letras. Perfil triangular-smoothstep de ±120 px, inclinado 105°, a 1300 px/s, al terminar el tipeo.
- **Grunge:** la textura de papel × motas del usuario en multiply. La opacidad efectiva queda en 31-45 % (ganancia 1.4 sobre los valores por escena). En la pared blanca de S03/S04 baja a ~10 % para que la pared siga blanca.
- **Halftone (FFT sobre DK 28.8 s y GOLD 13 s):** trama a 30° con un pitch de 7.9 px (DK) a 9.6 px (GOLD) a 1080. Usamos 8 px en las refs de DK (S10, S17, S19) y 9 px en el resto.
  - Fusión LINEAL: el punto suma (o resta) el mismo valor en R, G y B (+34 niveles sobre navy). No es multiply.
  - Puntos claros: a = 0.09-0.10, radio 0.25 del pitch.
  - Puntos oscuros sobre cielo o teal: a = 0.14-0.17, radio 0.30.
  - Comparado con zoom 2x contra la ref.
- **S13:** el fade de arriba termina en el navy de la ref, #111B29 (medido de y 0 a 80), nunca en negro.
- **S03/S04 = un solo plano continuo, como GOLD P04:**
  - Capas: pared BLANCA codificada (#EFEAE6 → #E2DCD5, brillo arriba a la izquierda) a profundidad 0.4, piso de madera gris con zócalo blanco a 0.55, niña al 93 % con los pies en el piso a 1.0, y "$5,000" a 1.45.
  - Copia de JESSICA medida frame a frame: color #F5B814, tinta de unos 100-110 px, centro en y 206. Se escribe de izquierda a derecha a 1370 px/s desde 0.12 s, con letras parciales en cada paso, y se queda quieto.
  - Después la cámara empuja con aceleración de ×1.0 a ×1.25 en 0.64 s y el texto sale por arriba por parallax (ref y 205 → -60).
  - Luego el abanico de billetes hace pop a ×1.28 durante 2 pasos y la medalla cae al pecho.
- **S22:** la copa más abajo (arriba en y 340). CASH queda en y 190 con el borde inferior metido detrás del dinero de la copa. TO INVEST va justificado exactamente al ancho de FREEDOM (opción `fit` de `tline`).
  - Tiempos de JAM P50: CASH sube con el papel (+260/+110/+30 px), FREEDOM aparece 190 px más abajo, la copa cae en 2 pasos con un rebote de 16 px y TO INVEST se teclea a 2.5 caracteres por paso.
- **S11:** AMOUNT de 970 px de ancho, como MEDAL (cap de unos 175 px). Está bien que el ramo tape una letra.
- **S24:** roca, escalador y cuerda forman UN grupo que pasa 700 px más allá de los bordes derecho e inferior. Entra junto desde +330 px y nunca se despega del borde con el pull-out.

## Final (2026-11-11, render v3c aprobado): pipeline plantilla para los próximos reels
- **Shine final:** a mitad de camino entre v3b y v3c. Va al 75 % hacia un blanco cálido #FFF8EA, con perfil smoothstep de ±170 px inclinado 105° y la velocidad de v3c (1300 px/s). Una sola pasada, 1 paso después de terminar el tipeo.
- **Todos los títulos** se teclean con el wiggle aprobado y luego hacen el shine. En los planos cortos la velocidad de tipeo sube sola, para que el título termine al 55 % de la duración del plano (`title()` en modo CTX).
- **Ajustes finales de escena:**
  - S15: sujeto x1.45 con la cabeza justo debajo del título, que arranca en y 170.
  - S17: sujeto 80 px más arriba.
  - S13: las dos líneas se teclean (no aparecen de golpe).
  - S24 termina como la ref P34: el grupo se hunde, el título sale volando hacia arriba y "LINK IN BIO" se teclea con shine.
- **Pipeline** (`pieces/docucollage-test`, copiar la carpeta para un reel nuevo):
  1. `prep/board3c.py board`: storyboard. Las escenas son funciones de t, con boards y láminas antes/después contra la ref.
  2. `prep/board3c.py motion`: prueba lado a lado con la ref.
  3. `prep/render3c.py`: pista de GRÁFICOS a 12 fps en RGBA → `assets/gfx3c.webm` (VP9 con alpha).
     - Los planos de collage son opacos.
     - Los planos de TH son transparentes, salvo el título y la franja oscura de arriba.
     - Los planos sin movimiento propio llevan push genérico (+4.5 %) y deblur de 10/5/2 px después del corte.
     - La lista de planos es `SHOTS`.
  4. `prep/gen3.py`: `index.html` de HyperFrames. Capas: TH `th_big.mp4` (z5) → gfx (z10) → recorte del host `cutout_big.webm` (z20: host abajo en S01-S02, delante del título en los TH, subida en S20) → píldora karaoke (z80, y por plano) → outro (z90).
     - Audio: voz 1.0, música 0.11 y SFX en los eventos (teclas en cada tipeo, pop, whoosh, rip, hit, shimmer en los shines).
  5. `npx --yes hyperframes@0.9.16 check`, luego `render`, luego `python tools/revisar_render.py --estilo docucollage <mp4>`, luego earshot (mezcla ~-14 LUFS).
- **Encuadres del TH:**
  - TH simple: `th_big.mp4` + `cutout_big.webm`.
  - TH con el título detrás de la cabeza: el encuadre "ancho" del board = `edit.mp4` recortado en (270, 548) a ×1.65. Se hace con un transform de GSAP sobre el wrapper `{x:-445.5, y:-904.2, scale:1.65, origin 0 0}`, con `cutout_fix.webm` y `th_blur.mp4` alineados.
  - La franja oscura de arriba (820 px, smoothstep) dura TODO el plano para que el neón no salte.
- **Mezcla:** HyperFrames saca -15 LUFS. Se suma +1 dB en el mux final (`ffmpeg -c:v copy -af volume=1.0dB`) → -14.0 LUFS y -0.6 dBTP.
  - earshot critique: launch-grade, 20 de 21 métricas. El único menor es la mezcla casi mono.
- **Render final v3c:** `pieces/docucollage-test/renders/docucollage-v3c-final.mp4` (copia en `pieces/Docucollage/`). Enviado a Telegram el 2026-11-11.
  - `revisar_render` marcó como fallos varias reglas del spec v1/v2 que el usuario cambió después: Besley, solo dorado, x ≤ 940, píldora solo en 900/1384, mano solo para marcas. No se tocaron.
  - Se corrigieron dos fallos reales: la barra al escalador de perfil y una cuña blanca en la roca (la textura salía de la zona de cielo de la foto).

## Regla (usuario, después de v3c-final): NUNCA corte seco entre planos de gráficos
- Cada cambio de plano de gráficos se hace capa por capa, como en la ref: lo anterior sale y lo nuevo entra desde abajo, escalonado.
  - Entrada, modelo S13/Jane: el fondo cambia en el corte.
    - El escenario sube (180-520 px, decay 0.55-0.6 por paso a 12 fps).
    - El sujeto sube 1 paso después (600-820 px, decay 0.5-0.6).
    - Los props hacen pop de a uno (escala 0.55 → 1.12 → 0.97 → 1, cada 1-1.5 pasos), con caída de 2 pasos + 16 px de rebote para objetos (jarras).
    - El título se teclea.
  - Salida, en los últimos min(0.34 s, 30 % del plano): ease-in de 100 / 560 / 1600 px por paso.
    - El título sale primero hacia arriba y el sujeto o escenario baja 1 paso después.
    - Lo que entra por un costado (brazo, banco de S02, hombre de S01) sale por ese mismo costado.
  - Con habla rápida (S01 → S02), la transición se hace corta pero escalonada: el título y el hombre salen a la izquierda en 4 pasos y el banco sube 1 paso después del cielo.
  - Excepciones (continuidad):
    - S12 → S12b es un punch-in de la misma foto.
    - S19 → S20: el collage queda congelado y el host sube encima.
    - S03 → S04 es un solo plano.
- Código: `E()`, `POP()`, `X()` y `title_x()` en `board3c.py`. Las salidas existen solo en el render final (`FINAL`), así que el board muestra el plano completo.
- **S06:** el documento baja, el lector sube, la lupa busca por la página siguiendo una trayectoria de 5 puntos y se detiene en la cláusula, y el aro rojo se dibuja en 4 pasos.
- **S14:** el balón gira a 40°/s (30 frames de `ball3d.py`). A 22.5°/s no se notaba en el render.
- **Grunge final:** la textura va centrada en su media, como soft-light, y no oscurece. Ganancia 0.4 sobre los valores por escena, apenas perceptible (±1-2 %). El usuario la bajó dos veces.
- **Sin SFX de shimmer en los shines.**
- **S20:** el host sube con un clip de alpha endurecido (`cutout_s20.webm`), para que el collage no se vea a través del balón.
- **Render final corregido** (transiciones capa por capa, S06/S08/S10/S14/S15/S18 dinámicos, grunge sutil, sin shimmer, S20 opaco): -14.0 LUFS y -0.6 dBTP.
  - earshot: launch-grade.
  - revisar_render: CASI. Lo que queda son reglas del spec viejo y frames de salida.
  - Los TH duran 0.12 s más allá de su corte, para que la pista de gráficos a 12 fps nunca deje ver negro (había 1 frame negro en 38.61).
- **S01 → S02** (ref P02, rechazado el push de tarjeta): el FONDO no se desliza, solo cambia de color hacia el cielo de S02 (crossfade de 5 pasos). Lo único que se desliza a la izquierda es el hombre + el título, con ease-in de 50/170/400/760/1300 px (el título va 1 paso adelante). El hombre es un recorte nuevo de Flow (`assets/img3b/medalman2.png`): cabeza y costados enteros en cuadro, piernas estiradas fuera del borde inferior. Así nunca se ve un borde cortado.
- **Vendedora (S07):** la costura sigue la línea REAL, trazada a mano sobre una grilla 2x: pelo sobre la camiseta en los hombros, borde interno de cada tirante y escote. Lleva antialias de ~1 px y el recorte erosionado 1 px (sin halo). El cuerpo B/N es el complemento exacto, sin piel de cuello. La capa de la cabeza lleva una falda de 10 px con los MISMOS píxeles B/N de la camiseta, invisible pero que evita huecos al inclinar (±1.8°, sin deslizar, cabeza ×1.0).
