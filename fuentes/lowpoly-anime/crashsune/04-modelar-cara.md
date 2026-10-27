---
type: reference
status: active
tags: [crashsune, blender, low-poly, anime, cara, topologia, knife, mirror, bpy]
relatedTo: [crashsune-low-poly-series]
---

# 04 · Modelar la cara (Love-chan) — Crashsune

"How to Model a Face! Blender 3D Character Modeling Tutorial - Part 4 [2024]"
https://www.youtube.com/watch?v=wXem71To_KA · 12:37 · Blender 4.1/4.2
Fuente: transcript + 4 hojas de frames + ~20 frames extra (`playlist/04/extra/`).

## Idea central

La cara NO es una cabeza cerrada: es una **máscara** (una superficie abierta, sin parte trasera ni coronilla) hecha desde un plano.
Lo que no se ve lo tapa el pelo después (min 7:21: "no va tan atrás porque eso se rellena con pelo").
Se modela **una vista a la vez**: primero la vista frontal entera, en plano (2D); después se le da profundidad solo moviendo vértices en Y desde la vista lateral.
Tiene muy pocos vértices: unos 10-12 en la mitad, espejados.

## Pasos con minutos

| min | paso | detalle / valores |
|---|---|---|
| 0:43 | Referencia | Seleccionar la imagen de referencia en Object Mode y bajarle la **opacidad** (Empty imagen → Opacity). Ella tiene un turnaround frontal y lateral como dos empties-imagen en planos. |
| 1:04 | Mira el modelo final | La cara final: frente rectangular, punta de nariz, mandíbula en V hasta el mentón y una cara bajo la mandíbula. |
| 1:36 | Plano | `Shift+A > Mesh > Plane` → Tab → `R X 90` (de pie mirando a -Y) → Numpad 1 (front ortho) → `S` para achicar, `G Z` para subirlo a la altura de la cara → `Alt+Z` (X-ray) para ver la referencia a través del plano. Encajarlo en la frente/cara del dibujo. |
| 2:06 | Mitad + espejo | Loop cut vertical por el centro (Ctrl+R, 1 corte) → face select → borrar la mitad derecha → **Add Modifier > Mirror**. Valores vistos en pantalla: Axis **X**, Bisect off, **Clipping off**, **Merge on, 0.001 m**. |
| 2:13 | Silueta frontal | Vertex select: subir el vértice superior, abrir el lateral (G X). El plano pasa a ser un trapecio (frente ancha). |
| 2:29 | **Knife (K)** | "Crea aristas nuevas cortando aristas existentes". Clic en una arista (aparece el cuadrado verde = punto de corte), clic en otra arista o vértice, **Enter** confirma. Patrón "clic, clic, Enter". |
| 3:09 | Cortes según la referencia | Imitar las aristas del dibujo de referencia (tiene la topología dibujada). Cortes: lateral → centro a la altura de la nariz; luego varios cortes para la mandíbula. Mover los vértices (G Z, G X) hasta que el contorno frontal calce con el dibujo: frente recta, mejilla, mandíbula que baja en diagonal hasta un mentón en punta en el centro. |
| 4:31 | Arreglos de proporción | Bajar/subir vértices en Z; se ve perfecta de frente pero **totalmente plana** de lado (5:14). |
| 5:36 | Profundidad | Seleccionar el vértice de la nariz → `G Y` hacia adelante. Los vértices de la mandíbula/mentón → `G Y` adelante también. Numpad 3 (lateral derecha) y alinear con la vista lateral de la referencia: frente casi vertical, la nariz sale en **punta triangular**, la mandíbula retrocede en diagonal hacia el cuello. |
| 6:39 | Vértice duplicado | Dos vértices en el mismo lugar → seleccionar ambos → `F3` "merge" → **Merge > At Last** (o `M > At Last`). |
| 7:21 | Profundidad de los lados | Los costados no van muy atrás: el pelo los cubre. |
| 7:41 | Bajo la mandíbula | En Solid view, con Knife: `Alt+A` deseleccionar, cortes vértice→vértice para replicar las aristas del dibujo (bajo-mandíbula). Tres cortes "clic, clic, Enter". |
| 8:24 | Quitar arista sobrante | Edge select (2) → seleccionar la arista → `X > Dissolve Edges` ("puede ser un quad"). |
| 8:44 | Comparar lateral | Mover vértices para que la línea de mandíbula baje más; `Alt+Z` para comparar con el dibujo. |
| 9:05 | Volver al frente | Al mover en lateral se desalinea el frente: box select y corregir **solo en X/Z** (no tocar Y). |
| 9:48 | Nariz | La agranda: mueve el vértice de la nariz abajo y atrás → "más puntiaguda". Gusto personal. |
| 10:29 | Agujero en el centro | Un vértice central se movió en X y quedó un hueco en el eje de simetría. Arreglo: `G X` hacia el centro hasta que el **Merge 0.001 del Mirror** lo suelda. |
| 11:12 | Cierre | Subir un poco la cara completa. Recurso: **The Models Resource** (models-resource.com) → buscar "Mega Man Legends" 1/2 → descargar modelos, importarlos en Blender y **estudiar su topología**. |

## Topología y por qué

- **Máscara abierta, no cabeza cerrada**: ahorra triángulos; la coronilla, la nuca y los costados los tapa el pelo (videos 05-06). En PS1 solo se modela lo que la cámara ve.
- **Frente = 1 quad grande (por mitad)**: superficie plana donde se pintan/proyectan ojos y cejas. No hacen falta loops alrededor de los ojos porque la cara es una textura, no geometría.
- **Una arista horizontal a la altura de la nariz**, que va del lado de la cara al centro: separa la frente plana de la parte de abajo, que se inclina.
- **Nariz = 1 vértice en el centro empujado en +Y**, con triángulos a los lados. Es el único volumen de la cara; le da la silueta anime de 3/4 (nariz en punta).
- **Mandíbula en V**: 2-3 vértices por lado bajan en diagonal hasta un **mentón en punta** en X=0. Es la silueta clásica de cara anime (mentón afilado, mejillas anchas arriba).
- **Plano bajo la mandíbula**: unas pocas caras que van del borde de la mandíbula hacia atrás/abajo hasta el cuello. De lado se lee como un "escalón" en ángulo, y la cara no se ve como una placa delgada desde abajo.
- Se usan **quads donde se puede** (disuelve aristas que sobran) y triángulos solo donde hay una punta (nariz, mentón).
- Se trabaja una vista a la vez: frente en 2D → lateral solo en Y. Así se evita "esculpir" en 3D.

## Cómo hacerlo con script (bpy/bmesh)

A mano ella "dibuja" la cara con Knife sobre la referencia. Por script, lo equivalente y más robusto es **escribir la media cara como una tabla de vértices (x,z de la vista frontal + y de la lateral) y crear las caras con `bm.faces.new`**. Después el Mirror hace el resto.

```python
import bpy, bmesh
# media cara (x>=0). Coordenadas en metros para una cabeza de ~0.22 m de alto.
# x,z se sacan de la vista frontal; y (hacia -Y = adelante) de la lateral.
V = {
 'top_c':  (0.000, 0.000, 0.110), 'top_s': (0.075, 0.010, 0.105),   # frente
 'mid_c':  (0.000, 0.000, 0.020), 'mid_s': (0.080, 0.020, 0.025),   # línea a la altura de la nariz
 'nose':   (0.000,-0.030, 0.000),                                    # punta de la nariz (en Y negativo = adelante)
 'jaw1':   (0.060, 0.010,-0.040), 'jaw2':  (0.030,-0.005,-0.075),
 'chin':   (0.000,-0.010,-0.090),
 'ujaw1':  (0.055, 0.050,-0.055), 'ujaw_c':(0.000, 0.040,-0.095),    # bajo la mandíbula
}
F = [('top_c','mid_c','mid_s','top_s'),
     ('mid_c','nose','mid_s'), ('nose','jaw2','jaw1','mid_s'),
     ('nose','chin','jaw2'),
     ('jaw1','jaw2','ujaw1'), ('jaw2','chin','ujaw_c','ujaw1')]
me = bpy.data.meshes.new('Face'); ob = bpy.data.objects.new('Face', me)
bpy.context.collection.objects.link(ob)
bm = bmesh.new(); vv = {k: bm.verts.new(c) for k, c in V.items()}
for f in F: bm.faces.new([vv[k] for k in f])
bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(me); bm.free()
m = ob.modifiers.new('Mirror', 'MIRROR'); m.use_axis = (True, False, False)
m.use_clip = True; m.use_mirror_merge = True; m.merge_threshold = 0.001
```
(Los números son un ejemplo de proporciones, no los de ella; hay que calibrarlos con la referencia y `look`.)

Equivalentes paso a paso:
- Plano + `R X 90`: `bpy.ops.mesh.primitive_plane_add(rotation=(pi/2,0,0))` o directamente vértices en el plano XZ.
- Loop cut central + borrar mitad: `bmesh.ops.bisect_plane(bm, geom=..., plane_co=(0,0,0), plane_no=(1,0,0), clear_outer=True)`.
- Knife clic-clic-Enter entre dos vértices de una misma cara: `bmesh.ops.connect_verts(bm, verts=[a,b])`. Si el corte es en medio de una arista: primero `bmesh.ops.subdivide_edges(bm, edges=[e], cuts=1)` o `bmesh.utils.edge_split(e, v, fac)`, y después `connect_verts`.
- Merge at Last: `bmesh.ops.pointmerge(bm, verts=[a,b], merge_co=b.co)`. Merge by distance: `bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.0005)`.
- Dissolve Edges: `bmesh.ops.dissolve_edges(bm, edges=[e])`.
- `G X` hasta que el Mirror suelde: en script, **forzar `v.co.x = 0` para todo vértice con |x| < 1e-4** (y activar `use_clip=True` para que no crucen el eje). Ella deja Clipping apagado y por eso tuvo el agujero de 10:29.
- Referencias: `bpy.ops.object.empty_add(type='IMAGE')`, `empty.data = bpy.data.images.load(path)`, `empty.color[3] = 0.4`/`use_empty_image_alpha=True` para la opacidad, `empty_display_size` para la escala; una en vista frontal, otra rotada 90° en Z para la lateral.
- **Lo que necesita el ojo humano**: calcar el contorno del dibujo. Alternativa con script: medir puntos en la imagen de referencia (PIL, en píxeles) y convertirlos a metros con la escala del empty; después iterar con `look` desde las vistas front/side. No es "a mano", pero hacen falta 2-3 rondas de corrección visual.

## Descargas / links

- **Love-chan Turnaround References** (Patreon, post 108245592): el turnaround frontal/lateral con la topología dibujada. Es de pago o de Patreon; para nosotros no es imprescindible.
- **Versión Gumroad del curso**: modelo final de Love-chan, guía de hotkeys, PDF de modelado. Es de pago.
- **The Models Resource** (models-resource.com): modelos ripeados de juegos (Mega Man Legends 1/2 recomendado). **Solo para estudiar topología**; tienen copyright, nunca se usan en un video.
- Atajos que menciona: Numpad 1/3/7 (front/right/top), Ctrl+Numpad (opuestas), Numpad 5 (persp/ortho), `/` (aislar), `Alt+Z` (X-ray), `K` (knife), `F3` (buscar operador).

## Para nuestro proyecto (NETO512 → chica @sinaboto)

- NETO512 ya tiene cabeza y la cara va en **sprites de 32x32** (ojos, pupilas, cejas, boca). No hay que remodelar la cara. Lo que sí sirve:
  - **Silueta anime de la mandíbula** (V + mentón en punta + plano bajo la mandíbula): si la cabeza de NETO se ve muy redonda o "chibi" al lado de la chica de sinaboto, mover 2-3 vértices de la mandíbula por script (bmesh, filtrando por coordenadas en la mitad inferior frontal de la cabeza) y aplicar en X=0 la simetría a mano (`co.x = -co.x` del par). No agrega triángulos.
  - **Nariz de 1 vértice en +Y**: ojo, con sprites proyectados en la cara una nariz muy salida deforma el sprite de la boca. Si se agrega, que sea mínima y en la arista que queda entre los sprites de ojos y boca.
- **Máscara abierta**: confirma que en la cabeza todo lo que tape el pelo (y el casco) se puede borrar. Al ponerle el casco: borrar las caras de la coronilla de la cabeza de NETO que queden dentro del casco (menos triángulos y evita que el pelo/la cabeza asomen a través del casco cuando el vertex snapping del motor PS1 mueve los vértices).
- Regla de flujo que conviene copiar: **modelar en una vista ortográfica a la vez y verificar con `look` desde front (Numpad 1) y side (Numpad 3)** después de cada cambio, contra la referencia de sinaboto puesta como empty-imagen.
- `merge_threshold 0.001` + `use_clip=True` en el Mirror de cualquier pieza nueva (pelo, casco) para que no se abran agujeros en X=0.
