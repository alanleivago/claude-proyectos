---
type: style
status: active
tags: [gta6, key-art, parallax, flow, 12fps, vertical]
relatedTo: [fuentes/gta6-style/ANALISIS.md, pieces/gta6-look]
---
# gta6 — loading-screen key art in parallax layers

Vice-City-at-sunset key art (hand-painted comic, bold ink, cel shading) cut into Google Flow layers and moved in code with depth parallax, **everything stepped at 12 fps**. Made from `fuentes/gta6-style/` (reel by sanji.chien) + the user's beach-bar still. Look test: `pieces/gta6-look` (v2 art; start new pieces from its `src/main.html` + `tools/key.py`). v1 art (flat comic, rejected as "AI-made, ugly") is kept in `assets_v1/` and `src/main_v1.html`.

## Legal / originality
- No real people (no lookalikes, no names in prompts), no Rockstar/GTA logos, no Pricedown font, no copies of the GTA VI characters. Fictional cities only ("Miami-like beach city"), no "Vice City"/"Leonida" text on screen.
- Our title lettering: heavy condensed caps (Impact family), white→cream fill, thick near-black outline `#140818`, hard plum drop shadow `#2A1036`, tilted -4°, + yellow sticker tag `#FFE14D`.

## Palette (hex)
| Role | Hex |
|---|---|
| Sunset sky top / hot pink | `#EC5F8E` → `#EC797D` |
| Sunset mid / peach | `#F4A27A` |
| Horizon / pale yellow sun | `#FBE7A6` |
| Palm silhouettes, lilac | `#6E5A9E` (inner `#8C7BC0`) |
| Shadows, lavender-purple | `#6C4969`, deep `#422734` |
| Day sky turquoise | `#8CAABA` / `#5FB8C4` |
| Buildings lavender / mint | `#A78C9C`, `#BFE3D6` |
| Neon pink / cyan | `#FF5FA2`, `#5FE6FF` |
| Teal shirt (hero) | `#4FA39A` |
| Ink | `#211E26` |
| Skin warm rim | `#F08A4B` |

## Rendering traits (from the official refs in `fuentes/gta6-style/refs/`)
- Semi-realistic proportions and faces: real anatomy, asymmetric features, wrinkles, pores, stubble, hairy forearms, tattoos; realistic hands.
- Thin dark contour, heavier on the silhouette, light on interior forms; faces modelled with fine painted lines, not comic hatching.
- Posterized hard-edged light shapes: sunlit skin/cloth bleached to pale cream-yellow; shadows saturated pink-magenta-violet; thin cyan bounce on the shadow edge.
- Character more saturated and contrasted than the background; the background is a pastel haze (lavender, mint, peach, cyan) with airbrushed gradients and less detail.
- Composition: cropped at chest/waist (or knees for full-body poses), low camera, slight wide angle, props in the foreground (table, bottles, map, car hood), character leaning towards the lens.
- Expressions: cool, bored, unimpressed, mid-sentence; never a posed smile.
- The reel adds a halftone + grain print layer; the official art is clean, so keep halftone subtle (soft-light 25 %).

## Flow recipe — the winner (v2, 2026-11-13)
Tested: (A) Nano Banana Pro + refs, isolated on magenta → flat comic look; (B) NB Pro text-only → better colour, still comic; (C) NB Pro refs + text → comic; (D) **Nano Banana 2 + refs + text → best composition, props and faces**; (E) D + a relight edit → closest to the official art. Pro ignores the refs' rendering; NB2 follows them.
1. New Flow project; upload 3–4 official artworks as `gtaref1..4` (character art: Brian Heder, Cal Hampton, Jason & Lucia motel, Real Dimez; for backgrounds the Vice City BG).
2. **Full scene with the character in it, Nano Banana 2** (never ask for an isolated character first: magenta isolation turns everything into sticker-comic):
```
Painting technique reference (technique only, never copy people, faces, poses, props, labels or places):
@{gtaref1} @{gtaref2} @{gtaref4}. Make a new Grand Theft Auto VI style loading-screen artwork: polished
semi-realistic digital painting, not a cartoon or comic. No logos, no readable text.
Subject (new original <man|woman>): <age, ethnicity, build, ASYMMETRIC face details: crooked nose, scar,
heavy eyelids, stubble, wrinkles>, <outfit>. Pose: <body turned 30°, leaning on X, holding Y with natural
relaxed fingers, head to viewer, bored unimpressed look>. Framing: cropped at <mid-chest to waist>, camera
slightly below eye level. Foreground: <prop>. Background, softer and pastel: <place details>.
Lighting: hard low sunset sun from the left, lit skin and cloth bleached to pale cream-yellow with sharp
light-shape edges, shadows saturated pink-magenta-violet, thin cyan rim light, smooth airbrushed gradients,
dark contour on silhouettes, fine painted wrinkles, pores and stubble.
```
3. **Relight edit** (upload the result under your own name, e.g. `barman`; Flow's auto names get truncated):
`Edit @{barman}: keep the man, face, pose, hands, clothes and composition exactly the same. Only repaint the light and colour to match @{gtaref2}: hard low sunset sun from the left; lit skin and cloth bleached to pale cream-yellow with sharp-edged light shapes; every shadow saturated pink-magenta and violet; thin cyan rim; more contrast on the man; background pushed into a soft pastel lavender, mint and peach haze; smoother painterly shading, fewer interior ink lines, crisp dark contour on the outer silhouette.`
4. **Split into layers by editing the same image** (alignment is pixel-exact):
   - Character layer: `Edit @{x}: keep the <man + the counter corner> exactly as they are (same pixels, position, size). Replace everything else with a perfectly flat solid pure magenta #FF00FF. No shadow, no gradient, no glow.`
   - Clean plate: `Edit @{x}: remove the man completely and paint in what was behind him … same camera, composition, lighting and style. No people.`
5. Backgrounds without people: NB2 + `@{gtaref5}` (Vice City BG) + `@{gtaref3}`, "painting technique only, do not copy the buildings, signs, layout or text", "leave the lower-middle open for a character".
6. Second character on an existing plate: `Edit @{street}: keep the street … exactly the same, and add in the foreground <new character + car> painted in the technique of @{gtaref4} and @{gtaref3}` → then the magenta edit for the layer. The plate itself stays the background, so the layer lands at offset 0.
- Never: real names or lookalikes, Jason/Lucia faces, Rockstar logos, labels copied from the refs (NB2 copied "AZAS" beer once: check props), car badges (ask to remove the emblem).
- Self-check every character before using it: 5 fingers and real knuckles, asymmetric face, no plastic skin, line weight close to the refs, cream highlights + pink shadows present.
- `python tools/key.py in.jpg out.png magenta|green` → full-frame RGBA; check on a cyan sheet.

## v3 — photo base + code (`styles/gta6/tools/rockstarize.py`, 2026-11-13)
Human method (21DPS time-lapse, notes in `fuentes/gta6-style/vice-city-vacation-gta-vi-art-style-study.md`, target frame `fuentes/gta6-style/tutorial/final.png`): line sketch → flat colour per material → hard pink/violet shadow shapes → soft modelling on arms → flat lavender silhouettes for the background → props → **global warm yellow-pink grade** → shirt print and arm hair last.
Measured tutorial palette: skin lit `#C07A77`/salmon, skin shadow `#7F404E`→magenta, shirt `#386076` / `#1F3D51`, tee `#C7D3CD` / `#78818E`, sky `#E7E29F` / `#F4F1CB`, pennants `#C08CB7`, table `#614F7A`, rim glow `#F3F3C4`.

Pipeline:
1. Flow **Nano Banana Pro photoreal photo** of the full scene (real face and hands; ask for a hard low sun from camera-left in front, a crisp shadow line down the face; avoid backlight: a backlit face posterizes into mud).
2. NB2 edits of that photo: (a) person (+ the props they touch) on flat magenta, (b) clean plate without the person.
3. Figure: `python rockstarize.py layer.jpg out.png --mode figure --key magenta`. It keys, smooths with bilateral passes (keeps the face), cuts 3 light bands from a heavily simplified luminance with smooth vector-like borders, flattens the shading inside each band while keeping material contrast and fine detail, lifts and tints the shadows magenta-violet, turns orange skin salmon, adds cream lights, a 26 % sunset gradient map, thin Canny ink (long edges only), a 4 px silhouette line, a pale-yellow rim glow on the sun side and an inner warm edge.
4. Backgrounds: **code `--mode bg` looked like camouflage; use an NB2 repaint edit of the clean photo plate instead**: `Edit @{plate}: keep the exact composition … repaint the whole photo as a flat background of a GTA VI loading-screen illustration, exactly like the background of @{tutref} …`. It keeps the geometry, so the figure's counter/car still line up.
- Verdict so far: the code figures lose the AI look and keep real anatomy, but still read as a **filtered photo**: shadow shapes follow photo lighting rather than drawn form, clothes keep photo texture. A Flow repaint of the same photo with `@{tutref}` (hybrid) is cleaner but drifts back to generic comic and changes the face. Next tuning ideas: segment skin/cloth and posterize each with its own thresholds, replace clothing texture with a flat tone + redrawn print, take the shadow shapes from a depth/normal estimate instead of the photo luminance.

## Saturation default (user, 2026-11-13)
More saturation than the official art on everything: characters ×1.25 Lab chroma (`finish_character.py` `finish.saturation`, default 1.25), plates/backgrounds ×1.25 (`cut_layer.py --plate --sat 1.25`), layers cut from artworks ×1.25 (`cut_layer.py`).

## 16:9 tests with the official cast (private, not for publishing)
- `pieces/gta6-parallax-16x9`: loading-screen parallax, 20.5 s, redrawn new-pose characters (Jason aiming, Lucia looking back, Cal with binoculars, DreQuan with cash) over Flow clean plates of the official BGs; never put a waist-up character over a plate with a big near prop (lifeguard tower, giant sunglasses): scale breaks. (First version used cut-outs: `src/main_cutouts.html`.) Plates ("Edit @{art}: remove the man completely and paint in what was behind him … keep everything else exactly the same") or the official empty BGs. Bg swap for standing characters, push transition (new plate slides in from the left, the character follows ~6 frames later with out-back) for seated ones/props. 16:9 push-in only +5.5 % (+2 % creep): the official crops are tight.
- `pieces/gta6-boxart-16x9`: box-art comic grid, 20 s: 8 redrawn panels + title panel, thick ink border, slam/slide entries with a white impact flash and a 2-frame page shake, plate + character parallax inside each panel (`make_panels.py` crops with a 10 % margin; no Flow plate → inpainted plate, only edges show).
- Per-character proof: `pieces/gta6-16x9/compare/<pose>.jpg` = official art | new pose + SFace score (`compare_poses.py`). The Flow turnaround sheets (`sheets/`) were rejected (AI look, faces drift): don't use them.

## Official cast in new poses + identity check (2026-11-13, private tests)
Cut-outs of the official art don't count: every shot is a redrawn new pose. Per character (configs `styles/gta6/characters/poses/*.json`, all inherit `pose_base.json` with an auto palette from the photo's own colours):
1. Identity anchor = a crop of the official 4K artwork around the face (`pieces/gta6-16x9/id/<name>.jpg`), attached at EVERY Flow step.
2. Photo base (NB Pro, 16:9): "Photorealistic cinematic photograph … The exact man in @{id<name>} as a real person: same face, hair, tattoos, outfit. New pose: … one hard low sun from camera-left …". Describe the face in words too (round fleshy face, droopy moustache…), but never exaggerate the build (Cal came out heavier).
3. `make_character.py` block-in → 4. NB2 render pass, short prompt: "Edit @{bk<name>}: keep composition, pose, silhouette, hands, flat lavender background and the light/shadow shapes. Repaint it as an official loading-screen illustration of exactly the man in this reference @{id<name>}: same face (…), same outfit (…), exactly the same painting technique as the reference: smooth airbrushed shading, large clean light and shadow shapes, very few thin lines, no hatching, no sketchy strokes, dark contour only on the outer silhouette, realistic hands. No text, no logos." (long prompts with 3 refs make the Flow MCP time out: keep 2 refs, short text; start a new Flow project when uploads stop resolving).
5. `finish_character.py` (key, relight, saturation ×1.25).
- **Identity gate** `python styles/gta6/tools/face_id.py <img> --char <name> [--cx 0.4]` (YuNet + SFace ONNX, anchors in `characters/official_ids.json`): PASS = cosine ≥ 0.45 AND the character ranks 1st among all 9 official faces. Calibration on the official art: same person 0.51–0.62, different people 0.08–0.48. Photos usually land 0.36–0.48; the render pass with the official art attached raises them to 0.51–0.60. Reject and retry below the gate.
- When the photo route drifts (Cal: 0.37), a **direct pose edit of the official artwork** ("Edit @{idcal}: keep this exact man … change only the pose …") scored 0.53 and looks closest; use it as the fallback (no block-in → finish runs without the alpha prior).
- Necklaces/props: say "plain gold chains, no letters" (Flow invents names).

## Identity anchors, build and clean cutouts (rules from 2026-11-13, apply always)
- **Multi-reference anchor**: collect all official art + screenshots of a character (`fuentes/gta6-style/refs_lucia/` = 4 artworks + 13 screenshots from rockstargames.com/VI/media, git-ignored). `official_ids.json` holds painted anchors (`lucia`) and screenshot anchors (`lucia_shots`); `_gates` sets per-character thresholds (Lucia: painted ≥ 0.48 AND screenshots ≥ 0.38, rank 1). Per Flow generation attach the 2 best refs: photo step = 2 screenshots (best face likeness), render pass = 1 screenshot for identity + 1 painted artwork for technique (that mix scored 0.55 / 0.49; two painted refs gave 0.50 / 0.30).
- **Build**: describe the body exactly as the official art shows it (Cal: big round beer belly, broad soft chest, thick arms, "do not slim him"); never write a build word you have not checked. Check with `pieces/gta6-16x9/build_ratio.py` (chest width / face width: official Cal 4.55, accepted 4.40, the slim one 3.08).
- **Cutout QA** (`styles/gta6/tools/qa_cutout.py`, runs automatically at the end of `finish_character.py`, writes `<out>_final_qa.jpg`): detects flat leftover key colour (also enclosed pockets and pixels that were key in `<name>_painted.jpg`), graded-lavender leftovers touching transparency, bright magenta fringes, holes, specks; `--fix` makes residual transparent, despills edge chroma toward the inner colour, cleans the pale glow on the shadow side (`--fringe-side`), removes specks, chokes 1 px. PASS = residual < 0.05 % and fringe < 3 % of the edge. Layers that wear lilac (white car + lilac jacket) need `--no-band` / `finish.qa_no_band`. Before using any layer in a piece: `python qa_cutout.py assets/*.png --fix --sheet qa.jpg` and look at the sheet (black / white / green / marks).
- Leave head-room: if the head touches the frame top in the Flow image, scale the layer ~0.85 about the bottom before using it (Cal).

## v4: making a character (current recipe, 2026-11-13)
Method from three tutorials (`fuentes/gta6-style/proceso-rockstar-3-tutoriales.md`): the Rockstar portraits are **paint-overs of a reference photo**: clean line art, flat colour per material, **dual split lighting** (warm key on one side, cool/pink light on the other, core shadow between), two tones first and then soft value transitions inside each, AO under nose/eyes/lip, a thick silhouette line, warm grade and noise. Tools in `styles/gta6/tools/`, one JSON per character in `styles/gta6/characters/` (`barman.json`, `woman_car.json` are the worked examples). Look test: `pieces/gta6-look` (v4 assets in `assets/`, v3 kept in `assets_v3/` + `src/main_v3.html`).

1. **Reference photo** (Flow, `srz-google-flow-mcp`, Nano Banana Pro, 9:16, one image): the full scene with the person, photoreal, ONE hard low sun from the side, crisp shadow line on the face, no backlight. Write the face as a character, not a model: asymmetric brows, crooked nose, scar, mole, wrinkles, freckles; "five clearly separated relaxed fingers". Prompts: see `flow4/` file names, or copy the barman/woman prompts from this repo's history.
2. **Config** (copy `barman.json`): `photo`, `out`, `sun` (left/right = which side the photo is lit from), `upper` (one garment, or two that k-means splits), `add` = props/extra garments: `poly` (photo pixels, like the Pluma tool: glass, keys, car) with `keep` (fingers on top) or `under` (only free pixels), `box` + GrabCut, `within` (relabel part of a material, e.g. the tee inside "upper"). Per material: `colors` {shadow, key, hi, rim, deep}, `key` (lit share), `hi_frac`, `rim` (share for the second light), `deep_frac` + `ao_only`, `photo_w` (photo light vs designed normals), `shape_smooth`/`angular`/`min_area` (shape design), `model` (soft modelling inside zones), `print` (vector palm fronds), `mode` (`glass`, `posterize`). `flow` {subject, face, extra} feeds the render-pass prompt. `finish` {shadow, light, split_bias, rim, grade, noise}.
3. **Block-in**: `.venv/bin/python styles/gta6/tools/make_character.py styles/gta6/characters/<name>.json [--debug]` → `<out>.png` (code-only RGBA layer), `<out>_flat.jpg` (block-in on the flat key `#D8B4E0`), `<out>_flow_prompt.txt`, `--debug` adds the material map. First run downloads the 3 ONNX models (~550 MB, `models/`, git-ignored). ~20 s.
4. **Render pass** (Flow NB2, one image): upload `<out>_flat.jpg` as `blockin`, the photo as `photo`, an official artwork as `gtaref` (character art: Brian Heder); paste `<out>_flow_prompt.txt`, aspect 9:16, model 2. Check: same face as the photo, five fingers, props intact (a bad prop in the block-in comes back mangled: fix its `poly` first).
5. **Finish**: `.venv/bin/python styles/gta6/tools/finish_character.py styles/gta6/characters/<name>.json <painted.jpg>` → `<out>_final.png` 1072×1920 RGBA (alpha = flood-fill of the key from the border, protected by the block-in alpha; multiply magenta shadows + screen cream lights to push the split light back; silhouette heavier on the shadow side; rim; gradient map; noise). Drop it into the piece's `assets/` as a full-frame layer at offset 0.
6. **Background** (Flow NB2, no people): upload `tutorial/final.png` as `tutref` + the Vice City BG as `bgref`, "background technique only, never copy buildings/signs/text", leave the lower middle open, sun on the same side as the character.
- Time per new character: ~15–20 min (photo 1 min, config + prop polygons 10 min, block-in 20 s, Flow pass 1 min, finish 5 s, review).
- Code-only (`<out>.png`) works as a fallback without Flow for the character, but it reads as a vector trace / posterized photo; the Flow pass on top of the block-in is what makes it look painted. Flow straight on the photo (same prompt, no block-in) goes back to generic comic: always paint over the block-in.
- Known limits: the Flow pass softens the hard sun (finish pushes it back only partly); small faces (full-body shots) lose detail in the block-in, but the Flow pass restores them from `@{photo}`.

## Motion rules
- **12 fps stepped**: render at 24 fps but quantise time `T = floor(t*12)/12` for **everything, camera included** (measured on the ref: odd frames identical). Only a meta move (shrink to split screen, UI overlay) may run on 1s.
- **Depths** (zoom exponent `cam.z^(0.35 + 1.3·d)`, pan × `0.3 + d`): plate 0.1–0.15 · hero cut from the same image 0.3 (keep it at offset 0 and scale 1 so its counter/props line up with the plate) · top fronds 1.0. A layer cut from its plate (woman+car) gets the same depth and the same push as the plate.
- **Shot open:** ease-out push-in ≈ +10 % in 0.8–1.1 s while the foreground flies in (fronds drop −420 px from above, cash rises +520 px from below, hero rises 160 px), then a slow creep (+3 % over the shot) and small idle bob/sway (5–8 px sine) on characters and overlays.
- **Background swap (ref 4.0–4.8 s):** foreground overlays leave first (in-cubic, up / down), old plate exits up (0.5 s), new plate rises from below (out-cubic, 0.6 s, starts 0.25 s after), character stays with a tiny −18 px lift.
- **Character swap (ref 6.0–6.8 s):** new element enters from the left with out-back overshoot (0.5 s) and shoves the old one off to the right (in-cubic); the second new element follows 4–8 frames later.
- Shot length 2–3.5 s; a new push-in after every swap.
- Text: our title pops in with out-back (0.3 s) and leaves before the swap; subtitles small, white, bottom-centre, one or two words.

## Sound (not in the look test yet)
- Ref: voice-over + ad-style music, whooshes on swaps, -14 LUFS. For us: "sonido pro" (Freesound/Commons → real-sfx → earshot) with whooshes on each swap, a cash flutter on the bills, a soft riser into the title; music = 80s synth/trap-ish groove, no copyrighted GTA tracks.
