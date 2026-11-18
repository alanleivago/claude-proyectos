---
name: digger-channel
description: "Chosen concept for our TikTok channel with zero_fem — \"The Digger\" robot archaeologist of human artifacts (+ some human body/habits videos)"
metadata:
  node_type: memory
  type: project
  originSessionId: b19cd1d9-332a-4ffd-91ff-b618e0ca55df
  modified: 2026-10-27T01:07:41.591Z
---

Character/channel name: **Mechayuki** (@mechayuki), chosen 2026-10-27 ("yuki" = snow). The user prefers the megagirl voice (user clone) WITHOUT the 'digger' filter (it sounded robotic). Outro over her goodbye shot with name + follow CTA, never a black end screen. Videos can run 80-100 s. Decided 2026-10-27. Persona: android from the far future, humans are gone; she digs up "human artifacts" (fridge, toilet, microwave, money…) and rebuilds them from scratch to understand them. Calls the viewer "Operator". Opening "Operator… I dug up another human artifact." Closing "Artifact understood. Logging off." Some videos apply the same concept to the human body and habits (Unit-07 angle).
Format from the 7-account research (`fuentes/tiktok-research/`, propuesta-nicho.md): ~70 s, ~240 words, absurd primitive hook, failure→fix chain with "This is a…" labels, viewer comment at 35-40%, "That's why your…" payoff + callback.
Voice: a FEMALE voice (she's part human, like Megaman). Measured (pieces/voice-fx/README.md): the refs have NO retro filter, just a high-pitched (F0 205-300 Hz) dry, compressed voice (-14 LUFS, low cut ~170 Hz), probably neural TTS; the retro feel comes from chiptune music/SFX. pieces/voice-fx/retro_voice.py has per-account presets + "digger" (adds a light PS1 layer). Don't clone the reference accounts' voices (no consent); use an original or consenting voice + the retro filter. Engine: pieces/zero-test (fx.js, captions, sky presets). Related: [[zero-fem-model]], [[script-format]].
Episode 01 "the fridge" produced 2026-10-26 (pieces/digger-01-fridge): engine/film.js (?v=megagirl|studio) drives 24 shots from the voice's word timings (timeline_<voice>.json via voz-studio/scripts/{gen2,assemble,prep_timeline}.py); audio/scripts/{music,mix}.py = code chiptune bed + Freesound CC0 SFX, -14 LUFS; engine/render_film.mjs renders the mp4. megagirl (user clone baab32b2, F0 ~307 Hz raw) sounds best with retro_voice 'digger' ('genre' reads as beeping in earshot). Details in LOG.md.
Update 2026-10-26: channel/character name chosen = **MECHAYUKI** (@mechayuki). Only the megagirl voice is kept. The user found retro_voice 'digger' too robotic: use the clean chain (genre --eq 0: HPF 170 + comp + -14 LUFS). The TTS can't do rising wh-questions (fix with a PSOLA ramp on the last word). Labels use engine/pixfont.js (Pixelify closes C/E at small sizes). Don't end on a black screen: put the outro + follow CTA over her goodbye shot. Ep.01 v2 = digger01_megagirl_v2.mp4.
