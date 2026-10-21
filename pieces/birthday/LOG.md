# LOG — The Birthday Paradox

## Run 1 (2026-10-14)
- From reference 7 (Spanish, 52s) → English, reworded, extended with creative beats on request: your-birthday 6%, pairs growing 1 → 45 → 253, 100,000 simulated rooms, a football pitch (22 + referee), comments that keep arriving.
- The user asked for ~62s; Mad 3 read the script slower (65.5s take) → 68.1s with the tightest pauses (0.1s; 1.1s before the hit).
- Review caught and fixed: the riser running into the silence; the "gut" thud louder than the hit; text overlaps (183 × people, captions crossing, the date pills × 50%); stills (ring rotates and twinkles, six flickering pairs, a reader dot on the curve, a ball on the pitch, comments scroll and a typing indicator); the matching comments scrolling out of view.
- Final: story arc 5/5; loudest 100ms 33.5s (−9.2 dBFS) on the hit with 0.6s ≤ −40 dBFS before it; text PASS (19 safe-zone warnings: centred frame); dead beats 1 WARN (63.3–66.5s, the comments); −14.0 LUFS, TP −1.5; deterministic.
- Weakest: the ending (comments) is the stillest stretch; the silence before the hit is short (0.6s).

## Run 2 (2026-10-14) — voice cuts
- User: never cut the voice inside a word or mid-phrase (this and all future videos). split_voice.py rewritten: cuts at the middle of the longest silence (< −45 dBFS) between a line's last heard word and the next line's first, digits spelled out before alignment (fixed "Twenty-three." landing in the next line and "ninety-nine point nine" splitting off), 8 ms fades. Every line re-transcribed: each holds exactly its sentence.
- Voice now 66.4s. Review: story arc 5/5 (silence act ends 0.1s before the hit so the hit's first window isn't counted as silence), loudest 100ms 31.2s on the hit, 0.6s silence before it, text PASS, 1 dead-beat WARN (ending), −14.0 LUFS.
- To check by ear: in "grow" whisper hears "twenty-three make two hundred fifty" (no "three") in the take itself.
