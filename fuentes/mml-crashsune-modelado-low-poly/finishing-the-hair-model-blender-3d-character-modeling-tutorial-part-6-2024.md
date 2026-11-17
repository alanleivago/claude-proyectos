# Finishing the Hair model!✨ Blender 3D Character Modeling Tutorial - Part 6 [2024]

- Link: https://www.youtube.com/watch?v=KizxbPA1yGM
- Canal: Crashsune Academy
- Fecha: 2026-11-16
- Tema: mml crashsune modelado low poly

## De qué trata
Es un capítulo de una serie de Crashtune Academy sobre modelado low poly de un personaje ("Love-chan") en Blender. Se completa el pelo inferior de la cabeza, se arman los flequillos y se agregan modificadores Mirror a las demás partes, con lo que termina la etapa de modelado 3D. Sirve para principiantes que quieran aprender flujo de trabajo con vértices, aristas y triángulos usando una imagen de referencia, y el resultado es un modelo completo listo para pasar a UVs y texturas.

## Pasos / método
1. **[00:28]** Aislar el modelo para ver la parte inferior sin estorbos: seleccionar la cabeza y presionar `/`. Volver a presionar `/` para desaislar.
2. **[01:09]** Hacer cambios de proporción en modo edición: mover vértices del pelo inferior y bajar algunos hasta donde marca la referencia. Se fusionan vértices con Shift+clic y `M` → At Last.
3. **[01:58]** Crear triángulos para cerrar huecos: extruir (`E`) desde un vértice, fusionar con otro (`M` → At Last), pasar a selección de aristas (`2`), elegir las aristas y rellenar con `F`. Se repite para un segundo triángulo.
4. **[02:30]** Extruir desde una arista, fusionar vértices y alinearlos visualmente para que la malla conecte con la línea de la mandíbula.
5. **[03:11]** Si falta una arista que conecte con la mandíbula, cortarla con la herramienta Knife (clic–clic–Enter). Luego mover y fusionar vértices; eliminar los vértices que sobren.
6. **[04:03]** Pasar a la vista lateral (`3`) y comparar con la referencia lateral para verificar proporciones.
7. **[04:18]** Extruir más aristas del pelo hacia atrás, fusionar vértices en la punta y subirlos. Repetir el proceso con otra arista.
8. **[05:12]** Revisar la vista lateral, detectar huecos y rellenarlos con extrusión, fusión y `F`.
9. **[05:40]** Armar los triángulos de la parte superior con la misma secuencia (extruir, fusionar, `2`, clic en aristas, `F`). Se repite para tres o cuatro triángulos hasta cerrar el pelo.
10. **[06:47]** Ajustar a ojo en vista frontal y lateral, moviendo vértices con `G` hasta que coincida con la referencia.
11. **[07:27]** Cortar una arista con Knife para evitar un agujero en el modelo, y fusionar vértices para que no queden huecos.
12. **[08:17]** Salir del aislamiento con `/`. Se nota que el cuello se ve raro: aislar, box select de los vértices superiores del cuello y subirlos.
13. **[08:44]** Preparar los flequillos: en vista frontal (`1`), modo objeto, aplicar el modificador Mirror de la cabeza para poder editar ambos lados.
14. **[09:03]** Cortar con Knife (`T`) de un lado al otro de la frente y confirmar con Enter. Con Alt+H se recupera la referencia; se oculta el esqueleto.
15. **[09:40]** En modo arista, extruir (`E`) la línea cortada, fusionar al centro (`M` → At Center) y acomodar los vértices con `G`.
16. **[10:11]** Repetir en otra sección: deseleccionar todo (Alt+A), cortar con Knife, extruir esa arista para que el flequillo quede solo en ese tramo y fusionar al centro.
17. **[10:48]** Mover los mechones, bajarlos y darles algo de asimetría para que se vean más agradables.
18. **[11:19]** Mover los vértices hacia dentro con `G`, alternando con la vista frontal.
19. **[12:01]** Salir de edición y agregar el modificador Mirror (Add Modifier → Mirror) al pie, mano, brazo y pierna, que aún no lo tenían. Con eso termina el modelado.

## Lo que se ve en pantalla
- **[00:26]** Vista inicial en Blender 4.1 con la referencia (imagen con el personaje) y el modelo con un modificador Mirror activo (ejes en X).
- **[00:39]** Modelo aislado con `/` (el overlay de teclas muestra "/ x7").
- **[01:18]** Barra de herramientas izquierda de Blender con Select Box, Knife, Extrude Region, Loop Cut, etc. y el panel inferior de la operación `G`, con "Mirror Editing" tildado.
- **[03:17]** Herramienta Knife activa, con línea verde de corte entre dos vértices.
- **[04:23]** Menú Merge (`M`) con opciones At Center, At Cursor, Collapse, At First, At Last y By Distance.
- **[06:47]** Vista Front Orthographic con el atajo Numpad 1.
- **[08:19]** Objeto en modo objeto, con la referencia visible detrás.
- **[09:25]** Vista con las referencias en capas y un sprite de Sans (esqueleto) en pantalla; es el objeto "skeleton" que se oculta con `H`.
- **[10:04]** Tooltip de Knife: "Cut new topology" (atajo Shift+Espacio).
- **[12:03]** Buscador de modificadores con "Mirror" listado.
- **[12:29]** Modelo final completo de pie, con pelo, flequillo, brazos, piernas y botas.
- **[00:00]** Tabla de atajos de vista: 1 frontal, Ctrl+1 trasera, 3 derecha, Ctrl+3 izquierda, 7 superior, Ctrl+7 inferior, 5 perspectiva, ` menú de vistas, `.` orbitar alrededor de lo seleccionado, `/` aislar, Home encuadrar todo, Shift+` cámara en primera persona.

## Consejos y advertencias
- **[05:02]** Orbitar constantemente alrededor del modelo para detectar errores de proporción.
- **[01:32]** No buscar la perfección; lo valioso es aprender técnicas reutilizables.
- **[03:11]** Cortar aristas extra con Knife para que las conexiones coincidan, en vez de forzar la malla.
- **[07:27]** Evitar huecos en la malla cortando una arista y fusionando vértices.
- **[08:06]** Guardar con frecuencia (Ctrl+S, se ve repetido en pantalla).
- **[10:11]** Deseleccionar todo (Alt+A) antes de extruir para que la extrusión no se propague por toda la fila de aristas.
- **[10:55]** Añadir algo de asimetría a los flequillos suele verse mejor.
- **[08:06]** Los cambios de proporción dependen del modelo propio; cada resultado será algo distinto.

## Lo que no queda claro
- El proceso es repetitivo y se narra rápido; no siempre se indica con precisión qué vértices se seleccionan, así que hay que seguirlo con el video a la vista.
- En el audio hay frases confusas, probablemente errores de transcripción ("vert text select", "ferrets", "banks" por bangs).
- No se explica cómo se ocultó el esqueleto ni por qué aparece el sprite de Sans; solo se menciona que se oculta.
- Los pasos de configuración previos (modelo base, mirror, referencias) vienen de videos anteriores de la serie.
- No se dan valores numéricos exactos de posiciones; todo se ajusta a ojo.
