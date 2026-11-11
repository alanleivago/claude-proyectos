---
name: verify-tutorial-claims
description: "When learning a method from a video via Gemini notes, don't trust the summary — ask targeted questions about the asset pipeline/tools and check frames before building"
metadata:
  node_type: memory
  type: feedback
  originSessionId: e3b19138-633b-4f91-a0e9-968a2b60dee4
  modified: 2026-10-22T04:53:33.692Z
---

When a user says "do it exactly as the video says", Gemini's general notes are not enough: in the cartoon3d tutorial they omitted that the faces, expressions and hair were generated in Google Flow, and I built a procedural engine without it. The user caught it (2026-10-22).

**Why:** a summary drops the "how" (which tool made each asset, prompts on screen); building on it wastes a full test iteration and erodes trust.
**How to apply:** before building, run a targeted Gemini pass on the tutorial asking, per asset type, which tool made it and the exact on-screen prompts; say plainly that the notes come from Gemini, not from my own viewing. Related: [[cartoon3d-style]], [[flow-mcp]]
