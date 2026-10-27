---
type: reference
status: active
tags: [crashsune, blender, low-poly, anime, ps1, cara-2d, atlas, mapping-node, drivers, rigify, auto-rig-pro, props, gltf, threejs, neto512]
relatedTo: [crashsune-low-poly-series, GUIA-personaje-ps1]
---

# Modelos de ejemplo de Crashsune: lo que hay dentro de los .blend

Disección de los .blend gratuitos de Crashsune en `assets/crashsune/`. Los abrí solo con Blender 5.2 en segundo plano (`-b --python`) y nunca los guardé. Vi renders EEVEE de prueba, superpuse los UV sobre los PNG y comparé todo con `assets/neto512/neto.blend`.

> **Derechos.** Juliet (Lollipop Chainsaw), Astolfo (Fate) y Teto (UTAU/SynthV) son **fan art de personajes con copyright**. Love-chan es un personaje de la propia Crashsune. **Solo sirven para estudiar.** No se reutilizan sus mallas, texturas, rigs ni sprites en nuestros videos. Copiamos técnicas, no assets.

## Resumen rápido

| Modelo | Tris (con Mirror) | Texturas | Rig | Cara |
|---|---|---|---|---|
| Love-chan (tutorial de ojos) | **152**, solo la cabeza | cuerpo 1024×512, cara 1024×209 (tira 6×1, PSD con alfa) | Auto-Rig Pro, 340 huesos (70 deform) | hueco transparente en el ojo, iris detrás y huesos `Eye.L/R` |
| Juliet | **~1 030** personaje + 298 motosierra + 248 cabeza de Nick | 1024² cuerpo, 1024² cara (**grilla 3×3**), 1024² motosierra + variante "Anim" | Rigify, 244 huesos (57 deform) + 22 propios | **ojos y boca por separado** sobre el mismo atlas, cada uno con su hueso de control |
| Astolfo | **~3 070** | 1024² cuerpo, 1024² cara (grilla 2×3 + iris, cejas, rubor) | Rigify, 327 huesos (136 deform), 105 propios | atlas, huecos transparentes, iris detrás y pestañas con shape key |
| Teto | **8 427** base (37 k–137 k con Subsurf), **no es low poly** | 2048² cuerpo, cabeza y hoja de bocas | Rigify con super_face, 466 huesos | 20+ bocas en hoja 4×5, parpadeo con shape keys |
| NETO512 (nuestra base) | **554** | 256² cuerpo + PNG sueltos de 32×32 | Rigify, 224 huesos (35 deform) | mallas aparte con secuencias PNG que eligen propiedades del rig |

Versiones de los archivos: Love-chan en 4.4; Juliet, Astolfo y Teto en "4.1.23" con nodos que Blender estándar no reconoce, y NETO en 5.1.

---

## 1. Love-chan, ejemplo del tutorial de ojos (`Love-chan_LowPoly_EyeTutorial_Example_01.blend`)

- **Objetos:** `Lovechan_Model.001` (cabeza y pelo, 124 tris, 106 con la textura de cuerpo y 18 con la de cara), `Lovechan_Model.002` (cuello, 6), `EyeWhite` (18), `Iris.l` e `Iris.R` (1 quad cada uno, 2 tris). Total: 152 tris. Es un busto.
- **Texturas:**
  - `LoveChan-Texture.png` mide 1024×512. Tiene bloques de color plano para el pelo rosa, con las "mechas" blancas pintadas como triángulos, la ropa y una cara de referencia.
  - `LovehchanFaceTexture2.psd` mide 1024×209. Es una **tira 6×1**: normal con ojos de corazón, ojos cerrados, feliz ^^, sorpresa con espiral, mareo y una celda final con los dos **iris sueltos sobre alfa**. El PNG "FIXED" que está fuera del .blend es la misma tira sin alfa.
- **El truco de los ojos (lo confirmé con el PSD):**
  - En la celda 0 los ojos son **huecos con alfa 0**: 3 842 píxeles transparentes en esa celda.
  - Detrás de la cara hay una malla `EyeWhite` (pesada 100% a `head.x`) cuyo UV cae sobre un parche blanco del atlas, es decir, color plano sin UV propia.
  - Entre la cara y `EyeWhite` van los quads `Iris.l/R`, pesados **100% a `Eye.L` y `Eye.R`**. Mover o rotar esos huesos hace que el iris mire a otro lado.
  - Las celdas de ojos cerrados o felices están pintadas opacas, así que **tapan el iris solas**.
- **Materiales:** `Lovechan_Texture` y `Lovechan_Face`. Llevan Principled con `Base Color` y `Emission Color` = textura (Strength 1), `Alpha` = alfa de la textura, filtro **Closest**, blend **HASHED** y backface culling apagado. Hay un nodo `Curvature` que en 5.2 aparece como *NodeUndefined*; ver §5.
- **Rig:** **Auto-Rig Pro** (`arp_*`, controles `c_*`), 340 huesos para un busto. Incluye una colección "Eye Controllers". La única acción es `rig.001Action.001`, de 1 frame, con la pose de `Eye.L/R`. Este .blend no tiene drivers ni nodos Mapping para cambiar de celda: el face-swap del atlas se explica en el video 11 (`../crashsune/11-rig-cara-2d.md`).
- **Render:** EEVEE a 1280² y 24 fps, view Standard, mundo gris claro y sin luces ni cámara.

## 2. Juliet (`LowPoly_Juliet_LollipopChainsaw_Rig_RELEASE_00.blend`)

### Geometría
Son 12 piezas **separadas y solapadas**: falda, top, botas, brazos, mano, pelo y coletas, cuello, piernas, cinturón. Varias usan Mirror (X, sin clip). Los tris con Mirror son estos:

| Pieza | Tris |
|---|---|
| botas (`Cube.002`) | 264 |
| brazos (`Cube.003`) | 144 |
| `Hair`: pelo 128 + polígonos de ojos 23 + boca 6 | 157 |
| coletas (`Cube.006`) | 104 |
| falda (`Cube`) | 106 |
| piernas (`Cylinder`) | 80 |
| top (`Cube.001`) | 56 |
| resto | menos de 70 cada una |

- **La cara es parte de la malla `Hair`**, separada en dos materiales: `Juliet_Eyes` (23 tris) y `Juliet_Mouth` (6 tris, abajo en la celda).

### Texturas (las leí con los UV encima)
- **`LowPolyJuliet_Texture.png` (1024²):** atlas de "pegatinas" pintadas planas, con piezas de UV a escala libre según cuánto se ven. Hay medias, botas con cordones dibujados, la falda en 4 tiras de triángulos rosa, el logo "San Romero Knights" grande en el pecho y las mechas pintadas sobre bloques de color del pelo. Detalle por textura, no por geometría.
- **`LowPolyJuliet_FaceTexture.png` (1024²):** **grilla 3×3 de caras completas** (cejas, ojos, rubor y boca) de unos 330 px por celda. Hay normal, sonrisa, ojos en espiral, "o" de sorpresa, lengua afuera, sonrisa abierta, sonrisa chica, guiño con risa y puchero.
- **`LowPolyChainsawTexture.png` (1024²):** cuerpo de la motosierra y **dos versiones de la hoja** con dientes recortados en alfa.
- **`LowPolyChainsawTextureAnim.png`:** la misma textura con la hoja izquierda reemplazada por una **cadena "en movimiento"** borrosa y dentada. Sirve para alternar fotogramas mientras gira, pero **en el .blend no está conectada**: solo se usa la estática.
- **Restos de otros personajes:** `Suzy_Emmision.png` sigue conectada al cuerpo como emisión multiplicada por un color, y está `Suzy_Texture2.png`. Crashsune reutiliza piezas entre personajes (ver Astolfo).

### Rig de la cara (lo más útil)
- Hay dos huesos sueltos junto a la cabeza, `Eye_Control` y `Mouth_Control`, hijos de `DEF-spine.006`, en la colección "Face Texture". Cada uno tiene **Limit Location** local con X=Y=0 y **Z entre 0 y 0.839**.
- **Driver** en el nodo `Value` de cada material: `var * 10`, con `var` = TRANSFORMS, `LOC_Z`, LOCAL_SPACE del hueso.
- Una **cadena de 8 Math › Greater Than** (umbrales 1…8) y Mix (Vector) lleva a `Mapping.Location`. La evalué en Python con este resultado:

| Valor | Offset UV |
|---|---|
| ≤1 | (0, 0) |
| 2 | (0.324, 0) |
| 3 | (0.63, 0) |
| 4 | (0, −0.327) |
| 5 | (0.324, −0.327) |
| 6 | (0.63, −0.327) |
| 7 | (0, −0.654) |
| 8 | (0.324, −0.654) |
| ≥9 | (0.63, −0.654) |

  En la práctica, cada 0.1 que sube el hueso se pasa a la celda siguiente, y hay 9 estados.
- **Los offsets están medidos a ojo** (0.324 y 0.306 de paso, no 1/3 exacto). Funciona porque cada celda tiene margen pintado.
- **El truco clave:** ojos y boca son **dos materiales sobre la misma textura**, cada uno con su hueso. Así los ojos pueden venir de una celda y la boca de otra: **9 × 9 = 81 combinaciones** pintando solo 9 caras. En la hoja de render se ve: espiral, guiño, entrecerrados, "o", lengua, risa…
- `Nick_Face` usa la misma cadena, pero sin driver.

### Rig del cuerpo
- Rigify, 244 huesos, 57 deform. Tiene **22 huesos propios agregados al rig generado**:

| Grupo | Huesos | Padre |
|---|---|---|
| `Ponytail_L/R` | cadenas de 6 | `DEF-spine.006` |
| `Hair_Left/Right` | cadenas de 2 | `DEF-spine.006` |
| `Skirt_Front/Back/Left/Right` | 1 cada uno | `DEF-spine` |
| `Eye_Control`, `Mouth_Control` | 1 cada uno | `DEF-spine.006` |

- Están en colecciones propias ("Hair", "Skirt (Tweak)", "Face Texture") y son FK simple, sin constraints. Las colecciones FK y Tweak de brazos y piernas vienen ocultas: se anima en **IK**.
- **Propiedades:** las estándar de Rigify (`IK_FK`, `IK_Stretch`, `pole_vector`, `head_follow`…). En la acción se keyean con **CONSTANT** y el resto con BEZIER.

### Acciones
- **`Attack`** (fake user) es una **pose de 2 frames** (1→2). Mueve coletas, pelo, falda y brazos, y además **keyea `Eye_Control` y `Mouth_Control` en el frame 2**: la expresión viaja dentro de la acción.
- **`Idle`** está vacía y guardada en NLA ("[Action Stash]", 1–31).
- No hay ciclos: el archivo se publicó como rig.

### Props
- **Motosierra:** `Chainsaw_Armature` es otro armature con **1 hueso**. Ese hueso tiene **Child Of → `hand_ik.R`** del rig. La malla (298 tris, 182 vértices) está pesada **100% a ese hueso**: es un prop rígido.
  - Ojo: sigue al control IK, no a `DEF-hand.R`. Si la mano pasa a FK, la sierra no la sigue.
  - Materiales `Chainsaw_Mat` y `Chainsaw_Chain`: el *Specular BSDF* de EEVEE "legacy" con `Transparency` = ColorRamp(alfa), además de Hue/Sat. El de la cadena tiene un Mapping preparado en (0,0,0) para desplazar la UV.
- **Estela arcoíris (`Chainsaw_Rainbow`):** 4 tris con Subsurf nivel 3 (256 tris) y **shape keys `Extend`, `Curve`, `Curve2`** para estirar y curvar la estela.
  - Material `Rainbow`: Emission ×33.8 con BLEND.
  - Truco **"Disable Shadow"**: `Light Path.Is Shadow Ray → Mix Shader → Transparent`, para que no proyecte sombra.
- **Cabeza de Nick:** `Nick_Armature` tiene 10 huesos (corbata de 5 y raíz) con **Child Of → `torso`**. Su cara (`Nick_Face`) también usa la grilla 3×3. En el .blend está oculta.

### Escena y render
- EEVEE a 1920×1080 al 150%, **30 fps**, **film transparent**, Standard con look *Medium Contrast*.
- **`filter_size` = 0.06 px**, casi sin suavizado: píxeles de textura nítidos.
- Cámara en perspectiva de 60.7 mm, sin luces y mundo gris con fuerza 0.2. Todo el look sale de la **emisión**.

## 3. Astolfo (`LowPolyAstolfo_Release_00.blend`)

- **Geometría:** unas 3 070 tris en 25 piezas con Mirror.
  - Cara: `Narrow_Face` (195 tris), con 4 materiales: pelo 165, ojos 22, boca 6 y nariz 2.
  - Mano: `Hands` (264). Coletas: `Plane.005` (320). Lazo grande de la cabeza: 280.
  - **Las piezas reutilizadas conservan el nombre:** `Juliet_Arms`, `Juliet_Arms.001`, `Suzy_Legs` ×4. Crashsune **arma personajes nuevos con brazos y piernas de los anteriores** y los retexturiza, igual que nosotros con NETO.
- **Texturas:**
  - `Astolfo_Body_Texture.png` (1024²): stickers planos con cinturones y hebillas, falda a rayas, botas, emblema, mangas. Tiene alfa (0–255) para recortes.
  - `Astolfo_Face_Texture.png` (1024²): **grilla de 2 columnas × 3 filas** de caras (pelo rosa incluido). Además, en la esquina, los **iris sueltos**, las cejas, las líneas del rubor, un parche blanco y un bloque del color del pelo con sus mechas.
  - Los ojos abiertos son **huecos con alfa 0**; los cerrados, felices o en guiño son opacos.
- **Rig de la cara:**
  - `Eye_Controller` tiene Limit Location en Z de 0 a 0.419. `Mouth_Controller` no tiene límite.
  - **Driver `var * 15`** (LOC_Z local) → umbrales >1…>4 → offsets:

| Valor | Offset |
|---|---|
| ≤1 | (0, 0) |
| 2 | (0.4, 0) |
| 3 | (0.4, −0.3) |
| 4 | (0, −0.3) |
| ≥5 | (0, −0.556) |

    Son 5 estados, con offsets a ojo.
  - **El mismo hueso mueve una shape key de las pestañas:** `Eyelash` → `Key 1` con driver `var * 15` (curva 0→0, 1→1). Apenas sube un escalón, las pestañas 3D (68 tris) bajan a ojo cerrado.
  - `Iris` (2 quads) está pesado a `Iris.L/R`, `Eyebrow` (quads) a `EyeBrow.L/R` y `Blush` va en un plano aparte.
  - **El iris queda detrás de la cara:** se ve por el hueco y lo tapan las celdas cerradas. No hace falta un "toggle pupil".
- **Material de pestañas (`Astolfo_EylashMaterial`):** BLEND, nodo **`Set Depth`** con `Camera Data.View Z Depth + (−0.045)`. **Acerca las pestañas a la cámara para que se dibujen encima del flequillo**, el clásico "cejas a través del pelo" del anime. Teto hace lo mismo con −0.015.
- **Rig:** Rigify, 327 huesos, 136 deform y **105 propios**:

| Grupo | Huesos |
|---|---|
| TwinTail | 30 |
| Bow_Head | 16 |
| BunnyEar | 8 |
| Hair_Vent | 8 |
| HairBang | 7 |
| HairSide | 7 |
| HairFront | 4 |
| Finger | 10 |
| Bow | 4 |
| Torso_Armor | 2 |
| Sleeve_L/R | 1 cada uno |
| BunnyTail | 1 |
| Iris, Eyebrow | 2 cada uno |
| Eye_Controller, Mouth_Controller | 1 cada uno |

  - Cada grupo tiene su colección ("Bunny Ears + Bows + Tail", "BackHair", "Sleeve_Bone", "Eye + Mouth Controllers"…).
  - Todos los huesos tienen `wiggle_enable = 0`: estaba instalado el add-on **Wiggle 2** (jiggle) pero se publicó desactivado.
- **Acciones:** ninguna de personaje. **Render:** EEVEE 2560×1440, 24 fps, film transparent, Standard y mundo con fuerza 0.

## 4. Teto (`Teto_Birdbrain_Final_02.blend`): contraejemplo, no es PS1

- **Geometría:** 8 427 tris base, con **Subsurf** en casi todo (en render da entre 40 k y 137 k) y sombreado suave. La cabeza `Head.003` tiene 1 724 tris con topología de cara "real" (loops alrededor de ojos y boca). Sirve para ver otro estilo, no para copiar polycount.
- **Texturas** de 2048². La cabeza es un degradado pintado (cabello rojo a piel, rubor) con los ojos como agujeros modelados.
- **Boca:** hoja `Teto_MouthTextureSheet` de 4 columnas × 5 filas con unas 20 bocas sobre alfa.
  - `Mouth_Object` es una malla aparte (86 tris) con **Shrinkwrap** sobre la cara y pesada 100% a `Mouth_Bone`, así que se puede mover o escalar con el hueso.
  - El driver usa `Mouth_Bone.002`: **LOC_X** de 0 a 0.747, `var * 35`, 22 umbrales.
  - Algunos offsets son **mayores que 1** (2.5, 2.742, 1.5, 1.75). Funcionan solo porque la imagen está en **Repeat** (2.5 ≡ 0.5). Es una trampa si se pasa a otro motor con Clamp.
- **Ojos:** **shape keys** `Blink.L/R`, `BlinkHappy.L/R` y `Smug.L/R`, sin drivers. El iris y el brillo (`Head.004`, material *Highlight* con Emission 4.1) van pesados a `Iris.L/R`. Las pestañas usan `Set Depth`.
- **Rig:** Rigify con `super_face` en el metarig, 466 huesos y 54 propios (Hair_Dril 18, HairClip 8, FrontHair 6, SideBang 6, Eyebrow 6, Shirt 2…). Sin acciones.

## 5. Shaders: patrón común

- **Todo es "unlit" por emisión.** Usan Principled con `Emission Color` = textura (Strength 1) o Emission puro. No hay luces en ninguna escena, la view es Standard y no hay bloom ni AO.
- **Filtro:** Astolfo y Love-chan **Closest** (píxel duro aun a 1024²); Juliet y Teto Linear.
- **Alfa:** HASHED (dither) en casi todo, BLEND en pestañas y efectos, y backface culling **apagado** en todo, porque las piezas planas tienen dos caras.
- **Rim falso:** nodo `Curvature` → salida **"Scene Rim"** → ColorRamp → Mix **Dodge** sobre el color. Da un borde claro en la silueta. Junto con `Set Depth`, son nodos de un **fork de Blender (probablemente Goo Engine)**. En Blender 5.2 aparecen como `NodeUndefined`, así que en Blender normal ni el rim ni el Set Depth hacen nada. Tampoco exportan a glTF.
- Hue/Saturation/Value encima de la textura (Value 1.24, Factor 0.29) para aclarar sin repintar.

## 6. Recurso de planificación: concept "color coded" de Love-chan

En `LowPoly_Love-Chan_Resources/` hay frente y perfil del diseño con **cada pieza de malla en un color plano distinto**: pelo, cara y piernas, top, mangas, puños y manos, short, zapatillas. A la izquierda hay **marcas horizontales con el color de cada pieza** que fijan a qué altura empieza cada una, y un dibujo extra con la **sección de la manga vista desde la punta** (hexagonal).

Es el plano de modelado: qué es objeto separado, dónde se solapa y con cuántos lados.

## 7. Comparación de la cara: Crashsune vs NETO512

| Aspecto | NETO512 (`neto.blend`) | Crashsune (Juliet / Astolfo / Teto) |
|---|---|---|
| Dónde están los sprites | **PNG sueltos 32×32** como *Image Sequence*: 3 ojos, 5 bocas, 1 ceja, 1 pupila | **un atlas** de 1024² (grilla 3×3, 2×3, 4×5 o tira 6×1) |
| Qué elige el estado | propiedades **int en la colección de huesos "Head"** (`eyes`, `mouth`, `eyebrows`, `pupil`) y bool `toggle pupil` | **traslación de un hueso de control** (Limit Location) × k |
| Mecanismo | driver en `image_user.frame_offset` (`eyes - 1`); `toggle pupil` multiplica el alfa | driver → `Value` → cadena Greater Than + Mix Vector → `Mapping.Location` (desplaza la UV) |
| Geometría | mallas aparte: `eyes` (16 tris con mirror), `pupils`, `eyebrows`, `mouth` (4) | polígonos de la cara dentro de la cabeza, separados por **material** (ojos/boca); iris en quads aparte detrás de huecos |
| Mirar a un lado | hueso `eyes-base` (Limit Distance) → `eye.l/r` → `DEF-eye` | huesos `Iris.L/R`, `Eye.L/R` con el quad del iris pesado 100% |
| Parpadeo | sprite de ojo + ocultar pupila con `toggle pupil` | celda cerrada **opaca** que tapa el iris (+ shape key de pestañas en Astolfo, shape keys en Teto) |
| Animación | acción `face`: props en **CONSTANT** (frames 0–47) | keys en la **location del hueso** dentro de la acción del cuerpo (Juliet `Attack`) |
| ¿Sobrevive al GLB? | no: ni props de colección, ni drivers, ni secuencias | el driver no, pero **la animación del hueso de control sí se exporta**, y el atlas va embebido en el GLB |

Conclusión: ninguno exporta el *mecanismo*, pero el de Crashsune deja en el GLB **los datos** (hueso animado y atlas único). Con eso three.js puede reconstruir la cara sin tablas aparte.

---

## Para nuestro proyecto

Base: NETO512 personalizada como chica obrera PS1 (casco, chaleco, botas), exportada a GLB para el motor three.js PS1 (ver [GUIA-personaje-ps1](../GUIA-personaje-ps1.md)). Qué mejora el plan, en orden de valor:

1. **Cara en un atlas, no en PNG sueltos** (§3 de la guía).
   - Juntar todos los sprites (los de NETO y los nuevos: ^^, boca "O", grito, ceja enojada, pupila chica) en **un atlas de 256×256 con celdas exactas de 32 px** (8×8 = 64 sprites, offset = 1/8 exacto). Nada de offsets a ojo como en Juliet, ni mayores que 1 como en Teto.
   - El atlas va **embebido en el GLB** y se carga una sola textura.
   - En three.js, `setFace()` pasa a mover `map.offset` de cada parte. Hay que **clonar la textura por material**: ojos, boca y cejas comparten la imagen pero cada uno tiene su offset. Mantener `NearestFilter`, sin mipmaps, `flipY=false`.
   - Las mallas separadas de NETO (eyes, mouth, eyebrows, pupils) ya son "una parte = un material". Es justo lo que permite el **truco de Juliet: combinar cualquier ojo con cualquier boca**.

2. **Huesos de control de cara para llevar las expresiones dentro del GLB.**
   - Agregar 3 huesos sueltos hijos de `DEF-spine.006` (`FaceEyes`, `FaceMouth`, `FaceBrows`), sin deform, con Limit Location en un eje. Se keyean en cada acción (como Juliet en `Attack`) con interpolación **CONSTANT**, que glTF exporta como **STEP**.
   - Hay que exportar esos huesos: no usar "solo deform bones" o agregarlos a la lista.
   - En three.js, cada frame: `idx = Math.round(bone.position.z * 10)` → `setFace`.
   - Con esto las expresiones viajan con la animación (enojarse al levantar la sierra, cerrar los ojos al soplar el fuego) sin un `words.js` aparte para cada gesto. La boca de habla puede seguir por `words.js` encima.

3. **Ojos "hueco + iris detrás" (Love-chan y Astolfo) en lugar de `toggle pupil`.**
   - Sprites de ojo abierto con **alfa 0 donde va el iris**; cerrados y felices, **opacos**. El quad de pupila va **detrás**, pesado 100% a `DEF-eye.l/r`.
   - El parpadeo tapa la pupila sin lógica extra, y mirar a un lado es mover el hueso, que exporta al GLB.
   - Costo: rehacer los sprites de ojo de NETO con alfa y reordenar las mallas (pupila apenas detrás del plano del ojo, `alphaTest 0.5`).

4. **Cejas y pestañas por encima del casco y el flequillo** (el `Set Depth` de Astolfo y Teto).
   - Con casco y flequillo, las cejas quedan tapadas y se pierde la expresión. En three.js, al material de cejas (y pestañas, si las hay): `depthTest: false` o `polygonOffset` fuerte, y `renderOrder` mayor que pelo y casco.
   - En Blender no se puede replicar sin ese fork, así que solo se hace en el motor.

5. **Prop de la sierra (acción "levantar sierra" de sinaboto) y otros props.**
   - Como la sierra de Juliet: malla rígida pesada a un solo hueso. Pero **en vez de un armature aparte con Child Of** (no exporta a glTF y en FK no sigue la mano), en three.js se hace `handBone.add(prop)` sobre `DEF-hand.R`. En Blender, parent al `DEF-` en pose de reposo, como dice la guía.
   - Para el motor en marcha: **dos variantes de la cadena en el atlas** (estática / "Anim" borrosa) alternadas cada 1–2 frames moviendo el offset UV. Es la misma maquinaria que la cara. Sirve también para llamas del fuego y chorro de agua.
   - La sierra de Juliet tiene 298 tris. Para PS1, apuntar a ~100.

6. **Huesos secundarios simples para el movimiento secundario.** Cadenas FK cortas agregadas al rig generado, en su propia colección, sin constraints:
   - coleta o mechones bajo el casco: 2–3 huesos, hijos de `DEF-spine.006`
   - faldones del chaleco o pañuelo: 1 hueso cada uno, hijos de `DEF-spine.003`
   - correa del casco: opcional

   Se animan a mano con el desfase de 3–4 frames de la guía (§5) y exportan como huesos normales. Respetar el límite de 4 influencias.

7. **Limpieza antes de exportar** (encontrado en estos archivos):
   - Hay **modificadores Armature vacíos** (sin objeto) en `Hair` de Juliet, `Cube.002` de Astolfo y `Head.002` y `Plane.007` de Teto. Revisar que NETO no tenga ninguno antes del GLB.
   - Algunos huesos de control quedaron con `deform=True` sin pesos: ponerlos en False.
   - Aplicar Mirror. Algunas piezas sin parent al rig, como `Blush` de Astolfo.

8. **Presupuesto y texturas.**
   - Crashsune trabaja con unos 1 000–3 000 tris y texturas de 1024² (low poly "anime", no PS1 estricto).
   - Nosotros seguimos con NETO: **554 tris + accesorios ≤ ~350 (≤ 900 en total)**, cuerpo 256² y cara 256².
   - Lo que sí copiamos: **detalle pintado como "pegatina" plana** (franjas reflectivas del chaleco, logo de la empresa en la espalda, cordones de las botas) en vez de geometría. Con **Closest**.

9. **Planificar el outfit con un concept "color coded"** (§6) antes de modelar: frente y perfil de la obrera con casco, chaleco, rodilleras y botas cada uno en un color, más las marcas de altura. Define qué es pieza aparte y dónde se solapa.

10. **Lo que no adoptamos:**
    - El rim con `Curvature` y el Set Depth en Blender: dependen del fork y no exportan.
    - Las shape keys de cara de Teto: el GLB las soporta, pero su estilo de topología suave no es PS1.
    - El jiggle con Wiggle 2: lo descartamos para el GLB.
    - El Subsurf.
    - El Auto-Rig Pro de Love-chan: seguimos con el Rigify de NETO.
    - Los renders en Blender pueden usar `filter_size` cerca de 0 (como Juliet, 0.06) para ver píxeles nítidos, pero el look final lo da nuestro motor.

**Recordatorio:** de estos archivos se copian **técnicas**, nunca mallas, texturas ni sprites. Las expresiones nuevas de nuestra obrera se dibujan de cero sobre el estilo de NETO, con crédito a evanciao por el modelo base.
