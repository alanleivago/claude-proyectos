# hook crops + full strip of a render: _hookcrops.sh NN outdir
cd "/f/Claude Proyectos/pieces/stimulus-$1-hf"
ffmpeg -v error -y -i renders/stimulus-$1.mp4 -vf "select='eq(n\,14)+eq(n\,36)+eq(n\,60)+eq(n\,84)+eq(n\,100)',crop=1080:760:0:120,scale=432:-1,tile=5x1" -frames:v 1 $2/hk$1.jpg
ffmpeg -v error -y -i renders/stimulus-$1.mp4 -vf "fps=1/2.5,scale=180:-1,tile=12x2" -frames:v 1 $2/st$1.jpg
