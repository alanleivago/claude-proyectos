# luna — ¿Qué pasaría si la Luna chocara contra la Tierra?

## Spec
- 9:16, 1080×1920, 24 fps, 70.0 s (1680 frames). Spanish on-screen text. Style **pov3d** (three.js r149), started from `styles/pov3d/template-ola` (ola-700), new world.
- Format **F5, fixed place**: a handheld camera floating ~40 m up over the rooftops of a coastal town at night. A main street runs down to a promenade and quay; a harbour with moored boats; a jetty with a red/white lighthouse and a sweeping beam; a wooded headland with house lights on the left; a far headland on the right; the open sea. At the end the camera drifts back 18 m and tilts up 26° at the wave (58.5–62.95 s).
- Reference: `Ref Lunar Animation/What if the moon crashed into earth.mp4` (80 s). Stills, spectrogram and the comparison sheet are in `references/lunar/` (moon_*.png). Same kind of scene, own layout.

## Beats
| # | time | picture | HUD | caption |
|---|---|---|---|---|
| 1 | 0–5 | sleeping town, a few lit windows, lighthouse beam, stars, a thin cloud layer, a small Moon | — | title (2 lines, auto-fit) |
| 2 | 5–16 | the Moon grows (0.5° → 2.6°); windows switch on (TV flicker); people come out onto the promenade; a car passes; the sky brightens | LA LUNA 384.400 → 90.000 km ↓, "y cayendo" | La Luna está cayendo. |
| 3 | 16–26 | tide +3 m: water over the quay and the promenade, boats lift, splashes against the wall; people retreat up the street | → 40.000 km, "la marea sube" | Su gravedad arrastra el océano. |
| 4 | 26–34 | lava cracks spread along the Moon's Voronoi plates; it fills about half the sky; dust and embers come off the cracks | 18.000 km, "límite de Roche" | Entonces la Tierra la desgarra. |
| 5 | 34–38 | the plates slowly part, the cracks blaze (a tense pause) | — | Se rompe. |
| 6 | 38–48 | a fireball and burning debris; plates (molten inside) drift apart and fall; 45 fragments streak down with flame and smoke trails; flashes, fireballs and smoke columns on the horizon; the sky turns red-orange | IMPACTOS 0 → 3.000+, "y contando" | Caen trozos como montañas. |
| 7 | 48–56 | a big fragment hits the ocean (white column); the sea drains to −7 m (boats settle, rocks show); a dark line rises on the horizon | ALTURA DE LA OLA 0 → 400 m, "a N km" | Uno cae en el océano. / El mar se retira. |
| 8 | 56–64 | the wave arrives (spray, mist, debris), swallows the lighthouse, roofs and the bell tower; the camera drifts back and tilts up; the light darkens; hit at 63.0 | 400 m, "a N m" → AQUÍ | La ola mide 400 metros. |
| 9 | 64–66 | grey-white spray → murky water with dark particles → black | — | — |
| 10 | 66–70 | end card on dark | — | Tranquilo: / la Luna se aleja / 3,8 cm cada año. |

## Techniques (kept from the template)
Handheld float (sums of sines) + end camera move; VSM 4096 soft shadows (moonlight, later fire light); ACES on meshes, the sky shader without tone mapping; ColorManagement.legacyMode=false; the swept wave wall with organic foam streaks, crest/toe foam, lip mist and toe churn; the wave's shadow edge (`olShade`); instanced detailed people (12 parts); moving clouds; sprites with depthWrite off + renderOrder 10 (spray pool with depthTest=false); feathered text shadows; title auto-fit.
New: houses as one instanced mesh with a world-sized facade sheet and a light sheet whose alpha is each window's switch-on moment (`uOn`), TV flicker; gable roofs with tile texture; the Moon as 22 Voronoi plates of one shell whose seeds also draw the lava cracks, so it splits along its own cracks (back faces = molten interior); a sweeping lighthouse beam; glow points for street lamps and hill lights; one tide/drain level for harbour, promenade and streets (ground function shared with the water shader).

## Sound plan (src/score.js, all synthesized, NO MUSIC)
Reference measured: 0–18 s quiet (−30…−24 dB), from 19 s −17…−11 dB, loudest −9.1 dB at 55.9 s, a hard low-pass "underwater" drop at 62.5 s, quiet end (−28…−40 dB).
Buses: ambience, roar, events, hit, wind; room reverb + long far echo. The split (33.95–38.0) cuts everything but the wind bus; the vacuum (62.42–62.98) cuts every bus and both returns; the hit has its own bus. Loudness stage in the score (mix): BS.1770 integrated loudness measured on the folded mix, gain for −15 LUFS, look-ahead limiter at −2.6 dBFS, handed to the tail via `normIn` (stems reuse it).
Layers: crickets (4), sea bed + laps, distant dog, two bell-tower strikes, wind + gusts; shutters/windows (13), doors, a growing murmur + voices, a car pass with Doppler; sea swell, slaps on the wall, hull knocks, rope creaks, water over the quay; deep rumble (brown + 28–38 Hz sine + 44–52 Hz), 16 enormous rock cracks, 7 groans; a whoosh with falling pitch and pan sweep per fragment (45) and a delayed boom per impact; 4 car alarms, barking, crowd panic + screams, fire crackle; drain suction, trickles, gurgles, slurps, hull creaks at each boat's settle time, a civil-defence siren, the rising roar; full-band roar, water crackle, 6 house-crush booms with glass, wind howl, surge, debris; THE HIT (double sub, falling boom, full-band water explosion, crunch, 44 debris clatters); silence; muffled bubbles + faint wind.
Measured on the score render (pre-export): −15.4 LUFS integrated, true peak −1.4 dBFS, loudest 100 ms −6.5 dB at 63.2 s (the hit), 62.45–62.95 at −94 dB RMS, 64–66 digital silence, split pause −39 dB.

## Claims + sources
- "384.400 km" — mean Earth–Moon distance 384,400 km (NASA Moon fact sheet).
- "18.000 km · límite de Roche" — Roche limit for the Moon ≈ 18,000 km if treated as fluid (≈ 9,500 km as a rigid body). Sources: BBC Sky at Night Magazine ("What would happen if the Moon crashed into Earth"), Universe Today (Roche limit). Supplied with the approved story.
- "Tranquilo: la Luna se aleja 3,8 cm cada año." — Lunar Laser Ranging (Apollo retroreflectors) measures the Moon receding ≈ 3.8 cm per year (NASA). Supplied with the approved story.
- 400 m wave, impact counts and HUD distances during the fall are illustrative (hypothetical scenario); the Moon's on-screen size is exaggerated so it reads.
