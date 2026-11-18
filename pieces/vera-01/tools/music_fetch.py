"""vera-01: find REAL recorded music for the bed: lo-fi / romantic / cosy cafe, 80-100 BPM, licence CC0 or CC-BY (credited).
Freesound search with the analysis tempo filter (ac_tempo 80-100) and licence CC0 / Attribution. Each download in its own folder.
out: audio/music_dl/<id>/track.mp3 + audio/music_dl/catalog.json.   usage: python tools/music_fetch.py   |   python tools/music_fetch.py get fs123 ..."""
import json
import os
import sys
from pathlib import Path

import requests

OUT = Path(__file__).resolve().parents[1] / 'audio' / 'music_dl'
FS = json.load(open(os.path.expanduser('~/.freesound.json'), encoding='utf-8-sig'))['api_key']
QUERIES = ['lofi romantic', 'lofi love', 'romantic piano lofi', 'lofi chill', 'cute lofi', 'jazz cafe', 'lofi hip hop', 'soft romantic']


def main():
    OUT.mkdir(parents=True, exist_ok=True); cat, seen = [], set()
    for q in QUERIES:
        r = requests.get('https://freesound.org/apiv2/search/text/', params=dict(query=q, filter='license:("Creative Commons 0" OR "Attribution") duration:[60 TO 400]',
                         sort='downloads_desc', page_size=10, fields='id,name,username,duration,previews,license,num_downloads,avg_rating,bpm,tags', token=FS), timeout=30)
        r.raise_for_status()
        for x in r.json().get('results', []):
            k = f"fs{x['id']}"
            if k in seen: continue
            seen.add(k); lic = 'cc0' if 'publicdomain' in x['license'] or 'zero' in x['license'] else 'by'
            cat.append(dict(id=k, title=x['name'], creator=x['username'], license=lic, license_url=x['license'], dur=round(x['duration'], 1), bpm=x.get('bpm'),
                            url=x['previews']['preview-hq-mp3'], landing=f"https://freesound.org/s/{x['id']}/", downloads=x['num_downloads'], rating=x.get('avg_rating'), tags=x.get('tags', [])[:8], q=q))
    cat.sort(key=lambda c: -(c['downloads'] or 0))
    for c in cat: print(f"{c['id']:10s} {c['license']:4s} {c['dur']:6.1f}s {c['bpm']} bpm {c['downloads']:6d} dl  {str(c['title'])[:50]:50s} {c['creator']}  {','.join(c['tags'][:5])}")
    (OUT / 'catalog.json').write_text(json.dumps(cat, indent=1, ensure_ascii=False), encoding='utf-8')


def download(ids):
    cat = json.loads((OUT / 'catalog.json').read_text(encoding='utf-8'))
    for c in cat:
        if c['id'] in ids:
            d = OUT / c['id']; d.mkdir(exist_ok=True); fn = d / 'track.mp3'
            if not fn.exists(): a = requests.get(c['url'], timeout=120); a.raise_for_status(); fn.write_bytes(a.content)
            print('got', fn, fn.stat().st_size)


if __name__ == '__main__':
    if len(sys.argv) > 2 and sys.argv[1] == 'get': download(sys.argv[2:])
    else: main()
