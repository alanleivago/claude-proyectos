---
type: plan
status: active
tags: [ps1, low-poly, personaje, neto512, sinaboto, blender, threejs, rigify, gltf]
relatedTo: [the-psx-texturing-tutorial-i-wish-existed, the-simplest-guide-to-ps1-graphics-in-blender, crashsune-low-poly-series, sinaboto-style]
---

# Guía del personaje PS1 (base NETO512 + estilo sinaboto)

Síntesis de lo estudiado. Base mandante: **NETO512 de evanciao** y **los videos de @sinaboto**. Lo demás suma técnicas.
Fuentes: [evanciao](the-psx-texturing-tutorial-i-wish-existed.md) · [SunnyIsOnline](the-simplest-guide-to-ps1-graphics-in-blender.md) · Crashsune 01–14 en `crashsune/` (notas por video, con snippets bpy).

## 1. El modelo (NETO512, no se modela de cero)
- 540 tris, Rigify (224 huesos, deform = `DEF-*`), una textura 256×256 + cara en sprites 32×32 (ojos, pupilas, cejas, boca) en mallas aparte.
- Crédito obligatorio en cada video: **"neto model created by @evanciao"**. No redistribuir el asset.
- Lo nuevo (casco, botas de trabajo, rodilleras) se modela al estilo Crashsune: objetos separados que **se solapan** (no se sueldan), todo en Edit Mode con origen en (0,0,0).
  - **Casco**: receta del "hair cap" (cubo sin fondo, mitad + Mirror, 2 loop cuts, vértices centrales bajados = cresta) + ala extruida del loop inferior. Color plano a un swatch de la textura (sin UV propia).
  - **Botas**: cubo + 2 loop cuts (columna del talón + empeine). **Rodilleras**: banda de la rodilla movida al swatch.
  - **Pelo bajo el casco**: anillo de puntas (flequillo, mechones laterales, nuca) con Extrude + *Merge At Center*; solo importa la silueta.
- Unir accesorios al rig: **parent a un `DEF-` en pose de reposo** (si no, queda desplazado ~4,6 cm) o skin rígido peso 1.0. Chaleco ajustado: Data Transfer de pesos desde `upper-body` + normalizar.

## 2. Textura (pintar como evanciao, por script)
- Capas de NETO: `base` (valores en grises) → `color` (modo Color encima) → `highlights` / `multiply`. **Para cambiar el outfit solo se repinta `color`** sobre los valores existentes.
- Pintado por script: rasterizar los triángulos UV para saber posición 3D y normal de cada píxel + a qué hueso pertenece → pintar franjas reflectivas del chaleco, rodilleras, sombras de 3 tonos (luz/medio/oscuro según la normal) de forma continua entre costuras.
- Truco de sombra de pelo de Crashsune: UV de la cara rotado sobre el borde recto de una sombra pintada → sombra anime diagonal.
- Texturas de escenarios: bajar a 120–240 px, **paleta indexada de 8–16 colores con Floyd-Steinberg** (PIL `quantize`), filtro Closest. Sin dither en modelos de sombreado plano.

## 3. Cara y expresiones
- NETO cambia cada parte de la cara con secuencias de PNG elegidas por propiedades del rig (`eyes`, `mouth`, `eyebrows`, `pupil`). Nada de eso (drivers/nodos) exporta a glTF.
- **En three.js**: precargar los sprites y cambiar `material.map` con `setFace({eyes, mouth, brows, pupil})` (Nearest, sin mipmaps, `flipY=false`). Cambios **escalonados** (constantes), boca de habla sincronizada a `words.js`, parpadeo ~7 frames cerrado.
- Sprites que faltan: ojos felices ^^, boca "O", boca gritando, ceja enojada, pupila chica (susto).
- Ojos de Crashsune (video 12): huecos transparentes en la cara + iris detrás, 100% al hueso del ojo; sí sobrevive al GLB. En NETO mover `DEF-eye.l/.r` con límites; ocultar pupilas con ojos cerrados.

- **Mejor opción (de los modelos de ejemplo de Crashsune, ver `crashsune-extra/modelos-ejemplo.md`)**: un **atlas de cara** 256² con celdas de 32 px dentro del GLB + **huesos de control de cara** con keys CONSTANT dentro de cada acción (sí sobreviven al GLB, a diferencia de las propiedades custom de NETO); three.js lee la posición del hueso y mueve `map.offset` (textura clonada por material).
- Cejas por encima del casco/pelo: en three.js `depthTest=false` + `renderOrder` alto.

## 4. Rig y exportación GLB (lo que hay que arreglar)
- **Chequeo automático antes de exportar** (checklist de Crashsune, `crashsune-extra/pdfs-crashsune.md`): transforms aplicados, duplicados (solo en accesorios), n-gons, normales, pesos ≈1, ≤4 influencias, modificadores Armature vacíos.
- Presupuesto ≤1024 tris: NETO 540 → ~480 para casco, botas, chaleco. Chaleco = duplicar torso + Separate + inflar (hereda pesos). Planos de una cara (ala del casco, mechones) → `doubleSided`.
- Acciones con `use_fake_user = True` o se pierden y no se exportan.
- Props (sierra, balde) se cuelgan en three.js con `handBone.add(prop)`; el `Child Of` de Blender no exporta.
- La jerarquía del GLB actual está rota: brazos, piernas, pelvis y ojos cuelgan de `rig`, no de la columna → **reparentar los `DEF-*` antes de exportar** (la pose no cambia).
- Limitar a **4 influencias por vértice** (`upper-body` llega a 6). Corregir el peso de `hair-general` en el brazo izquierdo.
- Materiales de cara: `alphaTest 0.5`, sin `transparent` (ya lo hace nuestro loader).
- GLTFLoader quita los puntos: `DEF-spine.006` → `DEF-spine006`.
- Blender 5.x: `action.fcurves` ya no existe; se accede por los slots de la acción.

## 5. Animación (biblioteca de acciones)
- Se anima en Blender **por script sobre los controles Rigify** (IK mantiene pies/manos fijos; `IK_FK` 0 = IK), se **hornea a los `DEF-*`** y cada acción sale como animación glTF con nombre (pistas NLA).
- En three.js: `AnimationMixer`; las poses de acción se reproducen una vez y el idle de respiración va **aditivo** encima.
- Reglas de timing (Crashsune): 30 fps, loops de 25 f con la pose del frame 1 pegada en el 26 y la intermedia en el 13; desfase de 3–4 f en rotaciones (overlap); *Make Cyclic* + handles automáticos; amplitud con S→Y; movimiento secundario en hombros, pecho, pelo; cambios de expresión en Constant.
- Acciones sinaboto a construir: sentarse en el piso, encender fuego, levantar sierra, verter agua, arrodillarse, brazos arriba (festejo), manos en la cintura, señalar, cargar objeto.
- Sensación "cutscene PS1": muestrear la animación a ~15 fps sobre 30 fps de video.
- **Caminata** (Crashsune, `crashsune-extra/walk-cycle.md`): 24 fps, ciclo de 24 f, pose cada 3 f: 1 contacto · 4 abajo · 7 paso · 10 arriba · 13–22 espejo (Ctrl+Shift+V) · 25 = 1. Piernas IK, brazos FK, inclinación constante del torso, cabeza 1 f tarde. Ya probada por script en una copia de NETO: `crashsune-extra/walk/neto_walk.py` → clip glTF `walk` 1,0 s a 0,72 m/s sin deslizar el pie.
- IK/FK en NETO (ver `crashsune-anim/modificadores-ik-fk.md`): `IK_FK` 0 = IK en `upper_arm_parent.X` / `thigh_parent.X`; sin pole activo (el codo se orienta rotando `upper_arm_ik`). Pies plantados y manos sobre objetos → IK; brazos que balancean → FK; herramienta a dos manos → una FK + otra IK. Snaps de Rigify funcionan por script si Blender abre con `-y`.
- Efectos procedurales en three.js (no en curvas de Blender): escalonado a 15 fps solo en el personaje, sacudida de cámara, temblor de herramienta, rebote de props, pelo con muelle, respiración modulada, pausa de impacto. Todos función del tiempo (deterministas).

## 6b. Cámara e iluminación (Crashsune parte 10–11 + posts; ver `crashsune-anim/camara-e-iluminacion.md`)
- FOV vertical por plano: establecimiento 30–40° · cuerpo entero 36–42° · cintura 30–36° · close-up de cara 20–28° (desde más lejos, aplana = más anime) · acción 60–75° muy cerca (máx. un plano corto). mm→fov: `fov = 2·atan(18/f)`.
- Movimiento lineal todo el plano, personaje crece 5–8%; la fórmula de cámara debe valer desde `lt = −0.15` (la disolvencia llama antes). Acción: snap-zoom de 6–9 frames.
- Corte: una cámara por plano; cada corte cambia ≥30° de ángulo o el tamaño; cortar sobre la palabra o la acción.
- Luz: hemisférica ~1.4 + key 1.2 a 45° frente-lado + **rim** detrás-arriba opuesta a cámara, color contrastado, 2–3× la key; el sombreado pintado de NETO hace de key/fill. Sin tone mapping. Sin DOF (niebla o lente larga). Bloom solo en planos puntuales, antes del paso de 15-bit.

## 6. Render (motor three.js, ya hecho)
- 360×640 → upscale nearest a 1080×1920, 15-bit + dither Bayer, scanlines, disolvencia pixelada entre planos (medido en sinaboto).
- **Agregar**: *vertex snapping* en el vertex shader (snap de `gl_Position` a la grilla de 360×640 → temblor PS1, también con la cámara en movimiento) y luz falsa por **vertex colors** en los escenarios.
- Sin AA, Standard (no AgX), sin bloom/AO/motion blur (Sunny + Crashsune coinciden).

## Orden de trabajo
1. Arreglar exportación (jerarquía DEF, 4 influencias, pesos del pelo) → GLB limpio.
2. Versión sinaboto: casco, recolor `color` (camisa azul marino, chaleco hi-vis con franjas, cargo caqui, botas), pelo castaño.
3. Sprites de expresiones nuevas + `setFace` en three.js.
4. Biblioteca de acciones (5–8 primeras) exportadas en el GLB.
5. Vertex snapping + texturas con paleta en el motor → rehacer la prueba de 10 s contra la ref.
