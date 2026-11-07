"""Freesound previews (CC0 first, CC BY allowed and credited) for zaw-dog #2. Key from ~/.zshrc (FREESOUND_API_KEY),
never printed. Generic UA, no personal data.  python sound/fs_fetch.py [name ...]"""
import json, os, sys, subprocess, urllib.request, urllib.parse
H = os.path.dirname(os.path.abspath(__file__)); os.chdir(H)
KEY = subprocess.run(['zsh', '-ic', 'echo $FREESOUND_API_KEY'], capture_output=True, text=True).stdout.strip().splitlines()[-1]
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"}
NEEDS = {
    "hero_bark": ("dog bark single", 0.2, 3, 8), "dog_woof": ("medium dog woof", 0.2, 3, 6),
    "ball_bounce": ("tennis ball bounce", 0.2, 4, 6), "squeak_toy": ("dog squeaky toy", 0.2, 3, 6),
    "cup_knock": ("plastic cup fall", 0.1, 2, 6), "cup_set": ("plastic cup table put down", 0.1, 2, 5),
    "box_rattle": ("plastic container lid", 0.3, 4, 6), "dog_eat": ("dog eating treat crunch", 0.5, 6, 6),
    "dog_huff": ("dog huff snort", 0.2, 3, 6), "dog_skid": ("dog running floor claws", 0.5, 6, 6),
    "whoosh_arm": ("arm swing whoosh", 0.1, 1.5, 5), "footsteps_kitchen": ("footsteps tile", 0.5, 6, 4),
    "crouch_cloth": ("clothes rustle", 0.3, 3, 4),
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
