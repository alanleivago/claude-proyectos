---
type: plan
status: draft
tags: [mechayuki, expeditions, long-form, youtube, bedroom, storyboard, 16x9]
relatedTo: [mechayuki-expeditions, mechayuki-rules, ava-rules, guion]
---

# Mechayuki Expeditions 01: The Bedroom — storyboard v1 (pending approval)

## Files
- **Board:** `storyboard_v1.png`, the middle still of the 32 board shots.
- **Stills:** start, middle and end of every shot are in `review/sb/`.
- **Style frames** (1920x1080) in `review/style/`:
  - `styleframe_dungeon_present.png`: the buried bedroom with the EXPEDITION 01 title.
  - `styleframe_past_cave.png`: 200,000 years ago, grass bed on ash by the fire.
  - `styleframe_body_manual.png`: Human Body Manual p.1.
  - `styleframe_menu_item_get.png`: the MML2 ITEM GET menu.
  - `styleframe_menu_inventory.png`: the full inventory.
  - `styleframes.png`: the four main frames side by side.

## Engine and timing
- **Engine:** `engine/` is the Digger engine moved to 16:9, rendering at 480x270 internally and upscaled ×4 to 1920x1080 with the same PS1 post. Captions are one word at 16 px.
- **Reuse:** it keeps all the sets and helpers from Digger 01–04, including the ep04 green look.
- **Timing:** provisional, from `tools/fake_timeline.py`: 9:51 of voice. With the real megagirl voice (~0.436 s/word, plus pauses on the menus) the estimate is ~11:15. Every shot re-times itself from the real voice.
- **Board vs final cut:** the board has **32 shots**, one per beat. Following the Ava long-form rule (cut often, hold key items ~2 s), the final cut splits each beat into 3–4 shots, about 110 in total. The extra shots are listed in the "Final cut" column.

## Opening and ending (different place, different framing)
- **Opening (#1–#5):** outside on a green hill in the morning, then inside the buried bedroom.
  - #1: she sweeps the detector over the hill; a window frame sticks out of the grass, and the beeps speed up.
  - #2: inside, a dark dungeon with earth mounds, roots, a light shaft from the broken ceiling corner, and the bed and nightstand. The EXPEDITION 01 / THE BEDROOM title appears.
- **Ending (#30–#32):**
  - #30: the inventory menu.
  - #31: the "boss", a lava lamp found under the bed with a low camera, a BOSS: ??? bar and a pink glow.
  - #32: back on the hill, with the lava lamp next to her, the comment question, a wave with wink + blush, and the outro (MECHAYUKI / EXPEDITION 01 / SUBSCRIBE).

## Shots
| # | prov. start | line | set / framing | action · face | FX / overlay | final cut (extra shots) |
|---|---|---|---|---|---|---|
| 1 | 0:00 | Operator… my detector says there's something under this hill | hill (green, trees, aerial), 3/4 front | `detector_walk`; happy → surprised | beeps speed up, "!" over the window frame | close on the detector LED; she kneels and wipes the glass |
| 2 | 0:06 | Humans spent one third… It's called a bedroom… | buried bedroom, wide | `look_around`; smile | light shaft, lava lamp hidden under the bed; EXPEDITION 01 / THE BEDROOM | pan over the bed; close on the dirty duvet |
| 3 | 0:24 | The door is stuck, so I'll use the window… | bedroom, the window full of earth | she comes in and dusts off (**NEW `climb_in`**; provisional: walk) | dirt falls (dust) | the door blocked by earth (insert) |
| 4 | 0:33 | Posters on the walls… a cup with something green | slow pan | — | — | inserts: poster, clothes, cup with mould (stink FX) |
| 5 | 0:41 | Eight human artifacts… | bedroom, 3/4 | `point` | 8 numbered HUD boxes + 8 ARTIFACTS | — |
| 6 | 0:52 | First artifact. | **ITEM GET 1/8 MATTRESS** | — | 3D item spinning, typed description, slots row | menu SFX: item get + cursor |
| 7 | 0:53 | A rectangle full of metal springs… | bedroom, the mattress | `think` → surprised | HUD SPRINGS: 312, boing | she presses the mattress (**NEW `press_down`**) |
| 8 | 1:13 | Two hundred thousand years ago… | **PAST: Border Cave**: rocks, fire, grass bed on ash | `kneel`; smile | fire, smoke, heat; 200,000 YEARS AGO, ASH, GRASS + ASH = BUG SPRAY | close on the ash under the grass (cutaway diagram) |
| 9 | 1:32 | Then for thousands of years… straw… guests | **PAST: medieval house**, straw sack | `idle` → `shiver`; disgust | flies, sweat; FLEAS · LICE · BEDBUGS | the bugs as pixel sprites; "once a year" calendar |
| 10 | 1:58 | Second artifact. | **ITEM GET 2/8 PILLOW** | — | — | — |
| 11 | 2:06 | The first pillows… stone… Egypt… porcelain | **PAST: Egyptian storeroom** | `hold_up_object` with the stone pillow | 7000 BC: STONE PILLOW, HEADREST | she tries to sleep on the stone (**NEW `lie_on_side`**); a Chinese porcelain pillow (prop) |
| 12 | 2:32 | And no, people in the Middle Ages didn't sleep sitting up | lab + parchment: painting vs real bed | `shake_head` | red X, MYTH | — |
| 13 | 2:50 | Third artifact. | **ITEM GET 3/8 BLANKET** | — | — | — |
| 14 | 3:17 | In 1776… Adams… Franklin… window | **PAST: tiny inn room**, bed, window | two NPCs (nightcaps) in bed; the window opens and closes | 1776, ADAMS, FRANKLIN, anger mark, thought bubble | NPC poses: lying + pointing at the window (**NEW NPC poses**); the inn sign outside |
| 15 | 3:46 | Human Body Manual. Page one… | **BODY MANUAL p.1**: lab + paper page | `talk_gesture` | brain diagram, fluid washing through, WASTE OUT, GAPS +60% (MICE) | "I recharge in 40 minutes": her charging gag (cable + battery icon) |
| 16 | 4:24 | Fourth artifact. | **ITEM GET 4/8 LAMP** | — | — | — |
| 17 | 4:29 | Before electricity… candles… rushlight | **PAST: stone cell**, candle | `pinch_nose`; disgust | smoke, stink; ANIMAL FAT CANDLE, RUSHLIGHT: 20 MIN | rushlight in its iron holder (new prop) |
| 18 | 4:43 | …first sleep… second sleep | bedroom at night, moon | `sleep_lie` → `wake_sit_up` | 00:00, FIRST SLEEP / SECOND SLEEP | she lights a candle and "visits the neighbours" (street at night) |
| 19 | 5:18 | Human Body Manual. Page two… REM | **BODY MANUAL p.2** | `talk_gesture` | sleep-cycle graph, REM in red, eyes darting, RAPID EYE MOVEMENT | — |
| 20 | 5:50 | Back to the present. The wardrobe… | bedroom, fallen wardrobe | `scoop_kneel` | dust; x27 (ALL WITH MOONS) | the pajama pile (gag) |
| 21 | 6:08 | Fifth artifact. | **ITEM GET 5/8 PAJAMAS** | — | — | — |
| 22 | 6:15 | The word "pajamas" comes from Persian… | lab + word cards | `present` | PAY + JAMA / LEG + CLOTHES; PERSIAN > INDIA > UK 1800S | nightshirt (prop) |
| 23 | 6:32 | Sixth artifact. | **ITEM GET 6/8 NIGHTSTAND** | — | — | — |
| 24 | 6:40 | …hiding the chamber pot… commode | **PAST: Tudor room**, cabinet with a door | the cabinet opens, she pinches her nose | stink, flies; COMMODE | "I'm not touching it" (step back) |
| 25 | 7:06 | Seventh artifact. | **ITEM GET 7/8 EARPLUGS** | — | — | — |
| 26 | 7:14 | …beeswax… Odyssey… 1907 | lab + parchment: ship + sirens | `talk_gesture` | BEESWAX, 1907: WAX EARPLUGS | "somebody snored" (snore FX on the bed) |
| 27 | 7:41 | Eighth artifact. | **ITEM GET 8/8 PHONE** | — | — | the phone: alarm, clock, lamp, radio (icons) |
| 28 | 8:02 | Operators who watched my last expedition… | night street (ep04 set) | knocker-up with the pole | SEE: DIGGER 04, 1956: SNOOZE | peas against the glass (ep04 reuse) |
| 29 | 8:19 | Human Body Manual. Page three… | **BODY MANUAL p.3** | `talk_gesture` | DAY 1→11 counter, MOODY, SEEING THINGS, dolphin with one eye open | — |
| 30 | 8:54 | Let me check my inventory… | **INVENTORY** (8 slots) | `hands_on_hips` | cursor across the 8 items | — |
| 31 | 9:22 | …one more artifact… under the bed | bedroom, low camera under the bed | `kneel`; surprised → sparkle + blush | BOSS: ??? bar, lava lamp glow | close on the floating wax |
| 32 | 9:41 | Operators… what was it for? … Logging off. | hill, morning, the lava lamp next to her | `shrug` → `wave`; wink + blush | COMMENT: WHAT WAS IT FOR?, outro + SUBSCRIBE | — |

## New animations and assets needed

**New animations** (`zero-fem/anim/build_anim.py`, v1 model; the existing clips stay untouched, as in ep04):
- `climb_in`: through a window, one leg over the sill.
- `press_down`: both palms pressing a mattress, bouncing.
- `lie_on_side`: lying on the side, head on the hand, for the stone pillow gag.
- `charge_plug`: plugs a cable into her back and sits down; a battery icon fills.
- `dig_hands`: clearing earth with her hands, a variant of `scoop_kneel`.
- `light_candle`: holds a match to a candle.
- `step_back`: disgusted step back.

**NPCs** (lib-mml, recoloured):
- Adams and Franklin: lying in bed, plus a pointing-at-the-window pose. Franklin needs his own look: long hair and spectacles in code.
- Medieval family in the straw bed.
- Villagers at midnight.
- Knock-kneed walks must be checked in profile, per mechayuki-rules.

**Sets and props** (code; storyboard versions already built in `engine/film.js`):
- **New sets:**
  - the buried bedroom dungeon (torn wallpaper, earth ceiling, beam, light shaft, mounds, roots, earth-filled window, posters, clothes, mouldy cup, fallen wardrobe);
  - the hill (window frame in the grass, TV aerial);
  - Border Cave (rocks, fire, ash, grass bed);
  - the medieval straw-sack room;
  - the 1776 inn room with a working window sash.
- **New props:** mattress with springs, pillow, blanket, bedside lamp, moon pajamas, nightstand, foam earplugs, lava lamp (animated wax), stone pillow, Egyptian headrest, cabinet with a door hiding the chamber pot.
- **Still to build:** Chinese porcelain pillow, rushlight in its iron holder, nightshirt, battery icon, a bedroom door blocked by earth.
- **Reused:** Egyptian storeroom, Tudor room, stone cell + candle, ep04 night street + knocker-upper, phone, chamber pot, bed + duvet.
- **2D (overlay):**
  - the MML2 menu kit, a port of `pieces/mechayuki-banner` (chamfered mint panels, notched bars, green bolts and rivets, red selected bar);
  - the Human Body Manual page;
  - parchment diagrams (painting vs real bed, the Odyssey);
  - word cards.
  - `pixfont.js` gains `, / ( ) > · ' %`.

**Sound** (production phase):
- **Menu SFX:** the user's `assets/megaman legends sfx general`: `sfx-cursor-move1`, `sfx-cursor-select1`, `sfx-cursor-back1`, `sfx-treasure-open1` for ITEM GET, `sfx-getenergy1` for the charging gag, `sfx-ruindoor-open1` for entering the dungeon. These are game rips: fine on TikTok, but on monetized YouTube they may get Content ID claims, so CC0 swaps should be ready.
- **Everything else:** CC0 SFX (fire, candle, flies, window, snoring, digging, dust).
- **Music:** original music per section (dungeon, past, manual), not chiptune, matched by LUFS.
- **Voice:** megagirl voice; master at −14 LUFS for YouTube.

**Delivery** (Ava long-form rules): `DESCRIPCION.md` (title, chapters ≥ 10 s from 0:00, credits), a thumbnail, and `revisar_render.py` in ~2:40 parts.

## v2 (2026-10-31): MML2 menus and relief sets (user feedback on v1)
- **Board:** `storyboard_v2.png` (33 shots). Stills in `review/sb2/`.
- **Style frames v2** in `review/style_v2/`:
  - `styleframe_v2_menu_item_get.png`
  - `styleframe_v2_menu_inventory.png`
  - `styleframe_v2_dungeon_present.png`
  - `styleframe_v2_past_cave.png`
  - `styleframe_v2_city_1776.png`
  - `styleframe_v2_boss.png`
  - all six together: `styleframes_v2.png`
- **Visual reference:** `fuentes/megaman-legends2/` (key-frame contact sheet + `NOTAS-ESTILO-MML2.md`).

**Menus.** `engine/menukit.js` is the banner's drawing code ported 1:1: the lavender machine-part pattern, mint panels with teal borders, chamfers and orange ticks, notched bars, a chunky outlined font with green bolts, rivets, Z coins, the energy capsule and grid slots.
- **ITEM GET** has:
  - the 3D item spinning in a slot window;
  - a red name bar and a TYPE bar;
  - a typed description in a riveted purple box;
  - the 8 artifact slots with real 3D icons (offscreen render);
  - Z value and progress counters;
  - a "ZZZ" capsule that fills;
  - a footer bar.
- **INVENTORY** has:
  - a vertical menu (ITEMS selected in red, plus a cursor);
  - a 4x2 grid of 3D icons with names;
  - the total in Z coins;
  - Mechayuki in the portrait window with her capsule;
  - the description of the selected item.

**Sets.** The "MML2 look kit" in `film.js` (see the notes) adds:
- **Buried bedroom:** relief walls, a ruin stone wall with carved blocks, pillars, beams, an earth ceiling with a light shaft, rubble, a bookshelf and a rug.
- **Lighting:** warm key light, cool fill and black fog.
- **Past interiors:** rebuilt with relief and beams.
- **New MML2 city** for 1776: an establishing shot (new #14) before the inn room.
- **Cave:** flat-shaded rocks lit by the fire, plus stalactites.
- **Boss:** now filmed at floor level under the bed. The lava lamp was scaled to fit under the frame; in v1 it poked through the bed.

**Music:** original, composed in the style of the MML2 tracks without using them. Plan per section is in `fuentes/megaman-legends2/NOTAS-ESTILO-MML2.md`.

**Still flat** (to rework in production):
- the Body Manual pages (blue grid void, kept as the "STATUS/lab" screen);
- the night knocker-upper street (reused from ep04);
- the hill (simple).
