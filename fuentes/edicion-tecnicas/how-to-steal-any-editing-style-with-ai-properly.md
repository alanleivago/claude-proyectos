# How To Steal Any Editing Style With AI (properly)

- Link: https://www.youtube.com/watch?v=wsTL-VyyVIk
- Canal: Payton Bilodeau
- Fecha: 2026-11-09
- Tema: edicion-tecnicas

## De qué trata
El video muestra cómo el autor (creador que edita con IA) "robó" el estilo de edición de otros creadores (Nick Saraev para videos largos, Kallaway para shorts) y lo reconstruyó con su IA (Claude Code / Codex), sin After Effects ni generadores de video de pago. Está dirigido a creadores que quieren replicar estilos de motion graphics, subtítulos y layouts con un flujo basado en referencias y feedback, más que en prompts perfectos. El resultado es un estilo propio, reutilizable como "skill", que se logra con pocas rondas de corrección.

## Pasos / método
1. **[01:09]** Referencias: tomar capturas de los momentos del estilo que gustan y guardar los links de los videos de origen (Pinterest sirve para juntar looks de varios lados).
2. **[01:21]** Entregar todo a la IA: Claude Code con Opus 5.5 en esfuerzo alto o extra alto; o Codex con GPT-6.1 Sol/Astra en alto o extra alto. Si salieron modelos nuevos, usar los más recientes.
3. **[01:39]** La IA usa tres skills de investigación gratuitas (Agent Reach, Watch, yt-dlp) para investigar, descargar los videos y mirarlos cuadro por cuadro; así aprende layout, tiempos, fuentes y movimiento.
4. **[02:07]** La IA reconstruye el estilo en código con herramientas gratuitas (Remotion e Hyperframes); el usuario no toca el código: la IA lo escribe, renderiza y verifica.
5. **[02:58]** Probar el estilo sobre material en bruto de un video ya hecho (guardado en una carpeta accesible para la IA); la IA detecta bugs y los corrige hasta que funcione.
6. **[03:11]** Feedback: mirar el resultado y decirle qué está mal, idealmente por voz (WhisperFlow o el botón de micrófono del prompt bar), con timestamps, qué falló y qué se quería.
7. **[04:02]** Hacerlo propio: cambiar colores, poner al presentador en una ventana recortada a la derecha, agregar modo claro y modo oscuro; mantener lo que gusta y cambiar lo demás.
8. **[04:30]** Para formato vertical, repetir el proceso con otra referencia (Kallaway): ventana abajo con la cabeza sobresaliendo y gráficos arriba. Se enviaron capturas, links de reels y un mensaje hablado.
9. **[05:10]** Corregir la primera pasada de short form (tamaño, posición, zona segura) con feedback, luego personalizar (verde en lugar de rojo, fuentes propias) y añadir un momento donde la ventana se desliza y los gráficos ocupan toda la pantalla.
10. **[07:15]** Consolidar 1 a 3 estilos propios (Tech Motion, Narrative Motion, Presenter Collage) y seguir refinándolos con el tiempo.

## Lo que se ve en pantalla
- **[00:09–00:18]** Esquema: capturas/video de Nick Saraev → "My AI" → este video. Antes se necesitaba equipo de editores + años + After Effects.
- **[00:27]** Ilustración de timeline con pistas Title, Underline, Card, Arrow, Camera con keyframes (idea de motion graphics por capas).
- **[01:22]** Claude Code, modelo "Opus 5.5", con selector de Effort.
- **[01:49]** Ejemplo de SKILL.md en `.claude/skills/watch/` con campos name, description, license: MIT y allowed-tools: Bash, Read, AskUserQuestion. Repos: Agent-Reach (109k estrellas), claude-video (20k), yt-dlp (206k).
- **[01:58]** Lo que la IA extrae del video de referencia: fuentes, layout, motion y timing.
- **[02:07]** Archivo `steal-kit/kit.tsx` con constantes de diseño (colores TOK, BOX, ZONE_X, PLANE, SAFE, CROP, FACE, BOX_SHADOW) y lienzo de 1920×1080.
- **[02:16–02:25]** Remotion ("videos from code") e Hyperframes; bucle de la IA: escribir → renderizar → comprobar. Prompt de ejemplo: "Edit my video in this style".
- **[02:35–02:44]** Skills de edición base con Python, FFmpeg y DaVinci Resolve (cortes, color, audio). El autor usa Final Cut y CapCut.
- **[03:02–03:38]** Ejemplo de iteración: v1 (15 oct) → v4 con nota de Payton ("arreglar los layouts repetitivos de dos columnas"); prompt bar con GPT-6.1 Sol Extra High y micrófono; feedback con timestamps (2:37–2:38 y 6:01–6:02) sobre cortes y sílabas mal cortadas.
- **[03:38–03:57]** Narrative Motion: 8–9 versiones; el primer video real casi sin feedback.
- **[04:06]** Personalización: colores propios, ventana recortada a la derecha, modo claro/oscuro.
- **[04:33–04:51]** Plantilla vertical con zonas ocupadas; layout de Kallaway: gráficos arriba, cabeza sobre el borde, ventana abajo.
- **[05:01]** Mensaje real enviado el 29 oct: dictado, pide actualizar narrative motion para short form, con capturas y links de Instagram.
- **[05:10–05:28]** Primera pasada: demasiado grande, mal posicionado y fuera de la zona segura (perfil/caption abajo, botones a la derecha).
- **[05:55–06:14]** Hyperframes "/reverse-any-video" (plan Pro) vs. las tres skills gratuitas + prompting + feedback.
- **[07:17–07:45]** Tech Motion (Train Bloom), Narrative Motion (Nick Saraev y Kallaway), Presenter Collage (AI with Remy y Oren John).
- **[08:12–08:39]** Creator Toolkit (Write Like You, Research & Watch, Agent Reach, Watch, etc.); anuncio "Vibe Edit 7.0.3" y prompt de actualización que hace backup y conserva personalizaciones.

## Consejos y advertencias
- **[00:52]** Hoy es más un juego de referencias y feedback que de prompting.
- **[01:34]** Usar siempre la versión más nueva de los modelos.
- **[03:16]** No hace falta el prompt perfecto: dictar por voz sirve; conviene dar timestamps y detalle.
- **[03:39]** Esperar varias rondas la primera vez (9 versiones); los estilos posteriores tomaron 2–3 y los shorts salen casi de una.
- **[05:15]** En short form, mantener los gráficos dentro de la zona segura para que los botones de la app no los tapen.
- **[06:05]** La función "reverse any video" es de pago y solo debe usarse con videos de los que se tienen derechos.
- **[06:34]** "Robar bien" no es copiar el estilo sin cambios ni el guion palabra por palabra; eso daña la reputación. Hay que usar footage, guion, ideas, colores, estudio, voz y fuentes propias.
- **[07:12]** Si todos copian el mismo estilo se vuelve cliché; buscar 1–3 estilos propios.
- **[02:49]** Si la IA aún no sabe hacer ediciones básicas, ese es el "paso cero" previo.

## Lo que no queda claro
- Los nombres de modelos (Opus 5.5, GPT-6.1 Sol/Astra) y la versión de Vibe Edit no se pueden verificar; conviene confirmarlos.
- No se muestra el contenido exacto de los prompts iniciales para la IA ni cómo se instalan las skills (Agent Reach, Watch, yt-dlp) paso a paso.
- Cómo se ejecuta concretamente el recorte de la cabeza/enmascarado y la configuración de Remotion/Hyperframes no se detalla.
- El "paso cero" (edición básica con IA) y los skills completos están detrás de la comunidad de pago (Vibe Editors); el precio no se menciona.
