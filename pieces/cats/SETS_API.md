---
type: spec
status: active
tags: [ifverse, cats, sets, props]
relatedTo: [cats-brief]
---
# Sets and props — the contract (src/sets.js, src/props.js)

## Sets
`SET_name(o = {})` sets `IV_M` (its mood, or `o.mood`) and returns the layers array for `ivStage`: far (d 3+), mid (d ~1.6–2.2), actors' plane (d = 1: set back furniture → `o.act()` → set front furniture → `o.front && o.front()`), soft foreground (d 0.5–0.7, `o.fg: false` drops it). GROUND = 900 at d = 1. Must look right from z = 1 to z ≈ 3 and while the camera dollies/tracks (x ±400, z up to 1.5) — build wide (x −1200…3100). **Built in perspective** with `ivRoom`, `ivBox`, `ivRays`, `ivAO`, `ivLightPool` (see `../cats-look/src/scenes.js`, the approved bar). 3+ details of background life each. Export `SET_POS.name = {...}` with useful positions (seats, windows, walls where cats sit, the vanishing point `vp`).

| set | variants (o.t) | must contain |
|---|---|---|
| `SET_bedroom` | 'morning' / 'night' | Kai's room (approved look 1): perspective room, bed as a box (Kai can lie/sit in it; `SET_POS.bedroom.chest` for Pickles), desk + laptop, window on the right wall with light shafts (morning) or moonlight + city lights (night; `o.knock`: a cat silhouette at the window) |
| `SET_hall` | 'night' | the upstairs hallway: Lily's door with a paper sign "LILY", a night light, Pickles' spot on the floor outside the door |
| `SET_kitchen` | 'day' | family kitchen/living room, table, a cat bed, fridge with drawings |
| `SET_bathroom` | — | a small tiled bathroom in perspective, shower with curtain (`o.steam`), mirror; Pickles watches from the doorway |
| `SET_classroom` | — | perspective classroom, window with a ledge where a cat and a pigeon sit, teacher position |
| `SET_gomez` | — | Mrs. Gomez's warm living room: sofa as a box (cushions; the ring hides in it), many plants, cat tree, 6 cats positions |
| `SET_newsroom` | — | a TV news studio desk with a big screen (`o.screen(w, h)`) and a lower-third bar |
| `SET_busStop` | 'day' | the perspective street (approved look 2), the low wall (box) where Duchess sits, the glass shelter, passers-by |
| `SET_petShop` | 'day' | the pet shop front: big glass window (reflections) with a kitten display inside (`SET_POS.petShop.window`), sign, street |
| `SET_street` | 'day' / 'dusk' / 'night' | a residential street in perspective: houses with windows where cats watch (`o.cats` true), parked cars (boxes), streetlamps, a basement grate |
| `SET_fair` | 'day' / 'dusk' | the street fair: stalls (boxes with awnings), string lights, music stage, dense crowd at two depths, balloons |
| `SET_police` | 'night' | the night street after: police car with light bar (red/blue sweep on everything), flyers "MISSING — LILY" on poles, neighbours with phones |
| `SET_alley` | 'night' | the garage behind the market (approved look 3): the wall as a box with cats on top (`SET_POS.alley.wallTop`, a slot list), crates, dumpster, puddle with moon, a garage door; `o.cats` how many cats on the wall (0–40) |
| `SET_roofs` | 'night' | city rooftops at night in deep layers (chimneys, water tanks, antennas, lit windows), cats on many roofs (`o.cats`), the moon; for the yowl spreading and Pickles running roof to roof |
| `SET_trainYard` | 'night' | tracks converging to the vanishing point, broken train cars as boxes, car "9" (`SET_POS.trainYard.car9`, its open door), moonlight + one floodlight with rays, fog |
| `SET_shelter` | 'morning' | the market corner next morning: bowls on the ground, a small shelter with the sign "BOSS'S HOUSE", cats eating |
| `SET_void` | mood | a dark soft stage with bokeh for graphics (facts, the "85,000 Hz" chart, the city map) |

## Props (src/props.js)
`P_name(x, y, s, o)` world coords, base = bottom-centre unless noted, s = 1 ≈ natural size next to a 520-px actor; detailed enough for close-ups; take the mood's rim light. **3D where it makes sense** (boxes, round things with shading).
`P_balloon` (red, string, sways; `o.free` floating away) · `P_catHat` (paper party hat Lily makes) · `P_ring` (sparkle) · `P_lemonCake` · `P_wallet` · `P_flyer` (MISSING poster with a stick drawing of Lily, `o.text`) · `P_phone` (screens via `o.screen(w,h)`: map pin, call, news) · `P_policeCar` (box-car with light bar, `o.lights` 0..1 sweep) · `P_bowl` (cat food bowl, `o.full`) · `P_tunaCan` · `P_tv` · `P_showerHead` (water drops) · `P_dog` (a dog in the ifverse manner, sit/bark, for the cliffhanger) · `P_pigeon` · `P_moth` (flutters) · `P_mouse` · `P_pipe` (dripping) · `P_gasMeter` (+ a hissing leak wisp) · `P_garageDoor` · `P_sign(x, y, s, text)` (painted wooden sign) · `P_soundRings(x, y, r, u)` (concentric yowl rings spreading, u 0..1) · `P_cityMap(x, y, s, u, o)` (top-down map, rings spreading roof to roof, `o.dots` cats lighting up) · `P_hzChart(x, y, s, u)` (bar: YOU 20,000 Hz vs CAT 85,000 Hz, counts up) · `P_trainCar(x, y, s, o)` (side view with number, `o.door` 0..1, `o.num`) · `P_streetLamp` (light cone) · `P_stringLights(x1, y1, x2, y2, o)` · `P_stall(x, y, s, o)` (fair stall box with awning) · `P_newsLowerThird(x, y, w, text)`.

## AS BUILT — interiors (src/sets.js, SET_POS) · sheet dev/sets/all-sets.png · examples dev/sets/test.js
Every set: o.act() between back/front furniture on d = 1, o.front(), o.fg:false, o.mood. Moods added: bedMorning, bedNight, hallNight, kitchen, bath, school, gomez, studio, void. Room layer is at d 2.2 (hall 1.8): things drawn ON the room (ledge, doorway, window) go through the set's callbacks, not act(), or they drift in dollies; a sharp close-up of them needs IV_FOCUS ≈ 2.2.
| set | options | SET_POS |
|---|---|---|
| SET_bedroom | t 'morning'/'night'; knock (true or ivCat opts: Shadow at the window, night); onBed() drawn on top of the blanket (Pickles on Kai); blanket:false | vp [1010,460], bedSit [760,985,540] (x,y,h Kai sitting under the blanket), pillow, chest [1060,868,200] (Pickles loaf), bed [x0,x1,topY], stand [1420,1700], catFloor, desk, window, sill, door, floorX — no lying pose ready: draw it in the section |
| SET_hall | door 0..1 (Lily's door, default 0.25) | vp, spot [x,y,s] (Pickles' blanket outside the door, s≈180), door, stand [820,1100], lily [700,900], end, floorX |
| SET_kitchen | drawings:false | vp, seats [1150,1530] (sit at y = GROUND behind the table), table [x0,x1,topY], stand [760,300], catBed [400,965,150], bowl, fridge, window, floorX |
| SET_bathroom | curtain 0..1, steam 0..1 (fogs the mirror), water, doorway(x,y,s) callback (Pickles in the back door) | vp, shower [600,900,520] (Kai in the tub), tub, doorway [1220,738,95], mirror, sink, stand [1250,1450], floorX |
| SET_classroom | ledge(x,y,s) callback / ledge:false (default tux cat + pigeon); kids:false | vp [980,440], seat [1350,900,520] (Kai facing left, sitDesk), seat2, teacher [330,900], board, ledge [1495,572,120], windows, floorX |
| SET_gomez | cats 0–6 (defaults drawn), ring (glint) | vp, sofaSeats [520,880] (sit at y = GROUND), sofa, ring [598,742], stand [1400,300], cats (6 × [x,y,s,pose,f]), floorX |
| SET_newsroom | screen(w,h), lower text|false, ticker | vp, anchor [960,900,520] (behind the desk — push in or draw larger), desk, screen [560,200,800,360], stand [300,1650], floorX; LIVE/NEWS 7 overlay always on top |
| SET_void | mood, glow [r,g,b] | vp [960,600], centre, floor |

## AS BUILT — exteriors (src/sets2.js, SET_POS2) · sheet dev/sets2/all-sets.png · examples dev/sets2/test.js
True one-point perspective (ext_proj); standard o.act / o.front / o.fg / o.mood. Moods: extDay, extDusk, extNight, extPolice, extFair, extFairDusk, extAlley, extRoofs, extYard, extMorning. Ground in busStop/street/fair/police/roofs/shelter is a mid layer: feet slide slightly on BIG camera moves — keep moves moderate there (alley, petShop, trainYard draw the near ground on d = 1, no slide).
| set | options | SET_POS2 |
|---|---|---|
| SET_busStop | — | vp, duchess [x,y] (top of the low wall), wall [x0,x1,yTop], kai, bench, sign |
| SET_petShop | inside() (behind the glass), kittens 0–2 | vp, window {x0,x1,y0,y1,sill,spots[[x,y]×4]}, door, facadeBase |
| SET_street | t day/dusk/night, cats (in windows), leak (green wisps from the grate), grate, nearCar, mid(P, things), back(P) | vp, grate, lamp, kai, carNear |
| SET_fair | t day/dusk, crowd (scale) | vp, stage, seller (balloon seller), stallsL/stallsR (filled after the first drawn frame), gap |
| SET_police | lights 0..1 (red/blue sweep incl. rim), cats | vp, car, flyer, neighbours |
| SET_alley | cats 0–40, yowl 0..1 (centre outward), garage 0..1 | vp, wallTop (40 slots [x,y,s,f,D], Boss's centre spot free), boss [x,y,s], wall [x0,x1,yTop,yBase], puddle, door, garage, bulb |
| SET_roofs | cats 0–60 (outward from o.from), yowl 0..1 | vp, maxCats, path (16 points, roof-to-roof run with jumps, depth 1), roofs, tank, chimney |
| SET_trainYard | door 0..1 (default 1), inside() (in the opening), balloon | vp, flood, car9 {x0,x1,top,base,door[x0,y0,x1,y1],floor,num,tie,D} — Lily at floor with h = 0.62·520/car9.D |
| SET_shelter | cats 0–12 eating, bowls, shutter 0..1 (rolls up over the shot by default) | vp, house [x0,x1,top,base], sign, doors, bowls [[x,y,s]×12] |
