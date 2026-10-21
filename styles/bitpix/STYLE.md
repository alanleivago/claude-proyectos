# bitpix — the dark data explainer (series "Bitstory")

A narrated explainer on a near-black navy ground: crisp vector objects built from many small parts (planks, dots), three neon inks that each mean one thing, small mono data labels and a large serif voice for captions. One stage, no hard cuts: things break apart, fly and reassemble into the next idea (a ship's planks become the dots of a person). English narration (Algrow voice "Mad 3"), the user's documentary track underneath, sound effects synthesized in code. Motion on 1s with springs.

Made from the references in `Ref bit y pixels/` (Spanish data-explainer shorts; kept local, never published or credited).

**Proven on:** `pieces/theseus` and `pieces/learn` ("How a Machine Learns", 2:11, a real 151-weight network trained in code). First: `pieces/theseus` — "The Ship of Theseus", 60s, 9:16, approved by the user on 2026-10-12: *"this is the style and the level for these videos"*. That piece is the quality bar: every new Bitstory video starts from `template/` (its full source) and must look and sound at least as good.

## How to make the next video
1. **Story** (skill step 1): pick one of the reference videos (`Ref bit y pixels/1–5.mp4`), transcribe it (whisper), rewrite it in English **in our own words** (never a literal translation), web-check every claim, ~170–190 words for ~60s. Format F2 (fixed stage, voice-led). Find the device: one object made of parts that changes colour/owner, breaks into the next idea and comes back changed at the end.
2. **Start the piece:** copy `template/piece.json`, `template/src/` and `template/voice/script.json` to `pieces/<name>/`; replace the script lines (ids are the cue names), the scenes, `SFX_CUES` and the beats in `head.html`.
3. **Timing voice:** `node <skill>/tools/voice.mjs pieces/<name> --scratch --rate 1` to animate before the real voice exists.
4. **The real voice:** give the user the script as one block (blank line between lines, numbers spelled out). They generate it on the Algrow web with "Mad 3" (`eleven_multilingual_v2`, speed 1.0, stability ~0.5) and save the MP3 in `Ref bit y pixels/voces/`. (The Algrow MCP refuses TTS on the user's Starter plan.) Then:
   `python styles/bitpix/tools/split_voice.py "<mp3>" pieces/<name>` (it cuts **only in silence, never inside a word**: at the middle of the longest pause between one line's last heard word and the next line's first, with 8 ms fades; it spells whisper's digits out so numbers align; it warns when a boundary has no real silence. Then re-transcribe every cut line and check each holds exactly its sentence — Mad 3 sometimes drops or merges words; make script.json match what was said) → `node <skill>/tools/voice.mjs pieces/<name>` → rebuild. Pauses (`after`) 0.15–0.3s: **the voice is continuous, no long pauses**; the only deliberate pause is ~1.0s before the payoff line (the silence before the hit).
5. **Music:** if the track is shorter than the piece, extend it with a 2s crossfade from its second half (ffmpeg `acrossfade`), then
   **shape:** `python styles/bitpix/tools/shape_track.py pieces/<name> <question id> <payoff id> <goodbye id> --src "Ref bit y pixels/Documentary Background Music for Videos.mp3" --start 4` → `audio/track-shaped.wav`; piece.json `"music": { "file": "audio/track-shaped.wav", "fade": 1.5 }`, `"voice": { "file": "voice/voice.wav", "music": -7 }` (the user wants the music clearly audible). If the build-up act measures louder than the payoff (review STORY ARC), add `--dip <line id>:-4` to lower the music from that line to the question.
6. **Effects in code** (`src/score.js`, `to = 's'`, one per cue in `window.SFX_CUES`): wood crack per part torn off, knock per part landing, whooshes on moves, a sub + noise + chord stab on the hit, soft ticks for many small changes, key clicks for the signature. **No recorded SFX for this style** — the user tried the sound-layer option B here and rejected it.
7. Export `--share`, `review.mjs`. Narration density will fail by rule (Mad 3 speaks 3.6–4.8 words/s): accepted, the captions are short phrases, not subtitles.

## Measured from the references
- **Ground** `#0b1014` (76% of frame), panels `#131a24`, lines `#1b2835`, a faint 120px grid `#121a22`.
- **Inks (brightened on the user's request):** yellow `#ffd426` = the original / the old matter; mint `#1fffa9` = the new / the replacement; magenta `#e50673` = the question, the trap, the exception. Secondary: soft grey `#8b949c` for labels, text `#e4e3dc`. Never spend an ink on decoration.
- **Line:** 1.5–3px strokes on objects ~400–860px wide; parts separated by thin seams tinted from the part's own colour (`bpMix(c, ground, 0.72)`), not black.
- **Fill:** flat, no gradients; glow only on events (a part landing, a cell flipping, a highlight) and on the hero dots.
- **Text:** captions/questions in serif (Georgia stack, the pov3d serif; questions italic magenta), 74–92px; data labels in mono (Consolas stack) 44–54px; counters mono bold 92px; tags mono 46px letter-spaced at the top (y ≈ 322).
- **Motion:** on 1s; springs (`SPRING.snappy` for parts dropping in, `heavy` for camera and big moves); idle life always (water lines slide, the ship bobs and rolls, the sail billows, dust motes drift).
- **Composition:** one subject, **centred** (`SHIFT = 0`; the user prefers a centred frame even if it touches the TikTok icons — decided 2026-10-13; set `review.safe.right: 0`). Tags at the top, numbers under the object, captions in the lower third.

## Frame checklist (on top of grammar/FRAME.md)
- [ ] One object made of countable parts is the subject; it fills ~70–80% of the width when alone, ~40% when two are compared.
- [ ] Colour tells the story: you can say what yellow, mint and magenta mean in this frame.
- [ ] A number or label anchors the frame (a counter, a date tag, a pill) in mono.
- [ ] Captions are a short phrase, never a subtitle of the voice; large serif, inside the safe area.
- [ ] Something is alive: water, bob, motes, a glow fading.
- [ ] Parts that leave are *torn* (`bpSplinter` with jagged ends + `bpChips`), not capsules; parts that arrive drop in with a spring and a glow.
- [ ] No text cut off or overlapping (`review.mjs` TEXT must pass; safe-zone warnings are accepted — centred frame).
- [ ] The ending returns to the opening object, changed, with the **"Bitstory"** signature typed at the bottom ("Bit" mint + "story" magenta, mono bold 72px, y ≈ 1482, blinking cursor).

## Kit API (`kit.js`, prefix `bp`)
- `BP` palette and fonts; `bpMix(a, b, u)`, `bpA(hex, alpha)`.
- `bpText(str, x, y, size, color, { font, align, italic, weight, alpha, frac, glow, spacing })`, `bpLines(lines, x, y, size, color, alpha, o)`, `bpPill(str, x, y, size, color, alpha)`.
- `bpGround()`, `bpVignette()` (in `STYLE.post`), `bpGlow(x, y, r, color, a)`, `bpDot(x, y, r, c, a)`, `bpWater(y, o)`.
- `bpShip(x, y, s, { c, plank(i) -> { c, dx, dy, rot, a, glow, hide }, rigA, sail, oars, phase })`, `bpPlanks(x, y, s)` (38 plank outlines in 7 rows), `bpSplinter(P, cx, cy, x, y, rot, c, a, jag, key)`, `bpChips(x, y, u, c, key)`, `bpLoosePlank(...)`.
- `bpPersonDots(h, gap)` (a human figure as hex-grid dots, parts tagged `head` / `body`), `bpTimeline(x0, x1, y, u, la, lb, c, a)`.
- Piece-side patterns worth reusing (in `template/src/`): `OV()` screen overlays with the left shift, `win(t0, t1)` fades, `VL(id)` / `VW(id, word, n)` voice cues, a burst of parts into dots along quadratic arcs, a push-in on a detail, `SFX_CUES` as the single source for sound timing.

## Do / don't
- Do act the idea out with the parts themselves (planks swap, dots flip, dots rise into a word).
- Do keep the voice continuous and land each change on the word that names it.
- Don't add gradients, 3D, textures or photos; don't put glows on labels; don't use more than the three inks.
- Don't use recorded SFX or composed music for this style; the music is the user's documentary track.

## Not matched from the references
- Their typography is all mono; ours uses serif captions (the user's choice).
- Their pace has longer pauses; ours is a continuous voice.

## Tools
- `tools/split_voice.py` — one Algrow take → one wav per script line (whisper alignment).
- `tools/shape_track.py` — the music track shaped to the story from voice.json.
- The skill's `tools/voice_words.py` was patched (2026-10-12) to decode audio with ffmpeg; faster-whisper's PyAV decoder fails on this machine.
