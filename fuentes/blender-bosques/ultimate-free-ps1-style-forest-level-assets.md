# Ultimate FREE PS1 Style Forest LEVEL Assets

- Link: https://www.youtube.com/watch?v=g_RgKRnuMNQ
- Canal: Stark Crafts
- Fecha: 2026-10-30
- Tema: blender-bosques

## De qué trata
Tutorial de Stark Crafts sobre cómo usar en Blender su colección gratuita de assets de bosque al estilo PS1 (árboles, rocas, hierba, lavanda, troncos, piñas y texturas de suelo sin costuras). Explica cómo importar el FBX, recuperar la pixelación nítida de las texturas y armar un terreno con suelo mezclado y árboles duplicados. Está pensado para quien quiera montar rápido un bosque low-poly retro, ya sea para un juego de terror o para algo luminoso. Al final se muestra un timelapse y un showreel con escenas terminadas.

## Pasos / método
1. **[00:42]** Crear una colección nueva y mover a ella o ocultar (H) el cubo, la luz y la cámara, para trabajar sin estorbos.
2. **[00:56]** Seleccionar la colección nueva e ir a File > Import > FBX; elegir el archivo FBX de la colección e importarlo.
3. **[01:25]** Activar el modo Material Preview para ver las texturas.
4. **[01:39]** Revisar un árbol de cerca: las hojas se ven borrosas por el filtrado lineal, y se quiere recuperar la pixelación nítida.
5. **[01:53]** Aislar un árbol (el Tree 2): seleccionar todo, ocultar con H y volver a mostrar solo ese; zoom con punto (.) del teclado numérico.
6. **[02:22]** En Material Properties hay dos materiales (tronco y copa). En el del tronco, en el nodo de imagen de Base Color, cambiar la interpolación de Linear a Closest.
7. **[02:50]** Repetir en el material de la copa: Base Color de Linear a Closest.
8. **[03:04]** Bajar a Alpha y también poner su interpolación en Closest para que la transparencia quede pixelada.
9. **[03:19]** En Settings, cambiar Blend Mode de Alpha Blend a Alpha Clip, porque Alpha Blend causa la deformación rara de las hojas.
10. **[03:36]** Repetir el proceso en todos los materiales, sobre todo en los transparentes.
11. **[04:05]** Reubicar los assets en el centro: seleccionar uno y pulsar Alt+G, que resetea la ubicación a 0,0,0. Con A se seleccionan todos para centrarlos juntos.
12. **[04:58]** Ocultar todo con H y traer solo lo necesario; con el punto del numpad se encuadra y orbita sobre lo seleccionado.
13. **[06:09]** Crear una colección nueva y agregar un plano (Shift+A > Mesh > Plane), escalado a unos 10×10 (20 m de lado).
14. **[06:38]** Crear un material nuevo para el plano, bajar Specular y subir Roughness. Agregar un Image Texture en Base Color.
15. **[06:52]** Abrir la carpeta de texturas de suelo (PSX Forest Ground Tex) y elegir una. Hay variantes de musgo oscuro, bosque claro, tréboles, corteza y tierra seca.
16. **[07:49]** Cambiar la textura a Closest para que quede pixelada.
17. **[08:03]** Traer un árbol para tener escala de referencia.
18. **[08:17]** Ir al espacio UV Editing, con el plano seleccionado en modo edición pulsar A y luego S para escalar los UV hacia arriba; comprobar en Material Preview hasta que el patrón se vea bien.
19. **[08:46]** Duplicar el plano (Shift+D, clic) y crear una copia del material con New Material; asignar otra textura de suelo al segundo plano.
20. **[09:14]** En modo edición (Tab), subdividir con clic derecho > Subdivide dos veces.
21. **[09:29]** Seleccionar vértices y moverlos con G hacia arriba o abajo para crear relieve, de modo que ambos planos se mezclen.
22. **[09:57]** Probar otra textura (los tréboles) y volver a modo objeto con Tab.
23. **[10:25]** Seleccionar un árbol, duplicar con Shift+D, mover, escalar y rotar para variar.
24. **[10:54]** Repetir con árboles, rocas, hierba, lavanda, troncos y piñas hasta componer la escena (11:08–12:19).

## Lo que se ve en pantalla
- **[00:14]** Índice del video: cómo usar (0:30) y timelapse/showreel (10:41). Descarga gratuita en starkcrafts.com.
- **[00:56]** Ruta del menú: File > Import > FBX.
- **[01:11]** Al importar, los objetos aparecen en la colección con nombres tipo PSX_Tree1, PSX_Rock, PSX_Grass, PSX_Lavender, PSX_Dandelion, PSX_PineCone, PSX_Treetrunk y PSX_Reed.
- **[02:22]** Árbol 2: materiales "Tree2" y "TreeCrown2" en la pestaña de materiales; textura de corteza PSX_Bark5_128px.png.
- **[03:04]** Panel Settings del material: Blend Mode (Alpha Blend → Alpha Clip), Shadow Mode, Clip Threshold (aprox. 0,5 visible en 03:33) y Show Backface activado.
- **[03:47]** El panel lateral (N) muestra Location, Rotation, Scale y Dimensions para comprobar la posición tras Alt+G.
- **[06:24]** El plano tiene escala 10 en X, Y y Z y dimensiones de 20 m.
- **[07:06]** El navegador de archivos muestra 7 texturas de suelo (PSX_Seamless_..._128px.png) en la carpeta PSX_ForestGround_Tex.
- **[08:17]** En UV Editing, la textura se ve como un cuadrado pequeño dentro de la malla; se escala con S.
- **[09:14]** Tras subdividir, el relieve se hace moviendo vértices; entre 09:29 y 09:43 se ve cómo se mezclan dos suelos.
- **[10:25]** El árbol duplicado queda como PSX_Tree1.001 en la colección 2.
- **[12:33–13:30]** Resultados finales: escenas de día, atardecer y noche con luna, nieve y niebla.

## Consejos y advertencias
- **[01:39]** Las texturas se ven borrosas por defecto; hay que cambiar a Closest para el look PS1.
- **[03:20]** Alpha Blend deforma la transparencia de las hojas: usar Alpha Clip en los materiales con alfa.
- **[03:36]** Hay que repetir el ajuste en cada material: Closest en color y alfa, y Alpha Clip en los transparentes.
- **[04:05]** Alt+G devuelve los objetos al origen y facilita armar la escena.
- **[05:16]** El punto del numpad encuadra el objeto seleccionado y orbita alrededor de él.
- **[07:29]** Probar varias texturas de suelo; algunas combinan bien y otras no, y se pueden mezclar ajustando las mallas.
- **[08:05]** Las texturas de suelo son seamless, así que se pueden escalar los UV sin que se noten costuras.
- **[09:17]** Subdividir solo lo necesario (dos veces) antes de dar relieve.
- **[10:25]** Variar escala y rotación de los árboles duplicados para evitar repetición.

## Lo que no queda claro
- No se muestra cómo pasar de los materiales con interpolación Closest a una configuración masiva; parece que se repite a mano en cada material.
- El plano se crea en escala 10, pero el resultado de dimensiones (20 m) sugiere un plano base de 2 m; no se aclara.
- No se explica cómo se hizo el cielo, la niebla, la iluminación nocturna, la luna ni la nieve de las escenas finales (12:33–13:30).
- La mezcla de los dos suelos se hace moviendo vértices, pero no se aclara cómo se logra la transición ni qué plano queda arriba.
- Se menciona un "cubo de niebla" (fog cube) en la intro, aunque en pantalla solo se ve el cubo por defecto.
