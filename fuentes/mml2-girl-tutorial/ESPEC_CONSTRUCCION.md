# Chica MML2 del video de MercurialForge ("Mega Man Legends' Timeless Look", DqntXa7dOO8)

- Link: https://www.youtube.com/watch?v=DqntXa7dOO8 (13:55). Análisis denso por API: `analisis_lotes.md` (4 tramos, fotogramas cada 2 s en 5:48-12:10).
- El personaje es **Ashley Graham (Resident Evil 4) en estilo MML**: es su fan art, no comparte el modelo. Material `AshleyFace`/`AshleyMouth`, archivo `Ashley_posed.blend`.
- Fotogramas de referencia (locales, git-ignorados) en `frames/ref/`: `ref_front_idle.png` (12:39), `ref_3q_hip.png` (12:23), `ref_side.png` (12:16), `ref_back.png` (12:17), `ref_pose_run.png` (13:05), `ref_poses_lineup.png` (13:08, las 3 poses), `ref_face_atlas.png` (10:40), `ref_texture_uv.png` (8:32). Hojas de contacto: `frames/sheets/`.

## Lo que hace el autor
1. **Presupuesto** [01:56-05:48]: Roll in-game 350 tris, Tron 343, Roll cinemática 474, Tron cinemática 405. Su Ashley tiene **474 tris** (etiqueta en 12:22).
2. **Texturas** [05:48]: 256x256 como máximo para personajes principales (NPC 256x128). Ashley usa **dos de 256x256**: cuerpo y cara con **12 expresiones**.
3. **Modelado** [06:11-07:57]: "hacer que cubos parezcan una persona". Tiene a Roll y Tron (ripeados de models.spriters-resource.com) en la escena. Los brazos los mide encima de los de Roll, las piernas al lado de las de Tron y la cabeza copiando los loops de Tron. Usa piezas separadas y rígidas (Torso, Waist, Skirt, Arms, Legs, Neck, cabeza `Cube` de 77 caras/101 tris, pelo con `Cone`) y ningún modificador. La foto de referencia está en el viewport.
4. **UV + textura a la vez** [07:57-08:49]: primero pone las UV de la cara y las manos sobre la textura de Roll para copiar la técnica. Luego hace una base de 256 con el tono de piel, proyecta cada sección, la llena con bloques de color, agrega los colores de sombra y separa las UV de las sombras. Pinta en **Aseprite + Pribambase** (sync Blender↔Aseprite), con TexTools y Mio3 UV para las UV.
5. **Luz pintada** [08:49]: los personajes siempre están iluminados desde el frente y desde arriba. **Toda cara que no mira al frente usa el tono oscuro**: espalda, parte trasera de brazos, piernas, zapatos y cabeza.
6. **Cara** [09:19-11:24]: sin estiramiento en ojos y boca. Ojos y bocas grandes y en bloque, porque el line-art no se lee a baja resolución. Celdas de 51 px con divisor negro de 1 px, 5 columnas: offset X = índice·51/256 + fila·1/256, y offset Y = fila·alto/256. Usa nodos Value→Round→Clamp→Multiply/Add→UV. Hay materiales separados para ojos y boca.
7. **Rig** [11:26]: usó Rigify y concluye que es "demasiado avanzado" para el estilo; recomienda un rig propio simple. Los pesos son rígidos, una pieza por hueso.
8. **Poses finales** [12:14-13:20], que en realidad son 3 loops animados: idle de pie con los puños, mano en la cadera con el otro puño adelante (turntable) y carrera dando puñetazos con los ojos entrecerrados.

## Diseño (medido en 12:39)
- Mide unas 4,5 cabezas. La cabeza ocupa el 22 % de la altura y la falda termina al 58 %. Las botas ocupan el 25 %.
- **Pelo:** bob rubio #F7B865 con la parte de abajo más oscura (#E5885E). El flequillo cae en diagonal: bajo a su derecha y alto a su izquierda. Del lado derecho el mechón va detrás de la oreja; del izquierdo baja largo hasta la mandíbula.
- **Cara:** ojos grandes con esclera gris, iris verde oscuro, pupila marrón, brillo blanco cuadrado y pestaña gruesa marrón oscuro. Las cejas son finas. La boca es chica. La piel de arriba y de los lados es más oscura (#F2B282) y la de abajo es clara (#FCD0A0).
- **Ropa:** pañuelo naranja al cuello (#D36927) y bufanda/chal marrón (#533922) con rayas finas amarillo-oliva y una punta colgando adelante. Top naranja sin mangas con una banda inferior más oscura (#AA3F0B) y un cinturón a rayas verde/amarillo. La falda es verde plisada (#3C5418, pliegues #293616). Las botas son ciruela (#51323E), anchas y caídas, con la puntera rosada (#8D4C58) y un botón redondo. En las rodillas tiene **corazoncitos rosas**.

## Herramientas
- Gratis: Blender 5, LoopTools, TexTools, Mio3 UV, Pribambase y RetopoFlow 3.
- **Aseprite es pago** y no se compró. Sin Aseprite, Pribambase no sirve.
- Las extensiones gratis no se instalaron: Blender tiene "Allow Online Access" apagado y nuestro pipeline es 100 % por script, así que no las necesita.

## Nuestra versión: pieces/upnext-girl/
1. `paint_face.py` (python + PIL) genera `tex/face_eyes.png` y `tex/face_mouth.png`, cada uno con 16 celdas de 64 px y los mismos nombres y orden que zero_fem.
2. `build.py` (Blender) arma la malla con lofts de anillos de 4, 6 u 8 lados (522 tris). Cada isla UV corresponde a una parte y una dirección (frente claro, espalda/lado oscuro), y `tex/body.png` (256x256) se pinta según la posición en el mundo. La cara usa una proyección frontal plana a la celda 0: las caras de la cabeza por encima de z 2.10 llevan `face_eyes` y las de abajo `face_mouth`. El rig es el armature de Zero-fem (23 huesos, mismos nombres, direcciones y roll) con todas sus acciones. Solo se trasladó la cadena del brazo (-0.29, 0, +0.22) a sus hombros. Los pesos son rígidos y las articulaciones van 50/50.
3. `poses.py` contiene `turn_pose`, `tut_idle`, `tut_hip` y `tut_run` (loop de 16 frames).
4. `export.py` genera `out/girl_anim.glb` (68 animaciones a 30 fps), `out/face_tracks.json` y `out/actions.json`.
5. `review_renders.py` + `tools/sheet.py` generan `review/sheet_v1.png`. `tools/render_engine.mjs` prueba las acciones en el visor three.js.

## Segunda pasada (copia literal)
- **Cara:** `pieces/upnext-girl/tools/extract_face_cells.py` reconstruye sus celdas de `Ashley_Face` pixel por pixel desde los fotogramas ampliados (10:40-11:08). Detecta los divisores negros y muestrea cada texel con la mediana de 3x3. Salieron de forma directa las celdas 00-08 y 10. La 11 se ve solo a la mitad y la otra mitad se completó con su ojo abierto. La 09 nunca se ve, porque la tapa la mascota del streamer, y se rehízo como párpado a media altura con sus mismos píxeles.
- `pieces/upnext-girl/face_atlas.py` arma `tex/ashley_face_256.png` con su layout. Para el motor arma los atlas `face_eyes`/`face_mouth` de 16 celdas de 51x55 (816x55, offset.x = celda/16, el mismo formato de `face_tracks.json`). Las 16 expresiones del motor apuntan a sus celdas; las que él no tiene se pintan con su paleta.
- **Cabeza:** el quad frontal mide exactamente su celda (x ±0.826, z 1.32-3.10, 0.0324 por texel), sin distorsión.
- **Pelo:** bob redondeado con flequillo, lados recogidos detrás de las orejas (la mejilla se ve de costado), oreja pintada en el lateral y franja baja salmón #e3895e.
- **Luz:** frente y arriba claros; espaldas oscuras con los tonos medidos en 12:16-12:17.
- **Botas:** caídas, angostas en la rodilla y abolsadas en el tobillo.
