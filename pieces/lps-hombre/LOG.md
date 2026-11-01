---
type: log
status: active
tags: [lowpolyshorts, ps1, personaje, blender]
relatedTo: [fuentes/lowpolyshorts-style/TECNICA-personaje.md, fuentes/lowpolyshorts-style/especificacion-tecnica-del-estilo.md]
---
# lps-hombre — protagonista recurrente del estilo LowPolyShorts (hecho desde cero)

- 2026-10-29: el usuario pidió NO usar NETO512 y crear el personaje desde cero, siguiendo dos tutoriales (notas en fuentes/lowpolyshorts-style/, síntesis en TECNICA-personaje.md).
- Cara generada con Flow (Nano Banana Pro), opción 1 elegida: un hombre inventado de ~68 años, pelo gris de costado, bigote gris, campera de corderoy mostaza y camisa blanca. Archivo `ref/hombre_frente_perfil.jpg`: frente a la izquierda, perfil exacto de 90° a la derecha. El nombre que inventó Flow no se usa.
- Siguiente: cabeza de ~68 caras ajustada al contorno frente/perfil, con la foto proyectada a la UV (1K → ≤128 px, Closest); cuerpo de piezas rígidas en pose de reposo, con manos tipo mitón; textura 256×256 para el cuerpo; luz plana; expresiones por swap de foto, que se generan después con Flow a partir de esta misma cara.

## 2026-10-29 — personaje construido en código (build_char.py)

- Scripts: `prep.py` (venv: mide la foto, arma la geometría de la cabeza y pinta las texturas) → `build_char.py` (Blender 5.2, headless, `-- --render`) → `sheets.py` (venv: turnaround/poses/head_views/compare).
- Cabeza: 91 caras (70 de cabeza en 6 anillos de 10 lados ajustados al contorno frente/perfil medido de la foto + corona en abanico + tapa de mandíbula, nariz cuña de 4 caras, cuello octogonal extruido 2 veces = 16). Sección tipo "ataúd". Escala 0.0004 m/px (mentón→coronilla = 0.23 m).
- UV cabeza por normal de cara: frente (foto frontal, también en las caras diagonales: estiramiento lateral estilo LPS), costados (perfil, espejado al lado derecho), nuca y coronilla (pelo tomado del borde del perfil), cuello en piel lisa. Atlas 1024 → `head_128.png` (Closest). La cara ocupa ~69×89 px en el 128.
- Cuerpo: piezas rígidas octogonales en pose de reposo (brazos 9° abiertos, codo 12°): hips 26, torso 58, collar 16, upperarm 42, forearm 34, hand (mitón + pulgar) 40, thigh 42, calf 34, shoe 42 (por lado). Total 659 caras / 1424 tris. 1.72 m.
- Textura cuerpo: atlas 1024 → `body_256.png`; densidad uniforme de 150 texels/m. Zonas: corderoy mostaza (color de la foto, wales de 2 texels y pliegues de ruido), frente del torso proyectado (V de camisa, solapas, 2 botones, bolsillos), pantalón gris, zapato marrón con suela, piel, camisa.
- Jerarquía: hips → torso → head/collar/upperarm → forearm → hand; hips → thigh → calf → shoe. `pose(dict, frame)` + POSES rest/pointing/walk (frames 1–3 del .blend).
- Luz: EEVEE, Mix 50% emission + 50% diffuse, sol 1.5 sin sombra, mundo #B0B0B8, Standard, sin AO/bloom/DOF.
- Auto-chequeo hecho: errores encontrados y corregidos: columnas absolutas vs. media imagen (mentón/nariz/cuello desplazados 27 cm), muslos que atravesaban el ruedo del saco, tapa de hombro con zona "inner", doble ojo en 3/4 (perfil + frente) → caras diagonales pasan a la foto frontal.
- Pendiente / débil: costura dura frente↔perfil en la mejilla (se ve en vista lateral); coronilla de pelo vista desde atrás algo manchada; el saco es más plano que las fotos de cuero de las refs; en la zancada el muslo delantero atraviesa el saco (pieza rígida); mano de mitón al señalar se lee como muñón; sin expresiones (swap de textura) todavía.

## 2026-10-29 (b) — correcciones tras revisión del usuario

1. **Doble cara:** la textura de la cabeza ahora se hornea por texel (rasterizado en UV en `prep.py`): cada punto de la superficie mezcla foto frontal / perfil / pelo de nuca / pelo de coronilla según la normal suavizada (transición difuminada entre polígonos). El perfil sólo aporta detrás del pómulo (columna ≥ ~905–950 px: oreja, sien, pelo), nunca su ojo/nariz/boca; ganancia de color del perfil igualada a la piel del frente. El borde de la silueta frontal (pelo lateral) se apaga antes de estirarse. UVs: front / sideL / sideR (separados) / back / top / skin. Revisado a 0°, 40°, 90°, 180° y en las 3 poses: una sola cabeza.
2. **Zancada:** el saco abierto se partió en solapa superior (rígida con el torso) y faldón inferior por lado (`skirt_L/R`, pivote en la cadera) que siguen al muslo (0.75 × rotación X del muslo, automático en `pose()`). Ya no atraviesa la pierna; atrás se abre como una abertura de saco.
3. **Mano:** palma en bloque + pulgar extruido (una pieza), mitón de 3 dedos (`fingers_*`) e índice separado (`index_*`), ambos con pivote en los nudillos y curvatura de reposo. En `pointing` el índice queda recto y los demás dedos cerrados.
4. **Corderoy:** wales irregulares y tenues (período con jitter, intensidad variable), pliegues alargados, arrugas finas, grano y variación de tono; tileable.
5. **Saco abierto:** núcleo del torso = camisa blanca con tapeta y botones, cinturón marrón con hebilla y cintura del pantalón (proyección frontal); paneles de saco separados con espesor (cara exterior, interior y cantos), solapa con punta, faldones abiertos hacia abajo.
- Conteo: cabeza 91, torso 50, collar 16, solapa 46×2, faldón 46×2, brazo 42×2, antebrazo 34×2, palma 24×2, dedos 14×2, índice 14×2, muslo 42×2, pantorrilla 34×2, zapato 42×2, cadera 26 = 859 caras / 1808 tris.
- Débil todavía: banda pixelada en la sien en 3/4 y un borde rosado en la silueta de la cara de frente (la piel del perfil a ángulo rasante); escalón donde termina la solapa sobre el hombro; el corderoy a 256 px se lee casi liso de lejos; los dedos cerrados al señalar cuelgan como un bloque.
- 2026-10-29: el usuario va a usar un modelo comprado; lo deja en modelo-comprado/ (git-ignorado, por la licencia). El personaje hecho desde cero queda como respaldo.

## 2026-10-29 (c) — análisis del modelo comprado (AkiraModels: Kaneda + moto), sin modificarlo

- Script de solo lectura `analyze_compra.py` (abre el .blend, nunca guarda) + `compra_sheets.py`. Salidas en `out/compra/`: `Kaneda_info.json`, `Bike_info.json`, `Kaneda_rest_turnaround.png`, `Bike_turnaround.png`, `compare_kaneda_vs_lps.png` (los dos a 1.72 m). Luz igual a lps-hombre (50% emission + sol sin sombra, Closest).
- **Kaneda.blend:** 3 mallas + armature. Mirrored 196 caras / 344 tris (Mirror sin aplicar + Armature), Head 74 / 120, NonMirrored 36 / 60 → 306 caras / 524 tris. Un material en uso ("Kaneda", textura → salida, sin luz) con atlas `Kaneda.png` 192×160 RGBA pixel-art pintado a mano, Closest; la cara ocupa ~96×64 px. Hay ~13 materiales sueltos con PNG faltantes (rutas a IndividualTextures) que no usa ninguna cara. Rig propio (no Rigify), 22 huesos: Torso, Chest, Neck, Head, brazos (Upperarm/Forearm/Hand), piernas (Thigh/Calf/Foot) + IK de piernas con pole y FootRoll (Copy Rotation en pies). Acciones: KanedaAction 0–120 (giro/idle, 220 curvas), "Walk" vacía. Escala: 5.42 unidades de alto (pies en z=-3.49) → ×0.3175 para 1.72 m. Proporción adolescente/anime: cabeza grande, torso corto, cuello alto.
- **Bike.blend:** Bike 252 caras / 452 tris (Mirror sin aplicar; incluye parabrisas con material transparente, 8 caras), Bike.001 24/34 y Plane 24/33 → 300 caras / 519 tris. Atlas `BikeTexture.png` 192×128, Closest; ~15 materiales sueltos sin usar. Armature de 1 hueso, acción "Rotate" 0–100. 6.68 × 1.89 × 2.21 unidades → con la misma escala que Kaneda: 2.12 m de largo, 0.70 m de alto.
- Sin licencia en el zip. Diseño de Akira (Otomo/Kodansha) y stickers de marcas reales en la moto: ojo para usarlo tal cual en YouTube.

## 2026-10-29 (d) — Kaneda "punk": solo campera azul cobalto + emblema nuevo

- Archivos nuevos (los comprados no se tocan; md5 de Kaneda.blend/Kaneda.png verificado igual antes/después): `punk/Kaneda_punk.png` (192×160, Closest), `punk/Kaneda_punk.blend` (copia "save as" con el atlas apuntando al PNG nuevo), scripts `punk/dump_uv.py` (lee UV + altura de cada cara), `punk/make_punk.py` (atlas), `punk/build_punk.py` (copia del .blend). Renders en `out/punk/`: turnaround (4 vistas), `Kaneda_punk_backclose.png`, `Kaneda_punk_atlas_x4.png`, `jacket_mask_x4.png`.
- Máscara de campera por caras UV (no por color): caras entre la cintura y el cuello alto + paneles laterales de la campera (bloque JacketSide); se excluyen cara/pelo/oreja y la pretina del pantalón (tiene presillas; es del pantalón). Dentro de esa máscara solo se recolorean píxeles rojos. Rampa de valor rojo→cobalto (#0E2466 sombra, #1F4FC8 base, #5C8CFF luz), sombreado pintado conservado.
- Espalda: disco reconstruido sin la pastilla ni las letras viejas; texto "punkpoly" (arco superior) y "shorts" (arco inferior) en glifos pixel 5×7 minúsculas crema, letras derechas sobre arco suave (las letras rotadas eran ilegibles a 64 px); centro: rayo low-poly #FFD21E con contorno oscuro atravesando un triángulo facetado de 3 caras.
- Pendiente menor: quedan unos pocos texeles rojizos sueltos en las mangas (zonas donde la UV de la manga se superpone con otra pieza; los dejé para no teñir otras islas).

## 2026-10-29 (e) — emblema "punk" pulido

- Letras: fuente propia 3×8 celdas (2 de ascendente, 5 de altura x, 1 de descendente) dibujada a media densidad (1 celda = 2×2 texeles, escalado nearest) → pixelado grueso tipo PS1; k/h/l/t con ascendente alto y s solo en altura x, así todo lee en minúscula. "l" de 1 celda de ancho para que entre.
- Layout: con píxeles al doble, "punkpoly" (29 celdas) no entra en el arco superior (la UV del panel de espalda sólo tiene ~24 celdas útiles arriba; las puntas se cortaban). Quedó tipo parche: ícono arriba, "punkpoly" en la franja más ancha, "shorts" debajo con extremos levantados 1 celda. Ya no es el anillo del original.
- Ícono: rayo zigzag clásico de 3 tramos dibujado celda a celda (#FFD21E, contorno oscuro de 1 celda) atravesando un triángulo de 3 facetas más oscuras, misma escala de píxel que las letras.
- Motas rojas: eran texeles de borde de isla parcialmente cubiertos; se recolorean sólo dentro de bloques que son exclusivamente campera (frente, mangas/costados, cuello, rayas de hombro): 3 texeles. Lo que queda rojo dentro de caras de campera está en el bloque de guantes (son del guante) → sin tocar. md5 de los archivos comprados verificado igual.

## 2026-10-29 (f) — Kaneda punk: anillo restaurado + toda la ropa azul cobalto

- Emblema: vuelve el layout en anillo ("punkpoly" arco superior, "shorts" arco inferior, ícono al centro). Letras a escala de texel (la que entra en el arco), fuente minúscula propia 4×8 (ascendentes de 2 filas, altura x 5, "l" de 2 de ancho), 2 texeles entre letras. Ícono: el mismo rayo zigzag + triángulo facetado en celdas de 2×2, centrado.
- Ropa: todo lo rojo pasa a la rampa cobalto (#0E2466 / #1F4FC8 / #5C8CFF) conservando el sombreado: campera, pantalón (pretina con presillas incluida), rodilleras, guantes, puños, botas. Se excluye el bloque de cara/orejas/pelo y los píxeles de piel; botones metálicos y bandas oscuras de las botas no son rojos y quedan igual. Archivos comprados sin cambios (md5).

## 2026-10-29 (g) — moto "punk": mismo esquema cobalto + stickers propios

- Archivos nuevos (los comprados no se tocan; md5 de Bike.blend/BikeTexture.png verificado igual): `punk/bike/Bike_punk.png` (192×128, Closest), `punk/bike/Bike_punk.blend` (copia "save as", atlas apuntando al PNG nuevo), scripts `punk/make_bike_punk.py` (atlas) y `punk/build_bike_punk.py` (copia del .blend), `punk/bike/bike_faces.json` (UV por cara). Renders: `out/punk_bike/` (turnaround + atlas ×4).
- Pintura: todo lo rojo → la misma rampa cobalto que Kaneda_punk (sombreado conservado). Asiento marrón, parabrisas, cubiertas y tablero sin tocar.
- Stickers: sólo los usa el objeto "Plane" (24 caras, bloque UV u 160–192, v 64–104). Bloque repintado sin marcas reales: placas "PUNK" (amarilla, lado derecho), "SHORTS" (crema) y "POLY" (oscura, amarilla) en el lado izquierdo, ícono rayo-en-triángulo, damero, rayas de peligro, puntos. Orientación de UV verificada por cara (dirección derecha/abajo del texel vs. normal): 276/277, 284 y 292 leen derecho; los rects compartidos por ambos lados (espejados) llevan diseños simétricos, sin texto.

## 2026-10-29 (h) — expresiones de Kaneda_punk (swap de textura, como LPS)

- `punk/make_faces.py` (venv) → `punk/faces/Kaneda_<expr>.png`: un atlas completo 192×160 por expresión (la expresión cambia cambiando el archivo de la imagen "Kaneda_punk.png"; sin rig facial, igual que LPS). Ojos redibujados en pixel art a resolución de atlas (caja ojo izq. x 8–25, y 86–97; el derecho es el espejo x' = 63 − x) y boca centrada en x 31.5 desde y 108.
- 13 expresiones: neutral, blink, talkA, talkO, scream, shocked, bloodshot, tired (ojeras), grimace (un ojo entrecerrado), happy, sad, angry, blank. Las 6 primeras "LPS" salen del protagonista de las refs: deadpan, grito (ref 1), ojos saltones, ojos inyectados (ref 5), ojeras (ref 3), mueca entrecerrada (ref 1).
- Revisión: `punk/render_faces.py` (Blender, primer plano de frente y 3/4 por expresión, no guarda el .blend) + `punk/faces_sheet.py` → `out/punk_faces/faces_sheet.png`. Corrección tras el primer render: wide y bloodshot salían como cajas cuadradas → esquinas redondeadas.
