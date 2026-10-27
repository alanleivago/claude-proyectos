---
type: reference
status: active
tags: [crashsune, low-poly, anime, uv, texturing, blender, emission, project-from-view, power-of-two]
relatedTo: [crashsune-low-poly-series]
---

# Crashsune 07 — UV unwrapping + texturizado de personajes (17 min)

Video 07 de la serie "Blender Low Poly Character Modeling" (Love-chan). Visto completo: transcript + 5 hojas de contactos + 19 frames extra (`playlist/07/extra/`). Blender 4.2 (archivo de trabajo).

**Idea central:** el UV es "aplanar la superficie 3D sobre una imagen 2D". En este estilo (flat shading, sin luces) casi todo se hace con **U → Project from View** y luego se mueve/escala la isla con G/S **encima de la zona de la textura que ya tiene el color correcto**. La textura ya existe (se descarga) y los UV se acomodan sobre ella.

## Capítulos
| t | tema |
|---|---|
| 0:00 | Intro (odiaba los UV en la escuela de animación) |
| 0:52 | UV + texturizado |
| 1:13 | Proceso completo de un personaje 3D |
| 2:27 | Qué es el UV unwrapping |
| 4:35 | Texturas: tamaños potencia de 2 |
| 6:45 | Cómo se pinta la textura (proceso) |
| 9:29 | Anuncio Gumroad |
| 9:54 | Descargar la textura (Patreon gratis) |
| 10:35 | Material en Blender (Emission + Image Texture) |
| 12:39 | UV de la cara con Project from View |
| 16:37 | Outro |

## Pasos en orden

### 1:01–2:23 · Pipeline
1. Concepto (dibujo/ilustración) → 2. **Turnaround** en línea (frente + perfil, para proporciones) → 3. **Turnaround coloreado** (referencia para pintar la textura) → 4. Modelo 3D por bloques (ya hecho en 01–06) → 5. **UV** → 6. **Textura**. En pantalla: la hoja de bloques numerados (1 head, 2 neck, 3 torso, 4 arms, 5 hands, 6 legs, 7 waist…) coloreada por pieza.
- *Script:* el turnaround coloreado lo podemos generar con IA (frente + perfil, fondo plano, T-pose), ver "Para nuestro proyecto".

### 2:23–4:30 · Qué es el UV (con la textura final encima)
- 3:06 Muestra la textura final de Love-chan **pintada en Photoshop** ("cualquier programa de pintura gratis sirve").
- 3:27 Superpone el mapa UV sobre la textura: la cintura (short de jean arriba a la izquierda), brazos (flecha roja), zapatos (panel gris azulado con line-art), la nariz, la parte de abajo de la mandíbula. Las islas calzan exactamente sobre lo pintado.
- 4:10 **UVs superpuestos (overlap) "están bien en este estilo"** → en el video 08 se corrige: dan problemas al hornear lightmaps en Unreal/Unity; en Blender/three.js sin lightmaps no importa.

**Distribución de la textura de Love-chan (1024×512, frame 3:15):**
- Arriba izq.: short de jean celeste con cinturón amarillo, presillas y costuras en línea negra fina.
- Debajo: panel gris-azulado con el line-art de las zapatillas (lado + frente).
- Un cuadro blanco con 3 rayas azules verticales (camiseta).
- Tira de rayas rojas (puños/elástico acanalado del suéter).
- **3 franjas rojas apiladas: rojo claro / rojo medio / rojo profundo** = paleta de sombreado del suéter (cel-shading de 3 tonos como "muestrario").
- Cara: piel celeste-blanca, flequillo, ojos con corazones (la cara de frente cabe en un rectángulo).
- Zona grande rosa de pelo con "picos" rosa fuerte (sombras) y astillas blancas (brillos).
- Flecha blanca sobre rojo (detalle de la manga), zona negra (suelas/partes ocultas), zona de piel de las manos con una marca azul.
- Hoja aparte de **expresiones de cara 1024×209** (ojos cerrados, feliz, sorprendida, espirales, corazones…) — tira horizontal para intercambiar caras.

### 4:35–6:45 · Resolución: potencias de 2
- Body 1024×512 (se pueden mezclar potencias: 1024 de ancho × 512 de alto). Lista en pantalla: 1, 2, 4 … 256, 512, 1024, 2048, 4096, 8192. Ejemplos de otros personajes en 256×256.
- Motivos: cálculos de coordenadas UV más simples, **mipmaps** y filtrado más eficientes; Unreal y Unity lo recomiendan.
- Nota: la tira de caras es 1024×209 (no potencia de 2) — ella no lo sigue al pie de la letra.
- *Script:* `Image.new("RGBA",(256,256))`; comprobar `w & (w-1) == 0`.

### 6:45–9:29 · Cómo se pinta (proceso iterativo)
- Paso 1: **bloqueo con colores planos** (frame 7:00: celeste, gris, negro, rosa, blanco en rectángulos grandes). Sirve para ver en 3D qué color va dónde y cómo se lee el modelo.
- Paso 2: **añadir detalle poco a poco**: detalles del short, textura de zapatos, brazo, el pelo pasa de 1 color a **color + brillos + sombras**, se boceta la cara, colores de sombra de la chaqueta.
- Lo mismo con el personaje bruja (Suzy): versión plana → versión con detalle, ambas 1024×512.
- **Ida y vuelta UV ↔ textura:** si una parte necesita más resolución (ej. caderas), se escala su isla UV más grande, se repinta encima en el programa, se exporta otra vez a Blender. "No va a quedar en el primer intento."
- Es la parte más larga y "más satisfactoria".
- *Script:* bloqueo = rellenar polígonos UV por región con un color plano (ver código abajo). Detalle = capas PIL encima (sombras por normal, brillos, line-art). Re-exportar = re-correr el script y recargar la imagen (`img.reload()`).

### 9:54 · Descarga
- Patreon (gratis como miembro free): `LoveChan Face Texture.png` y `LoveChan Body Texture.png`.

### 10:35–12:29 · Material
1. Seleccionar el objeto cabeza+pelo → pestaña **Material Properties** → **New** → nombre `Lovechan_Body`.
2. Surface: cambiar **Principled BSDF → Emission** (con el menú Surface abierto, tecla **E**).
3. Cambiar el Timeline por el **Shader Editor**, agrandarlo.
4. **Arrastrar el PNG** desde el explorador al Shader Editor → nodo Image Texture. (Alternativa: Shift+A → Image Texture → Open.)
5. Conectar **Color → Color** del Emission. Strength 1.0.
- Nodo en pantalla (zoom 12:15): Interpolation **Linear** (default; para PS1 conviene **Closest**), Flat, Repeat, Single Image, Color Space sRGB, Alpha Straight. Panel lateral: 1024×512 RGBA byte.
- **Emission = sin iluminación**: el color de la textura sale tal cual → el sombreado está pintado en la textura (look anime/cel).
- *Script bpy:*
```python
import bpy
mat = bpy.data.materials.new("Lovechan_Body"); mat.use_nodes = True
nt = mat.node_tree; nt.nodes.clear()
tex = nt.nodes.new("ShaderNodeTexImage"); tex.image = bpy.data.images.load(PATH)
tex.interpolation = "Closest"          # pixel duro PS1
em  = nt.nodes.new("ShaderNodeEmission")
out = nt.nodes.new("ShaderNodeOutputMaterial")
nt.links.new(tex.outputs["Color"], em.inputs["Color"])
nt.links.new(em.outputs["Emission"], out.inputs["Surface"])
for ob in objs: ob.data.materials.clear(); ob.data.materials.append(mat)
```
  Para GLB: glTF no exporta Emission como "unlit" de forma fiable; mejor Principled + extensión `KHR_materials_unlit` o directamente en three.js `MeshBasicMaterial({map, })` con `map.magFilter = map.minFilter = THREE.NearestFilter`, `generateMipmaps=false`.

### 12:29–16:35 · UV de la cara con Project from View
1. Workspace **UV Editing** (arriba). Izquierda: UV Editor con la textura; derecha: 3D viewport.
2. En el 3D: **Numpad 1** (front ortho), **Z → Rendered** (el material Emission se ve en Rendered; queda "un desastre" porque aún no hay UV).
3. **Tab** (Edit Mode), seleccionar las caras de la cara (clic, Shift+clic en cada una; se puede pasar a Solid para ver la selección).
4. **U → Project from View**. Texto en pantalla: *"Project from View proyecta las caras seleccionadas desde la perspectiva de la cámara del viewport 3D al UV Editor."*
5. En el UV Editor (mismos controles que el 3D: rueda zoom, Shift+MMB pan): **A** (todo), **G** mover, **S** escalar hasta alinear **la base de la nariz 3D con la sombrita de la nariz pintada**. (Frame 14:45: la malla de la cara encima del dibujo de la cara.)
6. 15:12 **Faces de debajo de la mandíbula**: seleccionarlas → U → Project from View → A, G, S → meterlas en una **zona de sombra** (color plano oscuro) de la textura. Como es flat shading/emisión, cualquier cara que caiga dentro de un color plano se ve exactamente de ese color.
7. 15:54 Se olvidó 2 caras de arriba (frente) → mismo proceso → zona sombreada.
- Resultado: cara completa en ~3 min. El resto del cuerpo → video 08.

## Cómo hacerlo por script (resumen de equivalencias)
| A mano | Script |
|---|---|
| U → Project from View (front) | Calcular UV = proyección ortográfica de los vértices: `u = (x - x0)/w`, `v = (z - z0)/h`, luego escalar/trasladar al rectángulo destino de la textura. No necesita contexto de viewport (el operador `bpy.ops.uv.project_from_view` sí, y en `-b` falla). |
| A/G/S en UV Editor | Transformar el array de UV con numpy (bmesh `loop[uv_layer].uv`). |
| Meter caras en una "zona de color plano" | Asignar a todas las loops de esas caras el UV del centro de un swatch (`uv = (cx, cy)`), o una mini-isla dentro del swatch. |
| Pintar textura en Photoshop | PIL: rasterizar los polígonos UV de cada región (`ImageDraw.polygon`) con colores planos, después capas de sombra/brillo/line-art. |
| Cara (ojos, boca) | Lo único que realmente se pinta a mano → alternativa: generar con IA una cara de frente, recortar al rectángulo del UV de la cara, bajar a la resolución destino con `Image.NEAREST` + `quantize(colors=N)`. |

Proyección "from view" sin operador:
```python
import bmesh, numpy as np
bm = bmesh.from_edit_mesh(ob.data); uv = bm.loops.layers.uv.active
sel = [f for f in bm.faces if f.select]
P = np.array([[l.vert.co.x, l.vert.co.z] for f in sel for l in f.loops])     # vista frontal (-Y)
mn, mx = P.min(0), P.max(0)
def to_rect(p, rect):      # rect = (u0, v0, u1, v1) en 0..1 donde está pintado el detalle
    t = (p - mn) / (mx - mn).max()      # misma escala en x y z (sin deformar)
    return rect[0] + t[0]*(rect[2]-rect[0]), rect[1] + t[1]*(rect[3]-rect[1])
for f in sel:
    for l in f.loops:
        l[uv].uv = to_rect(np.array([l.vert.co.x, l.vert.co.z]), RECT)
bmesh.update_edit_mesh(ob.data)
```
(Vista lateral: usar `(y, z)`; para vistas rotadas, multiplicar por la matriz de la vista.)

## Descargas / links
- Texturas Love-chan (cara + cuerpo), gratis vía Patreon (miembro free): https://www.patreon.com/posts/low-poly-love-109722076 — útiles como **ejemplo de layout** de una textura anime plana con paleta de 3 sombras.
- Turnaround de referencia de Love-chan: https://www.patreon.com/posts/108245592
- Curso/Gumroad (modelo final con UV y rig, PDF): de pago — no necesario.
- Freebies Blender: https://www.crashsune.com/blender-freebies
- Ningún add-on en este video.

## Para nuestro proyecto (NETO512 → chica de @sinaboto)
NETO512 ya trae UV y una textura 256×256 pintada en **valores** (escala de grises = luz/sombra) + una capa en modo **Color** (Ucupaint: base / color / flowers / highlights / multiply como PNG), y la cara en sprites 32×32 aparte. O sea: **no hay que hacer UV desde cero**, solo repintar sobre los UV existentes. De este video sirve:

1. **Material emisivo/unlit + Closest**: es exactamente el look plano que queremos; en three.js `MeshBasicMaterial` (o nuestro shader PS1 sin luz) con `NearestFilter`. Nuestro `pieces/sina-test/export_neto.py` ya pone `interpolation="Closest"`.
2. **Bloqueo por regiones primero**: un script que rasteriza los triángulos UV de NETO por región (usando los vertex groups del rig Rigify: `DEF-spine*` = torso → chaleco, `DEF-upper_arm/forearm` = manga azul marino, `DEF-thigh/shin` = pantalón caqui, `DEF-foot/toe` = botas tostadas, pelo = caras del pelo) y rellena con el color plano. Ese "label map" 256×256 es la base de todo.
3. **Mantener los valores, cambiar solo el color** (equivale a su "flat colors → detalle" pero gratis): componer la nueva capa de color sobre la capa de valores de NETO con blend **Color** (H y S del color nuevo, luminancia de la base). Así la sombra pintada por evanciao se conserva y solo cambia la ropa:
```python
from PIL import Image; import numpy as np, colorsys
base = np.asarray(Image.open("base.png").convert("L"), float)/255     # valores de NETO
col  = np.asarray(Image.open("color_new.png").convert("RGB"), float)/255  # nuestro bloqueo
out = np.empty_like(col)
for y in range(256):
    for x in range(256):
        h,l,s = colorsys.rgb_to_hls(*col[y,x]); out[y,x] = colorsys.hls_to_rgb(h, base[y,x]*K + l*(1-K), s)
```
   (vectorizar con numpy; K≈0.7 para que el color plano no quede gris.)
4. **Muestrario de 3 tonos** (como el rojo claro/medio/profundo de Love-chan): para el chaleco amarillo, el azul marino y el caqui definir 3 tonos cada uno y cuantizar la luminancia de la base a esos 3 → cel-shading anime limpio en 256 px.
5. **"Caras en un color plano"**: para piezas nuevas que NETO no tiene (casco, rodilleras, franjas reflectantes si se modelan como geometría), no hace falta espacio UV propio: reservar un rincón 8×8 de la textura con swatches (amarillo casco, gris reflectante, tostado) y mandar todas las loops de esas caras ahí. Es literalmente el truco de la mandíbula de este video.
6. **Cara**: NETO usa sprites 32×32 → la equivalente a su tira de expresiones 1024×209: generar varias expresiones (IA o PIL a mano por píxel) y cambiar la imagen del material de la cara por expresión.
7. Iterar: render rápido en three.js tras cada pasada (bloqueo → sombras → detalles), igual que su ida y vuelta Photoshop ↔ Blender.
