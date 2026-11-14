---
type: spec
status: active
tags: [ava-restfield, zombie-channel, guia, mac, ps1, resident-evil-style]
relatedTo: [zombie-channel, ava-rules]
---

# Ava Restfield — guía completa del estilo (para seguir en la Mac)

Esta guía es autosuficiente: un Claude nuevo en la Mac la lee y puede seguir el canal sin la memoria del PC.
Junto a ella: [PROPUESTAS.md](PROPUESTAS.md) (próximos videos) y [ASSETS.md](ASSETS.md) (qué assets pesados bajar de LucidLink y dónde ponerlos).

---

## 1. Concepto del canal

- **Heroína:** AVA RESTFIELD (nombre original "Ava Bread", cambiado el 2026-10-28 en el ep2). Personaje 100 % nuestro: rubia, chaqueta de cuero marrón corta, top blanco con ombligo, pantalón negro, guantes negros sin dedos, botas de combate. Modelo PS1 low poly (1510 tris) hecho desde cero en `pieces/zombie-girl` (método Stark Crafts: `model/measure.py` → `build.py` → `texture.py` → `face/face.py` → `model/rig.py` → `anim/build_anim.py` → `anim/heroine_anim.glb`, 46 animaciones, 23 huesos con los mismos nombres que zero-fem).
- **Look:** PS1 Resident Evil / Parasite Eve 2 (Jill / Aya), NO cartoon Megaman Legends. Pixelado, texturas 128-256 px con filtro Nearest, HUD = ECG + panel CONDITION de RE2.
- **Nicho:** supervivencia zombi con datos reales. Referencia original: "Learn with Alya" (intento fallido → YOU DIED → solución real con diagramas → chiste). Desde el ep3 el formato es la serie "AVA: DAY 1": situación en 2ª persona en un lugar con una ventaja y una trampa, reloj/contador de DÍA, datos reales con números, giro + elección binaria ("comment, most comments decide Part 2"), partes serializadas, una mascota. Ganadores del nicho analizados en `fuentes/zombie-nicho/` (dontopenit.stories, survivenight1, drawn.tosurvive, nionarratives, play.malo, @sports.data_, Stickocalypse).
- **Mecánicas RE como recursos narrativos:** pantalla ITEM = cuentas de suministros, máquina de escribir/guardado = reloj, FILE = nota que asusta, transición de puerta que carga, cursor de menú YES/NO para la elección, YOU DIED = mal final. Easter eggs RE SOLO visuales, dibujados por nosotros (First Aid Spray, hierbas verde/roja/amarilla, máquina de escribir + cinta, silueta tipo Mr. X), nunca assets de Capcom ni nombres registrados en títulos. Descripción: "Not affiliated with Capcom or Resident Evil."
- **Idioma:** inglés (US), narración en SEGUNDA PERSONA ("you fill the tub", "you freeze"), nunca "Ava does…". Chistes en inglés, nada de ruso, nada de subtítulos aclaratorios tipo "(the polite version)".
- **Formatos:**
  - **Short** 9:16 1080x1920 30 fps, ~62 s (objetivo 61.8-62.2), **nunca < 61 s**.
  - **Largo** 16:9 (motor 640x360 ×3 = 1920x1080), **≥ 8 min** (Part 2 llegó a ~9 min). Todo short importante tiene su versión larga.
- No monetizado aún. Publica en TikTok/Shorts (shorts) y YouTube (largos).

---

## 2. Flujo de trabajo (orden obligatorio)

1. **Tabla de beats** (como las de PROPUESTAS.md): # / tiempo / beat / dato real con fuente / easter egg. → **esperar OK del usuario.**
2. **Guion** en `voz/guion.md` (inglés, 2ª persona, con marcas `[PIENSA]`, `[RESPIRA]`, `(···)`, `*temblando*`) + tabla de datos verificados en `brief.md` / `FACTS.md` (dato, OK/parcial, fuente con link). Unidades US (inches, gallons, miles). Mejorar las refs, nunca copiar texto: mismos beats, lógica más clara, callbacks a episodios anteriores.
3. **Pasar el guion por la skill `humanizer`** (instalada en `~/.claude/skills/humanizer`, repo github.com/blader/humanizer): hablar como una persona normal con conectores ("four toilet tanks, that's six more, so eleven days. And help comes in seven"), sin listas telegráficas, sin not-X-but-Y, sin tríadas forzadas, sin remates en cadena ni aperturas escenificadas. Mantener datos, gags y beats.
4. **Voz** (receta en §3). Elegir tomas, ensamblar, cues por palabra (`voz/build_cues.py` → `engine/cues.json` / `engine/timeline.json`).
5. **Storyboard** (`review/storyboard.py`: un panel por beat con fotogramas REALES del motor con la voz real + fila de props nuevos). **PARAR y mostrarlo. Esperar OK aunque el usuario haya dicho "procede al render".**
6. **Render** (`node render_film.mjs ...`) + mezcla (`audio/scripts/mixNN.py`) → mux.
7. **Mi propia revisión cuadro a cuadro** del mp4 EXPORTADO a ≥ 5 fps (crops 4×), sobre todo en los tramos corregidos: geometría que atraviesa a Ava, manos flotando, parpadeos de suelo, temblores. Nunca fiarse del reporte de un agente (ep13 v3 salió con un pilar atravesándola).
8. **`python tools/revisar_render.py --estilo ava video.mp4`** (créditos API; en la Mac, si no encuentra la memoria, usar `--reglas styles/ava-restfield/GUIA.md`). Largos: revisar en partes de ~2:40 (todas, incluida la última) porque se queda sin salida. **Máximo 2 rondas** de revisión por video; arreglar solo fallos claros, lo cosmético espera la revisión del usuario.
9. **Entrega:**
   - Versión **share** (libx264 CRF 24 preset slow, yuv420p, AAC 192k, `+faststart`), no el master.
   - Copiar a LucidLink: `/Volumes/alanwork/trabajo/Renders finales claude/Ava Restfield/<titulo-corto>.mp4` (en el PC `C:\Volumes\alanwork\trabajo\Renders finales claude\Ava Restfield\`). Si la pieza tiene `caption.txt`, va al lado como `<titulo-corto>.txt`.
   - Miniatura en `Ava Restfield/Miniaturas/<titulo-corto>.png` (mismo nombre que el mp4).
   - Largos: siempre **título viral + miniatura 1280x720** (ver §7) + `DESCRIPCION.md`.
   - Borrar renders superados de `pieces/<pieza>/renders/` (v1/v2 viejos, silent, raw, duplicados); queda solo el master con el título. **Un archivo por video**, sin copias en `pieces/<Estilo>/`. **No Telegram** salvo pedido explícito.
   - En el chat: **link markdown clicable relativo a la raíz del workspace** para cada archivo entregado (`[storyboard_v1.png](pieces/zombie-14-x/storyboard_v1.png)`), ruta absoluta solo de respaldo.

---

## 3. Voz

### Ava
- **VoiceStudio, perfil clon "ava bread buena" `f2a102da`** (desde el largo 1 v1, 2026-10-30; reemplaza a "ava bread 2" 3824e262, y la primera "ava bread" 2dd9cbec tenía un error: no usar). La referencia está en el kit (`voces_ref/f2a102da.m4a`); en la Mac hay que clonarla de nuevo con ese audio y este texto de referencia:
  > I've been waiting for this handheld for so long. I think I placed my order about two months ago. The AY and Thor runs on Android, and the setup to play games takes a little bit of time, but it isn't that hard. I watched this YouTube video by Retro Game Core, and it helped a lot with the setup, so I highly recommend. And once it's all set up, it's just so easy to use.
  (El ID nuevo en la Mac será otro: anotarlo en `voz/gen.py` como `VOICE`.)
- **Siempre `steps=32` (`num_step: 32`), formato `wav`, `speed ≈ 0.88`** (desde 2026-11-11 para TODO lo de Ava: iba muy rápido). REST: `POST http://127.0.0.1:3900/v1/audio/speech` con `{"model":"omnivoice","input":..., "voice":..., "language":"en","response_format":"wav","num_step":32,"speed":0.88,"seed":N}`.
- **8+ semillas por toma** (hasta 14 en las difíciles). `voz/pick.py`: whisper (faster-whisper small) debe coincidir EXACTO con el texto; entre las exactas, la más viva y con **F0 final descendente** (frase declarativa; VoiceStudio a veces termina subiendo como pregunta → regenerar con punto). Revisar a mano y fijar en `voz/pick_manual.json`.
- Pipeline de scripts (copiar de la pieza plantilla): `gen.py → pick.py → prep.py → assemble.py → fix_words.py → fix_caps.py → build_cues.py`.
- "FEMA" se escribe "Fema" en el texto (si no, lo deletrea).
- **Tono cinematográfico/humano (regla fija desde 2026-11-11):** más pausas, que parezca que lo está viviendo.
  - `[PIENSA]` = pensamiento interno: instruct `"whisper"`, más lento, en la mezcla **seco y cerca** (sin reverb de sala), ganancia ~0.76-0.82, música baja debajo. Los pensamientos de miedo ("no, no, no") con toma humana, nunca robótica.
  - `[RESPIRA]` = respiración / tragar saliva **real** (grabaciones CC0 de Freesound, p. ej. `largo2/audio/cand/breath_f*`, `swallow`, `gasp_f`), sola en silencio.
  - `(···)` = pausa de **1.5-2 s con ambiente** (zumbido, goteo, golpes lejanos). Ninguna pausa se rellena con voz.
  - `*temblando*` = voz baja y entrecortada: instruct `"whisper, low pitch"` (instruct solo acepta acento/edad/tono/whisper, no emociones).
  - Pausas cortas entre líneas normales 0.3-0.45 s; aire muerto > ~0.5 s se corta (film.js `CUTS_T` + `warp()`, el mismo corte en la mezcla, en corcheas enteras de la música).
- **Cortes:** NUNCA partir una toma en "…" (la pausa no es silencio y se comen palabras): generar cada mitad como toma propia (`voz/lines/<id>_<j>.wav`). Recortar a −45 dB con márgenes 80/180 ms y fade-out 30 ms. Colocar cada pieza para que su primer SONIDO caiga en el cue. Cortar solo en silencios entre palabras, nunca dentro de una palabra ni partiendo una frase entre líneas (el cierre de una oclusiva b/p no es pausa). Tras partir, re-transcribir cada archivo y confirmar que contiene exactamente su frase. Whisper estira la primera palabra sobre el silencio inicial: clamp al onset.
- Líneas que continúan = UNA toma, sin punto final entre medio.
- Nada de sílabas estiradas por el speed bajo (revisar palabras sueltas tipo "three... seven"; si se alargan, regenerar esa a speed normal). Si una línea corre hacia el plano siguiente se puede usar `speed` más alto en esa toma.
- Nunca lecturas gritadas ("First problem", "7-3-7", "Rule four"). Pausa entre la pregunta final y "Comment yes or no".
- Ava NUNCA dice "click" ni onomatopeyas: el sonido va como SFX.
- Releer la redacción exacta del usuario para frases fijas ("THE ghost", no "a ghost"). Tomas lentas necesitan pausa real en las comas.
- Una vez aprobada una voz, no cambiarla; arreglar ritmo recortando huecos.

### Gag "Oh, fudge!"
Muletilla de Ava cuando el final sale mal, en TODOS los episodios. Reusar SIEMPRE la toma del ep1 `pieces/zombie-01-door/voz/lines/13_fudge.wav` (está en el kit) para que suene igual. Si hay que generar una corta nueva: sola y verificada con whisper; si se rompe, dentro de una frase más larga y cortar en el silencio real. En el largo 2 se usó versión *temblando*. Cara: boca abierta normal (la mueca de dientes y la cara >.< fueron rechazadas).

### Otras voces (VoiceStudio, diseños; referencias en el kit `voces_ref/`)
| Personaje | ID PC | Diseño (instruct) |
|---|---|---|
| Desconocido en la puerta (ep10, radio ep12, baño ep13) | `b0469a54` | male, elderly, moderate pitch, american accent, seed 42 |
| Policía RPD / Officer Vickers (largos) | `cf919aa6` | male, middle-aged, low pitch, american accent, seed 42 |
| Marla (archivista superviviente) | `996b1578` | female, middle-aged, low pitch, whisper, american accent, seed 42 (sin wav de referencia: es diseño puro) |
| Dutch (preso de la celda 4) | `644338f4` | male, middle-aged, very low pitch, american accent, seed 42 |
En la Mac: recrear los diseños con esos parámetros (o clonar desde el wav del kit). Efectos: radio = filtro de banda + saturación; voz tras puerta = paso bajo 1.3 kHz + eco corto (ver `voz/assemble.py` de ep12/ep13).

---

## 4. Audio

- **Cada acción tiene un SFX real en su cuadro exacto.** Recortar el silencio inicial de cada archivo (el default de Dino Crisis traía 0.33 s y todas las etiquetas sonaban tarde). Máquina de escribir = una tecla por letra en el cuadro de la letra. SFX sin duplicar ni duros. Cada golpe de zombi sacude la ventana/puerta (solo ese objeto) con el SFX en el mismo cuadro.
- **Fuentes:**
  - Dino Crisis (`assets/dino-crisis-sfx`): sonido default en etiquetas, radio beep (solo cuando aparece la radio / entra el HUD; luego sonido de menú FILE), pasos (`ch/walk_run_indoors.wav`), push, inventario, unlock, keypad.
  - Voces de zombis de Resident Evil (`assets/zombie-sfx-yt/seg`, YouTube 4JCoB0GUIVs desde 1:20).
  - **Freesound CC0** para todo lo demás (filtro `license:"Creative Commons 0"`, previews HQ mp3; API key en `~/.freesound.json`, cada máquina la suya; claves en https://freesound.org/apiv2/apply/). Scripts de bajada: `audio/scripts/fs_fetch13.py`, `largo2/audio/fetch_fs.py`. Guardar candidatos en `audio/cand/<categoria>/<id>.mp3` + `meta.json` (autor/licencia). Créditos en `audio/CREDITS.json`.
  - **Elegir y verificar con earshot** (`rank` entre candidatos → `find` el mejor momento → `describe`/`realness`; mezcla final con `timeline`/`critique`/`measure`). En el PC está en `F:\earshot` (MCP + skills `earshot`/`real-sound`); en la Mac instalar la suya.
- **Música:** CC0 real (Freesound), nunca drones sintéticos (se leían como una voz tarareando). Debe oírse claramente.
  - Medir por **LUFS, no RMS** (pistas con mucho bajo desaparecen). Música **10-11 LU bajo la voz, medido POR TRAMO** (ningún tramo más fuerte que el resto; en el farm 7:34 quedó alto). Nunca más fuerte donde hay muchos SFX.
  - **Gancho 0-10 s con más música de terror:** drone real + caja de música + stinger en palabras clave, crossfade al BGM hacia los ~10 s (`mix5.py`, `mix13.py`). En el largo 2 el gancho va a ~7 LU bajo la voz.
  - BGM oscura continua (sin huecos largos). Se corta en los YOU DIED. En los largos, la BGM suena hasta el final; pistas por capítulo (`largo2/audio/mix_largo.py`, tabla `TRK`/`CUES`).
  - Pistas usadas (créditos): metrostock99 345069 y 350953, Dredile 164272, mr45 492956, szegvari 559388/640612/631933, kkenny101 865550, xkeril 686659, más `mus_horror/610534`, `hook_drone/799307`, `hook_musicbox/712798` en shorts.
- **Master:** ESTÉREO, **−14 LUFS integrados**, true peak ≤ −1 dBTP (un mono se lee 3 dB más fuerte en plataformas). Voz: `x1.15` en mix3 y +1.5 dB extra en largos.
- Largos: `mix_largo.py` mapea cada evento SFX de `sfx_events.json` a un sonido real; la lista de no mapeados debe quedar vacía.

---

## 5. Motor y pipeline (three.js PS1, un motor por pieza)

Cada pieza copia el motor de la plantilla más cercana y agrega sus sets. `npm install` en `engine/` (three ^0.180, playwright ^1.64; `npx playwright install chromium`). ffmpeg en PATH.

### Plantillas
- **Shorts:** `pieces/zombie-13-gasstation/` (último aprobado; desciende de ep4 v6 → ep5 → … → ep12).
  - `engine/main.js`, `lib.js` (`L.THREE`, `LW=360`, `LH=640`, helpers, `ch.lookAt(camera)`), `fx.js`, `refont.js` (fuente "RE": Tahoma Bold sin AA estirada ×1.25), `pixfont.js`, `film.js` (cortes `CUTS`/`CUTS_T`, `warp()`, HUD `HUD_T0`, YOU DIED, menú final), `sets/*.js` (contrato en `engine/SETS.md`: cada set exporta `shots(ctx)` → `{id: {scene, camera, update(lt,t), overlay?}}`), `sets/avaface.js` (caras), `sets/respray.js` (First Aid Spray), `sets/screensNN.js` (ITEM/EXAMINE/diagramas).
  - `engine/cues.json` + `engine/timeline.json` (palabras `[texto, ini, fin, línea, palabra]`, salen de `voz/build_cues.py`).
  - `node engine/render_film.mjs VOICE OUT.mp4 AUDIO.wav [--from F --to F]` (1080x1920, 30 fps, H.264 CRF 16).
  - `node engine/stills.mjs OUTDIR t1,t2,... [--sheet sheet.png --scale 0.25]` (fotogramas sueltos / hoja de contacto).
  - `python review/storyboard.py` → `storyboard_v1.png`.
  - `audio/scripts/mix13.py` (rutas absolutas `F:/Claude Proyectos/...` arriba del archivo: cambiarlas a la ruta de la Mac).
  - `engine/models/*.glb` (Ava `heroine_anim.glb`, zombis, autos Quaternius/Kenney, props) — no van en git (`*.glb` ignorado): vienen en el kit.
- **Largos:** `pieces/zombie-03-station/largo/` (Part 1, v3) y `largo2/` (Part 2, v3).
  - `engine/` a 640x360 ×3, planos anclados a palabras: `shots.json` + `ctx.at` (fuente en `shots_src.py`), `timeline.json`, `cuts.mjs` / `review/cuts.json`, `hud_png.mjs` (HUD real a PNG para miniaturas), sets `hall, cells, kennel, records, radio, ext, basement, breakroom, rooms, dog, p2new, p2people, p2screens, screens, r2kit, reuse`.
  - `voz/takes.py` (todas las tomas), `gen.py`, `pick.py`, `assemble.py`; `audio/mix_largo.py`; `guion.md`, `FACTS.md`, `DESCRIPCION.md`.
  - Un agente en segundo plano es dueño de todo el largo y se retoma en cada ronda de revisión.
- Objetos nuevos: método foto→lowpoly (foto aislada de Flow vía srz-google-flow-mcp → recorte PNG → loft/textura PS1 128 px, `objects/tools/`), o modelos gratis low poly (Quaternius CC0, Kenney CC0, poly.pizza) — mejor que vehículos procedurales feos.

---

## 6. TODAS las reglas y correcciones del usuario

Cada regla es una corrección que el usuario tuvo que pedir; repetirla cuesta una ronda. Revisar cada plano contra esta lista **antes del storyboard y antes del render final**.

### Nivel aprobado (barras mínimas)
- Ep1 `pieces/zombie-01-door/zombie01_door_v6.mp4` ("ahora sí quedó bien", 2026-10-28). Su LOG.md lista cada cambio.
- Ep3 short "AVA: DAY 1 — The Police Station" v4 (2026-10-30).
- Largo Part 1 `zombie-03-station/largo/zombie03_station_largo_v3.mp4` (2026-10-30).
- **Ep4 "The Last Train" v6** (61.5 s, −14 LUFS) = base de los shorts siguientes; ep5 "P.T." v5 (62 s) con el gancho de música de terror.
- Ep12 Radio y ep13 Gas Station Part 1 entregados; largo Part 2 v3 entregado (en LucidLink como `police-station-part-2.mp4`).
- Copias de referencia en el kit: `_kit/refs_aprobados/`.

### Imagen
- Look PS1 Resident Evil. Fuente "RE" (refont.js) con subtítulos pixelados (9 px ×3), ~20 % más chicos que el primer intento. **Sin cabecera de canal arriba.** El HUD es el ECG combinado con el panel CONDITION de RE2 (bisel gris, placa con nombre, pantalla verde, Fine/Caution/Danger; placa con el lugar: "STATION", "FARM"…). HUD arriba a la izquierda, subtítulos abajo: no poner texto importante ahí.
- **HUD** aparece TEMPRANO y DE GOLPE en el corte al 2º plano (~2.3 s, `HUD_T0`). Rechazados: entrada deslizante / parpadeo CRT y el símbolo de enojo 💢 (nada de símbolos manga).
- **YOU DIED** estilo RE: congelado teñido de rojo, negro TRANSLÚCIDO (~86 %, la escena se ve detrás), letras rojas serif con goteo, CONTINUE?. Rojo desde el cuadro 1. YOU DIED y diagramas se quedan oscuros.
- **Transiciones** sin costura: el flash blanco sube y baja en rampa, nunca un pop duro. Transiciones oscuras con luz suave para que se lean.
- Apertura puede tener recarga de pistola (acción `reload`): sin cargador como prop (atravesaba el arma); manos + corredera + SFX alcanzan.
- **Ava en planos frontales mira A CÁMARA** (`ch.lookAt(camera)` en lib.js, que restaura el hueso animado cada cuadro o parpadea). Expresiones cute (encogerse de hombros, guiño + sonrisa), nunca mirada vacía hacia arriba.
- **Ava NUNCA tiembla.** Cuando los zombis empujan la puerta solo se mueve la puerta (la hoja cede y rebota, el picaporte vibra: hall.js `THUMPS`/`rattle()`). Sin camera shake. Medir jitter con el test del centroide del pelo (≤ 1 px, sin ida y vuelta cuadro a cuadro). Sin animación de temblor. Cabezas de zombis sin temblor.
- Etiquetas y animaciones caen en la palabra que las dice (NOT EVEN CLOSE en "don't even reach"). Etiquetas de diagrama = cajitas con borde de 1 px y texto pixel 8-9 px unidas con línea fina.
- Props RE en los sets: First Aid Sprays (copia del modelo de Markus Darius en itch.io), macetas de hierba verde/roja/amarilla, máquina de escribir. Props con detalle real de textura low poly. Pantallas ITEM/EXAMINE llenas de ítems RE2 (First Aid Spray, escopeta, hierbas, munición) con detalle real. Hojas de guardado muestran el nombre del lugar ("POLICE STATION").
- Sangre = texturas reales (Flow), nunca píxeles pintados. Manos de zombi = las manos del propio modelo, nunca miembros hechos de cajas.
- **Iluminación:** desde el ep2, planos 3D (cuartos, Ava, exteriores) ~30 % más claros con sombras levantadas (film.js gamma 0.8 en 3D); no oscurecer escenas.
- Lluvia/gotas en vidrio caen HACIA ABAJO; sin reflejos parpadeantes; gorras de policía bajas con visera (no bloques cuadrados); el mismo look de policía en todos los planos. Luz que se cuela por puertas no parpadea. Suelo/pasto sin parpadeo (revisar diffs de cuadros en exteriores: z-fighting de calcomanías/caminos).
- **Nunca cambiar el modelo base ni las texturas de Ava** (pantalón, ropa) sin que lo pidan. Si aparece una mancha, reportarla en vez de repintar.
- **Sin atravesar (clipping):** Ava cruza puertas con animación de abrir; manos en props = mano propia de Ava, nunca flotando; el haz de la linterna sigue a la linterna; hacer animaciones nuevas cuando un plano las necesita; props en mano orientados hacia quien los usa (pantalla del teléfono hacia Ava); props bien apoyados (teclas sobre el cuerpo de la máquina, nada hundido en la mesa); puertas siempre dentro de su marco/pared, nunca flotando.
- Armas negras con detalle, nunca gris plano.
- **El perro (Ribbon)** debe verse tierno: cabeza y cuello unidos, sin partes transparentes, ojos redondos con brillo.
- Cuartos con detalle low poly rico, no planos. **Exteriores con MUCHO detalle** (bordillo, manchas, props, fondo con árboles/edificios y cielo). Fondos de ciudad con distancia de dibujo larga.
- Vehículos con modelo low poly real (Quaternius/Kenney), no cajas. Ava dentro de vehículos: cabina real (asiento, volante, tablero) + animación sentada, nunca Ava de pie detrás de una ventana.
- Manos/cuerpos sueltos = low poly facetado con dedos y nudillos, nunca formas planas tipo ladrillo. Siluetas con volumen 3D (sombrero con ala/copa, abrigo, rim light), nunca planas/cuadradas.
- Ítems clave en pantalla ~2 s después de nombrarlos.
- Un clip de animación se reproduce UNA vez por acción: nunca reiniciar ni loopear el mismo clip en planos consecutivos. Animaciones de brazo sin temblor (no sumar clip + sway).
- **Nada quieto > 4 s:** cambiar de plano.
- Criaturas: salen de la oscuridad, nunca aparecen de golpe; dos ojos brillantes separados (no banda de goggles); monstruos en la oscuridad con ojos SOBRE la cabeza, nunca flotando. Monstruos que no son zombis son bienvenidos (modelos descargados, p. ej. tentáculos). Fantasmas (Lisa) LEVITAN detrás de Ava con balanceo suave, nunca caminan.
- Teléfono en POV: derecho y nivelado; las manos no importan.
- Caras: la >.< fue rechazada dos veces. Diseñar una expresión limpia para cada situación (asustada, ojos de lado, boca de cringe), nunca con celdas recortadas del atlas. Cara `scared` en `sets/avaface.js`.
- Aperturas: Ava en pantalla hacia los ~2 s. Shorts "Imagine you…": empiezan así y copian los encuadres de la ref.
- Personajes en pantallas de resumen = render 3D real, no íconos.
- Tarjetas negras de hora (largos): solo texto, SIN recuadro gris debajo.

### Finales y tarjetas
- Shorts: **"FOLLOW FOR MORE!"**. Largos: **"SUBSCRIBE!"** (y la BGM suena hasta el final). Ya no "FOLLOW AVA RESTFIELD!".
- Tarjeta "NEXT:" (no "NEXT WEEK:") a máquina en Courier, con un objeto 3D examinado girando justo arriba del texto.
- **Finales de elección (desde 2026-11-03):** el video TERMINA en el menú RE ("WHAT DO YOU DO?" 1 / 2, "COMMENT 1 OR 2", + FOLLOW FOR MORE!) sobre fondo VIVO (Ava respirando, o Ava de espaldas en la mirilla), nunca congelado, sin tarjeta final aparte, sin subtítulos encima. Tarjeta de decisión = Ava de cuerpo completo mirando hacia la amenaza.
- En un final de elección la amenaza queda AMBIGUA: la persona en la puerta es un civil sospechoso (ropa oscura, ojos en sombra, sin sangre), nunca un zombi obvio.
- Largos terminan con CTA de elección ("Do you let Dutch out?" YES/NO, "Should I go to the barn?" 1/2) + SUBSCRIBE!. La mini maqueta de la tarjeta final = el modelo real del set escalado.
- Inicio de una Parte N nunca brusco: recapitular la elección con una frase ("Last night you had to choose…", "You said no… so the door stays shut.").

### Guion
- Shorts adaptan series virales de otras cuentas beat a beat (parafraseado, sin su texto ni nombres). Shorts de datos adaptados de TikTok funcionan en este formato.
- Humanizar siempre; datos reales con fuente en cada problema (FEMA/Ready.gov, CDC, WHO, USDA, FCC, USFA…). Lo ficticio se dice "In this world" (X-virus).
- Callbacks a episodios anteriores ("friction still doesn't care…").

### Largos (16:9, ≥ 8 min) — plantilla `zombie-03-station/largo/`
- Reusar los sets del short; extender con capítulos nuevos, cámaras fijas RE y pantallas de inventario / MAP / FILE estilo RE2-1998.
- Elementos: un puzzle (llave trébol), un NPC superviviente, un compañero (Ribbon), un YOU DIED falso, tarjeta de capítulo con la hora del día, un dato real (con fuente) en cada problema.
- Título investigado para viralidad ("Zombie Outbreak: 1 Night Locked Inside a …"). `guion.md` + `FACTS.md`.
- Audio: `mix_largo.py` sin eventos sin mapear; pasos Dino Crisis walk_run_indoors; música CC0 por capítulo, igualada por LUFS.
- Revisión en partes de ~2:40; luego revisar yo los cuadros de cada arreglo.
- `DESCRIPCION.md`: título, capítulos ≥ 10 s desde 0:00 (tiempos de las tarjetas a máquina), descripción copiar/pegar, CTA, datos reales, créditos (Quaternius perro CC-BY 3.0, dogchicken zombie CC-BY 3.0, rikindle3d zombie CC0, Kenney CC0, autores Freesound).

---

## 7. Miniaturas

- Largos: siempre miniatura YouTube 1280x720 (`largo/miniatura_1280x720.png`); shorts: portada vertical 1080x1920. Renderizar desde el propio motor 3D del video.
- Investigar título (skills `yt-package`, `yt-viral`) y competidores del nicho + lecciones de `fuentes/miniaturas/` (video KE4zqD0ONDI).
- **Sujeto = el cuerpo de Ava:** pose de heroína de acción (portada RE), cuerpo entero o 3/4, algo de perfil, pistola negra, piernas y muslos visibles, atractiva pero de buen gusto. La amenaza (zombis, Vickers) detrás.
- **Pose aprobada** (`fuentes/miniaturas/ref_pose/ava_pose_usuario.jpg`, en el kit): 3/4 de perfil, apuntando a dos manos a la altura del pecho, rodillas flexionadas en postura amplia, muslos bien visibles, mirada decidida. Panel CONDITION/ECG ("STATION · Fine") arriba, más chico. Horizontal: misma pose y HUD en pantalla dividida — lado calmo izquierdo con un lugar DISTINTO (p. ej. la entrada de la estación desde afuera), lado derecho noche oscura con la amenaza.
- Revisar al 100 % y crops 4× antes de mostrar: pistola NEGRA y legible; muslos llenos con cámara igual a la ref; texto con margen del divisor y bordes; lugar de fondo entendible (alejar para mostrar la entrada); Ava no arrinconada; HUD de la portada short centrado en ~45-50 % del ancho.
- **HUD en miniaturas = el HUD REAL del motor** (`largo/engine/hud_png.mjs` con film.js `hud()`), nunca redibujado; escalar con nearest-neighbor.

---

## 8. Episodios hechos y continuidad

| Ep | Pieza | Qué es | Estado |
|---|---|---|---|
| 01 | `zombie-01-door` | "How to properly barricade a door" — remake plano a plano de Learn with Alya (tornillos de 3", sofá, puerta acolchada "13"). NEXT: WINDOWS | APROBADO v6 (nivel base) |
| 02 | `zombie-02-window` | "How to properly barricade a window" (tablones, taladro). Primer "AVA RESTFIELD"; NEXT: WATER | entregado v2 |
| 03 | `zombie-03-station` | "AVA: DAY 1 — The Police Station" (formato nuevo, RPD nod, cuentas de agua/comida, radio) | APROBADO v4 |
| 04 | `zombie-04-subway` | "The Last Train — Part 1" (andén MERCY STREET, criatura de dos ojos, adapta play.malo "Subway") | APROBADO v6 (base de shorts) |
| 05 | `zombie-05-pt` | "The ghost behind you (P.T.)" — dato real del hack de Lance McDonald, Lisa levitando | APROBADO v5 |
| 06 | `zombie-06-floor30` | "Floor 30" — apto 3012, bañera ~40 gal, bombas de agua de edificios altos, extraño en la puerta | entregado v8 |
| 07 | `zombie-07-saferoom` | "The Safe Room" — 3ª de la serie de la casa (cuarto interior, kit FEMA). NEXT: THE STAIRS | entregado v4b |
| 08 | `zombie-08-farm` | LARGO "The Last Farm — Day 1 (Part 1)" (título YT "Zombie Outbreak: Day 1 Alone on a Farm"), adapta Stickocalypse; final "Should I go to the barn?" | entregado v5 (largo) |
| 09 | `zombie-09-subway2` | "The Last Train — Part 2" (vagón, túnel, sonrisa de la criatura) | entregado v5 |
| 10 | `zombie-10-stairs` | "The Stairs" — 4ª de la casa, dos salidas por cuarto (USFA), escalera de cuerda, desconocido b0469a54 | entregado v3 |
| 11 | `zombie-11-xvirus` | "How Not to Turn" — X-virus que se comporta como la rabia (lavar 15 min, WHO/CDC) | entregado v3 |
| 12 | `zombie-12-radio` | "The Radio" — radio a manivela, un auricular, AM de noche, silueta tipo Mr. X; "Answer / Stay silent" | entregado (2 rondas) |
| 13 | `zombie-13-gasstation` | "Gas Station, Part 1" — bombas sin luz, agua antes que snacks, cámara frigorífica = safe room, mano vendada bajo la puerta del baño | entregado (último short, plantilla) |
| L1 | `zombie-03-station/largo` | LARGO "Zombie Outbreak: 1 Night Locked Inside a Police Station" (~7:40, 18 capítulos) | APROBADO v3 |
| L2 | `zombie-03-station/largo2` | LARGO "Zombie Outbreak: Day 2 Locked Inside a Police Station" (~9 min, 18 capítulos) | entregado v3 (LucidLink `police-station-part-2.mp4`) |

### Continuidad de la serie de la estación (largos)
- **Noche 1:** zombis toman la ciudad a las 9 PM; Ava encerrada en la vieja comisaría. Encuentra a **Ribbon**, perra K-9 (chaleco K-9, pelota mordida; oye ~4× más lejos). **Marla**, archivista, escondida tras la puerta de records ("don't trust that radio"), desaparece. Puerta del fondo con un trébol en la cerradura → **llave trébol** de latón. Radio repite "help arrives in seven days" con la misma tos. 3:14 AM golpean el vidrio: **Officer Vickers** (convertido), contador de zombis 20 → 50. Las luces se encienden solas (alguien prendió el generador). La cinta en la radio la grabó Vickers. Final: "Do you open the door?" → ganó NO.
- **Día 2:** "You said no… so the door stays shut." Vickers golpea en código 7-3-7. Generador (media galón/hora, nunca adentro), apagar la cinta, inodoro de balde, **Dutch** en la celda 4, comida para dos, llave trébol abre la estación de 1920 bajo el piso, túnel. **Marla mordida** al final del túnel ("don't trust that man in cell four"), se lava la mordida 15 min. Azotea: espejo de señales, tres destellos. Helicóptero deja nota: "Bridge. Day three. Dawn. One seat." Las luces se encienden solas otra vez; los golpes paran. Inventario: perro, 15 balas, 25 días de agua, llave trébol, espejo, un asiento. Dutch dice que conoce el camino por el túnel. **CTA: "Do you let Dutch out? Comment YES or NO — most comments decide Day 3."**

### Continuidad Gas Station
- Part 1 termina con la gota de sangre bajo la puerta del baño y el menú **"Unlock it / Leave it locked"** + "Part 1 · Follow for Part 2". "Bites bleed, but so do cuts." La voz del baño = b0469a54 apagada por la puerta.

### Serie de la casa
ep01 puerta → ep02 ventana → ep07 safe room → ep10 escalera → ep11/ep12 usan la misma casa (papel pintado, parquet, sofá azul, puerta acolchada "13", ventana W1 con tablones).
