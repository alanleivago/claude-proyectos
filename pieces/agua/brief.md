# ¿Qué pasaría si toda el agua desapareciera durante 5 segundos?

- **Spec:** 73 s, 1080×1920, 24 fps, pov3d (three.js PBR, planar water reflections, bloom, lens flare, motion blur on camera turns, saturation +32 %). Spanish.
- **Reference:** "What if all water on Earth disappeared for 5 seconds" (Ref Lunar Animation): POV on a bench, a pet on your lap, the fountain plaza, the waterfront, slow motion ×10, the water slamming back.
- **What we changed from the reference:**
  - A bay with a marina, a lighthouse and mountains, instead of the river.
  - A golden puppy (shell fur), instead of the cat.
  - A glass of water in your right hand, which empties and refills.
  - Our own plaza, buildings and people.
- **Detail asks (user):**
  - Hands, bodies (skinned smooth bodies, new walk), grass (instanced blades in the wind), water (wave shader with reflections).
  - Autumn leaves blowing, sparrows and a flock, trees shading the bench, more buildings and saturation.
  - Lens flare, and the drop symbol over the title and the HUD.

## Beats
| t | shot |
|---|---|
| 0–9 | lap: puppy + glass + title → turn to the plaza and fountain → turn to the bay → back to the glass; countdown 9→0 |
| 9 | everything with water vanishes: glass, fountain jets, the bay, clouds |
| 9–15 | lap, the glass empty, ×10 slow |
| 15–22 | the dry fountain, kids frozen |
| 22–26 | lap: "Hasta el agua de tu vaso." |
| 26–36 | the empty bay: boats lying on the mud, pontoons fallen, fish |
| 36–44 | people at the railing |
| 44–50 | the plaza, a person mid-stride |
| 50–56 | you lift the empty glass; heartbeat; 56.0–56.5 black silence |
| 56.5–58.7 | the water snaps back; a breaker races in from the bay |
| 58.7 | it slams the seawall (the loudest moment); spray over the railing; drops on the lens; people run screaming |
| 62–64 | your glass is full again |
| 64–73 | end card |

## Sound
- **Recordings (CC0 via Openverse/Freesound):** harbour gulls, water lapping under a dock, calm sea wash, a fountain, people talking, kids playing, autumn wind in leaves, sparrows/birdsong, footsteps, tinnitus, flood rush, an ocean wave crash, big waves breaking on a groyne, a gull swarm, crowd screaming, dogs barking.
- **Code (sound/synth.py):** water-drop ticks, the vanish (suck, pop, sub), the dry drone, caption pings, the heartbeat, the return roar, the glass refill, the end tone.
- **Hero:** the hero-hit and hero-boom at 58.7.

## Claims + sources
- **71 % of Earth's surface is water; the oceans hold 96.5 % of it:** USGS, "The distribution of water on, in, and above the Earth" (usgs.gov/media/images/distribution-water-and-above-earth).
- **About 1,386 million km³ of water on Earth:** "Water distribution on Earth" (Wikipedia, after Shiklomanov 1993).
- **The human body is about 60 % water:** Project WET Georgia; Futura-Sciences (adult men about 60 %, women about 55 %).
