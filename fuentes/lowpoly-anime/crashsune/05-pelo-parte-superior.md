---
type: reference
status: active
tags: [crashsune, blender, low-poly, anime, pelo, flequillo, mechones, mirror, extrude, merge-at-center, bpy]
relatedTo: [crashsune-low-poly-series]
---

# 05 · Pelo: casquete superior, flequillo y púas traseras — Crashsune

"Modeling the Top of the Hair! Blender 3D Character Modeling Tutorial - Part 5 [2024]"
https://www.youtube.com/watch?v=sXTDuZtjfYY · 16:55
Fuente: transcript + 5 hojas de frames + ~30 frames extra (`playlist/05/extra/`).

## Idea central

- El pelo se divide en **trozos (chunks)**: casquete (top cap), flequillo frontal, púas traseras, pelo inferior y laterales (video 06), y mechones del flequillo asimétricos (video 06).
- Todo es **simétrico con Mirror** salvo el flequillo final, que se hace después de aplicar el Mirror.
- El pelo **se une a la cara** (Ctrl+J) para poder extruir desde el casquete y **cerrar huecos contra la mandíbula** con F (fill). Cabeza = cara + pelo en un solo mesh.
- El pelo es una **cáscara de una sola capa** (sin grosor ni interior). Las puntas son **triángulos** que se hacen extruyendo una arista y fusionando sus dos vértices nuevos en uno solo (`M > At Center`).
- "Hay muy pocos triángulos en total" (1:24). Mirar mucho las referencias 2D y 3D (topología de otros) es lo que destraba el pelo.
- Lo visto del modelo final (0:40, 8:00): el material de pelo `LoveChan_Hair` usa un shader **Add Shader con dos Emission** (sin luz) y una textura `LoveChan-Textures.png` con triángulos rosas que dibujan los mechones sobre el casquete (se ve en el frente del pelo final). La geometría es simple y el detalle de los mechones va pintado en la textura.

## Pasos con minutos

### Casquete (top cap) — 1:53 a 8:51
| min | paso | detalle |
|---|---|---|
| 1:53 | Cubo | `Shift+A > Mesh > Cube` → Tab → `S` achicar → `G Z` subir a la cabeza. |
| 2:05 | Sin base | Face select (3) → seleccionar la cara inferior → `X > Faces`. El casquete queda abierto por abajo. |
| 2:25 | Mitad + Mirror | Loop cut vertical en el centro (Ctrl+R; panel: Number of Cuts 1, Smoothness 0, Falloff Inverse Square, Correct UVs on) → `Alt+Z` → borrar la mitad desde la vista frontal → **Mirror** (X, Merge 0.001 m, como en el video 04). |
| 2:46 | Leer la referencia | El casquete es "una caja" con una **línea de aristas central un poco elevada** (cresta de adelante a atrás) que baja hacia los lados. Cada faceta es un plano. |
| 3:07 | 2 loop cuts más | Uno **horizontal** alrededor de los lados (a media altura) y uno **vertical en Y** (corta de adelante a atrás por la mitad). La media caja queda así: lado 2x2, techo 2 (adelante/atrás), frente 2 (arriba/abajo). |
| 3:30 | Cresta | Vertex select: los **3 vértices de la arista superior exterior** (adelante, medio, atrás) → `G Z` abajo. El eje central queda alto → techo a dos aguas con cresta en X=0. |
| 3:50 | Afinar | Algunos vértices `G Y` hacia adentro (adelante y atrás se estrechan → forma de casco/cebolla). |
| 4:10 | Vista lateral | Numpad 3 + `Alt+Z`: `A` → `G` para bajar todo hasta la referencia; luego vértice por vértice (frente abajo, atrás afuera) para calcar el perfil del pelo dibujado: frente que baja hasta el flequillo, techo inclinado, parte trasera que sale hacia atrás. "Voy por vibe, buscando el flow". |
| 6:15 | Vista superior | Numpad 7: el techo era "totalmente plano". Los vértices de las esquinas se **meten hacia adentro y se inclinan** (vista frontal: los lados se abren hacia afuera abajo y se cierran arriba). |
| 7:00 | Vista trasera | Ctrl+Numpad 1: la parte de atrás está "canteada" hacia abajo; sacar vértices hacia afuera. |
| 8:02 | Proporción | En frontal, el borde inferior del casquete debía terminar **donde empieza el flequillo** (más arriba): box select del borde inferior → `G Z` arriba → meter un poco en X. |

### Flequillo frontal — 8:51 a 13:29
| min | paso | detalle |
|---|---|---|
| 8:51 | **Unir cara + pelo** | Object mode: clic en uno, Shift+clic en el otro → **Ctrl+J**. Un solo objeto ("Plane", conserva el Mirror del objeto activo). |
| 9:29 | Topología | Subir 2 pares de vértices de la frente (`G Z`) para que el borde de la cara quede debajo del borde del casquete ("por topología"). |
| 10:09 | Extruir el flequillo | Edge select (2): clic en una arista del borde frontal inferior del casquete, Shift+clic en la vecina → **E** extruir hacia abajo → Numpad 3, moverlo un poco hacia adelante (`G Y`) para que flote sobre la frente. |
| 10:29 | **Punta** | Seleccionar la arista inferior → **E** → **M > At Center**: los 2 vértices nuevos se vuelven 1 → **triángulo en punta**. Moverla abajo/al costado "para darle carácter". |
| 10:49 | Simplificar | Donde la referencia tiene 1 vértice y hay 2: seleccionar ambos → **M > At Last**. Quad → triángulo. |
| 11:11 | Volumen | Dos vértices que en la referencia son uno (entre casquete y flequillo): **M > At Last**. Después, otra arista lateral → **E** → fusionar los vértices nuevos con un vecino (At Last) porque "es un triángulo, no un quad". Así el flequillo tiene volumen hacia el costado. |
| 12:12 | Ajuste lateral | Mover vértices desde el lado; "no tiene que ser perfecto". |
| 12:34 | **Fill F** | Hueco entre el flequillo y el costado: edge select, clic en una arista + Shift+clic en otra → **F**. Con 2 aristas que comparten un vértice, F crea un triángulo; con 2-4 aristas que no se tocan, un quad o un n-gon. |
| 13:15 | Fill con la mandíbula | Hueco entre la mandíbula de la cara y el flequillo lateral: arista de la mandíbula + arista del pelo → **F**. Por eso hacía falta unir los objetos. |

### Púas traseras — 13:29 a 16:20
| min | paso | detalle |
|---|---|---|
| 13:36 | Leer | Atrás hay 3 púas: A, B y C. Por la simetría solo se modelan **la A y media B (la central)**. |
| 13:57 | Púa A | Arista inferior trasera del casquete → **E** (sale una cara) → face select (3) → **E** otra vez → **M > At Center** → la cara extruida colapsa en una punta (pirámide). `G` abajo, `G Y` adentro, `G Z` arriba, ajustar. |
| 14:39 | Púa central | Ocultar lo que estorba (`H`). Desde la arista central: extruir arista → face select → extruir la cara → **M > At Center**. |
| 15:00 | **Centrar en X=0** | Vertex select la punta → **N > Item > Vertex X = 0**. "Asegura que esté en el centro perfecto". Igual para el otro vértice central. |
| 15:40 | Soldar | 2 vértices que deben ser uno → **M > At Last**. Mover a gusto. Lateral: meter algunos y bajar otros. |
| 16:22 | Fin | Las púas no son 1:1 con la referencia; está bien. |

## Topología y por qué

- **Casquete = caja sin base, media caja con 2 loop cuts extra**: con eso alcanzan ~6 caras por mitad para tener cresta central, techo a dos aguas, costados y frente. La cresta en X=0 da la lectura de "pelo con raya/volumen" sin modelar mechones.
- **El borde del casquete define la línea del flequillo**: por eso se sube (8:02). El flequillo cuelga de esa arista; si el casquete baja demasiado, la frente desaparece.
- **Flequillo = tira extruida + punta triangular**: cada mechón es una arista extruida (1 quad) más un triángulo con `Merge At Center`. Se mueve un poco adelante en Y para que no atraviese la frente.
- **Triángulos donde la referencia tiene un solo vértice**: ella colapsa quads a triángulos con Merge At Last cada vez que la silueta tiene una punta. Así se ahorran polígonos y las puntas quedan afiladas, típico del pelo anime.
- **Las púas son pirámides de 1 cara extruida y colapsada** (extrude face + merge center): tienen volumen (3-4 caras) con muy pocos polígonos y se leen desde cualquier ángulo.
- **Unir pelo y cara** para cerrar los huecos con F: no quedan rendijas entre el pelo y la mandíbula por donde se vería el fondo (la cara es una máscara abierta).
- **Las piezas centrales se fuerzan a X=0** (panel N) para que el Mirror las suelde y no queden costuras.

## Cómo hacerlo con script (bpy/bmesh)

Casi todo se puede hacer con bmesh. El único criterio "a ojo" es la silueta: ver con `look` en front/side/back y corregir coordenadas.

```python
import bpy, bmesh
from mathutils import Vector

def cap_half(w=0.12, d=0.13, h=0.10, ridge_drop=0.03):
    """Media caja sin base (x>=0) con loop cuts: lado 2x2, techo 2, frente 2."""
    bm = bmesh.new()
    xs, ys, zs = (0.0, w), (-d, 0.0, d), (0.0, h/2, h)   # y: adelante(-) medio atrás(+)
    # bmesh.ops.create_cube + bisect también sirve; acá se construye directo
    g = {}
    def v(x, y, z):
        k = (round(x,5), round(y,5), round(z,5))
        if k not in g: g[k] = bm.verts.new((x, y, z))
        return g[k]
    # techo (z=h) y lado (x=w) y frente/atrás
    for y0, y1 in ((ys[0], ys[1]), (ys[1], ys[2])):
        bm.faces.new([v(0,y0,h), v(w,y0,h), v(w,y1,h), v(0,y1,h)])                 # techo
        for z0, z1 in ((zs[0], zs[1]), (zs[1], zs[2])):
            bm.faces.new([v(w,y0,z0), v(w,y1,z0), v(w,y1,z1), v(w,y0,z1)])         # lado
    for y in (ys[0], ys[2]):
        for z0, z1 in ((zs[0], zs[1]), (zs[1], zs[2])):
            bm.faces.new([v(0,y,z0), v(w,y,z0), v(w,y,z1), v(0,y,z1)])             # frente/atrás
    # cresta: bajar la arista superior exterior (x=w, z=h)
    for vv in bm.verts:
        if abs(vv.co.x - w) < 1e-6 and abs(vv.co.z - h) < 1e-6:
            vv.co.z -= ridge_drop
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm
```

Operaciones del video y su equivalente:
- **Extruir arista y bajar**: `r = bmesh.ops.extrude_edge_only(bm, edges=[e1, e2])`; `nv = [g for g in r['geom'] if isinstance(g, bmesh.types.BMVert)]`; `bmesh.ops.translate(bm, verts=nv, vec=(0,-0.01,-0.06))`.
- **E + M At Center (punta)**: extruir la arista, tomar sus 2 vértices nuevos y `bmesh.ops.pointmerge(bm, verts=nv, merge_co=sum((v.co for v in nv), Vector())/len(nv))`. Después mover la punta (`co += offset`).
- **Púa (extrude face + merge center)**: `r = bmesh.ops.extrude_discrete_faces(bm, faces=[f])` o `extrude_face_region`; tomar los vértices de la cara nueva → `pointmerge` en su centro + offset hacia afuera/atrás. Sale una pirámide.
- **Merge At Last**: `bmesh.ops.pointmerge(bm, verts=[a, b], merge_co=b.co.copy())`.
- **Fill F**: `bmesh.ops.contextual_create(bm, geom=[e1, e2])` (igual que F: con 2 aristas que comparten un vértice hace un triángulo, con 2 aristas paralelas un quad) o `bm.faces.new([v1, v2, v3])` explícito.
- **Ctrl+J**: `with bpy.context.temp_override(active_object=face, selected_editable_objects=[face, hair]): bpy.ops.object.join()`. O sin operadores: armar todo en un solo bmesh desde el principio.
- **N > Vertex X = 0**: `v.co.x = 0.0` (y en general: `for v in bm.verts: if abs(v.co.x) < 1e-4: v.co.x = 0`).
- **Ocultar estorbos (H)**: no hace falta en script.
- **A mano / a ojo**: el calce con la referencia (4:10-8:02) y el "flow" de las puntas. Por script: definir las puntas como una lista de offsets (dirección + largo) e iterar con `look`. Conviene dejar los parámetros (largo de cada púa, ángulo, caída de la cresta) arriba del script para ajustarlos rápido.

## Descargas / links

- Igual que el video 04: Love-chan turnaround (Patreon 108245592), Gumroad del curso (modelo final + PDF de modelado + videos), models-resource.com para estudiar topología de pelo de juegos PS1/N64 (Mega Man Legends). No se mencionan add-ons.
- Activa **Screencast Keys** (add-on) para mostrar las teclas en pantalla (2:05). Es solo para grabar; no lo necesitamos.

## Para nuestro proyecto (NETO512 → pelo castaño corto despeinado + casco)

- **Receta de pelo para la chica de sinaboto** (corto, castaño, despeinado): casquete-caja con cresta (como acá) + **4-6 puntas cortas** alrededor del borde: 2-3 mechones de flequillo (extrude edge + merge center) y 3-4 puntas en la nuca y sobre las orejas (extrude face + merge center). Lo "despeinado" se logra con:
  1. Puntas de **distinto largo y dirección** (offsets con un `random.Random(seed)` fijo para que sea reproducible).
  2. **Asimetría después de aplicar el Mirror** (video 06): mover 2-3 puntas solo de un lado.
  3. Puntas que salen un poco **hacia afuera** (normal del borde + algo de -Z), no solo hacia abajo.
- **Con casco: el casquete casi no se ve**. Opción barata: el **casco ES el casquete** (la misma técnica: caja sin base con cresta central = la cresta típica de un casco de obra) + un ala (extruir el loop del borde inferior hacia afuera y escalarlo; ala delantera más larga). El pelo se reduce a un **anillo de puntas que asoman bajo el ala**: flequillo, patillas y nuca. Se ahorran todos los triángulos del techo del pelo.
  - Si el casco va como objeto aparte (para quitárselo en algún plano), dejar el casquete del pelo **por debajo** del casco (escalarlo 0.95 alrededor del centro de la cabeza) para que no atraviese el casco con el vertex snapping.
- **Pelo unido a la cabeza + fill contra la mandíbula**: en NETO512 el pelo y la cabeza probablemente comparten el hueso `head` de Rigify. Si el pelo nuevo se une al mesh del cuerpo, hay que **asignarle el grupo de vértices del hueso de la cabeza con peso 1** (`vg.add(indices, 1.0, 'REPLACE')`) para que no se deforme con el cuello. Cerrar los huecos pelo-cara con `contextual_create` evita que se vea el fondo en el motor three.js (los materiales de un solo lado no muestran las caras de atrás).
- **Material sin luz (Emission) + mechones pintados en la textura**: coincide con nuestro pipeline (textura de 256 con los valores pintados). Los mechones del casquete pueden ir pintados en la textura (líneas oscuras en V de castaño) en vez de modelados.
- Mantener las piezas centrales en **X=0 exacto** antes de aplicar el Mirror/exportar el GLB: si no, quedan rendijas que se ven en el render PS1.
