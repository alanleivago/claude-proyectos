# Revisión de zombie03_station_largo2_v1.mp4

- Estilo: ava
- Duración: 533.3 s

## Veredicto
**CASI (fallos menores):** el final con el menú de decisión y los sets exteriores están bien. Pero hay clipping visible, un posible desfase de unos 3 s entre pantalla y voz, y escenas con fondo vacío.

## Fallos
1. **[00:00–08:40]** Los captions y la imagen van sistemáticamente ~1,5–4 s por delante de la voz. Ejemplos: "THREE" en 00:20 (la voz lo dice en 00:21,4), "REMEMBERS" en 00:26 (se dice hacia 00:30), "A CITY" en 00:33 (hacia 00:37), "ANY" en 06:20 con la pantalla vacía, "TUBE" en 07:19 (se dice en 07:22) → rompe la regla de que las etiquetas caigan en la palabra → confirmar con earshot (timeline) contra el mp4 final; si es real, revisar `CUTS_T`/`warp()` frente a `mix_largo.py`. Puede ser un artefacto del muestreo de fotogramas.
2. **[07:19, 03:46, 06:13, 04:20]** Clipping, que la regla de verificación prohíbe:
   - En 07:19 un cilindro naranja vertical atraviesa la pierna de Ava.
   - En 03:46 el botiquín rojo flota junto a la cadera sin que lo sujete su mano.
   - En 06:13 el cono de linterna es un polígono blanco duro que cruza a Marla y al perro; además Marla aparece de pie, no "sentada contra la pared".
   - En 04:20 una barra marrón cruza el borde derecho de la pantalla.
   - Arreglo: la mano de Ava sostiene los objetos, el cono sigue la linterna con transparencia suave, y revisar el mp4 cuadro a cuadro (≥5 fps).
3. **[00:06]** Ava sonríe con los ojos cerrados mientras el texto dice "Don't look at him" y "you don't sleep". Tono equivocado. Además su torso flota sobre el perro y la bota queda pegada al hocico, y no está "con la espalda contra la pared" como dice el guion → poner una cara de miedo o cansancio y apoyarla contra un muro, separada del perro.
4. **[01:26]** El plano exterior muestra 3 zombis y las escaleras vacías, pero la voz dice "80 heads slowly turn away". Es un fallo de continuidad con 00:33–00:46 → repoblar la multitud en el plano de apagado.
5. **[02:46–02:53]** Dutch está de pie con la cabeza cortada por el encuadre, sin taza. La voz dice "pair of eyes… sitting on the floor with an empty water cup". Su cara (03:06, 08:33) es plana, con ojos de punto negro sin brillo → sentarlo, encuadrar la cabeza con los ojos en la luz y añadir la taza y volumen a la cara.
6. **[01:53–02:20, 03:13, 07:53, 04:33–04:40]** Fondos vacíos y oscuros, contra la regla de salas con detalle low-poly y luz levantada:
   - En 01:53, 02:00 y 02:20 Ava repite la misma pose delante de un vacío negro, sin interactuar con el cubo.
   - 03:13 y 07:53 también están sobre vacío.
   - 04:33 y 04:40 son casi ilegibles, con losas oscuras que tapan la cámara.
   - Arreglo: añadir paredes y props, una acción nueva para el cubo y subir las sombras.
7. **[03:53, 08:19]** El HUD tapa la fila superior de iconos del inventario (TRASH BAGS, RIBBON, HANDGUN). Los iconos son planos (pistola = rectángulo) y no son objetos RE2 con detalle → mover el HUD o bajar la rejilla, y añadir iconos con detalle.
8. **[05:26]** La tarjeta horaria dice "12:45 PM DAY 2 — POLICE" cuando la escena es el túnel (si no es la escritura a medias, debería decir TUNNEL / OLD STATION). **[06:20]** Pantalla "FIRST AID: BITES" vacía mientras suena el caption "ANY" → que el contenido entre al empezar la voz.
9. **[02:42, 00:23, 00:27, 04:11, 06:35]** La transcripción tiene líneas telegráficas o ininteligibles: "Cards, empty, supply closet, empty, cell block", "Days, rules, days", "The first left of him…", "This lockers the evidence cage", "Another of you says a word". Si el error es de la voz y no de whisper, hay que humanizar el guion y regenerar esas líneas.
10. **[06:53, 03:40]** Los datos del espejo de señales (10 millas) y de las latas no muestran fuente en pantalla, mientras que 02:13 (READY.GOV) y 06:26 (WHO) sí → añadir una etiqueta de fuente (no hay evidencia en los fotogramas de que las otras la tengan).

## Cumple
- El final es el menú de decisión sobre fondo vivo (Ava + Ribbon + celda), con "Most comments decide Day 3" y SUBSCRIBE, sin tarjeta final aparte. La voz cierra con "Comment yes or no".
- No aparece HUD en el primer plano y entra pronto en el segundo; no hay cabecera de canal.
- La fuente RE con captions pixelados es consistente en todo el vídeo, y el HUD es un panel CONDITION coherente.
- Los exteriores (00:33, 00:40, 06:40, 07:06) tienen mucho detalle: edificios, coches, puente y cielo.
- La sala de radio (01:33) y la comisaría (02:26) están ricas en detalle.
- Ribbon se ve simpático: cabeza unida al cuello, ojo redondo con brillo y tamaño correcto.
- Hay tarjetas horarias en Courier, notas a mano, diagramas con datos reales (matemática del agua correcta: 51 gal / 2 = 25 días) y fuentes en 02:13 y 06:26.
- Hay puzzle (clover key), NPC (Marla, Dutch), compañera (Ribbon) y "Oh fudge".
- No se ven símbolos manga.

## No verificable
- **Audio:** volumen y ritmo de la voz (speed ≈ 0.88), pausas, susurros [PIENSA], respiración, ausencia de gritos, y la toma reutilizada de "Oh fudge" → earshot critique.
- **Música y SFX:** música audible por capítulos con LUFS equilibrado (sin pasajes más fuertes), mapeo SFX→evento, beep de radio de Dino Crisis → earshot timeline y `mix_largo.py` (lista de no mapeados vacía).
- **Movimiento entre fotogramas:** temblor de Ava, flicker de lluvia, luz de puertas o suelos (z-fighting), clips de animación repetidos o en bucle → comparar diferencias de fotogramas del mp4 a ≥5 fps y el test del centroide del pelo.
- **Estructura y entrega:** capítulos ≥10 s en `DESCRIPCION.md` y la revisión por partes de ~2:40 con `revisar_render.py`.
