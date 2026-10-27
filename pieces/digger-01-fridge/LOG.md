---
type: summary
status: complete
tags: [digger, digger-01, the-fridge, tiktok, render, megagirl, voicestudio, chiptune, zero-fem]
relatedTo: [digger-channel, guion, storyboard, voz-studio, voice-fx, zero-fem]
---
# Digger 01: the fridge — registro de producción

## v3 (versión vigente): `digger01_megagirl_v3.mp4`
- **Duración y formato:** 92,6 s, 1080x1920, 30 fps, H.264 crf 16, AAC 192k. −14,0 LUFS, −1,2 dBTP, sin clipping.
- **Hoja de contacto:** `review/final_megagirl_v3.png`. Stills de cada plano revisados antes del render: `review/v3_1-5.png`.

### 1. Música nueva, en el estilo de sinaboto
**Análisis de las 9 pistas de referencia.** Se separaron con demucs htdemucs en 4 stems (`audio/ref_sina/stems/`) y se midieron con earshot (describe, measure y compare) y con LUFS por stem:
- **Tempo:** 103–112 BPM.
- **Tonalidad:** mayor (F o G).
- **Instrumentos:** música juguetona y peculiar, tipo caja de música, marimba, pizzicato, ukelele y piano infantil.
- **Bajo:** es el stem más fuerte (−23,5 LUFS frente a −25,5 de otros instrumentos y −28 de la batería). Earshot lo describe como "bass guitar" y "boomy".
- **Batería:** suave.
- **Espectro y estéreo:** casi mono, espectro oscuro (centroide 300–370 Hz) y muy tonal.
- **Nivel bajo la voz:** la música va unos 6,6 LU por debajo de la voz.

**Pista nueva (`audio/scripts/music2.py`).** La composición es original, sin melodías de las referencias:
- 110 BPM en Fa mayor, con progresión I–vi–IV–V / IV–V–iii–vi.
- Bajo redondo en registro real (F2), con patrón saltarín.
- Melodía en pizzicato (cuerda pulsada Karplus-Strong).
- Acordes de marimba a contratiempo (síntesis modal) y caja de música en los inicios de frase.
- En el *breakdown*, bajo el comentario de Mike, entra un pad.
- Kit suave con one-shots CC0 de Freesound: bombo, charles, shaker y chasquido.
- Resuelve en un acorde bajo el outro.

**Comparación con earshot:**

| | coseno con las refs | tipicidad z | chiptune z | etiquetas |
|---|---|---|---|---|
| chiptune v2 | 0,60 | −12,7 | 5,1 | — |
| pista nueva | **0,68** | **−8,3** | 2,5 | *playful and quirky* z 3,0, *cheerful ukulele* 2,9, *marimba* 2,7 |

La distancia de rasgos medidos bajó de 1,03 a 0,62. Los stems de referencia llevan restos de voz y SFX de la separación, así que nunca van a parecer "típicos" del todo. La música queda unos 7 LU por debajo de la voz, como en las referencias. Earshot `critique` de la mezcla: launch-grade.

### 2 y 4. Etiquetas y final
- Todas las etiquetas e indicadores usan ahora la fuente bitmap a escala 2: glifos de 14 px en baja resolución, 56 px en la salida, más o menos la altura del subtítulo. Las etiquetas amarillas de términos pasaron de escala 3 a 2.
- **Final:** MECHAYUKI a escala 3, una placa "ARTIFACT 001" y "FOLLOW @MECHAYUKI" en una píldora roja más pequeña. Se quitó "MORE ARTIFACTS SOON".

### 3. Cara de asco
Se pintaron celdas nuevas `disgust` (celda 12 de los dos atlas) en `zero-fem/face/paint_face.py`:
- **Ojos:** entrecerrados, con el párpado superior inclinado hacia la nariz y el inferior subido por la mejilla, y cejas de enfado.
- **Boca:** mueca ondulada con las comisuras hacia abajo y la punta de la lengua fuera.

Se reconstruyó todo (`build_face.py` → `zero_fem.glb`/`.blend` → `build_anim.py` → `zero_anim.glb`) y se revisó en `face/expressions.png`. El plano #10 ("Gross") usa ahora disgust/disgust todo el tiempo, sin aleteo de boca.

## v2: solo megagirl, canal MECHAYUKI (@mechayuki)
| archivo | qué es |
|---|---|
| `digger01_megagirl_v2.mp4` | **final v2, 92,6 s**: 1080x1920, 30 fps, H.264 crf 16, AAC 192k. −14,0 LUFS, −1,1 dBTP. earshot `critique`: launch-grade, 19 de 21 métricas en rango, 0 problemas críticos o mayores, 89 % de los cortes con sonido |
| `digger01_megagirl_v2_rawvoice.mp4` (+ `audio/megagirl/mix_rawn.wav`) | la misma imagen y mezcla, pero con la voz **cruda** (solo normalizada a −14 LUFS), para comparar |
| `review/final_megagirl_v2.png` | hoja de contacto del final (40 fotogramas) |
| `review/v2_1-5.png` | stills de inicio, mitad y final de los 25 planos, revisados antes del render |

El nombre del canal y el handle están en una sola constante: `CHANNEL` / `HANDLE` en `engine/film.js`.

### Correcciones v2 (todas comprobadas en stills)
1. **Voz:** se quitó el filtro `digger`. La voz va limpia con `retro_voice --preset genre --eq 0`: corte de graves a 170 Hz, compresión suave y −14 LUFS, sin EQ de curva, retro, bitcrush, comb ni aplanado de entonación. Se probaron `genre` (EQ completa), media EQ y la voz cruda. En earshot las tres suenan casi igual (todas con el mismo "alarm clock beeping" débil, z ~2,9, que viene del F0 alto de la propia voz, ~288 Hz, no del procesado). Se eligió la más limpia, y la cruda va como alternativa.
2. **Entonación:**
   - p13 se regeneró con "?". La seed 6 sube **+12,9 st** en "leftovers?" (8 tomas medidas con Praat).
   - En p06, "Why not just make cold?" baja en todas las tomas del TTS (31 tomas, de −20 a −0,4 st). Se tomó la toma más plana (seed 6) y se le aplicó una rampa PSOLA de 0 a +7 st en "cold?", y se insertó en p06 cortando solo en silencio. Resultado: **+4,2 st**.
   - Los demás finales de frase bajan, como deben.
3. **"Gross":** 0,5 s de pausa antes y 0,85 s después. Plano nuevo de reacción (corte seco): primer plano con `shake_head`, cara de asco (shocked/bigShock → half/blep → angry/frown), olor verde, sudor, impacto verde y vibración de cámara.
4. **Excavación:** el hoyo crece en cada palada (en la palanca, f15) y los terrones salen volando en la tirada (f27) a un montón de nieve que también crece. Pasa en el plano 1 y en el 3, y el montón queda en los planos siguientes.
5. **Indicadores:** se hizo una fuente bitmap 5x7 propia (`engine/pixfont.js`) a escala 2–4, con 1 px de espacio entre letras, sobre placa oscura con borde de color. Pixelify cerraba la C y la E a tamaño pequeño. Las etiquetas amarillas usan la misma fuente con contorno.
6. **Escáner:** ahora es un recuadro pequeño de esquinas sobre la nevera y una sola placa: SCANNING → ARTIFACT 001.
7. **Sombra** más oscura (opacidad 0,45 → 0,68).
8. **Agujeros del lago:** están recortados en la placa de hielo y tienen pozo (paredes y agua oscura). Ya no flotan.
9. **Cubo:** se inclina hacia el montón y deja caer un chorro de serrín visible.
10. **Manos:**
    - La sierra se reorientó (v1).
    - La caja de sobras pasó a ser un plato apoyado sobre el puño.
    - El serpentín se separó del puño.
    - Se quitó el puño gigante del plano del evaporador.
11. **Lupa:** el agua queda recortada dentro del círculo.
12. **Tiritona:** líneas de temblor, vaho y destellos de hielo. Se añadieron más efectos en todo el vídeo: sudor y destellos en la sierra, en el icehouse y en el vaso; bombilla en el icebox; "?" en la pregunta de Mike; "!" al ver la carne; olor en las sobras.
13. **Sobras:** plato azul con un muslo mordido y guisantes, y olor encima.
14. **Final:** ya no acaba en pantalla negra. Sobre la despedida aparecen MECHAYUKI, "ARTIFACT 001: FRIDGE", el botón rojo "+ FOLLOW @MECHAYUKI" y "MORE ARTIFACTS SOON". La música termina en un jingle y no hay apagado CRT.
15. **Planos débiles de v1:**
    - #19: el compresor ahora es de acero sombreado, con anillos, patas, placa de aviso, tubos de entrada y salida, y COLD GAS IN / SQUEEZE! / HOT GAS OUT.
    - #8: el icehouse empieza en "This is" (1,9 s).
    - #7: se reencuadró para que se le vea la cara al verter.

### Planos v2 (megagirl, inicio en s; C = corte seco, M = mosaico) — todos PASS
#1 0,00 C · #2 3,30 C · #3 5,58 M · #4 7,80 M · #5 11,88 M · #6 14,45 M · #7 18,06 M · #8 21,39 C · #9 23,07 M · **#10 27,27 C (reacción "Gross")** · #11 28,22 M · #12 33,60 C · #13 36,59 M · #14 41,21 C · #15 45,04 M · #16 50,52 M · #17 53,18 M · #18 56,85 C · #19 61,78 M · #20 65,47 M · #21 68,67 M · #22 72,85 M · #23 76,98 M · #24 81,89 M · #25 86,43 M (outro 88,9–92,6)

Puntos débiles que quedan:
- #22: con `warm_hands` se le ve la cara de perfil.
- #3: en parte de cada palada mira hacia abajo y el pelo le tapa la cara.

---
## v1 (archivo)

## Entregables
| archivo | voz | duración | formato |
|---|---|---|---|
| `digger01_megagirl.mp4` | clon del usuario **megagirl** (`baab32b2`) + `retro_voice --preset digger` | **90,2 s** (voz 88,3 s + 1,9 s de apagado CRT y cartel) | 1080x1920, 30 fps, H.264 crf 16, AAC 192k |
| `digger01_studio.mp4` | voz diseñada **Digger android (original)** (`5120fcba`) + `digger` | **71,4 s** (voz 69,5 s + 1,9 s) | igual |
| `review/final_megagirl.png`, `review/final_studio.png` | hoja de contacto de cada final (36 fotogramas) | | |
| `review/mg_1-4.png`, `review/st_1-4.png` | stills de inicio/mitad/final de cada plano, ambos timelines | | |

Audio de los dos: −14,0 LUFS integrados, pico real −1,2/−1,1 dBTP, 0 muestras recortadas, LRA 1,7–1,8 LU. earshot `critique` (con el vídeo): **launch-grade**, 20 de 23 métricas en rango, 0 problemas críticos o mayores, p_real 0,85, música presente el 100 %, 75–86 % de los cortes con sonido a ±100 ms.

## 1. Voces
- Guion v2 (14 párrafos) generado por REST de VoiceStudio (`/generate`, `num_step=32`, WAV, `effect_preset=raw`), un archivo por párrafo, cada toma verificada con faster-whisper (`voz-studio/scripts/gen2.py`). Ambas voces coinciden con el guion. En megagirl se cambiaron dos tomas: p03 seed 1 → 3 (whisper oía "hit them" en vez de "hid them") y p04 seed 1 → 2 (no había pausa antes de "Gross").
- **megagirl, `digger` contra `genre`:** se queda **`digger`**. La voz cruda está muy aguda (F0 307 Hz, rango 196–483). Con `genre` no cambia (308 Hz) y earshot la lee como **"alarm clock beeping" (z 3,0, fuerte)**, con *Ding* 0,27 en AudioSet. Con `digger` baja a 260 Hz (dentro del 230–270 objetivo, σ 4,3 st) y earshot la lee como voz: *voice-over narration* z 4,4 y *a woman speaking* z 4,1, sin ninguna etiqueta fuerte de pitido. Además gana el toque androide.
- Montaje (`scripts/assemble.py`): recorte de silencios, pausas de 0,40–0,65 s entre párrafos (0,62 s después del hook, 0,65 s antes de "That's why the back…", 0,62 s antes del cierre). Se añadieron pausas internas **solo donde había silencio** (< −42 dB): "summer… so" (+0,10 s), "underneath. Cold" (+0,22 s), "swimming. Gross" (+0,20 s) y, solo en megagirl, "understood. Logging" (+0,18 s; en studio no había silencio y no se cortó). Nunca se cortó dentro de una palabra.
- Tiempos por palabra: faster-whisper small (CPU int8, audio cargado con wave + numpy) sobre la pista montada, alineados al texto del guion y refinados con la envolvente (inicio real tras cada pausa) → `engine/timeline_<voz>.json`, que también lleva la pista de boca a 15 fps.
- **Duraciones:** megagirl 88,31 s (habla lenta, 2,35 palabras/s). Studio 69,53 s (3,0 palabras/s).

## 2. Assets
Los modelos de Poly Pizza se cargaron en el Blender vivo por el MCP (escena nueva `digger_assets`; la escena del usuario no se tocó). El addon del MCP es una versión vieja (protocolo 14) y no deja usar `import_asset` de Poly Pizza, así que los GLB se bajaron de `static.poly.pizza` y se importaron con `execute_blender_code`.
- Usados: sierra (CC0), tenazas (CC0), trineo (CC-BY), bañera (CC0) y cubo (CC0).
- La alcachofa de ducha de Poly Pizza se descartó: tiene 27 000 polígonos y no es PS1. La ducha está hecha en código.
- Todo está en `engine/models/cc_*.glb`. Detalle completo en `CREDITS.md`.

## 3. Animaciones nuevas (`pieces/zero-fem/anim/build_anim.py`, `zero_anim.glb` reconstruido: 32 acciones)
| acción | qué hace | chequeo |
|---|---|---|
| `shiver` | loop de 16 f: brazos cruzados frotando, hombros arriba, temblor alternado cada 2 f (lineal, sin lag) | suela 0,000, sin deslizamiento |
| `warm_hands` | loop de 40 f: agachada con las palmas al frente a la altura del pecho y vaivén suave | suela −0,001, sin deslizamiento |
| `drop_object` | 45 f: mano L extendida sostiene, en f22 la muñeca se abre (suelta), rebote y mira abajo. El prop se suelta con `scene.attach` y cae con gravedad | suela 0,000 |

Se revisaron las hojas `zero-fem/anim/sheets/{shiver,warm_hands,drop_object}.png` (3/4, lado y frente). El GLB anterior queda como `zero_anim_pre_digger.glb`.

## 4. Montaje (`engine/film.js`, `?v=megagirl` / `?v=studio`)
Una sola lista de 24 planos: el storyboard sin el plano 9, adaptada al recorte. El tiempo sale de las palabras de cada voz.
- Las caras usan el plan de expresión de cada plano, con parpadeo cada ~3,4 s. La boca alterna talkA/talkO por sílaba cuando hay voz (umbral de envolvente) y vuelve a la boca de la expresión en las pausas.
- Las etiquetas amarillas aparecen con pop justo en su palabra. Las disolvencias de mosaico se centran en la pausa y los cortes secos caen sobre la palabra.
- `window.CUES` exporta los eventos de sonido para la mezcla.

| # film | # story | inicio megagirl / studio (s) | trans. | contenido | resultado |
|---|---|---|---|---|---|
| 1 | 1 | 0,00 / 0,00 | — | cava junto a la nevera enterrada; *clang* + impacto + "!" en "artifact" | PASS |
| 2 | 2 | 3,28 / 2,60 | C | HUD de escaneo "ARTIFACT 001"; *cheer* + ojos de corazón en "fridge" | PASS |
| 3 | 3 | 5,59 / 4,51 | M | cava el hoyo; la pala va en las manos y salta la nieve en cada ciclo | PASS |
| 4 | 4 | 7,78 / 6,36 | M | HOOK: `drop_object`, la carne cae en el hoyo en "it" y aparece REFRIGERATOR | PASS |
| 5 | 5 | 11,89 / 9,16 | M | versión verano (nieve beige, sol pixel, charco, goteo); *shrug* triste | PASS |
| 6 | 6 | 14,45 / 11,17 | M | sierra CC0 en la mano bajando al hielo, grietas y salpicaduras | PASS |
| 7 | 7 | 18,07 / 14,04 | M | vierte serrín con el cubo sobre los bloques | PASS (cara medio de perfil) |
| 8 | 8 | 21,92 / 17,06 | C | ICEHOUSE (style frame B), bloque al hombro, trineo con bloques | PASS (plano muy corto, 1 s) |
| 9 | 10 | 22,95 / 18,09 | M | carne nadando, `sick`, marca de enfado, snap-zoom en "Gross" | PASS |
| 10 | 11 | 26,94 / 21,87 | M | sube el bloque y lo pone encima del icebox; muestra la comida abajo | PASS |
| 11 | 12 | 32,70 / 26,32 | C | corte del icebox, COLD AIR con flechas que bajan; punch-in + ICEBOX | PASS |
| 12 | 13 | 35,67 / 28,47 | M | buzón; el sticker de operator_mike salta en "Mike" | PASS |
| 13 | 14 | 39,53 / 31,40 | C | primer plano: *half/frown* en "can't", guiño en "steal"; punch-in en "You" | PASS |
| 14 | 15 | 43,34 / 34,37 | M | vacío del escáner: gota que se evapora, lupa con moléculas (FAST = HOT) | PASS |
| 15 | 16 | 48,80 / 38,66 | M | baño en ruinas (bañera CC0): `shiver` y punch-in en "shiver" | PASS |
| 16 | 17 | 51,02 / 41,01 | M | el serpentín se llena de líquido azul brillante | PASS |
| 17 | 18 | 55,19 / 43,96 | C | vaso hirviendo en la nieve, −26 °C; REFRIGERANT | PASS |
| 18 | 19 | 60,13 / 47,70 | M | dentro de la nevera, *tilt* de la comida al evaporador con flechas de calor | PASS |
| 19 | 20 | 63,84 / 50,68 | M | detalle del compresor (vibra, chispas, SQUEEZE) | PASS (débil: el compresor se lee como un bloque negro) |
| 20 | 21 | 67,06 / 53,30 | M | style frame D; punch-in + COMPRESSOR y COLD/HOT | PASS |
| 21 | 22 | 71,23 / 56,38 | M | `warm_hands` en la parte de atrás de la nevera desenterrada, calor y corazones | PASS |
| 22 | 23 | 75,37 / 59,62 | M | HEAT THIEF + antifaz de ladrón; flechas siguen el lazo | PASS |
| 23 | 24 | 79,60 / 63,45 | M | *shrug* con la caja de sobras y "?" | PASS |
| 24 | 25 | 84,86 / 67,02 | M | *wave*, LOGGING OFF…, apagado CRT y cartel THE DIGGER | PASS |

### Problemas encontrados en las hojas y corregidos
1. **Plano 4:** la carne caía fuera del hoyo, porque la pose de referencia no coincidía con la del plano. Ahora el hoyo se calcula con la misma pose que se ve en el fotograma de la suelta.
2. **Planos 1 y 2:** parecía que ella flotaba. Un montículo de nieve (`drift`) le tapaba los pies; se movieron los montículos.
3. **Plano 6:** la sierra atravesaba el cuerpo y había una "sierra" de caja vieja en el set. Se reorientó el mango al puño con la hoja hacia el hielo, se quitó la caja del set y se giró el personaje para que se le vea la cara.
4. **Plano 7:** se la veía de espaldas y metida en el montón de serrín. Se reposicionó y se cambió la cámara.
5. **Plano 10:** el bloque le tapaba la cara y quedaba cortada en el borde. Bloque más pequeño y encuadre centrado.
6. **Plano 13:** el subtítulo caía sobre la boca. Ahora la cara queda encima de la línea del subtítulo.
7. **Plano 16:** el personaje y el serpentín quedaban cortados. Se reencuadró.
8. **Plano 17:** el vaso llenaba el cuadro y "−26°C" no se leía. Plano más abierto y número grande con grado dibujado.
9. **Plano 20:** la etiqueta COMPRESSOR tapaba el subtítulo. Ahora va encima del compresor.
10. **Plano 21:** salía de espaldas y una señal de tráfico del pueblo quedaba detrás de su cabeza. Se puso de perfil 3/4 y se ocultó la señal en ese plano.
11. **Plano 22:** la etiqueta HEAT THIEF tapaba el subtítulo. Se movió arriba.
12. **Plano 23:** la caja de sobras estaba en la mano oculta. Se pasó a la mano visible.
13. **Audio:** las ondas de pulso metían DC (−0,028) en la mezcla. Se añadió un paso alto de 30 Hz y se volvió a muxear.

Planos más débiles que quedan: el 19 (compresor poco detallado) y el 8 (dura ~1 s). En el 7 se le ve poco la cara porque mira hacia abajo al verter.

## 5. Sonido
- **Música:** cama chiptune original en código, 120 BPM, C–Am–F–G (`audio/scripts/music.py`). Intro, groove, *breakdown* bajo el comentario de Mike, *fill* antes del remate, corte en el apagado CRT y jingle final. earshot: *chiptune video game music* z 5,1 y *playful and quirky* z 3,8. Se aplica *ducking* de 7 dB bajo la voz (queda unos 12–13 dB por debajo mientras habla), arpegio y lead abiertos en estéreo, −2,5 dB a 2,2 kHz y un poco de graves.
- **Efectos:**
  - 24 grabaciones CC0 de Freesound, elegidas con earshot `rank` (z de 3,1 a 6,4): nieve, *clang*, golpe en la nieve, sierra, hielo, serrín, puertas y madera, agua, goteo, buzón, hervor, líquido, compresor, zumbido de nevera, fuego, dientes, viento, pájaros y tono de sala.
  - 3 sonidos CC0 del kit de sound-layer.
  - Blips, *stings* y *pops* chiptune en código.
  - Ambientes por plano: viento fuera, pájaros en verano, sala y zumbido dentro, zumbido del escáner.
- **Descartados:**
  - "bleh" de Freesound: son voces humanas (masculinas) que chocan con la narradora. Se sintetizó uno chiptune.
  - "ice block": ningún candidato coincidía (z < 2). Se usó un *thump* del kit.

## Créditos (resumen; completo en `CREDITS.md`)
- Personaje: modelo comprado por el usuario. Voces: clon del usuario y una voz diseñada original. Música y blips: originales en código.
- **CC-BY obligatorio:** "Winter Sled" de Jakers_H (Poly Pizza, CC BY 3.0).
- CC0: modelos de CreativeTrio, MilkAndBanana, Quaternius y Kenney, y 27 sonidos de Freesound o del kit.
- Relleno recoloreado de `lib-mml` (coche y papelera, ripeo de MML): decisión del usuario, solo de fondo.
- Texturas generadas con Google Flow. Fuente Pixelify Sans (OFL).

## Descripción para TikTok (v2, @mechayuki)
```
Operator… I dug up another human artifact: the FRIDGE 🧊 Humans built a machine just to rob their own leftovers?
Which human artifact should I dig up next? 👇 Follow @mechayuki for more artifacts.

#mechayuki #thedigger #fridge #howitworks #science #ps1 #lowpoly #retrogaming #physics #learnontiktok

Credits: "Winter Sled" by Jakers_H (CC BY 3.0) via Poly Pizza. Music, voice and animation: original.
```
