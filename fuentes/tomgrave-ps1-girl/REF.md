---
type: doc
status: active
tags: [zawdog, doggo-poly-shorts, ps1, lowpoly, blender, character, owner, tomgrave3d]
relatedTo: [styles/zawdog/humans/ownerf, styles/zawdog/STYLE.md, styles/zawdog/humans/build_human3.py]
---
# TomGrave3D's PS1 girl: reference study for `ownerf`

Source: TomGrave3D, "I Made a PS1-Style Character in Blender (Low Poly Retro Look)", https://www.youtube.com/watch?v=GOmAvPOrAwE
(18:02, 24 fps; studied from the 1080p stream). Frames: 1 fps for the whole video, every frame for 0:00-0:05.5 (the
finished T-pose turntable) and 16:30-18:02 (final T-pose, rig check, walk). API frame log: `api_timeline_log.md`.

## Frame sheets (`frames/`)
- `sheet_intro_turntable.jpg`: the finished model, every second frame of the 0:00-0:05 turntable. Compare angles:
  front `intro_f037.jpg`, 3/4 `intro_f044.jpg`, side `intro_f051.jpg` (face to image-left), back `intro_f067.jpg`.
- `sheet_final_tpose_walk.jpg`: 17:12-18:02, final T-pose and the walk. `ruler_front_side_back.jpg`: pixel ruler.
- `sheet_views_side_back.jpg`, `head_front_t932.jpg`, `head_34_t972.jpg`, `head_side_t952.jpg`: textured close-ups.
- `final_head/`: his FINISHED head from the 0:00-0:05 turntable, 3x crops (`head_f037_3x` front, `f044` 3/4, `f051` side,
  `f067` back; hair top y 62, chin y ~425) = the head/hair target used from round 3 (the 15:22-16:12 close-ups show the hair
  before its final shape); `hires_front_t922.png` / `hires_side_t923.png`: 1080p painting-stage close-ups.
- Final head proportions (hair top -> chin = 1): eye line 0.605, bang centre spike tip 0.52, forehead windows up to 0.31,
  ear 0.53-0.73, side-lock tips 1.10 (below the chin); hair half-width 0.22 / 0.29 / 0.36 / 0.42 at depth 0.05 / 0.10 /
  0.20 / 0.40; hair front ~0.04 ahead of the nose tip at 0.30, back ~1.03 behind it; choker 1.08-1.20.
- `atlas_csp_1017s.jpg`, `atlas_blender_1011s.jpg`: his texture atlas. `face_texture_and_head.jpg`: photo face + head.
- `material_nodes_1005s.jpg`: object list + material nodes. `timeline/`: 46 contact sheets, 1 fps, the whole video.

## Process (timeline, condensed)
| time | step |
|---|---|
| 0:00-0:22 | finished character turntable, walk, atlas preview |
| 0:23-1:31 | PS1 references (model viewer: Mega Man Legends, RE1 Chris/Jill as separate chunks) |
| 1:32-1:47 | draws front + side line art in Krita (body, then outfit over it) |
| 1:48-3:12 | reference planes in Blender; box-blocks feet, legs, torso, head from cubes; half-delete + Mirror |
| 3:13-6:24 | head box (tapered, ~8-sided, wedge nose/brow, box ears), torso + pelvis boxes joined, arms as separate 4-6-sided boxes, mitten hands with a thumb, legs with knee loops, extruded feet |
| 6:25-7:48 | hair shell from the head's top faces + pointed strand cards; jacket isolated with open armholes; boots/cuffs as blocks |
| 7:49-11:20 | UVs with a colour grid: head, hair, torso (cross unwrap), limbs (strips), one packed atlas |
| 11:21-12:48 | Texture Paint: flat colour blocks, painted anime face (later replaced), first outfit red jacket + blue jeans |
| 12:49-14:27 | photo face projected onto the face island; choker; jacket recoloured indigo |
| 14:28-16:00 | collar/neck remodel, crop top, purple jeans, hair painting (Clip Studio Paint, `body_basecolor.psd`) |
| 16:01-17:08 | necklace + gold pendant painted, ear shading, final face paint at pixel level |
| 17:09-17:50 | rig (Rigify-style armature on a mannequin, then the character), material node chain (Emission x AO + noise) |
| 17:51-18:02 | walk cycle, back to T-pose |

## Build facts
- Objects (outliner at 16:45): `calf, feet, forearm, hand, head, hips, thigh, torso, upperarm` (+ hair, jacket shells).
  Each limb chunk is a separate low-poly prism (4-8 sides, 1-3 loops); hands are mittens + thumb; boots are blocks.
- Atlas: one image, low-res (pixel stair-steps at 400 % zoom in CSP: ~512 px), Closest. The face photo takes ~1/4 of it.
  Flat colour blocks with painted shading (jacket, jeans, collar, boots, gloves); photo only on the face; hair painted
  purple with dark strands.
- Material: Emission (not lit), colour = texture x (ColorRamp of an Ambient Occlusion node, 16 samples), plus a Voronoi
  noise that mottles the jacket/jeans ("camouflage" blotches in the final turntable).
- Tri count is not shown on screen; from the topology (~8-sided head, 4-8-sided limbs) it is about 1.5-2.5k tris.

## The finished character (look)
- Hair: short purple bob (Motoko). Centre bang spike to the nose bridge, two V gaps over the brows, side bangs, side
  locks to the jaw in front of the ears, short at the nape with a flick, rounded crown. Darker roots, magenta-violet tips.
- Ears: pointy elf ears through the hair (ours: round human ears, user change 3).
- Face: photo of a young woman: pale, thick straight dark brows, brown eyes with smoky lower lids, straight nose, full
  pink lips, soft oval jaw.
- Black velvet choker; thin gold chain with a gold teardrop pendant on the sternum.
- Cropped boxy indigo-violet jacket (ends at the belt), big turned-up lilac collar with pointed front tips, open front,
  puffy sleeves rolled to the elbow with a black rolled band.
- White crop top (lace edge) ending under the bust, long bare midriff, navel.
- Dark purple jeans, straight, rolled cuffs; dark belt with a silver rectangular buckle.
- Black fingerless gloves (fingertips bare), short chunky black boots.

## Palette (median viewport colours, sRGB, emission x AO)
| part | colour | | part | colour |
|---|---|---|---|---|
| jacket back | (53, 46, 77) | | collar | (124, 112, 160) |
| jacket front panel | (39, 34, 58) | | crop top | (197, 197, 196) |
| jeans | (41, 37, 59) | | skin (belly) | (179, 159, 146) |
| hair | (90, 42, 101), tips ~#8A3FB5 | | boots | (22, 21, 20) |

## Proportions (front turntable frame f037, near-orthographic, 951 px = 1.68 m)
| landmark | z (m) | / height | | landmark | z (m) | / height |
|---|---|---|---|---|---|---|
| hair top | 1.68 | 1.000 | | navel | 1.150 | 0.685 |
| eye line | 1.544 | 0.919 | | jacket hem | 1.071 | 0.637 |
| chin | 1.456 | 0.867 | | belt top | 1.044 | 0.621 |
| choker | 1.428-1.407 | 0.85 | | crotch | 0.885 | 0.527 |
| jacket shoulder top | 1.392 | 0.829 | | knee | 0.461 | 0.274 |
| crop-top bottom | 1.247 | 0.742 | | jeans cuff | 0.249-0.161 | |
- Head incl. hair 0.224 m: 7.5 heads tall (about 7.0 without the hair volume). Face width 0.15, hair width 0.185.
- Widths (front): jacket hem 0.33, hips at the belt 0.28, each thigh 0.15, knee 0.10, boot 0.09; side depth at the
  bust 0.24, at the butt 0.22. Arms in the final T-pose ~25-30 deg below horizontal, elbows straight.
- Long legs and a short upper body: crotch at 0.53 of the height, navel at 0.69 (a real woman ~0.47 / 0.60).

## Our modelling reference (Flow turnaround, `styles/zawdog/humans/ownerf/src/turnaround.jpg`)
Same outfit, bigger butt, fuller thighs, round ears. Measured on it (707 px = 1.68 m): hips 0.34 wide at the widest,
thighs 0.164 each, butt 4.5 cm behind the waist line in profile, crotch 0.53 of the height.
