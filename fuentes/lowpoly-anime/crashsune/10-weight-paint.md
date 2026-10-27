---
type: reference
status: active
tags: [crashsune, blender, weight-paint, vertex-groups, rigify, auto-normalize, bone-collections, bone-parenting, bpy, gltf, three-js, accesorios]
relatedTo: [crashsune-low-poly-series, 09-rigify-rig]
---

# 10 · How To Weight Paint Your Characters: Crashsune, parte 10 (24:29)

https://www.youtube.com/watch?v=Xooago2F8h8 · 2024-08-29 · Blender **4.2.1 LTS**.
Visto entero: transcript, las 7 hojas de frames y 25 frames extra (lista de vertex groups, panel de pincel, falloff, Front Faces Only, Auto Normalize, gradiente en el torso, colecciones DEF, hueso nuevo, Ctrl+P con grupos vacíos, Relations → Parent).
Sigue donde terminó [09-rigify-rig](09-rigify-rig.md): al mover la mano se mueven también **mechones del pelo** y **el borde del cuello** del torso.

## Enlaces de la descripción
Solo el curso de pago y los freebies de Crashsune (crashsune.com), Patreon y la playlist. **No hay add-ons ni descargas técnicas.** No sale "Dynamic Parent".

## Pasos con minuto, ajustes y equivalente bpy

### 0:30 · Entrar en Weight Paint y entender los vertex groups
- Seleccionar la malla en Object Mode → menú de modo **Weight Paint** (o Ctrl+Tab → Weight Paint).
- Azul = el grupo activo no tiene peso ahí. El grupo activo se elige en la cabecera del viewport (desplegable con el nombre, p. ej. `DEF-spine.006`) o en Object Data → **Vertex Groups**. Ella los recorre con las **flechas ↑/↓** del teclado.
- Rigify creó un vertex group `DEF-*` por cada hueso al hacer *With Automatic Weights*. La cabeza es **`DEF-spine.006`** (en el audio dice "spine 001", pero la pantalla muestra `.006`).
- Escala de colores (rótulo en 2:04): **0.0 = 0 % (azul)** → verde 0.5 → **1.0 = 100 % (rojo)**. Son porcentajes de influencia por vértice.

```python
import bpy
hair = bpy.data.objects["hair"]
bpy.context.view_layer.objects.active = hair
bpy.ops.object.mode_set(mode='WEIGHT_PAINT')
hair.vertex_groups.active_index = hair.vertex_groups["DEF-spine.006"].index
# leer pesos (más útil que mirar colores):
g = hair.vertex_groups["DEF-spine.006"].index
w = {v.index: next((x.weight for x in v.groups if x.group == g), 0.0) for v in hair.data.vertices}
```

### 2:48 · Herramientas
Barra de herramientas: **Draw, Blur, Average, Smear, Gradient, Sample Weight, Annotate**.
- **Weight** = el valor que pintas (0–1). **Strength** = la "opacidad" del trazo. Weight 0 + Strength 0.5 sobre un vértice rojo da verde, igual que Weight 0.5 + Strength 1.
- Strength baja sirve sobre todo para **Gradient** y **Blur**. Ejemplo (4:48): vista lateral ortográfica, Weight 0, Strength 0.5, arrastrar con Gradient y queda un degradado suave. Gradient tiene modo **Linear / Radial**.
- **Symmetry X**: en Rigify los huesos son simétricos, así que pintar la rodilla izquierda pinta también la derecha.
- Atajos (20:15): **F** = radio, **Shift+F** = strength (opacidad), **Ctrl+F** = weight.

### 5:31 · Ajustes del pincel (N → Tool, o Properties → Tool)
- **Falloff → Custom → preset plano** (curva constante): con cada clic el vértice queda exactamente al 100 % (o al valor elegido). "En low poly casi siempre pintas 100 % o 0 %"; el falloff suave estorba.
- **Advanced → Front Faces Only** (en 4.2 está junto a *Accumulate*): si está activado, solo pintas lo que ves.
- **Falloff Shape: Sphere / Projected**. Para pintar *a través* de la malla hacen falta **las dos cosas**: Front Faces Only apagado **y** Projected (8:37). Sirve para cilindros que deben tener el mismo peso alrededor. Ella lo devuelve a Sphere y Front Faces Only.
- **X-ray en Weight Paint**: con Rendered/Material Preview sale "X-ray not available in current mode". Hay que pasar a **Solid** y pulsar **Alt+Z**. Para seguir viendo la textura: Solid → Color → **Texture** (7:34–7:55).

### 9:25 · **Auto Normalize** ("la opción más frustrante de Blender")
- Tool → **Options → Auto Normalize** (junto a Lock-Relative, Multi-Paint, Restrict). **Viene apagado** y ella lo activa **siempre**.
- Sin él, la suma de influencias de un vértice puede pasar del 100 %. Con él, al subir el peso de un hueso **se le quita a los demás**. También corrige zonas que ya pasaban del 100 %.
- Modos de máscara (1 = caras, 2 = vértices): "en low poly casi nunca hacen falta".

```python
ts = bpy.context.scene.tool_settings
ts.use_auto_normalize = True
ups = ts.weight_paint.unified_paint_settings  # Blender 5.x (en 4.2 era ts.unified_paint_settings)
ups.use_unified_weight = True; ups.weight = 1.0
ups.use_unified_strength = True; ups.strength = 1.0
# el falloff plano / Front Faces Only son del pincel: ts.weight_paint.brush (en 5.x los pinceles son assets)
ts.use_multipaint = False
# tras editar pesos por script, normalizar a mano (Auto Normalize solo actúa al pintar):
bpy.ops.object.vertex_group_normalize_all(group_select_mode='BONE_DEFORM', lock_active=False)
```

### 11:31 · Arreglar el pelo (todo a la cabeza)
- Malla del pelo → Weight Paint → grupo **`DEF-spine.006`** → Auto Normalize **activado** (si no, no funciona) → **Gradient**, Weight 1.0, Strength 1.0 → arrastrar hacia arriba **varias veces** hasta que todo el pelo quede rojo.
- Como Auto Normalize resta el peso a los otros huesos, el pelo ya no sigue a la mano.

```python
# equivalente determinista: pelo 100 % a la cabeza y 0 en los demás grupos
hair = bpy.data.objects["hair"]
idx = [v.index for v in hair.data.vertices]
for vg in hair.vertex_groups:
    if vg.name != "DEF-spine.006":
        vg.remove(idx)
hair.vertex_groups["DEF-spine.006"].add(idx, 1.0, 'REPLACE')
```

### 12:42 · Arreglar el torso (cuello que seguía al brazo)
- Objeto torso (`Cube.008`) → recorrer los grupos con las flechas → el que más peso tiene es **`DEF-spine.002`** → Gradient con Weight 1, Strength 1 → todo el torso al 100 % en spine.002 (frame 12:55: torso azul en `DEF-hand.R`, o sea sin influencia de la mano).
- Opcional: grupo **`DEF-spine.001`**, Strength ≈ **0.53**, arrastrar un poco hacia arriba desde la cintura para que comparta algo con spine.001 (13:04, frame 13:25).
- Probar: rig → Pose → mover la mano. El cuello ya no se mueve.

```python
# degradado vertical por script (como el Gradient): spine.002 arriba, spine.001 abajo
import bpy
o = bpy.data.objects["torso"]; z0, z1 = 1.05, 1.20          # alturas mundo de la mezcla
A, B = o.vertex_groups["DEF-spine.002"], o.vertex_groups["DEF-spine.001"]
keep = {A.name, B.name}
idx = [v.index for v in o.data.vertices]
for vg in o.vertex_groups:
    if vg.name not in keep: vg.remove(idx)
for v in o.data.vertices:
    z = (o.matrix_world @ v.co).z
    t = min(1.0, max(0.0, (z - z0) / (z1 - z0)))
    A.add([v.index], t, 'REPLACE'); B.add([v.index], 1.0 - t, 'REPLACE')
```

### 14:09 · Bone Collections: ver los DEF y previsualizar pesos
- Rig seleccionado → Object Data → **Bone Collections**. Son las mismas que los botones *Rig Layers* de la parte 09; abajo están además **ORG, MCH, DEF**.
- La **estrella** de la colección **DEF** la aísla (solo); otro clic la desactiva.
- Rig, luego Shift+clic en la malla → Weight Paint. Así se ven los huesos dentro de la malla. Para cambiar el grupo activo haciendo clic en un hueso, ella dice **Alt+clic izquierdo** (en el keymap por defecto suele ser Ctrl+clic; prueba los dos). En el torso: spine.002 tiene la mayor parte, spine.001 un poco y spine.003 nada.
- En ese modo puedes posar con R/G/S para ver la deformación, **pero no funciona con los DEF** (tienen restricciones): hay que posar los controles.

```python
rig = bpy.data.objects["rig"]
rig.data.collections_all["DEF"].is_solo = True      # la "estrella"
rig.data.collections_all["DEF"].is_solo = False
```

### 16:12 · Añadir un hueso de pelo (movimiento secundario: pelo, colas, orejas)
1. Rig → quitar el solo de DEF → **Tab (Edit)** → **Shift+A** añade un hueso nuevo, llamado `Bone`.
2. Bone Collections → **+** → la nueva se llama "Bones"; ella la renombra a **`Hair`** → con el hueso seleccionado, **Assign**. Con la estrella se comprueba que contiene un solo hueso. El hueso también quedó en `Torso`, que era la colección activa.
3. Vista frontal (1) → **G Z**, **R**, **S** para colocarlo sobre el mechón frontal. El **head (el punto de pivote) arriba** y la tail hacia la punta del mechón. Vista lateral (3) → G Y.
4. **F2** renombra a **`Hair_Front`**. Bone Properties → Viewport Display → **Bone Color: "11 - Theme Color Set"** (morado). Datos en pantalla: head (0.0315, -0.2049, 1.7848), tail (-0.0183, -0.2114, 1.4713), roll −154°. **Deform** activado.
5. Malla del pelo → Shift+clic en el rig → **Ctrl+P → Armature Deform → With Empty Groups** (en vez de automatic weights, "que a veces no hace lo que quieres"). Aparece el vertex group vacío `Hair_Front`.
6. Weight Paint en el pelo → grupo `Hair_Front` → **Draw**, Weight 1, Strength 1 → pintar los vértices del mechón al 100 %.
7. Problema: al girar la cabeza, el hueso nuevo no la sigue (no tiene padre). **Edit Mode** (en Object Mode el campo no aparece) → Bone Properties → **Relations → Parent: `DEF-spine.006`**, sin *Connected*. Sale una línea punteada hasta la cabeza y desde entonces el hueso sigue la cabeza.

```python
import bpy
rig = bpy.data.objects["rig"]; hair = bpy.data.objects["hair"]
bpy.context.view_layer.objects.active = rig
bpy.ops.object.mode_set(mode='EDIT')
e = rig.data.edit_bones.new("Hair_Front")
e.head = (0.0315, -0.2049, 1.7848); e.tail = (-0.0183, -0.2114, 1.4713)   # espacio del armature
e.use_deform = True
e.parent = rig.data.edit_bones["DEF-spine.006"]; e.use_connect = False
bpy.ops.object.mode_set(mode='OBJECT')
b = rig.data.bones["Hair_Front"]
coll = rig.data.collections.new("Hair"); coll.assign(b)
b.color.palette = 'THEME11'
# "With Empty Groups" = crear el grupo con el nombre del hueso
vg = hair.vertex_groups.get("Hair_Front") or hair.vertex_groups.new(name="Hair_Front")
strand = [v.index for v in hair.data.vertices if (hair.matrix_world @ v.co).y < -0.19 and abs((hair.matrix_world @ v.co).x) < 0.06]
vg.add(strand, 1.0, 'REPLACE')
hair.vertex_groups["DEF-spine.006"].remove(strand)       # lo que haría Auto Normalize
# o con operador: seleccionar hair + rig activo → bpy.ops.object.parent_set(type='ARMATURE_NAME')
```

**Ojo (nota mía, no sale en el vídeo):** ese hueso se añadió en el **rig generado**, así que **un Re-Generate de Rigify lo borra**. La forma "Rigify" es añadirlo al **metarig**, con Bone → Rigify Type **`basic.super_copy`** (o `basic.raw_copy`) y padre `spine.006`. Así Rigify genera control + `DEF-` + `ORG-` al regenerar. Parentar a un `DEF-` funciona porque el DEF sigue a la cabeza, pero la convención de Rigify es parentar a `ORG-spine.006`.

## Resumen de valores
| cosa | valor |
|---|---|
| falloff del Draw en low poly | Custom → curva plana (constante) |
| Weight / Strength para "todo a un hueso" | 1.0 / 1.0, Gradient arrastrado varias veces |
| mezcla suave | Strength ≈ 0.5 con Gradient o Blur |
| Auto Normalize | **siempre activado** |
| pintar a través de la malla | Front Faces Only **apagado** + Falloff Shape **Projected** |
| x-ray en Weight Paint | Solid + Alt+Z (+ Color: Texture) |
| atajos | F radio, Shift+F strength, Ctrl+F weight, ↑/↓ cambiar grupo |
| hueso nuevo con pesos a mano | Ctrl+P → Armature Deform → **With Empty Groups** |

---

## Para nuestro proyecto (NETO512): accesorios rígidos sobre su rig

Probado en background con Blender 5.2 sobre `assets/neto512/neto.blend` (exportando a GLB y releyendo los nodos).

### Auditoría de pesos de NETO (antes de añadir nada)
| malla | vértices | grupos con peso | máx. influencias |
|---|---|---|---|
| hair-front, eyes, eyebrows, mouth | 6–15 | solo `DEF-spine.006` | 1 |
| pupils | 9 | `DEF-eye.l` (el Mirror crea .r) | 1 |
| **hair-general** | 64 | `DEF-spine.006` 58, **`DEF-shoulder.L` 17**, spine.005 15, spine.004 12, spine.003 6, spine.002 5, **`DEF-upper_arm.L` 3** | 4 |
| upper-body | 78 | spine.002/.001/.006, upper_arm.L, shoulder.L… | **6** |
| lower-body | 75 | pelvis, thigh, shin, spine… | **5** |

- `hair-general` tiene **el mismo problema que Love-chan**: vértices pesados al hombro y al brazo. Si al subir el brazo el pelo se estira, aplicar el script "pelo 100 % a la cabeza" (sección 11:31) a esos vértices. Si es pelo largo que apoya en los hombros, mejor dejar shoulder pero quitar `DEF-upper_arm.L`.
- upper-body y lower-body pasan de **4 influencias**. glTF/three.js usan 4 por vértice y el exportador recorta las demás. Mejor controlar el recorte antes: `bpy.ops.object.vertex_group_limit_total(group_select_mode='BONE_DEFORM', limit=4)` + `vertex_group_normalize_all(...)`.
- Ojo con el **Mirror**: los grupos `.L` se reflejan a `.R` en el modificador. Si editas pesos, edita la mitad +X.

### Tres formas de pegar un accesorio rígido
| método | en Blender | en el GLB / three.js | úsalo para |
|---|---|---|---|
| **A. Parentado a hueso** (Ctrl+P → *Bone*) | `parent_type='BONE'`, `parent_bone='DEF-…'` | un `Mesh` normal, **hijo del nodo** `DEF-spine.006` (verificado). Barato y se puede mostrar u ocultar | casco, herramienta |
| **B. Skin rígido** (vertex group = nombre del hueso, peso 1.0 + Armature) | igual que el cuerpo | `SkinnedMesh` con el mismo esqueleto (verificado: posición exacta tras el round-trip) | piezas pegadas al cuerpo, o si quieres unirlas en una sola malla |
| **C. Enganche en runtime** (three.js) | exportar el accesorio como GLB aparte | `bone.add(mesh)` | herramientas intercambiables, cascos opcionales |

**Reglas que comprobé:**
1. **Parentar en pose de REPOSO.** Si parentas (A) con la cabeza girada y luego reseteas la pose, el casco se va con la cabeza: medí **4,6 cm de desfase** en el GLB. Antes de parentar: `rig.data.pose_position = 'REST'` (o resetear todos los pose bones). Después lo vuelves a `'POSE'`.
2. **Parentar siempre a un `DEF-`**, nunca a un control (`head`, `hand_ik.R`). Con `export_def_bones=True` los controles no se exportan y el objeto se quedaría sin padre válido. En Blender el DEF sigue a los controles, así que funciona igual.
3. El hueso de la cabeza mide **0,2344 m** y el de la mano derecha **0,0776 m**. La tail está en `(0, length, 0)` local, y +Y va a lo largo del hueso.

```python
# A) casco parentado a la cabeza (sin desplazar el objeto)
import bpy
rig = bpy.data.objects["rig"]; hat = bpy.data.objects["hardhat"]
rig.data.pose_position = 'REST'; bpy.context.view_layer.update()
mw = hat.matrix_world.copy()
hat.parent = rig; hat.parent_type = 'BONE'; hat.parent_bone = "DEF-spine.006"
hat.matrix_world = mw                         # mantiene la posición (comprobado: error 3e-9 m)
rig.data.pose_position = 'POSE'

# B) herramienta como skin rígido a la mano derecha
tool = bpy.data.objects["tool"]
tool.parent = rig; tool.matrix_parent_inverse = rig.matrix_world.inverted()
vg = tool.vertex_groups.new(name="DEF-hand.R")
vg.add(range(len(tool.data.vertices)), 1.0, 'REPLACE')
m = tool.modifiers.new("Armature", 'ARMATURE'); m.object = rig
```

```js
// C) three.js: enganchar en runtime (ojo: GLTFLoader quita los puntos de los nombres)
const head = neto.getObjectByName('DEF-spine006');      // 'DEF-spine.006' en Blender
hat.position.set(0, 0.2344, 0);                          // la tail del hueso de la cabeza, en su espacio local
head.add(hat);
const hand = neto.getObjectByName('DEF-handR');
hand.add(tool); tool.position.set(0, 0.0776 * 0.6, 0);   // ajustar rotación a ojo / con un empty de referencia
```
Con `SkeletonUtils.clone(NETO)` (como en `shots.js`) los hijos de los huesos se clonan junto con el personaje.

### Chaleco (cáscara que se deforma con el torso): copiar pesos del cuerpo
No es rígido: necesita los mismos pesos que `upper-body`. Lo que mejor sale es **Data Transfer** (pesos de la superficie más cercana) en lugar de *automatic weights*. Probado con una caja subdividida alrededor del torso: recibió los 35 grupos y sobre todo pesa en spine.002 (79 vértices), spine.001 (69), spine.004 (47), spine.003 (35) y los hombros. Suma mínima 0.79, así que **hay que normalizar después**.

```python
import bpy
rig = bpy.data.objects["rig"]; body = bpy.data.objects["upper-body"]; vest = bpy.data.objects["vest"]
rig.data.pose_position = 'REST'                          # transferir en reposo
dt = vest.modifiers.new("DT", 'DATA_TRANSFER')
dt.object = body; dt.use_vert_data = True; dt.data_types_verts = {'VGROUP_WEIGHTS'}
dt.vert_mapping = 'POLYINTERP_NEAREST'
dt.layers_vgroup_select_src = 'ALL'; dt.layers_vgroup_select_dst = 'NAME'
bpy.context.view_layer.objects.active = vest
bpy.ops.object.datalayout_transfer(modifier="DT")        # crea los grupos destino
bpy.ops.object.modifier_apply(modifier="DT")
bpy.ops.object.vertex_group_limit_total(group_select_mode='BONE_DEFORM', limit=4)
bpy.ops.object.vertex_group_normalize_all(group_select_mode='BONE_DEFORM', lock_active=False)
vest.parent = rig; vest.matrix_parent_inverse = rig.matrix_world.inverted()
vest.modifiers.new("Armature", 'ARMATURE').object = rig
rig.data.pose_position = 'POSE'
```
Si el chaleco es una cáscara rígida (placas duras), lo más limpio es pesar todo a `DEF-spine.003` (pecho) y quizá una franja inferior a `spine.002`, con el script de degradado de la sección 12:42.

### Si el accesorio necesita su propio hueso (p. ej. una correa que cuelga)
Hacer lo mismo que en el minuto 16:12: hueso nuevo en `rig`, `use_deform=True`, padre `DEF-spine.006` o `DEF-spine.003`, y llamarlo **`DEF-…`** para que el filtro de exportación lo trate igual. NETO no trae metarig, así que no hay Re-Generate que lo borre. Al no tener restricciones, en Blender se posa directamente y en three.js aparece como un joint más.

### Checklist antes de exportar (ver también 09-rigify-rig → "Exportar a GLB")
- [ ] Pose en reposo, accesorios parentados a `DEF-*` en reposo.
- [ ] Reparentado de los DEF (pelvis/thigh → spine, shoulder → spine.003, upper_arm → shoulder, eye → spine.006) para que la jerarquía de three.js sea útil.
- [ ] `limit_total(4)` + `normalize_all` en las mallas skinneadas nuevas.
- [ ] Que los accesorios entren en el filtro `keep` de `export_neto.py` (hoy solo exporta **hijos MESH de `rig`**, y con A, B y el chaleco lo son).
- [ ] En three.js, buscar los huesos por el nombre sin puntos (`DEF-spine006`, `DEF-handR`).
