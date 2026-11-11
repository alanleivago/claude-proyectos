# Color de Ricks Clips: estudio medido (2026-11-10)

Fuentes:
- Los 5 fotogramas que mandó el usuario: `pieces/lost-luggage/qa/ricks_ref_1..5.png` (campo con caballete, calle del oeste al atardecer, lobby con vidrio al atardecer, fábrica azul con máquina amarilla, primer plano de oficina).
- 78 fotogramas de los 3 shorts documentales (uno cada 2,5 s): `refs-ext/ricks-docs-cam/` (cañón y vías, prisión, barco). Solo local.
- Medido con `colstats.py` (luminancia, saturación por tercios de luz, tono de sombras y luces, perfil vertical), sin la UI del reproductor ni la franja del subtítulo.

Por qué se hizo: el usuario rechazó lost-luggage v4 ("solo subiste la luz y la saturación a todo y se ve mal"). Había zonas quemadas: el piso a 0 s y el documento a 5 s.

## 1. Números clave (Ricks contra la nuestra)

| | Ricks (5 refs) | Ricks (docs) | nuestra v4 | nuestra v5 |
|---|---|---|---|---|
| L p5 / p50 / p95 / p99,5 | 0,17 / 0,55 / 0,85 / 0,94 | 0,15 / 0,44 / 0,82 / 0,94 | 0,15 / 0,54 / 0,95 / 0,99 | 0,13 / 0,42 / 0,84 / 0,93 |
| % de píxeles casi blancos (L > 0,93) | 3,7 | 4,3 | 12,1 (documento 36, factura 44) | 3,1 (las cabezas) |
| saturación oscuros / medios / luces | 0,60 / 0,47 / 0,32 | 0,62 / 0,53 / 0,30 | 0,75 / 0,58 / 0,27 | 0,62 / 0,52 / 0,28 |
| (b−r) en luces (negativo = cálido) | −0,21 | — | −0,16 | −0,17 |

v4 y v5 se midieron igual: 26 cuadros sacados del mp4.

Lectura:
- **Nada se quema.** El p99,5 queda en ~0,93-0,94 y lo único casi blanco son las cabezas (#f4f1f0, L 0,95).
- **Los papeles son crema o lavanda con gradiente**, nunca 255. El escritorio blanco de la ref 5 va de #eeebf0 (L 0,93) a #cecdd9 (L 0,83).
- **Los oscuros están levantados y tienen color** (p5 ~0,15): no hay negro aplastado. Las sombras de una pared de madera caen a marrón profundo (#6f3a1b) y la sombra de un edificio al atardecer a ciruela (#321c2c).
- **Saturación:** los medios y los oscuros son ricos y las luces pierden saturación (0,3). v4 tenía los oscuros sobresaturados (0,75) y las luces planas y quemadas.

## 2. Cálido contra frío (el corazón del look)

- **La luz es cálida y la sombra fría.** Muestras de la ref 2 (atardecer):
  - suelo al sol #d89146, tono 30;
  - suelo en sombra #555177, tono 246.
  - Son complementarios y el valor de la sombra queda en ~0,6 del de la luz.
- **Ref 3 (lobby):**
  - piso al sol #dca05a;
  - sombra de los marcos de la ventana #a98174: malva desaturado, no negro, valor ~0,85.
- **Ref 4 (fábrica):**
  - pared ultramar, de #285bb8 arriba a #3976e3 en el centro iluminado;
  - máquina amarilla, de #f6a400 a la luz a #5a3d15 en sombra (marrón cálido, más profunda);
  - piso naranja #b34d20.
- **Cada escena tiene 2 tonos dominantes complementarios y un acento:**
  - azul y naranja (fábrica, cañón);
  - violeta y naranja (atardeceres);
  - cian y rosa (prisión);
  - azul cobalto y madera cálida (barco).

## 3. Gradientes ("fades")

- **Cielo diurno (ref 1):**
  - arriba #85c7fe, celeste saturado;
  - medio #b3ccdf, lechoso;
  - horizonte #b7d6e1, con neblina fuerte.
  - El campo lejano también se aclara y pierde saturación (#9acb8c).
  - En los shorts del cañón el cenit es cobalto profundo.
- **Atardecer (ref 2):**
  - arriba #5273b6;
  - medio #8993bb;
  - banda durazno #d39a63;
  - halo del sol #ffce7b.
- **Lobby (ref 3):** por el vidrio, malva arriba (#937889) y banda naranja (#ea9037).
- **Paredes:** más claras donde pega la luz (charco) y más oscuras y frías hacia arriba. En los interiores cálidos (galera del barco), la pared va de crema junto a la lámpara a marrón anaranjado abajo.
- **Perfil vertical típico del cuadro:** frío arriba, cálido en el medio u horizonte, y abajo más oscuro o frío.

## 4. Nubes

- Cúmulos pintados y blandos:
  - copa blanca-crema iluminada (#e1e8f1);
  - panza lavanda-gris;
  - bordes suaves;
  - bultos internos apenas marcados.
- Cerca del horizonte son más chicas, más planas y más perdidas en la neblina, en bancos largos.
- Nada de "burbujas" con contorno.

## 5. Lente

- Hay un ojo de pez muy leve. Las vías y los bordes de los edificios se curvan un poco hacia afuera en los planos generales (7xS).
- Encima de eso, el FOV es angular.

## 6. Recetas aplicadas (lost-luggage v5)

Módulos opt-in en `styles/cartoon3d/`:
- **`color.js`**:
  - `c3Grade(spec)` es UNA pasada sobre el cuadro compuesto, antes de los subtítulos (así no se deforman). Hace, en orden:
    - exposición;
    - split tone (sombra fría, luz cálida; los colores saturados conservan su tono, para que un rojo oscuro no se vuelva magenta);
    - lift de color aditivo (p5 ~0,15);
    - saturación según la luminancia;
    - hombro fílmico por canal (el blanco termina en ~0,93);
    - degradado de pantalla y glow radial;
    - viñeta;
    - barrel de 0,12 (las esquinas quedan fijas y el centro abomba ~4 %);
    - dither para que los gradientes no hagan bandas.
  - `c3ColorWorld(spec)` pinta fades en el mundo: paredes de arriba a abajo, pisos de cerca a lejos desde un punto y techos.
- **`setlook.js`**: uniforms nuevos `c3WT/c3WB/c3FN/c3FF/c3CE`, en blanco por defecto, así que no cambia nada si no se usan.
- **`exterior.js`**: `c3SkyDome({ paint: true, ... })`:
  - cielo de 3 paradas (cenit, medio, horizonte) con glow cálido del lado del sol;
  - nubes `c3PaintedCloudTex`: luz en rgb y cobertura en alfa, coloreadas por escena, 6144×1000 (~17 px/grado), bancos en el horizonte y cúmulos altos.
- **`toon.js`**: `over: true` en un brazo hace que su mano se dibuje encima de la valija que sostiene la otra mano. Es aditivo.

Guion de color por set (en `pieces/lost-luggage/src/shots.js`, objeto `COLOR`):
- **Aeropuerto:** golden hour.
  - Sol bajo #ffc47c y relleno azul-violeta #8e96e2.
  - Cielo de cenit #3a58b8 a horizonte #f4b47c.
  - Vidrio con banda naranja (ref 3).
- **Calle (Alabama):**
  - sol #ffdcaa y cielo cobalto suave de #6098dc a #c6dcec, con cúmulos pintados;
  - sombras azules y niebla aérea.
- **Clasificación (fábrica):** pared de bloque ultramar #3366cc, zócalo teal, piso de epoxi terracota y charcos de luz amarilla (ref 4).
- **Tienda:** pared ocre saturada, piso de baldosa cálida, alfombra roja anaranjada (#c4301c) y sol por la vidriera.
- **Museo:** pared teal y damasco carmesí, charcos ámbar #ffc890, relleno azul profundo y aire azul-violeta.

## 7. Errores a no repetir

- **No subir el brillo con CSS** (`brightness()`, ni `toneMappingExposure` alto sobre filtros): recorta los blancos. Para eso está la curva con hombro.
- **El catcher de sombras (ShadowMaterial) no puede ser azul saturado:** se mezcla encima del rojo y lo vuelve magenta. Ese era el "carpet magenta". Hay que usar un azul casi negro (#1e1e40) y que el color frío venga de la luz de relleno.
- **El lift con `max(s, lift)` tiñe de azul los rojos medios.** Tiene que ser aditivo y pesado por (1 − saturación).
- **El relleno lavanda tiñe las caras.** Se arregla con una luz ambiente neutra-cálida solo en la capa de personajes (`face` en `COLOR`).
