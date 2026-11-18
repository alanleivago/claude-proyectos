# vera-01 · EP 1 "THE LAST SLICE" · SCRIPT + STORYBOARD (approved) · film render v1

## v4: final, delivered (2026-11-17)

- **Wipe fix:** the wiping arm no longer passes through Vera's torso.
  - The wipe area moved out to her right side (screen left): reach 0.5, side 0.19, 5 cm strokes, elbow pole out. Her left hand rests further out.
  - **Check:** `sb.html?film=1&clipcheck=01`, nearest arm vertex to any torso triangle, per frame. v3: 13.5 cm min, with the forearm crossing in front of her chest. v4: 21.9 cm min (median 23.2) over all 146 frames of the opening.
  - The rag stays under her palm on the counter.
- **Delivered to** `C:\Volumes\alanwork\trabajo\Renders finales claude\Vera\`:
  - `The Last Slice Had His Name On It.mp4` (share encode, 77.7 s, −14.2 LUFS, −2.9 dBTP);
  - the caption `.txt` next to it;
  - the cover `Miniaturas\The Last Slice Had His Name On It.png` (`tools/cover.py`).
- **Cleanup:** v1–v4 renders, their revision notes and the engine intermediates were deleted. `render/` keeps only the title-named master and its caption.

## v3 render (user feedback on v2)

- **Wobble and drift back:** the PS1 vertex wobble on the set and the slight handheld drift are restored, exactly as in v1. The snap stays off on the characters, since it caused the face streaks.
- **Flicker, fixed locally:**
  - the street-wall box's hidden inner face;
  - the pieces moved apart in v2;
  - the street wall rebuilt on one shared vertex grid, so no T-junction can crack under the snap.
- **Title:** "The Last Slice" in Title Case, ×8.
- **Vera back in shorts:** `waitress_shorts.glb`, curvy v5 with the soft blush.
- **Opening:** v1 camera. Vera wipes the end of the counter facing the camera (`WIPE` on `idle_sway`), with the rag glued under the Hand.R palm on the bar top. The door and Theo's entrance are as in v2.

## v2 render (user feedback on v1)

- **Music always on:** the BGM plays the whole film, ducked under the voices, with a −2.5 dB dip under the confession. It runs through the tail and goes out with the picture fade.
- **Mosaic transitions:** 0.24 s (about 7 frames, 16→8→4→2 px).
- **New opening (shot 01):**
  - Vera wipes the table by the door: a two-bone IK loop on both arms over the bent `lean_reach` pose, with the rag flat on the table top. No clipping.
  - The door swings open on its hinge with the bell at 0.5 s.
  - Theo walks in from the street (the walk clip, moving at the clip's speed) and stops. His line starts at 2.2 s.
- **Models:** Vera now uses `waitress_jeans.glb`. Both GLBs were pulled after the blush-lowering pass (`upnext-waitress/review/blush_lower.png`), and Theo's after the armpit fix too (`upnext-suitor/review/fix_armpit_blush.png`).
- **"The usual, Theo?" retaken:** 16 takes (seeds 1–8 × guidance 2.0/3.0, speed 0.95) in `voz/retake_27_vera/`. Picked `s1_g2.0`: earshot ranks it #2 for "warm, teasing, playful, soft smile" (#1 does not rise) and it rises +5.4 st. The v1 take is kept as `v1_used.wav`.
- **Title font:** "THE LAST SLICE" is now set in `fonts/thatthatnewpixelfamilytest-square.otf` at its native 16 px grid ×6, with −1 px tracking between letters. Still: `storyboard/title_v2.png`.
- **Set flicker:** `tools/flicker_scan.py` counts pixels that blink A-B-A frame to frame, away from cuts. Causes fixed:
  - the street-wall box's inner face z-fought with the wall skins 2 mm in front (shot 27/28, 0:42 and 1:10 in v1);
  - the vertex snap made seams crack and thin pieces pop, so it is now off on the set too (`?snap=1` brings it back);
  - the handheld camera drift made edges shimmer on the pixel grid, so it was removed;
  - pieces that were only 3–5 mm apart (pictures, menu chalk, facade sign, register screen, pastry glass sitting on the counter) are now pulled further apart.

## v1 render (after the user approved the storyboard, with 2 changes)

- **Face streaks fixed in every shot:** `storyboard/ba_face_streaks.png` shows before and after (`tools/ba_faces.py`).
  - **Cause:** the PS1 vertex snap (270×480 grid) cracked the head mesh at its T-junctions, and the hair's dark back faces showed through as dashed lines across the cheeks.
  - **Proof:** `?nodecal` keeps the lines and `?nosnap` removes them. DOF, lens and atlas inset change nothing.
  - **Fix:** no vertex snap on the characters (the set keeps it). The face cells also sample 1 texel inside their cell now.
- **Theo's real voice:** "Voz theo pretendiente" `8da96883`, steps=32, wav, speed 1.15. At 1.0 the episode ran 81 s.
  - All 13 takes pass Whisper ("Oh… okay." is heard as "Ah, okay." after the chain; the raw take reads "Oh, okay.").
  - Denoise + chain: −45 to −69 dBFS between words.
  - The Eagle One test takes are in `voz/test_eagle/`, and the speed-1.0 takes in `voz/theo_speed100/`.
- **Re-timed:** 75.85 s, 30 shots. The times in the table below are from v1 storyboard. The current ones are in `engine/film_timeline.json`, and `storyboard/board.png` was regenerated with them.
  - 1.7 s of silence on the label before the twist line (`'25': (1.8, 0.6)` in `tools/sb_timeline.py`).
  - A 1.4 s beat before the callback.
- **Film pipeline:**
  - `python tools/take_spans.py`, then `python tools/sb_timeline.py`, then `python tools/film_timeline.py` (cards, mouth levels, `audio/voice.wav`).
  - `cd engine && node render_film_up.mjs "film=1" ../work/engine_v1.mkv`.
  - `python tools/mix_film.py v1`.
  - `python tools/post_film.py work/engine_v1.mkv audio/mix_v1.wav render/vera01_v1.mp4`.
- **Film mode in the engine:** `sb_shots.js` (`filmUpdate`) adds clips that play around the storyboard pose, mouth flaps from the voice, blinks, held props that follow the hand, push-ins, and the door-bell swing. `main_sb.js` adds the mosaic-in (16→8→4→2→1 px) and the fade-out.
- **Audio:**
  - Music: "Lo-Fi - Morning Breeze" by noel.wav (Freesound 678119, CC0, about 89 BPM).
  - SFX: all Freesound CC0 (list in `tools/mix_film.py` and `render/vera01_v1.txt`).
  - Master: −14.0 LUFS, −2.1 dBTP.
- **Review:** `render/vera01_v1_revision.md`. The API had no credit, so the review was done in the session.

- **Format:** PS1 low-poly rom-com, modelled on @missmedannypsx (analysis in `fuentes/missmedannypsx/`). She holds the power, he is flustered and sweet. Idea 1 of SINTESIS.md.
- **Cast:**
  - **VERA**, the waitress: dominant, teasing, 1.75 m. Model `upnext-waitress/out/waitress_shorts.glb`, copied to `engine/models/vera.glb`.
  - **THEO**, the suitor: flustered, sweet, 1.67 m. Model `upnext-suitor/out/suitor.glb`, copied to `engine/models/theo.glb`.
- **Length:** 71.4 s, 30 shots (29 numbered + 25b), mean 2.38 s per shot, 27 lines, ~125 words. The twist lands at 56–62 s (79–86 %).
- **Set:** CRUMB CAFE at night. Warm amber interior against the cool street, door and window.
- **Catchphrase:** "The usual?" is planted at 3.7 s, without his name. It comes back as "The usual, Theo?" at 64 s, the first time she says his name. His last line is "The usual."

## Beats

| Beat | Time (s) | Shots | What happens |
|---|---|---|---|
| Hook | 0–3.5 | 01–02 | Bell. Theo in the doorway, one slice under the dome: "Sorry… is that one taken?" The title card is on screen from 0 s. Mosaic into the dome insert, where the label faces away. |
| Pretext | 3.5–19.9 | 03–08 | "The usual?" She knows his time (9:55, every night). He is embarrassed. "The last slice comes with conditions." |
| Escalation I | 19.9–31.9 | 09–13 | Condition 1: who is it for? "A friend." "Does your friend blush this much?" "It's for me." "Cute." |
| Escalation II | 31.9–47.6 | 14–20 | Mosaic. Condition 2: share it. She holds the slice out of his reach. "With who?" "Guess." Condition 3: sit in her section. "Every table is your section." "Exactly." |
| Vulnerability | 47.6–56.2 | 21–24 | Mosaic. Both are seated. "I don't even like cake." A 0.9 s pause, then "I know." (her only blush). "Read the label." |
| Twist | 56.2–63.2 | 25–26 | Top shot of the label: "THEO / since mon." "It's had your name on it… since Monday." "Since Monday?" |
| Callback | 63.2–68.4 | 27–28 | She is at the door and the sign now says CLOSED: "The usual, Theo?" Heart eyes: "The usual." |
| Tail | 68.4–71.4 | 29 | Silent exterior: the warm window and the two of them at the table. Fade out. |

## Shots

Times come from the test takes (`work/timeline.json`, built by `tools/sb_timeline.py`). The voice column is the speech onset in the film.

| # | Time | Speaker | Line | Voice | Clip | Face (eyes / mouth) | Camera | Note |
|---|---|---|---|---|---|---|---|---|
| 01 | 0.0–2.2 | THEO | Sorry… is that one taken? | 0.30 | Theo `idle_stiff` in the doorway. Vera `flirt_hip_tilt` with a rag in Hand.R | Theo open / talkSmall. Vera half / neutral | 28 mm wide over the counter | Bell ding at 0.0, door open. Title card 0.0–3.4 s. Dome and slice in the foreground. |
| 02 | 2.2–3.5 | – | – | – | – | – | 50 mm insert, background blurred | Pixel mosaic in, 2.2–2.9 s. The label faces away (planted, not shown). |
| 03 | 3.5–6.1 | VERA | Let me guess. The usual? | 3.71 | `flirt_lean_in` 1.1 s | tease / talkSmall | 50 mm, slight low angle, push-in | Catchphrase planted. |
| 04 | 6.1–7.6 | THEO | I have a usual? | 6.37 | `scratch_head` 1.1 s | surprised / talkSmall | 50 mm, slight high angle | |
| 05 | 7.6–11.4 | VERA | Nine fifty-five. Every night. | 7.86 | `flirt_head_tilt` 1.2 s | sideEyeR / talkSmall | 50 mm, 3/4 | |
| 06 | 11.4–13.6 | THEO | Okay. That's embarrassing. | 11.66 | `blush_look_away` 0.7 s | gazeL+blush / talkSmall+blush | 50 mm, 3/4 | |
| 07 | 13.6–18.6 | VERA | The last slice comes with conditions. | 13.87 | `flirt_hip_tilt` 1.6 s | smug / talkA | 35 mm, low side angle | Dome in the foreground. |
| 08 | 18.6–19.9 | THEO | Conditions? | 18.80 | `shock_freeze` 1.15 s | shocked / oh | 50 mm, straight on | |
| 09 | 19.9–22.1 | VERA | One. Who's it for? | 20.13 | Vera `point` 0.9 s. Theo `idle_stiff` | tease / talkSmall. Theo open / parted | 28 mm wide two-shot | Condition 1. |
| 10 | 22.1–24.5 | THEO | A friend. A good… friend. | 22.34 | `deny_palm` 0.3 s | gazeR / talkSmall | 50 mm, dome slice in the foreground | |
| 11 | 24.5–28.9 | VERA | Does your friend blush this much? | 24.79 | `flirt_lean_in` 1.35 s | bedroom / talkSmall | 50 mm, dutch 5° | Her one dutch angle. |
| 12 | 28.9–30.2 | THEO | It's for me. | 29.11 | `fan_collar` 1.0 s | shy+blush / talkSmall+blush | 50 mm | |
| 13 | 30.2–31.9 | VERA | Cute. | 30.61 | `nod` 0.3 s | happy (^^) / smileOpen | 50 mm | `laugh` would cover her mouth with her hand. |
| 14 | 31.9–34.9 | VERA | Two. You share it. | 32.69 | Vera `raise_object` 0.7 s, plate in Hand.R. Theo `reach_up` 0.55 s | smug / talkSmall. Theo surprised / parted | 35 mm, low, over his reaching arm | Mosaic in (the dome is off). Condition 2. |
| 15 | 34.9–36.2 | THEO | With who? | 35.19 | `ask_tilt` 0.8 s | open / talkSmall | 50 mm | |
| 16 | 36.2–37.8 | VERA | Guess. | 36.49 | `flirt_head_tilt` 1.5 s | bedroom / smirk | 50 mm, low, dutch | |
| 17 | 37.8–39.8 | THEO | Oh… okay. | 38.05 | `blush_look_away` 1.1 s | gazeDown+blush / blushSmile+blush | 50 mm | |
| 18 | 39.8–43.3 | VERA | Three. You sit in my section. | 40.06 | Vera `point` 0.95 s toward the window table. Theo `idle_stiff` | smug / talkSmall | 28 mm wide | Condition 3. The plate already waits on the table. |
| 19 | 43.3–45.4 | THEO | Every table is your section. | 43.54 | `talk_side` 0.6 s | gazeL / talkSmall | 50 mm | Empty tables blurred behind him. |
| 20 | 45.4–47.6 | VERA | Exactly. | 45.68 | `flirt_wink` 0.65 s | wink / smirk | 50 mm | |
| 21 | 47.6–49.6 | THEO | Can I be honest? | 48.36 | Theo `sit_talk`. Vera `sit_chair` | shy / talkSmall. Vera half / smirk | 28 mm wide, side | Mosaic in (seated). |
| 22 | 49.6–51.5 | THEO | I don't even like cake. | 49.84 | `sit_talk` 1.0 s | gazeDown+blush / talkSmall+blush | 50 mm | Music dips. |
| 23 | 51.5–53.9 | VERA | I know. | 52.48 | `sit_chair` | soft+blush / sweetSmile+blush | 50 mm, eye level | 0.9 s of silence before the line. |
| 24 | 53.9–56.2 | VERA | Read the label. | 54.18 | `sit_chair`. Theo's shoulder in the foreground | tease / talkSmall | 35 mm over the shoulder | |
| 25 | 56.2–59.1 | VERA (off) | It's had your name on it… | 56.80 | – | – | 50 mm top shot, 90° | Twist insert. Label: THEO / since mon. Ding. |
| 25b | 59.1–61.8 | VERA | since Monday. | (same take) | `sit_chair` | smug / talkSmall | 50 mm | Cut at the take's pause (2.45 s). |
| 26 | 61.8–63.2 | THEO | Since Monday? | 62.06 | `sit_talk` 1.4 s | shocked+blush / talkO+blush | 50 mm | |
| 27 | 63.2–66.4 | VERA | The usual, Theo? | 64.17 | `flirt_over_shoulder` 1.25 s | bedroom / talkSmall | 35 mm, low, from his seat | The callback. The door sign reads CLOSED. 1.0 s beat before the line. |
| 28 | 66.4–68.4 | THEO | The usual. | 66.67 | `sit_talk` 0.3 s | hearts+blush / blushSmile+blush | 50 mm, slow push-in | Pink ding on the hearts. |
| 29 | 68.4–71.4 | – | – | – | Both seated | Theo hearts+blush. Vera happy / smile | 28 mm exterior wide | Silent tail, no subtitle, fade out. |

## Actions with no clip (not faked)

- **Turning the plate while seated (24):** no seated reach clip. The plate is turned between 23 and 24, off the cut.
- **Lifting the dome / carrying the plate (between 13 and 14, and 17 and 18):** no clip. Both happen off screen behind the mosaic cuts.
- **Flipping the door sign (27):** no clip. It already reads CLOSED when we cut to her.
- **Wiping with the rag (01):** a static rag sits in Hand.R on `flirt_hip_tilt`. A wipe loop would need a new clip.
- **Laughing with her mouth showing (13):** `laugh` covers her mouth, so I used `nod` with happy eyes instead.

## Look and tech

- **Engine:** copied from `upnext-01/engine` (`main_sb.js`, `render*.mjs`, fonts), unchanged except for:
  - a depth-of-field pass for the 50 mm close-ups (gather blur up to ~2.6 low-res px, wides stay sharp);
  - a default `DepthTexture` (a Float depth texture broke the render targets in ANGLE).
- **Characters:** unlit, with per-shot tints (warm amber inside, cool in the doorway), `_meta` face-cell swaps, lens 0.016, emissive bloom, 270×480 ×4. In the film, `afps=15` steps the characters while the camera stays at 30 fps.
- **Code:**
  - `engine/sb.js`: the cafe, both characters, the props, pose-sheet mode `?poses=vera|theo`, set mode `?set=1`.
  - `engine/sb_shots.js`: the 30 shots, `?only=01,02` for single shots.
- **Set:**
  - Counter with a cake stand, glass dome and ONE slice with a kraft label.
  - Pastry case with empty plates (sold out).
  - Espresso machine, grinder, register, shelves with jars, menu chalkboard.
  - 4 marble tables with bentwood chairs, green pendants, string lights.
  - Glass door with a bell and an OPEN/CLOSED sign, big window.
  - Street outside with a lamp, opposite facade, awning and the CRUMB CAFE sign.
  - All textures are 8–64 px, nearest.
- **Subtitles:** the UpNext style from post_film/compose. Pixelify Sans Bold 66 px ×0.84, 4 px outline, (4,4) hard shadow, glow, line 1 at y=1325, typewriter in the film. White for Vera, #F3DF6A for Theo.
- **Title card:** "EPISODE 1" in coral #F08AA0 at 48 px, and "THE LAST SLICE" in white at 86 px. It sits at y 340/420 (18–22 %) for 0–3.4 s.
- **No rounded frame:** the ref has none.
- **Mosaic transitions:** at 02, 14 and 21 (time and space jumps).
- **Storyboard:** `python tools/sb_timeline.py`, then `cd engine && node render.mjs --page sb.html --frames <(3i+1)*30> --out stills/v5 --sbmeta stills/sb_meta.json`, then `python tools/compose.py engine/stills/v5 --set engine/stills/set`.

## Voices (test takes)

- **VERA:** "Voz mesera clean" `e9c8051b`.
- **THEO:** "Voz theo pretendiente" `8da96883` (the user's voice, speed 1.15) since v1 render. Before that the storyboard used the temporary "Eagle One pilot" `0e713b26`.
- **Settings:** steps=32, wav, raw, no "!". Generated by `tools/voice_final.py`, which reads `work/lines.json`.
- **Files:** kept takes in `voz/raw/`. Clean chain (HPF, comp 2.5:1, −14 LUFS, limiter −1.5 dBFS) in `voz/<take>.wav`. Report in `voz/takes.json`.
- **Whisper check:** all 27 lines pass.
  - 05 is heard as "9.55 every night" and 18 as "3. You sit…": digit transcriptions, the words are right.
  - 17 was changed from "Oh." (TTS failed on one word) to "Oh… okay."
  - 15 "With who?" falls in pitch, which is natural for a wh-question.

## Caption draft

```
He said it was for a friend. ♡
Would you share the last slice?
#romcom #lowpoly #animation #romance #ps1 #fyp
music: <credit>
```
No episode number, following SINTESIS.md: the first post is a promise caption, and the question is there to bring in comments.

## Open points for approval

1. Theo's real voice: the timings will shift when his takes replace the temporary ones.
2. Title accent colour: coral. The Vera/Theo colour pair stays white / #F3DF6A.
3. Cafe name: "CRUMB CAFE".
4. Music (lo-fi, 80–95 BPM, licence to check) and the SFX list (bell, mosaic whoosh, ding on 25 and 28, street hum on 29). These are for the film pass.
