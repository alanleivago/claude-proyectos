# Rig Your Character in 8 minutes! ✨ Blender 3D Character Modeling Tutorial - Part 9 [2024]

- Link: https://www.youtube.com/watch?v=4O3OKhYxNx8
- Canal: Crashsune Academy
- Fecha: 2026-11-16
- Tema: mml crashsune modelado low poly

## De qué trata
Es un capítulo de la serie "Crashsune Academy" sobre modelado low poly en Blender. Se enfoca en el rigging: cómo darle huesos a un personaje 3D low poly para poder animarlo. Primero explica los conceptos básicos de huesos con un cubo, y después muestra el flujo real con Rigify (Basic Human MetaRig), con el que se genera un rig listo para animar en pocos minutos. Va dirigido a principiantes que ya tienen un personaje modelado y quieren dejarlo listo para el siguiente paso, el weight painting.

## Pasos / método
1. **[00:32]** Ocultar todo lo que hay en la escena (seleccionar todo + H) para hacer una demo de huesos con un objeto aparte.
2. **[00:42]** Crear un cubo, escalarlo en Z y agregarle unos 20 loop cuts (Ctrl+R, o la herramienta de loop cut) para que deforme bien.
3. **[01:06]** Agregar un armature de hueso único (Shift+A) y activar "In Front" en las propiedades de datos del objeto para ver el hueso a través de la malla.
4. **[01:30]** En modo edición, entender head (base del hueso) y tail (punta). Mover los huesos con G y crear huesos nuevos extruyendo (E) desde el tail y bloqueando el eje Z.
5. **[02:21]** Salir a modo objeto, seleccionar primero el cubo y después los huesos, y emparentar con Ctrl+P → Armature Deform with Automatic Weights.
6. **[02:38]** Entrar en Pose Mode (Ctrl+Tab) y rotar huesos para comprobar que la malla se deforma. Resetear la pose con A y Alt+R.
7. **[03:17]** Ver la jerarquía de huesos: con Alt+P (clear parent) un hueso deja de seguir a su padre. La jerarquía permite mover pocos huesos padre para generar movimientos complejos.
8. **[05:07]** En el flujo real no se crean huesos a mano: se usa un MetaRig de Rigify, que ya trae la estructura, los nombres y las formas de control.
9. **[05:52]** Revelar la escena con Alt+H, borrar el esqueleto de prueba y verificar que el add-on Rigify esté activo (Edit → Preferences → Add-ons).
10. **[06:28]** Agregar Shift+A → Armature → Rigify Meta-Rigs → Basic → Basic Human. Se elige "basic" porque el humano completo trae controles de dedos, boca, nariz y párpados que sobran para este estilo.
11. **[07:06]** Activar "In Front", ir a vista frontal (1 en el numpad) y escalar el rig (S, y también en X) hasta que coincida con el personaje. Después Ctrl+A → aplicar escala o todas las transformaciones.
12. **[08:06]** En modo edición, alinear heads y tails con el personaje: codo en el edge loop del codo, muñeca, punta de la mano, rodilla centrada en su loop, cabeza y cuello.
13. **[08:42]** Activar el espejo en X ("Apply changes to matching bone on opposite side"). Si un hueso no se refleja, activar la opción y mover un poco el hueso para que se sincronice.
14. **[09:21]** Mover con G+X los huesos de rodar el pie hacia los bordes del pie.
15. **[10:07]** Ajustar los huesos de cuello (dos) y el de cabeza; usar vista lateral (3) para que terminen donde termina el cuello.
16. **[10:36]** Ocultar con H los huesos ya acomodados para trabajar más limpio (Alt+H los revela).
17. **[11:01]** En vista lateral (3), alinear pie, tobillo, rodilla y cadera. Las articulaciones deben quedar centradas dentro del volumen del modelo, porque la rotación sale de ahí.
18. **[11:51]** Dejar una leve flexión en rodilla y codo para que Blender sepa en qué dirección doblan las extremidades.
19. **[12:14]** Revisar desde la vista superior (7) y de nuevo en la frontal. Borrar los huesos de pecho (innecesarios) y revelar todo.
20. **[12:52]** Reforzar la flexión de rodillas con G+Y, volver a modo objeto y ocultar las imágenes de referencia (turnarounds).
21. **[13:07]** En las propiedades de datos, sección Rigify, pulsar **Generate Rig**. Activar In Front en el nuevo rig y ocultar el MetaRig con el icono del ojo.
22. **[13:40]** Seleccionar todas las partes del personaje (pelo, cara, cuello, torso, brazos, manos, piernas, cintura, pies) sin el rig. Comprobar con H que no falta nada (deshacer después).
23. **[14:24]** Shift+clic en el rig generado al final, Ctrl+P → Armature Deform with Automatic Weights.
24. **[14:51]** Entrar en Pose Mode con Ctrl+Tab y probar piernas, brazos, manos, cuello, cabeza, torso y raíz. Los pies y las manos se quedan fijos porque tienen IK activo.
25. **[15:36]** Notar los errores de pesos (pelo y pecho que siguen al brazo). Se corrigen con weight painting en el próximo video.
26. **[15:54]** Abrir el panel lateral (N), pestaña Item, y usar Rig Layers para ocultar capas innecesarias (tweak, FK, etc.) y quedarse con los controles útiles.
27. **[16:33]** Si el rig sale mal (por ejemplo, el cuello inclinado hacia adelante), volver a modo objeto, mostrar el MetaRig y corregirlo en modo edición.
28. **[17:03]** En vista lateral y con X-ray (Alt+Z), seleccionar los huesos de la columna con caja y moverlos con G+Y hacia adelante o atrás para corregir la postura. Hay que ser muy cuidadoso para no provocar errores.
29. **[18:01]** Ocultar el rig generado, volver al MetaRig y usar **Re-Generate Rig** en la pestaña Rigify. Ocultar el MetaRig y comprobar en Pose Mode que el cuello ya no se inclina tanto.

## Lo que se ve en pantalla
- **[00:38–01:00]** Cubo escalado en altura y con loop cuts (unos 20) para probar la deformación.
- **[01:17]** Pestaña de propiedades de datos del armature (icono del hombrecito verde) → Viewport Display → casilla "In Front".
- **[01:37]** Panel N en edición de hueso: valores Head/Tail (X, Y, Z), Radius, Roll, Length y Envelope.
- **[02:35]** Selector de modo arriba a la izquierda: Object Mode / Edit Mode / Pose Mode.
- **[04:13]** Se muestran en el navegador los videos recomendados: "3D Rigging is Beautiful" de Doodley (esqueleto, skin, controles) y los de Joey Carlino ("Rigging for Impatient People").
- **[06:10]** Ventana de Preferences → Add-ons, búsqueda "rigify", con el add-on activado.
- **[06:29–06:49]** Menú Add → Armature → Rigify Meta-Rigs → Basic → Basic Human (las otras opciones son Human, Animals, Basic Quadruped).
- **[07:28]** Vista frontal ortográfica con el MetaRig escalado sobre el personaje, y el panel Rigify con el botón "Generate Rig".
- **[07:47]** El panel de operador muestra Apply Object Transform con Scale y Apply Properties marcados.
- **[08:07–09:44]** Ajuste de brazo, mano, pierna y cabeza en edición, con el espejo activado.
- **[09:25]** Los huesos de foot roll en los bordes laterales de cada pie.
- **[11:02–12:01]** Vista lateral derecha de pierna y pie con los huesos alineados a los edge loops.
- **[12:40]** Cartel: conservar los huesos de pecho si el personaje tiene "dobonhonkeroos" que animar.
- **[13:19]** Outliner con el rig generado ("rig") y el MetaRig oculto.
- **[14:37]** Panel de operador de Parent con Type: "With Automatic Weights".
- **[15:54]** Panel N → pestaña Item con "Rig Main Properties" y "Rig Layers"; cartel: asegurarse de estar en la pestaña "Item".
- **[18:11]** Botón "Re-Generate Rig" en el panel Rigify del MetaRig.
- **[19:09]** Promoción de la versión de pago de la serie (guía de atajos en PDF, modelo final texturizado, riggeado y con UV, videos descargables).

## Consejos y advertencias
- **[01:14]** Activar "In Front" en el hueso para poder verlo dentro de la malla; es un ajuste del armature, no del objeto.
- **[05:10]** Mejor partir de Rigify que crear huesos a mano: ahorra tiempo, trae nombres, controles y menús útiles.
- **[06:40]** Elegir Basic Human y no Human, porque el último tiene demasiado detalle (dedos, cara) para un estilo low poly.
- **[08:20]** Activar el wireframe en Viewport Overlays para alinear huesos con los edge loops.
- **[08:42]** Activar el espejo en X antes de editar huesos; si algo no se refleja, moverlo un poco con la opción activa.
- **[10:30]** No hace falta que quede perfecto: se puede regenerar el rig cuando haga falta.
- **[11:48]** Dejar una leve flexión en rodillas y codos para que el IK sepa hacia dónde doblar.
- **[11:36]** Centrar los huesos de articulaciones dentro del volumen del cuerpo.
- **[17:06]** Tener mucho cuidado al mover los huesos de la columna, porque se pueden provocar errores al generar.
- **[18:17]** No borrar el MetaRig: sirve para regenerar o modificar el rig más adelante.
- **[15:33]** Esperá artefactos al principio (pelo y pecho siguiendo al brazo) hasta que se haga el weight painting.

## Lo que no queda claro
- Los atajos de la transcripción tienen errores de reconocimiento de voz ("Control-Plus-C" por Ctrl+Z, "Bunding Box", "Alt C" por Alt+Z para X-ray; "Shift plus tab" al crear el cubo debería ser Shift+A). Lo que se ve en pantalla confirma Ctrl+Z en [01:37] y [18:30].
- No se explica cómo se hizo la selección de objetos al emparentar ni el panel de espejo con todo detalle (es un botón del panel de armature).
- En [03:14] se hace Alt+P para limpiar el padre, pero no se aclara qué opción exacta del menú se elige.
- Los valores concretos de escala del rig y de las posiciones de huesos no se dan; se hace a ojo.
- No se muestra cómo se corrigen los pesos: queda para el siguiente video (weight painting).
- No se detalla cómo se llegó a la configuración de la vista de materiales/shading ni cómo se ocultó el rig con el icono del ojo más que de pasada.
