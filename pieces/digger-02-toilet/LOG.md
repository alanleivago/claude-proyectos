---
type: summary
status: complete
tags: [digger, digger-02, the-toilet, tiktok, mechayuki, megagirl, voicestudio, zero-fem]
relatedTo: [digger-channel, mechayuki-rules, digger-01-fridge, guion, storyboard]
---
# Digger 02: the toilet — registro de producción

## 0. Carpeta
Pipeline copiado de `digger-01-fridge` (engine con node_modules, voz-studio/scripts, audio/scripts, tools/sheet.py). El episodio 01 no se tocó.

## 1. Verificación de datos (guion.md)
| dato | veredicto | fuentes |
|---|---|---|
| John Harington, retrete con cisterna arriba y válvula que se abre con un asa (1596, "The Metamorphosis of Ajax"; instalado en Kelston, y uno para Isabel I en Richmond) | correcto. No tenía sifón, por eso olía y no se extendió | [humanprogress.org](https://humanprogress.org/heroes-of-progress-pt-30-sir-john-harington/), [Royal Collection Trust](https://col.rct.uk/collection/1121134/a-new-discourse-of-a-stale-subject-called-the-metamorphosis-of-ajax), [History Today](https://www.historytoday.com/archive/death-sir-john-harington) |
| Alexander Cumming, relojero escocés, patente del sifón en S en 1775 | correcto (primera patente de un inodoro; el S-bend frena el gas de la cloaca) | [Wikipedia](https://en.wikipedia.org/wiki/Alexander_Cumming), [History Hit](https://www.historyhit.com/alexander-cummings-the-scottish-pioneer-of-the-flush-toilet/), [Guinness](https://www.guinnessworldrecords.com/world-records/449887-first-patent-for-a-flushing-toilet) |
| Orinales vaciados por la ventana a la calle ("gardyloo") | documentado (Edimburgo, registros de 1662); algunos historiadores dicen que era menos común de lo que cuenta el mito | [The Scotsman](https://www.scotsman.com/whats-on/arts-and-entertainment/gardyloo-the-grim-story-of-unsanitary-edinburgh-1480434), [Wiktionary](https://www.wiktionary.com/wiki/gardyloo), [Science Museum](https://collection.sciencemuseum.org.uk/objects/co146585/chamber-pot-netherlands-1651-1780-chamber-pot) |
| Letrina: caseta de madera sobre un pozo | correcto (cuando el pozo se llenaba se movía la caseta) | [PHMC field guide](https://www.phmc.state.pa.us/portal/communities/agriculture/field-guide/privy.html), [Virginia Places](https://virginiaplaces.org/waste/outhouse.html) |
| "Humans spent two hundred years…" | **corregido**: de 1596 a 1775 van 179 años → "Humans spent **almost** two hundred years…" (una palabra añadida) | cálculo |

Simplificación aceptada: en el diseño de Harington el desagüe iba a un pozo negro o a la cloaca; el guion dice "sewer". La idea que cuenta (sin sifón el olor vuelve a subir) es correcta.

## Entregable
- **Vídeo:** `digger02_toilet.mp4`. Dura 96,7 s (voz 94,1 s + 2,6 s de outro), 1080x1920, 30 fps, H.264 crf 16, AAC 192k / 48 kHz. Audio: −14,0 LUFS, −1,2 dBTP, sin clipping.
- **Hojas:** `review/final_contact.png` (40 fotogramas del mp4). `review/final_stills/sheet_1-4.png` tiene inicio, mitad y final de los 32 planos.

## 2. Voz (VoiceStudio, megagirl `baab32b2`, cadena limpia)
- **Generación:** REST `/generate` con `num_step=32`, WAV, `effect_preset=raw`. Un archivo por párrafo (14) en `voz-studio/takes/raw/`, generados con `scripts/gen2.py` y comprobados con faster-whisper small.
  - "1775" se pasa al TTS como "seventeen seventy-five".
- **Whisper contra el guion:** coinciden los 14 párrafos.
  - p06 "Gross.": la seed 1 dijo "Woo!" y se descartó; la seed 2 dice "Gross".
  - p07: la seed 1 dijo "pulled a handle" en vez de "Pull the handle"; se cambió a la seed 2.
  - p13: whisper escribe "200" con cifras.
  - En la pista montada, whisper vuelve a coincidir con todo el guion.
- **Preguntas** (Praat, contorno de F0):
  - p13 "…on them?" sube de forma natural, de 220 a 590 Hz (+5,8 st, seed 1).
  - p09 "sewer?" bajaba en todas las tomas: −8,4 st en la toma elegida. De 12 seeds, solo la 2 subía, y era una subida-bajada.
  - Se aplicó una rampa PSOLA (`scripts/fix_q.py`) solo sobre "sewer?", sin cortes. Ahora sube de 327 a 519 Hz de forma monótona (**+8,0 st**) y whisper la transcribe con "?".
- **Montaje** (`scripts/assemble.py`):
  - Pausas entre párrafos de 0,45–0,65 s. "Gross" tiene **0,55 s antes y 0,85 s después**.
  - Pausas internas añadidas solo en silencio (< −42 dB): "asks:" +0,15 s, "sewer?" +0,30 s, "understood." +0,18 s. En "morning…" no había silencio y no se cortó.
  - Nunca se corta dentro de una palabra.
- **Cadena:** `retro_voice --preset genre --eq 0` (HPF 170 Hz + compresión + −14 LUFS), sin filtro digger → `takes/megagirl_track_clean.wav`.
- **Tiempos:** `scripts/prep_timeline.py` → `engine/timeline_megagirl.json`.
- El comentario de Jake cae en el **58 %** (la norma pide 35-40 %), porque el guion lo pone en el párrafo 9. Se respetó el texto.

## 3. Animaciones nuevas (`zero-fem/anim/build_anim.py`, 37 acciones)
- `squat`, `pinch_nose`, `pull_chain` (agarra en f10, abajo en f18, suelta en f24), `throw_out_window` (vuelca en f21) y `bend_pipe`.
- Se revisaron las hojas en `zero-fem/anim/sheets/`. Las 32 acciones anteriores no cambian (comprobado contra `actions_pre_digger02.json`); la copia de seguridad está en `zero_anim_pre_digger02.glb`.
- **Atrezo:**
  - La cadena y la palanca siguen al puño R mientras lo agarra.
  - El orinal va entre los dos puños y se vuelca en la suelta.
  - El tubo de cobre se reconstruye cada fotograma entre los puños y se dobla en S.

## 4. Imagen (`engine/film.js`, 32 planos; storyboard en `storyboard.md`)
- **FX nuevos en `fx.js`:** `flies`, `swirl` y `splat`.
- **Sets nuevos:** letrina (y corte del suelo sobre el pozo), noche, dormitorio, calle con ventana real, sala de Harington, corte de la casa con la cloaca, taller, diagrama del sifón y váter moderno en código. El váter de Quaternius se descartó porque tiene la tapa cerrada y no se veía el agua.
- **Transeúntes:** `SkeletonUtils.clone` (con `clone()` normal se quedaban todos en el origen), con un paso procedural en los huesos.
- **Revisión** (5 rondas de hojas: `review/t5` y `review/final_stills`). Arreglos:
  - Grado nocturno demasiado suave: los colores son lineales y el multiplicador baja a 0,13–0,38.
  - En el corte de la casa, la tubería quedaba detrás de la cara de tierra.
  - Roble claro pintado en código, porque la textura de tablas es casi negra y no se veía el asiento.
  - Plano 20 anclado a la palabra equivocada ("the" → 4.ª ocurrencia).
  - Agujero oscuro visible entre los pies en el `squat`.
  - Postigos que el puño atravesaba (#11): ahora se abren antes.
  - Caras de perfil en #8 y #28: se giró a 3/4 y en #28 se cambió `point` por `hands_on_hips`.
  - Encuadres de #4, #6, #9, #13, #14, #15, #24, #28, #30 y #31.

### Revisión por plano (stills de inicio, mitad y final contra mechayuki-rules)
Columnas:
- **Anim:** ella animada y el mundo reacciona.
- **Acción:** la acción se lee.
- **Manos:** sin atravesar; los props sobre superficies.
- **Overlay:** overlays dentro del cuadro y etiquetas legibles.
- **Cara:** expresión acorde a la línea y cara visible.
- **FX:** hay efectos.
- **Subt.:** subtítulo de 1 palabra con pop-in.

| # | Anim | Acción | Manos | Overlay | Cara | FX | Subt. | resultado |
|---|---|---|---|---|---|---|---|---|
| 1 | ✔ el hoyo crece, la nieve vuela | ✔ | ✔ | — | ✔ | ✔ | ✔ | PASS |
| 2 | ✔ | ✔ | ✔ | ✔ HUD | ✔ corazones | ✔ | ✔ | PASS |
| 3 | ✔ | ✔ | ✔ pala en las manos | — | ✔ | ✔ | ✔ | PASS |
| 4 | ✔ squat, temblor | ✔ (hoyo entre los pies) | ✔ | ✔ TOILET | ✔ | ✔ | ✔ | PASS (débil) |
| 5 | ✔ el hoyo se llena | ✔ | ✔ | — | ✔ asco | ✔ olor y moscas | ✔ | PASS |
| 6 | ✔ la caseta se monta, el pozo se hunde | ✔ | ✔ | ✔ | ✔ (pequeña) | ✔ | ✔ | PASS |
| 7 | ✔ la puerta se abre | ✔ | ✔ | ✔ OUTHOUSE | ✔ guiño | ✔ moscas | ✔ | PASS |
| 8 | ✔ temblor y viento | ✔ | ✔ | ✔ luna | ✔ 3/4 (algo de vaho por delante) | ✔ | ✔ | PASS |
| 9 | ✔ el orinal sale de debajo de la cama | ✔ | ✔ | — | ✔ | ✔ | ✔ | PASS |
| 10 | ✔ la tapa salta | ✔ | — | ✔ CHAMBER POT | — | ✔ | ✔ | PASS |
| 11 | ✔ postigos, vuelco, grumos | ✔ | ✔ orinal entre los puños | ✔ sol | ✔ (el borde del orinal tapa la barbilla 0,3 s) | ✔ | ✔ | PASS |
| 12 | ✔ caída, splat, charco | ✔ | ✔ | — | (lejos) | ✔ | ✔ | PASS |
| 13 | ✔ transeúntes, golpe en la cabeza | ✔ | ✔ | — | — | ✔ | ✔ | PASS (débil) |
| 14 | ✔ shake_head | ✔ | — | — | ✔ celdas disgust | ✔ | ✔ | PASS |
| 15 | ✔ present, punch-in | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | PASS |
| 16 | ✔ cadena, agua, remolino | ✔ | ✔ el asa sigue al puño | — | ✔ | ✔ | ✔ | PASS |
| 17 | ✔ | ✔ | ✔ | ✔ FLUSH TOILET | ✔ | ✔ | ✔ | PASS |
| 18 | ✔ el agua baja, la cloaca corre | ✔ | — | ✔ | — | ✔ | ✔ | PASS |
| 19 | ✔ el gas sube y sale | ✔ | — | ✔ | — | ✔ | ✔ | PASS |
| 20 | ✔ niebla, pinch_nose | ✔ | ✔ el puño delante de la cara, no dentro | — | ✔ asco | ✔ | ✔ | PASS |
| 21 | ✔ carta, punch-in | ✔ | ✔ | ✔ pegatina | ✔ | ✔ "?" | ✔ | PASS |
| 22 | ✔ point, guiño | ✔ | ✔ | — | ✔ | ✔ | ✔ | PASS |
| 23 | ✔ engranajes, reloj | ✔ | ✔ | ✔ 1775 | ✔ | ✔ | ✔ | PASS |
| 24 | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | PASS |
| 25 | ✔ el tubo se dobla | ✔ | ✔ el tubo entre los puños | ✔ S BEND | ✔ | ✔ | ✔ | PASS (débil) |
| 26 | ✔ agua y gas | ✔ | — | ✔ dentro del tubo (recortado) | — | ✔ | ✔ | PASS |
| 27 | ✔ punch-in | ✔ | — | ✔ TRAP | — | ✔ | ✔ | PASS |
| 28 | ✔ agua que brilla | ✔ | ✔ | ✔ flecha | ✔ | ✔ | ✔ | PASS |
| 29 | ✔ muro de ladrillos, el gas rebota | ✔ | ✔ | ✔ | ✔ en miniatura | ✔ | ✔ | PASS |
| 30 | ✔ contador | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | PASS |
| 31 | ✔ bocanada, shrug | ✔ | ✔ | — | ✔ | ✔ "?" | ✔ | PASS |
| 32 | ✔ wave ×2 | ✔ | ✔ | ✔ outro sobre su despedida, sin pantalla negra | ✔ | ✔ | ✔ | PASS |

**Sombras:** contacto a 0,68 en todos los planos. En el #4 se reduce para que se vea el hoyo.

**Etiquetas:** `pixfont` a escala 2 y "1775" a escala 4.

**Planos más débiles:**
- **#4:** el squat de frente se lee como "agachada"; el hoyo es una mancha oscura pequeña.
- **#13:** los transeúntes son relleno sin animación propia (paso procedural sencillo) y se solapan.
- **#25:** la S de cobre se lee como un tubo ondulado.

## 5. Sonido
- **Música:** `audio/scripts/music3.py`. Composición nueva en Sol mayor, 108 BPM, con bajo saltarín real, pulsado tipo ukelele, marimba, caja de música y batería suave CC0.
  - *Breakdown* bajo el comentario (55,9–64,0 s).
  - Corte con "fagot" cómico en "Gross" y resolución bajo el outro.
  - Va 7 LU bajo la voz, con *ducking* de 7 dB.
  - earshot: 107,7 BPM, Sol mayor, *playful and quirky* z 2,9, marimba z 3,0, *ukulele* z 2,65. Todavía sale "chiptune" con z 2,89 (el ep 01 v3 daba 2,5).
- **SFX:** 21 grabaciones CC0 de Freesound elegidas con earshot `rank` (todas con z ≥ 3,3; las *splat* y *splash* dan p_real 0,94–1,0), más reutilizados del ep 01 y blips de código. Ambientes por plano: viento, noche con grillos, calle con pájaros, sala, cloaca, tictac y zumbido del laboratorio.
- **Mezcla:** `audio/scripts/mix2.py` → `audio/megagirl/mix.wav`.
- **earshot `critique` (mezcla completa): launch-grade.** 20 de 22 métricas en rango, 0 críticos y 0 mayores, p_real 0,86, música presente el 95 %.
  - Con el vídeo: 84 % de los eventos visuales tienen sonido.
  - Avisos menores: casi mono (como las referencias de sinaboto) y poco sub.

## 6. Créditos
Ver `CREDITS.md`. Todo es CC0 o propio, así que **no hay ningún CC-BY obligatorio**. Los transeúntes y el relleno son de `lib-mml` recoloreado, por decisión del usuario.

## v2 final: `digger02_toilet_v2.mp4` (aprobado el storyboard v2)
- **Formato:** 96,7 s, 1080x1920, 30 fps, crf 16, AAC 192k. −14,0 LUFS, −1,2 dBTP.
- **earshot `critique`: launch-grade.** 21 de 23 métricas en rango, p_real 0,89, música presente el 95 %, 83 % de los eventos visuales con sonido. Avisos menores: casi mono y poco sub.
- **Hojas:** `review/final_contact_v2.png` y `review/v3f/sheet_1-4.png` (inicio, mitad y final de los 32 planos).
- **Voz:**
  - **Apertura:** la toma B_g2_s1 de la v2 sonaba a otra voz. Su similitud de hablante con WavLM-SV era 0,963 (los párrafos aprobados dan 0,985), su centroide 1606 Hz frente a 1366 y su F3 un −11,6 %.
    - Se regeneró con los ajustes de los párrafos aprobados (guidance por defecto, texto con "…"), 18 tomas, con `scripts/speaker_sim.py`.
    - Elegida: **T_gNone_s5**. Es la que más se parece de todas: sim 0,988, F2 +3 %, F3 −7 %, centroide 1329 Hz. earshot "energetic" z 6,9; la toma anterior daba 6,8. "Operator" empieza a 356 → 431 Hz.
    - Solo lleva la cadena limpia.
  - **p09:** se queda la v2 aprobada.
- **Plano #1:** se le añadió atrezo sin tapar la acción:
  - cajas y barriles con nieve, valla de tablas y farola a un lado, pinos;
  - un coche reliquia medio enterrado y una papelera (`lib-mml`);
  - un perro y un halcón que cruza el cielo.
- **Revisión por plano:** las 32 pasan.
  - Arreglos de esta ronda: la caca del orinal asomaba por la tapa cerrada (#10; ahora sale solo al abrirse) y los encuadres de #28 y #30.
  - La tabla de la v1 sigue valiendo para los planos que no cambiaron. Los cambiados están en `storyboard.md`, sección v2.

## v3: `digger02_toilet_v3.mp4` (versión vigente; solo cambia el audio)
- **Formato:** 96,7 s, mismas specs. −14,0 LUFS, −1,2 dBTP. Hoja de contacto: `review/final_contact_v3.png`.
- **Problema:** el primer "Operator" seguía sonando a otra voz. Ni con "!" ni con el texto sin "!", el "Operator" suelto de VoiceStudio salía igual.
- **Arreglo:**
  - Se reutiliza el **"Operator…" aprobado del ep 01 v3** (`digger-01-fridge/voz-studio/v2/megagirl/raw/megagirl_p01.wav`), cortado en el silencio que sigue (−44,5 dB).
  - Se empalma con el resto de la apertura del ep 02 ("I dug up…", toma T_gNone_s1). Ese corte también cae en silencio (−45,2 dB), con 8 ms de fundido y la misma pausa que en el ep 01.
  - Whisper: "Operator, I dug up another human artifact. Humans called it a toilet."
- **Verificación del "Operator" contra el del ep 01:**
  - earshot `compare`: cos **0,992**, todas las medidas dentro del rango.
  - F0 mediana 234 Hz frente a 233; F1/F2/F3 618/1890/2292 frente a 618/1895/2299.
  - Párrafo completo frente a los aprobados: sim 0,983.
- **Asset reutilizable:** `pieces/voice-fx/megagirl_operator.wav` (crudo de 24 kHz, con su silencio final) y `megagirl_operator_clean.wav` (cadena limpia). Script: `voz-studio/scripts/splice_operator.py`.
- **REGLA para próximos episodios:** el "Operator…" de apertura **nunca lleva "!"** ni puntuación exclamativa; con eso VoiceStudio cambia la entrega y el timbre. Hay que usar el clip `megagirl_operator.wav` empalmado en silencio, o generar con el texto exacto del ep 01 ("Operator… I dug up another human artifact.") y elegir la toma por similitud de hablante con `speaker_sim.py`.

## Descripción para TikTok
```
Operator… I dug up another human artifact: the TOILET 🚽 Humans spent almost 200 years just to stop their pipes from breathing on them?
Which human artifact should I dig up next? 👇 Follow @mechayuki for more artifacts.

#mechayuki #toilet #history #howitworks #science #ps1 #lowpoly #retrogaming #learnontiktok #plumbing

Music, voice and animation: original. Sounds: CC0 (Freesound).
```

