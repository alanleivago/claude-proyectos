# Opus 5.5 + Creatorize = MEGA Viral 3D Cartoon Animations! (Step-by-Step Guide)

- Link: https://www.youtube.com/watch?v=z9XflLHoMdg
- Canal: g russ
- Fecha: 2026-10-21
- Tema: 3D cartoon animations

## De qué trata
El video explica cómo crear videos cortos animados en 3D ("3D cartoon shorts") de estilo explicativo viral utilizando la herramienta de escritorio Creatorize integrada con agentes de Claude (Opus). Está dirigido a creadores de contenido y canales automatizados que buscan producir animaciones 3D estilizadas de ritmo rápido sin modelar ni animar manualmente. El resultado es un flujo completo para generar animaciones con personajes 3D expresivos, escenarios densos, datos representados como objetos físicos y renderizado sincronizado palabra por palabra.

## Pasos / método
1. **[02:37]** Analizar el estilo fotograma a fotograma: descomponer referencias a 30 fps para mapear las reglas de movimiento, duración de gestos (5-6 frames), transiciones de cámara y cambios faciales antes de implementar el motor.
2. **[11:37]** Redactar el guion estructurado: escribir narraciones en segunda persona de unas 165 palabras (~50 segundos), donde cada cláusula represente una toma y cada cifra mencionada sea verificada con fuentes.
3. **[12:33]** Generar y recortar la voz en off: producir el audio (ej. con ElevenLabs) y compactar las pausas a un máximo de ~0,2 s tras cada oración para mantener un ritmo acelerado continuo.
4. **[13:03]** Crear el proyecto en Creatorize: cargar el audio, asignar el estilo "3D cartoon shorts", definir el aspecto ("Cinema" o "Clean"), formato (9:16) y pegar el guion con directivas breves para Claude.
5. **[14:22]** Limpiar y temporizar el audio ("Clean and time"): ejecutar el proceso local de transcripción para sincronizar cada palabra con precisión de milisegundos.
6. **[14:45]** Lanzar la construcción automatizada con agentes Claude: el agente director elabora el guion gráfico y distribuye la creación de escenarios y tomas a los constructores en paralelo, verificando colisiones y encuadres con renders intermedios.
7. **[18:10]** Revisar y corregir en la vista previa interactiva: reproducir el corto, pausar en los cambios de expresión o aparición de números, hacer clic directo sobre los elementos visuales defectuosos y pedir correcciones en lenguaje natural.
8. **[26:51]** Diseñar y mezclar el sonido: asignar efectos Foley a acciones visuales concretas (impactos a -10 LU, silbidos a -15 LU) y una pista musical constante de fondo a -18 LU sin atenuación ("ducking").
9. **[19:28]** Exportar la animación final: renderizar a 1080x1920 a 30 fps (con opción de reescalado a 4K) con subtítulos incrustados y pista de audio mezclada.

## Lo que se ve en pantalla
- **[01:15]** Panel principal de "Creatorize Suite" con métricas de uso de tokens de Claude (957M tokens usados, 98% de caché) y selector de modelo (Opus 3.5 / Claude Code).
- **[01:59]** Desglose del kit de animación 3D: personajes con cuerpos cilíndricos/esféricos ("ball for a head, bean for a body"), 43 expresiones faciales dibujadas, sombreado toon suave con contorno entintado y desenfoque de profundidad.
- **[04:47]** Gráfico técnico del reemplazo facial: la cara no se deforma ("morph"), sino que cambia en un pestañeo de 3 frames (ojo medio cerrado -> cerrado -> nueva expresión) exactamente 2 frames antes de la palabra enfatizada.
- **[08:09]** Catálogo de "datos como objetos": contador LED que rueda hasta la cifra exacta, manómetro cuya aguja sobrepasa y retrocede, calendario con hojas que se desprenden y periódicos que giran hacia la pantalla.
- **[10:28]** Menú de configuración visual ("Look - 3D cartoon shorts"): selección de personaje principal (ej. "Milo (everyman, teal tee)"), tipo de caras ("Skin tones" o "White (classic)"), sliders de tamaño de subtítulos (1.0x), Depth of Field (1.0x), Glow (0.32), Vignette (0.28) y Film Grain (0.00x).
- **[14:46]** Ventana modal "Build the video with Claude": selector de calidad de construcción (Standard, More depth, Polished, Verified, Ultraedit) y caja de texto para directivas de ambientación.
- **[17:27]** Panel lateral de Claude mostrando la ejecución concurrente de agentes en PowerShell (`set-designer.js`, `p1_lifeboat.js`, etc.), con miniaturas de renders intermedios cada 1/30 s para chequear errores de postura e intersección.
- **[19:12]** Interfaz de edición contextual: al hacer clic en un objeto en el visor (ej. un calendario), se abre un selector `calendar - shot 17` con opciones automáticas ("Make it bigger", "Move camera closer", "Change colour") y caja de texto para instrucciones libres.

## Consejos y advertencias
- **[04:06]** En las pausas o detenciones de los personajes, mantenerlos absolutamente estáticos (menos de 0,5 píxeles de movimiento por frame). Añadir balanceos u oscilaciones ociosas ("idle bounce") arruina el estilo y hace que se vea barato.
- **[04:28]** Los gestos deben comenzar y asentarse de 3 a 5 fotogramas antes de que suene la palabra asociada; si ocurren exactamente a la vez o después, el personaje parece un robot.
- **[05:04]** No intentar sincronización labial ("lip sync"): en este formato, la emoción y la actuación se transmiten únicamente mediante el cambio de expresión en los ojos y cejas durante un pestañeo.
- **[05:09]** La cámara nunca debe quedarse quieta ni usar vibración de cámara en mano; debe mantener un movimiento suave continuo que se acelera progresivamente hacia cada corte o transición (disolvencia de ~6 frames).
- **[11:17]** Respetar la "zona de subtítulos": los textos se sitúan alrededor del 70% de la altura de la pantalla (banda del 66% al 76%), por lo que las caras y elementos principales deben colocarse fuera de esa franja.
- **[27:20]** No aplicar atenuación automática ("ducking") a la música de fondo; el lecho musical debe mantenerse constante a -18 LU respecto a la voz para sostener la energía.
- **[28:01]** Utilizar siempre música con licencia comercial explícita para evitar reclamaciones de derechos de autor en YouTube.

## Lo que no queda claro
El video promociona la herramienta propietaria "Creatorize" pero no detalla el motor 3D subyacente que genera y renderiza la escena (por ejemplo, si utiliza internamente Three.js, Blender headless o WebGL compilado en código JavaScript ejecutado por Node/PowerShell), ni explica el consumo real o límite de gasto de la API/suscripción de Claude al usar modos intensivos como "Ultraedit" en proyectos de larga duración.
