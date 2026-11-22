import os
from pathlib import Path
from PIL import Image, ImageEnhance, ImageFilter
from rembg import remove, new_session
from config import DEFAULT_REMBG_MODEL

_session_cache = {}

def get_session(model_name: str = DEFAULT_REMBG_MODEL):
    if model_name not in _session_cache:
        print(f"[BiRefNet] Khởi tạo session rembg với model: {model_name}...")
        _session_cache[model_name] = new_session(model_name)
    return _session_cache[model_name]

def remove_background(input_path: Path, output_path: Path, model_name: str = DEFAULT_REMBG_MODEL) -> Path:
    """Tách nền bằng BiRefNet (hoặc model được chọn), lưu PNG RGBA."""
    session = get_session(model_name)
    with Image.open(input_path) as img:
        img_rgb = img.convert("RGB")
        output = remove(img_rgb, session=session)
        output.save(output_path, format="PNG")
    return output_path

def apply_banner_filters(
    img: Image.Image,
    brightness: float = 1.0,
    contrast: float = 1.0,
    saturation: float = 1.0,
    sharpness: float = 1.0
) -> Image.Image:
    """Áp dụng bộ lọc màu & độ nét."""
    res = img
    if brightness != 1.0:
        res = ImageEnhance.Brightness(res).enhance(brightness)
    if contrast != 1.0:
        res = ImageEnhance.Contrast(res).enhance(contrast)
    if saturation != 1.0:
        res = ImageEnhance.Color(res).enhance(saturation)
    if sharpness != 1.0:
        res = ImageEnhance.Sharpness(res).enhance(sharpness)
    return res

def compose_banner(
    subject_img_path: Path,
    output_path: Path,
    target_width: int = 1280,
    target_height: int = 720,
    bg_color: str = "#1e1e2e",
    filter_settings: dict = None
) -> Path:
    """Tạo banner thành phẩm với kích thước chuẩn và background."""
    if filter_settings is None:
        filter_settings = {}

    with Image.open(subject_img_path) as subject:
        subject = subject.convert("RGBA")
        
        # Áp dụng filter lên chủ thể nếu có
        brightness = filter_settings.get("brightness", 1.0)
        contrast = filter_settings.get("contrast", 1.0)
        saturation = filter_settings.get("saturation", 1.0)
        sharpness = filter_settings.get("sharpness", 1.0)
        
        r, g, b, a = subject.split()
        rgb_subject = Image.merge("RGB", (r, g, b))
        filtered_rgb = apply_banner_filters(rgb_subject, brightness, contrast, saturation, sharpness)
        r_f, g_f, b_f = filtered_rgb.split()
        subject = Image.merge("RGBA", (r_f, g_f, b_f, a))

        # Nếu chọn bg_color là 'transparent' thì giữ alpha canvas
        if bg_color.lower() == "transparent":
            canvas = Image.new("RGBA", (target_width, target_height), (0, 0, 0, 0))
        else:
            # Hex color sang RGB
            bg_clean = bg_color.lstrip("#")
            if len(bg_clean) == 6:
                bg_tuple = tuple(int(bg_clean[i:i+2], 16) for i in (0, 2, 4))
            else:
                bg_tuple = (30, 30, 46)
            canvas = Image.new("RGBA", (target_width, target_height), (*bg_tuple, 255))

        # Fit chủ thể vào trong canvas mà vẫn giữ nguyên tỉ lệ (scale to fit 85% chiều cao/rộng)
        max_sub_w = int(target_width * 0.85)
        max_sub_h = int(target_height * 0.85)
        
        orig_w, orig_h = subject.size
        ratio = min(max_sub_w / orig_w, max_sub_h / orig_h)
        new_w = int(orig_w * ratio)
        new_h = int(orig_h * ratio)
        
        resized_subject = subject.resize((new_w, new_h), Image.Resampling.LANCZOS)

        # Căn giữa chủ thể
        offset_x = (target_width - new_w) // 2
        offset_y = (target_height - new_h) // 2

        canvas.paste(resized_subject, (offset_x, offset_y), resized_subject)

        # Lưu file PNG
        canvas.save(output_path, format="PNG")
        
    return output_path
