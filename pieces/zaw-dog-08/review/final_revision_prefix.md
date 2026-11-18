# Revisión de Your Dog Knows When You're Teasing Him.mp4

- Estilo: lowpolyshorts
- Duración: 21.3 s

## Veredicto
**CASI (fallos menores):** el set, el perro, la cámara y los subtítulos están bien resueltos. Los humanos reabren correcciones ya pedidas (manos, mangas, caras pegadas), así que hay que arreglarlos antes de publicar.

## Fallos
1. **[00:00–00:01.0, 00:18.0–00:18.5, 00:20.0–00:21.0]** Las manos del dueño son un bloque pixelado o un puño sin dedos, con una golosina minúscula. No son manos reales sostenyendo el objeto → regla "manos visibles reales, hechas con fotos de Flow (método VLVT), nunca de código" → rehacer la mano del dueño con la foto de mano de Flow en los planos medios y alejados, como la del científico en 00:07.5.
2. **[00:04.5, 00:06.0, 00:06.5, 00:08.5]** La mano del científico es un cubito pixelado que flota sobre el borde del marco de vidrio. El brazo casi no se ve tras el vidrio tintado y el fondo blanco → regla "nada flotando, brazos unidos al cuerpo" → dar contraste al brazo (manga más oscura o menos tinte) o encuadrar para que se vea el brazo completo. En 00:06.0–00:06.5 el brazo queda además rígido en horizontal, casi T-pose: suavizar la pose del mocap.
3. **[00:20.0–00:21.0]** La cara del dueño se ve estirada, con cuello larguísimo y mandíbula que parece pegada. En 00:20.5 la cara es una máscara deformada → regla "caras fundidas con cabeza y cuello, sin máscara" → reproyectar o reescalar el UV de la cara y acortar el cuello, o evitar este contrapicado extremo sobre la cara.
4. **[00:08.0, 00:09.5–00:10.0]** La cara del científico tiene el borde de la máscara visible en la mandíbula, una mancha gris azulada bajo el mentón y un pelo de "trencitas" raro en la frente → misma regla → pintar la transición cara-cuello y el cuello con el mismo tono de piel, y limpiar la textura del pelo.
5. **[00:00.0, 00:01.0, 00:18.5, 00:20.0]** Las mangas de la camiseta tienen bordes rasgados y manchas blancas sobre la piel de los antebrazos. En 00:18.5 el brazo levantado parece salir por encima de la manga. En 00:00.0 el brazo estirado se ve desproporcionadamente largo → regla "brazos unidos a los hombros, sin mangas sueltas ni huecos" → cerrar la malla en el hombro y limpiar el sangrado de textura (padding del UV).
6. **[00:07.0, 00:10.5–00:12.5, 00:20.0]** La golosina se ve como un damero rojo-marrón pixelado, no como una galleta con forma de hueso. En 00:20.0 parece un palito → regla "snack = galleta real en forma de hueso" → texturizarla con foto de galleta (beige) y dar más silueta de hueso.
7. **[00:01.5–00:02.0, 00:19.0–00:19.5]** En primer plano, el pecho del perro tiene bloques enormes, mucho más gruesos que la cara, y hay una costura grisácea bajo la mandíbula. Las orejas parecen alas rígidas y planas. Con el blaze blanco y la cara ancha, se ve distinto del beagle del laboratorio → reglas "perro real, una sola textura coherente, sin parches" → subir la resolución de la textura del pecho, tapar la costura del cuello y unificar la cara y las orejas entre los sets.
8. **[00:06.0]** No hay subtítulo mientras la voz termina "glass wall"; falta "wall" → regla de subtítulos sincronizados → agregar el chunk "wall" (o "a glass wall").
9. **[00:12.5, 00:20.0]** El subtítulo se solapa con la golosina (12.5) y con la mano/golosina del dueño (20.0) → legibilidad → subir o bajar el subtítulo en esos planos.
10. **[00:03.0–00:03.5]** El título "GERMANY, 2021" dura apenas ~1 s y entra antes de que la voz diga "Germany" → "ningún plano demasiado corto para leerse" → alargarlo ~0.5 s y sincronizarlo con la palabra.
11. **[00:02.5–00:12.0]** Las paredes del laboratorio son paneles grises lisos y casi vacíos → "sets con sentido / set dressing" → es menor, pero convendría añadir algo de detalle en las paredes.

## Cumple
- Nombre del canal correcto: el cartel dice "DOGGO POLY SHORTS" (00:17.5).
- Cielo: foto real con nubes en la puerta, con casa de ladrillo y pasto afuera; el pasillo tiene profundidad y set dressing (alfombra, felpudo, botas, cuadros).
- Cuadros variados en el laboratorio (perro científico, perro graduado, Napoleón) y fotos en el pasillo.
- El set de laboratorio es legible y concreto: vidrio con marco de madera, mesa, trípode, estante, cono naranja y cinta amarilla en el piso.
- Cámara siempre en movimiento, con ángulos variados (nivel perro, humano a su altura, un solo contrapicado en 00:20–00:21).
- Subtítulos Courier amarillos con borde negro, legibles y casi siempre sincronizados con la voz.
- Texto 3D amarillo con escalones de borde, legible.
- Narrativa clara: el perro con gesto escéptico y cejas pesadas calza con "he knows", y el perro deja de mover la cola al ser burlado (00:16–00:17).
- Dos humanos distintos entre sí, con expresiones variadas (sonrisa, sorpresa, risa).
- La frase final termina completa; "passed dogs treats" se respeta tal cual.

## No verificable
- Voz, música (Bert Cole), SFX, niveles y master a ~−11 LUFS: usar earshot timeline/critique.
- Pops o parpadeos entre fotogramas consecutivos (instancias, sombras, near-plane, vidrio transparente): hacer diff por frame y mirar los picos, no solo cada 0.5 s.
- Aplicación del dither `ps1_post` y del vertex wobble: el cielo y las paredes se ven muy limpios en estos fotogramas; compararlos contra el frame crudo.
- Fluidez del mocap y del ciclo del perro (caminar, agacharse a agarrar, mover la cola) entre fotogramas.
- Si el vídeo termina limpio tras "doing" a los 21.0 s, o corta justo al acabar la voz.
- La rampa del estudio que menciona el contexto no aparece en ningún fotograma; revisar si debía verse.
