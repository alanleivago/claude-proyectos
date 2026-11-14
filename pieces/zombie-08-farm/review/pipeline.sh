set -e
cd "/f/Claude Proyectos/pieces/zombie-08-farm/voz"
cp pick.json pick_prev.json; python pick.py > /dev/null
python -c "
import json;p=json.load(open('pick.json'));q=json.load(open('pick_prev.json'))
[p.__setitem__(k,v) for k,v in q.items() if p.get(k) is None and v]
json.dump(p,open('pick.json','w'),indent=1)"
python assemble.py > assemble_log.txt 2>&1
cd ../engine
node cuts.mjs
node sfx_dump.mjs
cd ../audio/scripts && python mix8.py
echo PIPE_DONE
