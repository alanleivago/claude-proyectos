# Opus 5.5 + Blender = MEGA Viral Zack D Films 3D Shorts Animations (Full Tutorial)

- Link: https://www.youtube.com/watch?v=UtYKuSbQPVA
- Canal: g russ
- Fecha: 2026-10-29
- Tema: zach3dfilms-style

## De qué trata
El video muestra cómo crear Shorts verticales en 3D con el estilo informativo de "Zack D Films" usando Creatorize (app de pago), Blender y Claude Opus 5.5 con esfuerzo bajo. El ejemplo es "cómo hacer un vaso de vidrio con una botella", construido solo a partir del audio del video original, sin darle el video como referencia. Está pensado para quien ya tiene suscripción a Claude Code y quiere producir videos de este tipo sin freelancers. El resultado es un video usable y publicable, no idéntico al original, y al final se comparan lado a lado las versiones.

## Pasos / método
1. **[02:19]** Se parte de un Short original de Zack D Films, del que solo se usa el audio (mp3), para recrearlo con otro look.
2. **[02:44]** En Creatorize se crea un proyecto nuevo y se arrastra el archivo de audio. La app también puede escribir el guion y generar la voz (integración con ElevenLabs y Fish Audio), pero aquí se usa audio externo.
3. **[02:57]** En Style se elige "3D Informational (Zack D Like)". Antes se repasan los otros estilos: Pixel art, Vox, Flat explainer, MS Paint, 3D reconstruction, Low poly shorts, 3D cartoon shorts y Stick stories.
4. **[03:22]** Se configura formato Vertical 9:16, duración 0:30 y calidad Ultraedit. Es el nivel más alto: Claude revisa cada shot, ve por qué se ve mal y lo corrige.
5. **[03:47]** En los ajustes del proyecto se pone el modelo Opus 5.5 y el esfuerzo "Low". Se elige Opus porque tiene mejor conciencia espacial que Sonnet.
6. **[04:38]** Se crea el proyecto y se pulsa "Clean and time" (en el panel de pipeline). Corre una transcripción local que sincroniza cada palabra con el tiempo para que Claude construya las escenas a su ritmo (tardó unos 20 s).
7. **[05:03]** Se abre "Scenes built → Build" y dentro, el botón Storyboard (novedad de la actualización). Sirve para fijar el estilo visual antes de construir.
8. **[05:16]** En Storyboard se eligen 5 momentos (se puede 5–7). Cada uno genera 2 imágenes, que Claude usará como referencia.
9. **[06:19]** Se pulsa "Make the stills". Claude lee la transcripción, escribe un prompt por momento y Google Flow se abre solo para generar las imágenes.
10. **[06:44]** Se elige la mejor imagen de cada par (5 elegidas) y se pulsa "Use 5 picked".
11. **[06:57]** Las imágenes quedan adjuntas como @img1–@img5 en la ventana de build. Se deja Ultraedit y tiempo ilimitado y se pulsa "Start build".
12. **[07:09]** Claude trabaja solo: descarga las referencias, usa la skill "mega-informational", reescribe la escena en Blender y revisa renders de cuadros.
13. **[07:38]** Tras unas dos horas termina la construcción. Se exporta (160,9 s de render).
14. **[08:00]** Se revisa la línea de tiempo en Creatorize. Solo hay vista previa en tiempo real en modo "Solid"; en "Look" hay que parar el cursor para que renderice el cuadro.
15. **[08:13]** Se importa el MP4 exportado en DaVinci Resolve para la revisión final.
16. **[10:44]** Se muestran comparativas lado a lado (original vs. hecho con Creatorize) de Everest, la bala y la botella.

## Lo que se ve en pantalla
- **[00:50]** Proyecto "How A Bullet Works" en el editor: pipeline lateral (Script, Voiceover, Audio cleaned, Words timed, Storyboard, Scenes built, Sound design, Video exported), 14 shots, panel de chat con Claude Opus 5.5 y botones "Review the whole video", "Make all on-screen text easier to read on a phone" y "Check every visual lands on its spoken word".
- **[01:41]** Vista previa en modo Solid (gris) con etiquetas flotantes tipo "FIRING PIN", propias del estilo.
- **[03:22]** Panel de calidad: Standard / Verified / Ultraedit. Advertencia de que Blender renderiza cada cuadro: una exportación de 1 minuto tarda unos 5–10 min en laptop con GPU rápida, más en una laptop normal. Salida 1080×1920 con cielo físico, roca, acero, vidrio y rayos X verdes.
- **[04:25]** Niveles de esfuerzo: Low, Medium, High, Extra high, Max. En Music y Sound effects hay "Global setting (On)".
- **[05:54]** Global style key (editable) con los descriptores visuales: render CGI estilizado 3D con Blender Cycles, modelos simplificados con bordes biselados, plástico mate y metal satinado, luz rim cian, oclusión ambiental, colores saturados, vacío con degradado azul, piso de cuadrícula tenue que se pierde en la niebla, vertical 9:16.
- **[06:44]** Las 5 escenas del storyboard: atar la cuerda, girar la botella en llamas, sumergir en agua con hielo, la grieta que corta limpio, el vaso terminado con soda.
- **[07:09]** Panel de uso de tokens (contexto de 500k).
- **[09:03]** Resumen de la conversación: 173k tokens de 500k, 5,4 M de tokens en la ejecución, 45 pasos.
- **[09:29]** Planes: Standard $67/mes (todos los estilos salvo Ultraedit, exportación vertical 1080p, hasta 12 exportaciones al mes, comunidad) y Premium $97/mes (todo lo anterior más Rutinas, Ultraedit, estilos y personajes propios, 4K, más de 30 idiomas, aprendizaje desde YouTube, exportaciones ilimitadas).

## Consejos y advertencias
- **[03:47]** Usar Opus 5.5 en vez de Sonnet 5.5: Sonnet detecta sus fallos pero no sabe corregirlos, gasta más tiempo y no garantiza ahorro ni la misma calidad.
- **[04:25]** No usar Max (lento, no vale la pena). Extra high solo si se busca máxima calidad; para una primera construcción, Low.
- **[06:44]** Las imágenes del storyboard son solo dirección general: el resultado no será idéntico porque los modelos de difusión funcionan distinto a Opus.
- **[06:57]** Con poco presupuesto de tokens o un plan más bajo, un límite de tiempo hace que Claude sea más eficiente sin perder mucha calidad.
- **[01:00]** Aclaración sobre un malentendido anterior: en este video no se le dio el video original a la IA, solo el audio.
- **[09:03]** Costos citados: 5,4 M de tokens en esta construcción, aprox. 1% del límite semanal en el plan 20x. Afirma que se podría ejecutar incluso en el plan de $20.
- **[08:38]** Dice que el resultado ya es publicable aunque no sea idéntico al original.

## Lo que no queda claro
- Los tiempos y consumos no coinciden del todo: en el intro dice que el video de la bala tardó unos 40 min y 10 M de tokens (4% del límite), y que el de la botella tardó unas 2 h y 5,4 M (1% semanal); la diferencia de tiempo puede deberse a Ultraedit y otros factores, pero no se explica.
- No se detalla qué hace exactamente la skill "mega-informational" ni cómo editar o personalizar el estilo más allá de editar la global style key.
- No se aclara si hay que tener Google Flow iniciado en una cuenta con créditos antes de empezar ni qué pasa si no hay créditos.
- Los requisitos de hardware para Blender no se precisan (solo "laptop con GPU rápida").
- No se muestran los retoques posteriores en el chat de Claude, solo se ven fragmentos de revisiones ("segunda ronda de arreglos").
- Se afirma que se puede ejecutar con el plan de $20 sin demostrarlo; habría que verificarlo, igual que los límites de plan mencionados.
