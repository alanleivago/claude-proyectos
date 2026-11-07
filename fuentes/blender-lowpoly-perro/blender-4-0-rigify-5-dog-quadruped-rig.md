# [Blender 4.0 RIGIFY] ＃5: Dog/Quadruped Rig

- Link: https://www.youtube.com/watch?v=bH0xkGflJ0k
- Canal: CGDive (Blender Rigging Tuts)
- Fecha: 2026-11-06
- Tema: blender-lowpoly-perro

## De qué trata
Es el capítulo 5 del curso de Rigify de CG Dive: se riggea un perro (modelo de Sketchfab, con malla dividida en objetos) usando el Meta-Rig de lobo, incluyendo un rig facial. Explica la alineación de huesos, la generación del rig, el parenting con pesos automáticos y la corrección de pesos. Sirve para quien ya conoce lo básico de Rigify y quiere riggear cuadrúpedos. Ojo con el tema "lowpoly": el modelo usado no es lowpoly, es un perro detallado con textura.

## Pasos / método
1. **[01:34]** Agregar un Meta-Rig: Shift+A > Armature > Animals > Wolf (no hay de perro). Escalarlo al tamaño del perro y aplicar escala con Ctrl+A.
2. **[01:58]** Pasar a Solid con X-Ray, entrar a Edit Mode y mover todos los huesos en Y desde la vista lateral. Si hace falta, reescalar el rig en Object Mode y aplicar escala otra vez.
3. **[02:18]** Alinear primero cola, columna y cabeza: con L sobre una cadena se selecciona entera y con Shift+H se ocultan los demás huesos.
4. **[02:42]** Alinear la cola sin desconectarla de la columna (se mueven en bloque con box select) para evitar errores al generar.
5. **[03:13]** Ubicar la unión columna-cuello y luego el resto de la columna, algo metida hacia adentro del cuerpo, sin buscar exactitud anatómica.
6. **[03:39]** Colocar la unión cuello-cabeza como punto de rotación de la cabeza, guiándose por una imagen de anatomía. El hueso de cabeza se posiciona de forma distinta si hay cara o no (ver consejos).
7. **[05:18]** Si no se quiere cara: ocultar cuello y cabeza, seleccionar todos los huesos faciales (incluido "face") y borrarlos. Existe también el meta-rig Basic Quadruped, sin cabeza ni dedos.
8. **[06:03]** Patas delanteras: activar simetría X, aislar escápula, esternón y pata. Alinear escápula, brazo, antebrazo, "palma" y dedos, extendiendo el hueso de dedos hasta el punto donde apoya el suelo.
9. **[07:25]** Revisar desde la vista frontal y desplazar un poco en X (poco, para que la flexión no quede rara).
10. **[08:11]** Aislar la palma, usar vertex snapping para unir huesos de palma y dedos, y ajustar. Los dedos van rectos desde arriba y levemente curvados de lado (orientación Normal, aplastando la cadena en X) **[09:09]**.
11. **[09:32]** Ubicar el hueso de apoyo del pecho (breast) en el pecho, cerca de las patas delanteras. Se puede borrar para reducir huesos, compensando con pesos.
12. **[10:11]** Patas traseras: igual que las delanteras (muslo, pierna, pie elevado, dedos); luego alinear huesos de pelvis (de apoyo) **[11:25]**.
13. **[11:44]** Cara: ocultar los huesos del cuerpo, ocultar el hueso "face" (su posición no importa), mover las orejas a un lado y ocultar el lado derecho desde la vista frontal.
14. **[13:02]** Alinear desde la vista lateral los huesos centrales: punta de nariz, final del hocico, labio superior e inferior, mentón (sin pasarse para no afectar el cuerpo), dientes superiores/inferiores, lengua y comisura de la boca.
15. **[15:24]** Colocar los huesos de ceja, párpados y ojo.
16. **[15:54]** En perspectiva con snapping a Face, seleccionar conexiones y mantener Ctrl para pegarlas a la superficie (excepto los huesos del medio y los de la nariz). Hacer lo mismo con cejas, ojo y párpados **[17:02]**.
17. **[18:02]** Ojo: aislar el globo, seleccionar el edge loop central, Shift+S Cursor to Selected, y luego Shift+S Selection to Cursor con el hueso del ojo. No achicar el hueso, porque afecta la distancia y tamaño del control de ojos.
18. **[19:07]** Ajustar la mandíbula: el pivote debe quedar más cerca del ojo; retocar huesos vecinos. Alt+H para mostrar todo.
19. **[20:05]** Orejas: en Pose Mode, tomar el hueso superior, poner el cursor 3D en la base de la oreja, Selection to Cursor, rotar y escalar. Activar simetría X en pose, usar G y R para simetrizar y Ctrl+A > Apply Pose as Rest Pose para normalizar la escala **[20:47]**. Después, en Edit Mode, pegar los huesos a la superficie de la oreja.
20. **[21:34]** Pulsar Upgrade Face Rig y confirmar. Tras actualizar, mover las conexiones siempre juntas.
21. **[22:15]** Subdividir los huesos del labio: seleccionar los dos de la comisura, clic derecho > Subdivide, 2 cortes (4 huesos por lado), y alinearlos con snapping a Face.
22. **[22:50]** Generar el rig.
23. **[24:14]** Parentear: malla del perro, Shift+rig, Ctrl+P > With Automatic Weights. Si da error de bone heat: escalar el rig ×100 (S, 100), repetir el parenting, luego Alt+P Clear Parent al perro, Alt+S en el rig para resetear escala y parentear otra vez **[25:02]**.
24. **[25:51]** Probar controles: IK de patas, control de pie y dedos, pole toggle, torso (caderas y pecho), clavícula, mandíbula, nariz, ojos y orejas.
25. **[28:19]** Ojos, dientes y bigotes: en Pose Mode, seleccionar todo y Pose > Clear Transform > All. Ocultar el perro, seleccionar ojos, dientes y bigotes, Shift+rig, Ctrl+P > With Empty Groups.
26. **[28:51]** Asignar a mano grupos de vértices: eye.L / eye.R a cada ojo, teeth.T a los dientes superiores, teeth.B a los inferiores (seleccionar todo, Assign).
27. **[30:07]** Bigotes: modificador Data Transfer, encima del modificador Armature, con el cuerpo del perro como fuente. Activar Vertex Data > Vertex Groups y Generate Data Layers; después aplicarlo para que los pesos sean permanentes **[30:47]**.
28. **[31:38]** Corregir en el Meta-Rig: bajar a 0.3 el eyelid follow del hueso de ojo, volver a generar el rig.
29. **[32:18]** Weight paint: activar la colección DEF, seleccionar rig y luego malla, entrar a Weight Paint. Alt+clic en el hueso para elegir el grupo, Auto Normalize activo, simetría activa, strength bajo, F para el tamaño del pincel.
30. **[33:03]** Orejas: Ctrl+clic quita peso del cráneo, Shift+clic difumina; wireframe ayuda a ver. Pintar peso del cráneo para el hueso de cabeza si hace falta.
31. **[35:11]** Párpados: Ctrl+clic y difuminar en los inferiores; difuminar los superiores para reducir el efecto.
32. **[36:17]** Hombro: quitar influencia con Ctrl+clic (Auto Normalize la reparte a huesos cercanos). Si el hueso no tiene influencia, el difuminado no funciona, así que primero agregar un poco.
33. **[37:36]** Cola: hay control principal que produce el movimiento de "mover la cola" y huesos tweak, que sirven para efectos cartoon o sutiles como la respiración (escalar poco).

## Lo que se ve en pantalla
- **[00:39–01:19]** Modelo dividido en: cuerpo, ojos, dientes superiores, dientes inferiores y bigotes (objetos separados).
- **[01:19]** Menú Add > Armature > Animals > Wolf (Meta-Rig); también aparecen Bird, Cat, Horse y Shark.
- **[03:17–04:37]** Panel Move con Proportional Editing activo (Smooth, tamaño ~0.010) y Connected activo al mover huesos.
- **[08:34]** Menú de snapping: Snap To = Volume (para los dedos), Face más adelante; Affect: Move.
- **[21:46]** En Properties > Armature, el botón "Generate Rig" y la sección Rigify; "Upgrade Face Rig" se ve en el panel del Meta-Rig.
- **[24:25]** Rig generado con panel "Rig Layers": Face (Primary/Secondary), Spine (Tweak), Paws, Arm L/R (IK, FK, Tweak), Leg L/R, Tail, Root.
- **[25:44–26:23]** Rig Main Properties: IK-FK, IK Stretch, Toggle Pole, Pole Parent, Tail Follow, Neck Follow, Head Follow, Torso Parent.
- **[27:42]** Eyelids Follow en el hueso eye_common (valores 1.000 antes del ajuste).
- **[29:02]** Vertex Groups de los dientes: DEF-teeth.T y DEF-teeth.B, peso 1.000.
- **[32:20]** Weight Paint: Blend Add, weight 1.000, radius ~128–157 px, strength ~0.113–0.235, Mirror Vertex Groups en X, Auto Normalize.
- **[38:16]** Diapositiva: digitígrado (perro, lobo, gato, león, zorro), ungulígrado (caballo, cebra, oveja, cabra, ciervo) y plantígrado (humano, chimpancé, oso, ratón, mapache).
- **[38:56]** Curso en early access en academy.cgdive.com: $3.99 por el curso, 5.99 la suscripción (según el audio), gratis desde ~febrero 2024.

## Consejos y advertencias
- **[01:26]** En rigging es más fácil doblar que enderezar: por eso el autor enderezó la cola y levantó las orejas del modelo.
- **[02:54]** No desconectar la cola de la columna: provoca errores al generar. Lo mismo con el cuello **[23:17]**.
- **[03:39]** El punto de unión cabeza-cuello es el pivote de la cabeza; conviene consultar una imagen de anatomía.
- **[04:02]** Sin cara, el hueso de cabeza va más grande/adelante para ayudar a los pesos automáticos. Con cara, se acorta para que no compita con los huesos faciales.
- **[04:37]** Al mover con G es fácil pulsar F por error, lo que crea un hueso nuevo y rompe la generación; deshacer. También H oculta huesos sin querer.
- **[07:33]** No desplazar demasiado los huesos de las patas en X, o la flexión se ve rara.
- **[07:03]** Los perros caminan sobre los dedos; el "pie invertido" es en realidad un pie elevado.
- **[12:17]** El hueso "face" central no hace falta alinearlo.
- **[13:47]** No alargar demasiado el hueso del mentón: empieza a afectar al cuerpo.
- **[16:01]** No subdividir huesos de la boca antes de hacer el Upgrade Face Rig; se hace después. Hay zonas que no se deben tweakear (conviene conocer los tipos de piel modular) **[21:50]**.
- **[18:41]** No achicar el hueso del ojo: cambia el tamaño y la distancia del control.
- **[20:51]** Aplicar Pose as Rest Pose tras escalar huesos de las orejas, para normalizar la escala.
- **[22:44]** Si tras el upgrade hay que mover huesos, seleccionar bien las conexiones y moverlas juntas.
- **[23:44]** Errores de generación: el mensaje nombra el hueso desconectado; reconectarlo con vertex snapping resuelve ~90% de los casos.
- **[30:53]** Aplicar el Data Transfer de los bigotes, porque si queda vivo los pesos pueden cambiar durante la animación.
- **[32:35]** En weight paint, activar Auto Normalize; Ctrl+clic quita peso y lo reparte a huesos cercanos.

## Lo que no queda claro
- El video no trata de modelado lowpoly: el perro es de alto detalle; no hay información sobre topología ni reducción de polígonos para esta malla.
- No se explica el uso de la imagen de referencia anatómica (se menciona como "mostrada en pantalla" pero no se identifica la fuente).
- No se muestran valores exactos de escala del Meta-Rig ni cuánto se escaló "un poco".
- Las demás partes del rig (extremos de la cola, huesos de pezuña en caballos y osos) se dejan para el capítulo bonus, que es de pago.
- Un cambio en la transcripción: en [23:00–23:14] el audio está confuso y repetitivo; no se entiende bien qué hacía el autor ahí.
- El "bone heat weighting error" se resuelve con un truco de escala; el autor dice tener otro video con ~10 soluciones, que no se muestra aquí.
