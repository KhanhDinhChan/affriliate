#!/bin/bash
# Báo tiến độ xuất 3D của một video: số khung đã có / tổng, thời gian mỗi khung, ước tính còn lại.
#   bash .claude/skills/video-3d-vat-ly/scripts/tien-do.sh <thu-muc-video>
DIR=${1:-.}; total_left=0
for log in "$DIR"/frames-*.log; do
  [ -f "$log" ] || continue
  shot=$(basename "$log" .log); shot=${shot#frames-}
  last=$(grep -a " khung " "$log" | tail -1)
  [ -z "$last" ] && { echo "$shot: chưa bắt đầu"; continue; }
  n=$(echo "$last" | sed -E 's/.*khung [0-9]+\/([0-9]+).*/\1/'); n=$((n + 1))
  have=$(ls "$DIR/frames/$shot" 2>/dev/null | grep -c '\.jpg$')
  avg=$(grep -a " khung " "$log" | tail -10 | sed -E 's/.* ([0-9.]+)s$/\1/' | awk '{s+=$1} END {printf "%.1f", s/NR}')
  left=$(awk -v a="$avg" -v k=$((n - have)) 'BEGIN {printf "%d", a*k}'); total_left=$((total_left + left))
  printf '%-4s %4d/%-4d khung  %5ss/khung  còn ~%d phút\n' "$shot" "$have" "$n" "$avg" $((left / 60))
done
[ -f "$DIR/frames-done.flag" ] && echo "Đã xong: $(cat "$DIR/frames-done.flag")" || echo "Các cảnh đang chạy còn khoảng $((total_left / 60)) phút (chưa tính cảnh chưa bắt đầu)."
pgrep -af "canh.py --shot" | sed 's/^/đang chạy: /' | head -3
