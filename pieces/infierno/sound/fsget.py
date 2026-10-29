# fsget.py id name: download the HQ mp3 preview of a Freesound sound into lib/<name>-<id>.mp3 (+ .json with its credit)
import json, os, sys, urllib.request
K = os.environ['FREESOUND_API_KEY']; i, name = sys.argv[1], sys.argv[2]
s = json.load(urllib.request.urlopen(f'https://freesound.org/apiv2/sounds/{i}/?token={K}&fields=id,name,username,license,url,previews,duration', timeout=60))
out = f'lib/{name}-{i}.mp3'; urllib.request.urlretrieve(s['previews']['preview-hq-mp3'], out)
json.dump({k: s[k] for k in ['id', 'name', 'username', 'license', 'url', 'duration']}, open(out[:-4] + '.json', 'w')); print(out, s['duration'])
