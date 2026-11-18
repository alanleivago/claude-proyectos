# Revisión de preview_moves.mp4

- Estilo: lowpolyshorts
- Duración: 19.7 s

## Veredicto
**CASI (fallos menores).** El guion se entiende y cada línea tiene su acción visible. Los pendientes son la calidad de los humanos (cuellos, ropa y manos), la X roja que se incrusta en la cabeza del perro, el cenital con humano, la duración de varios planos y los huecos de subtítulos.

## Fallos

1. **[00:01–00:02, 00:16–00:19, 00:17, 00:05–00:06]** Los humanos se ven pegados y sin acabado.
   - El dueño tiene la camiseta blanca plana con dobladillos y mangas rasgados, con bloques color piel. Parece pintada por código, no sacada de una foto de Flow.
   - En el cuello hay un parche marrón con borde duro bajo la barbilla. Lo mismo se ve en el cartero (00:17) y en la científica (00:05–00:06), cuyo pelo está pixelado como una gorra.
   - Rompe: "caras fundidas con cabeza y cuello, no máscara" y "ropa desde imágenes de Flow (kit v6)".
   - Arreglo: reconstruir el dueño con `photo/map.npz` (v6), difuminar la unión cara/cuello y igualar el tono del cuello a las mejillas.

2. **[00:02–00:03, 00:05–00:06, 00:10]** Las manos tienen poco detalle.
   - La mano que señala (00:02–00:03 y 00:10) es rosa pálido con manchas blancas. No coincide con el tono del antebrazo y no tiene uñas ni nudillos.
   - Las manos de la científica (00:05–00:06) son parches planos color arena, como manoplas.
   - Rompe: "manos reales de Flow, con detalle en primer plano" y "manos retonadas al antebrazo".
   - Arreglo: re-tonar la mano al antebrazo y usar la foto de mano del kit v6. En el plano de la mano, acercar la cámara solo si la textura aguanta.

3. **[00:08–00:09]** La X roja 3D se incrusta en la cabeza del perro.
   - A las 00:09 se hunde entre las orejas y la mancha blanca, y parece un sombrero.
   - Rompe: "sin intersecciones".
   - Arreglo: subirla ~0.15–0.2 m sobre la cabeza, o hacerla seguir al cráneo con un hueco visible.

4. **[00:06–00:07]** Cenital con perro y humano.
   - Rompe: "cenital solo para insertos de objetos".
   - El perro mira hacia arriba a cámara, no a la científica. Ella queda cortada por la cabeza, solo se ven abrigo y zapatos.
   - Arreglo: dejar el cenital solo para los dos cuencos. Mostrar a la científica y al perro en un plano a la altura del perro, con el cuenco lleno y el vacío al frente.

5. **[00:09, 00:12, 00:15 y 00:05–00:06]** Hay fotogramas sin subtítulo o con huecos.
   - 00:09.5, 00:12.5 y 00:15.5 no tienen ningún subtítulo. Faltarían "it and the", "But when" y "to the".
   - "you see" dura ~1 s (00:05–00:05.9) y el bloque "scientists in" no aparece entre 00:05.5 y 00:06.
   - Rompe: "los subtítulos cubren cada palabra".
   - Arreglo: revisar la tabla de bloques. El muestreo a 0.5 s puede haberlos perdido, pero tres fotogramas vacíos justifican revisarlos.

6. **[00:05–00:06, 00:09–00:10, 00:11–00:12, 00:18–00:19]** Planos largos (≥1.5 s) frente a la regla de 1.0–1.4 s.
   - 00:11–00:12 es casi el mismo plano del dueño que el de 00:00 (perro sentado, mirada escéptica) y casi no cambia. Cortarlo a ~1.2 s o variar tamaño y ángulo.
   - 00:05–00:06 es la científica sola durante 1.5 s o más. Cortarla a ~1 s.

7. **[00:01–00:02, 00:05–00:06, 00:12–00:13, 00:16–00:17]** Demasiada gente.
   - Aparece gente en ~60% de los fotogramas, y solo humanos (sin perro) en ~28%. La regla pide ≤60% y ≤20%.
   - Arreglo: recortar o fundir con inserciones del perro (reacción) en la científica (00:05–00:06) y el cartero en la puerta (00:12–00:13).

8. **[00:08–00:09, 00:09–00:10, 00:14, 00:18–00:19]** Escala del perro y conexión con el cuenco.
   - En 00:08–00:09 el perro reacciona a un cuenco vacío que casi no se ve, cortado en el borde inferior, y el perro está detrás de él. La conmoción queda desconectada del objeto.
   - En 00:09.5–00:10.5 el perro mide ~0.35 del alto del cuadro y en 00:18–00:19 ~0.2, por debajo de 0.40–0.60.
   - Arreglo: acercar o reencuadrar para que el hocico y el cuenco vacío entren juntos. En el plano final empujar más hacia el perro sin perder al cartero.

9. **[00:12–00:14]** El cartero parece flotar.
   - Sus zapatos no muestran contacto claro con el piso ni sombra. La postura es de tijera.
   - El prop de cartas es una barra blanca que parece un palo, y el bolso es una losa plana.
   - Rompe: "pies siempre en el piso".
   - Arreglo: bajar los zapatos unos centímetros, añadir sombra de contacto y mejorar el prop de la mano (sobre/cartas más legibles).

10. **[00:13–00:14, 00:05–00:06]** Detalles de composición.
    - El subtítulo tapa la mano del cartero que señala, justo el gesto de "a stranger pointed".
    - La farola de la ventana queda justo sobre la cabeza de la científica y parece una antena.
    - Arreglo: subir o bajar el subtítulo, o mover la cámara unos centímetros para separar la farola de la cabeza.

11. **[00:00, 00:02, 00:11]** (menor, look aprobado) En primeros planos el pecho gris con contorno marrón, el collar poligonal y las patas grises con líneas de costura blancas se leen como parche y pilares. No es la textura "foto de perro real, una sola textura". Habría que pulir el atlas en esas zonas.

## Cumple
- **Guion:** palabra por palabra en las 7 líneas, y el final llega completo sin loop. El cierre cae sobre la cara de asco del dueño.
- **Acción visible por línea:**
  - mentira: dueño sonriente y luego perro escéptico;
  - señalar el cuenco y el perro corre;
  - Kyoto con el rótulo, y los dos cuencos;
  - cuenco vacío;
  - perro quieto;
  - desconocido señalando y perro corriendo por el pasillo;
  - cartero con el perro junto a la puerta.
- **Expresiones del perro:** variadas y una por plano (escéptico, lengua afuera, asombro, feliz).
- **Gancho:** plano inicial del perro escéptico a la altura de sus ojos, con subtítulo grande.
- **Subtítulos:** amarillos con contorno negro, 2 palabras por bloque, legibles. "KYOTO, 2015" en 3D amarillo es legible y se ve bien.
- **Sets del kit:** sala, pasillo y puerta abierta con porche y calle detrás; la puerta y el felpudo "WELCOME" coinciden con el kit.
- **Cielo y alfombra:** foto de cielo con nubes nítida en las ventanas y en la puerta. Alfombra nítida (aunque muy pixelada).
- **Decoración:** cuadros de perros graciosos (pug con suéter, beagle, osos de peluche), estante con libros, botas en el pasillo.
- **Cámara:** altura de perro en la mayoría de los planos, con empuje o travelling visible entre fotogramas y el desenfoque del whip-in en la puerta (00:13.5). No hay contrapicado marcado ni techo en planos de perro.
- **Variedad de tamaños:** hay mezcla de planos medios, insertos (mano, cenital de objetos), y un plano general de pasillo y puerta.

## No verificable
- **Audio** (usar earshot timeline/critique y `mix_zaw.py`):
  - ladrido hero audible a +3 dB sin tapar palabras, en el hueco de 1.99 s;
  - voz "3d cartoon" con EQ retro;
  - música Bert Cole "A Little R & R";
  - SFX, niveles, master a ~−11 LUFS y limitador a −1 dBTP;
  - jadeo humano real sobre el cambio de cara, si existe.
- **Sincronía de la boca** en el ladrido: a 00:02.0 la boca está cerrada. Comprobar fotograma a fotograma que se abre en ~00:01.99–00:02.2.
- **Pops y flicker entre fotogramas consecutivos** (diff por frame, `tools/revisar_render.py --estilo lowpolyshorts`): cuenco, X, sombras, objetos que aparecen o desaparecen, auto detrás de la ventana.
- **Movimiento fino:** que cada plano se mueva (`planos/medir_encuadre.py`; ritmo zoom ~0.10–0.17 log/s), suavidad del trote y del olfateo, y deslizamiento de pies (`motion_check.py`).
- **Anti-flicker:** wobble y snap del set estático, dither estable, filtros de piso y props, y los flecos negros bajo el mueble de la TV.
- **Subtítulos:** transcripción dice "try to trick" y la voz dice "tried a trick". Confirmar con Whisper medium y con la tabla de bloques de subtítulos, que también despeja el punto 5.
- **Ritmo real de cortes y duración exacta** de cada plano (las capturas están a 0.5 s).
