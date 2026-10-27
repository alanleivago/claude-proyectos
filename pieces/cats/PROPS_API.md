---
type: spec
status: active
tags: [ifverse, cats, props, api]
relatedTo: [cats-brief]
---
# Props API (src/props.js) — sheet dev/props/all-props.png, examples dev/props/test.js
All `P_x(x, y, s, o)`, world coords, s = 1 ≈ natural next to a 520-px actor, mood rim light on silhouettes.

- `P_balloon` bottom of the string; col, len, sway, key, rise, **free 0..1** (rises away)
- `P_catHat` bottom-centre of the brim (sits on a head); ang, col, col2, string:false
- `P_ring` bottom of the band; sparkle 0..1, stone
- `P_lemonCake` on a plate; slice
- `P_wallet` ang, col, flat
- `P_flyer` CENTRE ~150×200 (MISSING + Lily photo); ang, head, text, text2, phone, tabs, a
- `P_phone` CENTRE; ang, screen(w=360,h=760), back, off, glow, col · `P_phoneUI.map(w,h,{place,eta,pin,drop,route})`, `.call({name,status,incoming,avatar})`, `.news({head,kicker,src,photo})`, `.message({from,text,stamp,mine})`
- `P_policeCar` box-extruded ~1200×470; dir, **lights 0..1**, ext, rot (wheels don't spin by themselves), num, head
- `P_bowl` ~116×44; full 0..1, water, col, name · `P_tunaCan` open · `P_tv` bottom of the foot; screen(w=400,h=225), off, wall · `P_showerHead` anchor = wall flange; dir, on, len, flow
- `P_dog` ground point, s = 1 ≈ 200 px sitting; f, pose sit|stand|bark, wag, talk, expr {eyes,brow,mouth}, col, col2, belly, key — profile only; returns {head, r}
- `P_pigeon` feet; f, peck, fly · `P_moth` CENTRE; still, flap · `P_mouse` ground; f, run
- `P_pipe` joint centre; len, ang, col, drip, floor, rust · `P_gasMeter` bottom-centre; **leak 0..1**, pipe, spin · `P_garageDoor` ~1000×800; open 0..1, vp, col, tag, inside(w,h), lit
- `P_sign(x, y, s, text, o)` ground between posts (or centre with posts:false); post, ink, wood, paw, ang, size
- `P_soundRings(x, y, r, u, o)` CENTRE; n, col, squash (~0.35 on the ground), loop, dir/spread, w, a
- `P_streetLamp` foot ~760 tall; on, dir, cone, col [r,g,b], flicker · `P_stringLights(x1, y1, x2, y2, o)` sag, gap, on, cols, r, twinkle
- `P_stall` bottom-centre of counter ~640×660; vp, col, wood, text, goods lemonade|balloons|toys|none, lights
- `P_trainCar` bottom-centre on the rail ~1500×640; num '9', **door 0..1**, inside(w,h), light, ext, col, tilt — returns {door:[x,y,w,h]}
- `P_cityMap(x, y, s, u, o)` CENTRE 1200×700; u spreads the wave, roof cats light up, counter counts; dots, from, count, mult, label, yard 0..1, fair, a — returns {lit}
- `P_hzChart(x, y, s, u, o)` CENTRE 1100×540; YOU 20,000 vs CAT 85,000 bars count up, ×4 pops; a, title
- `P_newsLowerThird(x, y, w, text, o)` TOP-LEFT; kicker, ticker, logo, a, live (scale ctx for small use)
- helpers: prop_ext, prop_ball, prop_cyl, prop_rim, prop_rimDo, prop_shade, prop_shadow, prop_num, prop_hwheel, prop_statusBar, prop_el, prop_cap, prop_animalRim, prop_sheen, prop_wrap, prop_dText
