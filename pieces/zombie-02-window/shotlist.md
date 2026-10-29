---
type: spec
status: active
tags: [zombie-channel, ava-bread, remake, learn-with-alya, shotlist, ps1, window]
relatedTo: [zombie-channel, ava-rules]
---

# Ep2 "How to properly barricade a window" — lista de planos

Ref: `fuentes/zombie-ref2/ref.mp4` (Learn with Alya, 55 s). Fotogramas a 2 fps: `fuentes/zombie-ref2/f2/NNN.png` (NNN = 1 + 2·t, 360x640).
Hojas: `fuentes/zombie-ref2/frames/sheet.png` (1 fps) y `frames/end.png` (36-54 s a 2 fps).
Voz ya montada (`engine/timeline.json`, palabras con tiempos). Tiempos GLOBALES en s. Plantilla aprobada: `pieces/zombie-01-door` (ep1 v6).

## Guion (voz "ava bread 2", tiempos reales de la voz)
01 0.30-2.00 "Zombies are at your window…" · 2.44-4.88 "so you nail some boards across it, like in the movies."
02 5.62-7.33 "But movie boards fail twice." · 7.56-9.27 "Hands fit through the gaps…" · 9.39-11.18 "and nails only hold by friction."
03 11.90-14.27 "And friction still doesn't care about your feelings."
04 17.48-19.34 "So, one sheet of plywood. No gaps." · 20.12-22.31 "Four inches bigger than the hole, on every side."
05 23.30-25.24 "Screw it into the wall studs, not the trim." · 25.84-27.75 "Screws, not nails, every twelve inches."
06 28.40-29.78 "Now… which side?" 07 30.86-32.72 "Inside… they push it off your screws." 08 33.28-35.11 "Outside… they push it into the wall."
09 35.94-37.60 "So you install it outside." 10 39.34-40.49 "Oh… nope."
11 41.18-42.66 "Inside it is, then." · 42.78-44.65 "Brace it to the floor, like the door."
12 44.77-46.25 "Congratulations…" · 46.37-48.28 "you have properly barricaded a window."
13 49.46-50.63 "Oh, fudge!" (coletilla fija de Ava) 14 50.76-52.27 "Water is next week."

## Planos (id = clave en film.js CUTS)
| id | t0 | set | plano (ref) | acción |
|---|---|---|---|---|
| 01_hero | 0.0 | room | plano medio frontal: Ava con la pistola delante de una ventana (cristal, marco de madera); un zombi pegado al cristal detrás, a su derecha | recarga (`reload`, como ep1) y mira a cámara; zombi golpea el cristal |
| 02_nail | 2.3 | room | 3/4 trasero: Ava clava tablas en diagonal/horizontal sobre la ventana con un martillo | martillazos (SFX), en "movies" (~4.5) pose de película: martillo en alto |
| 03_fail | 5.4 | room | frontal: Ava delante de la ventana ya tapiada con 3 tablas; zombi detrás entre las tablas | brazos cruzados/manos en la cadera; en "twice" algo cede |
| 04_hand | 7.4 | room | primer plano lateral: brazo del zombi atraviesa el hueco entre tablas hacia Ava (ref: botón ⊗ de PlayStation en pantalla, como un QTE) | la mano agarra el aire, las tablas tiemblan (solo las tablas) |
| 05_diag_nail | 9.3 | diagrams | diagrama en corte (fondo azul con cuadrícula): tabla naranja sobre el marco fino (moldura blanca), clavo; flechas rojas de empuje | el clavo se sale; etiquetas THIN TRIM, NAIL, HELD BY FRICTION (cian) en "friction" |
| 06_friction | 11.5 | closeups | primer plano de Ava (estantería con sprays/hierbas detrás como ep1 o pared con papel pintado), mira a cámara | cute: ojos cerrados y suspiro en "still", mira a cámara, guiño en "feelings"; al final la imagen se tiñe y aparece un zombi detrás (ref 14.6) |
| 07_died | 14.55 | film.js | YOU DIED …AGAIN. (congela 06) | — |
| 08_examine | 17.2 | diagrams | EXAMINE de inventario RE: lámina de contrachapado girando sobre cuadrícula verde (ref) | "PLYWOOD 5/8 in x1" / "One sheet. No gaps for hands." |
| 09_diag_frame | 19.8 | diagrams | diagrama frontal: hueco de ventana con marco naranja (montantes), lámina encima | cota "+4 in" a cada lado en "four inches"/"every side"; en 23.3 "THE WALL (STUD)" verde; "THE TRIM" ✕ rojo en "trim"; puntos rojos de tornillo cada 12" en 25.x |
| 10_drill | 25.55 | room | 3/4: Ava atornilla la lámina sobre la ventana con un taladro amarillo | taladro con SFX en "screws", "nails", "twelve" |
| 11_diag_side | 28.15 | diagrams | corte cenital de la pared (dos bloques grises con el hueco), flechas rojas de empuje desde fuera | 28.4 "which side?"; 30.86 INSIDE: lámina dentro, la empujan y salta de los tornillos ✕ ONLY THE SCREWS HOLD; 33.28 OUTSIDE: lámina fuera, empuje la aprieta contra la pared ✓ THE WALL HOLDS IT |
| 12_look | 35.6 | room | perfil: Ava mira la ventana tapiada desde dentro | "so you install it…" asiente |
| 13_horde | 37.1 | outside | exterior con niebla: verja/columnas, horda de zombis (3 modelos) avanzando hacia cámara | entran en "outside", gruñidos |
| 14_nope | 39.2 | closeups | primer plano frontal de Ava | "Oh… nope.": ojos en shock, niega con la cabeza |
| 15_brace | 40.9 | room | 3/4 trasero: lámina por DENTRO de la ventana, Ava encaja un puntal (2x4) en diagonal al suelo; sofá azul en primer plano | en "brace" pone el puntal, en "the door" golpecito de comprobación |
| 16_congrats | 44.6 | closeups | primer plano, sonrisa (ojos happy), mira a cámara | puño arriba en "window" |
| 17_pipe | 48.55 | outside | alfombra de pared (patrón rojo/azul) donde revienta una tubería: chorro de agua azul | la tubería sale por la alfombra, chorro |
| 18_fudge | 49.3 | closeups | primer plano, cara de fastidio | "Oh, fudge!" (frown) |
| 19_spray | 50.7 | outside | misma alfombra, el agua sigue saliendo | — |
| 20_end | 52.6 | film.js | tarjeta: NEXT: / WATER. + objeto girando | — |

HUD (film.js): WINDOW, CAUTION desde 03, DANGER 7.4, CAUTION 28.2, FINE 44.2.
