---
type: note
status: active
tags: [noppera-bo, yokai, storyboard, qa, face, rain]
relatedTo: [pieces/noppera-bo/brief.md, pieces/the-rake/LOG.md, styles/yokai/RULES.md]
---
# LOG: noppera-bo

## 2026-11-03: build up to the storyboard
- **Reused** the-rake's `src/` (the minka, flick/broken lights, rig).
- **New:** `src/chars.js`:
  - the rainy footpath, the jizō (red bib, roof, candle), a tōrō, susuki, rain streaks (LineSegments);
  - `mkPerson`: grandfather with sugegasa, mino and chōchin; the crying woman; grandmother;
  - `kneel` (seiza), `walkMan`.
- **Card:** in Flow, the style ref made it return the ref itself. Without refs, #3 has a blank face. Seal 無, with a hand grid.
- **QA:** numeric pass every 0.25 s (camera vs ground, walls and heads; feet) clean. The frame scan flagged nothing, but the rain raises the noise floor.

## 2026-11-03: round 2 (user: fix the weak points, make the face opening more disturbing)
- **The face is now two skin flaps** (front quarters of a shell, hinged at their outer edges). They swing open like eyelids, in 5 jerks over 31.6–33.0. Under them:
  - raw flesh with dark veins;
  - two sunken asymmetric eyes with raw rims (red pin on the left, white on the right);
  - two rows of irregular, tilted human teeth on red gums around a black pit;
  - six flesh strands stretched between the flaps, which snap one by one as they part.
- **Fixes:**
  - The hook's candle glow is bigger.
  - The road shot is closer on him.
  - The sleeve shot gets a warm key from his lantern on her face.
  - The run is filmed from behind him toward the house, with the shōji glowing warm.
  - The end face sits clear of the badge.
- Numeric pass: clean.

## 2026-11-03: export + sound + final QA
- **Sound:** the-rake's Freesound picks plus 8 new CC0 queries (rain, heavy rain, woman sobbing, mud steps, wet running, flesh tearing, scared man breathing, wooden creak), picked with earshot. Every sound sits on the picture's clocks:
  - candle and lamp stutters on `broken()`;
  - steps on walkMan contacts;
  - five wet tears on the face's 5 jerks.
  - Silence exactly 29.4–30.0. THE HIT at 30.0 is the loudest moment.
  - −15.2 LUFS, −4.3 dBTP.
- **review.mjs:** arc 5/5, text PASS, dead beats PASS.
- **revisar_render:** CASI. Fixed in one round:
  - The lantern was under the text.
  - The jizō read as brick. It is now a darker stone body with a bigger head and bib, and no cup.
  - The flaps opened too far and looked detached. The angle is down from 1.75 to 1.2.
  - The blank face looked white like a helmet. It is now skin-toned.
  - The beat 4 text now matches the hook ("asked to see her face").
  - The end camera moved off the post cross.
  - The card print is down from pw 110 to 88.
- **Left (minor):**
  - his hand enters the sleeve shot without the arm;
  - the feet read as blocks, not waraji;
  - the interior palette is all warm;
  - the hook shows her back, not her face (by design).
- Sent to Telegram.
