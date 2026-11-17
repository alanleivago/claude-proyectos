# Tramo 00:00-05:00

## Que pasa en este tramo

- [00:00-00:43] Montaje de escenas y gameplay de Mega Man Legends 1 (Mega Man y Roll en el timón, nave estrellada, calle con patrulla, Teisel Bonne, robot Bonne naranja con calavera, minijuego de bolas rojas, panadería con bonus de 1000 zenny, Reaverbot de ojo rojo). Es pura introducción nostálgica.
- [00:44] Tarjeta de título "Legends 1 & 2".
- [00:48] Plano de Barrel Caskett (el abuelo de Roll).
- [00:52-00:56] Roll de Legends 1 de pie, de frente, con el logo "Mega Man Legends" y el HUD del juego de fondo.
- [01:00-01:08] Se enseña la segmentación rígida de Legends 1: a la derecha, la misma Roll con las piezas separadas, y luego ampliada. A la izquierda hay un ejemplo de Tron Bonne animada, donde se ven las piezas desfasadas al moverse.
- [01:12] Otro ejemplo animado de Tron sobre gameplay.
- [01:16-01:28] Roll de Legends 2 de frente (guantes marrones, shorts con borde blanco). Se compara con la versión segmentada y con un ejemplo de Tron en MML2.
- [01:32-01:40] Roll de Legends 1 despiezada sobre croma verde. Se ven las piezas flotando: cabeza con gorra, torso y mangas, shorts/falda, guantes y muslos.
- [01:44-01:48] Flechas verdes sobre la reportera de MML2 (traje morado, micrófono) y sobre la TV "LIVE". Señalan el brazo/articulación, pero el objetivo exacto no se lee bien en los fotogramas.
- [01:52] Roll en pijama (gorro rosa) junto a Megaman Trigger/Mega Man en la TV.
- [01:56] Título "Calculating Poly Count".
- [02:00-02:12] Especificaciones de la PlayStation sobre una placa base Sony, con la nave de fondo.
- [02:16-02:52] Cálculo del presupuesto de polígonos por fotograma (ver cifras).
- [02:56-03:12] "6,000 / Character Poly Count" y "WRONG": hay que sumar entorno y partículas. Se muestran explosiones y humo de efectos como ejemplo.
- [03:16-03:44] Comparativa de tris de personajes.
- [03:48-04:28] NPCs de Legends con brazos y piernas sólidos y una sola articulación.
- [04:32-04:40] Blender: los shorts de la Roll del autor, en 3 piezas independientes. Se rota una pieza de pierna para mostrar cómo se mueve.
- [04:44-04:52] Shorts terminados, de frente, y vista con color plano por pieza.
- [04:56-05:00] Vista de los 3 bloques de color (magenta, verde y azul) y cierre en Blender con las 4 variantes.

## Datos técnicos exactos

**Hardware PS1 (02:00-02:48)**
- 360,000 triángulos/s sin textura (flat).
- 180,000 triángulos/s con textura.
- 90,000 triángulos/s con textura, iluminación y Gouraud.
- Dividiendo 180,000 entre 30 fps salen **6,000 tris por fotograma** como máximo en pantalla (personajes + entorno + partículas).

**Conteo de triángulos (03:16-04:16)**

| Modelo | Tris |
|---|---|
| Roll in-game | 350 |
| Tron in-game | 343 |
| Roll cinemática | 474 |
| Tron cinemática | 405 |
| NPC "homework girl" | 237 |
| Mujer de la chatarrería | 188 |

**Skinning y rig**
- Legends 1: skinning rígido por segmentos. Cada pieza (brazo superior, antebrazo, cabeza, cuello, torso) va pesada al 100% a un único hueso. No hay mezcla de vértices y el resultado parece un muñeco articulado.
- Legends 2: sigue siendo rígido, pero con polígonos puente entre articulaciones (codos, rodillas, cintura), un "soft skinning" primitivo.
- NPCs: brazos y piernas sólidos, movidos por una sola articulación. El cameraman tiene la cámara modelada en el cuerpo y un codo móvil. El vendedor de verduras sí tiene brazos y piernas móviles.
- No se muestran huesos concretos en este tramo.

**Técnica de ropa (04:32-05:00)**
- Los shorts/falda no son un objeto único deformado, sino **3 mallas**: una pieza de cadera/cintura (magenta) y dos piezas de pierna (verde y azul). Se mueven de forma independiente con skinning muy simple.
- Las mallas se ajustan muy pegadas entre sí para ocultar los huecos.
- Con el cinturón, la hebilla y los bolsillos pintados en la textura, el volumen se ve bien sin más geometría.
- Estimación mía: unos 20-30 tris para los 3 bloques de los shorts.

**Herramientas visibles**
- Blender 5.0.3. El título del archivo se lee como `Ashley_posed.blend`, en `...\268_Ashley_MML\`, así que el personaje del autor parece llamarse **Ashley**.
- Menú "RetopoFlow" en la barra superior.
- Se usa el panel Rotate con eje normal para girar piezas.
- Los fotogramas no muestran Aseprite, modificadores ni plugins de textura.

**Texturas, paleta, UV, shading, animación facial**
- Nada de esto se detalla en 00:00-05:00. Los datos que da la transcripción (256x256 máximo, expresiones de 51 px con divisor de 1 px, luz frontal desde arriba) aparecen después del minuto 5.
- Lo que sí se ve: texturas de píxel-art con pocos colores por pieza, sin filtrado suave, y sombreado pintado a mano en la textura (zonas rojo claro y rojo oscuro en los shorts).

## El personaje

El tramo no muestra el personaje terminado del autor. Solo se ven sus shorts en Blender (04:32-05:00). Lo que sigue describe a **Roll Caskett**, el modelo de referencia, y los shorts de Ashley.

**Proporciones (estimación sobre los fotogramas)**
- Legends 1 ([00:56], [01:00]): unas 3.3-3.5 cabezas de alto contando la gorra. La cabeza es grande, el torso corto y las piernas largas y finas. Las manos son guantes cúbicos grandes y los pies son botas boxy anchas.
- Legends 2 ([01:16]): unas 4 cabezas, un poco más estilizada, con la cabeza algo más pequeña.

**Silueta**
- Gorra roja ancha con visera frontal y un pelo que se abre en puntas hacia los lados, más ancho que los hombros.
- El cuerpo es una columna estrecha, con shorts acampanados y botas pesadas.

**Peinado**
- Rubio-naranja (#F7B52C base, #FFD34D en luces, #E8901E en sombras).
- Flequillo y mechones laterales como placas angulosas que terminan en punta y salen hacia fuera. El pelo está en gran parte pintado sobre la malla de la cabeza.
- La gorra (#D8262F) tiene una banda gris con dos lentes ovales plateados al frente (#9A9EA3 con brillo #E6E8EA), como unas gafas de piloto.

**Cara**
- Toda la cara está pintada en la textura, sobre un plano casi plano.
- Ojos grandes verdes (#3FA535) con contorno oscuro superior y brillo blanco.
- Cejas pequeñas anaranjadas.
- Nariz mínima, casi inexistente.
- Boca pequeña y abierta (interior #8C1E2B), cerrada y sonriente en MML2.
- Piel #F7C9A0, con manchas rosadas en las rodillas (#E9A58C).

**Ropa y colores**
- Cuello blanco (#E8E8E8) y chaqueta/top rojo (#D8262F) con mangas abullonadas y puños blancos.
- Dos botones grandes plateados en vertical al pecho.
- Camiseta negra (#1A1A1A) visible en la cintura.
- Cinturón rojo oscuro (#7A1018) con hebilla rectangular plateada con un círculo.
- Shorts rojos (#D32F3A) con dobladillo blanco (#D9DADA), bolsillos y bragueta marcados en la textura, y mallas negras debajo.
- Guantes: rojos con puño blanco en MML1 (#C7222B), marrones en MML2 (#7B4A32).
- Zapatillas altas rojas con puntera blanca/gris y calcetines blancos.

**Shorts de Ashley ([04:44])**
- Casi idénticos a los de Roll: rojo con sombreado en dos tonos (#D32F3A y #A31C27), cinturón rojo oscuro, hebilla plateada con un anillo, bolsillos laterales, línea central de bragueta y banda blanca inferior.
- Tienen ligera forma de campana, con la base más ancha que la cintura.

**Topología visible**
- No hay wireframe en el tramo.
- La despiece de [01:32] muestra que MML1 se construye con cajas deformadas: cabeza+gorra+pelo en una malla, torso con mangas, falda/shorts, guantes aparte, y muslos con articulación en la rodilla.
- Brazos y piernas son prismas simples. Las botas son bloques con puntera. Las manos son cubos achaflanados.
- Los 3 bloques de color de [04:56] confirman el esquema de cadera + dos piernas, sin geometría de refuerzo.

## Fotogramas de referencia

- [00:52] Roll MML1 de frente, terminada, con la nave de fondo.
- [00:56] Roll MML1 de frente, boca abierta, la mejor luz y nitidez.
- [01:16] Roll MML2 de frente, boca cerrada.
- [01:20] Roll MML2 de frente, ligeramente más grande.
- [00:16] Roll de espaldas en gameplay (gorra, pelo, top, cinturón negro, botas).
- [01:52] Roll en pijama en 3/4 (otro atuendo, solo sirve como referencia de pose).
- [01:00] Roll MML1 de frente junto a la versión segmentada con piezas separadas.
- [01:04] Versión segmentada ampliada con la textura de píxeles visible.
- [01:28] Comparación MML2: modelo completo a la izquierda y segmentado a la derecha.
- [01:32] Roll despiezada sobre croma verde (cabeza, torso, shorts, guantes, muslos).
- [03:36] Línea de modelos con conteos de tris: Tron 405/343, Roll 474/350, homework girl 237.
- [03:44] Misma línea con el conteo de la NPC visible.
- [04:12] NPCs con anotaciones (Solid Arm, Solid Block, 188 Tris).
- [04:28] NPCs con el rótulo "Joint".
- [04:32] Blender con los shorts: vista de color plano y tres versiones texturizadas.
- [04:36] Pierna rotada que muestra el movimiento independiente.
- [04:44] Shorts terminados, de frente.
- [04:56] Bloques de color de las 3 piezas (magenta, verde y azul).
- Personaje terminado de lado, wireframe, atlas de expresiones, rig con huesos: no aparecen en este tramo.

# Tramo 05:04-07:56

## Qué pasa en este tramo

- [05:04] Se muestra el short de Roll en Blender (archivo `Ashley_posed.blend`, Blender 5.0.0). Arriba a la izquierda está la malla coloreada por partes: pieza central magenta (cintura) y dos tubos, uno verde y otro azul (cada pierna). Alrededor hay vistas frontal, lateral y trasera con textura.
- [05:08] El mismo short con la vista oscurecida (transición). Se ve que son 3 piezas separadas.
- [05:12-05:44] Montaje de gameplay y cinemáticas de Mega Man Legends para ilustrar el "encanto" del clipping y la geometría que se cruza:
  - [05:12] y [05:16] Mega Man sonriendo y hablando.
  - [05:20] Puerta de 3 ojos hexagonales rojos.
  - [05:24] Pasillo.
  - [05:28] Escaleras.
  - [05:32] Puerta.
  - [05:36] Jefe/Reaverbot.
  - [05:40] Salto en el aire.
  - [05:44] Tron Bonne en la calle con un cuadro de diálogo.
- [05:48-05:52] Pantalla negra. Aparece la hoja de textura de Roll con el rótulo "256x2…" que pasa a "256x256" en [05:52].
- [05:54] La textura de Roll se desplaza a la izquierda.
- [05:56] Aparece la textura NPC "256x128" (pelo marrón, ropa amarilla/ocre).
- [05:58-06:00] Aparece la textura del águila, "128x" y luego "128x128".
- [06:08] Fundido a negro.
- [06:10] Título "The Process".
- [06:12-06:22] Intro de Capcom con el aeroplano/nave de fondo desenfocada.
- [06:24-06:30] Se muestran en fila los modelos terminados: Roll, luego Tron + Roll, y por último Tron + Roll + el personaje del autor (Ashley).
- [06:32] Fundido a las capturas de modelado.
- [06:34-06:36] El personaje bloqueado en blanco (sin textura) junto a Tron/Roll, con la foto de referencia de Ashley (RE4) abajo a la derecha.
- [06:38] Un cubo delgado (naranja) colocado junto a Roll para sacar la forma del brazo.
- [06:40-06:50] El cubo se edita hasta formar un brazo en 2 segmentos (hombro en cuña, brazo superior y antebrazo) con un corte intermedio.
- [06:52] Vista trasera de Roll y Tron con el cubo entre ellos.
- [06:54] Primer plano del brazo de Roll: hombrera, brazo superior, bloque del codo y antebrazo.
- [06:56] El cubo del autor junto a las piernas de Tron (wireframe).
- [06:58] Menú de Blender con el submenú LoopTools abierto (Bridge, Circle, Curve, Flatten, Gstretch, Loft, Relax, Space).
- [07:00-07:08] Se afina la pierna moviendo vértices: se estrecha hacia el tobillo y se ve de frente y de perfil, con el color naranja de selección.
- [07:10] Se saca un cubo para la cabeza, junto a la cabeza de Tron.
- [07:12-07:16] Se edita la cara inferior (naranja) del cubo para hacer la mandíbula. Se compara con Tron.
- [07:18-07:22] La cabeza se remodela: caras laterales, barbilla puntiaguda, corte en 3-4 filas hacia abajo.
- [07:24] Wireframe de la cabeza con la zona de la barbilla seleccionada.
- [07:26-07:28] Vista de perfil y 3/4 comparando con las cabezas de Tron.
- [07:30-07:32] La cabeza (naranja) se coloca sobre el cuerpo del personaje (figura de la izquierda, junto a Roll y Tron).
- [07:34-07:38] Vistas lateral, 3/4 y cenital de la cabeza sobre el cuello.
- [07:40] Pantalla completa de Blender (workspace Modeling) con la cabeza en modo edición y la foto de Ashley a la derecha.
- [07:42] Vista trasera del grupo: silueta negra (el personaje nuevo), Roll y dos Tron.
- [07:44] Modo edición del torso (caja trapezoidal con banda inferior) y el cuello.
- [07:46-07:48] Los cuatro modelos en fila en modo edición. La cabeza del personaje es una "Cube" facetada y la falda es troncocónica.
- [07:50] Herramienta Annotate (trazo rojo) para dibujar la línea del pelo y el flequillo en zigzag sobre la cabeza.
- [07:52] Vista frontal: cabeza del personaje al lado de Roll en modo edición.
- [07:54] Objeto "Cone" en edición con Mirror Editing activado (probablemente un mechón de pelo).
- [07:56] Los 4 modelos en fila: dos Tron, Roll y Ashley, todavía sin pelo.

## Datos técnicos exactos

- **Polígonos:**
  - En este tramo no se dicen cifras nuevas.
  - Las del discurso previo (sin timestamp aquí): Roll in-game 350 tris, Tron in-game 343, Roll cinemática 474, Tron cinemática 405.
  - Los contadores de Blender son borrosos y no son fiables. Para el personaje del autor, apunta a unos 350-450 tris como objetivo.
  - Las cifras de [07:40], [07:42] y [07:50] (Objects 1/12 o 12; los tris totales parecen del orden de 1.6k-1.9k para toda la escena) son estimaciones por lo borroso.
- **Texturas (tamaño y número):**
  - Los personajes principales usan 1 textura de 256x256 [05:52].
  - Los NPC usan 256x128 [05:56].
  - Los elementos pequeños (águila) usan 128x128 [06:00].
  - Cada personaje tiene 1 sola textura (atlas).
- **Paleta y resolución:**
  - Pixel art duro, sin suavizado ni filtrado (nearest).
  - Pocos colores planos por zona: base, sombra y brillo.
  - La hoja de Roll agrupa cara, gorra, brazos, cinturón, hebilla y zapatos en bloques.
- **UV:**
  - Se hacen casi al mismo tiempo que la textura (se superponen los UV sobre la textura de Roll en las zonas complejas).
  - El short de Roll es de 3 piezas independientes, cada una con su propia isla.
  - La cara se diseña sin deformación ni estiramiento.
- **Herramientas:**
  - Blender 5.0.0, workspace Modeling.
  - RetopoFlow (menú visible en la cabecera).
  - LoopTools (menú visible en [06:58]).
  - Imagen de referencia (foto de Ashley) en el viewport.
  - Annotate, Mirror Editing y modo edición con selección de vértices, aristas y caras.
  - No se usan modificadores: las mallas son poligonales directas ("Add Modifier" vacío).
- **Shading:**
  - Solid sin suavizado (flat, faceteado).
  - En el short de Roll [05:04] la parte trasera está más oscura: ilustra el sombreado fijo "frente claro / espalda oscura".
- **Rig y animación facial:** no se tratan en este tramo.
- **Estructura de la escena:** objetos separados, en rigid-skin: Arms, Cube (cabeza), Legs, Legs.001, Mesh, Mesh.001, Mesh.002, Neck, Skirt, Torso, Waist y Cone (pelo). No se muestran las pelotas de hueso.

## El personaje

El personaje del autor es **Ashley Graham (RE4) en estilo Mega Man Legends** (archivo `Ashley_posed.blend`, foto de referencia en pantalla).

- **Proporciones** (estimadas de [06:30]):
  - Unas 5 cabezas de alto.
  - La cabeza es casi tan ancha como los hombros, aspecto chibi.
  - El cuerpo es delgado y las piernas largas, aproximadamente la mitad de la altura.
  - Los brazos llegan a media muslo y las manos son mitones pequeños de bloque.
  - Las botas son altas y rectas, de aproximadamente un 20 % de la altura.
- **Silueta:** cabeza ancha y facetada, cuello fino, tronco corto, falda acampanada y piernas rectas terminadas en botas rectangulares.
- **Pelo:**
  - Rubio dorado (#EEC070 aprox.).
  - Media melena corta tipo bob con flequillo puntiagudo hacia un lado.
  - Los mechones acaban en puntas.
  - En [07:50] se dibuja con Annotate el flequillo en zigzag y en [07:54] se modela con "Cone".
  - En [07:56] aún no tiene pelo.
- **Cara:**
  - Pintada en la textura, plana, sin nariz ni boca en geometría.
  - Ojos grandes verdes (#3E9A4A aprox.) con contorno oscuro.
  - Boca pequeña abierta, rojiza.
  - Cejas finas.
  - Piel melocotón (#F2C7A0 aprox.) con sombra (#D79A78).
- **Ropa y colores** (hex aprox.):
  - Chaleco/top naranja-marrón (#C0641E).
  - Bufanda o cuello marrón oscuro (#5A3A2A), anudada a un lado.
  - Falda verde plisada (#4C7A2C, sombra #2F5A1E).
  - Botas marrón oscuro (#553341).
  - Piernas y brazos desnudos, con marcas pequeñas en las rodillas.
- **Accesorios:** solo la bufanda/collar. Sin gorra ni guantes.
- **Topología visible:**
  - **Cabeza:** caja deformada de 24-40 caras (aprox.), tope plano, laterales inclinados y barbilla con abanico de triángulos en 3-4 filas.
  - **Cuello:** caja de 2 segmentos.
  - **Torso:** caja trapezoidal con banda inferior (cintura separada).
  - **Falda:** tronco de cono facetado de unos 8 lados.
  - **Brazos:** hombrera en cuña + brazo superior + antebrazo, cada uno una caja (como Roll).
  - **Piernas:** cajas/prismas que se estrechan hacia el tobillo, con las botas como cajas rectas.
  - **Pelo:** objetos separados tipo cono/cuña.
- **Referencia de Roll** (short): 3 piezas (cintura con muesca en V y dos tubos), con cinturón rojo oscuro (#7A1020) y hebilla gris (#9A9A9A), bolsillos y cremallera central. Los colores del short son #D0293A (base) y #B01E2F (sombra), con puños blancos (#E8E8E8 / #C0C0C0).

## Fotogramas de referencia

- [06:30] Personaje terminado de frente (Ashley con Roll y Tron). El mejor.
- [05:04] Short de Roll en 3 partes con UV coloreados (referencia de ropa y UV).
- [06:24] Roll terminado de frente.
- [06:26] Tron y Roll de frente.
- [07:34] Vista lateral (sin textura, cabeza + cuerpo).
- [07:42] Vista trasera del personaje (silueta) con Roll y Tron.
- [07:48] Vista 3/4 con falda y cabeza.
- [07:46] Vista 3/4 con los cuatro modelos.
- [07:56] Los 4 modelos en fila (frontal, sin pelo).
- [07:24] Wireframe de la cabeza.
- [07:40] Cabeza en edición (modo wireframe + sólido).
- [06:50] Wireframe del brazo en 2 segmentos.
- [06:54] Brazo de Roll en primer plano.
- [07:08] Pierna de perfil en edición.
- [06:56] Pierna en wireframe junto a Tron.
- [06:36] Short/pantalón de Roll en sólido.
- [05:52] Hoja de textura de Roll 256x256.
- [06:04] Las tres texturas lado a lado: 256x256, 256x128 y 128x128.
- [05:56] Atlas NPC 256x128.
- [06:00] Textura del águila 128x128.
- Atlas de expresiones, poses finales y rig: no aparecen en este tramo.

# Tramo 07:58-10:28

## Qué pasa en este tramo
- [07:58] Sigue en el workspace Shading de Blender 5.0. En la vista están Tron, Roll y la silueta de espaldas de Ashley (objeto seleccionado `Sleeve.001`). La textura abierta es `Tron_Bonne_(Cutscene).png`. El narrador dice que pasan a UVs y texturizado.
- [08:00-08:06] Workspace UV Editing. Ordena las UVs de la cabeza de Ashley (`Cube.008`) sobre la textura `Roll_(Cutscene).png` para aprender cómo mapea Capcom la cara. Marca seams en rojo y comprueba que el mapeo del rostro no se deforma.
- [08:06-08:12] Ve la cabeza de Ashley con las expresiones de Roll proyectadas. Desenvuelve con el panel Mio3 UV y compara el wireframe con el atlas de caras.
- [08:14] Inspecciona el atlas de expresiones de Roll, con índices 00-12 impresos en cada casilla (5 columnas × 3 filas).
- [08:16-08:28] Copia la técnica en las demás piezas. Coloca las UVs de brazo superior, antebrazo y manos sobre la textura de Roll, marca seams (menú Edge → Mark Seam) y usa Select Linked. Con la textura de Roll aplicada, el cuerpo de Ashley sale "revuelto".
- [08:30-08:32] Crea el material `AshleyFace` (`Ashley_Face.png`) para la cara, separado del material `Ashley` (`Ashley.png`). La textura nueva muestra dos casillas de cara copiadas de Roll.
- [08:34-08:42] Crea la textura base `Ashley.png` en bloques de color plano: piel, naranja del top, banda naranja oscuro, verde de la falda, marrón de las botas. Reparte las UVs de brazos, piernas, falda y torso sobre esos bloques. Usa TexTools (Texel Density, Checker Map) y hay un error de Python en la barra [08:36].
- [08:44-08:48] Revisa el cuerpo ya con color de bloques: botas marrones, falda verde, top naranja. Ajusta las UVs del cuello (`Neck`) y las del torso sobre la zona de piel.
- [08:50-08:58] Diapositivas en blanco y negro con las máscaras de luz y sombra de los personajes.
- [09:00-09:12] Vistas de espaldas de Roll y Tron. En [09:08] resalta en verde las caras traseras (pelo, espalda, brazos, piernas, zapatos) que llevan los tonos oscuros.
- [09:16-09:22] Vuelve a Blender. Reparte las UVs del pelo en el bloque amarillo/dorado de la textura y las de las orejas en la zona de piel. El pelo forma una isla grande y varias pequeñas, con borde negro en el flequillo.
- [09:24] Abre Aseprite sincronizado con Blender. Hay tres pestañas: `Ashley.png`, `Ashley_Face.png` y `Roll_(Cutscene).png`. Pinta con simetría (línea azul vertical) y la capa `UVMap` visible como guía.
- [09:26-10:04] Pinta las expresiones una por una. Cada una va en su capa, con nombre por índice (00, 01, 02, 03, 04, 05, 06, 07, 10…):
  - [09:26] ojos cerrados, cejas enfadadas.
  - [09:30] ojos cerrados sonrientes "^ ^".
  - [09:32] ojos de puntos con rubor.
  - [09:34-09:36] ojos entrecerrados mirando de lado.
  - [09:40] ojos cerrados y boca "o".
  - [09:42-09:46] triste, cansada, con boca abierta.
  - [09:48] ojos molestos y boca abierta.
  - [09:50-09:52] ojos y cejas más grandes.
  - [09:54-09:58] feliz con rubor.
  - [10:02] ojos enfadados cerrados.
  - [10:04] ojos de puntos negros (base).
- [10:06-10:14] Pinta los ojos finales: verdes, grandes, con párpado y pupila marrón. En [10:08] tiene el verde bloqueado, en [10:10] ya con el contorno de ojo, y en [10:12-10:14] con la pupila marrón y los brillos blancos.
- [10:16-10:24] Shading Editor. Crea un tercer slot de material, `AshleyMouth`. Monta los nodos para animar los índices de expresión: Texture Coordinate → Vector Math (Multiply) → Vector Math (Add) → Image Texture. Añade un nodo Value para el índice.
- [10:26-10:28] Gráfico explicativo: la casilla de expresión mide 51 px, más un divisor negro de 1 px. En [10:28] marca en verde el píxel sobrante a la derecha.

## Datos técnicos exactos
- **Software:** Blender 5.0 con EEVEE. Workspaces Shading, UV Editing y Modeling. Aseprite v1.2.16.1 sincronizado con Blender.
- **Add-ons vistos:**
  - Un panel de sincronización Blender↔Aseprite (Sync, Show UV, Sprite Plane, Pixel Grid, New Pixel Material, Reload Sprites). No pude identificar el nombre.
  - **Mio3 UV** (Unwrap, Align, Arrange, Island, Symmetrize, Select).
  - **TexTools** (Texel Density, Checker Map, UV Layout, Baking, Color ID, Mesh UV Tools).
  - **RetopoFlow** (visible en la cabecera).
- **Texturas:**
  - `Ashley.png` es de 256×256, confirmado por la barra de estado de Aseprite.
  - `Roll_(Cutscene).png` figura como 512×512 RGBA en el UV Editor [08:02]. El narrador habla de 256×256 como máximo; usa 256×256 para la tuya.
  - `Ashley_Face.png` es una textura aparte con el atlas de expresiones.
  - El campo Size de TexTools [08:38-08:42] se lee como 512, pero la textura de Aseprite es 256.
  - Interpolación Closest (píxel nítido), extensión Repeat, color sRGB, Alpha conectado desde la imagen.
- **Materiales:** `Ashley` (cuerpo), `AshleyFace` (ojos) y `AshleyMouth` (boca), todos Principled BSDF con Base Color y Alpha de la imagen. El material de cara usa los nodos Multiply/Add para desplazar las UVs.
- **Atlas de expresiones:**
  - Cada casilla mide 51 px de ancho más 1 px de divisor negro.
  - Hay 5 columnas y 3 filas. Las expresiones de Roll van de 00 a 12.
  - Para pasar de una expresión a otra se desplaza X en 51/256.
  - Cada salto de fila suma 1/256 para compensar el píxel sobrante.
  - El desplazamiento vertical es alto de casilla / 256.
  - La explicación completa de la matemática llega justo después de 10:28.
- **Polígonos:**
  - Cabeza de Ashley (`Cube.008`): 77 caras y 101 triángulos (≈53 vértices, ≈118 aristas, lectura aproximada).
  - Brazos superiores (`Cube.003`, dos piezas): ≈16 tris, ≈10 vértices, ≈17 aristas.
  - Antebrazos (`Cube.011`, dos piezas): ≈24 tris, ≈14 vértices, ≈22 aristas.
  - Escena completa con todo lo de referencia: 15 objetos, ≈1 002 vértices, ≈2 406 aristas, ≈1 513 caras y 1 693 tris [10:06].
  - Roll cinemática: 474 tris [08:16].
  - Total de Ashley: no se ve directamente. Restando las referencias da menos de ~900 tris.
- **Iluminación (técnica Capcom):**
  - Luz siempre de frente y desde arriba.
  - Todas las caras traseras (espalda, parte trasera de brazos, piernas, zapatos, pelo) usan los tonos oscuros pintados en la textura.
  - Se logra aislando las islas UV de sombra del resto.
- **UV:** sin estiramientos en ojos y boca, que es la regla más repetida. Texel density uniforme. Las piezas se organizan en bloques de color planos con los colores y sombras separados.
- **Rig:** no aparece en este tramo. Los modificadores están vacíos y los grupos de vértices no tienen nada. Cada parte es un objeto separado (rigid parts). Rigify se menciona mucho después.
- **Animación facial:** shader con Texture Coordinate → Multiply → Add → Image Texture. Un nodo Value da el índice. No hay animación de huesos en este tramo.

## El personaje
Es **Ashley Graham** (Resident Evil 4) hecha al estilo Mega Man Legends. Es un chibi de cabeza grande, de unas 3 cabezas de alto. Tiene el mismo ancho de cabeza que Roll, pero hombros algo más estrechos.

**Piezas, según el outliner:** `ArmLower`, `ArmUpper`, `Cone` (la nariz), `Ears`, `Head`, `LegsLower`, `LegsUpper`, `Neck`, `Skirt`, `Sleeve.001`, `Torso`, `Waist`.

**Cabeza**
- Es facetada, casi un casco ovoide con mentón plano. La cabeza (pelo incluido) es un solo mesh, y hay una versión suya sin texturas en [08:04].
- El pelo es rubio dorado y forma un bob angular que llega a la barbilla. Tiene un pico en la coronilla y flequillo con raya al lado en forma de V, y deja las orejas visibles.
- La parte de atrás del pelo es más oscura. El flequillo tiene un borde negro pixelado.
- Colores del pelo: base #F7B316, luz #FCC52E, sombra #E59A12, fondo #C9780E.
- La nariz es una pirámide/cono pequeño de geometría real (objeto `Cone`), con unos pocos píxeles pintados encima. Los ojos y la boca están **pintados en la textura

# Tramo 10:30-13:50

## Qué pasa en este tramo
- [10:30] Se muestra una expresión facial de **51 px** de ancho, con borde negro de 1 px a la derecha y abajo. El índice "00" está dibujado en la esquina inferior izquierda.
- [10:32–10:38] Se ve la tira con las expresiones 00–04. En 10:34 aparece una línea verde que marca el **píxel sobrante** a la derecha del atlas.
- [10:40–10:44] Aparece la cuenta **256 / 51 = 5.0196**, que explica que no divide exacto.
- [10:46–10:58] Se recorre cada celda con un recuadro verde. Aparece la fórmula **51 / 256 = 0.19921875**, que es el desplazamiento en U por índice.
- [11:00–11:02] Se revela el atlas en varias filas (índices 00–08 visibles).
- [11:04–11:08] Se resalta el índice 05, primer elemento de la 2ª fila. Aparece **1 / 256 = 0.0039**, la compensación del píxel perdido al saltar de fila.
- [11:10] Pantalla dividida: Aseprite con `Roll_(Cutscene).png` y Blender con la cabeza del personaje y el nodo de material.
- [11:12–11:16] Primer plano de la cara en el viewport y del árbol de nodos del shader de expresiones.
- [11:18–11:26] Se etiquetan los nodos: 51/256, 1/256 y "Expression Height / Texture Height".
- [11:28–11:40] Rigging. Primero el metarig con el panel de Rigify Dev Tools. Después el rig generado, con colecciones de huesos, formas personalizadas y poses de prueba (mano en la cadera, puño, etc.).
- [11:42–11:44] Se cambia la expresión de la boca en el viewport (material AshleyMouth).
- [11:44–12:04] Texto en pantalla: "Rigify – More advanced than needed" (11:44) y "Custom Rig – Less is More" (11:56). Mientras tanto se ve la pose del personaje, el panel de Rigify y las preferencias de add-ons.
- [12:06–12:10] Workspace Compositing: nodos de composición para pixelar el render, con fondo negro.
- [12:14–12:30] Showcase del personaje con fondo degradado oscuro. Etiquetas: **474 Triangles** (12:22), **256x256 Body Texture** (12:26), **256x256 Face Texture (12 Expressions)** (12:30).
- [12:34–12:46] Animaciones: pose con mano en la cadera, idle caminando con puños, y carrera con golpe.
- [12:46–13:14] Tres personajes lado a lado, cada uno con una animación distinta, rotando en turntable.
- [13:18–13:30] Pantalla final: "Thanks For Watching / Follow Me On Twitch" y "Twitch Chat" (agradecimiento al patrocinador).
- [13:34–13:50] Repite el trío de animaciones con la cámara girando, sin texto.

## Datos técnicos exactos
- **Triángulos:** el modelo de cinemática tiene **474 tris** (etiqueta en 12:22). Las estadísticas de Blender en 11:32–11:58 muestran unos ~300 vértices, ~300 caras y ~473 tris. Los números exactos son borrosos.
- **Referencia del transcript:** Roll in-game 350 tris, Tron in-game 343, Roll cinemática 474, Tron cinemática 405. El presupuesto PS1 es de 180 000 tris texturizados por segundo, o 6 000 tris en pantalla a 30 fps.
- **Texturas:** 2 texturas de **256×256**:
  - Una de cuerpo (`Ashley.png`).
  - Una de cara (`Ashley_Face.png`) con **12 expresiones**.
- **Atlas de cara:**
  - Celdas de **51 px** de ancho, con separador negro de 1 px.
  - 5 columnas por fila, 3 filas (12 usadas de 15 celdas).
  - 5 × 51 = 255 px, así que sobra 1 px a la derecha.
  - El índice de cada celda (00, 01…) está dibujado pequeño en su esquina inferior izquierda.
- **Fórmula UV de la cara:**
  - Desplazamiento en X por índice = 51/256 = 0.19921875.
  - Por cada salto de fila se suma 1/256 = 0.0039 en X.
  - En Y se resta (alto de expresión / alto de textura) por fila. En los nodos aparece como **−0.215**.
- **Nodos del material (Blender Shader Editor):**
  - `Index` (valor animable, p. ej. 18.080) → `Round` → `Clamp` (Min 0, Max = `Total Indices` 11.000).
  - `Cell Width` = 5.000 → `Divide` → `Floor` (número de fila).
  - Fila × 0.004 → `Add` al desplazamiento en X.
  - Índice × 0.199 → `Add` en X.
  - Fila × −0.215 → Y.
  - `Combine XYZ` → `Add` (Vector) con `Texture Coordinate` (UV, objeto Head) → `Image Texture` `Ashley_Face.png`.
  - Interpolación **Closest** (pixel perfect), proyección Flat, extensión **Repeat**, Alpha Straight.
  - La extensión Repeat parece envolver la U automáticamente, aunque no se ve explícito el módulo.
- **Materiales de la cabeza:** `Ashley`, `AshleyFace` y `AshleyMouth`. Ojos y boca parecen tener nodos separados, es decir, índices independientes. La textura usa alfa para la superposición.
- **Herramientas:**
  - Blender (título "Blender 5.0"), con workspaces Modeling, Shading, Animation y Compositing.
  - Aseprite (~v1.3.x) para pintar texturas. Tiene abiertas `Ashley.png`, `Ashley_Face.png` y `Roll_(Cutscene).png` como referencia, con la rejilla del atlas visible.
  - Un add-on pixel/retro con menú "RetroFlow" en el header. Su panel lateral tiene Sprite Plane, Pixel Grid, New Pixel Material, Reload Sprites, UV Style y Animation.
  - Sin modificadores visibles: es un mesh poligonal directo.
- **Shading/render:**
  - Sombreado plano, sin suavizado.
  - El sombreado está horneado en la textura: la parte trasera y baja de cada pieza usa tonos oscuros, y el frente usa tonos claros (luz frontal y desde arriba).
  - Render EEVEE, luego pixelado en el compositor (reducción de resolución con nodos de escala).
  - Fondo degradado gris-azulado oscuro con viñeta verdosa.
- **Rig:**
  - Rigify, con metarig humanoide y rig generado (`rig.001`) con formas personalizadas en los huesos.
  - Colecciones de huesos: Face (Primary/Secondary), Torso, Torso (Tweak), Fingers, Fingers (Detail), Arm L/R (IK/FK/Tweak), Leg L/R (IK/FK/Tweak).
  - Propiedades: IK/FK, Neck Follow, Head Follow, Torso Parent.
  - Aparece también un panel de Auto-Rig Pro (Bind Engine) en 11:30 y 11:50. Podría usarse para el skinning, pero no es seguro.
  - El autor concluye que Rigify es "más avanzado de lo necesario" (twist bones, tweaks) y recomienda un rig propio simple.
- **Skinning:** piezas separadas, rígidas, cada una pesada a un solo hueso.
- **Animación:** hecha por "Mrs. Merck". Hay idle, carrera con golpe y pose mano en la cadera.
- **Animación facial:** cambio de índice → offset UV, sin huesos faciales ni shape keys.
- **Tiempo del proyecto:** 3 días. Es un resumen del autor, no un dato de este tramo.

## El personaje
Es una chica con aspecto anime, muy estilizada, al estilo Roll/Tron.

**Proporciones y silueta**
- Unas 4–4,5 cabezas de alto.
- La cabeza es grande, ancha y cuadrada con bisel, con melena tipo bob.
- Torso corto.
- Brazos finos, con antebrazos largos.
- Manos como puños cúbicos.
- Falda corta con vuelo.
- Muslos gruesos y botas altas chunky con tacón, ligeramente grandes respecto a la pierna.

**Pelo**
- Rubio dorado, **#F0B860** aproximado, con sombras en naranja melocotón (~**#E8A070**).
- Bob de caja: tapa plana, laterales rectos que bajan hasta la barbilla y trasero plano.
- El flequillo se divide al centro con mechones triangulares naranjas, pintados en la textura de la cara (~**#E08A1A** y ~**#C86A10**).
- Las orejas son un objeto separado ("Ears"), pequeñas y ligeramente puntiagudas.

**Cara (todo pintado en la textura, sin geometría para ojos/boca)**
- Ojos grandes: esclerótica casi blanca (~#E6E6E6), mitad inferior verde (~**#1E8A1A**), mitad superior iris marrón oscuro (~**#4A2A20**), con brillo blanco cuadrado.
- Contorno oscuro marcado en los laterales.
- Cejas marrones finas en arco (~#B9714F).
- Nariz: apenas una marca de 1–2 px.
- Boca: pequeña, en sonrisa suave, o abierta en "O" con interior marrón y dientes como rectángulo blanco.
- Piel: claro ~**#F6D1A5** en la parte baja de la cara y ~**#EDAE88** en la parte alta/lateral.

**Expresiones del atlas**

| Índice | Expresión |
|---|---|
| 00 | Neutra, sonrisa leve, ojos al frente |
| 01 | Mirada lateral, sonrisa abierta con dientes |
| 02 | Ojos cerrados, boca pequeña |
| 03 | Mirada lateral, boca pequeña |
| 04 | Mirada lateral, ojos grandes |
| 05 | Neutra, sonrisa suave |
| 06 | Boca abierta en "O" |
| 07 | Ojos muy abiertos, boca pequeña |
| 08 | Ceño fruncido con barra de dientes |
| 09–11 | Ceño, guiño, etc. (parcialmente visibles) |

**Ropa y colores (hex aproximados)**
- **Top/blusa sin mangas:** naranja ~**#D8651E**, sombra ~#A64A15.
- **Cuello/bufanda naranja** alrededor del cuello, mismo tono.
- **Hombreras/arnés marrón** cruzado sobre el pecho: ~**#5A3A28**, sombra ~#3F2A1E, con trim verde claro/crema (~#6A8A3A / #E8D8A0).
- **Falda verde:** ~**#3F6B1F**, sombra ~#2D4F17, con pliegues verticales oscuros pintados y dobladillo con vuelo.
- **Piernas:** piel con corazones rosados pintados en las rodillas.
- **Botas:** burdeos ~**#6B3550**, sombra ~#4A2538. Altas, con botón redondo lateral y tacón.
- **Accesorios:** sin otros visibles.

**Topología (sin wireframe real, se deduce de las caras planas del solid)**
- Cada pieza es un objeto separado, rígido y solapado. Los nombres del outliner son: `ArmsLower`, `ArmsUpper`, `Ears`, `Hands`, `Head`, `LegsLower`, `LegsUpper`, `Neck`, `Skirt`, `Sleeves.001`, `Torso`, `Waist`.
- **Cabeza:** cubo biselado con la parte frontal plana para la cara. El pelo va en la silueta y la textura.
- **Falda:** tronco de cono de pocas caras, más ancho en el dobladillo, sin pliegues en geometría.
- **Brazos y piernas:** cajas cónicas, con segmentos superior e inferior separados. Las manos son cubos y las botas son bloques con tacón.
- **Cuerpo:** unas ~300 caras en total, con unos ~300 vértices.

## Fotogramas de referencia
- **Terminado de frente:**
  - [12:34] Frente con pose mano en la cadera.
  - [12:14] Frente 3/4, boca abierta.
  - [12:38] Frente, idle con puños y sonrisa.
  - [12:42] Frente idle con brazos abiertos.
  - [13:38] y [13:50] Trío completo con el personaje de frente.
- **De lado:**
  - [12:22] Perfil completo con etiqueta "474 Triangles".
  - [12:26] Perfil con etiqueta de textura de cuerpo.
  - [13:06] y [13:46] Perfil/3/4 trasero en el trío.
- **De espaldas:**
  - [12:18] Espalda completa con la mano en la cadera (mejor toma).
  - [13:14] y [13:34] Espalda en el trío.
  - [11:32] Espalda de la malla en el viewport, con la falda plana y los corazones en las rodillas.
- **3/4:**
  - [12:30] 3/4 trasero con etiqueta de textura de cara.
  - [12:54] y [13:42] 3/4 en el trío.
  - [11:42] 3/4 de frente en el viewport.
- **Wireframe:** no hay wireframe en este tramo. Lo más cercano a ver la topología son:
  - [11:32] y [11:34] malla facetada de espalda y piernas con el rig.
  - [11:12] cabeza muy de cerca con la cara pintada.
  - [11:28] torso con el rig.
- **Hoja de textura/UV:**
  - [11:10] Aseprite con la hoja de caras de Roll (referencia) y el atlas de Ashley.
  - [11:12] miniatura del atlas en el editor de imágenes (abajo a la izquierda).
  - La textura de cuerpo no se muestra en este tramo.
- **Atlas de expresiones:**
  - [11:02] Mejor vista de 00–08.
  - [11:04] Índices 00–07 más legibles.
  - [10:36] Tira 00–04 completa.
  - [10:30] Expresión 00 a 51 px.
- **Nodos de shader:**
  - [11:16] Árbol limpio y legible.
  - [11:26] Con las anotaciones.
- **Poses finales:**
  - [12:34] Mano en la cadera.
  - [12:38] Idle con puños.
  - [12:46] Idle más carrera con golpe.
  - [13:34] Idle, carrera y mano en la cadera de espaldas.
  - [13:50] Trío con todas las poses de frente.
- **Rig:**
  - [11:36] Cuerpo entero con huesos.
  - [11:30] Rig con brazos en T.
  - [11:38] Caderas y torso con huesos.
  - [11:40] Pose de prueba con rig visible.
  - [11:28] Metarig con Rigify Dev Tools.
  - [11:48] Preferencias de add-ons.

# Tramo 13:54-13:54

## Qué pasa en este tramo
- [13:54] Es un único fotograma, de la despedida del vídeo (la voz dice "Thanks for watching… see you in the next one"). Muestra una **hoja de turnaround/animación** con el personaje terminado, renderizado en estilo PS1 con texturas pixeladas, sobre un fondo degradado azul grisáceo a verde azulado.
  - Izquierda: de frente, en reposo o caminando, con los puños algo separados del cuerpo.
  - Centro: de 3/4, a media zancada, con una rodilla levantada, ojos cerrados, boca abierta y brazos balanceándose.
  - Derecha: de espaldas, con una mano en la cadera y el otro brazo ligeramente abierto.
- No se modela, no se hace UV ni se muestra el rig en este tramo. Solo es el resultado final y las animaciones que hizo "Mrs. Merck" (mencionadas en 12:35).

## Datos técnicos exactos
En este fotograma **no aparece ningún dato técnico en pantalla**. Lo que sigue sale de la transcripción (otros tramos) o es deducción visual, y lo marco como tal.

- **Tris del personaje:** no se dice la cifra del personaje del autor. Como referencia, Roll in-game tiene 350 tris, Tron 343, Roll cinemática 474, Tron cinemática 405, la "homework girl" 237 y la vendedora de chatarra 188. Visualmente, este personaje cabe en unos 300-400 tris (estimación mía).
- **Textura (transcripción):**
  - Base de 256×256 como máximo. Los NPC usan menos, por ejemplo 256×128.
  - Es una sola textura por personaje, con la piel de base, bloques de color y luego sombras en islas UV separadas.
- **Resolución:** el render muestra píxeles de textura grandes, con filtrado nearest y sin suavizado. Los bordes quedan escalonados y no hay líneas de contorno.
- **Paleta:** colores planos y saturados, con 2-3 tonos por material (base, sombra y a veces luz). Hex estimados en la sección del personaje.
- **Iluminación:** sin luces dinámicas. La luz está pintada en la textura, siempre de frente y desde arriba. Todas las caras traseras (nuca, espalda, brazos por detrás, piernas, zapatos) usan el tono oscuro. En la vista de espaldas se ve el pelo, la capa y la falda más oscuros.
- **Herramientas (transcripción):** Blender, con un cubo deformado como base. Rig con Rigify, que el autor considera demasiado complejo y recomienda sustituir por un rig más simple o propio. Las animaciones son de otra persona.
- **Cara animada (transcripción):** shader simple que desplaza las UV por un atlas de expresiones.
  - Cada expresión mide 51 px de ancho, con 1 px de separador negro.
  - El desplazamiento horizontal por índice es 51/256.
  - Al saltar de fila se suma 1/256 para compensar el píxel sobrante.
  - El desplazamiento vertical es alto de expresión / alto de textura.
- **En este fotograma:** el panel izquierdo tiene ojos abiertos verdes con sonrisa pequeña, y el panel central tiene ojos cerrados con boca abierta. Son al menos dos expresiones distintas del atlas.
- **Rig (huesos):** no se ve. La transcripción habla de segmentos rígidos sin skinning suave: partes separadas, cada una ligada a un solo hueso, con piezas solapadas (por ejemplo, el pantalón de Roll en 3 partes).

## El personaje
- **Proporciones:**
  - Mide unas 3,5-4 cabezas de alto, estilo chibi/figura de acción. La cabeza es grande, de aprox. 1/4 de la altura total.
  - El torso es corto y los brazos son finos, con manos de bloque que son puños cerrados de tamaño generoso.
  - Las piernas son cortas, con muslos desnudos visibles, y las botas son grandes y robustas (casi un tercio de la pierna).
- **Silueta:** cabeza redonda de bob, capa o hombreras anchas, falda acampanada y botas altas voluminosas. Se lee bien incluso en sombra.
- **Pelo:**
  - Rubio dorado, corte bob hasta la barbilla o la nuca.
  - Tiene un flequillo largo peinado hacia un lado, con un mechón que cae por delante de la oreja o la mejilla.
  - Por detrás es un bloque redondeado y compacto con la parte baja recortada recta.
  - Hex aprox.: base #E9B95F, luz #F3CF80, sombra #C98F4A.
  - Está hecho con pocas caras y los mechones van pintados en la textura.
- **Cara:**
  - La cara va **pintada en la textura** sobre un plano de la cabeza, no es geometría.
  - Ojos grandes y verdes (#3FAE4B) con brillo claro y párpado oscuro.
  - Nariz mínima, casi un punto o sombra.
  - Boca pequeña sonriente en el panel izquierdo. En el panel central los ojos se cierran en arco y la boca se abre.
  - Mejillas ligeramente rosadas.
- **Ropa y colores (hex aprox.):**
  - Top sin mangas naranja rojizo #C9622D.
  - Pañuelo o cuello naranja más claro #D9702F.
  - Capa o hombreras de cuello ancho marrón grisáceo oscuro #4A3B38 con borde más oscuro. Por detrás parece un bolero corto.
  - Cinturón o banda en la cintura con rayas verde oscuro y crema (#D8D3A2).
  - Falda verde con pliegues #3F6E2E, y sombra #2E5223 por detrás. Es corta y acampanada, con pliegues verticales marcados.
  - Piel #EBB78F, con sombra #D49A77 en el interior del muslo y la parte trasera.
  - Botas altas morado ciruela #4C3049, con suela o puntera más clara rosada #8C5272 y un botón o círculo en el lateral.
- **Accesorios:** pañuelo y capa. No se ven armas ni mochila en el fotograma.
- **Topología visible:** no hay wireframe. Por el sombreado plano se aprecia que:
  - Los brazos son prismas de pocas caras, con antebrazo y brazo en bloques separados.
  - Las manos son bloques con un pulgar insinuado.
  - Las piernas son prismas con muslo y bota separados, y las botas son bloques robustos con la puntera achatada.
  - La falda es un tronco de pirámide con aristas por cada pliegue, de unas 8-10 caras en el contorno.
  - La cabeza es un cubo redondeado de unas 20-30 caras con el pelo integrado, y el flequillo es una pieza aparte.

## Fotogramas de referencia
- [13:54] Personaje terminado de frente (panel izquierdo): mejor vista de cara, ropa y botas.
- [13:54] 3/4: panel central, con pose de zancada, ojos cerrados y boca abierta.
- [13:54] De espaldas: panel derecho, con mano en la cadera y sombras de la cara trasera.
- [13:54] De lado: no hay perfil puro, y el 3/4 central es lo más cercano.
- Wireframe, hoja de textura/UV, atlas de expresiones, rig: no aparecen en este tramo. Hay que buscarlos en otros tramos del vídeo, alrededor de 07:57-11:30 (UV, texturas, expresiones) y 11:28-12:07 (rig).
- Poses finales: las tres de [13:54] (parada de frente, zancada o carrera, y de espaldas con mano en la cadera).