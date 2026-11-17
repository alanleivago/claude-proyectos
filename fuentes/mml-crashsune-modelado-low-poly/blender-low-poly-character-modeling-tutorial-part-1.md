# Blender Low Poly Character Modeling Tutorial - Part 1

- Link: https://www.youtube.com/watch?v=Use9T2IX1XE
- Canal: Crashsune Academy
- Fecha: 2026-11-16
- Tema: mml crashsune modelado low poly

## De qué trata
Es el primer video de una serie gratuita de Crashsune (Love-chan) sobre modelado de personajes low poly en Blender, pensada para usuarios intermedios, aunque remite a una lista para principiantes. Enseña a preparar la escena: motor de render, gestión de color, guardado incremental, y a importar y alinear las imágenes de referencia (frente y perfil) junto con el Rigify meta-rig como referencia de escala. El resultado es una escena lista para empezar a modelar en el siguiente video.

## Pasos / método
1. **[01:50]** Abrir la escena por defecto de Blender para configurarla, de modo que el modelo se vea como se pretende durante toda la serie.
2. **[02:13]** En la pestaña Render, confirmar que el motor es EEVEE (en la transcripción aparece como "EV"). Cycles es un renderer por trazado de rayos y no sirve para este estilo.
3. **[02:28]** Verificar que estén desactivados Ambient Occlusion, Bloom, Screen Space Reflections y Motion Blur.
4. **[02:42]** En Color Management, cambiar View Transform de AgX (valor por defecto) a **Standard**. Así el render se parece al de un motor de juegos y las texturas hechas en otros programas se ven idénticas en Blender, sin desaturación ni cambios de tono.
5. **[03:29]** Borrar el cubo por defecto para empezar con la escena limpia (opcional).
6. **[03:43]** File > Save As: crear una carpeta (p. ej. "LowPolyCharacter") y guardar el .blend dentro. Conviene que esté en una carpeta sincronizada con la nube (OneDrive, Dropbox).
7. **[04:39]** Guardado incremental con Ctrl+Alt+S: crea LowPolyCharacter1, 2, etc. Permite volver a versiones anteriores desde File > Open.
8. **[05:49]** Descargar el recurso desde el enlace de la descripción (Patreon de Crashsune). Hay que iniciar sesión y pulsar "Join for free". Se descarga el zip de recursos.
9. **[06:31]** Extraer el zip (clic derecho > Extract all). De los archivos, solo se usan por ahora las imágenes de frente (front view) y de lado (side view).
10. **[07:00]** Copiar la dirección de la carpeta (clic derecho en la barra de direcciones) para usarla en el selector de archivos de Blender.
11. **[07:13]** Shift+A > Image > Reference. Pegar la ruta con Ctrl+V en la barra de direcciones, importar la vista lateral y repetir con la frontal.
12. **[08:09]** Activar el add-on Rigify: Edit > Preferences > Add-ons, buscar "Rigify" y marcar la casilla.
13. **[08:23]** Shift+A > Armature > Human (Meta-Rig). No se usará el rig en sí, solo como referencia de escala humana.
14. **[09:05]** Seleccionar ambas referencias y pasar a vista frontal ortográfica (clic en la Y del gizmo de navegación).
15. **[09:19]** Resetear transformaciones con Alt+S, Alt+G, Alt+R.
16. **[09:33]** Rotar 90° en X (R, X, 90, Enter) para que las imágenes queden de pie.
17. **[09:47]** Mover (G, Z) y escalar (S) hasta que la altura coincida con el meta-rig.
18. **[10:15]** Poner la opacidad de cada referencia en 0.5 (casilla Opacity en las propiedades del empty) para ver mejor la alineación.
19. **[10:29]** Alinear los pies con el plano del suelo (línea roja) con G, Z, y centrar en X con respecto a la línea azul del eje Z.
20. **[11:25]** Mover la referencia frontal hacia atrás con G, Y. Rotar la lateral 90° en Z (R, Z, 90) y desplazarla con G, X para dejar espacio de trabajo.
21. **[12:21]** Revisar en vista lateral. Ajustar con G, Y hasta que la cabeza y los pies coincidan con el meta-rig.
22. **[13:03]** Verificar el resultado final en vista de perspectiva con ambas referencias y el rig.

## Lo que se ve en pantalla
- **[02:19]** Render Engine: desplegable con EEVEE, Workbench y Cycles. La captura muestra que está en EEVEE.
- **[03:01]** Color Management > View Transform: desplegable con Standard, AgX, Filmic, Filmic Log, False Color, Raw. Se elige Standard.
- **[04:25]** Menú File con Save, Save Incremental, Save As, Save Copy, etc.
- **[05:21]** Imagen de referencia de Love-chan (frente y perfil) y, en el [06:03], un esquema por colores con zonas numeradas: 1 pelo, 2 cara, 3 cuello, 4 torso, 5 brazos, 6 manos, 7 cintura, 8 piernas, 9 pies.
- **[07:13]** Diálogo "Load Reference Image" con la opción "Align to View" marcada.
- **[08:09]** Preferences > Add-ons con el buscador usado para Rigify.
- **[09:19]** Overlay en pantalla de los atajos Alt+S, Alt+G, Alt+R.
- **[10:15]** Panel del empty (Data) con Opacity en 0.5; las opciones Orthographic y Perspective aparecen marcadas.
- **[13:31]** Pantalla promocional de Gumroad: videos, proyecto y dibujos.

## Consejos y advertencias
- **[02:20]** No usar Cycles para este estilo.
- **[02:54]** AgX está pensado para fotorrealismo y distorsiona los colores de un estilo estilizado. Usar Standard.
- **[04:00]** Guardar el proyecto en una carpeta con copia de seguridad en la nube.
- **[04:27]** Guardar con Ctrl+S constantemente y hacer un guardado incremental al terminar cada video.
- **[08:45]** El meta-rig no se necesita para el modelado, solo como referencia de proporciones humanas.
- **[09:26]** Cuidado con el eje de rotación: si al rotar con R gira mal, hay que forzar el eje con X o Z.
- **[12:41]** La alineación no tiene que ser perfecta; basta con que pies y cabeza coincidan aproximadamente.
- **[00:32]** La serie es para usuarios intermedios; quien empiece de cero debe ver antes la lista de principiantes.
- **[01:29]** Se recomienda Blender 4.0 o superior (geometry nodes más adelante).

## Lo que no queda claro
- Los valores exactos de escala de las referencias no se dan; se ajustan a ojo contra el meta-rig.
- En el [07:41] hay un cambio de carpeta en el selector de archivos que no se explica del todo (la ruta pasa de Downloads a otra ubicación).
- Los pasos de Patreon/Ko-fi y el enlace exacto dependen de la descripción del video, que no se ve.
- El video dice "EV" por EEVEE; se infiere por el contexto y la captura.
- Al final del video (13:03) aparecen objetos extra en el outliner (Cube.001, etc.) que no se explican, y la escena cambia respecto a lo anterior.
