---
type: script
status: active
tags: [vera, upnext, romcom, ps1, episode-2]
relatedTo: [vera-01, upnext-waitress, upnext-suitor]
---

# vera-02 · EP 2 "THE LAST CUP" · SCRIPT (approved 2026-11-18)

- **Format:** same as vera-01, a PS1 low-poly rom-com. She holds the power; he is flustered and sweet.
- **Cast:**
  - **VERA:** `waitress_jeans.glb`, copied to `engine/models/vera.glb`. Voice "Voz mesera clean" `cf0b8ddb`.
  - **THEO:** `suitor.glb`. Voice "voz theo pretendiente clean" `a66e21f8`.
- **Set:** MOONLITE DINER on a highway, rainy night, just before closing.
  - Neon pink and teal outside, warm inside.
  - Chrome counter with stools, coffee pot with one cup left.
  - Red vinyl booths, a jukebox, rain streaming down the big windows.
  - Door with a bell and an OPEN/CLOSED sign.
- **Length:** about 72 s, 27 lines, about 120 words.
- **Catchphrase:** "Dry off first." It comes back at the end as "Dry off first, Theo?", the first time she says his name.
- **Twist:** the umbrella he forgot last Tuesday. She kept it behind the counter, with a tag that says THEO.

| # | Speaker | Line | Action / shot |
|---|---|---|---|
| 01 | THEO | Sorry… are you still open? | Bell, rain noise. Theo soaked in the doorway. Vera behind the counter drying a mug. Wide shot. Title card "EPISODE 2 / THE LAST CUP". |
| 02 | – | – | Insert: the coffee pot with one cup left. In the background, an umbrella hangs behind the counter with its tag turned away (planted, not shown). |
| 03 | VERA | For you? Dry off first. | She leans on the counter. Catchphrase planted. |
| 04 | THEO | I'm fine. It's just a little rain. | Water drips off him. |
| 05 | VERA | You're dripping on my floor. | She tosses him a towel. |
| 06 | THEO | Right. Sorry. Thank you. | He dries his hair, embarrassed. |
| 07 | VERA | The last cup comes with conditions. | Low angle, the pot in the foreground. |
| 08 | THEO | Conditions? For coffee? | Shock. |
| 09 | VERA | One. Pick a song. | She points at the jukebox. |
| 10 | THEO | Something… slow? | At the jukebox, neon light on his face. |
| 11 | VERA | Bold choice. | Smirk. |
| 12 | THEO | Is that bad? | |
| 13 | VERA | I didn't say bad. | Wink. |
| 14 | VERA | Two. You sit in my booth. | Mosaic. She carries the cup to a booth. |
| 15 | THEO | Which one is yours? | |
| 16 | VERA | The one I'm sitting in. | She sits and pats the seat across from her. |
| 17 | THEO | Oh… okay. | Blushes and sits down. |
| 18 | VERA | Three. Stop forgetting things. | Mosaic, both seated. She pours the last cup. |
| 19 | THEO | I don't forget things. | |
| 20 | VERA | No? | She lifts the umbrella onto the table. |
| 21 | – | – | Twist insert: the tag reads "THEO / last tue." Ding. |
| 22 | VERA | You left it here… last Tuesday. | |
| 23 | THEO | You kept it? For a week? | Shock and blush. |
| 24 | VERA | I kept the booth too. | Her only blush. Music dips. |
| 25 | VERA | Dry off first, Theo? | Callback. The song he picked starts playing; she hands him the towel again; the sign reads CLOSED. |
| 26 | THEO | Make it two cups. | Heart eyes, pink ding. |
| 27 | – | – | Silent tail: exterior in the rain, neon, the two of them in the booth through the window. Fade out. |

## Approved choices (2026-11-18)

- Diner name: MOONLITE DINER.
- Tag: "THEO / last tue."
- Theo's last line: "Make it two cups."
- Jukebox song: original or CC0, slow lo-fi.

## Storyboard (v1, 2026-11-18)

- **Board:** `storyboard/board.png` (27 shots), single stills `storyboard/shot_<id>.png`, title card `storyboard/title.png` ("EPISODE 2" coral / "The Last Cup", the ep 1 v3 Title Case pixel font), set stills `storyboard/set.png`.
- **Length:** 70.1 s, 27 shots, mean 2.6 s per shot (`work/timeline.json`, cut to the real takes). The twist insert lands at 49.2 s (70 %), the callback at 60.7 s.
- **Voices:** all 24 spoken lines (the script has 27 rows; 02, 21 and 27 are silent) generated with VoiceStudio, Vera `cf0b8ddb`, Theo `a66e21f8` at speed 1.15, steps 32, wav, raw, no "!". Every take passes Whisper (match 1.0 after the clean chain; `voz/takes.json`). Questions rise: 01 +3.4 st, "For you?" +9.0, 08 +12.5/+11.6, 10 +10.6, 12 +7.2, 20 +7.6, 23 +4.9/+12.8, 25 +12.1. 15 "Which one is yours?" was retaken (seeds 5–12, `voz/retake_15_theo/`): seed 9, +4.0 st (the first pick rose only +1.0; kept as `s4_v1_used.wav`).
- **Pipeline:** `python tools/voice_final.py 1,2,3,4` (reads `work/lines.json`), `python tools/take_spans.py`, `python tools/sb_timeline.py`, `cd engine && node render.mjs --page sb.html --frames <(3i+1)*30> --out stills/v6 --sbmeta stills/sb_meta.json`, `python tools/compose.py engine/stills/v6 --set engine/stills/set`.
- **Set (engine/sb.js `diner()`):** MOONLITE DINER. Checker floor, teal wainscot + cream wall + pink stripe, red quilted chrome counter with 5 red stools, the carafe with ONE cup left on its warmer, napkins/sugar/ketchup/pie dome/register, stainless back bar with brewer (empty pot), mug stacks, shake mixer, backlit menu, teal neon clock at 11:55, the umbrella on a brass peg behind the counter (kraft tag turned to the wall), apron. Her booth on the rain-streaked window (red tufted vinyl, chrome rolls, formica table), a second booth + glowing jukebox + EAT neon on the left wall. Glass door with bell, rain streaks and an OPEN/CLOSED sign. Outside: wet sidewalk, parking lot with neon reflections and a parked car, guardrail + far headlights, hills, MOONLITE (pink) DINER (teal) roof sign, pole sign, 1600 rain streaks. Textures 8–64 px, nearest. Pink + teal point lights spill the neon onto the booth.
- **Engine changes vs ep 1:** transparent materials keep the destination alpha (normal blending lowered the bloom alpha and the glass/coffee read washed-out); the coffee is drawn after the glass; booth/IK helpers; `graft()` (arms of another clip on the current pose).

| # | Time | Speaker | Line | Voice onset | Clip | Face | Camera | Note |
|---|---|---|---|---|---|---|---|---|
| 01 | 0.0–4.7 | THEO | Sorry… are you still open? | 2.2 | Theo idle_stiff on the mat (film: walk in from the rain); Vera hold_object, mug in Hand.R + rag in Hand.L | Theo open / talkSmall; Vera half / neutral | 28 mm wide over the counter end | Bell + rain noise. Door swung open, rain falling behind him, drips + puddle. Title card EPISODE 2 / THE LAST CUP. |
| 02 | 4.7–6.0 | - | – | – | - | - | 50 mm insert, bg soft | Pixel-mosaic IN. One cup of coffee left in the pot. Behind, on the back wall peg: a navy umbrella with a kraft tag turned away (planted, not read). |
| 03 | 6.0–8.5 | VERA | For you? Dry off first. | 6.17 | flirt_lean_in (1.1 s) | smug / talkSmall | 50 mm, low angle, slow push-in | Catchphrase PLANTED ("Dry off first."). Umbrella on its peg soft behind her. |
| 04 | 8.5–11.5 | THEO | I’m fine. It’s just a little rain. | 8.69 | shrug (0.55 s) | smiling / talkSmall | 50 mm, slight high angle (her eye line) | Drops falling off his hair, puddle on the checker floor. Rainy window soft behind. |
| 05 | 11.5–14.7 | VERA | You’re dripping on my floor. | 11.74 | Vera point (0.85 s, arm out after the throw); Theo surprised (0.4 s) | Vera smug / talkSmall; Theo surprised / parted | 35 mm over his shoulder | The towel mid-air over the counter (no throw clip: release pose + flying prop). |
| 06 | 14.7–17.3 | THEO | Right. Sorry. Thank you. | 14.88 | scratch_head (1.1 s, hand at the head) with the towel in Hand.R | shy+blush / talkSmall+blush | 50 mm 3/4 | Towel on his hair. |
| 07 | 17.3–21.0 | VERA | The last cup comes with conditions. | 17.48 | flirt_hip_tilt (1.6 s) | smug / talkA | 35 mm, low, pot in the foreground | The carafe (one cup left) big in the lower frame, Vera rising above it. |
| 08 | 21.0–23.2 | THEO | Conditions? For coffee? | 21.22 | shock_freeze (1.15 s, held) | shocked / oh | 50 mm, straight on | – |
| 09 | 23.2–25.4 | VERA | One. Pick a song. | 23.45 | Vera point (0.9 s) at the jukebox; Theo idle_stiff, turned to it | Vera smug / talkSmall; Theo open / parted | 24 mm wide (from the front booth) | Condition 1. Re-establishes the room: counter, stools, the jukebox glowing on the left wall. |
| 10 | 25.4–27.2 | THEO | Something… slow? | 25.59 | ask_tilt (0.8 s) | gazeR / talkSmall | 50 mm, jukebox glow on the left | Pink/teal jukebox light on his face (tint), selector strip in frame. |
| 11 | 27.2–28.9 | VERA | Bold choice. | 27.36 | flirt_head_tilt (1.2 s) | smug / smirk | 50 mm 3/4, low | Brewer + menu sign soft behind. |
| 12 | 28.9–30.4 | THEO | Is that bad? | 29.09 | talk_nervous (0.8 s) | shy / talkSmall | 50 mm | Jukebox rim light behind him. |
| 13 | 30.4–32.7 | VERA | I didn’t say bad. | 30.73 | flirt_wink (0.65 s) | wink / smirk | 50 mm, low, dutch 5° | Her one dutch angle. |
| 14 | 32.7–36.1 | VERA | Two. You sit in my booth. | 33.48 | lean_reach (0.9 s), the cup under Hand.R on the table | smug / talkSmall | 35 mm, from the booth | Pixel-mosaic IN (time skip: the pot is empty, the cup is at the booth). Condition 2. |
| 15 | 36.1–38.2 | THEO | Which one is yours? | 36.35 | ask_tilt (0.8 s) | open / talkSmall | 50 mm | Counter + stools soft behind. |
| 16 | 38.2–40.5 | VERA | The one I’m sitting in. | 38.42 | sit_chair, right arm IK out over the table to the seat across | bedroom / talkSmall | 35 mm, from the aisle | NO pat clip: she reaches out toward the seat across instead (arm IK on sit_chair). Rain on the window behind. |
| 17 | 40.5–42.1 | THEO | Oh… okay. | 40.75 | sit_down (0.75 s, halfway down) | shy+blush / blushSmile+blush | 50 mm | – |
| 18 | 42.1–46.1 | VERA | Three. Stop forgetting things. | 42.82 | Vera sit_chair, right arm IK holding the pot over his cup; Theo sit_talk | Vera smug / talkSmall; Theo open / parted | 28 mm wide, side (from the aisle) | Pixel-mosaic IN (now seated). She pours the last cup. Condition 3. Rain on the glass behind them. |
| 19 | 46.1–48.0 | THEO | I don’t forget things. | 46.26 | sit_talk (0.8 s) | gazeR / talkSmall | 50 mm | Rainy window + neon behind him. |
| 20 | 48.0–49.2 | VERA | No? | 48.31 | sit_chair, right arm IK up with the umbrella (grip in Hand.R) | bedroom / talkSmall | 35 mm, low, from his seat | She lifts the umbrella from the bench onto the table. |
| 21 | 49.2–51.2 | - | – | – | - | - | 50 mm top shot (90°) | THE TWIST insert. Tag readable: "THEO / last tue." Slow push-in, ding. |
| 22 | 51.2–54.9 | VERA | You left it here… last Tuesday. | 51.51 | sit_chair | smug / talkSmall | 50 mm, umbrella in the foreground | – |
| 23 | 54.9–57.5 | THEO | You kept it? For a week? | 55.13 | sit_talk (1.4 s) | shocked+blush / talkO+blush | 50 mm, straight on | – |
| 24 | 57.5–60.7 | VERA | I kept the booth too. | 58.44 | sit_chair | soft+blush / sweetSmile+blush | 50 mm, eye level (equal for once) | 0.9 s pause before the line. Her only blush. Music dips. |
| 25 | 60.7–64.3 | VERA | Dry off first, Theo? | 62.07 | Vera sit_chair, right arm IK holding the folded towel out to him; Theo sit_talk (edge of frame) | Vera bedroom / talkSmall | 35 mm from the aisle, the door behind her | CALLBACK, first time she says his name. The door sign behind her reads CLOSED (flipped off screen). The song he picked starts. |
| 26 | 64.3–67.1 | THEO | Make it two cups. | 64.57 | sit_talk + hold_cup arms grafted, the cup in his hands | hearts+blush / blushSmile+blush | 50 mm, slow push-in | Pink "ding" on the hearts. |
| 27 | 67.1–70.1 | - | – | – | Theo sit_talk; Vera sit_chair | Theo hearts+blush; Vera happy / smile | 28 mm, exterior wide | Silent tail ~3 s, no subtitle. Rain + neon, MOONLITE DINER sign. Fade out. |

### Actions with no clip (not faked)

- **Drying the mug (01):** `hold_object` with the mug in Hand.R and the rag in Hand.L; no drying loop.
- **Tossing the towel (05):** no throw clip. Vera holds the `point` release pose and the towel is a prop in mid-air (film: fly it along an arc).
- **Drying his hair (06):** `scratch_head` with the open towel glued to Hand.R; no rubbing loop.
- **Carrying the cup to the booth (between 13 and 14):** happens behind the mosaic; 14 shows her setting it down with `lean_reach`.
- **Patting the seat across (16):** no pat clip, and the seat is out of reach. She reaches her arm out over the table toward his seat (IK on `sit_chair`).
- **Sitting down (17):** `sit_down` frozen halfway.
- **Pouring (18):** no pour clip. `sit_chair` with the right arm IK'd to the pot over his cup; the pot is tilted and a coffee stream prop runs into the cup. His cup is pulled to the middle of the table so her arm can reach it.
- **Lifting the umbrella (20):** right arm IK raising it from the bench, the grip glued to Hand.R.
- **Handing him the towel (25):** right arm IK holding the folded towel out over the table.
- **Holding the cup (26):** `hold_cup` arms grafted on `sit_talk`.
- **Flipping the door sign (25):** off screen; it already reads CLOSED.

### Open points for approval

1. Shot 25 is shot from the aisle (not over his shoulder) so the CLOSED door sign can be read behind her; from the booth the door is edge-on.
2. Title case: "The Last Cup" in the ep 1 v3 Title Case font (ep 1's user note). Say if you want caps.
3. Shot 09 is the only wide that shows the jukebox; it uses a slightly wider lens (~24 mm) to fit the jukebox, Vera pointing and Theo in the 9:16 frame. The jukebox sits at the left edge.
4. The window rain streaks are an alpha texture plus line rain outside; in the film the streaks can slide down and the rain scroll.
5. Music (slow lo-fi, original or CC0, also the jukebox song from 25) and SFX (bell, rain, mosaic whoosh, ding on 21 and 26, rain + neon hum on 27) are for the film pass.
