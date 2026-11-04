#!/data/data/com.termux/files/usr/bin/bash
# ==============================================================================
# JianghuSect Auto-Push Watcher for Termux
# รันสคริปต์นี้ทิ้งไว้ใน Termux (เช่น แท็บที่ 2)
# ทุกครั้งที่ AI บันทึกไฟล์ สคริปต์นี้จะตรวจจับและ git push ขึ้น GitHub ให้เอง 100%
# ==============================================================================

cd /data/data/com.termux/files/home/jhevo-work || exit 1
echo "🚀 [Auto-Push Watcher] กำลังทำงาน..."
echo "💡 ทุกครั้งที่ AI แก้ไขหรือบันทึกไฟล์ สคริปต์นี้จะ commit & push ขึ้น GitHub ให้อัตโนมัติทุก 4 วินาที"
echo "กด Ctrl+C เพื่อหยุดทำงาน"

while true; do
  # ตรวจว่ามีไฟล์ถูกแก้ไขหรือเพิ่มใหม่หรือไม่
  if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
    echo ""
    echo "⚡ [$(date '+%H:%M:%S')] ตรวจพบไฟล์อัปเดตใหม่จาก AI!"
    git add .
    git commit -m "feat(auto): patch update $(date '+%Y-%m-%d %H:%M:%S')"
    git push origin main
    if [ $? -eq 0 ]; then
      echo "✅ [$(date '+%H:%M:%S')] Push ขึ้น GitHub สาขา main สำเร็จเรียบร้อย!"
    else
      echo "⚠️ Push ไม่สำเร็จ (ตรวจสอบการเชื่อมต่ออินเทอร์เน็ตหรือ GitHub Token)"
    fi
  fi
  sleep 4
done
