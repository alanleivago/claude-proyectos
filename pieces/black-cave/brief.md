---
type: brief
status: active
tags: [black-cave, yokai, storyboard, cave, crawler, kodamashorts]
relatedTo: [pieces/gashadokuro/brief.md, styles/yokai/RULES.md, styles/yokai/STYLE.md, pieces/black-cave/LOG.md]
---
# Black Cave — brief

## Spec
- 9:16, 1080×1920, 24 fps, 71 s (1704 frames), English first-person paragraphs (`ykPara`), no voice. Style **yokai** (216×384, 3-band toon, teal palette with warm browns, warm 2×2 dot screen, fog, no vignette).
- Idea from theredarchivesyt's "Black Cave" (`references/tiktok/theredarchives/cave/sheet.png`): idea only, no frames or wording copied. Ours adds a creature, the "pale crawler".
- Card: Flow / Nano Banana Pro (srz-google-flow-mcp, new project, refs `references/earlobe/card1.png` + `card3.png`). Kept #2 (an eyeless pale long-fingered creature climbing out of a crack, shimenawa and ofuda, a young man in a hanten with a headlamp) → `assets/print.jpg`. `ykCard` pw 96, seal 洞 (hand grid added to `YK_SEALG` in `styles/yokai/kit.js`). Badge `ykBadge` (kodama.jpg), the same call as gashadokuro, from 66.2 s.

## World (src/world.js)
Three sets far apart; one is shown per shot.
- **EXT** (origin): rocky scrub hills (soil, bushes, limestone rocks, dry grass), a limestone cliff (a displaced wall) with the mouth pushed back into a dark funnel, a welded steel grate (fixed bars + a cut panel that leans on the rock once cut, fresh cut ends), a hand-painted DANGER / KEEP OUT / 危険 sign, an old shimenawa over the mouth, a concrete plug, the rescue props (rubble, rope coils, a rope into the mouth, two floodlights on tripods), the town's lights far down the valley.
- **CHAM** (x 300): the chamber (a wet floor with puddles, an inside-out dome, stalactites and stalagmites), the back wall with a low horizontal crack, ofuda pasted round it, a torn shimenawa pegged above it.
- **SEC** (x 600): a side cutaway. The cut face is built from quads with strata in vertex colour; a trough behind it forms the crack's walls; the chamber's back half, a back plate; ofuda and a torn shimenawa deep down.
- **Pale crawler**: posed from world points. It has a flattened waxy torso with spine knobs and ribs, a long neck, an elongated eyeless skull with smooth pits, a dark mouth with 2×15 upper and 2×14 lower teeth (inside, tips toward the other jaw) and a red glint deep in the throat. Its arms have 6 segments and 7 knuckles; each hand has five 4-joint fingers (0.34 m), in 'spread' (on stone, tapping) or 'wrap' (helical round a wrist at radius = cuff + finger) mode.
- **People** (`mkPerson`, the gashadokuro rig): the brother (indigo hanten with patches and a dark collar, leather gloves, boots, a headlamp), me (a grey hanten), 3 rescuers (helmets, headlamps, rust jackets with yolk bands). `walkP` stands or walks them; `crawlP` lays them prone, headfirst.
- **Light:** one shadowed headlamp spot (a visible additive cone + a lens glow), with a `broken()` stutter. In the cutaway the spot sits behind the cut plane, so it lights only the crack.

## Beats
| # | time | picture | paragraph |
|---|---|---|---|
| 1 | 0–4.5 | HOOK: a pale long-fingered hand slides out of the crack, fingertips tap; stuttering flashlight | If a sealed cave calls you by your name, don't answer. My brother did. |
| 2 | 4.5–8.5 | card Black Cave, seal 洞 | (same) |
| 3 | 8.5–14.6 | the cliff, the mouth, the welded grate, the sign, scrub | There's a cave in the hills behind our town… |
| 4 | 14.6–20.6 | cut grate, he ducks in with his headlamp, me at the mouth | My brother cut the grate on a Sunday… |
| 5 | 20.6–26.6 | chamber: he squeezes headfirst into the crack | Deep inside, he found a crack… |
| 6 | 26.6–32.6 | cutaway: him in the crack curving down | The tunnel kept getting tighter… |
| 7 | 32.6–38.6 | the headlamp flickers; pale fingers in the dark below | Then his headlamp flickered… |
| 8 | 38.6–45.0 | long pale fingers wrap his gloved wrists and pull; the light dies 44.3–44.9; black 45.0–45.6 | He couldn't back out… |
| 9 | 45.6–51.6 | THE HIT: its eyeless face, upside down, right under his; the jaw opens | Then his light died… |
| 10 | 51.6–58 | rescuers, floodlights, ropes, rubble at the mouth | Rescuers dug for four days… |
| 11 | 58–71 | concrete over the mouth at dusk; badge 66.2; fade 70–71 | They sealed the cave with concrete… |

## Sound plan (after the board is approved: "sonido pro")
Notes per panel are in the storyboard. Exact silence 45.0–45.6; the hit at 45.6 is the loudest moment. The sound cues are in `TIMELINE.cues` (the flicker at 33.4, the fingers at 34.2, the light out at 44.3, the jaw at 46.4).
