# Opus 5.5 + Creatorize = VIRAL Zack D Films Style 3D Animations (Full Guide)

- Link: https://www.youtube.com/watch?v=sVU8r4elXCk
- Canal: g russ
- Fecha: 2026-10-29
- Tema: zach3dfilms-style

## De qué trata
El video muestra cómo generar con Creatorize (software del autor) y Claude Opus 5.5 un short 3D informativo al estilo de Zack D Films. Se parte solo de un audio de voz en off y se obtiene un video vertical de ~30 s en aproximadamente una hora, usando la suscripción existente de Claude Code. Está dirigido a quienes quieren automatizar canales de YouTube Shorts con animación 3D de calidad sin pagar APIs externas. Al final compara tres videos originales de Zack D Films con las versiones hechas con Creatorize.

## Pasos / método
1. **[00:44]** Abrir "New project" en Creatorize y elegir el estilo integrado "3D Informational (Zack D Like)". Es un estilo solo informativo, sin humanos.
2. **[01:28]** Configurar el formato Vertical 9:16, longitud de unos 30 s y calidad Ultraedit, que da el mejor aspecto. Aparece además el selector de canal (se dejó "No channel").
3. **[01:42]** Conseguir el audio. Aquí se usó la voz de un short de Zack D Films ("How This Robot Melts And Reforms") para poder comparar. También se puede generar en la app (ElevenLabs, Fish Audio) o subir un archivo propio.
4. **[02:12]** Arrastrar el audio al campo de voiceover, elegir modelo Opus 5.5 con esfuerzo Medium y crear el proyecto. No se da ninguna referencia visual, para ver qué tan creativo es por sí solo.
5. **[02:12]** Pulsar "Clean and time": una transcripción local sincroniza cada palabra al cuadro exacto.
6. **[02:26]** Pulsar "Build scenes" (Build the video with Claude). Claude escribe el storyboard, construye cada shot sincronizado con la narración, verifica contra frames renderizados y diseña el ambiente.
7. **[03:25]** Fijar un límite de tiempo (aquí 60 min) para que Claude termine más rápido y gaste menos tokens, manteniendo calidad alta.
8. **[03:40]** Opcional: en "Direction for this build" escribir indicaciones o adjuntar referencias (fotos/videos) con el botón Reference: paleta, modelos, iluminación. Aquí se dejó vacío.
9. **[03:55]** Pulsar "Start build". El autor cronometró y esperó.
10. **[04:39]** La build tardó ~70 min; se detuvo manualmente por pasarse del límite, pero terminó lo pedido. Usó solo 2,1M de tokens.
11. **[05:23]** Exportar el video (ventana Export). Renderiza en Blender (987 frames).
12. **[06:07]** Llevar el MP4 a DaVinci Resolve y revisarlo completo.
13. **[08:34]** Corregir shots con problemas: seleccionar el shot en la línea de tiempo y pedirle a Claude el arreglo en lenguaje natural (p. ej. mover el objeto que tapa la cámara).
14. **[09:32]** Si aparece una sugerencia de regla del proyecto, guardarla con "Keep rule" para que el error no se repita.

## Lo que se ve en pantalla
- **[00:44]** Lista de estilos: 3D reconstruction, Low poly shorts, 3D cartoon shorts, 3D Informational (Zack D Like), Stick stories. La vista previa del estilo muestra "Realistic 3D explainers in Blender: giant engineering ideas built piece by piece, with green X-ray highlights".
- **[01:28]** Formatos Vertical 9:16 / Wide 16:9; Length 1:00 por defecto; calidad Standard / Verified / Ultraedit. Un aviso indica que Blender renderiza cada frame, así que la exportación final es más lenta que el preview (un minuto de video tarda 5-10 min en una GPU rápida).
- **[02:12]** Panel de pipeline: Script written, Voiceover added, Audio cleaned, Words timed, Storyboard written, Scenes built, Sound design mixed, Video exported. Aviso: "Your voiceover is not cleaned and timed yet".
- **[02:26]** Calidad Ultraedit: "Opus repasa cada shot, mira stills, dice por qué se ve mal y lo arregla". Tiempos límite: Unlimited, 20, 30, 45, 60 min.
- **[04:09]** Chat de Claude con "Build the video: (60 min limit)", 16 shots, barra de contexto 60k/500k.
- **[05:08]** Resumen de la conversación: 140k de 500k tokens, última corrida 2,1M tokens en 24 pasos, 98% de cache hit, uso semanal 69%.
- **[05:23]** Opciones de export: versión 4K, guardar subtítulos .srt, audio como pistas separadas (WAV), shots como clips separados con .edl para Premiere/DaVinci/CapCut. Salida 1080×1920, 30 fps, H.264.
- **[08:34]** Modos de vista Solid/Look; chips de sugerencia ("Make this shot more dynamic…", "Improve the lighting and depth"…).
- **[09:18]** Aviso de regla propuesta: antes de terminar un shot, verificar que la cámara no pase dentro de o detrás de piezas del set y que el sujeto sea visible todo el shot.
- **[10:17]** Planes: Standard $67/mes (todos los estilos, 9:16, voz, subtítulos, sonido, 1080p, comunidad, hasta 12 exports/mes, sin Ultraedit); Premium $97/mes (todo lo anterior + routines, Ultraedit, estilos y personajes propios, 4K, 30+ idiomas, aprendizaje con analíticas, exports ilimitados).
- **[11:59]–[14:26]** Comparaciones lado a lado (original vs. Creatorize): robot que se derrite, techo de casa (en esas dos el original está marcado "NOT Zack D Films"), mover el Everest.

## Consejos y advertencias
- **[03:00]** Un límite de tiempo hace la build hasta 4x más rápida con la mitad de créditos y ~80% de parecido al modo ilimitado; sin límite el resultado es mejor pero puede tardar horas (ejemplo: 3 h 37 min).
- **[03:40]** Para un look específico, usar Direction/Reference con imágenes o videos.
- **[04:54]** No hay preview en tiempo real en este estilo: hay que posicionarse en la línea de tiempo y esperar a que cargue el frame.
- **[08:12]** Al cortar la build antes de tiempo se saltó la verificación visual y quedaron shots con inconsistencias (~19 s y ~29 s). Dejarla terminar evita eso.
- **[08:56]** En modo Solid se puede recorrer la línea de tiempo sin renderizar; Look requiere carga. Conviene revisar antes de exportar.
- **[07:20]** Insiste en que el guion importa: si es bueno, el estilo funciona; Creatorize puede escribirlo.
- **[07:28]** Su estrategia: publicar mucho volumen (un video diario) en lugar de depender de un solo video perfecto.
- **[10:02]** Sigues siendo el responsable de elegir ideas y revisar el resultado.

## Lo que no queda claro
- Qué hace falta de las suscripciones de Claude (planes 1x/5x/20x) para este flujo: solo se menciona de pasada.
- El "1% del límite semanal por video" (~07:28) no coincide con el 69% de uso semanal que aparece en pantalla (05:08); parece ser porque ese panel incluye otros usos.
- La afirmación de que 2M de tokens es "80 veces menos" que el video anterior (108M) no cuadra exactamente (serían ~50x).
- Costo y tiempo de la exportación final: se ve el render al ~45% en 05:52 pero no cuánto tardó en total.
- No se explica cómo se hicieron las comparaciones de techo y Everest (qué audio, tiempos de build, si usaron Ultraedit).
- Afirmaciones de calidad ("mejor que lo que ofrece la mayoría en Fiverr", precio de 60-80 USD) son opinión y no se demuestran; además es un video promocional del propio producto.
- La comparación de costes con Vidrush ("5000 dólares") no se detalla y habría que verificarla.
