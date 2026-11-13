# Revisión de preview_moves.mp4

- Estilo: lowpolyshorts
- Duración: 16.2 s

## Veredicto
**CASI (fallos menores, pero repiten reglas ya corregidas).** El video tiene gancho, set legible, dither, cielo de foto y cámara variada. Pero los humanos de foto todavía muestran costuras, el perro cambia de textura según el ángulo y los subtítulos no se parecen a los de Zaw.

## Fallos
1. **[00:09]–[00:10] y [00:14]–[00:14.5]** Costuras visibles en el humano principal:
   - Las mangas de la camiseta están rotas, con bordes blancos irregulares y un parche de piel a la vista en el hombro (00:09.5, 00:10.0).
   - La cara fotográfica es más clara que el cuello y el borde es dentado, así que parece máscara pegada (00:14.5).
   - El pelo parece un casquete.
   - Rompe la regla *Photo-humans* (brazos pegados al hombro, sin huecos; cara fusionada con cabeza y cuello).
   - Arreglo: repintar la cabeza con `paint_heads`, igualar el tono del cuello a la cara, soldar y cerrar las mangas al hombro y suavizar el cuello.
2. **[00:00]–[00:01] y [00:12.5]–[00:13]** El perro de frente tiene el pecho como un "escudo" gris facetado con borde marrón, y las patas son grises lisas, como medias.
   - En los otros ángulos (00:02.5, 00:08.5) es marrón con blanco.
   - Rompe *Dog look* (perro REAL, una sola textura coherente, sin parches) y es incoherente entre planos.
   - Arreglo: repintar el blanco como pelaje cálido con el mismo detalle de pelo que el resto y quitar el parche del pecho.
3. **[00:01.5]–[00:02], [00:06]–[00:07] y [00:11]–[00:12.5]** Las manos del humano son bloques o paletas sin dedos legibles. El mailman sostiene un papel con una mano de mancha, y su bolso azul cuelga rígido junto a la cadera.
   - Rompe la regla de manos visibles y reales sostenidas en props, hechas con fotos de Flow (método VLVT).
   - Arreglo: reconstruir las manos desde foto y fijar el papel y el bolso a la mano y al hombro.
4. **[00:00]–[00:15]** Los subtítulos usan una fuente monoespaciada tipo Courier, fina y pequeña.
   - Rompe el look Zaw: subtítulos amarillos grandes y gruesos con contorno negro. Además chocan con el estilo del rótulo "KYOTO, 2015".
   - Se pierden palabras: de "lying" (00:02) se salta a "a treat" (00:03) sin "pointed at". Tampoco se muestra "the" en "the stranger".
   - Arreglo: fuente bold más grande con contorno grueso y subtítulo palabra por palabra completo, sin saltos.
5. **[00:09.5]–[00:10]** El subtítulo "person's finger" cae sobre un primer plano de la cara, sin dedo a la vista. En **[00:03]** "a treat" tampoco muestra ningún premio.
   - Rompe la lógica de imagen-guion (cada plano legible).
   - Arreglo: insertar un plano del dedo señalando (y del premio) sincronizado con la palabra.
6. **[00:00]–[00:01] y [00:12.5]–[00:13.5]** Varios planos de contrapicado: el perro mirado desde abajo y el mailman visto desde la altura de la cadera. Pasa el máximo de 1 contrapicado por video (regla de cámara Doggo).
   - Arreglo: subir el mailman a altura humana y dejar solo un contrapicado.
7. **Artefactos de render**
   - **[00:08]** Hay una "x" roja suelta arriba a la derecha, cerca de la oreja.
   - **[00:07.5]–[00:08]** El mueble de la TV tiene un borde inferior negro dentado (flecos de alfa del prop de foto).
   - **[00:09]** El cartel azul de la biblioteca parece decir "DOGGO POLY **SPORTS**" en vez de "SHORTS". Verificar en alta resolución.
   - Arreglo: borrar la "x", limpiar el alfa del mueble, corregir el cartel si es un error.
8. **[00:00]–[00:15.5]** Todo ocurre en la misma sala (más la pared de la puerta en 00:03.5). La estrategia de sets pide 2–5 sets, y el mailman entra sin puerta ni exterior.
   - Arreglo: poner al mailman en el hall o la puerta de entrada, o usar un set más.
   - Además, el 20% superior del plano a 00:00 es techo vacío. Reencuadrar.

## Cumple
- Dither PS1 aplicado (alfombra y nubes pixeladas) con texto nítido por encima.
- Cielo de foto real con nubes en la ventana.
- Sets con volumen, profundidad y set dressing (sofá, lámpara, biblioteca, mueble de TV, puerta).
- Easter eggs variados en las paredes (retratos de perros, Mona Lisa-perro, cuadros ruidosos).
- Personajes secundarios distintos (hombre y mailman, cada uno con cara y cuerpo propios) y no clones de Kaneda.
- Expresiones claras y variadas del humano (sonrisa, duda, sorpresa, tristeza).
- Personajes y perro apoyados en el piso, sin flotar.
- Cámara con ángulos variados: nivel del perro, picado, plano a altura humana e inserto cenital (00:05).
- Gancho inmediato ("your dog…") y la frase final completa ("…than you") sin cortarse.
- El perro tiene cara realista y lengua en los planos laterales y de tres cuartos.

## No verificable
- **Audio.** Perfil de voz, EQ retro, niveles (voz +7 dB, master ~−11 LUFS / −1 dBTP), música de Bert Cole ("A Little R & R"), crédito, SFX bajos. Usar earshot timeline/critique.
- **Transcripción dudosa.** "Your dog know was when you're lying" y "Pointed a treat" pueden ser una mala pronunciación o una palabra comida del TTS (los subtítulos dicen "knows"). Revisar con earshot, y regenerar el tramo si falta "at".
- **Ladrido inicial.** Que no tape palabras (+3 dB sobre la voz como máximo).
- **Movimiento entre fotogramas.** Si el perro de verdad corre en "runs straight over" (00:04, aparece parado), el ciclo de caminata y el movimiento de cámara en cada plano. Revisar con un diff por frame.
- **Pops o parpadeos** de objetos entre fotogramas consecutivos (QA frame por frame). Hacer un diff de todos los frames y mosaicos de los picos.
