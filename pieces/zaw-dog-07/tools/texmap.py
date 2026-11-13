"""per-texel rest position / bone / material of a kit human body (UVMap, 256x256) -> npz, one body half per run.
Blender -b styles/zawdog/humans/<n>/<n>.blend -P texmap.py -- <n> <out.npz> neg|pos"""
import bpy, sys, numpy as np
name=sys.argv[sys.argv.index("--")+1]; out=sys.argv[sys.argv.index("--")+2]
SIDE=sys.argv[sys.argv.index("--")+3] if len(sys.argv)>sys.argv.index("--")+3 else "neg"   # neg: x<0 half, pos: x>0 half (UVs differ per side)
o=bpy.data.objects[name+"_body"]; me=o.data; N=256
uv=me.uv_layers["UVMap"].data
vg_names=[g.name for g in o.vertex_groups]
vb=np.full(len(me.vertices),-1); 
for v in me.vertices:
    if v.groups:
        g=max(v.groups,key=lambda g:g.weight); vb[v.index]=g.group
pos=np.zeros((N,N,3),np.float32); bone=np.full((N,N),-1,np.int32); mat=np.full((N,N),-1,np.int32); nrm=np.zeros((N,N,3),np.float32)
me.calc_loop_triangles()
for tri in me.loop_triangles:
    if tri.material_index not in (0,1): continue
    L=tri.loops; V=tri.vertices
    cx=sum(me.vertices[v].co.x for v in V)/3
    if (SIDE=="neg" and cx>0.0) or (SIDE=="pos" and cx<0.0): continue
    P=np.array([uv[l].uv[:] for l in L])*N; X=np.array([me.vertices[v].co[:] for v in V])
    x0,y0=np.floor(P.min(0)).astype(int); x1,y1=np.ceil(P.max(0)).astype(int)
    xs,ys=np.meshgrid(np.arange(max(0,x0),min(N,x1+1)),np.arange(max(0,y0),min(N,y1+1)))
    px=xs+0.5; py=ys+0.5
    (ax,ay),(bx,by),(cx,cy)=P
    den=(by-cy)*(ax-cx)+(cx-bx)*(ay-cy)
    if abs(den)<1e-9: continue
    w0=((by-cy)*(px-cx)+(cx-bx)*(py-cy))/den; w1=((cy-ay)*(px-cx)+(ax-cx)*(py-cy))/den; w2=1-w0-w1
    m=(w0>=-0.02)&(w1>=-0.02)&(w2>=-0.02)
    if not m.any(): continue
    W=np.stack([w0[m],w1[m],w2[m]],1); p=W@X
    r=(N-1-ys[m]); c=xs[m]          # image rows top-down
    pos[r,c]=p; mat[r,c]=tri.material_index; nrm[r,c]=tri.normal[:]
    k=np.argmax(W,1); bone[r,c]=vb[np.array(V)[k]]
np.savez(out,pos=pos,bone=bone,mat=mat,nrm=nrm,names=np.array(vg_names))
print("TEX done", name, (mat>=0).sum())
