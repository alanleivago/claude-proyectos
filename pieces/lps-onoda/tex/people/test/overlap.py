import sys, collections; sys.path.insert(0, "/Users/alanleiva/claude-proyectos/pieces/lps-onoda/tex"); sys.argv=['x']
import numpy as np, people as Pp
pix,P,N,part,side=Pp.locate()
fr=(N[:,1]<-0.5).astype(int)-(N[:,1]>0.5)
key=part*3+(fr+1)
lab=lambda k: Pp.PARTS[k//3]+['B','S','F'][k%3]
o=np.argsort(pix,kind='stable'); pix,key=pix[o],key[o]
b=np.r_[0,np.nonzero(np.diff(pix))[0]+1,len(pix)]
cnt=collections.Counter()
for i in range(len(b)-1):
  s=sorted(set(key[b[i]:b[i+1]]))
  if len(s)>1: cnt[' '.join(lab(k) for k in s)]+=1
for k,v in cnt.most_common(30): print(v,k)
print(collections.Counter(lab(k) for k in key).most_common())
