"""bpy3d: thư viện dựng cảnh 3D cho video giải thích hiện tượng vật lí (Blender 5.x qua gói `bpy`, Cycles chạy CPU).

Dùng trong canh.py của từng video:
    import os, sys; sys.path.insert(0, '<đường dẫn tới thư mục scripts của skill>')
    import bpy3d as B
    args = B.args()                         # --shot --out --res --samples --frames
    B.new_scene(); B.render_setup(args)     # Cycles CPU, khử nhiễu, AgX Punchy, JPEG
    ...dựng vật thể, đặt setup(shot, t)...
    B.render_shot(args, DUR, setup)         # vòng xuất từng khung, chạy lại thì bỏ qua khung đã có

Đơn vị cảnh: mét. Chuyển động phải tính từ phương trình vật lí (xem B.integrate), không ước lượng bằng mắt.
"""
import argparse, math, os, sys, time
import bpy
from mathutils import Vector

FPS = 24

# ---------------- tiện ích số ----------------
def lerp(a, b, p): return a + (b - a) * p
def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))
def ease(x): x = clamp(x); return x * x * (3 - 2 * x)          # mượt hai đầu
def ease_out(x): x = clamp(x); return 1 - (1 - x) ** 3
def seg(t, a, b): return clamp((t - a) / (b - a))               # 0→1 trong khoảng [a, b]
def hsh(n): v = math.sin(n * 127.1 + 311.7) * 43758.5453; return v - math.floor(v)   # ngẫu nhiên cố định
def vlerp(a, b, p): return tuple(lerp(x, y, p) for x, y in zip(a, b))

def integrate(accel, x0, v0, t_end, dt=1e-4, fps=FPS, stop=None):
    """Giải x'' = accel(t, x, v) bằng Euler bán ẩn, trả về [(x, v)] lấy mẫu tại mỗi khung (t = f / fps).
    stop(t, x, v) -> True thì giữ nguyên vị trí từ đó (vd vật chạm đệm)."""
    x, v, t, out, nxt, frozen = x0, v0, 0.0, [], 0.0, False
    while t <= t_end + 1e-9:
        while nxt <= t + 1e-12: out.append((x, v)); nxt += 1.0 / fps
        if not frozen:
            v += accel(t, x, v) * dt; x += v * dt
            if stop and stop(t, x, v): v, frozen = 0.0, True
        t += dt
    return out

# ---------------- tham số dòng lệnh ----------------
def args(default_shot='S1', default_samples=16):
    ap = argparse.ArgumentParser()
    ap.add_argument('--shot', default=default_shot)
    ap.add_argument('--out', default=None, help='thư mục khung, mặc định ../frames/<shot>')
    ap.add_argument('--res', default='720x1280', help='khổ dọc 720x1280 là đủ, video ghép phóng lên 1080x1920')
    ap.add_argument('--samples', type=int, default=default_samples)
    ap.add_argument('--frames', default=None, help='vd 40 hoặc 0-50: chỉ xuất các khung này (để thử), luôn ghi đè')
    a = ap.parse_args(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:])
    if a.out is None: a.out = os.path.join('..', 'frames', a.shot)
    return a

# ---------------- cảnh, xuất hình ----------------
sc = None
def new_scene():
    global sc
    bpy.ops.wm.read_factory_settings(use_empty=True); sc = bpy.context.scene; return sc

def render_setup(a, bounces=6, transmission=4, threshold=0.03, look='AgX - Punchy'):
    W, H = map(int, a.res.split('x')); r = sc.render
    r.engine = 'CYCLES'; r.resolution_x, r.resolution_y, r.resolution_percentage = W, H, 100
    c = sc.cycles; c.device = 'CPU'; c.samples = a.samples; c.use_denoising = True; c.use_adaptive_sampling = True
    c.adaptive_threshold = threshold; c.max_bounces = bounces; c.glossy_bounces = 4; c.transmission_bounces = transmission
    c.caustics_reflective = False; c.caustics_refractive = False
    r.image_settings.file_format = 'JPEG'; r.image_settings.quality = 92
    try: sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = look
    except Exception: pass

def render_shot(a, dur, setup, fps=FPS):
    """dur: {shot: giây}. setup(shot, t) đặt mọi thứ cho thời điểm t (giây, tính từ đầu cảnh).
    Khung ghi ra <out>/0000.jpg…; in tiến độ dạng 'S1 khung 12/120  9.3s' (scripts/tien-do.sh đọc dòng này)."""
    if a.shot not in dur: raise SystemExit(f'--shot phải là một trong {list(dur)}')
    n = int(round(dur[a.shot] * fps)) + 1; frames = range(n)
    if a.frames:
        x, _, y = a.frames.partition('-'); frames = range(int(x), int(y or x) + 1)
    out = os.path.abspath(a.out); os.makedirs(out, exist_ok=True)
    for f in frames:
        path = os.path.join(out, f'{f:04d}.jpg')
        if not a.frames and os.path.exists(path): continue
        t0 = time.time(); setup(a.shot, f / fps)
        sc.render.filepath = path; bpy.ops.render.render(write_still=True)
        print(f'{a.shot} khung {f}/{n - 1}  {time.time() - t0:.1f}s', flush=True)

# ---------------- vật liệu ----------------
def principled(name, color, metal=0.0, rough=0.5, **kw):
    """kw: tên đầu vào của Principled BSDF, vd **{'Transmission Weight': 1, 'IOR': 1.33, 'Coat Weight': 1}."""
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*color, 1); b.inputs['Metallic'].default_value = metal; b.inputs['Roughness'].default_value = rough
    for k, v in kw.items(): b.inputs[k].default_value = v
    return m
def emissive(name, color, strength):
    """Vật liệu tự phát sáng (đường sức, dòng điện, tia sáng). Chỉnh độ sáng theo thời gian bằng set_em."""
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    e = nt.nodes.new('ShaderNodeEmission'); e.inputs['Color'].default_value = (*color, 1); e.inputs['Strength'].default_value = strength
    o = nt.nodes.new('ShaderNodeOutputMaterial'); nt.links.new(e.outputs[0], o.inputs[0]); m['em'] = e.name
    return m
def set_em(m, s): m.node_tree.nodes[m['em']].inputs['Strength'].default_value = s
def set_in(m, name, v):
    """Đổi một đầu vào Principled theo thời gian, vd set_in(M_BASE, 'Emission Strength', 1.5) để đáy nồi nóng đỏ."""
    m.node_tree.nodes['Principled BSDF'].inputs[name].default_value = v
def glow_on(m, color, strength=0.0):
    """Cho vật liệu Principled khả năng phát sáng (bật dần bằng set_in(m, 'Emission Strength', x))."""
    set_in(m, 'Emission Color', (*color, 1)); set_in(m, 'Emission Strength', strength); return m
def ghostable(m):
    """Thêm khả năng mờ dần (hiệu ứng xuyên thấu: vỏ máy, mặt kính trong suốt dần để lộ bên trong)."""
    nt = m.node_tree; out = nt.nodes['Material Output']; src = out.inputs['Surface'].links[0].from_node
    tr = nt.nodes.new('ShaderNodeBsdfTransparent'); mix = nt.nodes.new('ShaderNodeMixShader'); mix.inputs[0].default_value = 0.0
    nt.links.new(src.outputs[0], mix.inputs[1]); nt.links.new(tr.outputs[0], mix.inputs[2]); nt.links.new(mix.outputs[0], out.inputs['Surface'])
    m['ghost'] = mix.name; return m
def set_ghost(m, f): m.node_tree.nodes[m['ghost']].inputs[0].default_value = f   # 0 đặc → 1 vô hình (dùng 0,75–0,85)

def wood(name='go', c0=(0.10, 0.05, 0.02), c1=(0.28, 0.15, 0.07), scale=3.0):
    m = principled(name, c1, 0.0, 0.38); nt = m.node_tree
    wv = nt.nodes.new('ShaderNodeTexWave'); wv.inputs['Scale'].default_value = scale; wv.inputs['Distortion'].default_value = 6.0
    cr = nt.nodes.new('ShaderNodeValToRGB'); cr.color_ramp.elements[0].color = (*c0, 1); cr.color_ramp.elements[1].color = (*c1, 1)
    nt.links.new(wv.outputs['Fac'], cr.inputs[0]); nt.links.new(cr.outputs[0], nt.nodes['Principled BSDF'].inputs['Base Color']); return m
def brick(name='gach', c0=(0.09, 0.11, 0.10), c1=(0.12, 0.14, 0.13), scale=9.0):
    m = principled(name, c0, 0.0, 0.6); nt = m.node_tree; br = nt.nodes.new('ShaderNodeTexBrick'); br.inputs['Scale'].default_value = scale
    br.inputs['Color1'].default_value = (*c0, 1); br.inputs['Color2'].default_value = (*c1, 1); br.inputs['Mortar'].default_value = (0.03, 0.03, 0.03, 1)
    nt.links.new(br.outputs['Color'], nt.nodes['Principled BSDF'].inputs['Base Color']); return m

# Vật liệu hay dùng (gọi hàm để tạo mới, mỗi cảnh một bộ)
def M_copper(): return principled('dong', (0.955, 0.62, 0.50), 1.0, 0.26)
def M_steel(): return principled('inox', (0.78, 0.78, 0.80), 1.0, 0.22)
def M_glass(): return principled('thuy_tinh', (0.95, 0.97, 1.0), 0.0, 0.02, **{'Transmission Weight': 1.0, 'IOR': 1.45})
def M_water(): return principled('nuoc', (0.82, 0.90, 1.0), 0.0, 0.03, **{'Transmission Weight': 1.0, 'IOR': 1.33})
def M_plastic(color, rough=0.4): return principled('nhua', color, 0.0, rough)

# ---------------- hình khối ----------------
def obj(o, m=None, smooth=True):
    if m is not None: o.data.materials.clear(); o.data.materials.append(m)
    if smooth and hasattr(o.data, 'polygons'):
        for p in o.data.polygons: p.use_smooth = True
    return o
def link(o): sc.collection.objects.link(o); return o
def empty(name='nhom', loc=(0, 0, 0)): e = link(bpy.data.objects.new(name, None)); e.location = loc; return e
def cyl(r, depth, loc, m, verts=96, fill='NGON', rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=depth, location=loc, rotation=rot, end_fill_type=fill); return obj(bpy.context.object, m)
def tube(r_out, r_in, depth, loc, m, verts=96):
    """Ống rỗng có thành dày (r_out − r_in)."""
    o = cyl((r_out + r_in) / 2, depth, loc, m, verts, fill='NOTHING'); s = o.modifiers.new('day', 'SOLIDIFY'); s.thickness = r_out - r_in; s.offset = 0; return o
def box(size, loc, m, bevel=0.0, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot); o = bpy.context.object; o.scale = size
    bpy.ops.object.transform_apply(scale=True)
    if bevel: b = o.modifiers.new('bv', 'BEVEL'); b.width = bevel; b.segments = 4
    return obj(o, m, smooth=bool(bevel))
def sphere(r, loc, m, seg_=32, ring=16):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, segments=seg_, ring_count=ring, location=loc); return obj(bpy.context.object, m)
def torus(R, r, loc, m, rot=(0, 0, 0), seg_=96):
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=r, major_segments=seg_, minor_segments=10, location=loc, rotation=rot); return obj(bpy.context.object, m)
def text3d(s, loc, size, m, rot=(0, 0, 0), extrude=0.0):
    bpy.ops.object.text_add(location=loc, rotation=rot); t = bpy.context.object; t.data.body = s; t.data.size = size; t.data.extrude = extrude
    t.data.align_x = 'CENTER'; return obj(t, m, smooth=False)
def curve(points, m, bevel=0.002, cyclic=False, smooth=False, name='duong'):
    """Đường cong qua các điểm (dây dẫn, đường sức, quỹ đạo). smooth=True dùng NURBS cho đường mềm."""
    c = bpy.data.curves.new(name, 'CURVE'); c.dimensions = '3D'; c.bevel_depth = bevel; c.bevel_resolution = 3
    s = c.splines.new('NURBS' if smooth else 'POLY'); s.points.add(len(points) - 1); s.use_cyclic_u = cyclic
    if smooth: s.order_u = 4; s.use_endpoint_u = not cyclic
    for i, p in enumerate(points): s.points[i].co = (*p, 1)
    return obj(link(bpy.data.objects.new(name, c)), m, smooth=False)
def spiral(center, r0, r1, turns, z, m, bevel=0.0024, n_per_turn=64):
    """Cuộn dây phẳng (xoắn ốc Archimedes) như cuộn dây bếp từ, sạc không dây."""
    N = int(turns * n_per_turn); pts = []
    for i in range(N):
        a = i * 2 * math.pi / n_per_turn; r = r0 + (r1 - r0) * i / N; pts.append((center[0] + r * math.cos(a), center[1] + r * math.sin(a), z))
    return curve(pts, m, bevel)
def helix(center, r, z0, z1, turns, m, bevel=0.002, n_per_turn=48):
    """Ống dây (solenoid) trục đứng."""
    N = int(turns * n_per_turn)
    pts = [(center[0] + r * math.cos(i * 2 * math.pi / n_per_turn), center[1] + r * math.sin(i * 2 * math.pi / n_per_turn), lerp(z0, z1, i / N)) for i in range(N + 1)]
    return curve(pts, m, bevel)

def cutaway(objs, loc, size):
    """Cắt bỏ một khối hộp khỏi các vật (mặt cắt để nhìn vào trong). Trả về danh sách modifier; bật/tắt theo cảnh bằng show_cut."""
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc); k = bpy.context.object; k.scale = size; k.hide_render = True; k.hide_viewport = True
    mods = []
    for o in objs:
        b = o.modifiers.new('cat', 'BOOLEAN'); b.object = k; b.operation = 'DIFFERENCE'; b.solver = 'EXACT'; mods.append(b)
    return mods
def show_cut(mods, on):
    for b in mods: b.show_render = on

# ---------------- mũi tên 3D (vectơ lực, vận tốc ngay trong cảnh 3D) ----------------
def arrow3d(m, radius=0.004, head=0.018, name='mui_ten'):
    """Tạo mũi tên đơn vị; đặt đầu, cuối mỗi khung bằng place_arrow. Dùng vật liệu emissive màu đại lượng."""
    e = empty(name)
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=radius, depth=1, location=(0, 0, 0.5)); s = obj(bpy.context.object, m)
    bpy.ops.object.transform_apply(location=True)
    bpy.ops.mesh.primitive_cone_add(vertices=24, radius1=radius * 2.6, depth=head, location=(0, 0, head / 2)); c = obj(bpy.context.object, m)
    bpy.ops.object.transform_apply(location=True)
    s.parent = e; c.parent = e; e['head'] = head; e['s'] = s.name; e['c'] = c.name; return e
def place_arrow(e, start, end, show=True):
    v = Vector(end) - Vector(start); L = v.length; s, c = bpy.data.objects[e['s']], bpy.data.objects[e['c']]
    vis = show and L > 1e-4; s.hide_render = c.hide_render = not vis
    if not vis: return
    h = min(e['head'], L * 0.5); e.location = start; e.rotation_euler = Vector((0, 0, 1)).rotation_difference(v.normalized()).to_euler()
    s.scale = (1, 1, max(L - h, 1e-4)); c.location = (0, 0, L - h); c.scale = (1, 1, h / e['head'])

# ---------------- ánh sáng, phông ----------------
def area(name, loc, target, energy, size, color=(1, 1, 1)):
    d = bpy.data.lights.new(name, 'AREA'); d.energy = energy; d.size = size; d.color = color
    o = link(bpy.data.objects.new(name, d)); o.location = loc
    o.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler(); return o
def world(color=(0.02, 0.02, 0.025), strength=1.0):
    w = bpy.data.worlds.new('troi'); w.use_nodes = True; bg = w.node_tree.nodes['Background']
    bg.inputs['Color'].default_value = (*color, 1); bg.inputs['Strength'].default_value = strength; sc.world = w; return w

def studio_toi(center=(0, 0, 0), s=1.0, floor='go', bokeh=14):
    """Phông ĐIỆN ẢNH (nền tối, ấm): mặt bàn gỗ, tường gạch tối phía sau, chấm đèn xa tạo bokeh, 3 đèn vùng (chính ấm, viền lạnh, đỉnh).
    s: cỡ vật chính tính bằng mét (bếp từ ≈ 0,35; ống nghiệm ≈ 0,2; con lắc ≈ 1)."""
    cx, cy, cz = center
    bpy.ops.mesh.primitive_plane_add(size=20 * s, location=(cx, cy, cz)); obj(bpy.context.object, wood(scale=3.5) if floor == 'go' else principled('san', (0.03, 0.03, 0.035), 0.0, 0.35))
    bpy.ops.mesh.primitive_plane_add(size=20 * s, location=(cx, cy + 2.2 * s, cz + 3 * s), rotation=(math.pi / 2, 0, 0)); obj(bpy.context.object, brick(scale=10.5, c0=(0.018, 0.021, 0.021), c1=(0.028, 0.032, 0.03)))
    lamp = emissive('den_xa', (1.0, 0.72, 0.42), 30.0)
    for i in range(bokeh):
        sphere((0.035 + 0.03 * hsh(i)) * s, (cx - 2.6 * s + 5.2 * s * hsh(i * 3), cy + 2.0 * s, cz + 0.5 * s + 1.6 * s * hsh(i * 7)), lamp, 12, 8)
    area('chinh', (cx - 2.0 * s, cy - 1.4 * s, cz + 2.6 * s), (cx, cy, cz + 0.2 * s), 70 * s * s / 0.12, 1.7 * s, (1.0, 0.86, 0.7))
    area('vien', (cx + 1.4 * s, cy + 1.7 * s, cz + 1.4 * s), (cx, cy, cz + 0.2 * s), 45 * s * s / 0.12, 1.1 * s, (0.7, 0.85, 1.0))
    area('tren', (cx, cy + 0.3 * s, cz + 3.4 * s), (cx, cy, cz), 15 * s * s / 0.12, 3.4 * s, (1.0, 0.95, 0.9))
    world((0.02, 0.02, 0.025), 1.0)
def studio_sang(center=(0, 0, 0), s=1.0, color=(0.62, 0.55, 0.44)):
    """Phông PHÒNG THÍ NGHIỆM (sáng, sạch): phông cong liền sàn và tường, 3 đèn vùng mềm. Hợp video so sánh hai thí nghiệm."""
    import bmesh
    cx, cy, cz = center; me = bpy.data.meshes.new('phong'); bm = bmesh.new(); prof = []
    for i in range(14): prof.append((-3.0 + 3.6 * i / 13, 0.0))
    for i in range(1, 17): a = (math.pi / 2) * i / 16; prof.append((0.6 + 0.9 * math.sin(a), 0.9 - 0.9 * math.cos(a)))
    for i in range(1, 8): prof.append((1.5, 0.9 + 3.5 * i / 7))
    rows = [[bm.verts.new((cx + x * s, cy + y * s, cz + z * s)) for (y, z) in prof] for x in (-4.0, 4.0)]
    for i in range(len(prof) - 1): bm.faces.new((rows[0][i], rows[0][i + 1], rows[1][i + 1], rows[1][i]))
    bm.to_mesh(me); bm.free(); obj(link(bpy.data.objects.new('phong', me)), principled('phong', color, 0.0, 0.92))
    tgt = (cx, cy, cz + 0.7 * s)
    area('chinh', (cx - 1.3 * s, cy - 1.4 * s, cz + 2.2 * s), tgt, 150 * s * s, 1.6 * s, (1.0, 0.94, 0.86))
    area('phu', (cx + 1.6 * s, cy - 1.1 * s, cz + 1.0 * s), tgt, 45 * s * s, 1.2 * s, (0.86, 0.92, 1.0))
    area('vien', (cx + 0.6 * s, cy + 0.9 * s, cz + 2.3 * s), tgt, 80 * s * s, 1.0 * s, (1.0, 0.95, 0.9))
    world((0.82, 0.78, 0.72), 0.25)

# ---------------- máy quay ----------------
CAM = None
def camera(sensor_h=24):
    global CAM
    d = bpy.data.cameras.new('may_quay'); CAM = link(bpy.data.objects.new('may_quay', d)); sc.camera = CAM
    d.sensor_fit = 'VERTICAL'; d.sensor_height = sensor_h; d.dof.use_dof = False; return CAM
def aim(loc, target, lens=50, fstop=None):
    """Đặt máy quay nhìn vào target. fstop (vd 2,8) bật xoá phông, lấy nét đúng vào target; None thì nét toàn cảnh."""
    d = CAM.data; CAM.location = loc; d.lens = lens
    CAM.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
    d.dof.use_dof = fstop is not None
    if fstop: d.dof.aperture_fstop = fstop; d.dof.focus_distance = (Vector(target) - Vector(loc)).length
def orbit(center, dist, ang_deg, height):
    """Vị trí máy quay trên vòng tròn quanh center (0° = phía trước, trục −y)."""
    a = math.radians(ang_deg); return (center[0] + dist * math.sin(a), center[1] - dist * math.cos(a), height)
