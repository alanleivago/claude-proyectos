# Modeling the Upper Body✨ Blender 3D Character Modeling Tutorial - Part 3 [2024]

- Link: https://www.youtube.com/watch?v=fxnfX3rIFbY
- Canal: Crashsune Academy
- Fecha: 2026-11-16
- Tema: mml crashsune modelado low poly

## De qué trata
Es un episodio de una serie de Blender (4.1) que enseña a modelar en low poly al personaje "Love-chan" con un estilo inspirado en Mega Man Legends. Cubre la cintura (short), el torso, el brazo, la mano y el cuello, todo a partir de cubos y un cilindro, calzados sobre dibujos de referencia de frente y de lado. Está pensado para principiantes y deja el cuerpo casi completo; la cara queda para el próximo video. El tema "mml crashsune" no se menciona en el audio, solo la inspiración en Mega Man Legends.

## Pasos / método
1. **[00:45]** Cintura: Shift+A → Mesh → Cube, Alt+Z para X-ray, Tab para edit mode, y escalar/mover (S, G+Z) en vista frontal (numpad 1) hasta ubicarlo en la zona de la cintura.
2. **[01:28]** Loop cut exactamente en el centro del cubo, porque el modelo se va a espejar. La parte es simétrica y así no se duplica el trabajo.
3. **[02:11]** Con 3 (face select) se seleccionan y borran las caras de una mitad; se agrega el modificador Mirror (pestaña de la llave azul → Add Modifier → buscar "mirror").
4. **[03:27]** Se desactiva el proportional editing, que había quedado activo sin querer y arrastraba otras caras.
5. **[04:29]** Se ajusta a la referencia en vértices (tecla 1) con G+X / G+Z, y se agregan loop cuts donde hace falta para que la silueta coincida (04:50, 05:11).
6. **[05:32]** En vista lateral (numpad 3) se mueven los vértices con G+Y hasta alinearlos con el dibujo lateral.
7. **[06:13]** Para el hueco del short se hacen dos loop cuts (uno hacia el centro arrastrado hasta la posición deseada, otro arriba para limitar el área), se seleccionan las caras y se borran.
8. **[07:15]** Se cierran los huecos con edge select (2): se selecciona un borde, Shift+clic en el otro, Ctrl+E → Bridge Edge Loops. Se repite en el otro lado.
9. **[08:11]** Torso: nuevo cubo, escalar y ubicar en vista frontal; con face select y extrusiones (E) más escalados (S) se sigue la forma de la prenda (08:38–09:41).
10. **[09:20]** Se extruye hacia arriba, se escala para el cuello del chaleco y se revisa en vista lateral, moviendo caras y vértices con G+Y (09:41–10:43).
11. **[10:43]** Loop cut extra para que las líneas coincidan; no hace falta que calce perfecto con el concepto.
12. **[11:04]** Se borra media malla con un loop cut central y se agrega Mirror. Se afinan vértices con G+X / G+Z (11:24).
13. **[12:06]** Se extruye la parte del cuello/cuello alto y se baja solo el vértice frontal con G+Z; se borran las caras sobrantes (12:27).
14. **[13:08]** Brazo: nuevo cubo, rotarlo (R) y escalarlo para que siga la diagonal del brazo en vista frontal.
15. **[13:29]** Loop cuts a lo largo del brazo y mover los vértices para encajar con la referencia (13:50–14:31).
16. **[14:52]** Revisar en 3D, escalar en Y (con A seleccionar todo, S, Y) para darle más volumen y desplazarlo con G+Y para evitar intersecciones.
17. **[15:54]** Mano: nuevo cubo, rotar, mover y alinear vértices en vista frontal; luego face select, seleccionar la cara y extruir con E (16:15–16:36).
18. **[16:57]** Sin X-ray, se fusionan vértices para que la mano converja en punta: dos vértices seleccionados, F3 → "merge" → Merge at Center, primero los delanteros y luego los traseros.
19. **[17:38]** Se reacomodan los vértices con X-ray, y en vista lateral se mueve la mano con G+Y (18:00). Se escala el brazo en Y de nuevo (18:20).
20. **[19:01]** Cuello: Shift+A → Mesh → Cylinder con 3 vértices y Cap Fill en "Nothing", se escala, se mueve con G+Z / G+Y y se ajusta en lateral.
21. **[19:43]** Se bajan los vértices inferiores para que el cuello quede escondido; con eso basta para este estilo.

## Lo que se ve en pantalla
- **[00:41]** Menú Add → Mesh con Plane, Cube, Circle, UV Sphere, Ico Sphere, Cylinder, Cone, Grid, Monkey, Torus, mientras se agrega el primer cubo para la cintura.
- **[01:02]** Se ve la reflexión de referencia (frente y perfil) con colores por parte: amarillo (torso), rojo (short), celeste (piernas), violeta (brazos), verde (botas).
- **[02:04]** Panel "Loop Cut and Slide" con Number of Cuts, Factor, Clamp, Mirror Editing y Correct UVs.
- **[02:46]** Menú de búsqueda (F3) para agregar el modificador: se escribe "mirr".
- **[03:06]** Panel del modificador Mirror: ejes X/Y/Z, Bisect, Flip, Mirror Object, Clipping, Merge (~0.001 m).
- **[03:27]** Panel de Move con Proportional Editing en modo Inverse Square; se ve activado antes de apagarlo.
- **[08:18]** El Outliner muestra varios objetos (Cube.001…Cube.008, Cylinder, Empty) y la vista frontal con la cintura espejada.
- **[17:17]** Búsqueda F3 con "merge" y las opciones: At Center, At Cursor, At First, At Last, By Distance, Collapse.
- **[19:01]** Panel "Add Cylinder" con Vertices 3, Cap Fill Type "Nothing", Generate UVs activado. Aparece una nota en pantalla: escalar en edit mode, no en object mode (cometió el error).
- **[20:24]** Pantalla final con botones de like/suscribirse.

## Consejos y advertencias
- **[01:31]** Usar Mirror cuando la parte es simétrica: ahorra trabajo y facilita el texturizado y el UV.
- **[03:34]** Si al mover una cara se arrastran otras, revisar el proportional editing (atajo O); puede activarse sin querer.
- **[02:16]** En edit mode, 1/2/3 cambian entre vértice, arista y cara.
- **[02:35]** Con X-ray activo, el borrado de caras elimina también las de atrás; sin X-ray solo las visibles.
- **[10:46]** No hace falta alinear perfectamente con los conceptos, basta con que se aproxime.
- **[14:02]** Las referencias laterales dibujadas pueden no tener sentido al pasar a 3D; sirven como guía de topología, pero hay que improvisar.
- **[16:38]** Para fusionar vértices conviene desactivar X-ray y seleccionar los visibles.
- **[20:04]** Para este estilo, un cuello de cilindro con 3 vértices alcanza, como en Mega Man Legends.
- **[19:01]** Escalar siempre en edit mode, no en object mode, para que el modelo no quede con escala aplicada al objeto.

## Lo que no queda claro
- Los valores numéricos exactos (escalas, posiciones, distancias) casi nunca se dictan; todo se ajusta a ojo contra la referencia.
- El "mml crashsune" del tema no aparece en el video; solo se menciona Mega Man Legends como inspiración del estilo.
- No se explica con detalle cómo se configuraron las imágenes de referencia ni cómo se obtuvo el dibujo de giro (turnaround).
- Algunas partes de la transcripción son imprecisas (por ejemplo "Love Chand out blend", "R left side"); el sentido se infiere del contexto.
