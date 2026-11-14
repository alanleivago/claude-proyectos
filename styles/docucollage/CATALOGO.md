---
type: spec
status: active
tags: [docucollage, motion-graphics, scene-catalog, editorial-collage, instagram-reels, stimulus, coverage]
relatedTo: [styles/docucollage/ESTILO.md, styles/docucollage/kit.js, styles/docucollage/ref_frames, fuentes/docucollage]
---

# docucollage: catálogo de tipos de escena (4 reels del mismo creador)

Los reels están en `fuentes/docucollage/reels/<id>/` (GOLD = DIV6ZPFIx3y, JAM = DHt949poQGJ, DK = DHgssOYoF6v, ARR = DF0jP-vIYlk).

**Cobertura:**
- 155 planos clasificados, 116 con gráficos (GOLD 32, ARR 29, DK 28, JAM 27).
- El análisis cubrió **todos** los frames: uno de cada dos (12.5 fps) en ventanas de 7.2 s por la API, en `framelevel/w_*.md`.
- Hay un frame por plano en `ref_frames/<reel>/sNNN_t.jpg` y un frame por tipo en `ref_frames/types/`. El índice está en `ref_frames/index.json`.
- Revisé a mano los 22 frames de tipo contra su clasificación y todos cuadran. También revisé cuadro a cuadro el papel rasgado (DK 10.40-10.68, JAM 7.28-7.72, DK 0.20-0.84) y la píldora de subtítulos (DK 9.0, medida en píxeles).

**Medidas comunes (ver ESTILO.md):**
- Gráficos a **10 fps** (cambio cada 3, 2, 3, 2 frames a 25 fps) y footage a 25 fps.
- -14.4 LUFS. El 88-97 % de los cortes tiene un onset a ≤100 ms.
- Fuentes: Bebas Neue, Lora Bold, Montserrat ExtraBold, Courier Prime Bold, Gaegu Bold y Poppins Bold.

**Convenciones del cuerpo (en inglés, síntesis por la API corregida con las medidas):**
- Los frames van a 25 fps; un paso son 2.5 frames.
- La línea "Build" dice qué va en Flow y qué en código.
- La línea "Test" dice dónde se usó en `pieces/docucollage-test`.

## Scene types

Notes that apply to every type:
- All frame counts are at 25 fps. Steps are at 10 fps, a change every 3,2,3,2 frames, so 1 step ≈ 2.5 frames. The breakdowns say "12.5 fps", but the measured cadence is 10 fps for motion graphics. Talking-head footage runs at the full 25 fps.
- Titles lead the spoken word by 0.1–0.6 s.
- Sources are 608x1080 (GOLD, ARR) and 720x1280 (JAM). Build everything at 1080x1920.

### 1. Talking-head, plain (live room)
- Test (docucollage-test): S3, S14, S16
- Ref frames: `ref_frames/types/01_talking-head-plain-live-room_GOLD_0.10.jpg`
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
- Test (docucollage-test): S3 4.98, S11 24.06, S14 35.05, S16 42.84
- Ref frames: `ref_frames/types/02_jump-cut-punch-in-reframe_JAM_6.50.jpg`
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
- Test (docucollage-test): todo el video
- Ref frames: `ref_frames/types/03_karaoke-caption-pill_DK_9.00.jpg`
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
- Test (docucollage-test): S1 CLUB DIRECTORS, S5, S7 (detrás del host), S9, S10, S12, S15
- Ref frames: `ref_frames/types/04_stacked-serif-typewriter-title-hero-titl_GOLD_10.96.jpg`
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
- Test (docucollage-test): S4 label, S13 labels, S14 label, S17 cita
- Ref frames: `ref_frames/types/05_mono-typewriter-quote-title_JAM_30.28.jpg`
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
- Test (docucollage-test): S2 $5,000 dígito a dígito
- Ref frames: `ref_frames/types/06_digit-build-and-counter-ticker_JAM_24.04.jpg`
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
- Test (docucollage-test): S5 navy, S7, S15 atardecer, S17 azul
- Ref frames: `ref_frames/types/07_host-cutout-over-designed-background_GOLD_1.02.jpg`
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
- Test (docucollage-test): S5 pop-up, S2 y S4 el host baja
- Ref frames: `ref_frames/types/08_host-pop-up-sink-slide-reveal_GOLD_18.42.jpg`
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
- Test (docucollage-test): S6 tienda teal, S10 familia color, S13 campo y familia B/N
- Ref frames: `ref_frames/types/09_treated-photo-b-roll-halftone-sepia-duot_GOLD_8.82.jpg`
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
- Test (docucollage-test): S6 tendero, S10 familia, S13c
- Ref frames: `ref_frames/types/10_censor-bar-portrait_GOLD_5.60.jpg`
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
- Test (docucollage-test): (no usado: sin metraje de stock)
- Ref frames: `ref_frames/types/11_film-stock-clip-b-roll_DK_34.48.jpg`
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
- Test (docucollage-test): S2 vendedor + sol rojo, S12 dinero, S13b entrenador
- Ref frames: `ref_frames/types/12_cutout-collage-on-a-designed-gradient_GOLD_13.00.jpg`
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
- Test (docucollage-test): S5 chaqueta y camiseta, S9 grilla de 6 colores, S12 dinero y vale, S17 camiseta
- Ref frames: `ref_frames/types/13_props-and-object-pop-ins_GOLD_14.80.jpg`
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
- Test (docucollage-test): S11 candado, S16 toggle
- Ref frames: `ref_frames/types/14_app-icon-tile_JAM_41.64.jpg`
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
- Test (docucollage-test): S4 círculo en STORE CREDIT, S6 elipse en el cartel, S8 'less!' + flecha, S12 X roja
- Ref frames: `ref_frames/types/15_hand-drawn-marks_ARR_17.60.jpg`, `ref_frames/types/15_hand-drawn-marks_DK_3.00.jpg`
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
- Test (docucollage-test): S8 CUSTOM / JERSEYS
- Ref frames: `ref_frames/types/16_full-screen-title-card-with-hero-object_GOLD_14.46.jpg`
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
- Test (docucollage-test): S4 6.06, S8 17.23, S12 26.70, S17 46.72
- Ref frames: `ref_frames/types/17_torn-paper-wipe_GOLD_15.24.jpg`
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
- Test (docucollage-test): S6, S7 (blur-in), S10, S13
- Ref frames: `ref_frames/types/18_blur-defocus-dissolve-transitions_GOLD_7.26.jpg`
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
- Test (docucollage-test): S2 círculo con trama
- Ref frames: `ref_frames/types/19_slide-push-whip-circle-reveal_GOLD_2.08.jpg`
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
- Test (docucollage-test): (no usado)
- Ref frames: `ref_frames/types/20_organic-effect-wipes_DK_25.30.jpg`
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
- Test (docucollage-test): degradado oscuro arriba en S4, S10, S13, S14; trama y polvo en todos los fondos
- Ref frames: `ref_frames/types/21_texture-atmosphere-layer_JAM_30.00.jpg`
- Seen in: most graphics shots, and JAM 29.68–31.12.
- Spec:
  - Halftone dots 3–6 px pitch.
  - Paper grain, dust specks that twinkle, sparkles (G of "DUNNING" at 1.12).
  - Soft vignette.
  - Top dark gradient (#1A1A1A at 60%, 0–22% height) that ramps in over 8 frames and drops hard.
- Use: unifies disparate assets into one "editorial" look.
- Build: code (CSS/SVG pattern, tiling noise).

### 22. Camera moves on stills and collages
- Test (docucollage-test): S2 salida con zoom, S4 zoom escalonado, push en todos los stills
- Ref frames: `ref_frames/types/22_camera-moves-on-stills_GOLD_10.20.jpg`
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

## Favoritos del usuario (vara de calidad, `ref_frames/user_favs/fav_80..100.png`)
| fav | composición | fuente del título | réplica en docucollage-test v2 |
|---|---|---|---|
| 80 | host abajo delante de una espalda con medallas, título GOLD MEDAL / SYNDROME detrás | Bebas + Besley 900 dorado | S1: host abajo + vestuario, CLUB / DIRECTORS |
| 81 | host abajo delante de una silueta en un banco al atardecer, WHY YOU ARE / UNHAPPY | igual | S1 / S11 (host que sube sobre la foto) |
| 82-83 | nena de cuerpo entero, JESSICA a mano en amarillo; después se suman aros y medalla | mano | S2: vendedor de cuerpo entero + cheque que hace pop |
| 84-85 | familia en color sobre pista B/N, barras borroneadas, FORMER ATHLETE / DISCIPLINE & FOCUS | Bebas + serif | S10: familia en color selectivo, barras con landmarks |
| 86 | corredor en la pista detrás de tribunas, con padres en primer plano | Bebas + serif blanco | S15: campeones con capa en parallax |
| 87 | papel rasgado + globo, PURSUIT OF / PERFECTION | Bebas + serif | rasgado S4/S8/S17 |
| 88 | podio, GOLD / MEDAL detrás de los brazos | serif | S12 bolso + CASH; burst S9/S15 |
| 89 | escalador sobre borde de roca diagonal, rojo, 4 líneas serif | Besley | S17: termómetro sobre rojo, serif apilado |
| 90-92 | JAM JAR, cajón con frascos (13 VARIETIES), grilla de 6 frascos + pulgar | serif amarillo | S9 perchero + etiquetas |
| 93 | retrato duotono teal con serif + itálica ("Justin Kruger in 1999") | serif + itálica | (variante pendiente: Besley itálica) |
| 94-95 | sepia FITNESS; hombre de oficina con medio sol rojo (OVERESTIMATE) | serif / sans ancha | S6 caja registradora sobre granate |
| 96-99 | PSYCHOLOGIST 2006; NEVER THE CASE; YOUNG ENTREPRENEUR Jane; MILLIONAIRE BY 30 con barra de papel roto | geométrica ancha (reels 2-4) | no se usa: el usuario pidió las fuentes del reel 1 para todos los títulos |
| 100 | silueta roja con EMPTY / LOST a mano temblorosa | mano | "less!" a mano en S8 |

Variantes de censura: barra sólida, barra borroneada (pincel) y barra de papel roto blanco. La prueba usa sólida en el montaje B/N y borroneada en la familia y los campeones.

## Cobertura por plano (todos los planos de los 4 reels)

| Reel | Plano | Tiempo (s) | Clase | Gráficos | Tipo | Nota | Frame |
|---|---|---|---|---|---|---|---|
| GOLD | 1 | 0.00-0.20 | talking-head | sí | 1. Talking-head, plain (live room) (+3,4,18) | Host in blue room, hook question, sepia bg crossfade starting | `ref_frames/GOLD/s001_0.10.jpg` |
| GOLD | 2 | 0.20-1.84 | host-cutout-over-bg | sí | 7. Host cutout over designed background (+4,3,21) | Host cutout over athlete-with-medals sepia, GOLD MEDAL SYNDROME typewriter title | `ref_frames/GOLD/s002_1.02.jpg` |
| GOLD | 3 | 1.84-2.32 | transition | sí | 19. Slide / push / whip / circle reveal (+7,4,3) | Bg and title slide left, bench scene enters from right, host fixed | `ref_frames/GOLD/s003_2.08.jpg` |
| GOLD | 4 | 2.32-4.00 | host-cutout-over-bg | sí | 7. Host cutout over designed background (+4,3,18) | Host over lonely bench silhouette, WHY YOU ARE UNHAPPY typewriter, blur exit | `ref_frames/GOLD/s004_3.16.jpg` |
| GOLD | 5 | 4.00-7.20 | photo/broll | sí | 10. Censor-bar portrait (+9,13,15,22,18,3) | Child flexing, censor bar, handwritten JESSICA, Olympic rings and medal pop, slow zoom | `ref_frames/GOLD/s005_5.60.jpg` |
| GOLD | 6 | 7.20-7.32 | photo/broll | sí | 18. Blur / defocus / dissolve transitions (+9,10,13,3) | defocused child with medal under rings, caption 'her entire life' | `ref_frames/GOLD/s006_7.26.jpg` |
| GOLD | 7 | 7.32-10.32 | photo/broll | sí | 9. Treated photo b-roll (halftone / sepia / duotone / selective colour) (+4,10,18,22,3) | B&W bg, colored people, blur-to-sharp, gold FORMER ATHLETE title, zoom exit | `ref_frames/GOLD/s007_8.82.jpg` |
| GOLD | 8 | 10.32-11.60 | photo/broll | sí | 4. Stacked serif typewriter title (hero title) (+9,22,10,3) | same photo push-in/pan, gold DISCIPLINE & FOCUS typed, rides camera off | `ref_frames/GOLD/s008_10.96.jpg` |
| GOLD | 9 | 11.60-14.40 | graphics (designed bg/collage) | sí | 12. Cutout collage on a designed gradient (+4,18,13,21,3) | blur-in, parallax spectators, white serif JESSICA'S DREAM navy shadow typed | `ref_frames/GOLD/s009_13.00.jpg` |
| GOLD | 10 | 14.40-14.52 | graphics | sí | 16. Full-screen title card with hero object (+4,12,3) | JESSICA'S DREAM serif title over sky, runner cutout, audience heads | `ref_frames/GOLD/s010_14.46.jpg` |
| GOLD | 11 | 14.52-14.64 | transition | sí | 19. Slide / push / whip / circle reveal (+3,16) | title slides down, blurred sky whip into space gradient | `ref_frames/GOLD/s011_14.58.jpg` |
| GOLD | 12 | 14.64-14.96 | graphics | sí | 13. Props and object pop-ins (+3,21) | night-lights globe drops in on navy-teal gradient, 'the globe' caption | `ref_frames/GOLD/s012_14.80.jpg` |
| GOLD | 13 | 14.96-15.52 | photo/broll | sí | 17. Torn-paper wipe (+9,13,21,3) | sprinters at blocks wiped down with torn edge behind globe | `ref_frames/GOLD/s013_15.24.jpg` |
| GOLD | 14 | 15.52-16.32 | photo/broll | sí | 9. Treated photo b-roll (halftone / sepia / duotone / selective colour) (+13,22,21,3) | stadium sprint photo, slow push, globe rotating, halftone | `ref_frames/GOLD/s014_15.92.jpg` |
| GOLD | 15 | 16.32-18.12 | photo/broll | sí | 4. Stacked serif typewriter title (hero title) (+9,13,21,3) | overhead orange track; PURSUIT OF PERFECTION typed letter by letter | `ref_frames/GOLD/s015_17.22.jpg` |
| GOLD | 16 | 18.12-18.72 | host-cutout-over-bg | sí | 8. Host pop-up / sink / slide reveal (+18,13,4,3) | host cutout pops from bottom, collage dissolves to real room | `ref_frames/GOLD/s016_18.42.jpg` |
| GOLD | 17 | 18.72-19.84 | talking-head | no | 1. Talking-head, plain (live room) (+3) | host chest-up, blurred blue room, slow push, caption only | `ref_frames/GOLD/s017_19.28.jpg` |
| GOLD | 18 | 19.84-20.40 | host-cutout-over-bg | sí | 8. Host pop-up / sink / slide reveal (+18,9,3) | host sinks down revealing medalist photo behind him | `ref_frames/GOLD/s018_20.12.jpg` |
| GOLD | 19 | 20.40-21.60 | photo/broll | sí | 10. Censor-bar portrait (+9,3) | medalist on podium, black eye bar, static, caption 'on the Olympic stage' | `ref_frames/GOLD/s019_21.00.jpg` |
| GOLD | 20 | 21.60-23.52 | photo/broll | sí | 4. Stacked serif typewriter title (hero title) (+9,10,22,3) | purple podium photo, stepped push-in, serif gold title types letter by letter | `ref_frames/GOLD/s020_22.56.jpg` |
| GOLD | 21 | 23.52-24.12 | host-cutout-over-bg | sí | 8. Host pop-up / sink / slide reveal (+18,4,3) | host rises over fading photo and title, dissolves to room | `ref_frames/GOLD/s021_23.82.jpg` |
| GOLD | 22 | 24.12-28.80 | talking-head | no | 1. Talking-head, plain (live room) (+3) | static blurred teal room, cream pill captions at y72%, no cuts | `ref_frames/GOLD/s022_26.46.jpg` |
| GOLD | 23 | 28.80-33.68 | talking-head | no | 1. Talking-head, plain (live room) (+3) | Static blue-lit room, cream pill captions, per-word gray-to-black highlight, 6 chunks | `ref_frames/GOLD/s023_31.24.jpg` |
| GOLD | 24 | 33.68-34.28 | photo/broll | sí | 9. Treated photo b-roll (halftone / sepia / duotone / selective colour) (+18,22,3) | Blur-in rack focus, slow push, caption 'The awards, the interviews' | `ref_frames/GOLD/s024_33.98.jpg` |
| GOLD | 25 | 34.28-34.88 | photo/broll | sí | 10. Censor-bar portrait (+9,18,22,3) | Seated woman, black eye bar, blur-in, push-in on 'the interviews' | `ref_frames/GOLD/s025_34.58.jpg` |
| GOLD | 26 | 34.88-35.76 | photo/broll | sí | 10. Censor-bar portrait (+9,22,3) | Woman among fans, eye bar, push-in, 'the endless praise' | `ref_frames/GOLD/s026_35.32.jpg` |
| GOLD | 27 | 35.76-36.00 | host-cutout-over-bg | sí | 8. Host pop-up / sink / slide reveal (+9,10,3) | Host slides up from bottom over photo, caption 'it all started to feel empty' | `ref_frames/GOLD/s027_35.88.jpg` |
| GOLD | 28 | 36.00-36.28 | host-cutout-over-bg | sí | 18. Blur / defocus / dissolve transitions (+7,10,3) | Host over B&W crowd photo, cyan glow dissolves crowd into blue room | `ref_frames/GOLD/s028_36.14.jpg` |
| GOLD | 29 | 36.28-37.20 | talking-head | no | 1. Talking-head, plain (live room) (+3) | Host centred in blue-lit room, gesturing, karaoke pill caption below | `ref_frames/GOLD/s029_36.74.jpg` |
| GOLD | 30 | 37.20-38.40 | talking-head | no | 2. Jump-cut punch-in / reframe (+3) | +10% punch-in at 37.20, drifts right, slow push-in begins | `ref_frames/GOLD/s030_37.80.jpg` |
| GOLD | 31 | 38.40-39.30 | talking-head+overlay | sí | 4. Stacked serif typewriter title (hero title) (+1,3) | Gold serif 'WHAT'S NEXT?' pops letter by letter behind host | `ref_frames/GOLD/s031_38.85.jpg` |
| GOLD | 32 | 39.30-43.20 | talking-head | no | 1. Talking-head, plain (live room) (+2,3) | Title cross-dissolves out, zoom reset, host gesturing, captions only | `ref_frames/GOLD/s032_41.25.jpg` |
| GOLD | 33 | 43.20-46.32 | talking-head+overlay | sí | 4. Stacked serif typewriter title (hero title) (+1,3) | host on blue bokeh, 'GOLD MEDAL SYNDROME' gold serif typed from 44.72, karaoke pill captions | `ref_frames/GOLD/s033_44.76.jpg` |
| GOLD | 34 | 46.32-47.58 | talking-head | no | 2. Jump-cut punch-in / reframe (+3,18) | 2-frame dissolve jump cut, host lower/closer, caption 'It's the unexpected realization' only | `ref_frames/GOLD/s034_46.95.jpg` |
| GOLD | 35 | 47.58-47.72 | transition | sí | 17. Torn-paper wipe (+3) | crimson torn-edge strip sweeps vertically, full red cover in 3 frames | `ref_frames/GOLD/s035_47.65.jpg` |
| GOLD | 36 | 47.72-49.52 | graphics | sí | 12. Cutout collage on a designed gradient (+4,3,19,22) | roped climber photo drifting left, 4-line serif typed title 'NO MORE MOUNTAIN LEFT TO CLIMB' | `ref_frames/GOLD/s036_48.62.jpg` |
| GOLD | 37 | 49.52-50.40 | graphics | sí | 12. Cutout collage on a designed gradient (+4,3,19,22) | man on rusted bus, settling slide-down, 'NO MORE CHALLENGES' typed in gold serif | `ref_frames/GOLD/s037_49.96.jpg` |
| GOLD | 38 | 50.40-51.06 | graphics | sí | 12. Cutout collage on a designed gradient (+4,3) | Crimson bg, B&W bus with man cutout, serif title types 'CONQUER' letter by letter | `ref_frames/GOLD/s038_50.73.jpg` |
| GOLD | 39 | 51.06-51.36 | transition | sí | 18. Blur / defocus / dissolve transitions (+3) | 7-frame dissolve from collage to talking head, caption pill stays fixed | `ref_frames/GOLD/s039_51.21.jpg` |
| GOLD | 40 | 51.36-52.36 | talking-head | no | 1. Talking-head, plain (live room) (+3) | Host with clasped hands, blue bokeh, karaoke pill captions 'utterly devastating' | `ref_frames/GOLD/s040_51.86.jpg` |
| GOLD | 41 | 52.36-54.73 | talking-head | no | 2. Jump-cut punch-in / reframe (+3) | Reframed wider, gestures, slow 3% push, CTA 'down in the comments' | `ref_frames/GOLD/s041_53.55.jpg` |
| JAM | 42 | 0.00-0.40 | talking-head | no | 1. Talking-head, plain (live room) (+3) | Host sweeps hand across lens in blue room, blurred whip-in, no caption until 0.32 | `ref_frames/JAM/s042_0.20.jpg` |
| JAM | 43 | 0.40-2.00 | host-cutout-over-bg | sí | 7. Host cutout over designed background (+4,9,3,21) | Barry Schwartz teal photo drops in, host cutout shrinks bottom-right, yellow BARRY SCHWARTZ typewriter | `ref_frames/JAM/s043_1.20.jpg` |
| JAM | 44 | 2.00-2.36 | host-cutout-over-bg | sí | 7. Host cutout over designed background (+4,2,3,19) | Punch-in cut, title slides left off-frame, host drifts down-left | `ref_frames/JAM/s044_2.18.jpg` |
| JAM | 45 | 2.36-4.80 | host-cutout-over-bg | sí | 7. Host cutout over designed background (+4,6,9,22,3) | Reframed host over cropped Barry photo, yellow 2004 types digit by digit | `ref_frames/JAM/s045_3.58.jpg` |
| JAM | 46 | 4.80-5.36 | transition | sí | 19. Slide / push / whip / circle reveal (+7,4,3) | Photo slides left revealing black, THE slides in from right, host enlarges | `ref_frames/JAM/s046_5.08.jpg` |
| JAM | 47 | 5.36-6.32 | graphics | sí | 16. Full-screen title card with hero object (+4,7,21,3) | THE PARADOX OF CHOICE yellow serif stack typed on black/teal foliage, host in front | `ref_frames/JAM/s047_5.84.jpg` |
| JAM | 48 | 6.32-7.20 | talking-head | no | 2. Jump-cut punch-in / reframe (+3) | Hard cut back to uncut host in blue room, gesturing, slight punch-in | `ref_frames/JAM/s048_6.76.jpg` |
| JAM | 49 | 7.20-7.34 | talking-head | no | 1. Talking-head, plain (live room) (+3) | Host talking, blue bokeh room, caption pill, keyboard foreground | `ref_frames/JAM/s049_7.27.jpg` |
| JAM | 50 | 7.34-7.52 | transition | sí | 17. Torn-paper wipe (+3,4) | Purple band with torn white edges expands from center in 3 steps, JAM peeks | `ref_frames/JAM/s050_7.43.jpg` |
| JAM | 51 | 7.52-9.44 | graphics | sí | 16. Full-screen title card with hero object (+4,13,3) | Yellow serif JAM/JAR, jar drops with bounce, EXPERIMENT typed on purple | `ref_frames/JAM/s051_8.48.jpg` |
| JAM | 52 | 9.44-9.68 | transition | sí | 17. Torn-paper wipe (+3,13) | Purple band collapses to sliver revealing sky photo, table slides in | `ref_frames/JAM/s052_9.56.jpg` |
| JAM | 53 | 9.68-11.92 | graphics | sí | 12. Cutout collage on a designed gradient (+13,3,21) | Chef cutout rises behind wood table, six colored jars hop in sequentially | `ref_frames/JAM/s053_10.80.jpg` |
| JAM | 54 | 11.92-13.28 | host-cutout-over-bg | sí | 8. Host pop-up / sink / slide reveal (+7,21,13,3) | Host cutout slides up, bg dimmed with halftone, exits down at 13.16 | `ref_frames/JAM/s054_12.60.jpg` |
| JAM | 55 | 13.28-14.40 | graphics | sí | 12. Cutout collage on a designed gradient (+4,13,3) | Slow push-in, gold '6 VARIETIES' then 'OF JAM' fade onto table | `ref_frames/JAM/s055_13.84.jpg` |
| JAM | 56 | 14.40-18.08 | host-cutout-over-bg | sí | 7. Host cutout over designed background (+6,13,4,3) | B&W host cutout behind jar stack, counter 6→24, jars multiply, white pill captions | `ref_frames/JAM/s056_16.24.jpg` |
| JAM | 57 | 18.08-21.28 | talking-head | no | 1. Talking-head, plain (live room) (+3) | Host gestures to camera, slow push-in, white pill captions, no overlays | `ref_frames/JAM/s057_19.68.jpg` |
| JAM | 58 | 21.28-21.60 | transition | sí | 17. Torn-paper wipe (+3) | Blue torn paper strip expands vertically covering frame, caption persists | `ref_frames/JAM/s058_21.44.jpg` |
| JAM | 59 | 21.60-21.68 | transition | sí | 17. Torn-paper wipe (+13,3) | Blue paper plate with torn edges expands over host video, jars already on it | `ref_frames/JAM/s059_21.64.jpg` |
| JAM | 60 | 21.68-22.16 | graphics | sí | 13. Props and object pop-ins (+16,6,3) | Six gingham-lid jam jars slide up one per step on blue textured bg; 6 OPTIONS title fades in | `ref_frames/JAM/s060_21.92.jpg` |
| JAM | 61 | 22.16-23.20 | graphics | sí | 13. Props and object pop-ins (+16,6,3) | Thumbs-up hand slides in from right and parks center over jars; 6 OPTIONS yellow serif | `ref_frames/JAM/s061_22.68.jpg` |
| JAM | 62 | 23.20-24.88 | graphics | sí | 6. Digit build and counter ticker (+13,16,3) | Option counter ticks 7 to 24, jars flood and shrink to 5-col grid, thumbs-down dominates | `ref_frames/JAM/s062_24.04.jpg` |
| JAM | 63 | 24.88-28.80 | talking-head | no | 1. Talking-head, plain (live room) (+3) | Host in blazer gesturing, slow push-in, white pill captions only, no overlays | `ref_frames/JAM/s063_26.84.jpg` |
| JAM | 64 | 28.80-29.36 | talking-head | no | 1. Talking-head, plain (live room) (+3) | static wide framing, caption pill 'which jam to pick', 'and exprience' | `ref_frames/JAM/s064_29.08.jpg` |
| JAM | 65 | 29.36-31.20 | talking-head+overlay | sí | 5. Mono typewriter / quote title (+2,21,3) | 1-frame blend punch-in, top halftone gradient, yellow mono 'Decision making paralysis' typed ~37cps | `ref_frames/JAM/s065_30.28.jpg` |
| JAM | 66 | 31.20-36.00 | talking-head | no | 1. Talking-head, plain (live room) (+3) | overlay drops on 31.2, slow handheld drift, white pill captions swapping hard per phrase | `ref_frames/JAM/s066_33.60.jpg` |
| JAM | 67 | 36.00-36.68 | talking-head | no | 1. Talking-head, plain (live room) (+3) | Host in blue-lit room, keyboard foreground, white pill caption 'feel confident in their choice' | `ref_frames/JAM/s067_36.34.jpg` |
| JAM | 68 | 36.68-40.20 | talking-head | no | 2. Jump-cut punch-in / reframe (+3) | Tilted, closer framing, slow push, expressive gestures, caption chunks hard-swap every ~1.5s | `ref_frames/JAM/s068_38.44.jpg` |
| JAM | 69 | 40.20-40.36 | transition | sí | 18. Blur / defocus / dissolve transitions (+8,3) | Room crossfades to office B-roll, host scales up into cutout, ghosted double exposure | `ref_frames/JAM/s069_40.28.jpg` |
| JAM | 70 | 40.36-42.92 | host-cutout-over-bg | sí | 14. App-icon tile (+7,3) | Netflix icon pops at 40.80, lime outline traces 41.6-42.3, captions swap | `ref_frames/JAM/s070_41.64.jpg` |
| JAM | 71 | 42.92-43.20 | host-cutout-over-bg | sí | 14. App-icon tile (+7,3) | Hard cut to hospital corridor; icon morphs grey blank to white briefcase | `ref_frames/JAM/s071_43.06.jpg` |
| JAM | 72 | 43.20-44.24 | host-cutout-over-bg | sí | 14. App-icon tile (+7,3) | host cutout over scrubs-doctor footage, briefcase tile with green loader arc, caption pill | `ref_frames/JAM/s072_43.72.jpg` |
| JAM | 73 | 44.24-44.96 | host-cutout-over-bg | sí | 14. App-icon tile (+7,3) | bg swaps on 'life' to sunset couple silhouettes, red heart tile, host leans in | `ref_frames/JAM/s073_44.60.jpg` |
| JAM | 74 | 44.96-50.40 | talking-head | no | 1. Talking-head, plain (live room) (+3) | hard cut to room shot, slow push-in, gestures, 3-4 word caption pills swap per phrase | `ref_frames/JAM/s074_47.68.jpg` |
| JAM | 75 | 50.40-50.60 | talking-head | no | 1. Talking-head, plain (live room) (+3) | close host, white pill caption 'with the outcome', hands clasped, hard cut out | `ref_frames/JAM/s075_50.50.jpg` |
| JAM | 76 | 50.60-51.80 | talking-head | no | 2. Jump-cut punch-in / reframe (+3) | wider framing, captions 'so what can we do' then 'about this', lean-in | `ref_frames/JAM/s076_51.20.jpg` |
| JAM | 77 | 51.80-52.00 | talking-head | no | 1. Talking-head, plain (live room) | no caption, host swipes hand with motion blur, sets up torn paper wipe | `ref_frames/JAM/s077_51.90.jpg` |
| JAM | 78 | 52.00-52.32 | transition | sí | 17. Torn-paper wipe (+7,8) | blue torn-edge panel wipes from left, host keyed in front, stepped 12.5fps | `ref_frames/JAM/s078_52.16.jpg` |
| JAM | 79 | 52.32-56.12 | host-cutout-over-bg | sí | 7. Host cutout over designed background (+5,13,8) | yellow typewriter quote, five jam jars pop above head, then slide out, host drops away | `ref_frames/JAM/s079_54.22.jpg` |
| JAM | 80 | 56.12-57.60 | graphics | sí | 5. Mono typewriter / quote title (+13,21) | lone red jar on blue gradient, third typewriter title 'we can choose to find more satisfaction' | `ref_frames/JAM/s080_56.86.jpg` |
| JAM | 81 | 57.60-59.48 | graphics | sí | 5. Mono typewriter / quote title (+13,21) | Yellow typewriter quote types out over blue gradient; static jam jar; drifting dust specks fade by end | `ref_frames/JAM/s081_58.54.jpg` |
| DK | 82 | 0.00-0.24 | talking-head | no | 1. Talking-head, plain (live room) (+3) | Host gesturing, neon bokeh bedroom, cream karaoke caption pill | `ref_frames/DK/s082_0.12.jpg` |
| DK | 83 | 0.24-2.08 | talking-head+overlay | sí | 4. Stacked serif typewriter title (hero title) (+17,1,3) | Purple torn panel drops; serif title typed letter-by-letter, host pushes in | `ref_frames/DK/s083_1.16.jpg` |
| DK | 84 | 2.08-2.32 | transition | sí | 17. Torn-paper wipe (+3,4) | Panel sweeps down over host in ~5 frames, cut to purple bg | `ref_frames/DK/s084_2.20.jpg` |
| DK | 85 | 2.32-5.56 | host-cutout-over-bg | sí | 12. Cutout collage on a designed gradient (+15,4,10,3,21) | B&W faceless woman rises, red marker circle A+ swaps to F | `ref_frames/DK/s085_3.94.jpg` |
| DK | 86 | 5.56-7.20 | photo/broll | sí | 9. Treated photo b-roll (halftone / sepia / duotone / selective colour) (+18,3) | Crossfade to sepia halftone man on teal, slow drift, captions continue | `ref_frames/DK/s086_6.38.jpg` |
| DK | 87 | 7.20-8.36 | photo/broll | sí | 9. Treated photo b-roll (halftone / sepia / duotone / selective colour) (+4,18,22,3) | B&W portrait over blurred second portrait; David Dunning typed 7.28–7.92, zoom/rack-focus handoff | `ref_frames/DK/s087_7.78.jpg` |
| DK | 88 | 8.36-10.48 | photo/broll | sí | 9. Treated photo b-roll (halftone / sepia / duotone / selective colour) (+4,3) | Teal halftone bald-man portrait; Justin Kruger typed 8.48–8.96, 'in 1999' italic 8.96–9.36 | `ref_frames/DK/s088_9.42.jpg` |
| DK | 89 | 10.48-10.60 | transition | sí | 17. Torn-paper wipe (+3,4) | Photo tears horizontally, halves push apart revealing maroon paper, 3 frames | `ref_frames/DK/s089_10.54.jpg` |
| DK | 90 | 10.60-13.36 | host-cutout-over-bg | sí | 12. Cutout collage on a designed gradient (+4,13,21,3) | B&W cutout rises 10.64–11.12; red half-circle pops 10.96; OVERESTIMATE typed 12.56–13.12 | `ref_frames/DK/s090_11.98.jpg` |
| DK | 91 | 13.36-13.76 | transition | sí | 18. Blur / defocus / dissolve transitions (+12,19,3) | First cutout blurs out as second cutout rises, about 10 frames | `ref_frames/DK/s091_13.56.jpg` |
| DK | 92 | 13.76-14.40 | host-cutout-over-bg | sí | 12. Cutout collage on a designed gradient (+4,3) | Second B&W cutout eases up, red circle keeps rising, title holds | `ref_frames/DK/s092_14.08.jpg` |
| DK | 93 | 14.40-16.16 | graphics | sí | 12. Cutout collage on a designed gradient (+4,22,18,3) | Typewriter UNDERESTIMATE title, blur punch-in at 15.04, karaoke caption pill | `ref_frames/DK/s093_15.28.jpg` |
| DK | 94 | 16.16-16.64 | transition | sí | 18. Blur / defocus / dissolve transitions (+19,3) | Blurred laptop lid sweeps left revealing headphones man; 12 frames | `ref_frames/DK/s094_16.40.jpg` |
| DK | 95 | 16.64-21.60 | photo/broll | sí | 9. Treated photo b-roll (halftone / sepia / duotone / selective colour) (+13,3) | Headphones man on phone, gold coin pops at 19.76 and flips by 20.9 | `ref_frames/DK/s095_19.12.jpg` |
| DK | 96 | 21.60-23.04 | host-cutout-over-bg | sí | 13. Props and object pop-ins (+9,21,3) | Sepia halftone host over purple, $1 coin flips from 'millions', pill karaoke caption | `ref_frames/DK/s096_22.32.jpg` |
| DK | 97 | 23.04-24.36 | photo/broll | sí | 10. Censor-bar portrait (+9,18,22,3) | Defocus-to-sharp boardroom photo, censor bars, slow left push, hard cut on 'market' | `ref_frames/DK/s097_23.70.jpg` |
| DK | 98 | 24.36-26.24 | graphics | sí | 20. Organic effect wipes (+10,4,3) | Room keyed to chroma green with flicker, UNPREDICTABILITY & COMPLEXITY typed per letter | `ref_frames/DK/s098_25.30.jpg` |
| DK | 99 | 26.24-28.16 | graphics | sí | 20. Organic effect wipes (+10,4,3) | Hard color swap green to red, standing man enters right, title holds | `ref_frames/DK/s099_27.20.jpg` |
| DK | 100 | 28.16-28.32 | transition | sí | 18. Blur / defocus / dissolve transitions (+13,3) | Cross-dissolve with heavy blur and a pink half-circle bleeding in | `ref_frames/DK/s100_28.24.jpg` |
| DK | 101 | 28.32-28.80 | photo/broll | sí | 9. Treated photo b-roll (halftone / sepia / duotone / selective colour) (+18,22,3) | Headband lifter with barbell plate, rack-focus blur to sharp, slow push | `ref_frames/DK/s101_28.56.jpg` |
| DK | 102 | 28.80-32.88 | photo/broll | sí | 9. Treated photo b-roll (halftone / sepia / duotone / selective colour) (+4,3) | Sepia halftone bearded lifter on navy; serif 'I know everything about FITNESS' types in | `ref_frames/DK/s102_30.84.jpg` |
| DK | 103 | 32.88-33.20 | transition | sí | 18. Blur / defocus / dissolve transitions (+3) | Defocused ghost frames into blurred gym footage, sharpening in about 0.2s | `ref_frames/DK/s103_33.04.jpg` |
| DK | 104 | 32.96-36.00 | photo/broll | sí | 11. Film / stock / clip b-roll (+9,3) | Bald trainer arms crossed, boxing glove foreground passes, slow push-in, karaoke captions | `ref_frames/DK/s104_34.48.jpg` |
| DK | 105 | 36.00-36.52 | talking-head | sí | 11. Film / stock / clip b-roll (+3) | bald gym man arms crossed, blurred foreground bag, caption 'adapt their routines' | `ref_frames/DK/s105_36.26.jpg` |
| DK | 106 | 36.52-38.36 | talking-head | no | 1. Talking-head, plain (live room) (+18,3) | host dissolves in over gym ghost, settles upward, background turns blue bokeh | `ref_frames/DK/s106_37.44.jpg` |
| DK | 107 | 38.36-39.40 | talking-head | no | 2. Jump-cut punch-in / reframe (+3,18) | host ~8% tighter, gestures, caption 'So Dunning and Kruger' | `ref_frames/DK/s107_38.88.jpg` |
| DK | 108 | 39.40-43.00 | photo/broll | sí | 9. Treated photo b-roll (halftone / sepia / duotone / selective colour) (+18,22,3) | blur-in to young man in chair, slow push, accelerating pan to keyboard | `ref_frames/DK/s108_41.20.jpg` |
| DK | 109 | 43.00-43.20 | photo/broll | sí | 13. Props and object pop-ins (+9,3) | cluttered desk, monitor gets six black ? marks popping on | `ref_frames/DK/s109_43.10.jpg` |
| DK | 110 | 43.20-46.52 | talking-head+overlay | sí | 13. Props and object pop-ins (+9,22,21,3) | Cluttered desk monitor, jittering black ? swarm, slow push, karaoke pill captions | `ref_frames/DK/s110_44.86.jpg` |
| DK | 111 | 46.52-48.52 | graphics | sí | 16. Full-screen title card with hero object (+4,13,18,21,3) | Teal halftone bg, fish in puddle, typewriter 'SMALL FISH IN A TINY PUDDLE' | `ref_frames/DK/s111_47.52.jpg` |
| DK | 112 | 48.52-50.40 | talking-head | no | 1. Talking-head, plain (live room) (+3) | Glasses host over blue bokeh, gesturing, slow punch-in, pill captions | `ref_frames/DK/s112_49.46.jpg` |
| DK | 113 | 50.40-53.08 | talking-head | no | 1. Talking-head, plain (live room) (+3) | blue bokeh room, cream karaoke pill captions, gesturing host, slow drift | `ref_frames/DK/s113_51.74.jpg` |
| DK | 114 | 53.08-54.72 | graphics | sí | 16. Full-screen title card with hero object (+4,13,18,21,3) | teal halftone bg, mackerel in puddle, serif title typewriter, caption continues | `ref_frames/DK/s114_53.90.jpg` |
| DK | 115 | 54.72-56.72 | talking-head | no | 1. Talking-head, plain (live room) (+3,18) | dissolve back to host, asks guilty, clasped hands, karaoke captions | `ref_frames/DK/s115_55.72.jpg` |
| ARR | 116 | 0.00-1.20 | talking-head+overlay | sí | 4. Stacked serif typewriter title (hero title) (+1,22,3) | Host in blue room, push-in 100-150%, red THE ARRIVAL FALLACY types in | `ref_frames/ARR/s116_0.60.jpg` |
| ARR | 117 | 1.20-1.52 | host-cutout-over-bg | sí | 19. Slide / push / whip / circle reveal (+7,21,4,3) | Host cutout, gray halftone circle expands to fill frame, title persists | `ref_frames/ARR/s117_1.36.jpg` |
| ARR | 118 | 1.52-4.24 | graphics | sí | 12. Cutout collage on a designed gradient (+4,8,21,3) | Running businessman breaking red ribbon slides in, host drops out bottom, title stays | `ref_frames/ARR/s118_2.88.jpg` |
| ARR | 119 | 4.24-7.20 | photo/broll | sí | 9. Treated photo b-roll (halftone / sepia / duotone / selective colour) (+4,22,3) | Ben-Shahar photo slides in from right, gold PSYCHOLOGIST TAL BEN-SHAHAR types in | `ref_frames/ARR/s119_5.72.jpg` |
| ARR | 120 | 7.20-8.88 | talking-head+overlay | sí | 6. Digit build and counter ticker (+4,9,22,3) | Tal Ben-Shahar on teal bg, gold 2006 digit build, accelerating push, title scrolls off | `ref_frames/ARR/s120_8.04.jpg` |
| ARR | 121 | 8.88-10.80 | host-cutout-over-bg | sí | 7. Host cutout over designed background (+4,9,18,3) | Harvard bg duotone to color, POSITIVE PSYCHOLOGY typewriter in gold serif | `ref_frames/ARR/s121_9.84.jpg` |
| ARR | 122 | 10.80-12.08 | host-cutout-over-bg | sí | 8. Host pop-up / sink / slide reveal (+7,18,3) | Creator pops up from bottom, Tal ghosted, blue dissolve to real room | `ref_frames/ARR/s122_11.44.jpg` |
| ARR | 123 | 12.08-13.12 | talking-head | no | 1. Talking-head, plain (live room) (+3) | Creator in blue bokeh room, slow push-in, karaoke caption | `ref_frames/ARR/s123_12.60.jpg` |
| ARR | 124 | 13.12-14.12 | photo/broll | sí | 11. Film / stock / clip b-roll (+3) | Harry Potter classroom clip illustrating high-achieving students, slight push | `ref_frames/ARR/s124_13.62.jpg` |
| ARR | 125 | 14.12-14.40 | photo/broll | sí | 11. Film / stock / clip b-roll (+3) | Hermione close-up clip on 'incredible accomplishments', hard cut in | `ref_frames/ARR/s125_14.26.jpg` |
| ARR | 126 | 14.40-15.12 | photo/broll | sí | 11. Film / stock / clip b-roll (+3) | Girl in striped tie, natural color, pill caption 'incredible accomplishments', karaoke fade | `ref_frames/ARR/s126_14.76.jpg` |
| ARR | 127 | 15.12-16.48 | photo/broll | sí | 11. Film / stock / clip b-roll (+3) | Glasses boy gesturing, caption 'were unhappy and stressed', word-by-word darkening | `ref_frames/ARR/s127_15.80.jpg` |
| ARR | 128 | 16.48-16.64 | transition | sí | 18. Blur / defocus / dissolve transitions (+3) | 4-frame dissolve from maroon-tinted boy clip to sepia man | `ref_frames/ARR/s128_16.56.jpg` |
| ARR | 129 | 16.64-20.16 | host-cutout-over-bg | sí | 7. Host cutout over designed background (+15,9,13,21,3) | Sepia man over maroon halftone, card peels in, red circle, F becomes A+ | `ref_frames/ARR/s129_18.40.jpg` |
| ARR | 130 | 20.16-21.28 | graphics | sí | 20. Organic effect wipes (+4,7,3) | Card burns to black blobs, 'NEVER THE CASE' letter-wipes in at top | `ref_frames/ARR/s130_20.72.jpg` |
| ARR | 131 | 21.28-21.44 | transition | sí | 17. Torn-paper wipe (+3) | Blue halftone torn strip sweeps up over frame in 4 frames, hard cut on 'But' | `ref_frames/ARR/s131_21.36.jpg` |
| ARR | 132 | 21.44-21.60 | graphics | sí | 12. Cutout collage on a designed gradient (+10,21,3) | Navy-blue gradient, silhouette woman with white censor bar over eyes, caption 'But let's imagine' | `ref_frames/ARR/s132_21.52.jpg` |
| ARR | 133 | 21.60-24.64 | host-cutout-over-bg | sí | 12. Cutout collage on a designed gradient (+10,4,13,21,22,3) | Halftone woman with eye bar rises in, YOUNG ENTREPRENEUR typewriter, Jane pop, mansion slides up | `ref_frames/ARR/s133_23.12.jpg` |
| ARR | 134 | 24.64-26.52 | graphics | sí | 4. Stacked serif typewriter title (hero title) (+6,12,10,22,3) | Old titles drop behind woman, new typewriter title, giant 30 fades in, scene tilts down | `ref_frames/ARR/s134_25.58.jpg` |
| ARR | 135 | 26.52-27.76 | host-cutout-over-bg | sí | 8. Host pop-up / sink / slide reveal (+18,7,3) | Real host cutout pops up in front of title, eases back, blur-dissolves to room | `ref_frames/ARR/s135_27.14.jpg` |
| ARR | 136 | 27.76-28.80 | talking-head | no | 1. Talking-head, plain (live room) (+3) | Full-frame host in blue-lit room, pill captions only | `ref_frames/ARR/s136_28.28.jpg` |
| ARR | 137 | 28.80-29.32 | talking-head | no | 1. Talking-head, plain (live room) (+3) | Blue bokeh set, slow punch-in, caption 'will bring her happiness' karaoke | `ref_frames/ARR/s137_29.06.jpg` |
| ARR | 138 | 29.32-30.24 | talking-head | no | 2. Jump-cut punch-in / reframe (+3) | Leaning host, big hand gestures, caption 'So Jane sacrifices relationships' | `ref_frames/ARR/s138_29.78.jpg` |
| ARR | 139 | 30.24-31.16 | photo/broll | sí | 11. Film / stock / clip b-roll (+18,21,3) | Man hides bouquet; blur-in, halftone blur-out at 31.04 | `ref_frames/ARR/s139_30.70.jpg` |
| ARR | 140 | 31.16-31.64 | photo/broll | sí | 11. Film / stock / clip b-roll (+18,21,3) | Blurred person, glass and pill jar, teal, halftone dither | `ref_frames/ARR/s140_31.40.jpg` |
| ARR | 141 | 31.64-32.48 | photo/broll | sí | 11. Film / stock / clip b-roll (+21,3) | Woman with brush and paint tin, caption 'along the way' | `ref_frames/ARR/s141_32.06.jpg` |
| ARR | 142 | 32.48-33.76 | talking-head | no | 1. Talking-head, plain (live room) (+18,3) | Blur-in rack focus, caption 'in pursuit of this big goal' | `ref_frames/ARR/s142_33.12.jpg` |
| ARR | 143 | 33.76-33.92 | transition | sí | 17. Torn-paper wipe (+3) | Navy torn strip expands over host in ~4 frames, white underlay | `ref_frames/ARR/s143_33.84.jpg` |
| ARR | 144 | 33.92-36.00 | host-cutout-over-bg | sí | 12. Cutout collage on a designed gradient (+10,4,3,22) | Censored woman rises; MILLIONAIRE BY 30 typed; gold 'Jane' fades behind | `ref_frames/ARR/s144_34.96.jpg` |
| ARR | 145 | 36.00-37.92 | talking-head+overlay | sí | 12. Cutout collage on a designed gradient (+20,10,4,22,3) | Jane halftone cutout, censor bar, yellow title, zoom, red blood splat floods frame | `ref_frames/ARR/s145_36.96.jpg` |
| ARR | 146 | 37.92-39.92 | graphics | sí | 12. Cutout collage on a designed gradient (+15,4,21,3) | black rim-lit silhouette, warped EMPTY, chalk LOST pops at 38.56 | `ref_frames/ARR/s146_38.92.jpg` |
| ARR | 147 | 39.92-40.72 | host-cutout-over-bg | sí | 8. Host pop-up / sink / slide reveal (+18,7,3) | host cutout scales up over red scene, bg dissolves to blue room | `ref_frames/ARR/s147_40.32.jpg` |
| ARR | 148 | 40.72-43.04 | talking-head | no | 1. Talking-head, plain (live room) (+3) | full-frame bokeh room, pointing left, karaoke pill captions only | `ref_frames/ARR/s148_41.88.jpg` |
| ARR | 149 | 43.04-43.20 | talking-head | no | 2. Jump-cut punch-in / reframe (+3) | reframed host, caption chunk 'everyone struggles with hoping' begins | `ref_frames/ARR/s149_43.12.jpg` |
| ARR | 150 | 43.20-46.72 | talking-head+overlay | no | 1. Talking-head, plain (live room) (+3) | locked camera, blue-lit bookshelf, white pill, grey-to-black word highlight, chunk swaps | `ref_frames/ARR/s150_44.96.jpg` |
| ARR | 151 | 46.72-48.36 | talking-head+overlay | no | 2. Jump-cut punch-in / reframe (+3) | head tilted left, new angle, 47.96 cut is false positive, pill swaps to Jim Carrey once said | `ref_frames/ARR/s151_47.54.jpg` |
| ARR | 152 | 48.36-50.40 | photo/broll | sí | 11. Film / stock / clip b-roll (+18) | Jim Carrey in gold graduation cap, glitch-dissolve entry, word-by-word cream handwriting captions | `ref_frames/ARR/s152_49.38.jpg` |
| ARR | 153 | 50.40-56.76 | talking-head | sí | 11. Film / stock / clip b-roll | Man in gold graduation gown speaking; handwriting karaoke captions, slow push, dark vignette | `ref_frames/ARR/s153_53.58.jpg` |
| ARR | 154 | 56.76-57.60 | talking-head | no | 1. Talking-head, plain (live room) (+3) | Bearded glasses host on blue bokeh set; cream pill caption 'So what is the answer?' | `ref_frames/ARR/s154_57.18.jpg` |
| ARR | 155 | 57.60-59.16 | talking-head | no | 1. Talking-head, plain (live room) (+3,2) | Continuous talking head, 'I don't know, let me know in comments', cream pill karaoke, slight punch-in at 58.08 | `ref_frames/ARR/s155_58.38.jpg` |
