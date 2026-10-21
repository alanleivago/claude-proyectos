# LOG — tesla

## Run 1 (2026-10-18)
- **Story:** an original story told in the pov3d look. You get a Roadster with the cold-gas thruster pack:
  - you launch down your street, hop over a traffic jam and glide between towers;
  - you climb through the clouds to 100 km, where you meet the 2018 Starman Roadster.
- **Reused from pieces/roadster:** roundBody, buildRoadster, buildWheel, buildSedan and buildTruck (in car.js), plus a new detailRoadster with clearcoat paint, mirrors, splitter, diffuser, intakes and door lines.
- **New pieces:**
  - suburban street.js (houses, a roll-up garage door, lawns of real grass, neighbours);
  - city.js (curtain-wall towers, a block-textured ground, street trees, a cable-stayed bridge, the jam);
  - sky.js (the cloud deck and sky clouds);
  - space.js (the Earth with continents, night lights, an atmosphere rim and stars; Starman in the red 2008 Roadster);
  - cockpit.js (yoke, a live speed screen, your hands, the cabin cut out of the body by clipping planes, the PMREM sky env map, gas plumes, zoom blur).
- **Bugs:**
  - The sky sphere (r = 1500) was left behind when the camera climbed above it, so the background went black. Fixed by moving the sky with the camera.
  - The Earth texture was mostly ocean, and the view sat on the pole. Fixed by increasing the noise contrast, scaling the Earth radius to 900 and rotating it to y 3.4.
  - The cabin was drawn inside the shell. Fixed by clipping the paint with three planes and clipIntersection.
- **QA:** PASSED.
  - The Starman chord masked the hero's body (125–250 Hz). Fixed with a 420 Hz high-pass on the chord.
- **Review:** story arc 5/5, text PASS. Dead-beat WARNs on the clouds (36.8–40) and the end card.
