---
type: spec
status: draft
tags: [zawdog, doggo-poly-shorts, kit-human, ownerf, ps1, lowpoly, makehuman-rig, flow]
relatedTo: [fuentes/tomgrave-ps1-girl, styles/zawdog/STYLE.md, styles/zawdog/humans/human.py, styles/zawdog/tools/retarget.py]
---
# ownerf: the dog's owner (female main character), PS1 low poly

Replica of TomGrave3D's PS1 girl (study: `fuentes/tomgrave-ps1-girl/REF.md`) with the user's three changes: a bigger
butt, fuller thighs, and round human ears. Face, garments and hair come from our own Flow images. **Status: waiting for
the user's approval** (review files in `review/`).

## Use it in a shot (kit contract, same as every kit human)
```python
sys.path.insert(0, "<repo>/styles/zawdog/humans"); import human as HU
P = HU.Human("ownerf")                    # ownerf.blend: ownerf_rig + ownerf_body (materials already kit-flat)
P.body.modifiers.new("ps1", "NODES").node_group = bpy.data.node_groups["PS1Snap"]   # inside the zaw-dog kit
P.place((x, y), yaw); P.play(HU.load_action("of_walk")); P.face("scared")
```
- Bone names: MakeHuman "default" skeleton (`root, spine05..01, neck01..03, head, clavicle.L, upperarm01.L, lowerarm01.L,
  wrist.L, finger1-1.L ... finger5-3.L, upperleg01.L, lowerleg01.L, foot.L`), rest = MakeHuman A-pose, so
  `styles/zawdog/tools/retarget.py`, the baked clips and the Kimodo BVHs work. Bake her own clips with `human=ownerf`
  (foot planting uses her real boots): `of_walk` (100STYLE Neutral_FW 517-697), `of_idle` (Neutral_ID 700-880,
  still=1 stance=0.1), `of_startle` (Kimodo startle_jump_back) are in `motions/baked/`. Owner-baked clips
  (`k_*`, `c_*`) also play on her (checked: `k_startle_jump_back`).
- **ABDUCT 13 deg** for hanging arms (the kit's `abduct()` from `pieces/zaw-dog-08/shots.py`, also in
  `tools/motion_kit.py`): her hips are wider, so without it the gloves sink 2-6 cm into the hips in idle/walk poses.
- Faces (hard swap on the beat, kit names): `neutral, smile, surprised, crying, laughing, scared` (`faces/*.png`, 256 px,
  Closest: the PS1 face resolution of the reference). Slot 1 = face material (`img` swapped by `P.face`).
- Fingers: index separate from the others, so `finger2-*` straight + `finger3/4/5-*` curled = point; all curled = fist
  (local X rotation; see `tools/look.py curl()`).

## What she is
- 2262 triangles (1152 faces, 1328 verts): head 266, ears 24, hair 312 (shell + underside fold), body (crop-top patch +
  jeans + legs) 484, jacket + sleeves + collar 416, forearms 96, hands 448 (4 fingers + thumb each), boots 216. Faceted,
  no subdivision, one mesh with loose parts (like his separate objects: head, hair shell, jacket shell, limbs, hands,
  boots).
- Height 1.676 m. Proportions from his model: legs stretched x1.18 on the MakeHuman base (crotch 0.50 of the height,
  his 0.53), high waist (navel 0.67, his 0.69), jacket ending at the belt, ~7.1 heads with the hair.
- Atlas `atlas.png` 512 px, Closest (texel-space bake from the Flow photos: jacket/jeans/torso by thin-plate-spline
  landmark warps, front/back cross-faded by the normal; boots, gloves in their own frames; hair tiled along the strands;
  flat fills only where his texture is flat: skin, collar, rolled cuff band, choker, boots/gloves stay near-black).
  Jacket/jeans get his mottled-fabric noise (+-11 %) baked in.

## Files
- `ownerf.blend` (rig + body, textures packed), `atlas.png`, `faces/` (6 Flow portraits `.jpg` + 256 px `.png`, `mask.png`,
  `face_lm.json`), `photo/` (Flow: `jacket.jpg` ghost mannequin front|back, `jeans.jpg` front|back, `torso.jpg` crop top
  + choker + midriff, `boots_gloves.jpg`, `hair.jpg`), `src/turnaround.jpg` (Flow front|side|back of the modified
  character = the modelling reference), `review/`, `tools/`, `work/` (intermediate, rebuildable).
- Rebuild everything: `tools/build.sh` (geo.py -> uv.py -> tex.py -> final.py), then `tools/review.sh`.
  - `geo.py` (Blender): MakeHuman female + rig via MPFB, ring lofts ray-cast from its body and fitted to the turnaround
    (bigger butt `BUTT`, fuller thighs `THIGH`), jacket / jeans as offset shells, collar, hair bob, round ears, hands
    with 5 fingers, boots; writes `work/geo.blend`, `work/model_lm.json` (2D landmarks for the photo warps).
  - `uv.py`: one mesh, per-part texel density, atlas pack, `proj` UV for the face photo. `tex.py`: the atlas bake.
  - `final.py`: kit materials, procedural weights (spine tents, clavicle/upper-arm blend at the shoulder, the armhole
    shared 40/30/30, sleeve -> elbow blend, hip/knee blends, boots 100 % foot), leg-length remap, saves `ownerf.blend`.
  - `face_prep.py`: aligns the 6 portraits (ECC), paler skin grade, mask, landmarks. `photo_lm.py`: photo landmarks.
  - QA: `qa_poke.py` (frame-by-frame poke-through), `styles/zawdog/tools/motion_check.py` (feet), `look.py` (renders),
    `compare.py` / `sheets.py` (review sheets), `ask.py` (API critique), `motion_kit.py` (kit hallway test),
    `ps1post.py` (our finals' stable PS1 dither).

## QA (2026-11-20, final build)
- Feet (`motion_check.py`): no floating, no sinking; planted-sole slides 2-4 cm in the walk (mocap), 3-6 cm in the
  startle (the jump itself).
- Poke-through on every frame (`qa_poke.py`, cm outside the covering shell, clips WITHOUT abduction): head->hair 0,
  forearm->sleeve 0, torso->jacket 0.3 (walk, idle) / 0.7 (k_wave_hello) / 1.3 (startle, both arms up); hands->hips
  2-6 cm, fixed in shots by ABDUCT 13 (motion_test.mp4 uses it). The boot->cuff number (3-5 cm) comes from the cuff's
  inner return fold confusing the nearest-face sign; no boot shows through the cuff in any render (8 angles checked).
- API reviews (sonnet 5.5): reference-vs-ours critiques `work/cmp/critique1-3.md` (scores 5-6/10, they also count the
  intended face change), skinning QA on the motion frames `work/cmp/motion_qa.md` -> fixed: see-through gap behind the
  side locks (hair underside fold), wrist skin wedge (forearm tapers into the glove), collar tips riding up (chest-only
  weights, shorter tips), flat skin wedges at the temples (hair-shadow tone).
- Known: the 3/4 view shows the face photo's edge on the cheek plane; the profile is flatter than his sculpted nose/chin;
  the collar is a stand + fold funnel where his lies flatter on the shoulders.
