---
type: reference
status: active
tags: [crashsune, blender, animacion, rigify, idle-loop, graph-editor, gltf, threejs, ps1, low-poly]
relatedTo: [crashsune-low-poly-series]
---

# 13 — Cómo hago animaciones low poly en Blender — Crashsune (50 min)

Visto entero: transcript + 13 hojas de frames (cada 20 s) + ~60 frames sueltos a 480p en los momentos de pantalla (dope sheet, graph editor, salida).
Personaje: **Low Poly Juliet** (Lollipop Chainsaw), rig **Rigify**, Blender **4.2 LTS**, EEVEE. Animación: **idle en loop de 25 frames a 30 fps** con motosierra.
El método es justo el que necesitamos: **pose clave → copiarla al final → una pose intermedia → desfases de tiempo → movimiento secundario → parpadeo en constante**.

## Capítulos (descripción)
00:00 intro · 01:00 descargar el personaje · 01:51 preparar Blender · 04:00 referencias · 06:00 preparar Blender para animar · 06:56 posar · 15:22 animar · 37:27 render · 39:57 sonido · 45:00 IK vs FK · 46:50 cámara + render · 47:55 animaciones sin loop · 49:09 resumen

## Enlaces
| enlace | qué es | ¿nos sirve? |
|---|---|---|
| https://www.crashsune.com/blender-freebies | **Low Poly Juliet gratis** (Rigify, controles de cara, motosierra) y otros freebies | **Sí, descargarlo**: es un rig Rigify low poly anime ya animable. Sirve para estudiar cómo monta los controles de ojos/boca (bones que cambian la textura) y comparar con NETO512 |
| https://github.com/romanvolodin/dynamic_parent | add-on **Dynamic Parent** (dynamicparent.zip): emparentar un bone/objeto a otro y cambiar de padre durante la animación | Sí si una acción tiene objeto que pasa de mano o se suelta (encender fuego, tirar algo). En three.js lo hacemos con `bone.attach(prop)` |
| https://www.pureref.com | PureRef: tablero de referencias siempre encima | opcional |
| https://www.crashsune.com/low-poly-course | curso de pago (Gumroad) | no hace falta |
| Su tutorial "Blender 3D Animation Tutorial – Camera MASTERY" (aparece en 47:00) | cámara | opcional |

Notas de la página de Juliet (01:25, pantalla): Blender 4.0+ (el rig falla en 3.x); hecho para EEVEE; descomprimir el zip antes de abrir; al abrir pide ejecutar `rig_ui.py` → "Allow Execution"; las expresiones de la cara **solo se ven en modo Rendered** y recomienda desmarcar *Ray Tracing* y *Shadows* de EEVEE antes (si no, se cuelga compilando shaders varios minutos); la motosierra va emparentada a la mano con un *bone constraint*.

## Pasos con minutos

### 1. Preparar la escena (01:51 – 03:45)
- Abrir el .blend → **Allow scripts to run forever** (el rig Rigify necesita su `rig_ui.py` para el panel de IK/FK).
- Render Properties → **desmarcar Shadows y Raytracing** (02:21). Pulsar **Z → Rendered**: la primera vez se cuelga unos minutos compilando shaders (normal).
- La cara: dos bones de control, **`Eye_Control`** y **`Mouth_Control`**, flotando delante de la cara. Se seleccionan y se mueven con **G**: según la posición cambia la expresión de ojos/boca (cambio de textura, solo visible en Rendered). Se animan como cualquier bone.

### 2. Referencias (04:00 – 06:20)
- Juega el juego original y elige una animación con contraste caderas/hombros y el peso cargado en el brazo + motosierra (la "espera" estándar le parece aburrida).
- Saca capturas de la pose desde **frente, lado y espalda** (05:23). No copia la animación del juego (es un loop simple); solo la pose.
- Guarda como `..._IdleAnimation.blend`. PureRef al lado de Blender con Windows Snap.

### 3. Posar (06:56 – 15:16)
- Entrar en Pose Mode (**Ctrl+Tab**). **A** (todo) → **I** = keyframe de *Location, Rotation & Scale* en todos los bones (07:04). En 4.2 la **I** ya no abre menú; el menú antiguo es **K** (cartel en pantalla 07:35).
- **Auto Keying activado** siempre (07:44).
- Orden de posado (pose-to-pose, de abajo arriba):
  1. **Pies IK** (`foot_ik.L/R`): G+X, G+Y, R+Z para abrir la base (08:04).
  2. Vistas ortográficas: botón central sobre el gizmo + **Alt** para saltar a frente/lado/arriba (08:24).
  3. **Torso** (control `torso`): rotar y bajar (08:44). Caderas bajadas = más peso.
  4. **Rodillas**: rotar el pole/flecha de la rodilla con R (09:24, 12:32).
  5. **Manos IK** (`hand_ik.L/R`): G para llevarlas al mango (09:48). Brazo con R R (rotación libre) en el húmero.
  6. Codo raro → se corrige con el **pole** del codo (la flecha), R (11:49).
  7. **Clavícula/hombro** (`shoulder.L/R`) rotada (11:29).
  8. **Cabeza** mirando a cámara y un poco hacia abajo; "licencia creativa": la gira hacia nosotros aunque en el juego no mire (14:35).
  9. **Cara**: `Eye_Control` con G hasta una expresión que guste; boca neutra (14:13 – 15:16).
- Truco para menos ruido: panel **N → Item → Rig Layers** (Rigify) y ocultar las capas *Tweak*/setup (10:09 – 10:49). Ocultar un bone suelto con **H**.
- **Shift+Alt+Z** = ocultar overlays para ver la silueta limpia (lo usa constantemente).
- Ajuste de silueta: seleccionar el control de cadera + las dos manos y bajarlos juntos (12:53) — así el cuerpo baja sin que las manos se despeguen del arma.

### 4. Arma en dos manos: Dynamic Parent (15:22 – 17:59)
- Problema: al mover una mano la otra no sigue al arma.
- Instalar `dynamicparent.zip` (Edit > Preferences > Add-ons > desplegable > *Install from Disk*), activar y guardar.
- Seleccionar la mano hija, Shift+clic en la mano padre → N → pestaña **Dynamic Parent → Create**. **Hacerlo en el frame 1**: el add-on keya la influencia del constraint en el frame actual; si lo haces en el frame 10 solo vale desde ahí (16:57).
- Alternativa: Rigify ya trae **IK Parent / Pole Parent** en N (Root/Torso/Hips/Chest/Head) — más limitado.

### 5. Timing del loop (17:59 – 19:40) — el núcleo
- Output Properties: **30 fps**, frame start 1, **end 25** (se ve en pantalla 18:20: 1920×1080, 30 fps, 1–25).
- Elige **25 frames** porque se divide bien en bloques de 5.
- Frame 1: A → I. Copiar ese keyframe (**Ctrl+C**) y pegarlo en el **frame 26, no en el 25** (**Ctrl+V**): así la pose inicial no se reproduce dos veces y el loop es limpio (18:59).
- En el medio (frame **13–14**): A → I y **bajar el torso** (19:40). Ya hay "respiración".
- Cada vez que cambies la pose del frame 1 hay que **volver a copiarla al 26** (21:20).

### 6. Arreglos antes de animar (19:59 – 21:20)
- Las piernas atraviesan la falda → bajar el control de cadera y rotar los bones de falda.
- Object Data Properties → **Bone Collections**: la **estrella** aísla una colección (p.ej. solo "Skirt (Tweak)", "Hair", "Face Texture"…). Muy útil.

### 7. Hacer que el loop "viva" (22:00 – 37:20)
| min | técnica | detalle exacto |
|---|---|---|
| 21:41 | pose media | frame 13: bajar caderas, bajar cabeza, bajar brazos |
| 22:20 | no animar lo que ya sigue a otro | borró las keys de la mano que va emparentada a la otra |
| **22:41** | **desfase de tiempo (time offset)** | seleccionar la key media de la mano (`hand_ik.R`) y moverla del 13 al **16–17** → la mano llega 3–4 frames tarde = arrastre |
| **23:21** | **Make Cyclic (F-Modifier)** | A en el viewport, A en las keys → **Shift+E → Make Cyclic (F-Modifier)**. La curva se repite sola y las tangentes del principio/fin se suavizan (sin "parón" en el corte). Nota en pantalla 23:50: *mejor aplicarlo desde el Graph Editor que desde el Timeline* (en el timeline a veces no se aplica a todas las curvas, 38:46) |
| 24:03 | respiración en el pecho | bones `breast.L/R` (o `chest`) un poco abajo en la key media; borrar keys sobrantes |
| **24:43** | **tangentes automáticas** | A en bones + A en keys → **V → Automatic**: curvas súper suaves. "Ideal para idles; otras animaciones piden un toque más hecho a mano" |
| 25:44 | Graph Editor | **Ctrl+Tab** en el timeline → Graph Editor. Con **Normalize** activado (botón azul). Seleccionar los canales de rotación, **Shift+H** aísla, **Home** encuadra. Quitar *View > Show Markers* |
| **26:24** | **desfasar rotación respecto a posición** | en el Graph Editor seleccionar las keys de **rotación** de la mano y **G+X** unos frames → la rotación va por detrás de la posición (overlap). Con el ciclo, lo que se sale por el final vuelve por el principio |
| 27:27 | igual con location | desfasar también las curvas de location del brazo (G+X) |
| **28:07** | **hombros** | "error de principiante número uno: no animar los hombros". `shoulder.L/R`: bajarlos/rotarlos en la key media |
| **28:47** | **misma curva, menos amplitud** | si el movimiento es exagerado: insertar key a mitad de camino (frame 7) que ya tiene el valor intermedio, copiarla, pegarla en la key extrema y borrar la vieja → mismo timing, ~50 % de amplitud |
| 29:07 | torso/pecho | `chest` con rotación en la key 13; no tiene por qué compartir timing con la cadera (desfasar) |
| 30:29 | equilibrio | retocar la pierna para que la pose no quede desequilibrada; borrar keys creadas por auto-key que no hacen falta |
| 31:13 | **falda** | en el frame de mayor compresión rotar los bones de falda para que no atraviese; aislar colección (estrella), A, borrar keys inútiles |
| 32:15 | glúteos (bones extra) | en la key media hacia abajo, luego un rebote: copiar las keys del frame 1, pegarlas y subirlas un poco con G (33:00) |
| 33:20 | **por qué el ciclo** | sin el modificador cíclico la curva "pierde vida" al principio y al final (se aplana); con él no se atasca. Lo enseña deshaciendo y rehaciendo |
| **34:22** | **bajar intensidad global** | Graph Editor, **A**, **S → Y** escalando hacia el cursor: misma animación, más sutil |
| 34:43 | **pelo** | aislar colección *Hair*; en la key media rotar coletas (`Ponytail_L/R.001…`, `Hair_Right/Left`). Pegar la key 1 en la última, **Shift+E cíclico**. "En cuanto animas un poco de pelo la animación se ve mucho más terminada" |

### 8. Parpadeo = interpolación constante (36:04 – 37:25)
- Seleccionar `Eye_Control` → Timeline (Ctrl+Tab vuelve del Graph Editor).
- Frame **12**: I (ojos abiertos). Frame **13**: G hasta la expresión "ojos cerrados". Copiar la key de ojos abiertos y pegarla después.
- Primer intento: 1 frame cerrado → "demasiado corto, no se lee". Mueve la key de reapertura hasta el **frame 20** → **ojos cerrados ~7 frames (≈0,23 s a 30 fps)** (dope sheet en 36:50–37:04: keys en 1, 12, 13, 20).
- Problema: con bezier el control pasa por **todas las expresiones intermedias** (porque cada posición del bone es otra textura). Solución: A en las keys → **T → Constant** (37:00). En el Graph Editor se ve como escalones: "como stop-motion".
- **Regla general**: todo lo que sea "estado" (expresión, texturas de ojos/boca, visibilidad) → interpolación **CONSTANT**.

### 9. Render (37:27 – 39:57)
- Salida por defecto: **PNG RGBA** con **Film > Transparent** → 25 PNG con fondo transparente.
- Para compartir: File Format **FFmpeg Video**, Container **MPEG-4**, Video codec **H.264**, Output Quality *Medium*, Encoding Speed *Good*, Keyframe Interval 18 (pantalla 38:50).
- Sube el **End a 50** para que el MP4 tenga 2 vueltas del loop (falla si alguna curva no tiene el ciclo → reaplicar Shift+E en el Graph Editor).
- Color Management: View Transform **Standard**, Look *Medium Contrast* (38:00).
- Render rápido: **View > Viewport Render Animation** (lo añade a **Quick Favorites**, se lanza con **Q**). Ocultar overlays antes (Shift+Alt+Z) o salen en el render.

### 10. Sonido (39:57 – 44:51)
- Workspace **Video Editing**, arrastrar WAV desde el File Browser al Sequencer en el frame del evento; volumen 0.25 en el strip.
- Timeline > Playback > **Sync: Sync to Audio**, *Audio Scrubbing* activado (útil para lipsync).
- Si suena raro: Preferences > System > Sound > device **OpenAL**.
- **Encoding > Audio Codec AAC** (stereo, 48 kHz, 192 kbps): si no, el MP4 sale **mudo** aunque haya sonido en la escena.
- Él casi nunca mete sonido en Blender: lo hace en Premiere, salvo lipsync o videoclips.

### 11. IK vs FK (45:00 – 46:50)
- IK = mover (G) la mano/pie; FK = rotar (R) cada segmento.
- Panel N > Item (Rigify): **slider IK↔FK** por extremidad (Rig Main Properties: `IK-FK (hand.L)` etc.), botones de snap FK→IK / IK→FK, *Toggle Pole*, *IK Parent*, *Pole Parent*. Para ver los bones FK hay que activar la capa **Arm.L (FK)** en Rig Layers.
- El slider se puede keyar con I → animaciones que pasan de IK a FK.
- También aparece el panel **Rig Bake Settings → Bake All Keyed Frames** (para hornear al hacer snap).

### 12. Cámara (46:50 – 47:55)
- **Numpad 0** = vista de cámara. Seleccionar cámara, **Shift+`** = navegación walk/fly, rueda para ir más lento. Plano contrapicado (cámara baja) en el ejemplo.
- Keyar la cámara con I en el frame 1 y en el último con otra posición → movimiento lento. Viewport Render Animation desde la vista de cámara.

### 13. Animación sin loop (47:55 – 49:09)
- A en el Graph Editor → **Shift+E → Clear Cyclic (F-Modifier)**. Si hay curvas ocultas (por Shift+H) no se limpian: **Alt+H** para mostrarlas antes.
- Ejemplo: lanzar la motosierra al aire (keys en la mano IK) — mismo flujo.

### Resumen de su proceso (49:09)
Modelo preparado → referencias (frente/lado/espalda) → pose que case con la referencia → animar (pose 1 = última, pose media, desfases, secundarios) → sonido si hace falta → cámara → Viewport Render Animation.

---

## Cómo hacer cada paso por script (bpy)

Supuestos: armature `rig` (Rigify), controles estándar (`torso`, `hips`, `chest`, `neck`, `head`, `shoulder.L/R`, `hand_ik.L/R`, `foot_ik.L/R`, polos `upper_arm_ik_target.L` / `thigh_ik_target.L`, etc.). **Verificar nombres en NETO512** con `[b.name for b in rig.pose.bones if not b.name.startswith(('DEF-','ORG-','MCH-'))]`. Los controles Rigify van en **quaternion (WXYZ)** (se ve en el panel N); comprobar `pb.rotation_mode`.

```python
import bpy, math
from mathutils import Euler, Quaternion

rig = bpy.data.objects["rig"]
sc = bpy.context.scene
sc.render.fps = 30
sc.frame_start, sc.frame_end = 1, 25            # loop de 25 frames, key de cierre en 26

def act(name):                                   # una Action por clip, con fake user
    a = bpy.data.actions.get(name) or bpy.data.actions.new(name)
    a.use_fake_user = True
    rig.animation_data_create(); rig.animation_data.action = a
    return a

def key(bone, frame, loc=None, rot=None, scale=None):
    """rot = euler en grados (XYZ) -> se convierte a quaternion si hace falta."""
    pb = rig.pose.bones[bone]
    if loc is not None:
        pb.location = loc; pb.keyframe_insert("location", frame=frame, group=bone)
    if rot is not None:
        e = Euler([math.radians(v) for v in rot], 'XYZ')
        if pb.rotation_mode == 'QUATERNION':
            pb.rotation_quaternion = e.to_quaternion()
            pb.keyframe_insert("rotation_quaternion", frame=frame, group=bone)
        else:
            pb.rotation_euler = e; pb.keyframe_insert("rotation_euler", frame=frame, group=bone)
    if scale is not None:
        pb.scale = scale; pb.keyframe_insert("scale", frame=frame, group=bone)

def pose(frame, P):                              # P = {"bone": dict(loc=..., rot=...)}
    for b, kw in P.items(): key(b, frame, **kw)

def fcurves():                                   # Blender 5.x: action.fcurves YA NO EXISTE (slotted actions)
    from bpy_extras import anim_utils
    ad = rig.animation_data
    return anim_utils.action_get_channelbag_for_slot(ad.action, ad.action_slot).fcurves
```
**Ojo (verificado en nuestro Blender 5.2.2 LTS):** `Action.fcurves` fue eliminado; hay que ir por el *channelbag* del slot (helper de arriba). Los nombres de parámetros del exportador glTF y de `nla.bake` usados abajo están comprobados en 5.2. En la tabla siguiente, `act.fcurves` = `fcurves()`.

| paso del vídeo | equivalente en script |
|---|---|
| A → I en todos los bones (pose base) | `for pb in rig.pose.bones: pb.keyframe_insert(...)` solo en controles (no DEF/ORG/MCH) |
| copiar frame 1 al **26** | `pose(1, P0); pose(26, P0)` (misma dict) |
| pose media en 13 | `pose(13, P_mid)` |
| **desfase de la mano** 13→16/17 | `pose(16, {"hand_ik.R": ...})` en vez de 13, o mover keys: `kp.co.x += 3; kp.handle_left.x += 3; kp.handle_right.x += 3` |
| **Make Cyclic** | `for fc in act.fcurves: fc.modifiers.new('CYCLES')` |
| **V → Automatic** | `kp.handle_left_type = kp.handle_right_type = 'AUTO'` (o `'AUTO_CLAMPED'` para que no se pase) |
| desfasar solo la **rotación** | filtrar `fc.data_path.endswith('rotation_quaternion')` y desplazar sus keys N frames; el ciclo las envuelve |
| **S → Y** (menos amplitud) | por fcurve: `v0 = valor de reposo; kp.co.y = v0 + (kp.co.y - v0)*0.5` (y handles) |
| **T → Constant** (parpadeo/expresiones) | `kp.interpolation = 'CONSTANT'` en las fcurves del control de cara |
| quitar ciclo | `fc.modifiers.remove(m)` para cada `m.type == 'CYCLES'` |
| Dynamic Parent | en script: constraint `CHILD_OF` en la mano hija con `influence` keyada a 1 en frame 1 (lo mismo que hace el add-on); o mejor: el arma como bone hijo de `hand_ik.R` y la otra mano con IK |
| IK↔FK keyado | propiedad custom del bone padre (en Rigify moderno `rig.pose.bones["upper_arm_parent.L"]["IK_FK"]`): `pb["IK_FK"]=1.0; pb.keyframe_insert('["IK_FK"]', frame=f)` — **verificar nombre en NETO** |
| render MP4 | `r=sc.render; r.image_settings.file_format='FFMPEG'; r.ffmpeg.format='MPEG4'; r.ffmpeg.codec='H264'; r.ffmpeg.audio_codec='AAC'` (para nuestro pipeline no hace falta: renderiza three.js) |

Shift+E en Blender = `bpy.ops.graph.extrapolation_type(type='MAKE_CYCLIC')`; V = `bpy.ops.graph.handle_type(type='AUTO')`; T = `bpy.ops.graph.interpolation_type(type='CONSTANT')` (requieren contexto de Graph Editor; por datos, como arriba, es más fiable en `blender -b`).

## Exportar a GLB y reproducir en three.js

### Lo crítico con Rigify
- three.js **solo ve los huesos que deforman** (`DEF-*`). Las keys están en los **controles** (`hand_ik.R`, `torso`…), que mueven los DEF por **constraints**. El modificador cíclico y las constraints **no existen en glTF**.
- Por eso hay que **hornear (bake)** a los DEF: o lo hace el exportador muestreando (`export_force_sampling=True`, evalúa la pose final cada frame, constraints y F-modifiers incluidos), o se hace explícito con `bpy.ops.nla.bake` (más control y depurable):

```python
# seleccionar solo los DEF-*, pose mode
for b in rig.data.bones: b.select = b.name.startswith("DEF-")
bpy.ops.nla.bake(frame_start=1, frame_end=26, step=1, only_selected=True,
                 visual_keying=True, clear_constraints=False, clear_parents=False,
                 use_current_action=False, bake_types={'POSE'})
# -> nueva action con fcurves DEF-*; renombrarla p.ej. "idle_breath" y ponerle fake user
```

- Nuestro `export_neto.py` ya usa `export_def_bones=True`, así que con sampling el horneado sale solo. El 26=1 del loop encaja perfecto: el clip dura 25/30 s = 0,833 s y en `LoopRepeat` el tiempo `duration` coincide con el 0 → no hay frame doble.

### Varias acciones = varias animaciones con nombre
- Una **Action por clip** (`idle_breath`, `sit_light_fire`, `raise_saw`, …) con **fake user**.
- Opción A: `export_animation_mode='ACTIONS'` → cada action compatible con el armature sale como animación glTF con su nombre.
- Opción B (más robusta): meter cada action en una **pista NLA** con el nombre del clip (`track = rig.animation_data.nla_tracks.new(); track.name = 'sit_light_fire'; track.strips.new('sit_light_fire', 1, action)`) y `export_animation_mode='NLA_TRACKS'` → una animación glTF por pista. Dejar `rig.animation_data.action = None` antes de exportar.

```python
bpy.ops.export_scene.gltf(filepath=OUT, use_selection=True, export_def_bones=True,
    export_animations=True, export_animation_mode='NLA_TRACKS',   # o 'ACTIONS'
    export_force_sampling=True, export_frame_step=1,
    export_optimize_animation_size=True,      # quita keys redundantes (las "holds")
    export_anim_slide_to_zero=True,           # cada clip empieza en t=0
    export_reset_pose_bones=True, export_morph=True, export_yup=True)
```

- **Constante/STEP**: glTF soporta interpolación `STEP`, pero con sampling el exportador mete un valor por frame (lineal entre frames → el salto dura 1/30 s, invisible). Si se quiere STEP puro: en three.js `clip.tracks.filter(...).forEach(t => t.setInterpolation(THREE.InterpolateDiscrete))`.
- **Expresiones de cara**: si en NETO son *shape keys* → salen como morph targets y su animación como canal `weights` (`export_morph=True`). Si son cambio de textura por bone/driver (como Juliet) **no se exportan**: se hacen en three.js cambiando `map.offset` / material por expresión, programado con la misma regla "constant". Hay que comprobar cuál usa NETO512.

### three.js
```js
const gltf = await loader.loadAsync('neto_actions.glb');
const mixer = new THREE.AnimationMixer(gltf.scene);
const clip = THREE.AnimationClip.findByName(gltf.animations, 'sit_light_fire');
const a = mixer.clipAction(clip);
a.setLoop(THREE.LoopOnce); a.clampWhenFinished = true; a.play();
// idle encima, aditivo (respiración de Crashsune sobre cualquier pose):
const idle = THREE.AnimationUtils.makeClipAdditive(THREE.AnimationClip.findByName(gltf.animations,'idle_breath').clone());
mixer.clipAction(idle, undefined, THREE.AdditiveAnimationBlendMode).setEffectiveWeight(0.6).play();
```
Las animaciones pueden ir en un **GLB aparte** (solo armature + acciones) siempre que los nombres de los DEF sean idénticos: el mixer enlaza las pistas por nombre de nodo (`DEF-upper_arm.L.quaternion`).

---

## Para nuestro proyecto (NETO512 + motor PS1 three.js + shots estilo @sinaboto)

### Recomendación: biblioteca de acciones hecha en Blender por script, exportada como animaciones glTF con nombre
**Por qué no posar directamente en three.js** (como hace hoy `char.js` con ángulos Euler sobre un placeholder): sin IK los pies resbalan y las manos no agarran nada (sierra, jarra, cerilla); con 224 huesos ajustar ángulos a mano en JS es lento; y no se ve el resultado hasta renderizar. En Blender tenemos el **IK de Rigify, los polos, las vistas ortográficas y `mcp__blender__look`** para verificar cada pose.
**Por qué sí three.js para el resto**: timing del plano, cámara, props, mezcla de clips, efecto PS1 y render siguen en el motor.

Pipeline propuesto:
1. **`poses.py`** (bpy, sobre el `.blend` de NETO): diccionario de **poses clave** por control Rigify (`{"sit": {"torso": dict(loc=..., rot=...), "foot_ik.L": ..., ...}}`). Se ajustan por MCP mirando con `look` desde frente/lado (lo que hace ella con Alt+vista ortográfica).
2. **`actions.py`**: cada acción = lista de `(frame, pose, interp)` → crea la Action, mete keys, aplica reglas (abajo), hornea a DEF, la pone en una pista NLA con su nombre.
3. **Exportar** `neto_actions.glb` (`NLA_TRACKS`, sampling, DEF only). Un solo GLB con todas las acciones.
4. **three.js**: `shots.js` pide `play('raise_saw', {at: 0.2})`; la respiración (`idle_breath`, 25 frames, cíclica) va **aditiva** encima de cada pose sostenida.
5. Props: `bone.attach(prop)` a `DEF-hand.R` en three.js (el equivalente a Dynamic Parent); para soltar algo, `scene.attach(prop)` en el frame del evento. La sierra de dos manos: en Blender ambas manos IK encima de un bone `prop_saw`, y en three.js el prop sigue a `DEF-hand.R`.

Biblioteca inicial (2–4 s = **60–120 frames a 30 fps**): `idle_breath` (loop 25f), `sit_light_fire`, `raise_saw`, `pour_water`, `kneel`, `arms_up_celebrate`, `hands_on_hips`, `point`, + caras `face_neutral/happy/blink/surprised` como pistas aparte.

### Estructura de cada acción corta (derivada del método de Crashsune)
| frames (30 fps) | fase | regla |
|---|---|---|
| 1 | pose de entrada (= pose sostenida del plano anterior o neutra) | key en todos los controles |
| 4–8 | **anticipación** pequeña (bajar cadera/hombros, contrario a la acción) | 3–5 frames |
| 8–14 | **pose de acción** (la "foto" del plano: sierra arriba, brazos arriba, señalar) | llegar rápido: 4–6 frames |
| +2–4 | **overshoot/settle**: manos y cabeza llegan 2–4 frames después del torso (su "time offset" de 13→16/17) | rotación por detrás de la posición |
| resto | **hold** con `idle_breath` aditivo + parpadeo cada ~2–3 s | nunca congelado del todo |

### Reglas de timing/estilo para que lea como "cutscene de PS1"
1. **Pose-to-pose, poses muy legibles en silueta** (ella apaga overlays con Shift+Alt+Z para juzgar silueta): pocas poses, fuertes, mantenidas. Una acción por plano.
2. **30 fps de animación, pero muestreada a 15 fps ("on twos")** en el render: en three.js `mixer.update` con tiempo cuantizado `t = Math.floor(t*15)/15` (alternativa en Blender: F-modifier `STEPPED` con step 2 en las fcurves antes de hornear). Da el aire de juego de época sin perder la suavidad de cámara (la cámara puede ir a 30). Configurable por plano; probar 15 vs 30 contra las refs de sinaboto.
3. **Movimientos rápidos entre poses y holds largos**: transiciones de 4–8 frames, holds de 1–3 s. Nada de easing largo "de película".
4. **Secundarios mínimos pero presentes**: hombros (su "error de principiante"), pelo/coletas con 2–4 frames de retraso, falda; en low poly basta 1 key intermedia + ciclo.
5. **Amplitud pequeña en la respiración** (ella la escala con S→Y hasta que es sutil): torso/pecho ±2–4°, cadera ±1 cm, loop 25 frames.
6. **Todo lo que es estado va en CONSTANT/STEP**: expresiones, ojos cerrados (≥6–7 frames para que se lea), boca, cambio de mano de un objeto, aparición de fuego.
7. **Tangentes AUTO_CLAMPED** en las acciones (no bezier libre que se pase); `AUTO` solo en el idle cíclico.
8. **Pies plantados con IK**; si la acción cambia de apoyo (arrodillarse, sentarse) se keya el cambio en frames concretos, no se interpola deslizando.
9. **Cámara fija o un movimiento lineal lento** por plano (como su keyframe de cámara en 2 puntos); contrapicado suave para acciones "heroicas" (sierra arriba, celebrar).
10. **Cara a cámara**: ella gira la cabeza hacia el espectador aunque la referencia no lo haga — en explainers, la chica mira a cámara al final de la acción.

### Pendientes concretos
- Comprobar en NETO512: nombres de controles, `rotation_mode`, si las expresiones son shape keys o textura, y si hay bones de falda/pelo con DEF (para secundarios).
- Probar `export_animation_mode='NLA_TRACKS'` + `export_def_bones=True` + sampling con una acción de prueba (`raise_saw`) y verificar en three.js que no hay huesos girados (Rigify a veces reparenta DEF; revisar `DEF-thigh`, `DEF-shoulder`).
- Descargar **Low Poly Juliet** (gratis) para copiar su setup de controles de cara (`Eye_Control`/`Mouth_Control`) si NETO no trae expresiones.
