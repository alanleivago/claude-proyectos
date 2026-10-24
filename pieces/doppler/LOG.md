# LOG — The Doppler Effect

## Run 1 (2026-10-21)
- From reference 10 (Spanish, 1:34) → English, natural script, real numbers (767/644 Hz, 3 notes, Mach 1 km/h) and the Andromeda exception (blueshift) added. Take 91.0s.
- Voice split bug: "sonic | boom" — the cut landed on the plosive closure of "b". split_voice.py now never cuts before the previous line's last heard word ends; rule added to memory.
- Storyboard fix: the keyboard over the BEHIND bar (bars hidden during the numbers).
- Review caught and fixed: 2 text overlaps; 5 stills (the steady ring pattern repeats exactly → slow pan + camera holds); the arc inverted by the track itself (quiet passage under the payoff) → track started at 0:22, `shape_track.py --bye` (new option) −6.5 dB.
- Final: story arc 5/5; loudest 100ms 58.9s (−6.5 dBFS) on the boom, 0.5s silence before it; text PASS; dead beats PASS; −14.1 LUFS, TP −1.2; deterministic.
