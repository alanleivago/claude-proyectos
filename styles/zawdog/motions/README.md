# zawdog motions: mocap BVH starter library

56 BVH clips (42 CMU in `cmu/`, 14 100STYLE in `100style/`). The files are untrimmed. `index.json` lists them by category (HAPPY, SAD, SCARED, PAIN, RUDE, IDLE, WALK, SIT, POINT, SHRUG) and gives each clip's frames, fps, `suggested_range` (frame indices in the file) and loop flag.
The `kimodo/` folder was made by another session and is not part of this library.

## Sources and licences

| Folder | Source | Licence |
|---|---|---|
| `cmu/` | CMU Graphics Lab Motion Capture Database (mocap.cs.cmu.edu), Bruce Hahne's 2010 MotionBuilder-friendly BVH conversion (cgspeed), via the GitHub mirror una-dinosauria/cmu-mocap | CMU: "free for use in research and commercial projects worldwide". Hahne adds no restrictions (READMEFIRST.txt). |
| `100style/` | 100STYLE (Ian Mason), original BVH files from the per-file Google Drive links on ianxmason.com/100style (Zenodo blocked our network with a 403) | CC BY 4.0 |

`cmu/cmu-mocap-index-text.txt` is the full CMU description index. `100style/Frame_Cuts.csv` gives the official trim ranges, which drop the lead-in frames and the T-poses.

## Credit lines to include in video descriptions or credits

- **CMU:** "The data used in this project was obtained from mocap.cs.cmu.edu. The database was created with funding from NSF EIA-0196217." BVH conversion by Bruce Hahne (cgspeed.com).
- **100STYLE (CC BY 4.0):** "The 100STYLE Dataset - Ian Mason", licensed CC BY 4.0. Cite: I. Mason, S. Starke, T. Komura (2022), "Real-Time Style Modelling of Human Locomotion via Feature-Wise Transformations and Local Motion Phases", Proc. ACM Comput. Graph. Interact. Tech. 5(1).

## Skeletons

- **CMU:** 31 joints. Hips > LHipJoint > LeftUpLeg > LeftLeg > LeftFoot > LeftToeBase. The right leg uses the same names with Right/R. LowerBack > Spine > Spine1 > Neck > Neck1 > Head. Spine1 > LeftShoulder > LeftArm > LeftForeArm > LeftHand > LeftFingerBase > LeftHandIndex1, plus LThumb. The right arm mirrors it.
  - Units: 1 unit is about 5.64 cm, so multiply by 0.0564 to get metres. Standing hip height is 15 to 18.8 units (about 0.85 to 1.06 m).
  - Y up. The character faces +Z.
  - Frame 0 is a T-pose. Motion starts at frame 1.
  - 120 fps (Frame Time 0.0083333).
- **100STYLE:** 23 joints. Hips > Chest > Chest2 > Chest3 > Chest4 > Neck > Head. Chest4 > Left/RightCollar > Shoulder > Elbow > Wrist. Hips > Left/RightHip > Knee > Ankle > Toe.
  - Units: centimetres. Hip height is about 97 cm.
  - Y up. Forward is +Z. The rest pose is a T-pose.
  - 60 fps.
  - The FW clips are whole sessions that curve around the capture volume. Their `suggested_range` is the straightest 3 s segment.
