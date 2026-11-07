"""Freesound previews (CC0 first, CC BY allowed and credited) for zaw-dog #1. Key from ~/.zshrc (FREESOUND_API_KEY),
never printed. Generic UA, no personal data.  python sound/fs_fetch.py [name ...]"""
import json, os, sys, subprocess, urllib.request, urllib.parse
H = os.path.dirname(os.path.abspath(__file__)); os.chdir(H)
KEY = subprocess.run(['zsh', '-ic', 'echo $FREESOUND_API_KEY'], capture_output=True, text=True).stdout.strip().splitlines()[-1]
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"}
NEEDS = {
    "dog_sniff": ("dog sniffing", 0.5, 8, 4), "dog_whimper": ("dog whimper whine", 0.3, 6, 4),
    "tail_thump": ("dog tail wagging thump floor", 0.3, 8, 4), "dog_paws": ("dog claws floor", 0.5, 12, 4),
    "dog_happy": ("dog bark", 0.2, 4, 5), "cloth_flap": ("cloth flap", 0.2, 8, 5),
    "front_door": ("front door open creak", 0.5, 6, 4), "car_away": ("car drive away start", 2, 15, 4),
    "car_arrive": ("car arriving", 2, 20, 5), "car_door": ("car door close", 0.3, 3, 3),
    "pop": ("cartoon pop bubble", 0.05, 1, 4), "clock_tick": ("clock ticking", 2, 15, 3),
    "bag_rustle": ("paper bag", 0.5, 8, 4), "footsteps_in": ("footsteps indoor wood", 1, 10, 3),
    "dog_flop": ("body fall soft", 0.2, 3, 3), "keys": ("keys jingle", 0.3, 4, 3),
    # revision 2: more dog
    "puppy_yip": ("puppy yip", 0.1, 4, 6), "dog_bark_small": ("small dog bark single", 0.1, 3, 6),
    "dog_pant": ("dog panting", 1, 12, 5), "dog_tags": ("dog collar tags jingle", 0.3, 8, 5),
    "dog_claws": ("dog nails wood floor walking", 0.5, 12, 5), "dog_yips": ("happy dog yips excited", 0.5, 10, 5),
    "dog_whimper2": ("puppy whimper", 0.3, 6, 5), "dog_sigh": ("dog sigh", 0.3, 6, 4),
    "puppy_bark": ("puppy bark", 0.1, 4, 8), "dog_yip": ("dog yip", 0.1, 5, 6), "chihuahua": ("chihuahua bark", 0.1, 5, 5),
    "collar": ("dog collar", 0.3, 10, 6), "dog_tags2": ("dog tags jingle", 0.3, 10, 5),
    "dog_walk": ("dog walking floor", 0.5, 15, 6), "dog_excited": ("dog excited", 0.5, 12, 6),
    "dog_breath": ("dog breathing", 1, 15, 4),
    "collar_jingle": ("collar jingle", 0.3, 10, 6), "pet_tags": ("pet tags", 0.3, 10, 5), "dog_shake": ("dog shake collar", 0.5, 8, 5),
}
only = sys.argv[1:]
idx = json.load(open('fs/index.json')) if os.path.exists('fs/index.json') else {}
for name, (q, a, b, n) in NEEDS.items():
    if only and name not in only:
        continue
    url = 'https://freesound.org/apiv2/search/text/?' + urllib.parse.urlencode({'query': q,
          'filter': f'(license:"Creative Commons 0" OR license:"Attribution") duration:[{a} TO {b}]',
          'sort': 'rating_desc', 'fields': 'id,name,duration,previews,username,license,url', 'page_size': n, 'token': KEY})
    try:
        res = json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60))['results']
    except Exception as e:
        print(name, 'ERR', type(e).__name__); continue
    idx[name] = []
    for r in res:
        p = f"fs/{name}_{r['id']}.mp3"
        if not os.path.exists(p):
            req = urllib.request.Request(r['previews']['preview-hq-mp3'], headers=UA)
            open(p, "wb").write(urllib.request.urlopen(req, timeout=60).read())
        idx[name].append({'file': p, 'id': r['id'], 'name': r['name'], 'dur': round(r['duration'], 1), 'by': r['username'],
                          'license': r['license'], 'url': r.get('url', '')})
    print(name, [(x['id'], x['name'][:26], x['dur'], 'CC0' if 'zero' in x['license'] else 'BY') for x in idx[name]], flush=True)
    json.dump(idx, open('fs/index.json', 'w'), indent=1)
