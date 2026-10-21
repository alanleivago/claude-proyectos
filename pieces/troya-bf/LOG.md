# troya-bf — LOG

Remake of `Ref amphora mitologia/5.mp4` (Odysseus, the wooden horse, the guilt of victory). 9:16, 68.75s, 24fps, style amphora-bf.

- Look: 19 Nano Banana 2 layers made with the Google Flow MCP, one at a time, `Odysseus.jpeg` as the style reference (`@{odysseus}`), each subject on flat magenta, keyed with vox-doc `key.py` (gen/ -> cut/ -> assets/, cropped to content). Ribbon from `Ref/ribbon.jpeg`, green-keyed.
- Captions: ITC Garamond Std italic 92px (user, replaced 1689 GLC Garamond), shrink to fit 780px; timed to the ref's ~1.1s chunks, sentences completed so it reads without a voice.
- Motion in code: camera pans/pushes and float, parallax (siege, march), walks (bob + rock), horse built plank by plank (clip), ladder + men climbing in, drag with rope, hatch + climb-down, gates hinged at the frame edges, painted flame rows + code flames, cloud smoke, embers, eagle, Zeus' bolt + flash, ship rocking on wave bands, ribbon unrolling from the centre with travelling rolls + glinting name, AMPHORUS sign-off.
- Sound: Odysseus bgm (audio/track.wav, from alcibiades-bf) gain +7, code SFX; -13.6 LUFS, peak -1.5.

## Review (2026-10-20)
- text: PASS (0 cut-off/overlap, 0 in the safe zone) after fitting the long captions
- dead beats: PASS; deterministic: true
- narration density FAIL (>3.5 words/s): inherited from the ref's caption pacing
- story arc: 1/6 — the loudest moment (38.3s) is in the fall, which is the real payoff; act roles in head.html are approximate
- export needs ffmpeg-full on PATH for review sheets (default ffmpeg has no drawtext/subtitles); export used --no-captions

## v2 (2026-10-20, voice)
- Voice: user's single take cut at word gaps with references/voltamps/tools/cut.py (system python3; the VoxDoc venv's PyAV is incompatible). Zero-gap joins (son|to, Odysseus|opened) not cut: lines merged, scenes change on VW('home','sail') / VW('night','opened'). Pauses per line in voice/script.json (1.0s before the fire).
- Strip slides right between scenes (as rhaenyra), friezes fixed; captions ride their panel and fade before each slide.
- Captions: Ludovico W03 Woodcut — Chromium only resolves it as "LudovicoW03-Woodcut" (PostScript name); 100px, letter-spacing 5px, drop shadow, written by hand (slanted pen-edge clip per word, timed to the word).
- Ribbon: "The Odyssey", clipped to the band. Apple lowered to y 880, AMPHORUS to 1250. Music gain 10 (SFX ~3 dB lower), voice.music -4.
- Review: text PASS (0 cut-off/overlap/safe zone), dead beats PASS, -14.0 LUFS, peak -1.5. Narration density FAIL (the user's pace, ~3.4-4.2 w/s on some lines).
