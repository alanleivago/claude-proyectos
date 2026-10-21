# amphora-bf (orange: black-figure)

The orange style for the amphora niche, alongside the beige `amphora`: black-figure vase painting, animated.
**The default since 2026-10-20 is v2, proven on `pieces/troya-bf`** (remake of `Ref amphora mitologia/5.mp4`, approved by the user: "excelente, ahora sí"). v1, code-drawn puppets, is `pieces/alcibiades-bf` and still builds.

## Start a new piece from troya-bf
Copy `pieces/troya-bf/` → `pieces/<name>/`: `piece.json`, `src/` (head.html, scenes.js, score.js, bridges.js), `audio/track.wav` (Odysseus bgm, normalised). Put `fondo.jpg`, `ribbon.png` and `apple.png` from `styles/amphora-bf/assets/` into the piece's `assets/`. Then replace the layers, the scenes, the script and the score.

## The look
- **Ground and frame:** the user's `fondo.jpeg` as `assets/fondo.jpg` (1080x1920): orange `#e57d36` with terracotta spots, friezes of black teeth and a key. The picture lives in y 234–1599, and feet stand on y 1588 (`BF_TOP`, `BF_BOT`, `BF_FLOOR`). The friezes stay fixed over everything (`bfFrame`), and the spots are laid back over the figures at 0.3 soft-light (`bfWear`).
- **Figures and sets are painted layers, not code.** Generate them with Nano Banana 2 through the Google Flow MCP (never flow-auto), **one image per call**. Upload `Ref amphora mitologia/Odysseus.jpeg` as `odysseus` and start every prompt with:
  > Black-figure Greek vase painting in exactly the same style as @{odysseus}: <subject, strict side profile facing right/left, the pose>. Near-black silhouette with fine incised orange lines for <details>. Full figure, centred with margin. Background: a solid flat pure magenta colour (#FF00FF) everywhere around it, no orange ground, no splatter, no border, no frieze, no text, no shadow.

  Choose the aspect by subject: 9:16 for a person, 1:1 for a horse, a ship, a temple or a bird, 16:9 for a city, flames, clouds or a lying figure. Key the magenta with `~/.claude/skills/vox-doc/scripts/key.py gen cut` (the orange lines survive), crop to the content, and keep them in `assets/`. troya-bf has 19 of them (Odysseus standing, thinking, bust, guilty; Penelope; soldiers marching and attacking; Trojan elders; Zeus; priestess; sleeper; horse; ship; Troy; temple; gate; flames; cloud; eagle), ready to reuse.
- **Draw a layer** with `bfLay(name, x, footY, h, { flip, sx, sy, rot, a, ring, clipTop, ax, ay })`. `ring: true` is the 4px orange separation ring: use it on anything that overlaps another black shape. Mirror a layer with `flip` instead of generating a second facing.
- **Code-drawn extras** in the same paint: the sun and moon, stars, wave bands, flames (`bfFlames` plus the painted flame row), cloud smoke, a ladder, a rope, Zeus's bolt, embers. They are in `pieces/troya-bf/src/scenes.js`; copy what you need.

## Type
- **Captions:** white Ludovico W03 Woodcut, 100px (shrunk to fit 780px), 5px letter spacing, a dark drop shadow, baseline y 1180. Each word is **written by hand** on its spoken word (`bfPen`: a slanted pen edge reveals it left to right). Chunks hold up to 4 words and break after punctuation. A chunk leaves before the next one starts, and the last chunk of a scene fades before the slide (`bfCaptions`).
  - In canvas, use the PostScript name `"LudovicoW03-Woodcut"`. The family name silently falls back to a generic serif.
- **Title ribbon:** `bfRibbon(text, t0, tEnd)` uses `assets/ribbon.png` (`Ref amphora mitologia/ribbon.jpeg`, green-keyed). It drops in and unrolls from the centre, with two rolls travelling out to the ends. Then the title is written by hand inside the band, clipped to it so it never leaves the ribbon, and a glint passes over it. troya-bf's title is "The Odyssey".
- **Sign-off:** `bfSignoff(t0)`. The apple lands (centre y 880), and AMPHORUS sits in gold Roman capitals at y 1250 with a glint.

## Motion
- **No cuts.** `bfStripStage(SCENES)` lays the scenes side by side on one frieze, and the camera slides right at every boundary (0.9s ease, `BF_SLIDE`). This is the same grammar as `rhaenyra` / tapestry.
- Inside a scene, `bfCam({cx, cy, z})` (with `panCam`) pans and pushes with a constant float.
- Add parallax: far sets move at 0.3–0.35 of the camera.
- Walks are a bob plus a rock (`walkBob`, `walkRock`). Turns are a squash through the profile (`turnSx`).
- Push past the reference: a horse built plank by plank (`clipTop`), men climbing a ladder, a hatch, gates hinged on the frame edges, a drag with a rope, flames, smoke and embers, an eagle crossing, Zeus's bolt with a flash, a ship rocking between wave bands.
- The wiggle runs on 3s (`bfWiggle` in `STYLE.post`).

## Voice, music, sound
- The voice is the clock. Give the user a plain English script. They generate one take into `Ref amphora mitologia/Voces/`.
- Cut the take with `references/voltamps/tools/cut.py` (use the system `python3`; the VoxDoc venv's PyAV fails). Never cut a zero-gap join: merge those lines and start the scene on a word with `VW(id, word)`.
- Set per-line pauses in `voice/script.json`, with about 1s before the payoff, then run `tools/voice.mjs`. The head builds TB from `VL`/`VW` and CAPS from the words.
- Music is `Odysseus bgm` (`audio/track.wav`) with gain **+10** (the SFX are about 3 dB lower than in v1) and voice.music −4. The SFX are code (`src/score.js`). The mix lands at −14 LUFS.
- Export and review with `PATH=/opt/homebrew/opt/ffmpeg-full/bin:$PATH` (the default ffmpeg has no drawtext or subtitles). Use `export.mjs --no-captions --share`.

## Frame checklist (on top of grammar/FRAME.md)
1. The friezes are intact; the picture stays between y 234 and 1599, and the feet are on the floor line.
2. Every figure is in strict profile, and overlapping black shapes are separated by the orange ring.
3. No layer shows magenta fringes; the incised orange lines are intact.
4. The caption is Ludovico, white, written by hand, inside x 150–930, and never two chunks at once.
5. Each slide moves right, and no caption is left half off-screen.
6. The ribbon title stays inside its band.

## Not matched yet
The layers are stills: limbs don't articulate (motion is the whole figure: bob, rock, squash, slide). A walk cycle would need 2–3 pose layers per figure.
