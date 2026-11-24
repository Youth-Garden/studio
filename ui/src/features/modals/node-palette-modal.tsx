import { 
  Zap, 
  Bot, 
  Layers, 
  LayoutTemplate, 
  Image as ImageIcon,
  Split,
  Stamp,
  Send,
  X
} from 'lucide-react';
import { Button } from '../../shared/components/Button';
import { Card } from '../../shared/components/Card';
import type { PortalProps } from '../../shared/types/portal.types';

export interface NodePaletteData {
  onAddNode: (type: string, title: string, defaultData?: any) => void;
}

export function NodePalette({
  onDismiss,
  data,
}: PortalProps<NodePaletteData>) {
  const nodeCategories = [
    {
      category: "Kích hoạt & Dữ liệu đầu vào",
      items: [
        {
          type: "triggerNode",
          title: "Trigger / Prompt Input",
          desc: "Nhận prompt tạo ảnh qua Webhook hoặc nhập tay",
          icon: Zap,
          data: { title: "1. Trigger / Input", prompt: "A fantasy glowing item" }
        }
      ]
    },
    {
      category: "Công cụ AI",
      items: [
        {
          type: "geminiNode",
          title: "Gemini Web CDP",
          desc: "Tự động gõ prompt & bắt ảnh kết quả từ tab Gemini Chrome",
          icon: Bot,
          data: { title: "2. Gemini Web CDP", port: 9222 }
        }
      ]
    },
    {
      category: "Xử lý ảnh & Tách nền",
      items: [
        {
          type: "birefnetNode",
          title: "BiRefNet AI Tách Nền",
          desc: "Tách nền siêu nét SOTA (Deep Edge Matting)",
          icon: Layers,
          data: { title: "3. BiRefNet Tách Nền", modelName: "birefnet-general" }
        },
        {
          type: "bannerNode",
          title: "Banner Framing & Filter",
          desc: "Đóng khung ảnh 1280x720, cân chỉnh màu sắc & tương phản",
          icon: LayoutTemplate,
          data: { title: "4. Banner Framing", preset: "youtube_thumbnail", width: 1280, height: 720, bgColor: "#1e1e2e" }
        },
        {
          type: "multiAspectNode",
          title: "Multi-Aspect Splitter",
          desc: "Phân nhánh xuất đồng thời 3 kích thước: 16:9, 1:1, 9:16",
          icon: Split,
          data: { title: "Multi-Aspect Splitter", bgColor: "#1e1e2e" }
        },
        {
          type: "watermarkNode",
          title: "Watermark & Typography",
          desc: "Chèn logo bản quyền hoặc text nghệ thuật lên góc ảnh",
          icon: Stamp,
          data: { title: "Watermark Overlay", text: "© Studio Flow AI", position: "bottom-right", opacity: 180 }
        }
      ]
    },
    {
      category: "Lưu trữ & Thông báo",
      items: [
        {
          type: "telegramNode",
          title: "Telegram Bot Notify",
          desc: "Bắn ảnh kết quả trực tiếp về nhóm chat Telegram",
          icon: Send,
          data: { title: "Telegram Notify", botToken: "", chatId: "" }
        },
        {
          type: "outputNode",
          title: "Banner Output",
          desc: "Lưu trữ tự động và trả kết quả cho Agent / Webhook",
          icon: ImageIcon,
          data: { title: "5. Banner Output" }
        }
      ]
    }
  ];

  return (
    <div className="relative w-full max-w-4xl bg-[var(--bg-surface)] border-0 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5 text-[var(--text-primary)]">
      <div className="flex items-start justify-between pb-3 pr-8 border-b border-[var(--border-color)]">
        <div>
          <h3 className="font-semibold text-base text-[var(--text-primary)]">Thư Viện Node</h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">Chọn loại Node muốn thêm vào sơ đồ</p>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onDismiss} 
          className="absolute top-4 right-4 h-7 w-7 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10 rounded-lg"
          title="Đóng (Esc)"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="max-h-[520px] overflow-y-auto space-y-6 pr-1.5 custom-scrollbar">
        {nodeCategories.map((cat, idx) => (
          <div key={idx} className="space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              {cat.category}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {cat.items.map((item, itemIdx) => {
                const Icon = item.icon;
                return (
                  <Card
                    key={itemIdx}
                    role="button"
                    tabIndex={0}
                    variant="solid"
                    onClick={() => {
                      data?.onAddNode(item.type, item.title, item.data);
                      onDismiss?.();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        data?.onAddNode(item.type, item.title, item.data);
                        onDismiss?.();
                      }
                    }}
                    className="p-3.5 bg-[var(--bg-card)] hover:bg-[var(--bg-body)] border-0 transition-colors cursor-pointer flex items-start gap-3 select-none rounded-xl"
                  >
                    <div className="p-2 bg-[var(--bg-surface)] rounded-lg text-[var(--text-secondary)] shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[var(--text-primary)] truncate">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed line-clamp-2 mt-1">
                        {item.desc}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
