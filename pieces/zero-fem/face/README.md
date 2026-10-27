# Expresiones faciales — zero_fem

Técnica: el Head mesh tiene dos materiales nuevos con su propio atlas. Cada atlas mide 1024x64 y tiene 16 celdas de 64x64. Cada celda es una copia completa del bloque de la cara de la textura de 192 px (x 0-64, y 112-176, el mismo layout que `IndividualTextures/Face.png`) con una expresión pintada. Para cambiar de expresión basta con mover `material.map.offset.x = celda / 16`. Las posiciones de los vértices no cambian. Solo cambian el material y la UV de esos polígonos, y la celda 0 es un recorte exacto de `tex/ZeroVolnuttTexture.png`, así que la cara neutra es la de la textura base.

Comparada con el GLB anterior a las expresiones, la cara neutra solo cambia en las esquinas exteriores de los ojos, por la segunda pestaña: 108 píxeles del render. Además hay 43 píxeles con una diferencia de 2/255 o menos, que es ruido del antialiasing.

| material     | polígonos de Head                                   | atlas            |
|--------------|-----------------------------------------------------|------------------|
| `face_eyes`  | 14, 47 (frente/cejas), 28, 62 (ojos)                | `face_eyes.png`  |
| `face_mouth` | 4, 9, 12, 13, 20 + espejo 37, 42, 45, 46, 54 (mejillas, boca, mentón) | `face_mouth.png` |

La nariz (15, 16, 48, 49) y todo lo demás se quedan con el material `Zero`.

## Celdas y offset

| celda | offset.x | ojos (`face_eyes`) | boca (`face_mouth`) |
|------:|---------:|--------------------|---------------------|
| 0 | 0.0000 | `open` (actual, con pestañas) | `neutral` (actual) |
| 1 | 0.0625 | `half` (párpado a media altura; sirve de intermedio del parpadeo) | `smile` |
| 2 | 0.1250 | `blink` (cerrado, línea curva con pestañas) | `smileOpen` |
| 3 | 0.1875 | `happy` (^ ^) | `talkA` |
| 4 | 0.2500 | `surprised` (iris pequeño, cejas arriba) | `talkO` |
| 5 | 0.3125 | `angry` (cejas abajo, párpado inclinado) | `surprised` (O grande) |
| 6 | 0.3750 | `sad` (cejas preocupadas, párpado caído por fuera) | `frown` |
| 7 | 0.4375 | `wink` (cierra el ojo derecho de la pantalla) | `shout` (con dientes) |
| 8 | 0.5000 | `hearts` (iris rosa redondeado con corazón blanco) | `blep` (sonrisa :) con la lengua rosa afuera) |
| 9 | 0.5625 | `shocked` (círculo negro garabateado con el vacío blanco, sin pupila) | `cat` (sonrisa :3 / ω) |
| 10 | 0.6250 | `dizzy` (espiral) | `gasp` ("o" pequeña y redonda) |
| 11 | 0.6875 | `relaxed` (cerrados, líneas finas y suaves) | `bigShock` (boca grande, oscura y abierta) |
| 12 | 0.7500 | `disgust` (ojos entrecerrados: párpado bajo inclinado hacia la nariz, párpado inferior subido por la mejilla, cejas de enfado) | `disgust` (mueca ondulada con las comisuras hacia abajo y la punta de la lengua del lado derecho de la pantalla) |
| 13-15 | 0.8125-0.9375 | libres (copia de `open`) | libres (copia de `neutral`) |

Parpadeo recomendado: `open → half → blink → half → open`, unos 40 ms por paso.

Pestañas: todos los ojos abiertos o cerrados tienen el ala exterior y, debajo de ella, una segunda pestaña más corta que sale del contorno del ojo. La segunda pestaña se pinta en `lashes.py`, en la etapa 2. En `half` y `sad` baja 2 y 3 px para no pegarse al párpado. `lash2_compare.png` muestra la textura base antes y después, ampliada 10x.

## Flujo

```
python lashes.py                                             # tex/ZeroVolnuttTexture.png (pestañas 1 y 2)
blender -b <ZeroVolnutt.blend> --python feminize.py -- out   # cuerpo femenino + textura base
python face/build_face.py      # pinta atlas + divide materiales en out/zero_fem.blend y reexporta out/zero_fem.glb
python face/render_faces.py    # verifica: face/expressions.png (todas las expresiones + combos en 3D)
python face/render_faces.py out/zero_fem.glb --compare <otro.glb>   # compara la cara neutra con otro GLB
```

- `paint_face.py` contiene el pixel art: una rejilla de caracteres por expresión para el ojo izquierdo, que se espeja a `63-x`. Usa la paleta del modelo: pestaña (38,20,26)/(92,44,40), contorno (128,106,80) y ceja (191,117,0). El AA va al 43 % y al 25 % sobre la piel que hay debajo, que es como lo hizo el autor. Los colores nuevos son la lengua (214,104,92), los rosas de `hearts`: (150,30,80), (222,70,130) y (255,150,190), y la lengua de `blep`: (236,104,120) con línea central (176,52,72).
- `build_face.py` es idempotente: si el Head ya está dividido, solo refresca las imágenes, y si cambia el número de celdas reescala la u. Hay que correrlo otra vez cada vez que se corra `feminize.py`.
- `atlas_preview.png` muestra los atlas ampliados 6x.

## three.js

```js
import * as THREE from 'three';

const CELLS = 16;                                // celdas por atlas
const FACE = {
  face_eyes:  ['open', 'half', 'blink', 'happy', 'surprised', 'angry', 'sad', 'wink',
               'hearts', 'shocked', 'dizzy', 'relaxed', 'disgust'],
  face_mouth: ['neutral', 'smile', 'smileOpen', 'talkA', 'talkO', 'surprised', 'frown', 'shout',
               'blep', 'cat', 'gasp', 'bigShock', 'disgust'],
};

// setFace(root, { eyes: 'hearts', mouth: 'blep' })  — root = gltf.scene o un clon (SkeletonUtils.clone)
export function setFace(root, { eyes, mouth } = {}) {
  root.traverse((o) => {
    if (!o.isMesh) return;
    const list = Array.isArray(o.material) ? o.material : [o.material];
    list.forEach((m, i) => {
      const cells = FACE[m.name];
      if (!cells) return;
      if (!m.userData.faceOwn) {                 // material + textura propios por personaje
        m = m.clone();
        m.map = m.map.clone();
        m.map.magFilter = m.map.minFilter = THREE.NearestFilter;
        m.map.generateMipmaps = false;
        m.map.flipY = false;                     // glTF
        m.map.needsUpdate = true;
        m.userData.faceOwn = true;
        if (Array.isArray(o.material)) o.material[i] = m; else o.material = m;
      }
      const want = m.name === 'face_eyes' ? eyes : mouth;
      const k = cells.indexOf(want);
      if (k >= 0) m.map.offset.x = k / CELLS;
    });
  });
}
```

## Límites

- El flequillo del modelo tapa casi todas las cejas y la mitad exterior del ojo izquierdo de la pantalla. Por eso `angry` y `sad` se leen sobre todo por la inclinación del párpado y por la punta interior de la ceja.
- La esquina exterior del ojo está justo en el borde del polígono: la columna x=6 de la textura se ve solo a medias y x≤5 no se ve. Por eso la segunda pestaña es corta y casi vertical.
- `wink` cierra solo el ojo derecho de la pantalla, porque el izquierdo queda casi tapado por el flequillo. Quedan 3 celdas libres por atlas (la 12 es `disgust`, añadida para digger-01 v3; `expressions.png` incluye `disgust + disgust`).
- Los índices de polígonos están fijos para este Head (111 polígonos). `build_face.py` se detiene con un assert si el mesh cambia.
