---
type: spec
status: active
tags: [docucollage, reel1, gold-medal-syndrome, frame-analysis, motion]
relatedTo: [styles/docucollage/ESTILO.md, styles/docucollage/CATALOGO.md, styles/docucollage/kit.js, fuentes/docucollage/reels/DIV6ZPFIx3y]
---

# Reel 1 (DIV6ZPFIx3y) — análisis cuadro a cuadro

## Fuente y método

- **Reel:** Ali Abdaal, "Gold Medal Syndrome". Copia de YouTube 1080×1920, 25 fps, 54.73 s (≈1368 frames, f0–f1367). ID de la copia: alLf0hN5JsQ.
- **Breakdown visual:** ventanas de 90 frames (3.6 s), w_00000…w_05400. Los frames se miraron a 360×640, así que ×3 da 1080×1920 (donde dice "@270" se multiplica ×4).
- **Medición con código (confianza alta):** scdet 5, cadencia de diferencias de frame, fase de correlación por letra, ECC afín entre frames, búsqueda de la banda de shine, Laplacian tras los cortes.
- **Regla de prioridad:** si la medición y la lectura visual discrepan, vale la medición.
- **Cortes scdet (s):** 1.92, 2.12, 4.00, 5.92, 7.32, 10.32, 11.60, 14.40, 15.00, 15.52, 16.32, 21.92, 28.80, 33.68, 34.28, 34.88, 35.76, 37.20, 47.64, 47.96, 49.56, 49.84.
- **Cortes falsos (saltos de zoom o slide, no cortes):** 21.92 (f548), 47.96 (f1199), 49.84 (f1246).
- **Huecos de datos:**
  - w_00000 (f0–f89) vino vacía. Lo de f0–f54 sale solo de las mediciones y de los cortes 1.92 y 2.12. No hay descripción cuadro a cuadro.
  - w_04680 se cortó en la transición torn-paper (f1189–1195). Faltan sus detalles.
- **Discrepancias resueltas:**
  - **fps:** medido 10 poses/s (patrón `__x_x`, 3-2-3-2). Para el rebuild se usa 12 fps por preferencia del usuario.
  - **Shine:** el visual dijo "no hay shine" en casi todos los títulos. La medición lo encuentra en el título GOLD MEDAL SYNDROME. Vale la medición, y el shine es exclusivo de ese título.
  - **ECC en talking head:** mide zoom de +1.8 a −1.2 %/s, pero los cuadros muestran fondo fijo (≤5 px). Es el host inclinándose, no cámara.
  - **Climber 47.7–49.4:** ECC lee ×0.826 (−10 %/s). El visual dice cámara estática y solo se mueve el cutout. Hay que tratarlo como pull-out leve de la capa colage (ver reglas).
  - **Wiggle:** medido en el título GOLD MEDAL SYNDROME. En JESSICA (marker) y DISCIPLINE& FOCUS casi no hay wiggle (≤2 px). En FORMER ATHLETE es grande (±9–12 px).

## Línea de tiempo plano por plano

Abreviaturas: TH = talking head real, CO = cutout, WS = whip-out, bl = blur. Las coordenadas están en px @1080.

| plano | frames | s | tipo | qué se ve | cámara | capas y su movimiento | título | transición de salida | SFX esperado |
|---|---|---|---|---|---|---|---|---|---|
| P01 | f0–47 | 0–1.92 | CO host + title card (inferido) | host recortado sobre card | ×1.067 (+3.7 %/s), sube ~60 px | host + título | GOLD MEDAL SYNDROME: tipeo hasta ~0.8 s, shine 0.80–1.72 s | cut 1.92 | ticks por letra, whoosh del shine |
| P02 | f48–54 | 1.92–2.2 | s/d | sin datos (cortes 1.92 y 2.12) | s/d | s/d | s/d | cut 2.12 | — |
| P03 | f55–99 | 2.2–4.0 | CO host sobre foto banco | host sobre silueta de banco | +1.5 %/s; host sin zoom | host fijo (<15 px); fondo whip izq | WHY YOU ARE UNHAPPY, estático | WS f96–99 (bl 4/6/16/18 px) | whoosh f95–100, pico f98 |
| P04 | f100–147 | 4.0–5.88 | foto cutout | nena flexionando, ojos tapados, pared blanca | slide-in y push 1.00→1.2 (piso) | nena entra desde derecha (−135 px); aros f143; medalla f145 | JESSICA marker f103–115 | re-frame f148 | scribble f103–115, riser f129–152, pop f143, ding f145 |
| P05 | f148–182 | 5.92–7.28 | foto | mismo set, push continúa | ~1.23 (piso), pan −190 px total | aros 1.28→1.0; medalla cae a y1050 | JESSICA sale por arriba f143–148 | WS f178–180; defocus 18–20 px f180–182 | thud f148, whoosh f178–180 |
| P06 | f183–257 | 7.32–10.28 | collage B/W | familia color sobre pista B/W | settle −85 px, ×1.08→1.0; estática f193–247; push f248+ (+2.1 %/s) | cutout con el plano, bg 15–25 % del parallax | FORMER f200–208, ATHLETE f210–223 | vuela hacia arriba f250–260 | whoosh f183, ticks, thud f223, riser f248–260 |
| P07 | f258–269 | 10.32–10.76 | collage | mismo plano, punch-in | salto +8 %, +90 px; ×1.0→1.45 total | bg menos escalado | DISCIPLINE f258–268 | sigue en P08 | 10 ticks rápidos |
| P08 | f270–284 | 10.8–11.4 | collage | misma foto estática, escala 1.00 | estática | — | FOCUS f270–278 (letra c/2 f) | — | ticks f270, 273, 275, 278 |
| P09 | f285–289 | 11.4–11.6 | collage | punch-in a 1.5 | 1.05→1.5 con pan −315 px; bl 3→18 px | título se corre −120 px | congelado | corte duro f290 | riser, impacto f290 |
| P10 | f290–359 | 11.6–14.4 | foto + cutout | velocista sobre cielo halftone, 2 espectadores de espalda | pull-out medido −2.4 %/s; settle pan −186 px f290–300 | espectador izq 1.5× bg; der entra f293; deriva ≤6 px/s | JESSICA'S f313–325, DREAM f328–335 | slide ↓ 1290 px f362→363 | ticks, ambiente de estadio |
| P11 | f360–364 | 14.4–14.6 | transición | cola del título | f362→363 plate ↓ 1290 px; 2 f quietos | — | — | reemplazo duro f365 | whoosh f362–363 |
| P12 | f365–374 | 14.6–15.0 | gráfico | gradiente + pill; globo cae f368 | estática | globo cae y para f370, asienta +36 px f373 | — | franja torn-paper f373–375 | caída y boom f370, rip f373–375 |
| P13 | f375–387 | 15.0–15.52 | foto en franja rasgada | velocistas en bloques | sin zoom | franja ↓ 870 px en 15 f | — | corte duro f388 | click f375 |
| P14 | f388–407 | 15.52–16.32 | foto en franja | carrera de 4 | sin zoom; runners +1–2 % | globo rota ~0.9°/f | — | corte duro f408 | click f388 |
| P15 | f408–449 | 16.32–17.98 | foto en franja | runners top-down | sin zoom | — | PURSUIT OF f423–428, PERFECTION f430–438 | disuelve f462–467 | ticks, hit f438 |
| P16 | f450–452 | 18.0–18.1 | collage card | runners + globo + título | estática | — | título completo | — | — |
| P17 | f453–467 | 18.12–18.72 | host CO + dissolve | host sube sobre collage | hair-top ↑ de 1290 a 160 px (f453–465) | host cubre título desde f459 | PURSUIT OF PERFECTION se desvanece | dissolve 6 f, bl 0–10 px, bloom azul | whoosh f453, shimmer f462 |
| P18 | f468–496 | 18.72–19.88 | TH | cuarto azul | host deriva x790→545, escala 1.0→0.93 (f468–485) | — | — | dissolve 5 f | — |
| P19 | f497–509 | 19.88–20.4 | foto + host CO | podio, host cae | foto bl 20–30 px→0 f501 | host ↓ ease-in f500–509 | — | — | swell + aplauso, whoosh ↓ |
| P20 | f510–587 | 20.4–23.5 | foto medallista | podio, cara tapada, aros abajo | ×1.215 (+5.8 %/s) 19.7–23.4, pan −156 px; ráfaga f545–558 | atleta 1.0→1.28 en pasos 3-2-3-2; bg ×1.12 | GOLD f550–560, MEDAL f563–573; shine 22.8–23.5 s | disuelve f598–604 | swoosh f545, ticks, shimmer f573 |
| P21 | f588–603 | 23.52–24.16 | host CO + dissolve | host sube sobre foto | head-top decay ×0.7/f | foto bl 6 px, tinte azul | fade f599–604 | crossfade 7 f | whoosh f588 |
| P22 | f604–719 | 24.16–28.8 | TH | cuarto azul | bg fijo; host inclinado (+24 % ancho de gafas f630–655) | blend f622–626 | — | corte f720 | glitch f622–626 |
| P23 | f720–841 | 28.8–33.64 | TH | cuarto azul | bg fijo; −1.2 %/s medido | ghost f772–773 | — | corte f842 | — |
| P24 | f842–856 | 33.68–34.24 | foto B/W | estante de medallas | push 1.00→1.06 (f847–856) | still | — | corte f857 | click, riser |
| P25 | f857–871 | 34.28–34.84 | foto B/W | mujer en estudio | ×1.04 + deriva +3 px/f | still | — | corte f872 | click |
| P26 | f872–893 | 34.88–35.72 | foto B/W | mujer en multitud con celulares | ×1.07, deriva +0.4 px/f | parallax leve manos/fondo | — | host sube f893 | click |
| P27 | f894–905 | 35.76–36.2 | host CO + dissolve | host sobre multitud, luego sale a TH | fondo congelado, −10–15 % brillo | hair-top 1230→114 px en 6 f | — | dissolve f900–906 con light leaks | whoosh + pop f893–895, shimmer f901 |
| P28 | f906–929 | 36.24–37.16 | TH | cuarto azul | bg fijo, host escala 1.0→0.94 | — | — | jump cut f930 | — |
| P29 | f930–985 | 37.2–39.4 | TH | cuarto azul | drop-in del host f949–967 (+480 px); jump +80 px f930 | host/bg parallax 0.4 | WHAT'S NEXT? f960–973 | dissolve 3 f f983–985 | riser f949–960, thud f973 |
| P30 | f986–1169 | 39.44–46.76 | TH | cuarto azul | bg fijo | blend f1157–1161 | GOLD MEDAL SYNDROME f1117–1139, sale f1155–1161 | — | ticks f1117–1139, ding f1139 |
| P31 | f1170–1188 | 46.8–47.52 | TH | cuarto azul | bg fijo | — | — | torn-paper f1189–1195 | — |
| P32 | f1189–1195 | 47.56–47.8 | transición | franja de papel rojo rasgado | s/d (ventana cortada) | — | — | revela collage | rip |
| P33 | f1196–1238 | 47.84–49.52 | collage rojo | escalador B/W | sin cámara virtual; ECC ×0.826 | cutout pop f1196 (+330 px), settle f1206; sale ↓ f1234–1239 | NO MORE MOUNTAIN LEFT TO CLIMB f1206–1226, sale ↑ | — | ticks |
| P34 | f1239–1276 | 49.56–51.04 | collage rojo | hombre sobre bus | cutout sube (+480 px), settle f1256 | bus + hombre juntos | NO MORE CHALLENGES TO CONQUER f1244–1266 | dissolve 7 f | ticks |
| P35 | f1277–1283 | 51.08–51.3 | dissolve | collage → host | collage ×1.12 | host bl 35→0 px | fade lineal | — | whoosh f1277 |
| P36 | f1283–1308 | 51.32–52.3 | TH | cuarto azul | fija | host sway ±330 px | — | blend 1 f f1309 | riser opcional |
| P37 | f1309–1367 | 52.36–54.73 | TH | reencuadre más ancho (0.85×), shelf a la derecha | lean +19 % | — | — | fin | whoosh/hit f1309 |

## Cámara (zooms, push-in, pull-out, pans: valores por plano y reglas generales)

**Medido (ECC afín, escala sobre el plano entero):**

| tramo | s | movimiento |
|---|---|---|
| host CO + título | 0.1–1.9 | ×1.067 (+3.7 %/s), sube 60 px |
| banco | 2.2–3.9 | +1.5 %/s |
| Jessica | 4.1–7.2 | +1.2 %/s, pan −190 px izq |
| familia | 7.4–10.2 | +2.1 %/s |
| runner | 11.7–14.3 | −2.4 %/s (pull-out) con pan |
| medal ceremony | 19.7–23.4 | ×1.215 (+5.8 %/s), pan −156 px |
| TH | 24–28.6 | +1.8 %/s, sube 376 px (host inclinado) |
| TH | 28.9–33.5 | −1.2 %/s |
| TH | 37.3–47.5 | −0.3 %/s |
| climber | 47.7–49.4 | ×0.826 (−10 %/s) |
| car | 49.9–51 | −1.6 %/s |

**Valores por plano (visual):**
- **P04 Jessica:**
  - f100–114: la nena entra de x690→555 (−135 px), ease-out, de 9 px/f a ~0, escala 1.00.
  - f115–128: hold, 1.00→1.01.
  - f129–152: push ease-in a 1.2 (piso) y 1.3 (brazos).
  - f153–177: ease-out hasta 1.23.
  - f148: reencuadre de un frame, +5 % y +45 px.
  - f178: paso de un frame, nena −30 px, aros −9 px.
- **P06 familia:**
  - f183–188: slide −85 px, ×1.08→1.0, ease-out.
  - f188–193: −30 px más.
  - f193–247: estática (≤1 px).
  - f248–257: push +50 px.
  - f258: salto +8 % y +90 px.
  - f258–269: ×1.0→~1.45 en total (ojos +405 px), S-curve con pico en f253–260.
- **P09 y P10 transición:**
  - f285–289: 1.0→1.5 con pan −315 px (ease-in, salto grande en f288).
  - f290–300: pan −186 px, ×1.3→1.0, ease-out.
  - f300–359: foreground 18 px/s, bg ≤6 px/s, sin shake.
- **P11 al P15 (globo y franjas):**
  - f362→363: plate ↓ 1290 px en 1 paso. f363 y f364 idénticos.
  - Resto: sin zoom ni shake. Deriva ~1 px/f.
  - La franja rasgada baja +255, +225, +210 px por paso y queda con tilt de 3–5°.
- **P20 podio:**
  - f540–544: hold de 5 frames.
  - f545–558: ×1.00→1.28 en pasos +3, +7, +6, +3, +5 %, anclado arriba-centro. Los pies salen por abajo (y1690 → 1875 en f548, fuera en f550).
  - f558–587: ×1.30→1.32, deriva ~1 px/f.
  - Parallax: figura ×1.28, bg ×1.12 (ratio 0.45), bg bl 0→6 px.
- **Talking head:** bg fijo ≤5 px. El "zoom" es el host inclinándose: gafas 420→520 px (+24 %) f630–655, 490→430 px f668–676. Sin shake.
- **P26 multitud:** +7 % lineal, 10 fps.
- **P33/P34:** sin cámara virtual, bg estático con polvo de 1–2 frames (f1249). Solo se mueven los cutouts.

**Reglas generales:**
- Todo plano gráfico tiene un push-in lento de +1.2 a +2.1 %/s. Pasa a +5.8 %/s en el podio.
- El pull-out (−2.4 %/s) es solo para el plano de runner y el collage rojo.
- El talking head no lleva zoom digital. Si se agrega, ≤1.8 %/s.
- Los pasos de cámara usan holds de 3-2-3-2 frames (12 fps en el rebuild).
- Un reencuadre duro vale +5–8 % escala y +45–90 px en y, sin blur.
- No hay shake de cámara en todo el reel.

## Capas: movimiento por persona/objeto (entrada, deriva, escala, rotación, parallax, salida; reglas generales con números)

- **Nena (P04):**
  - Entra desde la derecha en 15 f con ease-out. Sin overshoot ni rotación.
  - Piso y 1560→1850 en f100→178.
  - Los pies salen del cuadro desde f148.
- **Aros:**
  - Pop de 1 frame en f143, ×1.28 (360 px de ancho de 360).
  - Hold hasta f147, luego shrink ease-out a ×1.0 (280 px) hacia f170.
  - Borde superior deriva y0→60 px, parallax 0.3×.
  - Quedan detrás del título y de la cabeza.
- **Medalla:**
  - Pop de 1 frame en f145, Ø130 px, y810.
  - Cae de 1 frame a y975 en f148, asienta en y1050 hacia f158.
  - Crece a Ø165 hacia f153. Sway ≤3 px.
- **Título JESSICA:** parallax 1.4–1.5× (cámara más cercana que la nena a 1.25–1.3×). Sube y205→−60 px en f129–147, acelerando.
- **Familia (P06):** no tiene entrada propia, llega con la foto. Slide −85 px ease-out, sin overshoot, sin rotación. Bg B/W a 15–25 % del parallax. Eye bars pegadas a las caras.
- **P10:**
  - Velocista: x245→183 (@360) en f290–300, ×1.25, luego +7 px en 2.5 s.
  - Espectador izq: x150→55, 1.5× la velocidad del bg, luego +20 px en x y +25 px en y en 2 s.
  - Espectador der: entra f293, 40 px a la izq, queda.
  - Objeto blanco redondo: sube desde abajo f338–346 a (495, 1875).
- **Globo:**
  - Ø855 px, x111–969.
  - Baja f368–372: 504 px en 2 frames, parada seca, +36 px en f373 → y centro 960.
  - Delante de las fotos, no afectado por los cortes.
  - Rota ~0.9°/f (70° en 81 f).
- **Host CO (rise):**
  - f453–465: hair-top 1290→160 px, pasos −320, −230, −200, −130, −45, −130, −30, −75. Escala 0.92→1.0.
  - f588–598: hair-top @360 de 428→58 (428, 318, 240, 185, 145, 115, 92, 75, 65, 60, 58), decay ×0.7/f, escala 0.95→1.05. Sin overshoot (≤2 px).
  - f893–899: hair-top @360 de 410→38 (pasos −145, −85, −62, −33, −30, −17), sigue en movimiento.
- **Host CO (exit):** f500–509 baja ease-in. Hair-top 390→435→525→615→780→1005→1320 px, fuera en f510. Velocidad de 50→300 px/f, +30 px derecha, escala leve.
- **Cutouts del collage rojo:**
  - Climber: pop f1196 a +330 px derecha. Offsets 330→135→60→15→0 (f1196/1199/1201/1204/1206), cada paso ≈40 % del anterior. Sale ↓ ease-in (+60 px f1234, +360 px f1236, fuera f1239).
  - Hombre en bus: sube desde +480 px con offsets 480→240→135→75→39→15→9→0 (f1239/41/44/46/49/51/54/56), ≈50 % por paso. Después deriva 1 px/3 f.
  - Orden de profundidad: bg → título → cutout (la B de CLIMB queda ocluida por la roca f1226–1233).
- **Reglas generales:**
  - Entradas de cutout: ease-out exponencial con decay 0.4–0.7 por paso, sin overshoot ni rotación, escala constante o 0.92→1.0.
  - Salidas: ease-in, 50→300 px/f.
  - Parallax: título 1.4–1.5×, sujeto 1.25–1.3×, bg 0.15–0.45×, aros 0.3×.
  - Rotación 0° en todo el reel.

## Títulos: fuentes, aparición, wiggle por letra, sombra, brillo (shine), salida

**Fuentes (medidas y visuales):**
- **GOLD MEDAL (título marca):** grotesca condensada, Bebas Neue más ~2 px de stroke, tracking 0.2 em, cap ~100 px.
- **SYNDROME:** Clarendon bold, Besley 900, cap ~92 px.
- **Otros títulos:**
  - Línea 1: serif display liviana, tracking ancho (cap 75–100 px).
  - Línea 2: serif pesada high-contrast, tipo Playfair Black o DM Serif (cap 90–205 px).
  - JESSICA: marker handwriting.
  - PURSUIT OF: condensada bold sans.
  - PERFECTION: didone pesada.
- **Color:** gold plano #FFD08D (título marca). Otros con gradiente #F0C07A→#C98F4A o #F5C77E→#B38B4D. JESSICA'S DREAM va blanco. Climber y bus en durazno #FFC98B–#FFD08A.

**Inventario:**

| título | frames | tamaño (cap) |
|---|---|---|
| GOLD MEDAL SYNDROME | 0–44 | GOLD MEDAL ~100, SYNDROME ~92 |
| WHY YOU ARE UNHAPPY | f55–99 | 75 / 105, y105–180 y 225–330 |
| JESSICA | f103–148 | 120, x240–880, y90–250 |
| FORMER / ATHLETE | f200–260 | 75 / 115, y150 / 285 |
| DISCIPLINE& / FOCUS | f258–289 | 85–90 / 180, y225, FOCUS x75–1010 |
| JESSICA'S / DREAM | f313–359 | 84 / 165, y135 / 210–390 |
| PURSUIT OF / PERFECTION | f423–467 | 90–100 / 100–150, y156 / 282 |
| GOLD / MEDAL | f550–604 | 170 / 170, GOLD x300–855, MEDAL x66–1035 |
| WHAT'S / NEXT? | f960–985 | 165 / 205, y105–270 / 300–505 |
| GOLD MEDAL / SYNDROME | f1117–1161 | 100 / 120, y140 / 280 |
| NO MORE… CLIMB | f1206–1239 | 125 / 105 / 135 / 180 |
| NO MORE CHALLENGES… | f1244–1283 | 120 / 90 / 90 |

**Aparición (typewriter por letra):**
- Va en el reloj de pasos (10 fps medido, 12 fps en el rebuild) con 2–3 letras por paso.
- Ritmo por letra:
  - JESSICA: 2.4 f.
  - FORMER: 1.5 f.
  - ATHLETE: 2.2 f.
  - DISCIPLINE: 1.1 f.
  - FOCUS y JESSICA'S: ~2 f.
  - PURSUIT: 0.7 f.
  - GOLD MEDAL SYNDROME (3.º): 1.1–1.5 f.
  - Climber: 0.8 f. Bus: 0.7 f.
- La letra más nueva sale a 35–50 % de opacidad con tinte (marrón en dorados, azul pálido en JESSICA'S DREAM) y se solidifica 2–3 f después. GOLD MEDAL (P20) y FOCUS entran con escala 0.7→1.
- WHAT'S NEXT?: las letras caen 100 px con ease-out en 5 f (arrancan recortadas arriba).
- Los títulos adelantan la voz de 2 a 6 f. GOLD MEDAL SYNDROME (3.º) adelanta ~1 s. El título del climber llega 2.5 f tarde.

**Wiggle por letra (medido en GOLD MEDAL SYNDROME):**
- Pose nueva cada 2–3 f.
- 76–94 % de las letras se mueven en cada paso, cada una independiente.
- Desplazamiento mediano por paso: 1.3–3.2 px.
- Offset por letra, std: 1.0–7.0 px en x y 0.9–4.8 px en y (|offset| mediano 3.2 px, p90 9 px).
- Rotación típica −2…+1° (std 1.6°, extremos ±5–6°).
- En otros títulos:
  - FORMER ATHLETE: ±9–12 px y ±2–3°, re-roll cada 3 f.
  - PURSUIT / PERFECTION: ±4.5 px y ±2°.
  - 3.º GOLD MEDAL: ±3–6 px y ±2°.
  - Climber: ±6–9 px por letra.
  - WHAT'S NEXT?: ±3–6 px, ±1°, cada 2 f.
  - JESSICA, DISCIPLINE& FOCUS, JESSICA'S DREAM: ≤2 px (casi nada).

**Sombra:**
- **Título marca (medido):** drop duro +10 px x, +9 px y, #422F1A casi opaco, blur ≈0–1 px.
- **Otros títulos:**
  - Dorados: +6–9 px, marrón oscuro, blur 0–5 px.
  - JESSICA'S DREAM: navy #2A4A7A, +6 px, blur 3.
  - PURSUIT / PERFECTION: navy-negro 70 %, +6–9 px.
  - WHAT'S NEXT?: navy-negro 50 %, +6/+9 px, blur 2.
  - GOLD MEDAL (P20): marrón suave, blur 6.
  - Títulos rojos: ninguna (como mucho 20 %).

**Shine:**
- **Solo en GOLD MEDAL SYNDROME.**
- Una pasada izquierda→derecha, banda blanca diagonal de 150–250 px de ancho, escalonada con holds de 2–3 f.
- Arranca apenas termina el tipeo.
- Apariciones:
  - 1.º título: x95→948 px en 0.80→1.72 s (~970 px/s, 0.88 s).
  - 2.º (22.8–23.5 s): 106→774 px en 0.6 s (~1100 px/s).
  - 3.º (f1142–1148): tenue, ~150 px de ancho, cruzando en 6–8 f.
- Ningún otro título lleva shine.

**Salida:**
- JESSICA: scroll off por arriba f143–148, acelerando.
- FORMER ATHLETE: sube con el zoom ease-in (−12 a −36 px/f), fuera en f260.
- DISCIPLINE& FOCUS: sin salida propia, corte f290.
- PURSUIT / PERFECTION y GOLD MEDAL: fade con el dissolve (6 f).
- WHAT'S NEXT?: fade 90→50→0 % en f983–985.
- 3.º GOLD MEDAL: fade lineal de 6 f (f1155–1161).
- Climber: sube ease-in (−48, −210, −615 px en f1234/36/39), fuera f1241.
- Bus: fade lineal durante el dissolve f1277–1283.

## Subtítulos: tamaño, posición, relleno palabra por palabra

- **Píldora:** #FBF5E5 (95–100 % opaca), alto 103 px (100–108), radio 24–36 px (casi totalmente redondeada), padding ~30–36 px por lado.
- **Posición:** centro x540.
  - Hasta f587 (23.5 s): y 848–951 (centro ~900, 44 %).
  - Desde f587: y 1332–1435 (centro ~1383–1386, 72 %). El salto es de un frame.
- **Ancho:** se ajusta al texto, instantáneo en cada swap. Típico 631–991 px, rango 330–1020 px (ej. "But soon" 330, "the globe" 360, "discipline and focus" 670–678, "This feeling of dissatisfaction" 930).
- **Fuente:** Poppins Bold/SemiBold, tinta ~59 px (rango visual 48–66), 2–4 palabras por chunk.
- **Colores:** palabra pendiente #CFC8B6 (≈30–35 % de contraste). Palabra dicha #1B1B1B (casi negro). Las dichas quedan oscuras hasta el swap.
- **Relleno:**
  - Crossfade de palabra entera gris claro → gris oscuro → negro. NO es wipe izquierda→derecha.
  - Hay varias palabras parcialmente rellenas a la vez.
  - Duración: 3–4 f para palabras cortas, 5–8 f típico (0.2–0.3 s), 10–12 f para largas ("dissatisfaction" 10, "realization" 12, "time" 11, "devastating" 8–10, "praise" 10).
  - Arranca de −2 a +2 f del onset (se adelanta o se atrasa, ±3 f según el caso). En f630–f719 se retrasa 4–10 f.
  - 1 frame por paso (25 fps).
- **Swap de chunk:** hard cut de 1 frame, sin animación de escala, deslizamiento ni fade. Ocurre de −3 a +5 f respecto del primer onset (típico 0–2 f antes). La primera palabra ya llega oscura o oscureciéndose.
- **Excepciones:** f398 y f415 aparecen al 75 % de opacidad por 2–4 f. f452 y los pills de f1260+ llevan 1–2 f de fade de entrada.
- **Estabilidad:** el pill queda nítido durante blurs y cortes (se mantiene constante a través del corte f290).
- **Swaps clave (frame):**
  - 100, 119, 141, 158, 183, 198, 236, 262, 270, 290, 314, 354.
  - 360, 366, 380, 398, 415, 452, 485, 511, 541, 559, 587, 604, 629.
  - 648, 668, 687, 720, 740, 759, 773, 786, 804, 842, 872, 898.
  - 930, 950, 961, 982, 1020, 1049, 1078, 1099, 1133, 1162.
  - 1194, 1212, 1239, 1261, 1276, 1289, 1310, 1317, 1332, 1342.
- **Typo:** el caption escribe "wining" (así en el original).
- **Texto:** los captions no siempre coinciden con la transcripción ("everything she had" vs "everything that she'd").

## Transiciones (tipo, frames, blur)

| tipo | frames | blur / detalle |
|---|---|---|
| WS (whip) host→foto | f96–99 | bl 4, 6, 16, 18 px; bg whip ~100 px izq; host solo blur |
| Hard cut + deblur | f100 | 18, 14, 10, 5, 2, 0 px (f100–105) |
| Reencuadre duro | f148 | +5 %, +45 px, sin blur |
| WS-out | f178–179 | ~10 px y subiendo (f179) |
| Hard cut desde defocus | f183 | 36, 36, 24, 15, 9, 0 px (f183–188) + slide −85 px |
| Punch-in jump | f258 | +8 %, +90 px, sin blur |
| Zoom-out + cut | f285–297 | 3, 8, 18 px (f286–289), cut f290, 18 px f290–292, 8 f293–294, ~0 f295–297 |
| Slide down | f362→363 | −1290 px en 1 f, 2 f quietos, bl 0–4 px |
| Reemplazo duro | f365 | — |
| Franja rasgada | f373–375 | ease-out 15 f |
| Hard cuts de fotos | f375, f388, f408 | sin flash, whip ni zoom |
| Dissolve | f462–467 | 6 f, bl 0–10 px, bloom azul |
| Dissolve + host drop | f497–500 (+ f500–509) | 5 f, foto entra a 20–30 px y nítida en f501 |
| Zoom burst | f545–558 | no es cut; ×1.28 en pasos |
| Crossfade a cuarto | f598–604 | 7 f, bl 6 px, tinte azul; alpha 100/95/85/70/50/25/0 |
| Blend | f622–626 | 4 f, bl 0–2 px, host +60 px, ghost de manos |
| Ghost jump | f772–773 | 2 f, 40–60 px, cabeza tilt ~8° |
| Hard cut + rack focus | f842 | 20–25 px f842–844, 6–8 px f845–846, nítido f847 |
| Hard cut + rack focus | f857 | ~20 px f857–859, nítido f860 |
| Hard cut limpio | f872 | sin blur ni flash |
| Dissolve colage → cuarto | f900–906 | opacidad 100/95/85/60/35/10/0, bl 6–10 px, light leaks de 120 px en bordes, halo azul de 10 px |
| Jump cut | f930 | host +80 px, <2 % escala, 0 f |
| Dissolve | f983–985 | 35 / 50 / 0 %, bl 3–4 px, bloom azul x≈20 y x≈990 |
| Blend | f1157–1161 | 5 f, ghost 100–150 px, sin blur |
| Torn-paper | f1189–1195 | franja de papel rojo con fibra blanca; ventana cortada, detalles s/d |
| Dissolve | f1277–1283 | 7 f, opacidad −15 %/f, host bl 35→10 (f1280)→0 px, collage ×1.12, tinte cálido |
| Blend | f1309 | 1 f, ghost 50/50 |

- **Nitidez medida tras cortes (Laplacian var, 1.0 = normal):** 0.03–0.37, recupera en 4–8 f.
  - 4.00: 0.03, 0.04, 0.07, 0.12, 0.20.
  - 7.32: 0.13…0.31.
  - 28.80: 0.24…0.37.
  - 33.68: 0.12 por 3 f.
  - Cortes nítidos: 15.52, 16.32, 21.92.
- Nunca hay flash blanco ni zoom de transición. El blur resuelve en 1 frame por paso (25 fps).

## FPS por elemento

| elemento | cadencia medida | para el rebuild |
|---|---|---|
| Gráficos (cámara, fotos, cutouts de collage, push, título) | 10 poses/s (patrón 3-2-3-2) | **12 fps** (2 f) |
| Letras del título | misma grilla, 2–3 f | 12 fps |
| Wiggle de letras | re-roll cada 2–3 f | 12 fps |
| Talking head (video) | 25 fps, 1 f | 25 fps |
| Host CO entrando/saliendo | 25 fps (cada frame único) | 25 fps |
| Dissolves y blur ramps | 1 f | 25 fps |
| Caption fades | 1 f (suave) | 25 fps |
| Caption swaps | instantáneos | 1 f |
| Shine | holds de 2–3 f | 12 fps |

## Host (encuadre, tamaño, cuándo aparece recortado, nunca solo sobre fondo gráfico)

- **Modos del host:**
  - TH real a pantalla completa, en cuarto desenfocado con luz azul. Cámara fija, plano medio-corto, host centrado sentado, planta arriba derecha (~x900), shelf derecha, tira azul izquierda (x≈135–200).
  - CO recortado sobre foto o collage con el título detrás de su matte. Siempre sobre un fondo con foto y título, nunca sobre fondo plano o gradiente.
  - El gráfico solo (gradiente + globo, f365–374) aparece sin host.
- **Tamaño:**
  - Ancho de gafas 420–535 px (rango 405–520 en la ventana f630+ y 505–525 en el CO de f893).
  - Cabeza ancha 450–570 px.
  - Cara en cutout S1 a (495, 1410).
  - Host top-head en reposo del CO: y≈160–175 px.
- **Cuándo aparece recortado:**
  - f0–f99 (sobre card y banco).
  - f453–467 (sobre collage de runners/globo).
  - f588–603 (sobre foto del podio).
  - f893–905 (sobre multitud B/W).
- **Entrada:** siempre sube desde abajo con ease-out exponencial (decay ×0.7/f, 6–13 f). Sin overshoot ni rotación, escala 0.92–0.95 → 1.0–1.05. Cada entrada va con whoosh/pop.
- **Salida:** hundimiento ease-in (50→300 px/f), +30 px derecha. Sirve para revelar la foto de fondo (f500–509).
- **Transición CO→TH:** el CO se funde en el video real con dissolve de 5–7 f (f462–467, f598–604, f900–906) con light leaks azules y halo azul de ~10 px en el borde.
- **Borde del recorte:** máscara dura, leve rim azul de la fuente, sin stroke de sticker ni drop shadow.
- **Capas:** el título va detrás del matte (el pelo tapa ~45 px del título). El pill de subtítulos va delante de todo.
- **Movimiento del host en TH:** sway natural ±150–330 px (hasta ±60 px de cabeza), inclinación +24 % en gafas, manos con motion blur. Reencuadres con blend o jump cut (f622–626, f772–773, f930, f1157–1161, f1309), que cambian ±60–120 px y ±15 % de escala.

## Reglas para replicar (checklist numerada, accionable, con números)

1. Render a 1080×1920, 25 fps. Gráficos escalonados a 12 fps (hold 2 f). Talking head, host CO, blur ramps y fades de caption a 25 fps.
2. El host nunca aparece como CO sobre fondo plano. Siempre con foto/collage + título detrás de su matte. El TH real es la base de las pausas.
3. Estructura: ráfagas gráficas de 1.2–3.0 s (foto + título + caption) alternadas con TH de 4–10 s. El TH nunca lleva título largo salvo GOLD MEDAL SYNDROME (f1117) y WHAT'S NEXT? (f960).
4. Todo plano gráfico lleva push-in lento de +1.2 a +2.1 %/s (+5.8 %/s en el podio). Pull-out de −2.4 %/s solo en runner y collage rojo.
5. Reencuadre duro: +5 a +8 % y +45 a +90 px en y en 1 frame, sin blur.
6. Cortes gráficos: usar hard cut con deblur 36→24→15→9→0 px en 5 f (f183), o 18→14→10→5→2→0 en 6 f (f100). Sin flash, whip ni zoom de transición.
7. WS de salida: blur 4/6/16/18 px en 4 f, bg corrido ~100 px a la izquierda, host solo con blur.
8. Dissolve entre CO y TH: 5–7 f, blur 0–10 px, bloom o light leaks azules de ~120 px en los bordes, halo azul de 10 px alrededor del host.
9. Entrada de host CO: ease-out exponencial, decay ×0.7/f, 6–13 f, sin overshoot. Entrada de otros cutouts: decay ×0.4–0.5 por paso. Salida: ease-in 50→300 px/f.
10. Cutouts del collage: sin rotación, escala constante, offset de entrada 330–480 px. Orden de capas: bg → título → cutout → (host) → caption.
11. Parallax: título 1.4–1.5×, sujeto 1.25–1.3×, bg 0.15–0.45×, aros 0.3×.
12. Títulos: tipeo por letra sobre grilla de 12 fps (2–3 letras por paso). Ritmo 0.7–2.4 f por letra. Letra nueva a 35–50 % de opacidad con tinte durante 2–3 f. Adelantar el título 2–6 f a la voz.
13. Wiggle: solo en títulos dorados/serif. Offset por letra con std 3 px (x) y 2 px (y), rotación std 1.6°, re-roll cada 2–3 f en el 80–90 % de letras. FORMER ATHLETE puede subir a ±9–12 px. Marker JESSICA, DISCIPLINE& FOCUS y JESSICA'S DREAM sin wiggle (≤2 px).
14. Sombra del título marca: +10/+9 px, #422F1A, blur 0–1 px. Otros dorados +6–9 px. Navy #2A4A7A en JESSICA'S DREAM.
15. Shine solo en GOLD MEDAL SYNDROME: una pasada izquierda→derecha, banda blanca diagonal de 150–250 px, ~970–1100 px/s, 0.6–0.9 s, escalonada, arrancando al terminar el tipeo. Ningún otro título lleva shine.
16. Fuentes: GOLD MEDAL = Bebas Neue (+2 px stroke, tracking 0.2 em, cap 100). SYNDROME = Besley 900 (cap 92). Otros: serif liviana de tracking ancho (línea 1) + serif heavy/Playfair Black (línea 2). Colores: #FFD08D plano para el título marca, gradiente dorado para los demás.
17. Salidas de título: sube con ease-in acelerando (JESSICA, FORMER ATHLETE, climber) o fade lineal de 6 f con el dissolve (PURSUIT, GOLD/MEDAL, 3.º GOLD MEDAL, bus). WHAT'S NEXT? fade 90→50→0 % en 3 f.
18. Subtítulos: pill #FBF5E5, alto 103, radio 24–36, ancho = texto + 30–36 px por lado, texto Poppins Bold 59 px, centrado en x540.
19. Posición del pill: y centro 900 hasta f587 (23.5 s), y 1383–1386 desde ahí. Swap duro de 1 frame, pill se redimensiona instantáneo.
20. Relleno de palabras: crossfade de palabra entera #CFC8B6 → #1B1B1B, 3–5 f para cortas, 6–8 f típico, 10–12 f para largas. Arranca 0–2 f antes del onset. 25 fps, sin wipe.
21. Chunks de 2–4 palabras. La primera palabra llega oscura. Swap 0–2 f antes del primer onset.
22. El pill no se afecta por los blurs (siempre nítido) y se mantiene constante a través de los cortes.
23. Globo: Ø855 px, cae 504 px en 2 f y para en seco (sin overshoot), +36 px de asentamiento, rota 0.9°/f. Va delante de las fotos y no se corta.
24. Franja rasgada: baja 870 px en 15 f con ease-out (+255, +225, +210 px por paso), tilt final izq y275 / der y310. Fotos siguientes entran con hard cut sin animación.
25. Fotos B/W con eye bars negras pegadas a la foto (~135×21 px).
26. SFX: whoosh en cada WS y entrada de host (pico en f98); ticks por letra; riser antes de reencuadres (f129–152, f248–260, f949–960); thud/ding en pop de medalla (f145, f148) y cierre de título (f223, f438, f973, f1139); click en cada corte de foto; rip en torn-paper; ambiente de estadio en P10; música de fondo continua.
27. Datos faltantes (P01–P02 inferidos, P32 sin detalle): validar contra el video antes de cerrar el spec.
28. Collage del climber: aplicar pull-out leve sobre la capa cutout+título (hasta ×0.93 en 1.7 s) y verificar contra el original. El ECC midió ×0.826, pero el visual dice cámara estática.