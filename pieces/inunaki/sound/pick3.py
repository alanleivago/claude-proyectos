from earshot import api
import json
P = json.load(open("picks.json"))
for d, q in {"fluorescent_light_flicker": "a fluorescent light flickering and buzzing, electrical clicks", "car_brake_squeak_stop": "a car braking to a stop with squeaky brakes", "car_approaching_arriving": "a car approaching slowly"}.items():
    r = api.rank(f"fs/{d}", q, top=4); print(d, [(x.get("path") or x.get("file")).split("/")[-1][:40] + f" z{x.get('z')}" for x in r["results"]])
    b = r["results"][0]; p = b.get("path") or b.get("file"); f = api.find(p, q, top=3); print(" find", [(round(s.get("start"), 2), round(s.get("end"), 2)) for s in (f.get("segments") or f.get("results"))])
    rl = api.realness(p); P[d] = dict(file=p, z=b.get("z"), p_real=rl.get("p_real"), verdict=rl.get("verdict")); print(" real", rl.get("p_real"))
f = "fs/car_brake_squeak_stop/508901_Car_Arriving_and_Parking_drive_up_short_idle_an.mp3"
import glob; f = glob.glob("fs/car_brake_squeak_stop/508901*")[0]
for q in ("a car braking to a stop", "a car engine idling", "a car door"):
    r = api.find(f, q, top=3); print("508901", q, [(round(s.get("start"), 2), round(s.get("end"), 2), round(s.get("z", 0) or 0, 1)) for s in (r.get("segments") or r.get("results"))])
json.dump(P, open("picks.json", "w"), indent=1)
