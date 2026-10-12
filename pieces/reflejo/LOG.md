# Log: reflejo

## Run 1 - 2026-10-10

- Measured refs: palette #000/#2b2b2b/#8e8e8e/#fdfdfd, ~8 px pixels, hard cuts every ~3-4 s.
- Look rounds: (1) mirror frame fill bug turned the glass black and the heads were bald -> fixed evenodd mask, added a fringe; (2) a leaked clip hatched a block behind the head, glints too strong -> mask save/restore, glints at 25% dither; (3) compare vs reference close-up (references/1bit/cmp_round2.png): head too small, shirt grey -> heads 28 px, white shirts.
- build: syntax ok; tile 24,120,250,330: deterministic true.
- Review: 5/5 cuts on the 8th grid; story arc PASS (gift p90 -15.0 vs -19.1 next, before re-normalising); text PASS (0 cut-off, 0 in safe zone); loudest 100 ms at 12.5 s in the gift act; silence 0.5 s <= -40 dBFS before it; dead beats PASS.
- Sound fix: room tone was louder than the payoff (act medians -14 dB) -> beds cut ~8 dB, ring and post-hit bed raised.
- Loudness: the score's own stage gives about -20 LUFS; audio.wav was re-normalised after export with a linear two-pass loudnorm (I -15, TP -2) and remuxed: -16.7 LUFS, TP -1.6 dBFS (peak-limited; 0.7 LU short of -16). Re-export overwrites this, so run the same step again after any export.
- Weakest shot: 5 (the grin reads as a mask; needs proper teeth and a less symmetric face).

## Run 2 - 2026-10-10 (style upgrade, frames redone; not exported)

- Re-measured pixel pitch (edge periodicity): close-up refs 8.05 px, a wide ref 5.75 px, the bathroom ref 2.25 px at 720p (320 lines). Internal resolution now 180x320 (6 px).
- New reference (bathroom animation) studied: references/1bit/bath_sheet.png, bath/*.png; compare sheet references/1bit/cmp_round3.png.
- Kit: anatomical face (shadow plane, terminator hatch, nose plane + cast shadow, nostrils, lips, lids/lashes, iris + catchlight, bags, ears, tendons, strands), flesh grin (gums, irregular teeth, folds, tense lids, asymmetry), bold subtitle font with outline, drop shadow and dithered plate, bathroom props, light-falloff pass with emissive pixels, lights-out mode, rim-lit profile.
- Look rounds: (1) global falloff made everything grey mush, cheek hatch read as bruises, eye lines as goggles, nose shadow a blob -> flat grey planes, r0 >= 200, fewer eye lines; (2) the hand was stroked at arm width (a blob), grin too wide (lines outside the face), nose bar -> fixed; (3) compare vs refs: frames busier and greyer than refs -> lighter falloff, cleaner shirts, bigger reflection in shot 4.
- Staging: 3b is now a two-shot (the person's rim-lit profile blinks in the foreground, the reflection stares); the reflection's hand rises 1 s late and slowly so at 4.9 s it is still at chest height; storyboard has a 7th panel for the lights-out (12.2 s). Cue times and SUBS unchanged, score.js untouched.
- build: syntax ok; textcheck PASS (0 cut-off, 0 in safe zone); tile 24,120,250,330 deterministic: true (~95 ms/frame).
