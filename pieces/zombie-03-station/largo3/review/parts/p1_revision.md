# Revisión de p1.mp4

- Estilo: ava
- Duración: 150.1 s

## Veredicto
**CASI (fallos menores):** el tramo cumple el look y la estructura, pero hay varios haces de linterna que no siguen a la linterna, un contador que no coincide con la voz, geometría cerca de Ava y una hoja de guardado sin lugar. Todo se arregla en una pasada.

## Fallos
1. **[00:16–00:19, 00:39–00:44, 01:28–01:31]** El haz de la linterna se ve como una pieza sólida o suelta, no como luz que sale de la linterna. → *Regla: "flashlight beam must follow the flashlight" y sin partes transparentes en el perro.*
   - En 00:16.9 y 00:18.8 una losa gris translúcida cruza horizontalmente la cabeza del perro.
   - En 00:39.4 a 00:43.2 el haz es un cilindro gris opaco con punta redondeada. La etiqueta IRON GATE apunta a esa punta, no a la reja, que está arriba en el techo.
   - En 01:28.2 y 01:30.1 el haz es un cono o globo que flota sobre la mano de Ava, desconectado y apuntando a la pared.
   - **Arreglo:** cono anclado al hueso de la mano y orientado al punto que mira, con opacidad baja y falloff. Reapuntar la etiqueta IRON GATE a los barrotes.
2. **[00:33.8]** El contador dice "20 BEHIND YOU", pero la voz dice "80 of them" (transcripción 00:30–00:37). → *Regla: etiquetas y datos coherentes con la palabra que los dice.* → Poner 80 o animar 20→80, y comprobar que la transcripción no esté mal.
3. **[00:50.7]** Un plano gris con arista diagonal, más un pilar, cruza junto al cuello y la cara de Ava. → *Regla: verificación cuadro a cuadro de geometría que atraviesa a Ava.* → Revisar el mp4 a ≥5 fps en 00:49–00:52 y mover la cámara o el prop. Es posible que sea la reja o el haz.
4. **[00:52.5–00:54.4]** El brazo mordido de Marla se lee como un cilindro rojo a cuadros (casi un cartucho de dinamita) con la mano blanca colgando. No se ve herida. → *Regla: manos y cuerpos sueltos facetados y legibles.* → Vendar el antebrazo pegado a la manga y marcar la mordida. La etiqueta BITTEN no tiene línea que la una.
5. **[02:05.7–02:07.6]** La hoja de guardado muestra solo "DAY 3 / 12:30 AM" sobre negro, sin el lugar, aunque la voz dice "sewers". → *Regla: las hojas de guardado muestran el nombre del lugar.* → Añadir "SEWERS" (o "SEWERS — STORM DRAIN").
6. **[02:24.5–02:28.2]** Un rectángulo gris pálido translúcido con borde duro tapa el lado izquierdo del plano y atenúa al perro, como un plano de niebla mal cortado. → *Reglas: sin partes transparentes y perro tierno.* → Suavizar o quitar el plano de vapor, o darle alpha en degradé.
7. **[01:31.9–01:37.6 y 02:18.8–02:24.5]** Dos planos casi fijos duran unos 5.7 s cada uno. Son el mapa en el suelo y Ava sentada tiritando. → *Regla: nada quieto más de 4 s.* → Cortar a un plano intermedio (detalle del mapa con texto legible, o cara/perro) a mitad. El mapa tampoco se lee.
8. **[01:41–01:45 y 02:26]** Datos sin etiqueta de fuente, a diferencia de OSHA y NWS en los otros problemas. → *Regla: dato real con fuente en cada problema.*
   - La regla de la mano en la pared no tiene fuente, y solo funciona en laberintos sin bucles.
   - "WET JEANS ~25x FASTER" tampoco la tiene. Añadir fuente (CDC/NIOSH, Ejército, etc.).
9. **[02:22–02:29, transcripción]** Hay líneas de guion ilegibles o dudosas:
   - "Marla, let's go of your shoulder".
   - "It feels heat from your body… Wet clothes and a cold formula".
   - "That's the real danger right now?" con signo de pregunta.
   - → *Reglas: humanizar el guion y frase declarativa (F0 final descendente).* → Comparar con `guion.md`. Si es el guion, reescribir (p. ej. "Water pulls heat from your body about 25 times faster than air"). Si es Whisper, verificar la toma y regenerarla con punto.
10. **[01:41.3–01:45.1]** En el diagrama, "NEVER LET GO" se lee como "NEVER LET 60", por el glifo G/O de la fuente pixel. → *Regla: legibilidad de etiquetas pixel 8–9 px.* → Revisar los glifos G y O.
    - Los subtítulos (01:37–01:41) rozan o pisan el borde inferior del laberinto. Subir el diagrama.
    - El trazo verde cruza el muro izquierdo sin hueco visible.
11. **[00:45.0]** Marla aparece encorvada con rodillas dobladas sin asiento, como sentada en el aire. Además hay una media luna roja en el brazo derecho de Ava, que parece el vendaje de Marla o un clipping. → *Regla: sin clipping y manos y props bien apoyados.* → Darle a Marla una pose apoyada contra la pared o la escalera. Confirmar si el rojo en el brazo de Ava es suyo.
12. **[02:15.1 y 02:24.5]** Rocas negras planas, sin textura, en el borde del plano. → *Regla: exteriores con mucho detalle, nada plano.* → Texturizarlas o quitarlas.
13. **[02:18.8–02:28.2]** El bosque y el perro están muy oscuros. En 02:18.8 el perro es casi negro, con el ojo sin brillo visible. → *Reglas: iluminación 3D ~30 % más clara y perro tierno con ojos con highlight.* → Levantar sombras y añadir luz de relleno.
14. **[00:05.6–00:07.5]** Ava mira hacia arriba con cara inexpresiva. → *Regla: frontales con expresiones cute, nunca mirada vacía hacia arriba.* → Cambiar la mirada o dar una expresión.
15. **[01:20.7]** Ese fotograma no tiene subtítulo mientras la voz dice "You look back" (01:19–01:22). Puede ser un hueco entre palabras. → Verificar que la palabra tenga caption.
16. **[00:46.9–00:48.8]** Marla en el mismo encuadre unos 3.8 s, casi al límite de 4 s. → Variar el plano si se alarga.
17. **Modelo de Ava (solo reportar, no repintar):** en los primeros planos (00:05, 00:30, 00:50, 02:02) el cuello es un anillo gris plano y hay una mancha marrón en la mandíbula y mejilla derecha.
18. **[00:11.3]** La línea de la etiqueta ANKLE DEEP cruza el subtítulo "AND THAT'S". → Reubicar la etiqueta.

## Cumple
- Look PS1 RE con fuente RE, subtítulos pixelados abajo y sin cabecera de canal.
- HUD CONDITION con placa de lugar (SEWERS / FOREST) y estado coherente: Fine, Caution, Danger.
- Tarjetas de hora negras con solo texto, sin recuadro gris, en máquina de escribir.
- Datos con etiqueta de fuente en el gas (OSHA) y en el agua en movimiento (NWS), con medidor integrado y diagramas oscuros.
- Etiquetas animadas en su palabra (BITTEN, CLANG, LOUD/LOUDER, TYPEWRITER, INK RIBBON).
- Secuencia de la reja: Ava y Marla separadas por los barrotes, con Marla subiendo la escalera y golpeando la tubería. Los zombis se ven a través de las rejas con la hoja en primer plano.
- Perro y Marla reconocibles y coherentes con la continuidad.
- Sala de trabajadores con detalle (casilleros, calendario, máquina de escribir con teclas sobre el cuerpo, hierbas).
- Bosque con árboles, niebla y postes con pájaros.
- Beat de transcripción con ritmo humano: "Don't look back" repetido tres veces y luego "You look back".

## No verificable
- **Audio:** sincronía de SFX (CLANG de la reja, palanca, golpes de tubería), pasos Dino Crisis, respiración, pensamientos [PIENSA] y pausas con ambiente → `earshot timeline/critique/measure`.
- **Voz:** speed 0.88 sin sílabas estiradas, F0 final declarativo, cortes y huecos de aire muerto → `earshot describe/realness`, whisper por toma.
- **Música:** nivel por tramo en LUFS (10–11 LU bajo la voz, sin tramos más fuertes), continuidad y presencia → `earshot measure` por segmento.
- **Movimiento fino:** que Ava no tiemble, y que "you're shaking" no esté hecho con jitter (test del centroide del pelo ≤1 px); cabezas de zombis sin temblor; que ningún clip se reinicie o loopee entre planos (la caminata de Ava se repite en varios) → extraer cuadros a ≥5 fps.
- **Parpadeos:** suelo y agua verdes de las alcantarillas, la luz de las lámparas y partículas de agua (los triángulos blancos de 00:13–00:15 podrían ser spray flotante) → diffs de cuadros.
- **Final y apertura:** la decisión estilo RE (negativo ~6 s y luego menú) no cae en este tramo. Tampoco se puede juzgar la recapitulación de la Parte N, porque este tramo empieza a mitad de capítulo.
