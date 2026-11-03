---
type: summary
status: active
tags: [cartoon3d, ricks-clips, mromidev, claude-animated-shorts, gap-analysis, camera-grammar, depth-of-field]
relatedTo: [fuentes/cartoon3d/how-to-make-viral-animated-shorts-using-claude-full-workflow.md, styles/cartoon3d/kit.js, pieces/flower-clock, pieces/swedish-number]
---
# mromidev "claude-animated-shorts" vs our cartoon3d pipeline (2026-11-01)

Sources:
- Video notes: [how-to-make-viral-animated-shorts-using-claude-full-workflow.md](how-to-make-viral-animated-shorts-using-claude-full-workflow.md).
- Repo: `refs-ext/claude-animated-shorts`. It is git-ignored and its reference frames are private study material.
- Measured reports copied to `styles/cartoon3d/mromidev-ref/`: STYLE_BIBLE plus 7 reports (motion, depth, grade, lighting, outlines, textures, characters).

Their reference channel is the same Ricks-Clips style we copy. They measured 20 of its latest shorts at 30 fps, a total of 32,000 frames.

**Who made the assets.** Everything in their pipeline is code:
- characters are drawn in Canvas2D (`toon.ts`);
- the world uses three.js with CC0 Kenney props and painted textures;
- sound is synthesized in Python.

No Flow or AI generator is used anywhere. That matches what the frames show.

Legend: SAME, BETTER-THEIRS (B-T), BETTER-OURS (B-O), MISSING (M).

## Process
| # | Theirs | Ours | Mark |
|---|---|---|---|
| 1 | Measure the reference frame by frame (30 fps, contact sheets of 60 frames per 2 s, phase-correlation camera tracking); "numbers, not opinions" | Ricks frames measured once for framing, cuts and colour (`styles/cartoon3d/FRAMING.md`), plus review by eye | B-T. Their 7 measured reports are now in `mromidev-ref/` for agents |
| 2 | Check the reference has not already covered the topic; verify facts first | Same (vidiq/WebSearch, sources in the scripts) | SAME |
| 3 | Stills before video; side-by-side against reference frames; an Opus verifier scores 7 areas out of 10 | Storyboard plus `revisar_render.py` (API) | B-T for the scored side-by-side. Added `styles/cartoon3d/tools/sbs_sheet.py` |
| 4 | Frame-by-frame QA (`short_qa.py`): black, white, frozen and pop frames, loudness, silences, per-shot stats, 2 s sheets | Ad-hoc strip scans | B-T. Added `styles/cartoon3d/tools/short_qa.py` (tested on flower-clock: -14.0 LUFS, LRA 1.7, no black/white/frozen frames) |
| 5 | Agent team: 7 diagnosis agents (one per topic), then sandbox per owner, owned files only, merge file by file | One fork per piece, sometimes one per set | SAME idea. Keep "one owner per file" when using several agents |
| 6 | Ink pass before the blur (otherwise the blur erases it) | `C3_INK2` runs on the background layer before its blur | SAME |

## Script (STYLE_BIBLE)
| # | Theirs | Ours | Mark |
|---|---|---|---|
| 7 | Paradox hook in sentence 1, no intro; setting in 1-2 lines; 3-6 escalation beats; one "Wait…?" mystery; "You see," pivot (14 of 20 videos) with an everyday analogy; ironic payoff; ends on the last word | Our batch-03 scripts follow this exactly | SAME |
| 8 | 3.5-4.1 words/s, word gaps under 1 s in total | ~3.8 words/s (61 s, 229-236 words) | SAME |
| 9 | Voice starts at frame 1-4; no intro, outro or CTA | Same | SAME |

## Picture
| # | Theirs (measured) | Ours | Mark |
|---|---|---|---|
| 10 | Camera moves in ~65 % of frames. Every hold creeps in at 0.15-0.35 %/f, 0.6 %/f for ~35 f on punch words | Shots move by keys; holds can sit still | M. Added `C3_CAMFX` (rate, punch) |
| 11 | Rolls of 4-5° on emphasis beats | None | M. `C3_CAMFX.roll` per shot |
| 12 | Impacts are 7-frame kicks that flip sign every frame (~3 px at 720p, roll ±0.23°); no hand-held float | Static at impacts | M. `C3_CAMFX.kicks` |
| 13 | Glides are smootherstep 18-40 f; big reframes are cuts or continuous moves; dissolves 6-8 f at place changes | `CONTINUOUS` glide 0.55 s (16 f), dissolves 6 f | SAME. Use `CONT_BLEND` 0.6-0.8 s for long moves |
| 14 | Depth of field on ~1/3 of screen time: CoC 12-16 px on CU/inserts, 10-12 MS, 0 on wides; focus on the eyes | Background-layer blur (`bgBlur`), scaled ×0.55 by C3_VIVID | B-T. Added `C3_DOF` per-shot table. It only blurs the BG layer: people standing behind stay sharp |
| 15 | Fog colour = horizon colour, 25→420 m by day (aerial perspective, pale far town) | No fog | M. Added `c3Fog(scene, sky, near, far)`, opt-in per set |
| 16 | Foreground framing props in ~1/3 of MS/CU, 10-25 % of an edge, blurred | `nearBlur` layer plus staFg props | SAME |
| 17 | World ink ~3 px at 1080 (3.4 px near → 2.2 px far), near-black #0b0a0c; character ink plum #241726, thicker on the shadow side | `C3_INK2` 3.4 px dark brown, constant width; hull ink on characters | Mostly SAME. Distance falloff and near-black world ink not adopted: the user approved our brown marker |
| 18 | Colour: day luma median ~.57; non-ink p5 ~.23 (no crushed blacks); saturation median .38-.65 | Ricks frames (ours measured): luma .55, p5 .18, sat .34. flower-clock: .35 / .16 / **.85**; swedish-number: .67 / .22 / **.88** | **Needs a user decision.** Our C3_VIVID saturation is about 2.5× Ricks'. The user asked for "bastante saturación", so it was not changed |
| 19 | No film grain (the reference measures none; grain bloats the file) | `c3Grain(0.02)` at the end of every frame | B-T. New pieces: `c3Grain(0)` |
| 20 | Two-tone shading: warm lit side, cool tint only in the shade, lit/shade ratio ~3.5:1, violet-blue shadows (golden) | `C3_SHADOW` with ambient 55 %, per-look shadow tint | SAME/partial |
| 21 | Light follows the story (noon → sunset → night blue for the explanation) | `SHOT_LOOK` per shot | SAME |
| 22 | Bloom only on HDR emissives (threshold 1.0) | `C3_VIVID` bloom 0.04 | SAME |
| 23 | Characters: 3.5 head-heights, stick limbs ~0.055 W, ink-dot hands, bean head, no blush or catchlights, faces luma ≥.85, walk bob 3-7 %, lean 1-7°, blinks every 0.5-2.3 s (4-frame shape) | Ricks-cut hair, Flow body sprites with kit ink arms, fists, dot eyes, blinks | SAME in spirit. Ours copies Ricks' real hair and costumes. Their Canvas2D bodies are not adopted (the user's Ricks-hair and costume rules win) |
| 24 | Readability traps: props closer than 2 m to the lens become blobs; cut-off foreground bushes read as "green balls"; painted signs need an unlit face; rails cross legs, not torsos; flat holds read as freezes | Already in our rules (lens-crossing cull, text inside objects, signs) | SAME. Add "no hold of 12 f or more without a creep" via C3_CAMFX |
| 25 | Final export 2K vertical 1440x2560 (`--scale 1.3333`) | 1080x1920 | M. **Needs a user decision** (render time about 1.8×) |
| 26 | Captions: none, by their user's rule | One-word subtitles (our user's rule) | Conflict: keep ours |

## Sound
| # | Theirs | Ours | Mark |
|---|---|---|---|
| 27 | Synthesized SFX plus an original march score, ducked; music +3 dB, SFX -6 dB | Real Freesound CC0 recordings plus the kit; pizzicato bed (user rule); SFX at least 4.5 dB under the voice | B-O, and a user rule. Keep ours |
| 28 | -14 LUFS, LRA ~2.4, bed 5-10 dB under the speech | -14 LUFS, LRA 1.7 | SAME |
| 29 | Lock the picture timings before making the sound | Same order (sound after the approved render) | SAME |

## Their skill
`SKILL.md` drives a Remotion + R3F TypeScript project (`templates/bridge`). It needs Remotion, `@remotion/three` and a Remotion project; our pipeline is the animate skill.

The code is safe to read: no network calls, only ffmpeg subprocesses, no hooks. It is **not installed** in `~/.claude/skills`, because its trigger ("cartoon 3D style", "like the bridge video") would compete with our cartoon3d pipeline. It stays in `refs-ext` as a reference.

## How to use the new opt-ins (for new pieces; approved pieces are unchanged)
In `shots.js`, after the other flags:

```js
C3_CAMFX = Object.assign({}, C3_CAMFX_DEF, { punch: [/* times of punch words */], kicks: [[t, 1]], roll: { sNN: 4 } });
C3_DOF = { sNN: 7 /* CU */, sMM: 5 /* MS */ };
```

Then:
- In `drawShot`, set `C3_SHOT = { id, t0: a }` before calling the shot function, and in `contCamAt` too.
- End each frame with `c3Crisp(0.6); c3Vignette(0.2); c3Grain(0);`.
- Call `c3Fog(scene, 'day', near, far)` in the exterior sets.

Tested in the `pieces/_camfx-test` sandbox (a copy of flower-clock). The push-in, roll and DOF work. With the flags off, flower-clock renders the same as its approved video_only frame (mean difference 3.4/255, which is compression).
