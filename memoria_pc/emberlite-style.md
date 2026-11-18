---
name: emberlite-style
description: "Emberlite PS1/PS2 low poly Blender scenes (refs in \"Ref emberlite 3D blender\"); pilot = pieces/emberlite-desk via Blender MCP"
metadata:
  node_type: memory
  type: project
  originSessionId: b19cd1d9-332a-4ffd-91ff-b618e0ca55df
  modified: 2026-10-22T06:48:44.185Z
---

User wants the 4 refs in `Ref emberlite 3D blender/` (vertical 720x1280, ~13 s, 4 shots of ~3.3 s with hard cuts, slow push-ins, night blue/pink or warm orange, parody brands, cat, floating game marker) replicated in Blender via the Blender MCP. User is on Max 20x, usage is not a concern (2026-10-22).

Pilot started 2026-10-22: ref 3 (night desk) in `pieces/emberlite-desk/`: `make_tex.py` (PIL textures, Closest interpolation), `build.py` (exec in live Blender, rebuilds the whole scene), `shots.py` (4 cameras + timeline markers + screen swap), `desk.blend`, render with `blender -b desk.blend -a` + ffmpeg.

User feedback on v1 (2026-10-22): no cat; it must look truly low poly like the ref. What actually makes the ref look PS2 (verified at pixel level, unlike Gemini's "no AA / 320x240 / nearest" claim): every surface has a photo texture (no flat colors), textures downscaled to 128-512 px with linear filtering, matte materials (low specular), faceted geometry (8-sided cylinders), deep saturated blue lighting with a cool monitor spot on the desk + "Medium High Contrast" look. Textures from Flow via `gen_flow.py` (use a fresh Flow project, otherwise the CLI grabs old tiles; Flow rejects "carpet/fabric" prompts, make those procedural).

**Why:** reproducible scripts let each fix be a rebuild instead of manual edits.
**How to apply:** for the next scenes, copy this structure. Poly Pizza/Sketchfab are off in the addon (ask the user to enable them for complex models like cats). Flow blocked automation with "unusual activity" on 2026-10-22, see [[flow-mcp]]; textures drawn in code work fine as a fallback.
