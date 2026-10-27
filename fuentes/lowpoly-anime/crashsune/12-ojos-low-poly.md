---
type: reference
status: active
tags: [crashsune, blender, ojos, iris, pupilas, eye-rig, transparencia, alpha, weight-paint, gltf, threejs, ps1, low-poly]
relatedTo: [crashsune-low-poly-series]
---

# 12 — How I 3D model and rig low poly eyes — Crashsune (25 min)

Visto entero: transcript (subtítulos auto-traducidos, algo raros: "armor" = *armature*, "eye light" = *Eye White*, "broadcast" = *emission*) + 7 hojas de frames + ~25 frames sueltos a 480p (material, UV, bones, weight paint, edge slide).
Personaje: **Love-chan** (cara de la serie), Blender **4.4.0 Beta**, EEVEE, Color Management **View Transform = Standard** (para que los colores pintados salgan iguales). Al final enseña el mismo sistema en otro personaje (estilo Panty & Stocking).
Idea central: **la textura de la cara tiene agujeros transparentes donde van los ojos**. Detrás de la cara hay (1) una **caja blanca** (blanco del ojo) y (2) dos **planos de iris** que mueve un **bone por ojo**. El agujero hace de máscara: el iris solo se ve a través del ojo, sin stencil ni shaders raros. Se ve "dentro" del ojo y puede mirar a los lados/arriba/abajo.

## Capítulos (descripción)
00:00 intro · 00:13 resultado final · 00:55 requisitos · 01:41 textura · 05:51 material · 08:54 modelado 3D · 15:33 rigging · 22:07 resultado final
(Después de 22:07: arreglos de clipping 22:58–23:50 y expresiones extra 23:50; el vídeo dura 25:20.)

## Enlaces
| enlace | qué es | ¿nos sirve? |
|---|---|---|
| https://www.crashsune.com/blender-freebies (Gumroad) | **"Low Poly Eye Rig Example"**: un .blend solo con la **cabeza** montada así (iris + blanco + bones L/R) | **Sí, descargarlo**: es la referencia exacta para estudiar jerarquía, pesos y distancias de los planos (cuánto meterlos dentro de la cabeza). Comparar con el rig de ojos de NETO |
| https://www.pureref.com | PureRef (tablero de referencias) | opcional |
| Su vídeo 11 (face rig 2D) | cambiar expresiones con la textura | ver [11-rig-cara-2d.md](11-rig-cara-2d.md); dice que es compatible: las otras expresiones (ojos cerrados, cansados) tapan los agujeros y el iris queda oculto |
| Photopea (photopea.com) | alternativa gratis a Photoshop | si no hay PS |

## Pasos con minuto

### 1. Textura: vaciar los ojos y sacar los iris (01:43–05:50, Photoshop)
- Abrir la textura de cara (tira de expresiones). Máscara de capa, borrar la expresión vieja donde irán los iris.
- **Lazo poligonal (L)** alrededor de **todo el blanco del ojo incluido el iris, sin las pestañas**; `Shift` para sumar el otro ojo. `Ctrl+X`, `Ctrl+V` → el ojo pasa a capa nueva y en la cara queda **agujero transparente**.
- Limpiar bordes (bloquear píxeles transparentes y repintar): "parece un detalle pero cambia mucho en Blender".
- En la capa nueva, borrar blanco y sombra (varita mágica + lazo) → **solo los iris**. Los deja **asimétricos** a propósito ("da vida"); se puede reflejar uno si se quiere.
- Moverlos a una **zona libre del atlas** (a la derecha de la tira, sobre fondo transparente). Guardar como **PSD** (Blender lee PSD; o PNG con alfa).
- En la vista final se ve la tira: [6 caras con ojos vacíos] + [2 iris rosas con corazón].

### 2. Material con transparencia (05:51–08:54)
- Image Editor con la textura → **`Alt+R`** recarga la imagen.
- Material de cara (leído en 7:40–8:20): `Image Texture` (**Closest, Flat, Repeat, Single Image, sRGB, Alpha Straight**) → `Color → Principled.Base Color` **y** `Color → Principled.Emission Color`, **Emission Strength 1.0**; **`Alpha → Principled.Alpha`**. Principled → Material Output.
- Emisión = colores idénticos a Photoshop sin depender de la luz (ella además pone Rendered, apaga luces y World a 0). Hace lo mismo con el material del cuerpo.
- Cartel en pantalla "si sigue sin ser transparente": 1) Material > Settings > **Blend Mode = Alpha Clip / Hashed / Blend** (solo versiones < 4.2); 2) usar **EEVEE**; 3) Blender ≥ 4.0; 4) vista **Rendered**; 5) textura recargada y con transparencia visible en el Image Editor.

### 3. Blanco del ojo — objeto `Eye White` (09:00–12:48)
- Edit mode, `3` caras, seleccionar **las 2 caras del ojo** en la cabeza → `Shift+D` (duplicar, clic para confirmar) → **`P` > Selection** (objeto aparte). Renombrar **"Eye White"**.
- Object mode, entrar en el nuevo objeto, `A`, **`G Y`** un poco hacia **dentro** de la cabeza.
- UV Editor (no confundir con Image Editor): `A`, `G`/`S` → mover sus UV a una zona del atlas que sea **solo píxeles blancos** (si no hay, pintar aunque sea 1 px blanco en una esquina).
- Aislar (`/`), **`E` extruir** hacia atrás (comprobar con `Alt+Z` X-ray que no sale por la nuca), **borrar las caras frontales**, `2` aristas → seleccionar los dos bordes → **`F`** rellenar. Resultado: una **caja/bandeja blanca abierta** detrás de los agujeros (ver frame 12:20).
- Si sale de otro color, tiene el material del cuerpo: asignarle `LoveChan_Face`. Verificar que **todas** sus UV caen en blanco.
- `G Y` hacia delante hasta que empiece a cortar con la cara y retroceder un poco → "blanco casi perfecto". `Shift+Alt+Z` oculta overlays para revisar.

### 4. Iris — objetos `Iris.L` / `Iris.R` (12:48–15:30)
- Otra vez las 2 caras del ojo → `Shift+D` → **`P`** (¡separar antes de mover!, si no se mueve la cabeza) → renombrar **`Iris`**.
- Edit, `A`, **`G Y` hacia dentro** (entre la cara y el blanco).
- UV: `A`, `G X` para llevarlas a la zona de los iris y **alinearlas sobre cada iris** (frame 14:30: dos quads marrones, cada uno sobre un iris). Usar el dibujo de referencia si se tiene.
- No ponerlos pegados al borde de la cara: al moverlos chocarían con la geometría exterior → dejarlos algo metidos.
- Separar cada lado: seleccionar una cara → `P` → nombres **`Iris.L`** (izquierda del personaje) e **`Iris.R`**.

### 5. Bones de ojo (15:36–18:28)
- Rig → edit → `Shift+A` → nuevo bone. Object Data > Bone Collections → nueva **"Eye Controllers"** → Assign → ★ aislar.
- Vista frontal: colocar/escalar el bone **delante del ojo izquierdo**; vista lateral: **rotar −90°** para que apunte hacia delante (fuera de la cara). Valores leídos (16:50): `Eye.L` head (0.061, −0.121, 1.809), tail (0.086, −0.192, 1.809), **Roll 0°**, longitud 0.075.
- Activar **Axes**: el Z apuntaba abajo → `N` > Item > **Roll = 0** para que **Z local = arriba**. Así en pose mode `G Z` = mirar arriba/abajo, `G X` = lados, `G Y` = dentro/fuera.
- Mover la **punta (tail)** un poco en X para que apunte desde la posición del ojo (si luego hay clipping se puede reajustar).
- `F2` → **`Eye.L`** (sufijo `.L` para que el simetrizado cree `.R`).
- Bone Properties > Relations > **Parent = bone de cabeza** (`head`/"head X" en su rig; en Rigify sería `DEF-spine.006`). Clic derecho → **Symmetrize** → aparece `Eye.R`.

### 6. Emparentar y pesar (18:28–20:30)
- Ocultar todo menos iris. Object mode: clic `Iris.L`, `Shift` clic `Iris.R`, `Shift` clic **armature** → `Ctrl+Tab` pose mode → `Shift` clic en **los dos bones** → **`Ctrl+P` > With Empty Groups** (cartel en pantalla con estos 5 pasos).
- `Iris.L` → Weight Paint → grupo **`Eye.L`** → herramienta **Gradient**, **Weight 1.0, Strength 1.0** (cartel), `N` > Tool > Options > **Auto Normalize ON** ("si no, el 90 % de las veces falla") → arrastrar hasta que todo esté **rojo**. Igual con `Iris.R` y el grupo **`Eye.R`**.
- Probar en pose mode: `G Z`, `G X` con **orientación Local** (si no, se pierde el trabajo del roll).

### 7. Encoger los iris para evitar clipping (20:52–22:10)
- Ocultar `Eye White`. Edit de `Iris.L`, `1` vértices, vista frontal. `N` > **Mirror X OFF** (si está activo, deforma raro).
- Seleccionar bordes y **`G G` (vertex/edge slide)** hacia dentro: el quad se hace lo más pequeño posible alrededor del iris. En el panel del slide: **Correct UVs ✔** → la UV se recalcula y la textura **no se mueve**, solo se recorta el plano.
- Cartel: se pueden seleccionar los dos iris en object mode, entrar juntos en edit y hacer el slide a la vez (simetría perfecta).
- `Alt+H` mostrar todo, quitar ★. Rotar el bone de cabeza: los ojos le siguen (son hijos).

### 8. Arreglar clipping al mirar a los lados (22:58–23:50)
- Si al hacer `G X` en pose mode el iris se corta: en edit mover la **cola del bone** un poco en X (cambia la dirección local) y/o meter los iris más dentro (`G Y`). Esas dos cosas casi siempre lo arreglan.

### 9. Expresiones (23:50)
- Las demás caras del atlas (parpadeo, cansado) siguen funcionando con la transparencia; con el rig del vídeo 11 se anima entre expresiones y el iris solo se ve cuando la expresión tiene agujero.

## Cómo hacerlo con bpy
```python
import bpy, bmesh
def split_faces(src, face_idx, name, push_y, uv_fn=None):
    """Duplica caras de 'src' a un objeto nuevo y lo empuja hacia dentro (+Y si la cara mira a -Y)."""
    me = bpy.data.objects[src].data
    bm = bmesh.new(); bm.from_mesh(me); bm.faces.ensure_lookup_table()
    keep = {bm.faces[i] for i in face_idx}
    bmesh.ops.delete(bm, geom=[f for f in bm.faces if f not in keep], context="FACES")
    for v in bm.verts: v.co.y += push_y
    uv = bm.loops.layers.uv.active
    if uv_fn:
        for f in bm.faces:
            for l in f.loops: l[uv].uv = uv_fn(l[uv].uv)
    new = bpy.data.meshes.new(name); bm.to_mesh(new); bm.free()
    ob = bpy.data.objects.new(name, new); bpy.context.collection.objects.link(ob)
    ob.matrix_world = bpy.data.objects[src].matrix_world
    return ob

def eye_bones(rig, head_bone, L_head, L_tail):
    bpy.context.view_layer.objects.active = rig; bpy.ops.object.mode_set(mode="EDIT")
    eb = rig.data.edit_bones.new("Eye.L"); eb.head, eb.tail, eb.roll = L_head, L_tail, 0.0
    eb.parent = rig.data.edit_bones[head_bone]; eb.use_deform = True
    er = rig.data.edit_bones.new("Eye.R"); er.head = (-L_head[0], *L_head[1:]); er.tail = (-L_tail[0], *L_tail[1:])
    er.roll = 0.0; er.parent = eb.parent; er.use_deform = True
    bpy.ops.object.mode_set(mode="OBJECT")

def bind_full(ob, rig, bone):
    """= Ctrl+P With Empty Groups + gradiente a 1.0: todo el iris al 100 % en un bone."""
    ob.parent = rig
    vg = ob.vertex_groups.new(name=bone); vg.add(range(len(ob.data.vertices)), 1.0, "REPLACE")
    ob.modifiers.new("Armature", "ARMATURE").object = rig
```
- Material: `Image(Closest) → Principled(Base Color + Emission Color, Strength 1)`, `Alpha → Alpha`; para glTF meter **Math Round** entre `Alpha` y el Principled → el exportador lo saca como `alphaMode: MASK` (recorte duro, sin problemas de orden).
- Encoger el quad del iris sin mover la textura = `bpy.ops.transform.edge_slide(value=..., correct_uv=True)` (o mover vértices y reproyectar UV con la misma matriz).

## Réplica en three.js (todo esto SÍ sobrevive al GLB)
A diferencia del vídeo 11, este método es **pura geometría + huesos + alfa**, así que exporta bien:
- **Iris pesado 100 % a un hueso** → se exporta como skin; en three se mueve el hueso: `eyeL.position.x += dx` / `.z += dz` en el **espacio local del hueso** (ojo: GLTFLoader quita los `.` de los nombres → `"Eye.L"` pasa a `"EyeL"`, `"DEF-eye.l"` a `"DEF-eyel"`; buscar con `getObjectByName` tras listar `skeleton.bones`).
- **Agujero de la cara** = material con `alphaTest: 0.5` (no `transparent`) → el depth buffer hace la máscara sola: el iris (detrás) solo se ve donde la cara es transparente. Poner `depthWrite: true` en todo.
- Look plano: `MeshBasicMaterial` (≡ su Emission strength 1) o `MeshLambert` si queremos sombreado PS1.
- **Clamp** a mano lo que en Blender sería Limit Location: `dx ∈ [-r, r]`, `dz ∈ [-r*0.6, r*0.6]` para no salir del blanco.
- Alternativa sin huesos: mover el **objeto** iris (hijo del hueso de cabeza) o desplazar la **textura** del iris (`map.offset`, `wrapS/T = ClampToEdge`, borde transparente), redondeando a **1/32** para que salte por píxeles (look PS1).
- Mirada automática: `target` (cámara u objeto) → proyectar al plano de la cara → `dx,dz` con suavizado y **micro-sacadas** (saltos de 1 px cada 0.5–2 s) para que esté vivo.

## Para nuestro proyecto (NETO512 de evanciao)
NETO **ya usa este mismo principio** pero en versión mini (inspeccionado en `assets/neto512/neto.blend`):
- `eyes` = quad de 4 caras con sprite `eye0` (contorno + pestañas con **interior transparente**) y Mirror; `pupils` = quad propio pegado al del ojo (misma zona, ligeramente metido) con `pupil0` (óvalo negro), **peso 100 % a `DEF-eye.l`** (y por Mirror a `DEF-eye.r`). Los huesos `DEF-eye.l/.r` se exportan al GLB (`export_def_bones=True`; están en `neto.glb`).
- Los controles en Blender: `eye.l/eye.r` (hijos de `MCH-eyes-pivot`) y `eyes-base` (mirada conjunta, con Limit Location/Limit Distance) → `ORG-eye.*` copia y `DEF-eye.*` sigue. En three no hay constraints: **mover directamente `DEF-eyel`/`DEF-eyer`** (mismo desplazamiento a los dos = mirada; distinto = bizco/cómico).
- `toggle pupil` del rig = ocultar pupilas en ojo cerrado → en three `pupils.visible = false` cuando `eyes = 2` (cerrado) o en el nuevo `eye3` feliz ^ ^.

**Recomendación**
1. Mirada: animar `DEF-eyel/DEF-eyer` en local con clamp pequeño (el ojo es de 32 px: ±2–3 px de recorrido). Redondear a pasos de píxel del sprite.
2. Sorprendido: `eye0` + **pupila más pequeña** (`pupils.scale` 0.6–0.7 o un `pupil1.png` dibujado) + cejas arriba (`eyebrows` subir 1–2 px o `eyebrows2`).
3. Enfadado: pupilas un poco hacia dentro/abajo + ceja nueva en diagonal (`eyebrows1`) + `eye1` (entornado).
4. Feliz ojos cerrados: nuevo `eye3` (^) y `pupils.visible=false`.
5. Hablar: ver nota 11 (swap de `mouth*` por palabra).
6. Si queremos iris de color/brillo como Love-chan: no hace falta remodelar; basta con dibujar `pupil1.png` con iris de color y brillo blanco — el sistema (quad + hueso) ya está.
7. Asegurar en el loader: materiales de cara con `alphaTest 0.5`, `transparent false` (el GLB actual viene con `BLEND`), Nearest, sin mipmaps.
No merece la pena rehacer los ojos de NETO al estilo "caja blanca + agujero": a 32 px el método de sprites de NETO ya da el mismo resultado; el aprendizaje útil del vídeo es **pupila en su propio quad pesado a un hueso + máscara por alfa + clamp del recorrido**.
