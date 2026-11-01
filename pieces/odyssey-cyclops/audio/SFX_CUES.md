---
ontology: true
type: cue-sheet
domain: odyssey-cyclops-sound
summary: The Cyclops "sonido pro" cue list. Times resolved from src/score.js against voice.json and head.html, real CC0 recordings mixed into audio/sfx_pro.wav, with the earshot test-mix results.
---

# The Cyclops: SFX cue list (sonido pro)

How it is built:
- `audio/tools/cues.py` holds the cue list and writes `cues.json`.
- `audio/tools/sfxmix.py cues.json ../sfx_pro.wav` renders the WAV: 48 kHz, 24-bit stereo, exactly 278.307 s, starting at t=0.
- `audio/tools/stems.py T...` prints the SFX, voice and music loudness at chosen times.
- Run all three with `/Users/alanleiva/tools/earshot/.venv/bin/python` (it has soundfile and pyloudnorm).

How the times were found: `src/head.html` and `src/score.js` were run in node against `voice.json`, which gives the panel starts TB (SUB/SUBEND), the VW word times and the LT/LE line times. The strike HIT is at 165.36 s.

How the levels work: each clip is normalised to the voice minus 5 dB, using its loudest 400 ms momentary loudness (beds use integrated loudness). Then two offsets apply: a global +5 dB for events and +4 dB for beds, and the per-cue gain shown below. Per-clip ceilings are 0.9 for events and 0.3 to 0.4 for beds, and the master is limited to 0.8.

Panel starts (s): p02 16.16 · p03 26.97 · p04 32.56 · p05 41.00 · p06 48.16 · p07 55.04 · p08 62.84 · p09 65.71 · p10 76.58 · p11 82.85 · p12 89.84 · p13 94.66 · p14 107.01 · p15 114.65 · p16 125.78 · p17 141.72 · p18 155.68 · p19 159.58 · p20 175.10 · p21 194.55 · p21b 202.77 · p22 216.86 · p23 219.95 · p23b 227.90 · p24 239.10 · p24b 247.35 · p24c 260.26

## Cues

| time (s) | what | sound (Freesound id) | gain dB |
|---|---|---|---|
| 0–34 | sea swell bed (p01–p03) | Mediterranean waves on a cliff (648859) | bed −10 |
| 0.3–27.3 | oars | rowing boat from inside (588307) | bed −17 |
| 2.8, 6.3, 10.1, 13.9 | goats far off on the island | sheep bleats (362283, 692898), low-passed at 2.5 kHz | −20 |
| every TB + 0.1 (27 boundaries) | soft whoosh for each frieze slide | fur swish (843664 / 843665), peak on the boundary | −15 |
| 27.3–32.5 | men climbing on rock, 2.8 steps/s | footsteps on rocks (503671) | −17 |
| 33.3–39.6 ×5 | lambs in the pens | bleats | −12 |
| 41.45 | the men whispering | shocked whispering crowd (763864) | −7 |
| 48.4–52.8 | the flock comes in (light steps and bleats) | 503671 pitched +5, bleats | −21 / −10 |
| 48.9–52.5 | the giant's footsteps, 1.4/s | heavy body-fall on dirt (504626) −4 st + heavy landing (349081) −7 st | −1 |
| 56.92 | grunt as he lifts the stone | monster short roar (132874) −5 st | −7 |
| 60.3 → 61.9 | stone grinds into the doorway, then booms | sarcophagus stone slide (457529) −3 st; boom = footfall + earthquake rumble (222521) | −3 / +1 |
| 63.3 | fire lit (ignite) | lighting a fire (534702) | −5 |
| 63.4–175.6 | fire crackle bed (p08–p19) | campfire (350757) | bed −6 |
| 64.6 | he sees them (growl) | monster roar (489901) −6 st | −5 |
| 66.2–68.0 | Odysseus steps forward | rock steps | −14 |
| 77.3 / 81.7 | the giant's laugh, pitched down | evil man laughing (134720) / male laughter (119459), −5 st | −2 / −8 |
| 83.36 | the grab (whoosh) | super heavy swoosh (475131) | −7 |
| 84.85 / 87.42 | bone crunch (subtle, no gore) | bone crunch fast (192146) | +2 / −5 |
| 85.82 | against the floor | body fall (346692) | −5 |
| 91.1 ×3 | milk gulped | drinking (445970) −5 st | −11 |
| 91.96 | he lies down | 504626 −3 st | −6 |
| 93.9–107.2 | giant snoring (p12–p13) | male snore (432996) | bed −12 |
| 95.47 | sword drawn | unsheath sword (107589) | −6 |
| 109.54 | breakfast crunch | hard candy / bone crunch (392883) | −13 |
| 109.9–115.7 | the flock out, the giant's steps | bleats, steps | −11 / −2 |
| 111.6 → 113.2 | stone rolled back, boom | 457529, boom | −4 / −1 |
| 119.82 | wood cut | axe chop into wood (452554) | −8 |
| 121.0–122.6 ×6 | point scraped | small wooden piece chop (521399) +3 st | −10 / −12 |
| 122.1 / 122.2 | hardened in the fire: flare and hiss | bonfire being lit (186374), steam (365071) | −13 / −9 |
| 123.86 | the stake hidden | body fall (346695) | −13 |
| 126.1–129.2 | he comes home (steps), eats | steps, 392883 | −2 / −13 |
| 137.6 ×4 | he drinks the wine | 445970 −5 st | −8…−11 |
| 154.32 | the giant's grin (low chuckle) | 119459 −6 st | −11 |
| 156.49 | he falls drunk | 504626 −5 st + boom | +1 / −2 |
| 158.4–164.2 | snoring | 432996 | bed −11 |
| 160.0 / 160.1 / 161.66 | coals flare, the tip glows and sizzles | fire (181563), 534702, 365071 | bed −14 / −8 / −13 |
| 164.9–165.3 ×4 | four men rush in | rock steps | −12 |
| **165.36 (HIT)** | the drive (whoosh), the stab, the boom, the sizzle | low swoosh (475135); sword stab (395373) + stab with whoosh (385966); boom; steam (365071) 2.6 s | −4 / +3 / 0 / 0 / −1 |
| 165.44 / 165.66 | the scream of pain | defeated ogre (607201) −4 st + monster roar (489901) −6 st | +4 / +1 |
| 167.84 | the twist (hiss) | steam (365071) | −7 |
| 172.08 / 172.28 / 172.38 | he screams; the mountain rings | big roar (429083) −4 st, 607201 −6 st, earthquake rumble | +4 / +1 / −4 |
| 175.4–179.0 | the neighbours come running (both sides, muffled) | footfalls, low-passed at 900 Hz | −10 |
| 178.53, 179.79, 180.95 | shouting through the stone | small group of men shouting (480805), angry mob (316640), low-passed at 1.4 kHz | −8 |
| 184.44 | he roars back | 489901 −4 st | +1 |
| 186.1–187.6 | the neighbours murmur and leave | shouts low-passed at 1 kHz | −16 |
| 193.3–197.1 | they go home | footfalls, low-passed | −13 |
| 194.55–216.9 | fire bed (p21) | 350757 | bed −8 |
| 196.06 | stone rolled aside | 457529 | −5 |
| 195.6–214.5 ×10 | the flock goes out one by one | bleats | −13 |
| 199.9 ×4, 214.52 | hands feeling the wool | fur swish (843664/5) | −16 / −13 |
| 216.6–278.3 | sea bed (p22–p24c) | 648859 | bed −10 |
| 217.0–218.4 | the run to the ship | rock steps, 6/s | −13 |
| 218.06 / 219.95–260.3 | oars pulling hard / oars | oars rowing (438846) / 588307 | bed −11 / −17 |
| 239.74 | the hill torn off | rock falls with cracking (157804) −3 st + rumble | −1 / −5 |
| 240.04 / 241.38 | effort roar / throw roar | 132874 −6 st / 607201 −6 st | −6 / −3 |
| 241.6 → 242.63 | the boulder whoosh | super slow swoosh (475134) −4 st | −2 |
| **242.63** | the big splash | big water splash (442773) + rock splash (583348) −3 st + boom | +4 / 0 / −1 |
| 243.4 | the wave rocks the ship | waves on rocks (550915) | bed −8 |
| 264.4–277 | Poseidon's rumble | earthquake (222521), low-passed at 260 Hz | bed −10 |
| **273.26** | boom on "heard" | boom + body fall (346692) −4 st + 385966 −5 st + rumble | +5 / +8 / +3 / −2 |

## Cues left out or covered another way

- **Hooves (flock trot):** no clean CC0 sheep-hoof recording turned up (the best "hooves" hit was a mouth pop). The trot is light rock steps pitched up, under the bleats.
- **Pre-fire crackle in p04–p07:** score.js puts a crackle there, but the fire is only lit at 63.4 s ("Then he lit a fire"), so the fire bed starts at the light-up.
- **Musical cues in score.js:** the "here" chime (132.92), the plucked "NOBODY" chord (149.92), the low bell and pluck at c44 (220.3) and the drone under the curse. These are notes, not sound effects. They are left to the music and not replaced by recordings.
- **The bowl clang on "drunk" (157.26)** has no sound of its own; the fall covers it.

## earshot on audio/test_mix.wav

The test mix is voice + music at −2 dB + sfx_pro, limited at 0.76.

- **critique:** launch-grade, 21 of 22 metrics in range. Integrated −13.6 LUFS, true peak −1.4 dBTP after the final ceiling, LRA 5.2 LU, loudest 3 s 3.6 LU over the body. Realness p_real 0.92, with 0 of 70 windows leaning synthesized.
- **timeline sync**, 23 key cues (whole film): 83 % have an onset within 100 ms, median offset 24 ms.
- **Stems at the climaxes:**

  | moment | SFX | voice | music |
  |---|---|---|---|
  | strike (165.36) | −11.6 LUFS | −16.3 | −29 (dipped) |
  | scream (172.1) | −12.5 | −13.1 | −14.2 |
  | splash (242.6) | −12.1 | −16.4 | −21.8 |
  | "heard" boom (273.3) | −11.0 | −15.8 | −14.0 |

- **Fixes made after listening:**
  - Events were 5 dB too low and the fire bed was masked: raised them, and put fast-release ceilings on the peaky crackle.
  - The second scream made the loudest 3 s 4.8 LU over the body: lowered it 3 dB.
  - The "heard" boom was masked by the music's climax (no onset found): added a punch layer. It is now found at +61 ms, +7 dB.
  - Swapped out four trims that realness rated "uncertain": DinoSteps (p_real 0.35), a gulp (0.57), two shout trims (0.53 / 0.67) and a sizzle (0.75).
- **Still to check by ear:**
  - Whether the fire bed (about −30 LUFS under music at about −14) is audible enough.
  - Whether the pitched-down laughs read as a giant.
  - Whether the floor thud at 85.82 s cuts through under the voice (timeline found only a level peak there).
