# Creating a 2D Face Animation Rig! ✨ Blender Character Tutorial - Part 11 [FINALE]

- Link: https://www.youtube.com/watch?v=3fHeWqKpBTc
- Canal: Crashsune Academy
- Fecha: 2026-11-16
- Tema: mml crashsune modelado low poly

## De qué trata
Es un tutorial de Blender, parte de la serie de modelado low poly de Crashsune, sobre cómo animar la cara de un personaje con texturas 2D (ojos y boca) intercambiables. Se arma una textura facial con seis expresiones en fila, un shader que salta entre ellas y huesos en el rig que controlan ese cambio. Está pensado para quien ya tiene un personaje low poly con rig y UVs, y el resultado es poder animar expresiones moviendo huesos de control, con ojos y boca por separado.

## Pasos / método
1. **[01:04]** Descargar la textura facial corregida (`...facial textures fixed .png`) desde el post de Patreon enlazado en la descripción. La versión original tenía problemas.
2. **[01:17]** Seleccionar la cara del personaje, ir a Material Properties, agregar un slot, elegir el material del cuerpo y duplicarlo. Renombrar el nuevo a "Lovechan_Face".
3. **[01:43]** Abrir un panel inferior como Shader Editor. Arrastrar la nueva textura al editor, conectarla en lugar de la del cuerpo y borrar la anterior.
4. **[02:23]** Aislar el modelo (`/`), pasar a vista frontal, Edit Mode, `3` (face select) y seleccionar todas las caras que se van a animar (ojos, nariz, boca, etc.). Comprobar con `H` y pulsar **Assign** en el material de la cara.
5. **[03:26]** Rehacer las UVs porque la textura nueva tiene otras dimensiones: con las caras seleccionadas, `U` → Project from View. Abrir el UV Editor, escalar y mover las UVs sobre la primera expresión, alineando la sombra de la nariz con la base de la geometría de la nariz (sin buscar perfección).
6. **[04:35]** Con Node Wrangler activo, seleccionar el nodo de textura y pulsar `Ctrl+T` para añadir Texture Coordinate + Mapping. Si no aparece, activarlo en Edit > Preferences > Add-ons.
7. **[05:10]** Cambiar a Material Preview o Rendered para ver los cambios. Mover **solo el Location X** del Mapping desplaza la textura entre las expresiones, porque están en una fila horizontal.
8. **[06:04]** Crear seis nodos **Combine XYZ** (`Shift+A` → buscar, `Shift+D` para duplicar), uno por expresión. Cada uno se prueba conectándolo al Location del Mapping.
9. **[07:17]** Ajustar el X de cada nodo con `Shift` para mayor precisión. La segunda expresión queda en 0.164 (con prueba y error). Las siguientes se calculan multiplicando ese valor: escribir `*2`, `*3`, `*4`, `*5` en el campo.
10. **[09:09]** Ajustar a mano la cuarta expresión (0.493) porque quedaba levemente desalineada. Probar cada nodo conectando su vector al Location y trabajar en Object Mode para que el deshacer no complique.
11. **[10:15]** Añadir nodos **Mix** en modo Vector con Factor 0. Encadenarlos: el Combine XYZ #1 va a A y el #2 a B del primer Mix. El resultado va a A del siguiente Mix y el siguiente Combine a su B, y así hasta incluir las seis. La salida final va al Location del Mapping.
12. **[12:12]** Para que el cambio sea instantáneo y no un deslizamiento, añadir un nodo **Value** y nodos **Math** en modo "Greater Than" con umbrales 1, 2, 3, 4 y 5. El Value alimenta todos los Math y cada Math alimenta el Factor de su Mix.
13. **[14:00]** Verificar: al subir el Value, la expresión salta al pasar cada umbral. Con 5 se llega a la sexta expresión, porque por debajo de 1 está la primera.
14. **[15:01]** Salir del aislamiento. Con el rig en Edit Mode, `Shift+A` para crear un hueso y nombrarlo `face_control`. Escalarlo, moverlo y rotarlo −90° vista de lado.
15. **[15:40]** Crear una colección de huesos nueva ("Face Controllers"), asignar el hueso y usar la estrella (solo) para aislar la colección.
16. **[16:08]** En Object Mode, con el material de la cara, clic derecho en el Value → **Add Driver**. Si el menú desaparece, clic derecho de nuevo → Edit Driver.
17. **[16:35]** Configurar el driver: tipo Scripted Expression, variable `var` con Object = rig, Bone = `face_control`, Type = Z Location, Space = **Local Space**.
18. **[17:30]** Si el hueso solo reacciona hacia abajo, corregir el roll en Edit Mode (panel N): pasar de −180° a 0. Para ver los ejes, activar "Axes" en Object Data Properties > Viewport Display.
19. **[19:11]** Editar la expresión del driver para multiplicar por un factor (probó 10 o 15, ver abajo) y así necesitar menos movimiento del hueso.
20. **[20:04]** En Pose Mode, pestaña Bone Constraints, añadir **Limit Location**. Marcar mínimo y máximo de X e Y, con Owner = Local Space, para que solo se mueva en Z.
21. **[21:02]** Mover el hueso hasta la última expresión, copiar ese valor de Z y activarlo como Maximum Z (el mínimo ya es 0). Así el hueso no pasa del rango útil.
22. **[21:41]** Opcional: cambiar el color del hueso en Bone Properties > Viewport Display.
23. **[22:08]** Para separar ojos y boca: crear otro slot, duplicar el material de la cara y llamarlo "Lovechan_Mouth". En Edit Mode, seleccionar solo las caras de la boca y asignarlas a este material.
24. **[22:50]** En Edit Mode duplicar el hueso (`Shift+D`) y moverlo en X. Renombrar uno a `mouth_control` y el otro a `eye_control` (`F2`). Opcionalmente darles colores distintos.
25. **[23:29]** Reconfigurar los drivers: en el material de la boca apuntar el Bone a `mouth_control`. Renombrar el material de la cara a "Lovechan_Eyes" y apuntar su driver a `eye_control`.
26. **[24:30]** Probar en Pose Mode (`Ctrl+Tab`): cada hueso cambia solo los ojos o solo la boca. Desactivar el aislamiento de la colección (estrella).
27. **[25:08]** Opcional: en Bone Properties > Relations, poner como parent el hueso de la cabeza (`DEF-spine.006`) en ambos huesos de control para que acompañen la rotación de la cabeza.

## Lo que se ve en pantalla
- **[03:29]** UV Editor mostrando la textura facial: una fila horizontal de seis expresiones, con el Image Editor abierto junto al viewport.
- **[04:47]** Nodos Texture Coordinate → Mapping (Type Point) → Image Texture → Emission. El Location X del Mapping es el que se modifica.
- **[07:25 / 08:17]** Valores de Combine XYZ visibles: X = 0.164 para la segunda expresión, escrito como expresión con asterisco para múltiplos.
- **[09:09]** Combine XYZ con X = 0.328 (×2) y 0.493 (cuarta expresión, ajustada a mano).
- **[10:28]** Nodo Mix con Data Type Vector, Factor 0 y casilla Clamp Factor activa.
- **[13:57 / 14:23]** Value en 2.5 con nodos Greater Than con umbrales 1.000, 2.000, etc.
- **[16:08–17:00]** Panel del driver: tipo Scripted Expression, expresión `var + 0.38` (se reemplazó), Object `rig`, Bone `Face_Control`, Type Z Location, Space Local Space.
- **[18:19]** Panel N con el roll del hueso a −180 → 0.
- **[19:11]** Expresión del driver editada a `var * 10`, con Value de 0.380 en morado (driver activo).
- **[20:30]** Panel Bone Constraints con Limit Location: casillas de Minimum/Maximum X, Y, Z; Owner = Local Space; Influence 1.000.
- **[21:22]** Maximum Z con un valor tipo 0.379 m.
- **[22:15]** Lista de slots de material: Lovechan_Body, Lovechan_Face, Lovechan_Face.001, renombrado a Lovechan_Mouth.
- **[25:18]** Bone Properties > Relations con el parent `DEF-spine.006`.

## Consejos y advertencias
- **[01:09]** Descargar la versión corregida de la textura, no la anterior.
- **[05:10]** Los cambios del mapping no se ven en Solid: usar Material Preview o Rendered.
- **[04:05]** No hace falta perfección en las UVs en este tutorial; el autor remite a sus videos de UV unwrapping para más detalle.
- **[09:39]** Trabajar en Object Mode mientras se prueban los nodos, porque el deshacer en Edit Mode es incómodo.
- **[07:17]** Mantener `Shift` mientras se arrastra un valor da más precisión.
- **[14:27]** El umbral máximo es 5 con seis texturas porque la primera corresponde a valores menores a 1.
- **[14:41]** Animar directamente en el Shader Editor es incómodo; por eso conviene el hueso con driver.
- **[16:22]** Si el menú del driver desaparece, se recupera con clic derecho → Edit Driver.
- **[17:10]** Usar Local Space en el driver y en el constraint; en World Space el comportamiento se vuelve confuso (y el hueso se teletransporta).
- **[17:30–18:21]** Si el hueso solo funciona hacia abajo, revisar el roll: Blender es Z-up.
- **[20:56]** Limitar el hueso evita que se mueva en direcciones sin sentido (X, Y o Z negativo).
- **[23:39]** Al editar el driver del material de la boca, comprobar que esté seleccionado ese material y no el de la cara.
- **[25:54]** El autor avisa de que el precio del curso en Gumroad sube el 7 de septiembre.

## Lo que no queda claro
- Los valores de X dependen de cómo estén espaciadas las seis expresiones en la textura; con otra textura habrá que recalcularlos (aquí 0.164 por paso).
- No se explica por qué el factor del driver pasa de 15 (dicho en audio, [19:23]) a 10 (visible en pantalla, [19:11]); cualquier número sirve y conviene ajustarlo a mano.
- No se detalla cómo usar Limit Location en cada hueso nuevo: al duplicar los huesos el constraint se copia, pero el Maximum Z se calculó para uno solo y puede requerir ajuste.
- Al duplicar el material para la boca, los nodos y thresholds se copian, pero no se muestra cómo quedan los ojos (que siguen usando también las caras de la boca hasta reasignar).
- No se muestra el rig completo ni cómo se hicieron previamente el rig y las UVs del cuerpo (se asumen de videos anteriores de la serie).
