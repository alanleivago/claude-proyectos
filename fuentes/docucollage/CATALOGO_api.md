## Scene types

Notes that apply to every type:
- All frame counts are at 25 fps. Steps are at 10 fps, a change every 3,2,3,2 frames, so 1 step ≈ 2.5 frames. The breakdowns say "12.5 fps", but the measured cadence is 10 fps for motion graphics. Talking-head footage runs at the full 25 fps.
- Titles lead the spoken word by 0.1–0.6 s.
- Sources are 608x1080 (GOLD, ARR) and 720x1280 (JAM). Build everything at 1080x1920.

### 1. Talking-head, plain (live room)
- Seen in:
  - GOLD 24.12–33.68, 36.28–37.2, 51.36–52.36
  - JAM 18.08–21.28, 24.88–36.0, 44.96–50.4
  - DK 48.52–53.08, 54.72–56.72
  - ARR 12.08–13.12, 27.76–29.32, 40.72–46.72, 56.76–59.16
- Use / trigger:
  - Hook, explanation, punchline, CTA ("let me know in the comments").
  - It is the breathing space between graphic runs, about 35% of runtime in runs of 1–5.4 s.
- Layout:
  - Host chest-up, head 30–48% of frame width, centre x 45–55%, y 22–35%.
  - JAM also shows a desk keyboard at y 82–95%.
  - Caption below at y 72%, so keep the face above y 60%.
- Colors / photo:
  - Blue/teal LED bokeh (#1E6FA8–#2F86F0) with warm fairy lights, plant and shelf.
  - Grey tee #C9C6C3, round glasses, smartwatch.
  - No grade, grain or vignette.
- Motion:
  - Locked-off camera. Hand gestures and lean give the apparent push.
  - Slow digital push of 2–5%/s.
  - Entry and exit are hard cuts, or a 2–8 frame dissolve.
- SFX: music bed only. A punch hit on the cut in, a whoosh if a transition follows.
- Re-theme:
  - Stimulus founder in a kit room or office, with club-colour bokeh and a jersey rack in the blurred background.
  - Any topic: same host, swap the bokeh tint.
- Build: shoot live; no Flow.

### 2. Jump-cut punch-in / reframe
- Seen in:
  - GOLD 37.2 (+10%), 46.32 (2-frame dissolve), 52.36 (wider)
  - JAM 6.32, 29.36 (1-frame blend, 115–120%), 36.68 (108% + tilt), 50.6
  - DK 38.36 (+8%)
  - ARR 29.32, 43.04, 46.72
- Use / trigger:
  - Every 3–6 s on a sentence boundary or pause, to reset energy.
  - The cut is often hidden by hand-swipe blur ("Well" at 51.76, wind-up at 51.8).
- Layout:
  - Scale 1.05–1.20 or a wider 0.8×.
  - Head shifts ±10% in x and 3–8% in y, sometimes with a 2–3° roll.
- Motion:
  - 0-frame hard cut, or a 1–2 frame blend (1 step).
  - Then a 1.5–4%/s drift for 1–3 s.
  - A second punch-out is often invisible.
- SFX: soft punch hit on the cut, no whoosh.
- Re-theme: identical for any host talk.
- Build: code (scale/crop keyframes on a single take); no Flow.

### 3. Karaoke caption pill
- Seen in: all 155 shots except the hand-swipe, wind-up and quote-clip shots.
- Use / trigger: every spoken word; 2–5 word chunks, about 50 chunks/min.
- Layout:
  - Centre x 50%, y 72% (1390 px), above all layers including cutouts, titles and torn paper.
  - Height 103 px, radius 16 px, padding 24–48 px, width hugs the text (26–95%).
  - Keep it clear of the bottom 20% UI zone.
  - GOLD sits at y 47% until 23.52 and moves to 72% afterwards.
  - JAM runs y 78% with a white pill, hard whole-chunk swaps and a soft shadow.
- Colors / type:
  - Fill #FDF9ED, Poppins Bold ~54 px, sentence case, no stroke.
  - Spoken #000, current #3C3830, upcoming #CFCAC0.
  - ARR/JAM variants use white #FFF with grey #A8A8A8 upcoming.
- Motion:
  - Words flip hard on their start time (some fade 3–8 frames).
  - The chunk swap is a hard cut with an instant resize, 0–0.2 s before the first word.
  - The pill is not affected by transitions.
- SFX: none.
- Re-theme: same pill. Optionally tint the fill to the club's cream.
- Build: code (HTML/CSS from word timestamps). Unify to the measured spec and y 72%.

### 4. Stacked serif typewriter title (hero title)
- Seen in:
  - GOLD 0.16–1.04, 2.32–3.2, 8.0–8.96, 10.32–11.2, 12.56–13.44, 16.96–17.52, 22.0–23.0, 38.4–38.96, 44.72–45.6, 48.24–50.64
  - JAM BARRY SCHWARTZ 1.2–1.84, THE PARADOX OF CHOICE 5.04–5.68
  - DK 0.56–1.68, 7.28–9.36 (names), 12.56 OVERESTIMATE, 14.6, 24.64, 30.56, 46.64, 53.2
  - ARR 0.32–1.36 (red), 5.92–6.8, 9.12–10.16, 22.16, 24.88, 34.0
- Use / trigger:
  - Concept names and people (name, role, year).
  - Starts 0.1–0.6 s before the spoken word and completes at or before it.
- Layout:
  - Top 5–35%, centred, two lines (up to four).
  - Line 1: Bebas Neue, tracking 0.2em, cap 50–120 px, y 7–10%, 50–80% wide.
  - Line 2: Lora Bold caps, cap 88–200 px, y 14–20%, 80–94% wide.
  - Z-order: bg < title < host/cutout. The title sits behind the head with a small gap.
- Colors / type:
  - Gold gradient #E8C16A→#B8893A with a dark drop shadow, 3–4 px at 50%. Some uses add a bevel.
  - Variants: cream #EFE7D8, white with navy #1F3A5F hard shadow, yellow #F2DE2E (JAM), red #E8321F (ARR), peach #F9C98A.
  - Names use Lora Bold plus italic for the year line ("in 1999").
- Motion:
  - Line 1 types at 20–25 cps (2–3 chars per step). Line 2 at ~12 cps (1 char per step).
  - The newest letter sits at 40–50% opacity for one step; the last letter fades over 2 frames.
  - The first letter of a huge word can land at 1.3× and settle in 2 frames ("D" of DREAM, "NEXT?").
  - Whole build takes 20–30 frames (8–12 steps) and holds 1–2 s.
  - Exit options:
    - Hard drop.
    - Rides the camera zoom off the top (4 steps).
    - Accelerating slide left (5% per frame).
    - Dissolves with the shot.
    - Shrinks to 70% in 18 frames (DK 2.32).
- Transition in/out: the title can persist across a bg swap (GOLD 0.16→2.32, ARR 0–4.24).
- SFX: typewriter key click per letter, soft riser into big words, a small thud when a hero word completes.
- Re-theme: "CLUB DIRECTOR SYNDROME", "THE 24-JERSEY PROBLEM", "TEAM STORE / FIRST ORDER". Same for any topic: swap the words.
- Build: code (Lora Bold, Bebas Neue, gradient via background-clip, per-letter stagger quantised to 10 fps).

### 5. Mono typewriter / quote title
- Seen in: JAM 29.68–31.2 (small label), 52.4–55.92 (3-line quotes), 56.32–59.48 (full-frame quote card).
- Use / trigger:
  - Definitions, jargon labels and the closing takeaway.
  - Can run ahead of the voice by 0.4 s or lag by 0.3–0.5 s.
- Layout:
  - Left-aligned block at x 8–17%, ragged.
  - Lines at y 8/12.5/17%, or on a card at y 20/25/30% (95 px line pitch).
  - Cap 26–55 px; the label is 26 px at y 5%.
  - Wrapped in straight quotes.
  - The jar sits below the text, with no overlap.
- Colors / type:
  - Courier Prime Bold, yellow #EDE24B / #F2E04A.
  - Label shows a green cursor block on a dark halftone top gradient (see 21).
- Motion:
  - Label: 37 cps (~3.7 chars/step).
  - Quotes: 12–25 cps (1–2.5 chars/step).
  - The newest char is grey for one step.
  - Exit: block jumps up off-frame in 2 steps, or scrolls up over 3 steps (0.12 s), or the label drops on the same frame as the overlay.
- SFX: typewriter clicks (denser than type 4), a hit when the last word lands.
- Re-theme: "Decision fatigue" over a rack of 24 jerseys; quote card "choose one kit, own it".
- Build: code.

### 6. Digit build and counter ticker
- Seen in:
  - ARR 2006 (7.36–7.92), 30 (25.52–25.68)
  - JAM 2004 (2.48–3.04), jar counter 6→24 (15.2–16.48), option counter 7→24 (23.2–24.64)
  - GOLD "2004"-style digit/mark beats
- Use / trigger: dates, stats and quantities. The counter hits its target 0.3–0.5 s before the number is spoken.
- Layout:
  - 2006: Montserrat ExtraBold, gold #E8BC5C, cap 160 px, 85% wide, y 18%.
  - 2004: Lora Bold yellow, cap 100 px, x 72%, y 27%.
  - 30: halftone-gold ExtraBold, cap 300 px, y 28%.
  - Counters: "6 VARIETIES" gold #D4A456 cap 48 px on crate at y 65%; "6 OPTIONS" yellow #F4E21A cap 70 px at y 15%.
- Motion:
  - Digits appear one per 2–4 frames (1 step), the new digit at 25–40% opacity.
  - Giant number: ghost at 25% opacity and +5% scale, settling over 4 frames.
  - Counters change as a hard text swap each 2–3 frames (≈1.2 values/step, 14 values/s), with no scale pulse.
  - Each tick spawns a prop (see 13).
- SFX: tick/bubble pop on every second increment, riser under the climb, hit on the final value.
- Re-theme: SKU counter 6→24 kit designs; "£12 → £48 per kit", "300 shirts".
- Build: code (counter), props from Flow.

### 7. Host cutout over designed background
- Seen in:
  - GOLD 0.2–2.32, 2.32–4.0
  - JAM 0.4–4.8, 52.32–56.12, 40.36–44.96
  - DK 85, 90, 92, 96
  - ARR 8.88–10.8, 16.64–20.16, 21.6–24.64, 26.52–27.76
- Use / trigger: a speaker, case study or concept anchored in a visual world. The host is rotoscoped, with no outline or shadow.
- Layout:
  - Head 30–50% wide, bottom-cropped at the shoulders, centre y 40–70%.
  - Z-order: bg < bg elements < title < host < props < caption.
  - The title sits behind the head.
- Colors / photo:
  - Sepia #6B4E33 + halftone silhouette.
  - Dusk navy #0E1526→#D9722E.
  - Teal #2E5654.
  - Blue gradient #4F6EB8→#1F3A85 with dust.
  - Maroon #7E3340.
  - Faint blue rim on the host.
- Motion:
  - Punch-in 1.0→1.4× while sliding down, in 7 frames (3 steps, ease-out).
  - Head sway ±3%.
  - Bg slow push 4%/s.
  - Host can shrink to a corner (head 30%, x 78%) in 6 frames, then re-grow 8%/s.
- Transition in: 6-frame crossfade from the live room. Out: 0.3 s dissolve, or hard cut.
- SFX: whoosh on entry, bubble pops for bg elements, riser before reveals.
- Re-theme: founder cutout over stadium/jersey collage.
- Build: code compositing + host matting; bg elements from Flow.

### 8. Host pop-up / sink / slide reveal
- Seen in:
  - GOLD 18.12–18.72, 19.84–20.4 (sink), 23.52–24.12, 35.76–36.0
  - JAM 11.92–13.28, 52.0–52.32, 56.08
  - ARR 10.8–11.28, 26.52–27.4, 39.92–40.4, 1.6–2.16 (drop out)
- Use / trigger:
  - Fires on the first word of a sentence ("And", "Her", "So").
  - Brings the host in or out between collage and live room.
  - The sink reveals a hero photo.
- Layout: enters from the bottom or bottom-right, ends at head y 10–38%, scale 0.5–0.7→1.0, with a 3% overshoot.
- Motion:
  - Rise ~800 px in 10 frames (4 steps, ease-out): head y 70→38→23→15→10%.
  - Sink: head y 30→72% in 10 frames (4 steps).
  - Quick exit: 3–4 frames.
  - Then a 0.3 s (8 frames, 3 steps) cyan-glow dissolve into the live room.
- SFX: whoosh up and bubble pop; reverse whoosh on sink.
- Build: code with the matted host.

### 9. Treated photo b-roll (halftone / sepia / duotone / selective colour)
- Seen in:
  - GOLD 4–23.52, 33.68–36
  - DK 5.56–10.48, 16.64–21.6, 23.04–24.36, 28.32–32.88, 39.4–43.2
  - ARR 4.24–8.88
- Use / trigger: archival evidence, named people, "the old days"; one image per phrase (0.6–3 s).
- Layout:
  - Full-bleed, or a cutout on flat colour. Subject 60–95% of frame width.
  - Title on top, caption at y 72%.
- Colors / photo:
  - B&W or sepia halftone (3–6 px dots).
  - Teal duotone #3F6B6E / #4E7C7D, purple-slate #463F5E, navy #26364F.
  - Warm highlight #E9E1D2.
  - Selective colour: people in colour on a greyscale bg with washed sky #E9E9EB.
  - Light contrast lift, no vignette.
- Motion:
  - Push 1.0→1.07–1.12 on ≤1 s stills (8–12%/s), 1.5–4%/s on 2–3 s stills.
  - Blur-in 20–30 px→0 in 4 frames (2 steps).
  - Stepped zoom 1.0→1.3 in 6 frames (see 22).
  - Second figure behind can be blurred 25–30 px and pulled into focus.
- Transition in/out: hard cut with blur-in, torn paper, or 6-frame crossfade.
- SFX: soft hit on the cut, shutter-like tick, whoosh on a zoom exit.
- Re-theme: vintage 1970s–90s club squad photos, old shirts, the club's first shop front.
- Build: Flow image (vintage photo, period clothing, faces plausible), code halftone/duotone filter and push.

### 10. Censor-bar portrait
- Seen in:
  - GOLD 4–7.2, 20.4–23.52, 33.68–35.76
  - DK 2.32–5.56, 23.04–28.16
  - ARR 21.44–24.64, 33.92–40
- Use / trigger: anonymising non-host people in "case study" stories, so the person stays unidentified.
- Layout:
  - Bar over the eyes, parented to the photo layer so it tracks the push.
  - Black #000 rectangle: 180x32 px (14–17% wide, 1.2–3% tall).
  - ARR: white rough brush-stroke bar, 28–30% wide, 20–24 px.
  - DK: black hair blob.
  - Subject centred, head y 25–40%.
- Motion: appears with the photo on the same frame. No animation, only the parent move.
- SFX: none of its own; a hit on the cut.
- Re-theme: club directors with anonymised eyes; AI faces in Flow with a known eye line.
- Build: Flow subject + code bar tracked on the image.

### 11. Film / stock / clip b-roll
- Seen in:
  - ARR 13.12–16.48 (film clips), 30.24–32.48 (stock), 48.36–56.76 (quote clip)
  - DK 32.96–36.52 (gym footage), 16.64 (headphones footage)
- Use / trigger: literal illustration on a keyword ("high-achieving students", "hobbies", "pursuit"). Clips run 0.5–1.4 s, cut on the keyword.
- Layout:
  - Full-bleed, caption pill on top.
  - Quote clip: native handwriting subtitles, cream #F5EBC8, no box, y 64–78%, plus a bottom 20% dark gradient.
- Colors / photo: natural colour, or halftone-dither + 3-frame blur-in (stock). Gym grade: teal-grey with deep blacks.
- Motion: ~1.05× push, clip's own motion, glitch lines. Blur-dissolve of 2 frames between stock clips.
- SFX: hit on the cut; the quote clip keeps its source audio.
- Re-theme: stock of fans, stadium, shop floor, a kit-room shelf.
- Build: licensed or stock footage, or Flow video clips; code the grade. Film clips carry copyright risk.

### 12. Cutout collage on a designed gradient
- Seen in:
  - GOLD 11.6–14.4, 47.72–51.06
  - JAM 9.68–11.92, 13.28–14.4
  - DK 2.32–5.56, 10.6–16.16, 24.36–28.16
  - ARR 1.52–4.24, 16.64–27.76, 33.92–40
- Use / trigger: metaphors and story characters (finish-line ribbon, stadium, jam stall, manor).
- Layout:
  - Subject cutout 75–95% wide, head y 24–40%.
  - Gradient bg with halftone.
  - Title top 5–35% behind the subject.
  - A foreground parallax layer (spectators, seats) is optional.
  - A flat red half-circle "sun" sits behind the subject.
- Colors:
  - Crimson #7A2233→#D9707F.
  - Maroon #2E2224→#7A5558 + sun #D42A30 / #E3283C.
  - Purple #4B4468→#6A5F88.
  - Gray halftone #BEBFC1.
  - Navy #0E2038→#2F5B8C.
  - Red #E5322B + yellow #F6D46B.
- Motion:
  - Subject slides up 10–12 frames (4–5 steps), ease-out, no overshoot.
  - Drift 1%/s.
  - Fast drift 10%/0.6 s.
  - Sun rises ~7%/s.
  - Next cutout swaps by a 2-frame vertical slide (70–90 px) or a 10-frame blur-dissolve.
- Transition in: torn paper, circle reveal, or slide.
- SFX: whoosh on each swap, bubble pop on props.
- Re-theme: B&W director cutout over a kit-colour disc and stadium silhouette.
- Build: Flow image (isolated subject on transparent/white), code gradient, halftone and sun.

### 13. Props and object pop-ins
- Seen in:
  - GOLD Olympic rings 5.76 and medal 5.84, globe 14.64–18.12
  - JAM falling jar 7.76, six jars 10.32–10.88, jar multiplication 15.2–16.5, jar grid 21.68–22.08, thumbs hands 22.16–24.0, jar stack 52.56–56
  - DK coin 19.76–22.9, "?" swarm 43.12–46.5, fish 46.52, 53.08
- Use / trigger: lands 0–0.1 s before the spoken noun; one prop per step.
- Layout:
  - Props 6–26% of frame width, hero up to 57%.
  - Z-order: above host or bg, below title and caption.
  - Row or grid.
  - Contact shadow.
- Motion:
  - Pop: 2–3 steps, scale 0.4→1.0.
  - Drop from the top: 6 frames (2–3 steps) with 1–2% overshoot.
  - Slide-up: 40–60 px per step, one prop per step.
  - Coin Y-flip to edge-on in 16 frames.
  - Globe drops 22%→49% over 2 steps, then rotates.
  - Hands slide from the edge with ease-out (8% width per step).
  - "?" marks re-scatter every step.
- SFX: bubble pop per prop, whoosh on slides, coin ting, riser on floods.
- Re-theme: jerseys in 6→24 colourways, boots, scarves, trophy, shopping bags, "6 kit designs" grid.
- Build: Flow image (isolated glossy object, 6 colourways on a clean bg) + code animation.

### 14. App-icon tile
- Seen in: JAM 40.8–44.96.
- Use / trigger: names a platform or topic in a list ("Netflix", "career", "life partner"); pops on the noun.
- Layout:
  - Tile centred x 50%, y 15–18%, above the host's head.
  - 22% wide at first, 37% (400 px) later, radius 20%.
- Colors:
  - Black tile with red N.
  - Grey #6B6B6B blank.
  - White #FFF tile with black line art.
  - Heart #E8333F.
  - Lime outline #C6F200 / #A6E22E, 3–4 px.
- Motion:
  - Hard pop, no ease.
  - Outline traces clockwise from the top-right in 17 frames (7 steps).
  - Loader arc rotates.
  - Icon swaps instantly (grey blank → briefcase → heart).
- SFX: bubble pop; soft click when the outline closes.
- Re-theme: club-badge tile → shop icon → trophy. Brand logos need clearance.
- Build: code (SVG stroke-dashoffset); icons from SVG or Flow.

### 15. Hand-drawn marks
- Seen in:
  - GOLD JESSICA 4.16–4.64
  - DK 2.56–4.8 (A+ → F)
  - ARR 17.04–17.92 (F→A+ circle), chalk LOST 38.56
- Use / trigger: grades, emphasis and emotion ("smart", "achieved", "lost").
- Layout:
  - Red circle diameter 22–30% of width, centred on the target.
  - JESSICA: cap 80 px, y 8–10%, 55% wide.
  - LOST: 80% wide, 14% tall, y 57%.
- Colors / type:
  - Marker red #D8232A, 5 px stroke (20 px at 1080).
  - Yellow #F5C518 marker.
  - Chalk white.
  - Gaegu Bold.
- Motion:
  - Circle drawn in 6–10 frames (3–4 steps).
  - Glyph in 6 frames; "+" added later.
  - JESSICA draws stroke by stroke over 12 frames (5 steps).
  - Exit: slides off right in 2–3 steps, burns away, or is pushed off-frame.
- SFX: marker scribble, a pop on close.
- Re-theme: circle a price tag or a jersey number; "A+" → "SOLD OUT".
- Build: code (SVG stroke draw, mask for text).

### 16. Full-screen title card with hero object
- Seen in:
  - JAM 5.36–6.32, 7.52–9.44, 21.68–24.88
  - GOLD 14.4–14.52
  - DK 46.52–48.52, 53.08–54.72
- Use / trigger: introduces a concept or experiment (jam jar, small fish, THE PARADOX OF CHOICE). 1–2 s holds.
- Layout:
  - Flat or gradient bg (#5547A6, #33505A, #4B3E9B) with halftone specks.
  - Hero object at x 50%, y 40–60%, 26–57% wide, with a soft contact shadow.
  - Two-line title top or behind.
  - JAR sits in front of the jar, with JAM behind.
- Motion:
  - Title static before the object.
  - JAR pops at y 65% then snaps to 37% in 2 frames.
  - Hero object drops in 6 frames.
  - Secondary label types at 25 cps.
  - Fish wiggles on a 6 fps loop.
- Transition in/out: torn paper (see 17), blur-in over 3 frames, hard cut.
- SFX: riser into the drop, bubble pop or thud on landing, key clicks.
- Re-theme: "TEAM STORE" with one jersey on a plinth; "24 DESIGNS" card.
- Build: Flow hero image + code type.

### 17. Torn-paper wipe
- Seen in:
  - GOLD 14.96–15.28 (reveal), 47.58–47.72
  - JAM 7.34–7.52, 9.44–9.68, 21.28–21.68, 52.0–52.32
  - DK 0.24–0.8, 2.08–2.32, 10.48–10.6
  - ARR 21.28–21.44, 33.76–33.92
- Use / trigger: topic change, or a new "chapter" at the start of a sentence ("when", "But", "and"). It is the most-used signature transition.
- Layout:
  - Coloured paper band with a ragged white fibre edge (3–6 px rim) and a dark shadow under it.
  - Opens from the centre or sweeps in a direction: y 40–52% → 8–85% → full.
- Colors: purple #5B45A8, crimson #8E2B3B, blue #3C6C9E, navy #0F2038, purple-grey #5A5272, plus halftone/grain on the paper.
- Motion:
  - 3–5 frames (2 steps).
  - Edges move in 2-frame jumps.
  - Panel drop 12 frames (5 steps) ease-out.
  - Torn edge leads photo wipes.
  - Torn split: halves push apart in 3 frames.
- SFX: paper rip + whoosh; riser when it follows a hand swipe.
- Re-theme: grass strip or kit-fabric colours as the band.
- Build: code (clip-path with jagged noise mask, SVG displacement) or a prerendered alpha sequence; Flow torn-paper texture.

### 18. Blur / defocus / dissolve transitions
- Seen in:
  - GOLD 3.84, 7.2, 51.06–51.36
  - JAM 40.2–40.36
  - DK 13.36–13.76, 16.16–16.64, 28.16–28.32, 32.88–33.2
  - ARR 16.48–16.64, 12.0, 30.24, 32.48
- Use / trigger: soft hand-off between photo and host, or a rack-focus into a new shot.
- Layout: whole frame, caption untouched on top.
- Motion:
  - Blur-in 20–30 px→0 in 4 frames (2 steps).
  - Blur-out 2 frames.
  - Cross-dissolve 2–8 frames, linear.
  - Cyan glow #2FA8FF wash during a dissolve to the room (6–8 frames).
  - A foreground object (laptop lid) can sweep off at 16.24–16.64 for 12 frames (5 steps).
- SFX: low whoosh, or a swell; riser.
- Build: code (blur filter, opacity cross).

### 19. Slide / push / whip / circle reveal
- Seen in:
  - GOLD 1.84–2.32 (horizontal push), 14.52–14.64 (tilt-up whip)
  - JAM 4.8–5.36
  - DK 13.36 (slide-up)
  - ARR 1.2–1.52 (circle)
  - GOLD 49.36 (vertical jerk)
- Use / trigger: moves between related scenes while the host stays locked.
- Motion:
  - Horizontal push: 12 frames (5 steps), ease-in-out, parallax with the title slightly faster.
  - Whip: 3 frames.
  - Vertical jerk: 90 px in 2 frames.
  - Halftone circle 0→70% in 2 frames, then fills the frame.
- SFX: whoosh.
- Re-theme: wipe along a pitch line.
- Build: code.

### 20. Organic effect wipes
- Seen in:
  - ARR 20.16–20.56 (burn-away), 37.6–37.92 (blood), 48.28–48.44 (glitch light leak)
  - DK 24.36–26.24 (chroma-green flicker), 26.24 (hard swap to red)
- Use / trigger: a payoff line ("never the case"), danger, or a mood flip.
- Layout / colors:
  - Burn blobs #120A0A with pink bokeh #E0344F and charred edge #5A3A24.
  - Blood #8E1B1B fill over the whole frame.
  - Chroma #1FEA00, 2-pulse blink in 8 frames.
  - Red swap #D8231C.
- Motion: 8–10 frames (3–4 steps); a hard swap on the next word.
- SFX: crackle, wet splat hit, glitch zip.
- Re-theme: paint splash or club-colour ink instead of blood.
- Build: stock or Flow overlay video + code masks.

### 21. Texture / atmosphere layer
- Seen in: most graphics shots, and JAM 29.68–31.12.
- Spec:
  - Halftone dots 3–6 px pitch.
  - Paper grain, dust specks that twinkle, sparkles (G of "DUNNING" at 1.12).
  - Soft vignette.
  - Top dark gradient (#1A1A1A at 60%, 0–22% height) that ramps in over 8 frames and drops hard.
- Use: unifies disparate assets into one "editorial" look.
- Build: code (CSS/SVG pattern, tiling noise).

### 22. Camera moves on stills and collages
- Seen in:
  - GOLD 10.16 (1.0→1.5× in 4 steps), 21.76–22.0 (1.0→1.3× stepped)
  - DK 8.0 (1.5–1.6× in 4 steps), 42.24 (pan 250 px/frame)
  - ARR 7.2–8.88 (accelerating push)
  - Slow pushes on most stills
- Rules:
  - All moves sit on a parent layer, with the title parented so it rides off.
  - Default push is 1.5–4%/s; on ≤1 s stills it is 8–12%/s.
  - Ease-in into a cut.
  - 10 fps stepping for moves on graphics, smooth on footage.
- SFX: whoosh/riser on fast zooms.

## Cross-cutting rules

**Rhythm**
- 155 shots in 230 s, so 40 shots/min and a 1.48 s mean.
- By reel:
  - GOLD 45/min (1.33 s)
  - JAM 40/min (1.49 s)
  - DK 36/min (1.67 s)
  - ARR 41/min (1.48 s)
- By kind:
  - Talking-head (labelled): ~50 shots, ~94 s (41%), 1.9 s mean.
  - Host-cutout: 29 shots, ~46 s (20%), 1.6 s mean.
  - Photo/b-roll: 30 shots.
  - Graphics: 25 shots.
  - Photo + graphics together: ~55 shots over ~86 s, 1.6 s mean.
  - Transitions: 21 shots, ~4 s total (2% of screen time, 14% of shots), 0.1–0.5 s each.
- Host on screen (live or cutout) is about 55%; pure graphics or photo about 43%.
- A visual event lands roughly every 2–3 s.

**Transition mix**
- 21 transition shots:
  - Torn paper 10 (48%)
  - Blur/dissolve 7 (33%)
  - Slide/push/whip/circle 4 (19%)
- Across all ~154 boundaries, estimated:
  - Hard cuts and jump cuts ~65%
  - Torn paper ~7%
  - Blur-in/dissolve ~15%
  - Slide/push ~5%
  - Organic/colour swaps ~3%
  - Other (host pop-ups) ~5%

**Palettes per reel**
- GOLD: sepia #6B4E33, gold #D9B47A / #E6B96E, dusk #0E1526→#D9722E, crimson #7A2233→#D9707F, purple #7A2E8E, cream pill.
- JAM: yellow #F2DE2E / #FFF04A, purple #5547A6, blue #2F6399→#1F3A85, teal #2E5654, black.
- DK: purple-grey #4B4468, teal #3F6B6E, maroon #2E2224→#7A5558 + red #D42A30, navy #26364F, chroma green #1FEA00, red #D8231C.
- ARR: gray halftone #BEBFC1 + red #E8321F, teal #1D4254, gold #E3B96A, maroon #7E3340, navy #0E2038→#2F5B8C, red #E5322B, yellow #F6D46B.
- Each reel is monochrome-ish B&W/sepia photos plus one saturated accent colour.

**Title rules**
- Titles are typed, with 1–2 lines per concept.
- They lead the voice by 0.1–0.6 s.
- They sit behind the host.
- Title colour is one accent per reel.
- Hero word in the larger Lora Bold line, label in tracked Bebas Neue.
- Never more than one title on screen, except the stacked "Jane / MILLIONAIRE BY 30".
- Titles that exit ride the camera or drop hard.

**SFX and music habits**
- Music bed is quiet, "inspirational corporate / tech house, vocal chop", with no steady beat.
- Loudness is -14.3 to -14.5 LUFS, LRA 1.8–2.3.
- 88–97% of cuts have an onset within 100 ms.
- Event SFX: bubble pops on element pops, whip whooshes on transitions, risers before reveals, typewriter clicks under typed text, punchy hits on some cuts.
- Keep SFX sparse and tied to events.

**Production**
- Captions run constantly at y 72%, above everything.
- Graphics run at 10 fps cadence against 25 fps live footage.
- Every non-host person gets a censor bar.

## New building blocks
- **TypewriterTitle(lines, preset):** per-letter stagger at a 10 fps step clock, newest-letter ghost, big-letter 1.3× pop, gradient+shadow presets (gold, cream, yellow, red).
- **KaraokePill(words, timestamps):** measured spec, instant resize, y 72%, grey→black word flip, always top layer.
- **StepClock(10 fps):** quantises all graphics timelines to the 3,2,3,2 cadence; footage stays at 25 fps.
- **HostLayer with z-slots:** matted host plus slots for behind-title, in-front-of-props, pop-up, sink and shrink presets.
- **TornPaperWipe(color, direction, steps):** jagged mask + rim + shadow, centre-out, sweep, split and drop variants.
- **CensorBar(track):** rectangle parented to the photo, black or white brush variant.
- **HalftoneGrade(photo, duotone):** dot pitch, duotone and selective-colour mask, plus a top-gradient overlay.
- **PushRig(parent):** title, props and photo share one parent, with stepped zoom, accelerating push and pan presets.
- **PropPop(stagger):** pop, drop, slide-up and flip animations, one prop per step.
- **CounterTick(from,to,spawn):** hard swaps with a prop spawn hook.
- **IconTile + OutlineTrace:** SVG tile, stroke-draw, instant glyph swap.
- **MarkerDraw:** SVG stroke reveal for circles, grades, JESSICA and chalk words.
- **BlurDissolve(in/out):** gaussian pull-focus, glow-wash dissolve.
- **SFX trigger map:** every element event (type start, pop, wipe, cut) auto-places its SFX within 100 ms.