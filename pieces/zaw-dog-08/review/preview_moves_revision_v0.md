# Revisión de preview_moves.mp4

- Estilo: lowpolyshorts
- Duración: 22.5 s

## Veredicto
**NO LISTO.** La preview sirve como storyboard, pero en el render final fallarían el rig de los humanos (brazos y hombros del dueño rotos, parches en la científica) y los planos con el cristal tapando la cara del perro. Además hay varias cámaras bajas y un par de detalles de guion y subtítulos.

## Fallos

1. **[00:01.0] y [00:18.5–00:22.0]** El dueño tiene los brazos mal unidos al cuerpo.
   - **[00:01.0], [00:19.5], [00:21.0]:** el brazo levantado sale del cuello o la cabeza, con el hombro de la camiseta deshilachado. En [00:21.5–00:22.0] el hombro del lado izquierdo queda como un muñón roto.
   - **[00:18.5–00:19.0]:** el brazo cruza en diagonal desde un hombro hasta la cadera contraria.
   - **Manos:** las manos que sostienen el snack son manchas sin dedos, y el snack es un rectángulo diminuto que no se lee como hueso.
   - **Regla rota:** foto-humanos (brazos pegados a los hombros, manos reales sosteniendo el prop, sin mangas despegadas).
   - **Arreglo:** reenganchar la malla del brazo al hombro, corregir el skinning y los bordes de la manga, y usar una mano de Flow (método VLVT) sosteniendo un snack con forma de hueso y mayor escala.

2. **[00:08.0–00:08.5] y [00:10.0–00:11.0]** La científica tiene parches y costuras visibles.
   - **Parches:** hay manchas color piel en la bata (cadera izquierda) que parecen manos pegadas como decal. En [00:08.0] la mano derecha parece suelta.
   - **Cara:** el pelo tiene un bloque pálido y desparejo, y hay una costura marcada y una mancha azul en el cuello. Se ve como máscara pegada.
   - **Regla rota:** foto-humanos (caras fundidas con cabeza y cuello, sin máscara pegada).
   - **Arreglo:** pintar la cabeza en 3D con `paint_heads`, mezclar el cuello y quitar los parches de la bata.

3. **[00:15.5–00:16.0]** Una franja blanca del cristal cruza el hocico y los ojos del perro.
   - Pasa justo en el momento clave de "esperó más tiempo". También molesta en [00:05.5–00:06.0] y [00:11.5–00:12.5].
   - **Regla rota:** legibilidad de la expresión (una expresión clara por plano) y limpieza de set.
   - **Arreglo:** reposicionar el cristal o la cámara para que el reflejo no tape la cara, o bajar mucho la opacidad y el grosor de las franjas.

4. **[00:00.0–00:02.0], [00:08.0–00:11.0], [00:19.5–00:22.0]** Hay varios planos en contrapicado.
   - Son el dueño visto desde abajo con el perro en primer plano ([00:21.0–00:22.0]), la científica desde abajo con la cabeza del perro en primer plano ([00:10.0–00:11.0]) y las vistas hacia arriba del dueño.
   - **Regla rota:** cámara Doggo (máximo 1 contrapicado por video; la mayoría a la altura del perro).
   - **Arreglo:** dejar solo el más útil, por ejemplo el cierre con el dueño. Pasar el resto a nivel del perro o a picado suave.

5. **[00:16.5–00:18.0]** Hay una cuarta toma larga de unos 1.5 s sin cara del perro.
   - El anca ocupa casi todo el cuadro y la textura marrón está estirada y pixelada de forma burda.
   - La cola es un manchón blanco fantasma. En [00:12.5–00:13.5] las patas traseras y la cola también tienen blancos translúcidos tipo bolsa.
   - **Regla rota:** el perro debe verse real, con una textura coherente y sin parches.
   - **Arreglo:** corregir el UV y el alpha de patas y cola, y encuadrar para que se vean cola y cara (que el perro "pare de mover la cola" se lea con la cara).

6. **[00:00.0–00:02.0]** La mandíbula inferior es una plancha gris plana y la pata levantada es un muñón gris en [00:01.5–00:02.0]. En [00:00.0–00:01.0] las patas traseras son bloques cuadrados.
   - **Regla rota:** perro realista, no juguete.
   - **Arreglo:** modelar mejor mandíbula y labio, y suavizar la pose sentada.

7. **[00:02.5–00:10.0]** El "laboratorio" no se lee como laboratorio.
   - Es el living de la casa (sofá, biblioteca, TV, cuadros del perro) con dos paneles de vidrio sueltos. Los paneles parecen mamparas, no una "pared de vidrio" ([00:06.0] dice "wall").
   - **Regla rota:** sets con sentido, lugar concreto y legible.
   - **Arreglo:** agregar pistas de lab (mesa, cartel, fondo blanco o neutro) y unir los paneles en una pared continua con hueco.

8. **[00:03.5–00:05.0]** El subtítulo dice "germany passed" y la voz dice "pass". Además el guion mezcla tiempos: "pass dogs treats… dropped… pulled".
   - **Regla rota:** coherencia texto-voz.
   - **Arreglo:** unificar los tiempos del guion (todo en pasado) y que el subtítulo coincida con la locución. Revisar "dogs treats" (falta apóstrofo o redacción).

9. **[00:14.0]** No hay subtítulo mientras la voz dice "But when" (el siguiente aparece en [00:14.5]).
   - **Arreglo:** extender o añadir el chunk "but when".

10. **[00:01.0]** El plano del dueño dura apenas unos 0.5 s.
    - Se ve poco para lo roto que está ([00:01.0] muestra el brazo levantado desde el cuello).
    - **Regla rota:** ningún plano demasiado corto para leerse.
    - **Arreglo:** alargarlo a 0.8–1 s con un gesto claro, o fusionarlo con el plano del perro.

11. **Subtítulos (todo el video):** son chicos, en fuente monospace y con trazo fino, centrados sobre el sujeto (tapan pecho y patas en [00:20.5]).
    - **Regla posible:** el look de Zaw usa captions amarillos grandes con trazo negro.
    - **Arreglo:** subirlos de tamaño o probarlos, y reservar el cuadro de abajo para no tapar al perro. Confirmar con el creador si este look es intencional.

## Cumple
- **Perro:** textura fotográfica de pelaje y cara; el deadpan escéptico de [00:00–00:02] y [00:20–00:21] se lee bien.
- **Cielo:** foto real con nubes en las ventanas, más casa de ladrillo y farol.
- **Sets:** el recibidor con puerta verde y felpudo "WELCOME" y el living tienen profundidad, piso de madera, alfombra, estantería y TV.
- **Marca:** el cartel de pared dice "DOGGO POLY SHORTS" (nombre correcto del canal).
- **Easter eggs:** cuadros de pared variados (pug con suéter, retratos de perros, reloj).
- **Texto 3D amarillo:** "GERMANY, 2021" en [00:03.5] es legible y tiene escalones de borde.
- **Personajes:** dueño y científica son personas distintas con cara y cuerpo propios.
- **Dither PS1:** el look pixelado se ve en los fotogramas.
- **Cámara:** la mayoría de los planos están a la altura del perro, con una buena variedad de encuadres.
- **Contenido:** el final dice el cierre completo ("he knows exactly what you're doing").

## No verificable
- **Audio (earshot timeline/critique):**
  - perfil de voz;
  - BGM "A Little R & R" o "Waiting", nivel de música y SFX, y niveles −11 LUFS / −1 dBTP;
  - ladrido de apertura que no tape palabras;
  - pausas y cortes de la voz, y la sincronía fina con los subtítulos.
- **Movimiento de cámara:** que todos los planos se muevan se aprecia entre fotogramas, pero no se puede juzgar la fluidez en 0.5 s. Usar un diff fotograma a fotograma.
- **Flicker y pops:** aplicar la regla frame-by-frame QA (diff entre fotogramas consecutivos, pops, sombras, near-plane) sobre todos los frames.
- **Resolución:** esto es una preview de 540×960; el dither a 1/4 y la nitidez de subtítulos se confirman en el render final.
- **Duración de los planos cortos:** el timing exacto de [00:01.0] y [00:03.5] se confirma con el timeline.
