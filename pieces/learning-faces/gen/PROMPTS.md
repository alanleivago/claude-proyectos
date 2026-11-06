# learning-faces — Flow prompts (srz-google-flow-mcp, Nano Banana Pro, 16:9, one call at a time)

Projects: ef39a025 (beat 8), c626bfa8 (asset lookups broke), 6dd0ef24 (beats 9 and 24). Style refs from 'Ref 1 bit pixelated junji ito madfable/ref caras personajes y lugares/': @{refman} = Park_ranger_facing_forward..., @{refbald} = Man_with_pixelated_shadows...

## f08_face.jpg (USED, beat 8; v1/v2 rejected: mask bust under a stage light / muppet head on a stalk)
Use @{refman} and @{refbald} ONLY as drawing-style references (black and white pixel manga rendering, Junji Ito ink lines, flat grey shading); do NOT copy their scenes or characters. 1-bit black and white World of Horror / Junji Ito horror game illustration, high contrast, solid filled shapes, flat black, one dark grey, one mid grey and white, NO checker dither, NO gradients, 16:9.
Point of view of a deep-sea submersible's camera at the bottom of the ocean trench. The top two thirds of the frame are solid black water. The sub's lights make a flat oval of pale grey silt in the lower left and centre, with a few dark rocks and drifting specks. On the right third, at the edge where the light dies into black, stands a pale emaciated human-like figure from the waist up, half buried in the silt: realistic thin shoulders, collarbones and ribs drawn with fine Junji Ito ink lines, long thin arms hanging straight down into the silt, wet smooth hairless white skin. Its head is a smooth egg shape with no nose, no ears, no lips, no brows: the face is only two big deep round black holes for eyes, like holes pressed into wet clay with a thumb, slightly uneven, and one long thin straight black slit for a mouth — a crude child's drawing of a face on a realistic body. Light from the left; the right half of the figure falls into solid black shadow. Perfectly still, facing the camera. Quiet dread, realistic, NOT cartoon, not cute, not a mask. The figure has a subtle white outline around it.

## f09_pilot.jpg (USED, beat 9; no style ref — with @{refman} Flow copied the ranger twice: stale/f09_refcopy*.jpg; f09_pilot_v1 rejected: grey alien, text bar)
1-bit black and white World of Horror / Junji Ito horror game illustration in pixel art: black and white manga rendering, Junji Ito ink lines, flat square-pixel shading, high contrast, solid filled shapes, flat black, one dark grey, one mid grey and white, NO colour, NO checker dither, NO gradients, NO text, NO captions, NO user interface, 16:9. Inside the cramped cockpit of a small deep-sea submersible, a tight steel sphere lined with gauges, switches and cables, dark, lit only by the cold glow of small screens below. Left half of the frame, three-quarter view: the pilot, a Japanese man in his forties, short black hair, a thin headset, a dark jumpsuit, sweat on his temple, his readable face frozen in fear, eyes wide, mouth slightly open, eyebrows raised. He holds his right hand up flat against the INSIDE of a thick round glass viewport in the centre right. Behind the glass, OUTSIDE in the black water, a pale thin hairless humanoid floats a little back from the glass and holds up its own long pale hand in exactly the same pose, mirroring him, but not touching the glass. Its head is a smooth white egg with NO nose, NO ears, NO lips and NO brows: only two deep round black holes for eyes and one thin straight black slit for a mouth, like a child's drawing of a face. It is not an alien and not a grey alien: it is a pale drowned-looking human body with a crude unfinished face. The pilot has a subtle white outline around him; the creature has a subtle white outline around it. Claustrophobic, quiet, realistic Junji Ito dread, nothing cartoon.

## f09_pilot_b.jpg (USED, expression edit, no style ref)
Edit @{pilotshot}: keep the exact same image, same framing, same pixel art style, same pixel grid, same cockpit, same viewport and the same pale creature with its raised hand. Change ONLY the pilot's face: his mouth is now CLOSED, lips pressed tight, jaw clenched, eyes wide and fixed on the creature, a bead of sweat on his temple, holding his breath, frozen and silent with fear, realistic Junji Ito expression, not cartoon. Everything else stays identical.

## Beat 24 — the face (no style ref). Flow would not distort a realistic face; the wrongness is in code (tools/wrong.py teeth, scenes.js slipped half)
- f24_reveal_v1.jpg (rejected: bulging googly eyes, manic joker grin, white border): frontal close-up, lit from below, "almost a normal Japanese man ... skin stretched ... eyes misaligned ... far-too-wide smile ... too many small teeth".
- f24_reveal_v2.jpg (rejected: plain friendly man): head-and-shoulders, "subtly WRONG, the way a copy is wrong ... right eye lower ... halves out of line ... waxy skin ... calm polite too-wide smile, too many tiny teeth".
- f24_reveal_v3.jpg (rejected, edit of v2: came back a normal happy smile).
- f24_reveal_v4.jpg: "Junji Ito horror manga panel ... something wearing a near-perfect copy of his face ... the right half of the face sits visibly lower ... a faint vertical seam down the middle of the nose and lips ... eyes calm, half-lidded and dead ... smile too wide and too still ... tension lines" -> only the seam came through.
- f24_reveal_v5.jpg = f24_base.jpg (USED), edit of v4: "the whole right half of the face has slipped DOWN ... the smile splits much wider ... far too many small identical teeth ... pale empty irises ... remove the halftone dots" -> slightly wider smile only.
- stale/f24_reveal_v6_noedit.jpg (edit of v1: returned unchanged).

## Layers (failed, gen/stale): magenta isolations of @{seabed} and @{pilotshot} came back grey (the pilot re-posed). Masks are cut in tools/masks.py.

# Round 2 — the progression (user: not human at first). All Nano Banana Pro, 16:9, NO style refs. Shared head:
# "1-bit black and white World of Horror / Junji Ito horror game illustration in pixel art: ... fine Junji Ito ink lines, flat square-pixel shading, flat black, one dark grey, one mid grey and white, NO colour, NO checker dither, NO gradients, NO text, 16:9."
- d1_mass_v1.jpg (rejected: solid cauliflower/ghost blob with eye-like dimples).
- d1_mass.jpg (USED, dive 1): sub-camera POV, black water, flat oval of pale silt; on the right "a vast thin membrane of pale flesh, wider than the light, draped in the water like a torn wet curtain or a huge flayed skin hung from nothing, its long folds falling straight down and pooling onto the silt ... thin and translucent ... fine ink lines trace veins and creases ... No face, no eyes, no head, no limbs, nothing human, no dots that look like eyes. Only the folds in its centre are drawn slightly toward one point, as if it were turned toward the camera. Perfectly still ... Not a ghost, not a jellyfish ... subtle white outline".
- stale/d2_imprint_v1_paper.jpg, stale/d2_imprint_v2_noedit.jpg: edits of @{mass1} adding the pressed face (folded paper / unchanged).
- d2_imprint.jpg (USED, dive 2): "a closer view of a vast thin pale membrane of flesh hanging in the dark ... like a torn wet curtain of skin ... In the middle of the membrane the skin has pressed a crude face into itself from behind, like a child's drawing of a face pushed into wet skin: two round, deep, perfectly black holes for eyes, a little too far apart, and one short straight black slit for a mouth ... no head shape, no skull, no nose, no hair, no neck, no body ... not a sheet with eye holes, not a mask".
- stale/d3_mirror_edit_changedpilot.jpg: edit of @{pilotshot} replacing only the outside (Flow redrew the pilot bearded, kept the old creature).
- stale/d3_thing_v1_ghost.jpg (cartoon ghost with a heart), stale/d3_thing_v2_noedit.jpg (edit of @{membrane} adding a stalk hand: unchanged).
- d3_hand.jpg (USED in tools/mirror.py): "A single long, thin, pale, boneless stalk of flesh, like a pale eel or an umbilical cord with fine ink veins, rises ... in a slow S-curve and ends ... in a pale imitation of a human hand, held up with the palm flat toward the viewer, like a hand pressed on a window ... fingers far too long ... too many of them" (Flow gave five normal fingers; code stretches them 1.5x).
- d4_draft_v1.jpg (rejected: boxed cartoon teeth, breasts).
- d4_draft.jpg (USED, dive 4): "A pale membrane of veined flesh spreads over the silt ... from it rises a half-formed figure from the waist up ... sexless and smooth ... arms not yet formed, only short smooth stumps. The head is realistic in shape but unfinished, as if the features were copied one at a time from photographs: realistic human eyelids, closed ... one set lower than the other; thin realistic eyebrows too high ...; realistic human lips shifted a little off-centre ...; and beside them, not inside them, a crescent of small real human teeth set in the bare skin of the right cheek. No nose yet, just two small slits ... like Junji Ito's Uzumaki or The Enigma of Amigara Fault".
- stale/d5_smile_v1_copy.jpg (with @{draft4} as ref: Flow returned d4).
- d5_smile.jpg (USED, dive 5): "Close on a figure that is ALMOST a man, seen from the chest up ... Japanese man's face, short black hair grown in uneven patches ... eyes open and calm, looking straight into the camera. He smiles at the camera: a small, polite, closed-lipped smile, held perfectly still, no teeth ... skin smooth and poreless like wax ... Below the collarbones the body is unfinished: the chest thins into pale wet folds of veined flesh ... no arms, only smooth stumps".
- stale/f24_quiet_v1_grin.jpg (edit of @{camface} asking for a closed smile, waxy skin, folds: came back a bigger grin).
- b22_turn_candidate.jpg (asked for the reveal, got him holding the camcorder, unsmiling: kept for beat 22 "turns the camera toward himself").
- f24_quiet.jpg (USED, reveal): "The picture IS the camera's view: no camera visible ... perfectly frontal, symmetrical head-and-shoulders portrait of a Japanese man of about thirty ... inside the dark steel cabin of a deep-sea submersible ... mouth closed in a small fixed polite smile, lips together, no teeth showing; the eyes open, steady, unblinking ... skin very smooth, pale and poreless, almost waxy ... the stillness is what is wrong". Wrongness in code (reveal.py seams, sinking eyes, 1-s lag).

# Round 3 (fixes) and the storyboard. Shared head on all: "1-bit black and white World of Horror / Junji Ito horror game illustration in pixel art: black and white manga rendering, fine Junji Ito ink lines, flat square-pixel shading, high contrast, flat black, one dark grey, one mid grey and white, NO colour, NO checker dither, NO halftone dots, NO gradients, NO text, NO frame, 16:9 full bleed." + "subtle white outline" on every figure. No style refs.
- d4_draft.jpg (round 3): a crude sexless column of veined flesh rising from the sheet, egg head-lump; ONE realistic half-open eye set low; a shallow dent for the other; a puckered seam down the middle; small crooked closed lips. (d4_draft_v2 = round 2.)
- d5_smile.jpg (round 3): almost a Japanese man, patchy hair, calm closed smile, waxy; NO shoulders: the neck spreads into hanging veined folds fading into black. (d5_smile_v2 = round 2.)
- d3_hand7.jpg: a pale hand, palm to viewer, "SEVEN fingers ... the fifth bends backwards" (Flow drew five, one bent; widened to seven in mirror.py).
- b01_trieste (v1 had a grey sea-surface band: stale): Trieste sinking, pitch black water top to bottom, porthole glowing, lamp cone down.
- b02_porthole: 1960, Piccard-like man (round glasses, sweater) at the tiny porthole, sand cloud outside.
- b03_deck: the man alone at the rail, sailors and an officer sceptical behind him.
- b04_ship: night, Japanese research ship stern, sub on the A-frame, pilot / cameraman / biologist.
- b05_lights: the sub over the silt, two lamp cones, a pale ragged thing at the end of the light.
- b07_monitor (v1 drew the thing in the room: stale): control room over the shoulders of the biologist and a technician, the thing only on the screen (screen replaced by our d2 in boards.py).
- b10_glass: extreme close-up, his real hand inside the glass, a pale long hand outside a beat behind.
- b11_review: pilot at laptops of frozen frames, cameraman behind.
- b12_stills: prints pinned left to right becoming a face (prints replaced by our stages in boards.py).
- b14_biologist: the biologist at species books, stopped mid-page.
- b16_ids (v1 had a bearded westerner: stale): the three JAPANESE crew at a table with ID photos next to stills of the copying face.
- b17_match: his ID photo beside a deep-sea still with the same face, waxy and dead-eyed; a trembling finger.
- b18_refused: the pilot on his bunk, face half in his hands.
- b19_alone: the cameraman climbing into the sub alone at night.
- b20_tape: the wet camcorder and memory card in evidence bags, blank tag.
- b22_turn_candidate (from round 2): him holding the camcorder in the cabin.
- b23_smiling: camcorder view, him smiling calmly in the cabin.
- b25_empty: the empty cabin, a pale shed film of skin over the seat.
- b26_shut: archive shelves, a stamped file and a tape.
- b27_piccard: very old Piccard-like man by a dark window over a lake.
- b28_three: three sleeping faces (Japanese man ~40, young Japanese man, old European man) pressed out of the membrane.
- b29_next: a fresh blank featureless face pressed out of the membrane, waiting.
