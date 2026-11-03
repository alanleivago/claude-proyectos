import bpy, math, os, sys
sys.path.insert(0, "/Users/alanleiva/claude-proyectos/pieces/lps-onoda")
import lpskit as K
D = "/Users/alanleiva/claude-proyectos/pieces/lps-onoda/tex/people"
NAMES = ["akatsu", "shimada", "kozuka", "suzuki", "woman", "sailor", "oldman", "worker"]
views = {"front": 0, "q34": 40, "back": 180}
which = os.environ.get("VIEWS", "front,q34,back").split(",")
for v in which:
    K.reset()
    sc = bpy.context.scene
    for i, n in enumerate(NAMES):
        K.hombre(n, ((i - 3.5) * 0.75, 0, 0), math.radians(views[v]), tex={"head": f"{D}/{n}_head_128.png", "body": f"{D}/{n}_body_256.png"})
    cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam")); sc.collection.objects.link(cam); sc.camera = cam
    cam.data.type = "ORTHO"; cam.data.ortho_scale = 6.2
    cam.location = (0, -10, 0.9); cam.rotation_euler = (math.radians(90), 0, 0)
    sc.render.resolution_x, sc.render.resolution_y = 2480, 760
    sc.render.filepath = f"{D}/test/turn_{v}.png"
    bpy.ops.render.render(write_still=True)
