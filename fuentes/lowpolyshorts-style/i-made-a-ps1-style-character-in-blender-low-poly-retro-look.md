# I Made a PS1-Style Character in Blender (Low Poly Retro Look)

- Link: https://www.youtube.com/watch?v=GOmAvPOrAwE
- Canal: TomGrave3D
- Fecha: 2026-10-29
- Tema: lowpolyshorts-style

## De qué trata
El video muestra cómo crear un personaje low poly al estilo PS1 en Blender, desde el diseño en 2D hasta el render pixelado. Está pensado para quien ya tiene nociones básicas de Blender: modelado, UV y nodos. El personaje se arma con piezas rígidas separadas, lleva una textura pintada o fotográfica de baja resolución, un sombreado plano con oclusión ambiental y un compositor que pixela la imagen final.

## Pasos / método
1. **[00:22]** Estudiar modelos clásicos en sitios como The Models Resource para entender cómo se construían. Los personajes de PS1 eran piezas simples y separadas por cada parte del cuerpo, no una malla continua.
2. **[01:04]** Observar que en Resident Evil y Silent Hill los modelos están en una pose de reposo natural, no en T ni en A. Modelar así ayuda a cuidar la silueta y las proporciones. Los brazos se acomodan más tarde, antes del rigging.
3. **[01:30]** Dibujar el diseño propio con vista frontal y lateral. El autor toma como base las proporciones femeninas de Resident Evil y usa la moda y el peinado para reforzar lo retro. Después exporta cada vista como imagen separada.
4. **[01:50]** En Blender, importar la referencia frontal desde la vista frontal y la lateral desde la vista derecha. Apoyar los pies sobre el piso de la grilla, hacer que cada imagen se vea solo por delante y alejarlas para tener espacio.
5. **[02:12]** Crear dos colecciones: "ref" para las imágenes y "geo" para el modelado.
6. **[02:19]** Agregar un cubo y apoyarlo en el piso con G Z más Ctrl. Subir sus vértices superiores a unos 1,6 m (la altura del personaje) y escalar las referencias para que coincidan.
7. **[02:42]** Achicar ese cubo para usarlo de cabeza. Agregar un loop cut central, borrar una mitad y poner un modificador Mirror.
8. **[03:03]** Duplicar el cubo para el torso y las caderas. Cancelar el movimiento con clic derecho y mover la copia solo en Edit Mode, así el mirror sigue funcionando. Cada parte queda como objeto separado.
9. **[03:30]** Modelar cabeza y cuello como un solo objeto, con la menor cantidad posible de loop cuts:
   - extruir caras para la nariz y la frente;
   - fusionar vértices para simplificar;
   - extruir una cara lateral para la oreja.
10. **[04:09]** Bloquear el pecho y la cadera comparando siempre la vista frontal y la lateral.
11. **[04:33]** Hacer las extremidades duplicando cubos en este orden:
    - brazo, luego antebrazo, luego mano (sin dedos, solo con el pulgar extruido);
    - muslo, luego pantorrilla, luego pie.
12. **[05:45]** Agregar loop cuts y redondear las piezas para que sean menos cúbicas. Este paso es opcional si se quiere un look más tosco, por ejemplo con cubos rotados 45°.
13. **[06:14]** Modelar la manga de la campera a partir del brazo. Para el pelo, extruir caras de la cabeza y luego mechones hacia abajo.
14. **[06:45]** Hacer la campera con la misma técnica de extrusión de caras y armar un cuello simple, que más adelante se rehace.
15. **[07:12]** Simplificar la malla:
    - borrar las caras ocultas, como la espalda bajo la campera, y unir los bordes con bridge;
    - redondear las zonas donde las piezas se superponen, para que no aparezcan huecos al doblar las articulaciones.
16. **[07:59]** Hacer el UV unwrapping con una textura de grilla de colores:
    - project from view, luego marcar seams y luego unwrap;
    - la cara se proyecta desde la vista frontal para que quede plana;
    - darle más tamaño a la cara y menos a las zonas sin detalle.
17. **[08:52]** Para torso y extremidades:
    - separar las zonas que llevarán texturas distintas, como la campera, el cuerpo y el interior;
    - tratar brazos y piernas como cilindros cortados por el lado interno.
18. **[09:23]** Enderezar las islas tipo grilla:
    - tomar una cara como quad activo y escalar sus bordes a 0 en Y y en X;
    - seleccionar la isla con L y aplicar "Follow Active Quads".
19. **[10:44]** Acomodar todas las islas con Pack Islands dentro de una región personalizada y luego encajar todo en el cuadrado UV.
20. **[11:14]** Reemplazar la grilla por una imagen en blanco, por ejemplo de 256×256, o una más grande que después se comprime. Rellenar los colores base y planificar los rasgos de la cara.
21. **[11:56]** Previsualizar el pixelado con nodos y cambiar el Principled BSDF por un Emission para lograr un look plano.
22. **[12:47]** Guardar la textura y editarla en un programa de dibujo con capas. Se puede usar un PSD como textura y recargarlo con Alt+R.
23. **[13:22]** Agregar un sombreado básico con oclusión ambiental pasada por un Color Ramp, que controla el factor de un Mix Color.
24. **[13:43]** Reemplazar la cara dibujada por una foto:
    - escalarla y extenderla con clonar o smear;
    - suavizar con blur;
    - agrandar los ojos con liquify.
25. **[14:15]** Rehacer el cuello de la campera editando la geometría y volver a hacer el UV solo de esa zona. Por suerte había espacio libre en el atlas.
26. **[15:19]** Pintar las texturas: pelo a mano con blur, arrugas en la campera, cinturón en el pantalón, sombras en cabeza y cuerpo. La técnica es pincel duro seguido de smear o blur.
27. **[16:37]** Pixelar más la textura bajando la resolución o usando mosaico. También se puede sumar ruido, dithering o tramas, y la cara puede ir en una capa propia con mosaico.
28. **[17:07]** Rotar los brazos a pose A antes del rigging, que se hace con Rigify y no se explica acá.
29. **[17:18]** Configurar el render: EEVEE, film filter bajo y compositor con dos Scale y un Pixelate en el medio.

## Lo que se ve en pantalla
- **[00:18]** Sitio The Models Resource, sección PlayStation, con un modelo de Mega Man Legends como ejemplo.
- **[00:54]–[01:12]** Modelos de Chris y Jill (Resident Evil) en pose relajada. En Jill se ve el wireframe de piezas separadas y un modificador Mirror.
- **[01:30]** Hoja de referencia dibujada en un programa tipo Clip Studio Paint: vista frontal, lateral y brazo aparte.
- **[02:06]** Las referencias son Empties de tipo imagen. Se usa la opción "Show In" para mostrarlas solo de frente; también se ven Opacity y Depth.
- **[03:00]** Modificador Mirror en eje X con Clipping activado y merge en 0,001 m.
- **[03:36], [05:06]** Uso de Alt+Z (X-ray) para modelar sobre la referencia, y atajos en pantalla: Ctrl+R (loop cut), Tab, Shift+D.
- **[06:18]** En el outliner, cada pieza es un objeto con su propio mirror: calf, feet, forearm, hand, head, hips, thigh, torso, upperarm.
- **[07:48]** Ejemplo de otro personaje con UV completos y la textura de grilla con letras y números.
- **[10:49]** Diálogo Pack Islands con Shape Method "Exact Shape (Concave)", Scale y Rotate activados, margin method Scaled, margin 0,1 y "Pack to: Custom Region". La región se define con Ctrl+B en el editor UV.
- **[11:25]** Workspace Texture Paint con pincel "Paint Hard" y el atlas UV completo.
- **[12:19]** Árbol de nodos: Texture Coordinate → Mapping → Voronoi Texture (randomness 0, Position al Vector de la imagen) → Image Texture. Se arma con Ctrl+T de Node Wrangler.
- **[12:37]** Shader Emission conectado al Material Output, y guardado de la imagen como PNG.
- **[13:31]** Nodo Ambient Occlusion → Color Ramp (negro y blanco invertidos) → factor de un Mix Color, con la entrada B en color oscuro.
- **[13:49]** Foto de una cara real pegada en el atlas, editada en el programa 2D junto al viewport de Blender.
- **[14:07]–[14:43]** Edición del cuello de la campera, con seams en rojo.
- **[16:49]** Panel de efectos del programa 2D: mosaico y ruido sobre la textura final.
- **[17:07]** Panel de render: EEVEE, Filter Size (film) y Transparent.
- **[17:25]** Compositor: Render Layers → Scale (Relative, X/Y 0,5) → Pixelate → Scale (Relative, X/Y 2) → Group Output y Viewer.
- **[17:43]** Resultado final riggeado, caminando.

## Consejos y advertencias
- **[00:13]** Diseñar un personaje propio en lugar de copiar el del video; es más gratificante.
- **[01:35]** La ropa y el peinado ayudan mucho a que el personaje se lea como retro.
- **[03:12]** No mover las piezas en Object Mode, porque rompe el mirror. Al duplicar, cancelar con clic derecho y mover en Edit Mode.
- **[03:24]** Trabajar cada parte como objeto separado facilita el proceso.
- **[06:29]** El pelo fue de lo que más tiempo llevó; esperá rehacerlo varias veces.
- **[07:29]** Redondear las uniones entre piezas evita huecos al doblar articulaciones.
- **[08:28]** Usar la grilla de colores para detectar estiramientos y distorsión.
- **[09:50]** Error propio del autor: en la cadera convenía marcar seams arriba y abajo para un mejor resultado.
- **[10:01]** Ir moviendo cada pieza a un costado después de unwrapear; al final igual hay que reacomodar todo.
- **[12:27]** Con texturas pixel art o de baja resolución, cambiar la interpolación de la imagen de Linear a Closest para bordes duros.
- **[12:44]** No olvidar guardar la textura.
- **[13:10]** Si la textura es un PSD y necesitás pintar en Blender, trabajá sobre una copia y después reimportala al PSD.
- **[13:56]** No preocuparse por desprolijidades en la textura: el pixelado las tapa.
- **[14:06]** Agrandar los ojos ayuda a reducir el efecto "uncanny" de una cara fotográfica.
- **[14:19]** Si agregás o borrás geometría después del UV, tenés que rehacer los UV de esa zona. Dejar espacio libre en el atlas te ahorra re-texturizar.

## Lo que no queda claro
- **[02:21]** La transcripción dice "Add & Mode"; se refiere a Edit Mode.
- **[12:24]** No se da el valor exacto de escala del Voronoi para el pixelado.
- **[17:25]** No se da el tamaño del nodo Pixelate.
- **[17:22]** El autor dice filter size 0,01, pero en pantalla se lee un valor distinto (≈1,50 px) antes del cambio; conviene verificarlo.
- **[17:22]** No se muestra dónde se activa el compositor en el viewport (opción Viewport Shading > Compositor, según la versión de Blender).
- **[12:47]** No se nombra el programa 2D usado, aunque parece Clip Studio Paint.
- **[11:24]** No se dice qué resolución final tuvo la textura.
- **[13:43]** No se aclara de dónde sale la foto de la cara ni si tiene restricciones de uso.
- **[17:07]** La rotación a pose A y el rigging de piezas separadas se saltean: no se explica cómo se pesan las piezas rígidas a los huesos ni si se aplican los mirrors. Se remite a otro video de Rigify.
- **[15:40]–[15:54]** La transcripción repite el tramo del pincel duro, el smear y el cinturón; parece un error de transcripción.
