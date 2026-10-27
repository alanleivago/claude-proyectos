---
type: reference
status: active
tags: [blender, low-poly, anime, ps1, crashsune, modelado, torso, short, brazo, mano, cuello, mirror-modifier, bridge-edge-loops, merge-at-center]
relatedTo: [crashsune-low-poly-series]
---

# Crashsune 03 — Cintura (short), torso, brazo, mano y cuello

"Modeling the Upper Body - Blender 3D Character Modeling Tutorial - Part 3" · 20:45 · https://www.youtube.com/watch?v=fxnfX3rIFbY (22-07-2024)
Visto completo: transcript + 6 hojas + frames extra (3:10 panel Mirror, 6:40 loop cut del short, 8:10 short 3D, 11:30 torso, 12:55 torso 3D, 14:40 brazo vs lateral, 15:35 brazo 3D, 16:40 mano antes del merge, 17:40 F3 merge, 18:30 cuerpo 3D, 19:10 panel cilindro cuello, 20:05 final). Blender 4.1.

## Pasos con tiempos

### Cintura / short (0:45–8:08)
1. 0:45 Shift+A → Cube; **Alt+Z** x-ray; Tab; S y G Z hasta cubrir el short en la vista frontal (Numpad 1).
2. 1:20 **Loop Cut en el centro exacto** (X=0) → modo cara (**3**) → Box Select la mitad izquierda (en x-ray para tomar las caras de atrás también) → **Delete → Faces**.
3. 2:47 Modifiers (llave azul) → Add Modifier → **Mirror**. Valores (frame 3:10): Axis **X**, Bisect off, Flip off, Mirror Object vacío, **Clipping off**, **Merge ✔ 0.001 m**. Desde ahora cada cambio en la mitad derecha se copia a la izquierda.
   - Motivo: esa parte es simétrica; mitad de trabajo y simetría perfecta, que **facilita UV y textura** después.
4. 3:26 Aviso: si al mover arrastra vecinos es **Proportional Editing** (tecla **O**) prendido por accidente → apagarlo.
5. 4:29 Vértices (**1**) + G Z / G X para calzar el contorno frontal; **loop cuts extra** donde el contorno quiebra (cadera) y G X; otro corte más y G X.
6. 5:35 Vista lateral (Numpad 3): Box Select + G Y de cada nivel para el perfil (cola/abdomen).
7. 6:08 **Hueco entre las piernas**: Alt+A (deseleccionar), un loop cut **vertical cerca del centro** (separa la entrepierna) y otro **horizontal** a la altura de la entrepierna (para que el borrado afecte solo esa zona). Modo cara, Box Select del rectángulo entrepierna (frente, abajo, atrás) → **Delete Faces**.
8. 7:15 Quedan agujeros (pared interna del muslo y techo de la entrepierna). Modo arista (**2**): clic arista frontal + Shift clic arista trasera opuesta → **Ctrl+E → Bridge Edge Loops**. Repetir para el otro hueco. Short cerrado.
   Resultado: short con forma de "falda-short" + muesca, ~16 vértices por mitad.

### Torso (8:08–12:58) — chaleco con capucha + vientre descubierto
1. Cube, Tab, Numpad 1, S, G Z, Alt+Z.
2. Modo cara: las caras de abajo G Z / **S** (achicar) → la cintura estrecha (vientre).
3. **E** (extrude) hacia arriba → **S** hacia afuera (ancho del dobladillo del chaleco) → G Z hacia abajo → queda un **escalón/alero** donde el chaleco sobresale del vientre.
4. **E** de nuevo hacia arriba (cuerpo del chaleco).
5. Vista lateral: "un desastre, se arregla": caras y vértices con G Y para el perfil (pecho adelante, espalda).
6. Caras de arriba: **E**, clic (confirmar en el lugar), **S** hacia afuera (hombros), G Y por vértice.
7. Otra vez **E** arriba + **S** adentro = el collar/capucha; G Y.
8. Loop cut extra para calzar el perfil lateral; G Y.
9. 10:42 **Loop cut al centro + borrar mitad + Mirror** (igual que el short). Ajustes G X / G Z de vértices.
10. 11:47 Cara superior: **E** hacia arriba (cuello del chaleco). En vista frontal, clic (sin box) **solo en el vértice frontal central** → G Z abajo → **escote en V** de la capucha.
11. 12:20 Borrar la cara superior y la interior (Delete Faces) → el collar queda abierto, como un tubo, y el cuello entra adentro.
- Comentario: no hace falta que calce perfecto con el dibujo, "lo bastante cerca".

### Brazo (12:58–15:45)
1. Cube; edit mode; vista frontal; seleccionar todo, **R** para inclinarlo al ángulo del brazo (A-pose del dibujo), S.
2. Cara inferior: G hasta la muñeca y R para alinearla al puño.
3. **Varios Loop Cuts** a lo largo (≈5: hombro, codo/volado de la manga, inicio del puño, puño) y G de vértices para seguir la silueta frontal de la manga ensanchada (manga abullonada que se angosta en el puño).
4. 13:58 La vista lateral del dibujo "es inútil" para el brazo (está en perspectiva); solo sirve de idea de topología. Ajusta a ojo en 3D.
5. 14:40 Modo cara: caras laterales S Y (más fino); luego A (todo) → **S Y** para hacerlo **más cuadrado** (sección casi cuadrada); G Y para que no se cruce con el torso.

### Mano (15:45–18:47) — mitón en punta
1. Cube; S, G, R para alinear a la mano del dibujo (continúa el ángulo del brazo); Box Select + G de vértices para el contorno.
2. Modo cara: la cara de la punta → **E** (extrude) hacia los dedos.
3. Sacar x-ray (para no seleccionar los de atrás). Modo vértice: los 2 vértices frontales de la punta → **F3 → "Merge" → Mesh › Merge › At Center**. Repetir con los 2 de atrás.
   → La mano termina en una **cuña/punta** (pentágono en la vista frontal, como el dibujo: mitón sin dedos).
4. x-ray, Box Select y ajustar; vista lateral G Y; S Y en el brazo y en la mano (A, S Y) para engrosar ("se veía plano").
   Resultado: ~10 vértices, 9 caras (7 quads + 2 tris).

### Cuello (18:47–20:10)
1. Shift+A → Cylinder; **Vertices = 3**, **Cap Fill Type = Nothing** (frame 19:10).
2. S muy chico; G Z hasta el cuello; vista lateral G Y, S Y.
3. Vértices de abajo: G Z hacia abajo (que entre en el collar del torso).
→ **Prisma triangular** de 3 caras (6 tris). "No necesitás más para este estilo; es lo que hace **Mega Man Legends**." Lo va a disimular más adelante.

Estado al final (20:05): short + torso + brazo + mano (un lado) + cuello + pierna + bota (un lado). Cada pieza es un objeto separado (Cube.00x, Cylinder.00x).

## Topología y por qué
- **Piezas sueltas que se solapan** (cuello dentro del collar, pierna dentro del short, mano pegada al puño): sin soldar, como los juegos PS1/Mega Man Legends. Rápido y cada pieza tiene su silueta limpia.
- **Mirror solo en piezas centradas** (short, torso). Brazo/mano/pierna/bota se hacen de un lado y se espejan después.
- **Todo se edita en Edit Mode** (lo repite): el origen de cada objeto queda en (0,0,0) del mundo → un Mirror X en cualquier pieza espeja respecto al centro del cuerpo, y el rig no hereda transformaciones raras.
- **Extrude + Scale** apilados = la forma "por pisos" del torso (vientre → alero del chaleco → pecho → hombros → collar). Cada piso es un cambio de silueta del dibujo.
- **Sección casi cuadrada** en brazos (no cilindros): lectura anime/angular, aristas duras que la textura pinta como pliegues.
- **Merge at Center** para terminar en punta: menos vértices y silueta afilada (mano, después mechas de pelo).
- **Cuello de 3 lados**: lo mínimo; queda casi oculto.
- El Mirror sin Clipping funcionó porque nunca movió los vértices centrales en X; con script conviene **Clipping ✔**.

## Cómo hacerlo por script (bmesh) — probado en Blender 5.2 en background
Todo es scripteable; lo único "a mano" es decidir los números mirando la referencia (medir con PIL o `mcp look`).

```python
import bpy, bmesh
def loft_pts(rings, cap_bot=False, cap_top=False):
    """rings: lista de anillos, cada uno lista de puntos (x,y,z), mismo largo, en orden antihorario visto desde arriba."""
    bm = bmesh.new(); L = [[bm.verts.new(p) for p in r] for r in rings]; n = len(rings[0])
    for a, b in zip(L, L[1:]):
        for i in range(n): bm.faces.new((a[i], a[(i+1) % n], b[(i+1) % n], b[i]))
    if cap_bot: bm.faces.new(L[0][::-1])
    if cap_top: bm.faces.new(L[-1])
    return bm, L
def finish(name, bm):
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(ob); return ob
def box6(z, w, yf, yb):  # anillo de cubo con el loop cut central: frente-centro, frente-der, atrás-der, atrás-centro, atrás-izq, frente-izq
    return [(0, yf, z), (w, yf, z), (w, yb, z), (0, yb, z), (-w, yb, z), (-w, yf, z)]

# TORSO por pisos (= extrude+scale del video); -Y es el frente
bm, L = loft_pts([box6(0.95, .07, -.06, .05), box6(1.00, .075, -.065, .055),   # vientre
                  box6(1.00, .12, -.09, .07),                                    # alero/dobladillo del chaleco
                  box6(1.22, .13, -.10, .08),                                    # pecho
                  box6(1.30, .10, -.08, .06),                                    # hombros
                  box6(1.36, .06, -.05, .04)])                                   # collar
L[-1][0].co.z -= 0.05            # escote en V: baja el vértice frontal central del collar
finish("Torso", bm)              # 36 v / 30 quads, abierto arriba y abajo
```
- **Mitad + Mirror** (short): `create_cube` → `bisect_plane` en X=0 → `bmesh.ops.delete(verts con x<0)` → `ob.modifiers.new("Mirror",'MIRROR')` con `use_clip=True`, `use_mirror_merge=True`, `merge_threshold=0.001`.
- **Muesca entre piernas + Bridge**: `bisect_plane` en x=x1 y z=z1 → borrar caras cuyo centro tenga x<x1 y z<z1 (`bmesh.ops.delete(context='FACES')`) → tomar las aristas de borde (`e.is_boundary`) frontal y trasera de cada hueco y `bmesh.ops.bridge_loops(bm, edges=[e_frente, e_atras])`. Probado: tras el Mirror da 0 aristas non-manifold.
- **Mano en punta**: loft de 3 anillos de 4 puntos (muñeca, nudillos, punta) con tapa abajo, luego `bmesh.ops.pointmerge(bm, verts=[p0,p1], merge_co=(p0.co+p1.co)/2)` para el par frontal y el trasero (= Merge At Center). Probado: 10 v, 9 caras.
- **Brazo**: loft de anillos de 4 puntos a lo largo del eje local Z (hombro→puño, ~6 anillos), luego rotar el objeto/vértices al ángulo de la A-pose (`bmesh.ops.rotate`, matriz de rotación en Y). Hacer la sección casi cuadrada (ancho ≈ profundidad).
- **Cuello**: `bpy.ops.mesh.primitive_cylinder_add(vertices=3, end_fill_type='NOTHING', radius=r, depth=h)`.
- Equivalencias de herramientas: Extrude = `bmesh.ops.extrude_face_region` + `translate`; Scale = `bmesh.ops.scale(vec=..., space=Matrix.Translation(-centro))`; Proportional editing no hace falta (por script se mueven exactamente los vértices elegidos).
- Verificación: `mcp look` en Numpad 1 / 3 con x-ray contra la referencia; contar tris (`sum(len(p.vertices)-2 for p in me.polygons)`).

## Para nuestro proyecto (NETO512 → chica @sinaboto)
- **Chaleco reflectivo (hi-vis)** = la técnica del torso, pero envolviendo el torso de NETO:
  1. Duplicar por script las caras del pecho/espalda de NETO (selección por grupo de vértices `spine.002/003` o por altura), separar a objeto "Vest".
  2. Inflarlas 1–2 cm a lo largo de la normal (`v.co += v.normal * 0.015`) para que no haya z-fighting.
  3. Borrar las caras de las sisas (hombros/axilas) y del cuello → chaleco sin mangas abierto; **escote en V** bajando el vértice frontal central como el collar de Love-chan.
  4. **Alero en el dobladillo**: un anillo inferior escalado hacia afuera (extrude + scale) → el chaleco "sobresale" del pantalón como el chaleco de Love-chan sobre el vientre. Silueta más legible a 360x640.
  5. Mirror con Clipping si se modela de cero; las bandas reflectivas grises van **pintadas** en la textura 256 (no geometría).
  6. Pesos: Data Transfer de pesos desde el cuerpo de NETO (o pesar al 100 % a los huesos del pecho), porque se deforma con el torso.
- **Casco de obra**: loft de 8 lados con el método "pisos + merge": anillo del ala (ancho, z=0) → anillo interior del ala (z+1 cm, más chico) → copa (dos anillos que se cierran) → **tapa arriba o merge at center** de los vértices superiores (como la punta de la mano) para una copa facetada. Borde/visera delantera: mover hacia adelante los 2-3 vértices frontales del ala. ~30-40 tris. Objeto separado **parentado al hueso de la cabeza** (sin pesos, rígido) — exactamente la lógica de piezas sueltas de este video.
- **Brazos de sección cuadrada / manos en punta**: NETO ya tiene sus manos; si la chica sinaboto lleva **guantes de trabajo**, la mano-mitón en punta de Love-chan es una buena base low poly (un dedo pulgar = un extrude lateral).
- **Cuello de 3 lados escondido en el collar**: si al ponerle chaleco con collar alto el cuello de NETO se ve, se puede reducir a prisma de 3 caras y que quede dentro.
- **Mirror + origen en (0,0,0) + editar en Edit Mode**: regla para todas nuestras piezas nuevas (casco, chaleco, botas): origen en el mundo, transformaciones aplicadas, para que el export GLB y el parent a Rigify no hereden escalas raras.
