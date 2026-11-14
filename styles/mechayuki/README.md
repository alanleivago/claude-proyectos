---
type: spec
status: active
tags: [mechayuki, digger, ps1, megaman-legends, tiktok-shorts, youtube-expeditions, mac-handoff]
relatedTo: [mechayuki-rules, mechayuki-expeditions, digger-channel, zero-fem-model, long-video-delivery]
---

# Mechayuki: guía completa para trabajar el estilo (PC o Mac)

Leer este archivo entero antes de tocar un episodio. Las reglas detalladas, una por cada corrección del usuario, están en [memoria/](memoria/), copiadas tal cual de la memoria de Claude en la PC. Si hay conflicto, **manda la memoria más reciente**. Lo más importante: [memoria/mechayuki-rules.md](memoria/mechayuki-rules.md) para los shorts y [memoria/mechayuki-expeditions.md](memoria/mechayuki-expeditions.md) para los largos.

**En la Mac:** copiar `memoria/*.md` a la carpeta de memoria de Claude Code del proyecto (`~/.claude/projects/<proyecto>/memory/`) y añadir sus líneas al `MEMORY.md` de allá, o pedirle a Claude que lea esta carpeta al empezar.

## 1. El canal

- **Personaje:** Mechayuki (@mechayuki), una androide del futuro lejano. Los humanos desaparecieron y ella desentierra "artefactos humanos" (refrigerador, inodoro, candado, cepillo de dientes…) para entenderlos.
- **Al espectador** le dice "Operator".
- **Estética:** PS1 / Mega Man Legends 2. Low poly, texturas chicas, campos verdes con cielo azul enorme.
- **Modelo:** Zero Volnutt feminizado. Es un modelo COMPRADO, con derechos del usuario.
- **Dos formatos:**
  - **Shorts verticales** (TikTok, 1080x1920, **máximo 80 s**).
  - **Expeditions:** largos horizontales para YouTube, 16:9, de 10 a 11 min.

## 2. Formato vigente de los shorts: ARTEFACTO (desde 2026-11-05)

El formato cat.explains.it ("How people did X before Y", shorts #06–#08) **no funcionó y se abandonó**. Se volvió al formato de artefacto de los ep01–#05, con lugares muy variados.

**Estructura (unas 200 palabras, unos 2,7 palabras por segundo):**
1. **Apertura:** "Operator… [cómo lo encontró]… another human artifact. Humans called it… a [X]." El "Operator…" es el clip aprobado `megagirl_operator.wav` pegado en un silencio, con una pausa de ~0.4 s.
2. **Gancho** absurdo o con asco, en forma de pregunta que sube de tono al final.
3. **Cadena** "If you [do X]… you have a [Y]." con rótulos "This is a…" (3 o más).
4. **Comentario de "Operator [nombre] asks…"** entre el 35 y el 40 % del guion.
5. **Personaje histórico + año**, con "The story goes" si la anécdota es dudosa.
6. **Cierre:** una pregunta-remate, luego "Artifact understood. Logging off."
7. **Outro** sobre el plano en que se despide (nunca pantalla negra): MECHAYUKI · ARTIFACT 00N: NOMBRE · FOLLOW.

**Variedad obligatoria:**
- **Hallazgo:** cada episodio, una forma nueva de encontrar el artefacto. Ya usados: pala (ep01–03), dron que sopla la arena (#09). Ideas: detector de metales, bloque de hielo que se derrite, quitanieves, cae de un árbol, pesca con caña…
- **Lugar:** cada episodio, un bioma o lugar distinto, y en conjunto que domine el verde. Nieve solo si la historia lo pide.
- **Principio y final:** nunca en el mismo lugar ni con el mismo plano.
- **Formato:** algunos episodios pueden ser estilo sinaboto, abriendo directo con "If you [do X]… you have a Y." sin escena de hallazgo. Se decide por episodio.

## 3. Flujo de trabajo (el usuario lo exige)

1. **Proponer** de 3 a 5 temas de artefacto, cada uno con su lugar y su forma de hallazgo, y recomendar uno.
2. **Guion:** usar el gancho puntuado (skill yt-script), pasar el texto por **humanizer**, verificar las fechas con fuentes y guardarlo en `guion.md`.
3. **Storyboard** (planos con su línea) y style frames → **MOSTRAR Y ESPERAR APROBACIÓN.** Aunque diga "procede", primero el storyboard.
   - Antes de mostrarlo, revisarlo uno mismo: ¿lugares repetidos?, ¿ella solo parada?, ¿se lee cada acción?, ¿ojos abiertos?, ¿algo plano?, ¿algo atraviesa la mano?, ¿errores históricos?
4. **Voz:**
   - VoiceStudio, voz **megagirl** (clon `baab32b2`), cadena limpia (filtro de graves ~170 Hz + compresión suave + −14 LUFS). Nunca el filtro "digger" ni retro.
   - Revisar cada toma con Whisper contra el guion, más similitud de voz (`speaker_sim.py`) contra los párrafos aprobados.
   - Las preguntas deben subir de tono; si no, rampa PSOLA en la última palabra.
5. **Render:** el motor three.js PS1 renderiza sin pantalla con Playwright.
6. **Revisión:** `python tools/revisar_render.py --estilo mechayuki video.mp4` (usa los créditos de la API) → **arreglar TODOS los fallos válidos uno mismo** → volver a renderizar → recién ahí mostrar. Una sola pasada propia; no encadenar v2, v3, v4…
7. **Entrega:**
   - Título viral (yt-package), más una portada vertical de 1080x1920 (shorts) o una miniatura de 1280x720 (largos) en el estilo A1.
   - Los archivos se llaman como el título, sin `? : " /`.
   - Va la versión share (libx264 CRF 24, AAC 192k, +faststart) a LucidLink, en `Renders finales claude/Mechayuki/<Título>.mp4`, y la portada a `Mechayuki/Miniaturas/<Título>.png`.
   - Al lado va el caption `.txt`: título + emoji + hashtags (#history #… #mechayuki #shorts).
   - Ya no se envía a Telegram.
   - Después de entregar, borrar los renders superados.

## 4. Reglas de imagen (resumen; el detalle está en mechayuki-rules)

- **Animación:** ella siempre animada y el mundo reacciona. Cada acción se entiende (qué hace, qué tiene en la mano) y tiene su sonido.
- **Que se lea:** cada acción en primer plano o encuadrada para que se vea. Las manivelas, las perillas y las herramientas van en contacto real con la mano.
- **Contacto:** las manos nunca atraviesan objetos. Los objetos están APOYADOS en superficies, nada flota. Nunca cortada por el borde del cuadro.
- **Cara:** ojos abiertos en los planos clave, cara visible (no de perfil ni tapada por el flequillo) y expresiones que coinciden con la línea (asco real en "Gross").
- **Volumen:** NADA PLANO. Diagramas y paneles en 3D con volumen. Rótulos en letras 3D extruidas amarillas, legibles, nunca encima de su cara.
- **Cada solución o época en su PROPIO lugar reconocible**, nunca el mismo cuarto. Ella prueba o usa cada objeto.
- **Personajes históricos:** un NPC existente que se vea bien, más piezas de vestuario (corona, capa, abrigo). Nunca un modelo nuevo hecho a medida (el Enrique VIII a medida quedó horrible). Sombreros PS1 pegados al hueso de la cabeza.
- **Caca:** siempre estilo anime, en espiral tipo emoji.
- **Efectos:** muchos (líneas de temblor, chispas, polvo, destellos). Sombra bastante oscura.
- **Subtítulos:** una palabra a la vez, fuente pixel tipo Pixelify, con el pop-in medido (0.86→1.05→0.98→1.0) y letras espaciadas.
- **Prados:** como los de MML2 (lomas verdes, cielo grande, nubes, arcoíris, franja de acantilado tostado). Referencia: `pieces/expedition-01-bedroom/review/ref_mml2_prado.png`.
- **Sin parpadeo** (z-fighting) en flores y pasto. Cámara continua, sin saltos hacia atrás.

## 5. Sonido

- **Música:** NO chiptune puro. Pista original juguetona, con bajo real y batería suave, de 105 a 112 BPM, en tono mayor. Hecha en código: `audio/scripts/music*.py`.
- **Niveles:** voz unos 14 dB sobre la música mientras habla. Master a −12 LUFS, pico real ≤ −1 dBTP. Pausa de ~0.4 s después de "Operator…".
- **SFX:** reales CC0 (Freesound, Openverse, real-sfx), uno en cada acción. Elegirlos y verificarlos con **earshot**.
- **Créditos:** solo CC0 o CC-BY; los CC-BY van en la descripción.
- **NUNCA "!" en ningún texto para la voz:** cambia el timbre y suena horrible. Usar "…" o ".".
- **Cortes:** nunca cortar la voz dentro de una palabra ni la última palabra de una pregunta.

## 6. Portadas y miniaturas (estilo A1 aprobado)

- **Referencia:** `pieces/expedition-01-bedroom/miniatura_A1.png`, también en LucidLink `_assets-mac/referencias/`. El código está en `engine/thumb_shots*.js` + `thumb_compose*.py` (fuente Luckiest Guy).
- **Fondo:** domo de cuadrícula cian/azul curvo. Puede variar: en el ep03 fue un muro de piedra con puerta marrón.
- **Texto:** una línea corta en letras 3D grandes con jitter por letra, #FFE21A con extrusión ámbar #A87800, **sin contorno negro**.
- **Ella:** cuerpo COMPLETO de cabeza a pies, **GRANDE (casi toda la altura)**, OJOS ABIERTOS, con una pose ligada al short (manos en la cintura, pensando, sosteniendo el objeto, manos a la cara…).
- **Objeto:** un artefacto grande con destellos.
- **Prohibido:** realce de brillo y la fuente de Ava.
- **Antes de mostrarla:** revisarla al 100 % y en recortes ×4.

## 7. Episodios hechos (estado al 2026-11-14)

| # | Pieza | Título final | Formato | Estado |
|---|---|---|---|---|
| 01 | digger-01-fridge | (refrigerador) v3 | artefacto | **NIVEL APROBADO** ("perfect now") |
| 02 | digger-02-toilet | (inodoro) v3 | artefacto | entregado |
| 03 | digger-03-lock | The Unpickable Lock Lasted 51 Hours | artefacto | entregado + portada aprobada |
| 04 | digger-04-alarm | People paid someone to shoot peas at their window | sinaboto/artefacto | entregado + portada aprobada |
| 05 | digger-05-two-sleeps | You Wake Up at 3 AM Because of This 600-Year-Old Habit | sinaboto | entregado + portada aprobada |
| 06 | digger-06-bathing | The 1767 Shower That Recycled Your Dirt | cat.explains (abandonado) | aceptado |
| 07 | digger-07-navigation | 1,000 Years of Getting Lost Before GPS | cat.explains (abandonado) | aceptado |
| 08 | digger-08-music | 300 Years of Music Before Spotify | cat.explains (abandonado) | entregado con fallos de manos sin arreglar |
| 09 | digger-09-toothbrush | Your Toothbrush Was Pig Hair Until 1938 | **artefacto (vuelta)** | entregado; quedó pendiente preguntar si se hacía una pasada de arreglos (ver abajo) |
| Exp01 | expedition-01-bedroom | How Did Humans Sleep Before Beds? An Android Digs Up 8 Clues | largo 16:9 | **NIVEL APROBADO para los largos** (v3) |

**Pendiente del #09** (marcado por la revisión; el usuario no respondió si arreglarlo):
- las cerdas no tocan el hueso en el chiste de "scrub your bones";
- el borde la corta en 6 momentos breves;
- la barrena de Addis queda por encima del hueso;
- rayas rosas en el abrigo de Addis;
- en "germs" gira la cara de perfil;
- las hélices del dron le tocan el zapato;
- la portada la muestra chica: debe ocupar casi toda la altura.

## 8. Propuestas de próximos videos

Ver [PROPUESTAS.md](PROPUESTAS.md).

## 9. Dónde está cada cosa

**En git** (público, solo código y docs):
- `pieces/digger-0N-*/`: motor por episodio.
  - `engine/film.js`, `main.js`, `shots.js`, `d0N_*.js` (planos), `fx.js`, `pixfont.js`, `menukit.js`, `render_film.mjs`
  - `audio/scripts/`, `voz/`, `LOG.md` (tabla PASS por plano), `guion.md`, `DESCRIPCION.md`, `CREDITS.md`
- **Para un short nuevo:** copiar la carpeta del último episodio (`digger-09-toothbrush`) como plantilla.
- `pieces/expedition-01-bedroom/`: plantilla de los largos.
- `pieces/voice-fx/`: `retro_voice.py`, el README con las mediciones y `splice_operator.py` (está en `digger-02-toilet/voz-studio/scripts/`).
- `fuentes/`:
  - `cat-explains-it/`: el análisis del formato abandonado;
  - `mechayuki-largo/analisis-viralidad.md`: fórmulas de títulos y las 5 expediciones recomendadas;
  - `tiktok-research/`: la investigación original del nicho;
  - `megaman-legends2/` y `lowpolyshorts-style/`: la especificación de las letras 3D.

**En LucidLink**, `Renders finales claude/Mechayuki/_assets-mac/`. Son cosas que **NO pueden ir a git** porque el repo es público: el modelo es comprado y hay audios.
- `engine-models/*.glb`:
  - incluye `zero_anim.glb`, la androide con sus 30 animaciones;
  - en la Mac → `pieces/<pieza>/engine/models/`.
- `engine-lib-models/*.glb`: los NPC y los vehículos → `pieces/<pieza>/engine/lib/models/`.
- `voz/`:
  - `megagirl_operator.wav` y su versión limpia → `pieces/voice-fx/`;
  - `megagirl_clone_ref_baab32b2.m4a` = el audio de referencia para RE-CLONAR la voz megagirl en el VoiceStudio de la Mac; el profile_id nuevo cambiará, así que anotarlo.
- `crashsune/`:
  - el `.blend` original comprado de Zero Volnutt → `assets/crashsune/`.
- `megaman legends sfx general/`:
  - SFX de menú sacados del juego → `assets/`;
  - posible reclamo de Content ID en YouTube monetizado: allí, cambiarlos por CC0.
- `pieces/zero-fem/`: el pipeline de feminización, cara y animación con sus derivados (texturas, atlas, `anim/zero_anim.glb`) → `pieces/zero-fem/`.
- `pieces/lib-mml/`: assets de relleno de MML2 recoloreados → `pieces/lib-mml/`.
- `referencias/`: `digger01_megagirl_v3.mp4` (nivel aprobado), `digger02_toilet_v3.mp4` y `miniatura_A1.png`.
- Los videos finales con su título están en `Mechayuki/` y sus portadas en `Mechayuki/Miniaturas/`.

**Instalación en la Mac:**
1. Ejecutar `npm install` en el `engine/` de cada pieza (hace falta Playwright con Chromium).
2. Python: numpy, scipy, soundfile y pyloudnorm para la música y la mezcla; openai-whisper para revisar la voz.
3. VoiceStudio con la voz re-clonada.
4. earshot.
5. La `ANTHROPIC_API_KEY` va en el `.env` de la raíz (nunca como variable del sistema), para `revisar_render.py`.

## 10. Seguridad y límites

- **Repo PÚBLICO:** nunca subir el modelo comprado, sus texturas, renders del modelo sin terminar, ni assets sacados de juegos. Revisar `git status` antes de cada commit; `*.glb`, `assets/` y `*.wav` ya están en el .gitignore.
- **Voces:** nunca clonar la voz de las cuentas de referencia.
- **Música:** nada de canciones con copyright; solo original o CC0.
- **Marca:** evitar logos y nombres de Capcom en títulos y miniaturas.
- **Publicación:** confirmar con el usuario cada publicación (Zernio).
- **Créditos:** usar primero los créditos de la API (scripts) para revisiones y análisis.
