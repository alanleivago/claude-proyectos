---
type: log
status: in_review
tags: [punkpolyshorts, lowpolyshorts, kaneda-punk, blender, video-1]
relatedTo: [pieces/lps-own-face/guion.md, pieces/lps-hombre/LOG.md, fuentes/lowpolyshorts-style/especificacion-tecnica-del-estilo.md, fuentes/lowpolyshorts-style/estrategia-publicacion.md]
---
# lps-own-face — "You've Never Seen Your Own Face" (punkpolyshorts #1)

## 2026-10-30 — v1 renderizada
- **Salida:** `renders/lps-own-face.mp4`, 1080×1920, 30 fps, 38.73 s, EN. Voz mathomaly (VoiceStudio) acelerada a 1.1×. Sin música (como LPS). Corte tras "never" para el loop.
- **Pipeline:**
  1. `assemble.py` → `voice/voice.wav` y `timing.json`.
  2. `build.py` en Blender: `--board` para la hoja del storyboard, `--frames a,b` para los cuadros.
  3. `post.py`:
     - subtítulos;
     - flash del clic;
     - pixelado del logo en bloques de 8 px;
     - doble imagen en la vista POV;
     - los números 3D reemplazan al subtítulo.
  4. ffmpeg junta la imagen con `audio/final_mix.wav`.
- **Kit:** `lpskit.py`:
  - `Letters3D`: texto 3D letra por letra, con entrada en pop, bamboleo y salida girando.
  - Kaneda con texture swap y recoloreo.
  - Sets y texturas PS1.
- **Fuentes:**
  - `fonts/PunkPoly-Black.ttf`: propia, generada con `fonts/make_font.py` a partir del título de LPS. Sans pesada facetada; por ahora solo las letras del título.
  - Luckiest Guy (OFL) para "1977", "+30%" y REAL / MIRROR.
- **Nariz POV:** malla de píxeles en el espacio de la cámara. El puente angosto va arriba y la punta ancha abajo, como se ve desde el ojo. En el plano 16 se borra píxel por píxel.
- **Sonido pro:**
  - 25 grabaciones: 23 de Freesound y 2 de Commons. Créditos en `CREDITS.md`; CC BY: Terhen, InspectorJ y Dymewiz, a citar en la descripción.
  - Mezcla a −14 LUFS y −2.3 dBTP.
  - Las fuentes están en `audio/assets/`, fuera de git.
- **Revisiones:**
  - `revisar_render.py` marcó un desfase de la voz. Es un falso positivo: Whisper sobre el mp4 da una mediana de 2 ms contra `timing.json`.
  - Corregido a partir de esa revisión:
    - "+30%" ahora cae sobre el "30" hablado;
    - los números reemplazan al subtítulo;
    - movimiento de cámara en el plano 5;
    - las caras de los planos 1, 14 y 17 suben para que el subtítulo no tape los ojos.
  - Las flechas, tildes y etiquetas quedan porque el usuario aprobó el storyboard.

## 2026-10-30 — v2 (pedido del usuario)
- Voz "3d cartoon" (VoiceStudio 227af074), final completo (sin corte de loop), 37.7 s. Voz v1 guardada en voice/mathomaly_v1/.
- Música: "Comical" (Ahjay Stelino, Mixkit; no registrar en Content ID). 62 cues de SFX, −14 LUFS.
- Cámara rehecha según la spec de LPS: punch-ins ×1.3–2, órbitas, dutch, shake de mano (helpers shake/lk/punch/orbit_pos en build.py).
- Clones de colores: intencionales, el usuario los aprobó.
- Fixes de la 2.ª revisión: +30% centrado, 1977 sale al terminar "in 1977", etiquetas sobre las fotos, logo más chico, techo del lab, celular al costado de la cara, plano 4 detrás del hombro.

## 2026-10-30 — v3 (pedido del usuario)
- Música audible: estaba a −33 LUFS en una mezcla de −14; `music.json` gain −22 → −8.5 dB, ahora −22.5 LUFS a escala de master.
- Pausa de 0.26 s en "You see, your brain" (`assemble.py` COMMA). Todo el sonido se corrió +0.26 s desde 13.063 s; respaldo en `out/audio-review/v2_backup/`. Duración 37.96 s, END 1139.
- Plano 8: dos investigadores distintos, el profesor y una científica nueva. La científica se armó con:
  - cara generada con Flow (`tex/flow/`), pegada con `tex/make_sci.py`;
  - bata blanca, pelo negro, rodete.
- Plano 8, animación: charlan con las fotos escondidas tras la espalda; en "showed" las sacan de un tirón con un giro, más un punch-in. La cámara arranca alta sobre "1977".
  - SFX: cues `lab:whip:*` en `out/cues.json`.
- Cabezas sin "máscara":
  - `tex/headmap.py` saca la posición 3D de cada texel.
  - `tex/paint_heads.py` pone la foto frontal solo hasta ~50° y las orejas de los perfiles; el resto es piel o pelo pintados en 3D con línea del pelo.
  - La nuca de la científica es todo pelo.
- Vertex wobble PS1: `K.ps1_snap(cam)`, un modificador GN en todas las mallas que ajusta los vértices a una grilla de 360×640 en pantalla, igual que el shader del motor zombie. Verificado sobre los vértices.
- QA:
  - `revisar_render`: CASI. Sus avisos de subtítulos son falsos; `timing.json` tiene todos los bloques y el muestreo de 0.5 s se los salteó. El resto ya estaba aprobado: protagonista, logo, etiquetas y números.
  - Saltos entre cuadros: solo el flash del clic (f223) y los cortes rápidos del POV (f948, f964).

## 2026-10-30 — v4 (pedido del usuario)
- Música: "Waiting" de Bert Cole, del 16-Bit Starter Pack gratis. Bert Cole es el compositor de LPS.
  - Crédito obligatorio en la descripción: "Music composed by Bert Cole — bitbybitsound.com".
  - Nivel: −36.8 LUFS a escala de master, unos 20 dB bajo la voz. El usuario la pidió más baja dos veces.
  - v5 final: sin ambiencias; música −25 LUFS y SFX −35 LUFS en el master (voz ~−15). BUG corregido: mix.py masterizaba la cama a −14 LUFS antes de sumar la voz, así que los cambios de ganancia de v3–v5 no llegaban al video; mix_variant.sh ahora usa --no-master; punch whooshes −4 dB; filtro retro más fuerte (HP 230 Hz, LP 2.9 kHz, saturación tanh).
  - Alternativas en `audio/design/music_*.json`; las mezcla `out/audio-review/mix_variant.sh <tag>`.
- Voz retro: `voice/retro_eq.py`, un EQ que iguala la curva de la voz de LPS. Se midió en los stems de demucs de 4 shorts (`fuentes/lowpolyshorts-style/refs-audio`). Corta los graves bajo ~150 Hz y cae fuerte arriba de ~3 kHz.
- Mezcla: voz +3 dB y SFX −4 dB.
- l07: "You see." generado aparte, acentuado y con punto (con coma sale como pregunta), +2.5 dB, más 0.28 s de pausa y el resto de la frase. Tomas en `voice/takes/l07v/`.
- Expresiones nuevas en `make_faces.py`: stern, nervous (con gota de sudor) y skeptic.
  - Usos: espejo y foto = stern; nariz = neutral → grimace; "photos look wrong" = skeptic; multitud = neutral → nervous.
  - Base: `fuentes/lowpolyshorts-style/expresiones-protagonista.md`.
- Wobble: grilla de 240 filas (`PS1_GRID`); la de 640 no se veía a 1080.
- Duración 38.16 s, END 1145.
- QA: `revisar_render` dio CASI. Sus avisos son cosas ya aprobadas (flechas, tildes, plano POV) o errores de la ASR con la voz filtrada.
