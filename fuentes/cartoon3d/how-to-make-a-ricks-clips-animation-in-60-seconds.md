# How to Make a Ricks Clips Animation in 60 Seconds

- Link: https://www.youtube.com/watch?v=gsPV3pf-nnk
- Canal: g russ
- Fecha: 2026-11-08
- Tema: cartoon3d

## De qué trata
El video resume en 60 segundos el "método" para lograr el estilo de animación 3D cartoon del canal Ricks Clips (154 mil suscriptores, un short con 25 millones de vistas). Lo divide en cinco pasos: cara, proporciones, movimiento, cámara y acabado. Está pensado para creadores de shorts que quieren reproducir ese look. Al final propone saltarse el trabajo manual y generar el video completo con la herramienta Creatorize (estilo "3D Cartoon Shorts") a partir de una locución.

## Pasos / método
1. **[00:08]** **Paso 1, la cara:** usar un "kit de cara" mínimo y igual en todos los personajes. Son dos óvalos negros como ojos, boca pequeña, cejas cortas y sin nariz. Lo que diferencia a cada personaje es el sombrero o la cabeza, no la cara (00:10–00:16).
2. **[00:17]** **Paso 2, proporciones:** medir todo en "cabezas" (personajes de cabeza grande). Las extremidades son muy finas, de alrededor del 6 % del ancho de una cabeza. Las manos son bolitas de tinta, sin dedos.
3. **[00:23]** **Paso 3, el "snap":** cada fotograma es una pose nueva, sin interpolación suave. Casi todo el movimiento ocurre en los primeros 4–5 fotogramas. Cuando el personaje se detiene, queda completamente quieto.
4. **[00:30]** **Paso 4, la cámara:** casi nunca está quieta (solo en ~4,5 % de los fotogramas). Se usan empujes (push in), órbitas y un whip (paneo rápido) que frena de golpe en un fotograma. Los cortes caen justo en la palabra de la locución.
5. **[00:38]** **Paso 5, el acabado:** aplicar 9 efectos por fotograma (luz del mundo, aire y niebla, bruma, profundidad de campo, bloom, pantalla, personajes encima, partículas y corrección de color).
6. **[00:44]** **Alternativa automática:** abrir Creatorize, elegir el estilo 3D Cartoon Shorts, subir la locución y pedir que el asistente genere el video de principio a fin en un solo chat.

## Lo que se ve en pantalla
- **[00:00–00:08]** Comparación de clips de Ricks Clips y Creatorize. Cifras: 154K suscriptores y un short con 15M de vistas ("Why Perfect Railroads Don't Work"); el audio dice 25 millones.
- **[00:14]** Ejemplos de sombreros que distinguen personajes: boina, sombrero de guardabosques y chistera.
- **[00:24]** Código de ejemplo: `pose = char.eval(t)`, `char.face(t, { eyes })` y el comentario "0 frames between faces" (una pose nueva cada fotograma).
- **[00:26]** Comparación de avance del movimiento en fotogramas: Ricks Clips 0 %, 17 %, 31 %, 52 %, 66 %, 72 %, frente a la secuencia f0–f5 de Creatorize.
- **[00:32]** Etiqueta "camera moving" con barra casi vacía (cámara quieta muy poco tiempo).
- **[00:34]** Icono "Push in" como tipo de movimiento de cámara.
- **[00:36]** Gráfico de un whip, con píxeles movidos por fotograma: f1 49, f2 46, f3 39, f4 32, f5 23, f6 0.
- **[00:40]** Lista de los 9 efectos: world light, air and fog, haze, depth of field, bloom, screen, characters on top, particles y colour grade.
- **[00:46]** Menú "Style" de Creatorize (estaba en "Pixel art"), con opciones "3D Cartoon Shorts (Legacy)" y "3D Cartoon Shorts (New)". La opción New aparece resaltada.
- **[00:48]** Pantalla "Story" con tres modos: "Claude writes it", "I have a script" e "I have a voiceover" (seleccionado). Acepta WAV, MP3, M4A, FLAC y OGG; hay un campo "Name" y un enlace "Add direction for Claude".
- **[00:50]** Resumen final del chat: un video de 33 s en formato 9:16 (backrooms). Explica lo que hizo cada pasada (build, camera con "Dread Cuts", environment en Blender, etc.).
- **[00:56–00:58]** Botón "Get Creatorize" y "Link in bio".

## Consejos y advertencias
- **[00:15]** Mantener la cara idéntica en todos los personajes y diferenciarlos con el sombrero o la cabeza.
- **[00:22]** No dibujar dedos: las manos son círculos simples.
- **[00:28]** Cuando el personaje termina un movimiento, debe quedar totalmente quieto para que el snap se note.
- **[00:31]** Evitar la cámara estática: mantenerla en movimiento casi siempre y cortar sobre la palabra.
- **[00:52]** Entrenar tu propio estilo es posible, pero el autor advierte que no se verá igual a este.

## Lo que no queda claro
- El video no explica cómo implementar los pasos a mano (software, rig o herramientas); solo describe las reglas.
- El audio da 25 millones de vistas, pero la pantalla muestra "15M" en 00:06; conviene verificar.
- Las cifras (6 % de cabeza, 4,5 % de cámara quieta, 19 ms por fotograma) no tienen fuente visible.
- En la pantalla se ven dos versiones del estilo (Legacy y New) y solo se resalta New; no se aclara cuál usar exactamente.
- Los últimos pasos (revisión, ajustes, exportación y publicación) y el costo de Creatorize no se detallan.
- El audio menciona "Berserk" como asistente, mientras que en pantalla aparece "Claude"; no se aclara la relación.
