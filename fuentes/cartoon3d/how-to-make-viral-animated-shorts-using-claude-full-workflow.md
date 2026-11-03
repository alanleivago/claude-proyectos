# How to Make Viral Animated Shorts Using Claude (Full Workflow)

- Link: https://www.youtube.com/watch?v=OtbLL6OBNE4
- Canal: Mr omi
- Fecha: 2026-11-01
- Tema: cartoon3d

## De qué trata
El autor muestra cómo hizo que Claude produjera un short animado en el estilo "personajes 2D en un mundo 3D" (tipo el canal Ricks Clips). Para eso entrenó a Claude analizando 20 shorts de referencia a 30 fps y midiendo todo con números, escribió el guion con la fórmula del canal, construyó la escena con código (Three.js + Remotion) y corrigió el aspecto "barato" con un equipo de agentes. Está pensado para quien quiera clonar un estilo visual con Claude Code, y el resultado final es un skill gratuito en GitHub con unas 5.000 imágenes de referencia.

## Pasos / método
1. **[00:42]** Reunir muchas referencias: Claude descargó los últimos 20 shorts del canal en ese estilo.
2. **[00:51]** Pedirle que analice **cada fotograma a 30 fps**, no unos pocos sueltos, porque los detalles pequeños (micro-animaciones, movimientos de cámara, luz, sombreado) son lo que da realismo. Total: ~18 min de video y más de 32.000 frames.
3. **[01:44]** Decodificar el guion: bajar el audio original en inglés (YouTube dio el doblaje alemán por defecto) y transcribir los 20 videos.
4. **[01:56]** Extraer la fórmula del guion: paradoja como hook en la primera frase, sin introducción, escalada, giro con "You see" (14 de 20) y remate irónico en la última línea. Ritmo de casi 4 palabras por segundo sin silencios.
5. **[02:38]** Documentar lo visual: personajes planos pero iluminados como si existieran en el mundo, geometría 3D con contornos de tinta negra, colores muy saturados (luces cálidas, sombras azul frío), luz que acompaña la historia, cámara que casi no corta y viaja hacia la siguiente escena (12 de 20 tienen un corte duro o ninguno).
6. **[03:12]** Hacer que Claude escriba su propia herramienta de medición: hojas de contacto (2 s de video = 1 imagen de 60 frames, 549 en total), correlación de fase para seguir la cámara, detección de cortes y medición de brillo, contraste y saturación.
7. **[03:50]** Elegir tema: el primero (por qué el tiempo parece ir lento en peligro) ya lo había cubierto el canal, así que se descartó. Se eligió el puente de 1831 que cayó bajo soldados marchando al paso.
8. **[04:23]** Verificar los hechos antes de escribir (fecha, número de soldados, profundidad del río: 2 pies) y escribir el guion con la fórmula; el dato del río dio el mejor chiste.
9. **[04:55]** Prueba inicial en Blender de 5 segundos (personaje "mensajero", edificios gratis, nubes planas); la cámara atravesó al personaje en el tercer empuje.
10. **[05:17]** Para el puente se volvió a empezar en Blender, pero se pasó a **Three.js + Remotion** (render frame a frame) tras intuir que el canal usa personajes planos en mundo 3D real.
11. **[05:45]** Construir el mundo: 37 modelos 3D gratuitos, texturas pintadas por código, 14 caras distintas, puente con torres, cadenas y tablero de 5 m, 74 soldados de a 4 con rebote creciente hasta que se rompe.
12. **[06:16]** Crear un efecto propio de tinta que detecta bordes en el 3D y dibuja línea negra. En ~1 hora quedaron 15 tomas funcionando (2.025 frames).
13. **[06:28]** Revisar fotogramas fijos antes de renderizar video: aparecieron cámara dentro de casas, árboles verde azulado y cadenas tapando caras.
14. **[06:42]** Comparar lado a lado con el original; se vio "barato" y se pidió análisis frame a frame con muchos agentes.
15. **[07:35]** Armar un equipo: 7 agentes de diagnóstico (color, tinta, luz/sombras, texturas, personajes, profundidad/encuadre, movimiento), 1 de sonido y 4 de reconstrucción (cámara, mundo, personajes, look final).
16. **[08:09]** Dar a cada agente su propia copia del proyecto y archivos exclusivos; luego fusionar archivo por archivo.
17. **[08:30]** Darle a Claude 10 horas y aplicar los hallazgos (ver sección siguiente).
18. **[09:58]** Empaquetar todo como skill de Claude, gratis en GitHub.

## Lo que se ve en pantalla
- **[00:23]** Carpeta del skill `cartoon-3d-short` en `~/.claude/skills/` con `SKILL.md` y una carpeta `templates`.
- **[00:47]** Prompt simple "analyze this video" con un mp4 adjunto, modelo Opus 5.5.
- **[01:23]** Plan de Claude: descargar 20 videos a 30 fps, transcribir con WhisperX, medir cortes/cámara/luz/color/efectos, escribir style bible.
- **[01:34]** `STYLE_BIBLE.md`: formato vertical 1080x1920, 30 fps, 31–78 s (mediana ~60 s), voz 3,5–4,1 palabras/s, -14 LUFS, regla propia "sin subtítulos salvo que el usuario los pida".
- **[01:46]** Descarga con yt-dlp (720p + audio inglés `language^=en`) tras el error del doblaje alemán.
- **[03:09]** `measure.py`: función `shift` con FFT (correlación de fase) para estimar desplazamiento entre frames.
- **[04:32]** Guion del puente (`SCRIPT.md`), ~22 líneas, con los chistes del río.
- **[06:07]** `story.ts` (proyecto `reel-kit`, `src/videos/bridge`): física de la historia con `marchPhase` (1 Hz), `SNAP`, `DROP0/1`, `DROP_H`, tabla de tomas `SHOTS`.
- **[06:19]** Carpeta `out/bridge/test` con stills de prueba (`b_60.jpg`…`b_2010.jpg`).
- **[08:06]** Archivos de `bridge`: `Bridge.tsx`, `build.ts`, `cast.ts`, `ink.ts`, `lights.ts`, `paint.ts`, `story.ts`, `toon.ts`, `world.ts`.
- **[08:18]** Script de fusión que copia archivos de cada sandbox (`bridge_{box}`) a main si cambiaron.
- **[08:42]** Informe de contornos: 74 % de aristas de la referencia llevan línea negra, ~3 px a 1080p, ancho constante en pantalla; en los stills propios 0 de 20 escaneos.
- **[08:54]** Gráfica de velocidad de cámara: referencia (azul) con curva ancha y suave; la propia (roja) un pico estrecho.
- **[09:05]** Informe de personajes: adultos de ~3,5 cabezas, contorno 3× más grueso en el lado de sombra, sin rubor ni brillos en ojos; 96 frames, 38 ajustes de contorno de cabeza.
- **[10:17]** Commits en GitHub (`mromidev/claude-animated-shorts`): tinta antes del desenfoque, cámara con glides de 18–40 frames, grade con negros levantados y sombras azul-violeta, personajes 3,5 cabezas, columpio, sonido sintetizado.
- **[10:40]–[11:28]** Adelanto del siguiente video: humano realista en Blender 5.2 (Cycles, 1440x2560, 30 muestras, OptiX), render estimado de ~1 h por frame mostrado.

## Consejos y advertencias
- **[00:51]** Si solo dices "analiza este video", Claude toma pocos frames; pídele explícitamente 30 fps.
- **[03:42]** No pidas opinión: pídele que **mida**. Un número se puede recrear, una opinión no.
- **[01:48]** Comprueba el idioma del audio descargado (YouTube puede dar un doblaje).
- **[04:06]** Revisa si el tema ya fue cubierto por el canal.
- **[04:23]** Verifica los hechos antes de escribir.
- **[06:28]** Renderiza stills antes del video para detectar errores baratos.
- **[08:24]** Con muchos agentes, divide los archivos, no solo las tareas.
- **[08:44]** Un efecto puede anular a otro: la tinta se borraba porque el desenfoque corría en el mismo paso; la tinta debe ir antes del desenfoque.
- **[09:20]** Las notas propias del análisis pueden estar equivocadas (cabezas "ovaladas" eran en realidad más redondas en la referencia; la cámara se mueve en el 65 % de frames, no está quieta el 80 %). La herramienta no detectaba movimientos lentos.
- **[09:44]** Las alternativas que menciona: una de pago (67–97 USD/mes) y otra con pocos prompts y resultados menos limpios.

## Lo que no queda claro
- No se muestra el prompt exacto para entrenar ni el contenido completo de `SKILL.md`; hay que obtenerlo del repositorio.
- Costos, límites de uso y hardware necesarios (el plan "Max" y el modelo Opus 5.5 aparecen, pero no se explican).
- Cómo se hizo el sonido (efectos sintetizados y marcha) solo se menciona de pasada.
- No se detalla cómo instalar el skill ni dependencias (Three.js, Remotion, WhisperX, yt-dlp, ffmpeg).
- Las cifras de vistas del canal de referencia (29 M, 200 M) y la afirmación de que el canal es nuevo no se verifican.
- Aspectos legales de clonar el estilo y usar material de otro canal no se tratan.
