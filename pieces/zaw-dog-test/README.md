# zaw-dog: low-poly PS1 dog (approved 2026-11-05)

754 tris, Blender 5.2, EEVEE, lpskit look (Closest textures, flat light, ps1_snap 240, ps1_post dither).

## Files
- `zaw_dog.blend`: the approved dog alone (mesh `Dog` + armature `DogRig` + muted `walk` NLA track + 5 face images packed).
- `dog.py`: builds the mesh, textures, rig and poses (import it from a piece's build script).
- `prep.py` (venv): reference photos -> `tex/` (body, faces 192 px, painted head_side + bib, sky).
- `build.py -- check|head|expr|turn|walk|blend`: renders and self-checks; `post.py turn|walk|expr`: ps1_post + mp4/sheet.
- `ref/faces2/*.jpg`, `ref/side_real.jpg`: Flow references (real dog faces, same markings).

## Use in a new short
```python
import sys; sys.path[:0] = ["pieces/zaw-dog-test", "pieces/lps-onoda"]
import lpskit as K, dog as D
o, arm, face = D.build()                 # or append DogRig + Dog from zaw_dog.blend
mover = bpy.data.objects.new("mover", None); K.link(mover); arm.parent = mover   # move/turn the dog with `mover`
D.blob_shadow(mover)                      # contact shadow
cam = K.camera("Cam", 35); K.ps1_snap(cam, grid_h=240)   # call ps1_snap AFTER all meshes exist
```
- **Expressions**: `D.set_face(face, "sad")` swaps the face texture; `D.expr_pose(arm, "sad", t)` sets the matching
  body language (ears, neck/head, tail, jaw). Blend between two: `D.expr_pose(arm, new, t, prev=old, a=0..1)`.
  Faces: neutral, happy (tongue out, ears back, fast wag), sad (head low, ears back, tail tucked, tears),
  judging (side-eye, airplane ears, head turned), shocked (wide eyes, ears forward, head back, jaw open).
  Tune in `D.EXPR_POSE`. Keep faces pure dog: emotion comes from eyes + ears/head/tail, never human brows/mouths.
- **Walk**: `D.make_walk_action(arm, repeats, start)` keys one 24-frame cycle and loops it in an NLA strip; move
  `mover` by `D.WALK_SPEED` m per frame along -Y (the dog faces -Y) so planted paws do not slide.
- **Posing by hand**: `D.rest(arm)`, `D.rot(arm, bone, world_axis, angle)`, `D.rot2(...)`, `D.move(arm, bone, offset)`.
  Bones: root, hips, chest, neck, head, jaw, ear.L/R, tail1-3, legs with IK controls `ik_f.L/R`, `ik_h.L/R`
  (move these to place paws; paws stay flat) and poles `pole_f/h.L/R`.
- **Final frames**: always run `photoprop.ps1_post` (see `post.py`) on every frame; captions are yellow with a black stroke.

## New expression
Generate it in Flow (MCP, one image) from `ref/faces2/neutral.jpg` uploaded as a reference: same framing, markings and
ears, real dog anatomy only. Save it as `ref/faces2/<name>.jpg`, run `prep.py`, add `<name>` to `D.EXPRS` and `D.EXPR_POSE`.

## Self-check before showing
`build.py -- head` and `-- check` (front/side/3/4/back close-ups, walk frames); paws on z=0, no streaks or blotches.
