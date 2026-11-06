---
type: note
status: active
tags: [roblox, greenbrorants, animacion, actuacion, camara, referencia]
relatedTo: [styles/roblox/STYLE.md]
---

# GreenBroRants: movimiento de personajes y cámara

Estudio de los **105 shorts del canal con más de 1 M de vistas** (lista al final). Método:
- **Cortes de plano:** detección de escena con ffmpeg (umbral 0,32) en los 105 videos, 6.640 planos en total.
- **Tiras de fotogramas consecutivos:** 4 momentos por video (12 %, 38 %, 62 % y 85 %), 2 s cada uno, a 6 fps. Las analizó Claude por API, una pasada por video, y después una síntesis de los 105.
- **Revisión a ojo:** unas 10 tiras, que confirman lo principal (ver ejemplos más abajo).
- Las notas de contenido de cada video (guion, ganchos) están en las otras notas de `fuentes/roblox-cartoon/`, hechas con ver-youtube.

Los conteos son aproximados (±5 videos) y a 6 fps el easing fino no se puede medir. Para buscar o repetir algo: los análisis por video y las tiras están en `scratchpad/gb/motion/<id>.md` y `<id>_N.jpg` (carpeta temporal).

Hay videos atípicos que conviene **no copiar**:
- **Compilaciones con pantalla dividida** (avatar sentado fijo debajo de b-roll): GhkMq0ml9qs, N36DRb3D9YM, WFe5A29OmEk, fCez5I433XQ, inSdzANG4Wk, n3zA68R2C6M.
- **Videos casi sin personajes:** aLbl1UxMuZo, FGNLJl2eYBg, rbOoYtLX2AE, qKltaLIsbBw.

## 1. Ritmo de montaje (medido)

| Métrica | Valor |
|---|---|
| Duración del video | mediana 104 s (rango 27–171 s) |
| Duración de plano | mediana **1,36 s**, media 1,57 s |
| Percentiles | P10 0,70 s · P25 0,97 s · P75 1,87 s · P90 2,53 s |
| Planos de más de 3 s | 6 % (más de 5 s: 1,4 %) |
| Planos de menos de 0,5 s | 3 % (ráfagas de clímax de unos 0,1 s por plano en ~8 videos, p. ej. 2aucEdPHl9U en 120–121,5 s) |
| Cortes por minuto | **38** |

Un plano por cláusula de la narración. El corte cae justo antes de la palabra clave. Nuestro shotlist, a unos 1,4 s por plano, ya está en este rango.

## 2. Actuación: reposo frente a acción

**La regla del canal es que el cuerpo está casi quieto: la cara y la cámara cargan con la actuación.**

**Extras y quien no habla**
- En ~90 de 105 videos están **congelados en pose**: brazos abiertos a 20–45° o pose de la acción. Como mucho tienen una deriva de 1–3° o 1–2 px.
- No hay respiración, parpadeo animado, idle en bucle ni rebote.
- Las multitudes están siempre quietas.
- Ejemplo: R8sovjuG4Jo, a 30 M de vistas, tiene unos 25 niños en la luna, todos estatuas.

**Idle con amplitud real**
- Solo aparece en ~12 videos, y solo en quien habla: balanceo de ±3–8° o cabeceo de ±10–15° a 0,5–1,5 Hz.

**Cabeza**
- Giros de 5° o menos.
- En primer plano hay una inclinación lenta de unos 5° durante el plano, sumada al push-in (l4tJEtETx6M, la cara del alien).
- Cuando el personaje mira a otro lado, el giro es un **snap** de 1–2 fotogramas, no un paneo suave.

**Caras**
- En ~95 videos la cara cambia por **swap duro de textura**, sin interpolación.
- **Al hablar:** la boca alterna abierta y cerrada cada 1–2 fotogramas a 6 fps, es decir, 3–6 cambios por segundo, más o menos uno por palabra.
- **En expresiones emocionales:** cambian cada 3–6 fotogramas.
- **En el corte:** el cambio de emoción suele coincidir con el corte. Ejemplo: sonrisa nerviosa, corte y cara triste.

**Gestos**

Los gestos son **poses**, no movimientos. Hay un snap de 1–2 fotogramas (0,17–0,33 s) a la pose, que se **sostiene 0,7–1,5 s**, y casi siempre el corte llega antes de que la pose se deshaga.

Gestos más frecuentes:
1. Brazos abiertos en V o T (~55 videos).
2. Uno o dos brazos arriba, o saludo (~40).
3. Brazo extendido señalando u ofreciendo un objeto (~25). Ejemplo: WDRyPGzHjK8, el niño estira el papel "7×8 is 56".
4. Manos a la cara o la cabeza (~15).
5. Encogerse de hombros (~12).
6. Brazos cruzados (~8).

**Anticipación y squash**
- No aparecen en ~80 % de los gestos.
- Solo los hay en golpes fuertes (bate, pico, hacha, salto), con 1–2 fotogramas de anticipación y un squash de 10–25 % en el impacto (plNvOjqZoug, 6iqceeolJgk, H9s1Au1hnF4).

**Varios personajes**
- En ~85 videos actúa **un solo personaje por plano** y el resto son estatuas. Se turnan con campo y contracampo.
- Cuando un grupo reacciona (susto, festejo), lo hace **sincronizado**: la misma pose a la vez, con 0–2 fotogramas de desfase.
- El que reacciona responde a la acción con 2–4 fotogramas de retraso, es decir, 0,3–0,6 s.
- Solo ~5 videos tienen fases realmente independientes, por ejemplo la carrera de fzik5F83xD0.

## 3. Caminar y correr

Hay ciclo de marcha en ~50 de 105 videos. En el resto el personaje ya está en su sitio.

| | Caminar | Correr (~15 videos) |
|---|---|---|
| Pasos/s | ~2 (1,5–2,5) | 3–4 |
| Brazos | ±15–40°, rígidos, a veces abiertos 30° | ±40–60° |
| Piernas | ±20–30° | ±40–70° |
| Torso | recto | inclinado 15–20° hacia delante |
| Bob vertical | 2–5 % de la altura, 2 por ciclo | ~5 % |
| Extra | — | polvo en los pies (~6 videos) |

Ejemplos:
- **B12uoiyyqaY:** el alien camina hacia la cámara por el pasillo, con los brazos bien marcados y el ángel y el diablo en los hombros. La cámara retrocede a su misma velocidad y el personaje mantiene el tamaño.
- **m3Yp035uj_8:** el guardia marcha con la cámara baja.

Cómo acompaña la cámara:
- **Fija mientras el personaje se acerca** (~16 videos): el personaje crece ×1,4–2,5 en ~1 s.
- **Travelling hacia atrás** a la velocidad del personaje (~12 videos).
- **Travelling lateral o desde atrás** (~10 videos). Ejemplo: N9st57FlG4Q, el bulldog visto de perfil en contrapicado.

**Nadar o chapotear:** brazos alternos a unos 3 Hz con salpicaduras (B12uoiyyqaY, en el río con el autobús).

## 4. Cámara

| Recurso | En cuántos videos | Magnitud típica |
|---|---|---|
| **Push-in lento continuo** | ~90 | **3–15 % en ~2 s**, arranca en el corte y dura todo el plano |
| Push-in fuerte | ~25 | 25–50 % en ~1 s (momentos de tensión o revelación) |
| Snap o punch-in | ~15 | ×2–2,5 en 1–3 fotogramas, sobre un golpe del guion |
| Pull-out / dolly-out (revelación) | ~30 | 5–60 % en 0,5–1,5 s, a veces con grúa hacia arriba hasta un cenital (RnkzYq1t3LQ, 111 s) |
| Tracking lateral o trasero | ~25 | velocidad igual a la del personaje |
| Órbita o paneo leve | ~12 | 5–20° en el plano (el zapato en NUvXZ3aKSOY gira unos 10° mientras entra) |
| Dutch / roll **estático** | ~55 | 3–15°, fijo durante el plano; ≥20° en ~8 videos; rolls de 90–180° como efecto en AQ0KEMf-CzA |
| Temblor o handheld | ~12 | solo en impactos o terror, ≤1° |

- **Ningún plano está realmente muerto.** Hasta el "fijo" tiene una deriva del 2–3 %. El movimiento sale de la **cámara** y no de los cuerpos.
- **El zoom se reinicia en cada corte.** Solo ~8 videos arrancan un movimiento a mitad de plano.
- Lo normal es ease-out o lineal. En ~6 videos se ve claramente lineal.
- **El dutch no se anima:** es un ángulo fijo, y el plano siguiente suele volver a horizonte recto o inclinarse al otro lado.
- **Transiciones:** flash blanco o "poof" (~8 videos), un objeto en primer plano que barre como cortinilla (~6) y crossfade (~5). Lo demás son cortes secos.

## 5. Puesta en escena por plano

- **Primer plano frontal centrado** (~90 videos): la cabeza en el tercio superior ocupa el 50–80 % del alto y los subtítulos quedan en el centro o el tercio inferior. Es el plano por defecto de la narración.
- **Dos personajes en lados opuestos**, de tres cuartos o en tercios (~50 videos), con campo y contracampo.
- **Over-the-shoulder** detrás del protagonista (~20). Ejemplos: WDRyPGzHjK8 y R8sovjuG4Jo, donde el hombro y el gorro del alien tapan un tercio del cuadro.
- **Contrapicado** para dar escala o amenaza (~35). **Picado o cenital** para establecer o rematar (~30).
- **Inserto de objeto** en primer plano extremo (~25): cartel, reloj, zapatos, nota. Ejemplo: NUvXZ3aKSOY, que pasa de los zapatos en la estantería a las suelas en primer plano con la cara detrás.
- **Primer plano desenfocado** como capa de profundidad (~30 videos).
- **Perfil puro:** casi nunca, salvo al caminar o en vehículos.
- **Una acción, un plano:** la acción se resuelve dentro de 1–2 s. Si hace falta más, se corta a otro ángulo en vez de sostener.

## 6. Lo que NO hacen (para no sobreactuar)

- Los extras no tienen ciclo idle, ni parpadeo ni respiración.
- El cuerpo de quien no habla no se mueve de forma continua.
- No hay morph de caras. No hay lip-sync por fonema: solo abierta o cerrada.
- No hay overshoot ni rebote en los gestos, salvo en golpes.
- La cámara no tiembla siempre: el handheld es la excepción.
- No hay órbitas largas. El dutch no se mueve.
- Las multitudes no están animadas.

## Qué cambiar en nuestro engine

Referencias: `pieces/rbx-thursday/src/engine.js`, el bloque de actuación y cámara dentro de `ENG.render` (líneas ~71–85), y `cast.js` (`CAST.POSE`).

1. **Quitar el "todos se mueven siempre"** (engine.js, el forEach sobre `CAST.used`).
   - Hoy cada actor visible gira el cuello ±0,22 rad (±12,6°), balancea el torso y hace un gesto cada 1,8–3 s. En GreenBro eso solo lo hace **quien habla**.
   - Agregar `c.lead` (nombre o lista) en el retorno del stage.
   - Los actores fuera de `lead` reciben `k = 0.08`: solo deriva casi nula y sin gestos.
   - El `lead` usa `k = 1`, pero con las amplitudes del punto 2.

2. **Bajar las amplitudes del idle del lead.**
   - `neck.rotation.y`: de 0.22 a **0.06** (~3,5°).
   - `neck.rotation.x`: de 0.05 a **0.04**.
   - `body.rotation.z`: de 0.03 a **0.02**.
   - `body.rotation.y`: de 0.06 a **0.03**.
   - Weight shift de piernas: de 0.04 a **0.02**.

3. **Cambiar los gestos de seno a snap, sostener y cortar.**
   - Hoy el gesto es `g = sin(π·lo/0.75)`: sube y baja suave en 0,75 s.
   - Reemplazarlo por una envolvente de 0,25 s de entrada (ease-out), sostenida 0,7–1,5 s, y bajada solo si el plano sigue: `g = min(1, lo/0.25)` y luego 1.
   - Lanzar como máximo **un gesto por plano**, en la palabra clave, en vez de periódico.
   - Mejor aún, que el stage lo pida explícitamente: `c.gesture = { who, pose: 'wave'|'point'|'shrug'|..., at: u }`.

4. **Añadir poses a `CAST.POSE`** con los gestos que más usa el canal. Con rad, x<0 sube el brazo hacia delante:
   - **open:** brazos en V. `armL [0,0,0.6]`, `armR [0,0,-0.6]`.
   - **point:** `armR [-1.55,0,0]`, `head [-0.05,0,0]`.
   - **offer:** brazo estirado sosteniendo un objeto. `armR [-1.4,0,0.15]`.
   - **shrug:** `armL [-0.3,0,0.9]`, `armR [-0.3,0,-0.9]`, `head [0,0,0.15]`.
   - **handsHead:** `armL [-2.8,0,-0.5]`, `armR [-2.8,0,0.5]`.
   - **crossed:** `armL [-1.2,0,-0.7]`, `armR [-1.2,0,0.7]`.
   - **run:** `run(ph)` con brazos ±0.9, piernas ±1.0 y `body [0.3,0,0]`.

5. **Hacer el ciclo de `POSE.walk` más legible.**
   - Frecuencia de fase: **2 pasos/s**, es decir, `ph = t·2π` por ciclo de 2 pasos.
   - Brazos: ±0.5 → **±0.6**. Piernas: ±0.5 → **±0.45**.
   - Sumar un **bob vertical**: `root.y += 0.04·h·|sin(ph)|`, 2 subidas por ciclo, alrededor del 3 % de la altura.
   - Correr: 3,5 pasos/s, bob del 5 % y torso inclinado unos 17°.

6. **Agregar el habla de la cara** (setFace).
   - Si el actor es el `lead` y su línea está sonando, alternar la cara `talk` (boca abierta) y la cara base en cada palabra de `words.json`, unos 4 cambios por segundo.
   - Los demás mantienen su expresión.
   - Cambiar la emoción del lead **en el corte**, no a mitad de plano.

7. **Reacciones sincronizadas con retardo.**
   - Para grupos (susto o festejo), usar `c.react = { who: [...], pose: 'scared'|'cheer', face, at }`.
   - Todos hacen el snap a la misma pose, con 0–2 fotogramas de desfase aleatorio por actor y 0,3–0,5 s después del evento del lead.

8. **Cambiar la cámara por defecto: creep lento, no punch rápido** (bloque `// camera:`).
   - Hoy cada plano arranca con zoom 1.28 y cae a 1 con `exp(-dt·7.5)`, en ~0,4 s, más −12 %. Eso es un punch-in en el 100 % de los planos, y el canal lo usa solo en ~15 de 105 videos.
   - **Por defecto:** `zoom = 1 - 0.10·ease(u)`, un push-in de ~10 % a lo largo del plano que arranca en el corte, con ease in-out o lineal.
   - **`c.cam = 'push'`:** fuerte, `1 - 0.35·u` (unos 35 % por segundo, para tensión).
   - **`c.cam = 'punch'`:** el comportamiento actual (snap ×1,3 → 1 en 2–3 fotogramas), solo en golpes.
   - **`c.cam = 'pull'`:** revelación, `0.8 → 1.05` con grúa opcional hacia arriba.
   - Quitar el "pull-out cada tercer plano" automático: lo decide el stage.

9. **Apagar el handheld por defecto.**
   - Hoy hay `rotateZ` de 0.012+0.006 rad y `rotateX/Y` de 0.008 en todos los planos.
   - Dejarlo en 0 y activarlo con `c.shake` (amplitud ≤0.017 rad, ≤1°) solo en impactos o terror.
   - La deriva de vida ya la da el creep del punto 8.

10. **Dutch estático en la mitad de los planos.**
    - Si el stage no fija `roll`, aplicar `roll = ±(4–10)°` en ~50 % de los planos, alternando el signo. Usar un hash determinista de `sh.i` para elegirlos.
    - Nunca animar el roll dentro del plano.
    - Reservar 20° o más para momentos de miedo o desorientación.

11. **Seguir el paso del personaje en lugar de dejarlo atravesar el cuadro.**
    - Agregar al `ENG.orbit` un helper `ENG.track(name, d, yaw, pitch, mode)` con `mode: 'back'|'side'|'behind'`.
    - Calcula el target de cámara desde la posición actual del root del actor, que se mueve con u.
    - Opción "fija mientras se acerca": cámara quieta y el actor crece ×1,5–2 en el plano.

12. **Planos recurrentes como presets de stage:** primer plano frontal centrado (por defecto), OTS detrás del lead, contrapicado de escala, cenital de remate e inserto de objeto con desenfoque de primer plano.
    - Ya tenemos `ENG.face` para el primer plano. Faltan `ENG.ots(lead, other)` y un preset de inserto con `focus` corto y un prop desenfocado delante.

13. **Ráfaga de clímax.** Permitir en el shotlist una fila `burst` que parta el plano en 6–15 subplanos de 0,1 s, alternando ángulos y flashes. Solo una vez por video, en el clímax.

## Videos estudiados (105, ordenados por vistas)

| id | vistas | título | duración / planos / plano medio |
|---|---|---|---|
| R8sovjuG4Jo | 30.0 M | The Most Boring Story 😴🌛 | 149 s / 66 / 2.3 s |
| l4tJEtETx6M | 28.0 M | If You Hug Someone You Swap Ages 🤯 | 62 s / 38 / 1.6 s |
| RwzXQlcAE8c | 26.0 M | Every Person Is Made Of A Certain Material 🤔📄🧱 | 99 s / 48 / 2.1 s |
| 2aucEdPHl9U | 24.0 M | Suspicious Lunch Lady 😱 | 143 s / 80 / 1.8 s |
| _gxpiJ6uTQs | 22.0 M | Every Time You Lie You Shrink 😱 | 57 s / 33 / 1.7 s |
| m3Yp035uj_8 | 21.0 M | The Alphabet Is Alive 😱 | 143 s / 75 / 1.9 s |
| Ef5xndsGJus | 21.0 M | The Sun Makes Sure Everyone Is Awake 🌞 | 66 s / 28 / 2.3 s |
| nDxLxJM6yUM | 20.0 M | Mr. Smiles Finds Everyone 🫣 | 67 s / 31 / 2.1 s |
| z1ptZ8n7uHs | 17.0 M | If You Move You Turn invisible 😯 | 124 s / 76 / 1.6 s |
| pvZmPiEi-lA | 16.0 M | Everyone Has A Window On Their Back 😲 | 91 s / 76 / 1.2 s |
| UrEV3J5qeUA | 16.0 M | A String Ties To Who You Love Most 😯 | 107 s / 53 / 2.0 s |
| B12uoiyyqaY | 16.0 M | Angel On One Shoulder Devil On The Other 😇😈 | 112 s / 71 / 1.6 s |
| NajqkS5rfjg | 14.0 M | The Stars Tell You What Happens Tomorrow ⭐ | 133 s / 75 / 1.8 s |
| N9st57FlG4Q | 14.0 M | A Lost Dogs Kingdom 🐶👑 | 132 s / 87 / 1.5 s |
| 1kVONGlyXDU | 14.0 M | The Sun Didn’t Wake Up ☀️ | 131 s / 76 / 1.7 s |
| t12gPCa4CJU | 12.0 M | He Was Faster Than... THE BLUR?? 🤯 | 59 s / 31 / 1.9 s |
| DkbizHHzCkQ | 12.0 M | The Sky Must Be Held Up 😱 | 112 s / 75 / 1.5 s |
| 6iqceeolJgk | 12.0 M | If Your Balloon Pops You're Forgotten Forever 😮🎈 | 106 s / 74 / 1.4 s |
| iGCtO9Z3Vsc | 11.0 M | Everyone Must Be Flipped ⌛ | 61 s / 46 / 1.3 s |
| Z7BRXygYGh8 | 11.0 M | My Dads Cloud 🤯 | 105 s / 61 / 1.7 s |
| X1Niyi8Zy9s | 11.0 M | You Become Your Costume 👻🦇💀 | 110 s / 79 / 1.4 s |
| S9Rye94ssVM | 11.0 M | The Tooth Fairies Project 🦷 | 132 s / 99 / 1.3 s |
| AQ0KEMf-CzA | 10.0 M | Grandma's Secret Trapdoor 🤯 | 104 s / 71 / 1.5 s |
| hdLMlROn-8A | 9.9 M | In This World You Only Have Limited Words 🤐 | 39 s / 32 / 1.2 s |
| eCx9f7Xtn8Q | 9.6 M | Giants Live Above The Clouds 😱 | 54 s / 39 / 1.4 s |
| XR_pEcfdj7s | 9.6 M | She Kept On Sneezing 🤨 | 42 s / 38 / 1.1 s |
| EQwAj-grxms | 9.3 M | You Must Be Quiet 🤫 | 114 s / 65 / 1.8 s |
| KhYWQ4QDcDI | 9.1 M | The New Kid Was... THE MOON?? 🌛 | 116 s / 88 / 1.3 s |
| EiZI9R4d_G0 | 9.0 M | Lying Makes You Heavier 😱 | 54 s / 32 / 1.7 s |
| KeFkx1RNwGA | 8.5 M | Tiny Workers🚦 | 139 s / 112 / 1.2 s |
| jIK3GZoGVns | 8.4 M | The Dinosaur Watch ⌚🦖 | 130 s / 102 / 1.3 s |
| 82mLnglNLd0 | 8.4 M | I Could CONTROL The Entire Town, Until... 🤯 | 96 s / 68 / 1.4 s |
| rbOoYtLX2AE | 8.3 M | Everything Is Made Of Glass 😯 | 101 s / 49 / 2.1 s |
| dhlhN9yYEGk | 8.3 M | You Must Paint To Get Things In This Town 🎨 | 107 s / 67 / 1.6 s |
| uqc8ca9alwg | 8.2 M | You Must Stop Moving For The Lights 😧 | 74 s / 42 / 1.8 s |
| -DourAp_P54 | 8.0 M | Night Versions Of My Family 😱 | 65 s / 36 / 1.8 s |
| EH6BeNNSbM4 | 7.8 M | You Swap Bodies With Your Pet 🐕 | 133 s / 105 / 1.3 s |
| inSdzANG4Wk | 7.4 M | His Life Was Saved Because Of A TikTok 🙏 | 32 s / 19 / 1.7 s |
| fzik5F83xD0 | 7.4 M | A Robot Was Our Hero 🤖 | 101 s / 48 / 2.1 s |
| GzKfSJrlWIY | 7.4 M | Humans Hibernate 💤🐻 | 154 s / 111 / 1.4 s |
| sbXT3emNnIg | 7.3 M | Everything Is A Puzzle Piece 🧩 | 150 s / 96 / 1.6 s |
| aLbl1UxMuZo | 7.2 M | A Tree That Never Breaks 🌲 | 122 s / 77 / 1.6 s |
| MQqx6XdHS1I | 7.2 M | Everyone Is Born With An Animal Mask 🦁🐱 | 108 s / 74 / 1.5 s |
| 8B7LiNBOkA4 | 7.2 M | You Get A Dragon Egg When You Turn 10 🐲😲 | 93 s / 57 / 1.6 s |
| MBL_HeeM6qo | 7.0 M | The Easter Bunny Hides A Golden Egg 🐰 | 102 s / 74 / 1.4 s |
| H9s1Au1hnF4 | 7.0 M | The Rain Falls Up 💦 | 135 s / 98 / 1.4 s |
| HXKdYUU24hw | 6.9 M | You Must Play With Mr. Smiles 🫣 | 105 s / 70 / 1.5 s |
| n6HT5G0SUOU | 6.6 M | Facts That Could Save Your Life 🤔 | 41 s / 30 / 1.4 s |
| e1SfSfohpSE | 6.6 M | My Grandpa's Treehouse 🥲 | 93 s / 70 / 1.3 s |
| 104sEz7ZxCU | 6.6 M | The Entire World Is Made Of Paper 📄😧 | 64 s / 32 / 2.0 s |
| 2Ur_QtEUHzg | 6.5 M | I Was Stuck In A Huge Corn Maze 🌽 | 96 s / 69 / 1.4 s |
| ObrPnm-1zKY | 6.3 M | A High Score That Shouldn't Have Been Beat 👾🕹️ | 98 s / 66 / 1.5 s |
| ylMTylT1Hdw | 6.1 M | A Clown Makes You King 🤡👑 | 124 s / 98 / 1.3 s |
| _fQw9ETrl_k | 6.1 M | The Ice Cream Truck Had A Backwards Song? 😳 | 110 s / 75 / 1.5 s |
| WDRyPGzHjK8 | 6.1 M | Homework You Don't Finish Becomes A Problem 📝 | 149 s / 82 / 1.8 s |
| dW4KQ-lCLbw | 6.0 M | Every Lie Creates A Moth 🤥 | 128 s / 88 / 1.5 s |
| KrKl_d5k_fg | 5.9 M | Stuck In An Endless Ocean 😱 | 129 s / 65 / 2.0 s |
| B-Kc9i20GWA | 5.6 M | Characters Come Out Of Their Books 📖 | 141 s / 104 / 1.4 s |
| gooV9QjDsDY | 5.4 M | Every Person Is A Traffic Light 🚦 | 109 s / 74 / 1.5 s |
| WVy84r2RHoA | 5.3 M | Everyone Gets A Superpower For 1 Minute 😱 | 96 s / 80 / 1.2 s |
| -zPGwE-ANZc | 5.2 M | You Can Hire A Stunt Double 👥 | 171 s / 125 / 1.4 s |
| RnkzYq1t3LQ | 5.1 M | Every Step Plays A Note 🎶 | 131 s / 93 / 1.4 s |
| plNvOjqZoug | 5.0 M | One Lucky Button 🍀 | 141 s / 79 / 1.8 s |
| tATV5AqJAIo | 4.9 M | Everybody Has A Volcano In Their Yard 🌋😱 | 96 s / 61 / 1.6 s |
| rLO7IgLITWs | 4.9 M | Our House Was Taking Us 🏠 | 154 s / 91 / 1.7 s |
| jNW8VdeKDhc | 4.4 M | Everyone Owns A Pet Cloud ☁️ | 89 s / 51 / 1.7 s |
| IwGNizQONZw | 4.4 M | The Grandparent Factory 👴🏻 | 139 s / 96 / 1.4 s |
| FGNLJl2eYBg | 4.4 M | Everything Must Be Drawn 📝 | 132 s / 84 / 1.6 s |
| eXFSN9w8e0c | 4.3 M | I Was The Poorest Person In Town 😢 | 58 s / 35 / 1.7 s |
| 5DRaRlrPROs | 4.2 M | The Golden Train 🚆 | 129 s / 96 / 1.3 s |
| bYkbbcBSMBg | 4.0 M | You Get A Rank For Winning 😄 | 40 s / 22 / 1.8 s |
| TXQe0lUxYeQ | 4.0 M | Babies Are Delivered In The Mail 😲 | 96 s / 70 / 1.4 s |
| K_S_nV_PafI | 3.9 M | I Wasn't The Strongest 🧐 | 136 s / 103 / 1.3 s |
| zc8Wd__VqIo | 3.8 M | In This World Gravity Costs Money 😱 | 60 s / 35 / 1.7 s |
| Dqe0EnYsnrc | 3.7 M | Nobody Has Seen The Emperor In A Long Time | 130 s / 98 / 1.3 s |
| d4s8RqZaWNE | 3.5 M | You Can See The Future 🤯 | 57 s / 42 / 1.4 s |
| vxtQEUnJCpI | 3.4 M | Everyone Has A Wind Up 😲 | 49 s / 35 / 1.4 s |
| wqwcKn44_vo | 3.3 M | In This World You Swap Bodies If You High Five 👏 | 62 s / 29 / 2.1 s |
| qKltaLIsbBw | 3.2 M | The Secret 25th Hour 💤 | 138 s / 78 / 1.8 s |
| IM95Tcqe7js | 3.1 M | The Castle On The Snail 🐌🏰 | 135 s / 82 / 1.7 s |
| J0s2HxFP6Jg | 3.0 M | Time Traveler Experiment 😱⌛ | 47 s / 25 / 1.9 s |
| 9PaWIyLzTW0 | 2.9 M | A Ghost Is Assigned To Each Family 👻 | 99 s / 63 / 1.6 s |
| ndNaL7E9t9o | 2.7 M | The Monster Under My Bed Was SCARED?? 🫨 | 90 s / 60 / 1.5 s |
| D6xhk00-fIc | 2.7 M | Every Story Has A Hero 🥹 | 150 s / 78 / 1.9 s |
| lP2qSk0Ykpk | 2.6 M | The Ghost Train 🚇😱 | 71 s / 51 / 1.4 s |
| jtDdVLWZWV4 | 2.5 M | He Taught Me To Drive When I was 9 😱 | 57 s / 35 / 1.6 s |
| el7JB9plfO4 | 2.5 M | Cracks Started Forming Everywhere 😧 | 133 s / 73 / 1.8 s |
| YvVIzgxpMTE | 2.5 M | The Boy And The Snow Globe 👦❄️ | 64 s / 34 / 1.9 s |
| 3warFeT9eB8 | 2.4 M | The Monster Experiment 👿🧪 | 41 s / 23 / 1.8 s |
| AcBXpwwei4k | 2.3 M | He Stole An Ambulance And Then.. 😱 | 82 s / 48 / 1.7 s |
| HaIeReji-W4 | 2.2 M | Garden Gnomes Come To Life 😱 | 135 s / 63 / 2.1 s |
| 2V4xNhtheqk | 2.2 M | Everyone Has A Blackhole 🕳️ | 88 s / 56 / 1.6 s |
| n3zA68R2C6M | 2.1 M | He Finally Got The Role 🤗 | 27 s / 14 / 1.9 s |
| cuhQkiyAQGk | 1.8 M | Which Room Would You Choose? | 43 s / 34 / 1.3 s |
| MIfAhkNRl18 | 1.6 M | The Spooky Snowman ⛄ | 124 s / 79 / 1.6 s |
| --XIqkSpVhQ | 1.6 M | Bottle Number 47 📜🤔 | 84 s / 47 / 1.8 s |
| ngFEL0bIcrI | 1.5 M | The Funniest Joke 🤡 | 152 s / 101 / 1.5 s |
| oN5IAnMdGNE | 1.4 M | The Night Is Alive 😱 | 134 s / 63 / 2.1 s |
| 224IMgYc360 | 1.3 M | The Toy Makers One Request 🧸 | 104 s / 53 / 2.0 s |
| NUvXZ3aKSOY | 1.2 M | Shoes Take You Where You Need To Go 👟 | 131 s / 103 / 1.3 s |
| fCez5I433XQ | 1.1 M | The Most Dangerous Foods To Eat 🤮 | 28 s / 9 / 3.1 s |
| WFe5A29OmEk | 1.1 M | Dark Phone Numbers You Should Not Call 😨 | 32 s / 22 / 1.5 s |
| N36DRb3D9YM | 1.1 M | The Most Hated YouTubers 🤬 | 35 s / 16 / 2.2 s |
| I_tyx60xEnY | 1.1 M | Whistling Is Illegal 😗 | 135 s / 88 / 1.5 s |
| GhkMq0ml9qs | 1.1 M | Do You Remember These? 🤔 | 41 s / 16 / 2.6 s |
