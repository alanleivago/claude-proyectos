---
type: spec
status: draft
tags: [ava-restfield, part-3, monster-design, stalker, ps1-low-poly, mansion]
relatedTo: [zombie-03-station, ava-rules, zombie-05-pt]
---

# El gigante ("the Stalker"): diseño

Ref del usuario: reel de Instagram DVMGtmtjYOS (un fan rehízo a Nemesis). Fotogramas en `ref/gigante_ref_tile.jpg`, que se queda local y no se sube.
Se toma el look y se quitan las marcas del personaje original: sin el símbolo de biohazard ni logos.

## Look (de la ref)
- Unos 2,6 m. Hombros enormes y anchos, cabeza chica sobre un cuello largo y venoso: la silueta es un triángulo invertido.
- Cabeza calva, piel arrugada color carne-violeta (#b79a9a, sombras #6e4a55). Grapas metálicas brillantes en zigzag sobre un ojo, desde la frente hasta la mejilla, y el otro ojo es blanco lechoso (#e8e4d8). Sin labios: dientes amarillentos enormes (#d8c9a0) y encías rojas sangrantes (#7a1018).
- Abrigo negro de goma arrugada (#1a1718, brillo apenas en los pliegues) hasta el suelo, plisado vertical desde la cintura.
- Tubos rojo vino (#8a2a3c) que salen del pecho y pasan por encima de los hombros. Costuras y rajas amarillo-mostaza (#c99a1a) entre las placas del abrigo.
- **Cambio frente a la ref:** en el pecho va una caja de hierro oxidado hexagonal con una luz verde tenue que parpadea, en lugar del símbolo biohazard rojo, y abrazaderas amarillas en los hombros.
- SIN arma (usuario): manos vacías enormes que se abren y cierran; camina lento y amenazante. Pies descalzos gigantes bajo el abrigo; empapado del bosque.

## Método (el mismo que con Lisa en `zombie-05-pt`)
- Modelo base humanoide rigged, CC-BY o CC0 (Sketchfab/Poly Pizza), o armado en Blender.
- Se pasa a low poly PS1 con el pipeline de `lisa/tools/build.py`: menos polígonos, textura 128 px con 32 colores y el shader PS1 del motor.
- Se proporciona como en la ref (hombros x1,6, cabeza x0,8, cuello largo) y se pinta con la paleta de arriba.
- Se anima por huesos en el set: paso pesado y lento, la cabeza que se ladea, los hombros que suben y bajan con cada paso, las manos que se abren y cierran.
- Se revisa con stills al lado de la ref antes de meterlo en el storyboard.
