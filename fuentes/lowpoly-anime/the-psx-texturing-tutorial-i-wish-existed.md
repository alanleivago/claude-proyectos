# the psx texturing tutorial I wish existed — evanciao (18:36)

https://www.youtube.com/watch?v=2lSXIVftq4g · Blender 5.1.0 + Krita · seen in full (transcript + frames every 6–15 s), not via Gemini.
Asset: **NETO512** https://evanciao.itch.io/neto512 (free, via Gumroad). 540 tris, 256×256 texture + 4 face textures of 32×32 (eyelashes, eyebrows, pupils, mouth), full rig, Ucupaint sources and the Krita project. License: personal and commercial use **with credit**; no redistribution or resale; a substantially different work belongs to whoever made it.

## Idea
- Two versions of the same model: 1,006 tris and 512 tris. The low one keeps the **silhouette** and exaggerates only what matters; "what the geometry can't carry, the texture does".

## UV unwrapping (2:14–11:27)
- Place seams **gradually**, splitting the model mentally into regions: arms / torso front / torso back / neck / head.
- Keep the **jaw continuous with the face** (no seam) so soft shadows can be painted; some stretching is accepted.
- `U → Unwrap (Angle Based)` + turn on **Display Stretch** (green = more stretching).
- Even texel density; **more space for the face**, little for hidden parts (shoe soles at 5×5 px is fine).
- **Straighten UV edges**: select edges and scale them to 0 on one axis so they follow the pixel grid (no half-cut pixels). Hair is the exception: leave it as triangles.
- Stretching UVs on purpose to fake fabric hanging down (chest/shirt).
- Check with a lettered grid texture (A1, A2, B1, B2) for orientation and scale.
- Hair split into "front" and "general".

## Texturing (11:37–17:35, mostly silent, seen in frames)
- 256 px image, painted **inside Blender** (Texture Paint) with the **"Paint Pixel Art"** brush (hard pixels) and others with modified falloff; Krita on the side for reference.
- 1st pass **values only**: fill regions with greys picked from a B/W version of the reference (Krita filter). Contrast first, colour later.
- Shadows from occlusion, **without overdoing them**; stick to the reference (search Pinterest for the same art style).
- **Ucupaint** (essential add-on) for layers: `base` (values) → `flowers`/details on a second layer → `color` layer in **Color** blend mode on top (colours the greys) → `highlights` and `multiply` (shadows). "Splitting the work this way makes re-texturing a breeze."
- Brush blend **Darken** for shadows; hard lines were then softened ("clearing the hard lines").
- Face: eyes/pupils/eyebrows/mouth on separate small textures (32×32) → that's what lets a face rig swap expressions.
- 17:35: he mentions rigging + a simple face rig and that he'll publish it on itch (that's NETO512).

## What it means for us (sinaboto style)
- The sinaboto girl = NETO512 (or this workflow) with changes: hard hat, hi-vis vest, khaki pants.
- To change the outfit you only touch the `color` layer (and details) in Ucupaint; the mesh and rig stay the same.
- Expressions = swap the 32×32 face textures.
