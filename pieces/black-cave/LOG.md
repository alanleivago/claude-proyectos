---
type: note
status: active
tags: [black-cave, yokai, storyboard, qa, cave, crawler]
relatedTo: [pieces/gashadokuro/LOG.md, styles/yokai/RULES.md, pieces/black-cave/brief.md]
---
# LOG — black-cave

## 2026-11-05 — first build up to the storyboard (speed run, ~30 min)
- **Reused:** pieces/gashadokuro/src, which provides the rig (poseP, two-bone IK, jointed fingers), grass, textures, ykPara / ykCard / ykBadge, the render path and the toon conversion.
- **New:** the three sets (EXT, CHAM, SEC), `wallMesh` (a displaced rock face with a pushed-back mouth or crack), the cutaway, the pale crawler, `mkPerson`, `walkP`, `crawlP`, the headlamp and `broken()`, and the textures (limestone, wet rock, sign, concrete, ofuda, wax, rust). Gashadokuro's set, skeleton, girl and chōchin were dropped.
- **Kit:** added a 洞 hand grid to `YK_SEALG` and 洞 to the early font load.
- **Card:** a new Flow project with card1 + card3 uploaded. The first two generations failed with Flow's "unusual activity" error. Then #1: a crawler with eyes and a stray stripe from card1, so it was rejected. #2 matches the design (eyeless, long fingers, teeth, shimenawa and ofuda, the headlamp in a hanten) and was kept.

### Creature self-check (isolated: front, 3/4, side, mouth close-up; `review/selfcheck*.png`)
- The mouth cavity stuck out below the snout as a black blob, so it was shrunk and moved inside the head. The skull is longer and narrower.
- In the grip and hit shots the neck ended at a bare point, so the torso is now shown down the crack and the neck joins a body.
- The teeth are inside the mouth and the right way up: the upper rows point down, the lower rows point up from the jaw.
- The arms connect shoulder → 6 segments → palm → fingers, with no floating parts.

### QA found and fixed
- **Everything in the cave read black:** the wet-rock map × colour × vertex colour compounded to about 2 % linear. The base textures and colours were brightened; darkness now comes from depth (vertex colour) and fog only. The brother's hanten is a lighter indigo so he separates from the crack.
- **Fingers curled up:** the curl axis had the wrong sign. In the hook, the hand was then lowered until its fingertips touched the floor, which put the hand under the floor.
- **Headlamp beam into the rock in the cutaway:** the beam pointed 25° off the crack because the head frame was tilted. The head now looks along the crack. The spot sits 0.22 m behind the cut plane, so it lights only the crack and not the cut face. The cones are shortened.
- **Hook framing:** two passes. The crack and the hand now fill about 50 % of the height in the upper half, the fingertips stay above the paragraph, and the hand moves from 0.15 s.
- **Grate shot:** "me" stood too close to the camera, at the frame edge, as a black block. Moved next to the mouth.
- **Cutaway wide shot:** at first the brother was off frame and the face was unreadable (the limestone map streaks). The camera now follows him, and the face is plain strata vertex colour on a 3 cm grid (it was 5 cm and blocky).
- **Hit:** his head was off frame, so it is now framed together with the face under it. The crawler's face is turned toward the camera and sits on the camera side of his near arm.

### Numeric pass (`review/scan.mjs`, every 0.25 s, 0–71)
Checks:
- the camera against the ground, the floor, the chamber wall and the cut plane;
- feet on the ground outside;
- arm reach;
- the camera inside a person;
- body parts under the chamber floor;
- the brother's wrists, head and chest inside the crack in the cutaway;
- crawler fingertips against the floor, the camera and his head;
- head overlap.

Result: the only failure was arm overreach on both of his arms during 38.6–51.6 (the grip targets were 0.98 m ahead; now 0.78 m). The rerun is clean.

### Frame scan (every 2nd frame, 108×192 diff + worst cell)
Spikes only at:
- the planned cuts and dithers;
- the hook's stuttering flashlight and the tapping fingers (0.2–4.3);
- the flicker in beats 7–9 (33.4–51.3);
- the black 45.0–45.6 and the hit cut (the biggest diff, at 45.67);
- the badge and the end.

The grip flicker was softened until 43.2, then it stutters out.

### Weak panels (honest)
- **Panels 9–10 (the hit):** the face reads as a pale upside-down skull with a toothed mouth, but his own face is mostly the back of his hair cap. "Right under his face" is spatial rather than face to face.
- **Panel 8:** the wrap reads at phone size as pale fingers on a dark glove; the helix round the wrist is small.
- **Panel 7:** the fingertips below him are thin pale lines.
- **Panels 12–13 (dusk):** the light looks much like night. The concrete plug's formwork grid is very regular.
- **Panel 11:** the left rescuer is cut by the frame edge, and the floodlight tripods are barely visible.
- **Sign:** small and at the left edge in panel 3.

## 2026-11-05 — revision 1 (coordinator notes: dark cave, hook, cutaway, hit, end), ~12 min
- **Dark cave:**
  - The `cave` preset is now hemi 0.2 deep teal, fog #0b1a22 at 0.6–8 m, and a #06090f background. The rock vertex colours are dark teal-grey and the crack depths go to near black.
  - The headlamp is a 1.6-decay spot (11–14) and the only real light, plus a weak warm bounce near it. Dust motes float in the beam.
  - Outside: the night preset is darker (hemi 0.5, moon 0.55), and the mouth funnel goes black within about 1.2 m.
- **Hook:**
  - A new vertical crack in the chamber wall (`vcR` / `chDep`), with ofuda and a torn shimenawa beside it.
  - The hand first comes out fingers-first, then spreads on the wall. Fingertips are solved onto the wall surface; the check is clean apart from the tapping lifts.
  - The fingers are 1.9× thick (`st.fr`) with knuckles and long yellowed nails. The wax has creases and darker veins and a faint warm emissive for a subsurface tone.
  - The flashlight is a narrow stuttering spot.
- **Cutaway:**
  - Front-face vertices inside the cavity snap onto the crack and chamber boundary, so the stair-steps are gone. The trough's edge wobble is 0 at the cut.
  - The face is dark strata with a wet texture. The camera is closer (3.0–3.4 m wide, 1.75 m flicker, 1.05 m grip).
  - The crawler's fingers are 1.7× thick (wrap bands spaced to match). A bounce light keeps him readable.
- **Hit:**
  - The face has a heavy brow ridge, skin grown over the sockets, a long nose ridge, creases and veins, and the toothed mouth opening.
  - His head turns toward the light and the camera, with a young 'fear' face (new texFaceOf branch).
  - The stair edges are gone (the snapping above).
  - Nostril dots were tried and removed: upside down, they read as eyes.
- **End:**
  - The cliff is lower (top at about 4.9 m, hill behind at 3.6 m+), so the sky shows. A dusk sky texture (darker teal with a warm band at the horizon) is used with the 'dusk' preset.
  - The ground and a lighter dirt path to the mouth are added.
  - The plug is a rough poured surface filling the arch: a lip squeezed onto the rock, sag, pour layers, air holes, drips, stains and a long-fingered hand imprint.
- **QA:**
  - Numeric pass 0–71: clean.
  - Hook wall-contact check: clean after the contact timing fix (it was 2 cm into the wall at 1.75 s).
  - Frame scan of 0–4.5, 26.6–51.6 and 58–71: only planned flicker, cuts and dithers. 1.2–1.6 s is the hand unfolding, checked frame by frame, no pop.
- **Still weak:**
  - Panel 8: the wrap is dark and busy.
  - Panel 7: the near crawler arm reads as pale branches.
  - The dusk's warm horizon is mostly hidden behind the hill.
  - The concrete imprint repeats twice (texture tiling).

## 2026-11-05 — export + sonido pro + final QA (~40 min)
- **Export:** `export.mjs --share --gpu`, 1704 frames.
- **Sound** (`sound/`, as in gashadokuro):
  - 21 Freesound CC0 queries (key via `zsh -ic`), merged into one folder per cue, plus 7 folders reused from gashadokuro. Picked with earshot rank → find → realness (`picks.json`). The Commons wind bed is reused.
  - Dropped: the "distant dog" pick (it had birdsong, wrong for night). The crickets pick already has far barks.
  - Unused (no visual event): the grinder.
- **The mix, on the picture's clock:**
  - Python ports of run.js `broken()` and the hand's tap phase, so each flicker step gets a filament tick and a torch click, and each fingertip landing gets a nail tap. The nails are onset-detected grains.
  - His gravel steps follow walkP's contacts. Crawl scrapes fall where sin(ph) crosses 0.
  - The strobe clicks out at 44.3–44.9.
  - THE HIT at 45.6: sub drop, impact, cluster, torch click and a wet exhale. Teeth grind over the jaw opening at 46.2–48.5.
  - Rescue: generator, shovels, radio, and a muffled whisper "in the rock". Dusk: crickets, wind and a very faint call.
- **Result:**
  - −15.8 LUFS; true peak −2.4 dBTP after AAC.
  - Exact digital silence 45.0–45.6 (decoded max 0.0). Loudest 100 ms at 45.60 s.
- **QA:**
  - review.mjs:
    - text: PASS.
    - dead beats: PASS.
    - story arc: 5/5.
    - cuts on grid: PASS.
    - Flat frames only where planned: 8.4 (card out), 45.0–45.6, 51.4–51.6, 58.0, and the last frame.
  - earshot timeline: 93 % of the 27 picture cues have an onset within 100 ms, and 87 % of the 62 visual events.
  - earshot critique: in range for loudness, true peak, realness 0.79, sync 71 % and the spectrum. Flags:
    - music presence and onset density: launch-film metrics, ignored per the yokai rules;
    - loudest 3 s 4.1 LU over integrated: the hit, by design;
    - the final moment is −3.8 LU: the ending decays, by design.
  - Frame scan of the mp4: only planned changes.
  - revisar_render: CASI.
- **Fix round (one):** revisar_render flagged the face at the hit as touching the paragraph. The chin sat at about 57 % of the frame height, right against the text. The hit camera now aims 7 cm lower, so the face sits above about 50 %. Frames 1094–1239 were re-exported and re-muxed with the same mix. The numeric rerun for 45.6–51.6 and the scan are clean.
- **Left as minor (not real failures):**
  - The hook shows only the hand, as the approved board does.
  - The grip shot is dark and busy.
  - The flicker shot's composition.
  - The rescuers' yolk vests read as blocks, and the motes are dense.
  - In the grate shot, he only looks close to the bars because of the angle. By the numbers his hands stay at most 0.28 m from the centre, inside the 0.5 m cut.
