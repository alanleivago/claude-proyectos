---
type: brief
status: draft
tags: [cartoon3d-test, human-library, mromidev-pipeline, remotion, copenhagen]
relatedTo: [scripts/cartoon3d-guiones-03.md, refs-ext/claude-animated-shorts, fuentes/cartoon3d/tutorial-mromidev-gap.md, pieces/flower-clock]
---
# human-library — "The Library Where You Borrow People" (ONE-OFF test of the mromidev pipeline)

User decision (2026-11-01): this single video is made end to end with the mromidev "cartoon-3d-short" pipeline
(refs-ext/claude-animated-shorts/SKILL.md) to compare against our approved cartoon3d look. No other piece uses it.

- **Stack:** Remotion 4.0.539 + three.js 0.169 + @react-three/fiber 8 + postprocessing, in `app/` (composition, 1080x1920, 30 fps).
  Source copied from their `templates/bridge/` into `app/src/videos/library/`; audio scripts in `audio/`.
- **Their look, unchanged:** Canvas2D bean-head characters (toon.ts, 3.5 head-heights, plum ink #241726, stick limbs,
  ink-dot hands), world ink #030303 5.1→3.3 px, lens blur per beat (CU 12-16 px, MS 10-12, wides 0), fog = horizon
  colour, day light preset (az 75 / el 48), NEUTRAL tone map + grade (Y' median ~0.57, S ~0.49), bloom on emissives
  only, NO grain, gliding cameras (18-40 f smootherstep, every hold creeps 0.15-0.35 %/f, punch 0.6 %/f, 4-5° rolls,
  7-frame flip kicks), crossfades only at place changes, 4-frame white flash after the hook.
- **Their sound:** synthesized SFX (sfx_gen.py/sfx.py) + their original march-style score (music.py/instruments.py),
  mix.py (music +3 dB, SFX −6 dB, voice unchanged), event table from timeline.py.
- **Kept from our rules (content, not style):** our voice (VoiceStudio "3D cartoon 2", take TBD by the user),
  English, no exclamation marks, correct facts, ONE-WORD subtitles (their skill says no captions — our standing
  rule wins; added as a Remotion overlay), export 1080x1920 (their 2K `--scale 1.3333` is NOT used), viral title,
  Telegram send of the final (tools/enviar_telegram.py).

## Facts (source line for SCRIPT.md)
Human Library (Menneskebiblioteket), founded in Copenhagen in 2000 by Ronni Abergel, his brother Dany, and colleagues
Asma Mouna and Christoffer Erichsen (first event at the Roskilde Festival 2000). Readers borrow volunteer "books" whose titles
are prejudged labels (Refugee, Former Prisoner, Police Officer, Tattooed…) for ~30-minute one-to-one conversations;
motto "Unjudge someone" / "Don't judge a book by its cover". Now held in 80+ countries. (humanlibrary.org)

## Cast (their toon.ts Outfit system — new outfits, bean heads)
- **You** — reader: mustard cardigan, jeans, messenger bag.
- **Librarian** — teal knit vest over white shirt, round glasses, hair bun; rubber stamp.
- **Former prisoner ("the book")** — big gentle man, grey hoodie, shaved head, kind eyes; a book-title tag on a lanyard.
- **Lady at the next table** — red coat, curly grey hair; her borrowed book = **firefighter** in turnout coat + helmet.
- **Catalog "books" extras** — refugee (scarf), police officer (uniform cap), tattooed guy (sleeves of drawn tattoos).
- **Crowd in the reading room** — other reader/book pairs at tables (townsfolk variants).

## Sets (their world.ts / build.ts / paint.ts)
1. **library-ext** — a Copenhagen street, day: colourful gabled houses (their facade painter: ochre/terracotta/cream,
   Nyhavn-like), canal edge, bikes, a grand library facade with "HUMAN LIBRARY" banner (painted, unlit sign face).
2. **reading-room** — warm interior (their two-tone shading + practical lamps): front desk with catalog + stamp,
   tall bookshelves (procedural boxes + painted spines), long tables with lamps, the chairs facing each other.
3. **world** — a desk globe / wall map in the reading room for "dozens of countries" (pins pop), so no new set.

## Shot plan (story.ts beats; frames filled from words.json once the take is picked)
| # | beat (script) | shot | camera |
|---|---|---|---|
| 1 | HOOK "a library where you don't borrow books" | library facade, people walk in, no one carries books | high wide → glide down to the door |
| — | "You borrow people." | white 4-f flash, cut | — |
| 2 | "walk up to the desk… hands you a catalog" | desk, librarian slides the catalog | MS, creep in |
| 3 | titles: Refugee / Former Prisoner / Police Officer / Covered in Tattoos | catalog insert, each title card pops with its "book" waving on a little card | insert, punch on each title |
| 4 | "You pick one, just to be bold" | you point at a title, gulp | CU, roll 4° |
| 5 | "stamps your card… return him in the same condition" | STAMP kick (7-f flip shake), librarian deadpan | MS → CU |
| 6 | "an actual man walks over and sits down" | the big guy walks across the reading room, chair creak | tracking glide 30 f |
| 7 | "Now it's awkward… hundred questions" | two-shot across the table, question-mark cards burst over you | creeping push |
| 8 | "that's the whole point… ask him anything" | he smiles, opens his hands; you relax | OTS CU, DOF 14 |
| 9 | "lady at the next table… a firefighter" | pan to the next table: lady + firefighter (helmet on the table) | glide |
| 10 | "Mine's way more interesting than yours" | lady leans in, smug; firefighter waves | CU, roll −4° |
| 11 | "You see, this started in Denmark…Human Library" | XFADE → Copenhagen street, 2000, banner | aerial wide → glide |
| 12 | "books are real volunteers… judge from far away" | far-away shot: people across the canal look like labels; push in, labels fall off into faces | long push |
| 13 | "You sit down, you ask, they answer, honestly" | three quick table vignettes | 3 glides |
| 14 | "easy to judge a whole group… hard to judge the one in front of you" | wide crowd of label-cards → slow push to the one man across the table | 40-f smootherstep |
| 15 | "runs in dozens of countries" | globe on the desk, pins pop | insert, creep |
| 16 | "Don't judge a book by its cover… just borrow it" | you walk out with him like a returned book, librarian stamps RETURNED; callback | wide, final creep |

## Workflow (their SKILL.md steps 3-11)
1. User picks the voice take → `voice/voice.wav` + hand-checked `words.json` → frames in story.ts.
2. Rewrite story.ts / build.ts / cast.ts / toon.ts outfits for the two sets; keep their look values.
3. Look checks: stills via `scripts/bridge-stills.mjs` (REMOTION_TMP=F:/remotion-tmp), side-by-sides vs reference
   frames with `scripts/sbs_sheet.py`, verifier scoring per area out of 10.
4. Storyboard of stills for the user, then render: `npx remotion render src/index.ts LibraryShort out/video.mp4
   --codec h264 --crf 16` (scale 1 = 1080x1920), mux `-map 0:v:0 -map 1:a:0`, `scripts/short_qa.py`.
5. Sound with their audio/ scripts, then final, Telegram, viral title.
