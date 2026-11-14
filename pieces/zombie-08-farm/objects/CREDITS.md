# ep8 farm props: sources

Photos: Google Flow (Nano Banana 2.1) through the srz-google-flow-mcp MCP, account lyrics33231363, generated 2026-11-04. The originals are in `photos/<name>/`, the cutouts in `photos/_cut/`.
Every prompt ends with: "..., isolated on a plain flat pure white background, no shadow, no other objects, even studio lighting, whole object in frame".

| prop | photo(s) / prompt start | how it was built |
|---|---|---|
| generator | front: "product photo, straight front view (orthographic look), single open-frame portable gas generator, yellow tubular steel frame, engine, fuel tank on top, outlet panel, worn and used with scuffs and dirt"; side: "straight side view from the short end ... recoil starter side" | Box with alpha-cut photo faces (open frame) plus a solid tank and engine core cropped from the same photos. Top texture painted in code. |
| jerrycan | "straight front view, single red metal jerry can fuel can (5 gallon, military style with three handles and spout cap), worn and used with scratches and chipped paint" | Contour by rows extruded 0.165 m, with alpha (the handle hole shows through) |
| bucket | reused `zombie-07-saferoom/engine/models/bucket.glb` (photo-based, from ep6) | not rebuilt |
| handpump | "straight side view, single old cast-iron farm well hand pump (pitcher pump with long handle and spout) mounted on a short weathered wooden post, rusty dark green paint, worn and used" | Post: box. Barrel: 10-sided loft. Spout and handle: strips extruded by rows from the photo. `pump_handle` node pivots at the bolt. The concrete pad (`well_pad`) is modeled in code. |
| padlock | "straight front view, single large heavy brass padlock with steel shackle closed, worn and used with scratches and tarnish" | Body: box with the photo. `shackle` node: a tube in code, sized from the photo, with its origin at the top of the body. |
| chain | none | Modeled in code: 14 oval links `link_00`..`link_13` with a painted steel texture |
| pickup | side: "straight side view from the left (perfect profile), single old 1990s American full-size pickup truck, regular cab, long bed, faded red paint, worn and used with rust spots and dents, chrome bumpers"; front: "straight front view (perfectly centered head-on) ... chrome grille and bumper"; back: "straight rear view (perfectly centered from behind) ... tailgate closed ... chrome rear bumper" | Side profile extruded by columns (the cab roof narrows). Open bed and tailgate. Front and back photos projected onto the faces. Wheels `wheel_fl/fr/rl/rr` are separate nodes, with their origin at the axle. The front photo shows a Chevrolet bowtie on the grille. |
| haybale | front: "straight front view of the long side, single small rectangular square hay bale tied with two orange twine strings, golden dry hay"; end: "straight end view (showing the cut square end face) ..." | Box with front and end photos |
| haybale_round | "straight view of the flat circular end face, single large round hay bale with spiral rolled hay, golden dry hay" | 12-sided cylinder lying on its side. The curved surface reuses the square-bale texture. |
| feedsack | "straight front view, single full 50 lb woven polypropylene livestock feed sack standing upright, stitched top seam, plain generic farm feed label with simple green and red print, worn and dusty" | 10-sided loft by rows with an elliptical section |
| phone | reused `zombie-07-saferoom/engine/models/phone.glb` | Screen = mesh `screen`, material `screen` |

Pipeline: `tools/prep_ep8.py` (cutouts, textures of 128 px or less with 32 colors, rows) -> `blender -b -P tools/build_ep8.py [-- names]` -> `tools/compare_ep8.py`.
