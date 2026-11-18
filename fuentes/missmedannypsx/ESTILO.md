```markdown
---
type: spec
status: draft
tags: [missmedannypsx, ps1, low-poly, rom-com, camarera, dialogo, subtitulos, crt, shorts, remake]
---

# ESTILO @missmedannypsx: especificación de remake con nuestra camarera + pretendiente

Base: 8 videos de la cuenta (7 episodios/autoconclusivos + 1 tráiler), con análisis por fotogramas a 1 fps (~432x768, reescalado ×2.5 a 1080x1920), transcripción Whisper, tablas de planos y de animaciones. **No hubo acceso al audio.** Snapshot 2026-11-15.

**Cuenta de referencia:** "Arinna ♡ Miss Me, Danny?", 14.9K seguidores, rom-com PS1 por episodios. Publica lun/mié/vie/dom a las 10 am ET (obs.). Tiene Patreon con episodios anticipados.

**Confianza de cada dato:**
- **(obs.)**: observado en fotogramas, tablas de planos o transcripción. Los px de 1080x1920 salen de reescalar la medición a ojo, con ±10 %.
- **(inf.)**: inferido, sin medición directa. Incluye todo el sonido y las decisiones propias de remake, que van marcadas como "propuesta".

**Alcance: se replica el ESTILO, no el contenido.** No se copian la muletilla "Miss me, Danny?", los nombres Arinna/Danny/Gerald/Sapphira, ni los diálogos o gags. Nuestra serie tiene firma, nombres y guiones propios. Los nombres de los personajes quedan "por definir"; en el documento son **ELLA** (camarera) y **ÉL** (pretendiente).

---

## 1. Formato

| Video (últimos 4 dígitos) | Título en pantalla / caption | Fecha | Dur. (s) | Planos | s/plano | Vistas | Likes % |
|---|---|---|---|---|---|---|---|
| 6870 | "One cup of sugar" (autoconclusivo) | 08-nov | 66 | 24 (21 cortes + 3 sin detectar) | 2.75 | 363.5K | 9.8 |
| 5190 | Ep 4 "Something True" | 09-nov | 83 | 34 | 2.44 | 219.8K | 10.7 |
| 6198 | "The password was her idea" (autoconclusivo) | 12-nov | 71 | 27 | 2.63 | 197.4K | 9.5 |
| 1222 | Ep 2 "Special Delivery" | 07-nov | 73 | 32 | 2.28 | 131.4K | 4.0 |
| 8662 | Ep 1 "Wrong Door" | 06-nov | 82 | 43 | 1.91 | 119.2K | 6.1 |
| 9430 | Ep 7 "Blackout" | 15-nov | 68 | 34 | 2.00 | 113.9K | 12.5 |
| 0982 | Ep 5 "Laundry Day" | 11-nov | 72 | 29 | 2.48 | 73.7K | 11.7 |
| 9462 | Tráiler T1 "Across the Hall" | 04-nov | 65 | 29 filas (36 cortes) | 2.24 | 69.2K | 8.7 |
| **Total / media** | | | **580 s, media 72.5, mediana 71.5** | **252, media 31.5, mediana 30.5** | **media ponderada 2.30; mediana 2.36** | 1.29M | |

Todos los datos de la tabla son (obs.), pero el conteo de planos es aproximado (±3). ffmpeg detectó menos cortes que los reales, así que se completó contando fotogramas (Ep 1: 30 detectados contra 43 reales; Ep 7: 16 contra 34).

- **Resolución y fps:** 1080x1920 (9:16) (obs.). Cámara y cuerpo se ven fluidos, a 24–30 fps. Las caras cambian por sprite-swap a ~8–12 Hz (obs.). Se renderiza a **30 fps** (inf.).
- **Duración objetivo:** 65–75 s (obs. 65–83 s, mediana 71.5). Los dos más largos (82–83 s) no rindieron mejor que los de 66–73 s (sin datos de retención). **Tope duro: 80 s** (propuesta, a confirmar según plataforma). Ep 4 (83 s) exige recorte.
- **Planos:** 24–34 es lo típico (obs.). Dos modos:
  - **Diálogo estándar:** 2.0–2.8 s/plano, con cortes por réplica (6 de 8 videos).
  - **Ráfaga de montaje:** solo en el tráiler, 8 planos de ~0.46 s (46.6–49.9 s). No se usa en episodios.
- **Reglas del remake (inf.):**
  - 24–34 planos, media 2.0–2.8 s.
  - PP de diálogo de 1.5–3 s. Generales de 4–5 s, que son donde ocurre la acción física. Inserts de objeto o UI de 0.5–2.5 s.
  - Ningún plano de acción dura menos de 0.7 s. La ráfaga de 0.46 s es un recurso de tráiler.
- **Calendario original (obs.):** 4 publicaciones por semana, a las 10 am ET. El tráiler se publicó 2 días antes del estreno, con fecha y hora de estreno en pantalla. Nuestra cadencia se define aparte.
- **Marco o máscara:** no se reporta ninguno (inf.). El cuadro va a sangre completa, sin borde negro.
- **Dos formas de episodio (obs.):**
  - Los 3 más vistos son piezas cerradas de una idea: 6870, 6198 y 5190 suman 780.7K vistas (60.6 % del total).
  - Los que llevan "Ep N" son los de arco serial.

---

## 2. Texto, subtítulos y cajas de diálogo

**Función:** el texto es subtítulo literal de la voz, no diálogo de videojuego. No hay caja ni nombre de hablante. El color identifica quién habla, y el video se entiende en mute (obs.).

| Parámetro | Valor | Conf. |
|---|---|---|
| Fuente original | Bitmap pixel, MAYÚSCULAS, bold (tipo Pixel Operator / m5x7) | obs. |
| **Equivalente libre** | **Pixelify Sans Bold (700)** (OFL). Alternativas: Silkscreen, Jersey 10. Si el diálogo va en español, verificar que tenga ¿ ¡ Ñ | inf. |
| Tamaño | Altura de mayúscula 3.5–4 % del alto = **67–77 px**. Punto de partida: **~100 px** de font-size, calibrar contra los fotogramas | obs. + inf. |
| Tracking | 0 (inf.), sin espaciado extra | inf. |
| Ancho | Chunks de 35–75 % del ancho. Tope **810 px (75 %)** | obs. |
| Posición | Centrado horizontal. **Línea 1 centrada en y ≈ 1275 px (66 % de 1920)**, fija en TODOS los planos, incluso sobre inserts. Una 2.ª línea va a +105 px | obs. |
| Color base | **#FFFFFF** | obs. |
| **Color de la palabra clave por hablante** | **ELLA = rosa #F06EA0** · **ÉL = cian #6FE0E8**. Solo se tiñe la palabra clave o la última de la frase (ej.: "SWEET.", "DANNY?", "SUGAR?", "ALONE."). Los rosas medidos varían entre #F06EA0 y #FF9DC8; los cianes, entre #6FE0E8 y #7FE0F0. Se unifica en el primero de cada rango | obs. + decisión |
| Tercer hablante (cameo) | Azul #4A90E2 (Sapphira en el tráiler) | obs. |
| Contorno | Negro #0A0A10, **~5 px totales** (1–2 px a 768 ×2.5) | obs. (escalado) |
| Sombra | Dura (4, 4) px, sin blur | obs. |
| Caja de fondo | **Ninguna** en subtítulos | obs. |
| Aparición | **Corte seco** del chunk, sin typewriter ni fundido. Un chunk de **1–3 palabras (máx. 4) cada ~1 s**, sincronizado con la voz. Un ligero eco o desplazamiento ocasional en el pop (Ep 4, 5.5 s) es opcional | obs. |
| Persistencia | El chunk puede cruzar un corte de plano | obs. |
| Puntuación | Se permiten `!`, `?!`, `…` y `.`. Los puntos suspensivos se muestran literales y se usan para dudas ("…WAIT.", "…WAS I?") | obs. |

**Chunking (inf., derivado de las transcripciones):**
- Una réplica de 6–10 palabras se parte en 3–4 chunks con ritmo hablado. Ejemplo: "YOU STILL OWE ME / SOMETHING TRUE." Eso da ~1.5–2.5 palabras/s mientras hay voz.
- Se repiten chunks a propósito para el eco cómico ("ALONE." / "NORMAL ALONE." / "ALONE.").
- Si habla ella, la palabra final va en rosa. Si habla él, en cian. En una línea con eco, cada voz tiñe su palabra.

**Elementos de texto no-subtítulo (obs.):**

| Elemento | Especificación | Conf. |
|---|---|---|
| **Tarjeta de título de episodio** | Arriba, en y ≈ 17–22 % (**326–422 px**). "EPISODE N" en rosa, pequeño (~×0.7). Debajo, el título en blanco, ×1.3 (~130 px) con contorno más grueso (~8 px). Aparece a ~3.5 s, dura ~3 s (hasta 6.5 s) y se disuelve con un leve glitch | obs. |
| Título de autoconclusivo | Igual, desde 0 s. 2 líneas, con la 1.ª palabra clave en rosa y el resto en blanco ("ONE CUP / OF SUGAR") | obs. |
| **Etiqueta flotante de videojuego** | Nombre en rosa + subtítulo blanco debajo, centrado arriba (y≈375). Solo en el 1.er plano (≈0.7 s). Ejemplo: "GERALD / 5G" sobre un objeto. | obs. |
| Nameplate "YOU" | Blanco sobre caja translúcida oscura, sobre el cuerpo de ella. Una sola vez, ~1.5 s | obs. |
| Nombre de hablante (tráiler) | Solo la 1.ª vez que habla cada uno: ~6 % de la altura, en el color del personaje, estilo "goteante". No va en episodios | obs. |
| Narración rosa (tráiler) | Frases tipo "SHE TEASES." / "HE PANICS.", todo en rosa y arriba (y≈17 %). Conviven con el subtítulo inferior | obs. |
| **UI diegética de móvil** | Tarjeta #14171F con borde #5E7488. Texto sans-serif blanco. Línea resaltada en rosa #FF8FB1. Check verde #3DEB8A. El subtítulo se superpone encima de la UI. Estilo chat: tarjeta #2A1F55, burbuja blanca, botón X rosa, hora | obs. |
| End card (solo tráiler) | 5.5 s estáticos, con título, temporada, fecha de estreno, cadencia y "link on my profile" | obs. |

**Cuándo NO hay subtítulo (obs.):** la cola final sin diálogo (1–3 s), los silencios dramáticos, los cambios de luz mudos y los planos de caminata. Hay desfases entre voz y texto de ~0.3–1 s (Ep 3: "Oh, and Danny?" en 61 s mientras el texto solo mostraba "AND"). El remake sincroniza el chunk a ≤0.1 s de la voz.

**Composición (obs.):** el subtítulo cae en barbilla, pecho o torso. Se compone con ojos y boca por encima de y ≈ 1180 px, para que el texto no tape la expresión.

---

## 3. Imagen

**Look base: low poly PS1 con acabado moderno (obs.).** Se combinan polígonos facetados y texturas pequeñas con filtro nearest, con scanlines, bloom y profundidad de campo en primeros planos.

- **Resolución interna:** 240–320 px de ancho, reescalada con vecino más cercano (obs.; estimaciones entre 216×384 y 320×480, la más común ~270×480). **Punto de partida: 270×480 reescalado ×4 (nearest) a 1080×1920** (inf.). Los subtítulos y overlays se dibujan a 1080×1920 después del upscale, nítidos.
- **Modelos (obs.):**
  - Polígonos mínimos, cabezas casi cúbicas, pelo en bloques planos con facetas visibles y bordes escalonados.
  - Cuellos largos y finos, hombros estrechos y manos blancas tipo guante.
  - A veces hay wobble de vértices y recortes de geometría.
- **Texturas (obs.):** 32–64 px por superficie, con bloques visibles en ropa, puertas, cajas y alfombra. Hay dithering y banding en las sombras.
- **Caras (obs.):** son **decals 2D sobre la cabeza 3D**. Tienen contorno negro grueso, ojos grandes con pestañas dibujadas, y rubor como puntos sueltos o rayitas rosas. No hay sincronía labial: la boca alterna entre 2–4 formas fijas, y los ojos y la boca cambian por swap de textura a ~8–12 Hz.
- **Post-proceso (obs. cualitativo; valores numéricos de partida = inf.):**

| Efecto | Valor de partida | Conf. |
|---|---|---|
| Scanlines CRT | 3 px de período, 6–10 % de opacidad | obs. (sutiles) + inf. |
| Grano | Ruido de luma ±6/255, 1.5–2 px, animado a 30 fps | obs. (ligero) + inf. |
| Viñeta | Suave y elíptica. Fuerte en escenas oscuras (apagón), con −45 % en esquinas | obs. + inf. |
| Bloom | Umbral 0.85, fuerza 0.15, en lámparas, guirnaldas, velas y reflejos | obs. + inf. |
| Aberración cromática / RGB split | R +2 px / B −2 px en bordes; en transiciones y glitches sube a ±6–10 px | obs. + inf. |
| **Profundidad de campo** | Solo en PP de personaje, con blur de fondo de 6–10 px. Los generales son nítidos. Es anacrónica respecto al PS1 real y deliberada | obs. |
| **Transición de mosaico (pixelado)** | Entra con bloques gruesos y se afina hasta nítido, en 0.5–1.0 s. Escalones de 64→32→16→8→1 px | obs. + inf. |
| Glitch VHS / RGB | Desplazamiento de líneas + separación RGB, 0.3–0.5 s (Ep 1, 6.5 s; Ep 5, 39.5 s) | obs. |

**Paleta de los originales (obs.):** la regla es interior cálido y pasillo frío. Ella en rojo y él en teal, que son complementarios.

| Video | Hex clave |
|---|---|
| 6870 (azúcar) | pared beige #C9B08C, suelo #6B3F2A, alfombra #A3262A con franja #D9902F, cocina salvia #3E5B4C, pasillo menta #8FA58E |
| 5190 (ascensor) | noche rosa/rojo #C86A6A / #8F4040 con haces diagonales; día: pasillo #8A9275, puerta #9AA5A8 |
| 6198 (wifi) | paredes #8FA07A, zócalo #2F5B4A, alfombra #8E1F2A con rombos #D9B84A / #2B4F8A, puerta #6B3A22 |
| 1222 / 8662 / 9462 | interior ámbar con cortinas rojas, pasillo verde salvia #9AA68A, friso #2F5E4E, póster synthwave violeta/naranja |
| 9430 (apagón) | pasillo #2A2F2B, madera #4A2C1E, vela #FFD9A0, exit neón #3CE6A0, luz restaurada #B7B58A |
| 0982 (lavandería) | concreto #BDB8AA, zócalo #2F5C58 con franja #D9B94A, ropa rosa #F2A0BE, accidente rojo #EE3550 |

**Nuestra paleta de personajes (propuesta, inf.):**
- **ELLA**
  - corsé negro #15151C
  - mangas abullonadas blancas #F4F0E8
  - shorts azul marino #1B2A4A (variante jeans #34609A)
  - botines marrones #6B3A22
- **ÉL** (distinto de Danny): jersey verde musgo #5B7A3A sobre camisa crema #E8E0C8, pantalón oscuro #1A2030. **Decisión abierta.**
- **Principio de contraste (obs.):** personajes fríos o neutros sobre decorados cálidos para que la silueta lea. El negro, el blanco y el azul marino de ella destacan sobre madera, ámbar y beige.

**Iluminación (obs.):**
- **Interior:** cálido y ámbar, con guirnaldas, lámparas y fluorescentes verdosos de relleno. Haz diagonal tipo "cookie" sobre la pared en los PP.
- **Noche:** dominante azul-negra o rosa-roja, con luces prácticas naranjas y velas. En escenas de apagón el pasillo es oscuro, la cara se lee por la vela y el neón de EXIT da un acento verde.
- **Cambio noche→día:** fade de luz en ~1.5–2 s (Ep 4, 71–73 s), usado como giro narrativo.
- **Sombras:** suaves, con bloom. Su dureza queda a criterio del render.

**Motivos recurrentes (obs.), a reemplazar por motivos propios:**
- La puerta de salida con mancha roja (toque de horror suave).
- Los ojos huecos sin iris (Ep 7, 61.5 s).
- La cabeza "hueca" vista por detrás, con culling de caras traseras.
- El glitch de malla en el pelo (Ep 4, 74.5 s).
- Tuvimos que decidir si queremos un equivalente propio, que dé ganas de volver a ver el video.

---

## 4. Cámara

**Lentes (obs. en equivalentes 35 mm; FOV vertical de partida = inf.):**

| Lente | Equiv. | FOV vertical de partida | Uso |
|---|---|---|---|
| Gran angular | 24–28 mm | ~70° | PG con 2 personajes, contrapicados fuertes, PP de gancho ("gran angular suave", que alarga el cuello y agranda los ojos) |
| Normal | 35–50 mm | ~55° | PM, OTS, la mayoría del diálogo |
| Tele corto con DOF | 50 mm | ~40° | PP de contraplano con fondo desenfocado |

**Alturas y ángulos (obs.):**
- **Nivel de ojos:** el estándar en PP.
- **Contrapicado leve a marcado** sobre ELLA, que es más alta (~1.2× Danny→ propuesta mantener 1.15–1.25×). Da poder.
- **Picado leve** sobre ÉL en los mismos contraplanos.
- **Contrapicado fuerte desde el suelo** para el gag físico de él (brazo arriba buscando señal).
- **Cenital 45–90°** para PG de cabina o mesa y para inserts de objetos.
- **Altura de pecho** para OTS.
- **Dutch leve (~5°)** en 1–2 planos por video, para el momento pícaro de ella.

**Movimientos (obs.):**
- **Push-in lento** en los PP de diálogo (el movimiento por defecto).
- **Deriva mínima**, de ~0.5 cm.
- **Órbita lenta o 180°** alrededor de un personaje que camina o gira (ella rodeando la mesa).
- **Travelling hacia delante** siguiendo a quien camina de espaldas.
- **Dolly lateral** o paralaje en planos de entrada.
- **Estático** en insertos y en los gags de silencio.
- Rotación leve en POV de móvil.

**Ritmo (obs.):** se corta por réplica, alternando PP de ella y de él cada 2–3 s. Cada ~15–20 s hay un plano general de 4–5 s para ubicar la acción física.

**Transiciones (obs.):**

| Tipo | Duración | Uso |
|---|---|---|
| **Mosaico pixelado** | 0.5–1.0 s | tras el stinger/gancho (2.2–3.7 s), salto de lugar o tiempo a mitad de video (25 s, 37 s, 40 s), apertura de puerta (9.5 s) |
| Glitch RGB / VHS | 0.3–0.5 s | golpe cómico o salto de tiempo, 1 vez por video como máximo |
| Destellos de luz | 0.5 s | apagón/regreso de la luz |
| Fundido de luz | ~1.5–2 s | cambio noche→día |
| Fade a negro | 1–3 s | cierre (Password, Ep 7) |

**Patrones recurrentes (obs.):**
1. **Campo/contracampo** PP de ella / PP de él, alternado por réplica.
2. **Plano general** con los dos al ubicarse, al cambiar de espacio y para la acción física.
3. **Insert de objeto o UI** (0.5–2.5 s): tarro, caja con etiqueta, lámpara, lista de wifi, móvil, velas, calcetín, botonera. Las dos revelaciones del video suelen caer en un insert de UI.
4. **OTS** con el hombro desenfocado en primer plano.
5. **Plano de espaldas**, caminando, al inicio y al final. El plano de cierre puede rimar con el inicial (Ep 2, 2.5 s y 71 s).
6. **Plano de puerta/pasillo** al cerrar, con la cola silenciosa.
7. **Cierre con reacción**: él en PP, ojos de corazón / cara plana / "shock", o ella riendo con ojos cerrados.

---

## 5. Personajes

**Proporciones de la serie (obs.):** cabeza grande en PP, **cuello largo y fino**, hombros estrechos en él y marcados en ella, cintura estrecha, piernas largas y manos blancas tipo guante. Ella es claramente más alta que él (~1.2×) y domina la escena.

### ELLA: la camarera (diseño propio, inf.)
- **Diseño:** low poly con corsé negro, mangas abullonadas blancas y shorts azul marino o jeans.
  - Corsé con contorno marcado y cintura estrecha, mangas con volumen facetado y botones o puños simples.
  - Botines marrones. Accesorios de oficio: bandeja, libreta de comandas, jarra, tazas.
  - Pelo por definir; conviene que no sea negro puro, para que no se fusione con el corsé. Reflejo interior en color, como el granate bajo el pelo de la referencia (obs.).
- **Ojos y cara (obs. de la referencia):** ojos grandes con pestañas gruesas, iris de color, rubor de puntos o rayas rosas, y boca con atlas de formas (ver abajo).
- **Rol (obs.):** la que tiene el control. Pone condiciones, ironiza, marca reglas y rompe la tensión con una palabra seca ("Noticed.", "Shame."). Es deadpan, juguetona y "más gato que dragón" (obs. de la voz). Ríe con ojos cerrados cuando consigue lo que quería.
- **Actuación base:** peso en una cadera, brazos relajados con las palmas hacia afuera, cabeza ladeada, sonrisa de lado y balanceo mínimo.

### ÉL: el pretendiente (propuesta de diseño, inf.)
- Cuerpo largo y flaco, cuello muy fino, cabeza pequeña o grande según plano, gafas finas opcionales (obs. en la referencia; aquí es opcional). Vestuario propio: jersey verde musgo sobre camisa crema (ver paleta).
- **Rol (obs.):** el que reacciona. Es dulce, tímido, nervioso y sin filtro. Pierde cada discusión pero gana algo (se queda, se lleva un objeto). Aguanta las pullas sin ofenderse y acaba derretido.
- **Remates habituales (obs.):** pánico educado, mentira torpe ("it's for a friend"), vergüenza final ("Great first impression", "I'm just going to close all my tabs").

**Atlas de caras (obs. + inf.)**

| Parte | Formas |
|---|---|
| Boca | línea sonriente, "o", abierta con lengua, zigzag/serrada, "w", "~" ondulada, ":3", dientes, óvalo rojo (susto) |
| Ojos | normales con pupila, medio cerrados (pícaro), arcos "^ ^" (risa), muy abiertos con pupila chica (susto), esclera completa, de reojo, huecos sin iris (inquietante), **corazones** (él enamorado) |
| Rubor | puntos o rayas rosas, con intensidad en 3 niveles |
| Extras | gota/sudor, marcas de vibración junto al torso, puff de suspiro |

El swap se hace a ~8–12 Hz mientras hay voz, sin sincronía labial (obs.). Tamaño de textura de cara: 64×64 por expresión (inf.).

**Animaciones clave de ELLA (obs. de las tablas, adaptadas al oficio):**

| Animación | Descripción | Tipo |
|---|---|---|
| idle-apoyada | apoyada en columna/barra, cadera ladeada, brazos relajados, sonrisa de lado | loop |
| idle-umbral | peso en una cadera, cabeza ladeada hacia él | loop |
| that-depends | párpados semicerrados, ":3", cabeza adelantada (pose burlona) | ~1.5 s |
| giro-curioso | gira el torso a 3/4, cabeza ladeada | one-shot |
| inclinarse-hacia-él | se inclina con la boca abierta, mano suelta | one-shot |
| mostrar-objeto | brazo extendido con la bandeja o el objeto, boca abierta | one-shot |
| objeto-en-alto | brazo arriba con el objeto fuera de su alcance, cadera ladeada, sonrisa de victoria | one-shot repetible |
| caminar-sala | camina con paso natural; variante "flota" sin pasos (Ep 5) | ~1.5 s |
| asomarse-tras-marco | medio cuerpo tras el marco, mano en el borde, cabeza ladeada | loop |
| risa-ojos-cerrados | "^ ^", boca abierta, hombros que tiemblan | ~1 s |
| guiño | un ojo cerrado, sonrisa pícara | ~0.5 s |
| escudo | brazo extendido hacia atrás protegiéndolo, bandeja en la otra mano | hold |
| giro-sobre-hombro | gira la cabeza por encima del hombro, sonrisa de medio lado | one-shot |
| salida | camina hacia su puerta, mano al marco | ~1.5 s |

**Animaciones clave de ÉL (obs.):**

| Animación | Descripción | Tipo |
|---|---|---|
| idle-puerta | brazos colgando, balanceo mínimo | loop |
| rascarse-nuca | mano a la nuca con el codo alzado, balanceo lateral | ~2 s |
| risa-nerviosa | ojos "^ ^", boca grande, hombros que suben y bajan | ~1.5 s |
| sobresalto | giro de cabeza seco, esclera completa, manos al pecho | ~0.3 s |
| mano-alto | palma abierta a la altura del hombro (gesto de "para") | ~1 s |
| mirada-evasiva | ojos de lado/abajo, rubor, cabeza baja | hold ~1 s |
| sostener-objeto | el objeto con ambas manos a la altura del pecho, asentimientos | loop |
| salto-alcanzar | brazo estirado arriba, de puntillas, 3/4 | one-shot repetible |
| euforia | brazos abiertos, boca abierta con lengua, rebote | ~2 s |
| ojos-de-corazón | iris sustituidos por corazones rosados, sonrisa cerrada | ~1–2 s |
| cara-plana | boca plana, párpados medios, rubor | ~1 s (remate) |
| caminar-de-espaldas | con el objeto contra el pecho o al costado | loop / one-shot de salida |

**Densidad de animación (obs.):** las tablas listan ~0.6–0.8 animaciones nuevas por segundo entre los dos personajes, es decir, un cambio cada ~1.3–1.7 s por personaje.

**Reglas de contacto (propuesta, inf.):** los objetos se sujetan a huesos con agarre real y las manos no atraviesan nada. Un objeto "flotando" o cortado por el borde del cuadro es un error de producción.

---

## 6. Sonido

**Aviso:** sin acceso al audio. Todo lo de esta sección es **(inf.)** salvo donde se cita la transcripción.

- **Música:**
  - 7 de 8 captions acreditan a JDSherbert ("music: JDSherbert") (obs.). Estilo lo-fi/chiptune suave con sintes y reverb, **~70–100 BPM** (inf.). Es una cama continua, sin cambios de sección detectables.
  - En el montaje del tráiler (46.6–49.9 s, ráfaga de 0.46 s/plano) el pulso sube a **~130 BPM** (inf.).
  - **Propuesta:** música original o de librería con licencia verificada, en el mismo registro (instrumental, 80–95 BPM, sintes suaves + glockenspiel o marimba). Si se usa JDSherbert, verificar licencia y acreditar en el caption como la cuenta original.
  - **Mezcla:** la música baja o se calla en los silencios dramáticos y en el cambio de luz (Ep 4, 71–73 s; Ep 1, 68.7–70.8 s; Ep 2, 2.0–3.7 s).
- **Voz:** habla inteligible con entonación expresiva ("Pancakes!", "Breakfast for dinner! It's a thing!"). Whisper transcribe frases completas con puntuación natural → **voz humana actuada o TTS expresivo, no blips**. Los errores de transcripción ("Rina", "Thoreau", "Cold red") sugieren cierto procesado o compresión.
  - **ELLA:** voz femenina baja, juguetona y deadpan, con sonrisa audible. Habla con párpados semicerrados, tono de gato.
  - **ÉL:** voz masculina joven, nerviosa, dulce y expresiva, con risas nerviosas.
  - Se necesitan **2 voces claramente distintas**. Si se usa clonado, validar la similitud entre ambas. Cadena limpia, sin filtro retro.
- **Ritmo de habla (inf. desde la cadencia de subtítulos):** ~1.5–2.5 palabras/s mientras hay voz. Objetivo: **110–150 palabras por video**. Hay frases de 1 palabra ("Noticed.", "Fair.") y pausas de 1–3 s para el remate.
- **Silencios (obs.):** cola final sin diálogo de 1–3 s en 7 de 8 videos (Ep 1: ~2.9 s; Ep 2: 2 s; Ep 7: 1.6 s). Pausa dramática de ~2 s antes del remate (Ep 1, 68.7–70.8 s).
- **SFX (propuestos a partir de los momentos observados):**

| Efecto | Dónde |
|---|---|
| whoosh / bitcrush / glitch | en cada mosaico y glitch |
| ding o "plink" | al aparecer el corazón rosa (Sugar, 64.5 s) |
| puerta | abrir, cerrar y golpes |
| pasos sobre madera | cuando ella cruza |
| tecleo y ding de conexión | UI de móvil (Password, 58.5–60 s) |
| notificación de móvil | inserto de móvil (Ep 4, 79.5 s) |
| pitidos de botonera, zumbido, campanilla | ascensor (Ep 4) |
| zumbido eléctrico | regreso de la luz (Ep 7, 54 s) |

- **Loudness (inf.):** master **-14 LUFS** integrado, pico ≤ -1 dBTP, LRA 6–8 (estándar de plataforma). Voz ~10–14 dB sobre la música mientras habla.

---

## 7. Estructura recurrente (referencia: 70 s)

Los tiempos son de la referencia (obs. sobre 8 videos; las posiciones relativas son estables). El **giro cae al 83–92 % de la duración** en 6 de 7 videos con arco: Sugar 92 %, Ep 7 89 %, Ep 2 88 %, Ep 4 88 %, Password 86 %, Ep 5 83 %.

| # | Beat | t (s) | % | Contenido | Evidencia |
|---|---|---|---|---|---|
| 1 | **Gancho** | 0–2.5 | 0–4 | Cold open o stinger. Hay dos variantes: **A)** primerísimo plano de ELLA a cámara con la firma de la serie (5 de 8 videos); **B)** imagen absurda + pregunta cotidiana ("Do you have any sugar?", "Are you doing a rain dance in the hallway?") | Sting: Ep 1, 2, 4, 5, 7. Cold open: Sugar, Password, Tráiler |
| 2 | **Transición + título** | 2.5–7 | 4–10 | Mosaico pixelado, plano de él de espaldas o ya en situación, tarjeta de episodio (3.5–6.5 s). En los autoconclusivos, el título va desde 0 s | Ep 1/2/4/5/7 |
| 3 | **Pretexto + 1.er reto** | 7–20 | 10–29 | Él tiene un pretexto cotidiano y diminuto (azúcar, wifi, paquete, calcetín, apagón). Ella pone una condición o lo pilla en falta; él responde torpe | Sugar 4–17; Password 4–19; Ep 2 6–20; Ep 5 5–17 |
| 4 | **Escalada I** | 20–34 | 29–49 | Ping-pong de líneas de 1–3 palabras. Ella repite su palabra con eco. Insert de objeto o UI de 1–2.5 s | Sugar 17–32; Password 19–34 |
| 5 | **Salto + Escalada II** | 34–48 | 49–69 | Transición de mosaico. Reglas en cascada o subtexto con doble sentido ("sweet tooth" / "Noticed."; "Louder." / "Exclamation mark."), cada ~5 s un mini-remate | Sugar 32–44; Password 34–57; Ep 5 34–49 |
| 6 | **Vulnerabilidad** (opcional) | 48–57 | 69–81 | Él confiesa algo sincero y ella cambia de tono ("I like seeing you in my color") | Ep 4 45–55; Ep 5 53–57; Ep 2 52–56; Ep 7 51–53 |
| 7 | **Giro** | 57–64 | 81–91 | Ella revela que sabía o controlaba todo ("knock twice / it's you", "I can see everything on my network", "I'll teach him / Day one", "Good night, Danny" a las 4 de la tarde) | Sugar 55–61; Password 61–65; Ep 2 64–67; Ep 4 73–79 |
| 8 | **Remate emocional** | 63–67 | 90–96 | Reacción de él en PP (ojos de corazón / shock / cara plana). Si hay línea final, es suya y suena a vergüenza ("it said on air") | Sugar 61–64; Ep 7 64–68 |
| 9 | **Salida + cola** | 66–70 | 94–100 | Plano de espaldas o de puerta, 1–3 s **sin texto**, fundido o corte. Opcional: gancho al siguiente episodio (Ep 4, inserto de móvil "DID U MEET HIM YET?") | Sugar 64–66; Ep 1 79–82; Ep 2 71–73 |

**Dispositivos recurrentes (obs.):**
- **Eco burlón**: ella repite la palabra clave de él.
- **Regla en cascada con escalada**: tres peticiones cada vez más raras.
- **Corrección de nombre**: apodo.
- **Objeto que cambia de manos**: el tarro, la caja, la lámpara, la camisa rosa.
- **Subtexto**: la línea inocente que funciona como flirteo.
- **Caption como pre-remate**: "He has no idea who he just confessed to".

**Pretextos de camarera (propuesta, inf.):** pedir "lo de siempre", la cuenta, una propina rara, el wifi del local, un plato que no está en la carta, una reserva a nombre equivocado, "solo vine por el café". Mantener la regla de una idea mínima y completa en 66–72 s, que se entienda sin haber visto otros videos.

---

## 8. Pie del post / caption

**Plantilla observada (8 de 8 captions):**

```
[frase en voz de ella o remate previo, minúsculas ocasionales, ≤ 12 palabras, termina en punto] [emoji: 🖤 ♡ 📻] [Ep N]
#romcom #lowpoly #animation #romance #animegirl #fyp
music: [crédito]
```

- 6 de 8 llevan "Ep N". Los 2 autoconclusivos más fuertes (Sugar 363K y Password 197K) no lo llevan.
- Ejemplos: "nobody calls him Danny. except me. Ep 2", "He has no idea who he just confessed to 📻 Ep 4", "'Stay behind me.' …you're behind me. Ep 7".
- **Tráiler (obs.):** "She lives across the hall 🖤 Ep 1 + 2 Fri Nov 6 · 7 pm ET" con fecha y hora del estreno y cadencia.
- **CTA:** el Patreon y los episodios anticipados se anuncian solo en el end card del tráiler y en el perfil. Ningún episodio pide seguir o comentar (obs.).
- **Punto débil (obs.):** el engagement en comentarios es muy bajo (0.05–0.15 % de las vistas) porque nada invita a opinar.
- **Mejora propuesta (inf.):** una pregunta corta al final del caption que se pueda responder en una palabra ("¿cuál sería tu contraseña?", "¿rosa o salmón?"). Se puede dejar como comentario fijado.
- **Hashtags:** 5 fijos de nicho + #fyp (obs.). Se adaptan a nuestro idioma y a la serie, y se añade uno propio.
- **Archivo (propuesta):** nombre = título sin `? : " /`. Caption en un `.txt` al lado.

---

## 9. Kit a construir una vez

| Área | Elementos |
|---|---|
| **Personajes** | ELLA (corsé, mangas, shorts/jeans; variantes con delantal y abrigo si hace falta). ÉL (jersey + variantes). Atlas de caras (boca ×8, ojos ×9, rubor ×3). Esqueleto con huesos de agarre para objetos |
| **Biblioteca de animaciones** | Las ~14 de ella y ~12 de él de la sección 5. Más idles y los caminares de espaldas |
| **Sets** | **Local/taberna** (barra, mesas, puerta, ventana), **trastienda o cocina**, **calle o callejón de noche**, **pasillo o rellano** si se usa premisa de vecindad. Cada set con 2 variantes de luz (cálido día, azul/rosa noche) |
| **Props** | Bandeja, jarra, tazas, libreta de comandas, caja con etiqueta, tarro, velas, lámpara, cartel diegético ("ON AIR", "CERRADO"), móvil con UI de lista de wifi y contraseña, planta, sofá, ropa rosa |
| **UI diegética** | Móvil (tarjeta oscura con borde azul-gris, línea resaltada en rosa, check verde), burbuja de chat, notificación |
| **Subtítulos** | Chunker (1–4 palabras), color de palabra clave por hablante, Pixelify Sans Bold, contorno + sombra dura, tarjeta de título con glitch, etiqueta flotante, nameplate |
| **Post-proceso** | Render a 270×480 con upscale nearest, scanlines, grano, viñeta, bloom, aberración cromática, DOF solo en PP, transición de mosaico, glitch RGB, fundido de luz |
| **Rig de cámara** | Presets de push-in, órbita 180°, travelling de espaldas, cenital, contrapicado fuerte, dutch ±5° |
| **Audio** | Cama musical (2–3 pistas), pack SFX (mosaico, puerta, pasos, tecleo, ding, notificación), 2 voces con cadena limpia |
| **Plantillas de video** | Esqueleto de 9 beats con marcadores de tiempo, tarjeta de título y end card de tráiler |

---

## 10. Orden de producción sugerido

**Criterio:** rendimiento (vistas y likes) primero, con la condición de que sea factible. El kit se construye en el #1 y se reutiliza.

| # | Referencia (remake de ESTRUCTURA, guion propio) | Vistas / likes % | Dur. / planos | Sets | Props y UI nuevos | Animaciones nuevas | Riesgo |
|---|---|---|---|---|---|---|---|
| 1 | **6870** (pedir algo cotidiano en la puerta) | 363.5K / 9.8 % | 66 s / 24 | Local + entrada/pasillo | tarro, cajas, guirnalda, póster, sofá | idle-umbral, that-depends, rascarse-nuca, ojos-de-corazón, salida de espaldas | **Medio-bajo**. Máximo rendimiento, pocos sets, 24 planos |
| 2 | **6198** (wifi) | 197.4K / 9.5 % | 71 s / 27 | Reutiliza el #1 | móvil + 2 UIs (lista de redes y contraseña), etiqueta flotante | mano-alto, tipear, router-protest | **Bajo** |
| 3 | **9430** (apagón) | 113.9K / 12.5 % | 68 s / 34 | Local o pasillo a oscuras | bandeja con velas, cartel exit neón, cartel tipo "ON AIR" | escudo, euforia, ojos huecos | **Medio**. Iluminación de velas y viñeta fuerte. La bandeja encaja con la camarera |
| 4 | **5190** (revelación en espacio cerrado) | 219.8K / 10.7 % | 83 s → recortar a ≤ 80 s / 34 | 1 espacio cerrado + 1 set diurno | botonera/cartel, móvil con UI de chat, cenital | cambio de luz noche→día, ojos-enormes, shock-final | **Medio-alto**. Dos looks de luz y duración |
| 5 | **0982** (lavandería / objeto que tiñe) | 73.7K / 11.7 % | 72 s / 29 | Lavandería o trastienda | prendas rosa, calcetín/objeto rojo, mesa | flota-entrando, doblar-ropa | **Medio** |
| 6 | **1222** (paquete mal entregado) | 131.4K / 4.0 % | 73 s / 32 | Pasillo/entrada + interior | caja con etiqueta FRAGILE | objeto-en-alto, salto-alcanzar | **Medio** |
| 7 | **8662** (premisa de "puerta equivocada") | 119.2K / 6.1 % | 82 s / 43 | 2 sets | cajas, planta, lámpara, sofá | caminar con caja, mano agitada, autoironía | **Alto**. 43 planos y muchos props pequeños |
| 8 | **9462** (tráiler) | 69.2K / 8.7 % | 65 s / 29 | Reutiliza el material de episodios | end card | — | **Medio**. Se publica primero, se produce cuando ya hay 2–3 episodios |

**Recomendaciones:**
- **Producir 1–3, publicarlos y revisar el desempeño** antes de gastar en 4–8. El #4 hay que recortarlo, y el #7 y el #8 conviene rehacerlos con gancho propio.
- La serie original arrancó más lento con su arco serial (Ep 1 y 2: 4–6 % de likes) y tuvo su pico con los autoconclusivos. Se recomienda **abrir con 1–2 piezas cerradas** y dejar el arco serial para después.
- **Orden de publicación ≠ orden de producción.** El tráiler va antes del estreno, con fecha y hora en pantalla.

---

## Decisiones abiertas (a confirmar con el usuario)

1. Idioma del diálogo y de los subtítulos (la cuenta original usa inglés; la fuente debe cubrir caracteres especiales si es español).
2. Nombres de los personajes y firma propia de la serie (stinger de apertura).
3. Color de ropa del pretendiente, y pelo de la camarera.
4. Música: licencia de JDSherbert o pista propia.
5. Tope duro de duración según plataforma (se propone 80 s).
6. Pregunta de cierre para el caption, y cadencia de publicación.
```
