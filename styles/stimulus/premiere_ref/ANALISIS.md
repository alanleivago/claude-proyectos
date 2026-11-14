# Stimulus reels buenos — specs extraídas de Premiere

Fuente: secuencia "Stimulus reels buenos" (1080x1920, 60 fps, 456.7 s, 17 pistas de video, 749 clips) del proyecto "Dariel Stimulus 1_2_1.prproj".
Método: ExtendScript (solo lectura) y el XML del autosave de las 00:12 del 7-nov (la secuencia todavía no estaba en el .prproj guardado). Coincide con la sesión en vivo: 749 clips, mismos conteos por pista. El texto de los gráficos se sacó de los blobs flatbuffer de "Texto de origen"; los campos se identificaron midiendo píxeles en los fotogramas exportados.
Tiempos = segundos de la secuencia. Posiciones normalizadas ×1080 / ×1920 = px.
Son 12 reels, cada uno empieza con el zoom-out 172→100: 0.0, 27.9, 64.5, 99.5, 127.5, 164.2, 195.4, 233.6, 276.2, 328.2, 372.2, 423.7.

## 1. Captions (306 gráficos de texto)

Hay 4 clases:

| clase | n | fuente | tamaño | duración en pantalla |
|---|---|---|---|---|
| Subtítulo | 223 | DINNextLTArabic-Bold | 83.5 px (72.6–95.6 cuando la línea es larga o lleva un número grande) | media 1.05 s, mediana 0.93 s, rango 0.32–4.0 s |
| Título (glitch) | 53 | DINNextLTArabic-Bold | palabra grande 146–353 px (Coach 220, 100 → 353, SOCCER 216), líneas secundarias 46–106 px | media 2.67 s (1.1–4.8 s) |
| CTA | 29 | EuropaGroteskSH-Med | línea 1: 95.6 px; línea 2: 90.3–91.1 px (hasta 112 px) | media 2.37 s |
| PDF | 3 | ITCGaramondStd-LtNarrowIta | 209 px, negro, sobre el canvas blanco ("1 Free PDF") | — |

### Campos del texto (decodificados del flatbuffer y comprobados en píxeles)
- Tracking: subtítulos −31 (letter-spacing −0.031em); títulos −43 (palabras grandes) o −1 (líneas en mayúsculas); CTA Europa +6 (+0.006em).
- Caja de párrafo de 845 px de ancho (a veces 810) por 576 de alto. Origen de la capa de texto en x = 0.1088 (117 px); la caja centrada abarca de 117 a 962.
- Alineación centrada en x = 540. Medido: "for an entire team," centro 539, "with wrong orders." 538, "and sample jersey" 535. Excepción: el par "the same quality / as your game jerseys?" está alineado a la izquierda en x = 155.
- Relleno: blanco #FFFFFF por defecto (canal omitido = 255). Las palabras resaltadas son un segundo run de color sólido dentro del mismo gráfico (ver abajo).
- Degradado (flag f20=1): degradado lineal VERTICAL por línea. Arriba va el color de la parada (location 0) y abajo blanco #FFFFFF (location 0.94 en títulos, 0.66 en "11 youth…", 1.0 en CTA). Medido en "and sample jersey": #BDBE83 en la parte alta de la x-height → #F8F8F6 en la línea base. En "Coach": #ECE4A0 arriba → #FFFFFF abajo.
  - Paradas de títulos: #A89C2F (palabra grande y números), #9F9C81 (líneas secundarias en mayúsculas), #CDC9A9, #A86B2F ("overwhelming"). Las líneas pequeñas tipo "what if…" son blanco→blanco.
  - Paradas de la línea 2 del CTA: #68690E → blanco (el color sólido #E5DBAB guardado debajo no se ve).
- Mayúsculas (f12=2): solo en títulos, en las líneas secundarias pequeñas y en las de énfasis (27 de 53 runs de título): "11 YOUTH SOCCER TEAMS", "THE SAME QUALITY", "COACHES", "MANAGERS", "FAST", "OVERWHELMING", "WE WORK DIRECTLY", "SIZING SAMPLES". Los subtítulos y los CTA NUNCA van en mayúsculas.
- Itálica falsa (f15=1): 51 runs. La palabra grande del título nunca va en itálica. Se usa en:
  - la línea 2 del CTA (siempre, 29/29 pares);
  - la cola en mayúsculas de un título ("as our Pro teams", "Same pro-level feel", "Coaches", "MANAGERS", "Fast", "overwhelming");
  - la línea que sigue a un número grande ("in stimulus product." bajo $1,000);
  - la segunda línea de una frase dividida ("the right way.", "a jersey mock up.", "ultimate Frisbee jersey?", "ultimate jersey designs");
  - unos 75 % de las palabras resaltadas (headache., new players., customized, wait 2 months., risky., brand sizing., what you need., quality/comfort/performance).
  - Regla práctica: la línea 1 es la normal; la línea de remate o énfasis va en itálica.
- Sin trazo visible. Hay un color de trazo negro guardado, pero no se renderiza.

### Resaltes (segundo run de color dentro del mismo subtítulo, 23 gráficos)
- Se resaltan las últimas 1–2 palabras de la frase: "design is a **big decision.**", "a ton of **headache.**".
- Colores: verdes #78FF00, #8DFF55, #95C640, #52E23F, #42FF00, #A0E358, #85EB69, #83E115, #44CC61, #54DF49, #009C00 (≈70 %); rojo #F92F2F / #E63535 (cosas negativas: "mock up.", "wait 2 months."); naranja #E19E4F, #EFB13A, #FF9C00 (headache, joining).
- En un mismo reel se mantiene un mismo verde. Medido en pantalla con el glow: #9AFF00 a #B5FF6D.

### Partición y apilado
- Subtítulos: una línea por gráfico, 3.16 palabras de media (1:8, 2:66, 3:75, 4:37, 5:31, 6:5, 7:1) y unos 16 caracteres.
- 170 de 176 transiciones son back-to-back (hueco < 0.02 s): un subtítulo reemplaza al anterior en el mismo sitio.
- Dos líneas = dos gráficos en pistas distintas. La línea 2 entra 0.47–1.5 s después mientras la línea 1 sigue, y las dos terminan juntas (27 casos). El Graphic Group de la línea 2 está en y 0.5453 contra 0.5 → +87 px. Medido de línea base a línea base: 90 px (DIN 83.5); hueco entre la línea base 1 y la x-height 2 ≈ 37 px. Hay una pila de 3 ("quality / comfort / or performance").
- Altura del subtítulo según el reel. Origen de texto en y 0.354 (la mayoría) → línea base ≈ 996 px; en 0.436 → ≈ 1153 px; en 0.429 → ≈ 1140 px; en 0.556 (bajo un título) → ≈ 1384 px. Fórmula: línea base ≈ tpos_y·1920 + 316.

### Animación de entrada (efecto Transform en el gráfico; no hay salida, corte duro al final)
- Subtítulo (211/223 idénticos): posición y 0.5314→0.5 = sube 60 px en 0.50 s, curva bezier (fuera 0 vel / influencia 32.5 %, llegada influencia 100 %) ≈ CSS cubic-bezier(0.33,0,0,1). Opacidad 0→100 LINEAL de 0.04 a 0.43 s. Desenfoque de movimiento ON (obturación 225°).
- Glow de los subtítulos: VR Glow (Mettle) radio 100, brillo 1.0, saturación 1.0, umbral 0, sin tinte (211/223). Hay 2 con radio 152.
- Título: dos variantes de movimiento.
  - (a) y 0.5314→0.5 (60 px) en 0.80 s con opacidad 0→100 en 0.04–0.43 s (25 de 53).
  - (b) x 0.4574→0.5 = entra 46 px desde la izquierda en 0.73 s (bezier con influencia 33 %/100 %), con opacidad 0→100 en 0.22 s (28 de 53).
  - Pila de efectos del título:
    - Aberración cromática VR: R +3, B −3, distancia de difuminación 18.
    - Ruido 20 %.
    - Gaussian 3 constante.
    - Brillo +35.
    - Sombra paralela negra: distancia 30, suavizado 70, opacidad 100 %, 135°.
  - Flicker en bucle durante toda la vida del título (mismo patrón en todos):
    - Compound Arithmetic con "fusionar con original" que alterna 100/34/99/0 cada 0.07–0.5 s.
    - Pulsos de Gaussian blur: 0→125 en 0.21 s y →0 en 0.43 s; luego 88, 82, 40, 137, 125 cada ~0.6–1 s.
    - Pulsos de Motion Blur (dirección 90, longitud hasta 325).
  - El Graphic Group escala la palabra 100–135 %.
  - Los títulos quedan DETRÁS del presentador: un recorte rotoscopiado de la persona ("Nested Sequence 23/25/26/28.mp4", secuencias "ROTO stimulus-0x") va en una pista superior. "Coach", "Deserves", "COACHES" y "Jersey Options" salen tapados en parte por la cabeza o el cuerpo.
- CTA (29/29 idénticos):
  - Línea 1: y +0.0539 → 0 (sube 103 px) en 0.43 s con bezier; opacidad 0→100 en 0.11 s (de 0.015 a 0.125 s).
  - Línea 2: la misma entrada, 0.78 s después, más el flicker de Gaussian blur 125 y Compound Arithmetic (patrón de arriba), Brillo +35, Gaussian 3 y escala del Graphic Group al 103 %.

### Caption "for a free design / and sample jersey" (mujer con jersey azul marino junto a la ventana, 451.983 s)
Mismo patrón en 312.1, 359.9 y 407.9.
- Línea 1 "for a free design":
  - EuropaGroteskSH-Med 95.6 px, blanca, tracking +6, sin itálica ni mayúsculas.
  - Pista V4, de 451.983 a 454.533 (2.55 s).
  - Motion y 0.3958; Graphic Group y 0.3776 a escala 100.
  - Glow VR radio 100, brillo 1.
  - Medido: x 234–796, x-height 940–1000, línea base ≈ 1000 px, ascendentes desde ~936, descendentes hasta 1019.
- Línea 2 "and sample jersey":
  - Europa 91.07 px, itálica falsa, degradado vertical #68690E (arriba) → blanco, tracking +6.
  - Pista V5, de 452.767 (+0.783 s) a 454.533.
  - Motion y 0.3448; Graphic Group y 0.4698 a escala 103.
  - Brillo +35, Gaussian 3, flicker de blur y Compound Arithmetic.
  - Medido: x 206–865 (centro 535), línea base ≈ 1093 px, colores #BDBE83 → #F8F8F6. Interlineado de 93 px entre líneas base.
- Icono del jersey:
  - Archivo: `D:\Alan\Fiverr Upwork trabajo fotos y videos\EMOJIS PNG\futbol franela camisa ropa clothes.png` (500×500).
  - Pista V3, de 452.10 (+0.117 s después de la línea 1) a 454.533.
  - Motion: posición (0.7776, 0.4893) = centro (840, 940) px; escala 33 % → 165 px; rotación +8°.
  - Respecto al texto: el centro queda 44 px a la derecha del final de la línea 1 (796) y a la altura de la parte alta de la x-height de la línea 1 (940). El icono se apoya en la esquina superior derecha de "design".
  - Tinte: negro → #1B6F4A (verde, el color del reel) y blanco → blanco. Otros reels usan el mismo icono teñido #15325E (azul marino), #155B5E (teal), #5C1B6F (morado), #245E15, #842525, #83460A. El tinte cambia según el jersey del reel.
  - VR Glow radio 188, brillo 1.
  - Sombra paralela negra: distancia 30, suavizado 116, opacidad 100 %, 135°.
  - Entrada con Transform: y 0.759→0.5 en 0.51 s con bezier, es decir 0.259 × 500 px × 0.33 ≈ 43 px de subida en pantalla; opacidad 0→100 de 0.06 a 0.44 s.
- Fotogramas: `frames/cta_d_453_line2+0.3.png` (línea 2 a 0.3 s de aparecer) y `frames/cta_d_453_settled.png`. Las otras 3 apariciones: `cta_a_313*`, `cta_b_361*`, `cta_c_409*`.

## 2. Iconos (88 clips de imagen; 55 son iconos de `D:\Alan\Fiverr Upwork trabajo fotos y videos\EMOJIS PNG\`)
- Archivos usados (en orden de aparición):
  - ropa deportiva icon.png, bag icon bolso.png, futbol balon icon.png;
  - futbol franela camisa ropa clothes.png (×11, el icono del CTA);
  - tela icon.png, icon lupa.png, icon shirt franela futbol icon.png, ojo icon.png;
  - feeling hand icon feel mano sintiendo tocando.png, jugador de futbol icon.png, futbol soccer training icon.png;
  - franelas shirts icon soccer shirtos blanco.png, dollar icon money.png, pdf icon.png, reloj icon.png;
  - wrong order icon orden equivocada equivocado.png, person jugador icon.png, caja icon (1).png, caja icon return.png, phone telefono icon.png;
  - numero 1 uno icon.png, numero 2 dos icon.png, hombre icon triste.gif, logo icon.png, team soccer equipo futbol icon.png;
  - size medida.png, icon orden ticket mano.png, energia persona feliz icon.png, culture icon cultura.webp.
- Tratamiento estándar: efecto Invertir (iconos negros → blancos); los iconos del jersey y del pdf usan Tinte en su lugar.
  - VR Glow: radio 100 / brillo 1 (reels 1–4); 125 / 0.7–0.8 (reel 9); 141 / 1.3 (reels 10–12); 188 / 1 (jersey y pdf).
  - Sombra paralela: distancia 30, suavizado 116 (194 en algunos), opacidad 100 %, 135°.
- Tamaño en pantalla: 128–256 px (normal ~165–200 px). Escala de Motion según el PNG nativo: 29–36 % para los de 500–512 px, 65–90 % para los de 256 px, 101–128 % para los de 200 px.
- Entrada (casi todos): Transform y 0.759→0.5 en 0.51 s con bezier (≈ 43–46 px de subida en pantalla) y opacidad 0→100 de 0.06 a 0.44 s. Algunos entran desde y 1.185 (≈ 110 px). Sin salida: corte duro.
- Fila de iconos debajo del subtítulo:
  - Centros en y ≈ 1100–1131 px, unos 110–135 px por debajo de la línea base del subtítulo (996).
  - Ranuras en x ≈ 300 / 530 / 740 px, con 205–235 px entre centros (3 iconos); 4 iconos → x 186 / 422 / 678 / 890.
  - Cada icono aparece en su palabra hablada, con 0.6–1.6 s de diferencia entre uno y otro. Todos los de una fila se cortan a la vez (p. ej. 10.45 / 12.08 / 12.75 → todos terminan en 15.82).
  - De 2 a 4 iconos en pantalla a la vez. Duración en pantalla de 1.3 a 8.3 s (típico 2.3–4.7 s).
- Variantes:
  - Fila de personas que se tiñen de rojo (Tinte negro→#FF0000) cuando hay "problema" (285.5 s).
  - Icono "wrong order" grande, 490 px en (516, 1575), con fade de opacidad por fotogramas.
  - Iconos de número "1" y "2" de 205 px, juntos en (388 / 670, 1131) y luego solos centrados en (535, 1143).

## 3. Zooms / cámara (90 clips de ajuste "Acercar lento" + algunos en footage)
Interpolación: código 0 = LINEAL; código 5 = bezier "ease" (velocidad 0, influencia de salida 33 % y de llegada 100 %), comprobado con muestras de getValueAtTime. Para 100→125, en t = 0.1/0.2/0.3/0.5/0.7/0.9 da 101.1/108/115.6/121.7/124.1/124.9. Equivale a CSS cubic-bezier(0.33,0,0,1): arranca suave y llega con un asentamiento largo. Lo único con HOLD (código 4) es el jitter de shake/glitch.

Tipos de movimiento:
- A. Arranque del reel (12/12 reels): clip de 0.97 s, escala 172→100 LINEAL en 0.77 s, empezando justo en el primer fotograma. Es un zoom-out de impacto; se pone sobre el título "Coach".
- B. Push suave: 100→125 con ease en 1.20 s (a veces 0.63–0.77 s, a 119–124). Luego deriva lenta 125→138 en 1.2 s o se mantiene, y vuelve 125→100 con ease en 0.67 s. A menudo lleva paneo y 0.5→0.544–0.559 (la imagen baja 85–107 px) o x 0.5→0.453.
- C. Escalera (reels 9–12): 100→115 (0.95 s) · se mantiene 0.35–0.6 s · 115→126 (0.95–1.3 s) · se mantiene ~1 s · 126→100 (1.28 s), todo con ease. A veces paneo x 0.5→0.375 durante el tramo 115→126.
- D. Lento lineal: 100→127.1 LINEAL en 5.04 s (o 100→129.1 en 9.95 s; 100→114.5 en 2.7 s; 100→109.5 en 2.7 s). Casi siempre el clip se corta antes de terminar el movimiento.
- E. Golpes apilados: 2–3 capas de ajuste en V2/V3/V4 que arrancan con 0.9–1.7 s de diferencia, cada una 100→110–113 (o 124) en 0.63–0.77 s con ease. Se multiplican: 124 × 110 × 110 ≈ 150 %, 113³ ≈ 144 %. Todas terminan en el mismo corte.
- Relación con los cortes: de 90 capas de ajuste, 39 empiezan y 51 terminan a menos de 0.05 s de un corte del footage. Cuando la capa termina sin haber vuelto a 100 (tipos D, E y las B cortadas), el zoom se resetea DE GOLPE a 100 en el corte; el plano nuevo empieza sin zoom.
- Secuencia típica por reel:
  - reel 1: A → B (1.17–4.33, 100→125→138→100) → E (8.05 / 10.52 / 12.22: 124 × 110 × 110, reset al corte 15.82) → D (5 s lineal en el CTA).
  - reel 2: A → B (30.48: 100→125, se mantiene, →100) → B con paneo y (38.77) → D (41.27) → B (47.3) → D (50.2, CTA).
  - reel 3: A → B (66.38) → B corto 100→119 (68.88) → D (77.25) → E (80.0 / 81.3) → D (83.37, CTA).
  - reel 9: A → C (278.1) → C con paneo x (284.08) → C (290.57) → D 10 s (295.3) → C (303.9) → D 10 s (307.47, CTA).
  - reel 10: A → C con paneo x → C → D → C → C con paneo x → D (CTA).
  - Patrón: impacto → push con ease o escalera en cada frase clave → lineal lento bajo el CTA, alternando y sin repetir el mismo tipo dos veces seguidas.
- Movimiento sobre el footage (V1): shake en 195.97 s, escala 201→207→210 con saltos de posición cada 0.10–0.17 s (keyframes hold), junto con un sólido "ROJO" de 1.13 s.

## 4. Otros gráficos
- FilmBurnTransition7_Best8.mp4 (35×, 0.73 s) + Purple Cinemarker.mp4 (43×, 0.10 s a 135 % de velocidad, opacidad 39 %, modo de fusión id 22): destello de luz/quemado sobre un corte. El film burn empieza ~0.43 s antes del corte y el destello morado ~0.16 s antes. Se usa en los cambios de escena/plano dentro del reel y antes del CTA.
- Line Custom Duration (mogrt de Mister Horse, 14×): línea blanca dibujada de izquierda a derecha, trazo 11.5 px con extremos redondeados, longitud 122.8, escala 86.8, con glow y sombra paralela. Va como subrayado bajo la línea secundaria en mayúsculas de un título ("11 YOUTH SOCCER TEAMS"). Dura lo mismo que el título (1.5–6 s).
- Number Count Animations (mogrt de pavdesign, 6×): conteo 0→100 en 1.70 s, tamaño 200, blanco, entra con Transform y 0.759→0.5 en 0.17 s. Se usa en "Here are [100] ways". El número sale en DIN cursiva con degradado (ver frames/r07).
- Tarjeta final "Secuencia anidada 02" (12×, 2.55–2.6 s, una por reel): fondo negro con el logo Stimulus. Entra deslizando x 1.375→0.5 (desde la derecha) en 0.28 s con ease, justo cuando termina el CTA.
- "Turb displace text NO WIGGLE" (mogrt, 2 capas, 2.33 s): textos "START YOUR FREE DESIGN TODAY." y "WWW.STIMULUSATHLETIC.COM". Tracking 3, posterizar tiempo a 12 fps, desplazamiento turbulento 0.
- Recortes de imagen "canvas*.png" (1452×882, hojas de diseño de jerseys del PDF):
  - Escala 108–246 % con AE Crop, cambiando cada ~0.77 s, una por palabra ("colors, / styles, patterns, / …").
  - Sobre un sólido "Blanco", con subtítulos NEGROS.
  - Otra variante: recortes con Roughen Edges y sombra paralela de 5 px que entran con Transform y +60 px en 0.8 s.
- Sólidos "Negro" (4×) detrás de títulos de número grande. "Map - Digital 1": glitch de posición con hold de 0.43 s.

## Fotogramas (frames/)
- Títulos: r01_title_coach_whatif, r01_title_11teams_1000, r01_title_entry_0.18s_glitch, r04_title_deserves_more_plus_subtitle, r06_title_100_jersey_options, r08_title_soccer_coaches, r10_title_2options_number_icons, r11_title_being_overwhelming.
- Subtítulos: r02_subtitle_highlight_bigdecision, r03_two_lines_same_quality, r05_three_stacked_green_words.
- Iconos: r01_icons_row3_subtitle, r09_person_icons_row4, r09_wrong_order_icon, r01_cta_applynow_icon.
- Otros: r06_cutout_1freepdf, r07_number_count_100, r01_transition_filmburn_purple_at_cut, r01_outro_endcard_turb_text.
- CTA: cta_a/b/c/d (la d es la mujer de azul marino junto a la ventana).

## Regla de cortes del cliente (2026-11-11)
El zoom (punch-in/out o arranque de un movimiento) va en el MISMO frame del corte; nada de zoom y corte separados por pocos frames, ni clips <8 frames. Ver styles/stimulus/ESTILO.md ("Regla de cortes") y hfkit.picture_cuts / snap.
