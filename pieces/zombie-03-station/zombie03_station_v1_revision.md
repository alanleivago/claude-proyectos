# Revisión de zombie03_station_v1.mp4

- Estilo: ava
- Duración: 67.6 s

## Veredicto
**CASI (fallos menores).** El look RE, el HUD temprano, el ECG, las expresiones de Ava, el ending con menú YES/NO y la firma AVA RESTFIELD están bien. Los problemas son la duración (~67 s), una incoherencia lógica en el guion del agua, la pantalla ITEM pobre y varios desajustes de timing entre labels y voz.

## Fallos
1. **[01:06.8]** El render llega a ~67 s, con voz hasta ~65 s → rompe la duración 45–60 s del canal → recortar ~7 s. Candidatos: los huecos entre frases (>0.5 s, ver "No verificable"), la secuencia del clip de Vickers (00:51–00:54) o un hold final más corto. Si la nueva serie admite más de 60 s, confirmarlo con el creador.
2. **[00:21–00:31]** El guion dice "bullets aren't what gets you first. Water is", pero la cuenta muestra 11 días de agua contra 7 de ayuda, con un ✓ verde → lógica contradictoria, contra "clearer logic order" → cambiar el gancho. Por ejemplo, "water is what you'll count first" o "the water is fine… until it isn't". O bien hacer que la cuenta dé menos de 7 días, o que el ✓ lleve a un nuevo problema.
3. **[00:27–00:30]** La etiqueta "4 x 1.6 GAL" para los tanques → la regla pide datos de unidades US verificados → 1.6 gal es el consumo por descarga, no el volumen útil del tanque, y la cuenta redondea 6.4 a "+6". Revisar la cifra (volumen real del tanque o "≈6 gal") y verificar con FEMA/FLASH. El 1 gal/persona/día sí es correcto.
4. **[00:16.9–00:20.3]** La pantalla ITEM/EXAMINE tiene la grilla vacía salvo una pistola gris plana, sin textura ni detalle. En 00:17.7–00:18.6 la pistola gira fuera de su celda y de la caja de selección. El panel EXAMINE está vacío hasta 00:19.4 → rompe "fill them with RE2 items and real detail" → modelo de pistola con textura low-poly, panel EXAMINE con texto desde el inicio, y algún item de relleno coherente con el guion (linterna, ink ribbon, spray vacío). Ojo: el guion dice "one pistol", así que el relleno no debe sugerir armas ni munición extra.
5. **[00:32–00:33]** Label "NEVER": en 00:32.1 la caja está vacía y el texto solo aparece en 00:33.0, cuando el caption ya dice "THE LOBBY". Además el caption muestra "NEVER" una sola vez para "never ever" → rompe "labels land on the word that says them" → adelantar el typewriter de la caja un ~0.8 s. Comprobar si los captions pierden "ever".
6. **[00:26.2–00:27.0]** Caption "FIVE" con la botella y la caja "5 GAL" todavía ausentes. Aparecen recién en 00:27.0 → mismo problema de sincronía → que la botella y "5 GAL" entren en la palabra "five".
7. **[00:36.3–00:38.0]** Los captions muestran "ONE, ONE, AM, AM" y nunca "2:47"; el caption "ONE" sigue vigente cuando la voz ya dice la hora. El texto de la nota va con retraso: en 00:36.3 solo dice "DAY 1 — _" → adelantar el typewriter y cambiar el caption a "TWO FORTY-SEVEN" / "2:47".
8. **[00:24.5]** Ava queda cortada por el borde izquierdo, con media cara fuera de cuadro. En 00:21.1–00:23.7 también está pegada al borde → encuadre pobre → reencuadrar la cámara para dejar espacio al label "1 GALLON / DAY" sin cortarla.
9. **[01:04.2–01:06.8]** El end card no tiene el objeto 3D rotando sobre el texto ni "NEXT:" → regla del end card → si la serie "DAY" cambió el formato, confirmarlo con el creador. Si no, agregar un objeto (la puerta o la placa VICKERS girando) y el prefijo.
10. **[00:07.6–00:08.4, 00:40.6–00:54.1]** La marca roja sobre el vidrio cambia de forma entre frames (estrella en 00:07.6, mano en 00:08.4) y parece un decal pixelado, naranja más que sangre → regla "blood decals = real textures (Flow), never painted pixels" → verificar que sea textura real y fija.
11. **[00:46.5–00:50.7]** Los tres anillos de café del duty log se superponen al texto y restan legibilidad → bajar su opacidad o moverlos fuera de las filas.
12. **[00:02.5–00:16.1]** El calabozo y el armory se ven aún oscuros → regla de iluminación "3D ~30 % más brillante" → subir la exposición y levantar sombras, como en ep2.
13. **[general]** Fuera del escritorio, solo la lámpara y la planta cumplen con props RE. No hay sprays ni hierbas en el calabozo, el cooler ni el vestíbulo → regla "RE props in the sets" → agregar First Aid Sprays o macetas de hierbas en algún fondo.

## Cumple
- HUD CONDITION con ECG: entra de golpe en el 2º plano (00:02.5) y cambia Fine / Caution / Danger según la tensión.
- Look PS1 RE: fuente RE, captions pixelados, sin header de canal.
- Ava mira a cámara en los planos frontales, con expresiones (guiño en 00:06.8, sorpresa en 00:56.6, rascarse la cabeza en 00:60.0), sin mirada en blanco.
- Etiquetas con color semántico (rojo para peligro, verde para bueno, cian para lugares) y corte de puerta → negro en 00:13.5–00:14.4 como transición RE.
- Mecánicas RE como recursos narrativos: ITEM, FILE, máquina de escribir con YES/NO de guardado, menú YES/NO como final, contador DAY.
- Typewriter de la nota con "DAY 1 — 2:47 AM" y cursor.
- Sellos "LOST" con textura, nombres coherentes con la placa VICKERS, y las luces del vestíbulo cambiando en 00:55.8.
- Final con "Oh fudge", en inglés y sin subcaptions raros.
- End card con "FOLLOW AVA RESTFIELD!" y typewriter en Courier; el nombre está bien.
- Sin símbolos manga ni YOU DIED innecesario.

## No verificable
- **Voz:** clon "ava bread 2", cortes en "…", recortes, gaps >0.5 s, entonación declarativa de la 1ª frase, velocidad. Usar `earshot timeline/critique`.
- **"armoring" en la transcripción (≈00:15–00:17):** el caption dice "THE ARMORY". Revisar con earshot si la voz pronuncia mal la palabra o es un error de whisper.
- **"Oh, fudge!":** confirmar que sea el take de ep1 `13_fudge.wav`.
- **SFX:** sonido en el frame exacto (labels, typewriter una tecla por letra, golpes en el vidrio, radio beep del HUD), sin silencio inicial.
- **Música:** cortes antes del end card, mezcla estéreo a -14 LUFS, true peak ≤ -1 dBTP.
- **Movimiento fino:** que Ava no tiemble (jitter ≤1 px), el golpeteo solo en el vidrio o la puerta, y la animación del label/typewriter entre fotogramas. Usar el test del centroide de pelo sobre el render.
- **Facts de FEMA/FLASH:** conviene cotejarlos contra la fuente, no se pueden juzgar desde los fotogramas.
