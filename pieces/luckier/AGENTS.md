---
type: spec
status: active
tags: [luckier, agents, contract, three.js, pov3d-hd]
relatedTo: [luckier, pov3d-hd, wave-grew]
---

# luckier — the set contract (for the agents building the sets)

**The piece.** *What If You Kept Getting Luckier and Couldn't Stop?* 16:9 1920×1080, 30 fps, 8:30, EN, no voice. Third person: one young man ("you", green hoodie, jeans, white sneakers) whose luck keeps escalating; every win has someone on the other side who loses (a red counter). Style `pov3d-hd`, character variant: soft, warm, polished stylized 3D (think a high-end indie animated short), clearly above the competitor (All Answers: blocky people, flat rooms — see `references/couldnt-stop/allanswers/sheet-*.png`).

## Files — who owns what
| file | owner |
|---|---|
| `src/head.html`, `src/core3d.js`, `src/scenes.js` | lead — read only |
| `src/char.js` (the character: `chBuild()`, `chPose({...})`, `CH_POSES`, `CH_EXPR`, `CH.arms.R.grip`) | character agent — read only for set agents |
| `src/set-street.js` → `function setStreet(g, t)` | agent STREET (prefix `st`) |
| `src/set-casino.js` → `function setCasino(g, t)` | agent CASINO (prefix `ca`) |
| `src/set-island.js` → `function setIsland(g, t)` | agent ISLAND (prefix `is`) |

Every top-level name in your file starts with your prefix. Build and render only in your dev folder `dev/<set>/` (its `dev-scene.js` calls your set function for every t).

## The set function
`function setX(g, t)` — build your scene once (cache in a prefixed global), add the character with `chBuild().root` (scene.add moves it into your scene), pose it with `chPose({...})`, aim the camera with `shotCam(g, [x,y,z], [tx,ty,tz], mm, drift, t)`, light it (`lightRig(scene, {...})` or your own; VSM shadows are on), then `present(g, scene, { bloom, clear })` which renders and draws to the 2D canvas. Code-drawn textures with `g3Tex(draw, w, h)`. Deterministic: `RNG('name')` and `t` only. No image/audio files, URLs, data URIs.

## The look-frame task (step 1 of the piece)
Build ONE gorgeous, finished look frame of your set at t = 2.0 (a still the user will judge) plus 2–3 alternate angles at t = 4, 6, 8, all with the character acting the beat. The frame must be good enough to be a thumbnail: rich set dressing, believable soft light, depth (foreground / mid / background), atmosphere, smooth shading (no faceted low-poly look), code-drawn textures (wood, fabric, asphalt, felt, foliage…), secondary life (people, birds, cars, steam, sparkles). Leave the top-left (~520×330 px) and top-right (~420×160 px) a little calmer: the lead draws glass HUD panels there; bottom centre gets an italic caption.

Commands (in your dev folder):
```
S=/Users/alanleiva/.claude/skills/animate/tools
node $S/build.mjs .
node $S/still.mjs . 2,4,6,8 /private/tmp/claude-501/-Users-alanleiva-claude-proyectos/f7abc0ff-06e3-4d79-af97-53f7ae6b6b67/scratchpad/<set>-look.png --scale 0.5
```
Look at every still. Budget ≤ 2.5 s/frame at 1080p (time it at --scale 1). The character renders in ~0.25 s.

## Step 2 — the storyboard (every beat)
The look is approved. `src/scenes.js` now holds **BEATS**: one row per beat with its time, its set, its `shot` id and its caption. `sceneMain()` calls your set as `setX(g, t, b)` where `b = { id, t0, t1, k (0..1 progress in the beat), shot, cap, row, lost, status, day }`. Switch on `b.shot` and stage that beat: the set, the character's pose/expression/action animated over `b.k` (walks, turns, reactions, props moving), the camera move (slow push, pan, a reveal). A new set lives in YOUR file (e.g. INSIDE owns the kitchen, café, office…). Use `t` for continuous motion and `b.k` for the beat's own arc. Everything starts/ends cleanly at the beat edges (hard cuts between beats are fine).
- **Extras (other people):** they must be close to the hero's quality (no tube arms, no paddle hands, no helmet hair). The character agent is adding `chExtra(seed, o)` to `src/char.js` (same sculpt tech, varied face/hair/skin/body/outfit, posable with the same pose names). Use it when `typeof chExtra === 'function'`; until then keep your own people.
- The HUD (top-left 560×300 px, top-right 440×190 px), the caption (bottom centre) and fact cards (right side, y 250–520, at the times in FACTS) are drawn by the lead — keep those areas calm in those beats.
- Render the board in your dev folder: `node $S/storyboard.mjs . /private/tmp/claude-501/-Users-alanleiva-claude-proyectos/f7abc0ff-06e3-4d79-af97-53f7ae6b6b67/scratchpad/<set>-board.png` renders every panel of the piece (others' sets too); also render your beats with `still.mjs` at `t0 + 4.2` to check them.
