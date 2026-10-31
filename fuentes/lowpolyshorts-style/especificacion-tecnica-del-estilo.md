# Especificación del estilo (LowPolyShorts (low poly estilo PS1))

- Refs: 0U6OcfxYZ7U - You've Never Touched Anything, xbSWtRVHfr0 - Weirdest Nuclear Code Proposal, abJLhKWtK_g - He Wore Upside-Down Glasses For 124 Days, v-wfOrHFPUI - A Cow With A Window, Xy9cJ0-F0Po - The Ganzfeld Effect, RPp1pEBgmtM - How Anglerfish Do The Thing, S3HE6q2BsMI - Brain Cells Can Play Pong
- Fecha: 2026-10-29

# Especificación de estilo: LowPolyShorts (low poly estilo PS1)

**Destino:** Blender Python, render cuadro a cuadro, 1080×1920 (9:16), 30 fps.

**Sobre las medidas:**
- Las 7 refs se midieron sobre fotogramas de 432×768 muestreados a 2 fps. Todo tiempo tiene un error de **±0.25 s** (≈±7 frames a 30 fps).
- Para pasar de px de referencia a px de 1080×1920, multiplicá por **2.5**.
- Las posiciones se dan en % de W y % de H, medidas desde arriba.
- **[INF]** marca una inferencia que no está medida directamente.

---

## 1. Resumen del look en 5 líneas

1. Geometría PS1 sin biseles, de 8 a 1500 tris, con **fotos reales pegadas** encima (caras, ropa, fachadas, peces) y texturas de 64–256 px en filtrado **Closest**.
2. Luz **casi plana**: ambiente alto y un sol suave. No hay sombras, AO, DOF ni bloom, y el grading es neutro y saturado.
3. Humanos con **cara fotográfica sin rig** sobre una cabeza-prisma. La expresión cambia por swap de textura. El protagonista recurrente es un hombre mayor con campera bordó.
4. Montaje literal: **un corte por oración** (cada 1.6–3 s) y un objeto en pantalla por cada sustantivo. Los cambios de estado son pops de color, y los planos "mentales" usan un cerebro con ojos sobre un fondo de agua animada.
5. Subtítulos **amarillos, chicos, en minúsculas** al 67.5% de H. Logo 3D amarillo dentro de la escena. Narración deadpan a ~200 wpm y final abrupto pensado para loop.

---

## 2. Render y luz

### Setup base (constante en las 7 refs)

| Parámetro | Valor |
|---|---|
| Motor | EEVEE (o Workbench Flat+Texture) |
| Resolución | 1080×1920 a 30 fps |
| Color management | View Transform `Standard`, Look `None` (ref 2 usa `High Contrast`) |
| Sun | strength 2–3, blanco #FFFFFF a #FFF6E8, desde arriba-izquierda, elevación 45–70°, azimut ~30° |
| World | gris #808890–#B0B0B8, strength 0.6–1.0. El ambiente debe quedar en 0.5–0.7 del valor final |
| Contraste de sombra propia | la cara en sombra es 10–25% más oscura que la iluminada (nunca negra) |
| Alternativa unlit | Emission = Base Color, strength 1, o Mix 30–40% Emission + 60–70% Diffuse |
| Sombras proyectadas | **OFF** (`light.use_shadow = False`). Los personajes flotan sin sombra de contacto |
| AO / SSR / DOF / niebla / bloom / grano | **OFF** por defecto |
| Texturas | `interpolation = 'Closest'`, 64–256 px, sin mipmaps. Un texel ocupa 1.5–2.5% de W en primer plano |
| Antialiasing | Bordes limpios en refs 1, 3, 4, 6 y 7. Film filter 0.5–1.0 px |
| Especular, metal, vidrio | Ninguno. Roughness 1, Specular 0 |
| Emisivos (lámparas, tubos) | No iluminan nada: son solo color plano |

### Excepciones medidas (usarlas solo como variante)

| Efecto | Ref | Valor |
|---|---|---|
| Niebla de distancia | 6 (submarino) | Lineal de 15–20 m a 50–60 m, color #4C4A8C. Se implementa con View Distance → Map Range en el material, o con un Mist pass |
| Bloom / flash | 1 (explosión final) | Rampa exponencial de ~1.5 s hacia blanco, con multiplicado amarillo #FFF27A |
| Glow leve | 7 (placa encendida) | Halo de 3–5 px de referencia (8–12 px a 1080) |
| Sombras duras | 4 (cerca del granero) | Única aparición: #B59054 sobre paja #D9AE62 |
| Dither y baja resolución interna | 5 | Render a 216×384 o 320×568 y reescalado nearest, con aliasing visible. Dither tipo Bayer 4×4 de ±1/64, posterizado a 32 niveles por canal |
| Post "agresivo" | 2 | Curva en S fuerte con negros aplastados, saturación +30%, Sharpen ~0.3, Glare Fog Glow con threshold 0.9, Lens Distortion con dispersion ~0.02, grano ~5%, viñeta leve, glitch RGB |

### Snippet base

```python
import bpy
s = bpy.context.scene
s.render.resolution_x, s.render.resolution_y, s.render.fps = 1080, 1920, 30
s.view_settings.view_transform = 'Standard'
s.render.filter_size = 0.75
for m in bpy.data.materials:
    if m.use_nodes:
        for n in m.node_tree.nodes:
            if n.type == 'TEX_IMAGE':
                n.interpolation = 'Closest'
for l in bpy.data.lights:
    l.use_shadow = False
```

---

## 3. Paleta (hex)

### Texto e interfaz

| Uso | Hex |
|---|---|
| Subtítulo amarillo (rango medido #F0F000–#FFFF33) | **#F5EB30** (canónico) |
| Contorno de texto | #000000 |
| Logo, cara frontal | #FFE21A (rango #F4E21A–#FFE820) |
| Logo, cara lateral | #C89A00 (rango #A87A00–#C99A00) |
| Número destacado verde | #3CF060 |
| Número destacado naranja → rojo | #FF7A1E → #E01818 |
| Etiqueta lima | #A0FF3C |
| Texto de remate rojo | #E00010 |

### Personaje recurrente (refs 1, 3, 5, 7)

| Elemento | Hex |
|---|---|
| Campera bordó, luz / sombra | #8C2E22 / #6A2316 |
| Remera | #262626 |
| Jean | #3F5F9E |
| Piel | #E5C0A8, sombra #B98A78 |

### Fondos "mentales" (agua o cáusticas animadas)

| Fondo | Oscuro → claro |
|---|---|
| Rojo | #3A0000 → #8C0000 → #C21010 |
| Verde (éxito) | #0A5210 → #2FC23A |
| Azul | #05104A → #2236A8 |
| Violeta | #5A0890 → #8A18D0 → #E070FF |
| Magenta | #F04AE0 |
| Rojo radial | #FF1010 al centro → #4A0000 al borde |

### Objetos metáfora

| Elemento | Hex |
|---|---|
| Cerebro | #E8806C, sombra #C8503A |
| Guantes / manos "divinas" | #F4F4F4, sombra #C8C8C8 |
| Esclera | #F2F2F2 |
| Fondo de agua del submarino | #0A0A80 |

### Acentos puros (para pulsos, cables, átomos y flashes)

| Color | Hex |
|---|---|
| Rojo | #FF0000 / #E2381F |
| Verde | #00FF22 / #22E05A |
| Azul | #0010FF / #1E3CE6 |
| Amarillo | #FFE02A |
| Cian | #3CC8E8 |

### Flashes de estado

| Estado | Hex |
|---|---|
| Error | #F4B4B4 |
| Información | #A8D8F8 |
| Acierto | #A8F8A0 |
| Recompensa | #D8FF80 |

### Entornos típicos

| Elemento | Hex |
|---|---|
| Cielo | #3D72D6–#4F86D4, hacia el horizonte #8DB6EC |
| Nubes | #F4F7FB |
| Cielo "oscuro / ominoso" | #D41A0E → #F03A1A |
| Pasto | #5E9B3A–#7E9A3C |
| Concreto | #9A9893–#A3A5A6 |
| Techo | #D6DADF–#E4E6E8 |
| Alfombra | #B9BDB8–#C9CBC9 |

---

## 4. Materiales y modelado

### Polycount

| Objeto | Rango |
|---|---|
| Personaje humano | 500–2000 tris (cuerpo + ropa ~200 caras por pieza) |
| Utilería | 8–800 tris (cajas, prismas de 6–14 lados) |
| Animales | 80–600 tris |
| Esferas | icoesfera subdiv 1–2 (~80 caras) o UV 8×6, con facetas visibles en la silueta |

### Reglas de modelado y material

- **Sin biseles.** Aristas duras y flat shading. Si hay "bisel", está pintado en la textura.
- **Material único:** difuso mate o emission. No hay normal, roughness ni metal maps.
- **Transparencia:** solo alpha blend, sin refracción ni fresnel.
  - Vidrio: alpha ~0.45.
  - Cáscaras y células: alpha 0.45–0.7, con textura de cáusticas animada en emission.
  - Prisma o tapa: ~0.5–0.6.
- **Texturas:**
  - Mayormente fotográficas, reducidas a 64–256 px, con stretching UV visible (rocas, costados de la cara).
  - Tiling visible en asfalto, pasto y arena. La arena lejana da moiré, y eso se acepta.
  - Algunas son pixel art dibujado (PCB, cerebro de 16×16).
- **Suciedad y AO:** se pintan en la textura, nunca en el render.
- **Vegetación:** planos cruzados con alpha.
- **Aletas y orejas:** planos con textura alpha.

### Objetos recurrentes

- **Botón rojo:** prisma hexagonal #4A4F4A + cubo #E2381F.
- **CRT:** caja + trapecio trasero.
- **Cerebro:** poliedro de 20–30 caras con textura rosa pixelada.

---

## 5. Entornos y fondos

### Tres tipos de entorno

| Tipo | Contenido | Refs |
|---|---|---|
| Sets realistas | Cajas con textura fotográfica: casa con damasco, cocina, living, subte, calle NYC, granero, laboratorio, pista con avión, fondo marino. Muebles low poly con foto (sillón escocés, cortina floreada) | todas |
| Skybox | Foto pixelada para cielo y nebulosa, con el horizonte cortado duro y sin niebla (salvo ref 6) | varias |
| Fondos abstractos para "explicación" | Plano emisivo a pantalla completa con agua o cáusticas animadas (ver abajo) | 1, 3, 4, 5, 7 |

### Fondos abstractos: receta

- **Shader:** Voronoi + Noise con W animado por `frame`, más un ColorRamp de la paleta de la sección 3. En ref 7 lleva pixelado de bloques de ~4 px y simetría en espejo.
- **Variantes:**
  - Estática de TV: Noise con W distinto en cada frame + ColorRamp Constant.
  - Espiral psicodélica arcoíris: #FF2080, #FFE000, #20C0FF, #80FF40.
  - Negro puro.
- **El color del fondo codifica la emoción o el estado:**
  - Rojo: problema o enfermedad.
  - Verde: éxito o dinero.
  - Violeta/magenta: mente o alucinación.
  - Azul: ciencia.
  - Negro: aislar el sujeto.
- **Cambio de fondo:** se hace en seco en la palabra clave. La excepción es ref 1, con una disolvencia de color de ~1 s (azul → púrpura → magenta → blanco).
- **Aislar el sujeto (ref 7):** el world pasa a negro y se ocultan pared y mesa durante 0.5–1 s.
- **Cielo ominoso:** el cielo cambia a rojo #D41A0E en el momento oscuro del guion (ref 2).

### Reutilización

Un solo set se filma desde 3–5 ángulos (frontal, cenital, ras de suelo, POV, órbita) para sostener 10–15 planos.

---

## 6. Cámara y encuadres

### Duración de plano

| Ref | Shots / duración | Promedio |
|---|---|---|
| 1 | 24 / 38 s | 1.6 s |
| 3 | 20 / 32.6 s | 1.6 s |
| 5 | 15 / 27.5 s | 1.8 s |
| 2 | 12 / 28.75 s | 2.4 s |
| 7 | 15 / 36 s | 2.4 s |
| 4 | 10 / 24.5 s | 2.45 s |
| 6 | 10 / 30.5 s | ~3.0 s |

**Rango global:** promedio de **1.6–3.0 s** por plano; planos individuales de **0.4–4.5 s**. Los planos de chiste duran 1–1.5 s y los de explicación 2.5–4 s.

### Ópticas y alturas

| Parámetro | Rango medido |
|---|---|
| Focal | 24 mm (generales, POV, ras) – 35 mm (primeros planos) – 50 mm (CU de cara, ref 5) |
| Altura de cámara | ras 0.03–0.3 m · baja 0.5–1.0 m · pecho 1.1–1.4 m · POV 1.6 m · cenital 3–4 m |
| Contrapicado | leve 5–10° (muy frecuente) · fuerte 25–30° · nadir ~70° |
| Picado | 20–60°, cenital 85–90° |
| Dutch | 3–15° habitual, hasta 25–30° en momentos caóticos |
| Horizonte | 41–78% de H según el ángulo |

### Encuadres típicos

- **Cara frontal:** la cara ocupa 45–55% de W y la coronilla queda al ~23% de H.
- **Objeto metáfora centrado:** ocupa 35–80% de W, a 43–52% de H.
- **Escala relativa:** ver una cosa pequeña al lado de otra gigante es un gag frecuente (ref 6: relación 25:1).

### Movimientos medidos

| Movimiento | Rango | Interpolación |
|---|---|---|
| Push-in lento | 2–8% de escala por segundo | lineal |
| Push-in de explicación | +30–100% de escala por segundo | lineal |
| Push-in "punch" | ×1.6–×2 en 0.4–0.5 s | lineal |
| Push-in continuo largo | ×1.5–×2.5 en 4 s | lineal |
| Dolly-out de reveal | ~30% en 0.75 s | ease-out |
| Órbita lenta | 5–15°/s | ease in-out suave |
| Órbita media | ~28°/s | ease in-out |
| Órbita rápida | 60–100°/s | casi lineal |
| Truck / travelling lateral | 6–25% de W por segundo (hasta ~3 m/s) | lineal |
| Tracking de personaje | igual a su velocidad (0.5–1 m/s) | lineal |
| Roll de transición | 90° o 180° en ≤0.5 s | ease in-out (SINE) |
| Roll aditivo de tensión | 15–25° a lo largo de 1.5–4 s | lineal |
| Bamboleo POV | roll ±25°, período ~1 s | senoidal |
| Micro-deriva tipo "mano" | ±0.5–5°, 0.2–0.5 Hz, o ±3 px | modificador Noise en la F-curve |

**Regla general:** la cámara **nunca está totalmente quieta**. Como mínimo hay una deriva de 1–3% de W por segundo.

---

## 7. Transiciones

### Por defecto

**Corte seco.** Representa el ~90% de las transiciones.

**Timing del corte respecto de la oración nueva:**

| Ref | Desfase medido |
|---|---|
| 4 y 6 | 0.1–0.25 s antes del onset de la oración |
| 3, 5 y 7 | en el onset, ±0.1 s |
| 1 | 0.3–0.6 s antes del sustantivo clave |

**Regla de código:** `cut_frame = round((t_onset_oracion - 0.15) * 30)`. Dentro de una misma oración no se corta: se usa push-in.

### Transiciones especiales

| Transición | Duración | Ref | Implementación |
|---|---|---|---|
| Match cut a "modo átomos / rayos X" | 0 (corte) | 1 | Misma cámara, swap de view layer o override de material |
| Roll de cámara 90°/180° | ≤0.5 s | 1, 3 | Keyframe de rotación con easing SINE in-out |
| Cámara que atraviesa pared u objeto | 0.5–4 s | 1, 4 | Push-in hasta que el objeto llena el cuadro, después corte |
| Corte por obstrucción (un brazo tapa el lente) | ~1 s, con ease-in | 4 | La geometría cubre la cámara y se corta |
| Disolvencia corta | 0.25–0.5 s | 5, 6 | Única aparición de crossfade; solo en momentos de "transformación" |
| Fly-by de un objeto que barre el cuadro | ~3 s | 6 | El objeto pasa por delante de cámara |
| Espejo/caleidoscopio + glitch RGB | — | 2 | Compositor: Flip + Mix con máscaras animadas |
| Cambio de fondo en seco | 0 | 3, 7 | Swap del plano de fondo |
| Fade a negro del entorno (el sujeto queda visible) | ~1 s, ease-in | 5 | Oscurecer solo el set |
| Flash blanco/amarillo + corte a negro | rampa de 1.5 s | 1 | Solo en el final |

---

## 8. Rayos X, cortes y gráficos

**Principio general:** la información se comunica con **color plano y objetos literales**. No hay flechas, etiquetas explicativas, íconos ni diagramas en ninguna ref.

### Recursos de rayos X y corte

1. **Modo átomos (ref 1):**
   - La escena se desatura al 100%, con gama ~1.1 y contraste un poco bajado.
   - El objeto pasa a negro #000000 con sprites de átomos de colores puros: densidad ~1 cada 35×35 px de referencia y tamaño ~12 px.
   - Variante en grilla: puntos de 4 px cada 10 px de referencia, con la geometría gris al 50% debajo.
2. **Cabeza translúcida (ref 3):** opacidad 25–30%, deja ver el cerebro adentro.
3. **Órgano superpuesto sin oclusión (refs 5, 6):**
   - Cerebro o estómago con `show_in_front = True`, opacidad 85–100%.
   - Aparece con pop instantáneo.
4. **Vasos y pulsos (refs 6, 7):**
   - Curvas con bevel y emission en colores puros.
   - Crecen con `bevel_factor_end` de 0 a 1 en ~0.5 s.
   - Los pulsos ocupan 10–15% del largo del cable y viajan 0.5–0.8 s, en forma lineal.
   - Las formas en chevron o zigzag llevan quiebres de ~120°.
5. **Flood de color en un objeto (ref 7):** el objeto entero cambia de color en 1 frame y lo mantiene 0.5–1 s, opcionalmente con el world en negro.
6. **Interiores como "ventana" (refs 2, 4):**
   - Un plano con textura de carne o interior pegado sobre la superficie, sin corte booleano.
   - Las tapas pasan de alpha 1 a 0 en 0.5–1 s, en forma lineal.
7. **Cambio de estado por color (refs 4, 6):** lerp lineal de 1.5–4 s.
   - Ref 4: enfermo #C8B030 → sano #E35A78.
   - Ref 6: desaturación de −60%.
8. **Tinte de plano "mental" (ref 5):** cian #40F0E0 o rojo, en Multiply con factor ~0.4.

### Gráficos de texto (uno o dos por video como máximo)

- **Número clave** (refs 1, 3):
  - Bold con contorno negro grueso (3 px de referencia, ~8 px a 1080).
  - Altura ~5% de H, ancho ~53% de W, centrado al 49–50% de H.
  - **Reemplaza** al subtítulo mientras está en pantalla.
- **Etiqueta** (ref 1): lima #A0FF3C, ~1.4× el tamaño del subtítulo, al 60.5% de H.
- **Texto final de remate** (ref 5): "wake up" en rojo #E00010, al 50% de H.

### Logo "Low Poly Shorts"

- **Forma:** texto 3D extruido en 3 líneas, con fuente blocky redondeada estilo Super Mario 64. Extrusión ≈20% del alto de letra. Las letras pueden tener rotación y escala individuales.
- **Colores:** frente #FFE21A, lateral #C89A00.
- **Posición:** entre el 30% y el 55% de H, con ~35–60% de W de ancho.
- **Comportamiento:**
  - Es un **objeto de la escena**, no un overlay: gira ±5° y queda afectado por la perspectiva y el roll.
  - Entra con pop o escala (×1.3) y sale por spin de 70–180° o por corte.
  - Dura 1.5–2.5 s.
- **Momento de aparición:**

| Ref | Segundo |
|---|---|
| 6 | 0 |
| 2 | 6.75 |
| 3 | 8.5 |
| 5 | 8.75 |
| 1 | 9.5 |
| 7 | 9.75 |
| 4 | 11.75 |

  Suele coincidir con el pivote "You see," del guion (refs 1, 5, 7).

---

## 9. Subtítulos y texto

| Parámetro | Valor | Variación entre refs |
|---|---|---|
| Fuente | Sans bold: Arial Bold / Verdana Bold / Helvetica Bold | Rounded en ref 2; geométrica tipo Montserrat en ref 6 |
| Caja | **Todo en minúsculas, sin puntuación** | Se conservan los typos del guion |
| Color | #F5EB30 | #F0F000–#FFFF33 |
| Contorno | Negro, ~1–1.5 px de referencia, **≈3–5 px a 1080** | Sombra nula o mínima, sin caja de fondo |
| Tamaño | Cap height ≈2.0–2.3% de H (**≈40–44 px a 1920**); x-height ≈1.4–1.6% de H (≈27–31 px) | El tamaño en puntos se calibra según la fuente **[INF]**: ~56–60 px de cuerpo |
| Posición | Centro horizontal, **línea base al 67.5% de H** (y ≈ 1296 px a 1920) | Ref 6 ≈67%; **ref 2: 77% (outlier)** |
| Líneas | Siempre 1 | — |
| Palabras por bloque | 1–4 (hasta 6), **promedio 2.5–3**, cortando por grupos sintácticos | — |
| Duración por bloque | 0.5–1.5 s | — |
| Entrada y salida | Pop seco en el onset de la primera palabra (0–0.1 s antes) y permanencia hasta el bloque siguiente | Sin highlight por palabra ni animación |

**Implementación:** un objeto Text o un Text strip del VSE por bloque, generado desde el JSON de timestamps, con `hide_render` keyframeado en modo CONSTANT.

---

## 10. Humanos y animales

### Humanos

- **Cabeza:**
  - Prisma de 6–10 lados (alrededor de 40–100 caras) con forma de "ataúd" o hexágono, coronilla plana o en punta y una arista central visible.
  - En ref 7 es directamente un cubo.
- **Cara:**
  - **Foto real** proyectada en forma frontal, con estiramiento visible en los costados. Ojos y boca son parte de la foto.
  - No hay rig facial ni parpadeo.
  - **La expresión cambia por swap de textura:** neutral, grito, ojos saltones, ojeras, ojos inyectados.
  - Variante inquietante (ref 7): ojos borroneados y puntos blancos dispersos en la piel.
- **Pelo:** pintado en la textura o casquete poligonal (en ref 2, #7A2A1A).
- **Protagonista recurrente** (refs 1, 3, 5, 7): hombre mayor, calvo o canoso, con campera de cuero o gamuza bordó, remera negra, jean y zapatillas negras de caja.
- **Personajes secundarios:**
  - Personajes "meme" (presidente con ojos saltones).
  - Clones idénticos para los extras (agentes con anteojos pintados).
  - Mono amarillo #F4D41E con guantes azules #2C6EE0 para el veterinario.
- **Manos:**
  - Mitón de 2–4 bloques, cuña sin dedos o directamente un cubo.
  - En los primeros planos se usa un **modelo de mano detallado** con textura de foto, facetado en macro.
- **Proporciones:** realistas (7–7.5 cabezas), hombros anchos y cuello grueso. En ref 7 es un busto caricaturesco.

### Animales

- Malla facetada de 80–600 tris con textura fotográfica deformada.
- Orejas y aletas: planos con alpha.
- Patas: prismas de 4–6 lados.
- El ojo cambia de estado por swap de textura (por ejemplo, de normal a un disco lechoso sin pupila).
- Gag frecuente: un animal pequeño colocado al lado del sujeto (ratón en el hombro).

### Personajes "metáfora" (refs 3, 5, 6, 7)

- **Cerebro con 2 ojos:** esferas de ~24 segmentos; cada ojo mide ~40% del alto del cerebro.
- **Guantes o manos blancas flotantes:** sin brazo, estilo Rayman, con aspecto de papel facetado.
- **CRT con cara de texto verde** #40FF40.
- Otros: alien verde, figura pálida de ojos enormes en escala de grises.

---

## 11. Animación y timing

### Estilo general

- Keyframes directos, lineales o con ease-out corto.
- **Sin overshoot** (como máximo ~1.1 en el pop del logo) y sin física.
- Las excepciones físicas son los ragdolls de los gags en ref 1: rigid bodies bakeados, con atravesado de paredes por simple clipping.

### Rangos medidos por tipo de acción

| Acción | Duración / valor |
|---|---|
| Acción completa de un personaje | 0.8–1.5 s |
| Movimiento de un objeto (aparece, se abre, se levanta) | 0.25–0.5 s |
| Pop / cambio de estado | 1 frame, o 0.2–0.3 s de escala de 0 a 1 con ease-out |
| Pose a pose | 1 clave cada ~0.5 s, ease in-out (ref 5: stepped a 12–15 fps, es decir CONSTANT cada 2 frames) |
| Caminata | Ciclo tipo mocap/Mixamo, 1 paso cada ~0.5 s, brazos rígidos. La torpeza y los estiramientos se aceptan |
| Squash | Escala Y 0.75 / X 1.05 durante ~1 s; aplastado a disco en ~0.3 s |
| Bob de flotación | 2–5% de H, período 1.5–2 s, más un yaw lento |
| Natación | Yaw ±5–8° a 1.5–2 Hz; colgado ±3–5° a 0.5 Hz |
| Saludo / gesto en loop | ±25°, período ~1 s |
| Temblor / time-lapse | Cabeceos aleatorios ±15° a ~4 Hz; cambios de escala aleatorios cada 0.25 s |
| Fade de alpha | 0.5–1 s, lineal |
| Lerp de color | 1.5–4 s, lineal |
| Pulso por un cable | 0.5–0.8 s, lineal; el destino se enciende en ~0.25 s y se mantiene 1–1.5 s |

### Sincronía imagen-palabra

- El evento visual cae **entre 0.5 s antes y 0.25 s después** de la palabra que lo nombra. La mayoría cae entre −0.2 y 0 s.
- **Regla de código:** `event_frame = round((t_palabra - 0.15) * 30)`.
- La acción física fuerte va en la sílaba tónica.
- Cada sustantivo concreto debe tener su objeto en pantalla dentro de su mismo bloque de subtítulo.

---

## 12. Guion

### Datos medidos

| Parámetro | Valor |
|---|---|
| Duración | 24.5–38 s |
| Palabras | 80–133 |
| Velocidad | **190–215 wpm** (media ~200) |
| Pausas | Ninguna mayor a 0.5–0.7 s. La más larga suele ir antes del pivote |
| Persona | "They…", "If you…", "When a…": tercera persona o segunda condicional |

### Estructura

1. **Gancho (0–8 s, 1 o 2 oraciones):** hecho chocante e impersonal, sin "¿sabías que?" ni nombres propios. Ejemplos de las refs: "They cut a hole into the side of a healthy cow", "If you touch something…". Puede llevar un número concreto ("124 days").
2. **Pivote "You see,"** (refs 1, 4, 5, 7), a menudo con "actually". Suele coincidir con el logo.
3. **Mecanismo / desarrollo** en escalada, con conectores temporales ("At first / But by / But when") o con lista anafórica ("His eyes… His stomach… His brain…"). Cada frase sube lo absurdo y aporta un visual nuevo.
4. **Remate:** una de estas variantes.
   - Moraleja pseudo-motivacional ("feed your brain a lie…").
   - Dato competitivo (cerebro vs. IA).
   - Chiste meme ("never touched grass").
   - Frase seca de cierre ("saving its life").
5. **Final:** sin CTA. Termina abrupto, a veces **cortado a mitad de palabra** ("trigger a-") o con remate solo visual ("wake up"), para favorecer el loop.

### Tono

- Narrador neutro, monótono y deadpan, de divulgación con humor seco o negro.
- El absurdo lo pone la imagen.
- Simplifica la ciencia con hipérboles. **Recomendación:** mantener un "may/would" donde haga falta rigor.

---

## 13. Sonido

Los informes analizan transcripción y fotogramas, no la mezcla. Casi todo lo que sigue es **[INF]**.

**Medido:**
- Una sola voz narradora continua, seria y monótona, a ~200 wpm, sin pausas largas.
- Los cortes y eventos están alineados a las palabras, lo que confirma que la voz es la pista maestra del montaje.

**Probable [INF]:**
- **Voz en primer plano** con densidad alta, posiblemente TTS o voz editada para quitar silencios, dado el ritmo constante.
- **SFX puntuales en los gags:** grito en los ragdolls (las caras fotográficas gritan), golpes, flash o explosión al final de ref 1, estática de TV en ref 5, bleeps de Pong en ref 7.
- **Música:** no hay evidencia. Si existe, es un bed bajo que no compite con la voz.
- **Corte de audio seco** en el último frame, junto con la imagen, para el loop. El "a-" truncado de ref 1 lo confirma para ese caso.
- "wake up" (ref 5) puede ser una voz no transcripta o texto solo.

---

## 14. Checklist de frame

1. ☐ Resolución 1080×1920, 30 fps, View Transform `Standard`.
2. ☐ Todas las Image Texture en `Closest`, con texels visibles en primer plano (≥1.5% de W).
3. ☐ No hay sombra proyectada, AO, DOF ni bloom (salvo la variante documentada en la sección 2).
4. ☐ La cara en sombra nunca baja de ~75% del valor de la cara iluminada (ambiente 0.5–0.7).
5. ☐ Ningún objeto tiene biseles y las siluetas muestran facetas.
6. ☐ Los humanos tienen cara fotográfica sobre cabeza-prisma; la expresión sale de la textura activa, no de un rig.
7. ☐ El subtítulo está en minúsculas, color #F5EB30 con contorno negro de 3–5 px, cap height de 40–44 px, línea base en y = 1296 px, 1 línea de 1–4 palabras.
8. ☐ Si hay número o gráfico destacado, el subtítulo está oculto en ese frame.
9. ☐ La cámara se mueve (deriva ≥1% de W por segundo o push/órbita activos).
10. ☐ El objeto que nombra la palabra en curso está visible, o el frame está dentro de los 0.5 s previos a esa palabra.
11. ☐ El frame no está a más de 3.0–4.5 s del último corte, y el corte cayó entre 0.1 y 0.25 s antes de una oración.
12. ☐ Los colores de acento, fondos y estados pertenecen a la paleta de la sección 3: puros y saturados, sin gradientes de grading.

---

## 15. Diferencias entre refs y qué es constante

### Constante en las 7 refs

- Texturas Closest de baja resolución sobre low poly sin biseles.
- Luz casi plana sin sombras, sin DOF y sin AO.
- Fotos reales pegadas a la geometría (caras humanas o de animales).
- Subtítulos amarillos en minúsculas con contorno negro, 1 línea de ~3 palabras, sin animación.
- Montaje con cortes secos alineados a las oraciones y visual literal por cada sustantivo.
- Logo 3D "Low Poly Shorts" dentro de la escena, en los primeros ~12 s.
- Narración de ~200 wpm, deadpan, sin CTA, con final abrupto.
- Sin flechas, etiquetas explicativas ni íconos.

### Variables entre refs

| Aspecto | Variación |
|---|---|
| Ritmo de corte | 1.6 s (refs 1, 3) a 3.0 s (ref 6) |
| Posición del subtítulo | 67–68% de H en 6 refs; **77% en ref 2** |
| Fuente del subtítulo | Arial/Verdana Bold (la mayoría), rounded (ref 2), geométrica (ref 6) |
| Logo | Amarillo SM64 en 6 refs; **cromado serif itálico en ref 2**. Momento: de 0 s (ref 6) a 11.75 s (ref 4) |
| Post-proceso | Ninguno en la mayoría; **muy cargado en ref 2** (contraste, sharpen, CA, grano, glitch); dither y baja resolución interna en ref 5 |
| Niebla | Solo en ref 6 (submarino) |
| Sombras | Solo una aparición, en ref 4 (cerca) |
| Bloom / flash | Solo en el final de ref 1 y el glow leve de ref 7 |
| Física | Ragdoll solo en ref 1; el resto es keyframe o mocap |
| Fps de la animación | Stepped a 12–15 fps en ref 5; fluido en las demás |
| Recurso de explicación | Átomos y match cut (1), color flood y pulsos (7), overlays de órganos (6), cerebro metáfora (3, 5), ventana/interior (2, 4), POV invertido (3) |
| Disolvencias | Solo en refs 5 y 6 (0.25–0.5 s) |
| Sincronía | Desde −0.6 s (ref 1, anticipa) hasta +0.25 s (ref 7) |
| Humanos / animales | Ref 6 no tiene humanos; refs 1, 2, 3 y 5 no tienen animales (salvo criaturas metáfora) |

### Recomendación

Tomá como **perfil por defecto** el de las refs 1, 3, 4, 5 y 7:
- sin post-proceso;
- subtítulo al 67.5% de H;
- logo amarillo SM64 alrededor de los 9 s;
- corte cada ~1.8–2.4 s.

Dejá como **flags opcionales** del generador las variantes medidas en ref 2 (post agresivo), ref 5 (dither y baja resolución), ref 6 (niebla) y ref 1 (ragdoll y flash final).