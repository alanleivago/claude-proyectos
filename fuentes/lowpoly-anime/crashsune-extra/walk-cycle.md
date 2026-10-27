---
type: reference
status: active
tags: [crashsune, blender, animacion, walk-cycle, rigify, ik, fk, graph-editor, cycles-modifier, gltf, threejs, root-motion, ps1, low-poly]
relatedTo: [crashsune-low-poly-series, GUIA-personaje-ps1, 13-animacion-low-poly]
---

# How to Animate a Walk Cycle! [BEGINNER FRIENDLY] — Crashsune (69 min)

https://www.youtube.com/watch?v=_DLSWiZ6NHo · Lo vi entero: transcript (subtítulos automáticos limpiados en `walk/transcript_clean.txt`), las 23 hojas de contactos (`walk/frames/`, un frame cada 15 s) y unos 40 frames sueltos a 480p en las poses clave, el dope sheet y el graph editor (`walk/x/`).
Rig: **"WalkMan"** (`WalkCycleRig-final.blend`), un muñeco de cajas con **Rigify, 222 bones**, en **Blender 5.2.1 LTS** (el mismo que tenemos). Tiene piernas en IK y brazos en FK. Al final enseña el mismo ciclo aplicado a un personaje anime low poly (Astolfo) y a Teto.
El método es **pose a pose con la tabla de Richard Williams** (*The Animator's Survival Kit*, 2001): **4 poses clave por paso, una cada 3 frames, 24 fps, ciclo de 24 frames**.

> Esta nota solo añade lo que no está ya en `crashsune/13-animacion-low-poly.md`: Make Cyclic, V→Automatic, S→Y para restar amplitud, Graph Editor, Shift+H, desfase de keys, render, IK vs FK, export glTF de acciones, aditivo de idle y cuantizar a 15 fps ya están allí.

## Capítulos
00:00 intro · 00:38 fundamentos · 03:45 escena · 09:21 pies y pelvis · 27:13 caderas · 30:38 torso · 38:41 brazos · 46:46 hombros · 50:41 cabeza · 53:13 pulido y limpieza (incluye motion paths) · 65:50 consejos finales (Astolfo: dedos, pelo, mangas)

## Enlaces
| enlace | qué es | ¿nos sirve? |
|---|---|---|
| https://www.crashsune.com/walk_cycle | **rig WalkMan gratis + hoja de referencia** "side walk guide" (jpg con las 9 poses) | **Sí**: la hoja es la plantilla para posar a NETO frame a frame (Shift+A → Image → Reference en vista lateral) |
| https://www.crashsune.com/low-poly-course | curso de pago: incluye el .blend final, la referencia de espaldas y los ciclos de **Astolfo y Teto** | opcional: lo único útil sería ver un walk anime ya terminado en un rig de este tipo |
| https://www.crashsune.com/blender-freebies | freebies (ya en la nota 13) | ya cubierto |
| *The Animator's Survival Kit* (Richard Williams) | fuente de la tabla de poses | referencia clásica si queremos un walk con más personalidad (cansado, contento, con peso) |

---

## 1. Fundamentos (00:38 – 03:45)
- Caminar es **caer hacia delante y frenarse** con el pie una y otra vez; por eso el cuerpo va algo inclinado hacia delante.
- Para animarlo se reduce a **poses clave**: *contact, down, passing, up*, luego las mismas espejadas, y al final una **copia exacta del primer contact**.
- **Una pose nueva cada 3 frames** a 24 fps: 1 contact · 4 down · 7 passing · 10 up · 13 contact · 16 down · 19 passing · 22 up · 25 contact (= 1).
- Altura de la cabeza/pelvis (la línea ondulada de la hoja): **down es lo más bajo, up lo más alto**; contact y passing quedan a media altura, más o menos iguales.
- **Piernas en IK** (se mueven con G: plantar el pie y hacer *foot roll* es fácil) y **brazos en FK** (se rotan con R pieza a pieza, como un muñeco articulado: así salen arcos limpios).
- Las poses "no son ley": se cambian para darle personalidad al personaje.

## 2. Preparar la escena (03:45 – 09:20) — lo nuevo
- Abrir el rig → **Allow Execution** (activa `rig_ui.py`, el panel de Rigify).
- Hoja de referencia: vista **izquierda ortográfica**, **Shift+A → Image → Reference**, S para escalar, G+X para ponerla detrás. En Object Data se le baja la **Opacity** para que no moleste.
- **24 fps** (cine y series). Dice que en videojuegos se anima a **30 fps** porque se divide mejor hacia 60.
- **Marcadores en el timeline**, uno por pose: **M** crea el marcador, **F2** lo renombra (CONTACT, DOWN, PASS POS, UP). **Shift+D** lo duplica 3 frames más allá. Al final selecciona los 4 y Shift+D al frame 13: quedan en 16, 19 y 22 solos. Duplica CONTACT al 25.
- **Rango 1–24, no 1–25**: el 25 es igual al 1; si se reproduce, esa pose dura dos frames y el loop da un "tartamudeo". (Es la misma idea que el 1/26 de la nota 13, aquí con 24 frames.)

## 3. Tabla de poses (lo que se ve en pantalla + transcript)

Una sola pierna/brazo de referencia: **"pie A"** va delante en el frame 1 y **"brazo A"** es el del mismo lado. Del 13 al 22 se repite todo con los lados cambiados. Los grados que se leen en el panel del operador vienen entre comillas; el resto son estimaciones de los frames.

| frame | pose | pies (`foot_ik`, `foot_heel_ik`, `toe_ik`) | pelvis (`torso`) | caderas (`hips`) | pecho (`chest`) | brazos FK / hombros | cabeza |
|---|---|---|---|---|---|---|---|
| **1** | **CONTACT** | A delante (G+Y), **apoya el talón**, punta hacia arriba (rota `toe_ik`, un toque cartoon). B detrás: **solo toca con la punta**, talón levantado con `foot_heel_ik` (**"24.9°"** en el panel, 13:30) | **a media altura**, algo bajada (no es el punto más alto) | **giran hacia la pierna delantera** (yaw; **"14.66° global"** en pantalla, 28:20) | gira al revés que las caderas (contrapposto) y **se estira hacia arriba** (rota hacia atrás y sube) | brazo A **atrás**, brazo B delante y con más codo; **hombro A hacia atrás**, el otro hacia delante, los dos un poco subidos | neutra |
| **4** | **DOWN** | A **plano** en el suelo, **talón justo debajo de la rodilla**, espinilla vertical. B se despega y sigue hacia atrás, cerca del suelo (Alt+R resetea la rotación) | **lo más bajo** | siguen giradas; además **rotan hacia delante** (corrección de 63:30) | siguiendo el giro | **codo estirado** (el brazo de atrás llega al máximo) | **baja** (rota y baja con G) |
| **7** | **PASSING** | A bajo la cadera (Alt+G = centro), pierna casi recta. B pasa a su lado, **en el aire, punta hacia abajo**; en la limpieza los pies **se abren un poco hacia fuera** al pasar | a media altura, casi como contact (dice que podéis copiar la key de contact) | **la cadera cae del lado de la pierna en el aire** (la pierna de apoyo empuja hacia arriba el otro lado) + algo de giro | **inclinada al revés que la cadera** y **aplastada hacia abajo** (rota y baja) | los brazos **se quedan atrás** (drag), casi verticales; **arco hacia fuera**; **hombros bajan** (rotación + traslación) | sigue baja |
| **10** | **UP** | A empuja: el talón se levanta. B adelanta, levantado y estirándose. Cartel en pantalla (20:00): *"el pie NO debería subir tanto; levantamos los pies lo mínimo para ahorrar energía"*. En la escena el pie lleva **"-61.2°"**, que según el cartel es demasiado | **lo más alto** | vuelven hacia neutro | neutro | brazos cruzando; **la mano se queda atrás** respecto al antebrazo | **sube** (rota y sube con G). Opcional: escalar S+Y y S+Z para squash & stretch sin cambiar el volumen |
| 13 | CONTACT (espejo) | Ctrl+C sobre las keys 1-10 → frame 13 → **Ctrl+Shift+V** (*paste flipped*) | | | | | |
| 25 | CONTACT = 1 | Ctrl+V de la key 1 | | | | | |

Constantes del ciclo:
- **Inclinación hacia delante** del cuerpo en todo el ciclo: rotación X de `torso` (37:30 y otra vez en 66:00 con Astolfo: "se siente mucho más natural"). Para hacerlo sin estropear las keys: Graph Editor, **solo la curva X Quaternion Rotation de `torso`** (Shift+H), seleccionar todas sus keys y moverlas (G) a la vez.
- Curva Z de `torso`: **mínimos en 4 y 16, máximos en 10 y 22** (se ve en el Graph Editor a 64:30, una onda con periodo de 12 frames).
- La curva del pecho que se ve normalizada a 33:40 también es una onda de **12 frames**, con keys en los contact y los passing.

## 4. Flujo y trucos nuevos (no están en la nota 13)
| min | técnica | detalle |
|---|---|---|
| 11:30 | **Orientación Global vs Local** | **Global para mover pies y pelvis** (siguen el suelo). **Local para rotar** (sigue al hueso). |
| 16:00 | **A → I en cada pose** | con autokey, si mueves un hueso en una pose nueva y no hay key en todos, el resto interpola raro. Siempre: ir al frame, A, I, y después posar. |
| 15:30 | **Alt+R / Alt+G** | resetean la rotación / la posición a la de reposo (por ejemplo el pie plano en down, o el pie centrado en passing). |
| 20:30 | **Ctrl+C → Ctrl+Shift+V** | pega la pose **espejada** (L↔R): del 1-10 sale el 13-22 en un paso. Ella avisa (50:00): **no dejar el espejo tal cual**, siempre retocarlo a mano o queda "sin vida". El espejo **no le funcionó para los brazos FK** (40:00) y los posó a mano. |
| 23:40 | **el pie se planta 1–2 frames después del contact** | en el frame 1 el pie entra con la punta arriba y en el 2–3 queda plano. Así no se hunde en el suelo ni se "teletransporta". Para revisarlo frame a frame: **flechas ←/→** (un frame), **↑/↓** (key anterior/siguiente). |
| 26:20 | **el talón no puede retroceder a saltos** | en la vista lateral, revisa que el talón del pie apoyado no salte hacia atrás de un frame a otro. |
| 30:00 | **orden de animación** | pies → pelvis (`torso`, sube/baja) → caderas (`hips`, solo rotación) → pecho (`chest`) → brazos (upper_arm, forearm, hand en FK) → hombros → cabeza → limpieza. En cada hueso nuevo **borra las keys que no son contact**, posa los dos contact y luego añade down/passing/up. |
| 43:00 | **Alt+S → Butterworth Smooth** | en el Graph Editor suaviza las curvas seleccionadas sin cambiar las keys (control de frecuencia). Va bien en brazos, hombros y cabeza; si te pasas, el movimiento pierde carácter. |
| 46:20 | **viewport en Matcap** | ver el personaje gris/matcap para leer mejor la silueta. |
| 52:30 | **cabeza 1 frame tarde** | desfasa sus keys un frame y luego S+Y para bajar la amplitud. |
| 53:30 | **limpiar la X location de los pies** | el pie se iba hacia un lado. En el Graph Editor, X Location de `foot_ik`: borrar keys y poner **interpolación LINEAR** en el tramo en que el pie está apoyado para que "no se mueva hasta aquí". |
| 54:30 | **pies hacia fuera en passing** | un poco de X location hacia fuera y algo de rotación al pasar. |
| 56:30 | **rodillas** | "los principiantes se olvidan de las rodillas": al bajar no deben irse hacia dentro. Rota `thigh_ik` (sin pole) para que miren al frente; hay que quitar las curvas en zigzag. |
| **59:10** | **Motion Paths** | Pose Mode → Bone Properties → Motion Paths → *In Range* → **Calculate**. Dibuja el arco del hueso en el viewport y se actualiza al editar. Úsalo en **pies** (el arco del pie que sube y baja), en **manos** (arco hacia dentro en contact y hacia fuera en passing) y no tanto en caderas. Se borra con la X. |
| 62:40 | **muñecas atrasadas** | la mano siempre va por detrás del brazo (drag). |
| 65:00 | **Ctrl+H** | ocultar/mostrar los handles en el Graph Editor; con handles visibles se pueden escalar (S) o rotar (R) para ajustar el timing. **Ctrl+Space** maximiza el panel. |
| 66:30 | **dedos, pelo, mangas** | dedos posados limpios y por detrás de la mano. Pelo, orejas, lazo y mangas **reaccionan a la cabeza y al brazo**: van hacia un lado, rebotan arriba/abajo y quedan por detrás "como si los cogiera el viento". |

Guardado: **Ctrl+Alt+S** = guardado incremental (`...-final1.blend`, `-final2`…).

---

## 5. Receta bpy: el walk de Crashsune por script en NETO512 (**probado** en Blender 5.2, en una copia)

Script completo: `crashsune-extra/walk/neto_walk.py`. Uso: `blender -b <COPIA>.blend --python neto_walk.py -- out.glb [carpeta_render]`. Resultado: `walk/neto_walk_side.png` (8 poses vistas de lado) y `walk/neto_walk_front.png`.

### Datos del rig de NETO (comprobados)
- Armature `rig`, **224 bones**. Controles Rigify estándar: `torso`, `hips`, `chest`, `neck`, `head`, `shoulder.L/R`, `upper_arm_fk/forearm_fk/hand_fk.L/R`, `hand_ik.L/R`, `foot_ik.L/R`, `foot_heel_ik.L/R`, `foot_spin_ik.L/R`, `toe_ik.L/R`, `thigh_ik.L/R`, `thigh_ik_target.L/R`, `root`.
- **Propiedades IK/FK**: en `thigh_parent.L/R` y `upper_arm_parent.L/R`: `IK_FK` (**0 = IK, 1 = FK**; viene a 0 en las 4), `IK_Stretch` = 1.0, `pole_vector` = False (la rodilla se orienta rotando `thigh_ik`), `IK_parent`, `pole_parent`. En `torso`: `neck_follow`, `head_follow`, `torso_parent`.
- **Rotation modes**: casi todos en QUATERNION, pero **`foot_heel_ik` va en Euler ZXY y `shoulder` en Euler YXZ**. El helper tiene que mirar `pb.rotation_mode`.
- **Ejes**: `torso`, `hips`, `chest` y `foot_ik` están alineados con el armature (matriz identidad). **El personaje mira hacia −Y** y Z es arriba. Los huesos de brazo y hombro tienen ejes torcidos (pose A, brazos ~23° separados del cuerpo). Por eso el script expresa todo **en ejes del armature** y lo convierte al eje local de cada hueso: `q_local = R⁻¹ · q_arm · R` (R = `bone.matrix_local`) y `loc_local = R⁻¹ · v`.
- Signos en ejes del armature: pitch +X = **punta del pie hacia abajo** / tronco hacia delante / **brazo hacia atrás**; yaw +Z lleva +X hacia +Y (hacia atrás).
- **`neto.blend` está a 12 fps** (`scene.render.fps = 12`) y trae ya las acciones `face`, `laid` y `EmptyAction` (y pistas NLA). El script pone **24 fps** antes de keyear y exportar.
- Medidas: alto 1.63 m, cadera (cabeza de `DEF-thigh`) a 0.93 m, tobillo a 0.077 m, pierna ≈ 0.85 m.

### Valores usados (los de la tabla, pasados a NETO)
| fase de la pierna (frame para L; la R va +12) | adelante (m) | altura (m) | pitch pie | roll talón (`foot_heel_ik`) |
|---|---|---|---|---|
| 1 contact delante | +0.18 | 0 | −20° (punta arriba) | 0 |
| 4 down | +0.09 | 0 | 0 | 0 |
| 7 passing (apoyo) | 0 | 0 | 0 | 0 |
| 10 up (apoyo) | −0.09 | 0 | 0 | 15° |
| 13 contact detrás | −0.18 | 0 | 0 | 30° (ella 24.9°) |
| 16 despegue | −0.13 | 0.07 | +35° (punta abajo) | 0 |
| 19 passing (swing) | 0 | 0.09 | +20° | 0 |
| 22 up (swing) | +0.12 | 0.05 | −5° | 0 |

- `torso` Z: contact −0.03 · down **−0.06** · passing −0.02 · up **0.00**; **pitch +5° fijo** (inclinación hacia delante).
- `hips`: yaw ∓8° hacia la pierna delantera en contact (ella usa 14.66°, exagerado), roll −4° en passing (cae el lado de la pierna en el aire), pitch +3° en down.
- `chest`: yaw contrario a la cadera, con 5/8 de la amplitud; roll contrario; pitch −2° en contact (se estira) y +3° en passing (se aplasta).
- Brazos FK: swing ±20° (22° en down, 5° en passing, −12° en up). Antebrazo −6° si el brazo va atrás y −25° si va delante. Arco hacia fuera de 5° en passing. **Antebrazo desfasado +1 frame y mano +2 frames**.
- `shoulder`: yaw ±5° contrario a la cadera, bajan 3° en passing. `head`: pitch +3° en down y −2° en up, **+1 frame**.

### Esqueleto de la receta
```python
import bpy, math
from mathutils import Quaternion, Vector
from bpy_extras import anim_utils
rig = bpy.data.objects["rig"]; sc = bpy.context.scene
sc.render.fps = 24; sc.frame_start, sc.frame_end = 1, 24
for s in "LR":
    rig.pose.bones[f"upper_arm_parent.{s}"]["IK_FK"] = 1.0   # brazos FK
    rig.pose.bones[f"thigh_parent.{s}"]["IK_FK"] = 0.0       # piernas IK
act = bpy.data.actions.new("walk"); act.use_fake_user = True
rig.animation_data_create(); rig.animation_data.action = act

def q_arm(pitch=0, roll=0, yaw=0):              # grados, ejes del armature
    r = math.radians
    return Quaternion((0,0,1), r(yaw)) @ Quaternion((0,1,0), r(roll)) @ Quaternion((1,0,0), r(pitch))
def key(bone, f, loc=None, **rot):
    pb = rig.pose.bones[bone]; R = pb.bone.matrix_local.to_3x3()
    if loc is not None:
        pb.location = R.inverted() @ Vector(loc); pb.keyframe_insert("location", frame=f, group=bone)
    if rot:
        Rq = R.to_quaternion(); ql = Rq.inverted() @ q_arm(**rot) @ Rq
        if pb.rotation_mode == "QUATERNION":
            pb.rotation_quaternion = ql; pb.keyframe_insert("rotation_quaternion", frame=f, group=bone)
        else:                                      # foot_heel_ik (ZXY), shoulder (YXZ)
            pb.rotation_euler = ql.to_euler(pb.rotation_mode); pb.keyframe_insert("rotation_euler", frame=f, group=bone)

# pies: misma tabla de fases para los dos, la R desfasada 12 frames
for side, off in (("L", 0), ("R", 12)):
    for f in (1, 4, 7, 10, 13, 16, 19, 22, 25):
        fwd, z, pitch, heel = LEG[(f - 1 + off) % 24]
        key(f"foot_ik.{side}", f, loc=(0, -fwd, z), pitch=pitch)     # delante = -Y
        key(f"foot_heel_ik.{side}", f, pitch=heel)
# ... torso / hips / chest / brazos / hombros / cabeza (ver neto_walk.py)

# Blender 5.x: action.fcurves YA NO EXISTE -> channelbag del slot
cb = anim_utils.action_get_channelbag_for_slot(act, rig.animation_data.action_slot)
# (también: act.layers[0].strips[0].channelbag(slot).fcurves)
for fc in cb.fcurves:
    if fc.data_path.startswith('pose.bones["hand_fk'):                # drag: la mano 2 frames tarde
        for kp in fc.keyframe_points: kp.co.x += 2; kp.handle_left.x += 2; kp.handle_right.x += 2
for fc in cb.fcurves:
    for kp in fc.keyframe_points: kp.handle_left_type = kp.handle_right_type = "AUTO_CLAMPED"
    fc.modifiers.new("CYCLES")                                        # = Shift+E Make Cyclic
    if fc.data_path == 'pose.bones["foot_ik.L"].location' and fc.array_index == 1:
        for kp in fc.keyframe_points:
            if kp.co.x in (1, 4, 7, 10): kp.interpolation = "LINEAR"  # pie apoyado a velocidad constante
    fc.update()
act.use_frame_range = True; act.frame_start, act.frame_end = 1, 25
act.use_cyclic = True        # "Cyclic Animation": tangentes AUTO calculadas cruzando el corte 24→1
```
Notas de la prueba:
- **Las keys desplazadas (+1, +2) salen del rango 1-25 pero el modificador CYCLES las envuelve** (un ciclo de 24 frames, del 1 al 25). Igual que ella moviendo keys con G+X.
- **Comprobación de deslizamiento**: el tobillo L (`DEF-foot.L` en world) en los frames 1→7 avanza **exactamente 0.030 m/frame** (−0.102 → +0.078) y la punta queda en z = 0.011 mientras el talón sube (frames 8–13). Frame 25 = frame 1 al milímetro. Hace falta LINEAR en esa Y: con bezier el pie acelera y frena, y en la cinta se nota que patina.
- No hizo falta tocar `IK_Stretch`: con la pelvis bajada 3–6 cm la pierna nunca llega a estirarse del todo (distancia cadera–tobillo ≤ 0.843 m frente a 0.853 m de la pierna).
- Render de comprobación en `-b`: Workbench y **`image_settings.media_type = "IMAGE"` + `file_format = "PNG"`**. El .blend trae la salida en vídeo y en 5.x falla con *"Cannot write a single file with an animation format selected"*.

### Hornear y exportar como animación glTF con nombre
- Con `export_force_sampling=True` + `export_def_bones=True` **el exportador ya hornea** (evalúa Rigify, IK, Cycles) y no hace falta `nla.bake`. Sale: **`walk`, 105 canales en los 35 DEF, 25 muestras, de 0 a 1.0 s**, LINEAR.
- Modos probados:
  - `ACTIONS`: exporta **todas** las acciones del rig (`face`, `laid`, `walk`).
  - `ACTIVE_ACTIONS`: una sola, pero se llama **"Animation"** (pierde el nombre).
  - **`NLA_TRACKS`**: una por pista con el nombre de la pista. NETO ya trae pistas (`face`, `laid`), así que salen las tres. Es lo que usa el script:
```python
tr = rig.animation_data.nla_tracks.new(); tr.name = "walk"
st = tr.strips.new("walk", 1, act); st.action_frame_start, st.action_frame_end = 1, 25
rig.animation_data.action = None
bpy.ops.export_scene.gltf(filepath=OUT, use_selection=True, export_def_bones=True,
    export_animations=True, export_animation_mode="NLA_TRACKS", export_force_sampling=True,
    export_frame_step=1, export_anim_slide_to_zero=True, export_optimize_animation_size=False,
    export_reset_pose_bones=True, export_yup=True)
```
- `export_optimize_animation_size=False` en ciclos: si quita la última muestra "redundante", el clip dura menos de 1.0 s y el loop salta.

## 6. three.js: reproducirlo sin que patinen los pies
```js
const walk = THREE.AnimationClip.findByName(gltf.animations, 'walk');   // 1.0 s, in-place
const a = mixer.clipAction(walk); a.setLoop(THREE.LoopRepeat, Infinity); a.play();
const STRIDE_SPEED = 0.72;          // m/s = 0.36 m por paso / 0.5 s (sale del script: SPEED)
// glTF: el -Y de Blender (delante) pasa a +Z -> el personaje camina hacia su +Z local
function update(dt) {
  const v = targetSpeed;                       // velocidad del plano
  a.timeScale = v / STRIDE_SPEED;              // cadencia ligada a la velocidad: así no patina
  mixer.update(dt);
  char.translateZ(v * dt);                     // mover el personaje (in-place + traslación en código)
}
```
- **In-place + traslación en código** (lo que hace este rig: el pie apoyado va hacia atrás como en una cinta de correr) es lo más simple y cuadra exacto si se cumplen dos cosas. Velocidad = `0.36 m × 2 pasos / 1.0 s × timeScale`. **Y el pie apoyado tiene que ir lineal** (lo comprobado arriba).
- **Root motion** (alternativa): animar el avance real en `torso` Y (o `root`) con los pies quietos en world, y en three.js leer la pista `DEF-spine.position` para mover el objeto y restarla del clip. Solo vale la pena para pasos irregulares (tropezar, frenar); para un ciclo regular basta in-place.
- **Rango de velocidad sin que se note**: `timeScale` entre 0.8 y 1.2. Más rápido hay que hacer un run cycle aparte; más lento queda "a cámara lenta".
- **Si se muestrea a 12–15 fps (look PS1)** hay que cuantizar **también la traslación**, con el mismo reloj: `tq = Math.floor(t*12)/12`; `mixer.setTime(tq*a.timeScale)`; `char.position = start + dir*v*tq`. Si el cuerpo avanza suave y los pies a saltos, se ve patinar.
- Desde/hacia el idle: `walk.crossFadeFrom(idle, 0.15)`. Para pararse, crossfade en un **contact** (frame 1 o 13 → t = 0 o 0.5 s), que es cuando los dos pies tocan el suelo.

---

## Para nuestro proyecto (NETO512 obrera PS1 · shorts estilo @sinaboto)
Lo de la nota 13 (biblioteca de acciones por script, NLA, aditivo de respiración, 15 fps, holds) sigue valiendo. Esto es lo nuevo que aporta el walk:

1. **Ya tenemos un `walk` que funciona en NETO** (`walk/neto_walk.py`, verificado en render y en GLB). Añadirlo a la biblioteca como `walk` (1.0 s, 24 fps, in-place, 0.72 m/s). Al meterlo en el pipeline real hay que **unirlo con el export de `pieces/sina-test/export_neto.py`**: los materiales con alpha clip + `export_animations=True` + `NLA_TRACKS`.
2. **Personalidad de obrera** (ella: "las poses no son ley"):
   - **Botas pesadas**: el pie sube poco (z 0.05–0.07 en passing en vez de 0.09). En contact el pie entra menos punta arriba (−12°) y la pelvis baja más en down (−0.07): se nota el peso.
   - Más **balanceo de hombros** que de cadera (andar "de currante"): shoulder yaw 7–8°, hips yaw 5°.
   - **Con herramienta en una mano** (pala, cubo, sierra): quitar del clip las pistas del brazo que agarra y dejar ese brazo en una pose fija o con `hand_ik` sobre el prop: `clip.tracks = clip.tracks.filter(t => !/DEF-(upper_arm|forearm|hand)\.R/.test(t.name))`. El otro brazo sigue el swing. Mejor aún, una acción `walk_carry` aparte con el brazo cargado y el hombro de ese lado bajado (por el peso).
3. **Plano tipo sinaboto**: un walk dura **1–2 ciclos (1–2 s)** por plano. Cámara **lateral o de 3/4 fija** (la lateral es la que mejor lee el ciclo; la de frente casi no se entiende, como se ve en `neto_walk_front.png`). Se entra y se sale de plano caminando, o la cámara la sigue en *travelling* a 0.72 m/s con el personaje centrado. Así el ciclo se lee igual que en su hoja.
4. **Muestreo**: con poses cada 3 frames a 24 fps, **a 12 fps ("on twos") se mantiene la sensación pose a pose** y se pierde poco. A 8 fps cae justo en las 8 poses clave (1, 4, 7…), demasiado entrecortado salvo como efecto. Probar 12 frente a 15 contra las refs y **cuantizar también la traslación** (sección 6).
5. **Secundarios**: NETO **no tiene huesos de pelo ni de las mangas acampanadas**. Para tener el rebote que ella pide (pelo y mangas "reaccionan con retraso") hay dos opciones. Añadir 2–3 huesos a `hair-general`/`hair-front` y animarlos con el mismo truco de desfase (+2 frames, amplitud pequeña). O hacer un muelle barato en three.js que rote el hueso del pelo según la aceleración de `DEF-spine.006`.
6. **Antes de animar otras acciones con este script**: recordar que `neto.blend` está a **12 fps** (decidir 24 y dejarlo fijo), y que **`foot_heel_ik` y `shoulder` son Euler**.
7. Para retocar a ojo (como hace ella): abrir la copia con el MCP de Blender, **Motion Paths** en `foot_ik` y `hand_fk` para comprobar los arcos, y la hoja de referencia como imagen detrás (Shift+A → Reference) para comparar pose a pose.
