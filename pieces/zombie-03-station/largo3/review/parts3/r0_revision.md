# Revisión de r0.mp4

- Estilo: ava
- Duración: 152.1 s

## Veredicto
**CASI (fallos menores):** las correcciones declaradas se ven bien (tarjetas de hora, fuente del pace count), pero las bandas de luz en la cara de Ava siguen apareciendo, hay solapes entre Ava, Marla y el farol, y varias manos se ven como bloques.

## Fallos
1. **[01:50], [02:18], [02:20]** La cara de Ava sigue con una banda de luz de borde duro: mitad izquierda clara, con un corte vertical a la altura de nariz y cuello, y en 02:18 un parche naranja rectangular. → Rompe el fix "bandas de luz en la cara" que figura como corregido. → Suavizar o quitar la luz del farol sobre la cabeza (gradiente en vez de corte duro) y revisar la luz de relleno en los primeros planos del túnel.
2. **[01:59]–[02:05]** Marla se funde con Ava: su cabeza y hombro entran en el pelo y el torso de Ava, y el farol y el brazo de cuadros quedan pegados a las piernas. → Rompe la regla de no atravesar (clipping). → Separar a Marla unos centímetros, o hacer una animación de apoyarse en el hombro con la cabeza por detrás del cuello.
3. **[02:07]–[02:11]** El primer plano del farol es confuso. Una forma enorme color arena (no se entiende qué es) atraviesa el farol, y las manos de Marla y de Ava son bloques pálidos sin dedos ni nudillos. → Rompe "manos = low poly facetado con dedos, nunca ladrillos". → Cambiar el encuadre o usar la mano propia de Ava sosteniendo el farol, y quitar la geometría que lo tapa.
4. **[00:36]** El subtítulo muestra una "M" suelta (se lee como "H") y la transcripción corta "You already know M" / "Marla she set…" entre dos segmentos. → Posible palabra partida en la voz (regla de no partir tomas ni comer palabras). → Revisar con whisper si "Marla" es una sola palabra completa y regenerar o unir la toma si hay un tartamudeo. Si es un tartamudeo intencional, ajustar el subtítulo.
5. **[01:04], [01:12]** El rótulo dice GREY SKIN y la voz "her skin is gray", pero la cara de Marla se ve beige o naranja cálido. → La imagen contradice el guion. → Virar la textura de la cara y las manos de Marla a gris verdoso en esos planos.
6. **[00:55], [00:57] vs [00:21] y [01:23]** A las 6:10 hay una multitud pegada a la puerta de cristal. A las 9 y pico la calle está vacía (solo un coche), y en 01:23 la multitud vuelve a estar en la entrada. → Falla de continuidad con "the streets are full". → O llenar la calle en 00:55 con zombis lejanos, o justificar que "se fueron" y que 01:23 muestre menos.
7. **[01:33], [01:35]** El rótulo "? METERS" tapa la cara de Ava, que además está cortada por el borde derecho. La mano en primer plano es un mitón en bloque sin dedos. → Rompe la regla de las manos facetadas y es mala composición. → Mover el rótulo, reencuadrar con Ava más al centro y usar su mano con dedos.
8. **[00:26], [00:41]** La persiana del garaje muestra un patrón moiré (bandas curvas), con riesgo de parpadeo al moverse la cámara. La rendija de "DOOR CRACKED OPEN" tampoco se distingue: la línea del rótulo apunta al suelo, donde solo hay una franja clara. → Rompe "luz de puertas sin parpadeo" y la corrección de la puerta del garaje. → Textura de persiana de menor frecuencia, o una franja de luz clara en la base con un hueco visible.
9. **[00:05], [00:07]** Cinco anillos grises flotan sobre el candado sin sujeción, y el candado es un bloque amarillo plano de poco detalle. → Geometría flotante y poco detalle en el prop. → Quitar los anillos o convertirlos en una cadena unida al candado, y añadir detalle al candado.
10. **[01:40], [01:42]** El HUD tapa el icono de HAND MAP en el inventario. Los iconos son siluetas simples, con huecos vacíos. → Rompe "pantallas ITEM con ítems RE2 y detalle real" y "no poner nada importante bajo el HUD". → Mover la cuadrícula hacia abajo o a la derecha del HUD y dibujar iconos más detallados (el de BEANS parece munición).
11. **[02:24]** El rótulo "LADDER DOWN" señala un agujero negro donde no se ve ninguna escalera, aunque el guion dice "a ladder going down". → El plano no muestra lo que dice la voz. → Añadir una escalera visible en el hueco.
12. **[00:55], [00:57]** Hay garabatos blancos flotando junto al pilar derecho y a ras de suelo, sin que se entienda qué son. También hay rayitas azules en la pared sobre las puertas ([00:21], [00:51], [00:55]), fuera del vidrio, que parecen gotas mal ubicadas. → Artefactos visuales. → Quitar el sprite o hacerlo reconocible (vapor de la taza) y limitar la lluvia a la zona del cristal.
13. **[01:34]** En el pace count se usan metros ("100 METERS", "? METERS"). → La guía pide unidades US. → Poner yardas (~109 yd) o dejar los metros solo si se justifica por la fuente (FM 3-25.26 usa metros).
14. **[00:28]–[00:34]** Unos 7 s sobre el mismo temporizador con zoom lento, sin plano nuevo. En 01:12–01:14 el primer plano de Marla repite la misma pose con la boca abierta fija durante ~3.8 s. → Roza "nada quieto >4 s". → Intercalar un plano de Ava o un corte antes de que se repita el cuadro, y animar o cerrar la boca de Marla.
15. **[01:00], [01:02], [02:16]** Planos muy oscuros (escalera, derrumbe): casi no se lee la geometría de los escalones, que parecen capas flotantes con huecos. → Regla de iluminación (+30 % en 3D, sombras levantadas). → Levantar las sombras y cerrar los huecos de la escalera.
16. **Rótulos sin línea guía** ([01:00] WATER + BLANKET, [01:04] GREY SKIN, [01:44]–[01:46], [02:15], [02:30]) frente a los que sí la llevan ([00:30], [00:43], [02:24]). → Rompe "etiquetas = cajita unida con línea fina". → Unificar con una línea fina hacia el objeto.

## Cumple
- Recapitulación de la elección al inicio de la Parte 2 ("Last night you had to choose… most of you said no").
- Tarjetas de hora solo con texto en negro, sin recuadro gris, y sin subtítulos hablados encima (corregido).
- Fuente del pace count visible ("US ARMY (FM 3-25.26)"), y CDC en los diagramas de CO y fiebre.
- HUD con el nombre del lugar (STATION/TUNNEL/SEWERS) y estado Fine/Caution coherente.
- Estilo PS1 RE con subtítulos pixelados y de tamaño contenido, sin cabecera de canal.
- Los diagramas (CO, termómetro, pace count) se mantienen oscuros y claros.
- Ribbon se ve tierno ([01:48]): ojos redondos con brillo, cabeza y cuello unidos, placa con nombre.
- En planos frontales Ava mira a cámara ([00:22]–[00:24]).
- Fachada de la comisaría con mucho detalle, ventanas iluminadas y multitud ([01:23]).
- Guion humanizado, con datos reales (CO, fiebre 100.4 °F, pace count) y callbacks coherentes.
- El gigante de las correcciones no aparece en este tramo, así que no se puede comprobar aquí.

## No verificable
- **Temblor de Ava y de las cabezas, y parpadeo de suelo/persiana:** diferencias de cuadros a ≥5 fps y test del centroide del pelo sobre el mp4 exportado.
- **Voz:** si "Marla" está entera en [00:36], pausas de 0.3–0.45 s, finales descendentes, tono lento y humano, y los [PIENSA]/[RESPIRA]. Usar whisper por toma y earshot `timeline`/`critique`.
- **Tarjeta 8:30 PM ([01:19]):** la transcripción marca voz continua de 01:18.6 a 01:25.0. Comprobar con earshot que la tarjeta no pisa "Here's the plan".
- **Música y SFX:** LUFS por tramo, que la música se oiga, SFX en su cuadro y sin duplicar, pasos de Dino Crisis, golpes y goteo. Usar earshot `measure`/`timeline`.
- **Contador de pasos:** que la voz "65, 130, 200" se corresponda con el contador (en los fotogramas solo se ven 65 y 200).
- **Animaciones:** que no se repita un mismo clip en planos consecutivos y que la linterna y el farol sigan a la mano. Revisar a ≥5 fps en [01:59]–[02:13].
- **Corte final:** el fragmento termina en "so thick you can't", que es el corte de la parte 1/4 y no un fallo.
