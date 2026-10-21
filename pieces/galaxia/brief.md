# ¿Cómo se forma una galaxia? — brief

- **Spec:** 9:16, 1080×1920, 24 fps, 71.6 s (the voice is the clock), 120 BPM grid, style pixdoc (360×640 world, box captions).
- **Source:** adapted from the reference "Building a Galaxy in 13 Billion Years" (Ref posit pixel), Spanish, reworded, extended, new scenes (loupe on Sgr A*, "TÚ ESTÁS AQUÍ", the collision with tidal tails and a starburst, the 50 % caveat).
- **Voice:** the user's single Spanish take (`Ref posit pixel/Voces/`), cut into 12 lines at measured silences (`voice/*.wav`, `voice/script.json`); word times from faster-whisper on the take (`voice/words.json`) mapped into `voice.json`. A 1.4 s pause before "en el centro" carries the silence and the hit.
- **Device:** one galaxy grows under a cosmic clock (billions of years after the Big Bang): 0,00 → 13,8 → HOY → ¿FUTURO?. Violet = dark matter, gold = core/heat, blue-white = stars, rose = Andromeda.

## Beats
| # | t | beat | sound |
|---|---|---|---|
| 1 | 0–6.25 | title, a turning spiral, push-in | bed from 0, stardust arp, chime |
| 2 | 6.25–12.75 | the point, flash, golden fireball cooling | riser → bang (sub + burst), falling pulse "ni una estrella" |
| 3 | 12.75–17.5 | dark ages: haze thins, motes drift | bed only, low wind |
| 4 | 17.5–23.5 | the dark-matter web draws on; "(INVISIBLE)" | walking bass starts, a zip per filament |
| 5 | 23.5–29.5 | gas falls into the nodes, they ignite; ESTRELLAS counter | half-time drums, theme, a ping per star |
| 6 | 29.5–37.75 | satellites spiral in and merge; GALAXIAS FUSIONADAS 0→8 | a whistle + thump per merger |
| 7 | 37.75–43 | spin flattens it into a disk; arms | peak: full drums |
| 8 | 43–44 | silence: the core as one gold point | silence |
| 9 | 44–50.75 | loupe on the centre: accretion disk, photon ring, orbiting stars; SAGITARIO A*, ≈ 4 MILLONES DE SOLES | THE HIT (44.0), rumble, the payoff |
| 10 | 50.75–57 | HOY; the camera springs to the Sun: TÚ ESTÁS AQUÍ | lift theme (D–E–A), marker beeps |
| 11 | 57–67.25 | Andromeda arrives; if they collide: tidal tails, starburst, an elliptical; ¿FUTURO? 50 % | thin; riser, crash, sparkles, chime |
| 12 | 67.25–71.6 | the elliptical; "ASÍ SE FORMA UNA GALAXIA" | F# major ending |

## Music (own)
F# minor (F#m–D–A–C#), walking bass with a chromatic approach into each chord, "stardust" arp that only climbs with an echo 3 sixteenths later, tresillo (3+3+2) lead, shaker + half-time clap drums; ends in F# major. Mixed under the voice at −9 dB (ducked).

## Claims and sources
- Universe 13.8 billion years old; first stars within the first few hundred million years (estimates vary, 100–350 Myr) → the voice says "cientos de millones de años". [CfA dark ages](https://www.cfa.harvard.edu/news/dark-ages), [Sci.News](https://www.sci.news/astronomy/first-generation-stars-big-bang-09796.html)
- Sgr A* ≈ 4.3 million solar masses. [Wikipedia](https://en.wikipedia.org/wiki/Sagittarius_A*)
- Milky Way–Andromeda: ~50 % chance of a merger within 10 billion years (Sawala et al. 2025). [ESA/Hubble heic2508](https://esahubble.org/news/heic2508/), [EarthSky](https://earthsky.org/space/galactic-collision-milky-way-andromeda-50-percent-chance/)
- The clock values between beats and the counters (stars, mergers) are illustrative.
