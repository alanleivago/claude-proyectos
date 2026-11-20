"""airy-scp-01 mix: voice + steady facility fan hum + ending (stone scrape at the cut to black, neck snap after).
Reads engine/film_timeline.json for the cut time. Writes audio/mix.wav (48 kHz stereo)."""
import json, subprocess, pathlib
P = pathlib.Path(__file__).resolve().parents[1]
TL = json.load(open(P / 'engine/film_timeline.json'))
dur = TL['dur']; cut = next(l for l in TL['lines'] if l['shot'] == '33')['off'] + 0.15
snap = cut + 0.3   # scrape first (the statue moves), then the crack
amb = P / 'sound/amb_hum.wav'
# 9.4 s steady fan hum from the source (32.0-41.4 s), looped with crossfades
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-ss', '32.0', '-t', '9.4', '-i', str(P / 'sound/amb_src.wav'), '-filter_complex',
  '[0:a]asplit=8[a0][a1][a2][a3][a4][a5][a6][a7];' + ''.join(f'[a{i}]' for i in range(8)) + 'concat=n=8:v=0:a=1,aformat=sample_rates=48000:channel_layouts=stereo[o]', '-map', '[o]', str(amb)], check=True)
F = (f"[0:a]atrim=0:{dur},loudnorm=I=-38:TP=-9,aformat=sample_rates=48000:channel_layouts=stereo,afade=t=in:d=0.3,afade=t=out:st={cut - 0.02}:d=0.06[a];"
     f"[1:a]aformat=sample_rates=48000:channel_layouts=stereo[v];"
     f"[2:a]atrim=0.2:1.1,asetpts=PTS-STARTPTS,afade=t=out:st=0.6:d=0.3,aformat=sample_rates=48000:channel_layouts=stereo,volume=2.2,adelay={int(cut * 1000)}|{int(cut * 1000)}[s];"
     f"[3:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=1.6,adelay={int(snap * 1000)}|{int(snap * 1000)}[n];"
     f"[a][v][s][n]amix=inputs=4:normalize=0,atrim=0:{dur},alimiter=limit=0.7:attack=1:level=disabled[o]")
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', str(amb), '-i', str(P / 'voz/voice.wav'), '-i', str(P / 'sound/stone_scrape2.mp3'), '-i', str(P / 'sound/neck_snap.mp3'),
  '-filter_complex', F, '-map', '[o]', '-ar', '48000', str(P / 'audio/mix.wav')], check=True)
print('mix ok', dur, 'cut', round(cut, 2), 'snap', round(snap, 2))
