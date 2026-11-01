---
type: brief
status: active
tags: [gashadokuro, yokai, storyboard, japan, folk-horror]
relatedTo: [pieces/corpo-seco/brief.md, pieces/inunaki/brief.md, styles/yokai/STYLE.md, pieces/gashadokuro/LOG.md]
---
# Gashadokuro — brief

## Spec
- 9:16, 1080×1920, 24 fps, 71 s (1704 frames), English first-person paragraphs (`ykPara`), no voice. Style **yokai** (216×384, toon 3 bands, teal palette with warm browns, warm 2×2 dot screen, fog, no vignette).
- Japanese yōkai (the gashadokuro: a giant skeleton made of the bones of the unburied dead), retold as fiction: my grandmother as a girl, the Tenmei famine winter of 1783. The idea comes from theredarchivesyt's Gashadokuro; no frames or wording copied.
- Card: Flow / Nano Banana Pro, new project, 3 generations, kept #3 (a giant skeleton reaching over a snowy pass, a girl in sugegasa and mino with a chōchin, stone lanterns, the moon) → `assets/print.jpg` (paper border cropped), `ykCard` pw 90, seal 骨 (hand grid in `YK_SEALG`). Badge `ykBadge` (kodama.jpg, same call as corpo-seco / inunaki) centred top from 66.2 s.

## World (src/world.js)
One set: a footpath climbing from the village edge (thatched huts with snow, firewood) up a susuki slope (the field of the dead: seven straw mats over bodies, two with bare feet out, field bones instanced) into cedars, with stone tōrō every 8.5 m (unlit, snow caps), to the top of the pass. Patchy snow (vertex colour), falling snow, mist, motes, moon, a cedar ridge line.
- **Gashadokuro** (instanced, ~4 k small skulls + bones): a deformed-sphere skull core (deep sockets with a cold glint, nose hole, cheekbones, flat underside) covered with packed small skulls and bones; a hinged horseshoe mandible; teeth = a bone root with two stacked skulls (upper row hangs from the maxilla, lower row stands on the mandible, inside the upper arc); neck vertebrae as knots of skulls; collarbones, shoulder knots, 6 pairs of ribs, the spine, upper arms. A separate giant hand + forearm creeps on its fingertips (tips kept on the ground every frame).
- **The girl**: kimono, red obi, straw mino open at the front, sugegasa, waraji; the chōchin on a short pole in her left fist (`holdProp`, fitted grip), its light a gentle-flicker point light.

## Beats
| # | time | picture | paragraph |
|---|---|---|---|
| 1 | 0–4.5 | HOOK: the skull rises over the cedar ridge against the moon, jaw chattering; her lantern tiny on the path | If you hear teeth chattering on the mountain pass at night, don't look up. My grandmother did. |
| 2 | 4.5–8.5 | card Gashadokuro, seal 骨 | (same) |
| 3 | 8.5–14.6 | village edge, mats over the dead in the susuki | In the famine winter of 1783… |
| 4 | 14.6–20.6 | flattened mats, bones, crows (one flies 15.5) | No one came back for them… |
| 5 | 20.6–26.6 | she walks the path between tōrō | She was sent over the pass at night… |
| 6 | 26.6–32.6 | bones tremble in the grass, she stops | Halfway up she heard it… |
| 7 | 32.6–38.6 | bones tumble uphill into the cedars | The bones in the field were rolling uphill… |
| 8 | 38.6–45.0 | eyes down; the giant hand creeps beside her; lantern gutters out 44.3–44.9; black 45.0–45.6 | She kept her eyes on the lantern… |
| 9 | 45.6–51.6 | THE HIT: she looks up, the many-skull face lowers to her | At the top of the pass, the lantern went out. She looked up. |
| 10 | 51.6–58 | teeth of skulls, her mother's red comb between them | It was made of everyone they had left behind… |
| 11 | 58–71 | the field by day in fog, fewer bones; badge 66.2; fade 70–71 | She never crossed the pass again… |

## Sound plan (after board approval: "sonido pro")
Per panel in the storyboard notes. Exact silence 45.0–45.6; the hit at 45.6 loudest.

## Claims
Folklore told as a legend; the Tenmei famine (1782–1788) is real; no other factual claims on screen.
