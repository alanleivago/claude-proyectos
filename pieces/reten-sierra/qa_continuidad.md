# QA de continuidad: reten-sierra (2026-11-04)

Se revisaron las hojas de contactos de los 36 clips que usa el EDL de `edit.py` (fps=2, tile 8x2), guardadas en `scratchpad/edge/reten-sierra/`. Los segundos 8 a 10 de los clips de 10 s se revisaron aparte, en los puntos que usa el montaje.
Referencias: CANDELARIA = sombrero crema con banda turquesa, trenza plateada, blusa verde esmeralda y chaqueta de gamuza café. EMILIANO = camisa a cuadros naranja, camiseta gris y lentes redondos. GARZAVERDE = camuflaje con gorra, lentes espejo y bigote de herradura, sin chaleco. DONTEO = sombrero negro, barba blanca y chaqueta de mezclilla. SOLDADOFLACO = camuflaje con gorra.

## Clip por clip
| clip | resultado |
|---|---|
| c01 | OK. Emiliano y Candelaria correctos. |
| c02 | OK. |
| c03 | OK. |
| c04 | OK en lo usado (0.0-1.6). Desde ~6 s el oficial que llega no tiene lentes ni bigote, pero esa parte no se usa. |
| c05 | OK. |
| c06 | Personajes OK (el hombro con camuflaje y gorra es Garza). Menor: Candelaria aparece del lado del volante. |
| c07 | **FALLA.** En primer plano no está Candelaria: es un sombrero de paja crema con banda café sobre pelo corto oscuro, con camisa a cuadros, sin trenza ni chaqueta. El sombrero ocupa casi la mitad izquierda del cuadro durante todo el clip, así que no se puede recortar. REGENERAR. |
| c08 | Candelaria OK. Menor: el asiento del conductor está vacío (falta Emiliano). |
| c09 | OK. |
| c10 | **FALLA.** Candelaria sin la chaqueta de gamuza (solo blusa verde) en todo el clip, y en c08 y c13 sí la lleva. No se arregla con recorte. REGENERAR. |
| c11 | Cambio de ropa: Garza lleva chaleco táctico con radio y parche de nombre, cosa que no tiene en c05, c07, c09 ni c14. Lo pidió el prompt ("tactical vest"). REGENERAR opcional. |
| c12 | **FALLA (el caso que vio el usuario).** La "abuela" del borde derecho es otra mujer: sin sombrero, con pelo canoso corto y blusa floreada. En 0-1 s ocupa un tercio del cuadro y el diálogo empieza en 0.16, así que no se puede recortar. REGENERAR. |
| r1 | OK. |
| c13 | OK (también el tramo de 8-9 s). |
| r2 | **FALLA en 0.8-1.4.** En el borde izquierdo hay una persona mayor con lentes, sin sombrero y con camisa estampada azul, que no es Candelaria. Desde ~2 s el plano queda limpio. Se arregla con recorte (abajo). |
| c14 | OK. |
| c15 | OK. |
| c16 | OK. |
| c17 | OK. |
| c18 | OK (Don Teo correcto). |
| c19 | OK. |
| c20 | OK en lo usado. Entre 2.5 y 4 s Garza se quita los lentes y la cara cambia un poco, pero el montaje usa 4.52-5.55 y 6.5-7.39, donde los tiene puestos. |
| c21 | OK (Pineda). |
| c22 | OK. |
| c23 | OK. |
| c24 | **FALLA en 1.4-~2.0.** La nuca del borde derecho es una cabeza rapada sin gorra, con camisa oscura, y Garza siempre lleva gorra de camuflaje. Desde ~2.2 s sale del cuadro. Se arregla con recorte (abajo). |
| c25 | **FALLA.** En primer plano, sombrero crema con banda café y, debajo, pelo largo castaño oscuro y blusa rosa floreada. No es Candelaria. El sombrero llega a la mitad del cuadro, así que no se puede recortar. REGENERAR. |
| c26 | OK (las patrullas "POLICÍA" ya las tapa BLUR26). |
| c27 | OK. |
| r4 | OK. |
| c28 | **FALLA.** Candelaria sin la chaqueta de gamuza en todo el clip, y en c26 y c29 sí la lleva. REGENERAR. |
| c29 | OK (el subtítulo quemado ya lo saca CROP29). |
| c30 | OK. |
| c31 | OK. |
| c32 | OK. |
| c33 | Personaje OK. Es el CTA: se regenera para que tenga más carisma (abajo). |

## REGENERAR
Prompts completos, listos para pegar en `CLIPS`. Usan las mismas variables (CAB, RET, WIN) y las mismas líneas de diálogo.

```python
 ("c07", 8, talk("Garza", f"Over-the-shoulder close-up of @{{GARZAVERDE}} {WIN}, in the foreground the blurred shoulder and cream cowboy hat with a turquoise band of @{{CANDELARIA}} seen from behind (long silver braid down her back, brown suede jacket), keeping his sunglasses on the whole time, he glances down at the gold pocket watch in her lap and smiles. His hands stay on the window frame.",
     ["Los papeles no me interesan.", "Bonito reloj."], "dismissive, then greedy")),
 ("c10", 8, talk("Candelaria", f"Close-up of @{{CANDELARIA}} (exactly as in her reference sheet: cream cowboy hat with a turquoise band, long silver braid, emerald-green blouse under her brown suede jacket) in the passenger seat {CAB}, raising one eyebrow, indignant.",
     ["¿Quinientos mil?", "¿Por pasar por un camino de todos?"], "incredulous, then sharp")),
 ("c12", 8, talk("Emiliano", f"Close-up of @{{EMILIANO}} at the wheel {CAB}, leaning toward his grandmother, almost whispering; at the edge of the frame, the blurred shoulder and cream cowboy hat of @{{CANDELARIA}} (turquoise hat band, long silver braid, brown suede jacket over an emerald-green blouse).",
     ["Abuela, mejor páguele.", "Esos hombres no perdonan."], "whispering, pleading, scared")),
 ("c25", 8, talk("Garza", f"Over-the-shoulder close-up of @{{GARZAVERDE}} {RET}, in the foreground the blurred back of @{{CANDELARIA}} (cream cowboy hat with a turquoise band, long silver braid, brown suede jacket), trying to recover his pride.",
     ["Está hablando con un comandante.", "Esto le va a salir muy caro."], "proud, threatening")),
 ("c28", 10, talk("Candelaria", f"Close-up of @{{CANDELARIA}} (exactly as in her reference sheet: cream cowboy hat with a turquoise band, long silver braid, emerald-green blouse under her brown suede jacket) {RET}, golden backlight, eyes wet but hard.",
     ["Yo también tenía un esposo.", "Una tarde salió por este camino… y nunca volvió."], "low, painful, firm")),
 # CTA nuevo: carisma y movimiento orgánico
 ("c33", 8, talk("Candelaria", f"Close-up of @{{CANDELARIA}} (cream cowboy hat with a turquoise band, long silver braid, brown suede jacket over an emerald-green blouse) {RET}, looking straight into the camera with charisma, the gold pocket watch @{{PROP_LEONTINA}} in one hand; she adjusts the brim of her hat with two fingers, tilts her head slightly, a knowing half smile, nods once and gestures toward the camera with her free hand as she talks, natural organic movement like a telenovela star talking to her audience.",
     ["¿Creen que el comandante va a ceder?", "Denle me gusta y compartan para ver la segunda parte."], "warm, intimate, confident, a little playful, talking directly to the viewer")),
```

Opcional (cambio de ropa de Garza en c11):
```python
 ("c11", 10, talk("Garza", f"Close-up of @{{GARZAVERDE}} (same camouflage shirt as his reference sheet, no vest) {WIN}, his face close to the window, tapping the black radio clipped to the chest pocket of his camouflage shirt.",
     ["Cuidado cómo me habla, señora.", "Aquí yo decido quién pasa y quién se queda."], "hard, threatening")),
```
Después de regenerar hay que volver a medir los tiempos de cada clip nuevo en el EDL, porque las frases caen en otros segundos. Al c33 nuevo hay que comprobarle las patrullas del fondo: puede que BLUR33 ya no tape donde corresponde.

## Recortes posibles (sin regenerar)
- **r2:** cambiar `("r2", (0.8, 1.4))` por `("r2", (4.9, 5.5))`. Es el mismo primer plano de Emiliano con lágrimas y no tiene a nadie en el borde. Comprobado en el fotograma de 4.9 s.
- **c24:** primer tramo `("c24", (1.4, 3.13), "crop=576:1024:0:128,")`, un acercamiento del 80 % que deja fuera la cabeza rapada del borde derecho. Comprobado en 1.4 y 2.0 s: Candelaria queda centrada y entera. El segundo tramo (4.5-7.51) ya está limpio.
- **c04 y c20:** no hace falta tocarlos. Los fallos están fuera de los segundos que se usan.
