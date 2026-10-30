# largo: copia de ../../audio/scripts/fs_fetch.py con busquedas nuevas. Freesound CC0 search + HQ preview download: audio/cand/<key>/<id>.mp3 and audio/cand/<key>/meta.json
import json, os, sys, urllib.request, urllib.parse
KEY = json.load(open(os.path.expanduser("~/.freesound.json"), encoding="utf-8-sig"))["api_key"]
OUT = r"F:/Claude Proyectos/pieces/zombie-03-station/largo/audio/cand"
Q = {
 "cough": ("man cough single", 0.3, 2.5),
 "mus_dark": ("dark ambient horror music", 90, 600), "mus_tension": ("tension suspense music", 90, 600),
 "mus_thriller2": ("thriller soundtrack cinematic", 90, 600), "mus_drone": ("horror drone atmosphere", 120, 900),
 "dog_whine": ("dog whine", 0.5, 4), "dog_growl": ("dog growl", 0.5, 5), "generator": ("gas generator running", 5, 60),
 "tape_click": ("tape recorder button", 0.1, 2), "glass_shatter": ("tempered glass shatter", 0.5, 5),
}
def get(url): return json.load(urllib.request.urlopen(url, timeout=30))
ONLY=set(sys.argv[1:])
SFX2 = {
 "vending_glass": ("glass window crack break small", 0.3, 4), "chair_hit": ("metal chair hit impact", 0.2, 3),
 "bars_rattle": ("jail cell bars rattle metal", 0.4, 5), "metal_locker": ("metal locker door open close", 0.3, 4),
 "metal_clang": ("metal clang hit pipe", 0.2, 3), "key_lock": ("key insert turn lock", 0.3, 4), "keys_jingle": ("keys jingle", 0.3, 3),
 "dial_click": ("combination lock dial click", 0.2, 4), "pen_write": ("pen writing on paper", 0.5, 6), "paper_rustle": ("paper rustle fold", 0.3, 4),
 "wrapper": ("candy wrapper crinkle", 0.3, 4), "chips_bag": ("chips bag crinkle", 0.3, 4), "cloth": ("cloth rustle clothes movement", 0.3, 3),
 "yawn": ("woman yawn", 0.6, 4), "breath_heavy": ("heavy breathing monster dark", 1, 8), "whisper": ("whisper breath", 0.4, 4),
 "dog_breath": ("dog panting breathing", 0.5, 5), "dog_sniff": ("dog sniffing", 0.3, 4), "dog_paws": ("dog paws walking floor claws", 0.5, 5),
 "dog_collar": ("dog collar tags jingle", 0.2, 3), "tail_thump": ("dog tail thump floor", 0.1, 3), "toy_squeak": ("dog toy squeak", 0.1, 2),
 "dog_scratch": ("dog scratching door", 0.5, 5), "phone_pickup": ("telephone handset pick up", 0.1, 2), "busy_signal": ("phone busy signal", 1, 6),
 "phone_keys": ("phone keypad button beeps typing", 0.3, 4), "sms": ("text message sent sound", 0.1, 2), "reel_tape": ("reel to reel tape recorder running", 1, 10),
 "elec_hum": ("electrical hum transformer", 2, 20), "room_tone": ("empty room tone hum building", 3, 30), "vending_hum": ("vending machine hum", 2, 30),
 "gulp": ("gulp drinking", 0.2, 2), "water_slosh": ("water slosh bottle", 0.3, 3), "drip": ("water drip single", 0.1, 2),
 "car_tick": ("car engine cooling tick", 1, 8), "gunshot_far": ("distant gunshot", 0.3, 4), "bell_ding": ("bell ding single", 0.3, 4),
 "bench_drag": ("wooden bench drag floor", 0.5, 4), "wood_thud": ("wood thud heavy", 0.1, 2), "mug": ("ceramic mug clink table", 0.1, 2),
 "glass_debris": ("glass shards falling floor", 0.5, 4), "hiss": ("gas hiss steam", 0.5, 4), "bulb_buzz": ("light bulb buzz", 1, 8),
 "door_open": ("door open interior", 0.5, 4), "door_close": ("door close interior", 0.3, 3), "handle_rattle": ("door handle rattle locked", 0.3, 3),
 "phone_ring": ("old telephone ring", 0.5, 4), "power_down": ("power down electricity", 0.5, 4), "generator_pull": ("generator pull start", 0.5, 4),
 "frosted_tap": ("tapping on glass window", 0.2, 3), "heartbeat": ("heartbeat slow", 1, 6), "marker": ("marker on whiteboard", 0.3, 3),
}
if ONLY and 'SFX2' in ONLY: Q = SFX2; ONLY = set()
SFX3 = {"vending_glass": ("glass crack", 0.2, 6), "bars_rattle": ("cage rattle", 0.3, 8), "dial_click": ("safe dial", 0.3, 10),
 "pen_write": ("pen writing", 0.5, 15), "dog_paws": ("dog walking", 0.5, 15), "dog_collar": ("dog collar", 0.2, 6), "phone_pickup": ("phone pick up", 0.2, 5),
 "phone_keys": ("phone keypad", 0.2, 8), "reel_tape": ("tape reel", 1, 20), "car_tick": ("engine ticking", 1, 15), "mug": ("mug", 0.1, 3), "hiss": ("steam hiss", 0.5, 6), "glass_shatter": ("glass shatter", 0.5, 6)}
if ONLY and 'SFX3' in ONLY: Q = SFX3; ONLY = set()
for key, (q, dmin, dmax) in Q.items():
    if ONLY and key not in ONLY: continue
    d = os.path.join(OUT, key); os.makedirs(d, exist_ok=True)
    url = "https://freesound.org/apiv2/search/text/?" + urllib.parse.urlencode({"query": q, "filter": f'license:"Creative Commons 0" duration:[{dmin} TO {dmax}]', "fields": "id,name,license,duration,previews,username,avg_rating,num_downloads", "sort": "score", "page_size": 6, "token": KEY})
    try: r = get(url)
    except Exception as e: print(key, "ERR", e); continue
    meta = []
    for s in [x for x in r["results"] if str(x["id"])+".mp3" not in os.listdir(d)][:4] + [x for x in r["results"] if str(x["id"])+".mp3" in os.listdir(d)][:0]:
        fn = os.path.join(d, f"{s['id']}.mp3")
        if not os.path.exists(fn):
            try: urllib.request.urlretrieve(s["previews"]["preview-hq-mp3"], fn)
            except Exception as e: print("dl err", e); continue
        meta.append(dict(id=s["id"], name=s["name"], user=s["username"], license=s["license"], dur=s["duration"], url=f"https://freesound.org/s/{s['id']}/"))
    old = json.load(open(os.path.join(d, "meta.json"), encoding="utf-8")) if os.path.exists(os.path.join(d, "meta.json")) else []
    ids = {m["id"] for m in meta}; meta = meta + [m for m in old if m["id"] not in ids]
    json.dump(meta, open(os.path.join(d, "meta.json"), "w", encoding="utf-8"), indent=1)
    print(key, len(meta), [m["name"][:28] for m in meta])
