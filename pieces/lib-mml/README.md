# lib-mml — biblioteca de modelos PS1 (relleno con recolores)

> **Origen:** estos modelos estan ripeados de **Megaman Legends (Capcom, PS1)** (ripeos de la comunidad; la textura de la papelera trae el credito "Alfred (Pardall) / alfredbaudisch.itch.io"). El usuario decidio usarlos como **relleno de fondo**, siempre con recolores para que no parezcan los del juego original. No usarlos como protagonistas ni en material que se presente como propio.

Fuente (solo lectura): `F:\Claude Proyectos\assets\mm12-extracted\`

## Contenido

| Carpeta / archivo | Que es |
|---|---|
| `models/<id>.glb` | un GLB por modelo, con la textura original embebida |
| `textures/<tex>_orig.png` | textura original (para volver al color original) |
| `textures/<tex>_<variante>.png` | variantes recoloreadas |
| `variants.json` | lista de variantes por textura |
| `preview.png` | hoja de contacto: todos los modelos y variantes (vista 3/4, sin luces) |
| `previews/` | renders sueltos de la hoja |
| `data/stats.json` | tris, medidas, factor de escala, huesos por modelo |
| `data/uv_<id>.json`, `data/mask_<tex>.png` | datos intermedios del recoloreo (mascara usada) |
| `build.py`, `recolor.py`, `preview.py`, `sheet.py` | scripts (ver "Regenerar") |

## Modelos

Medidas en metros: ancho (X) x largo (fondo) x alto. Todos miran hacia **+Z en three.js** (= -Y en Blender), origen en el **centro de la base** (apoyan en y=0).

| id (GLB) | Textura (`<tex>`) | Medidas (m) | Tris | Textura px | Rig / animaciones | Variantes |
|---|---|---|---|---|---|---|
| `frog` | frog | 0.07 x 0.08 x 0.02 | 127 | 128x128 | si, 8 huesos / ninguna | — |
| `hawk` | hawk | 1.46 x 0.50 x 0.13 (alas abiertas) | 26 | 128x128 | 1 hueso (inutil) / ninguna | — |
| `hound` | hound | 0.29 x 0.73 x 0.70 | 189 | 128x128 | si, 11 huesos / ninguna | — |
| `seagull` | seagull | 0.95 x 0.40 x 0.07 (alas abiertas) | 44 | 64x64 | si, 5 huesos / ninguna | — |
| `bank_teller` | bank_teller | 0.70 x 0.39 x 1.65 | 231 | 256x128 | si, 11 huesos / ninguna | navy, olive, grey |
| `art_student` | art_student | 0.40 x 0.41 x 1.64 | 238 | 256x256 | si, 11 huesos / ninguna | teal, rose, violet |
| `homework_girl` | homework_girl | 0.40 x 0.47 x 1.62 | 239 | 256x128 | si, 11 huesos / ninguna | blue, green, red |
| `old_woman_sitting` | old_woman_sitting | 0.55 x 0.69 x 1.46 (incluye el taburete) | 253 | 176x130 | si, 7 huesos / ninguna | green, blue, brown |
| `trashcan` | trashcan | 0.90 x 0.82 x 0.90 | 28 | 256x128 | no | green, grey |
| `trashcan_open` | trashcan | 0.90 x 0.82 x 0.82 | 18 | 256x128 | no | green, grey |
| `trashcan_lid` | trashcan | 0.90 x 0.82 x 0.08 | 20 | 256x128 | no | green, grey |
| `red_car` | red_car | 2.57 x 4.20 x 2.31 | 188 | 256x256 | no | white, skyblue, darkgreen, grey |
| `mini_red_car` | mini_red_car | 2.50 x 3.80 x 2.16 | 178 | 256x256 | no | white, skyblue, darkgreen, grey |
| `blue_pickup` | blue_pickup | 3.00 x 5.00 x 2.50 | 174 | 256x256 | no | white, mustard, darkgreen, grey |
| `yellow_pickup` | yellow_pickup | 3.00 x 5.00 x 2.50 | 174 | 256x256 | no | white, skyblue, darkgreen, grey |

Notas:
- **Rigs:** los .dae de animales y NPCs traen esqueleto con skin rigido (cada vertice a 1 hueso, peso 1), pose de reposo, **sin ninguna animacion**. Los GLB llevan el skin (huesos `Bone000`...). El halcon solo tiene 1 hueso (equivale a no tener rig). Coches y papelera: sin rig.
- **Escala:** los NPCs comparten el mismo factor del juego (el cajero = 1.65 m); por eso la nina y la estudiante salen ~1.62-1.64 m y la anciana sentada 1.46 m con el taburete. Coches: rojo 4.2 m, mini 3.8 m, pickups 5 m (las pickups comparten factor). Las proporciones de los coches son de juguete (anchos y altos), es el estilo del original.
- **Papelera abierta + tapa:** la tapa va encima de `trashcan_open` a **y = 0.818 m**. `trashcan` es la cerrada en una pieza.
- **Escala de nuestras escenas:** `zero_fem` mide 13.2 unidades Blender ≈ 1.6 m → **8.25 unidades por metro**. Si la escena usa esa escala: `model.scale.setScalar(8.25)`. Si la escena esta en metros, escala 1.
- **Material:** Principled con textura base, rugosidad 1, especular 0, filtro **Nearest** (pixeles duros), `alphaMode: MASK` (corte 0.5) y doble cara. Se ve bien con luz o sin ella; para look PS1 plano usar `MeshBasicMaterial` (ver abajo).
- Limpieza aplicada: transformaciones aplicadas, merge por distancia (en los rigs solo dentro del mismo hueso, para no romper el skin; no afecta a las UV), normales recalculadas, triangulado, sombreado plano. Se eliminaron unas pocas caras degeneradas del original (halcon, gaviota, anciana).

## three.js: cargar y cambiar variante

Un GLB por modelo; las variantes son PNG al lado. Se cambia `material.map`.

```js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const LIB = 'lib-mml/';
const loader = new GLTFLoader();
const texLoader = new THREE.TextureLoader();
const texCache = {};

function loadVariantTexture(tex, variant) {        // tex = columna "Textura", variant = 'orig' | 'white' | ...
  const key = `${tex}_${variant}`;
  if (!texCache[key]) {
    const t = texLoader.load(`${LIB}textures/${key}.png`);
    t.flipY = false;                                 // IMPORTANTE: las texturas de glTF no se voltean
    t.colorSpace = THREE.SRGBColorSpace;
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
    t.generateMipmaps = false;
    texCache[key] = t;
  }
  return texCache[key];
}

async function spawn(id, tex, variant = 'orig', { unlit = true, unitsPerMetre = 1 } = {}) {
  const gltf = await loader.loadAsync(`${LIB}models/${id}.glb`);
  const root = gltf.scene;                         // para varias copias del mismo GLB con rig: SkeletonUtils.clone(root)
  root.scale.setScalar(unitsPerMetre);             // 8.25 para escenas a la escala de zero_fem
  root.traverse((o) => {
    if (!o.isMesh) return;
    const map = loadVariantTexture(tex, variant);
    if (unlit) {
      o.material = new THREE.MeshBasicMaterial({ map, alphaTest: 0.5, side: THREE.DoubleSide });
    } else {
      o.material = o.material.clone();             // clonar: si no, todas las copias cambian a la vez
      o.material.map = map;
      o.material.needsUpdate = true;
    }
  });
  return root;
}

// ejemplo: pickup azul en blanco, papelera gris, cajero con ropa azul marino
scene.add(await spawn('blue_pickup', 'blue_pickup', 'white'));
scene.add(await spawn('trashcan', 'trashcan', 'grey'));
scene.add(await spawn('bank_teller', 'bank_teller', 'navy'));
```

`variants.json` tiene las variantes disponibles por textura (`orig` siempre existe).

## Regenerar

```
"C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" -b --factory-startup --python build.py     # GLB + stats + datos UV
python recolor.py                                                                                       # variantes PNG + variants.json
"C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" -b --factory-startup --python preview.py   # renders (comprueba que los GLB cargan)
python sheet.py                                                                                         # preview.png
```

- `build.py -- <id> ...` reconstruye solo esos modelos. Tamaños, orientacion (`rot_z`) y factores en la lista `MODELS`.
- Blender 5.x no trae importador COLLADA: `build.py` lee los .dae con un parser propio (geometria, UV, skin y jerarquia de huesos).
- `recolor.py`: mascaras por cobertura UV del modelo + tono/saturacion. Vehiculos y papelera: solo el tono dominante de la carroceria (ventanas, ruedas, cromados y luces quedan igual). NPCs: solo caras de los huesos del cuerpo (no la cabeza) y sin pixeles de tono piel; la ropa neutra (blanca/gris/negra) recibe un tinte suave. La silla de la anciana esta protegida (`PROTECT`). El sombreado y el dither se conservan porque se recolorea relativo a la mediana de cada mascara. Variantes nuevas: añadir entradas en `JOBS`.
