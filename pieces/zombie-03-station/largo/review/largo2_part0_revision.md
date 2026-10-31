# Revisión de largo2_part0.mp4

- Estilo: ava
- Duración: 162.1 s

## Veredicto
**CASI**: el look RE, las pantallas, los cálculos y la continuidad con el ep1 se ven bien. Hay fallos menores: HUD ausente en dos tomas, un plano que contradice el guion, y captions que parecen adelantadas respecto de la voz.

## Fallos
1. **[01:45]** Se ven ~10 zombis en la calle, pero la voz dijo hace segundos "three of them outside, just standing there". Es un hipotético ("every bullet is a dinner bell") sin la marca IMAGINE que sí usaste en 1:04-1:09 → rompe la lógica del guion y la coherencia con 1:19-1:23 → agregá el tag IMAGINE, o mostrá solo 3 zombis y que el resto llegue con el ruido.
2. **[01:27] y [02:07]** Falta el HUD (CONDITION) en el plano de la armería y en el pasillo oscuro "FORGETS". En 1:29 y 2:09 reaparece → regla del HUD constante (`HUD_T0`, aparece de golpe y se queda) → mantenerlo en esas tomas.
3. **[00:04]/[00:16]/[00:18]/[01:37]/[01:53]** Varios captions parecen adelantados a la voz. Ejemplos: "AWAY" en 0:16 cuando "two blocks away" cae ~0:18; "LIGHTS" en 0:18 cuando "lights still on" cae ~0:20; "AND THAT'S" en 1:37 cuando "that's it" cae ~1:38.5; "BUT BULLETS" y "SOUNDS" salen ~0.5 s antes. → regla "labels y animaciones caen sobre la palabra que los dice" → revisar los word times de esos captions y desplazarlos.
4. **[00:58-00:59]** El transcript tiene ~1 s de aire muerto entre "Remember that cough." y "First problem?" → regla de aire muerto (>0.5 s se corta con `CUTS_T`/`warp`, mismo corte en `mix.py`) → recortar a ≤0.5 s si no es una pausa dramática deliberada.
5. **[00:28]** El candado de la reja se ve como una fila de anillos hexagonales flotando junto a la mano, con casi nada del cuerpo del candado → regla de props con detalle low-poly real → modelar un candado legible (cuerpo + argolla).
6. **[00:56]** La tarjeta 9:40 PM no tiene cursor ni la línea "DAY 1 — POLICE STATION", a diferencia de las de 0:14, 0:38, 1:25 y 2:19 → inconsistencia de formato → igualarla, salvo que sea una versión intencional ya borrada ("COUGH").
7. **[00:00]** El texto del costado del patrullero se lee "PXKY" en lugar de POLICE (en otras tomas sí dice POLICE) → regla de coherencia de props → corregir la textura en ese plano.
8. **[00:42] vs [01:12]/[01:49]** Hay dos juegos de reglas numeradas: las de la radio (1. LIGHTS OFF, 2. GATE LOCKED, 3. OPEN FOR NO ONE) y "RULE 1/RULE 2" de Ava (lobby, arma) → puede confundir al espectador → renombrar las de Ava (p. ej. "AVA'S RULE 1") o numerarlas distinto.
9. **[01:39]** El caption es una sola letra, "A" → se lee raro → fundirlo con la palabra siguiente ("A 9 MM").

## Cumple
- Fuente RE y captions pixelados, sin header de canal.
- HUD con panel CONDITION (Fine/Caution) desde el 2.º plano, y Caution en 1:21 con el contador OUTSIDE.
- Ava mira a cámara en los planos frontales (0:04, 1:29, 1:44) con expresiones (guiño, sonrisa, ojos cerrados).
- Pantallas ITEM/RE2 con objetos reales (First Aid Spray, hierba, K-9, bolsas de chips, candy) y hoja de guardado con "POLICE STATION".
- Tarjetas tipo máquina de escribir en Courier con el reloj 9:02 → 9:15 → 9:40 → 10:15 → 11:05.
- Etiquetas sobre la acción, con color según el tema (rojo = peligro, verde = bien, azul = agua).
- Matemática correcta: 5+6+40=51 gal, 20×250=5,000 cal, 5,000/2,000=2.5 días, regla de 3. Datos FEMA/tempered, y callback "glass isn't tempered".
- Guion humanizado, con conectores, en inglés.
- Exteriores con lluvia vertical, sin reflejos parpadeantes visibles.
- Planos de lobby y sala de descanso luminosos, con sombras levantadas. El sótano y la armería son oscuros por diseño.

## No verificable
- Sincronía exacta de SFX con el frame, bip de radio Dino Crisis, trim del silencio inicial: `earshot timeline`.
- Voz "ava bread 2", entonación declarativa de la primera línea, cortes de take (nunca partir en "…"), nivel x1.15, -14 LUFS estéreo y true peak: `earshot critique`.
- Música CC0 continua sin huecos largos y su corte antes de las tarjetas: `earshot timeline`.
- Jitter de Ava (0 px de temblor), gotas cayendo hacia abajo, el parpadeo de la lluvia y de los reflejos: revisar clips cortos o el test del centroide de pelo.
- Si los captions realmente van adelantados (fallo 3): comparar los tiempos de palabras de whisper con los frames de entrada de cada caption.
- Que el aspecto del policía zombi sea el mismo en todos los planos (solo hay una silueta, en 0:12).
