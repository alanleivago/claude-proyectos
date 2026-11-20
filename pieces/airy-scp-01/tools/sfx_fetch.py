"""vera-01/02: fetch CC0 foley from Freesound (HQ mp3 previews, filter license = Creative Commons 0) into audio/sfx_dl/<cue>/.
Each download sits in its own folder (untrusted data; only ever decoded by ffmpeg). Writes audio/sfx_dl/catalog.json.
usage: python tools/sfx_fetch.py"""
import json
import os
from pathlib import Path

import requests

OUT = Path(__file__).resolve().parents[1] / 'audio' / 'sfx_dl'
KEY = json.load(open(os.path.expanduser('~/.freesound.json'), encoding='utf-8-sig'))['api_key']
CUES = {   # cue: (query, min s, max s, how many)
    'door_bell': ('shop door bell', 0.4, 6, 4),
    'steps_wood': ('footsteps wooden floor heels', 2, 25, 3),
    'glass_lid': ('glass lid clink', 0.2, 4, 4),
    'plate': ('ceramic plate on table', 0.2, 3, 4),
    'chair': ('chair scrape wooden floor', 0.4, 5, 4),
    'cafe_amb': ('cafe ambience espresso machine', 20, 180, 3),
    'espresso': ('espresso machine steam', 2, 30, 3),
    'whoosh': ('whoosh transition swish', 0.2, 2.5, 4),
    'ding': ('magic ding chime', 0.3, 4, 4),
    'street_night': ('city street night ambience', 10, 120, 3),
    'cloth': ('clothes rustle', 0.3, 3, 3),
    # vera-02
    'rain_window': ('rain window', 20, 300, 3),
    'pour': ('pouring coffee cup', 1, 8, 4),
    'jukebox': ('coin slot', 0.3, 6, 4),
    'needle': ('vinyl record needle drop crackle', 0.5, 8, 3),
    'umbrella': ('umbrella', 0.3, 8, 4),
    'vinyl_seat': ('leather squeak', 0.3, 5, 4),
    'towel': ('towel', 0.2, 5, 4),
    'mug_table': ('mug table', 0.2, 4, 4),
}


def main():
    OUT.mkdir(parents=True, exist_ok=True); cat = {}
    for cue, (q, d0, d1, n) in CUES.items():
        r = requests.get('https://freesound.org/apiv2/search/text/', params=dict(query=q, filter=f'license:"Creative Commons 0" duration:[{d0} TO {d1}]',
                         fields='id,name,license,duration,previews,username,num_downloads,avg_rating', sort='downloads_desc', page_size=n, token=KEY), timeout=30)
        r.raise_for_status(); res = r.json().get('results', [])
        d = OUT / cue; d.mkdir(exist_ok=True); cat[cue] = []
        for x in res:
            fn = d / f"fs{x['id']}.mp3"
            if not fn.exists():
                a = requests.get(x['previews']['preview-hq-mp3'], timeout=60); a.raise_for_status(); fn.write_bytes(a.content)
            cat[cue].append(dict(file=str(fn.relative_to(OUT)), id=x['id'], name=x['name'], user=x['username'], dur=x['duration'], license=x['license'], downloads=x['num_downloads']))
            print(f"{cue:12s} fs{x['id']} {x['duration']:.1f}s  {x['name'][:50]}  ({x['username']}, {x['num_downloads']} dl)")
    (OUT / 'catalog.json').write_text(json.dumps(cat, indent=1, ensure_ascii=False), encoding='utf-8')


if __name__ == '__main__':
    main()
