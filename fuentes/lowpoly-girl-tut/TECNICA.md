# Técnica: cuerpo low poly PS1 "Goth Girl" (Stark Crafts)

- Video: https://youtu.be/BAr4EsxLqEg — "LOWPOLY Body Goth Girl | Blender PS1 Tutorial", 2:23:30, sin voz útil (rótulos de teclas en pantalla). Blender 2.9x/3.0, UI estándar.
- Timelapse corto de la misma obra: `tut.mp4` (11:54, `sheet.png`). **Ojo:** la versión extendida viste a la chica con **vestido negro de cuello blanco (estilo Wednesday) + botas de plataforma con hebillas**. El timelapse muestra **otra variante** del mismo cuerpo: top corto (bandeau / arnés de pentagrama), pantalón negro y las mismas botas. Las fotos de las dos variantes estaban en la misma carpeta (`Pentagram1/2`, `g-star-shape...jeans`), así que la técnica es idéntica y solo cambian las fotos.
- **La cabeza NO se modela aquí**: viene de un tutorial anterior ("Head Tutorial") y se trae con Append como `GothGirlHEAD` (cara fotográfica, pelo en cartas con alfa). Este video es cuerpo + ropa + textura.
- Cómo se estudió: Gemini falló dos veces con el video (estado `failed`, probablemente por la duración). Se descargó a 360p, se sacaron hojas de contacto cada 30 s y se bajaron fotogramas sueltos a 1080p para leer la barra de estado (vértices/tris) y los paneles. Los números de abajo están **leídos de la pantalla**, salvo lo marcado **[inferido]**.

## Cronología (MM:SS del video extendido, ±30 s)

| Tiempo | Paso |
|---|---|
| 00:00–01:00 | Intro: render final sobre fondo rojo, T-pose. |
| 01:00–07:30 | **Referencias**: Shift+A > Image > Reference con una hoja de anatomía femenina dibujada (frente / 3/4 / espalda, 7 cabezas de alto, con notas). Se ponen 2–3 empties de imagen: uno de frente (eje Y) y otro rotado 90° de lado. Opacidad ~0.5 para calcar. |
| 08:00–11:00 | **Cubo inicial** (`Cube`, en la colección `Body`), escalado a la caja del torso, mirado de frente y de lado. Modificador **Mirror** en X desde el principio (icono de llave en el outliner); se modela solo la mitad. |
| 11:00–16:00 | Se corta el cubo con loops y se mueven vértices **en vista ortográfica frontal** para calcar el contorno del torso: pecho, cintura, V de la pelvis. X-ray activado. |
| 16:00–23:00 | Se **extruyen las piernas** desde la cara inferior de la cadera, calcando el muslo, la rodilla y la pantorrilla. Notas del dibujo: "pierna de abajo = mismo largo que la de arriba", "la punta de los dedos llega a la mitad del muslo". |
| 23:00 | Cadera + piernas: **98 vértices / 96 caras / 192 tris** (con el espejo), alto 1.64 m. |
| 24:00–32:00 | **Volumen de perfil** (vista lateral y de espalda): se empuja el glúteo hacia atrás, el vientre plano, la curva lumbar, el muslo más ancho arriba. El gesto es ir alternando frente/lado/espalda moviendo vértices sueltos, nunca escultura. |
| 32:00–36:00 | **Pies**: cuña simple con el talón levantado (pie de tacón, como en el dibujo). 3–4 vértices de alto en la punta, sin dedos. |
| 36:00–40:00 | Torso hasta el cuello; **brazos extruidos en horizontal (T-pose)** desde la cara del hombro. |
| 40:00–48:00 | Brazos: hombro, codo (a la altura de la última costilla, según el dibujo), antebrazo, muñeca. Pecho con 1 vértice adelantado por pecho. |
| 48:00–50:00 | **Mano tipo mitón**: bloque plano + pulgar extruido aparte. Media malla en edición: **135 vértices**. |
| 50:30 | Cuerpo entero: **269 vértices / 272 caras / 534 tris**. |
| 51:00–56:00 | Repaso de la entrepierna (se borran caras y se rehacen), Shift+D para copiar el cuerpo y probar el **vestido**: se abren las caras de debajo de la cadera en una falda acampanada (los loops del muslo se convierten en el borde de la falda). |
| 56:00–64:00 | Se comparan 2–3 versiones lado a lado (cuerpo / vestido) con la foto del vestido real como referencia. Se corrige la parte de dentro del muslo bajo la falda. |
| 64:00–66:00 | Se elige el cuerpo con vestido (`Cube.006`, 271 vértices por objeto). Comprobación de Face Orientation (todo azul) para las normales. |
| 66:00–75:00 | **UV**: se marcan las costuras y se hace Unwrap con la textura de prueba `PixelartGrid_px256.png` (cuadrícula de colores 8×8 con letras A1..H8) en Closest. Islas grandes y planas: piernas abiertas como tiras, torso por delante y por detrás, brazos. Se escalan las islas para que la densidad de píxeles sea parecida y se llena el cuadrado. |
| 75:00–80:00 | Append de **GothGirlHEAD** desde el archivo del tutorial de la cabeza; se coloca sobre el cuello. |
| 80:00–82:00 | Imagen nueva **`DressBODY` de 1024×1024**, fondo negro; las islas del cuerpo se rellenan con el color de piel. Material: Principled BSDF → Image Texture **Interpolation = Closest**, Projection Flat, Extension Repeat. |
| 82:00–104:00 | **Proyección de fotos con el pincel en modo Stencil**: Texture Paint, pincel TexDraw, Radius 20 px, Strength 1.0, Blend Mix; Texture = foto del vestido en una modelo real, **Mapping: Stencil**. Se pone el visor en ortográfica (frente, lado o espalda), se ajusta el stencil sobre el modelo (mover con clic derecho, escalar con Shift+clic derecho, rotar con Ctrl+clic derecho; Image Aspect) y se pinta encima: la foto queda "proyectada" en la textura con su **luz y sus sombras reales**. Se hace por partes: frente, costados, espalda, cuello blanco, mangas. |
| 104:00–120:00 | **Retoque a mano** en el visor 3D: bordes del dobladillo y del cuello, Smear para empujar el negro en las costuras, sombreado suave en piernas y brazos (piel más oscura en el interior del muslo y debajo de la falda), dedos de la mano pintados como líneas oscuras sobre el mitón. Color de pincel elegido con la rueda; textura del pincel = cuadros (sin stencil) cuando se pinta liso. |
| 120:00–128:00 | **Botas**: stencil con la foto de unas botas de plataforma con hebillas (estilo Demonia), proyectadas sobre pantorrilla y pie de frente y de lado. Las botas son **solo textura** sobre la pierna. |
| 128:00–131:00 | **Suela de plataforma**: se extruye la cara de abajo del pie para hacer un bloque grueso (suela) y se pinta de negro con la foto. Cuerpo: **278 → 298 vértices, 550 → 590 tris**. |
| 132:00–138:30 | **Unión cuello-cabeza**: se mueven los vértices del borde del cuello para que coincidan con el borde de la cabeza (wireframe del pelo visible en cian), se pinta la piel del cuello para que coincida en tono. |
| 139:00 | **Truco clave PS1**: la textura pintada a 1024 se abre en MS Paint y se **reduce a 256×256 px** → `DressBODY_256px.png`, que es la que se usa en Blender (con Closest). |
| 140:00–142:00 | Resultado: cabeza unida al cuerpo con Ctrl+J, un objeto `GothGirlDress` con dos materiales (`Body` con DressBODY, `Head.001`). **437 vértices / 434 caras / 854 tris en total.** Luz Point de 1000 W, vista en Material Preview. |
| 142:30 | Outro. |

## Cómo se bloquea el cuerpo

- **Primitiva**: un cubo con Mirror X (Clipping activado [inferido]); todo se hace con extrude, loop cut (Ctrl+R), knife ocasional y moviendo vértices sobre las referencias. No hay Subdivision Surface ni escultura.
- **Secciones por extremidad**: casi siempre **8 vértices por anillo en las piernas y en el torso** (cuadrado achaflanado: frente, lado, atrás y 4 esquinas) y **6 en los brazos** [contado en los fotogramas, aproximado].
  - Pierna (de la cadera al tobillo): ~6 anillos — ingle/glúteo, mitad del muslo, encima de la rodilla, rodilla, pantorrilla (lo más ancho), tobillo.
  - Pie: 1 anillo de empeine + punta (cuña de 4–6 vértices). Después, la suela es 1 extrusión.
  - Brazo: ~6 anillos — axila/hombro, bíceps, **codo (anillo doble para doblar)**, antebrazo, muñeca, y la mano.
  - Mano: mitón plano (8 vértices) + pulgar de 1–2 segmentos. Los dedos se **pintan**.
  - Torso: anillos en la pelvis (V de la ingle), cadera (lo más ancho), cintura, debajo del pecho, pecho, axila/hombros, base del cuello. Unos 7–8 anillos.
- **Cadera, glúteo, muslos, pecho**: el volumen sale de **mover vértices de los anillos ya existentes** en las vistas lateral y trasera, no de añadir geometría. El glúteo es 1–2 vértices del anillo de la cadera empujados hacia atrás y abajo; el pliegue de debajo del glúteo es el anillo de la ingle. El pecho es un vértice adelantado por lado en el anillo del pecho. La cintura se estrecha bastante: silueta de reloj de arena tomada directamente del dibujo.
- **Loops para deformar** (donde están, aunque no se rigea en el video): ingle/cadera, rodilla, tobillo, hombro/axila, codo, muñeca, base del cuello. Cada articulación tiene un anillo justo encima y otro justo debajo.
- **Números**: cadera + piernas = 98 v / 192 tris → cuerpo completo con brazos y manos = 269 v / 534 tris → con vestido y suelas ≈ 298 v / 590 tris → con la cabeza unida = 437 v / 854 tris (cabeza ≈ 140 v / 265 tris [inferido por resta]).
- **Proporciones**: alto total ≈ 1.71 m (sin cabeza ≈ 1.64 m); envergadura en T ≈ 1.72 m; profundidad ≈ 0.33 m. 7 cabezas de alto.

## Cabeza y cara (de otro video)
- No se ve el modelado. Lo que sí se ve: cabeza low poly (unos 140 vértices), **cara hecha con foto proyectada** (ojos, cejas, labios oscuros, maquillaje gótico realista, nada caricaturesco), **pelo en planos/cascarones con textura de foto y alfa** (moño arriba, flequillo), en un material aparte (`Head.001`). El cuello del cuerpo se adapta a la cabeza moviendo vértices, y después se juntan con Ctrl+J.

## UV y textura
- **Una sola textura para el cuerpo**: se pinta a **1024×1024** y se exporta a **256×256** (reducida en MS Paint). La cabeza tiene la suya [inferido: tamaño parecido].
- **Interpolación Closest** en el nodo Image Texture (filtrado por vecino más cercano: píxeles duros, como en PS1). La cuadrícula de prueba también es de 256 px.
- Layout: islas grandes y separadas; las piernas son tiras largas verticales (con las botas abajo); torso frente/espalda, brazos y manos; tiras de cuello y suela. Fondo negro: el negro también sirve de color del vestido, así que los sangrados en las costuras no se notan.
- **Fuentes**: fotos de tienda de ropa (modelo real de frente, de lado y de espaldas con el vestido; botas sobre fondo blanco; medias de rejilla; pantalón). Se proyectan con el stencil en vistas ortográficas. **La iluminación de la foto queda horneada en la textura**: pliegues del vestido, brillo del charol de las botas, sombra bajo el pecho. No hay luz pintada aparte, salvo retoques.
- **Paleta**: vestido casi negro (#101010); cuello y puños blancos agrisados (#d8d0d4 aprox.); piel **pálida lila-rosada** (en el editor de imágenes ≈ #aa9a9e–#c8b8bc; en el render ≈ #8a8287 con luz); botas en grises y negros con brillos de charol; labios y ojos oscuros en la cara. Valores medidos en los fotogramas, aproximados.
- **Shading**: Principled BSDF por defecto con la textura en Base Color. El look PS1 no viene de un shader especial sino de la geometría facetada, la textura de 256 y el Closest.

## Pelo
- Viene con la cabeza (del otro tutorial): **cartas o cascarones low poly con textura de pelo fotográfica y alfa**, moño arriba y mechones que bajan por la cara. En el wireframe se ven como pocos planos grandes alrededor del cráneo [lo que se ve; el método exacto está en el otro video].

## Manos y pies
- **Manos**: mitón + pulgar, dedos pintados como líneas oscuras en la textura (en la foto se ven 4 dedos sombreados). Sin geometría de dedos.
- **Pies**: cuña con talón alto, sin dedos; la bota es textura sobre la pierna y la suela de plataforma es un bloque extruido debajo del pie.

## Rig y pesos
- **No aparecen** en este video. Termina en T-pose sin armature. [Inferido: los anillos dobles de codo/rodilla y la T-pose están preparados para un rig con Automatic Weights o Mixamo.]

## Por qué se lee como "PS1 / Resident Evil" y no como cartoon
1. **Proporciones realistas** sacadas de una hoja de anatomía (7 cabezas, cintura, cadera y piernas naturales), no cabezona ni chibi.
2. **Texturas fotográficas proyectadas** (ropa, botas y cara de fotos reales) con la luz real horneada, en vez de colores planos o pintura estilizada.
3. **Resolución baja y Closest**: 256×256 para el cuerpo entero, así que el detalle de la foto se convierte en píxeles grandes y duros.
4. **Silueta facetada**: entre 400 y 900 tris, sin suavizar; los planos se ven y la forma la da la textura, no la geometría.
5. Paleta apagada y desaturada (negro, gris, piel pálida), cara con maquillaje realista.
6. Detalle (dedos, hebillas, costuras, cuello) **pintado y no modelado**.

## Checklist para bpy

```
ESCENA
- Unidades: m. Alto del personaje 1.70–1.72 m, T-pose, brazos en horizontal (Z ≈ 1.40 m [inferido]).
- Referencias: empties de imagen (front: rot X=90°, side: rot X=90° Z=90°), opacidad 0.5.

CUERPO (un objeto, Mirror X con use_clip=True, merge)
- Base: cubo → loops. Media malla final ≈ 135–150 verts.
- Anillos: piernas 8 verts × ~6 anillos; torso 8 verts × 7–8 anillos; brazos 6 verts × ~6 anillos.
- Anillo doble en codo y rodilla; anillos en ingle, tobillo, hombro, muñeca, cuello.
- Mano: mitón (≈8 verts) + pulgar (≈4–6 verts). Pie: cuña de tacón (≈6 verts).
- Objetivos (con el espejo aplicado):
    cadera+piernas      ≈  98 v / 192 tris
    cuerpo completo     ≈ 270 v / 534 tris
    + falda + suelas    ≈ 300 v / 590 tris
    + cabeza (unida)    ≈ 437 v / 854 tris   (cabeza ≈ 140 v / ~265 tris)
- Volumen: glúteo = 1–2 verts del anillo de cadera hacia -Y(atrás) y abajo; pecho = 1 vert adelantado por lado;
  cintura ≈ 0.6–0.7 × ancho de cadera [inferido del dibujo]; ancho de cadera ≥ ancho de hombros.
- Shade Flat (sin auto smooth, sin subsurf). Normales hacia afuera (Face Orientation azul).
- Falda: abrir el anillo de debajo de la cadera hacia afuera y abajo (campana de 8–10 verts), hasta medio muslo.
- Suela: extrude de la cara inferior del pie ≈ 4–6 cm.

UV
- Costuras: interior de piernas y brazos, laterales del torso, anillo del cuello, tobillo/suela, muñeca.
- bpy.ops.uv.unwrap(method='ANGLE_BASED', margin≈0.01), pack islands, densidad de texel parecida.

TEXTURA
- Pintar/proyectar a 1024×1024 (fondo negro, islas de piel ≈ #c0b0b4) → reducir a 256×256 (nearest).
- Proyección por script [equivalente del stencil]: para cada vista (front/side/back) proyectar la foto en
  ortográfica sobre las caras que miran hacia esa vista (UV Project from View + bake, o muestrear la foto
  por cada texel según su posición 3D proyectada), y mezclar las vistas según la normal.
- Nodo Image Texture: interpolation='Closest', extension='REPEAT'; Principled BSDF con Roughness alta/Specular 0
  [ajuste propio para quitar el brillo].
- Dedos, costuras, hebillas, labios: pintados, no modelados.

CABEZA / PELO
- Cabeza aparte (~140 v), cara con foto proyectada, pelo en cartas con alfa (blend_method CLIP o HASHED),
  segundo material; ajustar el anillo del cuello y luego unir con Ctrl+J.
```
