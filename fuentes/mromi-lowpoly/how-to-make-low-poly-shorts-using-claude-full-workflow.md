# How to Make Low Poly Shorts Using Claude (Full Workflow)

- Link: https://www.youtube.com/watch?v=lBh7dN2ts88
- Canal: Mr omi
- Fecha: 2026-11-11
- Tema: mromi-lowpoly

## De qué trata
El video muestra cómo se arma, con Claude y Blender, un flujo para producir shorts de datos curiosos en estilo "low poly" (estética de juego de PS1). Cubre el personaje, las caras, los escenarios, el movimiento con Kimodo (modelo open source de Nvidia), los sonidos y el montaje en CapCut. Está pensado para creadores que quieren automatizar shorts. Al final ofrece un skill empaquetado en su comunidad de Skool, que hace casi todo con botones, incluido un personaje principal con la cara del usuario.

## Pasos / método
1. **[00:28]** Entrenar a Claude en el estilo con muchas imágenes de referencia y prueba y error. El principio es "entrenar, entender, corregir". Esto se explica en dos videos anteriores del autor.
2. **[00:45]** Primer intento fallido: 19 shorts en 10 horas, con errores como un niño interpretado por un adulto y chicle que parecía roca. El autor los calificó de "slop" y de ahí salieron las correcciones.
3. **[01:06]** Personaje: Claude intentó construirlo en Blender, pero la cara y las manos salieron mal. Se buscó entonces un pack ya hecho en Sketchfab y otros sitios.
4. **[01:17]** Se probaron 11 packs de 9 artistas hasta dar con uno de más de 100 personajes con foto real de cara y listos para animar. Como es un modelo con una imagen pegada, se puede repintar.
5. **[01:56]** Expresiones: la cara es una imagen plana, así que se generan imágenes de distintas expresiones y se intercambian sobre la cabeza. No hay animación facial.
6. **[02:07]** Escenarios: Claude construye cada lugar (paredes, piso, luces) y lo llena con modelos 3D reales. Después renderiza una imagen de cada escena, la revisa y corrige sus errores. Cambió los árboles de dibujo animado por árboles reales.
7. **[02:30]** Movimiento: Claude puede mover personajes con código, pero el resultado no convenció. Se usa Kimodo, entrenado con 700 horas de movimiento real, y se le escribe una frase como "un hombre resbala y cae de espaldas".
8. **[02:56]** Kimodo necesita un modelo de texto que convierta la frase en números. Kimodo pesa 1 GB, el modelo de texto 15 GB, y todo junto supera los 20 GB.
9. **[03:15]** Sonido: Claude escribe una línea de texto por cada efecto y una herramienta de IA de sonidos la convierte en audio.
10. **[03:29]** Como Claude no oye, se conectó Gemini para que escuche y compare mezclas. Sirve, pero inventa sonidos, así que el autor escucha él mismo y le indica a Claude qué falta.
11. **[03:47]** Regla aprendida: cuando la cara pasa a "asustado", se añade un grito humano real, muy sutil, 2 o 3 por short.
12. **[03:54]** Claude entrega la línea de tiempo de sonido en CapCut con cada sonido en su propio clip, y el autor ajusta el resto a mano.
13. **[04:04]** Versión simplificada: ver un video corto, conectar el plugin a Claude (aprox. 1 minuto), descargar una carpeta de assets, soltarla en Claude, pegar un mensaje y dar enter.
14. **[04:20]** Claude revisa el equipo e instala lo necesario, pidiendo permiso antes de tocar nada.
15. **[04:25]** Elegir tema, aprobar el guion, elegir voz (IA o grabada o subida), aprobar el plan de tomas y pulsar "Start Building".
16. **[04:42]** Claude construyó 42 escenas, las revisó una por una y se corrigió durante 4 rondas.
17. **[05:51]** Personaje propio: subir una foto frontal, comprobar la cabeza nueva sobre el cuerpo y, si se desea, cambiar la ropa. Luego se marca como personaje principal de todos los shorts.

## Lo que se ve en pantalla
- **[00:00–00:06]** Ejemplos del estilo: shorts de la escalera/ascensor, un gecko y una pulga.
- **[01:14–01:35]** Cuadrícula con decenas de personajes en pose T. Los dos primeros (de los intentos propios) están tachados.
- **[01:55]** Seis expresiones de la misma cara: neutra, sonrisa, sorpresa, llanto, risa y miedo, usadas como textura de la cabeza.
- **[01:49]** Blender 5.2 con `hero.blend`, `Character_05` y su rig, cámaras en la línea de tiempo (Cam1_Wide, Cam3_Wheel, etc.), render con Cycles y resolución 2560x1072.
- **[02:43]** Hoja de movimientos agrupados por emoción, por ejemplo la categoría SAD (14) con slump, walk, wipe_tears, sob_shoulders y otros.
- **[02:57]** Terminal con "loaded kimodo-soma-rp on cuda:0 in 18.2s" y el prompt "A man slips and falls on his back".
- **[03:10]** Carpeta `kimodo` de 21.1 GB en el directorio de usuario.
- **[03:31–03:44]** Lista de efectos con timestamps (monedas, whoosh, etc.). Se ve el comando `python listen.py --prompt ab3.txt ours_v2.mp4 ours_v1.mp4`, que compara dos mezclas con Gemini. Marcó 19 de 38 sonidos como ausentes de la mezcla.
- **[03:51]** Instrucción del autor: gritos reales solo al pasar a cara asustada, 2 o 3 por short, muy sutiles.
- **[03:58]** Proyecto de CapCut con muchos clips de sonido en pistas separadas.
- **[04:05]** Comunidad en Skool con tres cursos: The Plugin, 3D Animated Shorts y Low-Poly Shorts.
- **[04:12]** Carpeta `assets` con: `faces`, `motions`, `music_cc0`, `skies`, `textures`, `organs.blend`, `bed_tone.json`, `core_props.json`, `sfx_list.json` y `ir_room.wav`.
- **[04:18]** Mensaje de instalación: "Install this as my low-poly-shorts skill, then use it to make me a short" (skill de 57 MB). La verificación de setup mostró Windows 11, Python 3.14.0, ffmpeg 8.1.1, Blender 5.2.0, una RTX 5070 de 12 GB y 31 GB de memoria.
- **[04:25–04:39]** Opciones de tema (saltar como pulga, el juicio del papa muerto, la ballena explosiva). El guion elegido es "Why Flea Legs Kill You": 207 palabras, unos 58 s. Luego se elige voz IA o grabada y aparece el plan de 42 tomas, de unos 105 minutos de construcción.
- **[04:46]** Registro: ronda 1 con 42 escenas; ronda 2 con árboles reales, polvo y manchas blancas eliminados y rayos X de columna rehechos; render sin fallos.
- **[05:54–06:21]** Flujo del personaje propio: comando `/low-poly-shorts make me a short`, foto "this is me", prueba de cabeza con opciones (That's me / Try again / Stop), ChatGPT en plan gratis para generar la imagen por paso, y cambio de ropa. Se guarda en `characters/me`.
- **[06:28]** El skill adapta voz, ritmo y escenarios al canal configurado (ejemplo de canal de espacio).
- **[06:42]** Descripción del video con el enlace a skool.com/mromi.

## Consejos y advertencias
- **[00:35]** Cada estilo es distinto, pero el método base es el mismo: entrenar, entender, corregir.
- **[01:06]** No confiar en que Claude modele bien caras y manos desde cero: es mejor partir de un pack existente con foto real.
- **[01:20]** Sketchfab limita las descargas diarias; hay que prever el tope.
- **[02:19]** Pedir a Claude que renderice y revise cada escena detecta errores como los árboles de dibujo animado.
- **[03:06]** Reservar más de 20 GB para Kimodo y su modelo de texto.
- **[03:27]** Claude no oye y Gemini alucina sonidos, así que conviene una revisión humana del audio.
- **[04:20]** El skill pide permiso antes de modificar el equipo.
- **[05:51]** Para el personaje propio, usar una foto frontal, con luz pareja, sin nada sobre la cara y de una sola persona.
- **[06:23]** Se puede cambiar el ritmo, la cámara y los canales mostrando una referencia, sin quedar atado a la versión del autor.

## Lo que no queda claro
- No se nombra la herramienta de IA de sonidos ni la de voz.
- No se explica cómo se conecta Gemini ni cómo se obtiene el modelo de texto de Kimodo.
- No se detalla cómo se conecta el movimiento de Kimodo al rig del personaje en Blender.
- El pack de personajes y su artista no se identifican, y no se aclara cómo se repinta la cabeza.
- El skill y los assets están tras la comunidad de Skool, probablemente de pago (no se dice el precio).
- Los requisitos de hardware se ven solo en una captura (RTX 5070 de 12 GB, 31 GB de RAM) y no se dan como mínimos.
- No se dice si ChatGPT gratis alcanza para toda la generación de imágenes del personaje propio.
