---
type: doc
status: active
tags: [zaw-dog, zawpolyshorts, lowpoly-dog, ps1, cute-character, texture-atlas]
relatedTo: [fuentes/blender-lowpoly/vlvt-guide.md, pieces/zaw-dog-test/README.md, pieces/zaw-dog-01/build.py]
---
# zaw-dog v2: what we studied (2026-11-06)

## 1. Zaw's cats (ZawPolyShorts)
Frames from https://www.youtube.com/shorts/I_0fY2sCfaQ and https://www.youtube.com/shorts/jf-TfhS02Vo are in `ref/zaw/` (contact sheets plus four full frames).

**What makes the cat cute without being anime**
- **Proportions:** the head is a little big for the body, a round skull with a short muzzle. The body is compact and the legs are slim, with white socks. Nothing is caricatured; it reads as a real cat that is a bit "babyish".
- **Eyes:** these carry the appeal. They are large, round and set wide on the front of the face, each a third to a half of the face width. Each has a warm amber iris with a darker edge, a big dark pupil and one sharp white catchlight up and to one side, in the same place in both eyes. A thin dark rim surrounds each eye, and almost no white shows.
- **Emotion:** it lives in the eyes and the pose (head tilt, ears, tail up), not in a human mouth. For the sad beat they paint blue tears straight onto the face texture (the "because" frame). So painted tears are on style.
- **Texture:**
  - One continuous fur texture over the whole animal: the same tabby tone on the back, sides, head and legs.
  - The white areas (chin, muzzle, socks) blend in with soft fur edges.
  - No visible seams, no patches with different lighting, no stickers.
  - Real fur detail at low resolution: soft streaks along the hair, a few darker strands, slightly lighter on top.
- **Shading:** smooth (Gouraud) normals, so the low poly count shows only in the silhouette. Lighting is soft and close to flat. The texture carries the darker underside and lighter back.
- **Poly density and silhouette:** low to mid poly (about 1–2k triangles by eye). The silhouette is clean from every angle, with no slabs or flat panels sticking out. Ears and tail have real volume.

## 2. Tutorials (`fuentes/blender-lowpoly-perro/`)
- **CGDive, Rigify #5 dog/quadruped** (new, `blender-4-0-rigify-5-dog-quadruped-rig.md`)
  - Rig setup:
    - Put the head pivot at the neck-head joint.
    - Put the jaw pivot back, closer to the eye, so the mouth opens like an animal's.
    - Ear bones start at the ear base.
    - A straight tail bends more easily than a curled one.
    - Dogs are digitigrade: they walk on their toes, and the "reversed foot" is a raised foot.
  - Weights:
    - Ears take only the ear bone.
    - Remove shoulder influence from the chest.
  - Eyes, teeth and tongue get their own simple groups.
- **Ovi Gomy, puppy walk**
  - Keyframes and loop:
    - Use linear interpolation.
    - Key one cycle, give it a fake user, and Push Down to an NLA strip with Repeat.
  - Avoiding a stiff walk:
    - Offset the shoulders, tail and ears from the legs, or the walk looks like a camel's.
    - Don't over-reach the legs, or the paw lifts.
    - Match the travel speed to the stride, or the paws slide.
- **Low-poly labrador (Blender 2.8):**
  - Build from ring sections along the body, half-model plus mirror.
  - Widen the legs with S X, because they always come out too thin.
  - Give the ears volume and check the model from every angle.
  - Use one painted texture for the whole dog.
- **Rigging a dog (2025)** and **the Rigify built-in addon:** same bone layout (spine, neck, head, jaw, ears, tail chain, IK legs with poles).
- **VLVT guide (`fuentes/blender-lowpoly/vlvt-guide.md`) and `pieces/lps-lowpoly-test/photoprop.py`:**
  - Model by script.
  - Take silhouettes from straight-on photos.
  - Round things get 6–12 sides.
  - Textures of 64–512 px, small palette, nearest filtering.
  - Always render at the photo's angle and compare side by side; name one fix and re-render.

## 3. Why the v1 dog looked "patched" (`pieces/zaw-dog-01/review/dog_back/`)
- **Six materials and seven images from different sources:**
  - side photo projection;
  - five realistic adult-dog face sheets;
  - a painted head-side fill and a painted bib;
  - later, rear and top Flow photos projected onto the back and rump.
  
  Each source has its own exposure and hue. That is why the back is a different brown from the sides, the area under the ears shows "stickers", and the rump is pink.
- **Projections:** each one stretches at grazing angles, which gives streaks on the legs, back and jaw sides. Every material border is a visible seam.
- **Face:** a photo-real adult beagle face sits on a 750-tri box head. The long muzzle, small eyes and fine wrinkles read as uncanny, not cute.
- **Proportions:** an adult dog's, with a long body and long legs. The head is small and boxy, with the muzzle as long as the skull. The ears are thin flat plates.

## 4. Decisions for v2 (applied in `dog.py` / `bake.py`)
- **Proportions:**
  - The head is 1.13 times the size of a puppy-photo head, round with 14-sided sections and puffy cheeks.
  - The muzzle is short and soft, with a button nose.
  - The eyes are big, warm and wide-set, turned 40° out so they still read in profile.
  - The ears are thick, soft leathers.
  - The torso is short and deep, the legs chunky with big round paws, and the tail a fluffy tufted plume with a white tip.
  - Overall size matches v1 (head top 0.83 m, nose at y ≈ -0.50), so existing cameras still frame it.
- **One texture:**
  - One UV layout and one 256 px atlas (8-bit CLUT, Closest).
  - The colour is a single function of the 3D rest position, with one brown and one white everywhere.
  - The approved markings (blaze, white muzzle, chest bib, socks, tail tip) are 3D fields with ragged fur edges.
  - Fur streaks follow the hair direction.
  - PS1-style light is baked in: lighter on top, darker underneath, darker where the legs meet the body.
  - Because colour depends only on position, UV seams and part intersections cannot change colour.
- **Face:**
  - The face is drawn analytically into the same atlas, with no photos.
  - Expressions change only the eye shape (lids), gaze, brows, tears and lip corners, plus the body pose. It is always a dog face.
  - The five atlases differ only in face texels and share one palette.
- **Rig:**
  - Same bone names and helper API as v1, plus a `tongue` bone (slides out for happy).
  - The jaw pivot sits back toward the eye (CGDive).
  - Tail wag uses bone-local axes, so a raised tail swings instead of twisting.
  - A new `D.happy_wag` gives a fast, wide, overlapping wag through tail1–3 with a hip wiggle.
- **Flow references** (Nano Banana, one at a time): `ref/side.jpg`, `ref/front.jpg` (plus `_b` variants). They are a cute puppy with the approved markings, used for proportions and colour only, not projected.

## 5. Correction (same day): realistic, not anime
The user saw the cute v2 (big round head, big drawn eyes, button nose) as an anime dog. "Cute" meant a cute real dog, and the realism of the old dog was preferred.

**Kept:** the rig, walk, happy wag, bone API and the single-atlas idea.

**Rebuilt:**
- **Mesh:** fitted to the old dog's real photos. Sections come from the side_real silhouette and the head widths from faces2, so the anatomy is real: natural head size, real muzzle length, real eyes and ears.
- **Texture:** made from those photos instead of being drawn:
  - every source is colour-matched to one brown and one white (faces2/neutral);
  - the photos are projected and blended by surface direction, with pull-in and low-pass on grazing faces plus the coat's own fur detail;
  - the side photo's eye is painted out so the expression's eye owns it;
  - the ear front takes the photo ear along its length.
- **Expressions:** the five real faces2 photos.

The anime version is archived in `review/anime/`.
