# STYLE SPEC: "F1 explained" collage reel (1080×1920, 24 fps, 181 s)

## 1. Rhythm stats
- **97 shots in 181.25 s.** Mean 1.87 s, median ≈1.75 s, range 0.42–6.96 s. About 16 shots are under 1 s, and only 3 run longer than 3.5 s.
- **Time split:**
  - Talking head (TH): 31 shots, 67.5 s (**37%**), mean 2.2 s.
  - Designed graphics: 26 shots, 56 s (**31%**), mean 2.15 s.
  - Found footage and screen captures (B&W memes, news clips, F1.com and Instagram screen recordings): 40 shots, 58 s (**32%**), mean 1.45 s.
  - So ≈63% of runtime is non-TH. The reel never stays on a TH shot longer than 5.5 s.
- **TH pattern:**
  - Fixed setup: red-haired host, centered, beige room, toy car held at the chin like a mic.
  - Almost every TH shot is 1–3 s and carries 3–6 caption chunks.
  - Each TH shot ends on a speech clause, and the next graphic is triggered by its key noun.
  - Framing: 100% (face center y≈30%, head width ≈30%) with a slow 3–8% digital push-in plus a ±1° handheld drift.
  - Settle/punch variants: open at 110–135% and ease out to 100% in 3–14 frames (zoom-out settle). Or punch in from 105% to 135% over 2 s for emphasis.
  - Occasional shot with no captions, which is fine.
- **Speech triggers for graphics:**
  - A **name** (Lewis Hamilton, Max Verstappen, Carlos Sainz) gets a face-on-vehicle or face-on-body cutout with the name in display caps.
  - A **number or list** (11 teams, 22 drivers, laps 50–70, tyre compounds) gets a stacked cascade, one row per count at 2–3 frames per row.
  - **Jargon** (Grand Prix, pit stop, pole position, tyre compounds) gets a pixel or vector explainer with a title tab.
  - A **schedule** (FP1, FP2, Race Day) gets a calendar sticker.
  - **Proof or source** gets a dimmed website screenshot or Instagram screen recording.
  - **Emotion or irony** gets a 1–2.5 s B&W scanline meme with a bold caps caption.
  - **Literal verbs or nouns** (crash, safety car, wet weather) get a 0.4–1.2 s news clip on the word.
- **Graphic-scene text:** the caption system is off on all graphics and B-roll. Scene text replaces it.

## 2. Palette and backgrounds
| Role | Hex |
|---|---|
| F1 red / logo | #E10600 |
| Car red | #C8142A; maroon wings #B01826 |
| Hair/accent red | #E8161B |
| Red scene bg | #D91A28 (gradient #B01018→#6A0810 for road) |
| Teal tab/floor | #7ED3B2 / #7FD6B3; deep #2E9E78; mint #B8EBDD |
| Gold pill/sticker | #E8C873→#C9A24A; sticky #E6BE4C→#D9AE3A; lane #F3E8C0→#D9B968 |
| Cream halftone bars | #F5E9CC |
| Williams blue | #1F2FD0 / #1B3FCC (cyan #4CC3DD / #3FB7E8) |
| Text black | #111–#1A1A1A |
| Thin text gray | #222 |
| Ghost gray (pre-reveal) | #9A9A9A–#BBB |
| Tire-mark gray | #9A9A9A |
| Wall beige (TH) | #D9C7B0 |
| White | #FFFFFF / #FDFDFB |

- **Default graphic bg:** flat white #FDFDFB with no vignette.
- **Teal halftone floor:**
  - Starts at y≈61% and runs to the bottom, in dots #7ED3B2 at 6 px pitch.
  - Fades lighter toward the bottom.
  - Mirrored, 30–40% opacity reflection of the subject on it.
- **Gray road:** gradient #777→#DDD starting at y≈62%, or a #6A6A6A→#2B2B2B band at y 66–73% with a scrolling white dash line (1 screen-width per second).
- **Red scene:** flat #D91A28 with a faint dot texture, dark-red slanted parallelograms in two corners, white lane lines and a checkered strip. A red manga speed-line road on white (top 62% white, bottom red) is the variant.
- **Gold/black band:** 8% tall, gold edges #D9B94A, core #1A1A1A, full bleed at y≈44–50%.
- **B&W treatment on all found footage:**
  - Grayscale, high contrast, grain.
  - Vertical or horizontal scanlines of 2–3 px at 20–40% opacity, fading in over ≈6 frames on the first clip.
  - Never on TH.

## 3. Typography
Black and white text with one accent colour per scene. No outlines except the "stack" and script cases below.

- **Captions (TH only):**
  - Thin or regular lowercase geometric sans (Poppins Light / Outfit), 40–46 px font, cap height 30–36 px.
  - White, centered at x 50%, y 14.5% (≈280 px).
  - 1–3 words per chunk, 0.25–0.75 s each, hard swap with no animation.
  - No stroke, at most a very faint soft shadow.
- **Thin lead-in:**
  - Lowercase geometric sans, #222, 28–45 px cap, centered, in the upper or middle third.
  - Examples: "everyone is", "based on where they finish".
  - Words arrive one per spoken beat (every 0.25 s).
  - Reveal: fade #BBB→#222 over 4 frames with a 4–6 px rise.
- **Wide display:**
  - Extended futuristic caps (Michroma / Orbitron / Zen Dots, notched N and G).
  - Black #111. Cap height 55–95 px (hero words up to 150 px).
  - Width 60–73% of the frame, centered.
  - Stacked in 2–4 lines at 68 px line pitch (≈1.2× cap height).
  - Each word enters in grey #8A8578–#9A9A9A and goes to black on the next beat over 4 frames, with no movement.
  - The hero word (MAX, TYRE, SAINZ) is 1.5–2× the size of its neighbours.
  - Typical y: 32–41% on white; 47–57% when it sits beside a character.
- **Labels:**
  - "Hard < H >" cards and pills use the display face with angle-bracket chevrons, 40–90 px cap, white on a black header bar or black on a white pill.
  - Row numbers "01–11" are thin sans at 28 px.
  - Clock and pin lines on stickers are thin sans at 28 px.
- **Outline stack (red scenes):**
  - White display caps, cap 55 px, line pitch 78 px, right-aligned at x≈73%.
  - One line reveals every 6 frames from ghost pink #F5B5BB to white.
  - From 85.5 s a thin outline traces the whole stack.
- **Script:**
  - Thin handwritten, white with a dark edge, rotated −8 to −10°, ≈20–23% wide, y≈48%.
  - Pops in over 3 frames and overlaps the top of the display word beneath.
- **Meme captions:**
  - Bold grotesque caps, white, cap ≈75 px, line pitch 100 px.
  - Left-aligned at x≈10%, y 60–75%, 2–3 lines, emoji in a circle at the end.
  - Fades in from gray over 3–4 frames.
- **Kinetic title (rare):** orange-gold gradient #FFB02E→#E07B10, 48 px cap, 3 centered lines, words pop in staggered at 0.25 s.

## 4. Ornaments
- **Teal title tab:**
  - Mint gradient #B8EBDD→white, notched top-left (stepped) corner.
  - x 7–93%, 13% tall, sitting at y 30–47% under the pill.
  - Mask-reveal growth over 6 frames, then the words pop in grey→black.
- **Gold pill:**
  - Capsule about 290 px wide, 2-line dark brown text.
  - Teal chevron "wings" at both ends, pointing outward-up.
  - Scale-pops in with ≈8% overshoot at 5 frames, and the wings flap ±10° on a 6-frame cycle.
  - Center y 22%, drifting to 26–29% as the stack settles.
- **Chevron tabs flanking a name:** teal gradient, tilted ±20°, wobbling like wings.
- **Hand-drawn ellipse:**
  - 6 px stroke in teal, red or gold (contrasting the sticker colour), with a tail loop at the upper left.
  - Stroke-wipe draw-on over ≈10 frames.
- **Calendar sticker:**
  - ≈60% wide on a tilted notebook grid (±10–12° rotation, thin black 1–2 px lines, cells ≈55% of frame width).
  - Red-pink #E2303D→#F07C88, gold or green, with a halftone texture and a curled bottom-right corner with a white specular shimmer.
  - Entrance is a glossy flap peel of 8–12 frames.
  - The previous sticker slides left at 25% opacity.
- **Speed lines:** black manga burst on white, redrawn every 2–3 frames (flicker). Four thin gray hairlines at x 12/24/87/94% in staggered 25–40% segments.
- **Tire tracks:** four #9A9A9A marks at −20°, 35% long, drifting slightly up-right.
- **Light/motion streaks:** yellow and green blurred car streaks of 2 frames each, with black horizontal blur.
- **Checkered strip:** a 9×10% block at the band end, or a strip along the bottom of the red scene.
- **Flags and pixels:**
  - 3D-extruded flag-filled circuit icons at 14–20% width in a ring (rx 40%, ry 30%).
  - Four waves of ~6 icons each at 0.25 s intervals, scale pop 0→100% with overshoot.
  - Gold coins, pixel tyres with 8 px blocks, mosaic sprites that shimmer.
- **Cards and cursor:** near-black rounded card (40 px radius) with a white arrow cursor that glides for 6 frames, ease-in-out, and a click flips the button to green #3FAF7F.

## 5. Face cutouts
- **Always grayscale** (desaturated, mid-contrast photo), pasted flat with no outline or drop shadow. The color elements around the face carry the saturation.
- **Placements:**
  - Cockpit of a red side-view car (≈20% frame width). Thumbs-up emoji on a yellow vector arm. Mirrored faded reflection on the teal floor.
  - Eye-strip in a dark visor of a front-view driver (helmet 52% wide at y≈50%).
  - Irregular **gold octagon** head (≈50% wide, centered x 35%, y 30%) on a thin-stick body. It carries pixel deal-with-it sunglasses and a finger-heart. Silver sneakers, gray gradient legs, teal ellipse shadow growing 15→45% wide.
  - Head + torso cutout on a pixel-mosaic suit (≈43–55% wide, head 21%), where the lower body dissolves into falling blue squares. Block size refines from ~25 px to finer over 1 s.
- **Motion:**
  - Bob ±8–10 px with a 6-frame period.
  - Head rotation −4° to +5°, plus a slight squash.
  - Hand bobs with the head.
  - Static-hold variants are allowed for end cards.
- **Entry:** low-res mosaic that resolves sharp in 2 frames. Or the vehicle drives in from the left (x 0–74%→centered in 6 frames, ease-out).

## 6. Animation vocabulary, camera, transitions
- **Entries:**
  - Word fade: 4 frames.
  - Scale pop: 110→100% in 3 frames.
  - Card/mask expand from center: 5 frames.
  - Stroke wipe: 10 frames.
  - Row cascade: 2–3 frames per row.
  - Vehicle slide-in: ease-out over 6 frames.
  - Drop-in with motion blur: ~6 frames.
  - Sticker peel: 8–12 frames.
- **Exits:** ease-in off-screen (car launches right with heavy motion blur, gone in 3–4 frames), 25% opacity fade for previous stickers, a 4-step pixel/slide wipe to white (≈8 frames), and the thing leaving the frame as the next one begins.
- **Camera on graphics:**
  - Push-in 4–8% over the shot.
  - Zoom-out settle: 135%→100% with defocus in 6–14 frames.
  - End-of-shot pull-back: car shrinks, text shifts up.
  - 2.6× zoom-through from a car close-up into a rear-wing close-up.
  - Parallax on road (scrolls) vs coin.
  - Slight drift of 3% on holds.
- **Transitions (97 cuts, approximate):**
  - **Hard cut, ≈72%.** Zero frames, on the spoken beat.
  - **Blur / rack focus, ≈20%.** The first 3–6 frames of a TH shot are Gaussian-blurred 20–30 px and sharpen. The outgoing side sometimes gets a 2–4 frame blur-out. Applied to roughly half of the TH entries.
  - **Flash-cut clusters, 3 times.** Shots of 2 frames each at 2.54–2.8 s, 69.9–70.0 s and 97.6–99.3 s (a burst of 11 cuts of 1–6 frames, with handheld shake).
  - **Whip/motion smear, ≈4%.** 2–3 frame sideways smear before a cut.
  - **Peel (sticker), 3 times.**
  - **Pixel/mosaic dissolve, 2 times.** On the end card and on the exit wipe.
  - **White flash.** 1–3 frames of #FFF before an infographic.
  - **Zoom-step jump cuts** on the same clip (1.15×→1.35×, 4 frames each).

## 7. Reusable scene types
1. **TH + caption**: the host at 100%, y 14.5% captions, 1–3 s.
2. **Logo build**: red F1 mark scales 65→80→73% with a "1" wiped in from the right over 6 frames, then flash-cut streaks.
3. **Name-on-vehicle**: white bg, teal halftone floor, red side-view car + grayscale cockpit face, thin first name (≈60 px, #555) above wide HAMILTON (85 px cap, 68% wide), flanking chevron tabs.
4. **Walker**: stick figure in gold octagon head, shadow ellipse, right-aligned word stack at x 57–88%, y 47–57%.
5. **Row cascade list**: 11 cards 49% wide × 8% tall, cream halftone bars, numbers at x 85%, ending in a ×1.7–2.1 close-up with a 4-line display stack.
6. **Top-down lane**: car drops in with a blur onto a gold lane (x 37.5–62.5%), logo chevrons flapping on a 0.5 s loop, then a 2.6× rear-wing close-up with title.
7. **Pixel explainer**: white bg, scrolling road, blue pixel car, coin, gold pill + teal tab + thin sub-line. Gets a trophy/hand pop (🏆) for payoffs.
8. **Calendar sticker**: tilted grid, peel-reveal, circled date, display title, clock and pin lines.
9. **Screen recording / screenshot**: dimmed page with 60% vignette, red highlight bar wiping over the headline (18 frames, linear), slow push-in of 4%.
10. **Red-scene grid**: red bg, four pixel cars sliding down into bracket slots, glow on the pole car, outline text stack.
11. **Meme insert**: B&W scanlines, 3-line caps caption, 1–2.5 s, usually a Bollywood, cartoon or dog reaction.
12. **Flag ring**: center text surrounded by a ring of 24 popping 3D flag icons.
13. **Tyre/card scroll**: three pixel tyres roll in (6-frame overshoot), then cards scale to 71% width and scroll up with ease-out and pills (LONG LASTING / FASTEST / BALANCED).
14. **UI card**: black rounded card with rows, cursor, a green click state, on white with a dark-red swoosh across the bottom 15%.
15. **End card**: pixel-mosaic body cutout + script name + black SAINZ + a UI capsule that widens symmetrically over 12 frames.

## 8. Avoid / what makes it this reel
- **Do not** caption the graphics or B-roll, or animate caption chunks. They hard-swap in the same spot.
- **Do not** use color photos of faces in cutouts, drop shadows, glows or outlines on them.
- **Do not** use smooth cross-dissolves. A dissolve should read as a blur, a flash or a pixel step.
- **Do not** let words arrive all at once. Reveal word by word, on the beat of each spoken word (0.25–0.5 s).
- **Do not** overuse color. Each scene is white (or one flat red) with one accent hue (teal, gold, red) plus black.
- **Do not** hold a shot still. Add at least a 3% drift, a bob, a flap or a coin loop.
- **Do not** let any shot run past 3.5 s without a cut, a swap or a camera change. The longest hold is ~7 s, and it is a scroll of cards.
- **Do not** use rounded humanist fonts. Only thin geometric lowercase and extended display caps.
- **The signature mix:**
  - A wide futuristic caps hero word against a thin lowercase lead-in.
  - Grayscale faces on vector or pixel bodies.
  - Teal/gold/red flat shapes with halftone dots.
  - Aggressive 0.5–1.5 s found-footage cuts with scanline B&W.
  - A talking head that keeps returning with a rack-focus blur and slow push-in.