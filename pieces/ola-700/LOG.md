# LOG — ola-700

## Run 1 (build + look check, no export)
- Copied template (sol-explota) piece.json + src; new head (9 shots/acts, cues, board), new scenes.js (harbour world), new score.js.
- Look rounds (stills at 2,10,22,34,46,55,57 vs references/lunar sheet5 / wave_end / wv_keys):
  1. Whole harbour white: `landBlock` normal sign flipped → both land blocks covered the sea. Fixed. Deck overexposed → sun 2.0, darker paving. People too big in the foreground → removed bench sitters and the near walking band.
  2. Raised the promenade (deck 5 m above sea) so the drained bed reads; opened the harbour mouth (left quay and city pushed out); towers moved back (D 950–2600 m, h ≤ 0.3·D) so the skyline is a cluster below the frame top; crest kept in frame by capping the visual height to the camera's pitch + 26°, including the lip overhang.
  3. Bed still white: the remapped bed plane had flipped winding (back-face culled) → fixed (v = 0.5 − z). Wave face darkened, streaks sparser/softer, foam faded with distance so the far wave reads as a dark line; early visual height exaggerated (×4.5 → ×1 by 38 s). Wave shadow driven by the true height (promenade goes into shade ~49 s). Tree canopies were white (material colour) → green. Spray puffs toned down.
- Determinism: `tile.mjs 24 400 900 1300` → deterministic: true; 2.1–2.6 s/frame.
- Audio: `export.mjs --only-audio` works without frames. Loudest 100 ms = impact (57.75 s, −7.1 dB) vs roar −12 dB; silence 58.4–61 at −82 dB.

## Weakest / to do
- Foam streaks still read a bit like regular bars at mid distance; people are simple capsule figures; tower splash bursts are small; the HUD sits over the life ring at the left edge (feathered, readable).
- Can't listen: the mix is measured only.

## Run 2 (polish + export + review)
Polish (user's list): organic foam streaks (wandering, swelling/tapering, noise-broken, branching flows + thin trickles, 3 layers at different speeds, per-column opacity, blurred-mip mist where they spread); people rebuilt with tapered lathe limbs, knees/elbows, shoes, hands, neck, shaped torso (shoulders/waist), cloth fold texture, long hair for some; tower swallow = foot burst + 5 spray columns climbing the face + mist veil (pool 520 sprites); title 3 lines auto-fit (~84 px) inside x 60-940; camera moved closer to the railing (z 7 -> 4.6, pitch -4.5) and foreground life added (bicycle that falls in the wind, dog with its owner, puddle, drain grate, stains/gum/wear decal, leaves that blow towards the camera from 41 s, gull shadows, a bag/umbrella/hat dropped in the panic); stronger, larger feather under captions, HUD and title (styles/pov3d/kit.js); clouds drift, breathe and change opacity.
Sound v2 modelled on the reference (shotlog + spectrogram): buses + room + far echo, siren as the main voice from 17.6 s, full-band roar slam at 44.8 s, Doppler cars/gulls/horns, crowd panic, barking, gusts, ground rumble, 0.8 s vacuum before the hit; mix-only -2 dBFS look-ahead limiter for true peak. Rebalanced (4 rounds) so the gift act beats the peak act in the review's 8 kHz mono measure.
Export: frames 1848 s (~1.2-1.9 s/frame), final.mp4 + share.mp4; audio re-exported with --only-audio --share.

Review (final): cuts PASS (none); text PASS (0 cut-off/overlap, 0 in safe zone); dead beats PASS; story arc PASS 5/5 (gift p90 -12.1 vs peak -13.6; calm median -46.1); loudest 100 ms 57.6 s -6.9 dBFS in the gift act; 0.8 s at <= -40 dBFS right before it; -15.7 LUFS, true peak -1.2 dBFS. FLAT FRAMES 1408-1466 = the intended blackout (58.7-61 s).

| shot | time | PASS | notes |
|---|---|---|---|
| 1 puerto | 0-5 | PASS | title 3 lines readable at phone size; walkers, dog, bike, gull shadows |
| 2 retirada | 5-14 | PASS | water drains, boats heel, fish/puddles; people stop and turn |
| 3 calma | 14-17 | PASS | silence act (-46 dB), dog sitting, drained harbour |
| 4 línea | 17-26 | PASS | dark line readable from ~22 s (visual height exaggerated early) |
| 5 crece | 26-40 | PASS | people run past, flock flees, dropped bag/umbrella |
| 6 muro | 40-52 | PASS | streaks organic; tower bursts big (soft-edged white disks, see weak) |
| 7 impacto | 52-58 | PASS | retreat + tilt up, shade, vacuum, hit loudest |
| 8 negro | 58-61 | PASS | white-out then black, silence |
| 9 final | 61-65 | PASS | end card fades in line by line |

Weakest: the tower bursts read as round white disks at mid distance; people faces are blank; the HUD sits over the left life ring.
