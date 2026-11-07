---
type: doc
status: active
tags: [zaw-dog, lowpoly-dog, ps1, blender, rig, texture-atlas, photo-projection]
relatedTo: [pieces/zaw-dog-v2/STUDY.md, pieces/zaw-dog-test/README.md, pieces/zaw-dog-01/build.py]
---
# zaw-dog v2: realistic low-poly PS1 mixed-breed dog (2026-11-06)

**At a glance:**
- 1186 triangles.
- One object, one material, one 256 px atlas (8-bit palette, Closest filtering).
- Blender 5.2 with EEVEE, in the lpskit look (flat 50% emission light, `ps1_snap`, `ps1_post` dither).
- **Look:** a real dog, built from the old dog's real photos (`pieces/zaw-dog-test/ref/side_real.jpg` and `ref/faces2/*.jpg`).
- **Texture:** a single colour-matched atlas, with no patches and no stickers.
- **Rig:** same bone names and helper API as v1, plus the v2 rig and motion (planted walk, dynamic happy wag).

**Superseded:** the first v2 was a cute "anime" puppy, which the user rejected. Its renders and code are kept in `review/anime/`.

## How the texture stays coherent
`bake.py` colour-matches every photo to one target brown and one target white (taken from `faces2/neutral`). It then projects the photos onto the rest-pose mesh:
- **Side photo along X:** covers the body, head sides, legs and tail. Surfaces that do not face sideways sample just inside the silhouette, low-pass, with the photo coat's own fur detail added back.
- **Front face photo:** covers the head front, muzzle, nose and ears, cross-faded into the side projection by surface direction.
- **Eyes:** the eye is painted out of the side photo, so the front photo (the expression) owns the eye even in profile.

Colour depends only on the 3D point, so UV seams cannot show. The five atlases differ only in the face texels and share one palette. `review/colour_report.txt` lists the mean brown per region; the coat regions are within about 10% of each other, and the ears are a little darker, as in the photos.

## Files
| file | what |
|---|---|
| `dog.py` | Blender module: mesh (sections fitted to the photos), UVs from `tex/uv.json`, material, rig, poses, walk, expressions, `happy_wag`, `blob_shadow` |
| `bake.py` | venv: colour match + projection + blend → `tex/atlas_<expr>.png`, plus `review/colour_report.txt` |
| `build.py -- <mode>` | Blender, headless: `export`, `check`, `head`, `expr`, `wag`, `poses`, `turn`, `walk`, `blend` |
| `post.py <mode>` | venv: `ps1_post` + `renders/turntable.mp4`, `walk.mp4`, `expressions.png`, `closeups.png`, `compare.jpg` (`all`) |
| `renders/zaw_dog_v2.blend` | the dog alone: `Dog` + `DogRig`, a muted `walk` NLA track, the five atlases packed |
| `ref/zaw/` | Zaw cat frames; `review/anime/` holds the rejected cute version, for comparison |

## Use in a new short
```python
import sys; sys.path[:0] = ["pieces/zaw-dog-v2", "pieces/lps-onoda"]
import lpskit as K, dog as D
o, arm, face = D.build()                  # or append DogRig + Dog from renders/zaw_dog_v2.blend
mover = bpy.data.objects.new("mover", None); K.link(mover); arm.parent = mover   # move/turn the dog with `mover`
D.blob_shadow(mover)
cam = K.camera("Cam", 35); K.ps1_snap(cam, grid_h=240)   # call ps1_snap AFTER all meshes exist
```
- **Size and orientation:** the dog faces -Y with its paws on z=0. The head top is at 0.84 m and the nose at y = -0.50. It is longer than v1 (rump at +0.48, tail curl to +0.51), so frame side shots a little wider.
- **Expressions:**
  - Swap the face with `D.set_face(face, e)`, where e is `neutral`, `happy`, `sad`, `judging` or `shocked`. These are the real `faces2` photos.
  - Pose the body to match with `D.expr_pose(arm, e, t[, prev, a])`: ears, neck and head, tail, jaw and tongue.
  - **happy:** jaw a little open, the tongue slides out and pants, and the dynamic wag with hip wiggle is built in.
  - **sad:** a new Flow photo of the same dog (`ref/sad/sad_v2.jpg`, replacing `faces2/sad`) with real sad-dog cues: raised inner brows, eyes looking up, closed lips and small tears. The pose matches it: head lowered but looking up, ears back and flat, tail hanging low and tucked, body crouched 3.5 cm (`crouch`, added on top of the walk or hand poses).
  - **judging:** airplane ears, head turned.
  - **shocked:** ears forward, jaw open.
- **Happy wag on its own:** `D.happy_wag(arm, t, amp=1.0, hz=4.4, up=0.25)` is fast and wide, with overlap down tail1–3 and the hips wiggling. For one swing, use `D.rotl(arm, "tail1", [((0, 0, 1), angle)])`.
- **Walk:**
  - `D.make_walk_action(arm, repeats, start)` keys a 26-frame cycle and loops it in an NLA strip.
  - Move `mover` by `D.WALK_SPEED` m per frame along -Y.
  - Paws stay fully planted: 0 mm slide and no lift through every stance phase (checked frame by frame).
- **Posing by hand:**
  - Helpers: `D.rest`, `D.rot`, `D.rot2`, `D.rotl` (bone-local) and `D.move`.
  - Bones: root, hips, chest, neck, head, jaw, tongue, ear.L/R, tail1–3, upper_arm/forearm/paw_f, thigh/shin/paw_h.
  - IK controls are `ik_f/ik_h.L/R`, with poles `pole_f/pole_h`.
- **Final frames:** always run `photoprop.ps1_post` on every frame.
- **Ears:** 25% longer and wider than the photo fit, at the user's request. Each has its own two planar UV islands (outer and inner) and takes the side photo's ear along its length, colour-matched. Each ear's root ring and its bone pivot sit inside the skull, so the ear stays attached in every pose and head move. Checked in `build.py -- ears`: 5 expressions x 5 views + walk frames, `review/ears_sheet.jpg`.

## Swap it into `pieces/zaw-dog-01/build.py`
1. **Line 16:** in the `sys.path` list, change `"zaw-dog-test"` to `"zaw-dog-v2"`.
2. **`fix_dog`:** delete the `fix_dog(o)` call in the dog loop, and the function itself. It re-projected v1 photos with v1-only names (`D.uv_side`, `D.uv_face`, `D.hz`, `D.UV_WHITE`, `tex/dog_views.json`). v2 already has one coherent atlas and smooth shading.
3. **Wag:** make the local `happy_wag(arm, t, amp, hz, up)` call `D.happy_wag(arm, t, amp, hz, up=0.25)`. In the two single-wag lines (`"tail1", [((0, 0, 1), ...)]`), use `D.rotl` instead of `D.rot2`, so the raised tail swings instead of twisting.
4. **Cameras:** the dog is about 15% longer than v1, so check wide side shots.

**Unchanged:** `dog()`, `dog_lie`, `dog_head`, the bounce and jump poses and all head, neck, jaw and chest rotations. They were tested on this rig in `review/poses/`.

## Regenerate
```sh
B=/Applications/Blender.app/Contents/MacOS/Blender; PY=.venv/bin/python   # from the repo root, cd pieces/zaw-dog-v2
$B -b -P build.py -- export     # only after changing the section tables in dog.py
$PY bake.py                     # photos / colour match / blend only: no Blender needed
for m in check head expr wag poses turn walk blend; do $B -b -P build.py -- $m; done
$PY post.py all
```

**Knobs:**
- `dog.py`:
  - Section tables in side-photo pixels: `TORSO`, `SKULL`, `MUZZLE`, `NOSE`, `JAW`, `FLEG`, `HLEG`, `TAIL`.
  - Ear path in metres: `EAR`.
  - Photo-to-world mapping: `SIDE_S`, `FACE_K`, `FACE_ROWS`.
- `bake.py`:
  - Target colours: from `faces2/neutral`.
  - Pull-in and blur in `side_colour`.
  - Front/side mix in `front_weight`.
  - Ear tone: `ear_k`.
