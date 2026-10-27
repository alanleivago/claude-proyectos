---
type: summary
status: active
tags: [tiktok, guiones, avatar-low-poly]
relatedTo: [sinaboto-style]
created: 2026-10-26
---

# Análisis B: momomakes64, yuimasensei, polygoth8, yuki.science

Cuatro cuentas de TikTok con una chica anime low poly que explica temas. Para cada cuenta descargué todos sus videos, los transcribí con faster-whisper small, armé contact sheets (1 frame cada 2 s) y saqué vistas, likes y comentarios con yt-dlp.

- **Videos y transcripciones:** `fuentes/tiktok-research/<cuenta>/<id>.mp4` y `<id>.txt`. La primera línea de cada `.txt` trae los metadatos (duración, palabras, palabras por segundo).
- **Contact sheets:** `<cuenta>/sheets/<id>.jpg`.
- **Catálogo con likes y comentarios:** `<cuenta>.catalog.txt`.

## Dato clave: las cuatro cuentas son nuevas

Volví a pedir el catálogo con `--flat-playlist --playlist-end 150` y el perfil de TikTok (`videoCount`). Lo que bajé es **todo lo que han publicado**:

| Cuenta | Creada | Videos | Seguidores | Likes totales | Vistas sumadas | Ritmo |
|---|---|---|---|---|---|---|
| @momomakes64 | 19-oct-2026 | 10 | 48.7k | 334k | ~2.58 M | ~1.7 videos/día |
| @yuimasensei | 23-oct-2026 | 6 (el perfil dice 5) | 26.4k | 141k | ~0.56 M | ~2 videos/día |
| @polygoth8 | 19-oct-2026 | 7 | 23.3k | 105k | ~0.66 M | ~1.4 videos/día |
| @yuki.science | 2023, reactivada el 24-oct-2026 | 5 | 38.0k | 174k | ~0.76 M | ~2.5 videos/día |

Todas pasaron de 0 a 20–50k seguidores en menos de una semana. El formato "chica anime PS1 que explica" está en plena ola, y casi todas salieron después de @sinaboto. Dos cuentas (yuima y yuki) dan crédito al modelo **NETO de evanciao**, el mismo de sinaboto. Momo dice en su descripción que usa **VRoid Studio + Blender** ("to everyone saying AI slop… it's all rendered in blender"). Polygoth usa un personaje propio de estilo parecido.

Las vistas de los videos más recientes están infladas a la baja porque tienen 4–25 h. Al comparar el mejor contra el peor, tomo en cuenta la edad del video.

---

## 1. @momomakes64: "Momo makes" (ingeniería de objetos cotidianos)

**Nicho:** cómo funcionan las cosas cotidianas: bóveda de banco, estadio, auto antirrobo, montaña rusa, grúa, torre de agua, semáforo, globo aerostático, máquina de garra, Mona Lisa. La bio dice "How everyday things actually work, built by Momo 🔧 / Original character 🩷".

**Persona y lore**
- **Momo:** pelo negro, lentes, suéter rosa con lazo, shorts negros y casco naranja de obra. No habla a cámara: es la "constructora" que reacciona (celebra, se enoja, se ríe).
- **El ladrón:** el gran acierto. Es un mimo/ladrón de rayas blanco y negro, con antifaz y gorro, que es el antagonista recurrente. Cada mejora de Momo provoca su contraataque y le da humor físico: hace limbo bajo los láseres, se resbala por el muro, se tapa los oídos con la alarma, termina roncando frente a la bóveda.
- No hay ángulo de robot ni de IA.

**Formato**
- Duración: 62–77 s, siempre alrededor de 70 s.
- Ritmo de voz: 3.3–3.6 palabras/s, el más rápido de las cuatro. Voz femenina neutra de narradora, en segunda persona ("you").
- Unas 240 palabras por guion.

**Fórmula de hook** (los primeros 3 s, palabra por palabra). El patrón ganador es *"If you [versión primitiva y ridícula], you've got a [cosa]… but [falla]"*:
- "If you hide your cash under your mattress, you've got a bank vault, but a burglar just lifts the mattress and grabs it all." → **1.1 M**
- "If you tie a rope across a field and hang a sign that says pay here, you've got a stadium, but a burglar just steps right over it." → **702k**
- "If you put a cart at the top of a hill and let go, you've got a roller coaster, but it can never climb a hill taller than the one it started on." → **329k**
- "If you throw a rope over a tree and pull, you've got a crane, but the branch snaps." → 139k
- "You park your car, walk away for one second, and he just hops in and drives off." → 144k. Es una variante sin "If you", pero mantiene el ladrón.

Los hooks que se salen de la fórmula rinden peor:
- "In 1911, a man walked right out of the Louvre with the Mona Lisa." → **1.9k** en 23 h, el peor de la cuenta. Arranca con un dato histórico y no con un objeto.
- "Without traffic lights, a busy crossroads is just a crash waiting to happen." → 32k en 46 h.
- "This trash bag is about to fly." → 19.7k en 20 h.

**Estructura** (escalera de problema y solución, 4–6 peldaños):
1. Versión primitiva y su falla. Arranca en el frame 0, sin saludo.
2. Repite el ciclo "So you [mejora]… Now [funciona]… but [nueva falla / el ladrón contraataca]" entre 4 y 6 veces. Cada peldaño se nombra con una etiqueta: "This is a chain lift." / "These are relockers." / "This is a time lock."
3. Payoff con la frase del título: "That's why [hecho cotidiano que el espectador conoce]", por ejemplo "That's why your ticket only works once, even if you screenshot it."
4. Cierre ritual: **"Congratulations, you just built a [cosa]."** Variante: "And that's how you build a [cosa]."

**Lenguaje visual**
- Escenas 3D limpias de Blender, menos PS1 que sinaboto: casi no hay dithering, la iluminación es soleada y la paleta pastel, rosa y verde.
- **HUD de "nivel" estilo videojuego:** cartel amarillo en fuente pixel con el nombre del peldaño (LOCKBOX, SAFE, VAULT DOOR, RELOCKERS, TIME LOCK) y debajo "PART 1/5" con una barra de progreso. Arriba aparece "MOMO MAKES · STADIUM".
- **Subtítulos:** una palabra en el centro inferior, fuente pixel blanca con contorno. Las palabras clave van en color: amarillo para el término, celeste para la cualidad, rojo para el peligro o el remate ("SLIDES", "COPY", "HOPS", "SPIES", "NIGHT").
- Insertos: fotos reales de archivo ("REAL PHOTO · 1911", recortes de diarios), primeros planos de mecanismos (pernos, relojes de time lock, imanes de freno), cortes en cámara lenta ("SLOW-MO") y cámara dentro del carro de la montaña rusa.
- Final con tarjeta "CONGRATULATIONS" y una "ride photo" o la toma final de victoria.
- Ritmo: un plano cada 1.5–2.5 s, unos 25–35 planos por minuto vistos en las sheets. El detector de escenas da entre 11 y 70 cortes/min porque las tomas comparten set. La garra es la más rápida, con 70.

**Top contra bottom**

| Video | Vistas | Edad | Likes / comentarios |
|---|---|---|---|
| Bóveda de banco | 1.1 M | 121 h | 131.6k / 1393 |
| Estadio | 702k | 97 h | 74.7k / 455 |
| Montaña rusa | 329k | 140 h | 46.4k / 422 |
| Auto | 144k | 55 h | — |
| Grúa | 139k | 117 h | — |
| Torre de agua | 79.5k | 115 h | — |
| Semáforo | 32k | 46 h | — |
| Garra | 32k | 6 h | — |
| Globo | 19.7k | 20 h | — |
| Mona Lisa | 1.9k | 23 h | — |

Los dos videos de más de 700k tienen el **ladrón como antagonista** y un objeto que se puede "romper", es decir seguridad contra un villano. Los débiles no tienen un villano claro (torre de agua, semáforo, globo) o abren con historia (Mona Lisa). El like rate es del 12–14 %.

---

## 2. @yuimasensei: "Doctor, this is why…" (casos médicos absurdos pero reales)

**Nicho:** cirugía y medicina rarísima pero real: diente que cura la ceguera (osteo-odonto-keratoprosthesis), mano cosida al tobillo, sanguijuelas en la oreja, tocino contra larvas de mosca, oreja cultivada en el brazo, pulgar hecho de un dedo del pie.

**Persona y lore**
- **Yuima-sensei:** modelo NETO, pelo azul, bata blanca y scrubs verdes. Es la médica tutora del espectador.
- **El espectador es "Doctor":** la bio dice "Are you okay, Doctor?". Hay una enfermera secundaria de pelo negro con un monitor que dice "helth" (chiste visual) y un médico NPC de fondo.
- Tono seco, de residencia médica, con humor negro sutil.
- No hay ángulo de IA.

**Formato**
- Duración: 61–100 s. El mejor video es el más largo, con 100 s.
- Ritmo: 2.3–2.6 palabras/s, lento y claro, con pausas entre frases.

**Hook:** siempre **"Good morning, doctor. Your patient [situación grave y concreta]."** La rareza ya viene en el título y en el texto, que es la promesa de la paradoja.
- "Good morning doctor. Your patient has been blind for nine years, and the only broken part is the clear window at the front of her eye." → **425k**. Título: "Doctor, this is how a tooth cures blindness".
- "Good morning doctor. Your patient's hand is in this cooler." → 67.8k
- "Good morning doctor. A dog bit your patient's ear clean off. It's on ice." → 23.9k
- "Good morning, doctor. Your patient lost his thumb in an accident." → 7.7k en 4 h

**Estructura** (diagnóstico diferencial en escalera):
1. Saludo y caso.
2. Intento estándar con su nombre técnico ("This is a corneal transplant").
3. Falla, explicada por el cuerpo ("her immune system finds the new cornea and attacks it").
4. Siguiente intento, con nombre ("This is an artificial cornea").
5. Falla.
6. Giro absurdo, lógico y real ("She already owns one. A tooth.").
7. Procedimiento paso a paso con su nombre técnico.
8. Validación de que es real ("And it's real. Army surgeons have grown ears on soldiers' forearms." / "In America, leeches are an approved medical device." / "Doctors published it. Three patients, ten larvae. Not a single failure.").
9. Cierre ritual: **"Diagnosis complete, doctor."** El mejor video agrega un juego de palabras: "an eye for an eye became a tooth for an eye".

**Lenguaje visual**
- Paleta pastel verde agua, el look más "PS1 limpio" de las cuatro: polígonos facetados y texturas pixeladas.
- **UI médica de juego:** "CASE FILE"; barras de estado ("GRIP", "NERVE"); monitor verde "IMMUNE RESPONSE" con anticuerpos que atacan; rayos X oscuros con etiquetas; carteles "WEEKS: 12" y "8 HOURS"; un **"PATIENT CHART" con sello rojo "REJECTED" o verde "COMPLETE"** como recompensa.
- Etiquetas amarillas con línea guía sobre la anatomía ("CORNEA", "SAME BONES", "SECOND TOE").
- Maniquí de paciente blanco sin rasgos.
- Subtítulo de una palabra en pixel font blanco con contorno.
- Primeros planos de Yuima con expresiones (sonrisa pícara, ojos cerrados) solo en el saludo, en el giro y en el cierre.
- Ritmo: 15–21 cortes/min. Un plano dura unos 3 s.

**Top contra bottom:** el diente que cura la ceguera (425k, 78.8k likes, 18.5 %) aplasta a los demás, que se quedan entre 7.7k y 67.8k. Ahí hay dos lecciones:
- Las vistas caen de un video a otro. La fórmula se repite idéntica y la novedad se gasta rápido.
- El mejor título es una **contradicción** ("how a tooth cures blindness"). Los demás son descripciones del tipo "this is why we put X on his Y", que generan menos curiosidad.

---

## 3. @polygoth8: "polygoth" (hacer cosas desde cero + datos de origen chocantes)

**Nicho:** historia y química de objetos hechos a mano, en la línea de "Primitive Technology": tinta de agalla de roble, vela de cera de abeja, papel de trapos, lipstick de cochinilla, chicle de chicle y plástico, púrpura de Tiro, chocolate como moneda.

**Persona**
- Chica goth: pelo negro desordenado, top negro y collar de murciélago.
- Vive en una cabaña de madera en el bosque. El logo "POLYGOTH" en morado aparece sobre la cabaña de noche al inicio y al final.
- Personaje mudo y expresivo (mueca de asco, ojos cerrados de satisfacción). La narración es tranquila y cómplice, casi ASMR-maker.
- Sin bio, sin lore explícito y sin IA.

**Formato** (dos variantes):
- **A. Tutorial "from scratch"** (71–77 s, unas 225 palabras, 2.9–3.2 palabras/s). Es la que más rinde: tinta 193k, vela 127k.
- **B. Dato chocante de origen** (44–50 s, unas 140 palabras, 3.1–3.3 palabras/s): lipstick 129k, chicle 91k, papel 75k, púrpura 38k, chocolate 11.7k.

**Hooks palabra por palabra**
- A: "If you ever need to write a letter that lasts a thousand years, here's how to make ink completely from scratch." → **193k**
- A: "If the power ever goes out for good, here's how to make a candle completely from scratch." → 127k
- B: "This lipstick is made of bugs, and you've probably eaten them too." → 129k
- B: "You've been chewing plastic, like actual plastic." → 91k
- B: "This piece of paper used to be someone's underwear. No, seriously." → 75k
- B: "This color used to be worth more than gold because it's made of snail slime." → 38k
- B: "chocolate used to be money like actual money and it grew on trees" → 11.7k

Patrón de la variante B: *"This [objeto que tienes en la mano] is/used to be [cosa asquerosa o inesperada]"*. Funciona mejor cuando apunta al espectador ("you've probably eaten them", "You've been chewing") que cuando cuenta historia ("used to be worth more than gold").

**Estructura**
- **A:** hook de supervivencia o legado → "First, you need [ingrediente]" → recolección en la naturaleza con un dato raro (la agalla la forma una avispa) → "Next, you need…" → "Now for the magic part" (la reacción química que cambia de color) → uso histórico ("Leonardo da Vinci's notebooks") → "But there's a catch" → **"Congratulations! You just invented [cosa]"** + remate ("…ink that will outlive you. And your paper.").
- **B:** dato chocante → fuente natural ("See this white fluff on the cactus? That's not mold.") → proceso rápido → número que impacta ("70,000 bugs to make just one pound", "one bean bought a tomato") → gancho con el presente ("Look for Carmine, or E120, on the label") → **cierre que se comparte o te involucra**: "So if your friend wears red lipstick, send her this. She deserves to know." / "So if you're wearing purple right now, you're dressed like a Roman emperor."

**Lenguaje visual**
- El look más PS1 de las cuatro: viñeta fuerte, tonos cálidos ámbar, árboles y follaje pixelados, partículas sprite.
- Muchos **planos de manos en primera persona**: recolectar, machacar en mortero, verter. También ollas sobre fuego y frascos con timer ("DAY 5", "7 DAYS" con luna).
- **Texto de título fijo arriba** en los B ("THIS LIPSTICK IS MADE OF BUGS", "CHOCOLATE USED TO BE MONEY"). Etiquetas amarillas de término (OAK GALL, WASP, IRON, ACIDIC, BEANS, AZTECS), contadores con icono ("x300", "x70,000 = 1 LB", "x95") y el reloj de "200 YEARS / 500 YEARS".
- Subtítulos en minúscula con puntuación ("first," "tea."): fuente redondeada blanca con contorno negro, palabra por palabra. El color va en el término.
- Insertos: etiqueta de ingredientes real con "CARMINE (E120)" resaltado y un teléfono con chat "BESTIE" en el CTA de compartir.
- Ritmo: 11–25 cortes/min. Hay más primeros planos de proceso que tomas del personaje.

**Top contra bottom:** tinta 193k (31.2k likes) > lipstick 129k > vela 127k > chicle 91k > papel 75k > púrpura 38k > chocolate 11.7k (14 h). Los comentarios son relativamente altos (250–350).
- Los dos tutoriales A, que son los más largos, están arriba.
- Los B que **acusan al espectador** (lo comiste, lo masticaste) superan a los B de historia (púrpura, chocolate).
- La tendencia de los últimos videos es a la baja: igual que yuima, se nota el desgaste de la fórmula y quizá la menor novedad del tema.

---

## 4. @yuki.science: "Hi, Lab Partner" (rarezas de tu propio cuerpo)

**Nicho:** neurociencia y fisiología de lo cotidiano: no te puedes hacer cosquillas, no ves tu nariz, hipo, brain freeze, bostezo contagioso. Los títulos son siempre "Why [cosa que te pasa]?!".

**Persona y lore** (la persona más fuerte de las cuatro)
- **Yuki:** modelo NETO "rnmiku" de evanciao. Pelo plateado corto, gafas de laboratorio celestes en la cabeza, bata blanca.
- **Tímida y nerviosa:** abre con "Um…", se sonroja, tiene pausas y risitas, se disculpa ("Sorry, I have the hiccups").
- El espectador es **"lab partner"**, y la bio lo dice: "Hi, Lab Partner." Agradece a "@Rin" (otra cuenta del mismo universo, kingpinrin).
- Responde comentarios dentro del video: "Oh, we've got mail" + captura del comentario "ruin my life i beg you" → "Okay, you asked for this. You're now breathing manually." Ese video hizo 193k.
- Sin IA, aunque cierra el de las cosquillas con un robot ("you're gonna need a robot").

**Formato**
- Duración: 48–65 s, los más cortos junto con polygoth B.
- Ritmo: 2.5–2.8 palabras/s, con muchas pausas actuadas.
- Unas 135–170 palabras.
- Hablado en **primera persona a cámara**: es la única de las cuatro que "es" la narradora.

**Hooks palabra por palabra** (todos empiezan con "Um, lab partner…" + una acción que el espectador prueba en ese momento):
- "Um, hi, lab partner. Can I tell you something weird? You can't tickle yourself. Go on, try it. Nothing, right?" → **329k**, 78.7k likes, 1817 comentarios, like rate del 24 %.
- "Um, lab partner, look down. Not at your phone, at your nose. It's been there the whole time." → **193k**, 1058 comentarios.
- "Um, lab partner? *Hup!* Sorry, I have the hiccups." → **187k**
- "Um, lab partner? You're eating that ice cream way too fast. Brain freeze incoming." → 32k
- "Um, lab partner? Sorry. Did you just yawn too? I knew it." → 19.4k en 5 h

**Estructura**
1. Hook interactivo o actuado: el espectador hace algo ahora mismo.
2. Mecanismo explicado con el **término técnico rotulado**: "That's an efference copy." / "That's sensory attenuation." / "That's Singultus. It's Latin for sob. Very dramatic."
3. "Scientists actually…": un experimento real (robot que hace cosquillas con 0.2 s de retraso, oxígeno extra que no reduce el bostezo).
4. Número récord ("Charles Osborne hiccuped for 68 years… 430 million hics").
5. **"And the weird part, lab partner…"**: un giro final.
6. Remate en bucle o de complicidad: "So if you caught mine, I guess we're close now." / "you've been thinking about yawning this whole video. How many have you done? Me neither." / "Your brain will hide your nose again soon… Until someone reminds you."

**Lenguaje visual**
- Laboratorio oscuro verde con frascos cian. Hay una segunda sala "dentro del cerebro" con piso de grilla neón cian, pizarra con gráficos magenta y paredes de textura de tejido rosa.
- **Instrumentos de juego:** medidor analógico ("CEREBELLUM", "BRAIN TEMP"), display LCD verde ("0.20 s delay", "45°C"), panel de interruptores "NOISE FILTER / BREATHING: AUTO-MANUAL", tablero de fotos "CLOSE FRIENDS".
- Etiqueta amarilla del término arriba ("SENSORY ATTENUATION", "BLIND SPOT").
- Pocos planos y mucho primer plano de la cara con expresiones (sonrojo, ojos cerrados, estrellas en los ojos). La cara manda.
- Subtítulos en minúscula con puntuación (fuente pixel redondeada, una palabra), igual que polygoth.
- Ritmo: 18–20 cortes/min, el más tranquilo.

**Top contra bottom:** cosquillas 329k > nariz 193k > hipo 187k ≫ brain freeze 32k > bostezo 19k (5 h). Los tres de arriba **tienen al espectador haciendo o sintiendo algo durante el video** (intenta hacerte cosquillas, mira tu nariz, respiración manual, hipo actuado). Brain freeze pide recordar algo ("you're eating that ice cream"), no hacerlo. Es la cuenta con mayor engagement: comentarios y like rate muy por encima del resto.

---

## Patrones entre cuentas

1. **Personaje fijo y nombre de "rol" para el espectador.** "Doctor", "lab partner" y "you just built" convierten al espectador en participante. Las dos cuentas con trato directo (yuki y yuima) tienen el like rate más alto, entre el 18 y el 24 %.
2. **Ritual de apertura y de cierre idéntico en todos los videos:**

   | Cuenta | Apertura | Cierre |
   |---|---|---|
   | momomakes64 | "If you…, you've got a…" | "Congratulations, you just built a ___." |
   | yuimasensei | "Good morning, doctor." | "Diagnosis complete, doctor." |
   | polygoth8 | — | "Congratulations, you just invented ___." |
   | yuki.science | "Um, lab partner…" | — |

   Es reconocimiento de marca en 1 s. Ojo: también se desgasta (yuima y polygoth bajan de un video a otro).
3. **Escalera de problema y solución con fallas, no una lista de datos.** "So you… but… so you…": cada solución nueva rompe la anterior. Es el esqueleto de momo, yuima y polygoth A. Cada peldaño termina con **"This is a [término técnico]."** El término queda rotulado en pantalla con una etiqueta amarilla, lo que da sensación de aprender algo.
4. **"That's why [algo que viste en tu vida]."** El payoff conecta con lo cotidiano: los bloques de la grúa, el ticket que no sirve en captura, la ropa morada, la etiqueta E120. Es la frase que justifica compartir.
5. **El título es la pregunta o la paradoja y el video es la respuesta.** Los mejores títulos son contradicciones o acusaciones: "how a tooth cures blindness", "Your lipstick is made of bugs", "Why can't you tickle yourself?!", "why a copied car key won't start your car". Las descripciones planas ("this is why we put X on his Y") rinden menos.
6. **Conflicto o personaje secundario = humor = vistas.** El ladrón de Momo explica sus dos videos virales. La enfermera "helth" de Yuima y el comentario "ruin my life" de Yuki cumplen un papel parecido.
7. **Lenguaje visual compartido** (la "gramática" del género, coherente con sinaboto):
   - Subtítulo de una sola palabra en el tercio inferior, en fuente pixel blanca con contorno, con color en la palabra clave.
   - Etiqueta amarilla pixel con el nombre del concepto arriba.
   - HUD de videojuego: PART x/5, barras, medidores, sellos "COMPLETE/REJECTED", contadores "x70,000".
   - Insertos 2D pixelados (rayos X, monitores, fotos reales "REAL PHOTO", etiquetas de producto).
   - Un plano cada 2–3 s.
   - Tarjeta o momento de "victoria" al final.
8. **Duración y densidad:**
   - Ingeniería y procesos: unos 70 s a 3.3–3.6 palabras/s (~240 palabras).
   - Medicina: 60–100 s a ~2.4 palabras/s.
   - Datos chocantes o del cuerpo: 45–65 s a 2.6–3.2 palabras/s (~140–170 palabras).

   No hay correlación de "más corto = más vistas". Los mejores de cada cuenta suelen ser los **más largos** de esa cuenta (bóveda 68 s, diente 100 s, tinta 77 s), porque tienen más peldaños en la escalera.
9. **Sin intro y sin CTA de "follow".** La primera palabra está en el segundo 0.00 en los 28 videos. El CTA, cuando existe, es de compartir ("send her this") o de bucle ("How many have you done? Me neither.").
10. **Credibilidad:** todos meten una prueba de que es real ("Doctors published it", "approved medical device", foto real de 1911, "Scientists actually…", "Look for E120 on the label"). En un formato animado y "cute", eso evita el "esto es falso" en los comentarios.
11. **Ninguna usa el ángulo robot/IA como persona.** Momo tuvo que defenderse de "AI slop" en la descripción. Si nuestra chica tiene lore de robot, conviene que sea un rasgo de personaje (como el humor de Yuki), no algo que haga pensar que el video está hecho con IA.

### Plantilla sugerida para nuestros guiones (síntesis)

- **0–3 s:** versión primitiva o acción que hace el espectador + falla, o paradoja ("X cura Y"), con el nombre de rol del espectador.
- **3–55 s:** 4–5 peldaños "So you… Now… but…", cada uno cerrado con "This is a [término]" (etiqueta amarilla + HUD de PART n/5) y un antagonista o secundario con humor físico.
- **55–65 s:** "That's why [algo cotidiano]" + prueba de que es real.
- **Cierre:** frase ritual propia de nuestra chica + remate en bucle o de compartir.
- **Volumen:** unas 220–240 palabras a ~3.3 palabras/s para unos 70 s.

---

## Apéndice: transcripciones de los 3 mejores videos por cuenta

Son transcripciones automáticas con faster-whisper small. Corregí a mano solo los términos técnicos mal escritos, marcados entre [ ].

### @momomakes64

**1. Bóveda de banco (7699212417854622990), 1.1 M vistas, 68 s**
> If you hide your cash under your mattress, you've got a bank vault, but a burglar just lifts the mattress and grabs it all. So you lock it in a steel box with a key, but he doesn't even need the key. He just walks off with the whole box. So you get a safe so heavy he can't lift it and bolt it to the floor. Now he can't even move it, but he just drills right through the door. So you build a giant round door out of steel as thick as your arm is long. It's balanced so well, you can close it with one finger. Then giant bolts slide out into the walls, all the way around. Inside the door, a layer of super hard steel snaps drill bits like crackers. And if he smashes the lock, hidden backup bolts slam shut for good. These are relockers, but if he spies on you dialing the code, he can come back at night and open it. So you put clocks inside the door that keep it locked until morning, even with the right code. There are three in case one of them stops. This is a time lock. Now all he can do is wait until you find him snoring there in the morning. That's why even the bank manager can't open the vault at night. Congratulations, you just built a bank vault.

**2. Estadio (7699590359575317773), 702k vistas, 73 s**
> If you tie a rope across a field and hang a sign that says pay here, you've got a stadium, but a burglar just steps right over it. So you build a wooden fence all the way around, with one gate where everyone pays, but he just climbs right over the top. So you build a giant wall around the whole field, way too tall to climb. It's smooth and curved, so there's nothing to grab onto. He just slides right back down, and you stack rows of seats on the inside so everyone can see. Now the only way in is through the front gate. So you sell paper tickets at a little booth by the gate, and you put in a metal [turnstile] that only spins once for each ticket. One ticket, one person, one click, but he just copies a ticket and walks right in with the copy. So you print a secret code on every ticket, and a scanner checks it at the gate. It remembers every code it has ever seen, so each one only works once. Your real ticket beeps green, and in you go. But his copy of it beeps red, even in a fake mustache. But then he just hops right over the [turnstile]. So you put staff at every gate, and they send him right back out. That's why your ticket only works once, even if you screenshot it. Congratulations, you just built a stadium!

**3. Montaña rusa (7698928646559452430), 329k vistas, 72 s**
> If you put a cart at the top of a hill and let go, you've got a roller coaster, but it can never climb a hill taller than the one it started on. So you add a chain that drags the cart all the way up to the very top first. That clack, clack, clack on the way up is a little catch that stops it from rolling back. This is a chain lift. Now it zooms right over the next hill with speed to spare, but hit a flat corner fast and you fly right out sideways. So you tilt the track into the turn like leaning into a corner on your bike. Now the track pushes you into the turn instead of throwing you out. This is a banked turn. Then you add a loop, but a perfectly round one squashes you so hard you'd black out. So you make it a teardrop, tight at the top where you're slow and wide at the bottom where you're fast. Now you whip around it without the squish. That's why loops are never round. Now you have to stop, but brakes that rub just squeal and smoke. So you hang magnets beside the track and fins on the cart slide right between them. They never even touch, but the cart still glides to a smooth stop. That's why rides end with a whoosh, not a screech. Congratulations! You just built a roller coaster.

### @yuimasensei

**1. Un diente cura la ceguera (7699936307472059661), 425k vistas, 100 s**
> Good morning doctor. Your patient has been blind for nine years, and the only broken part is the clear window at the front of her eye. A chemical burn [turned it] white, like frosted glass, so you swap in a clear one from a donor. This is a corneal transplant, but her burned eye is dry and full of new blood vessels, so her immune system finds the new cornea and attacks it. So you skip living tissue and fit a clear plastic window instead. This is an artificial cornea, but her body treats plastic like a splinter. The tissue around it [melts] away, and the plastic gets pushed right out. So you need a frame made of her. Something hard her body won't reject. She already owns one. A tooth. So you pull her canine with a slice of jawbone attached. Shave it into a thin plate, drill a hole through the middle, and glue the plastic lens into the hole. But a bare tooth plate dies without a blood supply, so you bury it under the skin below her eye for a few months to grow one. Her eye's surface is still bone dry, so you cover it with lining from inside her cheek, which is always wet. Then you dig the plate out and stitch it onto the eye, lens poking through. This is [osteo-odonto-keratoprosthesis]. The tooth holds the lens, the cheek keeps it alive, and she can see. Diagnosis complete, doctor, and it also explains why in this clinic, an eye for an eye became a tooth for an eye.

**2. Mano cosida al tobillo (7700037032579484941), 67.8k vistas, 87 s**
> Good morning doctor. Your patient's hand is in this cooler. A factory machine took it off at the wrist. So you sew it straight back on. This is a replantation, but the machine also crushed his arm and packed it with dirt. Sew a hand onto that and the vessels clot. The wound rots and the hand dies anyway. So you put the hand on ice and wait for the arm to heal. This is cold storage. But a hand is full of muscle and muscle starts dying after about six hours without blood. Ice buys you hours. The arm needs weeks. So the hand needs a blood supply right now from somewhere that isn't his arm. His leg. So you open up the inside of his ankle. Join the hand's artery and veins to the ankle's with stitches finer than a hair and stitch the hand to his leg. This is ectopic implantation. A body part parked where it doesn't belong. Now his ankle keeps the hand alive while his arm heals for about a month. Then you cut it free, carry it up and reattach it to his arm in one long surgery. With months of therapy, the fingers start to move again. Diagnosis complete, doctor.

**3. Sanguijuelas en la oreja (7700241989266181390), 23.9k vistas, 90 s**
> Good morning doctor. A dog bit your patient's ear clean off. It's on ice. So you sew it back on and join its artery, so blood flows in. This is a replantation. You've done this before, but an ear's veins are thinner than a hair. Too small to sew, blood gets… It's in, but it can't get out. The ear swells up and turns purple, so you cut tiny slits to let it bleed out. But the slits clot shut in minutes and the ear keeps darkening. You need something that drains it, stops it clotting and doesn't quit for days. A leech. So you put a leech on the ear. It bites with three tiny jaws and drinks about a teaspoon of blood. Then, after about half an hour, it lets go. But its spit keeps the bite bleeding for hours, draining the ear. This is leech therapy. But a leech's gut is full of bacteria that can infect the wound. So you start antibiotics before the first bite. You keep adding fresh leeches for about a week until new veins grow in and the ear drains on its own. And this isn't folk medicine. In America, leeches are an approved medical device. Diagnosis complete, doctor.

### @polygoth8

**1. Tinta que dura 1000 años (7699501493023542558), 193.5k vistas, 78 s**
> If you ever need to write a letter that lasts a thousand years, here's how to make ink completely from scratch. First, find an oak tree and look for these weird little balls on the twigs. They're called oak galls, and they're not fruit. A tiny wasp laid its egg inside a bud, and the tree grew this ball around it like a little nursery. Pick a handful, crush them into powder, and soak them in rainwater overnight. The water turns brown, like weak tea. Next, you need iron. Drop some rusty nails into a jar of vinegar and leave them for a week. The vinegar slowly eats the iron until the liquid turns orange. Now for the magic part. Pour the iron water into the gall tea and it instantly turns black. Stir in a spoonful of honey so the ink flows smoothly and sticks to the page. Then, cut the tip of a feather into a pen, dip it, and write. This exact ink was used for over a thousand years to write bibles, maps, and even Leonardo da Vinci's notebooks. But there's a catch. It's acidic, so over hundreds of years it slowly eats through the paper until some letters literally fall out of the page. Congratulations! You just invented ink that will outlive you. And your paper.

**2. Tu lipstick está hecho de bichos (7699986403098234142), 128.7k vistas, 45 s**
> This lipstick is made of bugs, and you've probably eaten them too. See this white fluff on the cactus? That's not mold. Those are bugs, called cochineal. Squish one, and, yep, that's the red. Scrape off a bunch, let them dry in the sun, and crush them into powder. It takes about 70,000 bugs to make just one pound. Now boil the powder, add a pinch of alum, and the red sinks to the bottom. That's carmine. Melt some beeswax with a splash of oil. Stir in the carmine, and pour it into a little mold. Let it set, and that's lipstick. And it's still used today. Look for carmine, or E120, on the label. Lipstick, candy, yogurt, even juice. So if your friend wears red lipstick, send her this. She deserves to know.

**3. Vela desde cero (7699101150527704351), 126.9k vistas, 72 s**
> If the power ever goes out for good, here's how to make a candle completely from scratch. First, you need wax. Find a beehive and carefully cut out a chunk of honeycomb because all those little hexagons are made of pure beeswax. Just try not to get stung. Toss the comb into a pot of water and heat it up. The wax melts and floats to the top while the honey dissolves into the water and all the gunk sinks to the bottom. Once it cools, the wax hardens into a clean yellow disc that you can just lift right off. Next, you need a wick. Twist a few cotton threads together, soak them in salt water and let them dry so the wick burns slowly instead of all at once. Now melt the wax again and dip the wick in. Pull it out, let it cool for a few seconds and dip it again. Every dip adds another thin layer of wax and after about 30 dips, your string has turned into a candle. Hang it up overnight to harden, then trim the wick. When you light it, the flame melts the wax right below it. The wick soaks up that liquid wax like a straw, the heat turns it into vapor and that vapor is what actually burns. Congratulations, you just invented the candle.

### @yuki.science

**1. ¿Por qué no te puedes hacer cosquillas? (7700257055554407682), 329k vistas, 49 s**
> Um, hi, lab partner. Can I tell you something weird? You can't tickle yourself. Go on, try it. Nothing, right? But if I did it… Okay, okay, I won't. It's because your brain is a bit of a know-it-all. Every time you move, it sends a quiet copy of the plan to the back of your head. That's an efference copy. Your cerebellum reads that copy, predicts exactly how the touch will feel, and turns it down. That's sensory attenuation. And tickling only works as a surprise. You can't surprise yourself. But scientists built a robot that tickles you when you move it, with a tiny delay. Just a fifth of a second, and suddenly, it tickles. So if you really want to tickle yourself, lab partner, you're gonna need a robot.

**2. ¿Por qué no ves tu propia nariz? (7700693118105996566), 192.8k vistas, 61 s**
> Um, lab partner, look down. Not at your phone, at your nose. It's been there the whole time. Your nose is in every single thing you've ever seen. Your brain just edits it out. It ignores anything that never changes. That's sensory adaptation. And it gets worse. Each eye has a little hole in it right where the nerve plugs in. No light sensors at all. That's your blind spot. Your brain fills the hole in with a guess, and you've never noticed. Not once. Oh, we've got mail. "Ruin my life. I beg you." Okay, you asked for this. You're now breathing manually. Your brainstem usually handles that for you. But the second you think about it, you take the wheel. Same with blinking. And your tongue? It's never comfortable in your mouth. Ever. Don't worry. Stop paying attention and your brainstem takes over again. Your brain will hide your nose again soon, too, lab partner. Until someone reminds you.

**3. ¿Por qué nos da hipo? (7700604418009468182), 186.6k vistas, 65 s**
> Um, lab partner? *Hup!* Sorry, I have the hiccups. Under your lungs, there's a big dome-shaped muscle that pulls air in with every breath. That's your diaphragm. But eat too fast, or drink something fizzy, and your stomach stretches and pokes the nerves that control it. Those nerves send a message to a tiny hiccup center in your brainstem, which just keeps pressing the same button. So your diaphragm twitches, you suck in air, and a split second later, your vocal cords slam shut. Doctors have a name for it. That's singultus. It's Latin for sob. Very dramatic. Most hiccups stop on their own. But one man, Charles Osborne, hiccuped for 68 years. 68. That's about 430 million hics. Holding your breath or sipping cold water might help, but honestly, scientists still aren't sure why. And the weird part, lab partner, babies hiccup before they're even born. Some scientists think it's leftover from our ancient ancestors, who breathed with gills.
