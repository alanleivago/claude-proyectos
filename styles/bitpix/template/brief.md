# The Ship of Theseus — brief

- **Format:** 9:16, 1080×1920, 24fps, ~66s, voice-led (English). F2 fixed stage (the sea), no hard cuts.
- **Style:** `bitpix` (new, from `Ref bit y pixels/`): navy ground #0b1014, faint grid, crisp vector shapes with dark seams; yellow #e2bd1c = original matter, mint #00e992 = new matter, magenta #e50673 = the question. Serif (Georgia) for captions, mono for data labels. Motion on 1s with springs.
- **Device:** the planks turn mint one by one; both ships burst into the dots of a person whose cells turn over; the word "same" splits into matter and story; the ship returns with the person as its reflection. Signature "Bitstory" at the end.
- **Voice:** script in `voice/script.json` (rewritten in English from reference 5, reworded). Scratch OS voice for timing; final voice = Algrow "Mad 3" (blocked: account on the Starter plan, TTS needs Professional).
- **Sound:** documentary score composed in code (`src/score.js`: D minor piano arpeggios, pads, a pulse in the Hobbes act, 1.9s silence, chord stab + sub on the hit, D major after). Effects = real CC0 recordings from `sound-layer/kit`, placed from `window.SFX_CUES` by `sound-layer/scripts/mix.py` (cue sheet `sound/cues.json`).

## Beats
| # | t | beat | bridge |
|---|---|---|---|
| 1 | 0–11.6 | one plank rots and is swapped, then all 38 (counter) | old planks fly off top-right |
| 2 | 11.6–19.5 | Athens, 30-oared galley, repairs over the centuries, Plutarch: same / not the same | — |
| 3 | 19.5–33.4 | 1655 Hobbes: the old planks fly back in and build a second ship; two labels | — |
| 4 | 33.4–36.65 | "Which one…?" then silence | the hit: flash + ring |
| 5 | 36.65–44.5 | planks burst into a dot person; cells turn mint, day 0→90 | push-in on the head |
| 6 | 44.5–51.3 | almost: the cortex stays yellow, circled | dots rise into the word |
| 7 | 51.3–59.4 | "same" → same matter (yellow ship) / same story (mint ship); pulled apart | the two merge |
| 8 | 59.4–66.1 | the ship again; its reflection is the person; "You were never the planks." + Bitstory | — |

## Claims and sources
- Athenians kept Theseus's thirty-oared galley, replacing rotten timbers; philosophers argued over it — Plutarch, *Life of Theseus* 23: https://lexundria.com/plut_thes/23/prr
- Hobbes's version (old planks reassembled), *De Corpore*, 1655 — https://www.britannica.com/print/article/2195856
- ~330 billion cells replaced per day; the body's total in ~80–100 days — Sender & Milo, Nature Medicine 2021: https://www.scientificamerican.com/article/our-bodies-replace-billions-of-cells-every-day/ , https://wis-wander.weizmann.ac.il/node/11205
- Neocortical neurons are as old as the person (no detectable adult neurogenesis) — Bhardwaj et al., PNAS 2006: https://pubmed.ncbi.nlm.nih.gov/16901981/
- "c. 300 BC" = the ship kept until Demetrius of Phalerum (regent 317–307 BC); "Plutarch · c. 100 AD" = date of writing (approximate).
