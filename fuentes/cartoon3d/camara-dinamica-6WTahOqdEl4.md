---
type: spec
status: active
tags: [cartoon3d, camera, snap-zoom, whip-pan, motion-blur, reference-measurement]
relatedTo: [styles/cartoon3d/kit.js, fuentes/cartoon3d/tutorial-mromidev-gap.md, pieces/mistaken-orders]
---
# Cámara dinámica — referencia youtube.com/shorts/6WTahOqdEl4 (medida frame a frame)

Video bajado a `refs-ext/cam-6WTahOqdEl4/` (no se sube). Medido con flujo óptico, cuadro por cuadro: LK + similitud RANSAC entre frames consecutivos a 30 fps. Se miden paneo en px por frame a 1080 de ancho, zoom en % por frame y roll en grados por frame. Datos en `cam.csv`; script en el scratchpad de la sesión (`cammotion.py`).

## Números
- **Duración y cortes:** 59.3 s, 52 cortes (~53 por minuto). Plano medio de 1.1 s, pero muchos planos son una sola cámara continua de 3 a 8 s con varios saltos dentro.
- **Snaps:** 81 por minuto, uno cada ~0.57 s de mediana (p10 0.23 s / p90 1.5 s).
  - **Duración:** 5 frames de mediana (p10 3 / p90 11).
  - **Velocidad pico:** 255 px por frame de mediana (p90 630). Es un 24 % del ancho del cuadro por frame.
  - **Recorrido:** ~740 px de mediana (70 % del ancho), p90 2500 px.
  - **Zoom/dolly por snap:** ±86 % (p90). Hay 38 acercamientos, 24 alejamientos y 19 paneos puros.
  - **Curva de velocidad:** forma de campana. Acelera en 2–3 frames y frena en 3–5 frames, aterriza en seco y se queda quieta.
- **Pausas entre snaps:** casi quietas, con deriva mediana de 4 px por frame. Lo dinámico viene del contraste entre pausa y snap, no de un empuje constante.
- **Crash zoom:** en las palabras fuertes la cámara se acerca de golpe, entre +30 y +44 % por frame durante unos 6 frames (+150 % en total). Por ejemplo, de la mesa entera al teléfono.
- **Whip:** en los cambios de lugar hay un paneo de 1–2 frames, enorme (~2000 px), con roll de 20–50° y desenfoque de movimiento.
- **Desenfoque:** los frames rápidos llevan desenfoque de movimiento.
- **Encadenado:** la cámara recorre la habitación enlazando objetos y personajes (foto → estante → personaje; reloj → mudanceros → mesa → teléfono visto desde arriba) en lugar de cortar.

## Segunda pasada: a qué apunta cada zoom (2026-11-03, corrección del usuario)
Analizado con `tools/analizar_camara.py`: compara el cuadro de antes y el de después de cada salto con la voz de ese momento, usando los créditos de la API. El informe está en `refs-ext/cam-6WTahOqdEl4/ref_camara.md`.
- **Nunca al azar.** Cada zoom in aterriza en el objeto o texto que la voz nombra en ese momento, o 1–2 palabras antes. Ejemplos: el reloj con "40 minutes", el teléfono con "call", la etiqueta con "your name". Es así en el 69 % de los saltos; el resto son transiciones de paso.
- **Textos.** Cuando el texto es el sujeto, entra entero y legible. El zoom se detiene cuando la frase clave cabe. Solo se recortan cosas secundarias.
- **Personajes.** La cabeza siempre entra entera; el cuerpo puede cortarse por abajo. Ocupan 0.45–0.75 del alto como sujeto y 0.25–0.40 en los planos de contexto.
- **Cuánto se cierra.**
  - Para presentar un detalle nuevo cierra mucho (+50 % a +190 %), hasta que llena el 65–100 % del alto.
  - Los punch-ins sobre el mismo sujeto son chicos (+8 % a +18 %).
  - Los zooms in encadenados avanzan por escalones: hoja entera → título.
- **Zoom out.** Va de −80 % a −150 % después de cada detalle: reabre la escena para mostrar quién hace qué, o cambia de idea o de lugar.
- **Encuadre.** El sujeto va centrado, un poco arriba del centro, lejos de la franja de subtítulos.

## Cómo se aplica (kit cartoon3d, `C3_SNAP`, 2026-11-03)
- **Activar:** `C3_SNAP = Object.assign({}, C3_SNAP_DEF)` en `shots.js`.
- **`c3FrameBox(caja, dir, fill)`:** calcula la distancia para que el objetivo que nombra la voz entre ENTERO en el cuadro. En `SNAPS[id]` (`shots.js`) cada salto se declara como `[t de la palabra, objetivos, fill]`, y se agrega un punch-in de +18 % sobre el mismo sujeto a mitad de cada pausa de más de 1.2 s.
- **`c3SnapCam(keys, lt)`:** mantiene cada encuadre y salta al siguiente en 5 frames con smootherstep (velocidad en campana). Cada plano debe llevar 2 o 3 encuadres con snaps sobre palabras dichas.
- **Palabras fuertes:** las de `C3_CAMFX.punch` reciben un punch-in chico sobre el mismo sujeto (×0.88 de distancia en 5 frames, tope 25 %); los zooms grandes son los saltos de SNAPS a lo que se nombra. La deriva en las pausas es de 0.35 % por frame.
- **`c3SnapBlur(draw, t)`:** desenfoque de movimiento promediando 4 subframes cuando la cámara salta.
- **`c3Whip(u, dir)`:** whip con estela y roll de 3 frames en cada cambio de lugar. Cortes secos en todo lo demás (sin disolvencias).
- **Prueba:** `pieces/mistaken-orders`, con `SNAP_TEST` en `src/shots.js` (salida `renders/video_only_snap.mp4`).
