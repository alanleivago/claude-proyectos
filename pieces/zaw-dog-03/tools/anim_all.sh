#!/bin/zsh
# every frame of every beat at 270x480 -> review/anim/<beat>/ (pop / flicker / floating checks)
cd "$(dirname $0)/.."
B=/Applications/Blender.app/Contents/MacOS/Blender
for b in 01a 01b 02 03a 03b 04 05 06 07 08a 08b 09 10a 10b 11a 11b 12 13a 13b 14; do
  rm -rf review/anim/$b; $B -b -P build.py -- frames $b > /dev/null 2>&1; echo "$b done"
done
