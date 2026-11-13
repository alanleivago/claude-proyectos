---
type: doc
status: active
tags: [zawpolyshorts, zawdog, camera, encuadre, framing, set-scale, blender, doggo-poly-shorts]
relatedTo: [styles/zawdog/STYLE.md, fuentes/zawpolyshorts-style/planos/PLANOS.md, fuentes/zawpolyshorts-style/escenarios.md, pieces/zaw-dog-05/build.py, pieces/zaw-dog-07/shots.py]
---
# Encuadre y escala de set: Zaw vs Doggo Poly Shorts (medido 2026-11-13)

**Pedido del usuario:** en los videos de Zaw los sets se sienten más grandes respecto de los personajes y los planos están casi siempre cerca del gato y de la gente. Los nuestros son más abiertos. Hay que medirlo y llevarlo a reglas.

## Cómo se midió

- **Muestra:** 14 shorts de @zawpolyshorts (los más vistos más los últimos; listado público con yt-dlp) = 187 planos reales. Contra eso, nuestro #6 final (22 planos), el preview v1 del #7 (14) y el board v2 del #7 (14).
- **Cortes reales, no un fotograma cada 2 s** (ese era el error de `PLANOS.md`): cada fotograma a 144x256, corte = pico de diferencia de píxeles más histograma HSV. Se revisó a ojo en dos videos (`zaw_jf-T…`, `zaw_WBYK…`).
- **Por plano:** primer, medio y último fotograma.
  - **Píxeles:** movimiento de cámara entre el primero y el último (ORB + afín parcial: zoom, paneo, giro; los subtítulos enmascarados) y flujo óptico medio.
  - **API** (`claude-sonnet-5-5`): tamaño, caja del animal y del humano (fracción del cuadro), altura y pitch de cámara, FOV, cuánto set se ve, altura de muebles respecto del animal, primer plano y movimiento.
- **Scripts y datos:**
  - `medir_encuadre.py` (medición) y `resumen_encuadre.py` (totales) → `encuadre_stats.json`;
  - por video: `medidas/<tag>.json`;
  - hojas de contacto: `hojas_encuadre.py` → `hojas/`.
- **Calibración de la API con nuestra verdad de Blender** (sabemos lente y posiciones):
  - la API sobreestima el FOV ×1.35 (dice 65-70° donde el real es 49°) y las distancias ~×2;
  - las cajas en fracción de cuadro y las comparaciones relativas (Zaw vs nosotros) sí sirven;
  - las reglas en metros salen de la geometría de Blender, no de los metros de la API.

## Zaw vs nosotros

Cifras de la API salvo donde dice *píxeles*. Formato: mediana (p25-p75).

| Medida | Zaw (14 shorts, 187 planos) | #6 final (22) | #7 v1 preview (14) | #7 v2 board (14) |
|---|---|---|---|---|
| Duración de plano (s, *píxeles*) | 1.28 (0.90-1.68), media 1.37 | 1.52 (0.98-1.83), media 1.43 | 1.17 (1.07-1.23) | 1.17 (1.07-1.23) |
| Sujeto principal: animal / ambos / humano / objeto | 65 / 16 / 9 / 11 % | 36 / 32 / 23 / 9 % | 29 / 36 / 29 / 7 % | 50 / 7 / 36 / 7 % |
| Tamaños MS / MFS / FS+WS / insertos | 28 / 47 / 11 / 9 % | 18 / 41 / 23 / 9 % | 14 / 50 / 14 / 7 % | 36 / 36 / 7 / 7 % (+ MCU 14 %) |
| Animal: alto visible / alto del cuadro | 0.43 (0.33-0.54) | 0.38 (0.30-0.51) | 0.48 (0.43-0.52) | 0.40 (0.32-0.54) |
| Animal cortado por el cuadro | 59 % | 50 % | 56 % | 25 % |
| Humano visible en el plano | 25 % | 59 % | 79 % | 57 % |
| Humano: alto visible / alto del cuadro | 0.72 (0.56-0.89) | 0.58 (0.50-0.62) | 0.47 (0.45-0.70) | 0.82 (0.57-0.85) |
| Humano entero, sin cortar | 26 % | 77 % | 73 % | 13 % |
| Cabeza del humano: y del borde superior | 0.20 | 0.25 | 0.18 | 0.17 |
| Cámara, planos de animal (m, API) | 0.45 (0.30-0.95) para un gato | 0.40 | 0.48 | 0.80 (real 0.75-0.82) |
| Pitch (°) | −5 (−15…0), media −12 | 0 (−3…0) | −4 (−7…0) | −3 (−14…0), media −11 |
| Contrapicados (pitch ≥ +8°) | 2.7 % | 4.5 % | 0 % | 0 % |
| Se ve el cuarto entero | 49 % | 86 % | 71 % | 64 % |
| Objeto en primer plano / su distancia (API) | 60 % / 0.5 m | 64 % / 0.8 m | 43 % / 0.8 m | 64 % / 1.0 m |
| Mueble / animal: sillón | 1.2 | 0.5 | 0.6 | 0.25 (API, sillón casi fuera de cuadro; real 1.03) |
| Mueble / animal: silla · mesa · puerta · ventana | 1.4 · 1.0 · 3.5 · 2.0 | 1.5 · – · 1.0 · 1.2 | 0.6 · – · – · 3.0 | – · – · 1.1 (real 3.2) · 0.4 |
| Zoom de cámara (\|log\|/s, *píxeles*) | 0.10 (0.03-0.18) | 0.17 (0.10-0.23) | 0.10 (0.06-0.15) | 0.10 (0.04-0.17) |
| Paneo (anchos de cuadro/s, *píxeles*) | 0.14 (0.09-0.22) | 0.23 (0.10-0.36) | 0.21 (0.15-0.31) | 0.21 (0.12-0.31) |
| Planos realmente quietos (*píxeles*) | 5 % | 0 % | 0 % | 0 % |

### Verdad de Blender: #7 v1 contra v2 (`pieces/zaw-dog-07/review/framing_truth*.json`, fotograma del board)

Altura proyectada del perro y de la gente sobre el cuadro, con la cámara real (sin la API).

| | #7 v1 | #7 v2 |
|---|---|---|
| Lente | 22 mm (21-33) | 25 mm (25-30) |
| Planos de perro: cámara / pitch | 0.47-0.50 m, −8…+2° | 0.75-0.81 m, −14…−23° |
| Planos de perro: distancia a la cabeza | 0.8-2.2 m | 0.66-1.6 m |
| Planos de perro: alto del perro | 0.33-0.59, mediana 0.45 | 0.32-0.62, mediana 0.51 |
| Planos de gente: distancia a la cabeza | 1.4-2.7 m (de dos), 0.66-0.71 m (caras) | 0.64-0.92 m (y 2.0 m en la puerta) |
| Gente: alto en el cuadro | 0.38-0.55 entera, en 7 planos | 0.79-1.0 cortada; entera solo en la puerta (0.63) |
| Sillón / perro sentado (0.87 m) | 0.77 | 1.03 |
| Puerta / perro | 2.4× | 3.2× (Zaw 3.5× su gato) |

Los valores de la API sobre el v2 que siguen lejos de Zaw son ruido de medición o límites de la historia: el "cuarto entero" (64 %) cuenta el pasillo y la puerta abierta; el primer plano a 1.0 m es la estimación inflada de la API (en Blender, cuencos a 0.6-0.9 m y la cadera del dueño a 0.35 m).

### Qué dicen los números

1. **El perro ya ocupaba lo mismo del cuadro que el gato de Zaw (0.38-0.48 contra 0.43).** La sensación de "abierto" no venía del perro.
2. **La diferencia está en la gente:**
   - Zaw muestra humanos en el 25 % de los planos, casi siempre cortados (rodilla, cintura, una mano o las piernas junto al gato): 0.72 del cuadro, cabeza a 0.20 del borde;
   - nosotros los mostrábamos en el 59-79 % de los planos, de cuerpo entero el 73-77 % de las veces y más chicos (0.47-0.58).
   - Además armábamos planos de dos (perro + humano entero, 32-36 %), que obligan a abrir.
3. **Se veía demasiado cuarto:** el 71-86 % de nuestros planos mostraba la habitación entera (Zaw 49 %), a veces con techo. Zaw deja detrás del sujeto una pared o un rincón en el 42 % de los planos.
4. **Escala de set:**
   - el sillón de Zaw mide 1.2× su gato y la puerta 3.5×; nuestro sillón medía 0.5-0.6× el perro;
   - el gato de Zaw (0.32 m sentado) vive en muebles de tamaño real; nuestro perro mide 0.87 m sentado (Blender) y, con muebles reales, el respaldo del sillón (0.67 m) le queda por debajo del pecho;
   - igualar la proporción del gato pediría ×2.2, y la gente parecería de juguete al lado de las puertas;
   - **se adopta ×1.35** (sillón 0.90 m, puerta 2.77 m, techo 3.5 m) y el resto se gana con cámara: baja, cerca, el set saliéndose del cuadro y objetos en primer plano.
5. **Cámara:**
   - Zaw mira apenas hacia abajo (mediana −5°, un cuarto de los planos a −15° o menos) desde una altura de ~2× el ojo del gato;
   - nosotros íbamos horizontales (0°) y a 0.5 m, por debajo del ojo del perro (0.68 m), con la cabeza del perro sentado inclinada hacia arriba: por eso el revisor contaba contrapicados en 01a y 06a.
6. **Lente:** Zaw usa un FOV algo más cerrado. Con la corrección ×1.35, unos 44° horizontales, o sea ~25 mm con nuestro sensor vertical de 36 mm; usábamos 22 mm.
7. **Movimiento:**
   - Zaw "parece" quieto en la mitad de los planos (API), pero por píxeles solo el 5 % lo está: hay deriva lenta;
   - el #6 se mueve ~1.6× más (zoom 0.17/s, paneo 0.23/s), que es lo que el usuario aprobó (regla del 2026-11-09). Se mantiene.
8. **Ritmo:** Zaw corta cada 1.37 s de media (mediana 1.28). El #7 (1.16 s) ya está en el rango pedido (1-1.4 s).

## Reglas de Blender (kit zawdog, desde el #7)

Geometría: sensor vertical de 36 mm, por lo que **alto del cuadro = distancia × 36 / lente**. Con 25 mm, el cuadro mide 1.44 × la distancia. Para que un sujeto de altura h ocupe la fracción f del cuadro: **d = h × lente / (36 × f)**.

Medidas reales del kit (Blender):
- perro: sentado 0.87 m (cabeza 0.72 m, ojos ~0.68 m); parado 0.85 m hasta las orejas, 1.06 m de largo;
- humanos: 1.78-1.81 m.

| Plano | Fracción objetivo | Distancia (25 mm) | Altura de cámara | Pitch | % de planos |
|---|---|---|---|---|---|
| Perro MFS (entero, algo cortado) | 0.40-0.55 | 1.1-1.5 m | 0.75-0.85 m | −5…−15° | ~45 % |
| Perro MS (cabeza + pecho) | 0.55-0.65 visible | 0.65-0.8 m | 0.75-0.85 m | −5…−15° | ~25 % |
| Perro CU (cabeza) | 0.6-0.8 | 0.3-0.4 m | al ojo, 0.68 m | 0° | ≤ 5 % |
| Humano de cintura arriba | 0.75-0.85 (cabeza a 0.2) | 0.65-0.8 m | 1.2-1.4 m | 0…−5° | ≤ 20 % |
| Humano de rodilla arriba | 0.8-0.9 | 1.0-1.2 m | 1.0-1.3 m | 0…−8° | |
| Humano parcial (brazo, mano o piernas) junto al perro | – | el humano a 0.3-0.9 m de la lente | 0.9-1.3 m (cadera u hombro) | −15…−30° | ~15-25 % |
| Inserto cenital (cuencos, objetos) | objeto 0.3-0.5 | 1.0-1.2 m | – | −90° | ~10 % |
| Ubicación / puerta (humano entero) | 0.6-0.7 | 1.9-2.3 m | 1.2 m | 0° | ≤ 1 por video |

- **Lente:** 25 mm. 22 mm solo en whips e insertos; 28-30 mm solo en caras.
- **Escala de set:** `scale_set(1.35)` (`pieces/zaw-dog-05/build.py`), llamado desde el script de planos después de su decorado y antes de cargar a los humanos del kit.
  - Muebles, arquitectura, calle y parque van ×1.35. El perro, la gente, los cuencos y props del perro, los textos 3D, las sombras de contacto, la correa y la cámara no se escalan.
  - Las coordenadas del set pasan a mundo con `sw((x, y))`. Los objetos del set conservan su `.location` en unidades de set: mover el sofá con coordenadas de set sigue funcionando.
  - **Default apagado:** el #5 y el #6 no lo llaman y se renderizan igual que antes.
- **Primer plano:** un objeto a 0.35-0.7 m de la lente en ~60 % de los planos (cuenco, pata del sillón, pierna del dueño, marco de puerta).
- **Fondo:** pared o rincón detrás del sujeto en ≥ 45 % de los planos; cuarto entero en ≤ 50 %; nunca techo en planos de perro.
- **Sentado:** después de `sit_grounded`, bajar el cuello ~0.3 rad (en #7, `nod(dd, 0.3)`).
- **Contrapicados:** máximo 1 por video. Cenital solo en insertos.
- **Movimiento:** como el #6. Todo plano se mueve: push 10-25 % del encuadre por plano, órbita de 6-16°, grúa; whips y snaps como acentos.
- **Duración:** 1.0-1.4 s por plano.

## Hojas de contacto

- `hojas/hoja1_animal.jpg`: planos de animal, Zaw arriba y nosotros (#6, #7 v1) abajo, con la caja visible y la fracción. Mismo tamaño de perro que de gato, pero nuestro fondo es el cuarto entero y la cámara va horizontal.
- `hojas/hoja2_humanos.jpg`: planos con gente. Zaw corta a la gente (brazo, torso, piernas junto al gato); nosotros la mostrábamos entera y chica.
- `hojas/hoja3_escala.jpg`: muebles junto al animal. Sillón, sillas y puertas de Zaw dominan al gato; los nuestros quedan por debajo del perro.
- `hojas/hoja4_v2_animal.jpg` y `hojas/hoja5_v2_humanos.jpg`: Zaw contra el preview v2 del #7 con las reglas nuevas.

## Pendiente / límites

- La API estima metros con sesgo (ver calibración). Las cajas son aproximadas, ±0.05 del cuadro.
- 14 de 22 shorts (uno falló al bajar). Las proporciones son estables entre videos: la mediana del alto del animal por video va de 0.31 a 0.63.
- La escala ×1.35 es un compromiso. Si el usuario quiere más, la alternativa es achicar el perro (×0.8) en vez de agrandar más el set; no está implementado.
