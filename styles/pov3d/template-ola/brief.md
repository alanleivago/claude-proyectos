# ola-700 — ¿Qué pasaría si una ola de 700 metros golpeara tu ciudad?

## Spec
- 9:16, 1080×1920, 24 fps, 65.0 s (1560 frames), 120 BPM grid. Spanish on-screen text.
- Style **pov3d** (three.js r149 offscreen → 2D canvas, kit.js text overlay). Started from `styles/pov3d/template` (sol-explota), new world.
- Format **F5, fixed place**: one eye-level camera on a harbour promenade (railing, big stone tiles, bench, life ring, globe lamps) looking out over a harbour: moored boats, a colourful old quay with houses + church + hill on the left, a jetty with a red/white lighthouse and a skyline of ~60 towers on the right, open sea and a breakwater lighthouse in the middle. Handheld float all the time (sums of sines, a few cm, ~0.3°); in beat 7 the camera backs away ~25 m while tilting up ~23° (lamps, benches, trees, flags pass).
- Reference: `Ref Lunar Animation/ssstik.io_@pov.what.if0_…mp4` (stills in `references/lunar/`). Same kind of scene, own layout.

## Beats
| # | time | picture | HUD | caption |
|---|---|---|---|---|
| 1 | 0–5 | sunny harbour, walkers, gulls, title (auto-fit, 2 lines) | — | title |
| 2 | 5–14 | water level drops 0.4 → −11.6 m; boats settle and heel on the mud; rocks, weed, tyres, crates, puddles, ~70 flapping fish; people stop and turn to the sea | NIVEL DEL MAR 0 → −12 m, "retrocediendo" | El mar se retira. |
| 3 | 14–17 | eerie calm | −12 m, "el mar se ha ido" | — |
| 4 | 17–26 | a dark line on the horizon (visual height exaggerated early so it reads) | ALTURA DE LA OLA 20 m → 80 m, a 15 → 12 km | Una línea en el horizonte. |
| 5 | 26–40 | the wall grows; people run past the camera; gulls and a flock flee | 80 → 250 m, km shrinking | Todavía está lejos. / Pero sigue creciendo. |
| 6 | 40–52 | dark teal wall, white crest, foam streaks scrolling down, lip mist, toe churn, debris; towers dwarfed then swallowed (splash bursts); its shadow sweeps the city, the bed and the promenade | 300 → 700 m, a 3 → 0,5 km | Más alta que los rascacielos. |
| 7 | 52–58 | camera backs away and tilts up at the wall; frame in shade; impact 57.5 | 700 m, "a N m" counting down → "AQUÍ" | No hay a dónde ir. |
| 8 | 58–61 | white spray-out → black | — | — |
| 9 | 61–65 | end card | — | La ola más alta registrada: / 524 m / bahía Lituya, Alaska, 1958. |

## Techniques
VSM 4096 soft shadows; ACES on meshes, sky shader without tone mapping; ColorManagement.legacyMode=false; code-drawn textures (paving, quay granite with wet/algae band, 4 window-grid kinds, house facades, wet-sand detail, foam streaks, foam noise, clouds, mist); sky cube env map drawn in code for glass/puddles/metal; one water shader (depth-based clarity over the bed, sky reflection, glitter, shoreline foam, uniform level); the wave = a swept profile mesh rebuilt each frame (toe skirt, concave face, overhanging lip, crest, back), its own shader; the wave's shadow = every lit material's sun term multiplied by a soft edge `uShZ` (onBeforeCompile on lights_fragment_begin) moving with zw + 1.27·H; sprites (depthWrite off, renderOrder 10) for lip mist, toe churn, tower/boat splashes and the impact; instanced people (6 parts, clothes) with roles (walk / stand / jetty / quay / runners / late runners).

## Sound plan (src/score.js v2, all synthesized) — modelled on the reference
Reference measured (`shotlog.py`, `references/lunar/spec.png`): gulls + light music 0–8 s, near-silence 8–12 s, then a harmonic siren wail (~450→950 Hz, ~7 s cycles) as the main voice over a slowly rising roar (−20 dB → −16 dB), a full-band roar slamming in at 49.8 s (up to 20 kHz, dense transients) rising to the impact (loudest −8.4 dB at 73.3 s), then silence and bubbles.
Routing: four buses (ambience, roar, events, hit), a room reverb and a long "far" city echo; the ambience ducks under the siren; a held-breath VACUUM ducks every bus and both reverb returns to nothing at 56.66–57.46; the hit has its own bus. A mix-only look-ahead limiter at −2 dBFS (patched onto `startRendering`) keeps true peak under −1 dB.
- **Harbour:** traffic hum (brown), city air (fluttered band), 3 cars passing behind with real Doppler (engine harmonics + tyres, frequency/gain/pan curves), fluttering water slap bed + ~20 laps + plops, hull knocks, buoy bell (5 strikes + clank on the mud), 11 gull calls (some Doppler fly-bys), promenade babble + voices, soft pad + plucks (music gone by ~9.5 s).
- **Drain:** fluttering suction bed, low pull, high trickles, ~25 gurgle clusters, 12 slurps, hull creaks at each boat's computed settle time, ~70 fish flaps.
- **Calm 14–17:** wind only (−46 dB).
- **Line → wall:** siren A (rich harmonics, LP opening 1.3 → 3.2 kHz, far echo) from 17.6, siren B from 23.5; a ground rumble you feel (brown LP 55 → 600 Hz, 29–37 Hz sine with slow wobble, 44–51 Hz triangle); 9 wind gusts; continuous wind rising.
- **Grows:** pink-noise roar body opening, panicked gulls (Doppler) + wing flutter, the dog barking, 20 car horns (half moving, Doppler drop), 34 screams (formant voices), crowd panic wash in the far echo, running footsteps.
- **Wall (44.8):** full-band roar slams in (high-passed white to 16 kHz + pink), ~900 crackle transients thickening, 8 tower-down events (boom + rumble + metal groan + glass), 70 glass tinks, 30 metal clanks, wind howl through the railings.
- **Arrival:** the camera's running footsteps, debris; **vacuum 56.66–57.46**.
- **Impact 57.5 (loudest):** double sub, 58→22 Hz boom, LP saw, three full-band water-explosion bursts, crunch, 44 debris clatters, short chord stab; ends by 58.35.
- **Silence 58.4–61.** **End card:** muffled underwater bed, bubbles, one soft chime + pad.

Measured on the score render: per second −29 → −12 dB, calm −46 dB, loudest 100 ms −7.7 dB at the impact, 0.8 s at −120 dB right before it, 58.4–61 ≈ −100 dB; −15.4 LUFS integrated, true peak −1.4 dBFS.
## Claim + source
- "La ola más alta registrada: 524 m · bahía Lituya, Alaska, 1958." — NASA Earth Observatory (Lituya Bay, 9 July 1958 megatsunami: run-up of 1,720 ft / 524 m). Verified by the story step (supplied in the approved story).
- 700 m is the hypothetical of the piece; HUD distances/heights are illustrative.
