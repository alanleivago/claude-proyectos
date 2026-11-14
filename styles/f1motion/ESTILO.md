---
type: style
status: approved
tags: [f1motion, motion-graphics, talking-head, stimulus, hyperframes, vertical]
relatedTo: [styles/f1motion/kit.js, fuentes/f1motion/ref/SPEC_api.md, fuentes/f1motion/ref/analysis, styles/stimulus/ESTILO.md, pieces/f1motion-test]
---

# f1motion: explainer collage con caras recortadas (vertical)

Referencia: reel IG `DdolSnYt_iX` ("F1 explicado", 181 s, 1080×1920, 24 fps). El original está en `fuentes/f1motion/ref/reel.mp4`.
El análisis cuadro a cuadro se hizo por la API en ventanas de 20 s a 4 fps (`fuentes/f1motion/ref/analysis/w_*.md`); la síntesis está en `SPEC_api.md`.
Las 16 capturas del usuario marcan lo que más le gusta.
Regla del usuario: copiar el lenguaje visual y el movimiento, pero sin marcas, equipos ni pilotos de F1. Todo se re-tematiza a fútbol y camisetas personalizadas (Stimulus).

## Medidas del reel

### Ritmo
- 97 planos en 181 s. Media 1.87 s, mediana 1.75 s. Ningún plano supera 3.5 s, salvo un scroll de tarjetas de 7 s.
- Reparto del tiempo:
  - Cabeza parlante (TH): 37 %.
  - Gráficos diseñados: 31 %.
  - Metraje encontrado en B/N: 32 %. Este estilo NO lo copia: con nuestro raw se reemplaza por más gráficos.
- Cada gráfico lo dispara una palabra:
  - nombre propio → cara sobre vehículo o cuerpo;
  - número o lista → cascada de filas;
  - fechas → calendario con stickers;
  - jerga → explicador pixel con pill y tab;
  - CTA o compra → tarjeta UI con cursor.

### Audio (earshot timeline, 0-60 s)
- Mezcla: -14.2 LUFS, true peak -1.6 dBTP, LRA 1.7 LU.
- Música:
  - 0-40 s: house/tech-house "confident & cool" de ~132 BPM, con vocal chops y celesta/glockenspiel.
  - Desde 40 s: corporate de pizzicato.
- Sincronía con los 57 cortes: el 63 % tiene un onset a ≤1 frame (el azar da 51 %) y el 93 % a ≤100 ms. La mediana es de 25 ms.
- SFX pocos y cortos:
  - bubble pops en entradas de pills y badges;
  - whoosh rápido en salidas de vehículos y cambios de escena;
  - clics en el cursor;
  - swells suaves en algunos cortes.
- No hay SFX en cada palabra.

### Paleta (muestreada de las capturas)
| Rol | Hex |
|---|---|
| Fondo gráfico | #FDFDFB |
| Tinta display / thin | #111111 / #222222 |
| Palabra fantasma (antes de decirse) | #C9C9C9 (reel #9A9A9A-#BBB) |
| Piso halftone teal | dots #5FB39C sobre #D6EFE8→#A9DACD (muestras #ABDACF→#72BFA9) |
| Tab teal | #86C9B8→#BFE6DA→transparente |
| Pill dorada | #F1DEA8→#E6C470→#DDB75A, borde #3D3A3F |
| Escena roja | #EA2C26; paralelogramos #B81D1A→#8E1512 |
| Sticky rojo / oro / teal | #F3413D→#F07C88 / #E3C675→#D7B159 / #8FD0BF→#4AAB90 |
| Círculo a mano | #E8312B o #3E9D86 (contrasta con el sticky) |
| Tarjeta UI / filas / clic | #151515 / #E6E3E6 / #3E9D86 |
| Barras crema de la lista | #FBF3E1 con dots #EED9A9 |

### Tipografía
| Rol | Reel | Nuestro (local/libre) | Tamaño a 1080 px |
|---|---|---|---|
| Lead-in fino ("let's do a") | geométrica fina en minúsculas | Poppins Light | 50-64 px, #222, centrado |
| Display ancho ("BREAKDOWN") | futurista extendida, unicase con n/d con muesca | **Turret Road ExtraBold** `scaleX(1.30)` + trazo de 2 px | 110-190 px, ajustada a ≤900 px de ancho |
| Pill | sans media, 2 líneas | Poppins Medium | 34 px |
| Captions TH | sans regular blanca, cortes duros | Poppins Regular | 50 px, y=420 (bajo el neón Stimulus) |
| Script sobre nombre | firma manuscrita | Photograph Signature (fuentes del usuario) | 130 px, -9°, blanco con borde #222 |

- Fuentes candidatas descartadas: Michroma, Krona One, Audiowide, Zen Dots, Akira, Grandis, Halenoir, Evogria. La hoja comparativa está en el scratchpad de la sesión del 2026-11-10.
- Revelado de palabras:
  - Todo el título está en gris fantasma desde el primer frame del plano.
  - Cada palabra pasa a tinta justo cuando se dice: 0.17 s, power1.out.
  - Las palabras finas además suben 6 px.

### Movimiento (frames a 24 fps)
- Entradas:
  - pill: scale 0.4→1 en 5 f con back.out(2.2) y bubble pop;
  - tab teal: wipe desde el centro (clip-path) en 6 f;
  - vehículo: entra desde la izquierda en 10 f con power3.out y sale en 5 f con power3.in;
  - sticker: peel en 7 f con back.out(1.6), desde la esquina inferior derecha;
  - círculo a mano: trazo en 7-10 f;
  - filas de lista: cascada de 2 f por fila.
- Cámara sobre gráficos:
  - push lento del +4-6 % en todo el plano;
  - zoom-out settle 1.32→1 con blur 12→0 px en 7 f al entrar;
  - pull-back al final (0.9, y -60) antes del corte;
  - zoom-through ×2.2 en power3.in hacia un elemento, para pasar al primer plano.
- Caras: bob de ±8-10 px con ciclo de 6 f (0.25 s), rotación de -4°/+5° y squash del 2.5 %. Las alas (chevrons) aletean ±8° en el mismo ciclo.
- Transiciones:
  - corte duro ≈72 %;
  - rack-focus con blur al entrar a TH ≈20 %;
  - whip/blur lateral;
  - peel;
  - pixel→real;
  - flash cuts de 2 f, raros.
- Sin crossfades.

### Zonas seguras (vertical)
- La UI de IG/TikTok tapa los 280 px de abajo y los 140 px de la derecha.
- Todo texto va entre y=168 y y=1330, y a la izquierda de x=940.
- Los pisos, pistas y la lista pueden invadir abajo, porque son decoración.

## Tipos de escena reutilizables
1. **name-on-vehicle**: la cara va en la ventana de un vehículo de lado, con mano 👍 (twemoji) y brazo amarillo. Abajo, piso teal halftone con reflejo al 28 %. Arriba, thin + display flanqueados por chevrons teal que aletean.
2. **jersey-callout**: camiseta de espalda (vector, damero verde Stimulus) con un círculo rojo a mano sobre el nombre. Pill dorada arriba.
3. **walker**: la cara va sobre un cuerpo de palitos con zapatillas y sombra elíptica teal que crece. La pila de palabras va alineada a la derecha (x 57-92 %).
   - Variante: cara gris en un octógono dorado con gafas pixel "deal with it" que caen con bounce.
4. **calendar-stickers**: cuadrícula inclinada -14° (líneas de 2 px #222, celdas de 560 px).
   - Entran 3 stickers con peel, fecha circulada, título display, ⏱ y 📍.
   - La cámara pasea de celda en celda (0.38 s, power2.inOut) y el sticker anterior baja al 25 %.
5. **red-stack**: fondo rojo con dots, paralelogramos en las esquinas, carril blanco con damero y cajas pixel que van y vienen. Pila de líneas display con borde blanco escalonado; cada línea pasa de rosa fantasma a blanco.
6. **face-on-kit**: la cara va sobre un torso de camiseta enorme (equivalente al casco y visor de F1), con piso gris halftone. Settle 1.35→1 al entrar y pull-back al final.
7. **pill-tab-pixel-road**: pill, tab teal con 2 líneas display y subtítulo fino, sobre una carretera gris con guiones que corren y un sprite pixel (camiseta, ✓, moneda).
8. **top-down-lane**: carril dorado vertical (x 405-675) con hairlines de velocidad. Una van vista desde arriba cae con blur, gira 180° ("both ways") y sale.
9. **manga-burst**: líneas radiales negras que se redibujan cada 0.1 s (3 variantes). Display tachado con trazo rojo, moneda pixel girando y pill.
10. **pixel-delivery**: van pixel con la cara real al volante, que llega a una casa pixel. Cae una caja con pop.
11. **talking-head**: el raw a pantalla completa con rack-focus de entrada (copia con gblur 22 que se desvanece en 0.22 s) y push del 6 %. Captions blancos finos de 1-3 palabras, con corte duro.
12. **ui-card-cursor**: tarjeta #151515 de radio 44 sobre un swoosh rojo a rayas.
    - Las filas entran en cascada; cada una lleva un sprite pixel y nombre display + script.
    - El botón cuadrado tiene sombra dura de 8 px.
    - El cursor se desliza 0.45 s y el clic pone el botón en teal.
13. **pixel-to-real**: el torso del presentador pasa de mosaico a real (36→22→12→6 px→real, 0.13 s por paso) con la cabeza siempre real. Encima van el script "at", el display "STIMULUS" y una cápsula que se abre desde el centro.
14. **strip-list**: 11 franjas con degradado de blanco a color, cada una con un sprite pixel, una barra crema halftone y un número fino 01-11. Las etiquetas aparecen en su palabra y la escena acaba en zoom-through.
15. **close-up-stack**: sprite pixel gigante y pila display a la derecha ("WE / REMAKE / IT."), con un subtítulo fino.
16. **cta-button**: pill "free design", tab "START YOUR REQUEST" y botón pill negro "LINK IN BIO →". El cursor hace clic y el botón pasa a teal. Luego viene el outro Stimulus deslizando encima (obligatorio, ver `styles/stimulus`).

## Sonido
- Voz: la del raw, limpia con afftdn 18, agate, compresión y -15 LUFS.
- Música: house con vox y campanas, como el reel. En la prueba se usó Freesound 277448 "vox and bells" (frankum, CC0): cama a 0.13 y outro a 0.30.
- SFX reales, todos verificados con earshot `rank`:
  - pops de `sound-layer/kit/pop`: 507006, 796298, 244657;
  - whooshes de `kit/whoosh`: 60004, 449988, 60011;
  - pase de auto: Freesound 19982;
  - sticker / cinta: 422727 y 245196;
  - marcador: `kit/paper` 428338;
  - clic: `kit/click` 399443;
  - moneda: kenney rpg coins;
  - riser: reverse cymbal 148930.
- Las tomas repetidas se rotan.

## Pipeline (HyperFrames)
1. `prep/face_cut.py`: recorte de solo la cabeza (gorra + cara) sobre `edit.mp4`.
   - Usa una máscara BiRefNet-portrait por una elipse que sigue el matte y corta en la barbilla.
   - Solo procesa los rangos que usan cara (~9 s por frame en CPU).
   - Sale `face.webm` con alfa; `face_gray.webm` se hace con `hue=s=0`.
2. `prep/torso.py`: un still del torso y sus variantes pixeladas.
3. `prep/gen.py`: genera `index.html`. Los SVG y sprites se escriben en Python, los tiempos salen de `words_edit.json` y los SFX se colocan por evento.
4. `npx hyperframes check`, luego `render --quality delivery`, luego `tools/revisar_render.py` y earshot `critique`.

## Prueba 1 (pieces/f1motion-test, 2026-11-10)
- Raw: stimulus-05 (37.7 s) con 16 escenas y el outro; dura 39.6 s. Hay 2 rondas de revisión.
  - Ronda 1: `revisar_render` dio CASI.
  - Correcciones: fecha del sticker tapada por el badge, cursor sobre el botón equivocado, texto pasado de x=940, restos de capucha bajo la barbilla (`prep/face_clean.py`), el pixel "13" ahora es "12" y los captions están sincronizados.
- earshot critique: launch-grade, 21/23 métricas. Quedan dos menores: mezcla casi mono (música CC0 mono) y poco sub.
- Pendiente para el siguiente: música estéreo con más graves. En manga-burst falta un vehículo de frente con líneas de velocidad, como el "300 KMPH" del reel.

## Reglas v2 (correcciones del usuario, 2026-11-10) — OBLIGATORIAS
- **Gráficos a 12 fps (en dos).** Medido en el reel: en las escenas gráficas cambia 1 de cada 2 frames a 24 fps (25/45, 25/47, 19/36 frames únicos). El talking head y los b-roll van a 24 fps completos.
  - Render con `--fps 24` y `data-fps="24"`.
  - Todo tween gráfico va en `tlg`. Un tween conductor en `tl` lo busca en la grilla de 1/12 s: `tlg.totalTime(floor(t*12)/12)`, dentro de su ease, que corre en cada seek.
  - Las caras se reprocesan a `face*12.webm` con `fps=12,fps=24` (exacto 24, alineado a la grilla).
  - Bobs y aleteos: medio ciclo de 1/6 s.
- **B-roll en B/N ≈32 % de los planos.** Clips de YouTube con yt-dlp: niños jugando, entrenadores, árbitros.
  - Tratamiento: recorte 9:16, gris, contraste 1.3, grano 7, trama de líneas, blur de 2 frames al entrar.
  - Caption Poppins SemiBold 110 px, blanco, alineado a la izquierda en x=114, y≈1110, con sombra suave. Pasa de gris a blanco en 3 frames.
  - La trama medida en el reel son **líneas VERTICALES**, no horizontales: periodo 8 px, perfil sinusoidal ±7.5 niveles (≈ ±10 %), estática (fase constante). Se replicó tal cual.
- **Nada técnico dibujado en código.** Vehículos, camisetas, zapatillas, balón, caja, casa, moneda, chevrons teal, mano 👍 con brazo y mano del corazón se generan en **Google Flow** (srz-google-flow-mcp, Nano Banana Pro).
  - Se usan recortes del reel como referencia de estilo (`pieces/f1motion-test/flow/ref`, el F1 car = look vector brillante).
  - El fondo se quita con rembg birefnet-general (`prep/flow_cut.py`).
  - Los sprites pixel son las imágenes de Flow pasadas a mosaico NEAREST de ~26 bloques, recoloreadas (`prep/assets2.py`).
- **Caras siempre en B/N** en las composiciones.
  - El brazo de la mano 👍 pasa **por detrás** de la cabeza (capa z15 bajo la cara z20).
  - En camisetas, la barbilla entra en el cuello en V. Se usa `jersey_front_open.png`, con el interior y la parte trasera del cuello transparentes.
- **Calendario:** los stickers van DENTRO de las celdas de la cuadrícula (celda 600 px, sticker 596 px alineado a la línea). La cámara pasa a la celda vecina de la misma fila.
- **Walker** (como 55.png):
  - octágono dorado con degradado #EBD49A→#D4AE55 y borde #3A3A3A;
  - cara en B/N que lo llena (470 px de alto);
  - gafas pixel que caen con bounce;
  - brazos negros finos que salen del vértice inferior, balón en una mano (Flow) y mano del corazón en la otra (Flow);
  - piernas curvas en degradado #6F6F6F→#E2E2E2, de 13 px, cada una girando en su cadera (`svgOrigin`);
  - zapatillas Flow que se deslizan con el pie y elipse teal bajo los pies;
  - texto a la derecha (borde x=930): dos líneas thin de 44 px, la palabra héroe display de 112 px y la segunda display de 78 px, de gris a tinta palabra por palabra.
- **Camiseta del jersey-callout:** de Flow, más arriba (y=560), reflejada en el piso halftone teal como el vehículo de la apertura. El reflejo es una copia con `scaleY(-1)`, origen 50 % 50 % y máscara "to bottom".
- Texto display ajustado a ≤760 px de ancho (zona segura x≤940).

## Reglas v3 (feedback del usuario, 2026-11-10)
- **FPS remedido.** Revisé 18 tramos del reel (motion por correlación de fase entre frames).
  - En todas las escenas gráficas hay movimiento real exactamente cada 2 frames a 24 fps, y los frames intermedios son idénticos: **12 fps fijos, no variables**.
  - Las escenas a 24 fps son grabaciones de pantalla o scrolls (42-45 s, 47-50 s, lista 116-121 s, final 171-176 s).
  - La sensación de "posterize más lento" viene de los saltos grandes por paso y de las pausas largas al final de cada ease. Se mantiene 12 fps.
- Chevrons pegados a la línea thin: 6-8 px del texto.
- **Círculos de marcador:** el trazo se dibuja (dashoffset por el plugin `attr`: `attr:{"stroke-dashoffset":1→0}`; el tween CSS no funcionaba).
- **Cabeza sobre cuerpo:** siempre dentro del octágono dorado, como el walker del reel. La camiseta cuelga del vértice inferior del octágono; nada de cara pegada sobre un cuello.
- **Sombra bajo los pies:** elipse con degradado #3FAE8A→#7FCFB3→#C9EDE0 de izquierda a derecha y bordes suaves (máscara radial).
- B-roll: elegir planos donde el sujeto no quede cortado en el borde (una camisa blanca cortada se lee como un borde blanco). Recorte con un 6 % de zoom extra. TODOS los b-roll llevan caption.
- **Peel del sticker** (reel 67.2 s y 75.75 s): la nota entra con una esquina doblada gigante, brillante y con degradado del color oscuro al blanco, que se repliega hacia abajo a la derecha.
  - En 0.5 s pasa de 560 a 70 px con power2.out, mientras la nota baja de 118 % a 100 %.
  - Después la esquina queda levantada y respira (70↔95 px, ciclo de 1/3 s).
  - Se hace con clip-path polygon en el cuerpo y un polygon SVG para el doblez.
- Poner un talking head real (con blur de entrada y captions finos) también a los ~10 s: más presencia del presentador entre gráficos.
- La línea vertical del tab teal se desvanece en los extremos igual que el degradado: `.tab::before` con un degradado vertical.
- Primer plano "WE REMAKE IT.": camiseta de Flow sin pixelar, de pie sobre el piso teal con reflejo, y la pila display arriba a la derecha.
- Las caras, el torso pixel→real incluido, siempre en B/N.
- Vehículos coherentes: lateral, cenital y frontal son el mismo modelo, generado en Flow con la van lateral como referencia. Se borran los logos de marcas reales (el frontal traía uno).
- Display: `letter-spacing: .035em`, para que "IT" y "TI" no se peguen.
- **Música:** recursos del usuario permitidos. v3 usa "Dr Delight – Feel It (instrumental)" de `D:\Alan\...\Audios musica Fiesta`.
  - Funk / tech house, "confident & cool", vocal chop, celesta y pizzicato; es la más cercana al reel según earshot compare.
  - Estéreo, con más graves, a partir de 4 s.

## Reglas v4 (feedback del usuario, 2026-11-10)
- **Bordes blancos del b-roll.** La causa era el SAR no cuadrado que deja el recorte con ffmpeg (p. ej. 51611:51750): HyperFrames lo encaja con `contain` y deja 2 px blancos a cada lado.
  - Siempre `setsar=1` al final del filtro y `object-fit:cover` en el `<video>`.
  - Verificar las columnas 0-3 y 1076-1079 del render: no deben valer ~252.
- **Esquina curvada del sticker** (reel 75.7-76.6 s, cuadro a cuadro). Es un rollo de página curvo, no un triángulo:
  - lados cóncavos que terminan en una punta;
  - el borde del pliegue abombado hacia la esquina;
  - degradado color claro → banda blanca brillante (≈22 %) → color → tono oscuro en la punta;
  - línea de brillo blanca justo dentro del borde y sombra suave (feDropShadow −6/−4, blur 7, 28 %);
  - la página se corta siguiendo el mismo pliegue curvo: clipPath SVG con `path` animado por `attr` (un clip-path CSS `path()` no se anima en GSAP).
  - Movimiento: de 640 a 78 px en 0.5 s con power2.out (6 pasos a 12 fps); luego respira entre 78 y 96 px.
- "at STIMULUS": el ícono del logo Stimulus (de `styles/stimulus/assets/logo_lockup.png`, en #111) entra girando de −200° a 0° y de escala 0 a 1 en 0.42 s con back.out(1.7), en lugar del torso.
- **Walker:**
  - los brazos también son trazos plateados con degradado (#5E5E5E en el hombro → #DCDCDC en la mano), de 11 px, como las piernas;
  - las gafas caen UNA sola vez: van en su propio wrapper interno (el bob del cuerpo va en el externo), con power3.out y sin bounce.
- **Cabeza en la ventana de la van:**
  - máscara con la forma exacta del vidrio (`van_window_mask.png`, medida por píxeles grises de baja saturación) y fondo de cabina oscuro (#4A5666→#1A1F26) detrás de la cara;
  - un reflejo de vidrio encima, la puerta y el marco por delante: la capa baja se corta en el umbral real (y=226) y es transparente dentro de la ventana;
  - cabeza de 185 px, centrada en la ventana y al 62 % de su altura.

## Regla v5 (2026-11-10): posterize de 8 fps en gráficos, zooms y transiciones (preferencia del usuario sobre los 12 medidos)
- Todos los tweens van en `tlg`, buscado a `floor(t*8)/8`: gráficos, cámaras, push-ins y settles del talking head, y fades de transición. Inicios y duraciones van a la grilla de 1/8 s.
- El contenido de video (talking head y b-roll) sigue a 24 fps por dentro; las caras recortadas se reprocesan a `face*8.webm` (`fps=8,fps=24`).
- Bobs y aleteos: medio ciclo de 1/4 s (2 pasos).
- Se mantienen las frenadas largas (ease-out).
- Verificado en el render: patrón `..x..x` (8 fps) en las escenas gráficas.

## FINAL APROBADO (2026-11-10): v4 + 12 fps
- **12 fps final; 8 fps se probó y se rechazó.**
  - Todos los tweens (gráficos, cámaras, push-ins del TH y transiciones) van en `tlg`, buscado a floor(t*12)/12.
  - Caras a `face*12.webm`; bob con medio ciclo de 1/6 s.
  - El contenido de video sigue a 24 fps.
- Pieza aprobada: `pieces/f1motion-test` (render final `renders/f1motion-test.mp4`, enviado a Telegram). Es la plantilla para los siguientes videos de este estilo.
