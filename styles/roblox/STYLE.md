---
type: style
status: draft
tags: [roblox, shorts, three.js, cartoon3d]
relatedTo: [styles/cartoon3d/STYLE.md, fuentes/roblox-cartoon, Ref roblox/ref1/desglose.md]
---

# roblox — Roblox story shorts (vertical)

Objetivo (usuario, 2026-11-03): que se vean como el reel `Ref roblox/ref1/ref1.mp4` (Instagram DfHvUTEA78A),
con la cámara súper dinámica y los sets ricos de cartoon3d. Método de guion: tutorial de g russ
(`fuentes/roblox-cartoon/`), sin Creatorize: todo en código (three.js + kit propio).

## Fuentes
- Reel objetivo: `Ref roblox/ref1/` — `desglose.md` (toma por toma, rig, sets, cámara, subtítulos, sonido), `sheet.jpg`.
- Tutorial: `fuentes/roblox-cartoon/opus-5-5-...-tutorial.md`, video en `Ref roblox/tutorial/`.

## Medidas del reel (ref1)
- 159 s, 1080x1920, 119 tomas: mediana 1.27 s, solo 2 % > 3 s, cortes secos (~45 cortes/min, 2-4 planos por frase).
- Personajes: avatar R6 clásico (torso 2x2x1, brazos/piernas 1x2x1, cabeza cilindro biselado 1.25), articulan solo
  hombros/caderas/cuello, sin squash. Actúan con swap de cara-decal + inclinación de cabeza + cámara.
  Ropa = texturas sobre los bloques (cuadros, rayas, lunares, punto). Pelo = mesh low-poly de catálogo.
- Monstruos: el mismo avatar con brazos x3.5 / piernas x3 / torso x1.4, cara blanca de ojos negros y boca de dientes.
- Sets: NO plástico liso con studs — escena tipo Roblox Studio con texturas reales (piedra, ladrillo, madera, papel
  pintado, alfombra), relieve, bloom, DOF, haces volumétricos, niebla en exteriores. Contraste avatar de bloques vs set rico.
- Luz por escena: noche cobalto + luna fría + prácticas naranjas; atardecer sepia; día saturado.
- Cámara: push-in lento ~35 %, contrapicado extremo ~25 %, dutch/roll ~12 % (hasta 90° en sustos), órbita corta,
  slide, cenital, handheld sutil, rack focus. FOV 55-70, 85-100 en monstruos. Movimientos cortos sin ease-out.
- Subtítulos: UNA palabra, centro a 70.7 % de alto, ~100 px sans extrabold, contorno negro 5 px + sombra,
  pop 0.85→1.06→1 en 90 ms; color por hablante (blanco narrador, azul, amarillo, rosa, naranja).
- Texto en el mundo: cuaderno manuscrito con scroll de cámara; casi sin números en pantalla.
- Sonido: voz única ~165 wpm, drone + caja de música, SFX por acción (campana, martillo, arañazos, latido, puerta).

## Fórmula de guion (tutorial)
Regla en la primera oración → 1-2 líneas que la dimensionan → 3-5 gags que escalan → héroe con nombre y edad →
giro "then one day" → última línea deadpan de 2-7 palabras que hace loop. ~45-55 s.
El reel aplica la misma lógica a una historia de terror ("reglas" de la casa) en 2:39.

## Qué se toma de cartoon3d
Kit de cámara (C3_CAMFX, contCamAt, DOF por plano, c3Fog), sets densos, sombras (C3_SHADOW), pipeline de voz/
sonido (VoiceStudio, make_cues, remix -14 LUFS), short_qa.py / sbs_sheet.py. Cambia: personaje (rig R6 de bloques
en 3D real en vez de billboards), ritmo de corte (1.3 s), subtítulo de una palabra al 70 %.

## Estudio de canales (2026-11-03) — `Ref roblox/<canal>/informe.md`
Top 6 shorts de Gneef (20-34 M vistas), GreenBroRants (16-29 M) y redfish1 (1-9 M). Patrones comunes:
- **Duración real de los hits: 60-175 s** (Gneef 112-174 s), voz rápida **~260 wpm** (4.4 palabras/s), casi sin pausas.
- Guion: "In this town/world, [regla absurda]." → "You see, [mecanismo + castigo PG irreversible]." →
  "So nobody here…" + 3-6 adaptaciones cómicas (abuela, cartero, escuela) → héroe "I", ~10 años, sin nombre o con
  defecto/habilidad plantada ("I've never lost. Not once.") → ser querido con nombre → "Until one night…" incidente
  (25-50 %) → escalada + intento fallido → giro 65-75 %: "And that's when I realized…" lectura LITERAL de la regla →
  ejecución en frases de 3-6 palabras + onomatopeyas (Snip! Ding!) y cortes 0.5-1 s → epílogo: el pueblo adopta el
  truco + callback tierno/irónico. Terror suave, final cálido, sin gore.
- Presente para el mundo, pasado para la historia. Una toma por cláusula (~1 corte cada 6.5 palabras, toma 1.4-1.5 s).
- Todo dato en el MUNDO 3D (contadores en el pecho, carteles, relojes, libros); nunca HUD.
- Subtítulos: 1 palabra, blanco + contorno negro grueso, ~70 % de alto (redfish: 2-6 palabras arriba con palabra clave amarilla).
- Look: Roblox Studio "Future lighting": suburbio Bloxburg (ladrillo, pinos, césped), PBR, bloom en emisivos, DOF, día saturado / noche azul con cálidos.
- Branding = protagonista recurrente (GreenBro: gorro-alien verde lima + camiseta verde; Gneef: chico pelirrojo; redfish: avatar rojo) + elenco fijo reutilizado.
- Títulos: la regla en 3-7 palabras + 1 emoji ("Everyone Has A String On Their Back 🧶").

## Reglas aprobadas (rbx-thursday, 2026-11-03) — aplicar en TODO video de este estilo
- Flujo: guion → voz (VoiceStudio "3d cartoon" +4 semitonos) → look → storyboard completo (1 toma por cláusula, ~1.3 s) aprobado ANTES de renderizar → render → QA cuadro a cuadro → sonido pro → título + miniatura.
- Pipeline de código: copiar pieces/rbx-thursday (src/engine.js, cast.js, props.js, moon.js, set-*.js, shots*.js por primeras palabras de la toma; board.mjs + board_sheet.py; render.mjs; sound/).
- Encuadre: el 9:16 es angosto → ENG.WIDEN 1.5; caras con ENG.face(); nada de cámaras dentro de paredes/objetos; la luna/objeto del cielo por encima de la línea de techos.
- Cámara (APROBADA): zoom rápido y fluido al inicio de cada toma (punch-in; cada 3ª toma pull-out), luego creep continuo + handheld leve.
- Personajes (APROBADO): nunca estáticos, pero SIN rebote/bailar todo el tiempo. Como GreenBro: cada uno con su propio movimiento independiente (mirar alrededor lento, cambiar el peso, un gesto propio cada 1.8–3 s desfasado entre personajes), ciclos de caminar reales cuando se desplazan. Los props sostenidos deben seguir la mano.
- Subtítulos: una palabra, Arial Black ~104 px, blanco con contorno negro, centro al 70.7 %, pop 0.85→1.06→1 en 90 ms.
- Sonido: música = TEMPOREX Numbers (styles/roblox/bgm/bgm.wav, ver abajo) 9 LU bajo la voz, ambientes 22 LU, SFX reales CC0 ≥4.5 dB bajo la voz, -14 LUFS; voz sin tocar.
- Referencias: para estudiar canales usar yt-dlp --flat-playlist sobre la página /shorts del canal y ver-youtube por video.
- Decisión (2026-11-03): aplicar el estudio GreenBro (fuentes/roblox-cartoon/greenbro-movimiento.md) en el próximo video — solo actúa el protagonista con poses sostenidas, boca por palabra, caminatas reales, dutch fijo en algunas tomas, shake solo en impactos — PERO los fast zooms se quedan exactamente como en la última versión de rbx-thursday.
- (2026-11-03) APROBADO: el modo 'gb' (GreenBro, ENG.MODE por defecto) es el estándar del estilo — un solo actor por toma con poses sostenidas, boca por palabra, caminatas reales, dutch fijo en ~mitad de tomas, reacciones de grupo sincronizadas, fast zooms de v1. Base: pieces/rbx-thursday (renders/final.mp4 = v2-greenbro).
- Héroe (verificado 2026-11-03 en 18 transcripciones de Gneef/GreenBro/redfish): NUNCA se dice la edad ni 'Me? I'm ten.' (0 de 18). Presentar al héroe por su defecto/rareza: 'I've never X. Not once.'
- Estructura fija, historia distinta (usuario, 2026-11-03): de las refs se copia la ESTRUCTURA (regla → gags → héroe con rareza → incidente → giro literal → final), no los personajes ni las frases. Cada historia elige su propio elenco y su propio ser querido según la trama (en 18 refs: hermana 2, hermano 2, mamá/papá 8, mejor amigo 6, abuela 5). Nada de fórmulas repetidas entre videos: ni "Me? I'm ten", ni "My little sister Pip is four", ni el mismo arranque del héroe.

## Variedad entre historias (2026-11-04) — detalle en `fuentes/roblox-cartoon/variedad-historias.md`
Medido en 132 historias (GreenBro 95, Gneef 21, redfish 16). Fijo: regla en la frase 1, siembra → cobro, incidente ~30 %, giro ~68 %, última línea seca. Todo lo demás cambia en cada video. Antes de escribir, rellenar la **ficha de premisa** (está en la nota) y compararla con las de los videos anteriores.
- **Mundo y lugares salen de la premisa** (torre, mar, luna, escuela, reino, servidor…), no del suburbio por defecto. Nunca repetir el recorrido calle → cartero → vecino → abuela → escuela → casa → ventana/techo. El clímax va en un lugar que solo existe en ese mundo.
- **Elenco nuevo en cada video.** No reciclar a Mr. Ortega, al cartero, a la abuela del gag ni a Pip. Los gags (0-5, normalmente 2-3) usan gente que la regla vuelve graciosa. En las refs, cartero + abuela + escuela juntos aparecen en 1 de 132 videos.
- **Ser querido según la trama**, rotando: papá, mejor amigo, mamá, abuelo, mascota, rival, crush o nadie. La hermana menor es solo el 6 %. Nunca el mismo personaje con nombre.
- **Rotar la apertura**: "In this world" (34 %), "In this town" (19 %), "Everyone/Every X…" (14 %), primera persona (8 %), "Once a year…", "Nobody is allowed…", "In my town", o una afirmación seca del mundo.
- **Héroe**: rareza (38 %) o sin presentación (31 %). Prohibido "Me? I'm ten" y "I wear this hood every day". La rareza que sirve de llave es nueva en cada video.
- **Giro**: el más común es la reinterpretación (la regla o el villano eran otra cosa, 52 %). La lectura literal es solo el 13 %. Otras opciones: objeto o juego plantado, el defecto del héroe. No repetir "And that's when I realized something" ni "After that, everything changed" en videos seguidos.
- **Rotar el incidente** (falla el sistema, alguien en peligro, se llevan a alguien, llega un visitante, el héroe rompe la regla), **quién resuelve** y **el final** (callback tierno 41 %, chiste oscuro 33 %, ritual 14 %).
- Prueba: entre dos videos nuestros, como mucho 2-3 de las 8 columnas de la ficha pueden coincidir (las refs promedian 2). Thursday y Sock coincidieron en 5 y compartieron 4 personajes de pueblo.

## Personajes "wild" de Gneef (desde 2026-11-08, obligatorio)

Para cada video nuevo, peinados, atuendos y expresiones se replican de Gneef (ref principal: "In This Town, You Are Not Allowed To Speak 🤫", crvPRFMpKLA).
Spec completa: fuentes/roblox-cartoon/gneef-looks.md (H1–H15 peinados, arquetipos de atuendo, F1–F16 caras, reglas "wild", checklist). Detalle por video: gneef-looks-per-video.md (15 shorts).
Claves: pelo 1.3–1.6× la cabeza y el objeto más fuerte del personaje; un color dominante por personaje; caras en extremos (punto deadpan ↔ mega grito), sin estados medios; mezclar noobs amarillos planos con avatares texturizados; un prop/rig raro por historia; grade de luz por escena (noche azul-violeta, rojo para el monstruo).

## Voz y duración (receta exacta, usada en rbx-chess y rbx-rope)

**Duración:** guion de ~490-500 palabras → video de **1:45-1:55** (rbx-chess 105.5 s, rbx-rope 113.4 s). Video = voz + 0.5 s.

**Voz (VoiceStudio, perfil "3d cartoon"):**
1. Partir el guion en ~10 trozos (`voice/c1..cN.txt`, cortar en punto; si un trozo pierde palabras en todas las tomas, partirlo en dos).
2. Generar cada trozo:
   `curl -s -X POST http://127.0.0.1:3900/generate --form-string text="$(cat cN.txt)" -F profile_id=227af074 -F num_step=32 -F speed=1.25 -F language=Auto -o cN_tK.wav`
3. Hasta 4 tomas por trozo; transcribir cada una con faster-whisper large-v3 (`voice/fix.py`, decodificar con ffmpeg a f32le; `av.open` falla) y quedarse con la que dice el texto exacto. Regenerar hasta que no falte ni sobre ninguna palabra.
4. Unir los trozos con 0.25 s de silencio entre ellos y pasar `styles/cartoon3d/tools/trim_voice.py` → `voice_final.wav` + `words.json`.
5. **Pitch +4 semitonos sin cambiar la velocidad:**
   `ffmpeg -i voice.wav -af "asetrate=48000*2^(4/12),aresample=48000,atempo=1/2^(4/12)" voice_final.wav`
6. `words.json` en formato `{word,start,end}`; corregir a mano palabras mal oídas (nombres, números en letras). Guardar el original como `words_raw.json`.
7. Verificar: transcripción completa del final contra el guion. La voz no se toca más (solo la ganancia del master).

Scripts de referencia: `pieces/rbx-rope/voice/` (gen.sh, fix.py, c*.txt) y `pieces/rbx-rope/sound/remix.py`.

## Música fija (desde 2026-11-07)

Siempre **"TEMPOREX - Numbers (Instrumental | Perfect intro loop)"** (https://www.youtube.com/watch?v=ecvbCDTcAco) desde el segundo 0, fade-out de 2 s al final, **9 LU bajo la voz** (20 y 12 LU quedaron bajos). El wav no está en git: en otra máquina bajarlo con
`yt-dlp --no-playlist -x --audio-format wav -o "styles/roblox/bgm/bgm.%(ext)s" "https://www.youtube.com/watch?v=ecvbCDTcAco"`.
