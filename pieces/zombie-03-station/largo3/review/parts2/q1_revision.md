# Revisión de q1.mp4

- Estilo: ava
- Duración: 150.1 s

## Veredicto
**CASI (fallos menores):** el render mantiene el estilo y la continuidad (piel gris de Marla, nada de recuadro gris en las tarjetas de hora, HUD, etiquetas en su palabra). Pero hay una geometría que tapa a Ava en 00:50, el brazo de Marla se lee mal, y el fuego y varios planos largos o oscuros no cumplen reglas fijas.

## Fallos
1. **[00:50]** Un plano gris angular (poste o puerta de la reja) cruza el cuello y el hombro de Ava en el primer plano → rompe "sin atravesar / geometría que atraviesa a Ava" → mover la cámara o el poste, o recortar el plano para que no pase por ella. Revisar ese tramo cuadro a cuadro en el mp4.
2. **[00:33–00:37]** El contador muestra **73 BEHIND YOU** mientras la voz dice "80 of them", y en 00:35 ya no está → el creador pidió contador 80 → fijarlo en 80 desde que entra y mantenerlo mientras suena "80".
3. **[00:52–00:54]** El antebrazo de Marla se ve como un tubo rojo a cuadros, doblado y cruzado sobre el torso, que no se lee como un brazo mordido (el brazo de tela roja y la mano blanca parecen desconectados) → rompe "manos/cuerpos sueltos con forma real" → reorientar el brazo con codo y mano claros y vendaje legible; la etiqueta BITTEN debe apuntar a él.
4. **[02:24–02:26]** Los cuadrados naranjas de la hoguera flotan **delante del cuerpo y la cara de Ava** y parece que ella se incendia. No se ve llama sobre los troncos → rompe "sin clipping / props con sentido" → que las brasas nazcan de los troncos y suban detrás de ella, y agregar una llama o brillo visible sobre los troncos.
5. **[02:18–02:24]** Planos casi quietos más de 4 s: Ava escurriendo la ropa (~5.7 s, mismo encuadre en 02:18, 02:20 y 02:22). También **[01:31–01:37]** (~6 s de acercamiento al mapa, con solo un leve giro) y **[00:05–00:09]** (Ava de frente, ~4 s casi idénticos) → rompe "nada quieto >4 s" → cortar a otro ángulo (por ejemplo Ribbon temblando, o el mapa contra el túnel).
6. **[02:18–02:28]** Bosque casi negro, con un bulto negro del perro cortado en el primer plano (02:18–02:22) → rompe "3D ~30 % más claro, sombras levantadas" → subir la exposición y las sombras del set del bosque, y sacar o aclarar ese primer plano.
7. **[02:26]** La etiqueta "WET JEANS: ~25x FASTER" atribuye el 25× a los jeans. El dato es que el **agua** quita calor ~25× más rápido que el aire (en la voz falta el sujeto, ver No verificable) → dato impreciso → cambiar a "WATER: ~25x FASTER THAN AIR" o "WET CLOTHES LOSE HEAT FASTER", y comprobar en FACTS.md.
8. **[01:43–01:46]** La etiqueta dice "RIGHT HAND ON THE WALL", pero Ava avanza hacia la cámara con la linterna en la mano que apunta al muro y sin tocarlo. Parece que el muro queda a su izquierda → rompe "etiquetas y animaciones coinciden con lo que dicen" → hacerla caminar con el muro a su derecha, con la mano apoyada en la pared (animación de mano propia).
9. **[01:05.7]** Marla en lo alto de la escalera tiene el torso inclinado y oculto bajo/dentro del borde de la plataforma → posible clipping con la rejilla → subir la animación hasta que quede sobre la plataforma.
10. **[01:58–02:00]** Ava sentada: las piernas y la pelvis se funden con el suelo, y la "cot" parece una mesa verde con un bloque blanco → posible clipping y prop poco legible → apoyar bien el pie/rodilla sobre el suelo y darle forma de catre (colchón, manta) a la cot.
11. **[02:05–02:07]** La hoja de guardado muestra "DAY 3 / 12:30 AM" **sin la ubicación SEWERS** y con HUD, mientras las otras tarjetas de hora van sin HUD → rompe "hojas de guardado muestran el nombre del lugar" → agregar "SEWERS" y unificar si lleva o no HUD.
12. **[01:41]** "NEVER LET GO": la **G** se lee como un **6** ("60") en la fuente RE → legibilidad → ajustar la glifo G o la etiqueta.

## Cumple
- Look PS1 RE con subtítulos pixelados, HUD CONDITION con el lugar (SEWERS, FOREST) y estados Fine/Caution/Danger que acompañan la acción.
- Tarjetas de hora solo con texto, sin recuadro gris, con typewriter y cursor.
- Piel gris de Marla coherente en todos los planos.
- El perro tiene cabeza y cuello unidos y ojos redondos, y Ribbon pone la cabeza en la rodilla de Ava.
- Etiquetas de diagrama con caja y línea fina; NWS y OSHA como fuente en pantalla.
- Subtítulos casi sincronizados con la voz (SPLASHING, THE WATER, COURTHOUSE).
- Sin temblor visible en Ava, y la expresión de miedo de 00:50 es limpia (sin la cara >.<).
- Las criaturas del túnel aparecen desde la oscuridad (00:26–00:36).
- Los datos H2S y NWS (6 in) coinciden con las fuentes citadas.

## No verificable
- **Voz:** la transcripción muestra frases rotas. "They hurt us" (00:29), "Marla, let's go of your shoulder" (00:44), "Steals heat…" sin sujeto (02:25) y "Wet clothes in a cold form" (02:28) pueden ser errores de whisper o palabras comidas en un corte. "She did that for us" (02:03) podría ser un lapso de segunda persona. Usar earshot `timeline`/`critique` y volver a pasar whisper sobre esas tomas.
- **Pausas y pensamientos:** los [PIENSA] (secos y cercanos), las respiraciones, los silencios de 1.5–2 s y el speed 0.88 no se pueden juzgar con fotogramas. Usar earshot `describe`/`timeline`.
- **Mezcla:** los −14 LUFS estéreo, el true peak ≤ −1 dBTP, la música 10–11 LU bajo la voz por tramo y la ausencia de huecos. Medir con earshot `measure`.
- **SFX:** los golpes de la tubería, la reja que cae, los pasos (Dino Crisis) y el crujido de la hoguera en su cuadro exacto, con el ambiente de agua continuo. Verificar con `timeline`.
- **Movimiento fino:** jitter de Ava (centroide del pelo ≤ 1 px), reproducción única de cada clip, parpadeo del suelo o del agua, y el cono de linterna sólido (no se aprecia en estos cuadros). Revisar el mp4 a ≥ 5 fps en los tramos 00:50, 01:03–01:15 y 02:18–02:28.
