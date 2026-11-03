---
ontology: true
type: credits
domain: odyssey-p6-sound
summary: Licences and attribution for the music (Kevin MacLeod "Temple of the Manes", CC BY 4.0) and the CC0 Freesound recordings in audio/sfx_pro.wav of Odyssey part 6 (Ithaca, Penelope's Bed, the end).
tags: [odyssey, credits, sound, freesound, cc0]
relatedTo: [odyssey-p5, odyssey-p4, odyssey-p3, odyssey-p2, odyssey-p1, odyssey-cyclops]
status: active
---

# Odyssey part 6: music and SFX credits

## Music: audio/track_greek.wav

- **"Temple of the Manes"** by **Kevin MacLeod** (incompetech.com). Source copy: `../odyssey-cyclops/audio/music/Temple of the Manes - Kevin MacLeod.mp3`. Built with `audio/tools/musicbuild.py --dur 309.206` (beat-matched loop 128.38 s -> 9.54 s, loudnorm -14 LUFS, 5 s fade out at the very end, under the 15 s AMPHORUS end card).
- Licence: **Creative Commons Attribution 4.0** (http://creativecommons.org/licenses/by/4.0/). The credit must appear in the YouTube description:

  > Temple of the Manes by Kevin MacLeod (incompetech.com)
  > Licensed under Creative Commons: By Attribution 4.0 License
  > http://creativecommons.org/licenses/by/4.0/

## SFX: audio/sfx_pro.wav (all Freesound, Creative Commons 0, no attribution required; listed for the record)

Built by `audio/tools/sfxmix.py` from `audio/tools/cues.json` (written by `cues.py`, picks in `pick.json`, candidates screened with earshot in `screen.json`, used windows checked in `verify.json`; two weak matches replaced: the dog whimper and one bow creak); premixed into `audio/track_mix_greek.wav` by `audio/tools/premix.py -1.9 9.4` (music -1.9 dB, SFX +9.4 dB), so the voice sits as far over music + SFX in speech as in part 5 (`audio/tools/ratio.py` -2.3 dB pre-export, both parts; `stemratio.py` on the export stems). Nothing is code-synthesized. Libraries reused from the cyclops test and parts 1-5, plus part 6's own (`audio/sfxlib`).

| category | sound | user | id | licence |
|---|---|---|---|---|
| arrow_hit | [Arrow_Hit_1](https://freesound.org/people/Mythmazter/sounds/708223/) | Mythmazter | 708223 | CC0 1.0 |
| arrow_hit2 | [ARROW_WOOD_IMPACT_SINGLE_ARCHERY_01.wav](https://freesound.org/people/JoeDinesSound/sounds/534956/) | JoeDinesSound | 534956 | CC0 1.0 |
| axe_chop | [TreeChop3.wav](https://freesound.org/people/super8ude/sounds/442534/) | super8ude | 442534 | CC0 1.0 |
| battle | [S11-14 Group of men yelling with sword fight clicking.wav](https://freesound.org/people/craigsmith/sounds/675091/) | craigsmith | 675091 | CC0 1.0 |
| birds | [Field atmosphere in Gizeux, Loire Valley, French countryside](https://freesound.org/people/nomadas/sounds/731819/) | nomadas | 731819 | CC0 1.0 |
| bite_chew | [Apple Bite](https://freesound.org/people/AntumDeluge/sounds/584290/) | AntumDeluge | 584290 | CC0 1.0 |
| body_fall | [goblin-fall.mp3](https://freesound.org/people/Kneeling/sounds/502553/) | Kneeling | 502553 | CC0 1.0 |
| body_fall | [Fall Impacts](https://freesound.org/people/SeanPorio/sounds/519262/) | SeanPorio | 519262 | CC0 1.0 |
| body_fall | [Bodyfall](https://freesound.org/people/magnuswaker/sounds/614064/) | magnuswaker | 614064 | CC0 1.0 |
| bow_creak | [Stretch - Medium](https://freesound.org/people/NearTheAtmoshphere/sounds/676987/) | NearTheAtmoshphere | 676987 | CC0 1.0 |
| bow_creak | [Stretch - Short](https://freesound.org/people/NearTheAtmoshphere/sounds/676988/) | NearTheAtmoshphere | 676988 | CC0 1.0 |
| bow_twang | [ARROW_SHOOT_SINGLE_03.wav](https://freesound.org/people/JoeDinesSound/sounds/534940/) | JoeDinesSound | 534940 | CC0 1.0 |
| bow_twang | [SHOOTING_ARROW_SINGLE_ARCHERY_FOLEY_02.wav](https://freesound.org/people/JoeDinesSound/sounds/534951/) | JoeDinesSound | 534951 | CC0 1.0 |
| bow_twang | [SHOOTING_ARROW_SINGLE_ARCHERY_FOLEY_01.wav](https://freesound.org/people/JoeDinesSound/sounds/534955/) | JoeDinesSound | 534955 | CC0 1.0 |
| calm_shore | [sea_waves_soft_shenzhen_2020-05-30_iXY.wav](https://freesound.org/people/Archos/sounds/521602/) | Archos | 521602 | CC0 1.0 |
| chime | [Wind_Chimes_Jul_07_2012-001.wav](https://freesound.org/people/Mark_Ward/sounds/169281/) | Mark_Ward | 169281 | CC0 1.0 |
| chime | [Harp Wild Run Down 3.wav](https://freesound.org/people/luckylittleraven/sounds/415446/) | luckylittleraven | 415446 | CC0 1.0 |
| chime | [Wind_Chime](https://freesound.org/people/Cigaro30/sounds/644684/) | Cigaro30 | 644684 | CC0 1.0 |
| cloth | [Jacket/Cloth Rustle 3](https://freesound.org/people/brandondelehoy/sounds/494789/) | brandondelehoy | 494789 | CC0 1.0 |
| cloth | [Gritty woosh](https://freesound.org/people/Sadiquecat/sounds/737238/) | Sadiquecat | 737238 | CC0 1.0 |
| cloth_rip | [Cloth Tearing and Ripping - Flannel, Cotton, Scraps - Close Mic - Short & Fast](https://freesound.org/people/ChristopherJngs/sounds/719004/) | ChristopherJngs | 719004 | CC0 1.0 |
| crickets | [Cicada Insects 8_26_13 8_06 PM.wav](https://freesound.org/people/harryScary/sounds/268962/) | harryScary | 268962 | CC0 1.0 |
| crowd_murmur | [Indoor adult murmur, medium group.wav](https://freesound.org/people/SpliceSound/sounds/260122/) | SpliceSound | 260122 | CC0 1.0 |
| crowd_murmur | [S11-23 Group of men murmur in indoor space; dice & chips.wav](https://freesound.org/people/craigsmith/sounds/675071/) | craigsmith | 675071 | CC0 1.0 |
| cup | [ceramicCups2.wav](https://freesound.org/people/kikuchiyo/sounds/214186/) | kikuchiyo | 214186 | CC0 1.0 |
| cutlery | [Wine Glass clank 2](https://freesound.org/people/wasserbjorn/sounds/761136/) | wasserbjorn | 761136 | CC0 1.0 |
| dog_whimper | [dog whining.wav](https://freesound.org/people/5ro4/sounds/701268/) | 5ro4 | 701268 | CC0 1.0 |
| dog_whine | [stray dog.wav](https://freesound.org/people/rsn267/sounds/276085/) | rsn267 | 276085 | CC0 1.0 |
| dog_whine | [Shih Tzu whining & shrieking](https://freesound.org/people/randbsoundbites/sounds/798651/) | randbsoundbites | 798651 | CC0 1.0 |
| door_slam | [Doorslam.wav](https://freesound.org/people/CastIronCarousel/sounds/216872/) | CastIronCarousel | 216872 | CC0 1.0 |
| door_slam | [Heavy_wooden_door_close_mansion.wav](https://freesound.org/people/elliott.klein/sounds/367221/) | elliott.klein | 367221 | CC0 1.0 |
| fire_crackle | [campfire.wav](https://freesound.org/people/aerror/sounds/350757/) | aerror | 350757 | CC0 1.0 |
| fire_ignite | [Sliding Trailer Woosh](https://freesound.org/people/qubodup/sounds/171255/) | qubodup | 171255 | CC0 1.0 |
| fire_ignite | [Bonfire Being Lit](https://freesound.org/people/samararaine/sounds/186374/) | samararaine | 186374 | CC0 1.0 |
| flies | [Flies swarm](https://freesound.org/people/csaszi/sounds/528060/) | csaszi | 528060 | CC0 1.0 |
| ghost_wind | [Dark Wind.wav](https://freesound.org/people/tec_studio/sounds/440962/) | tec_studio | 440962 | CC0 1.0 |
| ghost_wind | [S21-14 Spooky eerie ghost wind; synthesized tape feedback; magic.wav](https://freesound.org/people/craigsmith/sounds/675368/) | craigsmith | 675368 | CC0 1.0 |
| jaw_snap | [Beast 9](https://freesound.org/people/NearTheAtmoshphere/sounds/676482/) | NearTheAtmoshphere | 676482 | CC0 1.0 |
| jeer | [AF Crowd Boo Hiss Nat end .wav](https://freesound.org/people/mglennsound/sounds/678539/) | mglennsound | 678539 | CC0 1.0 |
| knife | [Sword - Unsheathe](https://freesound.org/people/Vrymaa/sounds/770035/) | Vrymaa | 770035 | CC0 1.0 |
| leaves | [RustlingLeaves02.wav](https://freesound.org/people/Shain_T/sounds/352963/) | Shain_T | 352963 | CC0 1.0 |
| loom | [navette de métier à tisser.wav](https://freesound.org/people/Na%C3%AFma/sounds/510266/) | Naïma | 510266 | CC0 1.0 |
| lyre | [Lyre.flac](https://freesound.org/people/Hedmarking/sounds/191883/) | Hedmarking | 191883 | CC0 1.0 |
| men_laugh | [R15-84-Intimate Group Laughing.wav](https://freesound.org/people/craigsmith/sounds/480768/) | craigsmith | 480768 | CC0 1.0 |
| men_laugh | [R15-82-Men Laughing Heartily.wav](https://freesound.org/people/craigsmith/sounds/480806/) | craigsmith | 480806 | CC0 1.0 |
| men_laugh | [Man laughing various](https://freesound.org/people/SPAudiobooks/sounds/859265/) | SPAudiobooks | 859265 | CC0 1.0 |
| men_panic | [R15-49-Man Hyperventilating and Screaming.wav](https://freesound.org/people/craigsmith/sounds/481741/) | craigsmith | 481741 | CC0 1.0 |
| men_shout | [R15-73-Small Group of Men Shouting.wav](https://freesound.org/people/craigsmith/sounds/480805/) | craigsmith | 480805 | CC0 1.0 |
| men_steps | [Foley - Footsteps - Rainboots on rocks](https://freesound.org/people/RavenWolfProds/sounds/503671/) | RavenWolfProds | 503671 | CC0 1.0 |
| metal_ting | [metal tube 8.ogg](https://freesound.org/people/adharca/sounds/278169/) | adharca | 278169 | CC0 1.0 |
| metal_ting | [metal tube 4.ogg](https://freesound.org/people/adharca/sounds/278173/) | adharca | 278173 | CC0 1.0 |
| moan | [Two people orgasming](https://freesound.org/people/safadancer/sounds/182018/) | safadancer | 182018 | CC0 1.0 |
| roar | [Scary Monster Roar #2](https://freesound.org/people/NicknameLarry/sounds/489901/) | NicknameLarry | 489901 | CC0 1.0 |
| rumble | [Cracking Earthquake (cracking soil, cracking stone)](https://freesound.org/people/uagadugu/sounds/222521/) | uagadugu | 222521 | CC0 1.0 |
| sail_flap | [RAH_Flapping_Fabric_1.flac](https://freesound.org/people/_earthbound_/sounds/57278/) | _earthbound_ | 57278 | CC0 1.0 |
| scream_crowd | [Crowd Screaming](https://freesound.org/people/DigestContent/sounds/459101/) | DigestContent | 459101 | CC0 1.0 |
| sea | [BGSaSc Water Beach Ocean Waves Constant Splashing Rocks Many Small Waves Greece 16](https://freesound.org/people/Profispiesser/sounds/550915/) | Profispiesser | 550915 | CC0 1.0 |
| sea | [Mediterranean Summer Sea Waves Against a Cliff](https://freesound.org/people/emainta/sounds/648859/) | emainta | 648859 | CC0 1.0 |
| seagulls | [seagulls lake wind](https://freesound.org/people/jyka1rock/sounds/512099/) | jyka1rock | 512099 | CC0 1.0 |
| shout | [Large crowd outdoor screaming and yelling during a meeting in the street of Mexico City](https://freesound.org/people/felix.blume/sounds/214147/) | felix.blume | 214147 | CC0 1.0 |
| sizzle | [Pressure Hiss](https://freesound.org/people/unfa/sounds/211096/) | unfa | 211096 | CC0 1.0 |
| sizzle | [Sizzle.wav](https://freesound.org/people/CHEATSman115/sounds/234124/) | CHEATSman115 | 234124 | CC0 1.0 |
| slide_whoosh | [StuffedCreatureFur5](https://freesound.org/people/Huglex/sounds/843664/) | Huglex | 843664 | CC0 1.0 |
| slide_whoosh | [StuffedCreatureFur6](https://freesound.org/people/Huglex/sounds/843665/) | Huglex | 843665 | CC0 1.0 |
| spears | [dropping wooden stick.wav](https://freesound.org/people/Stefan21100190/sounds/593178/) | Stefan21100190 | 593178 | CC0 1.0 |
| spears | [Small Sticks Drop](https://freesound.org/people/IENBA/sounds/773759/) | IENBA | 773759 | CC0 1.0 |
| squelch | [Slime 14.wav](https://freesound.org/people/Archos/sounds/433819/) | Archos | 433819 | CC0 1.0 |
| stairs | [Running Down Stairs](https://freesound.org/people/LaylaO24/sounds/792773/) | LaylaO24 | 792773 | CC0 1.0 |
| stool_hit | [G26-05-Wooden Chair Break.wav](https://freesound.org/people/craigsmith/sounds/438322/) | craigsmith | 438322 | CC0 1.0 |
| swallow | [R30-36-Group of Cliff Swallows Sing.wav](https://freesound.org/people/craigsmith/sounds/479612/) | craigsmith | 479612 | CC0 1.0 |
| sword | [Sword slide.wav](https://freesound.org/people/AuDRoger/sounds/471147/) | AuDRoger | 471147 | CC0 1.0 |
| sword_clash | [Sword_Clash (15).wav](https://freesound.org/people/JohnBuhr/sounds/326787/) | JohnBuhr | 326787 | CC0 1.0 |
| sword_clash | [Sword_Clash (46).wav](https://freesound.org/people/JohnBuhr/sounds/326795/) | JohnBuhr | 326795 | CC0 1.0 |
| sword_clash | [Sword_Clash (57).wav](https://freesound.org/people/JohnBuhr/sounds/326862/) | JohnBuhr | 326862 | CC0 1.0 |
| throw_whoosh | [FX - Swoosh - Super Slow](https://freesound.org/people/bolkmar/sounds/475134/) | bolkmar | 475134 | CC0 1.0 |
| thud | [BODY FALL - V HVY - DIRT](https://freesound.org/people/leonelmail/sounds/504626/) | leonelmail | 504626 | CC0 1.0 |
| thunder | [Thunderclap](https://freesound.org/people/Fission9/sounds/534023/) | Fission9 | 534023 | CC0 1.0 |
| thunder | [Thunder Clap And Rumble #5](https://freesound.org/people/Kinoton/sounds/760212/) | Kinoton | 760212 | CC0 1.0 |
| tree_creak | [tree_creak_4](https://freesound.org/people/Comradar/sounds/797994/) | Comradar | 797994 | CC0 1.0 |
| village | [Street Village Ambience on a Summer Windy Day](https://freesound.org/people/sounds_from_palestine/sounds/818390/) | sounds_from_palestine | 818390 | CC0 1.0 |
| whisper | [54-murmullos.wav](https://freesound.org/people/Tomycatts/sounds/429331/) | Tomycatts | 429331 | CC0 1.0 |
| woman_cry | [Woman Crying.wav](https://freesound.org/people/purplereptar/sounds/449439/) | purplereptar | 449439 | CC0 1.0 |
| wood | [Small_wooden_piece_chop-003.wav](https://freesound.org/people/Matislav/sounds/521399/) | Matislav | 521399 | CC0 1.0 |
| wood_bar | [post_in_the_ground.flac](https://freesound.org/people/wjoojoo/sounds/179728/) | wjoojoo | 179728 | CC0 1.0 |
| wood_creak | [Wood Creak Single V9](https://freesound.org/people/Rudmer_Rotteveel/sounds/506664/) | Rudmer_Rotteveel | 506664 | CC0 1.0 |
