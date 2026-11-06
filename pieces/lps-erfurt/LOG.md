---
type: log
status: in_review
tags: [punkpolyshorts, erfurt-latrine-disaster, kaneda-punk, video-4, sets-variety]
relatedTo: [pieces/lps-erfurt/guion.md, pieces/lps-blind/LOG.md, pieces/lps-onoda/LOG.md]
---
# lps-erfurt — "The Toilet That Killed 60 Nobles" (punkpolyshorts #4)

## 2026-11-03 — voice, cast, props, storyboard v1 (waiting for the user's OK; no render, no mix)
- **Script:** guion.md approved as written ("procede me gusta"); line 10 kept; no wording changes.
- **Kit:** copied from lps-blind: lpskit, photoprop, post, assemble, retro_eq, paint_heads/people, despill, locate_eyes, mix_variant.sh, finish_v2.py.
- **Voice (`voice/gen_voice.py`):**
  - VoiceStudio "3d cartoon" (227af074), local server, ONE take per line (seed 1); Whisper only checks the take (all ≥ 0.91 except digit spellings).
  - Line 2 is spoken as "July, eleven eighty-four" (caption stays "1184").
  - Line 1 is one clean take, so the loop always lands on the same "Sixty".
  - `assemble.py` (TEMPO 1.1, FIX map for ASR spellings) + `retro_eq.py` → `voice/voice_retro.wav`, **35.62 s**, END 1069.
- **Cast (all distinct people, `tex/people.py` + Flow passport faces, eyes by `tex/locate_eyes.py`):**
  - Archbishop: alb, red chasuble with gold Y, pallium; mitre mesh on the head.
  - Landgrave: green tunic, fur mantle; fur hat.
  - Barbarossa: red beard face, crimson robe, ermine collar; gold crown.
  - Peasant: patched tunic, rope belt, leg wraps.
  - Five nobles: mi-parti blue/yellow + chaperon; mail + red-cross surcoat; black/gold chevron tabard + mail coif; purple houppelande with fur + gold chain; green/white stripes + feather hat.
  - 60 tiny crowd nobles: `tiny()` in build.py, 5 looks + 4 skin tones.
- **Kaneda as Henry:** `tex/make_medieval.py` swaps every expression atlas (like Onoda's soldier): burgundy tunic, gold collar band, back badge instead of the punkpoly logo, brown hose (`tex/medieval/`). Tiny gold crown with gems follows the Head bone every frame (`crown_follow()`), fitted to the top of the hair. Shot 13 uses the normal blue atlases, no crown.
- **Props from ONE Flow photo each (`ref/`, magenta bg, straight-on):**
  - latrine `photobox()`
  - goblet and barrel `loft`
  - stool `cross_cut`
  - beam (box with the photo strip)
  - throne, ladder, horse, facade, modern WC: alpha cut-outs (`tex/despill.py`)
  - map: Flow parchment of the Empire
- **Wall pictures (`tex/make_eggs.py`):**
  - Memes: Drake "CHECK THE BEAMS / INVITE 60 MORE NOBLES", Surprised Pikachu "NOBLES WHEN THE FLOOR GOES *CREAK*", Two Buttons.
  - Gross-ups (Courage/SpongeBob style, not Kaneda): monk, jester.
  - Weird realistic paintings: knight on a snail, goose in a ruff.
  - Video-game art: PS1 box "CASTLE PLUMBER 64".
  - Medieval comic: 3 panels of the party upstairs.
- **Sets (10):** A void stage, B map, C red void, D throne room (+ horse field), E upper hall, F floor macro, G cross-section, H top-down pit, I night exterior, J modern bathroom. One shot per line.
- **Look:** wobble grid 240, `post.py` = ps1_post dither BEFORE the captions. 3D Letters "60" (s01) and "1184" (s02); every caption hides while they show.
- **Self-check (`build.py --test`, `test/selfcheck_*`):** cast front/3-4/side/heads, Henry front/crown/seated/hanging, props.
  - Fixed: the crown was buried in the hair, then thrown far off by bone parenting; it is now on top of the hair. The crown gems floated in shot 13; they now hide with the crown. The landgrave faced away in s10; he now faces the camera. Noble4's chain read as a frown; it now hangs as a U.
  - Hands: the ladder rests on the peasant's fingertips (top of the hand verts). The hanging hands close on the bars and sill. The ropes run into the fists. Goblets stand on barrels, not in hands.
- **Board:** `review/board/board_a.jpg` (shots 1–7) and `board_b.jpg` (8–13), one key frame per shot, dithered + captions (`review/board/shot_XXa_*.png`).
- **Known issues:**
  - The s01 spotlight haze greys the void a little.
  - The s06 woodworm reads as beads.
  - The night tint is only on the set, not the people.
  - In the s12 wide shot the two hanging men are small.
  - The board does not show the horse cut (s04 second half). It is checked in `test/selfcheck_horse.png`, where Henry was moved back onto the saddle.
  - The hombre heads stay small against the bodies.
  - The pit sludge is a flat animated noise.

## 2026-11-03 — storyboard v2 (user: fix all known issues, more detail, a clear landgrave)
- **Fixes:**
  - s01: the void is truly black. The spot cone is gone; a lit disc and 6 candle stands remain.
  - s06: a fat ribbed woodworm with a brown head and mandibles, bore holes with frass rims, sawdust, fungus brackets, rot blotches, splinters and a double crack. The joist now runs along X under the camera, and the beam texture tiles every 1.6 m.
  - Night tint on the people and Henry: a multiply node after every character texture, `night()`.
  - s12: closer framing, and the peasant is in the wide shot.
  - The horse cut is on the board (4c).
  - The hombre heads are 1.2× around the neck.
  - Two Buttons: clean label cards above the buttons.
  - Pit: faceted lumpy 28×28 sludge mesh, 30 muck lumps, and 22 pieces of debris (helmets, hats, boots from a photo, capes, boards, goblets, straw). 16 bubbles.
- **Detail (new Flow photo props):**
  - Lathed: candle, jug.
  - Cut-outs: wall torch, Thuringia and Mainz shields, feast platter, straw bale, crozier, boot.
  - Tapestry: the Flow image itself as a texture.
  - Helpers: `torch()`, `candle()`, `shield()`, `tapestry()`, `straw_bale()`, `straw_floor()`, `feast_table()`, `stand_candles()`.
  - Every set is dressed: map table with candles, jug, quill, seal and ink. Floating crests, crozier and rocks in the red void. Throne room with dais, tapestry, 4 torches, crests, feast table and straw. Hall with 2 feast tables, straw, bales, torches, tapestry, crests and niche candles. Cutaway furniture and banners. Night facade with torches, bales, barrels and a crest. Bathroom with sink, mirror, towel, plunger, duck, mat and cabinet.
- **Readability:**
  - Landgrave Louis III: blue tunic with the Thuringian striped lion (from the Flow shield), red mantle with ermine trim, red cap with a gold circlet. In s10 a muck texture set (`landgrave_muck_*`), he climbs onto a stone ledge with his hands on the stone, and a 3D "LANDGRAVE / LOUIS III" card.
  - Archbishop: mitre, holds the crozier in the hall (it floats beside him in the red void).
  - Barbarossa: seated on the photo throne on a dais, crowned, pointing (board 4a).
  - Henry: tiny crown.
- **Board:** `review/board/board_a.jpg` (1, 2, 3, 4a–c, 5, 6) and `board_b.jpg` (7–13), 15 key frames.
- **Remaining:**
  - In the s03 wide shot the tug-of-war pair is small.
  - Jug loft includes its handle in the silhouette.
  - The bathroom dressing is not in the s13 key frame (close-up).
  - The crowd in the cutaway is static on the folding slabs.

## 2026-11-03 — final render (board approved: "aprobado procede")
- **Open issues fixed:**
  - s03 wide is closer and the two men stand nearer the land.
  - The jug lathe uses a mirrored body photo (`ref/jug_body.jpg`), so the handle no longer bulges it.
  - s13 opens wide on the bathroom props.
  - The cutaway's tiny nobles (`G_FIGS`) tumble and fall with each floor.
  - QA fixes: Henry sits in the niche (facing the room) before he hangs (s11), no fly in s10, more camera motion in s04 (horse) and s12, a stone body behind the facade, and captions lower in the face close-ups (`CAP_Y`).
  - Bug fixed: the G_FIGS reset loop overwrote the shot index in `apply()`.
- **Picture:**
  - `out/render_all.sh` renders every shot in a fresh Blender process (3 workers); s04 and s10–s12 were re-rendered with `out/render_fix.sh`.
  - post.py runs ps1_post on every frame, then the captions.
  - Pop check (`out/qa/popcheck.py`): all 19 flags are planned. 3D letters drop in (f6–8), the s01 punch (f60–61, f73–74), and in-shot cuts at f123, 195, 297, 333, 426, 583, 785, 851, 939, 947 and 1024.
- **Sound ("sonido pro"):**
  - `audio/fetch_fs.py` pulls Freesound CC0/CC BY recordings with a generic User-Agent (manifests/erfurt.json). Trims picked with earshot find. 62 cues come from `out/make_cues.py`.
  - Strong hits: structure collapse (×2), wood crack, ice-drop splash, splash_1.
  - Bert Cole "Waiting". `mix.py --no-master` + `finish_v2.py`, voice +7 dB, master −11 LUFS / −1 dBTP. At master scale: music −22.1 LUFS, SFX −31.2 LUFS (blind: −22.3 / −32.5).
  - The mp4 audio is −0.3 dB for AAC headroom: −11.3 LUFS, −1.3 dBTP.
- **QA:**
  - earshot critique: close. Sync 89 %; the only major item is salient-hit density, driven by the voice, as in #3.
  - revisar_render: CASI (v1 was NO LISTO, then fixed).
- **Output:**
  - `renders/The Toilet That Killed 60 Nobles.mp4` (35.6 s, 1080×1920, 30 fps, CRF 18, AAC 192k).
  - `renders/thumbnail.png` (`thumb.py` + `thumb_post.py`).
  - CREDITS.md.
- **Left as is (minor, revisar_render):**
  - Possible "counts"/"council" ASR mismatch (the TTS take was heard as "counts").
  - Plain hands on the hanging men.
  - The toilet box reads as a box.
  - The pit sludge reads dry.
  - The flat horse-field cloud.
  - The s07 caption is close to the CESSPIT sign.
  - The bathroom wide is near-static.
  - No eggs in the throne room's visible walls or the niche.
  - The loop ending "remember:" was approved in the script.

## 2026-11-04 — storyboard v3 (user rejected the final: "everything looks flat")
New rule: every shot is a concrete place with depth. `v3.py` is exec'd by build.py and redefines the sets, shots and `apply()`.
- **Kit:**
  - 8 Flow photo textures in `ref/tex/*_128.png`: stone, planks, half-timber, slate roof, cobble, grass, cesspit muck, cellar stone.
  - Sun with shadows, plus point lights at the torches and windows.
  - Sky: a gradient sky dome plus chunky faceted low-poly clouds (`cloud()`, `clouds_around()`), with hills, trees and houses. A night dome for s12.
  - `wall_x` / `wall_y` build walls with real window openings; `prism_roof()`; `house()`.
- **Cast:**
  - 8 new Flow faces with expressions: archbishop terrified, landgrave furious, a laughing noble, a gasping squire, a smug count, a screaming knight, a townswoman and an old watchman.
  - 27 clones (`clone_person`) give a 36-person crowd with 9 different faces and outfits.
  - Expressions swap per shot (`head_swap`).
- **Per timestamp:**
  - 0:00: the crammed hall plus a wooden privy booth with a real seat (round hole, hinged lid); "60" drops in, then a punch to the seat.
  - 0:05: council chamber. The two men argue across a table (hands flat on it, a jabbing finger, a fist), then both pull the land deed.
  - 0:10: the throne room is closed, with a front wall, windows to the sky and a ceiling.
  - 0:11: the horse field has sky, clouds, hills, trees, a road and a castle.
  - 0:15: the ground floor under the hall: sagging rotten beams with fungus, rot and bore holes, a woodworm, dust; at "rotten" the beam cracks and a 3D "ROTTEN" pops.
  - 0:17 and 0:23: the whole building cut open in its street (houses, trees, sky). The nobles tumble with each floor into the CESSPIT section. The pit is a stone cellar with broken floors above, nobles chest-deep in wet muck, and debris.
  - 0:27 and 0:28: one take. Henry sits sideways on the niche bench, his fist round a bar (the bar is moved into his hand) and his other hand on the bench.
  - 0:30: a real 3D night street. Both men sit on the sill with hands on the jamb and sill. Citizens with a torch look up. The archbishop is terrified.
  - 0:32: the bathroom: 3D toilet, sink and faucet, cabinet, towel, window; the mirror and picture combo is gone.
- **Leftovers fixed:** captions lower in close-ups; the s07 caption sits clear of the CESSPIT label.
- **Board:** `review/board/board_a.jpg` and `board_b.jpg` (16 key frames).
- **Still open:** Kaneda's gloves stay blocky (it's the model); the ladder shot is wide; the pit is busy.

## 2026-11-04 — v3b (user: "looks better"; clouds must be low-poly meshes)
- **Clouds:** `cloud()` is now a real mesh cumulus. 3–5 faceted 7×4 blobs with jittered verts are merged into one mesh of about 100 faces with a flat base. Each has its own 8×16 pixel-art texture (cream top, white middle, blue-grey belly, dithered band edges, Closest) and the LPS flat light. They sit at varied depths and drift slowly in `apply()`. The gradient dome stays behind them. Comparison: `test/clouds_vs_lps.png`.
- **Kaneda's hands:** the purchased glove blocks are masked (Mask modifier, Hand.L group, before the mirror) and replaced by low-poly hands (palm, 4 two-segment curled fingers, thumb) that ride the Hand bones every frame (`hands_follow`). Check: `test/hands_check.png`.
- **s12 ladder:** close follow on the peasant; the ladder runs out of frame.
- **Pit:** calmer. 12 debris pieces, 7 bubbles, no light shafts.
- **"counts":** small.en hears "Dozens of counts and knights" (base.en heard "council"). The caption is now "dozens of counts and / knights crammed into" (assemble FIX).
- **Board:** `review/board/board_a.jpg` and `board_b.jpg` re-rendered (16 frames).

## 2026-11-04 — v3c (user: the sky is a PHOTO like LPS, nothing else)
- The mesh clouds, stars and moon spheres are removed (`cloud()` is disabled).
- Sky = a Flow photo of a real cumulus sky (`ref/tex/sky_day_px.png`: 384 px, 96 colours, mirror-tiled for 360°) on the dome; vk 1.25 maps the photo over the first ~50° above the horizon. Night: a Flow night-sky photo with moon and stars (`sky_night_px.png`).
- Camera clip_end is 2500 m, so the 900 m dome renders.
- Board re-rendered: `review/board/board_a.jpg`, `board_b.jpg`.
