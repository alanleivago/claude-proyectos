"""Freesound previews (CC0 first, CC BY allowed and credited) for zaw-dog #4 (CC0 only). Key from ~/.zshrc (FREESOUND_API_KEY),
never printed. Generic UA, no personal data.  python sound/fs_fetch.py [name ...]"""
import json, os, sys, subprocess, urllib.request, urllib.parse
H = os.path.dirname(os.path.abspath(__file__)); os.chdir(H)
KEY = subprocess.run(['zsh', '-ic', 'echo $FREESOUND_API_KEY'], capture_output=True, text=True).stdout.strip().splitlines()[-1]
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"}
NEEDS = {   # zaw-dog #4: CC0 only (second pass: simpler queries)
    "fur_rub": ("fur rubbing", 0.3, 10, 6), "dog_growl2": ("dog growl", 0.3, 5, 6),
    "plastic_tap": ("plastic tap", 0.05, 3, 6), "toy_motor": ("small motor", 0.3, 6, 6), "toy_motor2": ("servo motor", 0.2, 4, 6),
    "soft_thud": ("thud soft", 0.05, 2, 6), "teeth_snap": ("dog bite", 0.1, 3, 6), "teeth_snap2": ("teeth clack", 0.05, 2, 6),
    "screen_slide": ("wood creak", 0.2, 3, 6), "toy_bark": ("toy dog", 0.2, 4, 6), "toy_bark2": ("small dog bark", 0.1, 2, 6),
    "nudge": ("cloth rustle short", 0.1, 1.5, 6), "sofa_squeak": ("couch", 0.2, 3, 6),
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
