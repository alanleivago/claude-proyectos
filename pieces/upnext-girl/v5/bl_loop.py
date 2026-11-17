import subprocess, time
V5 = r"F:/Claude Proyectos/pieces/upnext-girl/v5/"
exec(open(V5 + "bl_pieces.py").read()); exec(open(V5 + "bl_posefit.py").read()); exec(open(V5 + "bl_io.py").read())
FIT = "LegUpper.L,LegLower.L,Boot.L,Foot.L,LegUpper.R,LegLower.R,Boot.R,Foot.R,UpperArm.L,Forearm.L,Hand.L,UpperArm.R,Forearm.R,Hand.R,Skirt,Torso,Neck"


def cycle(pose_time=40, step_rot=3, step_loc=0.08, pieces=FIT):
    t = time.time(); r = []
    while time.time() - t < pose_time: r.append(fit_round(step_rot=step_rot, step_loc=step_loc, tmax=pose_time))
    st = json.load(open(V5 + "pose_hip.json")); apply(st); export_state("loop")
    out = subprocess.run(["python", "ringfit.py", "loop", "hull_hip.obj", pieces], cwd=V5, capture_output=True, text=True)
    materialize(); s = score(st)
    return r[-1], round(s, 4), out.stderr[-300:]
