# cartoon3d — YouTube Shorts estilo Ricks Clips (guía completa)

Guía autosuficiente para hacer un short nuevo de la serie desde cero, en cualquier máquina (PC Windows o Mac). Si algo
de aquí choca con una nota de `memoria/`, manda la nota más reciente (fecha en la nota). Última actualización:
2026-11-11, tras lost-luggage (APROBADO y enviado).

> **NIVEL APROBADO (2026-11-12): `pieces/trash-library`** — el usuario: "quedó excelente, este es el nivel que quiero para estos videos". Todo short cartoon3d nuevo arranca copiando trash-library: cámara secuencial Ricks (`seqCam`/`CAMSEQ`, un plano continuo por set, whips entre sets; ver `fuentes/cartoon3d/camara-secuencial-ricks.md`), grade Ricks de `shots.js` COLOR, `stableShadow` + gemelos de sombra, `pose({look, heading})`, props en capa FOCUS + oclusores de profundidad, sets densos y detallados, y las lecciones de §9 "trash-library v2". Sonido: copiar `pieces/trash-library/sound`.

**Qué es:** shorts verticales en inglés (1080×1920, 30 fps, 60,5 s) que cuentan un hecho real y raro como una escena
("You walk into…"). Personajes 2D-3D dibujados en código (`toon.js`: cabeza redonda blanca, cara de kit, brazos de
goma, manos-punto), dentro de sets 3D densos de three.js con luz, sombras y color diseñados. Cámara siempre en
movimiento, cortes sobre la palabra, subtítulos de 1 palabra, música pizzicato desde el frame 0 y muchísimos SFX reales.
Meta del usuario: **replicar Ricks Clips lo más posible**; cuando un tutorial y las refs difieren, mandan las refs.

**Plantilla:** copiar `pieces/lost-luggage` (la más avanzada). Le siguen `pieces/guinea-rent` (primera con toon.js y
mascotas) y `pieces/cheese-bank` (última con sprites Flow, legado). `pieces/toon-test` es el banco de pruebas de
personajes. `pieces/mistaken-orders` fue el #1 del lote 04 (primer cableado de la cámara SNAP).

---

## 0. Antes de empezar en una máquina nueva (Mac)

Lo que NO viaja por git y hay que tener instalado o copiado aparte:

| Qué | Para qué | Dónde en el PC |
|---|---|---|
| **Skill `animate`** (`~/.claude/skills/animate/`: `tools/*.mjs` y `kit/*.js`) | build, still, storyboard y export. El `piece.json` de cada pieza incluye `kit/core.js`, `kit/morph.js`, `kit/board.js` y `kit/score-*.js` de ahí | `C:\Users\Alan Leiva\.claude\skills\animate` (copiar la carpeta entera si falta en el Mac) |
| Node + Playwright (Chromium) | export.mjs renderiza los frames en el navegador | — |
| ffmpeg / ffprobe | mux, beds, QA | — |
| Python 3 + `numpy scipy soundfile pyloudnorm pillow faster-whisper anthropic` | voz, sonido, QA, revisión | — |
| **VoiceStudio** (app + servidor local `http://127.0.0.1:3900`) con la voz **"3D cartoon 2"** | la voz | `%LOCALAPPDATA%\Programs\VoiceStudio`; datos en `%APPDATA%\OmniVoice` |
| `~/.freesound.json` (`{"api_key": "..."}`) | `fs_fetch.py` baja SFX CC0 | cada máquina tiene su clave (nunca al repo) |
| earshot (MCP + skills `earshot`/`real-sound`) | elegir y criticar SFX | `F:\earshot` |
| `sound-layer/kit/` (git-ignorado) | `sound-layer/scripts/mix.py` usa los tipos del kit (whoosh, pop, tap, click, shimmer) | reconstruir con `python sound-layer/scripts/sfx.py kit` (ver `sound-layer/README.md`) |
| `.env` en la raíz con `ANTHROPIC_API_KEY` | `revisar_render.py` (créditos API) | cada máquina el suyo |
| Media de referencia de Ricks (sección 12) | comparar lado a lado | `refs-ext/`, `Ref 3D cartoon animations/` (git-ignorados) |
| Memoria de Claude | reglas del usuario | copia en `styles/cartoon3d/memoria/` (copiarlas a la carpeta de memoria del proyecto en el Mac si se quiere que carguen solas) |

**La voz en el Mac:** el id `d9b69bea` es local del PC. En el Mac hay que tener la MISMA voz: o clonarla de nuevo en
VoiceStudio desde el audio de referencia original (pedírselo al usuario o copiar el perfil desde
`%APPDATA%\OmniVoice` del PC), y poner el id nuevo en `voice/gen_takes.py`. La misma semilla en otro hardware
(MPS contra CUDA) puede no dar exactamente la misma toma: los takes ya entregados no se regeneran, solo los nuevos.
**Hecho (2026-11-11):** en el Mac la voz es el perfil **"3d cartoon" `227af074`** (la de punkpolyshorts/doggo). Todos los
`voice/gen_takes.py` eligen el id por máquina: `"227af074" if sys.platform == "darwin" else "d9b69bea"`; mantener ese
switch al copiar `gen_takes.py` a una pieza nueva.

---

## 1. Flujo por video (en este orden, sin saltarse pasos)

1. **Guion** (sección 2). Mostrar solo el texto limpio. El lote 04 ya está escrito: `scripts/cartoon3d-guiones-04.md`.
2. **8 tomas de voz** con `voice/gen_takes.py` (semillas 11-18). Imprime para cada toma la duración, las diferencias
   contra el guion (whisper) y los huecos > 0,45 s.
3. **El usuario elige la toma** (pasarle las 8, con la lista de diffs). No elegir por él salvo que lo pida.
4. **Apretar las pausas SOLO en silencio** (`voice/words.py` + `voice/tighten.py`): nunca cortar dentro de una
   palabra, nunca cortar el final ni el arranque de una palabra.
5. **Rellenar a 60,5 s** con 2-3 **gags sin palabras** de 1,0-1,2 s insertados en finales de frase (`voice/gaps.py`)
   y un **gag de cierre** después de la última palabra hasta 60,5 s. Así el video dura 60,5 s exactos (1815 frames).
6. **Storyboard:** `node ~/.claude/skills/animate/tools/storyboard.mjs pieces/<p>` → `storyboard.png` (un panel por
   plano). **Mostrarlo SIEMPRE y esperar el OK**, aunque el usuario haya dicho "procede al render". Iterar
   (`storyboard_v1/v2/v3.png`).
7. **Video mudo:** `node ~/.claude/skills/animate/tools/export.mjs pieces/<p> --no-audio --no-captions --workers 6 --gpu`.
   **El export SOBRESCRIBE `renders/final.mp4`** con video sin audio: renombrarlo enseguida a
   `renders/<p>_silent_vN.mp4`.
8. **QA y correcciones** (sección 9): `short_qa.py`, hojas cada 0,25-0,5 s, checklist de bugs; arreglar y volver al
   paso 7 (v2, v3…). Mostrar el mudo al usuario si hay cambios grandes.
9. **Final con sonido** (sección 8): `events.py → make_cues.py → beds.py → remix.py`. `remix.py` muxea el mudo
   (`../renders/<p>_silent_vN.mp4`, actualizar el nombre) con `audio/final_mix.wav` → `renders/<p>.mp4` y lo copia a
   `renders/final.mp4` (el `final.mp4` entregado SIEMPRE lleva audio).
10. **Revisión por API:** `python Tools/revisar_render.py --estilo cartoon3d pieces/<p>/renders/<p>.mp4`
    (deja `<p>_revision.md`). En el Mac la memoria no tiene las notas: usar
    `--reglas styles/cartoon3d/memoria/cartoon3d-style.md styles/cartoon3d/memoria/cartoon3d-level.md styles/cartoon3d/memoria/cartoon3d-rules-2.md styles/cartoon3d/memoria/cartoon3d-toon-chars.md`.
    Ojo: el script está en `Tools/` (T mayúscula) en git; en un disco sensible a mayúsculas la ruta es `Tools/`.
11. **Título viral + `caption.txt`:** título corto de TikTok/Shorts con 1 emoji (+ hashtags en `piece.json` →
    `title`), y `caption.txt` = título, 1-2 frases con el dato y el gag, una pregunta CTA con 👇, 8 hashtags. Ver
    `pieces/lost-luggage/caption.txt` y `pieces/guinea-rent/caption.txt`.
12. **Telegram — SOLO en el PC Windows** (regla de `CLAUDE.local.md`, no existe en el Mac; `tools/enviar_telegram.py`
    está git-ignorado): `python tools/enviar_telegram.py pieces/<p>/renders/<p>.mp4 "<título TikTok con emoji y 4-5
    hashtags>"`. Dar al usuario la ruta absoluta del mp4. Copiar SOLO el final a `pieces/3D cartoon rickclips/NN - Título.mp4`.
    En el Mac: entregar la ruta y el título; el envío lo hace el PC.

---

## 2. Guion

Reglas completas en `styles/cartoon3d/GUIONES.md`. Resumen:
- ~205-215 palabras → ~55-58 s de voz (más los gags = 60,5 s). Inglés oral, frases cortas, "So," "But," "Then,".
- Estructura: gancho-contradicción en la 1.ª frase → escena en 2.ª persona ("you") → escalada en pasos cortos → un
  secundario con UNA línea burlona → giro → **"You see,"** + el mecanismo real explicado simple → remate que cierra el
  gancho (callback).
- Cada cláusula = un plano (escribir pensando en algo que se pueda MOSTRAR). Números pocos y redondos, cada uno es un
  objeto en pantalla.
- **Nunca "!"** en el guion (la voz suena horrible). La energía viene de `guidance_scale` 3.0 y de elegir la toma.
- Pasar el guion por la skill **humanizer** antes de generar la voz. Entregarlo SOLO como texto para copiar/pegar.
- Temas: hechos reales verificables, atemporales en presente (mayoría). Antes de elegir, comprobar en YouTube que
  nadie hizo ya ese short animado.

---

## 3. Voz (VoiceStudio)

`pieces/<p>/voice/gen_takes.py` (copiar de lost-luggage). Ajustes exactos usados en guinea-rent y lost-luggage:

```
POST http://127.0.0.1:3900/v1/audio/speech
{"model": "omnivoice", "input": <script.txt>, "voice": "d9b69bea", "response_format": "wav", "num_step": 32,
 "language": "English", "seed": 11..18, "guidance_scale": 3.0, "duration": 56.0}
```
- **Voz:** `d9b69bea` = **"3D cartoon 2"** (el usuario la re-clonó; la primera, "3D cartoons" `d9ac3ed9`, dejaba
  fragmentos de voz sueltos — no usarla). `num_step` 32 siempre (nunca bajar calidad), wav siempre.
- **duration:** el largo objetivo de la toma en segundos. lost-luggage 56.0, guinea-rent 59.0, cheese-bank 61.0
  (antes de existir los gags). Para el formato actual: ~55-57 s, y el resto lo ponen los gags. No hay parámetro de
  velocidad: el ritmo sale de `duration` + apretar pausas.
- Remuestreo a **48 kHz** mono (`scipy.signal.resample_poly`), guardado en `voice/takes/take_<seed>.wav`.
- **Chequeo whisper:** faster-whisper `large-v3` (CPU int8) transcribe cada toma y la compara con el guion
  (`difflib`): las tomas repiten o se comen palabras; descartar las que tengan diffs. También lista huecos > 0,45 s.
- `instruct` solo acepta acento/edad/tono/susurro (no emoción). Si una palabra sale mal en la toma elegida, se puede
  empalmar la misma frase de otra toma cortando en silencios.

**Tomas usadas** (los wav están git-ignorados; se regeneran con la misma semilla — ver nota de hardware arriba):
| pieza | toma | notas |
|---|---|---|
| mistaken-orders (#1) | take_13 | `take13_tight.wav` |
| cheese-bank (#2) | take_11 | `take11_tight.wav` |
| guinea-rent (#3) | take_12 | duration 59 |
| lost-luggage (#4) | take_12 | duration 56; pausas apretadas 56,42 → 55,31 s, + 3 gags (+3,2 s) = 58,51 s, cierre hasta 60,5 |

**Pipeline de pausas (lost-luggage, el bueno):**
1. `python voice/words.py voice/takes/take_12.wav voice/raw_words.json` — tiempos por palabra (whisper large-v3,
   `word_timestamps`, beam 5; formato `[{"w","s","e"}]`).
2. `python voice/tighten.py` (poner `SRC` = la toma elegida) → `voice_tight.wav` + `cuts.json`. VoiceStudio no deja
   silencio muerto (rellena con decaimiento/respiración a −25..−50 dB), así que una pausa = la racha más larga bajo
   −24 dBFS dentro de cada hueco de whisper; solo se recorta del NÚCLEO profundo (< −36 dB, deja ≥ 0,05 s de él):
   pausa de frase → 0,20 s, de coma → 0,15 s, cola final 0,40 s, crossfade 12 ms. Las consonantes finales y las
   respiraciones no se tocan.
3. `python voice/words.py voice/voice_tight.wav voice/words_tight.json`
4. `python voice/gaps.py` — `GAPS = [(palabra_final_de_frase, dur), …]` + `want` (qué aparición de esa palabra).
   Inserta silencio en el punto más silencioso (assert < −42 dB) de esa pausa → `voice/voice.wav` + `voice/words.json`
   (tiempos corridos) + `gaps.json`.
5. `src/words.js` = `const WORDS = <contenido de voice/words.json>;` (una línea). Todo se sincroniza a esto.

**Volumen de la voz en la mezcla:** `remix.py` sube la voz +2 dB y mide todo contra ella (sección 8). La voz debe
quedar claramente por encima de todo.

---

## 4. Estructura de una pieza

```
pieces/<p>/
  piece.json        name, title (= título TikTok), format {1080, 1920, fps 30, duration 60.5, frames 1815}, style "cartoon3d",
                    build: [src/head.html, kit/core.js, styles/pov3d/three.js, style, styles/cartoon3d/toon.js,
                            styles/cartoon3d/toon-pets.js, styles/cartoon3d/setlook.js, styles/cartoon3d/exterior.js,
                            styles/cartoon3d/color.js, src/words.js, src/scenes.js, src/common2.js, src/shots.js,
                            src/set-*.js…, src/bridges.js, kit/morph.js, kit/board.js, kit/score-head.js, src/score.js,
                            kit/score-tail.js]   ("style" = styles/cartoon3d/kit.js)
  script.txt        el guion en una línea
  shots.md          lista de planos (tabla t0 / dur / set / qué se ve) + gags
  caption.txt
  src/shots.js      flags del look, COLOR (guion de color por set), SHOT_LIST [id, t0, set, qué se ve], cortes,
                    whip, dissolves, grade, subtítulo, storyboard
  src/common2.js    helpers: camMove/snapKeys/snapBox (cámara), CAST (elenco), toonPerson/pose/petAt, gripDot,
                    texturas de carteles, sellos, burbujas, polvo
  src/set-<lugar>.js  un archivo por set: construye la escena una vez y registra SHOT_FN[id] y SNAPS[id]
  src/scenes.js     texturas comunes (inked() encoge el texto para que nunca se salga del cartel)
  voice/            gen_takes.py, words.py, tighten.py, gaps.py, *.json
  sound/            events.py, make_cues.py, beds.py, remix.py, fs_fetch.py, sfx_pick.json, beds_pick.json
  assets/           fotos/pósters de Flow que se mapean en el set (git-ignorado por la regla global assets/ → se
                    añaden con git add -f, solo si son nuestros)
  renders/          (git-ignorado)
```
- `node ~/.claude/skills/animate/tools/build.mjs pieces/<p>` arma `index.html` (lo corren still/export también).
- `node ~/.claude/skills/animate/tools/still.mjs pieces/<p> 0.5,2.6,4.3 out.png [--scale 0.5]` = fotogramas sueltos.
- Varios agentes pueden construir sets en paralelo (cada uno su `set-*.js`).

**Flags del look en shots.js (lost-luggage):**
```js
C3_HD = true; T3.hairDetail = 1.4;            // HD finish + mechones con brillo en todos los peinados
C3_VIVID = Object.assign({}, C3_VIVID_MRO, { b: 1.2, c: 1.04, s: 1.18, vib: 0.42, bgBlur: 0.85 });
C3_INK2 = Object.assign({}, C3_INK2_DEF, { bg: false, px: 2.6 });   // SIN tinta en el set, fina en los personajes
C3_SHADOW = Object.assign({}, C3_SHADOW_DEF, { catch: 0.36, tint: '#3a48a8', key: 0.95, dark: 1.05, type: 'vsm',
  radius: 4, blurSamples: 10, size: 4096, bias: -0.0005, normalBias: 0.05, maxRad: 110 });          // sombras VSM suaves
C3_AO = { r: 2.2, k: 0.85, bias: 0.15, blur: 2.0 };                 // SSAO (setlook.js)
C3_SNAP = Object.assign({}, C3_SNAP_DEF, { blur: 8, blurMin: 99 }); // sin motion blur de cámara
C3_CAMFX = { ...C3_CAMFX_DEF, punch: [], kicks: [[t, k], …], roll: {} }; // solo patadas en impactos reales
```
Cierre de cada frame (en `sceneApple`): `c3Grade(COLOR[set].grade)` → `c3Crisp(0.5)` → `c3Subtitle(WORDS, t)`. Sin
grano. Las tarjetas de personaje no reciben sombras proyectadas (caras siempre iluminadas) y llevan una luz ambiente
neutra-cálida propia (`face` en COLOR).

---

## 5. Personajes — `styles/cartoon3d/toon.js` (+ `toon-pets.js`)

Desde 2026-11-08 los personajes se dibujan EN CÓDIGO (tarjetas Canvas2D 2D-3D iluminadas por el set). **Nunca Flow
para personajes**, nunca los sprites viejos `c3Person`. Aprobado en `pieces/toon-test` v5.

**API**
- `c3ToonChar(o)` → persona. `o = { key, skin (white|peach|tan|brown|pale), hair, hairColor, outfit, colors:{main,
  shirt, tie, apron, collar, vest, band, belt, cord, pocket…}, glasses, moustache, stubble, shoes, body, head:{…},
  scale, headK }`.
  - `hair`: mop, side, bowl, messy, bob, curly, bun, topknot, long, ponytail, balding, short, tuft, spiky, bald.
  - `hairColor`: brown, dark, black, grey, white, ginger, blond, auburn, chestnut (o un `#hex`).
  - `outfit` (traje de ROL): suit, guard, apron, hivis, sweater, polo, shirt, hoodie, vest, dress, robe.
  - `body` (tipo y forma de torso-frijol): avg, thin, fat, tall, short, pear, kid.
- `c3ToonPose(p, cam, t, o)` — llamar DESPUÉS de poner la cámara. `o = { expr, blink, gaze:[x,y], facing, mode:
  stand|walk|sit, phase, stride, stop, sit, seat, hand:{L,R}, prop:{L,R}, lean, tilt, light, idle, talk, gesture,
  fx:'sweat'|'sparkle'|'blush', squash }`.
- `c3ToonSitCurve(u)`, `c3ToonHandWorld(p,'R')` (posición de la mano en el mundo), `c3ToonDims(p)` → `{hip, height}`.
- `c3ToonGripDot(p, 'R', cam, show)` — la mano que agarra dibujada ENCIMA del objeto 3D con los píxeles de la propia
  tarjeta (mismo color y luz). Usarla siempre que una mano sostenga algo 3D (en common2: `gripDot(s, who, 'R')`). Los
  discos de piel sin luz que había antes salían como **puños blancos** — no volver a eso.
- `over: true` en una mano (`hand: { L: { h, pole, front: true, over: true, hand: 'grip' } }`) = esa mano se dibuja
  encima del brazo y del objeto que sostiene la otra (mano sobre la valija).
- Presets de brazo (`hand.L/R`): down, rest, hip, talk, talk2, talkIn, shrug, wave, up, point, desk, front, chin, hold,
  holdUp, cross, cross2, pocket, lap, sip; o `[out, down]`, o `{h:[x,y], pole, front, over, hand: dot|open|grip|point}`,
  o keyframes `[[t, preset], …]`.
- **Expresiones** (`expr`): neutral, smile, happy, grin, laugh, talk, talkO, smug, skeptical, bored, deadpan, nervous,
  worried, surprised, shock, excited, angry, strain (`> <` + dientes), sad, thinking, determined.
- Mascotas: `c3ToonPet(o)` / `c3ToonPetPose(pet, cam, t, o)` (cobayos: fur, patches, muzzle, ear, tuft, old, size;
  pose: hop, squash, halo, spin, walk = correteo) y `c3ToonSnake` / `c3ToonSnakePose`. Mismo kit de cara.

**Reglas aprobadas (v5 + correcciones de guinea-rent y lost-luggage)**
- **Cabeza** casi redonda, blanca, con sombreado de esfera. **Cara de kit CENTRADA** en frente y 3/4 (no se desliza al
  girar); solo un perfil real (|facing| > 1,3) la corre al borde. **Sin nariz** en ninguna vista.
- **En perfil la cara se ve COMPLETA**: 2 ojos, 2 cejas y boca (nunca un ojo solo sin boca).
- Ojos: óvalos negros chicos con a lo sumo UN brillito; susto = anillos blancos grandes con pupila; cejas cortas y
  gruesas que llevan la emoción.
- **Pelo pegado a la cabeza**, se mueve con ella, con volumen y un brillo suave (`T3.hairDetail = 1.4`). Nada flotando.
- **Brazos de goma**: arco en C que se curva ≥ 22 % de su tramo, sale del BORDE del torso justo bajo la cabeza
  (0,2 de la altura del torso), sin codo quebrado; brazos arriba en U/cactus por fuera de la cabeza.
- **Manos = punto** sin dedos que agarra DE VERDAD (gripDot): los objetos sostenidos no flotan frente al torso.
- **Timing Ricks:** pose a pose con snap (`t3Snap`: ~67 % del movimiento en 4 de 10 frames, asentado a 0,33 s, sin
  rebote ni motion blur) y luego **quietud total** 0,7-2 s (sin respiración ni balanceo). Las claves de brazo empiezan
  SOBRE la palabra. **Las caras cambian de golpe** (por pasos). Cabeza y cuerpo con horarios de hold independientes.
- **Caminar:** `facing` + = derecha de pantalla (en toon-test estaba invertido → **moonwalk**). `phase` = distancia /
  `stride` (pasar el mismo `stride` en unidades de mundo por ciclo); el pie apoyado retrocede a la velocidad del
  suelo, cadera baja en los contactos, brazos en contra; `stop` (0..1) frena los últimos pasos. Zancadas largas en V.
- **Sentarse** con anticipación + aplaste de contacto + asentado (`c3ToonSitCurve`).
- **Nada de accesorios que Ricks no usa:** sin credenciales, lanyards, correas de cámara, plumas, barbas largas.
  Bigote solo del color del pelo.
- Elenco con traje de rol; **peinados, colores y trajes que NO se repitan entre videos** (ver `CAST` de cada pieza:
  guinea-rent usó mop/chestnut/hoodie, bun/white/sweater, side/dark/suit; lost-luggage usó tuft/ginger/shirt,
  bob/black/suit, short/brown/apron, ponytail/blond/apron, balding/grey/polo+bigote, curly/auburn/dress,
  spiky/black/hoodie, messy/dark/hivis, side/white/vest+gafas).
- Pendientes: sombreros (boina, gorra de rayas, bombín, chistera, ranger — en Ricks distinguen a los personajes),
  torsos más angostos (0,55-0,65 W).

---

## 6. Sets y color

**Sets**
- **GRANDES**, con espacio para que la cámara orbite, haga grúa y travelling (guinea-rent quedó chico). Varios
  ambientes por archivo (lost-luggage `set-airport.js`: hall con cinta 4, mostrador, jaula de objetos perdidos,
  depósito).
- **Densos como Ricks**: cuadros, reloj, calendario, corcho con notas, pósters, carteles con subtexto, escritorio con
  monitor/teclado/teléfono/papeles/taza, alfombra con borde, plantas de hojas grandes, zócalos, molduras, apliques,
  charcos de luz. Paredes saturadas (amarillo, teal, ultramar…), nunca crema pálida + fondo pálido (se ve lechoso).
  Una paleta dominante por cuarto + 1-2 acentos. Paredes que tapen todos los huecos.
- **Sin tinta en el set** (`C3_INK2.bg = false` + `c3SetLook(..., { inkSet: false })`); la tinta solo en personajes.
- `styles/cartoon3d/setlook.js` — `c3SetLook(scene, { grime, scale, floorY, inkSet:false, lights:[[x,y,z,'#hex',I,dist]…],
  bounce:['#cielo','#suelo',k], shafts:[[[a],[b],r0,r1,'#hex',op]…] })` al FINAL del build de cada set: texturas
  procedurales en espacio de mundo (manchas, grano, chorreado en paredes, suciedad en el pie de las paredes, rayones
  en el piso, rugosidad variable), luces prácticas, rebote, haces de luz. `c3AOPass` = SSAO (`C3_AO`).
- Sombras **VSM suaves** (flags arriba). Interiores: techos/paredes con `noCast` (si no, el techo sombrea todo el
  cuarto y no se lee ninguna sombra). El shadow-catcher NUNCA azul saturado (vuelve magenta los rojos): casi negro
  (#1e1e40…) y el frío viene de la luz de relleno.
- `styles/cartoon3d/exterior.js` — `c3SkyDome(scene, { paint: true, zenith, mid, midH, horizon, glow, glowK, ground,
  sun, clouds })` cielo pintado con cúmulos (luz crema arriba, panza lavanda, más chicos y con neblina hacia el
  horizonte); `c3Backdrop(scene, {...})` capas de profundidad (árboles, edificios bajos, colinas que se funden en el
  horizonte) para ventanas y fondos de calle; `c3Car({ color, kind: sedan|hatch|pickup|suv })` autos redondeados (nunca
  cajas); `c3LeafTree` / `c3PineTree`. Exteriores también `c3Fog`.
- Polvo/partículas en el aire: puntos claros en la capa de fondo (helper en common2). **Nunca partículas negras.**
- **Flow solo para imágenes del mundo** (fotos, pósters, recortes de diario, foto del carnet), mapeadas dentro de su
  marco/tarjeta, con toque cómico. Siempre por el MCP `srz-google-flow-mcp` (nunca el Flow Connector / flow-auto).
  Guardar los originales en `flow_src/` y los usados en `assets/`. NUNCA personajes en Flow.

**Color — `styles/cartoon3d/color.js`** (medido en `fuentes/cartoon3d/ricks-color.md`)
- **Guion de color por set**: objeto `COLOR` en shots.js, una entrada por set con `exp` (exposición ACES), `catch`
  (opacidad y color del catcher), `face` (luz neutra en personajes), `world` (fades en el mundo vía
  `c3ColorWorld`: paredes arriba/abajo, piso cerca/lejos, techo) y `grade` (`c3Grade`: expo, lift de color, split tone
  sombra fría / luz cálida, saturación por luminancia `[oscuros, medios, luces]`, contraste, hombro fílmico, fades de
  pantalla, glow radial, viñeta, `barrel` 0,12 = ojo de pez leve).
- Cada escena: 2 tonos complementarios dominantes + 1 acento (azul/naranja, violeta/naranja, cian/rosa…). Luz cálida,
  **sombras de color** (azul-violeta, ciruela, malva), oscuros levantados (p5 ~0,15), nada negro aplastado.
- **Roll-off de las luces, NUNCA subir el brillo global.** El usuario rechazó lost-luggage v4 ("solo subiste la luz y la
  saturación a todo"). Nada de `brightness()` CSS ni exposición alta sobre filtros: el blanco termina en ~0,93 por el
  hombro; papeles crema/lavanda con gradiente, nunca 255. Las cabezas son lo único casi blanco.
- Metas medidas (Ricks): L p5/p50/p95 ≈ 0,15-0,17 / 0,44-0,55 / 0,82-0,85; < 4-5 % de píxeles > 0,93; saturación
  oscuros/medios/luces ≈ 0,60 / 0,50 / 0,30. Medir con `python styles/cartoon3d/tools/grade_stats.py video.mp4`.
- Ningún área oscura ni quemada: interiores con prácticas y relleno suficientes; caras nunca en sombra.

---

## 7. Cámara, cortes y texto

**Cámara** (estudios: `fuentes/cartoon3d/ricks-documentos-camara.md`, `camara-dinamica-6WTahOqdEl4.md`)
- **REGLA DEL USUARIO (2026-11-11): cámara secuencial tipo Ricks en todos los videos** — un plano continuo que viaja
  por el set encadenando push, whip, órbita con paralaje, grúa y roll holandés; cambia de dirección cada 1,2-1,8 s; 3-4
  ejes a la vez el 60-75 % del tiempo; cambios de lugar con whip + motion blur, nunca un paneo 2D en una sola dirección.
  Medido en `fuentes/cartoon3d/camara-secuencial-ricks.md` (refs i4hYq1oSXTg, 7xS87iActkU, Mz72MuPgnGY).
- **Siempre en movimiento** (Ricks: solo 4-10 % de frames quietos). En common2 `camMove(K, lt, id)`: los encuadres de
  `SNAPS[id] = [[t, targets, fill], …]` cambian SOBRE la palabra que nombra al objetivo con un movimiento con easing de
  ~0,34-0,45 s, y encima cada plano tiene deriva propia: **push-in** (`push` 0,13/s ≈ 10-20 %/s), **órbita** (±0,05
  rad/s), **grúa** (0,12/s), roll opcional (`CAMF[id]` para cambiarlos; `SNAPS[id] = 'free'` = solo cámara a mano +
  deriva). Targets: `'p:quien'` (persona entera), `'u:quien'` (cabeza+torso), `'o:malla'`, o cajas `[x,y,z,w,h,d]`;
  el encuadre se mide UNA vez por plano en una pasada en seco (`snapKeys`) — nunca re-medir cajas vivas cada frame
  (temblor). Un solo sistema de zoom por plano (SNAPS); `C3_CAMFX` solo para patadas en impactos reales.
- Cada zoom cae sobre lo que la voz nombra, encuadrado ENTERO (textos legibles enteros, cabezas enteras); nadie
  parado entre la cámara y el objetivo.
- **Whip pan** en cada cambio de lugar (`grWhip` en shots.js: arranca rápido y **frena con easing**, el hueco se
  rellena con una copia desenfocada — nunca banda negra). Entre planos del mismo lugar: corte seco o dissolve con
  movimiento de 5 frames (`DISSOLVE_IN`).
- Planos de documento **cenitales** (TOP-DOWN) con paneo/rotación lenta o grúa que sube a cenital.
- **DOF constante dentro de un plano** (nada de saltos de desenfoque: "DOF pops"); primeros planos con fondo
  claramente desenfocado. **Sin motion blur de cámara** que se prenda y apague (`C3_SNAP.blur 8, blurMin 99`).
- Nada de primer plano pegado a la pantalla: objetos de foreground con parallax real.

**Cortes**
- Cada plano empieza en el **onset de su primera palabra** (`SHOT_LIST` t0 = `words.json`). Promedio ~1,4 s por plano
  (lost-luggage: 38 planos en 60,5 s); 1-2 tomas continuas largas; **el plano más largo va al final**.
- Abrir con gente; cortar al objeto héroe en la línea que lo nombra.
- Continuidad: la gente conserva su posición entre planos del mismo grupo; nadie desaparece ni se teletransporta.

**Texto**
- **Solo dentro del mundo**: reportes, facturas, carteles, carnets, etiquetas, recibos, calendarios; sellos que bajan
  (CASE CLOSED, SOLD), escritura/firma animada (write-on). Revelado por la cámara o por una mano que lo sostiene.
  Nunca stickers flotantes frente a la cámara (los únicos FX de pantalla: venas, humo, estrellas, sudor).
- **Ningún texto cortado por el borde del cuadro** ni saliéndose de su objeto (`inked()` encoge para caber).
- **Subtítulos de 1 palabra** quemados (`c3Subtitle(WORDS, t)`): blanco, sans gruesa, contorno oscuro grueso, abajo
  al centro (~71 % de H). Caras fuera de esa franja. Van después del grade (no se deforman con el barrel).

---

## 8. Sonido ("sonido pro")

Pipeline en `pieces/<p>/sound/` (copiar de lost-luggage; correr desde esa carpeta):
1. `python events.py` → `events-all.json`: lista `(t, qué)` de TODO lo visible. Lee los t0 de `SHOT_LIST` (whoosh de
   whip en cambio de lugar, whoosh suave en cortes y movimientos de cámara) + los tiempos de acción de los sets.
   **Cada acción visible lleva su sonido**: pasos, puertas, papeles, sellos, teclado, cajas, motores, golpes, chirridos…
   (~200 eventos por short).
2. `python fs_fetch.py [clave …]` → descarga candidatos **Freesound CC0** (previews HQ mp3) a `fs/<clave>_<id>.mp3` +
   `fs/index.json` (dict `Q` = clave: (búsqueda, dur mín, dur máx); beds terminan en `_bed`). Clave en `~/.freesound.json`.
3. Elegir con **earshot**: `rank` (entre candidatos) → `find` (el mejor momento) → `describe`/`realness`; recortar
   donde haga falta (`*_cut*.wav`). Guardar la elección en `sfx_pick.json` (clave → [archivos]) y `beds_pick.json`.
4. `python make_cues.py` → `cues.json` para `sound-layer/scripts/mix.py`: `RULES` (regex del evento → clave),
   `LIFT` por clave (~1-7), `ALIGN` (start para sonidos largos), whooshes/pops/taps/shimmer del kit. Música:
   `music_bed.wav` desde 0 s, `duck_db: 0`, `lufs: -14`.
5. `python beds.py` → `beds.wav`: ambiente por lugar (un bed por set, según `SHOT_LIST`) con crossfades de 0,3 s en
   los cortes, canal derecho decorrelado; capas extra (motor de la cinta bajo los planos que la ven, murmullo).
6. `python remix.py` → corre `mix.py`, luego:
   - voz +2 dB; **música a voz −16,5 LU** (earshot: a 20 LU no se oía; rango aceptado ~16,5-18 LU);
   - **beds a voz −22 LU**;
   - **SFX ≥ 4,5 dB bajo la voz** mientras habla (rider de corto plazo), en los huecos hasta voz −2 dB;
   - **master −14 LUFS** + limitador (−2,2 dBFS) → `audio/final_mix.wav`, mux con el mudo → `renders/<p>.mp4` y
     `renders/final.mp4`.
- **Música:** "Short Pizzicato Song", Freesound **529008** (CC0) — la misma en todas las piezas desde phone-1pct (el
  usuario rechazó otra). Copia exacta en `styles/cartoon3d/audio/music_bed_529008.flac` (48 kHz, 61,4 s):
  `ffmpeg -i styles/cartoon3d/audio/music_bed_529008.flac pieces/<p>/sound/music_bed.wav`. Audible desde el frame 0.
- Verificar con earshot `timeline` (sync con los cortes) y `critique`; medir loudness con `measure` o `short_qa.py`.
- Los mp3/wav de `sound/fs/` están git-ignorados: `fs/index.json` guarda los ids de Freesound para re-bajarlos.

---

## 9. QA antes de mostrar nada

- `python -I styles/cartoon3d/tools/short_qa.py pieces/<p>/renders/<p>_silent_vN.mp4 pieces/<p>/qa/vN` → specs,
  loudness, negros/blancos/congelados, **pops** (saltos de diferencia entre frames, revisar cada uno), estadística de
  color por plano y hojas de contacto de 2 s.
- **Hojas cada 0,25-0,5 s** de todo el video (p. ej. `ffmpeg -i v.mp4 -vf "fps=4,scale=270:-1,tile=6x5" qa/half_%02d.jpg`)
  y MIRARLAS (Read). Más densas (0,1 s) en movimientos de cámara y gags. Comparar lado a lado con frames de Ricks a la
  misma escala (`styles/cartoon3d/tools/sbs_sheet.py`).
- `python styles/cartoon3d/tools/grade_stats.py` para el color; earshot para el audio; `revisar_render.py` al final.

**Checklist de bugs (todos salieron en revisiones del usuario):**
- [ ] partículas negras / motas oscuras en el aire
- [ ] DOF que salta dentro de un plano; motion blur que se prende y apaga
- [ ] brazos que se dan vuelta (flip del arco de un frame a otro)
- [ ] puños blancos o manos que no agarran (objeto flotando frente al torso)
- [ ] objetos que se atraviesan (manos/cabezas/papeles/props; personas detrás de mostradores con piernas visibles)
- [ ] caras sin rasgos (perfil con un ojo y sin boca, cara en sombra, cara tapada)
- [ ] zonas oscuras o quemadas (papeles a 255, pisos quemados, cuartos negros)
- [ ] moonwalk (pies que patinan, facing invertido)
- [ ] texto cortado por el borde o fuera de su objeto; carteles con texto cortado
- [ ] whip con banda negra; dissolve "fantasma" donde debía ir corte seco
- [ ] gente que desaparece/teletransporta entre planos; cámara que atraviesa paredes
- [ ] voz cortada al inicio/final de una palabra; música que no suena desde el frame 0; SFX tapando la voz
- [ ] sprites con bordes de quad visibles; props pequeños que quedan enormes; parpadeo de props ambientales

**Lecciones de trash-library v2 (2026-11-12, revisión del usuario):**
- [ ] **Sombras estables:** el frustum de sombra no puede seguir a la cámara libremente (titila/"nada"): snap del target de la
  luz a texels del shadow map en espacio de luz cada frame (`stableShadow` en common2). Las tarjetas NO proyectan su propia
  sombra (miran a la cámara → la sombra gira en cada órbita): un gemelo invisible de la tarjeta orientado a la luz proyecta
  la silueta (`toonShadowTwin`). Revisar tiras de frames consecutivos (1/30 s) en cada set.
- [ ] **Nada de tarjetas de papel en grúas/cenitales:** la tarjeta se inclina hacia una cámara alta (pitch en `pose`), y la
  gente solo desaparece fuera de cuadro; nunca verla de canto.
- [ ] **Capas = interpenetración:** la capa FOCUS se dibuja ENCIMA del set. Props sostenidos van en FOCUS, delante del plano
  de la tarjeta (empujados hacia la cámara por su media profundidad); lo que debe tapar a una persona (cama, sillón, compuerta,
  mostrador, techo, columnas) lleva un doble solo-profundidad en FOCUS (`colorWrite:false`, inkOcc, renderOrder -5), creado
  DESPUÉS de `c3SetLook` (si no, lo vuelve material iluminado). Muebles del set NUNCA en FOCUS (atraviesan techos).
- [ ] **Agarre de props:** gripProp en las dos manos + el prop escalado a la distancia entre manos, estable cuadro a cuadro;
  libros que salen de una bolsa SALEN visiblemente (la mano entra, el libro sube), nunca aparecen de golpe.
- [ ] **Lágrimas ancladas a los ojos:** se dibujan dentro de la tarjeta con el layout de ojos de la cara para el facing
  actual, cada frame (no un sprite 3D aparte que se desfasa).
- [ ] **Personajes vivos:** `look:[x,z]` (facing calculado desde la cámara cada frame → giran con la órbita), anticipación
  (agacharse antes de saltar), aterrizaje con squash y asentado, peso que se mueve en los holds. Un salto = uno, claro.
- [ ] **Cámara:** velocidad angular pico < ~110°/s fuera de los whips (v1 tuvo 684°/s a 14,8 s: ilegible).
- [ ] **Grade Ricks (medido):** L p5/p50/p95 ≈ 0,12-0,17 / 0,46-0,58 / 0,80-0,89; saturación oscuros/medios/luces ≈
  1,05-1,2 / 1,3-1,6 / 1,0-1,45 en `sat`; `liftK` 0,08-0,2 (0,4 = lechoso), `contrast` 1,12-1,2, `hi` naranja (#ffb468-#ffc078),
  `shadow` azul (#2f68b0-#4a7ae0). Luz key cálida + relleno/entorno AZUL cielo (un entorno durazno/lavanda vuelve violeta el
  asfalto). Libros/papeles saturados, nunca pilas crema. Comparar siempre hoja ref-vs-nuestra.
- [ ] **Sets densos:** siluetas reales (mezquita otomana con semicúpulas, minaretes con şerefe y capuchón en punta; bloques
  con balcones, AC, tanques, toldos); nunca cajas lisas de fondo.

---

## 10. Estado del lote 04 (`scripts/cartoon3d-guiones-04.md`)

| # | tema | pieza | estado |
|---|---|---|---|
| 1 | The Restaurant Where Your Order Comes Out Wrong | `pieces/mistaken-orders` | hecho |
| 2 | The Bank That Keeps Cheese in the Vault | `pieces/cheese-bank` | hecho, APROBADO |
| 3 | The Country Where Your Pet Can't Be Lonely (cobayos) | `pieces/guinea-rent` | hecho, APROBADO, enviado |
| 4 | Where Your Lost Suitcase Ends Up | `pieces/lost-luggage` | hecho, APROBADO, enviado (plantilla) |
| 5 | **The Library Built From Trash** (Ankara) | — | **SIGUIENTE** |
| 6 | Single at 25? You Get Cinnamon (Dinamarca) | — | después del #5 |

Para el #5: copiar `pieces/lost-luggage` a `pieces/<nombre>` (sin `renders/`, `qa/`, `voice/takes/`, `sound/fs/`,
`sound/audio/`), cambiar `piece.json`, `script.txt` (guion del lote, recortado a ~205-215 palabras si hace falta),
reescribir sets/planos, elenco con peinados/trajes nuevos, y seguir la sección 1 desde el paso 2.

---

## 11. Herramientas del estilo (`styles/cartoon3d/`)

- `kit.js` — núcleo (render por capas, tinta screen-space `C3_INK2`, sombras `C3_SHADOW`, `C3_VIVID`, `c3Crisp`,
  `c3Subtitle`, cámara `c3CamAt`/`c3SnapCam`/`c3FrameBox`/`c3Whip`, `C3_CAMFX`, `C3_DOF`, `c3Fog`, props, edificios…).
  También el pipeline viejo de sprites (`c3Person`), solo para piezas legado.
- `toon.js`, `toon-pets.js`, `setlook.js`, `exterior.js`, `color.js` — ver secciones 5-6.
- `tools/short_qa.py`, `sbs_sheet.py`, `grade_stats.py`, `shot_stats.py`, `head_size.py`, `trim_voice.py`,
  `voice_takes.py` (versión vieja del selector de tomas) y las herramientas de sprites Flow (legado).
- `FRAMING.md` (encuadres medidos de Ricks), `GUIONES.md` (escritura), `mromidev-ref/` (reportes medidos del tutorial
  mromidev), `memoria/` (copia de las notas de memoria del usuario, sin secretos).
- `audio/music_bed_529008.flac` — la música de la serie.

---

## 12. Referencias (NO están en git, por derechos y tamaño)

Nunca subir frames, recortes ni videos de Ricks Clips (ni hojas `cmp_*` que los incluyan). En el Mac, re-descargar
con `yt-dlp` lo que haga falta a `refs-ext/<carpeta>/` (git-ignorado):
- **Ricks Clips, documentos y cámara** (`refs-ext/ricks-docs-cam/`): HxqtHI62otM (pintura rosa en la cárcel),
  7xS87iActkU (ferrocarril), Mz72MuPgnGY (cocinero y piratas). → https://www.youtube.com/shorts/<id>
- **Cámara dinámica** (`refs-ext/cam-6WTahOqdEl4/`): 6WTahOqdEl4.
- **Estudio de personajes / 4 shorts Creatorize+Ricks** (`refs-ext/ricks-4shorts/`): gsPV3pf-nnk, WutivYmFoAw,
  lCaTVGx2Cxc, w2AM1ltiers.
- **Tutorial del look** (`refs-ext/tut-XllAGyvdd8/`): _XllAGyvdd8 (probado y descartado: "olvida ese tutorial").
- **Tutorial mromidev** (`refs-ext/claude-animated-shorts/`): `git clone https://github.com/mromidev/claude-animated-shorts`
  (MIT; de ahí vienen `short_qa.py` y el método de tarjetas 2D-3D); video OtbLL6OBNE4.
- **18 shorts de Ricks Clips** (`Ref 3D cartoon animations/ricks/`): 0m6G8pDtzNs, CJwgTrfrHL0, DEe0iKH4KIw, GM9UKnZ6JFw,
  LC8hYwUZ-kU, PL-Yro2meY4, PLe2Gu3FDuA, TgyHSIttwdM, VKsamN3Fk4U, VS1Z_Q-Klt8, _sUAXTvJquk, eQR3pgMiUF0, hdhggSABEws,
  jpFJ8Z_F-qU, lnYLIWP2l-I, nzbkkEZFM8g, t3OXkhlI6NQ, uRkLhDrKQeU.
- **Las 11 refs originales** (`Ref 3D cartoon animations/1..11.mp4` + `_analisis/`): no hay URL guardada; copiarlas del
  PC si se necesitan.
- **5 fotogramas de color que mandó el usuario** (`pieces/lost-luggage/qa/ricks_ref_1..5.png`): solo en el PC.

Notas de estudio (sí en git, `fuentes/cartoon3d/`): `ricks-estilo-4shorts.md` (personajes), `ricks-documentos-camara.md`
(documentos y cámara), `ricks-color.md` (color), `camara-dinamica-6WTahOqdEl4.md`, `tutorial-mromidev-gap.md`,
`tut-XllAGyvdd8-frames*.md` y las notas ver-youtube de cada tutorial.

---

## 13. Legado (no usar en piezas nuevas)

Hasta cheese-bank los personajes eran sprites de Google Flow (`c3Person` + `sprites/`, `faces/`, peinados `rk_*`
cortados de frames de Ricks). Aprobados con ese método: apple-wayne, phone-1pct, lego-sea, slow-checkout,
swedish-number, flower-clock, mistaken-orders, cheese-bank. Desde guinea-rent todo es `toon.js`.
