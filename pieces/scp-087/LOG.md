---
type: note
status: active
tags: [scp-087, yokai, storyboard, qa, stairwell, school]
relatedTo: [pieces/teke-teke/LOG.md, styles/yokai/RULES.md, pieces/scp-087/brief.md]
---
# LOG — scp-087

## 2026-11-16 — first build up to the storyboard (~95 min; the goal was 30–45)
- **Reused** from pieces/teke-teke/src:
  - the helpers and person rig (`poseP`, two-bone IK, grips, `holdProp` / `wristFor` / `barHand`);
  - `walkP` / `gaitFeet`;
  - `stutT` / `jerk`;
  - `flick`;
  - `ykPara` / `ykCard` / `ykBadge`, the render path and the toon conversion.
- **Dropped:** the snowy town, the girl, the boys and the train.
- **New:**
  - the hall set and the well set (`mkHall`, `mkWell`, `stairY`, `setNums`);
  - the Thing (`mkThing` / `poseThing` / `texThingFace`);
  - the janitor (cap, uniform, older face via `mkPerson` options `cap`, `old`);
  - the flashlight (`mkTorch`, `torchLight`, `torchFromHand`, `aimHand`, `janWalk`) and its beam cone;
  - the mop;
  - the stairwell bulbs (`setBulbs`);
  - stair-aware gait (`stairs: true`), plus `grip`, `hdir` and `epole` overrides in `walkP`.
- **Kit:** 階 hand grid in `YK_SEALG`; 階 added to the early font load.
- **Card:** new Flow project, card1 + card3 uploaded, 3 generations, no Flow errors.
  - #1: a good stairwell print, but the face had a mouth.
  - #2: the red glint and the ofuda door were good, but the face had a mouth line.
  - #3 (kept): woodblock-like, with a mouthless face, a red glint in one socket, the beam from above, B12 / B30 painted and fog. The stair is a spiral, not a switchback. Cropped to the inner frame → `assets/print.jpg`.

### Creature self-check (`review/selfcheck.mjs` → `review/selfcheck.png`: hit view, side, 3/4 low, back, close)
- Nothing floats: the neck joins the skull and chest, the hands sit on the rail, and the feet are on the landing.
- Fixed: the first face read as a cute white egg-mask with emoji dots. It is now greyer, with bigger sunken socket shading, asymmetric tilted sockets with a crack line, hollow cheeks, cheekbones, a narrow chin and a deeper skull (it read as a flat mask from 3/4).
- Fixed: a swollen "seal" bump over the mouth read as lips, so it was removed. A brow ridge read as a white bar across the eyes, so it was removed too.

### Numeric pass (`review/scan.mjs num`, every 0.25 s; results in `review/scan.json`)
- **Checks:**
  - the camera in walls, landings, treads or the hall;
  - feet height over the stair or floor function in use (`P.gfNow`), and feet or knees in solids;
  - arm overreach, hands in solids, head in solids, the camera in his head, the torch at the lens;
  - the Thing's head, hands and feet in solids, and the Thing at the camera;
  - foot slide while grounded.
- **Found and fixed:**
  - run cuts: he ran into the top landing's end wall (speed 2.25 → 1.85 m/s);
  - run camera: it went inside the end wall and inside the underside of the flight above (clamped and lowered);
  - stair swing feet up to 0.66 m (stair lift and arc lowered);
  - the mop grip overreached (grips moved up the handle, smaller swing);
  - the free arm overreached after a hand-lowering fix.
- **Remaining:**
  - 25.25: foot slide 1.9 cm in the stop half step (the teke-teke stop blend);
  - the first running step of each cut clears the treads by 0.46 m (a two-riser leap).

### Frame scan (`review/scan.mjs scan`, every 2nd frame; `review/framescan.json`)
- **Spikes:** the planned torch drop-outs (1.55–1.8, 43.55–45.0, 48.9), the cuts, the bulb flicker (stair descents) and the run shot (the beam swinging, cuts every 1.75 s).
- **Found:** the run frames were near black, then flashed when he reached the camera at the top landing. Rebuilt as a follow camera behind him, with the beam lighting the steps and the landing number ahead.
- **Found:** in the door shot he walked past the camera (a body near the lens). The camera now starts behind him.
- Bulb point lights halved (the descents strobed hard).

### Visual pass fixes
- Hook: the camera moved off the near rail (it was a bright slab across the frame); the face is placed at 30 % from the top; the beam is narrowed to the face (the body read as a stick figure).
- B1 / B30: the camera moved behind him on the landing side so he and the lit number are both in frame (he was out of frame).
- Reach: rebuilt as a POV (his back filled the frame and the torch was at the lens).
- B12: a fill light on him.
- The torch is held at hip height with a backward elbow pole (the elbow stuck out like a chicken wing).
- Panel 11 moved to 43.75 (44.0 fell on a blackout frame).

### Weak panels (honest)
- **Panel 5 (19.0):** once he stops, the beam does not land on the door; the door reads dark, and he sits at the right edge.
- **Panel 7 (26.1):** B2 / B3 are never shown (B3 sits under the landing slab from every angle that worked). Only B1, then later B12 / B30, are readable.
- **Panel 13 (52.6):** his arm is a black "<" silhouette over the beam. The run reads mostly as a back view; the stairs read better in panel 14.
- **Panels 1–2:** the far face is small (about 13 % of the height) before the jump; after the jump it is about 30 %. The Thing's arms on the rail look stick-like in panel 1.
- **Panel 9 (B12):** a close, cluttered rail across the frame.
- **Panels 15–16:** the mop reads small; it is a static dawn wide shot.
- The janitor's face is rarely seen (back and silhouette shots).

## 2026-11-16 — user board review: 5 points, board only (~40 min)
1. **The face:**
   - The skull geometry is baked and deformed: one cheek caved in, the jaw skewed and narrower than the cranium, the temples pinched, a brow ledge and a lumpy outline.
   - Grey-yellow matte skin (roughness 0.95, no emissive): mottling, pores, veins at the temples and round the sockets, and the mouth sealed over with a ragged seam and radial pucker folds.
   - Uneven sockets with wet raw rims and the red glint deep inside; cheekbones; 16 thin lank strands at the sides and crown (gravity chains that drape over the skull); the neck runs from pale to dark into the body.
   - The flashlight now comes from above the camera at lower intensity, so the brow and cheekbones cast shadows.
   - Hook: fov 21.5 → 19, so the face is about 20 % of the height before the jump and about 35–40 % after.
   - The fingers have knuckles, a thumb and nails, are thicker, and curl over the rail.
2. **The janitor:**
   - Lighting: a bounce light from the beam spill (`torchLight` places `Wd.bounce`), stronger camera-side fills.
   - Arms: sleeve volume over the upper arm and forearm (`a.bu` / `a.fb` in `poseP`).
   - Faces: the hall shot is now frontal with his face lit (cap, stubble, a worried expression, `setFear` 0.3); run panels 14–15 show his fear face.
   - Dawn: he faces the camera and mops with a torso twist, weight shift, roll and a mop-head yaw.
3. **The door:** he stops 1.9 m from it; the beam is aimed from the lens position (`aimAt`) and lights the door, sign, plate and ofuda.
4. **B1, B2 and B3:** three cuts (`descend(fl)`), each with the beam finding the number of the landing below. The numbers are now dark paint, which reads in the beam (pale paint washed out).
5. **The run:** a 3/4 front view of him running up toward the camera from the landing above, with his fear face, the beam swinging and the numbers falling (B87 → B60 → B34 → B9).

### QA
- Numeric pass clean after a mop-grip fix (the right arm overreached).
- Self-check `review/selfcheck.png`.
- Frame scan spikes: the planned torch blinks (48.9, 43.5–45), the bulb flicker on the descents, the run cuts, and 18.25 (the beam settling as he stops at the door).

## 2026-11-16 — user: the janitor looked like a doll → rebuilt (`mkJanitor` in src/beings.js), board only (~45 min)
- **Body:**
  - The jacket torso is a profiled mesh (`profTorso`): hips, a slight belly, a shaped chest and back with shoulder blades, sloped shoulders and the trapezius rising to the neck.
  - Shoulder joints (`shW` 0.15) sit inside the torso volume, under deltoid spheres. Sleeve volume over the upper arm and forearm, a cuff, and `mkHand` hands (4 fingers and a thumb).
  - An upright hips group (`P.Hp`, posed in `poseP`), so the torso bends and twists over the waist.
  - The head is scaled 1.1, making him about 7.5 heads tall.
- **Clothes:**
  - A loose grey-blue work jacket (folds, zip, chest and hip pockets, a 用務 name tag, a turned-down collar), belt and key ring.
  - A checked tenugui round the neck; work trousers; rubber boots with shafts (`l.boot` in `poseP`).
  - A plain navy work cap: the crown sits on the skull, with a band, a curved stiff brim and a button.
- **Face:**
  - A deformed skull: narrow jaw, full cranium, eye sockets, brow ledge, cheekbones, nose bridge and tip, lips, chin and hollow cheeks. Ears and nose wings.
  - Eyeballs with brown irises, pupils and catchlights; upper and lower lids; two-part brows.
  - Texture: shaded skin, grey stubble, nasolabial folds, crow's feet, eye bags, forehead lines, and short dark-grey hair greying at the temples.
  - Expressions come from a real mouth: the head mesh is split along a slit and a jaw blend rotates the lower face, with upper and lower teeth and a cavity. `setFear` gives:
    - 0: tired (heavy lids);
    - 0.5: worried (brows up and in, eyes open);
    - 1: terrified (eyes wide, brows up, jaw open showing teeth).
- **Self-check:** `review/janitor.mjs` → `review/janitor.png` (front, 3/4, side, back, the 3 expressions, an 8-frame walk strip).
  - Fixed: the cap crown and brim covered the eyes (raised to the forehead).
  - Fixed: the lids were closed (wrong rotation sign).
  - Fixed: the teeth poked through the lips (sunk).
  - Fixed: the mouth looked open at rest (jaw 0 when neutral and worried).
  - Fixed: boxy shoulder pads (narrower profile).
  - Fixed: blush-like eye bags.
- **QA:**
  - Numeric pass 8.5–71: clean.
  - Frame scan on his spans: only the planned torch stutter, the bulb flicker, the run cuts and the door stop (18.25).
- **Still weak:**
  - At board size his face reads small and flat under the grade (panels 4, 14, 15).
  - The open mouth reads a little like a grin.
  - The cap brim is thin from the front.

## 2026-11-16 — approved board → export, sonido pro, final QA, delivery
- **Tweak:** the terrified mouth was taller and rounder, with the corners pulled down (blends `wC` / `wU`), so it no longer reads as a grin.
- **Export:** `export.mjs --share` (1704 frames).
- **Sound** (`sound/`):
  - 24 Freesound CC0 query folders (key via `zsh -ic`) plus the Commons wind. Picked with earshot (`pick.py`); manual swaps are noted in CREDITS.md.
  - `review/events.mjs` reads the cues from the picture into `sound/cues.json`: heel strikes, the bulb level, the torch level and the Thing's snaps.
  - The mix follows that clock:
    - steps by surface (linoleum, stairs with concrete reverb, the run);
    - keys on the hall walk;
    - a click on every torch drop-out and return;
    - the bulb buzz gated by the live bulb's level, with a tick on each jump;
    - the child crying far below (heavy reverb), cut mid-sob at 43.2;
    - neck creaks on the Thing's snaps;
    - whooshes on the B2/B3 and run cuts;
    - the steel door slam at 20.62;
    - a mop swish on every swing peak and the wringer;
    - crows;
    - the crying under the tiles (low-passed) from 65.6.
- **The hit:** exact digital silence 45.0–45.6; THE HIT (45.6) has a sub drop, an impact and a cluster.
  - It is the loudest 100 ms and the loudest K-weighted momentary window; the master has a new momentary guard loop.
- **Final:** −15.2 LUFS, true peak −3.9 dBTP after AAC, LRA 10.8.
- **QA:**
  - review.mjs: story arc 5/5, text PASS, dead beats PASS.
  - earshot timeline: 96–98 % of the picture cues have an onset within 100 ms (median 11 ms).
  - earshot critique: flags music presence, onset density and cut sync (launch-film metrics, ignored); realness p_real 0.87.
- **revisar_render:** NO LISTO, mostly about the 40 s rule (the user approved 71 s).
- **Fix round (one):**
  - hair painted solid on the back of the janitor's head;
  - the POV shot re-aimed off the floor;
  - the B12 camera moved off the rail (frontal, head in frame);
  - the dawn shot reframed (full figure, mop on the tiles);
  - the hook beam cone softened.
  - Then re-exported and remuxed; the numeric pass and frame scan on the changed spans are clean (only cut-boundary false positives).
- **Delivered:** `/Volumes/alanwork/trabajo/Renders finales claude/Kodama yokai/The Stairs That Only Go Down.mp4` (share, verified with cmp), plus the thumbnail `Miniaturas/The Stairs That Only Go Down.png` (the Flow print). `renders/` keeps only the master `The Stairs That Only Go Down.mp4`.
- **Left as minor:**
  - a dark round shape left of the face at 50.6 (the Thing's shoulder/arm in shadow);
  - hard-edged flashlight discs;
  - hips and the torch hand under the paragraph in some stair shots;
  - the card print at about 150 px wide;
  - the run's first step clears the treads by 0.45 m.
