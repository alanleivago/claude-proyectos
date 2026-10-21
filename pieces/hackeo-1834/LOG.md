# hackeo-1834 — log

## 2026-10-12 — intake, style, story, look, storyboard
- References: 5 videos in `Ref posit pixel/` (576×1024, 24 fps, 91–174 s). Measured: pixel ≈2 px at 576 (≈3.75 at 1080) → world 270×480; navy bar `#010208`; sky blues `#5982b3 #7ea2c8 #aac2d8`; continuous stages with circular loupes instead of most cuts; captions typed ~30 glyphs/s. Study crops in `references/pixdoc/` (gitignored).
- New style `styles/pixdoc/` = the skill's pixel kit + a doc layer (docCaption, docText with Spanish marks via NFD, docLabel, docStamp, docIris, ptex, pbeam, pcloud, docMan, docBust, docShadow, docFloat, pshift).
- Story: reference 4 (the Blanc twins). Fact fixes: twins are François and **Louis** (not Joseph); gloves/stockings code unverified → "la prenda era la señal".
- Look check: approved after fixes (thicker semaphore, twins' labels apart, a passer-by that read as a third twin removed, quay gap under the river).
- Storyboard round 1 notes (user): more depth in the hills, maps cut top/bottom, routes need a proper draw-on, a floating camera like the reference, more detail and shadows in the court. Also a standing rule: always push animation past the reference.
- Round 2: parallax float everywhere; camera cranes down at the open; 4-layer hills with haze, perspective fields, path, fence, sheep, cast shadows, a marching line of sight; complete maps (England, Ireland, Spain, Italy, Corsica) with coast bands and paper grain only on land; routeDraw (ticks + pulsing head); map views push/zoom on springs; court rebuilt (shaft of light with dust, clock, bench panels, red presiding judge, gavel shake, evidence model with a red tag, twins in the dock). Approved.
- Note: `textcheck` only traces canvas fillText, so it cannot see the bitmap font — label placement was checked by eye on the board.

## 2026-10-12 — build, export, review
- Score: 8-bit documentary chiptune in D minor (pulse 12.5/25/50 % via PeriodicWave, triangle bass, noise drums), theme on 50 % pulse with vibrato; sfx: arm clacks, caption typing ticks, hooves, stamp, coins, gavel, data chirps. Silence 28.0–29.0, stab + sub at 29.0.
- Mix passes: (1) arc 3/6 — peak as loud as gift, goodbye not decaying; (2) 4/6; (3) 5/6 — build p90 from the 3.5–7 s triangle bass (found by 100 ms stem scan); (4) 6/6.
- Captions shortened where > 3.5 words/s (map, operator); court caption moved to 48.05–49.45 (was readable complete for 0.07 s).
- Tooling: the Homebrew ffmpeg 9.0.2 has no `drawtext`; review ran through a scratch shim that strips the timestamp labels from the sheets. Loudness normalised at delivery with ffmpeg loudnorm + limiter from `audio.wav` (-16.5 LUFS, -1.4 dBFS peak).
- review.mjs: cuts 16/16 on the grid; story arc PASS 6/6; loudest 100 ms 29.0 s (-7.2 dBFS) in the payoff act after 1.1 s ≤ -40 dBFS; dead beats PASS; text PASS (bitmap font not traced — checked by eye on phone.jpg). Flat frames 1188–1191 = the deliberate black before "PERO HACKEAR NO ERA DELITO".

| shot | verdict | note |
|---|---|---|
| 1 roof | PASS | crane-down float, clacks |
| 2 arms | PASS | 50 / 87 labels |
| 3 book | PASS | finger to line 87 |
| 4 hills | PASS | depth layers, line of sight, operator loupe |
| 5 map | PASS | route lights up, stamp |
| 6 bourse | PASS | twins, shadows, clerk in arcade |
| 7 coach | PASS | trail + day counter; coach small on the map |
| 8 error | PASS | ERROR, then held breath |
| 9 trick | PASS | white frame, red symbol, LIMPIA |
| 10 bribe | PASS | zoom, parcel trail, garment loupe |
| 11 relay | PASS | red route, trembling spyglass |
| 12 buy | PASS | coach arrives, price up |
| 13 years | PASS | pulses, coins, sick-bed loupe |
| 14 court | PASS (weakest) | twins small in the dock; 1.5 s shot |
| 14b black | PASS | |
| 15 law | PASS | paper drops, towers become masts |
| 16 today/title | PASS | red packet, insider, dusk roof callback |

Weakest: the court (short, small twins) and the coach on the map (tiny sprite). Not verified: how the score sounds (measured only).

## 2026-10-12 — round 2 (user notes): 70 s, bass bed, zoom open, red flash, louder sfx
- Notes: bass chords under the melody like the reference; things pass too fast (court and others) → +10 s; the opening is a zoom, not a float; the reference flashes the arms red on "hacked"; more present sfx for numbers etc.; music must start at 0.
- Measured the reference audio: a continuous low end (20–200 Hz) and held chord tones (200–700 Hz) under the melody; ours was staccato with gaps. New `bed()`: per bar a held 50 % pulse bass + sine sub an octave down + three held 25 % pulse chord voices (+ beat "pump"), from frame 0. Spectra now match in shape.
- Timing: each shot now has a story time (o0, oDur) and a speed k (head `SHOT_LIST`, `warp()`, `NT()`): bourse ×1.5, relay ×1.375, trick/bribe/law ×1.25, buy ×1.14; court 1.5 → 3.5 s (second caption + second gavel + the twins glance), black 1.5 → 2.5 s. New from the reference: "QUIEN SUPIERA EL PRECIO ANTES, SE HACÍA RICO" (coins pile, "MAÑANA: ?"), "CADA TORRE LO COPIÓ SIN SABER POR QUÉ", the jury's finding (source: hard2bit — the jury accepted the signals and bribes).
- Opening: a steady zoom (1.0 → 1.32) into the tower head; on "hackeada" the arms flash red with a red halo (flicker on/off), with a falling zap.
- SFX: label pops (two-note square + click), big-number triads + thump, typing ticks louder (12 % pulse), day/year counter ticks, stamp thump, ERROR buzz, coin, tower ticks on the map and relay.
- review: cuts 16/16 on grid; story arc 6/6; loudest 31.0 s (-8.0 dBFS) after 1.1 s silence; dead beats PASS; delivered at -15.3 LUFS / -1.5 dBFS.

## 2026-10-12 — round 3 (user note): chords out of time with the melody (audio only)
- Cause: the bed's chords changed every 2 s counted from 0 while sections and the theme start on x.5 s (chord changes mid-phrase); the theme was played stretched (×0.9 / ×1.1 / ×0.75, off the grid); in 3.5–10.5 the bed and the arp used different progressions; the old theme had an E over Bb.
- Fix: one harmonic map `HAR` ([section start, progression]); bars count from each section's start; bed, arps, drums (backbeat relative to the section) and theme all read it. Theme always at rate 1 on a section start, re-harmonised to Dm–Bb–F–C (chord tones on strong beats). Relay run and the masts' shimmer moved onto the 16th grid (41.5, 63.0); the title theme on the 67.0 Dm bar.
- review: story arc 6/6; loudest 31.0 s (-7.9 dBFS) after 1.1 s silence; delivered at -15.3 LUFS / -1.5 dBFS. Picture unchanged.

## 2026-10-12 — sound layer (opus-sound-layer prompt): recorded SFX
- `sound-layer/` was already in the project with its kit downloaded; installed `uv` (brew). Openverse search returns a Cloudflare 403 from here, so the three missing sounds came from pages with an explicit CC0 licence: coin drop (Vinrax, OpenGameArt), horse trotting #0610 (J. Sardin, BigSoundBank); the gavel uses the kit's heavy wood impacts.
- Cues exported from the picture's own timing: `soundCues()` in `src/scenes.js` (shot cuts, spring pose peaks, label `at` times, caption typing at 30×k glyphs/s, counters, loupes, gavel, coins, hooves) → `sound/dump.mjs` → `sound/audio/cues.json`. Music = the approved score's music stem (the synth sfx bus is dropped).
- Heroes (5): red flash 1.0, THE TRICK 31.0 (hit+boom, stop_before, build, a 0.37 s reverse ending on it), gavel 54.4, black 57.5, title 67.2.
- QA round 0: 88 audible FAILs, 4 hero-body, music dip 56.5–57.5, silence 29.89 (declared from 30.0). Round 1: energy punchy, typing 5 → ≤2 keys a caption, per-cue lift 5 / hero 8, silence_ok from 29.85 (the score really stops at 29.9), court/black music raised (bed 0.022 / 0.018 with chords), the stamp demoted to support → 13 FAILs. Round 2: brighter label click (3 kHz), brighter keys, 1 key per short caption, lift 6.5 → **9 FAILs left (all "audible": 7 typing keys, lbl-op, route0)**, 8 picture warnings on small labels. Passes: offset 0 ms, loudness -14.19 LUFS, true peak -1.79 dBTP, music no dips, silence none, all sync, all hero bodies and hero pictures.
- Deliverables: `sound/out/final.mp4`, `renders/final-sfx.mp4`, `renders/share-sfx.mp4`, `sound/audio/kit/CREDITS.md`, `sound/LISTEN.md`. The synth-sfx version stays as `renders/share.mp4`.
