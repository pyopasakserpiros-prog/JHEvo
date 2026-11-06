#!/usr/bin/env python3
"""วาดแผนที่ยุทธภพใหม่ (world_atlas_terrain.jpg) แบบภาพวาดหมึก-สีน้ำบนกระดาษโบราณ

ขั้นตอน
  1) node tools/dump_atlas_nodes.js > nodes.json      (พิกัดจริงของทุกสถานที่ในเกม)
  2) python3 tools/generate_world_atlas_terrain.py nodes.json OUT_DIR [ขนาดภาพ]
     -> OUT_DIR/base.png  ภูมิประเทศ+แม่น้ำ+ทะเลสาบ
        OUT_DIR/atlas.svg ชั้นลายเส้นหมึก (ภูเขา ป่า ทะเลทราย สิ่งก่อสร้างประจำสถานที่)
  3) node tools/render_world_atlas.js OUT_DIR ../assets/world_atlas_terrain.jpg

พิกัดทั้งหมดเป็นเปอร์เซ็นต์ 0-100 เหมือนกับ x,y ของหมุดบนแผนที่ในเกม ภูมิประเทศถูกออกแบบให้
หมุดทุกจุดตกบนพื้นที่ชนิดเดียวกับที่ข้อมูลเกมระบุ (terrain) และมีตัวตรวจสอบท้ายสคริปต์
"""
import json, math, os, random, sys
import numpy as np
import cv2
from scipy import ndimage as ndi

nodes_path = sys.argv[1]
out_dir = sys.argv[2]
N = int(sys.argv[3]) if len(sys.argv) > 3 else 2048
os.makedirs(out_dir, exist_ok=True)
DATA = json.load(open(nodes_path, encoding='utf-8'))
NODES = DATA['nodes']
S = N / 100.0  # พิกเซลต่อหนึ่งหน่วยแผนที่

# ---------------------------------------------------------------- เครื่องมือพื้นฐาน
def smooth(a, b, x):
    t = np.clip((x - a) / (b - a), 0.0, 1.0)
    return t * t * (3 - 2 * t)

def fbm(seed, cells=4, octaves=5, gain=0.5, size=None):
    size = size or N
    rng = np.random.default_rng(seed)
    out = np.zeros((size, size), np.float32)
    amp, tot, c = 1.0, 0.0, cells
    for _ in range(octaves):
        g = rng.random((c + 2, c + 2)).astype(np.float32)
        out += amp * cv2.resize(g, (size, size), interpolation=cv2.INTER_CUBIC)
        tot += amp; amp *= gain; c = int(c * 2)
    out /= tot
    lo, hi = np.percentile(out, 1), np.percentile(out, 99)
    return np.clip((out - lo) / (hi - lo), 0, 1)

def blur(a, sigma):
    return cv2.GaussianBlur(a, (0, 0), sigma)

U, V = np.meshgrid(np.linspace(0, 100, N, dtype=np.float32), np.linspace(0, 100, N, dtype=np.float32))
# เส้นขอบธรรมชาติ: บิดพิกัดด้วยสัญญาณรบกวน
WX = (fbm(11, 3, 4) - 0.5) * 11.0
WY = (fbm(12, 3, 4) - 0.5) * 11.0
Uw, Vw = U + WX, V + WY

def ell(cx, cy, rx, ry, rot=0.0, u=None, v=None):
    """ระยะแบบวงรี (1 = ขอบ)"""
    u = Uw if u is None else u
    v = Vw if v is None else v
    c, s = math.cos(rot), math.sin(rot)
    dx, dy = u - cx, v - cy
    x = (dx * c + dy * s) / rx
    y = (-dx * s + dy * c) / ry
    return np.sqrt(x * x + y * y)

def blob(cx, cy, rx, ry, rot=0.0, soft=0.45):
    d = ell(cx, cy, rx, ry, rot)
    return 1.0 - smooth(1.0 - soft, 1.0 + soft * 0.4, d)

# ---------------------------------------------------------------- เค้าโครงภูมิประเทศ (0..1)
n1, n2, n3 = fbm(21, 6, 5), fbm(22, 14, 4), fbm(23, 30, 3)

# ทิวเขาเหนือ + หิมะ
north = np.maximum.reduce([
    blob(48, 11, 40, 20, 0.0), blob(30, 22, 17, 12, -0.3), blob(66, 24, 17, 12, 0.2),
])
north = np.clip(north * (0.78 + 0.5 * n1), 0, 1)
snow = smooth(0.28, 0.62, north) * smooth(31, 9, Vw)
snow = np.maximum(snow, blob(52, 6, 26, 9) * 0.9)
# ที่ราบสูงหน้าผาตะวันออกเฉียงเหนือ
plateau = blob(89, 12, 15, 15, 0.1)
# พื้นที่ภูเขาไฟ/ขี้เถ้าตะวันตกเฉียงเหนือ
volc = blob(11, 25, 15, 17, 0.2) * smooth(2, 10, U + 4 * n2)
# ทะเลทรายตะวันตก
desert = np.maximum(blob(16, 55, 21, 27, 0.15), blob(26, 57, 11, 15)) * (1 - 0.9 * volc)
desert = np.clip(desert * (0.85 + 0.3 * n2), 0, 1)
badland = desert * smooth(0.50, 0.76, fbm(31, 7, 4)) * smooth(26, 16, U)  # หินแดงเป็นชั้น
# หุบเขาป่าใจกลาง
forest_c = blob(44, 56, 18, 16, 0.15)
forest_e = blob(76, 30, 11, 9)
forest_sw = blob(18, 86, 14, 10) * 0.8
forest = np.clip(np.maximum.reduce([forest_c, forest_e, forest_sw]) * (0.75 + 0.5 * n2), 0, 1)
# ที่ราบตะวันออก (นาข้าว)
plains = np.maximum(blob(79, 57, 18, 17, -0.1), blob(70, 44, 9, 7))
plains = np.clip(plains * (0.8 + 0.4 * n1), 0, 1)
# เนินเขาใจกลาง (เจดีย์เก้าวิถี, หุบเขาหมัดวัชระ)
hills = np.maximum.reduce([blob(52, 38, 9, 8), blob(58, 58, 7, 6), blob(34, 46, 8, 6)])

# ---------------------------------------------------------------- น้ำ: ทะเลสาบมังกรหลับ + แม่น้ำ
lf = np.maximum.reduce([1 - ell(55, 88, 29, 11.5), 1 - ell(78, 84, 13, 12.5, 0.2), 1 - ell(37, 85, 9.5, 6.5, -0.25), 1 - ell(63, 76, 7, 3.5)])
lf = lf + (fbm(41, 7, 5) - 0.5) * 0.75
lake = smooth(0.0, 0.05, lf)
# หมู่เกาะ/แหลมสำหรับสถานที่บนน้ำ: ถมแผ่นดินรอบหมุดที่เป็นแผ่นดิน
LAND_KINDS = {'NEIGHBOR_SECT', 'RESOURCE_NODE', 'ELEMENTAL_REALM', 'SANCTUM', 'PAGODA', 'TRADE_HUB', 'HOME_SECT'}
land_patch = np.zeros((N, N), np.float32)
for nd in NODES:
    if nd['kind'] in LAND_KINDS or nd['id'].startswith('SRC110') or nd['id'] in ('forest', 'plains', 'mountain', 'desert', 'ruins'):
        r = 3.6 if nd['kind'] in ('NEIGHBOR_SECT', 'ELEMENTAL_REALM', 'RESOURCE_NODE') else 3.0
        d = np.sqrt((U - nd['x']) ** 2 + (V - nd['y']) ** 2) / r
        land_patch = np.maximum(land_patch, 1 - smooth(0.55, 1.15, d + (fbm(51, 10, 3) - 0.5) * 0.5))
for (ix, iy, ir) in [(47, 91, 2.4), (69, 92, 2.8), (49, 81, 1.8), (71, 79, 2.3), (82, 90, 2.2), (64, 90, 1.5)]:
    d = np.sqrt((U - ix) ** 2 + (V - iy) ** 2) / ir
    land_patch = np.maximum(land_patch, 1 - smooth(0.5, 1.1, d + (fbm(52, 10, 3) - 0.5) * 0.6))
lake = np.clip(lake - land_patch * 1.2, 0, 1)

def catmull(pts, steps=24):
    pts = [pts[0]] + list(pts) + [pts[-1]]
    out = []
    for i in range(1, len(pts) - 2):
        p0, p1, p2, p3 = [np.array(p, float) for p in pts[i - 1:i + 3]]
        for t in np.linspace(0, 1, steps, endpoint=False):
            out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3))
    out.append(np.array(pts[-2], float))
    return out

rng_r = random.Random(7)
def meander(pts, amp=1.5):
    res = []
    for i, p in enumerate(pts):
        res.append((p[0] + rng_r.uniform(-amp, amp), p[1] + rng_r.uniform(-amp, amp)) if 0 < i < len(pts) - 1 else p)
    return res

RIVERS = {
    # แม่น้ำมังกรคราม: ธารน้ำแข็งเหนือ -> หุบเขาฟ้าประทาน -> ด่านลำน้ำทักษิณ -> ทะเลสาบมังกรหลับ
    'main': (meander([(53, 15), (50, 22), (47, 29), (45, 35), (47, 42), (44, 48), (45, 54), (48, 60), (51, 65), (54, 70), (55, 76)]), [0.34, 1.15]),
    # สายน้ำตะวันออกจากหน้าผาที่ราบสูง ผ่านที่ราบเมฆา
    'east': (meander([(80, 20), (78, 27), (75, 33), (72, 40), (67, 47), (62, 54), (58, 62), (56, 70), (55, 76)]), [0.3, 0.95]),
    # ธารละลายหิมะตะวันตกเฉียงเหนือไหลเข้าแม่น้ำสายหลัก
    'west': (meander([(36, 21), (38, 28), (40, 35), (43, 41), (46, 44)]), [0.22, 0.5]),
}
DRY = [meander([(22, 42), (26, 50), (31, 57), (37, 63), (42, 69)], 0.8)]  # ลำธารแห้งทะเลทราย -> บึง

def stroke_mask(path, w0, w1, closed=False):
    img = np.zeros((N, N), np.uint8)
    pts = catmull(path)
    L = len(pts)
    for i in range(L - 1):
        w = (w0 + (w1 - w0) * (i / max(1, L - 2))) * S
        cv2.line(img, (int(pts[i][0] * S), int(pts[i][1] * S)), (int(pts[i + 1][0] * S), int(pts[i + 1][1] * S)), 255, max(1, int(w)), cv2.LINE_AA)
    return img.astype(np.float32) / 255.0

river = np.zeros((N, N), np.float32)
for key, (path, (w0, w1)) in RIVERS.items():
    river = np.maximum(river, stroke_mask(path, w0, w1))
river = np.clip(blur(river, 1.2 * S / 10 + 0.5) * 1.6, 0, 1)
dry_bed = np.zeros((N, N), np.float32)
for p in DRY:
    dry_bed = np.maximum(dry_bed, stroke_mask(p, 0.35, 0.5))
# บึงน้ำตื้น + ทะเลสาบน้ำแข็ง + โอเอซิส
marsh = np.maximum.reduce([blob(41, 71, 13, 5, 0.0), blob(32, 79, 7, 6), blob(28, 89, 9, 6)]) * (0.6 + 0.6 * n2)
marsh = np.clip(marsh * (1 - lake), 0, 1)
ice_lake = blob(54, 14, 4.2, 2.4)
oasis = np.maximum(blob(25, 70, 2.6, 1.7), blob(11, 61, 1.8, 1.2))
water = np.clip(np.maximum.reduce([lake, river, ice_lake, oasis]), 0, 1)
water_bin = water > 0.5
land_patch_f = land_patch * (1 - smooth(0.0, 0.3, river))

# ---------------------------------------------------------------- ความสูง + แรเงาเนินเขา
H = 0.30 + 0.06 * n3 + 0.05 * n2
H += 0.55 * north * (0.5 + 0.5 * fbm(61, 10, 5)) + 0.20 * plateau + 0.14 * volc
H += 0.12 * desert * fbm(62, 9, 4) + 0.20 * badland
H += 0.14 * forest * fbm(63, 18, 4) + 0.12 * hills
# ภูเขาไฟ
volcano_c = (17.0, 28.0)
H += 0.55 * np.exp(-(((U - volcano_c[0]) ** 2 + (V - volcano_c[1]) ** 2) / (2 * 3.2 ** 2)))
H -= 0.22 * smooth(0.2, 1.0, water) + 0.10 * marsh
H = np.clip(H, 0, 1.2)
Hs = blur(H, 1.0)
gx = cv2.Sobel(Hs, cv2.CV_32F, 1, 0, ksize=3)
gy = cv2.Sobel(Hs, cv2.CV_32F, 0, 1, ksize=3)
k = 6.0 * (N / 1024.0)
shade = np.clip(0.5 + (-gx - gy) * k * 0.45, 0, 1)   # แสงจากทิศตะวันตกเฉียงเหนือ

# ---------------------------------------------------------------- สี (พาเลตสีน้ำ)
def rgb(h):
    h = h.lstrip('#'); return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], np.float32) / 255.0

PAL = dict(
    paper=rgb('#ecdcb4'), grass=rgb('#b4c276'), grass2=rgb('#8fae62'),
    forest=rgb('#5e9460'), forest2=rgb('#3f7553'),
    plain=rgb('#c9cf86'), paddy=rgb('#dccb78'), paddy2=rgb('#9fbd66'),
    sand=rgb('#e9cd92'), sand2=rgb('#d3a76c'), red=rgb('#c98558'), red2=rgb('#a65f40'),
    ash=rgb('#6d5f5a'), ash2=rgb('#4d4240'),
    snow=rgb('#f3f6f8'), snow2=rgb('#b9cfe0'), rock=rgb('#8c98a3'), rock2=rgb('#66737f'),
    water=rgb('#59b6c0'), water2=rgb('#237f94'), shallow=rgb('#9bd8cf'), marsh=rgb('#8da66c'), marsh2=rgb('#6c8a58'),
    ice=rgb('#cfe6ee'),
)

def mix(a, b, t):
    t = np.asarray(t, np.float32)
    t = t[..., None] if t.ndim == 2 else t
    return a * (1 - t) + b * t

img = np.zeros((N, N, 3), np.float32) + PAL['grass']
img = mix(img, PAL['grass2'], smooth(0.35, 0.85, n2) * 0.6)
# ป่า
img = mix(img, mix(PAL['forest'], PAL['forest2'], smooth(0.3, 0.8, n3)), np.clip(forest * 1.1, 0, 1))
# ที่ราบ + นาข้าว (กริดเอียง)
th = 0.42
gu = (U * math.cos(th) + V * math.sin(th)) * 2.6 + 3 * n2
gv = (-U * math.sin(th) + V * math.cos(th)) * 2.6 + 3 * n2
cell = (np.floor(gu).astype(np.int64) * 73856093 ^ np.floor(gv).astype(np.int64) * 19349663) & 1023
cellv = (cell / 1023.0).astype(np.float32)
edge = ((np.abs(gu - np.round(gu)) < 0.035) | (np.abs(gv - np.round(gv)) < 0.035)).astype(np.float32)
paddy_col = mix(np.broadcast_to(PAL['paddy'], (N, N, 3)).copy(), np.broadcast_to(PAL['paddy2'], (N, N, 3)).copy(), smooth(0.35, 0.65, cellv))
paddy_col = mix(paddy_col, np.broadcast_to(PAL['plain'], (N, N, 3)).copy(), smooth(0.8, 1.0, cellv) * 0.8)
paddy_col = paddy_col * (1 - 0.18 * edge[..., None])
plain_w = np.clip(plains * 1.2 * (1 - forest_e), 0, 1)
img = mix(img, mix(np.broadcast_to(PAL['plain'], (N, N, 3)).copy(), paddy_col, smooth(0.25, 0.7, plains) * 0.75), plain_w)
# ทะเลทราย: ริ้วเนินทราย
dune = np.sin((U * 0.8 + V * 1.6 + 14 * n2) * 2.2) * 0.5 + 0.5
sand = mix(np.broadcast_to(PAL['sand'], (N, N, 3)).copy(), np.broadcast_to(PAL['sand2'], (N, N, 3)).copy(), smooth(0.55, 1.0, dune) * 0.5 + 0.12 * n3)
sand = mix(sand, np.broadcast_to(PAL['red'], (N, N, 3)).copy(), badland * 0.85)
sand = mix(sand, np.broadcast_to(PAL['red2'], (N, N, 3)).copy(), badland * smooth(0.5, 0.95, n3) * 0.7)
img = mix(img, sand, np.clip(desert * 1.15, 0, 1))
# ขี้เถ้าภูเขาไฟ
ash = mix(np.broadcast_to(PAL['ash'], (N, N, 3)).copy(), np.broadcast_to(PAL['ash2'], (N, N, 3)).copy(), smooth(0.3, 0.8, n2))
img = mix(img, ash, np.clip(volc * 1.2, 0, 1))
# ภูเขา/หิน/หิมะ
rock = mix(np.broadcast_to(PAL['rock'], (N, N, 3)).copy(), np.broadcast_to(PAL['rock2'], (N, N, 3)).copy(), smooth(0.3, 0.8, n2))
img = mix(img, rock, np.clip(north * 1.25, 0, 1) * 0.92)
img = mix(img, mix(np.broadcast_to(PAL['rock'], (N, N, 3)).copy(), np.broadcast_to(PAL['sand2'], (N, N, 3)).copy(), 0.55), np.clip(plateau * 1.2, 0, 1) * 0.9)
snow_col = mix(np.broadcast_to(PAL['snow'], (N, N, 3)).copy(), np.broadcast_to(PAL['snow2'], (N, N, 3)).copy(), smooth(0.2, 0.8, 1 - shade) * 0.7)
img = mix(img, snow_col, np.clip(snow * 1.1, 0, 1))
img = mix(img, np.broadcast_to(PAL['rock'], (N, N, 3)).copy(), np.clip(hills * 0.35, 0, 1))
# ลำธารแห้ง
img = mix(img, np.broadcast_to(PAL['sand2'] * 0.92, (N, N, 3)).copy(), np.clip(dry_bed * 1.4, 0, 1) * 0.8)
# บึง
img = mix(img, mix(np.broadcast_to(PAL['marsh'], (N, N, 3)).copy(), np.broadcast_to(PAL['marsh2'], (N, N, 3)).copy(), smooth(0.4, 0.9, n3)), np.clip(marsh * 1.3, 0, 1) * 0.85)

# ทะเลสาบ/แม่น้ำ: ความลึกจากระยะห่างฝั่ง
wb = (water > 0.5).astype(np.uint8)
dist = cv2.distanceTransform(wb, cv2.DIST_L2, 5).astype(np.float32) / S   # หน่วยแผนที่
deep = smooth(0.0, 4.0, dist)
wcol = mix(np.broadcast_to(PAL['shallow'], (N, N, 3)).copy(), np.broadcast_to(PAL['water'], (N, N, 3)).copy(), smooth(0.0, 0.9, dist))
wcol = mix(wcol, np.broadcast_to(PAL['water2'], (N, N, 3)).copy(), deep * 0.75)
wcol = mix(wcol, np.broadcast_to(PAL['ice'], (N, N, 3)).copy(), np.clip(ice_lake * 1.3, 0, 1) * 0.9)
ripple = 0.5 + 0.5 * np.sin((V * 5.0 + 3 * n2 + 2 * fbm(71, 20, 3)) * 3.0)
wcol = wcol * (1 - 0.06 * ripple[..., None])
wmask = smooth(0.35, 0.65, water)
img = mix(img, wcol, wmask)
# แนวฝั่ง: เส้นหมึกบางๆ + ฟองคลื่น
coast = np.abs(cv2.Laplacian(wmask, cv2.CV_32F, ksize=3))
coast = np.clip(blur(coast, 0.8) * 22 / (N / 1024.0), 0, 1)
ink_water = rgb('#1e5560')
img = mix(img, np.broadcast_to(ink_water, (N, N, 3)).copy(), coast * (0.58 - 0.33 * smooth(0.1, 0.6, river)))
shore_light = np.clip(1 - dist / 1.1, 0, 1) * wmask
img = mix(img, np.broadcast_to(rgb('#e6f5ee'), (N, N, 3)).copy(), shore_light * 0.35)

# แรเงาเนินเขา (ไม่ใช้กับน้ำมากนัก)
sh = (shade - 0.5) * (1 - 0.8 * wmask)
img = img * (1 + sh[..., None] * 0.9)

# ลายสีน้ำ: ตะกอนสีตามขอบ + เม็ดสี
gran = fbm(81, 120, 2)
img = img * (0.93 + 0.14 * gran[..., None])
pool = fbm(82, 6, 3)
img = img * (0.94 + 0.12 * pool[..., None])
paper = PAL['paper']
fib = fbm(83, 220, 1)
img = mix(img, np.broadcast_to(paper, (N, N, 3)).copy(), np.full((N, N), 0.10, np.float32)) * (0.97 + 0.05 * fib[..., None])

# ขอบกระดาษ: เกลี่ยหมอกเมฆที่ขอบ + มุมมืด
eu = np.minimum(np.minimum(U, 100 - U), np.minimum(V, 100 - V))
edge_fade = 1 - smooth(0.0, 4.5, eu + (n2 - 0.5) * 3)
img = mix(img, np.broadcast_to(rgb('#e6d3a2'), (N, N, 3)).copy(), edge_fade * 0.75)
vig = 1 - 0.20 * smooth(30, 0, eu * 1.0)
img = img * vig[..., None]
img = np.clip(img, 0, 1)

cv2.imwrite(os.path.join(out_dir, 'base.png'), (img[..., ::-1] * 255).astype(np.uint8))

print('base ok', N)

# ================================================================ ชั้นลายเส้นหมึก (SVG)
R = random.Random(2026)
M = 256
def lo(a): return cv2.resize(np.asarray(a, np.float32), (M, M), interpolation=cv2.INTER_AREA)
mk = dict(north=lo(north), snow=lo(snow), plateau=lo(plateau), volc=lo(volc), desert=lo(desert), badland=lo(badland),
          forest=lo(forest), plains=lo(plains), hills=lo(hills), water=lo(water), marsh=lo(marsh), river=lo(river),
          land=lo(land_patch_f), lake=lo(lake))
wat_lo = cv2.dilate((mk['water'] > 0.4).astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool) & (mk['land'] < 0.5)
def at(name, x, y):
    return float(mk[name][min(M - 1, max(0, int(y / 100 * M))), min(M - 1, max(0, int(x / 100 * M)))])

PIN = [(n['x'], n['y']) for n in NODES if not n['approximate']]
def near_pin(x, y, r):
    return any((x - px) ** 2 + (y - py) ** 2 < r * r for px, py in PIN)

def scatter(prob, mind, tries, pin_r=2.3, allow_water=False):
    pts, grid = [], {}
    for _ in range(tries):
        x, y = R.uniform(2, 98), R.uniform(2, 98)
        if not allow_water and wat_lo[min(M - 1, int(y / 100 * M)), min(M - 1, int(x / 100 * M))]: continue
        if R.random() > prob(x, y): continue
        if pin_r and near_pin(x, y, pin_r): continue
        gx, gy = int(x / mind), int(y / mind)
        if any((gx + i, gy + j) in grid and (grid[(gx + i, gy + j)][0] - x) ** 2 + (grid[(gx + i, gy + j)][1] - y) ** 2 < mind * mind
               for i in (-1, 0, 1) for j in (-1, 0, 1)): continue
        grid[(gx, gy)] = (x, y); pts.append((x, y))
    return pts

def P(v): return f'{v * S:.1f}'
SW = N / 2048.0
def sw(w): return f'{w * SW * 1.5:.2f}'
INK, INK2 = '#33424c', '#5a4636'
out = []
def add(s): out.append(s)

def mountain(x, y, w, h, tone='rock', cap=0.0):
    j = lambda a: R.uniform(-a, a)
    px_, py_ = x + j(w * .08), y - h
    L, Rr = (x - w / 2, y), (x + w / 2, y)
    mid_l = (x - w * .25 + j(w * .05), y - h * .55 + j(h * .06)); mid_r = (x + w * .26 + j(w * .05), y - h * .5 + j(h * .06))
    lt, sh = {'rock': ('#a7b4bf', '#6f7d8b'), 'red': ('#d79a6c', '#a2593a'), 'ash': ('#80726c', '#4a3f3d'),
              'sand': ('#dcc08f', '#b48a58'), 'green': ('#8fb092', '#587f66')}[tone]
    add(f'<ellipse cx="{P(x + w * .08)}" cy="{P(y + .25)}" rx="{P(w * .55)}" ry="{P(h * .12)}" fill="#3b3226" opacity=".16"/>')
    add(f'<path d="M{P(L[0])},{P(L[1])} L{P(mid_l[0])},{P(mid_l[1])} L{P(px_)},{P(py_)} L{P(x + j(w * .04))},{P(y - h * .4)} L{P(x)},{P(y)} Z" fill="{lt}"/>')
    add(f'<path d="M{P(px_)},{P(py_)} L{P(mid_r[0])},{P(mid_r[1])} L{P(Rr[0])},{P(Rr[1])} L{P(x)},{P(y)} L{P(x + j(w * .04))},{P(y - h * .4)} Z" fill="{sh}"/>')
    if cap > 0:
        c = h * cap
        add(f'<path d="M{P(px_)},{P(py_)} L{P(px_ - w * .2)},{P(py_ + c)} L{P(px_ - w * .08)},{P(py_ + c * .7)} L{P(px_ + w * .02)},{P(py_ + c * 1.05)} L{P(px_ + w * .12)},{P(py_ + c * .7)} L{P(px_ + w * .22)},{P(py_ + c)} Z" fill="#fbfdff" stroke="{INK}" stroke-width="{sw(.5)}" stroke-linejoin="round"/>')
    for k in range(4):
        t = .3 + k * .16
        add(f'<path d="M{P(px_ + (Rr[0] - px_) * t * .9)},{P(py_ + h * t)} l{P(-w * .08)},{P(h * .1)}" stroke="{INK}" stroke-width="{sw(.45)}" opacity=".55" fill="none"/>')
    add(f'<path d="M{P(L[0])},{P(L[1])} L{P(mid_l[0])},{P(mid_l[1])} L{P(px_)},{P(py_)} L{P(mid_r[0])},{P(mid_r[1])} L{P(Rr[0])},{P(Rr[1])}" fill="none" stroke="{INK}" stroke-width="{sw(.9)}" stroke-linejoin="round" stroke-linecap="round"/>')
    add(f'<path d="M{P(px_)},{P(py_)} L{P(x + j(w * .04))},{P(y - h * .4)} L{P(x)},{P(y)}" fill="none" stroke="{INK}" stroke-width="{sw(.6)}" opacity=".7"/>')

def karst(x, y, w, h):
    add(f'<ellipse cx="{P(x)}" cy="{P(y)}" rx="{P(w * .7)}" ry="{P(h * .08)}" fill="#fff" opacity=".35"/>')
    d = f'M{P(x - w / 2)},{P(y)} C{P(x - w * .5)},{P(y - h * .6)} {P(x - w * .3)},{P(y - h)} {P(x)},{P(y - h)} C{P(x + w * .3)},{P(y - h)} {P(x + w * .55)},{P(y - h * .5)} {P(x + w / 2)},{P(y)} Z'
    add(f'<path d="{d}" fill="#8aa88e" stroke="{INK}" stroke-width="{sw(.9)}"/>')
    add(f'<path d="M{P(x + w * .08)},{P(y - h * .95)} C{P(x + w * .5)},{P(y - h * .6)} {P(x + w * .5)},{P(y - h * .2)} {P(x + w / 2)},{P(y)} L{P(x + w * .05)},{P(y)} Z" fill="#4f7660" opacity=".75"/>')
    for k in range(3):
        add(f'<path d="M{P(x - w * .2 + k * w * .2)},{P(y - h * .7 + k * h * .08)} l0,{P(h * .35)}" stroke="{INK}" stroke-width="{sw(.4)}" opacity=".45"/>')
    for k in range(3):
        add(f'<circle cx="{P(x - w * .15 + k * w * .15)}" cy="{P(y - h + h * .03)}" r="{P(w * .13)}" fill="#3f7a4d" stroke="{INK}" stroke-width="{sw(.4)}"/>')

def mesa(x, y, w, h, snowtop=False):
    add(f'<ellipse cx="{P(x + w * .1)}" cy="{P(y)}" rx="{P(w * .6)}" ry="{P(h * .1)}" fill="#3b3226" opacity=".18"/>')
    add(f'<path d="M{P(x - w / 2)},{P(y)} L{P(x - w * .36)},{P(y - h)} L{P(x + w * .34)},{P(y - h)} L{P(x + w / 2)},{P(y)} Z" fill="#c98258" stroke="{INK2}" stroke-width="{sw(.9)}" stroke-linejoin="round"/>')
    add(f'<path d="M{P(x + w * .1)},{P(y - h)} L{P(x + w * .34)},{P(y - h)} L{P(x + w / 2)},{P(y)} L{P(x + w * .15)},{P(y)} Z" fill="#9c5638" opacity=".7"/>')
    add(f'<path d="M{P(x - w * .36)},{P(y - h)} L{P(x + w * .34)},{P(y - h)} L{P(x + w * .34)},{P(y - h * .88)} L{P(x - w * .36)},{P(y - h * .88)} Z" fill="{"#f4f1ea" if snowtop else "#e3b27f"}"/>')
    for k in (.3, .5, .7):
        add(f'<path d="M{P(x - w * (.43 - .1 * k))},{P(y - h * k)} L{P(x + w * (.43 - .1 * k))},{P(y - h * k)}" stroke="{INK2}" stroke-width="{sw(.4)}" opacity=".5"/>')

def tree(x, y, kind='broad'):
    s = R.uniform(.8, 1.2)
    add(f'<ellipse cx="{P(x + .2)}" cy="{P(y + .1)}" rx="{P(.55 * s)}" ry="{P(.16 * s)}" fill="#223" opacity=".18"/>')
    if kind == 'pine':
        for k in range(3):
            w_ = (.9 - k * .2) * s; yy = y - .2 - k * .45 * s
            add(f'<path d="M{P(x - w_ / 2)},{P(yy)} L{P(x)},{P(yy - .7 * s)} L{P(x + w_ / 2)},{P(yy)} Z" fill="{["#2f6a4a", "#3b7b55", "#4a8c61"][k]}" stroke="{INK}" stroke-width="{sw(.35)}"/>')
    elif kind == 'bamboo':
        for k in range(4):
            xx = x + (k - 1.5) * .22 * s
            add(f'<path d="M{P(xx)},{P(y)} l{P(R.uniform(-.05, .05))},{P(-1.3 * s)}" stroke="#6f9a4e" stroke-width="{sw(1.0)}" stroke-linecap="round"/><path d="M{P(xx)},{P(y - 1.2 * s)} l{P(.3)},{P(-.15)} M{P(xx)},{P(y - .8 * s)} l{P(-.3)},{P(-.15)}" stroke="#3d7a3c" stroke-width="{sw(.6)}"/>')
    else:
        col = R.choice(['#4f9a5b', '#3f8a52', '#5aa563', '#e8a3b5'] if R.random() < .06 else ['#4f9a5b', '#3f8a52', '#5aa563'])
        add(f'<path d="M{P(x)},{P(y)} l0,{P(-.5 * s)}" stroke="#5a3f2a" stroke-width="{sw(1.1)}"/>')
        for dx, dy, r in [(-.28, -.7, .42), (.28, -.7, .42), (0, -1.05, .5)]:
            add(f'<circle cx="{P(x + dx * s)}" cy="{P(y + dy * s)}" r="{P(r * s)}" fill="{col}" stroke="{INK}" stroke-width="{sw(.4)}"/>')

def roof(x, y, w, col='#b8503c', wall='#efe0bf'):
    h = w * .55
    add(f'<rect x="{P(x - w * .36)}" y="{P(y - h * .1)}" width="{P(w * .72)}" height="{P(h * .5)}" fill="{wall}" stroke="{INK2}" stroke-width="{sw(.5)}"/>')
    add(f'<path d="M{P(x - w * .6)},{P(y - h * .05)} Q{P(x - w * .3)},{P(y - h * .12)} {P(x - w * .2)},{P(y - h * .75)} L{P(x + w * .2)},{P(y - h * .75)} Q{P(x + w * .3)},{P(y - h * .12)} {P(x + w * .6)},{P(y - h * .05)} Z" fill="{col}" stroke="{INK2}" stroke-width="{sw(.6)}" stroke-linejoin="round"/>')

BANNER = {'RIGHTEOUS': '#2f9fb8', 'DEMONIC': '#a8322b', 'NEUTRAL': '#d4a63b'}
def compound(nd):
    x, y, t = nd['x'], nd['y'], (nd['tier'] or 2)
    w = 3.0 + t * .45
    add(f'<ellipse cx="{P(x)}" cy="{P(y + .5)}" rx="{P(w * .85)}" ry="{P(w * .28)}" fill="#e6d29a" stroke="{INK2}" stroke-width="{sw(.4)}" opacity=".9"/>')
    add(f'<rect x="{P(x - w * .6)}" y="{P(y - .4)}" width="{P(w * 1.2)}" height="{P(w * .38)}" fill="#cdbb95" stroke="{INK2}" stroke-width="{sw(.6)}"/>')
    roof(x, y - .2, w * .85, '#7e3b30' if nd['alignment'] == 'DEMONIC' else '#3f6f7c' if nd['alignment'] == 'RIGHTEOUS' else '#9c7a35')
    for k in range(min(3, t // 2)):
        roof(x - w * .5 + k * w * .5, y + .35, w * .38, '#8a4a3a')
    col = BANNER.get(nd['alignment'], '#d4a63b')
    add(f'<path d="M{P(x + w * .6)},{P(y)} l0,{P(-w * .8)}" stroke="{INK}" stroke-width="{sw(.7)}"/><path d="M{P(x + w * .6)},{P(y - w * .8)} l{P(w * .4)},{P(.3)} l{P(-w * .4)},{P(.4)} Z" fill="{col}" stroke="{INK}" stroke-width="{sw(.3)}"/>')

def pagoda(x, y, floors=9):
    add(f'<ellipse cx="{P(x)}" cy="{P(y)}" rx="{P(2.3)}" ry="{P(.5)}" fill="#e6d29a" stroke="{INK2}" stroke-width="{sw(.4)}"/>')
    for k in range(floors):
        w_ = 2.4 - k * .17; yy = y - k * .62
        add(f'<rect x="{P(x - w_ * .3)}" y="{P(yy - .6)}" width="{P(w_ * .6)}" height="{P(.5)}" fill="#efe0bf" stroke="{INK2}" stroke-width="{sw(.3)}"/><path d="M{P(x - w_ / 2)},{P(yy - .5)} Q{P(x - w_ * .3)},{P(yy - .6)} {P(x - w_ * .2)},{P(yy - .95)} L{P(x + w_ * .2)},{P(yy - .95)} Q{P(x + w_ * .3)},{P(yy - .6)} {P(x + w_ / 2)},{P(yy - .5)} Z" fill="#b8503c" stroke="{INK2}" stroke-width="{sw(.4)}"/>')
    add(f'<path d="M{P(x)},{P(y - floors * .62 - .6)} l0,{P(-1)}" stroke="#d9b24a" stroke-width="{sw(.9)}"/>')

def sanctum(x, y):
    add(f'<ellipse cx="{P(x)}" cy="{P(y + .2)}" rx="{P(2.4)}" ry="{P(.55)}" fill="#cfc2a5" stroke="{INK2}" stroke-width="{sw(.4)}"/>')
    for k, hh in enumerate([1.9, 1.3, 1.9, 1.0]):
        xx = x - 1.5 + k
        add(f'<rect x="{P(xx - .22)}" y="{P(y - hh)}" width="{P(.44)}" height="{P(hh)}" fill="#e2d8c2" stroke="{INK2}" stroke-width="{sw(.5)}"/>')
    add(f'<path d="M{P(x - 1.75)},{P(y - 1.9)} L{P(x - .75)},{P(y - 1.9)}" stroke="{INK2}" stroke-width="{sw(1.4)}"/><circle cx="{P(x + .3)}" cy="{P(y - 2.4)}" r="{P(.55)}" fill="#9b7bd8" opacity=".35"/>')

ELEM = {'REALM_METAL': '#e6ecf2', 'REALM_WOOD': '#6fd16f', 'REALM_WATER': '#4fa8e8', 'REALM_FIRE': '#ff7a3a', 'REALM_EARTH': '#d8b24a'}
def realm(nd):
    x, y, c = nd['x'], nd['y'], ELEM.get(nd['id'], '#c9a8ff')
    add(f'<circle cx="{P(x)}" cy="{P(y)}" r="{P(2.9)}" fill="{c}" opacity=".35"/><circle cx="{P(x)}" cy="{P(y)}" r="{P(2.1)}" fill="none" stroke="{c}" stroke-width="{sw(1.1)}" opacity=".9"/>')
    for k in range(8):
        a = k * math.pi / 4
        sx, sy = x + 2.1 * math.cos(a), y + 1.1 * math.sin(a)
        add(f'<path d="M{P(sx - .25)},{P(sy + .2)} L{P(sx - .1)},{P(sy - .7)} L{P(sx + .2)},{P(sy - .6)} L{P(sx + .25)},{P(sy + .2)} Z" fill="#8f98a0" stroke="{INK}" stroke-width="{sw(.4)}"/>')

def mine(x, y):
    add(f'<path d="M{P(x - 1.6)},{P(y + .5)} Q{P(x)},{P(y - 2.6)} {P(x + 1.6)},{P(y + .5)} Z" fill="#7a6a5a" stroke="{INK}" stroke-width="{sw(.7)}"/><path d="M{P(x - .8)},{P(y + .5)} Q{P(x)},{P(y - 1.3)} {P(x + .8)},{P(y + .5)} Z" fill="#241d19"/>')
    for k in range(3): add(f'<path d="M{P(x + 1.2 + k * .3)},{P(y - .2 - k * .2)} l.0,{P(-.4)} M{P(x + 1.0 + k * .3)},{P(y - .4 - k * .2)} l{P(.4)},0" stroke="#7fe3ff" stroke-width="{sw(.6)}"/>')

def toll(x, y):
    add(f'<rect x="{P(x - 1.6)}" y="{P(y - 1.2)}" width="{P(.9)}" height="{P(1.7)}" fill="#cdbb95" stroke="{INK2}" stroke-width="{sw(.5)}"/><rect x="{P(x + .7)}" y="{P(y - 1.2)}" width="{P(.9)}" height="{P(1.7)}" fill="#cdbb95" stroke="{INK2}" stroke-width="{sw(.5)}"/>')
    add(f'<path d="M{P(x - 1.9)},{P(y - 1.1)} L{P(x - 1.15)},{P(y - 1.9)} L{P(x - .4)},{P(y - 1.1)} Z M{P(x + .4)},{P(y - 1.1)} L{P(x + 1.15)},{P(y - 1.9)} L{P(x + 1.9)},{P(y - 1.1)} Z" fill="#b8503c" stroke="{INK2}" stroke-width="{sw(.4)}"/><circle cx="{P(x)}" cy="{P(y - .3)}" r="{P(.3)}" fill="#d83b2a"/>')

def herb(x, y):
    for k in range(3):
        add(f'<ellipse cx="{P(x)}" cy="{P(y + .2 - k * .5)}" rx="{P(1.9 - k * .35)}" ry="{P(.5)}" fill="{["#78b05a", "#8cc468", "#a4d27a"][k]}" stroke="{INK2}" stroke-width="{sw(.35)}"/>')
    for k in range(5): add(f'<circle cx="{P(x - 1 + k * .5)}" cy="{P(y - .6 + (k % 2) * .4)}" r="{P(.17)}" fill="#f07aa5"/>')

def market(x, y):
    for dx, dy, w in [(-1.6, .3, 1.5), (0, -.1, 1.9), (1.7, .3, 1.5), (-.8, .9, 1.3), (.9, .95, 1.3)]: roof(x + dx, y + dy, w, '#b8503c')
    for dx in (-2.2, 2.3): add(f'<path d="M{P(x + dx)},{P(y + .6)} l0,{P(-1.6)}" stroke="{INK}" stroke-width="{sw(.5)}"/><circle cx="{P(x + dx)}" cy="{P(y - 1.0)}" r="{P(.35)}" fill="#e03b2a"/>')

def gate_ring(x, y):
    add(f'<circle cx="{P(x)}" cy="{P(y)}" r="{P(1.9)}" fill="#a07cf0" opacity=".28"/><circle cx="{P(x)}" cy="{P(y)}" r="{P(1.3)}" fill="none" stroke="#7a52d8" stroke-width="{sw(1.6)}"/><circle cx="{P(x)}" cy="{P(y)}" r="{P(.7)}" fill="none" stroke="#d6c4ff" stroke-width="{sw(.8)}"/>')

def home(x, y):
    add(f'<ellipse cx="{P(x)}" cy="{P(y + 1.2)}" rx="{P(5.8)}" ry="{P(1.7)}" fill="#e6d29a" stroke="{INK2}" stroke-width="{sw(.6)}"/><ellipse cx="{P(x)}" cy="{P(y + .5)}" rx="{P(4.4)}" ry="{P(1.3)}" fill="#efdca8" stroke="{INK2}" stroke-width="{sw(.5)}"/>')
    for dx, dy, w in [(-2.6, .6, 2.2), (2.6, .6, 2.2), (-1.2, .2, 2.4), (1.2, .2, 2.4)]: roof(x + dx, y + dy, w, '#8a4a3a')
    roof(x, y - .6, 4.2, '#c0392b')
    add(f'<path d="M{P(x)},{P(y - 2.9)} l0,{P(-1.6)}" stroke="{INK}" stroke-width="{sw(.8)}"/><path d="M{P(x)},{P(y - 4.5)} l{P(1.5)},{P(.4)} l{P(-1.5)},{P(.5)} Z" fill="#e9c24a" stroke="{INK}" stroke-width="{sw(.4)}"/>')

# ---------- วางลายเส้นตามชนิดภูมิประเทศ
items = []   # (y, fn, args)
def mark(pts, fn, *a, **k):
    for (x, y) in pts: items.append((y, fn, (x, y) + a, k))

# เขาหิมะเหนือ + หินเหนือ
for (x, y) in scatter(lambda x, y: at('north', x, y) ** 1.6 * .8, 2.9, 30000, 2.8):
    sn = at('snow', x, y); w = R.uniform(3.4, 5.4); h = w * R.uniform(.75, 1.0)
    items.append((y, mountain, (x, y, w, h), dict(tone='rock', cap=.42 if sn > .35 else 0)))
# ที่ราบสูงหน้าผา
for (x, y) in scatter(lambda x, y: at('plateau', x, y), 4.6, 6000, 2.6):
    items.append((y, mesa, (x, y, R.uniform(3.6, 5.6), R.uniform(1.8, 3.0)), dict(snowtop=R.random() < .5)))
# ภูเขาไฟ/หินดำ
for (x, y) in scatter(lambda x, y: at('volc', x, y) ** 1.5 * (0 if (x - 17) ** 2 + (y - 28) ** 2 < 36 else 1), 3.4, 6000, 2.6):
    items.append((y, mountain, (x, y, R.uniform(3, 4.6), R.uniform(2.6, 4.2)), dict(tone='ash')))
# ทะเลทราย: เมซ่าหินแดง + เนินทราย
for (x, y) in scatter(lambda x, y: at('badland', x, y) * .8, 4.4, 9000, 2.6):
    items.append((y, mesa, (x, y, R.uniform(3.4, 5.2), R.uniform(1.6, 2.8)), {}))
dunes = scatter(lambda x, y: at('desert', x, y) * (1 - at('badland', x, y)), 2.6, 9000, 1.8)
# ป่า: ผา karst + ต้นไม้
for (x, y) in scatter(lambda x, y: at('forest', x, y) * .22 + at('hills', x, y) * .1, 4.2, 20000, 2.8):
    items.append((y, karst, (x, y, R.uniform(1.5, 2.2), R.uniform(2.8, 4.2)), {}))
for (x, y) in scatter(lambda x, y: at('forest', x, y), 1.35, 40000, 2.1):
    k = 'pine' if (y < 36 or R.random() < .22) else ('bamboo' if R.random() < .16 else 'broad')
    items.append((y, tree, (x, y, k), {}))
for (x, y) in scatter(lambda x, y: 0.13 * (1 - at('desert', x, y)) * (1 - at('north', x, y)) * (1 - at('plains', x, y) * .6), 2.8, 20000, 2.1):
    items.append((y, tree, (x, y, 'broad'), {}))
# ที่ราบ: บ้านนา
for (x, y) in scatter(lambda x, y: at('plains', x, y) * .35, 5.5, 8000, 2.6):
    items.append((y, roof, (x, y, 1.5), {}))
# บึง: บัว กก
lotus = scatter(lambda x, y: at('marsh', x, y) * 1.4, 1.5, 9000, 2.0, True)
waves = scatter(lambda x, y: (1.0 if at('lake', x, y) > .6 and not at('land', x, y) > .2 else 0), 2.3, 12000, 0, True)
# หิน/ทางเดินรอบสถานที่ แล้ววางสถานที่ประจำหมุด
for nd in NODES:
    if nd['approximate']: continue
    k, x, y = nd['kind'], nd['x'], nd['y']
    if k == 'HOME_SECT': items.append((y, home, (x, y), {}))
    elif k == 'NEIGHBOR_SECT': items.append((y, compound, (nd,), {}))
    elif k == 'PAGODA': items.append((y, pagoda, (x, y), {}))
    elif k == 'SANCTUM': items.append((y, sanctum, (x, y), {}))
    elif k == 'ELEMENTAL_REALM': items.append((y, realm, (nd,), {}))
    elif k == 'TRADE_HUB': items.append((y, market, (x, y), {}))
    elif k == 'DIMENSION_GATE': items.append((y, gate_ring, (x, y), {}))
    elif k == 'RESOURCE_NODE':
        f = mine if nd['id'].startswith('MINE') else toll if nd['id'].startswith('TOLL') else herb
        items.append((y, f, (x, y), {}))
    elif k == 'SECRET_REALM_SITE':
        add(f'<circle cx="{P(x)}" cy="{P(y)}" r="{P(2.3)}" fill="#b89cff" opacity=".22"/><circle cx="{P(x)}" cy="{P(y)}" r="{P(1.7)}" fill="none" stroke="#7a52d8" stroke-width="{sw(.6)}" stroke-dasharray="{P(.35)} {P(.3)}" opacity=".8"/>')


# ================= v2: รายละเอียดเพิ่มเติม =================
def onland(x, y, pr=2.2):
    return not wat_lo[min(M - 1, int(y / 100 * M)), min(M - 1, int(x / 100 * M))] and not near_pin(x, y, pr)

def hill(x, y, w, col='#9cbf78'):
    add(f'<path d="M{P(x - w / 2)},{P(y)} Q{P(x)},{P(y - w * .75)} {P(x + w / 2)},{P(y)} Z" fill="{col}" stroke="{INK}" stroke-width="{sw(.55)}" stroke-linejoin="round"/><path d="M{P(x + w * .05)},{P(y - w * .3)} Q{P(x + w * .35)},{P(y - w * .3)} {P(x + w / 2)},{P(y)} L{P(x + w * .1)},{P(y)} Z" fill="#3a5a3a" opacity=".25"/>')
    for k in (-.18, .05, .22): add(f'<circle cx="{P(x + k * w)}" cy="{P(y - w * (.38 - abs(k) * .5))}" r="{P(w * .07)}" fill="#3f8a52"/>')

def village(x, y):
    for dx, dy, w in [(-.9, 0, 1.3), (.9, .1, 1.2), (0, .7, 1.1), (-1.8, .6, 1.0)][:R.randint(3, 4)]: roof(x + dx, y + dy, w, R.choice(['#b8503c', '#8a4a3a']))
    for k in range(2):
        fx, fy = x + 2.4 + k * 1.6, y + .4
        add(f'<rect x="{P(fx)}" y="{P(fy)}" width="{P(1.4)}" height="{P(.9)}" fill="#d8c56a" stroke="{INK2}" stroke-width="{sw(.3)}" opacity=".9"/>' + ''.join(f'<path d="M{P(fx + i * .35)},{P(fy)} l0,{P(.9)}" stroke="#8a7a3a" stroke-width="{sw(.3)}"/>' for i in range(1, 4)))

def willow(x, y):
    add(f'<path d="M{P(x)},{P(y)} l{P(.1)},{P(-1.0)}" stroke="#5a3f2a" stroke-width="{sw(1.1)}"/>')
    for k in range(5): add(f'<path d="M{P(x + .1)},{P(y - 1.0)} q{P(-.9 + k * .45)},{P(-.5)} {P(-1.0 + k * .5)},{P(.9)}" stroke="#7fb05a" stroke-width="{sw(.7)}" fill="none"/>')

def bridge(x, y):
    add(f'<path d="M{P(x - 1.5)},{P(y)} Q{P(x)},{P(y - 1.1)} {P(x + 1.5)},{P(y)}" fill="none" stroke="#7a6a58" stroke-width="{sw(2.6)}" stroke-linecap="round"/><path d="M{P(x - 1.5)},{P(y)} Q{P(x)},{P(y - 1.1)} {P(x + 1.5)},{P(y)}" fill="none" stroke="#d8cdb4" stroke-width="{sw(1.4)}" stroke-linecap="round"/>')

def floating(x, y, s=1.0):
    add(f'<ellipse cx="{P(x)}" cy="{P(y + 2.8 * s)}" rx="{P(1.2 * s)}" ry="{P(.3 * s)}" fill="#223" opacity=".15"/>')
    add(f'<path d="M{P(x - 1.5 * s)},{P(y)} L{P(x - .3 * s)},{P(y + 1.9 * s)} L{P(x + .2 * s)},{P(y + 2.2 * s)} L{P(x + 1.5 * s)},{P(y)} Z" fill="#8b8f96" stroke="{INK}" stroke-width="{sw(.6)}"/>')
    add(f'<ellipse cx="{P(x)}" cy="{P(y)}" rx="{P(1.5 * s)}" ry="{P(.45 * s)}" fill="#9fd08a" stroke="{INK}" stroke-width="{sw(.6)}"/>')
    add(f'<path d="M{P(x + .2 * s)},{P(y + .3 * s)} l0,{P(2.3 * s)}" stroke="#f4fbff" stroke-width="{sw(1.0)}" opacity=".85"/>')
    roof(x - .1, y - .05, 1.1 * s, '#b8503c')

def icespike(x, y, h):
    add(f'<path d="M{P(x - h * .22)},{P(y)} L{P(x)},{P(y - h)} L{P(x + h * .22)},{P(y)} Z" fill="#dff1ff" stroke="#4a7a9a" stroke-width="{sw(.5)}"/><path d="M{P(x)},{P(y - h)} L{P(x + h * .22)},{P(y)} L{P(x + .05)},{P(y)} Z" fill="#9cc8e6" opacity=".7"/>')

def ruins(x, y):
    for k, hh in enumerate([1.4, .8, 1.7, 1.0, .5]):
        xx = x - 2 + k * 1.0
        add(f'<path d="M{P(xx - .25)},{P(y)} l0,{P(-hh)} l{P(.2)},{P(.2)} l{P(.3)},{P(-.15)} l0,{P(hh - .05)} Z" fill="#d6ccb4" stroke="{INK2}" stroke-width="{sw(.4)}"/>')
    add(f'<path d="M{P(x - 1)},{P(y - 1.6)} q{P(1)},{P(-1.1)} {P(2)},0" stroke="{INK2}" stroke-width="{sw(.9)}" fill="none"/>')

def palm(x, y):
    add(f'<path d="M{P(x)},{P(y)} q{P(.3)},{P(-.8)} {P(.1)},{P(-1.6)}" stroke="#6a4a2a" stroke-width="{sw(.9)}" fill="none"/>')
    for a in (-2.5, -1.9, -1.2, -.6): add(f'<path d="M{P(x + .1)},{P(y - 1.6)} q{P(math.cos(a) * .8)},{P(math.sin(a) * .5 - .2)} {P(math.cos(a) * 1.3)},{P(math.sin(a) * .2 + .5)}" stroke="#3f8a3f" stroke-width="{sw(.8)}" fill="none"/>')

def camel(x, y):
    add(f'<ellipse cx="{P(x)}" cy="{P(y)}" rx="{P(.55)}" ry="{P(.28)}" fill="#8a6234"/><circle cx="{P(x - .1)}" cy="{P(y - .35)}" r="{P(.2)}" fill="#8a6234"/><circle cx="{P(x + .1)}" cy="{P(y - .35)}" r="{P(.2)}" fill="#8a6234"/><path d="M{P(x + .5)},{P(y - .1)} l{P(.2)},{P(-.55)} M{P(x - .3)},{P(y + .2)} l0,{P(.4)} M{P(x + .3)},{P(y + .2)} l0,{P(.4)}" stroke="#5a3f20" stroke-width="{sw(.5)}"/>')

def cactus(x, y):
    add(f'<path d="M{P(x)},{P(y)} l0,{P(-1)} M{P(x)},{P(y - .5)} l{P(-.35)},0 l0,{P(-.35)} M{P(x)},{P(y - .6)} l{P(.35)},0 l0,{P(-.3)}" stroke="#4a8a4a" stroke-width="{sw(.9)}" fill="none" stroke-linecap="round"/>')

# เนินเชิงเขา
for (x, y) in scatter(lambda x, y: (0.55 if .08 < at('north', x, y) < .55 else 0) + at('hills', x, y) * .4, 2.4, 20000, 2.3):
    items.append((y, hill, (x, y, R.uniform(2.0, 3.4)), {}))
# แม่น้ำ: หมู่บ้าน ต้นหลิว สะพาน
for key in ('main', 'east'):
    pts = catmull(RIVERS[key][0], 6)
    for i, (rx, ry) in enumerate(pts):
        if i % 7 == 3 and 24 < ry < 74:
            side = 1 if (i // 7) % 2 else -1
            vx_, vy_ = rx + side * 2.6, ry
            if onland(vx_, vy_, 2.6) and at('desert', vx_, vy_) < .2 and at('north', vx_, vy_) < .3: items.append((vy_, village, (vx_, vy_), {}))
        if i % 3 == 1 and 22 < ry < 76:
            wx_, wy_ = rx + (1.3 if i % 2 else -1.3), ry
            if onland(wx_, wy_, 1.8): items.append((wy_, willow, (wx_, wy_), {}))
for key, ys in (('main', (30, 58)), ('east', (50,))):
    pts = catmull(RIVERS[key][0], 6)
    for yy in ys:
        bx, by = min(pts, key=lambda q: abs(q[1] - yy))
        if not near_pin(bx, by, 2.0): items.append((by, bridge, (bx, by), {}))
# ภูเขาน้ำแข็ง/ซากโบราณ/เกาะลอยฟ้า
for k in range(7):
    a = k * 0.9; items.append((10 + 3 * math.sin(a), icespike, (55 + 4.2 * math.cos(a) + R.uniform(-.6, .6), 10 + 3 * math.sin(a), R.uniform(1.2, 2.4)), {}))
items.append((16, ruins, (58, 17.6), {}))
for (dx, dy, sz) in [(-3.8, -1.5, .8), (3.8, -2, 1.0), (-2.2, 3.4, .7), (3.0, 3.6, .8), (0.6, -4.2, .65)]:
    items.append((17 + dy, floating, (70 + dx, 17 + dy, sz), {}))
# ทะเลทราย: ตะบองเพชร ปาล์มโอเอซิส คาราวาน
for (x, y) in scatter(lambda x, y: at('desert', x, y) * (1 - at('badland', x, y)) * .12, 4.0, 8000, 2.2): items.append((y, cactus, (x, y), {}))
for (ox, oy) in [(25, 70), (11, 61)]:
    for k in range(4): items.append((oy + k * .1, palm, (ox + R.uniform(-2.8, 2.8), oy + R.uniform(-1.6, 1.6)), {}))
for k in range(6):
    cx_, cy_ = 24 + k * 2.6, 61.5 + k * .5 + (k % 2) * .4
    if at('desert', cx_, cy_) > .15 and not near_pin(cx_, cy_, 1.4): items.append((cy_, camel, (cx_, cy_), {}))

# ---------- ประกอบ SVG
def mist(x, y, w, a=.55):
    add(f'<ellipse cx="{P(x)}" cy="{P(y)}" rx="{P(w)}" ry="{P(w * .22)}" fill="#fff" opacity="{a}" filter="url(#bl)"/>')

head = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{N}" height="{N}" viewBox="0 0 {N} {N}">',
        '<defs><filter id="bl" x="-30%" y="-100%" width="160%" height="300%"><feGaussianBlur stdDeviation="' + str(N / 150) + '"/></filter>'
        '<filter id="wob" x="-2%" y="-2%" width="104%" height="104%"><feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="' + str(N / 600) + '"/></filter></defs>',
        f'<image href="base.png" width="{N}" height="{N}"/>']
# น้ำ: คลื่น/บัว/กก/มังกรหลับ
add('<g fill="none" stroke="#e8fbff" stroke-linecap="round" opacity=".75">')
for (x, y) in waves:
    w_ = R.uniform(.9, 1.5); add(f'<path d="M{P(x - w_)},{P(y)} q{P(w_ / 2)},{P(-.5)} {P(w_)},0 q{P(w_ / 2)},{P(-.5)} {P(w_)},0" stroke-width="{sw(.8)}"/>')
add('</g>')
# มังกรหลับ (เงาใต้น้ำ)
dp = catmull([(66, 92), (71, 89), (76, 91), (81, 87), (84, 90), (88, 87)], 12)
add('<g opacity=".30" fill="none" stroke="#0f4a5a" stroke-linecap="round"><path d="M' + ' L'.join(f'{P(p[0])},{P(p[1])}' for p in dp) + f'" stroke-width="{P(1.2)}"/></g><circle cx="{P(66)}" cy="{P(92)}" r="{P(1.2)}" fill="#0f4a5a" opacity=".32"/>')
for (x, y) in lotus:
    if R.random() < .6: add(f'<ellipse cx="{P(x)}" cy="{P(y)}" rx="{P(.55)}" ry="{P(.25)}" fill="#6fae5a" stroke="{INK}" stroke-width="{sw(.3)}"/>' + (f'<circle cx="{P(x)}" cy="{P(y - .15)}" r="{P(.17)}" fill="#f4a3c0"/>' if R.random() < .35 else ''))
    else: add(f'<path d="M{P(x)},{P(y)} l{P(-.2)},{P(-.9)} M{P(x)},{P(y)} l{P(.05)},{P(-1)} M{P(x)},{P(y)} l{P(.25)},{P(-.8)}" stroke="#6b8a3d" stroke-width="{sw(.6)}"/>')
# เนินทราย
add(f'<g fill="none" stroke="{INK2}" stroke-linecap="round" opacity=".5">')
for (x, y) in dunes:
    w_ = R.uniform(1.4, 2.6); add(f'<path d="M{P(x - w_)},{P(y)} q{P(w_)},{P(-w_ * .5)} {P(w_ * 2)},0" stroke-width="{sw(.7)}"/>')
add('</g>')
mist(30, 33, 14, .5); mist(62, 33, 14, .5); mist(44, 63, 10, .4); mist(50, 22, 18, .35); mist(20, 80, 12, .4); mist(88, 22, 8, .45); mist(10, 12, 9, .4)
# ภูเขาไฟ
vx, vy = 17, 28
add(f'<ellipse cx="{P(vx + 1)}" cy="{P(vy + .6)}" rx="{P(5)}" ry="{P(1)}" fill="#2a1d1a" opacity=".3"/><path d="M{P(vx - 5.5)},{P(vy + .5)} L{P(vx - 1.3)},{P(vy - 5.6)} L{P(vx + 1.3)},{P(vy - 5.6)} L{P(vx + 5.5)},{P(vy + .5)} Z" fill="#7a6a64" stroke="{INK}" stroke-width="{sw(1.1)}" stroke-linejoin="round"/><path d="M{P(vx + 1.3)},{P(vy - 5.6)} L{P(vx + 5.5)},{P(vy + .5)} L{P(vx + 1)},{P(vy + .5)} Z" fill="#4a3f3d" opacity=".7"/><ellipse cx="{P(vx)}" cy="{P(vy - 5.6)}" rx="{P(1.5)}" ry="{P(.45)}" fill="#ff6a2a" stroke="#ffb36a" stroke-width="{sw(.6)}"/>')
for dx, w_ in [(-.6, .45), (.3, .4), (.9, .35)]: add(f'<path d="M{P(vx + dx)},{P(vy - 5.4)} q{P(.3)},{P(2.4)} {P(-.2)},{P(5.5)}" stroke="#ff7a2a" stroke-width="{sw(w_ * 2)}" fill="none" opacity=".85"/>')
for k, (dx, dy, r) in enumerate([(0.5, -7.2, .9), (1.6, -8.7, 1.3), (3.2, -10.2, 1.8)]): add(f'<circle cx="{P(vx + dx)}" cy="{P(vy + dy)}" r="{P(r)}" fill="#4c4543" opacity="{.5 - k * .1}" filter="url(#bl)"/>')
add('<g filter="url(#wob)">')
for (y, fn, a, k) in sorted(items, key=lambda t: t[0]): fn(*a, **k)
add('</g>')

# ลาวา + บ่อลาวาในเขตภูเขาไฟ
add('<g fill="none" stroke-linecap="round">')
for off in (-1.2, 0.2, 1.4):
    add(f'<path d="M{P(17 + off * .3)},{P(23)} q{P(off + 1)},{P(2.4)} {P(off * 2.2)},{P(4.6)} t{P(1.6)},{P(3.2)}" stroke="#ff5a1a" stroke-width="{sw(1.6)}" opacity=".85"/><path d="M{P(17 + off * .3)},{P(23)} q{P(off + 1)},{P(2.4)} {P(off * 2.2)},{P(4.6)} t{P(1.6)},{P(3.2)}" stroke="#ffd06a" stroke-width="{sw(.6)}"/>')
add('</g>')
for (x, y) in scatter(lambda x, y: at('volc', x, y) * .25, 5, 6000, 2.5):
    add(f'<ellipse cx="{P(x)}" cy="{P(y)}" rx="{P(1.1)}" ry="{P(.45)}" fill="#ff7a2a" opacity=".85" stroke="#2a1d1a" stroke-width="{sw(.4)}"/><ellipse cx="{P(x)}" cy="{P(y)}" rx="{P(2)}" ry="{P(.9)}" fill="#ff7a2a" opacity=".18"/>')
# น้ำตกหน้าผาที่ราบสูง
add(f'<path d="M{P(80.2)},{P(15.5)} l{P(-.2)},{P(5)}" stroke="#f6fdff" stroke-width="{sw(2.6)}" opacity=".9" stroke-linecap="round"/><ellipse cx="{P(80)}" cy="{P(20.8)}" rx="{P(1.6)}" ry="{P(.5)}" fill="#fff" opacity=".7" filter="url(#bl)"/>')
# เรือในทะเลสาบ
def junk(x, y, sc=1):
    add(f'<path d="M{P(x - 1.1 * sc)},{P(y)} q{P(1.1 * sc)},{P(.7 * sc)} {P(2.2 * sc)},0 l{P(-.3 * sc)},{P(-.3 * sc)} l{P(-1.6 * sc)},0 Z" fill="#6a3f24" stroke="{INK}" stroke-width="{sw(.4)}"/><path d="M{P(x)},{P(y - .3 * sc)} l0,{P(-2 * sc)}" stroke="{INK}" stroke-width="{sw(.5)}"/><path d="M{P(x + .1 * sc)},{P(y - 2.1 * sc)} l{P(1.0 * sc)},{P(.3 * sc)} l{P(-.1 * sc)},{P(1.4 * sc)} l{P(-.9 * sc)},0 Z" fill="#e8d6a6" stroke="{INK}" stroke-width="{sw(.4)}"/>')
for (bx, by, sc) in [(60, 90.5, 1.0), (72, 87, .9), (44, 87.5, .8), (78, 93, .8), (66, 84, .7), (52, 94, .7)]:
    if at('lake', bx, by) > .6 and at('land', bx, by) < .2: junk(bx, by, sc)
# ประภาคาร/ท่าเรือ ด่านลำน้ำทักษิณ
add(f'<rect x="{P(57.2)}" y="{P(70.6)}" width="{P(.9)}" height="{P(2.6)}" fill="#efe0bf" stroke="{INK2}" stroke-width="{sw(.4)}"/><path d="M{P(57)},{P(70.7)} l{P(.65)},{P(-.9)} l{P(.65)},{P(.9)} Z" fill="#b8503c" stroke="{INK2}" stroke-width="{sw(.4)}"/><circle cx="{P(57.65)}" cy="{P(70.9)}" r="{P(.2)}" fill="#ffd34a"/>')
# กระแสเมฆมงคล (ซางหยุน) ตามขอบ
def xiang(x, y, s=1.0):
    add(f'<g opacity=".78" stroke="#8a7a60" stroke-width="{sw(.7)}" fill="#fdf8ea">' + ''.join(f'<circle cx="{P(x + dx * s)}" cy="{P(y + dy * s)}" r="{P(r * s)}"/>' for dx, dy, r in [(-1.4, .2, .9), (0, -.2, 1.2), (1.5, .2, .9), (.3, .6, .8)]) + f'<path d="M{P(x - 2.3 * s)},{P(y + .8 * s)} q{P(-.7 * s)},{P(-.3 * s)} {P(-.3 * s)},{P(-.9 * s)}" fill="none"/></g>')
for (x, y, sc) in [(7, 6, 1.2), (94, 40, 1.0), (95, 72, 1.1), (6, 44, .9), (30, 95, 1.0), (92, 60, .8), (14, 96, .9), (96, 28, .8)]:
    if not near_pin(x, y, 3): xiang(x, y, sc)
# นกกระเรียน
for k in range(16):
    bx, by = R.uniform(8, 92), R.uniform(8, 92)
    if near_pin(bx, by, 2.5): continue
    sc_ = R.uniform(.6, 1.0)
    add(f'<path d="M{P(bx - .9 * sc_)},{P(by)} q{P(.45 * sc_)},{P(-.6 * sc_)} {P(.9 * sc_)},{P(.1)} q{P(.45 * sc_)},{P(-.7 * sc_)} {P(.9 * sc_)},{P(-.1)}" stroke="#2a2a2e" stroke-width="{sw(.7)}" fill="none" opacity=".7" stroke-linecap="round"/>')

mist(36, 24, 12, .45); mist(70, 26, 10, .4); mist(48, 70, 9, .35)
# กรอบ + เข็มทิศ
fr = N * .012
add(f'<rect x="{fr:.0f}" y="{fr:.0f}" width="{N - 2 * fr:.0f}" height="{N - 2 * fr:.0f}" fill="none" stroke="#5b3d24" stroke-width="{N / 300:.1f}"/><rect x="{fr * 1.7:.0f}" y="{fr * 1.7:.0f}" width="{N - 3.4 * fr:.0f}" height="{N - 3.4 * fr:.0f}" fill="none" stroke="#8a6a3f" stroke-width="{N / 700:.1f}"/>')
for (cx, cy) in [(fr * 1.7, fr * 1.7), (N - fr * 1.7, fr * 1.7), (fr * 1.7, N - fr * 1.7), (N - fr * 1.7, N - fr * 1.7)]:
    add(f'<circle cx="{cx:.0f}" cy="{cy:.0f}" r="{N / 90:.1f}" fill="#8a2f23" stroke="#5b3d24" stroke-width="{N / 600:.1f}"/>')

# ลายกุญแจจีนระหว่างกรอบ + ตราประทับ
add(f'<rect x="{fr * 1.35:.0f}" y="{fr * 1.35:.0f}" width="{N - 2.7 * fr:.0f}" height="{N - 2.7 * fr:.0f}" fill="none" stroke="#7a5630" stroke-width="{fr * .32:.1f}" stroke-dasharray="{fr * .32:.1f} {fr * .32:.1f}" opacity=".75"/>')
sx, sy_, ss = 7.5 * S, 91.5 * S, 4.2 * S
add(f'<g transform="rotate(-6 {sx} {sy_})" opacity=".9"><rect x="{sx - ss / 2}" y="{sy_ - ss / 2}" width="{ss}" height="{ss}" rx="{ss * .08}" fill="#a8322b"/><rect x="{sx - ss * .44}" y="{sy_ - ss * .44}" width="{ss * .88}" height="{ss * .88}" fill="none" stroke="#f6e3c0" stroke-width="{N / 700:.1f}"/><text x="{sx}" y="{sy_ - ss * .02}" font-size="{ss * .38}" text-anchor="middle" fill="#f6e3c0" font-family="Noto Sans CJK SC, serif" font-weight="900">江</text><text x="{sx}" y="{sy_ + ss * .34}" font-size="{ss * .38}" text-anchor="middle" fill="#f6e3c0" font-family="Noto Sans CJK SC, serif" font-weight="900">湖</text></g>')

cx, cy, cr = 91.5 * S, 90 * S, 3.4 * S
add(f'<g opacity=".92"><circle cx="{cx}" cy="{cy}" r="{cr}" fill="#efe0b8" stroke="#5b3d24" stroke-width="{N / 500:.1f}"/><path d="M{cx},{cy - cr * 1.15} L{cx + cr * .2},{cy} L{cx},{cy + cr * 1.15} L{cx - cr * .2},{cy} Z" fill="#a8322b" stroke="#5b3d24" stroke-width="{N / 800:.1f}"/><path d="M{cx - cr * 1.15},{cy} L{cx},{cy - cr * .2} L{cx + cr * 1.15},{cy} L{cx},{cy + cr * .2} Z" fill="#33424c"/>')
for ch, dx, dy in [('北', 0, -1.5), ('南', 0, 1.75), ('東', 1.55, .12), ('西', -1.55, .12)]:
    add(f'<text x="{cx + dx * cr}" y="{cy + dy * cr}" font-size="{cr * .5}" text-anchor="middle" fill="#3a2a1a" font-family="Noto Sans CJK SC, serif" font-weight="700">{ch}</text>')
add('</g></svg>')
open(os.path.join(out_dir, 'atlas.svg'), 'w', encoding='utf-8').write('\n'.join(head + out))
print('svg ok', len(out), 'elements')

# ---------- ตรวจว่าหมุดตกบนภูมิประเทศที่ข้อมูลเกมระบุ
bad = 0
for nd in NODES:
    if nd['approximate'] or nd['kind'] in ('ELEMENTAL_REALM', 'SECRET_REALM_SITE', 'DIMENSION_GATE'): continue
    x, y, t = nd['x'], nd['y'], nd['terrain']
    deepwater = at('lake', x, y) > .5 and at('land', x, y) < .3 and nd['kind'] not in ('EXPEDITION_REGION',)
    if deepwater: print('WARN pin in deep water:', nd['id'], x, y); bad += 1
    if t == 'desert' and at('desert', x, y) < .25 and at('volc', x, y) < .25: print('WARN desert mismatch', nd['id']); bad += 1
print('terrain check warnings:', bad)
