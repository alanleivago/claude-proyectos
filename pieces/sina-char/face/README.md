# Cara de sina: sprites (32x32 RGBA)

Sprites dibujados por código (`python gen_face.py`) con el mismo layout UV que NETO512, así que se cambian sin tocar las mallas. Fondo transparente, pixel duro: usar interpolación **Closest** / `NearestFilter`.
`preview.png` muestra 6 combos (columnas). Las filas son: frente con pelo y casco, escala de video (cabeza de ~105 px), 3/4, y sin pelo ni casco para que se vean las cejas.

## Qué archivo va en qué material

| Malla NETO | Material | Imagen original (en el blend) | Sprites nuevos |
|---|---|---|---|
| `eyes` (Mirror X) | `eye` | `eye0.png` (`//eyes\eye0.png`); NETO trae también eye1/eye2 | `eyes/eye_open.png`, `eye_happy.png`, `eye_closed.png`, `eye_wide.png`, `eye_angry.png` |
| `pupils` (Mirror X) | `pupil` | `pupil0.png` (`//pupils\pupil0.png`) | `pupils/pupil.png`, `pupil_small.png`, `pupil_angry.png`, `pupil_none.png` |
| `eyebrows` (Mirror X) | `eyebrows` | `eyebrows0` (`//eyebrows\eyebrows0.png`) | `brows/brow.png`, `brow_angry.png`, `brow_worried.png` |
| `mouth` (sin mirror) | `mouth` | `mouth0.png` (`//mouths\mouth0.png`); NETO trae mouth0..4 | `mouths/mouth_neutral.png`, `mouth_smile.png`, `mouth_open.png`, `mouth_o.png`, `mouth_shout.png` |

Equivalencias aproximadas con NETO: eye0 = `eye_open`, eye2 = `eye_closed`, mouth0 = `mouth_neutral`.
Orientación: en ojo, pupila y ceja, x=0 es el lado de la nariz y x=31 el lado de afuera. Se dibuja el ojo izquierdo del personaje (+X) y el Mirror hace el otro.

## Expresiones

| Expresión | eyes | pupils | brows | mouth |
|---|---|---|---|---|
| neutral | eye_open | pupil | brow | mouth_neutral |
| feliz | eye_happy | pupil_none | brow | mouth_smile |
| hablando (A) | eye_open | pupil | brow | mouth_open (alternar con mouth_neutral / mouth_o) |
| sorprendida | eye_wide | pupil_small | brow_worried | mouth_o |
| enojada | eye_angry | pupil_angry | brow_angry | mouth_shout |
| parpadeo | eye_closed | pupil_none | (la del momento) | (la del momento) |
| preocupada | eye_open | pupil | brow_worried | mouth_neutral |

## Lo que hay que saber

1. **La cabeza atraviesa la pupila.** En pose REST la malla `upper-body` sale por delante del quad de la pupila hasta 4.8 mm, y por delante del quad del ojo hasta 1 mm. Eso abre un "agujero" en el centro del iris. NETO lo tapaba pintando esa zona en su textura. Para arreglarlo, mover las mallas hacia la cámara en el build, en el mismo espacio del rig donde `build_sina.py` ya edita vértices:
   `for v in eyes.data.vertices: v.co.y -= 0.0015` y `for v in pupils.data.vertices: v.co.y -= 0.0055`.
   El preview se hizo con ese ajuste.
2. **La pupila va delante del ojo.** Por eso, cuando el ojo se cierra (`eye_happy`, `eye_closed`) hay que poner `pupil_none` (transparente), y `eye_angry` necesita `pupil_angry`, que es el iris cortado por la misma línea del párpado.
3. **Las cejas quedan tapadas** por el flequillo y el ala del casco cuando se ve de frente. Por eso la expresión vive en ojos y boca (`eye_angry`, `eye_wide`). Para que se vean igual en three.js, dibujar la malla `eyebrows` encima del pelo (`material.depthTest = false` y un `renderOrder` alto).
4. El flequillo en REST tapa la mitad de arriba del ojo de frente, igual que con los sprites de NETO. Los ojos cerrados y felices están dibujados más abajo para que se lean.
5. Colores: pestaña #221418, esclerótica blanca con sombra #CED6EC bajo la pestaña, iris café (#68341C → #A05628 → #D68A42) con brillo blanco, cejas #4E2A1E, boca #602226 / interior #962834 / lengua #E87076.
6. Además de lo pedido hay tres sprites extra: `eye_angry`, `pupil_angry` y `pupil_none`.
