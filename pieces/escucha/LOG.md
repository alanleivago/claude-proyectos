# escucha — log

## 2026-10-20 — story, board, build
- Reference `9.mp4` (61.2 s, 15 shots). Script approved; the user's take 62.3 s.
- New world: room, sitters with a pose() rig (breath, blink, look, talk, gesture, nod), phones with CanvasTexture screens (lock + notification, home + battery + mic dot, search), router + Wi-Fi rings, app field (3,600 instanced icons, scan wave), ad network (500 dots, two busts), fryer, pin, arcs + sparks.
- Bug: my `paint()` and `arcPts()` shadowed kit/core.js functions → the page died at load ("a.clone is not a function") → renamed paintScr / arcPath. Rule: prefix piece helpers or grep core.js before naming.
- User: "mejora las animaciones de todo" → everything moves; "todas las transiciones seamless" → a dissolve at every shot boundary (both shots rendered, both cameras moving).
- Storyboard approved (15 panels).

## 2026-10-20 — render + review
- 1905 frames (~0.55 s/frame: dissolves render two shots). The last 39 frames crashed (R past the last shot's end → index −1) → fallback to the last shot.
- Text check: 6 labels off the edge / overlapping (tags near the right edge, the travelling ad card, two labels meeting in a dissolve) → tag() now measures its text and clamps it inside the frame; the card is clamped; labels fade out before a dissolve.
- Sound: the loudest window first fell on the "0 apps" moment (the music's own swell + a thump) → music −12 dB there, thump removed; music −4.5 under the voice, silent 0.8 s before "para una empresa de anuncios", +8 dB on it.
- Final: story arc 4/4 · text PASS · dead beats PASS · loudest 48.4 s (−8.6 dBFS) in the payoff after 0.9 s silence · −10.0 LUFS, TP −2.3 dB.
