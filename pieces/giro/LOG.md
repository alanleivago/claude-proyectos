# giro — log

## 2026-10-13 — story, look, board (4 rounds), build
- Reference measured (`references/spin/`: 80 s; spectrogram = city → a rising wall of wind → a hard cut ~62 s → water/low tail).
- Round 1: luna's steep colonial street → user: "a city street like the reference". Round 2: flat city (avenue, crossing, brick/stucco/glass, traffic) → user: POV one floor up, more detail on bodies and cars, real cracks, cel shading, buildings stripped in layers that lean, far more debris, the wave carrying buildings, camera shake per event. Round 3: much bigger/deeper city (luna's sea moved 650 m back), camera also looks right (a boulevard), complete balcony railing, more people, sunlit. Round 4: a high sun, shops on every street-facing ground floor, 4 façade variants per material (atlas + per-instance aVar), cornices, AC units, fire escapes, a bigger title → approved.
- Rule saved: match the reference closely when asked (place, POV height, cel look, detail, chaos).
- Render: 280-frame chunks (~1.8–2.5 s/frame). QA fixes: the impact needed a clear picture cut in a very busy scene → one white slam frame at 61.8 + instant water/crack; silence window 60.5–61.7 declared; title narrowed out of the safe zone.
- Sound: city (traffic, crowd, horns, cars passing) → brake (quake, smash, glass, screams, car alarms, dogs + code groan/thump/cracks) → recorded gales + code wind wall rising to 60.5 with debris/metal/glass/collapses and a code supersonic boom (50.3) → water roar → silence → THE HIT (code sub + water slam + glass, falls burst, hero cue) → under water → low end tone.
- qa.py PASSED (−15.65 LUFS, TP −1.21). Review: see below.
