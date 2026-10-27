---
type: reference
status: active
tags: [crashsune, blender, low-poly, anime, pelo, flequillo-asimetrico, aplicar-mirror, knife, fill, bpy]
relatedTo: [crashsune-low-poly-series]
---

# 06 · Terminar el pelo: nuca, laterales, flequillo asimétrico — Crashsune

"Finishing the Hair model! Blender 3D Character Modeling Tutorial - Part 6 [2024]"
https://www.youtube.com/watch?v=KizxbPA1yGM · 13:09
Fuente: transcript + 4 hojas de frames + ~22 frames extra (`playlist/06/extra/`).
Sigue desde [05-pelo-parte-superior](05-pelo-parte-superior.md); las operaciones bmesh están ahí.

## Idea central

- El pelo inferior y los laterales se cierran con un **ciclo corto que se repite**: extruir un vértice (`E` en vertex select hace una arista nueva) → `M > At Last` sobre un vértice vecino → edge select → `F` para rellenar. Así se crean **triángulos sueltos** que tapan los huecos entre el casquete, la mandíbula y las púas. Ella dice que es "el camino largo, pero funciona".
- Las aristas que faltan se cortan con **Knife** para que no queden agujeros ("los agujeros no son divertidos").
- El **flequillo final se hace después de aplicar el Mirror**, para que sea **asimétrico** ("suele verse estéticamente mejor").
- El capítulo cierra el modelado: se agrega un Mirror a todas las piezas que no lo tenían (pie, mano, brazo, pierna).

## Pasos con minutos

| min | paso | detalle |
|---|---|---|
| 0:23 | **Aislar** | Seleccionar el modelo → `/` (barra del teclado numérico o la de al lado de Shift) = Local View. `/` otra vez para salir. Permite ver la parte de abajo del pelo sin el cuerpo. |
| 1:11 | Proporciones | Meter un vértice, bajar otro: el pelo inferior "va mucho más abajo". Dos vértices → `M > At Last`. |
| 1:46 | Triángulo 1 | Vertex select → `E` (extruir el vértice) → Shift+clic en el vértice destino → `M > At Last` → edge select (2) → seleccionar las aristas del borde del hueco → `F`. |
| 2:07 | Triángulo 2 | Igual: `E` desde un vértice, `E` otra vez, fusionar At Last con el vecino → seleccionar 2 aristas → `F`. |
| 2:27 | Extruir desde arista | Edge select → `E` → vertex select → Shift+clic → `M > At Last`. Bajar el vértice para alinearlo con la referencia. Unir dos vértices más (At Last). |
| 3:07 | **Knife hacia la mandíbula** | Un vértice de la mandíbula tiene que conectarse con el pelo: `K`, clic, clic, Enter → mover el vértice nuevo → `M > At Last` sobre el vértice del pelo. Así la cara y el pelo comparten vértices: no quedan rendijas. |
| 3:49 | Lateral | Numpad 3, comparar con la referencia lateral. |
| 4:02 | **Mechón lateral** | Edge select en el borde lateral → `E` → `M > At Last` para cerrarlo en triángulo; repetir para un segundo segmento → `G Z` arriba. Otra arista → `E` y sacarla **hacia afuera y rotada**: queda un mechón triangular que sale en diagonal desde la mandíbula (las "alas" laterales del corte bob anime). |
| 5:11 | Rellenar agujero | `E` desde un vértice + `M At Last` + 2 aristas → `F`. |
| 5:33 | Arriba del mechón | Unir 2 vértices ("At First o At Last, da igual") → `E` + `M At Last` → 4 aristas → `F` (n-gon/quad). Repetir 2-3 veces "click click fill". |
| 6:41 | Frontal | Mover los vértices del pelo hacia afuera (`G`) para que la silueta frontal calce: el pelo se abre en punta a los lados de la mandíbula. |
| 7:19 | Agujero en lateral | `Alt+A` → Knife desde un vértice → clic → Enter → `M At Last` del vértice nuevo con el vecino. |
| 7:40 | Ajustes finales | Subir/meter vértices a gusto. `/` para salir del aislamiento. |
| 8:23 | Cuello | Aislar el cuello, subir sus vértices superiores (se veía raro bajo la mandíbula). |
| 8:44 | **Aplicar el Mirror** | En **Object Mode**, modificador Mirror → **Apply**. Ahora se pueden editar los dos lados por separado. |
| 9:04 | Knife para el flequillo | `T` muestra la barra de herramientas → Knife: corte horizontal sobre la frente del casquete, de un punto a otro → Enter. Restaurar la referencia: Object Mode `Alt+H`, ocultar el esqueleto (`H`). |
| 9:45 | Mechón 1 | Edge select la arista cortada → `E` hacia abajo → `M > At Center` (punta) → vertex select y "scooch" a gusto con `G X`. |
| 10:06 | **Knife para limitar la extrusión** | `Alt+A`, cortar con Knife **antes** de extruir, para que la arista que se extruye cubra solo **ese tramo** y no el borde entero ("se ve mucho mejor para un flequillo"). `E` → `M At Center` → mover. |
| 10:47 | Asimetría | Mover un mechón a un lado y bajar otro: "agregar asimetría, suele verse bien". |
| 11:10 | X-Mirror opcional | El botón **X** de simetría (arriba a la derecha del viewport, Mesh Symmetry) espeja las ediciones aunque el Mirror ya esté aplicado; ella lo deja apagado para que los lados queden distintos. Mete los mechones (`G`) para que no atraviesen la cara. |
| 11:52 | Mirror al resto | Object Mode → pie, mano, brazo, pierna: `Add Modifier > Mirror` a cada uno. **El modelado está terminado.** Lo que sigue: UVs y texturas. |

## Topología y por qué

- **El pelo inferior es una corona de triángulos**: no hay loops ni quads ordenados. Cada triángulo existe para cerrar un hueco o para formar una punta de la silueta. En low poly, **la silueta manda y la topología interna no importa** (no se va a subdividir ni a deformar fuerte: el pelo va rígido con la cabeza).
- **Pelo y mandíbula comparten vértices** (Knife + Merge At Last): el borde de la máscara de la cara queda cosido al pelo. No hay rendijas ni z-fighting.
- **Los mechones laterales salen hacia afuera y en diagonal**: dan la silueta de "bob" anime vista de frente (las puntas a los lados de la mandíbula, 6:41) con 2-3 triángulos por lado.
- **El flequillo se hace después del Mirror y con cortes de Knife**: el corte limita qué tramo de arista se extruye, y así cada mechón tiene su propio ancho. La asimetría rompe la sensación de espejo, que se nota mucho en el centro de la cara.
- Partes del cuerpo **separadas con su propio Mirror**: cada pieza se espeja sola. Se unen y se aplican más adelante (UV/rig).

## Cómo hacerlo con script (bpy/bmesh)

- **Aislar (`/`)**: no hace falta. Para revisar por script: `look` con la cámara apuntada al objeto, o ocultar los demás con `ob.hide_set(True)`.
- **Extruir vértice + Merge At Last + F**: en script basta con **crear el triángulo directo**: `bm.faces.new([va, vb, vc])` con los 3 vértices existentes del hueco. Para encontrar los huecos: `[e for e in bm.edges if e.is_boundary]`. Ordenar el loop del borde y cerrar los tramos que corresponden con `bmesh.ops.contextual_create(bm, geom=[e1, e2])` o `bmesh.ops.triangle_fill(bm, edges=tramo, use_beauty=True)`. Ojo: **no rellenar el borde inferior de la nuca ni el hueco de la cara** (son aberturas que tienen que quedar).
- **Knife entre dos vértices** de una cara: `bmesh.ops.connect_verts(bm, verts=[a, b])`. Corte en medio de una arista: `bmesh.utils.edge_split(edge, edge.verts[0], 0.5)` devuelve el vértice nuevo. Después `connect_verts`.
- **Coser pelo y mandíbula**: después de unir (Ctrl+J → `bpy.ops.object.join` con `temp_override`), `bmesh.ops.pointmerge` de cada par vértice-pelo/vértice-mandíbula, o `bmesh.ops.remove_doubles(bm, verts=borde, dist=0.003)` solo sobre los vértices del borde.
- **Aplicar el Mirror**: `with bpy.context.temp_override(object=ob, active_object=ob): bpy.ops.object.modifier_apply(modifier='Mirror')`. Sin operadores: `ev = ob.evaluated_get(depsgraph); me = bpy.data.meshes.new_from_object(ev)` y reemplazar `ob.data`, después `ob.modifiers.remove(m)`.
- **Flequillo asimétrico**: corte = `edge_split` en la arista del borde del casquete en las fracciones elegidas (por ejemplo 0.35 y 0.7) → `extrude_edge_only` del tramo → `pointmerge` en el centro → la punta se mueve con un offset **distinto en cada lado** (seed fija).
- **Mirror a cada pieza**: `for ob in piezas: m = ob.modifiers.new('Mirror', 'MIRROR'); m.use_clip = True; m.use_mirror_merge = True`.
- **Necesita ojo**: decidir qué huecos rellenar y hacia dónde apuntan los mechones. Solución: 2-3 rondas de `look` (front, side, 3/4, de abajo) y corregir los offsets. No hace falta trabajo manual en la UI.

## Descargas / links

- No se mencionan add-ons ni descargas nuevas. Son los mismos links del 04/05: Love-chan turnaround (Patreon), Gumroad del curso con el modelo final, y la serie completa: https://www.youtube.com/playlist?list=PLcaQc6eQjXCxWXmn5jxE_GTOft9ZxChu1
- Lo que sigue en la serie: UVs y texturas (otros bloques).

## Para nuestro proyecto (NETO512 → chica @sinaboto)

- **Pelo corto despeinado = esta receta recortada**: casquete (o el casco) + corona de triángulos en la nuca + 1 mechón lateral por lado a la altura de la oreja/mandíbula + 2-3 mechones de flequillo asimétricos. Para que sea "corto", las puntas no bajan de la mitad de la oreja ni de la línea de la mandíbula. Para que sea "messy", hay que **romper la simetría después de aplicar el Mirror** (hacerlo por script con offsets seeded) y variar el largo.
- **Encaje con el casco**: hacer los mechones visibles **desde el borde del ala hacia abajo**. El flequillo sale de debajo del ala delantera (extruir desde un loop un poco más bajo que el borde del casco) y la nuca de debajo del ala trasera. El knife que limita la extrusión (10:06) sirve para elegir exactamente qué tramos asoman.
- **Coser el pelo a la cabeza de NETO** (`pointmerge` o `remove_doubles` con una distancia chica sobre los bordes) solo si el pelo va dentro del mismo mesh; si va como objeto aparte, mejor **meter el borde del pelo 2-3 mm dentro de la cabeza** que coser (más simple y a prueba del vertex snapping).
- **Presupuesto**: NETO512 tiene 540 triángulos. Esta técnica de corona de triángulos debería dar un pelo de ~60-100 triángulos (estimación). Hay que contar con `sum(len(p.vertices)-2 for p in me.polygons)` antes de exportar el GLB.
- **Rig**: el pelo nuevo va 100 % al hueso de la cabeza de Rigify (en el GLB exportado, el deform bone `DEF-spine.006` o el que use NETO). Verificar el nombre en el armature antes de asignar el vertex group.
- **Aplicar el Mirror antes de exportar el GLB**: glTF lo exporta evaluado si "Apply Modifiers" está marcado. Igual conviene aplicarlo por script para controlar el resultado y poder hacer la asimetría.
