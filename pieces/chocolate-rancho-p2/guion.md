---
type: plan
status: draft
tags: [atrium-novelas, guion, telenovela, omni-flash, vista-stories, parte2]
relatedTo: [chocolate-rancho, atrium-novelas]
---
# La Taza de Chocolate · Parte 2

Sigue justo después del cliffhanger de la Parte 1: Damián compró la empresa, salvó el rancho de don Prudencio y doña Eulalia y citó a Renata en su oficina "mañana". Renata se quedó dudando junto a su camioneta. La Parte 2 abre a la mañana siguiente, en la oficina, esperando si viene.

**Título:** Le tiró la taza de chocolate… y ahora le sirvieron una a ella | La Taza de Chocolate · Parte 2

**Marca:** VISTA STORIES (la de la Parte 1).

## Arco
1. **Recapitulación (1 frase):** Benavides: "Ayer le salvó el rancho a don Prudencio, y hoy espera a la señora que le tiró la taza."
2. **¿Viene o no?** Son las nueve y cuarto. Se abre la puerta: Renata entra con una carpeta. "No vine por el puesto."
3. **Pago 1:** trae la lista de las once familias a las que la empresa les iba a quitar la tierra (escrituras sin registrar), sacada del archivo. "Yo firmé cada una de esas cartas." Benavides: con la lista registran las once escrituras esa semana. Damián: "Entonces hoy empieza": ella va a ir a cada casa a decir la verdad, empezando por don Prudencio.
4. **Pago 2 (el corazón):** en el rancho, Renata pide perdón. Eulalia duda, se ablanda y le sirve una taza de chocolate: "En esta casa a nadie se le niega una taza de chocolate." Renata: "Yo le tiré una taza como esta a Damián… y usted me sirve una a mí." Eulalia: "Tómesela despacito, está caliente" (eco de la Parte 1).
5. **Gancho nuevo:** Prudencio pregunta cuál es la primera casa de la lista. Renata lee: "Esperanza Robles." Damián: "Es mi madre. Me fui de su casa sin decirle adiós, hace veinte años." Y su propia empresa casi le quita la casa.
6. **CTA:** Damián a cámara, con carisma: "¿Creen que Esperanza Robles me va a abrir la puerta? Sigan la página para ver la tercera parte." (El nombre se oye 3 veces antes.)

## Personajes (hojas de la Parte 1, misma ropa)
| Asset | Quién | Ropa (prompt) |
|---|---|---|
| RENATA | Renata, 52 | melena ondulada castaño oscuro, blazer **verde bosque oscuro** (no "bottle-green": en la P1 salió un garrafón), blusa de seda gris perla, cadena de oro |
| DAMIAN | Damián Robles, 34 | barba negra corta, pelo hacia atrás, traje azul marino, corbata dorado mostaza, pañuelo blanco |
| PRUDENCIO | don Prudencio, 72 | bigote blanco, **exactamente un** sombrero de fieltro gris claro puesto, chamarra de lona azul marino, camisa de cuadros roja, paliacate rojo óxido |
| EULALIA | doña Eulalia, 68 | trenza gris, blusa blanca bordada de flores rojas, rebozo mostaza, collar de coral |
| BENAVIDES | Lic. Benavides, 60 | pelo plateado, lentes redondos, traje gris claro, corbata azul marino, **manos vacías, sin carpeta** (la única carpeta es la crema de Renata) |

Las 7 hojas de la Parte 1 se revisaron en hoja de contactos: cada nombre muestra a la persona/lugar correcto y los md5 son distintos.
Locaciones: **LOC_DESPACHOROBLES (hoja nueva)**: oficina luminosa, escritorio de madera oscura, ventanal con ciudad, puerta a la izquierda, sin letreros. LOC_HUERTO: patio y porche del rancho (hora dorada; atardecer en r4 y CTA). Utilería: PROP_TAZA (una sola taza de talavera y una concha), una sola carpeta crema.

**Geografía fija.** Oficina: Renata a la IZQUIERDA (lado de la puerta), Damián a la DERECHA tras el escritorio, Benavides de pie a la DERECHA junto a la ventana. Rancho: Prudencio y Eulalia a la IZQUIERDA (lado del porche), Renata y Damián a la DERECHA; Renata sentada en el lado derecho de la mesa. En los planos sobre el hombro, el del borde va con su `@{ASSET}` y su ropa (REN_B, DAM_B, PRU_B en clips.py).

Política: sin niños (Damián recuerda, no hay flashback), sin dinero ni bancos (el conflicto son escrituras sin registrar y cartas firmadas), sin señalar con el dedo, sin armas, verbos suaves. Prevención de fallos Omni (QA de reten-sierra-p2 y medalla-mezcal-p2): un solo sombrero en la cabeza, "Clean frame, no captions" en todos los estilos, "each sentence only once", sin letreros ni gafetes, utilería única (una carpeta, una taza).

Palabras a vigilar: "Prudencio", "Eulalia", "Benavides", "Esperanza Robles", "despacito", "escrituras", "vergüenza". Se evitó la j donde se pudo ("trajiste" → "convenciste", sin "trabajo", "hijo", "espejo").

## Planos
PP = primer plano · PM = plano medio · SH = sobre el hombro · det = detalle

| # | plano | quién | línea / acción | clip |
|---|---|---|---|---|
| **1. La oficina: ¿viene o no? (suspenso)** |||||
| 1 | PM | BENAVIDES | junto a la ventana, mira el reloj: "Ayer le salvó el rancho a don Prudencio, y hoy espera a la señora que le tiró la taza." | c01 |
| 2 | PP | DAMIAN | "Va a venir, licenciado." / "Nadie duerme tranquilo después de un día como ayer." | c02 |
| 3 | PP | BENAVIDES | "Ya son las nueve y cuarto, señor Robles." / "Esa señora no se rinde tan fácil." | c03 |
| 4 | PM | — | se abre la puerta (izq.), entra Renata con la carpeta al pecho; Damián se pone de pie | c04 |
| 5 | PP SH | RENATA | "Buenos días, Damián." / "Antes de que diga nada, no vine por el puesto." | c05 |
| 6 | PP SH | DAMIAN | le ofrece la silla: "Buenos días, Renata. Siéntese, por favor." / "¿Entonces a qué vino?" | c06 |
| 7 | PP | RENATA | sentada, carpeta en las piernas: "Anoche no pude dormir." / "Saqué esto del archivo de la empresa antes de que lo borraran." | c07 |
| 8 | det | — | deja la carpeta en el escritorio y la abre: una lista | i1 |
| 9 | PP | DAMIAN | "¿Qué es esta lista, Renata?" | c08 |
| 10 | PP | RENATA | "Once familias, como la de don Prudencio." / "A todas les dije que el viernes perdían su tierra." | c09 |
| 11 | PP | BENAVIDES | se inclina sobre la lista: "Escrituras sin registrar en todo el municipio." / "La empresa iba por todas, señor Robles." | c10 |
| 12 | PP | DAMIAN | "¿Por qué me la da a mí?" / "Usted podía romperla y nadie se iba a enterar." | c11 |
| 13 | PP | RENATA | "Porque yo firmé cada una de esas cartas." / "Y anoche, por primera vez en años, me dio vergüenza." | c12 |
| 14 | PP | DAMIAN | reacción muda: se le suaviza la cara, asiente | r1 |
| 15 | PM | BENAVIDES | "Señor Robles, con esta lista podemos registrar las once escrituras esta misma semana." | c13 |
| 16 | PP | DAMIAN | se levanta: "Entonces hoy empieza, Renata." / "Usted va a ir conmigo a esas once casas a decir la verdad." | c14 |
| 17 | PP | RENATA | "Me van a cerrar la puerta en la cara." / "Y van a tener razón." | c15 |
| 18 | PP SH | DAMIAN | "Doña Eulalia no me cerró la puerta a mí." / "Y empezamos hoy mismo, con don Prudencio." | c16 |
| 19 | PP | RENATA | "¿Con don Prudencio? ¿Hoy mismo?" / "Doña Eulalia no me va a querer ni ver." | c17 |
| **2. El rancho: el perdón** |||||
| 20 | PP SH | PRUDENCIO | "¿Otra vez usted, licenciada?" / "¿Ahora qué papeles nos trae?" | c18 |
| 21 | PP SH | RENATA | manos juntas, Damián detrás: "Ningún papel, don Prudencio." / "Vine a pedirles perdón, a usted y a doña Eulalia." | c19 |
| 22 | PP | EULALIA | brazos cruzados: "Ayer nos quería sacar de nuestra casa." / "¿Y hoy viene a pedirnos perdón?" | c20 |
| 23 | PP | RENATA | "Tiene razón, doña Eulalia." / "Pero se lo tenía que decir en persona." | c21 |
| 24 | PP | PRUDENCIO | mira a Damián: "¿Tú la convenciste, muchacho?" | c22 |
| 25 | PP | DAMIAN | "Vino por su cuenta, don Prudencio." / "Yo nada más la acompañé." | c23 |
| **3. La taza (cálida)** |||||
| 26 | PP | EULALIA | reacción muda: mira a Renata, se le ablanda la cara, baja los brazos | r2 |
| 27 | PM | EULALIA | le ofrece la silla: "Siéntese, licenciada." / "En esta casa a nadie se le niega una taza de chocolate." | c24 |
| 28 | det | — | las manos de Eulalia ponen la taza de talavera y una concha frente a Renata | i2 |
| 29 | PP | RENATA | manos en la taza: "Doña Eulalia, yo le tiré una taza como esta a Damián." / "Y usted me sirve una a mí." | c25 |
| 30 | PP | EULALIA | "Por eso mismo, licenciada." / "Tómesela despacito, está caliente." | c26 |
| 31 | PP | DAMIAN | "¿Ya ve, Renata?" / "Así empezó todo para mí, con una taza y un pan." | c27 |
| **4. Gancho nuevo (suspenso)** |||||
| 32 | PM | PRUDENCIO | "Si va a tocar puertas, licenciada, yo conozco a todo el municipio." / "¿A quién le toca primero?" | c28 |
| 33 | PP | RENATA | abre la carpeta: "La primera es una señora del camino de la presa." / "Se llama Esperanza Robles." | c29 |
| 34 | PP | DAMIAN | reacción muda: se le borra la sonrisa, se congela | r3 |
| 35 | PP | PRUDENCIO | "¿Robles? Como tú, muchacho." | c30 |
| 36 | PP | DAMIAN | "Esperanza Robles es mi madre." / "Me fui de su casa sin decirle adiós, hace veinte años." | c31 |
| 37 | PP | EULALIA | manos al pecho: "¿Tu madre, Damián?" / "Veinte años sentado en nuestra mesa, y nunca nos hablaste de tu madre." | c32 |
| 38 | PP | DAMIAN | mira hacia el camino: "Pensé que se había ido del pueblo para siempre." / "Y mi propia empresa casi le quita su casa." | c33 |
| 39 | PP | RENATA | cierra la carpeta: "Damián, yo no sabía." / "Créame, yo no sabía que era su madre." | c34 |
| 40 | PM | DAMIAN | mudo, mira el camino al atardecer, decidido (fundido a negro) | r4 |
| **5. CTA** |||||
| 41 | negro | — | 0,4 s | BLACK |
| 42 | PP a cámara | DAMIAN | con carisma, se ajusta la corbata, media sonrisa, asiente, mano abierta: "¿Creen que Esperanza Robles me va a abrir la puerta?" / "Sigan la página para ver la tercera parte." | c35 |

63 frases, 462 palabras, unos 220-230 s de voz en bruto (41 clips: 34 hablados de 6-10 s, 1 PM mudo, 2 detalles, 4 reacciones).

## Montaje
- Sin plano abierto: arranca con Benavides hablando (recap). Golpe sutil en el frame 0 y cama de suspenso.
- Música: suspenso 0 → r2, cálida r2 → c29 (perdón y la taza), suspenso c29 → fin. Cama baja, la voz manda.
- Corte solo al terminar cada frase; el mismo personaje se queda en su plano (salto dentro del clip). r1–r4 solo porque cuentan algo.
- Negro de 0,4 s antes del CTA. Marca VISTA STORIES arriba al centro (22 px, alpha 80, y=135). Sin CONTINUARÁ.
