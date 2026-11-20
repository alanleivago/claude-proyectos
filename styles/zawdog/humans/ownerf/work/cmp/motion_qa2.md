## Skinning / geometry review

**Overall:** the rig holds up well. I found no holes, no obvious candy-wrapping and no floating or sinking feet. A few spots are suspect, and at this resolution I can't confirm them with certainty.

### Walk (m_00.4 – m_06.0)
- **m_00.4, hip/upper thigh (viewer-left):** a small pale, angular shard sits where the glove meets the jeans. It looks like a stretched triangle or skin showing through at the hip. Minor, and a hand-into-hip poke is possible.
- **m_01.2 – m_02.8:** clean. The lifted leg in m_01.2 bends at the knee without collapsing, and the boots sit properly under the cuffs. The gloves near the hips (m_01.2 right hand, m_02.0 left hand) come close to the thighs but don't visibly penetrate.
- **m_03.6 – m_06.0, head:** the hair on the tilted head looks blocky and flat on top, but it is a closed shape with no head-through-hair poke. The collar sits cleanly under the jaw.

### Idle / startle (m_06.6 – m_09.2)
- **m_06.6, hip (viewer-left):** the same pale angular patch as in m_00.4, beside the glove. Minor, probably the same hip flap.
- **m_07.0:** clean. The lean and the arm swing are acceptable.
- **m_07.4, shoulders/upper arms:** this is the most extreme pose, with one forearm raised across the face and the other arm thrown out. The sleeve volume near the shoulders looks flattened and a bit stretched, so the puffed sleeves lose their shape. This is a stretch or pinch risk rather than a clear defect. The glove over the face does not visibly clip into the hair.
- **m_07.8, collar/neck:** the light-purple collar flares up and out beside the neck and cheek and crowds the hair. It may be pushing through the hair at the side of the head. It is borderline.
- **m_08.2, m_08.7, m_09.2, collar:** the same collar flare is visible, a raised wing next to the choker and jaw. Hands and arms are clean, and the feet are planted with no floating or sinking.

### T-pose turntable (t_0.3 – t_4.7)
- Shoulders, elbows, wrist cuffs, jeans cuffs and boots are clean from all angles. The back pockets and seat are slightly bulged in the side and back views, but that is modelled shape, not a flap.
- **t_1.6 and t_3.5, hair:** the side tuft by the face is a bit spiky. It is a hair-card shape, not a skinning fault.
- The cut-off hand in t_2.9 is panel cropping, not a defect.

### Not found
- No boots through the jeans cuffs.
- No UV smearing beyond the intended low-res look.
- No visible seams or holes.
- No elbow or knee spikes.
- No foot sliding into the floor.

**Verdict: minor issues.**

### Top 3 fixes
1. **Hip/thigh shard (m_00.4, m_06.6):** check the hip and upper-thigh weights and the glove or hand collision with the jeans. Clean up the stray triangle.
2. **Collar flare (m_07.8, m_08.2–m_09.2):** re-weight the collar to the neck and upper chest. Reduce the flare or pull it in so it doesn't crowd or poke through the hair and jaw.
3. **Shoulder/sleeve volume (m_07.4, m_07.8):** smooth the shoulder and upper-arm weights so the puffed sleeves don't flatten or stretch when the arm is raised or thrown out.