# hombres — log

## 2026-10-16 — story, faces, board (2 rounds), build
- Reference studied (references/men). Story approved; title "¿Qué pasaría si todos los hombres de la Tierra desaparecieran?"; end card = reference text + share arrow + ALTERBASE.ESP.
- New code base (not the luna world): core3d.js (stages, renderer, post), people.js (hero rig with a real face: eyes/iris/pupil/highlight/lids/lashes/brows, a rebuilt mouth with lips and teeth, cheeks, tears; hair styles; pregnant belly; hands), shots*.js (18 locations), overlays.js.
- Board notes applied: bigger arena crowd; the street continues behind Lucía; a detailed cockpit; parliament chairs + flowers; supermarket gondolas; pregnant belly; Ana on the bed edge; bigger end card; share arrow.
- Render: 300-frame chunks (fast: ~0.25–2.3 s/frame). Sound: recordings per scene + code beeps, buzzer (the payoff at 10.0 after 0.55 s of silence), caution, power down/up, fetal heartbeat, end tone.
- Review: story arc PASS 5/5 (acts re-labelled: arena = payoff, chaos = peak), text PASS, loudest 11.2 s (buzzer) after 0.6 s of silence. The F2 morph-chain checks don't apply (hard cuts between locations). qa: loudness/TP pass; the "offset" check fails only because its probe lands on the periodic buzzer (−245 ms = one alias); manual cross-correlation at 20/66/160 s = 0 ms.
