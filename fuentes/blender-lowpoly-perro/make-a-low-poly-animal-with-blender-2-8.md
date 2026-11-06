# Make a Low Poly Animal with Blender 2.8

- Link: https://www.youtube.com/watch?v=_ICUvZ41-e0
- Canal: John Flynn
- Fecha: 2026-11-04
- Tema: blender-lowpoly-perro

## De qué trata
Tutorial para principiantes de Blender 2.8 sobre cómo modelar un animal low poly (un perro labrador) a partir de una foto de referencia lateral. Se modela solo la mitad del cuerpo y el modificador Mirror genera la otra. Cubre organización de carpetas, modelado básico, desenvolvimiento UV, pintura de textura, iluminación y render, y termina con una imagen renderizada del perro en color marrón sobre un suelo.

## Pasos / método
1. **[00:46]** Organizar carpetas del proyecto: imágenes de referencia, renders, texturas, proyecto de video, documentos. Las texturas deben quedar en un solo lugar, con un nombre fijo, sin moverlas ni renombrarlas, porque si no se rompe el vínculo.
2. **[01:57]** Borrar el cubo inicial (Option+A para deseleccionar, clic en el cubo, X > Delete) y pasar a vista ortográfica lateral (clic en el eje X rojo del gizmo).
3. **[02:35]** Elegir una buena referencia: animal de costado, patas juntas, cabeza mirando a un lado. Ver el sitio de la AKC con el labrador (02:39).
4. **[03:32]** En modo Objeto, arrastrar la imagen a la escena, renombrarla como referencia y escalarla con S.
5. **[04:26]** Shift+A > Plane con "Align to View". Como queda en el mismo plano que la imagen y parpadea, moverla con G X para separarla un poco.
6. **[05:19]** Renombrar el plano a "Dog" y entrar en Edit Mode con Tab.
7. **[06:12]** Con vértices, mover uno a la axila y otro arriba. Seleccionar con Shift y extruir (E) el borde a lo largo del cuerpo, manteniendo las líneas rectas de lado a lado.
8. **[07:05]** Seguir extruyendo, espaciar los vértices con G G (deslizan solo por la arista) y hacer que las líneas empiecen y terminen donde empiezan y terminan los miembros.
9. **[07:58]** Escalar (S) y rotar (R) las secciones al llegar al cuello y la cabeza. Dejar dos secciones de la cabeza donde saldrá la oreja.
10. **[10:38]** Seleccionar todo (A), extruir hacia un lado (aprox. la mitad del ancho del perro) y añadir el modificador Mirror (llave inglesa > Add Modifier > Generate > Mirror), con Clipping activado.
11. **[12:21]** Loop cut (Ctrl+R) en el centro del cuerpo para tener un hueco entre las patas. Seleccionar las caras y extruir hacia abajo las patas traseras y la delantera.
12. **[13:18]** Modelar cada pata con ciclos de extruir, G, R, S. Usar wireframe (Z) para seleccionar vértices de ambos lados.
13. **[15:04]** Ensanchar las patas desde el frente con S X, porque quedan demasiado finas. Usar edición proporcional (O).
14. **[17:44]** Cola: loop cut, achicar la cara con G G, extruir, escalar sin el eje X (Shift+X) y añadir loops para darle volumen.
15. **[21:17]** Cara: bajar el corte para alinearlo con la mandíbula, extruir la mandíbula inferior por separado y ajustar con edición proporcional.
16. **[23:56]** Redondear en modo arista: seleccionar el lomo con Ctrl+clic para tomar toda la fila conectada y usar G Z / G X para dar curvatura.
17. **[25:43]** Oreja: extruir caras en la cabeza, bajarla por gravedad, rotar y escalar. Comprobar desde otros ángulos que no quedó metida en la cabeza.
18. **[28:23]** Arrastrar la segunda referencia (vista frontal) en modo Objeto y ajustar la cabeza y la mandíbula.
19. **[33:42]** Adelgazar el cuello con Option+clic (loop) y S X, luego G X. Dar volumen a la cadera y afinar la cola.
20. **[35:23]** Opcional: modificador Subdivision Surface. Si da problemas, borrar las caras internas del plano central.
21. **[37:15]** Desenvolver UV: seleccionar todo, U > Smart UV Project con Island Margin pequeño, y pasar al espacio Texture Paint.
22. **[38:01]** Crear una imagen nueva ("dog texture"), con tamaño ×3 (3K) y un color base marrón. Guardarla en la carpeta de texturas (Image > Save As).
23. **[40:11]** En Shading: Material New, Shift+A > buscar Image Texture, conectar el punto amarillo (Color) a Base Color y elegir la textura.
24. **[41:23]** Pintar en Texture Paint: ojos, zonas oscuras y claras con la fuerza (strength) baja. Guardar la imagen con frecuencia para no perder la pintura.
25. **[44:57]** Iluminación y cámara: vista Rendered, tecla N > View > "Lock Camera to View" para encuadrar y luego desactivarlo.
26. **[46:11]** Sistema de tres luces con luces Sun a 45° (Shift+A > Light > Sun), una frontal y otra trasera (duplicada con Shift+D). Ajustar la fuerza en el icono verde de la bombilla.
27. **[48:11]** Suelo: Shift+A > Mesh > Circle, Fill (F), Inset (I), escalar el borde exterior y bajar con G Z. Rotar el suelo (no el perro) para que las patas lo toquen.
28. **[50:05]** Ocultar las imágenes de referencia (ojo en el outliner), escalar el suelo ×5 y comprobar la sombra.
29. **[50:47]** Configurar el render (motor EEVEE, resolución 1080 al 100%, PNG, carpeta de salida en Renders) y renderizar con F12 (Render > Render Image).
30. **[52:31]** Guardar el render con Image > Save As en la carpeta Renders, porque no se guarda solo en una imagen fija.

## Lo que se ve en pantalla
- **[00:00]** Resultado final: perro low poly gris con Mirror activo, con la referencia detrás en un plano; el modificador muestra Clipping, Merge y Vertex Groups activos.
- **[02:39]** Página de la AKC (Labrador Retriever) con la foto lateral usada como referencia.
- **[03:32]** El plano de referencia se llama "Reference Picture Side View", con rotación X 90° y Z 90°.
- **[04:26]** Panel "Add Plane" con Align: View.
- **[10:38]** Menú Add Modifier: Mirror está en la columna Generate. Hay que activar Clipping.
- **[37:15]** Pestaña Texture Paint con el mapa UV a la izquierda y el perro en morado (sin textura conectada).
- **[39:54]** Espacio Shading: nodo Principled BSDF, nodo Image Texture conectado y texturas guardadas en la carpeta.
- **[45:14]** Panel N > View con "Lock Camera to View".
- **[51:26]** Pestañas de Output: resolución 1080, 100%, formato PNG.

## Consejos y advertencias
- **[01:37]** No mover ni renombrar las texturas una vez usadas.
- **[09:11]** No rotar demasiado: la malla se puede dar vuelta (inside out) y se ve oscura.
- **[11:20]** Si Mirror no refleja bien, es porque se movió el origen del objeto y habrá que empezar de nuevo.
- **[13:25]** Sin wireframe (Z), un clic en modo sólido solo agarra la arista visible y no la de atrás.
- **[14:11]** Escalar con S achica en todos los ejes, por eso las patas quedan finas y hay que ensancharlas con S X.
- **[15:48]** La edición proporcional (O) puede mover vértices que no querés: apagarla cuando afecte la mandíbula (22:25).
- **[28:23]** Mirar el modelo desde varios ángulos para no meter piezas dentro de la cabeza.
- **[32:03]** Elegir un animal que conozcas bien, o la frustración será mayor.
- **[38:01]** Darle a la textura un nombre descriptivo. Guardar la imagen (Image > Save) además del archivo .blend: son dos archivos separados.
- **[42:01]** Se recomienda una tableta gráfica en vez del mouse para pintar.
- **[47:37]** No exagerar la fuerza de la luz, porque se sobreexpone.
- **[52:39]** No guardar el render sobre la carpeta de texturas.

## Lo que no queda claro
- Entre [10:38] y [12:25] no se explica con precisión cómo quedó el eje Mirror en X (se vio que al principio refleja en el eje incorrecto).
- Los valores exactos de las dimensiones, escala y cantidad de loop cuts no se dan; todo se hace "a ojo".
- Algunas partes de la edición (por ejemplo [34:35]–[35:23], el borrado de caras internas con Subsurf) se mencionan como hechas fuera de cámara.
- El tutorial no explica cómo aplicar el modificador Mirror para pintar cada lado distinto (solo lo menciona en [42:21]).
- La parte del video con el panel del "Shortcut VUr" es un addon de teclas en pantalla, no es parte del método.
