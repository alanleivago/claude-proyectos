---
type: spec
status: active
tags: [ali-abdaal-2, talking-head, editorial-collage, serif-title, wavy-underline, grey-caption, chat-bubbles, parallax-pan, 12fps, vertical]
relatedTo: [styles/ali-abdaal-2/CATALOGO.md, styles/docucollage/ESTILO.md, pieces/ali-abdaal-2-test, fuentes/ali-abdaal-2]
---

> **Ali Abdaal 2**: otro reel de Ali Abdaal, pariente del estilo "Ali Abdaal" (styles/docucollage, aprobado). Este cambia las fuentes, el caption y los gráficos: fondo crema plano, título serif blanco en minúsculas palabra por palabra, caption gris translúcido, collage recortado con parallax, burbujas de chat. Todo lo medido abajo sale de la copia 1080p de la ref. **APROBADO 2026-11-12 ("quedó excelente"): nivel mínimo = réplica McDonald's, `pieces/ali-abdaal-2-test/storyboard/v1/board_1-5.jpg` + `storyboard/v1/motion_test.mp4`.** No hizo falta el render de 55 s. Fase 2 (contenido propio: raw de Ashton) en `storyboard/ash_v1/`.

# Ali Abdaal 2: análisis de la ref

## Fuente y material
- Ref: IG `C_QLaqdI0Wd`; IG da 720x1280. Mismo short en YouTube: `3Uuwe4BxYJE`, 1080x1920, 29.97 fps, 55.31 s. Se usa este.
- `fuentes/ali-abdaal-2/`:
  - `reel_yt.mp4` (master), `reel_ig.mp4`, `r/words.json` (Whisper);
  - `frames30/w_*.md`: análisis por API de TODOS los frames a 29.97 fps, en ventanas de 3 s;
  - `captions_ocr.md`: los 61 chunks de caption con su primer frame (OCR por API);
  - `cuts.txt`, `diffs.json`, `sheets/` (hojas por frame y recortes 1080), `hi/` (frames 1080);
  - `tools/`: diffs, sheet, grab, strip, fontsheet, framelevel, capocr, capbox.
- Análisis cuadro a cuadro en `CATALOGO.md` (25 planos, 8 tipos).

## Ritmo
- 41 cortes en 55.3 s (un plano cada 1.35 s). TH 77 % del tiempo, collage 23 % en 5 bloques (P07, P09, P11-12, P16-22).
- Jump cuts de TH: alternan encuadre abierto y punch-in de x1.08, x1.18, x1.22 o x1.38. El salto de escala ocurre en el frame exacto del corte; no hay zoom animado sobre el TH.
- Transiciones:
  - TH <-> collage: **corte seco siempre** (0 frames, sin blur, sin flash).
  - Una sola transición con desenfoque, TH -> TH en 3.27-3.37 s: f98 plano viejo a 8 px, f99 nuevo a 25 px, f100 a 12 px, f101 nítido.
  - Entre planos de gráficos: nunca corte seco. Se usa un **paneo en parallax** (P09) o un **push lateral** (P11->P12).

## Cadencia
- **Gráficos a 12 fps** (patrón 3-2-3-2 sobre 29.97; poses en f466, 469, 471, 474...): capas del collage, cámara, sobres, cajas de burbuja, barras de resaltado.
- **A 29.97 fps (suave):** TH, aparición de cada palabra del título, subrayado ondulado, relleno de palabras del caption.
- **Motas de tinta:** el patrón cambia cada ~15 frames en las pausas y en cada paso cuando hay movimiento.
- **Boil de recorte:** tótem, coche y sobres tiemblan ±4-5 px y ±0.6-1.2° con una pose nueva por paso cuando están quietos.

## Color
| Uso | Valor |
|---|---|
| Fondo del collage | crema plano **#FFFBE8**, sin degradado ni viñeta en el master |
| Motas | tinta negra, 3-90 px por mancha, ~1100 px oscuros por frame |
| Caption | caja negra al **30 %**, texto blanco al 93 % (dicho) / 38 % (no dicho) |
| Subrayado ondulado | amarillo **#FFCF3C** hasta el 30 % del largo, transición hasta el 48 %, luego azul **#46A0FF** |
| Burbujas | naranja **#FF950F** (izquierda), azul **#07A2FF** (derecha), texto negro |
| Barra "Monday" | rojo **#EF5838** (el del sobre) |
| Barra "Tuesday" | verde **#91AA00** (el del sobre), con borde 2 px más oscuro |

- **Viñeta oscura de las capturas del usuario:** NO está en el video. Es el degradado del reproductor web de Instagram: idéntico en las 7 capturas, 34.5 % de negro arriba que llega a 0 al 21 % de la altura, y 35 % abajo desde el 73 %. **REGLA (usuario 2026-11-12): la viñeta NO va.** `IGVIG = 0` por defecto en `prep/board.py`: el fondo es crema plano como el master.

## Fuentes (láminas en `ref_frames/lamina_fuentes_*.jpg`)
| Rol | Ref | Elegida | Ajuste |
|---|---|---|---|
| Título serif | serif editorial de alto contraste, x-height alta, minúsculas, tracking apretado (tipo Canela / GT Super) | **Instrument Serif** (Google, OFL) | trazo del mismo color = 1.25 % del tamaño; espacio entre palabras ×0.75; tamaño ajustado al ancho de tinta medido de cada línea |
| Palabra del día | grotesca negra bold, tracking apretado | **Neue Haas Display Bold** (biblioteca del usuario) | tracking -3 %; cap ~109 px (~154 px de cuerpo) |
| Caption | Helvetica bold | **FreeSans Bold** (clon de Helvetica, biblioteca del usuario) | 70 px |
| Burbujas | Helvetica bold | **FreeSans Bold** | 49 px |

- Descartadas para la serif, en `fonts_serif_*.jpg`: Newsreader, Literata, Source Serif, EB Garamond, Cormorant, Crimson, Petrona, Brygada, Libre Caslon, Baskervville, Cardo, Gelasio, Fraunces, Playfair, Lustria, Georgia y Times.
  - Con la x-height de la ref todas quedan anchas y piden tracking de -0.12 a -0.17 em.
  - Instrument Serif tiene las proporciones exactas con tracking 0; solo le falta peso, que se compensa con el trazo.

## Título serif (TH)
- Blanco puro, sin sombra, sin caja, sin shine, sin wiggle. Va sobre el pecho del host: líneas con base en y≈1172 y y≈1365.
- **Cada palabra aparece entera en su frame**, en la posición final de un layout centrado (la línea no se recentra al crecer). Al entrar asienta 12 px hacia arriba en 3 f.
- Frames de aparición:

| Título | Frames por palabra |
|---|---|
| "if you don't / like your job" | f3, 7, 11, 16, 20, 24 |
| "if you really / aren't enjoying it" | f34, 40, 45, 51, 56, 62 |
| "then how do / you make it" | f69, 71, 74, 77, 79, 82; se limpia en f85 |

- Cajas de tinta medidas:

| Línea | x de tinta | Base |
|---|---|---|
| "if you don't" | 151-929 | 1172 |
| "like your job" | 195-881 | 1365 |
| "if you really" | 149-937 | 1171 |
| "aren't enjoying it" | 85-997 | 1365 |
| "then how do" | 92-982 | 1171 |
| "you make it" | 210-862 | 1364 |

  La línea 2 sale ~80 % del cuerpo de la línea 1 porque se ajusta al ancho.
- El texto se limpia en seco en el corte; el título nuevo empieza ~3 f después.
- **Subrayado ondulado:**
  - x 412-889, y 1372, trazo 17 px con puntas redondas;
  - seno de amplitud 6 px y longitud de onda 72 px;
  - punto en f13 (antes de "like"), se dibuja de izquierda a derecha hasta f24.5 (ease-out);
  - quieto f25-26; se borra desde la izquierda f27-30 (ease-in) hasta quedar un punto azul.
- **"playful?":**
  - una línea x 83-991, base 1216 (~340 px);
  - en f86-89 pasa de gris 45 % a blanco y sube 60 px;
  - sigue encima del corte de 3.07 y se va en seco en f99.

## Caption
- Caja rectangular (radio ~6 px) negra al 30 %, alto 100 px (y 1334-1434), centrada, padding lateral 42 px. El ancho se ajusta al chunk.
- Texto FreeSans Bold 70 px en blanco, base y≈1410.
- Chunks: los 61 de la ref (`assets/ref_captions.json`), de 2-5 palabras. Cambio seco ~0.03 s antes de la primera palabra.
- Cada palabra pasa de 38 % a 93 % en 0.12 s, empezando 0.08 s después de dicha (la ref va entre 0 y 0.2 s tarde). Es por palabra entera, no un relleno progresivo por letra.
- **Sin caption:** en los títulos (0-3.30), en las salsas y en TODO el bloque del chat (35.0-46.35, incluidos los TH cortos del medio).
- Las motas del collage pasan por encima de la caja.
- Texto censurado como en la ref: "fuck" -> "screw", "barbecue" -> "BBQ".

## Collage P07 / P09: obrero -> local + cartel -> paneo -> tótem + coche
**Capas, de atrás hacia adelante:** crema plano, local (profundidad 0.6, desenfoque 2 px), cartel de arcos (profundidad 0.5, nítido), obrero (profundidad 1.0), tótem, coche, caption, motas.

**P07, desde f149:**
- Corte seco. El obrero entra a ×1.18 y asienta a 1.0 en ~9 f (ease-out). La cabeza baja de y 0 a 165 en 26 f y el centro va de x 660 a 545. Después hay un creep de -1 %/s.
- Obrero:
  - cara al ~15 % de luz (ref: cara RGB ~27, cuello del polo rojo ~103, ruedo ~234);
  - polo con degradado oscuro arriba y claro abajo;
  - gorra de 435 px de ancho a cámara 1.
- **Logo del pecho** (x 730-865, y 1050-1170): chispas en f166-167, trazos de fuego que forman los arcos en f168-172, arcos dorados sólidos en f173.
- **f183:** el local aparece abajo a la izquierda y sube 75 px en 7 f (ease-out). Después deriva +1.8 px/f a la derecha hasta f220.
- **f188:** el cartel entra desde arriba a la derecha (225 px fuera) en 2 f, rebota 9 px y deriva 2 px/f hacia abajo hasta f220.
- **Cámara del collage:** aleja 1.0 -> 0.88 entre f183 y f220 (rápido los primeros 12 f, luego lento), con ancla en (540, 1290). La cabeza del obrero baja de 165 a 300.
- **Desenfoque de profundidad del obrero:** de 8 a 15 px entre f180 y f200. Después se mantiene.
- Posición final medida en fav 108:

| Capa | Caja final |
|---|---|
| Local | izquierda 156, arriba 639, ancho 1490 (Flow v1: torre con el cartelito a la izquierda y el alero hacia la derecha, como la ref; el cartelito queda en x≈262, y≈780 detrás de la cabeza del obrero) |
| Cartel | izquierda 640, arriba 150, ancho 430 |

- Sale con corte seco al TH en f246.

**P09, desde f466:**
- El mismo collage vuelve con un pre-roll (escala 1.00 -> 1.02 y -1.5 px/f en 8 f).
- Después un **paneo horizontal medido**: sin escala, sin rotación y sin desenfoque de movimiento.

| Capa | Posiciones medidas por frame |
|---|---|
| Obrero (x del logo, ease-in) | f474 726, f476 675, f479 585, f481 459, f484 300, f486 90; fuera en f489 |
| Local + cartel (~0.55-0.65 de la velocidad del obrero; borde izq. de los arcos) | f474 621, f484 390, f486 255, f489 144, f491 60; fuera en f501 |
| Tótem (borde izquierdo) | entra en f484: 1005, 909, 795, 675, 555, 429, 330, 240, 174, 126, 90; frena en 66 en f511 (ease-out, sin rebote) |
| Coche (x del centro de la rueda delantera) | entra en f501 con 9° de nariz abajo; f506 1020, 795, 615, 474, 390; frena en 309 en f519; nivelado en f514 |

- Geometría final (f1150):

| Elemento | Medida |
|---|---|
| Tótem | x 66-435, y 360-1110 |
| Coche | cubo delantero en (311, 1457), radio de cubierta 178, techo y≈826; la cola sale por la derecha y la trompa toca el borde izquierdo |

## Salsas P11 / P12
- **Sobres:**

| Sobre | Caja |
|---|---|
| "Tangy BBQ" | x 153-923, y 486-1437 |
| "Sweet 'N Sour" | x 177-904, y 483-1435 |

  El primero entra por corte seco, sin entrada; escala 1.03 -> 0.98 hasta f655. Boil de ±5 px / ±1.2° por paso.
- **Palabra del día:**
  - sube desde una máscara dura (borde inferior y 366) en 3 poses: +rise, +30 % del rise, 0 (Monday rise 60 en f637; Tuesday rise 36 en f667);
  - después deriva 18 px hacia arriba en ~12 f.
  - Cajas de tinta finales:

| Palabra | x de tinta | Cap | Base |
|---|---|---|---|
| Monday | 278-795 | 216 | 325 |
| Tuesday | 257-817 | 213 | 323 |

- **Barra de resaltado:**
  - detrás de las letras, y 290-319 (de base -35 a base -6), puntas redondas;
  - empieza en el borde izquierdo de la palabra y termina +16 px después de la última letra;
  - Monday: 30, 140 y 533 px en f642, 645 y 650;
  - Tuesday: 30, 230, 380, 520 y 576 px en f677, 680, 682, 685 y 687 (ease-out).
- **Push P11 -> P12 (12 f, bordes duros, sin blur):**
  - "Tangy" + "Monday": -75 (f656), -300 (f657), -705 (f660); fuera en f662;
  - "Sweet": +720 (f660), +309 (f662), +84 (f665), +6 (f667), 0;
  - "Tuesday" sube recién después del push.

## Chat P16-P22
- Fondo: el collage tótem + coche, quieto con boil. Sin caption.
- **Burbujas:**
  - rectángulos planos (radio 3), sin sombra, alto 73 px;
  - texto FreeSans Bold 49 px negro, padding izquierdo 17 px;
  - naranja alineada a x 244 a la izquierda, azul alineada a x 981 a la derecha.
- **Separación:** 135 px entre burbujas distintas y 85 px entre líneas de una misma burbuja larga.
- **Entrada:**
  - la caja aparece vacía (placeholder de 200-470 px; la primera es una franja de 33 px) unos 36 px por debajo de su lugar y sube con ease-out en ~12 f;
  - el ancho crece hacia el lado libre con ease-out, siempre una palabra por delante del texto, y la última palabra queda a ~23 px del borde;
  - cada palabra cae entera en su frame (se usan los frames medidos);
  - la primera palabra de cada línea entra deslizando 60 px desde la izquierda, recortada por la caja.
- **Pila:**
  - en los TH intermedios la pila sube fuera de cámara: -104 px en el bloque C y -184 px en el bloque D;
  - en el bloque D las líneas largas pasan por encima del coche y del tótem.
- Frames de cada palabra en `prep/board.py` (`BUBBLES`).

## Sonido (earshot timeline de la ref)
- **Mezcla:** -15.6 LUFS integrados, pico real +0.2 dBTP, LRA 4.4 LU.
- **Música:** cama "confident & cool" con bajo de funk/corporate y vocal chops, ~125 BPM pero sin pulso claro (pulse clarity 0.04). Hay un cambio a lo-fi con vocal chop en 36-49 s, durante el chat.
- **SFX escasos y en eventos:**

| Momento | SFX |
|---|---|
| 15.59 | pop/burbuja en el corte al obrero |
| 19.25 | whoosh de paneo |
| 21.16 | golpe en el corte al sobre |
| 22.05 | whoosh del push |
| 46.69 / 46.89 | pop + ding |

- No hay teclas, risers ni shimmer.
- El 86 % de los cortes tiene un onset a ≤100 ms.
- **Para la réplica:** -14 LUFS (regla del usuario), verificado con earshot.

## Nivel aprobado y reglas (2026-11-12)
- **Barra de calidad:** storyboard v1 + motion_test.mp4 de la réplica McDonald's. Cada pieza nueva se compara contra eso.
- **Método aprobado:** copiar la ref 1:1 con medidas por frame (cajas de texto, keyframes de capas, colores muestreados) y cambiar solo los assets.
- **Fuentes del estilo:** Instrument Serif (trazo 1.25 %, espacio ×0.75) para títulos; Neue Haas Display Bold (-3 %) para la palabra con barra; FreeSans Bold para captions (70 px) y burbujas (49 px).
- **Fondo crema plano #FFFBE8 sin viñeta**, motas de tinta del overlay del usuario por encima de todo (caption incluido) en los collages.
- **Captions solo en TH y en collages de sujeto/paneo**; nunca en los planos de objeto + palabra con barra ni durante el chat.
- **Gráficos a 12 fps**; TH, palabras del título, subrayado y relleno del caption a 29.97 fps.
- **TH <-> collage con corte seco**; entre planos de gráficos, paneo en parallax o push lateral, nunca corte seco.

## Reglas heredadas del estilo Ali Abdaal (aplican)
- Todo por capas con movimiento propio y parallax medido.
- Nunca corte seco entre planos de gráficos.
- Los recortes que tocan un borde siguen fuera del cuadro; recortes sin halo (alpha erosionado 1 px).
- SFX solo en eventos reales, sin shimmer.
- Ningún frame negro; el salto de escala del TH cae en el frame del corte.
- Imágenes solo de Google Flow (srz-google-flow-mcp, cuenta tiktokeeuu691), verificando cada archivo: en esta sesión Flow devolvió imágenes viejas de otro proyecto y hubo que abrir un proyecto nuevo.

## Pipeline (pieces/ali-abdaal-2-test)
1. `prep/assets.py`: recortes Flow -> `assets/img/*.png` (rembg birefnet-general, alpha erosionado 1 px).
2. `prep/specks.py`: overlay de motas del usuario (`Overlays/a-dirty-film-texture...mp4`, rotado a 9:16), filtrado al tamaño y la densidad de la ref -> `assets/specks_clean/`.
3. `prep/board.py`: todo es función del tiempo absoluto de la ref.
   - `board` genera el storyboard (ref | nuestro + notas);
   - `motion` genera la prueba lado a lado con el audio de la ref;
   - `frame T` genera un frame suelto.
4. Fase final, pendiente de OK: render completo de 55 s desde el mismo `render(T)`, audio, -14 LUFS, revisar_render, earshot.

## Fase 2: Ashton, primeros 20 s (storyboard ash_v1, pendiente de OK)
- Código en `pieces/ali-abdaal-2-test/prep/board_ash.py`. Reusa las funciones de `board.py` y re-ancla los keyframes medidos de la ref a la voz del raw (`kf()`).
- Edición en `ash/edit.py`: el raw ya viene cortado al ras (pausa máxima 0.15 s). Se acortan solo las corridas de silencio real (RMS < -20 dBFS) de 0.12 s o más, a 0.07 s.
  - Los bordes de palabra de Whisper NO sirven para cortar en este raw: caen dentro de consonantes.
  - Salen 20.57 s.
- Mapa de planos (tipo del CATALOGO):

| Tiempo (s) | Tipo | Contenido |
|---|---|---|
| 0-2.64 | 1 | títulos serif |
| 2.64-7.06 | 6+7 | despertador 3:52 / agua helada / banana con barra y push |
| 7.06-11.45 | 1+2 | títulos serif, "notaron." gigante cruzando un corte |
| 11.45-14.25 | 4 | coach recortado + gimnasio "SE ALQUILA" + cartel GYM |
| 14.25-16.86 | 5 | paneo -> celular con el video + auto deportivo |
| 16.86-20.57 | 3 | TH con caption |

- Audio: voz del raw + "A La Mode" a 0.13 + SFX en los cortes, pushes y paneo. -14.0 LUFS (earshot), sin shimmer.

### ash_v2 (correcciones del usuario 2026-11-12)
- **El sujeto es Ashton Hall real**, con fotos REALES de la biblioteca del usuario (`EMOJIS PNG/ashton*`). No se genera su cara con IA. Datos verificados en prensa: exjugador universitario (running back), entrenador personal / influencer fitness; el video de la rutina (3:52, hielo, banana) se viralizó en marzo de 2025.
  - El recorte de cuerpo entero es su PNG; la cara queda visible, sin oscurecer.
  - El agua helada y la banana son fotos reales de su rutina: al texto "8:45 am" quemado se le hizo inpaint con OpenCV, sin IA en la cara.
  - El celular muestra un frame real de su video.
  - Su perfil real de IG (14.7M) toma el movimiento del coche verde.
  - Se quitó el logo del pecho (va sin camiseta).
- **Wiggle de los objetos medido en la ref** con ECC (`findTransformECC` euclidiano) sobre los frames 1080:

| Objeto | Amplitud medida |
|---|---|
| Sobre Sweet 'N Sour | std 0.48 px, 0.00° |
| Tótem | std 0.4 px, 0.00° |
| Coche | std 0.9 px, 0.12°, pose nueva cada ~2.5 f |

  - Valores usados: objetos ±0.6 px / ±0.05°; coche o tarjeta ±1.2 px / ±0.15°.
  - Antes eran ±5 px / ±1.2°: temblaba, y se corrigió también en `board.py`.
- Fotos recortadas por su propio cuadro (busto): van apoyadas en el borde inferior, con los lados fuera del cuadro y feather de 60 px en los lados, que solo se ve durante el push.
