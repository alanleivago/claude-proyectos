````markdown
---
type: reference
tags: [expresiones, pixel-art, ps1, low-poly, camarera, shorts, rom-com, referencia-visual, missmedannypsx, caras]
---

# EXPRESIONES_MUJER: caras de la protagonista (@missmedannypsx)

**Cómo están hechas las caras en el original** (estimado a ojo desde recortes de 512 px, a verificar en el video):
- **Textura plana sobre cabeza low poly, sin nariz ni orejas.** Los cambios de expresión son discretos (ojos ^^, boca abierta, sonrojo que aparece o desaparece) y la malla no se deforma. Todo apunta a un **cambio de textura de cara por expresión**. La inclinación y el giro de cabeza son animación aparte, no textura.
- **Resolución:** cada texel se ve de ~4–5 px en el recorte de 512, así que la cara mide unos 40–48 px de ancho. El **ojo mide ~10–12 × 7–8 px** y el iris ~5–6 px, con 1 px de brillo blanco arriba-izquierda. No hay pupila separada: el iris es rojo sólido. La esclerótica es casi del color de la piel, así que el contraste lo da el iris y el contorno.
- **Contorno y detalle:** contorno negro de 1 px, con la línea del párpado superior de 2 px. Tiene 1–2 púas de pestaña en la comisura externa y 2–3 ticks cortos bajo cada ojo. Las cejas son trazos de 1–2 px y ~5–6 px de largo. La boca cerrada es una línea de 1 px y 7–9 px de ancho. La abierta es un polígono con contorno negro, interior rojo oscuro y lengua rosa, sin dientes.
- **El sonrojo no es un bloque de color.** Son **3 trazos diagonales "///" en 2 filas**, en rosa, bajo cada ojo. Sobre todo se ve un overlay CRT de scanlines horizontales y un subtítulo en fuente pixel blanca y rosa.

> **Convenciones:** izq/der = lado del espectador. Los porcentajes y ángulos están medidos a ojo sobre los recortes, no sobre las texturas reales. El original solo es referencia de estudio: dibujar la cara de NUESTRA camarera, no calcar.
> **Ojo con la escala:** la celda propuesta de 24×24 deja el ojo en 8 px, menos que el original (~11). Si se quiere más fidelidad, usar 32×32 y escalar las guías ×1.33.

## Paleta (hex estimados)

| Elemento | Hex |
|---|---|
| Piel base (luz neutra) | `#E6D6CB` (sombra `#C9B4A8`; escena cálida `#F0D8C0`; ascensor rosa `#E8B8B0`) |
| Esclerótica | `#F2E8E2` |
| Contorno, cejas, línea de boca | `#15101A` |
| Iris | `#D41E2E` (brillo `#FFFFFF`) |
| Sonrojo | `#E8788C` |
| Interior de boca | `#B3243F` |
| Lengua | `#F07890` |
| Pelo (base / banda de brillo / forro interior rojo) | `#14111E` / `#4A4466` / `#B3203D` |
| Jersey rojo (referencia) | `#C8102E` (sombra `#8E0B20`) |
| Subtítulo rosa | `#F29BB9` |

**Leyenda de las celdas:** `.` vacío/piel · `#` línea oscura · `o` iris · `w` blanco del ojo o brillo · `r` sonrojo · `m` interior de boca · `t` lengua.
- **Celda base 24×24.** Ojos+cejas = filas 5–13 (grid de 24×9). Mejillas+boca = filas 15–20 (grid de 24×6).
- Los grids de ojos listan las filas 0–8 de esa franja y los de boca las filas 15 en adelante (las filas en blanco finales se omiten).
- Los ojos se dibujan de 8 px, con un hueco de 6 px entre ellos.

---

## 1. Sonrisa suave de frente / Soft smile (base)
- **Apariciones:** 909462 @14.5, @15.5 · 648662 @33.5 · 935190 @26.5, @55.5 · 040982 @9.5 · 466198 @24.5, @62.5
- **Imagen:** [648662_033.5s](female_faces/648662_033.5s_sonrisa-ladeada-mirada-directa.jpg)
- **Ojos:** Almendrados y abiertos, con el párpado superior al 90–100%. Iris centrado, mirando a cámara y tocando la línea superior. Brillo de 1 px arriba-izquierda en cada iris. Línea superior de 2 px con púa en la comisura externa y 2–3 ticks bajo cada ojo. Simétricos; el ojo derecho queda 1 px más alto si la cabeza gira.
- **Cejas:** Finas, ~60% del ancho del ojo, a 3–4 px sobre el párpado. Extremo interno abajo, -10° a -15° (hasta -20° en 909462 @14.5). Asimetría mínima, la derecha 1 px más alta.
- **Boca:** Línea cerrada en U de 7–9 px con comisuras 1 px arriba. Centrada o 1 px a la derecha, sin dientes.
- **Mejillas:** Sin sonrojo (en 935190 el tinte rosa viene de la luz del ascensor, no de un overlay).
- **Cabeza/mirada:** Frontal o inclinada 5–10°, mirando a cámara. El cuerpo está quieto y asoma por el marco de la puerta (040982 @9.5).
- **Historia:** Saludo o "escucho". Es la cara de reposo entre provocaciones ("Hey, vecina", "I can see…").
- **Adaptación:** Es la cara por defecto de la camarera al recibir al pretendiente en la barra. Sin movimiento de boca. Si el pelo de la camarera no tiene flequillo, las cejas siempre se ven.
- **Celda (ojos+cejas):**
```
..###..............###..
.....###........###.....
........................
..######........######..
.#wwooow#......#wwooow#.
.#woooow#......#woooow#.
..#oooo#........#oooo#..
....##............##....
...#..#..........#..#...
```
- **Celda (boca, filas 15+):**
```
........................
........#......#........
.........######.........
```

## 2. Reojo / mirada sobre el hombro / Side-eye smirk
- **Apariciones:** 909462 @18.5 · 648662 @16.5, @34.5 · 806870 @60.5 · 935190 @7.5 · 040982 @61.5, @65.5 · 129430 @42.5
- **Imagen:** [648662_034.5s](female_faces/648662_034.5s_sonrisa-satisfecha-de-reojo.jpg)
- **Ojos:** Párpado al 85–100%. El iris va pegado a la comisura del lado hacia donde mira, con ~60–70% visible. Con la cabeza en 3/4 el ojo lejano se ve ~70% de ancho, y el ojo cercano muestra más blanco. Brillo de 1 px. En 806870 @60.5 el párpado baja ~30% (mezcla con la expresión 4).
- **Cejas:** Asimétricas. La cercana a cámara se arquea +5–10° y sube; la lejana queda más baja y recta, con 2–4 px de diferencia.
- **Boca:** Sonrisa cerrada y pequeña (a veces ladeada, ver M2 de la expresión 6). La comisura del lado de cámara sube 1–2 px.
- **Mejillas:** Sin sonrojo.
- **Cabeza/mirada:** Giro 3/4 de 15–40° (o torso de espaldas, mirando sobre el hombro en 935190 @7.5 y 040982 @61.5). El flequillo sombrea la frente y se ve el forro rojo del pelo.
- **Historia:** "Te vi mirándome." Es la despedida o el giro al alejarse ("Lifts stop all…", "Out.").
- **Adaptación:** Girar el torso para enseñar la espalda del corsé (cordones) y las mangas abullonadas. La mirada de vuelta a cámara es el gancho visual.
- **Celda (ojos+cejas):**
```
..###............###....
.....###........#...#...
........................
..######........######..
.#wwwooo#......#wwwooo#.
.#wwoooo#......#wwoooo#.
..#wooo#........#wooo#..
....##............##....
...#..#..........#..#...
```
- **Celda (boca, filas 15+):** (variante ladeada: usar M2 de la expresión 6)
```
........................
........#......#........
.........######.........
```
- **Espejo:** para mirar al otro lado, voltear el grid en horizontal.

## 3. Cabeza ladeada coqueta / enamorada / Head-tilt, upward gaze
- **Apariciones:** 909462 @22.5 · 648662 @50.5, @61.5 · 411222 @22.5, @28.5, @29.5, @59.5, @60.5 · 040982 @49.5 · 129430 @21.5, @22.5
- **Imagen:** [411222_028.5s](female_faces/411222_028.5s_i-do-sonrisa-enamorada.jpg)
- **Ojos:** Párpado al 80–90% (tapa 10–20% de arriba). El iris sube y lo tapa ~25–30% la línea superior, con blanco visible debajo. Mira arriba-derecha, hacia cámara (por la cabeza inclinada). Brillo presente.
- **Cejas:** Arqueadas suave, con el interior -8°. La del lado de la inclinación queda ~2 px más alta.
- **Boca:** Sonrisa cerrada dulce, U algo más honda que la base, de 7–8 px con comisuras 1–2 px arriba.
- **Mejillas:** Sin sonrojo.
- **Cabeza/mirada:** Inclinación 20–35° (oreja hacia el hombro derecho del espectador) y barbilla algo baja. El cuerpo está quieto y se asoma el forro rojo del pelo.
- **Historia:** Afirmación cariñosa y calmada ("I do.", "Now.", "Open.", "So well."). Se acerca sin urgencia.
- **Adaptación:** Inclinar la cabeza y apoyar una mano en la cintura o en el hombro del corsé. Evita boca abierta: la calma es el efecto.
- **Celda (ojos+cejas):**
```
..###..............###..
.....###........###.....
........................
..######........######..
.#woooow#......#woooow#.
.#wwooww#......#wwooww#.
..#wwww#........#wwww#..
....##............##....
...#..#..........#..#...
```
- **Celda (boca, filas 15+):**
```
........................
........#......#........
.........#....#.........
..........####..........
```

## 4. Pícara, párpados medios / Smug half-lids
- **Apariciones:** 909462 @17.5 · 806870 @32.5, @33.5, @45.5, @47.5, @51.5, @56.5 · 466198 @31.5, @37.5, @43.5, @44.5, @52.5, @56.5
- **Imagen:** [466198_031.5s](female_faces/466198_031.5s_easy-sonrisa-satisfecha.jpg)
- **Ojos:** Párpado superior bajado 35–40% (tapa el tercio superior del iris; el ojo queda como media luna de ~3 filas). Línea superior recta de 2–3 px con púa externa. Párpado inferior subido ~1 px por la sonrisa. Iris centrado o 1 px abajo, brillo reducido o ausente.
- **Cejas:** Finas y altas (4–5 px sobre el párpado), asimétricas. La izquierda -10° y la derecha arqueada +5°, ~2 px más arriba (ceja levantada).
- **Boca:** Sonrisa "gato" ondulada de 8–9 px (dos curvas suaves, comisuras arriba). En 466198 @44.5 hay un punto/hoyuelo junto a la comisura derecha.
- **Mejillas:** Sin sonrojo.
- **Cabeza/mirada:** Frontal o con inclinación leve (0–10°). La barbilla baja ~5° y mira a cámara desde abajo. En 806870 @51.5 el torso se inclina hacia Danny.
- **Historia:** Ella controla la negociación coqueta ("That depends.", "How much do you need?", "Say it while you type."). Se la ve segura y divertida.
- **Adaptación:** Es la cara de camarera "Qué va a ser": mano en la cadera, bandeja en la otra. Dejar un diente o hoyuelo para el humor.
- **Celda (ojos+cejas):**
```
..###............###....
.....###........#...#...
........................
..######........######..
.########......########.
.#woooow#......#woooow#.
..#oooo#........#oooo#..
....##............##....
...#..#..........#..#...
```
- **Celda (boca, filas 15+):**
```
........................
........#..##..#........
.........##..##.........
```

## 5. Seductora, párpados caídos / Bedroom eyes
- **Apariciones:** 909462 @44.5 · 806870 @4.5, @6.5 · 466198 @9.5, @29.5
- **Imagen:** [806870_004.5s](female_faces/806870_004.5s_sonrisa-parpados-caidos.jpg)
- **Ojos:** Párpado superior bajado 55–65% (solo una ranura de 1–2 px de iris, ojo en forma de lente de ~8×3 px). Párpado inferior subido. Sin brillo, contorno grueso. Los ticks de pestañas inferiores se leen más.
- **Cejas:** Finas, casi planas (-5° a 0°) y altas (6–8 px sobre el párpado, casi tocan el flequillo). La izquierda puede subir 1–2 px.
- **Boca:** Línea fina ondulada, casi plana, de 7 px, con comisura derecha 1–2 px más alta (M4). Variante "Sure.": óvalo pequeño abierto (3×2 px) con lengua rosa (M9).
- **Mejillas:** Sin sonrojo.
- **Cabeza/mirada:** Frontal, cabeza baja 5–10°, mira bajo el flequillo. El cuello se ve alargado y el cuerpo inmóvil, con una calma casi amenazante.
- **Historia:** El momento más insinuante: "That depends.", "What's it for?", "Monday?", "You're cute". Plantea una condición sin sonreír del todo.
- **Adaptación:** Usarla poco, solo en el remate de una escena. Con el corsé conviene inclinarse levemente al frente, sin mover la cara.
- **Celda (ojos+cejas):**
```
...####..........####...
........................
........................
..######........######..
.########......########.
.#oooooo#......#oooooo#.
..######........######..
........................
...#..#..........#..#...
```
- **Celda (boca, filas 15+):**
```
........................
...............#........
.........######.........
```
- **Variante "Sure." (M9):**
```
........................
..........####..........
.........#mttm#.........
..........####..........
```

## 6. Desafío, cejas bajas / Challenging smirk
- **Apariciones:** 935190 @31.5, @74.5 · 040982 @52.5
- **Imagen:** [040982_052.5s](female_faces/040982_052.5s_sonrisa-ladeada-for-me.jpg)
- **Ojos:** Abiertos, pero la ceja presiona y tapa 15–20% superior del iris. Iris centrado, mirando a cámara desde abajo. Ojos algo más pequeños (altura 5–6 px). Brillo de 1 px.
- **Cejas:** Gruesas (2 px), -20° a -25°, con el extremo interno casi tocando el párpado. Simétricas o la izquierda 1 px más baja.
- **Boca:** Smirk cerrado de 8 px que sube hacia la derecha (comisura derecha 2 px arriba).
- **Mejillas:** Sin sonrojo (en 935190 @31.5 hay tinte rosa por la luz).
- **Cabeza/mirada:** Cabeza baja 10–15° e inclinada ~10°, en primer plano. Mira hacia arriba, a cámara.
- **Historia:** Reclama o bromea: "Me.", "Danny.", "I used to…". Frase de "te toca a ti".
- **Adaptación:** Ideal para cuando ella pone una condición al pretendiente. Con el corsé, brazos cruzados bajo el pecho (sin tapar la cara).
- **Celda (ojos+cejas):**
```
........................
..####............####..
.....####......####.....
..######........######..
.#wwooow#......#wwooow#.
.#woooow#......#woooow#.
..#oooo#........#oooo#..
....##............##....
...#..#..........#..#...
```
- **Celda (boca, filas 15+) (M2):**
```
........................
..............##........
..........####..........
........##..............
```

## 7. Boca abierta feliz / provocación / Open-mouth happy tease
- **Apariciones:** 909462 @34.5 · 648662 @21.5, @74.5 · 411222 @23.5, @24.5 · 806870 @9.5 · 935190 @9.5, @62.5 (con sonrojo) · 129430 @15.5, @38.5 · 040982 @60.5
- **Imagen:** [648662_021.5s](female_faces/648662_021.5s_sonrisa-satisfecha-picara.jpg)
- **Ojos:** Abiertos al 90–100%. Iris centro/arriba, con brillo. En 909462 @34.5 los ojos se ven más pequeños (~95%).
- **Cejas:** Neutras o arqueadas, con el interior +5° a -8°. Suben 1 px con la apertura de boca; la derecha ligeramente más alta.
- **Boca:** Óvalo o "D" abierto de 6–8 px × 4–5 px, con contorno negro, interior rojo `#B3243F` y lengua rosa `#F07890` en la mitad inferior. Sin dientes y comisuras arriba. Variante "habla": 4×3 px (411222 @23.5).
- **Mejillas:** Sin sonrojo, salvo la variante de 935190 @62.5 (3 trazos "///").
- **Cabeza/mirada:** Inclinación 10–25°, a veces echada atrás (648662 @74.5, 129430 @15.5). Mira arriba, hacia cámara. Los hombros suben.
- **Historia:** Exclamación o remate juguetón: "Four-B.", "Danny.", "…is that so.", "Usually." La nota alegre entre coqueteos tensos.
- **Adaptación:** La camarera abre la boca al anunciar el pedido o al dar una pista. Alternar con la boca cerrada para simular hablar.
- **Celda (ojos+cejas):**
```
..###............###....
.....###........#...#...
........................
..######........######..
.#wwooow#......#wwooow#.
.#woooow#......#woooow#.
..#oooo#........#oooo#..
....##............##....
...#..#..........#..#...
```
- **Celda (boca, filas 15+):**
```
........................
........########........
........#mmmmmm#........
.........#mttm#.........
..........####..........
```
- **Variante con sonrojo (935190 @62.5):**
```
..r.r.r...........r.r.r.
.r.r.r..########.r.r.r..
........#mmmmmm#........
.........#mttm#.........
..........####..........
```

## 8. Sorpresa / regaño / Gasp-scold
- **Apariciones:** 909462 @55.5
- **Imagen:** [909462_055.5s](female_faces/909462_055.5s_mirada-knock-first.jpg)
- **Ojos:** Muy abiertos, con el párpado superior subido (iris completo y 1 px de blanco arriba). Iris centrado, mirada fija a cámara. Pestañas arriba.
- **Cejas:** Elevadas en arco, a 7–8 px sobre el ojo.
- **Boca:** Trapecio vertical abierto, 6×6 px, interior rojo, lengua rosa, contorno grueso.
- **Mejillas:** Sin sonrojo.
- **Cabeza/mirada:** Frontal, la cara ocupa todo el encuadre y avanza hacia cámara.
- **Historia:** Aparece una sola vez, en "Knock first…". Es regaño cómico por entrar sin avisar.
- **Adaptación:** Cuando el pretendiente entra a la cocina o al almacén sin llamar.
- **Celda (ojos+cejas):**
```
...####..........####...
..#....#........#....#..
........................
..######........######..
.#wwwwww#......#wwwwww#.
.#woooow#......#woooow#.
.#woooow#......#woooow#.
..#wwww#........#wwww#..
...####..........####...
```
- **Celda (boca, filas 15+):**
```
........................
..........####..........
.........#mmmm#.........
.........#mmmm#.........
.........#mttm#.........
..........####..........
```

## 9. Sonrojo tímido / Blushing shy smile
- **Apariciones:** 648662 @23.5, @24.5, @30.5 · 935190 @60.5 · 040982 @54.5, @56.5 · 129430 @46.5, @49.5, @50.5, @57.5
- **Imagen:** [040982_056.5s](female_faces/040982_056.5s_sonrojo-sonrisa-color.jpg)
- **Ojos:** Abiertos al 90–100%, con iris lateral o hacia abajo (de reojo). En 648662 @24.5 la cabeza baja y el flequillo sombrea ~30% del ojo. Brillo presente.
- **Cejas:** Inclinadas hacia dentro, -10° a -15° (aire tímido). Quedan tapadas por el flequillo si la cabeza baja.
- **Boca:** Sonrisa cerrada pequeña de 6–8 px. Si habla, boca abierta de 4×3 px (648662 @23.5).
- **Mejillas:** Sonrojo rosa `#E8788C`: 3 trazos diagonales en 2 filas (~6×2 px) bajo cada ojo, a ~2 px de la comisura externa. En 935190 @60.5 se ve más difuso y pálido.
- **Cabeza/mirada:** Inclinación 15–30°. Mira de reojo o sobre el hombro, con la barbilla algo baja. El torso gira a medias.
- **Historia:** El "me gustas" dicho bajito: "I like seeing color.", "Hero.", "You can breathe.", "Love it!".
- **Adaptación:** El sonrojo puede extenderse a un parche rosa en la zona del escote o cuello. Con el corsé, hombros ligeramente hacia dentro.
- **Celda (ojos+cejas):**
```
..###..............###..
.....###........###.....
........................
..######........######..
.#wwwooo#......#wwwooo#.
.#wwoooo#......#wwoooo#.
..#wooo#........#wooo#..
....##............##....
...#..#..........#..#...
```
- **Celda (boca+sonrojo, filas 15+):**
```
..r.r.r...........r.r.r.
.r.r.r..#......#.r.r.r..
.........######.........
```

## 10. Ojos cerrados ^^ con sonrojo / Sweet closed eyes
- **Apariciones:** 909462 @49.5, @53.5 · 411222 @42.5, @43.5
- **Imagen:** [411222_042.5s](female_faces/411222_042.5s_ojos-cerrados-sonrojo.jpg)
- **Ojos:** Arcos ∩ de ~8 px de ancho y 1 px de grosor, negros, sin iris ni pestañas visibles ni párpado inferior.
- **Cejas:** No se ven, las tapa el flequillo. Si la camarera no tiene flequillo hay que dibujarlas (B1).
- **Boca:** Sonrisa dulce y ancha, U de 8–9 px con comisuras 1–2 px arriba, cerrada.
- **Mejillas:** Sonrojo "///" en las dos mejillas, color `#E8788C`.
- **Cabeza/mirada:** Inclinación 10–15° y barbilla algo abajo. Mira hacia abajo o a un lado. Hombros relajados.
- **Historia:** Ternura tras un coqueteo. "I noticed." (ella sabía que él miraba), "Cold. Freezing." (broma).
- **Adaptación:** Cierre de escena o pausa romántica. Funciona bien con un plano más cercano.
- **Celda (ojos+cejas):**
```
........................
........................
........................
........................
...####..........####...
..#....#........#....#..
.#......#......#......#.
........................
........................
```
- **Celda (boca+sonrojo, filas 15+):**
```
..r.r.r...........r.r.r.
.r.r.r..#......#.r.r.r..
.........#....#.........
..........####..........
```

## 11. Risa abierta con ojos cerrados / Laugh
- **Apariciones:** 411222 @55.5 · 935190 @82.5 · 040982 @44.5
- **Imagen:** [040982_044.5s](female_faces/040982_044.5s_risa-sonrojada-ojos-cerrados.jpg)
- **Ojos:** Arcos ∩ como en la expresión 10, pero un poco más curvos y subidos hacia la mejilla (apretados por la risa). En 935190 @82.5 la cabeza baja y se ven más pequeños.
- **Cejas:** No se ven (flequillo).
- **Boca:** Abierta y ancha, 8 px, con contorno negro, interior rojo y lengua rosa (M8).
- **Mejillas:** Sonrojo "///" en ambas mejillas.
- **Cabeza/mirada:** Inclinación 10–20°, echada atrás o hacia abajo (risita). El cuerpo se encoge de hombros.
- **Historia:** Risa pícara tras una insinuación o broma interna ("It's…").
- **Adaptación:** Remate de gag al final del short.
- **Celda (ojos+cejas):**
```
........................
........................
........................
...####..........####...
..#....#........#....#..
.#......#......#......#.
........................
........................
........................
```
- **Celda (boca+sonrojo, filas 15+):**
```
..r.r.r...........r.r.r.
.r.r.r..########.r.r.r..
........#mmmmmm#........
........#mttttm#........
.........######.........
```

---

## Descartados
- **935190 @75.5:** perfil con la cara tapada por el pelo.
- **129430 @47.5:** perfil oscuro, cara tapada.
- **040982 @15.5:** cara desenfocada. Solo sirve como referencia del gag (mano ofreciendo un calcetín con forma de corazón).
- **806870 @51.5:** cara pequeña en plano medio. Se cuenta en la expresión 4 pero no se usa como imagen.

## Tabla resumen

Piezas de la tabla: ojos E1–E7, cejas B0–B6, bocas M1–M9, overlay R (sonrojo).

| Expresión | Prioridad | Combinación reutilizable |
|---|---|---|
| 1 Sonrisa suave | A | E1 + B1 + M1 |
| 2 Reojo / sobre el hombro | A | E2 + B3 + M1 (o M2) |
| 3 Cabeza ladeada | A | E3 + B1 + M7 |
| 4 Pícara, párpados medios | A | E4 + B3 + M3 |
| 5 Seductora | A | E5 + B6 + M4 (o M9) |
| 6 Desafío | B | E1 + B4 + M2 |
| 7 Boca abierta feliz | B | E1 + B3 + M5 (+R) |
| 8 Sorpresa / regaño | C | E7 + B5 + M6 |
| 9 Sonrojo tímido | A | E2 + B1 + M1 + R |
| 10 Ojos cerrados ^^ | A | E6 + B0 + M7 + R |
| 11 Risa | B | E6 (subido 1 fila) + B0 + M8 + R |

## Set mínimo de celdas
- **Ojos (7):**
  - E1 abierto
  - E2 iris lateral (el espejo es gratis)
  - E3 iris arriba
  - E4 párpado medio
  - E5 párpado pesado
  - E6 cerrado ^^
  - E7 muy abierto
- **Cejas (5 dibujadas + B0 vacío):** B1 suave, B3 asimétrica, B4 fruncida, B5 elevada, B6 plana alta.
- **Bocas (9):**
  - M1 sonrisa mínima
  - M2 ladeada
  - M3 "ω"
  - M4 plana con gancho
  - M5 abierta D
  - M6 vertical
  - M7 sonrisa ancha
  - M8 risa
  - M9 "ah" pequeña
- **Overlay R (1):** sonrojo "///".
- **Total: 22 piezas** si se dibuja por capas, que cubren las 11 expresiones y cientos de combinaciones.
- **Set mínimo viable (sin la sorpresa, expresión 8):** 6 ojos (E1–E6) + 4 cejas (B1, B3, B4, B6) + 6 bocas (M1, M2, M3, M5, M7, M8) + R = **17 piezas** para 10 de las 11 expresiones.
- **Si se dibujan caras completas** (sin capas): 11 celdas, más 2 variantes (expresión 5 "Sure." y expresión 7 con sonrojo) = **13 celdas**.
````
