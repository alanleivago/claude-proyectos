# Batch log: 00:01–03:12 (s0001–s0192)

## 1. Timeline
```
00:01-00:05  Intro showcase: finished character in Blender viewport, T-pose, turning front/back/side. Dark navy jacket, dark pants, black fingerless gloves, purple hair.
00:06-00:10  Same character in a walk-cycle pose, orbiting (front, side, 3/4 views).
00:11-00:15  Textured version with UV Editor and Shader Editor open. Front view, then orbit to back.
             s0011 shows an alt/red-sleeve texture. s0012-14 show navy jacket, white tank top, blue jeans.
00:16-00:22  Head close-ups: pointed ears, choker, pendant, chunky hair shell. UV Editor shows the face/hair/jacket texture atlas.
             s0019-22 show the hair in a lighter lavender tint (probably selected or highlighted).
00:23-00:30  Browser: a PS1 character model-viewer site (grid of playable-character icons).
             Viewing a Mega Man Legends-style blue-armor model (s0025-27) and a man in a beige coat (s0028-30).
             Purpose is PS1 look reference.
00:31-00:33  His store page: "PlayStation Style Character / PS1 Style Inspired Character (Project File)".
00:34-00:48  Scrolling his store/posts: Blue Cat character modeling file, UE5 Third Person Character, Blender-to-Unreal setup,
             3D Asset Pack, Low Poly Sword Kid rig, "Tom Grave 3D" header. Promo/UI only.
00:49-00:51  Model viewer: RE1-style Chris Redfield, front/side/back. PS1 proportion reference.
00:52-01:03  Chris in Blender. Orange-highlighted parts are clicked one by one: head/hair, shoulder strap,
             vest, belt/pouch patches, leg patch. s0061-62 show a piece grabbed away from the body.
             He is showing the model is built from separate chunks and pieces.
01:04-01:14  Jill Valentine (RE1-style) in Blender: orbit front/back/side/top. Properties panel is open.
01:15-01:31  Jill: forearm/glove selected (orange). Arms are posed out to a T-pose (s0087-91).
             A thin bone/line is visible across the shoulders. s0078 and s0081 show a small popup/menu.
01:32-01:36  Switches to Krita. Draws the front-view body line art on white (underwear-style base, boots).
01:34-01:41  Adds a side view plus a separate arm drawing next to the front view.
01:37-01:41  Draws the outfit over the body: cropped jacket with puffy sleeves, crop top, belt, pants cuffs, hair/face.
01:42        Crops the canvas to a tall front-only image.
01:43-01:47  Export/save dialogs. s0105 shows the cropped side view with a menu. s0106-07 are another save dialog.
01:48-01:53  Blender: new empty scene (default cube/objects cleared).
01:52-02:00  Add > Image > Reference. File browser loads the front PNG (s0116).
01:58-02:00  Pie menu, second Add menu and file browser load the side PNG.
02:01-02:15  Two reference planes at 90° (cross/V shape, edge-on in s0129). s0131-32 show an orange-outline/wireframe look.
             They are then rotated and moved apart and re-aligned (s0133-35). Perspective orbit; menu popups at s0140 and s0144-45.
02:25-02:27  Add > Mesh > Cube (s0146 pie menu, grey cube). Cube is selected (orange) and moved/scaled between the planes.
02:32-02:38  Front plane behind the cube, side plane to the left. Grey cube shows a translucent plane behind it.
             s0153-55: Edit Mode, top face selected (orange).
02:37-02:38  Cube moved down and scaled over the feet/lower-leg area of the front reference (s0157-58).
02:39-02:44  Orthographic front view, zoomed out/in (s0159-64). Box outline sits on the feet region.
02:45-02:47  Box is scaled and moved to the legs, then the pelvis/torso (s0165-66).
02:47        Small box at chest/neck.
02:48-02:54  Zoom to the head. Grey box matched to head width over the face reference.
02:54-02:57  Edit Mode: left half of the box selected (orange), then deleted. Only half remains (mirror prep).
02:58-02:59  Modifier menu opened on the right panel (s0178-79). Probably Add Modifier > Generate > Mirror.
03:00-03:07  Zoomed out to the upper body. Head box, with the right-side panel changed.
03:08        A duplicate grey box appears to the right of the reference (s0188). It is gone again at s0189.
03:10-03:12  Pie menu (s0190). Head box half-selected (s0191). Another box at chest/neck with its left half selected (s0192).
             Probably starting a separate torso block.
```

## 2. Topology / technical notes
- **Final character (showcase only):**
  - The mesh looks low-poly, with boxy angular limbs, chunky hair clumps and a simple jacket.
  - Hair appears to be a separate, lighter-tinted shell object.
  - Ears are pointed and modelled in geometry.
  - UV Editor shows a single packed atlas with the face, hair and jacket islands, plus dark island shapes for the jacket and pants.
  - Shader Editor shows an Image Texture node feeding a shader. Node details, texture resolution and Closest/Linear setting are not legible.
- **RE1 Chris/Jill demos:**
  - They are assembled from separate chunks (head/hair, vest, belt pieces, leg patches, gloves, forearms).
  - These are separate meshes, or at least separately selectable parts.
- **Reference setup:**
  - Krita front and side sheets are exported as separate tall PNGs.
  - They are added in Blender as Reference images and arranged as orthogonal front and side planes. They are moved apart from the origin for modeling.
- **Blocking:**
  - Starts from default cubes scaled to body regions: feet, legs, torso, chest, head.
  - The head cube is cut in half and a modifier menu is opened right after (almost certainly Mirror).
- **Not readable in this batch:** stats overlay (tri/face counts), exact loop counts, mirror settings, texture size, filtering.

## 3. Design notes
- **Hair:**
  - Purple, about #7B3FA0.
  - Short, angular, chunky bob with a side-swept fringe.
  - In the Krita sheet it is a short bob with a side part.
- **Face:**
  - Angular, with sharp brows, sideburns and a stylised hand-painted texture.
  - Tan/peach skin, about #E0A57E.
  - Source of the face texture is unclear.
- **Ears:** pointed, elf-like.
- **Neck:** black choker plus a gold pendant necklace.
- **Jacket:**
  - Cropped, open, dark navy/indigo, about #2E2A5E.
  - Lilac/lavender collar and lapels, about #8A6FC0.
  - Puffy/rolled short sleeves.
  - One alt texture has red sleeves, about #C0392B.
- **Top:** white crop tank, about #E8E8EC.
- **Pants:** blue jeans (about #2F4F8F) in textured previews, appearing darker navy (about #26244A) in the early viewport shots.
- **Gloves:** black fingerless.
- **Reference sheet (Krita):** front and side line art, fitted pants with cuffs over boots, cropped puffy-sleeve jacket, crop top and belt.
- **Style references:** PS1 games (Mega Man Legends, Resident Evil 1) shown for proportions and low-poly look.# Batch log: s0193–s0384 (03:13–06:24)

All of this batch is blocking the base mesh in default grey, in solid and X-ray views over two reference planes. The side-view plane is on the left and the front-view plane on the right. No UVs, textures, materials, rigging or posing appear. The text in the side panels and any stats overlay is too small to read, so I can't give tri or vertex counts.

## 1. Timeline

```
03:13-03:30  Torso blockout in front ortho view. Starts from a grey box over the chest/abdomen; selects faces (orange) and adds loop cuts. A second box is added for the pelvis, leaving a visible gap between chest and pelvis boxes.
03:31-03:35  Orbits to perspective to check both reference planes. Deletes or merges the stacked boxes into one cube with a cross loop, to confirm it fits front and side refs.
03:36-03:40  Switches to a close-up head reference (front). Places a box on the head and tapers it (narrower toward the jaw/chin) to fit the face.
03:40-03:52  Head blockout. Swaps to a higher-res face reference (white bg). Side view: shapes the skull profile with loops. Front view: adds a vertical centre loop and extrudes a neck block from the bottom face.
03:53-04:02  Face profile in side view. Extrudes a blocky nose/brow wedge; the front view shows a dark slot under the brow. A popup menu appears around s0237 and s0241 (probably a pie or context menu).
04:03-04:10  Ears. Selects a side face, extrudes a small boxy ear. The back view at 04:10 shows both ears, so a Mirror modifier is almost certainly on.
04:11-04:24  Chest/torso box added under the head. Front view: loop cuts and a centre-line selection. Side view: shapes the bust and back profile against the side ref and adds the neck.
04:25-04:34  Pelvis box. Shaped into a briefs-like form with a V at the front and angled lower faces (dark facets in side view).
04:35-04:40  Zooms out to full body and opens a context/add menu. Adds a small box at the foot (s0278) and a box at the arm (s0279).
04:40-04:56  Arm as a separate box. Side view: extrudes or loop-cuts it into upper and lower segments (trapezoid-shaped faces), then extrudes down to the hand and tapers it to the wrist.
04:57-05:04  Orbits around the arm to check that it is a separate object from the torso, with torso/pelvis visible as separate pieces. Begins extruding the hand block (orange selection, s0300).
05:05-05:13  Hand. A block with a thumb extruded off the side. A wireframe/X-ray overlay is on at 05:06. Two hands/arms are visible at 05:08, so it is mirrored or duplicated.
05:14-05:19  Front full-body view, checks both arms. A stray thin plane or object floats at the right at 05:16. Selects the upper arm and the thigh area.
05:20-05:28  Legs. A leg box from hip to ankle is tapered and loop-cut in the front view, then in the side view (yellow/red axis constraint lines show while grabbing). Edge loops are placed at the knee.
05:29-05:41  Lower leg and foot. Selects the calf and shin faces. Foot is extruded forward in side view with a heel. A properties-area popup (an operator panel) appears at 05:35.
05:42-05:51  Front view zoomed on the feet. Horizontal loop at the ankle (red constraint line) for a shoe or cuff band. Perspective check of the whole body: head, torso, one arm, blocky legs and feet.
05:52-06:00  Front checks of the legs. Alternating light and dark faces confirm flat shading. Ankle band/shoe cuff visible.
06:01-06:13  Review and adjust the full body: torso with arms attached, shoulders and waist reshaped, wide hips.
06:14-06:21  Jacket sleeves in front view. Orange selections at the upper arm, loops at the elbow, and bulged/rolled forearm cuffs. Shoulder puff area selected at 06:19.
06:22-06:24  Starts the hair: selects the top and back head faces (orange) against the side reference, apparently to duplicate and separate them.
```

## 2. Topology notes

- **Head:** A single box that is tapered and subdivided.
  - Vertically it has roughly 6–8 loops, with a centre loop, and a quad-ish head with a blocky jaw.
  - The neck is a short extruded box of 1–2 loops, 4-sided and slightly tapered.
  - The nose is an extruded block, flat-sided and wedge-shaped.
  - The ears are small extruded boxes of about 1 extrusion, mirrored left/right.
- **Torso:** Starts as two boxes (chest and pelvis) with a gap between them. They are later joined by loops into one body shape with the neck on top.
  - The chest has about 3–4 horizontal loops.
  - The bust is shaped by moving verts in the side view.
  - The pelvis has a V-shaped front, about 3 loops, and the bottom faces are angled.
  - Ends at hips/briefs rather than at the legs.
- **Arms:** Separate object from the torso, about 4–6 segments.
  - Upper arm and forearm are each about 2 loops, and the wrist is a tapered ring.
  - The arm cross-section is a box (4-sided), not a many-sided cylinder.
  - Rolled-sleeve cuffs on the forearm and a puffed upper sleeve are added later with extra loops.
- **Hands:** A single block with an extruded thumb and no individual fingers.
- **Legs:** A tapered box per leg, about 4–5 loops from hip to ankle, with knee loops.
  - The foot is extruded forward from the ankle with a heel.
  - An ankle loop is used for a cuff/boot band.
  - The leg looks separate from the torso in the front view.
- **Mirror:** Evidence of a Mirror modifier is the ears at the back view, the two arms, and the legs. The exact modifier panel isn't legible.
- **Hair:** Starts as a duplicated or separated chunk of the head's top and back faces.
- **Stats:** No numeric tri/vert counts readable.
- **Texture settings, filtering, material nodes:** Not in this batch.

## 3. Design notes

- **Reference sheet:** A full-body front view and a side view, both line art on white. The front shows a woman in a short cropped jacket with sleeves rolled or puffed, a crop top or bra under it, a collar and a high-neck piece, briefs-style bottoms and long legs. Separate close-up face references (front and side) are used for the head.
- **Face:** Anime-like young woman with a short bob and bangs/fringe, flicks of hair at the sides and eyes drawn as simple lines. The face texture source is likely this close-up art, but it isn't applied yet.
- **Hair silhouette:** Short bob, close to the head, with side tufts flicking outward at about ear level.
- **Colours in this batch:** Only the default mesh grey (about `#808080`), the dark viewport background (about `#3D3D3D`), the white reference background, and the orange selection highlight (about `#E8A860`). No character colours are visible yet.
- **Proportions:** Realistic or slightly stylised, with long legs and narrow shoulders. The blockout reads as angular and faceted, with flat-shaded faces.# Batch log: s0385–s0576 (06:25–09:36)

## 1. Timeline

| Time | Step |
|---|---|
| 06:25–06:30 | Head blockout in side and front orthographic views, with the pencil reference image behind. A flat-shaded box head sits on the neck and shoulders. The nose and brow are cut or extruded into the face block. Hair is a thin shell with a few pointed strand cards at the sides. |
| 06:30–06:36 | Front view, X-ray or wireframe toggled so the reference shows through. Nose bridge and brow ridge are refined. |
| 06:31, 06:37–06:38 | Perspective view showing the front and side reference planes as separate image planes either side of the model. Orange selected faces mark the nose, brow and side-view check. |
| 06:32–06:36 | Front-view face detailing: a dark brow slit, a nose wedge, and small triangular brow or eye-socket wedges at s0395–0396. |
| 06:39 | Close front view of the head wireframe against the reference face drawing, used to fit the model to it. |
| 06:40–06:48 | Back and side views: ear placement, then hair shaping. The cranium is a rounded multi-segment dome. A tubular neck and pointed ear/side-lock spikes hang off it. Back hair is a shell, with a separate cap piece seen at s0407. |
| 06:49–07:12 | Torso and lower body blockout in front view: puffy sleeves, bust, narrow waist, flared hips. The reference shows through in X-ray. Orange selections on the shoulder and sleeve faces (s0412–0415, s0427–0429) and on edge loops at the back of the shoulder and the hip (s0418–0422). Side and back checks follow. At s0426 he zooms out to the full figure with the front and side reference planes. s0430–0433 are close-ups of the collar and shoulders, plus a side profile with the jacket collar. |
| 07:13–07:29 | Torso or jacket isolated (local view) and orbited. Open armholes, a thin rim loop on one side, and orange face selections around the arm openings and hem. He cleans up the shoulder and armhole shapes. |
| 07:30–07:36 | Lower body shown with a hand and boots, then the forearm/shin pieces. Two or one tapered prism segments are shown isolated (s0453–0454). Front X-ray and side views of the body and arm against the reference (s0455–0457). |
| 07:37–07:44 | Full-body checks front and side. All parts are low poly, with boots and cuffs as separate blocks. |
| 07:44–07:48 | He opens a menu (s0464) and switches to a UV editing layout, with a UV editor appearing on the right. The head is shown with its hair cards. |
| 07:49–07:59 | Demo or explainer on a different, cartoony T-pose model with a labelled colour-grid texture. UV islands are shown packed in the editor, with orange selected islands. The arm is shown with grid cells "3" and "4". This is his UV method example, not his own character. |
| 08:00–08:08 | Back to his head, with Properties panel menus popping up repeatedly. This is probably material or texture setup. |
| 08:09–08:12 | Colour-grid image assigned. The head turns cyan and green. The UV editor shows the rainbow labelled grid (columns like H2 H3 H4 H5…, rows A–H). |
| 08:13–08:24 | UV unwrapping the head. Right-click menus (seams or unwrap) appear. The side head view shows grid letters. Islands are selected in orange (the face/head piece, then smaller chunks). By s0502–0504 the hair islands are also unwrapped and show distorted, warped grid colours. |
| 08:25–08:49 | Hair UV work in close-ups: front hair, back of head and nape, top of head, and strand cards. He selects individual islands (orange) and checks stretch, with the UV editor showing the pieces being laid out. |
| 08:50 | The head has several hair-strand islands selected. |
| 08:51–08:54 | Body shown as white clay with the textured head. The UV editor shows head pieces, then a cross-shaped island. |
| 08:55–09:02 | Torso/vest unwrap: it is selected and shows the checker (green and blue, labels like "C5", "B5"). Close-ups of the front, then a flipped view show the mirrored text. |
| 09:03–09:09 | Torso re-coloured red grid. Orange islands (sleeve and vest panels) are selected and laid out. A cross-shaped unwrap (box-style) is selected at s0547–0549. |
| 09:10–09:19 | Separate forearm/shin or hand pieces. Two are shown in white and peach, with a menu opened. One piece gets a cross unwrap and a skin-coloured material. |
| 09:20–09:36 | Arms now green. Leg pieces are selected (s0561), then both legs shown with the checker. The UV editor shows a wide fan or strip layout with a white rectangle, and he adjusts and checks the leg islands to the end of the batch. |

## 2. Topology notes
- **Head:** blocky, roughly 8-sided around, with a flat front plane and a faceted cranium. Nose and brow are single wedge extrusions, and the face is a low-poly mask. I can't count exact loops.
- **Ears:** tiny pointed cards or spikes, not full ears.
- **Hair:** a shell over the cranium. Back hair is a drape of 1–2 rows of quads. Side strands are single-triangle or quad spike cards, and there is a separate top cap piece.
- **Neck:** simple 6–8-sided tube.
- **Torso:** about 4–6 horizontal loops (bust, waist, hip). The sleeves are separate puffy segments of 2–3 rings.
- **Jacket/vest:** treated as a separate mesh with open armholes (isolated in local view).
- **Arms and legs:** each limb is a stack of separate prism segments (upper, lower, cuffs/boots), 4–6 sides, one or two loops each. Hands and feet are blocks.
- **Mirror and separation:** the mirror modifier is likely in use, since the body is symmetrical, but I can't see the modifier panel. Parts are separate objects or pieces, with hair, head, torso, arms and legs all unwrapped individually.
- **Stats overlay:** none legible.
- **UV/texture:** the Blender Color Grid-style generated image is an 8×8-ish labelled grid (letters and numbers per cell), with a visible rainbow gradient. Resolution and filtering are not readable. Material nodes aren't clearly visible; a menu pops up in Properties but its contents are unreadable.

## 3. Design notes
- **Reference:** pencil drawings, front and side, of a female character. The face is slim and angular, with a short bob or short hair and strand wisps.
- **Face:** the drawing shows a serious look. Texture source for the face isn't visible in this batch.
- **Hair:** short bob, with pointed side locks hanging at ear level and longer pieces at the nape.
- **Outfit:** puffy short sleeves, a fitted bodice or vest with open armholes, a flared waist and hips, and cuffs. Boots at the bottom.
- **Colours:** mostly flat clay grey (~#9A9D9D) with a dark background (~#3D3D3D). The checker teal is ~#3FA89A, with blue ~#4A6FB0, green ~#6CC24A and red ~#B03A3A. Skin is peach, ~#E8C0A0. The white clay body is ~#E6E6E6. These are the temporary grid colours, not final colours.# Log: 09:37–12:48 (s0577–s0768)

Overall: this batch is UV unwrapping of the body parts (checker texture), then texture painting of the face directly on the model, then a first outfit and colour pass. The UI is small and I can't read numbers, so counts below are approximate.

## 1. Timeline

- **09:37–09:49** Unwraps a pair of tapered limb-like pieces, probably legs. The checker texture is on in the 3D view.
  - The first UV shows a curved flat sheet with a small bar-shaped island, which is probably the cap.
  - He selects islands (orange), opens a context menu (09:41–09:42), and re-lays the island as a square block with a grid (09:43–09:49).
- **09:50–09:52** Full-body view with the checker texture. A cross-shaped island (a cube unwrap, probably the torso/hip block) is selected, with a context menu at 09:51–09:52.
- **09:53–09:57** Lumpy, rounded, head-like blob, shown white and then peach. He marks and unwraps it with a menu open (09:55, 09:57). Its UV is a tiny island.
- **09:58–10:06** Dome-shaped piece (head or cranium). The UV shows two leaf-shaped halves with a small square island. The checker colours change from blue/purple to yellow/green/red (10:03 onward). The islands are shrunk and pushed to the bottom-left at 10:06.
- **10:07–10:08** Full body again, with a large orange cross island and a menu.
- **10:09–10:13** Close-up of the lower leg/foot pieces (teal and tan), checker with letter labels. A tiny orange UV island.
- **10:14–10:18** Pair of tapered lower-leg pieces, each with a stepped, narrower bottom. The UV is a rectangular sheet, selected orange, with menus open (10:15, 10:16). The islands are then moved to the bottom (10:17–10:18).
- **10:19–10:26** Plain white, untextured blocky parts: two tapered boxes, a tall pair, and a side-view wedge (a shoe or boot shape). The UV shows the default cube cross. He appears to be blocking out these pieces from cubes, which look like boots or leg parts.
- **10:27–10:36** Feet and ankles seen from below and the side. Checker letters "C/D/E" are visible. Menus open at 10:30 and 10:35. The foot is selected (yellow) and unwrapped at 10:36 (small orange island).
- **10:37–10:44** Hands. At 10:37 they are still white and untextured, then they get the checker. He unwraps a mitten-style hand with a separate thumb (orange islands, 10:38–10:44). The thigh labels "F4, G6, F6" are visible. Menu at 10:39.
- **10:45–11:20** Packing all UV islands. The full body is in checker with many grey islands scattered around the UV editor.
  - He selects groups (orange), moves and scales them, and drags islands out of the square. Operator or context menus open frequently (10:54–11:01, 11:04–11:06, 11:11–11:12).
  - By 11:15–11:20 the layout is a nearly full, dense grey square. The checker on the model turns pink/purple.
- **11:21–11:36** The model is now shown dark brown/black and flat-shaded. He edits the right-hand panels (11:23–11:31), then opens the File/top menu at 11:32, probably to export or save the UV layout.
  - The UV editor is cleared at 11:33.
  - Texture Paint workspace at 11:34: colour wheel, brush bar, new image. The image shows black with red lines at 11:36.
- **11:37–11:45** Black texture, dark character. He paints skin colour (peach) onto the small face, hand and neck islands. Orange on top of the head at 11:42–11:44. Annotation labels at 11:40.
- **11:46–11:59** Paints the face directly in the 3D view with a semi-transparent line-art reference image behind the head.
  - Order: skin fill, eyes (a closed-eye stroke first, 11:47), brows, nose, mouth, then iris and lashes.
  - He zooms the UV editor to check the face island (11:53–11:55).
  - Hair changes from grey to black (11:56), with pointed side tufts and a fringe.
  - Side-view check against the side reference at 11:59–12:00.
- **12:01–12:04** More face painting at 3/4 view (12:01), then the front view with reference (12:02–12:03). Pulls back to the torso view at 12:04.
- **12:05–12:16** Switches to Material Preview with the shader editor open at the bottom right, so the painted texture now shows. Hair is purple and the outfit black/grey. A large file dialog is open at 12:06–12:09, likely loading or saving the image. Nodes are connected at 12:13–12:16.
- **12:17–12:21** Hair experiments. It turns black with purple ends at 12:17. A white clay view at 12:18. Hair then shows straight bangs with purple sides.
- **12:22–12:24** The face is blank with only marks (dots, lines, an open mouth), as he fixes the placement of the facial features.
- **12:25–12:29** Face complete with purple hair and bangs. The reference plane is visible behind. The UV panel shows the face island zoomed.
- **12:30–12:37** Outfit repaint. White tank top, grey open jacket (12:30), black cuffs or bracers (12:31), orange/black sleeves seen from the side (12:33). The jacket is then repainted red (12:34–12:36). A body reference image is overlaid (line art with necklace).
- **12:38–12:44** Pants repainted blue (jeans) at 12:38, with a close-up of the legs and rolled cuffs (12:39). The UV now has colour blocks (red, blue, black, white, purple). Shader editor with a green-header node; a node add menu at 12:41. Clay/white view at 12:44–12:45.
- **12:46–12:48** A large dark window (preferences or file browser) covers the viewport. The face UV is visible at the top right.

## 2. Topology and technical notes

- **Separate objects:** body parts are clearly separate. Legs, feet, hands, head and hair each unwrap as their own islands and are selected as groups in the UV editor. Mirror use isn't confirmed in the visuals. The leaf-shaped head halves suggest a symmetric (mirrored) head.
- **Limbs:** low-poly tapered tubes or boxes, about 4–6 sides. The lower leg has about 3–4 segments and a stepped ankle. The thigh shows about 3 quad loops (checker cells labelled F4/G6/F6).
- **Hands:** mitten blocks with a thumb, probably 1–2 loops.
- **Feet and boots:** wedge shapes that are blocked from cubes, then unwrapped.
- **Head:** lumpy dome or sphere, about 8-sided. The ears are blended into the hair. The hair is a separate chunky shell with pointed side tufts.
- **Jacket:** boxy, with chunky puffed sleeve cuffs that look like extra geometry on the upper arm.
- **UV workflow:** checker texture with letter/number cells, a single UV square, islands packed manually or semi-manually. The texture starts as a black fill with a painted peach face.
- **Stats overlay, texture resolution, filtering:** not legible in this batch. The painted details look crisp and slightly pixelated at the face scale, but I can't confirm Closest filtering.
- **Material:** a shader editor with an Image Texture node feeding the shader, in Material Preview. I can't read the node names.

## 3. Design notes

- **Face:** hand-painted in Texture Paint over a line-art reference (anime style, resembling Ghost in the Shell's Kusanagi). Large almond eyes with thick upper lashes, grey/lavender irises, angled brows, thin mouth. Skin about #EDB992 (peach). Background black, about #000000.
- **Hair:** jaw-length bob with a straight fringe and pointed side locks near the ears. Colour goes grey (default), then black (#15151a), then purple (about #7B3FA0, with darker top).
- **First outfit:** dark armour or suit with a dark grey chest panel (about #3a3d46) and a lighter slate shoulder panel (about #55596a). Chunky black puffed sleeve cuffs.
- **Second outfit:** red cropped jacket (about #D9453F), white tank (#EEEEEE), black or grey bracers, blue jeans (about #3D5FA3) with rolled cuffs, grey/white shoes (about #B5B5B5).# Batch log: 12:49 – 16:00 (s0769–s0960)

This batch is mostly texture painting on a single flat-colour atlas, then a short modelling pass on the neck and collar, then recolouring and checking. The thumbnails are small, so loop counts and numbers are approximate. No stats overlay, tri count or texture resolution value is legible in this batch.

## 1. Timeline

```
12:49-12:53  Blender with a file/image dialog open. Then Image Editor / Texture Paint view of the UV atlas, already filled with flat colours: skin, purple hair, red jacket, white, blue pants, grey (shoes/gloves?) on a black background.
12:54-13:01  File browser open over the atlas (loading or saving an image). The dialog stays up for about 8 s while he navigates folders.
13:02-13:09  Workspace is split: zoomed UV/face island on the left, 3D viewport with the head on the right. A Shader Editor opens at the bottom (s0784-0786). He starts painting the eye on the face island: outline, then a brown iris.
13:10-13:12  Iris recoloured bright green. The brush/palette panel is visible. The 3D head now shows the eyes.
13:13-13:27  Refines the eye in the texture: lashes, upper lid line, eyebrow, small nose and mouth marks. Checks the result in the viewport. At 13:20-13:21 he zooms out to the full body (red jacket, white tank top).
13:28-13:37  Viewport switches to a pale/greyish, pinkish preview (solid, or texture bypassed). The Shader Editor is enlarged and he adds nodes. A colour wheel / colour-adjust node is visible at 13:37.
13:38-13:41  Model goes dark/brown while he tweaks the node values, then returns to normal at 13:40.
13:42-13:43  Zooms out to a full-body view (red jacket, blue jeans) to check proportions.
13:44-13:47  Loads a reference photo of a woman's face into the Image Editor beside the face UV island.
13:48-14:00  Paints/projects the photo face over the flat face texture. The head turns pale and realistic, and the eyes and brows become photographic. He rotates to profile views (13:55-13:58) to check how it wraps, then back to front.
14:01-14:06  More face detail work on the texture: brows, nose, cheek shading. The head is viewed straight on and zoomed.
14:07-14:08  Switches to the body. Upper body shown with a pinkish overlay (selection or wire), and a sketch reference sits behind the model. The image editor shows the full atlas with a colour-wheel panel.
14:09-14:12  Zooms into the jacket sleeve and white tank-top UV islands and paints them.
14:13-14:14  Adds a black choker around the neck and checks the chest close-up.
14:15-14:18  Full-body views: red jacket, white top, blue jeans, black fingerless gloves, boots. UV zoomed on the skin torso patch and red jacket.
14:17  Grey clay (untextured) view of the whole body with UVs beside it, showing the jacket sleeves are puffy and the body is separate from the clothes.
14:18-14:19  Jacket + tank top isolated, then shown on the full body.
14:21-14:24  Legs and boots. UV shows blue pants islands. At 14:23 the lower legs show a light-blue patch (UV/selection test).
14:25-14:27  Jacket recoloured from red to purple/navy. UV of the jacket shown with its wire grid over purple.
14:28-14:52  Modelling pass in grey solid mode on the neck/shoulder/collar. He views the shoulder and neck from side, back and above, with a reference image plane behind. He works on the jacket collar and the back of the head and hair. The hair has spiky tufts at the nape, and the collar sits around the neck. He uses a pop-up menu (Tab / mode or Shift+A) at 14:29 and 14:37. The red lines on the torso are seams or a mirror centre line.
14:53-14:57  Back in textured view: purple jacket, white top, dark choker, purple hair. He checks the profile and the face against the collar.
14:58-15:06  Isolates a jacket piece (sleeve/cuff band or collar) and selects its faces (orange selection) in both the UV editor and the viewport. He rearranges or scales the UV islands for it (purple grid texture, wire UV).
15:07-15:09  Full body with white pants (temporary colour) and the midriff visible, so the top is now a crop top. UV zoomed on the white and skin islands.
15:10-15:14  Crop top plus belly isolated and inspected. The UV atlas is rearranged: white squares, dark outlines, new layout.
15:15-15:19  Pants recoloured dark navy. The atlas is repacked into bigger islands (jacket, pants, face).
15:20-15:21  UV zoomed on the pants/jacket islands, showing white seam outlines and a grid-patterned purple texture.
15:22-15:33  Hair painting: zoomed UV hair island in bright magenta/purple. 3D checks of the hair from front, side, top-down and back, and the collar in lighter lilac.
15:34-15:36  Full body front view with midriff, jacket open, dark navy pants.
15:37-15:53  Orbit checks of the jacket from the side and back: sleeve, pocket detail, rolled sleeves. A reference plane is behind the model.
15:54-15:58  Back views of the jacket and hair, and a distant view. Small touch-ups.
15:59-16:00  Pixel-level zoom into the UV at the white top / skin edge, doing a texture touch-up.
```

## 2. Topology and technical notes

- **Texture workflow:** one shared atlas holds all body parts (face, hair, jacket, top, pants, gloves, boots). It starts as flat colour blocks and is hand-painted in Blender Texture Paint with the Image Editor beside the viewport. The 3D viewport shows the painted texture live.
- **Filtering:** the pixel zoom at 15:59-16:00 shows hard square pixels, so the texture is shown with Closest (nearest) filtering. The node setup is not readable, but a Shader Editor with a few nodes (Image Texture → BSDF/Emission, plus a colour-adjust node) is present at 13:28-13:40.
- **Texture resolution:** not legible. The pixels look chunky, so the atlas is likely low-res (e.g. 256-512). Verify this.
- **Head:** low-poly with a flat, simple face. The jaw and cheek planes are angular, and the face UV island is large, covering about a quarter of the atlas.
- **Ears:** pointed elf-like ears are visible in the front view (13:12 and 13:48 onwards).
- **Hair:** a separate-looking shell of chunky wedge tufts. It has a bob-like cap with side locks and spiky points at the nape. Roughly 10-15 angular tufts. It looks like one object, with its own UV island.
- **Neck and collar:** modelled in this batch with a choker ring, a separate collar flap and a turned-up collar at the back. These are likely extra loops or separate meshes. The red line down the torso in solid view suggests a mirror seam or edge-mark line.
- **Jacket:** separate from the body. Sleeves are puffy and cropped at the elbow (about 3/4 length), with a ~2-3 loop cuff band as a distinct UV island (selected in orange). Its UV shows a quad grid, roughly 6-8 rows.
- **Top:** a tank top that becomes a crop top (midriff visible from 15:07). It is a separate shell with a skin-coloured belly patch on its UV.
- **Pants and boots:** pants are separate, with low-poly boots, and the pants UV is a mirrored half or leg islands. Gloves are fingerless black.
- **Objects:** clothes and hair are separate meshes over a body base. A reference image plane sits behind the character in the viewport.

## 3. Design notes

- **Skin:** flat ~#E0B088 at the start, then replaced by a photo of a real woman's face, pale and slightly desaturated (~#D9C0B0). The photo is cropped to the face UV island, and its eyes and brows are visible.
- **Eyes:** green iris ~#3CC050 with dark lashes and lid line.
- **Hair:** purple. Early ~#4B2A72, final brighter magenta-purple ~#8A2FBF. Short, angular, with side tufts.
- **Jacket:** first red ~#C03030 with a lighter inner lining. It is then recoloured to deep indigo/navy ~#3A2F6B, with a lighter lavender collar ~#7B62C0.
- **Top:** white ~#F0F0F0, tank top first and then crop top.
- **Pants:** blue jeans ~#2F4A8C first (with lighter blue knee/shin patches at 14:23), then dark navy ~#1E1E40.
- **Accessories:** black choker, black fingerless gloves, dark boots.
- **Overall look:** a Motoko Kusanagi / Ghost in the Shell style character. A hand-drawn sketch reference stands behind the model for proportions.# Batch log: s0961–s1082 (16:01–18:02)

Frames are small, so counts and hex values are approximate. Anything I couldn't read is marked "unreadable".

## 1. Timeline

```
16:01-16:04  Texture painting on the neck/chest area. Image editor on the right is zoomed to pixel level on the purple jacket / white top / neck. He paints a thin dark necklace chain, then a gold pendant dot (visible at 16:04). Color wheel open.
16:05-16:08  Viewport zoomed to waist/belt and hand. Image editor shows the face + atlas islands; he is inspecting the UV islands, not painting.
16:09-16:11  Image editor shows the full atlas layout (UV islands). A grey fine-grid pattern appears on one island at 16:11, probably a UV/test-grid check.
16:12-16:14  Head in side/3/4 view. Image editor shows the hair island (dark indigo with lighter strand marks). Hair mesh seen solid purple, pointed ear visible, lilac collar, black choker, necklace.
16:15-16:21  Hair shown semi-transparent lilac with wire overlay, orbiting front/side/back. He is checking the hair shell shape and UV/texture mapping on it.
16:22-16:24  Zoom out to the full head/torso with a grey reference plane behind. Image editor switches to the ear skin island.
16:25-16:27  Paints/shades the ear in the image editor (brownish soft shading on the skin island, big pixel blocks).
16:28-16:43  Image editor stays on the ear while he orbits the viewport: jacket displayed grey with a dense grid (16:28-16:34), views from below/under the chin (16:35-16:37), sleeve/cuff (16:38), front torso with open jacket and crop top (16:39-16:40), then pulls back to full body with the reference plane (16:41-16:43).
16:44-16:45  Front view; image editor shows the atlas (face, white top, jacket pieces, grey jacket island).
16:46-16:53  Layout changes to a texture-paint layout: large image editor on the left with the face zoomed in, small 3D viewport with the character, tool/brush palette strip on the far left, color wheel icon bottom-left. Paints eyes, brows, nose and lips. Zooms to pixel level at 16:53.
16:54-17:08  Whole atlas shown on the left while the character stands in T-pose (arms out, open jacket). Small tweaks and checks. A floating panel appears around 17:04 and a pixelated face zoom at 17:05.
17:09-17:15  Different scene/file: grey untextured mannequin-style body in T-pose with a properties panel. An upper arm is highlighted orange at 17:10. Top-down view at 17:12-17:14, then the mannequin is shown smaller at 17:15.
17:16        Textured character shown with an armature/skeleton overlay in the T-pose, so rigging begins.
17:17-17:27  Textured T-pose character with the viewport maximised and the properties panel on the right. He clicks through panel dropdowns (17:19), and a small popover with a sphere icon opens at 17:25-17:26. At 17:27 the viewport background turns lighter grey with a horizon line.
17:28-17:46  A node editor opens along the bottom. He builds a short node chain: 2 nodes, then 3, then ~5 (red-header, teal, purple, green, red-header at the end, joined by a yellow-ish wire). Add-menu/search dropdowns at 17:30, 17:34 and 17:35. Node labels are unreadable.
17:47-17:50  Node editor closed. Character zoomed in; properties panel scrolled (long list).
17:51-18:00  Character plays a walk animation (profile and 3/4 views). The properties panel now shows blue-highlighted sections.
18:01-18:02  Back to the T-pose, front view.
```

## 2. Topology / technical notes

- **Stats overlay:** no tri/face/vert counts are legible in this batch.
- **Texture resolution:** no resolution numbers are readable. The atlas is clearly very low-res, since pixel blocks are huge when zoomed on the face, ear and necklace.
- **Atlas layout:**
  - Face (top-left, large, ~25% of the atlas).
  - Ear island next to it.
  - Hair islands (dark indigo with lighter strand marks).
  - Several purple jacket pieces, a white crop-top piece, and a grey piece (jacket).
  - Hands/skin patches.
  - Large black background areas.
  - Neon magenta/purple cloud-like noise areas are visible in the black space of the atlas.
- **Filtering:** the image editor shows hard pixel blocks (Closest-like display). The viewport filtering setting is not confirmable from the frames.
- **Separate objects:**
  - Hair is a separate shell, since it's displayed on its own in lilac see-through.
  - Jacket is a separate mesh over the white crop top. The open jacket shows the top underneath, and sleeves are rolled to about 3/4 length.
  - Gloves are separate black fingerless pieces.
  - The body is likely a separate object, but this isn't certain.
- **Jacket density:** the grey grid view suggests an evenly spaced quad grid, roughly 10 or more columns across the torso.
- **Hair:** a low-poly shell with about 6–8 visible edge rows, hugging the head with side-swept bangs and a short back.
- **Mannequin (17:09–17:15):** a grey body in T-pose with segmented limbs. It is probably a base or rig reference, and it's unclear whether it is his own mesh.
- **Rigging:** an armature overlay is visible on the character at 17:16, then the character walks, so it is skinned/weighted and animated by 17:51. I can't tell whether the walk is his own animation or an imported one.
- **Material/nodes:** the node editor's chain of ~5 nodes ends with a red-header node. It could be a shader or geometry-nodes setup, possibly the PS1 vertex-snap/wobble effect, but the labels aren't legible so this is only an inference.
- **Mirror modifier:** none visible in this batch.

## 3. Design notes

- **Outfit**
  - Cropped open jacket in dark indigo purple (~#3A2D6B), with a lilac turned-up collar (~#8F7CCB) and rolled sleeves.
  - White crop top (~#E9E9EF) with a bare midriff.
  - Navy pants (~#1F1D3D) with a dark belt that has small tan/gold studs.
  - Black fingerless gloves.
  - Black choker.
  - Thin chain necklace with a small gold pendant (~#C9A53A), painted at 16:01-16:04.
- **Hair:** saturated violet/purple (~#8A3FB5, with darker strands), short and choppy, swept to the side. It reads as light lavender in the see-through display.
- **Ears:** pointed, elf-like, with brown shading painted in.
- **Skin:** warm peach (~#E3B592).
- **Face:** realistic-looking painted/photo-sourced face (grey-brown eyes, defined lips and brows) on a very low-res texture. The source image is not shown in this batch.
- **Reference:** a grey reference plane sits behind the model in the viewport between 16:22 and 16:45. It is a sketch/line drawing and not readable.