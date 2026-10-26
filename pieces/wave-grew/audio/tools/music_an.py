import numpy as np, librosa, sys, json
y, sr = librosa.load("assets/music/candidates/km_floating-cities.mp3", sr=22050, mono=True)
hop=512
C = librosa.feature.chroma_cqt(y=y, sr=sr, hop_length=hop)
fr = lambda t: int(round(t*sr/hop))
# chroma per beat for phase test
T0=0.0206
beats=[T0+0.5*i for i in range(int((len(y)/sr-T0)/0.5))]
B=np.array([C[:,fr(b):fr(b+0.5)].mean(1) for b in beats])
B=B/ (np.linalg.norm(B,axis=1,keepdims=True)+1e-9)
nov=np.r_[0,1-np.sum(B[1:]*B[:-1],1)]
for ph in range(4):
    print("phase",ph,"mean chroma change at beat%4==ph:",round(nov[ph::4][:-2].mean(),4))
# low band onset energy per beat position
S=np.abs(librosa.stft(y,n_fft=2048,hop_length=hop)); f=librosa.fft_frequencies(sr=sr,n_fft=2048)
low=S[f<150].sum(0); fl=np.r_[0,np.maximum(0,np.diff(low))]
e=np.array([fl[fr(b)-2:fr(b)+3].max() for b in beats[1:-2]])
for ph in range(4): print("phase",ph,"low onset",round(e[(ph-1)%4::4].mean(),2))
# per bar (phase 0 and 1) chroma and rms
for ph in (0,1):
  bars=[T0+0.5*ph+2*i for i in range(92) if T0+0.5*ph+2*i+2<=len(y)/sr]
  K=np.array([C[:,fr(b):fr(b+2)].mean(1) for b in bars]); K/= (np.linalg.norm(K,axis=1,keepdims=True)+1e-9)
  # transition cost i->j : sim(K[i+1],K[j]) & sim(K[i],K[j-1])
  np.save(f"work/barchroma_ph{ph}.npy",K)
  print("phase",ph,"mean adjacent-bar chroma sim",round(np.mean(np.sum(K[1:]*K[:-1],1)),3))
names=['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B']
K=np.load("work/barchroma_ph0.npy")
for i,k in enumerate(K):
    top=np.argsort(-k)[:3]; print(i, round(T0+2*i,2), ' '.join(names[t] for t in top))
