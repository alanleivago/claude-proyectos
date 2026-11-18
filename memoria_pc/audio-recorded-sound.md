---
name: audio-recorded-sound
description: "All animation videos use real CC0 recordings (option B), never synthesized ambience/SFX"
metadata:
  node_type: memory
  type: feedback
  originSessionId: dd621c73-0dc8-4663-a3a9-e8d02c9a413f
  modified: 2026-10-11T17:43:12.463Z
---

Every video's sound = real CC0 recordings ("opción B", tested 2026-10-11 on ola-700): ambience beds built from Openverse/Freesound recordings + discrete hits from the sound-layer kit, mixed with sound-layer `mix.py` (bed in the "voice" slot), checked with `qa.py`. No synthesized ambience, no music. User: "mil veces mejor, se escucha tal cual como en una grabación real".

**Why:** synthesized beds (sirens as pure tones, noise-filter water) sound fake; recorded beds sound like a real recording.

**How to apply:** workflow and scripts live in `pieces/ola-700/sound-test/B/` (bed.py, layers.json, look.py) and `sound-layer/` (kit + work/cand recordings). Search: `sfx.py search "<q>" --type transition --out work/cand/<name>` (slow, ~5 min/query; run in parallel). Look at spectrograms (look.py) before choosing. Hero hit needs a loud bed under it (mix.py sizes hits against the bed). Credits in CREDITS.md per piece. Related: [[pov3d-style]]

**Exception (2026-10-12):** not for the bitpix / Bitstory data-explainer style — there the user wants synthesized code SFX plus their own music track. Related: [[bitpix-series]]

**Upgrade (2026-10-25):** from now on pov3d videos get "sonido pro": use the `real-sound` skill (licensed real recordings, cue list from the picture, mixer, QA, mastering, credits) and `earshot` to actually listen/verify, instead of only the sound-layer bed + code SFX. User asked: "a partir de ahora mejora el sonido con sonido pro".
