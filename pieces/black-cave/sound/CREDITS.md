---
type: doc
status: active
tags: [black-cave, sound, credits, freesound, cc0, commons]
relatedTo: [pieces/black-cave/LOG.md, pieces/gashadokuro/sound/CREDITS.md]
---
# Sound credits — Black Cave

All recordings are CC0 (Freesound) or public domain (Wikimedia Commons). No attribution is required; they are listed for traceability. Each was picked with earshot (rank → find → realness):
- z: how strongly the file matches its description among the candidates;
- p_real: the probability that it is a real recording.

## Freesound (CC0 1.0)

| role | file (Freesound id_name) | z | p_real |
|---|---|---|---|
| water drops dripping in a cave | [162116_Water_Dripping_Large_Echo_.mp3](https://freesound.org/s/162116/) | 5.15 | 0.827 |
| hollow cave room tone | [164785_INT_Cave_Room_tone_wav.mp3](https://freesound.org/s/164785/) | 3.87 | 0.629 |
| crickets at night | [383479_Crickets_very_distant_barks_summer_night.mp3](https://freesound.org/s/383479/) | 4.95 | 0.877 |
| night wind in dry bushes | [135779_wind_phonelines_wav.mp3](https://freesound.org/s/135779/) | 2.6 | 0.804 |
| hot metal ticking as it cools | [350846_toaster_on_fridge_wav.mp3](https://freesound.org/s/350846/) | 4.17 | 0.974 |
| slow footsteps on gravel | [614053_footsteps_land_aif.mp3](https://freesound.org/s/614053/) | 5.18 | 0.945 |
| jacket fabric rustling | [486399_Fabric_Plastic_Jacket_Rustling.mp3](https://freesound.org/s/486399/) | 4.86 | 0.9 |
| a body dragging over rock | [758582_Rubble_Trouble_3.mp3](https://freesound.org/s/758582/) | 3.88 | 0.917 |
| small stones trickling down | [521955_Stone_Crumble.mp3](https://freesound.org/s/521955/) | 3.49 | 0.941 |
| fingernails tapping on a hard surface | [235497_glass_jar_tap_fingernail_wav.mp3](https://freesound.org/s/235497/) | 2.0 | 0.965 |
| a flashlight switch clicking | [410359_Torch_Click_1.mp3](https://freesound.org/s/410359/) | 3.16 | 0.98 |
| an electrical buzz flickering | [786515_ELECBuzz_An_Incandescent_lamp_The_Last_s.mp3](https://freesound.org/s/786515/) | 3.56 | 0.829 |
| a creepy whisper | [680839_Ghosthunt_ogg.mp3](https://freesound.org/s/680839/) | 5.18 | 0.911 |
| heavy scared breathing | [554307_Scared_Male_Heavy_Breathing.mp3](https://freesound.org/s/554307/) | 7.06 | 0.984 |
| a wet slimy squelch | [433827_Slime_7_wav.mp3](https://freesound.org/s/433827/) | 5.84 | 0.927 |
| teeth grinding | [219140_ratbrux_wav.mp3](https://freesound.org/s/219140/) | 2.28 | 0.96 |
| a generator running | [512697_Factory_machine_004_wav.mp3](https://freesound.org/s/512697/) | 1.78 | 0.927 |
| a shovel digging into gravel | [558413_Digging_with_shovel_m4a.mp3](https://freesound.org/s/558413/) | 5.74 | 0.99 |
| walkie talkie radio chatter | [819689_Weather_Radio_NOAA_August_15_2025.mp3](https://freesound.org/s/819689/) | 6.01 | 0.974 |
| a breathy bamboo flute note | [157759_Shakuhachi_with_Echo.mp3](https://freesound.org/s/157759/) | 6.04 | 0.914 |
| a large temple bell struck once | [257721_TempleOahu_WAV_.mp3](https://freesound.org/s/257721/) | 3.96 | 0.915 |
| a deep cinematic impact boom | [150550_Percussive_Sounddesign_2_B2_.mp3](https://freesound.org/s/150550/) | 3.83 | 0.71 |
| a dry crack of bone | [554597_snow_ice_crackle_gore_break_bone.mp3](https://freesound.org/s/554597/) | 4.48 | 0.994 |
| a huge creature's slow deep breath | [169318_Radiator_Beast.mp3](https://freesound.org/s/169318/) | 4.33 | 0.495 |

## Wikimedia Commons (public domain)
- Howling_wind.ogg: the night wind bed, outside (from pieces/gashadokuro/sound/rec).

## Code layer (sound/mix.py)
- Drones and the card bell and boom.
- The hit's sub drop and dissonant cluster.
- The bulb buzz, gated by the headlamp's own `broken()` level.
- Filament ticks on every flicker step.
- The badge chime and the cut whooshes.

## Re-download
The recordings are gitignored. Re-download them with `sound/fs.py` using the ids above. The key is read with `zsh -ic`.
