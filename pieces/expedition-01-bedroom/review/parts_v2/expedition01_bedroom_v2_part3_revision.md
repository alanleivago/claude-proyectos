# Revisión de expedition01_bedroom_v2_part3.mp4

- Estilo: mechayuki
- Duración: 160.0 s

## Veredicto
**CASI (fallos menores).** Ningún bloque está roto, pero hay varias colisiones de subtítulos con etiquetas, un glifo de letra que no se lee y escenas donde la acción no se entiende (cámara cinta/cómoda, cajón oscuro). Son arreglos rápidos antes de que el creador lo vea.

## Fallos
1. **[01:22–01:26]** El subtítulo ("clothes.", "in", "home") se dibuja encima de la barra "PERSIAN > INDIA > UK 1800S" y tapa "INDIA" → rompe las reglas de subtítulos y overlays legibles → subir la barra o bajar el subtítulo a una zona libre, y mantener fuera de ahí todo lo que se superponga.
2. **[02:36]** El subtítulo "today" pisa la etiqueta "STILL SELLING TODAY" y no se lee ninguna de las dos → misma regla → mover una de las dos.
3. **[00:34–00:36]** El subtítulo ("r-e-m,", "movement.") se monta sobre el borde inferior de la etiqueta "RAPID EYE MOVEMENT". Esa etiqueta además es mucho más grande que la altura de un subtítulo → regla de etiquetas moderadas → reducirla y separarla del subtítulo.
4. **[00:00–00:02]** El subtítulo cae dentro de la barra DUSK/DAWN y tapa "FIRST SLEEP / SECOND SLEEP". El reloj queda congelado en 00:00 en ambos fotogramas → colisión de overlays y el elemento parece no animarse → subir la barra y animar el reloj.
5. **[01:34, 01:38, 01:58]** La palabra "a" se dibuja como un glifo diminuto parecido a una lupa o una "Q" → regla de fuente pixel legible y con espaciado (el v2 tocó justo esto) → revisar el glifo "a" suelto en `engine/pixfont.js`.
6. **[01:42–01:50]** Se habla de esconder el orinal, pero dentro de la cómoda no se ve ningún orinal, solo líneas verdes de olor. La puerta abierta parece un panel suelto apoyado en el suelo, sin bisagra al mueble → "cada acción inequívoca" y "puertas completas" → mostrar el orinal dentro y pegar la puerta al mueble con bisagra.
7. **[00:56–01:04]** El plano del cajón está muy oscuro y casi monocromo. La ropa azul parece flotar en el aire en vez de apoyarse en el cajón, y se ven apenas 3 piezas, no 27. Mechayuki sale recortada por el borde derecho en 01:00–01:04 → regla de que no se la corte en el borde y de que los objetos van sobre superficies → iluminar, apoyar la ropa y encuadrarla completa.
8. **[00:04–00:12]** Los 5 fotogramas son casi idénticos: plaza vacía y sin gente, sin cambio de luz ni ventanas encendidas. La narración dice que llegó la luz barata y la gente se acostó más tarde → regla de mundo animado que reacciona → encender farolas y ventanas progresivamente y añadir NPCs.
9. **[02:26–02:34]** Max Negwer es el mismo NPC de camisa rosa y corbata que el científico de 1953, con aspecto moderno para 1907. No lee ni vende nada: está parado sin props → NPC con props y acción clara → ropa de época, un periódico o libro en la mano, y cajita de tapones en 02:32.
10. **[02:16–02:24]** El diagrama de la Odisea es un plano 2D plano. Las sirenas son bloques rosa con "?" y Odiseo no tapa los oídos a nadie → regla de escenas históricas con volumen y contraste → dar volumen o hacer legible la acción (marineros con cera en las orejas).
11. **[00:50, 00:52, 01:06]** Aparece un panel beige semitransparente gigante que corta el encuadre y parece un artefacto de render → quitar o hacer opaco.
12. **[00:52–00:54, 02:02–02:04]** La cara queda tapada por el pelo, de espaldas o con el puño delante en tomas clave ("I'm not touching it") → regla de cara visible → reencuadrar a 3/4 con cara a cámara.
13. **[00:34–00:40]** De Mechayuki solo se ven las piernas recortadas abajo, sin dormidor. Los ojos REM son solo un overlay plano → regla de no cortarla en el borde → subir el encuadre o mostrar al durmiente.
14. **[01:40]** Las líneas guía PHONE/WATER/BOOK se cruzan entre sí y pasan por encima de los tapones naranjas, que ya aparecen aquí antes de su presentación en 02:08 → regla de etiquetas claras → separar los leaders y quitar los tapones de esa escena.
15. **[00:22–00:32]** El letrero dice "1953 – CHICAGO" pero el escenario es el laboratorio de ruinas con pilares, y una de las "científicas" es una niña de vestido turquesa → falta de contexto, pero menor → decorado de época o un cartel que lo aclare.
16. **[01:18]** El subtítulo dice "pay," pero la transcripción de voz dice "pie," → posible error de pronunciación de TTS en una palabra clave → escuchar la toma y regenerar si dice "pie".
17. **[02:06]** La tarjeta de Earplugs muestra solo "B" en la descripción → probable typewriter a medio escribir. Confirmar que se completa y no queda truncada.

## Cumple
- Numeración y progreso de las tarjetas ITEM GET consistentes (NO.05→07, 5/8→7/8).
- Los textos de las etiquetas coinciden con el guion (X27, COMMODE, WEAR: 97%).
- Escena de 1953 y cama: la persona queda dentro del colchón y bajo el edredón arqueado sin atravesar nada.
- Fuente pixel con pop-in y una palabra por subtítulo.
- Nightstand, tapones y pijama se reconocen como props claros.
- Cierre en gancho ("My scan says this pair was...") coherente con parte 3 de 4.
- Mezcla de verde: en esta parte son interiores nocturnos, el verde de la pradera corresponde a inicio y fin de la expedición.

## No verificable
- Música más baja, mezcla, SFX en acciones y calidad de voz: usar earshot timeline/critique.
- Pregunta "What happens inside the shutdown human?" con entonación ascendente, y la coma rara de "completely, still," en 00:42–00:50: ver contorno de pitch con earshot.
- Cortes de palabra y pausas de la voz: revisar con Whisper contra el guion.
- Comentario de Operator al 35–40 %: no aparece en esta parte; confirmar si va en otra de las 4.
- Movimiento fino (subida por la ventana en 00:28, parpadeo del final, cámara) y manos atravesando objetos: revisar con contact sheets de start/mid/end de cada plano, no con fotogramas cada 2 s.
- Título centrado en 00:18: no hay fotograma exacto; comprobar a mano.
