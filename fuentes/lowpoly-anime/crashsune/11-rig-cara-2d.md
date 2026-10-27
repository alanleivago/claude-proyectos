---
type: reference
status: active
tags: [crashsune, blender, cara-2d, face-swap, atlas, mapping-node, drivers, bone-constraints, gltf, threejs, ps1, low-poly, expresiones]
relatedTo: [crashsune-low-poly-series]
---

# 11 — Creating a 2D Face Animation Rig (final de la serie) — Crashsune (26 min)

Visto entero: transcript + 7 hojas de frames (cada 20 s) + ~35 frames sueltos a 480p, recortados y ampliados en los momentos de nodos, driver y constraint (valores leídos de pantalla).
Personaje: **Love-chan**, Blender **4.2.1 LTS**, rig **Rigify** (`rig`), EEVEE, vista Material Preview / Rendered.
Idea central: **una textura de cara = tira horizontal de 6 caras (atlas 6×1)**. La cara del modelo tiene UVs que cubren *una* celda; para cambiar de expresión se **desplaza la UV en X** con un nodo Mapping. Un **bone de control** mueve ese desplazamiento con un **driver**, y se separan **ojos** y **boca** en dos materiales con dos bones.

## Capítulos (descripción)
00:00 intro · 00:31 descargar la textura · 01:18 material de cara · 02:19 asignar textura al modelo · 03:18 arreglar UVs · 04:21 material para animación en el Shader Editor · 14:47 bone de control en el rig · 16:13 drivers en el Shader Editor (+ arreglar bone roll) · 19:44 constraints del bone · 21:50 separar boca y ojos · 25:01 que los controles sigan a la cabeza · 25:53 outro

## Enlaces
| enlace | qué es | ¿nos sirve? |
|---|---|---|
| https://www.patreon.com/posts/109722076 | Post de Patreon (miembro gratis) con **`LoveChan-Textures_FacialTexturesFIXED.png`**: la tira de 6 caras (normal, ojos cerrados, feliz ^^, sorprendida con ojos en espiral, mareada, "silly" con lengua). Usar la versión *FIXED*, la primera tenía errores | Solo como **referencia de diseño de atlas** (cómo dibuja 6 expresiones alineadas en celdas iguales). No la necesitamos para NETO |
| https://www.youtube.com/watch?v=E96m9Z4iTcc | **Lacruzo – "Animating Faces with a 2D Texture in Blender"**: el método original del que parte; explica cómo *dibujar* la textura desde cero | **Sí, verlo**: es el que enseña a pintar los sprites de cara alineados a las UV. Útil para dibujar nuestras expresiones nuevas de NETO |
| https://www.crashsune.com/blender-freebies | freebies (Low Poly Juliet, etc.) | ver nota 13 |

## Pasos con minuto

### 1. Material de cara (01:18–02:19)
- Seleccionar la malla de la cabeza → Material Properties → `+` → elegir `LoveChan_Body` → **duplicar** (botón de copias) → renombrar **`LoveChan_Face`**.
- Abrir un Shader Editor (arrastrar desde la esquina inferior izq.). **Arrastrar el PNG** de la tira desde el explorador al Shader Editor y sustituir la imagen del cuerpo.
- Material visto en 04:50: `Image Texture → Emission (Color)`, **Strength 1.0** (sin luz; el color pintado sale tal cual = look plano). Imagen: **Linear, Flat, Repeat, Single Image, sRGB, Alpha Straight**.
  - Ojo: ella dejó *Linear*; para PS1/pixel conviene **Closest** (en el vídeo 12 ya usa Closest).

### 2. Asignar y re-UV (02:24–04:10)
- Aislar la malla con `/` (numpad), vista frontal `1`, `Tab` (edit), `3` (caras), `Alt+A`, seleccionar con `C` (círculo) **todas las caras de la cara que se animan** (ojos+boca+zona media). `H` para comprobar.
- En el slot `LoveChan_Face` → **Assign**. Se ve raro porque la textura tiene otro aspecto que la del cuerpo → rehacer UV.
- `U` → **Project from View** (desde la vista frontal). Abrir UV Editor, `G`/`S` para encajar las caras **sobre la primera celda** (cara 1). Referencia de alineado: la **sombra de la nariz** pintada con el borde inferior de la geometría de la nariz.

### 3. Grafo de nodos del face-swap (04:21–14:47)
Requiere add-on **Node Wrangler** (Edit > Preferences > Add-ons). Clic en la Image Texture → `Ctrl+T` añade **Texture Coordinate (UV) → Mapping (Point)**.
Solo se ve en **Material Preview o Rendered** (en Solid no cambia nada).

1. Cambiar `Mapping.Location.X` desplaza la textura → pasa por las 6 caras. Como la tira es **horizontal (6×1)** solo se toca **X** (si fuera vertical, Y).
2. **6 nodos Combine XYZ**, uno por expresión (`Shift+A` → Combine XYZ, `Shift+D` duplicar). Valores de X leídos en pantalla:
   | expr | X |
   |---|---|
   | 1 normal | 0.000 |
   | 2 ojos cerrados | **0.164** (ajustado a ojo con la nariz) |
   | 3 feliz ^^ | 0.164\*2 = 0.328 |
   | 4 sorpresa (ojos espiral) | 0.164\*3 ≈ **0.493** (corregido +0.001) |
   | 5 mareada | 0.164\*4 |
   | 6 silly (lengua) | 0.164\*5 |
   Truco: en el campo se puede escribir `*2`, `*3`… (Blender evalúa la expresión). El paso ideal sería 1/6 = 0.1667; ella usa 0.164 porque su UV no coincide exactamente con la celda.
3. **5 nodos Mix** en modo **Vector** (Uniform, *Clamp Factor* on, Factor 0) encadenados: Mix1 `A=XYZ1, B=XYZ2`; Mix2 `A=Result(Mix1), B=XYZ3`; … Mix5 `B=XYZ6`. `Result(Mix5) → Mapping.Location`.
   - Con Factor continuo la cara **se desliza** entre celdas (feo). Hay que hacer que **salte**.
4. **Snap**: un nodo **Value** + 5 nodos **Math › Greater Than** (Clamp off) con **Threshold 1, 2, 3, 4, 5**. `Value → Value` de cada Greater Than; `Greater Than.Value → Factor` del Mix correspondiente.
   - Value < 1 → cara 1; >1 → cerrados; >2 → feliz; >3 → sorpresa; >4 → mareada; >5 → silly. Por eso los umbrales llegan a 5 aunque haya 6 caras.

Grafo final:
```
TexCoord.UV ─► Mapping(Point).Vector
Value ──┬─► GT(1) ─► Mix1.Fac   Mix1(A=XYZ0, B=XYZ1)
        ├─► GT(2) ─► Mix2.Fac   Mix2(A=Mix1, B=XYZ2)
        ├─► GT(3) ─► Mix3.Fac   Mix3(A=Mix2, B=XYZ3)
        ├─► GT(4) ─► Mix4.Fac   Mix4(A=Mix3, B=XYZ4)
        └─► GT(5) ─► Mix5.Fac   Mix5(A=Mix4, B=XYZ5) ─► Mapping.Location
Mapping.Vector ─► ImageTexture(tira 6×1) ─► Emission.Color (Strength 1)
```
"Animar en el Shader Editor es muy molesto" → se controla desde un bone.

### 4. Bone de control (14:47–16:13)
- Seleccionar el rig → `Tab` (edit) → `Shift+A` nuevo bone → renombrar **`Face_Control`**. `1` vista frontal, `G` arriba de la cabeza, `S` más pequeño; vista lateral, `R` **90°** para que apunte hacia delante/arriba.
- Object Data Properties → Bone Collections → `+` → renombrar **"Face Controllers"** → **Assign**. Estrella (★) para aislar la colección.

### 5. Driver (16:13–19:44)
- Material `LoveChan_Face` → clic derecho en el campo del **nodo Value** → **Add Driver**. (Si el popup se cierra al sacar el ratón: clic derecho → **Edit Driver**.)
- Driver (leído en 16:50–19:10): Type **Scripted Expression**; variable `var` = **Transform Channel**; Object **`rig`**; Bone **`Face_Control`**; Type **Z Location**; Space **Local Space**.
- **Bug de bone roll** (17:34): solo funcionaba bajando el bone. En edit mode, `N` > Roll estaba en **180°** → poner **0°** (activar *Axes* en Object Data > Viewport Display para ver los ejes). Blender es Z-up; queremos que subir el bone = +Z local.
- Sensibilidad (18:55): la expresión por defecto `var + 0.38` (el valor que tenía el nodo) → cambiarla a **`var * 15`**. Así con poco recorrido se pasan las 6 caras.

### 6. Constraint Limit Location (19:44–21:50)
- Pose mode → Bone Constraint Properties → **Limit Location**: Min X, Min Y, Max X, Max Y activados = 0; **Owner: Local Space** (si no, se teletransporta a la cara).
- **Min Z** activado = 0 (no puede bajar). **Max Z** = la altura con la que se llega a la última cara: subir el bone hasta "silly", copiar Z del panel Move (en el vídeo **0.579**) y pegarlo en Max Z.
- Bone Properties > Viewport Display > color del bone (rosa) para distinguirlo.

### 7. Separar ojos y boca (21:50–25:01)
- Nuevo slot: duplicar `LoveChan_Face` → **`LoveChan_Mouth`**. En edit mode seleccionar **solo las caras de la boca** → Assign. Renombrar el otro a `LoveChan_Eyes`.
- Rig: duplicar el bone (`Shift+D`, `G X`) → **`Mouth_Control`**; renombrar el primero **`Eye_Control`** (F2). Color azul para el de boca.
- Material de boca → Edit Driver → Bone = `Mouth_Control`. Material de ojos → Bone = `Eye_Control`.
- Resultado: **misma tira, dos materiales con su propio offset** → ojos de la cara 3 + boca de la cara 6, etc. Mezcla libre.

### 8. Que sigan a la cabeza (25:01–25:53)
- Edit mode → Bone Properties > Relations > **Parent = `DEF-spine.006`** (el bone de cabeza en Rigify) para ambos controles. Al girar la cabeza los controles van con ella y solo cambian la expresión al moverlos en su Z local.

## Cómo hacerlo con bpy (script)
Versión simplificada equivalente (sin la cadena Mix/GreaterThan: el `floor` hace el "snap"):
```python
import bpy
def face_swap(mat_name, rig_name, bone_name, n_cells=6, step=1/6, gain=15.0):
    m = bpy.data.materials[mat_name]; nt = m.node_tree
    tex = next(n for n in nt.nodes if n.type == "TEX_IMAGE")
    tex.interpolation = "Closest"; tex.extension = "REPEAT"
    tc = nt.nodes.new("ShaderNodeTexCoord")
    mp = nt.nodes.new("ShaderNodeMapping"); mp.vector_type = "POINT"
    nt.links.new(tc.outputs["UV"], mp.inputs["Vector"])
    nt.links.new(mp.outputs["Vector"], tex.inputs["Vector"])
    # driver directo sobre Location.X con snap a celdas enteras
    fc = mp.inputs["Location"].driver_add("default_value", 0)
    d = fc.driver; d.type = "SCRIPTED"
    v = d.variables.new(); v.name = "z"; v.type = "TRANSFORMS"
    t = v.targets[0]; t.id = bpy.data.objects[rig_name]; t.bone_target = bone_name
    t.transform_type = "LOC_Z"; t.transform_space = "LOCAL_SPACE"
    d.expression = f"floor(min(max(z*{gain},0),{n_cells-1}))*{step}"

def control_bone(rig_name, name, head, parent="DEF-spine.006", max_z=0.34):
    rig = bpy.data.objects[rig_name]; bpy.context.view_layer.objects.active = rig
    bpy.ops.object.mode_set(mode="EDIT")
    eb = rig.data.edit_bones.new(name); eb.head = head; eb.tail = (head[0], head[1], head[2] + 0.05)
    eb.roll = 0.0; eb.use_deform = False; eb.parent = rig.data.edit_bones[parent]
    bpy.ops.object.mode_set(mode="POSE")
    c = rig.pose.bones[name].constraints.new("LIMIT_LOCATION"); c.owner_space = "LOCAL"
    c.use_min_x = c.use_max_x = c.use_min_y = c.use_max_y = c.use_min_z = c.use_max_z = True
    c.max_z = max_z   # = (n_cells-1)/gain + margen
```
- Keys: `pose.bones["Eye_Control"].keyframe_insert("location", index=2)` y poner interpolación **CONSTANT** en las fcurves para que no haya frames intermedios raros (con el floor ya salta, pero CONSTANT evita "pasar" por caras intermedias al ir de 0 a 4).
- Alternativa más directa sin bone: custom property en el armature/objeto (`rig["eyes"] = 0`) y driver `SINGLE_PROP` — es justo lo que hace NETO (ver abajo).

## Por qué NO sobrevive a glTF y cómo se replica en three.js
- **Drivers, nodos Value/Math/Mix y la cadena Mix no se exportan**. El exportador glTF solo entiende `Image → (Mapping estático) → Principled`. Un Mapping con valores **constantes** sí sale como `KHR_texture_transform` (offset/scale), que GLTFLoader traduce a `texture.offset/repeat`, pero **sin animación** (KHR_animation_pointer no lo soporta GLTFLoader de forma fiable → no contar con ello).
- Se exporta la imagen y las UV de la celda 1. El cambio de cara se hace **en runtime**.

### Opción A — atlas + `texture.offset` (lo que hace el vídeo)
```js
// tira horizontal de N celdas, la UV del mesh cubre la celda 0
const tex = mat.map;                  // viene del GLB (flipY=false)
tex.magFilter = tex.minFilter = THREE.NearestFilter; tex.generateMipmaps = false;
tex.wrapS = THREE.RepeatWrapping;     // como "Repeat" en Blender
function setCell(i, step = 1/6) { tex.offset.x = i * step; }   // = Mapping.Location.X (tipo Point)
```
- `uv' = uv*repeat + offset` en three ≡ Mapping *Point* de Blender, así que **los mismos números** (0.164·i) valen en X.
- En **Y** el signo se invierte (glTF tiene V hacia abajo): una tira **vertical** necesita `offset.y = -i*step`.
- Si la UV del mesh cubre toda la textura (0..1) en vez de una celda: `tex.repeat.set(1/N, 1)` + `offset.x = i/N`.
- Ojos y boca separados = **dos materiales** que comparten imagen → hay que **clonar la textura** (`mat.map = mat.map.clone()`), si no el offset de uno mueve el otro.
- Píxeles: sin mipmaps + Nearest + 1 px de margen entre celdas para que no sangre la celda vecina.

### Opción B — cambiar de textura (cada expresión un PNG)
```js
const eyes = await Promise.all(['eye0','eye1','eye2'].map(n => loader.loadAsync(`tex/${n}.png`)));
eyes.forEach(t => { t.flipY = false; t.colorSpace = THREE.SRGBColorSpace;
  t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; });
eyeMesh.material.map = eyes[i];        // mismo tamaño/formato → no hace falta material.needsUpdate
```
- `flipY = false` obligatorio porque las UV vienen del GLB.

### Equivalente del "bone + driver + snap"
En vez de un bone, una **pista por plano** en `shots.js`: `face: [[t0,{eyes:2,mouth:0}], [t1,{eyes:0,mouth:3}], ...]` evaluada en cada frame con **step** (valor del último key ≤ t). Es el `CONSTANT` + `floor` del vídeo.

## Para nuestro proyecto (NETO512 de evanciao)
**Lo que ya tiene NETO** (inspeccionado con Blender 5.2 en `assets/neto512/neto.blend`):
- La cara son mallas separadas: `eyes` (4 caras, **Mirror** modifier → un sprite de un ojo reflejado), `pupils` (Mirror + peso 100 % a **`DEF-eye.l`** → el reflejo va a `DEF-eye.r`), `eyebrows` (Mirror), `mouth` (sin mirror). Todas pesadas a `DEF-spine.006` salvo las pupilas.
- Cada material usa la imagen como **Image Sequence** (`eye0.png` → eye0, eye1, eye2…) con driver en `image_user.frame_offset` = `eyes - 1`, y la variable lee **custom properties de la Bone Collection "Head" del armature `rig`**: `eyes`, `mouth`, `eyebrows`, `pupil`, `toggle pupil`. `toggle pupil` multiplica el alfa de la pupila (×0/×1) para ocultarla con ojos cerrados.
- La acción **`face`** (0–47) es justo la demo: keys **CONSTANT** de `["eyes"]` (1→2→1→0→1 = parpadeo), `["mouth"]` (0→3→0), `["toggle pupil"]` (1→0→1 durante el parpadeo) y movimiento de `eyes-base` (mirada) + cabeza.
- Sprites (32×32): `eye0` abierto, `eye1` entornado, `eye2` cerrado (pestañas hacia abajo); `pupil0` óvalo negro; `eyebrows0`; `mouth0` sonrisa pequeña, `mouth1` sonrisa, `mouth2` boca "w", `mouth3` "ɛ"/morrito, `mouth4` "- -" plano.
- El GLB actual (`pieces/sina-test/models/neto.glb`) exporta solo `eye0/mouth0/pupil0/eyebrows0` y los materiales salen con `alphaMode: BLEND` (el `blend_method = CLIP` del script no se aplicó en Blender 5.x).

**Recomendación: Opción B (swap de texturas), no atlas.** Es exactamente el modelo de NETO (un PNG por estado, misma UV), no hay que tocar UVs ni re-exportar, y los sprites ya están sueltos en carpetas.
1. Cargar en three.js los PNG de `assets/neto512/{eyes,mouths,eyebrows,pupils}` como arrays (Nearest, sin mipmaps, `flipY=false`, sRGB) y localizar las mallas `eyes`, `mouth`, `eyebrows`, `pupils` del GLB.
2. API única: `setFace({eyes, mouth, brows, pupil:true|false})` → cambia `material.map` y `pupils.visible` (≡ `toggle pupil`).
3. En los materiales de cara: `alphaTest = 0.5`, `transparent = false`, `depthWrite = true` (evita problemas de orden con BLEND). Para arreglarlo ya en el GLB: meter un Math **Round** entre el alfa de la textura y el alfa del Principled (el exportador glTF lo detecta como `MASK`).
4. **Dibujar los sprites que faltan** (32×32, mismo encuadre que eye0/mouth0, mismo grosor de línea):
   - `eye3` **feliz ^ ^** (arco hacia arriba) → con `pupil:false`.
   - `eye4` **sorprendido**: ojo más grande/redondo; pupila más pequeña = `pupil1.png` (o escalar la malla `pupils` 0.7).
   - **enfadado**: mejor como **ceja** (`eyebrows1` en diagonal hacia dentro) + `eye1` entornado. Las cejas son las que leen la emoción.
   - `mouth5` **O abierta** y `mouth6` **grito/abierta grande** para hablar y sorpresa.
5. **Boca hablando**: ciclo `mouth5 ↔ mouth0/mouth4` cada 3–4 frames (a 24–30 fps) **solo mientras hay palabra** (tenemos tiempos por palabra en `words.js`); cerrar en silencios. Variar el patrón (no siempre alterno perfecto) para que no se vea mecánico.
6. **Parpadeo** como en la acción `face`: `eyes 0→1→2→1→0` en 1 frame cada uno con `pupil:false` en el frame cerrado, cada 2–4 s al azar.
7. Expresión por plano en `shots.js` con interpolación step (lo del `floor`/CONSTANT del vídeo).
Opción A (atlas) solo si algún día queremos una sola textura de cara (p. ej. todas las bocas en una tira 8×32 px); entonces `offset.x = i/N`, `repeat.x = 1/N` y clonar la textura por material.
