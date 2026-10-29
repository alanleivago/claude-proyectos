---
type: brief
status: active
tags: [scroll3d, face-id, truedepth, scroll-engineer, remake]
relatedTo: [styles/scroll3d/STYLE.md, pieces/maps, pieces/airtag]
---
# Cómo te ve Face ID — brief

**Style:** scroll3d, dark room. **Format:** 9:16, 1080×1920, 30 fps, 77.27 s.
**Source:** Spanish remake of @scroll.engineer #5 (Face ID, 2026-10-09, 76.5 s; `Ref Scroll animations/5-faceid.mp4`): 18 shots on one near-continuous orbit, re-timed through 40 line anchors.
**Voice:** VoiceStudio "scroll 2 buena español", 7 paragraph takes ("Veamos." trick), 22 lines 1:1 with the reference.

## The head (user, 2026-10-27: "la cara más parecida a la de la ref")
"Infinite, 3D Head Scan" by **Lee Perry-Smith**, CC BY 3.0 (based on a work at triplegangers.com; files from the three.js examples). Credited on screen ("ESCANEO DE CABEZA: LEE PERRY-SMITH · CC BY 3.0"), as the reference does. Geometry packed losslessly into `assets/head-geo.png`, colour and normal maps in `assets/`, originals and licence in `ext/` (kept local). Densified ×9 with Phong tessellation (`src/headscan.js`). A sculpted female head (`src/head3d.js`) was the first try; the user preferred the reference's face.

## Changes from the reference
Status pill BLOQUEADO / DESBLOQUEADO instead of the lock glyph; a drawn TrueDepth lock screen; dots in IR red, depth map cyan-white; matched features as green rings; Spanish notes; ALTERBASE end tag.

## Sound
Documentary track, silent 1.15 s before "se desbloquea", +3 dB on it; code SFX ×3.5; 18 recordings (`sound/layer.py`).

## Claims and sources
- TrueDepth projects and analyses thousands of invisible dots to build a depth map and captures an infrared image; compared in the Secure Enclave with the enrolled data; works in total darkness — [Apple Support: About Face ID advanced technology](https://support.apple.com/102381). The "over 30,000 dots" figure is third-party ([Wikipedia](https://en.wikipedia.org/wiki/Face_ID)), so the piece says "miles".
- Dot pattern, depth colours and mesh: illustrative (notes on screen).
