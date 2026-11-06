# Blender: Rig A Dog With This Built-In Addon | EASY

- Link: https://www.youtube.com/watch?v=MLCnkgdUkxI
- Canal: PIXXO 3D
- Fecha: 2026-11-04
- Tema: blender-lowpoly-perro

## De qué trata
Es un tutorial de Blender (versión 3.5 según la interfaz) que muestra cómo riggear un perro (un chihuahua) con el addon Rigify, que ya viene incluido. Se coloca el metarig "Wolf" sobre el modelo, se genera el rig completo y se emparenta la malla con pesos automáticos. Sirve para principiantes que quieren un perro posable (patas, cola, orejas, ojos, párpados) sin crear huesos a mano. El video también explica cómo bajar y preparar el modelo gratuito de Sketchfab, aunque se puede saltear si ya se tiene un modelo.

## Pasos / método
1. **[01:10]** Descargar el modelo gratuito "Dog" de Sketchfab (hace falta una cuenta gratuita), en formato FBX (unos 16 MB). Se extrae el zip y la carpeta `source`; adentro hay otro zip con `source` y `textures`.
2. **[02:05]** En Blender, borrar los objetos por defecto (X → Delete) e importar con File > Import > FBX el archivo `dog.fbx`.
3. **[02:26]** El perro entra diminuto. Se selecciona, se resetea la rotación con Alt+R y se activa 3D Cursor como pivote.
4. **[02:47]** Se agrega un cubo con Shift+A como referencia de escala y se escala el perro (S). Luego se aplica con Ctrl+A: Escala, Rotación y Ubicación. Después se borra el cubo.
5. **[03:08]** Se centra el perro sobre la línea azul (G, Y), mirando en wireframe y vista ortográfica. Se aplica la ubicación de nuevo.
6. **[03:29]** En Edit Mode se seleccionan los ojos y piezas sueltas (Ctrl+L), se invierte la selección con Ctrl+I y se borran los vértices sobrantes.
7. **[03:50]** Se limpian los materiales y se crea uno nuevo llamado "chihuahua" con Base Color > Image Texture. Se abre la textura de la carpeta `textures`. En Material Preview (Z) se ve el perro texturizado.
8. **[04:11]** Se vuelve el pivote a Median Point y se guarda el archivo como `chihuahua.blend`.
9. **[04:43]** Se verifica que Rigify esté activo en Edit > Preferences > Add-ons (buscar "rig") y se guardan las preferencias.
10. **[05:07]** Shift+A > Armature > Animals > Wolf agrega el metarig de perro.
11. **[05:24]** En vista frontal (1) se rota el perro con R, Z, -90 para que mire de frente y se aplica la rotación. Se escala el metarig al tamaño del perro y se aplica la escala (Ctrl+A).
12. **[06:01]** Se entra en Edit Mode del metarig y se activa X-Mirror en la cabecera para que los cambios se reflejen en ambos lados.
13. **[06:12]** Patas traseras: en vista lateral (Numpad 3) se mueven los huesos hacia atrás para alinearlos con las patas, y en vista inferior (Ctrl+7) se escalan y rotan los huesos del pie para que calcen con la pata.
14. **[07:40]** Patas delanteras: mismo procedimiento, comparando vistas frontal, lateral e inferior.
15. **[08:43]** La pelvis se ubica en su sitio. Se comprueba el nombre del hueso en las propiedades de hueso.
16. **[09:04]** Columna y cola: se acomoda la punta de la cola y los huesos siguientes en vista lateral. La cola usa unos 4 huesos. Se distribuyen los huesos de la columna de forma pareja.
17. **[10:07]** Desde `spine.009` hacia arriba es la cabeza. Se seleccionan esos huesos y se mueven, rotan y escalan hacia la cabeza del perro. Se baja el hueso del hombro.
18. **[11:09]** Orejas: se escalan mucho, se mueven hacia atrás, se rotan en vista superior y se ajustan los huesos siguiendo el contorno de la oreja.
19. **[12:12]** Ojos y cejas: se seleccionan con C los huesos de párpados y cejas, se mueven al ojo y se escalan. El hueso `eye` va al centro del ojo. Se ajusta cada hueso del párpado al contorno del ojo, en modo wireframe.
20. **[14:18]** Nariz y labios: se ajustan los huesos de nariz y labios (`lip.B.L`, etc.) a la malla. Se mueven los huesos de las sienes (`temple`). Este modelo no tiene boca interior ni lengua, por eso no se ajustan.
21. **[16:03]** Se guarda con Ctrl+S. En Object Mode se crean las colecciones "Dog mesh" (con el perro) y "RIG" (con el metarig) con M, y se borra lo sobrante (cámara, target, colección vieja).
22. **[16:44]** Con el metarig seleccionado, en Object Data Properties > Rigify > Generate Rig.
23. **[17:05]** El metarig original se mueve a una colección "junk" y se oculta y desactiva en el render.
24. **[17:26]** Se selecciona el nuevo rig, se entra en Pose Mode, se selecciona todo (A) y se oculta (H). Luego se hace Shift+clic en la capa correspondiente de Skeleton > Layers para mostrar los huesos de deformación (DEF-).
25. **[17:47]** En Object Mode se selecciona el perro, luego el rig con Shift, y Ctrl+P > With Automatic Weights.
26. **[18:08]** Se vuelve a Pose Mode y se oculta la capa DEF con Shift+clic. Alt+H devuelve los controles. Ya se puede posar el rig.
27. **[18:29]** Se prueban los controles (cadera, cuello, patas, cola, caja general, ojos, orejas, párpados). Con Alt+G y Alt+R se resetean las transformaciones.
28. **[20:14]** Opcional: para refinar pesos, se ocultan los huesos de control, se muestran los DEF, se selecciona el rig y luego la malla, y se entra en Weight Paint. Con Ctrl+clic sobre un hueso se elige su grupo de vértices.

## Lo que se ve en pantalla
- **[04:53]** Preferencias > Add-ons: búsqueda "rig" que muestra "Rigging: Rigify" tildado. Se usa "Save Preferences".
- **[05:14]** Shift+A > Armature muestra las opciones de Rigify. El metarig usado es el "Wolf" (de Animals).
- **[05:34]** Perro en wireframe con el metarig naranja superpuesto, antes de ajustarlo.
- **[08:43]** Panel Bone Properties: la pelvis aparece como `pelvis.L` y la cabecera de la ventana muestra "Dx/Dy/Dz" durante el movimiento.
- **[09:04–10:07]** Se identifican `spine.002`, `spine.003`, `spine.004`, `spine.008` y `spine.009` en el panel de huesos.
- **[10:07]** `spine.009` marca el inicio de los huesos de la cabeza.
- **[11:09]** El hueso `shoulder.L` se escala con S (valor ~1.626 visible en la cabecera).
- **[12:12–13:36]** Huesos `eye.L`, `brow.B.L`, `lid.T.L.002`, `ear.L.002`. Atajo Z para cambiar el modo de visualización (Wireframe/Solid).
- **[15:00]** El texto superpuesto "*BASE LIP*" señala `lip.B.L.001`.
- **[16:23]** Outliner: "Dog mesh" (con `dog`), "Collection" (cámara y target) y "RIG" (con `metarig`). Mensaje "metarig moved to RIG".
- **[16:44]** Panel Rigify con "Generate Rig". Tras generar, el botón pasa a "Re-Generate Rig" **[17:05]**.
- **[17:05]** El Outliner muestra "RIG" con `WGTS_rig` y `rig`, y "JUNK" con `metarig`.
- **[17:26–18:08]** Skeleton > Layers y Protected Layers. Los huesos DEF-* (p. ej. `DEF-spine.004`) se ven en verde.
- **[18:29]** El rig generado muestra formas de control (círculos, la caja grande, controles de ojos y orejas).
- **[20:14–20:35]** Weight Paint: la malla azul con grupos de vértices tipo `DEF-spine`, `DEF-breast.R`. Pincel con Weight 1.000, Radius 50 px, Strength 1.000.

## Consejos y advertencias
- **[03:00]** Aplicar siempre escala, rotación y ubicación antes de riggear.
- **[05:54]** Aplicar la escala del metarig; si no, puede romper cosas.
- **[06:03]** Activar X-Mirror antes de mover huesos, así se ahorra trabajo.
- **[04:35]** El modelo de Sketchfab es solo un recurso de práctica. Si ya se tiene un perro propio, se puede ir directo al rigging.
- **[15:12]** Los huesos del metarig están nombrados (labios, nariz, etc.) y las propiedades de hueso ayudan a identificar cuál es cada uno.
- **[07:11]** Cada modelo es distinto: hay que ajustar los huesos a las proporciones propias.
- **[12:31]** Al seleccionar con C los huesos de ojos/cejas, evitar tomar otros huesos.
- **[16:03]** Guardar antes de generar el rig.
- **[17:20]** No emparentar al metarig: se genera el rig y se parentea al rig nuevo, con los huesos DEF visibles.
- **[20:38]** El refinado de pesos queda fuera del tutorial.

## Lo que no queda claro
- El título del tema dice "lowpoly", pero el modelo mostrado es de alto detalle, no lowpoly. El método sirve igual con una malla lowpoly.
- El video dice "free" para el modelo de Sketchfab con atribución (CC), pero no menciona verificar la licencia al usarlo.
- No se explica con precisión qué botón de capa se pulsa en Skeleton > Layers para mostrar/ocultar los DEF (se dice "tercera fila"; en el video se ve la fila inferior de las capas).
- No se muestra cómo ajustar los huesos de los dedos de las patas en detalle; se dice que es "autoexplicativo".
- Las cifras de rotación (R Z -90) y de escala del perro varían según el modelo; no se dan valores universales.
- No se detalla qué hacer con los huesos de lengua y mandíbula interna si el modelo sí los tiene, más allá de mencionarlo.
