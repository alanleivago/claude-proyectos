---
type: doc
status: active
tags: [qa-continuidad, hacienda-sangre, atrium, novelas]
relatedTo: [hacienda-sangre, reten-sierra]
---
# QA de continuidad: hacienda-sangre (2026-11-04)

Se revisaron las hojas de contactos de los 36 clips que usa el EDL de `edit.py` (fps=2, tile 8x2), guardadas en `scratchpad/edge/hacienda-sangre/`. Los segundos 8 a 10 de los clips de 10 s se revisaron aparte, en los puntos que usa el montaje.
Referencias: OCTAVIO = pelo canoso peinado hacia atrás, bigote gris y traje de tres piezas café carbón con corbata burdeos. MATEO = chaqueta de pana verde olivo, camiseta azul marino y jeans. TERESA = blusa celeste, pantalón verde oscuro y moño canoso. ARTURO = lentes y traje tostado. DONNICO = sombrero, chaleco oscuro, camisa de mezclilla y pañuelo azul. QUINTERO = traje gris pizarra con corbata celeste.

## Clip por clip
| clip | resultado |
|---|---|
| c01 | OK (Mateo de espaldas con la chaqueta olivo correcta). |
| c02 | **FALLA.** El hombro del primer plano es de un suéter gris claro y la nuca tiene pelo oscuro. No es Octavio, que tiene pelo canoso y traje café carbón. Está en los tres tramos usados y llega a más de la mitad del cuadro, así que no se puede recortar. REGENERAR. |
| c03 | OK. |
| c04 | OK. |
| c05 | OK. |
| c06 | **FALLA en 0.7-~1.0.** En el borde izquierdo asoma una cabeza de pelo negro rizado sobre el hombro tostado. Arturo tiene pelo castaño liso con raya. El hombro tostado sí corresponde. Se arregla con recorte (abajo). |
| c07 | OK. |
| c08 | OK. |
| c09 | OK (también el tramo de 8-9.5 s). |
| r1 | OK. |
| c10 | OK. Menor: el traje de Arturo se ve más claro, casi marfil, que en c07 y c09. Puede ser la luz. |
| c11 | OK. |
| c12 | OK (el hombro olivo es Mateo). |
| c13 | OK. |
| c14 | OK. |
| c15 | OK. Menor: la camiseta de Mateo se ve azul más claro. |
| c16 | OK. |
| c17 | OK. |
| c18 | OK. |
| c19 | OK. |
| c20 | **FALLA en 0.62-~1.6.** El hombro del borde derecho es de un saco gris azulado y la nuca tiene pelo oscuro. No es Octavio. Después de ~2 s sale del cuadro. Se arregla con recorte (abajo). |
| c21 | OK. |
| r2 | OK. |
| c22 | OK en lo usado. En 0-0.5 s asoma un hombro en el borde izquierdo, fuera del tramo 1.1-7.07. |
| c23 | **FALLA.** En el borde izquierdo hay una nuca de pelo negro y un hombro de traje gris oscuro. No es Octavio (pelo canoso). Se arregla con recorte (abajo). |
| c24 | OK. |
| c25 | OK. Menor: una mano con puño oscuro sostiene la hoja desde la izquierda. Pasa como si fuera Octavio. |
| r3 | OK. |
| c26 | OK. |
| c27 | OK. |
| c28 | OK. |
| c29 | OK. |
| c30 | OK. |
| c31 | OK. |
| c32 | OK. |
| c33 | Personaje OK. Es el CTA: se regenera para que tenga más carisma (abajo). |

## REGENERAR
Prompts completos, listos para pegar en `CLIPS`. Usan las mismas variables (SALA, RAN) y las mismas líneas de diálogo.

```python
 ("c02", 8, talk("Mateo", f"Close-up of @{{MATEO}} {SALA}, tears running down his face; in the foreground, the blurred shoulder and silver-grey hair of @{{OCTAVIO}} seen from behind (charcoal-brown three-piece suit).",
     ["Papá, yo no sabía nada.", "Yo soy el mismo de siempre."], "broken, crying, pleading")),
 # CTA nuevo: carisma y movimiento orgánico
 ("c33", 8, talk("Mateo", f"Close-up of @{{MATEO}} (olive-green corduroy jacket over a navy t-shirt, exactly as in his reference sheet) {RAN}, looking straight into the camera with charisma, the small carved wooden figurine @{{PROP_SANISIDRO}} in one hand; he tilts his head slightly, a confident half smile, nods once, lifts the figurine a little and gestures toward the camera with his free hand as he talks, natural organic movement like a telenovela star talking to his audience.",
     ["¿Ustedes perdonarían a Don Octavio?", "Denle me gusta y compartan para ver la segunda parte."], "warm, intimate, confident, talking directly to the viewer")),
```
Después de regenerar hay que volver a medir los tiempos de c02 y c33 en el EDL.

## Recortes posibles (sin regenerar)
Ojo: el bucle de `edit.py` de esta pieza (`for i, (cid, x) in enumerate(EDL)`) no acepta filtro previo. Hay que agregarle `*pre` como en reten-sierra para poder aplicar estos recortes.
- **c06:** `("c06", (0.7, 3.73), "crop=576:1024:144:128,")`, un acercamiento del 80 % que corta el 20 % izquierdo. Comprobado en 0.7 y 1.2 s: la cabeza rizada sale del cuadro, Octavio queda entero y solo se ve el hombro tostado. Para que el plano no cambie de tamaño, conviene usar el mismo recorte en `("c06", (7.2, 7.85))`.
- **c20:** `("c20", (0.62, 1.99), "crop=540:960:0:160,")`, un acercamiento del 75 % que corta el borde derecho. Comprobado en 0.62 y 1.4 s: Teresa queda entera. El tramo 3.12-5.75 está limpio, pero conviene darle el mismo recorte para que no se note el cambio.
- **c23:** `"crop=540:960:180:40,"` en los tres tramos (0.78-3.51, 4.6-6.15 y 7.1-7.7). Comprobado en 0.8, 2.5 y 7.2 s: queda solo Quintero, sin la nuca oscura.
