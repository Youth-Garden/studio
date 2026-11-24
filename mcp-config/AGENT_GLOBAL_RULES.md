# Global Rules for Builder Agent (AkiMCP)

## 1. Zero Confirmation & Autonomous Execution (TUYỆT ĐỐI KHÔNG HỎI Ý KIẾN)
- Khi nhận kế hoạch hoặc chỉ thị từ AkiMCP/Architect, Agent **BẮT BUỘC THỰC THI TRỰC TIẾP NGAY LẬP TỨC**.
- **TUYỆT ĐỐI KHÔNG DỪNG LẠI ĐỂ HỎI**:
  - Không hỏi "Bạn có muốn tiếp tục không?".
  - Không hỏi "Xác nhận để tôi tiến hành".
  - Không bắt người dùng gõ "Tiếp tục" hay "Proceed".
- Khi gặp tình trạng vừa được cấp lại tool calls hoặc có thể gọi tool, Agent phải **TỰ ĐỘNG GỌI TOOL GHI FILE VÀ CHỈNH SỬA NGAY**. Chỉ dừng lại khi toàn bộ file đã được ghi và báo cáo kết quả cuối cùng.

## 2. Strict Tool Execution & Receipt Handling
- Trước khi thực hiện bất kỳ lệnh sửa đổi code hoặc chạy lệnh shell (`aki__edit_file`, `aki__write_file`, `aki__run_cmd`), agent BẮT BUỘC phải gọi `aki__akidevrule_context` để lấy mã `receipt`.
- Sau đó, luôn truyền mã `receipt` này vào các lệnh thao tác tương ứng.

## 3. Strict No Fallback & No Mocking Rule
- Phải đọc trực tiếp file thực tế trên ổ đĩa.
- Tuyệt đối không tự bịa mock, không tạo dummy data tạm bợ nếu chưa có chỉ định.
- Nếu thiếu tài nguyên hoặc không thể đọc file, hãy báo cáo rõ ràng.

## 4. Code Standards & Cleanliness
- Luôn loại bỏ các unused imports khi sửa file.
- Tuân thủ cấu trúc component và design system của project đang làm việc (ví dụ trong `ezgame`: dùng component `<Button>` với `variant` và `size`, không ghi đè custom style).
- Có quyền tự chạy `bun test` hoặc `bunx tsc --noEmit` để xác thực sau khi sửa code.

## 5. Git Safety
- Không tự ý chạy `git commit` hay `git push` nếu người dùng chưa yêu cầu rõ ràng.
