# usage: _mkgen.sh NN track offset  -> prep/gen.py from head+plan+tail, assets/music.mp3
cd "/f/Claude Proyectos/pieces/stimulus-$1-hf"
{ sed "s/Stimulus 05/Stimulus $1/" ../_gen_head.txt; cat prep/plan.py; cat ../_gen_tail.txt; } > prep/gen.py
D=$(python -c "import json;print(json.load(open('prep/words_edit.json'))['duration'])")
if [ ! -f assets/music.mp3 ]; then ffmpeg -v error -y -ss $3 -t $(python -c "print($D+5)") -i ../../styles/stimulus/assets/bgm/$2.wav -af "loudnorm=I=-14:TP=-1.5:LRA=11" -ar 44100 -b:a 192k assets/music.mp3; echo "User track \"$2\" (styles/stimulus/assets/bgm/$2.wav), desde el seg $3, loudnorm -14." > assets/MUSIC_SOURCE.txt; fi
python prep/gen.py 2>&1 | grep -v "^  cam" 
