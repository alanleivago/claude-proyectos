from earshot import api
import json, os
Q = {
 "rain_tin_roof": "heavy rain drumming on a metal roof",
 "rain_window": "rain hitting a window pane, heard from inside a room",
 "classroom_ambience_quiet": "a quiet room tone, distant murmur",
 "chalk": "chalk writing on a blackboard, tapping and scratching",
 "chalk_writing_blackboard": "chalk writing on a blackboard, tapping and scratching",
 "clock_ticking": "a mechanical wall clock ticking",
 "pendulum_clock_tick_tock": "a pendulum clock tick tock",
 "wooden_floor_creak": "a creaking wooden floorboard",
 "creak_wood": "a slow creak of old wood",
 "heavy_breathing_wet": "heavy slow breathing, close",
 "neck_crack_bones": "a bone cracking, a neck crack",
 "bone_crack": "a bone cracking, a neck crack",
 "hair_rustle_fabric": "fabric rustling",
 "shoe": "a shoe sliding on a wooden floor",
 "school_bell": "a school bell chime, ding dong melody",
 "westminster_chimes": "a clock chime melody, westminster",
 "screech_chalkboard": "a high scraping screech",
 "gasp_scared": "a short frightened gasp",
 "wind_empty_building": "wind howling through an empty building",
}
out = json.load(open("picks.json")) if os.path.exists("picks.json") else {}
for d, q in Q.items():
    if not os.path.isdir(f"fs/{d}") or d in out: continue
    try:
        r = api.rank(f"fs/{d}", q, top=3); b = r["results"][0]; p = b.get("path") or b.get("file")
        f = api.find(p, q, top=1); sg = (f.get("segments") or f.get("results") or [f])[0]
        rl = api.realness(p, start=sg.get("start"), end=sg.get("end"))
        out[d] = dict(file=p, z=b.get("z"), seg=[sg.get("start"), sg.get("end")], p_real=rl.get("p_real"), verdict=rl.get("verdict"), alts=[x.get("path") or x.get("file") for x in r["results"][1:3]]); print(d, json.dumps(out[d]), flush=True)
    except Exception as e: print(d, "ERR", e, flush=True)
    json.dump(out, open("picks.json", "w"), indent=1)
