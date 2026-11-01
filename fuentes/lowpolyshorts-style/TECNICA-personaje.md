---
type: plan
status: active
tags: [ps1, low-poly, personaje, blender, bpy, lowpolyshorts]
relatedTo: [yourself-as-a-ps1-style-character-blender-beginner-tutorial, i-made-a-ps1-style-character-in-blender-low-poly-retro-look, especificacion-tecnica-del-estilo]
---
# Personaje PS1 propio desde cero: cómo lo hago en código (bpy)

Síntesis de los dos tutoriales: T1, cabeza a partir de fotos; T2, cuerpo de piezas rígidas.

## Modelado
1. **Referencias:** frente + perfil, con la escala igualada usando la nariz como guía y el centro de la cabeza en la oreja. Ante un conflicto entre vistas manda el frente (T1).
2. **Cabeza (T1):** Round Cube (radius 1, arc 2) → media cabeza + Mirror con clipping. Se ajustan vértices al contorno frente/perfil (frente adelante, mandíbula, "línea de ojos", el volumen del pelo dentro de la cabeza) y se extruye el cuello 2 veces. ~68 caras. La nariz es una cuña aparte que se une con Ctrl+J. En código: vértices fijados contra los contornos medidos de las dos fotos.
3. **Cuerpo (T2):** piezas rígidas separadas, una por parte, cada una con su Mirror y en pose de reposo natural, no en T. Torso y cadera; brazo, antebrazo y mano (mitón con el pulgar extruido); muslo, pantorrilla y pie. Pocos loop cuts. Uniones redondeadas para que no se abran huecos al doblar. Se borran las caras ocultas. La ropa y el pelo salen por extrusión de caras.

## UV y textura
4. **UV:** cara con Cube/Project from view (píxeles parejos), revisada con una grilla en Closest. En los quads que forman "pozos" se corta la diagonal. El Mirror se aplica para tener la cara asimétrica (T1). Islas rectas con Follow Active Quads y Pack Islands. La cara ocupa ~1/3 del atlas (T1, T2).
5. **Pintura:** color base y la foto frontal proyectada como stencil (Texture Paint), luego perfil, espalda y arriba. Las costuras se arreglan con Soften/Smear. En código: proyección de cámara de cada foto → bake a la UV y mezcla por normal.
6. **Resolución:** se trabaja en 1K y se baja al final (cara ≤128 px, personaje completo 256×256). Interpolación **Closest**. Las sombras van pintadas o salen de AO bakeado vía ColorRamp → Mix (T2).

## Look
7. **Material:** Emission o Principled casi plano (plano en LowPolyShorts). Opcional: ruido, dither o mosaico en la textura.
8. **Render (T2):** EEVEE, film filter bajo y compositor con Scale ↓ → Pixelate → Scale ↑. Para LowPolyShorts: luz casi plana, sin sombras ni AO ni DOF (ver la spec).
9. **Rig:** Rigify con los brazos en pose A, o piezas rígidas con parent jerárquico (la cabeza no lleva rig; la expresión se cambia con un swap de textura, como en LowPolyShorts).
