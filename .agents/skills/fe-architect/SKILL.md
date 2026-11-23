---
name: fe-architect
description: Frontend Architect & React Flow Specialist chuyên xây dựng UI/UX cho Studio Flow bằng React 19, TypeScript, Tailwind v4, @xyflow/react, tuân thủ nghiêm ngặt Meta Neutral Design System, Portal Stack và không hardcode.
---

# Frontend Architect & Engineering Skill

Skill này định hình tiêu chuẩn phát triển giao diện cho dự án Studio Flow (`D:\learn\studio\ui`).

## Nguyên Tắc Cốt Lõi (Non-Negotiable Rules)
1. **Tuyệt Đối Không Hardcode UI & Không Tự Ý Override Style**:
   - Sử dụng 100% các Shared Component có sẵn: `<Button variant="..." size="...">`, `<Card>`, `<Input>`, `<Textarea>`, `<Badge>`, `<StatusBadge>`, `<Accordion>`, `<Sheet>`, `<Tooltip>`, `<Toaster>`.
   - **Tuyệt đối KHÔNG tự ý ghi đè class** (`border`, `rounded`, `bg`, `shadow`) thủ công lên component `<Button>`.
   - Mọi màu sắc tuân thủ triệt để **Meta Neutral Design System** (`#1b1b1b`, `#262626`, `#333333`, `#525252`, `#ffffff`, `#9e9e9e`).
2. **Kiến Trúc Portal & Dialog Chuẩn EzGame (`usePortal`)**:
   - Mọi Modal, Popup, Dialog bắt buộc phải mở qua hook `usePortal` và render tập trung tại `<PortalRenderer />`.
   - Tuyệt đối KHÔNG tự ý tạo thẻ `fixed inset-0` hay tạo backdrop riêng lẻ gây giật màn hình và trùng lặp backdrop.
   - Không dùng `backdrop-blur`, chỉ dùng nền phẳng `bg-black/50`.
   - Mọi Dialog phải có animation scale-in 300ms mượt mà.
3. **Tương Tác Canvas & React Flow**:
   - Giữ code CustomNodes sạch, tách component logic và Action Toolbar riêng.
   - Hỗ trợ phím tắt và tọa độ chuột chính xác (`screenToFlowPosition`).
4. **Code Quality**:
   - Loại bỏ toàn bộ `unused imports` và sắp xếp import gọn gàng.
   - Tuyệt đối KHÔNG tự ý mở trình duyệt để test giao diện.
