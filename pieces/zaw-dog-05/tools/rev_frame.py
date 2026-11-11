# run inside build.py: Blender -b -P build.py -- exec tools/rev_frame.py <frame>  -> review/rev_frames/#####(_pN).png (1080x1920)
f = int(ARGS[2]); b = next(x for x in BEATS if x[1] <= f < x[2])
do_frame(b, f, os.path.join(H, "review", "rev_frames", f"{f:05d}.png"), (1080, 1920))
