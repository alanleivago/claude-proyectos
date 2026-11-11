---
type: brief
status: active
tags: [teke-teke, yokai, storyboard, railway, snow, kodamashorts]
relatedTo: [pieces/black-cave/brief.md, styles/yokai/RULES.md, styles/yokai/STYLE.md, pieces/teke-teke/LOG.md]
---
# Teke Teke — brief

## Spec
- 9:16, 1080×1920, 24 fps, 71 s (1704 frames), English first-person paragraphs (`ykPara`), no voice. Style **yokai** (216×384, 3-band toon, teal palette with warm browns, warm 2×2 dot screen, fog, no vignette).
- Idea from theredarchivesyt's "Teke Teke" (`references/tiktok/theredarchives/teke/sheet.png`): idea only. Our place is a snowy Niigata town, our text and models.
- Card: Flow / Nano Banana Pro (srz-google-flow-mcp, new project, refs `references/earlobe/card1.png` + `card3.png`). Kept #2 → `assets/print.jpg`. `ykCard` pw 96, seal 脚 (hand grid added to `YK_SEALG` in `styles/yokai/kit.js`). Badge `ykBadge` (kodama.jpg) from 66.2 s, same call as black-cave.

## World (src/world.js, one set)
- A single-track railway along x (centre `TZ`), rails on a snowy bed with half-buried sleepers; a long concrete block wall (`WZ`, top `WT` 1.93 m) with a snow cap and icicles; a footpath between them.
- Houses with warm windows and snowy gable roofs behind the wall and across the track; utility poles with wires; two street lamps; a vending machine glow.
- The level crossing at `XC`: two poles with alternating red lamps (`crossing()` drives the lamps, glow sprites and the red point light `Wd.red` on the snow), crossbucks, bells, black-and-yellow barrier arms. Faded ofuda on the near crossing pole and on the wall by its end.
- Falling snow (far 1 px + near 2 px flakes in a box that follows the camera), teal fog, night and dawn presets.
- The trail: instanced dark smear quads + elbow prints on the snow (`layTrail`).
- A 4-car train with lit windows and a headlight; her school bag (beat 3) and Kenta's red-brown bag (beat 10).
- **The girl** (`mkGirl` / `poseGirl`): upper body only, posed from world points. Navy winter sailor uniform with a white-striped collar and a red tie, a ragged blouse hem over a dark waist end (no gore), long thin arms (0.36 + 0.36 m) with 4-joint fingers and short broken dark nails, a grey-white elongated head with too-wide black eyes (a red pin of light in each, plus emissive glints), a grin split cheek to cheek with upper teeth hanging from the upper lip and lower teeth rising from the lower lip, a wet black hair cap and 4-segment strands that hang under gravity and lie on the snow.
  - Poses: `wallLean` (elbows on the wall top, forearms and fingers down the front face), `crawlSt` (fast elbow crawl: each arm plants elbow + forearm + hand, sweeps back, flicks forward; cycle 1.2 m of travel), `lerpSt` (the drop off the wall), `clingSt` (on Kenta's back, face beside his, hands spread on his chest).
- **The boys** (`mkPerson`): black gakuran with stand collar and gold buttons, scarves, backpacks (me navy, Kenta red-brown). `walkP` stands, walks and runs them.

## Beats
| # | time | picture | paragraph |
|---|---|---|---|
| 1 | 0–4.5 | HOOK: she leans over the snowy wall top grinning, head tilts, fingers dig; red crossing light flashing on her and the wall | If you hear 'teke, teke' behind you near the tracks, don't run. My friend ran. |
| 2 | 4.5–8.5 | card Teke Teke, seal 脚 | (same) |
| 3 | 8.5–14.6 | the snowy crossing at night, a girl's bag dropped by the rails | In our town in Niigata, a girl slipped on the tracks one winter. The train cut her in half. |
| 4 | 14.6–20.6 | empty tracks, elbow drag marks and a smear in the snow | They say the cold kept her alive long enough to crawl. She's still looking for the rest of her. |
| 5 | 20.6–26.6 | the two boys walk along the wall | Kenta and I walked home along the line after cram school. |
| 6 | 26.6–32.6 | they stop (28.1) and look back: nothing | Then we heard it. Teke. Teke. Teke. Like nails on frozen concrete. |
| 7 | 32.6–38.6 | the girl leaning over the wall; from 35.6 she drags herself over, the empty hem hangs | A girl was leaning over the wall, smiling at us. She had no legs. |
| 8 | 38.6–45.0 | she drops (38.6–39.4) and crawls after Kenta (side, then frontal from 41.8); black 45.0–45.6 | Kenta ran. She dropped off the wall and came after him on her elbows, faster than he could run. |
| 9 | 45.6–51.6 | THE HIT: her face beside his, pulsing red light, her fingers tighten on his chest | She caught him at the crossing and whispered, 'Where are my legs?' |
| 10 | 51.6–58.6 | barrier down (51.8–53.2), train 53–56.3, then only his bag on the tracks (push-in) | He didn't know the answer. The barrier came down. The train went past. |
| 11 | 58.6–71 | the crossing at dawn, the bag gone; badge 66.2; fade 70–71 | I knew the answer. I still whisper it every night before I sleep. |

## Sound plan (after the board is approved: "sonido pro")
Notes per panel are in the storyboard and `TIMELINE.board`; cues in `TIMELINE.cues` (stop 28.1, over 35.6, drop 38.6, land 39.4, black 45.0, hit 45.6, barrier 51.8, pass 54.0, lamps off 57.4). The bell and the lamps share the clock in `crossing()` (1.15 Hz alternation). Exact silence 45.0–45.6; the hit at 45.6 is the loudest moment.
