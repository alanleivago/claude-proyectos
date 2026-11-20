# Skinning and geometry inspection

I'm working from downscaled contact sheets, so small defects may be missed and some calls are lower confidence. I've noted confidence where it matters.

## Walk clip (m_00.3 – m_05.6)

**Head, hair and collar (most consistent problem)**
- **m_00.3 – m_05.6, face and hair:** A flat beige or grey wedge sits on the side of the face and cheek, in front of the hair side-lock. It looks like skin or scalp showing through the hair card, or a stretched face triangle. It is strongest in m_02.1, m_02.7 and m_03.3 – m_05.6, where the head tilts or turns.
- **m_03.3 – m_05.6, collar:** The light-purple collar tips ride up beside the jaw and chin as pointed flaps. They poke into the hair and cheek instead of lying on the shoulders.
- **m_00.9 – m_02.7, collar:** The collar flares into an uneven wing shape on the shoulders, which suggests weight bleeding from the neck.

**Hands and hips**
- **m_00.3, m_00.9, m_03.3, m_04.0, m_04.8, m_05.6, wrist and hip:** A beige triangle sits at the wrist or glove edge, on or next to the thigh and hip. In m_04.0 and m_04.8 (the hand on the image-left hip) it looks like forearm or hand skin cutting into the jeans. This is a hand-into-thigh poke-through, plus a wrist cuff gap showing a stretched skin triangle.

**Feet**
- No obvious floating or sinking. Boots stay on the rug in all walk frames.

## Idle and startle clip (m_06.3 – m_09.4)

- **m_07.2, wrists and forearms:** The raised arm (image left) has the glove clumped near the shoulder and chest. The forearm is heavily foreshortened and looks collapsed, which is candy-wrapping or an extreme bend at the wrist and elbow.
- **m_07.6, arm and torso:** The forearm and glove cross the chest and belly. The glove appears to sink into the jacket or collar area, and the forearm looks pinched. This is a probable poke-through plus elbow and wrist collapse.
- **m_08.0, shoulder and arm:** The arm swings out with an angular, stretched sleeve and puff at the shoulder (image left). It is mild shoulder and armpit distortion.
- **m_06.3 – m_09.4, face and hair:** The cheek and hair wedges are still visible. With the open-mouth startle expression, the face looks warped and skin shows beside the hair. This is lower confidence because the head is small in these frames.
- **m_07.2, m_07.6 feet:** The stance is wide and one foot is lifted, which fits the jump-back. I can't confirm any sinking or floating.
- **m_08.5 – m_09.4:** These are the settle frames. The only issues are the same face and collar wedges.

## T-pose turntable (t_0.2 – t_4.4)

- **t_0.8, t_3.2 (three-quarter views), hair and face:** Light skin-coloured patches appear at the temple and cheek next to the hair, the same wedge as in the walk.
- **t_2.0, t_2.6, t_3.2 (back views), nape:** A beige patch is visible at the nape and behind the ear under the hair. The scalp or neck is showing through the hair, or the hair is too short at the back.
- **t_2.0, t_2.6, jacket hem:** The jacket hem at the hips has angular corners that stick out slightly, like small flaps. This is low confidence.
- **Collar, all views:** The collar sits slightly stiff and high at the neck, and its corners are pointed (t_0.2, t_4.4). That is consistent with the spikes seen in the walk.
- **Wrists:** The cuff-to-glove transition is acceptable in the T-pose.
- **Boots and jean cuffs:** Clean. No boot poke-through and no floating.
- **Hands at t_0.2, t_4.4:** Cropped by the frame edge, which is a framing issue, not a mesh defect.

## Not found
- No obvious holes or open seams.
- No major UV smearing beyond the PS1 texture look. The stretch on the cheek wedge is the exception.
- No knee, crotch or armpit spikes that I could confirm.

## Verdict
**Must fix**, though not severely. The head, collar and hand-to-hip artifacts are visible in many frames, including the neutral walk.

**Top 3 fixes**
1. **Head, hair and collar:** Close the skin wedge at the cheek and temple, and thicken or extend the hair cards at the temple and nape. Re-weight the collar to the neck and upper-chest bones, and pull its tips down so they don't ride into the jaw and hair.
2. **Wrists and hands at the hips:** Fix the wrist and forearm weights so the beige triangle at the glove cuff disappears. Add clearance or a collision pass for the hand against the thigh in the walk frames m_03.3 – m_05.6.
3. **Extreme arm poses (m_07.2, m_07.6, m_08.0):** Re-weight the elbow and wrist, and split the twist between forearm and wrist to stop the collapse. Check the glove and forearm against the jacket and chest.