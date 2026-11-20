---
type: spec
status: draft
tags: [zawdog, doggo-poly-shorts, kit-human, ownerf, ps1, lowpoly, makehuman-rig, flow]
relatedTo: [fuentes/tomgrave-ps1-girl, styles/zawdog/STYLE.md, styles/zawdog/humans/human.py, styles/zawdog/tools/retarget.py]
---
# ownerf: the dog's owner (female main character), PS1 low poly

Replica of TomGrave3D's PS1 girl (study: `fuentes/tomgrave-ps1-girl/REF.md`) with the user's three changes: a bigger
butt, fuller thighs, and round human ears. Face, garments and hair come from our own Flow images. **Status: round 3,
waiting for the user's approval** (review files in `review/`; round 1 in `backup_v1/`, round 2 in `backup_v2/`).

## Round 3 (2026-11-20, user review of round 2)
- **Legs / butt in profile:** the side silhouette is now set explicitly (`geo.py` `SPZ/SPF/SPB` + `side_fit()`: front and
  back extent of every pelvis and leg ring, pre-stretch), so it runs as one curve belly -> belt -> thigh front -> knee ->
  shin and butt -> back of the thigh -> calf: thigh tops flush with the pelvis (no step at the crotch), no notch under
  the butt (the H ring, two new butt rings at z 0.885 / 0.915 and the belt-bottom ring follow the same profile), shins and
  knees a little deeper like his straight jeans. Checked on `review/side_compare.jpg` (ortho side + our silhouette under
  his outline, aligned at the jeans cuff): our front line sits on his; the butt and back of the thigh stay fuller (intended).
  Jeans side texels read slightly inside the photo edge (no smear at the hip side); the back photo's thin horizontal
  creases are softened (they streaked across the bigger seat).
  **Root cause of the "butt cut off from the legs" found and fixed:** the leg rings were built in mirrored vertex order
  relative to the pelvis H ring (the leg frame's 90 deg points inward), so the hip band joining them was twisted (the
  crotch vertex joined the outer thigh) and the leg normals came out inverted (wrong flat shading on the jeans). Now
  the order matches (`leg_rings` angles), the hip band is a clean ring and the seat flows into the thighs from every
  angle (`work/cmp` hip renders); the H ring's outer vertices sit flush with the thigh top (the old +4 mm made a ledge).
- **Cleavage:** new Flow torso photo (`photo/torso.jpg`, V/sweetheart neckline with lace; round 2 kept as `torso_v2.jpg`);
  the upper trunk rings (bust -> neck) now have +-13 deg columns (`A14`, stitched to the crop ring) so the cups
  (`bust_k`, fullest at +-27 deg) and a recessed centre (`cleave()`, deepest at z 1.272) make a real cleavage valley; the
  chest patch gets ~2x texel density (`uv.py` `SRC_DENS`), the photo's cleavage is mapped over z 1.26-1.31 and its
  luminance contrast lifted.
- **Hair (rebuilt, silhouette-driven):** his FINAL turntable head (`fuentes/.../frames/final_head/`) measured in
  hair-top -> chin units (front half-width, side extents ahead / behind the nose tip) drives a 24-column, 7-row shell:
  rounded tall crown, the bang "visor" standing off the forehead, centre spike to between the brows, tall forehead
  windows, side spikes, cap edge just above the round ears, the back hanging to the jaw with long side tufts and a nape
  flick that turns up (dark underside showing, like his inner shell), plus thicker side locks in front of the ears to
  below the chin. Silhouette error vs his: within ~0.02 of the head height at most depths (`hsil` check in the session).
  Texture: flat hand-painted strands (new Flow `photo/hair_paint_b.jpg`, 3 tones, softened), his gradient (light
  magenta-violet crown -> dark tips), near-black underside.
- **Head / ears / neck:** the face sits lower in a taller skull like his (eyes at 0.60 of hair top -> chin; `vremap()`:
  proxy eye line -1.8 cm, chin kept, cranium stretched), skull 3 % wider, V jaw (lower face tapers 7 % to the chin),
  flatter profile (smaller nose push, firmer chin, stronger brow); round ears smaller (5 cm), a little forward, softer concha tone, standing
  out so they show from the front between the cap edge and the side lock; neck a slimmer oval tube, the choker lower and
  wider (his band 1.40-1.43 m), the portrait fades out under the chin (no second choker), the collar opens wider at the
  front and sits lower at the neck sides. `face_bake.py` reads the new eye line / choker from `work/geo.json`.
- The rig and the baked clips are unchanged (hair top pinned to the round-2 height, so the final scale is identical:
  max bone offset 0.5 mm vs `backup_v2`).

## Round 2 (2026-11-20, user review of round 1)
- **Head:** a real low-poly 3D head (`tools/headmesh.py`): the MakeHuman CC0 `proxy741` retopology (hand-modelled nose,
  brow, lips, chin, jaw, full skull) fitted to her body, eyes/mouth closed, symmetric decimation, reshaped toward his
  head (longer narrower face, pointier chin, stronger nose / brow, more skull behind the ears) + modelled round ears.
  The Flow portrait is BAKED into a per-expression head texture (`tools/face_bake.py`, cylindrical "headuv" unwrap,
  TPS landmark warp, fades into the portrait's own skin tone): no cheek seam at 3/4, skin all around the head.
- **Hair:** his bob rebuilt: dome crown, long narrow centre spike + gaps + side spikes (denser front angles), cap edge
  above the ears so the round ears show, two wedge side locks in front of the ears to the jaw, a jagged duck-tail
  flick at the nape, an underside fold (thickness, nothing seen through).
- **Legs:** fuller thighs grow at the back (hamstring/butt), and the leg rings are aligned so the front line runs
  straight from thigh to cuff in profile (no forward kink at the knee).
- **Torso:** new Flow torso photo (fuller bust, square neckline with the cleavage line, small navel); bust volume in the
  geometry (`bust_k`), jacket opening a little wider at the chest; navel small (no stretched shadow).

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
- Faces (hard swap on the beat, kit names): `neutral, smile, surprised, crying, laughing, scared`. `faces/<expr>.png`
  (256 px, Closest) are BAKED head textures on the `headuv` UV (sources: `faces/<expr>.jpg` Flow portraits ->
  `faces/src_<expr>.png` aligned). Slot 1 = the whole head (`img` swapped by `P.face`).
- Fingers: index separate from the others, so `finger2-*` straight + `finger3/4/5-*` curled = point; all curled = fist
  (local X rotation; see `tools/look.py curl()`).

## What she is
- 2566 triangles (1345 faces, 1484 verts): head + round ears 412, hair 404 (shell + underside fold + 2 side locks),
  body (crop-top patch + jeans + legs) 550, jacket + sleeves + collar 440, forearms 96, hands 448 (4 fingers + thumb
  each), boots 216. Faceted, no subdivision, one mesh with loose parts (like his separate objects).
- Height 1.676 m. Proportions from his model: legs stretched x1.18 on the MakeHuman base (crotch 0.50 of the height,
  his 0.53), high waist (navel 0.67, his 0.69), jacket ending at the belt, ~7.1 heads with the hair.
- Atlas `atlas.png` 512 px, Closest (texel-space bake from the Flow photos: jacket/jeans/torso by thin-plate-spline
  landmark warps, front/back cross-faded by the normal; boots, gloves in their own frames; hair tiled along the strands;
  flat fills only where his texture is flat: skin, collar, rolled cuff band, choker, boots/gloves stay near-black).
  Jacket/jeans get his mottled-fabric noise (+-11 %) baked in.

## Files
- `ownerf.blend` (rig + body, textures packed), `atlas.png`, `faces/` (6 Flow portraits `.jpg` + 256 px `.png`, `mask.png`,
  `face_lm.json`), `photo/` (Flow: `jacket.jpg` ghost mannequin front|back, `jeans.jpg` front|back, `torso.jpg` V-neck crop
  top + choker + midriff (round 3), `boots_gloves.jpg`, `hair_paint_b.jpg` painted strands (round 3; `hair.jpg` = round 2), `src/turnaround.jpg` (Flow front|side|back of the modified
  character = the modelling reference), `review/`, `tools/`, `work/` (intermediate, rebuildable).
- Rebuild everything: `tools/build.sh` (geo.py -> uv.py -> tex.py -> final.py), then `tools/review.sh`.
  - `geo.py` (Blender): MakeHuman female + rig via MPFB, ring lofts ray-cast from its body and fitted to the turnaround
    (bigger butt `BUTT`, fuller thighs `THIGH`), jacket / jeans as offset shells, collar, hair bob, round ears, hands
    with 5 fingers, boots; writes `work/geo.blend`, `work/model_lm.json` (2D landmarks for the photo warps).
  - `uv.py`: one mesh, per-part texel density, atlas pack, `proj` UV for the face photo. `tex.py`: the atlas bake.
  - `final.py`: kit materials, procedural weights (spine tents, clavicle/upper-arm blend at the shoulder, the armhole
    shared 40/30/30, sleeve -> elbow blend, hip/knee blends, boots 100 % foot), leg-length remap, saves `ownerf.blend`.
  - `face_prep.py`: aligns the 6 portraits (ECC), paler skin grade, mask, landmarks. `photo_lm.py`: photo landmarks.
  - QA: `qa_poke.py` (frame-by-frame poke-through), `styles/zawdog/tools/motion_check.py` (feet), `look.py` (renders;
    `ortho=<m>` for pure orthographic views), `compare.py` / `sheets.py` / `headcmp.py` (head vs his final head, same
    scale) / `sidecmp.py` (full-body ortho side + silhouette overlay) / `csheet.py` (review sheets), `ask.py` (API
    critique), `motion_kit.py` (kit hallway test), `ps1post.py` (our finals' stable PS1 dither).

## QA (2026-11-20, round 3 final build; round 2 numbers in `backup_v2/README.md`)
- Feet (`motion_check.py`, `work/qa/r3/*_feet.txt`): identical to round 2 (same rig): no floating, no sinking; planted-sole
  slides 2-4 cm in the walk (mocap), 3-6 cm in the startle (the jump itself).
- Poke-through on every frame (`qa_poke.py`, `work/qa/r3/poke_*.txt`, clips WITHOUT abduction): forearm->sleeve 0,
  torso->jacket 0.6 (walk, idle) / 1.3 (startle, both arms up), head->hair 0.5 (temple skin just under the cap edge),
  boot->cuff 0.3-2.0 (was 2.9-4.9 before the leg ring order fix), hands->hips 3.9-6.2 cm, fixed in shots by ABDUCT 13
  (`motion_test.mp4` uses it: no glove in the hips in any frame).
- Silhouette checks vs his final turntable (session tools): leg front line on his outline (`side_compare.jpg`); head
  outline within ~0.02 of the hair-top -> chin height at most depths (front half-width, side front / back extents).
- API reviews (sonnet 5.5, `work/cmp/r3_critique.md`, `r3_critique2.md`): taken as hints only (they contradict each
  other on ears / neck); acted on: the butt-to-thigh corner (root cause = the twisted hip band, fixed), jeans streaks,
  the navel-like dot at the V-neck, ears too dark, collar standing off the back of the neck, chin.
