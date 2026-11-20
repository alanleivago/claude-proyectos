---
type: log
status: active
tags: [ava-restfield, zombie-16-floor30-2, floor30, stalker, storyboard]
relatedTo: [zombie-06-floor30, zombie-15-lasttrain3, zombie-14-attic]
---
# Ep16 "Stuck On Floor 30… Part 2": log

## 2026-11-18: storyboard v1 (esperando OK del usuario; sin mezcla ni render)

**Guion:** pasada humanizer sobre `voz/guion.md` (aprobado): sin cambios. No tiene tics de IA (sin not-X-but-Y, tríadas ni remates); las notas entre corchetes quedan.

**BGM del cazador (regla nueva):** "Resident Evil 3: Nemesis OST - Nemesis' Theme" (subida de VideoGameOST1), https://www.youtube.com/watch?v=0KqffiEc3zk.
- **NO se descargó:** yt-dlp sin cookies → "Sign in to confirm you're not a bot". Paré ahí como pidió el usuario (sin cookies del navegador). Título/autor y estado en `audio/CREDITS.json` y `audio/bgm_giant/meta.txt`; log en `audio/bgm_giant/dl_failed.log`.
- Regla escrita en GUIA §4 y §6 y en STALKER.md: reemplaza al cover "Menacing Nemesis"; reinicio desde 0,5 s con entrada ~0,2 s en cada aparición, fundido al cambiar de escena, sin cortes desde la decisión.
- Apariciones (para la mezcla): calle/lobby 0–7,2 s · escalera 35,8–42,0 · mirilla 44,4 → decisión y final (47,9–62,0, sin cortes desde el último reinicio en 44,4).

**Voz** (`voz/`, pipeline del ep15: gen → pick → prep → assemble → fix_words → fix_caps → build_cues):
- VoiceStudio REST, voz `f2f8f8dc`, num_step 32, wav, speed 0.88, en. 14 tomas (una por cada mitad de "…"), 10 semillas cada una (140). "Oh, fudge" = toma del ep1 (`takes/04_fudge.wav`).
- pick.py: todas las elegidas exactas con whisper y F0 final descendente. Manual (`pick_manual.json`): 08_0 = s3 (s7 no tenía pausa antes de "In a stairwell"; earshot: "a woman speaking" z +4.5). Las piezas partidas 07_steps_0 y 08_peep_0 las re-verifiqué con whisper medium (el small oía "Bend…" / "the people").
- "thirty-twelve" se subtitula "3012". Decisión: opciones a TDEC+3,6 s, "Comment" a +6,85 s.
- **Duración:** voz termina en 56,8 s; END = 62,0 s. Pista: `voz/track.wav`.

**Motor** (`engine/`, copia del ep15 + modelos del ep6 + autos del ep13). Set nuevo `sets/floor30b.js`:
- Mundo del ep6 (torre, 3012, bañera 40 gal, cómoda contra la puerta, vecino 3011 con capucha y caja de diálogo RE).
- Nuevo:
  - calle con niebla espesa, autos abandonados, farolas apagadas, hidrante, charcos;
  - podio del lobby MERCY TOWER (vidrios rotos, OUT OF ORDER, puerta STAIRS);
  - balcones en la fachada (el de abajo del 3012 con planta y silla);
  - puerta 3012 con bisagra y cadena;
  - pasillo de 3 m de alto y 2 m de ancho (el cazador entra sin atravesar);
  - hueco de escalera (escena aparte, pisos 19–32, números pintados, anillos de sonido que suben, huellas mojadas);
  - nota bajo la puerta + FILE;
  - teléfono POV nivelado (18 %, modo avión, + HOURS);
  - máquina de escribir DAY 3, First Aid Spray en la cómoda, hierba verde en la repisa, lámpara a pilas (apagón).
- Gramática del ep15: placas 1 OPEN (rojo) / 2 STAY QUIET (blanco), rebobinado glitch 1,37 s, decisión RE3 en negativo con el cazador golpeando 3012 (solo hoja y cadena; la cómoda se corre 3 cm por golpe; luz verde por la rendija) y menú vivo en 4 ángulos (ancho, bañera, balcón de abajo, cara de Ava).
- Apertura: el cazador sale de la niebla (primero la luz verde, cuerpo negro) y entra al lobby; grúa del ep6 extendida desde la calle (la niebla se abre al subir); HUD en 2,15 s con la placa FLOOR 30; dentro del lobby empuja la puerta STAIRS.
- film.js: CUTS del ep16, HUD FLOOR 30, estados CAUTION → DANGER (mordida) → FINE (esperando) → CAUTION (nota) → DANGER (pasos).

**Autorevisión:**
- Hoja de inicio/mitad/final de los 25 planos (`review/qa/all_sheet.png`). Preview de QA de 62,0 s en el scratchpad: scan de parpadeo de cuadro único, 1 caso (0,2 s, oscurecimiento de un cuadro en la calle; queda para el render final). Tiras a 5 fps de la calle, la mirilla y los pies.
- Arreglado:
  - el cazador sin encuadrar en la calle (la cámara sigue su pecho);
  - la cámara de la mirilla metida dentro del abrigo (pasillo más ancho, se planta más atrás, ojo de pez 128°);
  - la cadena que cruzaba el hueco con la puerta abierta;
  - el vecino de costado al abalanzarse;
  - la nota tapada por la cómoda (la cómoda corrida 0,35 m);
  - los anillos de sonido que tapaban la imagen;
  - planos de más de 4 s partidos (02a, 06a);
  - texto de la nota fuera del papel;
  - papel negro en la máquina.

**Storyboard:** `storyboard_v1.png` (33 paneles con frames reales y la voz real + fila de 8 objetos sin HUD ni subtítulos). `review/storyboard.py --times` / `--props`.

## Pendiente (después del OK)
- Bajar el BGM (YouTube pide sign-in) y mezclar con `audio/scripts/mix16.py` (copiar de mix15).
- Render, revisión cuadro a cuadro, `revisar_render.py`, poster, entrega share.

## 2026-11-19: 8 notas del usuario en el LIVE PREVIEW de VideoHub (sin render ni mezcla)
- **1:** fuera la caminata por la calle. Abre con la grúa (`01_crane`) desde ese cuadro; a los 2,2 s corta a `01b_window` (Ava en la ventana, entra el HUD); en "something big just walked into the building" el cazador en el lobby. La voz no cambió.
- **2:** caminata lenta del cazador en el lobby: 0,7 m/s, pasos de 1,6 m atados a la distancia, balanceo de hombros y cadera (`roll` en `pose`), cabeza baja y adelantada, puños que se abren y cierran.
- **3:** la nota de 05b quedaba visible en otros planos; `state()` la resetea, igual que la puerta STAIRS, las huellas y la luz del balcón. El parpadeo del lobby ahora es suave (0,72).
- **4:** la cómoda queda en x = −1,0 (cubre el canto libre de la puerta). Ava la empuja de costado desde la izquierda con `push_heavy` una vez, las manos en el canto, sin atravesarla.
- **5:** vecino sin la ropa rota del zombi. Colores por vértice en el cuerpo (sudadera carbón de manga larga, vaqueros, zapatillas, piel en cabeza y manos) y gorra de lona con visera en lugar del "casco".
- **6:** sin esferas de ojos; la revelación es la piel pálida.
- **7:** el tamaño de letra de la nota se ajusta para dejar 25 px de margen.
- **8:** negativos de 1,2 s y 1,6 s; el color vuelve a +4,3 s; la voz de las opciones va a TDEC+2,3 y "Comment" a +4,75. Menú vivo ~10 s en 5 cambios de ángulo. END sigue en 62,0 s; la voz termina en 55,5 s.
- **Puntos débiles:**
  - el cazador desde arriba en la escalera, más cerca y con luz;
  - los pies, ahora de frente;
  - el ancho de la decisión: cámara alta, Ava corrida y la puerta con la cadena visible bajo el menú;
  - el balcón con luz;
  - Ava pegada a la mirilla.
- **QA:** preview en el scratchpad, scan de parpadeo 0, tiras del lobby y de la cómoda. Las 8 notas quedaron como "fixed" en VideoHub.

## 2026-11-19 (2): notas #10 y #11
- **#10, el piso parpadea a 6,97–7,03 s:** el plano del suelo era un solo quad de 5 km con el snap PS1; el redondeo de sus vértices lejanos lo inclinaba y tapaba el piso del lobby. Ahora va subdividido 80×80, sin snap y en y = −0,02.
  - Medido: brillo del piso estable en cuadros consecutivos de 6,6 a 7,2 s.
  - Scan de caídas cortas por región en todo el preview: sin otros casos (solo el glitch intencional del rebobinado).
- **#11, el vecino:** gorra de 6 paneles con costuras, botón y visera curva, orientada desde el hueso de la cabeza. Heridas y manchas de sangre por color de vértice (cuello, mejilla, antebrazo izquierdo, pecho). Fuera el bloque negro: la placa de sombra y el pelo en caja.
- **BGM:** el usuario dejó `audio/bgm_giant/nemesis_theme.mp3` para la mezcla.

## 2026-11-19 (3): nota #12 + efectos PS1 de Vera
- **#12:** la luz verde del cazador ya no ilumina medio torso. Antes era una PointLight de 1,8 m más un halo de 0,5 m en el centro del pecho. Ahora solo brilla el dispositivo hexagonal: luz de 0,3 m, intensidad 0,22–0,35, y un sprite chico encima.
- **Efectos de `pieces/vera-02`, mismos parámetros:**
  - **Wobble:** snap de vértices a la grilla de 270x480 de Vera (celdas de 4 px a 1080) solo en el set; los personajes van sin snap, como Vera v2 (Ava, vecino con su gorra y venda, cazador). `lib.js`: `SNAP_W`/`SNAP_H`, `ps1Clone(..., {wobble})`, `?herosnap` devuelve el snap a Ava.
  - **Personajes a 15 fps, cámara a 30** (`film.js`, el "film mode" de Vera, `?afps=`): dos pasadas por cuadro. La primera hace el update en t real y guarda la cámara; la segunda lo hace en t escalonado a 15 fps (personajes y escena) y restaura la cámara.
  - **Movimiento de cámara** (`filmUpdate` de Vera): empuje lento de 0,12 m a lo largo del plano y vaivén de mano de 4 mm en x y 3 mm en y. Planos sin escalonar: el teléfono POV (lleva el teléfono pegado a la cámara) y el rebobinado. Planos sin vaivén: los anteriores más la mirilla, FILE, el negativo y los pies.
  - **Blur** (`main.js`, del `main_sb.js` de Vera):
    - DOF de recogida en los primeros planos: Ava en la ventana, 02a, el brazo, "Oh, fudge", la máquina de escribir y los pies. Rango 0,15–0,4 m, máximo 2,6 px a 270, que son 3,5 px a 360.
    - Lente barril k = 0,016, solo en la imagen.
    - Bloom solo de lo emisivo (alpha > 1: EXIT, paneles del lobby y del pasillo, lámparas de la escalera, farolas): sigma 1,5 + 4,5 px de Vera escalados a 360, ganancias 0,25 + 0,6.
  - **Solo en post** (no se ven en el live preview): viñeta (interior −30 %, exterior −45 % en `01_crane`) y grano animado 2x2 (±6, 12 patrones), en `tools/post16.py` (copia de `vera-02/tools/post_film.py` sin sus tarjetas). Pipeline final: `node engine/render_film.mjs final renders/raw.mp4 audio/mix16.wav` y después `python tools/post16.py renders/raw.mp4 audio/mix16.wav "renders/<titulo>.mp4"`, que sale ya en versión share. Ojo: el motor ya tiene su viñeta por plano (`vign`), así que en el final se suman las dos.
  - No se portó la resolución chica de Vera (270x480); ep16 sigue a 360x640.
- **QA** (preview en el scratchpad `qa3.mp4`):
  - planos con cámara en movimiento: 0 % de cuadros repetidos, así que la cámara corre a 30 sin tartamudeo;
  - 1 pop en 38,77 s: el plano de los pies saltaba de piso a mitad del plano, y con las dos pasadas cámara y cazador quedaban en pisos distintos; ahora el piso del plano queda fijo y los cuadros consecutivos de 37,85–39,15 s están limpios;
  - sin caídas cortas por región.
- **BGM:** `audio/bgm_giant/nemesis_theme.mp3` para la mezcla.

## 2026-11-19 (4): final entregado
- **Ava con su wobble de siempre** (aprobado por el usuario): snap en la grilla 360x640 como los episodios anteriores. El set queda en la grilla de Vera (270x480); el vecino y el cazador, sin snap. `?noherosnap` lo apaga.
- **Mezcla** `audio/scripts/mix16.py` (desde mix15):
  - Tema del cazador `audio/bgm_giant/nemesis_theme.mp3`: reinicia en 0,5 s con entrada de 0,2 s en cada aparición (lobby 5,12–7,22 · escalera 35,78–41,96) y suena sin cortes desde la mirilla, 44,39 s, hasta el final (golpe + decisión).
  - BGM CC0 610534 cuando el cazador no está; música fuera en YOU DIED y el rebobinado.
  - Gancho 0–10 s a 7,0 LU bajo la voz; música a 10,3–10,7 LU bajo la voz por tramo.
  - SFX:
    - golpes en 3012 (puerta, cadena, cómoda que se arrastra) en cada golpe de la decisión;
    - gruñidos y rugidos en cada aparición;
    - pasos descalzos con la fase de la zancada (con eco en el hueco de escalera);
    - teclas de la máquina, papel, cerrojo, puerta, lunge del vecino;
    - latido 40/60 bpm, drone 871189.
  - Master estéreo −14,0 LUFS, −1,3 dBTP (wav) / −1,2 dBTP (mp4).
  - earshot timeline: 10 cues con un evento a menos de 100 ms (mediana 3,5 ms).
- **Render:** `render_film.mjs` (el hub_render no conoce este pipeline) → `tools/post16.py` (viñeta + grano + share CRF 24). La doble viñeta no oscurece de más (borde 71 → 64 de 255): queda.
- **QA del mp4 exportado:**
  - 1860 cuadros, video y audio de 62,0 s desde 0;
  - pops 0, caídas cortas 0;
  - negros solo en los dos parpadeos de la decisión, que son intencionales;
  - hoja de contacto a 1 fps en `review/qa/final/sheet_1fps.png`.
- **Poster** `review/poster_v1.png` (receta del ep15, `review/poster_layers.sh` + `review/poster.py`): el cazador enorme arriba en el lobby de MERCY TOWER (sin techo, la cabeza en la niebla), Ava al frente con la pistola negra a la cadera, HUD real FLOOR 30 · Danger abajo. Composición con `AS=0.8 ADY=-140 LEG=0.755`.
- **Entregado:**
  - LucidLink `Ava Restfield/CHOOSE - Stuck On Floor 30… Part 2.mp4` + `Miniaturas/….png`;
  - `/Users/Shared/Contenido/Ava Restfield/` + `Imagenes y miniaturas/`;
  - sin mp4 en `renders/`.
  - GUIA §8 actualizada.

## 2026-11-19 (5): miniatura anterior + música del cazador hasta el final
- **Música:** el tema del cazador se cortaba en 41,96 s (el plano de Ava en la mirilla, fin del tramo de la escalera) y volvía a arrancar en 44,39 s. Además, el último tramo bajaba 6 dB en los últimos 0,4 s.
  - Ahora suena sin cortes desde que el cazador sale en la escalera (35,78 s) hasta el último cuadro, con solo 0,25 s de cola.
  - Tramos: lobby 5,12–7,22 · escalera → final 35,78–62,0.
  - Stem del tema (`audio/stem_giant.wav`, nuevo) en los últimos 3 s: −26,4 LUFS, constante hasta 61,7 s.
  - earshot timeline del stem: sin huecos de 35,9 a 62,0.
  - Mezcla −14,0 LUFS, −1,1 dBTP (mp4).
  - Remux sobre la imagen entregada (`-c:v copy`).
- **Miniatura:** vuelve el estilo anterior (ep14). Bloque `?thumb` en `floor30b.js`: pose aprobada con la pistola negra a dos manos y el cazador detrás en el lobby de MERCY TOWER; HUD real FLOOR 30 · Danger arriba al 48 %. Archivo `review/thumb_v1.png`. GUIA §7: fuera la regla del poster, con la nota "desde 2026-11-19 se vuelve a las miniaturas anteriores".
- **Reentregado:** mp4 y png sobrescritos en LucidLink y en /Users/Shared/Contenido, mismo título y sin duplicados; sin mp4 en `renders/`.
