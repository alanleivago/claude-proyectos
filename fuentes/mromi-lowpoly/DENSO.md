---
type: research
status: done
tags: [mromi, low-poly, tutorial]
relatedTo: [fuentes/mromi-lowpoly/how-to-make-low-poly-shorts-using-claude-full-workflow.md]
---
# Mr omi low-poly tutorial: pasada densa (1 fps)

# Referencia: cortos low poly con Claude (tutorial de Mr Omi)

> Nota general: del tutorial solo se oye la voz en off. No hay SFX ni música audibles. Lo único visible de sonido son los nombres de carriles de la línea de tiempo [00:21] y los archivos y logs que se muestran en pantalla.

## Planos y cámara

### Formato y ritmo
- Todos los cortos son verticales 9:16. En la demo se muestran de dos en dos sobre un escritorio macOS (fondo Big Sur) [00:00]. El dock tiene Finder, Claude, Blender, VS Code, Chrome y Terminal.
- En el export final, el 9:16 va centrado en un lienzo 16:9. Los lados se rellenan con una copia borrosa y ampliada del mismo fotograma, así las barras siempre coinciden con los colores de cada plano [04:53–04:59], [05:00–05:51], [06:05]. Esto vale también para las grabaciones de pantalla.
- Un corte cada ~1 s, con un nuevo visual casi en cada frase.
  - Plan del corto de la pulga: 42 planos para 58 s, ~1.4 s por plano.
  - Un buen corto salta entre 3 y 8 localizaciones y se construye en menos de un minuto [02:07].
- Cada beat del guion tiene su propio escenario, un prop-chiste y un tamaño de plano distinto.
- A veces se mantiene la misma composición 2 cortes, con un leve push-in o la animación continuando: cronómetro [05:11–05:12], doctor [05:21–05:22], salón con flechas [05:25–05:26], paseo por el jardín [05:33–05:34].
- Los cortos de la pulga alternan con los humanos como comparación: pulga [05:02–05:06], humano [05:07], pulga [05:43–05:46], humano [05:47].
- Se prefieren cortes a movimientos de cámara. Los cortes de los primeros cortos coinciden con las frases del subtítulo, ~1 s por beat [00:04–00:07].
- Las escalas se cuentan cambiando la altura de cámara:
  - Pies gigantes con ángulo bajo = "enorme".
  - Plano alto en el cielo = "por encima de los edificios".

### Catálogo de planos (con timestamps)
**Planos generales, cámara fija**
- Calle de ciudad [01:02]: plano general fijo de cuerpo entero, personaje de camiseta roja en cuclillas con ambos brazos arriba.
- Lavandería [00:16]: frontal, fijo, cuerpo entero, a la altura de los ojos. Versión [06:19]: plano medio-general vertical, héroe centrado encogiéndose de hombros con las palmas abiertas.
- Lobby [00:02–00:03], [00:20], [01:05], [02:07], [02:11]:
  - Cámara baja y algo ancha, a la altura de los ojos o ligeramente baja, fija.
  - Cartel "WET FLOOR" en primer plano, cortado por la esquina del encuadre.
- Lobby en Blender [03:15–03:19]: cámara fija 9:16, cuerpo entero, ~altura de ojos. Personajes en el tercio central y suelo en el tercio inferior.
- Salón [00:00–00:01], [04:50–04:53]: medio-general, cámara fija.
- Escalera [00:02–00:03], [04:54–04:56]: medio-general a la altura de los ojos, fija, ~2 s con solo cambiar la animación.
- Escenario/teatro [01:30], [01:31]: general fijo con foco cálido.
- Aparcamiento [01:34–01:36]: cuerpo entero, manos en la cadera.
- Parking/jardín/salón de las viñetas: plano medio con horizonte claro y pequeños props.
- Plaza con el cráter y un transeúnte [05:50–05:51]: plano de establecimiento.
- Clínica [01:03]: medio-general de dos personajes, camiseta roja a la izquierda y doctor de bata a la derecha, separados.
- Test `silly_fa.mp4` [06:03–06:09]: cada corte cambia tamaño de plano, pose y color de cielo.
  - [06:05] primer plano de cabeza y hombros.
  - [06:06] cuerpo entero, cámara algo baja, cielo cian.
  - [06:07] cuerpo entero centrado, cielo amarillo.
  - [06:08] horizonte inclinado (ángulo holandés).
  - [06:09] cámara casi a ras de suelo con inclinación fuerte.

**Ángulos extremos y de escala**
- Escalada en fachada [00:00–00:01]: cámara girada para que el muro sea el suelo y el hombre quede tumbado de lado. Más tarde [00:23], la cámara mira hacia arriba por una esquina del edificio con él trepando con ambas manos sobre las lamas blancas.
- Rascacielos de cristal [03:51]: plano alto-ancho en contrapicado, figura diminuta colgada, rayas de lluvia, taxi amarillo abajo, cielo gris plano.
- Contrapicado extremo mirando el edificio con la figura roja diminuta arriba, farolas a ambos lados [05:00]. El mismo ángulo con los pies en primer plano y la figura en el cielo [05:42].
- Suelo extremo [04:57]: pantalones y zapatos negros ocupando la parte alta del encuadre, como si la cámara estuviera bajo un gigante. Debajo, suelo de ajedrez marrón con una nubecita de polvo cúbica. Al fondo, edificios y un coche azul.
- Tienda de zapatos [02:12]: cámara a ras de suelo sobre parquet en espiga. Las piernas de un hombre alto llenan el encuadre y hay una cabeza boca abajo arriba a la derecha.
- Piernas y zapatos solos, con grietas y astillas bajo los pies [05:27]. De nuevo solo piernas, con terrones saltando [05:35].
- Cenital sobre un cráter de asfalto agrietado con el personaje en cruz [02:23], [05:49]. Cenital de ciudad en bloques con el personaje cayendo con los brazos abiertos [05:47].
- Seguimiento lateral en plano medio-completo de un hombre caminando por el jardín [02:24–02:28].
- Cielo [04:58–04:59]: personaje flotando en T o con brazos abiertos. Se ve el borde de una azotea con cajas de aire acondicionado, así que la cámara lee como "por encima del tejado".
- Planos de sección: corte transversal del suelo con vigas y pilotes y un barril y cajas debajo [05:28–05:29]. Anatomía/rayos X con cuerpo rojo translúcido [01:33].

**Primeros planos de cara (beats emocionales)**
- Cara llenando el encuadre sobre cielo de nubes, con push-in lento y leve inclinación de cabeza [00:04–00:05].
- Cara de susto sobre fondo azul de agua, cabeza inclinada [00:06–00:07].
- Llanto extremo con edificio y círculos crema desenfocados detrás [01:04].
- Push-in lento de ~3 s sobre cara asustada con jersey a rayas [03:47–03:50].
- Mirada escéptica a cámara [05:01]. Grito [05:10]. Llanto [05:14].
- Carcajada de ojos entrecerrados, dientes visibles, con barra blanca vertical a la izquierda [06:47–06:48].
- Macro extremo de la almohadilla rosa de resilina de la pulga, con flechas apretándola [05:05]. Pulga de perfil en plano medio-corto [05:02–05:04].

**Gags de composición**
- Doctor con etiqueta de precio [05:21] y elefante sobre los hombros con un transeúnte reaccionando [05:13]: encuadres cómicos lado a lado.
- Cartel de tienda/ pulga: dos versiones del mismo plano mostradas a la vez para comparar [02:22], [02:23].
- Zoom lento sobre grabaciones de pantalla en la UI de Claude [05:53–05:54]. Transición whip-pan con desenfoque [05:55–05:56]. Empuje con zoom-blur sobre el pack de personajes [01:22–01:27].

**Hoja de contactos de las 42 escenas [04:44–04:46]** (rejilla de miniaturas verticales con etiqueta encima)
- Hombre de jersey rojo y pantalón negro en cuerpo entero.
- Primerísimo primer plano de cara con cuello rojo. Una cara con la boca abierta y estirada, como un grito (fila 3, primera miniatura).
- Piernas gigantes de cintura para abajo sobre figuras pequeñas.
- Calle con torres de apartamentos en bloques, suelo de ajedrez y cielo azul.
- Hombre en azotea con jersey rojo y nubes.
- Martillo de madera y parque verde con estrellas, más figura pequeña en el césped.
- Pulga gigante marrón con patas peludas sobre fondo azul ruidoso.
- Óvalo/piscina rosa sobre el mismo fondo.
- Poste blanco vertical sobre azul, dispositivo tipo báscula con figura, cronómetro.
- Velocímetro con aguja roja, figura con aura naranja sobre azul oscuro.
- Bocadillo "$$$$" con figura de traje y varias personas en una habitación.
- Explosión de escombros en un edificio, cena con comensales y techo con escombros.
- ~1/3 de los planos usan un fondo azul oscuro de ruido como fondo "infográfico" (pulgas, cronómetros, postes). El resto son habitaciones o calles 3D completas.

**Cortos de contacto con gags de escena** [02:09–02:10]: escalada de rascacielos, lobby, rueda de reconocimiento con gecko verde y araña (números "2" y "3"), hombre de traje con brazos arriba en una azotea soleada con paneles solares, tienda de zapatos "…ES", hombre junto a lavadora con cubos de colores, hombre de camisa a rayas con brazos arriba, cartel "LAB 3" con figura en un escritorio.

## Personajes y rig

### Aspecto
- Cuerpos low poly con textura de foto real en la cara. La silueta de la cabeza es facetada (línea del pelo y orejas visibles) [00:04–00:07], [01:45–01:49], [03:47–03:50].
- La textura de la cara se estira y emborrona donde envuelve cuello, cuello de camisa y hombros. Se ve textura beige rayada en el cuello [00:06]. El borde del cuello de la camiseta roja es "ragged/fuzzy" [02:03–02:06].
- Pelo sin esculpir, con borde duro [06:03–06:05]. Hombros angulosos.
- Ropa de colores planos: camisa roja + pantalón negro (héroe, igual en todos los planos para que se lea como un único personaje) o traje negro con camisa blanca y corbata. El traje es borroso con solapas y corbata fina pintadas.
- Hojas de cuerpo en T-pose, frontal, brazos rectos, fondo gris [06:14]: camisa roja con pantalón negro, y traje negro con camisa blanca y corbata. Héroe en T-pose: camisa roja de botones, pantalón gris/negro, zapatos oscuros, sobre negro [01:35–01:36].

### Cómo se consiguieron los modelos
- **Intento 1 [01:08–01:11]:** Claude construyó el personaje desde cero en Blender (camiseta azul "MR OMI" y vaqueros, bajo foco). Cara sosa y manos malas (dedos curvados rígidos). Transcripción [01:09]: "The face looked wrong. The hands look worse."
- **Búsqueda en Sketchfab [01:12–01:20]**, ~3 horas.
  - Términos: "psx character", "low poly people rigged", "ps1 character pack".
  - Filtros: Downloadable, Animated, Rigged, Low poly, Free.
  - Se probaron 11 packs de 9 artistas, y la mayoría de miniaturas quedaron con X rojas.
  - Estado del agente: "Noodling… 19 tokens", "Simmering… 158 tokens".
- [01:21] Se alcanzó el límite diario de descargas de Sketchfab: "The candidates can be grabbed tomorrow." También [02:00].
- **Pack ganador [01:22–01:27]:** rejilla de ~12 × 5 (100+) personas en T-pose, hombres y mujeres.
  - Trajes: médicos, policías, oficinistas, camuflaje militar, trajes amarillos.
  - Fondo plano verde-gris.
- **Retratos [01:28–01:29]:** ocho con caras de foto real sobre cuerpos low poly: camisa azul, camiseta verde azulado, jersey mostaza, jersey gris, bata con camisa oscura, camisa negra, hombre mayor de traje con corbata roja, bata blanca con gafas y barba.
- Transcripción: "Everyone with a real photo for a face. And everyone is ready to animate." Es decir, ya traen rig.
- Skool [06:33]: miniatura del curso con ~diez personajes con cara de foto en prado, flores de cerezo rosa, bombero, mujeres con vestido, traje hazmat amarillo, hombre calvo con chaqueta verde y la camisa roja. Posan con brazos arriba, saludan o están sentados con las piernas cruzadas.

### Atlas de textura y cambio de ropa
- [01:41–01:43] Atlas UV repintado: camisa, pantalón, dos caras, manos, zapatos y cinturón. La camisa se recoloreó rojo → verde → rojo. Transcripción: "It's just a model with a picture on it. So we can repaint it into anything."
- Cambio de ropa regenerando la textura con generación de imagen de ChatGPT [06:12]. Plan gratuito, una imagen por paso: "I give you the guide picture and the text, you send me the picture back." [06:11]
- Hoja plana frontal de cara + camiseta roja sobre fondo negro, que es lo que se mapea a la cabeza [00:17–00:19].

### Personajes secundarios
- Extras: camisa verde con pantalón beige [04:54–04:56], [05:13], [05:39], [05:50].
- Hombre mayor corpulento con traje gris y corbata roja, junto al de camiseta roja ("but the parents" / "it was sugar"); mujer con blusa floral ("MOTHER-IN-LAW"); hombre de bata blanca con portapapeles; soldados de uniforme verde [00:48–00:51]. Doctor de bata blanca [05:21].
- Dos pilotos con casco [05:20]. Cinco comensales sentados [05:30]. Extras de traje en el lobby (5 en fila [01:05]). Policía/traje amarillo hazmat entre los extras.
- Lobby en Blender [03:15–03:19]: mujer de blazer azul y pantalón negro con una mano en la cabeza u oreja, hombre de traje azul marino con camisa blanca y pantalón gris, hombre de camisa blanca, corbata oscura y pantalón negro. Los cuerpos son proyectados con foto, planos.
- Pulga: abdomen segmentado naranja-marrón con patas finas y una esfera rosa (resilina) en la parte trasera. Se rota y anima en una postura agachada [05:02–05:04], [05:43–05:46]. En [00:09] es un modelo marrón gigante con un punto rosa. Un gecko low poly con ojos amarillos y manos abiertas [00:08–00:09].
- Esqueleto rayos X: cuerpo rojo translúcido con caja torácica, pelvis y columna brillante. Rojo-naranja cuando se rompe [05:18–05:19], cian-verde cuando está intacta [05:24]. En la ronda 2: "spine x-ray rebuilt".
- Quedó mal en la primera tanda: un niño interpretado por un adulto y chicle que parecía piedras rosas (transcripción).

### Rig
- Blender [01:51–01:52]: `Character_05` + `Character_05.rig`.
- Nombres de huesos estilo MakeHuman: `upperarm01.{s}`, `lowerarm01`, `spine02`, `finger{fi}-{j}.{s}` (fi 1–5, j 1–3, lados "L"/"R") [02:34–02:35].
- Rig con shape keys (blendshapes estilo ARKit; ver Caras).
- Carpeta `me` (personaje propio): ver Archivos.

## Caras y expresiones

### Sistema de textura de cara
- La cara es una imagen plana. El cambio de cara es solo una nueva textura de foto sobre la misma malla de cabeza. Forma de pelo y polígonos no cambian. A la izquierda la cara original, a la derecha una nueva (pelo oscuro, barba de unos días, ojos azules) [00:17–00:19].
- Transcripción [01:56–01:58]: "The face is one flat picture. So I made pictures of different expressions."
- Textura de cara [01:56–01:57]: ~40% superior color de pelo marrón oscuro, la parte inferior es piel plana. Una foto frontal se proyecta sobre la cabeza, con orejas y bordes difuminados en la piel [02:03].
- Seis fotos de expresión del mismo hombre se pasan a Claude como imágenes cuadradas planas, una por plano [01:58–01:59], [02:00]:
  1. neutral / sonrisa suave
  2. sonrisa grande
  3. sorprendido (ojos muy abiertos, boca abierta)
  4. llanto / mueca
  5. risa (ojos entrecerrados, boca muy abierta)
  6. asustado / gritando / angustia
- Se envuelven en una cabeza low poly y cambiar la textura cambia la expresión, sin rig facial ni animación [02:01–02:06]. Vista previa 2×3 sobre negro con camisa roja con cuello [02:02]. Luego grande y pequeño lado a lado: sonrisa [02:03], susto [02:04], llanto [02:05], risa [02:06].
- Los cambios son swaps duros de textura. La cara "salta" entre estados en vez de mezclarse, y no se indica el tiempo de los swaps.
- Frases del chat: "these are his faces, one per shot", "Put the six faces on the head", "All six faces work on the head. Here is the check." [03:20, 03:27]. En cada plano se pone una de las seis caras.
- Expresiones usadas en los cortos:
  - [00:06–00:07] cara de susto como corte de remate en el gag de la báscula.
  - [01:45–01:49] neutral → gran sonrisa → llanto. El llanto se usa en [01:04] y [01:53–01:55] muestra la hoja correspondiente.
  - [05:01] escéptico. [05:07] mueca de enfado agachado. [05:10] grito de horror. [05:14] sollozo. [05:21] cara de dolor con collarín. [05:38] aturdido neutral con estrellas. [05:47] grito con boca abierta cayendo. [06:47] carcajada.
  - [03:47–03:50] asustado: ojos muy abiertos, cejas arriba, boca en "O".
- Blendshapes en el script de código (alternativa, no la usada en los cortos finales) [02:34–02:35]: `SURPRISE = {"browinnerup":1.0, "browouterupleft":0.9, "browouterupright":0.9, "eyewideleft":0.85, "eyewideright":0.85, "jawopen":0.42, "mouthfunnel":0.25}`.

### Cara propia (héroe personalizado)
- Prompt: `add a main character` [06:17]. Claude pregunta "Do you want your own main character? Send me one photo…" [05:52–05:59].
- Se busca una foto ("David Gandy", pestaña Images) y se elige un retrato frontal de traje [05:55–05:56].
- Claude pide: "Send me one photo: the face straight to the camera, even light, nothing over the face, one person. A selfie is fine." El usuario adjunta y escribe "this is me" [05:57–05:58].
- Resultado [05:59], [06:00], [06:04], [06:10]: tres renders de la nueva cabeza sobre el cuerpo de camisa roja (frontal, 3/4, perfil) sobre gris. Antes/después de cabeza en dos paneles [06:00], con foto de referencia fijada arriba a la derecha.
- Tarjeta de aprobación: "Here is the new head on the body. Is that you?" Opciones: "That's me — Keep this head" / "Try the picture again — Ask ChatGPT for a new one" / "Stop here — Everything so far stays saved".

## Movimiento (Kimodo y librería de movimientos)

### Intento 1: animación por código (limitada)
- Chat [02:33]: "Move the characters with code: arms, breathing, the head".
- Script `before_anim.py` en VS Code, proyecto `PEOPLE-MOTION` (`.venv`, `before_anim.py`, `README.md`, `requirements.txt`) [02:34–02:35]:
  - `def rot_world(bone, axis, ang)`: rota un hueso de pose alrededor de su cabeza.
  - `def aim(bone, d)`: apunta un hueso en una dirección.
  - `def seg(f, a, b)`: smoothstep `x*x*(3-2*x)` sobre rampa 0–1 limitada.
  - `BUTTON = Vector((-0.22, -0.58, 1.12))`: objetivo de la pulsación del botón.
  - `keys = body.data.shape_keys.key_blocks`.
  - `b.rotation_mode = "QUATERNION"`, bucle `for f in range(NF)`, `b.matrix_basis = REST[b.name].copy()`.
  - Brazos relajados por lado: `aim("upperarm01.{s}", Vector((0.13*sx, 0.02, -1)))` más `lowerarm01`.
  - Dedos: `for fi in range(1,6)`, `for j in (1,2,3)`, huesos `finger{fi}-{j}.{s}`.
  - Respiración: `rot_world("spine02", Vector((1,0,0)), math.radians(0.6 * math.sin(2 * math…` (~0.6° senoidal en la columna).
  - Alcance: `reach = seg(f, PF-25, PF) * (1 - seg(f, PF+20, PF+45))` (alcanza en 25 frames, mantiene, suelta en 25).
- Resultado [02:36–02:39]: hombre de camiseta azul y vaqueros sobre suelo blanco y fondo azul, perfil vertical, pulsa un botón rojo en un pilar gris con banda amarilla. Se ve rígido y mínimo; el narrador dice que es "not that good".
- Idle en el lobby [03:15–03:19]: pequeños cambios de brazos, respiración y movimientos de cabeza ("mocap-lite", rígido). La mujer mueve un brazo en un gesto idle.
- Poses de brazos arriba tipo T-pose con poco movimiento secundario en el héroe. El escalador de escaleras usa ciclo de caminar.
- Pantalla de dormir: "move the characters with code" sigue siendo la animación procedural: respiración y giros de cabeza simples.

### Intento 2: Kimodo (text-to-motion de Nvidia, mocap)
- Terminal "kimodo". Pista: `Try "edit <filepath> to …"`, `? for shortcuts`, `Thinking off (tab to toggle)`. Carga: `loaded kimodo-soma-rp on cuda:0 in 18.2s` [02:41–02:45], [03:00].
- Tarjeta: "Kimodo – Scaling Controllable Human Motion Generation" [02:44]. Transcripción: código abierto de Nvidia, entrenado con 700 horas de gente real moviéndose, necesita un modelo de texto para convertir la frase en números.
- Una frase = un clip de movimiento, en inglés llano: `> A man slips and falls on his back.` [02:51–02:53], [03:00].
- El codificador convierte la frase en un bloque de números que se rellena fila a fila. Última línea `... 4,096 numbers` [03:01–03:03]. Las filas (8 valores por fila, con signo, 4 decimales) empiezan así:
  - `-1.9688 -4.8750 -1.7422 +0.5312 -0.3438 +1.8906 -2.6875 +0.3594`
  - `-3.8438 -1.7188 -0.0413 -1.4844 +2.8281 +0.1226 -0.0981 -1.0781`
  - `-2.3281 -0.6680 +2.6719 -1.9844 +1.7344 +1.9141 -2.6719 +1.1328`
  - `+0.1543 +0.8359 +1.5781 -1.2656 +0.0566 +0.2422 +0.4316 -1.9922`
  - `-0.5586 -1.4531 -0.2715 +0.5273 -1.0859 -2.2031 +1.8516 -2.5781`
  - `+0.6016 +1.8438 +0.2158 +1.4922 +0.6602 -0.3027 +0.6367 -1.9297`
  - `-2.2344 -6.4375 -0.4746 +1.4922 +1.5078 +2.4219 -3.8906 -1.9219 ... 4,096 numbers`
- Resultado en el lobby [02:54–02:55]: el de camiseta roja empieza erguido, levanta ambas piernas y aterriza plano sobre el suelo de ajedrez junto al cartel de suelo mojado. Cámara fija a la altura de los ojos, medio-general. Tiene peso e inercia de mocap, un gran salto respecto al rig por código. [03:04] versión final: ya en el suelo, apoyado en un brazo, pose pesada y laxa.
- Tamaño: modelo 1 GB, lector de frases 15 GB, todo junto más de 20 GB (transcripción [03:05–03:14]).
- En el chequeo inicial Kimodo aparece "not installed" (ver Archivos).

### Librería de movimientos (hojas de contactos [02:46–02:49])
Maniquís de camisa blanca y pantalón negro sobre suelo gris, con el nombre del clip.
- Hoja inicial: poses de brazos arriba, "deep_breath", "blow_kiss", clips "happy_…".
- SAD (14): "rub_neck", "regret_hands_head", "lonely_sway", "give_up", más clips de sentarse en el suelo y en silla, un suspiro y manos en la cabeza.
- RUDE (16): shoot_angry, shake_fist, stomp_foot, shove, punch, slap, kick, throw_down, dismiss_wave, crossed_annoyed, mock_laugh, what_is_wrong, stomp_sway, threaten_lean, facepalm, flip_table.
- SCARED (16): startle_back, hands_up_shield, cower_crouch, tremble, look_around_nervous, back_away, turn_and_run, scream_cheeks, clutch_chest_shock, shield_lean, duck_peek, freeze_stiff, shiver_stand, tiptoe, gasp_step_back, fall_back_scared.
- PAIN (18): hold_stomach, hold_head, hop_foot_pain, cough, sneeze, vomit, choke_throat, dizzy, hands_on_knees, back_pain.
- Cuadrícula de 6 poses en 2 filas de 3 sobre fondo blanco y suelo gris: baile y hip-hop, sentadilla profunda con brazos sobre la cabeza, pose Y con brazos arriba, manos cerca de la cabeza [00:12–00:14].
- Ejemplo: prompt `> a man shrugs, both palms up` (monoespaciado, cursor naranja) [00:15] → encogimiento de hombros de cuerpo entero con hombros subidos y palmas arriba [00:16].
- Escalada: poses pegadas a la superficie con brazos alcanzando arriba [00:23].

### Poses y movimientos vistos en los cortos
- Sentadilla con brazos arriba para cargar un salto [05:07], [05:31]. Pose de báscula con rodillas flexionadas y brazos abajo [05:09].
- Ciclo de caminar de perfil [05:33–05:34]. Sentado erguido en asiento eyectable [05:17]. Boca abajo al pie de la escalera [05:23].
- Manos en la cadera, chulo [05:40–05:41]. Sentado incrustado en el césped [05:39]. Ragdoll en cruz al impactar [05:49].
- Test [06:06–06:09]: baile con rodillas dobladas, saludo con ambas manos, risa con cuerpo hacia atrás, tumbado con piernas pateando. Parecen clips de stock/mocap.
- Salón [00:00–00:01]: cuclillas → atraviesa el techo con las piernas colgando. Escalera [00:02–00:03]: el de camiseta roja saluda abajo, el de verde corre o salta en el aire por la escalera.
- Pulga: pose agachada "winds up" [00:11] y luego el salto.

## Escenarios, props y luz

### Estilo general
- Escenarios hechos de geometría simple (cajas con texturas de papel pintado, madera, ajedrez), con modelos 3D reales descargados para llenarlos (gente, árboles, cartel de suelo mojado, estanterías) [02:14–02:19].
- Texturas de baja resolución, nítidas (nearest-neighbour/pixeladas), con fotos de cara estiradas y caras facetadas. Eso da el aspecto PS1. No se ve dither ni jitter de vértices en los fotogramas fijos.
- Luz plana y brillante, de bajo contraste, con sombras blob suaves (p. ej. bajo el personaje que camina [05:34]). Sin niebla ni sombras duras. Conos de foco en los escenarios de teatro. Tono cálido en salones.
- Colores primarios saturados (jersey rojo, cielo azul, paredes verde menta).
- Fondos abstractos para chistes conceptuales: textura azul de agua en movimiento ("water-noise") para pulga, rayos X, báscula, cronómetro, velocímetro [00:09–00:11]. Textura de ruido verde con disco rosa para el aterrizaje de la pulga [05:44–05:46]. Mármol azul tipo camuflaje para el corto del chicle. El tinte pasa a morado con viñeta de brillo rojo cuando se rompe la columna [05:19].
- Cielos: fotos de cielo azul con cúmulos tras caras [00:04–00:06], gradiente azul con nubes planas low poly y destello de sol arriba a la izquierda [04:58–04:59], gris plano [03:51], y cielos de color plano (grisáceo, cian, amarillo) que sirven para marcar cada corte [06:05–06:09]. El cielo por defecto es la carpeta `skies`.
- Suelos: ajedrez de teselas enormes con perspectiva fuerte (da escala barata) [06:03].

### Escenarios por corto
- **Salón** [00:00–00:01], [04:50–04:53]: papel pintado de flores melocotón/naranja damasco, sofá chesterfield marrón con cojines naranjas, mesa de café de madera, cuadro, lámpara colgante redonda (globo), suelo de madera, techo gris. Gag: el de camiseta roja atraviesa el techo; se abre un agujero de yeso con cielo azul detrás y caen partículas de escombros blancos cúbicos con las piernas colgando.
- **Escalera** [00:02–00:03], [04:54–04:56]: papel pintado verde azulado/menta con patrón, cuadros, escalera de madera con barandilla blanca y pasamanos de madera, suelo ajedrez blanco y negro.
- **Lobby** [00:02–00:03], [00:20], [01:05], [02:07], [03:15–03:19]:
  - Pared gris con banda marrón, dos puertas de ascensor gris-azuladas con indicadores naranjas "▲ 12", suelo de ajedrez gris y blanco (con textura sucia).
  - Cartel amarillo "WET FLOOR" con triángulo, en primer plano a la izquierda.
  - Multitud de personas con textura de foto, trajes y ropa casual.
  - Construcción progresiva en Blender, deslizando el timeline por los frames 39, 69, 99, 129 y 159 [02:14–02:19]:
    - Frame 39: pared gris con banda marrón.
    - Frame 69: suelo ajedrez.
    - Frame 99: puertas, señales "12" y cartel de suelo mojado.
    - Frame 129: tres personas en T-pose (mujer de blazer azul, hombre de traje azul marino, hombre de camisa blanca y corbata).
- **Zapatería** [00:21–00:22], [01:32–01:33], [02:12], [06:25–06:26]: zapatos gigantes marrones, cartel naranja "114" y cartel rojo "…ES" / "SHOES", estanterías con cajas y zapatos de colores, suelo de parquet, pared de color crema.
- **Lavandería** [00:16], [06:19]: pared gris/hormigón, estante con tres cajas de colores (naranja, azul, amarilla), lavadora blanca de carga frontal con ojo de buey, suelo de ladrillo o adoquín, poste rojo y blanco a rayas a la izquierda.
- **Laboratorio** [02:22], cartel "LAB 3": etiqueta "$$$$" enorme, más ancha que el personaje, reloj de pared, caja de rayos X, archivador, suelo ajedrez. Clínica [01:03] con los mismos props.
- **Escenario/teatro** [01:30], [01:31]: parquet, pared trasera roja, cortinas oscuras, mancha de luz roja suave y foco cálido; cono de foco desde arriba.
- **Jardín trasero** [02:24–02:28], [05:33–05:39]: valla de madera, gnomo con sombrero rojo, hierba, cielo azul con cúmulos. Primero versión de "árboles blob" planos verdes (rechazada por Claude) [02:24–02:25]; segunda con modelos reales [02:28].
- **Aparcamiento** [01:34–01:36], [05:40]: línea amarilla, coches azules y blancos, barreras de hormigón, edificio, contenedor azul.
- **Calle/plaza** [01:02], [05:50]: edificio en bloque con ventanas azules y algunas encendidas en crema, papelera verde, coche azul/rojo, cartel rojo, farolas, suelo de ajedrez marrón y negro. Ciudad en bloques gris-blanco vista desde arriba [05:47]. Salón verde/melocotón/amarillo y comedor de parquet con cuadro y reloj [05:23–05:30].
- Exteriores caricaturescos simples: edificio alto con ventanas iluminadas, farolas, otros rascacielos, nubes [00:08].
- Aparcamiento: hombre sobre cráter de asfalto agrietado [02:23]: líneas negras, escombros grises low poly, línea de carril blanca, barra amarilla. Versión izquierda con nube de polvo, derecha sin ella.

### Props de gags
- Báscula con esfera de reloj [00:10–00:11], [05:09]; reloj analógico grande de pared y pedestal con gecko diminuto.
- Tabla de alturas de comisaría con rótulos "1", "2", "3" sobre mosca/persona, araña y gecko [00:08–00:09].
- Etiqueta "$$$$" en un palo [05:21]. Martillo de madera gigante cayendo [05:36–05:37]. Elefante gris low poly [05:13]. Caza con cabina azul entre nubes [05:15]. Asiento eyectable con estela naranja [05:16–05:17]. Cronómetro con aguja roja [05:11]. Velocímetro con aguja naranja, escala 0–160 [05:48].
- Chicle: blob rosa low poly con punto verde sobre textura roja ruidosa ("STOMACH ACID") [01:32]; cuerpo rojo transparente con órganos y un chicle rosa [01:33]. Sótano: personaje tumbado mientras caen rocas hexagonales marrones [01:32]. Exterior: césped, valla, árbol [01:33].
- Props sueltos: reloj, báscula, pedestal, lavadora, sofá, lámpara, escalera, papelera, coche, estantes, rayos X.
- `organs.blend` y `core_props.json` (ver Archivos).

### Destrucción y efectos
- Grietas negras irregulares con cubos blancos o tostados [05:08], [05:27], [05:49]. Agujero negro irregular en el parquet con el personaje cayendo [05:32].
- Nubes de polvo en los pies [05:13]. Terrones marrones low poly [05:35], [05:38]. Cubos blancos de escombros y polvo cúbico [04:53], [04:57]. Ronda 2: "dust and white blobs gone".
- Lanzamiento de la pulga: anillo rosa en el suelo más una fina estela vertical [05:06]. Estelas de movimiento en el cielo al subir [05:17]. Estrellas girando sobre la cabeza [05:38]. Lluvia: rayas blancas verticales [03:51].
- Efecto "old crunchy low poly" se aplica a la voz, no claramente a la imagen.

### Escena Blender (`hero.blend`) [01:51–01:52]
- Ver detalles en Archivos. Es una escena multicámara con el rig del personaje en
