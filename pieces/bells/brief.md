# Bells — brief (Madfable long-form cosmic horror, 16:9, ~3:40 + ~20 s red outro, no voice)

Title: Some Bells Aren't Rung To Call The Faithful. They're Rung To Keep Something Asleep.
Device: a colossal sleeping face forms in the fog above a Carpathian monastery once its bell stops; every hour without the bell, its eyelids open more.
Pipeline: copied from pieces/lost-second (the approved bar): Flow (Nano Banana Pro via MCP) -> tools/native.py (240x134 grid, NATIVE_PX 8) -> flowShot; captions in aansa (SUB_S 4, lh 12), wiggle 1.5 px on picture + captions, HUD no wiggle, Premiere-style B&W (luma only, no curve) on everything but the red outro. Captions only; voice/script.json + `voice.mjs --scratch` is the clock; Talking 1 Loop.wav under the captions.

## Script
29 approved lines in voice/script.json (scratch timing: last line ends 218.1 s; card at +2.2 s; outro +6.4 s, 21 s).
Silence before the reveal: line `open` ("the eyes were already open") has a 5.4 s pause; the reveal is `looking` (loudest hit + bell, glitch burst).

## Facts (the rest is fiction)
- Medieval bell inscription "Vivos voco, mortuos plango, fulgura frango" (I call the living, I mourn the dead, I break the lightning). Source: https://fr.wikisource.org/wiki/Discussion:%C3%89tudes_fran%C3%A7aises_et_%C3%A9trang%C3%A8res/La_Cloche
- About 175,000 church bells were taken from occupied Europe and Germany by Nazi Germany in 1939-45 to be melted for the war industry. Sources: https://www.amusingplanet.com/2021/06/the-bell-cemeteries-of-world-war-2.html , https://www.bells.org/blog/when-nazis-took-all-bells

## Look-check assets
gen/ (prompts in gen/PROMPTS.md): face_closed.jpg (beat 10), face_open.jpg (eye edit, for beats 11/23), reveal.jpg (beat 24, low angle from the village, same face), log.jpg (beats 13-14).
tools/native.py gains mode `flat4` (black / dark grey 56 / grey / white) so mountains, forest and stone walls survive; tools/prep.py builds assets/ (log pages blanked + log_ink.png handwriting at 4 px cells).

## Delivery
- Video: renders/bells.mp4 (1920x1080, 247.7 s, -13.0 LUFS, -1.7 dBTP)
- Title: A Giant Face Formed In The Fog The Night The Monastery Bell Stopped (Cosmic Horror)
- Thumbnails: thumbs/sheet.png
