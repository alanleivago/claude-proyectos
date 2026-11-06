# How to create a quadruped walk cycle animation for a 3d puppy | Blender Tutorial

- Link: https://www.youtube.com/watch?v=CNd7nqUgnj0
- Canal: Ovi Gomy
- Fecha: 2026-11-04
- Tema: blender-lowpoly-perro

## De qué trata
Es un tutorial de Blender sobre cómo animar un ciclo de caminata para un perrito lowpoly que ya tiene armadura con huesos IK (del video anterior). Enseña a poner keyframes en las patas, suavizar el movimiento en el Graph Editor, repetirlo en bucle, desfasar huesos para que se vea natural, convertirlo en una acción reutilizable en el editor NLA y hacer que el perro siga una curva. Está pensado para quien ya sabe lo básico de rigging en Blender.

## Pasos / método
1. **[00:16]** Antes de animar, poner la interpolación por defecto en lineal: Edit > Preferences > Animation > Default Interpolation > Linear.
2. **[00:30]** Renombrar los huesos IK y los pole targets con sufijos L y R (por ejemplo IKFrontL / IKFrontR), también los de las patas traseras. Así Blender calcula la posición espejo de la pierna opuesta.
3. **[01:11]** Poner la línea de tiempo con inicio en 1 y fin en 100. Dividir la ventana, poner el área central en Dope Sheet y agrandar el viewport.
4. **[01:30]** En Pose Mode, bajar el hueso raíz porque las patas delanteras están estiradas al máximo. Mover IKFrontL hacia adelante (G Y) justo antes de que la pata se despegue del suelo, y IKFrontR hacia atrás con el mismo criterio.
5. **[02:06]** Seleccionar ambos huesos IK, insertar keyframe de Location y Rotation (I), copiarlos en el Dope Sheet, ir al final del rango y pegar. Volver a copiar, ir al frame 50 y pegar en espejo con Ctrl+Shift+V.
6. **[02:44]** Levantar las patas cuando empieza el movimiento hacia adelante: con IKFrontR en el frame 25, subirlo en Z; seleccionar ambas patas, insertar keyframe, copiar y pegar en espejo en el frame 75.
7. **[03:15]** Visualizar el recorrido de la pata con Motion Paths (Calculate, rango 1–100). Sale una forma triangular que hace la animación torpe.
8. **[03:39]** En el Graph Editor, aislar la curva de Z Location (Shift+H). Seleccionar los keyframes de los frames 50 y 75 y cambiar la interpolación a Bezier (Key > Interpolation Mode). Subir el ápice para redondear la curva.
9. **[04:15]** Evitar el deslizamiento al apoyar: acercar al keyframe el handle izquierdo del punto final y el derecho del keyframe 50, para que la curva sea casi lineal en el contacto con el suelo.
10. **[04:51]** Repetir lo mismo con las patas traseras y animar el resto de huesos del cuerpo (columna, cabeza, cola, orejas).
11. **[05:30]** Seleccionar todos los huesos (A), pasar al Graph Editor, revelar todo (Alt+H), elegir la curva Z Location de IK front left y seleccionar todos sus keyframes. Con N abrir la pestaña Modifiers y añadir un modificador Cycles para repetir los 100 frames en bucle.
12. **[06:12]** Copiar el modificador, seleccionar todas las curvas (A) y pegarlo. Eliminar el duplicado de la curva activa, que ya lo tenía.
13. **[06:31]** En el Dope Sheet, desfasar las patas traseras 15 frames hacia adelante (G X) para que el perro no ande como un camello (pacing). Aplicar el mismo principio con 5 frames a los huesos de los hombros, la cola o una oreja.
14. **[07:20]** Convertir la animación en una acción: seleccionar todos los huesos, abrir el Action Editor, ir al editor NLA, renombrar la acción y activar el escudo (fake user) para no perderla.
15. **[07:47]** Con N activar Manual Frame Range (1–100) y pulsar Push Down para crear la pista NLA.
16. **[08:07]** En el panel Action Clip del NLA ajustar Repeat (por ejemplo 5) o Scale para cambiar la velocidad.
17. **[08:33]** En Object Mode añadir una curva Bezier, rotarla (R Z 90) y escalarla. Subir Resolution a 256 y poner Frames de Path Animation en 400.
18. **[08:49]** Seleccionar la armadura, añadir una restricción Follow Path con la curva como target, activar Follow Curve y pulsar Animate Path.
19. **[09:02]** Si el perro mira al lado contrario, cambiar el Forward Axis de Y a -Y.
20. **[09:17]** Notar que el perro se desliza: hay que subir la velocidad y las repeticiones de la acción (queda como tarea).

## Lo que se ve en pantalla
- **[00:19]** Preferences > Animation: Default Interpolation en Linear.
- **[00:38]–[00:58]** En Edit Mode, huesos renombrados con el sufijo L/R (por ejemplo "IK_FrontL") en la pestaña Bone.
- **[01:08]** Vista Right Orthographic con el rango de la línea de tiempo en 1–100.
- **[01:27]** Pose Mode con los huesos de las patas coloreados: amarillo (muslo/antebrazo) y verde (parte inferior), y los IK con color distinto.
- **[02:06]** Menú Insert Keyframe con la opción "Location & Rotation".
- **[03:24]** Diálogo Calculate Bone Paths con rango 1–100.
- **[03:34]** Motion path en forma de triángulo, con keyframes en 1, 25, 50 y 75.
- **[04:03]** Graph Editor con la curva Z de Bezier, con forma de campana en el apex.
- **[06:00]** Modificador Cycles en el panel lateral del Graph Editor (pestaña Modifiers, Add Modifier).
- **[07:38]–[07:57]** Action Editor con la acción renombrada, el botón del escudo y los botones Push Down y Manual Frame Range.
- **[08:07]** Panel Action Clip del NLA con campos Repeat y Scale.
- **[08:36]** Curva Bezier en la escena con Resolution 256 y Frames 400 (panel Path Animation).
- **[08:56]** Restricción Follow Path con Forward Axis cambiado a -Y y Animate Path.
- **[09:35]** Render final: cachorro caminando sobre fondo naranja y suelo rojo.

## Consejos y advertencias
- **[01:44]** No pasarse al adelantar la pata: si se estira de más, el pie se levanta del suelo. Pararse justo antes.
- **[03:29]** El movimiento triangular de la pata hace que la animación se vea "torpe"; hay que suavizarlo con Bezier.
- **[04:20]** Tras tocar el suelo la pata parece deslizarse en Y; se corrige ajustando los handles.
- **[06:31]** Con todo sincronizado se ve un caminar de "camello": desfasar patas traseras, hombros, cola y orejas.
- **[07:20]** No mezclar varias animaciones sobre el mismo timeline: se vuelve un desorden, mejor trabajar con acciones.
- **[07:41]** Activar el escudo (fake user) permite recuperar la animación aunque se borre.
- **[09:17]** Al seguir la curva el perro se desliza: aumentar la velocidad de la acción y sus repeticiones.

## Lo que no queda claro
- Los valores exactos de los keyframes (cuánto bajar la raíz, cuánto subir la pata en el frame 25) no se dictan; se hacen a ojo.
- La animación del resto de huesos del cuerpo (04:54–05:30) se muestra sin explicación hablada, y el audio salta de la pata trasera a "estoy satisfecho".
- El desfase de los hombros, la cola y la oreja se menciona sin indicar qué huesos concretos ni qué valores en frames (solo "5 frames" para los hombros).
- No se explica con detalle cómo ajustar Repeat y Scale para eliminar el deslizamiento en el path (se deja como tarea); tampoco el valor final usado.
- La transcripción tiene errores evidentes ("Ctrl Z" para copiar en el Dope Sheet, que en Blender es Ctrl+C; "VR" por R; "Cycles" por modificador Cycles) que conviene verificar en el video.
- Las menciones al video siguiente (pelaje) no aportan contenido.
