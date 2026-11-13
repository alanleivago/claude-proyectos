"""Freesound previews (CC0 first, CC BY allowed and credited) for zaw-dog #6 (CC0 only). Key from ~/.zshrc (FREESOUND_API_KEY),
never printed. Generic UA, no personal data.  python sound/fs_fetch.py [name ...]"""
import json, os, sys, subprocess, urllib.request, urllib.parse
H = os.path.dirname(os.path.abspath(__file__)); os.chdir(H)
KEY = subprocess.run(['zsh', '-ic', 'echo $FREESOUND_API_KEY'], capture_output=True, text=True).stdout.strip().splitlines()[-1]
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"}
NEEDS = {   # zaw-dog #6: CC0 only
    "gasp": ("gasp male", 0.3, 3, 8), "car_pass": ("car pass by", 2, 8, 6), "car_horn": ("car horn", 0.3, 3, 6),
    "glass_clink": ("test tube glass clink", 0.2, 3, 6), "beep": ("electronic beep short", 0.1, 1.5, 6), "whoosh": ("whoosh", 0.3, 2, 6),
    "yell": ("woman shouting angry", 0.8, 6, 6), "wind": ("winter wind", 3, 20, 5), "snip": ("scissors snip", 0.2, 3, 6),
    "steps_street": ("footsteps sidewalk", 2, 12, 5), "groan": ("man groan frustrated", 0.3, 3, 6), "letters": ("envelope paper", 0.3, 3, 6), "glass2": ("glass clink", 0.2, 2, 6), "groan2": ("sigh man", 0.3, 3, 6),
    "beep2": ("beep", 0.1, 1, 6), "angry2": ("angry shouting muffled", 0.8, 6, 6), "ui_pop": ("pop", 0.05, 0.6, 6),
}
only = sys.argv[1:]
idx = json.load(open('fs/index.json')) if os.path.exists('fs/index.json') else {}
for name, (q, a, b, n) in NEEDS.items():
    if only and name not in only:
        continue
    url = 'https://freesound.org/apiv2/search/text/?' + urllib.parse.urlencode({'query': q,
          'filter': f'license:"Creative Commons 0" duration:[{a} TO {b}]',
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
