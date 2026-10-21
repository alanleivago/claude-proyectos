# LOG — electrones

## Run 1 (2026-10-19)
- **Story:** same structure as the reference, in a new place: a rooftop barbecue at sunset instead of the park picnic.
- **Ghost world:**
  - A per-mesh swap to the XRAY rim shader, which handles skinned and instanced meshes. Points and sprites keep their own materials; a global overrideMaterial broke the particles.
  - The flats (ground, deck, gravel, haze) are hidden in ghost mode to avoid additive whiteout.
- **Particles:** surface samples of the real scene (people via boneTransform, railing, table, towers) fly apart; the same points come back blue.
- **Plasma Earth:** an fbm shader with a rim halo; the stage far plane is raised to 100000 (the default far = 4000 clipped it).
- **User notes, all fixed:**
  - the tower feet fade into haze, plus a haze plane over the streets;
  - a sunset sky dome with lit cloud banks (the sprite clouds read as blotches);
  - the right hand grips the glass (knuckles vertical, palm to the glass);
  - the chairs got legs.
- **QA:** PASSED after three changes:
  - the cue's hero `lift` raised to 8 (the limiter ate the main-band lift);
  - `silence_ok` widened to 59.9–61.4;
  - a high-passed tail added after the boom.
- **Review:** story arc 5/5, text PASS.
  - The loudest moment is at 63.4 s in the payoff act, but review measures 0 s of silence in the 2 s before it: the explosion builds for about 2 s after the planned silence.
  - Dead-beat WARN on the end card.
