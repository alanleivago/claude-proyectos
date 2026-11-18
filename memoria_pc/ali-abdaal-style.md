---
name: ali-abdaal-style
description: "Estilo ALI ABDAAL (antes docucollage), APROBADO 2026-11-11 = shorts de Ali Abdaal (reel 1 \"Gold Medal Syndrome\" DIV6ZPFIx3y es LA referencia, + DHt949poQGJ, DHgssOYoF6v, DF0jP-vIYlk): host grande + collage editorial; spec styles/docucollage/ (REEL1_FRAME_ANALISIS.md manda)"
metadata:
  node_type: memory
  type: project
  originSessionId: 180a3cfb-8b3b-49b6-b8ac-a71a3a85ca01
  modified: 2026-11-10T23:36:17.370Z
---

Estilo replicado a pedido del usuario (2026-11-10).
- **Referencia principal: reel 1.** Copia 1080p en YouTube: `alLf0hN5JsQ` (`fuentes/docucollage/reels/DIV6ZPFIx3y/reel1080.mp4`). IG solo da 608p. Ali Abdaal tiene los 4 shorts en su canal de YouTube.
- **Spec:**
  - `styles/docucollage/REEL1_FRAME_ANALISIS.md`: análisis cuadro a cuadro a 25 fps, todos los frames, más mediciones con código.
  - `ESTILO.md`, `CATALOGO.md` (22 tipos), `kit.js`.
  - `ref_frames/user_favs/`: los 21 frames favoritos del usuario = la vara de calidad y el menú de composiciones.
- **Pieza:** `pieces/docucollage-test` (raw stimulus-01).
  - `prep/gen2.py` genera index.html.
  - `prep/assets2.py` hace cutouts, fotos y caras.
  - `prep/fix_matte.py` arregla el matte (balón y silla).
  - `tools/face_eyes.py` saca las barras de censura con MediaPipe.

## Reglas del usuario (feedback 2026-11-10, OBLIGATORIAS)
1. **12 fps** en animaciones y transiciones. El reel mide 10; el usuario pidió 12. Render a 24 fps con `tlg` a floor(t*12)/12. TH, host recortado, deblur y relleno de subtítulos van suaves.
2. **Cada transición lleva blur/defocus.**
   - Deblur de 18 px → 0 en ~0.26 s al entrar.
   - Whip-out: blur hasta 18 px y −100 px en 4 frames.
   - TH: copia borrosa que se desvanece.
3. **Subtítulos más chicos:**
   - píldora #FBF5E5 de 86 px de alto, radio 30, Poppins Bold 44 px;
   - cada palabra se rellena progresivamente al decirla: crossfade #CFC8B6 → #1B1B1B durante la duración de la palabra (0.12-0.4 s);
   - y=900 en el bloque gráfico, y=1384 desde el TH.
4. **Títulos de arriba (fuentes del reel 1, para TODOS los títulos, números incluidos):**
   - línea condensada: Bebas Neue con stroke de 2 px y tracking .2em;
   - línea héroe: Besley 900;
   - dorado plano #FFD08D con sombra dura (+10/+9 px a cap ~100, #422F1A);
   - **wiggle por letra:** pose nueva en cada paso, ±3 px x / ±2 px y / ±1.6°, independiente por letra;
   - **brillo:** banda blanca diagonal de izquierda a derecha, ~1000 px/s, al terminar el tipeo;
   - tipeo por letra; en el TH las letras caen 100 px.
   - Montserrat NUNCA en títulos. La mano (Covered By Your Grace, amarillo) solo para marcas tipo "JESSICA" / "less!".
5. **Personas completas.** Nunca cortadas a media figura: cuerpo entero o saliendo por el borde inferior.
6. **Host:**
   - **nunca teñido** (ni sepia ni amarillo);
   - **encuadre grande estilo Ali**: `th_big.mp4` / `cutout_big.webm`, crop 654×1164 desde (273, 690) del raw, ×1.65, cabeza arriba ~280 px;
   - es una capa que se puede subir y bajar.
7. **El host NUNCA solo sobre un fondo gráfico.**
   - Sí: TH real; o recortado delante de una escena completa con título detrás (abajo, como fav 1/2); o subiendo sobre una foto y disolviendo al TH (reel P21/P27).
   - Las pantallas gráficas son para visuales creativos.
8. **Barras de censura sobre los OJOS:**
   - verificadas con landmarks (`tools/face_eyes.py`; filtrar falsos positivos);
   - difuminadas/borroneadas como en el reel (box-shadow feather, sin filter blur);
   - en todos los que no son el host.
9. **Nunca repetir una imagen** dentro del video.
10. **Todo se mueve.**
    - Cada persona u objeto es una capa propia: entrada expo.out sin rebote, deriva, parallax (bg 0.3×, sujeto 1.25×, título 1.4×), pops del reel (×1.28 → 1 en 1 frame), péndulo en colgados.
    - Push +1.2…+5.8 %/s y bursts escalonados.
11. **Buscar recursos activamente** (web, Google Fonts, Flow), no conformarse con la biblioteca. Flow por MCP. Ojo: a veces Flow guarda la imagen del prompt anterior; verificar cada archivo.
12. **Zonas seguras:** texto entre y 168 y 1330 y hasta x 940. Ningún `<video>` dentro de un div con data-start.
13. **Pocos elementos con filter/clip-path/radial** (HyperFrames avisa a partir de ~40, riesgo de frames negros).

**Storyboard v3 aprobado como estilo (2026-11-10)**, correcciones:
- Títulos serif: fuente delgada y alargada tipo Garamond Bold (no gorda); shine lento; wiggle suave y algo lento; sombra corta.
- Palabras de un mismo título bien juntas (CLUB/DIRECTORS, FAMILIES/SEE con SEE más grande).
- Parallax en todo zoom: personaje recortado separado del suelo/fondo.
- Personas en paneles completas hacia abajo, con fade a negro arriba.
- Fondos con degradé hacia oscuro (arriba o abajo, según la ref); sombras sobre caras con fade.
- Objetos en paneles que giran = giro 3D; zooms con motion blur y halftone donde la ref los tiene.

**Ronda 2 (2026-11-11), reglas generales:**
- TODO por capas: fondo plano + escenario + personaje, cada uno con movimiento propio (parallax, cámara dinámica). Nunca una foto entera de fondo.
- Overlay grunge suave (multiply) en movimiento sobre la mayoría de los planos de gráficos.
- Fondos con un brillo blanco suave en el centro o a la izquierda, con mucho feather; los fades a oscuro también con mucho feather, nunca bruscos.
- Títulos con palabras más juntas en todos; EB Garamond un poco más gruesa; palabras grandes más grandes si hay margen.
- Nunca se ve el borde de un recorte: un miembro que entra por el borde sigue fuera del cuadro.
- Los colores de cada escena van con lo que dice nuestro guion, no con los de la ref (S18: rojo/triste no sirve).

**Ronda 3 (2026-11-11):** v3b "muuucho mejor". Ajustes a recordar:
- El wiggle bueno es el de title_test_v3b: 60 % de amplitud, 3.5 Hz. No volver a acelerarlo.
- Shine blanco y algo rápido.
- Grunge más visible.
- Halftone de punto chico, rotado y con modo de fusión.
- Paredes blancas como en la ref.
- Los fades de arriba nunca llegan a negro total.
- Lo que va pegado al borde no se despega durante el movimiento.

**Render v3c (2026-11-11):** "muuuy bien". Reglas que se suman:
- Sin SFX de brillo en el shine.
- Grunge sutil (baja opacidad o soft-light).
- NUNCA corte seco entre planos de gráficos: cada capa sale y la nueva entra desde abajo, escalonado y dinámico.
- Cada elemento aparece por separado (modelo: la entrada de la mujer en el segundo 24).
- Los objetos de una escena actúan: la lupa busca y luego aparece el círculo rojo.
- Los giros 3D tienen que notarse.

## APROBADO (2026-11-11): nivel mínimo = docucollage-v3c-final
El usuario lo aprobó ("ese es el estilo") y lo renombró **Ali Abdaal**. Los archivos siguen en styles/docucollage/ y pieces/docucollage-test/. La copia del final está en pieces/Ali Abdaal/.
- Plantilla: prep/board3c.py (storyboard) → prep/render3c.py (gráficos 12 fps) → prep/gen3.py (composición) → hyperframes check → render → +1 dB de audio (-14 LUFS).
- Todos los valores finales (wiggle, shine, grunge, halftone, capas, parallax, transiciones, encuadres del TH) están en styles/docucollage/ESTILO.md, que manda.
- Flujo de trabajo: storyboard con cada escena junto a su frame de ref → OK del usuario → render. Copiar la ref 1:1 y cambiar solo los assets.
- Transición del fondo: el fondo NO se desliza, cambia de color al del plano siguiente; solo se desliza el sujeto, y tiene que estar completo (regenerarlo en Flow si viene cortado).
- Recortes de cabeza o cuello a color sobre cuerpo B/N: siguiendo la línea real de la ropa, sin halo y con zoom 3x antes de entregar.
