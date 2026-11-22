from pathlib import Path
from PIL import Image
from rembg import remove, new_session

img_path = r"C:\Users\Tran Hoang Quan\.gemini\antigravity-cli\brain\8b102c42-734f-4f9f-8e49-7efd9592a451\.user_uploaded\uploaded_media_3_1795281369359.jpg"
out_path = r"D:\learn\studio\storage\transparent\test_birefnet.png"

print("Đang tải model BiRefNet (lần đầu sẽ tải weights về cache)...")
session = new_session("birefnet-general")
print("BiRefNet đã sẵn sàng! Đang thực hiện tách nền...")

with Image.open(img_path) as img:
    res = remove(img.convert("RGB"), session=session)
    res.save(out_path, format="PNG")

print("Hoàn thành! Đã lưu ảnh tách nền tại:", out_path)
