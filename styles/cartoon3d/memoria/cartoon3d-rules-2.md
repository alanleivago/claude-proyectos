---
name: cartoon3d-rules-2
description: "cartoon3d standing rules from the user's review of apple-wayne v1 (2026-10-23) — apply to every future cartoon3d video"
metadata:
  node_type: memory
  type: feedback
  originSessionId: e3b19138-633b-4f91-a0e9-968a2b60dee4
  modified: 2026-11-02T11:57:53.458Z
---

For this and EVERY future cartoon3d short:
- Voice: never clip a word at the start or end (the first and last "1976" were cut). Trim only in true silence, keep the tail ringing out; the piece lasts as long as the voice.
- Music bed audible from frame 0 (start the track where it already plays).
- Blurred foreground objects (depth) must MOVE with parallax through the frame, never sit glued to the screen.
- Text/labels stay inside their object (e.g. "APPLE COMPUTER CO." inside the parchment); stamps like PAY NOW placed in the empty space.
- Contact shadows under the FEET, very soft — never a disc under the torso.
- Beards stretched to the face width so they align with the head.
- Counters/tables must hide the legs/feet of people behind them.
- No visible quad edges/boxes around sprites (moths, symbols); keep small props small. Nothing passes through paper/props.
- Show facts with creative in-world devices adapted to the story (e.g. age 41 → his ID card with a bored photo and AGE 41, then a super dynamic zoom-out pan revealing the next action). Always look for that kind of staging.
- MANY more SFX: every visible action gets its sound (signing scribble, typing, drawing scratch, an object appearing, each falling board/box/pallet, flying bills flutter, clock ticks, drinking sip, footsteps, doors, paper, LED rolls…). Build cues from a per-set list of event times.

- (2026-10-23, phone-1pct) Every hairstyle glued by its measured hairline (kit HAIR table — add new styles there). Umbrella shaft meets the canopy centre, ribs never pierce it. Cars must be appealing rounded cartoon designs, never boxy. Backgrounds never flat/empty (e.g. wet street floor with reflections). Hands holding props drawn as proper cartoon hands, not blobs. Stage prop orientation unambiguously (which way a phone screen faces).

- (2026-10-25, lego-sea) User felt our videos less "colourful/HD" than Ricks Clips. Measured: refs ~6x sharper, whites 88-98 L; ours whites ~80 with a shadow-tint haze. Fix = kit HD finish: set `C3_HD = true` in shots.js and call `c3Crisp(0.45)` before vignette/grain. Use it on every new cartoon3d piece.

- (2026-10-25, lego-sea v1 review) SFX were as loud as the voice and covered it (gulls worst): SFX must sit UNDER the voice (final approved: >= 3 dB under) — remix rides the SFX bus under the voice's short-term level (pieces/lego-sea/sound/remix.py), low per-cue lift, no +5 dB bus. Also: ambient props (gulls) must never pop/flicker (draw random params once at build), cached textures must key on every state (export workers), held props attached to the real fist (no extra hand), flashlights lens-forward, and objects never interpenetrate — scan strips every ~0.1 s before rendering.

- (2026-10-27, future-library review) Hair must be IDENTICAL to Ricks Clips' characters: screenshot each hairstyle from the Ricks shorts and upload those crops to Flow as the reference images to replicate (not a collage/approximation). Fit each hair to the head: sideburns/edges must reach the head outline (stretch them). NO beards (Ricks never uses long brown beards; avoid even the small white one). Moustache only if it matches the hair colour. Thought bubbles: the little bubbles must trail from the head, text fits inside. No zipper/tape gags on mouths — use a closed-mouth face. No odd details on buildings (trees on roofs, signs/paths placed oddly).

- (2026-10-27, future-library review) Hair must be IDENTICAL to Ricks Clips: crop the real character's hair from a Ricks frame and upload THAT crop to Flow as the reference (one crop per hairstyle, never a collage) — kit `rk_*` styles (tools/slice_ricks2.py). Sideburns must reach the head outline (stretch if short). NO beards (Ricks doesn't use them). A moustache only in the same colour as the hair. Check every body sprite renders opaque (a green outfit gets eaten by the chroma key: body_dress was re-cut with a border-connected key).

- (2026-10-29, slow-checkout) User still saw a milky bloom veil vs Ricks' saturated HD look. Kit `C3_VIVID` finish (opt-in): set `C3_VIVID = C3_VIVID_DEF;` in shots.js (after C3_HD/C3_RICKS) and end the frame with `c3Crisp(0.6); c3Vignette(0.2); c3Grain(0.02);`. It drops the look's shadow screen-tint and warm multiply veil, caps bloom 0.04 / glow x0.55 / glowBlur 10 / bgBlur x0.55, grades brightness 0.9 contrast 1.2 saturate 1.2 and adds per-pixel vibrance (pale tinted surfaces gain colour, white heads stay white). Use on every new piece. Also: paint environments with saturated wall/floor colours like Ricks (yellow, teal, green walls) — pale cream/beige surfaces and pale `bg` clears are what keep a frame milky.

- (2026-10-29, slow-checkout) Framing + long takes like Ricks (measured, styles/cartoon3d/FRAMING.md): Ricks head median ~10 % of frame height, CU ~2 %, mostly full-body MS/WS + ~40 % inserts/establishing; ~27 cuts/min, ~22 % of shots > 3 s, one or two 5–11 s continuous moves per short. Every piece: shots.js SHOT_WIDEN (default 1.22, faces 1.4–1.8, inserts in SHOT_INSERT = 1) and CONTINUOUS chains of adjacent same-set beats (no dissolve, 0.55 s camera glide) — copy pieces/slow-checkout/src/shots.js. Don't chain shots whose cameras are far apart (the glide crosses walls).

- (2026-10-29, slow-checkout review) Shadows + ink like Ricks: set `C3_INK2 = C3_INK2_DEF; C3_SHADOW = C3_SHADOW_DEF;` in shots.js (kit: screen-space marker outline on every edge/crease ~3.4 px; real cast shadows from a raking key light, shadow catchers on big floors/walls, shadow map built once per frame with all layers). Continuity: in long takes (CONTINUOUS) and across dissolves people keep their world positions — a shot must start each person where the previous shot left them, never hide someone who was on screen in the previous shot of the same group (no vanishing/teleporting when the camera moves). Never place camera-space foreground props (staFg) in a shot whose camera swings a lot (they sweep across faces); check every camera glide for geometry crossing the lens (strips at 15 fps). No top-down swoops over billboard people.

- (2026-10-29, slow-checkout) Photos, portraits, x-rays and pictures in thought clouds use REAL images of what's named (generated in Flow or CC0 from the internet) with a comic touch (e.g. gap-toothed grandson holding 'I love GRAMA', knee x-ray with a smiley sticker, guilty ginger cat carrying pink slippers), mapped inside their frame/card. Enclosed rooms need enough light (warm practicals, window light, fill) so they don't read dark. No speed-line streaks behind running characters.

- (2026-11-01, swedish-number + flower-clock APPROVED) Body sprites must have NO baked sleeves (kit ink arms are the sleeves). Exact Ricks hair for every character incl. extras via styles/cartoon3d/tools/cut_ricks_hair.py (cut from Ricks frames; Flow often fails). Extras each with their own costume + hair colour. Open on a people shot, then cut to the hero object on the line that names it. Voice glitches: splice the same phrase from another take at silences (flower-clock voice).

- (2026-11-01, mromidev tutorial) Grade as the tutorial measures: `C3_VIVID = C3_VIVID_MRO` (S median ~0.49, luma ~0.55, no crushed blacks) and no film grain on every NEW piece; export stays 1080x1920 (no 2K). This replaces the earlier "lots of saturation" note for new pieces.

- (2026-11-02, human-library mromidev test) User REJECTED the mromidev Remotion bean-head characters and their motion. Keep OUR characters/animation (kit c3Person, Ricks hair, fists). ADOPT from the test: its richer sets (reading room, street, canal aerial, globe — dense props, windows, mouldings, posters), more dynamic camera (C3_CAMFX push-ins/tilts/shakes, C3_DOF, c3Fog), the MRO grade (sat ~0.49, no grain), short_qa.py + side-by-side verifier. Export stays 1080x1920.
- (2026-11-02, mistaken-orders storyboard) Interiors MUST show cast shadows: room ceilings/walls are built with `plNC`/`rbNC` (userData.noCast — kit c3ShadowSetup skips them; otherwise the ceiling shades the whole room and no shadow reads) and shots.js uses `C3_SHADOW = {...C3_SHADOW_DEF, catch: 0.6, tint: '#1e1c5a', key: 0.8}` (mromidev: warm light, cool blue-violet shadows; key > 1 washes orange walls to yellow). hair_rk_greybun is a bad purple cut — never use it; grey bun = rk_bungrey. Framing: SHOT_WIDEN ~1.6 default, inserts 1.7, and keep front tables out of the camera lines.

**Why:** the user's review of the first full render; they said "these instructions are for this video and all future ones".
**How to apply:** check every item before showing a render. Related: [[cartoon3d-style]], [[voice-cuts-in-silence]]
