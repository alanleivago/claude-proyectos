---
name: real-sfx
description: "real-sfx skill (Clipwing) installed at ~/.claude/skills/real-sfx; places real library sounds on a video's events and critiques the mix"
metadata:
  node_type: memory
  type: reference
  originSessionId: c06d4859-1bbd-4e22-88ca-0cdf712f4c20
  modified: 2026-10-25T04:49:26.505Z
---

real-sfx (Clipwing/skills @ edbefcb) installed at `%USERPROFILE%\.claude\skills\real-sfx`, run scripts from that folder with system `python` (3.12).
Library: `sound_layer` = `F:\Claude Proyectos\sound-layer` (main tier, 3130 sounds, has catalog, indexed) + uisfx (78 CC0 UI cues, npm in vendor/).
To add more: `python scripts/setup.py add-library NAME PATH --tier main|extra --index` (e.g. a folder of downloads from [[freesound]] / [[openverse]]). Pairs with [[earshot]] for listening checks.
