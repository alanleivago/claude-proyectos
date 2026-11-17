# upnext-01 · SCRIPT (remake of @jongmin.design Dd2YemoPJ9-)

- **Ref:** fuentes/jongmin-design/remake/Dd2YemoPJ9-.md (342K likes). Same shots, framing and pacing; paraphrased dialogue.
- **Cast:** Ashley (pieces/upnext-girl2, `girl2_curvy_tights.glb`) = the human. Pip (pieces/upnext-gnome, `gnome_anim.glb`, eyes A) = the gnome mentor, 0.7 m (girl 1.6 m).
- **Length:** 72.7 s, 23 shots (shot 10 has two stills, 10a/10b, so 24 stills). ~75 words. Timings are the ref's (cuts re-measured on 2 fps frames; the spec's estimated cuts were off from shot 12 on).
- **Subtitles:** white = Ashley, #F3DF6A = Pip. One card per phrase, typewriter, line 1 at y=1325.
- **Changes vs. the ref (so it isn't a carbon copy):** Moss → Pip. Red plaid duvet → green quilt. City outside the window → green garden. Sneakers → pink yoga mat at the bed (her boots are part of her mesh, so she can't put shoes on). Clock 10:58 → 10:47, 8:30 → 8:24. Pip stands beside the clock, not on it. The big floor plant and the desk plant keep the room green.

| # | time (s) | speaker | line (TTS text) | girl clip / face | Pip clip / face | framing |
|---|---|---|---|---|---|---|
| 01 | 0.0–3.5 | ASHLEY | From tomorrow on, I'm waking at four. | lie_phone (new clip) · half / talkSmall | – | night, high oblique from the bed side, phone glow on her face |
| 02 | 3.5–5.6 | PIP | Four. Now. | (off, lying) | talk · deadpan / talkA | night, Pip on the nightstand, clock 4:00 in front |
| 03 | 5.6–8.4 | ASHLEY / PIP | …Is this counting? / Nope. | lie_back · sulk / talkSmall | (off) | night, same setup as 01 |
| 04 | 8.4–12.9 | ASHLEY | …Tomorrow, then. | sit_up_bed (new clip, plays 8.4–10.2 s, end pose held) · sulk / talkSmall | idle · unimpressed | light fades up; mattress-height wide, quilt in the foreground, Pip left; clock 11:52 |
| 05 | 12.9–17.4 | ASHLEY | Some guy jogged six miles before dawn. | sit_slumped on the bed edge, phone in both hands · gazeDown / talkSmall | idle · deadpan (watching) | 3/4 low, Pip on the nightstand left |
| 06 | 17.4–22.6 | ASHLEY | I guess… / I'm just not hungry enough. | sad_slump (holds) · sad / sadPout | – | close, plain lilac background |
| 07 | 22.6–24.0 | PIP | Time to cheat. | – | talk · deadpan / talkE | Pip close and low, clock in the foreground |
| 08 | 24.0–25.0 | – | – | sit_slumped (legs at right) | walk · deadpan | floor level, Pip walks off the nightstand side |
| 09 | 25.0–29.5 | ASHLEY (off) / PIP | …Need help, Pip? / Nah. | (off) | sit (end) · sleepy (eyes shut) / frown | floor level, Pip sulking on the rug, desk + CRT behind |
| 10a | 29.5–36.0 | PIP | Tomorrow… / your feet land on this first. | sit_slumped · gazeDown | idle laid flat on the mat (rigid) + grey sigh puff · deadpan / talkA | low two-shot: her on the bed edge, Pip flat on the yoga mat at her boots |
| 10b | 36.0–43.9 | PIP / ASHLEY / PIP | And that bunks over there. / That's the trick? / Eh. / The proper term is nudge. | sit_slumped · glance | point (end) → talk · deadpan / talkM | same two-shot, Pip up and pointing at the desk |
| 11 | 43.9–46.0 | – | – | sit_reach_side (new clip): sets the phone on the nightstand · gazeR / neutral | idle (bottom left) | medium on her |
| 12 | 46.0–47.0 | – | – | lie_back, quilt to the chest · blink (asleep) | – | night, high angle (dissolve from 11) |
| 13 | 47.0–47.6 | – | – | – | – | night insert: clock 10:47 |
| 14 | 47.6–49.0 | – | – | – | idle on the desk · skeptical / smirk | night, Pip by the CRT, her phone charging in front of him (he moved it) |
| 15 | 49.0–50.0 | – | – | – | shrug (end, arms out) · happy / smile | day, same desk |
| 16 | 50.0–51.0 | – | – | lie_back asleep · blink | – | day, high angle on the bed, mat on the floor, clock 8:24 |
| 17 | 51.0–52.6 | – | – | sit_slumped, boots on the mat | – | high, tight on her boots landing on the mat |
| 18 | 52.6–53.6 | – | – | idle_sway (standing) | – | torso, head cut off |
| 19 | 53.6–60.4 | ASHLEY / PIP | …Is this counting? / Yep. That counts. | lean_reach (0.55 s, mid-lean so the face reads) · shy / talkSmall | nod · happy / smile | two-shot at the desk: Pip by the phone, her leaning in |
| 20 | 60.4–61.6 | – | – | walk · open / softSmile | idle | she walks past the desk toward the door |
| 21 | 61.6–63.6 | – | – | walk, from behind | – | open door, bright hallway light |
| 22 | 63.6–65.6 | PIP | Champions are awake by four. | – | talk · deadpan / talkA | the desk without her, Pip by the phone, chair + notes |
| 23 | 65.6–72.7 | PIP | Scratch that. / Just beating yesterday is plenty. | – | idle · skeptical / smirk → happy / smile | Pip close-up, slow push-in; music cut before the last line; ≤1.5 s tail |

**Post caption (draft):** "Better than yesterday counts. / What's your UpNext? / Inspired by: Thaler & Sunstein (2008), Nudge. / #selfimprovement #habits #mechayuki #shorts"

## New clips (storyboard v2)

Built with her own pipeline (anim2lib Clip2 + core solve + self-checks + bl_build2.py) by `tools/girl_clips.py`. They go only into `engine/models/upnext/girl_up01_tights.glb` (her 46 clips + 3 new = 49). Her `pieces/upnext-girl2` files are read, never written.
- `lie_phone`: on her back in bed, legs long, both hands hold the phone over her chest, head raised on the pillow, thumb scrolling (shots 01–02).
- `sit_up_bed`: lying → propped on her elbows → sitting up with her legs out under the quilt, tired slump (03→04).
- `sit_reach_side`: seated on the bed edge, she leans right and sets the phone on the nightstand, then sits back. The hands rest wider on her lap so her upper arms clear her chest; that fixes the arm-through-chest in shot 11.
- Self-checks: the overlaps it reports are the same thigh/forearm contact her approved clips show (2–4 cm).

## Actions with no clip (not faked with clipping)

- **Pip lying on his back** (10a): no clip. His `idle` pose is flopped flat as a rigid body (reads as a garden-gnome flop). A `lie_back` clip for Pip would allow the get-up the ref shows (~35.8 s).
- **Pip arms up / stretch** (15): no `cheer` clip. `shrug` (arms out) is used instead.
- **Opening the door** (21): no clip. The door is already open.
- **Moving the phone across the room** (between 11 and 14): off screen, as in the ref.

## Look (storyboard v2)

- **Characters are unlit** (MeshBasic + nearest, like her viewer). A per-shot tint stands in for the light (night blue, phone lilac). v1 used Lambert, and the face cells were re-cloned without the light mix and without the vertex snap. That made the shadow artifacts on her face.
- **Bloom** (engine post, `main_sb.js`): emissive-only, like the ref's HDR glow (LED clock ×2.4, phone, CRT, hallway light, window ×0.45). Two gaussians, sigma 1.5 + 4.5 low-res px (≈6 + 18 px at 1080), gains 0.25 + 0.6. Fitted to the ref halos:
  - LED glow at 8–20 px from the digit: ref 13/10/7 %, ours 11/8/6 %.
  - The door-light spread matches.
  - No wide haze in the ref.

## Lens, frame rate, swappable mentor (pre-render pass)

- **Lens:** the ref has a slight barrel distortion. 11 long straight edges near the frame sides (door jambs, window, wall corners) all fit k = 0.011–0.020, median **0.016** (r normalised by half the frame height). That's about a 7 px bow at the frame edge. The engine post now applies it to the scene and the bloom, but not to the captions (`LENS_K`, `?lens=`).
- **Frame rate:** the ref runs at a real 30 fps. Inside motion only 2.4 % of frames are held duplicates (12 fps would hold 60 %, 24 fps pulldown 20 %). Characters and camera move every frame; only the expression texture swaps step. `ANIM_FPS` (`?afps=`) is in the engine, set to 30.
- **Mentor:** set by `engine/mentor.json`: model path, height, head bone, face materials, face cell lists, and maps from the semantic clips/expressions the shots use (idle, talk, point, shrug, walk, nod, sit; deadpan, unimpressed, skeptical, sleepy, happy…) to the model's names. A different mentor = a new json (`sb.html?mentor=<file>`); the shot code doesn't change.

## Voices (real)

- **Who:** the user's VoiceStudio voices, "Ashley" `de01f9d9` and "Gnomo personaje apoyo" `67ba355b`. Settings: steps=32, wav, raw, no "!". Made by `tools/voice_final.py`. Kept takes: `voz/raw/`. Final: `voz/<take>.wav` (24-bit 48 kHz). Report: `voz/takes.json`. The first test takes are in `voz/test_v1/`.
- **Checks:** every line matches Whisper. 10d is heard as "Ah"/"Eh" on some passes. The four questions rise +4.7 to +6.9 semitones on the last word.
- **Noise:** before and after the speech, both voices are clean (~−65 dBFS). Between words the mentor's clone carries noise (−39 dBFS, earshot); Ashley's is −63. Only the mentor gets a gentle spectral gate (noisereduce, 85 %): −39 → −55 dBFS between words, and voice harmonicity goes up (HNR 3.1 → 4.8 dB). No artefacts heard by earshot.
- **Chain:** HPF 150 Hz for her / 90 Hz for him, compressor 2.5:1, then −14 LUFS (all within ±0.4 except 19b at −15.2), limiter at −1.5 dBFS.

## First test voice takes (superseded, voz/test_v1/)

- **Ashley:** "Zombie heroine B (medium)" `ef006e80`, an original voice design (female, young adult). **Pip:** "Dutch" `644338f4`, an original voice design (male, middle-aged, very low pitch). Neither is a clone of a reference account. ESTILO.md suggests megagirl for her; these are only test takes.
- One wav per line (19 takes), all Whisper-checked against the text (`voz/takes.json`). 02 is heard as the homophone "for now". 03b "Nope." needed seed 5.
- Not done yet: question pitch rise, timing to the shots, the clean chain (HPF + comp + LUFS), and speaker_sim between the two voices.
