# learning-faces — log

## 2026-11-04 look check
- Scaffolded from bells (head/font/bridges/score, scenes infra: flowShot, aansa captions, chapterTag, sceneCard, sceneLogo outro, egWiggle + HUD; tools gentle/masks/outline/prep). bells files untouched. Non-look beats are black `todo` placeholders.
- Script: 29 lines, bells' format; scratch voice: last line ends 208.2 s (+0.3 s on every pause to reach ~3:30).
- Flow: 3 projects (the 2nd lost track of uploaded images: "No asset named ..."; the 3rd copied the ranger ref outright, twice). Pilot and reveal ended up made with NO style ref (text only); edits work on uploads in project 6dd0ef24.
- Beat 8: v1 (mask-like bust under a stage light) and v2 (muppet-like head on a stalk) rejected at self-check; v3 used (emaciated pale torso, two hole-eyes, slit mouth). Kept as ONE layer: the thing never moves (device); motion = marine snow at two depths + lamp dips + one push. Image slid 300 px left so the face stays clear of the HUD.
- Beat 9: first try copied @{refman}'s ranger scene; then a grey alien with a text bar (rejected); v4 used + an expression edit (mouth closed, holding breath). Layers: cockpit / thing behind the glass / pilot. He leans in on "moved"; the thing makes the same move mirrored exactly 1.0 s later (breathing too); swaps to the gasp on "same".
- Beat 24: Flow refused to distort a realistic face (4 edits came back near-identical / friendly; gen/stale + f24_reveal_v*). Base = v5 (seam down the face, wide smile); the wrongness in code: tools/wrong.py re-draws the mouth wider with ~30 small identical rounded teeth per row; scenes.js slides the right half of the face 5 cells down a second late and keeps it following the head drift 1 s behind. Glitch burst on twos (face / inverted / black / flash of the thing's crude face) before it holds.
- Magenta isolations failed twice (came back grey; one re-posed the pilot): masks.py cuts on the grid from a hand polygon + a flood stopped by Flow's white outline (taken at full res); ring drawn only where Flow drew an outline; bg filled from nearest non-white cells.
- gentle.py: Flow's halftone dots became checker dither -> a pass flattens dense checker areas to the 5x5 mean tone (only true checker dots: unlike 4 sides, like diagonals, so fingers survive).
- Look frames: t = 60.83 (beat 8), 68.77 (beat 9), 167.86 (beat 24) -> look.png; full-size in review/look_*.png; burst check review/reveal_burst.png.

## 2026-11-04 look round 2 (user: the thing must NOT start human; it takes human form dive by dive)
- Progression, one Flow image per stage (all text-only prompts, no style refs; prompts in gen/PROMPTS.md):
  d1_mass (dive 1, beat 6: a hanging veined membrane, folds drawn to one point, no face; v1 a cauliflower blob, rejected),
  d2_imprint (dive 2, beat 8: two holes + slit pressed into the flesh; edits of d1 failed: paper sculpture / unchanged),
  d3 (dive 3, beat 9: mirror scene) = code composite tools/mirror.py: d2 membrane + d3_hand (stalk hand, fingers stretched 1.5x in code) inside the porthole of f09 (Flow redrew the pilot when asked to edit only the outside, and would not add a hand to d2),
  d4_draft (dive 4, beat 13: drafted torso, lids at different heights, lips off-centre, teeth set in the cheek; v1 had cartoon teeth),
  d5_smile (dive 5, beat 15: nearly a man, closed smile, mannequin stumps, chest of flesh folds; v1 copied d4),
  f24_quiet (reveal: calm man, small closed smile; Flow's edit of camface made a bigger grin -> stale). Old f08/f24_base frames retired.
- Reveal now quiet: tools/reveal.py crops Flow's border and draws faint fold seams (hairline, neck); code: the eyes sink into two black holes (hold+1 s .. hold+6 s), the right half follows the head drift 1 s late (no slip, no gap line), short glitch burst with a d2 flash.
- gentle.py: + a salt pass (fine halftone in dark areas -> 5x5 median; skipped on d4 where it ate the cheek teeth); d1 silt oval -> mid grey so the membrane is the brightest thing.
- sceneDeep (DIVES table) for beats 6, 8, 13, 15; look.png = 45.33 / 68.77 / 171.56; review/progression.png = dives 1-5 + reveal; review/reveal_sink.png.

## 2026-11-04 round 3 fixes + storyboard
- Fixes: d2 holes re-drawn uneven in tools/stages.py (ragged left blob, taller right hole torn down into the folds, broken fringe, crooked off-centre slit); d3: glass interior cleared to black, membrane smaller/dimmer with soft edges, the hand = gen/d3_hand7.jpg widened to 7 digits in mirror.py (Flow's last finger bent back = the wrong joint), wrist fades into the dark, d2-style holes on its face (stages.py); d4 = new Flow (sexless lump, one eye, a dent, a seam down the face); d5 = new Flow (head and neck dissolving into veined folds, no bust; sun rays blacked in gentle.py); gentle.py: lone-speck + checker removal on every image (dark halftone salt pass skipped on d4); eye-sink eased (slow creep 3.4 s then a 0.7 s drop); consecutive-frame diffs over the reveal hold: 0-8 mean diff on the twos drift, one spike = the cut to beat 25. review/progression_v3.png.
- Storyboard: 22 new Flow images (gen/b*.jpg, prompts in gen/PROMPTS.md), tools/boards.py composites our stage images into the monitor (b07) and the prints (b12: dives 1-3 + two black prints), crops b28's frame. BOARD_SHOTS table (one eased move per shot, tags, sub HUD), sceneDark (beat 21, code only), beat 23 cuts to black 0.9 s after its line. board.png = 29 beats + card + outro; layer plan written in scenes.js (cut-outs not made yet).

## 2026-11-04 board round 4 (user approved the board; weak panels fixed except 14)
- New Flow: b05_lights (heavy realistic sub, soft cones, snow in the beams), b10_inside (his hand only, black water), b23_smiling (Junji-realistic; boards.py crops Flow's border), b25_empty (a shed human skin with a collapsed face on the seat), b02_porthole / b27_piccard (Swiss Piccard drawn Junji/WoH style), b28_three (lit from below, no rays). Old ones in gen/stale/*_r1.jpg.
- b10_glassc: our seven-finger hand (d3_hand7 widened) composited outside the glass, a beat lower, wrist running out of frame. Dive 3 (beat 9): membrane full brightness with a soft wavy torn edge (no comb), the wrist ends on an uneven line into it (a fade posterised to a grey band). b12 dive-1 print from the grid asset (no Flow noise).
- Font check (30, 31): thatthatnewpixelfamilytest-square IS loading; the font itself has serif-like letterforms (PIL render of the .otf identical; bells' outro identical: review/bells_outro_ref.png vs review/outro_full.png, review/card_full.png).
- Moving light (user rule): spotLayer(lit) = amigara's egSpot on 4-px cells (checker edge band, flat dark beyond), LIGHT presets beam / hand / lamp / flame built from slow sines; on beats 5, 6, 8, 13, 15 (sub beams sweep), 21 (only the flakes in a swaying beam show), 11, 12, 14, 16 (lamps sway), 18 (lantern flicker), 22, 23, 24 (hand-held camera light wobbles).
- Code outline rule: applied now to the layered stage shots (outline.py: f09 pilot, f24_q); the board shots get their cut-outs + outline in the build step.

## 2026-11-04 build + delivery
- Fixes: b25 = new Flow (a deflated empty skin, flat mask face, mouth closed); dive 3 hand grows out of the membrane (stages.py: one fill across the join, shade side and veins carried across); b14 biologist cut + outline.
- Layers: 12 Flow magenta isolations (gen/layers/*_m.jpg, alignment checked) -> tools/cutm.py (fg/bg on the 480x268 grid, bg cleared 6 cells / 10 over white bits, nearest fill) -> outline.py full 1-cell ring on every board cut-out (frame border and white bg skipped). LAYB parallax per shot, relative travel <= 22 px (< the 24 px cleared margin: no ghost pixels). An auto-cut by Flow's outline was tried and leaked everywhere (removed).
- Dynamic light: spotLayer presets kept (beams 5/6/8/13/15/21, lamps 11/12/14/16, lantern 18, hand camera light 22/23/24).
- Sound (sonido pro): Freesound CC0 (sound/fs, fetched with fs.py; bells' library reused) -> earshot rank (sonar 653896 z+5.3, deep bubbly rumble 875512) -> sound/mix.py (from bells): talking loop under every caption (slower/lower as it darkens), sub + drones + swells, underwater rumble on every dive, sonar clock, hull creaks, glass knocks (its own 1 s late), heartbeat, fluorescent hum in the lab, VCR, camcorder beeps, a low thud + tick on every cut, hard silence 160.94-165.79, reveal = loudest (hell hit, rumble, glitch), wet drop on the eyes' final sink, red-outro power-on. -13.07 LUFS, -2.0 dBTP (-1.86 after AAC).
- Mux: Premiere-style B&W (Rec.709 colorchannelmixer) for t < 216.773 (the red outro keeps colour) -> renders/Something Down There Is Learning Our Faces.mp4 (237.8 s).
- QA: tools/fdiff.py over all 5707 frames (consecutive diffs): 0 in-out pops; spikes off-cut = the intended lamp dips (sub cam), the beat-23 cut to black, the reveal glitch burst, the outro power-on. earshot critique: needs work by launch-film standards only on intended choices (4.8 s hard silence, quiet 20 s end screen, sparse density); cut sync 74% after adding a thud on every cut. revisar_render (API): CASI; fixed b18/b22 cut-out holes and the dive-5 timecode; kept by design: shot lengths (approved board), captions at top on beat 16.
- Thumbnails: tools/thumbs.py (WoH search look, flat grid, straight kanji box, one red accent, border) -> thumbs/t1-t6, sheet thumbs/sheet.png.

## 2026-11-04 round 6 (coordinator: far too much white)
- gentle.py: bells levels (0.13/0.33/0.72) kept; the general halftone flatten removed; speck/checker cleanup may only darken; NEW tone step: Flow drew lit skin/flesh/pale surfaces as paper white (1.0; bells sources sat at 0.6-0.7), so a large white area (>= 60 cells) -> mid grey and the mid grey shading within 2 cells -> dark grey; small whites (eye whites, glints, teeth, lamps) stay white. b01/b05 skip it (lamp light is white). stages.py/reveal.py follow (grey membrane, dark grey fold seams). All images re-processed, thumbnails redone. Sheet: review/white_fix_before_after.png (shots 4, 6, 8, 11, 16, 23, 24 before|after, bells reference frames, thumbnail t1).
- Silence before the reveal 4.85 s -> 1.81 s (script 'smiling' after 2.85); everything after shifted (voice.mjs, subs, mix).
- Weak shots: new Flow b22 (same cameraman as 23, via @{camman}) + new magenta cut, b05 (clean white sub, no creature), b01 (soft halo, no cone), b26 (fine detail, plain disc lamp); spot light edge = 4 flat steps (no checker band, b18); lamp dips = smooth 0.8 s dims (no 2-frame flicker); sub-cam captions raised to y 860.
- Frame 4974 (old 5046) spike traced: the end of the last push on beat 29 against a near-static frame (6x a tiny local median), no visible glitch.
- QA: 5633 frames, 0 in-out pops; off-cut spikes = beat-23 cut to black, reveal glitch burst, 4974, outro power-on. earshot critique: close (18/23; silence gap 1.68 s now in range). revisar_render: CASI.

## 2026-11-04 round 7 (last weak points)
- Beat 5: Flow's beams blanked (gentle.py polygon) and drawn in code (subBeams: two lamps, per-cell light = cone edge^0.8 x distance falloff, slow-wobbled edge following the cone, 4 flat steps, slow sweep, marine snow only inside the light).
- Beat 22: new Flow from @{camman}: he holds the camcorder at arm's length, lens toward the viewer, face lit by it; new magenta cut.
- Beats 2 / 27: Flow expression edits (no style refs): calm narrow eyes behind the glasses; new magenta cuts (b02's first isolation came back tinted, redone).
- Outline: outline.py keeps Flow's own outline (an edge cell with a >= 0.8 pixel at full res becomes the clean white line, 1-cell breaks bridged) and draws the code ring only in the gaps (never beside Flow's line). gentle.py's tone step now spares thin white lines (areas only, via an eroded core), so Flow's outline is not greyed.
- Beat 4: the crew shift their weight once (8 px eased at 4.2 s). Beats 12 / 26: local-majority blotch cleanup.
- QA: 5633 frames, median 0.90, 0 in-out pops (spikes = cut to black, reveal glitch, beat-29 push end, outro power-on). earshot: close (17/21 fast). revisar_render: CASI.

## 2026-11-04 round 8 (beat 22 / cameraman consistency / tag)
- Beat 22: Flow edit of @{cam23}: arm out, hand gripping the camcorder, lens at us, face softly lit; new magenta cut. Reveal base f24_quiet: headset removed, then the same messy hair as 23 (eyes kept in place; reveal code unchanged).
- outline.py SMOOTH set (b22, b23, f24_q): mask closed+opened by a 3-cell disk, fg cut to it, white bits inside the dark hair and near the edge -> black/dark grey, ONE smooth continuous code ring. Comparison sheet review/cameraman_19_22_23_24.png.
- Tag: 潜 at 10 px dot read as 落 -> the dive tags are now ダイブ-DIVE nn (crisp in the dot font): review/qa/tag_full.png. "rec": the glyph is fine; the 'cedilla' was a marine-snow flake under it.
- QA: 5633 frames, 0 in-out pops; mix unchanged (-13.07 LUFS).

## 2026-11-04 round 9 (user rejected: vitiligo faces, opening sub, captions, 1:05, 2:43)
- gentle.py: area tone step REMOVED. One global highlight shoulder on the cell values before quantizing (identity < 0.45, 1.0 -> 0.70), then the bells mapping; white only for tiny raw-white spots (<= 6 cells) and thin raw-white lines against black (outlines). review/faces_r9_before_after.png.
- Opening: new Flow Trieste (float hull + crew sphere, ~60% of the width), swaying lamp glow; review/qa/r9_opening_sub.png.
- Captions: SUB_S 3, rows <= 760 px; tools/subplace.mjs places each chunk from an emptiness map (3 caption-free frames of its span, dark + flat + 48-px subject margin, not on the tag) -> src/subpos.js; 11 hand overrides (SUBPOS_FIX) where dark hair/clothes read as empty; beat 22 split into 3 narrow rows. Cut-off check: 44 chunks, 0 out of frame. review/captions_placement.png, captions_placement_2.png.
- Beat 9 (1:05): the thing half-hidden: tones step down by distance from the hand, black cells transparent, no outline (masks.py). review/qa/r9_105.png.
- Reveal (2:43): the whole cut-out incl. outline is ONE layer; the 1-s lag moves only the right-half interior (f24_q_in.png), no ring below the neck, grey/white outline remnants in the hair removed. review/qa/r9_243.png.
- QA: 5633 frames, 0 in-out pops (new off-cut spikes 1044-1058 = caption block moves in beat 6); -13.1 LUFS, -1.8 dBTP; earshot (fast): close 17/21; revisar_render: CASI.

## 2026-11-04 round 10 (reveal glitch)
- No inverted frames anywhere: sceneReveal = 0.2 s black, then 6 frames of a VHS tape-tracking glitch on the WHOLE finished frame (vhsPost after the HUD: seeded band slices shifted sideways, one static line, a rolling sync bar), then the still normal reveal. The reveal hit + rumble + 6 tape bursts moved to the face's entrance (REVEAL + 0.2); silence 160.94-162.95.
- Beat 6 frames 1044-1058: whole-frame diffs = the smooth lamp dip (2D bbox = full frame), not a caption move; captions only change position between lines.
- QA: 5633 frames; the only in-out pops are 3912-3917 = the 6 intended VHS glitch frames; -13.1 LUFS, -1.8 dBTP. Strip review/reveal_vhs_strip.png.

## 2026-11-04 round 11 (new direction: soft 7-tone processing, board only, NO export)
- tools/soft.py replaces gentle.py: Flow image -> 1920x1072 -> median of each 4x4 cell -> nearest of 7 tones (0 .18 .34 .50 .66 .84 1.0). Nothing else (only the b05 Flow beam and the d5 sun rays are blanked; beams are code).
- outline.py rewritten: Flow's outline kept as is; the code only restores Flow's own white outline pixels that the cut left in the bg (2-cell band, connected to the figure). No invented line.
- stages/reveal/masks adapted to 7 tones (cleared areas take the surrounding tone; folds two tones darker; d3 falloff in 7 tones); beams drawn in 7 tones.
- Flow (Nano Banana 2.1 after Pro timed out): b07 adult crew (+ magenta cut), expression variants b14_biologist_b (head down, frown), b23_smilingc_b (wider fixed smile, sideways glance), b16_ids_b (all look up, frightened), b27_piccard_b (eyes lowered/closed); crossfade 4 frames at a key word (B.swap). b14 'eyes widen' edit came back as an unrelated tapestry (stale). Bold alternates: alt05_overhead, alt16_overhead, alt19_lowangle, alt23_dutch (index_alt.html, USE_ALT).
- board_r11.png; stills review/r11_*.png. No export.

## 2026-11-04 round 12 (anatomy + weak points, board only)
- alt16_overhead re-edited (Nano Banana 2.1): every person two arms (stale/alt16_3arms.jpg).
- b16_ids_b redone: the young man's raised arm had vanished; now his hand moves from mouth to chest, both arms visible; own magenta isolation. cutm.py: each variant gets its own mask when isolated, the bg is cleared under the union of all poses; variant figure tones rank-matched to the base figure (fixes the cameraman variant's whiter look).
- outline.py: one continuous light (214) cell outside the mask wherever Flow drew an outline nearby, skipped where Flow's line survived on the edge (no doubling, no dotted line).
- b07: hair-tie remnant behind her ear painted into the hair (fg and bg).
- b14_biologist_c (glance to the laptop, wary) + swaps: c at 'known', b at 'name'.
- Anatomy pass on all figure images/variants (contact sheets): no other missing/extra limbs; b10's seven-finger outside hand is intended.
- board_r12.png; review/r12_*.png. No export.

## 2026-11-05 round 13 (board only)
- alt16_overhead: NEW from scratch (no edit), nobody touches their face; hand check at full size (6 crops): 3 people x 2 arms, every hand on its own side (thumb side checked from the shoulder), 5 fingers each. Old in stale/alt16_tworights.jpg.
- Beat 9: the thing is ONE Flow image (gen/d3_creature_v3.jpg = d3_creature edited: crude face, no frame), mirror.py scales it into the glass with a soft falloff from the hand and dissolving edges; the old patchwork (membrane + hand7 + stages.py d3 edits + masks falloff) retired. The whole layer moves for the 1-s lag.
- board_r13.png, review/r13_*.png. No export.

## 2026-11-05 round 14 (board r13 approved -> build + export)
- All four alternates in the cut: 5 opens on the overhead descent (Flow edit: streaks removed, slow snow in code) and cuts to the side-view sub on "pale"; 16 opens on the overhead table and cuts to the crew (faces act) on "faces"; 19 = worm's-eye cameraman; 23 = Dutch-angle tape. Mid-beat cuts get a thud + tick in mix.py. Captions re-placed (subplace + 6 hand overrides; beat 8 line split in two rows).
- Thumbnails regenerated from the soft.py assets (thumbs/sheet.png).
- QA: frame-by-frame (fdiff), contact sheet review/r14_contact_sheet.png (anatomy checked per shot), earshot fast: close 17/21, revisar_render: CASI. Export renders/Something Down There Is Learning Our Faces.mp4.

## 2026-11-05 round 15 (stills only, no export)
- Beat 7: new over-the-shoulder take (b07_optA_ots, adult proportions; Nano Banana 2.1) + expression edit _b (both look round, frightened) swapped on "face"; our dive-2 face on the screen (boards.py); own magenta cut. Option B (side mid shot, b07_optB_side) generated as an alternative, not wired.
- Beat 9: the one-image creature larger (S 0.40) and placed so its face is inside the glass and its hand sits above/beside the pilot's.
- Beat 18: the gap between the pilot's legs is part of the figure now (closed mask), no filled block.
- Beats 22-24: no code ring on the cameraman; Flow's own bright spiky outline dimmed to dark grey where it is a thin line against black (soft.py, cameraman images only).
- board_r15.png; review/r15_*.png.

## 2026-11-05 round 16 (final)
- Beat 7 = option B side view (b07_optB_side, soft.py) + frightened variant _b on "face" + own person-only cut; our dive-2 face warped into the monitor's perspective quad (boards.py).
- Cut-outs carry only people now: b11 (laptops/monitor/chair), b14 (book), b16 (photos/table), b27 (armchair) re-isolated person-only; f09 pilot mask loses the porthole glass beside his hand. Motion sheet review/r16_motion_check.png (start/end of every layered shot).
- Export + frame QA + loudness (see report).
