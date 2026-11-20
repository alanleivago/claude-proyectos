# Skinning / geometry QA

I could only judge what is visible at this resolution. Several frames crop the feet, so some checks are impossible there. I have marked confidence on each item and left out anything I couldn't see.

## Findings

| Frame | Area | Defect | Confidence |
|---|---|---|---|
| m_00.4 | Right hip/upper thigh (viewer's left, beside the fist) | Small light, sharp-edged patch on the jeans. It could be a thigh/hip triangle poking out, or a texture seam. | Low–medium |
| m_04.4, m_05.2, m_06.0 | Collar at neck, with head tilted | The lavender collar is a stiff, oversized wing that sticks out past the neck and shoulder line. It looks like a flap rather than cloth following the neck. No clear collar-through-hair clipping. | Low (minor) |
| m_07.8 | Collar and left shoulder (viewer's left) | The collar wing on the turned head is exaggerated and spiky next to the pinched shoulder/sleeve. | Low |
| m_07.8 | Forearm folded across the belly (viewer's left arm) | The wrist and glove look slightly pinched. It is not a full candy-wrap, but it is worth checking at 1:1. | Low |
| m_07.4 | Raised arm across the face | The forearm and glove cover the face. This is pose occlusion, not poke-through. The sleeve cuff looks stretched at the bent elbow, which is the most deformed pose in the set. | Low |
| m_03.6 | Hair, head turned | The hair fringe and side lock separate into a stepped shape on the camera-left side. This looks like hair-card layering, not a hole. | Low |

## Checked and clean
- **T-pose turntable (t_0.3 to t_4.7):** no armpit flaps, no crotch or hip spikes, no knee or elbow collapse. Jacket back, jeans seat and cuffs are clean, with no boots through the cuffs. Hands and wrists are intact at all angles.
- **Texture:** no stretched or smeared UVs beyond the intended low-res look, and no obvious holes or seams.
- **Hair and head:** no head through hair, and no collar through the face or hair.
- **Walk and idle (m_00.4 to m_06.6):** no armpit or shoulder spikes, no candy-wrapping at knees, and the raised leg in m_01.2 bends cleanly.
- **Startle (m_07.0, m_08.2 to m_09.2):** jacket sleeves and puffed shoulders deform without spikes.

## Not assessable
- **Foot contact:** feet are cropped in m_02.0, m_02.8, m_03.6, m_07.4 and m_07.8. In m_07.0 the feet are airborne, which fits the jump.
- **T-pose edge frames:** hands in t_0.3, t_2.9 and t_4.7 are cut by the panel edge. This is a framing issue, not a mesh defect.

## Verdict
**Minor issues.** The mesh and skinning are essentially clean, and the problems are cosmetic and low-confidence.

## Top 3 fixes
1. **Collar:** reduce its stiffness and outward flare, or re-weight it to the neck and upper-chest bones, so it doesn't wing out in head-tilt and startle frames (m_04.4 to m_06.0, m_07.8).
2. **Right hip/thigh patch (m_00.4):** inspect at full resolution for a stray triangle or UV seam, and fix the weights or the seam.
3. **Wrist and elbow weights in the startle (m_07.4, m_07.8):** check the folded-arm and raised-arm poses at full size and smooth the weights if any pinching shows. Also reframe the cropped feet so foot contact can be verified.