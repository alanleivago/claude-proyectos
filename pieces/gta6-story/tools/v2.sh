#!/bin/zsh
# v2 shot helpers. usage:
#   v2.sh photo <id> <sun>   rename newest flow/ image -> flow/<id>_photo.jpg, write config, block-in
#   v2.sh fin <id> <char> [cx]  rename newest chars/ + plates/ images -> <id>_painted.jpg / plates/<id>.jpg, finish, face_id, comp
set -e
R=/Users/alanleiva/claude-proyectos; V=$R/pieces/gta6-story/v2; PY=$R/.venv/bin/python; S=/private/tmp/claude-501/-Users-alanleiva-claude-proyectos/11f33a37-caf3-40c8-ba53-858345c812ff/scratchpad
newest() { ls -t $1/2026-*.jpg 2>/dev/null | head -1 }
cd $R
case $1 in
photo)
  f=$(newest $V/flow); [ -n "$f" ] && mv "$f" $V/flow/$2_photo.jpg
  echo "{\"base\":\"styles/gta6/characters/pose_base.json\",\"photo\":\"pieces/gta6-story/v2/flow/$2_photo.jpg\",\"out\":\"pieces/gta6-story/v2/chars/$2.png\",\"sun\":\"$3\",\"add\":[]}" > styles/gta6/characters/story2/$2.json
  $PY styles/gta6/tools/make_character.py styles/gta6/characters/story2/$2.json 2>&1 | grep -v WARN | tail -1
  python3 -c "from PIL import Image; im=Image.open('$V/flow/$2_photo.jpg'); im.thumbnail((640,640)); im.save('$S/ph.jpg')";;
fin)
  f=$(newest $V/chars); [ -n "$f" ] && mv "$f" $V/chars/$2_painted.jpg
  f=$(newest $V/plates); [ -n "$f" ] && mv "$f" $V/plates/$2.jpg
  $PY styles/gta6/tools/finish_character.py styles/gta6/characters/story2/$2.json $V/chars/$2_painted.jpg 2>&1 | grep -v WARN | grep -E "PASS|FAIL" | cut -c1-120
  if [ "$3" = "mendez" ]; then
    echo "mendez vs photo id: $($PY styles/gta6/tools/face_id.py $R/pieces/gta6-story/id/mendez.jpg $V/chars/$2_final.png 2>&1 | tail -1)  vs painted id: $($PY styles/gta6/tools/face_id.py $R/pieces/gta6-story/id/mendez_painted.jpg $V/chars/$2_final.png 2>&1 | tail -1)"
  elif [ -n "$3" ]; then
    $PY styles/gta6/tools/face_id.py $V/chars/$2_final.png --char $3 ${4:+--cx $4} 2>&1 | tail -1
  fi
  python3 $R/pieces/gta6-story/tools/comp.py $S/c.jpg $V/plates/$2.jpg $V/chars/$2_final.png --w 960 >/dev/null;;
esac
