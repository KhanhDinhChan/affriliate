"""Cảnh 3D: thả nam châm và một vật không có từ tính vào hai ống đồng (ống cắt dọc để nhìn vào trong).
Chạy bằng Python có gói bpy (Blender 5.x):
  python canh.py --shot A --out ../frames/A            # cảnh rộng: treo 2 s rồi thả (9 s)
  python canh.py --shot B --out ../frames/B            # cận cảnh: nam châm rơi đều, vòng dòng điện Foucault phát sáng (4 s)
  python canh.py --shot A --frames 80 --out /tmp/x     # chỉ xuất khung 80 để thử
Chuyển động tính từ phương trình thật: m·dv/dt = m·g − k·v (lực hãm điện từ tỉ lệ với v, chỉ khi nam châm ở trong ống).
Số liệu minh hoạ: tốc độ giới hạn v_T = 0,2 m/s (k/m = g/v_T); ống dài 1 m."""
import argparse, math, os, sys, time
import bpy
from mathutils import Vector

ap = argparse.ArgumentParser()
ap.add_argument('--shot', default='A'); ap.add_argument('--engine', default='CYCLES'); ap.add_argument('--out', default='frames')
ap.add_argument('--res', default='720x1280'); ap.add_argument('--samples', type=int, default=32)
ap.add_argument('--frames', default=None, help='vd 0-50 hoặc 80')
args = ap.parse_args(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:])

FPS = 24
G, VT = 9.8, 0.2
KM = G / VT                                  # k/m (1/s)
PZ0, PZ1 = 0.25, 1.25                        # đáy, miệng ống
R_OUT, R_IN = 0.05, 0.042
MH, MR = 0.08, 0.034                         # chiều cao, bán kính nam châm (và vật so sánh)
XM, XO = -0.16, 0.16                         # ống nam châm (trái), ống vật không từ tính (phải)
PAD = 0.03                                   # mặt đệm cao su dưới đáy ống
Z_START = 1.36                               # tâm vật lúc treo
T_DROP = 2.0                                 # giây thả (cảnh A)

# ---------- mô phỏng ----------
def simulate(braking, t_end, dt=1e-4):
    z, v, t, out = Z_START, 0.0, 0.0, []
    nxt = 0.0
    while t <= t_end + 1e-9:
        while nxt <= t + 1e-12:
            out.append(z); nxt += 1.0 / FPS
        if t >= T_DROP and z - MH / 2 > PAD:
            lo, hi = max(z - MH / 2, PZ0), min(z + MH / 2, PZ1)
            inside = max(0.0, hi - lo) / MH
            a = G - (KM * v * inside if braking else 0.0)
            v += a * dt; z -= v * dt
            if z - MH / 2 <= PAD: z, v = PAD + MH / 2, 0.0
        t += dt
    return out

# ---------- dựng cảnh ----------
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene

def mat(name, color, metal=0.0, rough=0.5, emit=None, strength=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes.get('Principled BSDF')
    b.inputs['Base Color'].default_value = (*color, 1); b.inputs['Metallic'].default_value = metal; b.inputs['Roughness'].default_value = rough
    if emit:
        b.inputs['Emission Color'].default_value = (*emit, 1); b.inputs['Emission Strength'].default_value = strength
    return m

M_COPPER = mat('dong', (0.955, 0.62, 0.50), 1.0, 0.26)
M_N = mat('cuc_N', (0.78, 0.07, 0.07), 0.0, 0.32)
M_S = mat('cuc_S', (0.07, 0.22, 0.72), 0.0, 0.32)
M_GRAY = mat('vat_xam', (0.62, 0.63, 0.66), 0.7, 0.35)
M_BACK = mat('phong', (0.62, 0.55, 0.44), 0.0, 0.92)
M_DARK = mat('gia', (0.09, 0.09, 0.10), 0.6, 0.4)
M_RUBBER = mat('dem', (0.12, 0.12, 0.12), 0.0, 0.8)
M_RING = mat('vong_dong_dien', (1.0, 0.4, 0.05), 0.0, 0.5, emit=(1.0, 0.32, 0.02), strength=2.5)

def link(o, m=None):
    if m:
        o.data.materials.clear(); o.data.materials.append(m)
    for p in o.data.polygons: p.use_smooth = True
    return o

# phông nền cong (sàn + tường liền khối)
import bmesh
me = bpy.data.meshes.new('phong'); bm = bmesh.new(); prof = []
for i in range(14): prof.append((-3.0 + 3.6 * i / 13, 0.0))
for i in range(1, 17): a = (math.pi / 2) * i / 16; prof.append((0.6 + 0.9 * math.sin(a), 0.9 - 0.9 * math.cos(a)))
for i in range(1, 8): prof.append((1.5, 0.9 + 3.5 * i / 7))
rows = []
for x in (-4.0, 4.0): rows.append([bm.verts.new((x, y, z)) for (y, z) in prof])
for i in range(len(prof) - 1): bm.faces.new((rows[0][i], rows[0][i + 1], rows[1][i + 1], rows[1][i]))
bm.to_mesh(me); bm.free(); back = bpy.data.objects.new('phong', me); sc.collection.objects.link(back); link(back, M_BACK)

def tube(x):
    bpy.ops.mesh.primitive_cylinder_add(vertices=96, radius=(R_OUT + R_IN) / 2, depth=PZ1 - PZ0, end_fill_type='NOTHING', location=(x, 0, (PZ0 + PZ1) / 2))
    o = bpy.context.object; link(o, M_COPPER)
    so = o.modifiers.new('day', 'SOLIDIFY'); so.thickness = R_OUT - R_IN; so.offset = 0
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x, -0.5, (PZ0 + PZ1) / 2)); cut = bpy.context.object
    cut.scale = (0.4, 1.0, 2.0); cut.hide_render = True; cut.hide_viewport = True
    bo = o.modifiers.new('cat_doc', 'BOOLEAN'); bo.object = cut; bo.operation = 'DIFFERENCE'; bo.solver = 'EXACT'
    return o
tube(XM); tube(XO)
for x in (XM, XO):
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=0.09, depth=PAD, location=(x, 0, PAD / 2)); link(bpy.context.object, M_RUBBER)
# giá kẹp
bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=0.014, depth=1.15, location=(0, 0.16, 0.575)); link(bpy.context.object, M_DARK)
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0.16, 0.012)); o = bpy.context.object; o.scale = (0.5, 0.22, 0.024); link(o, M_DARK)
for z in (0.55, 1.05):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0.105, z)); o = bpy.context.object; o.scale = (0.44, 0.02, 0.022); link(o, M_DARK)

def body(name, x, top, bottom):
    bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=MR, depth=MH / 2, location=(0, 0, MH / 4)); a = link(bpy.context.object, top)
    bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=MR, depth=MH / 2, location=(0, 0, -MH / 4)); b = link(bpy.context.object, bottom)
    for o in (a, b): o.modifiers.new('vat', 'BEVEL').width = 0.003
    e = bpy.data.objects.new(name, None); sc.collection.objects.link(e); a.parent = e; b.parent = e; e.location = (x, 0, Z_START)
    return e
MAG = body('nam_cham', XM, M_S, M_N)          # S ở trên, N ở dưới
OBJ = body('vat_khong_tu', XO, M_GRAY, M_GRAY)

def ring(sign):  # vòng dòng điện cảm ứng + 3 mũi nhỏ chỉ chiều dòng điện (sign +1: ngược chiều kim đồng hồ nhìn từ trên)
    e = bpy.data.objects.new('vong', None); sc.collection.objects.link(e)
    bpy.ops.mesh.primitive_torus_add(major_radius=R_IN + 0.0005, minor_radius=0.0032, major_segments=96, minor_segments=12); t = link(bpy.context.object, M_RING); t.parent = e
    for k in range(3):
        a = k * 2 * math.pi / 3
        bpy.ops.mesh.primitive_cone_add(vertices=16, radius1=0.008, depth=0.02, location=(R_IN * math.cos(a), R_IN * math.sin(a), 0))
        c = link(bpy.context.object, M_RING); c.rotation_euler = (math.pi / 2 * sign * -1, 0, a) if False else (0, 0, 0)
        tangent = Vector((-math.sin(a), math.cos(a), 0)) * sign
        c.rotation_euler = Vector((0, 0, 1)).rotation_difference(tangent).to_euler(); c.parent = e
    e['sign'] = sign
    return e
RING_LO, RING_HI = ring(+1), ring(-1)

# ánh sáng + nền trời
def area(name, loc, energy, size, color):
    d = bpy.data.lights.new(name, 'AREA'); d.energy = energy; d.size = size; d.color = color
    o = bpy.data.objects.new(name, d); sc.collection.objects.link(o); o.location = loc
    o.rotation_euler = (Vector((0, 0, 0.7)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
area('chinh', (-1.3, -1.4, 2.2), 150, 1.6, (1.0, 0.94, 0.86))
area('phu', (1.6, -1.1, 1.0), 45, 1.2, (0.86, 0.92, 1.0))
area('vien', (0.6, 0.9, 2.3), 80, 1.0, (1.0, 0.95, 0.9))
w = bpy.data.worlds.new('troi'); w.use_nodes = True; w.node_tree.nodes['Background'].inputs['Color'].default_value = (0.82, 0.78, 0.72, 1)
w.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.25; sc.world = w

cam_d = bpy.data.cameras.new('may_quay'); cam = bpy.data.objects.new('may_quay', cam_d); sc.collection.objects.link(cam); sc.camera = cam
cam_d.sensor_fit = 'VERTICAL'; cam_d.sensor_height = 24

W_, H_ = map(int, args.res.split('x'))
r = sc.render; r.engine = args.engine; r.resolution_x, r.resolution_y, r.resolution_percentage = W_, H_, 100
sc.cycles.device = 'CPU'; sc.cycles.samples = args.samples; sc.cycles.use_denoising = True; sc.cycles.use_adaptive_sampling = True
sc.cycles.max_bounces = 6; sc.cycles.glossy_bounces = 4; sc.cycles.transmission_bounces = 2
r.image_settings.file_format = 'JPEG'; r.image_settings.quality = 92
try: sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Punchy'
except Exception: pass

def aim(loc, target, lens):
    cam.location = loc; cam_d.lens = lens
    cam.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
ease = lambda x: (lambda x: x * x * (3 - 2 * x))(min(1, max(0, x)))

def place_rings(zm, t, visible):
    for e, off in ((RING_LO, -0.075), (RING_HI, 0.075)):
        e.location = (XM, 0, zm + off); e.rotation_euler = (0, 0, e['sign'] * t * 2.4)
        hide = not visible
        for c in e.children: c.hide_render = hide

# ---------- cảnh ----------
if args.shot == 'A':
    T_END = 9.0
    zm, zo = simulate(True, T_END), simulate(False, T_END)
    n = len(zm)
    def setup(f):
        t = f / FPS; MAG.location.z = zm[f]; OBJ.location.z = zo[f]
        inside = PZ0 + MH / 2 < zm[f] < PZ1 - MH / 2 and t > T_DROP
        place_rings(zm[f], t, inside)
        k = ease(t / T_END); aim((0.0, lerp(-2.95, -2.6, k), lerp(0.70, 0.66, k)), (0.0, 0, 0.64), 40)
elif args.shot == 'B':
    T_END = 4.0; n = int(T_END * FPS) + 1
    OBJ.location = (XO, 0, -5)                 # cận cảnh chỉ có ống nam châm
    def setup(f):
        t = f / FPS; z = 1.12 - VT * t; MAG.location.z = z; place_rings(z, t, True)
        ang = math.radians(lerp(-32, -12, ease(t / T_END))); d = 0.62
        aim((XM + d * math.sin(ang), -d * math.cos(ang), z + 0.02), (XM, 0, z - 0.03), 50)
else:
    raise SystemExit('shot phải là A hoặc B')

def lerp(a, b, p): return a + (b - a) * p

frames = range(n)
if args.frames:
    a, _, b = args.frames.partition('-'); frames = range(int(a), int(b or a) + 1)
os.makedirs(args.out, exist_ok=True)
for f in frames:
    t0 = time.time(); setup(f)
    r.filepath = os.path.join(os.path.abspath(args.out), f'{f:04d}.jpg')
    bpy.ops.render.render(write_still=True)
    print(f'khung {f}/{n - 1}  {time.time() - t0:.1f}s', flush=True)
