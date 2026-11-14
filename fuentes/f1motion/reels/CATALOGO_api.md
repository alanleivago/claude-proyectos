## Scene types

**Reel legend:** BTS = Dc_K1gSx5id, MUSE = DdyxpSRBWIT, CHG = Deje_IEhM8c, KIMI = DfNzJyXtRpJ, F1 = first reel (spec).

**Conventions:**
- Frames are at 24 fps. Graphics step on twos, so "6 fr (3 steps)" means 0.25 s.
- Positions are % of 1080×1920, centre-based.
- Safe zone: keep text between x 8–92%, and keep y 10–90% clear of the caption slot (y 12–15%) on talking-head shots.
- None of the source breakdowns list SFX, so every SFX line is a proposal.
- Default SFX kit: pop = soft bubble pop, tick = typewriter or word tick, whoosh = air whoosh, sub = low sub drop, note = celesta or glockenspiel note per word, click = UI click, peel = paper/sticker crinkle, zap = glitch zap.

### 1. Talking head + hard-swap caption (known)
- **Seen in:** BTS 0–1.2, 3.46–5.17, 20–22.2, 26.4–28.5, 129–131 (shots from all windows). MUSE 0–0.9, 5.8–6.8, 16–17.2, 105.9–108.9. CHG 0–1.4, 8–8.9, 15.2–16.3. KIMI 0–1.25, 31.25–34, 60–61.4, 120–121.
- **Use:** the host carries the narration, 1–5 s per shot. A key noun in the last clause triggers the next graphic. It never holds past about 5 s.
- **Layout:**
  - Face at x 47–50%, y 28–33%, head 28–34% wide.
  - Toy car held as a mic at x 47%, y 43–52%.
  - Pillow and phone at y 70–88%.
  - Caption slot is x 50%, y 12.3–14.7%.
- **Colors / type:**
  - Wall #D9CDB5, tee #E9CF8A, pillow #3B4038.
  - Caption is white #FFF Poppins Light/Regular, lowercase, 40–46 px font (cap 30–36 px), 1–3 words, faint soft shadow, no box.
- **Motion:**
  - Slow push-in 100→108–118% over 24–72 fr, plus ±1° drift.
  - Settle variant: open at 110–135% and ease out to 100% in 6–14 fr.
  - Punch-in variant: jump to 135–150% for emphasis.
  - Caption chunks hard-swap every 6–18 fr with no tween.
- **Transition:**
  - In: hard cut, or blur-in (Gaussian 20–30 px) resolving in 6 fr (3 steps).
  - Out: 6 fr defocus ramp then hard cut, or a plain hard cut.
- **SFX:** room tone only. Soft whoosh on punch-in jump cuts. Optional low "thud" on a B&W emphasis cut.
- **B-roll treatment:** B&W emphasis variant (BTS S3, KIMI 120.96–121.58). Desaturate, lift contrast, tighten to 1.6×.
- **Re-theme:**
  - Soccer: host in a custom jersey holding a mini ball or boot at the chin, same beige set.
  - Other topics: swap the prop (mic, gadget).
- **Build:** real footage. Code the captions, blur ramps, scale keyframes and B&W grade.

### 2. B&W / line-screen b-roll, colour siblings (known)
- **Seen in:**
  - B&W: BTS 1.2–2.9, 41.9–43.6, 63.4–64.6, 122–124 and 138.8–139. MUSE 28–30.5, 40–40.5, 58.7–60.
  - KIMI: 3.3–4.2, 70–71.5, 85.3–86.5, 121.6–123.4, 129.4–131.9.
  - Colour with line screen: KIMI 5.96–8.1 and 50–53.5, CHG 32.2–37.7 (teal duotone), CHG 8.9–13.8 (3D tech), KIMI 78–83 (onboard).
- **Use:** found footage, 0.4–2.5 s. Triggers: emotion or irony, a literal noun, or proof.
- **Layout:** full-bleed 9:16 crop. No captions.
- **Colors / type:**
  - Blacks #0B0B0B, mids #7A7A7A, highlights #E8E8E8.
  - Line screen is 2–3 px lines at 25–40% opacity, vertical or 45° diagonal. Grain and a corner vignette.
  - Teal duotone is #0E5F63→#2FA3A5.
- **Motion:**
  - Slow push 100→105–118%, handheld.
  - Line screen fades in over ~6 fr on the first clip.
  - Blur-in 6 fr. Whip pans of 6–8 fr inside multi-clip shots.
- **Transition:** hard cut in and out. A blurred first frame when coming from a talking head.
- **SFX:** film-grain bed, low whoosh on whip pans, short stinger on a punchline cut. Keep the clip's own audio low.
- **B-roll treatment:** this is the treatment.
- **Re-theme:**
  - Soccer: crowd, goal celebrations, press-conference clips in B&W with the scanline.
  - Other topics: archive clips of the subject.
- **Build:** sourced footage. Code the line-screen overlay, grayscale/contrast grade, vignette, grain and push-in.

### 3. Meme caption insert and "X be like" pairs (known)
- **Seen in:** BTS 8.0 and 17.9–18.75 ("HOW / INTERESTING"), 44.75 ("PROBLEM"), 68.75 ("PRETTY / CLOSELY"). MUSE 3.2–5.8 (orange "Ha"), 14.6–16, 28–32 ("CHAT GPT / MUSE BE LIKE:"), 59–61, 109–111. KIMI 4.17–5.9, 75.5–76.6.
- **Use:** irony or emotion beat. B&W clip with bold caps and no narration, 1–2.5 s.
- **Layout:**
  - Left-aligned stack at x 10–12%, y 12–27% or y 47–70%.
  - Cap 50–70 px, line pitch 68–100 px.
  - Two-weight stack: thin caps 28–45 px over bold 55–95 px, letter-spaced.
  - Sticker variant: orange "Ha" words at x 55–98%, y 61–88%.
- **Colors / type:** white #FFF, Poppins SemiBold/Bold caps, or Light for the lead line. "Ha" is #FF9A1F bold rounded, ~60 px, soft glow.
- **Motion:**
  - Entry is a hard pop on the cut, or a 6 fr gray→white fade at 3–6 fr rise.
  - Hold the whole clip, 24–60 fr. The text does not follow the push.
  - "Ha" pops 0→115→100% in 6 fr, fades after 12 fr, staggered 6 fr.
  - A caption layer can persist across 2–3 clips, with a 2–6 fr dip to black between.
- **Transition:** hard cut in and out.
- **SFX:** "bruh"/vine-style hit or sub drop on caption pop. Laugh track for "Ha". Short riser into the cut.
- **B-roll treatment:** as type 2, plus a stronger vignette.
- **Re-theme:**
  - Soccer: "REF BE LIKE:" over a dive clip, "FANS BE LIKE:" over a crowd.
  - Other topics: "X BE LIKE:" with a cartoon or reaction clip.
- **Build:** sourced meme clips. Code all text, "Ha" pops and the scanline.

### 4. Flash-cut montage burst (known)
- **Seen in:**
  - BTS 24–26.4 (meme jump cuts), 61.88–62.5, 90.58–92.5, 139.1–139.8 (macro headlines).
  - CHG 42.17–42.5 (stutter zoom), 67.25–70.33 (ad b-roll), 93.96–98.33 (car-detail, 0.3 s shots).
- **Use:** list or abundance beats ("live streams, BTS content", "national recognition"), or a brand sizzle under one sentence.
- **Layout:** full-bleed. Optional centre text stack (BTS 91.5: thin 45 px over bold 62 px, 62% wide).
- **Colors / type:** same grade and line screen as type 2. Colour variants are cool blue-grey.
- **Motion:**
  - Cuts of 2–6 fr early in a burst, 1–2 fr at the tail, then a 6–8 fr hold.
  - Per clip: handheld shake, 1.0→1.25 scale punches, rack focus.
  - Stutter zoom-out: 4 cuts at 4 fr each.
  - Match cuts on shape (light bar → DRL).
- **Transition:** hard cuts only. Whip blur or an RGB-split flash at section ends.
- **SFX:** a tick or shutter per cut that accelerates, with a riser. Hit on the final clip.
- **B-roll treatment:** type 2 grade, plus motion blur.
- **Re-theme:**
  - Soccer: fast cuts of kit close-ups, boots, stitching, fans.
  - Other topics: product macro bursts.
- **Build:** sourced clips. Code the cut timeline, scale punches, flash frames and glitch.

### 5. Walker / face-on-body character (known, many variants)
- **Seen in:**
  - MUSE 0.9–3.2 (presents device), 17.2–20.6 (pixel hover-body), 43.6–45.9 (thinker in hole), 100–103 (hover chair), 108.9–111.25 (stretch-leg stairs).
  - CHG 21.2–23.2 (mechanic), 40–44.5 (money, hops up stairs), 53.25–54.5 (3 emoji walkers), 70.3–73.5 (kneeling).
  - KIMI 20–22.2 (bobble-head), 124.1–126.3 (trophy leg).
  - BTS 22.2–23.3 (woman cutout), 8–11 (standing, see type 7).
- **Use:** a person or name beat, or a joke metaphor.
- **Layout:**
  - Grayscale face (or gold octagon, 30–45% wide) at x 25–52%, y 30–40%.
  - Thin or flat-vector body. Thumbs-up or finger-heart emoji hands at y 54%. Shoes at y 72%.
  - Ground ellipse 45% wide, 6–7% tall at y 74–80% (teal #5DC9A2→white or gold #E6CB6E), with a 25–40% mirrored reflection.
  - Text stack on the right at x 47–90%, y 47–57%.
- **Colors / type:**
  - White #FDFDFB bg. Accents are teal, gold, red.
  - Thin lowercase lead-in 28–45 px #333, then a wide-caps or medium hero word 62–100 px, #111 or accent.
- **Motion:**
  - Entry: slide in from the edge in 6 fr ease-out, or scale-pop 0→105→100% in 6 fr (3 steps).
  - Hold: bob ±1.5–2% on a 12 fr cycle, ±3–6° tilt, squash/stretch. Hops are 12 fr arcs. Hover chairs bob like a sine.
  - Words step in 6 fr apart, gray→black over 6 fr.
  - Slow drift or scale 100→77–108% over the shot.
- **Transition:** hard cut, or a 2 fr snap-scale match cut. Blur ramp before a talking head.
- **SFX:** pop on entry, a per-step shoe tick, celesta note per word, boing on hops, sub drop when the hero word lands.
- **B-roll treatment:** none.
- **Re-theme:**
  - Soccer: player cutout in a custom jersey on a stick body, ball leg, boots as sneakers, pitch-green ellipse.
  - Other topics: object legs and props matching the subject.
- **Build:** Flow for body props (chair, trophy leg, kart, sneakers, emoji hands, jersey torso). Code the face cutout, bob, ellipse, text and pixel steps.

### 6. Name-on-vehicle / vehicle strip + pixel road (known)
- **Seen in:**
  - CHG 2.96–5.71 (Zero-Meter Car + macro lockup), 100.9–104.67 (drive-in with text card), 13.83–15.17.
  - KIMI 20–22 (hybrid), 40.3–43.25 (vector car with pixel wheel, "RC CAR").
  - MUSE 108.9–111.25 (stairs).
- **Use:** a vehicle or product is named in speech.
- **Layout:**
  - Road y 58–75%: #4B4B4F with a black 3 px top edge, white dashes ~12% long.
  - Car 73–78% wide at y 56–59%, ending centred.
  - Mint cross tab: bump x 36–65%/y 31–34%, body x 12.5–87%/y 34–47%.
  - Thin lead-in at y 33%, hero line at y 38–44%.
- **Colors / type:**
  - Mint #8EDDBF→white tab with halftone and a #6B8F80 outline. Gold variant #E8D08A.
  - Thin gray #555 40 px lead-in. Hero in semibold or wide caps 105–115 px. Brand lockup red #D93A55 over thin #444.
- **Motion:**
  - Car slides in from the right in 9–12 fr ease-out with no overshoot, then a 1–2 px bob.
  - Dashes scroll left at 1 dash per 4 fr. Pixel wheels rotate in 2 fr steps.
  - Tab fades or wipes in 6 fr. Words reveal 6 fr apart, gray→black.
  - Match cut: 2.5–3× zoom to the wheel or nose (CHG 4.79).
- **Transition:** hard cut or zoom match cut. A slide-wipe from b-roll to white is also used (CHG 13.75).
- **SFX:** engine whoosh on drive-in, brake tick on settle, pop on the tab, celesta per word.
- **B-roll treatment:** none (vector car with dithered wheels).
- **Re-theme:**
  - Soccer: team bus, boot, ball or kit on the "road". A jersey sliding in with the club tab.
  - Other topics: product on the road strip.
- **Build:** Flow for vehicle or product cutouts. Code the road, dashes, pixel wheel mosaics, tab and text.

### 7. Name-stack character card (blob pill + orbiting props)
- **Seen in:** BTS 8.04–10.62 (Bang Si-hyuk), 12.88–14.83 (RM). MUSE 17.2–20.6 (gold "Very Interesting" box + pixel heart).
- **Use:** a person is named. Face plus a stacked name and role.
- **Layout:**
  - Figure at x 20–27%, y 30–36%, 45% wide.
  - Text left-aligned at x 51–55%:
    - role 45 px at y 34%
    - name 95 px cap on two lines at y 41/47%
    - connector "liked an" at y 55%
    - blob pill at x 70%, y 58%, 40% wide.
  - Props (BTS RM): three lightsticks 12–18% wide at x 56–90%, y 28–54%.
- **Colors / type:**
  - Backing #6FD0A8 or #E9D49A polygon. Ellipse gold or teal.
  - Name is regular #1A1A1A, thin gray lead-in. Pill is #555→#8A8A8A with white thin text.
- **Motion:**
  - Face and ellipse appear blurred or ghosted for 6 fr, then body, hands and shoes pop with overshoot.
  - Words type 6 fr apart, gray→black over 6 fr.
  - Blob pill uses a noisy mask wipe over 6 fr.
  - Props scale-pop with tumble, then wobble on twos.
  - The layout drifts toward its settle position.
  - Slide-and-scale-up (140%) exit into a punch-in.
- **Transition:** hard cut or blur dissolve in. Slide-left plus scale-up out.
- **SFX:** pop per prop, whoosh on the slide, celesta per name word, brush swipe on the blob.
- **B-roll treatment:** none.
- **Re-theme:**
  - Soccer: coach or player card with a jersey body, scarf and ball props orbiting, "scored a lot" pill.
  - Other topics: relevant props.
- **Build:** Flow for the stick body, props (lightsticks → balls, scarves) and thumbs-up or heart hands. Code the face cutout, polygon, blob mask and text.

### 8. Gold pill + teal tab title card (known)
- **Seen in:** BTS 22.2–23.3 ("Part -1" flag). MUSE 23.5–26.9 (MUSE tab), 100–103. KIMI 98.4–99.75 ("And then came 2026 / CHINA"), 8.1–10.7 (an entire Category). CHG 1.4–3 and 100.9–104.7.
- **Use:** a title or topic reveal on white.
- **Layout:**
  - Pill: capsule ~30% wide (290–324 px) × 5–8% tall at y 22–31% (or growing downward to 16% tall).
  - Tab: x 7–93% (or 16–83%), 12–13% tall, notched top-left.
  - Chevron "wings" ±20–45° at both ends.
  - Hero word 85–210 px.
- **Colors / type:**
  - Gold #E8C873→#C9A24A, teal #B8EBDD/#9FDCC4→white, halftone dots, 1 px dark outline.
  - Thin lowercase lead-in #222 28–48 px. Hero is wide caps or medium Poppins, black or blue #1860D8.
- **Motion:**
  - Pill scale-pops 0→110→100% in 5–6 fr. Wings flap ±10° on a 12 fr loop.
  - Tab grows by mask in 6 fr.
  - Words appear 6 fr apart, gray→black over 6 fr with a 4–6 px rise.
  - Whole group drifts or scales 2–3% across the shot.
- **Transition:** hard cut in and out. A blur ramp before a talking head.
- **SFX:** pop with a faint sparkle, celesta per word, sub drop on the hero word.
- **B-roll treatment:** none.
- **Re-theme:** soccer: "MATCHDAY / CUSTOM KITS" on a gold pill with jersey chevrons. Any topic: the section title.
- **Build:** all code (shapes, halftone, wings, type). Flow only for an optional hero icon.

### 9. Hero prop + title stack (isometric, landmark, trophy, stationery)
- **Seen in:**
  - BTS 88.7–90.6 (trophy + gold ribbon), 131.3–132.8 (Wembley model).
  - CHG 1.4–3 (money stack + ribbon), 39.4–39.8 (bust + cash), 42.5–44.5 (stairs to car).
  - KIMI 1.3–3.25 (pencil→pen), 22.2–24.7 (trophy + growing callout).
  - MUSE 23.5–26.9 (yeti mascot), 44.9–45.9 (folder pile).
- **Use:** an object or noun that carries the point (money, award, landmark, school).
- **Layout:**
  - Prop at x 50–60%, y 52–62%, 40–82% wide, on a floor (teal halftone, gold diagonal, or green ellipse).
  - Text stack at the top, y 18–35%, or at the left, x 5–65%.
  - Pill grows downward as lines are added.
  - Hard diagonal shadow to the lower right, plus 25–30% reflection.
- **Colors / type:**
  - Mint #86D9B5 or red #C8283A bricks, ribbon #EE5B5B→#F4A3A3 or #D9BE6A, trophy taupe #A89C94 with gold bands.
  - Thin lead-in 42 px, hero 72–90 px medium, #222. Wide caps accent word in red or mint.
- **Motion:**
  - Prop slides or pops in with 5% overshoot. Bricks pop one by one at a 4 fr stagger.
  - Ribbon is a path draw-on over 12–16 fr with ease-out.
  - Words appear as a ghost then solid over 4–6 fr.
  - The camera pulls back or tilts. The group drifts 2–3%.
  - Scale reveal: the toy car pulls back to a giant controller.
- **Transition:** hard cut. Sometimes a match-cut zoom on the prop.
- **SFX:** thud per brick, shimmer on the ribbon, sub drop on the hero word, shoe or hop ticks, celesta per word.
- **B-roll treatment:** none.
- **Re-theme:** soccer: trophy, golden boot, stadium model, jersey stack with a ribbon wrap, ball vs giant kit-bag scale gag.
- **Build:** Flow for the prop (trophy, stadium, cash, pencil, mascot, folders). Code floor, ribbon, pill, text and shadow.

### 10. Album sleeve + vinyl slide-out
- **Seen in:** BTS 93.2–98.5 (two sleeves back-to-back), 112.3–117.5.
- **Use:** a release, product or award moment. A sleeve per item in a chronological chain.
- **Layout:**
  - Sleeve ~58–73% tall × 60% wide, bleeding off the left, right edge at x 42–65%. Edge thickness 8–10 px, bottom and right.
  - Vinyl ~22–78% diameter. It exits the right edge to x 55–87%, y 57–66%.
  - Right-aligned text at the top, ending x 87%: small line 40–42 px at y 14–18%, hero 75–155 px at y 19–26%.
- **Colors / type:** white #F4F4F6 or navy #1B1E26 sleeve with gold #D9BE6A or green #4DB88A edge. Vinyl black with a cream, mint or white label. Text #222, medium or thin Poppins.
- **Motion:**
  - Sleeve slides from the left, ease-out over 12–18 fr.
  - Vinyl emerges at +12 fr, travels 20–35% in 18 fr, then rotates slowly (conic sheen).
  - Sleeve drifts down-left 4 s. Words fade gray→dark over 6 fr, staggered.
  - Next sleeve starts sliding as the cut lands.
- **Transition:** hard cut, with a continuous-rhythm sleeve swap.
- **SFX:** paper-slide whoosh, vinyl scrape and a soft "ting", celesta per word.
- **B-roll treatment:** none.
- **Re-theme:** soccer: kit box or jersey in its sleeve with a scarf sliding out, season by season. Any topic: product box releases.
- **Build:** Flow for the sleeve art and vinyl. Code edge, slide, rotation and text.

### 11. Face-pop orbit and extrude title (BTS card, award prop)
- **Seen in:** BTS 22.2–24.0 (extruded "BTS" + 7 face tiles), 102.96–107.08 (Billboard trophy + face badges).
- **Use:** a group or award, to introduce members or contenders.
- **Layout:**
  - Heavy caps x 8–92%, y 50–73%, cap 23% of frame height.
  - Faces 12–14% wide, in a zig-zag spiral around the centre prop.
  - Trophy ~34% wide, x 50→62%, with text at the left at x 11%: 42 px small, then 150 px "Social / Artist,".
- **Colors / type:**
  - Letters #D9545E with a hard black extrude offset 4%→2%.
  - Face frames gold-outlined or mint #6FCDB0 3 px.
  - Gold ellipse floor #E9CB5C.
- **Motion:**
  - Letters wipe up from the baseline in 6 fr, with overshoot on the extrude.
  - Faces pop 0→110→100% in 8 fr, staggered 6 fr, then bob ±1% / ±3°.
  - Group slides right for the text. Whole group scales to 50% and carries to the next shot.
- **Transition:** hard cut, or a match-carry scale-down.
- **SFX:** thunk per letter, pop per face (pitched up), riser, a shimmer on the last one.
- **B-roll treatment:** none.
- **Re-theme:** soccer: a squad lineup of face tiles around a trophy or the club crest. Any topic: team members.
- **Build:** Flow for the trophy or extruded-letter look if desired. Code type extrude, polygon frames, pops, bob.

### 12. Roster node-graph pan
- **Seen in:** BTS 34.17–38.79.
- **Use:** introducing N members in sequence ("these seven members").
- **Layout:**
  - Nodes are 25% wide, each in a rotated polygon (#E0566A) with a rim.
  - Name tab is a teal gradient #4DB88F→#CFEBDD rectangle, ~55 px caps.
  - Gold #E3CB85 connector, 6 px with an arrowhead, in a zig-zag path.
  - Final layout zooms out ~0.8× to frame all 7.
- **Colors / type:** white bg, white wide thin caps with a soft shadow on the tabs.
- **Motion:**
  - A large canvas pans and zooms.
  - Node scale-pop 0→105→100% in 6–8 fr.
  - Tab mask-wipes out from behind the face in 8 fr.
  - Connector draws in 8–12 fr.
  - Pan or zoom beats come every 0.25 s. The camera eases out and settles with a slight overshoot.
- **Transition:** hard cut in from white, out to a defocused talking head.
- **SFX:** pop per node, swoosh on the line draw, whoosh on camera pans, celesta ascending per name, a final chord on the zoom-out.
- **B-roll treatment:** none (halftone-ish gray faces).
- **Re-theme:** soccer: starting XI or position map with player faces on pink or club-colour polygons, connected like a pass network. Any topic: org chart or lineup.
- **Build:** code the canvas, nodes, tabs, lines and camera. Flow for nothing, or for face cleanup only.

### 13. Timeline / year-ticker rail on talking head
- **Seen in:** BTS 6.83–8.04, 38.8–42, 81.4–82.7, 98.5–103, 111.25–112.3, 123.9–127.8.
- **Use:** a date or year in speech ("Back in 2010", "2013", "by 2019").
- **Layout:**
  - Vertical teal film-strip at x 11.5–13%, full height, 1.2–3.5% wide (some versions 9%), with dark perforations.
  - Gold six-petal flower badge ~8% wide.
  - Dark tab (#3A3A3A→#7A7A7A, 85% opacity) x 11–37%, 5–6% tall at y 36–40%.
  - Year in white thin sans 50–70 px.
- **Colors / type:** teal #5FC4A0, gold #F0C94A, tab #4A4A4A, thin white geometric sans.
- **Motion:**
  - Strip scrolls down at ~4 px/frame.
  - Year rolls like an odometer ("20" → "201" → "2010"), the last digit gray→white. The old tab drops to y 60% and fades while a new flower falls from y 18%.
  - Tab settles with a spring in 12–16 fr.
  - Rail fades out at y 55–65%. Everything is blurred with the video in the blur-in.
- **Transition:** blur-in from the previous graphic. Hard cut out, or blur-out.
- **SFX:** ratchet or film-reel tick while scrolling, slot-machine clicks per digit, a soft "ding" on settle.
- **B-roll treatment:** none (overlay on the live talking head).
- **Re-theme:** soccer: season ticker "2018 → 2022", with a ball icon instead of a flower. Any topic: timeline of releases.
- **Build:** all code (strip, perforations, tab, odometer). The flower or ball icon can be Flow art or an SVG.

### 14. Strip list / row cascade (known)
- **Seen in:** KIMI 7.1–10.7 (F-category ladder), 55.5–59.25 (F4→F3 skipped→F2), 100–102.9 and 107.6–109.1 (circuit flags), 109.1–111.75 (spotlight row).
- **Use:** a ladder, ranked list or itinerary, one row per item. "Skip" gags have the face leapfrog a tier.
- **Layout:**
  - Rows ~60% wide, bleeding off the left, pitch 12.5% of height (~240 px).
  - Sprite (car or flag-filled circuit, 23% wide) at the right end of each row, with a 4×3 pixel speed trail.
  - Gold pill at x 68%, 30% wide, with teal chevron tabs.
  - Face octagon ~22% wide on the active row.
  - Spotlight: other rows fade to 25%, the active row centres.
- **Colors / type:**
  - Mint #D8EFE3, pink #F4D0D6, blue gradient #2540FF→#8A9BFF, gold pill #EBD595→#C9A24A.
  - Wide caps 39 px black, ghosted hero numerals 205 px (red, mint).
- **Motion:**
  - Row pill pops from 30% in 6 fr. Sprite slides in 10–12 fr ease-out, landing 4 fr after the pill.
  - The stack scrolls up so it stays centred. Face wobbles ±6–10° and hops in 8–10 fr arcs.
  - Typewriter words 6 fr apart.
- **Transition:** hard cut, a blur focus pull, or a 6 fr dissolve into the spotlight.
- **SFX:** pop + whoosh per row, hop boing, ding when a row is selected.
- **B-roll treatment:** none.
- **Re-theme:** soccer: league tiers (Sunday league → pro), or a tournament bracket where the player skips a round. Rows hold jersey sprites.
- **Build:** Flow for sprites (cars, kits). Code strips, pills, scroll, trails and the face hop.

### 15. Article / screenshot with selection sweep (known screenshot)
- **Seen in:**
  - BTS 61–67.5 (tweet card, no cursor).
  - MUSE 49.8–58.7, 74.2–78.
  - CHG 49.9–52, 75–82.7.
  - KIMI 43.7–48.7, 61.4–67.5.
- **Use:** proof or source.
- **Layout:**
  - Full-bleed page screenshot, often cropped at the right.
  - Fades to white or dark at the top and bottom (12%).
  - Highlight bar over the sentence at y 49–58% (about 2 lines).
- **Colors / type:**
  - Selection #1A56DB–#2F6FEB, white text.
  - Body 22–40 px, headline bold. Fine line screen (vertical or horizontal).
  - Dark pages #0E0E18.
- **Motion:**
  - Page scrolls up ~12–25% over 3–5 s, with a push-in 100→115–125%.
  - Highlight grows in steps of 2–3 words per 6 fr. It wraps at about 1.7 s and holds frozen.
  - Zoom punch (2.2×, 2–4 fr) toward the selection.
  - A scroll-flick whip (6 fr) between sections.
- **Transition:** blur-in 6 fr, blur-out then hard cut.
- **SFX:** quiet mouse-drag or key tick per step, whoosh on the scroll flick, shutter on the zoom punch.
- **B-roll treatment:** line screen and vignette over the screenshot.
- **Re-theme:** soccer: transfer-news article or club announcement, with the highlight on the fee or contract line. Any topic: source article.
- **Build:** screenshots are sourced assets. Code the highlight mask, scroll, zoom, line screen and blur.

### 16. UI card / menu + pixel cursor (known)
- **Seen in:**
  - CHG 23.25–24.9 (brand menu card), 26.3–29.9 (pill carousel with chevrons), 118.2–122.4 (billboard menu).
  - MUSE 6.8–12.2 (app dock), 31.99–36.7 (CRT title and carousel).
- **Use:** options, features or categories. The cursor selects the one being discussed.
- **Layout:**
  - Card or billboard x 20–81%, y 10–64%, with four stacked pills 42–50% wide × 7–8% tall.
  - Pill (carousel) x 50%, y 31%, 55% wide, chevrons at x 44/56%.
  - Cursor 9–18% wide at the right edge of the active item.
  - Dock pill 95% wide at y 50–72%, 4 tiles. Vehicle or sprite at y 56–77%.
- **Colors / type:**
  - Charcoal halftone panel #2A2A2A, gold pill #F0DC90→#C9A548, active teal #8FE0BE→#2AA27C scaled 1.05–1.15×.
  - Wide caps 28–45 px. Pixel cursor white with a black outline (or blue #2B6FE6).
- **Motion:**
  - Cursor hops 4 fr per item, snap ease with no overshoot. A click scales the chevron down to 90% for 4 fr.
  - Selected pill turns teal, the previous reverts within 4 fr.
  - Content swaps with a 12 fr slide and cross-fade. Tiles resolve from mosaic in 4 fr.
  - Slow pull-back or pan following the cursor. Bobbing sign ±3 px.
- **Transition:** hard swap on a match cut, or a zoom through into the screen.
- **SFX:** click per selection, whoosh per slide, pop per tile, a soft "ding" on selection.
- **B-roll treatment:** none.
- **Re-theme:** soccer: kit-picker or formation menu with the cursor choosing home, away or third, jersey sprites sliding through. Any topic: feature menu.
- **Build:** Flow for item sprites (cars, icons, kits). Code card, pills, cursor, slides, halftone.

### 17. Phone-UI explainer and retro phone (with zoom-through)
- **Seen in:** MUSE 64.3–71.5 (phone mock + chat UI), BTS 56.88–59.21 (retro contact list).
- **Use:** an app or social-media concept.
- **Layout:**
  - Phone 50–62% wide centred (y 50%), screen gradient #8DB4F2→#2B6AE0.
  - Name pill y 26%, balance card y 45%, card y 62%.
  - Props (cash bundles at x 30%, y 80%, mascot at x 68%, y 38%).
  - Title at the top: thin 28 px over 65 px medium.
  - Retro: phone ~70% wide, contact rows, three softkeys.
- **Colors / type:**
  - Mint floor #A8E0C4 or blue #9CC4DB.
  - Retro phone teal header #4DB992, cream highlight #F5EBCB.
  - Pink scribble doodles #E88A8E.
- **Motion:**
  - Elements type in as fragments.
  - Bubbles stretch from squares.
  - Rows appear 6 fr apart, the selector steps one row per 6 fr.
  - Phone pushes in 1.0→1.3 and zoom-through to 350% in ~16 fr (ease-in).
  - Doodles stroke-draw in 8 fr on twos.
  - Words fade up with a 6 px rise.
- **Transition:** whip or slide in (6–10 fr). A zoom-through into the screen close-up.
- **SFX:** message pop and "ding", cash flutter, keypad beeps for retro, whoosh on the zoom-through, riser.
- **B-roll treatment:** none (halftone or dither only on the retro phone).
- **Re-theme:** soccer: club-app lineup or fantasy-team phone UI, or a ticket app. Any topic: the relevant app.
- **Build:** Flow for the phone, props and mascot (3D). Code the UI screens, typing, selector, doodles, zoom.

### 18. Speech-bubble stack (duo, mic bubbles, reaction sticker)
- **Seen in:** KIMI 10.7–13.2 (chibi duo), BTS 71.5–76.75 (mic + coloured bubbles) and 107.1–109.1 (reaction sticker + halftone pill), MUSE 6.8–8.4 (meme bubble + dock).
- **Use:** dialogue or a list of themes ("school pressure, ambition, insecurity…").
- **Layout:**
  - Bubbles 24–43% wide, 7–14% tall, with tails toward the speaker.
  - Chibi characters ~28% wide on a diagonal halftone floor.
  - Mic at x 50%, y 27%, bubbles at x 28–66%, y 44–60%.
  - Die-cut sticker 54% wide with a hard black offset shadow.
- **Colors / type:**
  - Bubbles green #52C39B, gold #E8CB6C, blue-gray #B9CEDD, red #E04A5E→#F0A0A8, teal #5DC9A3.
  - Halftone fill. Text 40–55 px, dark or white.
  - Header "they were / Singing / about": 30 px thin / 120 px medium.
- **Motion:**
  - Bubble pops 0.6→1.05→1 with 6–15° rotation settle in 8 fr.
  - Text appears word by word at 6 fr.
  - Characters bob ±4°.
  - Camera push-in 15%. Bubbles grow as words appear.
  - Zoom-through 2.2× to the last bubble.
- **Transition:** hard cut. A zoom-through into a close-up.
- **SFX:** pop per bubble with distinct pitches, a "whoop" on rotation settle, a note per word, a swell into the zoom.
- **B-roll treatment:** none.
- **Re-theme:** soccer: coach and player chat bubbles, fan reactions or "chant" bubbles with jersey colours. Any topic: quotes.
- **Build:** Flow for the mic or character bodies. Code bubbles, halftone, tails, pop and text.

### 19. Pixel-to-real reveal and game-footage metaphor (known)
- **Seen in:** KIMI 88.6–89.75 (car seat reveal), MUSE 6.8–8.4 and 87.63–88.96 (mosaic mirror glitch), BTS 28.5–31.25 (Tetris footage).
- **Use:** "sprite → real" metaphors, or a game or dating-sim framing.
- **Layout:**
  - Object centred at y 38–62%, 66% wide, on a gray blob shadow (#BDBDBD, y 65–73%).
  - Text: lead-in 26% y, hero word 130 px wide caps (mint #5FC9A0) at y 32%.
  - Mosaic mirror: 30% mosaic bars at the top and bottom with a window strip between.
- **Colors / type:** white bg, mosaic 12 px blocks, gray game UI #1B1B1B with bevelled blocks #5A5A5A–#C8C8C8.
- **Motion:**
  - Mosaic resolves over 8–10 fr, object settles 2.5%.
  - Hero word pops 1.08→1.0 in 6 fr.
  - Game: discrete 70 px steps every 6 fr, slow push-in 5%.
- **Transition:** pixel dissolve (a mosaic of the real car) or hard cut.
- **SFX:** 8-bit blips as pixels refine, a "level-up" jingle on resolve, glitch zap on the mirrored shot.
- **B-roll treatment:** line screen over game footage.
- **Re-theme:** soccer: a pixel kit resolves into a real custom jersey, or FIFA-style sprites. Any topic: before/after.
- **Build:** Flow for the "real" object. Code the pixelation shader, mosaic, blocks and text.

### 20. Map + polaroid stack
- **Seen in:** KIMI 24.71–26.79.
- **Use:** a birthplace or location.
- **Layout:**
  - Full-bleed relief map, darkened 30%, with a vignette.
  - Polaroids cluster at x 8–55%, y 31–68%: 24%, 33–39%, 22% wide, rotated −10°…+8°.
  - "Born in Italy in" at x≤81%, y 56%, 48 px. "2006" 155 px cap at y 62%.
- **Colors / type:** sea #7FA6B2, land #A58E6E, white light-weight geometric sans #F2F2F2.
- **Motion:**
  - Fade up from black in 6 fr.
  - Polaroids slide in from the left in 8 fr with a 12° rotation settle, staggered 6 fr.
  - Map pushes in 5% over 48 fr.
  - Words 6 fr apart, year pops in 4 fr.
- **Transition:** hard cut in and out.
- **SFX:** shutter or paper flick per polaroid, a low pad, celesta on the year.
- **B-roll treatment:** photoreal, no line screen.
- **Re-theme:** soccer: hometown map with local-pitch photos and "Born in X in YYYY". Any topic: origin story.
- **Build:** Flow or stock for the map and photos. Code polaroid frames, shadows, motion and text.

### 21. Photo card on self-blown-up dark background
- **Seen in:** KIMI 28.1–31.25, 93.9–95.3 (photo-flash stack), 26.8–28.1 (full-bleed photo with line screen).
- **Use:** archival photos or a run of achievements, 0.4–1.5 s each.
- **Layout:** card x 13–87% (75–97% wide), y 24–76% or y 35–65%, centred. Background is the same photo enlarged and darkened to 15% brightness.
- **Colors / type:** near-black #0B0B0B bg with line screen. No text.
- **Motion:** slow 1–3% push, grows 77→80% over the shot. Hard cut between cards, 10–18 fr holds, a few with a fade up.
- **Transition:** hard cuts. A blurred first frame on the talking head after.
- **SFX:** camera shutter per photo, a low whoosh on the last cut.
- **B-roll treatment:** line screen over the card and the background.
- **Re-theme:** soccer: trophy-lift or training photos, custom-kit shots. Any topic: milestone photos.
- **Build:** sourced photos. Code the blown-up copy (scale, darken, blur), card, line screen.

### 22. Quote card + silhouette
- **Seen in:** KIMI 86.54–88.62.
- **Use:** a paraphrased line from a person or brand.
- **Layout:**
  - Logo at x 50%, y 11%→26%, 20% wide.
  - Gold box x 21–79%, y 25→38%, growing downward.
  - Silhouette x 10–92%, y 41–100%, pixel-block texture.
  - Text: small 22 px thin, hero 45 px wide caps, three lines.
- **Colors / type:** green #2F8A68→#07140F silhouette, box #EAD9A0→#F6EED0, black and dark-gray wide caps.
- **Motion:**
  - Logo pops with blur and overshoot in 8 fr.
  - Box widens from a gray line to a box, +6 fr per line.
  - Words 4–6 fr apart. Logo and silhouette slide down 5% as the box grows.
- **Transition:** pixel dissolve into the real object.
- **SFX:** chime on logo pop, typewriter ticks, sub on the hero word, glitch on dissolve.
- **B-roll treatment:** none.
- **Re-theme:** soccer: club logo plus a manager quote over a jersey silhouette. Any topic: brand quote.
- **Build:** Flow for the silhouette art (optional). Code the box, text, pixel texture, logo animation.

### 23. Kinetic type card (rising floor, slide-away punchline)
- **Seen in:** CHG 52–53.25 (rising teal floor), 53.25–54.5 (type + walkers). MUSE 66.4–67.65. BTS 47.4–54 (weight-mix stack).
- **Use:** a type-only beat with a thin lead-in and one heavy word.
- **Layout:**
  - Centred stack at y 28–46%, thin 22–55 px lines, hero 100–120 px.
  - Rising teal strip #BDEBDD→#7FCFB3 from 2%→33% (or 67%).
  - Optional device or sprite slides off-screen with a punchline beside it.
- **Colors / type:** black on white, hero gray→black, mixed weights (thin lowercase + mid-weight capitalised).
- **Motion:**
  - Words fade 6 fr apart from ghost with a slight rise.
  - Block rises (y 46%→33%) as lines add.
  - Lateral camera slide 8–10 fr ease-out.
- **Transition:** hard cut, floor continuous across the cut.
- **SFX:** celesta per word, whoosh for the slide, sub on the hero.
- **B-roll treatment:** none.
- **Re-theme:** soccer: "never about the kit alone" with a pitch strip. Any topic: punchline.
- **Build:** all code.

### 24. Top-down lane (known)
- **Seen in:** CHG 24.92–26.29.
- **Use:** a place or route ("entered Pakistan").
- **Layout:**
  - Road occupies x 0–45% (#111→#3A3A3A, lane lines at x 14/29%).
  - Right 55% is white text panel.
  - Gantry sign at y 14%.
  - Hero car rises from y 100%→45%.
  - "Changan entered" at y 49%, "PAKISTAN" wide caps mint #8FD3BC at y 52.5%.
- **Colors / type:** blue signs #0F66F0, text #555 thin 45 px plus wide caps 65 px.
- **Motion:**
  - Road scrolls 25% of frame height per second.
  - Car drives up with a lane drift.
  - Text blur-fades in 8 fr, country name wipes in 6 fr.
- **Transition:** hard cut with a blur bridge.
- **SFX:** engine rev, whoosh passes, celesta per word.
- **B-roll treatment:** none.
- **Re-theme:** soccer: ball or bus on a pitch seen from above, a road-trip to an away ground.
- **Build:** Flow for the top-down vehicles. Code road, signs, scroll and text.

### 25. Talking head + lower-third overlay
- **Seen in:** CHG 54.5–56.3 (NEVO), 62.8–64 (Deepal), 85.8–87 (AVATR), 108.2–118.2 (brand-card cascade). BTS 142.4–146.7 (glass teaser).
- **Use:** a name, brand or teaser lands while the host is speaking.
- **Layout:**
  - Vehicle strip x 0–72%, y 52–66%. Car 38–66% wide. Tab x 33–69%, y 50–55%.
  - Teaser card x 12–90%, y 51–65%, tab "Part 2:" x 20%, flower x 10%.
  - Host punched in to 135–150%, face x 55–70%.
- **Colors / type:**
  - Strip red→black or pink→red. Mint tab #8FE0BE→#2AA27C with wide caps 25–45 px.
  - Glass card #2F6F6A at 70% opacity with backdrop blur and a thin edge.
  - Caption white thin.
- **Motion:**
  - Strip slides from the left in 12 fr ease-out. Tab text types on, widening 8→30%.
  - A glint streak sweeps the car over 4–6 fr.
  - Cascade: old card scales 0.6, drifts up 12–15%, fades while the new one enters.
  - Card slides in and the text wipes left→right.
- **Transition:** hard cut or blur-in. Overlay cuts with the shot.
- **SFX:** whoosh on the slide, glint "shing", tab pop, light ding on "COMING SOON".
- **B-roll treatment:** none (live talking head).
- **Re-theme:** soccer: player name on a jersey strip over the host, or "Part 2 coming soon" teaser. Any topic: product or sequel tag.
- **Build:** Flow for car or jersey cutouts. Code strip, tab, glass blur, glint.

### 26. Logo sticker-peel + kinetic weight-mix text + logo pair
- **Seen in:** BTS 47.42–53.96.
- **Use:** a company name or competitors.
- **Layout:**
  - Main logo x 50%, y 50%, 73% wide, shrinks to 38% at y 28%.
  - Text stack from y 42%, centred. Two competitor logos at x 25% and 78%, y 63%, 27–29% wide.
- **Colors / type:** gold plate with black caps, thin black 50 px lines, 72 px "Established Groups", pale gray→black reveals.
- **Motion:**
  - Peel reveal 6 fr (flap curls top-right to bottom-left).
  - Scale to 65% over 36 fr, then 8 fr ease-out slide.
  - Words 6 fr apart.
  - Logos peel in, then rotate ±4–5° slowly.
- **Transition:** hard cut, no blur.
- **SFX:** peel crinkle, pop per word, a sticker "slap" per logo.
- **B-roll treatment:** none.
- **Re-theme:** soccer: club crest peels onto the screen, rival crests flank it. Any topic: brand vs competitors.
- **Build:** Flow or stock for logos (user supplies). Code the peel shader, scale, text and wobble.

### 27. Puzzle-snap assembly
- **Seen in:** CHG 100.92–104.67.
- **Use:** "combine A and B".
- **Layout:**
  - Two pieces ~36% wide × 20% tall start at x 20/78%, y 52/48%, rotated ±25–30°. They lock at x 14–86%, y 39–60%.
  - Tabs "TECH"/"DESIGN" on black gradient.
  - Then road y 54–68% with a car 73% wide and a gold text card x 20–81%, y 31–44%.
- **Colors / type:** green #7FD0A8→#2FA478, red #D63C4A→#EEA0A6, white pixel icons, text card #E8D08A→white.
- **Motion:**
  - Pieces rotate to 0° and slide together in 18 fr with overshoot, snap at +6 fr.
  - Pieces exit left, road wipes in. Car decelerates over 24 fr.
  - Words appear 6 fr apart, gray→black.
- **Transition:** soft blur-out then hard cut.
- **SFX:** whoosh for the slide, a "click-snap" on the lock (key beat), sub drop, a drive-by whoosh.
- **B-roll treatment:** none.
- **Re-theme:** soccer: fabric piece and print piece snap into a custom jersey. Any topic: two ingredients.
- **Build:** Flow for the pieces' icon art if wanted. Code everything else.

### 28. Detail-crop callout + swoosh arrow
- **Seen in:** MUSE 103.06–105.86.
- **Use:** pointing at a small part of a prop ("put orders in a system").
- **Layout:**
  - 2.2× crop of the previous scene, panel at x 25–48%, y 45–60%.
  - Brush arrow from (82%, 42%) to the panel at (42%, 51%), 3–4% thick.
  - Text at x 44%, y 28–42%: thin 30 px lines + 62 px medium lines.
- **Colors / type:** arrow #3DB88A→#2FA37A, text #333 and #111.
- **Motion:**
  - Arrow grows as a leaf, then mask-wipes from the tail in 12–18 fr.
  - Camera pulls out over 67 fr.
  - Words step in 6 fr apart.
- **Transition:** match cut from the previous scene on the same prop. Hard cut then blur-in to the talking head.
- **SFX:** swish on the arrow draw, click on the panel, celesta per word.
- **B-roll treatment:** none.
- **Re-theme:** soccer: crop to a kit's crest or sponsor logo with an arrow.
- **Build:** reuse the prior scene's art. Code the crop, arrow stroke and text.

### 29. UI tour list + red CANCELED stamp
- **Seen in:** BTS 134.46–137.58.
- **Use:** a cancellation or failure after a build-up.
- **Layout:**
  - Dark UI, banner photo at the top 38%.
  - Rows at x 28%, y 53–97% with "TICKETS" buttons at x 94%.
  - "CANCELED" at x 50%, y 50%, 36% wide, cap 55 px.
- **Colors / type:**
  - Charcoal #2B2B2B→#3A3A3A, sparkle at x 72%, y 55%.
  - Red wash to #7A0000 then #4A0000 with a vignette.
  - Wide caps.
- **Motion:**
  - Slow push 100→108% with a 2% pan.
  - On the stamp: instant pop (gray→white in 6 fr), the wash tints pink→deep red in 6–8 fr.
  - Blur dissolve out.
- **Transition:** blur to a defocused talking head.
- **SFX:** stamp thud with a sub drop, a record scratch or downward detune, rising drone under the red.
- **B-roll treatment:** B&W halftone banner photo.
- **Re-theme:** soccer: fixture list with "POSTPONED" or "RED CARD" stamp.
- **Build:** code UI, stamp and wash. Banner photo is sourced.

### 30. Zoom-through / close-up stack of a graphic (known close-up stack)
- **Seen in:** BTS 10.62–11.21 (140% punch-in on the name card), 58.58–59.21 (phone zoom-through), 75.08–76.75 (zoomed bubble). MUSE 2.5–3.2 (device push-in), 33.4 (CRT zoom-through).
- **Use:** to turn one scene into the next without a full cut, or to enlarge a payoff.
- **Layout:** crop at 140–350%, text block fills x 25–90%, y 15–65%. Face or prop cropped at the edge.
- **Colors / type:** same as the parent scene. Text scales with the camera.
- **Motion:**
  - Ease-in zoom in 8–16 fr, then a 0.5–1.2 s hold with slow drift.
  - Cut detector fires during the zoom, but it is one move.
- **Transition:** hard cut or zoom match into the close-up, then a hard cut out.
- **SFX:** riser or whoosh on the zoom, impact on landing.
- **B-roll treatment:** none.
- **Re-theme:** soccer: zoom into the jersey number or crest on a lineup card. Any topic: zoom to the key detail.
- **Build:** all code (camera on the parent scene).

## Cross-cutting rules

**Rhythm**
- Mean shot ~1.9 s. Talking head is 35–45% of runtime, with graphics 30–40% and found footage 25–35%.
- Talking-head shots are 0.7–5 s. Burst montages use 2–6 fr cuts.
- Alternation pattern: talking head → graphic or b-roll → talking head, and wide → punch-in jump cut.
- Every graphic is triggered by a key noun in the speech, and its elements enter 0.25 s before the spoken word.

**Transitions**
- About 70% hard cuts, ~20% blur ramps (6 fr), plus whips, zoom-throughs, peels, pixel dissolves, white flashes, and an occasional dip to black.
- Talking head → graphic often uses a 6 fr defocus out.
- A talking-head shot starts blurred (20–30 px), or zoomed 110–135%, and settles in 6–14 fr.
- Slides or wipes into white graphics are rare.
- Match cuts via shape, prop or scale.
- Black gap or beat at the very end (BTS 140.5).

**Fonts**
- Captions: Poppins Light/Regular, lowercase, white, 40–46 px, slot y 12–15%, hard swap.
- Graphics: thin lowercase lead-in (#222–#555), medium or SemiBold Poppins for hero words (62–150 px).
- Wide futuristic caps (Michroma/Orbitron-like) for labels and accent words in pills and tabs.
- Meme text is bold grotesque caps. UI is Helvetica-like.
- Words reveal one by one gray→black (6 fr).

**Colors**
- Graphic bg is white #FDFDFB with one accent hue (teal #7ED3B2, gold #E8C873, red #D9545E, blue #1860D8) plus black.
- Grayscale faces only. Halftone dots and drop-offs on floors and tabs.
- B&W footage with a line screen at 25–40%.

**Sound**
- Bed: low-volume loop under the voice.
- Pop or tick for each element.
- Celesta note ascending per word reveal.
- Sub drop on a hero word or stamp.
- Whoosh on slides, whips and zooms.
- Glitch zap on pixel or mosaic effects.
- Shutter on photo stacks.
- Click on UI selects.
- Riser before a payoff cut.
- Meme stingers on irony beats.
- All of this is proposed, not sourced.

**Hold rule**
- Never freeze a shot. Add 3% drift, bob, flap or wobble.
- No graphic holds past 3.5 s without a swap or camera change.

## New building blocks

- **CaptionTrack:** hard-swap 1–3 word chunks from a word-timing JSON, slot y 12.5–14.7%.
- **GhostWord reveal:** word-by-word gray #BBB→#222 over 6 fr with a 4–6 px rise, tied to speech timing.
- **Pill / Tab / Wings kit:** gold or teal capsule with halftone, notched tab, chevron wings, growth mask, overshoot pop.
- **Halftone and line-screen shaders:** dot floors, 45° or vertical 2–3 px scanlines, vignette, grain, B&W grade.
- **Blur ramp and zoom-settle:** 20–30 px Gaussian in 6 fr, scale 135→100% ease-out.
- **Twos stepper:** wrapper that quantises any animation to 12 fps.
- **Face cutout rig:** grayscale polygon backing, bob ±1.5%, tilt ±4°, squash, reflection.
- **Walker or stick body:** hands, shoes, ground ellipse, hop arcs.
- **Pixel mosaic / pixel-sprite:** wheels, sneakers, tiles, mosaic-to-sharp resolve, glitch slice, dither.
- **Road strip:** scrolling dashes, vehicle slide-in with ease-out, pixel wheel rotation.
- **Strip row and cascade:** row, sprite, trail, scroll, spotlight dim.
- **Pixel cursor + click + selected state:** hop, press, teal flip.
- **Selection-highlight sweep:** blue mask by word, wrap, freeze, scroll, zoom punch.
- **Year rail:** film-strip, flower badge, odometer tab.
- **Sticker peel shader:** flap curl with specular and shadow.
- **Speech bubble:** tail, halftone, pop with rotation settle, typing words.
- **Orbiting prop sprites:** scale-pop, tumble, wobble on twos.
- **Node-graph canvas:** nodes, tabs, gold connector with arrowhead, camera keyframes.
- **Sleeve + vinyl:** slide, edge thickness, rotating sheen.
- **Stamp + colour wash:** instant pop, tint ramp, vignette.
- **Zoom-through camera:** parent scene scaled 140–350% with ease-in.
- **Flash-burst editor:** list of 2–6 fr cuts with scale punches and whip blur.