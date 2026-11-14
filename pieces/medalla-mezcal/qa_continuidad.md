# QA de continuidad: medalla-mezcal (2026-11-04)

Se revisaron las hojas de contactos de los 45 clips de `clips/*.mp4` (fps=2, tile 8x2), guardadas en `scratchpad/edge/medalla/`. Los fondos dudosos se revisaron también en fotogramas sueltos.
Referencias (hojas de `chars/`): ARREOLA (Fausto) = sombrero de palma claro con banda de cuero oscura, piocha canosa corta, guayabera crema, cinturón café, jeans oscuros. HEROINA (Marisol) = trenza larga oscura, chamarra de mezclilla gastada y rota, playera blanca sucia, paliacate amarillo en la muñeca izquierda, jeans. CAPORAL (Nicanor) = gorra roja deslavada, camisa caqui, radio en el cinturón, pantalón café. SEVERO = **sin sombrero**, pelo negro corto, bigote negro grueso, chaleco negro de trabajo sobre camisa de mezclilla azul, jeans negros. TOBIAS = sombrero de paja, barba rojiza, camisa caqui, lentes de aviador colgando, radio en el bolsillo, jeans.

Ojo: la hoja `chars/SEVERO.jpg` no es lo que pide `make_sheets.py` (pelo blanco, piocha, sombrero negro, camisa vino), pero todos los clips siguen la hoja, así que la hoja manda. Por eso sobran el sombrero negro de c16/c22, el hombro de c36 y la camisa vino de i3.

## Clip por clip
| clip | resultado |
|---|---|
| c01 | OK. Caporal, Marisol y el sombrero de Arreola en primer plano correctos. Menor: el paliacate de Marisol aparece en la muñeca y en el brazo. |
| c02 | OK. |
| c03 | OK. |
| c04 | OK. La mano con manga crema de 0.5 a 1.5 s es la de Fausto. |
| c05 | OK. |
| i1 | OK. |
| c06 | **FALLA.** En primer plano, de espaldas, hay una mujer con trenza y **blusa blanca bordada** (huipil), sin la chamarra de mezclilla. No es Marisol. Está en todo el clip, así que no se puede recortar. REGENERAR. |
| c07 | OK. |
| c08 | OK. |
| c09 | OK. Menor: el paliacate está en el brazo, no en la muñeca. |
| r1 | OK en lo usado (1.0-2.2). Menor: el anillo se ve liso, sin la cabeza de caballo. |
| c10 | OK. |
| c11 | **FALLA en 0-2.5 s.** El hombro del borde izquierdo lleva un sombrero de paja **calado** (con agujeros) y una camisa blanca con **vivos rojos**, no el sombrero de palma ni la guayabera de Arreola. Ocupa un tercio del cuadro y las líneas 0 y 1 caen ahí (0.74-3.4), así que no se puede recortar. REGENERAR. Menor: la playera de Marisol está limpia. |
| c12 | OK. |
| c13 | OK. |
| c14 | OK. |
| c15 | OK. |
| i2 | OK en lo usado (0.5-2.2). Desde ~2.5 s el trapo muestra **las dos mitades juntas** (la medalla entera), y eso contradice la historia, pero esa parte no se usa. |
| c16 | **FALLA (cambio de ropa).** El Severo del primer plano lleva **sombrero negro**. En c17 y c18, en la misma cantina, no lo lleva, y la hoja tampoco. Está en todo el clip. REGENERAR. |
| c17 | OK. |
| c18 | OK. |
| i3 | **FALLA (cambio de ropa).** La cadena cuelga sobre una **camisa vino**. En c17 y c18 Severo lleva chaleco negro sobre mezclilla. REGENERAR, o quitarlo del EDL (ver recortes). |
| c20 | OK. |
| c21 | Personaje OK. **Nota de guion:** Marisol describe al jefe como "viejo, de barbita blanca" y "botas de piel de víbora", pero el Severo de los clips tiene bigote negro y unos 50 años. Regenerarlo es opcional (abajo). |
| r2 | OK. |
| c22 | **FALLA (cambio de ropa).** Severo **se pone un sombrero negro** a los 0-1.5 s y lo lleva todo el clip. En c23, c24 y c34 (mismo día) va sin sombrero. REGENERAR. |
| c23 | OK. |
| c24 | OK. |
| c25 | OK. |
| c26 | OK (corte duro Tobías→Severo). |
| c27 | OK. |
| c28 | **FALLA.** En el borde izquierdo hay un hombre con **sombrero negro y camisa a cuadros oscura**. No es Arreola, y en la mezcalera no debería haber nadie así. Está de 0 a ~4 s y las líneas empiezan en 1.14. REGENERAR. |
| c29 | OK (los trabajadores del fondo los pide el prompt). Recortar el último frame (ya anotado en ESTADO). |
| c30 | OK. Menor: playera limpia. |
| c31 | OK. |
| c32 | OK (la versión regenerada ya está bien). Menor: Arreola con jeans más oscuros. |
| c33 | OK. |
| c34 | OK. Severo sin sombrero, como en la hoja; Arreola y Caporal correctos. |
| c35 | **FALLA (sigue el look viejo).** El hombro del primer plano lleva sombrero claro, pero **paliacate rojo, chaleco café y camisa azul**: es el Don Chuy del asset viejo, no ARREOLA. Ocupa casi la mitad del cuadro de 0 a ~2.5 s, durante las líneas 0 y 1. REGENERAR. |
| c36 | **FALLA.** El hombro del primer plano lleva **sombrero negro y camisa negra con vivo blanco**. No es Severo (que no lleva sombrero y usa chaleco sobre mezclilla). Está de 0 a ~3.5 s, durante las líneas 0 y 1. REGENERAR. |
| c37 | Personaje OK. **Texto quemado** "Entrégamela." de 4.6 a 5.3 s, justo en la línea 1. Se arregla con recorte (abajo). |
| c38 | OK. |
| r3 | OK. |
| r4 | OK en lo usado. Menor: la medalla se ve dorada y entera, no plateada y partida. |
| c39 | Personaje OK. Es el CTA: se regenera para que tenga carisma (abajo). |

## REGENERAR
c06, c11, c16, c21 (aplicado el opcional), c22, c28, c35, c36, i3 y c39 (CTA). Ya están aplicados en `CLIPS` de `clips.py` y los mp4 viejos se movieron a `clips/old5/`. Los prompts llevan el ancla de identidad de cada personaje, y el personaje del borde va nombrado con su `@{ASSET}` y su ropa:

```python
 ("c06", 10, talk("Fausto", f"Over-the-shoulder close-up of @{{ARREOLA}} (short grey beard, tan palm cowboy hat with a dark leather band, cream linen guayabera shirt, brown leather belt, dark blue jeans) {MEZ}, his eyes narrowing; in the foreground, the blurred back of @{{HEROINA}} seen from behind (long dark braid down her back, faded denim jacket, no embroidered blouse).",
     ["¿Quién te dijo ese nombre?", "¿Y quién es tu mamá?", "Eso no me dice nada."], "cold, suspicious")),
 ("c11", 10, talk("Marisol", f"Over-the-shoulder close-up of @{{HEROINA}} (long dark hair in one braid, faded torn denim jacket over a dusty white t-shirt, yellow bandana tied on her left wrist, worn jeans) {MEZ}; in the foreground, the blurred shoulder and tan palm cowboy hat of @{{ARREOLA}} seen from behind (dark leather hat band, cream linen guayabera, no red trim).",
     ["Ya lo sé. Yo nací tres meses después.", "Porque mi mamá vivía con miedo.", "Nunca me lo quiso decir."], "quiet, honest")),
 ("c16", 10, talk("Tobías", f"Over-the-shoulder medium close-up of the henchman @{{TOBIAS}} (reddish-blond stubble, straw cowboy hat, khaki work shirt with rolled sleeves, aviator sunglasses hanging from the collar, radio on the chest pocket, jeans) {CAN}; in the foreground, the blurred back of the head and shoulder of @{{SEVERO}} seen from behind (no hat, short black hair, black work vest over a blue denim shirt).",
     ["Patrón, ya apareció la hija de la Teresa.", "En la mezcalera de Fausto Arreola.", "Ahí se fue a meter, patrón."], "eager, servile")),
 ("c22", 8, f"Medium two-shot {PUE}: @{{SEVERO}} (no hat, short black hair, thick black moustache, black zip-up work vest over a blue denim shirt, black jeans) walks out of the cantina zipping up his black vest, bareheaded; @{{TOBIAS}} (reddish-blond stubble, straw cowboy hat, khaki work shirt with rolled sleeves, aviator sunglasses hanging from the collar, radio on the chest pocket, jeans) beside him. Severo {VOICE}, raspy commanding voice, says: \"Tobías, junta a todos los muchachos.\" Then a short pause. Tobías answers quickly: \"Ahorita, patrón.\""),
 ("c28", 10, talk("Nicanor", f"Over-the-shoulder medium close-up of the foreman @{{CAPORAL}} (faded red baseball cap, light khaki work shirt with rolled sleeves, black walkie-talkie on his belt, brown work pants) {MEZ}, lowering his walkie-talkie radio, tense; in the foreground, the blurred shoulder and tan palm cowboy hat of @{{ARREOLA}} seen from behind (dark leather hat band, cream linen guayabera). Nobody else in the foreground.",
     ["Patrón, avisan del pueblo. Vienen seis camionetas negras.", "Más de treinta hombres, patrón."], "urgent, worried")),
 ("c35", 10, talk("Severo", f"Over-the-shoulder close-up of @{{SEVERO}} (no hat, short black hair, thick black moustache, black zip-up work vest over a blue denim shirt, black jeans) {POR}, a mocking smile; in the foreground, the blurred shoulder and tan palm cowboy hat of @{{ARREOLA}} seen from behind (dark leather hat band, cream linen guayabera; no bandana, no vest).",
     ["Fausto.", "Veintidós años sin vernos, compadre.", "Vine a cobrar lo que me debía tu hermano."], "slow, mocking, menacing")),
 ("c36", 10, talk("Fausto", f"Over-the-shoulder close-up of @{{ARREOLA}} (short grey beard, tan palm cowboy hat with a dark leather band, cream linen guayabera shirt, brown leather belt, dark blue jeans) {POR}, contained rage; in the foreground, the blurred back of the head and shoulder of @{{SEVERO}} seen from behind (no hat, short black hair, black work vest over blue denim shirt sleeves).",
     ["Severo Camargo.", "¿Qué se te perdió en mi tierra?", "Mi hermano no te debía nada."], "hard, contained, deep")),
 ("i3", 6, f"Extreme close-up insert {CAN}: the thin silver chain over the blue denim shirt and open black work vest of @{{SEVERO}} (no hat, short black hair, thick black moustache, black zip-up work vest over a blue denim shirt, black jeans), with the other half of the broken San Judas medal @{{PROP_MEDALLA}}, jagged edge visible, swinging slightly. No dialogue."),
 ("c39", 8, talk("Marisol", f"Close-up of @{{HEROINA}} (long dark hair in one braid, faded torn denim jacket over a dusty white t-shirt, yellow bandana tied on her left wrist, worn jeans) {MEZ}, looking straight into the camera with charisma, holding the silver half medal @{{PROP_MEDALLA}} in one hand; she tucks a loose strand of hair behind her ear, tilts her head slightly, a knowing half smile, nods once and gestures toward the camera with her free hand as she talks, then lifts the half medal a little toward the lens; natural organic movement like a telenovela star talking to her audience.",
     ["¿Creen que Severo mató a mi papá?", "Denle me gusta y compartan para ver la segunda parte."], "warm, intimate, confident, a little playful, talking directly to the viewer")),
```

Opcional (c21, para que la descripción cuadre con el Severo de los clips; cambia el guion):
```python
 ("c21", 10, talk("Marisol", f"Close-up of @{{HEROINA}} (long dark hair in one braid, faded torn denim jacket over a dusty white t-shirt, yellow bandana tied on her left wrist, worn jeans) {MEZ}, remembering with fear.",
     ["Solo a uno. Al que mandaba.", "De bigote negro, bien grueso.", "Y un chaleco negro, de trabajo."], "shaky, remembering")),
```

`clips.py` ya tiene la lógica de reintentos de hacienda-sangre: `gen()`, `flow_ok()` (control con el gatito), SAFE, SOFT, STYLES, `variant()`, NOREF (SEVERO y TOBIAS como texto), TRIES=6 y 17 s entre clips. Para regenerar: `python -I clips.py`, que salta los que existen.

**Después de regenerar**, hay que borrar de `lines.json` las claves c06, c11, c16, c21, c22, c28, c35, c36 y c39, porque `edit.py` solo transcribe los clips que no están en la caché. Si no se borran, usará los tiempos de los clips viejos. Luego hay que revisar los índices del EDL: hoy `("c16", 2)` no existe (whisper juntó las líneas 0 y 1) y la línea 0 de c28 es solo "Patrón,".

## Recortes posibles (sin regenerar)
- **c37:** para el tramo de la línea 1 (4.56-5.56), recortar `crop=520:924:100:0` (acercamiento del 72 % hacia arriba) antes del `scale`. Comprobado en el fotograma de 4.6 s: la cara queda entera y el subtítulo (que está a ~78 % de la altura) queda fuera. `edit.py` todavía no acepta un filtro por tramo; hace falta un tercer campo en el EDL, como en reten-sierra.
- **i3:** si no se quiere regenerar, quitar `("i3", (0.8, 2.6))` del EDL. La medalla de Severo ya se ve en c18 y en r3.
- **i2, r1, r4:** no hace falta tocarlos. Los fallos están fuera de los segundos que se usan, o son de utilería y casi no se notan.
- **c06, c11, c16, c22, c28, c35, c36:** ninguno se arregla con recorte, porque el error está en el cuadro mientras se dicen las líneas.
