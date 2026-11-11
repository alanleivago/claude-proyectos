---
type: note
status: active
tags: [teke-teke, yokai, storyboard, qa, railway, snow]
relatedTo: [pieces/black-cave/LOG.md, styles/yokai/RULES.md, pieces/teke-teke/brief.md]
---
# LOG — teke-teke

## 2026-11-10 — first build up to the storyboard (~30 min)
- **Reused:** pieces/black-cave/src (person rig, poseP / two-bone IK / jointed fingers, wallMesh helpers, ofuda, ykPara / ykCard / ykBadge, the render path and toon conversion). The cave sets, the pale crawler and the headlamp were dropped.
- **New:** the snowy town set (`mkTown`: track, block wall, houses, poles and wires, crossing poles with lamps, bells and barrier arms, train, bags, trail), the girl (`mkGirl` / `poseGirl` / `fingerPtsG`, hair strands), the gakuran boys, falling snow, the dawn preset, `crossing()`, `layTrail()`, `walkP` with stride / lift / swing (running).
- **Kit:** 脚 hand grid in `YK_SEALG` and 脚 in the early font load.
- **Card:** new Flow project, card1 + card3 uploaded, three generations. #1 copied card1's wave composition (rejected); #3 was an unreadable pixel-blob creature (rejected); #2 matches the design (sailor girl on her elbows by the tracks, red crossing light, smear) and was kept. It is more pixel-art than woodblock, but the ykCard print palette at pw 96 hides that. No Flow errors.

### Creature self-check (`review/selfcheck.png`: crawl side, 3/4, front, face close-up, wall lean)
- Teeth: upper row hangs from the upper lip, lower row rises from the lower lip, both inside the grin. OK.
- The waist end stays under the ragged hem with a dark inner cap; no gore. Nothing floats: shoulders, elbows, cuffs, palms and fingers connect.
- Fixed: a vein line and the nose bar formed a "K" in the middle of the face (veins now stay on the cheeks, the nose is two nostril dots); the head was too round (now 0.86 × 1.16).
- Fixed: the white blouse disappeared against the snow, so she is in a navy winter uniform now (pale face, arms and fingers read on it).

### Numeric pass (`review/scan.mjs`, every 0.25 s)
Checks: camera vs ground, wall and poles; boys' feet vs ground (rail height in beat 10), arm reach, hands/feet in the wall, camera in a person; girl upper-arm and forearm lengths, fingertips vs ground and wall, elbows/waist vs ground, body in the wall, head at camera, her head vs Kenta's head, wrists inside Kenta.
- Found: in `wallLean` the arms were crossed (arm 0's elbow on the far side of its shoulder), upper arm 0.44 m. Fixed (arm order swapped, elbows 0.2 m out).
- Found: wall-lean fingertips curled into the wall face. Fixed (palm 5 cm off the face, small curl).
- Found: crawl fingertips 4+ cm under the snow every stance. Fixed (flatter stance hand).
- Found: Kenta's arms overreached while running. Fixed (smaller swing, hands higher).
- Found: forearm length drifted in the drop blend. Fixed (wrist re-solved at forearm length).
- Result: clean except one sample at 39.25 (upper arm 0.43 m mid-drop, a 0.1 s blend frame).

### Frame scan (every 2nd frame, 108×192 diff + worst cell)
- Spikes only at the cuts and dithers, the hook / hit red lamp flashing, the 41.8 in-shot cut, the black 45.0–45.6, the train pass and the bag push-in, the badge and the end.
- Found: tracking shots over the track strobed (sleepers sliding through the foreground). Fixed: sleepers half-buried in the snow, and beats 5 and 8a use a fixed camera that pans instead of tracking.
- Found (visual): the walk had deep knee bends; `walkP` subtracted the ankle height twice. Fixed.

### Visual pass fixes
- Hook: camera raised and moved back so she is 35–45 % of the height, upper half, hands above the paragraph.
- Wall shot: she was hidden behind Kenta and a pole; she moved 2 m and the shot is on her.
- Chase: the chase-cam from behind her put her under the paragraph and then out of frame; now a frontal camera ahead of Kenta, offset toward the track, from 41.8.
- Hit: red light on Kenta's face lowered; front hair strands removed from her face.
- Train beat: the bag was unreadable, so it is a brighter red-brown and the camera pushes in to it after the train.
- Dawn preset brightened (it read as night).

### Weak panels (honest)
- **Panel 8 (42.4):** she is small behind Kenta in the frontal chase; the crawl reads best in the side view (39.4–41.8).
- **Panels 1 and 7:** the wet hair is straight strips, a bit "barcode" over her torso.
- **Panel 9:** Kenta's face is a flat red-orange under the lamp; her face carries the shot.
- **Panel 11:** the train side is a plain box with windows; no motion blur.
- **Panels 13–14:** dawn is still bluish-dark; the near crossbuck sits edge-on in the middle.
- The face design (round black eyes + split grin) may read doll-like; taste call for the user.

## 2026-11-10 — user review: redesign + 6 points, export, sonido pro, final QA (~50 min)
- **Redesign (the girl):**
  - New 512 px face: narrow and gaunt, grey-blue waxy skin with mottling and veins, sunken cheeks, small eyes deep in dark hollow sockets with the whites showing, pinprick red pupils (texture plus 2 mm emissive glints), uneven brows.
  - The mouth is stretched too wide, with thin cracked lips, dark gums and small uneven teeth (upper teeth hang from the gum, lower teeth rise from the lip, a few gaps).
  - The head is narrower (0.8 × 1.18 × 0.92). The hair cap was pulled back off the face; it had been hiding the eyes.
  - Hair: 38 clumped strands of varied width (0.5–2.4×) and length (0.32–0.86 m) with thin tips, plus 5 wet strands stuck across the cheeks. Strands lie on the wall top or hang down its face (wall collision).
  - Arms: upper arm 0.39 m, knobby oriented elbows, torn ragged sleeve cuffs at the elbow, dark broken nails.
  - Uniform: navy winter sailor uniform, torn (pale rips), soaked patches, dirt and snow caught in the cloth.
- **The 6 points:**
  1. **Hit:** Kenta has a modelled face (eyeballs with irises, lids, brows, nose, a mouth that drops open; `P.setFear(k)`), paler skin, grey-black hair that reads against the sky, a rim light and a slow push-in. Both faces sit above the text.
  2. **Hair:** as above.
  3. **Chase:**
     - She drops off the wall (side pan camera).
     - Then a low 3/4 front camera on her: face, planted hands, elbow gait.
     - Snow is kicked up at every hand plant (`kickSnow`, timed on the plant clock) and under the dragged waist.
     - She now accelerates (`gS = 3τ + 0.125τ²`), so she really closes in. From 43.1 a wide side shot shows her right behind Kenta.
  4. **Train:** a commuter train with a raked cab, destination sign, headlights with glare sprites, lit windows with frames and seat silhouettes, doors, and bogies with spinning wheels. Speed comes from motion streaks, snow blasted off the track (1400 particles) and a camera shake during the pass.
  5. **Dawn:** the camera is on the road side (the crossbucks are face-on at the right). The sky is pale cold with a warm horizon band, the sun low (long shadows) and the fog lighter.
  6. **Hook wall:** the rust streaks are now dark meltwater drips and wet patches. The red light is a narrow spot on her, and the red point light on the wall is down to 30 %.
- **Pre-export QA:**
  - Numeric pass clean after `GL.uArm` 0.39.
  - Frame scan: two real pops found and fixed by burying the sleepers fully in the snow (a sleeper edge swept under the low chase camera; the bag push-in passed over sleepers).
- **Export:** `export.mjs --share` (1704 frames, about 150 s).
- **Sonido pro** (`sound/`):
  - 21 Freesound CC0 folders (key via `zsh -ic`) plus the Commons wind. Picked with earshot rank → find → realness.
  - Manual swaps: the crow (the top rank had cats and dogs), the whisper (a real spoken whisper), the snow wind (the first pick scored 0.23 real) and the bell (a real Japanese fumikiri grain instead of a bicycle-like bell). The dog was dropped (birdsong in it).
  - The mix follows the picture's clock:
    - one bell strike per lamp switch (`k / 2.3`, the hook offset by 0.3 s);
    - nail taps on the fingerPtsG tap phase;
    - both boys' steps on the walk cycles; Kenta's running steps on the L 1.15 cycle;
    - the teke-teke as knock + nail + snow crunch on every elbow plant from the `gS` inverse;
    - the barrier motor at 43.0–44.6 and 51.8–53.2;
    - the train pass-by placed so its envelope peak lands at 54.5 (one pass, no other event in the window); the horn at 53.05;
    - the bell stops at 57.4–57.8.
  - The hit at 45.6: sub drop, impact, a bell clang, a cluster, a gasp, then the whisper.
- **Final QA:**
  - Loudness: −15.4 LUFS, true peak −2.1 dBTP after AAC, exact digital silence 45.0–45.6.
  - review.mjs: text PASS, story arc 5/5, dead beats PASS. The loudest 100 ms is at 45.6. The flat frames are only the planned ones.
  - earshot timeline: 93 % of the 60 picture cues have an onset within 40 ms (98 % within 100 ms), median offset 6 ms.
  - earshot critique: flags music presence / onset rate (launch-film metrics, ignored), final_lu and LRA (the hit and the decaying end, by design), cuts with sound, and p_real 0.76 with 8–12 s still scored synthetic.
  - revisar_render: CASI.
- **Fix round (one):**
  - The train pass and horn were louder than THE HIT on momentary LUFS: lowered −13.5 dB in total, plus a hold-down. Now the hit (46.0, −10.7 LUFS) is the loudest moment.
  - Synthetic-sounding town bed: buzz, hum and drone lowered and the wind swapped.
  - From revisar_render:
    - Kenta's head read as "cut in half" (black hair on black sky): lighter hair, rim light.
    - Kenta's orange cheeks: removed. His eyes were too big: smaller.
    - The static hit: push-in.
    - The boys looked frozen mid-stride when they stopped: feet together.
    - She turned away while "smiling at us": she faces the camera.
    - Kenta's legs swept past the lens at 44: wide side shot.
  - The breath at 28.3–32.6 was transcribed as "Oh": swapped to a breath without voice.
  - Full re-export and remux.
- **Final file:** `renders/The Girl Who Wants Her Legs Back.mp4` (= `renders/share.mp4`).
- **Left as minor:**
  - The bag push-in camera passes just over the P2 barrier arm (a brown band for about 0.2 s at 56.9), and the bag then sits at the top edge of the paragraph.
  - The 43.1–44.2 camera blend is fast (a whip move).
  - The train side still reads plain at phone size.
  - Kenta's face is modelled but simple (round eyes, O mouth).
  - Translucent hair shadows on the wall in the hook and wall shots.
  - The critique still scores 8–12 s as synthetic (p_real 0.76 overall).
