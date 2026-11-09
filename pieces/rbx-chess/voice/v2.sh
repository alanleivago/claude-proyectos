P=/Users/alanleiva/claude-proyectos/.venv/bin/python
$P fix.py c1 c2 c3 c4 c5 c6 c7 c8 c9 c10 2>&1 | grep -v Warning
ffmpeg -v error -y -f concat -i list.txt -ar 24000 -ac 1 voice_raw.wav
$P ../../../styles/cartoon3d/tools/trim_voice.py voice_raw.wav . 2>&1 | head -1
ffmpeg -v error -y -i voice.wav -af "asetrate=48000*2^(4/12),aresample=48000,atempo=1/2^(4/12)" -ac 1 -ar 48000 voice_final_v2.wav
$P -c "
import json; w=json.load(open('words.json'))
if 'w' in w[0]: w=[{'word':x['w'],'start':x['s'],'end':x['e']} for x in w]
json.dump(w,open('words_v2.json','w'),indent=1)"
cp v1/words.json words.json; cp v1/voice_final.wav voice_final.wav
ffprobe -v error -show_entries format=duration -of csv=p=0 voice_final_v2.wav; rm -f c*_t*.wav
