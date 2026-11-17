import sys, os; sys.path.insert(0, os.path.dirname(__file__))
import review as R
opt = sys.argv[1]
s=[dict(out=os.path.join(R.TMP,f'c_{v}.png'),view=v,ctr=[0,0,0.62],ext=0.9) for v in ('front','3q','side','back')]
R.run(R.blend(opt),s,size=512)
R.grid([[x['out'] for x in s]],f'review/_close_{opt}.png')
