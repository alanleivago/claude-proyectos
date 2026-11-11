#!/bin/zsh
# board-stage flicker: review/anim/<beat>/ -> PS1 dither (as board.py) -> tools/flicker.py ; target <= ~6 % flicker px per shot
cd "$(dirname "$0")/.."; D=${TMPDIR:-/tmp}/zaw05_flk; mkdir -p $D
../../.venv/bin/python -c "
import glob, os, sys
sys.path.insert(0, '../lps-lowpoly-test')
from photoprop import ps1_post
from PIL import Image
for p in glob.glob('review/anim/*/*.png'):
    ps1_post(Image.open(p).convert('RGB').resize((540, 960), Image.NEAREST), scale=2).save(os.path.join('$D', os.path.basename(p)))
"
../../.venv/bin/python tools/flicker.py $D "$@"
