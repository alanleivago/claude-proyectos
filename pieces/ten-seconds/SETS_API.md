# Sets and props — the contract (src/sets.js, src/props.js)

## Sets (src/sets.js)
Every set is a function `SET_name(o = {})` that **sets `IV_M`** (its mood, or `o.mood`) and **returns a layers array for `ivStage`**:
`[{ d: 3+, draw: far }, { d: ~1.6–2.2, draw: mid }, { d: 1, draw: () => { setBack(); o.act && o.act(); setFront(); } }, { d: 0.5–0.7, draw: fg }]`
- `o.act()` draws the actors on the actors' plane (d = 1); the set draws its own furniture behind (and, where it makes sense, in front of) them on that plane — e.g. the table edge in front of seated people.
- Floor line at d = 1 is `GROUND = 900` in the base framing (camera `{ x: 960, y: 540, z: 1 }`). The set must look right from z = 1 (wide) to z = 3.2 (close-up on a head at x 300–1600, y 300–700): build backgrounds wide enough (x −1200…3100) and tall enough so no edge shows when far layers pan.
- `o.fg: false` drops the soft foreground. `o.t` = a variant (see each set). Background life is built in (people, steam, rain, lights).
- Also export useful positions in a const object per set, e.g. `SET_POS.cafeteria = { tableTop: 700, seatL: 700, seatR: 1290 }`.
- Use the look of `../ten-seconds-look/src/scenes.js` (cafeteria, bus, street) as the starting quality; copy and improve those.

| set | variants (o.t) | must contain |
|---|---|---|
| `SET_cafeteria` | — | warm lunch light, tall windows, far tables with kids, our long table (front edge drawn after actors), trays |
| `SET_classroom` | — | whiteboard with "POP QUIZ", desks in rows (front desks after actors), teacher's desk, windows, day |
| `SET_gym` | — | basketball court, hoop, bleachers, kids playing in the far layer, day |
| `SET_arcade` | — | neon purple/pink dark room, cabinets with glowing screens, ONE big claw machine at x≈1250 (glass box with plushies; `o.claw` = [x, y] of the claw, `o.drop` 0..1 how far it has descended), a prize counter |
| `SET_party` | — | living room at night, lamp light, balloons, banner "HAPPY BIRTHDAY", a cake table, friends crowd far |
| `SET_street` | 'day' / 'sunset' | sidewalk + road, shopfronts, a parked car (door can open: `o.door` 0..1), a building with scaffolding and a ladder against it (ladder tilt `o.ladder` 0..1), passers-by |
| `SET_corner` | 'day' / 'sunset' / 'night' / 'rain' | the intersection "5TH ST" × "MAIN ST": crosswalk, signal pole with a traffic light (`o.light` = 'red' / 'yellow' / 'green'), street signs, corner shop, road for cars passing left↔right |
| `SET_busFront` | 'rain' (default) / 'night' | inside the bus looking out of the windshield (look frame 3); `o.out()` draws extra things in the street beyond (truck, ghost) between the street and the glass; dashboard, "LINE 9" sign, steering wheel position `SET_POS.busFront.wheel`, driver seat at x≈520 |
| `SET_busAisle` | 'rain' | the aisle looking back: seats both sides (seat numbers, seat 4 marked), poles, hand loops, rainy windows with passing lights; passengers sit at `SET_POS.busAisle.seats` |
| `SET_busSide` | 'rain' | outside, the bus side-on on a wet street at night (the bus is drawn by the set: `o.busX`, `o.brake` 0..1 for brake lights / nose dip); road for the truck to cross |
| `SET_office` | — | bus company office: desk, blinds, a wall monitor that can show CCTV (`o.screen()` draws into it), framed "SAFETY FIRST" poster, cool office light |
| `SET_kitchen` | — | night kitchen, a lamp over a small table (two chairs), window with city lights, fridge, Dad's cap on the table (`o.cap`) |
| `SET_hearing` | — | city hall room: long table for 3 officials facing the camera, nameplates, a projector screen (`o.screen()`), flags, audience chairs |
| `SET_bedroom` | — | night, bed, desk, window with moon/city, phone glow on the bed |
| `SET_void` | mood name | a dark soft stage with bokeh for graphics and explanations (e.g. the 80 ms fact, the cable map) |

## Props (src/props.js)
Functions `P_name(x, y, s, o = {})` drawing in the current transform (world coords), `s` = scale (1 ≈ its natural size next to a 520-px actor). Must look right big (hand close-ups).

| prop | notes |
|---|---|
| `P_phone(x, y, s, o)` | a phone; `o.ang`; `o.screen(w, h)` draws the screen content in local coords (0..w, 0..h); helpers below |
| `P_phoneUI.message(w, h, { from, text, stamp })`, `.bank(w, h, { amount })`, `.camera(w, h, { rec, count })`, `.news(w, h, { head })` | phone screens |
| `P_carton`, `P_tray`, `P_juiceSpill(x, y, s, u)` | lunch |
| `P_basketball`, `P_quiz` (paper with "POP QUIZ" + answer lines), `P_rpsHand(x, y, s, 'rock'|'paper'|'scissors', o)` (a big glove hand in each RPS shape) | |
| `P_claw(x, y, s, open)`, `P_plush(x, y, s, kind)` (bear, bunny, star…) | arcade |
| `P_cableMap(x, y, s, u)` | NEW YORK ↔ CHICAGO map with the cable drawing on (u 0..1), "$300,000,000" and "3 ms" labels |
| `P_cake(x, y, s, lit)`, `P_balloon(x, y, s, col)` | party |
| `P_ball(x, y, s)` (kid's ball), `P_bike(x, y, s, o)` with optional rider pose helper, `P_car(x, y, s, o)` (parked, `o.door` 0..1), `P_ladder(x, y, s, tilt)` + paint can | street |
| `P_truck(x, y, s, o)` (box truck with a logo "RAPIDO FREIGHT", headlights), `P_scooter(x, y, s, o)` (e-scooter with rider) | |
| `P_bus(x, y, s, o)` (city bus side view, "9", windows lit, `o.brake`) | |
| `P_trafficLight(x, y, s, state)` | also used in close-ups (big) |
| `P_cane`, `P_bags` (shopping bags), `P_orange` (rolling), `P_cast` (arm cast) | bus fall |
| `P_cctv(x, y, w, h, drawInside, { stamp })` | a CCTV frame: scanlines, "CAM 04", REC dot, timestamp |
| `P_newsCard`, `P_statCard(x, y, w, h, big, small)` | big number cards for facts (1,086 / ⅓ / 2.1 s / 3 s) |
| `P_dayCard(x, y, s, day, count)` | "DAY 3 · 19 NEAR MISSES" |
| `P_stopwatch(x, y, s, secs)` | timing the yellow light |
| `P_clock(x, y, s, h, m)`, `P_keys`, `P_mug(x, y, s, steam)` | |
| `P_wheel(x, y, s)` | steering wheel (for hand close-ups on it) |

## AS BUILT (src/sets.js) — use these; contact sheet dev/sets/all-sets.png, examples dev/sets/test.js
Every set: `o.act()` actors at d=1 between back and front furniture, `o.front()` after the front furniture, `o.fg:false`, `o.mood`. Extra moods: IV_MOOD.arcade/.party/.hall/.school. Sets draw their own vehicles/props too (set_car, set_bus, set_carNight, set_signal, set_ladder, set_claw, set_plush, set_cake, set_balloon, set_ball, set_tray) — callable.
| set | options | SET_POS |
|---|---|---|
| SET_cafeteria | decor:false | tableTop 700, table [340,1640], seatL 700, seatR 1290, bench 745, trayL 760, trayR 1220 (sitDesk, h 500–520) |
| SET_classroom | decor:false | seats [-180,330,800] (sitDesk facing right; desk after actors), deskDx 160, deskTop 706, teacher 1500, board [820,180,840,340] (far layer) |
| SET_gym | — | hoop [1520,470], bleachers [-800,520] (d=2 layer) |
| SET_arcade | claw:[x,y], drop 0..1, open 0..1, grab:'bear'|'bunny'|'star'|'blob', out() inside the glass | machine [1250,900], glass [1060,330,380,330], claw [1180,380], pile 600, chute [1095,600], counter [250,700] (d=1.8) |
| SET_party | lit, cake:false, hats:false, cheer | cake [1420,690], table [1420,700,420], crowd [900,2000] |
| SET_street | t:'day'|'sunset', door 0..1, ladder 0..1 (tips left), ladderOff, car:false, carX | car [380,1050,1.7], ladder {x 1520, y 900, len 620, lean 0.2}, curb 905, road 1040, scaffold [1300,2050] |
| SET_corner | t:'day'|'sunset'|'night'|'rain', light, cars:false, road() (Main St layer) | pole 1500, signal [1500,250], walkBox, curb 870, roadD 1.5, lanes [800,885], laneS [1.3,1.5] (far lane drives left, near right), crosswalk [180,760], shop |
| SET_busFront | t:'rain'|'night', light, out() (d=2 beyond glass), wipers:false | glass, wheel [720,790,120], driver [520,1130,640] (drive pose), pole 1300, rider [1420,1100,640], signal [1530,250] |
| SET_busAisle | speed (0 stopped), lurch | cross-section, front to the LEFT, passengers in profile facing left; seats [{x,n}] (n=4 at x 960; sit, f<0, h≈500), seat4 960, poles [360,1160,1960], win [250,560], h 500 |
| SET_busSide | busX, brake 0..1, seats(x0,y0,w,h), light, t | busX 700, busS 1, cross 1700 (truck crosses in act, over the bus), signal [1850,200] |
| SET_office | screen(w,h), sharpWall | desk [1300,705,560] (after actors), boss 1390 (Voss behind desk), visitor 640, stand 860, screen [880,170,500,290] (d=1.3) |
| SET_kitchen | cap, mug | table [960,705,460], seatL 740 (faces right), seatR 1180 (faces left), lamp [960,380], cap [1050,705] |
| SET_hearing | screen(w,h), sharpScreen, names[3] | table [1450,762,820] (after actors), officials [1180,1450,1720] (sit, f 0, h≈500), lectern 520, screen [300,150,760,430] (d=1.7), audience |
| SET_bedroom | phone, buzz, blanket() | bed [120,1060,725], pillow, phone [820,718], desk [1380,1860,690], chair 1560, nightstand |
| SET_void | mood/t, col, floor:false | spot [960,900] |
