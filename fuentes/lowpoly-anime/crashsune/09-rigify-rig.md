---
type: reference
status: active
tags: [crashsune, blender, rigify, rigging, metarig, low-poly, ps1, bpy, gltf, three-js]
relatedTo: [crashsune-low-poly-series, 10-weight-paint]
---

# 09 · Rig Your Character in 8 minutes (Rigify): Crashsune, parte 9 (19:29)

https://www.youtube.com/watch?v=4O3OKhYxNx8 · 2024-08-24 · Blender **4.2.1 LTS** en pantalla (nosotros usamos 5.2, ver diferencias abajo).
Visto entero: transcript, las 5 hojas de frames y unos 25 frames extra en los momentos clave (menú del metarig, mirror X, ajuste de huesos, Generate, Ctrl+P, Rig Layers, error de la columna, Re-Generate).
El personaje es Love-chan, una chica anime low poly hecha de **varios objetos sueltos** (pelo, cara, cuello, torso, brazos, manos, piernas, cintura, pies). No es una malla única.

## Enlaces de la descripción
| enlace | qué es | ¿para nosotros? |
|---|---|---|
| youtube.com/watch?v=3RSwjZLClRc, Doodley "3D Rigging is Beautiful" | teoría: skeleton vs skinning vs controls | buena teoría; no hace falta descargar nada |
| youtube.com/watch?v=DDeB4tDVCGY, Joey Carlino "Rigging for Impatient People" | rigging en Blender, corto | recomendable si hay que hacer huesos a mano |
| youtube.com/watch?v=m-Obo_nC3SM, Joey Carlino "Rigging for Beginners" | lo mismo, más básico | opcional |
| crashsune.com/low-poly-course, crashsune.com/blender-freebies | curso de pago (incluye el .blend de Love-chan rigueado y un PDF de atajos) y freebies | no hace falta |

En este vídeo **no se menciona ningún add-on** aparte de Rigify, que viene con Blender. Tampoco aparece "Dynamic Parent".

## Pasos con minuto, ajustes y equivalente bpy

### 0:00–5:50 · Teoría con un cubo y dos huesos (demo; luego la borra)
- Cubo → Tab → escalar en Z → T → Loop Cut, **20 cortes** (0:43–1:04). Shift+A → Armature → Single Bone.
- Object Data Properties del armature (icono del hombrecito verde) → Viewport Display → **In Front**, para ver los huesos a través de la malla (1:25).
- **Head** = base (de aquí rota el hueso), **Tail** = punta. Se ven y editan en N → Item (1:46). E extruye un hueso nuevo desde la tail (2:06).
- Seleccionar la malla, luego Shift+clic en el armature (que queda **activo**) → **Ctrl+P → Armature Deform → With Automatic Weights** (2:26).
- **Ctrl+Tab** pasa de Object Mode a Pose Mode. A selecciona todo, **Alt+R / Alt+G / Alt+S** resetean la pose (3:07).
- Edit mode: Shift+D duplica un hueso, **Alt+P** le quita el padre. Sin padre, el hueso ya no sigue la cadena: la **jerarquía** es la clave del rig (3:28).
- Su método real: nunca hace los huesos a mano. Usa siempre un **metarig de Rigify**, que trae nombres, orientaciones y controles (menú de capas, formas de control) (5:09).

```python
# demo: parentar con pesos automáticos (selección: mallas + armature ACTIVO)
import bpy
rig = bpy.data.objects["Armature"]; mesh = bpy.data.objects["Cube"]
bpy.ops.object.mode_set(mode='OBJECT')
bpy.ops.object.select_all(action='DESELECT')
mesh.select_set(True); rig.select_set(True)
bpy.context.view_layer.objects.active = rig
bpy.ops.object.parent_set(type='ARMATURE_AUTO')   # 'ARMATURE_NAME' = grupos vacíos, 'BONE' = parentado a hueso
```

### 6:10 · Activar Rigify y crear el metarig "Basic Human"
- Edit → Preferences → Add-ons → buscar "rigify" → marcar → Save Preferences.
- **Shift+A → Armature → Rigify Meta-Rigs → Basic → Basic Human** (frame 6:35: el submenú tiene *Human*, *Animals* y *Basic*).
- **Por qué Basic Human y no Human**: el Human trae dedos, cara (boca, nariz, párpados) y es "demasiado para este estilo". Basic Human = columna + brazos + piernas + pies, sin dedos ni cara.
- Viewport Display → **In Front** activado.
- Colecciones de huesos del metarig que se ven en pantalla: `Torso`, `Torso (Tweak)`, `Arm.L (IK)`, `Arm.L (FK)`, `Arm.L (Tweak)`, lo mismo en R, `Leg.L/R (IK/FK/Tweak)`, `Root`.

```python
import bpy, addon_utils
addon_utils.enable("rigify", default_set=True, persistent=True)
bpy.ops.object.armature_basic_human_metarig_add()      # Basic Human
# bpy.ops.object.armature_human_metarig_add()          # Human completo (dedos + cara)
meta = bpy.context.object                              # se llama "metarig"
meta.show_in_front = True
```

### 7:17 · Escalar el metarig al personaje
- Vista frontal (numpad 1) → **S** para que encaje con la altura (pivot: Median Point o Bounding Box Center). También **S X** para hacerlo un poco más ancho.
- **Ctrl+A → All Transforms** (o solo Scale). Sirve cualquiera de los dos, pero hay que **aplicar la escala antes de generar**.

```python
meta.scale = (k, k, k)                    # k = altura del personaje / altura del metarig
bpy.context.view_layer.objects.active = meta
bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
```

### 7:58–12:50 · Ajustar huesos (Edit Mode) a la malla
- Overlays → Geometry → **Wireframe** activado, para ver los edge loops (8:18).
- **X-Axis Mirror** (botón arriba a la derecha en Edit Mode del armature, "Apply changes to matching bone on opposite side of X-Axis") (8:38). Si te olvidaste de activarlo, actívalo y mueve un poco cada hueso: el otro lado se copia solo.
- Dónde va cada articulación (frames 8:00–12:50):
  - codo = el edge loop del codo; muñeca; la tail de `hand` en la punta de la mano (o un poco hacia dentro).
  - rodilla = **centro de la rodilla**, en el edge loop (9:40).
  - **`heel.02`** (hueso del foot roll): con **G X** se ponen sus dos puntas en los **bordes laterales del pie** y, en vista lateral, hacia la parte de atrás del pie (9:19, 11:27).
  - punta de `toe` delante del pie; `foot` en el tobillo.
  - columna: "confusamente" el hueso de más arriba es la **cabeza** (`spine.006`) y los dos de debajo son el **cuello** (`spine.004`, `spine.005`). La cabeza termina donde termina el cuello en vista lateral (10:01–10:21). Para mover dos huesos a la vez: **Alt+Z** (X-ray) + box select + **G Z**.
  - todos los huesos **dentro** del volumen (centrados en vista lateral), porque el punto de rotación depende de dónde está el head (11:27).
- **Curva leve en rodillas y codos** (11:48, 12:50): si el brazo o la pierna quedan perfectamente rectos, el IK no sabe hacia dónde doblar. Con **G Y**: rodilla un poco hacia delante y codo un poco hacia atrás.
- Vista superior (numpad 7) para alinear el brazo en profundidad (12:09).
- **Borrar `breast.L/R`**: no hacen falta (12:30). Rótulo en pantalla: "consérvalos si quieres animar el pecho".
- H oculta huesos, Alt+H los muestra. Con X-mirror, los cambios hechos a huesos ocultos se reflejan igual.

```python
# Edit Mode por script: las coordenadas van en espacio del armature (escala ya aplicada => metros)
import bpy
from mathutils import Vector
meta = bpy.data.objects["metarig"]
bpy.context.view_layer.objects.active = meta
bpy.ops.object.mode_set(mode='EDIT')
eb = meta.data.edit_bones
J = {  # medidas sacadas de la malla (p. ej. centro del edge loop de rodilla/codo)
    "upper_arm.L": (Vector((0.18, 0.02, 1.30)), Vector((0.40, 0.04, 1.15))),   # (head, tail); codo +Y = un poco atrás
    "forearm.L":   (Vector((0.40, 0.04, 1.15)), Vector((0.60, 0.02, 1.00))),
    "thigh.L":     (Vector((0.09, 0.00, 0.95)), Vector((0.09, -0.02, 0.52))), # rodilla -Y = un poco adelante
    "shin.L":      (Vector((0.09, -0.02, 0.52)), Vector((0.09, 0.01, 0.10))),
}
for n, (h, t) in J.items():
    eb[n].head, eb[n].tail = h, t
    r = eb[n.replace(".L", ".R")]                       # espejo manual (el X-Mirror del UI no actúa en scripts)
    r.head = Vector((-h.x, h.y, h.z)); r.tail = Vector((-t.x, t.y, t.z)); r.roll = -eb[n].roll
for n in ("breast.L", "breast.R"):
    if n in eb: eb.remove(eb[n])
bpy.ops.object.mode_set(mode='OBJECT')
```
Ojo: si los huesos tienen `use_connect=True`, mover la tail mueve el head del hijo. Por eso conviene ir de la raíz a las puntas. Alternativa al espejo manual: seleccionar los .L y hacer `bpy.ops.armature.symmetrize(direction='POSITIVE_X')` (copia +X a -X).

### 13:02 · Generar el rig
- Con el **metarig seleccionado** (rótulo: "Make sure your skeleton is selected!"), Object Data Properties → panel **Rigify** → **Generate Rig**. Sale un objeto nuevo, `rig`, encima del metarig. A ese también se le activa **In Front**.
- El metarig **no se borra**: se oculta (ojo en el outliner) y se guarda para regenerar.

```python
bpy.ops.object.mode_set(mode='OBJECT')
bpy.context.view_layer.objects.active = meta; meta.select_set(True)
bpy.ops.pose.rigify_generate()          # crea/actualiza meta.data.rigify_target_rig (objeto "rig")
rig = meta.data.rigify_target_rig
rig.show_in_front = True; meta.hide_set(True)
```
Comprobado en Blender 5.2 (background, `--factory-startup`): `armature_basic_human_metarig_add` crea 29 huesos (spine…spine.006, shoulder/upper_arm/forearm/hand, breast, pelvis, thigh/shin/foot/toe/heel.02, en L y R). `rigify_generate` produce un `rig` de **222 huesos con 35 DEF**, y ahí también `DEF-thigh.L` cuelga de `ORG-spine` y `DEF-upper_arm.L` de `ORG-shoulder.L`. O sea, el problema de jerarquía del GLB (más abajo) viene de Rigify y no del asset.

### 13:44 · Unir el modelo al rig generado
- Seleccionar **todos los objetos del personaje**: pelo, cara, cuello, torso, brazos, manos, piernas, cintura, pies. Para quitar algo de la selección: Ctrl+box select. Truco para comprobar que no falta nada: pulsar H y ver si queda alguna pieza visible; después Ctrl+Z.
- Shift+clic en el `rig` (activo) → **Ctrl+P → Armature Deform → With Automatic Weights**. El panel de la operación muestra *Type: With Automatic Weights*, *X Mirror*, *Keep Transform*.
- Pesos automáticos = Blender crea un vertex group `DEF-*` por cada hueso de deformación y lo llena con "bone heat".

```python
chars = [o for o in bpy.data.objects if o.type == 'MESH' and o.name in {"hair","face","neck","torso","arms","hands","legs","waist","feet"}]
bpy.ops.object.select_all(action='DESELECT')
for o in chars: o.select_set(True)
rig.select_set(True); bpy.context.view_layer.objects.active = rig
bpy.ops.object.parent_set(type='ARMATURE_AUTO')
```
Nota mía (no sale en el vídeo): en low poly a veces sale "Bone Heat Weighting: failed to find a solution for one or more bones". Se suele arreglar con Merge by Distance, quitando caras duplicadas o internas, o parentando ese objeto aparte con pesos a mano (vertex groups por script, ver 10-weight-paint).

### 14:47 · Probar en Pose Mode
- Ctrl+Tab con el rig activo. La pierna dobla hacia delante y el brazo hacia atrás (gracias a la curva previa); también funcionan la mano, el cuello y la cabeza.
- Al mover `torso`, **manos y pies se quedan en su sitio** porque por defecto están en **IK**.
- Problemas que se ven: al mover el brazo se mueven algunos mechones de pelo y parte del pecho o el cuello. Se arregla con weight painting (parte 10).

### 15:50 · Rig Layers (sidebar N → pestaña **Item**)
- Rótulo: "Make sure you're in the 'Item' tab of this menu!". Hay dos paneles:
  - **Rig Main Properties** (con un control de brazo seleccionado, p. ej. `hand_ik.L`): `IK-FK (hand.L) 0.000`, botones FK→IK / IK→FK (snap), `IK Stretch 1.000`, `Toggle Pole Off`, `IK Parent: Root`, `Pole Parent: shoulder...`.
  - **Rig Layers**: botones Torso, (Tweak), Arm.L (IK), Arm.R (IK), (FK), (Tweak)… y Root. Ella apaga todos los *Tweak* y *FK* y deja solo IK + Torso + Root.

```python
rig = bpy.data.objects["rig"]
for c in rig.data.collections_all:
    if "(Tweak)" in c.name or "(FK)" in c.name:
        c.is_visible = False
```

### 16:31 · Editar el metarig y regenerar
- Problema: el cuello del rig se inclina hacia delante (unos 30°) porque la columna del metarig estaba torcida en vista lateral.
- Solución: ocultar `rig`, mostrar `metarig` → Tab → vista lateral (3) → Alt+Z → box select de los huesos de la columna → **G Y** para enderezarlos.
- Advertencia en pantalla (17:00): *"You'll only get this error when generating your rig! Just make sure you keep your spine bones connected"*. Hay que mover los huesos de la columna **sin desconectarlos**: seleccionar las articulaciones, no un hueso suelto.
- Object Data → Rigify → **Re-Generate Rig** (el botón cambia de nombre cuando ya existe un rig). **Reutiliza el mismo objeto `rig`**, así que las mallas siguen unidas y los pesos se conservan. Las colecciones y controles se recrean.
- **Cualquier hueso que hayas añadido a mano en el rig generado se pierde al regenerar** (importante para la parte 10).

```python
bpy.context.view_layer.objects.active = meta
bpy.ops.object.mode_set(mode='EDIT')
for n in ("spine.004", "spine.005", "spine.006"):
    b = meta.data.edit_bones[n]; b.head.y -= 0.02; b.tail.y -= 0.02   # con use_connect: mover juntas las articulaciones
bpy.ops.object.mode_set(mode='OBJECT')
bpy.ops.pose.rigify_generate()        # = Re-Generate (usa rigify_target_rig)
```

## Errores comunes y arreglos (del vídeo)
| problema | causa | arreglo |
|---|---|---|
| no ves los huesos | la malla los tapa | Viewport Display → In Front |
| el lado R no sigue lo que mueves en L | X-Axis Mirror apagado | activarlo y mover un poco cada hueso |
| la rodilla o el codo doblan al revés | hueso recto, sin curva | G Y: rodilla adelante, codo atrás |
| error al generar | huesos de la columna desconectados | moverlos conectados |
| cuello o cabeza inclinados tras generar | columna del metarig torcida | editar el metarig y Re-Generate |
| al mover el brazo se mueve el pelo o el pecho | pesos automáticos imperfectos | weight paint (parte 10) |

---

## Para nuestro proyecto (NETO512 de evanciao)

Lo comprobé en `F:\Claude Proyectos\assets\neto512\neto.blend` con Blender 5.2 en background:
- El armature se llama **`rig`** y tiene 224 huesos: controles + `ORG-` + `MCH-` + **35 `DEF-`**. No hay metarig en el archivo, así que **no se puede regenerar**. Lo tratamos como rig final.
- Colecciones: Head, Torso, Torso (Tweak), Arm.L/R (IK/FK/Tweak), Leg.L/R (IK/FK/Tweak), Root, ORG, MCH, DEF.
- Mallas (todas hijas de `rig`, tipo OBJECT): belly, eyebrows, eyes, hair-general, pupils y upper-body con `[MIRROR, ARMATURE]`; hair-front, lower-body y mouth solo con `[ARMATURE]`.
- Columna: `DEF-spine` (cadera) … `DEF-spine.003` (pecho), `.004`/`.005` (cuello), **`DEF-spine.006` = cabeza**. Es la misma convención que en el vídeo.

### Controles de Rigify vs huesos DEF al posar por script (en Blender)
- Los `DEF-` tienen restricciones: **COPY_TRANSFORMS** de `tweak_*`/`ORG-*` y **STRETCH_TO** (p. ej. `DEF-upper_arm.L` ← `upper_arm_tweak.L`). Si les cambias la rotación por script **no pasa nada** (la restricción la pisa). En Blender **se posan los controles**.
- Controles útiles (comprobados): `root`, `torso` (mueve todo el cuerpo menos IK), `hips`, `chest`, `neck`, `head`, `shoulder.L/R`, `upper_arm_fk.L`, `forearm_fk.L`, `hand_fk.L`, `hand_ik.L`, `thigh_fk.L`, `shin_fk.L`, `foot_fk.L`, `foot_ik.L`, `foot_heel_ik.L`, `toe_ik.L`, `eyes-base`, `eye.l/r`.
- Interruptor IK/FK = propiedad custom: `rig.pose.bones["upper_arm_parent.L"]["IK_FK"]` (brazos) y `["thigh_parent.L"]["IK_FK"]` (piernas). **0.0 = IK** (por defecto; como en el vídeo, el panel muestra 0.000) y **1.0 = FK**. También están `IK_Stretch` (1.0 por defecto: los miembros IK se **estiran** si el target se aleja; ponlo a 0 si no quieres eso), `pole_vector`, `IK_parent`, `FK_limb_follow`. En `torso`: `neck_follow 0.5`, `head_follow 0.0`.

```python
rig = bpy.data.objects["rig"]; pb = rig.pose.bones
pb["upper_arm_parent.L"]["IK_FK"] = 1.0                 # brazo izq. en FK
for n in ("upper_arm_fk.L", "forearm_fk.L", "chest", "head"):
    pb[n].rotation_mode = 'XYZ'
pb["upper_arm_fk.L"].rotation_euler = (0, 0, 0.8)
pb["forearm_fk.L"].rotation_euler  = (0.6, 0, 0)        # Rigify orienta los miembros para que X local = eje de flexión
pb["chest"].rotation_euler = (0.3, 0, 0)
pb["head"].rotation_euler  = (0, 0.5, 0)
pb["foot_ik.L"].location   = (0, 0, 0.1)                # pie IK: se traslada
bpy.context.view_layer.update()
# reset (= A, Alt+R/G/S)
for p in pb:
    p.location = (0,0,0); p.rotation_quaternion = (1,0,0,0); p.rotation_euler = (0,0,0); p.scale = (1,1,1)
```
Si queremos animación hecha en Blender: se animan los controles y el exportador glTF **muestrea** (`export_force_sampling=True`, viene así por defecto) la pose evaluada de los DEF, o sea que la hornea en los 35 huesos. También se puede hornear antes con `bpy.ops.nla.bake(..., visual_keying=True, bake_types={'POSE'})` sobre los DEF.

### Exportar a GLB (solo deform): lo que hay que vigilar
1. **La jerarquía DEF sale rota.** En Rigify, varios DEF cuelgan de huesos que no exportamos: `DEF-thigh.L` ← `ORG-spine`, `DEF-shoulder.L` y `DEF-upper_arm.L` ← `ORG-shoulder.L`, `DEF-pelvis.L` ← `ORG-pelvis.L`, `DEF-eye.l` ← `ORG-eye.l`. Con `export_def_bones=True`, el exportador los cuelga **directamente de `rig`**. Lo confirmé en `pieces/sina-test/models/neto.glb`: piernas, brazos, hombros, pelvis y ojos son hijos de `rig`. **Consecuencia en three.js**: si rotas `DEF-spine`, las piernas no le siguen. Si rotas el pecho (`DEF-spine.003`), los brazos no le siguen. Si rotas la cabeza, los ojos tampoco.
   **Arreglo (probado):** antes de exportar (sin guardar el .blend), reparentar en Edit Mode los DEF a su DEF lógico y añadir COPY_TRANSFORMS al ORG en los DEF sin restricción. Así la pose en Blender no cambia (diferencia medida: 2e-7 m) y el GLB sale con la cadena limpia: `DEF-spine → spine.001 → … → spine.006 → eye.l/r`, `DEF-spine.003 → DEF-shoulder.L → DEF-upper_arm.L → … → DEF-hand.L` y `DEF-spine → DEF-thigh.L → … → DEF-toe.L`.

```python
# añadir a export_neto.py ANTES de bpy.ops.export_scene.gltf (no guardar el .blend)
NEWPAR = {"DEF-pelvis.L":"DEF-spine","DEF-pelvis.R":"DEF-spine","DEF-thigh.L":"DEF-spine","DEF-thigh.R":"DEF-spine",
          "DEF-shoulder.L":"DEF-spine.003","DEF-shoulder.R":"DEF-spine.003",
          "DEF-upper_arm.L":"DEF-shoulder.L","DEF-upper_arm.R":"DEF-shoulder.R",
          "DEF-eye.l":"DEF-spine.006","DEF-eye.r":"DEF-spine.006"}
rig = bpy.data.objects["rig"]
bpy.context.view_layer.objects.active = rig
bpy.ops.object.mode_set(mode='EDIT')
for c, p in NEWPAR.items():
    e = rig.data.edit_bones[c]; e.use_connect = False; e.parent = rig.data.edit_bones[p]
bpy.ops.object.mode_set(mode='OBJECT')
for c in NEWPAR:                         # DEF-shoulder/pelvis/eye no tenían restricción: que sigan a su ORG (coinciden 1:1)
    pbn = rig.pose.bones[c]
    if not pbn.constraints:
        k = pbn.constraints.new('COPY_TRANSFORMS'); k.target = rig; k.subtarget = c.replace("DEF-", "ORG-")
```
2. **Nombres en three.js**: `GLTFLoader` pasa los nombres por `PropertyBinding.sanitizeNodeName` (comprobado en three 0.180), que **quita `.`, `:`, `/`, `[`, `]`** y cambia los espacios por `_`. Así que `DEF-spine.006` → **`DEF-spine006`** y `DEF-hand.R` → `DEF-handR`. En el código hay que buscar por el nombre ya limpio, o limpiar igual nuestras claves: `name.replace(/[\[\]\.:\/]/g,'')`.
3. **Exportar en pose de reposo**: `export_rest_position_armature=True` (por defecto) o resetear la pose antes. Si hay acciones, `export_animations` + muestreo.
4. **Mirror antes de Armature**: con `export_apply=True` se aplica el Mirror y el Armature se convierte en skin (ya funciona así en `export_neto.py`). El Mirror tiene que estar **antes** del Armature en la pila, como ya está.
5. **STRETCH_TO / IK Stretch**: los DEF pueden escalar (estirarse). En la animación horneada aparecerán pistas de *scale*. Para posar en three.js rotamos los DEF y no tocamos la escala.
6. Ejes locales en three.js: cada DEF tiene **+Y a lo largo del hueso** (head→tail), igual que en Blender. La tail de un hueso está en `(0, length, 0)` en su espacio local, así que para un accesorio en la punta de la cabeza: offset `(0, len(DEF-spine.006), 0)`.
7. Los objetos `WGT-rig_*` (formas de control) no tienen padre ni pesos. El filtro `keep` de `export_neto.py` ya los excluye.

Accesorios (casco, chaleco, herramienta), con pesos o con parentado a hueso: ver **10-weight-paint.md → "Para nuestro proyecto"**.
