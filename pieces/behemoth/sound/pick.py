from earshot import api
import json
Q = {
 "heavy_rain_car_roof_inside": "heavy rain drumming on a car roof, heard from inside the car",
 "thunder_rumble_distant": "a long low rolling thunder rumble far away",
 "monster_growl_deep": "a huge deep monster growl, slow and resonant",
 "rockslide_falling_rocks": "rocks tumbling and crashing down a slope",
 "giant_footstep_impact": "a single enormous heavy footstep impact with a low boom",
 "old_truck_engine": "an old pickup truck engine running steadily",
 "wet_flesh_crack": "a wet cracking tearing of flesh and bone",
}
out = {}
for d, q in Q.items():
    r = api.rank(f"fs/{d}", q, top=3); print(type(r), str(r)[:300]) if d == "heavy_rain_car_roof_inside" else None
    best = r["results"][0] if "results" in r else r[0]
    path = best.get("path") or best.get("file")
    f = api.find(path, q, top=1)
    seg = (f.get("segments") or f.get("results") or [f])[0]
    rl = api.realness(path, start=seg.get("start"), end=seg.get("end"))
    out[d] = dict(file=path, z=best.get("z"), seg=[seg.get("start"), seg.get("end")], kind=seg.get("kind"), p_real=rl.get("p_real"), verdict=rl.get("verdict"))
    print(d, json.dumps(out[d]))
json.dump(out, open("picks.json", "w"), indent=1)
