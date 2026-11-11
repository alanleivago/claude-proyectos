"""Freesound previews (CC0 first, CC BY allowed and credited) for zaw-dog #3. Key from ~/.zshrc (FREESOUND_API_KEY),
never printed. Generic UA, no personal data.  python sound/fs_fetch.py [name ...]"""
import json, os, sys, subprocess, urllib.request, urllib.parse
H = os.path.dirname(os.path.abspath(__file__)); os.chdir(H)
KEY = subprocess.run(['zsh', '-ic', 'echo $FREESOUND_API_KEY'], capture_output=True, text=True).stdout.strip().splitlines()[-1]
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"}
NEEDS = {
    "sob": ("sobbing", 0.5, 10, 8), "woman_cry": ("woman crying sob", 0.5, 6, 6),
    "hum": ("humming", 1.0, 15, 8), "murmur": ("woman talking", 1.0, 10, 6),
    "door_creak": ("door creak open short", 0.3, 3, 6), "magnet_clack": ("magnet", 0.05, 2, 8),
    "door_close": ("door close", 0.3, 3, 6), "door_bang": ("door slam", 0.2, 2, 6),
    "dog_scratch": ("dog scratching", 0.5, 8, 6), "dog_yawn": ("dog yawn", 0.3, 3, 6),
    "dog_lick": ("dog licking", 0.3, 4, 6), "dog_whine": ("dog whine", 0.3, 4, 6),
    "dog_huff": ("dog snort", 0.2, 3, 6), "street_amb": ("suburban street ambience birds", 5, 30, 4),
    "pop_ui": ("pop bubble short", 0.05, 0.6, 6), "blip_down": ("descending blip game", 0.1, 1, 5),
    "claws_wood": ("dog claws wooden floor", 0.5, 6, 6), "footsteps_wood": ("footsteps wooden floor slow", 1, 8, 4),
    "huh": ("man huh surprised", 0.2, 1.5, 6), "hum_m": ("man humming song", 1.0, 20, 8), "hum_tw": ("twinkle twinkle humming", 1.0, 30, 6),
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
