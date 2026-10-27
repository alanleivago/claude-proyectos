---
type: reference
status: active
tags: [crashsune, blender, animacion, graph-editor, f-modifiers, noise, stepped, cycles, easing, rigify, ik, fk, bone-collections, motion-paths, gltf, threejs, ps1, neto512]
relatedTo: [crashsune-low-poly-series, GUIA-personaje-ps1, 13-animacion-low-poly, 09-rigify-rig]
---

# Modificadores de animación + IK vs FK: Crashsune, serie "Blender 3D Animation Tutorial" partes 7 y 9

Vistos enteros: los dos transcripts (limpiados de duplicados), las 11 hojas de frames y unos 35 frames sueltos a 480p, recortados y ampliados en los paneles (Modifiers del Graph Editor, panel CloudRig, Object Data > Layers, Motion Paths).
- **Parte 7, "Animation Modifiers and Dynamic Effects"** (17:45). Blender **3.5.0**, un cubo con keys en los frames 0 y 50 (Loc, Rot y Scale).
- **Parte 9, "IK vs FK and Rig Layers"** (21:50). Blender 3.x, rig **CloudRig "Rain"** de Blender Studio. **No es Rigify**, así que los nombres y el sentido del switch cambian (ver §2.2). También muestra dos planos suyos: una batería (IK) y una caída sobre una cama (FK), con el modelo Astolfo.

Lo que ya está en `13-animacion-low-poly.md` y en la GUÍA no se repite: Make Cyclic con Shift+E, Stepped con step 2 para animar "on twos", el `IK_FK` keyado, el horneado a `DEF-*` y la exportación con NLA_TRACKS.

**Verificado en nuestro Blender 5.2.2 LTS en modo headless, sobre `assets/neto512/neto.blend`, sin guardar:** la API de F-modifiers por channelbag, los enums, las propiedades IK/FK de NETO, los operadores de snap de Rigify (FK→IK ejecutado: `FINISHED`) y una exportación glTF de prueba con Noise + Stepped (resultados en §3).

---

## 1. Parte 7: modificadores de F-curve y efectos dinámicos

### 1.1 Técnicas, con minuto y valores en pantalla

| min | técnica | detalle / valores leídos |
|---|---|---|
| 1:43 | **Normalize** (botón del header del Graph Editor) | Escala todas las curvas a −1..1 para comparar canales de distinto rango. "Se activa a ojo". Solo cambia la vista, no los datos |
| 3:28 | Panel **N → pestaña Modifiers** | Solo aparece con un canal seleccionado. **Shift+H** aísla el canal (Y Location) y **Home** lo encuadra |
| 3:49 | **Add Modifier** | Lista: Generator, Built-in Function, Envelope, Cycles, Noise, Limits, Stepped Interpolation. Él dice que **solo importan 3: Stepped, Cycles y Noise** |
| 4:09 | Desactivar canales con el **checkbox** del canal | Arrastrando sobre los checkboxes se apagan Rotation y Scale para ver solo el movimiento. No borra nada |
| 4:50 | **Stepped**, valor por defecto | Step Size **2.0** = "on twos" (actualiza cada 2 frames). Offset 0 |
| 5:11 | **Step Size 3** | "Aún más chunky": estilo stop-motion, Spider-Verse, Puss in Boots. "En otros programas tendrías que hornear" |
| 5:51 | Stepped con **Start/End Frame** propios | End Frame **25**: escalonado hasta el 25 y suave después. Start Frame **10**: suave, luego escalonado, luego suave otra vez |
| 6:32 | **Influence** | "Como la opacidad de una capa en Photoshop": mezcla la curva original con la modificada |
| 7:14 | **Restrict Frame Range + Blend In/Out** | Start **10**, End **43**, Blend In **16.5**, Blend Out **~12**. Entra y sale del efecto de forma gradual. Vale para cualquier modificador |
| 7:57 | Checkbox = mute, **X** = borrar | El mute deja el modificador guardado pero sin efecto |
| 8:18 | **Noise** | Usos: **camera shake**, recarga en primera persona, **temblor natural de manos**, "más gritty y realista" |
| 8:40–9:21 | Parámetros de Noise | Por defecto: Blend Type **Replace**, Scale 1.0, Strength 1.0, Offset 0, Phase 1.0, Depth 0. Luego prueba Scale **0.9**, Strength **1.3**, Offset **−6.5** y Phase **3.0**. **Scale** = grano (más bajo = más fino y rápido), **Strength** = amplitud. Offset y Phase solo desplazan el patrón. Depth: "no sé qué hace, lo dejo así" |
| 9:41 | **Backspace** sobre un campo | Lo devuelve a su valor por defecto |
| 10:03 | Noise con rango restringido | Start **4**, End **40**, Blend In/Out **0**: el temblor empieza en el 4 y corta en seco en el 40. Con Blend In/Out se suaviza. Ejemplo: "un coche que pasa de grava a asfalto" |
| 10:44 | **Cycles** | Before Mode **Repeat Motion**, Count **0** (infinito), After Mode **Repeat Motion**, Count 0. En el último frame salta al primero |
| 11:25 | Loop limpio | Copia la primera key, la pega al final (frame 55), **A → V → Automatic** y pasa a ser un loop perfecto "hasta el frame 2000+". Sirve para walk, run y respiración en idle |
| 12:47 | **Shift+E → Make Cyclic / Clear Cyclic** | Atajo del modificador Cycles |
| 13:08 | **Copy / Paste F-Modifiers** | Botones junto a Add Modifier: copia todos los modificadores del canal activo. **Alt+H** para mostrar todo, **A** y Paste los pone en todos los canales |
| 14:12 | **Ctrl+Shift+M** | Menú Add F-Curve Modifier directo sobre el canal |
| 14:53 | No destructivo | Si mueves keys (G X), el modificador se adapta en tiempo real |
| 15:33 | **T → Dynamic Effects: Back, Bounce, Elastic** | Son tipos de **interpolación de la key**, no modificadores. Columnas del menú: Interpolation (Constant/Linear/Bezier), Easing (Sinusoidal…Circular), Dynamic Effects |
| 16:15 | **Elastic** | Tooltip: "Exponentially decaying sine wave, like an elastic band". El cubo vibra como un muelle al llegar. En la curva se ve una oscilación que decae |
| 16:37 | **Bounce** | Rebote de pelota "matemáticamente correcto" contra un objeto |
| 16:00 | Su opinión | "Personalmente no los uso", pero son rápidos. **Back** = se pasa del valor y vuelve (overshoot) |

### 1.2 Por script en Blender 5.x (verificado en 5.2.2)

`Action.fcurves` ya no existe: las curvas están en el **channelbag del slot**. Los F-modifiers cuelgan de cada F-curve, igual que antes.

```python
import bpy
from bpy_extras import anim_utils

rig = bpy.data.objects["rig"]
def channelbag():
    ad = rig.animation_data
    return anim_utils.action_get_channelbag_for_slot(ad.action, ad.action_slot)

cb = channelbag()
fc = cb.fcurves.find('pose.bones["hand_ik.L"].location', index=2)   # una curva concreta

# NOISE: temblor que entra y sale (como 10:03 + blend)
n = fc.modifiers.new('NOISE')
n.blend_type = 'ADD'            # 'REPLACE' (por defecto) | 'ADD' | 'SUBTRACT' | 'MULTIPLY'
n.scale, n.strength = 2.0, 0.05 # scale = periodo en frames, strength = amplitud en unidades de la curva
n.phase, n.offset, n.depth = 1.0, 0.0, 0
n.use_restricted_range = True
n.frame_start, n.frame_end = 5, 35
n.blend_in, n.blend_out = 5, 5  # frames de entrada y salida (como 7:14)
n.influence = 1.0; n.use_influence = False
# en 5.x también existen n.lacunarity, n.roughness y n.use_legacy_noise

# STEPPED: "on twos" solo en un tramo
s = fc.modifiers.new('STEPPED')
s.frame_step, s.frame_offset = 2, 0
s.use_frame_start, s.use_frame_end = True, True   # son los Start/End propios del Stepped (5:51)
s.frame_start, s.frame_end = 10, 25               # ojo: comparten nombre con el rango restringido genérico

# CYCLES
c = fc.modifiers.new('CYCLES')
c.mode_before = c.mode_after = 'REPEAT'   # 'NONE' | 'REPEAT' | 'REPEAT_OFFSET' (avanza cada vuelta, p. ej. un walk) | 'MIRROR'
c.cycles_before = c.cycles_after = 0      # 0 = infinito

# Copiar modificadores a todas las curvas (equivale a Copy/Paste F-Modifiers, 13:08)
for other in cb.fcurves:
    if other is fc: continue
    m = other.modifiers.new('NOISE'); m.blend_type='ADD'; m.scale=n.scale; m.strength=n.strength
# Mute / borrar: m.mute = True ; other.modifiers.remove(m)
```
Enums de 5.2: `['GENERATOR','FNGENERATOR','ENVELOPE','CYCLES','NOISE','LIMITS','STEPPED','SMOOTH']` (SMOOTH es nuevo respecto al video).

**Efectos dinámicos (T)** = propiedades de cada keyframe, no de la curva:
```python
for kp in fc.keyframe_points:
    kp.interpolation = 'ELASTIC'      # 'BACK' | 'BOUNCE' | 'ELASTIC' (+ 'SINE','QUAD','CUBIC','QUART','QUINT','EXPO','CIRC')
    kp.easing = 'EASE_OUT'            # 'AUTO' | 'EASE_IN' | 'EASE_OUT' | 'EASE_IN_OUT'
    kp.amplitude, kp.period = 0.8, 4.1   # solo ELASTIC (cuánto vibra y cada cuántos frames)
    # kp.back = 1.70158                  # solo BACK: cuánto se pasa (overshoot)
```
La interpolación va en la key **de salida** del tramo: afecta al segmento que empieza en esa key.

Los operadores de UI (`graph.fmodifier_add(type=..., only_active=...)`, `graph.fmodifier_copy()`, `graph.fmodifier_paste(only_active, replace)`, `graph.extrapolation_type(type='MAKE_CYCLIC')`) necesitan contexto de Graph Editor. En `blender -b` es mejor trabajar por datos, como en el bloque de arriba.

### 1.3 ¿Sobrevive a glTF? Prueba real con NETO

Prueba hecha: acción `test_shake` con keys en `hand_ik.L` (control IK) + **Noise (ADD, scale 2, strength 0.05, rango 5–35, blend 5/5) + Stepped 2** → exportada con `export_force_sampling=True`, `export_def_bones=True`, `ACTIONS`. Después se leyó el GLB.
- **Los modificadores como tales no existen en glTF**, pero **el exportador con sampling los hornea solos**: evalúa la pose final cada frame (constraints de Rigify + F-modifiers) y escribe los `DEF-*`. En el GLB, `DEF-upper_arm.L`, `DEF-forearm.L` y `DEF-hand.L` salen con el ruido y con **pares de frames idénticos** (el escalonado). No hace falta `nla.bake` previo, aunque `nla.bake` también funciona.
- **Lo que se pierde:**
  1. La interpolación sale **LINEAR** con una muestra por frame. El "hold" de Stepped se convierte en *hold de 1 frame + rampa de 1/30 s*. A 30 fps exactos se ve igual, pero si three.js renderiza a 60 fps o fuera de la grilla, la rampa se nota. Por eso **el escalonado conviene hacerlo en three.js** (§4).
  2. **Cycles solo se hornea dentro del rango de la acción**. El loop en three.js lo da `LoopRepeat`, no el modificador. Hay que mantener la regla "key 1 = key 26" de la nota 13.
  3. **El Noise horneado es siempre el mismo ruido**: se repite idéntico en cada vuelta del loop y puede dar un salto en la costura si no termina en 0 (usar `blend_out` hasta el final).
  4. Con `export_optimize_animation_size=True` el ruido no se reduce, porque cada frame es distinto: el GLB pesa más.
- Back/Bounce/Elastic: también se hornean, pero el muestreo es de 30 fps. Un Elastic con `period` < 2 frames se pierde (aliasing). Si encima se escalona a 15 fps, el rebote apenas se ve.
- Nota: el `neto.blend` ya trae las acciones `face` y `laid`. Con `export_animation_mode='ACTIONS'` salen en el GLB junto a las nuestras.

---

## 2. Parte 9: rig layers, espejo de pose, IK vs FK y arcos

### 2.1 Técnicas, con minuto

| min | técnica | detalle |
|---|---|---|
| 0:20 | Workspace **Animation** + **Auto Keying** siempre activo | — |
| 0:40 | Material Preview, o **MatCap** si va lento | — |
| 1:21 | **N → pestaña CloudRig → Layers** | Botones: IK, IK Secondary, FK, FK Secondary, Stretch, Face Primary / Face Extras / Face Tweak, Fingers, Hair, Clothes. Activa Hair y Fingers para posarlos (por defecto ocultos; el pelo "flota" y los dedos están rectos) |
| 2:23 | **Dedos relajados** | "Por defecto la mano 3D está rígida; una mano real en reposo está curvada". Rota cada falange un poco, más hacia el meñique |
| 3:08–4:35 | **Copiar pose y pegarla en espejo** | Seleccionar los huesos → resumen del Dope Sheet → **Ctrl+C**. Seleccionar el lado opuesto → **Ctrl+Shift+V** (paste flipped). Ojo (3:52): si el otro lado no tiene keys, primero **I** (Loc/Rot/Scale) y después Ctrl+Shift+V. Lo usa con dedos y pies |
| 4:55 | Ctrl+S constante | "El autosave de Blender no es fiable" |
| 5:15–6:41 | Las capas del panel = **Object Data → Skeleton → Layers** | Los botones del panel solo manejan las capas nativas del armature (Blender 3.x: 32 layers + Protected Layers + Bone Groups). **Shift+clic** muestra varias, clic solo deja una. **En Blender 4.x/5.x esto son las Bone Collections** |
| 6:41 | Definición | **IK = posar por traslación** (G): la cadena "hace lo posible" por seguir el control. **FK = posar por rotación** (R), "como una figura de acción". IK viene de la robótica: mano a una posición exacta, coger, soltar |
| 7:01 | Este rig viene con **IK en todas las extremidades** | — |
| 7:43–8:23 | Panel **FK/IK Switch** (en pantalla, 8:00) | Spine **0.000**, Left Arm **1.000**, Right Arm 1.000, Left Leg 1.000, Right Leg 1.000, cada uno con un botón ⟳ de **snap**. Pasa Right Arm a **0.000** = FK (el campo se pone amarillo: está keyado). Debajo: **IK Stretch** Arms/Legs/Spine 1.0, **IK Parents** (Left/Right Arm: Root, Leg: Root), **IK Pole Follow** Hands **0.0**, Feet **1.0** |
| 8:44 | Ocultar la capa **Stretch** | Estorba al seleccionar los FK |
| 10:08–11:52 | **Plano de la batería: IK** | "Necesitaba golpear el platillo y el tambor en un punto exacto". Ventaja: puede animar torso, hombros y pelvis "y no rompe el punto de contacto" |
| 11:52–13:55 | **Plano de la caída a la cama: brazos FK, pies IK** | Los brazos "se arrastran detrás del movimiento principal" y al final se sacuden ("wiggle"). Con IK habría tenido que cuidar los arcos a mano y seguir al cuerpo frame a frame "salvo que lo emparentara a la cadera" |
| 13:55 | Regla | **IK para sostener objetos o tocar el entorno** (sacar una espada de una piedra). **Espada a dos manos: una mano IK y la otra FK**: la FK da los arcos suaves y la IK sigue perfectamente a la otra |
| 14:37 | Demo | Keys en los frames **0 y 30**, **P** para el preview range 0–30. Misma pose (brazo arriba) en un brazo IK y en otro FK |
| 15:20 | Brazo IK arriba | "Al levantar el brazo **el hombro también sube**": rotar `shoulder` aunque sea IK |
| 15:42 | **Pole** (`IK-Pole-Forearm.L`) | "En IK siempre hay un hueso que controla hacia dónde apunta el codo". Con el brazo arriba **el codo va hacia delante y el pulgar hacia atrás**. "Úsate a ti mismo de referencia" |
| 17:05 | Diferencia clave | Rotar el **hombro en FK mueve todo el brazo**. En IK, la **mano se queda en su sitio** |
| 17:48 | Corregir un giro raro | Bloquear el eje con **R Z** / **R Y** y una key intermedia en el **15** |
| 18:49–20:14 | **Motion Paths** (Object Data → Motion Paths: Paths Type **In Range**, Calculation Range **Scene Frame Range**, Step **1** → Calculate) | El **FK dibuja un arco limpio**: "realista y bonito". El **IK hace una línea recta**: "mecánico y falso" |
| 20:35 | Arreglar el arco IK | En el frame **15** mueve la mano IK **hacia delante**: el path pasa a ser un arco casi igual al del FK. "Si usas IK tienes que preocuparte activamente de los arcos" |

### 2.2 CloudRig (video) vs Rigify (NETO): no confundir

| | CloudRig (Rain, video) | **Rigify (NETO512, verificado)** |
|---|---|---|
| switch | 1.0 = **IK**, 0.0 = FK | `IK_FK`: **0.0 = IK**, 1.0 = FK (al revés) |
| dónde | panel CloudRig | `rig.pose.bones["upper_arm_parent.L"]["IK_FK"]` y `["thigh_parent.L"]["IK_FK"]` (también .R). El torso no tiene switch |
| otras props en el mismo hueso | IK Stretch, IK Parents, IK Pole Follow | `IK_Stretch` 1.0, `FK_limb_follow` 0.0, `pole_vector` **False**, `IK_parent` **1 (Root)**, `pole_parent` (brazo **6 = shoulder**, pierna **3 = Hips**) |
| opciones de `IK_parent` | — | `hand_ik`: None, Root, Torso, Hips, Chest, Head, shoulder.X · `foot_ik`: None…Head |
| opciones de `pole_parent` | — | brazo: None…Head, shoulder.X, hand_ik.X · pierna: None…Head, foot_ik.X |
| pole | siempre visible (`IK-Pole-Forearm`) | **apagado** (`pole_vector=False`): el codo/rodilla se orienta **rotando `upper_arm_ik` / `thigh_ik`** (rotation_mode **ZXY**). Con `pole_vector=True` se usan `upper_arm_ik_target.X` / `thigh_ik_target.X` |
| capas | Blender 3.x layers + Bone Groups | **Bone Collections**: Head, Torso, Torso (Tweak), Arm.L (IK), Arm.L (FK), Arm.L (Tweak), Arm.R …, Leg.L (IK), Leg.L (FK), Leg.L (Tweak), Leg.R …, Root, ORG/MCH/DEF (ocultas) |
| rotación de los controles | — | `hand_ik`, `foot_ik`, FK y `torso`: **QUATERNION**; `upper_arm_ik`: **ZXY** |

NETO no trae huesos de dedos para posar (81 controles, sin `f_index`/`thumb`): los "dedos relajados" de 2:23 no se pueden aplicar. Solo cuenta la silueta de la mano en low poly.

### 2.3 Por script (Rigify en Blender 5.x, verificado sobre NETO)

**Rig layers → bone collections** (para que `look` del MCP no muestre 81 controles):
```python
arm = rig.data
for c in arm.collections_all:
    c.is_visible = c.name in {"Torso", "Arm.L (IK)", "Arm.R (FK)", "Leg.L (IK)", "Leg.R (IK)", "Root"}
# solo una: arm.collections_all["Arm.R (FK)"].is_solo = True   (la estrella de la nota 13)
```

**Switch IK/FK keyado sin salto** (snap + key CONSTANT). Los operadores existen solo si se ejecuta `rig.001_ui.py`: abrir con **`blender -b -y`** (autoexec). Sin `-y` no se registran. El sufijo es `rig.data["rig_id"]` = `qni2x2bpdfaf3d96`.
```python
import json
RID = rig.data["rig_id"]
ARM = {  # copiado del panel generado (rig.001_ui.py)
 "L": dict(prop_bone="upper_arm_parent.L",
           fk=["upper_arm_fk.L","forearm_fk.L","hand_fk.L"],
           ik=["upper_arm_ik.L","MCH-forearm_ik.L","MCH-upper_arm_ik_target.L"],
           ctrl=["upper_arm_ik.L","upper_arm_ik_target.L","hand_ik.L"]),
}
def snap_fk_to_ik(side, frame):          # botón "FK->IK (hand.L)": los FK copian la pose IK
    a = ARM[side]; bpy.context.scene.frame_set(frame)
    getattr(bpy.ops.pose, "rigify_generic_snap_" + RID)(
        output_bones=json.dumps(a["fk"]), input_bones=json.dumps(a["ik"]), ctrl_bones=json.dumps(a["ctrl"]))
    for b in a["fk"]: rig.pose.bones[b].keyframe_insert("rotation_quaternion", frame=frame, group=b)

def snap_ik_to_fk(side, frame):          # botón "IK->FK (hand.L)": los controles IK copian la pose FK
    a = ARM[side]; bpy.context.scene.frame_set(frame)
    getattr(bpy.ops.pose, "rigify_limb_ik2fk_" + RID)(prop_bone=a["prop_bone"],
        fk_bones=json.dumps(a["fk"]), ik_bones=json.dumps(a["ik"]), ctrl_bones=json.dumps(a["ctrl"]),
        tail_bones="[]", extra_ctrls="[]")
    # después keyar loc/rot de hand_ik.X y la rotación de upper_arm_ik.X

def set_ikfk(side, frame, value, limb="upper_arm"):   # 0 = IK, 1 = FK
    pb = rig.pose.bones[f"{limb}_parent.{side}"]
    pb["IK_FK"] = value; pb.keyframe_insert('["IK_FK"]', frame=frame, group=pb.name)
    fc = channelbag().fcurves.find(f'pose.bones["{limb}_parent.{side}"]["IK_FK"]')
    for kp in fc.keyframe_points: kp.interpolation = 'CONSTANT'   # cambio seco, sin mezcla rara
```
Ejemplo de cambio IK→FK en el frame 20: `snap_fk_to_ik("L", 20)` → `set_ikfk("L", 19, 0.0)` y `set_ikfk("L", 20, 1.0)`. En la pierna se usa `prop_bone="thigh_parent.X"`, `tail_bones=["toe_ik.X"]`, `extra_ctrls=["foot_heel_ik.X","foot_spin_ik.X"]` y el FK con `toe_fk`. Hay además `rigify_leg_roll_ik2fk_` (IK→FK con roll del pie), `rigify_limb_toggle_pole_` y las variantes `*_bake_`, que aplican el snap a un rango de keys. Se ejecutó `rigify_generic_snap_` en headless: **FINISHED**, con la pose FK copiada.
**Cambio de padre sin salto**: `rigify_switch_parent_<RID>(bone="hand_ik.L", prop_bone="upper_arm_parent.L", prop_id="IK_parent", parent_names='["None","Root","Torso","Hips","Chest","Head","shoulder.L"]', locks=..., selected=<enum>)`. Mantiene la mano en su sitio del mundo y keya el cambio. Firma verificada en 5.2: `bone, prop_bone, prop_id, parent_names, locks, selected`. `selected` es un ENUM dinámico: leer sus identificadores antes de usarlo. Alternativa simple: guardar `matrix` de la mano → cambiar `IK_parent` → restaurar `matrix` → keyar las dos cosas en CONSTANT. Toggle Pole: `rigify_limb_toggle_pole_<RID>(prop_bone, pole_prop='pole_vector', fk_bones, ik_bones, ctrl_bones, tail_bones, extra_ctrls, use_pole=True)`.

**Pegar la pose en espejo** (Ctrl+Shift+V de 4:14):
- Por operador: en Pose Mode, seleccionar los huesos → `bpy.ops.pose.copy()`; seleccionar los opuestos → `bpy.ops.pose.paste(flipped=True, selected_mask=True)`.
- Por datos (más fiable en `-b`), para huesos simétricos de Rigify:
```python
def mirror(n): return n[:-2] + ({".L": ".R", ".R": ".L"}[n[-2:]]) if n[-2:] in (".L", ".R") else n
def paste_flipped(names, frame):
    for n in names:
        s, d = rig.pose.bones[n], rig.pose.bones[mirror(n)]
        d.location = (-s.location.x, s.location.y, s.location.z)
        if s.rotation_mode == 'QUATERNION':
            w, x, y, z = s.rotation_quaternion; d.rotation_quaternion = (w, x, -y, -z)
        else:
            e = s.rotation_euler; d.rotation_euler = (e.x, -e.y, -e.z)
        d.scale = s.scale.copy()
        for p in ("location", "rotation_quaternion" if d.rotation_mode == 'QUATERNION' else "rotation_euler", "scale"):
            d.keyframe_insert(p, frame=frame, group=d.name)
```
Comprobar con `look` desde el frente: la fórmula vale si los ejes locales están espejados en X, que es lo normal en un metarig simétrico.

**Motion paths / chequeo de arcos** (18:49):
- UI: `bpy.ops.pose.paths_calculate(display_type='RANGE', range='SCENE', bake_location='TAILS')`.
- Mejor por script, porque se puede **medir** sin mirar: recorrer los frames, guardar la posición mundial de la mano y medir cuánto se separa la trayectoria de la recta entre las keys.
```python
def arc_check(bone="DEF-hand.R", f0=1, f1=30):
    sc = bpy.context.scene; P = []
    for f in range(f0, f1 + 1):
        sc.frame_set(f); P.append((rig.matrix_world @ rig.pose.bones[bone].tail).copy())
    a, b = P[0], P[-1]; ab = (b - a); L = ab.length or 1
    dev = max(((p - a) - ab * ((p - a).dot(ab) / L**2)).length for p in P)
    return dev / L    # ~0 = recta "mecánica"; un brazo que barre un arco suele dar 0.15–0.4
```
Si da menos de ~0.08 en un movimiento grande de un brazo IK, añadir una **key intermedia** a mitad de camino, con la mano desplazada hacia fuera o hacia delante (lo que hace él en 20:35). Para el horneado da igual: el `DEF-*` hereda el arco.

### 2.4 glTF

- `IK_FK`, `IK_parent`, poles y snaps son **solo de Blender**: el GLB no tiene controles ni propiedades. Todo llega como rotaciones de `DEF-*` gracias al sampling o al bake. Elegir IK o FK **no cambia nada en three.js**: solo cambia la calidad del movimiento horneado (arcos, contactos).
- Un cambio de IK a FK sin snap da un **salto de pose** en ese frame, y el salto también se hornea.

---

## 3. Para nuestro proyecto (NETO512 → obrera PS1, explainers @sinaboto)

Solo lo nuevo respecto a la GUÍA y la nota 13.

### 3.1 Cuándo keyar IK o FK, por tipo de acción

| tipo de acción (ejemplos de la biblioteca) | piernas | brazos | por qué / detalle Rigify |
|---|---|---|---|
| **Pies plantados**: hold, manos en la cintura, señalar, verter agua, levantar la sierra, festejo | **IK** (`thigh_parent.X["IK_FK"]=0`), `IK_parent`=Root (1) | según la mano | Los pies no resbalan aunque la cadera baje, rote o respire (el `idle_breath` aditivo mueve `torso`) |
| **Cambio de apoyo**: arrodillarse, sentarse en el piso | IK, pero **keyar cada contacto** en su frame. Rodilla al suelo: mover `foot_ik` y orientar la rodilla rotando `thigh_ik` (sin pole). Si la rodilla gira raro, `pole_vector=True` + Toggle Pole | brazos FK mientras baja | En la caída a la cama él deja los pies IK y los brazos FK. Para sentarse, la pierna que pasa por el aire puede ir en FK (`IK_FK=1` keyado CONSTANT con snap) para que barra un arco |
| **Mano sobre un objeto fijo del mundo**: mango de la sierra en el suelo, apoyar la mano en una pared, encender fuego (mano junto a la fogata) | IK | **IK**, `IK_parent`=Root | Es su regla de la batería: el contacto exacto no se rompe al animar torso y hombros |
| **Mano sobre el propio cuerpo**: manos en la cintura, mano en el casco, en el pecho | IK | **IK con `IK_parent`=Hips (3) / Chest (4) / Head (5)** | La mano sigue a la cadera o al pecho cuando respira o se inclina, sin keys extra. Cambiar el padre con `rigify_switch_parent_` (sin salto) |
| **Objeto a dos manos que se mueve**: alzar la sierra, cargar el balde | IK | **mano guía FK + mano de apoyo IK** (su regla de la espada) | La FK da el arco del gesto. La IK del otro lado se keya **cada frame** pegada al mango: por script, `frame_set(f)` → poner la matriz de `hand_ik` en la del mango → key. Rigify no ofrece la otra mano como `IK_parent`. El prop en three.js sigue a `DEF-hand` de la mano guía |
| **Balanceos y gestos al aire**: brazos arriba en el festejo, saludar, brazos al caminar, la reacción "¡ups!", caer | IK | **FK** (`upper_arm_parent.X["IK_FK"]=1`) | Arcos limpios gratis. El overlap sale desfasando 2–3 f el antebrazo y la mano respecto al hombro (rotaciones). Él usa FK justo por el "drag" y el "wiggle" final |
| **Señalar a cámara o a un objeto** | IK | **IK para llegar, FK para el gesto** | Si el dedo debe apuntar a un punto exacto del set → IK. Si es un énfasis rápido → FK |
| Acción que empieza agarrando y termina soltando o lanzando | IK | **IK → FK en el frame de la suelta** | `snap_fk_to_ik` en ese frame + `IK_FK` 0→1 en CONSTANT. Cada vez que algo cambie de mano o de padre: key CONSTANT + snap, nunca un switch interpolado |

Reglas extra del video para todas las acciones:
- **Brazo arriba = hombro arriba**: `shoulder.X` rotado aunque la mano sea IK (15:20).
- **Brazo levantado: codo hacia delante y pulgar hacia atrás** (15:42). En NETO sin pole: rotar `upper_arm_ik` hasta que el codo quede delante.
- **Todo movimiento IK de brazo de más de ~20 cm lleva una key intermedia "de arco"**: `arc_check` en el pipeline de `actions.py`, que avise antes de hornear.
- Al rotar el hombro en FK se mueve el brazo entero. En IK la mano no se mueve. Para "encoger los hombros" con la mano apoyada, usar IK.
- Poses simétricas (festejo, manos en la cintura): posar un lado y `paste_flipped` (luego romper la simetría 1–2 frames y unos grados para que no quede "twinning").
- Para revisar con `look`, ocultar colecciones (`Arm.X (Tweak)`, `Torso (Tweak)`, `Root`) y dejar solo las que se animan en esa acción.

### 3.2 F-modifiers en nuestro pipeline: cuáles sí y cuáles no

- **Cycles**: solo en `idle_breath` y otros loops (ya está en la nota 13). Lo que importa es el rango de la acción (1–26). `LoopRepeat` hace el resto.
- **Noise en Blender: no.** Se hornea un ruido fijo que se repite en cada loop y engorda el GLB. Solo vale para un temblor **único y ligado a la acción** (la sierra encendida vibrando en las manos 1,5 s). En ese caso: `ADD`, rango restringido con `blend_in/out` y sin loop.
- **Stepped en Blender: no.** Se exporta como rampas LINEAR y fija los 15 fps dentro del clip. Mejor en three.js, controlable por plano.
- **Back / Elastic / Bounce en Blender**: sí, en keys **de props o de un hueso concreto** que tenga que rebotar o pasarse (el casco que cae y rebota). Con `period` ≥ 3 frames para que sobreviva a 30 fps. En el cuerpo casi nunca: mejor un overshoot keyado a mano (key extra 2–3 f después).

### 3.3 Efectos procedurales en three.js (en vez de F-modifiers)

Todos deben ser **función determinista del tiempo del plano** `t` (sin `Math.random()` por frame), para que `render.mjs` produzca siempre los mismos frames. Para el ruido, reutilizar el `rng(seed)` de `shots.js` o una value-noise sembrada. Se aplican **después de `mixer.update`**, porque el mixer sobrescribe los huesos cada frame.

1. **Ventana con blend in/out** (equivale a Restrict Frame Range + Blend, 7:14): `w(t) = smoothstep(t0, t0+bin, t) * (1 - smoothstep(t1-bout, t1, t))`. Todos los efectos se multiplican por `w`.
2. **Camera shake** (Noise de 8:18) para golpes, la sierra encendida, algo que cae:
```js
function shake(t, seed, freq = 12, amp = 0.02) {          // value-noise 1D suave
  const n = (k) => { const s = Math.sin((k + seed * 97.13) * 12.9898) * 43758.5453; return s - Math.floor(s); };
  const x = t * freq, i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
  return (n(i) * (1 - u) + n(i + 1) * u - 0.5) * 2 * amp;
}
cam.position.x = base.x + shake(t, 1) * w; cam.position.y = base.y + shake(t, 2) * w;
cam.rotation.z = baseRotZ + shake(t, 3, 8, 0.01) * w;        // roll pequeño: lo que más "vende" el golpe
```
   Variante de **impacto**: `trauma` que decae (`amp = A * Math.max(0, 1 - (t - tHit) / 0.4) ** 2`). Escalonar el shake a 15 fps (`floor(t*15)/15`) le da el aire PS1.
3. **Temblor de manos o herramienta** (Noise ADD en un hueso): tras `mixer.update`, `DEF-hand.R.quaternion.multiply(qNoise)` con ±1–3° y `freq` 15–20 Hz mientras la sierra está encendida. Mejor sobre el **prop** que sobre la mano (no deforma la malla).
4. **Muestreo escalonado "on twos" selectivo** (Stepped 4:50, con rango 5:51): `mixer.setTime(Math.floor(t * 15) / 15)` solo para el personaje. La cámara y las partículas siguen a 30. Por plano: `steps: 15 | 30`. Para un tramo escalonado y otro suave (6:12): elegir el fps según `t`. Con 2 personajes, desfasar el escalón de uno medio paso (`(t + 1/30)`) para que no "salten" a la vez.
5. **Overshoot, rebote y elástico en props y en la UI** (Dynamic Effects, 15:33): funciones de easing en JS para casco o herramienta que cae, un cartel que aparece, un icono que entra.
   - `easeOutBack(x) = 1 + c3*(x-1)**3 + c1*(x-1)**2` (c1 = 1.70158, c3 = c1 + 1)
   - `easeOutBounce` (la de Penner)
   - `easeOutElastic(x) = 2**(-10x) * sin((x*10 - 0.75) * 2π/3) + 1`

   Sin animar huesos: solo transform de objetos.
6. **Respiración y micro-movimiento** sin clip extra: si se quiere romper la repetición del `idle_breath` aditivo, modular su `effectiveWeight` con un seno lento (0.5–0.7, periodo 7–11 s) en vez de añadir Noise en Blender.
7. **Pelo y coleta secundarios** (lo que él logra con FK + overlap): un "spring" en three.js sobre los `DEF-` del pelo, si NETO los tiene. `vel += (target - cur) * k; vel *= damp; cur += vel`, aplicado después del mixer, con k ≈ 0.2 y damp ≈ 0.75 a 30 fps.
8. **Golpe de herramienta con hit-stop**: congelar `mixer` 2–3 frames (`setTime` constante) en el frame del impacto + shake de cámara. Es un recurso de juego de época que lee muy bien en TikTok.

### 3.4 Pendientes concretos

- En `actions.py`: helpers `set_ikfk`, `snap_*`, `paste_flipped` y `arc_check` (los de arriba). Abrir siempre con `blender -b -y` para que existan los operadores de Rigify.
- Decidir si las acciones heredadas `face` y `laid` del `neto.blend` se exportan o se borran (con `ACTIONS` salen en el GLB).
- Probar `pole_vector=True` en las piernas para arrodillarse: con el pole es más predecible que rotar `thigh_ik`.
- Añadir `steps` y `shake` al formato de plano de `shots.js` (paso 4 y paso 2 de §3.3).
