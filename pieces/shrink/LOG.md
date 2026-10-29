# ¿Qué pasaría si te encogieras a la mitad cada 2 segundos? — LOG

- **Ref:** "What If You Got 2x Smaller Every 2 Seconds?" (61 s). Timings, beats and the third-person camera are copied. Height `HGT(t) = 1.6 · 2^(−t/2)` m.
- **Elements changed:** a flat's living room and kitchen (not a bedroom), a sofa (not a bed), a cat (not a dog), a 2-euro coin, a cat flea (not an ant), cat fur (not carpet), a salt grain (not a hair), a milk drop with fat globules (not water); viruses, molecules, DNA and atoms as in the ref.
- **Format:** pov3d, 9:16, 24 fps, 61 s, Spanish. BGM: Mixkit "Cherry on Top" (Michael Ramir C.), instrumental funk at 130 BPM, edited at bar lines — a hard stop at 51.6 s and the drop on 52.0 s (the DNA).
- **Card:** in 60 seconds you'd be about 1,000 million times smaller → "Pero tranquilo, esto nunca sucederá… ¿o sí?" → ALTERBASE.
- **Facts and sources:**
  - cat flea 2–3 mm (dimensions.com);
  - dust mite 0.2–0.3 mm (Wikipedia);
  - salt grain 0.3 mm (scaleofuniverse);
  - milk fat globules about 4 µm (PubMed 16045897);
  - T4 phage about 200 nm (ViralZone).

## Build
- **Mine:** the head (21 shots, acts, `HGT`), `shots` helpers, `overlays` (height HUD, 15 captions, card), the shared `girl.js` v1.
- **Four high-effort agents** in isolated copies:
  - **home.js + girl.js:** the flat, cat, coin, and the girl with hoodie and ponytail;
  - **micro.js:** flea, fur, mites, salt;
  - **milk.js:** the drop, milk, bacteria, cell;
  - **nano.js:** viruses, molecules, DNA, atoms.
- **Storyboard fixes**, each by its own agent:
  - the cat made realistic (anatomy, eyes, shell fur, whiskers);
  - the salt grain made a clear crystal (no refraction ghost);
  - the milk drop made glossy (reflections, fat specks).
- **Rendering:** the unaffected shots rendered while the fixes ran.

## Sound (sonido pro)
- **Music agent:** chose the track out of 40 candidates.
- **SFX agent:** 159 cues computed from the scene code, on top of the music:
  - a shrink whoosh plus mouth pop every 2 s;
  - SFX and ambience per world.
- **Recordings:** 58 Freesound (41 CC0, 16 CC BY 4.0, 1 CC BY 3.0) plus the Mixkit music. `audit.py` exit 0 and `CREDITS.md` written; never register the film with Content ID (Mixkit forbids it).
- **QA warnings:** 24 events masked by the music; LRA 4.0.

## Checks
- **Review:** story arc 6/6; text PASS.
- **Sound:** −14.0 LUFS, TP −2.3; the loudest moment is 52.3 s (the DNA drop); 0.4 s of silence before it.
- **Dead beats:** WARN on the card (58–61 s, 3.0 s).
