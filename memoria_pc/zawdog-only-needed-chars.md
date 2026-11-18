---
name: zawdog-only-needed-chars
description: "zawdog humans — polish only the characters the next video uses, not the whole cast pack"
metadata:
  node_type: memory
  type: feedback
  originSessionId: fee78aff-f43d-47c1-a432-a0f21fe3abed
  modified: 2026-11-12T11:27:57.885Z
---

Only work on (build, fix, review) the zawdog characters needed for the next video, not all 15+15 of the cast packs.

**Why:** user (2026-11-12): "si no estaremos todo el día aquí" — whole-pack passes take hours.

**How to apply:** before any human build/fix pass, find out which characters the next short uses (script/storyboard) and touch only those. Flow-clothes method: `build_human3.py ... flow=1` (garments_flow.py). Related: [[kimodo-pc]]
