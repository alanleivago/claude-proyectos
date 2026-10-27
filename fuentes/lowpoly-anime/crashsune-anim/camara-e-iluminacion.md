---
type: reference
status: active
tags: [crashsune, blender, camara, fov, focal-length, dof, cortes, iluminacion, 3-puntos, rim-light, threejs, ps1, sinaboto]
relatedTo: [crashsune-low-poly-series, GUIA-personaje-ps1]
---

# Cámara e iluminación (Crashsune, Blender 3D Animation Tutorial partes 10 y 11)

Fuentes: `10/` "Camera MASTERY [Depth of Field, Zoom, Cuts]" (16:15) y `11/` "Character Lighting + Animation" (18:00), más dos posts de su Patreon (FOV y luz 3 puntos). Valores leídos en pantalla sobre fotogramas completos (ffmpeg); entre corchetes, el segundo del fotograma.
Las dos partes trabajan en **Eevee** y en vista *Rendered* (Z → Rendered) para ver los cambios al instante.

## Parte 10: cámara

### Ver por la cámara y encuadre
- 0:22 Numpad 0 (o el icono de cámara) = ver por la lente. Shift+A → Camera agrega otra.
- 1:45 Camera props → Viewport Display → **Passepartout al máximo (1.0)**: todo lo que queda fuera del cuadro se ve negro. Ella lo deja siempre así para saber qué entra en el plano.
- 2:44 Dos viewports: el izquierdo libre, el derecho fijo en Numpad 0 (como el workspace *Animation*, pero al revés).

### Mover la cámara (3 formas)
1. 2:23 Como cualquier objeto: G / R.
2. 3:28 N → View → **Lock Camera to View**: la cámara sigue la navegación del viewport (orbitar, zoom). Aviso: es fácil olvidarlo encendido y arruinar un plano ya keyado → apagarlo al terminar.
3. 4:30 **Shift+` (tilde, debajo de Esc) = modo fly**, el que ella usa casi siempre: WASD, ratón para mirar, Q baja / E sube, rueda = velocidad, Shift más rápido, Alt más lento, clic izquierdo confirma. Después, ajuste fino de la rotación en N → Item → Rotation arrastrando con Shift [6:12].

### Animar la cámara
- 6:37 Auto Key encendido; se necesita un primer key: I → Location, Rotation & Scale en el frame 1. Ir al **frame 30**, mover con Shift+` → se crea el key solo. P + caja = preview range sobre esos 2 keys. Rango de la escena 1–30 [665–700 s] → **un movimiento de 30 frames (1 s a 30 fps)**.
- 11:44 Graph Editor: las transformaciones del objeto y los valores de la cámara (focal, foco, f-stop) son curvas separadas. Interpolación **Bézier** por defecto (ease in/out); key activo frame 30, X Euler 65.7° [725].

### Lente (zoom = focal length)
- 7:27 Focal Length en mm = el zoom. Default **50 mm** (Backspace sobre un campo lo vuelve al default).
- 8:15 Extremos mostrados: **9–10 mm "súper ojo de pez, muy raro, no lo uses seguido"** [497] y **150–155 mm "zoom extremo, foto de fauna"** [515]. Clip Start 0.1 m / End 100 m (default).
- 11:03 **Zoom animado**: hover sobre Focal Length, I en el frame 1 (50 mm), frame 30 → **59.5 mm** (key automático) [680–745] mientras la cámara orbita → "zoom genial, como girar alrededor del cubo acercándose". Es un zoom del ~19 % en 1 s.

### Profundidad de campo (DOF)
- 8:37 Depth of Field ✓. **F-Stop = cantidad de desenfoque** (default 2.8; más bajo = más blur). Focus Distance = el plano de foco (como mirar un dedo delante de la cara y que el fondo se desenfoque). También hay *Focus on Object* (cuentagotas).
- 9:18 Demo: F-Stop **0.1** (ridículamente bajo), Focus Distance 10 m → **12 m** deja solo una esquina del cubo nítida [565–630]. Subir el f-stop = todo en foco.
- 10:21 **Blades** (aperture) = bokeh poligonal; sutil en Blender, se nota con luces brillantes o zonas sobreexpuestas detrás. Ella lo deja subido.
- 11:23 **Rack focus animado**: keys en frames 1 y 30 de Focus Distance **12 m → 41 m** (o el f-stop): el plano arranca borroso y termina "nítido como alfiler".

### Cortes de cámara
- 12:26 En el cine real cada ángulo es otra cámara (ej.: plano cenital y en el siguiente plano un ángulo bajo mientras ella gira).
- 13:28 **No cortar saltando keys de una misma cámara** (key en frame 30 y teletransporte en 31): (1) el motion blur interpreta un movimiento rapidísimo y ese frame sale arruinado; (2) no se puede alargar ni retocar el timing sin que el salto se convierta en una transición.
- 14:33 **Solución: una cámara por plano + markers.** Frame 1 → seleccionar Camera → Marker → *Bind Camera to Markers* (Ctrl+B); frame 31 → seleccionar Camera.001 → Bind. Camera.001 tiene otra lente (**101 mm**, foco 12 m) [905] y un movimiento lento hacia la derecha. Escena de 250 frames. Es como ella recomienda hacer todos los cortes.

## Parte 11: iluminación de personaje

Personaje: base mesh anime de Kaoru Sakaki (FBX en la descripción).

### Preparación
- 1:38 Render Engine **Eevee**. 2:02 Solid no tiene información de luz → Z → Rendered.
- 2:43 Render → Shadows: **Cube Size 4096 px y Cascade Size 4096 px**, Soft Shadows ✓ [230] (solo para que se vean nítidas en el tutorial; cuesta rendimiento).
- 3:29 Viewport Shading: *Scene World* apagado y fuerza del HDRI de preview **0.1** → el fondo no ilumina y se ve solo la luz que se agrega.

### Los 4 tipos de luz
| Luz | Qué importa | Valores mostrados | Uso |
|---|---|---|---|
| **Point** (default) | solo la **posición**; rotar no hace nada | default 10 W [255] → ~100 W [300], radio 0.1 m, color **naranja** | antorcha, farol, luciérnaga: luz esférica en 360° |
| **Sun** | solo la **rotación**; moverla no hace nada | Strength 5 (5.87) [505], ángulo 11.4°; ángulo default **0.526°** = sombras duras [900] | luz pareja en toda la escena, sombras duras |
| **Spot** | posición **y** rotación | ~180 W (181.67) [585], Spot Size **75° → 10.2°** [640], Blend **0.15** (borde duro) → **0.41** (gradiente suave) [690], luego ~600 W y color **celeste** [710] | luz de escenario con viseras: iluminación localizada |
| **Area** | posición, rotación y **tamaño** | formas Rectangle/Square/Disk/Ellipse; 0.1 m → **1.44 × 1.29 m**, ~58 W ("100 más o menos") [880] | más grande = transición luz/sombra más gradual; chica = sombra más dura |

- **Shift+T** (o arrastrar el punto amarillo del gizmo) = **apuntar la luz** a un punto de la malla [9:02]. Ideal para sun y spot.
- 6:18 **Contact Shadows** (por luz): sombras de raytracing en espacio de pantalla para dedos, entrepierna, bajo el cuello. Distance 0.2 m, Bias 0.03, Thickness 0.2 m [505]. Se nota mucho con el sol. Cuesta rendimiento: no en todas las luces. Shadow Clip Start 0.05 m, Bias 1.0.
- 11:29 Multiplicadores **Diffuse / Specular / Volume** por luz: Diffuse 0 = esa luz solo deja el brillo especular [710]; se puede subir a 2 para exagerar. "Art hack" para controlar cómo cada luz toca los materiales.

### Receta de retrato (14:48–15:57)
1. **Key**: Area **Rectangle 1.44 × 1.29 m, ~58 W, tinte celeste** [930], movida con G y apuntada a ella con Shift+T, al frente-lado.
2. **Rim (contraluz)**: un **Sun detrás y arriba** del personaje (Shift+T para orientarlo), **Strength 10**, ángulo 0.526° [975] → "rim lighting rápido", un borde de luz que marca la forma.
3. **Fill**: **Spot** del lado en sombra, Shift+T a la zona oscura, potencia 11.9 W → **~159 W**, Size 45°, Blend 0.15, radio 0 [945–958].
Resultado: retrato suave con un highlight alrededor que acentúa la silueta.

### Animar luces (15:58)
- Shift-seleccionar todas las luces → I → LocRotScale en el frame 1, Auto Key, en el **frame 30** mover/re-apuntar (Shift+T) → el esquema de luz cambia en 1 s.
- Cualquier valor se anima con hover + I: **Sun Strength 10 (f1) → 0 (f30)** = el sol se apaga gradualmente [1020].

## Patreon (ya leído)
- **FOV**: FOV alto / lente corta **exagera los miembros cercanos y achica el cuerpo lejano** → bueno para planos de acción cercanos, malo para planos normales del personaje. FOV bajo / lente larga **comprime**, se ve más 2D. Probar BAJO / MEDIO / ALTO. **Revisar el FOV antes de remodelar** (muchas "proporciones raras" son la lente).
- **Luz de 3 puntos** (key, fill, back): key y fill se pueden **emular en la textura**. El **bloom** puede dar un look suave de anime de los 90, "de sueño", si se controla. Perfil de color **Standard** para colores exactos (Filmic lava los colores); probar *looks* como **Medium High Contrast**.

---

## Para nuestro proyecto (three.js PS1, 9:16, 360×640, explainers sinaboto con NETO512)

### 1. Convertir mm a `fov` de three.js
`PerspectiveCamera.fov` es el **FOV vertical** en grados. En Blender con Sensor Fit **Auto** y sensor **36 mm**, el sensor se aplica al **lado más largo**; en un cuadro vertical 9:16 ese lado es la **altura**:

```
fov_vertical = 2 · atan( 18 / f_mm ) · 180/π        (36/2 = 18)
f_mm         = 18 / tan( fov_vertical / 2 )
fov_horizontal = 2 · atan( tan(fov_v/2) · 9/16 )
```

- Equivalente en three.js: `cam.filmGauge = 36; cam.setFocalLength(f)` (three usa `filmGauge / max(aspect,1)` = 36 en vertical; su default es 35, ~3 % de diferencia).
- Ojo: una lente de Blender en un render **horizontal** 16:9 tiene `fov_v = 2·atan(10.125/f)`; "50 mm" no se ve igual en vertical que en horizontal. Comparar por FOV, no por mm.

| mm | fov vertical (9:16) | sensación |
|---|---|---|
| 10 | 122° | ojo de pez (ella: no usar) |
| 18 | 90° | gran angular extremo |
| 24 | 74° | gran angular (acción) |
| 28 | 66° | |
| 35 | 54° | normal-ancho |
| 40 | 48° | **nuestro shot B** |
| 47 | 42° | **nuestro shot A** |
| 50 | 40° | default de Blender |
| 60 | 33° | su zoom 50→59.5 mm |
| 85 | 24° | retrato |
| 100 | 20° | su Camera.001 (101 mm) |
| 150 | 14° | tele extremo |

Nuestras cámaras actuales (`shots.js`): 42° ≈ 47 mm, 46° ≈ 42 mm, 48° ≈ 40 mm, 50° ≈ 39 mm → todo en "lente normal". Sirve para cuerpo entero; para primeros planos falta bajar el FOV.

### 2. Qué FOV vertical para cada tipo de plano
| Plano | fov vertical | ≈ mm | Por qué |
|---|---|---|---|
| **Establishing** / corte de la casa / exterior | 30–40° desde lejos (o 45–50° si hay que meter mucho en la escena) | 40–60 | más lejos y más cerrado = más plano, se ve como diorama; el shot B (48°, cámara a 23 m) está bien |
| **Cuerpo entero** (ella en la habitación) | **36–42°** | 47–55 | proporciones fieles, nada se deforma; 42° es nuestro valor bueno |
| **Plano medio** (cintura) | 30–36° | 55–65 | |
| **Primer plano de cara/expresión** | **20–28°** con la cámara más lejos | 70–100 | comprime, "más 2D/anime"; la cara de sprites 32 px necesita ocupar mucho cuadro para leerse a 360 px de ancho |
| **Acción / impacto** (sierra en alto, mano hacia la cámara, susto) | **60–75°** con la cámara muy cerca | 24–28 | exagera el miembro cercano (Patreon); un solo plano y corto, nunca para planos normales |

- Antes de tocar el modelo porque "se ve raro", probar el mismo plano a BAJO/MEDIO/ALTO (ej. 25° / 42° / 65°) y elegir.
- Para mantener el tamaño del personaje al cambiar el FOV: distancia nueva = distancia × tan(fov_viejo/2) / tan(fov_nuevo/2).

### 3. Movimiento de cámara en planos de 2–4 s
- Crashsune: 1 key en f1 y otro en **f30** (1 s), Bézier con ease in/out. En nuestros planos el movimiento **cruza el corte**, así que **velocidad constante (lineal) durante todo el plano**: sin arrancar ni frenar dentro del plano (un ease-in "frena" la imagen justo en la disolvencia).
- **Empuje lento**: el personaje debe crecer **5–8 % en todo el plano** (≈ 2–3 %/s). Con dolly: `d(t) = d0 · (1 − 0.025·t)`. Con zoom (como su 50→59.5 mm): `fov(t) = 2·atan(tan(fov0/2) / (1 + 0.025·t))`. El dolly da paralaje (mejor en habitaciones con muebles cerca); el zoom de FOV es plano (mejor en el corte de la casa). Nuestros shots A/C/D (−0.04 a −0.06 m/s a 2–4.6 m) ya están en ese rango.
- El motor disuelve **0.3 s centrados en el corte** (`main.js`, TR = 0.3): `update(lt)` recibe `lt` desde **−0.15 s** hasta `dur + 0.15`. La fórmula de cámara tiene que funcionar ahí (lineal sí; un `ease(clamp01(lt/…))` congela la cámara durante la disolvencia).
- Planos de acción: **snap-zoom** de 6–9 frames (0.2–0.3 s) con ease-out (FOV 55→40° o dolly rápido) y después quieto o empuje lento. Es su zoom animado comprimido.
- Rack focus (su 12→41 m) en nuestro motor = **animar la niebla** (`fog.near/far`), como ya hace el shot C con el humo.
- El vertex snapping del motor (pendiente en la guía) hace temblar la geometría con la cámara en movimiento: con empujes lentos el temblor PS1 se nota y es buscado; no hace falta movimiento extra.

### 4. Reglas de corte
1. **Una cámara por plano** (ya es así: cada shot crea su `PerspectiveCamera`). Nunca teletransportar una cámara dentro de un plano: el corte es siempre cambio de shot (la regla de los markers de Crashsune).
2. Cada corte cambia **ángulo ≥ 30°** o **escala de plano** (general ↔ entero ↔ cara); dos encuadres casi iguales seguidos = salto feo.
3. Cortar **sobre la palabra** de la voz (`words.js`) o sobre una acción (encender el fósforo, levantar la sierra).
4. Secuencia típica: establishing (contexto) → cuerpo entero (qué hace) → cara (reacción) → acción/detalle. Máximo un plano gran angular de acción seguido.
5. Regla general (no del video): mantener la dirección de pantalla (eje de 180°) entre planos de la misma escena.

### 5. Receta de luz (MeshLambert / unlit)
Hoy: Hemisphere 1.3–2.0 + una Directional 1.2–1.6 por escena. Receta de 3 puntos adaptada:

```js
// fill/ambiente: cielo tibio arriba, suelo oscuro del color del piso
scene.add(new THREE.HemisphereLight(0xfff2e0, 0x5a4636, 1.4));
// key: frente-lado, 45° arriba (su Area celeste a 45°); 1.0–1.4 si la textura ya trae sombra pintada
const key = new THREE.DirectionalLight(0xfff0dd, 1.2); key.position.set(2, 3, 2); scene.add(key);
// rim: detrás y arriba del personaje, del lado opuesto a la cámara (su Sun Strength 10 detrás)
const rim = new THREE.DirectionalLight(0xbfe0ff, 2.5);
rim.position.copy(girlPos).sub(cam.position).setY(0).normalize().multiplyScalar(3).add(girlPos).add(new THREE.Vector3(0, 2.5, 0));
rim.target.position.copy(girlPos); scene.add(rim, rim.target);
```

- Con Lambert, una directional desde atrás solo ilumina las caras que miran hacia los costados/atrás → en low poly da **bandas de luz en hombros, pelo y brazos**: es el rim. Color de contraste (frío si la escena es cálida, y al revés), 2–3× la intensidad del key. Funciona mejor sobre fondos oscuros (ático del shot D).
- **Rim por shader** (alternativa, no probada, three r180): en `material.onBeforeCompile` reemplazar `#include <opaque_fragment>` por `outgoingLight += rimColor * pow(1.0 - saturate(dot(geometryNormal, geometryViewDir)), 3.0);\n#include <opaque_fragment>` (declarar `uniform vec3 rimColor`). Con caras planas el rim sale escalonado por polígono, que es lo PS1.
- **Key y fill van en la textura** (Patreon + NETO): la capa `base` de NETO ya tiene sombra pintada en 3 tonos. Para que mande la textura: hemisferio alto y key suave (relación ≈ 1.4 : 1.2), o el personaje en `MeshBasicMaterial` (unlit) y solo el rim por shader. Los escenarios con luz falsa por vertex colors (guía, punto 6).
- **Point light = fuego/farol** (como su point naranja): `PointLight(0xff7a20, 3, 3)` del shot C es correcto; animar `intensity` con parpadeo (±20 % cada 2 frames, como la textura del fuego). **Spot** para un momento de "foco" (revelación, el personaje solo en la oscuridad): `angle` 10–45°, `penumbra` 0.15 (borde duro, su Blend 0.15) o 0.4 (suave).
- Animar la luz como ella (sun 10 → 0 en 30 frames): bajar la luz de la escena en 1 s cuando se apaga el fuego, se hace de noche, etc.
- Sombras: sin shadow maps (a 360×640 serían bloques); en su lugar un disco oscuro bajo los pies (el equivalente barato de sus contact shadows).
- Color: **Standard = `renderer.toneMapping = THREE.NoToneMapping`** (ya es el default; nunca ACES/AgX, lavan los colores). Para un look "Medium High Contrast", una curva S suave en el post de `main.js` antes del 15-bit, no tone mapping.

### 6. DOF y bloom a 360×640
- **DOF: no.** Un blur de 2–3 px a 360 de ancho, escalado ×3 nearest, se vuelve manchas de bloques y rompe el dither Bayer y la nitidez de los sprites de la cara; la PS1 no tenía DOF. Para separar personaje y fondo: lente larga (fondo más chico y menos detallado), fondo más oscuro/desaturado, o niebla (`scene.fog`).
- **Bloom: opcional y solo en planos puntuales** (fuego, ventana, "sueño"/recuerdo). Hacerlo a baja resolución: umbral alto (solo píxeles casi blancos/fuego), halo de 1–2 px, intensidad ≤ 0.3, **antes** de la cuantización a 15 bit para que el dither rompa las bandas. Por defecto apagado (la guía: sin bloom; Sunny y Crashsune coinciden en el look PS1 limpio).
