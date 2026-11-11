"""decode a voicestudio MCP result file (base64 WAV inside JSON) -> wav.  python decode.py result.txt out.wav"""
import base64, json, re, sys
r = json.load(open(sys.argv[1]))["result"]
try:
    d = json.loads(r)
except Exception:
    d = None
s = r
m = re.search(r"UklGR[A-Za-z0-9+/=]+", s)
open(sys.argv[2], "wb").write(base64.b64decode(m.group(0)))
print(re.sub(r"UklGR[A-Za-z0-9+/=]+", "<b64>", s)[:300])
