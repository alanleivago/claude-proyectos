---
type: reference
status: active
tags: [crashsune, low-poly, anime, uv, project-from-view, mirror-modifier, flat-shading, cel-shading, hair-shadows, texel-density]
relatedTo: [crashsune-low-poly-series]
---

# Crashsune 08 — UV unwrapping de Love-chan completo (63 min)

Visto completo: transcript (reconstruido del .vtt), 16 hojas de contactos y ~34 frames extra (`playlist/08/extra/`). Pantalla: a la izquierda otra ventana de Blender (4.1 Goo Engine) con el **modelo final de referencia**; a la derecha su archivo de trabajo (Blender 4.2), workspace UV Editing.

**Método único de todo el video:** por cada pieza → asignar el material `Lovechan_Body` (emisión + textura 1024×512 del video 07) → seleccionar caras → orientar la vista (Numpad 1/3/7 o la que mire la cara de frente) → **U → Project from View** → en el UV Editor **A, G, S, R** (y S X −1 para espejar) hasta que la isla caiga sobre lo pintado. Las caras que son de **un solo color** se tiran a cualquier zona plana de ese color (deformación irrelevante). La textura ya existía antes que los UV (ella lo reconoce como error).

## Capítulos
| t | tema |
|---|---|
| 0:25 | Referencia: modelo final + reglas generales |
| 5:02 | Pies (zapatillas) |
| 15:38 | Piernas (+ truco de la rodilla) |
| 18:44 | Manos |
| 23:50 | Brazos (sombra en 3 tonos) |
| 31:44 | Torso (+ cuello del suéter con inset/extrude) |
| 40:28 | Cuello |
| 41:10 | Cintura/short (+ asimetría aplicando el mirror) |
| 51:26 | Pelo (+ truco de sombra rotada) |
| 58:40 | Arreglar proporciones contra el turnaround |
| 1:01:27 | Ajustes finales del pelo |
| 1:02:52 | Revisión final |

## Pasos en orden

### 0:25–5:00 · Reglas generales
- **Mirror modifier**: todo lo espejado (pies, brazos, manos, piernas) se mapea **una sola mitad**; la otra mitad hereda los mismos UV (quedan superpuestos sobre los mismos píxeles). Para trabajar cómodo apaga la visualización del modifier (icono monitor, o el botón "Edit Mode" del modifier) — no lo borra. Settings visibles del mirror: Axis X, Bisect, **Clipping on**, **Merge 0.001 m**.
- 1:45 **Overlap**: corrige el video 07 — UVs superpuestos pueden romper el **horneado de lightmaps** en Unreal/Unity; en Blender (y en nuestro three.js sin lightmaps) no importa.
- 2:50 La textura de Love-chan es "muy imperfecta": la hizo **antes** de los UV. En el modelo posterior (Suzy, la bruja, 1024×512) empaquetó mejor: **el pelo ocupa mucho menos** y **la cara mucho más (~10–15 % del mapa)**. Lección: **UV primero, textura después**, y darle más píxeles a lo que se mira (cara, pelo) y menos a pies/suelas.

### 5:02–15:38 · Pies
1. Clic en el pie → Tab. Activa *Screencast Keys* (add-on para mostrar teclas). Apaga el mirror en edit mode.
2. Viewport en **Rendered** (Z → Rendered); asignar material `Lovechan_Body` (pestaña Material → elegir el existente). El material solo se ve en Rendered.
3. Seleccionar las **3 caras del lateral** de la zapatilla → U → **Project from View** → A, G, S sobre el dibujo lateral de la zapatilla (panel gris-azulado con line-art).
4. 7:00 Nota: **Unwrap / Smart UV Project** son mejores para superficies curvas; para low-poly plano, Project from View sirve el 90 % de las veces.
5. 7:35 **Shift+Alt+Z** = ocultar overlays para juzgar el resultado limpio.
6. 8:00 Lateral opuesto: Project from View, la isla sale invertida → **S X −1** (panel *Resize*: Scale X = −1.000) y alinear.
7. 8:50 Talón → una zona "nebulosa" de un solo color. 9:20 **Suela → píxeles negros.** 9:50 Parte de arriba → color sólido.
8. 10:00 **La perspectiva importa**: Project from View es una "foto" desde la cámara del viewport. Si proyectas en ángulo fuerte → distorsión. Siempre proyectar con la vista **perpendicular a la cara**.
9. 11:00 Frente: vista frontal → proyectar. Las caras inclinadas ~30° respecto a la vista salen estiradas/pixeladas → en el UV Editor modo **vértice (tecla 1)**, deslizar vértices con **G X / G Y** para reducir la distorsión (se ve en vivo cómo baja el pixelado). UV Editor también tiene 1/2/3 = vértice/arista/cara.
10. 14:00 Orbitar para revisar **costuras** (seams) y alinear islas vecinas moviendo/escalando (G Y).
11. 14:30 "No ser perfeccionista con los pies" — invertir tiempo en cara, pelo y puntos focales.

### 15:38–18:44 · Piernas (truco de la rodilla)
1. Apagar edit-mode del mirror; material nuevo→`Lovechan_Body`; vista frontal; **Project from View** → mover la isla a la **tira larga celeste** de la pierna (tiene un círculo azul = rodilla).
2. 16:50 Problema: la rodilla pintada no coincide con ninguna cara. Solución: **añadir geometría para el UV** — 2 *loop cuts* (Ctrl+R) justo arriba y abajo de la rodilla, seleccionar (modo cara, 3) la banda de caras nueva y **moverla en el UV** sobre el círculo de la rodilla. Además esos loops **ayudan al rig** (doblar la rodilla).

### 18:44–23:50 · Manos
- Seleccionar 2 caras → Project from View → mover sobre la mano pintada; estaba espejada → **S X −1**; rotar (R) para encajar; a veces **S Y −1**.
- Caras planas (dorso, laterales) → zona de color sólido de la piel. Evitar solapes innecesarios ("se pueden quitar al final").
- 21:00–23:30 Ajustes vértice por vértice (1 → box select → G). "Zoom out: ¿quién lo notaría?".

### 23:50–31:44 · Brazos (sombreado en 3 tonos)
- La textura tiene un **muestrario de 3 rojos: claro / profundo / sombra muy profunda**. El "sombreado" del brazo se hace **mandando cada cara al tono según hacia dónde mira**:
  - caras de arriba/frontales → rojo claro,
  - caras de abajo → sombra media,
  - caras inferiores escondidas → sombra profunda.
  Proceso: seleccionar el grupo → U → Project from View → S (achicar) → G dentro del swatch.
- 26:50 Puños con textura de **elástico acanalado** (rayas rojas verticales): front+back faces proyectados juntos, **misma escala (densidad de texel) para todas las islas** ("que no se vea una más pixelada que la otra"), G X para mover bloqueado en X.
- 28:50 Caras superiores del brazo → la **gran flecha blanca** pintada (rotar la isla 90°/180°, S Y para estirar).
- 30:00 **Numpad /** = vista local (aislar el objeto). "Lo hago a ojo; hay manera matemática pero no me importa."
- 31:00 Un tramo del brazo más sombreado que el resto → mover sus UV al tono más oscuro.

### 31:44–40:28 · Torso
- Frente del suéter → tono medio, luego zona "highlight" (celeste/blanco) y "zona azul de sombra". Caras de color plano pueden proyectarse "mal" sin consecuencia.
- Panza (front+back) → Project from View; lados → **zona en degradé escalonado** (no gradiente suave, bandas).
- Espalda: las líneas del suéter también deben seguir.
- **39:00 Cuello del suéter (modelado durante el UV):** Tab, aislar (/), seleccionar las 3 caras de arriba → **E** y confirmar con clic (rótulo en pantalla: "Press E AND left click to confirm, THEN press S to scale") → **S** para meterlas → seleccionar los 2 vértices centrales → **N** → Global **X = 0** (quedan sobre el plano del mirror) → caras (3) → Project from View → zona sombreada → modo arista (2), seleccionar el borde interior → **E** y bajar en Z → hueco del cuello con profundidad.

### 40:28 · Cuello
- Material, A, Project from View → al **mismo color de la sombra de la mandíbula** (cuello = sombra de la cara).

### 41:10–51:26 · Cintura / short (asimetría)
1. Aislar, material, caras de frente → Project from View → sobre el short pintado; derecha (Numpad 3) → lateral.
2. Ajuste fino: modo vértice, box select, **G Y / G Z** para alinear las líneas del cinturón. Ella muestra "pixelación rara" porque la textura se pintó antes que los UV.
3. Arriba → zona azul; abajo → sombra.
4. **49:00 Asimetría:** el short pintado no es simétrico (las líneas del cinturón difieren de lado a lado). Flujo recomendado: **hacer los UV en espejo primero**, luego **aplicar el Mirror** (Object Mode → modifier → Apply), vista frontal, box-select una mitad → **S X −1** → **G X** para mover esa mitad sobre la otra mitad de la textura. Igual atrás (trasero). Ajustar vértices sueltos. Así la mitad de textura que se desperdiciaba se usa.

### 51:26–58:36 · Pelo
1. Aislar (/). **Separar la cara del pelo**: Tab, seleccionar caras de la cara y de debajo de la mandíbula (en Solid para verlas), **P → Selection**. Ocultar la cara con **H**.
2. Todo el pelo: A → **U → Unwrap** (rápido y feo) → G, S → meterlo en el **rosa base** (arriba-derecha de la zona del pelo). "Así al menos el color base está bien."
3. Caras frontales (flequillo) → **Project from View** → sobre la **banda de brillos** (astillas blancas sobre rosa); S X para ensanchar, G Z para bajar.
4. **Sombras:** seleccionar por bloques las caras de atrás/debajo → Project from View → mover a la **zona de sombra** (rosa fuerte). Mismo en el otro lado.
5. **Truco de sombra rotada (56:30):** para que una sola cara (triángulo) tenga media sombra en diagonal: Project from View de esa cara → G y **R** en el UV para dejarla **cruzando el borde recto de una mancha de sombra pintada** → la cara queda partida en dos tonos con un corte diagonal limpio. "Un truco que solo funciona con flat shading." Lo repite en varias caras de las mechas.
6. 58:00 Alt+H muestra todo lo oculto.

### 58:40–1:01:27 · Proporciones contra el turnaround
- Alt+H para mostrar la imagen de referencia, vista frontal, **Alt+Z** (X-ray) alternando para comparar.
- Ojos demasiado juntos/pequeños → **no se toca la malla, se escala el UV de la cara** (S Z / S X, G Z) para que el dibujo de los ojos se mueva/agrande. Las 2 caras laterales planas no importan.
- Mover vértices del pelo para que suba; mirar también de lado. "La referencia es solo referencia: algo alineado perfecto puede verse raro en 3D."

### 1:01:27 · Final del pelo
- Más caras con el truco de sombra rotada. Auto-crítica: la gran zona rosa del pelo **desperdicia espacio**; debería haber usado un muestrario chico como en el resto.

## Atajos usados
U (menú UV) · Project from View · Unwrap · Smart UV Project · A/G/S/R · S X −1 (espejo) · G X/G Y (eje) · 1/2/3 (vértice/arista/cara, también en UV Editor) · Shift+Alt+Z (overlays) · Alt+Z (X-ray) · Z (pie menu de shading) · Numpad 1/3/7 · Numpad / (vista local) · Ctrl+R (loop cut) · E (extrude) · N (panel, coordenadas Global) · P → Selection (separar) · H / Alt+H.

## Cómo hacerlo por script (bpy + numpy + PIL)

**1. Project from View sin viewport** (para `blender -b`): proyectar vértices sobre el plano de la vista y encajar en un rectángulo de la textura.
```python
import bmesh, numpy as np, mathutils
VIEWS = {"front": (0,2), "back": (0,2), "right": (1,2), "top": (0,1)}   # back y left: flip_x=True
def project_faces(bm, faces, uvl, axes, rect, flip_x=False):
    pts = np.array([[l.vert.co[axes[0]], l.vert.co[axes[1]]] for f in faces for l in f.loops])
    mn, ext = pts.min(0), (pts.max(0)-pts.min(0)).max()           # escala uniforme = sin distorsión
    for f in faces:
        for l in f.loops:
            t = (np.array([l.vert.co[axes[0]], l.vert.co[axes[1]]]) - mn) / ext
            if flip_x: t[0] = 1 - t[0]                               # = S X -1
            l[uvl].uv = (rect[0] + t[0]*(rect[2]-rect[0]), rect[1] + t[1]*(rect[3]-rect[1]))
```
Para vistas arbitrarias (cara inclinada): usar la normal media de las caras como dirección de vista y una base ortonormal (`n.to_track_quat('Z','Y').to_matrix()`), así se evita la distorsión de "proyectar en ángulo" que ella corrige a mano.

**2. "Tirar caras a un swatch"** (el 80 % del video):
```python
def to_swatch(faces, uvl, cx, cy, r=0.002):      # r>0 deja una mini-isla en vez de un punto
    for f in faces:
        c = f.calc_center_median()
        for l in f.loops:
            d = (l.vert.co - c); l[uvl].uv = (cx + d.x*r, cy + d.z*r)
```
**3. Elegir el tono por orientación** (su sombreado de 3 rojos, automático): `dot(face.normal, LIGHT)` → umbrales → swatch claro/medio/profundo. Caras con normal hacia abajo (`n.z < -0.5`) → sombra profunda.

**4. Truco de sombra rotada** sin rotar UV a mano: pintar en la textura un medio-plano de dos tonos (línea recta) y para cada cara elegida colocar su UV de modo que la línea la corte en el ángulo deseado; o directamente, como pintamos por script, rasterizar ese triángulo con una línea de corte calculada en 3D (ver 6).

**5. Asimetría**: `bpy.ops.object.modifier_apply(modifier="Mirror")`, luego seleccionar loops con `vert.co.x < 0` y `uv.x = 2*cx - uv.x` + desplazamiento a la otra mitad.

**6. Pintar en 3D desde el UV (reemplaza el pintado a mano de rayas, rodilleras, cinturón…):** para cada triángulo UV, rasterizar sus píxeles y por baricéntricas obtener la **posición 3D** (y normal) de cada píxel. Con eso, reglas como "franja reflectante si 1.05 < z < 1.10 en el torso" pintan rayas **continuas a través de las costuras** sin mover UV.
```python
from PIL import Image; import numpy as np
W=H=256; pos = np.zeros((H,W,3)); nrm = np.zeros((H,W,3)); lab = np.zeros((H,W),int)-1
for tri in mesh.loop_triangles:
    uv = np.array([uvdata[i].uv for i in tri.loops])*[W,H]
    P  = np.array([mesh.vertices[v].co for v in tri.vertices])
    # bbox + baricéntricas (numpy) -> para cada pixel dentro: pos = w@P, lab = region_of(tri)
```
Con `pos`, `nrm` y `lab` (región por vertex group del rig) se arma cualquier capa en PIL: color base por región, cel-shade por `nrm·L`, bandas por `pos.z`, líneas negras finas en los bordes de región (`lab != lab desplazado 1px`).

**7. Revisar distorsión** (lo que ella mira a ojo): ratio área-UV/área-3D por cara (`f.calc_area()` vs área del polígono UV); marcar las caras con densidad muy distinta a la mediana. O exportar el layout: `bpy.ops.uv.export_layout(filepath="uv.png", size=(256,256), opacity=0)` y superponerlo con PIL.

**8. Comparar con el turnaround** (Alt+Z): render ortográfico frontal del modelo + `Image.blend` con la referencia IA al 50 %, guardado como PNG para revisar.

Pasos que de verdad son "a mano" en el video: el **pintado del dibujo** (line-art de zapatillas, short, cara, mechas). Alternativa scriptada: generar con IA la pieza aislada (de frente, flat, sin sombras de luz), recortarla al bbox de su isla UV, `resize(NEAREST)` a los píxeles reales de la isla y `quantize` a la paleta del personaje.

## Descargas / links / add-ons
- **Screencast Keys** (add-on, muestra teclas en pantalla) — solo para grabar tutoriales, no lo necesitamos.
- Goo Engine (fork de Blender para anime/NPR, lo usa en la ventana de referencia) — no necesario.
- Texturas Love-chan gratis (Patreon free): https://www.patreon.com/posts/low-poly-love-109722076 — sirven para estudiar layout y paleta.
- Modelo final Love-chan + bruja Suzy con UV y rig: solo en el Gumroad/curso de pago.
- Turnaround: https://www.patreon.com/posts/108245592

## Para nuestro proyecto (NETO512 → chica de @sinaboto)
NETO512 ya tiene UV hechos por evanciao (con las buenas prácticas que Crashsune admite no haber seguido: UV antes que textura, más espacio a la cara, bordes rectos al grid de píxeles). **No re-hacemos UV**; usamos estas técnicas para repintar y para lo poco que haya que añadir:

1. **Inventario de islas**: script que rasteriza los `loop_triangles` del mesh en 256×256 y produce `label.png` (región por vertex group Rigify: `DEF-spine*`→chaleco/camisa, `DEF-upper_arm*/forearm*`→manga azul marino, `DEF-hand*`→piel/guantes, `DEF-thigh*/shin*`→pantalón caqui, `DEF-foot*/toe*`→botas tostadas, caras del pelo→castaño) + `pos.png`/`nrm.png` (posición y normal 3D por píxel). Es el equivalente scriptado de "mirar qué isla cae dónde" que ella hace con dos ventanas.
2. **Repintado sobre los valores de NETO**: color plano por región (capa *color* nueva) en blend Color sobre la capa de valores → se conserva su sombreado; o, si queremos el look Crashsune más duro, **cuantizar la luminancia a 3 tonos** por material (amarillo hi-vis: #E8F000/#C9C800/#8C8A00; azul marino: #2B3A67/#1F2A4D/#141B33; caqui: #C8B48A/#A8936A/#7A6948; botas: #B98A55/#946A3D/#654626; pelo castaño: #7A4B2A/#5C361C/#3E2312 — a afinar contra la ref de sinaboto).
3. **Franjas reflectantes del chaleco**: regla por `pos.z` (2 bandas horizontales a la altura del pecho/abdomen) + 2 verticales por `|pos.x|` cerca de los hombros, solo en `label==torso` y solo donde va el chaleco (el chaleco = torso salvo las mangas; el azul marino asoma en mangas y cuello). Gris plateado claro con 1 píxel más oscuro de borde. Continuas en las costuras gracias a `pos`.
4. **Rodilleras**: el truco de la rodilla de Crashsune al revés — en vez de mover UV, pintar un rectángulo/óvalo gris oscuro donde `pos` cae en la altura de la rodilla y `nrm.y` mira al frente. Si la rodilla de NETO no tiene suficientes píxeles, **escalar esa isla UV** (como sus "caderas") o añadir un loop cut (que también mejora el doblez del rig).
5. **Casco**: NETO no lo tiene → modelar 1 objeto low-poly (~30–60 tris), pesarlo al hueso `DEF-spine.006`/head, y **mandar sus caras a swatches** (amarillo claro/medio/sombra según normal) en un rincón libre 8×8 de la textura de 256 — el truco de "caras planas a un color" sin gastar espacio. Ala del casco con sombra profunda debajo.
6. **Asimetría** (bolsillo cargo solo en un lado, logo en el chaleco, cremallera): si los UV de NETO son espejados/superpuestos, aplicar el mirror y voltear media isla (S X −1 por script) como en el short de Love-chan; si no, pintar por `pos.x` directamente.
7. **Sombras de pelo anime**: con `nrm` y `pos` se puede imitar el truco de la sombra rotada: pintar la mecha con un corte diagonal duro (medio-plano en 3D) entre castaño y castaño oscuro, + astillas de brillo en la banda frontal del flequillo (como la banda de brillos de Love-chan).
8. **Cara**: queda en los sprites 32×32 de NETO; si los ojos quedan mal ubicados, hacer como ella en 59:00: **mover/escalar el UV del plano de la cara** en vez de tocar la malla.
9. **Referencia IA + comparación**: generar el turnaround coloreado de la chica de sinaboto (frente/perfil, T-pose, flat colors), y por script superponerlo a un render ortográfico del GLB (equivalente a su Alt+Z) para validar proporciones y colores antes de pasar a three.js.
10. **Pipeline final**: PNG 256 → `export_neto.py` (Closest) → GLB → three.js con `NearestFilter` y sin mipmaps. Sin lightmaps → los solapes UV de NETO no son problema.
