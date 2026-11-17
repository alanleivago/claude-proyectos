# Revisión de r2.mp4

- Estilo: ava
- Duración: 152.1 s

## Veredicto
**CASI (fallos menores).** Las correcciones de esta ronda se ven bien: las tarjetas de hora son solo texto, no hay bandas de luz en la cara y el estilo RE se mantiene. Quedan una pose de brazos rara, etiquetas mal apuntadas, un plano del perro ilegible y un paso a la buhardilla sin animación de puerta.

## Fallos
1. **[00:38–00:47]** En los primeros planos de "Ribbon, stay" y "You don't breathe", Ava tiene los brazos extendidos rígidamente a los lados, como alas o T-pose, con las manos en la cadera. En 00:41.8 está agachada con la misma pose → anima mal, rompe la regla de clipping y de hacer animaciones nuevas cuando el plano las necesita → usar un gesto de "stay" (mano abierta hacia el perro) y brazos pegados al cuerpo.
2. **[01:33–01:35]** La etiqueta **DRY WOOD** termina sobre la columna de piedra, y en el plano de la chimenea no se ve leña apilada → la etiqueta no apunta a lo que nombra → apuntarla al montón de leña junto al hogar y hacerlo visible.
3. **[01:37–01:42]** Continuidad: el texto dice que Ava se quita la ropa mojada y se envuelve en una cortina (01:37), pero en 01:42.7 lleva puestas la chaqueta y el top → corregir el vestuario o mostrar que se secó.
4. **[01:38.9–01:41.8]** El perro sale como un bulto de espaldas, enorme, sin cabeza ni cara, y no se ve "su pelo casi quemándose" → regla de perro tierno y de que las acciones se lean → plano lateral de Ribbon con el fuego, cabeza visible, ojos con brillo.
5. **[02:22.6–02:24.5]** "The silver key opens the attic" no muestra puerta ni trampilla ni animación de abrir. Ava aparece ya dentro. En 02:22.6 su pelo visto desde atrás es una mancha amarilla sin forma → regla de puertas con animación de abrir → añadir llave en la cerradura y puerta o trampilla que se abra.
6. **[02:16.9]** La llave aparece como un icono plano blanco pegado a la puerta, sin volumen, y la mano entra por el borde sin acercarse a la cerradura → prop sin detalle low poly real → modelar la llave en 3D en la cerradura y hacer que la mano la gire.
7. **[00:05.7] y [00:53.2]** Dos etiquetas con la línea mal dirigida:
   - **DRY JACKET: 1x** termina en el pelo, no en la chaqueta, y tiene borde y texto gris oscuro casi ilegible sobre fondo oscuro.
   - **2x YOUR BOOT** termina en el agua, no en la huella marrón.
   → reapuntar ambas y subir el contraste de la primera.
8. **[00:19.0] y [02:18.8]** El HUD tapa la parte superior de la primera casilla de inventario (HAND MAP). El texto de EXAMINE sigue a medio escribir ("The two stars at th", "SILV") y el corte siguiente llega 1.9 s después → mover la rejilla o el HUD y confirmar que el texto termina de escribirse y se sostiene ~2 s.
9. **[00:41–00:44], [00:49–00:55], [01:16–01:20]** La niebla y los charcos de luz se renderizan en bloques gruesos de ~12 px, con aspecto de bandas o artefactos de transparencia (base de la puerta, suelo con huellas, fondo del zombi, que parece traslúcido) → conviene suavizarlos o usar dither fino, ya que se acaba de corregir el tema de las bandas de luz.
10. **[02:09–02:15]** La chaqueta de Ava se lee negra o gris en el pasillo, frente al marrón del resto → posible cambio de tono por la luz. Verificar que no se tocó la textura (regla: nunca cambiarla).
11. **[01:59.8], [02:24–02:26]** Ava lleva la linterna ("flashlight shaking") y no se ve haz de luz. La buhardilla queda muy oscura frente a la regla de escenas 3D ~30 % más claras → añadir el haz siguiendo la linterna y levantar sombras.
12. **Planos casi inmóviles de ~4 s:** 00:11–00:15 (cara), 01:10–01:14 (cara), 01:25–01:29 (plano cenital), 01:52–01:55 (escalera, solo partículas) → regla "nada quieto >4 s" → un micro-movimiento de cámara o cortar antes.
13. **[01:31.3]** La etiqueta "A FAMILY NOBODY REMEMBERS" queda pegada encima del subtítulo, casi tocándolo → subirla.
14. **[00:17.1]** La línea punteada hacia la estrella polar sale del cuadro sin que se vea Polaris → ajustar la cámara o dibujar la estrella.

## Cumple
- Tarjetas de hora (2:30, 3:00, 3:15, 4:00, 4:40) con solo texto sobre negro y sin recuadro gris; las barras bajo el título no aparecen.
- Sin bandas de luz sobre la cara de Ava en ningún primer plano.
- HUD CONDITION con el lugar (FOREST/MANSION) y el estado Fine/Caution/Danger, arriba a la izquierda y activo en todos los planos 3D.
- Subtítulos pixelados con fuente RE, de una palabra, sobre el audio correspondiente; sin "click" ni onomatopeyas en el guion.
- Ava mira a cámara en los frontales y tiene expresiones propias (sonrisa con ojos cerrados, susto).
- Las puertas del mansión se abren con animación, con Ava cruzando entre las hojas (01:21.8).
- El zombi sale entre los árboles sin aparecer de golpe, con manos propias del modelo.
- Los cuervos tienen ojos amarillos sobre la cabeza, no flotando.
- Mansión exterior rica: hiedra, verja, ladrillo, niebla y fondo con distancia. Interior con papel pintado, damero, alfombra y cuadro con retrato real.
- Pantallas de inventario y de diagrama oscuras, con ítems RE (mapa, pistola 15, linterna, llave) y totales.
- Etiquetas de diagrama como cajitas de 1 px con línea fina; las que caen en su palabra lo hacen bien (SOAKED, HYPOTHERMIA, DOZENS, BARE FEET, 3 FLOORS).
- Guion humanizado, con conectores y datos concretos (25× más rápido, 15 balas, Big Dipper → estrella polar).
- Pausas largas con tarjeta negra como respiro de ritmo.
- Perro tierno y bien armado en 00:07 y 00:24 (cabeza y cuello unidos, collar, chaleco K-9).

## No verificable
- **Voz:** velocidad ~0.88, pausas, susurros [PIENSA], temblor, F0 final descendente y cortes limpios → earshot `timeline`/`critique`, y whisper para confirmar el texto exacto.
- **SFX:** sincronización en el cuadro exacto (golpe de puerta "boom", pasos, máquina de escribir una tecla por letra, llave, radio), sin duplicados ni duros → earshot `timeline`/`measure`.
- **Música:** audibilidad, LUFS por tramo (10-11 LU bajo la voz), crossfade del gancho, continuidad sin huecos → earshot `measure` por tramo.
- **Temblor de Ava:** si hay jitter de Ava o de las cabezas de zombi (la voz dice "shaking") → test del centroide del pelo sobre el mp4.
- **Parpadeo** del suelo, de la luz bajo la puerta o de las llamas, y z-fighting → diferencias entre cuadros a ≥5 fps en 00:00–00:09, 00:49–00:55 y 01:37.
- **Clipping fino** (columna sobre Ava en 01:33, brazos y manos) y manos flotando entre fotogramas → revisión cuadro a cuadro ≥5 fps con crops 4×.
- **Giro completo de la cabeza** del hombre ("all the way around", 02:11): solo se ve una parte en los fotogramas → revisar el tramo 02:09–02:15.
- **Datos reales y fuentes** (25× aire/agua, regla de frío) → comprobar contra FACTS.md.
