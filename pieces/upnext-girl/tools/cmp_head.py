import sys
from PIL import Image
R='/Users/alanleiva/claude-proyectos/fuentes/mml2-girl-tutorial/frames/ref/'
t=sys.argv[1]
ims=[Image.open(f'review/{t}_head_{v}.png').resize((300,300)) for v in ('front','3q_l','side_l')]
refs=[Image.open(R+'t759.png').crop((860,130,1060,330)).resize((300,300)), Image.open(R+'t743.png').crop((830,90,1050,310)).resize((300,300)), Image.open(R+'t736.png').crop((870,90,1090,310)).resize((300,300))]
sh=Image.new('RGB',(900,600))
for i in range(3): sh.paste(ims[i],(i*300,0)); sh.paste(refs[i],(i*300,300))
sh.save(f'review/cmp_{t}_head.png')
