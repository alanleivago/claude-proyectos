# Expedition 01: The Bedroom — production log

## v1 (2026-10-31), one render, one review (user rule: no self-correction rounds)

**Output:** `expedition01_bedroom_v1.mp4`, 1920x1080, 30 fps, 10:25.6, H.264 + AAC 192k.

### What went in
- **Menu fix (asked first):**
  - ITEM GET: the 3D object is centred in the slot window by its real projected bounding box (every vertex, every frame), and sized so its largest extent over a full turn fills 84% of the 148x116 window.
  - INVENTORY: Mechayuki is centred in the portrait by her Head/Chest/Pelvis bones.
- **Shots:** 115 shots (was 33), a cut every 5.4 s on average. New shots per paragraph, plus `alt()` re-angles and page zooms of the long shots.
- **New animations used:**
  - climb_in: the window of the buried house, from the dig pit.
  - press_down: the mattress, with a boing per bounce.
  - lie_on_side: the stone pillow gag.
  - charge_plug: "I recharge in forty minutes".
  - dig_hands: the collapsed wardrobe.
  - light_candle: the midnight wake-up between first and second sleep.
  - step_back: the commode and "I'm not touching it".
- **NPCs:**
  - Adams with a nightcap.
  - Franklin with his own look: long grey hair from a bald crown, round spectacles.
  - A medieval family on the straw sack.
  - Midnight villagers with candles.
  - Strangers at the inn and a family of four plus a dog in one bed.
  - A sick man propped up on pillows.
  - The 1953 scientists and Max Negwer.
- **Props:** a porcelain pillow (China room), a rushlight in an iron holder, a nightshirt on a peg, an earth-packed door (dig pit), a glass of water and a book.
- **Sets:**
  - The Body Manual now has an MML2 lab/ruin room behind the page: carved relief, pillars, monitor bank, console.
  - The night street is now the MML2 town at night, with the pole on the inn window.
  - The hill has a roof ridge and chimney poking out, rocks, a fence and lit materials.
  - New sets: the dig pit (house front with door and window) and the China room.
- **Voice:**
  - megagirl, 50 paragraphs; the approved "Operator…" clip is spliced into p01 in silence.
  - Whisper word check on every paragraph (`voz/scripts/check_exp.py`): p18, p24, p29 and p38 regenerated.
  - The four falling questions were raised with PSOLA (`fix_q.py`).
  - speaker_sim ≥ 0.956 on every paragraph.
  - Assembled, then the clean chain (`retro_voice --preset genre --eq 0`).
- **Music:** original, `audio/scripts/music_exp.py`. Five MML2-style areas switch by location (dungeon, past, manual, boss, closing), plus an ITEM GET fanfare on each card. No Capcom melody.
- **SFX:**
  - The user's Mega Man Legends menu set: cursor, treasure-open and select.
  - CC0 Freesound foley: new picks plus reuse from digger-01 to 04.
  - Code blips and stings.
  - Ambience beds per area.
  - 50 label cues; 0 unmapped cues.

### Checks
| check | value | status |
|---|---|---|
| resolution / fps | 1920x1080 / 30 | PASS |
| duration | 625.57 s (voice 622.97 s + tail) | PASS |
| loudness (final mp4) | -12.0 LUFS integrated | PASS |
| true peak (final mp4, after AAC) | -1.5 dBTP | PASS |
| Whisper vs script | 50/50 paragraphs. Only spelling diffs remain: digits, "rush light", "night shirt" | PASS |
| questions rise | p08 +4.4 st, p20 +3.6, p28 +5, p43 +4.1, p49 +2.1 | PASS |
| speaker similarity | 0.956–0.996 (refs self-sim 0.964–0.99) | PASS |
| SFX cues unmapped | 0 | PASS |
| earshot critique (mix) | launch-grade; 18/20 in range; minor: near-mono, thin sub | PASS (minor) |
| revisar_render (4 parts) | NO LISTO, see `review/parts/*_revision.md` | FAIL |

### What the review flagged (to fix in v2 once the user has seen v1)
1. Captions:
   - they collide with bottom labels (PERSIAN > INDIA, STILL SELLING TODAY, CAUSE: SNORING, 8/8 ARTIFACTS, TIME: NO);
   - the small pixfont closes c/e/a, so digits misread (1956 reads as 1896, 1964 as 1984).
2. Framing:
   - Mechayuki cut by the frame edge or face hidden: drawer, commode, "not touching it", page zooms, plaza.
3. Body Manual P.3 day counter:
   - it runs ahead of the voice; it should be tied to "three", "five" and "eleven".
4. Flat 2D panels:
   - the Odyssey boat and sirens;
   - the dolphin;
   - pajamas that read as a slab (only 4 in the drawer for "x27").
5. A translucent wall/beam near the camera in some dungeon angles (the sunbeam shaft).
6. Scan brackets stacked on her head; the "8 ARTIFACTS" pose frozen.
7. Unreadable actions:
   - "Let's dig" has no shovel;
   - pulling up grass shows the kneel pose;
   - the cave fire is a cone;
   - the peas aren't visible;
   - the inventory cursor doesn't follow the list.
8. Historical sets:
   - medieval and China reuse the same tudor room;
   - 1953 Chicago is in the lab ruin and the scientists wear casual clothes;
   - the same NPC plays Max Negwer.
9. Small items:
   - the quote glyph renders as "?" ("?COMMODE?");
   - the phone UI is wider than the phone;
   - the ITEM GET description is empty for its first ~2 s;
   - "NIGHTSTA" is truncated;
   - the outro is big.

## Files
- engine: `film.js` (production section "PRODUCTION v1"), `shots.js` (loader), `render.mjs`, `render_film.mjs`
- voice: `voz/takes/raw/` (final takes), `voz/takes/megagirl_track(_clean).wav`, `voz/scripts/*`
- audio: `audio/scripts/music_exp.py`, `audio/scripts/mix_exp.py`, `audio/megagirl/mix.wav`
- review: `review/contact_v1.png`, `review/parts/*_revision.md`, `review/prod4/` (stills)

## v2 (2026-10-31): only the 7 items the user asked for, one render, one review

**Output:** `expedition01_bedroom_v2.mp4`, 1920x1080, 30 fps, 10:26.5. Review: `review/parts_v2/*_revision.md` (4 parts, all four came back).

| # | item | what changed | check | status |
|---|---|---|---|---|
| 1 | Mix: music lower, voice higher | bed 13 LU under the voice (was 7), 10 dB duck while she talks (was 7); master renormalised | voice over music while speaking: median +14.1 dB (p10 +5.5); music in pauses −8.6 dB under the voice; mp4 −12.0 LUFS, −1.5 dBTP; earshot launch-grade, 0 major (minor: near-mono, thin low end) | PASS |
| 2 | Meadow like MML2 (start + ending) | new `meadow()`: one solid ground, rolling hills fading to pale blue-green, blue gradient sky, 16 big PS1 cloud billboards, rainbow, tan dirt/rock cliff band, dirt mound; cameras lowered to show the sky | stills `review/v2/meadow_sheet.png` vs `review/ref_mml2_prado.png` | PASS |
| 3 | 0:18 title over her face | EXPEDITION 01 / THE BEDROOM moved to the middle (y 123/147 of 270) | `review/v2/title/f_0640.png`: face clear | PASS |
| 4 | Captions readable | Pixelify Regular (was Bold + 1 px faux-bold), size 18, 2 px letter spacing, hand-made 2 px-stroke digits | crops `review/v2/capC.png` / `capE.png`: c/e/a open, 1953/1956/1964 read correctly | PASS with 2 notes: the old "f + hair space" hack now leaves a visible gap ("f ire", "f ind"); a lone "a" still reads small on its pop-in frame |
| 5 | 0:28 she passed through the window | the pit house front is now built around a REAL opening with a dark room behind; she steps onto the sill, through the opening and down inside | 9 moments x 4 angles (outside, side, inside the room, high): `review/v2/climb_sheet.png`, `climb_zoom.png`, no clipping | PASS |
| 6a | Ending flowers/ground flicker | removed every coplanar layer (village ground, snow hemisphere, alpha flower plane); ground and hills without PS1 vertex snap; mipmapped grass; 3D flower boxes; dug patch with polygon offset | consecutive frames: only motion changes; review: no flicker flagged | PASS |
| 6b | Ending camera zoom out / snap back / zoom out | removed the re-angle at "Expedition complete": one continuous pull-back from "Operators" to the end | stills 18600→18790 continuous | PASS |
| 7 | "for" cut off in "what was it for?" | new take (seed 2, speaker sim 0.968), PSOLA rise +4.1 st, splice back only after the word decays (`fix_q.py` v2), +0.35 s pause after "for?", 1.0 s gap after the paragraph | Whisper on the final mp4: "Operators? What was it for? Tell me in the comments." ("for?" 617.46–617.70, then a 0.78 s pause); envelope decays to −49 dB like the raw take | PASS |

**Review v2 (not changed this round, the user asked for these 7 only):**
- captions colliding with bottom labels;
- framing (cut at the edge / face hidden);
- the Randy day counter running ahead of the voice;
- the translucent sunbeam slab;
- the inventory cursor not following the list;
- flat Odyssey / dolphin panels;
- "NIGHTSTA";
- the big outro;
- 1953 / 1907 NPC wardrobe;
- the window frame on the meadow reads as a black panel behind her.

## v3 (2026-10-31): v2 feedback + every open review flag. Flow: render → review → one self-fix pass → re-render → review

**Output:** `expedition01_bedroom_v3.mp4`, 1920x1080, 30 fps, 10:27.4, −12.0 LUFS, −1.5 dBTP.
- Pre-fix render: `review/expedition01_bedroom_v3_prefix.mp4`.
- Reviews: `review/parts_v3/` (before the fix pass) and `review/parts_v3b/` (final).
- Verdicts: before the fix pass NO LISTO / CASI / NO LISTO / CASI; final CASI x4.

| item | status | note |
|---|---|---|
| "Operators" at 10:16 | PASS | new "Operators…" take (speaker sim 0.976 for the paragraph), spliced in silence, "for?" still rises +4.1 st; Whisper: "Operators, what was it for? Tell me in the comments." |
| "!" in TTS text | PASS | the script has none (grep: 0 in narration). The old take *sounded* exclamatory (f0 595 Hz, sim 0.50). p06 "Let's dig" also regenerated: s9, Whisper reads it with a period in isolation, sim 0.993. gen_exp now turns "!" into "." always |
| Ekirch pronunciation | PASS | TTS "Eekirk" (say EE-kirk); Whisper hears "Roger E. Kirk" |
| caption "f ire" gap | PASS | hair-space hack removed (ligatures were already off) |
| lone "a" on pop-in | PASS | 1–2 letter words skip the pop-in squash |
| captions vs bottom labels | PARTIAL | labels moved out of the caption band; captions auto-dodge labels (not on full-screen menus/pages). Still flagged: "back." in the rewind frames, "PAINTING" under a caption |
| framing (cut / face hidden) | PARTIAL | fixed: drawer (insert, no hero), commode (wide + pot insert), "not touching it", page zooms (inset, she stays visible), plaza, the pillow and the stone pillow off her face, "the bugs still haven't left", medieval, the lamp. Still flagged: lying on the stone (head beside it), cave profile, "I would have closed it" behind the post, peas from behind |
| day counter | PASS | follows "eleven" / "day three" / "day five" (zoomed card overflows a little at 01:04) |
| translucent light shaft | PASS | removed |
| scan boxes / frozen pose | PARTIAL | boxes on the objects, numbers pushed apart, she points → looks around → presents; the reviewer still sees a few still seconds |
| Odyssey flat panel | PASS | real 3D scene: ship, Odysseus at the mast, sailors with wax plugs, Sirens on rocks |
| dolphin flat | FAIL | pixel-art redraw still reads as a fish/shark to the reviewer |
| pajamas slab / drawer x27 | PASS / PARTIAL | folded shirt model with crescent moons; drawer insert with 18 folded pieces + "x27". The older dig shot still shows "x27" a few seconds early |
| "Let's dig" shovel | PASS | shovel + dig clip |
| pulling up grass | PASS | dig_hands + green tufts |
| cave fire | PASS | stone ring, logs, 7 flickering flames |
| peas not visible | FAIL | 3 bigger peas + pea-shooter tube, but the reviewer still sees one pea and her back |
| inventory cursor | PASS | follows each item she names (no sweep) |
| medieval vs China room | PASS | China has its own set (red lacquer, lattice windows, folding screen) |
| 1953 Chicago / scientists / Max Negwer | PASS | sleep-lab set (tiles, EEG), men in lab coats; Max Negwer in his pharmacy with a coat, moustache, spectacles, holding the tin |
| quote marks "?" | PASS | '"' glyph added to pixfont |
| phone screen / dark phone | PASS | portrait phone UI; the screen glows at "glowing rectangle" |
| ITEM GET description empty | PASS | typed at 120 chars/s from 0.1 s |
| "NIGHTSTA" truncated | PASS | NIGHT / STAND on two lines |
| outro too big | PASS | small plates at the top + a small SUBSCRIBE button |
| "SEE: DIGGER 04" | PASS | "SEE: THE ALARM CLOCK", hidden from the snooze line on |
| closing line | KEPT | "Expedition complete. Logging off." is the approved line of the Expeditions script. "Artifact understood. Logging off." is the Digger short-format rule |
| buried window = black panel | PASS | glass panes with highlights and earth piled around it |
| v2-approved items (mix, meadow, centred title, caption spacing, climb, ending, "for?") | PASS | re-checked: −12.0 LUFS / −1.5 dBTP; voice ~14 dB over the music; meadow, title, climb and ending not flagged |

**Review claims that are provably wrong (ignored):**
- "pie" vs PAY: Persian pāy is pronounced "pie", as written in the script.
- "a toilet cabinet": the script says exactly that.
- Part cuts mid-word: an artifact of splitting the video for the review.
- "Panel P.2 off-centre at 0:18": the centred title the user asked for is EXPEDITION 01 / THE BEDROOM.
- Whisper's comma in "Expedition complete, logging off": punctuation only.
