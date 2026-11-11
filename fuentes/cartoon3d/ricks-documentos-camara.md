# Ricks Clips: documentos y cámara (estudio cuadro a cuadro, 2026-11-09)

Fuentes (descargadas con yt-dlp en `refs-ext/ricks-docs-cam/`, solo local):
- HxqtHI62otM (pintura rosa en la cárcel): foco en documentos y avisos.
- 7xS87iActkU (ferrocarril, huecos en los rieles): foco en cámara.
- Mz72MuPgnGY (cocinero con aceite y piratas): foco en cámara.

Método:
- Hojas de contacto a 0,5 s de los tres videos completos, más hojas densas a 0,1 s de los tramos de documentos.
- Medición automática del movimiento de cámara cuadro a cuadro: flujo óptico LK y ajuste de similitud, a 30 fps y 270 px de ancho. La traslación se reescaló a 1080 px.
- Script: `scratchpad/cammeas.py` (no está en el repo).

## 1. Documentos y avisos: siempre son objetos del mundo, nunca texto flotante

- **Aviso pegado en la pared** (HxqtHI 2,3–3,6 s): una hoja con cinta azul en las esquinas que dice "P-618 BAKER-MILLER PINK, 1 pint red + 1 gallon white, EXACTLY!".
  - La cámara hace un **travelling lateral** a lo largo de la pared, de casi un ancho de cuadro en 0,5 s. Desacelera y **frena centrada sobre la hoja**.
  - Después sigue un **push-in lento** (la hoja crece ~15 % en 0,7 s).
  - Sale con un **fundido con movimiento de 0,2 s** hacia el plano siguiente.
  - La hoja está en perspectiva, iluminada por la escena y con la sombra del muro. No hay animación del texto: lo revela la cámara.
- **Mesa de trabajo cenital** (HxqtHI 5,8–7,7 s): es un solo movimiento continuo.
  - La cámara arranca en plano medio a la altura de los ojos (el personaje vierte pintura).
  - En ~0,8 s **sube en grúa e inclina hacia abajo** hasta quedar **casi cenital** (~70–80°), **girando ~30°** en el eje vertical mientras sube.
  - Ya cenital, sigue rotando y empujando despacio mientras pasa la acción (vierte, revuelve, el rojo se vuelve rosa).
  - El dato ("P-618 = 1 PT RED + 1 GAL WHITE") está **escrito a mano en una cinta de papel pegada al tapete de corte**, con el borde del encuadre cortándola en diagonal.
  - El dato acompaña a la acción, no la reemplaza.
- **Otras formas de mostrar información:**
  - Muestra de color "P-618" pegada en la pared junto a la cara (10–11 s).
  - Cronómetro sostenido frente a cámara (19,5 s; 46 s sobre la mesa verde).
  - Calendario "1979" en la pared (46,5 s).
  - En 7xS:
    - un diario sostenido por el personaje, con un push-in fuerte hasta que el titular ("THE CLICKETY CLACK LINE!") llena el cuadro (31,5–33,5 s);
    - carteles "ALL ABOARD!" en palos;
    - un calendario "MAY" sobre una caja junto a la vía (36,5 s);
    - una pancarta "FIRST LINE IN GETS IT ALL!" en la estación.
- **Regla:** el texto vive en papel, cartel, calendario, diario o cinta, dentro del set y sostenido o pegado por alguien. Lo revela un **movimiento de cámara** (travelling y frenada, grúa a cenital, push-in) o una **mano que lo sostiene**. Nunca hay "stickers" frente a la cámara. Los únicos FX en pantalla son dibujos de acción: venas, humo o estrellas, sin palabras.

## 2. Cámara: casi nunca quieta, empuja hacia adentro todo el tiempo

Medido (frames de cámara fija = traslación < 1,5 px/f y zoom < 0,08 %/f):

| short | cuadros fijos | velocidad mediana (px/f a 1080) | p90 | cuadros acercando / alejando | roll p90 |
|---|---|---|---|---|---|
| HxqtHI62otM | 10,5 % | 4,3 | 54 | 66 % / 20 % | 0,4°/f |
| 7xS87iActkU | 6,9 % | 16,7 | 74 | 60 % / 28 % | 1,0°/f |
| Mz72MuPgnGY | 3,7 % | 8,0 | 44 | 60 % / 27 % | 0,6°/f |

- **Push-in continuo como base:** en casi todos los planos la cámara se acerca sin parar. Por plano suma **+75 % a +380 % de zoom** en 2–5 s (por ejemplo +261 % en 4,7 s, o +381 % en 4,8 s). Es un acercamiento de **~0,3–0,7 % por cuadro (~10–20 % por segundo)**, con easing suave y sin saltos.
- **Alejamientos de revelación:** pocos y grandes (−80 % a −330 %).
  - Ejemplos: el plano aéreo de la granja que baja en grúa hasta el camión (HxqtHI 39–42 s) y el de las vías hacia el horizonte (7xS 48–52 s).
  - Pasan cuando cambia de escala la historia.
- **Grúas y órbitas combinadas con el push:**
  - grúa que baja por el cañón (7xS 4–6,5 s);
  - órbita alrededor del obrero en el puente (7xS 22–24,5 s);
  - travelling bajo a ras de los rieles, girando (7xS 37–45 s y 48–52 s);
  - cámara inclinada siguiendo el barco en la tormenta (Mz72 35–36,5 s).
  - La rotación de la cámara suele ser de 3–8° y acompaña el movimiento.
- **Velocidad:** las mesetas de 4–17 px/f (deriva lenta) se alternan con **acelerones de 45–110 px/f** que duran 4–8 cuadros. Esos acelerones son los barridos que llegan a un sujeto y frenan con desaceleración larga, no en seco.
- **Transiciones:**
  - además de los cortes secos en el inicio de palabra, hay muchos **fundidos con movimiento de 4–7 cuadros** en los que ambos planos siguen moviéndose (HxqtHI 15,0 / 22,0 / 30,5 s; 7xS 13,5 / 28,5 / 48,0 s; Mz72 6,0 / 16,5 s);
  - también hay barridos rápidos (whips) hacia el piso o el cielo para cambiar de lugar (7xS 7,5–8,5 y 21,5 s).
- **Plano largo:** cada short tiene 1–3 tomas continuas de 5–13 s en las que la cámara viaja (sube, gira y empuja) mientras la voz sigue.
- **Caras:**
  - aunque el cuerpo camine de perfil, la cara se lee completa: dos ojos, cejas y boca, corrida hacia el lado al que mira (7xS 3,5 y 14,5 s; Mz72 19,0 s);
  - nunca un solo ojo.

## 3. Cómo se aplica (guinea-rent v2 y piezas nuevas)

- **Cámara:** todos los planos tienen un push-in base de ~12–18 %/s, más órbita y/o grúa propias del plano. Los cambios de encuadre sobre la palabra son **movimientos con easing de ~0,45 s**, no saltos de 5 cuadros con quietud. Fundidos con movimiento de 5 cuadros entre planos del mismo lugar y whip al cambiar de lugar.
- **Información:**
  - en documentos del mundo (aviso de infracción con sello ILLEGAL, ordenanza 2008 con un círculo a mano, contrato firmado con la pata);
  - filmados en **cenital con paneo y rotación lenta**, y la escritura o el sello animados.
  - Placa con el nombre en la jaula, relojes de arena en vez de baterías flotantes.
- **toon.js:** en perfil se mantienen ambos ojos, ambas cejas y la boca, con la cara corrida hacia el lado al que mira.
