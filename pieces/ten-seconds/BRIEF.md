# BRIEF — "What If You Could See 10 Seconds Into the Future?" (ifverse style)

English YouTube story video, 16:9 1920×1080, 24 fps, ~8:20, everything drawn in code on one canvas.
Story: `script.md`. Every voice line with its id: `lines.md`. Style analysis + the rules we copy: `../../styles/ifverse/ANALISIS.md` (read the "Especificaciones técnicas" section — it is the spec).
Look: `../../styles/ifverse/kit.js` (read it fully: `ivStage`, `ivMan`, `ivPose`, `ivWalk`, `ivGhost`, `ivTag`, `ivCounter`, `ivTitle`, `ivPop`, `ivCount`, moods `IV_MOOD`). Approved style frames: `../ten-seconds-look/look.png`, their code `../ten-seconds-look/src/scenes.js` (the drawing level we expect — match or beat it).
Reference stills of the original channel (study only, never copy their stories): `../../Ref ifverse/frames/*.jpg`.

## The device
**The ghost:** Theo (you) sees a pale cyan hologram of the world 10 seconds ahead, laid over the real one. Draw it with `ivGhost(() => { ...draw the future... }, alpha)`. Cyan (`#7ff0ff`) means *the future* and nothing else (plus the running counter). Every use of the power shows the ghost.
**The counter** (bottom centre, `ivCounter([['FUTURES CHANGED', n, true], ['THANK-YOUS', m]])`): shown only in the shots that talk about it; numbers count up with `ivCount(t0, t1, a, b)` and land on the end of the spoken number word (`VWE(id, word)`).

## Cast (src/cast.js — never redefine)
`CAST.you` Theo (green hoodie) · `CAST.nia` Nia (yellow jacket, puffs; catchphrase "Spoiler.") · `CAST.dad` Dad, night-bus driver (blue uniform + cap; `CAST.dadHome` without cap) · `CAST.voss` Mr. Voss (grey suit, red tie) · `CAST.okafor` Mrs. Okafor (purple cardigan, bun, glasses) · `CAST.teacher`, `CAST.coach`, `CAST.manager` (arcade), `CAST.painter`, `CAST.cityW` (+ `city2`, `city3`), `CAST.cyclist`, extras `kidA..kidD`, `extraA..C`.
`GROUND = 900`: the floor line on the actors' plane (d = 1) in every set. A standing actor in a medium-wide shot: `h ≈ 480–560`.

## The engine (src/head.html, src/main.js — never edit)
- Register shots: `SHOT(t0, 'key', (lt, S) => { ... }, { sec: 's03', title: 'what the board says' })`. A shot lasts until the next shot's `t0` (any section). `lt` = seconds since the shot began; `TT` = absolute time.
- Times come only from the voice: `CUT(id, word, n)` = 3 frames before that word (the cut leads the word); `CUT(id)` = 3 frames before the line. `VW(id, word, n)` word start, `VWE` word end, `LT(id)` / `LE(id)` line start/end. Never hard-code seconds (the voice will be re-timed).
- Inside a shot: set `IV_M = IV_MOOD.x`, `IV_CAM = { x, y, z }`, `IV_FOCUS`, then `ivStage(layers)` (or a set function from sets.js), then screen-space overlays (tags, counter).
- Characters talk with `talk: '<line id>'` on `ivMan` (only the speaker's mouth moves; the narrator has no mouth).

## The rules of the look (from ANALISIS.md — follow them)
1. **One picture per clause:** a new shot each time the sentence moves on → **24–28 shots per minute**. Hard cuts only. No fades, no morphs.
2. **Mix:** ~⅓ hand / prop / phone-screen close-ups; ~¼ faces; ~⅓ wordless (the `[BEAT]` pauses in lines.md are wordless shots: the picture tells it).
3. **The picture shows the noun on its word.** Every spoken number is on screen (tag, counter, sign, phone) and lands on its word.
4. **Camera:** still. Close-ups never move. About one wide in three gets `z * ivPush(t0, 0.03, 1.8)`. No shake ever (one exception: the truck pass at the midpoint may get a 6-frame jolt).
5. **Acting:** faces change on the word that matters; blinks are automatic. Actions named in the script actually happen on screen (the catch, the duck, the brake, the fall, the grab of the hood, the handshake).
6. **Animation on 1s, no motion blur.** Walks with `ivWalk` (feet never slide). Gestures move fast (4–6 frames) and stop hard: use `EZ.o3(clamp((lt - a) / d))` style ramps between two `ivPose`s with `ivPoseMix`.
7. **Hands:** automatic by shot size; any grab/hold gets a hand close-up where the hand fills > half the frame and the grip is exact (`grip: { front: 'hold' }`, `hold: { R: (x, y, ang, h) => drawProp(...) }`).
8. **Depth:** every shot has ≥ 3 layers (far, mid, actors' plane; a soft foreground when it helps). Background life: 3+ details per shot (steam, a blinking light, rain, passers-by, a clock).
9. **Lighting by mood:** lunch/day warm-cool, night/rain blue with warm practicals, kitchen lamp. Keep shots in a scene in the same mood.
10. **Text on screen:** rounded bold caps (`ivTag`, `ivText` with `IV.font`), cream with warm glow; never over a face; inside the 62-px cinema bars. Labels pop in over 3 frames (`ivPop`).

## Code rules
- Deterministic: `RNG(key).f` for randomness (RNG returns an object: `.f()` is the 0..1 generator), never `Math.random`/`Date`.
- Your file only. Top-level names start with your prefix (`s03_…`, `SET_…`/`set_…`, `P_…`/`prop_…`). Don't redeclare kit/core/head names (see the list in `~/.claude/skills/animate/styles/README.md` → "Names a kit must not reuse") or other files' names.
- Write the file in parts of ~200 lines (Write, then append with Bash heredoc or Edit).
- Build and look: `node ~/.claude/skills/animate/tools/build.mjs dev/<you>` then `node ~/.claude/skills/animate/tools/tile.mjs dev/<you> dev/<you>/tile.png <frames…>` or `node ~/.claude/skills/animate/tools/still.mjs dev/<you> <t1,t2,…> dev/<you>/x.png --scale 0.4`. **Look at every shot you make** and fix what's off: faces cut by the frame or the bars, feet floating or sinking, things passing through each other, frames too dark/empty, the same picture 3 times in a row.
- Python: use `/usr/bin/python3` (the plain `python3` lacks faster-whisper).
