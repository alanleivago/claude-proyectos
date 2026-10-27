---
type: reference
status: active
tags: [blender, low-poly, anime, ps1, crashsune, modelado, pie, bota, pierna, loop-cut, cilindro]
relatedTo: [crashsune-low-poly-series]
---

# Crashsune 02 — Herramientas básicas + pie (bota) + pierna

"Let's Start 3D Modeling! Blender 3D Character Modeling Tutorial - Part 2" · 14:48 · https://www.youtube.com/watch?v=yknJh0meORQ (19-07-2024)
Visto completo: transcript + 4 hojas + frames extra (8:40 pie front, 10:00 pie lateral, 10:38 pie 3D, 11:20 panel Add Cylinder, 13:35 pierna lateral, 14:10 pierna 3D). Blender 4.0.

## Pasos con tiempos

### Herramientas (0:31–6:45)
- 0:34 Seleccionar el metarig → **H** (ocultar).
- 0:59 Shift+A → Mesh → Cube; **Tab** = Edit Mode. Modos de selección: vértice / arista / cara (teclas **1 / 2 / 3** en edit mode).
- 3:10 La toolbar izquierda en edit mode (arrastrar su borde para ver nombres). Solo usa 4: **Select Box** (W cicla select box/circle/lasso/tweak), **Extrude Region**, **Bevel**, **Loop Cut**.
- 4:14 Loop Cut: clic sobre una arista → anillo de aristas alrededor del objeto.
- 4:55 Bevel sobre una cara: sirve para "atrapar un highlight" y —clave— **el torso de Love-chan es casi un cubo biselado** (arriba y abajo achaflanados) re-formado.
- 5:25 Extrude Region: crea caras nuevas desde la selección (para brazos, pelo). Diferencia con G: G solo mueve caras existentes.

### Pie / bota (6:45–10:38)
1. Cube en Edit Mode, **S** para achicar. Vista frontal (Numpad 1). **Alt+Z** x-ray para ver la referencia detrás.
2. **Solo se modela el lado derecho** (el pie de un lado); el otro se espeja después.
3. Vista frontal, modo vértice, Box Select + **G X** para los costados, **G Z** para la altura → el cubo cubre el contorno frontal de la bota (rectángulo ligeramente más ancho abajo, frame 8:40).
4. Vista lateral (Numpad 3): Box Select de los vértices traseros/delanteros + **G Y**; el cubo cubre largo de talón a punta. (Siempre Box Select en x-ray: cada punto en vista ortográfica son 2 vértices, adelante y atrás.)
5. **Loop Cut horizontal** a la altura de la línea del zapato (donde termina la caña y empieza el empeine).
6. Mover con G Y los vértices superiores delanteros hacia atrás → la parte de arriba queda como "caña/tobillo" sobre el talón.
7. **Segundo Loop Cut** (vertical, en el empeine) y G Y de sus vértices superiores para hacer la **rampa del empeine** (silueta de zapatilla: punta baja, caña alta atrás). Resultado (frame 10:38): bloque tipo bota/sneaker, ~16 vértices, ~14 quads.
8. Decide **no** inclinar el pie como en el dibujo frontal (en 3D quedaba mal): pie recto.

### Pierna (10:38–14:20)
1. Shift+A → Mesh → **Cylinder**; en el panel Adjust Last Operation (abajo-izq): **Vertices = 5**, **Cap Fill Type = Nothing** (por defecto 32 vértices y N-Gon). Radio 1 m, Depth 2 m por defecto → escalar.
2. Tab, vista frontal, S y G para ubicarlo; Alt+Z.
3. Vértices de abajo: G Z (bajar al tobillo, dentro de la bota), **S X** (estrechar), G X (centrar).
4. Vértices de arriba: S X (ensanchar), G Z → **que suba un poco por dentro del short** (solape para que no se vea hueco al animar).
5. Vista lateral: lo mismo con **S Y / G Y** abajo y arriba.
6. **Loop Cut a media pierna** (donde el dibujo lateral tiene la "muesca"/rodilla) y G Y de 2 vértices para marcar la curva de la pantorrilla/rodilla.
7. Resultado: pierna = prisma pentagonal sin tapas, 3 anillos de 5 vértices = 15 vértices, 10 quads (20 tris). La bota tapa el extremo inferior.

## Topología y por qué
- **Un objeto por pieza** (bota, pierna, después short, torso…): las uniones se esconden por solape (pierna metida en bota y en short), no se suelda nada. Estilo PS1/Mega Man Legends.
- **5 lados en la pierna**: el mínimo que da volumen "redondo" con una arista apuntando al frente (silueta de canilla). Sin tapas porque nunca se ven.
- **Loop cuts solo donde la silueta cambia** (rodilla, empeine). Cada corte tiene una razón visual; nada de geometría "por si acaso".
- La forma se saca de **dos vistas ortográficas**: X/Z en la frontal, Y/Z en la lateral. El volumen 3D es la intersección de ambas siluetas.
- Detalles del zapato (líneas, cordones) quedan para la textura.

## Cómo hacerlo por script
- Equivalencias directas:
  - Cubo/cilindro: `bpy.ops.mesh.primitive_cylinder_add(vertices=5, end_fill_type='NOTHING', radius=r, depth=h)`.
  - Loop cut en piezas tipo caja: `bmesh.ops.bisect_plane(bm, geom=bm.verts[:]+bm.edges[:]+bm.faces[:], plane_co=(0,0,z), plane_no=(0,0,1))` corta todo el anillo a esa altura (para un prisma convexo es idéntico a un loop cut). Alternativa: `bmesh.ops.subdivide_edgering`.
  - "Box select + G Y": seleccionar vértices por coordenada (`[v for v in bm.verts if v.co.z > 0.05]`) y `bmesh.ops.translate(bm, verts=sel, vec=(0, dy, 0))`.
- Mejor que imitar clics: **construir la pieza desde anillos** (loft). La pierna es literalmente 3 anillos de 5 puntos:

```python
import bpy, bmesh, math
def loft(name, rings, n, caps=(False, False)):
    """rings = [(z, rx, ry, cx, cy)], n = lados; vértice 0 apunta al frente (-Y)."""
    bm = bmesh.new(); L = []
    for z, rx, ry, cx, cy in rings:
        L.append([bm.verts.new((cx + rx*math.sin(2*math.pi*i/n), cy - ry*math.cos(2*math.pi*i/n), z)) for i in range(n)])
    for a, b in zip(L, L[1:]):
        for i in range(n):
            bm.faces.new((a[i], a[(i+1) % n], b[(i+1) % n], b[i]))
    if caps[0]: bm.faces.new(L[0][::-1])
    if caps[1]: bm.faces.new(L[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(ob)
    return ob
# pierna derecha (valores de ejemplo en m): tobillo, rodilla, muslo metido en el short
loft("Leg.R", [(0.10, .035, .040, -.08, 0), (0.42, .050, .055, -.085, -.005), (0.80, .070, .070, -.09, 0)], 5)
```
- **Bota por perfil lateral extruido**: dibujar el contorno lateral (Y,Z) como polígono de 5-7 puntos (talón abajo, talón arriba, caña frente, empeine, punta arriba, punta abajo), crear la cara y extruirla en X el ancho de la bota (`bmesh.ops.extrude_face_region` + translate). Da el mismo bloque que los 2 loop cuts del video, en una sola pasada y con números. Triangular al exportar (o usar quads con loop cuts si se quiere deformar).
- Lo que **sí necesita ojo**: leer la silueta del dibujo. Por script: medir la referencia (PIL, máscara de color de la pieza → ancho por fila de píxeles a las alturas de cada anillo) o estimar con `mcp look` en vista ortográfica + x-ray y ajustar números. No hay paso que requiera mano obligatoriamente.

## Para nuestro proyecto (NETO512 → chica @sinaboto)
- **Botas de trabajo**: el método del pie es exactamente lo que necesitamos. Bota sinaboto = el bloque del video con: caña más alta (hasta media pantorrilla), **punta más alta y redondeada** (puntera de acero: un loop cut extra cerca de la punta y subir/ensanchar 2-4 vértices), suela marcada con un loop cut horizontal muy bajo (suela de otro color en la textura) y un pequeño escalón de taco. Meta: ≤ 40 tris por bota. Se puede generar con el perfil lateral extruido y reemplazar los pies de NETO512 (o envolverlos: caña que tapa el tobillo de NETO).
- **Pantalón cargo**: en vez de modelar pierna nueva, editar el anillo de la pierna de NETO: agregar un corte a la altura del bolsillo cargo (muslo, cara exterior) y empujar 1-2 vértices hacia afuera en X → bulto del bolsillo en la silueta; ensanchar el anillo inferior para que el pantalón caiga sobre la caña de la bota (look holgado). El bolsillo y costuras van pintados en la textura 256.
- **Solapes en vez de soldar**: casco, chaleco y botas como objetos aparte que tapan la unión (como pierna metida en bota). Simplifica el script y el rig: cada pieza se pesa a 1-2 huesos de Rigify (bota → `DEF-foot`/`DEF-shin`, casco → `DEF-spine.006`/head 100 %).
- Mantener la regla: cada loop cut debe justificar un cambio de silueta; NETO512 tiene 540 tris y la ropa nueva debe sumar poco (casco ~30-40, chaleco ~40-60, botas ~70-80).
