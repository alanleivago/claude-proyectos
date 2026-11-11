# Análisis técnico de la PARTE A (estilo Ricks Clips) y plan de reproducción en three.js

**Nota de método.** Medí sobre fotogramas de 360×640 cada 0,5 s. Los tiempos de corte tienen ±0,25 s. Los porcentajes de tamaño son aproximados, con ±3 puntos. El movimiento de cámara lo infiero comparando pares de fotogramas. El cursor del mouse abajo y el borde dentado a la derecha de 49,5 s en adelante son artefactos del visor de DaVinci, no hay que reproducirlos.

---

## 1. Lista de planos

| t inicio | Tipo | Qué se ve | Cámara | Lugar |
|---|---|---|---|---|
| 0.0 | MCU (cabeza ≈25 % del alto) | Protagonista sonriendo frente a una pared de container gris con franja roja | Casi estático, leve push | Muelle/containers |
| 0.5 | WS (cabezas ≈4 %) | 3 estibadores con carga, torre de grúa a la izquierda, cartel "$5.8x PER TON" a la derecha, resplandor rosa al fondo | Dolly-in lentísimo (el cartel se desplaza ≈7 px en 0,5 s) | Muelle con niebla |
| 1.5 | MCU (≈27 %) | Boina verde con carga en forma de "salchicha", gorra gris con barril a la derecha, caja de madera desenfocada en primer plano | Push-in ≈ +25 % en 1 s | Muelle |
| 3.0 | Inserto de ambiente | Farola con bombilla y jaula de sacos de arena (se ve la malla wireframe), gorra gris pequeño abajo a la izquierda | Dolly/tilt muy lento (≈3 %) | Muelle |
| 4.5 | CU (≈36 %) | Boina verde con roll de ≈ −4°, esfuerzo con dientes apretados | Push-in rápido (+20 % en 0,5 s) | Muelle |
| 5.5 | CU (≈36 %) | Gorra gris con barril "R…", bigote, dientes apretados | Estático con micro-push | Muelle |
| 6.0 | CU (≈42 %) | Boina marrón con caja "FRAGILE" | Push-in (+10 % en 0,5 s) | Muelle |
| 7.0 | MS (cabeza ≈17 %) | Señor de galera negra con ala dorada y bigote | Push-in lento | Oficina oscura |
| 8.0 | MS, two-shot | Galera a la izquierda y bombín con anteojos redondos (traje violeta) a la derecha, riendo | Casi estático | Oficina |
| 9.0 | MCU (≈28 %) | Protagonista frente a un camión rojo ("UC… N.C.") | Push-in + drift lateral | Playa de camiones |
| 11.0 | MCU (≈30 %) | Protagonista con portapapeles "BILL OF SALE – TRUCKING CO." | Leve órbita (parallax del fondo) | Playa de camiones |
| 12.5 | MS, sujeto en el tercio derecho | Mira hacia abajo, neumáticos y barriles desenfocados a la izquierda | Estático con drift | Playa de camiones |
| 14.0 | Inserto | Edificio con 3 ventanas naranjas emisivas, silueta borrosa de una gorra en primer plano | Pan lento + rack focus | "Newark" |
| 15.0 | MCU | Jefe con bombín marrón, bigote y traje de rayas, cigarro en la mano, secuaz gruñendo a la izquierda | Push-in | Muelle |
| 16.5 | CU (≈40 %) | Fotógrafo con canotier y cámara | Estático | Fondo gris |
| 17.0 | MCU | Jefe gritando | Push-in | Muelle |
| 18.5 | MCU | Bombín con anteojos y taza, el borde de la galera asoma a la izquierda | Estático | Oficina |
| 19.5 | MS, two-shot | Ríen, taza sobre la mesa | Estático | Oficina |
| 20.0 | MCU | Boina verde, **mismo encuadre que 1.5 (callback)** | Push-in | Muelle |
| 21.0 | MCU | Boina marrón con caja; **una mini boina verde está sobre su hombro** (gag compuesto) | Estático | Muelle |
| 21.5 | Inserto, contrapicado | Container colgando de la grúa | Cámara baja, el container rota | Cielo/niebla |
| 22.0 | MS, ángulo bajo | Boina verde en shock (ojos de globo), container inclinándose y cayendo, estibador pequeño al fondo | Cámara fija, animación del container | Muelle |
| 23.0 | WS/MS (cabeza ≈16 %) | Protagonista socarrón en un pasillo entre containers, fuga de perspectiva | Push-in lento | Containers |
| 24.0 | MWS (cabezas ≈14 %) | 3 trabajadores riendo en fila, tablones de madera | Push-in leve | Muelle |
| 25.5 | MS → WS | Protagonista socarrón con media cabeza oscura, polvo, rojo desenfocado en primer plano, camión al fondo | Estático, ligero pull-back | Playa amarillenta |
| 28.0 | Inserto POV | Estructura naranja, plataforma amarilla baja un container blanco sobre un camión rojo | Dolly con blur fuerte | Playa |
| 28.5 | MS, two-shot | Los dos serios, encogen los hombros | Estático | Oficina |
| 29.5 | MCU (≈25 %) | Galera, "cute trick" | Push-in suave hasta 30.5 | Oficina |
| 31.0 | MCU | Bombín con caja de metal en miniatura, lámpara verde de banquero | Estático | Oficina |
| 32.5 | MCU, two-shot | Boina verde + gorra gris, cartel verde arriba a la derecha | Push-in lento (hasta 34.0) | Muelle |
| 34.5 | CU | Boina verde levanta la mano, boca abierta con lengua | Push-in | Muelle |
| 36.0 | MCU | Gorra gris frente al cartel "LOADING BY HAND $5.83 PER TON", los otros desenfocados detrás | Push-in; a 37.0 dolly-back | Muelle |
| 38.5 | MCU | Protagonista con cartel "BY THE BOX 16¢ PER TON" y moneda dorada | Push-in | Playa |
| 39.5 | MS, two-shot | Sorprendidos | Estático | Oficina |
| 40.5 | MCU | Hombre con vincha y delantal verde agua, con un tenedor | Estático, push desde 41.5 | Interior verde agua/beige |
| 42.0 | MS | El mismo frente a una casa, cajas "FRAGILE KITCHEN", planta | Pan lento a la derecha | Porche, noche |
| 43.5 | ECU | Media cabeza | Push | Casa |
| 44.0 | MCU | Con caja "BOOKS KITCHEN"; a 44.5 con un sándwich | Estático/push | Pared de bloques |
| 46.0 | Inserto | Textura de cartón a pantalla completa (transición) | — | — |
| 46.5 | WS, contrapicado | Paredes de containers de colores | Tilt/pan lento | Puerto |
| 47.0 | WS | Pilas de containers bajo cielo violeta | Pan | Puerto |
| 47.5 | WS | Pila enorme de containers, cubierta de barco oscura en primer plano | Pan | Puerto |
| 48.0 | WS → MS (cabeza ≈17 %) | Protagonista frente al casco del barco, atardecer rosa-violeta, borde de muelle amarillo | Push | Muelle al atardecer |
| 49.0 → 52.5+ | CU (≈42 %, ancho ≈75 % del cuadro) | Protagonista sonriendo, **plano fijo más de 3 s sin subtítulo** | Estático | Fondo ship/sunset |

---

## 2. Personajes

**Construcción (medida)**
- **Cabeza:** esfera 3D con sombreado suave (no toon con bandas). Tiene un degradé continuo, un highlight especular arriba a la izquierda y una oscuridad cálida en el borde inferior derecho. Se ve "luminosa", casi con bloom propio.
  - Color piel del protagonista: centro ≈ `#f4d7a6`, borde ≈ `#c9915f`.
  - Color de los estibadores: casi blanco, `#f0e8d8`.
  - Color del cocinero: casi `#f4f4f4`.
- **Proporciones** (en unidades de diámetro de cabeza D):
  - Torso en forma de huevo/bean: ancho ≈ 0.8–0.9 D, alto ≈ 0.85–1.0 D.
  - Piernas: ≈ 1.6–1.8 D de largo, separadas ≈ 0.35 D.
  - Altura total ≈ 3.7 D, así que la cabeza es ≈ 27 % del personaje.
- **Cuello:** no hay. La cabeza solapa el torso y el cuello de camisa/corbata/bufanda tapa la unión.
- **Brazos y piernas:** tubos finos de color casi negro, grosor ≈ 7–9 % de D, sin codos ni rodillas, curvos. Terminan en bolitas negras de ≈ 14 % de D como manos. Los pies son casi inexistentes.
- **Orejas:** ninguna.

**Rasgos** (pintados como calcomanía sobre la esfera; al girar la cabeza se deslizan por la esfera)
- **Posiciones medidas** (desde el tope de la cabeza): cejas ≈ 32–35 %, ojos ≈ 50 %, nariz ≈ 56–60 %, boca ≈ 68–72 %.
- **Ojos:** separación centro a centro ≈ 0.25 D. Hay cuatro formas:
  - puntos negros (≈ 5–8 % de D);
  - párpados caídos (dos rayitas horizontales gruesas);
  - arcos cerrados (felicidad);
  - "ojos de globo" blancos con contorno y pupila (shock): disco ≈ 17 % de D, pupila ≈ 6 %.
- **Cejas:** trazo grueso de pincel, ≈ 16 % de D de ancho, ≈ 3 % de grosor. Son muy expresivas: arco, ceño fruncido, caídas.
- **Nariz:** rayita vertical o coma minúscula, o nada.
- **Boca:** línea curva. Con dientes: rectángulo blanco redondeado con rejilla (gritting). Gritando: óvalo oscuro con lengua rosa. Sorpresa: bola marrón.
- **Pelo:** forma plana recortada con borde irregular, "rasgado", con un brillo. El protagonista tiene una muesca de calvicie arriba. En 25.5 media cabeza es oscura, con terminador dentado.

**Ropa y accesorios**
- **Sombreros 3D con brillo especular:** boina verde (disco plano), gorra gris, bombín, galera negra con ala dorada, canotier de paja con cinta negra. Proyectan una **sombra de borde duro** sobre la cara.
- **Texturas pintadas** (no geometría):
  - rayas finas del traje de pinstripe;
  - costuras con trazos discontinuos blancos;
  - botones con contorno (dorados en el violeta y el negro, blancos en el azul);
  - correas/tirantes rojos y hebilla dorada;
  - bufanda roja.
- **Props** (barril, caja, "salchicha"): mismo contorno grueso y sombreado suave.

**Ink y luz**
- **Contorno:** negro-marrón (`#1d0f0d`–`#2b1210`), grosor constante ≈ 3.5–4 % de D en cabeza y cuerpo (6 px en cabeza de 160 px; 9–10 px en cabeza de 270 px). Parece un inverted hull.
- **Luz:** key cálida desde arriba-izquierda/frente, que da el highlight en la cabeza. Rim cálido-rosado desde atrás/derecha en escenas de atardecer. En las oficinas hay sombras duras de ala y ventana. Hay oclusión ambiental en el borde inferior.
- **Cabeza en el cuadro:** CU 36–47 % del alto (60–83 % del ancho). MCU 25–30 %. MS two-shot 16–20 %. WS 4–6 % (solo en establishing). El centro de la cabeza queda en y ≈ 39–47 % del alto.
- **Rotación:** la cabeza gira hasta ≈ ±35° de yaw, con roll ocasional de 3–5°.

**Expresiones (cambian cada 0,5–1 s dentro de un plano)**
- Esfuerzo/trabajo: neutro → ceño → dientes apretados (5.0 → 6.0).
- Shock: ojos de globo.
- Triste: cejas caídas, boca invertida.
- Socarrón: media luna en el ojo, sonrisa de lado.
- Feliz: arcos cerrados.

---

## 3. Escenarios

- **Muelle (niebla):**
  - Piso de tablones de madera con reflejo tenue.
  - Torre de grúa de celosía y farolas enjauladas con bombilla cálida y halo.
  - Una puerta/ventana emisiva rosa-salmón (`#e8a0a0`) al fondo, con bloom.
  - Sacos de arena low-poly con malla visible.
  - Cartel verde oscuro con borde marrón y letras color crema.
  - Extras: 3 estibadores pequeños y las farolas alineadas hacia el fondo.
- **Containers:** chapa gris acanalada con rayas verticales finas y una franja roja. Pilas coloridas (óxido, verde azulado, naranja) con puertas y barras verticales.
- **Oficina:** muy oscura, marrón (`#2b1c12`–`#6a4630`). Ventana con parteluces y brillo cálido, lámpara verde, bokeh circular amarillo-verde arriba. No hay niebla, la oscuridad la da la viñeta.
- **Playa de camiones:**
  - Aire ocre polvoriento (`#a39878`), estructura de grúa naranja, camión rojo con letras.
  - Barriles, neumáticos y partículas de polvo (rayitas blancas de 3–6 px que flotan).
  - Todo con DoF fuerte.
- **Atardecer en el puerto:** cielo degradé violeta (`#2c2850`) → horizonte magenta-rosa (`#c4607a`) → mar. Casco oscuro con escalera de luces, borde de muelle amarillo, bitas.
- **Casa:** porche de madera, revestimiento beige, postigos verdes, farol cálido, planta, cajas de cartón con rotulado negro. Interior: pared verde agua y zócalo beige, ventana quemada en blanco.
- **Profundidad de campo:** el sujeto está nítido, el fondo con blur gaussiano ≈ 2–4 % del ancho, y las luces se convierten en bokeh. Los objetos en primer plano también se desenfocan.
- **Contornos:** los fondos **no tienen contorno**. Solo tienen ink los personajes y los props que ellos sostienen.
- **Detalle:** medio-alto en texturas pero con geometría simple. Con niebla y DoF el fondo se lee como "render 3D suave".

---

## 4. Luz y color

- **Dirección:** key de arriba-izquierda y frente. Rim cálido-rosa desde atrás en los exteriores. Oficinas con luz lateral desde la ventana.
- **Temperatura:** muelle frío-lila (`#8d929b`–`#b9a9ad`) con acentos rosados cálidos. Oficina y casa muy cálidas. Playa ocre.
- **Contraste:** bajo-medio en niebla (negros levantados), alto en oficinas (negros aplastados).
- **Saturación:** general baja. Los personajes son lo más saturado (piel, rojo de bufanda, verde de boina).
- **Viñeta:** fuerte, esquinas 30–40 % más oscuras.
- **Grano:** fino pero visible.
- **Bloom:** alrededor de lámparas, ventanas emisivas y highlights de la cabeza.
- **Paletas:**
  - muelle: `#8b8f99`, acentos `#d98f8f`, boina `#2f5236`, chaqueta azul `#2d4a7a`;
  - oficina: `#2b1c12`, `#6a4630`, luz `#d9ab70`;
  - playa: `#a39878`, rojo `#c0452e`, naranja grúa;
  - atardecer: `#2c2850` → `#c4607a`;
  - casa: `#4f8f84`, `#c9b48a`.

---

## 5. Texto en pantalla

**Subtítulos**
- **Fuente:** sans geométrica ExtraBold/Black en **MAYÚSCULAS**, tipo Montserrat Black o Poppins ExtraBold.
- **Color:** blanco, con contorno negro grueso (≈ 4 px por lado a 640 px de alto) más sombra suave.
- **Tamaño:** cap height ≈ 30–32 px de 640, o sea ≈ 5 % del alto. El font-size es ≈ 6.7 % del alto (≈ 128 px en 1920).
- **Posición:** centrado, línea media en y ≈ 70 % (448/640). Es fija sin importar el plano, por debajo de las caras.
- **Ancho máximo:** ≈ 80 % del ancho.
- **Ritmo:** 1–3 palabras por bloque (promedio ≈ 2), un bloque cada 0,5 s aprox. Mantiene puntuación ("1956,", "HAND.", "OF A…").
- **Números:** "5 83" aparece como dos números sueltos.
- **Color de énfasis:** ninguno.

**Carteles in-world**
- Objetos físicos con perspectiva, en poste, texturizados.
- "LOADING BY HAND / $5.83 / PER TON": tablero verde oscuro, borde fino crema, tipografía serif de estilo antiguo, precio grande.
- "BY THE BOX / 16¢ / PER TON": tablero crema con marco marrón, precio rojo `#a52a1f`, mismo poste. Es el gemelo vis