# How to Make a 3D Cartoon Look This Good in 60 Seconds

- Link: https://www.youtube.com/watch?v=lCaTVGx2Cxc
- Canal: g russ
- Fecha: 2026-11-08
- Tema: cartoon3d

## De qué trata
El video explica cómo lograr que un corto de dibujos animados en 3D se vea mucho más cinematográfico, usando cuatro pasadas (cámara, entorno, postprocesado y sombreado) sobre la "plain build", la versión base. Es para creadores de contenido corto que usan Creatorize. El resultado es un corto con cámara cercana, escenarios con textura, efectos de imagen y luz y sombras en personajes. Al final se propone saltarse todo el trabajo manual y dejar que un chat de Creatorize haga todas las pasadas.

## Pasos / método
1. **[00:03]** Partir de la "plain build" (versión base del corto) y sumarle 4 pasadas para obtener el look final.
2. **[00:06]** **Paso 1, Cámara:** la versión base deja la cámara lejos. Esta pasada agrega una cámara real que se acerca para que un rostro llene la pantalla, a diferencia del plano lejano de la versión base (comparación en [00:10]). Se puede elegir entre 5 estilos de cámara ([00:13]).
3. **[00:16]** **Paso 2, Entorno:** las paredes planas se reemplazan por sets reales con textura (por ejemplo acero atornillado). Los personajes no cambian; solo se reconstruye el mundo a su alrededor ([00:19]).
4. **[00:24]** **Paso 3, Post:** cada fotograma pasa por 9 efectos en orden, entre ellos niebla, profundidad de campo, bloom y corrección de color. Las sombras se aplican encima, así que nunca quedan desenfocadas.
5. **[00:30]** **Paso 4, Sombreado:** la luz golpea rostros y ropa, con un brillo pálido en el borde. Cada personaje se redibuja tal como lo "ve" el sol, solo para generar su sombra (shadow pass) ([00:35]).
6. **[00:40]** Alternativa rápida: en Creatorize elegir el estilo de cortos 3D Cartoon, añadir la locución y pedirle a Berserk que lo haga de punta a punta. Un solo chat ejecuta todas las pasadas.
7. **[00:48]** Cierre: entrenar un estilo propio es posible, pero no daría este resultado. Para publicar el primer corto, usar Creatorize (enlace en la bio).

## Lo que se ve en pantalla
- **[00:14]** Menú "Camera style" con 5 estilos más una opción automática:
  - "Let Claude pick" (Claude mira el video y elige el estilo que mejor encaja).
  - Dread Cuts: cortes secos sobre las palabras, cámara baja e inclinada, empuje lento en cada plano.
  - One Take: una sola cámara continua que flota con los personajes, sin cortes.
  - Found Footage: cámara de teléfono temblorosa, como si uno de los personajes filmara.
  - The Watcher: observa desde lejos con teleobjetivo y se acerca poco a poco.
  - Through the Steel: la cámara sigue el sonido a través de paredes y agua.
  - También hay un campo "Notes for Claude (optional)".
- **[00:16]–[00:22]** Comparación antes/después: etiqueta "Flat walls" contra "Bolted steel"; "Characters: same" y "World: rebuilt".
- **[00:24]** Código de `post.js`: orden de una imagen: world → air → haze → dof → bloom, y screen → actors → particles → grade. Son 9 pasadas y los actores nunca se filtran.
- **[00:26]** Ejemplos de efectos: Fog, Depth of field, Bloom, Colour grade.
- **[00:32]–[00:38]** Un rayo desde un sol golpea la cara del personaje; "What the sun sees" muestra la silueta oscura del personaje usada para la sombra.
- **[00:42]** Selector de estilos: "3D Cartoon Shorts (New)" (personajes con caras dibujadas en sets 3D ricos con cámara real) frente a "3D Cartoon Shorts (Legacy)" (cabezones, sets muy cargados) y otro estilo low-poly tipo videojuego.
- **[00:44]** Mensaje de chat "make me a video from this, end to end" con un audio WAV adjunto.
- **[00:46]** Lista de progreso: storyboard, escenas, ángulos de cámara, renovación del entorno, postprocesado, pasada de sombreado y mezcla de sonido.

## Consejos y advertencias
- **[00:29]** Las sombras se aplican después del desenfoque, para que se mantengan nítidas.
- **[00:24]** El orden de las pasadas importa: los actores nunca se filtran con los efectos del mundo.
- **[00:42]** Elegir la versión "(New)" de 3D Cartoon Shorts para obtener este look.
- **[00:48]** Entrenar un estilo propio no daría el mismo resultado, según el autor.
- **[00:14]** Si no se sabe qué cámara usar, se puede dejar que Claude la elija.

## Lo que no queda claro
- El video promete "60 segundos", pero no aclara cuánto tarda realmente el proceso completo.
- Hay una inconsistencia: el audio dice "tell Berserk" mientras la pantalla muestra "Claude"; no se explica la relación entre ambos.
- No se detalla cómo aplicar cada pasada de forma manual, solo qué hace cada una.
- No se menciona precio, requisitos ni límites de Creatorize.
- Los estilos de cámara se listan en pantalla sin explicar cuál conviene para cada tipo de historia.
