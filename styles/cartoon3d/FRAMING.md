---
type: spec
status: active
tags: [cartoon3d, framing, shot-length, long-take, ricks-clips]
relatedTo: [styles/cartoon3d/STYLE.md, pieces/slow-checkout, pieces/lego-sea, pieces/future-library]
---
# cartoon3d — framing and shot length (measured on Ricks Clips, 2026-10-29)

Measured on the 18 Ricks Clips shorts in `Ref 3D cartoon animations/ricks/`, using two tools:
- `tools/shot_stats.py` finds shot boundaries with the HSV-histogram distance between frames 0.2 s apart. It is calibrated on lego-sea and finds all 34 known boundaries.
- `tools/head_size.py` finds the biggest white round head every 0.5 s, as a % of frame height. Classes: CU ≥ 28 %, MCU 18–28, MS 10–18, WS 4–10, EWS < 4 or no head. The detector misses some heads, so compare the classes between videos rather than reading them as absolute values.

## Shot length

| | shots / min | median | mean | > 3 s | longest |
|---|---|---|---|---|---|
| Ricks (18 shorts) | ~27 | 1.65 s | 2.2 s | 22 % | 5–11 s (one or two per short) |
| lego-sea / future-library | 40 | 1.35 s | 1.5 s | 5 % | 3.5–4.1 s |
| slow-checkout before | 31 | 1.87 s | 1.92 s | 9 % | 3.7 s |

## Framing (head height, % of sampled frames)

| | head median | CU | MCU | MS | WS | EWS / no head |
|---|---|---|---|---|---|---|
| Ricks (mean of 18) | 10.2 % | 2 % | 7 % | 22 % | 28 % | 42 % |
| lego-sea | 9.4 % | 2 % | 11 % | 15 % | 24 % | 49 % |
| future-library | 14.9 % | 6 % | 8 % | 25 % | 16 % | 46 % |
| slow-checkout before | 13.3 % | 7 % | 13 % | 43 % | 21 % | 16 % |

## Rules for every piece

- **Frame wider.** Ricks keeps people mostly full-body (MS/WS) with a median head about 10 % of the frame height. Close-ups are rare (≈2 %) and saved for punchlines. Insert shots (signs, counters, props, maps) and establishing shots make up about 40 % of the frames.
- **Use long takes.** About one shot in five lasts longer than 3 s, and each short has one or two continuous camera moves of 5–11 s that run through several beats without a cut. Keep about 25–28 boundaries per minute, not 40.
- **How to build it** (in `shots.js`, see pieces/slow-checkout):
  - `SHOT_WIDEN[id] = k` pulls that shot's camera back along its own view line (`c3SetCam` wrapper).
  - Shots not listed get 1.12, except the inserts in `SHOT_INSERT`.
  - `CONTINUOUS[id] = previousId` removes the dissolve. Over `CONT_BLEND` (0.55 s) the camera glides from the previous shot's pose at the boundary into this shot's pose. The previous pose is read by a dry run of its shot function, before this shot sets up the shared world.
  - Only chain shots of the same set that are adjacent beats.
