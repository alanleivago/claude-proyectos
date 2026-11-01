# Especificación del estilo zach3d (Zack D. Films, 3D informativo)

- Refs: 0BZ1C83I2R4 - How Electrical Outlets Work 🤔.mp4, 0Ofvs3j6PaQ - Could You Move Mount Everest To America？.mp4, 0rL-hQRPZf4 - Making A Glass Cup From A Bottle 😮.mp4, 9ZMtioiEMcU - How To Make A Shape Gauge 🤔.mp4, RQ6-QBj-tYE - How Pencil Sharpeners Work 🤔.mp4, cGUU4D4ktic - How Plato’s Alarm Clock Worked 🤔.mp4, xMSyfCh1wWE - How This Robot Melts And Reforms 😮.mp4
- Fecha: 2026-10-29

# Especificación de estilo "Zack D. Films – 3D informativo" para three.js

**Objetivo:** render cuadro a cuadro, 1080×1920 (9:16), 30 fps.

**Convenciones de este documento**

- **[medido R#]**: valor tomado de los informes. R1 = enchufe/hámster, R2 = Everest, R3 = botella/vaso, R4 = plantilla de pajitas, R5 = sacapuntas, R6 = despertador de Platón, R7 = robot de metal líquido.
- **[inferido]**: deducción sin medición directa.
- **[tutorial]**: viene de los videos de Creatorize. Es la interpretación de un tercero, no del canal original.
- **Margen temporal:** los muestreos fueron de 1.5 a 2 fps, así que todo tiempo tiene ±0.25–0.33 s. Los hex se tomaron a ojo sobre JPG comprimidos; ajustalos ±10 % en luminancia.

---

## 1. Resumen del look en 5 líneas

1. Un objeto cotidiano o una idea absurda se explica paso a paso con CGI estilizado y limpio: semi-realista, biselado, saturado y sin grano.
2. La cámara nunca está quieta. Hay un corte cada 0.9–1.5 s, push-ins constantes y whips o "zooms a través" de objetos como pegamento entre planos.
3. El objeto que se nombra se resalta con color emisivo (verde, rojo, cian, amarillo, magenta) y bloom, sincronizado con la palabra. La escena base no hace bloom.
4. Cortes transversales, rayos X, mundos-diorama dentro de objetos y saltos de escala (macro ↔ planeta) hacen visible lo invisible.
5. Narración rápida (150–195 ppm), imperativa o descriptiva, sin intro ni CTA. Subtítulos blancos de 1–4 palabras a ~78 % de H y un remate visual al final.

---

## 2. Render y luz

### 2.1 Renderer y post (valores base)

| Parámetro | Valor | Fuente |
|---|---|---|
| Resolución / fps | 1080×1920 @ 30 fps, `preserveDrawingBuffer: true`, captura PNG por frame | R3, R5, tutorial (salida 1080×1920, 30 fps, H.264) |
| Tone mapping | `ACESFilmicToneMapping`, exposure 1.0–1.1 (AgX es alternativa válida) | R3, R4, R7 |
| Color | `outputColorSpace = SRGBColorSpace` | estándar |
| Sombras | `PCFSoftShadowMap` (o VSM), mapa 2048, `shadow.radius` 4–10 | R4, R6, R7 |
| AO | N8AO / GTAO / SAO. Radio ≈0.3–0.5 u (≈5–10 cm a escala real), intensidad 1.0–2.0 | R1, R4, R5, R6, R7 |
| Bloom | threshold 0.80–0.85, strength 0.7–1.2, radius 0.4–0.6. Solo emisivos con `emissiveIntensity` 3–5 | R1, R3, R4, R6, R7 |
| DOF | Solo en macros y planos "beauty": f/1.4–2.8 equivalente, blur de fondo 20–40 px a 1080 W. En planos generales, casi nulo | R2, R4, R5, R6, R7 |
| Motion blur | Por acumulación de 8–16 subframes (offline). En whips, blur direccional de 80–150 px a 1080 W (≈30–40 % del ancho). En push-ins de transición, blur radial | R2, R4, R5 |
| Grano | 0 | todas |
| Viñeta | Leve, ~15 %. Hasta darkness 0.5 en escenas oscuras (R6) | R1, R6 |
| Saturación | +20–30 % sobre el render neutro | R2, R5 |
| Negros | Nunca puro `#000`. Levantados hacia el azul (~`#141824`), salvo escenas "negras" deliberadas | R2, R5, R7 |
| Sharpen | Opcional y leve. Los halos observados son en parte artefacto de upscale | R5, R6 |
| Aberración cromática | Solo durante whips (R2) y como glitch RGB de ±6 px en el logo final (R7) | R2, R7 |

**Orden de post recomendado:** Render → AO → DOF → Bloom → Motion/radial blur (uniform animado) → Tone mapping → Saturación/contraste (+0.1) → Viñeta → Subtítulos (overlay 2D aparte).

### 2.2 Presets de iluminación

Hay cuatro familias medidas:

| Preset | Key | Fill | Rim | Sombras | Refs |
|---|---|---|---|---|---|
| **A. Estudio high-key cian** (el más común) | Área grande y suave, arriba-izq-frente (≈45° azimut, ≈50° elevación), `#FFF4EA`–`#FFF6EC` | El entorno cian rebota y tiñe las sombras de azul (`#9FD8EA` al 20–30 %). Ratio luz:sombra ≈2:1. `HemisphereLight` cielo `#CFE8F0` / suelo `#8A8F90` | Sin rim dedicado; lo dan el reflejo del entorno o el borde del vidrio | Suaves, penumbra amplia, sombra de contacto muy marcada | R3, R4, R5 ext., R7 |
| **B. Exterior "postal"** | Sol direccional `#FFF4E6`, elevación 50–60°, lateral | Hemisphere cielo `#9EC2FF` / suelo `#2B2F3A`. Sombras azul saturado (`#5F86D8` en la nieve) | Línea de nieve en las crestas como silueta | Duras, penumbra corta | R2 |
| **C. Interior dramático** | Spot cálido `#FFD9A8` cenital-frontal que hace un óvalo en la pared y cae rápido a negro | Muy bajo, frío `#3A4A5A` | Especular blanco en bordes glossy | Suaves en el aparato; semi-duras con sol de mañana `#FFCF8A` a ~35° | R6 |
| **D. Diorama dentro del objeto** | Practicals cálidos `#FFE6A8` con bloom (R1) o spot que hace un hot-spot `#BFE6FF` arriba al centro de la pared (R5) | Ambiente azul muy fuerte (`#2A6FD0`, R5) o teal desde cámara (R1) | Especulares nítidos en metal | Casi sin proyectadas; manda el AO | R1, R5 |

**Valores de arranque en three.js [inferido]** para el preset A (escala física de r155+):
- `DirectionalLight` 2.5–3.0.
- `HemisphereLight` 1.0–1.5.
- `RoomEnvironment` en PMREM con `envMapIntensity` 1.0–1.5 (cromo hasta 1.5).

**Cambio de grade narrativo:** cuando algo "se activa" (energía, frío), toda la escena vira de tono durante 2–3 s. Ejemplos: cálido-verde → azul frío desaturado (pared `#8FB4D6`) en R1, o la botella entera a cian `#5A9CC8` al enfriarse en R3.

---

## 3. Paleta (hex)

### 3.1 Fondos y entornos

| Uso | Hex | Ref |
|---|---|---|
| Degradé estudio cian (arriba → centro/abajo) | `#35CBF2` → `#8FE2F8` | R7 |
| Variante | `#3FC0E4` → `#7FD3EC` | R5 |
| Variante con halo radial (borde → centro) | `#5BA4C4` → `#B8D8E4` | R3 |
| Variante oscura (arriba → abajo) | `#22B9E4` → `#1B5E6E` | R4 |
| Piso que se funde con el fondo | `#4CC2EE` luz / `#2FA6DC` sombra | R7 |
| Haze cian | `#8FE3F7` | R7 |
| Azul "living" saturado | `#2A3F8F`, pared `#5BA8D8` / `#2D5FA6` | R1 |
| Cielo cénit / horizonte | `#3D7ED8` / `#B5D0EE` | R2 |
| Interior azul del diorama | `#1E5FC8` (sombra `#123A85`, hot-spot `#BFE6FF`) | R5 |
| Ladrillo luz / sombra / falloff | `#8A7258` / `#2B241E` / `#141210` | R6 |

### 3.2 Colores semánticos de resaltado (código del canal)

| Significado | Hex principal | Variantes medidas |
|---|---|---|
| **Verde: "esto es lo que se nombra / correcto"** | `#5CFF4F` relleno, `#9CFF8A` borde fresnel | `#4DFF55` (R4), `#8CF08C` (R3), `#3FE03A` (R2) |
| **Verde menta: resalte plano sin glow** | `#6CE8A8` | R7 |
| **Rojo: problema / caliente / se descarta** | `#FF4A5A` | `#FF2A2A` (R3), `#FF4A55` (R6), degradé a `#FF8FA0` (R4) |
| **Azul: frío / contracción** | `#2A55FF` | `#2448F0` (R3) |
| **Cian: rayos X / flujo interno** | `#5AD6FF`–`#7CC8FF`, borde `#9CEFFF`–`#E0F4FF` | R1, R6 |
| **Amarillo: dirección / énfasis** | `#FFE600` (flechas) | outline `#E9F23A` (R7), tinte `#F4EDB0` (R3), lima `#C8E028` (R3) |
| **Naranja: contorno / "no"** | `#FF6A1A`, núcleo `#FFB070` | R4 |
| **Magenta: energía / campo magnético** | `#FF6BE0`, halo `#F062FF`, núcleo `#FFD4FA` | R7 |
| **Rosa: sonido / contadores / calor extremo** | `#FF5A6E` / `#FF8C9C` / `#FF4FA8` | R6, R2, R7 |
| **Electricidad** | núcleo `#FFFFFF`, glow `#6EC0FF` (o `#CFE3FF`) | R1, R2 |
| **Tapa de corte transversal** | `#C4DD38` (lima, casi unlit) | R6 |

### 3.3 Materiales recurrentes

- **Luz key:** `#FFF4EA`.
- **Plástico blanco:** `#F2F2F0`.
- **Madera de mesa:** `#B87A4E` / `#6E3E26`.
- **Cobre:** `#B87345`–`#C2702F`.
- **Bronce/latón:** `#B0823F`.
- **Acero:** `#9A9EA4`–`#B8BEC4`.
- **Cromo:** `#B9BEC8`, brillos `#F5F7FA`.
- **Amarillo de maquinaria:** `#E2B33E`.
- **Piel:** `#E8B9A6` / `#F1A47C` / `#B37D57`.

---

## 4. Materiales y modelado

### Nivel de detalle
Mid-poly estilizado, de "juguete premium" o "miniatura". Los objetos héroe llevan más detalle; el entorno es simple o directamente un degradé.

### Biseles en todo
- Radio de 1–3 % del tamaño del objeto (R1), o 15–20 % del grosor en piezas finas (R7).
- En three.js: `RoundedBoxGeometry` o `ExtrudeGeometry` con `bevelSegments` de 3–4.
- **Excepción:** las caras de corte geológicas de R2 tienen arista viva.

### Tabla PBR

| Material | Parámetros | Ref |
|---|---|---|
| Plástico mate | roughness 0.55–0.7, metalness 0, normal de ruido fino (normalScale ≈0.3) | R2, R4, R7 |
| Plástico satinado / cerámica | roughness 0.35–0.45, clearcoat 0.3–1 | R1, R4, R6 |
| Metal pintado con flake | clearcoat 1 + normal de ruido fino | R5 |
| Acero / metal satinado | metalness 0.9–1, roughness 0.25–0.5 (anisotropía en cepillado) | R1, R2, R5 |
| Bronce oxidado | metalness ~0.8, roughness ~0.5, manchas y chorreaduras | R6 |
| Cromo | metalness 1, roughness 0.12–0.2, `CubeCamera` dinámica si refleja la escena | R7 |
| Vidrio | transmission 1, ior 1.5, roughness 0.03, thickness 0.2. Con reflejos de softbox (`RoomEnvironment` o 2–3 rect lights) | R3 |
| Acrílico de color | transmission ~0.8, color al 15–50 % de opacidad | R5 |
| Agua | transmission 0.9, ior 1.33, color `#1F6B5E`–`#164C45`, fresnel `#3FC4AD` | R6 |

### Texturas
Hay dos variantes y conviene elegir una por video:
- **"Miniatura envejecida":** estuco con normal de ruido, vetas de madera, suciedad en juntas, pintura descascarada, óxido (R1, R5, R6).
- **"Juguete limpio":** bump fino tipo arcilla/azúcar, solo visible en primeros planos (R4, R7).

### Branding diegético (constante en 7/7)
"ZACK D FILMS" o el logo "D" va integrado en objetos: remera, carcasa, caño, jarras embossadas (~1 mm de relieve), pared de la jaula, pantalla. Es textura o normal map, nunca un overlay 2D. Para un canal propio, reemplazalo por tu marca con el mismo criterio.

### Texto funcional
Va como textura legible en el objeto: POWER, N/S, etiquetas de producto (R3, R7).

---

## 5. Entornos y fondos

| Tipo | Descripción | Refs |
|---|---|---|
| **Vacío degradé de estudio** | Sin escenario. Degradé radial con halo más claro detrás del sujeto; el piso se funde con el fondo sin horizonte. Implementación: shader de fondo en pantalla + `fog` exponencial del color del horizonte | R3, R4 (tramo de herramienta), R5 ext., R7 |
| **Set doméstico realista simple** | Baño, living, mesa. Paredes de color plano saturado (teal, azul), poca utilería | R1, R4 |
| **Diorama escondido dentro de un objeto** | Mundo miniatura dentro de una pared o un sacapuntas. Se revela por corte transversal en capas o por un panel transparente | R1, R5 |
| **Paisaje / planeta** | Terreno con ruido ridged, nieve por pendiente, niebla atmosférica ligera, globo con región resaltada | R2 |
| **Cuarto dramático** | Ladrillo con displacement, spot que cae a negro, ventana con cielo plano emisivo | R6 |
| **Abstracto microscópico** | Partículas o geometrías flotando sobre fondo de color con DOF extremo; fondo negro en el tramo electrónico | R7 |

- **[tutorial]** La "global style key" de Creatorize describe un "vacío con degradado azul y piso de cuadrícula tenue que se pierde en la niebla". La cuadrícula **no aparece en ninguna de las 7 refs**: tratala como opcional.
- **Foreshadowing en set:** el elemento del final está visible desde el inicio (el molde de R7 desde [1.75]).

---

## 6. Cámara y encuadres

### Ritmo de planos [medido]

| Ref | Shots / duración | Duración media de shot |
|---|---|---|
| R1 | 17 / 24 s | ~1.4 s (con un tramo continuo largo) |
| R2 | 44 / 59 s | 1.35 s |
| R3 | 26 / 31 s | 1.2 s |
| R4 | 27 / 24.5 s | 0.9 s |
| R5 | 33 / 35 s | 1.05 s |
| R6 | 21 / 30.5 s | ~1.3 s |
| R7 | 21 / 31 s | 1.5 s |

**Rango: 0.9–1.5 s por shot. Máximo de plano sin cambio: ~1.5–2 s.** Los tramos de "cámara viajera" sin corte (R1 [7–19 s], R6) pueden durar 3–6 s, pero cambian de encuadre continuamente.

### Movimientos y velocidades

| Movimiento | Rango medido | Ref |
|---|---|---|
| Push-in lento (el default) | 3–10 % de escala/s | R1, R5, R6, R7 |
| Push-in de énfasis | ~1.3× a 2× de escala por segundo | R3 |
| Pull-back / dolly-out | ~8–15 % de escala/s; hero shot final con ease-out | R3, R4, R7 |
| Órbita / arco | 15–35°/s (arco de 40–60° por plano) | R5, R7 |
| Truck siguiendo un flujo | ~0.3 W/s; 45–50 % W/s en la revelación del corte | R1, R6 |
| Whip | 4–8 frames (0.13–0.25 s), blur 30–40 % W | R2, R4, R5 |
| Zoom-through con ease-in | Arranca lento y termina ~4× más rápido en 1–2 s | R6 |
| Roll / dutch | 5–15° en planos de acción; 0° en planos didácticos | R1, R2, R3 |
| Shake | 1–2 px solo en impactos | R5 |

**Easing**
- Movimientos dentro del plano: `easeInOutSine` o cúbico, sin overshoot.
- Transiciones: aceleración brusca de ~0.2 s y frenado con ease-out exponencial al entrar al plano siguiente.

### Ángulos y alturas
- Se alterna bruscamente entre cortes: picado de 20–60° → contrapicado de 10–45° → frontal.
- La cámara va mucho al ras del piso o del objeto (5–15 cm virtuales) para vender la escala.
- Cenital de 60–90° para mostrar disposición o mapas.

### FOV
- **Default tele corto, 28–40° vertical** (R1, R3, R4).
- 50° en frontales didácticos (R2).
- Gran angular de 90–100° con distorsión barril solo en planos FPV de acción (R2).
- Casi ortográfico (25–30°) en cortes tipo diagrama (R1, R2).

### Implementación
`CatmullRomCurve3` para la posición y otra curva para el target, easing aplicado al parámetro t, roll animado aparte, y un "director" que conmuta escenas según los timestamps de las palabras.

---

## 7. Transiciones

Orden aproximado de frecuencia:

1. **Corte duro:** la mayoría. Cae en el sustantivo nuevo, ~0.3 s antes del onset de la palabra.
2. **Whip pan con motion blur:** cada ~3–4 s en refs rápidas (R4: [3.25], [5.25], [8.75], [9.75], [18.75], [21.25], [23.75]). Lineal y a veces orbital.
3. **Zoom-through / fly-through de un objeto:** la cámara atraviesa un panel, agujero, pantalla o pared (R2, R4, R5, R6, R7). Se resuelve con near plane, ocultando la geometría al cruzarla, o con un frame de blur máximo. Suele ser simétrico: entrada por zoom-through y salida por pull-out (R5).
4. **Zoom blur radial:** en push-ins hacia el plano siguiente y en saltos de escala (R2: suelo → planeta).
5. **Cámara continua siguiendo un flujo** (energía, agua, aire) a través de cadenas causales, sin cortes (R1, R6).
6. **Match cut:** el mismo objeto en la misma posición de pantalla en otro contexto (R1: enchufe → corte; R4: plantilla → mesa).
7. **Wipe con objeto:** algo cruza o tapa la lente (águila en R2, lija en R3, despertador volando en R6).
8. **Disolvencia con blur ~0.3 s:** rara, solo para entrar o salir de un plano abstracto (R7).

**No se usan** crossfades estándar, cortinillas gráficas ni transiciones 2D.

---

## 8. Rayos X, cortes y gráficos

### 8.1 Overlay de resaltado (el recurso central)

| Variante | Look | Entrada / salida | Refs |
|---|---|---|---|
| **Overlay verde aditivo** | Relleno `#5CFF4F` al 45–60 % de alpha, borde fresnel `#9CFF8A`. La textura original se ve debajo | Entra en 0.3–0.6 s (fade, barrido por bloques o fragmentación en cubos). Sale en ~0.5 s | R2 (≈15 usos en 59 s), R4 |
| **Override emisivo de color** | El objeto entero cambia a un color semitransparente emisivo | Fade de 0.15–0.25 s. Pulso de escala 1.0 → 1.05 → 1.0. Hold de ~0.3–0.5 s | R3, R4, R6 |
| **Outline** | 3 px, `#E9F23A`, con tinte leve | Instantáneo con la palabra | R7 |
| **Tinte plano sin glow** | Cambio de color del material (menta) | Fade de ~0.3 s | R7 |

**Shader:** segundo pase o `onBeforeCompile` con uniform `uHighlight` (0→1), `mix(base, color, uHighlight*0.5) + fresnel*color`, `AdditiveBlending`, `depthWrite: false`.

### 8.2 Rayos X cian (holográfico)
- Exterior al 10–40 % de opacidad. Interior visible con shader aditivo: `alpha = pow(1 - dot(N, V), 2.0–2.5)`, color `#5AD6FF`–`#7CC8FF`. Puede sumar líneas de wireframe.
- Entra en ≤0.5 s, dura 1–3 s y sale en ~1 s. También puede pasar a sólido al cortar a un plano general (R1, R6).

### 8.3 Cortes transversales
- **Clipping plane + tapa por stencil** (ejemplo `webgl_clipping_stencil`).
  - Tapa `#C4DD38` lima casi unlit, que contrasta con el objeto oliva (R6).
  - Alternativa: tapa oscura con "manto" de grietas emisivas rojas Voronoi (R2).
- Se quita una cuña de 90–110° o se abre una ventana oval (R6). En R2 son paredes extruidas con reborde blanco.
- **Corte en capas legibles:** pintura ~1 % H, ladrillo ~12 %, piedra ~8 %, madera ~12 % (R1).
- **Corte con mapa de temperatura:** gradiente localizado rojo → azul de ~15 % del largo visible, con deformación del espesor (R3).

### 8.4 Indicadores 3D (siempre en world space, nunca UI 2D)

| Indicador | Look | Animación | Refs |
|---|---|---|---|
| Flechas amarillas extruidas | `#FFE600`, profundidad ≈0.2× ancho, punta ancha | Pop 0 → 1.1 → 1.0 en 0.2 s | R4 |
| Chevrons cian en loop | `#58D2FF`, ~4 % W, separados ~8 % H | Avanzan a ~0.5 H/s en el sentido del flujo | R6 |
| Flechas verdes gruesas | `#8CF28C`, en fila | — | R2 |
| Flechas curvas de rotación | Azul `#4A55E0` | Pop | R3 |
| Arcos eléctricos | Polilínea ramificada, núcleo ~2 px + glow | Se regeneran cada 2–3 frames | R1, R2 |
| Pulso viajero | Estela por `uProgress` en la UV | Recorre el cable | R1 |
| Líneas de campo | `TubeGeometry` fino emisivo magenta (toroides, ondas concéntricas, dipolos) | Crecen en 0.3–0.5 s | R7 |
| Ondas de sonido | Contornos rosas | Escala 0.6 → 1.2, alpha 1 → 0 en ~1 s, ~3 por segundo | R6 |
| Líneas de tensión | 6–10 trazos radiales `#F0D890` | Parpadean 2–3 frames | R3 |
| Contornos glow | Banda extruida de ~2 cm que sigue la forma, naranja | — | R4 |
| Ícono "X" | 3D extruida naranja | — | R4 |
| Contadores 3D | Número en world space (barra de medida con remates en T, número rotado 90°; "1757 years" rosa con glow). Cuenta lineal rápida con separador de miles | ~2 s | R2 |
| Texto de mapa | Extruido blanco apoyado en el terreno ("ALASKA") | — | R2 |

- **Cifras:** van en pantalla, no en la voz (R2).
- **Lo que no se usa en los originales:** etiquetas 2D flotantes, callouts ni íconos planos. **[tutorial]** Creatorize sí muestra etiquetas tipo "FIRING PIN"; es licencia del clon, no del canal.

### 8.5 Partículas y efectos
- Chispas balísticas, aserrín, grafito (30–60 partículas, vida ~0.6 s, R5).
- Vapor y spray en sprites.
- Cubos que caen con gravedad y amortiguación, en `InstancedMesh` sin motor de física (R2).

---

## 9. Subtítulos y texto

**Medidos en R2, R3, R6 y R7.** R1, R4 y R5 no tienen subtítulos quemados (R5 es mudo).

| Parámetro | Valor |
|---|---|
| Fuente | Sans bold. **Discrepancia entre informes:** humanista (Fira Sans / Source Sans / Verdana Bold) en R2–R3 vs. geométrica redondeada (Montserrat / Poppins Bold) en R6–R7. Recomendación: Montserrat Bold o ExtraBold y fijarla para todo el canal |
| Color | `#FFFFFF` |
| Contorno | Negro fino. Medido como ≈0.5 % W (≈5 px a 1080; R2) o "~2 px" (R3). Usá **4–6 px a 1080** + drop shadow suave abajo-derecha (~2–4 px, blur ~4, alpha 0.5) |
| Tamaño | Altura de mayúscula **2.8–3.4 % de H** (54–65 px a 1920) |
| Posición | Centrado horizontal, **línea base a 78–79 % de H** (y ≈ 1500–1515 px a 1920), fija en todo el video |
| Ancho del bloque | 40–70 % de W, siempre **una sola línea** |
| Palabras por bloque | **1–4**, moda 2–3, cortadas en grupos sintácticos ("Carve a" / "massive trench") |
| Caja | Minúscula natural (mayúscula inicial de frase), sin puntuación (R6) |
| Animación | **Ninguna.** Corte seco, sin pop ni resaltado por palabra |
| Duración por bloque | 0.5–1.5 s. Cambia en el onset de la primera palabra del bloque |
| Final | Pueden desaparecer en el último plano de remate (R6) |

- **Implementación:** canvas 2D sobre el frame renderizado (no texto 3D), con tiempos tomados de la transcripción por palabra (Whisper con timestamps por palabra).
- **Texto en el mundo:** solo diegético (etiquetas, logos, pantallas, contadores 3D) o el texto extruido del 8.4.

---

## 10. Humanos y animales

### Humanos
- **Estilo:** semi-realista tipo Daz3D / Character Creator / "videojuego".
- **Proporciones:** reales (~6.5–7.5 cabezas), cabeza u ojos apenas agrandados.
- **Piel:** SSS moderado, algo plástica.
- **Expresiones:** de pose (bostezo, fastidio, horror), poco matizadas.
- **Uncanny leve aceptado:** forma parte del look.

### Manos (el humano más frecuente: 5/7 refs)
- Suelen ser gigantes respecto de la escena y aparecer cortadas por el borde del cuadro.
- Pose algo rígida.
- En primer plano: uñas, nudillos y poros (R3, R7). En planos medios: lisas y estilizadas (R4, R7).
- Pueden ir con guantes con logo (R4).

### Otros humanos
- **Personaje-mascota:** varón con remera "ZACK D FILMS" en el remate (R1, R3).
- **Personajes de época** (R6) o **marionetas colgadas de hilos** (R5).
- **Multitudes:** solo a distancia, sin primeros planos de cara (R2).

### Animales
- Realistas con pelaje (fur cards / shells): hámster, jerbo, castor, águila.
- Escala cómicamente exagerada (R1).
- Toque cartoon puntual como remate, por ejemplo ojos saltones (R5).

### Recomendación práctica para código [inferido]
- Priorizá **manos solas, humanos a distancia o ninguno**. **[tutorial]** El estilo de Creatorize directamente omite humanos.
- Si hacen falta, usá GLTF rigged (Mixamo, Ready Player Me, CC4) con pocas poses interpoladas.
- Para pelaje: shells.

---

## 11. Animación y timing

| Elemento | Rango medido | Refs |
|---|---|---|
| Acción de personaje u objeto | 0.3–1.2 s por acción (golpe: windup 0.4 s + impacto 0.15 s) | R1, R2, R4, R5 |
| Entrada de objeto | Desde fuera de cuadro, ease-out cúbico en 0.3–0.5 s. Overshoot leve opcional (R2) o ninguno (R3, R7) | R2, R3, R7 |
| Stagger en series | 10–50 ms por elemento | R2, R4 |
| Pop de gráfico | Escala 0 → 1.1 → 1.0 en ~0.2 s | R4 |
| Resaltado | Entra en 0.15–0.4 s, hold ~0.5 s, sale en 0.3–0.5 s | R2, R3, R4, R6 |
| Cambio de estado de color (caliente → frío, etc.) | <0.5 s | R3, R7 |
| Elipsis | Tareas largas (cortar, trazar, llenar) comprimidas a 0.5–1 s, o con time-lapse | R4, R6 |
| Mecanismos | Engranajes a 0.3–0.5 rev/s constante, sin ease, con relación de dientes correcta | R5 |
| Péndulos | ±25°, periodo ~1.2 s, amortiguados | R5 |
| Reacciones | Anticipación de 2–3 frames + hold de 0.3–0.5 s | R5 |
| Física | "Creíble pero dirigida": el líquido va hacia donde dice el guion, pocos rebotes. Cloth, chorros y caídas simplificados | R2, R7 |

### Sincronía imagen–palabra (la regla más importante)
- **Corte al plano nuevo:** onset de la palabra clave −0.3 s.
- **Objeto que entra en cuadro:** 0.3–1.0 s antes de que se lo nombre.
- **Resaltado o cambio de color:** en la palabra, entre −0.25 y +0.1 s.
- **Estados** (aire, calor): se pueden anticipar hasta ~1 s.
- **Tolerancia general medida:** ±0.3 s (R7). **Lo visual nunca llega tarde más de ~0.5 s.**

---

## 12. Guion

### Métricas [medido]

| Ref | Velocidad |
|---|---|
| R2 | 150 ppm |
| R7 | 165 ppm |
| R6 | 170 ppm |
| R3 | 195 ppm |

- **Rango: 150–195 ppm, mediana ≈168.** Para un video de 30 s: **75–95 palabras**.
- Pausa máxima entre frases: 0.5–0.7 s.
- Aproximadamente una frase de 6–10 palabras cada ~3 s, o pocas frases largas encadenadas.
- R1 y R4: sin transcripción (sus guiones fueron [inferidos]). R5: mudo (~3 ppm), funciona con gag visual y SFX.

### Gancho (0–3 s)
- Sin intro, sin pregunta, sin "¿sabías que…?". **La primera frase ya es la acción**, en imperativo ("Tie the cotton string…", "Carve a massive trench…") o en presente descriptivo.
- El gancho fuerte es visual: objeto cotidiano + algo raro, o una revelación del interior en menos de 3 s.

### Desarrollo
- Receta de pasos secuenciales con conectores: *Then / Next / Once / While / so / and when / until finally*.
- **Cada frase describe lo que se ve en ese momento.** Cada paso suma un gadget o elemento visual nuevo.
- El tramo "científico", si lo hay, recibe la secuencia visual más elaborada (corte o rayos X).

### Tono
- Narrador neutro y deadpan. Segunda persona imperativa (R3), voz pasiva en presente (R7) o pasado narrativo (R6).
- El absurdo se dice con total seriedad; condicional (could/would) para lo especulativo.
- Verbos físicos y visuales. Sin adjetivos emocionales. Cifras en pantalla, no habladas.

### Remate (últimos 2–5 s)
Un payoff visual concreto, de alguno de estos tipos:
- beneficio práctico ("…without ever taking the device apart", R7),
- giro cómico-cotidiano (tomar soda, R3; 25 % de carga, R1),
- payoff patriótico o celebratorio (R2),
- gag que contradice el texto (Platón vuelve a dormir, R6),
- **loop** al primer plano (R5).

**Sin CTA.**

---

## 13. Sonido (casi todo es inferencia)

- **Voz [medido]:** locución continua, rápida, sin pausas largas. Domina la mezcla [inferido].
- **SFX [medido en R5]:** cada contacto (hachazo, mordida, trazo) tiene su golpe en el frame exacto de contacto. El ASR detectó "palabras" que probablemente eran SFX.
- **Música [inferido]:** hay música de fondo (R5 sin voz se sostiene con "SFX y música"). **[tutorial]** El pipeline de Creatorize incluye "Sound design mixed" con música y SFX activados por defecto.
- **Recomendación [inferido, no medido]:**
  - whoosh en cada whip o zoom-through,
  - "pop" o "ding" corto en resaltados y flechas,
  - zumbido eléctrico en arcos y energía,
  - golpes en impactos,
  - música de fondo ~−18 a −22 dB bajo la voz,
  - corte o stinger en el remate.

---

## 14. Checklist de frame (verificable)

Para cada frame o shot renderizado:

1. ☐ **Formato:** 1080×1920, 30 fps, sin barras.
2. ☐ **Cámara en movimiento:** el transform de cámara cambia respecto del frame anterior (push, órbita o drift ≥3 % de escala/s), salvo holds de remate de menos de 0.5 s.
3. ☐ **Duración del shot** entre 0.5 y 2.0 s (excepto tramos de cámara viajera continua justificados).
4. ☐ **Bloom solo en emisivos:** el threshold ≥0.8 y los objetos no emisivos no generan halo.
5. ☐ **Sin negro puro ni grano:** luminancia mínima >`#0A0A0A` (salvo escenas negras deliberadas), sin ruido añadido.
6. ☐ **Bordes biselados:** ninguna arista de objeto héroe muestra un corte de 90° perfecto (salvo cortes transversales).
7. ☐ **AO y sombra de contacto visibles** bajo todo objeto apoyado.
8. ☐ **Subtítulo:** blanco, bold, contorno negro, 1–4 palabras, una línea, base a 78–79 % H (±1 %), sin animación, ancho ≤70 % W.
9. ☐ **Sincronía:** si la palabra activa nombra un objeto, ese objeto está en cuadro y, si corresponde, resaltado (entre −0.3 y +0.1 s del onset).
10. ☐ **Color semántico correcto:** verde = el objeto nombrado o lo correcto; rojo = problema, calor o descarte; cian = interior o flujo; amarillo = dirección; magenta = energía.
11. ☐ **DOF coherente:** fuerte (fondo desenfocado de 20–40 px) en macros; casi nulo en planos generales.
12. ☐ **Gráficos en world space:** flechas, contadores y textos son 3D anclados a la escena, no UI 2D (excepto subtítulos).

---

## 15. Diferencias entre refs y qué es constante

### Constante (7/7 o casi)
- 9:16 y duración de 24–59 s, con mayoría de ~30 s.
- Duración media de shot de 0.9–1.5 s y cámara siempre en movimiento.
- Render limpio: ACES, sin grano, saturado, biseles, AO con sombra de contacto, DOF fuerte en macros.
- Bloom restringido a emisivos.
- Branding diegético del canal en objetos.
- Explicación diegética y visual: el objeto se muestra, se corta o se resalta en lugar de rotularse.
- Sincronía estricta imagen–palabra, con lo visual adelantado.
- Subtítulos de 1–4 palabras a ~78 % H cuando hay narración (4/4 refs con subtítulos).
- Sin intro ni CTA, con remate visual.

### Variable (elegir por video)

| Eje | Opciones observadas |
|---|---|
| Luz | Estudio high-key cian (R3, R4, R5, R7) · Sol exterior duro (R2) · Interior dramático teal-orange (R6) · Diorama azul o practicals (R1, R5) |
| Recurso de explicación principal | Overlay verde (R2) · Override de color multicolor (R3, R4) · Rayos X cian + corte con tapa lima (R6, R1) · Panel transparente a un mundo interior (R5) · Neón magenta de campo (R7) |
| Motion blur | Protagonista (R2, R4) · En whips (R5) · Mínimo (R7) · Nulo (R6) |
| FOV | Tele 28–40° (mayoría) · Gran angular FPV de 90–100° (solo R2) |
| Montaje | Cortes secos rápidos (R3, R4, R5) · Cámara viajera continua a lo largo de un flujo (R1, R6) · Mezcla con saltos de escala (R2, R7) |
| Narración | Imperativa (R2, R3) · Pasiva en presente (R7) · Pasado narrativo (R6) · Muda con gag (R5) · Desconocida (R1, R4) |
| Humanos | Ninguno o solo manos (R4, R7) · Mascota en el remate (R1, R3) · Protagonista (R5, R6) · Multitud lejana (R2) |
| Overshoot en entradas | Sí (R2, R4) · No (R3, R7) |
| Texturas | Miniatura envejecida (R1, R5, R6) · Juguete limpio (R4, R7) |
| Tipografía | Humanista (R2, R3) vs. geométrica (R6, R7). Sin resolver: es una discrepancia de medición |

### Notas de fiabilidad
- R1, R4 y R5 no aportan datos de guion ni de subtítulos medidos. Sus secciones de guion y sincronía son [inferido].
- Los tutoriales describen un producto de terceros (Creatorize + Blender Cycles). Su "style key" no coincide con lo medido en varios puntos: rim cian, piso de cuadrícula, ausencia de humanos, etiquetas flotantes. Usalos como pista de pipeline (transcripción por palabra → storyboard → build por shot → verificación de frames), no como fuente del look.
- **[tutorial]** Regla útil que proponen y conviene adoptar: verificar en cada shot que la cámara no atraviese ni quede detrás de piezas del set sin intención, y que el sujeto sea visible durante todo el shot.