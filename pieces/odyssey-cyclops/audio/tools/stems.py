import soundfile as sf,numpy as np,pyloudnorm as pyln,sys,json
SR=48000;m=pyln.Meter(SR,block_size=0.4)
v,_=sf.read('../voice/voice.wav');v=np.stack([v,v],1) if v.ndim==1 else v
mu,_=sf.read('track.wav');mu=mu[:len(v)]*10**(-2/20)
s,_=sf.read('sfx_pro.wav')
def L(x,a,b):
  seg=x[int(a*SR):int(b*SR)]
  try: return m.integrated_loudness(seg)
  except: return -99
print('integrated voice %.1f music %.1f sfx %.1f'%(m.integrated_loudness(v),m.integrated_loudness(mu),m.integrated_loudness(s)))
pts=[float(x) for x in sys.argv[1:]]
for t in pts:
  a,b=t-0.1,t+0.5
  print(f"{t:7.2f}  sfx {L(s,a,b):6.1f}  voice {L(v,a,b):6.1f}  music {L(mu,a,b):6.1f}")
