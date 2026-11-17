#!/bin/bash
# render every storyboard still into stills/$1 and a preview sheet
cd "$(dirname "$0")"
FR=$(python -c "print(','.join(str((i*3+1)*30) for i in range(24)))")
timeout 600 node render.mjs --page sb.html --frames $FR --out stills/$1 --sbmeta stills/sb_meta.json 2>&1 | grep -v "bind" | tail -3
python - "$1" <<'PY'
import sys,glob
from PIL import Image
fs=sorted(glob.glob('stills/%s/f_*.png'%sys.argv[1]));W,H=216,384
im=Image.new('RGB',(W*8,H*3))
for i,f in enumerate(fs): im.paste(Image.open(f).resize((W,H)),((i%8)*W,(i//8)*H))
im.save('C:/Users/ALANLE~1/AppData/Local/Temp/claude/c026b2981c42eeb2/b19cd1d9-332a-4ffd-91ff-b618e0ca55df/scratchpad/sb/%s.png'%sys.argv[1])
PY
