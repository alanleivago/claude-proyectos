# Props API (src/props.js) — contact sheet: dev/props/all-props.png, examples: dev/props/test.js
All `P_x(x, y, s, o)`, world coords, s = 1 ≈ natural size next to a 520-px actor, (x, y) = bottom-centre unless noted. Props take the mood's rim light. `o.dir: -1` faces vehicles left (text stays readable). Wheels roll with x unless `o.rot`. Ghost any prop with `ivGhost(() => P_truck(...), a)`. Grips come from ivMan `grip` / `hold`.

- `P_phone(x, y, s, o)` CENTRE, ~36×75 px. o: ang, screen(w=360, h=760 local), back, off, glow, col.
  - `P_phoneUI.message(w, h, { from, text, stamp, now, mine, avatar })` · `.bank(w, h, { amount='$14.00', name, rows, now })` · `.camera(w, h, { rec, count, view(w, h) })` · `.news(w, h, { head, kicker, src, photo(w, h) })`
- `P_carton(x, y, s, { ang (neg = tips left), col, label, text='JUICE', straw })` ~50×84 · `P_tray(x, y, s, { col, food, empty })` ~240 wide, anchor underside · `P_juiceSpill(x, y, s, u)` puddle centre, u spread 0..1
- `P_basketball(x, y, s, { rot, air, shadow })` Ø72 · `P_quiz(x, y, s, { ang, name, answers, grade, n })` CENTRE 80×104 · `P_rpsHand(x, y, s, 'rock'|'paper'|'scissors', { ang, flip, sleeve, col })` WRIST anchor, fingers up, 40×72
- `P_claw(x, y, s, open, { cable=900, sway })` hub top · `P_plush(x, y, s, kind: bear|bunny|star|cat|duck|dino, { ang, col })` ~56×60
- `P_cableMap(x, y, s, u, { money, ms, a })` CENTRE 1000×560; u draws the cable; money/ms = tag alphas (time them to the words)
- `P_cake(x, y, s, lit, { n, col })` ~170×130 · `P_balloon(x, y, s, col, { len, sway, key })` anchor = string end
- `P_ball(x, y, s, { rot, col, air })` Ø58 · `P_bike(x, y, s, { dir, rot, col })` ~560×320 · `P_bikeRider(x, y, s, { who, h, dir, rot, lean, pose, expr })` · `P_car(x, y, s, { dir, col, door 0..1, driver, lights })` ~1200×420 · `P_ladder(x, y, s, tilt 0 safe..1 fallen left, { dir, can, canCol, len=900 })` foot anchor · `P_paintCan(x, y, s, { col, ang, hang, lid })`
- `P_truck(x, y, s, { dir, lights, beam, driver, rot, col, cab })` ~1750×900 "RAPIDO FREIGHT" · `P_scooter(x, y, s, { dir, who, h, rider, speed 0..1, expr, pose, rot })` · `P_bus(x, y, s, { dir, brake 0..1, lit, rot, pax, col })` ~3000×880 → use s 0.3–0.5
- `P_trafficLight(x, y, s, state red|yellow|green|off, { head, glow })` pole foot, ~680 tall; `head: true` = signal only (84×230, CENTRE) for close-ups
- `P_cane(x, y, s, { ang, col })` CENTRE ~300 long · `P_bags(x, y, s, { n, ang })` · `P_orange(x, y, s, { rot, air })` Ø26 · `P_cast(x, y, s, { ang, sling, neck, sig })` WRIST anchor; on an actor: `hold: { R: (x, y, a, h) => P_cast(x, y, h / 520, { ang: a }) }`
- Cards, TOP-LEFT anchor: `P_cctv(x, y, w, h, drawInside(w, h), { stamp, cam, date, tint })` (greys everything inside; draw colour accents after) · `P_statCard(x, y, w, h, big, small, { a, accent, head, light })` · `P_newsCard(x, y, w, h, head, { paper, kicker, date, photo, a, ang })`
- `P_dayCard(x, y, s, day, count, { label, a })` CENTRE 560×300 · `P_stopwatch(x, y, s, secs, { dial, digits })` CENTRE Ø34 → s 8–22 big · `P_clock(x, y, s, h, m, { sec, col })` CENTRE Ø80 · `P_keys(x, y, s, { ang })` · `P_mug(x, y, s, steam, { col, text })` · `P_wheel(x, y, s, { ang, tilt, col })` CENTRE Ø170 (tilt 0 face-on, ~0.55 side)
- helpers: prop_rim, prop_rimDo, prop_shade, prop_wrap, prop_wrapC, prop_shadow, prop_wheel, prop_hwheel, prop_dText
