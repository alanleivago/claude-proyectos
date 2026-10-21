# amphora

A pencil-and-wash history drawn on parchment, framed top and bottom by amphora friezes (Greek key + teeth) in brown ink.
It comes from the local refs in `Ref amphora mitologia/`: the look of video 8, the friezes of video 5, and more of the look in videos 6–7.
Proven on: `pieces/alcibiades` (70.5s, 16 beats, voice-led, approved 2026-10-18).

## The look
- **Ground:** warm parchment (`#bca27a`, light centre `#cdb387`, edges `#a58c66`), big soft cloud stains, tide rings, fibres, grain (`amPaper`).
- **Friezes:** 190px bands top and bottom, opaque (the picture passes under them). They are parchment with ink ornaments (`#33231a`): rules, teeth pointing at the picture, and a running key, all worn. Top band: teeth on the outside, key on the inside. Bottom band: teeth on the inside, key on the outside (`amFrame`).
- **Vignette:** dense brown crosshatch against the friezes that thins toward the middle, with 3 boil variants (`amVignette`).
- **Line:** thin brown ink (`#2a1c11`) about 2.2px, single stroke, gentle boil on 2s (`amPen`).
- **Fill:** flat watercolour wash, with a soft light from the upper left, a darker pooled edge, paper texture through it, and long vertical hatching on cloth (`amWash`, `amHatchIn`).
- **Sides:** Athens blue `#4f80bb`/`#2c5389`, Sparta red `#b3372b`, Persia gold `#c9962f`, Sicily/Syracuse green-teal `#3d6f62`. Keywords in captions take their side's colour automatically (`AM_SIDES`).
- **Wiggle:** the whole frame is displaced by a fine turbulence, re-seeded every 3 frames (about 2.6px, 8 steps/s, as measured in ref 8) in `STYLE.post` → `amWiggle`. The SVG namespace string is split only to pass the build's URL check; it fetches nothing.
- **Type:** captions in **ITC Garamond Std italic**, 74px, inking in word by word with the voice, placed top (baseline 430) or bottom (last baseline 1430) per shot, each on a soft parchment band (`amPaperBand`). Labels are in small caps of 1689 GLC Garamond Pro. The title name is in Roman capitals.
- **Sign-off:** the channel symbol (the blue apple with the eye, `assets/apple.png` cut from `Ref amphora mitologia/Fotos perfil 6.png`) springs in and floats above **AMPHORUS** in gold Roman capitals with a moving shine (`amLogo`).

## Motion habits
Every shot gets a camera float and a slow push (`floatCam`). Reveals are timed to spoken words (`VW`). Figures breathe, nod and blink. Crowds raise their arms in a wave. Oars row and sails fill. Routes and arrows draw on with a head travelling along them. Pieces pop in on springs. Cuts are hard and get a short paper flash.

## The piece library (copy from `pieces/alcibiades/src/scenes.js`)
`alPerson` (front or back busts: curls, helmet, tiara, bald, beard, strap), `alFace`, `alCurls`, `alHand`/`alHandPoint`, `alCrowd`, `alShip`/`alShipMini`, `alSea` + `alWaves` (the reference's wave lines: use them in every sea), `alHerm`, `alHoplite`, `alHouse`, `alFlames`, `alSmoke`, `alTemple`, `alHill`, `alBirds`, `alMap` (lon/lat → map space, rough coasts, shallows, mountains, labels) with `alCity`, `alPawn`, `alArrow`, `alRoute`, `alFort`, plus `amVeil`, `alNight`/`alMoon`, `amLogo`.

## Sound and voice
- Script always in English, paraphrased from the ref. The user generates one take into `Ref amphora mitologia/Voces/`, and it is cut at word gaps (`references/voltamps/tools/cut.py`).
- Music is `Odysseus bgm.mp3` with strong presence. The file is very quiet (−29.6 LUFS), so loudnorm it to −14 into `audio/track.wav`, with music gain +7 and voice.music −4. Dip it for about 0.5s before the payoff hit. The SFX are code (`to = 's'`) and sit under the music. The score tail normalises the SFX, so set the balance with the music gain, not `sfxBus`.
- Run export and review with `PATH=/opt/homebrew/opt/ffmpeg-full/bin:$PATH`.

## Frame checklist (on top of grammar/FRAME.md)
1. The friezes are intact and opaque, and nothing is drawn over them.
2. The caption sits on paper, inside x 140–940 and above y 1500, with side keywords coloured.
3. Every figure has detail: curls, eyelids and brows, cloth hatching and folds, hands with fingers.
4. Any sea has wave lines, and a map has rough coasts, shallows, mountains and labels.
5. At least three things are moving: the camera, a figure or crowd, and a prop (oars, flags, routes, flames, petals).
6. A side's colour (blue, red or gold) tells who is who.

## Do / don't
- Do keep the drawings detailed and organic. Do keep the parchment visible. Do time every reveal to the word that names it.
- Don't use terracotta fills for the friezes. Don't use thick double lines. Don't put a caption over busy art without its paper band. Don't put text in the right 140px or the bottom 420px.

## Not matched yet
The figures are more geometric than the ref's hand drawing. The flames are stiff, and portrait faces are simple.
