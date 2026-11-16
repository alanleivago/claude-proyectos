---
type: spec
status: active
tags: [zombie-channel, ava-restfield, long-form, 16x9, sets, contract]
relatedTo: [zombie-channel, ava-rules]
---

# Contrato de decorados — LARGO 16:9 ("Zombie Outbreak: 1 Night Locked Inside a Police Station")

Motor = copia del corto aprobado (`pieces/zombie-03-station/engine`, NO tocar aquel) pasado a **640x360 ×3 = 1920x1080**.
Guion: `../guion.md`. Planos (id, set, palabra ancla, que se ve): **`shots.json`** (manda; `../shotlist.md` es la version legible).
Los decorados del corto (`sets/ext.js hall.js rooms.js screens.js`, ya copiados aqui) son la base: reutiliza sus modelos,
texturas y personajes (Ava, zombis, el policia VICKERS con gorra/placa EXACTOS de hall.js), pero con CAMARAS NUEVAS 16:9.

## Tiempos: SIEMPRE anclados a palabras (nunca segundos fijos)
La voz se esta generando; `timeline.json` ahora es PROVISIONAL y luego se sustituye por la real (mismo formato).
- `ctx.T[id]` = inicio global del plano. `lt` = s desde el inicio del plano.
- `ctx.at(take, k)` = inicio global de la palabra k de la toma (`k` numero desde 0, negativo desde el final, o texto: primera
  palabra que empieza asi). `ctx.endOf(take, k)` = su final. `ctx.words(take)` = palabras `[txt, ini, fin, n, original]`.
  Ids de toma y texto: `../voz/takes.py`. Ej.: etiqueta en "tempered": `const tT = ctx.at('g3', 'tempered') - ctx.T['17_glass']`.
- Calcula esos tiempos DENTRO de `shots(ctx)` (y de `sfx(ctx)`), no a nivel de modulo.

## Modulo
`sets/<name>.js` exporta `async shots(ctx)` -> `{ '<id>': shot }` y `sfx(ctx)` -> `[[t_global, 'nombre_sfx'], ...]`
(un evento por accion visible, en el frame exacto: golpe, clic, tecla, paso, sello...). Nombres de SFX libres y
descriptivos (`glass_knock`, `bench_scrape`, `dog_whine`, `generator_start`...). film.js pone `t0`, `hard`, HUD y gamma.
**No toques film.js, main.js ni lib.js** (si te falta un helper, en tu modulo con prefijo propio).
shot = `{ scene, camera, update(lt, t), overlay?(lt, dt, a, o) }`; `o.pixelText(text, x, y, size, color, out, drop, {bold, spacing})`,
`o.tctx` (canvas 2D 640x360) para etiquetas; `L.toScreen(cam, x,y,z)` -> pixeles. `ctx.examine(o, lt, title, body)` = caja EXAMINE.
`ctx = { L, TL, hud, hudState, youDied, examine, CUTS, T, at, endOf, words, KEY_RATE }`. `L` = lib.js (`LW=640, LH=360`, box/plane/
mesh/basic/lam/cvs/rep/loadTex/loadModel/ps1Clone, `hero()`, seg/still, holdIn, rng, smooth, q15, toScreen, S). Fuente RE: `refont.js`.
Camaras: `new THREE.PerspectiveCamera(fov, L.LW / L.LH, ...)` (fov vertical: en 16:9 usa ~35-50).

## Zonas de pantalla (640x360)
HUD arriba a la izquierda (x 8-126, y 8-74) en los planos 3D; subtitulo centrado en y ~290-330. Etiquetas importantes fuera de ahi.

## Cinematografia (pedida para el largo)
- Angulos FIJOS clasicos de RE: camaras altas en esquina, Ava cruza el cuadro; al cambiar de zona, corte a otro angulo fijo.
- Push-ins lentos en los momentos de suspense (camara que avanza suave, nunca vibra).
- Transicion de puerta de RE entre salas (screens.js). Tarjetas de capitulo a maquina: las pone film.js.
- Pantalla ITEM/SUPPLIES cada ~90 s con totales (BULLETS 15; WATER 5 -> 11 -> 51 GAL; RIBBON x1). Contador de zombis en el cristal 3 -> 8 -> 20.

## Reglas del usuario (memoria ava-rules, OBLIGATORIAS)
- En planos frontales Ava mira A CAMARA (`ch.lookAt(camera, 1, 40)` despues de `ch.pose`), con gestos cute (guino, sonrisa, shrug).
- Ava NUNCA tiembla: sin vibracion de camara; solo tiembla el objeto golpeado (cristal, puerta, generador).
- Etiquetas y animaciones caen en la palabra que las dice. Cada accion visible lleva su SFX real en el frame (lista sfx()).
- Lluvia/gotas en el cristal caen HACIA ABAJO; sin reflejos parpadeantes. Gorras de policia bajas con visera (como hall.js), mismo policia en todos los planos.
- Props con detalle real de textura low poly (modelos gratis de plataformas 3D > procedurales feos). Solo ingles. Sangre = texturas reales (tex/).
- Luz: planos 3D ~30 % mas claros con sombras levantadas (film.js aplica gamma 0.8); no oscurezcas tus escenas. Pantallas/diagramas oscuros.
- Al hablar, la boca sigue `TL.mouth[Math.floor(t*15)]` ('A' talkA, 'O' talkO, '-' la de la cara) — t global.
- Determinista: nada de Math.random() ni tiempo real; `L.rng(seed)` y `lt`. Look PS1: texturas 32-128 px nearest, `L.basic/L.lam` (snap), sin brillo.

## Comprobar
`node stills.mjs ../review/<name> t1,t2,... --q "sets=<name>" --sheet ../review/<name>.png --scale 0.25` (t en s globales;
`window.FILM.cuts` / `CTX.T` dan los inicios). Mira inicio, mitad y final de cada plano. Errores de pagina salen como [pageerror].
