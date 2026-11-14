---
name: earshot
description: earshot (ears for agents + 252-SFX code bank) installed; use it to choose/verify/critique SFX in every video from now on
metadata:
  node_type: memory
  type: reference
  originSessionId: c06d4859-1bbd-4e22-88ca-0cdf712f4c20
  modified: 2026-10-25T04:24:08.932Z
---

earshot 0.4.0 lives at `F:\earshot` (repo + venv; models cached in `F:\earshot\.cache\hf`). Python: `F:\earshot\.venv\Scripts\python.exe` (this is `{{PY}}` in the real-sound skill).
MCP `earshot` registered at user scope (models stay loaded; prefer it over many CLI calls, each CLI call ~20-40 s). Skills `earshot` and `real-sound` copied to `~/.claude/skills`.
The user asked (2026-10-25) to use it to raise the level of SFX in ALL future videos: pick/verify sounds with `rank`/`match`/`realness`, check sync with `timeline`/`critique`, render bank SFX with `sfx render`/`kit`.
Respect per-style rules: [[audio-recorded-sound]], [[bitpix-series]].
