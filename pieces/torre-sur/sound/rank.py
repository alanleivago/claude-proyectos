"""earshot rank per sound key over the Freesound candidates (+ kit picks) -> rank.json"""
import json, sys, glob
from earshot import api
sys.stdout.reconfigure(encoding='utf-8')
K='F:/Claude Proyectos/sound-layer/kit/'
Q={'office':'busy office ambience with distant phones and murmur','hvac':'air conditioning hum room tone','typing':'office keyboard typing',
 'phone':'telephone ringing','jet':'a jet airplane flying overhead','explosion':'a huge explosion boom','blast':'a huge explosion boom','hit':'a huge explosion boom',
 'rattle':'glass windows rattling','mug':'a ceramic mug smashing on the floor','panic':'crowd of people screaming in panic','murmur':'crowd of people screaming in panic',
 'scream':'a woman screaming in terror','shouts':'people shouting','running':'many people running footsteps','alarm':'a fire alarm bell ringing',
 'chair':'an office chair moving','papers':'paper rustling','button':'an elevator button click','ding':'an elevator bell ding','doors':'elevator doors sliding open',
 'stairs':'footsteps running down concrete stairs','stairwell':'footsteps echoing in a stairwell','firedoor':'a heavy metal door slamming',
 'tick':'a clock ticking','lobby':'large indoor crowd chatter walla','walla':'large indoor crowd chatter walla','hall':'large indoor crowd chatter walla',
 'lift':'elevator moving hum','sirens':'distant police sirens in the city','drone':'dark tense ambient drone','boom':'a deep cinematic boom impact'}
idx=json.load(open('fs/index.json'))
groups={}
for k,v in idx.items():
    if v: groups.setdefault(Q[k],[]).extend(x['file'] for x in v)
groups['a deep cinematic boom impact']+= [K+'boom/'+f for f in ['fs-320782-huge-explosion-thunder-explo-3.wav','fs-264031-low-mid-afar-explosion-1-wav-1.wav','fs-539968-deep-boom-3.wav','fs-636624-deep-hit-2.wav','fs-423458-low-pitched-boom-noise-1.wav','fs-83940-explosion-sourde-mp3-1.wav']]
groups['a huge explosion boom']+= [K+'boom/fs-320782-huge-explosion-thunder-explo-3.wav',K+'boom/fs-264031-low-mid-afar-explosion-1-wav-1.wav']
groups['a clock ticking']+= [K+'tick/'+f for f in ['fs-398275-clock-tick-1.wav','fs-188033-ticking-clock-1.wav','fs-130388-clock-ticking-1.wav']]
groups['a rising tension riser']=[K+'riser/'+f for f in ['fs-396161-scary-hits-risers-001-1.wav','fs-396160-scary-hits-risers-002-1.wav','fs-545798-metallic-horror-riser-fx-wav-1.wav','fs-503800-riser-1-wav-1.wav','fs-571112-bass-riser-fx-e-1.wav']]
out={}
for q,files in groups.items():
    r=api.rank(files,q); out[q]=r
    print('##',q); print(json.dumps(r,default=str)[:900])
json.dump(out,open('rank.json','w'),indent=1,default=str)
