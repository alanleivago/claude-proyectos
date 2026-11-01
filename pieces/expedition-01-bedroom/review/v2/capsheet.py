import sys,glob,os
from PIL import Image
d=sys.argv[1]; fs=sorted(glob.glob(d+'/f_*.png'))
m=Image.new('RGB',(480*4,90*((len(fs)+3)//4)))
for i,f in enumerate(fs):
    im=Image.open(f).convert('RGB').crop((720,860,1200,950)); m.paste(im,((i%4)*480,(i//4)*90))
m.save(sys.argv[2])
