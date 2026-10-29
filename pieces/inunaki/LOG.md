---
type: note
status: active
tags: [inunaki, yokai, storyboard, qa]
relatedTo: [pieces/floating-teacher/LOG.md, pieces/umibozu/LOG.md, styles/yokai/STYLE.md, pieces/inunaki/brief.md]
---
# LOG — inunaki

## 2026-10-27 — first build up to the storyboard
- Structure from pieces/floating-teacher (piece.json build list, head, scenes, kit, render3D, ykPara/ykCard/ykBadge, point rig with two-bone IK and jointed fingers). World, textures and shots new: outdoor heightfield road cut + portal + 80 m tunnel + drowned village; 1990s white sedan; brother; 11 villagers.
- Card: 3 Flow generations (Nano Banana Pro 4:3, earlobe prints as style refs). #3 came back unrelated (a whale) → rejected; kept #1 → `assets/print.jpg` (border cropped).
- Held props: the grip is now solved per person — finger curl scaled until a least-squares circle through the curled finger joints and the palm (Kasa fit) matches the bar radius; flashlight barrel / sickle handle sized to it, centred on the fitted point (holdProp). Brother bar r 1.9 cm, joints 5–11 mm off the bar (finger radius 7 mm).
- Mirror shot: a reflection camera at the rear-view mirror (normal bisects eye and target), rendered to a target and shown flipped on the mirror glass; flat-mirror FOV is tiny, cheated to 6° so the hand reads.

### QA found and fixed (frames every 0.25–0.5 s + numeric pass every 0.25 s)
- Villager design read as a stocky mummy → longer legs/arms/neck, thinner chest, lumpy skull, flat bandage strips instead of string tori, smaller sunken bloodshot eye in a dark wet gap, crossed-collar "X" read as suspenders → proper V collar.
- Hook: creature small and its head out of the low beams → high beams, closer low camera; head now against the dark arch above the blocks.
- Road shot: camera inside a cedar cone / below a slope (all black) → head-on shot from the shoulder; cedar cones slimmed, bush/puddle cleared at the camera.
- Sign: English line ran off the board in the texture → smaller font; framing centred.
- Brother's face hidden by the hair cap sphere → cap moved back; sukajan UVs were for a sphere (lathe/capsule u=0 is the front) → tiger on the back, zip in front.
- Brother walking away with his back to us while "laughing" → he walks backwards facing us laughing, then cut to over-the-shoulder inside.
- Crouching villager: body frame flipped at >90° lean (spine parallel to chest normal) → chest normal leans with the spine, lean capped; right hand reached across to the left side → flashlight moved to its right; hand 20 cm short of the flashlight → deeper crouch; fingers through the floor at the grab → fingers open while reaching, close over 0.4 s while lifting; left hand through the floor → it plants flat on the floor, palm down.
- Flashlight strap stub poking into the ground → removed. Brother's left wrist IK short by 1.5 cm while walking → hang distance fixed.
- Mirror view hidden by the rear seat back and the trunk line → seat lowered, car starts farther, flashlight closer to the villager's feet, mirror brightened.
- Today shot: the flashlight was under the paragraph and black on black → yellow body, camera ends with it above the text.
- Numeric QA (every 0.25 s: camera vs ground / tunnel bore / car / heads; arm and leg IK reach; feet under ground and villagers' feet on the floor; heads/shoulders/elbows vs the tunnel bore; crossed hands; any mesh under the floor; props in the fist; flashlights above ground; car on its wheels): clean.

- Frame-by-frame scan (all 1704 frames, consecutive-frame diff at 108×192 + worst cell): a pop in the mirror shot (59.75 / 60.33) traced to a mist sprite crossing the mirror camera's near plane → mist fades out within 5 m of the camera; also mirror glass 1 mm from its backing (z-fight) → moved off; mirror camera near plane 0.4 m; mirror group hidden while rendering the reflection; instanced meshes no longer frustum-culled; the lifted flashlight's spot no longer sweeps across the headliner. Remaining spikes are planned: hook fade-out (4.3), the beam sweeping onto the sign (18.3–18.7), the run and the whip back (56.6–57.9), the final fade (70.1).

### Still weak
- Panel 14 (mirror) is small and dark at phone size even after the cheats; panel 9 (far tunnel) is mostly black by design.
- The close wrapped face (panel 12) reads, but the head is still a smooth pale oval.
- The dogs in the village are small silhouettes.

## 2026-10-27 — round 2 (user notes on the board)
- Hook (panel 1): close low camera (1.4 m) on a fixed planned tilt, no head tracking. The wrapped head and its eye sit in the top third, entirely above the paragraph, against the dark arch. A warm fill lights the face.
- Bandaged face (panel 12): the skull is deformed (stronger lumps, a flattened side, sunken cheek) with a deep crater socket and the eye set inside it. The flat string bands are now 11 raised strips: lathe rings with thickness, rounded edges and wavy folds, layered at different radii so they overlap, in three dirty tones with drip stains instead of round spots.
- Panel 14: the in-car mirror is gone. A direct low shot at the mouth replaces it: the lit flashlight on the wet asphalt, a long wrapped hand comes down (fingers open while reaching), closes on it over 0.4 s while lifting, keeps it in frame and aims the beam at us. Red tail light of our car pulls away behind the camera. Glare kept below full-frame.
  - The blue/teal area at the bottom of the old panel 14 was a bug: the car body is one extruded solid whose top cap (y 0.84) spans the whole car, so from the driver's seat that flat white-paint surface (lit teal by the moon) showed as the cabin floor/hood. Not used any more; nothing like it remains in the board.
- Badge (panel 15): checked against pieces/umibozu. The call is the same: ykBadge(asset('kodama.jpg'), 'kodamashorts', CX, 290, ...). kodama.jpg is byte-identical to umibozu's. Side-by-side renders at 68 s are pixel-identical in size and position (plate centred on CX).
- Village through the tunnel (panel 9): fog for that shot starts at 34 m and fades to teal, sky and lantern lights up. The far mouth now reads as a lighter teal arch with lanterns and roof silhouettes, and the tunnel stays dark.
- Corridor (panel 11): each villager has its own height (0.9–1.1), lean, body twist, head tilt and turn amount. Robes now reach mid-shin with dark leg wraps and longer, wider ragged sleeves. The kimono cloth is mottled instead of striped, and the cloth combos are spread out. Three of them carry a lit chōchin on a stick in the left fist (real lights), and the rest hold sickles. Headlights are softer so the robe colours show.
- Card seal (panel 2): ykSeal in styles/yokai/kit.js takes an optional glyph (real Hiragino Mincho glyph rasterised to a 16×16 grid, white pixels on red, several glyphs stack and the seal grows taller). The default with no glyph is the old mark. ykCard passes o.seal. The template's run.js shows the option. Inunaki uses 犬鳴, which is legible.
- QA again: numeric pass every 0.25 s clean (plus new checks: lantern in the left fist, lantern above the floor and inside the bore). Full 1704-frame consecutive scan: only planned spikes (hook head lift and sickle raise, hook fade 4.3, beam onto the sign 18.3–18.7, run and whip back 56.6–57.9, final fade 70.1). The new ground shot and the corridor have no pops.

## 2026-10-27 — round 3: approved board → final
- Text 13–14: "I ran. Behind me, his flashlight lay on the ground, and a wrapped hand picked it up." Text check PASS (fits, decodes 55.4 s, out by 63.75 s).
- Hook sickle: the blade is now a pale steel crescent (bevelled, with a white honed inner edge and a dark spine). It is held in the fist with the handle up and the crescent across the throat under the chin, between the head and the paragraph. The hook figure wears a darker robe, so the head and blade separate from it. Numeric QA clean. Frame scan 0–4.5 s and 55–64 s: only smooth motion during the raise (no pops).
- Export: renders/final.mp4 + share.mp4 (1704 frames, 71.0 s).
- Sound pro (sound/mix.py, CREDITS.md): Freesound CC0 picked with earshot + Commons + code. Master: pre-normalise, compressor 4:1 above −25 dBFS (10/150 ms), body ride ≤ +9 dB (off around the card and the reveal), limiter ceiling −3.4 dBFS for AAC headroom. Card bell/boom lowered so the reveal owns the loudest 3 s.
  - Final: −14.6 LUFS, true peak −1.6 dBTP (AAC), exact silence 45.0–45.6, loudest 100 ms at 45.9 s, loudest 3 s 45.5–48.5 (+2.9 LU).
- Review (scratchpad review.mjs): story arc 5/5 PASS, text PASS, dead beats PASS, cuts PASS. The flat frames are the planned blacks (card out, 45.0–45.6, fade in at 64, the last frame).
- earshot critique: 19/21 in range. The open majors are launch-film flags (onset density, onsets on visual events), ignored per the yokai rules. earshot timeline: 84 % of cuts have an onset within 100 ms.
- Final-file consecutive-frame scan (all 1704 decoded frames): only the planned whip back (57.0, 57.7) and the final fade.

## 2026-10-28 — round 4 (user notes on the final)
- Hook: camera pulled back (5.9→5.55 m, fov 52) so the villager's whole robe, the raised sickle, the graffitied blocks and the dark arch read. Head and eye stay in the upper half (≈y 0.36). The sickle crescent ends above the first text line.
  - A failing sodium lamp hangs on a bent pole in front-left of the mouth. It has a visible fixture plus glow sprite and a real SpotLight with shadows. On/off follows an irregular table (LAMP in run.js, 13 spans): lit when on, near-silhouette against the headlight-lit blocks when off (headlights cut to 30 %, hemi/moon lowered). The lamp is dead in every other shot.
- Card seal: ykSeal (styles/yokai/kit.js) is back to the original 9u square with a 7×7 grid of u-pixels.
  - An optional glyph replaces the spider mark: ONE character, rasterised from heavy Hiragino Kaku Gothic by box-filter coverage, so every stroke survives at 7×7.
  - The font is requested early, and a blank grid (font not ready) is never cached.
  - Two bugs fixed on the way: a comment had swallowed the fillText, and a StdN font name drew nothing.
  - Inunaki uses 犬.
- Car arrival SFX: the bug was the idle bed. The "car start/stop" recording 511676 has a drive-up and stop inside it, so its loop played an arrival around 24 s.
  - Replaced with a steady idle (772236 Toyota, crossfaded loop).
  - The picture now shows the arrival: in the rear shot the car rolls in and stops at CAR_STOP = 14.3 s with brake lights. An approach recording (119827) is aligned so its closest moment lands on the stop. The brake squeal (508901) ends on the stop frame, a suspension thunk sits on it, and the handbrake comes 0.6 s later.
  - The pull-away at 59 s now revs as we cut (s0 1.6).
- Lamp sound: a code 100 Hz hum + the recorded flicker buzz (232446) gated to the on spans, plus a click on every switch and arcing ticks when it comes on (same LAMP table).
- Also fixed while checking: the card bell's 49 Hz partial rang until 11.55 s and was then cut off, causing a level drop under the road shot. The card bell is now 4.5 s and fades to zero.
- The stop accent (thunk + tyre scrub ending on the frame) measures a +7 dB jump at 14.28 s, and the handbrake follows at 15.05.
- Re-export + re-mix: −14.7 LUFS, true peak −2.1 dBTP (AAC), exact silence 45.0–45.6, loudest 100 ms 45.9 s, loudest 3 s 46–49 s (+3.1 LU).
- QA:
  - review.mjs: story arc 5/5, text, cuts and dead beats PASS; flat frames are only the planned blacks.
  - earshot timeline: 27 visual events (cuts + lamp flickers), 96 % with an onset within 100 ms.
  - earshot critique: 20/23 in range, realness 0.83. The remaining flags are the launch-film ones (music presence, onset density, cut onsets).
  - Numeric QA clean.
  - Final-file frame scan: the spikes are the 12 lamp switches (intended), the 57 s whip and the final fade.
- Review stills: review/frame-1.png, frame-2.5.png, frame-4.png, frame-7.4.png (card).
