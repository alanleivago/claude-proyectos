"""upnext-01: fetch CC0 foley from Freesound (HQ mp3 previews, filter license = Creative Commons 0) into audio/sfx_dl/<cue>/.
Each download sits in its own folder (untrusted data; only ever decoded by ffmpeg). Writes audio/sfx_dl/catalog.json.
usage: python tools/sfx_fetch.py"""
import json
import os
from pathlib import Path

import requests

OUT = Path(__file__).resolve().parents[1] / 'audio' / 'sfx_dl'
KEY = json.load(open(os.path.expanduser('~/.freesound.json'), encoding='utf-8-sig'))['api_key']
CUES = {   # cue: (query, min s, max s, how many)
    'phone_tap': ('phone screen tap', 0.05, 1.5, 3),
    'light_switch': ('light switch click', 0.1, 1.5, 2),
    'sheets': ('bed sheets rustle', 0.8, 6, 3),
    'bed_creak': ('bed creak', 0.3, 5, 3),
    'steps_wood': ('footsteps wooden floor boots', 2, 20, 3),
    'steps_small': ('footsteps tiptoe', 0.5, 15, 3),
    'door_open': ('door creak open', 0.8, 6, 3),
    'alarm': ('alarm clock beeping', 1, 15, 3),
    'phone_down': ('phone table', 0.1, 3, 3),
    'thud': ('body fall', 0.2, 3, 3),
    'crickets': ('crickets night', 6, 60, 3),
    'sigh_puff': ('puff air', 0.1, 2, 3),
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
