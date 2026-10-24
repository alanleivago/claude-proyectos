"""Builds the emberlite desk scene in the live Blender. Run with exec(open(path).read())."""
import bpy, math, os
from mathutils import Vector

ROOT = r"F:\Claude Proyectos\pieces\emberlite-desk"
TEX = os.path.join(ROOT, "tex")

for o in list(bpy.data.objects):
    bpy.data.objects.remove(o, do_unlink=True)
for coll in (bpy.data.meshes, bpy.data.materials, bpy.data.lights, bpy.data.cameras, bpy.data.curves, bpy.data.images):
    for b in list(coll):
        if b.users == 0:
            coll.remove(b)

scene = bpy.context.scene
col = bpy.data.collections.get("Desk") or bpy.data.collections.new("Desk")
if col.name not in scene.collection.children:
    scene.collection.children.link(col)


def link(o):
    for c in o.users_collection:
        c.objects.unlink(o)
    col.objects.link(o)
    return o


# ---------- materials ----------
def principled(m):
    return next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED")


def mat_col(name, rgb, rough=1.0, metal=0.0, emit=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = principled(m)
    b.inputs["Specular IOR Level"].default_value = 0.15
    b.inputs["Base Color"].default_value = (*rgb, 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if emit:
        b.inputs["Emission Color"].default_value = (*rgb, 1)
        b.inputs["Emission Strength"].default_value = emit
    return m


def mat_img(name, file, emit=0.0, rough=1.0, box_scale=None, tint=(1, 1, 1), px=512, top=False):
    """Image material, texture downscaled to <=px (PS2-era memory). emit>0 -> screen-like.
    box_scale -> object-space box projection (tiling). top -> image stretched over the object's XY bounds."""
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree
    b = principled(m)
    b.inputs["Specular IOR Level"].default_value = 0.15
    tex = nt.nodes.new("ShaderNodeTexImage")
    img = bpy.data.images.load(os.path.join(TEX, file), check_existing=True)
    if max(img.size) > px:
        k = px / max(img.size)
        img.scale(max(1, int(img.size[0] * k)), max(1, int(img.size[1] * k)))
    tex.image = img
    tex.interpolation = "Linear"
    if top:
        tc = nt.nodes.new("ShaderNodeTexCoord")
        nt.links.new(tc.outputs["Generated"], tex.inputs["Vector"])
    if box_scale:
        tc = nt.nodes.new("ShaderNodeTexCoord")
        mp = nt.nodes.new("ShaderNodeMapping")
        mp.inputs["Scale"].default_value = (box_scale,) * 3
        nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
        nt.links.new(mp.outputs["Vector"], tex.inputs["Vector"])
        tex.projection = "BOX"; tex.projection_blend = 0.2
    out = tex.outputs["Color"]
    if tint != (1, 1, 1):
        mix = nt.nodes.new("ShaderNodeMix"); mix.data_type = "RGBA"; mix.blend_type = "MULTIPLY"
        mix.inputs["Factor"].default_value = 1.0
        nt.links.new(out, mix.inputs["A"]); mix.inputs["B"].default_value = (*tint, 1)
        out = mix.outputs["Result"]
    nt.links.new(out, b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = rough
    if emit:
        nt.links.new(out, b.inputs["Emission Color"])
        b.inputs["Emission Strength"].default_value = emit
    return m


# ---------- primitives ----------
def box(name, size, loc, mat, rot=(0, 0, 0), bevel=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=[math.radians(a) for a in rot])
    o = link(bpy.context.object); o.name = name
    o.scale = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        md = o.modifiers.new("Bevel", "BEVEL"); md.width = bevel; md.segments = 1
    o.data.materials.append(mat)
    return o


def plane(name, w, h, loc, mat, rot=(90, 0, 0)):
    """Default faces -Y (towards the camera side of the desk), image upright."""
    bpy.ops.mesh.primitive_plane_add(size=1, location=loc, rotation=[math.radians(a) for a in rot])
    o = link(bpy.context.object); o.name = name
    o.scale = (w, h, 1)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.data.materials.append(mat)
    return o


def cyl(name, r1, r2, depth, loc, mat, verts=12, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r1, radius2=r2, depth=depth, location=loc,
                                    rotation=[math.radians(a) for a in rot])
    o = link(bpy.context.object); o.name = name
    o.data.materials.append(mat)
    return o


# ---------- materials used ----------
M = {
    "wood": mat_img("Wood", "flow/wood.jpg", box_scale=3.0, px=256),
    "wall": mat_img("Wall", "flow/wall.jpg", box_scale=0.8, px=256, tint=(0.55, 0.6, 0.8)),
    "carpet": mat_img("Carpet", "flow/carpet.jpg", box_scale=2.0, px=256),
    "plastic_lt": mat_img("PlasticLight", "flow/plastic.jpg", box_scale=4.0, px=256, tint=(0.5, 0.52, 0.58)),
    "plastic_dk": mat_img("PlasticDark", "flow/plastic.jpg", box_scale=4.0, px=256, tint=(0.12, 0.12, 0.14)),
    "navy": mat_img("Navy", "flow/plastic.jpg", box_scale=4.0, px=256, tint=(0.12, 0.2, 0.55)),
    "white": mat_col("WhitePlastic", (0.85, 0.86, 0.9)),
    "metal": mat_col("Metal", (0.5, 0.52, 0.6), rough=0.5, metal=0.8),
    "slat": mat_img("Blind", "flow/plastic.jpg", box_scale=4.0, px=128, tint=(1.0, 1.0, 1.05)),
    "cable": mat_col("Cable", (0.35, 0.37, 0.45)),
    "lava_base": mat_col("LavaBase", (0.05, 0.15, 0.55), rough=0.5, metal=0.6),
    "screen": mat_img("Screen", "flow/desktop.jpg", emit=0.7),
    "keys": mat_img("Keys", "flow/keyboard.jpg"),
    "cds": mat_img("CDs", "flow/cd_spines.jpg"),
    "games": mat_img("GameSpines", "flow/game_spines.jpg", px=256),
    "poster": mat_img("Poster", "flow/poster.jpg"),
    "simsbox": mat_img("GameBox", "flow/game_box.jpg", px=256),
    "sticky": mat_img("Sticky", "sticky.png", px=128),
    "pc_front": mat_img("PCFront", "flow/pc_front.jpg", px=256),
    "ipod": mat_img("iPodFront", "flow/ipod.jpg", px=128, emit=0.15),
    "phone": mat_img("PhoneFront", "flow/phone.jpg", px=128, emit=0.15),
    "mouse": mat_img("MouseTop", "flow/mouse.jpg", px=128, top=True),
    "city": mat_img("City", "flow/city.jpg", emit=2.0),
}

# lava: animated noise blobs, pink on deep blue, emissive
lava = bpy.data.materials.new("Lava"); lava.use_nodes = True
nt = lava.node_tree; b = principled(lava)
tc = nt.nodes.new("ShaderNodeTexCoord"); mp = nt.nodes.new("ShaderNodeMapping")
mp.inputs["Scale"].default_value = (45, 45, 18)
nz = nt.nodes.new("ShaderNodeTexNoise"); nz.noise_dimensions = "4D"; nz.inputs["Scale"].default_value = 1.0
nz.inputs["Detail"].default_value = 1.0
ramp = nt.nodes.new("ShaderNodeValToRGB")
ramp.color_ramp.elements[0].position = 0.5; ramp.color_ramp.elements[0].color = (0.03, 0.06, 0.9, 1)
ramp.color_ramp.elements[1].position = 0.54; ramp.color_ramp.elements[1].color = (1.0, 0.08, 0.5, 1)
ramp.color_ramp.interpolation = "CONSTANT"
nt.links.new(tc.outputs["Object"], mp.inputs["Vector"]); nt.links.new(mp.outputs["Vector"], nz.inputs["Vector"])
nt.links.new(nz.outputs["Fac"], ramp.inputs["Fac"])
nt.links.new(ramp.outputs["Color"], b.inputs["Base Color"]); nt.links.new(ramp.outputs["Color"], b.inputs["Emission Color"])
b.inputs["Emission Strength"].default_value = 1.3
fc = nz.inputs["W"].driver_add("default_value"); fc.driver.expression = "frame/90"
M["lava"] = lava

# ---------- room ----------
box("Floor", (5, 5, 0.02), (0, 0, -0.01), M["carpet"])
WY = 0.46  # back wall plane
box("Wall_L", (2.3, 0.06, 3), (-0.4, WY + 0.03, 1.5), M["wall"])           # x -1.55..0.75
box("Wall_R", (1.0, 0.06, 3), (2.1, WY + 0.03, 1.5), M["wall"])                         # x 1.6..2.6
box("Wall_Under", (0.85, 0.06, 0.85), (1.175, WY + 0.03, 0.425), M["wall"])             # below window
box("Wall_Over", (0.85, 0.06, 1.3), (1.175, WY + 0.03, 2.35), M["wall"])                # above window
box("Wall_Side", (0.06, 3, 3), (-1.2, -1.0, 1.5), M["wall"])
for n, s, l in [("Frame_B", (0.9, 0.08, 0.04), (1.175, WY, 0.87)), ("Frame_T", (0.9, 0.08, 0.04), (1.175, WY, 1.69)),
                ("Frame_L", (0.04, 0.08, 0.86), (0.77, WY, 1.28)), ("Frame_R", (0.04, 0.08, 0.86), (1.58, WY, 1.28)),
                ("Frame_M", (0.03, 0.06, 0.8), (1.175, WY + 0.02, 1.28))]:
    box(n, s, l, M["slat"])
for i in range(22):  # blinds, tilted half open
    box(f"Slat_{i:02d}", (0.8, 0.045, 0.004), (1.175, WY - 0.03, 0.9 + i * 0.036), M["slat"], rot=(62, 0, 0))
plane("City", 3.2, 1.6, (1.3, 2.4, 1.1), M["city"])

# ---------- desk ----------
TOP = 0.76
box("Desk_Top", (1.72, 0.76, 0.035), (0, 0.07, TOP - 0.0175), M["wood"], bevel=0.006)
box("Desk_SideL", (0.035, 0.72, TOP - 0.035), (-0.84, 0.07, (TOP - 0.035) / 2), M["wood"])
box("Desk_SideR", (0.035, 0.72, TOP - 0.035), (0.84, 0.07, (TOP - 0.035) / 2), M["wood"])
box("Desk_Back", (1.66, 0.02, 0.5), (0, 0.43, 0.45), M["wood"])
# hutch: left post + CD rack on the right hold the shelf
SH = 1.33
box("Hutch_Post", (0.03, 0.3, SH - TOP), (-0.83, 0.3, (SH + TOP) / 2), M["wood"])
box("Hutch_Shelf", (1.62, 0.32, 0.03), (-0.04, 0.29, SH + 0.015), M["wood"], bevel=0.005)
box("Rack_Back", (0.26, 0.02, SH - TOP), (0.6, 0.44, (SH + TOP) / 2), M["wood"])
box("Rack_SideL", (0.02, 0.3, SH - TOP), (0.47, 0.3, (SH + TOP) / 2), M["wood"])
box("Rack_SideR", (0.02, 0.3, SH - TOP), (0.73, 0.3, (SH + TOP) / 2), M["wood"])
plane("Rack_CDs", 0.24, SH - TOP - 0.04, (0.6, 0.2, (SH + TOP) / 2), M["cds"])
box("Rack_CDblock", (0.24, 0.24, SH - TOP - 0.04), (0.6, 0.322, (SH + TOP) / 2), M["plastic_dk"])

# ---------- monitor ----------
MX, MY = -0.12, 0.2
box("Mon_Base", (0.22, 0.17, 0.02), (MX, MY, TOP + 0.01), M["plastic_lt"], bevel=0.005)
box("Mon_Neck", (0.07, 0.04, 0.13), (MX, MY + 0.02, TOP + 0.08), M["plastic_lt"])
box("Mon_Bezel", (0.41, 0.055, 0.345), (MX, MY, TOP + 0.31), M["plastic_lt"], bevel=0.008)
box("Mon_Back", (0.3, 0.06, 0.24), (MX, MY + 0.05, TOP + 0.31), M["plastic_lt"], bevel=0.01)
plane("Mon_Screen", 0.345, 0.259, (MX, MY - 0.0285, TOP + 0.325), M["screen"])
box("Mon_Logo", (0.012, 0.002, 0.012), (MX, MY - 0.0285, TOP + 0.16), M["metal"])
screen_light = bpy.data.lights.new("ScreenGlow", "SPOT")  # cone onto the keyboard/desk, keeps the tower side dark
screen_light.spot_size = math.radians(80); screen_light.spot_blend = 0.6; screen_light.shadow_soft_size = 0.02
screen_light.energy = 20; screen_light.color = (0.55, 0.75, 1.0)
o = bpy.data.objects.new("ScreenGlow", screen_light); col.objects.link(o)
o.location = (MX, MY - 0.1, TOP + 0.36); o.rotation_euler = (math.radians(-55), 0, 0)  # aims down and towards -Y

# ---------- PC tower ----------
TX = -0.49
box("PC_Tower", (0.2, 0.46, 0.44), (TX, 0.12, TOP + 0.22), M["plastic_lt"], bevel=0.006)
plane("PC_Front", 0.198, 0.438, (TX, -0.111, TOP + 0.22), M["pc_front"])
plane("PC_Sticky", 0.07, 0.07, (TX + 0.03, -0.113, TOP + 0.24), M["sticky"], rot=(90, 0, 4))

# ---------- phone ----------
PH = -0.36
box("Phone_Base", (0.1, 0.13, 0.03), (PH, -0.25, TOP + 0.015), M["navy"], bevel=0.008)
box("Phone_Hand", (0.055, 0.035, 0.21), (PH, -0.24, TOP + 0.13), M["navy"], rot=(-8, 0, 0), bevel=0.01)
plane("Phone_Front", 0.052, 0.205, (PH, -0.2585, TOP + 0.1325), M["phone"], rot=(82, 0, 0))
box("Phone_Ant", (0.008, 0.008, 0.05), (PH + 0.02, -0.23, TOP + 0.255), M["plastic_dk"])

# ---------- keyboard + mouse ----------
KX, KY = 0.2, -0.13
box("Kb_Body", (0.47, 0.18, 0.025), (KX, KY, TOP + 0.0125), M["plastic_dk"], rot=(4, 0, -3), bevel=0.006)
plane("Kb_Keys", 0.45, 0.165, (KX, KY, TOP + 0.0265), M["keys"], rot=(4, 0, -3))
bpy.ops.mesh.primitive_uv_sphere_add(segments=8, ring_count=5, radius=1, location=(0.56, -0.08, TOP + 0.012))
mouse = link(bpy.context.object); mouse.name = "Mouse"; mouse.scale = (0.032, 0.055, 0.02)
mouse.data.materials.append(M["mouse"])

# ---------- iPod + cable ----------
IP = Vector((-0.17, -0.22, TOP + 0.006))
ipod = box("iPod", (0.055, 0.095, 0.011), IP, M["navy"], rot=(0, 0, 25), bevel=0.004)
scr = plane("iPod_Front", 0.054, 0.094, (0, 0, 0.0058), M["ipod"], rot=(0, 0, 0)); scr.parent = ipod
cv = bpy.data.curves.new("Cable", "CURVE"); cv.dimensions = "3D"; cv.bevel_depth = 0.0028; cv.bevel_resolution = 0
cv.resolution_u = 4
sp = cv.splines.new("BEZIER")
pts = [IP + Vector((-0.02, -0.045, 0)), Vector((-0.12, -0.34, TOP + 0.003)), Vector((-0.3, -0.33, TOP + 0.003)),
       Vector((-0.36, -0.16, TOP + 0.003)), Vector((TX + 0.06, -0.115, TOP + 0.06))]
sp.bezier_points.add(len(pts) - 1)
for bp, p in zip(sp.bezier_points, pts):
    bp.co = p; bp.handle_left_type = bp.handle_right_type = "AUTO"
cable = bpy.data.objects.new("Cable", cv); col.objects.link(cable); cv.materials.append(M["cable"])

# ---------- lava lamp ----------
LX, LY = 0.33, 0.27
cyl("Lava_Base", 0.06, 0.034, 0.12, (LX, LY, TOP + 0.06), M["lava_base"], verts=8)
cyl("Lava_Glass", 0.036, 0.022, 0.22, (LX, LY, TOP + 0.23), M["lava"], verts=8)
cyl("Lava_Cap", 0.024, 0.012, 0.045, (LX, LY, TOP + 0.3625), M["lava_base"], verts=8)
for nm, colr, e in [("LavaPink", (1.0, 0.2, 0.7), 1.0), ("LavaBlue", (0.05, 0.1, 1.0), 12)]:
    L = bpy.data.lights.new(nm, "POINT"); L.color = colr; L.energy = e; L.shadow_soft_size = 0.04
    L.use_shadow = False  # sits inside the glass
    o = bpy.data.objects.new(nm, L); col.objects.link(o); o.location = (LX, LY, TOP + 0.23)

# ---------- game box on desk ----------
box("GameBox", (0.135, 0.19, 0.028), (0.57, 0.06, TOP + 0.014), M["navy"], rot=(0, 0, -18))
plane("GameBox_Cover", 0.133, 0.188, (0.57, 0.06, TOP + 0.0285), M["simsbox"], rot=(0, 0, -18))

# ---------- on the shelf ----------
box("Games_Block", (0.22, 0.14, 0.2), (-0.7, 0.32, SH + 0.13), M["plastic_dk"])
plane("Games_Spines", 0.22, 0.2, (-0.7, 0.249, SH + 0.13), M["games"])
box("Poster_Frame", (0.54, 0.02, 0.41), (-0.25, WY - 0.01, SH + 0.3), M["plastic_dk"])
plane("Poster", 0.5, 0.375, (-0.25, WY - 0.021, SH + 0.3), M["poster"])

# ---------- office chair ----------
fabric = mat_img("ChairFabric", "flow/chair_fabric.jpg", box_scale=3.0, px=128)
CX, CY = 0.12, -0.4
box("Chair_Seat", (0.46, 0.44, 0.07), (CX, CY, 0.5), fabric, bevel=0.025)
box("Chair_Back", (0.42, 0.06, 0.48), (CX, CY - 0.25, 0.84), fabric, rot=(-8, 0, 0), bevel=0.03)
box("Chair_Spine", (0.05, 0.03, 0.3), (CX, CY - 0.25, 0.52), M["plastic_dk"])
cyl("Chair_Gas", 0.025, 0.025, 0.36, (CX, CY, 0.28), M["metal"], verts=8)
for i in range(5):
    a = math.radians(90 + i * 72)
    box(f"Chair_Leg{i}", (0.3, 0.04, 0.03), (CX + 0.15 * math.cos(a), CY + 0.15 * math.sin(a), 0.06),
        M["plastic_dk"], rot=(0, 0, math.degrees(a)))
for side in (-1, 1):
    box(f"Chair_Arm{side}", (0.05, 0.3, 0.03), (CX + side * 0.25, CY - 0.03, 0.7), M["plastic_dk"])
    box(f"Chair_ArmPost{side}", (0.03, 0.03, 0.17), (CX + side * 0.25, CY - 0.06, 0.6), M["plastic_dk"])


# ---------- lighting / world / render ----------
moon = bpy.data.lights.new("WindowMoon", "AREA"); moon.shape = "RECTANGLE"; moon.size = 0.8; moon.size_y = 0.8
moon.energy = 45; moon.color = (0.1, 0.25, 1.0)
o = bpy.data.objects.new("WindowMoon", moon); col.objects.link(o)
o.location = (1.175, 0.7, 1.3); o.rotation_euler = (math.radians(-80), 0, math.radians(15))
fill = bpy.data.lights.new("BlueFill", "AREA"); fill.size = 2.5; fill.energy = 10; fill.color = (0.02, 0.08, 1.0)
o = bpy.data.objects.new("BlueFill", fill); col.objects.link(o)
o.location = (-0.3, -1.6, 2.2); o.rotation_euler = (math.radians(50), 0, 0)

w = scene.world or bpy.data.worlds.new("World"); scene.world = w; w.use_nodes = True
bg = next(n for n in w.node_tree.nodes if n.type == "BACKGROUND")
bg.inputs["Color"].default_value = (0.0, 0.006, 0.035, 1); bg.inputs["Strength"].default_value = 1.0

for eng in ("BLENDER_EEVEE", "BLENDER_EEVEE_NEXT"):
    try:
        scene.render.engine = eng; break
    except TypeError:
        pass
scene.render.resolution_x, scene.render.resolution_y = 720, 1280
scene.render.fps = 30
scene.frame_start, scene.frame_end = 1, 400
scene.view_settings.view_transform = "Standard"
try:
    scene.view_settings.look = "Medium High Contrast"
except TypeError:
    pass
ee = scene.eevee
ee.taa_render_samples = 64
for attr, val in (("use_raytracing", False), ("shadow_ray_count", 2), ("shadow_step_count", 8)):
    if hasattr(ee, attr):
        setattr(ee, attr, val)
print("built", len(col.objects), "objects, engine", scene.render.engine)
