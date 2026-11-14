# ep8: elige con earshot (api.rank) el mejor candidato CC0 de cada carpeta cand/<key> -> ../picks8.json. python rank8.py
import json, os, sys, glob
sys.path.insert(0, r"F:/earshot")
from earshot import api
H = os.path.dirname(os.path.abspath(__file__)) + "/.."
DESC = {
 "cow_moo": "a cow mooing once, close", "cow_herd": "a herd of cows mooing on a farm", "chicken_cluck": "hens clucking in a farmyard", "chicken_alarm": "a frightened hen squawking loudly",
 "rooster": "a rooster crowing", "dog_bark": "a dog barking once", "farm_day": "quiet countryside daytime ambience with birds and light wind", "crickets": "crickets chirping at night in the countryside",
 "wind": "gentle wind blowing over an open field", "tap_run": "water running from a kitchen faucet", "tub_fill": "a bathtub filling with water from the tap", "jug_fill": "water pouring into a plastic jug",
 "chain": "a heavy metal chain rattling", "gate_metal": "a metal gate creaking and clanging shut", "truck_idle": "a pickup truck engine idling", "traffic_jam": "a traffic jam with car horns honking",
 "phone_alert": "a smartphone alert notification sound", "phone_vibrate": "a phone vibrating on a table", "barn_door": "a heavy wooden sliding barn door rolling", "gravel_steps": "footsteps walking on gravel",
 "drill": "a cordless drill driving a screw", "fridge_stop": "a refrigerator humming", "power_flicker": "electric buzzing of a flickering light", "corn_rustle": "dry leaves rustling in a field",
 "hooves": "cattle hooves walking", "moo_far": "a cow mooing in the distance", "owl": "an owl hooting at night", "keys_hook": "a bunch of keys jingling", "porch_creak": "an old wooden floorboard creaking",
 "coffee_sip": "a person sipping hot coffee",
}
out = json.load(open(H + "/picks8.json", encoding="utf-8")) if os.path.exists(H + "/picks8.json") else {}
only = set(sys.argv[1:])
for d in sorted(glob.glob(H + "/cand/*/")):
    k = os.path.basename(d.rstrip("/\\"))
    if k.startswith("mus_") or k not in DESC or not glob.glob(d + "*.mp3") or (only and k not in only): continue
    r = api.rank(d, DESC[k], top=3); best = r["results"][0]
    meta = {str(m["id"]): m for m in json.load(open(d + "meta.json", encoding="utf-8"))}; m = meta.get(os.path.basename(best["path"]).split(".")[0], {})
    out[k] = dict(file=os.path.relpath(best["path"], H).replace("\\", "/"), z=best["z"], verdict=best["verdict"], name=m.get("name"), user=m.get("user"), url=m.get("url"))
    print(f"{k:14s} z{best['z']:+.2f} {best['verdict']:9s} {str(m.get('name', ''))[:44]}", flush=True)
json.dump(out, open(H + "/picks8.json", "w", encoding="utf-8"), indent=1, ensure_ascii=False)
