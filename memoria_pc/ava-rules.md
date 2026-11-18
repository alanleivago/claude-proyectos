---
name: ava-rules
description: Ava Bread (zombie channel) — APPROVED level = pieces/zombie-01-door v6 + ALL user corrections from its 6 review rounds; check every shot against them before rendering
metadata:
  node_type: memory
  type: feedback
  originSessionId: 3b008220-5710-444f-9064-2bac0d02be64
  modified: 2026-10-30T05:10:57.867Z
---

Approved level (user, 2026-10-28: "ahora sí quedó bien"): `pieces/zombie-01-door/zombie01_door_v6.mp4`. Its engine (`engine/`: main.js, lib.js, film.js, sets/*.js), `voz/assemble.py` and `audio/scripts/mix.py` are the template for the next Ava videos; LOG.md lists every change. Channel context in [[zombie-channel]].

**Why:** each rule below is a correction the user had to ask for; repeating any of them costs a review round.

**How to apply:** build the next episode from these files and check every shot against this list before the storyboard and before the final render.

Voice
- VoiceStudio clone **"ava bread 2" `3824e262`**, steps 32, wav (NOT "ava bread" 2dd9cbec, it had an error). Once approved, never change the voice; fix timing only by trimming gaps.
- NEVER split one take at "…": the pause is not silence and words get cut. Generate each half as its own take (`voz/lines/<id>_<j>.wav`). Trim at -45 dB with 80/180 ms margins and a 30 ms fade-out. Place each piece so its first SOUND lands on the cue. Get word times per take; whisper stretches the first word over the leading silence, so clamp it to the onset.
- Very short lines ("Oh, fudge"): generate one on its own and check it with whisper; if it breaks, generate it inside a longer sentence and cut in the real silence.
- If the new voice is slower, use VoiceStudio `speed` (~1.12) on the line that runs into the next shot.
- Dead air between lines (>~0.5 s) gets cut. Use film.js `CUTS_T` + `warp()`, with the same cut in mix.py, in whole eighth-notes of the music.

Picture
- Look: PS1 Resident Evil. "RE" font (refont.js) with pixelated captions (9 px ×3). No channel header. The HUD is the ECG combined with the RE2 CONDITION panel.
- YOU DIED in RE style: a red-tinted freeze, a TRANSLUCENT black (~86 %, the scene still visible behind) and red letters with drips.
- Transitions are seamless: the white flash ramps in and out, never a hard pop.
- The opening can have a pistol reload (`reload` action). No magazine prop: it clipped through the gun. Hands + slide + SFX are enough.
- In frontal shots Ava looks AT THE CAMERA: `ch.lookAt(camera)` in lib.js, which restores the animated bone every frame or it flickers. Give her cute expressions (shrug, wink + smile) instead of a blank stare upward.
- Ava must NEVER shake. When zombies push the door, only the door moves: the leaf gives and rebounds and the handle rattles (hall.js `THUMPS`/`rattle()`). No camera shake. Measure jitter with the hair-centroid test (≤1 px, no frame-to-frame back and forth).
- Labels and animations land on the word that says them (e.g. NOT EVEN CLOSE on "don't even reach").
- RE props in the sets: First Aid Sprays (copy of Markus Darius' itch.io model), green/red/yellow herb pots. Props need real low-poly texture detail.
- **Name: AVA RESTFIELD** (user, 2026-10-28, ep2; was "Ava Bread"). End card: typewriter "NEXT:" / topic in Courier, a rotating examined 3D object just above the text, **"FOLLOW AVA RESTFIELD!"** below.
- HUD (CONDITION panel) appears EARLY, AT ONCE on the cut to the 2nd shot (~2.3 s, film.js `HUD_T0`). The user REJECTED a slide-in/CRT-flicker entrance (not animated enough) and a 💢 anger mark: no manga symbols.
- Every zombie hit shakes the window/door (only that object) with a hit SFX on the same frame. Blood decals = real textures (Flow), never painted pixels. Zombie hands = the model's own hands, never box-built limbs.
- Inventory/EXAMINE screens: fill them with RE2 items (First Aid Spray, shotgun, herbs, ammo) and real detail.
- Opening line must sound declarative: check the F0 contour of the last word (VoiceStudio sometimes ends rising, like a question; regenerate with a period).
- English only, jokes in English, no Russian, no sub-captions like "(the polite version)".
- **"Oh, fudge!" is Ava's running gag** (user, 2026-10-28, ep2): her catchphrase when the ending goes wrong (the ref's "Ech, blin" beat), every episode. Reuse ep1's take `zombie-01-door/voz/lines/13_fudge.wav` so it always sounds the same.

Ep3 "AVA: DAY 1 — The Police Station" APPROVED at v4 (2026-10-30, pieces/zombie-03-station; mix3.py uses real CC0 music Freesound 345069 — synthetic drones read as a humming voice and lacked presence; Dino Crisis radio beep first, then FILE menu sound; lines that continue must be ONE take, no full stop).
Ep3 v1 review (2026-10-29): ALWAYS humanize the script — talk like a normal person with connectors ("four toilet tanks, that's six more, so eleven days. And help comes in seven"), never telegraphic lists of fragments. Rain/drops on glass fall DOWN; no flickering reflections; police caps low peaked (not big square blocks); keep the same cop look in every shot; Dino Crisis radio beep only when the radio appears; voice a bit louder (mix3 voice x1.15); dark BGM must be continuous (no long holes). Free low-poly models from 3D platforms beat ugly procedural vehicles. Save-game sheets show the location name (e.g. "POLICE STATION").

Scripts: the user asked (ep2) to IMPROVE the ref's script, not copy it: same beats and shots, clearer logic order, US units (inches) with facts checked (FEMA/FLASH), callbacks to earlier episodes ("friction still doesn't care…").
Lighting: the user found ep1 too dark → from ep2, 3D shots (rooms, Ava, exteriors) ~30 % brighter with lifted shadows; YOU DIED and diagrams stay dark.

Sound
- Every action has a real SFX on its exact frame. Trim the leading silence of every SFX file (the Dino Crisis default sound had 0.33 s and made every label late). The typewriter is one key per letter, on the letter's frame.
- Sound sources:
  - Dino Crisis (`assets/dino-crisis-sfx`): the default sound on labels, a radio beep when the HUD comes in, steps, push, inventory, unlock.
  - Zombie voices from Resident Evil (`assets/zombie-sfx-yt/seg`, YouTube 4JCoB0GUIVs from 1:20).
  - Freesound CC0 for the rest (door, drill, glass, reload).
- Music is cut on the two YOU DIED moments and before the end card. The mix is STEREO at -14 LUFS, true peak ≤ -1 dBTP.
Long ep3 v1 review (2026-10-30):
- Voice is now **"ava bread buena" f2a102da** (better quality; replaces 3824e262 from here on).
- Never keep shouted reads ("First problem", "7-3-7", "Rule four"). Pause between the final question and "Comment yes or no".
- Music must be clearly audible: the user couldn't hear it at all.
- End card says **"SUBSCRIBE!"** (not "FOLLOW AVA RESTFIELD!") and the BGM plays to the very end.
- No clipping:
  - Ava through doors: make door-open animations.
  - Hands on props: use Ava's own hand, never floating.
  - Flashlight beam must follow the flashlight.
  - Make new animations whenever a shot needs them.
- Guns are black with detail, never flat grey.
- The dog must look cute: head and neck joined, no transparent parts, round eyes with a highlight.
- Rooms get rich low-poly detail, not flat.
- Light spill from doors must not flicker.
- Hold key items on screen for ~2 s after they are named.
- Long ep3 APPROVED at largo v3 (2026-10-30, pieces/zombie-03-station/largo/zombie03_station_largo_v3.mp4). Music: match by LUFS, not RMS (bass-heavy tracks vanish); ~9–13 LU under the voice and never louder where SFX are dense; voice +1.5 dB over v2.

Long-form version (16:9, ≥ 8 min) of every short — template = pieces/zombie-03-station/largo/ (v3 approved 2026-10-30):
- Reuse the short's sets. The engine is `largo/engine/` at 640x360 ×3, with shots tied to words (shots.json + ctx.at).
- Extend with new chapters, fixed RE cameras and an RE2-1998 inventory / MAP / FILE screens.
- Add these elements:
  - a puzzle (clover key);
  - a survivor NPC;
  - a companion (dog Ribbon);
  - a fake YOU DIED;
  - a chapter card with the time of day for each chapter;
  - a real fact (with source) in each problem.
- Script and title:
  - humanize the script (humanizer skill) and keep `guion.md` + FACTS.md;
  - research the title for virality ("Zombie Outbreak: 1 Night Locked Inside a …").
- Audio:
  - `largo/audio/mix_largo.py` maps every SFX event to a real sound; the unmapped list must be empty;
  - Dino Crisis walk_run_indoors for steps;
  - real CC0 music per chapter, matched by LUFS.
- Review: `revisar_render.py` runs out of output on long files, so review in ~2:40 parts (all three, including the last). Then check frames of every fix yourself.
- Deliver `DESCRIPCION.md`: title, chapters ≥ 10 s from 0:00, credits (Quaternius dog CC-BY, dogchicken zombie CC-BY, Kenney CC0, Freesound authors).
- Pipeline: one background agent owns the whole long version and gets resumed with each review round.

**End card text:** shorts always say "FOLLOW FOR MORE!" and longs always say "SUBSCRIBE!" (user, 2026-11-01, ep4). Shorts no longer say "FOLLOW AVA RESTFIELD!".

**Ep4 "The Last Train" review (2026-11-01):**
- **Format:** shorts adapt viral series from other accounts (play.malo "Subway") beat by beat. Open with "Imagine you…" and match the ref's framings (she chases the leaving train, benches on the platform, gate shot from behind her).
- **Duration:** about 61.5 s.
- **Voice:** short pauses between lines (0.3–0.45 s).
- **Phone POV:** the phone sits upright and level; hands don't matter.
- **Ava's acting:**
  - no tremble animation;
  - the "Oh, fudge" face is >.<, never happy.
- **Creature:**
  - emerges from the dark, never pops in;
  - two separate glowing eyes, not a goggle band.
- **Ep4 short APPROVED at v6** (2026-11-01): pieces/zombie-04-subway/renders/zombie04_subway_v6.mp4, 61.5 s, −14 LUFS.
  - Base the next shorts on it: copy its engine.
  - voz/build_cues.py builds every cue from the voice.
  - Objects made with the photo→lowpoly method live in objects/.
  - Ava has a new `run` animation.
  - The >.< face is in the eye atlas.
- **Ep5 P.T. review (2026-11-02):**
  - Lisa/ghosts LEVITATE behind Ava (they float with a soft bob, never walk).
  - Reread the user's exact wording for fixed lines (e.g. "THE ghost", not "a ghost").
  - Slow takes need a real pause on commas ("Lisa, stuck to…").
  - The >.< face was rejected twice. Design a clean expression that fits each situation (scared, eyes looking sideways, cringe mouth), never with cropped atlas cells.
- **Never change Ava's base model or textures** (pants, clothes) without being asked (user, 2026-11-02). The ep5 pants change was rejected; if a smudge appears, report it instead of repainting. "Oh, fudge" keeps her normal open mouth (the teeth grimace was rejected).
- **Ep5 "P.T." short APPROVED at v5** (2026-11-02): pieces/zombie-05-pt/renders/zombie05_pt_v5.mp4, 62 s.
  - The hook (0–10 s) carries MORE horror music: a real drone plus a music box, a stinger on key words, crossfaded into the BGM by ~10 s (audio/scripts/mix5.py).
  - Fact shorts adapted from TikTok refs work in this format.
  - Lisa: Sketchfab model, pixelated, levitating.
- **Choice ("Choose") endings, user 2026-11-03:**
  - The video ENDS on the RE choice menu ("WHAT DO YOU DO? 1 / 2", "COMMENT 1 OR 2", plus FOLLOW FOR MORE!) over a living background: Ava breathing, or Ava from behind at the peephole. Never a frozen frame, and no separate end card after it.
  - No word subtitles over the menu.
- **Every video lasts at least 61 s** (target ~62).
- **City backgrounds:** long draw distance.
- **"Imagine you…" scripts, user 2026-11-03 (ep6):**
  - Narrate in SECOND PERSON all the way through ("you fill the tub", "you freeze"), never "Ava does…".
  - In a choice ending the threat must stay AMBIGUOUS. The person at the door is a suspicious civilian (dark clothes, eyes in shadow, no blood), never an obvious zombie.
  - Openings: Ava on screen by ~2 s.
- **Maximum 2 review rounds per video** (user, 2026-11-03). Ep6 took 6 renders, which was too many. After 2 passes (API review plus crops), deliver. Fix only clear failures; cosmetic nitpicks wait for the user's review.

**Farm long v3 review (user, 2026-11-04):**
- An animation clip plays ONCE per action. Never restart or loop the same clip on consecutive shots (the phone look repeated, a 3x loop).
- No flickering ground/grass. Check frame diffs on exterior shots (z-fighting of decals/paths).
- Ava inside vehicles: a real cab interior (seat, wheel, dashboard) plus a sitting animation, never Ava standing behind a window.
- Monsters hidden in the dark: eyes ON the head, never floating. Monsters other than zombies are welcome (downloaded models, e.g. tentacles).
- Long end card: the mini model must match the real set (reuse the real model scaled), and longs end with a choice CTA ("Should I go to the barn?" 1/2, as in the station long) + SUBSCRIBE!.
- Measure the music per segment: no section louder than the rest (7:34 was too loud).

**Revisión ep12 Radio v1 (usuario, 2026-11-08):** props en mano orientados hacia quien los usa (pantalla del teléfono hacia Ava); animaciones de brazo sin temblor (no sumar clip + sway); transiciones oscuras con luz suave para que se lean; siluetas con volumen 3D (sombrero con ala/copa, abrigo, rim light), nunca planas/cuadradas; props apoyados bien (teclas sobre el cuerpo de la máquina, nada hundido en la mesa); tarjeta final de decisión = Ava de cuerpo completo mirando hacia la amenaza (ventana).

**Revisión ep13 Gas storyboard (usuario, 2026-11-10):** sets exteriores con MUCHO detalle (nada plano: bordillo, manchas, props, fondo con árboles/edificios y cielo); vehículos con modelo low poly real (no cajas); puertas siempre dentro de su marco/pared (nunca flotando); manos/cuerpos sueltos = low poly facetado con dedos y nudillos, nunca formas planas tipo ladrillo.
**Verificación obligatoria (usuario, 2026-11-10):** antes de reenviar una corrección, YO reviso el mp4 exportado cuadro a cuadro (≥5 fps) en el tramo corregido, buscando geometría que atraviese a Ava. Nunca fiarse del reporte del agente (ep13 v3 se envió con el pilar atravesándola).

**Desde 2026-11-11 (largo Day 2), para TODO lo de Ava:** voz más lenta (VoiceStudio `speed` ≈ 0.88; ella iba muy rápido) y tono cinematográfico/humano: más pausas entre frases (silencios de 1-2 s con ambiente), pensamientos internos susurrados ([PIENSA], instruct "whisper", más cerca/secos en la mezcla), miedo audible (respiración, tragar saliva, voz que tiembla), que parezca que lo está viviendo. **Why:** el usuario lo pidió como regla fija. **How to apply:** marcar en el guion [PIENSA]/[RESPIRA]/(pausa) y respetarlos al generar y mezclar.

**Correcciones largo Day 2 v2 (2026-11-12), reglas fijas:** Ava NUNCA dice "click" (onomatopeyas fuera del guion; el sonido va como SFX). Tarjetas negras de hora: solo texto, SIN recuadro gris debajo. Inicio de una Parte N nunca brusco: recapitular la elección con una frase ("Last night you had to choose..."). Nada de sílabas estiradas por speed bajo (revisar palabras sueltas tipo "three... seven" y regenerar a speed normal si se alargan). Cabezas de zombies sin temblor. Nada quieto >4 s: cambiar planos. Pensamientos de miedo (no, no, no) con toma humana, no robótica. SFX sin duplicar ni duros. Personajes en pantallas de resumen = render 3D real, no iconos.
