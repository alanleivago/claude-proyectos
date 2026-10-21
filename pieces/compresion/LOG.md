# compresion — log

## 2026-10-16 — the scroll3d style, story, look, board, build
- References: `Ref Scroll aniamtions/1–5.mp4` (720×1280, 30 fps, 76–158 s, all −14.5 LUFS): Shazam, AirTag, Maps traffic, video compression, Face ID. The user chose #4 (91.8 s) and the rule for the style: same shots and camera moves, Spanish paraphrase, some elements changed; the user records the voice.
- Reference transcribed with faster-whisper on CPU (the CUDA build fails: no cublas64_12.dll; PyAV's `metadata_errors` kwarg breaks file input → feed it PCM from ffmpeg). Shots logged at 1 and 2 fps.
- Spanish script written to each English line's slot; user's take = 97.3 s (reference 91.8). `ANCH` maps 80 reference/Spanish word pairs; shots are authored in reference time R = refT(TT).
- Built: `styles/scroll3d/kit.js` (karaoke captions from VOICE, labels, leaders, white tags, FreeSans Bold everywhere); `src/world.js` (diorama rooms as clones of one prototype, ghost frames with code-drawn textures, block lattice, flat-picture mode from a render target, lifted block, cyan arc, 3,600-cube pixel column, 8,640-column voxel field, phone, raw/stream bars); `src/shots.js` (17 shots).
- `tools/build.mjs`: now embeds .ttf/.otf from `assets/` as FontFace (the user's font), held behind ASSETS_READY like images.
- Bugs fixed: wood texture dark (Color.getHexString(SRGBColorSpace) gave linear hex in r149 → mix hex by hand); floor black (bezel bottom z-fought the room floor at y = 0 → bezel moved out 0.03); oblique shots looked into deep boxes (→ flat picture of the room, filmed head-on into a render target, once the lattice appears); bezel shadow band on the wall (bezel casts no shadow).
- Look approved (4 frames), storyboard approved (14 panels), no changes.
- Export: 72 ms/frame with 4 workers (no slowdown seen in 600-frame chunks).

## 2026-10-17 — review
- First review: captions 20 px inside the phone-UI zone (moved y 1475 → 1438), 3 labels off the right edge (right-aligned at x 1040, opening camera recentred), 2 still stretches (camera drift on the two-frame shot, push toward the phone at the end), act roles (payoff = act 5).
- Final: text PASS (0 cut-off, 0 in safe zone) · story arc 5/5 · narration density PASS, word hits PASS · loudest 92.1 s −7.9 dBFS in the payoff, 1.1 s silence before it · −14.0 LUFS, TP −3.6 dBFS · dead beats WARN 23.2–26.4 s (3.2 s; the reference holds there too, "casi nada cambió").

| shot | PASS |
|---|---|
| 1 pila · 2 torre · 3 cuarto · 4 diorama · 5 detalles · 6 dos · 7 bloques · 8 vector · 9 píxeles · 10 suéter · 11 vóxeles · 12 diferencias · 13 reinicio · 14 montón · 15 recibes · 16 continuo · 17 final | all PASS on contact sheets and the phone sheet |

## 2026-10-17 — round 2 (user: "excelente", detalles)
- Code SFX up ~7 dB (sfxBus ×2.2). Music = the user's "Documentary Background Music for Videos" from 4 s (as bitpix), shaped: −1.5 dB, silent 90.9–92.0 s, +1.5 dB on "11 GB"; voice.music −7. 21 quiet real recordings from sound-layer/kit mixed into the track (`sound/layer.py`, credits in `sound/CREDITS.md`).
- Into / out of the sweater (0:55, 1:02): no hard cuts — push in until the knit fills the frame, dissolve (XFADE) into the voxel field seen from above at the same scale (voxels now coloured in the knit's chevron bands), crane down to the glide; back out the same way, one continuous pull-back to the room. Divider fades before the exit.
- End tag DOPAMENTES.
- Review: text PASS · story arc 5/5 · loudest 92.1 s −9.4 dBFS in the payoff after 1.4 s silence · −14.1 LUFS, TP −3.5 · dead beats WARN 23.2–26.4 s (as the reference).
