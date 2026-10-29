---
type: spec
status: active
tags: [zombie-channel, remake, threejs, ps1, sets, contract]
relatedTo: [zombie-channel]
---

# Contrato para los decorados (sets/*.js)

Ep2: remake de `fuentes/zombie-ref2/ref.mp4` ("How to properly barricade a window", Learn with Alya) con guion mejorado.
Lista de planos con tiempos, acción y textos: `../shotlist.md`. Fotogramas de la ref a 2 fps en `fuentes/zombie-ref2/f2/NNN.png`
(NNN = 1 + 2·t). Plano a tamaño real: `ffmpeg -ss T -i fuentes/zombie-ref2/ref.mp4 -frames:v 1 x.png`.
El ep1 aprobado (`pieces/zombie-01-door/engine/sets/hall.js, rooms.js, diagrams.js`) es la plantilla: reutiliza su código
(Ava, zombis, pistola/recarga, texturas, sprays/hierbas, etiquetas, rattle) copiándolo a tu módulo.

## Reglas del usuario (memoria ava-rules, OBLIGATORIAS)
- En planos frontales Ava mira A CÁMARA (`ch.lookAt(camera, 1, 40)` después de `ch.pose`), con gestos cute (guiño, sonrisa).
- Ava NUNCA tiembla: sin vibración de cámara; si algo empuja, solo se mueve el objeto empujado.
- Etiquetas y animaciones caen en la palabra que las dice (tiempos en `TL.words`: [texto, inicio, fin, línea, palabra]).
- Props con detalle real de textura low poly. Solo inglés. La luz general la sube film.js (gamma 0.8 en planos 3D): no oscurezcas tus escenas.

## Reglas
- Cada módulo `sets/<name>.js` exporta `export async function shots(ctx)` que devuelve `{ '<id>': shot, ... }` con los ids de
  `CUTS` en `film.js`. `film.js` pone `t0`, `hard` y el HUD; **no toques film.js, main.js ni lib.js** (si te falta un helper,
  escríbelo en tu módulo con prefijo propio).
- shot = `{ scene, camera, update(lt, t), overlay?(lt, dt, a, o) }`; `lt` = segundos desde el inicio del plano. `o.pixelText(text,
  x, y, size, color, out, drop, {bold, spacing})` y `o.tctx` (canvas 2D 360x640) para etiquetas; `L.toScreen(cam, x,y,z)` da
  píxeles de pantalla. Las etiquetas de diagrama son cajitas con borde de 1 px y texto pixel pequeño (8-9 px), unidas con una línea fina.
- `ctx = { L, TL, hud, hudState, youDied, examine, CUTS }`. `L` = lib.js: `THREE`, `LW=360`, `LH=640`, `box/plane/mesh/basic/lam/
  cvs/rep/loadTex/loadModel/ps1Clone`, `hero()` (Ava), `seg/still`, `holdIn`, `rng`, `smooth`, `q15`, `toScreen`, `S`.
- Determinista: nada de `Math.random()` ni tiempo real; usa `L.rng(seed)` y el tiempo `lt`.
- Look PS1: texturas pequeñas (32-128 px) con `nearest`, materiales `L.basic`/`L.lam` (ya llevan el snap de vértices),
  pocos polígonos, sin brillo. Texturas dibujadas en código con `L.cvs(w, h, fn)` o archivos propios en `tex/`.
- Ava: `const ch = L.hero(); scene.add(ch.root)`; en `update`: `ch.pose(lt, segs, faces)` con `segs = [L.seg('idle', 0, {loop:true}), ...]`
  y `faces = [[t, eyes, mouth], ...]` (ojos: open half blink happy surprised angry sad wink shocked relaxed disgust;
  bocas: neutral smile smileOpen talkA talkO surprised frown shout gasp bigShock disgust). Al hablar, la boca sigue a
  `TL.mouth[Math.floor(t*15)]` ('A' -> talkA, 'O' -> talkO, '-' -> la de la cara). Mide 1,70 m, mira a +Z, pies en y=0.
  Acciones: idle walk point wave hands_on_hips cheer think shrug surprised kneel sit_floor nod shake_head look_around
  talk_gesture hold_up_object drink pour carry_heavy pump dig scoop_kneel saw present phone_look sick smug shiver warm_hands
  drop_object squat pinch_nose pull_chain throw_out_window bend_pipe detector_walk detector_stop melt_beam catch_object
  push_heavy push_door lift_bar peek turn_key (30 fps; ver `pieces/zombie-girl/anim/build_anim.py` / README de zero-fem).
- Assets descargados (zombis, pistola RE2, muebles): `assets/zombie-kit/INVENTARIO.md`. Cópialos a `engine/models/` (GLB).
- Comprueba tu trabajo: `node stills.mjs ../review/<name> t1,t2,... --q "sets=<name>" --sheet ../review/<name>.png --scale 0.25`
  y mira la hoja junto a la referencia en los mismos tiempos. Cada plano: inicio, mitad y final.
