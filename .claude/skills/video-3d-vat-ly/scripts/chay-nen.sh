#!/bin/bash
# Xuất các cảnh 3D, TÁCH KHỎI PHIÊN (lệnh nền thường bị dừng sau 2 giờ; xuất 3D hay lâu hơn thế).
#   bash .claude/skills/video-3d-vat-ly/scripts/chay-nen.sh <thu-muc-video> "S1 S2 S3" [samples=12]
# Python có bpy lấy từ biến BPY_PYTHON (mặc định python3).
# Ghi: <thu-muc-video>/frames-<cảnh>.log (mỗi khung một dòng), xong hết thì tạo frames-done.flag.
# Chạy lại an toàn: canh.py bỏ qua khung đã có. Muốn xuất lại một cảnh thì xoá frames/<cảnh> trước.
# Theo dõi: bash .claude/skills/video-3d-vat-ly/scripts/tien-do.sh <thu-muc-video>
if [ -z "$CHAY_NEN_CON" ]; then
  [ -f "$1/blender/canh.py" ] || { echo "Không thấy $1/blender/canh.py"; exit 1; }
  CHAY_NEN_CON=1 setsid nohup bash "$0" "$@" > /dev/null 2>&1 < /dev/null & disown
  echo "Đã chạy nền các cảnh: $2. Xem tiến độ: bash $(dirname "$0")/tien-do.sh $1"; exit 0
fi
DIR=$(cd "$1" && pwd); SAMPLES=${3:-12}; PY=${BPY_PYTHON:-python3}
rm -f "$DIR/frames-done.flag"; cd "$DIR/blender" || exit 1
for s in $2; do "$PY" canh.py --shot "$s" --samples "$SAMPLES" --out "../frames/$s" >> "../frames-$s.log" 2>&1; done
date '+XONG %F %T' > "$DIR/frames-done.flag"
