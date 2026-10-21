# tapestry

An embroidered linen tapestry in the Bayeux manner, like the Game of Thrones / House of the Dragon tapestries (refs: `Ref amphora mitologia/house of the dragon*`). **The style for every House of the Dragon and Game of Thrones video** (user, 2026-10-20). Start new pieces by copying `pieces/rhaenyra`.
Proven on: `pieces/rhaenyra` (60.5s, 12 panels, approved 2026-10-20).

## The look
- **Linen:** `#d7cab6`, a tabby weave with visible threads, slubs and soft folds (`tpLinen`, tiled; it scrolls with the strip).
- **Embroidery:** every shape is laid work (`tpFill`): parallel threads in three shades, a sheen, couching ties, and a dark stem-stitch outline (`#291817`). Lines are stem stitch (`tpStem`).
- **Borders:** top band y 58–268 and bottom band y 1652–1862 (the user asked for them close to the edges, but not touching). Each has two stitched rules, diagonal striped bars, and an emblem per compartment (`tpBand`).
- **Lettering:** stitched capitals in Herculanum. Words alternate red and navy, and keywords take their side's colour (`tpCaption`, `tpText`). Captions sit at the top of each panel and slide with the cloth.
- **Figures** (`tpFigure`): a long gown, a surcoat with dotted borders, a belt with a buckle, a cloak with a clasp, sleeves with cuffs, hands with fingers. The 3/4 face has eye whites, irises, lids, heavy brows, a nose, rosy cheeks and stitched hair.
  - **Red lips only on women; men take `male: true`** (the user's rule).
- **Props:** a dragon along an S spine (`tpDragon`: scales, belly plates, spines, finger-boned wings, horns, a jaw, rider, fire). The Iron Throne is a chair of swords (`tpThrone`/`tpSword`). Also castles, banners, clouds as scallops, rain, lightning, waves, flames, and Bayeux trees as panel dividers.
- **Wiggle:** the same turbulence displacement as amphora, every 3 frames.

## Motion and structure
- One long strip: panel i sits at world x = i·W, and **each scene change is a 0.8s slide to the right**, never a cut (`stripPos`).
- Panels are drawn in local units and scaled by `PZ` 1.12 into the band, with feet at y 1600.
- Figures sway and nod, dragons flap and undulate, and the words stitch in as they are spoken.

## Sound
- An English take cut at word gaps.
- Music is the theme the user supplies per piece (Rhaenyra: "House Of The Dragon - Rhaenyra Targaryen Theme.mp3" always from 0:30), loudnorm'd to −14, with music gain +10 and voice.music −1 (the user wants the bgm with strong presence), and a 0.5s dip before the payoff.
- SFX in code: cloth slides, bells, roars, wings, thunder, fire.

## Checklist
1. The borders are intact, and the caption is inside the band.
2. Every figure has face detail and clothing layers, and men have no red lips.
3. Dragons read as dragons (neck, wings with fingers, tail), and the throne reads as swords.
4. Transitions are slides to the right only.

## Approved details (keep)
- Captions at y 470 (top of the band, close to the drawings).
- The end card: the apple at y 720, AMPHORUS just below at y 1040, 80px gold capitals with a shine (`tpLogo`), no stitch dots.
- Pose changes (kneel → stand) are blended over ~0.9s, never jumped.
- Hair: wavy stitched locks in four shades (`lock` in `tpFigure`).

## The Flow method (approved for every HotD / GoT video, 2026-10-21)
Proven on `pieces/rhaenyra-flow` — start new pieces from it (src/scenes.js has `fig`, `prop`, `dragon`, `pose`, `stripPos`, captions).
1. **Refs into Flow** (Flow MCP, one image per call): the tapestry as a ~1400px JPG (`tapiz`; a 7 MB PNG times out every generation), plus crops `refpeople`, `refdragon`, `refborder`. Write "Make a NEW … not a copy" or Flow copies the reference.
2. **Background:** the v1 linen (`pieces/rhaenyra-flow/gen/bg2.jpg`) with the v2 sewn border band pasted top and bottom (`assets/bg.jpg`). Reuse it. Figures never touch the border lines (clip y 182–1738).
3. **Layers:** each subject alone on flat magenta (#FF00FF), keyed with `~/VoxDoc/venv/bin/python3 ~/.claude/skills/vox-doc/scripts/key.py gen cut`, cropped, saved as webp (~5–7 MB in all). Figures: naive Bayeux (profile faces, coarse laid work). Dragons: chain-stitch outlines, V-scale stitches, finger-boned wings. Check every layer on a contact sheet: Flow sometimes returns a stale image (a ~3s generation) or ignores the magenta.
4. **Motion = poses:** for a limb or head move, edit the figure's own image ("Edit @{x} with the smallest possible change… only the right arm…"), then run `styles/tapestry/tools/posepair.py` to align the pair and split it into `_c` (common) and `_d` (changed). `pose(a, b, t, …)` keeps the body and fades only the changed part (0.12s) on the word.
5. **Moving elements** (a crown, fire breath, a sword) are separate Flow layers that move in code. Use the same sprite all the way, never a different one that swaps at the end. Fire comes as its own layer with natural tips; it never touches an image edge or a panel edge.
6. **Nothing appears abruptly:** things walk in from the sides (bob + rock), fall in from above, grow, or ride in with the strip slide. Figures stay opaque.
7. Dragons flap by stretching the top half of the layer. Everything else follows the code-drawn tapestry rules above (slides right, captions, end card with the apple centred, the Rhaenyra theme from 0:30, gain +10 / voice −1).

## The user's rules (checklist)
See the memory note `feedback-tapestry-rules`; in short: v1 linen + v2 borders, figures off the borders, opaque, large, no red lips on men, never an empty scene, stitched hair; captions lowered toward the figures where there is room; slides right only; seamless pose swaps; moving props are one Flow sprite throughout; nothing pops in (walk in from the sides, fall from above, grow); fire without square edges; apple + AMPHORUS centred; theme from 0:30, bgm +10 / voice −1; look and storyboard approved before every export.
