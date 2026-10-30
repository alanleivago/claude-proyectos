---
type: plan
status: draft
tags: [digger, digger-04, storyboard, alarm-clock, despertador, knocker-upper, sinaboto-format, mechayuki]
relatedTo: [mechayuki-rules, digger-03-lock, digger-channel, guion]
---

# Digger 04: The alarm clock — storyboard v1 (pending approval)

- **Board:** `storyboard_v1.png` (the middle still of all 31 shots). The start / middle / end stills of every shot are in `review/sb/`.
- **Contact sheets:** `review/sb_sheet_1..4.png`.
- **Style frames:** in `review/style/`:
  - `styleframe_opening.png`
  - `styleframe_candle_alarm.png`
  - `styleframe_knocker_upper.png`
  - `styleframe_pea_shooter_rude.png`
  - the strip `styleframes.png`
- **Format: sinaboto.** The video opens straight on the hook "If you sleep facing a window… you have an alarm clock." There is no "Operator… I found" opener and no discovery scene. Mechayuki is the host and acts out every method herself: she sleeps facing the sun, pushes the nail into the candle, is the knocker-upper with the pole, and shoots the peas.
- **Provisional timing:** there is no voice yet. `tools/fake_timeline.py` derives the timing from `guion.md` and gives ~103 s, which runs slow. At megagirl's real pace (0.436 s/word), 227 words come to ~99 s plus a 2.6 s outro. Every shot re-times itself once the real voice exists (`prep_timeline.py`).
- **Operator Jay's comment:** words 84–99 (37–44 %). On screen it falls in shot #14 (≈38.7 s of 105 s).
- **Engine:** `engine/film.js` is a copy of the ep 03 engine. It reuses the helpers and sets (`workshop`, `streetSet`, mailbox, `village`, FX, NPCs) and adds the ep 04 sets and props.

## Opening and ending (rule: never the same place or framing)
- **Opening (#1–#3):** her bedroom in the village, inside. There is a **real window** (a hole in the wall) with the snowy village behind it.
  - #1: high 3/4 shot. She sleeps with "zzz". The pixel sun rises into the window, and a sunbeam climbs the quilt up to her face.
  - #2: close-up. She sits up dazzled and the label ALARM CLOCK pops in.
  - #3: the same window in winter: night, snow. The clock runs 06:00 → 08:45, then LATE, and the sun only just peeks in.
- **Ending (#29–#31):** outside, on a snowy ledge at the edge of the village at sunrise. It is a different place, outdoors, with a different framing.
  - #29: she holds up her phone. Four icons pop on their words: SUN / CANDLE / STICK / PEA.
  - #30: the phone rings, she hits SNOOZE and shrugs, and a pea bonks her on the head (callback gag) with "?".
  - #31: she waves (wink + blush), the camera cranes away, and the outro plays over the shot: MECHAYUKI / ARTIFACT 004 / ALARM CLOCK / FOLLOW @MECHAYUKI.

## Shots
| # | start (prov., s) | tr. | line | set / framing | action · face | world reacts / FX | label |
|---|---|---|---|---|---|---|---|
| 1 | 0.0 | — | If you sleep facing a window… you have an | OPENING: bedroom at dawn, high 3/4 | asleep in bed (**NEW `sleep_lie`**; provisional: rigid rotation); blink + cat | pixel sun rising in the window, sunbeam crawling up to her face, zzz | — |
| 2 | 3.6 | C | …alarm clock. | close-up on the bed | sits up (**NEW `wake_sit_up`**; provisional `sit_floor`); surprised → half/frown | "!", sparkles, sunbeam on her face | **ALARM CLOCK** |
| 3 | 4.8 | M | But in winter… the sun shows up late. | same window, snowy night | asleep | snow outside, clock plate 06:00 → 08:45, the sun peeks in late | 0X:XX · LATE |
| 4 | 8.7 | M | So people pushed a nail into a candle. | medieval stone cell at night (table, cot, starry window) | pushes the nail into the candle (**NEW `push_nail`**; provisional `present`) | candle heat, sparkle when the nail goes in | — |
| 5 | 12.3 | C | When the wax melted… the nail dropped onto a metal plate. | close on the marked candle on a pewter dish | — | the candle burns down past the red marks, wax drips, the nail drops onto the dish | METAL PLATE |
| 6 | 16.9 | C | Clang. | the cell: candle in front, her on the cot | jolts awake sitting up; shocked/bigShock | impact on the dish, "!", shiver lines, camera shake | **CLANG** |
| 7 | 17.5 | C | This is a candle alarm. | punch-in on candle + dish | — | sparkles | **CANDLE ALARM** |
| 8 | 19.7 | M | Then came factories. | 1800s mill at night: brick, lit windows, chimney with smoke, gate with a clock | `look_around`; surprised | 3 workers walking to the gate, smoke | 1800s |
| 9 | 21.7 | C | If you were late, you were fired… | outside the gate | runs in from the left (**NEW `run`**; provisional fast `walk`), the gate slams, she turns to camera; shocked → sad | gate slam + impact, sweat | LATE = FIRED |
| 10 | 24.6 | M | …and alarm clocks were expensive and unreliable. | clockmaker's bench, she behind it | idle → `shrug`; surprised → half/frown | a pricey clock, another whose hand spins wildly + "?" | PRICEY |
| 11 | 28.3 | M | So workers paid a human. | terraced street at night | `hold_up_object`, pole on her shoulder | a worker (flat cap) flips her coins that land in her hand | +1 PENNY |
| 12 | 30.6 | M | A knocker-upper walked the streets before dawn… tapping on windows with a long stick. | same street, moon | walks with the bamboo pole and taps the upper window (**NEW `tap_pole`**) | TAP TAP on the glass, the window lights up | TAP |
| 13 | 36.7 | C | This is a knocker-upper. | low angle, the pole against the lit window | `hands_on_hips`; ends on the new **smirk** | sparkles | **KNOCKER-UPPER** |
| 14 | 38.7 | M | Operator Jay asks: "Who woke up the knocker-upper?" | mailbox (the series' usual comment set) | `phone_look` with the letter | TikTok sticker from operator_jay, punch-in on "Who", "?" | comment |
| 15 | 42.7 | C | Jay… most of them slept in the afternoon. | gag: the same bedroom at 2 PM, sun high, pole leaning on the wall | asleep; blink + cat | zzz, daytime sunbeam | 2 PM |
| 16 | 46.1 | M | In London, Mary Smith didn't knock at all. | foggy East End street at night | `think` → surprised; Mary Smith (NPC with bonnet, shawl and pea shooter) | "?" | LONDON · MARY SMITH |
| 17 | 49.6 | M | She shot dried peas at the windows… | 3/4 profile under the window | blows the tube (**NEW `blow_tube`**; provisional `drink`); half + smirk | green peas fly in arcs and tick on the glass | TIK |
| 18 | 52.4 | C | …with a pea shooter. | close-up | `hold_up_object` with the tube | sparkles | **PEA SHOOTER** |
| 19 | 54.0 | C | Sixpence a week. | close-up | holds up the silver sixpence | sparkles on the coin | 6D A WEEK |
| 20 | 56.3 | C | Rude. | the sleeper flings his window open (nightcap, angry) | `smirk_pose`, new **smirk** face | anger mark on him, a sparkle on her | — |
| 21 | 57.2 | M | Alarm clocks did exist. In 1787, Levi Hutchins built one… | workshop, his pine-case wall clock with a mirror on the door and a bell on top | `think` → happy; Hutchins (NPC, tricorn hat) | tick-tock, sparkles | 1787 · LEVI HUTCHINS |
| 22 | 62.2 | C | …but it could only ring at four in the morning. | the clock and her | surprised; shocked/bigShock | dial stuck at 4:00 (red hand), the bell rings, shiver lines | 4:00 AM ONLY |
| 23 | 66.0 | M | In 1876, the Seth Thomas company patented a small bedside alarm clock. | bedroom at dusk | `present` with the twin-bell clock in her hand; new **sparkle + blushSmile** face | sparkles | 1876 · SETH THOMAS |
| 24 | 71.4 | M | Cheap clocks spread… and the knocker-uppers slowly lost their jobs. | the street at dawn | idle; sad/frown | every window rings (ring marks); the knocker-upper NPC walks off with his pole, sweating | — |
| 25 | 75.7 | C | A few kept knocking until the 1970s. | the street at night | surprised, "!" | an old knocker-upper still taps a window | 1970s |
| 26 | 78.6 | M | In 1956, alarm clocks got a new button… | 1956 bedroom (tiles, pink quilt), pastel clock on the nightstand | in bed, angry; slaps the bar (**NEW `slap_snooze`**; provisional: the button sinks + impact) | the clock rings (ring marks), SLAP | 1956 |
| 27 | 82.2 | C | …to sleep a few more minutes. | same, closer | back to sleep; blink + cat | zzz | + A FEW MIN |
| 28 | 84.7 | C | This is a snooze button. | punch-in on the button | — | sparkles | **SNOOZE BUTTON** |
| 29 | 86.9 | M | Now your phone is the sun, the candle, the stick and the pea shooter. | ENDING: village edge at sunrise | `phone_look` with the phone | the 4 icons pop in on their words | SUN · CANDLE · STICK · PEA |
| 30 | 92.7 | M | Humans paid people to shoot peas at their windows… and then invented a button to sleep through it? | same place, wider | phone → `shrug`; half → relaxed → shocked | the phone rings, SNOOZE, a pea bonks her head, "?" | SNOOZE |
| 31 | 100.3 | M | Artifact understood. Logging off. | crane away over the village at sunrise | `wave` ×2; new **wink + blushSmile** face | — | LOGGING OFF… → outro |

**Closing line:** I propose keeping "Artifact understood. Logging off." (the channel signature). The other option is "Humans… understood. Logging off."

## New animations and assets needed
**New animations** in `zero-fem/anim/build_anim.py` (the v1 model):
- `sleep_lie`: lying on her back in bed, slow breathing (#1, #3, #15, #26, #27). Today it is the `idle` pose rotated 90° (rigid arms).
- `wake_sit_up`: sits up in bed with a jolt (#2, #6).
- `push_nail`: pushes a nail into a candle with her thumb (#4).
- `run`: a real run (#9). Today `walk` is sped up.
- `tap_pole`: holds a long pole up with both hands and taps (#12).
- `blow_tube`: brings the tube to her mouth and blows, cheeks puffed (#17).
- `slap_snooze`: lying down, an arm comes out and slaps the clock (#26).

**Existing new expressions it uses:** smirk (#13, #20), sparkle + blushSmile (#23), wink + blushSmile (#31), half + smirk (#17).

**NPCs (lib-mml, recoloured, procedural poses):**
- workers with flat caps;
- Mary Smith (bonnet, shawl, pea shooter);
- Levi Hutchins (tricorn);
- the sleeper at the window (nightcap);
- the knocker-upper with his pole.

Poses still to make: a pole-tapping pose with arms up (#24, #25), Mary's blowing pose, and an angry gesture for the sleeper (#20). Check knees in profile (rule).

**Sets and props** (in code; the storyboard versions are already built):
- bed with quilt;
- room with a real window, pixel sun and sunbeam;
- stone cell;
- the candle alarm: red marks, burns down, the nail drops onto the dish;
- the mill: brick, chimney with smoke, iron gate, clock;
- night street with a pane that lights up;
- bamboo pole, pea shooter and peas, coins / sixpence;
- Hutchins' pine-case clock with a bell;
- the 1876 twin-bell clock;
- the 1956 snooze clock (bar button);
- the phone;
- the ending ledge at sunrise;
- overlays: zzz, ring marks, alarm icons.

**Known issues, to fix in v1 (after approval):**
- The lying pose is rigid. It needs `sleep_lie`.
- #12 and #17 are still wide shots: the peas and the tube read small. Go closer, with bigger peas and a trail.
- #16: Mary is at the edge of the frame.
- #29–31: the ruined towers in the background take on the sunrise fog colour, and the "ledge" needs a visible edge (a slope down to the village).
- Sound: CC0 SFX for the candle, clang, tap on glass, peas, bells, snooze and phone; music; −12 LUFS master.
- Before showing any render: run `python tools/revisar_render.py --estilo <style> video.mp4` (API credits).
