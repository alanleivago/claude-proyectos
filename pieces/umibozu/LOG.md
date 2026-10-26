---
type: log
status: active
tags: [umibozu, yokai]
relatedTo: [pieces/behemoth/LOG.md, styles/yokai/STYLE.md]
---
# LOG — umibozu

## 2026-10-26 — first yōkai of the rotation after Behemoth
- Source: @theredarchivesyt "Umibozu [Japanese Folklore]" (351 k); retold with a twist (the bucket). Facts: calm sea, hishaku, bottomless ladle, Gotō/Ukujima (Wikipedia, yokai.jp, Hyakumonogatari).
- Card: 3 Flow variants; kept the print matching the ref design (bald black giant, white eyes, barnacles, ropes, ladle, squid boat).
- Fixes: deck below the hull rim; creature inside the boat → moved off; arm IK to world targets; hand/arm through the camera (34 s, 48 s) → cameras outside the boat; sonar hidden behind the cabin wall and the mast; one shared sonar canvas overwritten by the harbour boats; kasuri clothing (user); bigger ladle/buckets.
- Sound pro: Freesound CC0 picked with earshot + Commons + code. A whale tail stretched to 8.6 s made the goodbye as loud as the payoff → trimmed. Review: story arc 5/5, text PASS, dead beats PASS; loudest 46.7 s after 0.6 s silence; −15.7 LUFS, TP −2.0.
- Round 3 (2026-10-26): root cause of "the inside of the body shows at the waterline": the renderer's logarithmic depth buffer + custom ShaderMaterials (sea) without logdepth chunks → the sea lost depth tests. Turned log depth off (scale is small). Body lathe closed below; skin double-sided. Hook starts fully submerged. Face ovals → brow ridge + dark sockets. Ropes follow the shoulder surface. Man oriented with the boat's tilt (feet on deck), holds the rail, straw hat. Sonar on a console. Ladle handle through the fist along the hand's X axis; water pours through the bottomless cup. Sinks 22 m under. Ending −4 s (71 s). armCheck clean except 0.02 m at 62.0 s. Review: arc 5/5, text PASS, dead beats PASS, −15.1 LUFS, TP −1.9.
