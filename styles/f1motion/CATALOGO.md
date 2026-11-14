---
type: spec
status: active
tags: [f1motion, motion-graphics, scene-catalog, explainer, instagram-reels, stimulus]
relatedTo: [styles/f1motion/ESTILO.md, styles/f1motion/kit.js, styles/f1motion/ref_frames, fuentes/f1motion/reels]
---

# f1motion: catálogo de tipos de escena (5 reels del mismo estilo)

Fuentes, descargadas con yt-dlp en `fuentes/f1motion/reels/<id>/reel.mp4`. Cada carpeta tiene `words.json` (Whisper), `scenes.txt` (cortes) y `analysis/w_*.md` (análisis por la API, ventanas de 20 s a 4 fps).

| Apodo | Reel | Tema | Duración | Cortes |
|---|---|---|---|---|
| F1 | DdolSnYt_iX (`fuentes/f1motion/ref`) | F1 explicado | 181 s | 166 |
| KIMI | DfNzJyXtRpJ | Kimi Antonelli se salta una categoría | 141 s | 101 |
| CHG | Deje_IEhM8c | Changan / autos chinos | 131 s | 106 |
| MUSE | DdyxpSRBWIT | la IA "Muse" de Meta | 119 s | 65 |
| BTS | Dc_K1gSx5id | historia de BTS | 147 s | 120 |

**Medidas comunes:**
- Los gráficos van a **12 fps** (cambian en 1 de cada 2 frames a 24 fps). Histograma de frames únicos por segundo en los 4 reels: pico en 12 en los tramos gráficos y 24 en talking head, b-roll y grabaciones de pantalla.
- Audio (earshot timeline de KIMI 0-70 s y BTS 0-35 s): mezcla de -14 a -15 LUFS, música house/tech-house "confident & cool" con vocal chops, celesta/glockenspiel y tramos de pizzicato corporate.
  - El 91-95 % de los cortes tiene un onset a ≤100 ms.
  - SFX: bubble pops en pills, badges y bocadillos; sub drops en las revelaciones grandes; swells/risers antes de los momentos clave; notas de glockenspiel o celesta en los "dings"; clics y teclas en las UI; whoosh en las salidas.
- Talking head con captions de corte duro en las 5 piezas. B-roll B/N con trama de líneas en todas.

Abajo va el catálogo (síntesis por la API de los 4 reels más la spec del primero, en inglés). Cada tipo lista sus frames de referencia en `styles/f1motion/ref_frames/<reel>/` (índice en `ref_frames/index.json`). "known" = ya estaba en el reel F1 y en ESTILO.md.

## Scene types

**Reel legend:** BTS = Dc_K1gSx5id, MUSE = DdyxpSRBWIT, CHG = Deje_IEhM8c, KIMI = DfNzJyXtRpJ, F1 = first reel (spec).

**Conventions:**
- Frames are at 24 fps. Graphics step on twos, so "6 fr (3 steps)" means 0.25 s.
- Positions are % of 1080×1920, centre-based.
- Safe zone: keep text between x 8–92%, and keep y 10–90% clear of the caption slot (y 12–15%) on talking-head shots.
- None of the source breakdowns list SFX, so every SFX line is a proposal.
- Default SFX kit: pop = soft bubble pop, tick = typewriter or word tick, whoosh = air whoosh, sub = low sub drop, note = celesta or glockenspiel note per word, click = UI click, peel = paper/sticker crinkle, zap = glitch zap.

### 1. Talking head + hard-swap caption (known)
- Ref frames: `ref_frames/DfNzJyXtRpJ/01_talking-head_32.5s.jpg`
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
- Ref frames: `ref_frames/Dc_K1gSx5id/02_bw-broll_2s.jpg`, `ref_frames/DfNzJyXtRpJ/02_color-linescreen-broll_7s.jpg`
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
- Ref frames: `ref_frames/Dc_K1gSx5id/03_meme-caption_18.3s.jpg`
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
- Ref frames: `ref_frames/Deje_IEhM8c/04_flash-burst_95s.jpg`
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
- Ref frames: `ref_frames/DdyxpSRBWIT/05_walker_18.9s.jpg`, `ref_frames/Deje_IEhM8c/05_walker_41s.jpg`
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
- Ref frames: `ref_frames/Deje_IEhM8c/06_vehicle_4.3s.jpg`, `ref_frames/DfNzJyXtRpJ/06_vehicle_41.8s.jpg`
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
- Ref frames: `ref_frames/Dc_K1gSx5id/07_name-stack-card_9.3s.jpg`
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
- Ref frames: `ref_frames/DdyxpSRBWIT/08_pill-tab_25.2s.jpg`, `ref_frames/DfNzJyXtRpJ/08_pill-tab_99s.jpg`
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
- Ref frames: `ref_frames/Dc_K1gSx5id/09_hero-prop_89.6s.jpg`, `ref_frames/DfNzJyXtRpJ/09_hero-prop_23.4s.jpg`
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
- Ref frames: `ref_frames/Dc_K1gSx5id/10_album-sleeve_95.8s.jpg`
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
- Ref frames: `ref_frames/Dc_K1gSx5id/11_face-pop-orbit_23.1s.jpg`, `ref_frames/Dc_K1gSx5id/11_face-pop-orbit_105s.jpg`
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
- Ref frames: `ref_frames/Dc_K1gSx5id/12_node-graph_36.5s.jpg`
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
- Ref frames: `ref_frames/Dc_K1gSx5id/13_timeline-rail_7.4s.jpg`, `ref_frames/Dc_K1gSx5id/13_timeline-rail_40.4s.jpg`
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
- Ref frames: `ref_frames/DfNzJyXtRpJ/14_strip-list_9s.jpg`, `ref_frames/DfNzJyXtRpJ/14_strip-list_57.4s.jpg`
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
- Ref frames: `ref_frames/DdyxpSRBWIT/15_article-sweep_54s.jpg`, `ref_frames/Deje_IEhM8c/15_article-sweep_51s.jpg`
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
- Ref frames: `ref_frames/Deje_IEhM8c/16_ui-card_28.1s.jpg`, `ref_frames/DdyxpSRBWIT/16_ui-card_9.5s.jpg`
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
- Ref frames: `ref_frames/DdyxpSRBWIT/17_phone-ui_68s.jpg`, `ref_frames/Dc_K1gSx5id/17_phone-ui_58s.jpg`
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
- Ref frames: `ref_frames/DfNzJyXtRpJ/18_speech-bubble_12s.jpg`, `ref_frames/Dc_K1gSx5id/18_speech-bubble_74s.jpg`
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
- Ref frames: `ref_frames/DfNzJyXtRpJ/19_pixel-to-real_89.2s.jpg`, `ref_frames/Dc_K1gSx5id/19_pixel-to-real_29.9s.jpg`
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
- Ref frames: `ref_frames/DfNzJyXtRpJ/20_map-polaroid_25.7s.jpg`
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
- Ref frames: `ref_frames/DfNzJyXtRpJ/21_photo-card-dark_29.7s.jpg`
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
- Ref frames: `ref_frames/DfNzJyXtRpJ/22_quote-silhouette_87.6s.jpg`
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
- Ref frames: `ref_frames/Deje_IEhM8c/23_kinetic-type_52.6s.jpg`, `ref_frames/Dc_K1gSx5id/23_kinetic-type_50.7s.jpg`
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
- Ref frames: `ref_frames/Deje_IEhM8c/24_top-down_25.6s.jpg`
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
- Ref frames: `ref_frames/Deje_IEhM8c/25_lower-third_55.4s.jpg`, `ref_frames/Deje_IEhM8c/25_lower-third_113s.jpg`
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
- Ref frames: `ref_frames/Dc_K1gSx5id/26_logo-sticker-peel_50.7s.jpg`
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
- Ref frames: `ref_frames/Deje_IEhM8c/27_puzzle-snap_102.8s.jpg`
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
- Ref frames: `ref_frames/DdyxpSRBWIT/28_detail-crop_104.5s.jpg`
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
- Ref frames: `ref_frames/Dc_K1gSx5id/29_ui-tour-canceled_136s.jpg`
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
- Ref frames: `ref_frames/Dc_K1gSx5id/30_zoom-through_10.9s.jpg`, `ref_frames/DdyxpSRBWIT/30_zoom-through_33.4s.jpg`
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

## Cobertura por plano (verificable, 2026-11-10)
**Método:**
1. Detección de cortes en cada reel completo (`ffmpeg select=gt(scene,0.2)`, en `scenes.txt`), con un plano entre cada par de cortes.
2. La API clasifica cada plano viendo 2 frames suyos (inicio y medio) como graphics / talking-head / broll / screen / flash, con su tipo del catálogo (`coverage.json`).
3. Los planos de gráficos se analizaron a **12 fps, todos sus frames** (ventanas de ≤7 s que cubren el 100 % del tiempo de gráficos), contrastando cada uno con la entrada de su tipo. Resultado en `framelevel/g_*.md` y `framelevel.json`.
4. Hay un frame clave (el del medio) de cada plano en `ref_frames/<reel>/shots/sNNN_<t>.jpg`.

| Reel | Planos | Gráficos | Talking head | B-roll | Pantalla | Flash | Cubiertos por el catálogo | Analizados a 12 fps |
|---|---|---|---|---|---|---|---|---|
| KIMI | 102 | 25 (35 s) | 25 | 40 | 9 | 3 | 25/25 | 25/25 |
| CHG | 107 | 25 (33 s) | 21 | 43 | 13 | 5 | 25/25 | 25/25 |
| MUSE | 66 | 24 (37 s) | 21 | 16 | 3 | 2 | 24/24 | 24/24 |
| BTS | 121 | 28 (46 s) | 26 | 44 | 6 | 17 | 28/28 | 28/28 |

**Resultados:**
- Antes, con la pasada única por ventanas, el 100 % de los planos de gráficos caía en algún rango "Seen in" del catálogo. Pero los detalles eran vagos o erróneos en 92 de los 102 planos, y 6 planos estaban mal tipados (CHG 13-14 →6, CHG 34-36 →9, BTS 10 →7).
- Ahora el 100 % está analizado cuadro a cuadro, con las correcciones abajo y 3 tipos nuevos (31-33).
- **Revisión manual** de 16 planos al azar (`ref_frames/_spotcheck.jpg`): 15 correctos. CHG 13 es una cortina de metraje a gráfico (ahora tipo 6, más el bloque de transición).

**Tipos nuevos:**
- **31. Camera-chain continuous take:** un solo movimiento de cámara que el detector parte en varios planos (CHG 34-37, BTS 43-46, MUSE 9-11). Tilt o zoom del 15 % y pull-back de ~60 % que asienta. Paneo de 20-35 px por paso, ease-out en cada golpe de voz.
  - Frame: `ref_frames/Deje_IEhM8c/31_camera-chain_41.2s.jpg`.
- **32. Silhouette→real pixel-block match cut:** una silueta en mosaico grueso que se define en 3-5 pasos (a 12 fps) hasta el objeto real (KIMI 73→74).
  - Frame: `ref_frames/DfNzJyXtRpJ/32_silhouette-match-cut_87.9s.jpg`.
- **33. Glitch / whip brand reveal:** corte a negro con el logo borroso y glitcheado y una raya horizontal, en 2 pasos (CHG 122.25-122.33).
  - Frame: `ref_frames/Deje_IEhM8c/33_glitch-brand-reveal_122.3s.jpg`.

**Audio** (earshot timeline completo de MUSE y CHG):
- MUSE: -14.2 LUFS. Corporate/house con vocal chop y pizzicato al final. El 93 % de los cortes tiene un onset a ≤100 ms. Usa sub drops (1:22, 1:31), "chat pops" en las UI, ding de glockenspiel (1:45.9) y swells muy marcados (+37/+41 dB en 22.1 y 24.5 s).
- CHG: -14.2 LUFS. Alterna house con vocal chop, techno y corporate con celesta. 135 cortes, el 91 % con onset a ≤100 ms. Usa ding de notificación y glockenspiel (1:10.7), swells en las revelaciones, pops de UI (45.9 s) y un stop-down de 0.55 s en 1:14.3 antes de un cambio de sección.

## Frame-level corrections and additions (12 fps, all graphics shots)

Frames are 300×534 and scale ×3.6 to 1080×1920. One step is 83 ms, which is 2 frames at 24 fps. Everything is animated on twos. Reels: K=KIMI, C=CHG, M=MUSE, B=BTS (reel + source-clip shot number).

### 5. Walker / face-on-body character
- **Shots:** K20–23, K93; C19, C20, C49, C71, C32; M2, M15, M31, M60, M61, M63.
- **Corrections:**
  - **Ground:** the "45% teal/gold ellipse + reflection" is only one of several grounds.
    - K20–23: full-bleed green halftone floor from y65–68% (~35% of frame height).
    - C19: gold #F5E9B8→#E6CB6E floor from y70%, creeping to y65%, with a mirrored reflection to y97%.
    - C49: teal #5DC9A2→#BDEBDD band y66.8–100%, reflections at 25–30% opacity.
    - C71: grey road y65–77% with a dashed centre line at y71.5% (dashes ~40 px, 140 px pitch).
    - M2: yellow #E3C25A→#C9A23A plane y74–100% with long diagonal shadows.
    - M31: black "hole" ellipse ~30% wide at y88%, on a tilted green halftone floor #4DB88C (y85%→95%).
    - M60: dark grey ellipse 27%×3% at y80%, no reflection.
    - M15, M63: no ground. M15 has 3–4 gradient streaks as legs at y72–92%; M63 has stairs.
  - **Hands:** not always emoji thumbs.
    - K23: pixel-mosaic wheel fists.
    - C19: wrenches.
    - C49: no hands.
    - M2: cutout photo hands.
    - M31: hands behind back.
  - **Text position:** the "right, x47–90%, y47–57%" layout holds only for K93 (x46–92%, y47–58%). Other positions:
    - Top-centre: K23 y15–30%; C19 y20–27%; M15 y19–29% on a gold bar.
    - Above characters: C49 y28–40%.
    - Top-left: C71 y13–28% (x8–66%); M63 y17–34% (x11–49%).
    - Above device: M2 y24–40%.
    - Banner: M60 y17–29%.
  - **Word step:** 1–2 steps (2–4 fr at 24 fps), not 6 fr. Ghost for 1 step, then gray→black over 2–3 steps.
    - K23 is ~6 fr; M63 is 2 steps (0.17 s).
    - M15 is 2 steps for lead-in words, ~3 steps for hero words.
  - **Face:** M15 is centred, ~38% wide, y33–54%. C71 is ~15% wide and partly off-screen left. M60 is ~13% wide at x≈53%.
  - **Entry** is not just slide or pop:
    - Radial-blur scale-down 130→100% over 2 steps (K20).
    - 2-step blur-to-sharp plus smooth→pixel body (M15, M31, M60, M63).
    - Slide from left, ease-out, 3 steps (K93, C71), 5 steps (C32, M2).
    - Scale-pop then splayed-leg hop (C49).
  - **Hold:** the "±1.5–2% bob, 12 fr" rule is not universal.
    - M15: monotonic rise ~4% over 1.7 s.
    - M31: scale drift 100→108%.
    - C19: bob ±1.5% plus floor edge creep y70→65%.
    - Several shots end with a group pan left (~3% per step, C19; ~10% per step, C20) or a snap-zoom exit.
- **Variants:**
  - **Jersey walker + car (K20–23):**
    - Head ~28% wide, black jersey with teal trim, black block legs, car behind.
    - Red gradient bracket tabs pop at 20.21 (9% wide, y8–12%) and grow to 28% wide (y3–17%) by 20.29.
    - Walker sinks into the floor at 21.88–22.04.
  - **Trophy-leg walker (K23→24, K93):**
    - Trophy "leg" stomps in from the right at 22.13.
    - K93: teal wide-caps hero, pale→solid over 3 steps; ellipse pops at 124.21 and grows over 4 steps.
  - **Mechanic (C19):** red-hair/flower/white-glasses face; wrenches rotate 25–30° during the hold; title arrives only in the last 0.67 s.
  - **Walker + brick stack (C32):** bust slides in over 5 steps, hops y60→41%; black pyramid plinth squash-and-stretch; cash layers pop 1 per step.
  - **Cast build-up (C49):** man 53.25, lion pops 53.58, alien pops 54.00 (~0.4 s apart); staggered hops.
  - **Kneeling proposal (C71):**
    - Red glow eyes at 70.50 swap to heart eyes at 70.58.
    - Car with mosaic wheel enters 71.58–71.92, decelerating.
    - Road dashes scroll ~5 px/step.
  - **Presenter + device (M2):** cutout gestures at a robot on a tulip chair; the device becomes the zoom target.
  - **Hover-body (M15):** thruster-streak legs; vector heart→pixel heart pop (25→55 px) at 19.39.
  - **Thinker-in-hole (M31):** eyes dart up, lip twist, ±1–2° tilt, pull-back to ~45%.
  - **Hover-chair (M60):** glass-blue chair 65% wide.
  - **Noodle-leg (M63):**
    - Shoe tilts 10–20° first.
    - Blue dot pops at 109.48, becomes a pill at 109.57, then a leg at 109.65.
    - Arcs off the top by 109.90 (~6 steps, ease-in); camera pulls out; lands a second shoe at 110.73.

### 6. Name-on-vehicle / vehicle strip + pixel road
- **Shots:** K40, K41; C3, C4; C13–15.
- **Corrections:**
  - **Road:** y64–75% (C3), y58–67% (C15, ~9% tall), #4B4B4F with a black top edge and white dashes. K40/41 have no road, only a grey shadow strip under the wheels on white.
  - **Car arrival:**
    - K40 is a macro-wheel zoom-out over ~11 steps (wheel ~120→100 px in frame, ease-out, no overshoot), ending left (nose x≈10%).
    - C3: nose 37→31→24→18→15→13% by 3.38 s, then creeps to 10% (~110 px, ease-out). It ends left-biased (x10–90%), not centred.
    - C15: vehicles hard-cut swap in the same road slot every 2–3 steps (sedan→SUV→pickup→coupe-SUV).
  - **Tab:** C3 has a cross tab (top bump x36–66% y30.5–33%, bottom bump y42–47%). K40 uses a gold underline bar #E8D08A wiping 41.42–41.50 (2 steps, 40→150→230 px). K41 and C4 have no tab.
  - **Word timing:** 1–2 steps (K40: I 40.67, only .75, had .83, access 41.00, to 41.17, an 41.33). C13–15 lines come 0.33 s (4 steps) apart.
  - **C13/14** are not zoom-through (type 30) but a slide-wipe from b-roll to white. The edge goes 82→60→41→28→19→12→8→5→2% (~22%/step easing to ~3%/step) over ~0.75 s, revealing the road and title (K13 "TRA" clipped by the edge).
- **Variants:**
  - **Macro-wheel pull-back (K40→41):**
    - Red #D93A55 wide "RC CAR" 110 px; RC at 41.58, CAR at 41.75 (pink→red over 2 steps).
    - K41: giant RC transmitter over the car, "at that" thin grey, mint #4DB890 "AGE" ~105 px pops at 42.75 (2-step fade/scale).
  - **Brand lockup on match-cut (C3→C4):**
    - 5% push at 4.71, then ~2.7× zoom onto the wheel centre (~13% radius, 12 px pixel blocks).
    - CHANGAN thin ~60 px then ALSVIN heavy ~100 px (pink #E8A0A8→red #D93A55, 3 steps); the thin line rises 10 px as the bold arrives.
    - Glitch-slice streak on road at y63–65%.
  - **Vehicle-montage stacked title (C15):** ULTRA / LUXURY / CARS, green gradient #4DB88F with halftone, 105–115 px per line, leading ~5%; CARS sits behind the car roof; cross-dissolve + blur out at 15.08.
  - **Striped scanline b-roll (C13):** ~2 px vertical stripes near the wipe edge.

### 7. Name-stack character card
- **Shots:** B10, B11, B14.
- **Corrections:**
  - **Positions:** name lines at y39/45% (not 41/47%), role at y34%. Pill spans x50–84% (~34% wide, centre ~67%), not "x70%". "liked an" at y54%; pill at y55–60%.
  - **Word stagger:** 2 steps (Bang 8.29, Si 8.46, Hyuk 8.63), gray→black over ~4 steps.
  - **Ellipse:** starts small and flat (23% at 8.04), grows to 45% at 8.13, overshoots to ~50% at 8.21, settles at 42% by 8.29.
  - **Punch-in:** measured ~165% (not 140%), with the pan easing ~8 px/step over ~0.5 s; exit is a blur ramp at 11.13.
  - **Structure:** B8–11 belongs to type 7 only.
- **Additions / variants:**
  - **Person-intro build order (B10):** face (blurred) → ellipse → ghost body → role → name words → "liked" → speckle-brush pill (~6 steps, dot cloud→blob) → "Underground" 9.63, "Rapper" 9.88 → "a lot." 10.29.
    - Group drifts down ~4% and left ~3%.
  - **No-pill variant (B14):**
    - Face on gold polygon, teal ellipse.
    - Name stack: thin "Kim Namjoon" ~45 px at y39%, "RM" ~190 px cap at y42–52%, x55%.
    - 3 purple lightsticks pop staggered (12.96, 13.12, 13.54) with overshoot.
    - "Kim" 13.12, "Namjoon" 13.38, "RM" 13.62 (gray→black by 13.88, 3 steps).
    - Hold ~0.9 s; exit is a 1-step blur dissolve at 14.79.

### 8. Gold pill + teal tab title card
- **Shots:** K2 (shot 4 hybrid), C32 (shot 33), M15 (shot 16), B19.
- **Corrections:**
  - **Shape:** flat rectangle (K2), notched L polygon (C33), wide rounded rect (M16), flag tab (B19). None is a capsule with chevron wings.
  - **Fills:** gold gradient fades to cream downward (K2 #E8C873→cream).
  - **Growth:** pills grow rather than scale-pop. K2 grows from a 5 px strip to ~15 px over 1.54–1.63, then to x9–91%, y15–20%. K24 grows from a thin line at 22.21. C33 fades in over 2 steps.
  - **Word step:** 1–2 steps (2 steps = 0.17 s in K2).
- **Variants:**
  - **Rule + rectangle + flapping wings (K2):**
    - Hairline rule x5–95% at y11.6%; gold rectangle x27–73%, y11.6–14.4%; teal wings rotate ±10–15° per step.
    - Group drifts down ~9 px/step (frame px).
    - Later pill x12–88%, y18–27%; lead-in ~58 px, hero "Grade in School" ~100 px.
  - **Notched overflow pill (C33):**
    - x6–67%, y16–34%; lead-in 45–50 px, words ~105 px; text overflows the top-left.
    - Words 39.92→41.00; hold 14 steps.
  - **Character-exit caption pill (M16):**
    - x40–87%, y41–48.5%, ~47%×7.5%; "Daughters" ~80 px blue #1860D8.
    - Draw-on is hairline→cream→gold→text over 4 steps (18.06–18.23 for the M15 bar).
  - **Avatar + tab + swoosh (B19):**
    - Tab 255×90 px at x440–695, y515–605 (1080 px).
    - Avatar scales ~4× at 22.29.
    - Swoosh underline grows 22.46–22.87.
    - Then "BTS" 3D letters: ~380 px tall, #D9444F with a ~12 px black offset, letters 3 steps apart.
    - Letters go black→red over 2 steps (23.21–23.79); 7 gold-ring face badges pop and jitter.
    - Blur ramp out at 23.96.

### 9. Hero prop + title stack
- **Shots:** K2 (shots 2, 3, 5, 6), K24; K74; C2; C34–38; M18; M24; B84; B110.
- **Corrections:**
  - **Floor:** often absent or plain. K2 and M24 have no floor, shadow or reflection. M18 has a white floor with a vertical mirror reflection (y68–95%, ~35% opacity). C2 has a hard grey shadow to the lower left, not right. K74 has a grey blob (y63–70%). B84 has a mint ellipse x18–82%, y74–83%. B110 has a gold diagonal floor from y≈285/534 rising ~12°.
  - **Prop size and position:**
    - K2: pencil 35% wide at x50%, cropped by the bottom, tip y49→38%.
    - K24: trophy x47–92% (46% wide).
    - K74: car 80% wide, y36–72%.
    - M24: CRT 88% wide, y31–85%.
    - B84: trophy 53% wide, y28–79%.
    - B110: stadium 82–90% wide.
    - C2: stack x15–88%, y40–78%.
  - **Text position:** top stack at y11–27% (K2). Others: C38 top-left x5–65% y24–44%, K24 left y33–48%, B110 centred y22–37%, B84 centred y18–24%.
  - **Entry** is rarely a pop with overshoot:
    - Ease-out rise ~1000 px over 6 steps, settled by 1.79 s (K2).
    - Tiered pop 1→4→7→~12 bundles, ~2 steps apart (C2).
    - Stomp from a walker leg (K24).
    - Pixel-block dissolve from the silhouette over ~5 steps (K74).
    - Oversized blur pull-back: scale 1.2→1.0 over ~5 steps (B110), and 12–15% (B84).
  - **Word timing:** 1 per step (K74, B84: ghost then solid next step); 2 steps (K2, 0.17 s); C38 is 1 step for small words.
  - **Hero sizes:** B110 ~130 px (not 72–90); C38 big words 165–185 px; K74 SEAT ~90 px mint #5CC49F; M24 "Muse"/"Features" 115/125 px.
  - **Exits:** blur or dissolve at the end, not a hard cut (B84 blur-out at 90.50, B110 at 132.71, M18 at 26.82, K74 cross-dissolve, K24 blur ramp). K2 and K24 tilt/slide the prop out (K2: ~5° at 2.04 → 15° at 2.13 → 25–30° → 45° across 3 steps).
- **Variants:**
  - **Prop-swap (K2):** pencil slides off lower right while a red pen cap #C8283A rises from the bottom (tip y32%, ~35% wide) on the "Grade" step (2.38–2.46).
  - **Isometric cash tiers (C2):** red shard→hexagon→ribbon arc; ribbon draw ~5 steps + 4-step tail curl; shadow darkens per tier; "I" cursor bar is the first title character; slow 5% pan left.
  - **Stepped L gold pill (C2):** x42–85%, y23–41%, right-aligned text.
  - **Trophy + stomp (K24):**
    - Pill starts as a thin line at 22.21.
    - Three teal shards pop at 22.54–22.71.
    - ~1.1 s static hold (23.54–24.54).
  - **Silhouette→real match cut (K73→74):** mint "SEAT" hero, no pill.
  - **Mascot idle (M18):** blinks every ~0.7–1 s (2–4 steps closed); mint tab wipes in from the top 24.07–24.32.
    - "MUSE" ghost→solid over 3–4 steps, blue #0B5CE0.
    - Sub-line words 2 steps apart (25.15–25.98).
    - Push-in ~4% over 1.5 s.
  - **Device with embedded UI (M24):** gold 4-point sparkle x0–360, y400–770, scales 1.3×; cursor pops at 32.41; envelope card swaps at 33.32–33.49.
  - **Landmark (B110):** stadium with red roof #D8384A; shadow grows as the model shrinks.
  - **Award prop (B84):** gold ribbon S-curve draws on over ~9 steps (88.83–89.58); "Everything." goes #666→#222 by 89.83; ellipse overshoots (x7–93%) then settles (x18–82%).
  - **Money stairs → red pedestal + sedan (C38):** x63–98%, y47–77%; character hops from the stairs at 43.83; steps go translucent while hopping.
    - Words: with 42.58 … Save. 43.42.
    - Hold then blur ramp from 44.33.

### 10. Album sleeve + vinyl slide-out
- **Shots:** B95, B96, B102.
- **Corrections:**
  - **Entry:** the first frame is blurred or ghosted (2-step defocus dissolve), and the sleeve is already mid-slide.
    - B95: sleeve right edge 35→39→44→48→51→53→54→55→56→57% over ~10 steps, plus a scale-down 1.15→1.0.
    - B96: 43→56% over 8 steps.
    - B102: 52→66% over 10 steps (peak 112.9–113.0), then drifts to 55%, with height 74→65% and top y21→28% over ~4.4 s.
  - **Vinyl emerges** when the sleeve is ~90% settled: B96 +7 steps after cut, B95 ~15 steps, B102 ~6 steps after the sleeve stops.
    - Travel is 7–8 steps (~0.6 s), ~25–30% of width.
    - B102 pushes out to x99% then retreats to 87%.
  - **Edge thickness:** ~15 px side, ~37 px bottom at 1080.
  - **Text:** starts after the vinyl lands (B95 +1.75 s; B102 +3.2 s at 115.54). Words 1–3 steps apart; B96 1 step. Fade #DDD→#999→#222 over 2–3 steps. Text block has 2–3 tiers.
  - **No down-left drift** in B95/96; there is a +3% push-in over the last 3 steps.
  - **Exit:** B96 last frame blur; B102 hard cut at 117.46 to a blurred talking head.
- **Variants:**
  - **Cream label + gold edge (B95):** embossed white-on-white title.
  - **Mint label + green edge (B96):** #4DB88A edge; wide-tracked bold WINGS on art.
  - **Navy sleeve (B102):** steel-blue edge #6B9AB5, outline "LOVE YOURSELF", ribbon squiggle; "Billboard / 200." hero ~125–135 px.
  - **Chained caption:** the sentence runs across sleeves.

### 11. Face-pop orbit and extrude title
- **Shots:** B98 (shot 98).
- **Corrections:**
  - **Face stagger:** 1 step (103.04→103.54, 7 faces), not 6 fr.
  - **Title:** no extruded title in this instance. Text is a word fade, not a wipe.
  - **Slide:** group slides right ~20% at 104.29–105.04, before the text.
- **Additions:**
  - 7 mint-outlined polygon faces (~13% wide, 3 px outline) in a zig-zag: x38/60/33/62/38/60/33%, y15/31/40/49/62/69/78%.
  - Trophy resolves from blur 102.96→103.04; ellipse grows from small to full by 103.21.
  - Trophy scales 34→40% before text.
  - "won the Top" ~42 px thin, "Social Artist," ~150 px medium; words 105.21, .37, .46, .54, .71.
  - Carry-out scale-down ~15% over the last 3 steps (106.87–107.04) into the next shot's small trophy.

### 12. Roster node-graph pan
- **Shots:** B42–46.
- **Corrections:**
  - **Node size:** ~28% wide at pop, ~17% at rest (not 25%).
  - **Beat:** 0.65 s per member (7–8 steps): RM 34.17, JIN 34.83, J-HOPE 35.42, SUGA 36.08, JIMIN 36.75. Pop and tab sub-beats are 3–4 steps.
  - **Lines:** ~8 px gold, node-to-node with one kink, 4–6 steps to draw; arrowhead only at the draw tip. Tab sides alternate.
  - **Camera:** never stops; ~20–35 px/step, ease-out on each beat.
- **Additions:**
  - Pop sequence: ~13% dot + thin vertical teal tick → ~28% over 3–4 steps with overshoot → tab wipes letter by letter ~4 steps.
  - V tab appears 37.50→37.67 (one letter). JK enters 37.92 with the tab below the face (third direction); "JUNG KOOK" tab ~40% wide at 38.42.
  - Zoom-out ~0.6× over 38.17–38.50, hold ~0.25 s, then defocus and a hard cut to a blurred talking head.
  - Shots 42–46 are one move; the detector splits are false.

### 14. Strip list / row cascade
- **Shots:** K12–14, K52–54, K81, K85.
- **Corrections:**
  - **Pitch and height:** 12.5% pitch holds only for the K81/85 flag-circuit lists (~245 px). Car strips use a pitch of ~26% (K12, ~500 px) or ~23% (K52, ~440 px). Row height is ~17% (K12) or 16–22% (K52, active largest).
  - **Active row:** not centred. It starts low and the stack scrolls DOWN (~2.5 px/step in frame px, K12; ~5% per 4 steps, K52).
  - **Pill:** K81/85 pill at x53–83% (~30% wide, centre 68%), with teal chevron tabs; sprites are flag-filled circuit outlines with a black offset shadow, not cars. Trails are 4×3 pixel blocks with per-row hues (orange→yellow, pink→red, purple→navy, green for Monza).
  - **Timing:** pill→sprite lag 4 steps (K81) to 8 steps (K85); row cadence ~8 steps (0.67 s); typewriter 1–2 steps/word.
  - **Spotlight:** K85 clears the other rows off-screen onto a white F1-chevron background. K14 and K54 keep inactive rows at ~25–30%, with the active row at ~33% height.
  - **Face badge:** gold octagon, 22–24% wide → ~16% in spotlight.
  - **Gold element at bottom right:** pair of angled gold chevron shards (#EBD595→#C9A24A), not a pill; scales ~110→300 px with rotation.
- **Variants:**
  - **Face-hop selector (K12–14):**
    - Face wobbles ±6–10° and rises each step (y298→235 over 11 steps), skipping pink.
    - 1-step select at 9.12: active row goes 25%→full saturation (mint→green) while others fade.
    - K14 opens zoomed out (rows ~10% tall) and scales up over 9 steps to rows ~14%.
  - **Skip-gag (K52–54):**
    - Face pops 55.54 (30%→full at 55.62).
    - F4 strip slides in over 55.71–56.04.
    - F3/F2 ghost rows at 55.87/55.96.
    - "completely skipped" 55.96–56.21.
    - Red "F3" ~270 px wipes in at 56.37–56.54.
    - Down-scroll from 56.87.
    - K53 is a 2-step scroll + dissolve; "and sent him straight to F2" 57.71–58.21; teal "F2" ~135 px at 58.29–58.54.
    - Strips enter with mosaic stair-step edges.
  - **Flag-circuit calendar (K81):**
    - "And then came" typewriter 98.54–98.88.
    - Red extruded "2026" pink→red over ~5 steps (98.96–99.38).
    - CHINA pill pops at 99.46 and dissolves the title.
    - Rows: JAPAN 100.29, MIAMI 100.96, CANADA 101.46, MONACO 101.96.
    - Stack auto-scrolls up ~2%/step.
    - Blur out at 102.88.
  - **Sixth row + crash caption (K85):**
    - Monza pill grows 107.67→107.75 and the stack scrolls 15 px/step.
    - Italian-flag sprite with green trail lands at 108.42.
    - Spotlight cut at 109.17; face pops ~30→60 px, wobbles.
    - Caption: thin sans plus bold wide-caps "CRASHED 2 YEARS", one word per step with a ~30% pre-ghost.
    - Blur dissolve out at 111.67.

### 16. UI card / menu + pixel cursor
- **Shots:** C21, C23, C24, C99, C100; M7–M11.
- **Corrections:**
  - **Background:** plain white in the carousel variants (C23, C24), not a charcoal halftone panel. Dock/tile UIs (M7–11) are white with a blue-white gradient dock.
  - **Cursor:** hops are 1–2 steps (snap) or park (C24: enters ~4 steps, parks on the right chevron through two swaps, exits left over ~5 steps at 28.96–29.54). C21 has no cursor, and the character's wrench pokes in. A click is a ~5 px jitter over ~3 steps (M8) or a small crosshair (C25 screen).
  - **Selection:** pill and vehicle swap happen on the same step (C100). The active colour is a light green #8FD9A8→#3DB58A; pills overlap green for 1 step. Pills stay gold in C24, and only chevrons are teal.
  - **Pills (C21):** 37%×5% (not 42–50%×7–8%), with a stagger of 1 pill per 2 steps. Card x36–88%, y24–70%.
  - **Swaps:** ~8 steps (0.67 s), not 12 fr. Pill and vehicle slide with road scroll; old exits with ease-in, new decelerates over 6–8 steps.
  - **Panel (C99):** not static. A slow pull-back of ~5% with a downward drift (cap y4→8%).
  - **Dock (M7):** 78% wide at y65–75% before the push-in; opens from a vertical hairline with an expo-out width over ~9 steps (50→95→152→183→205→222 px at 7.05–7.46 s).
- **Variants:**
  - **Brand-list card with character pointer (C21–23):**
    - Word-by-word "HOUSE OF BRANDS" at 23.50 / 23.67 / 23.83 (1 per 2 steps).
    - Signal arcs; diagonal card shadow; character at 0.62× scale.
    - Pills: CHANGAN 23.75, NEVO 23.83, DEEPAL 23.92, AVATR 24.00; pulse 1.1× per beat.
    - Hold then a blur ramp at 24.83.
  - **Carousel on white (C24, C23):**
    - Alsvin sedan, Oshan X7 SUV, Karvaan van.
    - Gold pill x22–78%, y25–33% with teal chevrons at y37%.
    - Road y61–73% (C24).
  - **Billboard menu (C99–100):**
    - Charcoal halftone panel x20–81%, y10–64%; 4 gold pills at y21/29/38/48%.
    - Header "ENTIRE" 118.42, "ECOSYSTEM" 118.75.
    - Pixelated 2-step resolve; cursor hops 118.58, 119.67, 120.67, 121.58.
    - Vehicles: sedan, pickup, SUV, coupe at y62–85%.
    - Ends in a glitch whip to a dark AVATR logo.
  - **Dock-tile mosaic (M7–11):**
    - Tiles resolve mosaic→sharp in 2 steps on cursor arrival (Gmail, Calendar, orange, bank).
    - Camera pans ~28 px/step with mascot parallax.
    - ~1.4 s hold (10.63–12.05).
    - Hard cut to a talking head at 12.21.

### 17. Phone-UI explainer and retro phone (with zoom-through)
- **Shots:** M40–44; B53–61.
- **Corrections:**
  - **Zoom:** exits are a lateral whip-pan then a push (M40, 1.1→2.5×), a ~1.9× one-step snap + ~8-step settle to ~2.05× (B56→60; screen ~88% wide, keypad still visible), or ~2× zoom starting ~0.1 s before the cut (M42→43). Not 1.0→1.3→350% over 16 fr.
  - **M44 settle:** ~105–110% ease-out over 5 steps, then a 7-step hold; the card reflows (~10% taller). Exit is a 1-step blur of ~15–20 px.
  - **Text entry:** types in as cropped fragments ("jc"→"ljaz"→"Asma ljaz Khan"; balance "00"→"0,00"→"700,000,00").
  - **Bubbles:** grow from a 2 px vertical line → square → bar (69.15–69.56). Reply card is a grey-blue glass card with a 2-column icon grid.
  - **Phone:** M42 phone is not static; it drops ~25 px per added title line (y18→23→25%).
  - **B53:** phone ~68% wide; two softkeys (Menu/Call); header typo "Contect".
  - **Selector:** rows 2–3 steps apart; selector (cream #F5EBCB) steps every 1–3 steps. Floor is white (B) or blue #9CC4DB (M42).
  - **Body:** smooth grey → dither/halftone at the zoom cut (B56).
- **Variants:**
  - **Cash/NFC phone (M40):** balance card y43%; cash stack rises 64.90–65.40; mascot pops 65.23 at x67%, y37%.
  - **Zoomed margin text (M41):** "sounds" (30 px) / "kind of" (25 px) / "Scary" (160 px, #888→black, +6 px rise); mascot drifts ~40 px.
  - **Chat bake-order (M42):** title words one per 2 steps (67.81–68.81); icons Sugar/Milk/Oil/Eggs/Flour at 70.06–70.31.
  - **Retro-phone contacts (B53–61):**
    - 2-step blur-resolve rise ~43 px.
    - Phone drifts up ~180 px while a frame-locked caption "and at that point," (60 px, y17%) arrives word by word.
    - Two pink scribble spirals draw in ~4 steps each (57.12–57.62).
    - Rows Mama Zong, Pyari behan?, Bestie.
    - Desaturated last frame, then a hard cut.

### 18. Speech-bubble stack
- **Shots:** K15 (duo); M7; B76, B77; B99.
- **Corrections:**
  - **Bubble pop:** the "0.6→1.05→1, 6–15°" pop applies to B76 (~4 steps, rotations alternate -8, -12, +8, -6, scale 0.7–0.8×). It does not apply to M7 or B99, where the bubble grows in width or height with its text and has no rotation or overshoot.
  - **Fill:** halftone dots with a thin outline (no hard offset) for B76 bubbles. M7 is gold gradient with a 1 px outline. K15 bubbles are both the same green #52C39B (not per speaker).
  - **Text:** a whole bubble appears with its text (K15); word-by-word every ~3 steps (B76 red); K15 speakers' lines are Roman-Urdu. B99 ~2 steps/word. M7 1–2 steps/word.
  - **Size:** B99 pill ~45%×8%; B77 red ~66% wide at 1.8×.
  - **Camera:** K15 has no push-in. B76→77 is a ~1.8× punch-in match cut that eases ~3 steps, then holds ~1.2 s, then blurs at 76.67.
- **Variants:**
  - **Chibi duo (K15):**
    - Wolff slides in 10.71 (head x270→235, ease-out); bubble 1 pops 11.12 (full by 11.29).
    - Antonelli slides in at 11.46, settled by 11.79; bubble 2 at 11.79 with overshoot at 11.88, settled by 12.04.
    - Bubbles come 4 steps after each character.
  - **Mic-stand bubbles (B76):**
    - Four bubbles 0.75 s apart (72.33, 73.08, 74.00, 74.58); green/blue sharp rectangles, gold pill, red→pink rounded rect.
    - Mic rises ~7% (y26→19%) while the base slides in at 71.75; then drifts down ~3%.
    - Title words 71.67, 71.83, "Singing" 72.00 (110%→100% by 72.08), 72.17.
  - **Plush mascot bubble (M7):** "Access" ~160 px bold blue plus a ~36 px Hinglish line; the bubble tail points to the mascot.
  - **Reaction sticker + pill (B99):** red-blob sticker with a 3% hard offset, ±3–4° wobble; empty pill grows 107.12–107.37 and words come 107.29/.46/.71.

### 20. Map + polaroid stack
- **Shots:** K25.
- **Corrections:**
  - **Entry:** blur-to-sharp over 2 steps from the previous shot, not fade from black.
  - **Word gaps:** 4/6/6/4 fr (not uniform 6). The map drifts up ~3% and scales ~105% through 26.71.
- **Additions:**
  - Polaroids: Venice (x8–33%, y31–52%, -8°), Colosseum (x15–52%, y38–56%, +8°), Cinque Terre (x8–33%, y47–66%, -5°).
  - Polaroids enter at 24.71 (slide, 6 steps), 24.96, and 25.21.
  - "2006" ~155 px cap pops over 4 steps from ghost (25.88) to solid (25.96).
  - Map is low-res and soft, with a blocky legend.

### 22. Quote card + silhouette
- **Shots:** K73.
- **Corrections:**
  - **Words:** 1 per step (not 4–6 fr).
  - **Box growth:** the box grows in two stages (~31%, then 38%); the line turns grey→gold at 86.71, then thickens ~3 px/step.
  - **Logo:** starts at y9% and ends at y26% after the slide.
  - **Exit:** whole group (logo, box, silhouette) slides down ~8% over 7 steps (87.96–88.54, ease-in) with pixel breakup, then a hard cut at 88.63.
- **Additions:**
  - Entry is a blurred low-res de-res of the previous shot sharpening over ~3 steps.
  - Green pixel-block F1 wing silhouette #2F8A68→#07140F.
  - Caps lines: "CRASH" dark grey, "OR" lighter, ~45 px; "TWO, KIMI" black.
  - Words: we 86.79, don't .88, really 86.96, care, about by 87.29; CRASH 87.38, OR 87.46, TWO, 87.63, KIMI 87.71.

### 23. Kinetic type card
- **Shots:** C48; M32.
- **Corrections:**
  - **Floor (C48):** starts ~1.3% strip (y98.7%) and is near-static to 52.67, then creeps 99→98.5→97→96→94.6% by 53.17. It jumps to y66.8% at the cut (not continuous).
  - **Words:** 1–3 steps apart (52.25 / 52.42 / 52.50 / 52.75 / 52.83 / 53.00 / 53.17); ghost #ddd → #222 over ~3 steps with ~8 px rise.
  - **Drift:** block rises 1.5–3 px/step (line 1 y46→42%) and shrinks ~5% before the cut.
  - **Text:** connector words ("for", "of") are ~60% size and lighter. Line 2 is left-ragged (x9–91%), ~95 px.
  - **M32:** text left-aligned at x≈24%, hero ~50 px (not 100–120). Floor is a static tilted green halftone, not a rising strip. The character stays at the right (~20% wide).
- **Additions:**
  - **Icon-stack variant (M32):**
    - Folder stack grows 3→5→7→9→11 over ~6 steps with ±5–10° tilts, reaching the frame top by 45.25.
    - Words "It's / a lot / of / Access" 1 per step; blur-out on the last frame (45.84).
    - Continuous camera pull-back from M31 (100%→45%).

### 24. Top-down lane
- **Shots:** C22.
- **Corrections:**
  - **Scroll:** ~14% of frame height per second (sign y62→150 px over 1.17 s), not 25%/s. Traffic at ~0.5× the sign's speed (parallax).
  - **Hero car:** white, rises over 9 steps with ease-out (y510→225 px of 534) and never fully stops.
  - **Text:** PAKISTAN fades in over 2 steps (not a wipe). Sign panels read "Sust 84 km / Gilgit 268 km / Islamabad 850 km".
  - **Road:** gradient #111 (left) → #444 (right); in and out are blur bridges (24.92 blurred, sharp 25.00; 26.17–26.25 ramp to white).

### 26. Logo sticker-peel + kinetic weight-mix text + logo pair
- **Shots:** B51.
- **Corrections:**
  - **Peel:** sweeps left→right with a diagonal hinge and ends as a bottom-right curl, over ~4 steps (47.42–47.67).
  - **Scale:** logo shrinks 74→64% over 19 steps, then snaps to 38% in 1 step (49.33), then eases y31→27% over ~7 steps.
  - **Words:** 4 fr = 2 steps apart (49.67 … 50.5; Established 50.67, Groups 50.83, Like: 51.0). "Groups" stays #888 to ~51.3.
  - **Logos:** EXO ~28% wide, B.A.P ~37% wide, both at y≈60%.
  - **Peel-ins:** each ~4 steps, 8 steps apart (EXO 51.58–51.92, B.A.P 52.25–52.58).
  - **No wobble** in this window; hold ~1.1 s.
  - **Exit:** 1-step dissolve (53.83) then a hard cut to a blurred talking head.
- **Additions:** die-cut white margin on stickers; text block and logo zoom ~3% in the hold; thin lines ~50 px light.

### 27. Puzzle-snap assembly
- **Shots:** C96.
- **Corrections:**
  - **Start:** pieces start at y40–45% and ±30° rotation (x20% / x78%), drifting inward over 4 steps.
  - **Snap:** overshoot 101.25–101.5, settle with a tiny gap that closes at 101.75; hold ~3 steps.
  - **Exit:** both pieces exit left together (102.08–102.25).
  - **Road:** full-bleed y52–66%, wipes in at 102.0.
  - **Car:** decelerates over ~8 steps (to ~102.9), not 24 fr.
  - **Card:** appears at 102.17 while the car is still moving.
- **Additions:**
  - 4-line gold card with a notch tab: "into an" (~28 px) / "experience that actually" (~40) / "Makes You Feel" (~75, semibold) / "Something" (~75).
  - Words 102.33 (an), 102.42, 102.58, 102.75, 102.83, 102.92, 103.08, 103.25.
  - Halftone dots on pieces; glossy black gradient pill tabs TECH / DESIGN; blur-out at 104.58.

### 30. Zoom-through / close-up stack of a graphic
- **Shots:** M3, M4, M25, M44 (and C13/14 reclassified to 6).
- **Corrections:**
  - **Zoom speed:** M3 is a 2-step snap to ~1.5× (begins in the last 2 steps of M2), then M4 holds ~0.6 s with a 100→103% drift and a blur-out at 3.17. M25 is ~2× in ~2 steps (33.49–33.57).
  - **Hold:** M25 holds 3.1 s with internal animation (not 0.5–1.2 s). Slow ~3% pull-out drift.
  - **Exit:** blur defocus, not a hard cut.
- **Additions:**
  - **Zoom into UI carousel (M25):**
    - Cards FILL FORMS → BOOK TRIPS → PURCHASE.
    - Cursor clicks at 34.32 and 35.57; each swap is a ~4-step slide with tilt settle (-25°→-15°).
    - Cards ~450 px wide with gold plaques.

### New variants worth their own type
- **Camera-chain continuous take (detector splits):**
  - One move spans several detector shots: C34–37 (4 steps: tilt/zoom 15%, then pull-back ~60% settle), B43–46, M9–11, K3, M3→4.
  - Spec as one shot: pan ~20–35 px/step ease-out per beat; character drawn above the title during overlap (C35).
- **Silhouette→real pixel-block match cut (K73→74):** coarse mosaic silhouette de-res sharpens over ~3–5 steps into the real object.
- **Glitch/whip brand reveal (C100→AVATR):** hard cut to a black frame with a glitchy blurred logo and a horizontal streak over 2 steps (122.25–122.33).

### Motion constants confirmed
- **Step grid:** everything is on twos (83 ms); hold-time measurements are ±1 step.
- **Words:** reveal 1–2 steps apart (up to 3 for hero words). Ghost frame is 1 step, then solid. Gray→black takes 2–3 steps (#DDD/#CFCFCF → #999 → #222). Rise is ~4–8 px. The thin lead-in (~40–60 px) comes first, then a hero of 95–190 px.
- **Pops:** 1-step scale-pop for faces and sprites (K49, M15, B8); 3–4 steps with overshoot for nodes and bubbles; 4–5 steps for pills.
- **Stagger:** 1 step for faces and bricks; 2 steps for pills; 4 steps for pill→sprite (K81); 8 steps for bubbles and rows.
- **Slides (ease-out):** 3–5 steps (characters); 6–8 steps (cars, vinyl, sprites); ~10 steps (sleeves).
- **Draws:** ribbon 5–9 steps; arrow ~4 steps; spirals ~4 steps; peel 4 steps; pill from line 2–3 steps.
- **Holds:** 0.5 s (M4) to 1.1 s (K24, K85) to 1.4 s (M11); card holds 0.25–0.9 s.
- **Camera moves:**
  - Snap zoom 1–2 steps (1.5–2.7×).
  - Push-in/pull-back 4–5 steps.
  - Slow drift ~3–5% over 1–2 s.
  - Pan 20–35 px/step.
- **Selection:** a 1-step crossfade swap (C100, K13).
- **Blur bookends:** blur-in 2 steps; blur-out 1–2 steps (the last frame); mostly a hard cut to a blurred talking head afterwards.

## Tabla de cobertura: todos los planos de gráficos
| Reel | Plano | Tiempo (s) | Tipo | Frame |
|---|---|---|---|---|
| KIMI | 2 | 1.29–2.21 | 9. Hero prop + title stack (isometric, landmark, trophy, stationery) | `ref_frames/DfNzJyXtRpJ/shots/s002_1.29.jpg` |
| KIMI | 3 | 2.21–2.29 | 9. Hero prop + title stack (isometric, landmark, trophy, stationery) | `ref_frames/DfNzJyXtRpJ/shots/s003_2.21.jpg` |
| KIMI | 4 | 2.29–2.38 | 8. Gold pill + teal tab title card (known) | `ref_frames/DfNzJyXtRpJ/shots/s004_2.29.jpg` |
| KIMI | 5 | 2.38–2.46 | 9. Hero prop + title stack (isometric, landmark, trophy, stationery) | `ref_frames/DfNzJyXtRpJ/shots/s005_2.38.jpg` |
| KIMI | 6 | 2.46–3.29 | 9. Hero prop + title stack (isometric, landmark, trophy, stationery) | `ref_frames/DfNzJyXtRpJ/shots/s006_2.46.jpg` |
| KIMI | 12 | 8.12–9.08 | 14. Strip list / row cascade (known) | `ref_frames/DfNzJyXtRpJ/shots/s012_8.12.jpg` |
| KIMI | 13 | 9.08–9.17 | 14. Strip list / row cascade (known) | `ref_frames/DfNzJyXtRpJ/shots/s013_9.08.jpg` |
| KIMI | 14 | 9.17–10.67 | 14. Strip list / row cascade (known) | `ref_frames/DfNzJyXtRpJ/shots/s014_9.17.jpg` |
| KIMI | 15 | 10.67–13.17 | 18. Speech-bubble stack (duo, mic bubbles, reaction sticker) | `ref_frames/DfNzJyXtRpJ/shots/s015_10.67.jpg` |
| KIMI | 20 | 20.04–20.12 | 5. Walker / face-on-body character (known, many variants) | `ref_frames/DfNzJyXtRpJ/shots/s020_20.04.jpg` |
| KIMI | 21 | 20.12–20.21 | 5. Walker / face-on-body character (known, many variants) | `ref_frames/DfNzJyXtRpJ/shots/s021_20.12.jpg` |
| KIMI | 22 | 20.21–20.29 | 5. Walker / face-on-body character (known, many variants) | `ref_frames/DfNzJyXtRpJ/shots/s022_20.21.jpg` |
| KIMI | 23 | 20.29–22.17 | 5. Walker / face-on-body character (known, many variants) | `ref_frames/DfNzJyXtRpJ/shots/s023_20.29.jpg` |
| KIMI | 24 | 22.17–24.71 | 9. Hero prop + title stack (isometric, landmark, trophy, stationery) | `ref_frames/DfNzJyXtRpJ/shots/s024_22.17.jpg` |
| KIMI | 25 | 24.71–26.79 | 20. Map + polaroid stack | `ref_frames/DfNzJyXtRpJ/shots/s025_24.71.jpg` |
| KIMI | 40 | 40.33–42.42 | 6. Name-on-vehicle / vehicle strip + pixel road (known) | `ref_frames/DfNzJyXtRpJ/shots/s040_40.33.jpg` |
| KIMI | 41 | 42.42–43.25 | 6. Name-on-vehicle / vehicle strip + pixel road (known) | `ref_frames/DfNzJyXtRpJ/shots/s041_42.42.jpg` |
| KIMI | 52 | 55.46–57.46 | 14. Strip list / row cascade (known) | `ref_frames/DfNzJyXtRpJ/shots/s052_55.46.jpg` |
| KIMI | 53 | 57.46–57.54 | 14. Strip list / row cascade (known) | `ref_frames/DfNzJyXtRpJ/shots/s053_57.46.jpg` |
| KIMI | 54 | 57.54–59.25 | 14. Strip list / row cascade (known) | `ref_frames/DfNzJyXtRpJ/shots/s054_57.54.jpg` |
| KIMI | 73 | 86.54–88.62 | 22. Quote card + silhouette | `ref_frames/DfNzJyXtRpJ/shots/s073_86.54.jpg` |
| KIMI | 74 | 88.62–89.75 | 9. Hero prop + title stack (isometric, landmark, trophy, stationery) | `ref_frames/DfNzJyXtRpJ/shots/s074_88.62.jpg` |
| KIMI | 81 | 98.38–102.92 | 14. Strip list / row cascade (known) | `ref_frames/DfNzJyXtRpJ/shots/s081_98.38.jpg` |
| KIMI | 85 | 107.58–111.75 | 14. Strip list / row cascade (known) | `ref_frames/DfNzJyXtRpJ/shots/s085_107.58.jpg` |
| KIMI | 93 | 124.12–126.29 | 5. Walker / face-on-body character (known, many variants) | `ref_frames/DfNzJyXtRpJ/shots/s093_124.12.jpg` |
| CHG | 2 | 1.38–2.96 | 9. Hero prop + title stack (isometric, landmark, trophy, stationery) | `ref_frames/Deje_IEhM8c/shots/s002_1.38.jpg` |
| CHG | 3 | 2.96–4.79 | 6. Name-on-vehicle / vehicle strip + pixel road (known) | `ref_frames/Deje_IEhM8c/shots/s003_2.96.jpg` |
| CHG | 4 | 4.79–5.71 | 6. Name-on-vehicle / vehicle strip + pixel road (known) | `ref_frames/Deje_IEhM8c/shots/s004_4.79.jpg` |
| CHG | 13 | 13.83–13.92 | 6. Name-on-vehicle / vehicle strip + pixel road (known) | `ref_frames/Deje_IEhM8c/shots/s013_13.83.jpg` |
| CHG | 14 | 13.92–14.00 | 6. Name-on-vehicle / vehicle strip + pixel road (known) | `ref_frames/Deje_IEhM8c/shots/s014_13.92.jpg` |
| CHG | 15 | 14.00–15.17 | 6. Name-on-vehicle / vehicle strip + pixel road (known) | `ref_frames/Deje_IEhM8c/shots/s015_14.00.jpg` |
| CHG | 19 | 21.17–23.17 | 5. Walker / face-on-body character (known, many variants) | `ref_frames/Deje_IEhM8c/shots/s019_21.17.jpg` |
| CHG | 20 | 23.17–23.25 | 5. Walker / face-on-body character (known, many variants) | `ref_frames/Deje_IEhM8c/shots/s020_23.17.jpg` |
| CHG | 21 | 23.25–24.92 | 16. UI card / menu + pixel cursor (known) | `ref_frames/Deje_IEhM8c/shots/s021_23.25.jpg` |
| CHG | 22 | 24.92–26.29 | 24. Top-down lane (known) | `ref_frames/Deje_IEhM8c/shots/s022_24.92.jpg` |
| CHG | 23 | 26.29–26.38 | 16. UI card / menu + pixel cursor (known) | `ref_frames/Deje_IEhM8c/shots/s023_26.29.jpg` |
| CHG | 24 | 26.38–29.88 | 16. UI card / menu + pixel cursor (known) | `ref_frames/Deje_IEhM8c/shots/s024_26.38.jpg` |
| CHG | 32 | 39.42–39.83 | 5. Walker / face-on-body character (known, many variants) | `ref_frames/Deje_IEhM8c/shots/s032_39.42.jpg` |
| CHG | 33 | 39.83–42.17 | 8. Gold pill + teal tab title card (known) | `ref_frames/Deje_IEhM8c/shots/s033_39.83.jpg` |
| CHG | 34 | 42.17–42.25 | 9. Hero prop + title stack (isometric, landmark, trophy, stationery) | `ref_frames/Deje_IEhM8c/shots/s034_42.17.jpg` |
| CHG | 35 | 42.25–42.33 | 9. Hero prop + title stack (isometric, landmark, trophy, stationery) | `ref_frames/Deje_IEhM8c/shots/s035_42.25.jpg` |
| CHG | 36 | 42.33–42.42 | 9. Hero prop + title stack (isometric, landmark, trophy, stationery) | `ref_frames/Deje_IEhM8c/shots/s036_42.33.jpg` |
| CHG | 37 | 42.42–42.50 | 9. Hero prop + title stack (isometric, landmark, trophy, stationery) | `ref_frames/Deje_IEhM8c/shots/s037_42.42.jpg` |
| CHG | 38 | 42.50–44.46 | 9. Hero prop + title stack (isometric, landmark, trophy, stationery) | `ref_frames/Deje_IEhM8c/shots/s038_42.50.jpg` |
| CHG | 48 | 52.00–53.25 | 23. Kinetic type card (rising floor, slide-away punchline) | `ref_frames/Deje_IEhM8c/shots/s048_52.00.jpg` |
| CHG | 49 | 53.25–54.54 | 5. Walker / face-on-body character (known, many variants) | `ref_frames/Deje_IEhM8c/shots/s049_53.25.jpg` |
| CHG | 71 | 70.33–73.46 | 5. Walker / face-on-body character (known, many variants) | `ref_frames/Deje_IEhM8c/shots/s071_70.33.jpg` |
| CHG | 96 | 100.92–104.67 | 27. Puzzle-snap assembly | `ref_frames/Deje_IEhM8c/shots/s096_100.92.jpg` |
| CHG | 99 | 118.17–119.75 | 16. UI card / menu + pixel cursor (known) | `ref_frames/Deje_IEhM8c/shots/s099_118.17.jpg` |
| CHG | 100 | 119.75–122.38 | 16. UI card / menu + pixel cursor (known) | `ref_frames/Deje_IEhM8c/shots/s100_119.75.jpg` |
| MUSE | 2 | 0.92–2.42 | 5. Walker / face-on-body character (known, many variants) | `ref_frames/DdyxpSRBWIT/shots/s002_0.92.jpg` |
| MUSE | 3 | 2.42–2.50 | 30. Zoom-through / close-up stack of a graphic (known close-up stack) | `ref_frames/DdyxpSRBWIT/shots/s003_2.42.jpg` |
| MUSE | 4 | 2.50–3.21 | 30. Zoom-through / close-up stack of a graphic (known close-up stack) | `ref_frames/DdyxpSRBWIT/shots/s004_2.50.jpg` |
| MUSE | 7 | 6.80–8.38 | 18. Speech-bubble stack (duo, mic bubbles, reaction sticker) | `ref_frames/DdyxpSRBWIT/shots/s007_6.80.jpg` |
| MUSE | 8 | 8.38–9.63 | 16. UI card / menu + pixel cursor (known) | `ref_frames/DdyxpSRBWIT/shots/s008_8.38.jpg` |
| MUSE | 9 | 9.63–9.72 | 16. UI card / menu + pixel cursor (known) | `ref_frames/DdyxpSRBWIT/shots/s009_9.63.jpg` |
| MUSE | 10 | 9.72–9.80 | 16. UI card / menu + pixel cursor (known) | `ref_frames/DdyxpSRBWIT/shots/s010_9.72.jpg` |
| MUSE | 11 | 9.80–12.22 | 16. UI card / menu + pixel cursor (known) | `ref_frames/DdyxpSRBWIT/shots/s011_9.80.jpg` |
| MUSE | 15 | 17.23–19.31 | 5. Walker / face-on-body character (known, many variants) | `ref_frames/DdyxpSRBWIT/shots/s015_17.23.jpg` |
| MUSE | 16 | 19.31–20.60 | 8. Gold pill + teal tab title card (known) | `ref_frames/DdyxpSRBWIT/shots/s016_19.31.jpg` |
| MUSE | 18 | 23.48–26.86 | 9. Hero prop + title stack (isometric, landmark, trophy, stationery) | `ref_frames/DdyxpSRBWIT/shots/s018_23.48.jpg` |
| MUSE | 24 | 31.99–33.58 | 9. Hero prop + title stack (isometric, landmark, trophy, stationery) | `ref_frames/DdyxpSRBWIT/shots/s024_31.99.jpg` |
| MUSE | 25 | 33.58–36.70 | 30. Zoom-through / close-up stack of a graphic (known close-up stack) | `ref_frames/DdyxpSRBWIT/shots/s025_33.58.jpg` |
| MUSE | 31 | 43.59–44.92 | 5. Walker / face-on-body character (known, many variants) | `ref_frames/DdyxpSRBWIT/shots/s031_43.59.jpg` |
| MUSE | 32 | 44.92–45.88 | 23. Kinetic type card (rising floor, slide-away punchline) | `ref_frames/DdyxpSRBWIT/shots/s032_44.92.jpg` |
| MUSE | 40 | 64.31–66.40 | 17. Phone-UI explainer and retro phone (with zoom-through) | `ref_frames/DdyxpSRBWIT/shots/s040_64.31.jpg` |
| MUSE | 41 | 66.40–67.65 | 17. Phone-UI explainer and retro phone (with zoom-through) | `ref_frames/DdyxpSRBWIT/shots/s041_66.40.jpg` |
| MUSE | 42 | 67.65–70.32 | 17. Phone-UI explainer and retro phone (with zoom-through) | `ref_frames/DdyxpSRBWIT/shots/s042_67.65.jpg` |
| MUSE | 43 | 70.32–70.40 | 17. Phone-UI explainer and retro phone (with zoom-through) | `ref_frames/DdyxpSRBWIT/shots/s043_70.32.jpg` |
| MUSE | 44 | 70.40–71.53 | 30. Zoom-through / close-up stack of a graphic (known close-up stack) | `ref_frames/DdyxpSRBWIT/shots/s044_70.40.jpg` |
| MUSE | 60 | 99.97–103.06 | 5. Walker / face-on-body character (known, many variants) | `ref_frames/DdyxpSRBWIT/shots/s060_99.97.jpg` |
| MUSE | 61 | 103.06–105.86 | 5. Walker / face-on-body character (known, many variants) | `ref_frames/DdyxpSRBWIT/shots/s061_103.06.jpg` |
| MUSE | 63 | 108.90–110.23 | 5. Walker / face-on-body character (known, many variants) | `ref_frames/DdyxpSRBWIT/shots/s063_108.90.jpg` |
| MUSE | 64 | 110.23–111.32 | 5. Walker / face-on-body character (known, many variants) | `ref_frames/DdyxpSRBWIT/shots/s064_110.23.jpg` |
| BTS | 10 | 8.04–10.62 | 7. Name-stack character card (blob pill + orbiting props) | `ref_frames/Dc_K1gSx5id/shots/s010_8.04.jpg` |
| BTS | 11 | 10.62–11.21 | 7. Name-stack character card (blob pill + orbiting props) | `ref_frames/Dc_K1gSx5id/shots/s011_10.62.jpg` |
| BTS | 14 | 12.88–14.83 | 7. Name-stack character card (blob pill + orbiting props) | `ref_frames/Dc_K1gSx5id/shots/s014_12.88.jpg` |
| BTS | 19 | 22.21–24.00 | 8. Gold pill + teal tab title card (known) | `ref_frames/Dc_K1gSx5id/shots/s019_22.21.jpg` |
| BTS | 42 | 34.17–37.33 | 12. Roster node-graph pan | `ref_frames/Dc_K1gSx5id/shots/s042_34.17.jpg` |
| BTS | 43 | 37.33–37.42 | 12. Roster node-graph pan | `ref_frames/Dc_K1gSx5id/shots/s043_37.33.jpg` |
| BTS | 44 | 37.42–37.50 | 12. Roster node-graph pan | `ref_frames/Dc_K1gSx5id/shots/s044_37.42.jpg` |
| BTS | 45 | 37.50–38.17 | 12. Roster node-graph pan | `ref_frames/Dc_K1gSx5id/shots/s045_37.50.jpg` |
| BTS | 46 | 38.17–38.79 | 12. Roster node-graph pan | `ref_frames/Dc_K1gSx5id/shots/s046_38.17.jpg` |
| BTS | 51 | 47.42–53.96 | 26. Logo sticker-peel + kinetic weight-mix text + logo pair | `ref_frames/Dc_K1gSx5id/shots/s051_47.42.jpg` |
| BTS | 53 | 56.88–57.00 | 17. Phone-UI explainer and retro phone (with zoom-through) | `ref_frames/Dc_K1gSx5id/shots/s053_56.88.jpg` |
| BTS | 54 | 57.00–57.08 | 17. Phone-UI explainer and retro phone (with zoom-through) | `ref_frames/Dc_K1gSx5id/shots/s054_57.00.jpg` |
| BTS | 55 | 57.08–58.58 | 17. Phone-UI explainer and retro phone (with zoom-through) | `ref_frames/Dc_K1gSx5id/shots/s055_57.08.jpg` |
| BTS | 56 | 58.58–58.67 | 17. Phone-UI explainer and retro phone (with zoom-through) | `ref_frames/Dc_K1gSx5id/shots/s056_58.58.jpg` |
| BTS | 57 | 58.67–58.75 | 17. Phone-UI explainer and retro phone (with zoom-through) | `ref_frames/Dc_K1gSx5id/shots/s057_58.67.jpg` |
| BTS | 58 | 58.75–58.83 | 17. Phone-UI explainer and retro phone (with zoom-through) | `ref_frames/Dc_K1gSx5id/shots/s058_58.75.jpg` |
| BTS | 59 | 58.83–58.96 | 17. Phone-UI explainer and retro phone (with zoom-through) | `ref_frames/Dc_K1gSx5id/shots/s059_58.83.jpg` |
| BTS | 60 | 58.96–59.21 | 17. Phone-UI explainer and retro phone (with zoom-through) | `ref_frames/Dc_K1gSx5id/shots/s060_58.96.jpg` |
| BTS | 61 | 59.21–59.29 | 17. Phone-UI explainer and retro phone (with zoom-through) | `ref_frames/Dc_K1gSx5id/shots/s061_59.21.jpg` |
| BTS | 76 | 71.50–75.08 | 18. Speech-bubble stack (duo, mic bubbles, reaction sticker) | `ref_frames/Dc_K1gSx5id/shots/s076_71.50.jpg` |
| BTS | 77 | 75.08–76.75 | 18. Speech-bubble stack (duo, mic bubbles, reaction sticker) | `ref_frames/Dc_K1gSx5id/shots/s077_75.08.jpg` |
| BTS | 84 | 88.67–90.58 | 9. Hero prop + title stack (isometric, landmark, trophy, stationery) | `ref_frames/Dc_K1gSx5id/shots/s084_88.67.jpg` |
| BTS | 95 | 93.21–96.71 | 10. Album sleeve + vinyl slide-out | `ref_frames/Dc_K1gSx5id/shots/s095_93.21.jpg` |
| BTS | 96 | 96.71–98.50 | 10. Album sleeve + vinyl slide-out | `ref_frames/Dc_K1gSx5id/shots/s096_96.71.jpg` |
| BTS | 98 | 102.96–107.08 | 11. Face-pop orbit and extrude title (BTS card, award prop) | `ref_frames/Dc_K1gSx5id/shots/s098_102.96.jpg` |
| BTS | 99 | 107.08–109.12 | 18. Speech-bubble stack (duo, mic bubbles, reaction sticker) | `ref_frames/Dc_K1gSx5id/shots/s099_107.08.jpg` |
| BTS | 102 | 112.29–117.50 | 10. Album sleeve + vinyl slide-out | `ref_frames/Dc_K1gSx5id/shots/s102_112.29.jpg` |
| BTS | 110 | 131.29–132.83 | 9. Hero prop + title stack (isometric, landmark, trophy, stationery) | `ref_frames/Dc_K1gSx5id/shots/s110_131.29.jpg` |
