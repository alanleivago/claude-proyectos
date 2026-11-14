---
type: note
status: active
tags: [rocket-speedup, pov3d-hd, look-frames, log]
relatedTo: [rocket-speedup, wave-grew, luckier, pov3d-hd]
---

# rocket-speedup — log

## 2026-11-03 · look frames (step 2)
- New build: `src/core3d.js` (renderer, `eyePose`/`poseEye` with sway + launch rumble, `g3Mat` colour+bump textures, smooth `g3Noise`, `g3RBox`, bloom, `lensFlare`), `src/stage-outside.js` (`ouOutside`: pad/sky/tower/steam/crowd, Moon, aberrated star shader + starbow glow), `src/stage-cockpit.js` (`ckCockpit`: front wall with real window hole, bolted frame, quilted conical shell, console + 3 live screens, rear cam, taped photo, seashell charm, knees, gloves on throttle/stick, crack overlay), `src/scenes.js` (HUD L speed+NEXT, R your/Earth clock glass panel, captions, photo DOF, end card). `head.html` holds the 1 g physics (`shipTau`, `speedOf`, `earthOf`, `distOf`), LOGTAU knots per beat, NEXTS.
- Frames: `look/t20.png`, `look/t130.png`, `look/t350.png`, `look/t480.png`, sheet `look/look.png`. ~0.55–0.61 s/frame at 1080p.
- Weakest: the pad view (flat ground, thin crowd stripe), the knees/forearms at the bottom edge read as lumps, starbow is art-directed (ring radius chosen, not true Doppler).
- No kit changes.

## 2026-11-03 · fixes after look approval + storyboard (step 3)
- Fixes: suit legs and sleeves are folded lathe tubes (`ckTube`) with knee pads, two strapped buckles per thigh, a pocket with a flap and a pen, a wrist band; the fine weave is gone (no moiré). Pad: a 4 km near ground at 2 m/px (scrub, inlet, roads, crawlerway), a viewing site ~1.8 km ahead-right with 520 cars, 5,200 people, bleachers, tents and flags (instanced; `frustumCulled = false`, near plane 3 m to stop z-fighting), fiery additive glow under the steam at ignition. Moon: darker maria, 5 ray craters, bump scaled to its pixel footprint. Starbow unchanged.
- New `src/stage-bodies.js` (prefix ob): Earth limb + air glow and a cloud deck while climbing; Parker probe, Mars, Jupiter, Saturn + rings, Pluto, Voyager 1, Proxima flybys. Ship attitude `SHIP_PITCH` (gravity turn, 58–84 s) tilts the outside camera so the limb rises into the window.
- Cockpit: ship messages (`CK_MSG`) on the centre screen, full-screen warnings on the left screen + red flashing cabin light (`CK_ALARM`: cutoff failed, radiation, impact), red giant Sun on the rear cam from 484 s. Dust hit at 326 s: white flash + camera jolt (`ckHit`). Camera beats: look at the crowd (10–19.5 s, zoom), the cutoff switch, the Moon, the radiation screen, the rear cam, the nav screen, the photo.
- scenes.js: CAPS for every beat, FACTS cards (Apollo 10, Parker, Voyager, sand grain, Proxima, galactic centre, Andromeda), TIMELINE.board = 28 panels. Board: `board/board.png`. Look frames re-rendered in `look/`.
- Weakest: Parker/Voyager models read as boxes; Earth limb surface is flat blue; 416 s panel shows too much leg; teaser panel repeats the starbow panel.

## 2026-11-04 · full build: fixes (QA rounds 1-2), animation, sound, export, QA
- Picture: teaser rebuilt (black hole lensing the starfield, blazing starbow ring, star streaks, hull glow, glass cracking at 1.6 s, sparks, alarms, roll and shake, clocks spinning); pad ground glitch fixed (scrub/crowd/cars intersecting the ground = z-fight shimmer; the far ground pushed back with polygonOffset); volumetric-looking cloud deck (lit billow sprites in 3 layers + soft deck) you climb through; every flyby on an approach curve (a dot about 1000 radii ahead, then it grows, sweeps past the side of the window and recedes on the rear cam) with a safe miss distance (the Moon no longer passes through the ship); Proxima as a granulated red dwarf with a flare, a prominence, Proxima b and Alpha Cen A/B; a comet, the asteroid and Kuiper belts, dust streaks, glass micro-impacts; first-person head moves through the cruise; galaxy-act chaos (hull-stress jolts, alarms, radiation flashes, blue-shifted debris); captions anchored to the HUD milestones (Apollo 10 = 11.08 km/s, escape 11.2 km/s, Mars 2.5 d, Pluto 13 d, Voyager 27 d, Proxima, galactic centre, Andromeda, 20 yr, 22 yr / 5 Gyr); dark plates under the clock panel and the fact cards; stronger caption scrim; charm moved out of the HUD; slow push on the photo; drifting stars behind the end card.
- Sound (audio/tools/score.py + music.py; Freesound CC0/CC BY, credits in audio/CREDITS.md): pad crowd, vents, countdown pips, launch roar + rattle + sub, Mach boom, cloud rush, cabin bed + fans + hum, switch clacks and picture-locked alarm pulses, record chime, flyby passes for each body, Voyager bleeps, Geiger, radiation alarm, dust hiss, micro-impact ticks, tension drones, 1.1 s near-silence (-68 LUFS) then THE HIT at 326.2 s (loudest LUFS-M), the starbow lowest, the galaxy chaos (creaks, zaps, glass groans), the end impact + crystal tones. Music (original): organ drones on G, a G-minor organ ostinato, cello swells, ticking, through a hall reverb; quiet from ~95 s, predominant from 343 s.
- Export: 51 chunks of 300 frames (tools/export_chunks.sh, KEEP=1 keeps frames/ for review), tools/join.sh -> renders/final.mp4 (AAC 320k) + renders/share.mp4 (CRF 24, same audio). Thumbnail renders/thumb.png.
- review.mjs: run with a local copy that decodes each shot's frames only (the stock one re-reads every earlier frame per shot); TIMELINE.shots split into <= 12 s parts for the sheets.

### QA (final, 2026-11-04)
| check | result | note |
|---|---|---|
| text (textcheck, 2,608 frames) | PASS | 0 cut-off / overlap / safe-zone |
| cut 6.0 s (black -> pad) on grid | PASS | |
| cut 5.2 s (teaser -> black) | FAIL (tool) | a hard cut to black on the 8th grid, frame-exact; the pixel-change confirm is below the tool's threshold (dark last teaser frame) |
| story arc "peak has the highest cut rate" | FAIL (n/a) | F5 one continuous shot by design: 2 cuts in the film |
| sound: loudest moment | PASS | THE HIT 326.2 s, loudest 100 ms window and LUFS-M; 1.1 s near-silence before it |
| loudness | PASS | -14.0 LUFS integrated, TP -2.2 dBTP after AAC (final.mp4 and share.mp4), LRA 7.5 LU |
| dead beats | WARN | 500.5-510 s end card (slow drifting stars only) |
| earshot critique (wav) | 19 / 22 in range | open: music presence (no music before 95 s by brief), onset density, hit density |
| earshot timeline (film) | 86 % of 156 picture events have an onset within 100 ms | |
| pad flicker 0-15 s | PASS | no isolated one-frame pops after the ground fix |
| revisar_render.py | CASI (minor) | open: captions vs racing Earth clock drift during the 3 s hold (Proxima, galactic centre), Earth dot on the rear cam small, Parker card year |
