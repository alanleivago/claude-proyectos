---
type: reference
status: active
tags: [ps1, psx, blender, low-poly, tutorial]
relatedTo: [the-psx-texturing-tutorial-i-wish-existed]
---

# The Simplest Guide to Ps1 Graphics In Blender — SunnyIsOnline (16:14)

https://www.youtube.com/watch?v=390peMdni7s · 377K views · seen in full (narrated transcript + frames every 20 s).
The models shown at the start (anime girl with checkered sleeves, white cat) are **the creator's own and can't be downloaded**.

## Links in the description (checked)
| link | what it is | use for us |
|---|---|---|
| models-resource.com | models ripped from real PS1 games | **reference only** (study polygons and texture sheets); they're copyrighted, never use them in a video |
| lucasroedel.gumroad.com/l/psx_snapping | "PSX Vertex Snap" add-on (he calls it free; the page doesn't show details) | not needed: we do it in the three.js shader (see below) |
| DripsPsxEfx (Blender Market, $18) | node pack: vertex wobble, texture wobble, colour crush | not needed: we do all three in our shader |
| GIMP / After Effects dither tutorial | colour reduction and dithering | we already dither in post; GIMP's indexed palette we do with Python (PIL) |

## Techniques
- **Modeling**: geometry only for performance; the texture does the heavy lifting (a crate = a cube). PS1 characters have **one single loop at the knees/elbows** and "crush" when they bend (the toothpick effect): that's authentic, don't add loops.
- **Textures**: downscale to **120–240 px** (props at 120). Then **indexed palette of 8 colours** (16 if it has many colours) with **Floyd-Steinberg dithering**; no dither on flat-shaded models (it leaves speckles). Filter **Closest** (PS1) vs Linear (N64, blurry).
- **Vertex colors**: colour per vertex blended as a gradient (Crash Bandicoot used no textures). Use: **fake lighting** = `Color Attribute` × image in Multiply (factor 1), paint white where the light hits and black in the corners → fake AO/shadow with no real light. Ideal for rooms.
- **Vertex snapping / wobble**: PS1 vertices only took whole positions → the geometry trembles. Add-on: a 200-unit grid (max 406) over the scene + a modifier on each object; the grid gets a *Damped Track* constraint (X) to the camera so it also wobbles when the camera moves.
- **Settings**: View Transform **Standard**; Film → **Filter Size 0** (no anti-aliasing, jagged edges); **≤30 fps** (12 fps stylised, 24–30 faithful); AO, SSR, motion blur and bloom **off**.
- **Low resolution**: resolution ÷4 (~480p), or compositor `Scale 0.25 → Pixelate → Scale 4` to deliver 1080p while keeping the pixels.

## What it adds to our pipeline (base: NETO512 + sinaboto)
1. **Vertex snapping in the vertex shader** (snap `gl_Position` to the 360×640 grid) → authentic PS1 wobble, free and also with the camera moving.
2. **Indexed palette + Floyd-Steinberg** on Flow textures (PIL `quantize`) before downscaling: today we only downscale.
3. **Vertex colors for fake AO** in sets (rooms, corners) instead of more real lights.
4. Confirmed things we already have: Standard, no AA, low res, dithering, Closest.
