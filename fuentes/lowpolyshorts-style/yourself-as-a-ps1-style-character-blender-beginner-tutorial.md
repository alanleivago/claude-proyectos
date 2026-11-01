# YOURSELF as a PS1 Style Character | Blender Beginner Tutorial

- Link: https://www.youtube.com/watch?v=OjiwRIE21UA
- Canal: Stark Crafts
- Fecha: 2026-10-29
- Tema: lowpolyshorts-style

## De qué trata
Tutorial de Blender para modelar y texturizar una cabeza low poly al estilo PS1 a partir de fotos de una persona real. Se arma la geometría con unas 70 caras sobre referencias de frente y de perfil, se desenvuelven las UV pensando en una pixelación pareja y se proyectan las fotos con Texture Paint usando un stencil. Al final la textura se reduce a baja resolución para lograr el look retro. Está pensado para quien ya conoce lo básico de Blender y quiere convertirse a sí mismo o a otra persona en un personaje retro.

## Pasos / método
1. **[01:15]** Sacar las fotos de referencia: frente (la más importante, porque define rasgos y ojos), los dos perfiles (en este caso el pelo es asimétrico), la espalda y la parte superior de la cabeza para texturizar. La cámara debe estar a la altura de los ojos y lo más recta posible.
2. **[02:09]** Para modelar alcanzan dos fotos: frente y un perfil. Se elige el perfil donde la oreja se ve despejada.
3. **[02:20]** Borrar el cubo por defecto y activar el add-on "Add Mesh: Extra Objects" para tener disponible el Round Cube.
4. **[02:56]** Agregar un Round Cube con Radius 1 y Arc 2. Es la esfera low poly más simple y sirve de base para la cabeza y para cualquier forma orgánica.
5. **[03:42]** Cargar las referencias como Empty > Image. Primero va la del frente: se rota 90° y se nombra "ref". Después se duplica, se gira 90° en Z y se le cambia la imagen por la del perfil.
6. **[05:11]** Alinear las referencias. Se baja la opacidad para enderezar la foto con R y se iguala la escala entre frente y perfil tomando la nariz como guía. El centro de la cabeza se ubica en el agujero de la oreja. Después se separan las imágenes: el perfil hacia el costado (eje rojo) y el frente hacia atrás (eje verde).
7. **[07:27]** Ubicar el Round Cube dentro de la cabeza. En Edit Mode se activa X-Ray, se borra la mitad de las caras y se agrega un modificador Mirror con Clipping.
8. **[08:39]** En modo vértices, delinear el contorno de la cabeza de arriba hacia abajo. El peinado se incluye dentro del volumen de la cabeza.
9. **[10:04]** En vista lateral, llevar la frente hacia adelante, marcar dónde termina el pelo y dónde empieza el cuello, y bajar la parte de debajo de la oreja.
10. **[11:30]** Volver a la vista frontal para ajustar la mandíbula, la curvatura de la cara y una "línea de ojos". Cuando no coinciden las vistas, manda el frente.
11. **[13:33]** Agregar el volumen del pelo arriba sin exagerar. El loop superior debe quedar un poco por debajo de donde termina el pelo para facilitar el texturizado.
12. **[15:41]** Extruir el cuello dos veces con E. Como en la foto el cuello no está centrado, se improvisa para que se vea plausible y se lo prolonga un poco hacia la ropa. Después se borra la cara inferior.
13. **[18:21]** Revisar el conteo con Statistics: unas 68 caras para la cabeza. Vale la pena gastar polígonos en esta parte.
14. **[19:26]** Hacer la nariz como objeto aparte para trabajarla de forma independiente. Se agrega un cubo pequeño desde Object Mode, con un loop cut al medio, Mirror con Clipping, y se borra la cara trasera. Luego se modela una nariz recta en forma de cuña, con la vista frontal y overlay de wireframe.
15. **[24:19]** Unir cabeza y nariz con Ctrl+J antes del UV unwrap, para no tener trabajo extra después.
16. **[25:02]** Crear el material "Flo_Head" con una Image Texture nueva de 1024 px y guardarla en la carpeta de texturas. Se empieza en 1K y se reduce al final, porque al bajar desde 1K se conservan más detalles.
17. **[27:21]** Hacer el unwrap. Se prueba Smart UV Project y se revisa la distorsión con una textura de grilla de píxeles en interpolación Closest. Smart UV deforma la parte de arriba, así que se elige Cube Projection, que da píxeles más parejos.
18. **[30:15]** Acomodar las islas en la hoja de UV. Por regla de tercios, la cara ocupa alrededor de un tercio de la textura y queda espacio para el pelo.
19. **[32:22]** Usar el Knife para cortar en diagonal los quads que generan "pozos". No agrega geometría, solo divide el quad en triángulos, y elimina la deformación.
20. **[33:51]** Aplicar el Mirror para poder usar las dos mitades de la cara, ya que las cejas son asimétricas. En UV se separa una mitad, se espeja en X y se unen los vértices del centro con M > At Center. Se repite con la nariz para capturar sombras asimétricas.
21. **[36:43]** Para el pelo asimétrico, extruir un mechón lateral solo de un lado y desenvolverlo con UV Project, manteniendo la misma densidad de píxeles que el resto.
22. **[39:01]** Hacer un backup de la cabeza: se crea una colección "backup" con un duplicado oculto.
23. **[40:21]** En Texture Paint, crear una textura de pincel con la foto del frente y poner el mapeo en Stencil. Se usa "Image Aspect" o "Reset Transform" y se alinea la foto con la referencia de la escena.
24. **[42:18]** Para no pintar zonas que no corresponden, como el mechón lateral, ocultarlas con H en Edit Mode y activar la Paint Mask (máscara de caras). Alt+H las vuelve a mostrar.
25. **[43:21]** Rellenar primero la textura con un color base de piel y después proyectar la foto frontal.
26. **[44:19]** Corregir la nariz, que se pinta mal porque la geometría oculta tapa partes. Se selecciona la nariz con L, se oculta, se pinta el resto, y luego se aísla la nariz para pintarla sola.
27. **[46:48]** Cambiar el stencil a la foto del perfil, realinearlo y pintar los costados. Después se repite con el resto de las fotos: atrás, el otro perfil y arriba.
28. **[48:35]** Aplicar Shade Smooth y disimular las costuras con Soften y Smear, o repintar desde un ángulo con opacidad reducida.
29. **[50:25]** Quitar el stencil con X en las propiedades de textura y guardar la versión 1K como respaldo.
30. **[51:30]** Ir a Image > Resize. Un personaje PS1 completo usaba 256×256, así que para la cara sola conviene la mitad o menos. Se guarda con un sufijo de tamaño. Se prueba 64×64 (muy Metal Gear), pero el autor elige una resolución intermedia para conservar detalle.
31. **[53:42]** Retocar las costuras que aparecen con la baja resolución usando Soften con toques suaves.

## Lo que se ve en pantalla
- **[02:49]** Panel "Add Round Cube": Radius 1, Arc Divisions 2, Type Corners.
- **[03:46]** Empty Image: Display As Image, Size 5 m, Offset X/Y -0.50, Depth Default, Side Both, Show in Orthographic y Perspective, slider de Opacity.
- **[04:43]** Transform de la referencia: Rotation X 90°, Z 90° (vista lateral).
- **[08:29]** Modificador Mirror con eje X, Clipping activado y Merge 0.001 m.
- **[18:52]** Overlay de Statistics en el viewport (Faces 17 / Triangles 34 en la mitad visible).
- **[25:29]** Diálogo New Image: Name Flo_Head, 1024×1024 px, Generated Type Blank, Alpha marcado.
- **[27:22]** Panel Smart UV Project: Angle Limit 66°, Island Margin, Correct Aspect.
- **[28:18]** Textura de grilla (PixelGrid) con interpolación Closest para chequear distorsión.
- **[34:55]** Menú Merge en UV Editor: "At Center".
- **[40:35]** Propiedades de la textura del pincel: Mapping Stencil, botones "Image Aspect" y "Reset Transform".
- **[41:31]** El stencil se rota con Ctrl+clic derecho y se escala con Shift+clic derecho.
- **[43:24]** Herramienta Fill con color piel y Paint Mask activada en el header de Texture Paint.
- **[47:11]** Texto en pantalla: hay que usar todas las fotos y pintar todos los lados con lo aprendido.
- **[48:08]** Resultado intermedio con todas las caras pintadas y Shade Smooth.
- **[50:58]** Herramientas Smear (Shift+Spacebar, 3) y Soften en la barra lateral.
- **[51:54]** Textura reducida a muy baja resolución con pixelado fuerte en la cara.

## Consejos y advertencias
- **[01:35]** Fotografiá a la altura de los ojos y bien de frente. La próxima vez el autor usaría la grilla del celular para facilitar el enderezado **[05:44]**.
- **[07:02]** La escala igual entre frente y perfil es clave. Tomate tiempo, porque si no se arruinan las proporciones.
- **[12:15]** Ante conflictos entre vistas, priorizá siempre el frente.
- **[13:44]** No exageres el volumen del pelo arriba. Dejá el loop debajo del final del pelo.
- **[17:38]** En el cuello priorizá que la geometría se vea bien, por encima de la fidelidad a la foto.
- **[18:55]** La nariz es opcional, aunque muchos personajes PS1 la tenían (Lara Croft, Snake, Silent Hill).
- **[29:52]** Si texturizás con colores planos, la distorsión UV no importa. Con texturas pixeladas sí, porque necesitás píxeles rectos.
- **[36:24]** Duplicar las mitades de la cara gasta espacio de textura, pero compensa en detalle y asimetría.
- **[39:07]** Hacé el backup antes de agregar geometría nueva. El autor lo hizo tarde.
- **[40:01]** Si entrás a Texture Paint sin seleccionar todo en Edit Mode, no vas a ver la textura.
- **[43:04]** Ocultar caras no alcanza para evitar pintarlas: hay que activar la Paint Mask.
- **[44:35]** Las manchas raras suelen venir de geometría oculta que tapa la proyección. Se corrigen pintando por partes o con Soften y Smear.
- **[51:21]** Usá Soften para las costuras y Smear con moderación, para no perder detalle. Conservá siempre la versión 1K.

## Lo que no queda claro
- El tamaño final dicho como "228×228" no es potencia de dos. Probablemente sea 128×128; conviene verificarlo en el video.
- **[27:50]** Se menciona subir el Island Margin a 3, pero en pantalla se ve en 0.000 y al final se usa Cube Projection. No se sabe qué margen quedó.
- No se explica cómo crear o conseguir la textura PixelGrid; solo se la carga.
- La rotación exacta de los empties de referencia es confusa en el audio (Y 90 / Z 90).
- La texturización de atrás, el otro perfil y arriba se resume con un texto en pantalla **[47:11]** sin mostrar el proceso.
- No se muestra cómo se guarda la textura de la nariz ni el mapeo exacto del mechón lateral.
- No se aclara si el escalado del objeto (0.025 en pantalla) se aplicó antes del unwrap.
