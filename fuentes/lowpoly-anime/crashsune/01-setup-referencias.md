---
type: reference
status: active
tags: [blender, low-poly, anime, ps1, crashsune, setup, referencias, rigify, color-management]
relatedTo: [crashsune-low-poly-series]
---

# Crashsune 01 — Setup de escena + referencias 2D (Love-chan)

"Blender Low Poly Character Modeling Tutorial - Part 1" · 14:00 · https://www.youtube.com/watch?v=Use9T2IX1XE (17-07-2024)
Visto completo: transcript + 4 hojas de frames + frames extra (2:20 render, 6:05 Patreon, 10:40 panel del Empty, 13:20 escena final).
Blender usado: 4.0 (casi todo), el cierre en 4.2 (EEVEE Next). Recomienda 4.0+ porque más adelante usa Geometry Nodes.

## Qué es la serie
- Personaje "Love-chan", anime low poly estilo PS1 / **Mega Man Legends** (lo dice en el video 03). Modelado, UV, textura y rig desde cero, **sin add-ons pagos**.
- Usa **Rigify** (gratis, incluido) para el rig más adelante; en este video solo para escala.
- El personaje final (thumbnail): chaqueta corta roja, top blanco, short azul, cara con ojos grandes pintados, pelo rosa en mechas planas.

## Pasos con tiempos

| t | Paso | Valores |
|---|---|---|
| 1:46 | Render Properties → **Render Engine = EEVEE** (no Cycles: es ray tracing, no es el look) | — |
| 2:20 | Desactivar Ambient Occlusion, Bloom, Screen Space Reflections, Motion Blur (en 4.0 vienen apagados salvo revisar) | todos off |
| 2:44 | **Color Management → View Transform = Standard** (NO AgX/Filmic). "Lo más importante": AgX es para fotorrealismo, desatura y corre tonos; Standard = 1:1 como un motor de juego, la textura pintada fuera se ve igual en Blender | Look: None, Exposure 0, Gamma 1 (visto a 13:20) |
| 3:15 | Borrar el cubo por defecto (opcional) | — |
| 3:42 | File → Save As en carpeta propia (ideal sincronizada a OneDrive/Dropbox): `LowPolyCharacter.blend` | — |
| 4:25 | **Ctrl+Alt+S = Save Incremental** → `LowPolyCharacter1.blend`, `2`, … ; guardar una versión por video terminado | — |
| 5:21 | Descargar referencias: Patreon post 108245592 → `LowPoly_Love-Chan_Resources.zip` (gratis con cuenta free). También en Ko-fi | — |
| 6:38 | Extraer; usa solo `Lovechan-frontview.png` y `Lovechan-sideview.png` | — |
| 7:06 | Shift+A → **Image → Reference** (dos veces: side y front) | se crean como Empty tipo Image |
| 8:00 | Edit → Preferences → Add-ons → buscar "rigify" → activar | — |
| 8:16 | Shift+A → Armature → **Human (Meta-Rig)** — no se usa todavía, es **referencia de escala humana** | metarig ≈ 1.8–1.9 m |
| 9:00 | Seleccionar las dos referencias, vista frontal (clic en Y del gizmo / Numpad 1, ortográfica) | — |
| 9:20 | **Alt+G, Alt+R, Alt+S** (reset loc/rot/escala) → **R X 90** | ambas quedan verticales en plano XZ |
| 9:50 | G Z / S para escalar hasta que la altura coincida con el metarig | Empty Size ≈ 5 m (panel a 10:40) |
| 10:20 | Object Data (Empty) → **Opacity ✔ = 0.5** en cada referencia | Depth: Default; Show in: Orthographic ✔ Perspective ✔ |
| 10:30 | G Z hasta que **la suela toque la línea roja (eje X, suelo)**; G X para centrar el cuerpo en el eje Z azul | — |
| 11:31 | Referencia lateral: **R Z 90**, luego G X para separarla (que no se superponga con la frontal); G Y para alinear el pie y la coronilla con el metarig | — |
| 12:38 | Comprobar en vista lateral: pie y tope de la cabeza alineados con el metarig. "No tiene que ser perfecto" | — |

Atajos repasados: Shift+A (Add), Ctrl+S, Ctrl+Alt+S, Alt+Z (x-ray, en el 02), clic en ejes del gizmo = vista ortográfica.

## La hoja de referencia (lo más valioso del video)
La lámina del Patreon no es un dibujo normal: es un **turnaround ya "low poly"** con cada pieza en un color plano y numerada (frame 6:05):
1 HAIR (azul violeta) · 2 FACE (cian) · 3 NECK (verde) · 4 TORSO (amarillo, chaleco con capucha) · 5 ARMS (magenta) · 6 HANDS (azul) · 7 WAIST (rojo, short) · 8 LEGS (celeste) · 9 FEET (verde).
- Front y side están dibujados con siluetas de polígonos rectos (las aristas del dibujo ≈ las aristas del modelo), en **A-pose** (brazos ~45° abajo).
- Cada color = un objeto separado en 3D (en los videos 02-03 cada parte es su propio mesh: Cube, Cube.001…). Así se modela pieza por pieza contra su mancha de color.
- Hay un pie/zapato con líneas de diseño dibujadas que luego van a la textura, no a la geometría.

## Por qué así (decisiones)
- **Standard view transform**: el estilo es textura pintada a mano sin luz realista; cualquier tone mapping altera los colores pintados.
- **EEVEE sin efectos**: el look PS1 no quiere AO/bloom/SSR; todo el "sombreado" estará pintado.
- **Metarig como escala**: el personaje queda en metros reales → luego Rigify encaja sin reescalar.
- **Opacidad 0.5 + x-ray**: para ver malla y dibujo a la vez al calcar.

## Cómo hacerlo por script (bpy, Blender vivo vía MCP)
Todo este video es 100 % scripteable:

```python
import bpy, math
sc = bpy.context.scene
# motor: el identificador cambia por versión (4.0/5.x 'BLENDER_EEVEE', 4.2-4.4 'BLENDER_EEVEE_NEXT')
for eng in ('BLENDER_EEVEE_NEXT', 'BLENDER_EEVEE'):
    try: sc.render.engine = eng; break
    except TypeError: pass
sc.view_settings.view_transform = 'Standard'
sc.view_settings.look = 'None'
sc.view_settings.exposure = 0; sc.view_settings.gamma = 1
# (en 4.0: sc.eevee.use_gtao / use_bloom / use_ssr / use_motion_blur = False si existen)
for a in ('use_gtao', 'use_bloom', 'use_ssr', 'use_motion_blur'):
    if hasattr(sc.eevee, a): setattr(sc.eevee, a, False)

def ref(path, name, rot_z, loc, size):
    e = bpy.data.objects.new(name, None)
    e.empty_display_type = 'IMAGE'
    e.data = bpy.data.images.load(path, check_existing=True)
    e.empty_display_size = size          # ancho de la imagen en metros
    e.empty_image_offset = (-0.5, 0.0)   # y=0 → el borde inferior de la imagen queda en el origen (pies en el suelo si la imagen no tiene margen)
    e.use_empty_image_alpha = True; e.color[3] = 0.5   # Opacity 0.5
    e.show_empty_image_orthographic = True; e.show_empty_image_perspective = True
    e.rotation_euler = (math.radians(90), 0, rot_z)
    e.location = loc
    bpy.context.collection.objects.link(e)
    return e

ref(r"...\front.png", "REF_front", 0, (0, 0.5, 0), 2.0)                # plano XZ, detrás del modelo
ref(r"...\side.png",  "REF_side",  math.radians(90), (-0.5, 0, 0), 2.0) # plano YZ
# metarig de escala
import addon_utils; addon_utils.enable("rigify", default_set=True)
bpy.ops.object.armature_human_metarig_add()
# guardado incremental
bpy.ops.wm.save_mainfile(filepath=r"...\personaje_003.blend")   # o bpy.ops.wm.save_as_mainfile(copy=True, ...)
```
- Alinear "a ojo" (pies al suelo, coronilla a la cabeza del metarig) se reemplaza por **medir píxeles**: con PIL buscar la primera/última fila no blanca de la imagen → altura del personaje en px → `size = alto_real_m * ancho_px / alto_px_personaje`, y offset para que la fila de la suela caiga en z=0. Así queda exacto sin mirar.
- Para comprobar: `mcp look` con la vista frontal ortográfica.

## Descargas / links
- **Referencias Love-chan (gratis)**: https://www.patreon.com/posts/108245592 → `LowPoly_Love-Chan_Resources.zip` (requiere login gratuito en Patreon; no se puede bajar por script sin sesión). Trae front + side view y otros archivos. Útil como **ejemplo de lámina de referencia por colores**, no para nuestro personaje.
- Curso Gumroad (pago): https://crashsune.gumroad.com/l/LowPolyCourse — incluye el .blend final rigeado y una **plantilla "low poly base turnaround"** para dibujar personajes propios encima.
- Freebies: https://www.crashsune.com/blender-freebies · Playlist: https://www.youtube.com/playlist?list=PLcaQc6eQjXCxWXmn5jxE_GTOft9ZxChu1
- Add-on mostrado (solo para grabar): Screencast Keys. Rigify (incluido en Blender).

## Para nuestro proyecto (NETO512 → chica @sinaboto)
- **View Transform = Standard en la escena de Blender** donde pintamos/revisamos la textura 256x256: si está en AgX, lo que vemos al pintar con Ucupaint no coincide con lo que renderiza three.js (que no hace tone mapping). En three.js: `renderer.outputColorSpace = SRGBColorSpace`, `toneMapping = NoToneMapping`, y la textura del GLB en sRGB.
- **Lámina de colores por piezas**: hacer nosotros una lámina front/side de la chica sinaboto con manchas planas por pieza (casco amarillo, chaleco naranja/lima reflectivo, pantalón caqui, botas marrones, piel, pelo). Sirve para (a) calcar el modelado y (b) **medir anchos/alturas automáticamente por máscara de color** con PIL en vez de "a ojo" — ideal porque trabajamos solo por script.
- NETO512 ya viene en escala real y con Rigify: poner el metarig no hace falta; usar el propio NETO como referencia de escala para las piezas nuevas (casco, chaleco, botas).
- Guardar incremental (`_001.blend`, `_002.blend`) antes de cada cambio grande por script: un script de bmesh malo no tiene Ctrl+Z fiable vía MCP.
