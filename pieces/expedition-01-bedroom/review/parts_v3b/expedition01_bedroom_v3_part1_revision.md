# Revisión de expedition01_bedroom_v3_part1.mp4

- Estilo: mechayuki
- Duración: 160.0 s

## Veredicto
**CASI (fallos menores).** El formato, los textos y la paleta verde están bien. Hay varias tomas donde la cara queda tapada o el cuerpo parece atravesar objetos, y el cierre de la parte 1 (acostada sobre la piedra) se lee mal.

## Fallos
1. **[02:36–02:38]** Acostada en Mesopotamia: la cabeza queda al lado del bloque de piedra y no encima, y los pies se cortan en el borde derecho. El cuerpo reposa sobre un disco gris poco legible y la pose parece desplomada → rompe "nunca cortada en el borde", "acciones inequívocas" y "tumbada sin atravesar objetos" → reencuadrar con cámara más abierta, apoyar la cabeza sobre el bloque y revisar que el torso no se hunda en la sombra o el disco.
2. **[02:08–02:10]** La almohada en primer plano es un bulto gris recortado, que parece piedra. No coincide con la almohada blanca del Item Get (02:04). No se ve que esté sujeta por las manos → rompe "props en la mano" y "acción clara" → almohada blanca, más pequeña, agarrada visiblemente con las dos manos.
3. **[01:00–01:02]** Solo asoman la cabeza y la coleta sobre el borde del armario, con la cara tapada. Parece medio incrustada en el armario → rompe "cara visible" y "no atraviesa objetos" → recolocar la cámara o a ella delante del armario, de frente.
4. **[01:20–01:24, 01:30–01:32]** Está de espaldas o de perfil y el pelo le cubre la cara en toda la cueva. Además, en 01:16–01:24 el cuerpo se solapa con la esterilla de hierba, que conviene comprobar (clipping) → rompe "cara visible" y "tumbada/sentada sin atravesar" → ángulo ¾ frontal y revisar desde el lateral y desde arriba.
5. **[01:48–01:50]** Triángulos violetas (artefactos de textura) sobre el saco de paja → rompe "nada plano o con defectos de textura" → corregir UV o textura de ese parche.
6. **[01:14]** El subtítulo "back." queda tapado por los marcos del rewind y pegado a la etiqueta "BACK 200,000 YEARS" → rompe "overlays claros" → subir el subtítulo o acortar los marcos.
7. **[00:46–00:50, 01:22–01:24, 00:10–00:16]** Tomas casi idénticas durante 4–8 s (ella casi inmóvil, solo cambian los recuadros o la cámara). En 00:10–00:16 se habla de gente durmiendo sin que se vea ninguno → rompe "animada y el mundo reacciona" → añadir micro-movimiento o cambio de plano; mostrar un durmiente en la cama.

## Cumple
- Frase de apertura "Operator, …" sin "!"; no hay "!" en ninguna línea.
- Balance verde: exterior con césped, árboles, arbusto, flores y arcoíris; nada de nieve.
- Subtítulos de una palabra, en fuente pixel y legibles, presentes en todos los fotogramas.
- Etiquetas con fuente pixel legible y de tamaño moderado; los recuadros de escaneo son pequeños y claros.
- Título "EXPEDITION 01 / THE BEDROOM" centrado y visible desde ~00:20 (tras decir "bedroom").
- Las acciones de excavar y escanear tienen FX: tierra amontonada, línea de escaneo, recuadros numerados.
- Las expresiones encajan con la línea: ceño fruncido en "year." y "left.", sorpresa en "not tidy".
- Las tomas históricas tienen volumen y contraste: cueva, medieval, Mesopotamia, Egipto y China.
- Los bichos de 01:48 están sobre el saco y no flotan.
- Las cifras y fechas son coherentes entre voz y etiquetas (200,000 años; 7000 BC ≈ 9,000 años).
- El cierre de la parte 1 termina en frase completa ("…and they liked it.").

## No verificable
- Audio: timbre de la voz clon, subida de pitch en "Scanning?" y en "Fleas, lice, bedbugs?", cortes dentro de palabras, la pausa tras "Operator…", mezcla a -12 LUFS, música y SFX en las acciones → `earshot timeline/critique`.
- Sincronía fina entre el subtítulo y la palabra, y el pop-in 0.86→1.05→0.98→1.0 → revisar `revisar_render.py` y un contact sheet por plano.
- Clipping exacto de manos y cuerpo (01:00, 01:16–01:24, 02:36) → stills de inicio, medio y fin de cada plano, con vista lateral y cenital.
- Hora exacta de entrada del título (los fotogramas están separados 2 s; en 00:18 aún no aparece).
- Cierre largo ("Expedition complete. Logging off.", CTA SUBSCRIBE): corresponde a la parte 4, no a esta.
