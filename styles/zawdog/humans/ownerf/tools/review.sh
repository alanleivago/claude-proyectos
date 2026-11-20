#!/bin/zsh
# all review deliverables for ownerf -> styles/zawdog/humans/ownerf/review/
#   compare_sheet.jpg, side_compare.jpg, head_compare.jpg, head_360.jpg, head_hands.jpg, expressions.jpg,
#   turntable.mp4 (PS1 dither), motion_test.mp4 (kit hallway)
set -e
cd /Users/alanleiva/claude-proyectos
BL=/Applications/Blender.app/Contents/MacOS/Blender; T=styles/zawdog/humans/ownerf/tools; W=styles/zawdog/humans/ownerf/work
R=styles/zawdog/humans/ownerf/review; F=fuentes/tomgrave-ps1-girl/frames; PY=.venv/bin/python
mkdir -p $R $W/cmp $W/rv $W/tt $W/mk
L() { $BL -b -P $T/look.py -- "$@" > /dev/null 2>&1 }
# 1. reference vs ours, same angles (front / 3/4 / side / back), the reference's T-pose and grey (side: face to the right, like his)
L $W/cmp/our views=0,45,-90,180 pose=tref arm=-24 w=600 h=1000 lens=85 dist=7.5 cz=1.0 tz=0.86 bg=0.05
ROI=0.18,0.06,0.66,1.0
$PY $T/compare.py $R/compare_sheet.jpg "FRONT|$F/intro_f037.jpg|$W/cmp/our_0.png|$ROI" "3/4|$F/intro_f044.jpg|$W/cmp/our_45.png|$ROI" \
  "SIDE|$F/intro_f051.jpg|$W/cmp/our_-90.png|$ROI" "BACK|$F/intro_f067.jpg|$W/cmp/our_180.png|$ROI" --h 760 \
  --title "TomGrave3D PS1 girl (left) vs ownerf round 3 (right): intended changes = bigger butt, fuller thighs, round ears, our own Flow face"
# 1a. pure orthographic side view, full body, large: his vs ours + our silhouette under his outline (leg line)
L $W/cmp/sd views=-90 pose=tref arm=-24 w=700 h=1300 ortho=1.95 dist=6 cz=0.88 tz=0.88 bg=0.25
$PY $T/sidecmp.py $R/side_compare.jpg $F/intro_f051.jpg 0.3,0.06,0.6,0.99 $W/cmp/sd_-90.png \
  --title "Pure side view, full body: TomGrave3D vs ownerf round 3 (bigger butt and fuller thighs are the intended change)"
# 1b. head: his FINAL head (intro turntable, 3x crops) vs ours, ortho, same hair-top -> chin height; + his hi-res painting-stage
#     close-ups (15:22, hair not final yet); + our 12-angle head ring
FH=fuentes/tomgrave-ps1-girl/frames/final_head
L $W/cmp/hd views=0,-45,-90,180 pose=rest w=700 h=700 ortho=0.50 dist=2 cz=1.50 tz=1.50 bg=0.25
O=0.50,1.50,1.6762,1.4548            # ortho scale, camera z, our hair top z, our chin z (final model, metres)
$PY $T/headcmp.py $W/cmp/head_final.jpg "FRONT|$FH/head_f037_3x.png|62,425|$W/cmp/hd_0.png|$O" "3/4|$FH/head_f044_3x.png|62,430|$W/cmp/hd_-45.png|$O" \
  "SIDE|$FH/head_f051_3x.png|62,428|$W/cmp/hd_-90.png|$O" "BACK|$FH/head_f067_3x.png|62,425|$W/cmp/hd_180.png|$O" \
  --title "Head: TomGrave3D final model (intro turntable) vs ownerf round 3 - same scale (blue lines = hair top, chin); round ears and our Flow face are intended"
WC=600 $PY $T/headcmp.py $W/cmp/head_hires.jpg "FRONT (his hi-res, 15:22)|$FH/hires_front_t922.png|252,675|$W/cmp/hd_0.png|$O" \
  "SIDE (his hi-res, 15:23)|$FH/hires_side_t923.png|296,652|$W/cmp/hd_-90.png|$O" --title "Head close-ups: his painting-stage frames (hair not final yet) vs ownerf round 3"
$PY -c "
from PIL import Image
a=Image.open('$W/cmp/head_final.jpg'); b=Image.open('$W/cmp/head_hires.jpg')
S=Image.new('RGB',(max(a.size[0],b.size[0]),a.size[1]+b.size[1]),(24,24,26)); S.paste(a,(0,0)); S.paste(b,(0,a.size[1])); S.save('$R/head_compare.jpg',quality=90)"
rm -rf $W/htt; mkdir -p $W/htt
L $W/htt/h views=$($PY -c "print(','.join(str(i*30) for i in range(12)))") pose=rest w=360 h=400 lens=85 dist=0.9 cz=1.56 tz=1.52 bg=0.18
$PY $T/csheet.py $R/head_360.jpg 6 300 $(ls $W/htt/*.png | sort -t_ -k2 -n) > /dev/null || true
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
