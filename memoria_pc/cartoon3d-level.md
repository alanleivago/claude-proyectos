---
name: cartoon3d-level
description: cartoon3d APPROVED quality bar = pieces/apple-wayne v2 (2026-10-23); start every new cartoon3d short from it
metadata:
  node_type: memory
  type: project
  originSessionId: e3b19138-633b-4f91-a0e9-968a2b60dee4
  modified: 2026-10-28T00:30:00.681Z
---

The user approved pieces/apple-wayne (render renders/apple-wayne.mp4, v2) as the quality level for the cartoon3d style ("ahora sí quedó bien… guarda este nivel"). Every new short starts from its structure and must be at least this good; we keep improving from here.

What it is: piece split into src/scenes.js (common builders), src/shots.js (SHOT_LIST, per-shot c3Look, 6-frame dissolves, subtitles), src/set-*.js (one file per set, built by parallel agents in private copies), src/timewarp.js (untrimmed voice → original timeline), assets = Flow layers (faces fitted with tools/fit_faces.py, hair caps, fx glasses/beard/moustache). Sound: per-set events-*.json lists of every visible action → cues.json (~200 SFX) → sound-layer mix.py, music bed 18 LU under the voice, SFX bus +5 dB, master -14 LUFS. Voice now comes from VoiceStudio voice "3D cartoons".

Scripts: follow styles/cartoon3d/GUIONES.md — 61 s videos (~215-225 words); mostly timeless present-day scenes with a hidden-mechanism twist, period stories with dates allowed but a minority.

Deliverable: renders/final.mp4 must ALWAYS have the mixed audio (user got confused by the video-only final.mp4 that export.mjs writes). Rename the export to renders/video_only.mp4 and write the muxed file as final.mp4 (and <name>.mp4). phone-1pct (2026-10-23) approved as the second piece at this level. lego-sea (2026-10-25) approved third ("se ve y escucha todo equilibrado"): first with the HD finish and with the approved SFX balance — copy pieces/lego-sea/sound (make_cues.py: Freesound CC0 real recordings + kit, per-cue lift ~3; beds.py per-set ambience; remix.py: SFX ridden >= 3 dB under the voice short-term, music 18 LU / beds 20 LU under, -14 LUFS). (2026-10-27, future-library) Music: keep the pizzicato bed (Freesound 529008, Ricks-like) — user rejected a different track; voice a bit louder: music 20 LU / beds 22 LU under, SFX >= 4.5 dB under the voice. Always deliver a viral TikTok/Shorts title with every finished video (user 2026-10-27). Topics: check YouTube first that nobody did it (scripts/cartoon3d-guiones-03.md has the vetted list).

**How to apply:** copy apple-wayne's layout and pipeline for the next piece; follow [[cartoon3d-style]] and [[cartoon3d-rules-2]].

- (2026-11-01, mromidev tutorial study — fuentes/cartoon3d/tutorial-mromidev-gap.md) New opt-ins for every NEW piece (approved pieces untouched): `C3_CAMFX` (holds creep in, punch-word push, 4-5° rolls, 7-frame flip kicks on impacts; set `C3_SHOT = { id, t0 }` in drawShot/contCamAt), `C3_DOF` per-shot background blur (CU 7, MS 5, wides 0), `c3Fog(scene,'day',near,far)` in exteriors, `c3Grain(0)` (Ricks has no grain). QA: `python -I styles/cartoon3d/tools/short_qa.py final.mp4 outdir` (black/white/frozen/pops/loudness) + `sbs_sheet.py` side-by-sides vs Ricks frames. Measured reference reports in styles/cartoon3d/mromidev-ref/. User decided (2026-11-01): NEW pieces use `C3_VIVID = C3_VIVID_MRO;` (kit preset b 1.32 c 1.0 s 0.72 vib 0.3 → measured HSV S median 0.49, luma median 0.54, p5 0.20 = mromidev targets; check with `python styles/cartoon3d/tools/grade_stats.py video.mp4`) and NO grain (end the frame with `c3Crisp(0.6); c3Vignette(0.2);`). Export stays 1080x1920 — user said NO 2K. Approved pieces keep VIVID_DEF. One-off test: pieces/human-library is made with the mromidev Remotion pipeline (pieces/human-library/app) — not for any other piece.
