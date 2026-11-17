# How to Model a Face!✨ Blender 3D Character Modeling Tutorial - Part 4 [2024]

- Link: https://www.youtube.com/watch?v=wXem71To_KA
- Canal: Crashsune Academy
- Fecha: 2026-11-16
- Tema: mml crashsune modelado low poly

## De qué trata
Es un capítulo de un curso de Blender sobre modelado low poly de un personaje estilo "Love-chan" (referencia tipo Mega Man Legends). Enseña a modelar la cara: se parte de un plano con modificador Mirror, se ajusta primero la vista frontal contra la imagen de referencia con la herramienta Knife, y luego se da volumen en la vista lateral. El resultado es una cabeza low poly simétrica, con nariz y mandíbula, que coincide con la referencia. Está pensado para principiantes en Blender y 3D.

## Pasos / método
1. **[00:37]** Se simplifica el trabajo: en modo objeto se selecciona la imagen de referencia y se baja su opacidad. Así se puede trabajar viendo el dibujo debajo. Solo se atiende una vista a la vez (frontal, luego lateral).
2. **[01:28]** Se revisa el modelo final de la cara (vista frontal y lateral) para saber a qué apuntar: pocos vértices y una estructura sencilla.
3. **[01:33]** Se agrega un plano (Shift+A → Mesh → Plane), se entra a modo edición, se rota 90° en X para que mire al frente, se escala y se sube con G Z hasta la cara de la referencia.
4. **[01:53]** Se activa X-ray (Alt+Z), se baja un poco y se escala para ajustarlo a la cara.
5. **[02:06]** Se hace un Loop Cut en el centro, se borran las caras de una mitad (selección de caras → Delete) y se agrega el modificador **Mirror**, para modelar solo medio rostro.
6. **[02:18]** En selección de vértices se sube un vértice (barbilla/punta) y se mueve otro hacia el costado para darle forma a la cara.
7. **[02:34]** Se usa la **Knife** para crear aristas nuevas a partir de las existentes: clic en una arista (aparece un cuadrado verde), se arrastra y se confirma con otro clic. Esto reproduce las aristas que se ven en la referencia.
8. **[03:29]** Se vuelve a Select Box y se mueven vértices para que la silueta coincida mejor con la referencia.
9. **[03:58]** Se hacen más cortes con Knife: clic, clic y Enter para confirmar cada corte. Se hacen varios, incluido uno hacia el centro a la altura de la nariz. Se agregan un par de aristas extra para igualar la referencia.
10. **[04:48]** Se ajustan vértices en el eje Z (bajar, subir, mover hacia dentro) hasta que la vista frontal queda muy cercana a la referencia.
11. **[05:14]** Se detecta el problema: la malla es totalmente plana en la vista lateral, mientras que la referencia tiene profundidad.
12. **[05:40]** Se selecciona la nariz y se la mueve con G Y para sacarla hacia afuera. Lo mismo con los otros vértices que deben sobresalir.
13. **[06:05]** Se pasa a la vista lateral derecha (Numpad 3) y se alinean los vértices con el perfil de la cara usando G Y: nariz como punto saliente, triángulo, frente, etc.
14. **[06:43]** Se detectan dos vértices duplicados en la nariz. Se seleccionan, se abre F3, se busca "merge" y se elige **Merge → At Last**.
15. **[07:21]** Se compara con el modelo final de Love-chan. La parte trasera de la cabeza no necesita llegar tan atrás, porque el pelo la cubrirá luego (esto puede variar según el gusto).
16. **[07:46]** En vista sólida se recrea el patrón de la mandíbula inferior y sus aristas con Knife (clic en vértices, Enter). Se hace Alt+A para deseleccionar entre cortes.
17. **[08:23]** Se elimina una arista sobrante: modo arista (tecla 2), se selecciona, Delete → **Dissolve Edges**. El resultado es un quad limpio.
18. **[08:46]** Se compara el lateral con la referencia, se baja la mandíbula y se activa X-ray para verificar el encaje.
19. **[09:15]** En la vista frontal (tecla 1) se ve que algo se desalineó; se corrige con selecciones por caja moviendo en X.
20. **[09:33]** Se rota alrededor del modelo en vista sólida para revisarlo, y se retocan nariz (más pequeña/puntiaguda, más hacia atrás y abajo) y ojos/vértices altos según la referencia.
21. **[10:29]** Como hay Mirror, los cambios se reflejan en el otro lado.
22. **[10:38]** Se arregla un pequeño agujero: un vértice se desplazó en X y no se fusiona. Se mueve con G X hasta que el merge del Mirror vuelva a actuar.
23. **[11:04]** Se comprueba el resultado frente y lateral contra la referencia, y se sube un poco un elemento por estética.
24. **[11:21]** Recurso: The Models Resource, para descargar modelos 3D de juegos (ej. Mega Man Legends) y estudiar su topología.

## Lo que se ve en pantalla
- **[00:37–00:50]** Referencia (Empty con imagen "Lovechan-Frontview.png") con la opacidad bajada de 1 a ~0.103 en el panel de propiedades del Empty.
- **[01:03–01:28]** Vistas del modelo terminado: perspectiva, lateral derecha y frontal ortográfica (cabeza con nariz triangular, mandíbula facetada).
- **[01:40]** Rotación en X por teclado: R X 90 Enter. El panel de operador muestra ángulo 90°.
- **[02:18]** Panel Modifiers: Mirror con eje X activo, Merge activado (≈0.001 m) y Clipping desmarcado.
- **[02:43]** Herramienta Knife seleccionada en la barra de herramientas izquierda; opciones "Occlude Geometry", "X-Ray" y "Only Selected".
- **[06:56]** F3: búsqueda "merge" con opciones At Center, At Cursor, At First, At Last, By Distance, Collapse. Se elige At Last.
- **[08:24]** Modo arista con tooltip "Edge select"; **[08:37]** menú Delete con "Dissolve Edges" (panel inferior con Dissolve Vertices activo).
- **[11:33–11:59]** Web The Models Resource: búsqueda "Meg", consolas de la izquierda, página de Mega Man Legends 2 con lista de personajes descargables.
- **[00:00]** Superposición en cámara con teclas pulsadas: sirve para ver los atajos usados (G, Ctrl+S, Numpad 3, etc.).

## Consejos y advertencias
- **[00:43]** Simplificar es clave: la cara es difícil, pero con pocas vistas y pocos vértices es manejable.
- **[01:11]** Trabajar una vista a la vez: primero la frontal, luego la lateral.
- **[02:12]** Modelar solo la mitad con Mirror ahorra trabajo y garantiza simetría.
- **[04:12]** Con Knife, el flujo es clic, clic, Enter; sin Enter no se confirma el corte.
- **[05:14]** Un modelo que coincide en una vista suele estar plano en la otra; hay que revisar siempre varias vistas.
- **[06:01]** Corrección: se presionó Numpad 3 en lugar de otra vista; hay que verificar que se está en la ortográfica correcta.
- **[06:48]** Evitar vértices duplicados: se arreglan con Merge At Last.
- **[07:29]** La parte trasera de la cabeza no necesita volumen porque la cubre el pelo.
- **[09:24]** Al mover vértices se pueden desalinear en la vista frontal; usar restricciones de eje (G Z, G X) y revisar en X-ray.
- **[10:15]** Los retoques finales (tamaño de nariz, etc.) son preferencia personal.
- **[10:38]** Si queda un agujero en la malla por el Mirror, mover el vértice en X hasta que se fusione.
- **[11:21]** Estudiar topología de modelos descargados como referencia.
- **[00:00]** Promoción: guía de atajos y versión Gumroad del curso (modelo final, videos descargables, turnaround).

## Lo que no queda claro
- No se especifica si se activó la opción Merge con Clipping en el Mirror ni por qué el vértice central se separó, más allá de "se movió en X".
- Valores numéricos exactos (escala, posiciones, opacidad final) casi no se dictan; hay que guiarse por la referencia visual.
- No se explica cómo se obtienen los dos tipos de vista (frontal/lateral) más allá de los atajos Numpad 1 y 3.
- La parte de las aristas de la mandíbula y los cortes con Knife se describe en gran medida por "clic aquí, clic aquí"; sin ver el video es difícil reproducir los vértices exactos.
- El título "mml crashsune" no aparece en el video; el tema es el rostro low poly de Love-chan, con referencia a modelos de Mega Man Legends (MML) solo como fuente de topología.
