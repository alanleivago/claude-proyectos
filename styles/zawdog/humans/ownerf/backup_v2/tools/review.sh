#!/bin/zsh
# all review deliverables for ownerf -> styles/zawdog/humans/ownerf/review/
#   compare_sheet.jpg, head_hands.jpg, expressions.jpg, turntable.mp4 (PS1 dither), motion_test.mp4 (kit hallway)
set -e
cd /Users/alanleiva/claude-proyectos
BL=/Applications/Blender.app/Contents/MacOS/Blender; T=styles/zawdog/humans/ownerf/tools; W=styles/zawdog/humans/ownerf/work
R=styles/zawdog/humans/ownerf/review; F=fuentes/tomgrave-ps1-girl/frames; PY=.venv/bin/python
mkdir -p $R $W/cmp $W/rv $W/tt $W/mk
L() { $BL -b -P $T/look.py -- "$@" > /dev/null 2>&1 }
# 1. reference vs ours, same angles (front / 3/4 / side / back), the reference's T-pose and grey
L $W/cmp/our views=0,45,90,180 pose=tref arm=-24 w=600 h=1000 lens=85 dist=7.5 cz=1.0 tz=0.86 bg=0.05
ROI=0.18,0.06,0.66,1.0
$PY $T/compare.py $R/compare_sheet.jpg "FRONT|$F/intro_f037.jpg|$W/cmp/our_0.png|$ROI" "3/4|$F/intro_f044.jpg|$W/cmp/our_45.png|$ROI" \
  "SIDE|$F/intro_f051.jpg|$W/cmp/our_90.png|$ROI" "BACK|$F/intro_f067.jpg|$W/cmp/our_180.png|$ROI" --h 760 \
  --title "TomGrave3D PS1 girl (left) vs ownerf (right): intended changes = bigger butt, fuller thighs, round ears, our own Flow face"
# 1b. head: his head vs ours at front / 3/4 / side / back-3/4 + our 12-angle head ring
L $W/cmp/hc views=0,-40,90,140 pose=rest w=500 h=560 lens=85 dist=0.85 cz=1.56 tz=1.52 bg=0.18
$PY $T/compare.py $R/head_compare.jpg "FRONT|$F/head_ref_front.jpg|$W/cmp/hc_0.png|0,0,1,1" "3/4|$F/head_ref_34.jpg|$W/cmp/hc_-40.png|0,0,1,1" \
  "SIDE|$F/head_ref_side.jpg|$W/cmp/hc_90.png|0,0,1,1" "BACK 3/4|$F/head_ref_back34.jpg|$W/cmp/hc_140.png|0,0,1,1" --h 480 \
  --title "head: TomGrave3D (left) vs ownerf round 2 (right); intended: round ears, our own Flow face"
rm -rf $W/htt; mkdir -p $W/htt
L $W/htt/h views=$($PY -c "print(','.join(str(i*30) for i in range(12)))") pose=rest w=360 h=400 lens=85 dist=0.9 cz=1.56 tz=1.52 bg=0.18
$PY /private/tmp/claude-501/-Users-alanleiva-claude-proyectos/f6eddb32-1ebc-41f0-bf7c-55a6c417e15b/scratchpad/tools/csheet.py $W/cmp/head_ring.jpg 6 300 $(ls $W/htt/*.png | sort -t_ -k2 -n) > /dev/null || true
# 2. head + hands
L $W/cmp/head views=0,40,90,180 pose=rest w=600 h=600 lens=85 dist=1.2 cz=1.55 tz=1.53 bg=0.05
for h in open point fist; do L $W/rv/hand_$h views=60,-30 pose=tref arm=-24 hand=$h bone=finger3-1.L w=400 h=400 lens=50 dist=0.30 up=-0.06 bg=0.05; done
$PY $T/sheets.py headhands $W $R/head_hands.jpg
# 3. expressions
for e in neutral smile surprised crying laughing scared; do L $W/rv/ex_$e views=0,30 pose=rest face=$e w=420 h=480 lens=85 dist=0.95 cz=1.56 tz=1.53 bg=0.05; done
$PY $T/sheets.py expressions $W $R/expressions.jpg
# 4. T-pose turntable, PS1 dither
rm -rf $W/tt; mkdir -p $W/tt
L $W/tt/t views=$($PY -c "print(','.join(str(round(i*2.4,1)) for i in range(150)))") pose=tref arm=-24 w=540 h=960 lens=50 dist=3.35 cz=0.95 tz=0.86 bg=0.05
$PY $T/ps1post.py $W/tt $R/turntable.mp4 --sort yaw --fps 30
# 5. walk / idle / startle in the kit hallway (Zaw framing), PS1 dither
rm -rf $W/mk; mkdir -p $W/mk
$BL -b -P pieces/zaw-dog-05/build.py -- exec $T/motion_kit.py $W/mk 1 > $W/logs/mk.log 2>&1
$PY $T/ps1post.py $W/mk $R/motion_test.mp4 --glob "0*.png" --labels $W/mk/segments.txt --fps 30
echo "review done"
