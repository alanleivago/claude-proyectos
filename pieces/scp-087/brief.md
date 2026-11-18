---
type: brief
status: active
tags: [scp-087, yokai, storyboard, stairwell, school, kodamashorts]
relatedTo: [pieces/teke-teke/brief.md, styles/yokai/RULES.md, styles/yokai/STYLE.md, pieces/scp-087/LOG.md]
---
# SCP-087 — brief

## Spec
- 9:16, 1080×1920, 24 fps, 71 s (1704 frames), English first-person paragraphs (`ykPara`), no voice. Style **yokai** (216×384, 3-band toon, teal palette with warm browns, 2×2 dot screen, fog, no vignette).
- Idea from theredarchives' SCP-087 (`references/tiktok/theredarchives/scp087/sheet.png`): idea only. Our place is a school in Sendai; our text and models.
- Card: Flow / Nano Banana Pro (srz-google-flow-mcp, new project, refs `references/earlobe/card1.png` + `card3.png`), kept #3 → `assets/print.jpg`. `ykCard` pw 96, seal 階 (hand grid added to `YK_SEALG` in `styles/yokai/kit.js`). Badge `ykBadge` (kodama.jpg) from 66.2 s, the same call as teke-teke.

## World (src/world.js, two sets far apart)
- **HALL** (origin): a corridor along x. Linoleum floor with mop swirls; a classroom wall with sliding doors (class plates) and transom windows; a window wall with moonlight through the frames and Sendai rooftops behind; shoe lockers; a yellow mop bucket with a wringer; a fire extinguisher and notice boards; fluorescent fixtures (off). At the end wall (x 0): the grey steel STAIRS door with no window, a green STAIRS sign, a 階段 plate and a torn ofuda on the frame. It is hidden at dawn, and a notice board takes its place.
- **WELL** (x 200): a grey concrete switchback stair that only goes down.
  - 19 landings at y −1.5 n, 8 treads per flight, sloped slabs under the flights and an open well between the lanes.
  - Handrails and posts along the well, and painted numbers on each landing's end wall (`setNums` relabels them for any depth, B1…B90).
  - A caged bulb on every landing: most are dead and a few flicker (`setBulbs`).
  - A torn ofuda on the top door frame. Teal-black fog (`LIGHT.well`).
- **Flashlight:** `Wd.lamp` is a spot from the lens of a torch held in the janitor's right fist (`holdProp`), with a faint additive beam cone. Planned drop-outs are listed in `TORCH_OFF`.

## Beings (src/beings.js)
- **The Thing (SCP-087-1):** a pale stretched face with no mouth.
  - Smooth skin over the mouth, with a faint sealed seam and tension lines.
  - Asymmetric empty black sockets with a crack line, a faint red glint deep in the right socket, hollow cheeks, cheekbones and a narrow chin.
  - A thin dark body barely suggested: long arms gripping the rail, long fingers twitching out of sync.
  - Its pose runs on stop-motion time (`stutT`): it is still while lit and jumps between flashlight drop-outs, with a slow head tilt plus small jerks.
- **The janitor:** the person rig with the teke-teke gait (`walkP` / `gaitFeet`), now stair-aware (`stairs: true`: feet arc from tread to tread).
  - Middle-aged face: tired eyes, forehead lines, folds, grey stubble and a moustache.
  - A navy cap with a badge, grey hair under it, a grey-blue work uniform with zip, pockets, name tag, belt and key ring.
  - Flashlight in his right fist; a mop held in both fists at dawn.

## Beats
| # | time | picture | paragraph |
|---|---|---|---|
| 1 | 0–4.5 | down the well from landing 1: the face looks up from landing 4; light out 1.55–1.8; on landing 3, tilting | If you find a stairwell that wasn't there yesterday, don't go down. I went down. |
| 2 | 4.5–8.5 | card SCP-087, seal 階 | (same) |
| 3 | 8.5–14.6 | night corridor, moonlit windows; he walks with the flashlight | I was the night janitor at a school in Sendai. Three floors. No basement. |
| 4 | 14.6–20.6 | he walks to the grey STAIRS door and stops | At 2 a.m. there was a new door at the end of the hall. Grey, with a sign that said STAIRS. |
| 5 | 20.6–26.6 | down the first flight, beam on B1 | The stairs only went down. Every landing had a number. B1. B2. B3. |
| 6 | 26.6–32.6 | POV down the next flight: the light reaches one flight | My flashlight only reached one flight ahead. Below that, nothing. |
| 7 | 32.6–38.6 | B12: he leans over the rail, listening | At B12 I heard a child crying for help, somewhere below me. |
| 8 | 38.6–45.0 | down to B30, stops, the light stutters; black 45.0–45.6 | I kept going down. The crying never got closer. At B30, it stopped. |
| 9 | 45.6–51.6 | THE HIT: the face on the landing below in the beam, slow stop-motion tilt | Then my light found a face on the landing below. It was looking up at me. |
| 10 | 51.6–58.6 | running up two steps at a time, four cuts, numbers B87 → B64 → B38 → B10 | I ran. I counted ninety flights before I saw the hallway again. |
| 11 | 58.6–71 | cold dawn corridor, no door; he mops; badge 66.2 | The next night the door was gone. But when I mop the third floor, I hear crying under the tiles. |

## Sound plan
Not made yet ("sonido pro" after the board is approved). The per-panel notes are in `TIMELINE.board`. The hit has exact silence at 45.0–45.6.
