# https://www.instagram.com/reel/DfIBNmCNewZ/

- Link: https://www.instagram.com/reel/DfIBNmCNewZ/
- Fecha: 2026-11-01
- Tema: blender-lowpoly

## De qué trata
El video muestra un flujo de trabajo para crear modelos 3D low-poly con estética PS1 (principios de los 2000) sin saber modelar. Se parte de una sola foto de un objeto real (el ejemplo es una botella de Pepsi Blue), Claude escribe un script de Python y Blender lo ejecuta. Está pensado para quien quiere ese look retro pero siente que el modelado 3D está fuera de su alcance. El resultado es un modelo texturizado con aspecto PS1, más un render turntable y una animación idle. Al final el autor ofrece una guía si se comenta "BLENDER".

## Pasos / método
1. **[00:13]** Conseguir una foto clara del objeto real. Es la única entrada y de ella salen la forma y la textura.
2. **[00:15]** Dársela a Claude y pedirle un modelo low-poly estilo PS1 en Blender.
3. **[00:19]** Claude genera un script de Python y se ejecuta en Blender.
4. **[00:21]** El script lee la silueta/forma desde la foto y construye una malla simple (de pocos polígonos).
5. **[00:23]** Se proyecta la propia foto sobre la malla como textura.
6. **[00:26]** Se reduce mucho la resolución de la textura (efecto pixelado típico de la época).
7. **[00:28]** Se recorta la paleta de colores, imitando las limitaciones de las consolas viejas.
8. **[00:30]** Se añade jitter a los vértices, como el temblor de los modelos PS1.
9. **[00:33]** Se renderiza un turntable (giro del objeto) y un loop de idle.
10. **[00:35]** Si algo sale mal (por ejemplo, una caja demasiado cuadrada), se le dice a Claude y corrige el script.

## Lo que se ve en pantalla
- **[00:16]–[00:18]** Editor de texto de Blender (pestañas Texture Paint, Shading, Animation, Rendering) con una función `loft_from_meta(meta, name=None)`. Lee del diccionario `meta` las claves `rows`, `sides`, `cross` y `proj`. Calcula zmin/zmax a partir de las filas y el ancho y alto en píxeles desde `proj` (x0, x1, y0, y1). Es decir, hace un "loft" de secciones transversales por filas a lo largo del eje Z.
- **[00:20]** Viewport 3D de Blender en Object Mode con la botella texturizada y, abajo, un editor de imagen con un archivo llamado `pepsi_blue_2004_…`.
- **[00:22]** Wireframe naranja sobre la botella: malla en anillos horizontales con pocas divisiones verticales.
- **[00:24]** La malla sin textura (gris), con el tapón azul separado.
- **[00:12]–[00:14]** Foto original recortada sobre fondo negro.
- **[00:26]–[00:30]** Comparación del efecto: la textura pixelada y de colores limitados, ejemplificada con la botella Heinz y la de Sobe.
- **[00:36]–[00:38]** Caja de Hershey's Swoops: la vista lateral muestra un panel mal proyectado o estirado, ejemplo del tipo de error a corregir.
- **[00:04]–[00:08]** Escena de cuarto de Halloween con posters y luces, vista en low-poly.
- **[00:42]** Pantalla "Select your player – Halloween Night 2001" con tres personajes disfrazados (alien, vampiro, astronauta) y stats de Style, Flow y Vibe.
- **[00:44]–[00:48]** Llamada a la acción: comentar "BLENDER" para recibir la guía.

## Consejos y advertencias
- **[00:13]** Usar una foto clara del objeto; la calidad de la entrada determina forma y textura.
- **[00:35]** Iterar con Claude: describir el defecto (p. ej. forma demasiado cuadrada) para que ajuste el script en lugar de rehacerlo todo.
- **[00:39]** El método sirve para otros objetos: Doritos, Heinz, Sobe y personajes con disfraces de Halloween.

## Lo que no queda claro
- No se explica cómo ejecutar el script en Blender (pegarlo en el editor de texto y correrlo, supuestamente).
- No se indica la resolución de textura ni el número de colores, ni cómo se logra el jitter (shader, modificador o script).
- No se muestra el prompt exacto ni cómo se pasa la metadata (`meta`) desde la foto: se ignora cómo se extrae la silueta.
- No se detalla cómo se crearon los personajes ni la escena; el audio no menciona el cuarto de Halloween.
- Las herramientas de render y animación (idle, turntable) no se especifican.
- Los detalles completos están en una guía que solo se obtiene comentando "BLENDER".
- En el audio se dice "Doritos 3D", pero la caja mostrada es Hershey's Swoops; la transcripción puede estar mal o haberse mezclado el ejemplo.

## Guía del autor (vlvt-blender-guide.vercel.app), resumen con valores
- Método: no se modela a mano. Claude escribe un script Python que corre en Blender (`blender -b -P script.py`) y se itera comparando el render con la foto.
- Referencia: 1 foto frontal del objeto completo, fondo liso, sin manos ni ángulo. Personajes: hoja T-pose frente + espalda, brazos rectos y separados, fondo verde o magenta plano.
- Malla: forma base (botella, lata, caja, bolsa, persona). Objetos redondos de 6 a 12 lados (más de 12 se ve moderno). El script mide el ancho de la silueta por cada altura (filas), hace un loft de anillos, desenvuelve UV y proyecta la foto. Las cajas usan la cara frontal y lateral de la foto.
- Personajes: bloques (cabeza, torso, brazos, piernas), vista frontal proyectada adelante y trasera atrás, croma del fondo, rig simple + idle en loop.
- Look PS1: textura de 64 a 512 px (prompt: 128), paleta de unos 32 colores, filtro nearest, snapping de vértices a una grilla baja, warping afín de textura, render a 270 px de alto y escalado ×4 con dither ordenado 4x4.
- Render: turntable de 200 frames a 30 fps sobre negro (MP4 + PNG).
- Revisión "de director": render desde el ángulo de la foto, al lado de la foto. Primero la silueta y después la textura. Pedir un solo arreglo concreto por vez y volver a renderizar desde el mismo ángulo.
- Errores: fotos en ángulo o con manos, collages, brazos pegados al cuerpo, fondos cargados, feedback vago, saltarse la comparación, dejar el filtrado suave.
