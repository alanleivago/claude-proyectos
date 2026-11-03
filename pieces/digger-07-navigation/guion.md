---
type: doc
status: draft
tags: [guion, mechayuki, cat-explains-format, navigation, gps, polaris, stick-chart, compass, portolan, harrison, longitude, sextant]
relatedTo: [digger-channel, mechayuki-rules, cat-explains-it, digger-06-bathing]
---

# Digger 07: How people found their way before GPS (161 words, ~71 s + outro)

A thousand years ago, there was no GPS… so you lose sight of land, and you're lost. So how did anyone get home?

First, the stars. You steer by the North Star… until clouds hide it.

Marshall Islanders built stick charts of the ocean swells. They memorized them… and left them on the beach.

Rome put milestones along its roads. Great… if you stayed on the road.

Around eleven hundred, Chinese sailors used a magnetized needle. This is a compass. It points north… and that's all it tells you.

Sea charts were drawn by hand… and every copy could add a mistake.

Out at sea, nobody could measure longitude. In 1761, John Harrison's sea clock kept near-perfect time. Add a sextant… and you knew where you were.

Then came satellites. Your phone listens to at least four of them. This is GPS.

GPS clocks run thirty-eight microseconds a day fast, because of Einstein. Unfixed, maps would drift about ten kilometers a day. Logging off.

---
**Format:** the #06 cat.explains.it chain (`fuentes/cat-explains-it/SINTESIS.md`): time-first hook with a felt problem (lost at sea) and an empty meter; 6 historical fixes of ~6-8 s each, she USES each one in its own set, a 3D name label, a concrete flaw with an android gag, meter +1 (or no point); a person + year card (John Harrison 1761); the modern fix fills the meter; a closing fact with numbers; the short sign-off.

**Meter "FOUND":** stars 1 · stick chart 2 · milestones (no point: roads only) · compass 3 · sea chart (no point: copying errors) · Harrison + sextant 4 · GPS 5 (full, "FOUND").

**Hook** (`yt-script/hookscore.py`, 10 options with the required "[X] years ago, there was no GPS…" opener):
1. "A thousand years ago, there was no GPS… so you lose sight of land, and you're lost. So how did anyone get home?" **57 WORKABLE** (The Question; the score is for the same line without the second "so"). Chosen.
2. "A thousand years ago, there was no GPS… so you lose sight of land, and you're lost. Unless you knew one trick." 49
3. "A thousand years ago, there was no GPS… so you lose sight of land, and you're lost." 45

**Humanizer pass:** spoken clauses, no staged openers or triads; the compass flaw rewritten from a "north, not where you are" contrast to a plain "that's all it tells you"; "This is a…" only for the real artifacts (compass, GPS).

**Voicing notes:** no "!". One question (hook, rises: fix_q on "home"). "1761" → "seventeen sixty-one", "eleven hundred" spelled, "thirty-eight", "ten kilometers". "Marshall" plain.

**On-screen text = audio:** NO GPS · LOST · NORTH STAR · STICK CHART · MILESTONE · AROUND 1100 · COMPASS · NORTH · SEA CHART · MISTAKE · LONGITUDE? · 1761 / JOHN HARRISON · SEXTANT · AT LEAST FOUR · GPS · FOUND · 38 MICROSECONDS · 10 KM A DAY.

**Timing:** 161 words at the megagirl pace (#06: 171 words = 74.3 s) ≈ 70 s + ~2 s outro ≈ 72 s. The Harrison card lands at ~44 s (later than the ~35 s target: the 6 fixes come first, in date order).

## Fact check (2026-11-02)
| line | verdict | source |
|---|---|---|
| Out of sight of land, without instruments you could get lost | general | — |
| Steering by the North Star (Polaris barely moves, sits ~0.7° from the celestial pole); useless under cloud | correct | [Wikipedia: Polaris](https://en.wikipedia.org/wiki/Polaris), [Celestial navigation](https://en.wikipedia.org/wiki/Celestial_navigation) |
| Marshall Islanders made stick charts of ocean swells; they were memorized on land and not carried on voyages | correct | [Wikipedia: Marshall Islands stick chart](https://en.wikipedia.org/wiki/Marshall_Islands_stick_chart) |
| Romans put milestones along their roads | correct (miliaria, every Roman mile) | [Wikipedia: Milestone — Roman](https://en.wikipedia.org/wiki/Milestone#Roman_Empire) |
| Around 1100, Chinese sailors used a magnetized needle compass | correct: Shen Kuo described the magnetized needle (1088); Zhu Yu's *Pingzhou Table Talks* (1111-1117) records the compass used at sea ~1099-1102 (Song dynasty) | [Wikipedia: Compass — History](https://en.wikipedia.org/wiki/Compass#History), [Zhu Yu](https://en.wikipedia.org/wiki/Zhu_Yu) |
| A compass only gives direction, not position | correct | — |
| Sea charts (portolans) were drawn and copied by hand; copying could introduce errors | correct, hedged ("could") | [Wikipedia: Portolan chart](https://en.wikipedia.org/wiki/Portolan_chart) |
| Longitude could not be measured reliably at sea before the 18th c. | correct (Longitude Act 1714 after the Scilly disaster of 1707) | [Wikipedia: Longitude prize](https://en.wikipedia.org/wiki/Longitude_rewards) |
| 1761: John Harrison's sea clock (H4) kept near-perfect time | correct: H4's trial voyage to Jamaica (Nov 1761-Jan 1762) lost ~5 s in 81 days | [Wikipedia: John Harrison — H4](https://en.wikipedia.org/wiki/John_Harrison#Longitude_watches) |
| A sextant + accurate time gives your position | correct (sextant 1759; noon sight for latitude + chronometer time for longitude) | [Wikipedia: Sextant](https://en.wikipedia.org/wiki/Sextant), [Marine chronometer](https://en.wikipedia.org/wiki/Marine_chronometer) |
| A phone needs at least four GPS satellites for a position | correct (3D position + clock error) | [Wikipedia: GPS — Navigation equations](https://en.wikipedia.org/wiki/Global_Positioning_System#Navigation_equations) |
| GPS satellite clocks gain ~38 µs/day (relativity); uncorrected, positions would drift ~10 km/day | correct (net +38.6 µs/day; ~10-11 km/day commonly cited) | N. Ashby, "Relativity in the Global Positioning System", *Living Reviews in Relativity* 6 (2003); [Wikipedia: Error analysis for GPS — relativity](https://en.wikipedia.org/wiki/Error_analysis_for_the_Global_Positioning_System#Relativity) |
