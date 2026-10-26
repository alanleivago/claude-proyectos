# SOUND BRIEF: "¿Qué pasaría si la Tierra girara cada vez más rápido?" (faster)

The picture is final. Its frames are in `F:/Claude Proyectos/pieces/faster/frames/` (the final video will be `renders/final.mp4`): 80 s at 24 fps, one beat = 0.5 s at 120 BPM. The cue events are in `out/cues.json`; they are computed from the picture code, so never re-time them by hand.

The soundtrack uses ONLY real, professionally recorded audio: field-recorded ambiences and real foley/SFX recordings. **There is NO MUSIC in this film** (the user's standing choice). Code may only select, trim, place, level, pan, EQ, crossfade, pitch by resampling and master. It never generates a sound. The bar is a premium realistic POV short: every sound is caused by something on screen, and the world sounds real and physical, not like a game jam.

## Sound concept
- **One real place first.** For 0–17 s we are on the Brighton pier at midday, first person. You hear:
  - waves washing on a pebble beach (the hiss and rattle of pebbles dragged back);
  - seagulls and a distant beach crowd;
  - a light sea breeze;
  - footsteps on wooden boards while walking (0–10 s);
  - a small propeller plane towing a banner flying past (5–12 s).
- **The world is pulled away, one layer at a time.**
  - At 12 s a low deep rumble starts: the spin speeds up.
  - From 17 to 34 s the sea drains away south. You hear a long rushing, draining water, surf dying away, the crowd murmuring and exclaiming, and water dripping and trickling off the bare seabed and the pier's iron columns.
  - From 34 to 40 s days and nights flash past: the wind rises, a helicopter is overhead and a thunder crack falls at 37.9 s.
  - From 39.5 to 43.5 s a gale blows south: the air follows the water and debris flaps by.
  - From 43 to 52 s the air is gone: the wind fades out, everything becomes muffled and thin, and at noon (46–52 s) it is almost silent, with only a low pressure rumble and your own heartbeat or breathing (real recordings).
- **The tilt (52–74 s): the felt "down" turns south.**
  - The heavy structure groans: deep metal and wood creaks and stress groans from the pier and the ground.
  - From 55.5 s things slide: gravel, sand and objects scraping, deckchairs and parasols tumbling, distant muffled screams (thin air, so quiet and filtered).
  - Cracks open in the ground and the planks.
  - Your hands grip the iron railing: a creak and a squeeze of skin on metal.
- **Silence:** 63.6–63.98 s is a black frame. Make it TRUE near-silence, with every bed ducked out.
- **The payoff, the loudest moment of the film (63.98–70 s):** the Ferris wheel's legs snap — four big metal snaps and wrenches at 64.05, 64.29, 64.54 and 64.83 s. The wheel slams onto the beach at 65.4 s, a huge metal impact with debris. Then it rolls away from 65.6 to 74 s: a heavy steel rolling rumble with metal creaks and gondolas clanging, moving away and getting smaller.
- **Goodbye (70–80 s):** the rumble recedes. The card (74–80 s) carries only a faint low wind tail into silence. The goodbye's median level must be at least 6 dB below the payoff's.
- **Restraint and realism:** no cartoon or game sounds, no musical stings, no synth risers.

## Picture map (film seconds; cue ids from `out/cues.json`)
| t (s) | on screen | cue (kind / id) | sound need |
|---|---|---|---|
| 0–9.6 | walking on the wooden pier deck | step / walk:step:n (every 0.52 s) | real footsteps on boardwalk wood (shoes), light, natural variation |
| 0–17 | pier, sea, beach crowd, gulls | ambience | waves on pebbles + gulls + far beach crowd + light wind (pier stereo field) |
| 3.5–10.5 | light plane with banner crossing the sky | flyby / sky:plane:flyby (apex 7 s) | real small propeller plane passing by, distant |
| 12–16 | the spin starts to speed up | swell / spin:spinup | deep low rumble rising (earthquake / distant thunder rumble, real) |
| 17–34 | the sea drains south, seabed bared, people walk out | rush / sea:recede | long water rush / draining surge receding; then trickles, drips, wet sand; crowd exclaiming |
| 34–40 | day/night flashes, helicopter, lightning | whoosh / sky:days:start, heli / sky:helicopter, thunder / sky:lightning (37.9) | wind rising; helicopter hovering (real); one real thunder crack + rumble |
| 39.5–43.5 | gale south, debris flying | gust / air:gale | real strong gale gusts, flapping cloth/umbrellas |
| 43–52 | the air thins, black sky at noon | swell / sky:noon | the wind fades to almost nothing; a muffled low rumble; a real heartbeat or slow breathing, very quiet |
| 52 | "down" is no longer straight down | groan / tilt:groan:0 | deep structural metal groan (real) |
| 55.5–63.6 | people and objects slide south | slide / tilt:slide; crack / tilt:crack:beach:0 (58.5); groan / tilt:groan:1 (60.5) | scraping, gravel/sand slides, things tumbling; a ground crack; muffled distant screams |
| 63.6–63.98 | BLACK FRAME | (silence) | true near-silence |
| 64.05–64.83 | the wheel's legs snap | snap / wheel:leg:0..3 | big real metal snaps/wrenches (steel beams breaking) |
| 65.4 | the wheel slams down | hit / wheel:land | the loudest moment: a huge metal crash/impact |
| 65.6–74 | the wheel rolls away south | roll / wheel:roll | heavy rolling metal rumble, creaks, gondolas clanging, receding |
| 66.2, 66.9, 67.6 | planks split in front of you | crack / tilt:plank:0..2 | real wood cracks/splinters, close |
| 68.6, 69.8 | your grip slips along the rail | grip / hands:slip:0..1 | hand squeak/scrape on painted metal rail, close |
| 74 | the end card fades in | whoosh / card:in | a soft air whoosh, quiet; then fade into silence |

**Ambience zones:**
- pier seaside: 0–17, fading out by 26;
- draining sea and wet seabed: 17–36;
- wind: rising 34–40, gale 39.5–43.5, gone by 46;
- thin air (nearly nothing): 46–52;
- tilt rumble/groans: 52–63.6;
- silence: 63.6–63.98;
- wheel: 64–74;
- low wind tail: 72–80.

## Licences: what is allowed
- **Allowed** (record each in the manifest, read on the item's own page): CC0 1.0 and public domain; CC BY 3.0 / 4.0 (credits go in CREDITS.md); the Mixkit free licence; the sound-layer library at `F:/Claude Proyectos/sound-layer` (read its LICENSE / catalog for each file's licence).
- **NOT allowed:** NC, ND, SA, Sampling+, custom or unclear licences, AI-generated or synthesized audio.
- **Freesound API key:** `~/.freesound.json` (`api_key`). Search with `filter=license:"Creative Commons 0"` (or Attribution), then download `previews.preview-hq-mp3` / the hq ogg.
- Details: `C:/Users/Alan Leiva/.claude/skills/real-sound/references/licences.md`.

## Quality bar
- Real recordings only, clean, no clipping. Use earshot `realness` and `match`/`rank` to choose. Ambiences ≥ 30 s usable, real stereo.
- Mix: −14 LUFS, true peak ≤ −1.5 dBTP.
- Story-arc rules, checked later by the review tool on the final mix:
  - the 63.98–70 s act is the loudest (p90 at least 1 dB above the 40–63.6 s act);
  - 63.6–63.98 s is near-silent;
  - the 70–80 s median is at least 6 dB below the 63.98–70 s median.

## Files and tools
- Root: `F:/Claude Proyectos/pieces/faster`. Python: `F:/earshot/.venv/Scripts/python.exe` (run skill scripts with `-I`). Skill: `C:/Users/Alan Leiva/.claude/skills/real-sound`.
- Downloads go in `audio/assets/<category>/` (`<source>-<id>_<slug>.<ext>`). Manifests: `audio/assets/manifests/<category>.json`. Design fragments: `audio/design/<category>.json`. Review: `out/audio-review/<category>/`.
