---
type: brief
status: active
tags: [corpo-seco, yokai, storyboard, brazil, folk-horror]
relatedTo: [pieces/inunaki/brief.md, pieces/umibozu/brief.md, styles/yokai/STYLE.md, pieces/corpo-seco/LOG.md]
---
# Corpo-Seco — brief

## Spec
- 9:16, 1080×1920, 24 fps, 71 s (1704 frames), English first-person paragraphs (`ykPara`), no voice. Style **yokai** (216×384, toon 3 bands, teal palette with warm browns, warm 2×2 dot screen, fog, no vignette).
- Brazilian folk legend (the Corpo-Seco of rural Minas Gerais / São Paulo: a man so cruel to his mother that the earth would not take him; neither heaven nor hell; he dried instead of rotting and haunts dead trees by roads). Retold as fiction: my grandfather and his ox cart. The idea comes from theredarchivesyt's Corpo-Seco; no frames or wording copied.
- Card: Flow / Nano Banana Pro (new project, three earlobe card prints uploaded as style refs: the tree face, the giant, the skeleton), 3 generations, kept #3 (a long-armed dried corpse emerging from a dead tree by a road under the moon, an ox cart lantern far down the road) → `assets/print.jpg` (paper border cropped), `ykCard` pw 90, seal glyph 屍. Badge `ykBadge` (kodama.jpg, same call as inunaki/umibozu) centred top from 66.2 s.

## World (src/world.js)
Three sets in one three.js scene, far apart:
- **Road (origin):** the dry sertão at night. A red dirt road (Catmull-Rom centreline, rut profile in the ribbon) bending left; barbed-wire fences on crooked posts both sides; 46 k swaying dry grass blades; mandacaru cacti, caatinga twig scrub, 46 dead trees, stones; low hills and the moon follow the camera. At the outside of the bend the hero tree: a bulging barriguda trunk, hollow from 0.45–2.75 m, split toward the road (three trunk meshes: open, split wide for the hit, shut for the last shot), a crown of recursive dead limbs.
- **House (x +400):** a taipa room (adobe with exposed wattle, beams, tiles), table with an oil lamp (shadow-casting point light), stove with pots and a fire glow, saint's print, crucifix, gourds, dried corn, shutter, door, a stool knocked over.
- **Chapel (x −400):** a limewashed chapel with gable, cross, belfry and bell, a walled cemetery (crosses, small tombs, mounds, iron gate, a dead tree), an open grave with its mound and shovel, the coffin and its lid.
- **Ox cart:** solid three-plank wheels with crescent holes and iron tyres turning with the road, plank bed, stakes, woven panel, sacks, firewood, the pole to the yoke, the yoke with pegs and a post with a hook; the hurricane lantern hangs on it. Two brown zebu oxen (hump, dewlap, drooping ears, pale horns) with a planted four-beat walk and a balk (heads tossed, stamping).
- **People (one point rig, two-bone IK, jointed fingers, fitted grip):** my grandfather (straw hat, checked shirt, boots, grey moustache, the goad in his fist; a fear face for the hit), Tião (big, dark, hat, a strap), his mother (print dress, headscarf, kneeling), the Corpo-Seco (2 m, leather on bone: rib cage of 16 ribs, sternum, collar bones, spine knobs, pinched belly, hip crests, burial rag; a narrow skull with sunken temples, hollow cheeks, deep sockets with a faint glint, a collapsed nose, no lips, yellow-brown teeth in two rows inside the mouth, hinged jaw, stringy hair; very long thin limbs, knobby joints, 1.85× fingers with thorn nails).

## Beats
| # | time | picture | paragraph |
|---|---|---|---|
| 1 | 0–4.5 | HOOK: the hollow tree at the bend, moon behind; in the slit a dried face opens its eyes (glint at 0.45 s), turns to us (0.7–2.3 s) and grins; long fingers hooked round the lips | If a dead tree by the road turns its face toward you, don't stop. My grandfather stopped. (0.4–8.2) |
| 2 | 4.5–8.5 | card Corpo-Seco, seal 屍 | (same) |
| 3 | 8.5–14.6 | the farmhouse: Tião raises a strap, his shadow thrown up the wall by the oil lamp over his kneeling mother | In our village everyone knew about Tião… (9.0–14.35) |
| 4 | 14.6–20.6 | dusk at the chapel: the coffin lying on the dirt again | When he died, the ground would not keep him… (15.1–20.35) |
| 5 | 20.6–26.6 | the dried body standing by the coffin; its head jerks at 23.6 | Heaven refused him… He only dried. (21.1–26.35) |
| 6 | 26.6–32.6 | the tree at the bend under the moon; then it sinks back into the trunk, the fingers uncurling and sliding off the lips last | They say he crawled inside the dead tree… (27.1–32.35) |
| 7 | 32.6–38.6 | grandfather on the ox cart, the lantern on the yoke post | My grandfather drove his ox cart home… (33.1–38.35) |
| 8 | 38.6–45.0 | the oxen balk at the tree (38.9); he stands, steps to the bed's edge, jumps down and walks to the tree; black 45.0–45.6 | The oxen stopped at the tree… (39.1–44.7) |
| 9 | 45.6–56 | THE HIT: the tree split wide and empty behind him; the Corpo-Seco on his back, its face beside his, arms over his shoulders, palms on his chest, knees out round his hips; he grabs its forearm. Then in profile: its head turns to us (53.2) | The bark split. Something dry and grinning was already on his back. (46.3–55.75) |
| 10 | 56–71 | dawn: the oxen still yoked, his lantern on its side in the dirt; then the shut tree with two bark faces (its grin and his open mouth with a moustache), his hat at the roots; badge 66.2; fade 70–71 | At dawn we found the oxen still in the yoke… (56.6–70.6) |

## Sound plan (to be made after the board is approved: "sonido pro" = Commons + Freesound CC0 via earshot + code layer)
Night: wind in dry grass, crickets, a nightjar, fence wire hum. House: oil lamp flutter, a chair scrape, a strap (off-screen), a whimper. Chapel: a bell, dusk crickets. The cart: the carro de boi's long wooden wheel song (cantadeira), hooves, the lantern's tin clink, oxen breath; the song stops at the balk, snorts, stamping; the bed creaks, boots land. Drone 39–45; exact silence 45.0–45.6; THE HIT at 45.6 (loudest): bark splitting + a dry rasp + sub drop; dry breathing, leather creak, the lantern falling off the yoke, oxen bellow. Dawn: birds, a far rooster, an ox shifting, the yoke creaks; a dry creak on the faces. −16 to −14 LUFS.

## Claims
Folklore, told as a legend; no factual claims on screen.
