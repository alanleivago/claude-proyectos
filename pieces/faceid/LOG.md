---
type: note
status: active
tags: [scroll3d, face-id, log]
relatedTo: [pieces/faceid/brief.md, pieces/maps/LOG.md]
---
# faceid — log

## 2026-10-27 — story, voice, look, board, build
- Reference @scroll.engineer #5 (Face ID, 76.5 s, 2 cuts, 22 lines). Script approved. Voice 77.27 s, 7 takes ("Veamos." trick), no words lost.
- First head: a code-sculpted woman (agent, `src/head3d.js`). User: "quiero la cara más parecida a la de la ref y los efectos" → the reference's own scan, Lee Perry-Smith (CC BY 3.0, three.js examples), credited on screen. GLB geometry packed into a lossless PNG (the build embeds only images), decoded and Phong-tessellated ×9 in `src/headscan.js`; recentred on the head (the scan includes shoulders), scale 0.046.
- Review: story arc 4/4 · text PASS (fixed: two mesh tags overlapping as the meshes merge) · dead beats PASS · loudest window on the unlock (56.7 s) with 1.1 s of silence before it · narration density FAIL (voice pace) · morph grid FAIL (voice-led).
- Master −11.3 LUFS, TP −2.3 dBFS; video 77.27 s, audio 77.20 s.
