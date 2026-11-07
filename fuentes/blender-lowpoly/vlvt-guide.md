---
type: reference
status: active
tags: [blender-lowpoly, vlvt, ps1, photo-modelling, characters, props]
relatedTo: [fuentes/blender-lowpoly/reel-ps1-lowpoly-desde-foto.md, pieces/lps-lowpoly-test/photoprop.py, pieces/zaw-dog-01/photohuman.py]
---
# VLVT Blender guide: low-poly PS1 models from photos (read 2026-11-06)

Source: https://vlvt-blender-guide.vercel.app/ (opened with no query params). Companion notes on the reel: `reel-ps1-lowpoly-desde-foto.md`.

## The method in one line
Don't model by hand. Claude writes a Python script, Blender runs it (`blender -b -P script.py`), and you iterate by comparing the render with the photo.

## References
- **Objects:** one clear photo of the whole object, upright and straight-on, on a plain background. No hands, no angle, no collage.
- **Characters:** a sheet with a front view and a back view. The guide asks for a strict T-pose on flat green or magenta, with the arms straight out and not touching the body, so they don't get "painted onto the body".
- **Our variant:** the user asked for an A-pose plus a side view. We generate one Flow sheet per person with front, right profile and back on flat magenta, in an A-pose with the arms about 40° down and clear of the body.
- **Boxes:** the front and side faces of the photo texture the box. The guide gives no method for rooms or sets.

## Mesh
- **Round things:** read the silhouette (width at each height) and loft rings from it. Use 6–12 sides; past 12 sides it looks modern.
- **Characters:** simple blocky shapes for the head, torso, arms and legs, with the arms kept separate.
- **Workflow:** tell Claude the base shape (bottle, can, box, bag, person) and the polygon budget.

## Texture
- Project the photo onto the mesh: the front view on the front, the back view on the back. Key out the background colour so none of it reaches the model.
- **PS1 look:** textures of 64–512 px (the prompt uses 128), a small palette of about 32 colours, nearest filtering, affine warping, and vertex snapping to a low grid. Render at 270 px tall and scale up ×4 with a 4×4 ordered dither.

## Rig and render
- **Characters:** a simple rig plus a seamless idle loop.
- **Turntable:** 200 frames at 30 fps on black, saved as MP4 and a PNG sequence.

## Review loop (director's notes)
1. Render from the photo's angle.
2. Put the render beside the photo.
3. Check the silhouette first, then the texture.
4. Name one exact fix, change only that, and render again from the same angle.

## Common mistakes
- Angled photos, hands in shot, collages.
- Arms touching the torso; busy backgrounds.
- More than 12 sides on round things.
- Vague notes; skipping the side-by-side check.
- Smooth texture filtering.

## How we apply it (zaw-dog-01, revision 3)
**Humans** (`pieces/zaw-dog-01/photohuman.py`):
1. `prep` reads the magenta-keyed silhouettes row by row:
   - from the front view: width per height, the crotch or coat-hem row (where the two legs merge), the armpit row (the first row with an arm run on each side) and the neck (the narrowest row under the head);
   - from the profile: depth and posture per height;
   - for each arm: its axis and its thickness across that axis.
2. **Blocks:** head and torso are lofted with 8 sides, legs with 6, and arms with 6 along their own axis.
3. **Texture:** each face takes the photo of the view it faces (front, back or side); the arm sides use the front view. The keyed rim is eroded 3 px and magenta is despilled.
4. **Atlases:**
   - the body is 256 px tall and the head 128 px, each laid out front | side | back;
   - 48 colours, nearest filtering.
5. **Rig:** hips, chest, neck, head, upperarm, forearm, hand, thigh, shin, foot. The rest pose brings the A-pose arms down, so arms-down poses keep working.

**Props:**
- Round objects (mug, vase, jar, ball, lamp shade) are lofted from their photo with `photoprop.prepare` / `photoprop.loft`.
- Furniture boxes (sofa, tables, radiator, dog bed, basket, books, pillows) get their straight-on photo projected from the front with `photo_group` in `build.py`.
- Flat things are photo cut-out cards: shoes, the dog crate, flasks, the clipboard, the rope bone.
- Walls, roof and siding use Flow photo tiles.

**Check:** `tools/people2_check.py` renders front, side and back from the photo angles, plus the rest, walk, wave and back-3/4 poses, into `review/people2/`.
