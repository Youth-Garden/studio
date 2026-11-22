import time
import requests
from pathlib import Path
from playwright.sync_api import sync_playwright

def generate_image_via_gemini_cdp(
    prompt: str,
    output_image_path: Path,
    cdp_url: str = "http://localhost:9222",
    timeout: int = 120
) -> Path:
    """
    Kết nối vào Chrome đang mở sẵn cổng CDP 9222,
    tìm tab Gemini, điền prompt yêu cầu tạo ảnh, đợi Gemini sinh ảnh và tải về.
    """
    print(f"[Gemini Bridge] Đang kết nối tới Chrome qua CDP: {cdp_url}...")
    with sync_playwright() as p:
        try:
            browser = p.chromium.connect_over_cdp(cdp_url)
        except Exception as e:
            raise RuntimeError(
                f"Không thể kết nối tới Chrome cổng 9222! "
                f"Hãy đảm bảo bạn đã mở Chrome với cờ: --remote-debugging-port=9222. Chi tiết lỗi: {e}"
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

        # 2. Đếm số lượng ảnh đã có trước khi gửi prompt mới
        existing_imgs = page.locator("img[src*='googleusercontent']").all()
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
        # Điền prompt yêu cầu tạo ảnh
        editor.fill(prompt)
        time.sleep(0.5)

        # 4. Bấm nút gửi (Send) hoặc nhấn phím Enter
        send_btn = page.locator("button[aria-label*='Send'], button[aria-label*='Gửi'], button.send-button").first
        if send_btn.is_visible():
            send_btn.click()
        else:
            page.keyboard.press("Enter")

        print("[Gemini Bridge] Đã gửi prompt! Đang chờ Gemini sinh ảnh...")

        # 5. Chờ xuất hiện ảnh mới sinh ra
        start_time = time.time()
        new_img_url = None

        while time.time() - start_time < timeout:
            time.sleep(2)
            current_imgs = page.locator("img[src*='googleusercontent']").all()
            if len(current_imgs) > initial_img_count:
                # Lấy thẻ ảnh mới nhất
                last_img = current_imgs[-1]
                src = last_img.get_attribute("src")
                if src and src.startswith("http"):
                    new_img_url = src
                    print(f"[Gemini Bridge] Tìm thấy ảnh mới: {new_img_url[:80]}...")
                    break

        if not new_img_url:
            raise TimeoutError(f"Quá thời gian ({timeout}s) mà Gemini chưa tạo xong ảnh!")

        # 6. Tải ảnh từ URL về lưu vào output_image_path
        print(f"[Gemini Bridge] Đang tải ảnh về lưu tại: {output_image_path}...")
        resp = requests.get(new_img_url, timeout=30)
        if resp.status_code == 200:
            with open(output_image_path, "wb") as f:
                f.write(resp.content)
            print("[Gemini Bridge] Tải ảnh thành công!")
            return output_image_path
        else:
            raise RuntimeError(f"Tải ảnh từ Google thất bại, mã HTTP: {resp.status_code}")
