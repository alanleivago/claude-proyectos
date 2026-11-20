---
type: note
status: active
tags: [scp, passthesalt17, tiktok-research, airy, guard-dialogue, ps1, scp-containment-breach, formato-corto]
relatedTo: [airy, upnext-girl2, vera-02, x0ffz]
---

# @passthesalt17_: análisis + formato Airy + guardia

Este análisis se hizo con los créditos de la API (Sonnet 5.5, ~110k tokens de entrada en total). Las notas por video, con la transcripción completa, están en [notas/](notas/) y la síntesis en [notas/SINTESIS.md](notas/SINTESIS.md). Los videos están en `videos/` (git-ignorado). La API no escucha el audio, así que voces y SFX son una inferencia a partir de la transcripción y los fotogramas.

## A. Ranking (27 videos, todos de 48 a 59 s)

| # | Vistas | Likes | Caption | SCP |
|---|---|---|---|---|
| 1 | 1.300.000 | 126,7K | "Eric?" | SCP-066 |
| 2 | 792.700 | 61,1K | "uhhhh I forgor" | SCP-055 |
| 3 | 627.700 | 49,7K | "gem post" | SCP-409 (+ chiste con SCP-500) |
| 4 | 613.300 | 60,8K | "I'm an agent of chaos..." | Chaos Insurgency + SCP-2948 |
| 5 | 606.100 | 48,5K | "basically my sleep paralysis demon" | SCP-966 |
| 6 | 552.700 | 42,7K | "ehh needs more cowbell" | SCP-513 / 513-1 |

Después vienen "Baja BLAST" (516K), "Happy Halloween" (508K) y "the builder bear" (504K). El piso del canal está entre 200K y 600K, y el más bajo en ~88K.

## A. Formato

### Motor y look
- Son modelos estilo **SCP: Secret Laboratory** (los hashtags lo nombran): guardias realistas y detallados, renderizados con cámara libre en Blender, SFM o GMod, no grabados en vivo. Los modelos de SL son propietarios, así que no los podemos usar.
- Hay **dos personajes fijos** en todos los videos:
  - **El ingenuo:** armadura gris pesada, casco con visión nocturna de 4 lentes azules.
  - **El recto que sabe el lore:** camuflaje de desierto, gafas amarillas, headset.
- **Sets reutilizables:** pasillo de contención blanco o beige con franjas naranjas, sala de descanso y una celda por SCP con la **placa de contención** visible (número, clase, foto o "?").
- **Imagen:** luz plana y limpia, profundidad de campo, sin HUD, 9:16.

### Cámara
- Tercera persona de cine:
  - Plano/contraplano medio.
  - Over-the-shoulder con el otro guardia desenfocado en primer plano.
  - Primeros planos en las reacciones.
- **Corte en cada línea**, cada 1–3 s (~20–25 cortes en el top 1). Casi ningún plano queda quieto: hay dolly, órbita o paneo leve.
- **Inserts:** la placa del SCP, carteles de "DO NOT TOUCH", el objeto.
- **Remate visual:** el SCP se lanza a cámara o aparece detrás de ellos.

### Diálogo y beats (promedio de 55 s)
| Tiempo | Beat |
|---|---|
| 0:00–0:02 | **Hook en medias res:** una pregunta o advertencia más la anomalía a la vista ("Eric? Who's Eric?", "You do NOT want to go in there"). En 4 de 6 es una pregunta. |
| 0:02–0:10 | Setup de roles: el ingenuo no entiende y el recto se harta o se asusta. |
| ~0:15–0:20 | Se nombra el SCP ("That's SCP-066"), a veces con la placa en pantalla. |
| 0:20–0:45 | Lore en 2–3 frases del recto, con datos concretos y escalada (140 dB, trabajadores sordos, no hay cura). El ingenuo lo toma literal o lo minimiza. |
| ~0:45–0:50 | Silencio de 1–4 s sin subtítulo (en 4 de 6), con un plano de tensión. |
| 0:50–0:56 | Remate deadpan o visual, y corte seco sin mostrar la consecuencia ("Are you sure that's a good idea?", "I have a plan", "I'll go check"). |

- **Chiste:** ingenuo contra recto, ironía dramática (el público ve el peligro antes), una regla del SCP en una línea como motor y referencias pop baratas ("more cowbell", "I forgor", "neighborino").
- **Loop:** el top 2 (055) es un loop perfecto, porque el final empalma con el inicio. Los demás terminan en abierto, lo que trae comentarios y pedidos de "part 2".

### Subtítulos
- Sans gruesa (Montserrat Black o similar), blanca/amarilla con contorno negro, centrada al ~60–65 % de la altura, 2–6 palabras por bloque.
- **Color por personaje, sin nombres:** blanco = guardia NV, amarillo = guardia camuflado, rojo = tercero (Eric, CI).
- Énfasis en MAYÚSCULAS, ".." para pausas, acotaciones "*music*" y frases cortadas a propósito ("good id..").

### Voces, música y SFX
- **Voces:** casi seguro TTS expresivo tipo ElevenLabs, o voz actuada. Hay titubeos ("uhhh..", "yeah, yeah") y pausas cómicas, sin filtro de radio. Son dos timbres distintos y el recto suena más expositivo. Los terceros tienen voz con eco (Eric) o falso-amable (CI).
- **Música:** prácticamente ninguna. Hay ambiente de instalación y algún stinger o SFX puntual (campana, visor, golpe). El silencio antes del remate es un recurso clave.

### Por qué ganan
- **Eric (1,3M):**
  - Hook sonoro y meme ("Eric?").
  - El SCP está en pantalla y activo todo el video.
  - Datos concretos que escalan.
  - Remate visual: se lanza a cámara.
  - La edición es más calmada que la del resto, así que cortar más no es la clave.
- **055 (793K):** el chiste ES el loop, y eso hace que lo vuelvan a ver.
- **Todos:**
  - Se entienden en mute.
  - El lore se explica, así que no hace falta ser fan.
  - Los roles se reconocen por el look y el color del subtítulo.
  - Duran ~55 s.
  - El final queda abierto.

## B. Modelos 3D (descargados en `assets/scp-models/`, git-ignorado)

La fuente principal es el repo oficial de **SCP – Containment Breach** (https://github.com/Regalis11/scpcb, `GFX/npcs/`), con licencia **CC BY-SA 3.0**. Son modelos de 2012–2014, low-poly (1,5k–17k tris), con rig y animaciones: encajan con el look PS1. El proceso fue `.b3d` → glb con assimp → Blender, que reempaqueta las texturas. Las licencias y la atribución están en `assets/scp-models/LICENSES.md`. Contact sheet: [models_sheet.png](models_sheet.png).

| Modelo | Carpeta | Tris | Rig | ¿Bajado? |
|---|---|---|---|---|
| Guardia de seguridad (casco + P90) | guard-scpcb | 8,0k | sí (36 huesos) | sí |
| MTF Nine-Tailed Fox | mtf-scpcb | 8,2k | sí (63) | sí |
| Clase D / científica (extras) | classd-scpcb, scientist-scpcb | 1,5k | sí | sí |
| SCP-066 "Eric's Toy" (top 1) | scp-066 | 2,8k | sí | sí |
| SCP-966 (top 5) | scp-966 | 10,3k | sí | sí |
| SCP-513-1 (top 6) | scp-513-1 | 11,5k | sí | sí |
| SCP-173 | scp-173 | 4,0k | estatua | sí |
| SCP-096 | scp-096 | 6,5k | sí | sí |
| SCP-106 | scp-106 | 5,6k | sí | sí |
| SCP-049 | scp-049 | 17,5k | sí | sí |
| SCP-939 | scp-939 | 10,5k | sí | sí |
| SCP-682 (solo el brazo, de CB) | scp-682-arm | 0,3k | no | sí |
| SCP-682 completo, low-poly | Sketchfab, Starven38, CC BY-SA | 10,4k | ? | **no** (pide login): https://sketchfab.com/3d-models/none-e40059dbf3334081a1577602b8d98335 |
| Guardias alternativos | Sketchfab, Pixeleur / ThatJamGuy, CC BY | 5–19k | ? | **no** (pide login), URLs en LICENSES.md |

- 055 no necesita modelo (es una placa con "?").
- 409 es un cristal, que se hace en código.
- 2948 y la Chaos Insurgency no están en CB.
- **No usar:** modelos de SCP: Secret Laboratory (propietarios) y los de Sketchfab con licencia NonCommercial.
- **Atribución en cada video:** "3D models: SCP – Containment Breach (Regalis & contributors), CC BY-SA 3.0 · SCP Foundation, scp-wiki.wikidot.com, CC BY-SA 3.0".

## Formato Airy + guardia

### Fórmula adaptada
- **Duración:** 50–58 s, ~110–130 palabras, 14–18 líneas y un plano por línea (~22 planos).
- **Roles:** **Airy = la ingenua curiosa y alegre**, que encaja con su personaje. **El guardia = el recto cansado que sabe el lore**, deadpan.
  - El contraste chica PS1 tierna contra guardia armado y harto reemplaza al dúo de guardias.
  - Variante B para algún episodio: Airy sabe el lore y el guardia es el miedoso.
- **Estructura:**
  1. **Hook (0–2 s):** Airy con una pregunta absurda y el SCP ya en cuadro.
  2. **Setup (2–10 s):** el guardia la frena.
  3. **Placa del SCP (~15 s):** insert de la placa con número y clase, en estilo PS1.
  4. **Lore en 2–3 datos que escalan (20–45 s):** Airy lo malinterpreta de forma literal.
  5. **Silencio de 1–3 s:** plano del SCP.
  6. **Remate deadpan o visual (50–56 s):** corte seco. Uno de cada tres episodios conviene cerrarlo en loop.
- **Subtítulos:** gruesos con contorno negro al 62 % de la altura. **Rosa claro = Airy, amarillo = guardia, rojo = el SCP.** Sin nombres.
- **Sonido:** sin música, o un drone casi inaudible. Ambiente de instalación (zumbido de fluorescentes, ventilación), SFX puntuales (puerta, alarma, stinger en el reveal) y el silencio antes del remate. Para los SFX, usar "sonido pro" (earshot + real-sfx).

### Planos
- Wide de establecimiento solo en el plano 1 (los tres en el pasillo).
- Plano/contraplano 50 mm Airy ↔ guardia, con OTS del otro desenfocado: el `dof` del motor ya lo resuelve.
- Inserts de la placa y del SCP a ras de suelo, en contrapicado.
- Push-in lento en cada plano (la tabla `PUSH` de vera-02) y corte en cada línea.
- Remate: el SCP entra en el lente de 28 mm pegado a la cámara, o aparece detrás en el fondo desenfocado.

### Cómo armarlo en nuestro motor PS1
- **Base:** copiar `pieces/vera-02/` a `pieces/airy-scp-01/`.
  - `engine/sb.js` (escena, loader, `character()`, `holdAt`, `cam`, `addShot`) y `engine/sb_shots.js` (la lista `SB` de planos con `who/line/clip/face/lens` y el modo `?film` sobre `film_timeline.json`) ya hacen diálogo a dos personajes con mouth-levels por hablante (`TL.mouth[V|T]`), DOF en 50 mm y push-in.
  - Los tools (`compose.py`, `film_timeline.py`, `mix_film.py`, `voice_final.py`) se reusan tal cual.
- **Set:** reemplazar el diner por un pasillo de contención hecho con las primitivas de `sb.js` (`box`, `lam`, `basic`, `TX`):
  - Azulejo blanco con textura de 64–128 px y filtro nearest.
  - Franja beige/naranja, puerta blindada con el logo SCP, placa de contención como textura generada en canvas, luz fluorescente fría y una luz de alarma roja para los remates.
- **Airy:** `pieces/upnext-girl2/out/girl2_anim.glb`, con su sistema de caras (face cells + `face_tracks.json`) y los clips de talk/idle que ya usa vera.
- **Guardia:** `assets/scp-models/guard-scpcb/guard-scpcb.glb`. El casco y el visor tapan la cara, así que **no necesita lip-sync**: hablar = cabeceo leve + gesto de mano según el `mouthLv` del guardia.
  - Las animaciones de CB vienen en una sola acción larga. Hay que cortarlas con `THREE.AnimationUtils.subclip` según los rangos de `NPCs.bb` del repo (idle, walk, etc.).
  - Para gestos de hablar, retargetear en Blender los clips de talk que ya tenemos (Airy/Theo), o hacer los gestos procedurales sobre los huesos de los brazos.
  - Bajar las texturas a 128–256 px con nearest para que pegue con el look PS1, y subir la escala a ~1,85 m frente a Airy.
- **SCP:** cargar el glb de `assets/scp-models/<scp>/` con el mismo GLTFLoader, con subclip de su animación y tinte por plano. Al 173 y al 066 les alcanza con un "pop" de posición entre cortes (el 173 se mueve solo cuando nadie mira).
- **Flujo habitual:** guion → humanizer → storyboard (una still por plano, aprobación del usuario) → voces → `film_timeline` → film → QA visual y de sonido → `revisar_render.py` → entrega share.

### Voz del guardia (propuesta, no creada)
- Diseñarla en VoiceStudio con `design_voice`, idioma EN, guardando la versión "clean":
  > "American man, early 40s, deep slightly gravelly voice, tired and deadpan, dry monotone with sarcastic understatement, speaks calmly even about horrible things, short pauses before punchlines, no radio filter."
- **Nombre sugerido:** "voz guardia scp clean".
- **Airy:** sigue con "Voz ashley clean limpia" (`60ea9b99`), con un ritmo un poco más rápido y curioso para que contraste con el guardia lento.

### 5 ideas de episodio (originales: toman la estructura de los hits, no sus guiones)
1. **"Who blinks first" (SCP-173):** Airy hace su primer turno de vigilancia y le pica el ojo. El guardia le explica la regla de no parpadear y ella propone "turnarse para parpadear". Remate: los dos estornudan a la vez, negro y crujido de piedra. Loop: se vuelve al plano inicial con la estatua más cerca.
2. **"Selfie" (SCP-096):** Airy le muestra al guardia una selfie "re linda" que se sacó en el ala de contención. Él hace zoom: al fondo está la cara del 096. Ella: "¿le mando la foto así sale también?" Silencio, grito lejano y corte.
3. **"That's not me" (SCP-939):** desde el pasillo oscuro, la voz del guardia llama a Airy. El guardia, a su lado, le explica qué es el 939 y que imita voces. Remate: ahora es la voz de Airy la que llama al guardia desde la oscuridad… y la Airy que tiene al lado sonríe.
4. **"Just a cold" (SCP-049):** el 049 le dice a Airy que tiene "la pestilencia" y quiere curarla. El guardia explica cómo "cura" el 049. Airy: "Bueno, me dijo que es un resfrío, ¿no?" y estornuda. El 049 entra a cuadro: "I am the cure." Corte.
5. **"Lost phone" (SCP-106):** el celular de Airy cayó por una mancha negra en el piso. El guardia explica la dimensión de bolsillo, que de ahí no se vuelve, y que el 106 corroe todo. Airy: "Ahora vuelvo, tiene todas mis fotos." Remate: el celular vuelve a salir de la mancha, sonando, con una llamada entrante… de Airy.
