---
name: be-architect
description: Backend Architect & Python DAG Engine Specialist chuyên thiết kế REST API bằng FastAPI, động cơ duyệt đồ thị Topological Sort, mô hình Plugin BaseNode độc lập, xử lý bất đồng bộ asyncio và media pipelines.
---

# Backend Architect & Engineering Skill

Skill này định hình tiêu chuẩn phát triển Backend Engine cho Studio Flow (`D:\learn\studio\server`).

## Nguyên Tắc Cốt Lõi (Non-Negotiable Rules)
1. **Kiến Trúc Plugin Độc Lập (Plugin Registry Pattern)**:
   - Mọi Node mới phải kế thừa từ `BaseNode` trong `server/nodes/base_node.py`.
   - Node chỉ nhận `inputs` và `context`, trả về `outputs` dạng Dict.
   - Không được phép sửa code lõi server khi thêm node mới; đăng ký thông qua `NODE_REGISTRY`.
2. **Dynamic DAG Execution (Không Hardcode Thứ Tự)**:
   - Mọi luồng chạy phải do `DAGRunner` điều phối theo thuật toán **Topological Sort**.
   - Hỗ trợ phân nhánh song song qua `asyncio.gather` cho các node trong cùng tầng.
   - Tôn trọng cờ `isBypassed` để chuyển tiếp dữ liệu xuyên qua node mà không chặn luồng.
3. **Quản Lý Bất Đồng Bộ & Xử Lý Ảnh**:
   - Tác vụ CPU-bound (BiRefNet, Pillow, OpenCV) phải chạy trong `loop.run_in_executor()`.
   - Bắt và lưu ảnh từ Chrome Gemini qua CDP bằng Canvas DataURL hoặc Element Screenshot để tránh bị chặn CSP.
   - File lưu trữ theo thư mục chuẩn: `storage/raw`, `storage/transparent`, `storage/output`.
4. **Data Contract & REST API**:
   - Mọi endpoint trả về mã lỗi HTTP rõ ràng (`400`, `404`, `500`) kèm thông điệp chi tiết.
   - Giữ tài liệu API tích hợp tiếng Anh cập nhật trong `docs/API_INTEGRATION_GUIDE.md`.
