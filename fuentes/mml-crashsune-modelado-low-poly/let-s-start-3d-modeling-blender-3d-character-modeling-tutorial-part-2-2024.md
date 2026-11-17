# Let's Start 3D Modeling! ✨ Blender 3D Character Modeling Tutorial - Part 2 [2024]

- Link: https://www.youtube.com/watch?v=yknJh0meORQ
- Canal: Crashsune Academy
- Fecha: 2026-11-16
- Tema: mml crashsune modelado low poly

## De qué trata
Es un episodio de una serie de modelado de personajes low poly en Blender 4.2 (el personaje se llama "LoveChan"). Enseña los fundamentos del modo edición (vértice, arista, cara), las herramientas básicas de modelado y cómo modelar el pie y la pierna derechos a partir de dibujos de referencia de frente y de lado. Está pensado para principiantes que quieren crear sus propios personajes 3D. El resultado es un pie (cubo editado) y una pierna (cilindro de 5 vértices) alineados con las referencias.

Sobre el tema pedido ("mml crashsune modelado low poly"): no encontré ese nombre en el video. El contenido es modelado low poly de "LoveChan", así que tomo ese tema.

## Pasos / método
1. **[00:32]** Ocultar el Rigify Rig con H, porque no se necesita ahora.
2. **[00:42]** Añadir un cubo con Shift+A > Mesh > Cube y pasar a Edit Mode con Tab, ya que el modelado se hace ahí y no en Object Mode.
3. **[01:19]** Aprender los tres modos de selección: vértice (por defecto), arista y cara. Se alterna entre ellos constantemente y se mueve con G.
4. **[03:11]** Ensanchar la barra de herramientas izquierda para ver los nombres. Las herramientas útiles de la serie son Select Box, Extrude Region, Bevel y Loop Cut.
5. **[04:12]** Loop Cut: pasar el cursor por el modelo hasta que aparece la línea amarilla y hacer clic para crear un anillo de aristas.
6. **[04:54]** Bevel: con una cara seleccionada, arrastrar el círculo para biselar. Se usará en el torso.
7. **[05:44]** Extrude Region: con una cara seleccionada, arrastrar para crear caras nuevas. Con G solo se mueven las existentes.
8. **[06:57]** Preparar el pie: en Edit Mode, escalar el cubo con S y pasar a vista frontal ortográfica (numpad 1).
9. **[07:20]** Activar X-ray (Alt+Z) para ver la referencia a través del cubo.
10. **[07:34]** Modelar solo el lado derecho del personaje; el izquierdo se espejará después.
11. **[07:47]** En modo vértice, seleccionar con caja y alinear con G+X y G+Z sobre el pie de la referencia frontal.
12. **[08:18]** Pasar a vista lateral (numpad 3) y mover vértices con G+Y para ajustar la longitud del pie.
13. **[08:40]** Usar Loop Cut para añadir un corte a la altura de la línea del zapato. Luego mover con G+Y los vértices de punta y talón.
14. **[09:36]** Repetir con otro Loop Cut hasta que el perfil coincida con la suela y el empeine.
15. **[10:05]** Revisar la vista frontal. El zapato estaba dibujado inclinado, pero se deja recto porque en 3D se veía mejor.
16. **[10:26]** Desactivar X-ray: el pie queda terminado.
17. **[10:38]** Para la pierna, añadir un cilindro con Shift+A > Mesh > Cylinder.
18. **[11:00]** En el panel Add Cylinder, poner Cap Fill Type en Nothing y Vertices en 5 (pierna chunky y low poly).
19. **[11:42]** Tab, vista frontal, escalar y mover con S y G, y activar X-ray.
20. **[12:08]** Seleccionar los vértices inferiores y moverlos con G+Z y escalarlos con S+X. Hacer lo mismo con los superiores, de modo que la pierna llegue un poco por encima del short.
21. **[12:49]** Pasar a la vista derecha y ajustar con S+Y y G+Y arriba y abajo para igualar el perfil.
22. **[13:29]** Añadir un Loop Cut a media pierna, donde está el hueco/curva de la pantorrilla, y empujar esos dos vértices con G+Y.
23. **[13:58]** Revisar la vista frontal, guardar con Ctrl+S y desactivar X-ray (Alt+C según el audio).

## Lo que se ve en pantalla
- **[00:29]** Dos planos con las referencias del personaje (frente y lado) en la escena, y el Rigify Rig en el outliner.
- **[01:14]** Barra de herramientas de Edit Mode con Select Box, Extrude Region, Bevel y Loop Cut. Los selectores de vértice/arista/cara están arriba a la izquierda.
- **[03:42]** Tooltip de Select Box: atajo Shift+Spacebar o B, y W para cambiar entre modos de selección.
- **[05:25]** El torso de la referencia es básicamente un cubo biselado.
- **[07:24]** Tooltip de "Toggle X-Ray", atajo Alt+Z.
- **[08:23]** Vista ortográfica derecha con el cubo del pie sobre la referencia.
- **[09:37]** Loop Cut con opciones "Number of Cuts" y "Connect UVs".
- **[10:51]** Panel "Add Cylinder" con Vertices, Radius, Depth, Cap Fill Type (por defecto N-gon), Generate UVs y Align World.
- **[11:20]** Desplegable de Cap Fill Type con Nothing, N-gon y Triangle Fan.
- **[11:35]** Con 5 vértices y Cap Fill en Nothing el cilindro queda como prisma pentagonal hueco.
- **[11:50]** En el panel inferior de la operación aparece "Mirror Editing" activado. No se comenta en el audio.
- **[14:03]** La pierna terminada junto al pie, en vista 3D sobre las dos referencias.

## Consejos y advertencias
- **[01:19]** Conviene aprender bien los tres modos de selección, porque se cambia entre ellos todo el tiempo.
- **[04:19]** Con las herramientas Loop Cut, Bevel o Extrude activas no se puede seleccionar; hay que volver a Select Box con W.
- **[05:44]** G solo mueve caras existentes. Extrude Region es lo que crea geometría nueva.
- **[07:38]** Modelar solo el lado derecho y espejar después ahorra mucho trabajo.
- **[09:16]** Seleccionar con caja y no con clic, porque en vista frontal hay dos vértices superpuestos; con clic solo se mueve uno.
- **[10:14]** No hace falta copiar fielmente un detalle del dibujo (el zapato inclinado) si no se ve bien en 3D.
- **[12:26]** No buscar perfección en el ajuste inicial de la pierna.
- **[14:03]** Guardar constantemente con Ctrl+S.

## Lo que no queda claro
- El audio dice Alt+C para desactivar X-ray, pero el atajo mostrado en pantalla es Alt+Z. Parece un error de dicción.
- No se explica cómo se hizo el espejado ni qué hace "Mirror Editing", activado en el panel. Se verá en videos posteriores.
- El tema "mml crashsune" no aparece en el video, y no se aclara qué relación tiene.
- No se dan valores numéricos exactos de escala ni posición; todo se ajusta a ojo.
