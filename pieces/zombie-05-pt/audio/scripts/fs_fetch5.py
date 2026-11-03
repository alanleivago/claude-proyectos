# Freesound CC0 (busqueda + preview HQ) para el ep5 (P.T.) -> audio/cand/<key>/<id>.mp3 + meta.json. python fs_fetch5.py [keys]
import json, os, sys, urllib.request, urllib.parse
KEY = json.load(open(os.path.expanduser("~/.freesound.json"), encoding="utf-8-sig"))["api_key"]
OUT = r"F:/Claude Proyectos/pieces/zombie-05-pt/audio/cand"
Q = {"steps_wood": ("footsteps wooden floor walking", 3, 30), "breath": ("heavy breathing close", 2, 15), "breath_creepy": ("creepy breathing exhale", 1, 10),
     "radio_static": ("radio static noise", 3, 30), "door_creak": ("door creak open", 1, 8), "whoosh": ("whoosh swish fast", 0.2, 2),
     "room_tone": ("room tone", 20, 300), "house_creak": ("wooden house creak", 1, 10), "stinger": ("horror stinger hit", 1, 8),
     "mus_horror": ("dark horror ambient music", 70, 400), "crt_on": ("old tv turn on", 0.5, 8), "shutter": ("camera shutter click", 0.1, 2),
     "hook_drone": ("dark drone", 8, 60), "hook_strings": ("string riser horror", 3, 30), "hook_musicbox": ("creepy music box", 5, 40)}   # v5: capa de musica de terror para el gancho
only = set(sys.argv[1:])
for key, (q, dmin, dmax) in Q.items():
    if only and key not in only: continue
    d = os.path.join(OUT, key); os.makedirs(d, exist_ok=True)
    url = "https://freesound.org/apiv2/search/text/?" + urllib.parse.urlencode({"query": q, "filter": f'license:"Creative Commons 0" duration:[{dmin} TO {dmax}]', "fields": "id,name,license,duration,previews,username", "sort": "score", "page_size": 6, "token": KEY})
    try: r = json.load(urllib.request.urlopen(url, timeout=30))
    except Exception as e: print(key, "ERR", e); continue
    meta = []
    for s in r["results"][:5]:
        fn = os.path.join(d, f"{s['id']}.mp3")
        if not os.path.exists(fn):
            try: urllib.request.urlretrieve(s["previews"]["preview-hq-mp3"], fn)
            except Exception as e: print("dl err", e); continue
        meta.append(dict(id=s["id"], name=s["name"], user=s["username"], license=s["license"], dur=s["duration"], url=f"https://freesound.org/s/{s['id']}/"))
    json.dump(meta, open(os.path.join(d, "meta.json"), "w", encoding="utf-8"), indent=1)
    print(key, len(meta), [m["name"][:30] for m in meta])
