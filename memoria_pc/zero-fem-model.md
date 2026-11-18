---
name: zero-fem-model
description: "Megaman Legends style model (bought from @dreamsbell, rights owned by the user) turned female in pieces/zero-fem"
metadata:
  node_type: memory
  type: project
  originSessionId: b19cd1d9-332a-4ffd-91ff-b618e0ca55df
  modified: 2026-10-29T00:03:09.160Z
---

`assets/crashsune/MegamanLegendsModel/ZeroVolnutt.blend` (~450 tris, 23-bone custom rig, one 192px texture, face painted in the texture). The user bought it and its rights from @dreamsbell, so no licence caveat is needed (2026-10-26).
`pieces/zero-fem/`: `lashes.py` (anime lashes on the texture), `feminize.py` (chest plate moved forward as one block so the green orb keeps its shape, narrower waist, wider hips and butt; previews rendered unlit with an Emission swap and a black world, like the author's Render.png) → `out/zero_fem.blend` + `.glb`.
2026-10-28: the user REJECTED the more feminine v2 body (pieces/zero-fem/v2: bigger bust, thighs, winged lashes) → use only the ORIGINAL v1 body; only v2's 5 new expressions (smirk, wink, soft smile, flirty, sweet surprise) are added to v1's atlas.
Pipeline (2026-10-27): feminize.py (incl. ponytail tilted down) → face/build_face.py (16-cell eye/mouth atlases, wild expressions) → anim/build_anim.py (30 actions incl. dig, face_tracks.json) → anim/zero_anim.glb. Test video engine: pieces/zero-test (270x480 ×4, 8.5% scanline, no dither, Pixelify Sans captions, soft Lambert shading toggle ?flat=1). MML2 ripped filler assets recolored in pieces/lib-mml (user accepts the risk).
User rules: keep her hair, face and face animation as they are; only add feminine lashes; make the body feminine WITHOUT deforming the design (no texture distortion); always preview unlit and flat (no Principled shine). Crashsune techniques (face atlas, poses, animation) can be borrowed for this model. The NETO/sinaboto girl ([[sinaboto-style]]) is paused; the user didn't want block hands on her.
