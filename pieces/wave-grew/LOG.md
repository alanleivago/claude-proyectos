# wave-grew — LOG

## 2026-10-24 — intake, story, setup
- Studied the 7 most-viewed reference videos (Minute Zero 1.9M ×2, AfterTheDoor 1.48M/231k, Minute Zero 355k/241k, frame-onee 190k): one continuous POV shot, low-poly soft light, HUD top-left + top-right, italic caption, no voice, ~−21 LUFS, LRA 2.9.
- Topic search: 36 queries; picked "a wave grew" (no existing video). User approved the story (8:30, EN, teaser at the start like Minute Zero).
- New style `styles/pov3d-hd/` (kit.js: hdHud/hdCaption/hdCard, layout measured ×1.5 from 720p refs).
- Core: core3d.js (renderer, rideCam, wave sheet with folded lip + plume, rider overlay: board + soft hands). Stages split to 3 agents (near / high / space), contract in AGENTS.md.

## 2026-10-25 — look v2, board, fixes
- User: "too polygonal" → detail bar = ref 4pjb8dBlTM0 (Minute Zero "Jumped Higher"). Round 2 by the 3 stage agents (leafy billboard trees, detailed houses, soft sprite clouds, smooth mountains, drained seabed with ships, scattering atmosphere, refracting wave glass, big Moon at the hit).
- Lead: glass HUD panels (ref ylnTesFVoOo) + glass fact cards with "record vs your wave" bars; wave micro-ripples, lace foam, subsurface; smooth parametric board; hands palm-down; board climbs the face (BOARD_POS) + less pitch so land fills the frame; HIGH→SPACE dissolve 287–291.
- Look v2 approved. Music: user picked Floating Cities (K. MacLeod, CC BY 4.0) — tone is awe, not comic.
- Storyboard (52 panels) approved with fixes: tube/sky wash at 22–29 (near), whiteout too early (near), 429–455 plain (space), seam (lead), end card moved up + "relax, this could never happen... / could it?".
- Sound: "sonido pro" pipeline delegated (Freesound/Commons + synth layer + earshot), output audio/final.wav.

## 2026-10-25 — export + review
- Export: 15,300 frames in 14,154 s (5 workers, ~0.93 s/frame effective). Muxed with audio/final.wav → renders/final.mp4 (1.29 GB) + renders/share.mp4 (x264 crf 18, 774 MB).
- Sound (pro pipeline): −14.0 LUFS, TP −1.8 dBTP (AAC), LRA 6.2; loudest 7:48–7:51 (−5.7 LUFS momentary) after 0.65 s at −67 LUFS; 46/46 licences OK; credits in audio/CREDITS_description.txt.
- earshot timeline: hit sync −5 ms; 88% of cuts within 1 frame; 120 BPM pulse clear.
- textcheck (every 2 s, 266 frames): PASS. review.mjs shot sheets fail here (ffmpeg has no drawtext) — contact sheet made by hand, looked at.
- Weakest: 7:09 (flat ridge before the Moon grows), 484–488 tube sound reads slightly synthetic.
