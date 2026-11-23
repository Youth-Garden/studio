import time
import requests
import base64
from pathlib import Path
from playwright.sync_api import sync_playwright

def generate_image_via_gemini_cdp(
    prompt: str,
    output_image_path: Path,
    cdp_url: str = "http://localhost:9222",
    timeout: int = 300
) -> Path:
    """
    Kết nối vào Chrome cổng 9222, tìm tab Gemini, nhập prompt,
    bắt lấy ảnh kết quả (hỗ trợ cả HTTP URL, data URL và blob: URL trong browser context)
    và lưu về ổ cứng.
    """
    print(f"[Gemini Bridge] Đang kết nối tới Chrome qua CDP: {cdp_url}...")
    with sync_playwright() as p:
        try:
            browser = p.chromium.connect_over_cdp(cdp_url)
        except Exception as e:
            raise RuntimeError(
                f"Không thể kết nối tới Chrome cổng 9222! "
                f"Hãy đảm bảo bạn đã mở Chrome bằng file: start_chrome_debug.bat. Chi tiết: {e}"
            )

        contexts = browser.contexts
        if not contexts:
            raise RuntimeError("Không tìm thấy context nào trong Chrome!")

        context = contexts[0]
        page = None

        # 1. Tìm tab Gemini đang mở
        for p_tab in context.pages:
            if "gemini.google.com" in p_tab.url:
                page = p_tab
                break

        if not page:
            print("[Gemini Bridge] Chưa có tab Gemini, đang mở tab mới...")
            page = context.new_page()
            page.goto("https://gemini.google.com/app", wait_until="domcontentloaded")
            time.sleep(3)
        else:
            print(f"[Gemini Bridge] Đã tìm thấy tab Gemini: {page.url}")
            page.bring_to_front()

        # 2. Đếm số lượng ảnh đã có
        img_selector = "img[src*='googleusercontent'], img[src*='blob:'], image-viewer img, .generated-image img"
        existing_imgs = page.locator(img_selector).all()
        initial_img_count = len(existing_imgs)
        print(f"[Gemini Bridge] Số lượng ảnh hiện có trong đoạn chat: {initial_img_count}")

        # 3. Tìm ô nhập prompt của Gemini
        input_selectors = [
            "div.ql-editor[contenteditable='true']",
            "rich-textarea p",
            "rich-textarea",
            "textarea",
            "div[contenteditable='true']"
        ]

        editor = None
        for sel in input_selectors:
            loc = page.locator(sel).first
            if loc.is_visible():
                editor = loc
                break

        if not editor:
            raise RuntimeError("Không tìm thấy ô nhập tin nhắn của Gemini trên màn hình!")

        print(f"[Gemini Bridge] Đang nhập prompt: {prompt}")
        editor.click()
        time.sleep(0.5)
        editor.fill(prompt)
        time.sleep(0.5)

        # 4. Bấm nút gửi
        send_btn = page.locator("button[aria-label*='Send'], button[aria-label*='Gửi'], button.send-button").first
        if send_btn.is_visible():
            send_btn.click()
        else:
            page.keyboard.press("Enter")

        print("[Gemini Bridge] Đã gửi prompt! Đang chờ Gemini sinh ảnh...")

        # 5. Chờ xuất hiện ảnh mới sinh ra
        start_time = time.time()
        new_img_url = None
        target_img_element = None

        while time.time() - start_time < timeout:
            time.sleep(2)
            current_imgs = page.locator(img_selector).all()
            if len(current_imgs) > initial_img_count:
                last_img = current_imgs[-1]
                src = last_img.get_attribute("src")
                if src:
                    new_img_url = src
                    target_img_element = last_img
                    print(f"[Gemini Bridge] Tìm thấy ảnh mới: {new_img_url[:80]}...")
                    break
            
            # Check thêm trong response mới
            responses = page.locator("message-content").all()
            if responses:
                latest_resp = responses[-1]
                resp_imgs = latest_resp.locator("img").all()
                if resp_imgs:
                    target_img_element = resp_imgs[-1]
                    new_img_url = target_img_element.get_attribute("src")
                    if new_img_url:
                        print(f"[Gemini Bridge] Tìm thấy ảnh trong response mới: {new_img_url[:80]}...")
                        break

        if not new_img_url:
            raise TimeoutError(f"Quá thời gian ({timeout}s) mà Gemini chưa tạo xong ảnh!")

        # 6. Tải và lưu ảnh (xử lý triệt để: blob:, data:image, hoặc http URL)
        print(f"[Gemini Bridge] Đang xử lý tải ảnh dạng: {new_img_url[:30]}...")

        # TRƯỜNG HỢP 1: blob:https://gemini.google.com/... -> Đọc qua canvas hoặc fallback screenshot element
        if new_img_url.startswith("blob:"):
            print("[Gemini Bridge] Đang chuyển đổi ảnh blob sang binary...")
            try:
                # Cách 1: Vẽ trực tiếp element HTMLImageElement lên Canvas để lấy base64 toDataURL (vượt qua mọi hạn chế fetch CSP của Chrome)
                b64_data = target_img_element.evaluate("""(img) => {
                    try {
                        const canvas = document.createElement('canvas');
                        canvas.width = img.naturalWidth || img.width || 1024;
                        canvas.height = img.naturalHeight || img.height || 1024;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0);
                        return canvas.toDataURL('image/png');
                    } catch (e) {
                        return null;
                    }
                }""")
                if b64_data and "," in b64_data:
                    _, encoded = b64_data.split(",", 1)
                    img_bytes = base64.b64decode(encoded)
                    with open(output_image_path, "wb") as f:
                        f.write(img_bytes)
                    print(f"[Gemini Bridge] Lưu thành công ảnh qua Canvas toDataURL ({len(img_bytes)} bytes)!")
                    return output_image_path
            except Exception as e:
                print(f"[Gemini Bridge] Canvas toDataURL gặp lỗi: {e}")

            # Cách 2: Chụp screenshot trực tiếp element ảnh trong browser (chuẩn 100% pixel của ảnh trên màn hình)
            print("[Gemini Bridge] Chụp screenshot trực tiếp element ảnh (độ phân giải gốc)...")
            target_img_element.scroll_into_view_if_needed()
            time.sleep(0.5)
            target_img_element.screenshot(path=str(output_image_path))
            print(f"[Gemini Bridge] Đã chụp screenshot lưu vào: {output_image_path}")
            return output_image_path

        # TRƯỜNG HỢP 2: data:image/png;base64,...
        elif new_img_url.startswith("data:image"):
            _, encoded = new_img_url.split(",", 1)
            img_bytes = base64.b64decode(encoded)
            with open(output_image_path, "wb") as f:
                f.write(img_bytes)
            print("[Gemini Bridge] Lưu thành công ảnh base64!")
            return output_image_path

        # TRƯỜNG HỢP 3: http URL thông thường
        elif new_img_url.startswith("http"):
            resp = requests.get(new_img_url, timeout=30)
            if resp.status_code == 200:
                with open(output_image_path, "wb") as f:
                    f.write(resp.content)
                print("[Gemini Bridge] Tải thành công ảnh từ URL HTTP!")
                return output_image_path
            else:
                raise RuntimeError(f"Tải ảnh từ Google thất bại, mã HTTP: {resp.status_code}")

        else:
            raise RuntimeError(f"Định dạng URL ảnh không hỗ trợ: {new_img_url[:30]}")
