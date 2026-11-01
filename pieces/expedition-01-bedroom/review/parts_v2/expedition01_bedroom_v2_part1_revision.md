# Revisión de expedition01_bedroom_v2_part1.mp4

- Estilo: mechayuki
- Duración: 160.0 s

## Veredicto
**CASI (fallos menores).** No hay errores graves de historia ni de voz. Pero hay overlays que tapan la cara, tramos con ella casi congelada y algunos fallos de encuadre y UI.

## Fallos
1. **[00:46–00:52]** Los marcos de escaneo numerados (4, 78, 6, 1, 3…) se amontonan sobre su cara y los dígitos se solapan ("78"). → "Scan/diagram boxes small and clear" y "face visible". → Repartir los 8 marcos por el cuarto, sobre los objetos, o mostrarlos de a uno. Mantener el cartel "8 ARTIFACTS" sin tapar la cara.
2. **[00:44–00:50], [01:20–01:24], [02:12–02:16], [02:36–02:38]** Pose casi idéntica en frames consecutivos (brazo extendido y marcos sin cambio en 0:46/0:48/0:50; arrodillada igual en 1:22/1:24). → "She must be animated / the world must react". → Añadir idle o gesto, o cortar de plano cada 2–3 s.
3. **[01:00–01:02]** Está inclinada sobre la cabecera, medio oculta por el edredón, con la cara no visible y el cuerpo comprimido contra la cama. → "Never pass through the bed/quilt", "face visible", "never cut off". → Reposicionar el root fuera del volumen de la cama y verificar de lado y desde arriba.
4. **[02:00–02:02]** Queda cortada por el borde izquierdo, de espaldas y con el pelo tapando la cara. → "Never cut off at the edge", "face visible". → Mover la cámara o a ella para que quepa entera y se vea de ¾.
5. **[02:10–02:18]** La almohada, y luego la losa de piedra sostenida sobre la cabeza, le tapa cara y pelo. → "Face visible", "props stay in hand". → Bajarla a la altura del hombro o girar la cámara para que la cara quede libre.
6. **[00:54]** La tarjeta ITEM GET del colchón muestra la descripción cortada ("A RECTANGLE OF"). La de la almohada sí se completa (2:06). → "Overlays complete/clear". → Dar a la tarjeta tiempo para terminar el typewriter o mostrar el texto completo.
7. **[01:28], [02:10]** Los subtítulos "f ire." y "f ind" tienen un hueco después de la "f". → Era un cambio de v2 (letter spacing). → Corregir el kerning/avance del glifo "f" en pixfont.js.
8. **[00:00–00:04]** La entrada es un panel oscuro plano con marco blanco, y el "hill" es un polígono marrón plano sobre el pasto, sin colina. → "Nothing flat", "objects sit ON surfaces". → Modelar un montículo con volumen y una puerta con espesor.
9. **[01:16–01:24]** El fuego es un cono naranja con humo que, con el cambio de cámara, parece salir de su oreja. → "Every action must read clearly". → Una fogata reconocible (leños, llama) apartada de ella.
10. **[01:26]** El cartel "GRASS" flota sin línea guía, mientras "ASH" sí la tiene. → Falta de consistencia en labels. → Añadir el leader al pasto.
11. **[02:28–02:36]** La escena de China reutiliza el mismo cuarto medieval (zócalo verde, piso igual) y la almohada de porcelana es diminuta. → "Historical scenes with volume and contrast". → Cambiar paleta y props, y acercar la cámara a la almohada.
12. **[00:34]** El cartel dice "SCANNING.." con dos puntos y la línea cian cruza su cara. → Menor. → Unificar los tres puntos y bajar la línea.

## Cumple
- Pasto y cielo verde al inicio, con balance verde y sin nieve.
- Subtítulos de una palabra, con fuente pixel y sincronizados con la transcripción.
- Labels con fuente pixel legible, letras espaciadas y tamaño moderado.
- Descubrimiento creativo (detector de metales), distinto al de otros episodios.
- Apertura "Operator," sin "!", y cierre en un lugar distinto al inicio.
- Expresiones acordes (sorpresa, sonrisa pícara, gesto de duda).
- Estética MML2 consistente, con tarjetas ITEM GET claras y números 1/8 y 2/8 coherentes.
- Guion fiel a la transcripción y con datos coherentes con los labels (200.000 años, 7000 BC / 9.000 años).

## No verificable
- Mezcla, música (~7 dB bajo la voz, -12 LUFS) y SFX de acciones: usar earshot timeline/critique.
- Entonación de las preguntas ("Scanning?", "what was it for?"), energía del "Operator…", cortes de palabra y pausas: usar earshot y Whisper.
- Trepada por la ventana (0:28, la pierna se ve muy estirada), parpadeo del final y movimiento de cámara: revisar el clip frame a frame o con revisar_render.py.
- Comentario del Operator al 35–40% y outro/cierre ("Artifact understood…"): este es el capítulo 1 de 4 y no se puede juzgar con solo esta parte.
- Colisiones finas (manos con objetos, cama): revisar stills de inicio, medio y fin de cada shot, de lado y desde arriba.
