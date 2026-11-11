# Chunk lines.txt into c*.txt. TTS text spells the digit tokens out (same spoken words; the script is unchanged).
L=open('lines.txt').read().splitlines()
R=[(1,5),(6,8),(9,10),(11,14),(15,18),(19,22),(23,28),(29,34),(35,40),(41,45),(46,50)]
SP={'11:59':'eleven fifty-nine','11:58':'eleven fifty-eight','1979':'nineteen seventy-nine'}
for k,(a,b) in enumerate(R,1):
    t=' '.join(L[a-1:b])
    for x,y in SP.items(): t=t.replace(x,y)
    open(f'c{k}.txt','w').write(t)
    print(k,len(t.split()),t[:70])
