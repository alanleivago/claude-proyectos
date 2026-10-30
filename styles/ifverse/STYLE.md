# ifverse — "What If…?" stickman stories

Long-form (≥ 8 min) 16:9 YouTube stories in the manner of @IfverseTales, all in code. Analysis of the source and the full spec: `ANALISIS.md`. First piece (the proof): `pieces/ten-seconds`.

## The look
- **Flat cards at real depth, filmed by a camera** (`ivStage(layers)`): each layer is drawn flat and placed at a depth d (1 = the actors' plane, 2–6 far, 0.5–0.7 foreground). Far layers pan 1/d as much, zoom 1+(z−1)/d and go soft with depth of field (`IV.dof`); blurred layers render at half resolution.
- **Film:** mood tint, vignette, black cinema bars (62 px at 1080). **No grain** (`IV.grain = 0`; the user saw it and the reference is clean). `ivPost()` is `STYLE.post`.
- **Stick people** (`ivMan`): black round head (R = 0.125 h), black limbs (0.034 h), one-colour clothes (hoodie, jacket, suit, uniform, cardigan, coat, vest, tee), cream eyes and mouth, a **warm rim light** from the mood's key (a silhouette pass nudged toward the light). Hair/hats: puffs, bun, pony, tuft, buscap, cap; glasses.
- **Faces:** eyes open / happy / wide (pupil) / squint / angry / sad / tired / dots / closed; brows angry / sad / up; mouths smile / grin / flat / o / frown / open / smirk; the speaker's mouth follows its VOICE words (`talk: id`); the narrator has no mouth. **Blink every 3.5–4 s, 3 frames.**
- **Hands change with shot size:** nub (wide) → mitten (medium) → five-finger glove (close-up); grips open / fist / point / hold / flat; `hold: { R|L|front|back: (x, y, ang, h) => prop }`.
- **Moods (`IV_MOOD`):** sunset, lunch, day, night, rain, lamp, office (+ arcade, party, hall, school from the sets). One mood per scene.
- **The ghost** (`ivGhost(fn, a)`): anything drawn in fn becomes a cyan hologram (luminance recoloured cyan, glow, 1-px jitter). Cyan = the device (the future) and the running counter only.
- **Type:** rounded bold caps (`IV.font`), cream with a warm glow (`ivTitle`, `ivTag`, `ivText`); `ivCounter` bottom-centre.

## Motion (measured from the source + the guide)
- **Motion on 1s** (`STYLE.ones = true`), no motion blur. Gestures 4–6 frames with a hard stop (`ivPoseMix` + `EZ.o3`). Walks: `ivWalk` (5 frames a step, planted feet).
- **Camera almost still:** close-ups never move; ~⅓ of wides get `ivPush(t0, 0.03, 1.8)` and stop. No shake (one 6-frame jolt allowed on the biggest hit).
- **Cuts:** hard cuts only, 3 frames before the word (`CUT(id, word)`); ~25–29 shots a minute; a shot under 0.45 s is dropped (main.js).

## Story and voice
- Title "What If You…?" + a number. 2nd-person present narration, short sentences; ~860 words, ~¼ dialogue, 10ish voices. 12 beats: the wish in minute one, plus/minus, the big hit at the halfway point, the twist before the end, a callback, a cliffhanger, a CTA.
- `script.md` with `[Name] line` and `[beat Ns]` → `tools/md2json.py` → `tools/vs_cast_gen.py` (VoiceStudio: narrator `mathomaly` at 0.9; characters = profiles cloned from voice-designed samples). Pauses SENT 0.85 / PARA 1.25 / CHAR 0.7 s, beats +1 s → ~1.7 words/s → 8:00+ from ~860 words.

## Sound (user-tuned on ten-seconds)
- **Music:** a light groove like the reference (measured 100–125 BPM, the tempo changes per section): `groove(t0, t1, chords, { bpm, lv })` in score.js — lv 0 pad · 1 + arpeggio · 2 + bass + hi-hat · 3 + kick + clap. Fast for montages (118–120, lv 3), slow for emotion (80–96, lv 0–1), heartbeat build into the big hit, silence for the twist.
- **SFX:** every action gets one (`SFX(t, kind, …)` per shot), but balanced: per-kind minimum gaps and one sound per 0.35 s (big ones exempt) → ~70 a minute. No bright "ting/ding" chimes (ding/coin are low marimba taps, max one per 12 s). In the mix SFX sit **under** the voice (≈ −6 dB), music −10 dB, both ducked by the voice.

## Production pattern (worked on ten-seconds)
head.html SHOT engine → sets.js (15 sets) + props.js (~35 props) → 8 section files built in parallel in `dev/<sec>` → full storyboard → fixes → code score (bed + 15–25 sfx/min, silence before the loudest hit) → export in chunks (frames are ~2.5 MB each; 12k frames will fill a disk).

## Frame checklist (on top of grammar/FRAME.md)
1. ≥ 3 depth layers; the far ones soft; background life (3+ details).
2. The face of whoever the shot is about is readable; nothing cut by the bars.
3. Feet on the floor line (GROUND 900 at d = 1); no sliding, no passing through furniture.
4. The picture shows the noun on its word; every spoken number on screen, landing at the end of its word.
5. Any grab or hold gets a hand close-up with an exact grip.
6. The ghost (cyan) on every use of the power, nowhere else.
7. Not the same picture three times in a row.

## Next (user notes after ten-seconds)
- **More 2D→3D, like the reference:** heads that sometimes read half-3D (sphere shading, a turn), sets with real perspective (floors, walls, objects with sides), camera moves that reveal depth.
- **Arms:** the rig bent every elbow with one sign (one arm looked flipped). Fixed: `armIK` in ivMan picks the natural bend (down first, then out facing camera / back in profile); rest poses hang straight. Check arms on every board (`pieces/ten-seconds/dev/armtest`).

## Not matched yet
- Back views (only a workaround in s08); fingertips in some hand inserts are simple capsules.
- Ghosts on far blurred layers read soft; draw important ghosts on the actors' layer.

## Proven on
`pieces/ten-seconds` — "What If You Could See 10 Seconds Into the Future?" (8:22, 239 shots, 11 voices).
`pieces/cats` — "What If You Could Understand Every Cat?" (8:31, 273 shots, 2.5D upgrade, cat rig).

## Thumbnails (from the channel's 14 thumbs, sheet in `thumbs/sheet.jpg`)
- 1280×720. Caption top-left, 2 short lines, Montserrat Black (`fonts/Montserrat-Black.ttf`), line 1 white, line 2 yellow `#ffc93c`, ends with a period ("TOO SLOW.", "CATCH ME.") — never repeats the title, it is what the hero would say.
- The hero's head BIG on the right half (≈ 55% of the height), cropped by the bottom, smug face: flat-lidded eyes, a four-point star in one eye, one-sided smirk. Warm glow behind the head, rim light.
- One glowing prop/opponent on the other side (bullet, IQ meter, the cat), an accent in red (tags "PART 2", a red word). Dark navy night, blurred bokeh background.
- Template: `pieces/cats-thumb` (scene + `ivPost` override that draws face, bubble and caption on top of the grade, `IV.bar = 0`). Copy it, change the scene.
