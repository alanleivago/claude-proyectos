# LOG — The Ship of Theseus

## Run 1 (2026-10-11/12)
- New style `bitpix` made from `Ref bit y pixels/` (5 videos, measured: ground #0b1014, accents mint #00e992, magenta #e50673, yellow #e2bd1c). Ship matched against ref 5 (compare sheet `references/bitpix/cmp-1.png`): flatter hull, 7 rows of long planks, tall curls.
- Story, look and storyboard approved in one pass each. User asked for the pov3d serif and a "Bitstory" signature at the bottom of the end.
- Algrow `list_voices`/`generate_tts` refused: account on Starter plan. Built with a scratch SAPI voice (`voice.mjs --scratch --rate 1`, 66.1s).
- Review caught and fixed: ships inside the right phone-UI strip (stage shifted 40px left, ships smaller); counter over the Athens timeline; cortex labels on the circle; two caption overlaps; "Bitstory" under the bottom UI; the Hobbes act louder than the payoff (score rebalanced); only 0.3s of silence before the hit (now 1.9s); three dead stretches up to 9s (30-oared galley pill, ship glow when named, slow pushes on the two ships and on the cells); the hit not visible as a picture event (mint flash + ring).

### Numbers (final)
- review: story arc 5/5 PASS, text PASS, dead beats PASS, 0 hard cuts, loudest 100ms at 36.7s in the payoff act, 1.9s ≤ −40 dBFS before it, −13.9 LUFS, true peak −1.5 dBFS, deterministic: true.
- narration density FAIL (scratch voice: lines 3, 7, 9, 10, 15–17 over 3.5 w/s) — recheck with Mad 3.
- sound-layer qa: 10 FAIL "audible" (wood knocks / keys masked under the scratch voice by 0–1.2 dB), 26 warnings (fast plank runs: motion doesn't stop at each knock — expected). Recheck with the real voice.

### Per-shot PASS table
| shot | t | PASS | note |
|---|---|---|---|
| 1 planks | 0–11.6 | PASS | rot + swap readable; fast run reads as a flurry |
| 2 athens | 11.6–19.5 | PASS | Plutarch pills small at phone size — weakest |
| 3 hobbes | 19.5–33.4 | PASS | rebuild of ship B is the best moment |
| 4 which | 33.4–36.65 | PASS | silence 1.9s |
| 5 you | 36.65–44.5 | PASS | burst + cells turnover |
| 6 cortex | 44.5–51.3 | PASS | labels left of the circle |
| 7 same | 51.3–59.4 | PASS | |
| 8 end | 59.4–66.1 | PASS | reflection reads as a figure only loosely |

**Weakest shot:** 2 (Athens) — the Plutarch pills are small and short; a bigger "same ship / not the same" split (two pills at 48px over the ship) would fix it. Second: the reflection in 8 could use a clearer head.

### To do
- Swap in the Mad 3 takes (one file per line in `voice/`, `"file"` in script.json), `voice.mjs`, rebuild, export, `sfx.sh`, review.

## Run 2 (2026-10-12) — user notes
- Brighter inks (yellow #ffd426, mint #1fffa9), thinner seams tinted from the plank colour.
- Torn planks: the plank's own curved outline with splintered ends and grain (`bpSplinter`), a dark hole for 0.22s, chips thrown off (`bpChips`); the rebuilt ship's planks fly in splintered and settle clean.
- Text and elements ~20% larger (captions 74–92px, labels 44–54px, timeline 8px, dot person 900px tall with 11px dots).
- "younger than you" and "almost." at the top; cortex labels to the right of the circle; "Bitstory" lower (1482) with a shorter reflection.
- Sound, option B: composed score removed. Music = the user's track from 0:04, shaped to the story (`sound/shape.py`: −2.5 dB build, out on the question, silence, 0 dB payoff, −3 dB goodbye). Recorded bed (sea, dock lapping, ship creaks; `sound/bed.json`). Real hits: wood split on the first tear, twig snaps for the rest, knocks for landings, a 3-layer hero hit. Mixed by sound-layer `mix.py` (added an optional per-cue `lift`), QA loop with `qa.py` until 0 failures. `sound/sfx.sh` runs it all and writes `renders/audio-score.wav` (track + sfx) for review.
- Numbers: qa.py PASSED (0 failed, 13 motion warnings in the fast runs); review: story arc 5/5, loudest 100ms at 36.8s (−10.2 dBFS) on the hit, 1.6s ≤ −40 dBFS before it, text PASS, dead beats PASS, −13.8 LUFS, true peak −1.5 dBFS. Narration density still FAIL on the scratch voice.

## Run 3 (2026-10-12) — the real voice
- User: real-recording SFX don't fit this style → back to synthesized effects (`src/score.js`, sfx bus, one per `SFX_CUES` cue: crack per torn plank, knock per landing, whooshes, a sub + stab hit, cell ticks, keys). sound-layer pipeline removed from the piece.
- Music: the user's track from 0:04 as piece.json "music" (`audio/track-shaped.wav` by `audio/shape.py`, from voice.json: out over "which", silence to the hit, +1.5 dB payoff, −2.5 dB goodbye), louder under the voice ("music": −7, was −12).
- Voice: Algrow "Mad 3", one 57.4s take (`Ref bit y pixels/voces/`), cut into 17 lines at whisper word starts (`voice/mad3/`), pauses 0.15–0.3s (1.0s before "You are that ship" for the silence). 60.1s total. `tools/voice_words.py` patched to decode with ffmpeg (PyAV in faster-whisper was failing) → 174/180 words heard.
- Review: story arc 5/5, loudest 100ms on the hit (32.8s, −8.2 dBFS) with 0.9s ≤ −40 dBFS before it, text PASS, dead beats PASS, −14.0 LUFS, TP −1.5. Narration density FAIL by rule (Mad 3 speaks 3.6–4.8 w/s) — accepted: the style wants a continuous voice; captions are short phrases, not subtitles.
