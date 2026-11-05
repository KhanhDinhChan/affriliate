"""Bếp từ: cảnh 3D phong cách điện ảnh (Blender 5.x, Cycles). Một cảnh dựng chung, 5 cú máy:
  S1 mở đầu (5 s)   máy lướt sát mặt kính: nồi nước sôi, viên đá bên cạnh chưa tan
  S2 xuyên thấu (6 s)  mặt kính và thân bếp mờ dần, lộ cuộn dây đồng phẳng + thanh ferit
  S3 từ trường (8 s)   cuộn dây sáng theo dòng xoay chiều, đường sức từ xuyên qua kính vào đáy nồi (minh hoạ chậm)
  S5 dòng Foucault (8 s)  nồi cắt dọc 1/4: vòng dòng điện xoáy trong đáy nồi, đáy nóng đỏ dần, bọt khí nổi lên
  S6 thử nam châm (6 s)  nồi úp ngược, nam châm hút dính vào đáy nồi
Chạy:  python canh.py --shot S1 --out ../frames/S1 [--frames 40] [--samples 16] [--res 720x1280]"""
import argparse, math, os, sys, time
import bpy, bmesh
from mathutils import Vector

ap = argparse.ArgumentParser()
ap.add_argument('--shot', default='S1'); ap.add_argument('--out', default='frames')
ap.add_argument('--res', default='720x1280'); ap.add_argument('--samples', type=int, default=16); ap.add_argument('--frames', default=None)
args = ap.parse_args(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:])
FPS = 24
DUR = {'S1': 5.0, 'S2': 6.0, 'S3': 8.0, 'S5': 8.0, 'S6': 6.0}
lerp = lambda a, b, p: a + (b - a) * p
clamp = lambda x, a=0.0, b=1.0: max(a, min(b, x))
ease = lambda x: (lambda y: y * y * (3 - 2 * y))(clamp(x))
def hsh(n): v = math.sin(n * 127.1 + 311.7) * 43758.5453; return v - math.floor(v)

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene

# ---------- vật liệu ----------
def principled(name, color, metal=0.0, rough=0.5, **kw):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*color, 1); b.inputs['Metallic'].default_value = metal; b.inputs['Roughness'].default_value = rough
    for k, v in kw.items(): b.inputs[k].default_value = v
    return m
def emissive(name, color, strength):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    e = nt.nodes.new('ShaderNodeEmission'); e.inputs['Color'].default_value = (*color, 1); e.inputs['Strength'].default_value = strength
    o = nt.nodes.new('ShaderNodeOutputMaterial'); nt.links.new(e.outputs[0], o.inputs[0]); m['em'] = e.name
    return m
def ghostable(m):  # trộn với Transparent để làm mờ dần (hiệu ứng xuyên thấu)
    nt = m.node_tree; out = nt.nodes['Material Output']; bsdf = out.inputs['Surface'].links[0].from_node
    tr = nt.nodes.new('ShaderNodeBsdfTransparent'); mix = nt.nodes.new('ShaderNodeMixShader'); mix.inputs[0].default_value = 0.0
    nt.links.new(bsdf.outputs[0], mix.inputs[1]); nt.links.new(tr.outputs[0], mix.inputs[2]); nt.links.new(mix.outputs[0], out.inputs['Surface'])
    m['ghost'] = mix.name; return m
def set_ghost(m, f): m.node_tree.nodes[m['ghost']].inputs[0].default_value = f
def set_em(m, s): m.node_tree.nodes[m['em']].inputs['Strength'].default_value = s

M_GLASS = ghostable(principled('kinh_bep', (0.008, 0.008, 0.01), 0.0, 0.06, **{'Coat Weight': 1.0, 'Coat Roughness': 0.03}))
M_BODY = ghostable(principled('than_bep', (0.035, 0.035, 0.04), 0.3, 0.45))
M_PANEL = principled('bang_dieu_khien', (0.02, 0.02, 0.025), 0.0, 0.2)
M_DIGIT = emissive('so_do', (1.0, 0.12, 0.05), 6.0)
M_MARK = emissive('vach_kinh', (0.6, 0.6, 0.6), 0.25)
M_COPPER = principled('day_dong', (0.95, 0.58, 0.42), 1.0, 0.3, **{'Emission Color': (1.0, 0.45, 0.1, 1), 'Emission Strength': 0.0})
M_FERRITE = principled('ferit', (0.06, 0.06, 0.07), 0.2, 0.6)
M_STEEL = principled('inox', (0.78, 0.78, 0.8), 1.0, 0.22)
M_BASE = principled('day_noi', (0.72, 0.72, 0.74), 1.0, 0.3, **{'Emission Color': (1.0, 0.25, 0.04, 1), 'Emission Strength': 0.0})
M_WATER = principled('nuoc', (0.82, 0.9, 1.0), 0.0, 0.03, **{'Transmission Weight': 1.0, 'IOR': 1.33})
M_ICE = principled('da', (0.9, 0.96, 1.0), 0.0, 0.28, **{'Transmission Weight': 0.85, 'IOR': 1.31})
M_BUBBLE = principled('bot', (0.95, 0.97, 1.0), 0.0, 0.1, **{'Transmission Weight': 0.6})
M_FIELD = emissive('duong_suc', (0.25, 1.0, 0.45), 4.0)
M_EDDY = emissive('dong_foucault', (1.0, 0.45, 0.06), 5.0)
M_MAGNET = principled('nam_cham', (0.75, 0.06, 0.05), 0.0, 0.35)
M_LIGHT = emissive('den_xa', (1.0, 0.72, 0.42), 30.0)
# mặt bàn gỗ (vân bằng Wave Texture)
M_WOOD = principled('ban_go', (0.2, 0.11, 0.05), 0.0, 0.38)
nt = M_WOOD.node_tree; wv = nt.nodes.new('ShaderNodeTexWave'); wv.inputs['Scale'].default_value = 3.0; wv.inputs['Distortion'].default_value = 6.0
cr = nt.nodes.new('ShaderNodeValToRGB'); cr.color_ramp.elements[0].color = (0.10, 0.05, 0.02, 1); cr.color_ramp.elements[1].color = (0.28, 0.15, 0.07, 1)
nt.links.new(wv.outputs['Fac'], cr.inputs[0]); nt.links.new(cr.outputs[0], nt.nodes['Principled BSDF'].inputs['Base Color'])
# tường gạch phía sau
M_WALL = principled('tuong', (0.1, 0.12, 0.11), 0.0, 0.6)
nt = M_WALL.node_tree; br = nt.nodes.new('ShaderNodeTexBrick'); br.inputs['Scale'].default_value = 9.0
br.inputs['Color1'].default_value = (0.09, 0.11, 0.1, 1); br.inputs['Color2'].default_value = (0.12, 0.14, 0.13, 1); br.inputs['Mortar'].default_value = (0.03, 0.03, 0.03, 1)
nt.links.new(br.outputs['Color'], nt.nodes['Principled BSDF'].inputs['Base Color'])

def obj(o, m=None, smooth=True):
    if m: o.data.materials.clear(); o.data.materials.append(m)
    if smooth and hasattr(o.data, 'polygons'):
        for p in o.data.polygons: p.use_smooth = True
    return o
def cyl(r, depth, loc, m, verts=96, fill='NGON'):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=depth, location=loc, end_fill_type=fill); return obj(bpy.context.object, m)
def box(size, loc, m, bevel=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc); o = bpy.context.object; o.scale = size
    bpy.ops.object.transform_apply(scale=True)
    if bevel: b = o.modifiers.new('bv', 'BEVEL'); b.width = bevel; b.segments = 4
    return obj(o, m, smooth=bool(bevel))

# ---------- bàn, tường, đèn xa (tạo bokeh) ----------
bpy.ops.mesh.primitive_plane_add(size=6, location=(0, 0, 0)); obj(bpy.context.object, M_WOOD)
bpy.ops.mesh.primitive_plane_add(size=6, location=(0, 0.75, 1.0), rotation=(math.pi / 2, 0, 0)); obj(bpy.context.object, M_WALL)
for i in range(14):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.012 + 0.01 * hsh(i), location=(-0.9 + 1.8 * hsh(i * 3), 0.7, 0.18 + 0.55 * hsh(i * 7))); obj(bpy.context.object, M_LIGHT)

# ---------- bếp từ đơn ----------
GZ = 0.066                                   # mặt trên kính
GC = (0.0, 0.02)                             # tâm vùng nấu
BODY = box((0.36, 0.44, 0.058), (0, 0, 0.029), M_BODY, bevel=0.012)
GLASS = box((0.33, 0.33, 0.008), (GC[0], GC[1], GZ - 0.004), M_GLASS, bevel=0.003)
box((0.30, 0.07, 0.004), (0, -0.175, 0.059), M_PANEL)
bpy.ops.object.text_add(location=(-0.045, -0.188, 0.0615)); t = bpy.context.object; t.data.body = '2000W'; t.data.size = 0.022; obj(t, M_DIGIT, smooth=False)
for rr in (0.105, 0.112):   # vạch tròn in trên kính
    bpy.ops.mesh.primitive_torus_add(major_radius=rr, minor_radius=0.0006, major_segments=128, minor_segments=6, location=(GC[0], GC[1], GZ + 0.0002)); obj(bpy.context.object, M_MARK)
# cuộn dây đồng xoắn phẳng + thanh ferit
cu = bpy.data.curves.new('cuon_day', 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = 0.0024; cu.bevel_resolution = 3
sp = cu.splines.new('POLY'); N = 18 * 64; sp.points.add(N - 1)
for i in range(N):
    a = i * 2 * math.pi / 64; r = 0.022 + (0.105 - 0.022) * i / N
    sp.points[i].co = (GC[0] + r * math.cos(a), GC[1] + r * math.sin(a), 0.050, 1)
COIL = bpy.data.objects.new('cuon_day', cu); sc.collection.objects.link(COIL); obj(COIL, M_COPPER, smooth=False)
for k in range(8):
    a = k * math.pi / 4; o = box((0.085, 0.012, 0.006), (GC[0] + 0.065 * math.cos(a), GC[1] + 0.065 * math.sin(a), 0.043), M_FERRITE); o.rotation_euler = (0, 0, a)

# ---------- nồi inox (thân + đáy riêng để đáy có thể nóng đỏ), nước, bọt ----------
PR, PH = 0.10, 0.115
POT = cyl(PR - 0.0015, PH, (GC[0], GC[1], GZ + 0.008 + PH / 2), M_STEEL, fill='NOTHING')
s = POT.modifiers.new('day', 'SOLIDIFY'); s.thickness = 0.003; s.offset = 0
BASE = cyl(PR, 0.008, (GC[0], GC[1], GZ + 0.004), M_BASE)
bv = BASE.modifiers.new('bv', 'BEVEL'); bv.width = 0.002; bv.segments = 3
WATER = cyl(PR - 0.004, 0.072, (GC[0], GC[1], GZ + 0.008 + 0.036), M_WATER)
for side in (-1, 1):
    bpy.ops.mesh.primitive_torus_add(major_radius=0.022, minor_radius=0.005, location=(GC[0] + side * (PR + 0.012), GC[1], GZ + PH - 0.01), rotation=(math.pi / 2, 0, 0)); obj(bpy.context.object, M_STEEL)
POT_PARTS = [o for o in sc.objects if o.name.startswith(('Cylinder', 'Torus')) and o.location.z > GZ - 0.01 and abs(o.location.x - GC[0]) < 0.2 and o not in (GLASS,)]
# cắt 1/4 phía trước (chỉ bật ở S5)
bpy.ops.mesh.primitive_cube_add(size=1, location=(GC[0] - 0.15, GC[1] - 0.15, GZ + 0.1)); CUT = bpy.context.object; CUT.scale = (0.3, 0.3, 0.3); CUT.hide_render = True; CUT.hide_viewport = True
CUTMODS = []
for o in (POT, BASE, WATER):
    bo = o.modifiers.new('cat', 'BOOLEAN'); bo.object = CUT; bo.operation = 'DIFFERENCE'; bo.solver = 'EXACT'; bo.show_render = False; CUTMODS.append(bo)
BUBBLES = []
for i in range(40):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1, segments=12, ring_count=8, location=(0, 0, -1)); b = obj(bpy.context.object, M_BUBBLE); BUBBLES.append(b)
def bubbles(t, heat, cut=False):
    top = GZ + 0.008 + 0.072
    for i, b in enumerate(BUBBLES):
        if heat <= 0.05 or i >= int(40 * heat): b.location = (0, 0, -1); continue
        period = 0.7 + 0.6 * hsh(i); ph = ((t + hsh(i * 3) * period) % period) / period
        a = hsh(i * 5) * 2 * math.pi
        if cut and math.cos(a) < 0 and math.sin(a) < 0: a += math.pi   # bọt nằm trong phần nồi còn lại
        r = 0.085 * math.sqrt(hsh(i * 7)); size = (0.0018 + 0.0035 * hsh(i * 11)) * (0.6 + 0.8 * ph)
        b.location = (GC[0] + r * math.cos(a), GC[1] + r * math.sin(a), lerp(GZ + 0.012, top - 0.003, ph)); b.scale = (size,) * 3
# viên đá trên góc kính
ICE = box((0.026, 0.026, 0.024), (GC[0] + 0.122, GC[1] - 0.118, GZ + 0.012), M_ICE, bevel=0.005); ICE.rotation_euler = (0, 0, 0.35)

# ---------- đường sức từ (vòng kín quanh trục cuộn dây) + mũi chỉ chiều ----------
FIELD = []
for ri in (0.022, 0.05):
    for k in range(8):
        a = k * math.pi / 4 + (0.2 if ri > 0.03 else 0)
        rz = [(ri, 0.030), (ri, 0.058), (ri + 0.012, 0.068), (ri + 0.07, 0.070), (ri + 0.112, 0.062), (ri + 0.13, 0.048), (ri + 0.112, 0.036), (ri + 0.05, 0.034)]
        c = bpy.data.curves.new('duong_suc', 'CURVE'); c.dimensions = '3D'; c.bevel_depth = 0.0011; c.bevel_resolution = 2
        s_ = c.splines.new('NURBS'); s_.points.add(len(rz) - 1); s_.use_cyclic_u = True; s_.order_u = 4
        for j, (r, z) in enumerate(rz): s_.points[j].co = (GC[0] + r * math.cos(a), GC[1] + r * math.sin(a), z, 1)
        o = bpy.data.objects.new('duong_suc', c); sc.collection.objects.link(o); obj(o, M_FIELD, smooth=False); FIELD.append(o)
        bpy.ops.mesh.primitive_cone_add(vertices=12, radius1=0.0035, depth=0.009, location=(GC[0] + (ri + 0.13) * math.cos(a), GC[1] + (ri + 0.13) * math.sin(a), 0.048))
        cn = obj(bpy.context.object, M_FIELD); cn['a'] = a; FIELD.append(cn)
def field(show, t=0.0, f=0.5):
    s_ = math.sin(2 * math.pi * f * t)
    for o in FIELD:
        o.hide_render = not show
        if 'a' in o.keys():  # mũi tên ở mép ngoài: đi xuống khi dòng dương, đi lên khi dòng âm
            o.rotation_euler = (math.pi if s_ > 0 else 0.0, 0, 0)
    set_em(M_FIELD, 0.6 + 6.0 * abs(s_) if show else 0)
    M_COPPER.node_tree.nodes['Principled BSDF'].inputs['Emission Strength'].default_value = (0.3 + 2.2 * abs(s_)) if show else 0.0

# ---------- vòng dòng điện Foucault trong đáy nồi ----------
EDDY = []
for j, r in enumerate((0.025, 0.048, 0.07, 0.088)):
    bpy.ops.mesh.primitive_torus_add(major_radius=r, minor_radius=0.0016, major_segments=96, minor_segments=8, location=(GC[0], GC[1], GZ + 0.004)); EDDY.append(obj(bpy.context.object, M_EDDY))
def eddy(show, k=1.0):
    for o in EDDY: o.hide_render = not show
    set_em(M_EDDY, 6.0 * k)

# ---------- nam châm thử (S6) ----------
MAG = cyl(0.016, 0.006, (0, 0, -1), M_MAGNET, verts=48)

# ---------- ánh sáng ----------
def area(name, loc, target, energy, size, color):
    d = bpy.data.lights.new(name, 'AREA'); d.energy = energy; d.size = size; d.color = color
    o = bpy.data.objects.new(name, d); sc.collection.objects.link(o); o.location = loc
    o.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
area('chinh', (-0.7, -0.5, 0.9), (0, 0, 0.08), 70, 0.6, (1.0, 0.86, 0.7))
area('vien', (0.5, 0.6, 0.5), (0, 0, 0.08), 45, 0.4, (0.7, 0.85, 1.0))
area('tren', (0.0, 0.1, 1.2), (0, 0, 0), 15, 1.2, (1.0, 0.95, 0.9))
w = bpy.data.worlds.new('troi'); w.use_nodes = True; w.node_tree.nodes['Background'].inputs['Color'].default_value = (0.02, 0.02, 0.025, 1)
w.node_tree.nodes['Background'].inputs['Strength'].default_value = 1.0; sc.world = w

# ---------- máy quay, xuất hình ----------
cam_d = bpy.data.cameras.new('may_quay'); CAM = bpy.data.objects.new('may_quay', cam_d); sc.collection.objects.link(CAM); sc.camera = CAM
cam_d.sensor_fit = 'VERTICAL'; cam_d.sensor_height = 24; cam_d.dof.use_dof = True; cam_d.dof.aperture_fstop = 2.2
W_, H_ = map(int, args.res.split('x')); r = sc.render; r.engine = 'CYCLES'; r.resolution_x, r.resolution_y, r.resolution_percentage = W_, H_, 100
sc.cycles.device = 'CPU'; sc.cycles.samples = args.samples; sc.cycles.use_denoising = True; sc.cycles.use_adaptive_sampling = True
sc.cycles.max_bounces = 6; sc.cycles.transmission_bounces = 4; sc.cycles.adaptive_threshold = 0.03; sc.cycles.glossy_bounces = 4; sc.cycles.caustics_reflective = False; sc.cycles.caustics_refractive = False
r.image_settings.file_format = 'JPEG'; r.image_settings.quality = 92
try: sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Punchy'
except Exception: pass
def aim(loc, target, lens=50, fstop=2.2):
    CAM.location = loc; cam_d.lens = lens; cam_d.dof.aperture_fstop = fstop
    CAM.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
    cam_d.dof.focus_distance = (Vector(target) - Vector(loc)).length

def reset():
    set_ghost(M_GLASS, 0); set_ghost(M_BODY, 0); field(False); eddy(False)
    for m_ in CUTMODS: m_.show_render = False
    M_BASE.node_tree.nodes['Principled BSDF'].inputs['Emission Strength'].default_value = 0.0
    MAG.location = (0, 0, -1); ICE.hide_render = False
    for o in POT_PARTS + [WATER, BASE, POT]: o.rotation_euler = o.rotation_euler; o.hide_render = False

POT_HOME = {o.name: (o.location.copy(), o.rotation_euler.copy()) for o in POT_PARTS + [WATER, BASE, POT]}
def pot_at(dx, flip):  # dời nồi sang bên cạnh và úp ngược (S6)
    for o in POT_PARTS + [WATER, BASE, POT]:
        loc, rot = POT_HOME[o.name]
        if flip:
            o.location = (loc.x + dx, loc.y, (GZ + PH + 0.008) - (loc.z - GZ) - GZ + 0.0); o.rotation_euler = (math.pi, 0, 0)
        else: o.location = loc; o.rotation_euler = rot

def setup(shot, t):
    reset(); D = DUR[shot]; k = ease(t / D)
    if shot == 'S1':
        bubbles(t, 1.0); pot_at(0, False)
        tgt = (lerp(GC[0] + 0.06, GC[0] + 0.0, k), lerp(GC[1] - 0.09, GC[1] - 0.04, k), lerp(GZ + 0.02, GZ + 0.04, k))
        aim((lerp(0.40, 0.30, k), lerp(-0.62, -0.50, k), lerp(0.36, 0.28, k)), tgt, 42, 4.0)
    elif shot == 'S2':
        bubbles(t, 0.6); g = ease((t - 1.5) / 2.0); set_ghost(M_GLASS, 0.82 * g); set_ghost(M_BODY, 0.78 * g)
        aim((lerp(0.05, 0.14, k), lerp(-0.78, -0.58, k), lerp(0.42, 0.17, k)), (GC[0], GC[1], lerp(0.08, 0.055, k)), 42, 5.6)
    elif shot == 'S3':
        bubbles(t, 0.4); set_ghost(M_GLASS, 0.82); set_ghost(M_BODY, 0.78); field(True, t, 0.5)
        ang = math.radians(lerp(-35, 20, k)); d = 0.62
        aim((GC[0] + d * math.sin(ang), GC[1] - d * math.cos(ang), 0.16), (GC[0], GC[1], 0.07), 45, 6.0)
    elif shot == 'S5':
        heat = ease(t / 6.0); bubbles(t, 0.3 + 0.7 * heat, cut=True); set_ghost(M_GLASS, 0.5); ICE.hide_render = True
        for m_ in CUTMODS: m_.show_render = True
        eddy(True, 0.4 + 0.6 * abs(math.sin(math.pi * t * 0.5)) * 0 + 0.6 * ease(t / 2.0))
        for j, o in enumerate(EDDY): o.rotation_euler = (0, 0, (1 if j % 2 else -1) * t * 0.8)
        M_BASE.node_tree.nodes['Principled BSDF'].inputs['Emission Strength'].default_value = 1.6 * heat
        aim((GC[0] - lerp(0.36, 0.28, k), GC[1] - lerp(0.46, 0.38, k), lerp(0.26, 0.21, k)), (GC[0] - 0.03, GC[1] - 0.03, GZ + 0.04), 45, 5.6)
    elif shot == 'S6':
        ICE.hide_render = True; pot_at(0.55, True); bubbles(0, 0)
        top = PH + 0.008
        drop = ease((t - 1.4) / 0.6); MAG.location = (GC[0] + 0.55 + 0.03, GC[1] - 0.02, lerp(top + 0.12, top + 0.003, drop * drop))
        MAG.rotation_euler = (0, 0, 0)
        aim((GC[0] + 0.55 + lerp(0.14, 0.09, k), GC[1] - lerp(0.44, 0.36, k), lerp(0.34, 0.29, k)), (GC[0] + 0.55 + 0.02, GC[1] - 0.02, top), 50, 4.0)

n = int(DUR[args.shot] * FPS) + 1; frames = range(n)
if args.frames:
    a, _, b = args.frames.partition('-'); frames = range(int(a), int(b or a) + 1)
os.makedirs(args.out, exist_ok=True)
for f in frames:
    if not args.frames and os.path.exists(os.path.join(args.out, f'{f:04d}.jpg')): continue   # chạy lại thì bỏ qua khung đã có
    t0 = time.time(); setup(args.shot, f / FPS)
    r.filepath = os.path.join(os.path.abspath(args.out), f'{f:04d}.jpg'); bpy.ops.render.render(write_still=True)
    print(f'{args.shot} khung {f}/{n - 1}  {time.time() - t0:.1f}s', flush=True)
