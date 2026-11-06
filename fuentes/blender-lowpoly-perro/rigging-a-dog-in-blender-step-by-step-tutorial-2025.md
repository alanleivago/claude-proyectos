# Rigging a Dog in Blender | Step-by-Step Tutorial (2025)"

- Link: https://www.youtube.com/watch?v=IQP39us1Rec
- Canal: 3D Code Academy
- Fecha: 2026-11-04
- Tema: blender-lowpoly-perro

## De qué trata
Es la parte 1 (rigging) de un tutorial de 3D Code Academy para animar un animal de cuatro patas en Blender; se usa un zorro/perro ya texturizado pero sin rig. Está pensado para principiantes y cubre la creación del armature hueso a hueso, el renombrado con sufijos .L para simetrizar, las patas con IK y polos, los controles y el bind de la malla con pesos automáticos. El resultado es un rig funcional de un lado, simetrizado y vinculado a la malla; la pintura de pesos y el ciclo de caminata quedan para partes siguientes.

## Pasos / método
1. **[01:34]** Activar Screencast Keys para mostrar teclas y mouse (panel N) y que se pueda seguir el proceso.
2. **[01:51]** Shift+A → Armature (hueso único), rotarlo 90° en X para meterlo dentro del cuerpo.
3. **[02:19]** En Bone Data (Viewport Display) activar "In Front" para ver el hueso a través de la malla.
4. **[02:37]** Pasar a Edit Mode y extruir (E) la columna: cadera, espalda, cuello y cabeza, alineando con la silueta del cuerpo.
5. **[03:10]** Usar Shift+E / extrusiones desde la cadera para la pata trasera (hombro/cadera, muslo, pierna, pie), verificando desde vista lateral (numpad 3), trasera (Ctrl+1) y superior (numpad 7).
6. **[04:54]** Repetir para la pata delantera: hueso de hombro, extrusiones para pierna y pie, comprobando alineación en todas las vistas.
7. **[06:03]** Añadir huesos de la cola y revisar en vista superior y laterales.
8. **[06:30]** Renombrar con F2 todos los huesos de un solo lado con sufijo .L (upper/mid/lower/foot back leg, shoulder/upper/lower/foot front leg) para poder simetrizar luego.
9. **[08:51]** Subdividir la columna para tener más control y nombrar: spine, neck, head, jaw, upper jaw, pelvis, tail 1-3.
10. **[11:10]** Crear controles IK: extruir un hueso desde cada pie, Alt+P → Clear Parent y desmarcar Deform; renombrar ik front leg.L / ik back leg.L.
11. **[12:45]** Crear huesos polo para cada pierna, también sin parent y sin deform; nombrar pole front leg.L / pole back leg.L.
12. **[13:57]** Explicar el problema de los ejes: cada hueso tiene su propio roll/eje y se quiere un eje uniforme.
13. **[15:21]** Crear un hueso "global control" cuyo eje sirva de referencia; seleccionar todos los huesos, dejar de último el global y usar Shift+N → Recalculate Roll (Active) para alinear los roles.
14. **[16:45]** Desmarcar Deform del hueso global y moverlo con M a una nueva colección de huesos llamada "ctrl".
15. **[17:41]** Entrar en Pose Mode; seleccionar el control IK, luego el último hueso de la pata, y Shift+I para añadir IK.
16. **[18:37]** En Bone Constraints: asignar Pole Target (armature + hueso polo), Chain Length 3 para la pata trasera y ajustar Pole Angle (-90°) hasta que la pierna se doble bien.
17. **[20:00]** Repetir en la pata delantera con Chain Length 2 y ajustar el Pole Angle (aprox. -90°).
18. **[21:24]** Resolver los problemas de pies que rotan/se quedan atrás al mover el cuerpo: en Edit Mode emparentar (Ctrl+P, Keep Offset) el hueso del pie al control IK.
19. **[22:48]** Como el pie sigue desfasado al bajar, añadir constraint Copy Location (Ctrl+Shift+C) en el hueso del pie con target el hueso IK, y ajustar Head/Tail al tail (extremo del hueso).
20. **[24:40]** Emparentar el polo al hueso control/global (Ctrl+P, Keep Offset) para que su dirección acompañe el movimiento.
21. **[25:08]** Simetrizar: en Edit Mode, Armature → Symmetrize para generar el lado derecho; probar en Pose Mode.
22. **[26:31]** En Object Mode seleccionar la malla, luego el armature, Ctrl+P → Armature Deform With Automatic Weights.
23. **[27:03]** Verificar en Pose Mode que la malla se deforma con los huesos.

## Lo que se ve en pantalla
- **[01:23]** Panel Screencast Keys: opciones de color, tamaño de fuente 11, mouse size 33, display time 2.00, etc.
- **[02:19]** Propiedades de Armature: Viewport Display → Display As Octahedral, casillas Shapes, Bone Colors, In Front.
- **[09:18]–[11:38]** Diálogo "Bone Name" del F2 para renombrar.
- **[12:34]** Menú Alt+P: "Clear Parent" / "Disconnect Bone".
- **[16:45]** Diálogo "Move to New Bone Collection" (nombre por defecto "Bones", botones Create/Cancel).
- **[18:37]** Panel IK: Target Armature, Bone, Iterations 500, Chain Length, Use Tail, Stretch, Weight Position 1.000, Influence 1.000.
- **[19:04]** Pole Target configurado con Pole Angle; **[19:32]** Chain Length 3 y ángulo negativo (~-90°) en la pata trasera.
- **[20:28]** Pata delantera: Chain Length 2, Pole Angle ~-90°.
- **[23:16]** Constraint Copy Location con ejes X, Y, Z activos y Head/Tail ajustable (0 = head).
- **[23:44]** Menú "Add Constraint (with Targets)" con Copy Location, Inverse Kinematics, etc.
- **[26:31]** Menú Set Parent To: Object, Armature Deform, With Empty Groups, With Envelope Weights, With Automatic Weights.
- **[14:25]** El autor dibuja con la herramienta Annotate los ejes X/Y/Z para explicar el roll.

## Consejos y advertencias
- **[06:26]** Renombrar los huesos con sufijo .L/.R es imprescindible para poder simetrizar.
- **[04:15]** Revisar la alineación de cada hueso en varias vistas (lateral, frontal, superior), no solo en una.
- **[11:57]** Los controles IK y polos no deben deformar: desmarcar Deform y quitarles el parent.
- **[15:04]** Unificar los ejes (roll) de todos los huesos ayuda al animador.
- **[19:04]** Si la pierna se rompe o gira mal al asignar el polo, corregir con Chain Length y Pole Angle.
- **[21:07]** Sin Copy Location, el pie queda atrás al subir el cuerpo; hay que usar el truco de constraint.
- **[22:20]** Un solo truco (parent) no basta; hace falta combinar parent y Copy Location.

## Lo que no queda claro
- Los valores exactos de Pole Angle son difíciles de leer en pantalla (se menciona -90°, pero con dudas) y quizá cambien en la pata derecha tras simetrizar.
- No se explica con claridad qué hueso va emparentado a cuál en el truco del pie ni qué target exacto usa el Copy Location (se intuye el IK).
- El renombrado final de varios huesos (spine/pelvis/tail) se oye confuso en la transcripción.
- El zorro se llama "perro" en el audio; los fotogramas muestran un zorro.
- Tampoco se muestra cómo corregir pesos si la automática falla (queda para la parte 2).
