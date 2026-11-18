# Revisión de Your Dog Knows When You're Lying.mp4

- Estilo: lowpolyshorts
- Duración: 19.7 s

## Veredicto
**CASI (fallos menores).** La historia se lee clara y el set, el cielo, las ventanas con profundidad y los cuadros de perros cumplen. Pero los humanos fotográficos siguen con costuras visibles en cuello y mangas, las manos son borrosas, y hay detalles de textura, encuadre y subtítulos por revisar antes de publicar.

## Fallos
1. **[00:01]–[00:02], [00:16]–[00:19]** El dueño tiene costuras ragged de textura en el cuello (triángulo oscuro rojizo en la clavícula), en los bordes de las mangas y en el dobladillo (píxeles blancos y grises "rotos"). Los brazos son tubos lisos de otro tono que la cara, y el rostro tiene borde duro contra el cuello. → Rompe "caras fundidas con cabeza y cuello, sin máscara pegada" y "brazos unidos a los hombros". → Revisar el mapeo de `photo/map.npz` en cuello y mangas, igualar el tono cara/cuello/brazos y repintar los dobladillos. Lo mismo vale para el cartero en **[00:17.5]** (cuello con costura dentada) y la científica en **[00:05]–[00:06]** (mechón gris/blanco sobre la frente y cuello pálido que no se funde).
2. **[00:05]–[00:06]** Las manos de la científica son parches planos color piel, sin dedos definidos. Las manos grandes de **[00:02.5]–[00:03]** y **[00:10]–[00:10.5]** tienen textura moteada con manchas blancas. → Rompe "manos reales visibles" y el criterio de manos de primer plano con detalle. → Retonar la mano a la piel del antebrazo, o en estos planos mantener la mano más lejos o fuera de cuadro.
3. **[00:12.5]–[00:13.5]** Junto a la pierna del cartero hay una tira blanca vertical que parece flotar, y no se lee como una carta sostenida. La bolsa azul es una losa plana que cuelga del hombro. → Rompe "nada flotando, props sostenidos con la mano". → Poner la carta en la mano (o quitarla) y darle volumen a la bolsa.
4. **[00:13]–[00:13.5], [00:17.5]** El pasto exterior se ve estirado y emborronado en el primer plano. → Rompe la regla de texturas nítidas. → Usar filtrado Closest o una foto de más resolución, y repetir la textura.
5. **Proporción de humanos y primeros planos:**
   - Por lo que se ve, hay humanos en cerca del 59 % de los fotogramas (el límite es 60 %) y planos solo-humano en cerca del 28 % (el límite es 20 %).
   - Hay caras en primer plano en **[00:15]**, **[00:16]–[00:16.5]** y **[00:17.5]**, más cerca del 8–10 % que del 5 %.
   - → Rompe la mezcla de tamaños. → Cambiar uno o dos planos solo-humano por perro con humano al borde, y abrir un poco los CU de **[00:16.5]** y **[00:17.5]**.
6. **[00:00]–[00:02], [00:11]–[00:12]** En el perro el pecho tiene una línea marrón que parece un parche o arnés, y bajo la barbilla hay un "colgajo" gris con borde duro. Las patas delanteras grises parecen zancos. → Rompe "una textura de color coherente, sin parches". → Suavizar la costura del atlas en pecho/cuello. Si es el asset aprobado, queda como menor.
7. **[00:04]–[00:04.5], [00:15.5]** Vistas desde arriba, las orejas del perro sobresalen como cuernos rígidos. → Parece una deformación del rig en picado. → Bajar las orejas en esos planos o cambiar el ángulo.
8. **[00:05.5]–[00:06]** El farol de la ventana queda exactamente detrás de la cabeza de la científica y parece salirle de la cabeza. → Mala composición. → Desplazar la cámara unos centímetros o el farol.
9. **[00:01]–[00:01.5], [00:07.5]** La pantalla de la lámpara de pie tiene un borde rosa/magenta. → Puede ser residuo del despill del fondo magenta. → Si no es intencional, corregir el material.
10. **Subtítulos:**
    - La transcripción dice "try to trick", los subtítulos "tried / a trick" (**[00:06]–[00:07]**) y el creador dice que la voz es "tried a trick". Hay que confirmar con el audio cuál es la que suena.
    - No se ve subtítulo en **[00:09.5]** ni en **[00:12.5]**; pueden ser bloques muestreados fuera de tiempo.
11. **[00:06.5]–[00:07]** El cenital incluye a la científica y al perro, y no solo un objeto. → La regla pide cenital solo para insertos de objetos. → Está justificado como inserto de los dos cuencos, pero es el límite.
12. **[00:15]–[00:18.5]** El cuenco aparece primero en el living y luego en el pasillo junto a la puerta, sin transición. → Continuidad de props. → Verificar que se lea como "mismo cuenco movido" o cambiar el plano.
13. **[00:14]–[00:15.5]** Las paredes bajas blancas del pasillo se ven planas y sin detalle. Es menor, pero resta al "set más grande y rico" de Zaw.

## Cumple
- Estilo PS1 con dither estable y subtítulos amarillos grandes con borde negro, bien legibles.
- Texto 3D "KYOTO, 2015" amarillo con escalones, legible.
- Sets de muebles modelados con foto: living, hall con puerta abierta y calle, con el cielo real de nubes en las ventanas y exterior 3D con profundidad.
- Cuadros de perros graciosos en las paredes (beagle, pug con suéter).
- Alfombra nítida (no borrosa) y pies de personas apoyados en el suelo.
- Perro con expresiones claras (escéptico, shock, feliz con lengua) y aspecto de perro real.
- Cámara a la altura del perro en la mayoría de los planos y variedad de ángulos (picado suave, inserto cenital); no se ve ningún contrapicado claro.
- Solo hay una toma de cuerpo entero (el cartero en la puerta).
- Desenlace legible: dueño decepcionado, perro con el cartero.

## No verificable
- **Audio:** nivel y hueco del ladrido (+3 dB tras "lying"), que no tape palabras, la voz "3d cartoon" con EQ, BGM "Waiting" o "A Little R & R", SFX, y los -11.2 LUFS / -2.6 dBTP → `earshot timeline/critique` y `sound/mix_zaw.py`.
- **Pops, flicker e intersecciones entre fotogramas consecutivos:** si el hocico entra en el cuenco en **[00:04]**, objetos que aparecen o desaparecen, y sombras → diff por fotograma con atípicos y tiles sobre los tramos marcados, más `tools/revisar_render.py --estilo lowpolyshorts`.
- **Movimiento de cámara en todos los planos:** velocidad de zoom y paneo, el whip-in de **[00:12.8]** y los acentos de **[00:02]** y **[00:08.6]** → `medir_encuadre.py` sobre el preview.
- **Suavidad de las animaciones del perro:** sin temblor al olfatear o correr → revisar el clip y las curvas.
- **Sincronía exacta de subtítulos y voz** → timeline de audio contra los bloques de subtítulos.
