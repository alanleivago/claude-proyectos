---
type: summary
status: complete
tags: [zero-test, sinaboto, ps1, threejs, zero-fem, vertex-snapping, comparacion-ref, vfx, subtitulos-pop]
relatedTo: [sinaboto-style, sina-test, zero-fem]
---

# zero-test — 10 s de sinaboto con nuestro personaje

## v3 (actual): `zero-test_v3.mp4`, `zero-test_v3_vs_ref.mp4`, `compare_v3.jpg`, `fx_gallery.png`
1. **Pop-in de subtítulos medido**: bbox del texto por frame en la ref (26 arranques de palabra). Cada palabra aparece de golpe (sin fundido) a **0,86 → 1,05 → 0,98 → 1,00** del tamaño en los frames 0-3 a 30 fps, igual en x e y, centrada en x y anclada en una línea 9 px (baja res) bajo la base del texto. v3 lo reproduce escalando el bitmap del subtítulo en el shader de post a resolución de salida (como escala un editor una capa); medido sobre v3: 0,86/1,05/0,98 y desplazamientos y0 +14/−5/+2 px (ref +13/−5/+2). Centro x = 0,449 (ref 485/1080) e y = 0,74.
2. **Sombreado suave muy sutil**: `SHADE_K` = 0,3 (mezcla del lambert con el albedo sin luz; lado iluminado ~1,02×, sombra ~0,89×). `?shade=` ajusta, `?flat=1` sigue dando el unlit.
3. **VFX en código** (`fx.js`, API `new FX().add('stink', { obj, bone: 'Head', offset, t0, dur, scale })`, `fx.draw(ctx, t, camera)`; anclas `screen`/`world`/`target`/`obj+bone`). Se dibujan en la rejilla 270×480 y se componen dentro del render target del plano (pasan por el mosaico y la cuantización). 21 efectos: stink, heat, sweat, sparkle, question, exclaim, idea, anger, heart, steam/humo, dust, splash, drip, bubbles, arrow, wind, thought, zap, snow, crack, impact. Tabla con timestamps de las refs en `TYPES` de `fx.js`. `gallery.html` → `fx_gallery.png`.
   En nuestros 10 s la ref solo usa **stink** (frame 195 = 6,50 s, 4 frames tras "mud.", hasta el mosaico de 7,35): 2-3 líneas verdes #82c948 de 2 px abajo y 1 px arriba, amplitud ~3 px, suben ~40 px y se rompen. Plano 3: cámara 0,17 m más baja y árboles del fondo más bajos para que el olor se recorte contra el cielo.
4. **Cielo**: degradado en espacio de pantalla (como la ref: misma fila = mismo color en todos los planos), bandas de 5 bits. Medido en 0750 f30/100/140/200/280: fila 0 (104,165,234), fila 480 (147,195,246), fila 960 (180,220,243). `SKY_PRESETS` en `shots.js` (`top`, `horizon`, `hy`, `sat`, `bands`); v3 usa `sat 1.4`. `?sky=ref|v3|dusk`.
5. **Arreglo**: el vertex snapping no hacía nada desde v1 (`'#include project_vertex'` sin `<>`); ahora el wobble PS1 sí está activo.

Efectos vistos en las 5 refs (resumen): stink 0750@6,5/@49; calor 5565@0,2/@33; gota de sudor 5565@34, 0638@7,8, 2750@33; destellos 0750@33,8/@56,8, 0638@40,8/@104,8, 2750@51/@70; "?" 0750@43; bombilla 2750@59; humo/vapor 0638@44,8, 9582@5,8-15,8; polvo 5565@9-12; salpicadura 0638@6,8, 2750@1,8/@69,8; flechas de flujo 5565@19-26, 0638@26-62, 9582@25, 2750@36-40; viento 0638@24,8/@77,8; bocadillo de pensamiento 0750@79, 0638@40; chispas 9582@8,2/@75; escarcha 9582@60; grietas 2750@34,8. Corazón, ira, "!" e impacto se añadieron por pedido (no aparecen en las refs).

Reproducir v3: `node render.mjs --all --out frames` → `ffmpeg -framerate 30 -i frames/f_%04d.png -c:v libx264 -pix_fmt yuv420p -crf 16 zero-test_v3.mp4` → vs ref con `hstack` 540×960 y audio de `ref/ref10.mp4` → `python compare.py 30 100 170 205 212 235 285 compare_v3.jpg`. Galería: `node render.mjs --page gallery.html --frames 0 --out gal`.

Huecos que quedan: igual que v2 (personaje Zero sin casco, el vaso con una mano en el plano 2, la "r" de la fuente); el olor de la ref nace más pegado al casco.

---

## v2: `zero-test_v2.mp4`, `zero-test_v2_vs_ref.mp4`, `compare_v2.jpg`
Cambios pedidos por el usuario sobre v1:
1. **Coleta hacia abajo** (`hair_compare.png`): paso nuevo en `zero-fem/feminize.py` que gira la malla `PonyTail` y el reposo del hueso `Hair` 64° hacia abajo alrededor de su raíz en la nuca (más estrecha 0,62 y corta 0,92). `build_anim.py` añade `BACK_MIN` al muelle para que no entre en la espalda. Cadena re-corrida: feminize → build_face → build_anim; caras y las 29 acciones verificadas en `zero-fem/anim/library.png`.
2. **Subtítulos**: Pixelify Sans Bold (OFL, `fonts/`) cargada con `FontFace`; glifos 1 bit + 1 px de negrita, contorno cuadrado de 3 px y caída de 1 px hacia abajo (a 270 px de ancho), 24 px, y = 74,5 %, colores medidos en la ref (blanco #fefeff, negro #040412, amarillo #fdd941). `caption_compare.png` (ref a la izquierda). Diferencia que queda: la "r" de sinaboto tiene gancho y su fuente es un poco más estrecha; no encontré esa fuente con licencia libre.
3. **Sombreado suave** (`shading_compare.png`): `SOFT` en `shots.js` (por defecto), personaje con `MeshLambertMaterial` (sin especular) + hemisférica 2,0 y key 1,35. `index.html?flat=1` vuelve al unlit de v1.
4. **Filtro medido en la ref**: la ref es 270×480 ×4 (rejilla de 4 px en x e y), con una línea oscura por fila baja (−8,5 %) y sin dither visible. v2: `LW/LH = 270/480`, 63 niveles sin dither, scanline 0,915 en la última fila de cada bloque de 4 (`FILTER` en `main.js`).
5. **Vaso** procedural (vidrio casi transparente, borde blanco, base gruesa, agua marrón translúcida) con la **rana** de `pieces/lib-mml` nadando dentro (tintada). Siempre en la mano (`holdIn` + `upright()`), centrado junto al puño. Plano 1: agachada hasta la cintura (raíz −0,6 m), el puño y el vaso en la superficie, las ondas siguen al vaso; ya no flota.
6. **Cavar**: acción nueva `dig` (loop 36 f) en `build_anim.py`; la pala se orienta cada frame del puño L al R (`shovelOnHands`) y se tiran terrones a su izquierda.
7. **Otros**: árboles más saturados y claros (`TREE` en `loadAll`); plano 4 con zanja real (el suelo tiene hueco), árboles altos al fondo, fov 50 y grúa hacia arriba/atrás como la ref; plano 5 con push lento y deriva a la derecha; "brown," con coma y tiempo de la ref.

Huecos que quedan: el personaje sigue siendo Zero (armadura, sin casco); en el plano 2 sostiene el vaso con una mano (`phone_look`), no a dos manos frente al pecho; la ref del plano 1 se inclina más; plano 5 con encuadre más bajo que la ref (no se ve la loma del fondo); la "r" de la fuente.

Depuración: `index.html?cam=x,y,z,lx,ly,lz[,fov]` fija la cámara, `?grip=x,y,z` y `?s1=from,speed,from2` ajustan vaso y plano 1, `?flat=1` sin luz.
Reproducir v2: `node render.mjs --all --out frames` → `ffmpeg -framerate 30 -i frames/f_%04d.png -c:v libx264 -pix_fmt yuv420p -crf 16 zero-test_v2.mp4` → vs ref: `hstack` 540×960 de ambos con el audio de `ref/ref10.mp4`.

---

## v1 (histórico)

## Segmento elegido
`Ref sinaboto/7697312481340820750.mp4` ("make river water safe to drink"), **0:00–0:10**. Es el arranque: la chica actúa en 5 planos seguidos (agua del río, levantarse, alzar el vaso, cavar, bombear). Del 0:10 en adelante pasa a la cuenca de decantación, donde la chica es diminuta.

- `ref/ref10.mp4` (corte), `ref/ref10.wav` (16 kHz mono), `ref/analyze.py` → `ref/words.json` (faster-whisper small, cpu int8, wav por `wave` + numpy) y `ref/cuts.json` (diferencia de frames a 90×160).
- Cortes medidos: **2.00 s corte seco** (dif 26 en un solo frame), **3.90–4.33 disolvencia en mosaico** (centro ≈4.1), **7.30–7.53 disolvencia** (centro ≈7.35), **8.37 corte seco** (dif 27). O sea, sinaboto mezcla cortes secos y mosaicos de 0,3 s; el motor ahora acepta `hard: true` por plano.
- Texto: "If you drink straight from a river, you have a water supply. But it's brown because rivers carry mud. So you pump it into a pond and let it sit." La ref pinta "water" y "supply." de amarillo.

## Tabla de planos

| tiempo | ref | nuestro plano | animación | cara |
|---|---|---|---|---|
| 0.00–2.00 | plano medio bajo, agachada en el río marrón hasta la cintura, vaso en el agua con ondas blancas; valla, buzón azul y setos detrás, mucho cielo | igual: río opaco (mud.png), orilla de tierra, valla+buzón+setos a 7–14 m, árboles a 60–80 m; cámara a 0,85 m, fov 46 | `scoop_kneel` casi congelado en f8–10 hasta 1,25 s y luego sube el vaso (speed 0,4). El vaso flota en la superficie siguiendo el puño | half → blink (0,9) → half → happy/smile (1,7) |
| 2.00–4.10 | plano entero: se levanta de cuclillas (2,2–2,5) y sostiene el vaso a dos manos; sonrisa pícara | mismo set, cámara a 3,8 m, fov 36, agua por los tobillos | `kneel` rebobinado (speed −2,2) → `phone_look` (fade 0,2) con el vaso en HandR | happy/smile → half/smile → angry/smile (pícara) → half/smile |
| 4.10–7.35 | primer plano: vaso en alto a la izquierda, cara 3/4 a la derecha, horizonte alto; líneas verdes de olor en "mud" | campo de césped, valla, setos a 26 m, sol pixel; fov 19 a 3,4 m | `hold_up_object` arrancando en 4,0 (sube el vaso al entrar) | open + talkA/talkO por palabra; half/frown en "mud" (6,38) + sprite de olor animado |
| 7.35–8.37 | picado alto, de pie en un claro de tierra cavando con pala, zanja a la izquierda, valla+buzón y árboles arriba | claro de tierra, zanja, agujero oscuro, camino claro, árboles bajos; fov 38 desde 4 m de alto | `pump` en loop (speed 1,3) como gesto de cavar; la pala (Quaternius) se orienta cada frame del puño al suelo | half → angry/shout → half |
| 8.37–10.00 | plano general: bomba roja sobre pedestal de ladrillo, ella bombea la manija larga, chorro cae a una canaleta de madera | bomba procedural (pedestal brick_ref, cuerpo rojo, caño), manija que apunta al puño cada frame, chorro tubo con textura que corre, canaleta; fov 45 | `pump` en loop | half → angry/shout → half → happy/smile |

## Motor (copiado de sina-test y ampliado)
- `index.html`, `main.js` (post PS1 de sina-test: sRGB, 15 bit + Bayer, mosaico 0,3 s, scanlines, 360×640 → 1080×1920), `render.mjs`, `compare.py` (sale en el scratchpad `zt/`).
- Nuevo en `main.js`: corte seco por plano (`hard: true`), subtítulos con mayúsculas/puntuación como la ref, 22 px a 360 de ancho, borde 6, "water"/"supply" en amarillo.
- `shots.js`: **vertex snapping** en todo (escenario, props y personaje) con `onBeforeCompile`: `gl_Position.xy` se redondea a la grilla de 360×640 tras `project_vertex`. Personaje con `MeshBasicMaterial` (sin luz, plano como Megaman Legends), caras con `setFace` (atlas de 16 celdas, NearestFilter, flipY=false). Animación escalonada a **15 fps** fijando `action.time` (determinista, sin deltas), crossfade manual por peso. El origen del GLB está en la cadera: hay que subirlo 9,0 u (suela en y=−9,0) — ver `zero()`.
- Escala: personaje 1,6 m (`S = 1.6/13.2`); props en espacio del hueso con `scale 1/S`.

Reproducir: `node render.mjs --all --out frames` → ffmpeg (ver comandos en el historial) → `python compare.py 30 75 100 125 170 210 235 285 final.jpg`.

## Assets
Ver `CREDITS.md`. Modelos: árbol PS1 (wersaus33, CC BY), valla de abedul (scrampunk, CC BY, teñida de marrón), buzón (CreativeTrio, CC0, repintado azul en código porque el recolor en Blender no llegó al GLB), vaso (Kenney, CC0), pala (Quaternius, CC0). Texturas: tierra y ladrillo de Poly Haven (CC0) recoloreadas al color medio medido en la ref; césped y setos generados con Flow. La bomba de mano es procedural: en Sketchfab/Poly Pizza solo había bombas de 30k–1,6M caras o sin manija separada, y la manija tiene que moverse con la mano.

## Qué coincide
- Encuadres: los 5 planos tienen el mismo tamaño, altura de cámara, posición del horizonte y lugar de la chica que la ref (ver `compare_v1.jpg`, arriba nuestro, abajo ref).
- Tiempos: cortes en 2,00 / 4,10 / 7,35 / 8,37 con el mismo tipo (seco o mosaico); el levantarse cae en 2,2–2,5 y el vaso sube al entrar el plano 3, como en la ref.
- Paleta: cielo (100,162,228)→(178,214,240), césped ≈(92,148,50), tierra ≈(165,122,73) medidos en la ref.
- Look: texturas fotográficas a ≤256 px sin filtrar, wobble de vértices visible en las panorámicas, personaje a 15 fps, subtítulo de una palabra con borde negro a 73,5 %.

## Qué no coincide y por qué
1. **El personaje**: es Zero (armadura roja, coleta-pincho amarilla gigante) y no la chica de casco y chaleco. La coleta tapa medio cuadro en el plano 1. Es el modelo, no el encuadre.
2. **Luz en el personaje**: la ref tiene sombreado suave en casco y brazos; el nuestro es unlit plano (lo pedido). Se ve más "recortado" que la ref.
3. **Acciones aproximadas**: no hay animación de cavar (se usa `pump` con pala), ni de "sostener a dos manos mirando a cámara" (se usa `phone_look`, que baja la cabeza), ni de agacharse hasta la cintura (se usa `scoop_kneel` hundido 0,22 m; el vaso flota aparte porque el puño queda bajo el agua).
4. **Post**: nuestras scanlines y el dither Bayer se notan más que en la ref, que se ve más limpia.
5. **Tipografía**: Verdana bold con umbral, no la fuente pixel redondeada de sinaboto.
6. **Cámara**: la ref mueve la cámara en el plano 4 (barrido lateral sobre la zanja) y en el 5; aquí solo hay pushes lineales lentos.
7. **Vegetación**: los árboles de la ref son más saturados y densos; el árbol PS1 importado es más apagado. Los setos de Flow se parecen bastante.
8. **Detalles menores**: el vaso es un hexágono beige (la ref usa un vaso más alto y marrón), la canaleta y el chorro del plano 5 quedan más a la derecha y más chicos, no hay sombras de contacto bajo los pies.
