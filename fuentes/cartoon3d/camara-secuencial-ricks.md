---
type: spec
status: active
tags: [cartoon3d, camera, one-take, continuous-camera, orbit, crane, dutch-roll, whip-transition, ricks-clips]
relatedTo: [styles/cartoon3d/STYLE.md, fuentes/cartoon3d/camara-dinamica-6WTahOqdEl4.md, styles/cartoon3d/tools/cam_motion.py]
---
# Cámara secuencial de Ricks Clips (pedido del usuario, 2026-11-11)

El usuario quiere, desde ahora en todos los videos cartoon3d, el movimiento de cámara de estos shorts: "un paneo muy
dinámico y más secuencial, no solo se mueve en 2D en una sola dirección y ya".
Refs (bajadas a `refs-ext/ricks-docs-cam/`, no se suben): i4hYq1oSXTg (la más fluida), 7xS87iActkU, Mz72MuPgnGY.
Medido con `styles/cartoon3d/tools/cam_motion.py` (LK + similitud RANSAC, cuadro a cuadro); datos en `cam/`.

## Números

| ref | duración | planos detectados | quieto | cambios de dirección del paneo | cambios de sentido del zoom | 3+ ejes a la vez | roll máx |
|---|---|---|---|---|---|---|---|
| i4hYq1oSXTg | 66,8 s | 2 (intro 2,4 s + **un plano de 64 s**) | 21 % | 41 (uno cada 1,6 s) | 41 | 59 % | 1,45°/f |
| 7xS87iActkU | 65 s | 9 (uno de **54,5 s**) | 12 % | 45 (uno cada 1,2 s) | 61 | 76 % | 4,3°/f |
| Mz72MuPgnGY | 64,6 s | **1** | 13 % | 35 (uno cada 1,8 s) | 37 | 66 % | 2,5°/f |

## Lo que se ve frame a frame
- **Un solo plano continuo por video.** No hay cortes: la cámara VIAJA de un encuadre al siguiente y de un lugar al
  siguiente. Para cambiar de lugar hace un barrido con desenfoque de movimiento + fundido corto (smear), nunca un corte seco.
- **Movimientos encadenados con cambio de dirección:** push hacia un personaje → giro rápido (whip) al siguiente que
  habla → deriva lateral → grúa hacia arriba que abre a un plano general. Cada tramo dura ~1,2-1,8 s y el siguiente sale
  en otra dirección (otro eje), sin frenar a cero.
- **Es 3D, no 2D:** órbita alrededor del sujeto (el fondo se desliza con paralaje respecto del primer plano), grúa
  picado/contrapicado (cambia la perspectiva del suelo), inclinación holandesa que entra y sale (Mz: el barco se inclina
  ±15-25° mientras la cámara rodea al cocinero y luego sube a vista de dron sobre el mar).
- **3-4 ejes a la vez** (paneo x + paneo y + zoom + roll) el 60-75 % del tiempo; quieta solo 12-21 %.
- La cámara llega al personaje en la palabra que lo nombra ("His **commander**") y se queda en deriva lenta mientras habla.

## Cómo aplicarlo en el kit
- Un camino de cámara continuo por set (spline de keyframes x, y, zoom, roll + ángulo de órbita), no snaps sueltos.
- Paralaje por capas de profundidad: en la órbita y la grúa el fondo se mueve menos (o al revés) que el primer plano.
- Transiciones entre sets = whip con motion blur de 4-6 frames + fundido, en la dirección del movimiento.
- Roll holandés suave de ±3-8° que respira (más fuerte en momentos de caos).
