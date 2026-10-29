---
type: qa
status: done
tags: [papel, qa]
relatedTo: [pieces/papel]
---
# papel: visual QA before export

I rendered stills every 0.5 s over 0–70 s (offsets .25/.75), twice: once before the fixes and once after. I tiled every cut (96, 240, 336, 456, 600, 696, 792, 912, 1056, 1152, 1272, 1368, 1476, 1488, 1584, 1632), checked the problem times at 0.4–0.5 scale and timed frames with tile.mjs. Every render was deterministic.

## Fixed
| time | issue | fix (file) |
|---|---|---|
| 4.1–4.6 | the sheet's shadow from the desk lamp was a blotchy "leopard" pattern (VSM spot shadow) | `spot.shadow.radius = 8; blurSamples = 16` (studio.js stuDesk) |
| 10–14 | the woman stood 0.9 m behind the column's depth, so she looked much shorter than it | longer lens from further back (fov 30). She stops beside the column at x 0.45, z −1.0 and stays until the cut, because walking out crossed the HUD (studio.js tall) |
| 14.0+ | **bug**: an inline comment had swallowed `stuInside / sheet.pose / stuHide` in the ceiling shot, so in a sequential export the woman's head filled 14.0–14.x | code restored (studio.js ceiling) |
| 16.2–16.5 | upper 60 % of the frame was empty sky | key 16.45 elevation −14° → −5°, so the roof, the room and debris now fill the frame (studio.js STU_CK) |
| 17.4–19 | heavy peach veil at 18.5 | city haze clears over 17.4–18.6 (`uHaze + 22000·ss`) (studio.js ceiling) |
| 19.0 | the studio's thin line became a fat glowing beam at the cut | the beam glow ramps 0.25 → 1 over 19.0–19.9 (ascent.js city) |
| 25–29 | the cloud sea read as snowy mountains, and the volcano gaps showed as red-brown stripes (one crossed the caption at 27) | softer normals (0.55 toward up), less fine detail, Popo/Izta gaps removed (ascent.js ascentDeck) |
| 29.0 | stubby, fat beam at the cut to orbit | glow ramps 0.3 → 1 over 29.0–29.8 (ascent.js space) |
| 24.3–25.3, 42.7–43.3, 47.8, 50.2, 58.2 | colLabel avoided the HUD only for x < 430, but the GROSOR value runs to x ≈ 700 ('… millones de años luz'), so POPOCATÉPETL, LA LUNA, PRÓXIMA and ANDRÓMEDA landed on or right under it | the HUD's right edge is measured from fmtLen; labels in that column move above y 585 or below y 990 (column.js colLabel) |
| 46.0–46.8 | the Sun left the frame as the caption named it, leaving the frame almost black | cosPull gains `dl`, a delay before the turn to dirB. The sun shot uses 1.0 s, so the Sun stays beside the column. Orbits fade in earlier (cosmos.js) |
| 57.4–57.8 | the fold-88 swept sector washed half the frame | cosBeam takes `fan`; Andromeda uses 0.3 (cosmos.js) |
| 59–61.4 | the long GROSOR line ran across the beam | the end target is offset (`TcB.x = −0.22·L`), so the beam sits right of the HUD (cosmos.js cosAndCam) |
| 62–66 | the beam was a short spike out of a sphere centred under the HUD, and the HUD text crossed the sphere | the beam rises from the sphere's bottom pole through the whole sphere and past it, with the flare at the paper's tip. The sphere sits upper right, clear of the HUD. The label is on the left limb (cosmos.js universe) |
| 66–68 | busy, aliasing night city behind the record wad | night haze `uHaze = 1200` makes the city recede (studio.js record) |

## Verified OK
- The text never overlaps the HUD or the caption band after these fixes. 'LA TIERRA' at 35.5 sits above the caption. 'AVIONES COMERCIALES' at 27 is below the HUD.
- 61.5–62.0 is pure black, 62.0 is the white hit, 66–68 is the record shot and 68–70 is the card.
- Cuts are continuous at 33, 48 and 53 (same stage). At 38 (Earth → Moon) the column stays centred.

## Remaining (not fixed)
- Performance: studio frames run 1.25–1.35 s steady and the ceiling shot around 16 s reaches about 1.49 s, so there is little headroom. The first frame after a jump (shader compile) takes 2–2.3 s. That cost is paid only once in a sequential export.
- The HUD's dark feather (kit pvFeather) reads as a grey smudge over bright skies from 10 to 29 s. It is the kit style and I left it unchanged.
- At 44.0, in the Sun close-up, the column is only a small glowing fold shape at the bottom left. This is a storyboard choice.
- 9.25: the desk lamp's shade sits behind the HUD. It is dark, so the text stays readable.
- 62–66: the lower half under the HUD is empty black with the caption.
