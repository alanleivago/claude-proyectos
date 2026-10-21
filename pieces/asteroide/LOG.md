# asteroide — log

## 2026-10-13 — intake, story, look, storyboard, build, sound, export, review
- Reference: `Ref lunar animation/ssstik.io_@lunarcheeseee_1791514161027.mp4` (asteroid over your town, Tunguska). English text, paraphrased (user rule). Story approved as proposed (13 beats, miles/mph).
- Built from agujero's helpers/textures; new world.js (hillside porch 44 m up, river town of ~360 log houses with carved painted window frames, church, stone bridge, railway + steam train, villagers, cows, haystacks, gardens, picket fences, ~2,400 detailed trees + ~51,000 taiga trees, birds) and run.js (star glint, fireball + 2D streak, trail, ring, plume, heat, quake, dust wall + curtain, falling forest, flying roofs, debris, cracked lens, end card).
- Look rounds: the porch frame hid the view and the fireball (raised the porch, steeper hill, thin posts, small valance, no flower boxes); the river read as a white canal (forest reflection, terrain-cut shoreline, bluer body); beige ground (cooler sun, greener colours, exposure 1.15); the meteor vanished on the bright sky (dimmer sky glow, white core + orange 2D streak); camera yaw pulled the posts into frame (yaw ≤ 1°, no backward move after the hit).
- User notes on the storyboard: shake where it should (quake jolt, a rumble growing with the wall, a violent shake at the blast), the lens cracks, debris and particles → added 2D debris flying past the lens, a cracked-lens overlay that stays to the end, multi-frequency shake.
- Bugs: the near dust-wall sprites showed their round lobes (faded near the camera + a 2D brown wipe); non-deterministic roofs (the quake offset persisted when jumping 1150→1100→120; update window widened to t > 42.9).
- Export on the GPU: 1680 frames in 52 s (31 ms/frame).

## Sound
- Openverse (sfx.py search) is behind a Cloudflare challenge from this Mac (403) → user approved Wikimedia Commons, CC0 / public domain only (BY-SA avoided). 18 recordings downloaded, judged by spectrogram (ChinaQuake rejected: a broadcast). Plus a code-synth layer (user's request): ringing after the flash, heat pressure, quake tremor, the wall's roar, debris whooshes, hero sub-drop, lens crack.
- Pipeline: synth.py → gen.py → bed.py layers.json audio/bed-rec.wav → combine.py → mix.py audio/cues.json.
- Fixes: the quake was the loudest moment (−6 → −14 dB); the planned silence measured −13.8 dB (hard zero 56.6–57.28 + hero aligned to start); the explosion's rolling thunder made 59.3 s the loudest (tail shortened, bed −8 dB after the first punch).
- Final: −15.2 LUFS, TP −2.0 dBTP, loudest 100 ms 57.6 s −7.2 dBFS, 0.6 s ≤ −40 dBFS before it.

## Review (review.mjs; ffmpeg here has no drawtext, so it ran from a temporary copy without the sheet labels, deleted after)
| shot | beat | result |
|---|---|---|
| 1 | porch, title | PASS |
| 2 | new star | PASS |
| 3 | brighter | PASS |
| 4 | fireball + streak | PASS |
| 5 | light fills the sky | PASS |
| 6 | burst, rays, ring, plume | PASS |
| 7 | heat | PASS |
| 8 | quake, birds | PASS |
| 9 | dust wall, forest falls | PASS |
| 10 | cover your ears, silence | PASS |
| 11 | shockwave, cracked lens | PASS |
| 12 | aftermath | PASS |
| 13 | end card | WARN dead beat 64.25–70 s (lines arrive until 67.8 s + drifting dust, still under the metric) |
- Story arc 5/5 PASS; text PASS (0 cut-off, 0 overlap, 0 safe zone); flat frames 1525–1526 = the fade to black (intended).
- Weakest: the near grass is spiky; the far forest's fall is hidden by the dust curtain (only the near trees are seen lying down); the end card is static by the metric.
