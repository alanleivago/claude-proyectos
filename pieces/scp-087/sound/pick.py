# rank -> find -> realness with earshot for each Freesound folder; writes picks.json
from earshot import api
import json, os
Q = {
 "concrete_stairwell_room_tone": "the quiet room tone of an empty concrete stairwell",
 "light_bulb_buzz_flicker": "an electrical buzz of a flickering light",
 "flashlight_click": "a flashlight switch click",
 "footsteps_concrete_stairs": "footsteps on concrete stairs",
 "running_up_stairs_footsteps": "running footsteps on stairs",
 "boots_walking_linoleum": "footsteps walking on a hard floor",
 "keys_jingle": "keys jingling",
 "child_crying": "a child crying",
 "heavy_breathing_scared": "heavy scared breathing",
 "breath_running": "heavy breathing while running",
 "neck_crack": "a bone cracking",
 "deep_impact_boom": "a deep cinematic impact boom",
 "whoosh": "a fast whoosh",
 "wet_mop_floor": "a wet mop on a floor",
 "mop_bucket_wringer": "a squeaky mop bucket wringer",
 "crows_morning": "crows cawing",
 "water_drip": "water dripping",
 "shakuhachi": "a breathy bamboo flute note",
 "wind_window_draft": "wind whistling through a gap",
 "door_creak_metal": "a metal door creaking",
 "child_sobbing": "a child crying",
 "empty_hallway_ambience": "the quiet room tone of an empty hallway",
 "fluorescent_buzz": "an electrical buzz of a flickering light",
 "metal_door_close": "a heavy metal door closing",
}
out = json.load(open("picks.json")) if os.path.exists("picks.json") else {}
for d, q in Q.items():
    if d in out or not os.path.isdir(f"fs/{d}") or not os.listdir(f"fs/{d}"): continue
    try:
        r = api.rank(f"fs/{d}", q, top=3); b = r["results"][0]; p = b.get("path") or b.get("file")
        f = api.find(p, q, top=1); sg = (f.get("segments") or f.get("results") or [f])[0]
        rl = api.realness(p, start=sg.get("start"), end=sg.get("end"))
        out[d] = dict(file=p, q=q, z=b.get("z"), seg=[sg.get("start"), sg.get("end")], p_real=rl.get("p_real"), verdict=rl.get("verdict"), alt=[(x.get("path") or x.get("file"), x.get("z")) for x in r["results"][1:3]]); print(d, out[d]["file"], out[d]["z"], out[d]["seg"], out[d]["p_real"], flush=True)
    except Exception as e: print(d, "ERR", e, flush=True)
    json.dump(out, open("picks.json", "w"), indent=1)
