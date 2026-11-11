---
type: plan
status: draft
title: zelda-kakariko storyboard (14 panels, ~1:00, estimated timing)
tags: [zelda, tapestry, storyboard, short, night]
relatedTo: [pieces/zelda-fairy/board/board.md]
---

# zelda-kakariko: storyboard

Contact sheet board/board.jpg (rendered from the real pipeline: build.mjs + tools/board.mjs). Mid-slide check: board/mid/mid_slides.jpg.
Timing is ESTIMATED (tools/est_voice.py) until the Mad 3 voice exists; panels re-time to the Whisper words automatically.
Look: zelda-fairy v4 method. Night wool field + Shadow frieze bands (eyes, harps, windmills, moons, wrapped dead) from zelda-oot (tools/make_bg.py). New Flow layers (Nano Banana 2, generic prompts, one ref each, woven with tools/weave.py): houses, well, graves, deadhand, hand, door, blade. Reused: link_adult (zelda-fairy v4), hero-walk/listen/sword, impa, guardian-point (Impa pointing), wrapped-stranger (Sheik), drumming-hands (Bongo Bongo), graveyard tree, windmill, fire (zelda-oot). Code: Sheikah eye, Lens of Truth, torches, stone walls, inscription, spiked walls, bars, chains, FAN THEORY tag, embers, leaves.
Captions: lower than zelda-fairy, each panel puts them just above its figures (CAP_Y in src/scenes.js).
Link is one actor; when two panels in a row have him he crosses the seam once (pose + size crossfade).

- P01 0:00–0:03 Kakariko at night, moon, windmill, lit windows; Link walks in.
- P02 0:03–0:09 Graves on the hill; the earth opens on "temple" into a stone chamber with three guillotine blades dropping in turn.
- P03 0:09–0:15 Sheikah eye grows in; Impa (arms crossed); the wrapped Sheikah walks in on "shadows"; Link listens.
- P04 0:15–0:18 Graves high up, the eye doorway rises below, torches; Link walks to it.
- P05 0:18–0:23 Stone wall; the inscription stitches in word by word with the voice (captions hide during the quote).
- P06 0:23–0:28 Blades drop, spiked walls slide in on "spiked", two floor tiles vanish on "invisible"; Link walks carefully.
- P07 0:28–0:33 The well on the ground, its shaft cut open, a rope goes down; the Lens of Truth glows at the bottom on "Lens".
- P08 0:33–0:35 Dead Hand rises out of the dirt, pale hands come up; Link holds the lens.
- P09 0:35–0:38 Impa points; a gold Sheikah seal closes over the well on "sealed", the shadow presses under it.
- P10 0:38–0:41 Kakariko burning (roof fires, embers, red glow); shadow ribbons burst out of the well on "broke".
- P11 0:41–0:44 Bongo Bongo: two giant hands over the drum, drum booms (rings); Link crossfades to sword on "Bongo".
- P12 0:44–0:51 Empty cells, chains, faint eye; the FAN THEORY tag swings down on "fans".
- P13 0:51–0:56 The inscription again, whole, torches; Link looks up.
- P14 0:56–1:00 Apple + AMPHORUS plaque + "What the shadows buried stays buried".

## Revision 2 (user notes, 2026-11-09)
- Figures and elements ~22% smaller (Link/Impa/Sheik 620-640 px); bands thinner (150 px, tools/make_bg.py); floor at 1700.
- Inscription (P05/P13) now in the caption style: cream with a brown border.
- End card (standing rule): no box behind AMPHORUS, apple lower (y 860).
- Link, Impa and Sheik are mesh puppets (pieces/rig-test method: rigs/*.json -> tools/rig_build.py -> src/rig_*.js; src/puppet.js).
  Link reuses the rig-test rig; Impa and Sheik are new Flow rig poses (gen/, work/*_keyed.png). Profile only, bends <= 70 deg.
  Walks keep the planted foot still (speed from the rig); across seams Link is one puppet whose pose blends while he walks over.
  Known residue: small dark notches at the hip of Impa/Sheik when the thigh swings (LBS + cut seam).
- Music: audio/src/impas_fate_crispydonut.wav (CrispyDonut mix, "Impa's Fate").
