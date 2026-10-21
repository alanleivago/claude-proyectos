# LOG — dossoles

## Run 1 (2026-10-18)
- **Remake of the reference** "What if the Earth had two Sun" (Ref Lunar Animation). It keeps the same structure: a one-day time-lapse from a desert porch, two suns, two shadows, water reflecting both suns, the noon pass, and two sunsets.
- **Elements moved:**
  - the porch is round, with an arched railing;
  - the windmill is at the left;
  - a round stock tank replaces the pond;
  - mesas and saguaros are in other places;
  - new elements: a pickup, a rancher in a hat, and the dog on the porch.
- **Tech:**
  - one sky-dome shader with two sun discs, twilight, stars and time-lapse cirrus;
  - two shadow-casting directional lights, so every object has two real shadows;
  - an analytic water shader that reflects both suns;
  - the camera yaw follows the suns' mean azimuth, and the field of view and pitch keep both suns and the horizon in frame.
- **Bugs:**
  - A near mesa blocked the east view; removed it.
  - The square porch faced north while the view turns east → south → west; replaced it with a round deck and a semicircular rail.
  - The single 68 s shot broke review's contact-sheet filter (expression too long); split it into 3 SHOTS that share the same function.
- **QA:** PASSED (sync 0 frames, -15.2 LUFS, TP -2.4).
- **Review:** story arc 5/5, text PASS. Loudest at 36.7 s (the eclipse) after 1.2 s of silence. Dead-beat WARN on the static end card.
