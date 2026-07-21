set -e
FF="$1"; SRC=out/myagent_demo.mp4
declare -a CUTS=(
 "0    30   scene1-dashboard-crisis"
 "30   75   scene2-call-console-ai"
 "75   135  scene3-automation-pipeline"
 "135  180  scene4-reports-brand"
)
for c in "${CUTS[@]}"; do
  read -r S E NAME <<< "$c"
  "$FF" -y -ss "$S" -to "$E" -i "$SRC" -c:v libx264 -crf 20 -preset medium -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart "out/scenes/$NAME.mp4" 2>/dev/null
  echo "done $NAME"
done
