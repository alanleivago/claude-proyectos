---
type: plan
status: draft
tags: [digger, storyboard, the-digger, refrigerador, zero-fem, ps1, mml2]
relatedTo: [guion, digger-channel, propuesta-nicho, analisis-A, zero-test]
---

# Digger 01: The fridge — storyboard

- **Duración:** el guion tiene 238 palabras. A 2,7 palabras/s eso da **~88 s**, no 70. Los tiempos de la tabla salen de ahí y se reajustan cuando llegue la voz. Para bajar a ~75 s habría que recortar unas 35 palabras; las candidatas son los planos 9, 14 y 23.
- **Ritmo:** 25 planos en 88 s, unos 17 planos/min (sinaboto va de 15 a 23). El plano más largo dura 5,9 s (#14), así que lleva un punch-in a mitad.
- **Comentario:** cae en el 42 % (37,4 s). El objetivo era 35-40 %.
- **Archivos:**
  - `storyboard_frames.png`: 4 style frames a resolución completa (A hook, B icehouse, C comentario, D corte de la nevera).
  - `storyboard_board.png`: los 25 planos renderizados en baja.
  - Motor en `engine/`. `index.html` muestra los style frames y `index.html?board=1` el board. Para renderizar: `node render.mjs --frames 48,138,228,318 --out stills` y `node render.mjs --page "index.html?board=1" --frames 45,135,… --out board`.
- **Referencia de entorno:** `ref-mml2/` tiene el vídeo a 480p, las hojas de contacto cada 15 s (`sheet_0*.jpg`) y frames sueltos (`closeups*.jpg`).

## Convenciones
- **Tamaño de plano:** G general, PE plano entero, PM plano medio, PP primer plano, Det detalle.
- **FOV (vertical):** sigue la guía 6b.
  - Establecimiento: 30-40°.
  - Cuerpo entero: 36-42°.
  - Cintura: 30-36°.
  - Cara: 20-28°, desde más lejos.
  - Acción: 60-75°, como mucho un plano.
- **Cámara:**
  - Un movimiento lineal por plano; el personaje crece un 5-8 %.
  - La fórmula vale desde `lt = −0.15`.
  - Cada corte cambia el ángulo al menos 30° o cambia el tamaño.
- **Transición:**
  - **M** = disolvencia mosaico de 0,3 s (la de sinaboto).
  - **C** = corte seco, sobre la palabra o la acción.
- **Caras:** se escriben `ojos/boca` con las celdas de `zero-fem/face/README.md`.
  - Ojos: open, half, blink, happy, surprised, angry, sad, wink, hearts, shocked, dizzy, relaxed.
  - Bocas: neutral, smile, smileOpen, talkA, talkO, surprised, frown, shout, blep, cat, gasp, bigShock.
  - Mientras habla en plano, la boca alterna talkA/talkO por palabra.
- **Acciones:**
  - Las 29 de `zero_anim.glb` (`zero-fem/anim/README.md`).
  - **NUEVA** = hay que añadirla en `build_anim.py`.
- **FX:** nombres de `fx.js`.
- **Texto en pantalla:**
  - Etiqueta amarilla "This is a…" = `label()` con línea guía.
  - El subtítulo es de 1 palabra, con los términos técnicos en amarillo (`KEYWORDS` en `words.js`).

## Tabla de planos

| # | tiempo (s) | línea | plano + FOV | cámara | set | acción | cara | props | FX | rótulo / overlay | corte-diagrama | trans. | SFX |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 0,0-2,6 | Operator… I dug up another human artifact. | G, 38° picado desde 9 m | grúa lenta hacia abajo y adelante | S1 excavación (pueblo + hoyo grande) | `dig` en loop; en "artifact" la pala choca con metal | angry/shout → surprised/gasp | pala, nevera enterrada inclinada | dust (nieve), impact en "artifact" | — | — | (inicio) | viento de nieve, pala en nieve ×3, *clang* metálico |
| 2 | 2,6-4,4 | Humans called it… a fridge. | PM, 30° | push-in con deriva a la derecha | S1 | `surprised` → `cheer` corto | surprised/gasp → hearts/smileOpen en "fridge" | nevera asomando, nieve cayendo de la puerta | sparkle sobre la nevera | HUD cian de escaneo "ARTIFACT 001", marco con esquinas | — | C en "fridge" | escaneo (bip ascendente), sting chiptune |
| 3 | 4,4-7,4 | If you dig a hole in the snow | picado ¾, 40° | pan lento a la izquierda | S2 hoyo (pueblo, nieve virgen) | `dig` en loop, la pala con `shovelOnHands` | angry/shout | pala, terrones de nieve volando | dust con color nieve, `every` 1,2 | — | — | M | pala crujiendo en nieve |
| 4 | 7,4-11,1 | and throw your meat in it… you have a refrigerator. | PE, 38° (**style frame A**) | push-in 5 % | S2 | `present` con la carne en HandL y, en "it", la suelta dentro del hoyo (**NUEVA `drop_object`**, o soltar el prop en `present`) | happy/smileOpen → relaxed/cat en "refrigerator" | carne con hueso (código), hoyo, pala clavada, huellas | snow (escarcha) sobre el hoyo, sparkle cian | etiqueta **REFRIGERATOR** con guía al hoyo | — | M | *thud* de la carne en nieve, ding |
| 5 | 11,1-13,0 | But snow melts in summer… | PE, 34° | estático; luz que cambia a cálida | S2 en versión verano (preset de cielo más cálido, nieve gris) | `idle` → `shrug` | sad/frown | hoyo con charco | heat, drip en el borde del hoyo | sol pixel | — | M | goteo, cigarra / pájaro de verano (gag) |
| 6 | 13,0-16,7 | so humans cut giant blocks of ice from frozen lakes… | PE, 38° desde la orilla | travelling lateral | S3 lago helado (borde del pueblo) | `saw` en loop sobre la grieta | angry/shout | sierra de hielo, agujeros oscuros, bloques apilados | crack en el hielo, splash pequeño | — | — | M | sierra en hielo, crujidos de hielo |
| 7 | 16,7-20,0 | and hid them in a shed full of sawdust. | PE desde la puerta, 36° | dolly in al interior | S3 interior del icehouse | `pour` (echa serrín sobre los bloques) | happy/smile | bloques de hielo, montón de serrín | dust color serrín | — | — | M | serrín cayendo, puerta de madera |
| 8 | 20,0-21,5 | This is an icehouse. | G, 36° (**style frame B**) | push-in lento | S3 exterior | `carry_heavy` con bloque al hombro | angry/shout | bloque de hielo, cobertizo de tablas con nieve | sparkle en el hielo | etiqueta **ICEHOUSE** con guía al tejado | — | C en "icehouse" | pasos en nieve, sting de etiqueta |
| 9 | 21,5-24,4 | The ice lasted for months… even in summer. | G, 34° | timelapse: 3 cortes internos con la luz cambiando | S3 | `smug` | relaxed/cat | — | sparkle | "JUN · JUL · AUG" que pasan como calendario pixel | — | M | tic-tac rápido |
| 10 | 24,4-29,3 | But ice still melts… and your meat ends up swimming in water. Gross. | PM, 34° | snap-zoom de 8 f a la carne en "Gross" | S2 (hoyo con agua) | `sick` | dizzy/frown → angry/frown en "Gross" | carne flotando en agua azul | stink, bubbles | — | — | M | chapoteo, "bleh" (SFX de asco chiptune) |
| 11 | 29,3-34,8 | So they put the ice on top of a wooden box… and the food underneath. | PE, 32° | arco lento de 20° | S4 cocina abandonada (banco de trabajo) | `hold_up_object` con el bloque y luego `pour` dejando la comida abajo | open/smileOpen | caja de madera (icebox), bloque de hielo, carne | — | — | — | M | madera, bloque de hielo apoyado |
| 12 | 34,8-37,4 | Cold air sinks. This is an icebox. | corte frontal, 32° | estático | S4: caja cortada por la mitad | (sin personaje o asomando por un lado) | — | icebox en sección: hielo arriba, comida abajo | arrow azules bajando, snow dentro | etiqueta **ICEBOX** | **sí**: sección de la caja con flechas azules de aire frío que bajan | C en "icebox" | *whoosh* frío suave |
| 13 | 37,4-40,4 | Operator Mike asks: "Why not just make cold?" | PM, 33° (**style frame C**) | push-in lento | S5 buzón (casa de piedra, buzón rojo oxidado) | `phone_look` con la carta | surprised/talkO | buzón con nieve, carta | sparkle en el buzón | sticker de respuesta de TikTok "Reply to operator_mike's comment / why not just make cold?" con pop | — | M | buzón que chirría, papel, notificación |
| 14 | 40,4-46,3 | Mike… you can't make cold. You can only steal heat. And that's exactly what humans did. | PP, 24° → punch-in a 20° en "And that's" | estático y punch-in | S5 | `smug` | half/frown en "can't" → wink/cat en "steal heat" | — | sparkle en el guiño | — | — | C en "Mike" | guiño "ting" |
| 15 | 46,3-50,4 | When a liquid evaporates… it steals heat from everything around it. | PE, 34° | órbita de 15° | S6 vacío del escáner (rejilla azul) | `think` | half/frown → surprised/talkO | gota/charco de líquido | steam (vapor que sube), arrow naranjas de calor entrando a la gota | — | **sí**: lupa de moléculas, las rápidas escapan con el calor | M | burbujeo suave, *whoosh* |
| 16 | 50,4-54,4 | That's why you shiver when you get out of the shower. | PE, 34° | snap-zoom corto | S4b baño en ruinas (bañera vieja, ducha) | **NUEVA `shiver`** (brazos cruzados, temblor de 2 px) | shocked/bigShock | bañera, alcachofa de ducha | sweat, drip, snow alrededor | — | — | M | dientes castañeteando, gota |
| 17 | 54,4-57,8 | So they filled a pipe with a special liquid… | PM, 30° | push-in | S4 | `present` señalando el tubo | open/smileOpen | serpentín de tubo azul brillante | sparkle azul | — | — | M | líquido llenando un tubo |
| 18 | 57,8-61,5 | that boils at minus twenty-six degrees. This is a refrigerant. | Det, 30° (vaso en la nieve) | estático, cámara a ras de nieve | S2 | (sin personaje; su mano entra a dejar el vaso) | — | vaso (`cup.glb` tintado azul) sobre la nieve | bubbles fuertes, steam | **-26°C** en cian + etiqueta **REFRIGERANT** | — | C en "boils" | hervor burbujeante |
| 19 | 61,5-65,9 | Inside the box… it boils and steals the heat from your food. | corte PM, 30° (interior de la nevera) | pan de abajo arriba | S4 corte de la nevera | (su puño señala desde el borde) | open/smileOpen | nevera en sección, carne, sobras | arrow naranjas de la comida al evaporador, bubbles en el tubo | "COLD" | **sí**: evaporador azul con escarcha y flechas de calor | M | burbujeo dentro del tubo |
| 20 | 65,9-69,6 | Then a pump squeezes it outside until it gets hot… | Det, 30° (compresor) | push-in rápido | S4 corte | — (o ella con `pump` a un lado) | — | compresor negro, tubo naranja | heat, zap leve | — | **sí**: compresor con el tubo que pasa de azul a naranja | M | zumbido del compresor, pistón |
| 21 | 69,6-73,7 | and dumps that heat out the back. This is a compressor. | PE, 30° (**style frame D**) | estático, cámara lateral | S4 corte | `point` hacia la nevera | open/smileOpen | nevera en sección completa | heat en el serpentín trasero, bubbles en el evaporador, arrow naranjas y rojas | etiqueta **COMPRESSOR** + tags "COLD" / "HOT" | **sí**: lazo completo del refrigerante (azul dentro, rojo fuera) con trazos animados | C en "compressor" | sting de etiqueta |
| 22 | 73,7-77,4 | That's why the back of your fridge is always warm. | PE ¾, 34° | arco lento | S1 (nevera desenterrada) | **NUEVA `warm_hands`** (palmas hacia la parte trasera; provisional `present`) | relaxed/cat | nevera en el hoyo | heat de la parte trasera, heart | — | — | M | crepitar cálido, suspiro feliz (SFX) |
| 23 | 77,4-83,0 | So your fridge doesn't make cold… it's a heat thief, running in a loop… forever. | PE, 30° | órbita lenta alrededor del corte | S4 corte | `smug` | wink/cat | nevera en sección; el lazo con antifaz de ladrón dibujado (gag) | arrow siguiendo el lazo, sparkle | etiqueta **HEAT THIEF** | **sí**: el mismo lazo con flechas que no paran | M | loop del compresor, "sneaky" pizzicato |
| 24 | 83,0-86,7 | Humans built a machine… just to rob their own leftovers. | PM, 30° | push-in | S1 | `shrug` con la caja de sobras | half/frown → relaxed/cat | caja de sobras (tupper) | question sobre la cabeza | — | — | M | encogerse (*boing*) |
| 25 | 86,7-88,1 | Artifact understood. Logging off. | G, 36° | grúa hacia arriba y atrás | S1 | `wave` | happy/smileOpen → blink | nevera, pala | sparkle; apagado CRT al final | "LOGGING OFF…" en cian y luego cartel "THE DIGGER" | — | M, luego CRT off | power-down retro, jingle final |

Notas de puesta en escena:
- Los gags están en #10 (asco), #14 (guiño), #16 (tiritona) y #23 (antifaz de ladrón).
- La nevera enterrada abre y cierra el vídeo (#1-2 y #22-25). Eso hace de callback.
- Los términos ("This is a…") caen siempre en un **corte seco con etiqueta amarilla**: #8, #12, #18 y #21. Así se marca el patrón.

## Diseño de sets
Es un pueblo nevado de ruinas en el futuro lejano, sin humanos. Tiene la sensación de Yosyonke en MML2 mezclada con ruinas post-humanas.

### Lenguaje visual sacado de `ref-mml2/`
- **Suelo:** nieve casi blanca (#e8eaee) con ondas azul-gris muy suaves. Los caminos pisados son más grises y en algunas zonas asoma piedra o tierra.
- **Casas:**
  - Cajas de muy pocos polígonos. El detalle (ventanas, molduras) está pintado en la textura.
  - Dos tipos: bloque de arenisca beige/tostado, y tablas oscuras casi negras.
  - Tejados a dos aguas muy cargados de nieve, con labio de nieve en el alero, y chimenea.
- **Cerramientos:** barandillas de hierro negras con puntas, muros de piedra gris redondeada y vallas de tablas.
- **Mobiliario:** farolas negras con farol, cajas de madera y pinos cónicos muy nevados.
- **Cielo y luz:**
  - Cielo gris lavanda plano (≈ (150,154,170) arriba y (208,210,216) en el horizonte).
  - Niebla fuerte que funde los edificios lejanos en gris y nieve cayendo en píxeles blancos.
  - Sin sombras reales: la luz va "pintada" (lado frontal claro, laterales un 20-30 % más oscuros).
- **Interiores:** papel pintado de rayas verde oliva/mostaza, zócalo de madera oscura, suelos de damero y puertas de madera tallada.
- **Paleta:** grises y beige apagados con pocos acentos saturados (puerta roja, verde). Nuestro personaje rojo/blanco destaca solo.
- **Mejoras sobre la ref:**
  - Texturas más limpias (Flow).
  - Torres de hormigón en ruinas dentro de la niebla para el "futuro sin humanos".
  - Reliquias humanas medio enterradas.
  - Sombra de contacto bajo los pies (regla cartoon3d).

### Sets
| set | qué es | planos |
|---|---|---|
| S1 excavación | Pueblo (función `village()`) + hoyo grande con la nevera de los 50 medio enterrada e inclinada, pala, huellas y montículos | 1, 2, 22, 24, 25 |
| S2 hoyo en la nieve | Mismo pueblo, nieve virgen y un hoyo pequeño. Tiene versión verano (#5) y versión con agua (#10) | 3, 4, 5, 10, 18 |
| S3 lago + icehouse | Lago helado elíptico con agujeros cortados, sierra, bloques apilados y un cobertizo de tablas abierto con hielo y serrín | 6, 7, 8, 9 |
| S4 casa abandonada / cocina | Papel pintado roto, zócalo, damero con nieve dentro, agujero en el techo con haz de luz, armario y cocina viejos. Aquí van el icebox y la nevera en sección | 11, 12, 17, 19, 20, 21, 23 |
| S4b baño en ruinas | Variante de S4 con bañera y ducha | 16 |
| S5 buzón | Fachada de piedra con puerta, barandilla, farola, pinos y el buzón rojo oxidado (reliquia humana que ella usa como "correo de Operators") | 13, 14 |
| S6 vacío del escáner | Fondo azul oscuro con rejilla cian, para los diagramas de física | 15 |

### Assets y de dónde salen
| asset | fuente | estado |
|---|---|---|
| Personaje | `zero-fem/anim/zero_anim.glb` + caras | hecho |
| Texturas de nieve, arenisca, tablas oscuras, tejado nevado, piedra gris, papel pintado, damero, hielo y serrín | **Flow** (Nano Banana 2.1, proyecto `906ab256-3f2c-4113-a723-66445b9b4951`), en `engine/tex/flow/*`. Están reducidas a `engine/tex/d_*.png` | hecho |
| Frente de la nevera de los 50 (oxidada) | Flow → `d_fridge.png` (frente) + `d_rust.png` (laterales) | hecho |
| Casas, barandillas, farolas, pinos, torres en ruinas, hoyo, montículos, huellas, lago, cobertizo, icebox, nevera en sección (lazo, compresor, evaporador, espuma), carne, carta y bloque de hielo | **código** (`shots.js` y `board.js`) | hecho (versión board) |
| Coche medio enterrado (variante `skyblue`) y papelera (`green`) | `lib-mml` (solo relleno de fondo, recoloreado) | hecho |
| Buzón | zero-test `mailbox.glb` (CreativeTrio, CC0), repintado rojo óxido | hecho |
| Pala | Quaternius (CC0), `models/shovel.glb` | hecho |
| Vaso del refrigerante | Kenney (CC0), `models/cup.glb` tintado | hecho |
| Sierra de hielo (con dientes), tenazas de hielo, trineo de bloques | Poly Pizza / Sketchfab (CC0/CC-BY) vía Blender MCP | **pendiente** (ahora es una caja) |
| Bañera, alcachofa de ducha y un compresor más detallado (opcional) | Poly Pizza (CC0) vía Blender MCP | **pendiente** (ahora es código) |
| Señal de tráfico, coche y cabina como reliquias (más variedad) | código + `lib-mml` pickups | opcional |
| Antifaz de ladrón para la nevera (#23) y sticker de TikTok | código / pixel art en canvas | sticker hecho, antifaz pendiente |
| Cartel final "THE DIGGER" | pixel art en código | pendiente |

Créditos: las texturas de Flow son generaciones propias. Si se importan modelos CC-BY, se añaden a `engine/CREDITS.md`.

## Animaciones nuevas necesarias (`zero-fem/anim/build_anim.py`)
1. **`shiver`** (#16): brazos cruzados frotándose, temblor de 1-2 px a 15 fps y rodillas juntas.
2. **`warm_hands`** (#22): agachada, con las palmas hacia delante a la altura del pecho y un vaivén suave.
3. **`drop_object`** (#4): extiende el brazo y abre la mano (puño → soltar), con un pequeño rebote. El prop se suelta con `scene.attach` y cae con gravedad.
4. *(opcional)* **`open_door`** (#2 o #24): tirar de la puerta de la nevera con las dos manos.
5. *(opcional)* **`salute`** (#25): saludo militar breve antes del "Logging off" (ahora se usa `wave`).

## Style frames: qué se ve y qué queda
- **A hook:** está de pie junto al hoyo con la carne extendida sobre él. Detrás se ven las casas de tablas y piedra, la barandilla, la farola, el pino y la papelera reliquia. Etiqueta REFRIGERATOR con guía al hoyo, huellas y pala clavada.
  - Falta: que la carne caiga (acción nueva) y que se vea su cara (el gesto `present` gira la cabeza hacia la mano).
- **B icehouse:** cobertizo de tablas con tejado nevado, la puerta abierta con hielo apilado en serrín y ella llevando un bloque al hombro. A la izquierda, el lago helado.
  - Falta: la sierra con dientes y bloques en el lago en primer término.
- **C comentario:** buzón rojo oxidado y ella leyendo la carta, con el sticker de respuesta de TikTok y pop-in.
- **D corte:** nevera cortada en la cocina abandonada.
  - Dentro se ve la espuma amarilla, los estantes con carne, botella y sobras, y el evaporador azul con escarcha.
  - Fuera, el serpentín caliente naranja y el compresor.
  - El lazo tiene trazos animados (azul dentro, rojo fuera), flechas naranjas de calor de la comida al evaporador, calor que sube detrás y la etiqueta COMPRESSOR.
