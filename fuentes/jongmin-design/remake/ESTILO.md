---
type: spec
status: active
tags: [upnext, jongmin-design, ps1, low-poly, reels, dialogo, gnomo, mechayuki, remake, subtitulos, crt]
relatedTo: [mechayuki-rules, mechayuki-expeditions, digger-channel, zero-fem-model, long-video-delivery]
---

# ESTILO UpNext: especificación de remake (serie de @jongmin.design)

Base: 7 reels, mediciones de audio de 2 reels y 4 fotogramas completos de 1080x1920 (Dd2Y 1.5 s y 39.0 s, DeDh 5.0 s, DenX 20.0 s). Snapshot 2026-11-15.

**Confianza de cada dato:**
- **(med.)**: leído sobre los 4 fotogramas, en px de 1080x1920, a ojo (±8 px). Verificar con cuentagotas y regla sobre los PNG antes de congelar.
- **(tabla)**: calculado de las tablas de planos y diálogo.
- **(inf.)**: inferido; no hay medición directa.

## 1. Formato

| Reel | Dur. (s) | Planos | s/plano |
|---|---|---|---|
| Dd2Y | 72.7 | 21 | 3.46 |
| DeDh | 74.7 | 33 | 2.26 |
| DenX | 85.1 | 35 | 2.43 |
| Dd-H | 77.4 | 53 (52 + negro) | 1.46 |
| DeIZ | 78.1 | 23 | 3.40 |
| Dd5E | 78.7 | 32 (2 son flashes de 1–2 fotogramas) | 2.46 |
| DeqI | 71.3 | 29 (28 + negro) | 2.46 |
| **Total / media** | 538.0 s, media 76.9 s | 226, media 32.3 | media ponderada 2.38; mediana 2.46 |

- **Resolución:** 1080x1920 (9:16). **fps:** 30 (inf.; el original no se midió).
- **Duración objetivo:** 72–78 s. Rango observado 71.3–85.1 s, mediana 77.4 s.
- **Tope duro:** 80 s, de la guía Mechayuki. DenX (85.1 s) hay que recortarlo. Se acorta el time-lapse mudo de 8.7 s a ~3 s y la cola final de 2.8 s a ~1.5 s, y queda en ~78 s.
- **Planos:** 21–35 es lo típico (mediana 32). Hay dos modos:
  - **Lento:** Dd2Y y DeIZ, 21–23 planos de ~3.4 s, con planos de hasta 13.6 s en silencios. Es el modo del reel de 342K.
  - **Rápido:** Dd-H, 53 planos de ~1.5 s. Solo se justifica en un ping-pong de líneas de 1–3 palabras.
- **Regla del remake:**
  - 21–33 planos y 2.4–3.5 s de media.
  - Ningún plano de acción dura menos de 0.7 s. Los flashes de 2 fotogramas son efecto, no plano.
  - Los planos de 6–13 s están permitidos solo si hay acción o silencio cómico.
- **Aviso:** muchos cortes de las tablas son estimados (±0.7 s). Dd2Y solo tiene 4 CUT detectados.
- **Marco (med.):** el cuadro va enmascarado con un borde negro de ~14 px a los lados y ~28 px arriba y abajo. Las esquinas son redondeadas, radio ~32 px. El área útil es de ~1052x1864. Se enmascara sobre el render de 1080x1920.

## 2. Subtítulos

**Fuente.** El original es un bitmap pixelado, redondeado y grueso, condensado y con letras casi pegadas, de estilo juego PS1/PS2. La "i" se parece a "l".
- **Disponible más parecida:** **Pixelify Sans Bold (700)**, ya usada en el canal.
- Descartadas: Press Start 2P (muy ancha), VT323 (fina), Silkscreen (solo mayúsculas).
- **Tracking:** apretado, -1 px, **sin** el espaciado de letras de los subtítulos Mechayuki.

**Tamaño (med.):**
- Avance medio de ~27 px por carácter. Ejemplos: "Starting tomorrow," son 18 car. en 510 px, "And that sleeps over there." son 27 car. en 707 px.
- Altura de mayúscula ~46 px. Interlínea de 80 px.
- Punto de partida con Pixelify: **66 px** (3.4 % de 1920) con compresión horizontal ×0.84 para igualar el ancho medido. Calibrar superponiendo los fotogramas de referencia.
- Ancho máximo de línea ~810 px (75 %), unos 30 caracteres.

**Posición (med.):**
- Centrado horizontal.
- **Línea 1 anclada en y ≈ 1325 px** (69 %), fija en TODOS los planos.
- Una segunda línea queda en y ≈ 1405 (+80 px).
- El bloque crece hacia abajo, nunca hacia arriba.
- Componer los planos con la cara por encima de y ≈ 1260. El subtítulo tapa torso, piernas o piso, como en el original.

**Color por hablante.** Regla fija, sin las excepciones del original:

| Hablante | Hex | Observaciones |
|---|---|---|
| Protagonista | **#FFFFFF** | |
| Gnomo (Pip) | **#F3DF6A** | Promedio de los amarillos medidos en las notas: #FFE45A, #F4D84A, #F2DE8A y #F2E27A. |

El original tiñe algunas tarjetas del gnomo de crema o celeste, probablemente por fade. Aquí no se hace.

**Contorno y sombra:**
- Contorno negro #0A0A10, **6 px** de grosor total (3 px hacia afuera del glifo).
- Sombra dura de (4, 4) px, sin blur.
- Sin caja de fondo.

**Palabras por tarjeta:**
- Una frase completa por tarjeta, de 1 a 8 palabras, máximo 2 líneas.
- Si la frase pasa de ~28 caracteres, se parte en dos líneas equilibradas ("Which one did you / actually do this week?").
- Las frases con pausa se parten en dos tarjetas ("I just…" → "don't want it enough.").
- Las dudas arrancan con "…" ("…Does this count?").

**Construcción:**
- **Máquina de escribir letra a letra**, de izquierda a derecha, con el layout final centrado desde el primer carácter. El texto crece sin moverse.
- Velocidad sincronizada con la voz: el texto completo debe estar listo al ~85 % de la duración hablada, unos 14–18 car./s (inf.).
- La tarjeta arranca ~0.1 s antes de la voz y se mantiene hasta 0.5 s después de que termina.
- Entre tarjetas hay **corte seco**, sin fundido.
- Una tarjeta puede cruzar un corte de plano.
- Énfasis opcional: 1 palabra clave por tarjeta a escala ×1.15–1.25. Es lo único que se toma del karaoke de DenX, y no se tiñe. Se descarta el resaltado amarillo por palabra.

**Cuándo NO hay subtítulo:**
- Silencios de 0.8 s o más.
- Inserts de objetos, relojes y pantallas. El texto diegético (notas, chat, reloj) ya se lee.
- Los últimos ~1.5 s.

**Qué se subtitula:**
- Se subtitula **toda** línea con voz. Varias del original no se muestran (Moss, Let me guess…, Nah.), y eso solo genera dudas.
- Los marcadores horarios de la libreta ("Seven a.m.") van como texto de libreta, no como subtítulo.

## 3. Imagen

- **Look base:** low poly PS1/PS2, texturas muy chicas con filtro nearest, grano de película/VHS leve, marco negro redondeado.
- **Resolución interna aparente (inf. de los bloques visibles):**
  - Las texturas tienen ~32–64 px por superficie. Con el upscale se ven bloques de 12–20 px en la barba, la camisa y el follaje.
  - La silueta de la geometría es más suave.
  - Punto de partida: renderizar a **540x960** (×2) y reescalar a 1080x1920 con texturas nearest.
  - No usar 240p ni 360p con nearest ×3. Queda más grueso que el original.
- **Viñeta (med. + inf.):**
  - Elíptica, sin efecto hasta ~62 % del radio, y oscurece hacia las esquinas.
  - Día: -30 % de luminancia en las esquinas. Noche: -45 %.
  - A eso se suma el marco negro redondeado.
- **Grano:**
  - Ruido de luma animado a 30 fps, de ±6/255 y 1.5–2 px de tamaño. Ruido de croma ~1/3 de eso.
  - Se ve en las zonas planas oscuras (pared azul de noche).
  - Los bloques de compresión salen del encode del original. No se simulan; se mantiene CRF 24 en la versión share.
- **CRT / scanlines (inf.):**
  - Scanlines sutiles: 3 px de período y 6–10 % de opacidad.
  - Sangrado horizontal de croma de 3–4 px.
  - Jitter de tracking casi imperceptible.
  - Bloom leve: umbral 0.85, fuerza 0.15, solo para LEDs, ventanas y luz de puerta.
- **Aberración cromática (med.):**
  - Se ve en bordes de alto contraste: el borde de la cama y el pecho del protagonista.
  - Canal R +2 px y canal B -2 px en horizontal. Crece a 3–4 px hacia los bordes.
- **Partículas:** motas blancas tipo polvo, 40–80, de 3–5 px, con deriva lenta. Se ven sobre el papel tapiz con luz. En otoño van hojas instanciadas.
- **Profundidad de campo:**
  - Solo en primeros planos de personaje: fondo con blur de 6–10 px (placas pixeladas).
  - Los planos generales van nítidos.
  - Sin DoF en inserts cenitales.
- **Iluminación:**
  - **Noche:** ambiente azul marino (#1B2447 ×0.6) y una luz práctica fría. El celular ilumina la cara de blanco-lila #B9A3C0, con radio corto de ~1.2 m. Las sombras son casi negras.
  - **Día:** luz cálida de ventana más relleno ambiente del 25–35 %.
  - **Sombras:** duras y oscuras (~60 % de opacidad), como pide la guía Mechayuki.
  - **Transiciones:** noche→día por fade de luz en ~1.5 s, o con time-lapse y reloj.

**Paleta por reel.** Los tres primeros son (med.) de fotogramas. Los demás son (inf.) por descripción.

| Reel | Hex clave |
|---|---|
| Dd2Y noche | fondo #121832→#1E2A4C, cabecera de madera #5C4526, sábana #5E6F94, camisa roja #C8452A con trama #E9A76A, piel bajo celular #B9A3C0 |
| Dd2Y día | papel rayado #3A4166/#2B3157, piso #9A6A3C, reloj LED #E5322B, colcha #D8553F, jeans #2F6290, zapatillas #2F6FD0 |
| DeDh (otoño) | cielo #C8A0C0→#9A5A90, follaje #E8541E/#F08C2A/#B63424, hojarasca #8E5530, tocón #7A6658, frasco #EEDFB0 |
| DenX | libreta: papel #C3CCE6, renglón #5E86C6, espiral #F0A32E, fondo adoquín #9A7A66. Plaza (inf.): árboles #C42E1E/#F0B428, noche #14122E, farol #FFD27A |
| Dd-H | cortinas #6B6580, escritorio #8A5A32, manta #B83030, notas #F4D84A/#F08AB0/#7AB8E8, noche #101838 |
| DeIZ | paneles #8E5C30, cómoda #B8382A, cortinas #2D49A0, LED #F03A30, exterior cielo #5C9AD8 y árbol #E27B28 |
| Dd5E | pared #5C5C7C, rayos #F6E24A/#FFFFFF sobre #0F1F4C, puerta #8A5530, luz de puerta #FFFFFF |
| DeqI | asfalto #5E5E68, casas #E8B440/#DA6E5C/#6CA2CA, ladrillo #A9522F, toldo #3C8C5C, hidrante #2A5AD0, sudadera #F2C428 |

**Colores fijos de personajes:**
- Camisa a cuadros roja #D4482C con trama #E8A070, jeans #2F6290, zapatillas azules #2F6FD0 con puntera blanca.
- Gnomo: gorro #D93A28, jersey #3D9B3C, barba #D9D6CF, cinturón #6B4426 con hebilla #E8C030, pantalón #3C6EA8, botas #5A3A22.

## 4. Cámara

- **Lentes.** Cámara de three.js con FOV vertical de partida (calibrar contra los fotogramas):
  - normal ≈ 65°
  - angular ≈ 90° (picados oblicuos, planos a ras de suelo)
  - tele ≈ 40° (PP de cara con fondo comprimido)
- **Alturas:**
  - **Ojos de pie:** ~1.5 m.
  - **Colchón:** ~0.5 m, para PG de la cama con la manta en primer plano.
  - **A ras de gnomo:** ~0.45 m, contrapicado leve para el mentor.
  - **A ras de suelo:** ~0.15 m.
  - **Cenital:** 1.5–2 m mirando a 70–90° hacia abajo, para inserts de objetos.
  - **Picado oblicuo:** a 45° desde el costado de la cama, para el personaje acostado.
- **Movimientos típicos:**
  - **Dolly in lento:** +10–35 % de escala en 3–8 s con easing. Es el movimiento por defecto de los PP.
  - **Deriva handheld:** ±0.3° de roll, 0.5 cm de amplitud, ~0.4 Hz. En acostado y en dos-shots.
  - **Paneo lento:** 5–10°/s, para seguir una caminata o revelar al gnomo.
  - **Plano fijo:** para silencios y gags.
  - **Dolly out o crane up lento:** para cerrar o entrar a una elipsis.
  - **Órbita con jump cuts** (DenX, 3 saltos de ~30° en 0.1 s cada uno): solo para una frase de transición ("Here's the rest of your day").
  - Los planos largos (hasta 13.6 s) llevan casi nada de movimiento.
- **Ritmo de corte:** se corta al cambiar de línea de diálogo. Los silencios se cubren con inserts o con cámara quieta.
- **Transiciones:**
  - Fade de luz de 1.5 s.
  - Disolvencia de 0.5–1 s.
  - Flash blanco de 2 fotogramas, solo si hay un golpe de efecto.
  - Fade a negro final de 0.8–1.5 s.
- **Patrones recurrentes:**
  1. **Contraplano chico/gnomo:** PM del protagonista contra PM del gnomo en contrapicado leve, alternando con cada línea. El dos-shot queda para la apertura y la demostración.
  2. **Inserts:** reloj digital (la hora marca el paso del tiempo), celular o chat, nota o libreta, frasco, zapatillas. Duran 0.7–1.5 s y llevan el efecto sonoro.
  3. **Cenital** de objetos caídos o en el suelo.
  4. **Plano de espaldas** del protagonista caminando hacia la luz o la puerta.
  5. **Plano final del gnomo,** o del protagonista con el gnomo, o un bucle.
  6. **Elipsis:** relojes, cambio de luz, 8–12 s sin voz.

## 5. Personajes

**Protagonista.** Persona joven con anteojos redondos negros, pelo negro desordenado, camisa a cuadros roja con mangas abullonadas y botones blancos, jeans y zapatillas azules con puntera blanca.
- **Actuación:** poca energía, cansancio, resignación. Mira hacia abajo, se encorva, apoya la cabeza en la mano. Casi no gesticula. Solo "enseña" con las manos en el ensayo.
- **Expresiones (por textura):** ojos medio cerrados, ojos hacia abajo, mirada de reojo, media sonrisa resignada o tímida, sorpresa, alivio.
- **Animaciones recurrentes:**
  - acostada con celular
  - mano en la mejilla
  - sentarse en el borde de la cama
  - incorporarse
  - cabeza gacha
  - manos en las rodillas (encorvado)
  - caminar de espaldas
  - girar la cabeza hacia el gnomo
  - facepalm
  - inclinarse hacia el gnomo
  - abrir puerta
  - dormir

**Mentor: gnomo Pip.** Mide ~0.45–0.55 de la altura del protagonista.
- **Diseño:**
  - gorro cónico rojo
  - barba blanca larga
  - jersey verde
  - cinturón marrón con hebilla amarilla
  - pantalón azul
  - botas marrones
  - proporciones chibi, cabeza grande
- **Actuación:**
  - **Deadpan.** Ojos entrecerrados como estado base, ceño bajo, muy quieto.
  - No sube nunca la energía.
  - Trata cada pregunta como auditoría y cada remate como cortesía.
  - Gestos mínimos: giro de cabeza, brazo en alto para señalar, mano al mentón, brazos cruzados.
  - Se calienta solo en la línea amable final, con ojos cerrados y sonrisa.
  - Se acuesta boca arriba o hace pucheros sentado cuando el protagonista lo desborda.
- **Rol narrativo:**
  - No regaña.
  - Hace el truco concreto y diminuto.
  - Valida con "It counts."
  - Cierra con una frase citable.
- Un puff gris sobre la cabeza hace de suspiro.

## 6. Sonido

**Música.**
- Pista suave sin pulso marcado, **~92 BPM** (medido en Dd2Y).
- Cambia **por secciones**. Los tiempos son propuesta (inf.):
  1. **0–22 s:** chiptune suave y glockenspiel.
  2. **22–55 s:** beat lo-fi con marimba y pizzicato.
  3. **55–cierre:** lo-fi cálido con guitarra acústica.
- La música **se corta** (caídas a -37/-44 LUFS de 0.3–2.2 s) justo antes del remate cómico y entra de nuevo con el pop.
- **Excepción a la regla Mechayuki** de "NO chiptune puro": el chiptune es solo el color de la primera sección, no la pista entera.
- Se hace en código: nuevo `audio/scripts/music_upnext.py`, con 3 secciones y cortes parametrizables.

**SFX (Dd2Y):**

| Efecto | Dónde |
|---|---|
| Pops tipo burbuja o notificación en remates | 11.0, 20.1 y 22.6 s |
| Riser o whoosh en transiciones | 8.3 y 28.8 s |
| Hojas | en las escenas de otoño |
| Notas sueltas de glockenspiel | entre líneas |

- Se agregan los sonidos de cada acción: papel, sello, tic-tac, teclado, puerta, hojas.
- Todo CC0 o CC-BY, elegido y verificado con earshot. Los CC-BY van a la descripción.

**Voces: 2, ambas VoiceStudio:**

| Voz | Para | Timbre y carácter |
|---|---|---|
| **megagirl** (clon `baab32b2`) | Protagonista | Joven, cansada, resignada, sincera. Más conversacional que la narradora del canal. |
| **Pip** (clon masculino nuevo, ID por registrar) | Gnomo | Madura, grave, seca, plana y sarcástica. Calidez solo en la línea final. Distinta de megagirl: validar con `speaker_sim.py` que la similitud con megagirl sea baja. Nunca la voz del creador original. |

**Ritmo de habla (tabla):**
- Dd2Y tiene ~70 palabras en 72.7 s, es decir ~1.0 palabra/s global y ~2.1 w/s hablando.
- DeDh tiene ~100 palabras en 74.7 s, ~1.35 w/s.
- Hay voz en solo ~45 % del tiempo (Dd2Y). Mechayuki va a 2.7 w/s y ~200 palabras.
- Objetivo: **70–100 palabras por reel**.
- Pausas internas de 0.8–1.7 s ("Tomorrow… [1.7 s] your feet hit these first.").
- Silencios de remate de 1–3.4 s. Elipsis mudas de 8–12 s.
- Respuestas de una palabra ("No.", "Rude.").
- Conservan de Mechayuki:
  - Las preguntas suben de tono, +2–3 semitonos en la última palabra, aunque el gnomo sea deadpan. La energía queda plana, la entonación no.
  - Nunca "!". Se usa "…" o ".".
  - Nunca se corta la voz dentro de una palabra.

**Loudness:**
- Master **-14 LUFS** integrado, pico ≤ -1 dBTP (≈ -1.2), LRA 6–8. Dd2Y mide -14.1 LUFS, -1.2 dBTP y LRA 7.4; DeDh mide -14.1 LUFS y LRA 6.0.
- No se usa el -12 de Mechayuki.
- Voz ~14 dB sobre la música mientras habla (regla de la guía; no medida en el original).
- Cadena limpia de voz: filtro de graves ~170 Hz + compresión suave + normalización. Sin filtro retro.

## 7. Estructura recurrente (72–78 s)

Plantilla derivada de Dd2Y (referencia del reel de 342K) y verificada sobre DeDh. Los tiempos son de la referencia.

| # | Beat | t (s) | Contenido | Sonido |
|---|---|---|---|---|
| 1 | Declaración | 0–4 | El protagonista afirma un plan grande y comprobable ("Starting tomorrow, I get up at four."). Subtítulo en ~1.5 s. | Música de sección 1. |
| 2 | Réplica deadpan | 4–7 | El gnomo ya está en cuadro y dice algo mínimo ("It's four."). | Pop. |
| 3 | Escalada | 6–22 | 2–3 rondas de excusa o pregunta, líneas de 1–3 palabras ("No." / "…Tomorrow."). Se enumera el plan. | Silencios de 1–3 s. |
| 4 | Punto bajo | 18–23 | Admite la carencia ("I just… don't want it enough."). 2–4 s de silencio y cabeza gacha. | Música cortada. |
| 5 | Giro | 22–25 | Una línea del mentor ("Then we cheat."). | Pop, whoosh o riser. |
| 6 | Mecanismo | 25–45 | Demostración con 1–2 props de un truco diminuto (zapatillas al pie de la cama, celular lejos). "That's the cheat?" "It's called a nudge." | Sección 2. |
| 7 | Elipsis | 43–55 | 8–12 s sin voz: noche, relojes, amanecer. | Lo-fi continúa. |
| 8 | Prueba | 55–60 | "…Does this count?" / "Yeah, it counts." | Pop. |
| 9 | Salida | 59–64 | El protagonista sale de espaldas hacia la luz, 4–5 s sin voz. | Sección 3. |
| 10 | Remate | 64–73 | Frase del mentor con autocorrección ("Winners are up at four." / "No." / "Better than yesterday is enough."). Cola de ≤ 1.5 s, fade o bucle. | Corte de música antes de la última frase. |

La frase final es el mensaje y también el pie del post. DeDh la cierra en bucle: repite "Last ninety days." / "…In what?" / "Gary.".

## 8. Pie del post

Plantilla observada en 6 de 7 pies:

```
[Línea 1: frase citable o pregunta, ≤ 12 palabras, sin "!"]
[Línea 2 opcional: la moraleja en una oración]
What's your UpNext? 🍂   (emoji según la estación del set)
Inspired by: [Autor(es), año. Título corto del paper o libro]
#selfimprovement #habits #mechayuki #shorts
```

- El CTA "What's your UpNext?" aparece en 4 de los 7 pies originales (en DeDh como "What is your UpNext🍂"). En DenX y DeqI no.
- Pies de referencia: "Better than yesterday. What's your UpNext?" (342K) y "What's your 'one sock' challenge? Let's find your UpNext." (33K).
- **Citas (verificar antes de publicar; la guía exige fuentes):**
  - DenX: Breines & Chen (2012), *Self-compassion increases self-improvement motivation*.
  - DeIZ: Pronin, Olivola & Kennedy (2008) y Ersner-Hershfield, Wimmer & Knutson (2009).
  - DeqI: Liu, Rim, Min & Min (2022), sobre el gusto de que te escriban primero.
  - Dd5E: Carney, Cuddy & Yap (2010). Réplica: Ranehill et al. (2015). El "five times the people" parece apuntar a esta réplica (inf.).
  - Dd2Y: Thaler & Sunstein, *Nudge* (propuesta, no citada en el original).
  - Dd-H: Fogg, *Tiny Habits* (propuesta).
  - DeDh: sin cita en el original.
- Nombre de archivo = título sin `? : " /`. El caption va en un `.txt` al lado.

## 9. Qué cambia respecto del estilo Mechayuki actual

1. **Narración monólogo → diálogo** de 2 personajes con 2 voces, sin narradora en off.
2. **Operator fuera:** sin "Operator…", sin `megagirl_operator.wav`, sin "Artifact understood. Logging off." y sin el outro "MECHAYUKI · ARTIFACT 00N". La marca va solo en el pie.
3. **Letras 3D amarillas extruidas fuera.** Los rótulos pasan a notas adhesivas, libretas y pantallas diegéticas con fuente pixel. La portada A1 pierde las letras 3D y las reemplaza por texto pixel con contorno. **Decisión abierta a confirmar con el usuario.**
4. **Subtítulo de 1 palabra con pop-in → frase de 1–8 palabras** con máquina de escribir, 2 colores por hablante, en y ≈ 1325 y tracking apretado.
5. **Música:** de 105–112 BPM con bajo y batería a ~92 BPM sin pulso, en 3 secciones, con cortes de silencio cómico y master de -14 LUFS en vez de -12.
6. **Escenarios:** de prados MML2 de cielo enorme y dominante verde a **interiores** (dormitorio recurrente, escritorio, puerta) y **estaciones** (parque otoñal, plaza de fuente, calle con árboles naranjas). Domina el otoño o la noche. Se abandona la regla de "que domine el verde".
7. **Estructura:** de artefacto (apertura, gancho de asco, cadena "If you… you have a…", comentario de Operator, personaje histórico y año, cierre) a **parábola de hábito en 10 beats** (sección 7).
8. **Ritmo verbal:** de ~200 palabras y 2.7 w/s a 70–100 palabras y ~1.0–1.35 w/s, con 55 % de silencio y elipsis mudas de 8–12 s.
9. **Gancho:** de absurdo o asco en pregunta a **promesa o declaración del protagonista** con réplica deadpan en ≤ 4–7 s.
10. **Reglas de variedad de lugar:** "principio y final nunca en el mismo lugar" se rompe a propósito en los finales en bucle (DeDh).
11. **Cámara:** más inserts, cenitales y contraplano. Se admiten jump cuts de efecto (órbita de 0.1 s). Se sigue evitando el salto hacia atrás dentro de un plano.
12. **Post:** nuevos viñeta oscura, grano animado, scanlines, aberración cromática, bloom leve y marco negro redondeado.
13. **Caption:** de título viral + hashtags de historia (`#history`) a pregunta + "What's your UpNext?" + "Inspired by".
14. **Gnomo:** personaje nuevo. Se usa un NPC anciano MML2 recoloreado con accesorios, no un modelo desde cero.

**Se mantiene:**
- Modelo Mechayuki (Zero Volnutt feminizado) y motor three.js PS1 con Playwright headless.
- **Reglas de contacto y manos:** las manos no atraviesan objetos, todo está apoyado, nada flota, nada cortado por el borde.
  - Celulares, libretas, frascos, notas y zapatillas se sujetan a huesos con agarre real.
  - Nada plano: las notas, pantallas y chats son objetos 3D con espesor (~2 cm), apoyados.
- Ojos abiertos en los planos clave (el gnomo, entrecerrados por diseño) y expresiones que coinciden con la línea.
- **Sin "!" en TTS** ("POWER!!!!" e "I wasn't done!" pasan a "." o "…"). Nunca se corta la voz dentro de una palabra ni la última palabra de una pregunta.
- Voz megagirl con cadena limpia, y revisión de cada toma con Whisper contra el guion y `speaker_sim.py`.
- Sombreros PS1 pegados al hueso de la cabeza.
- Sin z-fighting en pasto y hojas.
- **Flujo:** proponer, guion con humanizer y fechas verificadas, storyboard + style frames, **MOSTRAR Y ESPERAR APROBACIÓN**, voz, render, una sola pasada de revisión propia, entrega.
  - `revisar_render.py --estilo mechayuki` marcaría el subtítulo de frases y la ausencia de letras 3D como fallos. Hay que crear un perfil `--estilo upnext` o hacer la revisión a mano.
  - Entrega en LucidLink, `Renders finales claude/UpNext/<Título>.mp4` (CRF 24, AAC 192k, +faststart). Sin Telegram. Se borran los renders superados.

## 10. Casting propuesto global

| Rol | Asset | Notas |
|---|---|---|
| **Protagonista (serie completa)** | **Mechayuki**, vestida de civil: camisa a cuadros roja, jeans, zapatillas azules con puntera blanca y anteojos redondos modelados en código. | Ya tiene idle, caminar, sentarse, pensar y manos a la cara. Concentra el 80 % de las animaciones. Se pasa el guion a "she/her" (las líneas son neutras). Voz **megagirl**. |
| **Mentor (serie completa)** | **Gnomo Pip:** NPC anciano MML2 recoloreado, escala 0.45–0.55 (cabeza ×1.3), gorro cónico rojo y barba blanca modelados en código y pegados a huesos. | Nombre **único** para toda la serie: los paráfrasis traían Pip (Dd2Y), Fern (DeIZ) y Moss (DeqI, rana de piedra). Todo pasa a Pip. **Puerta de calidad:** render de prueba del gnomo antes del storyboard, porque un modelo a medida salió mal con Enrique VIII. Voz **Pip** (clon masculino grave y seco). |
| **Secundario masculino (puntual)** | **Humano zawdog masculino.** | Solo para Theo en DeqI. Como esa voz es una **tercera voz**, es un costo extra. También es el plan B de protagonista masculino, no recomendado porque rompe la continuidad de marca. |
| **Extras y relleno** | **NPC MML2** recoloreados. | Peatones, estatuas de querubines (grises, mate) en DenX, niños. |
| **Perro** | No se usa. | Ninguno de los 7 reels lo necesita. |

**Las 2 voces VoiceStudio:**
1. **megagirl** (protagonista).
2. **Pip** (gnomo, grave y seca).

**Kit compartido que se construye una vez (en Dd2Y):**
- dormitorio de noche y de día
- reloj LED con textura de canvas
- celular
- manta y colcha rojas
- CRT beige
- escritorio
- notas adhesivas con CanvasTexture y fuente pixel
- puerta
- el gnomo

## Orden de remake

Criterio: rendimiento (likes) antes que facilidad, con la condición de que el primero sea factible. El kit se construye en el #1 y se reutiliza en los siguientes.

| # | Reel | Likes | Planos | Sets nuevos | Props nuevos | Personajes y animaciones nuevas | Riesgo |
|---|---|---|---|---|---|---|---|
| 1 | Dd2Y | 341.903 | 21 | Dormitorio (reutiliza el de expedition-01), más escritorio y puerta | Reloj LED, celular, manta/colcha, CRT, 3 notas, alfombra, puerta, puff | Gnomo (acostarse, levantarse, pucheros, girar), protagonista acostada con celular, mano a mejilla, sentarse, caminar | Medio |
| 2 | DeDh | 122.772 | 33 (~8 encuadres) | Parque otoñal (base de prado MML2) | Guitarra, libro, esterilla, zapatillas, frasco, tocón, banco, farol, hojas, pila de hojas | Desplome, caída boca arriba, alzar el frasco, carga de props a huesos | Medio |
| 3 | DenX | 47.687 | 35 (~28 distintos) | Plaza con fuente, chorros, faroles, noche | Libreta con textura de canvas, lápiz, estatuas, paloma | Encorvada, salto del gnomo, escribir y pasar hoja, facepalm | Medio |
| 4 | Dd-H | 33.199 | 53 (~6 encuadres alternados) | Dormitorio (reutilizado de #1) | ≥12 pequeños: notas, zapato, cesto, papelera, latas, caja, sello | Agacharse a recoger, hacer la cama, abrazar rodillas, sellar | Medio-alto |
| 5 | DeIZ | 10.103 | 23 | Dormitorio con ventana otoñal, pasillo | 6 notas, reloj 10:40, taza con vapor | Pocas: beber, mirar por la ventana, abrir puerta | Bajo |
| 6 | Dd5E | 5.211 | 32 (~5 encuadres) | Dormitorio y escritorio (reutilizados) | Rayos pixelados, nota con marcas de conteo, puerta con luz | Power pose, gesticular | Medio |
| 7 | DeqI | 3.592 | 29 | 3 locaciones: esquina en pendiente, mercado, calle | 2 UIs de celular, vehículos, toldo, hidrante | Salto horizontal del gnomo, tipear, 3.er personaje | Alto |

**1. Dd2Y (342K): primero.**
- Concentra el 60,6 % de todos los likes de la serie. Es la fórmula "ganadora" y la referencia del estilo.
- Es factible: 21 planos, un set principal que ya existe y casi todo en cámara fija.
- Construye el kit compartido: gnomo, dormitorio día/noche, reloj, celular, notas, puerta.
- **Riesgo:** los planos 1–3, un personaje acostado visto desde arriba con roll sutil, y la mano con el celular. Mitigación: pose estática y mover la cámara, sin animar el cuerpo.
- Puerta del gnomo: render de prueba antes del storyboard.

**2. DeDh (123K): segundo.**
- Es el segundo en rendimiento (2,6× el tercero) y el set de otoño coincide con la paleta MML2, con árboles y cielo ya hechos.
- Solo hay ~8 configuraciones de cámara.
- **Riesgo:** el estado de 5 props (cargados, caídos, enterrados) exige una máquina de continuidad por plano. Pausas de 3,9, 2,8 y 2,4 s sincronizadas a ~0,1 s.
- **Gancho vencido:** la paráfrasis lleva "Ninety days left" (al 15-nov quedan 46 días). Cambiar a "six weeks left" en las dos líneas, tanto en el gancho como en el cierre en bucle.

**3. DenX (48K): tercero.**
- Rendimiento medio-alto con trabajo de modelado importante (plaza, fuente, chorros, noche).
- **Riesgo:** 85,1 s supera el tope de 80 s. Recortar el time-lapse mudo de 8,7 s a ~3 s y la cola.
- Los jump cuts de 0,1 s de la órbita son delicados. El gnomo con la libreta exige contacto limpio de manos.

**4. Dd-H (33K): cuarto.**
- Reutiliza el dormitorio ya construido y casi todo el kit. Los ~6 encuadres se alternan en ping-pong.
- **Riesgo:** 53 planos, muchos props chicos con estado, líneas de una palabra con timing apretado. Más montaje que animación.
- Alternar con un set distinto antes de repetir dormitorio.

**5. DeIZ (10K): quinto.**
- Dificultad baja y casi 2× los likes de Dd5E.
- **Riesgo narrativo:** el gancho es un acertijo y la premisa tarda ~28 s en aclararse. Reescribir el comienzo para que el protagonista diga "Tomorrow me will do it" antes del minuto. Mantener el gnomo sin explicar estudios.
- Evitar el silencio final de 3,1 s.

**6. Dd5E (5,2K): sexto.**
- Reutiliza dormitorio, escritorio, puerta y notas. Es fácil de producir.
- **Riesgo:** el gancho original es un grito ("POWER!!!!") y no se puede con TTS sin "!". Además hay una toma fija de ~12 s y el gnomo explica un estudio.
- Si se hace, reescribir el gancho.

**7. DeqI (3,6K): último.**
- Último en rendimiento y el más caro: 3 locaciones, 2 UIs de celular, vehículos y una escena de salto horizontal.
- **Riesgo:** exige una **tercera voz** (Theo, masculina joven), fuera de las 2 voces de la serie.
- Cierra con 4,2 s de silencio sin frase citable.

**Recomendación:** producir 1–4 y revisar el desempeño antes de gastar créditos en 5–7. Los tres últimos conviene rehacerlos con un gancho nuevo, no como copia.
