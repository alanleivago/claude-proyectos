# Revisión de stimulus-01.mp4

- Estilo: -
- Duración: 52.9 s

## Veredicto
**CASI (fallos menores):** el lenguaje visual Stimulus está bien armado (contador serif detrás del presentador, títulos con RGB split, iconos sincronizados, lista y CTA acumulados, outro original). Faltan un subtítulo, el itálico del resalte y varias colisiones entre iconos o logo del pecho y el texto.

## Fallos
1. **[00:04.8–00:05.9]** "Sounds amazing, right?" no tiene subtítulo. Tras "through fundraising." (hasta 4.6) el fotograma de 5.3 está vacío y a 5.9 ya entra "But wait,". → Regla de sincronía y cobertura de subtítulos, y el guion no se recorta. → Añadir el bloque "Sounds amazing, right?" (y "right?" en lima si se quiere). Si es una pausa muerta, cortarla en la voz.
2. **[00:06.6, 00:13.2, 00:17.8, 00:21.1, 00:25.8, 00:39.6, 00:42.9, 00:45.6, 00:48.2]** Las frases resaltadas en lima se ven en recto, no en **cursiva bold**. → Regla de resalte (cursiva bold #E6F25A). → Aplicar cursiva al resalte. Además conviene resaltar solo la palabra clave, no el bloque entero ("never leaves their store.", "add a fundraising amount").
3. **[00:00.0]** El primer fotograma sale nítido y a escala ~100 %, sin el zoom-blur de 110–115 % que debe asentarse en 0.33 s. → Regla de apertura. → Meter whip o zoom-blur en 0.00–0.33 s. Verificar frame a frame, porque 0.0 podría ser un fotograma ya asentado.
4. **[00:33.0–00:36.3 y 00:48.2–00:49.5]** El logo "S" del pecho choca con el texto. Queda pegado a "COACHES" y entre "what your club" y "could raise?". En 35.7 la línea "WHATEVER YOUR CLUB NEEDS" roza el balón, y en 49.5 "Link in bio." también. → Limpieza de capas y legibilidad de la lista y el CTA. → Subir o bajar el bloque, o escalar o desplazar el clip para sacar el logo de la zona de texto. El interlineado del CTA mide ~92 px, por debajo del 100–110 px de la regla.
5. **[00:09.2, 00:15.2, 00:23.8, 00:37.0]** Los iconos (tarjeta, balón, recibo, X) tapan la última letra del título (T, S, E) y quedan pegados al borde derecho (~98 % del ancho). → Jerarquía y zona segura. → Moverlos ~5–6 % hacia dentro o ponerlos fuera del renglón del título.
6. **[00:31.7–00:37.0]** La lista no sigue el estilo de la referencia. Los checks son cuadrados redondeados de ~75 px (la regla pide círculo #22C55E de 36 px). El texto va recto en MAYÚSCULAS, no cursivo, y sin el RGB split sutil. → Regla del check de lista. → Ajustar forma, tamaño y tratamiento del texto.
7. **[00:00–00:50]** La cabeza del presentador queda entre y≈37 % y 52 %, bajo el rango 20–45 %. El mentón cae justo en la franja del subtítulo (y≈53 %). → Regla de encuadre. → Con el punch-in de ~110 %, anclar el recorte hacia arriba para subir la cara.
8. **[00:29.7, 00:37.0]** La X es un trazo rosa plano, mientras el resto de iconos son 3D. El rosa tampoco es el rojo #E8202A de la paleta. → Consistencia de iconos y paleta. → Usar una X 3D roja o rehacerla con el mismo estilo.
9. **[00:50.2]** Queda ~0.6–0.9 s de presentador mudo, sin subtítulo, antes del outro (entra ~50.4–50.9). → Regla de fin de contenido: corte al outro a 0–0.2 s de la última palabra. → Cortar la cola.
10. **[00:20.5, 00:37.0]** Hay huecos breves sin subtítulo (el segundo cubierto solo por el título "STORE CREDIT"). → Cobertura de subtítulos. → Verificar con la voz; si hay habla, añadir bloque.

## Cumple
- Vertical 9:16, presentadora centrada, fondo negro con neón Stimulus, sin viñeta ni grano.
- Subtítulos DIN Bold blancos, sentence case, 2–4 palabras, sombra suave, sin caja, centrados en y≈53 %.
- Tamaño de subtítulo ≈60 px; ancho dentro de 8–88 %.
- Color de resalte lima correcto (#E6F25A aprox.).
- Gancho: contador serif ($2,120→$3,820→$4,740→$5,000) en crema, con RGB split y glow, detrás de la presentadora, entra a 0.7 s y sale a ~4.6 s. Pisa el neón, lo cual el creador acepta.
- Títulos secundarios (STORE CREDIT, HOW IT WORKS, REGULAR PRICE, IN CASH, CASH) con el mismo tratamiento serif y subtítulo a y≈50 % debajo.
- Iconos 3D sincronizados con la palabra que ilustran (⚠ "But wait", camiseta "jerseys", candado "never leaves", billete "in cash", control "you control", gráfica y enlace en el CTA).
- Acumulación de 4 líneas en la lista y en el CTA final, sin borrar las anteriores, dentro de x 8–88 %.
- Saltos de escala secos 100 %↔~110–115 % en frases nuevas, y algo cambia en pantalla cada ~1–3 s.
- Outro negro original sin modificar: logo, tagline construyéndose por palabras y URL.
- Duración fuera de rango (≈53 s), pero justificada por el guion íntegro del cliente.

## No verificable
- Sonido: voz, música a −20/−25 dB, whooshes, hits, pops de iconos y sting del logo → `earshot timeline/critique`.
- Fade-in y pop 90→100 % de cada subtítulo, y que el texto escale con el punch-in → revisar frame a frame con ffmpeg.
- Easing de los push-ins lentos, duración real de los zooms y glitch RGB/blur de los números del contador → frame a frame.
- Flashes cálidos (#FFFF70) o light leaks: no se ven en los fotogramas muestreados (cada ~0.65 s) → revisar a resolución de frame.
- Sincronía exacta de ±0.1 s entre subtítulo y palabra, y si hay pausas muertas (5.3, 20.5, 50.2) → `earshot` sobre el audio.
- Animación de entrada y barrido o corte al outro, y la altura final de la URL (≈94 % en el asset original) → asset no modificable.

## Críticos

**1) Director de arte de motion/branding: 7/10**
1. **[00:09.2 / 00:15.2 / 00:23.8 / 00:37.0]** Reubicar los iconos para que no tapen la letra final del título ni toquen el borde. Con un margen interior ~6 % se resuelve.
2. **[00:33.0–00:36.3 / 00:48.2–00:49.5]** Resolver la colisión del logo del pecho y el balón con la lista y el CTA (desplazar bloque o recorte), y subir el interlineado del CTA a ~105 px.
3. **[00:06.6 y todos los lima / 00:31.7]** Unificar tipografía y estilo: resalte en cursiva bold, lista con check circular verde, texto cursivo y RGB split, y X 3D roja.

**2) Estratega TikTok/Reels B2B deportivo: 7.5/10**
1. **[00:00.0–00:00.7]** Los primeros 0.7 s no tienen gancho visual y no hay whip. Hacer que el contador arranque en el frame 0 con zoom-blur, y que "$5,000" caiga en la palabra.
2. **[00:04.8–00:05.9]** Hay una pausa muerta y falta el subtítulo de "Sounds amazing, right?". Cortar la pausa y subtitular esa frase para sostener la retención hacia el "But wait,".
3. **[00:47.0–00:50.9]** El CTA "Link in bio." aguanta ~1.5 s sin refuerzo y luego hay ~0.7 s de silencio hasta el outro. Cerrar con pop del icono de enlace en "Link in bio", cortar la cola y entrar al outro de golpe.
