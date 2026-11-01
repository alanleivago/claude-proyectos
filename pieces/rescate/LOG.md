---
type: log
status: review
tags: [animate, cavecut, rescate]
relatedTo: [pieces/cavernas]
---
# rescate — LOG

Ref: TikTok @hai.zhang515 video 7696789673951104270 (notas: fuentes/cavernas/https-www-tiktok-com-hai-zhang515-video-7696789673951104270.md).
Hecho real: Erasto Crisanto Valdez, 31, desaparece 23 jul 2026 pescando con su padre (San Francisco La Paz, Sta. María Chimalapa, Oaxaca, límite Uxpanapa Veracruz); arpón hallado a ~65 m; Harry Gust (buzo EE.UU., equipo internacional, iba a recuperar el cuerpo) lo halla en una cámara con aire (manantial dentro); vuelve con otro buzo + tanques; sale 7 ago 2026; hospital por deshidratación/desnutrición; "para mí fueron 3 días".
Fuentes: mexiconewsdaily.com/gulf-coast/uxpana-veracruz-underwater-cave-rescue · divemagazine.com (mexican-spearfisher-rescued...) · nmas.com.mx (asi-rescataron-a-erasto...) · adn40.mx 2026-08-11.

## Estado
1. Historia APROBADA (17 beats): hook, river, fish, lost, search, days, gust, chamber, voice, promise, out, back, brief, file, light, hospital, end. Contador "DÍA" arriba (en vez de OXÍGENO); final 3→15; foto pixelada recta al final sobre negro (como cavernas).
2. Voz HECHA: Voz Tuneles 41641440, voice/script.json (la toma de la línea "voice" es voice_take.wav: voice.wav es la salida de voice.mjs!), voice.json 109.81 s, `voice.mjs . --model small`.
3. SIGUIENTE: look check — src/ copiado de cavernas (cave.js/beats.js/overlays.js/head.html son de Gollum: rehacer escenario: río en selva + boca de cueva, túnel inundado largo con línea guía amarilla, cámara de aire grande con manantial y roca, buzos con tanques amarillos, Erasto). piece.json copiado: actualizar title/duration/frames (109.81 s → 2636 frames), voice music -10. audio/mix_track.py y audio/fs copiados (ajustar ids de beats).

## Plan del escenario (src/cave.js a adaptar)
- Mantener u=0 boca, u=1 cámara (caveOutline lo asume). Boca = CENOTE a la IZQUIERDA en el lecho de un río de selva (de día); pozo vertical baja (~x -7, y 0.9 → -3), túnel inundado LARGO y ondulante a y≈-3.3 hasta x≈3, sube a la CÁMARA a la derecha CH≈{x 7.5, y 0.3, rx 2.4, ry 1.6}. WL=0.4 único (vasos comunicantes: río y cámara al mismo nivel) → aire en la cámara arriba de WL.
- Repisa de roca en la cámara (x 8.5–9.6, y≈0.45) + estalagmita: Erasto detrás. Manantial = chorrito/goteo en la pared de la cámara.
- Exterior: suelo casi plano (~0.9), río = canal tallado en el terreno a lo largo de z en x≈boca, plano de agua a WL; árboles de selva (instanced), cielo de día.
- Línea guía AMARILLA (Gust) revelada con setDrawRange según progreso; buzos = makePerson traje oscuro + tanque amarillo + máscara; arpón con círculo amarillo en u≈0.45.
- overlays: contador "DÍA N" arriba-izq en lugar de OXÍGENO; final 3→15; foto pixelada (Flow) al final (photo() ya está en overlays.js; asset assets/grupo.jpg → reemplazar por foto de Erasto/rescate).

## Look v2 (2026-11-01)
Escenario hecho (cave.js: colina sobre la cueva, río+cenote, selva tronco+copas+arbustos, estalactitas/estalagmitas/piedras, manantial, AO en el fondo; buzos con casco+2 lámparas+arnés+tanque amarillo+aletas; Erasto al salir SOLO tanque+máscara, sin aletas). beats.js: hook/river/chamber/file dibujados, el resto apunta a esos. overlays: DÍA N + rótulo de lugar y=440; photo() para el beat end. Usuario: "le pones traje a Valdez?" (corregido) + "más detalle, plano" (hecho v2). Pendiente: OK del look v2 → storyboard 17 beats; plano file flojo (cuerpos se confunden).

## Personajes v3
Proporciones adultas (people.js `headS` 0.84 cabeza más chica, skinbody.js `slim` 0.9) + trajes completos por color de vértice (`suit`/`panel`/`yoke`: franjas negras laterales, rodilleras, cuello alto). Erasto: neopreno naranja quemado con paneles negros; en river arpón en la mano + máscara en la frente (`F.fish(true)`); en file tanque amarillo a la espalda + arnés + máscara. Gust: traje gris claro (hombros más oscuros), arnés negro pecho+cintura, 2 tanques plateados side-mount, casco negro con 2 lámparas, máscara con vidrio + correa, regulador con manguera, aletas con pala. d2: traje teal con tanques blancos side-mount y casco claro. Padre: camiseta beige + pantalón.
cave.js: `diveGear(P, o)` reemplaza el tanque amarillo único; beats.js file: más separación entre los tres y cámara un poco más atrás. Flojo aún: file sigue apretado/teñido de azul; el traje de Erasto se ve liso de frente (sin cierre ni costuras).

Personajes v3 APROBADOS por el usuario (2026-11-01). Siguiente: storyboard 17 beats.

## Storyboard v1 (2026-11-01)
17 SHOT_FN propios en src/beats.js (ninguno prestado), cada uno con su movimiento de cámara y acciones por palabra. cave.js: st.fill/st.sheet, pez, arpón en el piso (u 0.45), tanques amarillos de repuesto en la mano izq. de Gust/d2, camilla, ambulancia, aldeanos p1/p2; se quitó la "tapa" verde de terreno sobre el cenote (se veía desde abajo). overlays: bigNum (3→15 en hospital, "15 DÍAS" en end), rótulo de lugar en 2 líneas (no invade la zona derecha). head.html: BOARDK (tiempo del panel por beat). Board: board.png.
1 hook — Erasto en la repisa, luz que parpadea, gira la cabeza en "alguien le contestó"; pull-back largo a cámara + subida del túnel.
2 river — crane down sobre el río; padre en la orilla; etiqueta ERASTO.
3 fish — sigue al pez del río al cenote y baja por el pozo; tracking lateral que baja con él.
4 lost — nada a ciegas por el túnel oscuro (luz baja), sale en la bolsa de aire; push-in.
5 search — gente en la orilla → un buzo halla el arpón (círculo amarillo) + cota "65 m"; órbita.
6 days — time-lapse en la cámara (repisa / manantial / acostado / encogido) con flash de luz en cada salto; DÍA 4→14; arco lento.
7 gust — Gust en la orilla, se tira al cenote y baja soltando la línea amarilla; crane vertical; etiqueta GUST.
8 chamber — sube por la rampa, emerge y grita; push-in (Erasto fuera de cuadro).
9 voice — la linterna barre la pared y revela a Erasto tras el pilar (levanta la mano, sonríe en "vivo"); dolly sobre el hombro.
10 promise — Gust arrodillado junto a él: niega, mano en el hombro, señala la salida; órbita a dos.
11 out — vuelve siguiendo la línea (cámara por delante), corte al exterior: padre + 2 aldeanos con manos a la cabeza.
12 back — Gust + buzo 2 con tanques amarillos de repuesto; tracking lateral; etiqueta BUZO 2.
13 brief — le ponen tanque/regulador (gearOn a 1.5 s), dedo arriba por paso; arco cercano.
14 file — en fila por la rampa; la cámara recorre la fila de cerca (BUZO → ERASTO → GUST, etiquetas al nombrarlos) y abre a plano de los tres; conos de linterna ocultos en el túnel (solo lente + lámpara).
15 light — sube por el cenote, rompe la superficie con flash de luz, padre arrodillado; crane up.
16 hospital — camilla a la ambulancia por la orilla, padre al lado; "3" en "tres días" que rueda a 15; dolly lateral.
17 end — pull-back a todo el corte con la línea completa + "15 DÍAS" (foto pendiente: falta assets/grupo.jpg).
Flojos: 12 back y 5 search (d2 teal se pierde en el agua azul; solo se leen tanques/casco), 6 days (Erasto chico en el manantial), 4 lost (oscuro pero el fondo de arenisca sigue claro), 17 end (corte chico arriba, mitad de abajo roca), 10/13 una mancha negra en el agua bajo la repisa (sin identificar).

## Storyboard v2 (2026-11-01)
Correcciones del usuario sobre v1 (board.png regenerado):
1. lost "todo negro": `blackout(st, k)` (beats.js) oscurece pared del fondo/paredes del corte/repisa (color ×0.07) y oculta el manantial; `inkMask()` deja solo un halo tenue alrededor de Erasto; luz 0.55, exposición 0.6. reset() lo restaura.
2. d2 (BUZO 2) traje MORADO `#7a3fb0` / hombros `#5a2c86` (como el buzo morado del ref) — se lee en el agua azul (search, back).
3. days: la cámara sigue a Erasto en cada salto del time-lapse (repisa / manantial / acostado / sentado) a ~6 m con arco lento; antes era un plano general de 12 m.
4. Mancha negra bajo la repisa (promise, brief) = las ALETAS de Gust de rodillas atravesando la repisa. Fix: `g.gearOn(true, false)` (sin aletas) en promise y brief.
5. end: el pull-back termina a mitad del beat (luego empuje lento) en un plano alto (cám. y 9.5, z 53, mira a y 1.1): el corte ocupa todo el ancho y la mitad de arriba es selva + cerros con neblina; "15 DÍAS" sobre un halo oscuro suave. Foto final sigue pendiente (falta assets/grupo.jpg).
6. Pilar (`st.pillar`): base en y 0 apoyada en la repisa (LEDGE0 − 0.06, x CH.x+0.58) + un zócalo de piedra; `mites` hundidos 0.06 en la repisa.
7. SELVA nueva: función `jungle()` en cave.js, portada de **pieces/lluvia/src/world.js** (pov3d; `mergeG` y `frondG` de la vegetación carniana). Palmeras de coco (tronco curvo anillado + corona de frondas caídas + cocos, 3 variantes; altas solo detrás de z −9, jóvenes en las orillas), árboles de copa ancha (ceiba, 3 variantes), helechos arborescentes, plátanos (`frondG` de hoja ancha), arbustos y frondas de suelo; 5 cordilleras con neblina (MeshBasic, más pálidas con la distancia) + bandas de niebla. Ningún GLB: no había modelos de árboles en piezas pov3d.
Flojos: en planos cercanos de la orilla (out, light, hospital) se ven muchos troncos sin copa (la cámara mira hacia abajo); voice: el pilar ahora queda grande en primer plano a la izquierda; end: la mitad de abajo sigue siendo roca (es la zona segura inferior).

## Export v1 (2026-11-01)
Arreglos del usuario sobre v2:
- out, light y hospital: cámara baja (y ≈ 1.2–1.9 sobre el suelo) mirando a la altura de las cabezas (fov 36–40). Ahora se ven las copas, las palmeras y los cerros con neblina.
- voice: la cámara va a la derecha del pilar (x 7.9→8.5, z 4.2→3.3), así que el pilar queda chico al borde izquierdo.
- search: el buzo se detiene antes del arpón (u 0.37) y el círculo cae sobre el arpón. Después la cámara se aleja para que entre la cota completa de "65 m", desde el cenote hasta el arpón.
- end: el pull-back dura 2,1 s. A los 1,9–2,6 s el fondo se oscurece al 88 % y en 2,2 s entra la FOTO REAL (Gust, Erasto y Rivera en el hospital, de Mexico News Daily; ver brief.md). El subtítulo "Fueron quince." se va cuando entra la foto y el cierre es negro total.
- Rótulos de nombre más grandes (900 42px, con contorno), se ocultan si el personaje sale de cuadro. En file, "BUZO" pasó a "BUZO 2". Los subtítulos van con líneas balanceadas, sin palabras huérfanas.
- Sonido: audio/mix_track.py con los 17 beats. Lo hizo un fork; las fuentes están en brief.md. track.wav −16,2 LUFS antes de la voz. El golpe cae en el corte a light tras 0,86 s de cero digital.
Review (export.mjs + review.mjs):
- Narración PASS: 229 palabras, ≤3,5 palabras/s, word hits PASS.
- Texto: 0 en zona segura y 0 cortados (después de achicar el rótulo de lugar y retrasar la cota).
- Sonido: −14,2 LUFS integrado, pico −1,3 dBTP, golpe más fuerte en 92,8 s tras 0,7 s de silencio.
- Cortes fuera de la rejilla de 120 BPM: esperado, porque el reloj es la voz.
- Dead beats: WARN en 22,25–27,25 s. Es lost: hay movimiento, pero el negro pedido por el usuario baja el contraste medido.
revisar_render.py dio "CASI". Se arreglaron: círculo y cota del arpón, rótulos chicos o cortados, BUZO/BUZO 2, líneas huérfanas y el subtítulo sobre la foto. No se tocaron: el agua "por debajo del tsunami" (es el look aprobado), lost demasiado oscuro (lo pidió el usuario), el crédito de la foto (la regla es sin rótulo; va en la descripción), y nubes y aves.
Flojos: gust, los primeros 3 s casi quietos (Gust se ajusta en la orilla); lost, casi negro; brief, el subtítulo cae sobre las manos del regulador.
