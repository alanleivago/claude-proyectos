---
type: reference
status: active
tags: [blender, crashsune, low-poly, troubleshooting, rigging, weight-paint, color-management, normales, fake-user, checklist]
relatedTo: [crashsune-low-poly-series, GUIA-personaje-ps1]
---

# Crashsune: "Learn Blender in 2026 - Stop wasting time! Watch this FIRST" (30 min)

Video de solución de problemas para principiantes: 10 problemas comunes de Blender (80 % de los casos, según ella) + consejos de su Discord. Blender usado en pantalla: **4.5.2 LTS**. Ejemplos con sus modelos low poly anime (Teto "Birdbrain" con emisión, bruja, Astolfo, chica ratón). Material: `video/transcript.txt`, `video/frames/`.

## Los 10 problemas y su arreglo

### 1. Caras solapadas, vértices duplicados y n-gons (1:54)
- Síntomas: artefactos, malla que no se une al rig, sombreado sucio. Las caras apiladas producen **z-fighting** (parpadeo).
- Arreglo: todos los objetos seleccionados → Edit Mode → `A` → `M` → **Merge by Distance** (ajustar distancia si hace falta).
- Prevención: inspeccionar en **wireframe** (`Z` → Wireframe) y con **X-ray**. Cuidado con `E` (extrude): aunque no muevas el mouse, crea geometría duplicada.
- Topología: **quads** como regla general; **tris están bien en low poly** que no se subdivide, y conviene ponerlos a propósito en **rodillas y codos** para que doblen mejor. Los **n-gons** (más de 4 lados) se evitan en el modelo final: dan problemas al riggear y con modificadores.
- Encontrar n-gons (4:05): Edit Mode, selección de caras → Select → **Select All by Trait → Faces by Sides**: Number of Vertices = 4, Type = **Greater Than**, **Extend desmarcado**. Si no se selecciona nada, no hay n-gons. (En la checklist: deseleccionar todo antes con `Alt+A`.)

### 2. Aplicar transformaciones (4:25)
- Mover/rotar/escalar en Object Mode rompe rigging, exportación y modificadores (sobre todo **Mirror**, que no refleja desde el centro).
- Modelar transformando en **Edit Mode**; antes de modificadores o rig: Object Mode, todo seleccionado → `Ctrl+A` → **All Transforms**. Verificar en el panel `N` (pestaña Transform) que quedó loc 0 / rot 0 / escala 1.

### 3. Geometría oculta y caras traseras (5:40)
- Partes que "desaparecen": se apretó `H` (hide) sin querer (está al lado de `G`). `Alt+H` muestra todo; en Edit Mode se ocultan vértices/aristas/caras por separado de los objetos. Revisar también los ojos cerrados del Outliner.
- **Face Orientation** (Viewport Overlays): en Blender nuevo las caras traseras se ven **rojas** y las frontales con su color normal (antes las frontales eran azules) (6:40).
- **Backface culling** es una opción del **material**: oculta la cara trasera (rendimiento, menos ruido visual). Si la normal está al revés, la cara desaparece desde ese ángulo.
- **Solidify** usa la orientación de las caras para saber hacia dónde engrosar; algunas operaciones de rigging también dependen de ella.
- Voltear una cara: `Alt+N` → Flip. Para no apretar `H`: remapear Hide a `Shift+H` en el Keymap.

### 4. Edición proporcional (7:34)
- Malla que se mueve "como gelatina": está activada con `O`. Se apaga con `O` o el icono de círculo azul; el radio se ajusta con la rueda.

### 5. Snapping (8:05)
- Objetos que saltan a la grilla o a otra geometría: `Shift+Tab` activó el snapping (icono del imán). `Ctrl+Shift+Tab` abre sus opciones.

### 6. Colecciones ocultas (8:34)
- Teclas `1`–`9` en Object Mode ocultan colecciones. Deshacer con `Ctrl+Z` o el ojo del Outliner. Ella desasigna esos atajos en el Keymap.

### 7. Guardar escenas y Fake Users (9:22)
- Si Blender se cae: **File → Recover → Auto Save**, o los `.blend1` / `.blend2` junto al archivo (renombrar a `.blend`).
- **Fake User** (icono de escudo, aparece una `F` delante del nombre): guarda un data-block aunque no tenga usuarios. Blender a veces borra al guardar las **acciones, texturas o node groups** que cree sin usar. Marcar el escudo en cada animación/textura nueva (en pantalla, en el Action Editor sobre `CubeAction`).
- **Guardado incremental**: `Ctrl+Alt+S` (archivo_001, _002…); en la checklist: cada 15 min. `Ctrl+S` cada 1–2 min.
- Guardar en una carpeta sincronizada (Google Drive, OneDrive, Dropbox) para recuperar versiones anteriores; ella guarda los cursos en `G:\GoogleDrive\...`.

### 8. Color Management, normales y archivo de inicio (12:09). Lo más útil para estilizado
- Solo para estilos no fotorrealistas: si la textura se ve bien sola pero mal en el modelo:
  - Render → Color Management → View Transform = **Standard** (opciones: Standard, Khronos PBR Neutral, AgX, Filmic, Filmic Log, False Color, Raw). Así el color de la textura coincide con el de Blender.
  - Material con shader **Emission** (Strength 1) con la textura como color: **Surface = Emission** (en pantalla, `Teto_Head_Mat` con `Teto_HeadTexture.psd`).
  - **Eevee**, sin **ray tracing**, sin **sombras**, y en el viewport/render **Scene Lights y Scene World desactivados** (13:00, menú Viewport Shading). Resultado: color y brillo de la textura **1:1** en el modelo.
- Si el estilo sí usa luces y sombras, entender las **normales**: Overlays (en Edit Mode) → Normals, con tamaño ajustable. Base para mapas de normales y para el modificador **Data Transfer** (normales personalizadas).
- `Shift+N` recalcula normales (todo seleccionado).
- **File → Defaults → Save Startup File**: guardar motor, color management, shader por defecto, sin cubo/cámara/luz, distribución de paneles y Auto Normalize activado.

### 9. Errores de rigging y weight painting (14:51)
- Modelo que no se riggea (error de "bone heat weighting"): antes de emparentar al rig, **(1) `Ctrl+A` All Transforms, (2) Merge by Distance, (3) `Shift+N` recalcular normales, (4) eliminar n-gons** (convertir a quads/tris). Luego emparentar.
- Partes que siguen al hueso equivocado (mover la mano y se mueve el pelo o el zapato): problema de pesos. Los **vertex groups** guardan cuánto influye cada hueso en cada vértice.
- **Truco**: Edit Mode, seleccionar un vértice → panel `N` → pestaña **Item → Vertex Weights**: lista **todos los grupos que influyen en ese vértice** con su valor, editable ahí mismo. Sirve para encontrar pesos erróneos (en pantalla: un vértice del cuello con `DEF-spine.004/005/006`).
- Su método: **Auto Normalize** activado, elegir el grupo problemático y rellenar con la herramienta **Gradient** al 50–100 % de opacidad. En partes simétricas (zapatos, manos), activar **simetría X** arriba del viewport antes de pintar.
- Auto Normalize impide que la suma de pesos pase de 1: dejarlo activo siempre (y guardarlo en el startup file).
- "Los problemas de pesado automático no se pueden evitar al 100 %, pero siempre se pueden limpiar a mano."

### 10. Tres herramientas (17:28)
- **F3 Search**: buscar cualquier operador por nombre; muestra su atajo. También busca nodos ("hue" → Hue/Saturation/Value…).
- **Quick Favorites**: clic derecho en cualquier acción → *Add to Quick Favorites*; `Q` abre el menú.
- **3D cursor, origen y orientaciones**: el cursor es donde aparecen objetos nuevos y sirve de referencia para snapping; el **origen** (punto naranja) es el pivote de rotación/escala, y si está mal las rotaciones salen raras → Object → Set Origin. `Shift+S` → *Cursor to Selected* / *Selection to Cursor*; posición exacta del cursor en `N` → View. Orientaciones: **Global** (fija), **Local** (gira con el objeto en Object Mode, no en Edit Mode), **Normal** (sigue la normal de la cara: útil para extruir o mover partes en ángulo).

## Checklist (21:29, pantalla para capturar)
**Prevenir desastres:** `Ctrl+Z` ante la duda · `Ctrl+S` cada minuto (idealmente en carpeta en la nube) · `Ctrl+Alt+S` incremental cada 15 min.
**Si fallan modificadores, exportación o herramientas:** Ctrl+A → All Transforms · todo en Edit Mode, `A`, `M` → Merge by Distance · revisar caras solapadas/vértices duplicados en X-ray · `Alt+H` en Edit y Object Mode · n-gons con Select All by Trait → Faces by Sides (Greater Than 4, sin Extend; antes `Alt+A`) · `Shift+N` recalcular normales.

## Consejos de su Discord (21:55–28:50)
1. **Tutoriales de calidad que expliquen el porqué**, sin acumular tutoriales antes de crear. No usar add-ons al principio (rigging, UV): aprender primero lo de Blender. Aprender lo básico (`G` `R` `S`, bloqueo de eje `X/Y/Z`) por repetición.
2. **Fundamentos**: dibujo, rigging y UV se aprenden; una cosa a la vez ("comerse el elefante de a un bocado").
3. **"If it works, it works"**: no obsesionarse con la forma "correcta"; tu primer modelo será el peor; evitar el burnout.
4. **Planificar antes de abrir Blender**: 5 min de notas o bocetos (thumbnails con notas en los márgenes) ahorran horas. **Estudiar modelos de profesionales** en **ArtStation, The Models Resource ("Model 3D Store" en el audio) y Sketchfab** para ver cómo construyen y texturizan. Hacer **proyectos**, no modelos sueltos; después de un tutorial, hacer algo parecido por tu cuenta.
- **#1024Challenge** (27:51): personaje low poly de **≤1024 triángulos**. Ejemplo en pantalla (Snailien de @Zobi_Draws): **1016 tris / 598 vértices, textura 1024×1024 con un atlas de expresiones de cara** (ojos y bocas en tiras), subido también a VRChat. También muestra su progreso de 2020 a 2021 y la hoja de modelo (frente/perfil) del curso.

## Links (descripción)
- Recursos gratis / concurso Low Poly Halloween 2026: https://www.crashsune.com/blender-freebies
- **PDF gratis que acompaña este video** (los mismos arreglos, con imágenes; pide email): https://tinyurl.com/5afper8m
- Curso low poly (Gumroad / Crashsune Academy, incluye guía de atajos "Hotkey Guide" PDF): https://www.crashsune.com/low-poly-course
- Patreon: https://www.patreon.com/Crashsune
- Playlist de la serie low poly (ya estudiada en `../crashsune/`): https://www.youtube.com/playlist?list=PLcaQc6eQjXCxWXmn5jxE_GTOft9ZxChu1
- Música: OST de VA-11 Hall-A (Garoad).

## Para nuestro proyecto

Casi todo el video es ayuda para quien usa la interfaz. Nosotros manejamos Blender por scripts vía MCP, así que lo útil es convertir sus arreglos en **comprobaciones automáticas** antes de riggear y exportar.

### Lo que mejora el plan (agregar a la GUIA)
1. **Fake user en todas las acciones** (punto 5 de la GUIA). Un script que crea varias acciones para la biblioteca debe poner `action.use_fake_user = True` en cada una. Si no, las que no están asignadas ni en una pista NLA se pierden al guardar o recargar, y el exportador glTF no las encuentra. Lo mismo con imágenes de sprites de cara generadas por script (`image.use_fake_user = True`, o empaquetarlas).
2. **Script de validación previo al rig/exportación** (`check_mesh.py`), por objeto, con bmesh. Es su checklist:
   - transformaciones aplicadas (`matrix_basis` = identidad; si no, `transform_apply` en los accesorios nuevos);
   - vértices duplicados: **contar primero** con `bmesh.ops.find_doubles` y mostrar cuántos hay; fusionar solo en las piezas nuevas (casco, botas, rodilleras). **No fusionar a ciegas en NETO**: es un asset terminado y puede tener vértices coincidentes a propósito;
   - n-gons (`len(f.verts) > 4`) → `bmesh.ops.triangulate` en esas caras (en low poly los tris están bien);
   - normales: `bmesh.ops.recalc_face_normals` en las piezas nuevas y reportar caras hacia adentro;
   - pesos: suma por vértice ≈ 1 (equivale a Auto Normalize), máximo 4 influencias (ya está en la GUIA), y **listar los grupos por vértice** como en *Item → Vertex Weights* para encontrar el error de `hair-general` en el brazo. Reportar los vértices donde un grupo de otra zona (pelo, pie) pesa más de 0.
3. **Backface culling = doubleSided en el GLB**. El exportador glTF de Blender pone `doubleSided` según `material.use_backface_culling`. El **ala del casco, mechones de pelo, solapas del chaleco y la falda** suelen ser planos de una sola cara: con culling activado desaparecen desde atrás en three.js (su punto 3). Regla: piezas cerradas con culling (más baratas y sin ruido), planos sueltos sin culling, o bien `side: DoubleSide` en esos materiales en el loader. Revisar la orientación antes de exportar: una cara invertida en la malla cerrada del casco se vería como un agujero.
4. **Vista previa 1:1 de la textura en Blender** (cuando usamos `look` para revisar el recolor del outfit): Eevee, View Transform **Standard**, shader **Emission** (o Viewport Shading con Scene Lights/World apagados), sin sombras ni ray tracing. Así el chaleco hi-vis y la camisa se ven con el mismo color que el PNG, igual que con `MeshBasicMaterial` en nuestro motor. Ponerlo en una función `setup_preview()` que corra al empezar cada sesión MCP (nuestro "startup file"). **Exportar con Principled BSDF + base color**, no con Emission: así el glTF lleva la textura en `baseColorTexture` y el motor decide (unlit).
5. **Tris en rodillas y codos** (1:54): si al arrodillarse o levantar la sierra el codo o la rodilla de NETO se aplastan, un triángulo bien puesto en el pliegue mejora el doblez sin subir mucho el conteo.
6. **Presupuesto de polígonos**: según el #1024Challenge, un personaje low poly completo con textura y expresiones cabe en ≤1024 tris. NETO tiene 540, así que hay **~480 tris para accesorios** (casco, botas, rodilleras, chaleco) sin salir de la estética. El ejemplo usa **atlas de expresiones en la textura** (tiras de ojos/bocas): otra opción a nuestros sprites sueltos, cambiando el offset UV en three.js (`map.offset`) en vez de cambiar la imagen. Así hay una sola textura de cara y ningún cambio de material.
7. **Rig sin errores de "bone heat"**: si algún accesorio se emparenta con pesos automáticos (*With Automatic Weights*) y falla, el orden es: aplicar transformaciones → fusionar duplicados → recalcular normales → quitar n-gons. Para rigidez (casco), seguir con el parent a `DEF-` o peso 1.0 de la GUIA.
8. **Orígenes**: los accesorios se modelan con el origen en (0,0,0) (ya está en la GUIA). Si una pieza rota rara al animarla, revisar el origen (`origin_set`) antes de tocar el rig.
9. **Guardado por script**: antes de cada operación destructiva (aplicar transformaciones, fusionar, reparentar `DEF-*`), `bpy.ops.wm.save_as_mainfile(filepath=..._NNN.blend, copy=True)` como su `Ctrl+Alt+S`. Trabajar sobre copias del `.blend` de NETO, nunca sobre el original.
10. **Referencias**: para el estilo de casco/chaleco/botas PS1, buscar modelos low poly de obreros y cascos en **Sketchfab** (vista de wireframe) y en **The Models Resource** (rips de juegos de PS1). Sirven para copiar la silueta y la cantidad de polígonos.

### Lo que no aplica
- Atajos y accidentes de interfaz: `H`/`Alt+H`, teclas `1–9`, edición proporcional (`O`), snapping (`Shift+Tab`), F3, Quick Favorites, keymap, cursor 3D con `Shift+S`. No usamos la interfaz; en scripts no pasan esos accidentes.
- Weight painting a mano con la herramienta Gradient y simetría X: nosotros asignamos pesos por script (Data Transfer o `vertex_group.add`).
- Recuperar autosaves y `.blend1` (útil solo como último recurso si Blender se cae durante una sesión MCP).
- Consejos de motivación y aprendizaje (burnout, tutorial hell, aprender de a poco, no usar add-ons) y el aviso de AgX/Standard, que ya está en la GUIA.
- Mapas de normales y Data Transfer de normales: no aplican a nuestro sombreado plano y sin luces (las sombras están pintadas en la textura).
