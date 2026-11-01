"""Fetch Freesound recordings for the coma film: read each sound's API record (licence, author, title, preview),
reuse the file from another piece when it is already downloaded (same id), else download the HQ ogg preview.
Writes audio/assets/manifests/<cat>.json and the agent fields of audit.json. Usage: fetch.py <root> <spec.json>
spec: [[id, cat, need], ...]"""
import json, os, re, sys, glob, shutil, time, urllib.request, datetime
ROOT, SPEC = sys.argv[1], sys.argv[2]
K = json.load(open(os.path.expanduser('~/.freesound.json'), encoding='utf-8-sig'))['api_key']
LIC = {'http://creativecommons.org/publicdomain/zero/1.0/': ('CC0 1.0', 'https://creativecommons.org/publicdomain/zero/1.0/', 'Creative Commons 0'),
       'https://creativecommons.org/publicdomain/zero/1.0/': ('CC0 1.0', 'https://creativecommons.org/publicdomain/zero/1.0/', 'Creative Commons 0'),
       'https://creativecommons.org/licenses/by/4.0/': ('CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/', 'Attribution 4.0'),
       'http://creativecommons.org/licenses/by/3.0/': ('CC BY 3.0', 'https://creativecommons.org/licenses/by/3.0/', 'Attribution 3.0'),
       'https://creativecommons.org/licenses/by/3.0/': ('CC BY 3.0', 'https://creativecommons.org/licenses/by/3.0/', 'Attribution 3.0')}
MD = os.path.join(ROOT, 'audio/assets/manifests')
def load(p, d): return json.load(open(p, encoding='utf-8')) if os.path.exists(p) else d
audit = load(os.path.join(MD, 'audit.json'), [])
today = datetime.date.today().isoformat()
for sid, cat, need in json.load(open(SPEC)):
    mp = os.path.join(MD, f'{cat}.json'); man = load(mp, [])
    if any(e['id'] == f'fs-{sid}' for e in man): continue
    r = json.load(urllib.request.urlopen(f'https://freesound.org/apiv2/sounds/{sid}/?token={K}&fields=id,name,username,license,previews,duration,url', timeout=30))
    if r['license'] not in LIC: print('SKIP licence', sid, r['license']); continue
    lic, lurl, lname = LIC[r['license']]
    slug = re.sub(r'[^a-z0-9]+', '-', os.path.splitext(r['name'])[0].lower()).strip('-')[:40].strip('-')
    dl = r['previews']['preview-hq-ogg']
    loc = [p for p in glob.glob(os.path.join(ROOT, '..', '*', 'audio', 'assets', '*', f'fs-{sid}_*.ogg')) if os.path.abspath(p).find(os.path.abspath(ROOT)) < 0]
    rel = f'audio/assets/{cat}/fs-{sid}_{slug}.ogg'; dst = os.path.join(ROOT, rel)
    if loc: shutil.copyfile(loc[0], dst); how = f'copied from {os.path.relpath(loc[0], os.path.join(ROOT, ".."))} (same Freesound id, same preview)'
    else: urllib.request.urlretrieve(dl, dst); how = 'downloaded'; time.sleep(1.0)
    page = r['url']; att = None if lic.startswith('CC0') else f'"{r["name"]}" by {r["username"]} ({page}), licensed under {lic} ({lurl})'
    man.append({'id': f'fs-{sid}', 'category': cat, 'file': rel, 'title': r['name'], 'author': r['username'], 'source': 'freesound', 'page_url': page,
                'download_url': dl, 'license': lic, 'license_url': lurl, 'attribution': att, 'need': need, 'rank': 1, 'best_segment': None,
                'notes': f'{how}. Found by Freesound text search (CC0/CC BY filter), chosen with earshot rank/describe; realness checked with earshot.',
                'analysis': {'duration': r['duration']}, 'used': True})
    json.dump(man, open(mp, 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    audit = [a for a in audit if a.get('id') != f'fs-{sid}']
    audit.append({'id': f'fs-{sid}', 'file': rel, 'licence_seen': f"Freesound sound record {page} (API v2 sound instance, read {today}): licence '{lname}' -> {lurl}; author '{r['username']}', title '{r['name']}'; preview-hq-ogg {dl} matches download_url",
                  'licence_confirmed': True, 'agent_notes': [how]})
    json.dump(audit, open(os.path.join(MD, 'audit.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    print('ok', sid, cat, need, lic, round(r['duration'], 1), rel, how[:10])
