# Revisión de p0.mp4

- Estilo: ava
- Duración: 150.1 s

## Veredicto
**NO LISTO.** Hay un helper de debug (cubo wireframe) a la vista, bandas de luz de borde duro sobre la cara de Ava, un plano clave que no muestra lo que dice (la puerta "entreabierta") y varios clipping y manos tipo ladrillo. Todo lo demás son fallos corregibles.

## Fallos

1. **[02:24–02:26]** Un cubo wireframe alrededor de una esfera amarilla sobre la pared de las alcantarillas (es un helper de luz de three.js, tipo `PointLightHelper`). → Rompe el look PS1 y las reglas de calidad de props. → Ocultar o quitar el helper en el set de alcantarillas (`sets/`) y re-renderizar.

2. **[01:45, 01:47, 02:13–02:17, 02:24–02:26]** La cara de Ava tiene bandas o parches de luz de borde duro:
   - Mitad izquierda amarilla y derecha rosada, con un corte vertical.
   - Una franja clara sobre la nariz.
   - Un anillo de viñeta duro que cruza el hombro y el pelo (efecto fantasma).

   → Rompe "luz que no parpadea / sin manchas" y "no tocar la textura de Ava": reportar, no repintar. → Suavizar la viñeta o la luz puntual (degradado, sin corte) y revisar que no sea un spot recortado sobre la cara.

3. **[00:41–00:45]** El rótulo dice "DOOR CRACKED OPEN", pero la persiana se ve cerrada, sin rendija ni luz de afuera.
   - Ava queda congelada en una pose a una pierna, sin animación de abrir.
   - La línea del rótulo le atraviesa el cuerpo.
   - El plano dura ~3.8 s casi estático.

   → Rompe "animaciones nuevas cuando un plano las necesita", "etiquetas en la palabra" y "nada quieto >4 s". → Animar el gesto de levantar la persiana, mostrar una rendija visible y mover el rótulo fuera de Ava.

4. **[01:54–02:09]** Marla y Ava se atraviesan una con otra al caminar y apoyarse (tela verde y plaid de Marla dentro de la chaqueta y el pantalón de Ava).
   - En los primeros planos de la linterna **[02:01–02:07]** las manos son bloques blancos sin dedos y hay bloques verdes sueltos.
   - Son ~5.7 s del mismo plano.

   → Rompe "sin clipping" y "manos facetadas con dedos". → Separar los personajes (offset lateral en el apoyo) y usar la mano propia con dedos sosteniendo la linterna.

5. **[01:28–01:30]** El guante de Ava sobre el papel es un mitón gris gigante, sin dedos, tipo ladrillo. Lo mismo con el puño en **[02:24]**. → Rompe "manos = low poly con dedos y nudillos". → Usar la mano del modelo y revisar la escala en primer plano.

6. **[01:01–01:09]** El texto dice "her skin is gray", pero Marla tiene piel normal, durazno. → Incoherencia imagen/voz. → Tintar la piel de Marla (cara y manos) hacia gris/pálido en las alcantarillas, sin tocar a Ava.

7. **[00:28–00:36]** Cuatro planos seguidos (~7 s) de zoom sobre el temporizador, con texturas enormemente pixeladas.
   - La cinta con la letra "M" es ilegible (mancha amarilla y un "H." verde).
   - Hay una plancha gris flotando bajo el reloj.

   → Rompe "props con detalle real", "nada quieto >4 s" y el dato de guion (la letra de Marla). → Reducir a 2 planos, subir la resolución de textura y mostrar claramente una "M" manuscrita.

8. **[00:05–00:08]** Los anillos de cadena (tuercas) flotan sueltos sobre el candado, sin conectar. → Rompe "props bien apoyados / nada flotante". → Conectar la cadena al candado o quitarla.

9. **[01:37]** El HUD tapa el ítem HAND MAP del inventario. → Elemento clave tapado. → Bajar la rejilla o desplazar el HUD en esa pantalla.

10. **[01:30]** El rótulo "? METERS" cae sobre la cara y el ojo de Ava. → Mala colocación de etiqueta. → Moverlo al aire libre junto a la mesa.

11. **[01:39–01:45]**
    - La mano de Ava queda alzada en el aire, sin tocar nada.
    - En la mesa solo se ven latas y una caja de munición: no se ven el agua, la linterna ni la pistola que nombran los rótulos.
    - Ribbon "watches you the whole time", pero no aparece en pantalla.
    - El plano dura ~5.7 s.

    → Rompe "manos sobre props" y "ítems clave ~2 s". → Hacer que alcance un objeto real, poner los 4 ítems en la mesa e insertar un plano corto de Ribbon.

12. **[02:18–02:22]**
    - Ava parece flotar sobre la reja en el segundo plano.
    - El rótulo "LADDER DOWN" no apunta a ninguna escalera visible.
    - La reja es de madera naranja, no de "rusted grate" metálica.

    → Rompe "props bien apoyados" y "detalle de props". → Apoyar a Ava, mostrar peldaños y texturizar la reja como metal oxidado.

13. **[01:03–01:09, 01:24–01:28, 00:22–00:26, 00:50–00:54]** Hay planos casi estáticos de ~3.8 s o más:
    - Termómetro (01:05–01:09).
    - Mapa (01:24–01:28).
    - Ava con la misma pose de manos (00:22–00:26).
    - Vestíbulo oscuro (00:50–00:54).

    → Rompe "nada quieto >4 s". → Añadir micro-animación (aguja, ruta que avanza) o un cambio de plano.

14. **[00:54]** El vestíbulo aparece brillante, de día, justo después de "the station goes dark again". → Incoherencia de continuidad. → Mantenerlo oscuro/azul, o justificar que volvieron las luces. Hay además una voluta blanca flotando junto a la puerta.

15. **[00:58–01:00, 02:07–02:11]** Escaleras y túnel muy oscuros (mitad derecha negra). → Rompe "3D ~30 % más claro con sombras levantadas". → Levantar el ambiente en esos planos.

16. **[01:31–01:36, 01:19–01:26]**
    - El dato de conteo de pasos ("Soldiers still navigate…") no lleva etiqueta de fuente, a diferencia de CDC y OSHA en los otros.
    - Usa metros; la regla de guion pide unidades US.
    - En el mapa, el "RIVER BRIDGE" no está sobre el río y el courthouse no queda "right next to the river".

    → Rompe "dato real con fuente" y la regla de unidades. → Añadir una etiqueta de fuente (p. ej. "US ARMY"), decir también yardas y mover el puente al río.

17. **[01:09]** "A fever like that after a bite means it's spreading" se afirma como hecho, pero 100.4 °F es el umbral genérico del CDC. → Regla "lo ficticio se dice 'In this world'". → Reformular con "In this world…" para la parte del virus.

18. **[00:58]** El rótulo "WATER + BLANKET" aparece, pero no se ve manta. → Detalle menor. → Poner una manta enrollada en el brazo o quitar "blanket".

19. **[01:52, 00:56]** Las tarjetas de hora "9:15 PM" y "7:00" se ven sin línea "DAY 3 — lugar", a diferencia de las demás. → Posible inconsistencia. → Verificar que no sea solo el momento del typewriter; si falta, añadirla.

## Cumple
- **Recap al inicio** de la parte ("Last night you had to choose…") y HUD que entra de golpe en el 2º plano.
- **Tarjetas de hora** solo con texto, sin recuadro gris, con typewriter en Courier.
- **Subtítulos pixelados** estilo RE, sin cabecera de canal, y HUD CONDITION/ECG con el nombre del lugar (STATION/TUNNEL/SEWERS).
- **Voz:** guion humanizado, en 2ª persona, sin "click" ni onomatopeyas, en inglés.
- **Diagramas oscuros** (CO, termómetro, pasos) con etiquetas de caja de 1 px y fuente CDC/OSHA donde corresponde.
- **Dato de CO** (CDC) y umbral de fiebre de 100.4 °F correctos.
- **Exteriores y sets** con mucho detalle (fachada CITY POLICE con zombis, garaje con patrullas, vestíbulo con extintor y planta).
- **Dutch** con buen modelo de preso (número 4417) y **Marla** reconocible; el **perro** sale bien en los planos del túnel.
- **Ava mira a cámara** en los planos frontales (00:22, 01:13, 01:45).
- **Linterna:** el haz sigue a la linterna en 01:48.

## No verificable
- **Sincronía subtítulo/voz:** hay un posible adelanto de ~1 s en la zona 00:18–00:28 (p. ej. "FIRST" en 00:18.8 vs "First thing" hacia 00:20). Con `earshot timeline` + `cues.json` conviene verificarlo.
- **Voz:** ritmo (speed ~0.88), pausas 1–2 s con ambiente, pensamientos en susurro ("No, no, no"), voz de Dutch/Marla, ausencia de sílabas estiradas, F0 final descendente. Usar earshot `describe` y `critique`.
- **SFX y música:** cada acción con SFX en su cuadro (generador, persiana, pasos Dino Crisis, gotas), BGM audible, nivel por tramo (LUFS) y −14 LUFS / TP ≤ −1 dBTP. Usar earshot `measure` y `timeline`, y revisar el mapeo de eventos en `mix_largo.py`.
- **Temblor de Ava o de las cabezas** y parpadeo de suelo o luces: requiere test de centroide y diffs de cuadros a ≥5 fps sobre el mp4 exportado.
- **Clipping fino** (Marla/Ava, Ava en la reja): revisar cuadro a cuadro tras corregir.
- **Final de decisión** (negativo ~6 s y menú RE con SUBSCRIBE) y la BGM hasta el final: no entran en este tramo (0–02:28). Revisarlo en las partes 2–4.
