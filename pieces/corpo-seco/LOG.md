---
type: note
status: active
tags: [corpo-seco, yokai, storyboard, qa, ox-cart, creature]
relatedTo: [pieces/inunaki/LOG.md, pieces/umibozu/LOG.md, pieces/behemoth/LOG.md, styles/yokai/STYLE.md, pieces/corpo-seco/brief.md]
---
# LOG — corpo-seco

## 2026-10-28 — first build up to the storyboard
- Structure from pieces/inunaki (piece.json build list, head, scenes, the point rig with two-bone IK, jointed fingers and the fitted grip, holdProp, ykPara/ykCard/ykBadge). World, textures, creature and shots are new.
- Kit (styles/yokai/kit.js): added the glyph `ã` (Tião) to the pixel font, and 屍 to the early font request for the seal. No other kit change.
- Card: new Flow project, three earlobe card prints uploaded as style refs, Nano Banana Pro 4:3, one image per call. #1 skeletal (bones, not leather), #2 good but generic, #3 kept: a long-armed dried corpse leaning out of a dead tree by a road under the moon, an ox-cart lantern down the road. Paper border cropped → assets/print.jpg. Seal 屍 (one glyph, original 9u square).
- Rig additions: `headAt` (place a head at a world point, the neck stretches to it), per-hand `gripA` and `gripFitR(P, r)` (a looser fitted fist round a thicker bar, used for his hand round its forearm), `thumb` override, finger `spread`, kinds man / tiao / woman / corpo.

### Creature self-check (isolated, front / 3/4 / side / face close-ups) — fixed before any board
- First head read as a cute puppet: a round ball, big round white eyes, a cartoon smile, the mouth cavity sphere in FRONT of the teeth (teeth hidden). Fixed: narrower skull with sunken temples, cheekbones and hollow cheeks, a narrow lower face, sloping forehead, uneven lumps; deep oval sockets with a tiny dim glint; collapsed nose hole; the mouth cavity moved behind the teeth; teeth narrower with gaps, mixed yellow-brown tones, two broken; upper row hangs from the gum, lower row stands on the hinged jaw, both on the arc inside the lipless mouth; jaw slightly askew; hair only at the back.

### QA found and fixed (stills per beat, numeric pass every 0.25 s, consecutive-frame scan)
- `TD`/`CD` (tree / cart directions) used transformDirection, which normalises: every offset built with them was 1 m long. Now a quaternion rotate.
- Hook: the slit was a doorway and the creature a dark shape deep inside. Slit narrowed (0.52 rad), body leaned forward so the face sits in the slit, a narrow key on the face, camera closer (fov 44). Hands: first on the outer bark (forearms went through the wall), then hooked over the lips (thumb in the wall). Now the palm lies on the slit's side face and the long fingers curl round the lip onto the bark, thumb turned out. Trunk check: no hand, finger, arm or knee inside the wall.
- Beat 6 (a hand slipping into the bark) was unreadable at phone size → it sinks back into the trunk: the face turns away, the fingers uncurl first, slide straight back through the slit, then fold away inside (pulling a hooked hand straight back went through the lip). Checked every frame 29.6–32.6: clean.
- The hit: the creature was hidden behind him and its arms went through his. Rebuilt: its body parallel to his spine 0.23 m behind it, its head placed beside his (headAt), arms round his flanks with the palms flat on his chest, knees jutting out round his hips; his right fist closes round its forearm (looser fitted grip). Capsule/ellipse body check (creature vs man): from 16 contacts (fingers 1–2 cm into his torso, forearms through his upper arms) to none.
- The cart: oxen read as white blobs, the camera sat inside an ox, the lantern hung at the oxen's chests under the paragraph. Brown zebu with one smooth body (hump, chest, rump in one deformed sphere), a longer face, pale horns; lantern on a post on the yoke; cameras moved.
- Grandfather seated with crossed legs and the goad in the wrong side (cart +x is his right). Fixed; the climb-down is keyframed (stand, step to the right edge, a short jump with both feet, land crouched) — feet never through the bed (checked per frame 41.5–43.2).
- House: the mother sat inside his shadow and could not be seen → a low fire glow from the stove; camera from the front-right so his raised arm and its shadow over her read together. Mother's feet were 11 cm under the floor (kneeling feet pointed down) → feet lie on their tops.
- Grave: the chapel's shadow covered the cemetery (light from behind it), the grass hid the coffin, the coffin sat under the paragraph → light from the front-side, short grass round the grave, camera behind the coffin with the chapel door behind it. Coffin and lid were 3–7 cm into the ground → raised.
- Dawn: the lantern was under the paragraph → camera aimed at it, oxen above. Bark faces were lost in the bark noise → lighter face bark, a side key, bark texture contrast lowered.
- Card seal: the 屍 raster at 7×7 came out as a solid blob at every weight/threshold → ykSeal (styles/yokai/kit.js) now takes hand-drawn 7×7 grids for dense kanji (`YK_SEALG`, 屍 drawn: the 尸 frame over 死). Other glyphs still rasterise as before.
- Lantern flicker: the first scan flagged 36.9–38.5 (cell spikes 70–100, the man and sack flipping between toon bands). Two causes: a fast flame flicker (×0.83–1.01 at 23/61 Hz), which three toon bands turn into whole surfaces popping, and the yoke post / hook right beside the point light, whose shadows swept the man with every swing. Flicker now ±4 % at 5–9 Hz, the lantern's tin parts and the post/hook cast no shadow. A comment I put on the lantern line swallowed the rest of it (the light went to NaN) — caught on the board, fixed.
- Climb-down → walk at 43.0 popped (he turned 70° in one frame) → the jump's facing, head and left hand now blend into the walk over 42.6–43.0.

### Final QA before the board
- Numeric pass every 0.25 s over the whole piece (cameras vs ground / room / trunk / cart / oxen / heads; arm and leg IK reach; feet on ground, on the bed, in the hollow; crossed hands; any mesh under the ground; goad in the fist; goad / lantern / coffin / lid above ground; creature vs trunk wall; creature vs man and Tião vs mother capsule checks; the man through the bed; hooves and wheels on the ground): **clean** ({}). Plus per-frame passes over 29.6–32.6 (the withdraw), 41.5–43.2 (the jump) and 45.6–56 (the hit): clean.
- Consecutive-frame scan of all 1703 frame pairs (108×192 grey diff + worst cell, local-median ratio): the only spikes are the planned cuts (14.6, 20.6, 26.6, 29.6, 32.6, 35.6, 38.6, 41.6, 45.6, 50.6, 56, 63), the hook fade 4.3, the card in 4.8, the badge 66.2. No pops inside shots.
- Text check: PASS (0 cut-off/overlap, 0 in the safe zone).

### Still weak (honest)
- Panel 8 (the cart at night): the lantern, oxen and cart read, but grandfather is a small dim figure behind the lantern glare; panel 9 carries him.
- Panel 3 (the house): reads as a silhouette scene; the mother is small and her pose (kneeling, hands up) is hard to read at phone size.
- Panels 12/13 (the hit): it reads, but the man's face is a flat texture (no modelled features) and his hat sits high; the creature's left arm crossing his chest is partly lost in the checks of his shirt. Panel 13 has the creature small at the edge of a wide shot.
- Panel 15: the two bark faces read, but his face (open mouth + moustache) is less legible than the grinning one.
- People are low-poly capsule figures like inunaki's, not detailed; hands in the hit are the creature's spread fingers on his chest, readable but not close-up quality.

## 2026-10-29 — round 2 (user notes on the board)
- Bark: new `texDeadBark` — sun-bleached warm grey-brown sertão wood, fine fibres, dry cracks along the grain with bleached lips, knots, low contrast (the old one read as birch zebra noise). Used by the hero tree (panels 1, 7, 15) and all dead wood.
- Hook (1): the trunk is split wide (gap ×1.45), the creature leans out (out 0.36), head, shoulders, rib cage and the long fingers on both lips fill the upper half (~45 % of the height) above the paragraph; the moon and a rim light sit behind its head. Trunk-wall check clean.
- House (3): Tião in an ochre shirt over his mother; she kneels upright on the floor in a dark blue print dress, palms up between her face and him; the lamp spill (a warm spot) and the stove fire light both; camera lower and wider so both figures sit above the text. Lamp flicker made gentle (toon-band pops).
- Grandfather's face: a modelled head (`mkManHead`) — lean skull with brow ridge, cheekbones and hollows, long nose, eyes with lids, grey brows, ears, a thick grey moustache, an opening mouth with teeth — on a weathered skin texture (forehead lines, crow's feet, nasolabial folds, grey stubble, age spots). `faceExpr(fear)`: eyes wide, brows up, mouth open; fear 1 in the hit. His shirt is now a plain light cotton so the dark leather arm across his chest reads.
- Panel 13: camera 1.3–1.45 m from them, lower; the two figures fill the frame above the text.
- Two faces (15): the Corpo-Seco's own dried brown grinning head, and grandfather's modelled head in dried leather with his moustache, open mouth and the brim of his hat, side by side in the shut trunk above the paragraph, lit by a side key.
- Panel 8: camera from the front-left above the oxen; he sits lit on the bed with the lantern in frame; glare sprite halved, a warm spill on him.
- QA: numeric pass every 0.25 s over the whole piece: clean. Consecutive-frame scan (1703 pairs): spikes only at the planned cuts, the card in (4.8) and the badge (66.2). Text check PASS.

## 2026-10-29 — round 3: approved board → final
- Panel 15: both faces now sit inside the trunk. Their backs and sides are hidden behind the bark surface, and their depth is flattened to shallow relief. Torn bark lips of varying thickness fold over each face's edge, fibrous bark strands cross the creature's brow and cheek, and his hat survives only as a heavy ridge of bark over his brow (no brim). The creature's face is its own dried brown grin; his is the modelled head in dried leather (moustache, open mouth).
- Panel 3: the camera moved back and widened, so Tião's raised fist and strap are inside the frame.
- Grandfather's face: dark sunken sockets; smaller, narrower eyes with the upper lid half over the iris; fear now shows through raised inner brows and a wider open mouth instead of wide round eyes.
- QA on the changed spans: numeric pass every 0.25 s over 8.5–71 s is clean; the frame scan of 8.5–14.6 and 45.6–71 shows only planned cuts.
- Export: renders/final.mp4 + renders/share.mp4 (1704 frames, 71.0 s).
- Sound ("sonido pro", sound/mix.py, sound/CREDITS.md):
  - **Sources:** 28 Freesound CC0 recordings picked with earshot (rank → find → realness) and a Commons wind bed. The code layer adds drones, the card bell, the hit's boom and a dissonant cluster, the fence-wire hum, the badge chime and whooshes into the cuts.
  - **Synced to the picture clock (numbers from run.js):**
    - **Cart and oxen:** the carro de boi song (36139, a real recording, taken from its 10–16 s region with no speech in it) and the cart's rolling are cut hard on STOP_T 38.9 with a wooden clunk. Every hoof contact of every ox leg is a recorded hoof grain, computed from poseOx's gait. The balk stamps fall on the stamp cycle.
    - **Props and steps:** the lantern clinks at its swing extremes, and the bell strikes at the bell's swing extremes. The bed creaks under his steps at 41.95, 42.1 and 42.45 and he lands at 42.72. His walking steps follow walkMan's foot contacts.
    - **Creature:** bark creaks on the hook turn and on its sinking back into the trunk; a dry crack on the head jerk (23.6).
    - **The hit and after:** the bark split, a bone crack and a boom at 45.6, then its rasp, the oxen bellowing, the lantern torn off the yoke and landing at 51.8, and a creak as its head turns (53.2).
  - **Fixes during the mix:**
    - True peak was −1.2, then −0.7 dBTP after AAC: the strap whips and the fire crackle had sharp highs. Low-passed them and lowered the limiter.
    - The cart song and the hooves were louder than the hit (loudest 100 ms at 36.75 s). Evened out the song's squeals, lowered it, and removed the auto-gain boost from the cart scenes.
    - The card (4.5–7.5) and the chapel bells (16–19) out-loudnessed the hit in short-term LUFS. Lowered them.
    - The dawn didn't decay (story-arc FAIL). Lowered the birds and removed the auto-gain boost from the dawn.
    - Highpass at 32 Hz on the master: the sub share was over the reference range.
  - **Final:** −14.9 LUFS, true peak −2.0 dBTP (AAC), exact digital silence 45.0–45.6, loudest 100 ms at 45.6 s, loudest 3 s at 45.75 s.
- QA on the final file:
  - **review.mjs:** story arc 5/5, text PASS, dead beats PASS, cuts PASS. The flat frames are only the planned ones: card out, the black at 45.0–45.6, the dawn dither in and the last frame.
  - **earshot timeline:** 88–90 % of the picture cues have an onset within 100 ms; the cart stop (38.9), the landing (42.7), the hit (45.6), the lantern landing (51.8) and the head turn (53.2) all land. No recording plays its own event at the wrong time (the carro de boi file's speech section is not used).
  - **earshot critique:** 20/23 in range, realness 0.90. The remaining flags are the launch-film ones (music presence, onset density), ignored per the yokai rules.
  - **Frame scan of the final mp4 (1704 frames):** only planned changes (cuts, the card dissolve 4.8, the badge 66.2, the head turn 53.2).
