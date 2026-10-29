---
type: log
status: active
tags: [floating-teacher, yokai]
relatedTo: [pieces/umibozu/LOG.md, styles/yokai/STYLE.md, pieces/floating-teacher/brief.md]
---
# LOG — floating-teacher

## 2026-10-26 — first build up to the storyboard
- Structure copied from pieces/umibozu (piece.json build list, head, scenes, tex, kit, render3D, ykPara/ykCard/ykBadge). World rewritten: classroom, 30 pupils + teacher on a point rig (pelvis basis + two-bone IK arms and legs, so feet/hands land exactly on targets), teacher hair as ~200 simulated strands hanging under gravity and pushed out of head/neck/body; braids for some girls also simulated; live canvas blackboard (sums, erase, DON'T LOOK UP, ghost text).
- Card: 3 Flow (Nano Banana Pro, 4:3) generations; kept #3 (low angle, upside-down face, long neck, children at desks, shoes) → assets/print.jpg (border cropped).
- QA (frames every 0.25 s via contact sheets + a numeric pass every 0.25 s: IK reach, feet above floor/platform, body/neck/head/hair vs ceiling, walls, desks and pupils' heads, camera inside the room and not inside heads, chalk not in the tray, pupils' forearms/hands vs desk tops):
  - chalk tip missed the board by 1–3 cm → hand frame + grip point fixed; chalk now held in the curled fingers, tip on the writing (0 mm error 9–23 s).
  - right foot IK short by 4 mm while reaching → stance height fixed.
  - sums ran past the board edge in the close-up → layout moved.
  - chalk fell into the board tray → falls clear and breaks on the platform.
  - teacher feet were blobs and the shoes boxes → real shoe (sole outline, toe cap, wall, strap, buckle) and stocking feet.
  - hair: wig-cap look + flat clump → bigger head, finer strands that fan out, length variance.
  - pupils' forearms sank 1.4 cm into desk tops → wrists raised, hands lie on the desk (3–9 mm above).
  - pupils' eyes were black dots → whites + pupils; teacher's iris red only after she stops.
  - several shots unreadable (hook head too high/hidden by the text, mother shot too close, boy shot, clock, empty chair, today framing) → reframed.
- Numeric QA final: clean (no flags).
- Weak / to watch: the teacher's hands are simple; pupils are low-detail at a distance; panel 6 (from the class) is dark.

## 2026-10-26 — round 2 (user notes on the board)
- Hook: teacher now crawls flat on the ceiling (arms spread, palms on the boards), the long neck lowers the head, face upright toward the camera from 0.25 s, mouth opening; no more inverted head that read odd.
- Hands: teacher hands rebuilt (palm, knuckles, 4 fingers × 3 joints, 2-joint thumb, nails); chalk grip solved by forward kinematics (chalk pinched between index and thumb pads, tip on the writing: 0 mm error 9–23 s). New close camera on the writing hand.
- Thumb sides: root cause of the reversed hands = pupils' hand targets swapped left/right (arms crossed). Fixed; numeric check over all pupils every 1 s (thumb medial on palm-down hands: 3236/3236 OK) + "hand-crossed" check every 0.25 s for everyone: clean. Rig verified: right thumb at +X (=Y×Z), left at −X.
- Teacher face: painted face texture on a long skull — sunken black sockets, slit eyes with pin-prick pupils (iris red after she stops), cracks, veins, sunken cheeks, a too-wide slit-cornered mouth with blackened (ohaguro) teeth, wet strands across the face. Reveal head twisted ~130° (close) so mouth and eyes read; hair sway reduced so the face is never hidden.
- Panel 7 heels: low side camera + warm spot, pale stockings against the dark shoes: heels lifting out of the shoes is obvious.
- Panel 10 clock: pendulum wall clock on a wood panel, glass, brass pendulum that stops at 42.6 with the second hand, 昭和62年 November calendar, rain-light shadows on the wall.
- Panel 14: overhead POV from the ceiling; the boy tilts his head up, eyes widen.
- Students: bangs/side hair, name tags, white collar trim, pens, open books, school bags on desk hooks.
- Blackboard: Japanese system fonts (Hiragino Mincho / Maru Gothic, verified in headless Chromium): 数学, 問1–問4 sums, date 11月12日（木）, 日直 in vertical writing; 見上げるな / DON'T LOOK UP in brush-chalk (multi-stamp + dry-brush streaks). Motto 誠実・努力・友愛.
- Numeric QA (every 0.25 s): IK reach, feet, ceiling/floor penetration of every teacher mesh, hair vs ceiling/walls/heads/desks, camera inside room, chalk, crossed hands: clean.

## 2026-10-26 — round 3: approved board → final
- Fixes: panel 11 closer low angle (face reads); panel 6 pulled back 3/4 view, she goes limp, the neck lengthens and the head tilts too far; panel 7 heels rise one after the other with toes pointing, knees soft, a slight hip sway. Mother's hands checked close-up with thumbs tinted: thumbs medial, correct. Arm transition clamped to reach (QA flagged 4 cm at 24 s).
- Full numeric QA every 0.25 s clean; contact sheets every 0.5 s (offset) looked at.
- Export: 1704 frames, renders/final.mp4 + share.mp4.
- Sound pro (sound/mix.py): Freesound CC0 picked with earshot + Commons + code layer (see sound/CREDITS.md). Master compressor (ratio 3, 5/150 ms) + body ride; −14.5 LUFS, sample peak −3.0, true peak −1.7 dBTP (AAC); loudest 100 ms at 45.8 s after exact silence 45.0–45.6.
- Review: story arc 5/5, text PASS, dead beats PASS, cuts PASS. earshot critique --fast: 18/21 in range; remaining flags are launch-film ones (onset density, cut onsets) and stereo width (minor).
