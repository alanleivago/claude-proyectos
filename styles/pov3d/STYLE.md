# pov3d — "what if" POV in real 3D (three.js)

One fixed, high camera on a busy real-world place (a beach in the first piece); the world changes around it while a serif HUD counter on the left changes what it measures each act, and an italic serif caption sits in the lower third. Rendered with three.js r149 (inlined in `three.js`, global `THREE`) into an offscreen WebGL canvas, then drawn onto the 2D canvas under the 2D text overlay from `kit.js`. Motion on 1s.

**Proven on:** `pieces/sol-explota` (60s, "¿Qué pasaría si el Sol explotara?", approved by the user for quality). Start every new piece in this style from `template/` — it is that piece's full source.

**Current quality bar (2026-10-10): `template-ola/`** (pieces/ola-700, the 65s tsunami). Its visuals and its sound design are the minimum for every new pov3d piece. Start from it, not from `template/`.

**Sound rule (2026-10-11): REAL RECORDINGS, NO MUSIC, NO SYNTH.** The user approved "option B": every ambience bed and every hit is a CC0 recording, never synthesized. Workflow and scripts: `pieces/luna/sound/` (gen.py → layers.json → bed.py → audio/bed.wav in the "voice" slot of `sound-layer/scripts/mix.py`, hits as cues from `sound-layer/kit`, then `qa.py`, `levels.py`). Find recordings with `sound-layer/scripts/sfx.py search` (Openverse, slow: run queries in parallel) and look at their spectrograms (`look.py`) before choosing. Trim hit tails so they die before planned silences; put a loud bed (water burst) under the hero hit so the mixer sizes it as the loudest moment. Write CREDITS.md and LISTEN.md per piece. The score.js synth score is no longer the sound. Still:
- ambience beds
- discrete events
- Doppler on moving sources
- wind and rumble
- reverb sends and ducking
- silence before the loudest hit, which lands on the impact
- −14 to −16 LUFS, true peak ≤ −1 dB

## How to start a new piece
1. Copy `template/piece.json` and `template/src/` into `pieces/<name>/`. Keep the `"build"` list in piece.json (it inserts `styles/pov3d/three.js` before the kit).
2. `src/scenes.js`: `g3()` builds the 3D world once (cached in `G`); `update3D(p)` poses everything from `TT` each frame and draws it with `ctx.drawImage`. Replace the world (beach → city, forest, ocean…) but keep the techniques below.
3. `src/head.html`: TIMELINE (acts, cues, board). `src/score.js`: the score.

## The quality bar (what the user approved)
- **Camera:** high and steep (fov ~50°, ~13 m up), horizon at ~48% of frame height; the subject fills the lower half; big foreground framing elements in the top corners (palm fronds).
- **Light:** low warm backlight (sun in frame, ~43% height), `VSMShadowMap` 4096 with `radius 5`, long soft shadows toward the camera; ACES tone mapping on meshes; **the sky shader skips tone mapping** so the cream/lavender gradient stays warm (top `#c3bfe6`, horizon `#fde2bd`).
- **Colour management:** `THREE.ColorManagement.legacyMode = false` — hex colours are sRGB. Without it everything washes out.
- **Water:** custom shader — turquoise shallows → blue → hazy far, five rolling foam bands, shoreline foam, sun glitter, sky reflection.
- **Land:** displaced geometry with code-drawn rock textures (vertical streaks, crevices), vertex-colour vegetation, instanced trees; sand with grain texture and colour variation; haze with distance.
- **People:** ~300 instanced smooth bodies (capsules) in swimwear: skin, trunks/bikini, arms, hair, varied heights/widths/kids; poses: lying, sitting, standing groups, walking, swimmers waist-deep; all from seeded RNG.
- **Props galore:** lifeguard tower, pier on piles, boats, buoys, umbrellas (2-colour panels), towels, chairs, coolers, boards, sandcastle, volleyball net, kites with bow tails, gulls, a small plane.
- **Effects:** additive flame sprites, smoke/steam sprites with `depthTest = false` + `renderOrder = 10` (otherwise transparent water cuts them into hard-edged smudges), plasma sphere with code texture, fog shifting colour per act.
- **Text:** `pvTitle` (two lines, top third), `pvHud(label, value, sub)` (left, y≈800–914), `pvCaption` (y≈1390) — each sits on a **feathered dark ellipse** (`pvFeather`). Keep captions short (≤ ~32 chars) to stay out of the phone UI's right edge.

## Frame checklist
- Opening frame reads like a postcard: busy, warm, foreground framing, horizon ~48%.
- Title / counter / caption never overlap a bright kite or the sun; feather under every text.
- No hard-edged dark shapes (sprite cut by water) — check stills across every act.
- Loudest sound on the turn (the flash), ≥0.5s silence before it.

## Performance
~1.3–2 s per frame in headless Chromium (software WebGL); a 60s piece exports in ~45 min. Build stills often with `--scale 0.4`.

## Not matched yet
Palm fronds are thinner than the reference's broad leaves.
