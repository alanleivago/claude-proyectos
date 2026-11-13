---
type: plan
status: draft
tags: [cartoon3d, cartoon3d-famosos, nvidia-huang, shot-list, sequential-camera]
relatedTo: [pieces/nvidia-huang/script.md, pieces/nvidia-huang/facts.md, styles/cartoon3d/STYLE.md, fuentes/cartoon3d/camara-secuencial-ricks.md, pieces/trash-library/shots.md]
---
# nvidia-huang — shot list (beat table v1)

64.2 s, 9:16, 30 fps (1926 frames; +1.4 s meme explosion, composited in post over 62.45–64.2). Voice: VoiceStudio "3d cartoon" 227af074, take 11 (59.84 s), pauses tightened
(-0.67 s), NO tempo change (user 2026-11-13: never speed the voice up) = 59.17 s, + 2 wordless gags (0.9 s each:
G1 after "wife." 32.02-32.92, G2 after "ski slope?" 50.33-51.23) = 60.97 s; last word ends 60.56; closing gag
60.56-62.80 (2.24 s). Word times = `voice/words.json` (caption text = the script's words).

**Camera (seqCam rule, `fuentes/cartoon3d/camara-secuencial-ricks.md`):** each set is ONE continuous take on a spline
(x, y, zoom, roll + orbit angle); the camera never stops (still ≤ 20 %), changes axis every 1.2–1.8 s, 3+ axes at once
most of the time, lands on a subject ON the word that names it, then drifts while it speaks. Dutch roll ±3–8° that
breathes (stronger in the chaos beats). Set changes = whip with 4–6 frames of motion blur + short smear, in the travel
direction (no black band). Peak angular speed < ~110°/s outside the whips. 6 takes = 7 whips (C↔E reuse noted).

**STYLE.md §9 lessons applied:** stable shadows (`stableShadow`, `toonShadowTwin`); no paper cards seen from a high
crane (pitch the card in `pose`); held props (phone, skis, folder, stamp) in FOCUS with gripProp in both hands;
desks/tables that hide legs get a depth-only double in FOCUS; characters alive (`look:[x,z]`, anticipation, squash on
landings, weight shift in holds); Ricks grade (warm key, sky-blue fill, saturated screens/papers, never cream stacks);
dense sets with real silhouettes, no plain boxes.

## Characters
- **Huang (hero)** — caricature: round white toon head, swept-back grey hair, rectangular glasses, smug grin;
  black leather jacket over a black tee, dark jeans. The jacket must read in every shot (the closing gag uses it).
- **Intern** — own face and body: lanyard, oversized hoodie, big sneakers, messy hair. Deadpan.
- **Board members** (3–4) — distinct invented faces, suits; no real people.
- **Office staff / traders / janitor** — distinct generic extras.
- **Alice Huang (revision 4, user request 2026-11-13)** — shown ONLY as a neutral businesswoman beside the MEGASPEED sign
  and the Singapore map, with a name card "ALICE HUANG · MEGASPEED" (purple top, blonde ponytail, brown skin, coffee mug).
  Never as a spy, nothing romantic, no claim beyond the script; she is not in the "Ministry of State Security" cut-in.
- **TV speakers (revision 4, user request)** — the China denial (s09) shows an invented foreign-ministry spokesperson at a
  "FOREIGN MINISTRY" podium; the FBI line (s14) shows a toon caricature of the president at a generic-seal podium with the
  accurate quote card "I KNOW THE FBI IS LOOKING INTO IT". Every other face is invented.
- **Allegation staging** — the MSS cut-in (20.98–24.8) is framed as the Times' claim: an "ILLUSTRATION" case, a
  "U.S. INTELLIGENCE MEMO · per NYT" folder stamped "ALLEGED".
- **Logos:** no real logos. "NVIDIA" may appear as plain text on an in-world sign; newspapers as plain-text mastheads
  ("THE NEW YORK TIMES" in a generic serif, "REUTERS" wire ticker in plain caps).

## Sets
- **A keynote stage** — huge curved LED screens, a giant glowing chip rising on a lift, spotlights, a mic stand,
  audience silhouettes, "NVIDIA" plain text on the screen header.
- **B HQ floor** — open-plan office with a glass corner office (Huang's), desks with phones and monitors, plants,
  wall calendar, blinds on the glass.
- **C newsroom / headline wall** — printing press rolling papers, a wall of headlines and a wire-ticker strip, map with a
  Singapore pin, a wall TV, desks with typewriters/laptops.
- **D boardroom** — long table, leather chairs, tall windows with a city view, a stamp and a filing tray.
- **E trading floor** — LED stock ticker band, a giant wall chart, trader desks with screens, a headline crawl, a window.
- **A' empty stage** — set A after the show: house lights half on, screens dark, one spotlight, mic stand.

## Beats
| # | t0–t1 (s) | set | words | what we see | camera |
|---|---|---|---|---|---|
| 1 | 0.00–1.36 | A | Imagine you're Jensen Huang, | the giant chip rises behind him; Huang in the leather jacket spreads his arms to the cheering crowd | crane DOWN from the LED screens onto him + push, roll levels out |
| 2 | 1.36–5.86 | A | and in just two weeks you go from running the company behind the AI boom to handing in your resignation. | on "two weeks" a 14-day calendar fills the screen; on "AI boom" the screens burst into rising charts and chip graphics; on "resignation" the spotlight narrows and he holds up a single sheet of paper, grin fading | orbit right around him with parallax on the screens, then dutch roll IN on "resignation" |
| 3 | 5.86–9.78 | A | You co-founded Nvidia, and you've worn the same leather jacket on stage for years. | screen shows "NVIDIA · 1993" over a first chip (facts.md has no garage story); on "jacket" the leather shines; keynote snapshots of him in the same jacket flick across the screens year by year | whip up to the screen, crane down to a waist shot, push to the jacket on its word |
| 4 | 9.78–11.12 | A→C | Then, in late October, | a calendar leaf "OCT" tears off and flies | whip (travel right) into the newsroom |
| 5 | 11.12–14.98 | C | the New York Times reports that you're close to a businesswoman named Alice Huang. | the press rolls out a paper; headline (text only): "NVIDIA CHIEF CLOSE TO BUSINESSWOMAN ALICE HUANG" | track alongside the press, push onto the headline on "Alice Huang" |
| 6 | 14.98–15.82 | C | No relation. | a red stamp slams "NO RELATION" on the paper | snap push + small shake |
| 7 | 15.82–19.64 | C | She helped set up Megaspeed, a Singapore company that buys billions in your chips. | headline wall: map pin on Singapore → a "MEGASPEED" building sign → crates of chips stacked with cash bundles | lateral orbit across the wall, landing on each item on its word |
| 8 | 19.64–24.98 | C | And the Times goes further. According to the paper, U.S. intelligence believes she was recruited by China's spy agency. | a second edition rolls; headline: "U.S. INTELLIGENCE BELIEVES SHE WAS RECRUITED BY CHINA'S SPY AGENCY, TIMES SAYS" with a "NYT · OCT 29" source chip | crane UP along the press, dutch roll in as the headline lands |
| 9 | 24.98–27.28 | C | China calls that a smear, and nobody has been charged. | the wall TV: an empty foreign-ministry podium with the quote card "A SMEAR"; then a board "CHARGES FILED: 0" | whip to the TV, push, drift to the board on "charged" |
| 10 | 27.28–32.00 | C→B | So on a Sunday in November, you email your whole company: "I was unfaithful to my wife." | whip into the HQ: wall calendar "SUN · NOV 8"; Huang alone in the glass office typing; his monitor shows the quoted line and "To: All employees" | whip, crane DOWN through the glass office roof line to over-the-shoulder, push to the monitor |
| G1 | 32.00–32.94 | B | (gag) | he presses SEND; every phone on the floor buzzes at once and the whole floor slowly turns to stare at the glass office | fast pull back out through the glass + orbit to the staring staff |
| 11 | 32.94–33.46 | B | You don't say who. | Huang, still stared at, quietly lowers the blinds | push on the blinds closing |
| 12 | 33.46–35.82 | B→D | Your board opens an investigation the same day. | boardroom: board members (invented faces) slap a thick folder "INDEPENDENT INVESTIGATION" on the long table | whip into the boardroom, orbit around the table |
| 13 | 35.82–37.86 | E | On Monday your stock slides about five percent, | trading floor: ticker "MON · NVDA ▼ ~5%"; traders gasp, one drops his coffee | whip, crane UP from the traders to the ticker |
| 14 | 37.86–40.38 | E | and the president says the FBI is looking into it. | the wall TV: empty presidential-style podium (generic seal) + quote card "THE FBI IS LOOKING INTO IT" | lateral drift to the TV, push |
| 15 | 40.38–44.74 | E | On Wednesday the Times reports a second relationship, with an executive who reports to you. | the headline crawl: "WED · NYT: A SECOND RELATIONSHIP, WITH AN EXECUTIVE WHO REPORTS TO HIM"; an org-chart card with an arrow up to "CEO" | track along the crawl, orbit to the org chart on "reports to you" |
| 16 | 44.74–46.64 | E | On Thursday Reuters reports another one. | the crawl: "THU · REUTERS: ANOTHER ONE"; a "+1" counter ticks | whip pan along the crawl, roll |
| 17 | 46.64–50.30 | E | Your intern stares at the chart and says, "Boss, is that a graph or a ski slope?" | the intern in front of the giant wall chart plunging down; deadpan line | push to the intern, orbit round him to reveal the chart on "ski slope" |
| G2 | 50.30–51.28 | E | (gag) | the intern grabs a pair of skis, slaloms down the falling chart line and flies out of the window | pull back + crane following his run to the window |
| 18 | 51.28–55.58 | E | You see, when one man is the face of a company this big, investors are buying him along with the chips. | a giant cardboard cutout of Huang's face rides in a shopping cart next to a box of chips with one price tag "CHIPS + JENSEN" | crane down to the cart, orbit with parallax on the trader desks |
| 19 | 55.58–57.72 | E→D | That same day, Nvidia files a notice. | boardroom: a one-page filing slides into the tray: "has resigned … effective immediately" | whip back to the boardroom, push onto the page (low angle, not top-down) |
| 20 | 57.72–58.46 | D | It's official. | a stamp lands: "FILED" | snap push + shake |
| 21 | 58.46–60.56 | A' | Thirty-three years, and the end took two weeks. | the empty stage: one screen flickers "1993 → 2026", then the 14-day calendar from beat 2, then goes dark | whip to the stage, slow crane back and up |
| close | 60.56–62.80 | A' | (closing gag) | the spotlight finds the leather jacket hanging alone on the mic stand; the janitor tries it on, checks his reflection in a dark screen, and quietly hangs it back up | slow orbit in toward the jacket, settling as he hangs it back |

## Facts on screen (checked 2026-11-13, see facts.md)
- Co-founded Nvidia in 1993; 33 years — PBS/AP; Nvidia board bio (row 1).
- Alice Huang, no relation, helped set up Megaspeed (Singapore), a big Nvidia buyer; "billions" only — CNBC, PBS/AP,
  CNN, Axios; TechCrunch/CNN analyst estimate >$4B (rows 2–3).
- NYT (29 Oct) reported the two were close — TechCrunch timeline, Reuters syndication (row 5).
- NYT: U.S. intelligence believes she was recruited by China's Ministry of State Security — allegation, always shown as
  "Times says" — via CNN, CNBC, TechCrunch, PBS/AP, FT (row 6).
- China's Foreign Ministry called it a smear (9 Nov) — AP, SCMP (row 7). No charges as of 13 Nov — PBS/AP, Al Jazeera (row 8).
- Sun 8 Nov email "I was unfaithful to my wife", no woman named — PBS/AP, CNBC, TechCrunch (row 9).
- Board opened an independent investigation the same day — CNBC, TechCrunch, PBS/AP (row 10).
- Mon 9 Nov stock down about 5 % — TechCrunch citing AP (row 14).
- President: "I know the FBI is looking into" it — Al Jazeera, AP (row 11).
- Wed 11 Nov NYT: second relationship, an executive who reports to him (not named on screen) — Axios, CNN, PBS/AP (row 12).
- Thu 12 Nov Reuters: another employee — NBC citing Reuters, TechCrunch (row 13).
- 8-K: "has resigned as President, Chief Executive Officer, and a member of the Board, effective immediately"; no reason
  given, so nothing on screen says fired or why — SEC 8-K, CBS, NBC, PBS/AP (row 18).
- Not on screen: stock dollar figures, "most valuable company", the WSJ ouster report, the second executive's name.
