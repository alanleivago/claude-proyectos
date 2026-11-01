---
type: log
status: active
tags: [zach3d, blender, look-check]
relatedTo: [styles/zach3d, fuentes/zach3dfilms-style/especificacion-tecnica-del-estilo.md]
---
# zach-glass — LOG

Recreación de la ref 3 de Zack D. Films ("Making A Glass Cup From A Bottle") en el estilo nuevo zach3d, renderizado con Blender 5.2 Cycles (Metal, M5). Es solo una prueba con el audio de la ref: no se publica.

## 2026-10-29
- Refs: 7 shorts informativos en `Ref zach3dfilms/originales/` (git-ignorado). Medidas en `_analisis/`; spec unificada en `fuentes/zach3dfilms-style/especificacion-tecnica-del-estilo.md` (créditos de API, `styles/zach3d/tools/spec_refs.py`).
- El usuario aprobó la historia (12 beats, audio de la ref). Pidió manos hechas en código, Blender "como en el tutorial" y el audio de la ref (solo para la prueba).
- Kit `styles/zach3d/kit/zk.py`: reset (Khronos PBR Neutral, porque AgX lavaba los colores), backdrop degradé pegado a la cámara, highlight (cáscara fresnel aditiva), `cord`, `crown_cap`, `lathe` con UV, wood y galvanized, `Hand` (esqueleto → GN Points to Volume → Volume to Mesh, poses = shape keys).
- Bugs que se corrigieron: `matrix_world` viejo al copiar (el glow caía en otro set); la cantidad de muestras por pose tiene que ser fija (si no, un vértice queda flotando); las metaballs no sirven para manos.
- Look check v1 (`look/look.png`, ref arriba / nuestro abajo): beats 2, 7 y 9.
  Pendiente: madera (anaranjada, sin veta visible); fondo de balde rayado en el 7; manos todavía rechonchas; subtítulos y bloom en post (falta `post.py`).
- Marca diegética: **funnyfilms** (etiqueta y objetos con marca).
- Look check v1: el usuario aprobó solo la columna 3 (mitades + mano). Respondió "no entiendo los beats": de ahora en más mostrar "columna N = momento X (segundo Y)" y decir que la fila de arriba es el original.
- v2: madera con veta real (fase en radianes ×14) y key del beat 2 al 55 % (la sobreexposición la volvía salmón). Balde del beat 7 agrandado: la cámara había quedado afuera. Imagen en `look/look2.png`.
- 2026-10-29: look v2 aprobado (columnas 1, 2 y 3). Siguiente: storyboard de los 12 momentos; terminar la columna 2 (balde rayado, banda negra, diagonal) mientras se dibuja.
- Storyboard de 12 momentos (`board/board.png`, `board/compare.png` = ref | nuestro; compare lleva fotogramas de la ref: no commitear). Sets nuevos en X=10,14,…,42: 1 nudo + manos + líneas de tensión, 3 lata "funnyfilms LIGHTER FLUID" en contrapicado, 4 anillo de fuego + encendedor rojo + mano en el cuello, 5 botella horizontal + flechas azules + manos, 6 balde con hielo + botella azul + vapor, 8 grieta en la banda negra, 10 lija + borde azul + polvo, 11 vaso con soda + sorbete, 12 sorbete doblado (sin cara). Render 48 spp al 50 %: 2–6 s por cuadro (M5).
- Bugs: `cam_move` no aplicaba el roll (el Track To lo pisaba) → la cámara ahora cuelga de un rig. `rbox` hornea la ubicación en la malla: si se rota hay que darle la ubicación después. El boolean sobre el hilo quemado del beat 7 dejaba un plano gigante en y=0 que tapaba todo el fondo → se recorta a mano. El vaso con solidify se veía como un bloque macizo → `CUP`, una sola cáscara cerrada.
- Beat 7 terminado: cámara del otro lado (banda negra a la derecha de la tira), tira diagonal por el roll, balde rayado (`galvMacro`), f/32.
- Débil: manos (sobre todo dedos del 1), llamas del 4–5 con forma de corona, grieta del 8 gruesa, chorro del 11 rosado, el 12 no cuenta el sorbo.
- Storyboard v1: aprobados 2, 3, 6, 7, 8, 9 y 10. Rehacer las manos (1, 4, 5, 11, 12): realistas, que envuelvan el vaso, con nudillos. Rehacer el fuego (4, 5): línea fina brillante + glow, como la ref.
- Board v2: el usuario aprobó 2, 3, 6, 7, 8, 9 y 10 (no se tocaron sus PNG). Se rehicieron 1, 4, 5, 11 y 12.
  - Kit `zk.Hand`: dedos más largos y finos (1.7 cm en la base, con taper), bultos en los nudillos (MCP, PIP, DIP), yemas, uña en el dorso de la falange distal y orientada con el dedo (antes quedaba siempre hacia +Z), manicura francesa, eminencias tenar e hipotenar, muñeca elíptica y antebrazo que se ensancha en 20 cm. Sombreado de cavidad por pointiness. Voxel 0.55 mm y blur 7 con +7 % de radio para compensar. `curl` acepta grados por articulación; nuevos `thumb_dir` y `thumb_bend`. `zk.wrap_matrix`: mano que abraza un cilindro (palma contra el costado, dedos alrededor y el pulgar del otro lado).
  - Poses en build.py: `pinch2` (pulgar e índice, con la puntería del pulgar resuelta offline), `wrap` (vaso), `neckwrap` (puño en el cuello) y `roll` (palma arriba de la botella acostada; holgura medida: ≥1.5 mm del vidrio y ≥8 mm de la mesa). Self-checks aislados de cada pose antes de usarla.
  - Fuego: línea blanca muy fina y brillante sobre el hilo, 90 lenguas finas en lágrima (blanco → naranja, curvadas con ruido determinista) y dos halos aditivos en lugar del bloom. Bug: Layer Weight "Facing" vale 0 mirando a cámara; había que invertirlo.
  - Al volver a renderizar 6 y 9 cambiarán sus manos, porque usan el kit nuevo. Sus PNG aprobados se conservaron tal cual.
- Board v3, otra pasada a las manos (paneles 1, 4, 5, 11 y 12; el resto sin tocar).
  - Piel (`_skin_detail`): poros (Voronoi a ~0.7 mm), ruido de micro-arrugas, líneas de arruga sobre los nudillos dorsales (ondas cruzadas, enmascaradas por convexidad y dorso), manchas de tono, nudillos y yemas más rojos, palma más amarilla, pliegues más oscuros y mates. SSS 0.4 con radio rojo largo, specular 0.28 y sheen 0.25. Base más cálida `#D99B7D`. El SSS grande borraba el bump: se bajó la escala a 3.5 mm.
  - Uñas: color de piel rosado, poco contraste, cutícula más oscura en la raíz, coat bajo, sin punta francesa. Nuevo `Hand.snap_nails()`: asienta cada uña sobre la piel evaluada (el blur metía las yemas varios mm hacia adentro y dejaba las uñas flotando). Blur 4 y yemas más llenas. `hand_check.py` también la usa.
  - Panel 5: `roll` (ajustado numéricamente: dedos curvados alrededor del cuerpo, pulgar por detrás, ≥5 mm del vidrio, 23 mm sobre la mesa). La mano izquierda pasa a `neckdrape`: un puño entero no cabe entre el cuello y la mesa; ahora queda a 2.9 mm del vidrio y sobre la mesa.
  - Panel 12: pajita transparente con rayas rojas (casi opacas) y una columna de soda adentro hasta el borde del cuadro; soda un poco más baja que en el 11.
