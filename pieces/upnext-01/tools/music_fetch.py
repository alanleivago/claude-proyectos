"""upnext-01: find REAL recorded music with a licence that allows monetised use (CC0 / CC-BY) for the v2 bed:
lo-fi / soft piano / warm, a little emotional (like DenXjPdN-UE's lo-fi beat, B minor, warm and cozy).
Openverse (license_type=commercial; only cc0 + by are kept, no -sa/-nc/-nd) + Freesound CC0. Each download in its own folder.
out: audio/music_dl/<id>/track.mp3 + audio/music_dl/catalog.json.  usage: python tools/music_fetch.py"""
import json
import os
from pathlib import Path

import requests

OUT = Path(__file__).resolve().parents[1] / 'audio' / 'music_dl'
OV = json.load(open(os.path.expanduser('~/.openverse.json'), encoding='utf-8-sig'))
FS = json.load(open(os.path.expanduser('~/.freesound.json'), encoding='utf-8-sig'))['api_key']
QUERIES = ['lofi piano', 'lo-fi chill', 'lofi hip hop', 'soft piano emotional', 'chill beat warm', 'lofi guitar']


def main():
    OUT.mkdir(parents=True, exist_ok=True); cat = []
    tok = requests.post('https://api.openverse.org/v1/auth_tokens/token/', data=dict(client_id=OV['client_id'], client_secret=OV['client_secret'], grant_type='client_credentials'), timeout=30).json().get('access_token')
    H = {'Authorization': f'Bearer {tok}'} if tok else {}
    seen = set()
    for q in QUERIES:
        r = requests.get('https://api.openverse.org/v1/audio/', params=dict(q=q, license_type='commercial', page_size=20), headers=H, timeout=30)
        for x in r.json().get('results', []):
            lic = (x.get('license') or '').lower(); dur = (x.get('duration') or 0) / 1000
            if lic not in ('cc0', 'by') or dur < 70 or dur > 400 or x['id'] in seen: continue
            seen.add(x['id']); cat.append(dict(src='openverse', id=x['id'], title=x.get('title'), creator=x.get('creator'), license=lic, license_version=x.get('license_version'),
                                               dur=round(dur, 1), url=x.get('url'), landing=x.get('foreign_landing_url'), provider=x.get('provider'), q=q))
        r = requests.get('https://freesound.org/apiv2/search/text/', params=dict(query=q, filter='license:"Creative Commons 0" duration:[70 TO 400]', sort='downloads_desc', page_size=8,
                         fields='id,name,username,duration,previews,license,num_downloads', token=FS), timeout=30)
        for x in r.json().get('results', []):
            k = f"fs{x['id']}"
            if k in seen: continue
            seen.add(k); cat.append(dict(src='freesound', id=k, title=x['name'], creator=x['username'], license='cc0', dur=round(x['duration'], 1), url=x['previews']['preview-hq-mp3'],
                                         landing=f"https://freesound.org/s/{x['id']}/", downloads=x['num_downloads'], q=q))
    for c in cat: print(f"{c['src']:9s} {c['license']:4s} {c['dur']:6.1f}s  {str(c['title'])[:55]:55s} {c['creator']}  [{c['q']}]")
    (OUT / 'catalog.json').write_text(json.dumps(cat, indent=1, ensure_ascii=False), encoding='utf-8')


def download(ids):
    cat = json.loads((OUT / 'catalog.json').read_text(encoding='utf-8'))
    for c in cat:
        if str(c['id']) in ids:
            d = OUT / str(c['id']); d.mkdir(exist_ok=True); fn = d / 'track.mp3'
            if not fn.exists(): a = requests.get(c['url'], timeout=120); a.raise_for_status(); fn.write_bytes(a.content)
            print('got', fn, fn.stat().st_size)


if __name__ == '__main__':
    import sys
    if len(sys.argv) > 2 and sys.argv[1] == 'get': download(sys.argv[2:])
    else: main()
