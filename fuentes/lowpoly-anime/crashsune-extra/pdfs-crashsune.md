---
type: reference
status: active
tags: [crashsune, blender, checklist, low-poly, pdf]
relatedTo: [crashsune-low-poly-series, GUIA-personaje-ps1]
---

# Crashsune PDFs (assets/crashsune/)

## 10 Blender Problems (2 editions, same content; 2026 is the newer one)
Checklist to run **before rigging or exporting** (we turn it into an automatic check in the scripts):
1. Unapplied scale → `Ctrl+A` Apply Scale (in bpy: `transform_apply(scale=True)`); check that it reads 1.000.
2. Duplicate vertices (an extrude without moving) → Merge by Distance (`bmesh.ops.remove_doubles`).
3. Overlapping faces → z-fighting; same fix.
4. Unapplied transforms → Apply All Transforms before rig/animation/export.
5. Hidden geometry (H) → Alt+H. 6. Proportional editing (O). 7. Snapping (Shift+Tab). 8. Number keys that hide collections. 9. Save incrementally (Ctrl+Alt+S).
10. **N-gons** → Select by Trait → Faces by Sides > 4; tris are fine in low poly and at joints.
Final checklist: Ctrl+Z, Apply Scale, Recalculate Normals (Shift+N), Merge by Distance, overlapping faces, Alt+H, save.

## Blender Tips & Tricks from Artists Around the World (Nov 2025)
What applies to us:
- **Extract parts for clothing**: select a region → Shift+D → P (Separate by Selection) → new object that follows the body. **Ideal for the hi-vis vest**: duplicate NETO's torso, separate it, inflate it slightly (Shrink/Fatten), and it inherits the weights.
- **Limb deformation**: 2 rings per joint (top 100% to the upper bone, bottom 100% to the lower one); never one merged ring at 50/50 (it collapses). Fewer edges on the inner side of the bend, more on the outer. In low poly, **a separate hand** avoids wrist twisting.
- **Smooth Vectors** (Mesh → Normals, repeat with Shift+R): softens the shading without losing the facets. Useful for the face/helmet.
- **Negative light** (negative power): subtracts light → fake corner shadows. In three.js a light with negative intensity works the same way.
- **Project from View** early, UVs as part of the modeling (matches video 08).
- **Rigify for engines**: Rigify doesn't export cleanly; the "Game Rig Tools" add-on converts it. We fix it by script (reparent DEF bones, see notes 09/10).
- **Graph Editor Alt+S** (Butterworth smooth) to clean jittery animation.
- Model facing **-Y** (Numpad 1 = front); Mirror on X.
- Generic (doesn't apply): Load UI, F3, Quick Favorites, fly mode, Cycles noise threshold, Discord export, motivation.
