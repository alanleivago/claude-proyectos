---
type: research
status: prototype-works
tags: [rig, mesh-puppet, skinning, webgl, flow, tapestry, animate]
relatedTo: [pieces/zelda-oot, pieces/zelda-fairy, styles/tapestry]
---

# Mesh puppet from ONE Flow image

One Flow image of the woven hero is turned into a puppet with a skeleton, like AE Puppet / Spine / Live2D: a triangle mesh,
bone weights blended across the joints, and linear-blend skinning in WebGL2. Test: `renders/final.mp4` (12 s, 16:9).

## Files
- `gen/pose.jpg`: the Flow image (rig pose). `gen/sword.jpg`: the prop. `gen/parts_sheet.jpg`: bonus test B (paper-doll sheet).
- `rigs/link.json`: **the only hand-made file per character**: joints, bones, layer cut polygons, fills, draw order, props.
- `tools/rig_build.py`: rig file -> `assets/<name>_<layer>.png` + `src/rig_<name>.js` + `review/<name>_cuts.png`.
- `src/rig.js`: **the reusable runtime module** (WebGL2, LBS, props, FK; stateless `draw(pose)`).
- `src/scene.js`: the test choreography (world-angle poses, 2-bone IK, walk cycle, foot planting, sword hand-off).
- `tools/closeup.mjs` (joint close-ups), `tools/popseries.py` (pop check), `tools/footslide.mjs` (foot slip and ground contact).

## Rig a new character (about 30-45 min)
1. **Flow (5 min)**: one ref image of the character, a generic prompt with no names: side profile, *near arm stretched forward-down at
   45 deg, fully outside the body outline*, far arm back, legs apart, no props, flat magenta #FF00FF. A pose with the arm hanging
   in front of the torso (gen/pose_v1_rejected.jpg) is harder: the whole arm has to be cut off the torso. Generate props on their own.
2. **Key (1 min)**: `python ../zelda-oot/tools/weave.py 2 gen/pose.jpg work/pose_keyed.png` (keys it and presses the weave in).
3. **Rig file (20-30 min)**: copy `rigs/link.json`. `python tools/grid.py work/pose_keyed.png work/grid.png`, then read off:
   - joints: hip, waist, neck, crown, shoulder/elbow/wrist/fingertip x2, hip/knee/ankle/toe x2;
   - `armF` polygon: the near arm, following its outline where it lies on the torso (`grow` 6 takes the outline thread with it);
   - `armB` polygon + a `fill` blob of sleeve colour at the hidden shoulder (stays behind the torso, keeps a gap from opening);
   - legs: cut under the hem (`below`), plus a skin `fill` under the tunic so the thigh root never shows when the leg swings;
   - `body` = what is left: `fill` under the near arm in `tile` mode from a clean patch of the same cloth (`donor`), the belt in
     `copy` mode (`offset` from further along the belt); `outline_cuts` puts the rust thread back on new edges.
4. **Build (10 s)**: `python tools/rig_build.py rigs/<name>.json`, then check `review/<name>_cuts.png` (layers, mesh, bones).
5. **Use**: build list `src/rig_<name>.js`, `src/rig.js`, then your scene;
   `R = Rig.create(RIG_<NAME>, ASSETS, {prefix:'<name>_'})`, then each frame `R.draw({x, y, s, b:{bone: deg}, props}); g.drawImage(R.canvas,0,0)`.
   Write poses as world angles and convert them with `toDeltas()` (in scene.js). Copy `ik2`, `walkLegs`, `soles`/`rootX` (foot planting).

## Measured
- Pops: none (popseries over 288 frames). The sword passes from the ground to the hand with 0 changed px (exact hand-off).
- Walk: planted foot slip 0.00 px/frame, no sole goes below the ground, speed comes from the planted foot (not guessed).
  Each frame the root is integrated from the start of the walk, so a frame renders the same whatever order it is asked in.
- Export: about 50 ms/frame on the GPU (Metal ANGLE).

## Limits (honest)
- LBS pinches the inside of a bend over ~100 deg (elbow 115 deg: a V fold; knee 95 deg: weave stretched behind the knee).
  `blend` 28-34 spreads it, and up to ~70 deg it reads clean. For more, the next step is ARAP or dual-quaternion-like 2D.
- The weave texture rotates and stretches with the limb (diagonal threads in a raised arm). In motion it reads as cloth, and up close it reads as warped cloth.
- Profile only: no turning, no limb crossing to the other side of the body. The far arm is behind the body, so it barely shows.
- Rigid hands (mitten, from the image). A fist, a pointing finger or a grip needs a second hand texture swapped on `handF`.
- Asymmetric legs in the source (near leg drawn ~5% longer) need care in the walk (`lift` on the near leg).
- Cut-edge outline is a bit jagged where the cut polygon is straight (back of the torso).

## Bonus B: the "paper-doll parts sheet" from Flow
One prompt gave 12 separated pieces in the right style (`gen/parts_sheet.jpg`), but it is **not usable as-is**: the torso came out
frontal with the shield behind it while the head is in profile, the thighs are bare cream blobs with no tunic, the arms are horizontal
sleeve pieces with joint tabs and pin holes drawn on (a split-pin puppet look), and it drew one fist and one open hand. It works for a
deliberately "split-pin paper puppet" look, but not for the woven figure we already have. Approach A wins.
